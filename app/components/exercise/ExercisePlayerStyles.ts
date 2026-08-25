import type { CSSProperties } from "react";

export const box: CSSProperties = {
  padding: 16,
  border: "1px solid #d8dee7",
  borderRadius: 18,
  marginBottom: 16,
  background: "#ffffff",
  color: "#172033",
  boxShadow: "0 16px 40px rgba(0,0,0,.18)",
};



export const ghostBtn: CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid #8795a7",
  cursor: "pointer",
  background: "#ffffff",
  color: "#172033",
  fontWeight: 800,
};

export const primaryNavBtn: CSSProperties = {
  padding: "14px 22px",
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 16,
  color: "#ffffff",
  background: "#137f7a",
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
