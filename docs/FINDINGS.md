# Omni Account — findings, decisions, remaining work

## Repositories (inspected 2026-10-21)
| Repo | Stack | Git | Notes |
| --- | --- | --- | --- |
| `omni-tools` | Flutter (mobile) | clean-ish, HEAD `b29835b` | Supabase Auth (email/password, Google, guest, code-based reset, `delete-account` Edge Function). Project ref `oqsnrzfoohhjqqenxmhl` ("Omni Apps, shared across Omni Systems"). No DB tables. |
| `omni-docs` | Flutter (mobile) | 1 uncommitted change (`lib/main.dart`, debug prints — not mine) | **No auth at all**: everything is local (Hive). Not touched. |
| `omni-account` | was empty, not a git repo | — | This project (Next.js 16, TypeScript, plain CSS tokens). |

Other sibling apps exist (`omni-academy`, `-data`, `-edit`, `-finance`, `-notes`, `-plan`) and were not inspected.

## Design system (source: Flutter, not the markdown docs)
`omni-tools/lib/core/theme/omni_design_tokens.dart` and `omni-docs/lib/core/theme/omni_design_tokens.dart` + `app_themes.dart` are **identical** in the values that matter, so there is one shared language:

- Primary teal `#1FC6C1`, pressed `#18AAA6`, deep `#0B7F86`; canvas/surface `#FFFFFF`; border `#E1E7EB`; text `#202124 / #3C4043 / #5F6368`; semantic success/warning/error pairs.
- Dark: canvas `#121516`, surface `#1B2021`, border `#303839`, text `#F4F7F7`.
- Poppins 400/500/600/700 (bundled TTFs, copied here). Page title 24/700, body 14, metadata 12.
- Radii: control 12, card 20, large card 24, **pill 999 for buttons**. Control height 48. Inputs: filled, 12 radius, 1px border, 1.5px teal when focused. Motion 150 ms.

**Trap avoided:** `omni-tools/OMNI_INTERNAL_DESIGN_TOKENS.json` and several `OMNI_INTERNAL_*.md` files describe a *different* product (Omni Internal, a Tailwind web app with blue `#1A73E8`). Its own comment in `omni_design_tokens.dart` says blue is deliberately not copied to mobile. Those files were ignored.

Differences between Tools and Docs: only category accents/feature widgets; nothing relevant to auth.

## Decisions
- **No logo.** The only logos in the repos are Omni Tools / Omni Docs. A text wordmark + teal mark is used until an Omni Account logo exists (`components/ui/Brand.tsx`).
- **No new DB tables / no RLS changes.** Profile = Supabase `user_metadata.display_name`; identity = `auth.users.id`. Nothing to protect with RLS yet. Add tables only with `auth.uid()`-scoped RLS under `supabase/migrations/` when a real need appears.
- **Password reset supports link and code.** Omni Tools' reset is code-based (`verifyOTP`, `recovery`); the web portal handles `/auth/callback` links *and* a code form, so either email template works.
- **Delete account** reuses Tools' `delete-account` Edge Function via `/api/account/delete` (password re-check, then user's own token). No service-role key in this app.
- Password policy is 8+ chars with letter+number client-side; Supabase's own minimum (Tools says 6) remains the server-side floor — raise it in the dashboard to match.
- Guest, Google: intentionally absent (per brief).

## SSO / future integration
Same Supabase project ⇒ **shared identity** (same `auth.users.id`, same credentials), not SSO. Mobile apps keep their own sessions; a web session here does not sign anyone in to the apps. True SSO would need an OAuth/OIDC provider (Supabase OAuth server or an external IdP) with per-app clients; do not pass tokens in URLs. Not implemented.

## Remaining configuration (Supabase dashboard — not done by me)
1. Auth → URL Configuration: add Site URL / redirect `https://<account-domain>/auth/callback` (and `http://localhost:3000/auth/callback` for dev).
2. Email templates (project-wide, shared with Tools!): confirmation should link to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup` (or keep `{{ .ConfirmationURL }}`, which works with PKCE); recovery should include both `{{ .Token }}` (Tools) and a link `…/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`. Edit carefully so Tools keeps working.
3. Note `supabase/config.toml` in Tools has `enable_confirmations = false` for local; the hosted project's setting decides whether verification is enforced.
4. Confirm the `delete-account` function is deployed (Tools' README says it was not yet).
5. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (see `.env.example`; `.env.local` was created from the public values already shipped in Tools).
6. Vercel deploy: set the three env vars; not deployed.

## Verification status
Typecheck, lint, 4 unit tests, production build: pass. UI rendered and checked at desktop/mobile, light/dark; client validation and route guarding (`/account` → `/sign-in?next=…`, bad callback → `/auth/error`) verified. **Not tested end-to-end:** registration, email verification, sign-in, reset, password change, delete — they need a real mailbox and would create/modify accounts in the shared live Supabase project, which I did not do without your say-so.
