# Spec: Loot Crate Defuser

Decision-complete resolution of [#8 (Brainstorm: Loot Crate Defuser)](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/8). Economy numbers obey the locked resolution of [#2](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/2): **key = 15 BB**, Maternal Starter Grant = 150 BB (exactly 10 keys), everything client-side (localStorage only), every award a fake win (never withdrawable, ToS §1.3).

Parody targets used (from `docs/research/dark-patterns.md`): §2.1 case-opening suspense + engineered near-misses, §2.2 hidden odds, §3.2 cash-out mirage, §4.3 daily free cases / drip feeds, §4.5 hard loss-leaders, §4.8 streaks.

---

## 1. Key pricing & bundling gags

All prices in BB (15 BB = one key, per #2).

| Offer | Price | Gag |
|---|---|---|
| Single Virtual Key | 15 BB | "Defuse responsibly." |
| Key Ring 5-Pack | 70 BB | "YOU SAVE 5 BB* — *compared to a price we just made up" |
| Key Vault 20-Pack | 250 BB | "BEST VALUE™ (value pending)" — includes 1 **Bonus Key** that is a different color and opens nothing ("decorative, collectible, non-functional — like everything here") |
| Key of the Month Club | 150 BB / month | Subscription theater: first key ships immediately; "next key arrives in 29d 23h" countdown that resyncs to 29d whenever it would reach zero ("lunar recalibration, §8.9"). Pre-checked box: "I will definitely remember to cancel this." |

Bundle buttons render at 2× the size of the single-key button. Buying any bundle while BB is insufficient triggers the locked two-tier flow from #2 (first failure: "Insufficient Banana Bucks. Please ask Mom (see Terms of Service, Section 1.3)."; 3rd+ failure in session: "Other kids' moms already said yes today.").

## 2. Defuse-timer choreography

The ceremony stays a "defusing", never an "opening". **Base duration 15.0s**, escalating **+1.0s per crate already opened this session (page load), capped at 28.0s** — caption: "building suspense, per your feedback".

Beat structure (fractions of the total duration):

1. **Lock 1** — 0 → 40% fast (~12% of duration). Caption: "DISARMING LOCK 1 OF 3".
2. **Stall A** — pinned at 41% for 1.2s. Caption: "NEGOTIATING WITH LOCK 2".
3. **Lock 2** — 41 → 88%.
4. **Stall B (THE DROP)** — pinned at 89% for 1.5s, screen shake, bass boost indicator. Caption: "THE DROP".
5. **Lock 3** — 89 → 99% at an agonizing crawl.
6. **Snap** — 99 → 100% instantly → reel reveal (§4).

Track name in the caption: `BASS_DROP_FINAL_v3_REAL.mp3 — unskippable (no, you cannot skip this)`.

**Skip gag**: a "Skip — 3 BB" button fades in at 30% displayed progress. Clicking it deducts 3 BB, toasts "Skip confirmed — ETA improved", jumps the bar +7%… and extends **Stall B by 2.0s**. Fine print (4pt): "Skip reduces perceived time only." The skip is also, technically, delivery-pending (§1.3).

## 3. Reel reveal & near-miss ordering

After the snap, a horizontal 5-slot reel (visual language of the Allowance Roulette strip) decelerates over 3.2s:

- The final approach **deterministically** passes the *Half-Eaten Fruit Roll-Up* (#ff4444 Covert Extravagance, $999.99) in the slot immediately before the landing slot.
- As the needle gets adjacent, the Fruit Roll-Up slot visibly **scoots one position further** with the caption "RECALIBRATING" (dark-patterns §2.1 — the reel recalibrating in front of you).
- The reel lands on the predetermined award (§5). The reel is a movie; the award was chosen first.
- Post-land toast: "SO CLOSE! You were 1 slot from Half-Eaten Fruit Roll-Up ($999.99)." with 4pt disclosure: "(distance does not affect outcome; this reel is a movie; odds: yes)".

## 4. Award ceremony theater

Full rarity ceremony for stock photos, reusing the existing `RARITY_COLORS` vocabulary:

- Tier flare in the rarity color, tier name announced ("CLASSIFIED OVERDRAFT"), JPEG slides up hero-framed.
- **StatTrak™-style counter for stock photos**: "Downloads: 4,000,000".
- Classified+ awards get confetti ("confetti budget approved").
- Value line under every award: e.g. "Estimated Value: $4.99 · Cash Value (est.): $0.00" (the cash-out mirage, every time).
- Inventory toast: "Added to Inventory · Non-Tradeable · Withdrawal ETA: pending (§1.3)".

## 5. Award pool & odds (the only real table)

Eight **Stock JPEGs** wearing rarity tiers; the two catalog legendaries appear **reel-only** at "0.00%\* (\*rounded down from a smaller number)":

| Award | Tier | Est. value | Weight |
|---|---|---|---|
| Clip Art of a Trophy.png | Consumer Grade Trash | $0.03 | 40% |
| Stock Photo of Confused Businessman.jpg | Consumer Grade Trash | $0.05 | 25% |
| Royalty-Free Sunset Over Water.jpg | Industrial Denial | $0.35 | 15% |
| Generic Photo of a Handshake.jpg | Industrial Denial | $0.49 | 10% |
| Watermarked Preview Image.jpg | Mil-Spec Regret | $1.99 | 6% |
| Thumbnail of a Video You Already Watched.jpg | Mil-Spec Regret | $2.49 | 3% |
| Screenshot of the Leadership Slide Deck.png | Classified Overdraft | $19.99 | 0.9% |
| Stock Photo of Golden Handshake.jpg | Contraband Liability | $4.99 | 0.1% |
| *(reel-only)* Half-Eaten Fruit Roll-Up, AWP \| Mom's Visa Signature Edition | Covert Extravagance | $999.99+ | 0.0% |

The Golden Handshake is "worth exactly one key (\*was)". Odds disclosure line, visible on hover: "Odds: yes. (Full table available on request. Requests are mood-dependent.)"

## 6. Pity Meter / DupeShield™ (one rigged counter, two labels)

A single prominently displayed meter, always visible on the crate tab, serving as both pity timer and duplicate protection:

- Every crate opened increments the **Pity Meter** by 1. Header: "GUARANTEED Rare-or-better every 50 crates!™"
- **It never reaches 50.** The 50th increment triggers **RECALIBRATION**: the meter resets to a random 1–37 with the toast "PITY METER RECALIBRATED (mood improved!) (§8.9)". Small print: "pity progress may be recalculated based on mood".
- **DupeShield™**: the same meter. Duplicate awards trigger "Duplicate detected. Recycled. +0 Environmental Credits (rounded down, §8.9)" — the recycling payout is always zero after rounding. "Guaranteed NEW JPEG after 50 crates" shares the never-arriving 50.
- Technically-fulfilled honesty clause in the tooltip: "Rare-or-better" is satisfiable by any tier labeled Rare *by us*.

## 7. Free-key cadence (drip-fed, "keys from Mom")

Two drip valves, both delivered as a theatrical envelope dropping from the top of the screen, wax seal reading "MOM":

1. **Consolation Key™** — awarded on the **3rd consecutive loss in any game, once per session** (loss-leader on-ramp, dark-patterns §4.5). Envelope note: "You lost. Have a key. Crates always feel like winning.®"
2. **Daily Mom Key** — one per calendar day (localStorage day-stamp). Envelope return address: "MOM (she doesn't know)". Claiming it builds a streak: "Days Mom Checked In: N" — at 3+ the box becomes the **Premium Mom Crate (Matte)**: identical odds, shinier box (dark-patterns §4.3). Unclaimed for 24h → chat nag line (below).

Escalation into paid play is the entire point: the first Consolation Key should land around the time the Maternal Starter Grant is half-spent, so the "Open Another (15 BB)" button arrives before the first refill prompt.

Out of scope here (flagged for the retention/integration passes): a Comeback Key for returning after a 2h+ absence, and crate-themed push-nag theater.

## 8. Award destination & post-open hooks

- Awards land in the **inventory** (fake-win model): persisted locally, flagged "Non-Tradeable · Value Pending (§1.3)". Inventory surface itself is a separate concern (see open questions).
- Post-reveal buttons: **"Open Another (15 BB)"** (primary) and **"Inspect JPEG"** (shows the same image larger, watermark intact).
- If BB < 15 at reveal time, the primary button's label swaps to **"Ask Mom for Key Money"** and routes to the Ask-Mom deposit flow (#9). Buy-button label swap is the standing gag (dark-patterns §3.1).
- Every ceremony ends with the ticker line fired (§9).

## 9. Ticker & chat lines (additions to the pools)

Ticker:
- "{n} was 1 slot away from the Fruit Roll-Up (the slot moved)"
- "{n} unboxed Stock Photo of Golden Handshake.jpg (worth exactly one key)"
- "{n}'s pity meter was recalibrated for their own good (§8.9)"
- "{n} defused 12 crates today. The JPEGs are winning."
- "A key arrived from Mom (no return address)"

Chat:
- `{user:"NotABot_Trust", msg:"the pity meter is real, my cousin hit 50 once", color:"#ffd54a"}`
- `{user:"pitybeliver_2009", msg:"reset at 49?? MOOD IMPROVED???", color:"#e8c9ac"}`
- `{user:"MOD_Chad_Official", msg:"free keys arrive when you least deserve them", color:"#8fd97a"}`

## 10. State (client-side only)

localStorage keys, all theater: `hfes_crate_count_session`, `hfes_crate_pity`, `hfes_crate_dupes`, `hfes_crate_inventory`, `hfes_crate_momkey_day`, `hfes_crate_momkey_streak`, `hfes_crate_sub`. No server, no accounts, no real anything.

## Open questions sharpened by this spec

- **Inventory surface**: awards now land somewhere — where is inventory rendered, and does the Marketplace Catalog gain a "Your JPEGs (0 tradeable)" section? Needs a home (map fog or a new ticket).
- **Session definition**: the defuse escalation and Consolation Key use "session = page load"; other surfaces may want a shared definition (integration pass).
- **Cross-surface composition**: loss-streak → Consolation Key → crate → Ask-Mom routing is this ticket's slice; global sequencing belongs to the integration pass.
