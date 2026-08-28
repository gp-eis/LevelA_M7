(function () {
  const week = new URLSearchParams(location.search).get('week') || '1';
  const titles = {
    1: 'Week 1 — What sport do you play?',
    2: 'Week 2 — What do you practice?',
    3: 'Week 3 — Where are we?',
    4: 'Week 4 — When are the Olympic Games?'
  };

  const back = document.getElementById('back-week');
  const label = document.getElementById('week-label');
  const returnLink = typeof resolveLiteracyToolReturn === 'function'
    ? resolveLiteracyToolReturn('page-0' + week + '.html', '⬅️ Week ' + week)
    : { href: 'page-0' + week + '.html', text: '⬅️ Week ' + week };
  back.href = returnLink.href;
  back.textContent = returnLink.text;
  label.textContent = titles[week] || ('Week ' + week);
  document.title = 'Flashcards — Week ' + week + ' — Athlete';

  const WEEK_DATA = {
    1: {
      base: '../assets/images/week-1/flashcards/',
      cards: [
        { id:'sports',file:'many-sports-flashcard.webp',label:'Many sports',phrase:'many sports',sentence:'I play many sports.' },
        { id:'baseball',file:'baseball-flashcard.webp',label:'Baseball',phrase:'baseball',sentence:'I play baseball.' },
        { id:'tennis',file:'tennis-flashcard.webp',label:'Tennis',phrase:'tennis',sentence:'I play tennis.' },
        { id:'soccer',file:'soccer-flashcard.webp',label:'Soccer',phrase:'soccer',sentence:'I play soccer.' },
        { id:'golf',file:'golf-flashcard.webp',label:'Golf',phrase:'golf',sentence:'I play golf.' },
        { id:'athlete',file:'athlete-flashcard.webp',label:'Athlete',phrase:null,sentence:'I am an athlete.' }
      ]
    },
    2: {
      base: '../assets/images/week-2/flashcards/',
      sentenceLead: 'I practice ',
      cards: [
        { id:'twisting',file:'twisting-flashcard.webp',label:'Twisting',phrase:'twisting',sentence:'I practice twisting.' },
        { id:'kicking',file:'kicking-flashcard.webp',label:'Kicking',phrase:'kicking',sentence:'I practice kicking.' },
        { id:'running',file:'running-flashcard.webp',label:'Running',phrase:'running',sentence:'I practice running.' },
        { id:'stretching',file:'stretching-flashcard.webp',label:'Stretching',phrase:'stretching',sentence:'I practice stretching.' },
        { id:'jumping',file:'jumping-flashcard.webp',label:'Jumping',phrase:'jumping',sentence:'I practice jumping.' }
      ]
    },
    3: {
      base: '../assets/images/week-3/flashcards/',
      sentenceLead: 'It\'s ',
      recordedOnly: true,
      cards: [
        { id:'skating',file:'skating-flashcard.webp',label:'Skating',phrase:'skating',sentence:'It\'s skating.',wordAudio:'../assets/audio/week-3/literacy/page-04-skating.mp3' },
        { id:'swimming',file:'swimming-flashcard.webp',label:'Swimming',phrase:'swimming',sentence:'It\'s swimming.',wordAudio:'../assets/audio/week-3/literacy/page-04-swimming.mp3' },
        { id:'diving',file:'diving-flashcard.webp',label:'Diving',phrase:'diving',sentence:'It\'s diving.',wordAudio:'../assets/audio/week-3/literacy/page-04-diving.mp3' },
        { id:'jumping',file:'jumping-flashcard.webp',label:'Jumping',phrase:'jumping',sentence:'It\'s jumping.',wordAudio:'../assets/audio/week-3/literacy/page-04-jumping.mp3' },
        { id:'running',file:'running-flashcard.webp',label:'Running',phrase:'running',sentence:'It\'s running.',wordAudio:'../assets/audio/week-3/literacy/page-04-running.mp3' }
      ]
    },
    4: {
      base: '../assets/images/week-4/flashcards/',
      sentenceLead: 'They come from ',
      cards: [
        { id:'north-america',file:'north-america-flashcard.webp',label:'North America',phrase:'North America',sentence:'They come from North America.' },
        { id:'south-america',file:'south-america-flashcard.webp',label:'South America',phrase:'South America',sentence:'They come from South America.' },
        { id:'europe',file:'europe-flashcard.webp',label:'Europe',phrase:'Europe',sentence:'They come from Europe.' },
        { id:'africa',file:'africa-flashcard.webp',label:'Africa',phrase:'Africa',sentence:'They come from Africa.' },
        { id:'asia',file:'asia-flashcard.webp',label:'Asia',phrase:'Asia',sentence:'They come from Asia.' },
        { id:'oceania',file:'oceania-flashcard.webp',label:'Oceania',phrase:'Oceania',sentence:'They come from Oceania.' },
        { id:'antarctica',file:'antarctica-flashcard.webp',label:'Antarctica',phrase:'Antarctica',sentence:'They come from Antarctica.' }
      ]
    }
  };

  const lockedEl = document.getElementById('fc-locked');
  const appEl = document.getElementById('fc-app');
  const data = WEEK_DATA[week];
  const sentenceLead = data && data.sentenceLead ? data.sentenceLead : 'I play ';
  const sentenceLeadEl = document.getElementById('sentence-lead');
  if (sentenceLeadEl) sentenceLeadEl.textContent = sentenceLead;

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
  const lessonSpeak = document.getElementById('lesson-speak');
  let lessonSelectedId = null;

  function selectLessonCard(card, announce = true) {
    lessonSelectedId = card.id;
    lessonImg.src = card.src;
    lessonImg.alt = card.label;
    Array.from(lessonList.querySelectorAll('.fc-lesson-item')).forEach((btn) => {
      btn.classList.toggle('is-selected', btn.dataset.id === card.id);
    });
    if (announce) speakFlashcard(card);
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
      if (i === 0) selectLessonCard(card, false);
    });
  }

  lessonImg.addEventListener('click', () => {
    const card = gameCards.find((item) => item.id === lessonSelectedId);
    if (card) speakFlashcard(card);
  });
  lessonSpeak.addEventListener('click', () => {
    const card = gameCards.find((item) => item.id === lessonSelectedId);
    if (card) speakFlashcard(card);
  });
  lessonImg.setAttribute('role', 'button');
  lessonImg.setAttribute('tabindex', '0');
  lessonImg.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      lessonImg.click();
    }
  });

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
  let recordedAudio = null;

  function stopRecordedAudio() {
    if (!recordedAudio) return;
    recordedAudio.pause();
    recordedAudio.currentTime = 0;
    recordedAudio = null;
  }

  function playRecordedWord(card, onComplete) {
    if (!card || !card.wordAudio) return false;
    stopRecordedAudio();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const audio = new Audio(card.wordAudio);
    recordedAudio = audio;
    let settled = false;
    const finish = (failed) => {
      if (settled) return;
      settled = true;
      if (recordedAudio === audio) recordedAudio = null;
      if (failed && !data.recordedOnly) speakText(card.label);
      if (onComplete) window.setTimeout(onComplete, failed ? 850 : 350);
    };
    audio.addEventListener('ended', () => finish(false), { once: true });
    audio.addEventListener('error', () => finish(true), { once: true });
    audio.play().catch(() => finish(true));
    return true;
  }

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
    stopRecordedAudio();
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

  function speakFlashcard(card) {
    if (!card) return;
    const sentencePlayback = data.recordedOnly
      ? null
      : () => speakText(card.sentence || (sentenceLead + card.phrase + '.'));
    if (playRecordedWord(card, sentencePlayback)) return;
    if (data.recordedOnly) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (!fcVoice) fcVoice = pickFcVoice();
    const word = new SpeechSynthesisUtterance(card.label);
    const sentence = new SpeechSynthesisUtterance(card.sentence || (sentenceLead + card.phrase + '.'));
    [word, sentence].forEach((utterance) => {
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      if (fcVoice) utterance.voice = fcVoice;
    });
    word.onend = () => window.setTimeout(() => window.speechSynthesis.speak(sentence), 350);
    window.speechSynthesis.speak(word);
  }

  function speakCardWord(card) {
    if (!card) return;
    if (!playRecordedWord(card) && !data.recordedOnly) speakText(card.label);
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
    speakCardWord(fastCard);
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
    speakCardWord(spotCard);
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

  const MOBILE_SCATTER_LAYOUTS = [
    { left: 3, top: 12, rot: -6 },
    { left: 30, top: 8, rot: 5 },
    { left: 57, top: 13, rot: -4 },
    { left: 16, top: 53, rot: 7 },
    { left: 52, top: 55, rot: -7 }
  ];

  const SEVEN_CARD_LAYOUTS = [
    { left: 2, top: 7, rot: -6 },
    { left: 26, top: 5, rot: 4 },
    { left: 50, top: 8, rot: -3 },
    { left: 74, top: 5, rot: 5 },
    { left: 13, top: 54, rot: 6 },
    { left: 39, top: 52, rot: -5 },
    { left: 65, top: 54, rot: 3 }
  ];

  const SEVEN_CARD_MOBILE_LAYOUTS = [
    { left: 3, top: 5, rot: -5 },
    { left: 34, top: 4, rot: 4 },
    { left: 65, top: 6, rot: -3 },
    { left: 17, top: 36, rot: 5 },
    { left: 53, top: 35, rot: -4 },
    { left: 17, top: 68, rot: -3 },
    { left: 53, top: 68, rot: 4 }
  ];

  function resetSentence() {
    scatterEl.innerHTML = '';
    placedCardEl = null;
    blankEl.textContent = '______';
    blankEl.classList.remove('is-filled', 'is-over');
    blankEl.dataset.filled = '';

    const cards = shuffle(sentenceCards);
    const isMobile = window.matchMedia('(max-width: 480px)').matches;
    const scatterLayouts = cards.length > 5
      ? (isMobile ? SEVEN_CARD_MOBILE_LAYOUTS : SEVEN_CARD_LAYOUTS)
      : (isMobile ? MOBILE_SCATTER_LAYOUTS : SCATTER_LAYOUTS);
    scatterEl.classList.toggle('has-seven-cards', cards.length > 5);
    cards.forEach((card, i) => {
      const layout = scatterLayouts[i % scatterLayouts.length];
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
    if (data.recordedOnly) {
      const card = sentenceCards.find((item) => item.phrase === phrase);
      if (card) speakCardWord(card);
    } else {
      speakText(sentenceLead + phrase + '.');
    }
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
