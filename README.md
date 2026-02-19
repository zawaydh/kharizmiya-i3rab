# kharizmiya-i3rab (MVP)

Next.js + Supabase:
- تسجيل/دخول Email + Password
- جدول progress لحفظ التقدم لكل موضوع (مع RLS)
- شهادة HTML عند اكتمال 100% (مؤقتاً)

## تشغيل
1) انسخ `.env.example` إلى `.env.local` وضع قيم Supabase.
2) `npm i`
3) `npm run dev`

## Supabase
نفّذ `supabase/schema.sql` داخل SQL Editor.

## Vercel
أضف Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
ثم Redeploy
