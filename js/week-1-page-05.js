(() => {
  const QUESTION = 'Who won the race?';
  const INTRO = 'Did you do well? Yes, I won the race.';
  const RUNNER_SENTENCES = {
    A: 'I am last.',
    B: 'I am second.',
    C: 'I am first.'
  };

  let usVoice = null;
  let speechToken = 0;

  function chooseUsVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const isUsEnglish = (voice) => /^en[-_]US$/i.test(voice.lang || '');
    usVoice = voices.find((voice) => isUsEnglish(voice) && /google|samantha|zira|jenny|aria|english/i.test(voice.name))
      || voices.find(isUsEnglish)
      || null;
  }

  function stopSpeech() {
    speechToken += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function speak(text) {
    const token = ++speechToken;
    return new Promise((resolve) => {
      if (!text || !('speechSynthesis' in window) || (typeof soundEnabled !== 'undefined' && !soundEnabled)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.84;
      utterance.pitch = 1.04;
      if (usVoice) utterance.voice = usVoice;

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        window.clearTimeout(fallbackTimer);
        resolve();
      };
      const fallbackTimer = window.setTimeout(finish, Math.max(3200, text.length * 125));
      utterance.onend = finish;
      utterance.onerror = finish;

      if (token !== speechToken) {
        finish();
        return;
      }
      window.speechSynthesis.speak(utterance);
    });
  }

  function delay(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const questionButton = document.getElementById('speak-race-question');
    const runners = [...document.querySelectorAll('.race-runner')];
    const feedback = document.getElementById('race-feedback');
    const feedbackText = document.getElementById('race-feedback-text');
    const answerButton = document.getElementById('speak-race-answer');
    const videoOverlay = document.getElementById('race-good-job-overlay');
    const goodJobVideo = document.getElementById('race-good-job-video');
    const videoCloseButton = document.getElementById('race-video-close');
    const tryAgainButton = document.getElementById('race-try-again');
    const startLayer = document.getElementById('page5-start-layer');
    const startButton = document.getElementById('page5-start-button');

    let ready = false;
    let busy = false;
    let selectedSentence = '';

    function setRunnersEnabled(enabled) {
      runners.forEach((runner) => {
        runner.disabled = !enabled;
        runner.classList.toggle('is-ready', enabled);
      });
    }

    function resetRunnerStyles() {
      runners.forEach((runner) => runner.classList.remove('is-wrong', 'is-correct'));
      feedback.classList.remove('is-wrong', 'is-correct');
    }

    async function startActivity() {
      if (busy) return;
      startLayer.hidden = true;
      busy = true;
      ready = false;
      stopSpeech();
      setRunnersEnabled(false);
      resetRunnerStyles();
      questionButton.disabled = true;
      answerButton.hidden = true;
      goodJobVideo.pause();
      goodJobVideo.currentTime = 0;
      videoOverlay.hidden = true;
      feedbackText.textContent = 'Listen, then choose athlete A, B, or C.';

      await speak(INTRO);
      await delay(1000);
      await speak(QUESTION);

      busy = false;
      ready = true;
      questionButton.disabled = false;
      setRunnersEnabled(true);
    }

    function playGoodJobVideo() {
      const source = goodJobVideo.dataset.src;
      if (!goodJobVideo.src && source) goodJobVideo.src = source;
      videoOverlay.hidden = false;
      goodJobVideo.currentTime = 0;
      goodJobVideo.play().catch(() => {});
    }

    function closeGoodJobVideo() {
      goodJobVideo.pause();
      goodJobVideo.currentTime = 0;
      videoOverlay.hidden = true;
      feedbackText.textContent = 'Great job! C won the race.';
    }

    async function chooseRunner(runner) {
      if (!ready || busy) return;
      busy = true;
      ready = false;
      stopSpeech();
      setRunnersEnabled(false);
      resetRunnerStyles();

      const runnerName = runner.dataset.runner;
      selectedSentence = RUNNER_SENTENCES[runnerName];
      const correct = runnerName === 'C';
      runner.classList.add(correct ? 'is-correct' : 'is-wrong');
      feedback.classList.add(correct ? 'is-correct' : 'is-wrong');
      feedbackText.textContent = selectedSentence;
      answerButton.hidden = false;

      if (!correct && typeof playWrongSound === 'function') playWrongSound();
      await speak(selectedSentence);

      if (correct) {
        playGoodJobVideo();
        busy = false;
        return;
      }

      busy = false;
      ready = true;
      setRunnersEnabled(true);
    }

    if ('speechSynthesis' in window) {
      chooseUsVoice();
      window.speechSynthesis.addEventListener('voiceschanged', chooseUsVoice);
    }

    questionButton.addEventListener('click', () => speak(QUESTION));
    answerButton.addEventListener('click', () => speak(selectedSentence));
    runners.forEach((runner) => runner.addEventListener('click', () => chooseRunner(runner)));
    videoCloseButton.addEventListener('click', closeGoodJobVideo);
    startButton.addEventListener('click', startActivity);
    tryAgainButton.addEventListener('click', startActivity);
    goodJobVideo.addEventListener('ended', () => {
      feedbackText.textContent = 'Great job! C won the race.';
    });
    setRunnersEnabled(false);
    questionButton.disabled = true;
    answerButton.hidden = true;
    feedbackText.textContent = 'Press Start Activity when you are ready.';
  });
})();
