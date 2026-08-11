(function () {
  const week = new URLSearchParams(location.search).get('week') || '1';
  const titles = {
    1: 'Week 1 — What sport do you play?',
    2: 'Week 2 — What do you practice?',
    3: 'Week 3 — What event is it?',
    4: 'Week 4 — Where do Olympic athletes come from?'
  };

  const back = document.getElementById('back-week');
  const label = document.getElementById('week-label');
  back.href = 'page-0' + week + '.html';
  back.textContent = '⬅️ Week ' + week;
  label.textContent = titles[week] || ('Week ' + week);
  document.title = 'Flashcards — Week ' + week + ' — Athlete People';

  const WEEK_DATA = {
    1: {
      base: '../assets/images/week-1/flashcards/',
      cards: [
        { id: 'sports', file: 'many-sports-flashcard.webp', label: 'Many sports', phrase: 'many sports' },
        { id: 'baseball', file: 'baseball-flashcard.webp', label: 'Baseball', phrase: 'baseball' },
        { id: 'tennis', file: 'tennis-flashcard.webp', label: 'Tennis', phrase: 'tennis' },
        { id: 'soccer', file: 'soccer-flashcard.webp', label: 'Soccer', phrase: 'soccer' },
        { id: 'golf', file: 'golf-flashcard.webp', label: 'Golf', phrase: 'golf' },
        { id: 'athlete', file: 'athlete-flashcard.webp', label: 'Athlete', phrase: null }
      ]
    }
  };

  const lockedEl = document.getElementById('fc-locked');
  const appEl = document.getElementById('fc-app');
  const data = WEEK_DATA[week];

  if (!data || (typeof isWeekOpen === 'function' && !isWeekOpen(week))) {
    lockedEl.style.display = '';
    return;
  }

  appEl.style.display = '';

  const allCards = data.cards.map((c) => ({
    ...c,
    src: data.base + c.file
  }));
  const gameCards = allCards;
  const sentenceCards = allCards.filter((c) => c.phrase);

  /* ---------- Activity tabs ---------- */
  const navBtns = Array.from(document.querySelectorAll('.fc-nav-btn'));
  const panels = Array.from(document.querySelectorAll('.fc-panel'));

  function showActivity(name) {
    navBtns.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.activity === name);
    });
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === name);
    });
    if (name === 'spot') resetSpot();
    if (name === 'fast') resetFast(false);
    if (name === 'sentence') resetSentence();
  }

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => showActivity(btn.dataset.activity));
  });

  /* ========== Lesson Flashcards ========== */
  const lessonImg = document.getElementById('lesson-img');
  const lessonList = document.getElementById('lesson-list');
  let lessonSelectedId = null;

  function selectLessonCard(card) {
    lessonSelectedId = card.id;
    lessonImg.src = card.src;
    lessonImg.alt = card.label;
    Array.from(lessonList.querySelectorAll('.fc-lesson-item')).forEach((btn) => {
      btn.classList.toggle('is-selected', btn.dataset.id === card.id);
    });
  }

  function buildLessonList() {
    lessonList.innerHTML = '';
    gameCards.forEach((card, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fc-lesson-item';
      btn.dataset.id = card.id;
      btn.setAttribute('aria-label', card.label);
      btn.innerHTML = '<img src="' + card.src + '" alt="' + card.label + '">';
      btn.addEventListener('click', () => selectLessonCard(card));
      lessonList.appendChild(btn);
      if (i === 0) selectLessonCard(card);
    });
  }

  /* ---------- Helpers ---------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandom(arr, avoidId) {
    const pool = avoidId ? arr.filter((c) => c.id !== avoidId) : arr;
    const list = pool.length ? pool : arr;
    return list[Math.floor(Math.random() * list.length)];
  }

  let fcVoice = null;

  function pickFcVoice() {
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

  function speakText(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    if (!fcVoice) fcVoice = pickFcVoice();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.92;
    utter.pitch = 1.12;
    utter.volume = 1;
    if (fcVoice) utter.voice = fcVoice;
    window.speechSynthesis.speak(utter);
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      fcVoice = pickFcVoice();
    });
  }

  /* ========== Fast Game ========== */
  const fastImg = document.getElementById('fast-img');
  const fastCover = document.getElementById('fast-cover');
  const fastPeekBtn = document.getElementById('fast-peek');
  const fastRevealBtn = document.getElementById('fast-reveal');
  const fastNextBtn = document.getElementById('fast-next');
  let fastCard = null;
  let fastTimer = null;
  let fastRevealed = false;

  function clearFastTimer() {
    if (fastTimer) {
      clearTimeout(fastTimer);
      fastTimer = null;
    }
  }

  function setFastCard(card) {
    fastCard = card;
    fastImg.src = card.src;
    fastImg.alt = card.label;
    fastRevealed = false;
    fastCover.classList.remove('is-hidden');
  }

  function peekFast() {
    if (!fastCard || fastRevealed) return;
    clearFastTimer();
    fastCover.classList.add('is-hidden');
    fastTimer = setTimeout(() => {
      if (!fastRevealed) fastCover.classList.remove('is-hidden');
      fastTimer = null;
    }, 300);
  }

  function revealFast() {
    if (!fastCard) return;
    clearFastTimer();
    fastRevealed = true;
    fastCover.classList.add('is-hidden');
    speakText(fastCard.label);
  }

  function resetFast(newCard) {
    clearFastTimer();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const next = newCard
      ? pickRandom(gameCards, fastCard && fastCard.id)
      : pickRandom(gameCards);
    setFastCard(next);
    requestAnimationFrame(() => peekFast());
  }

  fastPeekBtn.addEventListener('click', peekFast);
  fastRevealBtn.addEventListener('click', revealFast);
  fastNextBtn.addEventListener('click', () => resetFast(true));

  /* ========== Spot the Picture ========== */
  const spotArea = document.getElementById('spot-area');
  const spotImg = document.getElementById('spot-img');
  const spotMask = document.getElementById('spot-mask');
  const spotRevealBtn = document.getElementById('spot-reveal');
  const spotNextBtn = document.getElementById('spot-next');
  let spotCard = null;
  let spotRevealed = false;

  function setSpotCard(card) {
    spotCard = card;
    spotImg.src = card.src;
    spotImg.alt = card.label;
    spotRevealed = false;
    spotArea.classList.remove('is-revealed');
    spotMask.style.setProperty('--spot-x', '50%');
    spotMask.style.setProperty('--spot-y', '50%');
  }

  function moveSpotlight(clientX, clientY) {
    if (spotRevealed) return;
    const rect = spotArea.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    spotMask.style.setProperty('--spot-x', Math.max(0, Math.min(100, x)) + '%');
    spotMask.style.setProperty('--spot-y', Math.max(0, Math.min(100, y)) + '%');
  }

  function resetSpot() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpotCard(pickRandom(gameCards, spotCard && spotCard.id));
  }

  spotArea.addEventListener('pointermove', (e) => {
    moveSpotlight(e.clientX, e.clientY);
  });
  spotArea.addEventListener('pointerdown', (e) => {
    spotArea.setPointerCapture(e.pointerId);
    moveSpotlight(e.clientX, e.clientY);
  });

  spotRevealBtn.addEventListener('click', () => {
    if (!spotCard) return;
    spotRevealed = true;
    spotArea.classList.add('is-revealed');
    speakText(spotCard.label);
  });
  spotNextBtn.addEventListener('click', resetSpot);

  /* ========== Complete the Sentence ========== */
  const scatterEl = document.getElementById('sentence-scatter');
  const blankEl = document.getElementById('sentence-blank');
  const resetBtn = document.getElementById('sentence-reset');
  let dragState = null;
  let placedCardEl = null;

  const SCATTER_LAYOUTS = [
    { left: 8, top: 12, rot: -8 },
    { left: 38, top: 8, rot: 6 },
    { left: 68, top: 14, rot: -4 },
    { left: 18, top: 48, rot: 10 },
    { left: 55, top: 52, rot: -11 }
  ];

  function resetSentence() {
    scatterEl.innerHTML = '';
    placedCardEl = null;
    blankEl.textContent = '______';
    blankEl.classList.remove('is-filled', 'is-over');
    blankEl.dataset.filled = '';

    const cards = shuffle(sentenceCards);
    cards.forEach((card, i) => {
      const layout = SCATTER_LAYOUTS[i % SCATTER_LAYOUTS.length];
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'fc-scatter-card';
      el.dataset.id = card.id;
      el.dataset.phrase = card.phrase;
      el.setAttribute('aria-label', card.label);
      el.style.left = layout.left + '%';
      el.style.top = layout.top + '%';
      el.style.transform = 'rotate(' + layout.rot + 'deg)';
      el.dataset.homeLeft = el.style.left;
      el.dataset.homeTop = el.style.top;
      el.dataset.homeTransform = el.style.transform;
      el.innerHTML = '<img src="' + card.src + '" alt="' + card.label + '">';
      scatterEl.appendChild(el);
      enableDrag(el);
    });
  }

  function returnCardHome(cardEl) {
    if (!cardEl) return;
    cardEl.classList.remove('is-placed', 'is-dragging');
    cardEl.style.display = '';
    cardEl.style.position = 'absolute';
    cardEl.style.left = cardEl.dataset.homeLeft;
    cardEl.style.top = cardEl.dataset.homeTop;
    cardEl.style.width = '';
    cardEl.style.margin = '';
    cardEl.style.transform = cardEl.dataset.homeTransform;
  }

  function placeInBlank(phrase, cardEl) {
    if (placedCardEl && placedCardEl !== cardEl) returnCardHome(placedCardEl);
    placedCardEl = cardEl;
    blankEl.textContent = phrase;
    blankEl.classList.add('is-filled');
    blankEl.classList.remove('is-over');
    blankEl.dataset.filled = phrase;
    if (cardEl) {
      cardEl.classList.add('is-placed');
      cardEl.style.display = 'none';
    }
    speakText('I play ' + phrase + '.');
  }

  function enableDrag(el) {
    el.addEventListener('pointerdown', (e) => {
      if (el.classList.contains('is-placed')) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      dragState = {
        el,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        startLeft: el.style.left,
        startTop: el.style.top,
        startTransform: el.style.transform,
        moved: false
      };
      el.classList.add('is-dragging');
      el.style.position = 'fixed';
      el.style.left = rect.left + 'px';
      el.style.top = rect.top + 'px';
      el.style.width = rect.width + 'px';
      el.style.margin = '0';
      el.style.transform = 'scale(1.06) rotate(0deg)';
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
      if (!dragState || dragState.el !== el) return;
      dragState.moved = true;
      el.style.left = e.clientX - dragState.offsetX + 'px';
      el.style.top = e.clientY - dragState.offsetY + 'px';

      const blankRect = blankEl.getBoundingClientRect();
      const over =
        e.clientX >= blankRect.left &&
        e.clientX <= blankRect.right &&
        e.clientY >= blankRect.top &&
        e.clientY <= blankRect.bottom;
      blankEl.classList.toggle('is-over', over);
    });

    el.addEventListener('pointerup', (e) => {
      if (!dragState || dragState.el !== el) return;
      const blankRect = blankEl.getBoundingClientRect();
      const over =
        e.clientX >= blankRect.left - 12 &&
        e.clientX <= blankRect.right + 12 &&
        e.clientY >= blankRect.top - 12 &&
        e.clientY <= blankRect.bottom + 12;

      el.classList.remove('is-dragging');
      blankEl.classList.remove('is-over');

      if (over) {
        placeInBlank(el.dataset.phrase, el);
      } else {
        el.style.position = 'absolute';
        el.style.left = dragState.startLeft;
        el.style.top = dragState.startTop;
        el.style.width = '';
        el.style.transform = dragState.startTransform;
      }
      dragState = null;
    });

    el.addEventListener('pointercancel', () => {
      if (!dragState || dragState.el !== el) return;
      el.classList.remove('is-dragging');
      blankEl.classList.remove('is-over');
      el.style.position = 'absolute';
      el.style.left = dragState.startLeft;
      el.style.top = dragState.startTop;
      el.style.width = '';
      el.style.transform = dragState.startTransform;
      dragState = null;
    });
  }

  resetBtn.addEventListener('click', resetSentence);

  /* ---------- Boot ---------- */
  buildLessonList();
  resetFast(false);
  resetSpot();
  resetSentence();
})();
