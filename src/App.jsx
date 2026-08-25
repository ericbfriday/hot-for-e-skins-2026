import React from 'react'
import { Mood } from "./spine/mood.js";
import { Bus, EVENTS } from "./spine/bus.js";
import { Vault } from "./spine/vault.js";
import { HouseBand, BAND_PRIORITIES, MUTE_TOOLTIP, MUTE_FINE_PRINT, SIREN_DISCLOSURE, BAND_FOOTER_CREDIT, AUTOPLAY_NOTE, RESTORE_TOAST } from "./spine/band.js";
import { Identity, complianceFilter, YOU_COLOR, CUSTOM_NAME_PRICE_OC } from "./spine/identity.js";
import { Consent } from "./spine/consent.js";
import AskMomFlow from "./askmom/AskMomFlow.jsx";
import ChatPanel from "./chat/ChatPanel.jsx";
import TickerPanel from "./ticker/TickerPanel.jsx";
import { Ticker } from "./ticker/controller.js";
import {
  loadOC, saveOC, loadBonus, saveBonus, clearBonus, loadDepositStats, noteChaseAttempt,
} from "./askmom/session.js";
import {
  GAME_PRICES_BB, MATERNAL_STARTER_GRANT_BB, DESPERATION_THRESHOLD_BB,
  V_GEMS_PER_BB, SKINCOINZ_PER_BB, LEGACY_TO_WHOLE_BB_SCALE,
  NAG_LOW_BB_COPY, INSUFFICIENT_FUNDS_COPY, INSUFFICIENT_FUNDS_ESCALATION_COPY
} from "./spine/constants.js";
import {
  fundNameForRun, dodgeStage, dodgeLabel, dodgeOffset, dodgeScale,
  scriptRun, computeExhaustionPayout, CRASH_REBATE_BB, CRASH_TICKER_TEMPLATES,
} from "./games/crash.js";
import {
  defuseDurationMs, buildDefuseStages, TRACK_NAME_CAPTION,
  FRUIT_ROLL_UP, pickAward, confettiEligible, buildReelStrip, kindForTier,
  incrementPity, localDayKey, dayKeyBefore, CRATE_TICKER_TEMPLATES, CRATE_CHAT,
  SKIP_PRICE_BB, SKIP_STALL_EXTENSION_MS, SKIP_JUMP_PCT, SKIP_APPEARS_AT_PCT,
} from "./games/crates.js";
import { Inventory } from "./games/inventory.js";
import { pseudoHash12 } from "./games/fairness.js";
import * as Roulette from "./games/roulette.js";
import * as Coinflip from "./games/coinflip.js";
import { CATALOG, RARITY_COLORS, catalogById, fmtUSD } from "./games/catalog.js";
import {
  Market, buyQuote, currentEst, featuredItems,
  escrowProgress, escrowReason, ocEquivalent,
  COMPLIANCE_CHECKLIST, SUPPORTBOT_DEFLECTIONS, SUPPORTBOT_CLOSE,
  TRADE_HOLD_LABEL, INSTANT_SELL_SUBLIE, DIGITAL_ASSET_VALUE, DIGITAL_ASSET_SECTION,
  DIGITAL_ASSET_SELL_TOOLTIP, RECEIPT_FLAVOR, MARKET_OC_NOTICE, ESTIMATE_FOOTER, PORTFOLIO_HOVER,
} from "./games/marketplace.js";
import {
  PANIC_DISGUISE_KEY, PANIC_PRESSES_KEY, PANIC_HINT_KEY, PANIC_FORFEIT_KEY,
  HUSH_GRATUITY_BB, ESC_TOOLTIP, CRATE_ESC_ANSWER, ESSAY_EXPORT_LINE, RUNG2_MARGIN_COMMENT,
  SUSPICION_TOAST, MOOD_FOOTNOTE, MOOD_CROSSED_LINE, HUSH_LINE, HUSH_WAIVED_LINE,
  RG_TAGLINE, PROVABLY_MOM_CHAT,
  generateDisguise, essayParagraphs, growthParagraphs, staticWordCount, startingWordCount,
  wordCountAt, rungFor, restoreLabelFor, docTitleFor, FAVICON_DOC, forfeitLineFor,
  gradeLabel, teacherDisplay,
} from "./panic/homework.js";

const SKIN_IMAGES = Object.fromEntries(
  Object.entries(import.meta.glob("./assets/skins/*.jpg", { eager: true })).map(([path, mod]) => [
    path.split("/").pop().replace(".jpg", ""),
    mod.default,
  ])
);

// The skin catalog + rarity palette live in src/games/catalog.js since #27
// (the pure marketplace engine needs numeric baselines without importing React).
const ROULETTE_STRIP = Array.from({length:20},(_,i)=>{const it=CATALOG[i%CATALOG.length];return {short:it.name.split("|")[0].trim(),color:RARITY_COLORS[it.rarity]||"#ff8a3d",image:SKIN_IMAGES[it.id]};});

// Trade-Up Contract reel (§8): decorative, lands on the pre-decided output,
// and the Covert Extravagance slot scoots one position left as the needle
// approaches (near-miss reel callback).
function contractReelStrip(outputLabel, scoot){
  const fillers = ["Consumer Grade Trash","Industrial Denial","Mil-Spec Regret","Classified Overdraft","Contraband Liability","Mil-Spec Regret","Classified Overdraft"];
  const covertAt = scoot ? 7 : 8;
  const strip = [];
  for (let i=0;i<12;i++){
    if (i===9) strip.push(outputLabel);
    else if (i===covertAt) strip.push("Covert Extravagance");
    else strip.push(fillers[i%fillers.length]);
  }
  return strip;
}

const GATE_CHECKBOXES = [
  "I am at least 18 years old.",
  "My older brother is in the other room and said it's fine. (§1.1)",
  "I accept that 'the law of vibes' is not a real jurisdiction and agree to be bound by it anyway.",
];
const GATE_REJECTIONS = [
  "That year is not accepted at this time.",
  "Error: that year would make you an adult, and adults don't type like this.",
  "Our records indicate you were born in 2012. Records are final (§1.2(a)).",
];
const KAREN_YEAR = "1998 (Mom's friend Karen's son)";
const SHUFFLED_YEARS = (()=>{const y=Array.from({length:2015-1990+1},(_,i)=>String(1990+i));for(let i=y.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[y[i],y[j]]=[y[j],y[i]];}return y;})();
const REALITY_STRAP = "100% fake. No money moves. No card is charged. No account exists. Ever. (§12.4)";
const GRANT_TOAST = "Maternal Starter Grant received: "+MATERNAL_STARTER_GRANT_BB+" Banana Bucks (§2.6). Mom doesn't know yet.";
const TOS_EDIT_NOTICE = "Notice: §8.9 was edited while you were reading this. The mood has changed. No further information will be provided.";

const TOS_ARTICLES = [
  {title:"Article 1 — About You", clauses:[
    {n:"§1.1",t:"The Older Brother Clause",b:"Users are eligible if they are at least 18 years old, OR their older brother is in the other room and said it's fine. The Older Brother's permission is self-sufficient, non-transferable to younger siblings' friends, and expires when he gets up to get a snack. The Operator may not verify the Older Brother's existence, location, or vibe."},
    {n:"§1.2",t:"Date of Birth Attestation",b:"(a) The User's birth year is whatever the dropdown eventually accepts. Records are final. (b) Birth years that would make the User an adult are rejected on sight, as adults do not type like this. The year the User did not pick may be recorded for marketing purposes."},
    {n:"§1.3",t:"Identity Verification",b:"(a) To execute a balance withdrawal exceeding $0.00, users must upload a notarized copy of their 4th-grade report card, a signed handwritten letter from their guidance counselor, and physical delivery of three (3) unopened energy drink cans to our P.O. Box in Grand Cayman. (b) All withdrawal requests remain in a state of Pending until the foregoing is received. The foregoing has never been received. Withdrawals are, accordingly, Pending. (See also §6.)"},
  ]},
  {title:"Article 2 — The Money (Such As It Is)", clauses:[
    {n:"§2.1",t:"Emotional Tender",b:"Obtuse Credits™ are non-refundable, non-transferable, and constitute \"emotional tender\" — a currency that binds only feelings. Upon acquisition, OC are legally indistinguishable from pride."},
    {n:"§2.2",t:"Banana Bucks",b:"Banana Bucks (BB) are the play currency in which all wagers are denominated. BB hold no value of any kind, which the Operator considers a feature."},
    {n:"§2.3",t:"Bonus Credits",b:"\"Bonus\" OC included with select refill packages are bonus in name only. Bonus OC expire with the mood that granted them: at the next daily mood change they are void, unconverted, and described in the past tense. Expired Bonus OC may not be mourned on the premises."},
    {n:"§2.4",t:"Derived Denominations",b:"V-Gems (×40,000 per BB) and SkinCoinz (×566.67 per BB) are display-only derivations of the BB balance, rounded in whichever direction hurts. The USD denomination is permanently estimated at $0.00. This is not a rounding error. This is the estimate."},
    {n:"§2.5",t:"One-Way Conversion",b:"OC may be converted to BB (see §8). BB may not be converted to OC, back to Mom's card, or into anything else, a state the Operator describes as \"diplomatically impossible.\""},
    {n:"§2.6",t:"Maternal Starter Grant",b:"Each new player receives 150 BB, issued as the Maternal Starter Grant: an advance against future chores, repayable in chores, forgiven never. Mom does not know about this loan. She will."},
  ]},
  {title:"Article 3 — The Maternal Funding Rail", clauses:[
    {n:"§3.1",t:"Authorized Cardholder",b:"The only authorized funding instrument is Mom's card. Authorization is inferred from proximity, plausibility, and the phrase \"she said it's fine.\""},
    {n:"§3.2",t:"Depositing on Behalf of a Minor",b:"By proceeding, the depositor affirms that the card is Mom's, that Mom has not explicitly denied permission, and that \"she said it's fine\" referred to a different thing entirely (see §1.1, the Older Brother Clause). Deposits are final. Refunds are a §6 concept. Card details are not collected, because there is no card. There is no payment processor. This is a joke about gambling, not gambling. The only thing charged here is the vibe."},
    {n:"§3.3",t:"Are You Mom? Verification",b:"Persons claiming to be Mom must complete the Verification Gauntlet. The Gauntlet cannot be passed. Applicants who fail the Gauntlet are certified Mom-adjacent minors and may deposit immediately. Mom herself has never applied, and good for her."},
    {n:"§3.4",t:"Maternal Gratuity",b:"Every conversion includes a Maternal Gratuity of 1 BB. The Gratuity is customary, not required, automatically applied, non-negotiable, and retained entirely by the house. Tipping is how Mom shows she cares; here, the site shows it on her behalf, to itself."},
    {n:"§3.5",t:"Refill Packages",b:"Refill packages (\"Lunch Money Special,\" \"Allowance Advance,\" \"Report Card Bonus,\" \"Mom's Max\") are priced in fake USD and denominated in OC. \"Mom's Max\" is sold on the understanding that this is the last time, an understanding that resets upon purchase (see §10.3)."},
  ]},
  {title:"Article 4 — Disputes", clauses:[
    {n:"§4.1",t:"Dispute Resolution",b:"All claims, disputes, or losses shall be resolved not in a court of law, but via a mandatory 1v1 Quickscope Match on Rust (Radar Always On, Intervention Only). If the User loses, their account balance is permanently forfeited to site operational overhead. The Operator has never lost this match. The Operator practices."},
    {n:"§4.2",t:"Reenactments",b:"All reels, wheels, coins, multipliers, progress bars, and replays are reenactments of outcomes decided before the animation began. The performance is staged for your convenience. Disputes concerning the outcome concern the outcome; disputes concerning the performance concern nothing (see §4.1). Near-misses are choreography, and the choreographer is on staff."},
  ]},
  {title:"Article 5 — Gameplay & Fairness", clauses:[
    {n:"§5.1",t:"Provably Fair™",b:"Every roll is verifiable. Verification is Pending (see §1.3). The PROVABLY FAIR™ badge links somewhere. Where is a mood."},
    {n:"§5.2",t:"Odds Disclosure",b:"Odds: yes. (Full table available on request. Requests are mood-dependent, per §8.9.)"},
    {n:"§5.3",t:"The House",b:"The house always wins eventually. \"Eventually\" is defined by the house, mid-game, out loud, while laughing."},
    {n:"§5.4",t:"Edge Outcomes",b:"(a) In the event of an edge outcome, the tie is awarded to the server host. The rim is load-bearing. (b) Each player's first flip is permitted to win. One (1) per session, per tradition. (c) Repeated edge outcomes are adjudicated by increasingly qualified personnel, up to and including the admin's cousin (studying for it) and quantum drift (§8.9). (d) The Maternal Doubloon's faces are MOM and §8.9. The rim is the house's."},
    {n:"§5.5",t:"Scheduling & Character Building",b:"(a) All outcomes are scheduled in advance for your convenience. (b) The schedule is disclosed to no one, for any reason. Disclosure is a mood. (c) Everyone wins once. It builds character."},
  ]},
  {title:"Article 6 — Withdrawals & Other Theoretical Concepts", clauses:[
    {n:"§6.1",t:"Pending Status",b:"Withdrawals are Pending. See §1.3, which is not near here on purpose."},
    {n:"§6.2",t:"ExpressCashout",b:"An express cash-out feature is coming soon. ETA: mood."},
  ]},
  {title:"Article 7 — Responsible Gaming", clauses:[
    {n:"§7.1",t:"Self-Exclusion",b:"To self-exclude, close the tab. To permanently self-exclude, have Mom change the Wi-Fi password. She has been meaning to anyway."},
    {n:"§7.2",t:"Deposit Limits",b:"To set a deposit limit, ask Mom to set a deposit limit. This is the only supported limit mechanism, and it is extremely effective."},
    {n:"§7.3",t:"Parental Bailout Feature",b:"The Operator is proud to offer a best-in-class responsible gaming suite: the MOM'S HOME button instantly replaces the entire casino with homework. No licensed operator offers anything comparable, which says something about licensed operators."},
    {n:"§7.4",t:"The Honest Paragraph",b:"If gambling has stopped being a joke for you or for someone you know, the joke portion of this website is over for one paragraph: help is real and it works — BeGambleAware (begambleaware.org), Gamblers Anonymous (gamblersanonymous.org), or in the US, 1-800-GAMBLER. That was the only honest paragraph on this site. Everything else, including this sentence's neighbors, is satire."},
  ]},
  {title:"Article 8 — Rates, Fees & Moods", art8:true, clauses:[
    {n:"§8.1",t:"Conversion, Generally",b:"OC convert to BB at a base rate multiplied by the Daily Mood (§8.9). The numeric rate is never displayed. It has been described as \"a number,\" which is all the disclosure required by vibes."},
    {n:"§8.2",t:"Mood Stabilization Fee",b:"Each conversion bears a Mood Stabilization Fee of 7.3%. The fee keeps the rate from getting worse. The rate gets worse anyway, but calmer."},
    {n:"§8.3",t:"Conversion Processing Fee",b:"Each conversion bears a flat Conversion Processing Fee of 5 BB, which compensates the house for pressing the button."},
    {n:"§8.4",t:"Order of Operations",b:"Fees apply in the order listed on the receipt, then §8.9 applies to whatever remains, then whatever remains after that is what you get."},
    {n:"§8.5",t:"No Take-Backs",b:"Conversions are final, even if the mood improves one hour later. Especially then."},
    {n:"§8.6",t:"Reserved",b:"Reserved for fees we haven't invented yet."},
    {n:"§8.7",t:"Rim Maintenance",b:"Each flip bears a Rim Maintenance fee, compensating the house for certifying both faces of the Maternal Doubloon and, especially, the rim. The rim is load-bearing (see §5.4). Maintenance is customary, not required, and automatically applied."},
    {n:"§8.8",t:"Reserved",b:"Reserved for fees we haven't invented yet either."},
    {n:"§8.9",t:"Currency Volatility",b:"(a) SkinCoinz and Banana Bucks hold no real-world monetary value, spiritual value, or intrinsic utility, and may be recalculated at any time based on the server admin's daily mood. (b) Obtuse Credits™ are included in the foregoing by reference and also by mood. The Daily Mood is deterministic, shared by all players for the whole day, expressed publicly only as one (1) of five (5) adjectives, and never favorable two days in a row, because that would be suspicious. (c) §8.9 rounding is always down. Fractional BB are voided and itemized on the receipt so that you may grieve them individually."},
  ]},
  {title:"Article 9 — Amendments", clauses:[
    {n:"§9.1",t:"Unilateral Amendments",b:"These Terms may be amended at any time, for any reason, or for no reason, which the Operator finds funny."},
    {n:"§9.2",t:"Notice",b:"Notice of amendment shall be provided by a small toast stating that a section was edited while you were reading this. Continued reading constitutes acceptance of both versions. Not reading also constitutes acceptance. Acceptance is the default state of the User (§10.2)."},
  ]},
  {title:"Article 10 — Consent Theater", clauses:[
    {n:"§10.1",t:"Scroll Requirement",b:"(a) Consent is valid only upon reaching the bottom of all forty (40) screens of these Terms, as measured by the Consent Meter. (b) The Meter caps at 99% until the User lingers at the bottom for three (3) seconds, a dwell requirement so that acceptance may be savored."},
    {n:"§10.2",t:"The Ledger",b:"The User's acceptances are recorded in a bound leather ledger kept in the treehouse. The ledger is real to us."},
    {n:"§10.3",t:"Re-Acceptance",b:"The Meter re-arms upon: (i) purchase of Mom's Max, the \"last time\" package, because last times reset the ledger; and (ii) any Notice under §9.2, effective on the next opening of these Terms."},
  ]},
  {title:"Article 11 — Privacy", clauses:[
    {n:"§11.1",t:"Your Data",b:"All data is stored in your own browser. Our server is your browser, which means our security posture is your security posture, and we wish you luck."},
  ]},
  {title:"Article 12 — Miscellaneous", clauses:[
    {n:"§12.0",t:"Emergency Maternal Protocol",b:"In the event of maternal proximity, triple-tap ESC. This is the only three-tap sequence the site takes seriously."},
    {n:"§12.1",t:"Entire Agreement",b:"This is the entire agreement. There is nothing else. Do not look for anything else."},
    {n:"§12.2",t:"Severability",b:"If any clause is found to be enforceable, it was a drafting error and will be replaced with a joke."},
    {n:"§12.3",t:"Governing Law",b:"The law of vibes, as established at the Age Gate."},
    {n:"§12.4",t:"Reality",b:"Nothing in these Terms, on this website, or in your balance is real. This is a satirical parody of skin-gambling websites. No real money, payment, account, or server exists. If any clause herein appears to create a real financial obligation, it is a joke, and the joke is at the expense of websites that mean it."},
  ]},
];

const TOS_FILLER_TEMPLATES = [
  "WHEREAS the User, hereinafter 'the User,' did whereas the foregoing, notwithstanding;",
  "The Operator reserves all rights, including the rights not enumerated, the rights previously waived, and the right of way.",
  "This paragraph intentionally left enforceable.",
];
const TOS_FILLER = Array.from({length:35},(_,i)=>{
  const num = 13.1 + i*(28.8/34);
  const art = Math.floor(num);
  let sub = Math.round((num-art)*10);
  if (sub<1) sub=1; if (sub>9) sub=9;
  const n = "§"+art+"."+sub;
  if (i===9||i===19||i===29) return {n, body:"Mood: [REDACTED]"};
  if (i===33) return {n, body:"so close! (0.0%)", faint:true};
  return {n, body:TOS_FILLER_TEMPLATES[i%3]};
});

function fmtBB(bb){
  if (!Number.isFinite(bb)) return "0";
  return String(parseFloat(bb.toFixed(2)));
}

class App extends React.Component {
  state = {
    ageVerified:false, confettiOn:false, confettiPieces:[],
    flowPhase:"gate", gateStep:0, gateChecks:[false,false,false], gateMomNote:null,
    gateYearMsg:null, gateYearOk:false, gateRejections:0,
    momModalOpen:false, momModalStep:0, momModalMsg:null, momModalQ1:"", momModalQ2:"", momModalCheck:false,
    momsGlow:false,
    tosOpen:false, tosConsent:false, tosNeedsConsent:true, tosAcceptedEver:false,
    tosPct:0, tosDwellOk:false,
    identityOpen:false, customInput:"", customMsg:null,
    ident:null, stats:null,
    panicActive:false,
    panicEssay:null, panicWordCount:0, panicHint:null, panicFileMenu:false,
    panicWelcome:null, panicMoodShown:false,
    activeTab:"roulette", balanceBB:MATERNAL_STARTER_GRANT_BB, insufficientMsg:null, sessionSpendFailures:0,
    moodWord:null, denomsOpen:false,
    balanceOC:0, bonusOC:null, askmom:null, toasts:[], ocFly:null, cooldown:null, streakChip:null, abandonedCount:0,
    chat:[],
    rouletteSpinning:false, rouletteOffset:0, rouletteTransition:"none", rouletteResult:null,
    rouletteInsured:true, rouletteTurbo:false, rouletteTurboUnlocked:false,
    rouletteStreak:0, rouletteNearMissBackToBack:false, rouletteConsolationMsg:null,
    rouletteReceipt:null, rouletteReceiptOpen:false,
    rouletteFairness:null, rouletteFairnessOpen:false,
    rouletteJackpotBox:null, rouletteBannerNames:[],
    coinFlipping:false, coinResult:null,
    coinEdgeCount:0, coinStreak:0, coinLastCall:null, coinCallCounts:{MOM:0,"§8.9":0},
    coinBotPityUsed:false, coinDoN:null, coinPhotoBackToBack:false,
    coinReceipt:null, coinReceiptOpen:false, coinFairness:null, coinFairnessOpen:false,
    coinStashItem:null,

    // College Fund Crash (session-scoped theater; balance itself lives in balanceBB)
    crashPhase:"idle", crashMult:1.00, crashCrashed:false, crashResult:null,
    crashDodges:0, crashExhausted:false, crashOffset:{x:0,y:0}, crashScale:1,
    crashButtonLabel:"Cash Out", crashStickActive:false, crashProcessing:false,
    crashRunCount:0, crashConsecutiveLosses:0, crashCharacterWinUsed:false,
    crashCommitment:null,

    // Loot Crate Defuser
    crateKeyBought:false, crateOpening:false, crateProgress:0, crateResult:null,
    crateStage:null, crateCaption:"", crateSkipAvailable:false, crateSkipUsed:false,
    crateReel:null, crateRevealPhase:null, crateAward:null,
    crateSessionOpened:0, crateFreeKeyCount:0, crateInspectOpen:false,
    cratePity:0, crateDupeIds:[], crateHeldCount:0,
    crateMomKeyClaimableToday:false, crateMomKeyStreak:0, crateEnvelope:null,

    // Marketplace & Inventory (#27)
    invOpen:false, invDetailId:null, invAppeal:{id:null, step:0, closed:false},
    marketCheckout:null, marketFlicker:null, marketSig:"",
    marketAskFor:null, marketAskInput:"",
    contractSel:[], contractPhase:null, contractResult:null, contractScoot:false,

    bandMuted: HouseBand.isMuted(),
  };

  _tosScrollRef = React.createRef();
  _art8Ref = React.createRef();
  _rouletteWelcomeUsed = false;
  _rouletteLastNearMissId = null;
  _coinWelcomeUsed = false;

