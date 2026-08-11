/**
 * Week 1 Baseball dress-up
 * One item at a time: Baseball uniform → Baseball shoes → Baseball bat → Baseball → Baseball helmet
 * Progressive character states on a colorful stage; spoken labels via speechSynthesis.
 */
(function () {
  const VIDEO_SRC = '../assets/video/week-1/baseball.mp4';
  const CLIP_SRC = '../assets/video/week-1/Dress%20up/baseball-dressup.mp4';
  const ASSET = '../assets/images/week-1/dress-up/baseball/';

  const STEPS = [
    {
      id: 'uniform',
      word: 'Baseball uniform',
      item: ASSET + 'item-uniform.webp',
      state: ASSET + 'state-uniform.webp'
    },
    {
      id: 'shoes',
      word: 'Baseball shoes',
      item: ASSET + 'item-shoes.webp',
      state: ASSET + 'state-uniform-shoes.webp'
    },
    {
      id: 'bat',
      word: 'Baseball bat',
      item: ASSET + 'item-bat.webp',
      state: ASSET + 'state-uniform-shoes-bat.webp'
    },
    {
      id: 'ball',
      word: 'Baseball',
      item: ASSET + 'item-ball.webp',
      state: ASSET + 'state-uniform-shoes-bat-ball.webp'
    },
    {
      id: 'helmet',
      word: 'Baseball helmet',
      item: ASSET + 'item-helmet.webp',
      state: ASSET + 'state-uniform-shoes-bat-ball-helmet.webp'
    }
  ];

  const BASE = ASSET + 'character.webp';

  let overlay;
  let stepIndex = 0;
  let dragging = null;
  let ghost = null;
  let completeTimer = null;

  function clearCompleteTimer() {
    if (completeTimer) {
      clearTimeout(completeTimer);
      completeTimer = null;
    }
  }

  function clipEl() {
    return overlay && overlay.querySelector('.dressup-clip');
  }

  function stopClip() {
    clearCompleteTimer();
    if (!overlay) return;
    const wrap = overlay.querySelector('.dressup-character-wrap');
    const clip = clipEl();
    if (wrap) wrap.classList.remove('is-playing-clip');
    if (clip) {
      clip.pause();
      clip.removeAttribute('src');
      clip.load();
    }
  }

  let clipStarted = false;

  function playDressupClip() {
    if (!overlay || clipStarted) return;
    const wrap = overlay.querySelector('.dressup-character-wrap');
    const clip = clipEl();
    if (!wrap || !clip) return;

    clipStarted = true;
    clearCompleteTimer();
    wrap.classList.add('is-playing-clip');
    if (clip.getAttribute('src') !== CLIP_SRC) clip.src = CLIP_SRC;
    clip.currentTime = 0;
    clip.play().catch(() => {
      clipStarted = false;
      wrap.classList.remove('is-playing-clip');
      if (typeof showToast === 'function') showToast('🎬 Dress-up video not found yet!');
    });
  }

  function playBaseballVideo() {
    const video = document.getElementById('dialogue-video');
    if (!video) {
      showToast('🎬 Video player missing!');
      return;
    }
    if (video.getAttribute('src') !== VIDEO_SRC) video.src = VIDEO_SRC;
    video.hidden = false;
    video.scrollIntoView({ behavior: 'smooth', block: 'center' });
    video.play().catch(() => showToast('🎬 Video file not found yet!'));
  }

  function finishAndPlay() {
    stopVoice();
    stopClip();
    closeDressUp();
    playBaseballVideo();
  }

  const SUCCESS_LINE = "I'm a baseball player!";
  let femaleVoice = null;

  function pickFemaleVoice() {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const preferred = voices.find((v) =>
      /Samantha|Victoria|Karen|Moira|Tessa|Fiona|Google US English|Microsoft Zira|Female|woman/i.test(v.name)
      && /^en[-_]US$/i.test(v.lang || '')
    );
    if (preferred) return preferred;

    return voices.find((v) => /^en[-_]US$/i.test(v.lang || '')) || null;
  }

  function stopVoice() {
    clearCompleteTimer();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function speak(text) {
    stopVoice();
    if (!window.speechSynthesis) return;
    if (!femaleVoice) femaleVoice = pickFemaleVoice();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.92;
    utter.pitch = 1.12;
    utter.volume = 1;
    if (femaleVoice) utter.voice = femaleVoice;
    window.setTimeout(() => window.speechSynthesis.speak(utter), 60);
  }

  function speakSuccessThenPlayClip() {
    clearCompleteTimer();
    clipStarted = false;

    if (!window.speechSynthesis) {
      playDressupClip();
      return;
    }

    window.speechSynthesis.cancel();
    if (!femaleVoice) femaleVoice = pickFemaleVoice();

    window.setTimeout(() => {
      const utter = new SpeechSynthesisUtterance(SUCCESS_LINE);
      utter.lang = 'en-US';
      utter.rate = 0.92;
      utter.pitch = 1.12;
      utter.volume = 1;
      if (femaleVoice) utter.voice = femaleVoice;

      let finished = false;
      const finish = () => {
        if (finished || clipStarted) return;
        finished = true;
        clearCompleteTimer();
        playDressupClip();
      };

      utter.onend = finish;
      utter.onerror = (event) => {
        const err = event && event.error;
        if (err === 'interrupted' || err === 'canceled') return;
        finish();
      };

      window.speechSynthesis.speak(utter);

      const startedAt = Date.now();
      let heardSpeech = false;
      const poll = () => {
        if (finished || clipStarted) return;
        const synth = window.speechSynthesis;
        if (synth.speaking || synth.pending) heardSpeech = true;
        const waited = Date.now() - startedAt;
        if (heardSpeech && !synth.speaking && !synth.pending) {
          finish();
          return;
        }
        if (!heardSpeech && waited > 2800) {
          finish();
          return;
        }
        if (waited > 10000) {
          finish();
          return;
        }
        completeTimer = window.setTimeout(poll, 120);
      };
      completeTimer = window.setTimeout(poll, 200);
    }, 80);
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      femaleVoice = pickFemaleVoice();
    });
  }

  function characterEl() {
    return overlay.querySelector('.dressup-character');
  }

  function setCharacter(src) {
    const img = characterEl();
    if (!img) return;
    if (img.getAttribute('src') === src) return;
    img.src = src;
  }

  function preloadCharacterFrames() {
    [BASE, ...STEPS.map((s) => s.state)].forEach((src) => {
      const pre = new Image();
      pre.src = src;
    });
  }

  function showComplete() {
    const tray = overlay.querySelector('.dressup-tray');
    const success = overlay.querySelector('.dressup-success');
    const itemBtn = overlay.querySelector('.dressup-item');

    if (itemBtn) itemBtn.hidden = true;
    if (tray) tray.hidden = true;

    overlay.querySelector('.dressup-stage-column').classList.add('is-complete');
    setCharacter(STEPS[STEPS.length - 1].state);

    const line = success.querySelector('.dressup-success-line');
    if (line) line.textContent = SUCCESS_LINE;
    success.hidden = false;

    if (typeof playClickSound === 'function') playClickSound();
    speakSuccessThenPlayClip();
  }

  function showStep() {
    const tray = overlay.querySelector('.dressup-tray');
    const success = overlay.querySelector('.dressup-success');
    const itemBtn = overlay.querySelector('.dressup-item');
    const itemImg = overlay.querySelector('.dressup-item img');
    const wordEl = overlay.querySelector('.dressup-word');
    const stepEl = overlay.querySelector('.dressup-step');

    if (stepIndex >= STEPS.length) {
      showComplete();
      return;
    }

    overlay.querySelector('.dressup-stage-column').classList.remove('is-complete');
    success.hidden = true;
    tray.hidden = false;

    const step = STEPS[stepIndex];
    wordEl.textContent = step.word;
    stepEl.textContent = `Step ${stepIndex + 1} of ${STEPS.length} — drag it onto her!`;
    itemBtn.dataset.piece = step.id;
    itemBtn.setAttribute('aria-label', step.word);
    itemBtn.classList.remove('is-dragging');
    itemBtn.hidden = false;
    itemImg.src = step.item;

    speak(step.word);
  }

  function resetBoard() {
    stepIndex = 0;
    clipStarted = false;
    stopClip();
    overlay.querySelector('.dressup-dropzone').classList.remove('is-target');
    overlay.querySelector('.dressup-stage-column').classList.remove('is-complete');
    overlay.querySelector('.dressup-success').hidden = true;
    overlay.querySelector('.dressup-tray').hidden = false;
    const itemBtn = overlay.querySelector('.dressup-item');
    if (itemBtn) itemBtn.hidden = false;
    const img = characterEl();
    if (img) {
      img.src = BASE;
      img.style.opacity = '1';
    }
    clearGhost();
  }

  function clearGhost() {
    if (ghost) {
      ghost.remove();
      ghost = null;
    }
    dragging = null;
  }

  function redoActivity() {
    stopVoice();
    resetBoard();
    showStep();
  }

  function advanceAfterPlace() {
    const step = STEPS[stepIndex];
    const itemBtn = overlay.querySelector('.dressup-item');
    const tray = overlay.querySelector('.dressup-tray');

    if (itemBtn) itemBtn.hidden = true;
    if (tray) tray.hidden = true;

    setCharacter(step.state);
    stepIndex += 1;

    if (stepIndex >= STEPS.length) {
      showComplete();
      return;
    }

    window.setTimeout(showStep, 280);
  }

  function pointInDropzone(clientX, clientY) {
    const zone = overlay.querySelector('.dressup-dropzone');
    const rect = zone.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  function onPointerDown(event) {
    const item = event.target.closest('.dressup-item');
    if (!item || item.hidden) return;
    event.preventDefault();
    dragging = item;
    item.classList.add('is-dragging');
    item.setPointerCapture(event.pointerId);

    ghost = document.createElement('img');
    ghost.className = 'dressup-ghost';
    ghost.src = item.querySelector('img').src;
    ghost.alt = '';
    document.body.appendChild(ghost);
    ghost.style.left = `${event.clientX}px`;
    ghost.style.top = `${event.clientY}px`;

    item.addEventListener('pointermove', onPointerMove);
    item.addEventListener('pointerup', onPointerUp);
    item.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(event) {
    if (!dragging || !ghost) return;
    ghost.style.left = `${event.clientX}px`;
    ghost.style.top = `${event.clientY}px`;
    overlay.querySelector('.dressup-dropzone').classList.toggle(
      'is-target',
      pointInDropzone(event.clientX, event.clientY)
    );
  }

  function onPointerUp(event) {
    if (!dragging) return;
    const item = dragging;
    const over = pointInDropzone(event.clientX, event.clientY);
    item.classList.remove('is-dragging');
    item.removeEventListener('pointermove', onPointerMove);
    item.removeEventListener('pointerup', onPointerUp);
    item.removeEventListener('pointercancel', onPointerUp);
    overlay.querySelector('.dressup-dropzone').classList.remove('is-target');
    clearGhost();
    if (over) advanceAfterPlace();
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'dressup-overlay';
    overlay.id = 'baseball-dressup';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Baseball dress-up activity');

    overlay.innerHTML = `
      <div class="dressup-modal">
        <div class="dressup-header">
          <h2>⚾ Dress the baseball player!</h2>
          <div class="dressup-actions">
            <button type="button" class="dressup-icon-btn" data-dressup-redo title="Redo" aria-label="Redo dress-up">🔄</button>
            <button type="button" class="pill-btn orange" data-dressup-skip>Skip ⏭️</button>
          </div>
        </div>

        <div class="dressup-stage-column">
          <div class="dressup-character-wrap">
            <div class="dressup-dropzone" aria-label="Drop the item on the player"></div>
            <img class="dressup-character" src="${BASE}" alt="Athlete ready to dress up">
            <video class="dressup-clip" playsinline preload="metadata" aria-label="Dress-up celebration video"></video>
          </div>

          <aside class="dressup-tray">
            <p class="dressup-word" aria-live="polite">Baseball uniform</p>
            <p class="dressup-step">Step 1 of ${STEPS.length} — drag it onto her!</p>
            <div class="dressup-items">
              <button type="button" class="dressup-item" data-piece="uniform" aria-label="Baseball uniform">
                <img src="${STEPS[0].item}" alt="">
              </button>
            </div>
          </aside>

          <div class="dressup-success" hidden>
            <div class="dressup-success-card">
              <p class="dressup-success-line" tabindex="0">${SUCCESS_LINE}</p>
              <div class="dressup-success-actions">
                <button type="button" class="dressup-icon-btn" data-dressup-redo title="Redo" aria-label="Redo dress-up">🔄</button>
                <button type="button" class="pill-btn green" data-dressup-continue>Play Video ▶️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('[data-dressup-skip]').addEventListener('click', finishAndPlay);
    overlay.querySelector('[data-dressup-continue]').addEventListener('click', finishAndPlay);
    overlay.querySelectorAll('[data-dressup-redo]').forEach((btn) => {
      btn.addEventListener('click', redoActivity);
    });
    overlay.querySelector('.dressup-items').addEventListener('pointerdown', onPointerDown);

    overlay.querySelector('.dressup-word').addEventListener('click', () => {
      if (stepIndex < STEPS.length) speak(STEPS[stepIndex].word);
    });
    overlay.querySelector('.dressup-success-line').addEventListener('click', () => speak(SUCCESS_LINE));
  }

  function openDressUp() {
    if (!overlay) buildOverlay();
    preloadCharacterFrames();
    resetBoard();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    showStep();
  }

  function closeDressUp() {
    if (!overlay) return;
    stopVoice();
    stopClip();
    overlay.hidden = true;
    document.body.style.overflow = '';
    clearGhost();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const baseballBtn = document.querySelector('[data-dress-up="baseball"]');
    if (!baseballBtn) return;

    baseballBtn.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
      openDressUp();
    }, true);
  });
})();
