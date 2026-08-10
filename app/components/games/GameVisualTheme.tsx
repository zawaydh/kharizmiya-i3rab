"use client";

import React from "react";

export type GameThemeName = "place" | "team" | "mafool" | "mark" | "speech";

type ThemeTokens = {
  accent: string;
  strong: string;
  soft: string;
  warm: string;
  surface: string;
};

const THEMES: Record<GameThemeName, ThemeTokens> = {
  place: {
    accent: "#1679a7",
    strong: "#0e5d83",
    soft: "#edf8fc",
    warm: "#fff6d8",
    surface: "linear-gradient(180deg, #fff 0%, #fbfdff 64%, #f2f9fc 100%)",
  },
  team: {
    accent: "#7557b7",
    strong: "#584099",
    soft: "#f4efff",
    warm: "#eafaf7",
    surface: "linear-gradient(155deg, #fff 0%, #fcfaff 58%, #f5f1ff 100%)",
  },
  mafool: {
    accent: "#a65f28",
    strong: "#7c421b",
    soft: "#fff5ea",
    warm: "#fff9df",
    surface: "linear-gradient(150deg, #fff 0%, #fffbf5 58%, #fff5e8 100%)",
  },
  mark: {
    accent: "#16806f",
    strong: "#0d6558",
    soft: "#eaf9f5",
    warm: "#fff5cf",
    surface: "linear-gradient(155deg, #fff 0%, #f8fffc 55%, #eaf9f5 100%)",
  },
  speech: {
    accent: "#5d5ab0",
    strong: "#46428f",
    soft: "#f0efff",
    warm: "#fff2f7",
    surface: "linear-gradient(155deg, #fff 0%, #fbfaff 65%, #f0efff 100%)",
  },
};

export function gameThemeVars(name: GameThemeName): React.CSSProperties {
  const theme = THEMES[name];
  return {
    "--game-accent": theme.accent,
    "--game-accent-strong": theme.strong,
    "--game-soft": theme.soft,
    "--game-warm": theme.warm,
  } as React.CSSProperties;
}

export function gameShellStyle(name: GameThemeName): React.CSSProperties {
  const theme = THEMES[name];
  return {
    background: theme.surface,
    borderColor: `color-mix(in srgb, ${theme.accent} 28%, var(--clean-border))`,
  };
}

export const gameKickerStyle: React.CSSProperties = { color: "var(--game-accent-strong)" };
export const gameBackLinkStyle: React.CSSProperties = {
  color: "var(--game-accent-strong)",
  borderColor: "var(--game-accent)",
};
export const gameCompassStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, var(--game-soft), #fff)",
  borderColor: "color-mix(in srgb, var(--game-accent) 34%, var(--clean-border))",
};
export const gameProgressStyle: React.CSSProperties = { background: "var(--game-accent)" };
export const gameWarmCardStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, var(--game-warm), #fff)",
  borderColor: "color-mix(in srgb, var(--game-accent) 42%, var(--clean-border))",
};
export const gameTargetStyle: React.CSSProperties = {
  paddingInline: 3,
  color: "var(--game-accent-strong)",
  background: "transparent",
  borderBottom: "3px solid var(--game-accent)",
  fontWeight: 900,
};

export function GameSuccessPop({ inline = false }: { inline?: boolean }) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const element = ref.current;
   const prefersReducedMotion =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (
  !element ||
  prefersReducedMotion ||
  typeof element.animate !== "function"
) {
  return;
}
    element.animate(
      [
        { opacity: 0, transform: "translateY(8px) scale(.55)" },
        { opacity: 1, transform: "translateY(-9px) scale(1.18)", offset: 0.18 },
        { opacity: 1, transform: "translateY(-4px) scale(1)", offset: 0.38 },
        { opacity: 0.88, transform: "translateY(-10px) scale(1.04)", offset: 0.72 },
        { opacity: 0, transform: "translateY(-18px) scale(.92)" },
      ],
      { duration: 1280, easing: "ease-out", fill: "forwards" },
    );
  }, []);

  return (
    <span
      ref={ref}
      className={inline ? "game-success-pop game-success-pop-inline" : "game-success-pop"}
      aria-hidden="true"
      style={{
        width: inline ? 28 : 52,
        height: inline ? 28 : 52,
        display: "inline-grid",
        placeItems: "center",
        marginInline: inline ? 5 : 0,
        color: "#fff",
        background: "var(--game-accent, var(--clean-success))",
        border: "2px solid rgba(255,255,255,.84)",
        borderRadius: "50%",
        boxShadow: "0 10px 24px rgba(18,79,67,.18)",
        fontSize: inline ? 16 : 29,
        fontWeight: 900,
        verticalAlign: inline ? "middle" : undefined,
        pointerEvents: "none",
      }}
    >
      ✓
    </span>
  );
}
