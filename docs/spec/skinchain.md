# Spec: SkinChain™ — the on-chain explorer

Decision-complete resolution of [#39 (Spec: SkinChain™ explorer)](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/39) on the [2026 map](https://github.com/ericbfriday/hot-for-e-skins-2026/issues/33). The relaunch put everything "on-chain": the chain is pending (§6.1), and now you can watch it not confirm, in real time, from an explorer.

Parody targets (ai-trends-2026): §8 on-chain everything, §1 GPT-washing (the badge does nothing), §7 fee-sandwiching (the gas station). Small surface, receipt-grade.

---

## 1. Entry points ("View on SkinChain™")

A dim link-icon, always 4pt-adjacent, on:

1. **Every escrow card** (marketplace sale proceeds) — the canonical entry.
2. **Every withdrawal attempt** (the Pending Withdrawals block).
3. **Market settlement receipts** (sold / instant-sold / rollback lines).
4. **The Utilitarian Fund panel** (Moral Express) — links to the Fund's "contract" instead of a tx.

The link label: `⧉ View on SkinChain™` with hover fine print *(explorers are a courtesy; the chain is a courtesy; courtesy is pending (§6.1))*.

## 2. The explorer modal

Chrome: a sober block-explorer layout — search bar (accepts anything; every query resolves to the same pending state), network badge **SKINCHAIN MAINNET (est.)**, latest block chip.

- **Latest block: 0.** Tooltip: "genesis was 847 days ago; no blocks since; the chain is contemplative."
- **The transaction view** (per receipt):
  - `Tx hash:` FNV-1a hex of the receipt's stable id (the Provably Fair™ stand-in family — deterministic, so the same receipt always explores to the same hash)
  - `Block: 0 (awaiting block 1)` — `Block 1 ETA: mood-dependent`
  - `Confirmations: 0 / 12` with a 12-dot row where dot 1 flickers occasionally ("almost")
  - `From: you (est.)` · `To: ESCROW (verified (self))`
  - `Value: {n} BB (chain-native)` · `Fee: 21,000 Grief`
  - `Status: PENDING (§6.1)` — the only status; there are no other statuses
- **The mempool view** (below the tx): "pending transactions: 847" and **your position: 848 of 848**. Every ~4s, 2–5 other transactions visually confirm and cut in line; the list reshuffles; yours recomputes to 848 of 848. Caption: "position improving (est.)".
- **The VERIFY button:** pressing it runs a 1.2s "verification scan" (progress bar labeled `verifying (optimistically)`) and resolves: `Verification pending (§6.1). Estimated completion: block 1.` Repeat presses are free and identical.
- **The gas station** (footer): `3 Grief (slow) · 21 Grief (house) · 847 Grief (urgent (est.))`. Tipping 847 Grief toasts "tip received; gratitude generated; memo pending" and changes nothing — your position remains 848 ("the mempool respects no one (§5.3)").
- **The Utilitarian Fund contract view:** `Contract: 0x847…847` · `Balance: {n} BB of best intentions (est. $0.00)` · `Verified: yes (by us)` · read-only functions rendered as buttons that all return `pending()`.

## 3. Rules (the chain's physics)

- The chain never confirms anything, mints any block, or moves any value. It is a viewer for a pending that predates the viewer (ai-trends-2026 §8).
- One explorer modal on the site at a time; it is dismissable and interruptible (no provider entry — it's a receipt, not a ceremony).
- The explorer never appears during MOM'S HOME (the disguise hides everything, canon).
- No fees in BB are ever charged by the explorer itself — the Grief is denominated in Grief, which you cannot acquire, spend, or hold. (The tip button is decorative; pressing it is free; the toast is the product.)

## 4. Ticker & chat lines (additions to the pools)

Ticker:
- "{n} viewed their transaction on SkinChain™ (it was still there (pending))"
- "block 1 remains mood-dependent (day 847)"
- "{n} tipped 847 Grief (gratitude generated; position unchanged)"

Chat:
- `{user:"gasgrief_ooo", msg:"i've been 848 of 848 for an hour. she's contemplative"}`
- `{user:"DEPOSITOR.ai", msg:"Analysis: the chain is pending (§6.1). Pending is a stable state. Your patience is compounding (est.)."}`
- `{user:"MOD_Chad_Official", msg:"the chain is SO close to block 1 guys!! (day 847)"}`

## 5. State (client-side only)

localStorage: `hfes_skinchain` — `{views, tips, verifies}` (counters for the ticker lines and one StatTrak™ field: **chain checks**; milestone leak at 50: "{tag} has checked the chain {n} times (it did not move)").

## Open questions sharpened by this spec

- Whether the FNV-1a family gets a shared `hash32()` helper in the fairness module or the explorer mints its own — implementation detail, ruled at build (prefer the shared helper; one hash family, one home).
- §6.3 clause copy (ToS mint) — integration-2026.
