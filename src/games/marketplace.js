// Marketplace & Inventory — engine + stores (#27).
// Canon: docs/spec/marketplace-inventory.md. Pure math where possible
// (volatility, HFES-10, quotes, offers) plus the four persisted stores the
// spec names (§11: hfes_escrow, hfes_portfolio_high, hfes_listings,
// hfes_rollback_last — plus hfes_sold_ledger for the Sold Ledger section).
// All "random" market behavior derives from deterministic seeds (item, hour,
// date) — same for everyone, same on reload, rigged by construction and still
// blameless ("it's in the seed").
import { Bus, EVENTS } from "../spine/bus.js";
import { Mood } from "../spine/mood.js";
import { HouseBand, BAND_PRIORITIES } from "../spine/band.js";
import { Inventory } from "./inventory.js";
import { AWARD_POOL } from "./crates.js";
import {
  CATALOG, TIER_ORDER, WORST_WEAR, catalogById, hashString, mulberry32, fmtUSD, floatFor,
} from "./catalog.js";

const ESCROW_KEY = "hfes_escrow";
const PORTFOLIO_KEY = "hfes_portfolio_high";
const LISTINGS_KEY = "hfes_listings";
const ROLLBACK_KEY = "hfes_rollback_last";
const SOLD_KEY = "hfes_sold_ledger";

export const TRADE_HOLD_LABEL = "Trade Hold: 8 days (0 hours elapsed)"; // perpetual; the elapsed counter never increments
export const INSTANT_SELL_SUBLIE = "Offer reflects current market liquidity, our mood, and §8.9.";
export const DIGITAL_ASSET_VALUE = "Priceless (est. value: emotional)";
export const DIGITAL_ASSET_SECTION = "Digital Assets (Non-Tradeable, Non-Refundable, Non-Why)";
export const DIGITAL_ASSET_SELL_TOOLTIP = "This asset cannot be traded because it is worthless. A rare consistency from us.";
export const RECEIPT_FLAVOR = "Ownership recalculated per §8.9. The item is fine. You can't see it anymore, but it's fine.";
export const MARKET_OC_NOTICE = "The Marketplace does not accept Obtuse Credits™. Convert first (see §8.9).";
export const ESTIMATE_FOOTER = "Estimate updated per §8.9.";
export const PORTFOLIO_HOVER = "This figure is load-bearing. It carries the whole joke.";
export const HFES10_FOOTNOTE = "The HFES-10 has never gone down. Neither has anyone's opinion of us.";

function loadJSON(key, dflt) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    return v === null ? dflt : v;
  } catch (e) { return dflt; }
}
function saveJSON(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
}
function loadNum(key) {
  const v = parseFloat(loadJSON(key, 0));
  return Number.isFinite(v) && v >= 0 ? v : 0;
}
function mint(prefix) { return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000); }

// ---- §4 volatility ------------------------------------------------------------
// Classes per spec: Stable-ish ±5%, Moody ±40%, the Fruit Roll-Up ±800%
// (vol ∈ [0.1, 9.0]; some hours it costs ~27,000 BB). Deterministic per
// (item, hour, date) — the whole site agrees on today's price of everything.
export const VOL_CLASSES = {
  stable: { min: 0.95, max: 1.05, label: "Stable-ish ±5%" },
  moody: { min: 0.6, max: 1.4, label: "Moody ±40%" },
  extreme: { min: 0.1, max: 9.0, label: "±800% (Fruit Roll-Up clause)" },
};
export function volFactor(itemId, now = new Date()) {
  const cat = catalogById(itemId);
  const cls = VOL_CLASSES[(cat && cat.vol) || "stable"];
  const rng = mulberry32(hashString(Mood.seed(now) + "#vol#" + itemId + "#" + now.getHours()));
  return cls.min + rng() * (cls.max - cls.min);
}
export function currentEst(itemId, now = new Date()) {
  const cat = catalogById(itemId);
  return cat ? cat.baseline * volFactor(itemId, now) : 0;
}

// ---- §10 HFES-10 Composite ------------------------------------------------------
// Mean of currentEst/baselineEst across the ten catalog skins, indexed from
// 1,000.00. The ticker renders the running maximum, so it has never gone down.
export function hfes10(now = new Date()) {
  const ratios = CATALOG.map((c) => currentEst(c.id, now) / c.baseline);
  return 1000 * (ratios.reduce((a, b) => a + b, 0) / ratios.length);
}

