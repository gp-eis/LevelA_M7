(() => {
  const INTRO_AUDIO = '../assets/audio/week-3/literacy/page-03-intro.mp3';
  const QUESTION_VIDEO = '../assets/video/week-3/literacy/page-03-question.mp4';
  const CORRECT_VIDEO = '../assets/video/week-3/literacy/page-03-correct.mp4';
  const WRONG_VIDEO = '../assets/video/week-3/literacy/page-03-wrong.mp4';
  const CORRECT_ANSWER = 'olympic-games';

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
    const video = document.getElementById('week-3-event-video');
    const replayButton = document.getElementById('replay-week-3-question');
    const restartButton = document.getElementById('restart-week-3-event');
    const startLayer = document.getElementById('week-3-event-start');
    const startButton = document.getElementById('week-3-event-start-button');
    const feedback = document.getElementById('week-3-answer-feedback');
    const list = document.querySelector('.week-3-answer-panel .answer-list');
    const choices = [...document.querySelectorAll('.week-3-answer-panel .sentence-choice')];
    const completion = document.getElementById('week-3-event-completion');
    const completionVideo = document.getElementById('week-3-good-job-video');
    const completionClose = document.getElementById('week-3-completion-close');
    const completionTryAgain = document.getElementById('week-3-completion-try-again');
    let introAudio = null;
    let acceptingAnswer = false;
    let clipEndedAction = null;
    let previousChoiceOrder = choices.map((choice) => choice.dataset.answer).join(',');

    function stopMedia() {
      if (introAudio) {
        introAudio.pause();
        introAudio.currentTime = 0;
      }
      video.pause();
      completionVideo.pause();
    }

    function setChoicesEnabled(enabled) {
      choices.forEach((choice) => {
        choice.setAttribute('aria-disabled', String(!enabled));
        choice.tabIndex = enabled ? 0 : -1;
        choice.querySelector('.sentence-speaker').disabled = !enabled;
      });
    }

    function shuffleChoices() {
      const shuffled = [...choices];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      if (shuffled.map((choice) => choice.dataset.answer).join(',') === previousChoiceOrder) {
        shuffled.push(shuffled.shift());
      }
      shuffled.forEach((choice) => list.appendChild(choice));
      previousChoiceOrder = shuffled.map((choice) => choice.dataset.answer).join(',');
    }

    function clearChoices() {
      choices.forEach((choice) => {
        choice.classList.remove('is-correct', 'is-wrong');
        choice.setAttribute('aria-checked', 'false');
      });
    }

    function loadClip(source, onEnded) {
      video.pause();
      video.src = source;
      video.currentTime = 0;
      video.load();
      clipEndedAction = onEnded || null;
      return video.play();
    }

    function readyForAnswer() {
      acceptingAnswer = true;
      replayButton.disabled = false;
      setChoicesEnabled(true);
      feedback.textContent = 'Choose one answer.';
      feedback.className = 'answer-feedback';
    }

    function restoreQuestionFrame() {
      video.pause();
      video.src = QUESTION_VIDEO;
      video.load();
      readyForAnswer();
    }

    function playQuestion() {
      acceptingAnswer = false;
      setChoicesEnabled(false);
      replayButton.disabled = true;
      feedback.textContent = 'Listen to the question.';
      loadClip(QUESTION_VIDEO, readyForAnswer).catch(() => {
        replayButton.disabled = false;
        feedback.textContent = 'Tap the speaker to hear the question.';
      });
    }

    function beginActivity() {
      stopMedia();
      completion.hidden = true;
      startLayer.hidden = true;
      acceptingAnswer = false;
      replayButton.disabled = true;
      setChoicesEnabled(false);
      clearChoices();
      shuffleChoices();
      feedback.textContent = 'Listen to the directions.';
      feedback.className = 'answer-feedback';
      introAudio = new Audio(INTRO_AUDIO);
      introAudio.addEventListener('ended', playQuestion, { once: true });
      introAudio.play().catch(playQuestion);
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
        speakSentence('Great job!');
      });
    }

    function markCorrect(choice) {
      acceptingAnswer = false;
      setChoicesEnabled(false);
      replayButton.disabled = true;
      choices.forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('is-correct', selected);
        item.classList.remove('is-wrong');
        item.setAttribute('aria-checked', String(selected));
      });
      feedback.textContent = 'Great job! At the Olympic Games.';
      feedback.className = 'answer-feedback is-correct';
      loadClip(CORRECT_VIDEO, showCompletion).catch(showCompletion);
    }

    function markWrong(choice) {
      acceptingAnswer = false;
      setChoicesEnabled(false);
      replayButton.disabled = true;
      choice.classList.remove('is-wrong');
      void choice.offsetWidth;
      choice.classList.add('is-wrong');
      choice.setAttribute('aria-checked', 'false');
      feedback.textContent = 'Try again! Choose another answer.';
      feedback.className = 'answer-feedback is-wrong';
      loadClip(WRONG_VIDEO, () => {
        choice.classList.remove('is-wrong');
        restoreQuestionFrame();
      }).catch(() => {
        choice.classList.remove('is-wrong');
        restoreQuestionFrame();
      });
    }

    choices.forEach((choice) => {
      choice.addEventListener('click', (event) => {
        if (event.target.closest('.sentence-speaker') || !acceptingAnswer) return;
        if (choice.dataset.answer === CORRECT_ANSWER) markCorrect(choice);
        else markWrong(choice);
      });
      choice.addEventListener('keydown', (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && acceptingAnswer) {
          event.preventDefault();
          if (choice.dataset.answer === CORRECT_ANSWER) markCorrect(choice);
          else markWrong(choice);
        }
      });
    });

    document.querySelectorAll('.week-3-answer-panel .sentence-speaker').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (acceptingAnswer) speakSentence(button.dataset.speak);
      });
    });

    startButton.addEventListener('click', beginActivity);
    replayButton.addEventListener('click', playQuestion);
    restartButton.addEventListener('click', beginActivity);
    completionClose.addEventListener('click', hideCompletion);
    completionTryAgain.addEventListener('click', beginActivity);
    completionVideo.addEventListener('ended', () => speakSentence('Great job!'));

    video.addEventListener('ended', () => {
      const action = clipEndedAction;
      clipEndedAction = null;
      if (action) action();
    });

    replayButton.disabled = true;
    setChoicesEnabled(false);
    clearChoices();
  });
})();
