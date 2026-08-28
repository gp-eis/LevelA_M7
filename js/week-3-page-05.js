(() => {
  const INTRO_AUDIO = '../assets/audio/week-3/literacy/page-05-intro.mp3';
  const ANSWER_AUDIO = '../assets/audio/week-3/literacy/page-05-answer.mp3';
  const QUESTION_VIDEO = '../assets/video/week-3/literacy/page-05-question.mp4';
  const ANSWER_ORDER = ['the', 'olympic', 'games'];
  const POSITIONS = [
    { left: 4, top: 61 },
    { left: 21, top: 55 },
    { left: 33, top: 66 },
    { left: 12, top: 73 },
    { left: 31, top: 79 },
    { left: 4, top: 86 },
    { left: 24, top: 90 }
  ];

  document.addEventListener('DOMContentLoaded', () => {
    const stage = document.querySelector('.week-3-words-stage');
    const choices = [...document.querySelectorAll('.word-choice')];
    const startLayer = document.getElementById('week-3-words-start');
    const startButton = document.getElementById('week-3-words-start-button');
    const restartButton = document.getElementById('week-3-words-restart');
    const questionButton = document.getElementById('week-3-words-question-speaker');
    const questionVideo = document.getElementById('week-3-words-question-video');
    const status = document.getElementById('week-3-words-status');
    const path = document.querySelector('.week-3-word-path');
    const pathLine = document.getElementById('week-3-word-path-line');
    const progressTokens = [...document.querySelectorAll('.week-3-sentence-progress [data-step]')];
    const completion = document.getElementById('week-3-words-completion');
    const completionVideo = document.getElementById('week-3-words-good-job-video');
    const completionClose = document.getElementById('week-3-words-completion-close');
    const completionTryAgain = document.getElementById('week-3-words-completion-try-again');
    let introAudio = null;
    let wordAudio = null;
    let answerAudio = null;
    let step = 0;
    let ready = false;
    let previousOrder = '';

    function shuffle(items) {
      const result = [...items];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
      }
      if (result.map((item) => item.dataset.word).join(',') === previousOrder) result.push(result.shift());
      previousOrder = result.map((item) => item.dataset.word).join(',');
      return result;
    }

    function positionChoices() {
      shuffle(choices).forEach((choice, index) => {
        choice.style.left = `${POSITIONS[index].left}%`;
        choice.style.top = `${POSITIONS[index].top}%`;
      });
    }

    function setReady(enabled) {
      ready = enabled;
      choices.forEach((choice) => { choice.disabled = !enabled || choice.classList.contains('is-correct'); });
    }

    function updatePath() {
      if (step === 0) {
        path.classList.remove('is-visible');
        pathLine.setAttribute('points', '');
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      const points = ANSWER_ORDER.map((word) => {
        const rect = choices.find((choice) => choice.dataset.word === word).getBoundingClientRect();
        return `${rect.left - stageRect.left + rect.width / 2},${rect.top - stageRect.top + rect.height / 2}`;
      });
      path.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
      pathLine.setAttribute('points', points.join(' '));
      path.classList.add('is-visible');
    }

    function updateProgress() {
      progressTokens.forEach((token, index) => {
        if (index < step) {
          token.classList.add('is-filled');
        } else {
          token.classList.remove('is-filled');
        }
      });
      choices.forEach((choice) => choice.classList.remove('is-next'));
      if (step > 0 && step < ANSWER_ORDER.length) {
        choices.find((choice) => choice.dataset.word === ANSWER_ORDER[step]).classList.add('is-next');
      }
      updatePath();
    }

    function playWord(choice) {
      if (wordAudio) wordAudio.pause();
      wordAudio = new Audio(choice.dataset.audio);
      wordAudio.play().catch(() => {});
      return wordAudio;
    }

    function playQuestion() {
      setReady(false);
      questionButton.disabled = true;
      status.textContent = 'Listen to the question.';
      questionVideo.src = QUESTION_VIDEO;
      questionVideo.currentTime = 0;
      questionVideo.load();
      questionVideo.play().catch(() => {
        setReady(true);
        questionButton.disabled = false;
        status.textContent = 'Choose the first word.';
      });
    }

    function resetActivity() {
      step = 0;
      choices.forEach((choice) => choice.classList.remove('is-correct', 'is-wrong', 'is-next'));
      positionChoices();
      updateProgress();
      setReady(false);
    }

    function hideCompletion() {
      completionVideo.pause();
      completionVideo.currentTime = 0;
      completion.hidden = true;
    }

    function showCompletion() {
      completion.hidden = false;
      completionVideo.currentTime = 0;
      completionVideo.play().catch(() => {
        if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish('Great job!');
      });
    }

    function playFullAnswer() {
      answerAudio = new Audio(ANSWER_AUDIO);
      answerAudio.addEventListener('ended', showCompletion, { once: true });
      answerAudio.play().catch(showCompletion);
    }

    function beginActivity() {
      if (introAudio) introAudio.pause();
      if (wordAudio) wordAudio.pause();
      if (answerAudio) answerAudio.pause();
      questionVideo.pause();
      hideCompletion();
      startLayer.hidden = true;
      resetActivity();
      status.className = 'week-3-words-status';
      status.textContent = 'Listen to the directions.';
      introAudio = new Audio(INTRO_AUDIO);
      introAudio.addEventListener('ended', playQuestion, { once: true });
      introAudio.play().catch(playQuestion);
    }

    function choose(choice) {
      if (!ready || choice.classList.contains('is-correct')) return;
      playWord(choice);
      const expected = ANSWER_ORDER[step];
      if (choice.dataset.word !== expected) {
        choice.classList.remove('is-wrong');
        void choice.offsetWidth;
        choice.classList.add('is-wrong');
        status.className = 'week-3-words-status is-wrong';
        status.textContent = `Try again. Find “${expected}”.`;
        window.setTimeout(() => choice.classList.remove('is-wrong'), 700);
        return;
      }

      choice.classList.add('is-correct');
      choice.disabled = true;
      step += 1;
      updateProgress();
      status.className = 'week-3-words-status is-correct';
      if (step < ANSWER_ORDER.length) {
        status.textContent = `Good! Now find “${ANSWER_ORDER[step]}”.`;
        return;
      }

      setReady(false);
      status.textContent = 'It’s the Olympic Games!';
      window.setTimeout(playFullAnswer, 950);
    }

    choices.forEach((choice) => choice.addEventListener('click', () => choose(choice)));
    questionVideo.addEventListener('ended', () => {
      setReady(true);
      questionButton.disabled = false;
      status.textContent = 'Choose the first word.';
    });
    questionButton.addEventListener('click', playQuestion);
    startButton.addEventListener('click', beginActivity);
    restartButton.addEventListener('click', beginActivity);
    completionClose.addEventListener('click', hideCompletion);
    completionTryAgain.addEventListener('click', beginActivity);
    completionVideo.addEventListener('ended', () => {
      if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish('Great job!');
    });
    window.addEventListener('resize', updatePath);

    resetActivity();
  });
})();
