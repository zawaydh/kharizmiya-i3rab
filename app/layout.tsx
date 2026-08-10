import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import "./globals.css";
import Navbar from "./components/Navbar";
import RouteAwareFooter from "./components/RouteAwareFooter";
import ClientErrorMonitor from "./components/ClientErrorMonitor";
import { PLATFORM_DESCRIPTION, PLATFORM_NAME, PLATFORM_TAGLINE } from "../lib/brand";

export const metadata: Metadata = {
  title: {
    default: PLATFORM_NAME,
    template: `%s | ${PLATFORM_NAME}`,
  },
  description: PLATFORM_DESCRIPTION,
  applicationName: PLATFORM_NAME,
  keywords: [PLATFORM_NAME, "إعرابك", PLATFORM_TAGLINE, "خوارزمية الإعراب", "التفكير النحوي", "التفكير الإعرابي", "تعلم الإعراب", "شرح الإعراب", "تعلم النحو", "الجملة الاسمية", "الفعل المضارع", "المبتدأ والخبر"],
  icons: {
    icon: "/brand-icon.svg",
    shortcut: "/brand-icon.svg",
    apple: "/brand-icon.svg",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#081722",
};

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl">
      <body className="platform-body">
        <ClientErrorMonitor />
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main className="container platform-main">{children}</main>
        <RouteAwareFooter />
      </body>
    </html>
  );
}
