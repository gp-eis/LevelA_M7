/* ============================================================
   Athlete People — shared JavaScript
   Sound toggle, dialogue buttons (audio/video hooks), and toasts
   ============================================================ */

/* ---------- Button sounds (generated with Web Audio) ---------- */

let audioContext;
let soundEnabled = localStorage.getItem('athletePeopleSound') !== 'off';

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
  }

  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(frequency, duration, volume, type = 'sine', delay = 0) {
  if (!soundEnabled) return;

  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

function playClickSound() {
  playTone(650, 0.11, 0.08, 'triangle');
  playTone(940, 0.12, 0.05, 'sine', 0.045);
}

function updateSoundButton() {
  const button = document.getElementById('sound-toggle');
  if (!button) return;

  button.textContent = soundEnabled ? '🔊 Clicks On' : '🔇 Clicks Off';
  button.setAttribute('aria-pressed', String(soundEnabled));
  button.setAttribute('aria-label', soundEnabled ? 'Turn click sounds off' : 'Turn click sounds on');
}

function toggleSound() {
  if (soundEnabled) {
    playClickSound();
    soundEnabled = false;
  } else {
    soundEnabled = true;
    playClickSound();
  }

  localStorage.setItem('athletePeopleSound', soundEnabled ? 'on' : 'off');
  updateSoundButton();

  if (!soundEnabled && audioContext) {
    window.setTimeout(() => audioContext.suspend(), 180);
  }
}

function setupSiteSounds() {
  const soundButton = document.createElement('button');
  soundButton.id = 'sound-toggle';
  soundButton.type = 'button';
  soundButton.addEventListener('click', toggleSound);
  document.body.appendChild(soundButton);
  updateSoundButton();

  document.querySelectorAll('button, a, [role="button"]').forEach((element) => {
    if (element !== soundButton) element.addEventListener('click', playClickSound);
  });

  const unlockSound = () => {
    getAudioContext();
    document.removeEventListener('pointerdown', unlockSound);
    document.removeEventListener('keydown', unlockSound);
  };

  document.addEventListener('pointerdown', unlockSound, { once: true });
  document.addEventListener('keydown', unlockSound, { once: true });
}

/**
 * Show a friendly popup message at the bottom of the screen.
 */
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  // Force reflow so re-triggering the animation works
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/**
 * Dialogue buttons.
 *
 * Any button with [data-dialogue] becomes a dialogue trigger.
 * Later, point it at your media with data attributes:
 *
 *   <button data-dialogue data-audio="../assets/audio/page1-line1.mp3">...</button>
 *   <button data-dialogue data-video="../assets/video/week-1/page1-3d.mp4">...</button>
 *
 * - data-audio : plays the audio file
 * - data-video : plays the file in the <video id="dialogue-video"> element (if present)
 * - neither    : shows a "coming soon" toast so buttons work from day one
 */
function setupDialogueButtons() {
  document.querySelectorAll('[data-dialogue]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const audioSrc = btn.dataset.audio;
      const videoSrc = btn.dataset.video;

      if (audioSrc) {
        const audio = new Audio(audioSrc);
        audio.play().catch(() => showToast('🔊 Audio file not found yet!'));
        return;
      }

      if (videoSrc) {
        const video = document.getElementById('dialogue-video');
        if (video) {
          if (video.getAttribute('src') !== videoSrc) video.src = videoSrc;
          video.hidden = false;
          video.scrollIntoView({ behavior: 'smooth', block: 'center' });
          video.play().catch(() => showToast('🎬 Video file not found yet!'));
        } else {
          showToast('🎬 Add a <video id="dialogue-video"> element to this page!');
        }
        return;
      }

      showToast('🔊 ' + (btn.dataset.line || 'Audio coming soon!'));
    });
  });
}

/**
 * Resolve assets/ relative to this page from the main.js script path.
 * Root pages: assets/… · one level down: ../assets/… · two levels: ../../assets/…
 */
function getAssetsBase() {
  const script = document.querySelector('script[src*="main.js"]');
  if (!script) return 'assets/';
  return script.getAttribute('src').replace(/js\/main\.js(?:\?.*)?$/, 'assets/');
}

/**
 * Center the GIIIP EIS logo at the top of every page.
 */
function setupSiteLogo() {
  if (document.querySelector('.site-logo-bar')) return;

  const bar = document.createElement('div');
  bar.className = 'site-logo-bar';
  bar.setAttribute('aria-hidden', 'false');

  const img = document.createElement('img');
  img.src = getAssetsBase() + 'images/ui/giiip-eis-logo.png';
  img.alt = 'GIIIP EIS logo';
  img.width = 118;
  img.height = 118;
  img.decoding = 'async';

  bar.appendChild(img);
  document.body.prepend(bar);
  document.body.classList.add('has-site-logo');
}

/* ---------- Week unlocks (add week numbers here when materials are ready) ---------- */
const OPEN_WEEKS = [1];

function isWeekOpen(week) {
  return OPEN_WEEKS.includes(Number(week));
}

/** Block direct links to closed literacy / games / reading weeks. */
function guardClosedWeeks() {
  const path = window.location.pathname.replace(/\\/g, '/');

  const lessonMatch = path.match(/\/lessons\/page-0([2-4])\.html$/i);
  if (lessonMatch && !isWeekOpen(lessonMatch[1])) {
    window.location.replace('index.html');
    return true;
  }

  const gamesMatch = path.match(/\/games\/week-([2-4])\//i);
  if (gamesMatch && !isWeekOpen(gamesMatch[1])) {
    window.location.replace('../index.html');
    return true;
  }

  const readingMatch = path.match(/\/reading\/week-([2-4])\.html$/i);
  if (readingMatch && !isWeekOpen(readingMatch[1])) {
    window.location.replace('index.html');
    return true;
  }

  return false;
}

/** Dim locked week cards/buttons on hubs; toast on click. */
function setupLockedWeekCards() {
  document.querySelectorAll('.week-card[data-week], .week-pick-btn[data-week]').forEach((el) => {
    const week = Number(el.dataset.week);
    if (!week || isWeekOpen(week)) return;

    el.classList.add('is-locked');
    el.setAttribute('aria-disabled', 'true');
    if (el.tagName === 'A') {
      el.removeAttribute('href');
      el.setAttribute('role', 'link');
      el.tabIndex = 0;
    }

    const hint = el.querySelector('.week-card__hint, .week-pick-btn__hint');
    if (hint) hint.textContent = 'Coming soon';

    const block = (event) => {
      event.preventDefault();
      event.stopPropagation();
      showToast('🔒 Week ' + week + ' opens when the materials are ready!');
    };
    el.addEventListener('click', block, true);
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') block(event);
    }, true);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (guardClosedWeeks()) return;
  setupSiteLogo();
  setupSiteSounds();
  setupDialogueButtons();
  setupLockedWeekCards();
});
