(() => {
  const INTRO_AUDIO = '../assets/audio/week-3/literacy/page-06-intro.mp3';
  const QUESTION_ORDER = ['usa', 'greece', 'brazil', 'uk', 'australia'];
  const COUNTRY_NAMES = { usa: 'USA', greece: 'Greece', brazil: 'Brazil', uk: 'UK', australia: 'Australia', mexico: 'Mexico', germany: 'Germany', 'south-korea': 'South Korea', china: 'China', france: 'France' };

  document.addEventListener('DOMContentLoaded', () => {
    const stage = document.querySelector('.week-3-flags-stage');
    const columns = [...document.querySelectorAll('.flag-column')];
    const choices = [...document.querySelectorAll('.flag-choice')];
    const labels = [...document.querySelectorAll('[data-country-label]')];
    const startLayer = document.getElementById('week-3-flags-start');
    const startButton = document.getElementById('week-3-flags-start-button');
    const restartButton = document.getElementById('week-3-flags-restart');
    const replayButton = document.getElementById('week-3-flags-replay');
    const status = document.getElementById('week-3-flags-status');
    const path = document.querySelector('.week-3-flags-path');
    const pathLine = document.getElementById('week-3-flags-path-line');
    const startDot = document.querySelector('.path-dot-start');
    const endDot = document.querySelector('.path-dot-end');
    const completion = document.getElementById('week-3-flags-completion');
    const completionVideo = document.getElementById('week-3-flags-good-job-video');
    const completionClose = document.getElementById('week-3-flags-completion-close');
    const completionTryAgain = document.getElementById('week-3-flags-completion-try-again');
    let introAudio = null;
    let countryAudio = null;
    let step = 0;
    let ready = false;
    let selectedFlags = [];

    function labelFor(country) {
      return labels.find((label) => label.dataset.countryLabel === country);
    }

    function choiceFor(country) {
      return choices.find((choice) => choice.dataset.country === country);
    }

    function setChoiceState(enabled) {
      ready = enabled;
      const current = QUESTION_ORDER[step];
      choices.forEach((choice) => {
        const completed = QUESTION_ORDER.indexOf(choice.dataset.column) < step;
        choice.disabled = !enabled || choice.dataset.column !== current || completed;
        choice.classList.toggle('is-muted', !completed && choice.dataset.column !== current);
      });
    }

    function arrangeFlags() {
      columns.forEach((column) => {
        const pair = [...column.querySelectorAll('.flag-choice')];
        const correctOnTop = Math.random() < 0.5;
        pair.forEach((choice) => {
          const isCorrect = choice.dataset.correct === 'true';
          choice.style.top = (isCorrect === correctOnTop) ? '0%' : '52%';
        });
      });
    }

    function stopCountryAudio() {
      if (countryAudio) {
        countryAudio.pause();
        countryAudio = null;
      }
      labels.forEach((label) => label.classList.remove('is-speaking'));
    }

    function playCountry(country, highlightLabel = false) {
      stopCountryAudio();
      const choice = choiceFor(country);
      countryAudio = new Audio(choice.dataset.audio);
      const label = highlightLabel ? labelFor(country) : null;
      if (label) label.classList.add('is-speaking');
      countryAudio.addEventListener('ended', () => {
        if (label) label.classList.remove('is-speaking');
      }, { once: true });
      countryAudio.play().catch(() => {
        if (label) label.classList.remove('is-speaking');
      });
      return countryAudio;
    }

    function askCurrentCountry() {
      const country = QUESTION_ORDER[step];
      setChoiceState(false);
      replayButton.disabled = true;
      status.className = 'week-3-flags-status';
      status.textContent = `Listen: ${COUNTRY_NAMES[country]}.`;
      const audio = playCountry(country, true);
      const enable = () => {
        setChoiceState(true);
        replayButton.disabled = false;
        status.textContent = `Choose the ${COUNTRY_NAMES[country]} flag.`;
      };
      audio.addEventListener('ended', enable, { once: true });
      audio.addEventListener('error', enable, { once: true });
    }

    function updatePath() {
      const stageRect = stage.getBoundingClientRect();
      path.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
      const start = { x: stageRect.width * 0.038, y: stageRect.height * 0.72 };
      const end = { x: stageRect.width * 0.972, y: stageRect.height * 0.72 };
      startDot.setAttribute('cx', start.x);
      startDot.setAttribute('cy', start.y);
      endDot.setAttribute('cx', end.x);
      endDot.setAttribute('cy', end.y);
      startDot.style.opacity = selectedFlags.length ? '1' : '0';
      endDot.style.opacity = selectedFlags.length === QUESTION_ORDER.length ? '1' : '0';
      if (!selectedFlags.length) {
        pathLine.setAttribute('points', '');
        return;
      }
      const points = [start, ...selectedFlags.map((choice) => {
        const rect = choice.getBoundingClientRect();
        return { x: rect.left - stageRect.left + rect.width / 2, y: rect.top - stageRect.top + rect.height / 2 };
      })];
      if (selectedFlags.length === QUESTION_ORDER.length) points.push(end);
      pathLine.setAttribute('points', points.map((point) => `${point.x},${point.y}`).join(' '));
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

    function resetActivity() {
      stopCountryAudio();
      step = 0;
      ready = false;
      selectedFlags = [];
      arrangeFlags();
      choices.forEach((choice) => choice.classList.remove('is-correct', 'is-wrong', 'is-muted'));
      labels.forEach((label) => label.classList.remove('is-speaking', 'is-complete'));
      replayButton.disabled = true;
      updatePath();
      setChoiceState(false);
    }

    function beginActivity() {
      if (introAudio) introAudio.pause();
      hideCompletion();
      startLayer.hidden = true;
      resetActivity();
      status.className = 'week-3-flags-status';
      status.textContent = 'Listen to the directions.';
      introAudio = new Audio(INTRO_AUDIO);
      introAudio.addEventListener('ended', askCurrentCountry, { once: true });
      introAudio.play().catch(askCurrentCountry);
    }

    function chooseFlag(choice) {
      if (!ready || choice.dataset.column !== QUESTION_ORDER[step]) return;
      setChoiceState(false);
      replayButton.disabled = true;
      const isCorrect = choice.dataset.correct === 'true';
      const selectedName = COUNTRY_NAMES[choice.dataset.country];
      const audio = playCountry(choice.dataset.country, isCorrect);

      if (!isCorrect) {
        choice.classList.remove('is-wrong');
        void choice.offsetWidth;
        choice.classList.add('is-wrong');
        status.className = 'week-3-flags-status is-wrong';
        status.textContent = `That is ${selectedName}. Try again.`;
        audio.addEventListener('ended', () => {
          choice.classList.remove('is-wrong');
          askCurrentCountry();
        }, { once: true });
        return;
      }

      choice.classList.add('is-correct');
      selectedFlags.push(choice);
      labelFor(QUESTION_ORDER[step]).classList.add('is-complete');
      step += 1;
      updatePath();
      status.className = 'week-3-flags-status is-correct';
      status.textContent = `Correct! That is ${selectedName}.`;

      audio.addEventListener('ended', () => {
        if (step === QUESTION_ORDER.length) {
          choices.forEach((item) => { item.disabled = true; item.classList.remove('is-muted'); });
          status.textContent = 'Wonderful! You matched all the flags!';
          window.setTimeout(showCompletion, 450);
        } else {
          window.setTimeout(askCurrentCountry, 300);
        }
      }, { once: true });
    }

    choices.forEach((choice) => choice.addEventListener('click', () => chooseFlag(choice)));
    replayButton.addEventListener('click', askCurrentCountry);
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
