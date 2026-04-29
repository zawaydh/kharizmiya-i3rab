import "./globals.css";
import Navbar from "./components/Navbar";
import { Suspense } from "react";

export const metadata = {
  title: "تعلم الإعراب خطوة بخطوة | خوارزمية الإعراب",
  description:
    "منصة تعليمية تفاعلية تساعد الطلاب على فهم الإعراب عبر خوارزميات نحوية ومسارات بصرية وتدريب خطوة بخطوة.",
  keywords: [
    "الإعراب",
    "تعلم الإعراب",
    "شرح الإعراب",
    "تعلم النحو",
    "إعراب الجمل",
    "الجملة الاسمية",
    "الفعل الماضي",
    "الفعل المضارع",
    "المبتدأ والخبر",
    "خوارزمية الإعراب"
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>

        {/* 👇 الحل هنا */}
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