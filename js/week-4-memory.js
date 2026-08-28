(() => {
  const items = window.WEEK4_CONTINENTS;
  const PAIR_COUNT = 5;
  const grid = document.getElementById('continent-memory-grid');
  const movesEl = document.getElementById('memory-moves');
  const pairsEl = document.getElementById('memory-pairs');
  const status = document.getElementById('memory-status');
  const modal = document.getElementById('memory-modal');
  const modalImage = document.getElementById('memory-modal-image');
  const modalTitle = document.getElementById('memory-modal-title');
  const modalSentence = document.getElementById('memory-modal-sentence');
  let first = null; let locked = false; let moves = 0; let pairs = 0; let activeItems = [];

  const start = () => {
    stopContinentNarration(); first = null; locked = false; moves = 0; pairs = 0;
    movesEl.textContent = '0'; pairsEl.textContent = '0'; modal.hidden = true;
    status.textContent = 'Find two pictures that match.';
    grid.innerHTML = '';
    activeItems = shuffleContinents(items).slice(0, PAIR_COUNT);
    shuffleContinents([...activeItems,...activeItems]).forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button'; card.className = 'continent-memory-card'; card.dataset.id = item.id;
      card.setAttribute('aria-label','Hidden memory card');
      card.innerHTML = `<img src="${item.image}" alt="${item.label}">`;
      card.addEventListener('click', () => flip(card,item));
      grid.appendChild(card);
    });
  };
  const showMatch = (item) => {
    modalImage.src = item.image; modalImage.alt = item.label;
    modalTitle.textContent = item.label; modalSentence.textContent = item.sentence;
    modal.hidden = false; playContinentWord(item,true);
  };
  const flip = (card,item) => {
    if (locked || card.classList.contains('is-open') || card.classList.contains('is-matched')) return;
    card.classList.add('is-open'); card.setAttribute('aria-label',item.label);
    const wordNarration = playContinentWord(item);
    if (!first) { first = {card,item}; return; }
    moves += 1; movesEl.textContent = moves;
    if (first.item.id === item.id) {
      first.card.classList.add('is-matched'); card.classList.add('is-matched');
      first.card.classList.remove('is-open'); card.classList.remove('is-open');
      pairs += 1; pairsEl.textContent = pairs; locked = true; first = null;
      status.textContent = pairs === activeItems.length ? 'You found all five pairs!' : 'Great match!';
      wordNarration.then(() => setTimeout(() => showMatch(item),400));
    } else {
      locked = true; const previous = first.card; first = null;
      setTimeout(() => { previous.classList.remove('is-open'); card.classList.remove('is-open'); locked = false; status.textContent = 'Try another pair!'; },850);
    }
  };
  document.getElementById('memory-modal-continue').addEventListener('click', () => { modal.hidden = true; locked = false; if (pairs === activeItems.length) status.textContent = 'Amazing! You matched all five pairs!'; });
  document.getElementById('memory-restart').addEventListener('click',start);
  document.getElementById('memory-preview').addEventListener('click',() => { if (locked) return; locked = true; grid.querySelectorAll('.continent-memory-card').forEach(card=>card.classList.add('is-open')); setTimeout(()=>{grid.querySelectorAll('.continent-memory-card:not(.is-matched)').forEach(card=>card.classList.remove('is-open'));locked=false;},3000); });
  start();
})();
