-- SweetHeart backend, step 4 (Phase 3, first safety part): report abusive invitations + longer, safer codes.
-- How to use: Supabase > SQL Editor > New query > paste this whole file > Run. (Run 01 and 02 first. 03 is optional.)
-- (Written without being run on a real database. If Supabase shows an error, send me the exact message.)
--
-- What it does:
--   * anyone who opens an invitation can REPORT it (harassment, unwanted attention, scam ...)
--   * when 3 different connections report the same invitation, it is hidden at once until an admin looks at it
--   * new invitation codes are 16 characters long (64 bits) instead of 10, so they cannot be guessed
--   * reports are deleted after 90 days

alter table public.invitations add column if not exists hidden boolean not null default false;

create table if not exists public.invitation_reports (
  id              bigint generated always as identity primary key,
  invitation_code text not null,                  -- not a foreign key: the invitation may already be deleted
  reason          text not null check (reason in ('harassment', 'unwanted', 'inappropriate', 'scam', 'other')),
  note            text check (note is null or char_length(note) <= 300),
  ip_hash         text,
  created_at      timestamptz not null default now()
);
alter table public.invitation_reports enable row level security;
revoke all on table public.invitation_reports from anon, authenticated;
create index if not exists invitation_reports_code on public.invitation_reports (invitation_code);
create index if not exists invitation_reports_ip_time on public.invitation_reports (ip_hash, created_at);

-- admins can read the reports (only if step 3 has been run, because it creates is_admin())
do $$
begin
  if to_regprocedure('public.is_admin()') is not null then
    drop policy if exists "reports admin read" on public.invitation_reports;
    create policy "reports admin read" on public.invitation_reports for select to authenticated using (public.is_admin());
    grant select on public.invitation_reports to authenticated;
  end if;
end
$$;

create or replace function public.report_invitation(p_code text, p_reason text, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_hash text; v_n int;
begin
  if p_code is null or p_code !~ '^[a-fA-F0-9]{10,32}$' then raise exception 'bad_data'; end if;
  if p_reason is null or p_reason not in ('harassment', 'unwanted', 'inappropriate', 'scam', 'other') then raise exception 'bad_data'; end if;
  v_hash := md5(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', 'unknown'));
  if (select count(*) from public.invitation_reports where ip_hash = v_hash and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'too_many';
  end if;
  insert into public.invitation_reports (invitation_code, reason, note, ip_hash)
  values (lower(p_code), p_reason, left(p_note, 300), v_hash);
  select count(distinct ip_hash) into v_n from public.invitation_reports where invitation_code = lower(p_code);
  if v_n >= 3 then update public.invitations set hidden = true where code = lower(p_code); end if;
end;
$$;
revoke all on function public.report_invitation(text, text, text) from public;
grant execute on function public.report_invitation(text, text, text) to anon, authenticated;

-- creating an invitation: same rules as step 2, but 16-character codes and old reports are cleaned up too
create or replace function public.create_invitation(p_kind text, p_data jsonb, p_images jsonb default '{}'::jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_free_places constant int := 3;
  v_date_hours  constant int := 24;
  v_max_days    constant int := 90;
  v_max_rows    constant int := 3000;
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

  delete from public.invitations where expires_at < now();
  delete from public.invitation_reports where created_at < now() - interval '90 days';
  if (select count(*) from public.invitations) >= v_max_rows then raise exception 'busy'; end if;

  v_ip := coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', 'unknown');
  v_hash := md5(v_ip);
  if (select count(*) from public.invitations where ip_hash = v_hash and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'too_many';
  end if;

  v_exp := now() + make_interval(hours => v_date_hours);
  if p_kind = 'appreciation' then
    if coalesce(p_data ->> 'dt', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      begin
        v_day := (p_data ->> 'dt')::date;
        v_exp := greatest(v_exp, (v_day + 2)::timestamptz);
      exception when others then
        null;
      end;
    end if;
    v_exp := least(v_exp, now() + make_interval(days => v_max_days));
  end if;

  loop
    v_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);     -- 16 characters = 64 bits
    exit when not exists (select 1 from public.invitations where code = v_code);
  end loop;

  insert into public.invitations (code, kind, data, images, places, ip_hash, expires_at)
  values (v_code, p_kind, p_data, p_images, v_places, v_hash, v_exp);
  return v_code;
end;
$$;

-- opening an invitation: hidden (reported) ones are not shown. Old 10-character codes still work until they expire.
create or replace function public.get_invitation(p_code text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object('kind', kind, 'data', data, 'images', images, 'expires_at', expires_at)
  from public.invitations
  where p_code ~ '^[a-fA-F0-9]{10,32}$' and code = lower(p_code) and expires_at > now() and not hidden
$$;

revoke all on function public.create_invitation(text, jsonb, jsonb) from public;
revoke all on function public.get_invitation(text) from public;
grant execute on function public.create_invitation(text, jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_invitation(text) to anon, authenticated;
