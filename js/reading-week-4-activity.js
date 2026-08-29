(() => {
  const IMAGE_ROOT = '../assets/images/week-4/reading/activity';
  const ROUNDS = [
    {
      question: 'What did the children see at the stadium?',
      questionAlt: 'Two children arrive at an international sports stadium.',
      choices: [
        { text: 'Many flags.', alt: 'Many colorful flags around a stadium.', correct: true },
        { text: 'Birthday balloons.', alt: 'Colorful balloons and party hats.' },
        { text: 'Zoo animals.', alt: 'A giraffe, elephant, and lion at a zoo.' }
      ]
    },
    {
      question: 'What did the boy do when his friend fell?',
      questionAlt: 'A girl has a harmless tumble on the field and her friend notices.',
      choices: [
        { text: 'He helped her.', alt: 'The boy kindly helps the girl stand up.', correct: true },
        { text: 'He laughed at her.', alt: 'The boy laughs while the girl feels sad.' },
        { text: 'He walked away.', alt: 'The boy walks away while the girl sits alone.' }
      ]
    },
    {
      question: 'What do the children do together?',
      questionAlt: 'Children enjoy an international sports celebration together.',
      choices: [
        { text: 'They cheer, clap, and smile.', alt: 'A diverse group of children cheer and clap together.', correct: true },
        { text: 'They argue and shout.', alt: 'Two children argue with crossed arms.' },
        { text: 'They ignore everyone.', alt: 'Children sit apart and ignore one another.' }
      ]
    },
    {
      question: 'What can you do when a new friend comes from another country?',
      questionAlt: 'A new child arrives while a friendly group plays at a playground.',
      choices: [
        { text: 'Welcome them and include them.', alt: 'Children warmly invite a new friend to play.', correct: true },
        { text: 'Leave them alone.', alt: 'A new child sits alone while others play far away.' },
        { text: 'Say they cannot play.', alt: 'Two children make a stop gesture instead of including the new child.' }
      ]
    }
  ];

  const questionMain = document.getElementById('question-main');
  const questionImage = document.getElementById('question-image');
  const introSpeaker = document.getElementById('intro-speaker');
  const questionSpeaker = document.getElementById('question-speaker');
  const answersGrid = document.getElementById('answers-grid');
  const progressLabel = document.getElementById('progress-label');
  const progressDots = document.getElementById('progress-dots');
  const feedbackLine = document.getElementById('feedback-line');
  const completionOverlay = document.getElementById('completion-overlay');
  const completionSpeaker = document.getElementById('completion-speaker');
  const tryAgainButton = document.getElementById('try-again');
  let roundIndex = 0;
  let locked = false;
  let voice = null;

  function chooseVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    voice = voices.find((item) => /^en[-_]US$/i.test(item.lang || '') && /jenny|aria|zira|samantha|google|english/i.test(item.name))
      || voices.find((item) => /^en/i.test(item.lang || '')) || null;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    utterance.pitch = 1.06;
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function updateProgress() {
    progressLabel.textContent = `Question ${roundIndex + 1} of ${ROUNDS.length}`;
    progressDots.innerHTML = '';
    ROUNDS.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'progress-dot';
      if (index < roundIndex) dot.classList.add('done');
      if (index === roundIndex) dot.classList.add('current');
      progressDots.appendChild(dot);
    });
  }

  function setLocked(value) {
    locked = value;
    questionSpeaker.disabled = value;
    answersGrid.querySelectorAll('button').forEach((button) => { button.disabled = value; });
  }

  function playTone(correct) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const notes = correct ? [523, 659, 784] : [220, 175];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * .09;
      oscillator.type = correct ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(correct ? .13 : .05, start + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .19);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + .2);
    });
  }

  function makeChoice(choice, sourceIndex) {
    const card = document.createElement('div');
    card.className = 'answer-card';
    const listen = document.createElement('button');
    listen.className = 'speaker-btn answer-listen';
    listen.type = 'button';
    listen.textContent = '🔊';
    listen.setAttribute('aria-label', `Listen to: ${choice.text}`);
    listen.addEventListener('click', () => { if (!locked) speak(choice.text); });
    const select = document.createElement('button');
    select.className = 'answer-select';
    select.type = 'button';
    const image = document.createElement('img');
    image.className = 'answer-image';
    image.src = `${IMAGE_ROOT}/q${roundIndex + 1}-answer-${sourceIndex + 1}.webp`;
    image.alt = choice.alt;
    const label = document.createElement('span');
    label.className = 'answer-label';
    label.textContent = choice.text;
    select.append(image, label);
    select.setAttribute('aria-label', choice.text);
    select.addEventListener('click', () => checkAnswer(card, choice));
    card.append(listen, select);
    return card;
  }

  function renderRound() {
    const round = ROUNDS[roundIndex];
    locked = false;
    feedbackLine.textContent = '';
    feedbackLine.className = 'feedback-line';
    questionMain.textContent = round.question;
    questionImage.src = `${IMAGE_ROOT}/q${roundIndex + 1}-question.webp`;
    questionImage.alt = round.questionAlt;
    answersGrid.innerHTML = '';
    updateProgress();
    shuffle(round.choices.map((choice, sourceIndex) => ({ choice, sourceIndex })))
      .forEach(({ choice, sourceIndex }) => answersGrid.appendChild(makeChoice(choice, sourceIndex)));
    window.setTimeout(() => speak(round.question), 350);
  }

  function checkAnswer(card, choice) {
    if (locked) return;
    setLocked(true);
    playTone(Boolean(choice.correct));
    if (!choice.correct) {
      card.classList.add('is-wrong');
      feedbackLine.textContent = 'Try again!';
      feedbackLine.className = 'feedback-line try';
      speak('Try again.');
      window.setTimeout(() => {
        card.classList.remove('is-wrong');
        feedbackLine.textContent = '';
        feedbackLine.className = 'feedback-line';
        setLocked(false);
      }, 750);
      return;
    }
    card.classList.add('is-correct');
    feedbackLine.textContent = 'Great choice!';
    feedbackLine.className = 'feedback-line good';
    speak(`That's right! ${choice.text}`);
    window.setTimeout(() => {
      if (roundIndex < ROUNDS.length - 1) {
        roundIndex += 1;
        renderRound();
      } else {
        completionOverlay.hidden = false;
        tryAgainButton.focus();
        speak('Great job! You finished the We Are Friends activity!');
      }
    }, 1400);
  }

  function restart() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    roundIndex = 0;
    completionOverlay.hidden = true;
    renderRound();
  }

  if ('speechSynthesis' in window) {
    chooseVoice();
    window.speechSynthesis.addEventListener('voiceschanged', chooseVoice);
  }
  introSpeaker.addEventListener('click', () => speak('Friendship Challenge. Look, listen, and choose the right answer!'));
  questionSpeaker.addEventListener('click', () => { if (!locked) speak(ROUNDS[roundIndex].question); });
  completionSpeaker.addEventListener('click', () => speak('Great job! You finished the We Are Friends activity!'));
  tryAgainButton.addEventListener('click', restart);
  window.addEventListener('pagehide', () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); });
  renderRound();
})();
