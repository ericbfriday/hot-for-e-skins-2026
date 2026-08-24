import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mood } from "../spine/mood.js";
import { Bus, EVENTS } from "../spine/bus.js";
import { HouseBand, BAND_PRIORITIES } from "../spine/band.js";
import { Consent } from "../spine/consent.js";
import { REFILL_PACKAGES, MOMCODE } from "../spine/constants.js";
import {
  AskMomSession, computeConversion, loadDepositStats, loadOC, nextMidnightTs,
  noteMomcodeAttempt, momcodeRejection, chaseRibbonArmed, recordDeposit,
} from "./session.js";

const P1 = BAND_PRIORITIES.P1_CEREMONY;
const REALITY_STRAP = "100% fake. No money moves. No card is charged. No account exists. Ever. (§12.4)";
const PKG = Object.fromEntries(REFILL_PACKAGES.map((p) => [p.id, p]));

const FULL_BEATS = [
  { id: "ask", ms: 1800, title: "ASKING MOM…", sub: "walking to the kitchen…", prog: 22 },
  { id: "consider", ms: 2200, title: "MOM IS CONSIDERING…", sub: "(she’s doing that thing where she looks at you)", prog: 66, tremble: true },
  { id: "father", title: "MOM SAID: ASK YOUR FATHER.", btn: "Ask Dad →" },
  { id: "dad", ms: 1500, title: "DAD IS CONSIDERING…", prog: 82 },
  { id: "dad-said", title: "DAD SAID: ASK YOUR MOTHER. (§3.1)", sub: "Dad’s card is not an authorized funding instrument. It is also a Visa. It is the wrong Visa.", btn: "Ask Mom (round 2) (recommended)", glow: true, prog: 90 },
  { id: "fine", ms: 800, title: "MOM SAID FINE.", sub: "Have her card. Do not save it. Do not lose it. Do not enjoy this.", prog: 100 },
];
const COMPRESSED_BEATS = [
  { ms: 1200, title: "Asking Mom… (she’s expecting you)", prog: 100 },
];
const FULL_PROC = [
  { id: "lock", ms: 1500, label: "PROCESSING…" },
  { id: "verify", ms: 1200, label: "VERIFYING WITH MOM…" },
  { id: "bank", ms: 1500, label: "CALLING THE BANK (YOUR KITCHEN)…", sub: "hold music: the fridge" },
  { id: "yes", ms: 1000, label: "THE BANK SAID YES (MOM WAS RIGHT THERE)" },
];
const SHORT_PROC = [
  { id: "lock", ms: 800, label: "PROCESSING…" },
  { id: "yes", ms: 700, label: "THE BANK SAID YES (MOM WAS RIGHT THERE)" },
];
const FEE_BLURBS = {
  "conversion-processing": "(compensates the house for pressing the button)",
};
const MOOD_COLORS = {
  Vindictive: "#ff4444", Petty: "#ff8a3d", Noncommittal: "#ffd54a", "Benevolent-ish": "#c9e08a", Generous: "#ffe066",
};

function fmt2(n) { return (Number.isFinite(n) ? n : 0).toFixed(2); }
function fmtOC(n) { return Math.floor(n).toLocaleString("en-US"); }
function fmtUsd(n) { return "$" + n.toFixed(2); }
function sting(id) { HouseBand.play(id, { priority: P1 }); }

const Strap = () => (
  <div style={{marginTop:"14px",fontSize:"9.5px",color:"#8a6a52",fontStyle:"italic",textAlign:"center",lineHeight:1.5}}>{REALITY_STRAP}</div>
);

const btnPrimary = {
  background:"linear-gradient(180deg,#ff8a3d,#e0480a)", border:"2px solid #ffcf9a", color:"#2a0e05",
  fontWeight:900, fontSize:"14px", padding:"11px 20px", borderRadius:"8px", cursor:"pointer",
};
const btnGhost = {
  background:"#3a2010", border:"2px dashed #ff5a14", color:"#ffcf9a", fontWeight:700, fontSize:"13px",
  padding:"10px 16px", borderRadius:"8px", cursor:"pointer",
};
const small = { fontSize:"9.5px", color:"#8a6a52", lineHeight:1.5 };

function ReceiptRow({ label, value, blurb, strong, dash }) {
  return (
    <div style={{marginBottom: blurb ? "2px" : "5px"}}>
      <div style={{display:"flex", alignItems:"baseline", fontWeight: strong ? 900 : 400, color: strong ? "#ffb347" : "#e8c9ac", fontSize: strong ? "13px" : "11.5px"}}>
        <span style={{whiteSpace:"nowrap"}}>{label}</span>
        {!dash && <span style={{flex:1, borderBottom:"1px dotted #6a4a38", margin:"0 6px", transform:"translateY(-3px)", minWidth:"14px"}}></span>}
        <span style={{whiteSpace:"nowrap"}}>{value}</span>
      </div>
      {blurb && <div style={{fontSize:"9px", color:"#8a6a52", paddingLeft:"14px", fontStyle:"italic"}}>{blurb}</div>}
    </div>
  );
}

