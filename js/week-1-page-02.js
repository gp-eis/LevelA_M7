(() => {
  const MAIN_VIDEO = '../assets/video/week-1/page-02.mp4';
  const CORRECT_VIDEO = '../assets/video/week-1/page-02-correct.mp4';
  const WRONG_VIDEO = '../assets/video/week-1/page-02-wrong.mp4';
  const CORRECT_ANSWER = 'athlete';
  const WRONG_CLIP_SECONDS = 4;

  function playWrongSound() {
    if (typeof soundEnabled !== 'undefined' && !soundEnabled) return;
    if (typeof playTone === 'function') {
      playTone(210, 0.2, 0.12, 'sawtooth');
      playTone(145, 0.3, 0.1, 'sawtooth', 0.18);
    }
  }

  function speakSentence(sentence) {
    if (typeof soundEnabled !== 'undefined' && !soundEnabled) return;
    if (!('speechSynthesis' in window)) {
      if (typeof showToast === 'function') showToast('Speech is not available in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('page-two-video');
    const choices = [...document.querySelectorAll('.sentence-choice')];
    const feedback = document.getElementById('answer-feedback');
    const restartButton = document.getElementById('restart-activity');
    const startLayer = document.getElementById('page3-start-layer');
    const startButton = document.getElementById('page3-start-button');
    let feedbackClip = false;
    let activityStarted = false;

    function setChoicesEnabled(enabled) {
      activityStarted = enabled;
      choices.forEach((choice) => {
        choice.setAttribute('aria-disabled', String(!enabled));
        choice.tabIndex = enabled ? 0 : -1;
        const speaker = choice.querySelector('.sentence-speaker');
        if (speaker) speaker.disabled = !enabled;
      });
    }

    function playClip(source, wrong = false) {
      feedbackClip = true;
      video.pause();
      video.src = source;
      video.loop = false;
      video.muted = false;
      video.playbackRate = 1;

      if (wrong) {
        video.addEventListener('loadedmetadata', () => {
          if (Number.isFinite(video.duration) && video.duration > WRONG_CLIP_SECONDS) {
            video.playbackRate = Math.min(4, video.duration / WRONG_CLIP_SECONDS);
          }
        }, { once: true });
      }

      video.load();
      video.play().catch(() => {
        if (typeof showToast === 'function') showToast('Tap an answer again to play the reaction.');
      });
    }

    function restoreQuestionVideo(autoplay = false) {
      feedbackClip = false;
      video.pause();
      video.src = MAIN_VIDEO;
      video.loop = false;
      video.muted = false;
      video.playbackRate = 1;
      video.load();
      if (autoplay) video.play().catch(() => {});
    }

    function markCorrect(choice) {
      choices.forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('is-correct', selected);
        item.classList.remove('is-wrong');
        item.setAttribute('aria-checked', String(selected));
      });
      feedback.textContent = 'Great job! I am an athlete.';
      feedback.className = 'answer-feedback is-correct';
      playClip(CORRECT_VIDEO);
    }

    function markWrong(choice) {
      choice.classList.remove('is-wrong');
      void choice.offsetWidth;
      choice.classList.add('is-wrong');
      choice.setAttribute('aria-checked', 'false');
      feedback.textContent = 'Try again! Listen and choose another answer.';
      feedback.className = 'answer-feedback is-wrong';
      playWrongSound();
      playClip(WRONG_VIDEO, true);
      window.setTimeout(() => choice.classList.remove('is-wrong'), 900);
    }

    function choose(choice) {
      if (!activityStarted) return;
      if (choice.dataset.answer === CORRECT_ANSWER) markCorrect(choice);
      else markWrong(choice);
    }

    choices.forEach((choice) => {
      choice.addEventListener('click', (event) => {
        if (event.target.closest('.sentence-speaker')) return;
        choose(choice);
      });
      choice.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          choose(choice);
        }
      });
    });

    document.querySelectorAll('.sentence-speaker').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        speakSentence(button.dataset.speak);
      });
    });

    function shuffleChoices() {
      const list = document.querySelector('.answer-list');
      const previousOrder = [...list.children].map((choice) => choice.dataset.answer).join(',');
      const shuffled = [...choices];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      if (shuffled.map((choice) => choice.dataset.answer).join(',') === previousOrder) {
        shuffled.push(shuffled.shift());
      }
      shuffled.forEach((choice) => list.appendChild(choice));
    }

    restartButton.addEventListener('click', () => {
      choices.forEach((choice) => {
        choice.classList.remove('is-correct', 'is-wrong');
        choice.setAttribute('aria-checked', 'false');
      });
      feedback.textContent = 'Choose one answer.';
      feedback.className = 'answer-feedback';
      shuffleChoices();
      setChoicesEnabled(true);
      restoreQuestionVideo(true);
    });

    startButton.addEventListener('click', () => {
      startLayer.hidden = true;
      feedback.textContent = 'Choose one answer.';
      feedback.className = 'answer-feedback';
      setChoicesEnabled(true);
      restoreQuestionVideo(true);
    });

    video.addEventListener('ended', () => {
      if (feedbackClip) restoreQuestionVideo(false);
    });

    setChoicesEnabled(false);
    restoreQuestionVideo(false);
  });
})();
