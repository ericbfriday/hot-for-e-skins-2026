const KEY = "hfes_consent_rearm";

export const Consent = {
  rearm(reason) {
    try { localStorage.setItem(KEY, JSON.stringify({ reason, at: Date.now() })); } catch (e) {}
  },
  pending() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  },
  consume() {
    const p = Consent.pending();
    try { localStorage.removeItem(KEY); } catch (e) {}
    return p;
  },
};
