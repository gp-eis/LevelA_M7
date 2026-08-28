(() => {
  const REQUIRED = 7;
  const buttons = [...document.querySelectorAll('.continent-hotspot')];
  const intro = document.getElementById('continent-intro-audio');
  const nameAudio = document.getElementById('continent-name-audio');
  const replay = document.getElementById('continent-intro-replay');
  const startLayer = document.getElementById('continent-start');
  const startButton = document.getElementById('continent-start-button');
  const status = document.getElementById('continent-status');
  const completion = document.getElementById('continent-completion');
  const celebration = document.getElementById('continent-good-job-video');
  const closeButton = document.getElementById('continent-completion-close');
  const tryAgain = document.getElementById('continent-try-again');
  let selected = 0;

  const playIntro = () => {
    nameAudio.pause();
    intro.currentTime = 0;
    intro.play().catch(() => {});
  };

  const playName = (button) => {
    intro.pause();
    nameAudio.pause();
    if (button.dataset.audio) {
      nameAudio.src = button.dataset.audio;
      nameAudio.currentTime = 0;
      nameAudio.play().catch(() => speakAmericanEnglish(button.dataset.continent, {rate:.82, pitch:1.05}));
      return;
    }
    if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish(button.dataset.continent, {rate:.82, pitch:1.05});
  };

  const enableContinents = (enabled) => buttons.forEach((button) => { button.disabled = !enabled; });

  const showCompletion = () => {
    enableContinents(false);
    status.textContent = 'Great job! You circled all seven continents!';
    completion.hidden = false;
    celebration.currentTime = 0;
    celebration.play().catch(() => {});
  };

  const reset = () => {
    selected = 0;
    celebration.pause();
    completion.hidden = true;
    buttons.forEach((button) => {
      button.classList.remove('is-selected');
      button.setAttribute('aria-pressed', 'false');
      button.disabled = false;
    });
    status.textContent = 'Circle all the continents.';
    playIntro();
  };

  startButton.addEventListener('click', () => {
    startLayer.hidden = true;
    replay.disabled = false;
    enableContinents(true);
    status.textContent = 'Circle all the continents.';
    playIntro();
  });

  replay.addEventListener('click', playIntro);

  buttons.forEach((button) => button.addEventListener('click', () => {
    playName(button);
    if (!button.classList.contains('is-selected')) {
      button.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
      selected += 1;
    }
    status.textContent = selected === REQUIRED ? 'Great job! You circled all seven continents!' : `${selected} of ${REQUIRED} continents circled.`;
    if (selected === REQUIRED) setTimeout(showCompletion, 650);
  }));

  closeButton.addEventListener('click', () => {
    celebration.pause();
    completion.hidden = true;
  });
  tryAgain.addEventListener('click', reset);
})();
