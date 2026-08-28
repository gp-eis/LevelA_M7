(() => {
  const games = {
    twisting:{title:'Find the Twisting Pose'},
    running:{title:'Find the Running Pose'},
    stretching:{title:'Find the Stretching Pose'},
    jumping:{title:'Find the Jumping Pose'},
    kicking:{title:'Find the Kicking Pose'}
  };
  const defaultGerry='../assets/images/week-2/literacy/gerry-actions/standing.png';
  const gerryActions={
    standing:'../assets/images/week-2/literacy/gerry-actions/standing.png',
    twisting:'../assets/images/week-2/literacy/gerry-actions/twisting.png',
    running:'../assets/images/week-2/literacy/gerry-actions/running.png',
    stretching:'../assets/images/week-2/literacy/gerry-actions/stretching.png',
    jumping:'../assets/images/week-2/literacy/gerry-actions/jumping.png',
    kicking:'../assets/images/week-2/literacy/gerry-actions/kicking.png'
  };
  const poseClips={
    twisting:'../assets/video/week-2/literacy/pose-clips/twisting.mp4',
    running:'../assets/video/week-2/literacy/pose-clips/running.mp4',
    stretching:'../assets/video/week-2/literacy/pose-clips/stretching.mp4',
    jumping:'../assets/video/week-2/literacy/pose-clips/jumping.mp4',
    kicking:'../assets/video/week-2/literacy/pose-clips/kicking.mp4'
  };
  let overlay,stage,gerry,progress,result,current,trigger,poseTimer=null,activeClip=null;
  let usVoice=null;

  function pickVoice(){
    if(!('speechSynthesis' in window))return;
    const voices=speechSynthesis.getVoices();
    usVoice=voices.find(v=>/^en[-_]US$/i.test(v.lang||'')&&/Samantha|Zira|Jenny|Aria|Google|English/i.test(v.name))||voices.find(v=>/^en[-_]US$/i.test(v.lang||''))||null;
  }
  function say(text){
    if(!('speechSynthesis' in window))return;
    speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.82;u.pitch=1.08;if(usVoice)u.voice=usVoice;speechSynthesis.speak(u);
  }
  function playVideo(){
    close();const video=document.getElementById('dialogue-video');if(!video||!trigger)return;
    video.src=trigger.dataset.video;video.hidden=false;video.scrollIntoView({behavior:'smooth',block:'center'});video.play().catch(()=>{});
  }
  function complete(){
    const word=current;gerry.classList.add('celebrate');
    stage.insertAdjacentHTML('beforeend','<span class="practice-star" aria-hidden="true">⭐</span>');
    result.hidden=false;result.querySelector('.practice-result-word').textContent=word;progress.textContent='Great job!';say(word.charAt(0).toUpperCase()+word.slice(1)+'!');
  }
  function playPoseClip(){
    window.speechSynthesis?.cancel?.();
    const clip=document.createElement('video');
    activeClip=clip;
    clip.className='practice-pose-clip';clip.src=poseClips[current];clip.playsInline=true;clip.preload='auto';clip.setAttribute('aria-label',`${current} action clip`);
    let finished=false;
    const finish=()=>{if(finished)return;finished=true;activeClip=null;clip.remove();complete()};
    clip.addEventListener('ended',finish,{once:true});clip.addEventListener('error',finish,{once:true});
    stage.appendChild(clip);clip.play().catch(finish);
  }
  function controls(html){stage.insertAdjacentHTML('beforeend',`<div class="practice-controls">${html}</div>`)}
  function shuffled(items){
    const copy=[...items];
    for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
    return copy;
  }
  function setupGame(){
    window.clearTimeout(poseTimer);poseTimer=null;if(activeClip){activeClip.pause();activeClip.remove();activeClip=null}
    stage.innerHTML=`<div class="practice-progress" aria-live="polite"></div><img class="practice-gerry" src="${defaultGerry}" alt="Gerry standing"><div class="practice-result" hidden><div class="practice-result-card"><p class="practice-result-word"></p><div class="practice-actions"><button class="pill-btn green" data-again type="button">Play Again</button><button class="pill-btn blue" data-watch type="button">Watch Video</button></div></div></div>`;
    gerry=stage.querySelector('.practice-gerry');progress=stage.querySelector('.practice-progress');result=stage.querySelector('.practice-result');
    result.querySelector('[data-again]').onclick=setupGame;result.querySelector('[data-watch]').onclick=playVideo;
    const actionNames=['twisting','running','stretching','jumping','kicking'];
    const distractors=shuffled(actionNames.filter(name=>name!==current)).slice(0,2);
    const choices=shuffled([current,...distractors]);
    progress.textContent=`Choose the ${current} pose.`;
    controls(`<div class="pose-controls">${choices.map(name=>`<button class="pose-choice" data-pose="${name}" aria-label="${name} pose"><img src="${gerryActions[name]}" alt="Gerry ${name}"></button>`).join('')}</div>`);
    stage.querySelectorAll('[data-pose]').forEach(button=>button.onclick=()=>{
      if(button.dataset.pose===current){
        button.classList.add('correct');
        stage.querySelectorAll('[data-pose]').forEach(choice=>choice.disabled=true);
        gerry.src=gerryActions[current];
        gerry.alt=`Gerry ${current}`;
        progress.textContent=`That is the ${current} pose!`;
        poseTimer=window.setTimeout(playPoseClip,1000);
      }else{
        button.classList.remove('wrong');void button.offsetWidth;button.classList.add('wrong');
        progress.textContent='Try another pose.';
      }
    });
  }
  function open(button){
    trigger=button;current=button.dataset.practiceGame;const game=games[current];
    const spokenInstruction=`Choose the ${current} pose.`;
    overlay.querySelector('h2').textContent=game.title;overlay.querySelector('.practice-instruction').textContent=spokenInstruction;setupGame();overlay.hidden=false;document.body.style.overflow='hidden';overlay.querySelector('[data-close]').focus();window.setTimeout(()=>say(spokenInstruction),250);
  }
  function close(){if(!overlay)return;window.clearTimeout(poseTimer);poseTimer=null;if(activeClip){activeClip.pause();activeClip.remove();activeClip=null}window.speechSynthesis?.cancel?.();overlay.hidden=true;document.body.style.overflow=''}
  document.addEventListener('DOMContentLoaded',()=>{
    pickVoice();window.speechSynthesis?.addEventListener?.('voiceschanged',pickVoice);
    overlay=document.createElement('div');overlay.className='practice-overlay';overlay.hidden=true;overlay.innerHTML='<section class="practice-modal" role="dialog" aria-modal="true" aria-labelledby="practice-title"><header class="practice-head"><h2 id="practice-title"></h2><div class="practice-actions"><button class="pill-btn blue" data-skip type="button">Skip to Video</button><button class="practice-close" data-close type="button" aria-label="Close activity">✕</button></div></header><div class="practice-question-row"><p class="practice-instruction"></p><button class="practice-hear" data-hear-instruction type="button" aria-label="Hear the instruction again">🔊</button></div><div class="practice-stage"></div></section>';document.body.appendChild(overlay);stage=overlay.querySelector('.practice-stage');
    overlay.querySelector('[data-close]').onclick=close;overlay.querySelector('[data-skip]').onclick=playVideo;overlay.querySelector('[data-hear-instruction]').onclick=()=>say(overlay.querySelector('.practice-instruction').textContent);overlay.addEventListener('click',e=>{if(e.target===overlay)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close()});
    document.querySelectorAll('[data-practice-game]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open(btn)},true));
  });
})();