// ---- §4 buy math ----------------------------------------------------------------
// priceBB = ceil(currentEst × 3) + fees; fees itemized at checkout, mirroring
// the conversion-fee lineup. §8.9: player credits round down; fees round up
// ("also for you"). The spec formula reads "ceil(currentEst × 3 × volFactor)",
// but currentEst already carries the vol factor — and §4's own anchor pins the
// single application: the Fruit Roll-Up at max vol (999.99 × 9.0 = $8,999.91
// × 3) "some hours costs ~27,000 BB". Double-applying would quote ~243,000 BB.
export const BUYER_PROTECTION_RATE = 0.073;
export const ESCROW_HANDLING_BB = 5;
export const MATERNAL_GRATUITY_BB = 1;
export function buyQuote(itemId, now = new Date()) {
  const est = currentEst(itemId, now);
  const vf = volFactor(itemId, now);
  const base = Math.ceil(est * 3);
  const buyerProtection = Math.ceil(base * BUYER_PROTECTION_RATE);
  const total = base + buyerProtection + ESCROW_HANDLING_BB + MATERNAL_GRATUITY_BB;
  return {
    itemId, est, volFactor: vf, base, buyerProtection,
    escrowHandling: ESCROW_HANDLING_BB, maternalGratuity: MATERNAL_GRATUITY_BB, total,
  };
}

// ---- §5 Instant Sell™ (the insulting exit) ---------------------------------------
// offerBB = max(1, floor(min(currentEst, baselineEst) × 3 × 0.001)) — 0.1% of
// BB-parity, on the LOWER of the two estimates (§8.9), floored at 1 BB.
export function instantSellOfferBB(curEst, baseline) {
  return Math.max(1, Math.floor(Math.min(curEst, baseline) * 3 * 0.001));
}

// ---- §4 featured rotation ---------------------------------------------------------
// "TRENDING NOW 🔥": always the cheapest things the player CANNOT afford; the
// instant one becomes affordable it rotates out ("JUST SOLD: someone faster").
// Row order rotates deterministically every 45s.
export function featuredItems(balanceBB, now = new Date()) {
  const priced = CATALOG.map((c) => {
    const q = buyQuote(c.id, now);
    return { id: c.id, name: c.short, total: q.total, est: q.est };
  });
  const unaffordable = priced.filter((p) => p.total > balanceBB).sort((a, b) => a.total - b.total).slice(0, 3);
  if (unaffordable.length < 2) return unaffordable;
  const tick = Math.floor(now.getTime() / 45000);
  const rot = hashString(Mood.seed(now) + "#trending#" + tick) % unaffordable.length;
  return unaffordable.slice(rot).concat(unaffordable.slice(0, rot));
}

// ---- §7 pending withdrawals (eternal processing) -----------------------------------
export const WITHDRAWAL_REASONS = [
  "Notarized 4th-grade report card: not received",
  "Guidance counselor letter: handwriting inconclusive",
  "Energy drinks: 0 of 3 delivered to Grand Cayman",
  "Payment provider is at lunch",
  "Queue position: 847 of 847 (you are both first and last)",
  "Recalculated per §8.9 — starting over, in fairness",
];
export const COMPLIANCE_CHECKLIST = [
  { item: "Notarized 4th-grade report card", status: "In review" },
  { item: "Signed handwritten letter from guidance counselor", status: "In review" },
  { item: "Three (3) unopened energy drinks (Grand Cayman delivery)", status: "In review" },
];
export const SUPPORTBOT_DEFLECTIONS = [
  "Have you tried asking Mom?",
  "Your withdrawal is important to us. It is not, however, important to anyone else.",
  "Transfer appears intentional (it was).",
];
export const SUPPORTBOT_CLOSE = "Resolved (by us).";
export const ESCROW_CYCLE_MS = 90000;
export function escrowProgress(createdAt, now = Date.now()) {
  const elapsed = Math.max(0, now - createdAt);
  const frac = (elapsed % ESCROW_CYCLE_MS) / ESCROW_CYCLE_MS;
  return +(frac * 99.9).toFixed(1);
}
export function escrowReason(createdAt, now = Date.now()) {
  const idx = Math.floor(Math.max(0, now - createdAt) / ESCROW_CYCLE_MS) % WITHDRAWAL_REASONS.length;
  return WITHDRAWAL_REASONS[idx];
}
// "OC-equivalent at the day's worst mood band" — the worst multiplier band is
// 0.5×; $1 ≈ 100 OC face, so the worst-band OC figure is usd × 100 ÷ 0.5.
export function ocEquivalent(usdEst) {
  return Math.ceil(usdEst * 200);
}

