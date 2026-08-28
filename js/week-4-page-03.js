(() => {
  const REQUIRED = 5;
  const buttons = [...document.querySelectorAll('.year-hotspot')];
  const intro = document.getElementById('year-intro-audio');
  const elementAudio = document.getElementById('year-element-audio');
  const replay = document.getElementById('year-intro-replay');
  const startLayer = document.getElementById('year-start');
  const startButton = document.getElementById('year-start-button');
  const status = document.getElementById('year-status');
  const completion = document.getElementById('year-completion');
  const celebration = document.getElementById('year-good-job-video');
  const closeButton = document.getElementById('year-completion-close');
  const tryAgain = document.getElementById('year-try-again');
  const wrongTimers = new WeakMap();
  let selected = 1;

  const playIntro = () => {
    elementAudio.pause();
    intro.currentTime = 0;
    intro.play().catch(() => {});
  };

  const playYear = (button) => {
    intro.pause();
    if (!button.dataset.audio) {
      elementAudio.pause();
      elementAudio.removeAttribute('src');
      return;
    }
    elementAudio.src = button.dataset.audio;
    elementAudio.currentTime = 0;
    elementAudio.play().catch(() => {});
  };

  const enableYears = (enabled) => buttons.forEach((button) => { button.disabled = !enabled; });

  const showCompletion = () => {
    enableYears(false);
    status.textContent = 'You found every fourth year!';
    completion.hidden = false;
    celebration.currentTime = 0;
    celebration.play().catch(() => {});
  };

  const reset = () => {
    selected = 1;
    celebration.pause();
    completion.hidden = true;
    buttons.forEach((button) => {
      clearTimeout(wrongTimers.get(button));
      button.classList.remove('is-correct', 'is-wrong');
      button.setAttribute('aria-pressed', button.dataset.given === 'true' ? 'true' : 'false');
      button.disabled = false;
    });
    status.textContent = '1896 is the starting year. Choose the next four years.';
    playIntro();
  };

  startButton.addEventListener('click', () => {
    startLayer.hidden = true;
    replay.disabled = false;
    enableYears(true);
    status.textContent = '1896 is the starting year. Choose the next four years.';
    playIntro();
  });

  replay.addEventListener('click', playIntro);

  buttons.forEach((button) => button.addEventListener('click', () => {
    playYear(button);
    if (button.dataset.given === 'true') {
      status.textContent = '1896 is the starting year. Count four years to find the next answer.';
      return;
    }
    if (button.dataset.correct === 'true') {
      if (!button.classList.contains('is-correct')) {
        button.classList.add('is-correct');
        button.setAttribute('aria-pressed', 'true');
        selected += 1;
      }
      status.textContent = selected === REQUIRED ? 'You found every fourth year!' : `${selected - 1} of ${REQUIRED - 1} answers found.`;
      if (selected === REQUIRED) setTimeout(showCompletion, 650);
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
    status.textContent = `${button.dataset.year} is not every fourth year. Try again!`;
  }));

  closeButton.addEventListener('click', () => {
    celebration.pause();
    completion.hidden = true;
  });
  tryAgain.addEventListener('click', reset);
})();
