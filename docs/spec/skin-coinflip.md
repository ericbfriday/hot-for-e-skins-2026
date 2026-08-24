# Spec: Skin Coinflip

Resolution of [#6 (Brainstorm: Skin Coinflip)](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/6). Decision-complete; implementation tickets cut mechanically from this. Locked inputs from the economy ticket ([#2](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/2)): **3 BB per flip** (the cheapest game — the 6 BB proactive nag is "two coinflips left"), Maternal Starter Grant 150 BB (= 50 flips), failed-spend copy verbatim with the 3rd+ escalation, house always wins. Identity inputs from [#3](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/3): opponent stays `Admin_TradeBot_69` **[BOT]** (#e24a4a); the player's side of the table is their gold gamertag; the bot's lines ride the ticker/chat contract of `docs/spec/identity.md` §9.

Parody targets (from `docs/research/dark-patterns.md`): §2.4 thin-veil casino games, §3.3 provably-fair trust-washing, §3.1 buy-button swaps, §1.2 fake social proof, §4.5 loss-leaders, §4.8 streaks, plus the crash surface's exhausted-exit vocabulary where it overlaps.

The core joke, stated once: **you call a side, but the coin is the house's employee.** The flip is a reenactment (ToS §4.2, adopted from the roulette wheel by popular demand) — the landing is decided before the coin moves, and the coin is a professional.

---

## 1. The table & calling ceremony

- **The coin is the Maternal Doubloon**: faces `MOM` and `§8.9`, rim stamped `PROPERTY OF THE HOST`. There is no heads or tails here; the call buttons are `CALL: MOM` and `CALL: §8.9` (big, side-by-side). The call is recorded and affects nothing (§2). Last call is remembered across flips: *the coin remembered your last call. It didn't help.*
- **Stakes display**: your side shows `{gamertag} — 3 BB`; the bot's side shows today's staked item from his stash (§5). The bot's stash item is visible *before* you flip — the loss-leader window dressing.
- **Flip button**: `FLIP — 3 BB`, sub-caption *(that's $1.00 in old money)*. While flipping: `Flipping...`. Within 2s of any result it returns as `FLIP AGAIN — 3 BB`.
- Failed spend: locked copy — *Insufficient Banana Bucks. Please ask Mom (see Terms of Service, Section 1.3).*, escalating on the session's 3rd+ failure to *Other kids' moms already said yes today.*
- Ceremony length ~2.8s base (cheapest game, fastest theater). Stats line under the table: `Calls: MOM {x} · §8.9 {y}. The coin respects neither.`

## 2. Outcome table (predetermined, client-side, before the coin moves)

| Roll | Outcome | Choreography | BB net | Award |
|---|---|---|---|---|
| 60% | House side (clean) | lands flat opposite your call, no drama | −3 | — |
| 15% | **Edge outcome** (§3) | balances on rim showing YOUR face, trembles, tips to edge | −3 | — |
| 12% | **Photo finish** (§4) | lands your call face-up... then overturned on review | −3 | — |
| 8% | Junk fake win | lands your call, clean; bot hands over the staked item | −3 | staked junk item → inventory |
| 4% | Break-even nibble (§6) | lands your call; fees shave the pot to exactly your stake | 0 | — |
| 1% | Legendary fake win | lands your call; MOD ruling; legendary from the bot's vault | −3 | legendary → inventory |

- **First flip of every session is rigged to the junk fake win** (welcome-win convention, once per surface per session). Toast: *Your first one? He lets those go. (One (1) per session, per tradition. §5.4(b).)*
- Every outcome nets ≤ 0 BB. On legendary flips the house wins *while you win* — you're paid in an unwithdrawable JPEG (§5).

## 3. Edge outcome — the justification ladder (centerpiece)

The rim-balance beat runs +1.4s (a near-miss window: your face is *up* while the coin stands on its rim). Session edge counter `k` drives the result line, verbatim ladder:

| k | Result line |
|---|---|
| 1 | `The coin landed on its edge. Tie goes to the server host.` *(current canon, unchanged)* |
| 2 | `Another edge. Ties go to the server host (ToS §5.4). The rim is certified.` |
| 3 | `Edge #3. Reviewed by the admin's cousin. He says it's an edge. He's studying for this.` |
| 4 | `Edge #4. The cousin has recused himself. Ties go to the server host's estate.` |
| 5 | `Edge #5. Quantum drift (§8.9): the coin briefly held both outcomes. We kept the profitable one.` |
| 6 | `Edge #6. The rim is load-bearing now.` |
| 7+ | rotate: `Edge #{k}. At this point it's basically a third face. A house face.` · `Edge #{k}. Physics has been notified and declined to comment.` · `Edge #{k}. You've seen {k} edges. The record is {k+1}*. *the record also goes to the house.` |

Fine print under the coin (4pt, ~2% contrast): *edge outcomes are cosmetic. the flip is a reenactment (ToS §4.2).*

- **Dispute button** (appears after any edge or photo finish): `Dispute this flip` → *Resolved per ToS §4.1: mandatory 1v1 Quickscope Match on Rust. The Operator has never lost this match. The Operator practices.* Button then relabels `Dispute this flip (retracted)`.
- Identity §8 canon lines ride along on the first edge: loss line *Admin_TradeBot_69 takes {tag} to school. Tie goes to the server host.* and the 1-in-3 *gg no re, {tag}.*

## 4. Photo finish (the delayed near-miss)

- The coin lands **your call, face-up**. 800ms pause — confetti visibly *primes* (one pixel of it peeks out). Then a grainy 0.9s VAR-style replay zoom shows the coin leaning **one (1) degree** past vertical.
- Stamp slams in: `OVERTURNED`. Result line: `PHOTO FINISH: landed {your call} by 1.1°. Rounded against you, as traditional (§8.9).`
- Ticker: `PHOTO FINISH: {n}'s win overturned by one (1) degree. Referee: the house`
- Back-to-back photo finishes: `Two overturned wins in a row. The replay is also a reenactment (§4.2²).`

## 5. Fake wins, the bot's stash & Double or Nothing

### 5.1 Junk stash (visible pre-flip, rotates)

| Staked item | Tier | Est. value |
|---|---|---|
| Screenshot of a Skin (Left Half).jpg | Consumer Grade Trash | $0.99 |
| Stock Photo of a Coin.jpg | Consumer Grade Trash | $1.49 |
| Missing Texture Checkerboard.png | Mil-Spec Regret | $2.49 |
| Watermarked Preview Image.jpg | Mil-Spec Regret | $1.99 |
| Slightly Bent Karambit (Photo).png | Industrial Denial | $3.50 |
| Stock Photo of Golden Handshake.jpg | Contraband Liability | $4.99 |

Winning a junk flip awards the staked item → inventory, flagged `Non-Tradeable · Withdrawal ETA: pending (§1.3)`, `Est. {value}` with `Cash Value (est.): $0.00`. `Cash Out` button transforms (mid-hover) into `ExpressCashout (coming soon, eta: mood)` → *Withdrawal request received. Status: Pending (ToS §1.3).* A Pending withdrawal entry is created and never resolves.

### 5.2 Legendary (1%)

The stash briefly flashes one of the catalog legendaries — Tactical Plastic Spork (est. $1,420.69), AWP | Mom's Visa Signature Edition (est. $8,500.00), or Half-Eaten Fruit Roll-Up (est. $999.99) — caption: *he didn't mean to show you that one.* On the win, theater escalates: `MOD_Chad_Official reviewed the flip. Ruling: yours. Bot is grounded.` Full confetti, siren ticker line. Same fake-win pipeline (§1.3 forever).

### 5.3 Double or Nothing (post-win reoffer)

After **any** item win, before the item lands in inventory, the bot slams a glowing primary: `DOUBLE OR NOTHING`. Subcopy: *Double or Nothing. Choose a side. (Both sides are his.)*

- **Accept**: the item goes on the table; one more flip at **0 BB** (the item is the stake; BB cannot be staked twice — the house is not a monster).
  - **Flip lands your call**: the item returns with its est. value **doubled** — same JPEG, new price sticker, small confetti, receipt line `Value doubled: same item, bigger number (§8.9)`. Repeatable; estimates inflate until they read like phone numbers ($1,420.69 → $2,841.38 → …). The doubling is a relabeling. Nothing else changes.
  - **Any house outcome** (edge, house side, overturned): the item is confiscated `to the bot's stash`, DupeShield™ recycling credits **+0** (rounded down, §8.9 — cross-ref crate §6). Toast: *The Nothing was load-bearing.* An edge during Double or Nothing runs the justification ladder like any other.
- **Decline** (gray, 4pt-hover): the item lands normally; the bot logs it: `Admin_TradeBot_69: coward. (respected.)`

## 6. Break-even nibble (4%)

Coin lands your call; the payout screen assembles a pot: `POT: 6 BB` — then shaves it live: Winner's Handling 1.0 BB, Bot's Feelings 1.0 BB, Maternal Gratuity 1.0 BB (customary, not required, automatically applied), §8.9 rounding 1.0 BB → **You receive: 3 BB.** Net 0. Toast: *You broke even. This is the best available outcome (§5.3).* Ticker: `{n} broke even. A crowd gathered.`

## 7. Rematch ladder ("best of 3?" auto-reoffer)

| Session streak | Button (primary, glowing) | Sub-caption | Plays |
|---|---|---|---|
| after any loss | `REMATCH — 3 BB` | *he accepts. he always accepts.* | 1 flip |
| 2 consecutive losses | `BEST OF 3 — 6 BB` | *you start 0–1; we counted the last one* | 2 flips |
| 4 consecutive losses | `BEST OF 5 — 9 BB` | *you start 0–2; the math is emotional* | 3 flips |

- **Series scoring**: a flip "counts for you" only when the coin lands your call *and the ruling survives* (junk/nibble/legendary rows, 13% combined); everything else counts for the bot. First to 2 wins the series. From 0–1, you need two surviving calls in a row.
- Winning a series pays **nothing extra** — the flips already paid per §2. Series victory toast: *You won the series 2–1. The trophy is pending (§1.3).*
- Best-of receipts carry the line `prior losses rolled in (§8.9)`.
- The bundle is the gag: every "best of" is priced at full flips while pre-crediting you with losses.

## 8. Bot personality (opponent theater)

- The bot **knows your gamertag and streak** — the house's ledger is the bot's memory (identity §9 `getStats()`; no surface reads localStorage directly).
- Streak taunt ladder, posted in chat:
  - streak ≥ 3: `Admin_TradeBot_69: {tag} is on a {k}-flip streak. I've started a boat fund.`
  - streak ≥ 5: `Admin_TradeBot_69: {k} and counting. My cousin says hi (he certified your edges).`
  - streak ≥ 7: `Admin_TradeBot_69: at this point I'm just holding your BB for you (§1.3).`
- **Pity beat at 7 consecutive flip-losses**: the bot donates 1 BB "from his personal wallet" — banner: *Admin_TradeBot_69 felt something. Here's 1 BB. Don't tell the house.* Ticker: `{n} received 1 BB from the bot's personal wallet (the house was not consulted (it was)).` (Once per session; roulette owns the full consolation ladder, crates own the cross-game Consolation Key™.)
- The bot is polite about winning. He says gg. He does not mean it.

## 9. Provably Fair™ theater

- Badge by the table header: `PROVABLY FAIR™`.
- **Before** each flip: `commitment: {first 12 hex of sha256("SKIN_COINFLIP_" + flipId + "_TIE_GOES_TO_HOST")}`.
- **After**: `verify fairness` reveals the preimage (`SKIN_COINFLIP_#{flipId}_TIE_GOES_TO_HOST`) and slams a green `VERIFIED ✓ THE EDGE WAS FORESEEN` stamp, then, smaller: *the commitment was TIE_GOES_TO_HOST even on non-edge outcomes. The house commits broadly. (§5.1)*
- On fake-win flips the preimage is `SKIN_COINFLIP_#{id}_HOST_ALLOWS_THIS_ONE` — verification succeeds and the modal shrugs: *The house wins even when you win.*
- `full methodology` → `/provably-fair` → 404: *This page is pending (see §1.3).*
- Odds line on hover: *Odds: yes. (Full table available on request. Requests are mood-dependent. §5.2)*

## 10. Flip receipt (fees itemized inside the flat 3 BB, never additive)

```
SKIN COINFLIP — FLIP RECEIPT
Base flip .......................... 1.2 BB
Coin Certification (both faces) ..... 0.6 BB
Rim Maintenance (the edge) ......... 0.4 BB
Maternal Gratuity (customary,
  not required, automatically
  applied) .......................... 0.3 BB
§8.9 rounding (up, as traditional) .. 0.5 BB
─────────────────────────────────────────────
TOTAL .............................. 3.0 BB
Thank you for flipping. Mom says hi.
```

Rim Maintenance is where reserved clause **§8.7** gets its body (ToS Article 8 reserved §8.6–8.8 "for fees we haven't invented yet" — this is the invention; hand the copy to the ToS surface).

## 11. Ticker & chat lines ({n} templates, identity §9 shapes)

Ticker:
- `Admin_TradeBot_69 collects the edge-case bounty` *(existing canon line, kept verbatim)*
- `{n} called {MOM|§8.9}. The coin disagreed (politely)`
- `{n} won {item} off Admin_TradeBot_69 (est. {v} — pending, §1.3)`
- `{n} doubled their {item} to ${v}. Same item. Bigger number.`
- `The Nothing claimed {n}'s {item} (it was load-bearing)`
- `{n} has seen {k} edges today (house record: all of them)`

Chat (ambient):
- `{user:"MOMCODE_MIKE", msg:"the doubloon is 100% fair. i minted it myself (code MOM)", color:"#ff8a3d"}`
- `{user:"MOD_Chad_Official", msg:"ties go to the host. always has. (since tuesday)", color:"#8fd97a"}`
- `{user:"NotAWallet_Promise", msg:"i beat the bot once. never again. he remembers.", color:"#e8c9ac"}`

## 12. Deposit-flow hooks

- **Pre-flip**: at BB < 6 BB the locked proactive nag fires (*Your Banana Bucks are running low. Mom would want you to top up.* — two coinflips left is the nag's definition).
- **Post-loss**: from 2 consecutive losses, result box gains: *Coins are immune to moods. Deposits too.* with `+ Top Up` → Ask-Mom flow (#9).
- **Below 3 BB**: `FLIP — 3 BB` swaps (label swap, standing gag) to `Ask Mom for Flip Money` → deposit flow. Failed spends use the locked two-tier copy (§1).
- Burn-down sanity: pure coinflip burns 150 BB in ~50 flips ≈ 3–4 min with rematch bundles — the cheapest game is the fastest drum in the band; mixed play still hits the ~5-min first-refill target.
- No `Chase It™` here — that's roulette's brand; the coinflip's chase verb is the Rematch (§7).

## 13. MOM'S HOME composition

Per the panic spec's locked table, an in-flight flip **keeps running and loses**: if the outcome was to be a win, it becomes an edge on resume (*you looked away. the coin noticed.*) and the justification ladder counts it. Welcome-back panic receipt line: *Your coin kept flipping. It landed on its edge. Naturally.* The 1 BB Hush Gratuity is unchanged and separate.

## 14. State scope

Session theater (page lifetime, resets on reload — balance never does): edge counter, streak, welcome-win-used, series scores, Double-or-Nothing state. Suggested keys: `hfes_cf_edges`, `hfes_cf_streak`, `hfes_cf_first_win`, `hfes_cf_call_memory`. Item awards persist via the shared inventory store (fake wins are forever, §1.3).

## 15. New ToS canon (proposed, for the ToS surface to absorb)

**§5.4 (Edge Outcomes).** (a) In the event of an edge outcome, the tie is awarded to the server host. The rim is load-bearing. (b) Each player's first flip is permitted to win. One (1) per session, per tradition. (c) Repeated edge outcomes are adjudicated by increasingly qualified personnel, up to and including the admin's cousin (studying for it) and quantum drift (§8.9). (d) The Maternal Doubloon's faces are MOM and §8.9. The rim is the house's.

No Articles renumber (1, 4, 8 untouched); this only appends §5.4 to Article 5.

## Open questions sharpened by this spec

- **§4.2 (Reenactment) has no frozen home**: roulette asserts it, this spec reuses it, but the ToS surface's Article 5 ends at §5.3 — same for crash's asserted "§2.4 (Scheduling)," which now collides with frozen §2.4 (Derived Denominations). The integration pass should give both a real clause number.
- **Cross-surface composition**: coinflip losses count toward the crate's Consolation Key™ ("3rd consecutive loss in any game") — sequencing belongs to the integration pass; the pity beat here (§8) must not double-fire with it.
- **Session definition** shared with crates/crash (page lifetime vs. tab close) — integration pass.