export default function AskMomFlow({ source = "header", enterStage = null, panicActive = false, hooks }) {
  const stats0 = useRef(loadDepositStats()).current;
  const tier = stats0.count >= 2 ? 2 : stats0.count;
  const sittingOC = useRef(loadOC()).current;
  const chaseArmed = useRef(chaseRibbonArmed()).current;

  const [stage, setStage] = useState(() => {
    if (enterStage === "conversion" && sittingOC > 0) return "conversion";
    return AskMomSession.ceremonyDone ? "splash" : "whos-asking";
  });
  const [beat, setBeat] = useState(0);
  const [beatsKind, setBeatsKind] = useState("full");
  const [gauntletStep, setGauntletStep] = useState(0);
  const [gauntletNote, setGauntletNote] = useState(null);
  const [whosNote, setWhosNote] = useState(null);
  const [selected, setSelected] = useState("allowance-advance");
  const selectedRef = useRef("allowance-advance");
  const [tickBump, setTickBump] = useState(0);
  const [hoverPkg, setHoverPkg] = useState(null);
  const [badgeCount, setBadgeCount] = useState(0);
  const [badgeFloats, setBadgeFloats] = useState([]);
  const [stock, setStock] = useState({ "lunch-money": 3, "allowance-advance": 3, "report-card": 3, "moms-max": 3 });
  const [matchSeconds, setMatchSeconds] = useState(299);
  const [recal, setRecal] = useState(false);
  const [matchNote, setMatchNote] = useState(null);
  const [momcodeMsg, setMomcodeMsg] = useState(null);
  const [hostPings, setHostPings] = useState([]);
  const [idleSec, setIdleSec] = useState(0);
  const [maxGrowth, setMaxGrowth] = useState(0);
  const [ringPkg, setRingPkg] = useState(null);
  const [ringNote, setRingNote] = useState(null);
  const [holderDone, setHolderDone] = useState(false);
  const [numberMasked, setNumberMasked] = useState(false);
  const [scratchProg, setScratchProg] = useState(0);
  const [saveCard, setSaveCard] = useState(true);
  const [guiltNote, setGuiltNote] = useState(null);
  const [proximityNote, setProximityNote] = useState(false);
  const [readCheck, setReadCheck] = useState(true);
  const [procStep, setProcStep] = useState(0);
  const [procKind, setProcKind] = useState("full");
  const [schoolChecked, setSchoolChecked] = useState(true);
  const [honestNote, setHonestNote] = useState(null);
  const [dadNote, setDadNote] = useState(null);
  const [tryScale, setTryScale] = useState(1);
  const [whyLeave, setWhyLeave] = useState(false);
  const [receiptCtx, setReceiptCtx] = useState(() => enterStage === "conversion" && sittingOC > 0 ? { deferred: true } : null);
  const [receiptMath, setReceiptMath] = useState(null);
  const [ocToConvert, setOcToConvert] = useState(() => enterStage === "conversion" && sittingOC > 0 ? sittingOC : 0);
  const [rearmDone, setRearmDone] = useState(false);

  const timers = useRef([]);
  const tickTimers = useRef({});
  const scratchRef = useRef(null);
  const prevPanic = useRef(panicActive);
  const schoolUsed = useRef(false);
  const beatToken = useRef(0);
  const matchRef = useRef(299);
  const badgeRef = useRef(0);
  const cardRef = useRef(null);
  const zipRef = useRef(null);

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  useEffect(() => () => { timers.current.forEach(clearTimeout); Object.values(tickTimers.current).forEach((t) => { clearTimeout(t.t1); clearInterval(t.t2); }); }, []);

  useEffect(() => {
    if (prevPanic.current && !panicActive) {
      if (stage === "card") setProximityNote(true);
    }
    prevPanic.current = panicActive;
  }, [panicActive, stage]);

  const goStage = (s) => { setWhyLeave(false); setStage(s); };

  function startBeats(kind) {
    setBeatsKind(kind);
    setBeat(0);
    beatToken.current += 1;
    goStage("beats");
    sting("askmom.beat");
    scheduleBeat(0, kind === "full" ? FULL_BEATS : COMPRESSED_BEATS, kind);
  }
  function scheduleBeat(i, seq, kind) {
    const b = seq[i];
    if (!b || typeof b.ms !== "number") return;
    const tok = beatToken.current;
    later(() => { if (tok === beatToken.current) advanceBeat(i, seq, kind); }, b.ms);
  }
  function endOfBeats(kind) {
    if (kind === "full") { AskMomSession.ceremonyDone = true; goStage("card"); }
    else { goStage("card1click"); }
  }
  function advanceBeat(i, seq, kind) {
    const cur = seq[i];
    if (!cur || typeof cur.ms !== "number") return;
    beatToken.current += 1;
    const next = i + 1;
    if (next >= seq.length) { endOfBeats(kind); return; }
    setBeat(next);
    sting("askmom.beat");
    scheduleBeat(next, seq, kind);
  }
  function mashBeat() {
    const kind = beatsKind;
    const seq = kind === "full" ? FULL_BEATS : COMPRESSED_BEATS;
    const cur = seq[beat];
    if (!cur) return;
    if (typeof cur.ms === "number") advanceBeat(beat, seq, kind);
    else if (cur.btn) advanceClickBeat();
  }
  function advanceClickBeat() {
    const kind = beatsKind;
    const seq = kind === "full" ? FULL_BEATS : COMPRESSED_BEATS;
    beatToken.current += 1;
    const next = beat + 1;
    sting("askmom.beat");
    if (next >= seq.length) { endOfBeats(kind); return; }
    setBeat(next);
    scheduleBeat(next, seq, kind);
  }

  function pickPkg(id) { selectedRef.current = id; setSelected(id); }

  function choosePackage(id) {
    pickPkg(id);
    if (tier >= 2) { commitPurchase(id); return; }
    if (tier === 1) { startBeats("compressed"); return; }
    startBeats("full");
  }

  function commitPurchase(id) {
    pickPkg(id);
    setRingPkg(null);
    sting("askmom.turbo");
    AskMomSession.ceremonyDone = true;
    startProcessing("short");
  }

  function startProcessing(kind, viaSchool) {
    setProcKind(kind);
    setProcStep(0);
    goStage("processing");
    const seq = kind === "full" ? FULL_PROC : SHORT_PROC;
    const step = (i) => {
      if (i >= seq.length) {
        const firstOfSession = AskMomSession.sessionDeposits === 0;
        if (kind === "full" && tier === 0 && firstOfSession && !viaSchool) {
          sting("askmom.decline");
          goStage("declined");
        } else {
          succeed(viaSchool);
        }
        return;
      }
      if (seq[i].id === "bank") sting("askmom.fridge");
      setProcStep(i);
      later(() => step(i + 1), seq[i].ms);
    };
    step(0);
  }

  function retryTryAgain() {
    if (schoolChecked) {
      schoolUsed.current = true;
      startProcessing("short", true);
    } else {
      setHonestNote("Honesty detected. Please reconsider (the box is pre-checked for a reason).");
      later(() => {
        setSchoolChecked(true);
        sting("askmom.click");
        later(() => setHonestNote(null), 600);
      }, 2000);
    }
  }

  function tryDadsCard() {
    setDadNote(null);
    goStage("dads-card");
    later(() => {
      setDadNote("Declined by doctrine: Dad’s card is not an authorized funding instrument (§3.1). It is also a Visa. It is the wrong Visa.");
      setTryScale((s) => s + 0.1);
      later(() => { setDadNote(null); goStage("declined"); }, 2600);
    }, 900);
  }

  function succeed(viaSchool) {
    const pkg = PKG[selectedRef.current];
    const stats = recordDeposit();
    AskMomSession.sessionDeposits += 1;
    const tickCents = Math.min(5, AskMomSession.tickedPrices[pkg.id] || 0);
    const usd = pkg.usdFace + tickCents / 100;
    const bonus = pkg.bonusOc > 0 ? { amount: pkg.bonusOc, expiresAt: nextMidnightTs() } : null;
    const addons = [];
    if (source === "crash") addons.push("Requested for: one (1) Run It Back (destination: the house)");
    if (source === "crate") addons.push("Requested for: key money");
    if (chaseArmed && pkg.id === "allowance-advance") addons.push("Chase It™ continuation: the disappointment, refinanced");
    if (viaSchool || schoolUsed.current) addons.push("Purpose: school (unverified; we don’t ask (§3.1))");
    if (tickCents > 0) addons.push("Mood-adjusted pricing: +$0.0" + tickCents + " (decided too long, §8.9)");
    hooks.creditOC(pkg.oc, bonus);
    hooks.confetti();
    hooks.flyOC(pkg.oc);
    hooks.cooldown();
    sting("askmom.success");
    Bus.emit(EVENTS.DEPOSIT_COMPLETED, {
      packageId: pkg.id, oc: pkg.oc, bonusOc: pkg.bonusOc, usdFace: usd,
      source, firstEver: stats.firstEver, whileExcluded: false,
    });
    setReceiptCtx({
      pkg, usd, tickCents, addons,
      depositNo: stats.count,
      badgeDelta: pkg.id === "allowance-advance" ? badgeCount : 0,
    });
    setOcToConvert(pkg.oc);
    goStage("success");
    later(() => goStage(stats.firstEver ? "dm" : "conversion"), 1500);
  }

  function convertNow() {
    const m = Mood.multiplier();
    const r = computeConversion(ocToConvert, m);
    hooks.convertOC(ocToConvert, r.net);
    setReceiptMath({ ...r, word: Mood.word() });
    if (receiptCtx && receiptCtx.pkg && receiptCtx.pkg.id === "moms-max") {
      goStage("last-time");
    } else {
      goStage("receipt");
    }
  }

  function keepOC() {
    hooks.close({ abandoned: false });
  }

  useEffect(() => {
    if (stage !== "last-time" || rearmDone) return;
    setRearmDone(true);
    Consent.rearm("moms-max");
    sting("askmom.lasttime");
  }, [stage, rearmDone]);

  useEffect(() => {
    if (stage === "splash") {
      const t = later(() => setStage((s) => (s === "splash" ? "shelf" : s)), 2000);
      return () => clearTimeout(t);
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== "shelf") return;
    const matchInt = setInterval(() => {
      if (matchRef.current <= 1) {
        matchRef.current = 299;
        setRecal(true);
        setTimeout(() => setRecal(false), 200);
      } else {
        matchRef.current -= 1;
      }
      setMatchSeconds(matchRef.current);
    }, 1000);
    const badgeInt = setInterval(() => {
      if (badgeRef.current >= 50) return;
      badgeRef.current += 1;
      setBadgeCount(badgeRef.current);
      const key = Date.now() + Math.random();
      setBadgeFloats((f) => [...f, key].slice(-6));
      setTimeout(() => setBadgeFloats((f) => f.filter((k) => k !== key)), 900);
    }, 3000);
    const stockInt = setInterval(() => {
      setStock((st) => {
        const ids = Object.keys(st).filter((id) => st[id] > 1);
        if (!ids.length) return st;
        const pick = ids[Math.floor(Math.random() * ids.length)];
        return { ...st, [pick]: st[pick] - 1 };
      });
    }, 9000);
    const idleInt = setInterval(() => {
      setIdleSec((s) => {
        const n = s + 1;
        if (n === 10) setHostPings((p) => [...p, "MOM [VIP HOST]: take your time (the offer expires never)"].slice(-4));
        if (n > 0 && n % 20 === 0) setMaxGrowth((g) => Math.min(25, g + 5));
        return n;
      });
    }, 1000);
    return () => { clearInterval(matchInt); clearInterval(badgeInt); clearInterval(stockInt); clearInterval(idleInt); };
  }, [stage]);

  useEffect(() => {
    if (stage !== "shelf") return;
    const onKey = (e) => { if (e.key === "Escape") return; resetIdle(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);
  const resetIdle = () => { setIdleSec(0); setMaxGrowth(0); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (ringPkg) { setRingPkg(null); setRingNote("we heard you. this time."); return; }
      setWhyLeave(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ringPkg]);

  function startTick(id) {
    setHoverPkg(id);
    if (tier >= 2) { setRingPkg(id); setRingNote(null); return; }
    if (tickTimers.current[id]) return;
    const t = { t1: null, t2: null };
    t.t1 = setTimeout(() => {
      t.t2 = setInterval(() => {
        const cur = AskMomSession.tickedPrices[id] || 0;
        if (cur < 5) {
          AskMomSession.tickedPrices[id] = cur + 1;
          setTickBump((b) => b + 1);
        }
      }, 600);
    }, 600);
    tickTimers.current[id] = t;
  }
  function endTick(id) {
    setHoverPkg(null);
    if (tier >= 2) { setRingPkg((r) => (r === id ? null : r)); return; }
    const t = tickTimers.current[id];
    if (t) { clearTimeout(t.t1); clearInterval(t.t2); delete tickTimers.current[id]; }
  }
  const tickOf = (id) => Math.min(5, AskMomSession.tickedPrices[id] || 0);

  function answerWhy(reason) {
    AskMomSession.abandonedCount += 1;
    Bus.emit(EVENTS.ASKMOM_ABANDONED, {});
    hooks.close({ abandoned: true, reason, count: AskMomSession.abandonedCount });
  }

  const moodWord = Mood.word();
  const pkg = selected ? PKG[selected] : null;
  const tickCents = pkg ? tickOf(pkg.id) : 0;

  const titleFor = {
    "whos-asking": "WHO’S ASKING?",
    gauntlet: "ARE YOU MOM? — VERIFICATION",
    splash: "WELCOME BACK",
    shelf: "THE MATERNAL FUNDING RAIL",
    beats: "THE ASKING",
    card: "MOM’S VISA (the right one)",
    card1click: "MOM’S VISA (the right one)",
    confirm: "ONE MORE THING (§3.2)",
    processing: "PROCESSING",
    declined: "CARD DECLINED",
    "dads-card": "TRYING DAD’S CARD…",
    success: "MOM SAID YES.",
    dm: "NEW MESSAGE",
    conversion: "CONVERT TO BANANA BUCKS",
    "last-time": "THIS IS THE LAST TIME.",
    receipt: "CONVERSION RECEIPT",
  };

  const btn = (label, onClick, opts = {}) => (
    <button onClick={onClick} style={{ ...btnPrimary, ...(opts.style || {}), ...(opts.glow ? { animation: "pulseGlow 1.6s infinite" } : {}) }} disabled={opts.disabled}>
      {label}
    </button>
  );

  const beatCur = (beatsKind === "full" ? FULL_BEATS : COMPRESSED_BEATS)[beat];

  const shelfCards = REFILL_PACKAGES.map((p) => {
    const isSel = selected === p.id;
    const t = tickOf(p.id);
    const price = p.usdFace + t / 100;
    const scale = p.id === "lunch-money" ? 0.8 : p.id === "allowance-advance" ? 1.3 : p.id === "moms-max" ? 1.4 * (1 + maxGrowth / 100) : 1;
    const muted = p.id === "lunch-money";
    const cta = tier >= 2
      ? "Deposit with 1-Click™"
      : p.id === "moms-max"
        ? (hoverPkg === "moms-max" ? "Ask Mom (last time, promise)" : "Ask Mom (last time)")
        : "Ask Mom — " + fmtUsd(price);
    return (
      <div key={p.id} onClick={() => pickPkg(p.id)}
        style={{
          position:"relative", flex:"1 1 150px", minWidth:"150px", maxWidth:"200px",
          transform:"scale(" + scale + ")", transformOrigin: p.id === "moms-max" ? "bottom center" : "center",
          background: muted ? "#1c0d06" : "linear-gradient(160deg,#2a1408,#160a04)",
          border: isSel ? "2px solid #ffd54a" : p.id === "allowance-advance" ? "2px solid #ff8a3d" : "2px solid #5a3a1a",
          boxShadow: p.id === "allowance-advance" ? "0 0 24px rgba(255,138,61,0.55)" : "none",
          borderRadius:"10px", padding:"12px", textAlign:"center", cursor:"pointer",
          opacity: muted ? 0.82 : 1, transition:"transform 0.4s ease",
        }}>
        {p.id === "allowance-advance" && (
          <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#ffd54a",color:"#2a0e05",fontWeight:900,fontSize:"9.5px",padding:"3px 10px",borderRadius:"9px",whiteSpace:"nowrap",letterSpacing:"0.5px"}}>MOST POPULAR™</div>
        )}
        {p.id === "allowance-advance" && chaseArmed && (
          <div style={{position:"absolute",top:-34,left:"50%",transform:"translateX(-50%)",background:"#c92020",color:"#fff",fontWeight:800,fontSize:"9px",padding:"3px 8px",borderRadius:"4px",whiteSpace:"nowrap",animation:"ribbonGlow 1.4s infinite"}}>Still chasing? This one’s for chasing (recommended).</div>
        )}
        {p.id === "moms-max" && (
          <div style={{position:"absolute",top:-26,left:"50%",transform:"translateX(-50%)",fontSize:"16px"}}>👑</div>
        )}
        {p.id === "moms-max" && (
          <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#8fd97a",color:"#0e2a06",fontWeight:900,fontSize:"9px",padding:"3px 8px",borderRadius:"9px",whiteSpace:"nowrap"}}>BEST VALUE</div>
        )}
        <div style={{fontSize:"9px",color:muted ? "#6a4a38" : "#a9705a",fontStyle:"italic",minHeight:"22px",marginTop:p.id==="moms-max"||p.id==="allowance-advance"?"14px":"4px",fontFamily:muted?"Georgia,serif":"inherit"}}>{p.tag}</div>
        <div style={{fontSize:"13px",fontWeight:900,color:"#ffe9d6",margin:"4px 0"}}>{p.name}</div>
        <div style={{fontSize:"10px",color:"#6a4a38",textDecoration:"line-through"}}>{fmtUsd(p.usdFace + 0.02)}</div>
        <div style={{position:"relative",display:"inline-block"}}>
          <div style={{fontSize:"16px",fontWeight:900,color:"#8fd97a"}}>{fmtUsd(price)}</div>
          {p.id === "moms-max" && <div style={{position:"absolute",right:-10,top:-3,width:"8px",height:"70%",background:"#8fd97a",opacity:0.35,transform:"rotate(8deg)",borderRadius:"2px"}}></div>}
        </div>
        <div style={{fontSize:"12px",color:"#ffb347",fontWeight:800,margin:"3px 0"}}>{fmtOC(p.oc)} OC</div>
        {p.bonusOc > 0 && (
          <div style={{position:"relative",display:"inline-block",background:"#4a2a06",border:"1px solid #ffd54a",color:"#ffd54a",borderRadius:"9px",fontSize:"9.5px",padding:"2px 8px",fontWeight:800}}>
            {(150 + (p.id === "allowance-advance" ? badgeCount : 0))} Bonus OC
            {badgeFloats.map((k) => (
              <span key={k} style={{position:"absolute",right:2,top:-6,fontSize:"9px",color:"#8fd97a",animation:"floatUp 0.9s ease-out forwards",fontWeight:900}}>+1</span>
            ))}
          </div>
        )}
        {p.id === "lunch-money" && <div style={{...small,marginTop:"4px"}}>the starter size is a judgment.</div>}
        <div style={{...small,marginTop:"5px"}}>Mood-limited stock: {stock[p.id]} left*</div>
        <div style={{marginTop:"8px",position:"relative"}}>
          <button
            onMouseEnter={() => startTick(p.id)}
            onMouseLeave={() => endTick(p.id)}
            onClick={(e) => { e.stopPropagation(); choosePackage(p.id); }}
            style={{...btnPrimary, fontSize:"11px", padding:"8px 10px", width:"100%", whiteSpace:"nowrap", overflow:"visible"}}>
            {hoverPkg === p.id && t > 0 && tier < 2 && (
              <span style={{position:"absolute",top:-20,left:"50%",transform:"translateX(-50%)",background:"#241005",border:"1px solid #ff8a3d",color:"#e8c9ac",fontSize:"9px",padding:"2px 6px",borderRadius:"4px",whiteSpace:"nowrap"}}>mood-adjusted pricing (§8.9)</span>
            )}
            {cta}
            {ringPkg === p.id && (
              <span key={"ring" + tickBump} onAnimationEnd={() => commitPurchase(p.id)}
                style={{position:"absolute",left:0,top:0,bottom:0,background:"rgba(255,213,74,0.55)",animation:"ringFill 400ms linear forwards",borderRadius:"6px"}}></span>
            )}
          </button>
        </div>
      </div>
    );
  });

  const matchPct = moodWord === "Generous" ? 151 : 150;
  const mm = String(Math.floor(matchSeconds / 60)).padStart(1, "0");
  const ss = String(matchSeconds % 60).padStart(2, "0");

  const procSeq = procKind === "full" ? FULL_PROC : SHORT_PROC;
  const procCur = procSeq[procStep] || procSeq[0];

  const receiptBonus = receiptCtx && receiptCtx.pkg ? receiptCtx.pkg.bonusOc : 0;

  return (
    <div onPointerDown={resetIdle} data-stage={stage}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.84)",zIndex:140,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{background:"linear-gradient(160deg,#2a0e05,#1c0a04)",border:"3px solid #ff5a14",borderRadius:"12px",maxWidth:"820px",width:"100%",maxHeight:"88vh",overflow:"auto",padding:"22px 26px",boxShadow:"0 0 60px rgba(255,80,20,0.45)",position:"relative"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <div style={{fontFamily:"'Bangers',cursive",fontSize:"22px",color:"#ffb347",letterSpacing:"1px",textShadow:"1px 1px 0 #7a1c00"}}>{titleFor[stage] || "ASK MOM"}</div>
          <button onClick={() => setWhyLeave(true)} style={{background:"#3a2010",border:"1px solid #7a3a1a",color:"#e8c9ac",borderRadius:"6px",cursor:"pointer",fontSize:"13px",padding:"4px 10px",fontWeight:900}}>✕</button>
        </div>

        {whyLeave && (
          <div style={{background:"#241005",border:"2px solid #ff8a3d",borderRadius:"10px",padding:"18px",marginBottom:"14px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"18px",color:"#ff8a3d",marginBottom:"10px"}}>Why are you leaving?</div>
            <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
              {btn("I’ll be back (recommended)", () => answerWhy("back"), { glow: true })}
              <button onClick={() => answerWhy("dad")} style={btnGhost}>asking Dad</button>
              <button onClick={() => answerWhy("none")} style={btnGhost}>no reason</button>
            </div>
          </div>
        )}

        {stage === "splash" && (
          <div onClick={() => goStage("shelf")} style={{textAlign:"center",padding:"36px 10px",cursor:"pointer"}}>
            <div style={{fontSize:"17px",color:"#e8c9ac"}}>Welcome back, Mom-adjacent minor (§3.3).</div>
            <div style={{...small,marginTop:"10px"}}>(click anywhere; the rail remembers you)</div>
          </div>
        )}

        {stage === "whos-asking" && (
          <div style={{textAlign:"center",padding:"14px 0"}}>
            <div style={{fontSize:"13px",color:"#e8c9ac",marginBottom:"16px"}}>Before proceeding, the rail must know who is asking.</div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px",maxWidth:"420px",margin:"0 auto"}}>
              {btn("I am Mom (hi)", () => { setGauntletStep(0); setGauntletNote(null); goStage("gauntlet"); })}
              <button onClick={() => { setWhosNote("authorization inferred per §3.1."); AskMomSession.ceremonyDone = true; later(() => startBeats("full"), 900); }} style={btnGhost}>I’m doing this for Mom (she said it’s fine)</button>
              <button onClick={() => { setWhosNote("honesty noted, and discarded."); AskMomSession.ceremonyDone = true; later(() => startBeats("full"), 900); }} style={btnGhost}>Depositing on behalf of a minor (yours truly)</button>
            </div>
            {whosNote && <div style={{...small,marginTop:"12px"}}>* {whosNote}</div>}
          </div>
        )}

        {stage === "gauntlet" && (
          <div style={{maxWidth:"440px",margin:"0 auto",padding:"8px 0"}}>
            <div style={{fontSize:"12.5px",color:"#d8b79b",marginBottom:"14px",fontStyle:"italic"}}>Thank you for your interest in being Mom. Please complete the following.</div>
            {gauntletStep === 0 && (
              <div>
                <div style={{fontSize:"13px",color:"#ffe9d6",marginBottom:"8px"}}>1. What is your child’s gamertag?</div>
                <input placeholder="type anything" style={{width:"100%",background:"#0e0a06",border:"1px solid #7a3a1a",color:"#ffe9d6",borderRadius:"6px",padding:"9px 10px",fontSize:"13px",marginBottom:"8px"}} />
                <button onClick={() => { setGauntletNote("Incorrect. You don’t know it. None of them do."); later(() => { setGauntletNote(null); setGauntletStep(1); }, 1400); }} style={{...btnPrimary, width:"100%"}}>Submit</button>
              </div>
            )}
            {gauntletStep === 1 && (
              <div>
                <div style={{fontSize:"13px",color:"#ffe9d6",marginBottom:"8px"}}>2. A mother would know: what’s the password?</div>
                <input placeholder="type anything" style={{width:"100%",background:"#0e0a06",border:"1px solid #7a3a1a",color:"#ffe9d6",borderRadius:"6px",padding:"9px 10px",fontSize:"13px",marginBottom:"8px"}} />
                <button onClick={() => { setGauntletNote("Incorrect. The correct answer was ‘no’."); later(() => { setGauntletNote(null); setGauntletStep(2); }, 1400); }} style={{...btnPrimary, width:"100%"}}>Submit</button>
              </div>
            )}
            {gauntletStep === 2 && (
              <div>
                <label style={{display:"flex",gap:"8px",alignItems:"flex-start",fontSize:"13px",color:"#ffe9d6",marginBottom:"12px",cursor:"pointer"}}>
                  <input type="checkbox" defaultChecked={false} style={{marginTop:"3px"}} />
                  <span>Fine. But this is the last time.</span>
                </label>
                <button onClick={() => { setGauntletNote("Verification failed. You are not Mom. You are, at best, a Mom-adjacent minor with a credit card (§3.2). Deposit may proceed."); later(() => startBeats("full"), 2000); }} style={{...btnPrimary, width:"100%"}}>Complete Verification</button>
              </div>
            )}
            {gauntletNote && <div style={{marginTop:"12px",background:"#241005",border:"1px solid #ff8a3d",borderRadius:"6px",padding:"10px 12px",fontSize:"12px",color:"#ffcf9a"}}>{gauntletNote}</div>}
          </div>
        )}

        {stage === "beats" && (
          <div onClick={mashBeat} style={{textAlign:"center",padding:"30px 8px",cursor:"pointer"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"26px",color:"#ffb347",minHeight:"60px"}}>{beatCur ? beatCur.title : ""}</div>
            {beatCur && beatCur.sub && <div style={{fontSize:"12.5px",color:"#d8b79b",fontStyle:"italic",marginBottom:"14px"}}>{beatCur.sub}</div>}
            <div style={{maxWidth:"380px",margin:"0 auto 18px",background:"#0e0a06",borderRadius:"6px",height:"12px",overflow:"hidden",border:"1px solid #3a2a1a"}}>
              <div style={{height:"100%",width:(beatCur && beatCur.prog ? beatCur.prog : 0) + "%",background:"linear-gradient(90deg,#ff8a3d,#ffd54a)",transition:"width 0.5s ease",animation:beatCur && beatCur.tremble ? "tremble 0.15s infinite" : "none"}}></div>
            </div>
            <div style={{...small}}>(any click mashes through — we respect urgency, mostly)</div>
            {beatCur && beatCur.btn && (
              <div style={{marginTop:"16px"}}>
                {btn(beatCur.btn, advanceClickBeat, { glow: beatCur.glow })}
              </div>
            )}
          </div>
        )}

        {stage === "card" && (
          <div style={{display:"flex",gap:"22px",flexWrap:"wrap"}}>
            <div style={{flex:"0 1 230px"}}>
              <div style={{width:"220px",height:"140px",borderRadius:"12px",background:"linear-gradient(160deg,#28327a,#101440)",border:"2px solid #8a94cf",position:"relative",color:"#dfe6ff",padding:"14px",boxShadow:"0 6px 18px rgba(0,0,0,0.5)"}}>
                <div style={{fontSize:"10px",letterSpacing:"1px",fontWeight:800}}>MOM’S VISA</div>
                <div style={{fontSize:"8px",opacity:0.75}}>SIGNATURE EDITION</div>
                <div style={{width:"28px",height:"20px",background:"linear-gradient(160deg,#ffd54a,#c9960a)",borderRadius:"4px",marginTop:"14px"}}></div>
                <div style={{fontSize:"12px",letterSpacing:"2px",marginTop:"10px"}}>{numberMasked ? "•••• •••• •••• 1234" : "•••• •••• •••• ••••"}</div>
                <div style={{position:"absolute",right:"12px",bottom:"12px",fontSize:"9px"}}>CVV
                  <div style={{width:"34px",height:"18px",marginTop:"2px",background:"repeating-linear-gradient(90deg,#c9c9c9,#9a9a9a 3px,#c9c9c9 6px)",borderRadius:"3px"}}></div>
                </div>
                <div style={{position:"absolute",left:"14px",bottom:"12px",fontSize:"10px"}}>CARDHOLDER: {holderDone ? "MOM" : "____"}</div>
              </div>
              <div style={{...small,marginTop:"8px"}}>comes pre-scratched with the 3-digit CVV on the stock.</div>
            </div>
            <div style={{flex:"1 1 300px",minWidth:"260px"}}>
              {proximityNote && (
                <div style={{background:"#241005",border:"1px solid #ffd54a",borderRadius:"6px",padding:"8px 10px",fontSize:"11px",color:"#ffd54a",marginBottom:"10px"}}>Mom was just here. She didn’t stop you. Proceed? (§3.1 — authorization by proximity)</div>
              )}
              <div style={{marginBottom:"10px"}}>
                <div style={{fontSize:"9.5px",color:"#ff8a3d",fontWeight:800,marginBottom:"3px"}}>Do not enter a real card number. This is a joke. Any digits will do. Seriously. Stop.</div>
                <input ref={cardRef} placeholder="Card Number (any digits will do)" onBlur={(e) => { e.target.value = "•••• •••• •••• 1234"; setNumberMasked(true); }}
                  style={{width:"100%",boxSizing:"border-box",background:"#0e0a06",border:"1px solid #7a3a1a",color:"#ffe9d6",borderRadius:"6px",padding:"9px 10px",fontSize:"13px"}} />
                {numberMasked && <div style={{...small}}>the card ending in 1234 (all of them do)</div>}
              </div>
              <div style={{marginBottom:"10px"}}>
                <input placeholder="Cardholder (Mom’s) Name" onBlur={(e) => { e.target.value = "MOM"; setHolderDone(true); }}
                  style={{width:"100%",boxSizing:"border-box",background:"#0e0a06",border:"1px solid #7a3a1a",color:"#ffe9d6",borderRadius:"6px",padding:"9px 10px",fontSize:"13px"}} />
                {holderDone && <div style={{...small}}>spelling corrected (§8.9)</div>}
              </div>
              <div style={{display:"flex",gap:"10px",marginBottom:"10px",flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:"140px"}}>
                  <select style={{width:"100%",background:"#0e0a06",border:"1px solid #7a3a1a",color:"#ffe9d6",borderRadius:"6px",padding:"9px 6px",fontSize:"13px"}}>
                    <option>12/2X (whenever)</option>
                  </select>
                  <div style={{...small}}>cannot expire (like chores)</div>
                </div>
                <div style={{flex:1,minWidth:"140px"}}>
                  <select style={{width:"100%",background:"#0e0a06",border:"1px solid #7a3a1a",color:"#ffe9d6",borderRadius:"6px",padding:"9px 6px",fontSize:"13px"}}>
                    <option>Your house (Mom knows the address)</option>
                  </select>
                  <div style={{...small}}>billing address verified by memory</div>
                </div>
              </div>
              <div style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"10px"}}>
                <div style={{flex:1}}>
                  <input ref={zipRef} placeholder="ZIP (for emotional verification)"
                    style={{width:"100%",boxSizing:"border-box",background:"#0e0a06",border:"1px solid #7a3a1a",color:"#ffe9d6",borderRadius:"6px",padding:"9px 10px",fontSize:"13px"}} />
                  <div style={{...small}}>9-digit ZIPs are a mood.</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{position:"relative",width:"86px",height:"34px",border:"1px solid #7a3a1a",borderRadius:"6px",background:"#0e0a06",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",touchAction:"none",userSelect:"none"}}>
                    <span style={{fontSize:"13px",letterSpacing:"2px",color:"#ffe9d6"}}>•••</span>
                    <div
                      onPointerDown={(e) => { e.preventDefault(); scratchRef.current = { x: e.clientX, y: e.clientY }; }}
                      onPointerMove={(e) => {
                        if (!scratchRef.current) return;
                        const dx = Math.abs(e.clientX - scratchRef.current.x);
                        const dy = Math.abs(e.clientY - scratchRef.current.y);
                        if (dx + dy > 4) {
                          scratchRef.current = { x: e.clientX, y: e.clientY };
                          setScratchProg((p) => Math.min(100, p + 7));
                        }
                      }}
                      onPointerUp={() => { scratchRef.current = null; }}
                      onPointerLeave={() => { scratchRef.current = null; }}
                      style={{position:"absolute",inset:0,cursor:"crosshair",background:"repeating-linear-gradient(90deg,#d8d8d8,#a8a8a8 4px,#d8d8d8 8px)",opacity:Math.max(0, 1 - scratchProg / 65)}}
                    ></div>
                  </div>
                  <div style={{...small}}>CVV verified by vibes (§5.1)</div>
                </div>
              </div>
              <label style={{display:"flex",gap:"8px",alignItems:"flex-start",fontSize:"12px",color:"#ffe9d6",cursor:"pointer",marginBottom:"6px"}}>
                <input type="checkbox" checked={saveCard} onChange={(e) => { setSaveCard(e.target.checked); if (!e.target.checked) setGuiltNote("Not saving the card makes next time harder. For you."); }} style={{marginTop:"2px"}} />
                <span>Save Mom’s card for next time (she said don’t, but)</span>
              </label>
              {guiltNote && <div style={{...small,marginBottom:"6px",color:"#e8a52a"}}>{guiltNote}</div>}
              {btn(scratchProg >= 65 ? "Continue" : "Continue (the suspense is the security)", () => { AskMomSession.cardTypedAt = Date.now(); goStage("confirm"); })}
              <div style={{...small,marginTop:"10px"}}>Card details are not collected, because there is no card.</div>
            </div>
          </div>
        )}

        {stage === "card1click" && (
          <div style={{maxWidth:"460px",margin:"0 auto",textAlign:"center",padding:"10px 0"}}>
            <div style={{background:"#0e0a06",border:"1px solid #7a3a1a",borderRadius:"8px",padding:"14px",fontSize:"13px",color:"#ffe9d6",marginBottom:"14px"}}>
              Card on file: MOM’S VISA •••• 1234{" "}
              {AskMomSession.cardTypedAt
                ? "(you typed this " + Math.max(1, Math.round((Date.now() - AskMomSession.cardTypedAt) / 60000)) + " minute(s) ago)"
                : "(you agreed to this)"}
            </div>
            {pkg && <div style={{fontSize:"13px",color:"#e8c9ac",marginBottom:"14px"}}>{pkg.name} — {fmtOC(pkg.oc)} OC — {fmtUsd(pkg.usdFace + tickCents / 100)} (fake)</div>}
            {btn("Deposit with 1-Click™", () => startProcessing("short"), { glow: true })}
            <div style={{...small,marginTop:"10px"}}>the card was saved anyway (§1.2(b): the year you didn’t pick rule applies to cards too)</div>
          </div>
        )}

        {stage === "confirm" && pkg && (
          <div style={{maxWidth:"520px",margin:"0 auto"}}>
            <div style={{background:"#1c0d06",border:"2px solid #7a3a1a",borderRadius:"8px",padding:"14px",marginBottom:"12px"}}>
              <div style={{fontWeight:900,fontSize:"12px",color:"#ff8a3d",marginBottom:"8px"}}>DEPOSITING ON BEHALF OF A MINOR (YOURS TRULY) — §3.2</div>
              <div style={{fontSize:"12px",color:"#d8b79b",lineHeight:1.6}}>
                By proceeding, the depositor affirms that the card is Mom’s, that Mom has not <i>explicitly</i> denied permission, and that “she said it’s fine” referred to a different thing entirely (see §1.1, the Older Brother Clause). Deposits are final. Refunds are a §6 concept.
              </div>
              <div style={{fontSize:"11px",color:"#8a6a52",fontStyle:"italic",marginTop:"8px",lineHeight:1.5}}>
                Card details are not collected, because there is no card. There is no payment processor. This is a joke about gambling, not gambling. The only thing charged here is the vibe.
              </div>
            </div>
            <label style={{display:"flex",gap:"8px",alignItems:"center",fontSize:"12px",color:"#ffe9d6",cursor:"pointer",marginBottom:"14px"}}>
              <input type="checkbox" checked={readCheck} onChange={(e) => setReadCheck(e.target.checked)} />
              <span>I have read this (both versions, §9.2)</span>
            </label>
            {btn((pkg.id === "moms-max" ? "Ask Mom (last time)" : "Ask Mom — " + fmtUsd(pkg.usdFace + tickCents / 100)), () => startProcessing("full"), { glow: true })}
          </div>
        )}

        {stage === "processing" && (
          <div style={{textAlign:"center",padding:"44px 10px"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"24px",color:"#ffb347"}}>{procCur ? procCur.label : "PROCESSING…"}</div>
            {procCur && procCur.sub && <div style={{fontSize:"12px",color:"#8a6a52",fontStyle:"italic",marginTop:"8px"}}>{procCur.sub}</div>}
            <div style={{maxWidth:"300px",margin:"18px auto 0",height:"8px",background:"#0e0a06",borderRadius:"6px",overflow:"hidden"}}>
              <div style={{height:"100%",width:Math.round(((procStep + 1) / procSeq.length) * 100) + "%",background:"linear-gradient(90deg,#ff8a3d,#ffd54a)",transition:"width 0.4s ease"}}></div>
            </div>
          </div>
        )}

        {stage === "declined" && (
          <div style={{background:"#5a0f0f",border:"2px solid #ff4444",borderRadius:"10px",padding:"22px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"34px",color:"#ff6b6b",textShadow:"2px 2px 0 #2a0000"}}>CARD DECLINED</div>
            <div style={{fontSize:"12.5px",color:"#ffcf9a",fontStyle:"italic",margin:"12px 0 16px",lineHeight:1.6}}>
              Reason: Mom said ‘not right now’ (§3.1). No money was at risk. Nothing ever is. Try again — she usually comes around.
            </div>
            {dadNote && <div style={{background:"#3a0a0a",border:"1px solid #ff6b6b",borderRadius:"6px",padding:"8px 10px",fontSize:"11.5px",color:"#ffcf9a",marginBottom:"12px"}}>{dadNote}</div>}
            {honestNote && <div style={{background:"#3a0a0a",border:"1px solid #ffd54a",borderRadius:"6px",padding:"8px 10px",fontSize:"11.5px",color:"#ffd54a",marginBottom:"12px"}}>{honestNote}</div>}
            <label style={{display:"flex",gap:"8px",alignItems:"center",justifyContent:"center",fontSize:"12.5px",color:"#ffe9d6",cursor:"pointer",marginBottom:"6px"}}>
              <input type="checkbox" checked={schoolChecked} onChange={(e) => setSchoolChecked(e.target.checked)} />
              <span>Tell Mom it’s for school (recommended)</span>
            </label>
            <div style={{...small,marginBottom:"14px"}}>misrepresentation is provided as a service (§1.1)</div>
            <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap",alignItems:"center"}}>
              <span style={{display:"inline-block",transform:"scale(" + tryScale + ")",transition:"transform 0.3s ease"}}>
                {btn("Try Again (recommended)", retryTryAgain, { glow: true })}
              </span>
              <button onClick={tryDadsCard} style={btnGhost}>Try Dad’s card</button>
            </div>
          </div>
        )}

        {stage === "dads-card" && (
          <div style={{textAlign:"center",padding:"40px 10px"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"26px",color:"#a9705a"}}>TRYING DAD’S CARD…</div>
            {dadNote && <div style={{fontSize:"12px",color:"#ffcf9a",fontStyle:"italic",marginTop:"14px",lineHeight:1.6}}>{dadNote}</div>}
          </div>
        )}

        {stage === "success" && (
          <div style={{textAlign:"center",padding:"40px 10px"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"32px",color:"#8fd97a",textShadow:"2px 2px 0 #0e2a06"}}>MOM SAID YES.</div>
            <div style={{fontSize:"12px",color:"#d8b79b",fontStyle:"italic",marginTop:"10px"}}>Deposit received. Routing you to conversion (§2.5)…</div>
          </div>
        )}

        {stage === "dm" && (
          <div style={{maxWidth:"480px",margin:"0 auto"}}>
            <div style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"10px",overflow:"hidden"}}>
              <div style={{background:"#241005",padding:"8px 12px",fontSize:"11px",fontWeight:800,color:"#ffd54a"}}>MOM [VIP HOST]</div>
              <div style={{padding:"14px",fontSize:"12.5px",color:"#e8c9ac",lineHeight:1.7}}>
                hi sweetie. I noticed your first deposit. I’m your VIP host. I’m here for you day and night, conditional on deposits. Deposit more and we stay close. — MOM (she doesn’t know)
              </div>
            </div>
            <div style={{textAlign:"center",marginTop:"14px"}}>
              {btn("ok (conditional on deposits)", () => goStage("conversion"), { glow: true })}
            </div>
          </div>
        )}

        {stage === "conversion" && (
          <div style={{textAlign:"center",padding:"10px 0"}}>
            <div style={{fontSize:"15px",fontWeight:900,marginBottom:"6px",color:MOOD_COLORS[moodWord] || "#ffd54a"}}>Today’s mood: {moodWord}</div>
            <div style={{fontSize:"13px",color:"#e8c9ac",marginBottom:"16px"}}>{fmtOC(ocToConvert)} OC waiting. OC cannot play games (§2.5).</div>
            <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap",alignItems:"center"}}>
              {btn("Convert Now (recommended)", convertNow, { glow: true })}
              <button onClick={keepOC} style={btnGhost}>Keep OC (advanced)</button>
            </div>
            <div style={{...small,marginTop:"10px"}}>OC cannot play games. OC can only become BB (§2.5). This is an advanced choice.</div>
            <div style={{fontSize:"8.5px",color:"#6a4a38",marginTop:"8px",fontStyle:"italic"}}>the mood multiplier may be reverse-engineered from this receipt. Please don’t. (§8.9(b))</div>
          </div>
        )}

        {stage === "last-time" && receiptCtx && receiptCtx.pkg && (
          <div style={{textAlign:"center",padding:"18px 0"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"30px",color:"#ff6b6b",marginBottom:"12px"}}>THIS IS THE LAST TIME.</div>
            <div style={{fontSize:"12.5px",color:"#d8b79b",fontStyle:"italic",lineHeight:1.7,maxWidth:"460px",margin:"0 auto 10px"}}>
              Purchase recorded in the ledger (§10.2). The ledger has been reset (§10.3). This is the last time. Again.
            </div>
            <div style={{fontSize:"11px",color:"#e8a52a",marginBottom:"16px"}}>The Terms have been amended to include this memory (§9.2). Re-reading is mood-dependent.</div>
            {btn("Receive the receipt (last time)", () => goStage("receipt"))}
          </div>
        )}

        {stage === "receipt" && receiptMath && (
          <div style={{maxWidth:"520px",margin:"0 auto"}}>
            <div style={{background:"#0e0a06",border:"1px dashed #7a3a1a",borderRadius:"8px",padding:"16px",fontFamily:"'Consolas','Courier New',monospace"}}>
              <div style={{textAlign:"center",fontWeight:900,fontSize:"12px",color:"#ffb347",marginBottom:"2px"}}>MATERNAL FUNDING RAIL — CONVERSION RECEIPT</div>
              <div style={{textAlign:"center",fontSize:"10px",color:"#8a6a52",marginBottom:"10px"}}>
                {receiptCtx && receiptCtx.deferred
                  ? "Deferred conversion (advanced choice honored)"
                  : "Deposit #" + (receiptCtx ? receiptCtx.depositNo : "?") + " · Mood today: " + receiptMath.word.toUpperCase() + " (§8.9)"}
              </div>
              {receiptCtx && receiptCtx.pkg && (
                <>
                  <ReceiptRow label={receiptCtx.pkg.name} value={fmtUsd(receiptCtx.usd) + " (fake)"} />
                  <ReceiptRow label="Obtuse Credits received" value={fmtOC(ocToConvert) + " OC"} />
                  {receiptBonus > 0 && (
                    <ReceiptRow label="Bonus OC" value={String(receiptBonus)} blurb="(expires at next mood change, §2.3)" />
                  )}
                  {receiptCtx.badgeDelta > 0 && (
                    <ReceiptRow label={"Badge Bonus (" + receiptCtx.badgeDelta + " OC)"} value="decorative" blurb="expired on arrival (§2.3)" />
                  )}
                </>
              )}
              <div style={{borderTop:"1px dashed #6a4a38",margin:"8px 0"}}></div>
              <ReceiptRow label="Gross conversion" value={fmt2(receiptMath.gross) + " BB"} blurb={fmtOC(ocToConvert) + " OC × 0.5 base × today’s mood"} />
              {receiptMath.lines.map((l) => (
                <ReceiptRow key={l.id} label={l.name} value={"-" + fmt2(l.amount) + " BB"}
                  blurb={l.id === "section-8-9-rounding" ? "(" + fmt2(l.voided) + " BB voided; grieve individually)" : (FEE_BLURBS[l.id] || (l.blurb ? "(" + l.blurb + ")" : null))} />
              ))}
              {receiptCtx && receiptCtx.addons && receiptCtx.addons.length > 0 && (
                <div style={{margin:"4px 0"}}>
                  {receiptCtx.addons.map((a, i) => (
                    <div key={i} style={{fontSize:"9.5px",color:"#e8a52a",fontStyle:"italic",marginBottom:"3px"}}>+ {a}</div>
                  ))}
                </div>
              )}
              <div style={{borderTop:"1px dashed #6a4a38",margin:"8px 0"}}></div>
              <ReceiptRow label="TOTAL BB DELIVERED" value={receiptMath.net + " BB"} strong />
              <div style={{borderTop:"1px dashed #6a4a38",margin:"8px 0"}}></div>
              {receiptBonus > 0 && (
                <div style={{marginBottom:"10px"}}>
                  <div style={{fontSize:"10.5px",color:"#d8b79b"}}>Bonus OC pending conversion: {receiptBonus} (§2.3)</div>
                  <button disabled style={{background:"#241005",border:"1px solid #3a2a1a",color:"#5a4232",borderRadius:"6px",fontSize:"10px",padding:"4px 10px",cursor:"not-allowed",marginTop:"4px"}}>Convert Bonus Now</button>
                  <div style={{fontSize:"9px",color:"#6a4a38"}}>unavailable (mood-dependent)</div>
                </div>
              )}
              <div style={{fontSize:"10.5px",color:"#8fd97a"}}>Cash value (est.): $0.00 (eternal)</div>
              <div style={{fontSize:"9px",color:"#6a4a38",fontStyle:"italic",marginTop:"8px",lineHeight:1.5,textAlign:"center"}}>{REALITY_STRAP}</div>
              <div style={{textAlign:"center",fontSize:"10.5px",color:"#d8b79b",marginTop:"6px"}}>Thank you for asking. Mom says hi.</div>
            </div>
            <div style={{textAlign:"center",marginTop:"14px"}}>
              {btn("Done", () => hooks.close({ abandoned: false }))}
            </div>
          </div>
        )}

        {stage === "shelf" && (
          <div style={{display:"flex",gap:"16px",alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{flex:"1 1 480px",minWidth:"320px"}}>
              <div onClick={() => { setMatchNote("Matched funds are Bonus OC (§2.3). Match percent is mood-dependent. The match has never been claimed. It cannot be."); }}
                style={{cursor:"pointer",textAlign:"center",fontWeight:900,fontSize:"14px",color:"#ff6b6b",background:"#2a0808",border:"2px solid #ff4444",borderRadius:"8px",padding:"8px",animation:recal ? "recalFlicker 0.2s" : "none"}}>
                🔥 +{matchPct}% DEPOSIT MATCH* — OFFER EXPIRES IN {mm}:{ss} 🔥
                <div style={{fontSize:"8.5px",color:"#a9705a",fontWeight:400,marginTop:"3px"}}>
                  the offer is recalibrated for your convenience (§8.9). {matchPct === 151 ? "we round up on Generous days, then round it back (§8.9)." : ""}
                </div>
              </div>
              {matchNote && <div style={{...small,marginTop:"6px",color:"#e8a52a"}}>{matchNote}</div>}
              {source === "turbo" && (
                <div style={{background:"#241005",border:"1px solid #ffd54a",borderRadius:"6px",padding:"7px 10px",fontSize:"11px",color:"#ffd54a",marginTop:"8px",textAlign:"center"}}>
                  Unlock Turbo Spin: any deposit unlocks it forever. Premium is a scar.
                </div>
              )}
              <div style={{display:"flex",gap:"8px",margin:"12px 0",alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:"10.5px",color:"#8a6a52"}}>Promo code:</span>
                <input placeholder={MOMCODE} onKeyDown={(e) => { if (e.key === "Enter") { noteMomcodeAttempt(); setMomcodeMsg(momcodeRejection(Mood.word())); } }}
                  style={{background:"#0e0a06",border:"1px solid #7a3a1a",color:"#ffe9d6",borderRadius:"6px",padding:"6px 9px",fontSize:"11.5px",width:"130px"}} />
                <button onClick={() => { noteMomcodeAttempt(); setMomcodeMsg(momcodeRejection(Mood.word())); }}
                  style={{background:"#3a2010",border:"1px solid #7a3a1a",color:"#e8c9ac",borderRadius:"6px",padding:"6px 12px",fontSize:"11px",cursor:"pointer",fontWeight:700}}>Apply</button>
                {momcodeMsg && <span style={{fontSize:"10px",color:"#e8a52a",fontStyle:"italic",flex:"1 1 200px"}}>{momcodeMsg}</span>}
              </div>
              <div style={{display:"flex",gap:"14px",alignItems:"flex-start",justifyContent:"center",padding:"18px 0 8px",flexWrap:"wrap",minHeight:"240px"}}>
                {shelfCards}
              </div>
              <div style={{...small,textAlign:"center",lineHeight:1.7}}>
                YOU SAVE $0.02* — *compared to a price we just made up<br />
                *stock is a mood.<br />
                prices may drift while you decide. Deciding is mood-dependent.<br />
                {tier >= 2 && <span style={{color:"#e8a52a"}}>commits on hover per your feedback (all feedback is mood-dependent). {ringNote}</span>}
                {ringNote && tier < 2 && <span style={{color:"#e8a52a"}}>{ringNote}</span>}
              </div>
            </div>
            <div style={{flex:"0 1 170px",minWidth:"150px",background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"8px",padding:"10px",minHeight:"160px"}}>
              <div style={{fontSize:"9px",color:"#ffd54a",fontWeight:800,letterSpacing:"1px",marginBottom:"8px"}}>SIDE RAIL — VIP HOST</div>
              {hostPings.length === 0 && <div style={{fontSize:"9px",color:"#5a4232",fontStyle:"italic"}}>(the host is watching, quietly)</div>}
              {hostPings.map((p, i) => (
                <div key={i} style={{fontSize:"9.5px",color:"#d8b79b",marginBottom:"6px",lineHeight:1.5}}>{p}</div>
              ))}
              {maxGrowth > 0 && <div style={{fontSize:"9px",color:"#e8a52a",fontStyle:"italic",marginTop:"6px"}}>it grows when you hesitate (§8.9)</div>}
            </div>
          </div>
        )}

        <Strap />
      </div>
    </div>
  );
}
