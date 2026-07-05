-- تحقق البريد وربط جدول students بمستخدمي Supabase Auth
-- شغّلي هذا الملف مرة واحدة من Supabase SQL Editor إذا أردت ظهور حالة التحقق داخل public.students.

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

alter table public.students
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists email_verified boolean not null default false,
  add column if not exists email_verified_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'students_auth_user_id_unique'
      and conrelid = 'public.students'::regclass
  ) then
    alter table public.students
      add constraint students_auth_user_id_unique unique (auth_user_id);
  end if;
end $$;

-- يمنع تكرار البريد نفسه، لكن لا ينشئ الفهرس إذا كان عندك تكرار حاليًا.
do $$
begin
  if exists (
    select 1
    from public.students
    where email is not null and trim(email) <> ''
    group by lower(trim(email))
    having count(*) > 1
  ) then
    raise notice 'لم يتم إنشاء فهرس منع تكرار البريد لأن جدول students يحتوي إيميلات مكررة. نظفي التكرار ثم أنشئي الفهرس.';
  else
    create unique index if not exists students_email_unique_lower
      on public.students (lower(trim(email)))
      where email is not null and trim(email) <> '';
  end if;
end $$;

alter table public.students enable row level security;

drop policy if exists "Students: read own" on public.students;
create policy "Students: read own"
on public.students for select
using (
  auth.uid() = auth_user_id
  or lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
);

drop policy if exists "Students: insert own" on public.students;
create policy "Students: insert own"
on public.students for insert
with check (
  auth.uid() = auth_user_id
  and lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
);

drop policy if exists "Students: update own or claim old row" on public.students;
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
