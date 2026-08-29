(() => {
  const ASSET = '../assets/images/week-2/reading/activity/';
  const ROUNDS = [
    {
      question: 'What is the girl practicing?',
      picture: 'q1-question.webp',
      pictureAlt: 'A girl holds a blue yo-yo and thinks about how to use it.',
      options: [
        { text: 'She is practicing with a yo-yo.', image: 'q1-yoyo.webp', alt: 'The girl practices with a blue yo-yo.', correct: true },
        { text: 'She is practicing soccer.', image: 'q1-soccer.webp', alt: 'The girl kicks a soccer ball.' }
      ]
    },
    {
      question: 'Which way does the yo-yo move?',
      picture: 'q2-question.webp',
      pictureAlt: 'A girl watches her blue yo-yo move on its string.',
      options: [
        { text: 'It moves up and down.', image: 'q2-up-down.webp', alt: 'A yo-yo moves up and down on a vertical string.', correct: true },
        { text: 'It moves side to side.', image: 'q2-side-to-side.webp', alt: 'A yo-yo moves from side to side.' }
      ]
    },
    {
      question: 'What helps the girl learn to use the yo-yo?',
      picture: 'q3-question.webp',
      pictureAlt: 'The girl thinks after a difficult yo-yo try.',
      options: [
        { text: 'She practices again and again.', image: 'q3-practice-again.webp', alt: 'The girl practices the yo-yo several times.', correct: true },
        { text: 'She gives up and walks away.', image: 'q3-give-up.webp', alt: 'The girl leaves the yo-yo on a bench and walks away.' }
      ]
    },
    {
      question: 'What should you do when something is hard?',
      picture: 'q4-question.webp',
      pictureAlt: 'The girl thinks about what to do after a difficult yo-yo try.',
      options: [
        { text: 'Keep practicing and try again.', image: 'q4-keep-practicing.webp', alt: 'The girl keeps practicing and starts to succeed.', correct: true },
        { text: 'Give up right away.', image: 'q4-give-up.webp', alt: 'The girl gives up and leaves the yo-yo on the ground.' }
      ]
    }
  ];

  const question = document.getElementById('reading-question');
  const questionPicture = document.getElementById('reading-question-picture');
  const questionSpeaker = document.getElementById('reading-question-speaker');
  const introSpeaker = document.getElementById('reading-intro-speaker');
  const answers = document.getElementById('reading-answers');
  const progressLabel = document.getElementById('reading-progress-label');
  const progressDots = document.getElementById('reading-progress-dots');
  const feedback = document.getElementById('reading-feedback');
  const completion = document.getElementById('reading-completion');
  const completionSpeaker = document.getElementById('reading-completion-speaker');
  const tryAgain = document.getElementById('reading-try-again');
  let roundIndex = 0;
  let locked = false;

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function speak(text) {
    if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish(text, { rate: .82, pitch: 1.05 });
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function playResultSound(correct) {
    if (typeof playTone !== 'function') return;
    if (correct) {
      playTone(523.25, .12, .11, 'triangle');
      playTone(659.25, .14, .1, 'triangle', .11);
      playTone(783.99, .18, .09, 'triangle', .22);
    } else {
      playTone(220, .14, .08, 'sine');
      playTone(174.61, .18, .07, 'sine', .12);
    }
  }

  function renderProgress() {
    progressLabel.textContent = `Question ${roundIndex + 1} of ${ROUNDS.length}`;
    progressDots.replaceChildren();
    ROUNDS.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'reading-progress-dot';
      if (index < roundIndex) dot.classList.add('done');
      if (index === roundIndex) dot.classList.add('current');
      progressDots.appendChild(dot);
    });
  }

  function setCardsDisabled(disabled) {
    answers.querySelectorAll('.reading-answer-card').forEach(card => {
      card.dataset.disabled = String(disabled);
      card.tabIndex = disabled ? -1 : 0;
      card.setAttribute('aria-disabled', String(disabled));
    });
    answers.querySelectorAll('.reading-answer-listen').forEach(button => { button.disabled = disabled; });
  }

  function chooseOption(card, option) {
    if (locked || card.dataset.disabled === 'true') return;
    locked = true;
    stopSpeech();
    questionSpeaker.disabled = true;
    setCardsDisabled(true);
    if (!option.correct) {
      playResultSound(false);
      card.classList.add('is-wrong');
      feedback.textContent = 'Try again!';
      feedback.className = 'reading-feedback try';
      speak('Try again.');
      window.setTimeout(() => {
        card.classList.remove('is-wrong');
        feedback.textContent = '';
        feedback.className = 'reading-feedback';
        questionSpeaker.disabled = false;
        setCardsDisabled(false);
        locked = false;
      }, 780);
      return;
    }
    playResultSound(true);
    card.classList.add('is-correct');
    feedback.textContent = 'Great choice!';
    feedback.className = 'reading-feedback good';
    speak(`That's right! ${option.text}`);
    window.setTimeout(() => {
      if (roundIndex < ROUNDS.length - 1) {
        roundIndex += 1;
        renderRound();
      } else {
        locked = false;
        completion.hidden = false;
        tryAgain.focus();
        speak('Great job! You finished the Yo-Yo Challenge. Keep practicing and trying again!');
      }
    }, 1800);
  }

  function makeAnswerCard(option) {
    const card = document.createElement('div');
    card.className = 'reading-answer-card';
    card.role = 'button';
    card.tabIndex = 0;
    card.dataset.disabled = 'false';
    card.setAttribute('aria-label', option.text);

    const listen = document.createElement('button');
    listen.className = 'reading-speaker reading-answer-listen';
    listen.type = 'button';
    listen.textContent = '🔊';
    listen.setAttribute('aria-label', `Listen to: ${option.text}`);
    listen.addEventListener('click', event => {
      event.stopPropagation();
      if (!locked) speak(option.text);
    });

    const picture = document.createElement('img');
    picture.className = 'reading-answer-picture';
    picture.src = ASSET + option.image;
    picture.alt = option.alt;
    picture.width = 512;
    picture.height = 512;

    const label = document.createElement('span');
    label.className = 'reading-answer-label';
    label.textContent = option.text;
    card.append(listen, picture, label);
    card.addEventListener('click', () => chooseOption(card, option));
    card.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      chooseOption(card, option);
    });
    return card;
  }

  function renderRound() {
    locked = false;
    questionSpeaker.disabled = false;
    feedback.textContent = '';
    feedback.className = 'reading-feedback';
    const round = ROUNDS[roundIndex];
    question.textContent = round.question;
    questionPicture.src = ASSET + round.picture;
    questionPicture.alt = round.pictureAlt;
    answers.replaceChildren();
    answers.classList.toggle('two-answers', round.options.length === 2);
    shuffle(round.options).forEach(option => answers.appendChild(makeAnswerCard(option)));
    renderProgress();
    window.setTimeout(() => { if (!locked) speak(round.question); }, 380);
  }

  function restart() {
    stopSpeech();
    roundIndex = 0;
    completion.hidden = true;
    renderRound();
  }

  introSpeaker.addEventListener('click', () => speak('Yo-Yo Challenge. Listen carefully, then choose the right answer!'));
  questionSpeaker.addEventListener('click', () => { if (!locked) speak(ROUNDS[roundIndex].question); });
  completionSpeaker.addEventListener('click', () => speak('Great job! You finished the Yo-Yo Challenge. Keep practicing and trying again!'));
  tryAgain.addEventListener('click', restart);
  window.addEventListener('pagehide', stopSpeech);
  renderRound();
})();
