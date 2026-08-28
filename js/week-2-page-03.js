(() => {
  const intro = document.getElementById('practice-intro-audio');
  const question = document.getElementById('practice-question-audio');
  const startLayer = document.getElementById('practice-start');
  const startButton = document.getElementById('practice-start-button');
  const questionButton = document.getElementById('practice-question-speaker');
  const choices = [...document.querySelectorAll('.practice-choice')];
  const status = document.getElementById('practice-status');
  const completion = document.getElementById('practice-completion');
  const completionVideo = document.getElementById('practice-good-job-video');
  const closeCompletion = document.getElementById('practice-completion-close');
  const tryAgain = document.getElementById('practice-try-again');
  let ready = false;
  let completed = false;

  const feedbackSounds = (() => {
    let context = null;
    const getContext = () => {
      if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') context.resume();
      return context;
    };
    const tone = (frequency, start, duration, type = 'sine', volume = .13) => {
      const audioContext = getContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .03);
    };
    return {
      correct() {
        const now = getContext().currentTime;
        tone(523, now, .13, 'sine', .14);
        tone(659, now + .09, .14, 'sine', .15);
        tone(784, now + .18, .22, 'sine', .17);
      },
      wrong() {
        const now = getContext().currentTime;
        tone(240, now, .15, 'triangle', .11);
        tone(180, now + .11, .2, 'triangle', .1);
      }
    };
  })();

  const setReady = () => {
    ready = true;
    questionButton.disabled = false;
    choices.forEach(choice => {
      choice.setAttribute('aria-disabled', 'false');
      choice.tabIndex = 0;
      choice.querySelector('.sentence-speaker').disabled = false;
    });
    status.textContent = 'Choose one answer.';
  };

  const playQuestion = () => {
    question.currentTime = 0;
    question.play().catch(() => {});
  };

  startButton.addEventListener('click', () => {
    startLayer.hidden = true;
    status.textContent = 'Listen carefully…';
    intro.currentTime = 0;
    intro.play().catch(() => {
      playQuestion();
      setReady();
    });
  });
  intro.addEventListener('ended', () => {
    playQuestion();
    setReady();
  });
  questionButton.addEventListener('click', playQuestion);

  let answerAudio;
  const playAnswer = (choice) => {
    if (answerAudio) {
      answerAudio.pause();
      answerAudio.currentTime = 0;
    }
    answerAudio = new Audio(choice.dataset.audio);
    answerAudio.play().catch(() => {});
  };

  const hideCompletion = () => {
    completionVideo.pause();
    completion.hidden = true;
  };

  const showCompletion = () => {
    completed = true;
    completion.hidden = false;
    completionVideo.currentTime = 0;
    completionVideo.play().catch(speakCompletion);
  };

  completionVideo.addEventListener('ended', () => {
    // Leave the video's final frame visible while the completion voice plays.
    speakCompletion();
  });
  closeCompletion.addEventListener('click', hideCompletion);

  function speakCompletion() {
    if (typeof speakAmericanEnglish === 'function') {
      speakAmericanEnglish('Good job! We are at soccer practice.');
    }
  }

  function restartActivity() {
    hideCompletion();
    completed = false;
    ready = false;
    questionButton.disabled = true;
    choices.forEach(item => {
      item.classList.remove('is-correct','is-wrong');
      item.setAttribute('aria-checked','false');
      item.setAttribute('aria-disabled','true');
      item.tabIndex = -1;
      item.querySelector('.sentence-speaker').disabled = true;
    });
    status.className = 'practice-status';
    status.textContent = 'Listen carefully…';
    intro.currentTime = 0;
    intro.play().catch(() => {
      playQuestion();
      setReady();
    });
  }
  tryAgain.addEventListener('click', restartActivity);

  choices.forEach(choice => {
    const speaker = choice.querySelector('.sentence-speaker');
    speaker.addEventListener('click', event => {
      event.stopPropagation();
      if (ready) playAnswer(choice);
    });
    choice.addEventListener('click', event => {
      if (!ready || completed || event.target.closest('.sentence-speaker')) return;
      choices.forEach(item => item.classList.remove('is-correct','is-wrong'));
      choices.forEach(item => item.setAttribute('aria-checked', 'false'));
      choice.setAttribute('aria-checked', 'true');
      if (choice.dataset.correct === 'true') {
        choice.classList.add('is-correct');
        status.className = 'practice-status is-correct';
        status.textContent = 'Great job! We are at soccer practice.';
        feedbackSounds.correct();
        window.setTimeout(() => playAnswer(choice), 300);
        completed = true;
        window.setTimeout(showCompletion, 2350);
      } else {
        choice.classList.add('is-wrong');
        status.className = 'practice-status is-wrong';
        status.textContent = 'Try again!';
        feedbackSounds.wrong();
        window.setTimeout(() => playAnswer(choice), 260);
      }
    });
    choice.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        choice.click();
      }
    });
  });
})();
