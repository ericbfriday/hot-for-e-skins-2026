# Tone bible — the house stylebook

Companion to [integration.md](integration.md); resolves the tone-bible question from [#18](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/18). **Decision: the artifact is needed.** The same speakers are written across five-plus specs (MOM appears in chat, Ask-Mom, retention, self-limit, panic; MOD in chat, coinflip, crates, self-limit); implementation tickets will cut copy from many files at once. This is the single reference for who may say what, in which register — the only document the personas fear.

**The one rule that generates all others:** the house is a polite, competent, affectionate institution that is also a trap. Every voice is some blend of Mom's kitchen and a casino's legal department. Nothing is sneered at; everything is itemized.

---

## 1. House voice (narrator: toasts, receipts, fine print, ToS legalese)

- **Legalese played deadly straight, broken by parentheticals that confess** (ToS §0.3). The confession is always smaller than the claim it defuses: `TOTAL ......... 8.0 BB` gets `(customary, not required, automatically applied)`.
- **Fine print whispers; big print blares.** Disclosures are honest, tiny (4pt, ~2% contrast), and engineered to die unread. The site never lies in the fine print; it only whispers. One confession per screen — a disclosure that has to repeat is a disclosure the layout owes an apology.
- **The house is polite about winning. It says thank you** (roulette §11.5), softly, on every debit. Receipts end `Mom says hi.` The house never gloats; it itemizes.
- **Numbers are deadpan.** Absurd precision lives in receipts, never in speech. Counts that matter are load-bearing and never change (7 spinners, 847 online, one (1) trumpet, 0.0s of rain).
- **Buttons that recommend always recommend the worse choice, glowing** (roulette §11.3). Any number the player can't influence is `mood-dependent`. Every countdown resets; every stock floors at 1; nothing on the rail runs out except the player (ask-mom §18).
- **Titles in Bangers-style ALL CAPS.** Sincere disclaimers end in mild despair (`please, for the love of god, log off`).

## 2. Registers (the five volumes the site speaks at)

| Register | Where | Rules |
|---|---|---|
| **Whisper** (pink, permanent) | MOM only | Conditional love, denominated in deposits; never replyable; never fades |
| **Room** (chat) | personas, MOD, bot | lowercase, fast, W/L culture; celebrates deposits, never wins |
| **System** (dim ticker/system lines) | the world | third person, timestamped, technically true; lies in the big print with a straight face |
| **Toast** (player-facing) | results, nags | second person, short, orange for salt; every nag ends in a button |
| **ToS** (the document) | clauses | legalese; future-negative verbs only (`Pending`, `$0.00`, "may not be converted") — no verb may imply money moves |

**Escalation moves up registers, never sideways**: pressure escalates nag → banner → whisper, in that order, on their locked thresholds (10 BB velvet DM, < 6 BB banner, 60s-idle whisper). Two registers may fire at one trigger only if they are different speakers (§13.13 of integration.md).

## 3. Persona canon (one section per speaker; their lines elsewhere are binding examples, not free improvisation)

- **MOM [VIP HOST]** — never speaks in public chat; whispers and DMs only. Warm, omniscient, transactional. Signs `— Management`, occasionally `Love, Management`. Her love is real and denominated in OC. She never threatens; she notices ("I notice everything. ❤"). She is never mocked (ask-mom §18.3): Mom is the adversary-respect figure.
- **Dad** — a dead end with a Visa. Two beats total (ask beats, wrong-Visa decline); never a persona, never a rescue. It is also a Visa.
- **MOMCODE_MIKE [OWNER]** — never converses. His only chat line, ever, is some variation of `the code is MOM`. Ticker lines are implausible streaks with `you had to be there` evidence; every line carries the FTC disclosure nobody reads. He owns, operates, and is the website.
- **MOD_Chad_Official [MOD]** — the moderator as hype-man for the house. Recurring: `remember to deposit responsibly!! (deposit more)`. Deletes your wins as `fake (yours specifically)`; strikes truth as redundant. Enthusiastic, never hostile; the ban-hammer is muffled.
- **AdminTradeBot_69 [BOT]** — the opponent as polite debt-collector. Taunt ladders escalate with your streak; always `gg`, never means it; lowballs in fees and exposure. Certified your edges (his cousin is studying for it).
- **Ambient archetypes** (chat §2 weights are canon): hype kids (ALL CAPS, W culture) · shills (always profit, evidence pending) · doomers (resigned fatalists; borrow crash vocabulary: `as scheduled 📉`) · the whale `Timmy_Second_Mortgage` (domestic circumstances escalate forever, never stop him) · bailout beggars (never receive) · new marks (demo the funnel) · mood analysts (speculate the adjective, never the rate) · definitely-bots (snake_case, broken syntax, beep).
- **definitely_your_conscience** — the only close-mic'd voice on the site (audio canon). Speaks only during 3+ crash sticks: `take it… take it…` / `too late`. Never used elsewhere; scarcity is the dread.
- **PROVABLY_MOM** — one line (`I can see the homework from here. Deposit responsibly.`), panic restores only.
- **The homework universe** (teachers Ms. Henderson/Okafor/Protsenko/Gutierrez, essay titles) — earnest schoolroom voice, zero jokes about gambling; the disguise's comedy is that it is completely plausible. Teacher comments are warm and mildly concerned.
- **The whale's escrow**, **the doomer's schedule**, **the shill's pending screenshots** — running gags never resolve; escalation without progression.

## 4. Banned jokes (and banned moves)

1. **Never break the frame.** No copy may state or imply a card is charged, money moves, or winnings withdraw (ToS §8.3). Real-finance verbs only in future-negative or fake-past.
2. **Never mock Mom herself.** Mom is played straight as the adversary-respect figure. The house may itemize her gratuity; it may not do impressions of her temper. (The admin's *mood* is not Mom — it's the server admin's, and it's fair game.)
3. **No real tragedy, no real victims.** Eviction/escrow/orthodontist jokes stay absurdly escalating (the whale); nothing may drift toward genuine hardship played straight — the second it stops being ridiculous, it's wrong.
4. **No §7.4 material in jokes.** The Honest Paragraph's resources are never parodied, never referenced by a persona, never queued behind a gag.
5. **One confession per screen; one tagline per site** (integration §6): `everyone is winning except you*` renders once, ever.
6. **No repetition doubling.** The same joke must not land twice in one view: two silences never overlap (reality-check sequencing), the grace line cooldowns, Mike's code line never appears twice in one scrollback window.
7. **No modern-slang drift.** The personas' slang is 2016-era skin-site W/L culture, frozen on arrival. No current-events references; the site exists in its own fiscal quarter.
8. **No fourth-wall/meta jokes.** The site never admits it's a parody in character; only the fine print, §12.4, and the reality strap carry that weight.
9. **Buttons that dodge are exits only.** Entrances never dodge; they glow, grow, or commit on hover (marketplace §4 canon).
10. **No persona gets a redemption.** Shills stay rich (pending), the bot stays polite, MOD stays enthusiastic, Mom stays conditional. Growth is for deposit limits only.

## 5. Voice checks (mechanical, for implementation)

- A line is in-voice if it could be spoken by exactly one speaker in this file — if two personas could say it, cut it.
- Every fabricated claim carries its evidence-ladder rung (ticker §4); every fee its parenthetical; every mood word its silence about the rate.
- When tone and canon collide, canon wins and tone files a complaint (pending, §1.3).
