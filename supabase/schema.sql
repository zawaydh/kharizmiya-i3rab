-- المخطط المرجعي الحالي لمنصة مدرّب التفكير النحوي.
-- لا تشغّل هذا الملف على قاعدة الإنتاج العاملة؛ فهو لإنشاء قاعدة جديدة فقط.

create extension if not exists pgcrypto;

create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_code text not null,
  level integer not null default 2,
  percent integer not null default 0 check (percent between 0 and 100),
  coverage jsonb not null default '[]'::jsonb check (jsonb_typeof(coverage) = 'array'),
  practice_percent integer not null default 0 check (practice_percent between 0 and 100),
  practice_coverage jsonb not null default '[]'::jsonb check (jsonb_typeof(practice_coverage) = 'array'),
  learn_completed boolean not null default false,
  practice_completed boolean not null default false,
  quiz_passed boolean not null default false,
  quiz_score integer check (quiz_score is null or quiz_score >= 0),
  quiz_total integer check (quiz_total is null or quiz_total >= 0),
  certificate_earned_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint progress_user_topic_level_unique primary key (user_id, topic_code, level),
  check (quiz_score is null or quiz_total is null or quiz_score <= quiz_total)
);

create index if not exists progress_user_updated_at_idx
  on public.progress (user_id, updated_at desc);

alter table public.progress enable row level security;

drop policy if exists "Progress: read own" on public.progress;
drop policy if exists "Progress: insert own" on public.progress;
drop policy if exists "Progress: update own" on public.progress;
drop policy if exists "Progress: delete own" on public.progress;

create policy "Progress: read own" on public.progress for select using (auth.uid() = user_id);

-- الحفظ يمر حصرًا من مسار الخادم الذي يتحقق من المثال والنتيجة.
revoke insert, update, delete on public.progress from anon, authenticated;
grant select on public.progress to authenticated;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text not null,
  pin_hash text,
  auth_user_id uuid constraint students_auth_user_id_unique unique references auth.users(id) on delete cascade,
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

create table if not exists public.app_error_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  source text not null check (char_length(source) between 1 and 40),
  message text not null check (char_length(message) between 1 and 500),
  digest text check (digest is null or char_length(digest) <= 120),
  route text not null check (char_length(route) between 1 and 240),
  user_agent text not null check (char_length(user_agent) between 1 and 320),
  created_at timestamptz not null default now()
);

create index if not exists app_error_events_created_at_idx
  on public.app_error_events (created_at desc);
create index if not exists app_error_events_user_created_at_idx
  on public.app_error_events (user_id, created_at desc)
  where user_id is not null;

alter table public.app_error_events enable row level security;
revoke all on table public.app_error_events from anon, authenticated;
