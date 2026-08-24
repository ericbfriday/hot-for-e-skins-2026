import React from 'react'

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
const ROULETTE_STRIP = Array.from({length:20},(_,i)=>{const it=CATALOG[i%CATALOG.length];return {short:it.name.split("|")[0].trim(),color:RARITY_COLORS[it.rarity]||"#ff8a3d"};});

class App extends React.Component {
  state = {
    ageVerified:false, confettiOn:false, confettiPieces:[],
    tosOpen:false, panicActive:false,
    activeTab:"roulette", balanceBB:0.0004, insufficientMsg:null,
    ticker:[], chat:[],
    rouletteSpinning:false, rouletteOffset:0, rouletteTransition:"none", rouletteResult:null,
    coinFlipping:false, coinResult:null,
    crashRunning:false, crashMult:1.00, crashCrashed:false, crashResult:null, cashoutDodge:0,
    crateKeyBought:false, crateOpening:false, crateProgress:0, crateResult:null
  };

  componentDidMount() {
    try {
      const saved = localStorage.getItem("hfes_balance");
      const age = localStorage.getItem("hfes_age");
      if (saved) this.setState({balanceBB: parseFloat(saved)});
      if (age === "1") this.setState({ageVerified:true});
    } catch(e){}
    this.scheduleTicker();
    this.scheduleChat();
  }

