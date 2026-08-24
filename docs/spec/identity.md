# Identity: session gamertag for anonymous players

Resolution spec for issue #3. Decision-complete: implementation tickets can be cut mechanically from this file. Everything here is client-side theater — no accounts, no server state, localStorage only.

Core stance: **the house assigns your identity; you may pay to disagree with it.** This is the account-creation dark pattern played straight — no sign-up friction at all, because friction is for withdrawals (§1.3) — and it keeps parity between you and the fake ambient players, which is the social-proof joke.

## 1. Assignment ceremony (when)

- **Assigned at the age gate.** Clicking "I am 18+..." (the confetti moment) generates the tag and writes it to localStorage. The age gate *is* registration; the player never asked for an identity and gets one anyway.
- Reveal card, immediately after the confetti, in the age-gate modal before it dismisses:
  - Title: `IDENTITY ASSIGNED`
  - Body: `You are: xX_LunchScope_Xx` (tag in gold, Bangers font)
  - Subcopy: `Usernames are assigned by the house. The house knows best. This identity is non-transferable, non-refundable, and legally distinct from you (see §1.3).`
  - Buttons: `[Reroll (first one's free)]` and `[Accept fate]` — both proceed into the site; reroll just re-rolls the tag in place. Player may reroll repeatedly *within the reveal card* — the free reroll covers the whole card session, not one click.
- Repeat visits skip the ceremony (see §5).

## 2. Generation recipe (the generator)

One generator serves **both** the player and ambient fake players, so the population is indistinguishable except by the "you" highlight (§7). The existing `NAMES` list in `App.jsx` is retired into this system (its entries live on in the word pools and the reserved cast where applicable).

### 2.1 Word pools

- **A — Actions (PascalCase):** QuickScope, NoScope, Yeet, Sweat, Clutch, Lag, Tilt, Snipe, Grind, Mash, Flick
- **B — Nouns of domestic/financial guilt (PascalCase):** LunchMoney, Allowance, PiggyBank, NoodleArm, JuiceBox, Retainer, Homework, Chores, Visa, Basement, Grandma, LemonadeStand, PaperRoute, BabysittingCash, Lunchbox, WiFi
- **C — Roles (PascalCase):** Investor, DayTrader, Launderer, Economist, Analyst, Speculator, Enjoyer, Connoisseur, Consultant
- **D — Kid names:** Timmy, Kevin, Bryce, Kyle, Skylar, Brayden, Tucker, Nyla, Deegan
- **E — Trust reassurances:** Trust, Promise, Legit, Honest, Swearsies, FrFr
- **F — Compounding suffixes:** Laundry, Heist, Arbitrage, Enjoyer, Gala, Seminar, Recovery
- **N — Numbers:** years 2007–2013 (implied birth year is the joke), 88, 69, 420, 1337, 3000

### 2.2 Templates (weights, casing rules)

| Wt | Template | Casing | Example |
|---|---|---|---|
| 25% | `xX_{A}{B}_Xx` | interior PascalCase | `xX_LunchScope_Xx` |
| 20% | `{b}{c}{n}` (B noun lowerCamel + C role + number) | lowerCamel start | `homeworkHustler2011` |
| 15% | `{D}_{C}` | both capitalized | `Timmy_DayTrader` |
| 15% | `{B}{F}` | PascalCase compound | `PiggyBankHeist` (optionally + number) |
| 10% | `NotA{Noun}_{E}` | `NotA` + capitalized noun | `NotAWallet_Promise` |
| 10% | `{A}{KidName-ish noun}{YY}` | mixed | `YeetBoy_2010` |
| 5% | snake_case deniability name (curated list) | snake_case | `definitely_not_a_bot`, `surely_legit_88`, `mom_approved_trust_me` |

- **Hard cap: 16 characters.** If a template overshoots, drop the number; if still over, truncate before the closing `_Xx`.
- Allowed charset everywhere: `A–Z a–z 0–9 _`.

### 2.3 Collisions & reserved cast

