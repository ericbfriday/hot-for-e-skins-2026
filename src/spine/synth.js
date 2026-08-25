// House Band synthesis primitives (audio-gags §1: synthesis only — no audio
// files, no assets, no downloads; "the band is a function"). Every helper
// builds a short fire-and-forget WebAudio graph onto a destination node at an
// absolute AudioContext time and returns a {stop()} handle for killAll().
// None of these know about the queue, priorities, or the mute contract.

let noiseBuf = null;

export function noiseBuffer(ctx) {
  if (noiseBuf) return noiseBuf;
  const len = Math.floor(ctx.sampleRate * 1.4);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseBuf = buf;
  return buf;
}

function tailTime(o) {
  return (o.attack ?? 0.008) + (o.hold || 0) + (o.decay ?? o.dur ?? 0.3) + 0.1;
}

function stopHandle(ctx, gainNode, sources, endTime) {
  return {
    endsAt: endTime,
    stop(at) {
      const when = Math.max(at ?? ctx.currentTime, ctx.currentTime);
      try {
        gainNode.gain.cancelScheduledValues(when);
        gainNode.gain.setTargetAtTime(0.0001, when, 0.012);
      } catch (e) { /* already detached */ }
      for (const src of sources) {
        try { src.stop(when + 0.06); } catch (e2) { /* already stopped */ }
      }
    },
  };
}

// One oscillator with a full envelope. f1 (optional) glides exponentially —
// the gliss, the deflate, the whump and the theremin are all this one knob.
export function tone(ctx, dest, o) {
  const t = o.t ?? ctx.currentTime;
  const dur = o.decay ?? o.dur ?? 0.3;
  const attack = o.attack ?? 0.008;
  const osc = ctx.createOscillator();
  osc.type = o.type || "sine";
  const f0 = Math.max(1, o.f0 || 220);
  osc.frequency.setValueAtTime(f0, t);
  if (o.f1 !== undefined && o.f1 !== o.f0) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t + (o.glide ?? dur));
  }
  const g = ctx.createGain();
  const gain = o.gain ?? 0.1;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  if (o.hold) g.gain.setValueAtTime(gain, t + attack + o.hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + (o.hold || 0) + dur);

  const sources = [osc];
  if (o.vibratoHz) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = o.vibratoHz;
    const lg = ctx.createGain();
    lg.gain.value = o.vibratoDepth || 4;
    lfo.connect(lg);
    lg.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + tailTime(o));
    sources.push(lfo);
  }
  if (o.tremoloHz) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = o.tremoloHz;
    const lg = ctx.createGain();
    const depth = (o.tremoloDepth || 0.5) * gain;
    lg.gain.setValueAtTime(0.0001, t); // ramp depth in with the envelope (no pre-attack bleed)
    lg.gain.linearRampToValueAtTime(depth, t + Math.max(attack, 0.12));
    lfo.connect(lg);
    lg.connect(g.gain);
    lfo.start(t);
    lfo.stop(t + tailTime(o));
    sources.push(lfo);
  }

  osc.connect(g);
  if (o.lp || o.bp || o.hp) {
    const f = ctx.createBiquadFilter();
    f.type = o.bp ? "bandpass" : o.hp ? "highpass" : "lowpass";
    f.frequency.setValueAtTime(o.bp || o.lp || o.hp || 1000, t);
    if (o.filterSweepTo) f.frequency.exponentialRampToValueAtTime(Math.max(1, o.filterSweepTo), t + (o.glide ?? dur));
    f.Q.value = o.q || 1;
    g.connect(f);
    f.connect(dest);
  } else {
    g.connect(dest);
  }
  osc.start(t);
  osc.stop(t + tailTime(o));
  return stopHandle(ctx, g, sources, t + tailTime(o));
}

// Filtered white noise — the tick, the crowd, the thunder, the breath.
export function noise(ctx, dest, o) {
  const t = o.t ?? ctx.currentTime;
  const dur = o.decay ?? o.dur ?? 0.4;
  const attack = o.attack ?? 0.01;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = !!o.loop;
  if (o.rate) src.playbackRate.value = o.rate;
  const g = ctx.createGain();
  const gain = o.gain ?? 0.08;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  if (o.hold) g.gain.setValueAtTime(gain, t + attack + o.hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + (o.hold || 0) + dur);
  src.connect(g);
  const f = ctx.createBiquadFilter();
  f.type = o.bp ? "bandpass" : o.hp ? "highpass" : "lowpass";
  f.frequency.setValueAtTime(o.bp || o.hp || o.lp || 1200, t);
  if (o.filterSweepTo) f.frequency.exponentialRampToValueAtTime(Math.max(1, o.filterSweepTo), t + (o.glide ?? dur));
  f.Q.value = o.q || 1;
  g.connect(f);
  f.connect(dest);
  src.start(t);
  src.stop(t + tailTime(o));
  return stopHandle(ctx, g, [src], t + tailTime(o));
}

// Plucked note — music box / bell / harp / pluck voices. A sine plus two
// inharmonic decaying partials is the whole instrument (§4's loops).
export function pluck(ctx, dest, o) {
  const t = o.t ?? ctx.currentTime;
  const base = o.freq || 440;
  const gain = o.gain ?? 0.08;
  const dur = o.dur ?? 0.9;
  const partials = o.partials || [1, 2.76, 5.4];
  const weights = o.weights || [1, 0.4, 0.18];
  const handles = [];
  for (let i = 0; i < partials.length; i++) {
    if (!weights[i]) continue;
    handles.push(tone(ctx, dest, {
      t, type: "sine",
      f0: base * partials[i],
      gain: gain * weights[i],
      decay: dur / (1 + i * 0.7),
      attack: 0.004,
    }));
  }
  return {
    endsAt: t + dur + 0.1,
    stop(at) { for (const h of handles) h.stop(at); },
  };
}

// A tiny click/transient — stamps, ticks, gavels, the mute's one last click.
export function click(ctx, dest, o) {
  const t = o.t ?? ctx.currentTime;
  const handles = [
    noise(ctx, dest, { t, gain: (o.gain ?? 0.12) * 0.8, decay: 0.02, attack: 0.001, hp: o.hp || 2500 }),
    tone(ctx, dest, { t, f0: o.f0 || 1600, f1: (o.f0 || 1600) * 0.6, gain: (o.gain ?? 0.12) * 0.5, decay: 0.03, attack: 0.001 }),
  ];
  return { endsAt: t + 0.08, stop(at) { for (const h of handles) h.stop(at); } };
}
