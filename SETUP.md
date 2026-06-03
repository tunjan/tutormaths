# Maths Tasks — Setup (Step 2)

Do these in order. Stop at the **TYPES CHECKPOINT** until the schema is live.

---

## 1. Create the Supabase project
1. Create a new project at <https://supabase.com/dashboard>.
2. Note the **Project URL** and your API keys (Project Settings → API).

## 2. Environment variables
1. `cp .env.local.example .env.local`
2. Fill in every value (see comments in the file).

Key handling rules:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public, fine in the browser; RLS is the real gate.
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never `NEXT_PUBLIC`, never imported into a Client Component. Used solely to create student accounts in a Route Handler. If leaked, rotate immediately.
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — server-only; used by the reminder Edge Function (Step 5).

`.env.local` is git-ignored — never commit it.

## 3. Apply the Step 1 schema
Pick one:

**A — SQL Editor (simplest):** open the Supabase SQL Editor, paste the entire contents of
`supabase/migrations/0001_initial_schema.sql`, and run it.

**B — Supabase CLI:**
```bash
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

> Before running: open the migration and confirm the **tutor email** in section 14
> (`handle_new_user`) is the address you will register. It is pre-filled with
> `albertomedinatrigo@gmail.com`.

## 4. Storage buckets
The migration **already creates** both private buckets (`assignment-files`,
`submissions`) with 20 MB caps and MIME allow-lists, plus their policies.
Verify in Dashboard → Storage:
- `assignment-files` — Private, allowed: `application/pdf`
- `submissions` — Private, allowed: `application/pdf, image/jpeg`

(If your project predates SQL bucket creation and they didn't appear, create
them manually with those exact settings — the policies are already in the SQL.)

## 5. Enable the custom access-token (JWT) auth hook  ← REQUIRED
The role claim does nothing until the hook is enabled.
1. Dashboard → **Authentication → Hooks** (a.k.a. Auth Hooks).
2. Find **"Customize Access Token (JWT) Claims"**.
3. Enable it and select the Postgres function `public.custom_access_token_hook`.
4. Save.

Now every issued JWT carries `user_role`, which `is_tutor()` and all RLS
policies depend on.

## 6. Create your tutor account
1. Dashboard → **Authentication → Users → Add user** (or invite yourself).
2. Use the **same email** as in section 14 of the migration.
3. On insert, the `on_auth_user_created` trigger writes your `profiles` row with
   `role = 'tutor'` and seeds `tutor_settings`.
4. Verify: SQL Editor → `select id, email, role from public.profiles;` should
   show your row with `role = 'tutor'`.

> After creating the user, sign in once so a fresh JWT (with the `user_role`
> claim from the now-enabled hook) is issued.

---

## TYPES CHECKPOINT — stop here and confirm

Once the schema is applied and the hook is enabled, tell me and I'll generate
the TypeScript types. They are the single source of truth and must be
**regenerated after every migration** — never hand-edited.

Target path: `lib/database.types.ts`

CLI form (run yourself, or I can run it via the Supabase tooling):
```bash
# Hosted project:
supabase gen types typescript --project-id YOUR-PROJECT-REF --schema public > lib/database.types.ts

# Or local stack:
supabase gen types typescript --local --schema public > lib/database.types.ts
```

If you ever see `never` types in queries, the cause is a stale type file or a
version mismatch between `@supabase/supabase-js` and the generated types — fix
by regenerating here and aligning versions, not by editing the interface.

---

## Student invite email template (needed for invites to land correctly)
Dashboard → Authentication → URL Configuration → add to **Redirect URLs**:
`{site}/auth/confirm` and `{site}/auth/callback` (use your real site URL).

Dashboard → Authentication → Email Templates → **Invite user**: make the link
resolve to the token-hash confirm flow, e.g.
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`.

## Step 5 — reminder Edge Function + cron

1. **Deploy the function** (already deployed via tooling; to redeploy yourself):
   ```bash
   supabase functions deploy send-reminders
   ```
2. **Set the function secrets** (NOT `SUPABASE_*` — those are auto-injected):
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxx \
     RESEND_FROM_EMAIL="Maths Tasks <homework@your-verified-domain.com>"
   ```
   Or Dashboard → Edge Functions → send-reminders → Secrets.
3. **Store the service-role key in Vault** (lets cron authenticate the call):
   ```sql
   select vault.create_secret('<SERVICE_ROLE_KEY>', 'reminder_invoker_key');
   ```
4. **Schedule the cron job** — run `supabase/migrations/0004_schedule_reminders.sql`
   (enables `pg_cron` + `pg_net`, schedules every 15 min). The function picks
   which reminders are due from your `reminder_windows` and dedupes via
   `reminders_sent`, so no double-sends.
5. **Test once** without waiting for cron:
   ```bash
   curl -X POST https://YOUR-REF.supabase.co/functions/v1/send-reminders \
     -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
   ```
   Expect `{"ok":true,"evaluated":N,"sent":M}`.
