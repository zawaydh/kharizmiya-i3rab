import "./globals.css";
import Navbar from "./components/Navbar";
import { Suspense } from "react";

export const metadata = {
  title: "خوارزمية الإعراب | تعلّم الإعراب خطوة بخطوة",
  description:
    "منصة تعليمية تفاعلية لتعلّم الإعراب عبر خوارزميات نحوية ومسارات بصرية وتلميحات موجهة خطوة بخطوة.",
  keywords: [
    "خوارزمية الإعراب",
    "تعلم الإعراب",
    "شرح الإعراب",
    "تعلم النحو",
    "إعراب الجملة الاسمية",
    "إعراب الجملة الفعلية",
    "المبتدأ والخبر",
    "الفاعل والمفعول به",
  ],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
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
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>

        <main className="container">{children}</main>

        <footer className="footer">
          © 2026 — خوارزمية الإعراب | جميع الحقوق محفوظة
        </footer>
      </body>
    </html>
  );
}
