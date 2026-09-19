import React from "react";
import { MODEL_CARD } from "./ModelCard.js";

// The model card modal (ai-layer §2) — dismissable (integration-2026 §5:
// everything new defaults YES). Rendered over the MORAL EXPRESS tab; the card
// is displayed; the card is the disclosure.
export default function ModelCardModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#0a0e12", border: "2px solid #2a4a5a", borderRadius: "10px", maxWidth: "430px", width: "100%", padding: "24px", boxShadow: "0 0 50px rgba(127,212,255,0.15)" }}>
        <div style={{ fontFamily: "'Bangers',cursive", fontSize: "20px", color: "#7fd4ff", letterSpacing: "1px" }}>{MODEL_CARD.name}</div>
        <div style={{ fontSize: "10.5px", color: "#4a8aa8", fontStyle: "italic", margin: "2px 0 12px" }}>{MODEL_CARD.role}</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", fontSize: "11px", lineHeight: 1.5 }}>
          {MODEL_CARD.rows.map(([label, value]) => (
            <React.Fragment key={label}>
              <span style={{ color: "#4a8aa8", fontWeight: 700, whiteSpace: "nowrap" }}>{label}:</span>
              <span style={{ color: "#cfe4ff" }}>{value}</span>
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontSize: "8.5px", color: "rgba(127,212,255,0.4)", marginTop: "12px", fontStyle: "italic" }}>{MODEL_CARD.footer}</div>
        <button onClick={onClose} style={{ marginTop: "14px", background: "#12202a", border: "1px solid #2a4a5a", color: "#7fd4ff", fontWeight: 800, fontSize: "11px", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", width: "100%" }}>Close (the card remains the benchmark)</button>
      </div>
    </div>
  );
}
