-- ============================================================================
-- TutorMaths — Step 10: student invite links
-- A tutor creates an invite with only the student's NAME; this row holds a
-- single-use, non-expiring token. The student opens /invite/<token>, supplies
-- their own email + password, and the account is created at THAT point (see
-- app/invite/[token]/actions.ts). Until then no auth user / profile exists.
-- ============================================================================

create table public.student_invites (
  id               uuid primary key default gen_random_uuid(),
  token            text not null unique,
  full_name        text not null default '',
  created_by       uuid not null references public.profiles (id) on delete cascade,
  created_at       timestamptz not null default now(),
  accepted_at      timestamptz,                       -- set once redeemed (single-use)
  accepted_user_id uuid references public.profiles (id) on delete set null
);

comment on table public.student_invites is
  'Pending student invitations. token is a single-use bearer link; accepted_at marks it redeemed.';

-- Pending invites are the only rows the tutor lists; index that hot path.
create index student_invites_pending_idx
  on public.student_invites (created_at desc) where accepted_at is null;

alter table public.student_invites enable row level security;

-- The tutor manages invites from their authenticated session (RLS-checked).
-- The public accept flow runs server-side with the service-role admin client,
-- which bypasses RLS, so no anon policy is needed here.
create policy "tutor manages invites" on public.student_invites
  for all to authenticated
  using      (public.is_tutor())
  with check (public.is_tutor());

-- ============================================================================
-- End of Step 10.
-- ============================================================================
