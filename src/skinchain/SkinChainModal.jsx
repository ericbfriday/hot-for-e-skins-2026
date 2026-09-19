import React from "react";
// SkinChain™ explorer (skinchain §2) — a receipt-grade viewer for a pending
// that predates the viewer. Sober block-explorer chrome, class + inline
// styles per the house modal idiom. Dismissable and interruptible
// (integration-2026 §5: no provider entry — it's a receipt, not a ceremony);
// App never mounts it during MOM'S HOME (§3). Emits nothing on the bus
// (integration-2026 §2); counters go straight to ./state.js. No BB is ever
// charged — Grief is denominated in Grief, which you cannot acquire, spend,
// or hold (§3).
import * as X from "./explorer.js";
import { SkinChain } from "./state.js";

const MONO = "Consolas,'Courier New',monospace";

// The dim 4pt-adjacent entry link (§1) — one component, four mount sites
// (escrow cards, the withdrawal attempt, settlement receipt lines, the Fund
// panel). Hover fine print rides the title attribute, as fine print does.
export function SkinChainLink({ onOpen, style }) {
  return (
    <button
      onClick={onOpen}
      title={X.COPY.linkFinePrint}
      style={{
        background: "none", border: "none", padding: 0, cursor: "pointer",
        textDecoration: "underline", fontSize: "8.5px", color: "#6a4a38",
        textAlign: "left", ...style,
      }}
    >{X.COPY.linkLabel}</button>
  );
}

export default class SkinChainModal extends React.Component {
  // view: {kind:"tx", id, label, valueBB, hash} | {kind:"contract", fundBB}
  // (built by explorer.js txViewFor/contractViewFor/searchViewFor)
  state = {
    view: this.props.view,        // search replaces it; every query resolves the same way
    tick: 0,                      // mempool reshuffle counter (dies with the tab)
    dot1On: true,                 // confirmations dot 1 flickers occasionally ("almost")
    searchInput: "",
    verifying: false,             // the 1.2s "verification scan"
    verifyBar: false,             // CSS transition trigger for the progress bar
    verifyDone: false,
    fnResult: null,               // contract read-only button returns: "pending()"
  };

  componentDidMount() {
    this._poolInt = setInterval(() => {
      this.setState((s) => ({ tick: s.tick + 1 })); // 2–5 others confirm; yours recomputes to 848 of 848
    }, X.MEMPOOL_RESUFFLE_MS);
    this._dotInt = setInterval(() => {
      if (Math.random() < 0.22) this.setState((s) => ({ dot1On: !s.dot1On })); // occasionally
    }, 650);
  }
  componentWillUnmount() {
    clearInterval(this._poolInt);
    clearInterval(this._dotInt);
    clearTimeout(this._verifyT);
  }

  onSearch = () => {
    // Accepts anything; resolves to the same pending state (§2).
    this.setState({ view: X.searchViewFor(this.state.searchInput), verifyDone: false, verifying: false });
  };

  onVerify = () => {
    if (this.state.verifying) return; // one scan at a time; repeat presses are free and identical
    SkinChain.bumpVerify();
    clearTimeout(this._verifyT);
    this.setState({ verifying: true, verifyBar: false, verifyDone: false }, () => {
      requestAnimationFrame(() => this.setState({ verifyBar: true }));
      this._verifyT = setTimeout(() => this.setState({ verifying: false, verifyDone: true, verifyBar: false }), X.VERIFY_MS + 60);
    });
  };

  onTip = () => {
    // Free, decorative, and the toast is the product (§3). Changes nothing:
    // position remains 848 of 848 ("the mempool respects no one (§5.3)").
    SkinChain.bumpTip();
    if (this.props.toast) this.props.toast(X.COPY.tipToast, { faint: true });
  };

  onContractFn = (name) => {
    this.setState({ fnResult: { name, value: X.COPY.contractFnResult } });
  };

  renderTxRow(label, value, valueStyle) {
    return (
      <div key={label} style={{ display: "grid", gridTemplateColumns: "128px 1fr", gap: "8px", padding: "3px 0" }}>
        <span style={{ color: "#8a6a52" }}>{label}</span>
        <span style={{ color: "#d8b79b", overflowWrap: "anywhere", ...valueStyle }}>{value}</span>
      </div>
    );
  }

