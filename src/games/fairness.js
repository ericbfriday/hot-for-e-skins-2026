// Provably Fair(tm) theater helper.
//
// The spec (allowance-roulette.md §7, skin-coinflip.md §9) calls for
// "first 12 hex of sha256(preimage)" commitments. Real SHA-256 needs
// SubtleCrypto, which is async and would force the whole spin/flip flow
// through a promise chain just for cosmetic hex digits nobody reads.
// Since the joke is "the fairness is provable, the proving is pending" —
// the theater only needs digits that look load-bearing and are
// deterministic per input — this is a synchronous FNV-1a-derived digest,
// not real SHA-256. Noted as a deviation in the resolution comment.
export function pseudoHash12(str) {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 = (h2 ^ c) + ((h2 << 1) + (h2 << 4) + (h2 << 7) + (h2 << 8) + (h2 << 24));
    h2 |= 0;
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return (hex1 + hex2).slice(0, 12);
}

// #44 SkinChain™ (integration-2026 §10.10): the same FNV-1a family's wide and
// scalar lanes, additive. One hash family, one home — the explorer, dream
// prompt receipts, and Provably Fair™ all call this module; nobody mints a
// second family.
//
// pseudoHash16: the two-lane core at full width — tx-hash-shaped hex. The
// explorer derives every transaction hash with it (same receipt id → same
// hash, forever, which is the closest thing to consensus this chain has).
export function pseudoHash16(str) {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 = (h2 ^ c) + ((h2 << 1) + (h2 << 4) + (h2 << 7) + (h2 << 8) + (h2 << 24));
    h2 |= 0;
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return hex1 + hex2;
}

// fnv1a: the plain 32-bit FNV-1a lane (the h1 above, alone) as an unsigned
// int — the deterministic pseudo-randomness source for surfaces that need
// stable-by-input rolls (the explorer's mempool entrants) without a second
// hash family or a seeded PRNG of their own.
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
