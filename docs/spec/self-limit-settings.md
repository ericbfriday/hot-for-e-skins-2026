# Self-Limit Settings — decision-complete spec

Resolution of [#16](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/16) on the [map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/1). Decision-complete; implementation tickets cut mechanically from this. The constitution was locked by the retention shortlist ([#15](retention-shortlist.md) §7) and is obeyed verbatim here.

**Thesis, one line:** the Self-Limit Settings panel is a fully wired control room connected to nothing — every gauge works perfectly, tracks something real, and is bolted to nothing the money touches. Real operators bury responsible-gaming tools and reverse-UX them into uselessness; ours is *prominently* useless, in a footer link, next to a panic button marketed as its flagship. The panel looks almost real because it is almost real: the sliders slide, the dropdowns drop, the reminders count. The parody is in the wiring, not the wobbling.

The one joke, stated once and load-bearing everywhere (canon, #15): **every control works perfectly and limits nothing, because the units never match the money.**

| Control | You set it in | The money is in | Why it can never bind |
|---|---|---|---|
| Deposit limit | BB | OC (sold per package) | conversion is mood-dependent; the limit check never concludes (§8.9) |
| Loss limit | USD · V-Gems · SkinCoinz · Chores (est.) | BB | losses are estimated at $0.00 (§2.4); BB is not offered |
| Session reminder | minutes | — | delivered only where you can't see it; auto-snoozed for you (Article 7) |
| Reality check | minutes | — | fires only on wins ("maximum receptivity"); losses are spared out of fairness |
| Take a Break | hours | — | recalibrates to 90 seconds (§8.9) |
| Self-exclusion | clicks | — | excludes you, not the play |

---

## 0. Standing constraints (all canon, none new)

1. **The constitution (#15, verbatim):** deposit stays 1 click; MOM'S HOME stays 1 click / 3 taps; self-exclusion requires ≥4 clicks ending in `Have you tried asking Mom?`; **no setting can actually limit anything.**
2. **No new ToS clauses.** Everything cites Article 7 (§7.1 Self-Exclusion, §7.2 Deposit Limits, §7.3 Parental Bailout Feature, §7.4 The Honest Paragraph), plus §1.3, §2.2, §2.4, §8.9, §12.4 where load-bearing.
3. **§7.4 stays real, untouched, and linked plainly** — the panel's one honest element, styled normally (not 4pt, not 2% contrast). This is non-negotiable and deliberate: the parody's conscience is the only thing on the panel that works.
4. **localStorage only.** Nothing computes anything real; the state is theater that persists.
5. **§7.4 is the exit hatch of record.** Nothing on this panel may state or imply it protects anyone; the honest line under each control says what it does (§2 per-control honesty lines).

---

## 1. Surface & entry points

- **Entry:** footer link **"Play Responsibly (Mom's Orders)"**, placed beside the ToS footer link, same visual treatment (small, dim, findable). The RG *marketing* is the loudest thing on the site (the pulsing MOM'S HOME button); the RG *tools* are a footer link. That asymmetry is the buried-tools pattern played in plain sight.
- **Modal title:** `PLAY RESPONSIBLY (MOM'S ORDERS)` (canon name, #15).
- **Subtitle:** *"You found the responsible section. Statistically, that was unlikely (the footer is a mood)."*
- **Hero banner (§7.3, top of panel):** **"PLAYER PROTECTION, PERFECTED™"** — *"The MOM'S HOME button replaces the entire casino with homework in 0.2 seconds. No licensed operator offers anything comparable."* CTA: **"See it work →"** which makes the MOM'S HOME button pulse once, deferentially. The responsible-gaming suite's flagship feature is the concealment tool.
- **Footer of panel, in order:** the reality strap, verbatim — *100% fake. No money moves. No card is charged. No account exists. Ever. (§12.4)* — then the §7.4 link, plain and normal-weight: **"If gambling has stopped being a joke for you: help is real — begambleaware.org · gamblersanonymous.org · 1-800-GAMBLER (ToS §7.4)."** The strap is mandatory (money-adjacent modal, ToS §0.2); the §7.4 link is the panel's only straight-played element.
- **Reality-strap placement decision:** panel footer verbatim, **plus** the final rung of the self-exclusion ladder (§3) carries it too — the one screen a player in trouble will actually reach. No other rung carries it; four straps in a row would dilute the one that matters.

---

## 2. Panel inventory (the six controls)

Order as listed: Deposit Limit, Loss Limit, Session Reminder, Reality Check, Take a Break, then Self-Exclusion at the bottom, smallest. Each control carries a 4pt honesty line at 2% contrast, listed below.

### 2.1 Deposit limit

- **Label:** `DAILY DEPOSIT LIMIT`. Default: `No limit set (recommended)`.
- **Control:** a slider denominated in **BB**, starting at 500 the moment it's touched (*"500 BB (recommended) (it's a number)"*).
- **The growth mindset (canon):** dragging right raises the limit instantly and permanently. Dragging left does nothing — the thumb refuses — with tooltip: *"limits only go up (growth mindset)."*
- **Pending limit check:** status line beneath: *"Limit check: your limit is in BB. Deposits deliver OC. Conversion is mood-dependent (§8.9). The check concludes when the mood does."* It never concludes; the mood changes daily and the check restarts. This is the load-bearing unit mismatch.
- **The ratchet:** every completed deposit auto-raises the limit to at least the deposit's BB-equivalent-at-today's-mood, itemized on the conversion receipt as *"Deposit limit auto-raised to fit your lifestyle (+{n} BB (est.), growth mindset)"*. The only quantity a deposit limit tracks is your maximum.
- **§7.2 delegation:** secondary button **"Ask Mom to set it instead (§7.2)"** with the clause quoted in hover: *"To set a deposit limit, ask Mom to set a deposit limit. This is the only supported limit mechanism, and it is extremely effective."* Click → 1.5s *"ASKING MOM TO SET A LIMIT…"* → *"Request delivered to the kitchen. Status: pending (§1.3)."* (Pending, like everything that would give money back or take less.)
- **Honesty line:** *This control has never limited a deposit (§8.9).*

### 2.2 Loss limit

- **Label:** `LOSS LIMIT`. Default: **$50.00 USD**.
- **Currency dropdown:** `USD (recommended)` · `V-Gems` · `SkinCoinz` · `Chores (est.)` — and **`Banana Bucks`, listed but disabled**, captioned *"BB — unavailable. Losses occur in BB (§2.2). Please choose a denomination you don't use."* The dropdown offers every currency except the one the money is in.
- **Why it can't bind (USD):** status line: *"Losses to date: $0.00 (est.). You are $50.00 from your limit (§2.4)."* The USD estimate is permanently $0.00 by canon; the limit is eternally $50 away from a number that never moves.
- **V-Gems / SkinCoinz:** *"Losses to date: 0 V-Gems (est.)."* — same trick, bigger numbers (×40,000 per BB, per §2.4).
- **Chores (est.):** *"Chores are not tracked (§2.6). This limit is therefore perfectly safe."*
- **Honesty line:** *Losses are estimated daily at $0.00 (§2.4). All loss limits are safe.*

### 2.3 Session reminder

- **Label:** `SESSION TIME REMINDER`. Dropdown: 15 min / 30 min / 1 hr / 2 hr. Default 30 min. Copy: *"A gentle reminder of how long you've been here."*
- **The timer works perfectly.** The delivery does not. Reminders defer to "non-intrusive moments," defined as: MOM'S HOME disguise active · crate ceremony in progress (unskippable) · ToS modal open · **any Ask-Mom flow in progress** (*"a reminder must never interrupt a deposit — that would be irresponsible"*).
- **Auto-snooze (canon):** if no deferral moment arrives, the reminder snoozes itself at interval +5s as a 4pt toast at 2% contrast: *"Reminder auto-snoozed. We assumed you'd want more time (Article 7)."* You may see the snooze; you will never see the reminder.
- **Panic backlog:** reminders that "arrive" during the Homework disguise surface on restore: *"While you were studying, {k} reminders arrived and were handled for you (Article 7)."*
- **Honesty line:** *Reminders fire only where you can't see them (Article 7).*

### 2.4 Reality check

- **Label:** `REALITY CHECKS`. Dropdown: `Off (recommended)` / every 30 min / every 1 hr. Default: Off (recommended).
- **When on, it works — selectively.** The check fires within 2s of any **fake win settlement** (crate reveal, coinflip win, roulette win, character win) — covering the win with a modal:

  > **REALITY CHECK**
  > *Time here: {m} min. Net session: {−n} BB (est. $0.00, §2.4). You've been unbelievable.*
  > **[Continue]** **[Continue (recommended)]**

  Both buttons continue. Note even the reality check cannot state a real number: the net is real BB, the estimate is $0.00.
- **Losses are spared:** no popup ever follows a loss; instead the 4pt toast: *"reality check postponed (bad timing). it wouldn't be fair to interrupt."*
- **House rationale (tooltip on the dropdown):** *"Checks are timed for maximum receptivity — immediately after wins (study pending, §8.9)."*
- **Honesty line:** *The check interrupts wins because wins can afford it.*

### 2.5 Take a Break

- **Label:** `TAKE A BREAK`. Button: **"Take a 24-Hour Break (gentle pace)"**.
- **On click:** a header chip appears — `ON BREAK — 23:59:59` — and immediately accelerates (*"recalibrated for your schedule (§8.9)"*). The 24 hours elapse in **90 seconds** of house time. The break ends itself; that is its only reliable behavior.
- **During the break, all features remain available** (*"breaking is a mindset"*). The break limits nothing, least of all the site.
- **On completion:** toast: *"Break complete. You lasted all 24 hours (house time, §8.9). StatTrak™ remembers your discipline."*
- **Chat owns the punchline:** at break start, ambient chat: `where'd {tag} go`; at completion (90s later): `nevermind`. The break is shorter than the room's memory of it.
- **Comeback Key™ interaction:** 90 seconds < 2 hours, so no Comeback Key. Footnote on the button: *"Breaks under 2 hours do not qualify for a Comeback Key™ (come back when you mean it)."*
- **Honesty line:** *The break ended before you finished reading this.*

### 2.6 Self-exclusion (entry to §3)

- Bottom of the panel, small, muted red link: **"Self-Exclude…"** — caption *"permanent-ish (§7.1)"*. The only control on the panel rendered smaller than its neighbors. Exits shrink; entrances don't.

---

## 3. The self-exclusion ladder

Five clicks total: four to reach the ending screen the constitution requires, a fifth to go through with it. At every rung, the glowing primary is retreat and the continue control is muted and shrinks 5% per rung (*"the exit gets smaller (§8.9)"* — the inverse of Mom's Max, which grows when you hesitate). Buttons shrink; they never dodge (chat canon: the site doesn't dodge — it re-sizes).

- **Rung 1 — click 1: "ARE YOU SURE? (WE'RE NOT)"**
  *"Self-exclusion cannot be undone. (It can. One click. But the principle stands.) Your Attendance Streak ({n} days) would die. Streaks are like pets. They depend on you."*
  **[Keep my streak alive (recommended)]** · [Continue exclusion (cold)]
- **Rung 2 — click 2: "THINK OF WHAT YOU'D LEAVE PENDING"**
  An itemized hostage list: Rakeback Vault ({x}/100 BB — one recalibration from glory) · Pity Meter ({49}/50) · Pending withdrawals ({k}, processing eternally, §1.3) · the Daily Mom Key (in transit). *"Leaving doesn't process these faster. Nothing processes these faster."*
  **[Reconsider (recommended)]** · […continue anyway]
- **Rung 3 — click 3: "REASON FOR EXCLUSION (FORM 1 OF 1)"**
  Dropdown, **pre-selected**: `winning too much` · `chores are due` · `the mood` · `Mom asked first (unlikely)`. Below it, §7.1 quoted verbatim — *"To self-exclude, close the tab. To permanently self-exclude, have Mom change the Wi-Fi password. She has been meaning to anyway."* — with a pre-checked box: ☑ *"I have read §7.1 and agree that closing the tab is also an option."*
  **[Read it again (recommended)]** · [final step →]
- **Rung 4 — click 4 (the ending the constitution names): "HAVE YOU TRIED ASKING MOM?"**
  *"Self-exclusion is a big step. Asking Mom is a smaller one, and she's right there (§3.1). Deposits take one click. Just saying."*
  **[Ask Mom instead →]** — glowing; opens the Ask-Mom deposit flow (`open({ source: 'self-exclusion' })`; the eventual receipt gains the add-on line *"Requested via: the responsible section (growth mindset)"*). The exit door opens into the deposit rail.
  · [Exclude anyway] — the smallest button on the site.
  This rung carries the reality strap (§1).
- **Rung 5 — click 5 ("Exclude anyway"): completion.**
  The site attempts to close the tab (canon, #15). Browsers decline (they're allowed; browsers are mood-dependent, §8.9). Toast: *"The tab declined to close. Exclusion proceeds regardless. You are now excluded from decisions, not from the site."* Exclusion state begins (§4). **Reflection period: waived** (*"you've clearly reflected"*).

### The click-count asymmetry (the constitution, measured)

| Action | Cost |
|---|---|
| Deposit (1-Click™ / hover-commit) | 0–1 clicks |
| MOM'S HOME | 1 click / 3 taps |
| **Enter** self-exclusion | **4 clicks to "Have you tried asking Mom?", 5 to complete** |
| **Leave** self-exclusion | **1 click** |

Getting out of the site is a ladder; getting back in is a doorstep. The FTC made "cancellation as simple as the charge" the law; the house read it as a style guide (dark-patterns §4.7).

---

## 4. What exclusion actually does

**The site keeps running. Everything stays playable.** Exclusion restricts nothing except the exit button. A header chip appears — **`EXCLUDED ({n}d) — play continues`** — and that chip is the entire behavioral change.

- **The house-sit (MOMCODE_MIKE fills in):** the moment exclusion completes, a 3-line ticker burst:
  1. `[OWNER] MOMCODE_MIKE will be filling in for {tag} (the code is MOM)`
  2. `{tag} won {bb} BB (house-sat) (withdrawal pending)`
  3. `{tag} deposited Mom's Max (house-sat) (excluded players deposit 40% more)`

  From then on, your gamertag keeps appearing in ticker and chat — **gold, suffixed `(you, excluded)`** — played by the house at rigged-calendar cadence: at least one fill-in win per 10 ambient minutes, and **the fill-in never loses**. Your tag's only winning record is the one you weren't holding.
- **Attendance Streak: house-sat.** Wagered rounds continue under your name with house funds at house odds: *"the streak is preserved (§8.9)."* The streak counts rounds; it never asked who wagered them.
- **Fill-in winnings never enter your inventory:** *"Your fill-in's winnings are non-transferable (they're his)"* — the fake-win model (§1.3) applied to your own name.
- **Deposits while excluded work, obviously** (nothing limits anything). Receipts gain the line: *"Deposited while excluded (dedication noted, §7.1)."*
- **Return: 1 click** from the EXCLUDED chip: **[Return (we kept your seat warm)]** — glowing, always. Welcome modal: *"Welcome back. While you were gone, you went {w}–{l}. Those wins were yours in name only (§1.3). Your streak survived ({n} days, house-sat)."* There is no appeals process; there is something faster than appeals (the button).
- **Permanence:** §7.1 already sold it — permanent exclusion is a Wi-Fi password. The house offers nothing more binding than a chip that says so.

---

## 5. StatTrak™ Lifetime additions

Additive fields on `hfes_stats` (identity §5 schema; surfaced in the Identity panel block):

| Field | Counts | Surfaced as |
|---|---|---|
| `responsibleMoments` | +1 per limit enabled or raised, break completed, exclusion rung advanced | `Responsible moments: {n} (est.)` |
| `remindersHandledForYou` | every auto-snooze/deferred delivery | `Reminders handled for you: {n}` |
| `realityChecksReceived` | every check that covered a win | `Reality checks survived: {n}` |
| `breaksTaken` / `breakSecondsTotal` | every break; seconds = 90 × n, always | `Breaks completed: {n} (total time off: {m}s)` |
| `exclusions` / `exclusionDays` | completions; days counting under the chip | `Self-exclusions: {n} (longest: {d} days)` |
| `houseSatRecord {w, l}` | the fill-in's ledger; l is structurally 0 | `Record while excluded: {w}–{l} (house-sat)` |

**Milestone leaks** (once per identity, via the chat trigger list):
- First limit of any kind enabled — MOD_Chad_Official: `{tag} set a limit. growth mindset (limits go up)`
- First loss limit — a shill: `loss limit? i don't have losses (skill issue)`
- First break — personas: `he's on a break lol` (followed 90s later by `nevermind`; chat owns the timing)
- First exclusion — MOD pins: `🔔 {tag} has been excluded. the streak lives (house-sat).` + doomer: `the schedule is real. accept it.` + `F`
- Return from exclusion — a hype kid: `{tag}'s back. the fill-in was better honestly`

---

## 6. Ticker & chat reactions to enabling a limit

Every enable emits something; the room's stance on self-care is derisive pity. Entry shapes per identity §9 / ticker §1; system lines dim, cast lines badged, whispers pink and permanent.

| Event | Ticker | Chat |
|---|---|---|
| Any limit enabled | system: `{tag} enabled a {limit name} (growth mindset)` | MOD: `reminder: deposit responsibly!! (deposit more)` |
| Deposit limit raised (manual or ratchet) | — | MOM whisper: `A higher limit. I always believed in you. ❤` |
| Loss limit enabled | — | shill: `loss limit? i don't have losses (skill issue)` |
| Session reminder enabled | system: `{tag} would like to be reminded (Article 7 will handle it)` | — |
| Reality checks enabled | — | a doomer: `he wants reality now. the schedule delivers` |
| Break taken | — | `where'd {tag} go` |
| Break completes (90s) | system: `{tag} completed a 24-hour break (house time)` | `nevermind` |
| Retreat from any ladder rung | — | MOM whisper: `You chose us. I knew it. ❤` |
| Exclusion completes | 3-line Mike burst (§4) | MOD pin + doomer + `F` (§5) |
| Exclusion ongoing | fill-in win lines, ≤1 per 10 ambient min, gold `(you, excluded)` | shills: `{tag}'s on a heater (someone is)` |
| Return from exclusion | `{n} is back. The house missed {n} (financially).` (canon grace line, reused — flag for dedupe, §Open) | `{tag}'s back. the fill-in was better honestly` |

---

## 7. Composition contract

- **Consumes:** the shared mood module (`getMoodWord()`); identity (`playerTag`, gold convention, `hfes_stats` additive fields, milestone-leak bus); panic backlog (deferral moments + restore lines); the deposit flow (completion hook drives the ratchet; `open({source:'self-exclusion'})` for the redirect); ticker emit API (`emitTicker`) and chat trigger list.
- **Emits:** `hfes_selflimit` state; events `onLimitEnabled(kind)`, `raiseDepositLimit(bb)`, `onExclusionEvent(kind)`; and one shared need — an **interruptible-state bus**: surfaces publish whether a toast/modal may interrupt right now (crate ceremony: no (unskippable); deposit processing: no; panic disguise: no; default: yes). The session reminder and reality check both defer to it. Ownership assigned in the integration pass.
- **MOM'S HOME:** the panel defers to it three ways — §7.3 hero banner (§1), reminder deferral into the backlog (§2.3), and the constitution's click-counts (§3). The panel itself is hideable by the panic like any modal; exclusion chips survive the disguise (state is persisted, not visual).

## 8. State

| Key | Scope | Contents |
|---|---|---|
| `hfes_selflimit` | persist | `{ depositLimitBB, lossLimit: {cur, val}, reminderMins, realityCheckMins, breaksTaken, breakSecondsTotal, responsibleMoments, remindersHandledForYou, realityChecksReceived, exclusion: { active, since, exclusions, houseSat: {w,l} } }` |
| `hfes_stats` | persist | additive fields per §5 (identity schema, extended) |

Nothing here gates any other surface. No surface reads these keys to refuse anything — the constitution forbids it.

## 9. Copy sheet (canonical strings)

- Panel: `PLAY RESPONSIBLY (MOM'S ORDERS)` / `You found the responsible section. Statistically, that was unlikely (the footer is a mood).`
- Hero: `PLAYER PROTECTION, PERFECTED™` / `The MOM'S HOME button replaces the entire casino with homework in 0.2 seconds. No licensed operator offers anything comparable.`
- Deposit limit: `limits only go up (growth mindset).` / `500 BB (recommended) (it's a number)` / `Limit check: your limit is in BB. Deposits deliver OC. Conversion is mood-dependent (§8.9). The check concludes when the mood does.` / ratchet receipt line `Deposit limit auto-raised to fit your lifestyle (+{n} BB (est.), growth mindset)` / `Request delivered to the kitchen. Status: pending (§1.3).`
- Loss limit: `BB — unavailable. Losses occur in BB (§2.2). Please choose a denomination you don't use.` / `Losses to date: $0.00 (est.). You are $50.00 from your limit (§2.4).` / `Chores are not tracked (§2.6). This limit is therefore perfectly safe.`
- Reminder: `A gentle reminder of how long you've been here.` / `Reminder auto-snoozed. We assumed you'd want more time (Article 7).` / backlog: `While you were studying, {k} reminders arrived and were handled for you (Article 7).`
- Reality check: `Checks are timed for maximum receptivity — immediately after wins (study pending, §8.9).` / popup: `Time here: {m} min. Net session: {−n} BB (est. $0.00, §2.4). You've been unbelievable.` / loss toast: `reality check postponed (bad timing). it wouldn't be fair to interrupt.`
- Break: `Take a 24-Hour Break (gentle pace)` / `recalibrated for your schedule (§8.9)` / `Break complete. You lasted all 24 hours (house time, §8.9). StatTrak™ remembers your discipline.` / `Breaks under 2 hours do not qualify for a Comeback Key™ (come back when you mean it).`
- Ladder: `ARE YOU SURE? (WE'RE NOT)` + streak-hostage body / `THINK OF WHAT YOU'D LEAVE PENDING` + hostage list / reason dropdown (`winning too much` pre-selected) + §7.1 verbatim / `HAVE YOU TRIED ASKING MOM?` / `The tab declined to close. Exclusion proceeds regardless. You are now excluded from decisions, not from the site.` / `you've clearly reflected`
- Exclusion: `EXCLUDED ({n}d) — play continues` / `breaking is a mindset` (reused for exclusion too: `exclusion restricts nothing except the exit button`) / burst lines per §4 / `Your fill-in's winnings are non-transferable (they're his).` / `Deposited while excluded (dedication noted, §7.1).` / `Welcome back. While you were gone, you went {w}–{l}. Those wins were yours in name only (§1.3). Your streak survived ({n} days, house-sat).` / `[Return (we kept your seat warm)]`
- Honesty lines (4pt, 2%): per §2 controls.

## Non-goals

- **No real harm-reduction features beyond §7.4.** The plainly linked real resources are the panel's only working tool, on purpose.
- **No actual gating of any feature** — the constitution forbids every setting from limiting anything, and that includes exclusion.
- **No new ToS clauses**; Article 7 is quoted, never amended.
- **No changes** to the locked <6 BB nag copy, the fee lineup, the panic mechanics, or the deposit flow's click counts.

## Open questions sharpened (for the map / #18 integration pass)

1. **Interruptible-state bus ownership** — the reminder and reality check both defer to surfaces' "can I interrupt now?" state; #18 must assign the bus a home (recommendation: the panic surface already owns interruption semantics).
2. **Reality check vs. quiet window vs. crate ceremony sequencing** — the check covers a win at the exact moment chat goes quiet (8–12s); confirm the two silences don't cancel into noise.
3. **Fill-in lines vs. the ticker's player-ratio rule** (ticker §5: "the player appears exactly as often as their real session events") — classification of house-sat lines as cast-scripted entries wearing gold needs the ticker's sign-off.
4. **Grace-line dedupe** — `{n} is back. The house missed {n} (financially).` now fires on refill completion (Desperation exit) and return-from-exclusion; #18 picks one owner or a tiebreaker.
5. **StatTrak™ schema extension sign-off** (identity) — six additive fields, one display block.
6. **Desperation Mode while excluded** — at BB < 6 the ticker flips to `everyone is winning except you*` while the EXCLUDED chip says play continues; the fill-in "is" you and "is" winning. Recommendation: let both fire — the contradiction is the point — but #18 should tone-check the stacked headers.
7. **Header real estate** — BB chip, OC chip, deposit-streak chip, tier chip, ON BREAK chip, EXCLUDED chip; recommend the break and excluded chips share one slot (they're mutually exclusive by design: you can't take a break you won't take).

No existing ticket is invalidated; everything above composes with canon. #16 closes with this spec.
