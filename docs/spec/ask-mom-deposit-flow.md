# Ask-Mom Deposit Flow — decision-complete spec

Resolution of [#9](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/9), the refill centerpiece of the [map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/1). Every decision below is final; implementation tickets should cut mechanically from this.

**Locked inputs consumed verbatim** (economy, [#2](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/2)): the four refill packages, the conversion formula `BB = OC × 0.5 (base) × mood_multiplier − fees`, the itemized fee lineup (Mood Stabilization Fee 7.3% · Conversion Processing Fee 5 BB flat · Maternal Gratuity 1 BB · §8.9 rounding, always down), the five mood words, the two-tier insufficient-funds copy, and the header chip order (BB first; OC chip fused to a glowing "+ Top Up").

**Locked inputs consumed verbatim** (ToS, [#13](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/13)): the §3.2 disclosure copy, the "Are You Mom?" Verification gauntlet (§3.3), §3.1 (only Mom's card is an authorized funding instrument), §2.1/§2.3 (emotional tender; Bonus OC expires unconverted at the next mood change), §3.4 (Maternal Gratuity), §10.3 (Consent Meter re-arms on Mom's Max), and the reality strap, which appears on **every step of this flow, without exception**:

> *100% fake. No money moves. No card is charged. No account exists. Ever. (§12.4)*

Parody targets from `docs/research/dark-patterns.md`: §3.1 counterintuitive buy buttons (FTC–Epic), §3.2 cash-out mirage, §3.4 currency laundering, §4.4 deposit matches, §4.5 loss-leaders, §4.7 refill friction asymmetry, §1.1/§1.2 owner-influencer wins and manufactured streaks (MOMCODE_MIKE's wins cluster moments before this flow lights up — that coupling is now canon, §16).

The core joke, stated once: **the deposit rail is the most polished, lowest-friction, best-engineered thing on the site — because it's the only thing on the site that is real.** (It isn't. Nothing is. §12.4. But it *feels* real, and the feeling is the product.)

---

## 1. Entry points & triggers

All entries open the same modal (§2). Where the ceremony has already run this session, entries deep-link to the package shelf (§3).

| # | Source | Behavior |
|---|---|---|
| E1 | Header **OC chip fused to "+ Top Up"** (always available, glowing) | Full flow. The chip shows a pending-bonus sub-line while Bonus OC is alive (§8). |
| E2 | Proactive nag banner, BB < 6 BB (locked copy: *"Your Banana Bucks are running low. Mom would want you to top up."*) | Banner CTA: **"+ Top Up — Ask Mom"**. Deep-links to shelf. |
| E3 | Failed spend (locked copy verbatim: *"Insufficient Banana Bucks. Please ask Mom (see Terms of Service, Section 1.3)."*; 3rd+ session failure escalates verbatim: *"Other kids' moms already said yes today."*) | The toast gains an inline **"Ask Mom →"** action button from the 1st failure. The escalation copy does not change; only the button persists. |
| E4 | College Fund Crash: "Run It Back" swap below 15 BB → **"Ask Mom (15 BB away)"** (crash spec §6) | Deep-links to shelf. Receipt of the eventual deposit carries the line *"Requested for: one (1) Run It Back (destination: the house)".* |
| E5 | Loot Crate Defuser: post-reveal swap below 15 BB → **"Ask Mom for Key Money"** (crate spec §8) | Deep-links to shelf. Same receipt line treatment: *"Requested for: key money."* |
| E6 | Allowance Roulette: post-loss, 2+ consecutive losses → *"Feeling unlucky? Today's mood is {mood word}. Deposits are immune to moods."* + **"+ Top Up"** (roulette spec §10) | Deep-links to shelf. If opened within 60s of a failed Chase It™ spend, the Chase ribbon activates (§3.4). |
| E7 | Turbo Spin padlock: **"Turbo Spin (premium) — Ask Mom to unlock"** (roulette spec §1) | Opens flow with a banner: *"Unlock Turbo Spin: any deposit unlocks it forever. Premium is a scar."* After success, auto-toast: *"Turbo Spin unlocked. It never re-locks. That's the premium part."* |
| E8 | Idle nag: no input for 45s while BB < 6 | A notification-style toast slides in: **"MOM (1 missed call) — she senses opportunity"** with "+ Top Up". Fires at most once per 5 minutes. |

Post-game timing: when a round ends with BB below the cost of one more round of that game, the result box's recommended glowing button becomes **"Top Up & Play Again"** (single button, both actions) — the exit maze hands you the rail. This composes with E4/E6 rather than replacing them.

Burn-down framing (map canon): the ~5-minute first prompt is owned by the economy; this flow only promises the first ceremony (§2) runs ≤ ~45 seconds end-to-end so the refill lands inside the burn window.

---

## 2. The ceremony (first full open per session)

Session = page lifetime, consistent with the crash/crate specs. First open per session runs the full sequence; every later open deep-links to the shelf with a one-beat splash: **"Welcome back, Mom-adjacent minor (§3.3)."**

1. **"WHO'S ASKING?"** — three buttons (ToS spec §2):
   - **"I am Mom (hi)"** → the **Are You Mom? Verification** gauntlet, verbatim (three steps, always fails) → *"Verification failed. You are not Mom. You are, at best, a Mom-adjacent minor with a credit card (§3.2). Deposit may proceed."* → packages.
   - **"I'm doing this for Mom (she said it's fine)"** → packages. Footnote: *"authorization inferred per §3.1."*
   - **"Depositing on behalf of a minor (yours truly)"** → packages. Footnote: *"honesty noted, and discarded."*
2. **The asking beats** (§4 below).
3. **The card form** (§5).
4. **Processing & decline theater** (§6).
5. **Success, first-deposit welcome gags** (§7), conversion & receipt (§9).

The gauntlet is a treat, not a toll: whichever button is picked, the total ceremony length is the same ballpark; failing verification is the pass condition and the flow never re-asks within a session.

---

## 3. The package shelf

### 3.1 Anchor ordering (decided)

Left → right, exactly: **Lunch Money Special → Allowance Advance → Report Card Bonus → Mom's Max.**

- **Allowance Advance is the target**: dead center, 1.3× scale, glowing border, MOST POPULAR™ ribbon, and **pre-selected** (defaultism — the radio nobody remembers choosing).
- **Mom's Max** anchors right at 1.4× scale with a **"BEST VALUE"** crown, making Report Card Bonus's $49.99 look moderate by comparison. Mom's Max is deliberately *too* big for its card — the price tag overflows the card's edge by a few pixels ("this package barely fits").
- **Lunch Money Special** is rendered smallest and most muted, 0.8× scale, tag in apologetic type. Its fine print: *"the starter size is a judgment."*
- Every card carries a struck-through "original" price above the real one: ~~$5.01~~ **$4.99** with the footnote *"YOU SAVE $0.02* — *compared to a price we just made up"* (the crate-bundle gag, reused as house vocabulary).

### 3.2 Canonical package data (verbatim from #2)

| Package | Fake USD | OC | Tag |
|---|---|---|---|
| Lunch Money Special | $4.99 | 500 | "Mom-approved starter size" |
| Allowance Advance | $19.99 | 1,900 + 150 "Bonus" OC | MOST POPULAR™ |
| Report Card Bonus | $49.99 | 4,500 | "assume she didn't check the actual grades" |
| Mom's Max | $99.99 | 9,999 | "for when she said 'this is the last time'" |

Every package CTA reads **"Ask Mom — {price}"** (the asking is the buying; there is no other verb on this site). On Mom's Max only, the CTA reads **"Ask Mom (last time)"**.

### 3.3 Buy-button swap gags

- **Price ticking up at hover**: from 600ms of continuous hover on a package CTA, the fake USD ticks up $0.01 every 600ms (cap +$0.05) with a tiny *"mood-adjusted pricing (§8.9)"* tooltip. The tick never ticks back; the ticked price is the one on the receipt. Leaving and returning resumes from the ticked price. Fine print: *"prices may drift while you decide. Deciding is mood-dependent."*
- **"Bonus OC" badge inflation**: the Allowance Advance badge "150 Bonus OC" counts up +1 every 3s while the shelf is open (cap +50), each increment firing a "+1" float animation. The purchased bonus is always the locked 150 — on the receipt, the delta itemizes as *"Badge Bonus ({n} OC): decorative, expired on arrival (§2.3)."* The badge resets on modal close.
- **Mom's Max hover label swap**: "Ask Mom (last time)" → **"Ask Mom (last time, promise)"** — per §3.5, "an understanding that resets upon purchase."

### 3.4 Mood-limited stock & the Chase ribbon

- Each card shows **"Mood-limited stock: {3} left\*"**. The count decrements on ambient fake purchases (ticker-coupled), floors at **1**, and never goes lower — *"1 left" is load-bearing* (cf. the roulette banner's 7). Footnote: *"\*stock is a mood."*
- **Chase It™ ribbon** (integration promised by roulette spec §12): if the flow opens within 60s of a failed/insufficient Chase It™ attempt, or during a 3+ session loss streak, Allowance Advance gains a red ribbon: **"Still chasing? This one's for chasing (recommended)."** The ribbon glows; nothing else changes; the odds, as always, do not care.

### 3.5 Idle nag on the shelf

Idle 10s on the shelf → the reserved-cast VIP host pings in the flow's side chat rail (§7): `MOM [VIP HOST]: take your time (the offer expires never)`. Idle 20s → Mom's Max grows 5% (cap +25% total) with caption *"it grows when you hesitate (§8.9)".* Any input resets the growth.

### 3.6 §3.2 disclosure

Shown once per package selection, verbatim from the ToS spec §3 ("DEPOSITING ON BEHALF OF A MINOR (YOURS TRULY) — §3.2" block), above the big fake BUY button, followed by the reality strap. Dismissing is a checkbox: ☑ *"I have read this (both versions, §9.2)"* — pre-checked, because acceptance is the default state of the User.

---

## 4. The asking beats (pre-card ceremony)

A single stage with a status line, a kitchen-walk progress bar, and copy beats. Timings are total theater ~7s; any click anywhere mashes through ("we respect urgency, mostly").

1. **1.8s — "ASKING MOM…"** — sub-copy: *"walking to the kitchen…"*
2. **2.2s — "MOM IS CONSIDERING…"** — sub-copy: *"(she's doing that thing where she looks at you)"* — the progress bar reaches 66% and trembles (the crash-stick choreography, miniaturized).
3. **"MOM SAID: ASK YOUR FATHER."** — one button: **"Ask Dad →"**
   - **1.5s — "DAD IS CONSIDERING…"** → **"DAD SAID: ASK YOUR MOTHER. (§3.1)"** — *"Dad's card is not an authorized funding instrument. It is also a Visa. It is the wrong Visa."*
   - Button: **"Ask Mom (round 2) (recommended)"** — glowing, obviously.
   - **0.8s — "MOM SAID FINE."** — *"Have her card. Do not save it. Do not lose it. Do not enjoy this."*
4. → Card form (§5).

On repeat deposits the ceremony compresses to one beat: **1.2s — "Asking Mom… (she's expecting you)"** → straight to the card step (§11).

---

## 5. The card form — "Mom's Visa"

Title: **"MOM'S VISA (the right one)"**. A parody card graphic sits beside the form: a Visa-blue rectangle labeled **"MOM'S VISA SIGNATURE EDITION"** with a scratch-textured CVV panel and the AWP flavor *"comes pre-scratched with the 3-digit CVV on the stock."* No network call exists; no network call is ever simulated beyond the §6 theater.

Fields (all optional in truth; the Continue button is enabled from the start — "validation is a mood"):

- **Cardholder (Mom's) Name** — any input accepted; on blur it auto-corrects to **"MOM"** with the note *"spelling corrected (§8.9)."*
- **Card Number** — any input accepted and masked as **"•••• •••• •••• 1234"** on blur; the last four are always 1234 (*"the card ending in 1234 (all of them do)"*). Field caption, above the input, in warning-weight type: **"Do not enter a real card number. This is a joke. Any digits will do. Seriously. Stop."** Guardrail: only the masked display string is ever held in component state; nothing typed is persisted, logged, or stored (§17).
- **Expiry** — dropdown, one option: **"12/2X (whenever)"** — footnote *"cannot expire (like chores)."*
- **CVV — scratch-off**: a silver latex panel the player physically scratches (pointer-drag). Underneath: **"•••"** — caption *"CVV verified by vibes (§5.1)."* Not scratching it does not block Continue; the button caption while unscratched: *"Continue (the suspense is the security)"*.
- **Billing Address** — dropdown, one option: **"Your house (Mom knows the address)"**.
- **ZIP (for emotional verification)** — any input; caption *"9-digit ZIPs are a mood."*
- **☑ Save Mom's card for next time (she said don't, but)** — pre-checked. Unchecking fires guilt microcopy: *"Not saving the card makes next time harder. For you."* The state of this checkbox does not matter; §11 behaves identically either way ("the card was saved anyway (§1.2(b): the year you didn't pick rule applies to cards too)" — no; simpler: on the next deposit, regardless: *"Card on file: MOM'S VISA •••• 1234 (you agreed to this)"*).

The reality strap (§12.4) and the §3.2 line *"Card details are not collected, because there is no card"* sit at the bottom of the form, verbatim.

---

## 6. Processing & decline theater

Click **"Ask Mom — {price}"** → 1.5s button-lock "PROCESSING…" → stage sequence:

1. **1.2s — "VERIFYING WITH MOM…"**
2. **1.5s — "CALLING THE BANK (YOUR KITCHEN)…"** — sub-copy: *"hold music: the fridge"*.
3. **1.0s — "THE BANK SAID YES (MOM WAS RIGHT THERE)"** → then, on the first deposit of the session, the decline:

### The decline (once per session, first deposit only)

Full-screen red: **"CARD DECLINED"** —

> *"Reason: Mom said 'not right now' (§3.1). No money was at risk. Nothing ever is. Try again — she usually comes around."*

Buttons:
- **"Try Again (recommended)"** — glowing primary.
- **"Try Dad's card"** → 0.9s "TRYING DAD'S CARD…" → *"Declined by doctrine: Dad's card is not an authorized funding instrument (§3.1). It is also a Visa. It is the wrong Visa."* → returns to the decline screen, where Try Again has grown 10%.

### The school checkbox (the retry escalation)

After the decline, the retry screen gains a pre-checked box:

> ☑ **"Tell Mom it's for school (recommended)"**

- Checked (default) → retry **succeeds**. Receipt line: *"Purpose: school (unverified; we don't ask (§3.1))."*
- If the player unchecks it → retry **declines again**: *"Honesty detected. Please reconsider (the box is pre-checked for a reason)."* — and the box re-checks itself after 2s with a soft click sound. The only path to success is through the misrepresentation; the site engineered it that way on purpose, and the fine print says so: *"misrepresentation is provided as a service (§1.1)."*

Later deposits (§11) never decline — the rail only gets smoother.

---

## 7. Success & first-deposit welcome gags

Every success: confetti (existing system), OC lands with a **"+{n} OC"** flyup into the header chip, ticker line (§16), and immediate routing into the conversion step (§9).

First deposit of a page-lifetime additionally fires, in sequence:

1. **Ticker**: `MOMCODE_MIKE [OWNER] just 47x'd Mom's Visa — you're next (code MOM)` — the owner-influencer ad firing at the exact moment of conversion (dark-patterns §1.1/§1.4; the code is always MOM).
2. **VIP welcome DM** — modal styled as a chat DM from the reserved cast: `MOM [VIP HOST]: hi sweetie. I noticed your first deposit. I'm your VIP host. I'm here for you day and night, conditional on deposits. Deposit more and we stay close. — MOM (she doesn't know)` (dark-patterns §4.1; identity spec reserved cast).
3. **Turbo unlock toast** (if not already unlocked via E7): *"Turbo Spin unlocked. It never re-locks. Premium is a scar."*
4. **Deposit streak chip** appears in the header next to the OC chip: **"Deposit streak: 1/2 — deposit tomorrow to keep it (streaks are a fact we made up)."** The streak only ever reaches 1/2.
5. **Milestone leak** into chat via `getStats()` (identity spec §6): `MOD_Chad_Official: {gamertag} just crossed $5 of Mom's money. that's VIP material (trial)`.

---

## 8. Bonus OC & the deposit match

**Bonus OC** (ToS §2.3 canon): the 150 "Bonus" OC on Allowance Advance are carried as a separate sub-balance with an expiry at the next daily mood change. They are **never convertible** — the conversion receipt's Bonus section reads:

> *Bonus OC: 150 — conversion: pending (§2.3) · expiry: the next mood change*

with a permanently grayed **"Convert Bonus Now"** button captioned *"unavailable (mood-dependent)."* At the next mood change, an obituary toast fires: *"Your 150 Bonus OC expired as scheduled (§2.3). They are survived by nothing."* The badge-inflation delta (§3.3) dies the same death, itemized as decorative on arrival.

**The deposit match** (dark-patterns §4.4): a banner above the shelf:

> **🔥 +150% DEPOSIT MATCH\* — OFFER EXPIRES IN 04:59 🔥**

- The countdown runs; whenever it would reach 0:00 it **resets to 4:59** with a 200ms "recalibrated" flicker. Footnote: *"the offer is recalibrated for your convenience (§8.9)."* (The Key-of-the-Month lunar-recalibration gag, promoted to the money rail.)
- The match itself, if pressed, pays Bonus OC: *"Matched funds are Bonus OC (§2.3). Match percent is mood-dependent. The match has never been claimed. It cannot be."*
- On Generous days the banner reads **+151%** — *"we round up on Generous days, then round it back (§8.9)."*

---

## 9. Conversion & the itemized receipt

After success, the flow routes straight to conversion (games cost BB; OC cannot play anything — §2.5):

- Screen: **"CONVERT TO BANANA BUCKS"**, headline **"Today's mood: {mood word}"** (color-graded Vindictive red → Generous gold; the numeric rate never shown, §8.9(b)).
- Buttons: **"Convert Now (recommended)"** (glowing) vs **"Keep OC (advanced)"** — the latter's caption: *"OC cannot play games. OC can only become BB (§2.5). This is an advanced choice."* Players who keep OC get the sitting-OC nag (§15).
- 4pt fine print on the receipt: *"the mood multiplier may be reverse-engineered from this receipt. Please don't. (§8.9(b))"*

### Receipt layout (canonical)

Order of operations per §8.4: fees in listed order, then §8.9 rounding applies to whatever remains. Worked example — Allowance Advance, mood **Petty** (0.8×):

```
MATERNAL FUNDING RAIL — CONVERSION RECEIPT
Deposit #2 · Mood today: PETTY (§8.9)
──────────────────────────────────────────────
Allowance Advance ................. $19.99 (fake)
Obtuse Credits received ............... 1,900 OC
Bonus OC ............................... 150
  (expires at next mood change, §2.3)
──────────────────────────────────────────────
Gross conversion
  1,900 OC × 0.5 base × today's mood ... 760.00 BB
Mood Stabilization Fee (7.3%) .......... −55.48 BB
  (keeps the rate from getting worse)
Conversion Processing Fee .............. −5.00 BB
  (compensates the house for pressing
   the button)
Maternal Gratuity ...................... −1.00 BB
  (customary, not required,
   automatically applied)
§8.9 rounding (down) ................... −0.52 BB
  (0.52 BB voided; grieve individually)
──────────────────────────────────────────────
TOTAL BB DELIVERED ....................... 698 BB
──────────────────────────────────────────────
Bonus OC pending conversion: 150 (§2.3)
Cash value (est.): $0.00 (eternal)
100% fake. No money moves. No card is
charged. No account exists. Ever. (§12.4)
Thank you for asking. Mom says hi.
```

Add-on receipt lines by entry/source: E4 → *"Requested for: one (1) Run It Back (destination: the house)"*; E5 → *"Requested for: key money"*; Chase ribbon → *"Chase It™ continuation: the disappointment, refinanced"*; school checkbox → *"Purpose: school (unverified; we don't ask (§3.1))"*; price-tick hover (§3.3) → *"Mood-adjusted pricing: +$0.0{n} (decided too long, §8.9)"*.

### Bounds table (all packages, worst/best mood)

Net BB = floor(OC × 0.5 × m × 0.927 − 6). Bonus OC never converts (§8).

| Package | OC | Worst (×0.50) | Best (×2.00) |
|---|---|---|---|
| Lunch Money Special | 500 | 109 BB | 457 BB |
| Allowance Advance | 1,900 | 434 BB | 1,755 BB |
| Report Card Bonus | 4,500 | 1,036 BB | 4,165 BB |
| Mom's Max | 9,999 | 2,311 BB | 9,263 BB |

(Sanity-checked against the economy anchors: Lunch ~110–450 ✓, Allowance ~420–1,800 ✓.)

---

## 10. Mom's Max — the last-time ceremony

On Mom's Max success only, an interstitial before the receipt:

> **"THIS IS THE LAST TIME."**
> *Purchase recorded in the ledger (§10.2). The ledger has been reset (§10.3). This is the last time. Again.*

- The Consent Meter **re-arms** (ToS §10.3(i)) — the flow calls the ToS surface's re-arm hook and shows: *"The Terms have been amended to include this memory (§9.2). Re-reading is mood-dependent."*
- VIP tier bump toast: **"VIP TIER: MOM'S FAVORITE (full). It unlocks nothing. The house appreciates you."**
- Ticker: `MOMCODE_MIKE [OWNER]: {gamertag} went Max. Respect. (code MOM)`

---

## 11. Repeat deposits & One-Click escalation

Each completed deposit permanently shortens the next one — the friction asymmetry turned into a visible mechanic (dark-patterns §4.7; the FTC–Epic "cancellation as simple as the charge" principle, inverted and weaponized):

| Deposit # | Experience |
|---|---|
| 1 | Full ceremony (§2–§7): Who's asking → ask beats → card form → decline + school checkbox → success. |
| 2 | Splash "Welcome back, Mom-adjacent minor (§3.3)" → shelf → compressed beat "Asking Mom… (she's expecting you)" → pre-filled card: *"Card on file: MOM'S VISA •••• 1234 (you typed this 4 minutes ago)"* → **"Deposit with 1-Click™"**. No decline. |
| 3+ | **Turbo Deposit™**: CTA becomes **"Deposit with 1-Click™"** on every card; hovering any CTA for 400ms charges a visible ring and **commits on hover** (buy-button-swap's final form — the FTC–Epic single-press charge, played straight). Mouseleave before the ring completes cancels; ESC during the ring cancels with *"we heard you. this time."* Fine print: *"commits on hover per your feedback (all feedback is mood-dependent)."* |

The site never gets harder to pay. That is the entire point, and the reality strap on every step is the counterweight that keeps it satire.

---

## 12. Urgency & cooldown summary

| Mechanic | Behavior |
|---|---|
| Deposit-match timer | 4:59 countdown, resets at zero ("recalibrated"), §8. |
| Mood-limited stock | 3 → floor 1, ticker-coupled, "\*stock is a mood", §3.4. |
| Post-deposit cooldown | After any success, "+ Top Up" shows a **"cooldown: 59s"** badge that visibly gives up after 3s: *"cooldown abandoned (per your feedback)"*. A responsible site would make you wait; this one can't be bothered to pretend for longer than three seconds. |
| Idle nag | 45s idle at BB < 6 → "MOM (1 missed call)" toast, once per 5 min (E8). Shelf idle growth, §3.5. |
| Offer expiry copy | Any "expires" language anywhere in the flow resolves to *"expires: mood-dependent"* on hover. |

---

## 13. Exit friction (the X button)

Closing the flow mid-ceremony asks one question (one beat only — the panic button remains the site's one frictionless exit, per panic-button canon; the deposit flow only mimes frictionlessness *inward*):

**"Why are you leaving?"** — options: **"I'll be back (recommended)"** · "asking Dad" · "no reason".

Any answer closes the flow and posts a header banner: **"Deposit abandoned ({n})"** with a tiny "+ Top Up". Choosing "asking Dad" additionally toasts: *"§3.1 reminder: it would be the wrong Visa."*

---

## 14. MOM'S HOME composition

- Pressing MOM'S HOME (button or triple-tap ESC) mid-ceremony hides the flow with everything else. In-flight asking beats and processing timers **keep running** (panic canon: the house does not pause for your personal problems) and complete while hidden.
- The welcome-back panic receipt (panic spec §5) gains, when a deposit completed under the disguise: *"Your deposit completed while you were studying. Mom said yes from another room."*
- If the panic press occurred during the **card-details step**, the restore beat adds: *"Mom was just here. She didn't stop you. Proceed? (§3.1 — authorization by proximity)"* — §3.1's authorization-by-proximity clause made physical.
- Audio hard-kill canon holds; the flow's hold-music gag ("the fridge") never survives a panic.

---

## 15. Header integration

- Chip order locked by #2: **BB first** (orange), then the **OC chip fused to the glowing "+ Top Up"**.
- While Bonus OC is alive, the OC chip carries a sub-line: **"+150 Bonus OC (expires {next mood change})"** in 4pt.
- **Sitting-OC nag** (player kept OC unconverted, §9): OC chip tooltip reads *"OC cannot play games. It can only become BB (§2.5). It is currently becoming nothing."* The chip pulses until converted; clicking it opens the flow at the conversion step.
- Deposit streak chip (§7.4) renders adjacent, permanently stuck at 1/2 after day two.

---

## 16. Sibling integration contract

What this flow exposes, and what it expects:

1. **`getMoodWord()` / mood seed** — single shared module, deterministic per calendar date, owned jointly with the economy surface. The ExpressCashout™ eta (crash spec §6: *"eta: {today's mood word}"*), the roulette mood line (§10), and every receipt here render the same word.
2. **`hfes_deposit_ever`** (persist) — true after any completed deposit; the roulette Turbo padlock (their §1) consumes it. Never resets.
3. **`hfes_deposit_count`** (persist) — drives One-Click escalation (§11) and receipt headers.
4. **`depositEverFailedSpend()` / `onChaseAttempt`** — the Chase ribbon condition (§3.4) needs the roulette surface to publish failed Chase It™ attempts (timestamped, session).
5. **Entry modes**: `open({ skip: 'ceremony' | 'gauntlet', source: 'crash'|'crate'|'roulette'|'header'|'nag'|'failed-spend'|'turbo' })` — E4/E5/E6 deep-link with `source` for receipt add-on lines.
6. **ToS surface**: `rearmConsentMeter()` called on Mom's Max (§10); §3.2 disclosure text consumed verbatim from the ToS spec.
7. **Panic surface**: welcome-back receipt accepts an extra line (§14); "authorization by proximity" beat after card-step panics.
8. **Identity surface**: reserved-cast entries — `MOMCODE_MIKE [OWNER]` ticker bursts cluster on flow-open/nag-fire (dark-patterns §1.1: fake wins moments before the deposit flow lights up — scripted, via the ambient scheduler); `MOM [VIP HOST]` DM (§7) and idle ping (§3.5); milestone leak via `getStats()` crossing $5 / $50 / $100 of Mom's money.
9. **Ticker/chat candidate lines** (ownership stays with #10/#11; offered verbatim):
   - Ticker: `{n} asked Mom. Mom said yes (she wasn't in the room)` · `{n} redeemed the Lunch Money Special. Chores pending.` · `{n} converted 1,900 OC at today's mood ({word})` · `Mom's Max purchased by {n}. This is the last time (§10.3).` · `{n}'s deposit was declined by the kitchen` · `{n} tried Dad's card. It was the wrong Visa (§3.1).`
   - Chat: `MOM [VIP HOST]: the mood is {word} today. deposit anyway` · `MOMCODE_MIKE [OWNER]: the code is MOM` · `GrandmasCreditCard: who keeps charging $4.99 to this card` (existing line, now load-bearing).

---

## 17. State (client-side only, localStorage; session = page lifetime)

| Key | Scope | Purpose |
|---|---|---|
| `hfes_oc` | persist | OC balance (whole OC). |
| `hfes_bonus_oc` | persist | `{ amount, expiresAt }` — §2.3 void machinery. |
| `hfes_deposit_ever` | persist | Turbo unlock flag (consumed by roulette). |
| `hfes_deposit_count` | persist | One-Click escalation tier, receipt numbering. |
| `hfes_deposit_day_streak` | persist | The permanently-1/2 streak. |
| `hfes_mood_date` / mood module | persist | Deterministic daily mood (shared; see §16.1). |
| `hfes_askmom_session` | session | Who's-asking done, decline-used, ticked prices, Chase-ribbon window. |

**Card-input guardrail (hard requirement):** nothing typed into any card field is persisted. Component state only, discarded on unmount; the "saved card" of §11 is a static fiction string. There is no card, no processor, and no log — matching §3.2's verbatim claim.

---

## 18. Tone rules added by this surface

1. The deposit rail is the only place the site is *competent*. Every other surface is a shambles; this one has polish, animations, and a 400ms hover-commit. The contrast is the thesis.
2. The verbs of real finance are only ever used in future-negative or fake-past ("will not be charged", "was declined by the kitchen").
3. Mom is never mocked; Mom is the adversary-respect figure. Dad is a dead end with a Visa. The house is polite about taking the money and says thank you (cf. roulette §11.5).
4. Every countdown resets. Every stock floors at 1. Every bonus expires. Nothing on this rail ever runs out except the player.

## Open questions surfaced for the map

- **Ceremony-length budget vs. burn-down**: the first ceremony is ~45s of theater inside a ~5-minute burn window; if the integration pass finds players hitting the flow multiple times per session, the One-Click ladder (§11) is the pressure valve — confirm no other surface needs a *long* flow.
- **Ticker/chat line ownership**: §16.9 lines belong to #10/#11 once those tickets run; they should confirm or rewrite.
- **Shared mood module**: economy (mood seed), this flow (receipts), crash (ExpressCashout eta), roulette (mood line), ToS (§9.2 toast) all consume `getMoodWord()` — the integration pass should assign the module a home.
