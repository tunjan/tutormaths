# Deploying Maths Tasks to Vercel

The Next.js app deploys to Vercel. The database, auth, storage, the
`send-reminders` and `send-notification-email` Edge Functions, and the
`pg_cron` schedule all live in Supabase and are **unaffected** by the Vercel
deploy — they keep running regardless.

Supabase project ref: `oahyvncrknjnusphwfti`

---

## 0. Before you deploy — rotate secrets
Every key was shared in plaintext during development. Rotate before going live:
- Supabase → Project Settings → API Keys → roll the **secret** (service-role) key.
- Resend → API Keys → roll the key; then `supabase secrets set RESEND_API_KEY=…`
  and update the Vault secret used by cron if you rotate the service key:
  ```sql
  select vault.update_secret(
    (select id from vault.secrets where name = 'reminder_invoker_key'),
    '<NEW_SERVICE_ROLE_JWT>'
  );
  ```
  (both cron and the notification-email trigger authenticate the Edge Function
  call with this.)

## 1. Get the code into a Git repo
```bash
git init
git add -A
git commit -m "Maths Tasks initial"
# create a GitHub repo, then:
git remote add origin git@github.com:<you>/tutormaths.git
git branch -M main
git push -u origin main
```
`.gitignore` already excludes `.env*.local`, `.next`, `node_modules`, `.vercel`.
(Or skip Git and use the Vercel CLI: `npx vercel` then `npx vercel --prod`.)

## 2. Import the project in Vercel
- New Project → import the repo. Framework preset **Next.js** is auto-detected.
- Build command `next build`, output `.next` (defaults — leave as is).
- Node.js 20+ (default).
- `proxy.ts` runs on the Node.js runtime automatically; no extra config.

## 3. Environment variables (Vercel → Settings → Environment Variables)
Set for **Production** (and Preview if you want preview deploys to work):

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://oahyvncrknjnusphwfti.supabase.co` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable key | public |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>` | canonical URL; used to build magic-link/invite redirects |
| `SUPABASE_SERVICE_ROLE_KEY` | secret key | **server-only — never expose** |
| `RESEND_API_KEY` | Resend key | server-only |
| `RESEND_FROM_EMAIL` | `Maths Tasks <homework@akuira.cafe>` | verified domain |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL | rate limiting; see below |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token | server-only |

If you don't set `NEXT_PUBLIC_SITE_URL`, the app falls back to Vercel's
production URL automatically (`getSiteUrl()` in `lib/site-url.ts`), but setting
it to your canonical domain is recommended.

**Rate limiting (Upstash):** sign-in and student-creation are throttled by
`lib/rate-limit.ts`, backed by Upstash Redis (in-memory counters don't work
across serverless instances). Provision it in one click via **Vercel
Marketplace → Upstash** — it sets `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN` automatically. If both are unset the app still runs
but rate limiting is **disabled** (a warning is logged in production), so set
them before going live.

**Security headers / CSP:** `next.config.ts` sends a strict CSP plus HSTS,
`X-Frame-Options`, `nosniff`, etc. The CSP's `connect-src` allow-list is built
from `NEXT_PUBLIC_SUPABASE_URL` **at build time**, so that variable must be set
to the real project URL in Vercel before/at build — otherwise the browser will
block Supabase REST + Realtime. (Vercel builds with the project env, so this is
automatic once the var above is set.)

## 4. Deploy, then point Supabase Auth at the domain
After the first deploy you'll have a URL (e.g. `https://tutormaths.vercel.app`).
Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://<your-domain>` (used by `{{ .SiteURL }}` in emails).
- **Redirect URLs**: add
  - `https://<your-domain>/auth/confirm`
  - `https://<your-domain>/auth/callback`
  - for preview deploys (optional): `https://*.vercel.app/**`

Confirm the **Invite** and **Magic Link** email templates resolve to the
token-hash confirm flow (see SETUP.md) so invite links land on `/auth/confirm`.

## 5. Custom domain (optional)
- Vercel → Settings → Domains → add your domain.
- Update `NEXT_PUBLIC_SITE_URL` and Supabase **Site URL** + **Redirect URLs** to
  the custom domain, then redeploy.

## 6. Post-deploy smoke test
1. Visit the site → redirected to `/login`.
2. Request a magic link as the tutor; confirm the email link points at the
   **production** domain (not localhost) and signs you in.
3. Add a student, create an assignment (PDF upload), then as the student
   submit work / comment — verify the tutor notification bell updates live
   **and** that each notification arrives by email (requires the
   `send-notification-email` function + its Vault key, SETUP.md Step 6).
4. Reminders: already scheduled in Supabase; nothing to do on Vercel.

## Notes
- The service-role key is only ever read server-side (`/api/students`, the
  delete-assignment cleanup). It is never in the client bundle.
- Realtime notifications connect the browser directly to Supabase — works on
  Vercel with no extra config.
