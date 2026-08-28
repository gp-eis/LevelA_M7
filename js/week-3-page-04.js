(() => {
  const INTRO_AUDIO = '../assets/audio/week-3/literacy/page-04-intro.mp3';
  const REQUIRED_CORRECT = 5;

  document.addEventListener('DOMContentLoaded', () => {
    const startLayer = document.getElementById('week-3-sports-start');
    const startButton = document.getElementById('week-3-sports-start-button');
    const restartButton = document.getElementById('week-3-sports-restart');
    const status = document.getElementById('week-3-sports-status');
    const hotspots = [...document.querySelectorAll('.sport-hotspot')];
    const completion = document.getElementById('week-3-sports-completion');
    const completionVideo = document.getElementById('week-3-sports-good-job-video');
    const completionClose = document.getElementById('week-3-sports-completion-close');
    const completionTryAgain = document.getElementById('week-3-sports-completion-try-again');
    let introAudio = null;
    let wordAudio = null;
    let ready = false;
    let selectedCount = 0;

    function setReady(enabled) {
      ready = enabled;
      hotspots.forEach((hotspot) => {
        hotspot.querySelector('.sport-select').disabled = !enabled;
        hotspot.querySelector('.sport-speaker').disabled = !enabled;
      });
    }

    function playWord(hotspot) {
      if (wordAudio) {
        wordAudio.pause();
        wordAudio.currentTime = 0;
      }
      wordAudio = new Audio(hotspot.dataset.audio);
      wordAudio.play().catch(() => {});
    }

    function resetSelections() {
      selectedCount = 0;
      hotspots.forEach((hotspot) => {
        hotspot.classList.remove('is-selected', 'is-wrong');
        hotspot.querySelector('.sport-select').setAttribute('aria-pressed', 'false');
      });
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

    function beginActivity() {
      if (introAudio) {
        introAudio.pause();
        introAudio.currentTime = 0;
      }
      if (wordAudio) wordAudio.pause();
      hideCompletion();
      startLayer.hidden = true;
      resetSelections();
      setReady(false);
      status.className = 'week-3-sports-status';
      status.textContent = 'Listen to the directions.';
      introAudio = new Audio(INTRO_AUDIO);
      introAudio.addEventListener('ended', () => {
        setReady(true);
        status.textContent = 'Choose all five Olympic sports.';
      }, { once: true });
      introAudio.play().catch(() => {
        setReady(true);
        status.textContent = 'Choose all five Olympic sports.';
      });
    }

    function choose(hotspot) {
      if (!ready) return;
      playWord(hotspot);

      if (hotspot.dataset.correct === 'true') {
        if (hotspot.classList.contains('is-selected')) return;
        hotspot.classList.add('is-selected');
        hotspot.querySelector('.sport-select').setAttribute('aria-pressed', 'true');
        selectedCount += 1;
        status.className = 'week-3-sports-status is-correct';
        status.textContent = `${selectedCount} of ${REQUIRED_CORRECT} Olympic sports circled.`;
        if (selectedCount === REQUIRED_CORRECT) {
          status.textContent = 'Great job! You circled all five Olympic sports!';
          if (typeof playTone === 'function') {
            playTone(620, .14, .08, 'triangle');
            playTone(880, .2, .08, 'triangle', .12);
          }
          window.setTimeout(showCompletion, 650);
        }
        return;
      }

      hotspot.classList.remove('is-wrong');
      void hotspot.offsetWidth;
      hotspot.classList.add('is-wrong');
      status.className = 'week-3-sports-status is-wrong';
      status.textContent = 'Cooking is not an Olympic sport. Try again!';
      window.setTimeout(() => {
        hotspot.classList.remove('is-wrong');
        status.className = 'week-3-sports-status';
        status.textContent = `${selectedCount} of ${REQUIRED_CORRECT} Olympic sports circled.`;
      }, 1200);
    }

    hotspots.forEach((hotspot) => {
      hotspot.querySelector('.sport-select').addEventListener('click', () => choose(hotspot));
      hotspot.querySelector('.sport-speaker').addEventListener('click', () => {
        if (ready) playWord(hotspot);
      });
    });
    startButton.addEventListener('click', beginActivity);
    restartButton.addEventListener('click', beginActivity);
    completionClose.addEventListener('click', hideCompletion);
    completionTryAgain.addEventListener('click', beginActivity);
    completionVideo.addEventListener('ended', () => {
      if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish('Great job!');
    });

    setReady(false);
    resetSelections();
  });
})();
