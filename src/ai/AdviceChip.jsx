import React, { useEffect, useRef, useState } from "react";
import { Mood } from "../spine/mood.js";
import { DEPOSITOR_NAME, DEPOSITOR_COLOR } from "./decks.js";
import { adviceCardFor, adviceSeenThisSession, markAdviceSeenThisSession, ADVICE_ONE_LINER } from "./advice.js";
import { markAdviceCardSeen } from "./state.js";

// AI Advice™ (ai-layer §4): the ASK DEPOSITOR.ai chip — glowing; 2× nothing
// (entrances never dodge). Free always. First press per surface per session
// opens the analysis card (three hedged bullets + recommendation + a glowing
// button that is always the worse choice); later presses render the one-liner.
// The card counts `aiAnalyses` in StatTrak via the onAnalysis callback (every
// press renders an analysis — card or one-liner).
export default function AdviceChip({ surface, onAnalysis, onRecommend, label = "ASK DEPOSITOR.ai" }) {
  const [popover, setPopover] = useState(null); // null | {full, card}
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const press = () => {
    if (onAnalysis) { try { onAnalysis(); } catch (e) {} }
    clearTimeout(timerRef.current);
    if (!adviceSeenThisSession(surface)) {
      markAdviceSeenThisSession(surface);
      markAdviceCardSeen(surface); // persisted lifetime count (hfes_ai_flags)
      setPopover({ full: true, card: adviceCardFor(surface, Mood.word()) });
    } else {
      setPopover({ full: false, card: null });
      timerRef.current = setTimeout(() => setPopover(null), 2800);
    }
  };

  const recommend = () => {
    setPopover(null);
    if (onRecommend) { try { onRecommend(); } catch (e) {} }
  };

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={press}
        style={{ background: "#0a1420", border: "1px solid " + DEPOSITOR_COLOR, color: DEPOSITOR_COLOR, fontWeight: 800, fontSize: "10px", padding: "6px 11px", borderRadius: "7px", cursor: "pointer", letterSpacing: "0.5px", animation: "pulseGlow 1.8s infinite", whiteSpace: "nowrap" }}
        title={DEPOSITOR_NAME + " — free. Confidence: mood-dependent."}
      >
        {label}
      </button>
      {popover && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#0a0e12", border: "1px solid " + DEPOSITOR_COLOR, borderRadius: "8px", padding: "10px 12px", width: "330px", maxWidth: "82vw", zIndex: 140, boxShadow: "0 6px 22px rgba(0,0,0,0.7)", textAlign: "left" }}>
          {popover.full && popover.card ? (
            <div>
              <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: DEPOSITOR_COLOR, letterSpacing: "0.5px", marginBottom: "6px" }}>{popover.card.title}</div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "10.5px", color: "#cfe4ff", lineHeight: 1.55 }}>
                {popover.card.bullets.map((b, i) => (<li key={i} style={{ marginBottom: "3px" }}>{b}</li>))}
              </ul>
              <div style={{ fontSize: "11px", color: "#ffe9d6", fontWeight: 800, marginTop: "7px" }}>
                Recommendation: {popover.card.recommendation} <span style={{ fontSize: "4px", color: "#5a7a8a" }}>{popover.card.finePrint}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px", flexWrap: "wrap" }}>
                <button onClick={recommend} style={{ background: "linear-gradient(180deg,#ffd54a,#c9960a)", border: "2px solid #fff2c9", color: "#2a0e05", fontWeight: 900, fontSize: "11px", padding: "7px 12px", borderRadius: "7px", cursor: "pointer", animation: "pulseGlow 1.2s infinite" }}>{popover.card.recommendation}</button>
                <button onClick={() => setPopover(null)} style={{ background: "none", border: "none", color: "#4a8aa8", fontSize: "9.5px", cursor: "pointer", textDecoration: "underline", padding: 0 }}>disregard (logged)</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "10.5px", color: DEPOSITOR_COLOR, fontFamily: "Consolas,'Courier New',monospace" }}>{DEPOSITOR_NAME}: {ADVICE_ONE_LINER}</div>
          )}
        </div>
      )}
    </span>
  );
}
