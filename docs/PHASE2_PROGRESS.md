# Phase 2 (Foundation: accounts) - progress, 10 October 2026

## Built
- `backend/03_auth_profiles.sql`: `profiles` (role user / manager / admin), automatic profile for each new account, row level security, a signed-in user can read and edit only their own profile and **cannot change their own role** (column-level permission), `is_admin()` that also demands a multi-factor login, `audit_logs` (admin read only, no direct writes), `me()`, `delete_my_account()`.
- `backend/tests/03_security_checks.sql`: 14 permission checks that must all say PASS.
- `js/auth.js`, `js/account.js`, `js/reset.js`, `account.html`, `reset-password.html`: sign up with email confirmation, log in, log out, forgot password / new password, Google sign-in (PKCE), edit name, delete account, Account / Log out in the menu, the cart sends visitors who are not logged in to the login page. Facebook and Apple are disabled ("coming soon"). The demo login hides itself once Supabase is configured.

- Sign-up confirmation and password reset now use a one-time code (OTP) from the email (Supabase `verify` with type signup / recovery). The old email links still work as a fallback. Needs custom SMTP and edited email templates (START_HERE.md, backend/email_templates.md).

## Tested
- All the website behaviour above against a **mock** Supabase Auth server (sign up, wrong and right password, token sent to the database, name save, logout, reset, PKCE challenge matches the secret and the secret never appears in the address, code exchange, delete account).

## NOT tested yet (needs the real project)
- The two SQL files on the real database, the real confirmation and reset emails, Google sign-in, Supabase rate limits.
- Two-different-users tests of the row level security (planned with the automated test suite).

## Known limits / next
- Sign-in tokens are kept in the browser's local storage (as the standard Supabase library does). The site shows user text with textContent only and loads no third-party scripts, and a Content-Security-Policy will be added when the site moves to Cloudflare Pages.
- Supabase's built-in email sender is for testing only: set up SMTP (Resend or Brevo) with SPF, DKIM and DMARC before real users.
- Admin multi-factor enrolment screen: Phase 5. Cloudflare Turnstile on anonymous invitation creation: Phase 6.
