/* ============================================================
   Athlete — shared JavaScript
   Sound toggle, dialogue buttons (audio/video hooks), and toasts
   ============================================================ */

/* Load the saved English/Korean interface preference on every project page. */
(() => {
  if (window.athletePeopleLanguage || document.querySelector('script[src$="/i18n.js"], script[src="js/i18n.js"]')) return;
  const mainScript = document.currentScript;
  if (!mainScript?.src) return;
  const languageScript = document.createElement('script');
  languageScript.src = new URL('i18n.js', mainScript.src).href;
  languageScript.dataset.athleteI18nLoader = 'true';
  document.head.appendChild(languageScript);
})();

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

/* ---------- American-English speech ---------- */

/**
 * Speak generated text using an American-English voice whenever the browser
 * exposes one. Lesson scripts should use this helper instead of the device's
 * default speech language.
 */
function speakAmericanEnglish(text, options = {}) {
  if (!text || !('speechSynthesis' in window)) return false;
  if (typeof soundEnabled !== 'undefined' && !soundEnabled) return false;

  const voices = window.speechSynthesis.getVoices();
  const americanVoices = voices.filter((voice) => /^en-US$/i.test(voice.lang));
  const preferredVoice = americanVoices.find((voice) => /(?:samantha|ava|allison|jenny|aria|guy|david|zira|google us english)/i.test(voice.name))
    || americanVoices[0];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = options.rate ?? 0.82;
  utterance.pitch = options.pitch ?? 1.05;
  if (preferredVoice) utterance.voice = preferredVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
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

/* ---------- Return from Literacy tools to the originating Literacy page ---------- */

function setupLiteracyToolReturnLinks() {
  const currentFile = window.location.pathname.split('/').pop();
  if (!currentFile || /^(?:tpr|flashcards|conversation)\.html$/i.test(currentFile)) return;

  const returnTarget = currentFile + '#lesson-focus';
  const pageText = document.querySelector('.page-indicator')?.textContent || '';
  const pageMatch = pageText.match(/Page\s+(\d+)/i);
  const pageNumber = pageMatch ? pageMatch[1] : '';

  document.querySelectorAll('.week-tools').forEach((tools) => {
    if (tools.querySelector('a[href*="conversation.html"]')) return;
    const referenceLink = tools.querySelector('a[href*="tpr.html"], a[href*="flashcards.html"]');
    if (!referenceLink) return;
    const week = new URL(referenceLink.getAttribute('href'), window.location.href).searchParams.get('week');
    if (!/^[1-4]$/.test(week || '')) return;
    const conversation = document.createElement('a');
    conversation.className = 'pill-btn green';
    conversation.href = `conversation.html?week=${week}`;
    conversation.textContent = '💬 Conversation';
    tools.appendChild(conversation);
  });

  document.querySelectorAll('a[href*="tpr.html"], a[href*="flashcards.html"], a[href*="conversation.html"]').forEach((link) => {
    const toolUrl = new URL(link.getAttribute('href'), window.location.href);
    toolUrl.searchParams.set('return', returnTarget);
    if (pageNumber) toolUrl.searchParams.set('from', pageNumber);
    link.href = toolUrl.href;

    link.addEventListener('click', () => {
      try {
        sessionStorage.setItem('literacyToolReturn', returnTarget);
        sessionStorage.setItem('literacyToolReturnPage', pageNumber);
      } catch (_error) {
        // Query parameters still preserve the return page when storage is unavailable.
      }
    });
  });
}

function resolveLiteracyToolReturn(fallbackHref, fallbackText) {
  const params = new URLSearchParams(window.location.search);
  let target = params.get('return') || '';
  let pageNumber = params.get('from') || '';

  if (!target) {
    try {
      target = sessionStorage.getItem('literacyToolReturn') || '';
      pageNumber = pageNumber || sessionStorage.getItem('literacyToolReturnPage') || '';
    } catch (_error) {
      target = '';
    }
  }

  const safeTarget = /^(?:page-0[1-4]|week-[1-4]-page-0[1-9])\.html(?:#[A-Za-z0-9_-]+)?$/i.test(target);
  if (!safeTarget) return { href: fallbackHref, text: fallbackText };

  return {
    href: target,
    text: /^\d+$/.test(pageNumber) ? `⬅️ Back to Page ${pageNumber}` : '⬅️ Back to Lesson'
  };
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

function setupVideoPlayOverlays() {
  document.querySelectorAll('.video-play-shell').forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.center-video-play');
    if (!video || !button) return;

    const showButton = () => { button.hidden = false; };
    const hideButton = () => { button.hidden = true; };
    button.addEventListener('click', () => video.play().catch(showButton));
    video.addEventListener('play', hideButton);
    video.addEventListener('playing', hideButton);
    video.addEventListener('pause', showButton);
    video.addEventListener('ended', showButton);
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
  img.src = getAssetsBase() + 'images/ui/giiip-eis-logo.webp';
  img.alt = 'GIIIP EIS logo';
  img.width = 118;
  img.height = 118;
  img.decoding = 'async';

  bar.appendChild(img);
  document.body.prepend(bar);
  document.body.classList.add('has-site-logo');
}

/* ---------- Week unlocks (add week numbers here when materials are ready) ---------- */
const OPEN_WEEKS = [1, 2, 3, 4];
const OPEN_GAME_WEEKS = [1, 2, 3, 4];

function isWeekOpen(week) {
  return OPEN_WEEKS.includes(Number(week));
}

function isGamesWeekOpen(week) {
  return OPEN_GAME_WEEKS.includes(Number(week));
}

/** Block direct links to closed literacy / games / reading weeks. */
function guardClosedWeeks() {
  const path = window.location.pathname.replace(/\\/g, '/');

  const lessonMatch = path.match(/\/lessons\/page-0([2-4])\.html$/i);
  if (lessonMatch && !isWeekOpen(lessonMatch[1])) {
    window.location.replace('../index.html');
    return true;
  }

  const gamesMatch = path.match(/\/games\/week-([2-4])\//i);
  if (gamesMatch && !isGamesWeekOpen(gamesMatch[1])) {
    window.location.replace('../../index.html');
    return true;
  }

  const readingMatch = path.match(/\/reading\/week-([2-4])\.html$/i);
  if (readingMatch && !isWeekOpen(readingMatch[1])) {
    window.location.replace('../index.html');
    return true;
  }

  const phonicsMatch = path.match(/\/phonics\/week-([2-4])\.html$/i);
  if (phonicsMatch && !isWeekOpen(phonicsMatch[1])) {
    window.location.replace('../index.html');
    return true;
  }

  return false;
}

/** Dim locked week cards/buttons on hubs; toast on click. */
function setupLockedWeekCards() {
  document.querySelectorAll('.week-card[data-week], .week-pick-btn[data-week]').forEach((el) => {
    const week = Number(el.dataset.week);
    const isOpen = el.classList.contains('week-pick-btn')
      ? isGamesWeekOpen(week)
      : isWeekOpen(week);
    if (!week || isOpen) return;

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

/* ---------- Phonics game return navigation (Weeks 1–4) ---------- */
function setupPhonicsEntryLinks() {
  const path = window.location.pathname.replace(/\\/g, '/');

  if (/\/phonics\/week-[1-4]\.html$/i.test(path)) {
    document.querySelectorAll('a[href*="/games/"][href*="phonics.html"], a[href^="../games/"][href*="phonics.html"]').forEach((link) => {
      const url = new URL(link.href, window.location.href);
      url.searchParams.set('from', 'phonics');
      link.href = url.href;
    });
  }

  if (/\/games\/(?:index\.html)?$/i.test(path)) {
    document.querySelectorAll('a.nav-card[href$="phonics.html"], a.nav-card[href*="phonics.html?"]').forEach((link) => {
      const url = new URL(link.href, window.location.href);
      url.searchParams.set('from', 'games');
      link.href = url.href;
    });
  }
}

function setupPhonicsGameReturn() {
  const path = window.location.pathname.replace(/\\/g, '/');
  const hubMatch = path.match(/\/games\/(?:week-(\d+)\/)?phonics\.html$/i);
  const activityMatch = path.match(/\/games\/(?:week-(\d+)\/)?phonics-(?:find-letter|build|maze|picture-match)\.html$/i);
  if (!hubMatch && !activityMatch) return;

  const match = hubMatch || activityMatch;
  const week = Number(match[1] || 1);
  const params = new URLSearchParams(window.location.search);
  const storageKey = `phonics-game-origin-week-${week}`;
  let origin = params.get('from');

  if (origin !== 'phonics' && origin !== 'games') {
    const referrer = document.referrer.replace(/\\/g, '/');
    if (/\/phonics\/week-\d+\.html/i.test(referrer)) origin = 'phonics';
    else if (/\/games\/(?:index\.html)?(?:[?#]|$)/i.test(referrer)) origin = 'games';
    else origin = sessionStorage.getItem(storageKey) || 'games';
  }

  sessionStorage.setItem(storageKey, origin);

  const withOrigin = (href) => {
    const url = new URL(href, window.location.href);
    url.searchParams.set('from', origin);
    return `${url.pathname.split('/').pop()}${url.search}${url.hash}`;
  };

  if (hubMatch) {
    const backLink = document.querySelector('.page > .back-link, main.page > .back-link');
    if (backLink) {
      if (origin === 'phonics') {
        backLink.href = week === 1
          ? '../phonics/week-1.html#lesson-focus'
          : `../../phonics/week-${week}.html#lesson-focus`;
        backLink.textContent = '⬅️ Phonics Lesson';
      } else {
        backLink.href = week === 1
          ? 'index.html?week=1'
          : `../index.html?week=${week}`;
        backLink.textContent = '⬅️ All Games';
      }
    }

    document.querySelectorAll('a.nav-card[href^="phonics-"]').forEach((link) => {
      link.href = withOrigin(link.getAttribute('href'));
    });
    return;
  }

  const backLink = document.querySelector('.page > .back-link, main.page > .back-link');
  if (backLink) {
    backLink.href = withOrigin('phonics.html');
    backLink.textContent = '⬅️ Phonics Games';
  }
}

function setupGameWeekHomeButton() {
  const path = window.location.pathname.replace(/\\/g, '/');
  if (!/\/games\//i.test(path) || document.querySelector('.game-week-home-link')) return;

  const fileName = (path.split('/').pop() || '').toLowerCase();
  const nonActivityPages = new Set(['', 'index.html', 'phonics.html', 'placeholder.html', 'phonics-placeholder.html']);
  if (nonActivityPages.has(fileName)) return;

  const params = new URLSearchParams(window.location.search);
  const queryWeek = Number(params.get('week'));
  const folderWeek = Number(path.match(/\/games\/week-([1-4])\//i)?.[1]);
  const fileWeek = Number(fileName.match(/^week-([1-4])-/i)?.[1]);
  const bodyWeek = Number(document.body.dataset.gameWeek || document.body.dataset.week);
  const week = [queryWeek, bodyWeek, folderWeek, fileWeek].find((value) => value >= 1 && value <= 4) || 1;
  const isNestedWeekFolder = /\/games\/week-[1-4]\//i.test(path);

  const homeLink = document.createElement('a');
  homeLink.className = 'back-link game-week-home-link';
  homeLink.href = `${isNestedWeekFolder ? '../../' : '../'}week-${week}.html#card-games`;
  homeLink.setAttribute('aria-label', `Return to Week ${week} lesson selection`);
  homeLink.innerHTML = '<span aria-hidden="true">🏠</span><span>Home</span>';
  document.body.appendChild(homeLink);
}

document.addEventListener('DOMContentLoaded', () => {
  if (guardClosedWeeks()) return;
  setupSiteLogo();
  setupSiteSounds();
  setupDialogueButtons();
  setupVideoPlayOverlays();
  setupLockedWeekCards();
  setupPhonicsEntryLinks();
  setupPhonicsGameReturn();
  setupGameWeekHomeButton();
  setupLiteracyToolReturnLinks();
  centerLinkedLessonActivity();
});
