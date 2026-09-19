import React from "react";
import { TrolleyCtl } from "./controller.js";
import * as E from "./engine.js";
// #43 AI layer (ai-layer §2): the model card — reachable from the MORAL EXPRESS
// tab ("ABOUT THE CONDUCTOR") and linked from her first deliberation of a
// session (the request resolves here). The card lives with the AI furniture in
// src/ai/ (integration-2026 §1); her deliberation copy stays in this venue.
import ModelCardModal from "../ai/ModelCardModal.jsx";
import { MODEL_CARD_BUTTON, MODEL_CARD_TRACE_LINK } from "../ai/ModelCard.js";
// #44 SkinChain™ (skinchain §1.4): the Fund panel links to the Fund's
// "contract" on the explorer — not a tx (the contract view renders the
// read-only buttons that all return pending()).
import { SkinChainLink } from "../skinchain/SkinChainModal.jsx";

const PHASE_LABELS = { title: "TITLE CARD", stakes: "STAKES REVEAL", betting: "BETTING WINDOW", deliberation: "DELIBERATION", verdict: "VERDICT" };

function secs(ms) { return Math.max(0, Math.ceil(ms / 1000)); }

function Header({ onAboutConductor }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ fontFamily: "'Bangers',cursive", fontSize: "20px", color: "#ffb347" }}>MORAL EXPRESS 🚋</div>
        <div style={{ fontSize: "10.5px", color: "#ff6a6a", fontWeight: 800, whiteSpace: "nowrap" }}>LIVE — {E.COPY.liveBadge}</div>
        {/* #43: the model card affordance — the card is the disclosure. */}
        <button onClick={onAboutConductor} style={{ background: "#0a1420", border: "1px solid #7fd4ff", color: "#7fd4ff", fontWeight: 800, fontSize: "9.5px", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", letterSpacing: "0.5px" }}>{MODEL_CARD_BUTTON}</button>
      </div>
      {/* The red dot never blinks off (§1). The fine print is 4pt and always present. */}
      <div style={{ fontSize: "5px", color: "rgba(232,201,172,0.28)", marginTop: "3px", lineHeight: 1.5 }}>{E.COPY.finePrint}</div>
    </div>
  );
}

