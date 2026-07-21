-- المخطط المرجعي الحالي لمنصة خوارزمية الإعراب
-- الغرض: إنشاء قاعدة Supabase جديدة متوافقة مع الكود الحالي.
-- لا تشغّل هذا الملف على قاعدة الإنتاج العاملة؛ فهو مرجع كامل للإنشاء الجديد.

create extension if not exists pgcrypto;

create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_code text not null,
  level integer not null default 2,
  percent integer not null default 0 check (percent between 0 and 100),
  coverage text[] not null default '{}'::text[],
  practice_percent integer not null default 0 check (practice_percent between 0 and 100),
  practice_coverage text[] not null default '{}'::text[],
  learn_completed boolean not null default false,
  practice_completed boolean not null default false,
  quiz_passed boolean not null default false,
  quiz_score integer check (quiz_score is null or quiz_score >= 0),
  quiz_total integer check (quiz_total is null or quiz_total >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_code, level),
  check (quiz_score is null or quiz_total is null or quiz_score <= quiz_total)
);

create index if not exists progress_user_updated_at_idx
  on public.progress (user_id, updated_at desc);

alter table public.progress enable row level security;

drop policy if exists "Progress: read own" on public.progress;
drop policy if exists "Progress: insert own" on public.progress;
drop policy if exists "Progress: update own" on public.progress;
drop policy if exists "Progress: delete own" on public.progress;
drop policy if exists progress_select_own on public.progress;
drop policy if exists progress_insert_own on public.progress;
drop policy if exists progress_update_own on public.progress;
drop policy if exists progress_delete_own on public.progress;

create policy "Progress: read own"
on public.progress for select
using (auth.uid() = user_id);

create policy "Progress: insert own"
on public.progress for insert
with check (auth.uid() = user_id);

create policy "Progress: update own"
on public.progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Progress: delete own"
on public.progress for delete
using (auth.uid() = user_id);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text not null,
  pin_hash text,
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email_verified boolean not null default false,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists students_email_unique_lower
  on public.students (lower(trim(email)))
  where trim(email) <> '';

alter table public.students enable row level security;

drop policy if exists "Students: read own" on public.students;
drop policy if exists "Students: insert own" on public.students;
drop policy if exists "Students: update own or claim old row" on public.students;

create policy "Students: read own"
on public.students for select
using (
  auth.uid() = auth_user_id
  or lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
);

create policy "Students: insert own"
on public.students for insert
with check (
  auth.uid() = auth_user_id
  and lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
);

create policy "Students: update own or claim old row"
on public.students for update
using (
  auth.uid() = auth_user_id
  or (
    auth_user_id is null
    and lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
)
with check (
  auth.uid() = auth_user_id
  and lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
);
