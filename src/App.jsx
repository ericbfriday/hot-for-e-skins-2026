import React from 'react'
import { Mood } from "./spine/mood.js";
import { Bus, EVENTS, Regime } from "./spine/bus.js";
import "./spine/vault.js";
import "./spine/band.js";
import { Identity, generateTag, complianceFilter, YOU_COLOR, CUSTOM_NAME_PRICE_OC } from "./spine/identity.js";
import { Consent } from "./spine/consent.js";
import AskMomFlow from "./askmom/AskMomFlow.jsx";
import ChatPanel from "./chat/ChatPanel.jsx";
import {
  loadOC, saveOC, loadBonus, saveBonus, clearBonus, loadDepositStats,
} from "./askmom/session.js";
import {
  GAME_PRICES_BB, MATERNAL_STARTER_GRANT_BB, DESPERATION_THRESHOLD_BB,
  V_GEMS_PER_BB, SKINCOINZ_PER_BB, LEGACY_TO_WHOLE_BB_SCALE, REFILL_PACKAGES,
  NAG_LOW_BB_COPY, INSUFFICIENT_FUNDS_COPY, INSUFFICIENT_FUNDS_ESCALATION_COPY
} from "./spine/constants.js";

const PKG_NAME = Object.fromEntries(REFILL_PACKAGES.map((p) => [p.id, p.name]));

const SKIN_IMAGES = Object.fromEntries(
  Object.entries(import.meta.glob("./assets/skins/*.jpg", { eager: true })).map(([path, mod]) => [
    path.split("/").pop().replace(".jpg", ""),
    mod.default,
  ])
);

