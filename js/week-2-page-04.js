(() => {
  const intro = document.getElementById('page4-intro-audio');
  const startLayer = document.getElementById('page4-start');
  const startButton = document.getElementById('page4-start-button');
  const board = document.getElementById('page4-match-board');
  const athletes = [...document.querySelectorAll('.athlete-card')];
  const targets = [...document.querySelectorAll('.word-target')];
  const svg = document.getElementById('page4-match-lines');
  const status = document.getElementById('page4-status');
  const completion = document.getElementById('page4-completion');
  const completionVideo = document.getElementById('page4-good-job-video');
  const closeButton = document.getElementById('page4-completion-close');
  const tryAgain = document.getElementById('page4-try-again');
  let ready = false;
  let selected = null;
  let matches = 0;
  let drag = null;

  const speak = (text) => {
    if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish(text);
  };

  const pointInBoard = element => {
    const base = board.getBoundingClientRect();
    return { x:base.width * Number(element.dataset.anchorX) / 100, y:base.height * Number(element.dataset.anchorY) / 100 };
  };

  const drawPath = (athlete, target, fixed = false) => {
    const base = board.getBoundingClientRect();
    svg.setAttribute('viewBox',`0 0 ${base.width} ${base.height}`);
    const from = pointInBoard(athlete); const to = pointInBoard(target);
    const line = document.createElementNS('http://www.w3.org/2000/svg','path');
    const bend = (from.x + to.x) / 2;
    line.setAttribute('d',`M ${from.x} ${from.y} C ${bend} ${from.y}, ${bend} ${to.y}, ${to.x} ${to.y}`);
    line.classList.add('match-path');
    if (fixed) { line.classList.add('is-fixed'); line.dataset.match = athlete.dataset.activity; }
    else line.id = 'preview-path';
    svg.appendChild(line);
  };

  const selectAthlete = athlete => {
    if (!ready || athlete.classList.contains('is-matched')) return;
    selected = athlete;
    athletes.forEach(item => item.classList.toggle('is-selected',item === athlete));
    targets.forEach(target => target.classList.toggle('is-selected',target.dataset.activity === athlete.dataset.activity));
    document.getElementById('preview-path')?.remove();
    drawPath(athlete,targets.find(target => target.dataset.activity === athlete.dataset.activity));
    status.textContent = `Now match the ${athlete.dataset.activity} athlete.`;
  };

  const attemptMatch = (athlete,target) => {
    if (!ready || !athlete || athlete.classList.contains('is-matched')) return;
    if (athlete.dataset.activity !== target.dataset.activity) {
      target.classList.remove('is-selected'); void target.offsetWidth; target.classList.add('is-selected');
      status.textContent = 'Try another word.';
      if (typeof playTone === 'function') { playTone(210,.18,.1,'sawtooth'); playTone(145,.24,.08,'sawtooth',.16); }
      return;
    }
    document.getElementById('preview-path')?.remove();
    athlete.classList.remove('is-selected'); athlete.classList.add('is-matched');
    target.classList.remove('is-selected'); target.classList.add('is-matched');
    athlete.setAttribute('aria-disabled','true'); target.setAttribute('aria-pressed','true');
    drawPath(athlete,target,true);
    matches += 1; selected = null;
    speak(athlete.dataset.sentence);
    status.textContent = athlete.dataset.sentence;
    if (matches === athletes.length) window.setTimeout(showCompletion,2600);
  };

  athletes.forEach(athlete => {
    athlete.addEventListener('click',() => selectAthlete(athlete));
    athlete.addEventListener('keydown',event => { if(event.key === 'Enter' || event.key === ' '){event.preventDefault();selectAthlete(athlete);} });
    athlete.addEventListener('pointerdown',event => {
      if (!ready || athlete.classList.contains('is-matched')) return;
      selectAthlete(athlete);
      drag = { athlete, startX:event.clientX, startY:event.clientY, moved:false, ghost:null };
      athlete.setPointerCapture(event.pointerId);
    });
    athlete.addEventListener('pointermove',event => {
      if (!drag || drag.athlete !== athlete) return;
      if (!drag.moved && Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY) > 8) {
        drag.moved=true; drag.ghost=athlete.querySelector('img').cloneNode(); drag.ghost.className='drag-ghost'; document.body.appendChild(drag.ghost);
      }
      if (drag.ghost) { drag.ghost.style.left=`${event.clientX}px`; drag.ghost.style.top=`${event.clientY}px`; }
    });
    athlete.addEventListener('pointerup',event => {
      if (!drag || drag.athlete !== athlete) return;
      drag.ghost?.remove();
      const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.word-target');
      if (drag.moved && target) attemptMatch(athlete,target);
      drag=null;
    });
  });

  targets.forEach(target => {
    target.addEventListener('click',event => {
      if (event.target.closest('.sentence-speaker')) return;
      if (selected) attemptMatch(selected,target);
      else { target.classList.add('is-selected'); status.textContent='Choose an athlete to match this word.'; }
    });
    target.addEventListener('keydown',event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.sentence-speaker')) {
        event.preventDefault(); target.click();
      }
    });
    target.querySelector('.sentence-speaker').addEventListener('click',event => { event.stopPropagation(); if(ready) speak(target.dataset.activity); });
  });

  const enable = () => { ready=true; status.textContent='Choose or drag an athlete to its word.'; };
  const start = () => { startLayer.hidden=true; status.textContent='Listen carefully…'; intro.currentTime=0; intro.play().catch(enable); };
  startButton.addEventListener('click',start); intro.addEventListener('ended',enable);

  function showCompletion(){ ready=false; completion.hidden=false; completionVideo.currentTime=0; completionVideo.play().catch(speakCompletion); }
  function speakCompletion(){ speak('Good job! You matched all the activities.'); }
  completionVideo.addEventListener('ended',speakCompletion);
  closeButton.addEventListener('click',() => { completionVideo.pause(); completion.hidden=true; });
  tryAgain.addEventListener('click',() => {
    completionVideo.pause(); completion.hidden=true; matches=0; selected=null; ready=false;
    athletes.forEach(item => { item.classList.remove('is-selected','is-matched'); item.setAttribute('aria-disabled','false'); });
    targets.forEach(item => { item.classList.remove('is-selected','is-matched'); item.setAttribute('aria-pressed','false'); });
    svg.innerHTML=''; start();
  });
})();
