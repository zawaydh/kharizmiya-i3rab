import "./globals.css";

export const dynamic = "force-dynamic";
import Navbar from "./components/Navbar";
import { Suspense } from "react";

export const metadata = {
  title: "منصة خوارزمية الإعراب | مدرّب تفكير نحوي موجّه",
  description: "منصة خوارزمية الإعراب: مدرّب تفكير نحوي موجّه يبني الإعراب عبر قرارات مترابطة، ثم ينقل الطالب إلى التشكيل والضبط داخل النصوص.",
  keywords: ["خوارزمية الإعراب", "مدرب تفكير نحوي", "التفكير الإعرابي", "تعلم الإعراب", "شرح الإعراب", "تعلم النحو", "الجملة الاسمية", "الفعل المضارع", "المبتدأ والخبر"],
  icons: {
    icon: "/brand-icon.svg",
    shortcut: "/brand-icon.svg",
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
          <strong>جميع الحقوق محفوظة © 2026 منصة خوارزمية الإعراب</strong>
          <span>فكرة وإعداد وتطوير: فاطمة علي الزوايدة</span>
        </footer>
      </body>
    </html>
  );
}
