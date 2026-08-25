// Minimal shared fake-win inventory store.
//
// Neither the catalog (App.jsx) nor any spine module owned an "awards you
// actually received" list before this ticket — fake wins from Allowance
// Roulette and Skin Coinflip need somewhere to land per the fake-win model
// (CONTEXT.md: "an award of inventory or credit that cannot be withdrawn").
// This is intentionally small (list + award + subscribe) so the marketplace
// ticket (#27) can adopt or extend it rather than invent a second store.
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

let items = load();
const listeners = new Set();

function notify() {
  for (const fn of [...listeners]) {
    try { fn([...items]); } catch (e) {}
  }
}

export const Inventory = {
  list() { return [...items]; },
  award(item) {
    const entry = {
      id: (item.id || "item") + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      name: item.name,
      value: item.value,
      source: item.source || "unknown",
      awardedAt: Date.now(),
      tradeable: false,
    };
    items = [entry, ...items].slice(0, 200);
    save(items);
    notify();
    return entry;
  },
  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};
