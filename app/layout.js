import "./globals.css";

export const dynamic = "force-dynamic";
import Navbar from "./components/Navbar";
import { Suspense } from "react";

export const metadata = {
  title: "خوارزمية الإعراب | تعلّم الإعراب خطوة بخطوة",
  description: "منصة تعليمية تفاعلية تساعد الطلاب على فهم الإعراب عبر مسارات نحوية بصرية، تلميحات موجّهة، وتدريب خطوة بخطوة.",
  keywords: ["خوارزمية الإعراب", "تعلم الإعراب", "شرح الإعراب", "تعلم النحو", "الجملة الاسمية", "الفعل المضارع", "المبتدأ والخبر"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/brand-icon.svg",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#06101C",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>

        <main className="container">{children}</main>

        <footer className="footer">
          © 2026 — جميع الحقوق محفوظة | فاطمة الزوايدة
        </footer>
      </body>
    </html>
  );
}
