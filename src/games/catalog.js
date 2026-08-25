// Skin catalog — the ten Market-Grade skins, shared by App.jsx's marketplace
// grid and the marketplace engine (#27). Extracted verbatim from App.jsx so the
// pure marketplace modules can read numeric baselines without importing React.
// Canon: docs/spec/marketplace-inventory.md §1/§4. Existing fields (id, name,
// rarity, statTrak, statMetric, estimatedValue, flavorText) are unchanged for
// App.jsx; #27 fields (baseline, wear, short, vol) are additive.

export const RARITY_COLORS = {"Covert Extravagance":"#ff4444","Consumer Grade Trash":"#8a8a8a","Contraband Liability":"#e0a800","Mil-Spec Regret":"#4a90e2","Classified Overdraft":"#a24ae2","Industrial Denial":"#4aa8c9"};

// Tier ladder, cheapest to most extravagant (the Trade-Up Contract's "next
// tier up" walks this list; §8 forbids ever OUTPUTTING the top two).
export const TIER_ORDER = [
  "Consumer Grade Trash",
  "Industrial Denial",
  "Mil-Spec Regret",
  "Classified Overdraft",
  "Contraband Liability",
  "Covert Extravagance",
];

// vol: §4 volatility class — "stable" (±5%), "moody" (±40%), "extreme" (±800%,
// Fruit Roll-Up only). Assignment is a #27 design choice on catalog flavor:
// the AWP (chargebacks pending), Dad's Chair (a volatile vintage), and the
// School WiFi Password (expires in a week) swing; cafeteria staples don't.
export const CATALOG = [
  {id:"skin_01",name:"Tactical Plastic Spork | Minimal Debt",short:"Tactical Plastic Spork",rarity:"Covert Extravagance",statTrak:true,statMetric:"Unpaid Chores: 47",estimatedValue:"$1,420.69",flavorText:"Engineered for maximum cafeteria lunch trade value.",baseline:1420.69,wear:"Minimal Debt",vol:"stable"},
  {id:"skin_02",name:"Default Cardboard Box | Battle-Scarred",short:"Default Cardboard Box",rarity:"Consumer Grade Trash",statTrak:false,statMetric:null,estimatedValue:"$0.02",flavorText:"Smells faintly of basement dampness.",baseline:0.02,wear:"Battle-Scarred",vol:"stable"},
  {id:"skin_03",name:"AWP | Mom's Visa Signature Edition",short:"AWP | Mom's Visa",rarity:"Contraband Liability",statTrak:true,statMetric:"Chargebacks Pending: 3",estimatedValue:"$8,500.00",flavorText:"Comes pre-scratched with the 3-digit CVV on the stock.",baseline:8500.00,wear:"Signature Edition",vol:"moody"},
  {id:"skin_04",name:"Rubber Band Ball | Field-Tested Anxiety",short:"Rubber Band Ball",rarity:"Mil-Spec Regret",statTrak:false,statMetric:null,estimatedValue:"$0.11",flavorText:"Has been rewound 4,000 times out of pure dread.",baseline:0.11,wear:"Field-Tested Anxiety",vol:"stable"},
  {id:"skin_05",name:"Juice Box Straw | Minor Frustration",short:"Juice Box Straw",rarity:"Industrial Denial",statTrak:true,statMetric:"Times Bent: 12",estimatedValue:"$3.40",flavorText:"Bent at a 90 degree angle, permanently unusable.",baseline:3.40,wear:"Minor Frustration",vol:"stable"},
  {id:"skin_06",name:"Dad's Old Gaming Chair | Ergonomic Betrayal",short:"Dad's Old Gaming Chair",rarity:"Classified Overdraft",statTrak:false,statMetric:null,estimatedValue:"$210.00",flavorText:"Still smells like 2014 and disappointment.",baseline:210.00,wear:"Ergonomic Betrayal",vol:"moody"},
  {id:"skin_07",name:"Participation Trophy | Gold Foil Wounded Pride",short:"Participation Trophy",rarity:"Mil-Spec Regret",statTrak:true,statMetric:"Self-Esteem Lost: 89%",estimatedValue:"$16.00",flavorText:"Everyone got one. That's the joke.",baseline:16.00,wear:"Gold Foil Wounded Pride",vol:"stable"},
  {id:"skin_08",name:"Retainer Case | Empty (Lost Retainer Not Included)",short:"Retainer Case",rarity:"Consumer Grade Trash",statTrak:false,statMetric:null,estimatedValue:"$0.75",flavorText:"Orthodontist not affiliated with this listing.",baseline:0.75,wear:"Empty (Lost Retainer Not Included)",vol:"stable"},
  {id:"skin_09",name:"School WiFi Password | Expired Access",short:"School WiFi Password",rarity:"Classified Overdraft",statTrak:true,statMetric:"Blocked Sites Bypassed: 6",estimatedValue:"$4,000.00",flavorText:"Works for exactly one (1) more week.",baseline:4000.00,wear:"Expired Access",vol:"moody"},
  {id:"skin_10",name:"Half-Eaten Fruit Roll-Up | Sticky Legendary",short:"Half-Eaten Fruit Roll-Up",rarity:"Covert Extravagance",statTrak:false,statMetric:null,estimatedValue:"$999.99",flavorText:"Preserved in its original wrapper for authenticity.",baseline:999.99,wear:"Sticky Legendary",vol:"extreme"},
];

