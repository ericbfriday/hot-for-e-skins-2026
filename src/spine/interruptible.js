// The interruptible-state bus (integration.md §4): spine registry, panic
// semantics. Providers publish whether a toast/modal may interrupt right now;
// consumers (the session reminder, the reality check) may interrupt only when
// every provider says yes. MOM'S HOME outranks everything, exactly as P0
// outranks the Band's queue — providers are expected to read the panic state
// live, so the registry holds functions, not stale booleans.
// Exempt from interruption entirely (elsewhere, by design): MOM's whispers,
// deposit stings, the Siren, the BASS_DROP — "these are not interruptions;
// they are service."
const providers = new Map();

export const Interruptible = {
  // provide(surface, fn): fn() -> boolean (false = do not interrupt).
  // Returns an unregister function.
  provide(surface, canInterruptFn) {
    providers.set(surface, typeof canInterruptFn === "function" ? canInterruptFn : () => canInterruptFn !== false);
    return () => { providers.delete(surface); };
  },
  // False if any provider says no. Everything else defaults yes.
  canInterrupt() {
    for (const fn of providers.values()) {
      try { if (fn() === false) return false; } catch (e) {}
    }
    return true;
  },
  // Debug/diagnostics: the surfaces currently refusing interruption.
  surfaces() {
    const out = [];
    for (const [surface, fn] of providers) {
      let ok = true;
      try { ok = fn() !== false; } catch (e) {}
      if (!ok) out.push(surface);
    }
    return out;
  },
};
