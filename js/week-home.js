(() => {
  const track = document.querySelector('.learning-carousel');
  const cards = [...document.querySelectorAll('.learning-card')];
  const dots = [...document.querySelectorAll('.carousel-dot')];
  const returnCards = { '#card-literacy':0, '#card-reading':1, '#card-phonics':2, '#card-games':3 };
  if (!track || !cards.length) return;
  let active = Math.min(returnCards[window.location.hash] ?? 0, cards.length - 1);
  const update = () => {
    cards.forEach((card, index) => card.classList.toggle('is-active', index === active));
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === active));
  };
  const show = (index) => {
    active = Math.max(0, Math.min(cards.length - 1, index));
    update();
    cards[active].scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest', inline:'center' });
  };
  document.querySelector('.carousel-arrow.prev')?.addEventListener('click', () => show(active - 1));
  document.querySelector('.carousel-arrow.next')?.addEventListener('click', () => show(active + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
  let timer;
  track.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const middle = track.getBoundingClientRect().left + track.clientWidth / 2;
      active = cards.reduce((best, card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - middle);
        return distance < best.distance ? { index, distance } : best;
      }, { index:active, distance:Infinity }).index;
      update();
    }, 90);
  }, { passive:true });
  addEventListener('load', () => show(active), { once:true });
})();
