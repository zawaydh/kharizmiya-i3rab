import "./globals.css";

export const dynamic = "force-dynamic";
import Navbar from "./components/Navbar";
import { Suspense } from "react";

export const metadata = {
  title: "خوارزمية الإعراب | مدرّب تفكير نحوي موجّه",
  description: "مدرّب تفكير نحوي موجّه يبني الإعراب عبر قرارات مترابطة؛ كل خطوة تفتح مسارًا وتغلق آخر حتى يصل الطالب إلى الإعراب الكامل.",
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
          © 2026 — جميع الحقوق محفوظة | فاطمة الزوايدة
        </footer>
      </body>
    </html>
  );
}
