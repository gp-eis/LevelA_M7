(() => {
  const PUZZLE_IMAGE = '../assets/images/week-4/literacy/page-02-puzzle/';
  const CONTINENT_IMAGE = '../assets/images/week-4/games/continents/';
  const VIDEO = '../assets/video/week-4/literacy/';

  const puzzles = {
    asia: {
      name: 'Asia', video: `${VIDEO}asia.mp4`,
      board: `${PUZZLE_IMAGE}asia-board-v2.webp`, boardRatio:1.131,
      pieces: [
        { id:'lotte', label:'Lotte World Tower', pos:[18.2,19.5], box:[14.2,38.8], ratio:.582, image:`${PUZZLE_IMAGE}asia-lotte-piece-v2.webp` },
        { id:'fuji', label:'Mount Fuji', pos:[35.3,36.3], box:[28.2,19.2], ratio:1.108, image:`${PUZZLE_IMAGE}asia-fuji-piece-v2.webp` },
        { id:'wall', label:'Great Wall of China', pos:[65.7,26.6], box:[23.4,27.8], ratio:.852, image:`${PUZZLE_IMAGE}asia-wall-piece-v2.webp` }
      ]
    },
    europe: {
      name: 'Europe', video: `${VIDEO}europe.mp4`,
      board: `${PUZZLE_IMAGE}europe-board-v2.webp`, boardRatio:1.103,
      pieces: [
        { id:'eiffel', label:'Eiffel Tower', pos:[18.0,23.0], box:[19.7,33.2], ratio:.699, image:`${PUZZLE_IMAGE}europe-eiffel-piece-v2.webp` },
        { id:'big-ben', label:'Big Ben', pos:[71.5,10.7], box:[10.2,40.0], ratio:.399, image:`${PUZZLE_IMAGE}europe-big-ben-piece-v2.webp` },
        { id:'colosseum', label:'Colosseum', pos:[41.5,41.2], box:[28.0,20.4], ratio:.92, image:`${PUZZLE_IMAGE}europe-colosseum-piece-v2.webp` }
      ]
    },
    'north-america': {
      name: 'North America', video: `${VIDEO}america.mp4`, overlayName:true,
      board: `${PUZZLE_IMAGE}north-america-board-v2.webp`, boardRatio:1,
      pieces: [
        { id:'golden-gate', label:'Golden Gate Bridge', pos:[25.5,46.3], box:[32.5,22], ratio:1.193, image:`${PUZZLE_IMAGE}america-golden-gate-piece-v2.webp` },
        { id:'liberty', label:'Statue of Liberty', pos:[60.5,32.5], box:[13.5,40], ratio:.768, image:`${PUZZLE_IMAGE}america-liberty-piece-v2.webp` },
        { id:'cn-tower', label:'CN Tower', pos:[47.2,10], box:[9.2,41], ratio:.21, image:`${PUZZLE_IMAGE}north-america-cn-tower-v2.webp` }
      ]
    },
    'south-america': {
      name: 'South America', video: `${VIDEO}america.mp4`, overlayName:true,
      board: `${PUZZLE_IMAGE}south-america-board-v2.webp`, boardRatio:1,
      pieces: [
        { id:'machu-picchu', label:'Machu Picchu', pos:[28,10.5], box:[24,22], ratio:1.18, image:`${PUZZLE_IMAGE}south-america-machu-picchu-v2.webp` },
        { id:'angel-falls', label:'Angel Falls', pos:[51.5,16], box:[15.5,27], ratio:.55, image:`${PUZZLE_IMAGE}south-america-angel-falls-v2.webp` },
        { id:'redeemer', label:'Christ the Redeemer', pos:[42,43], box:[23.5,26], ratio:.95, image:`${PUZZLE_IMAGE}america-redeemer-piece-v2.webp` }
      ]
    },
    africa: {
      name: 'Africa', video: `${VIDEO}africa.mp4`,
      board: `${PUZZLE_IMAGE}africa-board-v2.webp`, boardRatio:1.138,
      pieces: [
        { id:'pyramids', label:'Pyramids and Sphinx', pos:[14.0,12.8], box:[35.7,22.0], ratio:1, image:`${PUZZLE_IMAGE}africa-pyramids-piece-v2.webp` },
        { id:'giraffe', label:'Giraffe', pos:[41.9,26.0], box:[17.1,29.6], ratio:.93, image:`${PUZZLE_IMAGE}africa-giraffe-piece-v2.webp` },
        { id:'table-mountain', label:'Table Mountain', pos:[45.0,58.7], box:[31.0,13.0], ratio:1.14, image:`${PUZZLE_IMAGE}africa-table-mountain-piece-v2.webp` }
      ]
    },
    oceania: {
      name: 'Oceania', video: `${VIDEO}oceania.mp4`,
      board: `${PUZZLE_IMAGE}oceania-board-v3.webp`, boardRatio:1.5,
      pieces: [
        { id:'opera', label:'Sydney Opera House', pos:[13.0,35.6], box:[22.4,21.1], ratio:1.429, image:`${PUZZLE_IMAGE}australia-opera-piece-v2.webp` },
        { id:'harbour', label:'Sydney Harbour Bridge', pos:[37.3,40.3], box:[25.2,17.1], ratio:1.98, image:`${PUZZLE_IMAGE}australia-harbour-piece-v2.webp` },
        { id:'uluru', label:'Uluru', pos:[64.6,41.8], box:[23.1,14.0], ratio:1.922, image:`${PUZZLE_IMAGE}australia-uluru-piece-v2.webp` }
      ]
    },
    antarctica: {
      name: 'Antarctica', video: `${VIDEO}antarctica.mp4`, overlayName:true,
      board: `${PUZZLE_IMAGE}antarctica-board-v2.webp`, boardRatio:1,
      pieces: [
        { id:'penguin', label:'Emperor Penguin', pos:[23,39], box:[17.5,21.5], ratio:.82, image:`${PUZZLE_IMAGE}antarctica-penguin-v2.webp` },
        { id:'south-pole', label:'South Pole Marker', pos:[46,43], box:[12,25], ratio:.48, image:`${PUZZLE_IMAGE}antarctica-pole-v2.webp` },
        { id:'station', label:'Research Station', pos:[61.5,47.5], box:[24,20.5], ratio:1.2, image:`${PUZZLE_IMAGE}antarctica-station-v2.webp` }
      ]
    },
    world: {
      name: 'All Over the World', video: `${VIDEO}all-over-the-world.mp4`, world:true,
      pieces: [
        { id:'north-america', label:'North America', image:`${CONTINENT_IMAGE}north-america.webp` },
        { id:'south-america', label:'South America', image:`${CONTINENT_IMAGE}south-america.webp` },
        { id:'europe', label:'Europe', image:`${CONTINENT_IMAGE}europe.webp` },
        { id:'africa', label:'Africa', image:`${CONTINENT_IMAGE}africa-color.webp` },
        { id:'asia', label:'Asia', image:`${CONTINENT_IMAGE}asia-color.webp` },
        { id:'oceania', label:'Oceania', image:`${CONTINENT_IMAGE}oceania.webp` },
        { id:'antarctica', label:'Antarctica', image:`${CONTINENT_IMAGE}antarctica.webp` }
      ]
    }
  };

  const modal = document.createElement('div');
  modal.className = 'continent-puzzle-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <section class="continent-puzzle-card" role="dialog" aria-modal="true" aria-labelledby="continent-puzzle-title">
      <button class="continent-puzzle-skip" type="button">Skip to Video ⏭️</button>
      <button class="continent-puzzle-close" type="button" aria-label="Close puzzle">×</button>
      <header class="continent-puzzle-heading">
        <h2 id="continent-puzzle-title" class="continent-puzzle-title"></h2>
        <p class="continent-puzzle-instruction"></p>
      </header>
      <div class="continent-puzzle-layout">
        <div class="continent-puzzle-board" aria-label="Puzzle board"></div>
        <div class="continent-puzzle-tray" role="group" aria-label="Draggable puzzle pieces"></div>
      </div>
      <p class="continent-puzzle-status" role="status" aria-live="polite"></p>
      <div class="continent-puzzle-result" hidden>
        <section class="continent-puzzle-result-card" role="dialog" aria-modal="true" aria-labelledby="continent-puzzle-result-title">
          <div class="continent-puzzle-stars" aria-hidden="true">⭐ 🌟 ⭐</div>
          <h3 id="continent-puzzle-result-title">Great job!</h3>
          <p class="continent-puzzle-result-message"></p>
          <div class="continent-puzzle-result-actions">
            <button class="continent-puzzle-again" type="button">↻ Try Again</button>
            <button class="continent-puzzle-watch" type="button">▶ Watch Video</button>
          </div>
        </section>
      </div>
    </section>`;
  document.body.appendChild(modal);

  const card = modal.querySelector('.continent-puzzle-card');
  const title = modal.querySelector('.continent-puzzle-title');
  const instruction = modal.querySelector('.continent-puzzle-instruction');
  const board = modal.querySelector('.continent-puzzle-board');
  const tray = modal.querySelector('.continent-puzzle-tray');
  const status = modal.querySelector('.continent-puzzle-status');
  const close = modal.querySelector('.continent-puzzle-close');
  const skip = modal.querySelector('.continent-puzzle-skip');
  const result = modal.querySelector('.continent-puzzle-result');
  const resultMessage = modal.querySelector('.continent-puzzle-result-message');
  const again = modal.querySelector('.continent-puzzle-again');
  const watch = modal.querySelector('.continent-puzzle-watch');
  let current = null;
  let selected = null;
  let completed = 0;
  let completionTimer = 0;
  let drag = null;
  let dragScrollFrame = 0;
  let boardObserver = null;
  let completionAudio = null;

  const speak = (text, options = {}) => {
    if (typeof speakAmericanEnglish === 'function') return speakAmericanEnglish(text, options);
    return false;
  };

  function landmarkArt(piece, silhouette = false) {
    return `<img class="puzzle-sprite${silhouette ? ' is-silhouette' : ''}" style="--piece-ratio:${piece.ratio}" src="${piece.image}" alt="" draggable="false">`;
  }

  function worldArt(piece, silhouette = false) {
    return `<img class="world-art${silhouette ? ' is-silhouette' : ''}" src="${piece.image}" alt="" draggable="false">`;
  }

  function setStatus(message) { status.textContent = message; }

  function buildPuzzle(key) {
    current = puzzles[key];
    selected = null;
    completed = 0;
    window.clearTimeout(completionTimer);
    completionAudio?.pause();
    completionAudio = null;
    result.hidden = true;
    card.dataset.theme = key;
    skip.disabled = !current.video;
    skip.textContent = current.video ? 'Skip to Video ⏭️' : 'Video Coming Soon 🎬';
    watch.disabled = !current.video;
    watch.textContent = current.video ? '▶ Watch Video' : 'Video Coming Soon 🎬';
    title.textContent = current.world ? 'Build the World Map!' : `Build ${current.name}!`;
    instruction.textContent = current.world
      ? 'Drag each continent to its place on the world map.'
      : 'Drag each landmark to its matching shadow.';
    setStatus('Choose a puzzle piece.');
    boardObserver?.disconnect();
    boardObserver = null;
    board.className = `continent-puzzle-board${current.world ? ' is-world' : ''}`;
    board.innerHTML = '';
    tray.innerHTML = '';

    if (current.world) {
      board.innerHTML = '<div class="world-route" aria-hidden="true"></div><strong class="world-center-label">7 continents<br>of the World</strong>';
      current.pieces.forEach((piece) => {
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'continent-puzzle-slot';
        slot.dataset.piece = piece.id;
        slot.setAttribute('aria-label', `${piece.label} space`);
        slot.innerHTML = `${worldArt(piece, true)}<span class="puzzle-slot-label">${piece.label}</span>`;
        board.appendChild(slot);
      });
    } else {
      const mapStage = document.createElement('div');
      mapStage.className = 'continent-map-stage';
      const map = document.createElement('img');
      map.className = 'continent-map-image';
      map.src = current.board;
      map.alt = `Colorful map of ${current.name}`;
      map.draggable = false;
      mapStage.appendChild(map);
      if (current.overlayName) {
        const mapName = document.createElement('strong');
        mapName.className = 'continent-map-name';
        mapName.textContent = current.name;
        mapStage.appendChild(mapName);
      }
      board.appendChild(mapStage);
      current.pieces.forEach((piece) => {
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'continent-puzzle-slot';
        slot.dataset.piece = piece.id;
        slot.style.left = `${piece.pos[0]}%`;
        slot.style.top = `${piece.pos[1]}%`;
        slot.style.width = `${piece.box[0]}%`;
        slot.style.height = `${piece.box[1]}%`;
        slot.setAttribute('aria-label', `${piece.label} shadow`);
        slot.innerHTML = `${landmarkArt(piece, true)}<span class="puzzle-slot-label">${piece.label}</span>`;
        if (current.dynamicSlots) slot.classList.add('is-dynamic');
        mapStage.appendChild(slot);
      });
      const boardRatio = current.boardRatio;
      const fitMapStage = () => {
        const availableWidth = board.clientWidth * .94;
        const availableHeight = board.clientHeight * .94;
        let width = availableWidth;
        let height = width / boardRatio;
        if (height > availableHeight) {
          height = availableHeight;
          width = height * boardRatio;
        }
        mapStage.style.width = `${width}px`;
        mapStage.style.height = `${height}px`;
      };
      boardObserver = new ResizeObserver(fitMapStage);
      boardObserver.observe(board);
      map.addEventListener('load', fitMapStage, { once:true });
      window.requestAnimationFrame(fitMapStage);
    }

    current.pieces.forEach((piece, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'continent-puzzle-piece';
      button.dataset.piece = piece.id;
      button.setAttribute('aria-label', `${piece.label}. Select or drag this piece.`);
      button.innerHTML = `${current.world ? worldArt(piece) : landmarkArt(piece)}<span>${piece.label}</span>`;
      tray.appendChild(button);
    });

    board.querySelectorAll('.continent-puzzle-slot').forEach((slot) => {
      slot.addEventListener('click', () => selected ? attempt(selected, slot) : setStatus('Choose a piece first.'));
    });
    tray.querySelectorAll('.continent-puzzle-piece').forEach(setupPiece);
  }

  function setupPiece(piece) {
    piece.addEventListener('click', () => {
      if (piece.dataset.ignoreClick === 'true') { piece.dataset.ignoreClick = 'false'; return; }
      selected?.classList.remove('is-selected');
      selected = piece;
      piece.classList.add('is-selected');
      const label = current.pieces.find((item) => item.id === piece.dataset.piece)?.label;
      setStatus(`Now choose the ${label} shadow.`);
      speak(label, { rate:.78 });
    });
    piece.addEventListener('pointerdown', startDrag);
  }

  function startDrag(event) {
    if (event.button !== undefined && event.button !== 0) return;
    const piece = event.currentTarget;
    drag = { piece, startX:event.clientX, startY:event.clientY, pointerY:event.clientY, ghost:null, moved:false };
    piece.setPointerCapture?.(event.pointerId);
    piece.addEventListener('pointermove', moveDrag);
    piece.addEventListener('pointerup', endDrag, { once:true });
    piece.addEventListener('pointercancel', endDrag, { once:true });
  }

  function moveDrag(event) {
    if (!drag) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 7) return;
    drag.moved = true;
    drag.pointerY = event.clientY;
    event.preventDefault();
    if (!drag.ghost) {
      drag.ghost = drag.piece.cloneNode(true);
      drag.ghost.className = 'puzzle-drag-ghost';
      document.body.appendChild(drag.ghost);
    }
    drag.ghost.style.left = `${event.clientX}px`;
    drag.ghost.style.top = `${event.clientY}px`;
    scrollDragAtPointer();
    if (!dragScrollFrame) dragScrollFrame = window.requestAnimationFrame(autoScrollDrag);
  }

  function scrollDragAtPointer() {
    if (!drag?.moved || !window.matchMedia('(max-width: 820px)').matches) return;
    const bounds = card.getBoundingClientRect();
    const edge = Math.min(110, bounds.height * .24);
    const topEdge = bounds.top + edge;
    const bottomEdge = bounds.bottom - edge;
    let speed = 0;
    if (drag.pointerY < topEdge) {
      speed = -Math.min(22, 5 + ((topEdge - drag.pointerY) / edge) * 17);
    } else if (drag.pointerY > bottomEdge) {
      speed = Math.min(22, 5 + ((drag.pointerY - bottomEdge) / edge) * 17);
    }
    if (speed) card.scrollTop += speed;
  }

  function autoScrollDrag() {
    dragScrollFrame = 0;
    if (!drag?.moved) return;
    scrollDragAtPointer();
    dragScrollFrame = window.requestAnimationFrame(autoScrollDrag);
  }

  function stopDragAutoScroll() {
    if (dragScrollFrame) window.cancelAnimationFrame(dragScrollFrame);
    dragScrollFrame = 0;
  }

  function endDrag(event) {
    if (!drag) return;
    stopDragAutoScroll();
    const { piece, ghost, moved } = drag;
    piece.removeEventListener('pointermove', moveDrag);
    ghost?.remove();
    if (moved) {
      piece.dataset.ignoreClick = 'true';
      const matchingSlot = board.querySelector(`.continent-puzzle-slot[data-piece="${piece.dataset.piece}"]`);
      const matchingBounds = matchingSlot?.getBoundingClientRect();
      const isInsideMatchingSlot = matchingBounds
        && event.clientX >= matchingBounds.left
        && event.clientX <= matchingBounds.right
        && event.clientY >= matchingBounds.top
        && event.clientY <= matchingBounds.bottom;
      const target = isInsideMatchingSlot
        ? matchingSlot
        : document.elementFromPoint(event.clientX, event.clientY)?.closest('.continent-puzzle-slot');
      attempt(piece, target);
    }
    drag = null;
  }

  function attempt(piece, slot) {
    if (!piece || piece.classList.contains('is-placed')) return;
    if (!slot || slot.dataset.piece !== piece.dataset.piece) {
      wrong(piece, slot);
      return;
    }
    place(piece, slot);
  }

  function wrong(piece, slot) {
    piece.classList.remove('is-wrong');
    slot?.classList.remove('is-wrong');
    void piece.offsetWidth;
    piece.classList.add('is-wrong');
    slot?.classList.add('is-wrong');
    setStatus('Oops! Try a different space.');
    if (typeof playTone === 'function') {
      playTone(190, .14, .08, 'sawtooth');
      playTone(145, .17, .06, 'sawtooth', .12);
    }
    window.setTimeout(() => {
      piece.classList.remove('is-wrong');
      slot?.classList.remove('is-wrong');
      setStatus('Try again. Match the shapes.');
    }, 720);
  }

  function place(piece, slot) {
    const data = current.pieces.find((item) => item.id === piece.dataset.piece);
    selected?.classList.remove('is-selected');
    selected = null;
    piece.classList.add('is-placed');
    piece.disabled = true;
    slot.classList.add('is-correct');
    slot.disabled = true;
    slot.querySelector('.is-silhouette')?.classList.remove('is-silhouette');
    completed += 1;
    setStatus(`Great! ${data.label} fits!`);
    if (typeof playTone === 'function') {
      playTone(620, .13, .08, 'triangle');
      playTone(860, .18, .07, 'triangle', .12);
    }
    speak(data.label, { rate:.76 });
    if (completed === current.pieces.length) completionTimer = window.setTimeout(completePuzzle, 1150);
  }

  function completePuzzle() {
    setStatus(`Wonderful! This is ${current.name}!`);
    if (typeof playTone === 'function') {
      playTone(660, .18, .1, 'triangle');
      playTone(880, .18, .09, 'triangle', .16);
      playTone(1100, .28, .08, 'triangle', .32);
    }
    resultMessage.textContent = current.world
      ? 'You completed the world map!'
      : `You completed the ${current.name} landmark puzzle!`;
    result.hidden = false;
    again.focus();
    if (current.audio) {
      completionAudio = new Audio(current.audio);
      completionAudio.play().catch(() => speak(current.name, { rate:.74 }));
    } else speak(current.name, { rate:.74 });
  }

  function playCurrentVideo() {
    const config = current;
    if (!config.video) {
      if (typeof showToast === 'function') showToast('The Antarctica video is coming soon!');
      return;
    }
    hidePuzzle(false);
    const video = document.getElementById('dialogue-video');
    if (!video) return;
    if (video.getAttribute('src') !== config.video) video.src = config.video;
    video.hidden = false;
    video.scrollIntoView({ behavior:'smooth', block:'center' });
    video.play().catch(() => typeof showToast === 'function' && showToast('Tap Play to watch the video!'));
  }

  function showPuzzle(key) {
    buildPuzzle(key);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    close.focus();
    window.setTimeout(() => speak(instruction.textContent, { rate:.8 }), 180);
  }

  function hidePuzzle(cancelSpeech = true) {
    window.clearTimeout(completionTimer);
    completionAudio?.pause();
    completionAudio = null;
    result.hidden = true;
    modal.hidden = true;
    document.body.style.overflow = '';
    drag?.ghost?.remove();
    stopDragAutoScroll();
    drag = null;
    if (cancelSpeech && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  document.querySelectorAll('[data-continent-puzzle]').forEach((button) => {
    button.addEventListener('click', () => showPuzzle(button.dataset.continentPuzzle));
  });
  close.addEventListener('click', () => hidePuzzle());
  skip.addEventListener('click', playCurrentVideo);
  again.addEventListener('click', () => buildPuzzle(card.dataset.theme));
  watch.addEventListener('click', playCurrentVideo);
  modal.addEventListener('click', (event) => { if (event.target === modal) hidePuzzle(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) hidePuzzle(); });
})();
