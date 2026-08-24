// Session-pinned ambient names — identity §9's generateTag(), pinned per archetype
// so the same faces keep posting (live-chat.md §2: "pinned per session so personas feel continuous").
import { generateTag } from "../spine/identity.js";
import { ARCHETYPES, ARCHETYPE_TOTAL_WEIGHT, WHALE_NAME } from "./constants.js";

const POOL_SIZE = 4;

export function createPersonaSession() {
  const pins = {};
  const recent = [];
  function noteRecent(name) {
    recent.unshift(name);
    if (recent.length > 12) recent.length = 12;
  }
  function nameFor(archetypeKey) {
    if (!pins[archetypeKey]) pins[archetypeKey] = [];
    const pool = pins[archetypeKey];
    if (pool.length < POOL_SIZE) {
      const tag = generateTag({ avoid: [...recent, ...Object.values(pins).flat()] });
      pool.push(tag);
      noteRecent(tag);
      return tag;
    }
    const name = pool[Math.floor(Math.random() * pool.length)];
    noteRecent(name);
    return name;
  }
  function anyName() {
    return nameFor(pickArchetype().key);
  }
  return { nameFor, anyName };
}

export function pickArchetype() {
  const roll = Math.random() * ARCHETYPE_TOTAL_WEIGHT;
  let acc = 0;
  for (const a of ARCHETYPES) {
    acc += a.weight;
    if (roll < acc) return a;
  }
  return { key: "whale", weight: 5, color: "#e8c9ac", deck: [], isWhale: true, name: WHALE_NAME };
}

export function pickLine(archetype) {
  if (!archetype.deck || archetype.deck.length === 0) return null;
  return archetype.deck[Math.floor(Math.random() * archetype.deck.length)];
}