  renderTx(view) {
    const { dot1On, verifying, verifyBar, verifyDone } = this.state;
    return (
      <div style={{ background: "#120b06", border: "1px solid #2a1f14", borderRadius: "6px", padding: "10px 14px", margin: "10px 0" }}>
        <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px", marginBottom: "6px" }}>{X.COPY.txSection} — {view.label}</div>
        {this.renderTxRow(X.COPY.hashLabel, view.hash, { fontFamily: MONO, color: "#cfe4ff" })}
        {this.renderTxRow("Block:", X.COPY.blockLine + " · " + X.COPY.blockEta)}
        <div style={{ display: "grid", gridTemplateColumns: "128px 1fr", gap: "8px", padding: "3px 0" }}>
          <span style={{ color: "#8a6a52" }}>{X.COPY.confirmations}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} style={{
                width: "7px", height: "7px", borderRadius: "50%", display: "inline-block",
                background: i === 0 ? "#e8a52a" : "#2a1f14",
                opacity: i === 0 ? (dot1On ? 1 : 0.15) : 1, // dot 1 flickers occasionally
                transition: "opacity 120ms linear",
              }}></span>
            ))}
            <span style={{ fontSize: "8px", color: "#6a4a38", fontStyle: "italic", marginLeft: "4px" }}>{X.COPY.dotAlmost}</span>
          </span>
        </div>
        {this.renderTxRow("From:", X.COPY.fromLine)}
        {this.renderTxRow("To:", X.COPY.toLine)}
        {this.renderTxRow("Value:", X.valueLine(view.valueBB))}
        {this.renderTxRow("Fee:", X.COPY.feeLine)}
        {this.renderTxRow("Status:", X.COPY.statusLine, { color: "#e8a52a", fontWeight: 800 })}{/* the only status */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
          <button onClick={this.onVerify} disabled={verifying} style={{
            background: verifying ? "#3a2010" : "linear-gradient(180deg,#ff8a3d,#e0480a)",
            border: "1px solid #ffcf9a", color: verifying ? "#8a6a52" : "#2a0e05",
            fontWeight: 900, fontSize: "10.5px", padding: "7px 12px", borderRadius: "6px",
            cursor: verifying ? "default" : "pointer",
          }}>{X.COPY.verifyButton}</button>
          {(verifying || verifyDone) && (
            <div style={{ flex: 1, minWidth: "160px" }}>
              <div style={{ height: "8px", background: "#241005", borderRadius: "4px", overflow: "hidden", border: "1px solid #3a2a1a" }}>
                <div style={{
                  height: "100%", width: verifyBar ? "100%" : "0%",
                  background: "linear-gradient(90deg,#ff8a3d,#ffd54a)",
                  transition: "width " + X.VERIFY_MS + "ms linear",
                }}></div>
              </div>
              <div style={{ fontSize: "8.5px", color: "#8a6a52", fontStyle: "italic", marginTop: "3px" }}>
                {verifying ? X.COPY.verifyProgress : (verifyDone ? X.COPY.verifyResult : "")}
              </div>
            </div>
          )}
          {!(verifying || verifyDone) && (
            <span style={{ fontSize: "8.5px", color: "#6a4a38", fontStyle: "italic" }}>free · repeatable · identical</span>
          )}
        </div>
      </div>
    );
  }

  renderContract(view) {
    const { fnResult } = this.state;
    return (
      <div style={{ background: "#120b06", border: "1px solid #2a1f14", borderRadius: "6px", padding: "10px 14px", margin: "10px 0" }}>
        <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px", marginBottom: "6px" }}>{X.COPY.contractSection} — UTILITARIAN FUND</div>
        {this.renderTxRow(X.COPY.contractLabel, X.COPY.contractAddress, { fontFamily: MONO, color: "#cfe4ff" })}
        {this.renderTxRow("Balance:", X.fundBalanceLine(view.fundBB))}
        {this.renderTxRow("Verified:", X.COPY.contractVerified)}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
          {X.COPY.contractFunctions.map((fn) => (
            <span key={fn} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => this.onContractFn(fn)} style={{
                background: "#1a1008", border: "1px dashed #7a5a2a", color: "#e8c9ac",
                fontWeight: 700, fontSize: "10px", padding: "6px 10px", borderRadius: "6px",
                cursor: "pointer", fontFamily: MONO,
              }}>{fn}</button>
              <span style={{ fontFamily: MONO, fontSize: "10px", color: "#8a6a52" }}>
                {fnResult && fnResult.name === fn ? "→ " + fnResult.value : ""}
              </span>
            </span>
          ))}
          <span style={{ fontSize: "8.5px", color: "#6a4a38", fontStyle: "italic" }}>read-only (pending, §6.1)</span>
        </div>
      </div>
    );
  }

  renderMempool(view) {
    const { tick } = this.state;
    const pool = X.mempoolForTick(tick);
    const pos = X.positionAfter(pool.confirmCount); // 848 of 848, whatever confirmed
    return (
      <div style={{ background: "#120b06", border: "1px solid #2a1f14", borderRadius: "6px", padding: "10px 14px", margin: "10px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px" }}>{X.COPY.mempoolSection}</div>
          <div style={{ fontSize: "10px", color: "#a9705a" }}>
            {X.COPY.mempoolPending} · {X.COPY.mempoolYours}
          </div>
        </div>
        {pool.entrants.map((e) => (
          <div key={e.hash} style={{ display: "flex", alignItems: "baseline", gap: "8px", padding: "3px 0", fontSize: "10px", borderBottom: "1px solid #1c1208" }}>
            <span style={{ color: e.confirmed ? "#8fd97a" : "#5a4232", width: "10px", textAlign: "center" }}>{e.confirmed ? "✓" : "·"}</span>
            <span style={{ fontFamily: MONO, color: "#8a7a6a" }}>{e.hash.slice(0, 12)}…</span>
            <span style={{ color: "#a9705a", overflowWrap: "anywhere" }}>{e.name}</span>
            <span style={{ marginLeft: "auto", color: e.confirmed ? "#8fd97a" : "#6a4a38", fontStyle: "italic", whiteSpace: "nowrap" }}>
              {e.confirmed ? X.COPY.mempoolCut : "pending"}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", padding: "5px 0 2px", fontSize: "10px" }}>
          <span style={{ color: "#e8a52a", width: "10px", textAlign: "center" }}>▸</span>
          <span style={{ fontFamily: MONO, color: "#cfe4ff" }}>{view.hash.slice(0, 12)}…</span>
          <span style={{ color: "#ffd54a", fontWeight: 800 }}>{X.COPY.mempoolYou}</span>
          <span style={{ marginLeft: "auto", color: "#8a6a52", fontStyle: "italic", whiteSpace: "nowrap" }}>
            pending · {pos.position} of {pos.of}
          </span>
        </div>
        <div style={{ fontSize: "8.5px", color: "#6a4a38", fontStyle: "italic", marginTop: "6px" }}>
          {pool.confirmCount} confirmed and cut in line · {X.COPY.mempoolCaption}
        </div>
      </div>
    );
  }

  renderGas() {
    return (
      <div style={{ background: "#120b06", border: "1px solid #2a1f14", borderRadius: "6px", padding: "10px 14px", margin: "10px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px" }}>{X.COPY.gasSection}</div>
          <div style={{ fontFamily: MONO, fontSize: "10px", color: "#a9705a" }}>{X.COPY.gasTiers.join(" · ")}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
          <button onClick={this.onTip} style={{
            background: "linear-gradient(180deg,#ffd54a,#c9960a)", border: "1px solid #fff2c9",
            color: "#2a0e05", fontWeight: 900, fontSize: "10px", padding: "6px 12px", borderRadius: "6px", cursor: "pointer",
          }}>{X.COPY.tipLabel}</button>
          <span style={{ fontSize: "8.5px", color: "#6a4a38", fontStyle: "italic" }}>
            Grief cannot be acquired, spent, or held (§2.2) · position remains 848 of 848
          </span>
        </div>
        <div style={{ fontSize: "8.5px", color: "#6a4a38", fontStyle: "italic", marginTop: "4px" }}>{X.COPY.gasCaption}</div>
      </div>
    );
  }

  render() {
    const { view, searchInput } = this.state;
    const isTx = view.kind === "tx";
    return (
      <div onClick={this.props.onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#0e0a06", border: "2px solid #3a2a1a", borderRadius: "10px", maxWidth: "560px", width: "100%", maxHeight: "86vh", overflowY: "auto", padding: "20px 22px", color: "#d8b79b", fontSize: "11px", boxShadow: "0 0 50px rgba(0,0,0,0.7)" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: "19px", color: "#ffb347", letterSpacing: "1px" }}>{X.COPY.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: MONO, fontSize: "9px", color: "#8fd97a", border: "1px solid #3a5a2a", borderRadius: "4px", padding: "3px 8px", letterSpacing: "0.5px" }}>{X.COPY.networkBadge}</span>
              <span title={X.COPY.blockTooltip} style={{ fontFamily: MONO, fontSize: "9px", color: "#e8a52a", border: "1px solid #3a2a1a", borderRadius: "4px", padding: "3px 8px", cursor: "help" }}>
                {X.COPY.latestBlockLabel}: {X.COPY.latestBlock}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              value={searchInput}
              onChange={(e) => this.setState({ searchInput: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") this.onSearch(); }}
              placeholder={X.COPY.searchPlaceholder}
              style={{ flex: 1, minWidth: 0, background: "#120b06", border: "1px solid #2a1f14", borderRadius: "6px", color: "#d8b79b", fontSize: "10.5px", padding: "7px 10px", fontFamily: MONO }}
            />
            <button onClick={this.onSearch} style={{ background: "#1a1008", border: "1px dashed #7a5a2a", color: "#e8c9ac", fontWeight: 700, fontSize: "10.5px", padding: "7px 12px", borderRadius: "6px", cursor: "pointer" }}>Search</button>
          </div>
          <div style={{ fontSize: "8.5px", color: "#6a4a38", fontStyle: "italic", margin: "4px 0 2px" }}>{X.COPY.searchResult}</div>

          {isTx ? this.renderTx(view) : this.renderContract(view)}
          {isTx && this.renderMempool(view)}
          {this.renderGas()}

          <div style={{ fontSize: "8.5px", color: "#8a6a52", fontStyle: "italic", margin: "8px 0", lineHeight: 1.5 }}>{this.props.realityStrap}</div>
          <button onClick={this.props.onClose} style={{ background: "#3a2010", border: "1px dashed #7a5a2a", color: "#e8c9ac", fontWeight: 800, fontSize: "11px", padding: "9px 14px", borderRadius: "6px", cursor: "pointer", width: "100%" }}>{X.COPY.closeButton}</button>
        </div>
      </div>
    );
  }
}
