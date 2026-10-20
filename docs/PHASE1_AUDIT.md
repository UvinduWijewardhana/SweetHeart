# SweetHeart - Phase 1 audit (follows "Full Backend Development Specification", section 19)

Date: 9 October 2026. Nothing in this document has been deployed to production.

## 1. Current architecture
- **Frontend:** static HTML, CSS and plain JavaScript (no framework, no build step, no package manager). Hosted on GitHub Pages (`uvinduwijewardhana.github.io/SweetHeart`).
- **Backend (started):** one Supabase project (region Singapore, free plan): table `invitations` (Row Level Security on, no policies, no direct access for the public key), two functions `create_invitation` and `get_invitation` (security definer, all rules checked on the server). `backend/02_expiry.sql` (24 hour expiry) is written but not yet run.
- **Config:** `js/config.js` holds the Supabase URL and the publishable key (safe to be public). No secret keys anywhere in the repository.
- **Not present:** user accounts, roles, server-side prices, real payments, email sending, file storage, admin API, tests in the repository, CI, monitoring.

## 2. Existing features (frontend unless stated)
| Feature | State |
|---|---|
| Date Invite maker + invitation page (3 free places, own place photos, 1 MB square crop) | Live. Saves to Supabase when configured, otherwise long link |
| Employee Appreciation maker + employee page (company logo, gift text, date, clock time picker, WhatsApp confirm) | Live. Same as above |
| Special Days category page, home page, menu, Sinhala/English | Live (front-end only) |
| Gift shop, cart, checkout, payment page (card and USDT) | **Preview only.** Products and prices are in a JS file, so they are not trustworthy |
| Log in / Sign up (Google, Facebook, Apple, email) | Screen only, not connected. `demoLogin` is true in `config.js` |
| Admin dashboard | Sample page with fake data |
| Link expiry + "link expired" page, privacy policy for saved data | Written (24 h for Date Invite, until the day after the booked date for appreciation) |

## 3. Missing backend functionality (compared with the specification)
Authentication and roles (section 3), invitation statuses/ownership/public tokens (4), templates (5), most of the schema (6: profiles, templates, products, product_images, orders, order_items, payments, digital_entitlements, coupons, audit_logs), payment provider and verified webhooks (7), server-side cart and orders (8), admin API (9), email (12), storage with signed URLs (13), privacy procedures (14), automated tests (15), CI/CD and environments (16).

## 4. Recommended architecture (adapting the specification to this project)
The specification suggests Node.js / TypeScript, and says Supabase is acceptable. This project has no Node server and no framework, so:
- **Use Supabase as the backend:** PostgreSQL + Auth (email verification, Google, MFA for admins) + Storage (private buckets, signed URLs) + Row Level Security + **Edge Functions written in TypeScript** for the parts that need secrets (payment checkout, payment webhooks, emails).
- This keeps the frontend unchanged (spec rule 2 and 3), avoids running and securing a separate API server, and still satisfies "authorization enforced on the server".
- **Hosting:** keep GitHub Pages while testing. Before launch move the frontend to **Cloudflare Pages** (custom `.lk` domain, HTTPS, security headers/CSP, clean URLs such as `/i/AbC123xy`, WAF/rate limiting). GitHub Pages cannot set security headers or rewrites.
- REST routes in the specification map to: PostgREST (RLS-protected tables), database functions (RPC) and Edge Functions. A separate Node API is added only if a requirement cannot be met this way.

