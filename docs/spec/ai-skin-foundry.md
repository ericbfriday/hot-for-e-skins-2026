# Spec: AI Skin Foundry — Dreamed Assets™

Decision-complete resolution of [#38 (Spec: AI Skin Foundry)](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/38) on the [2026 map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/33). The relaunch's new crate: the house stopped photographing stock JPEGs and started **dreaming** them.

Parody targets (ai-trends-2026): §11 generated-content slop economics, §1 GPT-washing, §3 reasoning-stream theater (the render bar). First-batch: dark-patterns §2.1 (suspense/near-miss), §4.3 (free drips), §4.5 (loss-leaders).

Canon alignment: the Foundry is a **second crate inside the existing crate surface** (a crate selector: LOOT CRATE DEFUSER ⇄ THE FOUNDRY). Crate ceremony canon (defuse structure, cap, Pity Meter, envelope valves) applies unless ruled here. **No image files, no API** — every award is a live SVG/CSS composition rendered deterministically from a seed (the Mood.seed family + dream index).

---

## 1. Pricing & the free valve

- **Dream key: 20 BB** (the standard key is 15; "the premium covers electricity (est.)"). Bundles mirror the crate table at 4/3 pricing (5-pack 93 BB, 20-pack 333 BB — round numbers rejected, §8.9 rounding applies at receipt).
- **First Dream is Free™** — one free dream per identity (not per session): "the first one is complimentary (they always are, see §4.5)". Claimed via the standard MOM envelope, wax seal reading "UTILIMOM™ (she doesn't know either)".
- Insufficient BB routes to Ask-Mom per canon (buy-button label swap).

## 2. The dream ceremony (rendering, not defusing)

Same beat skeleton as the defuse (crate canon) with inverted vocabulary — the crate is being **rendered**, not disarmed:

1. **Prompt slam** (0–8%): the dream's prompt flashes by too fast to read ("prompt withheld for safety (prompt: 'a spork, but it feels something, 8k, trending, sad')").
2. **RENDERING (tokens)** (8→89%): a token counter streams over a progress bar that occasionally renders a beautiful frame, shudders, and renders it again identically ("converged early (the model is decisive)").
3. **THE LATENCY** (pinned 89%, 1.5s): everything hangs. Caption: "generating originality".
4. **Snap → gallery reel** (3.2s): the standard 5-slot reel decelerates over dreaming frames.

Total duration obeys the crate ladder: base 15.0s +1.0s per dream this session, capped 28.0s ("building suspense, per your feedback" — unchanged, it's tradition now). The Skip gag transfers verbatim (3 BB, +7% displayed, extends THE LATENCY by 2.0s).

## 3. Dreamed Assets™ (the award class)

Each award is **synthesized live**: a deterministic SVG composition — tier-paletted gradients, abstract weapon-shaped silhouettes, splatter, a subtle sparkle loop — seeded by `Mood.seed() + day + dreamIndex`, so dream #41 is always dream #41 (determinism is the provenance, ai-trends-2026 §11).

Every Dreamed Asset carries:

- **A generated name** from the dreamed deck: `{prefix} {object} {suffix}` — prefixes (Neon, Vaporwave, Hyperreal, Quantum, Feral, Sentimental, Tactical, Gluten-Free), objects (Spork, Mom Card, Retainer, Juice Box, Gaming Chair, Trophy, Wifi Password, Fruit Roll-Up — the catalog universe, dreamed), suffixes ((Dreamed), (Remix), Core, Octane, .5, Ultra). ("Sentimental Retainer Core (Dreamed)").
- **A prompt receipt**, verbatim on the award card: `dreamed from: "{prompt}"` — prompts are auto-concatenated absurdity ("mom's visa at golden hour, crying, product shot, 8k, no watermark (watermark pending)").
- **Provenance line**: "Derivative of everything, provably. Originality: est. pending."

Rarity theater: the crate tier vocabulary returns with the dreamed modifier — Consumer Grade Trash (Dreamed) through Contraband Liability (Dreamed). Odds disclosure: "Odds: dreamed. (The model was in a mood.)"

**The Undreamed™** — the reel's permanent near-miss: the slot immediately before the landing slot always renders as a pitch-black card reading **THE UNDREAMED™** with the caption "cannot be generated (must be earned (cannot be earned))". Post-land toast: "SO CLOSE! The Undreamed™ remains undreamed. (distance does not affect outcome; this reel is a movie; §4.2)". The Karambit's rhyme: the site's two unwinnable prizes now agree with each other.

## 4. Dupes → REMIX

A duplicate dream doesn't recycle — it **remixes**: the same composition returns palette-swapped, name suffixed `(Remix #{n})`, with the toast "REMIXED — still yours, technically new (novelty: est.)". Remixes count toward the Pity Meter/DreamShield™ like any dream. There is no duplicate protection; there is duplicate rebranding.

## 5. Pity / DreamShield™ (the same meter, third label)

The crate Pity Meter is shared, one counter site-wide (crate canon: one rigged counter). On the Foundry its label reads **Pity Meter / DupeShield™ / DreamShield™** with header "GUARANTEED original-ish every 50 dreams!™" — recalibration at the 50th increment per canon (mood improved, §8.9; the draw is the day-seeded deterministic family).

## 6. Inventory & marketplace (the walls)

- Dreamed Assets land in inventory as **Digital Assets**: non-tradeable, non-sellable, Cash Value (est.) $0.00 — with the dreamed provenance line in place of a JPEG filename.
- Marketplace rejects them politely at every exit: Instant Sell™ → "unavailable: the asset predates appraisal (the model is the market (pending))"; listing → "the market cannot price a dream (§8.9)". The Trade-Up Contract accepts five same-tier dreams and returns the cheapest dream of the next tier — the only exit that pretends.
- Wearing (cosmetic profile flair, if the inventory renders it): a dreamed asset's wear stamp reads "Certified Pre-Worse™ (Dreamed): wear is conceptual".

## 7. Ticker & chat lines (additions to the pools)

Ticker:
- "{n} dreamed Sentimental Retainer Core (derivative of everything, provably)"
- "{n}'s dream was REMIXED for the 4th time (novelty: est.)"
- "THE UNDREAMED remains undreamed ({n} was 1 slot away (the slot didn't move))"
- "{n} received their First Dream™ free (subsequent dreams priced normally)"

Chat:
- `{user:"promptwizard_9k", msg:"i asked for the karambit and it dreamed me a spork FEELING something"}`
- `{user:"DEPOSITOR.ai", msg:"Analysis: the dreams are original (est.). Collecting originals correlates with depositing (see everything)."}`
- `{user:"MOD_Chad_Official", msg:"AI skins are the future!! the future is pending!!"`

## 8. State (client-side only)

localStorage: `hfes_foundry_dreams` (count, per-session rendered in memory), `hfes_foundry_remixes`, `hfes_foundry_firstfree` (identity-scoped claim stamp). The dream generator itself is pure + seeded: same seed → same dream, forever (that's the receipt).

## Open questions sharpened by this spec

- Whether `dream-defused`/`dream-remixed` become new `round.settled` kinds or reuse `key-defused` — integration-2026 (recommendation: reuse `key-defused` with a ` dreamed: true` payload flag; kinds stay scarce).
- Whether the First Dream envelope queues behind Consolation/ Comeback/Mom keys (envelope serialization is integration canon §7) — integration-2026 (recommendation: yes, last in queue).
