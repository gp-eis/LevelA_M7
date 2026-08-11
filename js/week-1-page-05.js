(() => {
  const QUESTION = 'Who won the race?';
  const INTRO = 'Did you do well? Yes, I won!';
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

  document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-race-activity');
    const questionButton = document.getElementById('speak-race-question');
    const questionText = document.getElementById('race-question');
    const runners = [...document.querySelectorAll('.race-runner')];
    const feedback = document.getElementById('race-feedback');
    const feedbackText = document.getElementById('race-feedback-text');
    const answerButton = document.getElementById('speak-race-answer');
    const videoOverlay = document.getElementById('race-good-job-overlay');
    const goodJobVideo = document.getElementById('race-good-job-video');
    const videoPlayButton = document.getElementById('race-video-play');

    let ready = false;
    let busy = false;
    let selectedSentence = '';

    function setRunnersEnabled(enabled) {
      runners.forEach((runner) => { runner.disabled = !enabled; });
    }

    function resetRunnerStyles() {
      runners.forEach((runner) => runner.classList.remove('is-wrong', 'is-correct'));
      feedback.classList.remove('is-wrong', 'is-correct');
    }

    async function startActivity() {
      if (busy) return;
      busy = true;
      ready = false;
      stopSpeech();
      setRunnersEnabled(false);
      resetRunnerStyles();
      startButton.hidden = true;
      questionButton.hidden = true;
      answerButton.hidden = true;
      questionText.textContent = 'Listen to the athletes.';
      feedbackText.textContent = 'Listen, then choose athlete A, B, or C.';

      await speak(INTRO);
      questionText.textContent = QUESTION;
      questionButton.hidden = false;
      await speak(QUESTION);

      busy = false;
      ready = true;
      setRunnersEnabled(true);
    }

    function playGoodJobVideo() {
      const source = goodJobVideo.dataset.src;
      if (!goodJobVideo.src && source) goodJobVideo.src = source;
      videoOverlay.hidden = false;
      videoPlayButton.hidden = true;
      goodJobVideo.currentTime = 0;
      goodJobVideo.play().catch(() => {
        videoPlayButton.hidden = false;
      });
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

    startButton.addEventListener('click', startActivity);
    questionButton.addEventListener('click', () => speak(QUESTION));
    answerButton.addEventListener('click', () => speak(selectedSentence));
    runners.forEach((runner) => runner.addEventListener('click', () => chooseRunner(runner)));
    videoPlayButton.addEventListener('click', () => {
      videoPlayButton.hidden = true;
      goodJobVideo.play().catch(() => { videoPlayButton.hidden = false; });
    });
    goodJobVideo.addEventListener('ended', () => {
      videoOverlay.hidden = true;
      feedbackText.textContent = 'Great job! C won the race.';
    });
  });
})();
