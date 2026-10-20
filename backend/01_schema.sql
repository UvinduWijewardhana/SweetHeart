-- SweetHeart backend, step 1: save invitations and give them short links.
-- How to use: Supabase > SQL Editor > New query > paste this whole file > Run.
-- (This file was written without being run on a real database, so if Supabase shows an error, send me the exact message.)

create table if not exists public.invitations (
  code        text primary key,                       -- the short code in the link, e.g. a1b2c3d4e5
  kind        text not null check (kind in ('date', 'appreciation')),
  data        jsonb not null,                         -- names, places, gift, date and time ...
  images      jsonb not null default '{}'::jsonb,     -- small square JPEG pictures, keys "0" to "4"
  places      int  not null default 0,
  paid        boolean not null default false,         -- used later for the 4-5 places upgrade
  ip_hash     text,                                   -- a scrambled marker, used only to limit spam
  created_at  timestamptz not null default now()
);

alter table public.invitations enable row level security;
-- No policies on purpose: with the public key nobody can read or write this table directly.
revoke all on table public.invitations from anon, authenticated;
create index if not exists invitations_ip_time on public.invitations (ip_hash, created_at);

-- Saves one invitation and returns its short code. All the rules are checked here, on the server.
create or replace function public.create_invitation(p_kind text, p_data jsonb, p_images jsonb default '{}'::jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_free_places constant int := 3;      -- free invitations include 3 places
  v_key text; v_val text; v_total int := 0; v_places int := 0;
  v_ip text; v_hash text; v_code text;
begin
  if p_kind is null or p_kind not in ('date', 'appreciation') then raise exception 'bad_data'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or length(p_data::text) > 6000 then raise exception 'bad_data'; end if;
  if p_images is null then p_images := '{}'::jsonb; end if;
  if jsonb_typeof(p_images) <> 'object' then raise exception 'bad_data'; end if;

  -- pictures: only small JPEG thumbnails, numbered 0 to 4
  for v_key, v_val in select key, value #>> '{}' from jsonb_each(p_images) loop
    if v_key !~ '^[0-4]$' or v_val is null or v_val !~ '^data:image/jpeg;base64,[A-Za-z0-9+/=]+$' or length(v_val) > 30000 then
      raise exception 'bad_data';
    end if;
    v_total := v_total + length(v_val);
  end loop;
  if v_total > 100000 then raise exception 'bad_data'; end if;

  if p_kind = 'date' then
    if coalesce(jsonb_typeof(p_data -> 'p'), '') <> 'array' then raise exception 'bad_data'; end if;
    v_places := jsonb_array_length(p_data -> 'p');
    if v_places < 3 then raise exception 'bad_data'; end if;
    if v_places > v_free_places then raise exception 'upgrade_required'; end if;
    if length(coalesce(p_data ->> 'n', '')) not between 1 and 40 then raise exception 'bad_data'; end if;
  else
    if length(coalesce(p_data ->> 'c', '')) not between 1 and 50 then raise exception 'bad_data'; end if;
    if length(coalesce(p_data ->> 'e', '')) not between 1 and 40 then raise exception 'bad_data'; end if;
  end if;

  -- a simple limit: 30 invitations per hour from one connection
  v_ip := coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', 'unknown');
  v_hash := md5(v_ip);
  if (select count(*) from public.invitations where ip_hash = v_hash and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'too_many';
  end if;

  loop
    v_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
    exit when not exists (select 1 from public.invitations where code = v_code);
  end loop;

  insert into public.invitations (code, kind, data, images, places, ip_hash)
  values (v_code, p_kind, p_data, p_images, v_places, v_hash);
  return v_code;
end;
$$;

-- Reads one invitation by its short code (only that one, nothing else can be listed).
create or replace function public.get_invitation(p_code text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object('kind', kind, 'data', data, 'images', images)
  from public.invitations
  where p_code ~ '^[a-fA-F0-9]{10}$' and code = lower(p_code)
$$;

revoke all on function public.create_invitation(text, jsonb, jsonb) from public;
revoke all on function public.get_invitation(text) from public;
grant execute on function public.create_invitation(text, jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_invitation(text) to anon, authenticated;
