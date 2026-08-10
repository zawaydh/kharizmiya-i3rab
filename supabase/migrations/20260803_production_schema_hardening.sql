-- ترقية آمنة لقاعدة الإنتاج الحالية.
-- متوافقة مع coverage وpractice_coverage سواء كانتا jsonb أو text[].
-- لا تحذف أي سجل ولا تخفض أي نسبة أو نتيجة محفوظة.

begin;

alter table public.progress
  add column if not exists coverage jsonb default '[]'::jsonb,
  add column if not exists practice_percent integer default 0,
  add column if not exists practice_coverage jsonb default '[]'::jsonb,
  add column if not exists learn_completed boolean default false,
  add column if not exists practice_completed boolean default false,
  add column if not exists quiz_passed boolean default false,
  add column if not exists quiz_score integer,
  add column if not exists quiz_total integer,
  add column if not exists certificate_earned_at timestamptz,
  add column if not exists updated_at timestamptz default now();

-- توحيد حقول التغطية على jsonb مع الحفاظ على جميع القيم القديمة.
do $$
declare
  coverage_udt text;
  practice_coverage_udt text;
begin
  select udt_name into coverage_udt
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'progress'
    and column_name = 'coverage';

  select udt_name into practice_coverage_udt
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'progress'
    and column_name = 'practice_coverage';

  alter table public.progress alter column coverage drop default;
  alter table public.progress alter column practice_coverage drop default;

  if coverage_udt = '_text' then
    alter table public.progress
      alter column coverage type jsonb using to_jsonb(coverage);
  elsif coverage_udt <> 'jsonb' then
    raise exception 'نوع coverage غير مدعوم: %', coverage_udt;
  end if;

  if practice_coverage_udt = '_text' then
    alter table public.progress
      alter column practice_coverage type jsonb using to_jsonb(practice_coverage);
  elsif practice_coverage_udt <> 'jsonb' then
    raise exception 'نوع practice_coverage غير مدعوم: %', practice_coverage_udt;
  end if;
end $$;

-- تثبيت القيم الفارغة قبل فرض NOT NULL.
update public.progress
set
  coverage = coalesce(coverage, '[]'::jsonb),
  practice_percent = coalesce(practice_percent, 0),
  practice_coverage = coalesce(practice_coverage, '[]'::jsonb),
  learn_completed = coalesce(learn_completed, false),
  practice_completed = coalesce(practice_completed, false),
  quiz_passed = coalesce(quiz_passed, false),
  updated_at = coalesce(updated_at, now());

-- نرفض أي قيمة ليست مصفوفة JSON بدل تعديلها صامتًا.
do $$
begin
  if exists (
    select 1 from public.progress
    where jsonb_typeof(coverage) <> 'array'
  ) then
    raise exception 'توجد قيمة coverage ليست مصفوفة JSON.';
  end if;

  if exists (
    select 1 from public.progress
    where jsonb_typeof(practice_coverage) <> 'array'
  ) then
    raise exception 'توجد قيمة practice_coverage ليست مصفوفة JSON.';
  end if;
end $$;

alter table public.progress
  alter column coverage set default '[]'::jsonb,
  alter column coverage set not null,
  alter column practice_percent set default 0,
  alter column practice_percent set not null,
  alter column practice_coverage set default '[]'::jsonb,
  alter column practice_coverage set not null,
  alter column learn_completed set default false,
  alter column learn_completed set not null,
  alter column practice_completed set default false,
  alter column practice_completed set not null,
  alter column quiz_passed set default false,
  alter column quiz_passed set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

-- لا ننشئ قيد التفرد إذا وجدت سجلات مكررة؛ بل نوقف الترقية برسالة واضحة.
do $$
begin
  if exists (
    select 1
    from public.progress
    group by user_id, topic_code, level
    having count(*) > 1
  ) then
    raise exception 'يوجد أكثر من سجل للطالب والموضوع والمستوى نفسه. راجع التكرارات قبل إكمال الترقية.';
  end if;
end $$;

create unique index if not exists progress_user_topic_level_unique
  on public.progress (user_id, topic_code, level);

create index if not exists progress_user_updated_at_idx
  on public.progress (user_id, updated_at desc);

