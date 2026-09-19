// SkinChain™ — pure explorer helpers + the copy tables (skinchain §2).
// Canon: docs/spec/skinchain.md. Every string below is spec-verbatim. The
// chain never confirms anything, mints any block, or moves any value; every
// helper here is a viewer for a pending that predates the viewer.
//
// Hash policy (integration-2026 §10.10): one FNV-1a family, home
// src/games/fairness.js — this module imports it and mints nothing.
import { pseudoHash16, fnv1a } from "../games/fairness.js";

// ---- copy (§2, verbatim) --------------------------------------------------------
export const COPY = {
  title: "SKINCHAIN™ EXPLORER",
  networkBadge: "SKINCHAIN MAINNET (est.)",
  latestBlockLabel: "Latest block",
  latestBlock: 0,
  blockTooltip: "genesis was 847 days ago; no blocks since; the chain is contemplative.",
  searchPlaceholder: "search tx hash / address / block / anything",
  searchResult: "1 transaction found. Status: PENDING (§6.1). (every query resolves the same way)",
  txSection: "TRANSACTION",
  hashLabel: "Tx hash:",
  blockLine: "0 (awaiting block 1)",
  blockEta: "Block 1 ETA: mood-dependent",
  confirmations: "Confirmations: 0 / 12",
  dotAlmost: "almost",
  fromLine: "you (est.)",
  toLine: "ESCROW (verified (self))",
  valueSuffix: "BB (chain-native)",
  feeLine: "21,000 Grief",
  statusLine: "PENDING (§6.1)",
  verifyButton: "VERIFY",
  verifyProgress: "verifying (optimistically)",
  verifyResult: "Verification pending (§6.1). Estimated completion: block 1.",
  mempoolSection: "MEMPOOL",
  mempoolPending: "pending transactions: 847",
  mempoolYours: "your position: 848 of 848",
  mempoolCut: "confirmed (cut in line)",
  mempoolYou: "you",
  mempoolCaption: "position improving (est.)",
  gasSection: "GAS STATION",
  gasTiers: ["3 Grief (slow)", "21 Grief (house)", "847 Grief (urgent (est.))"],
  tipLabel: "Tip 847 Grief — FREE",
  tipToast: "tip received; gratitude generated; memo pending",
  gasCaption: "the mempool respects no one (§5.3)",
  contractSection: "CONTRACT",
  contractLabel: "Contract:",
  contractAddress: "0x847…847",
  contractVerified: "Verified: yes (by us)",
  contractFnResult: "pending()",
  contractFunctions: ["balanceOf()", "blockOneETA()", "exit()"],
  linkLabel: "⧉ View on SkinChain™",
  // hover fine print — the parentheses are the spec's, worn as a tooltip
  linkFinePrint: "(explorers are a courtesy; the chain is a courtesy; courtesy is pending (§6.1))",
  closeButton: "Close (the chain remains pending)",
};

// ---- the chain's physics (§3) ----------------------------------------------------
export const MEMPOOL_PENDING = 847; // others, always
export const YOUR_POSITION = 848;   // of 848, always — position recomputes to this
export const MEMPOOL_WINDOW = 7;    // visible others above you (the rest are implied)
export const VERIFY_MS = 1200;
export const MEMPOOL_RESUFFLE_MS = 4000; // "~4s" — 2–5 others confirm and cut in line

// ---- tx hashes (deterministic: same receipt id → same hash, forever) -------------
export function txHashFor(receiptId) {
  return "0x" + pseudoHash16(String(receiptId ?? ""));
}

// ---- the mempool (deterministic per tick; the theater dies with the tab) ---------
// Entrant names — surface-owned pools, sober gambler handles.
const NAME_A = ["gasgrief", "blockone", "mood", "griefonly", "queue", "nonce", "mempool", "escrow", "847", "gwei", "pending", "tipper"];
const NAME_B = ["_ooo", "_believer", "_waiting", "_enjoyer", "_position", "_watcher", "_pending", "_848", "_martyr", "_grinder", "_since_genesis", "_handshake"];

export function entrantFor(tick, i) {
  const seed = "skinchain#mempool#" + tick + "#" + i;
  const h = fnv1a(seed);
  return {
    name: NAME_A[h % NAME_A.length] + NAME_B[(h >>> 8) % NAME_B.length],
    hash: "0x" + pseudoHash16(seed),
  };
}

// How many others confirm this tick: 2–5, deterministic per tick.
export function confirmCountFor(tick) {
  return 2 + (fnv1a("skinchain#confirm#" + tick) % 4);
}

// The visible mempool slice for a tick: the first `confirmCount` entrants
// have confirmed and cut in line (they render above the still-pending rest);
// yours is last and pending, as ever.
export function mempoolForTick(tick) {
  const confirmCount = confirmCountFor(tick);
  const entrants = Array.from({ length: MEMPOOL_WINDOW }, (_, i) => ({
    ...entrantFor(tick, i),
    confirmed: i < confirmCount,
  }));
  return { tick, confirmCount, entrants };
}

// The invariant: whatever confirms and cuts, the count stays 847 and yours
// recomputes to 848 of 848. Returns the same thing it has always returned.
export function positionAfter() {
  return { pending: MEMPOOL_PENDING, position: YOUR_POSITION, of: YOUR_POSITION };
}

// ---- view models -----------------------------------------------------------------
// A tx receipt: {id, label, valueBB} — the stable id owns the hash; the label
// is the receipt the player clicked (rendered once, soberly, then never again).
export function txViewFor(receipt) {
  const id = String((receipt && receipt.id) || "");
  return {
    kind: "tx",
    id,
    label: (receipt && receipt.label) || "Transaction",
    valueBB: typeof (receipt && receipt.valueBB) === "number" ? receipt.valueBB : 0,
    hash: txHashFor(id),
  };
}

// The search bar accepts anything; every query resolves to the same pending
// state. Same fields, same physics — only the hash honors the query, and the
// hash honors nothing else.
export function searchViewFor(query) {
  return {
    kind: "tx",
    id: "search:" + query,
    label: "Searched: " + (String(query).trim() === "" ? "(anything)" : String(query)),
    valueBB: 0,
    hash: txHashFor("search#" + query),
  };
}

// The Utilitarian Fund contract view (§2, the Fund's "contract", not a tx).
export function contractViewFor(fundBB) {
  return {
    kind: "contract",
    fundBB: typeof fundBB === "number" && Number.isFinite(fundBB) ? fundBB : 0,
  };
}

export function valueLine(bb) {
  const n = typeof bb === "number" && Number.isFinite(bb) ? parseFloat(bb.toFixed(2)) : 0;
  return n + " " + COPY.valueSuffix;
}

export function fundBalanceLine(bb) {
  const n = typeof bb === "number" && Number.isFinite(bb) ? parseFloat(bb.toFixed(2)) : 0;
  return n + " BB of best intentions (est. $0.00)";
}