- **Reserved cast** (scripted personas, never assignable to player or ambient generator; entry into chat/ticker is scripted, not generated):
  - `MOMCODE_MIKE` — **[OWNER]**, color `#ff8a3d`. The site owner in a wig (dark-patterns #1.1/#1.4). His ticker entries are implausible streaks of Karambit wins that cluster right before deposit-flow moments. He never speaks in chat except to say the code is MOM.
  - `MOD_Chad_Official` — **[MOD]**, color `#8fd97a`. Keep his existing CHAT_LINES material.
  - `AdminTradeBot_69` — **[BOT]**, color `#e24a4a`. The coinflip opponent (§8) and trade-bat chatter.
  - `MOM` — **[VIP HOST]**, color `#ff9ad5`. The dedicated VIP host whose job is loving you conditional on deposits (dark-pattern #4.1). Appears in chat for milestone/rain moments.
- Exact collision with a reserved name (or a previously drawn ambient name in the current feed): append a 2-digit number (`_22`). "Uniqueness is enforced. Charm is not."
- **Almost-reserved gag:** any custom name containing `MOD`, `ADMIN`, or `MOM` gets `_Official` appended by the Compliance Filter — which makes it look *more* like a bot. (`MOD_Chad` → `MOD_Chad_Official_2`.)

## 3. Compliance Filter (custom names + leetification)

Applies to any **custom** name (paid, §4). Generated names skip it (the house pre-complies).

- Input constraints: 3–16 chars, `A–Z a–z 0–9 _`, spaces stripped.
- **Mood-based leetification:** substitution chance per eligible character (o→0, i→1, e→3, a→4, s→5) maps linearly onto the five mood words — **Generous leaves the name untouched; Vindictive substitutes ~1 in 3**. Uses the same deterministic daily seed as the mood rate, so the filter is "feeling" whatever the converter is feeling. Copy: `Compliance Filter (mood: Vindictive) applied. Non-refundable.`
- **Plausibility enforcement:** if the name survives with zero substitutions *and* zero digits, one digit is appended anyway ("name too plausible; digit appended for authenticity").
- Result is what displays; the player's typed string is never shown or stored.

## 4. Rename economy (reroll fee gag + premium upsell)

Two distinct mechanics, deliberately split across the two currencies:

- **Reroll** (new random tag): costs **BB**. First reroll per identity is free ("identity crisis #1: complimentary"). After that the fee **doubles permanently with each reroll**, persisted in the identity record: 10, 20, 40, 80, 160 BB… no cap. Copy: `Reroll fee: 20 BB (doubles each time, see §8.9). Changing your name does not change your debts.`
- **Custom name** (the premium-username upsell gag): costs **250 OC** per change. You pay real-(fake-)premium currency for the privilege of being mangled by the Compliance Filter (§3). Copy: `Custom usernames are a premium feature. Standard usernames are free because you get what you pay for.` 250 OC = half the cheapest refill package, i.e. deliberately bad value.
- Both live in the **Identity panel** (§6). Stats do **not** reset on rename — totals follow the identity, not the string.

## 5. Persistence & repeat visits

- Storage keys (JSON, alongside existing `hfes_balance` / `hfes_age`):
  - `hfes_identity`: `{ tag, custom, rerollCount, nextRerollFeeBB, assignedAt }`
  - `hfes_stats`: `{ bbLost, usdBorrowed, cratesOpened, withdrawalsPending, worstLossBB, lossStreak, firstSeen, lastSeen }`
- **The tag never regenerates on its own.** Repeat visits: no reveal card; instead a welcome-back toast: `Welcome back, xX_LunchScope_Xx. The house noticed your {N}-day sabbatical. Your losing streak was preserved.` (N from `lastSeen`; the anti-streak retention joke — dark-pattern #4.8 inverted. N=0 days → `The house never noticed you left. The house sees everything.`)
- localStorage wiped = brand-new identity, stats reset. The site treats it as a fresh minor: `New identity detected. Previous debts forgiven. Previous winnings also forgiven (§8.9).` We do not defend against this; it's theater.

## 6. StatTrak™ Lifetime record & Identity panel

- Lifetime stats **do** attach to the identity, surfaced as the **StatTrak™ Lifetime** block (extends the existing StatTrak™ catalog joke): total BB lost, total "borrowed" from Mom (sum of fake-USD refill face value, shown as `$N.NN of Mom's money`), crates opened, withdrawals pending (increments forever, never processes — §1.3), worst single loss, current losing streak.
- **Identity panel:** the gamertag chip in the header (gold-bordered, next to the balance chips) opens a modal containing: current tag, StatTrak™ Lifetime block, reroll button (with live fee), and the custom-name input (with OC price + Compliance Filter disclaimer).
- **Milestone leaks into chat** (feeds #11): scripted cast members announce milestones — `MOD_Chad_Official: {tag} just crossed $50 of Mom's money. that's VIP material` — so your own stats become ambient social proof against you.

## 7. "You" vs the ambient crowd (visual distinction)

- Your entries in ticker and chat render in **gold `#ffd54a`** with a dim `(you)` suffix on the name. Ambient players never get gold; they draw from the existing palette (`#e8c9ac`, `#ff8a3d`, `#8fd97a`, `#e24a4a`, `#a24ae2`, `#4aa8c9`).
- Reserved cast get **badge prefixes** rendered before the name: `[OWNER]`, `[MOD]`, `[BOT]`, `[VIP HOST]` in their cast color.
- Your own losses enter the ticker in the *same third-person templates* as ambient wins ("{name} lost $2.50 to the house (shocking)") with the gold highlight — uniformity is the joke: your losses sit indistinguishably among their fake wins. (This replaces the current hardcoded `"You lost…"` ticker string.)
- Ambient names come from the same generator (§2) — you cannot tell the marks from the bots, which is the point being parodied (dark-patterns #1.2).

## 8. Games addressing you

- **Coinflip:** the "You" side of the table becomes your actual tag (gold); opponent stays `Admin_TradeBot_69`. Loss line: `Admin_TradeBot_69 takes {tag} to school. Tie goes to the server host.` Follow-up taunt (1-in-3): `Admin_TradeBot_69: gg no re, {tag}.`
- **Result toasts** address the tag: `{tag}, the house thanks you for your contribution.` / `The College Fund crashed at 1.01x. {tag}'s college, specifically.`
- Per-surface brainstorms (#5–#9) may extend this; identity's obligation is only to expose the tag string to every surface (§9).

## 9. Interface contract for #10 (ticker) and #11 (chat)

Identity exposes, as one module:

- `playerTag: string` — the display string (≤16 chars, pre-filtered).
- `generateTag(): string` — ambient/player generator per §2 (reserved-collision-checked).
- `RESERVED_CAST` — the four personas with `{name, badge, color}` per §2.3.
- `YOU_COLOR = "#ffd54a"` and the `(you)` marker convention per §7.
- Entry shapes consumed by the surfaces:
  - ticker: `{ text, name, color, isYou }` — templates take `{n}` as now.
  - chat: `{ user, msg, color, badge?, isYou }` — badge omitted for players/ambient.
- `getStats()` for milestone leaks (§6); if #11 adds a chat input, player messages post as `{user: playerTag, color: YOU_COLOR, isYou: true}` — already supported by the entry shape, no further identity work needed.
- `hfes_identity` / `hfes_stats` schemas per §5 are the single source of truth; no surface reads localStorage directly.

## 10. Copy sheet (canonical lines)

- Reveal: `You are: {tag}` / `Usernames are assigned by the house. The house knows best.`
- Reroll: `Identity crisis #1: complimentary.` / `Changing your name does not change your debts (§8.9).`
- Custom: `Custom usernames are a premium feature. Standard usernames are free because you get what you pay for.`
- Compliance: `Compliance Filter (mood: {word}) applied. Non-refundable.`
- Welcome back: `The house noticed your {N}-day sabbatical. Your losing streak was preserved.`
- New identity: `Previous debts forgiven. Previous winnings also forgiven (§8.9).`
