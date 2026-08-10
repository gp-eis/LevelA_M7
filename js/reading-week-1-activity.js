(() => {
  const MEDALS = [
    { id: 'gold', label: 'Gold medal', ordinal: '1st', detail: 'I am first.' },
    { id: 'silver', label: 'Silver medal', ordinal: '2nd', detail: 'I am second.' },
    { id: 'bronze', label: 'Bronze medal', ordinal: '3rd', detail: 'I am third.' }
  ];

  const FINAL_QUESTION = {
    main: 'What do you say to someone who is last?',
    correct: "It's okay! You tried your best!",
    options: [
      "It's okay! You tried your best!",
      'Oh no! You did not do well.'
    ]
  };

  const questionMain = document.getElementById('question-main');
  const questionDetail = document.getElementById('question-detail');
  const questionPanel = document.querySelector('.question-panel');
  const questionIllustration = document.getElementById('question-illustration');
  const introSpeaker = document.getElementById('intro-speaker');
  const questionSpeaker = document.getElementById('question-speaker');
  const answersGrid = document.getElementById('answers-grid');
  const progressLabel = document.getElementById('progress-label');
  const progressDots = document.getElementById('progress-dots');
  const feedbackLine = document.getElementById('feedback-line');
  const completionOverlay = document.getElementById('completion-overlay');
  const completionSpeaker = document.getElementById('completion-speaker');
  const tryAgainButton = document.getElementById('try-again');

  let rounds = [];
  let roundIndex = 0;
  let locked = false;
  let speechToken = 0;
  let preferredVoice = null;

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function chooseVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    preferredVoice = voices.find((voice) => voice.lang === 'en-US' && /jenny|aria|zira|samantha|google|english/i.test(voice.name))
      || voices.find((voice) => voice.lang.startsWith('en-US'))
      || voices.find((voice) => voice.lang.startsWith('en'))
      || null;
  }

  if ('speechSynthesis' in window) {
    chooseVoice();
    window.speechSynthesis.addEventListener('voiceschanged', chooseVoice);
  }

  function stopSpeech() {
    speechToken += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function speak(text, token = speechToken) {
    return new Promise((resolve) => {
      if (!text || token !== speechToken || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      utterance.pitch = 1.08;
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }

  function pause(milliseconds, token = speechToken) {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(token === speechToken), milliseconds);
    });
  }

  async function readCurrentQuestion() {
    stopSpeech();
    const token = speechToken;
    const round = rounds[roundIndex];
    await speak(round.main, token);
    if (round.detail && token === speechToken) {
      await pause(650, token);
      await speak(round.detail, token);
    }
  }

  function makeAnswerSpeaker(text) {
    const button = document.createElement('button');
    button.className = 'speaker-btn answer-listen';
    button.type = 'button';
    button.textContent = '🔊';
    button.setAttribute('aria-label', `Listen to: ${text}`);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (locked) return;
      stopSpeech();
      speak(text);
    });
    return button;
  }

  function makeMedalCard(medal, correctId) {
    const card = document.createElement('button');
    card.className = 'answer-card';
    card.type = 'button';
    card.dataset.answer = medal.id;
    card.setAttribute('aria-label', `${medal.label}, ${medal.ordinal}`);

    const picture = document.createElement('span');
    picture.className = 'medal-picture';
    picture.dataset.medal = medal.id;
    picture.setAttribute('aria-hidden', 'true');
    picture.innerHTML = `<span class="medal-sprite"></span><span class="ordinal-mark">${medal.ordinal}</span>`;

    const label = document.createElement('span');
    label.className = 'answer-label';
    label.textContent = medal.label;

    card.append(makeAnswerSpeaker(`${medal.label}. ${medal.ordinal}.`), picture, label);
    card.addEventListener('click', () => checkAnswer(card, medal.id === correctId, medal.label));
    return card;
  }

  function makeFinalCard(text) {
    const isKind = text === FINAL_QUESTION.correct;
    const card = document.createElement('button');
    card.className = 'answer-card final-answer';
    card.type = 'button';
    card.dataset.answer = text;

    const picture = document.createElement('img');
    picture.className = 'final-choice-picture';
    picture.src = isKind
      ? '../assets/images/reading/last-answer-kind.webp'
      : '../assets/images/reading/last-answer-unkind.webp';
    picture.alt = isKind
      ? 'A friend smiles, gives a thumbs-up, and shares a supportive high-five.'
      : 'A child crosses their arms, turns away, and responds unkindly.';

    const label = document.createElement('span');
    label.className = 'answer-label';
    label.textContent = text;

    card.append(makeAnswerSpeaker(text), picture, label);
    card.addEventListener('click', () => checkAnswer(card, isKind, text));
    return card;
  }

  function renderProgress() {
    progressLabel.textContent = `Question ${roundIndex + 1} of 4`;
    progressDots.innerHTML = '';
    for (let index = 0; index < 4; index += 1) {
      const dot = document.createElement('span');
      dot.className = 'progress-dot';
      if (index < roundIndex) dot.classList.add('done');
      if (index === roundIndex) dot.classList.add('current');
      progressDots.appendChild(dot);
    }
  }

  function renderRound({ readAloud = true } = {}) {
    locked = false;
    questionSpeaker.disabled = false;
    feedbackLine.textContent = '';
    feedbackLine.className = 'feedback-line';
    const round = rounds[roundIndex];

    questionMain.textContent = round.main;
    questionDetail.textContent = round.detail || '';
    questionDetail.hidden = !round.detail;
    const isFinalRound = round.type === 'final';
    questionPanel.classList.toggle('has-picture', isFinalRound);
    questionIllustration.hidden = !isFinalRound;
    answersGrid.innerHTML = '';
    answersGrid.classList.toggle('final-round', isFinalRound);
    renderProgress();

    if (round.type === 'medal') {
      shuffle(MEDALS).forEach((medal) => answersGrid.appendChild(makeMedalCard(medal, round.correct)));
    } else {
      shuffle(FINAL_QUESTION.options).forEach((option) => answersGrid.appendChild(makeFinalCard(option)));
    }

    if (readAloud) window.setTimeout(readCurrentQuestion, 380);
  }

  function setAnswersDisabled(disabled) {
    answersGrid.querySelectorAll('button').forEach((button) => {
      button.disabled = disabled;
    });
  }

  function playResultSound(correct) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const notes = correct ? [523, 659, 784] : [220, 175];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.09;
      oscillator.type = correct ? 'sine' : 'sawtooth';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(correct ? 0.14 : 0.055, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.2);
    });
  }

  async function checkAnswer(card, isCorrect, spokenAnswer) {
    if (locked) return;
    locked = true;
    questionSpeaker.disabled = true;
    stopSpeech();
    setAnswersDisabled(true);

    if (!isCorrect) {
      playResultSound(false);
      card.classList.add('is-wrong');
      feedbackLine.textContent = 'Try again!';
      feedbackLine.className = 'feedback-line try';
      await speak('Try again.');
      window.setTimeout(() => {
        card.classList.remove('is-wrong');
        setAnswersDisabled(false);
        feedbackLine.textContent = '';
        feedbackLine.className = 'feedback-line';
        questionSpeaker.disabled = false;
        locked = false;
      }, 420);
      return;
    }

    playResultSound(true);
    card.classList.add('is-correct');
    feedbackLine.textContent = 'Great choice!';
    feedbackLine.className = 'feedback-line good';
    const praise = rounds[roundIndex].type === 'medal'
      ? `That's right! ${spokenAnswer}.`
      : "That's right! It's okay! You tried your best!";
    await speak(praise);
    await pause(480);

    if (roundIndex < rounds.length - 1) {
      roundIndex += 1;
      renderRound();
    } else {
      completionOverlay.hidden = false;
      tryAgainButton.focus();
      stopSpeech();
      speak('Great job! You finished the Bike Race Day activity!');
    }
  }

  function startActivity() {
    stopSpeech();
    rounds = shuffle(MEDALS).map((medal) => ({
      type: 'medal',
      main: 'Which medal should I get?',
      detail: medal.detail,
      correct: medal.id
    }));
    rounds.push({ type: 'final', main: FINAL_QUESTION.main, detail: '', correct: FINAL_QUESTION.correct });
    roundIndex = 0;
    completionOverlay.hidden = true;
    renderRound();
  }

  introSpeaker.addEventListener('click', () => {
    if (locked) return;
    stopSpeech();
    speak('Medal Challenge. Listen carefully, then choose the right answer!');
  });
  questionSpeaker.addEventListener('click', () => {
    if (!locked) readCurrentQuestion();
  });
  completionSpeaker.addEventListener('click', () => {
    stopSpeech();
    speak('Great job! You finished the Bike Race Day activity!');
  });
  tryAgainButton.addEventListener('click', startActivity);
  window.addEventListener('pagehide', stopSpeech);

  startActivity();
})();
