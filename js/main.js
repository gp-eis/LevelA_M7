/* ============================================================
   Athlete People — shared JavaScript
   Sound toggle, dialogue buttons (audio/video hooks), and toasts
   ============================================================ */

/* ---------- Button sounds (generated with Web Audio) ---------- */

let audioContext;
// Button feedback is always enabled throughout the children's activities.
let soundEnabled = true;

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
  if (!soundEnabled) return;

  const context = getAudioContext();
  if (!context) return;

  // Some browsers resume Web Audio asynchronously after the first interaction.
  if (context.state !== 'running') {
    context.resume().then(playClickSound).catch(() => {});
    return;
  }

  const start = context.currentTime;
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(1.05, start);
  masterGain.connect(context.destination);

  // A lively cartoon "boing-pop" followed by a quick xylophone flourish.
  const pop = context.createOscillator();
  const popGain = context.createGain();
  pop.type = 'sine';
  pop.frequency.setValueAtTime(260, start);
  pop.frequency.exponentialRampToValueAtTime(680, start + 0.065);
  pop.frequency.exponentialRampToValueAtTime(520, start + 0.105);
  popGain.gain.setValueAtTime(0.0001, start);
  popGain.gain.exponentialRampToValueAtTime(0.22, start + 0.008);
  popGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
  pop.connect(popGain);
  popGain.connect(masterGain);
  pop.start(start);
  pop.stop(start + 0.13);

  [
    { frequency: 820, delay: 0.018, volume: 0.09 },
    { frequency: 1120, delay: 0.052, volume: 0.075 },
    { frequency: 1480, delay: 0.086, volume: 0.055 }
  ].forEach(({ frequency, delay, volume }) => {
    const note = context.createOscillator();
    const noteGain = context.createGain();
    const noteStart = start + delay;
    note.type = 'triangle';
    note.frequency.setValueAtTime(frequency, noteStart);
    note.frequency.exponentialRampToValueAtTime(frequency * 1.06, noteStart + 0.05);
    noteGain.gain.setValueAtTime(0.0001, noteStart);
    noteGain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.068);
    note.connect(noteGain);
    noteGain.connect(masterGain);
    note.start(noteStart);
    note.stop(noteStart + 0.075);
  });
}

function setupSiteSounds() {
  const findControl = (target) => target instanceof Element
    ? target.closest('button, a, [role="button"]')
    : null;

  // Delegation also covers buttons that games create after the page loads.
  // Capture phase lets the sound begin before navigation or activity handlers.
  document.addEventListener('pointerdown', (event) => {
    const control = findControl(event.target);
    if (!control || control.hasAttribute('data-no-click-sound') || control.matches(':disabled, [aria-disabled="true"]')) return;
    playClickSound();
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
    const control = findControl(event.target);
    if (!control || control.hasAttribute('data-no-click-sound') || control.matches(':disabled, [aria-disabled="true"]')) return;
    playClickSound();
  }, true);
}

function centerLinkedLessonActivity() {
  if (window.location.hash !== '#lesson-focus') return;

  const activity = document.getElementById('lesson-focus');
  if (!activity) return;

  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';

  // Wait for the shared logo and page layout to settle before centering.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      activity.scrollIntoView({ behavior, block: 'center', inline: 'nearest' });
    });
  });
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
  centerLinkedLessonActivity();
});
