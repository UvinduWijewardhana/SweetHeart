-- SweetHeart backend, step 2: links expire and the saved data is deleted by itself.
-- How to use: Supabase > SQL Editor > New query > paste this whole file > Run.
-- (Written without being run on a real database. If Supabase shows an error, send me the exact message.)
--
-- THE RULES (you can change the numbers below and run this file again):
--   * a Date Invite link works for 24 hours
--   * an Employee Appreciation link works until the day after the booked date (never more than 90 days)
--   * every time someone creates an invitation, everything that has expired is deleted, so the
--     database never fills up with old pictures
--   * safety stop: if more than 3000 invitations are saved at once, new ones are refused for a while

alter table public.invitations add column if not exists expires_at timestamptz;
update public.invitations set expires_at = created_at + interval '24 hours' where expires_at is null;
alter table public.invitations alter column expires_at set default (now() + interval '24 hours');
alter table public.invitations alter column expires_at set not null;
create index if not exists invitations_expires on public.invitations (expires_at);

create or replace function public.create_invitation(p_kind text, p_data jsonb, p_images jsonb default '{}'::jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_free_places constant int := 3;       -- free invitations include 3 places
  v_date_hours  constant int := 24;      -- how long a Date Invite link works (hours)
  v_max_days    constant int := 90;      -- an appreciation link never lives longer than this (days)
  v_max_rows    constant int := 3000;    -- safety stop for the free database
  v_key text; v_val text; v_total int := 0; v_places int := 0;
  v_ip text; v_hash text; v_code text; v_exp timestamptz; v_day date;
begin
  if p_kind is null or p_kind not in ('date', 'appreciation') then raise exception 'bad_data'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or length(p_data::text) > 6000 then raise exception 'bad_data'; end if;
  if p_images is null then p_images := '{}'::jsonb; end if;
  if jsonb_typeof(p_images) <> 'object' then raise exception 'bad_data'; end if;

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

  -- clean up: delete everything that has expired
  delete from public.invitations where expires_at < now();
  if (select count(*) from public.invitations) >= v_max_rows then raise exception 'busy'; end if;

  -- a simple limit: 30 invitations per hour from one connection
  v_ip := coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', 'unknown');
  v_hash := md5(v_ip);
  if (select count(*) from public.invitations where ip_hash = v_hash and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'too_many';
  end if;

  -- when does this link expire?
  v_exp := now() + make_interval(hours => v_date_hours);
  if p_kind = 'appreciation' then
    if coalesce(p_data ->> 'dt', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      begin
        v_day := (p_data ->> 'dt')::date;
        v_exp := greatest(v_exp, (v_day + 2)::timestamptz);       -- until the end of the day after the booked day
      exception when others then
        null;
      end;
    end if;
    v_exp := least(v_exp, now() + make_interval(days => v_max_days));
  end if;

  loop
    v_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
    exit when not exists (select 1 from public.invitations where code = v_code);
  end loop;

  insert into public.invitations (code, kind, data, images, places, ip_hash, expires_at)
  values (v_code, p_kind, p_data, p_images, v_places, v_hash, v_exp);
  return v_code;
end;
$$;

create or replace function public.get_invitation(p_code text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object('kind', kind, 'data', data, 'images', images, 'expires_at', expires_at)
  from public.invitations
  where p_code ~ '^[a-fA-F0-9]{10}$' and code = lower(p_code) and expires_at > now()
$$;

revoke all on function public.create_invitation(text, jsonb, jsonb) from public;
revoke all on function public.get_invitation(text) from public;
grant execute on function public.create_invitation(text, jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_invitation(text) to anon, authenticated;
