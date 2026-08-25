// Shared fake-win inventory store + the held-item model (marketplace spec §1).
//
// Born minimal in #23 (list/award/subscribe) so the marketplace ticket (#27)
// could adopt and extend it rather than inventing a second store. #27's
// extension: every entry is hydrated into a full holding — itemClass
// (market-grade | digital-asset | receipt), float, wear stamp, StatTrak™
// counter, append-only provenance ledger, trade hold — deterministically from
// its minted uid, so sessions from #23/#24 upgrade in place on load.
// The legacy `tradeable:false` flag is preserved untouched for compatibility;
// sellability is governed by the §1 rules (only fake-won Market-Grade items
// are ever sellable or contractible), see marketplace.js.
import { hydrateHeld } from "./catalog.js";

const KEY = "hfes_inventory";

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}
function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
}

let items = load().map((e) => hydrateHeld(e));
const listeners = new Set();

function notify() {
  for (const fn of [...listeners]) {
    try { fn([...items]); } catch (e) {}
  }
}

function mintId(item) {
  return (item.id || "item") + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

export const Inventory = {
  list() { return [...items]; },
  find(id) { return items.find((e) => e.id === id) || null; },
  award(item) {
    const entry = hydrateHeld({
      id: mintId(item),
      name: item.name,
      value: item.value,
      source: item.source || "unknown",
      awardedAt: Date.now(),
      tradeable: false,
      float: typeof item.float === "number" ? item.float : undefined,
      receipt: item.receipt || undefined,
      receiptFor: item.receiptFor || undefined,
    });
    items = [entry, ...items].slice(0, 200);
    save(items);
    notify();
    return entry;
  },
  update(id, patch) {
    let changed = false;
    items = items.map((e) => {
      if (e.id !== id) return e;
      changed = true;
      return { ...e, ...(typeof patch === "function" ? patch(e) : patch) };
    });
    if (changed) { save(items); notify(); }
  },
  appendProvenance(id, line) {
    if (!line) return;
    Inventory.update(id, (e) => ({ provenance: [...(e.provenance || []), line] }));
  },
  remove(id) {
    const before = items.length;
    items = items.filter((e) => e.id !== id);
    if (items.length !== before) { save(items); notify(); }
  },
  // §1: StatTrak™ counters increment on the player's game losses, never wins.
  // Wired to round.settled by marketplace.js (integration §3 names the
  // marketplace as the StatTrak consumer for losses).
  bumpStatTrak() {
    let changed = false;
    items = items.map((e) => {
      if (e.itemClass === "market-grade" && e.statTrak) {
        changed = true;
        return { ...e, statCount: (e.statCount || 0) + 1 };
      }
      return e;
    });
    if (changed) save(items);
    return changed;
  },
  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};