  saveBalance(v){ try{localStorage.setItem("hfes_balance", String(v));}catch(e){} }

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
  }

  usdToBB(usd){ return usd*0.003; }

  verify(){
    try{ localStorage.setItem("hfes_age","1"); }catch(e){}
    const pieces = Array.from({length:24},()=>({left:Math.random()*100,color:["#ff5a14","#ffd54a","#8fd97a","#4a90e2"][Math.floor(Math.random()*4)],dur:1+Math.random(),delay:Math.random()*0.4}));
    this.setState({ageVerified:true, confettiOn:true, confettiPieces:pieces});
    setTimeout(()=>this.setState({confettiOn:false}), 1600);
  }

  toggleTos(){ this.setState(s=>({tosOpen:!s.tosOpen})); }
  togglePanic(){ this.setState(s=>({panicActive:!s.panicActive})); }

  flashInsufficient(){
    this.setState({insufficientMsg:"Insufficient Banana Bucks. Please ask Mom (see Terms of Service, Section 1.3)."});
    setTimeout(()=>this.setState({insufficientMsg:null}), 2600);
  }

  spendUSD(usd){
    const cost = this.usdToBB(usd);
    if (this.state.balanceBB < cost){ this.flashInsufficient(); return false; }
    const nb = this.state.balanceBB - cost;
    this.setState({balanceBB:nb}); this.saveBalance(nb);
    return true;
  }

  setTab(tab){ this.setState({activeTab:tab}); }

  playRoulette(){
    if (this.state.rouletteSpinning) return;
    if (!this.spendUSD(2.50)) return;
    const finalOffset = -(2800 + Math.floor(Math.random()*300));
    this.setState({rouletteSpinning:true, rouletteResult:null, rouletteOffset:0, rouletteTransition:"none"});
    requestAnimationFrame(()=>{
      this.setState({rouletteOffset:finalOffset, rouletteTransition:"transform 5s cubic-bezier(0.12,0.7,0.25,1)"});
    });
    setTimeout(()=>{
      this.setState({rouletteSpinning:false, rouletteResult:"HOUSE WINS: FEE ASSESSED. Better luck never."});
      this.setState(s=>({ticker:["You lost $2.50 to the house (shocking)", ...s.ticker].slice(0,8)}));
    }, 5300);
  }

  playCoinflip(){
    if (this.state.coinFlipping) return;
    if (!this.spendUSD(1.00)) return;
    this.setState({coinFlipping:true, coinResult:null});
    setTimeout(()=>{
      this.setState({coinFlipping:false, coinResult:"The coin landed on its edge. Tie goes to the server host."});
      this.setState(s=>({ticker:["Admin_TradeBot_69 collects the edge-case bounty", ...s.ticker].slice(0,8)}));
    }, 2000);
  }

  startCrash(){
    if (this.state.crashRunning) return;
    if (!this.spendUSD(5.00)) return;
    this.setState({crashRunning:true, crashMult:1.00, crashCrashed:false, crashResult:null, cashoutDodge:0});
    const stopAt = 2000 + Math.random()*4000;
    this._crashInt = setInterval(()=>{
      this.setState(s=>({crashMult: s.crashMult + Math.random()*0.08}));
    }, 100);
    setTimeout(()=>{
      clearInterval(this._crashInt);
      const finalMult = Math.random() < 0.5 ? 0.00 : 1.01;
      this.setState({crashRunning:false, crashCrashed:true, crashMult:finalMult, crashResult:"CRASHED at "+finalMult.toFixed(2)+"x. Cash-out was evaded "+this.state.cashoutDodge+" time(s)."});
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
    if (!this.spendUSD(4.99)) return;
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
      this.setState(s=>({ticker:["A crate was opened. A JPEG was awarded. Nobody won.", ...s.ticker].slice(0,8)}));
    }, total);
  }

  renderVals(){
    const s = this.state;
    const bb = s.balanceBB;
    const usd = bb/0.003, sc = bb*(1.7/0.003), vg = bb*(120/0.003);
    const tabs = ["roulette","coinflip","crash","crates"];
    const tabBg = {}, tabColor = {};
    tabs.forEach(t=>{ const on = s.activeTab===t; tabBg[t]= on ? "linear-gradient(160deg,#3a1206,#2a0d05)" : "#1a0d05"; tabColor[t]= on ? "#ffb347" : "#a9705a"; });
    const catalog = CATALOG.map(it=>({...it, rarityColor: RARITY_COLORS[it.rarity]||"#ff8a3d"}));
    return {
      ageVerified:s.ageVerified, confettiOn:s.confettiOn, confettiPieces:s.confettiPieces, verify:()=>this.verify(),
      tosOpen:s.tosOpen, toggleTos:()=>this.toggleTos(),
      panicActive:s.panicActive, togglePanic:()=>this.togglePanic(),
      mainBlurFilter: s.panicActive ? "blur(4px)" : "none",
      usdDisplay:"$"+usd.toFixed(2), vgDisplay:vg.toFixed(1), scDisplay:sc.toFixed(4), bbDisplay:bb.toFixed(4),
      insufficientMsg:s.insufficientMsg,
      showTicker: this.props.showTicker ?? true,
      showChat: this.props.showChat ?? true,
      ticker:s.ticker, chat:s.chat,
      activeTab:s.activeTab, tabBg, tabColor,
      isRoulette: s.activeTab==="roulette", isCoinflip: s.activeTab==="coinflip", isCrash: s.activeTab==="crash", isCrates: s.activeTab==="crates",
      setTab_roulette:()=>this.setTab("roulette"), setTab_coinflip:()=>this.setTab("coinflip"),
      setTab_crash:()=>this.setTab("crash"), setTab_crates:()=>this.setTab("crates"),
      rouletteStrip:ROULETTE_STRIP, rouletteOffset:s.rouletteOffset, rouletteTransition:s.rouletteTransition,
      rouletteSpinning:s.rouletteSpinning, rouletteResult:s.rouletteResult, playRoulette:()=>this.playRoulette(),
      rouletteBtnLabel: s.rouletteSpinning ? "Spinning..." : "Spin ($2.50)",
      coinFlipping:s.coinFlipping, coinResult:s.coinResult, playCoinflip:()=>this.playCoinflip(),
      coinBtnLabel: s.coinFlipping ? "Flipping..." : "Flip ($1.00)",
      coinAnim: s.coinFlipping ? "coinFlip 2s ease-in-out" : "none",
      crashRunning:s.crashRunning, crashResult:s.crashResult, startCrash:()=>this.startCrash(),
      crashStartLabel: s.crashRunning ? "Running..." : "Start Run ($5.00)",
      crashMultDisplay: s.crashMult.toFixed(2)+"x",
      crashColor: s.crashCrashed ? "#ff4444" : "#8fd97a",
      crashBarHeight: Math.min(95, (s.crashMult-1)*40),
      dodgeCashout:()=>this.dodgeCashout(), cashoutDodge:s.cashoutDodge,
      cashoutColor: s.crashRunning ? "#ffcf9a" : "#5a4232",
      crateKeyBought:s.crateKeyBought, buyKey:()=>this.buyKey(),
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
              <p style={{lineHeight:1.7,fontSize:"15px"}}>In mathematics, a <b>linear equation</b> is an equation that may be put in the form <i>a<sub>1</sub>x<sub>1</sub> + ... + a<sub>n</sub>x<sub>n</sub> + b = 0</i>, where <i>x<sub>1</sub>, ..., x<sub>n</sub></i> are the variables, and <i>b, a<sub>1</sub>, ..., a<sub>n</sub></i> are the coefficients, which are often real numbers.</p>
              <p style={{lineHeight:1.7,fontSize:"15px"}}>The most common form is the <b>slope-intercept form</b>, written as <i>y = mx + b</i>, where <i>m</i> is the slope of the line and <i>b</i> is the y-intercept.</p>
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
            <div style={{display:"flex",gap:"10px",flexWrap:"wrap",fontSize:"12px"}}>
              <div style={{background:"#0e0a06",border:"1px solid #ff8a3d",borderRadius:"6px",padding:"7px 12px"}}><span style={{color:"#8a6a52"}}>USD</span> <b style={{color:"#ffe9d6"}}>{v.usdDisplay}</b></div>
              <div style={{background:"#0e0a06",border:"1px solid #ff8a3d",borderRadius:"6px",padding:"7px 12px"}}><span style={{color:"#8a6a52"}}>V-Gems</span> <b style={{color:"#ffe9d6"}}>{v.vgDisplay}</b></div>
              <div style={{background:"#0e0a06",border:"1px solid #ff8a3d",borderRadius:"6px",padding:"7px 12px"}}><span style={{color:"#8a6a52"}}>SkinCoinz</span> <b style={{color:"#ffe9d6"}}>{v.scDisplay}</b></div>
              <div style={{background:"#0e0a06",border:"1px solid #ffb347",borderRadius:"6px",padding:"7px 12px"}}><span style={{color:"#8a6a52"}}>Banana Bucks</span> <b style={{color:"#ffb347"}}>{v.bbDisplay}</b></div>
            </div>
          </div>

          {v.insufficientMsg && (
            <div style={{background:"#5a1a0a",color:"#ffcf9a",textAlign:"center",fontSize:"13px",padding:"8px",fontWeight:700}}>{v.insufficientMsg}</div>
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
                            <div style={{width:"100%",height:"38px",background:`repeating-linear-gradient(45deg,${s.color}22,${s.color}22 4px,transparent 4px,transparent 8px)`,borderRadius:"3px",marginBottom:"5px"}}></div>
                            <div style={{fontSize:"9px",color:"#e8c9ac",lineHeight:1.2}}>{s.short}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {v.rouletteResult && (
                      <div style={{marginTop:"12px",background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"10px 14px",color:"#ffcf9a",fontWeight:700,fontSize:"13px"}}>{v.rouletteResult}</div>
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
                        <div style={{fontSize:"12px",color:"#a9705a",marginBottom:"6px"}}>Admin_TradeBot_69</div>
                        <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"linear-gradient(160deg,#e24a4a,#a82a2a)",border:"3px solid #ffcfcf"}}></div>
                      </div>
                    </div>
                    {v.coinResult && (
                      <div style={{margin:"6px 0 12px",background:"#5a1a0a",border:"1px solid #ff5a14",borderRadius:"6px",padding:"10px 14px",color:"#ffcf9a",fontWeight:700,fontSize:"13px",textAlign:"center"}}>{v.coinResult}</div>
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
                          <button onClick={v.buyKey} style={{background:"linear-gradient(180deg,#ff8a3d,#e0480a)",border:"2px solid #ffcf9a",color:"#2a0e05",fontWeight:900,fontSize:"14px",padding:"12px 22px",borderRadius:"8px",cursor:"pointer"}}>Buy Virtual Key ($4.99)</button>
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
                      <div style={{width:"100%",height:"70px",borderRadius:"5px",background:`repeating-linear-gradient(45deg,${item.rarityColor}22,${item.rarityColor}22 6px,transparent 6px,transparent 12px)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:"#8a6a52",fontFamily:"monospace"}}>item render pending</div>
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

        <button onClick={v.togglePanic} style={{position:"fixed",bottom:"20px",right:"20px",background:"#c92020",border:"3px solid #ffcfcf",color:"#fff",fontFamily:"'Bangers',cursive",fontSize:"14px",padding:"14px 18px",borderRadius:"50px",cursor:"pointer",zIndex:100,animation:"pulseGlow 2s infinite"}}>MOM'S HOME</button>

      </div>
    );
  }
}

export default App
