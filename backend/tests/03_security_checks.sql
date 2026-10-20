-- Security checks for step 3. Paste into Supabase > SQL Editor and Run. Every row must say PASS.
-- (These check the settings of the database. Full "two different users" tests come with the automated test suite.)
select check_name, case when ok then 'PASS' else 'FAIL' end as result from (values
  ('profiles has row level security on',            (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass)),
  ('audit_logs has row level security on',          (select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass)),
  ('invitations has row level security on',         (select relrowsecurity from pg_class where oid = 'public.invitations'::regclass)),
  ('anonymous visitors cannot read profiles',       not has_table_privilege('anon', 'public.profiles', 'select')),
  ('anonymous visitors cannot read audit logs',     not has_table_privilege('anon', 'public.audit_logs', 'select')),
  ('anonymous visitors cannot read invitations',    not has_table_privilege('anon', 'public.invitations', 'select')),
  ('a signed-in user cannot change their own role', not has_column_privilege('authenticated', 'public.profiles', 'role', 'update')),
  ('a signed-in user can change their display name',has_column_privilege('authenticated', 'public.profiles', 'display_name', 'update')),
  ('a signed-in user cannot delete profiles',       not has_table_privilege('authenticated', 'public.profiles', 'delete')),
  ('a signed-in user cannot write audit logs',      not has_table_privilege('authenticated', 'public.audit_logs', 'insert')),
  ('anonymous visitors cannot call me()',           not has_function_privilege('anon', 'public.me()', 'execute')),
  ('anonymous visitors cannot delete accounts',     not has_function_privilege('anon', 'public.delete_my_account()', 'execute')),
  ('nobody outside can call write_audit()',         not has_function_privilege('authenticated', 'public.write_audit(text,text,text)', 'execute')),
  ('visitors can still open an invitation by code', has_function_privilege('anon', 'public.get_invitation(text)', 'execute'))
) as t(check_name, ok)
order by 2, 1;