## 5. Recommended database schema (initial; final after your confirmation)
Money: `numeric(12,2)` or integer minor units, never floating point. All tables get primary keys, foreign keys, timestamps, indexes, RLS and migrations kept as files in `backend/migrations`.
- `profiles` (id = auth user id, display_name, avatar_url, role: user | admin | manager, timestamps)
- `templates` (slug, category, description, preview_url, configuration JSON validated against a schema, price, is_premium, is_active)
- `invitations` (id, owner_id nullable for anonymous free ones, template_id, public_token 16+ random characters, kind, data, status DRAFT/PUBLISHED/ARCHIVED/DELETED, expires_at, created/updated/published_at). Today's table already has code, kind, data, images, expires_at.
- `invitation_reports` (invitation, reason, created_at) for abuse reports
- `products`, `product_images`, `coupons`
- `orders`, `order_items` (name and price snapshots), `payments` (provider, provider_reference unique, status), `digital_entitlements`
- `audit_logs` (actor, action, target, time; no secrets, no personal data)

## 6. Required integrations
Supabase Auth (+ custom SMTP / Resend or Brevo for verification and receipts, with SPF/DKIM/DMARC on the domain), Google OAuth, Supabase Storage, one payment provider (PayHere, WEBXPAY or Stripe: eligibility, fees, refunds and settlement must be confirmed first), Cloudflare (DNS, WAF, Turnstile), error tracking (for example Sentry), uptime monitoring, GitHub Actions.

## 7. Security risks found in the current build
1. **Anonymous creation is open to anyone with the public key.** Limits exist (30 per hour per connection, 3000 stored in total, 24 h expiry) but the per-connection limit uses a request header that has not been verified as unforgeable. Add Cloudflare Turnstile / Edge Function rate limiting.
2. **Invitation codes are 10 hex characters (40 bits)** and `get_invitation` has no throttling. Lengthen to 16+ and throttle.
3. **No way to report abusive invitations** (for example unwanted romantic invitations). Needs a Report link and takedown.
4. **Personal data is stored** (names, WhatsApp numbers, photos). Retention is 24 h for Date Invite; the privacy policy is updated; a deletion-on-request process still has to be defined and checked against Sri Lankan data protection law (not yet reviewed).
5. **Cart prices and products come from a JS file in the browser.** They must never be used for a real payment: prices must be read from the database on the server.
6. `demoLogin: true` and the "preview success" payment button must be switched off before any public launch (spec rules 17 and 18).
7. No security headers or CSP (GitHub Pages limitation).
8. No automated tests or CI in the repository yet (tests so far were run locally against a mock server). The SQL has been run once on a real database ("Success") but its behaviour has not yet been tested end to end on it.
9. USDT payments are outside the specification and need their own review (server-side blockchain verification, exchange-rate handling, legal/compliance, provider rules).

## 8. Proposed implementation plan (small, testable phases; each needs your approval)
- **2 Foundation:** finish and verify the current short-link step on the real database (run `02_expiry.sql`), separate dev and production Supabase projects, migrations as files, profiles + Auth (email verification, Google), roles + RLS tests, admin MFA, "who am I" function.
- **3 Invitations:** owner, statuses, longer tokens, templates table, drafts, abuse reports, photos moved to Supabase Storage (private + signed URLs), retention rules for signed-in users.
- **4 Commerce:** products, server-side pricing, orders, hosted-checkout payment with verified webhook (idempotent), entitlements, refunds. Sandbox only until approved.
- **5 Administration:** protected admin API, audit logs, then the desktop application.
- **6 Security hardening:** rate limiting, authorization review, RLS tests, dependency scanning, backup restore test, security headers.
- **7 Launch:** Cloudflare Pages + domain, HTTPS, monitoring and alerts, rollback plan.

## 9. Questions that need your decision (defaults used until you answer)
1. Invitation lifetime: anonymous = 24 hours (as now). Signed-in users: drafts and published invitations kept longer (default 30 days, adjustable). 
2. Payment provider: to be chosen after checking eligibility (PayHere / WEBXPAY / Stripe). USDT is treated as a separate later project.
3. Admin dashboard: web admin API first, desktop application on top of the same API (same login and MFA).
4. Domain: sweetheart.lk is not yet registered; availability and individual eligibility must be checked at domains.lk.
5. Which features stay disabled until finished: gift shop checkout, payments, login with Facebook/Apple, physical orders.