-- قيود سلامة البيانات.
do $$
begin
  if exists (select 1 from public.progress where percent < 0 or percent > 100) then
    raise exception 'توجد قيم percent خارج المجال 0..100.';
  end if;
  if exists (select 1 from public.progress where practice_percent < 0 or practice_percent > 100) then
    raise exception 'توجد قيم practice_percent خارج المجال 0..100.';
  end if;
  if exists (
    select 1 from public.progress
    where quiz_score < 0
       or quiz_total < 0
       or (quiz_score is not null and quiz_total is not null and quiz_score > quiz_total)
  ) then
    raise exception 'توجد نتيجة اختبار غير صحيحة: راجع quiz_score وquiz_total.';
  end if;

  if not exists (select 1 from pg_constraint where conname = 'progress_percent_range') then
    alter table public.progress add constraint progress_percent_range check (percent between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'progress_practice_percent_range') then
    alter table public.progress add constraint progress_practice_percent_range check (practice_percent between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'progress_coverage_json_array') then
    alter table public.progress add constraint progress_coverage_json_array check (jsonb_typeof(coverage) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'progress_practice_coverage_json_array') then
    alter table public.progress add constraint progress_practice_coverage_json_array check (jsonb_typeof(practice_coverage) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'progress_quiz_score_nonnegative') then
    alter table public.progress add constraint progress_quiz_score_nonnegative check (quiz_score is null or quiz_score >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'progress_quiz_total_nonnegative') then
    alter table public.progress add constraint progress_quiz_total_nonnegative check (quiz_total is null or quiz_total >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'progress_quiz_score_within_total') then
    alter table public.progress add constraint progress_quiz_score_within_total check (quiz_score is null or quiz_total is null or quiz_score <= quiz_total);
  end if;
end $$;

-- تثبيت تاريخ الاستحقاق القديم من آخر تحديث لأول مرة فقط.
update public.progress
set certificate_earned_at = updated_at
where certificate_earned_at is null
  and (learn_completed = true or percent >= 100)
  and (practice_completed = true or practice_percent >= 100)
  and (
    quiz_passed = true
    or (quiz_total > 0 and quiz_score is not null and quiz_score::numeric / quiz_total::numeric >= 0.80)
  );

alter table public.progress enable row level security;

drop policy if exists "Progress: read own" on public.progress;
drop policy if exists "Progress: insert own" on public.progress;
drop policy if exists "Progress: update own" on public.progress;
drop policy if exists "Progress: delete own" on public.progress;
drop policy if exists progress_select_own on public.progress;
drop policy if exists progress_insert_own on public.progress;
drop policy if exists progress_update_own on public.progress;
drop policy if exists progress_delete_own on public.progress;

create policy "Progress: read own" on public.progress for select using (auth.uid() = user_id);
create policy "Progress: insert own" on public.progress for insert with check (auth.uid() = user_id);
create policy "Progress: update own" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Progress: delete own" on public.progress for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- توحيد جدول الطلاب وسياساته دون حذف بيانات قديمة.
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text not null,
  pin_hash text,
  auth_user_id uuid references auth.users(id) on delete cascade,
  email_verified boolean not null default false,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.students
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists pin_hash text,
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists email_verified boolean default false,
  add column if not exists email_verified_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.students
set
  email_verified = coalesce(email_verified, false),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

do $$
begin
  if exists (select 1 from public.students where email is null or trim(email) = '') then
    raise exception 'توجد سجلات طلاب بلا بريد صالح. أكمل البريد قبل إتمام الترقية.';
  end if;
  if exists (
    select 1
    from public.students
    group by lower(trim(email))
    having count(*) > 1
  ) then
    raise exception 'توجد سجلات طلاب ببريد مكرر بعد التطبيع. راجعها قبل إتمام الترقية.';
  end if;
  if exists (
    select 1
    from public.students
    where auth_user_id is not null
    group by auth_user_id
    having count(*) > 1
  ) then
    raise exception 'يوجد auth_user_id مرتبط بأكثر من سجل طالب.';
  end if;
end $$;

alter table public.students
  alter column email set not null,
  alter column email_verified set default false,
  alter column email_verified set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

create unique index if not exists students_email_unique_lower
  on public.students (lower(trim(email)))
  where trim(email) <> '';

create unique index if not exists students_auth_user_id_unique
  on public.students (auth_user_id)
  where auth_user_id is not null;

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

commit;
