(() => {
  const INTRO_AUDIO = '../assets/audio/week-1/page3-intro.mp3';
  const QUESTION_BANK = [
    { answer: 'first', text: 'Who is first (1st)?', audio: '../assets/audio/week-1/who-is-first.mp3' },
    { answer: 'second', text: 'Who is second (2nd)?', audio: '../assets/audio/week-1/who-is-second.mp3' },
    { answer: 'third', text: 'Who is third (3rd)?', audio: '../assets/audio/week-1/who-is-third.mp3' },
    { answer: 'last', text: 'Who is last?', audio: '../assets/audio/week-1/who-is-last.mp3' }
  ];
  const CYCLIST_SENTENCES = {
    first: 'I am first.',
    second: 'I am second.',
    third: 'I am third.',
    last: 'I am last.'
  };

  let questionAudio;
  let introAudio;

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function speak(text) {
    if (typeof soundEnabled !== 'undefined' && !soundEnabled) return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    utterance.pitch = 1.04;
    window.speechSynthesis.speak(utterance);
  }

  function playQuestionAudio(question) {
    if (typeof soundEnabled !== 'undefined' && !soundEnabled) return;
    if (questionAudio) {
      questionAudio.pause();
      questionAudio.currentTime = 0;
    }
    questionAudio = new Audio(question.audio);
    questionAudio.play().catch(() => {});
  }

  function stopQuestionAudio() {
    if (!questionAudio) return;
    questionAudio.pause();
    questionAudio.currentTime = 0;
  }

  function stopIntroAudio() {
    if (!introAudio) return;
    introAudio.pause();
    introAudio.currentTime = 0;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const questionElement = document.getElementById('cyclist-question');
    const progressElement = document.getElementById('cyclist-progress');
    const speaker = document.getElementById('speak-cyclist-question');
    const hotspots = [...document.querySelectorAll('.cyclist-hotspot')];
    const completionOverlay = document.getElementById('cyclist-good-job-overlay');
    const videoCloseButton = document.getElementById('cyclist-video-close');
    const restartButton = document.getElementById('restart-cyclists');
    const goodJobVideo = document.getElementById('cyclist-good-job-video');
    let questions = [];
    let questionIndex = 0;
    let acceptingAnswer = true;

    function currentQuestion() {
      return questions[questionIndex];
    }

    function showQuestion(readAloud = true) {
      const question = currentQuestion();
      questionElement.textContent = question.text;
      progressElement.textContent = `${questionIndex + 1} of ${questions.length}`;
      acceptingAnswer = true;
      if (readAloud) window.setTimeout(() => playQuestionAudio(question), 180);
    }

    function finishActivity() {
      acceptingAnswer = false;
      speaker.disabled = true;
      questionElement.textContent = 'You completed all four questions!';
      progressElement.textContent = '4 of 4';

      const clipSource = goodJobVideo.dataset.src;
      if (clipSource) {
        goodJobVideo.src = clipSource;
        completionOverlay.hidden = false;
        goodJobVideo.currentTime = 0;
        goodJobVideo.play().catch(() => {
          speak('Great job! You found all four cyclists!');
        });
      } else {
        speak('Great job! You found all four cyclists!');
      }
    }

    function chooseCyclist(hotspot) {
      if (!acceptingAnswer) return;
      stopQuestionAudio();
      const selectedPosition = hotspot.dataset.position;
      const selectedSentence = CYCLIST_SENTENCES[selectedPosition];
      const correct = selectedPosition === currentQuestion().answer;

      hotspot.classList.remove('is-correct', 'is-wrong');
      void hotspot.offsetWidth;
      hotspot.classList.add(correct ? 'is-correct' : 'is-wrong');

      if (!correct) {
        if (typeof playWrongSound === 'function') playWrongSound();
        else if (typeof playTone === 'function') {
          playTone(210, 0.18, 0.1, 'sawtooth');
          playTone(145, 0.25, 0.08, 'sawtooth', 0.16);
        }
        window.setTimeout(() => speak(selectedSentence), 320);
        window.setTimeout(() => hotspot.classList.remove('is-wrong'), 650);
        return;
      }

      acceptingAnswer = false;
      if (typeof playTone === 'function') {
        playTone(620, 0.14, 0.08, 'triangle');
        playTone(880, 0.18, 0.08, 'triangle', 0.12);
      }
      window.setTimeout(() => speak(selectedSentence), 240);

      window.setTimeout(() => {
        hotspot.classList.remove('is-correct');
        questionIndex += 1;
        if (questionIndex >= questions.length) finishActivity();
        else showQuestion(true);
      }, 1600);
    }

    function startActivity() {
      stopQuestionAudio();
      stopIntroAudio();
      questions = shuffle(QUESTION_BANK);
      questionIndex = 0;
      acceptingAnswer = false;
      speaker.disabled = false;
      completionOverlay.hidden = true;
      goodJobVideo.pause();
      goodJobVideo.currentTime = 0;
      hotspots.forEach((hotspot) => hotspot.classList.remove('is-correct', 'is-wrong'));
      questionElement.textContent = 'Listen to the directions.';
      progressElement.textContent = 'Get ready!';

      if (typeof soundEnabled !== 'undefined' && !soundEnabled) {
        showQuestion(false);
        return;
      }

      introAudio = new Audio(INTRO_AUDIO);
      introAudio.addEventListener('ended', () => showQuestion(true), { once: true });
      introAudio.play().catch(() => showQuestion(false));
    }

    hotspots.forEach((hotspot) => hotspot.addEventListener('click', () => chooseCyclist(hotspot)));
    speaker.addEventListener('click', () => {
      stopIntroAudio();
      if (!acceptingAnswer) showQuestion(false);
      playQuestionAudio(currentQuestion());
    });
    restartButton.addEventListener('click', startActivity);
    videoCloseButton.addEventListener('click', () => {
      goodJobVideo.pause();
      goodJobVideo.currentTime = 0;
      completionOverlay.hidden = true;
    });
    goodJobVideo.addEventListener('ended', () => {
      speak('Great job! You found all four cyclists!');
    });
    startActivity();
  });
})();
