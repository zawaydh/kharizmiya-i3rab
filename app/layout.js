import "./globals.css";
import Navbar from "./components/Navbar";
import { Suspense } from "react";

export const metadata = {
  title: "خوارزمية الإعراب",
  description: "موقع تعليمي تفاعلي لمسارات الإعراب",
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