# Skin Art Prompts — HOT FOR E-SKINS 2026

Image-generation briefs for every item shown on the page. The app currently renders
`item render pending` placeholders in the Marketplace Catalog (`src/App.jsx`) — these
images replace those, and are reused by the roulette strip tiles.

## Global art direction (the vibe)

The site is a CS:GO skin-gambling parody: dark roasted-brown/orange casino grime
(`#160805` → `#3a1206` backgrounds, `#ff5a14`/`#ffb347` accents), comic-book Bangers
energy, and the core joke that **mundane household garbage is presented as ultra-rare
tactical loot**. Every image should look like a premium "inspect view" weapon-skin
render from a AAA marketplace, except the item is trash. Deadpan luxury, not cartoonish.

**Prepend this style block to every skin prompt:**

> Hyper-detailed 3D product render in the style of a CS2 weapon-skin inspect view,
> single hero object centered on a dark burnt-amber gradient background
> (#241005 to #0e0a06), dramatic warm key light from upper left, cool subtle fill,
> glossy specular highlights, soft floor reflection, faint dust motes, game-marketplace
> promo render quality, octane render, 8k.

**Negative prompt (all skins):**

> text, lettering, logos, watermark, ui, human hands, people, clutter, busy background,
> multiple objects, flat clipart, blurry, low detail

**Rarity glow** — each render gets a soft under-glow / rim light in its rarity color
(from `RARITY_COLORS` in `src/App.jsx`):

| Rarity | Hex |
|---|---|
| Covert Extravagance | `#ff4444` red |
| Contraband Liability | `#e0a800` gold |
| Classified Overdraft | `#a24ae2` purple |
| Mil-Spec Regret | `#4a90e2` blue |
| Industrial Denial | `#4aa8c9` teal |
| Consumer Grade Trash | `#8a8a8a` gray |

---

## The 10 catalog skins

### skin_01 — Tactical Plastic Spork | Minimal Debt
Covert Extravagance (red glow) · StatTrak™ Unpaid Chores: 47 · $1,420.69

> A single white plastic spork, battle-worn with micro-scratches and cafeteria
> patina, presented like a legendary knife skin: floating at a heroic 3/4 angle,
> red (#ff4444) rim light and soft red under-glow, tiny carbon-fiber texture on the
> handle, one tine slightly bent, faint holographic sheen along the edge, red glow

### skin_02 — Default Cardboard Box | Battle-Scarred
Consumer Grade Trash (gray glow) · $0.02

> A plain drab cardboard box, crushed corners and peeling packing tape, rendered
> like the most boring default item skin in a shooter game: dead-center hero shot,
> flat gray (#8a8a8a) lifeless lighting, visible cardboard fiber texture, water
> stain on one side, no decoration whatsoever, gray under-glow

### skin_03 — AWP | Mom's Visa Signature Edition
Contraband Liability (gold glow) · StatTrak™ Chargebacks Pending: 3 · $8,500.00

> A glossy AWP sniper rifle skin pattern-printed like a premium gold credit card:
> deep navy metal with gold (#e0a800) foil filigree, embossed card-number-style
> rectangles along the stock, chip-and-PIN square near the scope mount, sparkly
> metallic flake clearcoat, heroic side profile floating on dark gradient, gold
> under-glow. No readable digits or text.

### skin_04 — Rubber Band Ball | Field-Tested Anxiety
Mil-Spec Regret (blue glow) · $0.11

> A chaotic ball of hundreds of tan and pale-blue rubber bands, slightly lopsided,
> a few bands snapped and dangling, rendered like a mil-spec grenade in a promo
> shot: dramatic blue (#4a90e2) rim light, individual band texture with stress
> cracks, blue under-glow

### skin_05 — Juice Box Straw | Minor Frustration
Industrial Denial (teal glow) · StatTrak™ Times Bent: 12 · $3.40

> A single bright juice-box drinking straw with an accordion bend joint, bent at a
> permanent 90-degree angle, macro product render like a damaged legendary blade:
> teal (#4aa8c9) rim light, glossy plastic wrapper seam visible, crimp at the cut
> end slightly crushed, teal under-glow

### skin_06 — Dad's Old Gaming Chair | Ergonomic Betrayal
Classified Overdraft (purple glow) · $210.00

> A worn black-and-red racing-style office gaming chair from 2014, cracked
> polyurethane peeling on the armrests, compressed seat foam, one caster wheel
> missing, leaning slightly, rendered like a legendary vehicle skin promo: purple
> (#a24ae2) rim light through the mesh backrest, purple under-glow

### skin_07 — Participation Trophy | Gold Foil Wounded Pride
Mil-Spec Regret (blue glow) · StatTrak™ Self-Esteem Lost: 89% · $16.00

> A small cheap golden participation trophy with a fake-marble plastic base, gold
> foil peeling off one side, slightly dented cup, tragic yet proud, rendered like
> an epic award reveal: blue (#4a90e2) rim light, blue under-glow, faint dust

### skin_08 — Retainer Case | Empty (Lost Retainer Not Included)
Consumer Grade Trash (gray glow) · $0.75

> An open small translucent mint-green orthodontic retainer case, completely empty
> inside, one hinge cracked, rendered like rare loot on dark velvet: cold gray
> (#8a8a8a) clinical lighting, plastic seam texture, sad emptiness emphasized by
> interior shadow, gray under-glow

### skin_09 — School WiFi Password | Expired Access
Classified Overdraft (purple glow) · StatTrak™ Blocked Sites Bypassed: 6 · $4,000.00

> A crumpled sticky note with illegible scribbled marks, glowing like a forbidden
> classified document: holographic purple (#a24ae2) light leaking from the paper
> edges, scan-lines and glitch artifacts over the writing, floating over a dark
> terminal-like void, purple under-glow. Writing must be unreadable scribbles, no
> real characters.

### skin_10 — Half-Eaten Fruit Roll-Up | Sticky Legendary
Covert Extravagance (red glow) · $999.99

> A partially unrolled shiny red fruit snack snack-wrap with one bite taken out of
> the exposed end, preserved like a museum-grade artifact: red (#ff4444) rim light,
> glossy cellophane wrapper reflecting light, glistening bite mark, red under-glow

---

## Bonus: the 4 crate-award "prizes"

These are the joke items from `openCrate()` — they must look like the cheapest
possible royalty-free stock imagery. **Opposite of the skin style**: flat lighting,
generic, slightly washed out. 4:3 ratio to sell the 2009-stock-photo vibe.

- **award_handshake.jpg** — Generic stock photo of a business handshake between two
  suits in a bright office, forced smiles, flat lighting, overexposed window
  background, 2009 royalty-free stock photo aesthetic
- **award_sunset.jpg** — Royalty-free stock photo of a sunset over a calm lake,
  lens flare, oversaturated orange, slightly overexposed water reflections
- **award_trophy.png** — 2000s-era clip-art style cartoon trophy, thick black
  outline, flat gold gradient fill, star icon on the cup, white background
- **award_businessman.jpg** — Stock photo of a confused businessman shrugging in
  a suit, isolated on a plain white studio background, awkward pose, flat catalog
  lighting

---

## Output specs

**Skins (skin_01–skin_10):**

- **Size:** 1024×1024 (square, 1:1) master renders
- **Export for app:** 512×512 WebP (quality ~80) or PNG if alpha needed — card
  image well is full-width × 70px tall and roulette tiles are 96px, so 512px covers
  both with `srcset` headroom; the dark gradient background in the render matches
  the card backgrounds, so no transparency required
- **Filenames:** `src/assets/skins/skin_01.webp` … `skin_10.webp` (matches catalog ids)
- **Format:** sRGB, no alpha channel needed; if your generator outputs transparent
  PNGs, composite onto `#160a04` before export for consistency

**Crate awards:**

- **Size:** 640×480 (4:3, deliberately low-res)
- **Format:** JPEG quality ~70 (slight compression artifacts are part of the joke)
- **Filenames:** `src/assets/skins/award_handshake.jpg`, `award_sunset.jpg`,
  `award_trophy.jpg`, `award_businessman.jpg`

**Consistency rules for all skin renders:**

- Same camera: 3/4 hero angle, object fills ~70–80% of frame, centered
- Same lighting: warm key upper-left, rarity-color rim/under-glow
- One object per image, no props, no people, no readable text
- Batch tips: generate all 10 in one session/conversation and include the style
  block verbatim each time so lighting and render style stay uniform
