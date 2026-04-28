-- خوارزمية الإعراب: ترقية نظام التقدم إلى coverage حقيقي بدون حذف أي بيانات
-- شغّلي هذا الملف في Supabase SQL Editor مرة واحدة فقط.

alter table public.progress
  add column if not exists coverage text[] default '{}'::text[],
  add column if not exists practice_percent integer default 0,
  add column if not exists practice_coverage text[] default '{}'::text[],
  add column if not exists quiz_total integer,
  add column if not exists updated_at timestamptz default now();

-- مهم لعملية upsert من الكود: سجل واحد لكل طالب + موضوع + مستوى.
create unique index if not exists progress_user_topic_level_unique
on public.progress(user_id, topic_code, level);

-- حماية جدول التقدم: كل طالب يرى ويعدل سجلاته فقط.
alter table public.progress enable row level security;

drop policy if exists progress_select_own on public.progress;
drop policy if exists progress_insert_own on public.progress;
drop policy if exists progress_update_own on public.progress;
drop policy if exists progress_delete_own on public.progress;

create policy progress_select_own
on public.progress
for select
using (auth.uid() = user_id);

create policy progress_insert_own
on public.progress
for insert
with check (auth.uid() = user_id);

create policy progress_update_own
on public.progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy progress_delete_own
on public.progress
for delete
using (auth.uid() = user_id);

-- جدول الموضوعات: قراءة عامة فقط، بدون فتح تعديل للطلاب.
alter table public.topics enable row level security;

drop policy if exists topics_read_all on public.topics;

create policy topics_read_all
on public.topics
for select
using (true);