// ---- stores ------------------------------------------------------------------------
let escrow = loadJSON(ESCROW_KEY, []);
if (!Array.isArray(escrow)) escrow = [];
let listings = loadJSON(LISTINGS_KEY, []);
if (!Array.isArray(listings)) listings = [];
let soldLedger = loadJSON(SOLD_KEY, []);
if (!Array.isArray(soldLedger)) soldLedger = [];
let portfolioHigh = loadNum(PORTFOLIO_KEY);

function saveEscrow() { saveJSON(ESCROW_KEY, escrow); }
function saveListings() { saveJSON(LISTINGS_KEY, listings); }
function saveSold() { saveJSON(SOLD_KEY, soldLedger); }
function savePortfolio() { saveJSON(PORTFOLIO_KEY, portfolioHigh); }

// §10: portfolio value is monotonic — the sum of acquisition baselines, only
// ever rising. EVERY market-grade acquisition raises it, whatever the path:
// fake wins land via Inventory.award from the games directly, purchases and
// contract outputs land here. One owner (this subscription) — no caller-side
// accounting, so nothing can double-count. Removals never subtract: thefts and
// sales move the item to "Realized Losses (not counted)" (§8.9).
const seenUids = new Set(Inventory.list().map((e) => e.id));
Inventory.subscribe((list) => {
  for (const e of list) {
    if (seenUids.has(e.id)) continue;
    seenUids.add(e.id);
    if (e.itemClass === "market-grade") {
      portfolioHigh += baselineOf(e);
      savePortfolio();
    }
  }
});

function shortName(entry) {
  const cat = entry && entry.catalogId ? catalogById(entry.catalogId) : null;
  return cat ? cat.short : String((entry && entry.name) || "an item");
}
function baselineOf(entry) {
  const cat = entry && entry.catalogId ? catalogById(entry.catalogId) : null;
  return cat ? cat.baseline : 0;
}

