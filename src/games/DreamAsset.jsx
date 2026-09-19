// Dreamed-asset renderer (#45) — a live SVG composition, zero image files
// (foundry spec §3: every award is synthesized deterministically from a seed).
// The renderer is a pure function of the dream's seeded art config: same seed
// → same dream, forever — which is the provenance. It must look like
// generative slop: tier-paletted gradients, an abstract weapon-ish silhouette
// (with its identical ghost re-render), splatter, a sparkle loop, and the
// watermark that is pending. Derivative of everything, provably.
import React from "react";

// Abstract weapon-ish silhouettes (index = art.chassis). Not any weapon; every
// weapon. That's the slop.
const CHASSIS = [
  // blade — long, Guarded, karambit-adjacent (the Karambit's rhyme, dreamed)
  ["M6 50 L46 38 L86 42 L114 48 L86 54 L46 58 Z", "M40 33 L49 33 L49 63 L40 63 Z"],
  // launcher — chunky, over-promised
  ["M16 34 H84 V44 H102 V52 H66 L58 66 H44 L50 52 H16 Z", "M24 38 H32 V44 H24 Z"],
  // rifle — thin, wiry, mostly barrel
  ["M8 46 H112 V50 H70 L66 58 H52 L56 50 H30 L24 60 H14 L20 50 H8 Z", "M34 50 H42 V56 H34 Z"],
];

// Object sigils (index = art.emblem): the catalog universe, dreamed down to a
// stroke. Abstract on purpose — the model did not know what these are either.
const EMBLEMS = [
  "M-4 4 V-2 M0 4 V-4 M4 4 V-2 M-5 4 H5",                 // 0 Spork (a fork, allegedly)
  "M-5 -3.5 H5 V3.5 H-5 Z M-3 -5.5 H3",                   // 1 Mom Card (the stripe)
  "M-5 3 A5 5 0 0 1 5 3 M-2 3 V5 M2 3 V5",                // 2 Retainer (the arc of youth)
  "M-3.5 -2 H3.5 V5 H-3.5 Z M1 -2 V-6 M1 -6 L4 -4",       // 3 Juice Box (with straw)
  "M-4 5 V-5 H4 V0 M4 0 V5",                              // 4 Gaming Chair (ergonomic, allegedly)
  "M-4 -4 H4 V0 A4 4 0 0 1 -4 0 Z M0 0 V4 M-3 4 H3",      // 5 Trophy (participatory)
  "M-4 2 Q-2 -1 0 2 Q2 5 4 2 M-3 -2 Q0 -6 3 -2",          // 6 Wifi Password (the waves, expired)
  "M0 2 A3 3 0 1 1 3 -1 M3 -1 L6 -4 M-1 2 A1.5 1.5 0 1 0 0.5 0.5", // 7 Fruit Roll-Up (spiral, half-eaten)
];

function starPoints(cx, cy, r) {
  // a four-point sparkle — the universal glyph of content nobody made
  return `${cx},${cy - r} ${cx + r * 0.28},${cy - r * 0.28} ${cx + r},${cy} ${cx + r * 0.28},${cy + r * 0.28} ${cx},${cy + r} ${cx - r * 0.28},${cy + r * 0.28} ${cx - r},${cy} ${cx - r * 0.28},${cy - r * 0.28}`;
}

const FALLBACK_ART = {
  tier: "#a24ae2", companions: ["#7fd4ff", "#b28dff"], chassis: 0, emblem: 0,
  flip: false, glow: 0.5, tokenSeed: 0.5, splatter: [], sparkles: [], beams: [],
};