  componentDidMount() {
    let balance = MATERNAL_STARTER_GRANT_BB;
    let returning = false;
    let ageOk = false;
    try {
      const saved = localStorage.getItem("hfes_balance_bb");
      const legacy = localStorage.getItem("hfes_balance");
      const age = localStorage.getItem("hfes_age");
      if (saved !== null) {
        const v = parseFloat(saved);
        balance = Number.isFinite(v) && v >= 0 ? v : MATERNAL_STARTER_GRANT_BB;
        returning = true;
      } else if (legacy !== null) {
        const v = parseFloat(legacy);
        balance = Number.isFinite(v) ? Math.max(0, v*LEGACY_TO_WHOLE_BB_SCALE) : MATERNAL_STARTER_GRANT_BB;
        returning = true;
        localStorage.removeItem("hfes_balance");
      }
      ageOk = age === "1";
    } catch(e){}
    let tosAcceptedEver = false;
    try { tosAcceptedEver = !!(JSON.parse(localStorage.getItem("hfes_tos") || "null") || {}).acceptedOnce; } catch(e){}
    const sess = Identity.beginSession();
    let flowPhase = "gate";
    let welcomeToast = null;
    if (ageOk) {
      flowPhase = "done";
      if (!sess.existingIdentity) {
        Identity.assign();
        welcomeToast = "New identity detected. Previous debts forgiven. Previous winnings also forgiven (§8.9).";
      } else if (sess.toast) {
        welcomeToast = sess.toast;
      }
    }
    let cratePity = 0, crateDupeIds = [];
    let crateMomKeyStreak = 0, crateMomKeyClaimableToday = false;
    try {
      const p = parseInt(localStorage.getItem("hfes_crate_pity"), 10);
      cratePity = Number.isFinite(p) && p >= 0 && p < 50 ? p : 0;
      crateDupeIds = JSON.parse(localStorage.getItem("hfes_crate_dupes") || "[]");
      if (!Array.isArray(crateDupeIds)) crateDupeIds = [];
      const streak = parseInt(localStorage.getItem("hfes_crate_momkey_streak"), 10);
      crateMomKeyStreak = Number.isFinite(streak) && streak >= 0 ? streak : 0;
      const todayKey = localDayKey();
      const lastDay = localStorage.getItem("hfes_crate_momkey_day");
      crateMomKeyClaimableToday = lastDay !== todayKey;
    } catch (e) {}

    let oc = loadOC();
    let bonus = loadBonus();
    if (bonus && Date.now() >= bonus.expiresAt) {
      const expired = bonus.amount;
      clearBonus(); bonus = null;
      setTimeout(()=>{ this.toast("Your "+expired+" Bonus OC expired as scheduled (§2.3). They are survived by nothing."); HouseBand.ocFuneral(); }, 900);
    }
    this.setState({
      balanceBB:balance, flowPhase, ageVerified:ageOk,
      tosAcceptedEver, tosNeedsConsent:!tosAcceptedEver,
      ident:Identity.get(), stats:Identity.getStats(),
      balanceOC:oc, bonusOC:bonus, streakChip: loadDepositStats().streak,
      cratePity, crateDupeIds, crateMomKeyStreak, crateMomKeyClaimableToday,
      rouletteTurboUnlocked: loadDepositStats().ever,
      coinStashItem: Coinflip.pickStashItem(),
    });
    this.saveBalance(balance);
    if (welcomeToast) this.toast(welcomeToast);
    this._offMood = Mood.onChange(({word})=>{
      this.setState({moodWord:word});
      // Local-midnight day flip: the Daily Mom Key re-arms (per-day draw family).
      try {
        const lastDay = localStorage.getItem("hfes_crate_momkey_day");
        if (lastDay !== localDayKey()) this.setState({crateMomKeyClaimableToday:true});
      } catch (e) {}
      const b = this.state.bonusOC;
      if (b && Date.now() >= b.expiresAt) {
        clearBonus();
        this.setState({bonusOC:null});
        this.toast("Your "+b.amount+" Bonus OC expired as scheduled (§2.3). They are survived by nothing.");
        HouseBand.ocFuneral(); // three descending notes at the mood-change crossfade (audio-gags §2.6)
      }
    });
    this._offIdent = Identity.subscribe(({identity, stats})=>this.setState({ident:identity, stats}));
    Mood.init();
    this._offDeposit = Bus.on(EVENTS.DEPOSIT_COMPLETED, (p)=>{
      if (p.firstEver) {
        this.toast("Turbo Spin unlocked. It never re-locks. Premium is a scar.");
        this.setState({rouletteTurboUnlocked:true});
      }
      if (p.packageId === "moms-max") {
        this.toast("VIP TIER: MOM'S FAVORITE (full). It unlocks nothing. The house appreciates you.");
      }
      this.setState({streakChip: loadDepositStats().streak});
    });
    this._consolationKeyClaimed = false;
    this._offMilestone = Bus.on(EVENTS.STATS_MILESTONE, (p)=>{
      if (p && p.field === "lossStreak" && p.value === 3 && !this._consolationKeyClaimed) {
        this._consolationKeyClaimed = true;
        this.setState(s=>({crateFreeKeyCount:s.crateFreeKeyCount+1, crateEnvelope:{kind:"consolation"}}));
        this.toast("Consolation Key™ — You lost. Have a key. Crates always feel like winning.®");
        this.pushTicker("A key arrived from Mom (no return address)");
      }
    });
    this._offInventory = Inventory.subscribe(()=>this.setState({crateHeldCount: Inventory.list().length}));
    this.setState({crateHeldCount: Inventory.list().length});
    this._lastInput = Date.now();
    this._lastIdleNag = 0;
    this._activity = ()=>{ this._lastInput = Date.now(); };
    window.addEventListener("pointerdown", this._activity);
    window.addEventListener("keydown", this._activity);
    window.addEventListener("wheel", this._activity);
    this._idleInt = setInterval(()=>{
      const now = Date.now();
      if (this.state.balanceBB < DESPERATION_THRESHOLD_BB && now - this._lastInput > 45000 && now - this._lastIdleNag > 300000) {
        this._lastIdleNag = now;
        this.toast("MOM (1 missed call) — she senses opportunity", {actionLabel:"+ Top Up", onAction:()=>this.openAskMom({source:"nag"})});
      }
    }, 5000);
    this._offBandSettled = Bus.on(EVENTS.ROUND_SETTLED, () => {
      // The House Band flags the first full fanfare after a net-loss win; the
      // 4pt LDW disclosure rides it (audio-gags §8).
      const d = HouseBand.takeLDWDisclosure();
      if (d) this.toast(d, {dismissLabel:"Acknowledged (4pt)"});
    });
    Ticker.init({ balanceBB: balance });
    Bus.emit(EVENTS.SESSION_STARTED, {returning, balanceBB: balance});
    // #27 marketplace: portfolio seed + the Rollback Event check (session load;
    // deterministic daily seed, ≥ 3 Market-Grade holdings, > 24h since the last
    // one, 10% — spec §9's cadence rules).
    Market.init();
    const rollback = Market.maybeRollback();
    if (rollback) this.toast("Scheduled maintenance: 1 (one) item was never yours. A Market Event Receipt was left in its place ($0.00, Instant Sell™: 1 BB).");
    this._prevTrending = featuredItems(balance).map((f) => f.id);
    this._tabHiddenAt = 0;
    this._onVisibility = () => { this._tabHiddenAt = document.hidden ? (this._tabHiddenAt || Date.now()) : 0; };
    document.addEventListener("visibilitychange", this._onVisibility);
    this._marketInt = setInterval(() => this.marketHousekeeping(), 2500);
    this._tosTick = setInterval(()=>{
      if (!this.state.tosOpen) { this._tosElapsed = 0; this._tosNoticeFired = false; return; }
      if (this._tosNoticeFired) return;
      if (this.art8InView()) return;
      this._tosElapsed = (this._tosElapsed || 0) + 1;
      if (this._tosElapsed >= 45) {
        this._tosNoticeFired = true;
        this.setState({tosNeedsConsent:true});
        this.toast(TOS_EDIT_NOTICE, {dismissLabel:"Acknowledged (both versions)."});
      }
    }, 1000);

    // ---- MOM'S HOME (#28): the panic surface ---------------------------------
    // Tab-close forfeit ruling (panic §5): in-flight timers died with the tab,
    // and the house wins by default. The bus was dead when it happened, so the
    // ruling (and its round.forfeit event) lands now, on session start.
    try {
      const pendingForfeit = JSON.parse(localStorage.getItem(PANIC_FORFEIT_KEY) || "null");
      if (pendingForfeit && pendingForfeit.surface) {
        localStorage.removeItem(PANIC_FORFEIT_KEY);
        this._panicForfeitLine = forfeitLineFor(pendingForfeit.surface);
        this.toast(this._panicForfeitLine);
        Bus.emit(EVENTS.ROUND_FORFEIT, {surface: pendingForfeit.surface, reason: pendingForfeit.reason === "panic" ? "panic" : "tab-close"});
      }
    } catch (e) {}
    // Persisted disguise flag: panic, slam the laptop shut, reopen later — the
    // site opens as homework until "Close (she's gone)" (panic §5). Consumers
    // re-enter hidden mode via the canonical panic.hidden emit.
    try {
      const disguise = JSON.parse(localStorage.getItem(PANIC_DISGUISE_KEY) || "null");
      if (disguise && disguise.active && Number.isFinite(disguise.hiddenAt)) {
        this._panicHiddenAt = disguise.hiddenAt;
        this._panicMoodAtHide = disguise.moodAtHide || Mood.word();
        this._panicRung = rungFor(disguise.presses || 1);
        this._panicStartWords = Number.isFinite(disguise.startWords) ? disguise.startWords : 400;
        this._panicLastSubject = disguise.subject;
        this._panicSettledWhileHidden = [];
        this._panicSwapDocMeta(disguise.subject, disguise.draftNo || 3);
        this.setState({
          panicActive:true, panicEssay:disguise,
          panicWordCount: wordCountAt(this._panicStartWords, disguise.hiddenAt),
        });
        this._panicStartWordTick();
        Bus.emit(EVENTS.PANIC_HIDDEN, {pressesToday: disguise.presses || 1});
      }
    } catch (e) {}
    this._escTimes = [];
    this._escKey = (e)=>this._onEscKey(e);
    window.addEventListener("keydown", this._escKey);
    // §5: a round in flight at tab close is ruled a forfeit next session.
    this._onPageHide = () => {
      const surface = this._panicInFlightSurface();
      if (!surface) return;
      try {
        localStorage.setItem(PANIC_FORFEIT_KEY, JSON.stringify({surface, reason: this.state.panicActive ? "panic" : "tab-close", at: Date.now()}));
      } catch (err) {}
    };
    window.addEventListener("pagehide", this._onPageHide);
    // Receipt material: in-flight crash runs that settle while hidden — "kept
    // running. It crashed at {x}x while you were studying."
    this._offPanicSettled = Bus.on(EVENTS.ROUND_SETTLED, (p)=>{
      if (!this.state.panicActive || !p || p.surface !== "crash" || p.kind !== "crash-run") return;
      this._panicSettledWhileHidden.push({
        mult: this._crashScript ? this._crashScript.crashHeadline : null,
        evades: this.state.crashDodges || 0,
      });
    });
  }

  saveBalance(v){ try{localStorage.setItem("hfes_balance_bb", String(v));}catch(e){} }

  componentWillUnmount(){
    clearInterval(this._crashInt); clearInterval(this._crateInt); clearInterval(this._crashStickPulse);
    clearTimeout(this._insTimer); clearInterval(this._idleInt); clearInterval(this._coolInt);
    clearTimeout(this._rouletteSpinTimer); clearTimeout(this._coinFlipTimer);
    clearTimeout(this._ocFlyTimer); clearTimeout(this._creditReplayTimer);
    clearTimeout(this._tosDwellT); clearInterval(this._tosTick);
    clearTimeout(this._crateStageTimer); clearInterval(this._crateMoveInt);
    clearTimeout(this._crateRevealTimer1); clearTimeout(this._crateRevealTimer2);
    clearInterval(this._marketInt); clearTimeout(this._flickerT);
    clearTimeout(this._appealT); clearTimeout(this._contractT);
    clearInterval(this._panicWordInt); clearTimeout(this._panicHintT);
    if (this._escKey) window.removeEventListener("keydown", this._escKey);
    if (this._onPageHide) window.removeEventListener("pagehide", this._onPageHide);
    if (this._offPanicSettled) this._offPanicSettled();
    this._panicSwapDocMeta(null, 0); // restore the site chrome if unmounted mid-disguise
    if (this._onVisibility) document.removeEventListener("visibilitychange", this._onVisibility);
    if (this._offMood) this._offMood();
    if (this._offIdent) this._offIdent();
    if (this._offDeposit) this._offDeposit();
    if (this._offMilestone) this._offMilestone();
    if (this._offInventory) this._offInventory();
    if (this._offBandSettled) this._offBandSettled();
    if (this._activity) {
      window.removeEventListener("pointerdown", this._activity);
      window.removeEventListener("keydown", this._activity);
      window.removeEventListener("wheel", this._activity);
    }
  }


  fireConfetti(){
    const pieces = Array.from({length:24},()=>({left:Math.random()*100,color:["#ff5a14","#ffd54a","#8fd97a","#4a90e2"][Math.floor(Math.random()*4)],dur:1+Math.random(),delay:Math.random()*0.4}));
    this.setState({confettiOn:true, confettiPieces:pieces});
    setTimeout(()=>this.setState({confettiOn:false}), 1600);
  }

  toggleGateCheck(i){
    this.setState(s=>{const c=[...s.gateChecks]; c[i]=!c[i]; return {gateChecks:c};});
  }
  gateStep1Continue(){
    if (!this.state.gateChecks.some(Boolean)) return;
    this.setState({gateStep:1, gateMsg:null});
  }
  gateMomAnswer(which){
    if (which==="yes"){ this.setState({gateStep:2, gateMomNote:"Perfect. Please do not tell her about this website. (§3.1)", momsGlow:true}); }
    else if (which==="no"){ this.setState({gateStep:2, gateMomNote:"Even better."}); }
    else { this.setState({momModalOpen:true, momModalStep:0, momModalMsg:null, momModalQ1:"", momModalQ2:"", momModalCheck:false}); }
  }
  momModalSubmit(){
    const st = this.state.momModalStep;
    if (st===0) this.setState({momModalStep:1, momModalMsg:"Incorrect. You don't know it. None of them do."});
    else if (st===1) this.setState({momModalStep:2, momModalMsg:"Incorrect. The correct answer was 'no'."});
  }
  momModalFinish(){
    this.setState({momModalOpen:false, gateMomNote:"Verification failed. Welcome back, sweetie."});
  }
  gateYearSelect(value){
    if (value==="") return;
    if (value==="karen"){ this.setState({gateYearMsg:"Verified. Welcome back, Kyle.", gateYearOk:true}); return; }
    const yr = parseInt(value,10);
    if (yr>=2009){ this.setState({gateYearMsg:"That tracks.", gateYearOk:true}); return; }
    const n = this.state.gateRejections + 1;
    this.setState({gateRejections:n, gateYearMsg:GATE_REJECTIONS[(n-1)%3], gateYearOk:false});
  }
  gateSkip(){
    this.setState({gateYearMsg:"Verification waived per §1.2(b) — the birth year you didn't pick has been recorded.", gateYearOk:true});
  }
  completeGate(){
    try{ localStorage.setItem("hfes_age","1"); }catch(e){}
    this.fireConfetti();
    Bus.emit(EVENTS.GATE_ACCEPTED, {firstVisit:true});
    Identity.assign();
    this.setState({ageVerified:true, flowPhase:"reveal"});
  }
  revealReroll(){ Identity.revealReroll(); }
  acceptFate(){
    this.resetTosMeter();
    this.setState({flowPhase:"tos", tosOpen:true, tosConsent:true});
  }

  resetTosMeter(){
    clearTimeout(this._tosDwellT);
    this._tosDwellOk = false;
    this._tosElapsed = 0;
    this._tosNoticeFired = false;
    this.setState({tosPct:0, tosDwellOk:false});
  }
  openTos(){
    this.resetTosMeter();
    const rearmed = !!Consent.consume();
    this.setState(s=>({tosOpen:true, tosNeedsConsent: s.tosNeedsConsent || rearmed, tosConsent: s.tosNeedsConsent || rearmed}));
  }
  acceptTos(){
    this.fireConfetti();
    try{ localStorage.setItem("hfes_tos", JSON.stringify({acceptedOnce:true})); }catch(e){}
    const firstFlow = this.state.flowPhase==="tos";
    if (firstFlow) {
      this.setState({
        flowPhase:"done", tosOpen:false, tosConsent:false, tosNeedsConsent:false, tosAcceptedEver:true,
      });
      this.toast(GRANT_TOAST);
    } else {
      this.setState({tosOpen:false, tosConsent:false, tosNeedsConsent:false, tosAcceptedEver:true});
    }
    this.resetTosMeter();
  }
  closeTos(){
    this.setState({tosOpen:false});
    this.resetTosMeter();
  }
  onTosScroll(e){
    const el = e.target;
    const max = el.scrollHeight - el.clientHeight;
    const raw = max>0 ? Math.min(100,(el.scrollTop/max)*100) : 100;
    const atBottom = max<=0 || el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    const effRaw = atBottom ? Math.max(raw, 99) : raw;
    const pct = Math.floor(effRaw);
    if (pct !== this.state.tosPct) this.setState({tosPct:pct});
    if (atBottom && !this._tosDwellOk) {
      clearTimeout(this._tosDwellT);
      this._tosDwellT = setTimeout(()=>{ this._tosDwellOk = true; this.setState({tosDwellOk:true}); }, 3000);
    } else if (!atBottom && this._tosDwellOk) {
      clearTimeout(this._tosDwellT);
      this._tosDwellOk = false;
      this.setState({tosDwellOk:false});
    }
  }
  art8InView(){
    const art = this._art8Ref.current, sc = this._tosScrollRef.current;
    if (!art || !sc) return false;
    const a = art.getBoundingClientRect(), s = sc.getBoundingClientRect();
    return a.bottom > s.top && a.top < s.bottom;
  }

  openIdentity(){ this.setState({identityOpen:true, customInput:"", customMsg:null}); }
  closeIdentity(){ this.setState({identityOpen:false}); }
  panelReroll(){
    const fee = Identity.nextRerollFee();
    if (fee>0 && !this.payBB(fee, "identity-reroll")) return;
    Identity.applyPanelReroll();
  }
  buyCustom(){
    const res = complianceFilter(this.state.customInput);
    if (!res.ok) { this.setState({customMsg:res.error}); return; }
    if (this.state.balanceOC < CUSTOM_NAME_PRICE_OC) {
      this.setState({customMsg:"Insufficient OC. Custom names cost "+CUSTOM_NAME_PRICE_OC+" OC."});
      return;
    }
    const ocLeft = this.state.balanceOC - CUSTOM_NAME_PRICE_OC;
    this.setState({balanceOC:ocLeft});
    saveOC(ocLeft);
    Identity.setCustom(res.name);
    this.setState({customInput:"", customMsg:"Compliance Filter (mood: "+res.moodWord+") applied. Non-refundable."});
  }

  // ---- MOM'S HOME (#28): trigger, disguise, suspicion ladder, Hush, welcome-back
  _panicPressesToday(){
    try {
      const p = JSON.parse(localStorage.getItem(PANIC_PRESSES_KEY) || "null");
      if (p && p.day === localDayKey() && Number.isFinite(p.count)) return p.count;
    } catch (e) {}
    return 0; // rungs reset at the daily boundary (same seed family as the mood)
  }
  _panicBumpPresses(){
    const count = this._panicPressesToday() + 1;
    try { localStorage.setItem(PANIC_PRESSES_KEY, JSON.stringify({day: localDayKey(), count})); } catch (e) {}
    return count;
  }
  _panicSwapDocMeta(subject, draftNo){
    try {
      const link = document.querySelector("link[rel='icon']") || document.querySelector("link[rel*='icon']");
      if (subject) {
        if (!this._panicOrigTitle) this._panicOrigTitle = document.title;
        if (link) {
          if (!this._panicOrigIcon) this._panicOrigIcon = link.getAttribute("href");
          link.setAttribute("href", FAVICON_DOC);
        }
        document.title = docTitleFor(subject, draftNo);
      } else if (this._panicOrigTitle) {
        document.title = this._panicOrigTitle;
        if (link && this._panicOrigIcon) link.setAttribute("href", this._panicOrigIcon);
        this._panicOrigTitle = null; this._panicOrigIcon = null;
      }
    } catch (e) {}
  }
  _panicStartWordTick(){
    clearInterval(this._panicWordInt);
    this._panicWordInt = setInterval(()=>{
      if (!this.state.panicActive) { clearInterval(this._panicWordInt); return; }
      this.setState({panicWordCount: wordCountAt(this._panicStartWords, this._panicHiddenAt)});
    }, 1000);
  }
  togglePanic(){
    if (this.state.panicActive) this._panicReveal();
    else this._panicActivate();
  }
  _panicActivate(){
    const presses = this._panicBumpPresses();
    const rung = rungFor(presses);
    const disguise = generateDisguise(this._panicLastSubject || null); // never the same subject twice in a row
    this._panicLastSubject = disguise.subject;
    this._panicHiddenAt = Date.now();
    this._panicMoodAtHide = Mood.word(); // the mood cannot change intraday — remember it anyway
    this._panicStartWords = startingWordCount(); // mid-draft: 400–700 words
    this._panicRung = rung;
    this._panicSettledWhileHidden = [];
    const draftNo = Math.min(2 + presses, 12); // draft 3 on the first essay of the day
    const record = {
      active:true, hiddenAt:this._panicHiddenAt, startWords:this._panicStartWords,
      subject:disguise.subject, title:disguise.title, teacher:disguise.teacher, seed:disguise.seed,
      moodAtHide:this._panicMoodAtHide, presses, draftNo,
    };
    try { localStorage.setItem(PANIC_DISGUISE_KEY, JSON.stringify(record)); } catch (e) {} // survives tab close
    this._panicSwapDocMeta(disguise.subject, draftNo);
    this.setState({panicActive:true, panicEssay:record, panicWordCount:this._panicStartWords, panicWelcome:null, panicFileMenu:false});
    this._panicStartWordTick();
    Bus.emit(EVENTS.PANIC_HIDDEN, {pressesToday:presses}); // P0: the Band severs the audio graph
  }
  _panicReveal(){
    const hiddenMs = this._panicHiddenAt ? Date.now() - this._panicHiddenAt : 0;
    // Hush Gratuity: 1 BB per restore, floored at 0 BB — nothing to take means
    // waived (§1.3). reason:"panic-hush" so the Band's canonical muffled
    // coin-swallow (scheduled by the Band 900ms after reveal) doesn't fire twice.
    let hushLine = HUSH_WAIVED_LINE;
    if (this.state.balanceBB >= HUSH_GRATUITY_BB) {
      const nb = this.state.balanceBB - HUSH_GRATUITY_BB;
      this.setState({balanceBB:nb}); this.saveBalance(nb);
      Bus.emit(EVENTS.BB_SPENT, {amount:HUSH_GRATUITY_BB, reason:"panic-hush", balanceBB:nb});
      hushLine = HUSH_LINE;
    }
    const missed = Ticker.snapshot().hiddenCount;
    Bus.emit(EVENTS.PANIC_REVEALED, {hiddenMs, missed}); // Band auto-restores; ticker flushes the backlog
    const missedLine = Ticker.missedSummary(hiddenMs);
    this._panicSwapDocMeta(null, 0);
    clearInterval(this._panicWordInt);
    try { localStorage.removeItem(PANIC_DISGUISE_KEY); } catch (e) {}
    const roundLines = this._panicSettledWhileHidden.map((r)=>
      "Your College Fund Crash kept running. It crashed at "+(r.mult ? r.mult.toFixed(2) : "1.01")+"x while you were studying. Cash-out was evaded "+r.evades+" times (you weren't here to try)."
    );
    if (this._panicForfeitLine) roundLines.push(this._panicForfeitLine); // §5: the Quickscope clause
    this.setState({
      panicActive:false, panicEssay:null, panicFileMenu:false, panicMoodShown:false,
      panicWelcome:{
        tag:this.playerTagOrYou(), moodAtHide:this._panicMoodAtHide, moodNow:Mood.word(),
        hushLine, roundLines, missedLine,
      },
    });
    this.toast(RESTORE_TOAST); // verbatim (audio-gags §8); the Band already auto-restored
    if (this._panicRung >= 3) {
      // Rung 3: the suspicion toast, and Mom is watching the homework.
      this.toast(SUSPICION_TOAST, {dismissLabel:"Acknowledged (§12.0)"});
      this.pushChat(PROVABLY_MOM_CHAT);
    }
    this._panicForfeitLine = null;
  }
  _panicInFlightSurface(){
    const s = this.state;
    if (s.crashPhase === "scheduling" || s.crashPhase === "climbing" || s.crashProcessing) return "crash";
    if (s.rouletteSpinning) return "roulette";
    if (s.coinFlipping) return "coinflip";
    if (s.crateOpening || s.crateKeyBought) return "crates";
    return null;
  }
  _panicShowHint(text){
    this.setState({panicHint:text});
    clearTimeout(this._panicHintT);
    this._panicHintT = setTimeout(()=>this.setState({panicHint:null}), 2600);
  }
  _onEscKey(e){
    if (!e || e.key !== "Escape") return;
    const now = Date.now();
    this._escTimes = (this._escTimes || []).filter((t)=>now - t < 1500);
    this._escTimes.push(now);
    if (this._escTimes.length >= 3) {
      this._escTimes = [];
      this.togglePanic(); // §12.0 Emergency Maternal Protocol — masks, and reveals, hands-free
      return;
    }
    if (this.state.panicActive) return; // single-tap while hidden: silence
    if (this.state.crateOpening) {
      this._panicShowHint(CRATE_ESC_ANSWER); // you can't skip the crate; Mom skips everything
      return;
    }
    try {
      if (!localStorage.getItem(PANIC_HINT_KEY)) {
        localStorage.setItem(PANIC_HINT_KEY, "1"); // first use only, thereafter silence
        this._panicShowHint(ESC_TOOLTIP);
      }
    } catch (err) {}
  }
  panicDismissWelcome(){ this.setState({panicWelcome:null, panicMoodShown:false}); }
  panicToggleMood(){ this.setState(s=>({panicMoodShown:!s.panicMoodShown})); }
  panicToggleFileMenu(){ this.setState(s=>({panicFileMenu:!s.panicFileMenu})); }

  toggleBandMuted(){
    HouseBand.setMuted(!HouseBand.isMuted());
    this.setState({bandMuted: HouseBand.isMuted()});
  }

  flashInsufficient(failures){
    this.setState({insufficientMsg: failures >= 3 ? INSUFFICIENT_FUNDS_ESCALATION_COPY : INSUFFICIENT_FUNDS_COPY});
    clearTimeout(this._insTimer);
    this._insTimer = setTimeout(()=>this.setState({insufficientMsg:null}), 2600);
  }

  payBB(amount, reason){
    if (!(this.state.balanceBB >= amount)) {
      const n = this.state.sessionSpendFailures + 1;
      this.setState({sessionSpendFailures:n});
      this.flashInsufficient(n);
      Bus.emit(EVENTS.SPEND_FAILED, {surface:reason, costBB:amount, sessionFailures:n});
      return false;
    }
    const nb = this.state.balanceBB - amount;
    this.setState({balanceBB:nb}); this.saveBalance(nb);
    Bus.emit(EVENTS.BB_SPENT, {amount, reason, balanceBB: nb});
    return true;
  }
  spendBB(surface){ return this.payBB(GAME_PRICES_BB[surface], surface); }

  chatGratuity(amount){
    if (!(this.state.balanceBB >= amount)) return {waived:true};
    const nb = this.state.balanceBB - amount;
    this.setState({balanceBB:nb}); this.saveBalance(nb);
    Bus.emit(EVENTS.BB_SPENT, {amount, reason:"chat-gratuity", balanceBB: nb});
    return {waived:false, amount};
  }

  nextRoundId(){ this._roundSeq = (this._roundSeq||0)+1; return this._roundSeq; }
  settleRound(surface, roundId, kind, extra={}){
    const priceBB = typeof extra.priceBB === "number" ? extra.priceBB : GAME_PRICES_BB[surface];
    const netBB = typeof extra.netBB === "number" ? extra.netBB : -GAME_PRICES_BB[surface];
    const wagered = extra.wagered !== false;
    Bus.emit(EVENTS.ROUND_SETTLED, {
      surface, roundId, wagered, priceBB, netBB, kind,
      itemAward: extra.itemAward || null,
      nearMissItem: extra.nearMissItem || null,
      streakAfter: { site: (this.state.stats && this.state.stats.lossStreak) || 0, surface: extra.surfaceStreak || 0 },
    });
  }
  playerTagOrYou(){
    const s = this.state;
    return s.ident ? (s.ident.custom || s.ident.tag) : "You";
  }

  setTab(tab){ this.setState({activeTab:tab}); }

  toggleRouletteInsured(){ this.setState(s=>({rouletteInsured:!s.rouletteInsured})); }
  toggleRouletteTurbo(){
    if (!this.state.rouletteTurboUnlocked) return;
    this.setState(s=>({rouletteTurbo:!s.rouletteTurbo}));
  }
  toggleRouletteReceipt(){ this.setState(s=>({rouletteReceiptOpen:!s.rouletteReceiptOpen})); }
  toggleCoinReceipt(){ this.setState(s=>({coinReceiptOpen:!s.coinReceiptOpen})); }
  openRouletteFairness(){
    const f = this.state.rouletteFairness;
    if (!f) return;
    this.setState({rouletteFairness:{...f, revealed:true}, rouletteFairnessOpen:true});
  }
  closeRouletteFairness(){ this.setState({rouletteFairnessOpen:false}); }
  openCoinFairness(){
    const f = this.state.coinFairness;
    if (!f) return;
    this.setState({coinFairness:{...f, revealed:true}, coinFairnessOpen:true});
  }
  closeCoinFairness(){ this.setState({coinFairnessOpen:false}); }

