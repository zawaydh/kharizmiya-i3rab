# منصة خوارزمية الإعراب

**مدرّب تفكير نحوي موجّه** مبني باستخدام Next.js وSupabase. يقوم على مبدأ: **الإعراب خطوات؛ كل خطوة تفتح مسارًا وتغلق آخر**، ويقدّم التعلم في ثلاث مراحل: **التعلّم الموجّه، التدريب، الاختبار النهائي**، مع حفظ التقدم وإصدار الشهادات. بعد الاختبار يختار الطالب بين **تحميل الشهادة، عالج ضعفي، ولعبة النصوص** التي تنقل المهارة إلى التشكيل والضبط في نصوص غير مشكولة.

## التشغيل محليًا

1. انسخ `.env.example` إلى `.env.local`.
2. أضف بيانات Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ثبّت الحزم وشغّل المشروع:

```bash
npm install
npm run dev
```

## البناء

```bash
npm run build
npm start
```

## الاختبارات الآلية

يشمل المشروع اختبارات دائمة لسلامة الأشجار والأمثلة والتغطية والاختبارات النهائية، إضافة إلى حفظ التقدم وروابط المسارات وشروط الشهادة.

```bash
npm test
```

لتشغيل الاختبارات وفحص TypeScript وESLint معًا:

```bash
npm run check
```

لفحص الوحدات التي رُفعت صرامتها تدريجيًا باستخدام `strict: true`:

```bash
npm run typecheck:strict
```

## Supabase

- قاعدة الإنتاج الحالية: لا تُعد تشغيل ملفات الإنشاء أو الترحيل. يمكن تشغيل `supabase/verify_current_schema.sql` لأنه فحص قراءة فقط.
- عند إنشاء قاعدة جديدة: نفّذ الملف الموحد `supabase/schema.sql` فقط.
- ملفات `supabase/migrations` محفوظة كسجل تاريخي، ولا تُشغّل بعد المخطط الموحد.
- التفاصيل في `supabase/README.md`.

## النشر على Vercel

أضف متغيري البيئة السابقين إلى إعدادات المشروع، ثم أعد النشر دون رفع ملفات البناء أو البيئة المحلية.
## CSS organization

Global styling is split into ordered modules under `app/styles/`. `app/globals.css` is only the import manifest. Keep new rules in the relevant module and preserve the numeric import order.

