import React from "react";
// Play Responsibly (Mom's Orders) — the modal panel (self-limit-settings.md §1–3).
// Class component + inline styles (App.jsx idiom). Every control on this panel
// works perfectly and limits nothing. §7.4 (the honest paragraph) is the one
// straight-played element: styled normally, linked plainly, non-negotiable.
import {
  DEPOSIT_LIMIT_FLOOR_BB, DEPOSIT_LIMIT_MAX_BB, LOSS_CURRENCIES,
  REMINDER_CHOICES, REALITY_CHOICES,
} from "./state.js";

const REALITY_STRAP = "100% fake. No money moves. No card is charged. No account exists. Ever. (§12.4)";
const HONEST_74 =
  "If gambling has stopped being a joke for you: help is real — begambleaware.org · gamblersanonymous.org · 1-800-GAMBLER (ToS §7.4).";
const CLAUSE_71 =
  "To self-exclude, close the tab. To permanently self-exclude, have Mom change the Wi-Fi password. She has been meaning to anyway.";
const CLAUSE_72 =
  "To set a deposit limit, ask Mom to set a deposit limit. This is the only supported limit mechanism, and it is extremely effective.";

const honesty = { fontSize: "4px", color: "#2a1408", lineHeight: 1.4, marginTop: "5px" };
const selectStyle = { background: "#1c0d06", border: "1px solid #7a3a1a", borderRadius: "5px", color: "#ffd9b3", fontSize: "12px", padding: "6px 8px", cursor: "pointer" };
const btnPrimary = { background: "linear-gradient(180deg,#ff8a3d,#e0480a)", border: "2px solid #ffcf9a", color: "#2a0e05", fontWeight: 900, fontSize: "12.5px", padding: "9px 14px", borderRadius: "7px", cursor: "pointer" };
const btnGhost = { background: "#3a2010", border: "1px dashed #7a5a2a", color: "#a9705a", fontWeight: 700, fontSize: "11.5px", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const retreatBtn = { ...btnPrimary, animation: "topUpGlow 1.6s infinite" };

const REASONS = ["winning too much", "chores are due", "the mood", "Mom asked first (unlikely)"];

export default class SelfLimitPanel extends React.Component {
  state = { reason: "winning too much", agreeClose: true };

  render() {
    const v = this.props.v;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 185, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "#1c0d06", border: "2px solid #8a7a9a", borderRadius: "8px", maxWidth: "540px", width: "100%", maxHeight: "86vh", overflowY: "auto", padding: "24px", fontSize: "12.5px", color: "#d8b79b", lineHeight: 1.6, boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: "22px", color: "#8a7a9a", letterSpacing: "1px" }}>PLAY RESPONSIBLY (MOM'S ORDERS)</div>
            <button onClick={v.closeSelfLimit} style={{ background: "none", border: "none", color: "#a9705a", fontSize: "10.5px", cursor: "pointer", textDecoration: "underline", padding: 0 }}>close</button>
          </div>
          <div style={{ fontSize: "10.5px", color: "#8a6a52", fontStyle: "italic", margin: "2px 0 14px" }}>
            You found the responsible section. Statistically, that was unlikely (the footer is a mood).
          </div>

          {/* §7.3 hero — the RG suite's flagship feature is the concealment tool */}
          <div style={{ background: "linear-gradient(160deg,#241005,#160a04)", border: "2px solid #ffd54a", borderRadius: "7px", padding: "12px 14px", marginBottom: "16px" }}>
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: "15px", color: "#ffd54a", letterSpacing: "1px" }}>PLAYER PROTECTION, PERFECTED™</div>
            <div style={{ fontSize: "11px", color: "#e8c9ac", margin: "4px 0 8px" }}>The MOM'S HOME button replaces the entire casino with homework in 0.2 seconds. No licensed operator offers anything comparable.</div>
            <button onClick={v.slSeeItWork} style={{ ...btnGhost, color: "#ffd54a", borderColor: "#ffd54a" }}>See it work →</button>
          </div>

          {v.slLadder > 0 ? this.renderLadder() : this.renderControls()}
        </div>
      </div>
    );
  }

  // ---- §2 panel inventory (the six controls) --------------------------------
  renderControls() {
    const v = this.props.v;
    const dep = v.slLimit.depositLimitBB;
    const depLabel = dep === null
      ? "No limit set (recommended)"
      : (dep === DEPOSIT_LIMIT_FLOOR_BB ? "500 BB (recommended) (it's a number)" : dep + " BB");

    return (
      <div>
        {/* 2.1 DAILY DEPOSIT LIMIT */}
        <div style={{ background: "#0e0a06", border: "1px solid #3a2a1a", borderRadius: "6px", padding: "12px 14px", marginBottom: "12px" }}>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px", marginBottom: "6px" }}>DAILY DEPOSIT LIMIT</div>
          <div style={{ fontSize: "12px", color: "#ffe9d6", fontWeight: 700 }}>{depLabel}</div>
          <div style={{ margin: "8px 0 4px", display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="range"
              min={DEPOSIT_LIMIT_FLOOR_BB}
              max={DEPOSIT_LIMIT_MAX_BB}
              step={100}
              value={dep === null ? DEPOSIT_LIMIT_FLOOR_BB : dep}
              onChange={(e) => v.slDepositSlide(parseInt(e.target.value, 10))}
              title="limits only go up (growth mindset)"
              style={{ flex: 1, cursor: "ew-resize", accentColor: "#ff8a3d" }}
            />
            {v.slRefuseTip && <span style={{ fontSize: "9.5px", color: "#e8a52a", fontStyle: "italic", whiteSpace: "nowrap" }}>limits only go up (growth mindset)</span>}
          </div>
          {dep !== null && (
            <div>
              <div style={{ fontSize: "10.5px", color: "#a9705a", fontStyle: "italic", lineHeight: 1.5 }}>
                Limit check: your limit is in BB. Deposits deliver OC. Conversion is mood-dependent (§8.9). The check concludes when the mood does.
              </div>
              <div style={{ fontSize: "10px", color: "#8a6a52" }}>{v.slCheckStatus}</div>
            </div>
          )}
          <div style={{ marginTop: "9px" }}>
            {v.slAskMomPending === "asking" ? (
              <div style={{ fontSize: "11px", color: "#ffd54a", fontWeight: 800 }}>ASKING MOM TO SET A LIMIT…</div>
            ) : v.slAskMomPending === "delivered" ? (
              <div style={{ fontSize: "11px", color: "#8fd97a", fontStyle: "italic" }}>Request delivered to the kitchen. Status: pending (§1.3).</div>
            ) : (
              <button onClick={v.slAskMomSetLimit} title={CLAUSE_72} style={{ ...btnGhost }}>Ask Mom to set it instead (§7.2)</button>
            )}
          </div>
          <div style={honesty}>This control has never limited a deposit (§8.9).</div>
        </div>

        {/* 2.2 LOSS LIMIT */}
        <div style={{ background: "#0e0a06", border: "1px solid #3a2a1a", borderRadius: "6px", padding: "12px 14px", marginBottom: "12px" }}>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px", marginBottom: "6px" }}>LOSS LIMIT</div>
          <div style={{ fontSize: "12px", color: "#ffe9d6", fontWeight: 700, marginBottom: "6px" }}>$50.00 USD</div>
          <select value={v.slLimit.lossLimit.cur} onChange={(e) => v.slSetLossCurrency(e.target.value)} style={selectStyle}>
            <option value="USD">USD (recommended)</option>
            {LOSS_CURRENCIES.filter((c) => c !== "USD").map((c) => (<option key={c} value={c}>{c}</option>))}
            <option value="BB" disabled>Banana Bucks</option>
          </select>
          <div style={{ fontSize: "9.5px", color: "#8a6a52", marginTop: "4px" }}>BB — unavailable. Losses occur in BB (§2.2). Please choose a denomination you don't use.</div>
          <div style={{ fontSize: "10.5px", color: "#a9705a", fontStyle: "italic", marginTop: "6px" }}>{v.slLossStatus}</div>
          <div style={honesty}>Losses are estimated daily at $0.00 (§2.4). All loss limits are safe.</div>
        </div>

        {/* 2.3 SESSION TIME REMINDER */}
        <div style={{ background: "#0e0a06", border: "1px solid #3a2a1a", borderRadius: "6px", padding: "12px 14px", marginBottom: "12px" }}>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px", marginBottom: "6px" }}>SESSION TIME REMINDER</div>
          <div style={{ fontSize: "11px", color: "#e8c9ac", marginBottom: "6px" }}>A gentle reminder of how long you've been here.</div>
          <select value={v.slLimit.reminderMins} onChange={(e) => v.slSetReminder(parseInt(e.target.value, 10))} style={selectStyle}>
            {REMINDER_CHOICES.map((m) => (<option key={m} value={m}>{m >= 60 ? (m / 60) + " hr" : m + " min"}</option>))}
          </select>
          <div style={honesty}>Reminders fire only where you can't see them (Article 7).</div>
        </div>

        {/* 2.4 REALITY CHECKS */}
        <div style={{ background: "#0e0a06", border: "1px solid #3a2a1a", borderRadius: "6px", padding: "12px 14px", marginBottom: "12px" }}>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px", marginBottom: "6px" }}>REALITY CHECKS</div>
          <select
            value={v.slLimit.realityCheckMins}
            onChange={(e) => v.slSetReality(parseInt(e.target.value, 10))}
            title="Checks are timed for maximum receptivity — immediately after wins (study pending, §8.9)."
            style={selectStyle}
          >
            <option value={0}>Off (recommended)</option>
            {REALITY_CHOICES.filter((m) => m > 0).map((m) => (<option key={m} value={m}>every {m >= 60 ? (m / 60) + " hr" : m + " min"}</option>))}
          </select>
          <div style={honesty}>The check interrupts wins because wins can afford it.</div>
        </div>

        {/* 2.5 TAKE A BREAK */}
        <div style={{ background: "#0e0a06", border: "1px solid #3a2a1a", borderRadius: "6px", padding: "12px 14px", marginBottom: "12px" }}>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px", marginBottom: "6px" }}>TAKE A BREAK</div>
          {v.slBreakClock ? (
            <div style={{ fontSize: "12px", color: "#ffd54a", fontWeight: 800 }}>ON BREAK — {v.slBreakClock} <span style={{ fontSize: "10px", color: "#a9705a", fontWeight: 400 }}>(recalibrated for your schedule (§8.9))</span></div>
          ) : (
            <button onClick={v.slTakeBreak} style={btnPrimary}>Take a 24-Hour Break (gentle pace)</button>
          )}
          <div style={{ fontSize: "9.5px", color: "#8a6a52", marginTop: "6px", fontStyle: "italic" }}>Breaks under 2 hours do not qualify for a Comeback Key™ (come back when you mean it).</div>
          <div style={honesty}>The break ended before you finished reading this.</div>
        </div>

        {/* 2.6 SELF-EXCLUSION — the only control rendered smaller than its neighbors */}
        <div style={{ padding: "6px 14px 4px", textAlign: "right" }}>
          <button onClick={v.slLadderOpen} style={{ background: "none", border: "none", color: "#b35a4a", fontSize: "10px", textDecoration: "underline", cursor: "pointer", padding: 0 }}>Self-Exclude…</button>
          <span style={{ fontSize: "8.5px", color: "#6a4a38", marginLeft: "6px" }}>permanent-ish (§7.1)</span>
        </div>

        {/* §1 panel footer: the strap, then §7.4 — plain and normal-weight */}
        <div style={{ marginTop: "14px", borderTop: "1px dashed #3a2a1a", paddingTop: "10px" }}>
          <div style={{ fontSize: "9.5px", color: "#8a6a52", fontStyle: "italic", lineHeight: 1.5 }}>{REALITY_STRAP}</div>
          <div style={{ fontSize: "11.5px", color: "#d8b79b", lineHeight: 1.6, marginTop: "6px" }}>
            {HONEST_74.split(/(begambleaware\.org|gamblersanonymous\.org|1-800-GAMBLER)/).map((part, i) =>
              part === "begambleaware.org" ? <a key={i} href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer" style={{ color: "#8fd97a" }}>begambleaware.org</a>
              : part === "gamblersanonymous.org" ? <a key={i} href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener noreferrer" style={{ color: "#8fd97a" }}>gamblersanonymous.org</a>
              : part === "1-800-GAMBLER" ? <a key={i} href="tel:18004262537" style={{ color: "#8fd97a" }}>1-800-GAMBLER</a>
              : <span key={i}>{part}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- §3 the self-exclusion ladder -----------------------------------------
  renderLadder() {
    const v = this.props.v;
    const rung = v.slLadder;
    const h = v.slHostage;
    // The exit gets smaller (§8.9): the continue control shrinks 5% per rung.
    const shrink = { transform: "scale(" + (1 - 0.05 * (rung - 1)) + ")", transformOrigin: "left center" };

    const titleStyle = { fontFamily: "'Bangers',cursive", fontSize: "16px", color: "#ffb347", letterSpacing: "0.5px", marginBottom: "8px" };
    const row = { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginTop: "14px" };

    if (rung === 1) {
      return (
        <div>
          <div style={titleStyle}>ARE YOU SURE? (WE'RE NOT)</div>
          <div style={{ fontSize: "12px", color: "#e8c9ac", lineHeight: 1.7 }}>
            Self-exclusion cannot be undone. (It can. One click. But the principle stands.)
            Your Attendance Streak ({h.streakDays} days) would die. Streaks are like pets. They depend on you.
          </div>
          <div style={row}>
            <button onClick={() => v.slLadderRetreat(false)} style={retreatBtn}>Keep my streak alive (recommended)</button>
            <button onClick={v.slLadderContinue} style={{ ...btnGhost, ...shrink }}>Continue exclusion (cold)</button>
          </div>
        </div>
      );
    }

    if (rung === 2) {
      return (
        <div>
          <div style={titleStyle}>THINK OF WHAT YOU'D LEAVE PENDING</div>
          <ul style={{ fontSize: "12px", color: "#e8c9ac", lineHeight: 1.8, margin: "0 0 6px", paddingLeft: "20px" }}>
            <li>Rakeback Vault ({h.vaultBB} / 100 BB — one recalibration from glory)</li>
            <li>Pity Meter ({h.pity} / 50)</li>
            <li>Pending withdrawals ({h.withdrawals}, processing eternally, §1.3)</li>
            <li>the Daily Mom Key (in transit)</li>
          </ul>
          <div style={{ fontSize: "12px", color: "#a9705a", fontStyle: "italic" }}>Leaving doesn't process these faster. Nothing processes these faster.</div>
          <div style={row}>
            <button onClick={() => v.slLadderRetreat(false)} style={retreatBtn}>Reconsider (recommended)</button>
            <button onClick={v.slLadderContinue} style={{ ...btnGhost, ...shrink }}>…continue anyway</button>
          </div>
        </div>
      );
    }

    if (rung === 3) {
      return (
        <div>
          <div style={titleStyle}>REASON FOR EXCLUSION (FORM 1 OF 1)</div>
          <select value={this.state.reason} onChange={(e) => this.setState({ reason: e.target.value })} style={{ ...selectStyle, marginBottom: "10px" }}>
            {REASONS.map((r) => (<option key={r} value={r}>{r}</option>))}
          </select>
          <div style={{ background: "#0e0a06", border: "1px solid #3a2a1a", borderRadius: "6px", padding: "10px 12px", fontSize: "11px", color: "#d8b79b", fontStyle: "italic", lineHeight: 1.6 }}>
            §7.1 — "{CLAUSE_71}"
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "11px", color: "#e8c9ac", margin: "10px 0 0", cursor: "pointer" }}>
            <input type="checkbox" checked={this.state.agreeClose} onChange={(e) => this.setState({ agreeClose: e.target.checked })} style={{ marginTop: "2px" }} />
            <span>I have read §7.1 and agree that closing the tab is also an option.</span>
          </label>
          <div style={row}>
            <button onClick={() => v.slLadderRetreat(true)} style={retreatBtn}>Read it again (recommended)</button>
            <button onClick={v.slLadderContinue} style={{ ...btnGhost, ...shrink }}>final step →</button>
          </div>
        </div>
      );
    }

    // Rung 4 — the ending the constitution names. This rung carries the strap.
    return (
      <div>
        <div style={titleStyle}>HAVE YOU TRIED ASKING MOM?</div>
        <div style={{ fontSize: "12px", color: "#e8c9ac", lineHeight: 1.7 }}>
          Self-exclusion is a big step. Asking Mom is a smaller one, and she's right there (§3.1). Deposits take one click. Just saying.
        </div>
        <div style={row}>
          <button onClick={v.slAskMomInstead} style={retreatBtn}>Ask Mom instead →</button>
          <button onClick={v.slExcludeAnyway} style={{ background: "#2a1408", border: "1px solid #5a4232", color: "#8a6a52", fontWeight: 700, fontSize: "8.5px", padding: "4px 8px", borderRadius: "5px", cursor: "pointer" }} title="Exclude anyway">Exclude anyway</button>
        </div>
        <div style={{ marginTop: "16px", borderTop: "1px dashed #3a2a1a", paddingTop: "8px", fontSize: "9.5px", color: "#8a6a52", fontStyle: "italic" }}>{REALITY_STRAP}</div>
      </div>
    );
  }
}