export default function DreamAsset({ dream, width = 140, height = 105, animate = true, uid = "" }) {
  const art = dream.art || FALLBACK_ART; // legacy/hand-edited holdings still render (derivative of a default)
  const [cA, cB] = art.companions;
  const id = "dg-" + dream.receipt + "-" + uid + "-" + dream.remix;
  const chassis = CHASSIS[art.chassis % CHASSIS.length];
  const flip = art.flip ? "translate(120,0) scale(-1,1)" : "";
  return (
    <svg viewBox="0 0 120 90" width={width} height={height} style={{display:"block"}} role="img" aria-label={dream.name}>
      <defs>
        <linearGradient id={id + "-bg"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cA} />
          <stop offset="55%" stopColor={art.tier} />
          <stop offset="100%" stopColor="#120a18" />
        </linearGradient>
        <linearGradient id={id + "-beam"} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={cB} stopOpacity="0.9" />
          <stop offset="100%" stopColor={cA} stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id={id + "-glow"} cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor={art.tier} stopOpacity={String(art.glow)} />
          <stop offset="100%" stopColor={art.tier} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* the tier-paletted gradient field every generated image in 2026 lives on */}
      <rect x="0" y="0" width="120" height="90" fill={`url(#${id}-bg)`} />
      {art.beams.map((b, i) => (
        <rect key={"beam" + i} x={b.x} y={b.y} width={b.w} height="90" fill={`url(#${id}-beam)`} opacity={b.o}
          transform={`rotate(${b.rot} ${b.x + b.w / 2} 45)`} />
      ))}
      <rect x="0" y="0" width="120" height="90" fill={`url(#${id}-glow)`} />

      {/* the ghost frame: the same render, again, identically (converged early) */}
      <g transform={flip}>
        <g transform="translate(2.6,-1.8)">
          <path d={chassis[0]} fill="none" stroke={cB} strokeWidth="1" opacity="0.35" />
        </g>
        {/* the abstract weapon-ish silhouette */}
        <path d={chassis[0]} fill="#0c0a12" stroke={art.tier} strokeWidth="1.6" strokeLinejoin="round" />
        <path d={chassis[1]} fill="#0c0a12" stroke={cA} strokeWidth="1" opacity="0.9" />
        {/* the object sigil — the dream's one concession to subject matter */}
        <g transform="translate(56,46) scale(1.35)">
          <path d={EMBLEMS[art.emblem % EMBLEMS.length]} fill="none" stroke={cA} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>

      {/* splatter: derivative of everything, splashed */}
      {art.splatter.map((s, i) => (
        <circle key={"sp" + i} cx={s.x} cy={s.y} r={s.r} fill={i % 2 ? cB : art.tier} opacity={s.o} />
      ))}

      {/* the sparkle loop (subtle; the slop must shimmer) */}
      {art.sparkles.map((s, i) => (
        <polygon key={"spk" + i} points={starPoints(s.x, s.y, s.s)} fill="#ffffff"
          style={animate ? { animation: "dreamSparkle 2.4s ease-in-out infinite", animationDelay: s.delay + "s", transformOrigin: `${s.x}px ${s.y}px` } : { opacity: 0.7 }} />
      ))}

      {/* the watermark (pending) */}
      <text x="60" y="84" textAnchor="middle" fontSize="6.5" letterSpacing="2.5" fill="#ffffff" opacity="0.14"
        fontFamily="Arial,Helvetica,sans-serif" fontWeight="700" transform="rotate(-12 60 84)">WATERMARK (PENDING)</text>

      <rect x="1" y="1" width="118" height="88" fill="none" stroke={art.tier} strokeWidth="1.5" opacity="0.8" />
    </svg>
  );
}

// **The Undreamed™** — pitch-black, dead-still, on purpose: it cannot be
// generated (must be earned (cannot be earned)). No sparkle. No gradient. The
// one card the Foundry refuses to render.
export function UndreamedCard({ width = 60, height = 60, big = false }) {
  return (
    <svg viewBox="0 0 60 60" width={width} height={height} style={{display:"block"}} role="img" aria-label="THE UNDREAMED™">
      <rect x="0" y="0" width="60" height="60" fill="#000000" />
      <rect x="1.5" y="1.5" width="57" height="57" fill="none" stroke="#141414" strokeWidth="1.5" />
      <text x="30" y={big ? "27" : "26"} textAnchor="middle" fontSize={big ? "8.5" : "7.5"} fill="#3c3c3c"
        fontFamily="'Bangers',cursive" letterSpacing="1">THE UNDREAMED™</text>
      {big && (
        <>
          <text x="30" y="38" textAnchor="middle" fontSize="4.2" fill="#2a2a2a" fontFamily="Arial,Helvetica,sans-serif">
            cannot be generated
          </text>
          <text x="30" y="44" textAnchor="middle" fontSize="4.2" fill="#2a2a2a" fontFamily="Arial,Helvetica,sans-serif">
            (must be earned (cannot be earned))
          </text>
        </>
      )}
    </svg>
  );
}
