# Audio gags — The House Band

Resolution of [#17](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/17) on the [map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/1). Decision-complete; implementation tickets cut mechanically from this. Canon honored verbatim: MOM'S HOME hard-kills all queued audio and auto-restores on return ([panic §4](panic-button.md)); the near-miss heartbeat, jackpot siren, defusal tick, and game stings were left as hooks by the game specs; thunder SFX was explicitly deferred here ([chat §11](live-chat.md), [retention §6](retention-shortlist.md)); `BASS_DROP_FINAL_v3_REAL.mp3` is canon ([crates §2](loot-crate-defuser.md)); "hold music: the fridge" is canon ([ask-mom §6](ask-mom-deposit-flow.md)).

**Thesis, stated once:** the site's audio implements one rule faithfully — **nothing here sounds like losing.** Losses are low-passed, warm, and soothing, mixed like a lullaby with a receipt; wins (all of them fake, several of them net losses) are loud, layered, and loudness-normalized to the ceiling. The industry term for celebrating net losses with win sounds is "losses disguised as wins," and the site implements the industry standard proudly, with the citation in 4pt. The house is polite about winning. It says thank you, softly, on every debit.

Secondary target: ambience as retention. The soundtrack never stops for long (panic canon: *"The house insists."*), and the one control that works instantly — MOM'S HOME — is the one that conceals the site from Mom.

---

## 1. The House Band (architecture)

Every sound on the site is played by one engine: **the House Band™**. Nothing calls the browser's audio directly; everything is queued through the Band.

- **Synthesis only.** Every sound is generated client-side (WebAudio oscillators/noise — no audio files, no assets, no downloads). *"Our server is your browser. Our orchestra is your sound card (§11.1)."*
- **Autoplay consent gag:** the Band cannot start until the first user gesture. The age-gate's continue click is the gesture. *Silence before consent — the browser insists on one (1) click, and the house respects the browser, grudgingly (§10.2). Consent starts the music.*
- **No replay of missed audio.** Unlike the ticker/chat backlogs, sounds are never replayed after MOM'S HOME. *Missed sounds are not backlogged. You had to be there. (Like the Karambit.)*
- **State:** the Band persists exactly one thing — the mute flag (`hfes_muted`). *The band remembers nothing (§8.9).*

### Priority ladder (the contract other surfaces consume)

| P | Name | Contents | Rules |
|---|---|---|---|
| **P0** | SILENCE | MOM'S HOME | The only priority that can kill. **Instantly discards all playing and queued audio, no fade.** Not a sound — the enforced absence of sound. The only true silence on the site. |
| **P1** | CEREMONY | The Siren; the BASS_DROP; the deposit success sting; the One (1) Trumpet | Queue-blocking one-shots ("unskippable," like the crate). Nothing interrupts P1 except P0. |
| **P2** | GAME | Spin whoosh, coin ring, crash drone, defusal tick, the Heartbeat, the hover-commit whine | Timed to each surface's choreography beats. Ducks P3/P4 to 30%. |
| **P3** | SOCIAL | Ticker blips, chat pings, Mike's stinger, thunder, the envelope | The crowd layer. Ducks P4 to 30%. |
| **P4** | BED | The mood soundtrack loop (§4) | Never stops — it waits. Resumes the instant nothing above it is playing. |

- **Ducking rule:** when a layer speaks, everything below ducks to 30%. *The site sidechains everything to the house. As is traditional (§8.9).*
- **Restore guarantee (panic canon, verbatim):** on reveal, the BED fades back in over 0.8s at prior volume, unasked — including prior mute state — with the toast *"Audio restored automatically. The house insists."* The Hush Gratuity lands as one muffled coin-swallow while you read the receipt.
- **API (mechanical):** `HouseBand.play(id, {priority, volume?, loop?})` · `HouseBand.killAll()` (panic surface only) · `HouseBand.setMood(word)` · `HouseBand.setRegime('normal'|'desperation'|'flood')` · `HouseBand.setMuted(bool)`. Sound IDs are registered in §3's tables.

---

## 2. The comfort mix (loss vs. win asymmetry)

The doctrine, locked:

1. **Wins are loud everywhere.** All win sounds normalize to the loudness ceiling (−0.1 dBFS). Fanfare layers scale with the item's **est. value** — decorative, per canon — never with the net BB. The loudest celebration of your session accompanies the biggest net loss that awarded a JPEG.
2. **Losses are muffled and soothing.** Every loss sting is low-passed, warm, quiet (mixed like a bedtime podcast), built from the same three instruments: a soft *whump* (a pillow receiving money), a gentle downward gliss (a balloon conceding politely), and a distant, filtered *thank you* (synthesized; the house says thank you — roulette §11.5, now audibly).
3. **Net-loss wins get the full fanfare.** Junk fake wins (−8 BB, one $0.03 trophy) play the complete Siren-plus-confetti package. *The sirens do not know the difference. That is the feature. (Losses disguised as wins, implemented to industry standard. Citation available in 4pt.)*
4. **Fees whisper; totals blare.** On any receipt, each fee deduction pops muffled and low; the delivered total chimes bright. Conversion receipts are mixed with the same asymmetry they itemize with.
5. **Every credit chimes.** Any BB increase — rakeback nibble, pity BB, rebate — gets one bright coin chime. *The chime does not itemize. (Net: still down. The chime doesn't do math.)*
6. **Bonus OC expiry gets a funeral.** A three-note descending sting at the mood-change crossfade. *It is survived by nothing (§2.3).*

---

## 3. Sound inventory per surface

Canonical instruments first, then per-surface tables. **The Siren** (one (1), shared site-wide — roulette jackpot, coinflip legendary, crate Covert Extravagance, deposit fanfares may layer but not replace it): *safety equipment; cannot be muted (§7.3)*. **The Heartbeat** (one (1), the near-miss instrument — accelerando, then stops the instant the outcome is revealed; used by roulette's final 400ms, the coin's rim-balance, the crash stick): *the heartbeat stops when the reel recalibrates. Cardiologically, this is fine (§4.2).*

### Header & economy

| Sound | Description |
|---|---|
| Polite debit | Any BB spend: one muffled coin-swallow + soft *whump*. Warm. Almost kind. |
| Credit chime | Any BB gain: one bright ding (§2.5). |
| Fee pops / total chime | Receipt mixing per §2.4. |
| Bonus OC funeral | Three descending notes (§2.6). |
| Sitting-OC pulse | The OC chip's nag pulse renders as a soft, slow sonar ping. Barely audible. Persistent. |

### Age gate, identity & ToS

| Sound | Description |
|---|---|
| Welcome sting | Age-gate completion (with the existing confetti): triumphant, full-volume. *The first loud thing you hear, and the last unbiased one.* |
| Tag stamp | Gamertag assignment: one rubber-stamp *thunk*. |
| Paper ticks | Consent Meter scrolling: one soft page-flip per screen of the 40. |
| The lingering tone | 99% dwell (*"So close. Linger."*): a barely-audible rising sine that resolves only at unlock. Scrolling away mid-dwell deflates it — a quiet descending slide. *It resolves at 100%. So do you (§10.1(b)).* |
| Amendment scratch | §9.2 toast: one short paper-edit scratch. Nothing was edited. The scratch is traditional. |

### Allowance Roulette (hooks from roulette §12)

| Sound | Description |
|---|---|
| Spin ratchet | 5s rising ratchet-whoosh. Turbo plays the same whoosh pitch-shifted up over 2.5s — *arrives at the same destination, faster (per the Velocity Fee).* |
| Near-miss Heartbeat | P2, final ~400ms + the recalibration nudge; stops dead at settle; soothing loss whump follows. |
| Jackpot Siren | P1. Site-wide duck. Confetti cannons synced. |
| Guilt theremin | The insurance un-check modal (*"The wheel has feelings."*): one sad theremin wobble. |
| Pity lullaby | Pity-ladder awards: warm xylophone nursery notes. *The house's consolation sounds are set in a nursery. On purpose.* |
| Chase chime | Chase It™ button appearance: one small urgent chime (P3). |

### Skin Coinflip

| Sound | Description |
|---|---|
| Doubloon ping | Metallic ping + doppler spin, 2.8s. |
| Rim-balance ring | Edge outcome (+1.4s): the coin's ring sustains with a detuned tremble — the Heartbeat's metallic cousin. Tips with a low, apologetic *clunk*; justification-ladder lines are read over near-silence. |
| Photo-finish pause | 800ms of dead silence (everything ducks) while one pixel of confetti primes with a barely-audible *pin-pull*. VAR replay: a grainy rewind warble. The `OVERTURNED` stamp lands with a muffled gavel. *Rulings against you are mixed like lullabies (§8.9).* |
| Pot assembly | Break-even nibble: four muffled fee-pops and one bright chime, landing simultaneously. *The soundboard doesn't have a setting for "broke even."* |
| Vault brake | Legendary stash flash: vinyl-brake into the Siren. |

### College Fund Crash

| Sound | Description |
|---|---|
| Scheduler stamp | 600ms SCHEDULING…: one calendar-page flip + stamp. |
| Climb drone | P2 loop: rising tension hum pitched to the multiplier. Site standard. |
| The stick | Drone holds and *trembles* (tremolo) with the frozen multiplier; crowd-chatter blips rise underneath (*CASH OUT CASH OUT*). At 3+ consecutive crashes, `definitely_your_conscience`'s *"take it… take it…"* is the only sound on the site mixed close-mic'd. *Everything else is staged. The conscience is inside the headphones (§4.2²).* |
| The crash itself | **No explosion.** A soft distant *womp*, a gentle balloon-deflate gliss, then the comfort whump. *Crashes are muffled. The house doesn't like to dwell. (Dwell is available on request. Requests are mood-dependent.)* |
| Dodge boings | Each cash-out hop: a playful *boing*, pitched lower and quieter per dodge. Dodge 7: one exhausted wheeze, then the green click. |
| PROCESSING hum → One (1) Trumpet | Exhaustion click: 400ms dial-tone hum. First per session resolves into a modest single-instrument fanfare — **one (1) trumpet**. *It builds character (§2.4).* Later ones end in a kind, muffled *denied* buzzer — a nurse, not a gavel. |

### Loot Crate Defuser

| Sound | Description |
|---|---|
| Register, down-shifted | Key purchase: a cash-register *ka-ching* pitched down. The house collects. |
| Defusal tick | P2: ticking clock following the beat structure — fast (Lock 1) → one nervous tap (Stall A, "NEGOTIATING WITH LOCK 2") → resume (Lock 2) → **Stall B**: the canon `BASS_DROP_FINAL_v3_REAL.mp3`, synthesized live — a wobbling sub-bass drop, screen-shake synced, unskippable (P1). *It has never been final. There is no v1 or v2.* → crawl clicks (Lock 3) → one *snap* click, silence, reel. |
| Skip fast-forward | The 3 BB Skip plays a tape-fast-forward whir while Stall B extends 2.0s — the drop gets audibly longer. *Skip reduces perceived time only. The audio is load-bearing.* |
| The scoot | Fruit Roll-Up near-miss nudge: record-scratch + reverse cymbal as the slot slides. "SO CLOSE" toast: one soft canned *aww* (crowd, muffled). |
| Rarity flare | Award stingers scale by tier: Consumer Grade Trash gets one sad trombone note; Covert Extravagance gets the Siren. The `Downloads: 4,000,000` counter ticks audibly. |
| The envelope | Daily Mom Key / Consolation Key™ / Comeback Key: the same *fwump* + wax-seal *squish*, every time. *Mom's envelopes all sound the same. It's the same envelope.* |
| Recalibration whirl | Pity Meter / DupeShield™ recalibration: a prize-wheel wind-up played backwards. *The house has one move. It sounds the same in reverse.* |

### Live-Wins ticker (P3)

| Sound | Description |
|---|---|
| Tier blips | Junk entries: silent. Mid: soft blip. Jackpot-class: brighter blip + a sparkle of demo-Siren. *Even strangers' fake wins are loud. Especially those.* |
| Mike's stinger | MOMCODE_MIKE's personal riff — **mixed 3dB hot**. *He asked. He owns the board.* |
| The bell | MARKET (HFES-10) 45s tick: one exchange bell. Down-ticks play the same bell. *The bell has never gone down (§8.9).* |

### Live chat (P3)

| Sound | Description |
|---|---|
| Crowd taps | Ambient messages: quiet typewriter taps, persona-typed — hype kids slightly louder, **definitely-bots get a flat monotone beep**. *Bots beep. This is disclosure.* |
| The whisper | MOM's whispers: a soft close-mic'd breath-chime, above the crowd layer, in pink. *The loudest chat sound, because it's for you. (It bypasses the mute. See §6. It's intimate like that.)* |
| The quiet window | After your wins: 8–12s of literal silence, then one flat *beep* (*"who?"*). *The loudest thing on the site, per the chat spec, said once.* |
| Thunder | Mom Weather™ / rain: a filtered brown-noise thunder swell; each persona's 1 BB drips as a tiny coin-drip. Your chip gets no drip. *You were eligible for 0.0s of rain. The thunder, however, was free.* |
| Timeout thud | Vibe-violation timeout: one muffled ban-hammer. *Modesty is a mixing choice.* |

### Ask-Mom deposit flow (the polished rail)

Per ask-mom §18.1, this surface's audio is the most professionally mixed on the site — crisp, warm, buttery. The contrast is the thesis.

| Sound | Description |
|---|---|
| Kitchen transit | Asking beats: soft footsteps; under "MOM IS CONSIDERING…" the canon **fridge hold** — a gentle compressor-hum loop with a faint muffled kitchen TV. *The best hold music on the site. It is an appliance.* Dad's beat uses the garage fridge: same hum, one octave down, lonelier. |
| The decline | Full-screen red, played gently: two polite terminal beeps. *The decline is gentle. Declines are conversations (§3.1).* |
| The school checkbox | Unchecking: a hesitant almost-click that fails to commit. The canon re-check lands after 2s with **one soft click** (verbatim canon). |
| Success sting | P1: a rich *ka-ching* + swelling major chord + distant crowd *ooooh*. *It sounds expensive, because it is (fake (§12.4)).* |
| Hover-commit whine | One-Click™ 400ms ring: a rising charge whine resolving in a terminal *beep* — the sound of no money moving, moving. ESC mid-ring: the whine releases with a relieved downward sigh. *We heard you. This time.* |
| Badge pips | Bonus OC "+1" floats: tiny ascending pips. |
| Match rewind | The 4:59 reset: a quick tape-rewind zip. *The timer's rewind has a sound. The match's claim does not (§2.3).* |

### Marketplace

| Sound | Description |
|---|---|
| Thin register | Instant Sell™: a *ka-ching* missing half its notes — a register with one (1) working key (0.1%, floored). |
| Distant cha-ching | Listing flips to SOLD: the register again, mixed 40 feet away behind a wall. *Escrow is far away. Acoustically, this is accurate (§1.3).* |
| Reversed flare | Rollback Event: your best item's rarity flare played backwards. *The house reverses everything else; the audio is just honest about it.* |
| Contract crumple | Trade-Up: paper crumple + one new flare (smaller). |

---

## 4. The mood soundtrack (P4, the BED)

The admin's daily mood has a soundtrack. Five loops, one per mood word, crossfading at the daily boundary with a vinyl-rewind transition (3s) — at which the Bonus OC funeral fires if applicable, and the ticker's canon system line (*"Server admin's mood is now {mood}."*) lands.

**The disclosure rule:** the soundtrack expresses the **adjective, never the multiplier** (§8.9(b)). You can hear *that* today is Vindictive — never *how* vindictive. The bass line is mood-dependent; the mood's number is not a number.

| Mood word | The loop |
|---|---|
| **Vindictive** | Low minor drone, slow; a distant lawnmower; every ~40s, one floorboard creak. The house sighs. |
| **Petty** | An off-key music box, mid-tempo, wrong by one note. A music box with a grudge. |
| **Noncommittal** | A neutral pad and an aimless elevator arpeggio that never resolves. Waiting-room zen. |
| **Benevolent-ish** | The pad warms up; a cautious optimistic pluck appears, then apologizes. |
| **Generous** | Bright major-key bossa-lite with sleigh bells — the sound of a sale. The win flood rides on top (§5). |

- Never favorable two days in a row: the same loop never plays two days running, audibly. *You could set your watch by the mood, if the watch were load-bearing.*
- Chat's mood-analyst personas (chat §8) speculate over the loop. The loop never confirms anything. It's ambience, not disclosure (§8.9(b)).

## 5. Regimes — Desperation Mode & the Generous-day flood

The Band consumes the ticker's regime state (`setRegime`); both regimes are ticker-canon (live-wins §2, §8), audio realizes them:

- **Desperation Mode (BB < 6; exits on refill completion, re-arms per canon):** the BED's tempo rises ~15%; a low crowd-murmur layer swells (*the room leans in* — chat pressure cadence, made audible); ticker blips brighten; Mike tightens to every 5 minutes and mixes **4dB hot**. Everything gets louder except your wins, which don't exist. The `everyone is winning except you*` subtitle lands with one soft canned *aww* and a warm harp gliss — **Desperation Mode is scored like a candle store.** *The house wants you calm while you're poor.*
- **Generous-day flood (cadence ×0.6, jackpot share 20%):** blip rate rises ~1.7×; jackpot-class sparkle-stingers sprinkle constantly — but floods use the **demo-size Siren** (P3 sparkle), full Sirens stay P1. *Full sirens are reserved for winners (§1.3).* Sleigh bells carry it: flood + Generous loop = mall at Christmas. That is the intended experience.
- **Refill completion (Desperation exit):** the biggest legal sound on the site — full fanfare + crowd eruption + MOM's proud sting — then the murmur layer releases and the BED relaxes. `{n} is back. The house missed {n} (financially).` rides a warm welcome-back swell.

## 6. The mute toggle

- **Placement & copy:** header, beside the currency chips — a small speaker icon labeled **"Mute (recommended by no one)"**. Tooltip: *"Muting is available and changes nothing important (§8.9)."*
- **No volume slider.** *The house decides loudness. You decide whether (recommended by no one).*
- **Reconciliation with roulette §1:** the Auto-Spin settings panel's only entry remains **"sound: eventually."** The header mute is where "eventually" arrived. The settings entry is retained for historical reasons.
- Toggling mute off: the BED returns with a welcoming swell. *It missed you.* Toggling on: one last click. *Muting the click is not possible. The house buys this one.*

### What it silences — and what it doesn't

| Silenced (player-facing noise) | **Not silenced (contractually load-bearing)** |
|---|---|
| The mood soundtrack (P4) | **The Siren** — *safety equipment; a public-safety announcement that someone won; public safety cannot be muted (§7.3)* |
| All P2 game beats (whooshes, drones, ticks, the Heartbeat) | **The BASS_DROP** — *unskippable, by canon (crates §2); the drop cannot be skipped, muted, or survived* |
| All P3 social noise (blips, taps, thunder, the envelope) | **Deposit-flow stings** while the flow is open (success sting, hover-commit whine) — at **courtesy volume (50%)**. *Courtesy is 50% (§3.4).* |
| Every loss whump, gliss, and *thank you* | **MOM's whispers** — *for your ears only; intimacy bypasses the mute* |
| — | **MOM'S HOME** — makes no sound anyway, and works regardless |

The pattern, stated in 4pt under the toggle: *Mute silences your sounds. The house's sounds are not yours (§1.3).*

Persistence: `hfes_muted` (localStorage). Mute state survives panic restores (it *is* prior volume, per canon).

## 7. MOM'S HOME composition (canon, consolidated)

1. **Trigger = `killAll()`.** Instant, total, no fade — every playing and queued sound discarded, not paused. The Homework disguise is silent: no ticks, no fridge, no murmur. *The homework is silent. School is like that.* This is the site's one honest safety feature and it stays honest (panic §4).
2. **Restore = auto-restore.** 0.8s BED fade-in at prior volume, unasked, mute state included; toast verbatim. Missed audio is never replayed (§1).
3. In-flight rounds keep running and losing (canon) — and finish in silence. *The house doesn't need volume to win.*

## 8. Copy inventory (canonical strings)

- Mute toggle: *"Mute (recommended by no one)"* / tooltip *"Muting is available and changes nothing important (§8.9)."*
- Mute fine print: *"Mute silences your sounds. The house's sounds are not yours (§1.3)."*
- Restore toast: *"Audio restored automatically. The house insists."* (canon, verbatim)
- Siren disclosure: *"The Siren is safety equipment (§7.3) and cannot be muted."*
- Band credit (footer, 4pt): *"All audio is synthesized in your browser by the same code that computes your odds (§11.1). The orchestra is code. So are the odds."*
- Synthesis note: *"No audio files exist. The band is a function. (§4.2, spiritually)"*
- Missed-audio note: *"Missed sounds are not backlogged. You had to be there. (Like the Karambit.)"*
- LDW disclosure (4pt, on the first full fanfare after a net-loss win): *"This celebration accompanied a net loss. The industry term is 'losses disguised as wins.' We implemented the standard faithfully. Citation available on request. Requests are mood-dependent."*
- Autoplay note (pre-gesture silence): *"The band starts after your first click. Consent starts the music (§10.2)."*

## 9. State & interface contract

| Key / call | Scope | Purpose |
|---|---|---|
| `hfes_muted` | persist (localStorage) | Mute flag. The Band's only persistence. |
| `HouseBand.play(id, {priority, volume?, loop?})` | in-memory | All sound entry. Priorities per §1. |
| `HouseBand.killAll()` | — | **Panic surface only.** Hard-kill guarantee: discards playing + queued. |
| `HouseBand.setMood(word)` | — | Crossfade the BED at daily boundary / welcome-back mood reveal. |
| `HouseBand.setRegime(r)` | — | Consumes ticker regime ('normal' \| 'desperation' \| 'flood'). |
| `HouseBand.setMuted(bool)` | — | Header toggle. Un-muteable set per §6. |

Guarantees, restated for the integration pass: (1) panic is the only code path that can call `killAll()`, and it always wins — no priority outranks P0; (2) P1 ceremonies are never dropped, only delayed-by-queue; (3) the BED never ends — it waits; (4) sounds are fire-and-forget; no surface may loop audio outside the Band.

## 10. Non-goals

- No volume control of any kind — mute/no-mute is the entire player-side soundscape. Partial control would imply the audio is negotiable. It is not (§8.9).
- No per-surface audio settings. The Auto-Spin panel's "sound: eventually" stays a one-line joke, not a settings tree.
- No voice acting, no music tracks, no downloadable assets — synthesis only (§1). Naming sounds is spec; shipping binaries is someone else's mood.
- No audio for the Homework disguise — silence is the panic guarantee (§7).
- No "sonification of the mood rate" — the soundtrack never encodes the number, even accidentally: loops are keyed to the word only, five fixed beds (§4).

## Open questions sharpened (for the map / #18 integration pass)

- **Module home**: like `getMoodWord()`, the House Band needs one owner module — every surface consumes it; the integration pass should assign the home (candidate: alongside the mood module).
- **One conductor for pressure**: Desperation Mode tightens the ticker cadence, chat cadence, and now the BED tempo + murmur — sequencing/crossfades should run off one regime event, not three watchers.
- **The gesture chain**: age-gate click starts the Band; confirm the consent-toast ordering (welcome sting vs. grant toast) once, in integration.
- **Mike's hotness constants** (3dB / 4dB-in-Desperation) are shared by ticker and chat stingers — one constant, one owner.
- No existing ticket is invalidated; the roulette §12, crates §2, chat §11, and retention §6 audio hooks are all absorbed here verbatim.
