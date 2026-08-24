# Dark-pattern catalogue for parody targets

Research deliverable for issue #4. Feeds the per-surface brainstorms and the retention shortlist ticket. Every entry: the pattern, how it worked in the wild (with citations), why it's parody-worthy for Hot For E-Skins 2026, and a parody-potential rating (low / med / high).

Source tiers: **[P]** primary/regulatory or first-party, **[A]** peer-reviewed academic, **[J]** reputable journalism, **[T]** tertiary/affiliate — flagged, use for pattern corroboration only. Numbers refer to the source list at the end.

---

## 1. Conversion & acquisition patterns

### 1.1 Owner-influencer "wins" as ads — HIGH
- **Pattern**: Popular streamers/YouTubers film themselves winning big on a gambling site, without disclosing they own the site or were paid.
- **In the wild**: Trevor "TmarTn" Martin and Thomas "Syndicate" Cassell owned CSGO Lotto, promoted it as ordinary players, and paid other influencers $2,500–$55,000 to do the same — with contractual clauses barring them from saying anything negative about the site [P1]. Cassell tweeted "I turned $200 into $6,000 on @CSGOLotto" and posted "win" screenshots; some disclosures sat below the fold in video descriptions [P1]. In 2024 the saturation version persists: Barron's counted 120 of the top 300 Counter-Strike Twitch streamers (40%) holding skin-gambling sponsorships [P8][J7].
- **Parody angle**: Map directly to the ticker/chat — our "Gamertags" hit implausible streaks of Fake wins moments before the Ask-Mom deposit flow lights up. The FTC's actual complaint (fake-independent endorser) is a ready-made ToS §8.9 joke.
- **Rating**: **high**.

### 1.2 Implausible winning streaks (manufactured social proof) — HIGH
- **Pattern**: Site-side win feeds and streamer results engineered to look like ordinary players win constantly.
- **In the wild**: The UK Gambling Commission found promotions "in some more extreme examples have been exposed as deliberately misleading, for example by showing implausible winning streaks later found to be false, with the seeming intent to entice the audience to gamble" [P3].
- **Parody angle**: A win ticker whose jackpot names rotate between obviously-fake gamertags (`definitely_not_a_bot`, `MomApproved88`) — cite the UKGC wording in a tooltip nobody opens.
- **Rating**: **high**.

### 1.3 Skins as untraceable casino chips — HIGH
- **Pattern**: Deposit via Steam login + trade bots; wager cosmetic items instead of money; no KYC because "no real money" moves.
- **In the wild**: UKGC: children as young as 11 were betting skins without realizing it was gambling — 11% of 11–16-year-olds in Great Britain had participated (2017 report); the Commission prosecuted operators of an unlicensed FIFA-linked site [J4]. ACMA (2023) said skins gambling services "are particularly concerning as they tap into a youth market and have the potential to convert gamers into gamblers" when warning Feral Holdings over CS:GO Roll [P7]. The pre-crackdown market was estimated at ~$5B for 2016 [T1].
- **Parody angle**: Obtuse Credits™ are exactly this pattern played straight: "no real money" while the Ask-Mom flow is the real-money rail. The ACMA quote is the moral of the site in one line.
- **Rating**: **high**.

### 1.4 Influencer-code funnel — MED
- **Pattern**: Promo codes from streamers give new users free cases/credits, tying acquisition to parasocial trust and making the first bet "free."
- **In the wild**: Promo codes, free cases and welcome bonuses are the standard acquisition stack across CS2 gambling sites [T2]; CSGORoll runs a first-party rewards program with promo-driven free cases and seasonal events [P9].
- **Parody angle**: A "USE CODE MOM" banner with an influencer who is transparently the site owner in a wig.
- **Rating**: **med**.

## 2. Play-surface patterns

### 2.1 Case-opening suspense + engineered near-misses — HIGH
- **Pattern**: The scrolling case-opening reel that decelerates past the jackpot item before stopping on junk — a slot-reel near-miss you can watch happen.
- **In the wild**: Near-miss features (showing players rare items they could have won) are a documented loot-box structural characteristic and a significant moderator of the link between loot-box spending and problem gambling [A2][A4]; a systematic review found near-miss engagement mediated the loot-box/gambling relationship across 14 of 20 studies [A5]. CS:GO's own case openings were ruled an illegal game of chance in Belgium [P5].
- **Parody angle**: The reel visibly recalibrating — the Knife slot scoots one position left as the needle approaches; a "so close!" toast with a comforting 0.0% chance disclosed in 4pt font.
- **Rating**: **high**.

