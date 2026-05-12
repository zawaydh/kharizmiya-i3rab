export default function Setup() {
  return (
    <div className="card">
      <h1 className="h1">إعدادات سريعة</h1>
      <p className="p">ملخص الخطوات حتى يعمل تسجيل الدخول وحفظ التقدم.</p>

      <div className="hr" />

      <h3 style={{margin:"0 0 8px"}}>Supabase</h3>
      <ol className="p" style={{lineHeight:1.9}}>
        <li>Authentication → Providers: Email <b>Enabled</b>.</li>
        <li>Authentication → URL Configuration: ضع Site URL على رابط Vercel بعد النشر.</li>
        <li>SQL Editor: نفّذ <code>supabase/schema.sql</code>.</li>
      </ol>

      <h3 style={{margin:"14px 0 8px"}}>Vercel</h3>
      <ol className="p" style={{lineHeight:1.9}}>
        <li>Project → Settings → Environment Variables: أضف
          <code> NEXT_PUBLIC_SUPABASE_URL </code> و <code> NEXT_PUBLIC_SUPABASE_ANON_KEY </code>.
        </li>
        <li>Redeploy.</li>
      </ol>

      <div className="hr" />
      <p className="small">استخدم فقط ANON/Publishable مع RLS. لا تضع Secret keys في المتصفح.</p>
    </div>
  );
}
