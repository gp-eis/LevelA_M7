(() => {
  const BASE = '../assets/images/week-3/literacy/syd-games/';
  const AUDIO = '../assets/audio/week-3/literacy/';
  const COMPLETION_CLIPS = {
    running: '../assets/video/week-3/literacy/syd-completion/running.mp4',
    jumping: '../assets/video/week-3/literacy/syd-completion/jumping.mp4',
    swimming: '../assets/video/week-3/literacy/syd-completion/swimming.mp4',
    diving: '../assets/video/week-3/literacy/syd-completion/diving.mp4',
    skating: '../assets/video/week-3/literacy/syd-completion/skating.mp4'
  };
  const SPRITE_VERSION = '20260818-clean-3';
  const CLIP_VERSION = '20260827-1';
  const GAMES = {
    running: { title: 'Ready, Set, Run!', instruction: 'Help Syd run to the finish line.', sentence: "It's running." },
    jumping: { title: 'Jump the Hurdle!', instruction: 'Wait for the green glow, then tap Jump!', sentence: "It's jumping." },
    swimming: { title: 'Swim to the Finish!', instruction: 'Alternate Left and Right to help Syd swim.', sentence: "It's swimming." },
    diving: { title: 'Climb and Dive!', instruction: 'Help Syd climb the platform, then get ready to dive.', sentence: "It's diving." },
    skating: { title: 'Follow the Ice Trail!', instruction: 'Tap the glowing snowflakes in order.', sentence: "It's skating." }
  };
  const INITIAL_POSES = {
    running: 'syd-running-ready.png',
    jumping: 'syd-jumping-ready.png',
    swimming: 'syd-swimming-left.png',
    diving: 'syd-diving-ready.png',
    skating: 'syd-skating-step-1.png'
  };
  let overlay, stage, trigger, current, activeAudio, activeCompletionVideo, timerIds = [];

  const clearTimers = () => { timerIds.forEach(id => clearTimeout(id)); timerIds = []; };
  const later = (fn, delay) => { const id = setTimeout(fn, delay); timerIds.push(id); return id; };
  function stopAudio() { if (activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; activeAudio = null; } }
  function stopCompletionVideo() {
    if (!activeCompletionVideo) return;
    activeCompletionVideo.pause();
    activeCompletionVideo.removeAttribute('src');
    activeCompletionVideo.load();
    activeCompletionVideo = null;
  }
  function playSentence() {
    stopAudio();
    activeAudio = new Audio(`${AUDIO}page-04-${current}.mp3`);
    activeAudio.play().catch(() => {});
  }
  function playVideo() {
    close();
    const video = document.getElementById('dialogue-video');
    if (!video || !trigger) return;
    video.src = trigger.dataset.video;
    video.hidden = false;
    video.scrollIntoView({ behavior: 'smooth', block: 'center' });
    video.play().catch(() => {});
  }
  function baseStage(extra = '') {
    const game = GAMES[current];
    stage.dataset.game = current;
    stage.className = 'syd-game-stage';
    stage.innerHTML = `<p class="syd-progress" aria-live="polite">${game.instruction}</p>${extra}<img class="syd-character" data-pose="${INITIAL_POSES[current].replace('.png', '')}" src="${BASE}${INITIAL_POSES[current]}?v=${SPRITE_VERSION}" alt="Syd the koala ${current}"><div class="syd-controls"></div><div class="syd-result" hidden><video class="syd-completion-video" playsinline preload="metadata" aria-label="Syd completes the ${current} activity" hidden></video><div class="syd-result-card" hidden><h3 class="syd-result-title">Great job! ⭐</h3><p class="syd-result-sentence">${game.sentence}</p><button class="syd-sentence-speaker" type="button" aria-label="Listen to ${game.sentence}">🔊</button><div class="syd-result-actions"><button class="pill-btn green" data-again type="button">Play Again</button><button class="pill-btn blue" data-watch type="button">Watch Video ▶</button></div></div></div>`;
    stage.querySelector('[data-again]').onclick = setupGame;
    stage.querySelector('[data-watch]').onclick = playVideo;
    stage.querySelector('.syd-sentence-speaker').onclick = playSentence;
  }
  function progress(text) { stage.querySelector('.syd-progress').textContent = text; }
  function pose(filename, description) {
    const character = stage.querySelector('.syd-character');
    character.src = `${BASE}${filename}?v=${SPRITE_VERSION}`;
    character.dataset.pose = filename.replace('.png', '');
    character.alt = `Syd the koala ${description}`;
  }
  function controls(html) { stage.querySelector('.syd-controls').innerHTML = html; }
  function wrong(button, message) { button.classList.remove('wrong'); void button.offsetWidth; button.classList.add('wrong'); progress(message); }
  function complete() {
    clearTimers();
    stopAudio();
    stopCompletionVideo();
    stage.querySelector('.syd-character').classList.add('celebrate');
    const result = stage.querySelector('.syd-result');
    const clip = result.querySelector('.syd-completion-video');
    const card = result.querySelector('.syd-result-card');
    let revealed = false;
    const revealResult = () => {
      if (revealed || activeCompletionVideo !== clip) return;
      revealed = true;
      activeCompletionVideo = null;
      clip.pause();
      clip.hidden = true;
      clip.controls = false;
      result.classList.remove('is-playing-clip');
      card.hidden = false;
      progress('Great job!');
      playSentence();
    };
    result.hidden = false;
    result.classList.add('is-playing-clip');
    clip.src = `${COMPLETION_CLIPS[current]}?v=${CLIP_VERSION}`;
    clip.hidden = false;
    card.hidden = true;
    activeCompletionVideo = clip;
    clip.addEventListener('ended', revealResult, { once: true });
    clip.addEventListener('error', revealResult, { once: true });
    progress(`Watch Syd finish ${current}!`);
    const playback = clip.play();
    if (playback) playback.catch(() => {
      clip.controls = true;
      progress('Tap play to watch Syd finish!');
    });
  }
  function setupRunning() {
    baseStage();
    controls(['Ready','Set','Go!'].map((label, i) => `<button class="syd-control" data-sequence="${i}" type="button">${label}</button>`).join(''));
    let expected = 0;
    stage.querySelectorAll('[data-sequence]').forEach(button => button.onclick = () => {
      const step = Number(button.dataset.sequence);
      if (step !== expected) { wrong(button, `Press ${['Ready','Set','Go!'][expected]} next.`); return; }
      pose(['syd-running-ready.png', 'syd-running-set.png', 'syd-running-go.png'][step], ['in the ready position', 'in the set position', 'running'][step]);
      button.classList.add('done'); button.disabled = true; expected++;
      if (expected < 3) { progress(`Now press ${['Ready','Set','Go!'][expected]}.`); return; }
      progress('Tap the footprints to help Syd run!');
      controls([1,2,3,4].map(n => `<button class="syd-footprint" data-foot="${n}" type="button" aria-label="Footprint ${n}">👣</button>`).join(''));
      stage.querySelector('.syd-controls').classList.add('syd-path-controls');
      let foot = 1;
      stage.querySelectorAll('[data-foot]').forEach(print => print.onclick = () => {
        const n = Number(print.dataset.foot);
        if (n !== foot) { wrong(print, 'Follow the footprints in order.'); return; }
        print.classList.add('done'); print.disabled = true; stage.classList.add(`run-step-${n}`); foot++;
        if (foot === 5) later(complete, 450);
      });
    });
  }
  function setupJumping() {
    baseStage();
    controls('<button class="syd-control" data-start-jump type="button">Start</button><button class="syd-control" data-jump type="button">Jump!</button>');
    const start = stage.querySelector('[data-start-jump]');
    const jump = stage.querySelector('[data-jump]');
    let ready = false;
    const begin = () => {
      clearTimers(); ready = false; pose('syd-jumping-ready.png', 'bending and preparing to jump'); start.disabled = true; progress('Get ready…');
      later(() => { ready = true; stage.classList.add('jump-ready'); progress('Jump now!'); }, 800);
      later(() => { if (!ready) return; ready = false; stage.classList.remove('jump-ready'); start.disabled = false; progress('Try again—wait for the green glow.'); }, 1900);
    };
    start.onclick = begin;
    jump.onclick = () => {
      if (!ready) { wrong(jump, 'Wait for the green glow.'); return; }
      ready = false; clearTimers(); stage.classList.remove('jump-ready'); pose('syd-jumping-air.png', 'jumping over the hurdle'); start.disabled = true; jump.disabled = true; stage.classList.add('is-jumping'); progress('Syd cleared the hurdle!'); later(complete, 950);
    };
  }
  function setupSwimming() {
    baseStage();
    controls('<button class="syd-control" data-stroke="left" type="button">← Left</button><button class="syd-control" data-stroke="right" type="button">Right →</button>');
    let expected = 'left', count = 0;
    stage.querySelectorAll('[data-stroke]').forEach(button => button.onclick = () => {
      if (button.dataset.stroke !== expected) { wrong(button, `Use the ${expected} stroke next.`); return; }
      pose(`syd-swimming-${button.dataset.stroke}.png`, `using the ${button.dataset.stroke} swimming stroke`);
      count++; stage.classList.add(`swim-step-${count}`); expected = expected === 'left' ? 'right' : 'left'; progress(count < 6 ? `Great! Now tap ${expected}.` : 'Syd reached the finish!');
      if (count === 6) { stage.querySelectorAll('[data-stroke]').forEach(b => b.disabled = true); later(complete, 450); }
    });
  }
  function setupDiving() {
    baseStage();
    stage.classList.add('dive-climbing', 'dive-climb-0');
    progress('Tap the glowing steps to help Syd climb!');
    controls([1,2,3,4].map(n => `<button class="syd-dive-step${n === 1 ? ' current' : ''}" data-climb="${n}" type="button" aria-label="Platform step ${n}">👣</button>`).join(''));
    stage.querySelector('.syd-controls').classList.add('syd-path-controls');
    const labels = ['Ready','Bend','Dive!'];
    const showDiveControls = () => {
      stage.classList.remove('dive-climbing', 'dive-climb-0', 'dive-climb-1', 'dive-climb-2', 'dive-climb-3', 'dive-climb-4');
      stage.classList.add('dive-on-board');
      pose('syd-diving-ready.png', 'standing on top of the diving platform');
      progress('Syd reached the top! Press Ready.');
      stage.querySelector('.syd-controls').classList.remove('syd-path-controls');
      controls(labels.map((label, i) => `<button class="syd-control" data-dive="${i}" type="button">${label}</button>`).join(''));
      let expectedDive = 0;
      stage.querySelectorAll('[data-dive]').forEach(button => button.onclick = () => {
        const step = Number(button.dataset.dive);
        if (step !== expectedDive) { wrong(button, `Press ${labels[expectedDive]} next.`); return; }
        pose(['syd-diving-ready.png', 'syd-diving-bend.png', 'syd-diving-dive.png'][step], `${labels[step]} diving position`);
        button.classList.add('done'); button.disabled = true; expectedDive++; stage.classList.add(`dive-phase-${expectedDive}`);
        progress(expectedDive < 3 ? `Now press ${labels[expectedDive]}.` : 'Splash! Syd made the dive!');
        if (expectedDive === 3) later(complete, 700);
      });
    };
    let expectedClimb = 1;
    stage.querySelectorAll('[data-climb]').forEach(button => button.onclick = () => {
      const step = Number(button.dataset.climb);
      if (step !== expectedClimb) { wrong(button, 'Tap the glowing platform step.'); return; }
      stage.classList.remove(`dive-climb-${step - 1}`);
      stage.classList.add(`dive-climb-${step}`);
      button.classList.remove('current');
      button.classList.add('done');
      button.disabled = true;
      expectedClimb++;
      const next = stage.querySelector(`[data-climb="${expectedClimb}"]`);
      if (next) {
        next.classList.add('current');
        progress('Great! Tap the next glowing step.');
      } else {
        progress('Syd is climbing onto the springboard!');
        later(showDiveControls, 500);
      }
    });
  }
  function setupSkating() {
    baseStage();
    controls([1,2,3,4].map(n => `<button class="syd-skate-step${n === 1 ? ' current' : ''}" data-skate="${n}" type="button" aria-label="Snowflake ${n}">❄</button>`).join(''));
    stage.querySelector('.syd-controls').classList.add('syd-path-controls');
    let expected = 1;
    stage.querySelectorAll('[data-skate]').forEach(button => button.onclick = () => {
      const step = Number(button.dataset.skate);
      if (step !== expected) { wrong(button, 'Tap the glowing snowflake.'); return; }
      pose(`syd-skating-step-${step}.png`, `performing skating step ${step}`);
      button.classList.remove('current'); button.classList.add('done'); button.disabled = true; stage.classList.add(`skate-step-${step}`); expected++;
      const next = stage.querySelector(`[data-skate="${expected}"]`); if (next) next.classList.add('current');
      progress(expected <= 4 ? 'Follow the next glowing snowflake.' : 'Syd finished the ice trail!');
      if (expected === 5) later(complete, 500);
    });
  }
  function setupGame() {
    clearTimers(); stopAudio(); stopCompletionVideo();
    ({ running: setupRunning, jumping: setupJumping, swimming: setupSwimming, diving: setupDiving, skating: setupSkating })[current]();
  }
  function open(button) {
    trigger = button; current = button.dataset.sydGame;
    overlay.querySelector('h2').textContent = GAMES[current].title;
    overlay.querySelector('.syd-game-instruction').textContent = GAMES[current].instruction;
    setupGame(); overlay.hidden = false; document.body.style.overflow = 'hidden'; overlay.querySelector('[data-close]').focus();
  }
  function close() { if (!overlay) return; clearTimers(); stopAudio(); stopCompletionVideo(); overlay.hidden = true; document.body.style.overflow = ''; }
  document.addEventListener('DOMContentLoaded', () => {
    overlay = document.createElement('div'); overlay.className = 'syd-game-overlay'; overlay.hidden = true;
    overlay.innerHTML = '<section class="syd-game-modal" role="dialog" aria-modal="true" aria-labelledby="syd-game-title"><header class="syd-game-head"><h2 id="syd-game-title"></h2><div class="syd-game-actions"><button class="pill-btn orange" data-skip type="button">Skip to Video</button><button class="syd-game-close" data-close type="button" aria-label="Close activity">✕</button></div></header><p class="syd-game-instruction"></p><div class="syd-game-stage"></div></section>';
    document.body.appendChild(overlay); stage = overlay.querySelector('.syd-game-stage');
    overlay.querySelector('[data-close]').onclick = close; overlay.querySelector('[data-skip]').onclick = playVideo;
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) close(); });
    document.querySelectorAll('[data-syd-game]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); event.stopImmediatePropagation(); open(button); }, true));
  });
})();
