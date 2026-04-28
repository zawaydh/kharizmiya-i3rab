"use client";

import React from "react";

type AppShellProps = {
  title?: string;
  current?: "home" | "learn" | "practice" | "quiz" | "paths" | "dashboard";
  children: React.ReactNode;
};

export default function AppShell({ title, children }: AppShellProps) {
  return (
    <div style={pageWrap}>
      <main style={mainWrap}>
        {title ? <h1 style={pageTitle}>{title}</h1> : null}
        {children}
      </main>
    </div>
  );
}

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
};

const mainWrap: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: 16,
  boxSizing: "border-box",
};

const pageTitle: React.CSSProperties = {
  margin: "8px 0 16px",
  color: "#fff",
  fontSize: 28,
  lineHeight: 1.3,
};