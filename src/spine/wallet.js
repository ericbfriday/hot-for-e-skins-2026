import { Bus, EVENTS } from "./bus.js";

const KEY = "hfes_oc";

function load() {
  try {
    const v = parseFloat(localStorage.getItem(KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch (e) {
    return 0;
  }
}

let oc = load();
const listeners = new Set();

function save() {
  try { localStorage.setItem(KEY, String(oc)); } catch (e) {}
  for (const fn of [...listeners]) {
    try { fn(oc); } catch (e) {}
  }
}

export const Wallet = {
  oc() { return oc; },
  creditOC(amount, reason) {
    const a = typeof amount === "number" && Number.isFinite(amount) && amount > 0 ? amount : 0;
    if (a === 0) return oc;
    oc = +(oc + a).toFixed(2);
    save();
    return oc;
  },
  trySpendOC(amount, reason) {
    const a = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
    if (a <= 0 || oc < a) return false;
    oc = +(oc - a).toFixed(2);
    save();
    return true;
  },
  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};

Bus.on(EVENTS.DEPOSIT_COMPLETED, (p) => {
  const base = p && typeof p.oc === "number" && Number.isFinite(p.oc) ? p.oc : 0;
  const bonus = p && typeof p.bonusOc === "number" && Number.isFinite(p.bonusOc) ? p.bonusOc : 0;
  if (base + bonus > 0) Wallet.creditOC(base + bonus, "deposit");
});
