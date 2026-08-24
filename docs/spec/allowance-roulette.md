# Spec: Allowance Roulette (anonymous play)

Resolution spec for [#5](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/5). Every decision below is final; implementation tickets should cut mechanically from this. Locked inputs from the economy ticket ([#2](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/2)): **8 BB per spin** (rounded up from 7.5 "per §8.9"), 150 BB Maternal Starter Grant, two-tier insufficient-funds copy, house always wins. Parody targets: near-miss reels, fake streaks, provably-fair trust-washing, pre-checked fees, rakeback, loss-leaders (all rated HIGH in `docs/research/dark-patterns.md`).

The core joke, stated once and obeyed everywhere: **the outcome is decided before the reel moves, and the reel is a reenactment** (ToS §4.2). The UI discloses this honestly, in ways designed never to be read.

---

## 1. Price & entry

- **Spin button**: `SPIN — 8 BB`, sub-caption in small type: `(that's $2.50 in old money)`. While spinning: `Spinning...`. After a spin ends it becomes `SPIN AGAIN — 8 BB` within 2 seconds (the house has no chill).
- **Allowance Reserve meter** under the wheel: `Spins left: {floor(BB/8)} (make them count)`. At ≤ 3 spins the caption flips to `Spins left: {n}. Other kids are already spinning.` (pure fabrication, no other kids exist).
- **Lucky Spin Insurance™** — a pre-checked checkbox beside the spin button: `☑ Lucky Spin Insurance (+1 BB) — covers emotional outcomes`. Costs +1 BB per spin, does nothing detectable. Unchecking triggers a guilt modal: `Are you sure? The wheel has feelings.` with buttons `Keep Insurance (recommended)` (primary, glowing) and `no (mood-dependent)` (gray, 4pt-hover only). Base price stays 8 BB; the insurance is the gratuity dark pattern played straight.
- **Turbo Spin™** — speed toggle, locked (padlock icon) until the session has ever completed an Ask-Mom deposit: `Turbo Spin (premium) — Ask Mom to unlock`. Once unlocked, toggle freely: turbo spins cost **10 BB** (8 BB + 2 BB *Velocity Fee*, receipt line: "arrives at the same destination, faster") and animate in **2.5s** instead of 5s. Outcomes are identical. The unlock state persists in localStorage forever — "premium" is a scar.
- **Auto-Spin** — button: `Auto-Spin: UntilEmpty™`. Confirmation dialog: proceed button `I am okay with this`, cancel `no (mood-dependent)`. Auto-spins once per 5.5s (3s in turbo), stops only when a spend fails (locked failed-spend copy fires) or MOM'S HOME is pressed. No loss limit setting exists; the settings panel contains only "sound: eventually".

## 2. Outcome table (predetermined, client-side, before animation)

| Roll | Outcome | Stop position | BB delta | Award |
|---|---|---|---|---|
| 62% | Standard house win | any junk slot (Consumer Grade Trash / Mil-Spec Regret / Industrial Denial) | −8 (−9 insured, −10 turbo) | none |
| 25% | Choreographed near-miss (§3) | one slot off a jackpot item | −8 (−9/−10) | none |
| 8% | Junk fake win | the junk item itself | −8 (−9/−10) | that item → inventory |
| 4% | Refund nibble | any junk slot | −6 net (8 paid, 2 "Rakeback" back) | 2 BB rakeback |
| 1% | Jackpot fake win | the jackpot item | −8 (−9/−10) | jackpot item → inventory |

- **First spin of every session is rigged to the junk fake win** (the loss-leader). Toast: `Everyone wins their first one. It's in the brochure.` Welcome win.
- Free spins (Mom Coupon™, §5) roll the same table but BB-denominated awards (refund nibble) pay 0 BB with toast `Told you it was free.` Inventory awards still land.
- Every outcome nets ≤ 0 BB. The house always wins; on jackpot spins it wins *while you win* (see §6).

## 3. Near-miss choreography

- A **near-miss** = the needle stops on the slot directly adjacent (in the direction of travel) to a jackpot item (Covert Extravagance or Contraband Liability — the Spork, the AWP, the Fruit Roll-Up). Frequency locked at **25% of spins** (1 in 4 — generous, because near-misses are free).
- During the final ~400ms of deceleration, the jackpot slot visibly **scoots one position further along the strip** (a 300ms "recalibration nudge"),captioned in 4pt type below the wheel: `reel recalibrating for accuracy`. The needle then settles on the junk slot beside it.
- Toast (2.6s, orange, exclamation-shaped): `SO CLOSE! The {Jackpot Item} was 1 slot away.` Variants rotate:
  - `SO CLOSE! 1 slot off. The Spork was practically yours.`
  - `Adjacent to greatness!`
  - `You missed by ONE slot. Statistically, you're due for a loss.`
- Fine print under the wheel (4pt, ~2% contrast against background): `Near-misses are cosmetic. The reel is a reenactment (ToS §4.2).`
- Back-to-back near-misses escalate: the second consecutive one fires `TWO near-misses in a row. That's not luck, that's targeting. (It is.)`

## 4. Fake streak banner

- Persistent banner above the wheel: `🔥 Last 7 spinners won big*` with a rotating cast of obviously-fake gamertags (`definitely_not_a_bot`, `MomApproved88`, plus the existing NAMES pool).
- **The 7 is load-bearing**: the count never changes, ever. Tooltip: `7 is our lucky number and our only number.`
- The asterisk footnote (4pt, below the fold, ~2% contrast): `* "won big" measured in estimated value, not withdrawable value. Withdrawable value of all winnings is $0.00 (see ToS §1.3).`
- After the player's first fake win of any size, their own gamertag is spliced into the banner: `{you} won big* (est.)` — held there permanently, regardless of everything after.
- Composition hook: when the proactive nag fires (BB < 6 BB, locked copy), the banner escalates to `🔥 Everyone is winning except you*` until a refill completes. (Feeds the cross-surface integration pass.)

## 5. Loss-streak consolation ladder

Consecutive-loss counter is per-session, reset by any fake win (which "counts as a win for morale purposes only"):

| Streak | Gag | Award |
|---|---|---|
| 3 losses | `Bad Luck Insurance™ activated` — banner: `You've lost 3 in a row. That's not luck, that's product design. Here's 1 BB on the house.` | +1 BB ("it's basically an allowance") |
| 5 losses | `Pity Prize` — banner: `We checked. It's not getting better. Take this.` | Participation Trophy \| Gold Foil Wounded Pride (est. $16.00) → inventory |
| 7 losses | `Consistent!` badge awarded (7-loss streak badge, per the catalogue's streak parody) + ticker line | badge only |
| 10 losses | `Mom Coupon™` — a coupon UI: `1 FREE SPIN`, fine print: `redeemable only when the mood is Generous (today: {mood word})`. Redeems on Generous days only; the deterministic daily seed makes this a once-in-awhile mercy. | free spin (§2) |

Every 20th consecutive loss with no reset: banner `At this point we're just impressed.` and the house sends a formal apology... assessed a 1 BB Processing Fee for the apology.

## 6. Fake wins & the fake-win model

- Fake wins award **inventory only, never BB**. Jackpot (1%) awards one of: Tactical Plastic Spork (est. $1,420.69), AWP | Mom's Visa Signature Edition (est. $8,500.00), Half-Eaten Fruit Roll-Up (est. $999.99) — always the item *adjacent to* the one the near-miss used most recently, if any (salt in the wound choreography).
- Jackpot moment: full confetti (existing confetti system), siren-colored ticker line, and a result box: `JACKPOT! {item} (est. {value}) is yours!` with two buttons:
  - `Cash Out` → transforms (mid-hover, per the buy-button-swap pattern) into `ExpressCashout (coming soon, eta: mood)`. Clicking it: `Withdrawal request received. Status: Pending (ToS §1.3). Estimated processing: eventually.` A Pending withdrawal entry is created and never resolves.
  - `Keep Spinning (recommended)` — primary, glowing.
- Inventory items show `Est. value: {value}` and, in smaller type, `Cash value (est.): $0.00`. There is no sell button; there is a `Trade Offer Status: pending (sent to: nobody)` line.
- The streak banner and ticker immediately credit the player by gamertag (§4), converting their fake win into social proof for the next visitor: themselves.

## 7. Provably Fair™ theater

- Badge next to the wheel header: `PROVABLY FAIR™`.
- **Before** each spin, a fairness line shows `commitment: {first 12 hex of sha256("ALLOWANCE_ROULETTE_" + spinId + "_HOUSE_WINS")}`.
- **After** each spin, `verify fairness` opens a modal: the preimage is revealed (`ALLOWANCE_ROULETTE_#{spinId}_HOUSE_WINS`), a green `VERIFIED ✓ OUTCOME MATCHED COMMITMENT` stamp slams in, then smaller: `Your commitment was HOUSE_WINS. This was knowable. (ToS §1.3)`.
- On fake-win spins the preimage is `ALLOWANCE_ROULETTE_#{spinId}_HOUSE_WINS_ANYWAY` — verification succeeds and the modal shrugs: `The house wins even when you win.`
- `full methodology` link → `/provably-fair` → 404 page styled `This page is pending (see §1.3)`.
- Wheel-header motto (rotates with spins): `Provably fair: the fairness is provable. The proving is pending.`

## 8. Spin receipt & stat gags

- Expandable `receipt` under each spin result — fees itemized **inside** the flat 8 BB (never additive; the price is the price, the itemization is the joke):

```
ALLOWANCE ROULETTE — SPIN RECEIPT
Base game .......................... 4.0 BB
Handling (the wheel is heavy) ....... 1.5 BB
Suspense & Drama surcharge .......... 1.0 BB
Maternal Gratuity (customary,
  not required, automatically
  applied) .......................... 0.5 BB
§8.9 rounding (up, as traditional) .. 1.0 BB  [from 7.5]
─────────────────────────────────────────────
TOTAL .............................. 8.0 BB
Thank you for playing. Mom says hi.
```

- Turbo receipts add `Velocity Fee ... 2.0 BB (arrives at the same destination, faster)` above the total; insured receipts add `Lucky Spin Insurance ... 1.0 BB (payout: emotional)`.
- **Odds disclosure** (per the hidden-odds parody): paytable modal lists every slot with win chance `mood-dependent`; the jackpot rows read `yes*`, footnote `*odds disclosed post-spin`. Header line: `Odds: yes. Full table available on request. Requests are mood-dependent.`
- **Rakeback Vault**: accrues 0.1 BB per spin into a proudly-displayed vault (`Rakeback: 1.2 BB`), claimable only at 100 BB via a permanently disabled button captioned `keep losing! (encouragement)`. The vault is display-only fiction; it never pays.
- **Lifetime stats panel**: `Spins: {n} · Won (withdrawable): 0 BB · Won (pending): ${X,XXX} est. · House edge: 100% (est., generous)`.

## 9. Ticker lines (verbatim, one per spin by outcome)

- Standard loss (rotate): `You lost 8 BB to the house (shocking)` · `House collects 8 BB (fees assessed)` · `8 BB entered the Allowance pipeline` · `The wheel did its job. You did yours.`
- Near-miss: `{gamertag} was 1 slot off the {jackpot item} (so close, by design)`
- Junk fake win: `{gamertag} won a {junk item} (est. {value}) (withdrawal pending)`
- Refund nibble: `{gamertag} received 2 BB Rakeback (net: still down)`
- Jackpot: `{gamertag} WON the {item} (est. {value})! Withdrawal: pending (ToS §1.3)`
- Consolation: `{gamertag} earned the Consistent! badge (losses: 7)` · `{gamertag} received a formal apology (fee: 1 BB)`
- Turbo: `8 BB (10 BB) traveled faster to the same place`

## 10. Deposit-flow hooks

- **Pre-spin**: Allowance Reserve meter (§1) + locked proactive nag at BB < 6 BB: `Your Banana Bucks are running low. Mom would want you to top up.`
- **Post-loss**: the result box carries a `Chase It™ — 16 BB` button (double-cost immediate re-spin, identical odds, receipt line: `Chase It™ premium: the disappointment, doubled`). Below it, after 2+ consecutive losses: `Feeling unlucky? Today's mood is {mood word}. Deposits are immune to moods.` with a `+ Top Up` button opening the Ask-Mom deposit flow.
- **Insufficient spend** (spin, Chase It™, turbo, or autospin): locked copy — `Insufficient Banana Bucks. Please ask Mom (see Terms of Service, Section 1.3).`, escalating per the economy ticket on the 3rd+ session failure to `Other kids' moms already said yes today.`
- **Post-jackpot**: the Cash Out → ExpressCashout gag (§6) is the exit maze; `Keep Spinning (recommended)` is the exit.

## 11. Fine-print rules (tone bible fragments for this surface)

1. Every disclosure is honest, tiny, and unreadable by design. The site never lies in the fine print; it only whispers.
2. ToS citations are load-bearing: §1.3 (nothing withdraws), §8.9 (rounding up is "traditional"), §4.2 (the reel is a reenactment).
3. Buttons that recommend always recommend the worse choice, glowing.
4. Any number the player can't influence is labeled `mood-dependent`.
5. The house is polite about winning. It says thank you.

## 12. Surfaced for the map (not decided here)

- **Audio escalation** (spin whoosh, near-miss heartbeat, jackpot siren) — belongs to a possible audio-gags surface; this spec leaves hooks (toast timings) but no sound decisions.
- **Cross-surface composition**: streak-banner escalation on nag (§4), Chase It™ appearing in the Ask-Mom flow ("still chasing?"), Consistent! badge in chat — candidates for the integration pass.
- Crates (#7) and crash (#8) should reuse: spin receipt fee vocabulary, rakeback vault, welcome-win rigging (once per surface per session).
