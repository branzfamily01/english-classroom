(()=>{
'use strict';

let voices = [];

function toast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>{ el.hidden = true; }, 1800);
}

function loadVoices(){
  if(!('speechSynthesis' in window)) return;
  voices = speechSynthesis.getVoices() || [];
}
loadVoices();
if('speechSynthesis' in window){
  speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

function controls(){
  return {
    mode: document.getElementById('voiceMode')?.value || 'auto',
    rate: Number(document.getElementById('rate')?.value || 1)
  };
}

function pickVoice(mode){
  const english = voices.filter(v => /^en[-_]/i.test(v.lang));
  if(!english.length) return null;
  if(mode === 'auto'){
    return english.find(v => /Samantha|Daniel|Google US English|Microsoft.*(Aria|Jenny|Guy)/i.test(v.name)) || english[0];
  }
  return english.find(v => v.lang.toLowerCase().startsWith(mode.toLowerCase())) || english[0];
}

// Intentionally private. Do NOT export a raw-text speech API.
function speakText(text){
  if(!text){
    toast('この段階では再生する英文がありません');
    return;
  }
  if(!('speechSynthesis' in window)){
    toast('このブラウザは音声読み上げに対応していません');
    return;
  }
  speechSynthesis.cancel();
  const {mode, rate} = controls();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = mode === 'auto' ? 'en-US' : mode;
  utterance.rate = rate;
  const voice = pickVoice(mode);
  if(voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

/**
 * The only public speech entry point.
 * stage === 0 => audioQ only
 * stage >= 1 => audioA, then completed fallback
 */
function speak(item, stage){
  if(!item) return toast('問題データがありません');
  const text = Number(stage) === 0
    ? item.audioQ
    : (item.audioA || item.completed || '');
  speakText(text);
}

window.LessonAudio = Object.freeze({ speak });
})();