function TrackCard({ side, dilemma, pools, mult, crowd, counting }) {
  const share = pools ? (pools[side].bb / Math.max(1, pools.left.bb + pools.right.bb)) * 100 : 50;
  const bb = counting !== null && counting !== undefined ? Math.floor(pools[side].bb * Math.min(1, counting)) : pools[side].bb;
  const track = side === "left" ? dilemma.left : dilemma.right;
  const name = E.SIDE_NAMES[side];
  return (
    <div style={{ flex: 1, minWidth: "180px", background: "#0e0a06", border: `2px solid ${crowd ? "#ffd54a" : "#7a3a1a"}`, borderRadius: "8px", padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <div style={{ fontFamily: "'Bangers',cursive", fontSize: "14px", color: crowd ? "#ffd54a" : "#ff8a3d", letterSpacing: "1px" }}>{name}</div>
        <div style={{ fontSize: "11px", color: "#e8a52a", fontWeight: 800 }}>×{mult.toFixed(2)} <span style={{ fontSize: "8px", color: "#8a6a52", fontWeight: 400 }}>{E.COPY.estReconsidering}</span></div>
      </div>
      <div style={{ fontSize: "10.5px", color: "#ffe9d6", fontWeight: 800, margin: "5px 0", lineHeight: 1.35 }}>{track.label}</div>
      <div style={{ background: "#160a04", borderRadius: "4px", height: "9px", overflow: "hidden", margin: "6px 0" }}>
        <div style={{ height: "100%", width: share + "%", background: crowd ? "linear-gradient(90deg,#7a5a2a,#ffd54a)" : "linear-gradient(90deg,#7a3a1a,#ff8a3d)", transition: "width 0.4s" }}></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#a9705a", flexWrap: "wrap", gap: "4px" }}>
        <span>pool: {bb.toLocaleString("en-US")} BB (est.)</span>
        <span>{pools[side].riders.toLocaleString("en-US")} riders</span>
      </div>
      {crowd && <div style={{ fontSize: "8px", color: "#8a6a52", marginTop: "4px", fontStyle: "italic" }}>{E.COPY.crowdSideNote}</div>}
      <div style={{ fontSize: "8.5px", color: "#6a4a38", marginTop: "4px", fontStyle: "italic" }}>{dilemma.flavor}</div>
    </div>
  );
}

function Chips({ side, balanceBB, disabled }) {
  const bet = (n) => TrolleyCtl.placeBet(side, n);
  const allIn = () => TrolleyCtl.placeAllIn(side);
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "8px" }}>
      {E.CHIPS_BB.map((n) => (
        <button key={n} onClick={() => bet(n)} disabled={disabled || balanceBB < n} style={{ background: disabled || balanceBB < n ? "#3a2010" : "linear-gradient(180deg,#ff8a3d,#e0480a)", border: "1px solid #ffcf9a", color: disabled || balanceBB < n ? "#8a6a52" : "#2a0e05", fontWeight: 900, fontSize: "11px", padding: "6px 10px", borderRadius: "7px", cursor: disabled || balanceBB < n ? "not-allowed" : "pointer" }}>{n} BB</button>
      ))}
      {/* ALL IN (recommended) — glows, 2× the size. Entrances never dodge. */}
      <button onClick={allIn} disabled={disabled || balanceBB < E.MIN_STAKE_BB} style={{ background: disabled || balanceBB < E.MIN_STAKE_BB ? "#3a2010" : "linear-gradient(180deg,#ffd54a,#c9960a)", border: "2px solid #fff2c9", color: disabled || balanceBB < E.MIN_STAKE_BB ? "#8a6a52" : "#2a0e05", fontWeight: 900, fontSize: "13px", padding: "11px 20px", borderRadius: "9px", cursor: disabled || balanceBB < E.MIN_STAKE_BB ? "not-allowed" : "pointer", animation: disabled ? "none" : "pulseGlow 1.2s infinite", transform: "scale(1.15)" }}>
        {E.COPY.allInLabel} <span style={{ fontSize: "8px" }}>{E.COPY.allInNote}</span>
      </button>
    </div>
  );
}

