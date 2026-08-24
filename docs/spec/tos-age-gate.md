# ToS & Age-Gate Copy — decision-complete spec

Resolution of [#13](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/13). Every clause below is final copy, not a placeholder. Implementation tickets should cut mechanically from this. Companion doc: the economy numbers are locked in [#2](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/2).

---

## 0. Standing rules

1. **Imovable canon.** §1.3 (Identity Verification), §4.1 (Dispute Resolution), and §8.9 (Currency Volatility) keep their numbers and their existing body text verbatim. Live UI copy already cites "Section 1.3" (insufficient-funds banner — locked verbatim by #2); nothing may renumber Articles 1, 4, or 8.
2. **The reality strap.** Every money-adjacent modal (Ask-Mom flow, conversion receipt, withdrawal, ToS acceptance) carries this footer line, verbatim:

   > *100% fake. No money moves. No card is charged. No account exists. Ever. (§12.4)*

3. **Voice.** Legalese played deadly straight, broken by parentheticals that confess. Titles in Bangers-style ALL CAPS. The site always ends sincere disclaimers with mild despair ("please, for the love of god, log off").
4. **Numbering shape.** Real clauses live in Articles 1–12 (≈5 screens). The remaining ~35 screens are consent-theater filler (§5 below) — procedurally repeated boilerplate with numbered easter-egg clauses, so the 40-screen total is cheap to build and miserable to read, which is the point.

---

## 1. Age gate (first visit, replaces the single-button gate)

Three steps on one card. Card title stays **"AGE VERIFICATION REQUIRED"**; subtitle stays *"By law (the law of vibes)…"*. On completion: confetti (existing behavior), `hfes_age=1` persisted, and the first-visit grant toast (§1.4 below).

### Step 1 — Checkboxes ("ARE YOU OLD ENOUGH? (SPEEDRUN)")

- ☐ **"I am at least 18 years old."**
- ☐ **"My older brother is in the other room and said it's fine."** *(→ §1.1, the Older Brother Clause)*
- ☐ **"I accept that 'the law of vibes' is not a real jurisdiction and agree to be bound by it anyway."**

Behavior: the continue button enables when **at least one** box is checked. Button label while disabled: **"Select at least one (1) truth."** Checking only the first box reveals a sub-warning: *"Suspicious. Nobody checks only the first box. Proceeding anyway."* The brother clause is self-sufficient per §1.1.

### Step 2 — "Is Mom home?"

Three buttons, any of which continues:

- **"Yes"** → *"Perfect. Please do not tell her about this website. (§3.1)"* — and the MOM'S HOME panic button gets a subtle glow for the rest of the session ("you'll be needing this").
- **"No"** → *"Even better."*
- **"I am Mom (hi)"** → routes straight into **Are You Mom? Verification** (§2 below). Failing it (guaranteed) returns here with *"Verification failed. Welcome back, sweetie."* and continues.

### Step 3 — Birth-year dropdown ("WHAT YEAR WERE YOU BORN? (FOR LEGAL REASONS)")

A `<select>` of years 1990–2015, listed in no discernible order.

- **Years 1990–2008** (would make the user an adult): rejected. Rotating rejections, in order:
  1. *"That year is not accepted at this time."*
  2. *"Error: that year would make you an adult, and adults don't type like this."*
  3. *"Our records indicate you were born in 2012. Records are final (§1.2(a))."*
- **Years 2009–2015** (minor): accepted — *"That tracks."*
- **The last option in the list**: **"1998 (Mom's friend Karen's son)"** → *"Verified. Welcome back, Kyle."* (Always accepted. Kyle has been here forever.)
- After two rejections, a small link appears: **"Skip (legal)"** → *"Verification waived per §1.2(b) — the birth year you didn't pick has been recorded."* Continues to confetti.

Keep the existing 10px satire disclaimer at the bottom of the card, now appending "(§12.4)".

### Step 4 — First-visit grant toast (after confetti)

> **Maternal Starter Grant received: 150 Banana Bucks (§2.6). Mom doesn't know yet.**

---

## 2. "Are You Mom? Verification" modal (§3.3)

Entered from age-gate Step 2 ("I am Mom (hi)") or as the opening beat of the Ask-Mom deposit flow ("Who's asking?" → "I am Mom"). Title: **"ARE YOU MOM? — VERIFICATION"**. Intro: *"Thank you for your interest in being Mom. Please complete the following."*

1. *"What is your child's gamertag?"* — free text; any answer → *"Incorrect. You don't know it. None of them do."*
2. *"A mother would know: what's the password?"* — free text; any answer → *"Incorrect. The correct answer was 'no'."*
3. Checkbox: ☐ **"Fine. But this is the last time."**

On completion:

> **"Verification failed. You are not Mom. You are, at best, a Mom-adjacent minor with a credit card (§3.2). Deposit may proceed."**

Failing verification is the pass condition — that is the joke and the dark pattern. "Mom-adjacent minor" is the certified deposit-eligible state. Any other answer on the deposit flow's "Who's asking?" ("I'm doing this for Mom (she said it's fine)" / "Depositing on behalf of a minor (yours truly)") skips the gauntlet and goes straight to the §3.2 disclosure below.

---

## 3. "Depositing on behalf of a minor (yours truly)" disclosure (§3.2)

Shown once per refill-package selection, above the big fake BUY button:

> **DEPOSITING ON BEHALF OF A MINOR (YOURS TRULY) — §3.2**
>
> By proceeding, the depositor affirms that the card is Mom's, that Mom has not *explicitly* denied permission, and that "she said it's fine" referred to a different thing entirely (see §1.1, the Older Brother Clause). Deposits are final. Refunds are a §6 concept.
>
> *Card details are not collected, because there is no card. There is no payment processor. This is a joke about gambling, not gambling. The only thing charged here is the vibe.*

Followed by the reality strap (§0.2).

---

## 4. The Terms of Service document (full clause copy)

Modal title stays **"Terms of Service (Excerpts)"** — appending *"— a legal document about a fake website"*.

### Article 1 — About You

**§1.1 (The Older Brother Clause).** Users are eligible if they are at least 18 years old, OR their older brother is in the other room and said it's fine. The Older Brother's permission is self-sufficient, non-transferable to younger siblings' friends, and expires when he gets up to get a snack. The Operator may not verify the Older Brother's existence, location, or vibe.

**§1.2 (Date of Birth Attestation).** (a) The User's birth year is whatever the dropdown eventually accepts. Records are final. (b) Birth years that would make the User an adult are rejected on sight, as adults do not type like this. The year the User did not pick may be recorded for marketing purposes.

**§1.3 (Identity Verification).** *To execute a balance withdrawal exceeding $0.00, users must upload a notarized copy of their 4th-grade report card, a signed handwritten letter from their guidance counselor, and physical delivery of three (3) unopened energy drink cans to our P.O. Box in Grand Cayman.* (b) All withdrawal requests remain in a state of Pending until the foregoing is received. The foregoing has never been received. Withdrawals are, accordingly, Pending. (See also §6.)

### Article 2 — The Money (Such As It Is)

**§2.1 (Emotional Tender).** Obtuse Credits™ are non-refundable, non-transferable, and constitute "emotional tender" — a currency that binds only feelings. Upon acquisition, OC are legally indistinguishable from pride.

**§2.2 (Banana Bucks).** Banana Bucks (BB) are the play currency in which all wagers are denominated. BB hold no value of any kind, which the Operator considers a feature.

**§2.3 (Bonus Credits).** "Bonus" OC included with select refill packages are bonus in name only. Bonus OC expire with the mood that granted them: at the next daily mood change they are void, unconverted, and described in the past tense. Expired Bonus OC may not be mourned on the premises.

**§2.4 (Derived Denominations).** V-Gems (×40,000 per BB) and SkinCoinz (×566.67 per BB) are display-only derivations of the BB balance, rounded in whichever direction hurts. The USD denomination is permanently estimated at $0.00. This is not a rounding error. This is the estimate.

**§2.5 (One-Way Conversion).** OC may be converted to BB (see §8). BB may not be converted to OC, back to Mom's card, or into anything else, a state the Operator describes as "diplomatically impossible."

**§2.6 (Maternal Starter Grant).** Each new player receives 150 BB, issued as the Maternal Starter Grant: an advance against future chores, repayable in chores, forgiven never. Mom does not know about this loan. She will.

### Article 3 — The Maternal Funding Rail

**§3.1 (Authorized Cardholder).** The only authorized funding instrument is Mom's card. Authorization is inferred from proximity, plausibility, and the phrase "she said it's fine."

**§3.2 (Depositing on Behalf of a Minor).** [Copy in §3 of this spec, incorporated by reference, as is traditional.]

**§3.3 (Are You Mom? Verification).** Persons claiming to be Mom must complete the Verification Gauntlet. The Gauntlet cannot be passed. Applicants who fail the Gauntlet are certified Mom-adjacent minors and may deposit immediately. Mom herself has never applied, and good for her.

**§3.4 (Maternal Gratuity).** Every conversion includes a Maternal Gratuity of 1 BB. The Gratuity is customary, not required, automatically applied, non-negotiable, and retained entirely by the house. Tipping is how Mom shows she cares; here, the site shows it on her behalf, to itself.

**§3.5 (Refill Packages).** Refill packages ("Lunch Money Special," "Allowance Advance," "Report Card Bonus," "Mom's Max") are priced in fake USD and denominated in OC. "Mom's Max" is sold on the understanding that this is the last time, an understanding that resets upon purchase (see §10.3).

### Article 4 — Disputes

**§4.1 (Dispute Resolution).** *All claims, disputes, or losses shall be resolved not in a court of law, but via a mandatory 1v1 Quickscope Match on Rust (Radar Always On, Intervention Only). If the User loses, their account balance is permanently forfeited to site operational overhead.* The Operator has never lost this match. The Operator practices.

### Article 5 — Gameplay & Fairness

**§5.1 (Provably Fair™).** Every roll is verifiable. Verification is Pending (see §1.3). The PROVABLY FAIR™ badge links somewhere. Where is a mood.

**§5.2 (Odds Disclosure).** Odds: yes. (Full table available on request. Requests are mood-dependent, per §8.9.)

**§5.3 (The House).** The house always wins eventually. "Eventually" is defined by the house, mid-game, out loud, while laughing.

### Article 6 — Withdrawals & Other Theoretical Concepts

**§6.1 (Pending Status).** Withdrawals are Pending. See §1.3, which is not near here on purpose.

**§6.2 (ExpressCashout).** An express cash-out feature is coming soon. ETA: mood.

### Article 7 — Responsible Gaming

**§7.1 (Self-Exclusion).** To self-exclude, close the tab. To permanently self-exclude, have Mom change the Wi-Fi password. She has been meaning to anyway.

**§7.2 (Deposit Limits).** To set a deposit limit, ask Mom to set a deposit limit. This is the only supported limit mechanism, and it is extremely effective.

**§7.3 (Parental Bailout Feature).** The Operator is proud to offer a best-in-class responsible gaming suite: the MOM'S HOME button instantly replaces the entire casino with homework. No licensed operator offers anything comparable, which says something about licensed operators.

**§7.4 (The Honest Paragraph).** If gambling has stopped being a joke for you or for someone you know, the joke portion of this website is over for one paragraph: help is real and it works — BeGambleAware (begambleaware.org), Gamblers Anonymous (gamblersanonymous.org), or in the US, 1-800-GAMBLER. That was the only honest paragraph on this site. Everything else, including this sentence's neighbors, is satire.

### Article 8 — Rates, Fees & Moods

**§8.1 (Conversion, Generally).** OC convert to BB at a base rate multiplied by the Daily Mood (§8.9). The numeric rate is never displayed. It has been described as "a number," which is all the disclosure required by vibes.

**§8.2 (Mood Stabilization Fee).** Each conversion bears a Mood Stabilization Fee of 7.3%. The fee keeps the rate from getting worse. The rate gets worse anyway, but calmer.

**§8.3 (Conversion Processing Fee).** Each conversion bears a flat Conversion Processing Fee of 5 BB, which compensates the house for pressing the button.

**§8.4 (Order of Operations).** Fees apply in the order listed on the receipt, then §8.9 applies to whatever remains, then whatever remains after that is what you get.

**§8.5 (No Take-Backs).** Conversions are final, even if the mood improves one hour later. Especially then.

**§8.6–§8.8.** Reserved for fees we haven't invented yet.

**§8.9 (Currency Volatility).** *(a)* *SkinCoinz and Banana Bucks hold no real-world monetary value, spiritual value, or intrinsic utility, and may be recalculated at any time based on the server admin's daily mood.* (b) Obtuse Credits™ are included in the foregoing by reference and also by mood. The Daily Mood is deterministic, shared by all players for the whole day, expressed publicly only as one (1) of five (5) adjectives, and never favorable two days in a row, because that would be suspicious. (c) §8.9 rounding is always down. Fractional BB are voided and itemized on the receipt so that you may grieve them individually.

### Article 9 — Amendments

**§9.1 (Unilateral Amendments).** These Terms may be amended at any time, for any reason, or for no reason, which the Operator finds funny.

**§9.2 (Notice).** Notice of amendment shall be provided by a small toast stating that a section was edited while you were reading this. Continued reading constitutes acceptance of both versions. Not reading also constitutes acceptance. Acceptance is the default state of the User (§10.2).

### Article 10 — Consent Theater

**§10.1 (Scroll Requirement).** (a) Consent is valid only upon reaching the bottom of all forty (40) screens of these Terms, as measured by the Consent Meter. (b) The Meter caps at 99% until the User lingers at the bottom for three (3) seconds, a dwell requirement so that acceptance may be savored.

**§10.2 (The Ledger).** The User's acceptances are recorded in a bound leather ledger kept in the treehouse. The ledger is real to us.

**§10.3 (Re-Acceptance).** The Meter re-arms upon: (i) purchase of Mom's Max, the "last time" package, because last times reset the ledger; and (ii) any Notice under §9.2, effective on the next opening of these Terms.

### Article 11 — Privacy

**§11.1 (Your Data).** All data is stored in your own browser. Our server is your browser, which means our security posture is your security posture, and we wish you luck.

### Article 12 — Miscellaneous

**§12.1 (Entire Agreement).** This is the entire agreement. There is nothing else. Do not look for anything else.

**§12.2 (Severability).** If any clause is found to be enforceable, it was a drafting error and will be replaced with a joke.

**§12.3 (Governing Law).** The law of vibes, as established at the Age Gate.

**§12.4 (Reality).** Nothing in these Terms, on this website, or in your balance is real. This is a satirical parody of skin-gambling websites. No real money, payment, account, or server exists. If any clause herein appears to create a real financial obligation, it is a joke, and the joke is at the expense of websites that mean it.

---

## 5. Consent theater (the 40 screens)

- The ToS modal's accept control is a **Consent Meter**: a button labeled **"I have read the Terms (0%)"**, percentage bound to scroll position. Disabled below 100%.
- At 99%: label becomes **"So close. Linger. (§10.1(b))"** — unlocks after 3 seconds of dwell at the bottom.
- At 100%: label becomes **"I have read the Terms (allegedly)"** — click accepts, fires confetti, closes.
- **First open of a session requires full scroll.** After acceptance, subsequent opens are free-browse with the existing **"Close (reluctantly)"** button retained. The Meter re-arms only per §10.3: after a Mom's Max purchase, or after a §9.2 notice.
- **Filler screens (~35 of 40):** procedurally repeated on-brand boilerplate with ascending section numbers (§13.1 → §41.9). Three rotating templates:
  1. *"WHEREAS the User, hereinafter 'the User,' did whereas the foregoing, notwithstanding;"*
  2. *"The Operator reserves all rights, including the rights not enumerated, the rights previously waived, and the right of way."*
  3. *"This paragraph intentionally left enforceable."*
  Plus one easter egg per ~10 screens (e.g., a single line reading *"Mood: [REDACTED]"*, and near the very bottom, in 4pt-equivalent faint text: *"so close! (0.0%)"* — the near-miss disclosure from the research catalogue).
- After first full acceptance, the footer link relabels from **"Terms of Service (please don't read this)"** to **"Terms of Service (you've been warned)"**.

---

## 6. Amendment notices (§9.2 toast)

- If the ToS modal has been open **45+ seconds**, a toast fires:

  > **Notice: §8.9 was edited while you were reading this. The mood has changed. No further information will be provided.**

  Dismiss label: **"Acknowledged (both versions)."** Nothing was actually edited; §8.9 is eternal.
- The toast fires at most once per ToS open, re-arms the Meter for the *next* open (per §10.3(ii)), and pauses politely if the user is scrolled into Article 8 ("we don't kick people while they're reading §8.9. We're not monsters.").

---

## 7. UI cross-reference table (what cites what)

| Surface | Cites |
|---|---|
| Insufficient funds banner (verbatim, locked by #2) | §1.3 |
| Age-gate brother checkbox | §1.1 |
| Birth-year dropdown footnotes | §1.2 |
| First-visit grant toast | §2.6 |
| OC chip / "+ Top Up" hover | §2.1 |
| "ⓘ other denominations" hover | §2.4 |
| Ask-Mom "Who's asking?" → Are You Mom? | §3.3 |
| Deposit disclosure | §3.2 |
| Receipt fee lines: Mood Stabilization / Processing / Maternal Gratuity / rounding | §8.2 / §8.3 / §3.4 / §8.9 |
| ExpressCashout (coming soon) button | §6.2 |
| PROVABLY FAIR™ badge (links to 404) | §5.1 |
| Amendment toast | §9.2 |
| Consent Meter labels | §10.1 |
| MOM'S HOME button tooltip | §7.3 |

---

## 8. Legal-sanity guardrails

1. The reality strap (§0.2) is mandatory on every modal that mimes a financial action; §12.4 is its master text.
2. §7.4 (The Honest Paragraph) is the only clause played straight, on purpose — it carries the real help-line line and the explicit "everything else is satire" frame.
3. No copy anywhere may state or imply that a card will be charged, money will move, or winnings can be withdrawn. All such verbs stay in the future negative ("may not be converted," "Pending," "$0.00").
4. Existing disclaimers (age-gate 10px line, footer satire line) are retained, now anchored to §12.4.
