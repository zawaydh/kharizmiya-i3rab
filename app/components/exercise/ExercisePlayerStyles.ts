import type { CSSProperties } from "react";

export const box: CSSProperties = {
  padding: 16,
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 18,
  marginBottom: 16,
  background: "linear-gradient(180deg, rgba(15,23,42,.88), rgba(15,23,42,.72))",
  color: "#eef4ff",
  boxShadow: "0 16px 40px rgba(0,0,0,.18)",
};

export const answerBtn: CSSProperties = {
  display: "block",
  width: "100%",
  marginBottom: 8,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.14)",
  textAlign: "right",
  cursor: "pointer",
  background: "rgba(255,255,255,.05)",
  color: "#eef4ff",
  fontWeight: 800,
};

export const ghostBtn: CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.18)",
  cursor: "pointer",
  background: "rgba(255,255,255,.06)",
  color: "#eef4ff",
  fontWeight: 800,
};

export const primaryNavBtn: CSSProperties = {
  padding: "14px 22px",
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 16,
  color: "#04111d",
  background: "linear-gradient(135deg,#22c55e,#67e8f9)",
  boxShadow: "0 10px 30px rgba(0,0,0,.12)",
};

export const toastStyle: CSSProperties = {
  position: "fixed",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#0f172a",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 12,
  zIndex: 999,
  fontWeight: 800,
  boxShadow: "0 10px 30px rgba(0,0,0,.25)",
};