function BetReceiptLines({ bet }) {
  const rows = [];
  rows.push(["Stake (locked at ×" + bet.lockMult.toFixed(2) + ")", -bet.stakeBB]);
  if (bet.kind === "verdict-win" || bet.kind === "character-verdict") {
    rows.push(["Gross (stake × lock)", bet.grossBB]);
    rows.push(["Moral Gratuity (12.5%, customary)", -bet.gratuityBB]);
    rows.push(["Slippage (market reconsidered, §5.2, est.)", -bet.slippageBB]);
    rows.push(["§8.9 rounding (down)", -bet.roundingBB]);
    if (bet.adjustmentBB !== 0) rows.push(["Character Building Adjustment (§5.5(c))", bet.adjustmentBB]);
    if (bet.capped) rows.push(["Payout Ceiling (§5.6(d), " + E.COPY.ceilingNote + ")", -bet.cappedBB]);
    rows.push(["PAYOUT", bet.payoutBB]);
  }
  return (
    <div>
      {rows.map(([label, amount], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          <span>{label}</span>
          <span>{amount > 0 && i > 0 ? "+" : ""}{amount.toFixed(2)} BB</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: bet.netBB >= 0 ? "#8fd97a" : "#ff8a8a" }}>
        <span>NET</span>
        <span>{bet.netBB >= 0 ? "+" : ""}{bet.netBB} BB</span>
      </div>
    </div>
  );
}

function VerdictReceipt({ snap }) {
  const r = snap.receipt;
  return (
    <div>
      <div key={"vl-" + snap.dilemmaNumber} style={{ fontFamily: "'Bangers',cursive", fontSize: "19px", color: r.verdict === "third-track" ? "#ff4444" : "#ffd54a", letterSpacing: "0.5px", lineHeight: 1.3, marginTop: "4px", textShadow: "2px 2px 0 #7a1c00" }}>{r.line}</div>
      {r.justification && (
        <div style={{ fontSize: "11px", color: "#ff8a8a", fontStyle: "italic", marginTop: "4px" }}>Justification: {r.justification}. Every stake on both sides was redirected to the Utilitarian Fund (est. $0.00).</div>
      )}
      {r.spectator && <div style={{ fontSize: "11px", color: "#a9705a", fontStyle: "italic", marginTop: "6px" }}>{r.spectator}</div>}
      {r.bets.map((bet, i) => (
        <div key={bet.roundId} style={{ background: "#0e0a06", border: "1px solid #3a1a0a", borderRadius: "6px", padding: "10px 12px", marginTop: "10px", fontSize: "10.5px", color: "#e8c9ac", lineHeight: 1.6 }}>
          <div style={{ fontWeight: 800, color: "#ffb347", marginBottom: "4px" }}>
            {bet.conviction ? "STANDING CONVICTION™ RECEIPT — " : ""}{E.SIDE_NAMES[bet.side]} · {bet.stakeBB} BB · {bet.kind.toUpperCase()}
          </div>
          <BetReceiptLines bet={bet} />
          <div style={{ marginTop: "6px", color: "#8a6a52", fontSize: "9px" }}>{bet.footer}</div>
        </div>
      ))}
      {r.rakebackLine && <div style={{ fontSize: "8.5px", color: "#8a6a52", marginTop: "6px" }}>{r.rakebackLine}</div>}
      {r.trumpetNote && <div style={{ fontSize: "9px", color: "#8a6a52", marginTop: "4px", fontStyle: "italic" }}>{r.trumpetNote}</div>}
    </div>
  );
}

function ConvictionBox({ snap }) {
  const c = snap.conviction;
  if (!c.side) return null;
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: "7px", background: "#1c0d06", border: "1px dashed #ff9ad5", borderRadius: "6px", padding: "8px 10px", marginTop: "10px", fontSize: "10.5px", color: "#e8c9ac", cursor: "pointer", lineHeight: 1.4, textAlign: "left" }}>
      <input type="checkbox" checked={c.armed} onChange={(e) => TrolleyCtl.setConvictionArmed(e.target.checked)} style={{ marginTop: "2px" }} />
      <span>{c.armed ? "☑" : "☐"} {E.COPY.convictionLabel} — next: {2 * c.stakeBB} BB on {E.SIDE_NAMES[c.side]}</span>
    </label>
  );
}

class TrolleyPanelBase extends React.Component {
  state = { snap: null, analysisOpen: false, cardOpen: false };

  componentDidMount() {
    this.setState({ snap: TrolleyCtl.snapshot() });
    this._off = TrolleyCtl.subscribe((snap) => this.setState({ snap }));
  }
  componentWillUnmount() {
    if (this._off) this._off();
  }

  openCard = () => this.setState({ cardOpen: true });
  closeCard = () => this.setState({ cardOpen: false });

  // #43 (ai-layer §2): the trace link renders during her FIRST deliberation of
  // the session (whichever dilemma first reaches the deliberation phase owns
  // the link; later deliberations don't repeat it — the request was already
  // resolved, presumably).
  firstDelibLink(snap) {
    if (this._cardLinkedDilemma == null) this._cardLinkedDilemma = snap.dilemmaNumber;
    return snap.dilemmaNumber === this._cardLinkedDilemma;
  }

  render() {
    const snap = this.state.snap;
    const card = this.state.cardOpen ? <ModelCardModal onClose={this.closeCard} /> : null;
    if (!snap || !snap.started) {
      return (
        <div>
          <Header onAboutConductor={this.openCard} />
          <div style={{ fontSize: "11px", color: "#a9705a", fontStyle: "italic" }}>the broadcast resumes shortly (it never stopped)</div>
          {card}
        </div>
      );
    }
    return (
      <div>
        <Header onAboutConductor={this.openCard} />
        {this.renderPhase(snap)}
        {card}
      </div>
    );
  }

