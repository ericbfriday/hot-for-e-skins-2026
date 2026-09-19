// SkinChain™ persisted counters (skinchain §5; integration-2026 §11):
// localStorage `hfes_skinchain` — {views, tips, verifies}. The explorer emits
// nothing on the bus (integration-2026 §2: theater with exactly one owner
// calls its module directly); these counters feed the §4 ticker lines and the
// StatTrak™ "chain checks" mirror, which App bumps on every explorer open.
const KEY = "hfes_skinchain";

const listeners = new Set();

function blank() { return { views: 0, tips: 0, verifies: 0 }; }

export function loadSkinChain() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!v || typeof v !== "object") return blank();
    const num = (x) => (typeof x === "number" && Number.isFinite(x) && x > 0 ? Math.floor(x) : 0);
    return { views: num(v.views), tips: num(v.tips), verifies: num(v.verifies) };
  } catch (e) {
    return blank();
  }
}

function save(counters) {
  try { localStorage.setItem(KEY, JSON.stringify(counters)); } catch (e) {}
}

function notify(counters, kind) {
  for (const fn of [...listeners]) {
    try { fn({ ...counters }, { kind }); } catch (e) {}
  }
}

function bump(kind) {
  const counters = loadSkinChain();
  counters[kind] += 1;
  save(counters);
  notify(counters, kind);
  return counters[kind];
}

export const SkinChain = {
  get: loadSkinChain,
  bumpView() { return bump("views"); },
  bumpTip() { return bump("tips"); },
  bumpVerify() { return bump("verifies"); },
  // Observable for later tickets — NOT a bus event (integration-2026 §2 rules
  // the explorer bus-silent; #46's "Check the chain" daily quest subscribes
  // here instead). Every bump fires fn(counters, {kind}) where kind is
  // "views" | "tips" | "verifies"; a views bump == one explorer open.
  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};
