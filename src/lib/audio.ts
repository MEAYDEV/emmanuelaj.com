/**
 * Synthesized sound design — no audio assets needed.
 * Everything is generated with the Web Audio API and kept subtle.
 */

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Short soft UI tick for prompts, selections, page flips. */
export function tick(pitch = 720) {
  const c = ensureCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(pitch, t);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.45, t + 0.07);
  filter.type = "lowpass";
  filter.frequency.value = 2400;
  gain.gain.setValueAtTime(0.055, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  osc.connect(filter).connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** Airy whoosh for camera moves and the front door. */
export function whoosh() {
  const c = ensureCtx();
  if (!c) return;
  const t = c.currentTime;
  const dur = 0.55;
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.1;
  filter.frequency.setValueAtTime(220, t);
  filter.frequency.exponentialRampToValueAtTime(950, t + dur * 0.5);
  filter.frequency.exponentialRampToValueAtTime(260, t + dur);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
}

let crackleSrc: AudioBufferSourceNode | null = null;
let crackleGain: GainNode | null = null;

/** Looping vinyl surface noise layered under the beats. */
export function startCrackle() {
  const c = ensureCtx();
  if (!c || crackleSrc) return;
  const dur = 3;
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buffer.getChannelData(0);
  // faint hiss
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.012;
  // sparse pops
  for (let p = 0; p < 42; p++) {
    const at = Math.floor(Math.random() * (data.length - 80));
    const amp = 0.08 + Math.random() * 0.14;
    for (let j = 0; j < 60; j++) {
      data[at + j] += (Math.random() * 2 - 1) * amp * (1 - j / 60);
    }
  }
  crackleSrc = c.createBufferSource();
  crackleSrc.buffer = buffer;
  crackleSrc.loop = true;
  crackleGain = c.createGain();
  crackleGain.gain.value = 0.16;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 900;
  crackleSrc.connect(filter).connect(crackleGain).connect(c.destination);
  crackleSrc.start();
}

export function stopCrackle() {
  try {
    crackleSrc?.stop();
  } catch {
    /* already stopped */
  }
  crackleSrc = null;
  crackleGain = null;
}
