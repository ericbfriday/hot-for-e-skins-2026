# Marketplace & Inventory — resolution spec

Resolves [Brainstorm: Marketplace & inventory](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/12). Obeys the locked economy ([#2](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/2)): games cost BB; every held item is a fake win; nothing is ever withdrawable (ToS §1.3); derived denominations are display-only; the USD figure is and remains the cash-out mirage ($0.00).

Core thesis, one line: **you can only ever liquidate things you didn't pay for — and even then, barely.**

---

## 1. Inventory model — what a held skin is

Two classes of held item:

- **Market-Grade** — the ten CATALOG skins (`skin_01`–`skin_10`), acquired via fake wins, market purchases, or the Trade-Up Contract. Sellable (barely), tradeable-up (if fake-won), re-stealable.
- **Digital Asset** — the crate JPEG awards ("Generic Stock Photo of Handshake.jpg (Non-Tradeable)", etc.). Non-sellable, non-listable, non-contractible. Estimated value field reads `Priceless (est. value: emotional)`. Section header in the inventory: "Digital Assets (Non-Tradeable, Non-Refundable, Non-Why)". Sell button tooltip: "This asset cannot be traded because it is worthless. A rare consistency from us."

Each Market-Grade held item carries:

| Field | Decision |
|---|---|
| `uid` | per-copy identity; all per-item randomness derives deterministically from it |
| `float` | 10 decimal places, e.g. `0.0382716493`. Label: **"Float Value (verified by nobody)"** |
| `wear` | inherits the catalog wear tag ("Minimal Debt", "Field-Tested Anxiety", …) plus the acquisition stamp **"(Certified Pre-Worse™)"**. Wear can be worsened by appraisal events, never improved |
| `statTrak` | copies of StatTrak™ skins carry the catalog counter ("Unpaid Chores", "Chargebacks Pending", …); counters **increment on the player's game losses**, never wins |
| `provenance` | append-only ledger of humiliations (see below) |
| `tradeHold` | purchased items: perpetual **"Trade Hold: 8 days (0 hours elapsed)"** — the elapsed counter never increments. Fake-won and contract items: no hold |
| `listedForBB` | asking price while listed, else null |

**Provenance ledger entries** (copy locked, in voice):
- "Acquired: fake win (game was conducted per §4.1; you're welcome)"
- "Acquired: marketplace purchase (receipt available, refund not)"
- "Re-appraised downward (§8.9)"
- "Condition worsened: Field-Tested Anxiety → Battle-Scarred Anxiety (Certified Pre-Worse™)"
- "Listing fee assessed (non-refundable, unforgettable)"
- "Removed by Rollback Event (see Market Event Receipt)"
- "Sold via Instant Sell™. We miss it. Not you, it."

Because every purchased item carries the perpetual trade hold, **only fake-won items can ever be sold or contracted**. Purchases are decorative. This is intentional and load-bearing.

## 2. Inventory surface — placement, layout, theater

- **Placement**: a header chip beside the balance chips — **"PORTFOLIO: $1,436.80 (est. ▲)"** — opening a full-screen overlay. Not a game tab; the inventory is a destination, not a game.
- **Overlay top summary**, three lines:
  - `Total Estimated Value: $X,XXX.XX` (see §10 — only ever rises)
  - `Portfolio All-Time High: $X,XXX.XX` (same number or higher, always)
  - `Cash Value (est.): $0.00` (permanent; hover: "This figure is load-bearing. It carries the whole joke.")
- **Sections**, top to bottom: Market-Grade grid → Active listings → Pending Withdrawals → Trade-Up Contract workspace → Digital Assets → Sold Ledger.
- **Grid**: rarity-colored card borders (existing palette), fake filters ("Filter: Soon™" dropdown with one option: "All items (recommended by us)").
- **Item detail modal** (click a card): large skin render with a slow parallax "3D" spin (it is the same JPEG wearing a "3D" badge); float line; StatTrak™ counter; provenance ledger; action buttons: **Instant Sell™**, **List on Market**, **Add to Contract** (disabled until 5 same-tier: "requires 4 more regrets").

## 3. Acquisition paths

- **Fake wins** (award *rates* belong to the per-surface game brainstorms — this spec defines what happens when one lands): confetti + ticker line ("{gamertag} won a Rubber Band Ball (the house is fine financially)"); item lands in inventory with `acquiredVia: fake-win`. Distribution when a win fires: bottom two tiers 90%, middle 9.9%, Covert/Contraband 0.1% (the near-miss reel may *show* the top tier regardless — the reel is decorative, per the catalogue's near-miss entry).
- **Market purchases**: BB leaves the balance at checkout (§4); item arrives immediately, stamped with the perpetual trade hold and provenance entry.

## 4. Marketplace catalog & pricing theater

The existing catalog grid becomes a live marketplace. Per card:

- **Two figures**: the parody-USD **estimate** (inherits the catalog `estimatedValue` as its baseline) and **"You Pay: N BB"**.
- **Denomination rule**: estimates in fake USD (theater), **transacted in BB only**. The market never accepts OC — "The Marketplace does not accept Obtuse Credits™. Convert first (see §8.9)." OC remains one-way and deposit-only, per the locked economy.
- **Volatility per §8.9**: `currentEst = baselineEst × volFactor(item, hour)`. Volatility classes: Stable-ish ±5%, Moody ±40%, and the Half-Eaten Fruit Roll-Up **±800%** (vol ∈ [0.1, 9.0]; some hours it costs ~27,000 BB). Footer of each card: "Estimate updated per §8.9."
- **Buy math**: `priceBB = ceil(currentEst × 3 × volFactor) + fees`, fees itemized at checkout, mirroring the conversion-fee lineup:
  - Buyer Protection Fee — 7.3%
  - Escrow Handling — flat 5 BB
  - Maternal Gratuity — 1 BB ("customary, not required, automatically applied")
  - §8.9 rounding: player credits round down; **fees round up** ("also for you")
- **Buy buttons never dodge.** The hover-swap gag is reserved for exits (crash cash-out, cancellations). Deposits and purchases are frictionless; exits are mazes. This asymmetry *is* the site.
- **Featured rotation**: a "TRENDING NOW 🔥" row rotates deterministically every 45s. The featured item is always the cheapest thing the player **cannot** afford; the instant a featured item becomes affordable it rotates out with "JUST SOLD: someone faster". Hovering a card occasionally flickers a "Sold ×3 (Ohio)" overlay.
- **Market index ticker**: the ticker sidebar gains a "MARKET (HFES-10)" block — see §10.

## 5. Selling, path A — Instant Sell™ (the insulting exit)

The only path that ever credits BB, and it hurts.

- **Math (locked)**: `offerBB = max(1, floor(min(currentEst, baselineEst) × 3 × 0.001))` — 0.1% of BB-parity, computed on **the lower of the current or baseline estimate, whichever is lower (§8.9)**, §8.9-rounded down, floored at 1 BB.
- Sanity anchors: AWP ($8,500) → 25 BB; School WiFi ($4,000) → 12 BB; Spork ($1,420.69) → 4 BB; Participation Trophy ($16) → 1 BB; Cardboard Box ($0.02) → 1 BB. Everything the player mostly holds: 1 BB.
- **Copy**: button label "Instant Sell™"; sub-line "Offer reflects current market liquidity, our mood, and §8.9." Confirmation receipt line: "You have received 1 BB. The estimated value was $16.00. The difference covers administrative realism."
- Item leaves inventory; Sold Ledger gains a line ("Sold: Participation Trophy — realized $0.33 per $1,000 of estimated value").

## 6. Selling, path B — Marketplace listing (the fake exit)

The higher-"value" path is the trap.

- To list, set an asking price in BB. On save: **Listing Fee 5 BB** (non-refundable) + **Maternal Gratuity 1 BB**. Buyer Protection 7.3% is *deducted from proceeds later*.
- **Lifecycle**: listing shows "0 views". After exactly one refresh it shows "1 view: AdminTradeBot_69". There is one offer, ever: a lowball from AdminTradeBot_69 — "0.02 BB + exposure. Final offer." Accepting routes proceeds to Escrow (§7).
- Otherwise, once the player has been idle 90s (or tab-blurred), the listing flips to "SOLD!" at full asking price — but **proceeds never touch the BB balance**. Itemized "settlement receipt": asking − 7.3% Buyer Protection − 5 BB Settlement Fee − §8.9 rounding = **"Credited to Escrow (converts to withdrawal queue)"** → Pending Withdrawal, forever.
- **Cancel listing**: costs 3 BB "Delisting Fee"; item returns with provenance "relisted after public shame".
- Rational? No. That's the cash-out mirage: the only exit that pays is the insulting one.

## 7. Pending withdrawal UI — eternal processing

- Panel of cards, one per withdrawal/escrow event: amount (in parody USD and "OC-equivalent at the day's *worst* mood band"), and a progress bar creeping to **99.9%** then resetting to 0 with a rotating status reason (deterministic order):
  1. "Notarized 4th-grade report card: not received"
  2. "Guidance counselor letter: handwriting inconclusive"
  3. "Energy drinks: 0 of 3 delivered to Grand Cayman"
  4. "Payment provider is at lunch"
  5. "Queue position: 847 of 847 (you are both first and last)"
  6. "Recalculated per §8.9 — starting over, in fairness"
- A **§1.3 compliance checklist** shows the three notarized requirements, each perpetually "In review".
- **SupportBot (MOM-TRUSTED™)**: appeal button opens a chat that cycles canned deflections — "Have you tried asking Mom?", "Your withdrawal is important to us. It is not, however, important to anyone else.", "Transfer appears intentional (it was)." — then closes the ticket: "Resolved (by us)."
- No withdrawal card ever changes state except reason text and progress reset. Ever.

## 8. Trade-Up Contract — combine trash, receive slightly-less-trash

- **The Trade-Up Contract (Patent Pending, Outcome Pending)**: select 5 Market-Grade items of the same tier + pay **Contract Origination Fee 5 BB** + Maternal Gratuity 1 BB.
- Output: **the cheapest item of the next tier up**. Always. The contract reel is decorative and visibly slows past Covert Extravagance before landing (near-miss reel callback; the Covert slot scoots one position left as the needle approaches).
- Output float = **worst of the five inputs + 0.01**. StatTrak™ counters do not transfer ("they were never yours").
- 15% of contracts resolve to a Crate JPEG instead of a skin: "The contract has been fulfilled with a complementary photograph."
- Never outputs Contraband Liability or Covert Extravagance. Never accepts: JPEGs, listed items, items in trade hold (so, all purchases — again).

## 9. Rollback Event — re-stealing (decided: yes)

- On session load, deterministic daily seed: if the inventory holds ≥ 3 Market-Grade items and the last rollback was > 24h ago, a **10%** Rollback Event fires (max once per 24h; never mid-animation).
- The held item with the highest **baseline** estimate is removed. Left in its place: a **Market Event Receipt** card — estimated value `$0.00`, flavor "Ownership recalculated per §8.9. The item is fine. You can't see it anymore, but it's fine.", Instant Sell™ offer of exactly 1 BB, not contractible, not re-stealable (the house doesn't steal from itself).
- Ticker line: "Scheduled maintenance: 1 (one) item was never yours."
- Appeal → SupportBot (§7) → "Transfer appears intentional (it was)."

## 10. Market index & portfolio value — up is the only direction

- **HFES-10 Composite**: mean of `currentEst/baselineEst` across the ten catalog skins, indexed from 1,000.00 at first session. Rendered in the ticker sidebar as "MARKET (HFES-10): 1,0XX.XX ▲". Down-ticks render as "▲ −0.4% (display error, §8.9)" — the displayed index is the running max, so it has never gone down. Footnote: "The HFES-10 has never gone down. Neither has anyone's opinion of us."
- **Portfolio value**: monotonic. It equals the sum of acquisition baselines and only ever rises (acquisitions add; thefts move the item to "Realized Losses (not counted)" — "Realized losses are not reflected in estimated value (§8.9)"). The header chip and All-Time High never decrease.
- Beneath every total, always: `Cash Value (est.): $0.00`.

## 11. Persistence & determinism

- localStorage keys: `hfes_inventory` (items), `hfes_escrow` (pending withdrawals), `hfes_portfolio_high`, `hfes_listings`, `hfes_rollback_last`.
- All "random" market behavior (volatility, index, rotation, rollback, lowballs) derives from deterministic seeds (item, hour, date) — same for everyone, same on reload, rigged by construction and still blameless ("it's in the seed").
- The house always wins eventually; here it also wins immediately, and itemizes it.

## Handoff notes (for the map's integration pass, not this ticket)

- Fake-win **award rates** are per-surface decisions (roulette/coinflip/crash/crates tickets); this spec defines what a landing win looks like.
- Ticker sidebar gains the MARKET block; ticker templates gain rollback/sale/instant-sell lines — fold into the ticker/chat ticket or integration pass.
- StatTrak™ counters incrementing on losses requires a loss event bus — integration pass.
