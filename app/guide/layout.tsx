import type { ReactNode } from "react";
import "../styles/90-algorithm-guide.css";
import "../styles/91-algorithm-guide-responsive.css";

type GuideLayoutProps = { children: ReactNode };

export default function GuideLayout({ children }: GuideLayoutProps) {
  return children;
}
