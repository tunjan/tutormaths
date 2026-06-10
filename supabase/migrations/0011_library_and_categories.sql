-- ============================================================================
-- TutorMaths — Step 11: Topic categories + shared resource Library.
--   1. categories            — a shared topic taxonomy (tutor-owned).
--   2. library_documents     — tutor-uploaded reference docs, grouped by topic.
--   3. assignments.category_id — optional topic tag for an assignment.
--   4. RLS: tutor full access; students read-only on both new tables.
--   5. storage bucket `library` (PRIVATE) — tutor manages; all signed-in read.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. categories  (the shared topic taxonomy; e.g. "Algebra", "Calculus")
-- ----------------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (name)
);

create index categories_created_by_idx on public.categories (created_by);

comment on table public.categories is
  'Shared topic taxonomy used by both the Library and assignment tagging.';

-- ----------------------------------------------------------------------------
-- 2. library_documents  (reference material, grouped by category)
-- ----------------------------------------------------------------------------
create table public.library_documents (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  title       text not null check (length(trim(title)) > 0),
  file_path   text not null,                       -- object key in `library`
  mime_type   text not null,
  size_bytes  bigint check (size_bytes is null or size_bytes <= 20971520), -- 20 MB
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index library_documents_category_id_idx on public.library_documents (category_id);

-- ----------------------------------------------------------------------------
-- 3. assignments.category_id  (optional topic tag)
-- ----------------------------------------------------------------------------
alter table public.assignments
  add column category_id uuid references public.categories (id) on delete set null;

create index assignments_category_id_idx on public.assignments (category_id);

-- ----------------------------------------------------------------------------
-- 4. RLS — tutor full access; students read-only.
-- ----------------------------------------------------------------------------
alter table public.categories        enable row level security;
alter table public.library_documents enable row level security;

-- ---- categories -----------------------------------------------------------
create policy "tutor manages categories" on public.categories
  for all to authenticated
  using      ((select public.is_tutor()))
  with check ((select public.is_tutor()));

create policy "authenticated reads categories" on public.categories
  for select to authenticated using (true);

-- ---- library_documents ----------------------------------------------------
create policy "tutor manages library documents" on public.library_documents
  for all to authenticated
  using      ((select public.is_tutor()))
  with check ((select public.is_tutor()));

create policy "authenticated reads library documents" on public.library_documents
  for select to authenticated using (true);

-- ----------------------------------------------------------------------------
-- 5. Storage bucket (PRIVATE) for the shared Library.
--    Unlike assignment-files/submissions, library docs are shared across all
--    students, so every signed-in user may READ; only the tutor may write.
--    Path convention: library/{category_id}/{document_id}/{filename}
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('library', 'library', false, 20971520,
   array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "tutor manages library files" on storage.objects
  for all to authenticated
  using      (bucket_id = 'library' and (select public.is_tutor()))
  with check (bucket_id = 'library' and (select public.is_tutor()));

create policy "authenticated reads library files" on storage.objects
  for select to authenticated
  using (bucket_id = 'library');

-- ============================================================================
-- End of Step 11.
-- ============================================================================
