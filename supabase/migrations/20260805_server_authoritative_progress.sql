-- يمنع الطالب من كتابة النسب والنتائج والشهادة مباشرة عبر مفتاح anon.
-- بعد هذه الترقية يظل الطالب قادرًا على قراءة سجله فقط، بينما يكتب مسار
-- /api/progress باستخدام service role بعد التحقق من دليل النتيجة على الخادم.

begin;

alter table public.progress enable row level security;

drop policy if exists "Progress: insert own" on public.progress;
drop policy if exists "Progress: update own" on public.progress;
drop policy if exists "Progress: delete own" on public.progress;
drop policy if exists progress_insert_own on public.progress;
drop policy if exists progress_update_own on public.progress;
drop policy if exists progress_delete_own on public.progress;

drop policy if exists "Progress: read own" on public.progress;
drop policy if exists progress_select_own on public.progress;
create policy "Progress: read own"
on public.progress for select
using (auth.uid() = user_id);

revoke insert, update, delete on public.progress from anon, authenticated;
grant select on public.progress to authenticated;

commit;