const WIN_TEMPLATES = [
  "{n} just won a Karambit worth $12,000 (screenshot not available)",
  "{n} deposited their lunch money and feels GREAT about it",
  "{n} hit a 47x multiplier (server logs unavailable)",
  "{n} traded up to Covert Extravagance tier (verification pending)",
  "{n} cashed out $0.00 successfully",
  "{n} unlocked a crate and received emotional damage",
  "{n} is now VIP Bronze Tier 7 (spent $340 this week)",
  "{n} defeated the house (this has never happened)",
  "Server admin recalculated {n}'s balance based on mood"
];
const RARITY_COLORS = {"Covert Extravagance":"#ff4444","Consumer Grade Trash":"#8a8a8a","Contraband Liability":"#e0a800","Mil-Spec Regret":"#4a90e2","Classified Overdraft":"#a24ae2","Industrial Denial":"#4aa8c9"};
const CATALOG = [
  {id:"skin_01",name:"Tactical Plastic Spork | Minimal Debt",rarity:"Covert Extravagance",statTrak:true,statMetric:"Unpaid Chores: 47",estimatedValue:"$1,420.69",flavorText:"Engineered for maximum cafeteria lunch trade value."},
  {id:"skin_02",name:"Default Cardboard Box | Battle-Scarred",rarity:"Consumer Grade Trash",statTrak:false,statMetric:null,estimatedValue:"$0.02",flavorText:"Smells faintly of basement dampness."},
  {id:"skin_03",name:"AWP | Mom's Visa Signature Edition",rarity:"Contraband Liability",statTrak:true,statMetric:"Chargebacks Pending: 3",estimatedValue:"$8,500.00",flavorText:"Comes pre-scratched with the 3-digit CVV on the stock."},
  {id:"skin_04",name:"Rubber Band Ball | Field-Tested Anxiety",rarity:"Mil-Spec Regret",statTrak:false,statMetric:null,estimatedValue:"$0.11",flavorText:"Has been rewound 4,000 times out of pure dread."},
  {id:"skin_05",name:"Juice Box Straw | Minor Frustration",rarity:"Industrial Denial",statTrak:true,statMetric:"Times Bent: 12",estimatedValue:"$3.40",flavorText:"Bent at a 90 degree angle, permanently unusable."},
  {id:"skin_06",name:"Dad's Old Gaming Chair | Ergonomic Betrayal",rarity:"Classified Overdraft",statTrak:false,statMetric:null,estimatedValue:"$210.00",flavorText:"Still smells like 2014 and disappointment."},
  {id:"skin_07",name:"Participation Trophy | Gold Foil Wounded Pride",rarity:"Mil-Spec Regret",statTrak:true,statMetric:"Self-Esteem Lost: 89%",estimatedValue:"$16.00",flavorText:"Everyone got one. That's the joke."},
  {id:"skin_08",name:"Retainer Case | Empty (Lost Retainer Not Included)",rarity:"Consumer Grade Trash",statTrak:false,statMetric:null,estimatedValue:"$0.75",flavorText:"Orthodontist not affiliated with this listing."},
  {id:"skin_09",name:"School WiFi Password | Expired Access",rarity:"Classified Overdraft",statTrak:true,statMetric:"Blocked Sites Bypassed: 6",estimatedValue:"$4,000.00",flavorText:"Works for exactly one (1) more week."},
  {id:"skin_10",name:"Half-Eaten Fruit Roll-Up | Sticky Legendary",rarity:"Covert Extravagance",statTrak:false,statMetric:null,estimatedValue:"$999.99",flavorText:"Preserved in its original wrapper for authenticity."}
];
const ROULETTE_STRIP = Array.from({length:20},(_,i)=>{const it=CATALOG[i%CATALOG.length];return {short:it.name.split("|")[0].trim(),color:RARITY_COLORS[it.rarity]||"#ff8a3d",image:SKIN_IMAGES[it.id]};});

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
    activeTab:"roulette", balanceBB:MATERNAL_STARTER_GRANT_BB, insufficientMsg:null, sessionSpendFailures:0,
    moodWord:null, denomsOpen:false,
    balanceOC:0, bonusOC:null, askmom:null, toasts:[], ocFly:null, cooldown:null, streakChip:null, abandonedCount:0,
    ticker:[],
    rouletteSpinning:false, rouletteOffset:0, rouletteTransition:"none", rouletteResult:null,
    coinFlipping:false, coinResult:null,
    crashRunning:false, crashMult:1.00, crashCrashed:false, crashResult:null, cashoutDodge:0,
    crateKeyBought:false, crateOpening:false, crateProgress:0, crateResult:null
  };

  _tosScrollRef = React.createRef();
  _art8Ref = React.createRef();

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
    let oc = loadOC();
    let bonus = loadBonus();
    if (bonus && Date.now() >= bonus.expiresAt) {
      const expired = bonus.amount;
      clearBonus(); bonus = null;
      setTimeout(()=>this.toast("Your "+expired+" Bonus OC expired as scheduled (§2.3). They are survived by nothing."), 900);
    }
    this.setState({
      balanceBB:balance, flowPhase, ageVerified:ageOk,
      tosAcceptedEver, tosNeedsConsent:!tosAcceptedEver,
      ident:Identity.get(), stats:Identity.getStats(),
      balanceOC:oc, bonusOC:bonus, streakChip: loadDepositStats().streak,
    });
    this.saveBalance(balance);
    if (welcomeToast) this.toast(welcomeToast);
    this._offMood = Mood.onChange(({word})=>{
      this.setState({moodWord:word});
      const b = this.state.bonusOC;
      if (b && Date.now() >= b.expiresAt) {
        clearBonus();
        this.setState({bonusOC:null});
        this.toast("Your "+b.amount+" Bonus OC expired as scheduled (§2.3). They are survived by nothing.");
      }
    });
    this._offIdent = Identity.subscribe(({identity, stats})=>this.setState({ident:identity, stats}));
    Mood.init();
    this._offDeposit = Bus.on(EVENTS.DEPOSIT_COMPLETED, (p)=>{
      const name = PKG_NAME[p.packageId] || "a package";
      this.pushTicker("You asked Mom. Mom said yes (she wasn't in the room)");
      this.pushTicker("You redeemed the "+name+". Chores pending.");
      if (p.firstEver) {
        this.pushTicker("MOMCODE_MIKE [OWNER] just 47x'd Mom's Visa — you're next (code MOM)");
        this.toast("Turbo Spin unlocked. It never re-locks. Premium is a scar.");
      }
      if (p.packageId === "moms-max") {
        this.pushTicker("Mom's Max purchased by You. This is the last time (§10.3).");
        this.pushTicker("MOMCODE_MIKE [OWNER]: You went Max. Respect. (code MOM)");
        this.toast("VIP TIER: MOM'S FAVORITE (full). It unlocks nothing. The house appreciates you.");
      }
      this.setState({streakChip: loadDepositStats().streak});
    });
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
    Bus.emit(EVENTS.SESSION_STARTED, {returning});
    Regime.evaluate(balance);
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
    this.scheduleTicker();
  }

  saveBalance(v){ try{localStorage.setItem("hfes_balance_bb", String(v));}catch(e){} }

  scheduleTicker(){
    const delay = 2000 + Math.random()*2000;
    this._tTimer = setTimeout(()=>{
      const tag = generateTag({avoid:this._recentNames || []});
      this._recentNames = [tag, ...(this._recentNames || [])].slice(0,8);
      const t = WIN_TEMPLATES[Math.floor(Math.random()*WIN_TEMPLATES.length)].replace("{n}", tag);
      this.setState(s=>({ticker:[t, ...s.ticker].slice(0,8)}));
      this.scheduleTicker();
    }, delay);
  }
  componentWillUnmount(){
    clearTimeout(this._tTimer);
    clearInterval(this._crashInt); clearInterval(this._crateInt);
    clearTimeout(this._insTimer); clearInterval(this._idleInt); clearInterval(this._coolInt);
    clearTimeout(this._ocFlyTimer); clearTimeout(this._creditReplayTimer);
    clearTimeout(this._tosDwellT); clearInterval(this._tosTick);
    if (this._offMood) this._offMood();
    if (this._offIdent) this._offIdent();
    if (this._offDeposit) this._offDeposit();
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
      const tag = Identity.playerTag();
      this.setState(s=>({
        flowPhase:"done", tosOpen:false, tosConsent:false, tosNeedsConsent:false, tosAcceptedEver:true,
        ticker:[tag+" joined. The house has been expecting you.", ...s.ticker].slice(0,8),
      }));
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

  togglePanic(){ this.setState(s=>({panicActive:!s.panicActive})); }

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
    Bus.emit(EVENTS.BB_SPENT, {amount, reason});
    Regime.evaluate(nb);
    return true;
  }
  spendBB(surface){ return this.payBB(GAME_PRICES_BB[surface], surface); }

  chatGratuity(amount){
    if (!(this.state.balanceBB >= amount)) return {waived:true};
    const nb = this.state.balanceBB - amount;
    this.setState({balanceBB:nb}); this.saveBalance(nb);
    Bus.emit(EVENTS.BB_SPENT, {amount, reason:"chat-gratuity"});
    Regime.evaluate(nb);
    return {waived:false, amount};
  }

  nextRoundId(){ this._roundSeq = (this._roundSeq||0)+1; return this._roundSeq; }
  settleRound(surface, roundId, kind){
    Bus.emit(EVENTS.ROUND_SETTLED, {surface, roundId, wagered:true, priceBB:GAME_PRICES_BB[surface], netBB:-GAME_PRICES_BB[surface], kind});
  }

  setTab(tab){ this.setState({activeTab:tab}); }

  playRoulette(){
    if (this.state.rouletteSpinning) return;
    if (!this.spendBB("roulette")) return;
    const roundId = this.nextRoundId();
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"roulette", roundId, priceBB:GAME_PRICES_BB.roulette, wagered:true});
    const finalOffset = -(2800 + Math.floor(Math.random()*300));
    this.setState({rouletteSpinning:true, rouletteResult:null, rouletteOffset:0, rouletteTransition:"none"});
    requestAnimationFrame(()=>{
      this.setState({rouletteOffset:finalOffset, rouletteTransition:"transform 5s cubic-bezier(0.12,0.7,0.25,1)"});
    });
    setTimeout(()=>{
      this.setState({rouletteSpinning:false, rouletteResult:"HOUSE WINS: FEE ASSESSED. Better luck never."});
      this.settleRound("roulette", roundId, "house-win");
      this.setState(s=>({ticker:["You lost "+GAME_PRICES_BB.roulette+" BB to the house (shocking)", ...s.ticker].slice(0,8)}));
    }, 5300);
  }

  playCoinflip(){
    if (this.state.coinFlipping) return;
    if (!this.spendBB("coinflip")) return;
    const roundId = this.nextRoundId();
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"coinflip", roundId, priceBB:GAME_PRICES_BB.coinflip, wagered:true});
    this.setState({coinFlipping:true, coinResult:null});
    setTimeout(()=>{
      this.setState({coinFlipping:false, coinResult:"The coin landed on its edge. Tie goes to the server host."});
      this.settleRound("coinflip", roundId, "edge");
      this.setState(s=>({ticker:["AdminTradeBot_69 collects the edge-case bounty", ...s.ticker].slice(0,8)}));
    }, 2000);
  }

  startCrash(){
    if (this.state.crashRunning) return;
    if (!this.spendBB("crash")) return;
    const roundId = this.nextRoundId();
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"crash", roundId, priceBB:GAME_PRICES_BB.crash, wagered:true});
    this.setState({crashRunning:true, crashMult:1.00, crashCrashed:false, crashResult:null, cashoutDodge:0});
    const stopAt = 2000 + Math.random()*4000;
    this._crashInt = setInterval(()=>{
      this.setState(s=>({crashMult: s.crashMult + Math.random()*0.08}));
    }, 100);
    setTimeout(()=>{
      clearInterval(this._crashInt);
      const finalMult = Math.random() < 0.5 ? 0.00 : 1.01;
      this.setState({crashRunning:false, crashCrashed:true, crashMult:finalMult, crashResult:"CRASHED at "+finalMult.toFixed(2)+"x. Cash-out was evaded "+this.state.cashoutDodge+" time(s)."});
      this.settleRound("crash", roundId, "house-win");
      this.setState(s=>({ticker:["The College Fund crashed at "+finalMult.toFixed(2)+"x (as scheduled)", ...s.ticker].slice(0,8)}));
    }, stopAt);
  }
  dodgeCashout(){
    if (!this.state.crashRunning) return;
    this.setState(s=>({cashoutDodge:s.cashoutDodge+1, cashoutDodge2: (s.cashoutDodge+1)}));
    this.setState({cashoutDodge: this.state.cashoutDodge, });
    const dodge = (Math.random()>0.5?1:-1)*(30+Math.random()*40);
    this.setState(s=>({cashoutDodge: dodge}));
  }

  buyKey(){
    if (!this.spendBB("crates")) return;
    this._crateRound = this.nextRoundId();
    Bus.emit(EVENTS.ROUND_STARTED, {surface:"crates", roundId:this._crateRound, priceBB:GAME_PRICES_BB.crates, wagered:true});
    this.setState({crateKeyBought:true});
  }
  openCrate(){
    if (this.state.crateOpening) return;
    this.setState({crateOpening:true, crateProgress:0, crateResult:null});
    const total = (this.props.crateOpenSeconds ?? 15) * 1000;
    const step = 150;
    this._crateInt = setInterval(()=>{
      this.setState(s=>{
        const np = Math.min(100, s.crateProgress + (step/total)*100);
        return {crateProgress:np};
      });
    }, step);
    setTimeout(()=>{
      clearInterval(this._crateInt);
      const awards = ["Generic Stock Photo of Handshake.jpg (Non-Tradeable)","Royalty-Free Sunset Over Water.jpg (Non-Tradeable)","Clip Art of a Trophy.png (Non-Tradeable)","Stock Photo of Confused Businessman.jpg (Non-Tradeable)"];
      const a = awards[Math.floor(Math.random()*awards.length)];
      this.setState({crateOpening:false, crateProgress:100, crateResult:"Crate defused. You received: "+a, crateKeyBought:false});
      this.settleRound("crates", this._crateRound, "key-defused");
      this.setState(s=>({ticker:["A crate was opened. A JPEG was awarded. Nobody won.", ...s.ticker].slice(0,8)}));
    }, total);
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
    Bus.emit(EVENTS.BB_CREDITED, {amount, reason:"askmom-conversion"});
    Regime.evaluate(nb);
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
    this.setState(s=>({ticker:[line, ...s.ticker].slice(0,8)}));
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
      replayCrash: s.crashResult && bb < GAME_PRICES_BB.crash, topUpAndPlayCrash:()=>this.topUpAndPlay("crash"),
      replayCrates: s.crateResult && bb < GAME_PRICES_BB.crates, topUpAndPlayCrates:()=>this.topUpAndPlay("crates"),
      showTicker: this.props.showTicker ?? true,
      showChat: this.props.showChat ?? true,
      ticker:s.ticker,
      chatHooks: { gratuity:(n)=>this.chatGratuity(n) },
      activeTab:s.activeTab, tabBg, tabColor,
      isRoulette: s.activeTab==="roulette", isCoinflip: s.activeTab==="coinflip", isCrash: s.activeTab==="crash", isCrates: s.activeTab==="crates",
      setTab_roulette:()=>this.setTab("roulette"), setTab_coinflip:()=>this.setTab("coinflip"),
      setTab_crash:()=>this.setTab("crash"), setTab_crates:()=>this.setTab("crates"),
      rouletteStrip:ROULETTE_STRIP, rouletteOffset:s.rouletteOffset, rouletteTransition:s.rouletteTransition,
      rouletteSpinning:s.rouletteSpinning, rouletteResult:s.rouletteResult, playRoulette:()=>this.playRoulette(),
      rouletteBtnLabel: s.rouletteSpinning ? "Spinning..." : ("Spin ("+GAME_PRICES_BB.roulette+" BB)"),
      coinFlipping:s.coinFlipping, coinResult:s.coinResult, playCoinflip:()=>this.playCoinflip(),
      coinBtnLabel: s.coinFlipping ? "Flipping..." : ("Flip ("+GAME_PRICES_BB.coinflip+" BB)"),
      coinAnim: s.coinFlipping ? "coinFlip 2s ease-in-out" : "none",
      crashRunning:s.crashRunning, crashResult:s.crashResult, startCrash:()=>this.startCrash(),
      crashStartLabel: s.crashRunning ? "Running..." : ("Start Run ("+GAME_PRICES_BB.crash+" BB)"),
      crashMultDisplay: s.crashMult.toFixed(2)+"x",
      crashColor: s.crashCrashed ? "#ff4444" : "#8fd97a",
      crashBarHeight: Math.min(95, (s.crashMult-1)*40),
      dodgeCashout:()=>this.dodgeCashout(), cashoutDodge:s.cashoutDodge,
      cashoutColor: s.crashRunning ? "#ffcf9a" : "#5a4232",
      crateKeyBought:s.crateKeyBought, buyKey:()=>this.buyKey(),
      crateBtnLabel: "Buy Virtual Key ("+GAME_PRICES_BB.crates+" BB)",
      crateOpening:s.crateOpening, crateProgress:Math.round(s.crateProgress), openCrate:()=>this.openCrate(),
      crateOpenLabel: s.crateOpening ? "Opening... (unskippable)" : "Open Crate",
      crateResult:s.crateResult,
      crateAnim: s.crateOpening ? "pulseGlow 0.6s infinite" : "none",
      catalog
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
              <div style={{borderRight:"2px solid #3a1206",padding:"14px",minHeight:"520px",background:"#170a05"}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"10px"}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#ff3030",animation:"blink 1s infinite"}}></div>
                  <div style={{fontFamily:"'Bangers',cursive",color:"#ff8a3d",fontSize:"14px",letterSpacing:"1px"}}>LIVE WINS</div>
                </div>
                {v.ticker.map((t,i)=>(
                  <div key={i} style={{background:"#241005",border:"1px solid #3a1a0a",borderRadius:"5px",padding:"8px 10px",marginBottom:"7px",fontSize:"11.5px",color:"#e8c9ac",lineHeight:1.4}}>{t}</div>
                ))}
              </div>
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
                    <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"14px"}}>Allowance Roulette</div>
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
                    {v.rouletteResult && (
                      <div style={{marginTop:"12px",background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"10px 14px",color:"#ffcf9a",fontWeight:700,fontSize:"13px"}}>{v.rouletteResult}</div>
                    )}
                    {v.replayRoulette && (
                      <button onClick={v.topUpAndPlayRoulette} style={{marginTop:"10px",background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"2px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"13px",padding:"10px 18px",borderRadius:"8px",cursor:"pointer",animation:"topUpGlow 1.6s infinite"}}>Top Up &amp; Play Again</button>
                    )}
                    <button onClick={v.playRoulette} disabled={v.rouletteSpinning} style={{marginTop:"16px",background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer"}}>{v.rouletteBtnLabel}</button>
                  </div>
                )}

                {v.isCoinflip && (
                  <div>
                    <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"14px"}}>Skin Coinflip</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"40px",padding:"20px 0"}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:"12px",color:v.youColor,fontWeight:800,marginBottom:"6px",maxWidth:"120px",overflowWrap:"anywhere"}}>{v.playerTag || "You"}</div>
                        <div style={{width:"64px",height:"64px",margin:"0 auto",borderRadius:"50%",background:"linear-gradient(160deg,#4a90e2,#2a5fa8)",border:"3px solid #cfe4ff"}}></div>
                      </div>
                      <div style={{perspective:"400px"}}>
                        <div style={{width:"70px",height:"70px",borderRadius:"50%",background:"linear-gradient(160deg,#ffd54a,#c9960a)",border:"3px solid #fff2c9",transformStyle:"preserve-3d",animation:v.coinAnim}}></div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:"12px",color:"#a9705a",marginBottom:"6px"}}>AdminTradeBot_69</div>
                        <div style={{width:"64px",height:"64px",margin:"0 auto",borderRadius:"50%",background:"linear-gradient(160deg,#e24a4a,#a82a2a)",border:"3px solid #ffcfcf"}}></div>
                      </div>
                    </div>
                    {v.coinResult && (
                      <div style={{margin:"6px 0 12px",background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"10px 14px",color:"#ffcf9a",fontWeight:700,fontSize:"13px",textAlign:"center"}}>{v.coinResult}</div>
                    )}
                    {v.replayCoinflip && (
                      <button onClick={v.topUpAndPlayCoinflip} style={{background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"2px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"13px",padding:"10px 18px",borderRadius:"8px",cursor:"pointer",animation:"topUpGlow 1.6s infinite"}}>Top Up &amp; Play Again</button>
                    )}
                    <div style={{textAlign:"center"}}>
                      <button onClick={v.playCoinflip} disabled={v.coinFlipping} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer"}}>{v.coinBtnLabel}</button>
                    </div>
                  </div>
                )}

                {v.isCrash && (
                  <div>
                    <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"14px"}}>College Fund Crash</div>
                    <div style={{position:"relative",height:"160px",border:"2px solid #7a3a1a",borderRadius:"8px",background:"#0e0a06",overflow:"hidden"}}>
                      <div style={{position:"absolute",left:"20px",bottom:"16px",right:"20px",top:"16px"}}>
                        <div style={{position:"absolute",left:0,bottom:0,width:"4px",background:"linear-gradient(#8fd97a,#4aa832)",height:`${v.crashBarHeight}%`,borderRadius:"2px 2px 0 0",transition:"height 0.15s linear"}}></div>
                      </div>
                      <div style={{position:"absolute",right:"16px",top:"14px",fontFamily:"'Bangers',cursive",fontSize:"28px",color:v.crashColor}}>{v.crashMultDisplay}</div>
                    </div>
                    {v.crashResult && (
                      <div style={{marginTop:"12px",background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"10px 14px",color:"#ffcf9a",fontWeight:700,fontSize:"13px"}}>{v.crashResult}</div>
                    )}
                    {v.replayCrash && (
                      <button onClick={v.topUpAndPlayCrash} style={{background:"linear-gradient(180deg,#8fd97a,#3a9a2a)",border:"2px solid #cfe4ff",color:"#0e2a06",fontWeight:900,fontSize:"13px",padding:"10px 18px",borderRadius:"8px",cursor:"pointer",animation:"topUpGlow 1.6s infinite"}}>Top Up &amp; Play Again</button>
                    )}
                    <div style={{display:"flex",gap:"10px",marginTop:"16px"}}>
                      <button onClick={v.startCrash} disabled={v.crashRunning} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer"}}>{v.crashStartLabel}</button>
                      <button onMouseEnter={v.dodgeCashout} onClick={v.dodgeCashout} style={{background:"#3a2010",border:"2px dashed #ff5a14",color:v.cashoutColor,fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer",transform:`translateX(${v.cashoutDodge}px)`}}>Cash Out</button>
                    </div>
                  </div>
                )}

                {v.isCrates && (
                  <div>
                    <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"14px"}}>Loot Crate Defuser</div>
                    <div style={{display:"flex",gap:"24px",alignItems:"center",flexWrap:"wrap"}}>
                      <div style={{width:"120px",height:"100px",background:"repeating-linear-gradient(90deg,#4a3a1a,#4a3a1a 10px,#3a2a10 10px,#3a2a10 20px)",border:"3px solid #7a5a2a",borderRadius:"6px",position:"relative",animation:v.crateAnim}}>
                        <div style={{position:"absolute",inset:"30% 0",height:"14px",background:"#7a5a2a"}}></div>
                      </div>
                      <div style={{flex:1,minWidth:"220px"}}>
                        {!v.crateKeyBought && (
                          <button onClick={v.buyKey} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer"}}>{v.crateBtnLabel}</button>
                        )}
                        {v.crateKeyBought && (
                          <>
                            <button onClick={v.openCrate} disabled={v.crateOpening} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer"}}>{v.crateOpenLabel}</button>
                            {v.crateOpening && (
                              <>
                                <div style={{marginTop:"10px",background:"#0e0a06",borderRadius:"5px",height:"8px",overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${v.crateProgress}%`,background:"linear-gradient(90deg,#ff8a3d,#ffd54a)"}}></div>
                                </div>
                                <div style={{fontSize:"11px",color:"#a9705a",marginTop:"6px"}}>Playing unskippable dubstep drop... {v.crateProgress}% (no, you cannot skip this)</div>
                              </>
                            )}
                          </>
                        )}
                        {v.crateResult && (
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
                <div style={{fontFamily:"'Bangers',cursive",fontSize:"20px",color:"#ffb347",marginBottom:"14px"}}>Marketplace Catalog</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px"}}>
                  {v.catalog.map(item=>(
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
                      <div style={{fontSize:"13px",color:"#8fd97a",fontWeight:800,marginTop:"2px"}}>{item.estimatedValue}</div>
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

        <button onClick={v.togglePanic} style={{position:"fixed",bottom:"20px",right:"20px",background:"#c92020",border:"3px solid #ffcfcf",color:"#fff",fontFamily:"'Bangers',cursive",fontSize:"14px",padding:"14px 18px",borderRadius:"50px",cursor:"pointer",zIndex:100,animation:"pulseGlow 2s infinite",boxShadow:v.momsGlow?"0 0 26px 8px rgba(255,213,74,0.85)":undefined}}>MOM'S HOME</button>

      </div>
    );
  }
}

export default App
