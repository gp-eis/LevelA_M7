/* ============================================================
   Athlete People — American English phoneme audio system

   - Prerecorded WAV playback only (no browser TTS / speechSynthesis)
   - Each grapheme stores IPA, example word, and audio path
   - Letters may have multiple sounds; click plays the primary (index 0)
     or a chosen alternate via playLetterPhoneme(letter, soundIndex)
   ============================================================ */

(function initPhonemeAudioBase() {
  const script = document.currentScript;
  window.PHONEME_AUDIO_BASE = script
    ? new URL('../assets/audio/phonemes/', script.src).href
    : '../assets/audio/phonemes/';
})();

/**
 * @typedef {{ ipa: string, example: string, file: string }} PhonemeSound
 * @typedef {{ grapheme: string, sounds: PhonemeSound[] }} GraphemeEntry
 */

/** @type {Record<string, GraphemeEntry>} */
window.LETTER_PHONEMES = {
  a: {
    grapheme: 'Aa',
    sounds: [
      { ipa: '/æ/', example: 'cat', file: 'a-ae.wav' },
      { ipa: '/eɪ/', example: 'acorn', file: 'a-ei.wav' }
    ]
  },
  b: {
    grapheme: 'Bb',
    sounds: [
      { ipa: '/b/', example: 'bat', file: 'b.wav' }
    ]
  },
  c: {
    grapheme: 'Cc',
    sounds: [
      { ipa: '/k/', example: 'cat', file: 'c-k.wav' },
      { ipa: '/s/', example: 'cent', file: 'c-s.wav' }
    ]
  },
  d: {
    grapheme: 'Dd',
    sounds: [
      { ipa: '/d/', example: 'dog', file: 'd.wav' }
    ]
  },
  e: {
    grapheme: 'Ee',
    sounds: [
      { ipa: '/ɛ/', example: 'bed', file: 'e-eh.wav' },
      { ipa: '/i/', example: 'me', file: 'e-ee.wav' }
    ]
  },
  f: {
    grapheme: 'Ff',
    sounds: [
      { ipa: '/f/', example: 'fan', file: 'f.wav' }
    ]
  },
  g: {
    grapheme: 'Gg',
    sounds: [
      { ipa: '/ɡ/', example: 'go', file: 'g-g.wav' },
      { ipa: '/dʒ/', example: 'gem', file: 'g-j.wav' }
    ]
  },
  h: {
    grapheme: 'Hh',
    sounds: [
      { ipa: '/h/', example: 'hat', file: 'h.wav' }
    ]
  },
  i: {
    grapheme: 'Ii',
    sounds: [
      { ipa: '/ɪ/', example: 'igloo', file: 'i-ih.wav' },
      { ipa: '/aɪ/', example: 'ice', file: 'i-ai.wav' }
    ]
  },
  j: {
    grapheme: 'Jj',
    sounds: [
      { ipa: '/dʒ/', example: 'jam', file: 'j.wav' }
    ]
  },
  k: {
    grapheme: 'Kk',
    sounds: [
      { ipa: '/k/', example: 'kite', file: 'k.wav' }
    ]
  },
  l: {
    grapheme: 'Ll',
    sounds: [
      { ipa: '/l/', example: 'leg', file: 'l.wav' }
    ]
  },
  m: {
    grapheme: 'Mm',
    sounds: [
      { ipa: '/m/', example: 'mop', file: 'm.wav' }
    ]
  },
  n: {
    grapheme: 'Nn',
    sounds: [
      { ipa: '/n/', example: 'net', file: 'n.wav' }
    ]
  },
  o: {
    grapheme: 'Oo',
    sounds: [
      { ipa: '/ɑ/', example: 'pot', file: 'o-ah.wav' },
      { ipa: '/oʊ/', example: 'go', file: 'o-ou.wav' }
    ]
  },
  p: {
    grapheme: 'Pp',
    sounds: [
      { ipa: '/p/', example: 'pen', file: 'p.wav' }
    ]
  },
  q: {
    grapheme: 'Qq',
    sounds: [
      { ipa: '/kw/', example: 'queen', file: 'q-kw.wav' }
    ]
  },
  r: {
    grapheme: 'Rr',
    sounds: [
      { ipa: '/ɹ/', example: 'run', file: 'r.wav' }
    ]
  },
  s: {
    grapheme: 'Ss',
    sounds: [
      { ipa: '/s/', example: 'sun', file: 's.wav' },
      { ipa: '/z/', example: 'bugs', file: 's-z.wav' }
    ]
  },
  t: {
    grapheme: 'Tt',
    sounds: [
      { ipa: '/t/', example: 'top', file: 't.wav' }
    ]
  },
  u: {
    grapheme: 'Uu',
    sounds: [
      { ipa: '/ʌ/', example: 'cup', file: 'u-uh.wav' },
      { ipa: '/ju/', example: 'unicorn', file: 'u-yu.wav' }
    ]
  },
  v: {
    grapheme: 'Vv',
    sounds: [
      { ipa: '/v/', example: 'van', file: 'v.wav' }
    ]
  },
  w: {
    grapheme: 'Ww',
    sounds: [
      { ipa: '/w/', example: 'water', file: 'w.wav' }
    ]
  },
  x: {
    grapheme: 'Xx',
    sounds: [
      { ipa: '/ks/', example: 'box', file: 'x-ks.wav' }
    ]
  },
  y: {
    grapheme: 'Yy',
    sounds: [
      { ipa: '/j/', example: 'yellow', file: 'y-y.wav' },
      { ipa: '/ɪ/', example: 'gym', file: 'y-ih.wav' },
      { ipa: '/aɪ/', example: 'sky', file: 'y-ai.wav' }
    ]
  },
  z: {
    grapheme: 'Zz',
    sounds: [
      { ipa: '/z/', example: 'zoo', file: 'z.wav' }
    ]
  }
};

