(() => {
  const cards = [...document.querySelectorAll('.sport-word')];
  const zones = [...document.querySelectorAll('.sport-drop-zone')];
  const bank = document.getElementById('sports-word-bank');
  const intro = document.getElementById('sports-intro-audio');
  const wordAudio = document.getElementById('sports-word-audio');
  const sentenceAudio = document.getElementById('sports-sentence-audio');
  const replay = document.getElementById('sports-intro-replay');
  const startLayer = document.getElementById('sports-start');
  const startButton = document.getElementById('sports-start-button');
  const status = document.getElementById('sports-status');
  const completion = document.getElementById('sports-completion');
  const celebration = document.getElementById('sports-good-job-video');
  const closeCompletion = document.getElementById('sports-completion-close');
  const popupTryAgain = document.getElementById('sports-popup-try-again');
  const section = document.getElementById('lesson-focus');
  const connectionSvg = document.getElementById('sports-connection-lines');
  const connectionLines = [...connectionSvg.querySelectorAll('line')];
  let selected = null;
  let matched = 0;
  let ready = false;
  let drag = null;

  const play = (audio, src) => {
    intro.pause(); wordAudio.pause(); sentenceAudio.pause();
    if (src) audio.src = src;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };
  const playIntro = () => play(intro);
  const shuffle = () => {
    const shuffled = [...cards];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    if (shuffled.every((card, index) => card === cards[index])) [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    shuffled.forEach((card) => bank.appendChild(card));
  };
  const updateConnections = () => {
    const sectionRect = section.getBoundingClientRect();
    connectionSvg.setAttribute('viewBox', `0 0 ${sectionRect.width} ${sectionRect.height}`);
    connectionLines.forEach((line) => {
      const sport = line.dataset.sport;
      const card = cards.find((item) => item.dataset.sport === sport);
      const zone = zones.find((item) => item.dataset.answer === sport);
      if (!card || !zone || !zone.classList.contains('is-filled')) return;
      const cardRect = card.getBoundingClientRect();
      const zoneRect = zone.getBoundingClientRect();
      line.setAttribute('x1', zoneRect.left + zoneRect.width / 2 - sectionRect.left);
      line.setAttribute('y1', zoneRect.bottom - sectionRect.top);
      line.setAttribute('x2', cardRect.left + cardRect.width / 2 - sectionRect.left);
      line.setAttribute('y2', cardRect.top - sectionRect.top);
    });
  };
  const selectCard = (card) => {
    if (!ready || card.classList.contains('is-placed')) return;
    cards.forEach((item) => item.classList.remove('is-selected'));
    selected = card;
    card.classList.add('is-selected');
    play(wordAudio, card.dataset.wordAudio);
    status.textContent = `Now match ${card.dataset.sport} to the correct picture.`;
  };
  const flashWrong = (card, zone) => {
    card.classList.remove('is-wrong'); zone.classList.remove('is-wrong');
    void card.offsetWidth;
    card.classList.add('is-wrong'); zone.classList.add('is-wrong');
    setTimeout(() => { card.classList.remove('is-wrong'); zone.classList.remove('is-wrong'); }, 900);
  };
  const showCompletion = () => {
    completion.hidden = false;
    celebration.currentTime = 0;
    celebration.play().catch(() => {});
  };
  const attempt = (card, zone) => {
    if (!ready || !card || card.classList.contains('is-placed') || zone.classList.contains('is-filled')) return;
    if (card.dataset.sport !== zone.dataset.answer) {
      flashWrong(card, zone);
      status.textContent = `That is not ${card.dataset.sport}. Try another picture!`;
      return;
    }

    card.classList.remove('is-selected');
    card.classList.add('is-placed');
    card.disabled = true;
    zone.classList.add('is-filled');
    zone.textContent = card.dataset.sport;
    zone.disabled = true;
    selected = null;
    matched += 1;
    const connection = connectionLines.find((line) => line.dataset.sport === card.dataset.sport);
    connection?.classList.add('is-visible');
    updateConnections();
    status.textContent = matched === cards.length ? 'Great job! You matched all the sports!' : `${matched} of ${cards.length} sports matched.`;
    if (matched === cards.length) {
      ready = false;
      cards.forEach((item) => { item.disabled = true; });
      zones.forEach((item) => { item.disabled = true; });
      sentenceAudio.addEventListener('ended', showCompletion, { once: true });
    }
    play(sentenceAudio, card.dataset.sentenceAudio);
  };
  const reset = () => {
    selected = null; matched = 0; ready = true;
    celebration.pause(); completion.hidden = true;
    cards.forEach((card) => {
      card.classList.remove('is-selected', 'is-placed', 'is-wrong');
      card.disabled = false;
    });
    zones.forEach((zone) => {
      zone.classList.remove('is-filled', 'is-wrong', 'is-over');
      zone.textContent = '';
      zone.disabled = false;
    });
    connectionLines.forEach((line) => line.classList.remove('is-visible'));
    shuffle();
    requestAnimationFrame(updateConnections);
    status.textContent = 'Choose a sport word, then match it to a picture.';
    playIntro();
  };

  startButton.addEventListener('click', () => {
    startLayer.hidden = true;
    replay.disabled = false;
    reset();
  });
  replay.addEventListener('click', playIntro);
  closeCompletion.addEventListener('click', () => { celebration.pause(); completion.hidden = true; });
  popupTryAgain.addEventListener('click', reset);
  zones.forEach((zone) => {
    zone.addEventListener('click', () => attempt(selected, zone));
    zone.addEventListener('dragover', (event) => {
      if (!ready || zone.classList.contains('is-filled')) return;
      event.preventDefault();
      zone.classList.add('is-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      zone.classList.remove('is-over');
      const card = cards.find((item) => item.dataset.sport === event.dataTransfer.getData('text/plain'));
      attempt(card, zone);
    });
  });
  cards.forEach((card) => {
    card.addEventListener('click', () => selectCard(card));
    card.addEventListener('dragstart', (event) => {
      if (!ready || card.classList.contains('is-placed')) {
        event.preventDefault();
        return;
      }
      selectCard(card);
      event.dataTransfer.setData('text/plain', card.dataset.sport);
      event.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => zones.forEach((zone) => zone.classList.remove('is-over')));
    card.addEventListener('pointerdown', (event) => {
      if (!ready || card.classList.contains('is-placed')) return;
      selectCard(card);
      drag = { card, x: event.clientX, y: event.clientY, moved: false, ghost: null };
      card.setPointerCapture(event.pointerId);
    });
    card.addEventListener('pointermove', (event) => {
      if (!drag || drag.card !== card) return;
      if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8) {
        drag.moved = true;
        drag.ghost = document.createElement('div');
        drag.ghost.className = 'sport-drag-ghost';
        drag.ghost.textContent = card.dataset.sport;
        document.body.appendChild(drag.ghost);
      }
      if (drag.ghost) {
        drag.ghost.style.left = `${event.clientX}px`;
        drag.ghost.style.top = `${event.clientY}px`;
        zones.forEach((zone) => zone.classList.toggle('is-over', zone === document.elementFromPoint(event.clientX, event.clientY)?.closest('.sport-drop-zone')));
      }
    });
    card.addEventListener('pointerup', (event) => {
      if (!drag || drag.card !== card) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.sport-drop-zone');
      const moved = drag.moved;
      drag.ghost?.remove();
      zones.forEach((zone) => zone.classList.remove('is-over'));
      drag = null;
      if (moved && target) attempt(card, target);
    });
    card.addEventListener('pointercancel', () => {
      drag?.ghost?.remove(); drag = null;
      zones.forEach((zone) => zone.classList.remove('is-over'));
    });
  });
  window.addEventListener('resize', updateConnections);
})();