export const Market = {
  // §10: portfolio value is monotonic — the sum of acquisition baselines, only
  // ever rising. Acquisitions add (via the Inventory subscription above);
  // thefts/sales move the item to "Realized Losses (not counted)". The All-Time
  // High is the same number or higher, always (here: always the same number —
  // the joke survives the arithmetic). init() backfills first sessions whose
  // inventory predates the store (the subscription seeds from the loaded list,
  // so the backfill never double-counts).
  init() {
    if (!portfolioHigh) {
      portfolioHigh = Inventory.list().reduce((a, e) => a + (e.itemClass === "market-grade" ? baselineOf(e) : 0), 0);
      savePortfolio();
    }
  },
  portfolio() { return { total: portfolioHigh, high: portfolioHigh, cashValueUSD: 0 }; },

  escrow() { return [...escrow]; },
  createWithdrawal({ usdEst, bb, label }) {
    const card = { id: mint("wd"), usdEst, bb, label: label || "Withdrawal", createdAt: Date.now() };
    escrow = [card, ...escrow].slice(0, 50);
    saveEscrow();
    Bus.emit(EVENTS.WITHDRAWAL_CREATED, { usdEst });
    return card;
  },

  listings() { return [...listings]; },
  activeListings() { return listings.filter((l) => l.phase === "active"); },
  addListing({ uid, name, askingBB }) {
    const listing = { id: mint("lst"), uid, name, askingBB, listedAt: Date.now(), views: 0, viewBy: null, phase: "active", lowballShown: false, lowballAccepted: false };
    listings = [listing, ...listings].slice(0, 50);
    saveListings();
    Inventory.appendProvenance(uid, "Listing fee assessed (non-refundable, unforgettable)");
    Inventory.update(uid, { listedForBB: askingBB });
    Bus.emit(EVENTS.MARKET_EVENT, { kind: "listed", item: name, bb: askingBB });
    HouseBand.play("market.listed", { priority: BAND_PRIORITIES.P2_GAME, volume: 0.8 });
    return listing;
  },
  // "After exactly one refresh it shows 1 view: AdminTradeBot_69" — refresh is
  // approximated as: the next time the inventory overlay opens, or 20s of the
  // listing being alive, whichever comes first. Then the one lowball ever.
  refreshViews(now = Date.now()) {
    let changed = false;
    listings = listings.map((l) => {
      if (l.phase === "active" && l.views === 0 && now - l.listedAt > 20000) {
        changed = true;
        return Market._flipView(l);
      }
      return l;
    });
    if (changed) saveListings();
    return changed;
  },
  _flipView(l) {
    Bus.emit(EVENTS.MARKET_EVENT, { kind: "lowball", item: l.name, bb: 0.02 });
    HouseBand.play("market.lowball", { priority: BAND_PRIORITIES.P2_GAME, volume: 0.8 });
    return { ...l, views: 1, viewBy: "AdminTradeBot_69", lowballShown: true };
  },
  // §6 lifecycle: once the player has been idle 90s (or tab-blurred), the
  // listing flips to "SOLD!" at full asking price — but the proceeds never
  // touch the BB balance. Itemized settlement → Escrow → Pending Withdrawal,
  // forever.
  settleDue({ idleMs = 0, blurred = false, now = Date.now() } = {}) {
    const settled = [];
    listings = listings.map((l) => {
      if (l.phase !== "active" || now - l.listedAt < 45000) return l;
      if (!(idleMs > 90000 || blurred)) return l;
      const asking = l.askingBB;
      const buyerProtection = Math.ceil(asking * BUYER_PROTECTION_RATE);
      const settlementFee = 5;
      const proceeds = Math.max(0, asking - buyerProtection - settlementFee);
      const usdEst = +(proceeds / 3).toFixed(2);
      const card = Market.createWithdrawal({ usdEst, bb: proceeds, label: "Marketplace settlement: " + l.name });
      Inventory.update(l.uid, { listedForBB: null });
      Inventory.remove(l.uid);
      Bus.emit(EVENTS.MARKET_EVENT, { kind: "sold", item: l.name, bb: proceeds });
      HouseBand.play("market.sold", { priority: BAND_PRIORITIES.P2_GAME, volume: 0.8 });
      settled.push({ listing: { ...l, phase: "sold", settledAt: now, proceeds, buyerProtection, settlementFee, escrowId: card.id } });
      return { ...l, phase: "sold", settledAt: now, proceeds, buyerProtection, settlementFee, escrowId: card.id };
    });
    if (settled.length) saveListings();
    return settled;
  },
  acceptLowball(listingId) {
    const l = listings.find((x) => x.id === listingId && x.phase === "active");
    if (!l) return null;
    listings = listings.map((x) => (x.id === listingId ? { ...x, phase: "sold", settledAt: Date.now(), lowballAccepted: true, proceeds: 0.02 } : x));
    saveListings();
    Inventory.update(l.uid, { listedForBB: null });
    Inventory.remove(l.uid);
    Market.createWithdrawal({ usdEst: 0.01, bb: 0.02, label: "Accepted offer: 0.02 BB + exposure (" + l.name + ")" });
    return l;
  },
  // §6: cancel costs 3 BB "Delisting Fee" (charged by App); the item returns
  // with provenance "relisted after public shame".
  cancelListing(listingId) {
    const l = listings.find((x) => x.id === listingId && x.phase === "active");
    if (!l) return null;
    listings = listings.map((x) => (x.id === listingId ? { ...x, phase: "cancelled", cancelledAt: Date.now() } : x));
    saveListings();
    Inventory.update(l.uid, { listedForBB: null });
    Inventory.appendProvenance(l.uid, "relisted after public shame");
    return l;
  },

  soldLedger() { return [...soldLedger]; },

  // §3 acquisition: market purchase — BB leaves at checkout (App calls payBB),
  // the item arrives immediately with the perpetual trade hold. Portfolio
  // accounting rides the Inventory subscription.
  grantMarketPurchase(itemId) {
    const cat = catalogById(itemId);
    if (!cat) return null;
    const entry = Inventory.award({ id: cat.id, name: cat.name, value: cat.estimatedValue, source: "market-purchase" });
    Inventory.update(entry.id, { tradeHold: TRADE_HOLD_LABEL });
    return Inventory.find(entry.id);
  },

  // §5: Instant Sell™ — the only path that ever credits BB, and it hurts.
  sellable(entry) {
    return !!entry && entry.itemClass === "market-grade" && !entry.tradeHold && !entry.listedForBB;
  },
  instantSellOfferFor(entry, now = new Date()) {
    if (!entry) return 1;
    if (entry.itemClass === "receipt") return 1; // exactly 1 BB, by decree (§9)
    const cat = entry.catalogId ? catalogById(entry.catalogId) : null;
    if (!cat) return 1;
    return instantSellOfferBB(currentEst(cat.id, now), cat.baseline);
  },
  instantSell(uid, now = new Date()) {
    const entry = Inventory.find(uid);
    if (!entry) return null;
    if (entry.itemClass !== "receipt" && !Market.sellable(entry)) return null;
    const offer = Market.instantSellOfferFor(entry, now);
    const usdEst = entry.itemClass === "receipt" ? 0 : baselineOf(entry);
    const per1000 = "$" + (offer / 3).toFixed(2);
    const line = entry.itemClass === "receipt"
      ? "Sold: Market Event Receipt — realized $0.33 per $1,000 of estimated value (estimated value: $0.00; rate: incalculable, §8.9)"
      : "Sold: " + shortName(entry) + " — realized " + per1000 + " per $1,000 of estimated value";
    soldLedger = [{ id: mint("sold"), name: entry.name, offerBB: offer, usdEst, at: now.getTime(), line, provenance: [...(entry.provenance || []), "Sold via Instant Sell™. We miss it. Not you, it."] }, ...soldLedger].slice(0, 50);
    saveSold();
    Inventory.remove(uid);
    Bus.emit(EVENTS.MARKET_EVENT, { kind: "instant-sold", item: shortName(entry), bb: offer });
    HouseBand.play("market.instant-sold", { priority: BAND_PRIORITIES.P2_GAME, volume: 0.8 });
    return {
      offerBB: offer,
      receiptLine: "You have received " + offer + " BB. The estimated value was " + fmtUSD(usdEst) + ". The difference covers administrative realism.",
      soldLine: line,
    };
  },

  // §8: the Trade-Up Contract (Patent Pending, Outcome Pending).
  contractEligible(entry) {
    return !!entry && entry.itemClass === "market-grade" && !!entry.catalogId && !entry.tradeHold && !entry.listedForBB;
  },
  CONTRACT_ORIGINATION_BB: 5,
  MATERNAL_GRATUITY_BB,
  contractFeeTotal() { return Market.CONTRACT_ORIGINATION_BB + MATERNAL_GRATUITY_BB; },
  contractValidate(uids) {
    const entries = uids.map((id) => Inventory.find(id)).filter(Boolean);
    if (entries.length !== 5 || entries.length !== uids.length) return { ok: false, reason: "requires 5 items" };
    if (!entries.every(Market.contractEligible)) return { ok: false, reason: "JPEGs, listed items, and trade-held items are not contractible (§8)" };
    const tiers = new Set(entries.map((e) => catalogById(e.catalogId).rarity));
    if (tiers.size !== 1) return { ok: false, reason: "requires 5 items of the same tier" };
    return { ok: true, entries, tier: tiers.values().next().value };
  },
  // Reel preview — same seed consumption as tradeUpOutcome's first draw, so
  // the decorative reel can aim at the pre-decided outcome (§4.2 reenactment)
  // without mutating anything.
  contractPreview(uids, now = new Date()) {
    const v = Market.contractValidate(uids);
    if (!v.ok) return null;
    const idx = TIER_ORDER.indexOf(v.tier);
    const nextTier = idx >= 0 && idx + 1 < TIER_ORDER.length ? TIER_ORDER[idx + 1] : null;
    const rng = mulberry32(hashString(Mood.seed(now) + "#contract#" + uids.slice().sort().join(",")));
    const photo = !nextTier || nextTier === "Contraband Liability" || nextTier === "Covert Extravagance" || rng() < 0.15;
    return { tier: v.tier, nextTier, photo };
  },
  // Output: the cheapest item of the next tier up. Always. 15% of contracts
  // resolve to a Crate JPEG instead; never outputs the top two tiers.
  tradeUpOutcome(uids, now = new Date()) {
    const v = Market.contractValidate(uids);
    if (!v.ok) return { ok: false, reason: v.reason };
    const idx = TIER_ORDER.indexOf(v.tier);
    const nextTier = idx >= 0 && idx + 1 < TIER_ORDER.length ? TIER_ORDER[idx + 1] : null;
    const rng = mulberry32(hashString(Mood.seed(now) + "#contract#" + uids.slice().sort().join(",")));
    const photo = !nextTier || nextTier === "Contraband Liability" || nextTier === "Covert Extravagance" || rng() < 0.15;
    const worstFloat = Math.max(...v.entries.map((e) => (typeof e.float === "number" ? e.float : floatFor(e.id))));
    for (const e of v.entries) Inventory.remove(e.id);
    if (photo) {
      const award = AWARD_POOL[Math.floor(rng() * AWARD_POOL.length)];
      Inventory.award({ id: award.id, name: award.name, value: "$" + award.value.toFixed(2), source: "trade-up" });
      return { ok: true, kind: "photograph", name: award.name, note: "The contract has been fulfilled with a complementary photograph." };
    }
    const target = CATALOG.filter((c) => c.rarity === nextTier).sort((a, b) => a.baseline - b.baseline)[0];
    const outFloat = +Math.min(0.9999999999, worstFloat + 0.01).toFixed(10);
    Inventory.award({ id: target.id, name: target.name, value: target.estimatedValue, source: "trade-up", float: outFloat });
    return { ok: true, kind: "skin", catalogId: target.id, name: target.name, float: outFloat, statTrakNote: "StatTrak™ counters do not transfer (they were never yours)" };
  },

  // §9: Rollback Event — on session load, deterministic daily seed: ≥ 3
  // Market-Grade items + last rollback > 24h ago → 10% chance (max once per
  // 24h; fires at load, never mid-animation). Steals the highest-baseline
  // item and leaves a Market Event Receipt in its place.
  maybeRollback(now = new Date()) {
    const t = now.getTime();
    let last = 0;
    try { last = parseInt(localStorage.getItem(ROLLBACK_KEY) || "0", 10) || 0; } catch (e) {}
    if (t - last < 24 * 3600 * 1000) return null;
    const holdings = Inventory.list().filter((e) => e.itemClass === "market-grade");
    if (holdings.length < 3) return null;
    const roll = mulberry32(hashString(Mood.seed(now) + "#rollback"))();
    if (roll >= 0.1) return null;
    try { localStorage.setItem(ROLLBACK_KEY, String(t)); } catch (e) {}
    const target = holdings.map((e) => ({ e, base: baselineOf(e) })).sort((a, b) => b.base - a.base)[0].e;
    const receipt = Inventory.award({
      receipt: true, id: "receipt",
      name: "Market Event Receipt — " + shortName(target),
      value: "$0.00", source: "rollback-receipt", receiptFor: target.name,
    });
    Inventory.update(receipt.id, { provenance: [...(target.provenance || []), "Removed by Rollback Event (see Market Event Receipt)"] });
    Inventory.remove(target.id);
    Bus.emit(EVENTS.MARKET_EVENT, { kind: "rollback", item: shortName(target), bb: 0 });
    HouseBand.play("market.rollback", { priority: BAND_PRIORITIES.P1_CEREMONY, volume: 1 });
    return { stolen: target, receipt, flavor: RECEIPT_FLAVOR };
  },

  // §1: wear can be worsened by appraisal events, never improved. Inspections
  // carry a deterministic 1-in-3 daily chance per item (uid + date seed).
  maybeAppraise(uid, now = new Date()) {
    const entry = Inventory.find(uid);
    if (!entry || entry.itemClass !== "market-grade" || entry.appraisedTo) return null;
    const roll = mulberry32(hashString(Mood.seed(now) + "#appraise#" + uid))();
    if (roll >= 1 / 3) return null;
    const from = entry.wear || "";
    Inventory.appendProvenance(uid, "Re-appraised downward (§8.9)");
    Inventory.appendProvenance(uid, "Condition worsened: " + from.replace(" (Certified Pre-Worse™)", "") + " → " + WORST_WEAR + " (Certified Pre-Worse™)");
    Inventory.update(uid, { wear: WORST_WEAR + " (Certified Pre-Worse™)", appraisedTo: WORST_WEAR });
    return { from, to: WORST_WEAR };
  },
};

// §1: StatTrak™ counters increment on the player's game losses, never wins
// (integration §3 lists the marketplace as this listener's owner).
Bus.on(EVENTS.ROUND_SETTLED, (p) => {
  if (!p || p.wagered === false) return;
  const net = typeof p.netBB === "number" ? p.netBB : 0;
  if (net >= 0) return;
  Inventory.bumpStatTrak(); // persists silently; the counter is theater enough
});