### 2.2 Hidden odds, variable-ratio payouts — MED
- **Pattern**: Real-money randomized rewards with unpublished odds until regulators forced disclosure.
- **In the wild**: China required publication of all loot-box odds (2017–2019) [P4]; EA began showing FIFA pack probabilities after regulatory pressure [J1]. Belgium and the Netherlands both classified major titles' boxes as gambling (Belgium: FIFA 18, Overwatch, CS:GO — "illegal game of chance," removal required; Netherlands: 4 of 10 studied games violated its Betting and Gaming Act, publishers given 8 weeks to comply) [P5][J1].
- **Parody angle**: Mood rate as odds disclosure: "Odds: yes. (Full table available on request. Requests are mood-dependent.)"
- **Rating**: **med**.

### 2.3 Jackpot pot-aggro — HIGH
- **Pattern**: Winner-take-all community pots with a visible, escalating balance and a countdown — every deposit grows the pot you might win.
- **In the wild**: The 2016 CS:GO jackpot sites were the flagship of the skin-gambling wave Valve moved against in July 2016 [J2][T1].
- **Parody angle**: A pot that visibly grows only when *you* lose, with a countdown that pauses at 1s whenever the cursor moves toward the exit.
- **Rating**: **high**.

### 2.4 Thin-veil casino games — MED
- **Pattern**: Roulette, coinflip, crash — reskinned casino staples with skins as stakes.
- **In the wild**: CSGODouble (roulette) formally announced closure after Valve's 2016 crackdown [T1]; casino-style games on CSGORoll were found by ACMA to violate Australia's Interactive Gambling Act 2001 [P7].
- **Parody angle**: Casino games wearing video-game costumes — a roulette wheel skinned as a "loot wheel" with a banana as the ball.
- **Rating**: **med**.