window._phonemeAudio = null;
window._phonemeToken = 0;

function resolvePhonemeUrl(fileName) {
  return new URL(fileName, window.PHONEME_AUDIO_BASE).href;
}

function getLetterPhonemeEntry(letter) {
  if (!letter) return null;
  return window.LETTER_PHONEMES[String(letter).toLowerCase()] || null;
}

function getLetterPhonemeSound(letter, soundIndex = 0) {
  const entry = getLetterPhonemeEntry(letter);
  if (!entry || !entry.sounds.length) return null;
  const index = Math.max(0, Math.min(soundIndex, entry.sounds.length - 1));
  return entry.sounds[index];
}

/**
 * Immediately play the grapheme's assigned audio file.
 * @param {string} letter - grapheme (e.g. "M" or "m")
 * @param {number} [soundIndex=0] - which sound to play when multiple exist
 */
window.playLetterPhoneme = function playLetterPhoneme(letter, soundIndex = 0) {
  const sound = getLetterPhonemeSound(letter, soundIndex);
  if (!sound) return;

  const token = ++window._phonemeToken;

  if (window._phonemeAudio) {
    window._phonemeAudio.pause();
    window._phonemeAudio.currentTime = 0;
    window._phonemeAudio = null;
  }

  const audio = new Audio(resolvePhonemeUrl(sound.file));
  window._phonemeAudio = audio;

  audio.addEventListener('ended', () => {
    if (token === window._phonemeToken) window._phonemeAudio = null;
  });

  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      if (token === window._phonemeToken) {
        console.warn(`Phoneme audio missing or blocked: ${sound.file} (${sound.ipa} as in ${sound.example})`);
      }
    });
  }
};

/** Play every sound for a letter once, in order (useful for multi-sound letters). */
window.playAllLetterPhonemes = function playAllLetterPhonemes(letter) {
  const entry = getLetterPhonemeEntry(letter);
  if (!entry) return;

  let i = 0;
  const playNext = () => {
    if (i >= entry.sounds.length) return;
    playLetterPhoneme(letter, i);
    const audio = window._phonemeAudio;
    i += 1;
    if (!audio) return;
    audio.addEventListener('ended', playNext, { once: true });
  };
  playNext();
};
