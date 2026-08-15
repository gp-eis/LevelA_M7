(() => {
  const CORRECT_ANSWER = 2;
  const MIN_ANSWER = 0;
  const MAX_ANSWER = 5;
  const QUESTION_AUDIO = '../assets/audio/week-1/page-04-question.mp3';

  function speakCompletion() {
    if (typeof soundEnabled !== 'undefined' && !soundEnabled) return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('Great job! She plays two sports.');
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const valueElement = document.getElementById('sports-number-value');
    const numberBox = document.getElementById('sports-number-box');
    const questionSpeaker = document.getElementById('page4-question-speaker');
    const upButton = document.getElementById('sports-number-up');
    const downButton = document.getElementById('sports-number-down');
    const goButton = document.getElementById('sports-number-go');
    const introVideo = document.getElementById('page4-intro-video');
    const startButton = document.getElementById('page4-start-activity');
    const startLayer = document.getElementById('page4-start-layer');
    const goodJobVideo = document.getElementById('page4-good-job-video');
    const completionOverlay = document.getElementById('page4-good-job-overlay');
    const videoCloseButton = document.getElementById('page4-video-close');
    const restartButton = document.getElementById('restart-page4');
    let selectedNumber = 0;
    let completed = false;
    let activityReady = false;
    let questionAudio;

    function updateNumber(nextNumber) {
      selectedNumber = Math.max(MIN_ANSWER, Math.min(MAX_ANSWER, nextNumber));
      valueElement.textContent = selectedNumber;
      numberBox.setAttribute('aria-label', `Selected answer: ${selectedNumber}`);
      numberBox.classList.remove('is-wrong');
      upButton.disabled = !activityReady || selectedNumber >= MAX_ANSWER;
      downButton.disabled = !activityReady || selectedNumber <= MIN_ANSWER;
      goButton.disabled = !activityReady;
    }

    function playCorrectSound() {
      if (typeof playTone !== 'function') return;
      playTone(620, 0.14, 0.08, 'triangle');
      playTone(880, 0.18, 0.08, 'triangle', 0.12);
    }

    function playWrongAnswerSound() {
      if (typeof playTone !== 'function') return;
      playTone(210, 0.18, 0.1, 'sawtooth');
      playTone(145, 0.25, 0.08, 'sawtooth', 0.16);
    }

    function showStaticCharacter() {
      introVideo.pause();
      introVideo.currentTime = 0;
      introVideo.hidden = false;
    }

    function submitAnswer() {
      if (completed || !activityReady) return;
      if (selectedNumber !== CORRECT_ANSWER) {
        numberBox.classList.remove('is-wrong');
        void numberBox.offsetWidth;
        numberBox.classList.add('is-wrong');
        playWrongAnswerSound();
        window.setTimeout(() => numberBox.classList.remove('is-wrong'), 700);
        return;
      }

      completed = true;
      activityReady = false;
      playCorrectSound();
      showStaticCharacter();
      upButton.disabled = true;
      downButton.disabled = true;
      goButton.disabled = true;
      questionSpeaker.disabled = true;
      completionOverlay.hidden = false;
      goodJobVideo.currentTime = 0;
      goodJobVideo.play().catch(() => {
        speakCompletion();
      });
    }

    function enableActivity() {
      if (completed) return;
      activityReady = true;
      questionSpeaker.hidden = false;
      questionSpeaker.disabled = false;
      updateNumber(selectedNumber);
    }

    function playQuestionAudio() {
      if (completed) return;
      if (typeof soundEnabled !== 'undefined' && !soundEnabled) {
        enableActivity();
        return;
      }
      if (questionAudio) {
        questionAudio.pause();
        questionAudio.currentTime = 0;
      }
      questionSpeaker.disabled = true;
      questionAudio = new Audio(QUESTION_AUDIO);
      questionAudio.addEventListener('ended', enableActivity, { once: true });
      questionAudio.play().catch(enableActivity);
    }

    function startIntroSequence() {
      completed = false;
      activityReady = false;
      questionSpeaker.hidden = true;
      questionSpeaker.disabled = true;
      completionOverlay.hidden = true;
      goodJobVideo.pause();
      goodJobVideo.currentTime = 0;
      if (questionAudio) {
        questionAudio.pause();
        questionAudio.currentTime = 0;
      }
      updateNumber(0);
      introVideo.hidden = false;
      introVideo.muted = false;
      introVideo.currentTime = 0;
      startLayer.hidden = true;
      introVideo.play().catch(() => {
        playQuestionAudio();
      });
    }

    function prepareActivity() {
      completed = false;
      activityReady = false;
      completionOverlay.hidden = true;
      goodJobVideo.pause();
      goodJobVideo.currentTime = 0;
      introVideo.pause();
      introVideo.currentTime = 0;
      introVideo.hidden = true;
      questionSpeaker.hidden = true;
      questionSpeaker.disabled = true;
      startLayer.hidden = false;
      updateNumber(0);
    }

    function restartActivity() {
      startIntroSequence();
    }

    upButton.addEventListener('click', () => updateNumber(selectedNumber + 1));
    downButton.addEventListener('click', () => updateNumber(selectedNumber - 1));
    goButton.addEventListener('click', submitAnswer);
    questionSpeaker.addEventListener('click', playQuestionAudio);
    restartButton.addEventListener('click', restartActivity);
    videoCloseButton.addEventListener('click', () => {
      goodJobVideo.pause();
      goodJobVideo.currentTime = 0;
      completionOverlay.hidden = true;
      showStaticCharacter();
    });
    startButton.addEventListener('click', () => {
      startIntroSequence();
    });
    introVideo.addEventListener('ended', () => {
      introVideo.pause();
      introVideo.currentTime = 0;
      playQuestionAudio();
    });
    goodJobVideo.addEventListener('ended', () => {
      showStaticCharacter();
      speakCompletion();
    });

    prepareActivity();
  });
})();
