-- SweetHeart backend, step 3 (Phase 2): profiles, roles, audit log and account safety.
-- How to use: Supabase > SQL Editor > New query > paste this whole file > Run.
-- (Written without being run on a real database. If Supabase shows an error, send me the exact message.)
-- After it succeeds, run backend/tests/03_security_checks.sql: every row must say PASS.

-- 1. Profiles: one row per account. The password and login live in Supabase Auth, never here.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 60),
  avatar_url   text check (avatar_url is null or char_length(avatar_url) <= 500),
  role         text not null default 'user' check (role in ('user', 'manager', 'admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- every new account gets a profile (role 'user') automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 60), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- 2. "Is this person an administrator?" The role is read on the server, and the login must be
--    a multi-factor one (aal2), so an admin without MFA has no admin powers.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
     and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
$$;

-- 3. Who can do what with profiles
revoke all on table public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;   -- NOT the role column
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "profiles admin read" on public.profiles;
create policy "profiles admin read" on public.profiles for select to authenticated using (public.is_admin());
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- 4. Audit log: important actions are written here. Only admins can read it. Nobody can write it directly.
create table if not exists public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users (id) on delete set null,
  action      text not null check (char_length(action) <= 80),
  target_type text check (target_type is null or char_length(target_type) <= 40),
  target_id   text check (target_id is null or char_length(target_id) <= 80),
  created_at  timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
revoke all on table public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;
drop policy if exists "audit admin read" on public.audit_logs;
create policy "audit admin read" on public.audit_logs for select to authenticated using (public.is_admin());
create index if not exists audit_logs_time on public.audit_logs (created_at desc);

create or replace function public.write_audit(p_action text, p_target_type text default null, p_target_id text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, target_type, target_id)
  values ((select auth.uid()), left(p_action, 80), left(p_target_type, 40), left(p_target_id, 80));
end;
$$;
revoke all on function public.write_audit(text, text, text) from public, anon, authenticated;   -- internal use only

-- 5. Functions the website may call
create or replace function public.me()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('id', p.id, 'display_name', p.display_name, 'role', p.role, 'created_at', p.created_at)
  from public.profiles p where p.id = (select auth.uid())
$$;
revoke all on function public.me() from public, anon;
grant execute on function public.me() to authenticated;

-- A signed-in person can delete their own account (the profile goes with it).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  perform public.write_audit('account_deleted', 'user', null);
  delete from auth.users where id = v_uid;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 6. HOW TO MAKE YOURSELF AN ADMIN (run by you, in this SQL Editor, after you have signed up on the site):
--    update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR-EMAIL-HERE');
--    Admin powers work only for a login that used multi-factor authentication. That screen comes in Phase 5.
