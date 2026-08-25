// MOMCODE_MIKE's rigged calendar (live-wins-ticker §7, integration §6).
// Home note: integration.md §6 originally seated the Mike choreography clock in
// the chat module, but #26 scoped its half out to the ticker ticket (its
// resolution, deviation #3) — the controller lives here now; the ticker renders.
// Heaters (integration §6): first session until first deposit, any BB < 6 window,
// ±30min after streak.died (dormant — retention #31 does not emit yet). During a
// heater cadence is ~90s, superseding the 10-minute standing slot. Desperation's
// "every 5 minutes" figure is superseded — Desperation is always a heater.
import { Bus, EVENTS } from "../spine/bus.js";
import { Mood } from "../spine/mood.js";
import { HouseBand, BAND_PRIORITIES } from "../spine/band.js";
import { mikeWinsBaseline, mikeLine, anchorBB, clipLine, fill, MIKE_DEPOSIT_BURST, MIKE_DISCLOSURE } from "./engine.js";

const STANDING_SLOT_MS = 600000; // one win per 10 ambient minutes
const HEATER_MS = 90000;         // ~every 90s during a heater
const STREAK_DIED_WINDOW_MS = 30 * 60 * 1000;

function jitter(ms) { return Math.round(ms * (0.9 + Math.random() * 0.2)); }

export function createMikeController({ emitEntry, isDesperate, hasSessionDeposit }) {
  let k = mikeWinsBaseline(Mood.seed());
  let timer = null;
  let streakDiedAt = null;
  let burstSeq = 0;

  const heaterActive = () => !hasSessionDeposit() || isDesperate() || (streakDiedAt !== null && Date.now() - streakDiedAt < STREAK_DIED_WINDOW_MS);

  function fire() {
    const isKarambit = Math.random() < 0.6;
    const pick = isKarambit ? 0 : 1 + Math.floor(Math.random() * 4);
    if (isKarambit) k += 1;
    const entry = mikeLine(pick, k, { bb: anchorBB(999), mult: 47 + Math.floor(Math.random() * 53) });
    emitEntry(entry);
    Bus.emit(EVENTS.MIKE_WIN, { class: isKarambit ? "karambit" : "streak", k });
    // Stub sting for #30 (audio): apply MIKE_HOT_DB (+3 dB; +4 in Desperation).
    HouseBand.play("mike.stinger", { priority: BAND_PRIORITIES.P3_SOCIAL });
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(fire, jitter(heaterActive() ? HEATER_MS : STANDING_SLOT_MS));
  }

  function burst(text, delay, isKarambit, seq) {
    setTimeout(() => {
      if (isKarambit) k += 1;
      emitEntry({ text: clipLine(fill(text, { k })), name: "MOMCODE_MIKE", badge: "[OWNER]", color: "#ff8a3d", isYou: false, note: MIKE_DISCLOSURE });
      if (isKarambit) Bus.emit(EVENTS.MIKE_WIN, { class: "karambit", k });
      HouseBand.play("mike.stinger", { priority: BAND_PRIORITIES.P3_SOCIAL });
    }, delay + seq * 30); // seq keeps render order deterministic per burst
  }

  return {
    k: () => k,
    start() { schedule(); },
    // §7: the moment the Ask-Mom flow opens (any trigger), a 3-line burst.
    depositCluster() {
      const seq = ++burstSeq;
      burst(MIKE_DEPOSIT_BURST[0], 200, true, seq);
      burst(MIKE_DEPOSIT_BURST[1], 900, false, seq);
      burst(MIKE_DEPOSIT_BURST[2], 1600, false, seq);
      // The burst is itself pressure; reset the standing clock so Mike doesn't
      // double-fire immediately after.
      schedule();
    },
    // The 30–45s pre-pressure clock scoped out of #26: 2 implausible Karambit
    // streaks just before the predictable deposit-pressure moments (BB entering
    // the pre-nag band, Mom Coupon day-flip).
    prePressureCluster() {
      const seq = ++burstSeq;
      burst(MIKE_DEPOSIT_BURST[0], 1500, true, seq);
      burst("won another Karambit ({k}th today) (you had to be there)", 4000, true, seq);
    },
    onStreakDied() { streakDiedAt = Date.now(); schedule(); },
    dispose() { clearTimeout(timer); },
  };
}
