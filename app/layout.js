import "./globals.css";

export const metadata = {
  title: "خوارزمية الإعراب — متوسط",
  description: "تعلّم الإعراب بمنطق شجري مع حفظ التقدم لكل طالب.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="nav">
          <div className="nav-inner">
            <div className="brand">
              <span style={{display:"inline-block", width:12, height:12, borderRadius:6, background:"var(--accent)"}} />
              <span>خوارزمية الإعراب</span>
              <span className="badge">مستوى متوسط</span>
            </div>
            <div style={{display:"flex", gap:10}}>
              <a className="btn" href="/">الرئيسية</a>
              <a className="btn" href="/auth">تسجيل الدخول</a>
              <a className="btn" href="/dashboard">لوحتي</a>
            </div>
          </div>
        </div>

        <main className="container">{children}</main>

        <footer className="container" style={{opacity:0.85}}>
          <div className="hr" />
          <div className="small">© {new Date().getFullYear()} — خوارزمية الإعراب (MVP)</div>
        </footer>
      </body>
    </html>
  );
}
