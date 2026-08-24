import React from 'react'
import { Mood } from "./spine/mood.js";
import { Bus, EVENTS, Regime } from "./spine/bus.js";
import "./spine/vault.js";
import "./spine/band.js";
import AskMomFlow from "./askmom/AskMomFlow.jsx";
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

const NAMES = ["xX_QuickScope_Xx","yeetmaster3000","Timmy_Investor","sk8rboi_2009","GrandmasCreditCard","DiscordModReal","EpicGamerMom","BasementDweller44","QuickscopeQueen","NotABot_Trust","AllowanceLaundry","JuiceBoxJunkie"];
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
const CHAT_LINES = [
  {user:"MOD_Chad_Official", msg:"remember to deposit responsibly!! (deposit more)", color:"#8fd97a"},
  {user:"xX_QuickScope_Xx", msg:"just won huge trust me bro", color:"#ff8a3d"},
  {user:"TotallyRealUser42", msg:"is this site legit? asking for a minor", color:"#e8c9ac"},
  {user:"AdminTradeBot_69", msg:"gg no re", color:"#e24a4a"},
  {user:"yeetmaster3000", msg:"my mom found my card statement send help", color:"#e8c9ac"},
  {user:"NotABot_Trust", msg:"BUY KEYS BUY KEYS BUY KEYS", color:"#ffd54a"},
  {user:"GrandmasCreditCard", msg:"who keeps charging $4.99 to this card", color:"#e8c9ac"}
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

function fmtBB(bb){
  if (!Number.isFinite(bb)) return "0";
  return String(parseFloat(bb.toFixed(2)));
}

class App extends React.Component {
  state = {
    ageVerified:false, confettiOn:false, confettiPieces:[],
    tosOpen:false, panicActive:false,
    activeTab:"roulette", balanceBB:MATERNAL_STARTER_GRANT_BB, insufficientMsg:null, sessionSpendFailures:0,
    moodWord:null, denomsOpen:false,
    balanceOC:0, bonusOC:null, askmom:null, toasts:[], ocFly:null, cooldown:null, streakChip:null, abandonedCount:0,
    ticker:[], chat:[],
    rouletteSpinning:false, rouletteOffset:0, rouletteTransition:"none", rouletteResult:null,
    coinFlipping:false, coinResult:null,
    crashRunning:false, crashMult:1.00, crashCrashed:false, crashResult:null, cashoutDodge:0,
    crateKeyBought:false, crateOpening:false, crateProgress:0, crateResult:null
  };

  componentDidMount() {
    let balance = MATERNAL_STARTER_GRANT_BB;
    let returning = false;
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
      if (age === "1") this.setState({ageVerified:true});
    } catch(e){}
    let oc = loadOC();
    let bonus = loadBonus();
    if (bonus && Date.now() >= bonus.expiresAt) {
      const expired = bonus.amount;
      clearBonus(); bonus = null;
      setTimeout(()=>this.toast("Your "+expired+" Bonus OC expired as scheduled (§2.3). They are survived by nothing."), 900);
    }
    this.setState({balanceOC:oc, bonusOC:bonus, streakChip: loadDepositStats().streak});
    this._offMood = Mood.onChange(({word})=>{
      this.setState({moodWord:word});
      const b = this.state.bonusOC;
      if (b && Date.now() >= b.expiresAt) {
        clearBonus();
        this.setState({bonusOC:null});
        this.toast("Your "+b.amount+" Bonus OC expired as scheduled (§2.3). They are survived by nothing.");
      }
    });
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
    this.scheduleTicker();
    this.scheduleChat();
  }

  saveBalance(v){ try{localStorage.setItem("hfes_balance_bb", String(v));}catch(e){} }

  scheduleTicker(){
    const delay = 2000 + Math.random()*2000;
    this._tTimer = setTimeout(()=>{
      const n = NAMES[Math.floor(Math.random()*NAMES.length)];
      const t = WIN_TEMPLATES[Math.floor(Math.random()*WIN_TEMPLATES.length)].replace("{n}", n);
      this.setState(s=>({ticker:[t, ...s.ticker].slice(0,8)}));
      this.scheduleTicker();
    }, delay);
  }
  scheduleChat(){
    const delay = 4500 + Math.random()*3500;
    this._cTimer = setTimeout(()=>{
      const c = CHAT_LINES[Math.floor(Math.random()*CHAT_LINES.length)];
      this.setState(s=>({chat:[c, ...s.chat].slice(0,6)}));
      this.scheduleChat();
    }, delay);
  }
  componentWillUnmount(){
    clearTimeout(this._tTimer); clearTimeout(this._cTimer);
    clearInterval(this._crashInt); clearInterval(this._crateInt);
    clearTimeout(this._insTimer); clearInterval(this._idleInt); clearInterval(this._coolInt);
    clearTimeout(this._ocFlyTimer); clearTimeout(this._creditReplayTimer);
    if (this._offMood) this._offMood();
    if (this._offDeposit) this._offDeposit();
    if (this._activity) {
      window.removeEventListener("pointerdown", this._activity);
      window.removeEventListener("keydown", this._activity);
      window.removeEventListener("wheel", this._activity);
    }
  }

  verify(){
    try{ localStorage.setItem("hfes_age","1"); }catch(e){}
    const pieces = Array.from({length:24},()=>({left:Math.random()*100,color:["#ff5a14","#ffd54a","#8fd97a","#4a90e2"][Math.floor(Math.random()*4)],dur:1+Math.random(),delay:Math.random()*0.4}));
    this.setState({ageVerified:true, confettiOn:true, confettiPieces:pieces});
    setTimeout(()=>this.setState({confettiOn:false}), 1600);
  }

  toggleTos(){ this.setState(s=>({tosOpen:!s.tosOpen})); }
  togglePanic(){ this.setState(s=>({panicActive:!s.panicActive})); }

  flashInsufficient(failures){
    this.setState({insufficientMsg: failures >= 3 ? INSUFFICIENT_FUNDS_ESCALATION_COPY : INSUFFICIENT_FUNDS_COPY});
    clearTimeout(this._insTimer);
    this._insTimer = setTimeout(()=>this.setState({insufficientMsg:null}), 2600);
  }

  spendBB(surface){
    const cost = GAME_PRICES_BB[surface];
    if (!(this.state.balanceBB >= cost)) {
      const n = this.state.sessionSpendFailures + 1;
      this.setState({sessionSpendFailures:n});
      this.flashInsufficient(n);
      Bus.emit(EVENTS.SPEND_FAILED, {surface, costBB:cost, sessionFailures:n});
      return false;
    }
    const nb = this.state.balanceBB - cost;
    this.setState({balanceBB:nb}); this.saveBalance(nb);
    Bus.emit(EVENTS.BB_SPENT, {amount:cost, reason:surface});
    Regime.evaluate(nb);
    return true;
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
    this.setState(s=>({toasts:[...s.toasts, {id, text, actionLabel:opts.actionLabel, onAction:opts.onAction}].slice(-4)}));
    setTimeout(()=>this.setState(s=>({toasts:s.toasts.filter(t=>t.id!==id)})), 4800);
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
    return {
      ageVerified:s.ageVerified, confettiOn:s.confettiOn, confettiPieces:s.confettiPieces, verify:()=>this.verify(),
      tosOpen:s.tosOpen, toggleTos:()=>this.toggleTos(),
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
      askmom: s.askmom, panicActive:s.panicActive,
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
      ticker:s.ticker, chat:s.chat,
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
    return (
      <div style={{fontFamily:"Arial,Helvetica,sans-serif",background:"radial-gradient(circle at 50% -10%,#3a1206,#160805 60%)",minHeight:"100vh",color:"#ffe9d6",position:"relative"}}>

        {!v.ageVerified && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
            <div style={{background:"linear-gradient(160deg,#2a0e05,#4a1707)",border:"3px solid #ff5a14",borderRadius:"10px",maxWidth:"460px",padding:"32px",textAlign:"center",boxShadow:"0 0 60px rgba(255,80,20,0.4)"}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:"34px",color:"#ffb347",letterSpacing:"1px",textShadow:"2px 2px 0 #7a1c00"}}>AGE VERIFICATION REQUIRED</div>
              <p style={{color:"#ffd9b3",fontSize:"15px",lineHeight:1.5,margin:"16px 0 24px"}}>By law (the law of vibes), you must confirm your eligibility before accessing real-money-adjacent gambling-flavored entertainment.</p>
              <button onClick={v.verify} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"15px",padding:"14px 20px",borderRadius:"8px",cursor:"pointer",width:"100%"}}>I am 18+, or my older brother is in the other room and said it's fine.</button>
              <div style={{marginTop:"16px",fontSize:"10px",color:"#a9705a",lineHeight:1.5}}>This is a satirical parody. No real money, currency, or skins exist here. Nothing on this page has value. Please, for the love of god, log off.</div>
            </div>
            {v.confettiOn && (
              <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}>
                {v.confettiPieces.map((p,i)=>(
                  <div key={i} style={{position:"absolute",top:0,left:`${p.left}%`,width:"8px",height:"14px",background:p.color,animation:`confettiFall ${p.dur}s ease-in ${p.delay}s forwards`}}></div>
                ))}
              </div>
            )}
          </div>
        )}

        {v.tosOpen && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
            <div style={{background:"#1c0d06",border:"2px solid #7a3a1a",borderRadius:"8px",maxWidth:"560px",maxHeight:"80vh",overflow:"auto",padding:"28px",fontSize:"13px",color:"#d8b79b",lineHeight:1.6}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:"24px",color:"#ff8a3d",marginBottom:"14px"}}>Terms of Service (Excerpts)</div>
              <p><b style={{color:"#ffb347"}}>Section 1.3 (Identity Verification):</b> To execute a balance withdrawal exceeding $0.00, users must upload a notarized copy of their 4th-grade report card, a signed handwritten letter from their guidance counselor, and physical delivery of three (3) unopened energy drink cans to our P.O. Box in Grand Cayman.</p>
              <p><b style={{color:"#ffb347"}}>Section 4.1 (Dispute Resolution):</b> All claims, disputes, or losses shall be resolved not in a court of law, but via a mandatory 1v1 Quickscope Match on Rust (Radar Always On, Intervention Only). If the User loses, their account balance is permanently forfeited to site operational overhead.</p>
              <p><b style={{color:"#ffb347"}}>Section 8.9 (Currency Volatility):</b> SkinCoinz and Banana Bucks hold no real-world monetary value, spiritual value, or intrinsic utility, and may be recalculated at any time based on the server admin's daily mood.</p>
              <button onClick={v.toggleTos} style={{marginTop:"10px",background:"#ff5a14",border:"none",color:"#2a0e05",fontWeight:800,padding:"10px 18px",borderRadius:"6px",cursor:"pointer"}}>Close (reluctantly)</button>
            </div>
          </div>
        )}

        {v.panicActive && (
          <div style={{position:"fixed",inset:0,background:"#fff",color:"#202122",zIndex:300,overflow:"auto",fontFamily:"Georgia,serif",padding:"40px 60px"}}>
            <div style={{maxWidth:"720px",margin:"0 auto"}}>
              <div style={{fontSize:"12px",color:"#3366cc",marginBottom:"10px"}}>Wikipedia, the free encyclopedia</div>
              <h1 style={{fontFamily:"Georgia,serif",fontWeight:400,borderBottom:"1px solid #a2a9b1",paddingBottom:"6px"}}>Linear equation</h1>
              <p style={{lineHeight:1.7,fontSize:"15px"}}>In mathematics, an <b>linear equation</b> is an equation that may be put in the form <i>a<sub>1</sub>x<sub>1</sub> + ... + a<sub>n</sub>x<sub>n</sub> + b = 0</i>, where <i>x<sub>1</sub>, ..., x<sub>n</sub></i> are the variables, and <i>b, a<sub>1</sub>, ..., a<sub>n</sub></i> are the coefficients, which are often real numbers.</p>
              <p style={{lineHeight:1.7,fontSize:"15px"}}>The most common form is the <b>slope-intercept form</b>, written as <i>y = mx + b</i>, where <i>m</i> is the slope and <i>b</i> is the y-intercept.</p>
              <h2 style={{fontFamily:"Georgia,serif",fontWeight:400,borderBottom:"1px solid #a2a9b1",paddingBottom:"6px"}}>Contents</h2>
              <p style={{lineHeight:1.7,fontSize:"15px",color:"#54595d"}}>1 Forms &nbsp; 2 Graphing &nbsp; 3 Systems &nbsp; 4 See also</p>
              <button onClick={v.togglePanic} style={{marginTop:"20px",background:"#eee",border:"1px solid #ccc",padding:"10px 16px",borderRadius:"4px",cursor:"pointer",fontFamily:"Arial"}}>Close (she's gone)</button>
            </div>
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
                        <div style={{fontSize:"12px",color:"#a9705a",marginBottom:"6px"}}>You</div>
                        <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"linear-gradient(160deg,#4a90e2,#2a5fa8)",border:"3px solid #cfe4ff"}}></div>
                      </div>
                      <div style={{perspective:"400px"}}>
                        <div style={{width:"70px",height:"70px",borderRadius:"50%",background:"linear-gradient(160deg,#ffd54a,#c9960a)",border:"3px solid #fff2c9",transformStyle:"preserve-3d",animation:v.coinAnim}}></div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:"12px",color:"#a9705a",marginBottom:"6px"}}>AdminTradeBot_69</div>
                        <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"linear-gradient(160deg,#e24a4a,#a82a2a)",border:"3px solid #ffcfcf"}}></div>
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
              <div>
                <div style={{fontFamily:"'Bangers',cursive",color:"#ff8a3d",fontSize:"13px",marginBottom:"8px",letterSpacing:"0.5px"}}>LIVE CHAT (847 online)</div>
                <div style={{background:"#0e0a06",border:"1px solid #3a2a1a",borderRadius:"6px",padding:"10px",maxHeight:"130px",overflow:"hidden"}}>
                  {v.chat.map((c,i)=>(
                    <div key={i} style={{fontSize:"11px",color:"#c9a888",marginBottom:"5px"}}><b style={{color:c.color}}>{c.user}:</b> {c.msg}</div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"10px"}}>
                <div style={{border:"1px solid #4a6a3a",borderRadius:"4px",padding:"5px 9px",fontSize:"9px",color:"#8fd97a",background:"#0e0a06"}}>SSL SECURED*</div>
                <div style={{border:"1px solid #4a6a3a",borderRadius:"4px",padding:"5px 9px",fontSize:"9px",color:"#8fd97a",background:"#0e0a06"}}>AGE VERIFIED*</div>
                <div style={{border:"1px solid #4a6a3a",borderRadius:"4px",padding:"5px 9px",fontSize:"9px",color:"#8fd97a",background:"#0e0a06"}}>CERTIFIED FAIR*</div>
              </div>
              <button onClick={v.toggleTos} style={{background:"none",border:"none",color:"#a9705a",fontSize:"11px",textDecoration:"underline",cursor:"pointer",padding:0,display:"block",marginBottom:"8px"}}>Terms of Service (please don't read this)</button>
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
              </div>
            ))}
          </div>
        )}

        {v.askmom && (
          <AskMomFlow source={v.askmom.source} enterStage={v.askmom.enterStage} panicActive={v.panicActive} hooks={v.askmomHooks} />
        )}

        <button onClick={v.togglePanic} style={{position:"fixed",bottom:"20px",right:"20px",background:"#c92020",border:"3px solid #ffcfcf",color:"#fff",fontFamily:"'Bangers',cursive",fontSize:"14px",padding:"14px 18px",borderRadius:"50px",cursor:"pointer",zIndex:100,animation:"pulseGlow 2s infinite"}}>MOM'S HOME</button>

      </div>
    );
  }
}

export default App