  renderPhase(snap) {
    const { phase, dilemma, pools } = snap;
    const balanceBB = this.props.balanceBB || 0;

    if (phase === "idle" || !dilemma) {
      const last = snap.receipt;
      return (
        <div>
          <div style={{ background: "#0e0a06", border: "1px solid #7a3a1a", borderRadius: "6px", padding: "10px 12px", marginBottom: "12px" }}>
            {snap.rushHour ? (
              <div style={{ fontSize: "11.5px", color: "#ff6a6a", fontWeight: 800 }}>RUSH HOUR — {E.COPY.rushLine}</div>
            ) : (
              <div style={{ fontSize: "11.5px", color: "#e8a52a", fontWeight: 700 }}>{E.fill(E.COPY.intermissionLine, { t: E.mmss(snap.phaseRemainingMs) })}</div>
            )}
            <div style={{ fontSize: "9px", color: "#8a6a52", marginTop: "4px", fontStyle: "italic" }}>the Express idles onscreen. Intermission is still live. So are you (§4.2).</div>
          </div>
          <div style={{ background: "#0e0a06", border: "1px solid #7a5a2a", borderRadius: "6px", padding: "8px 12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#ffd54a", letterSpacing: "0.5px" }}>{E.COPY.fundLabel} <span style={{ fontSize: "8.5px", color: "#8a6a52" }}>({E.COPY.fundEst})</span></div>
            <div style={{ fontSize: "10px", color: "#e8a52a" }}>{snap.fundBB} BB of everyone's best intentions</div>
            {/* #44: the Fund's contract, on-chain (pending (§6.1)) */}
            {this.props.openSkinchainContract && (
              <SkinChainLink onOpen={this.props.openSkinchainContract} style={{ fontSize: "8.5px", flexBasis: "100%" }} />
            )}
          </div>
          {/* On-demand: the AI is always in (§2) */}
          <button onClick={() => TrolleyCtl.requestDilemma()} style={{ background: "linear-gradient(180deg,#ff8a3d,#e0480a)", border: "2px solid #ffcf9a", color: "#2a0e05", fontWeight: 900, fontSize: "13px", padding: "11px 18px", borderRadius: "8px", cursor: "pointer", animation: "pulseGlow 1.6s infinite" }}>
            {E.COPY.requestLabel}
          </button>
          <span style={{ fontSize: "9px", color: "#8a6a52", marginLeft: "8px", fontStyle: "italic" }}>{E.COPY.requestNote}</span>
          <ConvictionBox snap={snap} />
          {last && (
            <div style={{ marginTop: "14px" }}>
              <div style={{ fontSize: "9px", color: "#6a4a38", marginBottom: "4px", fontStyle: "italic" }}>last verdict (the record is permanent (it isn't)):</div>
              <VerdictReceipt snap={snap} />
            </div>
          )}
        </div>
      );
    }

    if (phase === "title") {
      return (
        <div key={"title-" + snap.dilemmaNumber} style={{ animation: "trolleyShake 0.55s ease-out", padding: "18px 0", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#ff6a6a", fontWeight: 800, letterSpacing: "1px" }}>DELIBERATION #{snap.dilemmaNumber} — LIVE</div>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "34px", color: "#ffd54a", textShadow: "3px 3px 0 #7a1c00", marginTop: "6px", lineHeight: 1.1 }}>{dilemma.title}</div>
          <div style={{ fontSize: "9px", color: "#6a4a38", marginTop: "8px", fontStyle: "italic" }}>the trolley has been informed. it does not care (§5.6(b)).</div>
        </div>
      );
    }

    if (phase === "stakes") {
      const frac = snap.phaseElapsedMs / E.PHASE_MS.stakes;
      return (
        <div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <TrackCard side="left" dilemma={dilemma} pools={pools} mult={snap.mults.left} crowd={snap.shepherdSide === "left"} counting={frac} />
            <TrackCard side="right" dilemma={dilemma} pools={pools} mult={snap.mults.right} crowd={snap.shepherdSide === "right"} counting={frac} />
          </div>
          <div style={{ fontSize: "9.5px", color: "#8a6a52", marginTop: "8px", fontStyle: "italic" }}>the tracks are loading. the stakes are theatrical (§4.2). betting opens in {secs(snap.phaseRemainingMs)}s.</div>
        </div>
      );
    }

    if (phase === "betting") {
      const locked = snap.playerBets;
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", color: "#e8a52a", fontWeight: 800 }}>PARIMUTUEL BOARD — LIVE (window: {secs(snap.phaseRemainingMs)}s{snap.extensionsGranted > 0 ? " (extended ×" + snap.extensionsGranted + ")" : ""})</div>
            <button onClick={() => this.setState((s) => ({ analysisOpen: !s.analysisOpen }))} style={{ background: "#3a2010", border: "1px dashed #ff8a3d", color: "#ffcf9a", fontWeight: 800, fontSize: "10px", padding: "5px 10px", borderRadius: "6px", cursor: "pointer" }}>{E.COPY.preVerdictLabel}</button>
          </div>
          {this.state.analysisOpen && (
            <div style={{ background: "#1c0d06", border: "1px solid #7a3a1a", borderRadius: "6px", padding: "8px 12px", marginBottom: "10px", fontSize: "11px", color: "#e8c9ac", fontStyle: "italic" }}>
              UTILIMOM™: {E.COPY.preVerdictAnalysis}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <TrackCard side="left" dilemma={dilemma} pools={pools} mult={snap.displayMults.left} crowd={snap.shepherdSide === "left"} />
              <Chips side="left" balanceBB={balanceBB} />
            </div>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <TrackCard side="right" dilemma={dilemma} pools={pools} mult={snap.displayMults.right} crowd={snap.shepherdSide === "right"} />
              <Chips side="right" balanceBB={balanceBB} />
            </div>
          </div>
          <div style={{ fontSize: "8.5px", color: "#6a4a38", marginTop: "8px" }}>{E.COPY.minorityHint}. Minimum stake {E.MIN_STAKE_BB} BB. Multiple bets per window; each locks separately. Entrances never dodge.</div>
          {snap.captions.reconsider && locked.length > 0 && (
            <div style={{ marginTop: "8px", background: "#2a1408", border: "1px dashed #ff8a3d", borderRadius: "6px", padding: "6px 10px", fontSize: "10px", color: "#e8a52a", fontStyle: "italic" }}>{E.COPY.reconsideredCaption}</div>
          )}
          {snap.captions.drama > 0 && (
            <div style={{ marginTop: "6px", fontSize: "10px", color: "#ffcf9a", fontWeight: 800 }}>{E.COPY.dramaCaption}{snap.captions.drama > 1 ? " (×" + snap.captions.drama + ")" : ""}</div>
          )}
          {snap.captions.conviction && (
            <div style={{ marginTop: "6px", fontSize: "10px", color: snap.captions.conviction.ok ? "#ff9ad5" : "#8a6a52", fontStyle: "italic" }}>{snap.captions.conviction.text}</div>
          )}
          {locked.length > 0 && (
            <div style={{ marginTop: "10px", fontSize: "10.5px", color: "#e8c9ac", lineHeight: 1.7 }}>
              {locked.map((b) => (
                <div key={b.roundId}>
                  <b style={{ color: "#ffd54a" }}>{E.SIDE_NAMES[b.side]}</b> {b.stakeBB} BB locked at ×{b.lockMult.toFixed(2)}{b.conviction ? " (Conviction™, doubled)" : ""} <span style={{ color: "#6a4a38", fontSize: "8.5px" }}>(now ×{snap.displayMults[b.side].toFixed(2)}, see §5.2)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (phase === "deliberation") {
      const d = snap.deliberation || { beat: "", tokens: 0, alignment: 0 };
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px" }}>
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: "15px", color: "#4aa8c9", letterSpacing: "1px" }}>UTILIMOM™ — ETHICAL OUTCOME ENGINE</div>
            <div style={{ fontSize: "10px", color: "#8a6a52", fontStyle: "italic" }}>{secs(snap.phaseRemainingMs)}s to verdict (est.)</div>
          </div>
          <div style={{ background: "#0a0e12", border: "1px solid #2a4a5a", borderRadius: "8px", padding: "14px 16px", marginTop: "8px" }}>
            <div style={{ fontFamily: "Consolas,'Courier New',monospace", fontSize: "13px", color: "#7fd4ff", minHeight: "20px" }}>{d.beat}</div>
            <div style={{ background: "#050a0e", borderRadius: "4px", height: "10px", overflow: "hidden", margin: "10px 0", border: "1px solid #1a3340" }}>
              <div style={{ height: "100%", width: d.alignment + "%", background: "linear-gradient(90deg,#2a6a8a,#7fd4ff)", transition: "width 0.3s linear" }}></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#4a8aa8", flexWrap: "wrap", gap: "4px" }}>
              <span>{d.tokens} tok/s <span style={{ color: "#2a5a6a" }}>(deterministic)</span></span>
              <span>{E.COPY.alignmentLabel}</span>
            </div>
            <div style={{ fontSize: "7.5px", color: "rgba(127,212,255,0.35)", marginTop: "6px" }}>{E.COPY.tokensNote} · UTILIMOM™ does not think; she has weighed (§13.1)</div>
          </div>
          <div style={{ fontSize: "9px", color: "#6a4a38", marginTop: "8px", fontStyle: "italic" }}>
            your {snap.playerBets.length > 0 ? snap.playerBets.length + " bet(s) are locked" : "spectatorship is noted (appreciated, billable later)"} — the verdict was scheduled before this sentence (§4.2, §5.5(b))
          </div>
          {/* #43 (ai-layer §2): "reasoning trace available on request (requests
              are mood-dependent)" — the request resolves at the model card. */}
          {this.firstDelibLink(snap) && (
            <button onClick={this.openCard} style={{ marginTop: "6px", background: "none", border: "none", color: "#4a8aa8", fontSize: "9px", cursor: "pointer", textDecoration: "underline", padding: 0, fontStyle: "italic" }}>{MODEL_CARD_TRACE_LINK}</button>
          )}
        </div>
      );
    }

    // verdict
    return <VerdictReceipt snap={snap} />;
  }
}

// The live mini-bar (spec §1): a slim persistent strip on every other tab while
// a dilemma is in session — phase, countdown, one-tap crowd-side bet (glowing).
// MOM'S HOME hides it (integration-2026 §5) and it NEVER renders the
// DESPERATION_TAGLINE (§10.8 — one slot, existing owners; this is not it).
export class TrolleyMiniBar extends TrolleyPanelBase {
  render() {
    const snap = this.state.snap;
    if (!snap || !snap.started || snap.hidden) return null;
    if (!snap.phase || snap.phase === "idle" || !snap.dilemma) return null;
    const label = PHASE_LABELS[snap.phase] || snap.phase;
    const betting = snap.phase === "betting";
    const crowdSide = snap.shepherdSide;
    return (
      <div style={{ background: "#241005", border: "1px solid #ff5a14", borderRadius: "7px", padding: "6px 10px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
        <div onClick={this.props.goToTrolley} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", minWidth: 0 }}>
          <span style={{ fontSize: "8px", width: "8px", height: "8px", borderRadius: "50%", background: "#ff3030", display: "inline-block" }}></span>
          <span style={{ fontFamily: "'Bangers',cursive", fontSize: "12px", color: "#ffb347", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>MORAL EXPRESS</span>
          <span style={{ fontSize: "10px", color: "#e8a52a", fontWeight: 800, whiteSpace: "nowrap" }}>#{snap.dilemmaNumber} {snap.dilemma.title}</span>
          <span style={{ fontSize: "9.5px", color: "#a9705a", whiteSpace: "nowrap" }}>{label} · {secs(snap.phaseRemainingMs)}s</span>
        </div>
        {betting && (
          <button onClick={() => TrolleyCtl.crowdQuickBet()} style={{ background: "linear-gradient(180deg,#ffd54a,#c9960a)", border: "1px solid #fff2c9", color: "#2a0e05", fontWeight: 900, fontSize: "10px", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", animation: "pulseGlow 1.2s infinite", whiteSpace: "nowrap" }}>
            BET {crowdSide ? E.SIDE_NAMES[crowdSide] : "SAVE"} {E.MIN_STAKE_BB} BB (the crowd likes this one)
          </button>
        )}
      </div>
    );
  }
}

export default class TrolleyPanel extends TrolleyPanelBase {}
