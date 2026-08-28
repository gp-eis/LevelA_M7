window.WEEK4_CONTINENTS = [
  {id:'north-america',label:'North America',sentence:'They come from North America.',image:'../../assets/images/week-4/games/continents/north-america.webp'},
  {id:'south-america',label:'South America',sentence:'They come from South America.',image:'../../assets/images/week-4/games/continents/south-america.webp'},
  {id:'europe',label:'Europe',sentence:'They come from Europe.',image:'../../assets/images/week-4/games/continents/europe.webp'},
  {id:'africa',label:'Africa',sentence:'They come from Africa.',image:'../../assets/images/week-4/games/continents/africa-color.webp'},
  {id:'asia',label:'Asia',sentence:'They come from Asia.',image:'../../assets/images/week-4/games/continents/asia-color.webp'},
  {id:'oceania',label:'Oceania',sentence:'They come from Oceania.',image:'../../assets/images/week-4/games/continents/oceania.webp'},
  {id:'antarctica',label:'Antarctica',sentence:'They come from Antarctica.',image:'../../assets/images/week-4/games/continents/antarctica.webp'}
];

window.shuffleContinents = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
};

window.stopContinentNarration = () => {
  if (window.continentNarrationAudio) {
    window.continentNarrationAudio.pause();
    window.continentNarrationAudio.currentTime = 0;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
};

let continentVoice = null;
const chooseContinentVoice = () => {
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  return voices.find((voice) => /Samantha|Ava|Aria|Jenny|Zira|Google US English|Natural|Female/i.test(voice.name) && /^en[-_]US$/i.test(voice.lang || ''))
    || voices.find((voice) => /^en[-_]US$/i.test(voice.lang || ''))
    || voices.find((voice) => /^en/i.test(voice.lang || ''))
    || null;
};
if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', () => { continentVoice = chooseContinentVoice(); });

window.speakContinentSentence = (text, rate = .88) => new Promise((resolve) => {
  if (!('speechSynthesis' in window)) { resolve(); return; }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (!continentVoice) continentVoice = chooseContinentVoice();
  utterance.lang = 'en-US'; utterance.rate = rate; utterance.pitch = 1.06;
  if (continentVoice) utterance.voice = continentVoice;
  utterance.onend = resolve; utterance.onerror = resolve;
  speechSynthesis.speak(utterance);
});

window.playContinentWord = (item, includeSentence = false) => new Promise((resolve) => {
  stopContinentNarration();
  if (!item.audio) {
    speakContinentSentence(item.label, .82).then(() => {
      if (includeSentence) window.setTimeout(() => speakContinentSentence(item.sentence, .88).then(resolve), 220);
      else resolve();
    });
    return;
  }
  const audio = new Audio(item.audio);
  window.continentNarrationAudio = audio;
  const finish = () => {
    if (includeSentence) speakContinentSentence(item.sentence).then(resolve);
    else resolve();
  };
  audio.addEventListener('ended', finish, {once:true});
  audio.addEventListener('error', finish, {once:true});
  audio.play().catch(finish);
});
