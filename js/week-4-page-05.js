(() => {
  const answer = ['c', 'o', 'u', 'n', 't', 'r', 'i', 'e', 's'];
  const buttons = [...document.querySelectorAll('.letter-hotspot')];
  const intro = document.getElementById('countries-intro-audio');
  const letterAudio = document.getElementById('countries-letter-audio');
  const wordAudio = document.getElementById('countries-word-audio');
  const replay = document.getElementById('countries-intro-replay');
  const startLayer = document.getElementById('countries-start');
  const startButton = document.getElementById('countries-start-button');
  const status = document.getElementById('countries-status');
  const path = document.getElementById('countries-path-line');
  const word = document.getElementById('countries-word');
  const wordLetters = [...word.querySelectorAll('.countries-word-letter')];
  const tryAgain = document.getElementById('countries-try-again');
  const completion = document.getElementById('countries-completion');
  const celebration = document.getElementById('countries-good-job-video');
  const closeCompletion = document.getElementById('countries-completion-close');
  const popupTryAgain = document.getElementById('countries-popup-try-again');
  const wrongTimers = new WeakMap();
  let step = 0;

  const enableLetters = (enabled) => buttons.forEach((button) => { button.disabled = !enabled || button.classList.contains('is-selected'); });
  const play = (audio) => { audio.currentTime = 0; audio.play().catch(() => {}); };
  const playIntro = () => { letterAudio.pause(); wordAudio.pause(); play(intro); };
  const playLetter = (button) => {
    intro.pause(); wordAudio.pause();
    letterAudio.src = button.dataset.audio;
    play(letterAudio);
  };
  const updatePath = () => {
    const points = buttons.filter((button) => button.classList.contains('is-selected')).map((button) => `${button.dataset.x},${button.dataset.y}`);
    path.setAttribute('points', points.join(' '));
  };
  const showCompletion = () => {
    if (step !== answer.length) return;
    completion.hidden = false;
    celebration.currentTime = 0;
    celebration.play().catch(() => {});
  };
  const complete = () => {
    enableLetters(false);
    word.classList.add('is-complete');
    tryAgain.hidden = false;
    status.textContent = 'Great job! You spelled countries!';
    wordAudio.addEventListener('ended', showCompletion, { once: true });
    letterAudio.addEventListener('ended', () => play(wordAudio), { once: true });
  };
  const reset = () => {
    step = 0;
    celebration.pause();
    completion.hidden = true;
    buttons.forEach((button) => {
      clearTimeout(wrongTimers.get(button));
      button.classList.remove('is-selected', 'is-wrong');
      button.setAttribute('aria-pressed', 'false');
      button.disabled = false;
    });
    path.setAttribute('points', '');
    word.classList.remove('is-complete');
    wordLetters.forEach((letter) => letter.classList.remove('is-revealed'));
    tryAgain.hidden = true;
    status.textContent = 'Start with c, then follow the word below.';
    playIntro();
  };

  startButton.addEventListener('click', () => {
    startLayer.hidden = true;
    replay.disabled = false;
    enableLetters(true);
    status.textContent = 'Start with c, then follow the word below.';
    playIntro();
  });
  replay.addEventListener('click', playIntro);
  word.addEventListener('click', () => play(wordAudio));
  tryAgain.addEventListener('click', reset);
  popupTryAgain.addEventListener('click', reset);
  closeCompletion.addEventListener('click', () => {
    celebration.pause();
    completion.hidden = true;
  });

  buttons.forEach((button) => button.addEventListener('click', () => {
    playLetter(button);
    if (button.dataset.letter === answer[step]) {
      button.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
      button.disabled = true;
      wordLetters[step].classList.add('is-revealed');
      step += 1;
      updatePath();
      status.textContent = step === answer.length ? 'Great job! You spelled countries!' : `${step} of ${answer.length} letters connected. Next: ${answer[step]}.`;
      if (step === answer.length) complete();
      return;
    }

    button.classList.remove('is-wrong');
    void button.offsetWidth;
    button.classList.add('is-wrong');
    clearTimeout(wrongTimers.get(button));
    wrongTimers.set(button, setTimeout(() => {
      button.classList.remove('is-wrong');
      wrongTimers.delete(button);
    }, 900));
    status.textContent = `Try again. Find the letter ${answer[step]}.`;
  }));
})();
