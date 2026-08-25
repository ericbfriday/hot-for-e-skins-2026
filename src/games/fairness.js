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
