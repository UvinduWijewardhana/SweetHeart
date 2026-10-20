-- Security checks for step 4. Paste into Supabase > SQL Editor and Run. Every row must say PASS.
select check_name, case when ok then 'PASS' else 'FAIL' end as result from (values
  ('invitation_reports has row level security on',        (select relrowsecurity from pg_class where oid = 'public.invitation_reports'::regclass)),
  ('anonymous visitors cannot read reports',               not has_table_privilege('anon', 'public.invitation_reports', 'select')),
  ('anonymous visitors cannot write reports directly',     not has_table_privilege('anon', 'public.invitation_reports', 'insert')),
  ('visitors can report an invitation through the function', has_function_privilege('anon', 'public.report_invitation(text,text,text)', 'execute')),
  ('visitors can open an invitation by code',              has_function_privilege('anon', 'public.get_invitation(text)', 'execute')),
  ('visitors can still not read the invitations table',    not has_table_privilege('anon', 'public.invitations', 'select')),
  ('invitations have the hidden column',                   exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'invitations' and column_name = 'hidden'))
) as t(check_name, ok)
order by 2, 1;