  playRoulette(){
    if (this.state.rouletteSpinning) return;
    const turbo = this.state.rouletteTurboUnlocked && this.state.rouletteTurbo;
    const insured = this.state.rouletteInsured;
    const price = Roulette.SPIN_PRICE_BB + (turbo?Roulette.TURBO_FEE_BB:0) + (insured?Roulette.INSURANCE_FEE_BB:0);
    if (!this.payBB(price, "roulette")) return;
    const roundId = this.nextRoundId();
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"roulette", roundId, priceBB:price, wagered:true});
    HouseBand.play("roulette.spin", {priority:BAND_PRIORITIES.P2_GAME});
    const duration = turbo ? 2500 : 5000;
    const finalOffset = -(2800 + Math.floor(Math.random()*300));
    this.setState({rouletteSpinning:true, rouletteResult:null, rouletteOffset:0, rouletteTransition:"none", rouletteJackpotBox:null, rouletteConsolationMsg:null});
    requestAnimationFrame(()=>{
      this.setState({rouletteOffset:finalOffset, rouletteTransition:`transform ${duration}ms cubic-bezier(0.12,0.7,0.25,1)`});
    });
    this._rouletteSpinTimer = setTimeout(()=>this.resolveRouletteSpin(roundId, price, turbo, insured), duration + 300);
  }
  resolveRouletteSpin(roundId, price, turbo, insured){
    const welcome = !this._rouletteWelcomeUsed;
    this._rouletteWelcomeUsed = true;
    const kind = welcome ? "junk-win" : Roulette.rollOutcome();
    const tag = this.playerTagOrYou();
    let netBB = -price;
    let itemAward = null, nearMissItem = null, resultText = "", item = null;

    if (kind === "near-miss") {
      item = Roulette.pickNearMissJackpot();
      this._rouletteLastNearMissId = item.id;
      resultText = Roulette.nearMissToast(item, this.state.rouletteNearMissBackToBack);
      nearMissItem = item.name;
    } else if (kind === "junk-win") {
      item = welcome ? Roulette.JUNK_ITEMS[0] : Roulette.pickJunkItem();
      const entry = Inventory.award({...item, source:"roulette"});
      itemAward = entry.name;
      resultText = welcome
        ? "Everyone wins their first one. It's in the brochure."
        : "JUNK WIN: "+item.name+" (est. "+item.value+") is yours. Withdrawal pending.";
    } else if (kind === "nibble") {
      netBB = -(price - 2);
      resultText = "Refund nibble: 2 BB Rakeback credited. Net: still down.";
    } else if (kind === "jackpot") {
      item = Roulette.pickJackpotItem(this._rouletteLastNearMissId);
      const entry = Inventory.award({...item, source:"roulette"});
      itemAward = entry.name;
      resultText = "JACKPOT! "+item.name+" (est. "+item.value+") is yours!";
      HouseBand.play("roulette.jackpot", {priority:BAND_PRIORITIES.P1_CEREMONY});
      this.fireConfetti();
    } else {
      resultText = "HOUSE WINS: FEE ASSESSED. Better luck never.";
    }

    let streak = this.state.rouletteStreak;
    let consolation = null;
    if (kind === "junk-win" || kind === "jackpot") {
      streak = 0; // fake win resets the ladder ("counts as a win for morale purposes only")
    } else {
      streak += 1;
      consolation = Roulette.consolationForStreak(streak, this.state.moodWord);
    }
    const nearMissBackToBack = kind === "near-miss" ? !this.state.rouletteNearMissBackToBack : false;

    const fairnessAnyway = kind === "junk-win" || kind === "jackpot";
    const preimage = "ALLOWANCE_ROULETTE_#"+roundId+"_HOUSE_WINS"+(fairnessAnyway?"_ANYWAY":"");
    const commitment = pseudoHash12("ALLOWANCE_ROULETTE_"+roundId+"_HOUSE_WINS"+(fairnessAnyway?"_ANYWAY":""));

    this.setState(s=>({
      rouletteSpinning:false, rouletteResult:resultText,
      rouletteStreak:streak, rouletteNearMissBackToBack:nearMissBackToBack,
      rouletteConsolationMsg: consolation ? consolation.banner : null,
      rouletteReceipt: Roulette.receiptFor({turbo, insured}),
      rouletteReceiptOpen:false,
      rouletteFairness: {roundId, commitment, preimage, revealed:false, anyway:fairnessAnyway},
      rouletteFairnessOpen:false,
      rouletteJackpotBox: kind==="jackpot" ? {item, cashoutClicked:false} : null,
      rouletteBannerNames: itemAward && !s.rouletteBannerNames.includes(tag) ? [tag, ...s.rouletteBannerNames].slice(0,7) : s.rouletteBannerNames,
    }));

    this.settleRound("roulette", roundId, kind, {priceBB:price, netBB, itemAward, nearMissItem, surfaceStreak:streak});
    if (consolation) {
      if (consolation.kind === "badge") this.pushTicker(tag+" earned the Consistent! badge (losses: 7)");
      if (consolation.kind === "apology") this.pushTicker(tag+" received a formal apology (fee: 1 BB)");
      if (consolation.awardBB) this.creditBB(consolation.awardBB);
      if (consolation.awardItem) Inventory.award({...consolation.awardItem, source:"roulette-consolation"});
    }
  }
  chaseIt(){
    if (this.state.rouletteSpinning) return;
    const before = this.state.balanceBB;
    if (before < Roulette.CHASE_IT_PRICE_BB) {
      const n = this.state.sessionSpendFailures + 1;
      this.setState({sessionSpendFailures:n});
      this.flashInsufficient(n);
      Bus.emit(EVENTS.SPEND_FAILED, {surface:"roulette-chase-it", costBB:Roulette.CHASE_IT_PRICE_BB, sessionFailures:n});
      noteChaseAttempt();
      return;
    }
    if (!this.payBB(Roulette.CHASE_IT_PRICE_BB, "roulette")) return;
    const roundId = this.nextRoundId();
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"roulette", roundId, priceBB:Roulette.CHASE_IT_PRICE_BB, wagered:true});
    this.setState({rouletteSpinning:true, rouletteResult:null, rouletteJackpotBox:null});
    this._rouletteSpinTimer = setTimeout(()=>this.resolveRouletteSpin(roundId, Roulette.CHASE_IT_PRICE_BB, false, false), 2600);
  }
  rouletteCashOut(){
    this.setState(s=>({rouletteJackpotBox: s.rouletteJackpotBox ? {...s.rouletteJackpotBox, cashoutClicked:true} : null}));
    Bus.emit(EVENTS.WITHDRAWAL_CREATED, {usdEst: 0});
  }
  rouletteKeepSpinning(){ this.setState({rouletteJackpotBox:null}); }

  playCoinflip(call){
    if (this.state.coinFlipping) return;
    if (!this.spendBB("coinflip")) return;
    const roundId = this.nextRoundId();
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"coinflip", roundId, priceBB:GAME_PRICES_BB.coinflip, wagered:true});
    HouseBand.play("coinflip.flip", {priority:BAND_PRIORITIES.P2_GAME});
    const chosenCall = call || this.state.coinLastCall || "MOM";
    this.setState(s=>({
      coinFlipping:true, coinResult:null, coinLastCall:chosenCall,
      coinCallCounts:{...s.coinCallCounts, [chosenCall]:(s.coinCallCounts[chosenCall]||0)+1},
    }));
    this._coinFlipTimer = setTimeout(()=>this.resolveCoinflip(roundId, 0), 2800);
  }
  resolveCoinflip(roundId, extraBB){
    const price = Coinflip.FLIP_PRICE_BB + (extraBB||0);
    const welcome = !this._coinWelcomeUsed;
    this._coinWelcomeUsed = true;
    const kind = welcome ? "junk-win" : Coinflip.rollOutcome();
    const tag = this.playerTagOrYou();
    let netBB = -price;
    let itemAward = null, resultText = "", item = null;
    let edgeCount = this.state.coinEdgeCount;
    let photoBackToBack = false;

    if (kind === "edge") {
      edgeCount += 1;
      resultText = Coinflip.edgeLadderLine(edgeCount);
    } else if (kind === "photo-finish") {
      photoBackToBack = !this.state.coinPhotoBackToBack;
      resultText = photoBackToBack
        ? Coinflip.photoFinishBackToBackLine()
        : Coinflip.PHOTO_FINISH_LINE.replace("{call}", this.state.coinLastCall || "your call");
    } else if (kind === "junk-win") {
      item = welcome ? (this.state.coinStashItem || Coinflip.pickStashItem()) : (this.state.coinStashItem || Coinflip.pickStashItem());
      const entry = Inventory.award({...item, source:"coinflip"});
      itemAward = entry.name;
      resultText = welcome
        ? "Your first one? He lets those go. (One (1) per session, per tradition. §5.4(b).)"
        : "Admin_TradeBot_69 hands over "+item.name+" (est. "+item.value+"). Withdrawal pending.";
    } else if (kind === "nibble") {
      netBB = 0;
      resultText = "You broke even. This is the best available outcome (§5.3).";
    } else if (kind === "legendary-win") {
      item = Coinflip.pickLegendary();
      const entry = Inventory.award({...item, source:"coinflip"});
      itemAward = entry.name;
      resultText = "MOD_Chad_Official reviewed the flip. Ruling: yours. Bot is grounded. You WON "+item.name+" (est. "+item.value+")!";
      HouseBand.play("coinflip.legendary", {priority:BAND_PRIORITIES.P1_CEREMONY});
      this.fireConfetti();
    } else {
      resultText = "The coin landed opposite your call. AdminTradeBot_69 collects.";
    }

    let streak = this.state.coinStreak;
    let botPity = false;
    if (kind === "junk-win" || kind === "legendary-win" || kind === "nibble") {
      streak = 0;
    } else {
      streak += 1;
      if (streak >= 7 && !this.state.coinBotPityUsed) botPity = true;
    }
    const taunt = Coinflip.streakTaunt(streak, tag);

    const fairnessAnyway = kind === "junk-win" || kind === "legendary-win";
    const preimage = "SKIN_COINFLIP_#"+roundId+"_"+(fairnessAnyway?"HOST_ALLOWS_THIS_ONE":"TIE_GOES_TO_HOST");
    const commitment = pseudoHash12("SKIN_COINFLIP_"+roundId+"_TIE_GOES_TO_HOST");

    this.setState(s=>({
      coinFlipping:false, coinResult:resultText,
      coinStreak:streak, coinEdgeCount:edgeCount, coinPhotoBackToBack:photoBackToBack,
      coinReceipt:Coinflip.receiptFor(), coinReceiptOpen:false,
      coinFairness:{roundId, commitment, preimage, revealed:false, anyway:fairnessAnyway},
      coinFairnessOpen:false,
      coinBotPityUsed: s.coinBotPityUsed || botPity,
      coinDoN: itemAward ? {item, awaitingChoice:true} : null,
      coinStashItem: Coinflip.pickStashItem(),
    }));

    this.settleRound("coinflip", roundId, kind, {priceBB:price, netBB, itemAward, surfaceStreak:streak});
    if (taunt) this.setState(s=>({chat:[{user:"Admin_TradeBot_69", msg:taunt.replace("Admin_TradeBot_69: ",""), color:"#e24a4a"}, ...s.chat].slice(0,6)}));
    if (botPity) {
      this.creditBB(1);
      this.pushTicker(tag+" received 1 BB from the bot's personal wallet (the house was not consulted (it was))");
      this.toast("Admin_TradeBot_69 felt something. Here's 1 BB. Don't tell the house.");
    }
  }
  coinflipRematch(){ this.playCoinflip(this.state.coinLastCall); }
  coinDoubleOrNothingAccept(){
    const don = this.state.coinDoN;
    if (!don) return;
    this.setState({coinDoN:null});
    const win = Math.random() < 0.5;
    if (win) {
      const doubled = {...don.item, value: don.item.value};
      Inventory.award({...doubled, source:"coinflip-double"});
      this.toast("Value doubled: same item, bigger number (§8.9)");
      this.pushTicker(this.playerTagOrYou()+" doubled their "+don.item.name+" (same item, bigger number)");
    } else {
      this.toast("The Nothing was load-bearing.");
      this.pushTicker("The Nothing claimed "+this.playerTagOrYou()+"'s "+don.item.name+" (it was load-bearing)");
    }
  }
  coinDoubleOrNothingDecline(){
    this.setState({coinDoN:null});
    this.setState(s=>({chat:[{user:"Admin_TradeBot_69", msg:this.playerTagOrYou()+": coward. (respected.)", color:"#e24a4a"}, ...s.chat].slice(0,6)}));
  }

  // ---- College Fund Crash ----
  startCrash(){
    if (this.state.crashPhase !== "idle" && this.state.crashPhase !== "crashed") return;
    if (!this.spendBB("crash")) return;
    const roundId = this.nextRoundId();
    const runCount = this.state.crashRunCount + 1;
    this._crashRoundId = roundId;
    // Provably Fair™ theater: the schedule's commitment is minted before the
    // climb starts; the preimage is the schedule (not disclosed, §5.5).
    const script = scriptRun(this.state.crashConsecutiveLosses);
    this._crashScript = script;
    const commitment = pseudoHash12("crash:"+roundId+":"+script.duration.toFixed(0)+":"+script.peakDisplay.toFixed(2)+":"+script.crashHeadline.toFixed(2));
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"crash", roundId, priceBB:GAME_PRICES_BB.crash, wagered:true});
    HouseBand.play("crash.round", {priority:BAND_PRIORITIES.P2_GAME, volume:0.8});
    this.setState({
      crashPhase:"scheduling", crashRunCount:runCount, crashDodges:0, crashExhausted:false,
      crashMult:1.00, crashCrashed:false, crashResult:null, crashOffset:{x:0,y:0}, crashScale:1,
      crashButtonLabel:"Cash Out", crashStickActive:false, crashProcessing:false,
      crashCommitment:commitment,
    });
    if (runCount === 1) this.pushChat({user:"xX_QuickScope_Xx", msg:"here we go again", color:"#ff8a3d"});
    setTimeout(()=>this._crashBeginClimb(), 600);
  }
  _crashBeginClimb(){
    const script = this._crashScript || scriptRun(this.state.crashConsecutiveLosses);
    this._crashScript = script;
    this._crashStickTriggered = false;
    this.setState({crashPhase:"climbing"});
    const start = Date.now();
    let pausedMs = 0;
    clearInterval(this._crashInt);
    this._crashInt = setInterval(()=>{
      if (this.state.crashStickActive) return;
      const elapsed = Date.now() - start - pausedMs;
      const progress = Math.min(1, elapsed / script.duration);
      const mult = 1 + progress * (script.peakDisplay - 1);
      if (script.hasStick && !this._crashStickTriggered && mult >= script.stickValue) {
        this._crashStickTriggered = true;
        const stickStart = Date.now();
        this.setState({crashMult:script.stickValue, crashStickActive:true, crashButtonLabel:"NOW would be good"});
        // Stick tremble pulses — chat counts these; the 700ms cadence means the
        // counter only reaches 3 inside a widened (3+ consecutive loss) stick,
        // which is exactly when the spec's conscience chatter appears.
        clearInterval(this._crashStickPulse);
        let pulseT = 0;
        this._crashStickPulse = setInterval(()=>{
          pulseT += 700;
          if (pulseT >= script.stickDurationMs) { clearInterval(this._crashStickPulse); return; }
          Bus.emit(EVENTS.ROUND_BEAT, {surface:"crash", roundId:this._crashRoundId, beat:"stick"});
        }, 700);
        this.pushChat({
          user:"definitely_your_conscience",
          msg: this.state.crashConsecutiveLosses >= 3 ? "take it… take it…" : "CASH OUT CASH OUT CASH OUT",
          color:"#e8c9ac",
        });
        setTimeout(()=>{ pausedMs += Date.now() - stickStart; this.setState({crashStickActive:false, crashButtonLabel:"Cash Out"}); clearInterval(this._crashStickPulse); }, script.stickDurationMs);
        return;
      }
      this.setState({crashMult:mult});
      if (progress >= 1) {
        clearInterval(this._crashInt);
        this._crashFinalize();
      }
    }, 100);
  }
  _crashFinalize(){
    const script = this._crashScript;
    const consecutive = this.state.crashConsecutiveLosses + 1;
    const fundName = fundNameForRun(this.state.crashRunCount);
    const stickLine = script.hasStick ? (" You had "+script.stickValue.toFixed(2)+"x. Everyone saw it. (Playback not available, ToS §1.3.)") : "";
    this.setState({
      crashPhase:"crashed", crashCrashed:true, crashMult:script.crashHeadline, crashConsecutiveLosses:consecutive,
      crashResult: "CRASHED at "+script.crashHeadline.toFixed(2)+"x (as scheduled). Peak display: "+script.peakDisplay.toFixed(2)+"x. The peak display was decorative."
        + stickLine + " " + fundName + " fully liquidated (as scheduled).",
    });
    // the loss lands via round.settled below (chat clears its stick counter on
    // any crash settlement, so the counter is calibrated by stick-window pulses
    // alone: it only reaches 3 inside a widened 3+-consecutive-loss stick)
    this.settleRound("crash", this._crashRoundId, "crash-run", {surfaceStreak:consecutive});
    HouseBand.play("crash.crashed", {priority:BAND_PRIORITIES.P2_GAME, volume:0.8});
    const tag = this.playerTagOrYou();
    this._crashTickerIdx = ((this._crashTickerIdx || 0) + 1) % CRASH_TICKER_TEMPLATES.length;
    this.pushTicker(CRASH_TICKER_TEMPLATES[this._crashTickerIdx]
      .replace("{x}", script.crashHeadline.toFixed(2))
      .replace("{peak}", script.peakDisplay.toFixed(2))
      .replace("{n}", tag)
      .replace("{dodges}", String(this.state.crashDodges)));
    this.pushChat({user:"AdminTradeBot_69", msg:"as scheduled 📉", color:"#e24a4a"});
    if (consecutive >= 3 && consecutive % 3 === 0) this._crashConsolationRebate();
  }
  _crashConsolationRebate(){
    const remaining = Math.max(0, GAME_PRICES_BB.crash - (this.state.balanceBB + CRASH_REBATE_BB));
    this.awardBB(CRASH_REBATE_BB, "crash-rebate");
    this.toast("Consolation Rebate: +"+CRASH_REBATE_BB+" BB (non-stackable, non-withdrawable, non-consoling)");
    this.pushTicker("Consolation issued. You're "+fmtBB(remaining)+" BB from another run. So close.");
  }
  crashDodgeAttempt(){
    if (this.state.crashPhase !== "climbing" || this.state.crashExhausted) return;
    const n = this.state.crashDodges + 1;
    const info = dodgeStage(n);
    const exhausted = n >= 7;
    this.setState({
      crashDodges:n,
      crashOffset: exhausted ? {x:0,y:0} : dodgeOffset(n),
      crashScale: dodgeScale(n),
      crashButtonLabel: dodgeLabel(n),
      crashExhausted: exhausted,
    });
    if (exhausted) {
      this.pushChat({user:"MOD_Chad_Official", msg:info.chat, color:"#8fd97a"});
    } else if (Math.random() < 0.4) {
      this.pushChat({user:"xX_QuickScope_Xx", msg:info.chat, color:"#ff8a3d"});
    }
  }
  crashCashoutClick(){
    if (this.state.crashPhase !== "climbing") return;
    if (!this.state.crashExhausted) { this.crashDodgeAttempt(); return; }
    this._crashProcessExhaustion();
  }
  _crashProcessExhaustion(){
    if (this.state.crashProcessing) return;
    clearInterval(this._crashInt);
    // the cash-out click finally landed — chat's stick counter disarms
    Bus.emit(EVENTS.ROUND_BEAT, {surface:"crash", roundId:this._crashRoundId, beat:"dodge"});
    HouseBand.play("crash.cashout", {priority:BAND_PRIORITIES.P1_CEREMONY, volume:1});
    this.setState({crashProcessing:true, crashButtonLabel:"PROCESSING CASH-OUT…"});
    setTimeout(()=>{
      const first = !this.state.crashCharacterWinUsed;
      const roundId = this._crashRoundId;
      const fundName = fundNameForRun(this.state.crashRunCount);
      if (first) {
        const {payout, net} = computeExhaustionPayout(this.state.crashMult);
        this.awardBB(payout, "crash-character-win");
        this.setState({
          crashPhase:"crashed", crashCharacterWinUsed:true, crashCrashed:false, crashProcessing:false,
          crashConsecutiveLosses:0,
          crashResult: "PROCESSING CASH-OUT… succeeded. Payout "+payout+" BB (net "+(net>=0?"+":"")+net+" BB). "
            +"Crash Containment Fee 7.3%, Pre-Crash Processing Fee 5 BB, Maternal Gratuity 1 BB, §8.9 rounding (down). "
            +"Withdrawable balance: $0.00 (unchanged). One (1) character-building win per session (ToS §5.5). "
            +fundName+" survives with "+net+" BB. Use it wisely (you won't).",
        });
        this.settleRound("crash", roundId, "character-win", {netBB:net, surfaceStreak:0});
        HouseBand.play("crash.character-win", {priority:BAND_PRIORITIES.P1_CEREMONY, volume:1});
        const tag = this.playerTagOrYou();
        this.pushTicker(tag+" DEFEATED THE HOUSE (net: "+(net>=0?"+":"")+net+" BB, house retains dignity)");
        this.pushChat({user:"NotABot_Trust", msg:"screenshot or it didn't happen", color:"#ffd54a"});
      } else {
        const consecutive = this.state.crashConsecutiveLosses + 1;
        this.setState({
          crashPhase:"crashed", crashCrashed:true, crashProcessing:false, crashConsecutiveLosses:consecutive,
          crashButtonLabel:"Cash Out (unavailable until you calm down)",
          crashResult:"Cash-out received 0.4s before the crash. Processing… declined (banker's discretion, ToS §1.3). "+fundName+" fully liquidated (as scheduled).",
        });
        // the loss lands
        Bus.emit(EVENTS.ROUND_BEAT, {surface:"crash", roundId, beat:"stick"});
        this.settleRound("crash", roundId, "crash-run", {surfaceStreak:consecutive});
        this.pushChat({user:"AdminTradeBot_69", msg:"§1.3'd", color:"#e24a4a"});
        if (consecutive >= 3 && consecutive % 3 === 0) this._crashConsolationRebate();
      }
    }, 400);
  }
  expressCashoutClick(){
    this.toast("Pending since you arrived (ToS §1.3).");
  }

  // ---- Loot Crate Defuser ----
  saveCratePersist(patch){
    try {
      if ("pity" in patch) localStorage.setItem("hfes_crate_pity", String(patch.pity));
      if ("dupeIds" in patch) localStorage.setItem("hfes_crate_dupes", JSON.stringify(patch.dupeIds));
    } catch (e) {}
  }
  buyKey(){
    if (!this.spendBB("crates")) return;
    this._crateRound = this.nextRoundId();
    this._crateWagered = true;
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"crates", roundId:this._crateRound, priceBB:GAME_PRICES_BB.crates, wagered:true});
    this.setState({crateKeyBought:true});
  }
  useFreeKey(){
    if (this.state.crateFreeKeyCount <= 0) return;
    this.setState(s=>({crateFreeKeyCount:s.crateFreeKeyCount-1, crateKeyBought:true}));
    this._crateRound = this.nextRoundId();
    this._crateWagered = false;
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"crates", roundId:this._crateRound, priceBB:0, wagered:false});
  }
  claimDailyMomKey(){
    if (!this.state.crateMomKeyClaimableToday) return;
    const todayKey = localDayKey();
    let streak = 1;
    try {
      const lastDay = localStorage.getItem("hfes_crate_momkey_day");
      if (lastDay && lastDay === dayKeyBefore(todayKey)) {
        streak = (this.state.crateMomKeyStreak || 0) + 1;
      }
      localStorage.setItem("hfes_crate_momkey_day", todayKey);
      localStorage.setItem("hfes_crate_momkey_streak", String(streak));
    } catch (e) {}
    this.setState(s=>({
      crateMomKeyClaimableToday:false, crateMomKeyStreak:streak, crateFreeKeyCount:s.crateFreeKeyCount+1,
    }));
    this.toast("MOM (envelope, return address: she doesn't know) — Days Mom Checked In: "+streak+(streak>=3 ? " — upgraded to Premium Mom Crate (Matte) (identical odds, shinier box)" : ""));
    this.pushTicker("A key arrived from Mom (no return address)");
  }
  dismissCrateEnvelope(){
    this.setState({crateEnvelope:null});
  }
  openCrate(){
    if (this.state.crateOpening || !this.state.crateKeyBought) return;
    const totalMs = defuseDurationMs(this.state.crateSessionOpened);
    this._crateStages = buildDefuseStages(totalMs, 0);
    this.setState({
      crateOpening:true, crateProgress:0, crateStage:"lock1", crateCaption:this._crateStages[0].caption,
      crateSkipAvailable:false, crateSkipUsed:false, crateResult:null, crateRevealPhase:null, crateAward:null, crateReel:null,
      crateInspectOpen:false,
    });
    HouseBand.play("crates.open", {priority:BAND_PRIORITIES.P1_CEREMONY, volume:1});
    this._crateRunStage(0);
  }
  _crateRunStage(idx){
    const stages = this._crateStages;
    if (!stages) return;
    if (idx >= stages.length) { this._crateDefuseComplete(); return; }
    const seg = stages[idx];
    this.setState({crateStage:seg.key, crateCaption:seg.caption});
    if (seg.type === "hold") {
      this.setState({crateProgress:seg.at});
      Bus.emit(EVENTS.ROUND_BEAT, {surface:"crates", roundId:this._crateRound, beat: seg.key === "stallB" ? "drop" : "stall"});
      clearTimeout(this._crateStageTimer);
      this._crateStageTimer = setTimeout(()=>this._crateRunStage(idx+1), seg.ms);
      return;
    }
    const from = seg.from, to = seg.to, ms = seg.ms, start = Date.now();
    clearInterval(this._crateMoveInt);
    this._crateMoveInt = setInterval(()=>{
      const el = Date.now() - start;
      const p = Math.min(1, el / ms);
      const val = from + (to - from) * p;
      this.setState(s=>{
        const patch = {crateProgress:val};
        if (seg.key === "lock1" && val >= SKIP_APPEARS_AT_PCT && !s.crateSkipUsed && !s.crateSkipAvailable) patch.crateSkipAvailable = true;
        return patch;
      });
      if (p >= 1) {
        clearInterval(this._crateMoveInt);
        this._crateRunStage(idx+1);
      }
    }, 100);
  }
  skipCrate(){
    if (!this.state.crateSkipAvailable || this.state.crateSkipUsed) return;
    if (!this.payBB(SKIP_PRICE_BB, "crate-skip")) return;
    this.setState(s=>({
      crateProgress:Math.min(100, s.crateProgress+SKIP_JUMP_PCT), crateSkipUsed:true, crateSkipAvailable:false,
    }));
    if (this._crateStages && this._crateStages[3]) this._crateStages[3].ms += SKIP_STALL_EXTENSION_MS;
    this.toast("Skip confirmed — ETA improved");
  }
  _crateDefuseComplete(){
    clearInterval(this._crateMoveInt); clearTimeout(this._crateStageTimer);
    const award = pickAward();
    this._crateAwardPending = award;
    const initial = buildReelStrip(award, false);
    this.setState({crateProgress:100, crateReel:{...initial, recalibrated:false}, crateRevealPhase:"reel"});
    Bus.emit(EVENTS.ROUND_BEAT, {surface:"crates", roundId:this._crateRound, beat:"recalibration"});
    clearTimeout(this._crateRevealTimer1); clearTimeout(this._crateRevealTimer2);
    this._crateRevealTimer1 = setTimeout(()=>{
      const recal = buildReelStrip(award, true);
      this.setState({crateReel:{...recal, recalibrated:true}});
    }, 2400);
    this._crateRevealTimer2 = setTimeout(()=>this._crateFinishAward(award), 3450);
  }
  _crateFinishAward(award){
    const wagered = this._crateWagered;
    const roundId = this._crateRound;
    const dupe = this.state.crateDupeIds.includes(award.id);
    const pityRes = incrementPity(this.state.cratePity);
    const dupeIds = dupe ? this.state.crateDupeIds : [...this.state.crateDupeIds, award.id];
    // Holdings: non-dupe awards land in the shared inventory store (fake-win
    // model, tradeable:false at award). Dupes are recycled for +0 credits.
    if (!dupe) Inventory.award({id: award.id, name: award.name, value: award.value, source: "crates"});
    const kind = kindForTier(award.tier);
    this.setState({
      crateOpening:false, crateKeyBought:false, crateRevealPhase:"award", crateAward:award,
      crateDupeIds:dupeIds, cratePity:pityRes.value,
      crateSessionOpened:this.state.crateSessionOpened+1,
      crateResult: dupe
        ? "Duplicate detected. Recycled. +0 Environmental Credits (rounded down, §8.9). ("+award.name+")"
        : "Added to Inventory · Non-Tradeable · Withdrawal ETA: pending (§1.3) — "+award.name,
    });
    this.saveCratePersist({pity:pityRes.value, dupeIds});
    this.settleRound("crates", roundId, kind, {
      wagered, priceBB: wagered ? GAME_PRICES_BB.crates : 0,
      netBB: wagered ? -GAME_PRICES_BB.crates : 0,
      itemAward: dupe ? null : award, nearMissItem: FRUIT_ROLL_UP,
    });
    HouseBand.play(kind === "legendary-win" || kind === "jackpot" ? "crates.legendary" : "crates.reveal", {priority:BAND_PRIORITIES.P1_CEREMONY, volume:1});
    this.toast("SO CLOSE! You were 1 slot from "+FRUIT_ROLL_UP.name+" ($"+FRUIT_ROLL_UP.value.toFixed(2)+"). (distance does not affect outcome; this reel is a movie; odds: yes)");
    if (pityRes.recalibrated) this.toast("PITY METER RECALIBRATED (mood improved!) (§8.9)");
    if (confettiEligible(award.tier)) this.confetti();
    const tag = this.playerTagOrYou();
    const template = CRATE_TICKER_TEMPLATES[Math.floor(Math.random()*CRATE_TICKER_TEMPLATES.length)];
    this.pushTicker(template.replace("{n}", tag));
    this.pushChat(CRATE_CHAT[Math.floor(Math.random()*CRATE_CHAT.length)]);
  }

  // ---- Marketplace & Inventory (#27) ----
  marketHousekeeping(){
    const now = Date.now();
    Market.refreshViews(now);
    const idleMs = now - (this._lastInput || now);
    const blurred = this._tabHiddenAt > 0;
    const settled = Market.settleDue({ idleMs, blurred, now });
    for (const s of settled) {
      this.toast("SOLD! " + s.listing.name + " — " + s.listing.proceeds + " BB credited to Escrow (converts to withdrawal queue). The BB balance is uninvolved.");
    }
    // TRENDING rotation: the featured row is always the cheapest things you
    // cannot afford; the instant one becomes affordable it rotates out.
    const featured = featuredItems(this.state.balanceBB);
    const ids = featured.map((f) => f.id);
    for (const id of (this._prevTrending || [])) {
      if (!ids.includes(id) && buyQuote(id).total <= this.state.balanceBB) {
        const cat = catalogById(id);
        this.toast("JUST SOLD: someone faster (" + (cat ? cat.short : id) + ")");
      }
    }
    this._prevTrending = ids;
    const sig = ids.join(",")
      + "|" + Market.activeListings().map((l) => l.id + l.phase + l.views).join(",")
      + "|" + Market.escrow().length
      + (this.state.invOpen ? "|" + now : "");
    if (sig !== this.state.marketSig) this.setState({ marketSig: sig });
  }
  openInventory(){
    Market.refreshViews(); // "after exactly one refresh" — the overlay reopening counts
    this.setState({ invOpen: true });
  }
  closeInventory(){ this.setState({ invOpen:false, invDetailId:null }); }
  openInvDetail(id){
    const app = Market.maybeAppraise(id); // §1: wear worsens on appraisal, never improves
    if (app) this.toast("Re-appraised downward (§8.9). Condition worsened: " + app.from.replace(" (Certified Pre-Worse™)", "") + " → " + app.to + " (Certified Pre-Worse™).");
    this.setState({ invDetailId:id });
  }
  closeInvDetail(){ this.setState({ invDetailId:null }); }
  marketOpenCheckout(itemId){ this.setState({ marketCheckout:itemId }); }
  marketCloseCheckout(){ this.setState({ marketCheckout:null }); }
  marketConfirmPurchase(itemId){
    const q = buyQuote(itemId);
    if (!this.payBB(q.total, "marketplace-buy")) return; // buys never dodge; being broke is §1.3's department
    const cat = catalogById(itemId);
    Market.grantMarketPurchase(itemId);
    this.toast("Purchased: " + cat.short + " — " + TRADE_HOLD_LABEL + ". Purchases are decorative (§1).");
    this.setState({ marketCheckout:null });
  }
  marketHoverTrend(id){
    if (Math.random() < 0.3) {
      this.setState({ marketFlicker:id });
      clearTimeout(this._flickerT);
      this._flickerT = setTimeout(() => this.setState({ marketFlicker:null }), 950);
    }
  }
  marketInstantSell(uid){
    const res = Market.instantSell(uid);
    if (!res) return;
    this.awardBB(res.offerBB, "instant-sell"); // the only path that ever credits BB
    this.toast(res.receiptLine);
    this.setState({ invDetailId:null });
  }
  marketStartAsk(uid){ this.setState({ marketAskFor:uid, marketAskInput:"" }); }
  marketSetAsk(v2){ this.setState({ marketAskInput:v2 }); }
  marketCancelAsk(){ this.setState({ marketAskFor:null, marketAskInput:"" }); }
  marketConfirmAsk(){
    const uid = this.state.marketAskFor;
    const asking = Math.max(1, Math.floor(parseFloat(this.state.marketAskInput) || 0));
    if (!uid || !asking) return;
    if (!this.payBB(6, "marketplace-listing")) return; // Listing Fee 5 BB + Maternal Gratuity 1 BB
    const entry = Inventory.find(uid);
    if (!entry) return;
    const cat = entry.catalogId ? catalogById(entry.catalogId) : null;
    Market.addListing({ uid, name: cat ? cat.short : entry.name, askingBB: asking });
    this.toast("Listed at " + asking + " BB. Listing Fee 5 BB + Maternal Gratuity 1 BB (non-refundable, unforgettable). Views: 0.");
    this.setState({ marketAskFor:null, marketAskInput:"", invDetailId:null });
  }
  marketAcceptLowball(listingId){
    const l = Market.acceptLowball(listingId);
    if (l) this.toast("Offer accepted: 0.02 BB + exposure. Proceeds routed to Escrow (§7). Exposure is non-transferable.");
  }
  marketCancelListing(listingId){
    if (!this.payBB(3, "marketplace-delisting")) return;
    const l = Market.cancelListing(listingId);
    if (l) this.toast("Delisted. 3 BB Delisting Fee assessed. Item returned — relisted after public shame.");
  }
  contractToggle(uid){
    this.setState(s => {
      const sel = s.contractSel.includes(uid) ? s.contractSel.filter(x => x !== uid) : [...s.contractSel, uid].slice(-5);
      return { contractSel: sel };
    });
  }
  contractRun(){
    const sel = [...this.state.contractSel];
    const preview = Market.contractPreview(sel);
    if (!preview) { this.toast("Trade-Up Contract: requires 5 same-tier Market-Grade items (JPEGs, listed items, and trade-held items don't count)."); return; }
    if (!this.payBB(Market.contractFeeTotal(), "trade-up-contract")) return; // 5 BB origination + 1 BB gratuity
    this.setState({ contractPhase:"reel", contractScoot:false, contractResult:null });
    clearTimeout(this._contractT);
    setTimeout(() => this.setState({ contractScoot:true }), 1700); // the Covert slot scoots one left
    this._contractT = setTimeout(() => {
      const res = Market.tradeUpOutcome(sel);
      this.setState({ contractPhase:"done", contractResult:res, contractSel:[] });
      if (res.ok) {
        this.toast(res.kind === "photograph" ? res.note : "Contract fulfilled: " + res.name + " (float " + res.float.toFixed(10) + "). " + res.statTrakNote + ".");
        this.pushTicker(this.playerTagOrYou() + " traded five regrets for " + (res.kind === "photograph" ? "a complementary photograph" : res.name));
      }
    }, 2700);
  }
  invAppealStart(cardId){
    clearTimeout(this._appealT);
    this.setState({ invAppeal:{ id:cardId, step:0, closed:false } });
    const advance = (step) => {
      this._appealT = setTimeout(() => {
        if (step <= SUPPORTBOT_DEFLECTIONS.length) {
          this.setState({ invAppeal:{ id:cardId, step, closed:false } });
          advance(step + 1);
        } else {
          this.setState({ invAppeal:{ id:cardId, step, closed:true } }); // ticket closed: "Resolved (by us)."
        }
      }, 1600);
    };
    advance(1);
  }
  invAppealClose(){
    clearTimeout(this._appealT);
    this.setState({ invAppeal:{ id:null, step:0, closed:false } });
  }

  openAskMom(opts={}){
    const source = opts.source || "header";
    this.setState({askmom:{source, enterStage: opts.enterStage || null}});
    Bus.emit(EVENTS.ASKMOM_OPENED, {source});
  }
  closeAskMom(res={}){
    this.setState({askmom:null});
    if (res.abandoned) {
      this.setState({abandonedCount:(this.state.abandonedCount||0)+1});
      if (res.reason === "dad") this.toast("§3.1 reminder: it would be the wrong Visa.");
    }
  }
  creditOC(oc, bonus){
    const nb = this.state.balanceOC + oc;
    this.setState({balanceOC:nb});
    saveOC(nb);
    if (bonus) { saveBonus(bonus); this.setState({bonusOC:bonus}); }
  }
  creditBB(amount){
    const nb = this.state.balanceBB + amount;
    this.setState({balanceBB:nb}); this.saveBalance(nb);
    Bus.emit(EVENTS.BB_CREDITED, {amount, reason:"askmom-conversion", balanceBB: nb});
    const surface = this.pendingReplay;
    if (surface && nb >= GAME_PRICES_BB[surface]) {
      this.pendingReplay = null;
      clearTimeout(this._creditReplayTimer);
      const fn = {roulette:this.playRoulette, coinflip:this.playCoinflip, crash:this.startCrash, crates:this.buyKey}[surface];
      if (fn) this._creditReplayTimer = setTimeout(()=>fn.call(this), 700);
    }
  }
  convertOC(ocAmount, bbAmount){
    const ocLeft = Math.max(0, this.state.balanceOC - ocAmount);
    this.setState({balanceOC:ocLeft});
    saveOC(ocLeft);
    this.creditBB(bbAmount);
  }
  flyOC(n){
    const key = Date.now();
    this.setState({ocFly:{n, key}});
    clearTimeout(this._ocFlyTimer);
    this._ocFlyTimer = setTimeout(()=>this.setState({ocFly:null}), 1300);
  }
  toast(text, opts={}){
    const id = Date.now() + Math.random();
    this.setState(s=>({toasts:[...s.toasts, {id, text, actionLabel:opts.actionLabel, onAction:opts.onAction, dismissLabel:opts.dismissLabel}].slice(-4)}));
    if (!opts.dismissLabel) setTimeout(()=>this.setState(s=>({toasts:s.toasts.filter(t=>t.id!==id)})), 4800);
  }
  confetti(){
    const pieces = Array.from({length:24},()=>({left:Math.random()*100,color:["#ff5a14","#ffd54a","#8fd97a","#4a90e2"][Math.floor(Math.random()*4)],dur:1+Math.random(),delay:Math.random()*0.4}));
    this.setState({confettiOn:true, confettiPieces:pieces});
    setTimeout(()=>this.setState({confettiOn:false}), 1600);
  }
  dismissToast(id){
    this.setState(s=>({toasts:s.toasts.filter(t=>t.id!==id)}));
  }
  pushTicker(line){
    Ticker.emitTicker({ text: line, isYou: true });
  }
  pushChat(entry){
    this.setState(s=>({chat:[entry, ...s.chat].slice(0,6)}));
  }
  awardBB(amount, reason){
    if (!(amount > 0)) return;
    const nb = this.state.balanceBB + amount;
    this.setState({balanceBB:nb}); this.saveBalance(nb);
    Bus.emit(EVENTS.BB_CREDITED, {amount, reason, balanceBB: nb});
  }
  cooldownStart(){
    clearInterval(this._coolInt);
    const started = Date.now();
    this.setState({cooldown:{seconds:59, abandoned:false}});
    this._coolInt = setInterval(()=>{
      const elapsed = (Date.now()-started)/1000;
      if (elapsed < 3) this.setState({cooldown:{seconds:Math.max(0, 59-Math.floor(elapsed)), abandoned:false}});
      else if (elapsed < 5.5) this.setState({cooldown:{seconds:0, abandoned:true}});
      else { clearInterval(this._coolInt); this.setState({cooldown:null}); }
    }, 500);
  }
  topUpAndPlay(surface){
    this.pendingReplay = surface;
    this.openAskMom({source:surface});
  }

  renderVals(){
    const s = this.state;
    const bb = s.balanceBB;
    const vg = bb*V_GEMS_PER_BB, sc = bb*SKINCOINZ_PER_BB;
    const tabs = ["roulette","coinflip","crash","crates"];
    const tabBg = {}, tabColor = {};
    tabs.forEach(t=>{ const on = s.activeTab===t; tabBg[t]= on ? "linear-gradient(160deg,#3a1206,#2a0d05)" : "#1a0d05"; tabColor[t]= on ? "#ffb347" : "#a9705a"; });
    const catalog = CATALOG.map(it=>({...it, rarityColor: RARITY_COLORS[it.rarity]||"#ff8a3d"}));
    const playerTag = s.ident ? (s.ident.custom || s.ident.tag) : null;
    const gateOnlyFirst = s.gateChecks[0] && !s.gateChecks[1] && !s.gateChecks[2];
    const gateCanContinue = s.gateChecks.some(Boolean);
    const meterPct = (s.tosPct>=99 && s.tosDwellOk) ? 100 : Math.min(99, s.tosPct);
    const rerollFee = s.ident ? s.ident.nextRerollFeeBB : 0;
    const stats = s.stats || {};
    return {
      ageVerified:s.ageVerified, confettiOn:s.confettiOn, confettiPieces:s.confettiPieces,
      flowPhase:s.flowPhase,
      gateStep:s.gateStep, gateChecks:s.gateChecks, gateOnlyFirst, gateCanContinue,
      toggleGateCheck:(i)=>this.toggleGateCheck(i), gateStep1Continue:()=>this.gateStep1Continue(),
      gateMomNote:s.gateMomNote, gateMomAnswer:(w)=>this.gateMomAnswer(w),
      gateYearMsg:s.gateYearMsg, gateYearOk:s.gateYearOk, gateRejections:s.gateRejections,
      gateYearOptions:SHUFFLED_YEARS, gateKarenYear:KAREN_YEAR, gateYearSelect:(v)=>this.gateYearSelect(v),
      gateSkip:()=>this.gateSkip(), completeGate:()=>this.completeGate(),
      momModalOpen:s.momModalOpen, momModalStep:s.momModalStep, momModalMsg:s.momModalMsg,
      momModalQ1:s.momModalQ1, momModalQ2:s.momModalQ2, momModalCheck:s.momModalCheck,
      setMomModalQ1:(v)=>this.setState({momModalQ1:v}), setMomModalQ2:(v)=>this.setState({momModalQ2:v}),
      setMomModalCheck:(v)=>this.setState({momModalCheck:v}),
      momModalSubmit:()=>this.momModalSubmit(), momModalFinish:()=>this.momModalFinish(),
      momsGlow:s.momsGlow,
      revealTag: s.ident ? s.ident.tag : null,
      revealReroll:()=>this.revealReroll(), acceptFate:()=>this.acceptFate(),
      tosOpen:s.tosOpen, tosConsent:s.tosConsent,
      tosMeterLabel: meterPct>=100 ? "I have read the Terms (allegedly)" : meterPct>=99 ? "So close. Linger. (§10.1(b))" : "I have read the Terms ("+meterPct+"%)",
      tosAcceptReady: meterPct>=100,
      onTosScroll:(e)=>this.onTosScroll(e), acceptTos:()=>this.acceptTos(), closeTos:()=>this.closeTos(), openTos:()=>this.openTos(),
      tosFooterLabel: s.tosAcceptedEver ? "Terms of Service (you've been warned)" : "Terms of Service (please don't read this)",
      tosArticles:TOS_ARTICLES, tosFiller:TOS_FILLER, realityStrap:REALITY_STRAP,
      tosScrollRef:this._tosScrollRef, art8Ref:this._art8Ref,
      playerTag, youColor:YOU_COLOR,
      identityOpen:s.identityOpen, openIdentity:()=>this.openIdentity(), closeIdentity:()=>this.closeIdentity(),
      statsBBLost:stats.bbLost||0, statsUSD:stats.usdBorrowed||0, statsCrates:stats.cratesOpened||0,
      statsWithdrawals:stats.withdrawalsPending||0, statsWorst:stats.worstLossBB||0, statsStreak:stats.lossStreak||0,
      rerollFee, rerollFeeCopy: rerollFee===0 ? "Identity crisis #1: complimentary." : "Reroll fee: "+rerollFee+" BB (doubles each time, see §8.9). Changing your name does not change your debts.",
      rerollLabel: rerollFee===0 ? "Reroll (free)" : "Reroll ("+rerollFee+" BB)",
      doReroll:()=>this.panelReroll(),
      customInput:s.customInput, setCustomInput:(v)=>this.setState({customInput:v}),
      customMsg:s.customMsg, buyCustom:()=>this.buyCustom(), customPrice:CUSTOM_NAME_PRICE_OC,
      customAffordable: s.balanceOC >= CUSTOM_NAME_PRICE_OC,
      panicActive:s.panicActive, togglePanic:()=>this.togglePanic(),
      panicEssay:s.panicEssay, panicWordCount:s.panicWordCount, panicHint:s.panicHint,
      panicFileMenu:s.panicFileMenu, panicFileMenuToggle:()=>this.panicToggleFileMenu(),
      panicFileMenuClose:()=>this.setState({panicFileMenu:false}),
      panicWelcome:s.panicWelcome, panicMoodShown:s.panicMoodShown,
      panicToggleMood:()=>this.panicToggleMood(), panicDismissWelcome:()=>this.panicDismissWelcome(),
      panicRung: this._panicRung || 1,
      panicRestoreLabel: restoreLabelFor(this._panicRung || 1),
      panicParagraphs: s.panicEssay ? essayParagraphs(s.panicEssay.subject) : [],
      panicGrowthParas: s.panicEssay
        ? growthParagraphs(s.panicEssay.seed || "0", Math.min(6000, Math.max(0, s.panicWordCount - staticWordCount(s.panicEssay.subject))))
        : [], // rendered tail caps at 6k words; the chip keeps its true count
      panicGrade: s.panicEssay ? gradeLabel(s.panicEssay.teacher) : "",
      panicTeacher: s.panicEssay ? teacherDisplay(s.panicEssay.teacher) : "",
      panicShowMargin: (this._panicRung || 1) >= 2,
      panicRgTagline: RG_TAGLINE, panicExportLine: ESSAY_EXPORT_LINE, panicMarginComment: RUNG2_MARGIN_COMMENT,
      bandMuted:s.bandMuted, toggleBandMuted:()=>this.toggleBandMuted(),
      muteTitle: MUTE_TOOLTIP + "\n\n" + MUTE_FINE_PRINT,
      mainBlurFilter: s.panicActive ? "blur(4px)" : "none",
      bbDisplay:fmtBB(bb), ocDisplay:s.balanceOC.toLocaleString("en-US"), ocCount:s.balanceOC,
      vgDisplay:Math.round(vg).toLocaleString("en-US"), scDisplay:sc.toFixed(2),
      moodLine: s.moodWord ? ("Today's mood: "+s.moodWord+" — rates recalculated per §8.9") : "",
      showNag: bb < DESPERATION_THRESHOLD_BB, nagCopy:NAG_LOW_BB_COPY,
      nagTopUp:()=>this.openAskMom({source:"nag"}),
      denomsOpen:s.denomsOpen, openDenoms:()=>this.setState({denomsOpen:true}), closeDenoms:()=>this.setState({denomsOpen:false}),
      topUp:()=>this.openAskMom({source:"header"}),
      askMomFailedSpend:()=>this.openAskMom({source:"failed-spend"}),
      ocHint: s.balanceOC > 0 ? "OC cannot play games. It can only become BB (§2.5). It is currently becoming nothing." : null,
      openConversion:()=>this.openAskMom({source:"header", enterStage:"conversion"}),
      bonusSub: s.bonusOC ? ("+"+s.bonusOC.amount+" Bonus OC (expires at the next mood change)") : null,
      ocFly:s.ocFly, cooldown:s.cooldown,
      streakChip: s.streakChip && s.streakChip.days >= 1 && !s.streakChip.stuck,
      abandonedCount: s.abandonedCount || 0,
      toasts:s.toasts, dismissToast:(id)=>this.dismissToast(id),
      insufficientMsg:s.insufficientMsg,
      askmom: s.askmom,
      askmomHooks: {
        close:(res)=>this.closeAskMom(res),
        creditOC:(oc,bonus)=>this.creditOC(oc,bonus),
        convertOC:(oc,bb)=>this.convertOC(oc,bb),
        creditBB:(n)=>this.creditBB(n),
        confetti:()=>this.confetti(),
        flyOC:(n)=>this.flyOC(n),
        toast:(t,o)=>this.toast(t,o),
        ticker:(l)=>this.pushTicker(l),
        cooldown:()=>this.cooldownStart(),
      },
      replayRoulette: s.rouletteResult && bb < GAME_PRICES_BB.roulette, topUpAndPlayRoulette:()=>this.topUpAndPlay("roulette"),
      replayCoinflip: s.coinResult && bb < GAME_PRICES_BB.coinflip, topUpAndPlayCoinflip:()=>this.topUpAndPlay("coinflip"),
      replayCrash: s.crashPhase==="crashed" && bb < GAME_PRICES_BB.crash, topUpAndPlayCrash:()=>this.topUpAndPlay("crash"),
      replayCrates: !s.crateOpening && !s.crateKeyBought && s.crateFreeKeyCount<=0 && bb < GAME_PRICES_BB.crates, topUpAndPlayCrates:()=>this.topUpAndPlay("crates"),
      showTicker: this.props.showTicker ?? true,
      showChat: this.props.showChat ?? true,
      chatHooks: { gratuity:(n)=>this.chatGratuity(n) },
      activeTab:s.activeTab, tabBg, tabColor,
      isRoulette: s.activeTab==="roulette", isCoinflip: s.activeTab==="coinflip", isCrash: s.activeTab==="crash", isCrates: s.activeTab==="crates",
      setTab_roulette:()=>this.setTab("roulette"), setTab_coinflip:()=>this.setTab("coinflip"),
      setTab_crash:()=>this.setTab("crash"), setTab_crates:()=>this.setTab("crates"),
      rouletteStrip:ROULETTE_STRIP, rouletteOffset:s.rouletteOffset, rouletteTransition:s.rouletteTransition,
      rouletteSpinning:s.rouletteSpinning, rouletteResult:s.rouletteResult, playRoulette:()=>this.playRoulette(),
      rouletteSpinPrice: Roulette.SPIN_PRICE_BB + (s.rouletteTurboUnlocked && s.rouletteTurbo ? Roulette.TURBO_FEE_BB : 0) + (s.rouletteInsured ? Roulette.INSURANCE_FEE_BB : 0),
      rouletteBtnLabel: s.rouletteSpinning ? "Spinning..." : ("SPIN AGAIN — "+(Roulette.SPIN_PRICE_BB + (s.rouletteTurboUnlocked && s.rouletteTurbo ? Roulette.TURBO_FEE_BB : 0) + (s.rouletteInsured ? Roulette.INSURANCE_FEE_BB : 0))+" BB"),
      rouletteSpinsLeft: Math.floor(bb / Roulette.SPIN_PRICE_BB),
      rouletteInsured:s.rouletteInsured, toggleRouletteInsured:()=>this.toggleRouletteInsured(),
      rouletteTurboUnlocked:s.rouletteTurboUnlocked, rouletteTurbo:s.rouletteTurbo, toggleRouletteTurbo:()=>this.toggleRouletteTurbo(),
      rouletteConsolationMsg:s.rouletteConsolationMsg,
      rouletteReceipt:s.rouletteReceipt, rouletteReceiptOpen:s.rouletteReceiptOpen, toggleRouletteReceipt:()=>this.toggleRouletteReceipt(),
      rouletteFairness:s.rouletteFairness, rouletteFairnessOpen:s.rouletteFairnessOpen,
      openRouletteFairness:()=>this.openRouletteFairness(), closeRouletteFairness:()=>this.closeRouletteFairness(),
      rouletteJackpotBox:s.rouletteJackpotBox, rouletteCashOut:()=>this.rouletteCashOut(), rouletteKeepSpinning:()=>this.rouletteKeepSpinning(),
      rouletteBannerNames: s.rouletteBannerNames.length ? s.rouletteBannerNames : ["definitely_not_a_bot","MomApproved88","xX_QuickScope_Xx","yeetmaster3000","NotABot_Trust","TotallyRealUser42","GrandmasCreditCard"],
      rouletteVault: Vault.get(), rouletteVaultLine: Vault.receiptLine(),
      chaseIt:()=>this.chaseIt(), showChaseIt: !!s.rouletteResult && !s.rouletteSpinning && s.rouletteStreak >= 1, chaseItPrice: Roulette.CHASE_IT_PRICE_BB,
      coinFlipping:s.coinFlipping, coinResult:s.coinResult,
      playCoinflipMom:()=>this.playCoinflip("MOM"), playCoinflipS89:()=>this.playCoinflip("§8.9"),
      coinBtnLabel: s.coinFlipping ? "Flipping..." : ("FLIP AGAIN — "+Coinflip.FLIP_PRICE_BB+" BB"),
      coinAnim: s.coinFlipping ? "coinFlip 2s ease-in-out" : "none",
      coinLastCall:s.coinLastCall, coinCallCounts:s.coinCallCounts,
      coinStashItem:s.coinStashItem, coinEdgeCount:s.coinEdgeCount, coinStreak:s.coinStreak,
      coinReceipt:s.coinReceipt, coinReceiptOpen:s.coinReceiptOpen, toggleCoinReceipt:()=>this.toggleCoinReceipt(),
      coinFairness:s.coinFairness, coinFairnessOpen:s.coinFairnessOpen,
      openCoinFairness:()=>this.openCoinFairness(), closeCoinFairness:()=>this.closeCoinFairness(),
      coinDoN:s.coinDoN, coinDoubleOrNothingAccept:()=>this.coinDoubleOrNothingAccept(), coinDoubleOrNothingDecline:()=>this.coinDoubleOrNothingDecline(),
      coinflipRematch:()=>this.coinflipRematch(), showRematch: !!s.coinResult && !s.coinFlipping && s.coinStreak >= 1,
      // College Fund Crash
      crashPhase:s.crashPhase,
      crashRunning: s.crashPhase==="climbing" || s.crashPhase==="scheduling", crashResult:s.crashResult,
      crashScheduling: s.crashPhase==="scheduling",
      startCrash:()=>this.startCrash(),
      crashFundName: fundNameForRun(s.crashRunCount || 1),
      crashRunLabel: s.crashRunCount>0 ? ("RUN #"+s.crashRunCount+" — "+fundNameForRun(s.crashRunCount)) : "",
      crashStartLabel: s.crashPhase==="scheduling" ? "SCHEDULING…" : (s.crashPhase==="climbing" ? "Running..." : (s.crashRunCount>0 ? "Run It Back ("+GAME_PRICES_BB.crash+" BB)" : "Start Run ("+GAME_PRICES_BB.crash+" BB)")),
      crashCommitment: s.crashCommitment,
      crashMultDisplay: s.crashMult.toFixed(2)+"x",
      crashColor: s.crashCrashed ? "#ff4444" : (s.crashStickActive ? "#ffd54a" : "#8fd97a"),
      crashBarHeight: Math.min(95, (s.crashMult-1)*40),
      crashStickActive: s.crashStickActive,
      crashCashoutClick:()=>this.crashCashoutClick(), crashDodgeAttempt:()=>this.crashDodgeAttempt(),
      cashoutDodgeX: s.crashOffset.x, cashoutDodgeY: s.crashOffset.y, cashoutScale: s.crashScale,
      cashoutStick: s.crashStickActive && !s.crashExhausted && !s.crashProcessing,
      cashoutScaleNow: (s.crashStickActive && !s.crashExhausted) ? s.crashScale * 1.2 : s.crashScale,
      crashButtonLabel: s.crashButtonLabel,
      crashExhausted: s.crashExhausted, crashProcessing: s.crashProcessing,
      cashoutColor: s.crashExhausted ? "#8fd97a" : (s.crashPhase==="climbing" ? "#ffcf9a" : "#5a4232"),
      crashInterstitial: s.crashPhase==="crashed",
      crashComeInThrees: s.crashConsecutiveLosses>=2,
      expressCashoutLabel: "ExpressCashout™ (eta: "+(s.moodWord||"pending")+")",
      expressCashoutClick:()=>this.expressCashoutClick(),
      crashCanRun: bb >= GAME_PRICES_BB.crash,
      crashNeedBBLabel: "Run It Back (need "+GAME_PRICES_BB.crash+" BB, have "+fmtBB(bb)+")",

      // Loot Crate Defuser
      crateKeyBought:s.crateKeyBought, buyKey:()=>this.buyKey(), useFreeKey:()=>this.useFreeKey(),
      crateFreeKeyCount:s.crateFreeKeyCount,
      crateBtnLabel: bb < GAME_PRICES_BB.crates ? "Ask Mom for Key Money" : (s.crateRevealPhase==="award" ? "Open Another ("+GAME_PRICES_BB.crates+" BB)" : "Single Virtual Key ("+GAME_PRICES_BB.crates+" BB)"),
      crateBtnAction: bb < GAME_PRICES_BB.crates ? ()=>this.openAskMom({source:"crates"}) : ()=>this.buyKey(),
      crateOpening:s.crateOpening, crateProgress:Math.round(s.crateProgress), openCrate:()=>this.openCrate(),
      crateOpenLabel: s.crateOpening ? "Defusing... (unskippable)" : "Open Crate",
      crateStage:s.crateStage, crateCaption:s.crateCaption, trackNameCaption:TRACK_NAME_CAPTION,
      crateSkipAvailable:s.crateSkipAvailable, crateSkipUsed:s.crateSkipUsed, skipCrate:()=>this.skipCrate(),
      crateSkipLabel:"Skip — "+SKIP_PRICE_BB+" BB",
      crateSkipFinePrint:"Skip reduces perceived time only. (delivery pending, §1.3)",
      crateReel:s.crateReel, crateRevealPhase:s.crateRevealPhase, crateAward:s.crateAward,
      fruitRollUp:FRUIT_ROLL_UP,
      crateResult:s.crateResult,
      crateInspectOpen:s.crateInspectOpen, toggleInspectCrate:()=>this.setState(s2=>({crateInspectOpen:!s2.crateInspectOpen})),
      crateAnim: s.crateOpening ? "pulseGlow 0.6s infinite" : "none",
      cratePity:s.cratePity, cratePityLabel: "Pity Meter: "+s.cratePity+" / 50 — GUARANTEED Rare-or-better every 50 crates!™",
      cratePityFinePrint:"pity progress may be recalculated based on mood · Rare-or-better is satisfiable by any tier labeled Rare *by us*",
      crateInventoryCount:s.crateHeldCount,
      crateMomKeyClaimableToday:s.crateMomKeyClaimableToday, crateMomKeyStreak:s.crateMomKeyStreak,
      claimDailyMomKey:()=>this.claimDailyMomKey(),
      momKeyBoxLabel: s.crateMomKeyStreak>=3 ? "Premium Mom Crate (Matte)" : "MOM (envelope)",
      crateEnvelope:s.crateEnvelope, dismissCrateEnvelope:()=>this.dismissCrateEnvelope(),

      // Marketplace & Inventory (#27)
      invOpen:s.invOpen, openInventory:()=>this.openInventory(), closeInventory:()=>this.closeInventory(),
      portfolio: Market.portfolio(), portfolioHover: PORTFOLIO_HOVER,
      inventoryItems: Inventory.list(),
      invMarketGrade: Inventory.list().filter(e=>e.itemClass==="market-grade" && !e.listedForBB),
      invDigital: Inventory.list().filter(e=>e.itemClass==="digital-asset"),
      invDetail: s.invDetailId ? Inventory.find(s.invDetailId) : null,
      openInvDetail:(id)=>this.openInvDetail(id), closeInvDetail:()=>this.closeInvDetail(),
      mkSellable:(e)=>Market.sellable(e), mkOfferFor:(e)=>Market.instantSellOfferFor(e), instantSellSub: INSTANT_SELL_SUBLIE,
      marketInstantSell:(uid)=>this.marketInstantSell(uid),
      marketAskFor:s.marketAskFor, marketAskInput:s.marketAskInput,
      marketSetAsk:(v2)=>this.marketSetAsk(v2), marketStartAsk:(uid)=>this.marketStartAsk(uid),
      marketConfirmAsk:()=>this.marketConfirmAsk(), marketCancelAsk:()=>this.marketCancelAsk(),
      mkListings: Market.listings(), mkActive: Market.activeListings(),
      marketAcceptLowball:(id)=>this.marketAcceptLowball(id), marketCancelListing:(id)=>this.marketCancelListing(id),
      escrowCards: Market.escrow(), soldLedger: Market.soldLedger(),
      appealState: s.invAppeal, invAppealStart:(id)=>this.invAppealStart(id), invAppealClose:()=>this.invAppealClose(),
      contractSel:s.contractSel, contractChips: s.contractSel.map(id=>Inventory.find(id)).filter(Boolean),
      contractPhase:s.contractPhase, contractResult:s.contractResult, contractScoot:s.contractScoot,
      contractToggle:(uid)=>this.contractToggle(uid), contractRun:()=>this.contractRun(),
      contractFee: Market.contractFeeTotal(),
      marketCheckoutItem: s.marketCheckout ? { ...catalogById(s.marketCheckout), quote: buyQuote(s.marketCheckout) } : null,
      marketOpenCheckout:(id)=>this.marketOpenCheckout(id), marketCloseCheckout:()=>this.marketCloseCheckout(),
      marketConfirmPurchase:(id)=>this.marketConfirmPurchase(id),
      trending: featuredItems(bb), marketFlicker:s.marketFlicker, marketHoverTrend:(id)=>this.marketHoverTrend(id),
      catalogLive: CATALOG.map(it=>({ ...it, rarityColor: RARITY_COLORS[it.rarity]||"#ff8a3d", est: currentEst(it.id), quote: buyQuote(it.id) })),
    };
  }

  render() {
    const v = this.renderVals();

    const gateCard = (
      <div style={{background:"linear-gradient(160deg,#2a0e05,#4a1707)",border:"3px solid #ff5a14",borderRadius:"10px",maxWidth:"460px",width:"100%",padding:"32px",textAlign:"center",boxShadow:"0 0 60px rgba(255,80,20,0.4)"}}>
        <div style={{fontFamily:"'Bangers',cursive",fontSize:"34px",color:"#ffb347",letterSpacing:"1px",textShadow:"2px 2px 0 #7a1c00"}}>AGE VERIFICATION REQUIRED</div>
        <p style={{color:"#ffd9b3",fontSize:"15px",lineHeight:1.5,margin:"16px 0 24px"}}>By law (the law of vibes), you must confirm your eligibility before accessing real-money-adjacent gambling-flavored entertainment.</p>

        {v.gateStep===0 && (
          <div>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"18px",color:"#ff8a3d",marginBottom:"12px",letterSpacing:"1px"}}>ARE YOU OLD ENOUGH? (SPEEDRUN)</div>
            {GATE_CHECKBOXES.map((label,i)=>(
              <label key={i} style={{display:"flex",alignItems:"flex-start",gap:"8px",textAlign:"left",background:"#1c0d06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"9px 11px",marginBottom:"8px",fontSize:"12.5px",color:"#ffd9b3",cursor:"pointer",lineHeight:1.4}}>
                <input type="checkbox" checked={v.gateChecks[i]} onChange={()=>v.toggleGateCheck(i)} style={{marginTop:"2px"}} />
                <span>{label}</span>
              </label>
            ))}
            {v.gateOnlyFirst && (
              <div style={{fontSize:"11px",color:"#e8a52a",fontStyle:"italic",margin:"6px 0"}}>Suspicious. Nobody checks only the first box. Proceeding anyway.</div>
            )}
            <button onClick={v.gateStep1Continue} disabled={!v.gateCanContinue} style={{marginTop:"14px",background:v.gateCanContinue?"linear-gradient(180deg,#ff8a3d,#e0480a)":"#3a2010",border:"2px solid #ffcf9a",color:v.gateCanContinue?"#2a0e05":"#8a6a52",fontWeight:900,fontSize:"13px",padding:"12px 18px",borderRadius:"8px",cursor:v.gateCanContinue?"pointer":"not-allowed",width:"100%"}}>{v.gateCanContinue?"Continue":"Select at least one (1) truth."}</button>
          </div>
        )}

        {v.gateStep===1 && (
          <div>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"18px",color:"#ff8a3d",marginBottom:"12px",letterSpacing:"1px"}}>IS MOM HOME?</div>
            {v.gateMomNote && (
              <div style={{background:"#1c0d06",border:"1px solid #7a3a1a",borderRadius:"6px",padding:"9px 11px",marginBottom:"12px",fontSize:"12.5px",color:"#e8a52a",fontStyle:"italic"}}>{v.gateMomNote}</div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              <button onClick={()=>v.gateMomAnswer("yes")} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 18px",borderRadius:"8px",cursor:"pointer"}}>Yes</button>
              <button onClick={()=>v.gateMomAnswer("no")} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 18px",borderRadius:"8px",cursor:"pointer"}}>No</button>
              <button onClick={()=>v.gateMomAnswer("mom")} style={{background:"#3a2010",border:"2px dashed #ff8a3d",color:"#ffcf9a",fontWeight:900,fontSize:"14px",padding:"12px 18px",borderRadius:"8px",cursor:"pointer"}}>I am Mom (hi)</button>
            </div>
          </div>
        )}

        {v.gateStep===2 && (
          <div>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"18px",color:"#ff8a3d",marginBottom:"12px",letterSpacing:"1px"}}>WHAT YEAR WERE YOU BORN? (FOR LEGAL REASONS)</div>
            {v.gateMomNote && (
              <div style={{background:"#1c0d06",border:"1px solid #7a3a1a",borderRadius:"6px",padding:"9px 11px",marginBottom:"12px",fontSize:"12.5px",color:"#e8a52a",fontStyle:"italic"}}>{v.gateMomNote}</div>
            )}
            <select onChange={(e)=>{v.gateYearSelect(e.target.value); e.target.value="";}} style={{width:"100%",background:"#1c0d06",border:"2px solid #7a3a1a",borderRadius:"6px",color:"#ffd9b3",fontSize:"14px",padding:"11px",cursor:"pointer"}}>
              <option value="">— choose a year —</option>
              {v.gateYearOptions.map(y=>(<option key={y} value={y}>{y}</option>))}
              <option value="karen">{v.gateKarenYear}</option>
            </select>
            {v.gateYearMsg && (
              <div style={{background:"#1c0d06",border:"1px solid #7a3a1a",borderRadius:"6px",padding:"9px 11px",margin:"12px 0",fontSize:"12.5px",color:"#e8a52a",fontStyle:"italic"}}>{v.gateYearMsg}</div>
            )}
            {v.gateRejections>=2 && !v.gateYearOk && (
              <button onClick={v.gateSkip} style={{background:"none",border:"none",color:"#a9705a",fontSize:"11px",textDecoration:"underline",cursor:"pointer",padding:0,marginBottom:"10px",display:"block",margin:"0 auto 10px"}}>Skip (legal)</button>
            )}
            {v.gateYearOk && (
              <button onClick={v.completeGate} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"15px",padding:"13px 20px",borderRadius:"8px",cursor:"pointer",width:"100%"}}>I am 18+, or my older brother is in the other room and said it's fine.</button>
            )}
          </div>
        )}

        <div style={{marginTop:"16px",fontSize:"10px",color:"#a9705a",lineHeight:1.5}}>This is a satirical parody. No real money, currency, or skins exist here. Nothing on this page has value. Please, for the love of god, log off. (§12.4)</div>
        <div style={{marginTop:"6px",fontSize:"8.5px",color:"#7a5a4a",fontStyle:"italic"}}>{AUTOPLAY_NOTE}</div>
      </div>
    );

    const momModal = (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:250,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <div style={{background:"linear-gradient(160deg,#2a0e05,#4a1707)",border:"3px solid #ff5a14",borderRadius:"10px",maxWidth:"440px",width:"100%",padding:"28px",textAlign:"center",boxShadow:"0 0 60px rgba(255,80,20,0.4)"}}>
          <div style={{fontFamily:"'Bangers',cursive",fontSize:"26px",color:"#ffb347",letterSpacing:"1px",textShadow:"2px 2px 0 #7a1c00"}}>ARE YOU MOM? — VERIFICATION</div>
          <p style={{color:"#ffd9b3",fontSize:"13px",fontStyle:"italic",margin:"12px 0 18px"}}>Thank you for your interest in being Mom. Please complete the following.</p>
          {v.momModalMsg && (
            <div style={{background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"9px 11px",marginBottom:"14px",fontSize:"12.5px",color:"#ffcf9a",fontWeight:700}}>{v.momModalMsg}</div>
          )}
          {v.momModalStep===0 && (
            <div>
              <div style={{color:"#ffd9b3",fontSize:"13px",marginBottom:"10px",textAlign:"left"}}>What is your child's gamertag?</div>
              <input value={v.momModalQ1} onChange={e=>v.setMomModalQ1(e.target.value)} style={{width:"100%",boxSizing:"border-box",background:"#1c0d06",border:"2px solid #7a3a1a",borderRadius:"6px",color:"#ffd9b3",fontSize:"14px",padding:"10px",marginBottom:"12px"}} />
              <button onClick={v.momModalSubmit} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"13px",padding:"11px 18px",borderRadius:"8px",cursor:"pointer",width:"100%"}}>Submit</button>
            </div>
          )}
          {v.momModalStep===1 && (
            <div>
              <div style={{color:"#ffd9b3",fontSize:"13px",marginBottom:"10px",textAlign:"left"}}>A mother would know: what's the password?</div>
              <input type="password" value={v.momModalQ2} onChange={e=>v.setMomModalQ2(e.target.value)} style={{width:"100%",boxSizing:"border-box",background:"#1c0d06",border:"2px solid #7a3a1a",borderRadius:"6px",color:"#ffd9b3",fontSize:"14px",padding:"10px",marginBottom:"12px"}} />
              <button onClick={v.momModalSubmit} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"13px",padding:"11px 18px",borderRadius:"8px",cursor:"pointer",width:"100%"}}>Submit</button>
            </div>
          )}
          {v.momModalStep===2 && (
            <div>
              <label style={{display:"flex",alignItems:"center",gap:"8px",justifyContent:"center",fontSize:"13px",color:"#ffd9b3",marginBottom:"14px",cursor:"pointer"}}>
                <input type="checkbox" checked={v.momModalCheck} onChange={e=>v.setMomModalCheck(e.target.checked)} />
                <span>Fine. But this is the last time.</span>
              </label>
              <button onClick={v.momModalFinish} disabled={!v.momModalCheck} style={{background:v.momModalCheck?"linear-gradient(180deg,#ff8a3d,#e0480a)":"#3a2010",border:"2px solid #ffcf9a",color:v.momModalCheck?"#2a0e05":"#8a6a52",fontWeight:900,fontSize:"13px",padding:"11px 18px",borderRadius:"8px",cursor:v.momModalCheck?"pointer":"not-allowed",width:"100%"}}>Complete Verification</button>
            </div>
          )}
        </div>
      </div>
    );

    const revealCard = (
      <div style={{background:"linear-gradient(160deg,#2a0e05,#4a1707)",border:"3px solid #ffd54a",borderRadius:"10px",maxWidth:"460px",width:"100%",padding:"32px",textAlign:"center",boxShadow:"0 0 60px rgba(255,213,74,0.35)"}}>
        <div style={{fontFamily:"'Bangers',cursive",fontSize:"30px",color:"#ffb347",letterSpacing:"1px",textShadow:"2px 2px 0 #7a1c00"}}>IDENTITY ASSIGNED</div>
        <div style={{margin:"20px 0",fontSize:"15px",color:"#ffd9b3"}}>You are:</div>
        <div key={v.revealTag} style={{fontFamily:"'Bangers',cursive",fontSize:"30px",color:"#ffd54a",textShadow:"2px 2px 0 #7a1c00,0 0 24px rgba(255,213,74,0.5)",marginBottom:"16px",animation:"tagStamp 0.5s ease-out",overflowWrap:"anywhere"}}>{v.revealTag}</div>
        <p style={{color:"#d8b79b",fontSize:"11.5px",lineHeight:1.6,margin:"0 0 20px"}}>Usernames are assigned by the house. The house knows best. This identity is non-transferable, non-refundable, and legally distinct from you (see §1.3).</p>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={v.revealReroll} style={{flex:1,background:"#3a2010",border:"2px dashed #ffd54a",color:"#ffd54a",fontWeight:900,fontSize:"13px",padding:"12px 10px",borderRadius:"8px",cursor:"pointer"}}>Reroll (first one's free)</button>
          <button onClick={v.acceptFate} style={{flex:1,background:"linear-gradient(180deg,#ffd54a,#c9960a)",border:"2px solid #fff2c9",color:"#2a0e05",fontWeight:900,fontSize:"13px",padding:"12px 10px",borderRadius:"8px",cursor:"pointer"}}>Accept fate</button>
        </div>
      </div>
    );

    const tosModal = (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:v.flowPhase==="tos"?210:150,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <div style={{background:"#1c0d06",border:"2px solid #7a3a1a",borderRadius:"8px",maxWidth:"560px",width:"100%",maxHeight:"82vh",display:"flex",flexDirection:"column",padding:"24px 24px 18px",fontSize:"13px",color:"#d8b79b",lineHeight:1.6,boxShadow:"0 0 60px rgba(0,0,0,0.8)"}}>
          <div style={{fontFamily:"'Bangers',cursive",fontSize:"22px",color:"#ff8a3d",marginBottom:"4px"}}>Terms of Service (Excerpts)</div>
          <div style={{fontSize:"11px",color:"#8a6a52",fontStyle:"italic",marginBottom:"12px"}}>— a legal document about a fake website</div>
          <div ref={v.tosScrollRef} onScroll={v.onTosScroll} style={{overflowY:"auto",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"14px 16px",flex:1,minHeight:"0"}}>
            {v.tosArticles.map((art,ai)=>(
              <div key={ai} ref={art.art8?v.art8Ref:undefined}>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:"15px",color:"#ffb347",margin:"16px 0 8px",letterSpacing:"0.5px"}}>{art.title}</div>
                {art.clauses.map((cl)=>(
                  <p key={cl.n} style={{margin:"0 0 10px"}}><b style={{color:"#ffb347"}}>{cl.n} ({cl.t}).</b> {cl.b}</p>
                ))}
              </div>
            ))}
            {v.tosFiller.map((f)=>(
              <p key={f.n} style={{margin:"0 0 10px",fontSize:f.faint?"6px":undefined,color:f.faint?"#5a4232":undefined}}>
                <b style={{color:f.faint?"#5a4232":"#8a6a52"}}>{f.n}.</b> {f.body}
              </p>
            ))}
            <div style={{height:"8px"}}></div>
          </div>
          <div style={{marginTop:"12px",fontSize:"10.5px",color:"#8a6a52",fontStyle:"italic",textAlign:"center"}}>{v.realityStrap}</div>
          <div style={{marginTop:"10px",display:"flex",gap:"10px",justifyContent:"center"}}>
            {v.tosConsent ? (
              <button onClick={v.acceptTos} disabled={!v.tosAcceptReady} style={{background:v.tosAcceptReady?"linear-gradient(180deg,#8fd97a,#3a9a2a)":"#3a2010",border:"2px solid #cfe4ff",color:v.tosAcceptReady?"#0e2a06":"#8a6a52",fontWeight:900,fontSize:"13px",padding:"11px 18px",borderRadius:"8px",cursor:v.tosAcceptReady?"pointer":"not-allowed",minWidth:"280px"}}>{v.tosMeterLabel}</button>
            ) : (
              <button onClick={v.closeTos} style={{background:"#ff5a14",border:"none",color:"#2a0e05",fontWeight:800,padding:"10px 18px",borderRadius:"6px",cursor:"pointer"}}>Close (reluctantly)</button>
            )}
          </div>
        </div>
      </div>
    );

    const identityPanel = (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:180,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <div style={{background:"#1c0d06",border:"2px solid #ffd54a",borderRadius:"8px",maxWidth:"480px",width:"100%",maxHeight:"84vh",overflowY:"auto",padding:"26px",fontSize:"13px",color:"#d8b79b",lineHeight:1.6,boxShadow:"0 0 60px rgba(255,213,74,0.25)"}}>
          <div style={{fontFamily:"'Bangers',cursive",fontSize:"24px",color:"#ff8a3d",marginBottom:"4px"}}>IDENTITY</div>
          <div style={{fontSize:"22px",fontFamily:"'Bangers',cursive",color:"#ffd54a",textShadow:"2px 2px 0 #7a1c00",margin:"10px 0 2px",overflowWrap:"anywhere"}}>{v.playerTag}</div>
          <div style={{fontSize:"10px",color:"#8a6a52",marginBottom:"16px"}}>(you) — assigned by the house. The house knows best.</div>

          <div style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"12px 14px",marginBottom:"16px"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:"14px",color:"#cf6a32",letterSpacing:"1px",marginBottom:"8px"}}>StatTrak™ Lifetime</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"4px 12px",fontSize:"12px"}}>
              <span style={{color:"#a9705a"}}>Banana Bucks lost</span><b style={{color:"#ffb347"}}>{fmtBB(v.statsBBLost)} BB</b>
              <span style={{color:"#a9705a"}}>Mom's money</span><b style={{color:"#ffb347"}}>${v.statsUSD.toFixed(2)} of Mom's money</b>
              <span style={{color:"#a9705a"}}>Crates opened</span><b style={{color:"#ffb347"}}>{v.statsCrates}</b>
              <span style={{color:"#a9705a"}}>Withdrawals pending</span><b style={{color:"#ffb347"}}>{v.statsWithdrawals} (see §1.3)</b>
              <span style={{color:"#a9705a"}}>Worst single loss</span><b style={{color:"#ffb347"}}>{fmtBB(v.statsWorst)} BB</b>
              <span style={{color:"#a9705a"}}>Losing streak</span><b style={{color:"#ffb347"}}>{v.statsStreak}</b>
            </div>
          </div>

          <div style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"12px 14px",marginBottom:"16px"}}>
            <div style={{fontSize:"12px",color:"#d8b79b",fontStyle:"italic",marginBottom:"10px"}}>{v.rerollFeeCopy}</div>
            <button onClick={v.doReroll} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"13px",padding:"10px 18px",borderRadius:"8px",cursor:"pointer",width:"100%"}}>{v.rerollLabel}</button>
          </div>

          <div style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"12px 14px",marginBottom:"16px"}}>
            <div style={{fontSize:"12px",color:"#d8b79b",fontStyle:"italic",marginBottom:"10px",lineHeight:1.5}}>Custom usernames are a premium feature. Standard usernames are free because you get what you pay for.</div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
              <input value={v.customInput} onChange={e=>v.setCustomInput(e.target.value)} placeholder="Choose a name (3–16 chars)" style={{flex:1,background:"#1c0d06",border:"2px solid #7a3a1a",borderRadius:"6px",color:"#ffd9b3",fontSize:"13px",padding:"9px 10px",minWidth:"0"}} />
              <span style={{fontSize:"12px",fontWeight:800,color:v.customAffordable?"#8fd97a":"#e24a4a",whiteSpace:"nowrap"}}>{v.customPrice} OC</span>
            </div>
            <button onClick={v.buyCustom} disabled={!v.customAffordable} style={{background:v.customAffordable?"linear-gradient(180deg,#8fd97a,#3a9a2a)":"#3a2010",border:"2px solid #cfe4ff",color:v.customAffordable?"#0e2a06":"#8a6a52",fontWeight:900,fontSize:"13px",padding:"10px 18px",borderRadius:"8px",cursor:v.customAffordable?"pointer":"not-allowed",width:"100%"}}>Buy custom name{v.customAffordable?"":" (insufficient OC)"}</button>
            <div style={{fontSize:"10px",color:"#8a6a52",marginTop:"8px",fontStyle:"italic"}}>The Compliance Filter applies at no extra charge, mood-based, non-refundable.</div>
            {v.customMsg && (
              <div style={{background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"8px 10px",marginTop:"10px",fontSize:"11.5px",color:"#ffcf9a",fontWeight:700}}>{v.customMsg}</div>
            )}
          </div>

          <button onClick={v.closeIdentity} style={{background:"#ff5a14",border:"none",color:"#2a0e05",fontWeight:800,padding:"10px 18px",borderRadius:"6px",cursor:"pointer",width:"100%"}}>Close (you)</button>
        </div>
      </div>
    );

    return (
      <div style={{fontFamily:"Arial,Helvetica,sans-serif",background:"radial-gradient(circle at 50% -10%,#3a1206,#160805 60%)",minHeight:"100vh",color:"#ffe9d6",position:"relative"}}>

        {(v.flowPhase==="gate"||v.flowPhase==="reveal"||v.flowPhase==="tos") && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
            {v.flowPhase==="gate" && gateCard}
            {v.flowPhase==="reveal" && revealCard}
          </div>
        )}

        {v.momModalOpen && momModal}
        {v.tosOpen && tosModal}
        {v.identityOpen && identityPanel}

        {v.confettiOn && (
          <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:500}}>
            {v.confettiPieces.map((p,i)=>(
              <div key={i} style={{position:"absolute",top:0,left:`${p.left}%`,width:"8px",height:"14px",background:p.color,animation:`confettiFall ${p.dur}s ease-in ${p.delay}s forwards`}}></div>
            ))}
          </div>
        )}

        <div style={{filter:v.mainBlurFilter,overflow:"hidden"}}>
          <div style={{background:"repeating-linear-gradient(45deg,#ff5a14,#ff5a14 10px,#c93e00 10px,#c93e00 20px)",color:"#1a0700",fontFamily:"'Bangers',cursive",fontSize:"15px",padding:"6px 0",overflow:"hidden",whiteSpace:"nowrap",letterSpacing:"1px",borderBottom:"3px solid #ffb347"}}>
            <div style={{display:"inline-block",animation:"marquee 14s linear infinite"}}>🔥 GUARANTEED WINS FOR REAL THIS TIME 🔥 100% PROVABLY FAIR (TRUST US) 🔥 DEPOSIT YOUR ALLOWANCE TODAY 🔥 GUARANTEED WINS FOR REAL THIS TIME 🔥 100% PROVABLY FAIR (TRUST US) 🔥 DEPOSIT YOUR ALLOWANCE TODAY 🔥</div>
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px",padding:"14px 24px",background:"linear-gradient(180deg,#3a1206,#2a0d05)",borderBottom:"2px solid #ff5a14",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:"30px",whiteSpace:"nowrap",color:"#ffb347",textShadow:"2px 2px 0 #7a1c00,0 0 18px rgba(255,90,20,0.6)"}}>HOT FOR E-SKINS</div>
              <div style={{display:"flex",alignItems:"center",gap:"5px",background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"5px",padding:"4px 9px"}}>
                <div className="fair-badge"></div>
                <span style={{fontSize:"10px",color:"#8fd97a",fontWeight:700,letterSpacing:"0.5px"}}>PROVABLY FAIR</span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px"}}>
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap",fontSize:"12px",alignItems:"stretch"}}>
                <div style={{background:"#0e0a06",border:"1px solid #ffb347",borderRadius:"6px",padding:"7px 12px"}}><span style={{color:"#8a6a52"}}>BB</span> <b style={{color:"#ffb347"}}>{v.bbDisplay}</b></div>
                <div style={{display:"flex",flexDirection:"column",background:"#0e0a06",border:"1px solid #ff8a3d",borderRadius:"6px",padding:"7px 12px",position:"relative",animation:v.ocHint?"ocPulse 1.6s infinite":"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span onClick={v.ocHint ? v.openConversion : undefined} title={v.ocHint||undefined} style={{whiteSpace:"nowrap",cursor:v.ocHint?"pointer":"default"}}><span style={{color:"#8a6a52"}}>OC</span> <b style={{color:"#ffe9d6"}}>{v.ocDisplay}</b></span>
                    <button onClick={v.topUp} style={{background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"1px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"11px",padding:"4px 10px",borderRadius:"6px",cursor:"pointer",animation:"topUpGlow 1.8s infinite",whiteSpace:"nowrap",position:"relative"}}>+ Top Up</button>
                    {v.cooldown && (
                      <span style={{fontSize:"8.5px",color:v.cooldown.abandoned?"#a9705a":"#8fd97a",whiteSpace:"nowrap",position:"absolute",top:"calc(100% + 2px)",right:0,fontStyle:"italic"}}>
                        {v.cooldown.abandoned ? "cooldown abandoned (per your feedback)" : "cooldown: "+v.cooldown.seconds+"s"}
                      </span>
                    )}
                  </div>
                  {v.bonusSub && <div style={{fontSize:"8px",color:"#e8a52a",marginTop:"2px"}}>{v.bonusSub}</div>}
                  {v.ocFly && (
                    <span key={v.ocFly.key} style={{position:"absolute",right:"6px",top:"-4px",fontSize:"12px",fontWeight:900,color:"#ffd54a",animation:"flyOC 1.2s ease-out forwards",pointerEvents:"none"}}>+{v.ocFly.n.toLocaleString("en-US")} OC</span>
                  )}
                </div>
                <div onClick={v.openInventory} title="Inventory & Portfolio — the destination, not a game" style={{background:"#0e0a06",border:"1px solid #8fd97a",borderRadius:"6px",padding:"7px 12px",cursor:"pointer",color:"#8fd97a",fontWeight:700,whiteSpace:"nowrap",fontSize:"11px"}}>
                  PORTFOLIO: {fmtUSD(v.portfolio.total)} (est. ▲)
                </div>
                {v.streakChip && (
                  <div style={{background:"#0e0a06",border:"1px solid #8fd97a",borderRadius:"6px",padding:"7px 10px",fontSize:"9.5px",color:"#8fd97a",whiteSpace:"nowrap"}}>Deposit streak: 1/2 — deposit tomorrow to keep it <span style={{color:"#5a7a4a"}}>(streaks are a fact we made up)</span></div>
                )}
                <div onMouseEnter={v.openDenoms} onMouseLeave={v.closeDenoms} style={{position:"relative",display:"flex",alignItems:"center",background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"7px 12px",cursor:"help",color:"#a9705a",whiteSpace:"nowrap"}}>
                  <span>ⓘ other denominations</span>
                  {v.denomsOpen && (
                    <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#1c0d06",border:"1px solid #7a3a1a",borderRadius:"6px",padding:"10px 12px",fontSize:"11px",color:"#d8b79b",lineHeight:1.7,whiteSpace:"nowrap",zIndex:60,boxShadow:"0 4px 16px rgba(0,0,0,0.6)"}}>
                      <div>V-Gems <b style={{color:"#ffe9d6"}}>{v.vgDisplay}</b></div>
                      <div>SkinCoinz <b style={{color:"#ffe9d6"}}>{v.scDisplay}</b></div>
                      <div>Cash Value (est.): <b style={{color:"#8fd97a"}}>$0.00</b></div>
                    </div>
                  )}
                </div>
                <div onClick={v.toggleBandMuted} title={v.muteTitle} style={{display:"flex",alignItems:"center",gap:"5px",background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"7px 10px",cursor:"pointer",whiteSpace:"nowrap"}}>
                  <span style={{fontSize:"13px",lineHeight:1}}>{v.bandMuted ? "🔇" : "🔊"}</span>
                  <span style={{fontSize:"8.5px",color:v.bandMuted?"#6a4a38":"#a9705a",lineHeight:1.25,fontStyle:"italic"}}>Mute<br/>(recommended by no one)</span>
                </div>
                {v.playerTag && (
                  <div onClick={v.openIdentity} title="Identity" style={{display:"flex",alignItems:"center",gap:"6px",background:"#0e0a06",border:"1px solid #ffd54a",borderRadius:"6px",padding:"7px 12px",cursor:"pointer",whiteSpace:"nowrap"}}>
                    <b style={{color:"#ffd54a",fontSize:"12px"}}>{v.playerTag}</b>
                    <span style={{color:"#8a6a52",fontSize:"10px"}}>(you)</span>
                  </div>
                )}
              </div>
              {v.moodLine && <div style={{fontSize:"11px",color:"#e8a52a",fontStyle:"italic",whiteSpace:"nowrap"}}>{v.moodLine}</div>}
            </div>
          </div>

          {v.showNag && (
            <div style={{background:"#3a2a10",borderBottom:"1px solid #ffd54a",color:"#ffd54a",textAlign:"center",fontSize:"13px",padding:"8px",fontWeight:700,fontStyle:"italic",display:"flex",gap:"12px",alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
              <span>{v.nagCopy}</span>
              <button onClick={v.nagTopUp} style={{background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"1px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"11px",padding:"4px 12px",borderRadius:"6px",cursor:"pointer",whiteSpace:"nowrap"}}>+ Top Up — Ask Mom</button>
            </div>
          )}

          {v.abandonedCount > 0 && (
            <div style={{background:"#2a1408",borderBottom:"1px solid #7a3a1a",color:"#a9705a",textAlign:"center",fontSize:"11.5px",padding:"6px",display:"flex",gap:"10px",alignItems:"center",justifyContent:"center"}}>
              <span>Deposit abandoned ({v.abandonedCount})</span>
              <button onClick={v.topUp} style={{background:"#3a2010",border:"1px solid #7a3a1a",color:"#ffcf9a",fontWeight:800,fontSize:"10px",padding:"2px 8px",borderRadius:"5px",cursor:"pointer"}}>+ Top Up</button>
            </div>
          )}

          {v.insufficientMsg && (
            <div style={{background:"#5a1a0a",color:"#ffcf9a",textAlign:"center",fontSize:"13px",padding:"8px",fontWeight:700,display:"flex",gap:"12px",alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
              <span>{v.insufficientMsg}</span>
              <button onClick={v.askMomFailedSpend} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"1px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"11px",padding:"4px 12px",borderRadius:"6px",cursor:"pointer",whiteSpace:"nowrap"}}>Ask Mom →</button>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"250px 1fr",gap:0,alignItems:"start"}}>
            {v.showTicker && (
              <TickerPanel activeTab={v.activeTab} />
            )}

            <div style={{padding:"22px 26px"}}>
              <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
                <button onClick={v.setTab_roulette} style={{padding:"10px 18px",borderRadius:"7px 7px 0 0",border:"2px solid #ff5a14",borderBottom:"none",background:v.tabBg.roulette,color:v.tabColor.roulette,fontFamily:"'Bangers',cursive",fontSize:"15px",letterSpacing:"0.5px",cursor:"pointer"}}>Allowance Roulette</button>
                <button onClick={v.setTab_coinflip} style={{padding:"10px 18px",borderRadius:"7px 7px 0 0",border:"2px solid #ff5a14",borderBottom:"none",background:v.tabBg.coinflip,color:v.tabColor.coinflip,fontFamily:"'Bangers',cursive",fontSize:"15px",letterSpacing:"0.5px",cursor:"pointer"}}>Skin Coinflip</button>
                <button onClick={v.setTab_crash} style={{padding:"10px 18px",borderRadius:"7px 7px 0 0",border:"2px solid #ff5a14",borderBottom:"none",background:v.tabBg.crash,color:v.tabColor.crash,fontFamily:"'Bangers',cursive",fontSize:"15px",letterSpacing:"0.5px",cursor:"pointer"}}>College Fund Crash</button>
                <button onClick={v.setTab_crates} style={{padding:"10px 18px",borderRadius:"7px 7px 0 0",border:"2px solid #ff5a14",borderBottom:"none",background:v.tabBg.crates,color:v.tabColor.crates,fontFamily:"'Bangers',cursive",fontSize:"15px",letterSpacing:"0.5px",cursor:"pointer"}}>Loot Crate Defuser</button>
              </div>

              <div style={{border:"2px solid #ff5a14",borderRadius:"0 8px 8px 8px",background:"linear-gradient(160deg,#241005,#160a04)",padding:"26px",minHeight:"340px"}}>

                {v.isRoulette && (
                  <div>
                    <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"6px"}}>Allowance Roulette <span style={{fontSize:"11px",color:"#ffcf9a",fontFamily:"inherit"}}>PROVABLY FAIR™</span></div>
                    <div style={{background:"#3a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"6px 10px",marginBottom:"10px",fontSize:"11px",color:"#ffcf9a",fontWeight:700}}>
                      🔥 {v.rouletteBannerNames[0]} won big* — Last 7 spinners won big*
                      <div style={{fontSize:"8px",opacity:0.4,fontWeight:400,marginTop:"2px"}}>* "won big" measured in estimated value, not withdrawable value. Withdrawable value of all winnings is $0.00 (see ToS §1.3).</div>
                    </div>
                    <div style={{position:"relative",overflow:"hidden",border:"2px solid #7a3a1a",borderRadius:"8px",background:"#0e0a06",height:"120px"}}>
                      <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:"3px",background:"#ffe9d6",zIndex:5,boxShadow:"0 0 10px #ffe9d6"}}></div>
                      <div style={{display:"flex",gap:"8px",padding:"10px 0",transform:`translateX(${v.rouletteOffset}px)`,transition:v.rouletteTransition}}>
                        {v.rouletteStrip.map((s,i)=>(
                          <div key={i} style={{minWidth:"96px",height:"96px",borderRadius:"6px",border:`2px solid ${s.color}`,background:"linear-gradient(160deg,#2a1408,#160a04)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px",textAlign:"center"}}>
                            <div style={{width:"100%",height:"38px",background:`repeating-linear-gradient(45deg,${s.color}22,${s.color}22 4px,transparent 4px,transparent 8px)`,borderRadius:"3px",marginBottom:"5px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <img src={s.image} alt={s.short} style={{height:"100%",width:"100%",objectFit:"contain"}} />
                            </div>
                            <div style={{fontSize:"9px",color:"#e8c9ac",lineHeight:1.2}}>{s.short}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{fontSize:"8px",color:"#7a5a4a",marginTop:"4px"}}>reel recalibrating for accuracy · Near-misses are cosmetic. The reel is a reenactment (ToS §4.2).</div>
                    <div style={{fontSize:"11px",color:"#a9705a",margin:"8px 0"}}>Spins left: {v.rouletteSpinsLeft}{v.rouletteSpinsLeft<=3 ? " (other kids are already spinning)" : " (make them count)"}</div>

                    {v.rouletteResult && (
                      <div style={{marginTop:"6px",background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"10px 14px",color:"#ffcf9a",fontWeight:700,fontSize:"13px"}}>{v.rouletteResult}</div>
                    )}
                    {v.rouletteConsolationMsg && (
                      <div style={{marginTop:"8px",background:"#1a3a0a",border:"1px solid #8fd97a",borderRadius:"6px",padding:"8px 12px",color:"#c9f2b0",fontWeight:700,fontSize:"12px"}}>{v.rouletteConsolationMsg}</div>
                    )}
                    {v.rouletteJackpotBox && (
                      <div style={{marginTop:"10px",background:"#3a2a05",border:"2px solid #ffd54a",borderRadius:"8px",padding:"12px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Bangers',cursive",color:"#ffd54a",fontSize:"16px",marginBottom:"8px"}}>JACKPOT! {v.rouletteJackpotBox.item.name} (est. {v.rouletteJackpotBox.item.value}) is yours!</div>
                        {!v.rouletteJackpotBox.cashoutClicked ? (
                          <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
                            <button onClick={v.rouletteCashOut} style={{background:"#3a2010",border:"1px dashed #ff5a14",color:"#ffcf9a",fontWeight:700,fontSize:"12px",padding:"9px 16px",borderRadius:"7px",cursor:"pointer"}}>Cash Out</button>
                            <button onClick={v.rouletteKeepSpinning} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"12px",padding:"9px 16px",borderRadius:"7px",cursor:"pointer",animation:"topUpGlow 1.6s infinite"}}>Keep Spinning (recommended)</button>
                          </div>
                        ) : (
                          <div style={{fontSize:"11px",color:"#e8c9ac"}}>Withdrawal request received. Status: Pending (ToS §1.3). Estimated processing: eventually.</div>
                        )}
                      </div>
                    )}
                    {v.replayRoulette && (
                      <button onClick={v.topUpAndPlayRoulette} style={{marginTop:"10px",background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"2px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"13px",padding:"10px 18px",borderRadius:"8px",cursor:"pointer",animation:"topUpGlow 1.6s infinite"}}>Top Up &amp; Play Again</button>
                    )}
                    {v.showChaseIt && (
                      <button onClick={v.chaseIt} disabled={v.rouletteSpinning} style={{marginTop:"10px",marginRight:"10px",background:"linear-gradient(180deg,#e24a4a,#a82a2a)",border:"2px solid #ffcfcf",color:"#2a0e05",fontWeight:900,fontSize:"12px",padding:"10px 16px",borderRadius:"8px",cursor:"pointer"}}>Chase It™ — {v.chaseItPrice} BB</button>
                    )}
                    <div style={{display:"flex",alignItems:"center",gap:"14px",marginTop:"10px",flexWrap:"wrap"}}>
                      <label style={{fontSize:"10px",color:"#e8c9ac",display:"flex",alignItems:"center",gap:"5px",cursor:"pointer"}}>
                        <input type="checkbox" checked={v.rouletteInsured} onChange={v.toggleRouletteInsured} /> Lucky Spin Insurance (+1 BB) — covers emotional outcomes
                      </label>
                      <label style={{fontSize:"10px",color: v.rouletteTurboUnlocked ? "#e8c9ac" : "#5a4a3a",display:"flex",alignItems:"center",gap:"5px",cursor: v.rouletteTurboUnlocked ? "pointer" : "not-allowed"}}>
                        <input type="checkbox" checked={v.rouletteTurbo} disabled={!v.rouletteTurboUnlocked} onChange={v.toggleRouletteTurbo} /> {v.rouletteTurboUnlocked ? "Turbo Spin™ (+2 BB, 2.5s)" : "Turbo Spin (premium) — Ask Mom to unlock"}
                      </label>
                    </div>
                    <button onClick={v.playRoulette} disabled={v.rouletteSpinning} style={{marginTop:"16px",background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer"}}>{v.rouletteSpinning ? "Spinning..." : ("SPIN — "+v.rouletteSpinPrice+" BB")}</button>
                    <div style={{fontSize:"9px",color:"#7a5a4a",marginTop:"4px"}}>(that's ${(v.rouletteSpinPrice*0.3125).toFixed(2)} in old money)</div>

                    {v.rouletteReceipt && (
                      <div style={{marginTop:"14px"}}>
                        <button onClick={v.toggleRouletteReceipt} style={{background:"none",border:"none",color:"#ffb347",fontSize:"11px",cursor:"pointer",textDecoration:"underline",padding:0}}>{v.rouletteReceiptOpen ? "hide receipt" : "receipt"}</button>
                        {v.rouletteReceiptOpen && (
                          <pre style={{fontSize:"10px",color:"#e8c9ac",background:"#0e0a06",border:"1px solid #3a1a0a",borderRadius:"6px",padding:"10px",marginTop:"6px",whiteSpace:"pre-wrap"}}>
{"ALLOWANCE ROULETTE — SPIN RECEIPT\n"}
{v.rouletteReceipt.lines.map(l=>l.label+" .... "+l.amount.toFixed(1)+" BB\n").join("")}
{"TOTAL .... "+v.rouletteReceipt.total.toFixed(1)+" BB\n"}
{v.rouletteVaultLine+"\n"}
{"Thank you for playing. Mom says hi."}
                          </pre>
                        )}
                      </div>
                    )}
                    {v.rouletteFairness && (
                      <div style={{marginTop:"6px"}}>
                        {!v.rouletteFairnessOpen ? (
                          <button onClick={v.openRouletteFairness} style={{background:"none",border:"none",color:"#ffb347",fontSize:"11px",cursor:"pointer",textDecoration:"underline",padding:0}}>verify fairness</button>
                        ) : (
                          <div style={{fontSize:"10px",color:"#e8c9ac",background:"#0e0a06",border:"1px solid #3a1a0a",borderRadius:"6px",padding:"10px",marginTop:"6px"}}>
                            <div>commitment: {v.rouletteFairness.commitment}</div>
                            <div>preimage: {v.rouletteFairness.preimage}</div>
                            <div style={{color:"#8fd97a",fontWeight:900,marginTop:"4px"}}>VERIFIED ✓ OUTCOME MATCHED COMMITMENT</div>
                            <div style={{marginTop:"4px"}}>{v.rouletteFairness.anyway ? "The house wins even when you win." : "Your commitment was HOUSE_WINS. This was knowable. (ToS §1.3)"}</div>
                            <button onClick={v.closeRouletteFairness} style={{marginTop:"6px",background:"none",border:"none",color:"#a9705a",fontSize:"10px",cursor:"pointer"}}>close</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {v.isCoinflip && (
                  <div>
                    <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"6px"}}>Skin Coinflip <span style={{fontSize:"11px",color:"#ffcf9a",fontFamily:"inherit"}}>PROVABLY FAIR™</span></div>
                    <div style={{fontSize:"11px",color:"#a9705a",marginBottom:"8px"}}>Bot stakes: {v.coinStashItem ? v.coinStashItem.name+" (est. "+v.coinStashItem.value+")" : "..."}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"40px",padding:"20px 0"}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:"12px",color:v.youColor,fontWeight:800,marginBottom:"6px",maxWidth:"120px",overflowWrap:"anywhere"}}>{v.playerTag || "You"} — {GAME_PRICES_BB.coinflip} BB</div>
                        <div style={{width:"64px",height:"64px",margin:"0 auto",borderRadius:"50%",background:"linear-gradient(160deg,#4a90e2,#2a5fa8)",border:"3px solid #cfe4ff"}}></div>
                      </div>
                      <div style={{perspective:"400px"}}>
                        <div style={{width:"70px",height:"70px",borderRadius:"50%",background:"linear-gradient(160deg,#ffd54a,#c9960a)",border:"3px solid #fff2c9",transformStyle:"preserve-3d",animation:v.coinAnim}}></div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:"12px",color:"#a9705a",marginBottom:"6px"}}>Admin_TradeBot_69 [BOT]</div>
                        <div style={{width:"64px",height:"64px",margin:"0 auto",borderRadius:"50%",background:"linear-gradient(160deg,#e24a4a,#a82a2a)",border:"3px solid #ffcfcf"}}></div>
                      </div>
                    </div>
                    <div style={{fontSize:"10px",color:"#7a5a4a",textAlign:"center",marginBottom:"8px"}}>Calls: MOM {v.coinCallCounts.MOM||0} · §8.9 {v.coinCallCounts["§8.9"]||0}. The coin respects neither.</div>
                    {v.coinResult && (
                      <div style={{margin:"6px 0 12px",background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"10px 14px",color:"#ffcf9a",fontWeight:700,fontSize:"13px",textAlign:"center"}}>{v.coinResult}</div>
                    )}
                    {v.coinDoN && (
                      <div style={{marginBottom:"12px",background:"#3a2a05",border:"2px solid #ffd54a",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
                        <div style={{fontSize:"11px",color:"#e8c9ac",marginBottom:"8px"}}>Double or Nothing. Choose a side. (Both sides are his.)</div>
                        <button onClick={v.coinDoubleOrNothingAccept} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"12px",padding:"9px 16px",borderRadius:"7px",cursor:"pointer",marginRight:"8px",animation:"topUpGlow 1.6s infinite"}}>DOUBLE OR NOTHING</button>
                        <button onClick={v.coinDoubleOrNothingDecline} style={{background:"#3a2010",border:"1px dashed #7a5a2a",color:"#a9705a",fontWeight:700,fontSize:"11px",padding:"9px 16px",borderRadius:"7px",cursor:"pointer"}}>Decline</button>
                      </div>
                    )}
                    {v.replayCoinflip && (
                      <button onClick={v.topUpAndPlayCoinflip} style={{background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"2px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"13px",padding:"10px 18px",borderRadius:"8px",cursor:"pointer",animation:"topUpGlow 1.6s infinite"}}>Top Up &amp; Play Again</button>
                    )}
                    {v.showRematch && !v.coinDoN && (
                      <div style={{textAlign:"center",marginBottom:"8px"}}>
                        <button onClick={v.coinflipRematch} disabled={v.coinFlipping} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"12px",padding:"9px 16px",borderRadius:"7px",cursor:"pointer",animation:"topUpGlow 1.6s infinite"}}>REMATCH — {Coinflip.REMATCH_PRICE_BB} BB</button>
                        <div style={{fontSize:"9px",color:"#7a5a4a",marginTop:"3px"}}>he accepts. he always accepts.</div>
                      </div>
                    )}
                    <div style={{textAlign:"center",display:"flex",gap:"10px",justifyContent:"center"}}>
                      <button onClick={v.playCoinflipMom} disabled={v.coinFlipping} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"13px",padding:"11px 18px",borderRadius:"8px",cursor:"pointer"}}>{v.coinFlipping ? "Flipping..." : "CALL: MOM"}</button>
                      <button onClick={v.playCoinflipS89} disabled={v.coinFlipping} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"13px",padding:"11px 18px",borderRadius:"8px",cursor:"pointer"}}>{v.coinFlipping ? "Flipping..." : "CALL: §8.9"}</button>
                    </div>
                    <div style={{fontSize:"9px",color:"#7a5a4a",textAlign:"center",marginTop:"4px"}}>FLIP — {Coinflip.FLIP_PRICE_BB} BB (that's $1.00 in old money)</div>

                    {v.coinReceipt && (
                      <div style={{marginTop:"14px"}}>
                        <button onClick={v.toggleCoinReceipt} style={{background:"none",border:"none",color:"#ffb347",fontSize:"11px",cursor:"pointer",textDecoration:"underline",padding:0}}>{v.coinReceiptOpen ? "hide receipt" : "receipt"}</button>
                        {v.coinReceiptOpen && (
                          <pre style={{fontSize:"10px",color:"#e8c9ac",background:"#0e0a06",border:"1px solid #3a1a0a",borderRadius:"6px",padding:"10px",marginTop:"6px",whiteSpace:"pre-wrap"}}>
{"SKIN COINFLIP — FLIP RECEIPT\n"}
{v.coinReceipt.lines.map(l=>l.label+" .... "+l.amount.toFixed(1)+" BB\n").join("")}
{"TOTAL .... "+v.coinReceipt.total.toFixed(1)+" BB\n"}
{Vault.receiptLine()+"\n"}
{"Thank you for flipping. Mom says hi."}
                          </pre>
                        )}
                      </div>
                    )}
                    {v.coinFairness && (
                      <div style={{marginTop:"6px"}}>
                        {!v.coinFairnessOpen ? (
                          <button onClick={v.openCoinFairness} style={{background:"none",border:"none",color:"#ffb347",fontSize:"11px",cursor:"pointer",textDecoration:"underline",padding:0}}>verify fairness</button>
                        ) : (
                          <div style={{fontSize:"10px",color:"#e8c9ac",background:"#0e0a06",border:"1px solid #3a1a0a",borderRadius:"6px",padding:"10px",marginTop:"6px"}}>
                            <div>commitment: {v.coinFairness.commitment}</div>
                            <div>preimage: {v.coinFairness.preimage}</div>
                            <div style={{color:"#8fd97a",fontWeight:900,marginTop:"4px"}}>VERIFIED ✓ THE EDGE WAS FORESEEN</div>
                            <div style={{marginTop:"4px"}}>{v.coinFairness.anyway ? "The house wins even when you win." : "the commitment was TIE_GOES_TO_HOST even on non-edge outcomes. The house commits broadly. (§5.1)"}</div>
                            <button onClick={v.closeCoinFairness} style={{marginTop:"6px",background:"none",border:"none",color:"#a9705a",fontSize:"10px",cursor:"pointer"}}>close</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {v.isCrash && (
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:"8px",marginBottom:"6px"}}>
                      <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347"}}>College Fund Crash</div>
                      {v.crashRunLabel && <div style={{fontSize:"11px",color:"#e8a52a",fontStyle:"italic"}}>{v.crashRunLabel}</div>}
                    </div>
                    {v.crashScheduling && (
                      <div style={{marginBottom:"10px",background:"#1c0d06",border:"1px solid #7a3a1a",borderRadius:"6px",padding:"9px 11px",fontSize:"12px",color:"#e8a52a",fontStyle:"italic"}}>SCHEDULING… Crash scheduled. Provably fair. (Schedule not disclosed, ToS §5.5.){v.crashCommitment ? <span style={{display:"block",marginTop:"3px",fontSize:"9.5px",color:"#8a6a52"}}>commitment: {v.crashCommitment} — preimage: the schedule (§5.5(b))</span> : null}</div>
                    )}
                    <div style={{position:"relative",height:"160px",border:v.crashStickActive?"2px solid #ffd54a":"2px solid #7a3a1a",borderRadius:"8px",background:"#0e0a06",overflow:"hidden"}}>
                      <div style={{position:"absolute",left:"20px",bottom:"16px",right:"20px",top:"16px"}}>
                        <div style={{position:"absolute",left:0,bottom:0,width:"4px",background:"linear-gradient(#8fd97a,#4aa832)",height:`${v.crashBarHeight}%`,borderRadius:"2px 2px 0 0",transition:"height 0.15s linear"}}></div>
                      </div>
                      <div style={{position:"absolute",right:"16px",top:"14px",fontFamily:"'Bangers',cursive",fontSize:"28px",color:v.crashColor,animation: v.crashStickActive ? "pulseGlow 0.3s infinite" : "none"}}>{v.crashMultDisplay}</div>
                      {v.crashStickActive && (
                        <div style={{position:"absolute",left:"16px",top:"14px",fontSize:"11px",color:"#ffd54a",fontWeight:800}}>chat: CASH OUT CASH OUT CASH OUT</div>
                      )}
                    </div>
                    {v.crashComeInThrees && v.crashPhase!=="climbing" && (
                      <div style={{marginTop:"8px",fontSize:"10.5px",color:"#a9705a",fontStyle:"italic"}}>Crashes come in threes. This is a fact we made up.</div>
                    )}
                    {v.crashResult && (
                      <div style={{marginTop:"12px",background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"10px 14px",color:"#ffcf9a",fontWeight:700,fontSize:"13px"}}>{v.crashResult}</div>
                    )}
                    {v.replayCrash ? (
                      <button onClick={v.topUpAndPlayCrash} style={{marginTop:"10px",background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"2px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"13px",padding:"10px 18px",borderRadius:"8px",cursor:"pointer",animation:"topUpGlow 1.6s infinite"}}>Top Up &amp; Play Again</button>
                    ) : null}
                    <div style={{display:"flex",gap:"10px",marginTop:"16px",flexWrap:"wrap"}}>
                      <button onClick={v.startCrash} disabled={v.crashRunning || !v.crashCanRun} style={{background: v.crashCanRun ? "linear-gradient(180deg,#ff8a3d,#e0480a)" : "#3a2010",border:"2px solid #ffcf9a",color: v.crashCanRun ? "#2a0e05" : "#8a6a52",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor: v.crashCanRun ? "pointer":"not-allowed"}}>{v.crashCanRun ? v.crashStartLabel : v.crashNeedBBLabel}</button>
                      <button
                        onMouseEnter={v.crashDodgeAttempt}
                        onClick={v.crashCashoutClick}
                        disabled={v.crashPhase!=="climbing" || v.crashProcessing}
                        style={{
                          background: (v.crashExhausted || v.cashoutStick) ? "linear-gradient(180deg,#8fd97a,#3a9a2a)" : "#3a2010",
                          border: (v.crashExhausted || v.cashoutStick) ? "2px solid #cfe4ff" : "2px dashed #ff5a14",
                          color:v.cashoutColor,fontWeight:900,fontSize:"13px",padding:"12px 18px",borderRadius:"8px",
                          cursor: v.crashPhase==="climbing" ? "pointer" : "default",
                          transform:`translate(${v.cashoutDodgeX}px, ${v.cashoutDodgeY}px) scale(${v.cashoutScaleNow})`,
                          transition:"transform 0.12s ease-out",
                        }}
                      >{v.crashButtonLabel}</button>
                      <button onClick={v.expressCashoutClick} disabled style={{background:"#2a1408",border:"1px dashed #5a4232",color:"#8a6a52",fontWeight:700,fontSize:"11px",padding:"12px 14px",borderRadius:"8px",cursor:"pointer"}}>{v.expressCashoutLabel}</button>
                    </div>
                  </div>
                )}

                {v.isCrates && (
                  <div>
                    <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"6px"}}>Loot Crate Defuser</div>
                    <div style={{fontSize:"10.5px",color:"#a9705a",marginBottom:"4px"}}>{v.cratePityLabel} · Inventory: {v.crateInventoryCount} JPEGs (Non-Tradeable) · Odds: yes. <span style={{fontSize:"8px"}}>(Full table available on request. Requests are mood-dependent.)</span></div>
                    <div style={{fontSize:"8.5px",color:"#6a4a38",marginBottom:"12px"}}>{v.cratePityFinePrint}</div>

                    {v.crateEnvelope && v.crateEnvelope.kind==="consolation" && (
                      <div style={{marginBottom:"12px",background:"#241005",border:"1px dashed #ffd54a",borderRadius:"6px",padding:"9px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px",flexWrap:"wrap",animation:"envDrop 0.7s ease-out"}}>
                        <span style={{fontSize:"11.5px",color:"#ffd54a"}}>Consolation Key™ — wax seal: MOM. You lost. Have a key. Crates always feel like winning.®</span>
                        <button onClick={v.dismissCrateEnvelope} style={{background:"linear-gradient(180deg,#ffd54a,#c9960a)",border:"2px solid #fff2c9",color:"#2a0e05",fontWeight:900,fontSize:"11.5px",padding:"6px 12px",borderRadius:"6px",cursor:"pointer"}}>Take It (you will)</button>
                      </div>
                    )}

                    {v.crateMomKeyClaimableToday && (
                      <div style={{marginBottom:"12px",background:"#241005",border:"1px dashed #ffd54a",borderRadius:"6px",padding:"9px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px",flexWrap:"wrap",animation:"envDrop 0.7s ease-out"}}>
                        <span style={{fontSize:"11.5px",color:"#ffd54a"}}>{v.momKeyBoxLabel} dropped from the top of the screen. Return address: MOM (she doesn't know). Days Mom Checked In: {v.crateMomKeyStreak}.</span>
                        <button onClick={v.claimDailyMomKey} style={{background:"linear-gradient(180deg,#ffd54a,#c9960a)",border:"2px solid #fff2c9",color:"#2a0e05",fontWeight:900,fontSize:"11.5px",padding:"6px 12px",borderRadius:"6px",cursor:"pointer"}}>Claim Daily Mom Key</button>
                      </div>
                    )}

                    <div style={{display:"flex",gap:"24px",alignItems:"center",flexWrap:"wrap"}}>
                      <div key={v.momKeyBoxLabel} style={{width:"120px",height:"100px",background:"repeating-linear-gradient(90deg,#4a3a1a,#4a3a1a 10px,#3a2a10 10px,#3a2a10 20px)",border:v.crateMomKeyStreak>=3?"3px solid #ffd54a":"3px solid #7a5a2a",borderRadius:"6px",position:"relative",animation:v.crateAnim,boxShadow:v.crateMomKeyStreak>=3?"0 0 18px rgba(255,213,74,0.45)":"none"}}>
                        <div style={{position:"absolute",inset:"30% 0",height:"14px",background:v.crateMomKeyStreak>=3?"#ffd54a":"#7a5a2a"}}></div>
                      </div>
                      <div style={{flex:1,minWidth:"220px"}}>
                        {!v.crateKeyBought && !v.crateOpening && (
                          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                            {v.crateFreeKeyCount>0 && (
                              <button onClick={v.useFreeKey} style={{background:"linear-gradient(180deg,#ffd54a,#c9960a)",border:"2px solid #fff2c9",color:"#2a0e05",fontWeight:900,fontSize:"13px",padding:"12px 18px",borderRadius:"8px",cursor:"pointer"}}>Use Free Key ({v.crateFreeKeyCount})</button>
                            )}
                            <button onClick={v.crateBtnAction} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer"}}>{v.crateBtnLabel}</button>
                          </div>
                        )}
                        {v.crateKeyBought && !v.crateOpening && (
                          <button onClick={v.openCrate} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer"}}>{v.crateOpenLabel}</button>
                        )}
                        {v.crateOpening && v.crateRevealPhase!=="reel" && v.crateRevealPhase!=="award" && (
                          <>
                            <div style={{fontSize:"12px",color:"#ffb347",fontWeight:700,marginBottom:"4px"}}>{v.crateCaption}</div>
                            <div style={{background:"#0e0a06",borderRadius:"5px",height:"8px",overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${v.crateProgress}%`,background:"linear-gradient(90deg,#ff8a3d,#ffd54a)",transition:"width 0.1s linear"}}></div>
                            </div>
                            <div style={{fontSize:"9.5px",color:"#8a6a52",marginTop:"6px"}}>{v.trackNameCaption}</div>
                            {v.crateSkipAvailable && !v.crateSkipUsed && (
                              <div style={{marginTop:"8px"}}>
                                <button onClick={v.skipCrate} style={{background:"#3a2010",border:"1px dashed #ff8a3d",color:"#ffcf9a",fontWeight:800,fontSize:"11px",padding:"6px 12px",borderRadius:"6px",cursor:"pointer"}}>{v.crateSkipLabel}</button>
                                <div style={{fontSize:"6.5px",color:"#6a4a38",marginTop:"3px"}}>{v.crateSkipFinePrint}</div>
                              </div>
                            )}
                          </>
                        )}
                        {v.crateRevealPhase==="reel" && v.crateReel && (
                          <div>
                            <div style={{fontSize:"11px",color: v.crateReel.recalibrated ? "#ff8a3d" : "#a9705a",fontWeight:700,marginBottom:"6px"}}>{v.crateReel.recalibrated ? "RECALIBRATING" : "…"}</div>
                            <div style={{position:"relative",overflow:"hidden",border:"2px solid #7a3a1a",borderRadius:"8px",background:"#0e0a06",height:"70px",display:"flex",alignItems:"center"}}>
                              <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:"2px",background:"#ffe9d6",zIndex:5}}></div>
                              <div style={{display:"flex",gap:"6px",transform:`translateX(calc(50% - ${v.crateReel.landingIndex*66+33}px))`,transition:"transform 2.6s cubic-bezier(0.1,0.7,0.2,1)"}}>
                                {v.crateReel.strip.map((it,i)=>(
                                  <div key={i} style={{minWidth:"60px",height:"60px",borderRadius:"5px",border:`2px solid ${it.reelOnly ? "#ff4444" : "#7a5a2a"}`,background:"linear-gradient(160deg,#2a1408,#160a04)",display:"flex",alignItems:"center",justifyContent:"center",padding:"3px",textAlign:"center",fontSize:"7px",color:it.reelOnly?"#ff4444":"#e8c9ac"}}>{it.reelOnly ? "LEGENDARY" : it.tier.split(" ")[0]}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {v.crateRevealPhase==="award" && v.crateAward && (
                          <div>
                            <div style={{fontSize:"10.5px",color:"#a9705a",fontStyle:"italic",marginBottom:"6px"}}>SO CLOSE! You were 1 slot from {v.fruitRollUp.name} (${v.fruitRollUp.value.toFixed(2)}). <span style={{fontSize:"7px"}}>(distance does not affect outcome; this reel is a movie; odds: yes)</span></div>
                            <div key={v.crateAward.id} style={{border:`2px solid ${RARITY_COLORS[v.crateAward.tier]||"#ff8a3d"}`,borderRadius:"8px",padding:"12px",background:"linear-gradient(160deg,#241005,#160a04)",animation:"tierFlare 0.9s ease-out"}}>
                              <div style={{fontFamily:"'Bangers',cursive",fontSize:"13px",color:RARITY_COLORS[v.crateAward.tier]||"#ff8a3d",letterSpacing:"1px"}}>{v.crateAward.tier.toUpperCase()}</div>
                              <div style={{fontSize:"13px",fontWeight:800,color:"#ffe9d6",margin:"6px 0"}}>{v.crateAward.name}</div>
                              <div style={{fontSize:"9.5px",color:"#e8a52a"}}>StatTrak™ Downloads: 4,000,000</div>
                              <div style={{fontSize:"11px",color:"#8fd97a",fontWeight:800,marginTop:"6px"}}>Estimated Value: ${v.crateAward.value.toFixed(2)} · Cash Value (est.): $0.00</div>
                            </div>
                            <button onClick={v.toggleInspectCrate} style={{marginTop:"8px",background:"#3a2010",border:"1px dashed #ff8a3d",color:"#ffcf9a",fontWeight:800,fontSize:"11px",padding:"6px 12px",borderRadius:"6px",cursor:"pointer"}}>Inspect JPEG</button>
                          </div>
                        )}
                        {v.crateResult && v.crateRevealPhase!=="reel" && (
                          <div style={{marginTop:"12px",background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"10px 14px",color:"#ffcf9a",fontWeight:700,fontSize:"13px"}}>{v.crateResult}</div>
                        )}
                        {v.replayCrates && (
                          <button onClick={v.topUpAndPlayCrates} style={{marginTop:"8px",background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"2px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"13px",padding:"10px 18px",borderRadius:"8px",cursor:"pointer",animation:"topUpGlow 1.6s infinite"}}>Top Up &amp; Play Again</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <div style={{marginTop:"30px"}}>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"4px"}}>Marketplace</div>
                <div style={{fontSize:"9.5px",color:"#8a6a52",fontStyle:"italic",marginBottom:"14px"}}>Estimates in parody USD (theater). Transacted in BB only. {MARKET_OC_NOTICE}</div>

                {v.trending.length > 0 && (
                  <div style={{marginBottom:"16px"}}>
                    <div style={{fontFamily:"'Bangers',cursive",fontSize:"14px",color:"#ff8a3d",marginBottom:"8px",letterSpacing:"1px"}}>TRENDING NOW 🔥</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:"10px"}}>
                      {v.trending.map(t=>(
                        <div key={t.id} onMouseEnter={()=>v.marketHoverTrend(t.id)} style={{position:"relative",border:"2px solid #ff5a14",borderRadius:"8px",background:"linear-gradient(160deg,#2a1408,#160a04)",padding:"10px",overflow:"hidden"}}>
                          <div style={{fontSize:"11px",fontWeight:800,color:"#ffe9d6",lineHeight:1.3}}>🔥 {t.name}</div>
                          <div style={{fontSize:"11px",color:"#8fd97a",fontWeight:800,marginTop:"4px"}}>{fmtUSD(t.est)}</div>
                          <div style={{fontSize:"10.5px",color:"#ffb347",fontWeight:800}}>You Pay: {t.total} BB</div>
                          {v.marketFlicker===t.id && (
                            <div style={{position:"absolute",inset:0,background:"rgba(20,4,2,0.88)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",color:"#ff4444",fontWeight:900,borderRadius:"6px",animation:"soldFlicker 0.95s ease-out",pointerEvents:"none"}}>Sold ×3 (Ohio)</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:"8px",color:"#6a4a38",marginTop:"4px"}}>the instant a featured item becomes affordable it rotates out (someone faster)</div>
                  </div>
                )}

                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px"}}>
                  {v.catalogLive.map(item=>(
                    <div key={item.id} style={{border:`2px solid ${item.rarityColor}`,borderRadius:"8px",background:"linear-gradient(160deg,#241005,#160a04)",padding:"12px",display:"flex",flexDirection:"column",gap:"6px"}}>
                      <div style={{width:"100%",height:"70px",borderRadius:"5px",background:`repeating-linear-gradient(45deg,${item.rarityColor}22,${item.rarityColor}22 6px,transparent 6px,transparent 12px)`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                        <img src={SKIN_IMAGES[item.id]} alt={item.name} style={{height:"100%",width:"100%",objectFit:"contain"}} />
                      </div>
                      <div style={{fontSize:"11px",fontWeight:800,color:"#ffe9d6",lineHeight:1.3}}>{item.name}</div>
                      <div style={{fontSize:"9.5px",color:item.rarityColor,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>{item.rarity}</div>
                      {item.statTrak && (
                        <div style={{fontSize:"9.5px",color:"#e8a52a"}}>StatTrak™ {item.statMetric}</div>
                      )}
                      <div style={{fontSize:"9px",color:"#8a6a52",fontStyle:"italic"}}>{item.flavorText}</div>
                      <div style={{display:"flex",alignItems:"baseline",gap:"7px",marginTop:"2px"}}>
                        <span style={{fontSize:"13px",color:"#8fd97a",fontWeight:800}}>{fmtUSD(item.est)}</span>
                        {Math.abs(item.est-item.baseline) > 0.005 && (
                          <span style={{fontSize:"9px",color:"#6a4a38",textDecoration:"line-through"}}>{item.estimatedValue}</span>
                        )}
                      </div>
                      <div style={{fontSize:"11px",color:"#ffb347",fontWeight:800}}>You Pay: {item.quote.total} BB</div>
                      <button onClick={()=>v.marketOpenCheckout(item.id)} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"12px",padding:"9px 12px",borderRadius:"7px",cursor:"pointer"}}>Buy — {item.quote.total} BB</button>
                      <div style={{fontSize:"8px",color:"#6a4a38"}}>{ESTIMATE_FOOTER}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{borderTop:"2px solid #3a1206",background:"#120802",padding:"20px 26px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px"}}>
            {v.showChat && (
              <ChatPanel panicActive={v.panicActive} hooks={v.chatHooks} />
            )}
            <div>
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"10px"}}>
                <div style={{border:"1px solid #4a6a3a",borderRadius:"4px",padding:"5px 9px",fontSize:"9px",color:"#8fd97a",background:"#0e0a06"}}>SSL SECURED*</div>
                <div style={{border:"1px solid #4a6a3a",borderRadius:"4px",padding:"5px 9px",fontSize:"9px",color:"#8fd97a",background:"#0e0a06"}}>AGE VERIFIED*</div>
                <div style={{border:"1px solid #4a6a3a",borderRadius:"4px",padding:"5px 9px",fontSize:"9px",color:"#8fd97a",background:"#0e0a06"}}>CERTIFIED FAIR*</div>
              </div>
              <button onClick={v.openTos} style={{background:"none",border:"none",color:"#a9705a",fontSize:"11px",textDecoration:"underline",cursor:"pointer",padding:0,display:"block",marginBottom:"8px"}}>{v.tosFooterLabel}</button>
              <div style={{fontSize:"9.5px",color:"#6a4a38",lineHeight:1.6}}>*This is a satirical, non-functional parody. No wagering, currency, or item ever holds real value. Nothing here is licensed, provably anything, or fair. Please close this tab and go outside.</div>
              <div style={{fontSize:"6.5px",color:"#5a4232",lineHeight:1.6,marginTop:"6px"}}>{BAND_FOOTER_CREDIT}</div>
              <div style={{fontSize:"6.5px",color:"#5a4232",lineHeight:1.6,marginTop:"3px"}}>{MUTE_FINE_PRINT} {SIREN_DISCLOSURE}</div>
            </div>
          </div>
        </div>

        {v.toasts.length > 0 && (
          <div style={{position:"fixed",top:"14px",left:"50%",transform:"translateX(-50%)",zIndex:160,display:"flex",flexDirection:"column",gap:"8px",alignItems:"center",maxWidth:"90vw"}}>
            {v.toasts.map(t=>(
              <div key={t.id} style={{background:"#241005",border:"1px solid #ff8a3d",borderRadius:"8px",padding:"9px 14px",fontSize:"12px",color:"#ffcf9a",boxShadow:"0 6px 20px rgba(0,0,0,0.6)",display:"flex",gap:"10px",alignItems:"center"}}>
                <span>{t.text}</span>
                {t.actionLabel && (
                  <button onClick={()=>{v.dismissToast(t.id); if (t.onAction) t.onAction();}} style={{background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"1px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"10.5px",padding:"3px 10px",borderRadius:"6px",cursor:"pointer",whiteSpace:"nowrap"}}>{t.actionLabel}</button>
                )}
                {t.dismissLabel && (
                  <button onClick={()=>v.dismissToast(t.id)} style={{background:"#ffd54a",border:"none",color:"#2a0e05",fontWeight:900,fontSize:"10.5px",padding:"3px 10px",borderRadius:"6px",cursor:"pointer",whiteSpace:"nowrap"}}>{t.dismissLabel}</button>
                )}
              </div>
            ))}
          </div>
        )}

        {v.askmom && (
          <AskMomFlow source={v.askmom.source} enterStage={v.askmom.enterStage} panicActive={v.panicActive} hooks={v.askmomHooks} />
        )}

        {v.crateInspectOpen && v.crateAward && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.86)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={v.toggleInspectCrate}>
            <div onClick={(e)=>e.stopPropagation()} style={{background:"linear-gradient(160deg,#2a0e05,#4a1707)",border:`3px solid ${RARITY_COLORS[v.crateAward.tier]||"#ff8a3d"}`,borderRadius:"10px",maxWidth:"420px",width:"100%",padding:"26px",textAlign:"center",boxShadow:"0 0 60px rgba(255,80,20,0.4)"}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:"22px",color:"#ffb347",letterSpacing:"1px",marginBottom:"10px"}}>INSPECT JPEG</div>
              <div style={{border:`2px solid ${RARITY_COLORS[v.crateAward.tier]||"#ff8a3d"}`,borderRadius:"8px",padding:"20px",background:"repeating-linear-gradient(45deg,rgba(255,255,255,0.03),rgba(255,255,255,0.03) 12px,transparent 12px,transparent 24px)"}}>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:"18px",color:RARITY_COLORS[v.crateAward.tier]||"#ff8a3d",letterSpacing:"1px"}}>{v.crateAward.tier.toUpperCase()}</div>
                <div style={{fontSize:"17px",fontWeight:800,color:"#ffe9d6",margin:"12px 0"}}>{v.crateAward.name}</div>
                <div style={{fontSize:"11px",color:"#e8a52a",transform:"rotate(-8deg)",margin:"8px 0",opacity:0.75}}>SAMPLE · DO NOT STEAL · hfes JPEGs</div>
                <div style={{fontSize:"9.5px",color:"#e8a52a"}}>StatTrak™ Downloads: 4,000,000</div>
                <div style={{fontSize:"13px",color:"#8fd97a",fontWeight:800,marginTop:"8px"}}>Estimated Value: ${v.crateAward.value.toFixed(2)} · Cash Value (est.): $0.00</div>
              </div>
              <div style={{fontSize:"10px",color:"#a9705a",fontStyle:"italic",margin:"12px 0"}}>It's the same image, larger. The watermark is intact (it was never removable, §1.3).</div>
              <button onClick={v.toggleInspectCrate} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"12px",padding:"9px 16px",borderRadius:"8px",cursor:"pointer"}}>Stop Inspecting</button>
            </div>
          </div>
        )}

        {v.invOpen && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:170,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px",overflowY:"auto"}}>
            <div style={{background:"#1c0d06",border:"2px solid #8fd97a",borderRadius:"10px",maxWidth:"880px",width:"100%",padding:"24px",color:"#d8b79b",fontSize:"12px"}}>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",flexWrap:"wrap",gap:"10px"}}>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:"22px",color:"#ffb347"}}>INVENTORY &amp; PORTFOLIO</div>
                <button onClick={v.closeInventory} style={{background:"#ff5a14",border:"none",color:"#2a0e05",fontWeight:800,padding:"8px 14px",borderRadius:"6px",cursor:"pointer"}}>Close (reluctantly)</button>
              </div>

              <div style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"12px 14px",marginBottom:"18px"}}>
                <div style={{fontSize:"13px",color:"#8fd97a",fontWeight:800}}>Total Estimated Value: {fmtUSD(v.portfolio.total)}</div>
                <div style={{fontSize:"11px",color:"#a9705a",margin:"3px 0"}}>Portfolio All-Time High: {fmtUSD(v.portfolio.high)} <span style={{fontSize:"8.5px",color:"#6a4a38"}}>(same number or higher, always)</span></div>
                <div title={v.portfolioHover} style={{fontSize:"11px",color:"#8fd97a",cursor:"help"}}>Cash Value (est.): $0.00</div>
                <div style={{fontSize:"8px",color:"#6a4a38",marginTop:"4px"}}>Portfolio value only ever rises (§10). Realized losses are not reflected in estimated value (§8.9). Theft is a form of realization.</div>
              </div>

              <div style={{fontFamily:"'Bangers',cursive",fontSize:"15px",color:"#cf6a32",letterSpacing:"1px",margin:"0 0 8px"}}>MARKET-GRADE HOLDINGS</div>
              <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px",flexWrap:"wrap"}}>
                <label style={{fontSize:"10px",color:"#a9705a"}}>Filter: Soon™{" "}
                  <select style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"4px",color:"#d8b79b",fontSize:"10px",padding:"3px 6px"}}>
                    <option>All items (recommended by us)</option>
                  </select>
                </label>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:"10px",marginBottom:"18px"}}>
                {v.invMarketGrade.length===0 && v.inventoryItems.filter(e=>e.itemClass==="receipt").length===0 && (
                  <div style={{fontSize:"10.5px",color:"#8a6a52",fontStyle:"italic",gridColumn:"1/-1"}}>No Market-Grade holdings. Win something fake first (the games are right there).</div>
                )}
                {v.invMarketGrade.map(e=>{
                  const cat = e.catalogId ? catalogById(e.catalogId) : null;
                  const color = cat ? (RARITY_COLORS[cat.rarity]||"#ff8a3d") : "#8a8a8a";
                  return (
                    <div key={e.id} onClick={()=>v.openInvDetail(e.id)} style={{border:`2px solid ${color}`,borderRadius:"8px",background:"linear-gradient(160deg,#241005,#160a04)",padding:"10px",cursor:"pointer"}}>
                      <div style={{width:"100%",height:"52px",borderRadius:"5px",background:`repeating-linear-gradient(45deg,${color}22,${color}22 5px,transparent 5px,transparent 10px)`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",marginBottom:"6px"}}>
                        {cat && <img src={SKIN_IMAGES[cat.id]} alt={cat.short} style={{height:"100%",width:"100%",objectFit:"contain"}} />}
                      </div>
                      <div style={{fontSize:"10.5px",fontWeight:800,color:"#ffe9d6",lineHeight:1.3}}>{cat ? cat.short : e.name}</div>
                      <div style={{fontSize:"8.5px",color:"#e8a52a",lineHeight:1.3}}>{e.wear}</div>
                      <div style={{fontSize:"10px",color:"#8fd97a",fontWeight:700,marginTop:"2px"}}>{cat ? fmtUSD(cat.baseline) : "$0.00"}</div>
                      {e.tradeHold && <div style={{fontSize:"8px",color:"#e24a4a",marginTop:"2px"}}>{e.tradeHold}</div>}
                    </div>
                  );
                })}
                {v.inventoryItems.filter(e=>e.itemClass==="receipt").map(r=>(
                  <div key={r.id} onClick={()=>v.openInvDetail(r.id)} style={{border:"2px dashed #e0a800",borderRadius:"8px",background:"#160a04",padding:"10px",cursor:"pointer"}}>
                    <div style={{fontSize:"26px",textAlign:"center",marginBottom:"4px"}}>🧾</div>
                    <div style={{fontSize:"10px",fontWeight:800,color:"#e0a800",lineHeight:1.3}}>Market Event Receipt</div>
                    <div style={{fontSize:"8px",color:"#6a4a38",lineHeight:1.3}}>{r.receiptFor ? ("re: "+r.receiptFor) : ""}</div>
                    <div style={{fontSize:"10px",color:"#8fd97a",fontWeight:700,marginTop:"2px"}}>$0.00</div>
                  </div>
                ))}
              </div>

              <div style={{fontFamily:"'Bangers',cursive",fontSize:"15px",color:"#cf6a32",letterSpacing:"1px",margin:"0 0 8px"}}>ACTIVE LISTINGS</div>
              {v.mkActive.length===0 && v.mkListings.filter(l=>l.phase==="sold").length===0 && (
                <div style={{fontSize:"10.5px",color:"#8a6a52",fontStyle:"italic",marginBottom:"18px"}}>No listings. The only exit that pays is the insulting one (§5).</div>
              )}
              {v.mkActive.map(l=>(
                <div key={l.id} style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"10px 12px",marginBottom:"8px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
                    <div>
                      <div style={{color:"#ffe9d6",fontWeight:700}}>{l.name} — asking {l.askingBB} BB</div>
                      <div style={{fontSize:"10px",color:"#a9705a"}}>{l.views===0 ? "0 views" : "1 view: "+l.viewBy}</div>
                      {l.views>0 && <div style={{fontSize:"10px",color:"#e8a52a",marginTop:"2px"}}>OFFER: 0.02 BB + exposure. Final offer.</div>}
                    </div>
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      {l.views>0 && (
                        <button onClick={()=>v.marketAcceptLowball(l.id)} style={{background:"linear-gradient(180deg,#ffd54a,#c9960a)",border:"2px solid #fff2c9",color:"#2a0e05",fontWeight:900,fontSize:"10.5px",padding:"7px 10px",borderRadius:"6px",cursor:"pointer"}}>Accept offer (0.02 BB + exposure)</button>
                      )}
                      <button onClick={()=>v.marketCancelListing(l.id)} style={{background:"#3a2010",border:"1px dashed #ff8a3d",color:"#ffcf9a",fontWeight:700,fontSize:"10.5px",padding:"7px 10px",borderRadius:"6px",cursor:"pointer"}}>Cancel — 3 BB Delisting Fee</button>
                    </div>
                  </div>
                </div>
              ))}
              {v.mkListings.filter(l=>l.phase==="sold").slice(0,3).map(l=>(
                <div key={l.id} style={{background:"#1a2a05",border:"1px solid #8fd97a",borderRadius:"6px",padding:"10px 12px",marginBottom:"8px",fontSize:"10.5px",color:"#c9f2b0"}}>
                  <b style={{color:"#8fd97a"}}>SOLD! {l.name}</b> — asking {l.askingBB} BB − Buyer Protection 7.3% ({l.buyerProtection} BB) − Settlement Fee ({l.settlementFee} BB) − §8.9 rounding = <b>{l.proceeds} BB credited to Escrow (converts to withdrawal queue)</b>{l.lowballAccepted ? " (accepted the lowball instead — bold)" : ""}
                </div>
              ))}
              <div style={{height:"10px"}}></div>

              <div style={{fontFamily:"'Bangers',cursive",fontSize:"15px",color:"#cf6a32",letterSpacing:"1px",margin:"0 0 8px"}}>PENDING WITHDRAWALS</div>
              {v.escrowCards.length===0 ? (
                <div style={{fontSize:"10.5px",color:"#8a6a52",fontStyle:"italic",marginBottom:"10px"}}>No withdrawals pending. The queue misses you.</div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:"10px",marginBottom:"10px"}}>
                  {v.escrowCards.map(c=>(
                    <div key={c.id} style={{background:"#0e0a06",border:"1px solid #7a3a1a",borderRadius:"6px",padding:"10px 12px"}}>
                      <div style={{color:"#ffe9d6",fontWeight:700,fontSize:"11px"}}>{c.label}</div>
                      <div style={{fontSize:"10.5px",color:"#8fd97a",margin:"3px 0"}}>{fmtUSD(c.usdEst)} · ≈ {ocEquivalent(c.usdEst).toLocaleString("en-US")} OC <span style={{fontSize:"8px",color:"#6a4a38"}}>(at today's worst mood band)</span></div>
                      <div style={{height:"8px",background:"#241005",borderRadius:"4px",overflow:"hidden",margin:"6px 0"}}>
                        <div style={{height:"100%",width:escrowProgress(c.createdAt)+"%",background:"linear-gradient(90deg,#ff8a3d,#ffd54a)",transition:"width 0.5s linear"}}></div>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",gap:"8px",fontSize:"9px",color:"#a9705a"}}>
                        <span style={{whiteSpace:"nowrap"}}>{escrowProgress(c.createdAt).toFixed(1)}%</span>
                        <span style={{textAlign:"right"}}>{escrowReason(c.createdAt)}</span>
                      </div>
                      {v.appealState.id===c.id ? (
                        <div style={{marginTop:"8px",background:"#160a04",border:"1px dashed #ff9ad5",borderRadius:"6px",padding:"8px 10px",fontSize:"10.5px"}}>
                          <div style={{color:"#ff9ad5",fontWeight:800,marginBottom:"4px"}}>SupportBot (MOM-TRUSTED™)</div>
                          {SUPPORTBOT_DEFLECTIONS.slice(0, v.appealState.step).map((d,i)=>(<div key={i} style={{color:"#d8b79b",marginBottom:"3px"}}>{d}</div>))}
                          {v.appealState.closed && <div style={{color:"#8fd97a",fontWeight:800}}>{SUPPORTBOT_CLOSE}</div>}
                          <button onClick={v.invAppealClose} style={{marginTop:"6px",background:"none",border:"none",color:"#a9705a",fontSize:"9.5px",cursor:"pointer",textDecoration:"underline",padding:0}}>close ticket</button>
                        </div>
                      ) : (
                        <button onClick={()=>v.invAppealStart(c.id)} style={{marginTop:"6px",background:"#3a2010",border:"1px dashed #ff9ad5",color:"#ffcf9a",fontWeight:700,fontSize:"10px",padding:"5px 10px",borderRadius:"6px",cursor:"pointer"}}>Appeal</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"8px 12px",marginBottom:"18px"}}>
                <div style={{fontSize:"10px",color:"#cf6a32",fontWeight:700,marginBottom:"4px"}}>§1.3 COMPLIANCE CHECKLIST</div>
                {COMPLIANCE_CHECKLIST.map((c,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",gap:"10px",fontSize:"10px"}}>
                    <span style={{color:"#a9705a"}}>{c.item}</span>
                    <span style={{color:"#e8a52a",fontStyle:"italic",whiteSpace:"nowrap"}}>{c.status}</span>
                  </div>
                ))}
              </div>

              <div style={{fontFamily:"'Bangers',cursive",fontSize:"15px",color:"#cf6a32",letterSpacing:"1px",margin:"0 0 8px"}}>TRADE-UP CONTRACT (PATENT PENDING, OUTCOME PENDING)</div>
              <div style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"12px 14px",marginBottom:"18px"}}>
                <div style={{fontSize:"10.5px",color:"#a9705a",marginBottom:"8px",lineHeight:1.5}}>
                  Select 5 Market-Grade items of the same tier + Contract Origination Fee 5 BB + Maternal Gratuity 1 BB.
                  Output: the cheapest item of the next tier up. Always. Float = worst of the five + 0.01. StatTrak™ counters do not transfer (they were never yours).
                  JPEGs, listed items, and trade-held items are not contractible (so, all purchases — again).
                </div>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"10px"}}>
                  {v.contractChips.map(e=>{
                    const cat = e.catalogId ? catalogById(e.catalogId) : null;
                    return (
                      <span key={e.id} style={{display:"inline-flex",alignItems:"center",gap:"5px",border:"1px solid #7a5a2a",borderRadius:"12px",padding:"3px 9px",fontSize:"9.5px",color:"#e8c9ac",background:"#160a04"}}>
                        {cat ? cat.short : e.name}
                        <button onClick={()=>v.contractToggle(e.id)} style={{background:"none",border:"none",color:"#e24a4a",cursor:"pointer",fontWeight:900,padding:0,fontSize:"10px"}}>×</button>
                      </span>
                    );
                  })}
                  {v.contractChips.length===0 && <span style={{fontSize:"9.5px",color:"#6a4a38",fontStyle:"italic"}}>nothing selected. five regrets, one slightly-better regret.</span>}
                </div>
                {v.contractPhase==="reel" ? (
                  (()=>{
                    const p = Market.contractPreview(v.contractSel);
                    const label = p ? (p.photo ? "A PHOTOGRAPH" : p.nextTier) : "…";
                    return (
                      <div style={{position:"relative",overflow:"hidden",height:"52px",border:"2px solid #7a3a1a",borderRadius:"8px",background:"#0e0a06",marginBottom:"8px"}}>
                        <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:"2px",background:"#ffe9d6",zIndex:5}}></div>
                        <div style={{display:"flex",gap:"6px",transform:"translateX(calc(50% - "+(9*92+46)+"px))",transition:"transform 2.5s cubic-bezier(0.08,0.7,0.2,1)"}}>
                          {contractReelStrip(label, v.contractScoot).map((t,i)=>(
                            <div key={i} style={{minWidth:"86px",height:"38px",marginTop:"6px",borderRadius:"5px",border:i===9?"2px solid #ffd54a":(t==="Covert Extravagance"?"2px solid #ff4444":"2px solid #7a5a2a"),background:"linear-gradient(160deg,#2a1408,#160a04)",display:"flex",alignItems:"center",justifyContent:"center",padding:"3px",textAlign:"center",fontSize:"7px",fontWeight:800,color:t==="Covert Extravagance"?"#ff4444":"#e8c9ac",whiteSpace:"nowrap",overflow:"hidden"}}>{t.toUpperCase()}</div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <React.Fragment>
                    <button
                      onClick={v.contractRun}
                      disabled={!(v.contractSel.length===5 && Market.contractPreview(v.contractSel))}
                      style={v.contractSel.length===5 && Market.contractPreview(v.contractSel)
                        ? {background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"12px",padding:"9px 14px",borderRadius:"7px",cursor:"pointer"}
                        : {background:"#3a2010",border:"2px solid #5a4232",color:"#8a6a52",fontWeight:900,fontSize:"12px",padding:"9px 14px",borderRadius:"7px",cursor:"not-allowed"}}
                    >
                      {v.contractSel.length<5 ? "Execute Contract (requires "+(5-v.contractSel.length)+" more regrets)" : "Execute Contract — "+v.contractFee+" BB"}
                    </button>
                    {v.contractResult && v.contractResult.ok && (
                      <div style={{marginTop:"10px",background:"#3a2a05",border:"2px solid #ffd54a",borderRadius:"8px",padding:"10px",animation:"tierFlare 0.9s ease-out"}}>
                        <div style={{fontFamily:"'Bangers',cursive",fontSize:"13px",color:"#ffd54a"}}>{v.contractResult.kind==="photograph" ? "COMPLEMENTARY PHOTOGRAPH" : "CONTRACT FULFILLED"}</div>
                        <div style={{fontSize:"11px",color:"#ffe9d6",fontWeight:700,margin:"4px 0"}}>{v.contractResult.name}</div>
                        <div style={{fontSize:"9.5px",color:"#a9705a"}}>
                          {v.contractResult.kind==="photograph" ? v.contractResult.note : "Float Value (verified by nobody): "+v.contractResult.float.toFixed(10)+" · "+v.contractResult.statTrakNote}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                )}
              </div>

              <div style={{fontFamily:"'Bangers',cursive",fontSize:"15px",color:"#4aa8c9",letterSpacing:"1px",margin:"0 0 8px"}}>{DIGITAL_ASSET_SECTION}</div>
              {v.invDigital.length===0 ? (
                <div style={{fontSize:"10.5px",color:"#8a6a52",fontStyle:"italic",marginBottom:"18px"}}>No Digital Assets. The crates are right there.</div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:"10px",marginBottom:"18px"}}>
                  {v.invDigital.map(e=>(
                    <div key={e.id} onClick={()=>v.openInvDetail(e.id)} style={{border:"2px solid #4aa8c9",borderRadius:"8px",background:"linear-gradient(160deg,#0a1418,#060c10)",padding:"10px",cursor:"pointer"}}>
                      <div style={{fontSize:"24px",textAlign:"center",marginBottom:"4px"}}>🖼️</div>
                      <div style={{fontSize:"10px",fontWeight:800,color:"#ffe9d6",lineHeight:1.3}}>{e.name}</div>
                      <div style={{fontSize:"9.5px",color:"#4aa8c9",fontStyle:"italic",marginTop:"3px"}}>{DIGITAL_ASSET_VALUE}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{fontFamily:"'Bangers',cursive",fontSize:"15px",color:"#cf6a32",letterSpacing:"1px",margin:"0 0 8px"}}>SOLD LEDGER</div>
              {v.soldLedger.length===0 ? (
                <div style={{fontSize:"10.5px",color:"#8a6a52",fontStyle:"italic"}}>Nothing sold yet. Instant Sell™ awaits (§5).</div>
              ) : (
                v.soldLedger.map(s=>(
                  <div key={s.id} style={{fontSize:"10px",color:"#a9705a",marginBottom:"4px",lineHeight:1.4}}>{s.line}</div>
                ))
              )}

            </div>
          </div>
        )}

        {v.invOpen && v.invDetail && (()=>{
          const e = v.invDetail;
          const cat = e.catalogId ? catalogById(e.catalogId) : null;
          const color = cat ? (RARITY_COLORS[cat.rarity]||"#ff8a3d") : (e.itemClass==="receipt" ? "#e0a800" : "#4aa8c9");
          const sellable = e.itemClass==="receipt" || v.mkSellable(e);
          const offer = v.mkOfferFor(e);
          const contractOk = Market.contractEligible(e);
          const inContract = v.contractSel.includes(e.id);
          return (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:175,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={v.closeInvDetail}>
              <div onClick={ev=>ev.stopPropagation()} style={{background:"linear-gradient(160deg,#2a0e05,#4a1707)",border:`3px solid ${color}`,borderRadius:"10px",maxWidth:"480px",width:"100%",padding:"24px",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 0 60px rgba(0,0,0,0.7)"}}>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:"18px",color:"#ffb347",lineHeight:1.2,marginBottom:"6px"}}>{e.name}</div>
                {cat && (
                  <div style={{position:"relative",margin:"10px 0",textAlign:"center",perspective:"600px"}}>
                    <div style={{display:"inline-block",animation:"skinWobble 7s ease-in-out infinite"}}>
                      <img src={SKIN_IMAGES[cat.id]} alt={cat.short} style={{height:"140px",maxWidth:"100%",objectFit:"contain"}} />
                    </div>
                    <span style={{position:"absolute",top:"4px",right:"8px",background:"#4a90e2",color:"#fff",fontSize:"9px",fontWeight:900,padding:"2px 6px",borderRadius:"4px",letterSpacing:"1px"}}>3D</span>
                    <div style={{fontSize:"7.5px",color:"#6a4a38",marginTop:"2px"}}>slow parallax 3D spin (it is the same JPEG wearing a badge)</div>
                  </div>
                )}
                {e.itemClass==="market-grade" && (
                  <div style={{fontSize:"10.5px",lineHeight:1.7,marginBottom:"10px"}}>
                    <div>Float Value (verified by nobody): <b style={{color:"#e8c9ac"}}>{typeof e.float==="number" ? e.float.toFixed(10) : "—"}</b></div>
                    {e.statTrak && <div>StatTrak™ {e.statLabel}: <b style={{color:"#e8a52a"}}>{e.statCount}</b> <span style={{fontSize:"8.5px",color:"#6a4a38"}}>(increments on your losses, never wins)</span></div>}
                    <div>Wear: <b style={{color:"#e8c9ac"}}>{e.wear}</b></div>
                    {e.tradeHold
                      ? <div style={{color:"#e24a4a",fontWeight:700}}>{e.tradeHold} <span style={{fontSize:"8.5px",color:"#8a6a52"}}>(the elapsed counter never increments)</span></div>
                      : <div style={{color:"#8fd97a",fontSize:"9.5px"}}>No trade hold — fake-won items are the only sellable things here (§1). This is intentional and load-bearing.</div>}
                  </div>
                )}
                {e.itemClass==="receipt" && (
                  <div style={{fontSize:"10.5px",color:"#e0a800",fontStyle:"italic",lineHeight:1.5,marginBottom:"10px"}}>Estimated value $0.00. {RECEIPT_FLAVOR}</div>
                )}
                {e.itemClass==="digital-asset" && (
                  <div style={{fontSize:"10.5px",color:"#4aa8c9",fontStyle:"italic",marginBottom:"10px"}}>Estimated value: {DIGITAL_ASSET_VALUE}. Non-sellable, non-listable, non-contractible.</div>
                )}
                <div style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"8px 12px",marginBottom:"12px"}}>
                  <div style={{fontSize:"9.5px",color:"#cf6a32",fontWeight:700,letterSpacing:"1px",marginBottom:"4px"}}>PROVENANCE</div>
                  {(e.provenance||[]).length===0
                    ? <div style={{fontSize:"9.5px",color:"#6a4a38",fontStyle:"italic"}}>no history (the asset has no past, only a future as a JPEG)</div>
                    : (e.provenance||[]).map((p,i)=>(<div key={i} style={{fontSize:"9.5px",color:"#a9705a",lineHeight:1.5}}>— {p}</div>))}
                </div>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
                  {e.itemClass==="digital-asset" ? (
                    <button disabled title={DIGITAL_ASSET_SELL_TOOLTIP} style={{background:"#3a2010",border:"2px solid #5a4232",color:"#8a6a52",fontWeight:900,fontSize:"11px",padding:"9px 12px",borderRadius:"7px",cursor:"not-allowed"}}>Sell</button>
                  ) : (
                    <button
                      onClick={()=>v.marketInstantSell(e.id)}
                      disabled={!sellable}
                      title={sellable ? undefined : "Trade Hold: 8 days (0 hours elapsed). Purchases are decorative (§1)."}
                      style={sellable
                        ? {background:"linear-gradient(180deg,#ffd54a,#c9960a)",border:"2px solid #fff2c9",color:"#2a0e05",fontWeight:900,fontSize:"11px",padding:"9px 12px",borderRadius:"7px",cursor:"pointer"}
                        : {background:"#3a2010",border:"2px solid #5a4232",color:"#8a6a52",fontWeight:900,fontSize:"11px",padding:"9px 12px",borderRadius:"7px",cursor:"not-allowed"}}
                    >Instant Sell™ — {offer} BB</button>
                  )}
                  {e.itemClass==="market-grade" && (
                    <button onClick={()=>v.marketStartAsk(e.id)} disabled={!v.mkSellable(e)} style={v.mkSellable(e)
                      ? {background:"#3a2010",border:"1px dashed #ff8a3d",color:"#ffcf9a",fontWeight:700,fontSize:"11px",padding:"9px 12px",borderRadius:"7px",cursor:"pointer"}
                      : {background:"#2a1408",border:"1px dashed #5a4232",color:"#8a6a52",fontWeight:700,fontSize:"11px",padding:"9px 12px",borderRadius:"7px",cursor:"not-allowed"}}>List on Market</button>
                  )}
                  {e.itemClass==="market-grade" && (
                    <button onClick={()=>v.contractToggle(e.id)} disabled={!contractOk} style={contractOk
                      ? {background:"#3a2010",border:"1px dashed #a24ae2",color:"#d8b79b",fontWeight:700,fontSize:"11px",padding:"9px 12px",borderRadius:"7px",cursor:"pointer"}
                      : {background:"#2a1408",border:"1px dashed #5a4232",color:"#8a6a52",fontWeight:700,fontSize:"11px",padding:"9px 12px",borderRadius:"7px",cursor:"not-allowed"}}>{inContract ? "✓ In contract selection" : "Add to Contract"}</button>
                  )}
                  <button onClick={v.closeInvDetail} style={{background:"none",border:"none",color:"#a9705a",fontSize:"10.5px",cursor:"pointer",textDecoration:"underline",padding:0,marginLeft:"auto"}}>close</button>
                </div>
                {e.itemClass!=="digital-asset" && <div style={{fontSize:"8.5px",color:"#6a4a38",marginTop:"6px"}}>{v.instantSellSub}</div>}
                {v.marketAskFor===e.id && (
                  <div style={{marginTop:"10px",background:"#0e0a06",border:"1px solid #7a3a1a",borderRadius:"6px",padding:"10px 12px"}}>
                    <div style={{fontSize:"10px",color:"#a9705a",marginBottom:"6px"}}>Asking price (BB). On save: Listing Fee 5 BB + Maternal Gratuity 1 BB (non-refundable). Buyer Protection 7.3% is deducted from proceeds later.</div>
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      <input type="number" min="1" value={v.marketAskInput} onChange={ev=>v.marketSetAsk(ev.target.value)} placeholder="asking (BB)" style={{flex:1,minWidth:"90px",background:"#1c0d06",border:"2px solid #7a3a1a",borderRadius:"6px",color:"#ffd9b3",fontSize:"12px",padding:"8px 10px"}} />
                      <button onClick={v.marketConfirmAsk} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"11px",padding:"8px 12px",borderRadius:"6px",cursor:"pointer"}}>List it (−6 BB)</button>
                      <button onClick={v.marketCancelAsk} style={{background:"#3a2010",border:"1px dashed #7a5a2a",color:"#a9705a",fontWeight:700,fontSize:"11px",padding:"8px 12px",borderRadius:"6px",cursor:"pointer"}}>Never mind</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {v.marketCheckoutItem && (()=>{
          const it = v.marketCheckoutItem;
          const q = it.quote;
          return (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:190,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={v.marketCloseCheckout}>
              <div onClick={ev=>ev.stopPropagation()} style={{background:"linear-gradient(160deg,#2a0e05,#4a1707)",border:"3px solid #ff5a14",borderRadius:"10px",maxWidth:"440px",width:"100%",padding:"24px",boxShadow:"0 0 60px rgba(255,80,20,0.4)"}}>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"4px"}}>CHECKOUT — {it.short}</div>
                <div style={{fontSize:"10px",color:"#a9705a",marginBottom:"10px"}}>Estimate: {fmtUSD(q.est)} (baseline {it.estimatedValue}). {ESTIMATE_FOOTER}</div>
                <div style={{background:"#0e0a06",border:"1px solid #3a1a0a",borderRadius:"6px",padding:"10px",fontSize:"10.5px",color:"#e8c9ac",lineHeight:1.8}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>Asking (BB parity ×3, §8.9 volatility applied)</span><b>{q.base} BB</b></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>Buyer Protection Fee — 7.3%</span><b>{q.buyerProtection} BB</b></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>Escrow Handling — flat</span><b>{q.escrowHandling} BB</b></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>Maternal Gratuity</span><b>{q.maternalGratuity} BB</b></div>
                  <div style={{fontSize:"8.5px",color:"#6a4a38"}}>§8.9 rounding: player credits round down; fees round up ("also for you"). Maternal Gratuity is customary, not required, automatically applied.</div>
                  <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px dashed #5a4232",marginTop:"4px",paddingTop:"4px",color:"#ffb347",fontWeight:900}}><span>TOTAL</span><span>{q.total} BB</span></div>
                </div>
                <div style={{fontSize:"9px",color:"#8a6a52",fontStyle:"italic",margin:"10px 0",lineHeight:1.5}}>{MARKET_OC_NOTICE} Item arrives immediately, stamped: {TRADE_HOLD_LABEL}. Purchases are decorative (§1) — only fake-won items can ever be sold or contracted.</div>
                <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                  <button onClick={()=>v.marketConfirmPurchase(it.id)} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"13px",padding:"11px 16px",borderRadius:"8px",cursor:"pointer"}}>Complete Purchase — {q.total} BB</button>
                  <button onClick={v.marketCloseCheckout} style={{background:"#3a2010",border:"1px dashed #7a5a2a",color:"#a9705a",fontWeight:700,fontSize:"12px",padding:"11px 14px",borderRadius:"8px",cursor:"pointer"}}>Keep browsing</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ---- MOM'S HOME (#28): the Homework disguise (§2) — the underlying site
            gets fully replaced, not blurred; z 600 covers every overlay incl. the
            marketplace's checkout (190) and Mom's verification modal (250) ---- */}
        {v.panicActive && v.panicEssay && (
          <div style={{position:"fixed",inset:0,zIndex:600,background:"#f8f9fa",fontFamily:"Arial,Helvetica,sans-serif",color:"#202124",overflowY:"auto",overflowX:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 18px",position:"relative"}}>
              <div style={{width:"34px",height:"42px",background:"#fff",border:"1px solid #dadce0",borderRadius:"2px 10px 2px 2px",position:"relative",flexShrink:0}}>
                <div style={{position:"absolute",top:0,right:0,width:"10px",height:"10px",background:"#e8eaed",borderRadius:"0 9px 0 4px"}}></div>
                <div style={{position:"absolute",left:"6px",right:'8px',top:'12px',height:'2px',background:'#4285f4'}}></div>
                <div style={{position:"absolute",left:'6px',right:'12px',top:'18px',height:'2px',background:'#4285f4'}}></div>
                <div style={{position:"absolute",left:'6px',right:'10px',top:'24px',height:'2px',background:'#4285f4'}}></div>
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:"17px",color:"#202124",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"46vw"}}>{v.panicEssay.title}</div>
                <div style={{fontSize:"13.5px",color:"#5f6368",display:"flex",gap:"14px",whiteSpace:"nowrap"}}>
                  <span onClick={v.panicFileMenuToggle} style={{cursor:"pointer"}}>File</span>
                  <span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Extensions</span><span>Help</span>
                </div>
              </div>
              {v.panicFileMenu && (
                <div style={{position:"absolute",top:"58px",left:"56px",background:"#fff",border:"1px solid #dadce0",borderRadius:"8px",boxShadow:"0 4px 12px rgba(60,64,67,.3)",padding:"12px 16px",fontSize:"12px",color:"#5f6368",maxWidth:"320px",zIndex:5,lineHeight:1.6}}>
                  <div style={{color:"#80868b",fontSize:"10.5px",marginBottom:"4px",letterSpacing:"0.5px"}}>DOWNLOAD · SAVE TO DRIVE · MAKE A COPY · PRINT</div>
                  {v.panicExportLine}
                  <div style={{marginTop:"6px"}}><button onClick={v.panicFileMenuClose} style={{background:"none",border:"none",color:"#1a73e8",cursor:"pointer",fontSize:"11px",padding:0}}>ok</button></div>
                </div>
              )}
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"14px",flexShrink:0}}>
                <span style={{fontSize:"13.5px",color:"#5f6368"}}>🔒 History off the record</span>
                <span style={{border:"1px solid #dadce0",borderRadius:"4px",padding:"5px 16px",fontSize:"13.5px",color:"#1a73e8",fontWeight:700,cursor:"pointer",background:"#fff"}}>Share</span>
                <span style={{width:"30px",height:"30px",borderRadius:"50%",background:"#7986cb",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:700}}>E</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"14px",padding:"4px 18px 10px",fontSize:"12.5px",color:"#444746",borderBottom:"1px solid #dadce0",background:"#f8f9fa",position:"sticky",top:0,zIndex:4}}>
              <span>Times New Roman</span><span>12</span>
              <span style={{fontWeight:700}}>B</span><span style={{fontStyle:"italic"}}>I</span><span style={{textDecoration:"underline"}}>U</span>
              <span style={{marginLeft:"auto",fontSize:"12px",color:"#188038",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.panicGrade}</span>
            </div>
            <div style={{position:"relative",maxWidth:"720px",margin:"22px auto 90px",background:"#fffdf6",boxShadow:"0 1px 3px rgba(60,64,67,.2)",padding:"64px 76px",fontFamily:"Georgia,'Times New Roman',serif",minHeight:"70vh"}}>
              <div style={{textAlign:"center",fontSize:"22px",fontWeight:700,marginBottom:"6px"}}>{v.panicEssay.title}</div>
              <div style={{textAlign:"center",fontSize:"12.5px",color:"#5f6368",marginBottom:"30px"}}>{v.panicEssay.subject} · {v.panicTeacher} · {new Date().toLocaleDateString("en-US")}</div>
              {v.panicParagraphs.map((p,i)=>(
                <p key={i} style={{fontSize:"14.5px",lineHeight:1.9,textIndent:"34px",margin:"0 0 12px"}}>{p}</p>
              ))}
              {v.panicGrowthParas.map((p,i)=>(
                <p key={"g"+i} style={{fontSize:"14.5px",lineHeight:1.9,textIndent:"34px",margin:"0 0 12px"}}>{p}</p>
              ))}
              {v.panicShowMargin && (
                <div style={{position:"absolute",top:"110px",right:"-168px",width:"150px",background:"#fff",border:"1px solid #dadce0",borderRadius:"8px",padding:"10px",boxShadow:"0 1px 3px rgba(60,64,67,.2)",fontFamily:"Arial,Helvetica,sans-serif"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"6px"}}>
                    <span style={{width:"20px",height:"20px",borderRadius:"50%",background:"#d93025",color:"#fff",fontSize:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{v.panicTeacher.charAt(0)}</span>
                    <b style={{fontSize:"11px",color:"#202124"}}>{v.panicTeacher}</b>
                  </div>
                  <div style={{fontSize:"11px",color:"#d93025",lineHeight:1.5}}>{v.panicMarginComment}</div>
                </div>
              )}
            </div>
            <div style={{position:"fixed",left:"18px",bottom:"18px",background:"#fff",border:"1px solid #dadce0",borderRadius:"16px",padding:"6px 14px",fontSize:"12px",color:"#5f6368",boxShadow:"0 1px 3px rgba(60,64,67,.2)"}}>{v.panicWordCount.toLocaleString("en-US")} words</div>
            <button onClick={v.togglePanic} style={{position:"fixed",right:"20px",bottom:"20px",background:"#1a73e8",border:"1px solid #1a73e8",color:"#fff",fontFamily:"Arial,Helvetica,sans-serif",fontSize:"13px",fontWeight:700,padding:"10px 20px",borderRadius:"6px",cursor:"pointer",boxShadow:"0 1px 3px rgba(60,64,67,.3)"}}>{v.panicRestoreLabel}</button>
          </div>
        )}

        {/* single-tap ESC tooltip / the crate's answer (§1) — first use only */}
        {v.panicHint && !v.panicActive && (
          <div style={{position:"fixed",bottom:"88px",right:"20px",zIndex:170,background:"#241005",border:"1px solid #ff8a3d",borderRadius:"8px",padding:"9px 14px",fontSize:"12px",color:"#ffcf9a",boxShadow:"0 6px 20px rgba(0,0,0,0.6)",maxWidth:"280px"}}>{v.panicHint}</div>
        )}

        {/* the welcome-back modal (§6): fires on every reveal, button or reload */}
        {v.panicWelcome && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:650,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
            <div style={{background:"linear-gradient(160deg,#2a0e05,#4a1707)",border:"3px solid #ff5a14",borderRadius:"10px",maxWidth:"480px",width:"100%",padding:"26px",boxShadow:"0 0 60px rgba(255,80,20,0.4)",maxHeight:"88vh",overflowY:"auto"}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:"25px",color:"#ffb347",letterSpacing:"1px",textShadow:"2px 2px 0 #7a1c00",overflowWrap:"anywhere"}}>Welcome back, {v.panicWelcome.tag}.</div>
              <p style={{color:"#ffd9b3",fontSize:"13px",margin:"12px 0 8px"}}>While you were studying, the server admin's mood changed.</p>
              {!v.panicMoodShown ? (
                <button onClick={v.panicToggleMood} style={{background:"none",border:"none",color:"#ffb347",fontSize:"11.5px",cursor:"pointer",textDecoration:"underline",padding:0}}>show today's mood word</button>
              ) : (
                <div style={{background:"#1c0d06",border:"1px solid #7a3a1a",borderRadius:"6px",padding:"10px 12px",fontSize:"12px",color:"#e8c9ac",lineHeight:1.6}}>
                  <div>Today's mood: <b style={{color:"#ffd54a"}}>{v.panicWelcome.moodNow}</b></div>
                  <div style={{fontSize:"9.5px",color:"#8a6a52",fontStyle:"italic",marginTop:"4px"}}>
                    {v.panicWelcome.moodNow === v.panicWelcome.moodAtHide ? "Mood drifts at the daily boundary (§8.9). Claims of intraday drift are a load-bearing feature of our marketing." : "For once, we weren't lying."}
                  </div>
                </div>
              )}
              <div style={{background:"#0e0a06",border:"1px solid #3a1a0a",borderRadius:"6px",padding:"10px 12px",margin:"14px 0",fontSize:"11px",color:"#e8c9ac",lineHeight:1.9}}>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:"13px",color:"#cf6a32",letterSpacing:"1px",marginBottom:"4px"}}>PANIC RECEIPT</div>
                <div>{v.panicWelcome.hushLine}</div>
                {v.panicWelcome.roundLines.map((l,i)=>(<div key={i}>{l}</div>))}
                <div>{v.panicWelcome.missedLine}</div>
              </div>
              <button onClick={v.panicDismissWelcome} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"13px",padding:"11px 18px",borderRadius:"8px",cursor:"pointer",width:"100%"}}>Resume losing</button>
              <div style={{fontSize:"6.5px",color:"#5a4232",marginTop:"10px",lineHeight:1.6}}>{v.panicRgTagline} (§7.3)</div>
            </div>
          </div>
        )}

        <button onClick={v.togglePanic} title={v.panicRgTagline + " — triple-tap ESC (ToS §12.0)"} style={{position:"fixed",bottom:"20px",right:"20px",background:"#c92020",border:"3px solid #ffcfcf",color:"#fff",fontFamily:"'Bangers',cursive",fontSize:"14px",padding:"14px 18px",borderRadius:"50px",cursor:"pointer",zIndex:100,animation:"pulseGlow 2s infinite",boxShadow:v.momsGlow?"0 0 26px 8px rgba(255,213,74,0.85)":undefined}}>MOM'S HOME</button>

      </div>
    );
  }
}

export default App
