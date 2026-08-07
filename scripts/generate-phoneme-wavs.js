/**
 * Generate prerecorded American English phoneme WAV files (offline).
 * These are short synthesized reference tones — replace with studio
 * recordings anytime; filenames and the data object stay the same.
 *
 * Run: node scripts/generate-phoneme-wavs.js
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'audio', 'phonemes');
const SAMPLE_RATE = 22050;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeWav(filePath, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE((clamped * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

function envelope(t, dur, attack = 0.02, release = 0.06) {
  if (t < attack) return t / attack;
  if (t > dur - release) return Math.max(0, (dur - t) / release);
  return 1;
}

function tone(freq, dur, volume = 0.35) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = Math.sin(2 * Math.PI * freq * t) * volume * envelope(t, dur);
  }
  return out;
}

function formantVowel(f1, f2, dur = 0.35, volume = 0.28) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, dur, 0.03, 0.08);
    const s =
      Math.sin(2 * Math.PI * f1 * t) * 0.55 +
      Math.sin(2 * Math.PI * f2 * t) * 0.35 +
      Math.sin(2 * Math.PI * (f1 * 2) * t) * 0.1;
    out[i] = s * volume * env;
  }
  return out;
}

function noiseBurst(dur, volume = 0.22, highpass = false) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let nse = Math.random() * 2 - 1;
    if (highpass) {
      const filtered = nse - prev;
      prev = nse;
      nse = filtered;
    }
    out[i] = nse * volume * envelope(t, dur, 0.01, 0.05);
  }
  return out;
}

function plosive(freq, dur = 0.12, volume = 0.4) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 28);
    out[i] =
      (Math.sin(2 * Math.PI * freq * t) * 0.7 + (Math.random() * 2 - 1) * 0.3) *
      volume *
      env;
  }
  return out;
}

function nasal(freq, dur = 0.32, volume = 0.32) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, dur, 0.04, 0.08);
    const s =
      Math.sin(2 * Math.PI * freq * t) * 0.6 +
      Math.sin(2 * Math.PI * (freq * 2.1) * t) * 0.25 +
      Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.15;
    out[i] = s * volume * env;
  }
  return out;
}

function mix(...parts) {
  const len = Math.max(...parts.map((p) => p.length));
  const out = new Float64Array(len);
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) out[i] += part[i];
  }
  let peak = 0;
  for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 1) {
    for (let i = 0; i < len; i++) out[i] /= peak;
  }
  return out;
}

function diphthong(f1a, f2a, f1b, f2b, dur = 0.4) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const p = t / dur;
    const f1 = f1a + (f1b - f1a) * p;
    const f2 = f2a + (f2b - f2a) * p;
    const env = envelope(t, dur, 0.03, 0.08);
    out[i] =
      (Math.sin(2 * Math.PI * f1 * t) * 0.55 + Math.sin(2 * Math.PI * f2 * t) * 0.35) *
      0.28 *
      env;
  }
  return out;
}

// American English classroom phonemes (primary + alternates)
const PHONEMES = {
  // Vowels
  'a-ae': () => formantVowel(700, 1800, 0.38),      // /æ/ cat
  'a-ei': () => diphthong(500, 2100, 350, 2200),  // /eɪ/ acorn
  'e-eh': () => formantVowel(550, 1800, 0.36),     // /ɛ/ bed
  'e-ee': () => formantVowel(300, 2300, 0.36),     // /i/ me
  'i-ih': () => formantVowel(400, 2000, 0.34),     // /ɪ/ igloo
  'i-ai': () => diphthong(800, 1400, 350, 2200),  // /aɪ/ ice
  'o-ah': () => formantVowel(700, 1100, 0.36),     // /ɑ/ pot
  'o-ou': () => diphthong(500, 900, 400, 800),    // /oʊ/ go
  'u-uh': () => formantVowel(600, 1200, 0.34),     // /ʌ/ cup
  'u-yu': () => mix(tone(300, 0.08, 0.15), diphthong(300, 2200, 350, 900, 0.36)), // /ju/ unicorn

  // Consonants
  b: () => plosive(180, 0.11, 0.45),
  p: () => plosive(220, 0.1, 0.4),
  d: () => plosive(260, 0.11, 0.42),
  t: () => plosive(320, 0.1, 0.4),
  'g-g': () => plosive(140, 0.12, 0.45),
  'c-k': () => plosive(380, 0.1, 0.4),
  k: () => plosive(380, 0.1, 0.4),
  'c-s': () => noiseBurst(0.28, 0.2, true),
  f: () => noiseBurst(0.3, 0.18, true),
  v: () => mix(noiseBurst(0.28, 0.12, true), tone(160, 0.28, 0.18)),
  s: () => noiseBurst(0.32, 0.2, true),
  's-z': () => mix(noiseBurst(0.3, 0.14, true), tone(200, 0.3, 0.16)),
  z: () => mix(noiseBurst(0.3, 0.14, true), tone(200, 0.3, 0.16)),
  h: () => noiseBurst(0.22, 0.16, false),
  m: () => nasal(150, 0.34, 0.34),
  n: () => nasal(180, 0.34, 0.34),
  l: () => formantVowel(400, 1200, 0.3, 0.26),
  r: () => formantVowel(500, 1400, 0.3, 0.26),
  w: () => diphthong(300, 700, 400, 900, 0.3),
  'y-y': () => diphthong(300, 2200, 400, 1800, 0.28),
  'y-ih': () => formantVowel(400, 2000, 0.3),
  'y-ai': () => diphthong(800, 1400, 350, 2200, 0.36),
  'g-j': () => mix(plosive(220, 0.08, 0.3), noiseBurst(0.16, 0.14, true)),
  j: () => mix(plosive(220, 0.08, 0.3), noiseBurst(0.16, 0.14, true)),
  'q-kw': () => mix(plosive(380, 0.08, 0.35), diphthong(300, 700, 400, 900, 0.22)),
  'x-ks': () => mix(plosive(380, 0.08, 0.3), noiseBurst(0.2, 0.18, true))
};

ensureDir(OUT_DIR);

let count = 0;
for (const [name, make] of Object.entries(PHONEMES)) {
  const samples = make();
  const file = path.join(OUT_DIR, `${name}.wav`);
  writeWav(file, samples);
  count += 1;
  console.log('wrote', path.basename(file));
}

console.log(`Generated ${count} phoneme WAV files in ${OUT_DIR}`);
