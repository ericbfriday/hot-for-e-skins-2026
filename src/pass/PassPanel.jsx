import React, { useState, useEffect } from "react";
// Mom's Little Helper™ Pass — the panel (spec §1/§3/§4/§6; battle-pass.md).
// A class-site idiom in a function component: inline styles, Bangers ALL CAPS,
// honest progress bars, prizes worth nothing, itemized lovingly.
import { Pass } from "./state.js";
import { TIERS, MAX_TIER_IDX, COPY, seasonRemaining, formatCountdown } from "./engine.js";

// The ❤ is MOM's font; the helper borrows it, once (§1).
const MOM_PINK = "#ff9ad5";

function Foil({ children }) {
  // The foil shimmer (§6): identical items, one shimmering — the shimmer is a
  // CSS overlay (foilShimmer, index.css), the item beneath is unchanged.
  return (
    <div style={{ position: "relative", overflow: "hidden", border: "2px solid #ffd54a", borderRadius: "8px", background: "linear-gradient(160deg,#2a2005,#161004)" }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(105deg, transparent 0 16px, rgba(255,255,255,0.14) 16px 20px, transparent 20px 36px, rgba(255,246,200,0.34) 36px 40px, transparent 40px 58px)", backgroundSize: "220% 100%", animation: "foilShimmer 2.6s linear infinite", pointerEvents: "none" }} />
      {children}
    </div>
  );
}

function RewardRow({ tier, premium }) {
  const suffix = premium ? COPY.premiumSuffix : "";
  const diamond = tier.key === "DIAMOND";
  const body = (
    <div style={{ padding: "8px 10px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontFamily: "'Bangers',cursive", fontSize: diamond && premium ? "15px" : "12.5px", color: "#ffd54a", letterSpacing: "1px" }}>
          {tier.key}{premium ? " MOM (Premium)" : " MOM"}
        </span>
        <span style={{ fontSize: "9px", color: "#8a6a52", whiteSpace: "nowrap" }}>{tier.xp} XP</span>
      </div>
      <div style={{ fontSize: "9.5px", color: "#e8c9ac", lineHeight: 1.45, marginTop: "3px" }}>
        {diamond ? (premium ? "DIAMOND MOM (Premium) status — non-transferable, non-refundable, est. priceless (est. $0.00)" : tier.reward) : (tier.reward + suffix)}
      </div>
    </div>
  );
  if (!premium) return <div style={{ border: "2px solid #7a3a1a", borderRadius: "8px", background: "linear-gradient(160deg,#241005,#160a04)" }}>{body}</div>;
  return <Foil>{body}</Foil>;
}

function QuestCard({ title, done, progress, target, xp }) {
  const pct = target > 1 ? Math.max(0, Math.min(100, (progress / target) * 100)) : (done ? 100 : 0);
  return (
    <div style={{ background: "#0e0a06", border: `1px solid ${done ? "#8fd97a" : "#3a2a1a"}`, borderRadius: "8px", padding: "9px 11px", opacity: done ? 0.75 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: done ? "#c9f2b0" : "#ffe9d6", lineHeight: 1.35 }}>{done ? "✓ " : ""}{title}</span>
        <span style={{ fontSize: "9px", color: "#e8a52a", whiteSpace: "nowrap" }}>+{xp} XP</span>
      </div>
      <div style={{ background: "#160a04", borderRadius: "4px", height: "7px", overflow: "hidden", margin: "7px 0 4px", border: "1px solid #2a1a0a" }}>
        <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,#7a5a2a,#ffd54a)", transition: "width 0.4s" }} />
      </div>
      {/* the bars fill honestly — the quests are real, the rewards are XP */}
      <div style={{ fontSize: "8px", color: "#6a4a38", fontStyle: "italic" }}>{target > 1 ? (progress + " / " + target) : (done ? "complete (it counted)" : "incomplete (pending you)")}</div>
    </div>
  );
}

export default function PassPanel({ snap, ocCount, premiumPrice, buyPremium, openAskMom, realityStrap }) {
  const [, setClock] = useState(0);
  useEffect(() => {
    const int = setInterval(() => { Pass.tick(); setClock((n) => n + 1); }, 60000);
    return () => clearInterval(int);
  }, []);
  if (!snap) return null;

  const season = seasonRemaining(Date.now(), snap.seasonSyncTs);
  const countdown = formatCountdown(season.ms);
  const affordable = ocCount >= premiumPrice;

  return (
    <div>
      {/* §1: the header — title, season, the countdown that never comes */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap", marginBottom: "4px" }}>
        <div style={{ fontFamily: "'Bangers',cursive", fontSize: "20px", color: "#ffb347" }}>{COPY.title}</div>
        <div style={{ fontFamily: "'Bangers',cursive", fontSize: "12px", color: "#ff8a3d", letterSpacing: "1px" }}>{COPY.season}</div>
        <div title={COPY.countdownTip} style={{ fontSize: "10.5px", color: "#e8a52a", fontWeight: 800, cursor: "help", borderBottom: "1px dotted #e8a52a" }}>
          ends in {countdown}
        </div>
      </div>
      <div style={{ fontSize: "8.5px", color: "#6a4a38", fontStyle: "italic", marginBottom: "8px" }}>{COPY.seasonOfOne}</div>

      {/* §1: the mascot line — the ❤ is MOM's font; the helper borrows it, once */}
      <div style={{ background: "#2a0e1a", border: "1px solid #ff9ad5", borderRadius: "6px", padding: "7px 11px", fontSize: "11.5px", color: "#ff9ad5", fontStyle: "italic", marginBottom: "12px" }}>
        {COPY.mascot} <span style={{ fontFamily: "inherit", color: MOM_PINK, fontStyle: "normal" }}>❤</span> {COPY.mascotSign}
      </div>

      {/* §3: the XP readout + the tier bar (deadpan precision) */}
      <div style={{ background: "#0e0a06", border: "1px solid #7a5a2a", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px" }}>
          <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#ffd54a" }}>
            {snap.maxed ? COPY.xpAtMax(snap.xp) : COPY.xpLine(snap.xp, snap.nextTier)}
          </div>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "12px", color: "#ff8a3d", letterSpacing: "1px" }}>
            {snap.tierLabel}{snap.premium ? COPY.premiumSuffix : ""}
          </div>
        </div>
        <div style={{ position: "relative", background: "#160a04", borderRadius: "4px", height: "12px", overflow: "hidden", margin: "8px 0 4px", border: "1px solid #2a1a0a" }}>
          <div style={{ height: "100%", width: snap.tierPct + "%", background: "linear-gradient(90deg,#7a3a1a,#ff8a3d,#ffd54a)", transition: "width 0.5s" }} />
          {TIERS.slice(1).map((t) => (
            <div key={t.key} title={t.key + " MOM — " + t.xp + " XP"} style={{ position: "absolute", top: 0, bottom: 0, left: (t.xp / TIERS[MAX_TIER_IDX].xp) * 100 + "%", width: "1px", background: "rgba(255,233,214,0.4)" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "#6a4a38" }}>
          <span>0 XP (enrolled (mandatory))</span>
          <span>1,800 XP (there is nothing after this)</span>
        </div>
        <div style={{ marginTop: "8px", display: "grid", gap: "5px" }}>
          {TIERS.map((t, i) => (
            <div key={t.key} style={{ display: "flex", gap: "8px", alignItems: "baseline", fontSize: "10px", lineHeight: 1.45 }}>
              <span style={{ fontFamily: "'Bangers',cursive", fontSize: "11.5px", color: i <= snap.tierIdx ? (i === snap.tierIdx ? "#ffd54a" : "#ff8a3d") : "#5a4232", letterSpacing: "1px", minWidth: "108px" }}>
                {i === snap.tierIdx ? "▸ " : ""}{t.key} MOM
              </span>
              <span style={{ color: i <= snap.tierIdx ? "#e8a52a" : "#6a4a38", minWidth: "44px", textAlign: "right" }}>{t.xp} XP</span>
              <span style={{ color: i <= snap.tierIdx ? "#e8c9ac" : "#6a4a38", fontStyle: i > snap.tierIdx ? "italic" : "normal" }}>{t.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* §6: the premium track — the same items, foil-bordered, suffixed */}
      <div style={{ background: "#0e0a06", border: "1px solid #7a3a1a", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#ff8a3d", letterSpacing: "1px" }}>THE PREMIUM TRACK (IT IS PREMIUM)</div>
          {snap.premium ? (
            <div style={{ fontSize: "10px", color: "#8fd97a", fontWeight: 800 }}>
              PREMIUM (unlocked (est.)) — {COPY.premiumDisclosure}
            </div>
          ) : (
            <button
              onClick={() => (affordable ? buyPremium() : openAskMom())}
              title={affordable ? "the premium track is premium" : "insufficient OC — Mom can help (she always helps)"}
              style={{ background: affordable ? "linear-gradient(180deg,#ffd54a,#c9960a)" : "#3a2010", border: "2px solid #fff2c9", color: affordable ? "#2a0e05" : "#8a6a52", fontWeight: 900, fontSize: "11px", padding: "7px 14px", borderRadius: "7px", cursor: "pointer" }}
            >
              {COPY.premiumUnlock}{affordable ? "" : " — Ask Mom"}
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div>
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: "11px", color: "#a9705a", letterSpacing: "1px", margin: "2px 0 5px" }}>FREE (YOU GET THIS)</div>
            <div style={{ display: "grid", gap: "6px" }}>
              {TIERS.slice(1).map((t) => <RewardRow key={t.key} tier={t} premium={false} />)}
            </div>
          </div>
          <div style={{ borderRadius: "10px", padding: "4px", animation: "premiumGlow 2.2s ease-in-out infinite" }}>
            <div style={{ fontFamily: "'Bangers',cursive", fontSize: "11px", color: "#ffd54a", letterSpacing: "1px", margin: "2px 0 5px" }}>PREMIUM (GLOWING (EST.))</div>
            <div style={{ display: "grid", gap: "6px" }}>
              {TIERS.slice(1).map((t) => <RewardRow key={t.key} tier={t} premium />)}
            </div>
          </div>
        </div>
        <div style={{ fontSize: "8.5px", color: "#8a6a52", fontStyle: "italic", marginTop: "8px", lineHeight: 1.5 }}>
          {COPY.premiumFinePrint} — buying mid-season changes nothing retroactively, which is disclosed with unusual candor: {COPY.premiumDisclosure}
        </div>
        {!snap.premium && <div style={{ fontSize: "8px", color: "#6a4a38", marginTop: "4px" }}>identical items, foil-bordered: the premium track is premium (you have {ocCount.toLocaleString("en-US")} OC; the track costs {premiumPrice})</div>}
      </div>

      {/* §4: the quests — real events, flat XP, honest bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "4px" }}>
        <div>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px", marginBottom: "7px" }}>DAILY QUESTS (RESET AT MIDNIGHT (THE MOOD'S))</div>
          <div style={{ display: "grid", gap: "6px" }}>
            {snap.daily.map((q) => <QuestCard key={q.id} title={q.title} done={q.done} progress={q.progress} target={q.target} xp={q.xp} />)}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Bangers',cursive", fontSize: "13px", color: "#cf6a32", letterSpacing: "1px", marginBottom: "7px" }}>SEASONAL QUESTS (ONCE EACH, EVER (LIKE REGRET))</div>
          <div style={{ display: "grid", gap: "6px" }}>
            {snap.seasonal.map((q) => <QuestCard key={q.id} title={q.title} done={q.done} progress={q.done ? 1 : 0} target={1} xp={q.xp} />)}
          </div>
        </div>
      </div>

      {/* §1: the money-adjacent panel pins the §12.4 reality strap, verbatim */}
      <div style={{ marginTop: "12px", borderTop: "2px solid #7a3a1a", paddingTop: "8px", fontSize: "8.5px", color: "#8a6a52", fontStyle: "italic", textAlign: "center" }}>{realityStrap}</div>
    </div>
  );
}
