-- ترقية آمنة لقاعدة موجودة: تثبيت تاريخ استحقاق الشهادة لأول مرة.
-- يمكن تشغيل هذا الملف مرة واحدة في Supabase SQL Editor.

alter table public.progress
  add column if not exists certificate_earned_at timestamptz;

-- تعبئة السجلات القديمة المؤهلة بتاريخ آخر تحديث محفوظ لديها.
update public.progress
set certificate_earned_at = updated_at
where certificate_earned_at is null
  and (learn_completed = true or percent >= 100)
  and (practice_completed = true or practice_percent >= 100)
  and (
    quiz_passed = true
    or (
      quiz_total is not null
      and quiz_total > 0
      and quiz_score is not null
      and (quiz_score::numeric / quiz_total::numeric) >= 0.80
    )
  );