### 2.5 Esports match betting with skins — MED
- **Pattern**: Bet skins on pro match outcomes; the item economy becomes a bookmaker's ledger.
- **In the wild**: Skins betting on esports was the core of the 2016 scandal and of the WSGC's order to Valve ("stop facilitating the use of 'skins' for gambling activities") [P6][J3].
- **Parody angle**: Odds on fictional schoolyard events (today's cafeteria pizza: 3:1) denominated in Banana Bucks.
- **Rating**: **med**.

## 3. Trust, money & deception patterns

### 3.1 Counterintuitive buy buttons + refund maze — HIGH
- **Pattern**: Interface design that manufactures unwanted purchases and buries the undo path.
- **In the wild**: FTC v. Epic Games ($520M, Dec 2022): Fortnite's "counterintuitive, inconsistent, and confusing button configuration" charged players with a single button press — on PlayStation, the cross button previewed some items but bought others; players were charged waking the game from sleep mode. Epic hid the refund request path under a hard-to-find Settings tab, imposed a flat "no refunds" policy on some purchases, and locked accounts of players who disputed charges [P2].
- **Parody angle**: Buy/preview buttons that swap labels when the cursor approaches; a refund flow that ends in "Have you tried asking Mom?" then closes.
- **Rating**: **high**.

### 3.2 The cash-out mirage — HIGH
- **Pattern**: Winnings that are easy to deposit but structurally hard to withdraw; marketplace liquidity as the exit everyone assumes exists.
- **In the wild**: Skin cash-out depended on gray-market infrastructure — Valve banned OPSkins' trade bots in June 2018 after a cease-and-desist over its ExpressTrade bypass, locking users out of roughly $2M in items [J5]. The FTC-Epic order now requires cancellation to be "as simple as the means used to initiate the charge" [P2] — the legal recognition that this asymmetry is the dark pattern.
- **Parody angle**: Already canon: Pending withdrawal (ToS §1.3). Reinforce with an "ExpressCashout (coming soon, eta: mood)" button next to one-click deposits.
- **Rating**: **high**.

### 3.3 "Provably fair" trust-washing — HIGH
- **Pattern**: Cryptographic-fairness branding ("provably fair") used as a seal of honesty while the *surrounding* experience — promotions, reels, bonuses — does the manipulating.
- **In the wild**: CSGORoll markets a "provably fair system" first-party [P12], as do most modern skin sites [T2]; meanwhile outcome-rigging allegations swirled around CSGOShuffle in 2016 — Twitch's countersuit against James "PhantomL0rd" Varga alleged he failed to disclose ownership and manipulated outcomes (Varga won a narrow breach-of-contract verdict, $20,720; the fraud allegations were never adjudicated as liability — treat rigging as alleged, not proven) [J6].
- **Parody angle**: "PROVABLY FAIR™ — each roll is verifiable. Verification pending (see ToS §1.3)." The badge links to a 404.
- **Rating**: **high**.

### 3.4 Currency laundering: three currencies deep — HIGH
- **Pattern**: Money → premium currency → play currency → items, each hop obscuring value and refundability.
- **In the wild**: Valve takes a marketplace cut on skin transactions (commonly cited ~15% total for CS:GO items — secondary sourcing, see Unverified) [T1]; FTC-Epic concerned saved-payment ambiguity and unauthenticated child purchases at the money→currency hop [P2]. Academic framing: in-game-currency layers are one of the documented structural features weakening consumers' ability to track spend [A4].
- **Parody angle**: Already canon: OC → BB at a Mood rate, with USD/V-Gems/SkinCoinz as display-only derived denominations. Add a "what did I actually pay?" calculator that returns "???".
- **Rating**: **high**.

### 3.5 Loot boxes inside nominally non-gambling AAA games — MED
- **Pattern**: The same mechanics sold as "surprise mechanics" inside all-ages games.
- **In the wild**: Drummond & Sauer examined 22 games rated suitable for audiences 17 or younger and found loot boxes "structurally and psychologically akin to gambling"; several met psychological definitions of gambling [A1]. Loot-box spending correlates with problem-gambling severity with a medium-to-large effect size (preregistered, r² = 0.092), and removing single features like cash-out or pay-to-win does not sever the link [A2]. When a game actually removed loot boxes (Heroes of the Storm, 2019), only problem gamblers reduced spending [A3].
- **Parody angle**: Our whole premise. Quote Drummond & Sauer's abstract in the fake game's EULA.
- **Rating**: **med** (well-trodden; the *site* patterns are fresher parody).

## 4. Retention mechanics (feeds the retention shortlist ticket)

### 4.1 VIP tiers + dedicated VIP hosts — HIGH
- **Pattern**: Spend-based status ladders whose rewards are... more gambling, plus a personal "host" whose job is keeping whales at the table.
- **In the wild**: CSGORoll homepage: "Our VIP Program rewards you the more you play — offering daily rewards, bonuses and direct access to dedicated VIP hosts" [P10].
- **Parody angle**: "VIP TIER: MOM'S FAVORITE" — the host is Mom, and the perk is that she's not angry (yet).
- **Rating**: **high**.

### 4.2 Rakeback — HIGH
- **Pattern**: The site returns a percentage of the house edge proportional to how much you wager — literal pay-to-lose-more.
- **In the wild**: First-party: "Level up your rank, hit rakeback tiers" — rakeback is a headline CSGORoll reward [P9]; "free VIP rakeback" is a standard cross-site perk [T2].
- **Parody angle**: "Rakeback: the more you lose, the more we give back to lose again. It's basically an allowance."
- **Rating**: **high**.

### 4.3 Daily free cases / drip feeds (loss-leaders) — HIGH
- **Pattern**: Free daily cases and faucet drops that must be claimed on-site, rank-gated so they grow with your losses, creating streak-based return habits.
- **In the wild**: First-party: daily free cases, "Skin Faucet" drops, and rakeback tiers tied to rank progression [P9]; "Daily Free Cases are now tied to your current rank and progression. Each time you rank up, you'll receive 180 keys" [P11].
- **Parody angle**: A daily free case that mostly contains a note saying "come back tomorrow"; rank-gating where the reward for losing all week is a slightly shinier empty case.
- **Rating**: **high**.

### 4.4 Deposit matches & wagering requirements — MED
- **Pattern**: "100% first-deposit match!" whose bonus funds can't be withdrawn until re-wagered many times — a designed on-ramp to chasing.
- **In the wild**: Deposit bonuses + wagering requirements are the standard stack documented across CS2 gambling sites [T2]; the FTC-Epic consent order's "consent as easy as cancellation" principle exists because deposit-side flows were frictionless and exit-side flows were mazes [P2].
- **Parody angle**: "Deposit match: 100%*. *Matched funds expire when the server admin gets bored (see Mood rate)."
- **Rating**: **med**.

### 4.5 Hard loss-leaders on signup — HIGH
- **Pattern**: Free $1, free spins, welcome cases — small guaranteed value whose only purpose is the first real deposit.
- **In the wild**: "Free $1" and free-bonus welcome packages are standard [T2]; promo codes + 3 free cases + 10% deposit bonus bundles are how affiliates sell CSGORoll [T2].
- **Parody angle**: A ceremonial $1 in Banana Bucks, hand-delivered, with a receipt listing its eventual destination (the house).
- **Rating**: **high**.

### 4.6 Rain events & chat giveaways — MED
- **Pattern**: Free credits "rained" into chat at unpredictable intervals — variable-ratio reinforcement for showing up.
- **In the wild**: Rain events are a standard documented perk across CS2 sites [T2]; live-chat win announcements create the ambient social proof the UKGC flagged as sometimes fabricated [P3].
- **Parody angle**: Chat "rain" that falls only on gamertags that haven't deposited in 6 hours, with thunder SFX.
- **Rating**: **med**.

### 4.7 Refill friction asymmetry — HIGH
- **Pattern**: Deposit is one click; exit (withdraw, cancel, close account) is a labyrinth.
- **In the wild**: The FTC-Epic order explicitly requires "a cancellation mechanism as simple as the means used to initiate the charge" and bars blocking accounts of players who dispute charges — codifying the asymmetry as the violation [P2]. Our glossary's Ask-Mom deposit flow vs Pending withdrawal is this pattern.
- **Parody angle**: The MOM'S HOME panic affordance is the anti-pattern weaponized: the site's only frictionless exit masks it as homework.
- **Rating**: **high**.

### 4.8 Streaks, quests & seasonal events — MED
- **Pattern**: Daily quests, login streaks, seasonal events converting the casino into a chores list you're rewarded for never skipping.
- **In the wild**: Seasonal events and rank progression are first-party CSGORoll program features [P9][P11].
- **Parody angle**: A 7-day losing streak badge ("Consistent!").
- **Rating**: **med**.

## 5. Regulatory rap sheet (context for the fiction's "ToS" jokes)

| When | What | Source |
|---|---|---|
| Jul 2016 | Valve C&Ds 23 skin-gambling sites (10-day deadline); ~20 more a week later | J2, T1 |
| Oct 2016 | WA State Gambling Commission orders Valve to stop facilitating skins gambling | P6, J3 |
| Mar 2017 | UKGC position paper: skins = money for gambling purposes; flags fake win-streak promos | P3 |
| Sep 2017 | FTC's first-ever influencer case: CSGO Lotto owners settle (undisclosed ownership, paid promos) | P1 |
| Dec 2017 | UKGC youth report: 11% of 11–16s bet skins; "children as young as 11" | J4 |
| Apr 2018 | Belgium: FIFA 18 / Overwatch / CS:GO loot boxes = illegal game of chance; Netherlands: 4 of 10 games violate betting law, 8 weeks to comply | P5, J1 |
| Jun 2018 | Valve bans OPSkins bots (~$2M in items locked); NL/BG trades disabled | J5, T1 |
| 2019–2020 | EA fined over FIFA packs; Dutch court sides with Ksa (total ~€10M) | J1 |
| Dec 2022 | FTC v. Epic: $520M — dark patterns + COPPA; refunds $245M | P2 |
| May 2023 | ACMA formal warning: CS:GO Roll withdrawn from Australia (youth-market concern) | P7 |
| Jun 2023 | Valve adds gambling to Steam prohibited practices; 40+ supply accounts banned ($2M+ locked) | T1 |
| 2024–25 | DCMS rapid evidence review: 40% of top-300 CS Twitch streamers skin-gambling sponsored; normalisation documented | P8 |

Market-size color for the loss-leader jokes: Eilers & Krejcik / Narus forecast a $19.7B-by-2020 skins market in May 2016, then cut it to $670M in Sept 2016 after Valve's crackdown — the WSGC published both charts [P6].

---

## Sources

**Primary / regulatory / first-party**
- [P1] FTC, *In the Matter of CSGOLotto, Inc., Trevor Martin, Thomas Cassell* (case page, complaint, exhibits; settled Sept 2017, final order Nov 2017). https://www.ftc.gov/legal-library/browse/cases-proceedings/162-3184-csgolotto-trevor-martin-thomas-cassell-matter ; press release: https://www.ftc.gov/news-events/news/press-releases/2017/09/csgo-lotto-owners-settle-ftcs-first-ever-complaint-against-individual-social-media-influencers
- [P2] FTC Business Blog, "$245 million FTC settlement alleges Fortnite owner Epic Games used digital dark patterns to charge players for unwanted in-game purchases" (Dec 2022). https://www.ftc.gov/business-guidance/blog/2022/12/245-million-ftc-settlement-alleges-fortnite-owner-epic-games-used-digital-dark-patterns-charge
- [P3] UK Gambling Commission, *Virtual currencies, eSports and social casino gaming — position paper* (Mar 2017). https://www.gamblingcommission.gov.uk/licensees-and-businesses/page/offering-bets-on-esports (PDF: https://assets.ctfassets.net/j16ev64qyf6l/4A644HIpG1g2ymq11HdPOT/ca6272c45f1b2874d09eabe39515a527/Virtual-currencies-eSports-and-social-casino-gaming.pdf)
- [P4] UKGC/ABSG loot-box advice, international approaches (China odds disclosure; Belgium ban; Dutch EA case). https://www.gamblingcommission.gov.uk/guidance/lootboxes-advice-to-the-gambling-commission-from-absg/international-approaches-lootboxes-advice-to-the-gambling-commission-from
- [P5] BBC, "Video game loot boxes declared illegal under Belgium gambling laws" (Apr 2018). https://www.bbc.com/news/technology-43906306 ; Belgian Gaming Commission current position: https://vgfb.be/loot-boxes-in-belgium
- [P6] WA State Gambling Commission press release (Oct 2016): https://wsgc.wa.gov/news/2016/washington-state-gambling-commission-orders-valve-stop-skins-gambling ; WSGC *Skin Gambling* briefing (Jan 2018, incl. Eilers/Narus market charts): https://wsgc.wa.gov/sites/default/files/2023-10/Skins%20Gambling.pdf
- [P7] ACMA, "ACMA takes action against illegal 'skins' gambling site" (May 2023). https://www.acma.gov.au/articles/2023-05/acma-takes-action-against-illegal-skins-gambling-site
- [P8] DCMS, *A rapid evidence review of skins gambling* (gov.uk). https://www.gov.uk/government/publications/a-rapid-evidence-review-of-skins-gambling/a-rapid-evidence-review-of-skins-gambling
- [P9] CSGORoll rewards page (daily free cases, rakeback tiers, Skin Faucet, rank progression). https://www.csgoroll.com/rewards/free
- [P10] CSGORoll homepage (VIP Program, dedicated VIP hosts). https://www.csgoroll.com
- [P11] CSGORoll Help Center, "How do Daily Free Rewards Work?" https://intercom.help/csgoroll/en/articles/11070038-how-do-daily-free-rewards-work
- [P12] CSGORoll FAQ (provably fair). https://www.csgoroll.com/info/faq

**Academic**
- [A1] Drummond & Sauer (2018), "Video game loot boxes are psychologically akin to gambling," *Nature Human Behaviour* 2(8):530–532. doi:10.1038/s41562-018-0360-1
- [A2] Zendle, McCall, Barnett & Cairns (2019), "Paying for loot boxes is linked to problem gambling, regardless of specific features like cash-out and pay-to-win," *Computers in Human Behavior*. https://www.sciencedirect.com/science/article/abs/pii/S0747563219302468
- [A3] Zendle (2019), "Only problem gamblers spend less money when loot boxes are removed from a game," *PeerJ* 7:e7700. doi:10.7717/peerj.7700
- [A4] Li, Mills & Nower (2019), "The relationship of loot box purchases to problem video gaming and problem gambling," *Addictive Behaviors* 97:27–34 (seven structural features incl. near-misses, in-game currency, crate-and-key, exclusives).
- [A5] "Characteristics of Gamers who Purchase Loot Box: a Systematic Literature Review" (2021, PMC8264989). https://pmc.ncbi.nlm.nih.gov/articles/PMC8264989
- Corroborating: Zendle & Cairns (2018) *PLOS ONE* 13(11):e0206767 (η²=0.054); Zendle & Cairns (2019) replication *PLOS ONE* 14(3):e0213194; Zendle, Meyer & Over (2019) adolescents, *R. Soc. Open Sci.* 6:190049; Drummond, Sauer, Ferguson & Hall (2020) cross-national, *PLOS ONE* 15(3):e0230378.

**Journalism**
- [J1] GamesIndustry.biz, "EA fined €10m over loot boxes as Dutch court sides with gambling authority" (Oct 2020). https://www.gamesindustry.biz/ea-fined-10m-over-loot-boxes-as-dutch-court-sides-with-gambling-authority
- [J2] ESPN, "Valve sends cease and desists to 23 CS:GO skin betting sites" (Jul 2016). https://www.espn.com/gaming/story/_/id/17115903/valve-sends-cease-desists-23-csgo-skin-betting-sites
- [J3] BBC, "Valve ordered to tackle 'skin betting'" (Oct 2016). https://www.bbc.com/news/technology-37573818
- [J4] BBC, "Skin betting: 'Children as young as 11 introduced to gambling'" (Dec 2017). https://www.bbc.com/news/technology-42311533
- [J5] Dot Esports (OPSkins C&D, Jun 2018): https://dotesports.com/counter-strike/news/steam-cease-desist-op-skins-24550 ; PCGamesN (bot shutdown, ~$2M): https://www.pcgamesn.com/counter-strike-global-offensive/valve-shuts-down-csgo-trading-bots-opskins
- [J6] Polygon (Varga v. Twitch suit, Feb 2018): https://www.polygon.com/2018/2/19/17029530/phantomlord-twitch-banned-lawsuit-counter-strike-go ; GameChangers Law case history: https://www.gamechangerslaw.com/p/three-year-phantoml0rd-v-twitch-suit ; GamesIndustry.biz outcome: https://www.gamesindustry.biz/streamer-phantoml0rd-wins-three-year-twitch-lawsuit
- [J7] Barron's, "CS:GO Has Become a Gateway to Gambling. Millions of Teenagers Are at Risk." (2024). https://www.barrons.com/articles/counter-strike-csgo-skins-gambling-gateway-videogames-b21ceef0

**Tertiary / affiliate (flagged)**
- [T1] Wikipedia, "Skin gambling" — timeline corroboration (23+20 C&Ds, CSGODouble closure, ~$5B 2016 estimate, Valve 2023 conduct change, 40+ account bans). https://en.wikipedia.org/wiki/Skin_gambling
- [T2] Skinlords (CS2 site aggregator; rain events, promo codes, free cases, deposit bonuses). https://skinlords.com — affiliate site, low trust.

## Unverified / flagged

- **"80% of CS:GO YouTubers sponsored by skin-gambling sites"** — attributed to the Houngoungagne YouTube investigation, cited secondhand by the gov.uk rapid evidence review [P8]. Directionally consistent with Barron's 40%-of-Twitch-top-300 [P8][J7] but not independently verified.
- **Knife odds ≈0.26%** — SEO-source figure (tech-insider.org); not independently verified, omitted from entries above.
- **Steam Marketplace ~15% CS:GO cut** — widely reported but sourced here only via tertiary/secondary material; treat as approximate.
- **CSGOShuffle outcome rigging** — alleged in Twitch's countersuit against PhantomL0rd and in 2016 journalism; never adjudicated as liability (Varga won a narrow contract claim). Entry 3.3 words it as allegation.
- **Rain mechanics / $0.10 minimum wagers / wagering-requirement specifics on skin sites** — documented only via affiliate aggregator [T2] and first-party marketing pages [P9][P11]; no regulator has published a forensic description of these flows.
