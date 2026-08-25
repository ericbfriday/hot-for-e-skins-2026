import React from "react";
import { Ticker } from "./controller.js";
import { VISIBLE_CAP, SYSTEM_COLOR } from "./engine.js";
import { DESPERATION_TAGLINE, DESPERATION_TAGLINE_FOOTNOTE } from "../spine/constants.js";

function hhmm(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return p(d.getHours()) + ":" + p(d.getMinutes());
}

// The LIVE WINS sidebar. Class component + inline styles (App.jsx idiom).
// Desperation subtitle honors integration §6's one-prominent-slot rule: the
// roulette streak banner owns the tagline while the roulette tab is active,
// the ticker subtitle otherwise.
export default class TickerPanel extends React.Component {
  state = { snap: null };

  componentDidMount() {
    this.setState({ snap: Ticker.snapshot() });
    this._off = Ticker.subscribe((snap) => this.setState({ snap }));
    this._tick = setInterval(() => this.setState({ snap: Ticker.snapshot() }), 20000);
  }

  componentWillUnmount() {
    if (this._off) this._off();
    clearInterval(this._tick);
  }

  render() {
    const snap = this.state.snap;
    if (!snap) return null;
    const rouletteOwnsTagline = this.props.activeTab === "roulette";
    const showSubtitle = snap.desperate && !rouletteOwnsTagline;
    const visible = snap.entries.slice(0, VISIBLE_CAP + 1); // 8 entries; divider may add a row

    return (
      <div style={{ borderRight: "2px solid #3a1206", padding: "14px", minHeight: "520px", background: "#170a05" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff3030", animation: "blink 1s infinite" }}></div>
          <div style={{ fontFamily: "'Bangers',cursive", color: "#ff8a3d", fontSize: "14px", letterSpacing: "1px" }}>LIVE WINS</div>
        </div>

        {showSubtitle && (
          <div style={{ margin: "-4px 0 10px" }}>
            <div style={{ fontSize: "10.5px", color: "#e24a4a", fontStyle: "italic", fontWeight: 700 }}>{DESPERATION_TAGLINE}</div>
            <div style={{ fontSize: "7.5px", color: SYSTEM_COLOR }}>{DESPERATION_TAGLINE_FOOTNOTE}</div>
          </div>
        )}

        <div title={snap.winnersHover} style={{ fontSize: "9.5px", color: "#a9705a", marginBottom: "8px", cursor: "help" }}>
          TODAY'S WINNERS: {snap.winnersToday.toLocaleString("en-US")}
        </div>

        {/* MARKET (HFES-10) — the real composite since #27 (marketplace §10):
            running-max display, down-ticks are display errors (§8.9). */}
        <div style={{ background: "#0e0a06", border: "1px solid #3a2a1a", borderRadius: "5px", padding: "6px 8px", marginBottom: "10px", fontSize: "10px", color: "#8fd97a", fontWeight: 700 }}>
          {snap.marketLabel}
          {snap.marketDelta && <div style={{ fontSize: "8.5px", color: "#a9705a", fontWeight: 400 }}>{snap.marketDelta}</div>}
          {snap.marketFootnote && <div style={{ fontSize: "7px", color: "rgba(232,201,172,0.14)", fontWeight: 400, marginTop: "2px" }}>{snap.marketFootnote}</div>}
        </div>

        {visible.map((e) => {
          if (e.divider) {
            return (
              <div key={e.id} style={{ borderTop: "1px dashed #7a3a1a", margin: "8px 0", paddingTop: "8px", fontSize: "10px", color: "#e8a52a", fontStyle: "italic" }}>
                {e.text}
              </div>
            );
          }
          const rowBorder = e.flourish ? { border: `1px solid ${e.accent || "#ff4444"}`, boxShadow: `0 0 8px ${(e.accent || "#ff4444") + "55"}` } : { border: "1px solid #3a1a0a" };
          return (
            <div key={e.id} style={{ background: "#241005", borderRadius: "5px", padding: "8px 10px", marginBottom: "7px", fontSize: "11.5px", color: "#e8c9ac", lineHeight: 1.4, display: "flex", gap: "8px", alignItems: "flex-start", ...rowBorder }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {e.system ? (
                  <span style={{ color: SYSTEM_COLOR, fontStyle: "italic" }}>{e.text}</span>
                ) : (
                  <span>
                    <b style={{ color: e.color || "#e8c9ac" }}>{e.badge ? e.badge + " " : ""}{e.name}</b>
                    {e.isYou && <span style={{ color: "#8a6a52", fontSize: "9.5px" }}> {e.youLabel || "(you)"}</span>}
                    {" "}{e.text}{e.flourish ? " ‼" : ""}
                  </span>
                )}
                {e.note && <div style={{ fontSize: "7.5px", color: "rgba(232,201,172,0.14)", marginTop: "2px" }}>{e.note}</div>}
              </div>
              <span style={{ fontSize: "8px", color: SYSTEM_COLOR, whiteSpace: "nowrap" }}>{hhmm(e.ts)}</span>
            </div>
          );
        })}

        <div style={{ fontSize: "7.5px", color: "rgba(232,201,172,0.14)", marginTop: "10px", lineHeight: 1.5 }}>
          {snap.footer}
        </div>
      </div>
    );
  }
}
