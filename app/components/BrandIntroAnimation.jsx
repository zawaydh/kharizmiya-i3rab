"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "kharizmiya-brand-intro-played";

export default function BrandIntroAnimation() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = window.sessionStorage.getItem(SESSION_KEY) === "1";

    if (reduceMotion || alreadyPlayed) {
      if (!alreadyPlayed) window.sessionStorage.setItem(SESSION_KEY, "1");
      return undefined;
    }

    window.sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);

    const timer = window.setTimeout(() => setVisible(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="brand-intro" aria-hidden="true">
      <div className="brand-intro-stage">
        <div className="brand-intro-title" dir="rtl">
          <span className="brand-intro-khwarizmiya">خوارزمية</span>
          <span className="brand-intro-i3rab"> الإعراب</span>
        </div>

        <div className="brand-intro-logo-wrap">
          <span className="brand-intro-orbit" />
          <svg className="brand-intro-logo" viewBox="0 0 512 512" role="presentation">
            <defs>
              <linearGradient id="introTeal" x1="120" y1="80" x2="390" y2="420" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#35E6D3" />
                <stop offset="1" stopColor="#2F9E9E" />
              </linearGradient>
              <linearGradient id="introGold" x1="210" y1="200" x2="310" y2="315" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#FFE27A" />
                <stop offset="1" stopColor="#E0B84C" />
              </linearGradient>
            </defs>

            <path
              className="brand-intro-eye"
              d="M354 102 A176 176 0 1 0 382 376"
              fill="none"
              stroke="url(#introTeal)"
              strokeWidth="42"
              strokeLinecap="butt"
            />

            <circle className="brand-intro-kha-dot" cx="256" cy="256" r="34" fill="url(#introGold)" />
            <path className="brand-intro-diamond" d="M256 198 314 256 256 314 198 256Z" fill="url(#introGold)" />
          </svg>
          <span className="brand-intro-glow" />
        </div>

        <div className="brand-intro-tagline">مدرّب تفكير نحوي موجّه</div>
      </div>
    </div>
  );
}