export const WORST_WEAR = "Battle-Scarred Anxiety"; // appraisal floor (§1: wear worsens, never improves)

export function catalogById(id) { return CATALOG.find((c) => c.id === id) || null; }

export function parseUSD(str) {
  const n = parseFloat(String(str ?? "").replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function fmtUSD(n) {
  const v = Number.isFinite(n) ? n : 0;
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---- deterministic per-uid randomness (same hash family as mood/identity) ----
export function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Float Value (verified by nobody) — 10 decimal places, deterministic from uid.
export function floatFor(uid) {
  return +(mulberry32(hashString("float#" + uid))()).toFixed(10);
}

// ---- award classification (two classes per spec §1) ----
// Market-Grade: the ten catalog skins. Awards classify by exact/short name, then
// by catalog-priced value (roulette's junk items carry rarity-tier names but
// catalog-priced values: $0.75/$3.40/$0.11 are unique in the catalog).
// Everything else — every .jpg/.png from crates and the coinflip stash — is a
// Digital Asset: non-sellable, non-listable, non-contractible.
export function classifyAward(item) {
  if (!item) return { itemClass: "digital-asset", catalogId: null };
  if (item.receipt) return { itemClass: "receipt", catalogId: null };
  const name = String(item.name || "");
  let cat = CATALOG.find((c) => c.name === name) || CATALOG.find((c) => c.short === name);
  if (!cat) {
    const num = parseUSD(item.value);
    if (num !== null) cat = CATALOG.find((c) => Math.abs(c.baseline - num) < 0.005);
  }
  if (cat) return { itemClass: "market-grade", catalogId: cat.id };
  return { itemClass: "digital-asset", catalogId: null };
}

// Provenance acquisition lines (spec §1 — copy locked; contract/receipt lines
// are #27 additions in the same voice).
export function acquisitionLine(source) {
  if (source === "market-purchase") return "Acquired: marketplace purchase (receipt available, refund not)";
  if (source === "trade-up") return "Acquired: Trade-Up Contract (five regrets, consolidated)";
  if (source === "rollback-receipt") return "Removed by Rollback Event (see Market Event Receipt)";
  return "Acquired: fake win (game was conducted per §4.1; you're welcome)";
}

// Hydrate a raw inventory entry into a full holding (§1 field table). Idempotent:
// already-modeled entries pass through untouched. Legacy sessions from #23/#24
// upgrade in place, deterministically from their minted uid.
export function hydrateHeld(entry) {
  if (!entry || entry.itemClass) return entry;
  const cls = classifyAward(entry);
  const out = {
    ...entry,
    itemClass: cls.itemClass,
    catalogId: cls.catalogId,
    provenance: Array.isArray(entry.provenance) ? [...entry.provenance] : [],
  };
  if (cls.itemClass === "market-grade") {
    const cat = catalogById(cls.catalogId);
    out.float = typeof entry.float === "number" ? entry.float : floatFor(entry.id);
    out.wear = entry.wear || (cat.wear + " (Certified Pre-Worse™)");
    out.statTrak = !!cat.statTrak;
    if (cat.statTrak) {
      const parts = String(cat.statMetric || "").split(":");
      out.statLabel = parts[0].trim();
      out.statCount = parseInt(parts[1], 10) || 0;
    }
    if (!out.provenance.length) out.provenance.push(acquisitionLine(entry.source));
  }
  return out;
}
