# Live chat — resolution spec

Resolution of [#11](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/11) on the [map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/1). Decision-complete; implementation tickets cut mechanically from this. Built on the identity contract ([#3](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/3), `docs/spec/identity.md` §9): `playerTag`, `generateTag()`, `RESERVED_CAST`, `YOU_COLOR`, entry shape `{user, msg, color, badge?, isYou}`, `getStats()`. Games own their line decks (crash §5, crate §9, roulette §9); **chat owns the personas, the timing, and the room**.

Core thesis, stated once and obeyed everywhere: **the chat is a crowded room containing exactly one real person, and it is a sales funnel wearing a crowd.** It celebrates deposits, taunts losses, reports the weather (the mood word), and moderates truth. It never holds a conversation. Parody targets: owner shills and manufactured streaks (dark-patterns #1.1/#1.2), VIP hosts (#4.1), rain events (#4.6), streak culture (#4.8).

---

## 1. Surface, scale, scrollback

- The footer chat panel keeps its position, grows a scrolling body + input row (§4). Header stays `LIVE CHAT ({n} online)`.
- **Online counter**: `840 + floor(session BB lost / 10)`, capped at 999, with a deterministic ±3 flicker. The crowd gathers as you lose. Tooltip: `{n} online. 1 is you. The rest are the house (§1.1).`
- **Scrollback decay**: rolling window of 50 entries. Entries older than **90s** fade toward the site-standard ~2% contrast; at **3 minutes** they collapse into one line — `— chat history archived to the treehouse ledger (§10.2) —`. Nothing is retrievable: the shills' claims self-destruct before anyone could screenshot them. MOM's whispers (§3) are exempt and never fade (`MOM's words are permanent, unlike the rest of chat`).
- While the MOM'S HOME disguise is active, the feed keeps accumulating (panic-button canon); on restore the backlog shows as "what you missed," newest first.

## 2. Ambient population — the persona pool

One-time decision: the ambient crowd is **archetyped, not generic**. Each message draws a persona from a weighted table; names come from the identity generator (§9), pinned per session so personas feel continuous.

| Wt | Archetype | Voice | Sample deck |
|---|---|---|---|
| 30% | **Hype kids** | ALL CAPS, W/L culture, celebrates everyone's deposits | `LETS GOOOO` · `W RARE` · `KEYS KEY KEYS` · `he's HIM` · `CLIP IT` |
| 15% | **Shills** (dark-patterns #1.2) | always profit, implausible streaks | `just pulled the Fruit Roll-Up AGAIN (3rd today)` · `turned 8 BB into a down payment (screenshot pending)` · `site is fair, i win constantly` |
| 10% | **Doomers** | resigned fatalists; borrow crash vocabulary | `the schedule is real. accept it.` · `as scheduled 📉` · `depositing just delays the schedule` |
| 5% | **The whale** | see below | — |
| 10% | **Bailout beggars** | ask chat for BB, never receive | `anyone lend 8 bb i'm due` · `spot me one spin (will repay in esteem)` — MOD, occasionally: `generosity is against ToS (§6.1)` |
| 10% | **New marks** | naive questions that demo the keyword funnel | `is this legit?` · `how do i withdraw?` · `what's a mood` |
| 10% | **Mood analysts** | speculate about the admin's mood, never the rate | `admin woke up Vindictive today` · `the pity meter reset at 49 for a REASON` · `HFES-10 never dips. ever. think about it` |
| 10% | **Definitely bots** | snake_case names, broken syntax | `same` · `yes` · `i am having fun` · verbatim repeats of earlier messages |

- **The whale** is a fixed, always-online fixture named **`Timmy_Second_Mortgage`** (ambient, no badge). His domestic circumstances escalate forever with every deposit and never resolve — parallel to Pending withdrawals incrementing forever: `mom said one more deposit and we're evicted. anyway. mom's max time` → `sold my retainer. orthodontist says i'm 'a lost cause' (the skin says otherwise)` → `the landlord is a fan of the site now. small world` → `grandma's house is in escrow. MY escrow. it's basically an investment`. He is the loss-normalizer: proof that everyone's mom is mad and everyone deposits anyway.
- **`definitely_your_conscience`** (contributed by the crash spec) is a definitely-bot with a scripted role: at 3+ consecutive crashes it types `take it… take it…` during the stick and `too late` after. Chat owns the persona; crash owns the trigger.
- **Density & pressure cadence** (the "does chat scroll faster when you're losing" question — **yes**): baseline one ambient message per **4.5–8s** (current rhythm). Cadence tightens to **2–3.5s** while the player is on a 3+ loss streak or during choreographed pressure moments (crash stick, near-miss escalations, the two-tier refill nag). The room leans in when you're down.
- **The quiet window**: after any of *your* fake wins, ambient chat goes silent for **8–12s**, broken by one persona: `who?` or `bot lobby`. The room celebrates deposits, not wins. This silence is the loudest thing in the spec.

## 3. Reserved cast scripting

Per identity §2.3 — badges, colors, and constraints are canon. Chat adds the scripting:

- **`MOMCODE_MIKE` [OWNER]** — never converses. His only chat line, ever, is some variation of **`the code is MOM`**, fired (a) the first time the Ask-Mom flow opens each session, and (b) whenever a player (usually you) types `MOM` as a keyword. Fine print under his name: `MOMCODE_MIKE is not affiliated with this site. He is the site.`
  - **The Mike cluster** (canon timing, now locked): 2–3 of his implausible Karambit ticker streaks fire **30–45s before every deposit-pressure moment** — BB falling toward the 6 BB nag zone, any Ask-Mom flow opening, a Mom Coupon day flip. Ticker renders the lines (identity owns the templates); chat owns the choreography clock.
- **`MOD_Chad_Official` [MOD]** — keeps his canon lines (`remember to deposit responsibly!! (deposit more)` recurring; `free keys arrive when you least deserve them`). Loss nags: after any single loss ≥ 15 BB or a 5-loss streak: `rough one. the house feels bad. deposits cheer everyone up.` Owns all moderation theater (§10).
- **`AdminTradeBot_69` [BOT]** — coinflip taunts (canon), trade lowballs (`0.02 BB + exposure. final offer.`), `§1.3'd` (crash canon), and the `help`/`withdraw` funnel posts (§5).
- **`MOM` [VIP HOST]** — **does not speak in public chat.** She speaks only in **whispers**: inline messages in your chat panel, pink `#ff9ad5`, italic, framed `WHISPER FROM MOM`, exempt from scrollback decay, not replyable (`MOM has whispers disabled (she's busy)`). Whisper triggers and deck:
  - 60s idle with BB < 15: `I notice you're not depositing. I notice everything. ❤`
  - Ask-Mom flow opened then abandoned: `You left something in your cart. My heart.`
  - After any refill: `I knew you had it in you.`
  - First Mom's Max: `That's my special kid.`
  - Her love is real and denominated in deposits (dark-patterns #4.1, played straight).

## 4. The input — you can type

- **Both** quick phrases and free text. A row of five glowing quick-phrase buttons above a dim free-text field labeled `advanced`: **`W`** · **`L (me)`** · **`how withdraw?`** · **`is this rigged?`** · **`MOM`** (the trap — routes straight to the keyword funnel). Free text: 100-char cap, placeholder `say something (no one will read it)`.
- **Send never dodges.** Entrance buttons don't dodge (marketplace canon); the site wants your voice. Getting value *out* of the chat is a different matter (§5).
- Player messages post per the identity contract: `{user: playerTag, color: YOU_COLOR, isYou: true}` — gold, dim `(you)` suffix.
- **Rate limiting gag**: a second message within 10s triggers flood protection — `You're typing faster than you're depositing. Cooldown: {10}s (§8.9).` The cooldown **doubles per trigger** within a session (10 → 20 → 40…), like the reroll fee. Fine print: `Rate limits protect the chat from enthusiasm.` Quick-phrase buttons keep glowing during cooldown; clicking one posts `cooldown, king` from MOD.
- **Chat Gratuity**: every 10th message you send deducts **1 BB** — `Chat Gratuity — 1 BB — customary, not required, automatically applied.` At 0 BB: `waived (nothing to take) — §1.3` (Hush Gratuity precedent). Chat is free. It is the only free thing. (Customary.)
- No edit, no delete on your own messages: `Messages are permanent (they aren't) (§10.2).`

## 5. The response engine — keyword funnel, never meaning

**Chat reads everything you say as one of three things: deposit intent, misinformation, or content.** Scanned on send; first keyword match fires scripted responses from designated personas within 1.2–3s; dogpiles allowed (2–3 personas). The keyword table:

| Keyword | Response |
|---|---|
| `mom` (any mention) | Pile-on: `did you ask her` · `W mom` · `she's a real one` — plus a MOM whisper: `Tell her I said hi. And also the code is MOM.` — plus MOMCODE_MIKE: `the code is MOM` |
| `refund` | AdminTradeBot_69: `refund is a §6 concept.` · MOD: `refunds are processed in the order they are deserved.` |
| `scam` / `rigged` / `fake` | Moderation (§10): your message is struck through and redacted, then timeout |
| `help` | AdminTradeBot_69: `Have you tried asking Mom?` (SupportBot canon, reused) |
| `withdraw` / `cash out` | AdminTradeBot_69: `withdrawals are pending (§1.3). yours specifically: pending.` · a shill: `lol he's trying to withdraw` (bold of him — it has never once happened) |
| `legit` | Shill pile-on: `100% legit won 3 karambits here` · `legit as my mom's card` |
| `minor` | The "asking for a minor" escalation, §9 |
| `MOMCODE` | MOD: `impersonating the owner is a Tier 1 vibe violation (he loves it though)` |
| `rain` | `Rain is region-locked (your region: no)` (§11) |

**Default — no keyword matched (the anti-engagement gag):** rotate scripted non-responses:
1. Silence (30s of nothing — the room moves on without you).
2. One persona: `who asked`.
3. A hype kid misreads it as a win: `W`.
4. A definitely-bot repeats your message **verbatim** 2–4 minutes later as its own (`definitely_human_88: {your words, retyped`) — paranoia without a server.
5. Pity beat: after 3 consecutive ignored messages, one persona replies `same`. This is the hollow minimum; it is the closest thing to human contact the chat offers.

**Name-echo** (your gamertag in others' mouths — yes): after your first fake win, shills reference it for the rest of the session at low rate (`{tag} still has that {item}? lucky`); pre-deposit moments get `{tag}'s about to eat good`; milestone leaks (§7) use it constantly. Your tag becomes set dressing in a conversation you were never in.

## 6. Deposit reactions — the only genuine engagement

When a refill completes, chat erupts within 0.5–2s: 3–5 messages (`W` · `LEGEND` · `mom's a real one` · `certified depositor` · `{tag} ATE`) and MOD pins: `🔔 {tag} just supported the community. community pillar.` Escalation by package size: **Lunch Money Special** gets `cute start`; **Mom's Max** gets a full pile-on, in-chat confetti, a ticker line, the MOM whisper (`That's my special kid.`), and MOD: `the ledger resets (§10.3).` Abandoning the flow without buying gets the guilt whisper (§3) plus two personas: `she said no???` and MOD: `the responsible thing to do would've been yes.`

## 7. Milestone leaks — the trigger list (owned here)

Announced by the reserved cast using `getStats()`; each fires **once per identity** (flags persisted). Your own StatTrak™ Lifetime record becomes ambient social proof against you.

| Trigger | Voice | Line |
|---|---|---|
| First refill completes | MOD + MOM whisper | `{tag} made their first deposit. W come to mind.` / `I knew you had it in you.` |
| First Pending withdrawal created | AdminTradeBot_69 | `{tag} tried to withdraw (§1.3). bold.` |
| 100 BB lifetime lost | doomer | `{tag} hit 100 BB lost. thank you for your service.` |
| $50 of Mom's money crossed (canon) | MOD | `{tag} just crossed $50 of Mom's money. that's VIP material` |
| First Mom's Max purchase | chat-wide | §6 full eruption |
| 10 crates opened | hype kid | `{tag}'s at 10 crates. the JPEGs are winning.` |
| 7-loss streak (Consistent!) | personas | `consistent king` |
| First character win (crash) | chat (crash canon) | `no way` · `screenshot or it didn't happen` · `the house lets one go per fiscal quarter` |
| First rename | a persona who wasn't told | `changing your name does not change your debts (§8.9)` |

## 8. Mood-word chatter — the weather report

Personas speculate about the **admin's mood** at low cadence, never the rate (the number never shows — economy canon): `mood is Vindictive, rate is cooked` · `rate is never good twice. suspicious (§8.9)` · `Generous tomorrow? the admin said maybe (he didn't)` · `the admin is going through something`. On a **Generous** day the chat treats it as a public holiday (`GENEROUS DAY GET IN` · `mom coupon day!!!`); on a **Vindictive** day it goes somber (`blackout day. nobody convert.`). The mood is the weather; chat is the weather report; both are out of everyone's hands.

## 9. Ask-Mom flow — the "did you ask yet" pile-on

While the deposit-flow modal is open, chat keeps scrolling and piles on: `did you ask yet` · `she said it's fine (it isn't)` · `tell her it's for school` · `everyone's watching {tag}`.

**"Asking for a minor" escalation** (the canon `TotallyRealUser42` line now has a player-facing ladder): type `minor` (or ask about site legitimacy while the word appears) and MOD escalates:
1. First: `you must be 18+ to ask that (§1.2)`.
2. Second: `final warning: asking for a minor is a Tier 3 vibe violation`.
3. Third: **timeout** (§10).

## 10. Moderation theater

- **Timeouts**: your input locks for 60s, replaced by a countdown — `TIMEOUT — reason: {truth (§5.3) | Tier 3 vibe violation | asking for a minor | redundant (already disclosed in fine print)}`. Ambient chat during your timeout: `he got Chad'd` · `F`. **The canonical gag**: accurate statements about the site are auto-modded as misinformation — not because the truth is hidden, but because the fine print already disclosed it, so *repeating it aloud is redundant*. Truth is allowed once, in 4pt type, at 2% contrast.
- **MOD deletes your wins**: when *you* land a fake win, chat lets it breathe for ~3 seconds (`W` · `no way`), then MOD strikes it through: `[deleted by MOD — fake (yours specifically)]`. The shills' 47x multipliers stand forever. Your wins are the only fake ones in the room.
- **Redaction**: `scam`/`rigged`/`fake` claims render struck-through with `[deleted — misinformation: the reel is a reenactment (§4.2), which is different]`.

## 11. Rain — region-locked forever (dark-patterns #4.6)

Every ~20 minutes (deterministic daily seed): `🌧️ RAIN INCOMING` — 5 BB rains on 3–5 named ambient personas, who thank the house (`ty admin!!`). Your eligibility line, once per event, if you interact: `You were eligible for 0.0s of rain (rounded down, §8.9).` Thunder SFX belongs to the audio-gags fog, not here.

## 12. MOM'S HOME interplay

On restore (button or reload): the backlog plays, then the room notices: `where'd {tag} go` · `he bolted lol` · MOD: `leaving is a §7.1 concept` · `PROVABLY_MOM: I can see the homework from here. Deposit responsibly.` (panic-button canon).

## 13. Composition contract

- **Consumes** identity §9 verbatim (no new identity work). Game events consumed as triggers, with copy owned by the game specs: spin loss/win, crash start/stick/dodge/crash/character-win, crate open/pity recalibration, refill complete/abandoned, Pending withdrawal created, panic restore, rename.
- **Emits** nothing other than localStorage flags: `hfes_chat_flags` (milestones fired), `hfes_chat_cooldown` (rate-limit doubling), `hfes_chat_gratuity_count`. The ambient feed is generated live, never persisted.
- Ticker (#10) consumes `RESERVED_CAST` and the **Mike cluster** timing from this spec; chat and ticker draw from the same persona session pins (same names in both feeds).
- Cross-surface sequencing (quiet window vs pile-on vs milestone; the roulette banner's `Everyone is winning except you*` joining chat's pressure cadence) belongs to the map's integration pass — this spec provides the vocabulary.

## 14. Fine-print rules (tone, this surface)

1. Chat is free. It is the only free thing. (Customary.)
2. Every message is read as deposit intent, misinformation, or content — never as communication.
3. The room celebrates deposits, not wins. Wins get three seconds and a deletion.
4. MOM's love is real, inline, and denominated in OC.
5. The crowd grows when you lose. It was always your crowd; it was never your friends.
