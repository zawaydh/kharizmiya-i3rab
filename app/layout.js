import "./globals.css";
import Navbar from "./components/Navbar";
import { Suspense } from "react";

export const metadata = {
  title: "تعلم الإعراب خطوة بخطوة | خوارزمية الإعراب",
  description: "منصة تعليمية تفاعلية تساعد الطلاب على فهم الإعراب عبر مسارات بصرية وخوارزميات نحوية وتلميحات موجهة.",
  keywords: ["الإعراب", "تعلم الإعراب", "شرح الإعراب", "تعلم النحو", "خوارزمية الإعراب", "الجملة الاسمية", "الفعل المضارع"],
  icons: {
    icon: "/favicon.svg",
  },
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