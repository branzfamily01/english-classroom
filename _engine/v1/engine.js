(()=>{
'use strict';

const meta = window.LESSON_META || {};
const data = window.LESSON_DATA || [];
const Audio = window.LessonAudio;
const FINAL = window.LESSON_FINAL_CHECK || null;

const FLOWS = Object.freeze({
  blank:     ['problem','answer','reason','wrong','translation','output'],
  choice:    ['problem','answer','reason','wrong','translation','output'],
  order:     ['problem','answer','reason','wrong','translation','output'],
  translate: ['problem','answer','reason','output'],
  write:     ['problem','answer','reason','output']
});

const app = document.getElementById('app');
const stage = document.getElementById('stage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const menuBtn = document.getElementById('menuBtn');
const toolbar = document.querySelector('.toolbar');
const drawer = document.getElementById('drawer');
const closeDrawer = document.getElementById('closeDrawer');
const qList = document.getElementById('questionList');
const slideCounter = document.getElementById('slideCounter');
const stepDots = document.getElementById('stepDots');
const rate = document.getElementById('rate');
const rateValue = document.getElementById('rateValue');
const toast = document.getElementById('toast');
const drawerTitle = document.getElementById('drawerTitle');

let slideIndex = -2;
let step = 0;
let backupHidden = 0;
let finalStep = 0;
let finalReveal = new Set();
let finalBackupHidden = 0;

function esc(s=''){
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] || c));
}
function current(){ return data[slideIndex]; }
function currentFlow(){
  const q=current();
  const base=[...(FLOWS[q?.format] || FLOWS.choice)];
  const hints=Array.isArray(q?.hints) ? q.hints : [];
  if(!hints.length) return base;
  return [base[0], ...hints.map((_,i)=>`hint:${i}`), ...base.slice(1)];
}
function currentStage(){ return currentFlow()[step] || 'problem'; }
function maxStep(){ return Math.max(0,currentFlow().length-1); }
function isHintStage(name){ return String(name).startsWith('hint:'); }
function answerVisible(name){ return name!=='problem' && !isHintStage(name); }
function finalSections(){ return Array.isArray(FINAL?.sections) ? FINAL.sections : []; }
function finalMaxStep(){ return Math.max(0,finalSections().length-1); }

function showToast(msg){
  if(!toast) return;
  toast.textContent=msg; toast.hidden=false;
  clearTimeout(showToast._t);
  showToast._t=setTimeout(()=>{toast.hidden=true;},1800);
}
function labelForStage(name){
  if(isHintStage(name)) return `Hint ${Number(name.split(':')[1])+1}`;
  return ({problem:'Question',answer:'Check',reason:'Why?',wrong:'Watch out',translation:'Meaning',output:'Say it'})[name] || '';
}
function makeDots(){
  stepDots.innerHTML='';
  if(slideIndex<0 || slideIndex>=data.length) return;
  currentFlow().forEach((name,i)=>{
    const d=document.createElement('span');
    d.className='step-dot'+(i<=step?' on':'');
    d.title=labelForStage(name);
    stepDots.appendChild(d);
  });
}
function counterText(){
  if(slideIndex===-2) return 'START';
  if(slideIndex===-1) return 'GUIDE';
  if(slideIndex===data.length){
    const n=finalSections().length;
    return n ? `FINAL ${Math.min(finalStep+1,n)} / ${n}` : 'FINAL';
  }
  return `${slideIndex+1} / ${data.length}`;
}

function renderCover(){
  stage.className='stage cover-stage clickable';
  const level=meta.grade ? `高校${meta.grade}年` : (meta.level||'');
  stage.innerHTML=`
    <div class="intro lesson-cover-copy">
      <div class="eyebrow">${esc(level)}${level&&meta.series?' / ':''}${esc(meta.series||'')}</div>
      <h1>${esc(meta.title||'Lesson')}</h1>
      <div class="teacher-voice-copy cover-message">
        <p class="en">First, think for yourself.<br>Then check the answer and see why it works.<br>We’ll finish by using the English yourself.</p>
        <p class="jp">まずは自分で考えてみよう。答えを確認したら、「なぜそうなるのか」まで見ていこう。最後は自分で英語を使ってみよう。</p>
      </div>
    </div>`;
}
function renderGuide(){
  stage.className='stage clickable';
  stage.innerHTML=`
    <div class="topline"><span class="qno">How we'll learn</span><span class="section">学び方</span></div>
    <h1 class="bilingual-title"><span>Think first. Then find out why.</span><small>まず自分で考えて、そのあと「なぜ」を確かめよう。</small></h1>
    <div class="guide-grid student-guide-grid">
      <div class="guide-card"><b>Think</b><p>まず、自分で考えてみよう。</p></div>
      <div class="guide-card"><b>Get a hint</b><p>困ったら、ヒントを一つずつ使おう。</p></div>
      <div class="guide-card"><b>Check</b><p>答えを確かめよう。</p></div>
      <div class="guide-card"><b>See why</b><p>「なぜそうなる？」まで見ていこう。</p></div>
      <div class="guide-card"><b>Say it</b><p>最後は、見ないで英語を言ってみよう。</p></div>
    </div>
    ${meta.teacherMode===false?'<div class="student-ops"><b>Use → / ← to move.</b><span>→ / ← で進む・戻る。🔊 で音声、🗺 地図で全体を確認できます。</span></div>':''}`;
}

function finalQuick(section){
  const items=section.items||[];
  return `<div class="final-screen"><div class="final-kicker">${esc(section.kicker||'QUICK RESPONSE')}</div><h1>${esc(section.title||'Quick Response')}</h1><p class="final-lead">${esc(section.leadEn||'Say it before you check.')}</p><p class="final-lead-jp">${esc(section.leadJp||'答えを見る前に、声に出してみよう。')}</p><div class="quick-grid">${items.map((x,i)=>{
    const open=finalReveal.has(i);
    return `<article class="quick-card"><div class="quick-cue">${esc(x.cue)}</div><button class="mini-check" type="button" data-action="final-reveal" data-index="${i}">${open?'Hide':'Check'}</button>${open?`<div class="quick-answer">${esc(x.answer)}</div>`:''}</article>`;
  }).join('')}</div></div>`;
}
function finalChoice(section){
  const items=section.items||[];
  return `<div class="final-screen"><div class="final-kicker">${esc(section.kicker||'WHICH ONE?')}</div><h1>${esc(section.title||'Which one?')}</h1><p class="final-lead">${esc(section.leadEn||'Choose first. Then check why.')}</p><p class="final-lead-jp">${esc(section.leadJp||'先に選んでから、理由を確かめよう。')}</p><div class="final-choice-list">${items.map((x,i)=>{
    const open=finalReveal.has(i);
    return `<article class="final-choice-card"><div><b>${esc(x.cue)}</b>${x.note?`<small>${esc(x.note)}</small>`:''}</div><button class="mini-check" type="button" data-action="final-reveal" data-index="${i}">${open?'Hide':'Check'}</button>${open?`<div class="final-choice-answer"><strong>${esc(x.answer)}</strong><span>${esc(x.why||'')}</span></div>`:''}</article>`;
  }).join('')}</div></div>`;
}
function backupMarkup(cue,chunks,hidden){
  const n=chunks.length;
  return `<div class="backup-practice"><div class="backup-cue">${esc(cue||'')}</div><div class="backup-chunks">${chunks.map((c,i)=>{
    const hide=i>=n-hidden;
    return hide?'<span class="backup-chunk is-hidden" aria-label="hidden phrase">••••••</span>':`<span class="backup-chunk">${esc(c)}</span>`;
  }).join('<span class="chunk-divider">/</span>')}</div>${hidden>=n?'<div class="backup-ready"><b>Say it from Japanese.</b><span>日本語だけを見て言ってみよう。</span></div>':''}</div>`;
}
function finalBackup(section){
  const chunks=section.chunks||[];
  return `<div class="final-screen"><div class="final-kicker">BACK UP CHALLENGE</div><h1>${esc(section.title||'Say the whole sentence.')}</h1><p class="final-lead">Start with the whole sentence. Hide it from the end.</p><p class="final-lead-jp">全文を見てから、文末側から少しずつ隠していこう。</p>${backupMarkup(section.cue,chunks,finalBackupHidden)}<div class="output-actions"><button class="action-btn" type="button" data-action="final-hide-more" ${finalBackupHidden>=chunks.length?'disabled':''}>Hide one more</button><button class="action-btn secondary" type="button" data-action="final-show-all">Show all</button>${section.audio?'<button class="action-btn secondary" type="button" data-action="final-audio">🔊 Listen</button>':''}</div></div>`;
}
function finalTry(section){
  const items=section.items||[];
  return `<div class="final-screen"><div class="final-kicker">ONE LAST TRY</div><h1>${esc(section.title||'Can you say it?')}</h1><p class="final-lead">Say the English before you check.</p><p class="final-lead-jp">答えを見る前に、英語で言ってみよう。</p><div class="last-try-list">${items.map((x,i)=>{
    const open=finalReveal.has(i);
    return `<article class="last-try-card"><div class="last-try-cue">${esc(x.cue)}</div><button class="mini-check" type="button" data-action="final-reveal" data-index="${i}">${open?'Hide':'Check'}</button>${open?`<div class="last-try-answer">${esc(x.answer)}</div>`:''}</article>`;
  }).join('')}</div></div>`;
}
function finalFinish(section){
  return `<div class="intro final-finish" style="color:var(--ink)"><div class="eyebrow">LESSON COMPLETE</div><h1 style="color:var(--navy)">${esc(section.title||'Nice work.')}</h1><p class="en-finish">${esc(section.leadEn||'You can now choose, explain, and say the key English from this lesson.')}</p><p class="jp-finish">${esc(section.leadJp||'今日の英語を、選ぶだけでなく、理由を説明して口から出せるところまで確認できました。')}</p><div class="output-actions"><button class="action-btn" type="button" data-action="open-menu">Review a question</button><button class="action-btn secondary" type="button" data-action="restart">Start again</button></div></div>`;
}
function renderEnd(){
  stage.className='stage final-stage';
  const sections=finalSections();
  if(!sections.length){
    stage.innerHTML=`<div class="intro final-finish" style="color:var(--ink)"><div class="eyebrow">LESSON COMPLETE</div><h1 style="color:var(--navy)">Nice work.</h1><p class="jp-finish">今日の学習を終えました。</p><div class="output-actions"><button class="action-btn" type="button" data-action="open-menu">Review a question</button></div></div>`;
    return;
  }
  const s=sections[Math.min(finalStep,sections.length-1)];
  if(s.type==='quick') stage.innerHTML=finalQuick(s);
  else if(s.type==='choice') stage.innerHTML=finalChoice(s);
  else if(s.type==='backup') stage.innerHTML=finalBackup(s);
  else if(s.type==='try') stage.innerHTML=finalTry(s);
  else stage.innerHTML=finalFinish(s);
}

function normalizedChoice(s){ return String(s||'').replace(/^[①②③④⑤⑥⑦⑧]\s*/,'').trim(); }
function hintPanel(q,stageName){
  const i=Number(stageName.split(':')[1]);
  const h=q.hints?.[i]||{};
  const visual=h.visualHtml?`<div class="hint-visual">${h.visualHtml}</div>`:'';
  const look=(h.lookAt||[]).length?`<div class="hint-look">${h.lookAt.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'';
  return `<div class="stage-panel hint-panel"><div class="panel-label hint">Hint ${i+1}</div><div class="hint-en">${esc(h.en||'Take another look.')}</div><div class="hint-jp">${esc(h.jp||'もう一度見てみよう。')}</div>${look}${visual}</div>`;
}
function outputPanel(q){
  const chunks=Array.isArray(q.outputChunks)&&q.outputChunks.length?q.outputChunks:[q.outputText||q.completed||q.answer].filter(Boolean);
  const cue=q.outputCue||q.translation||q.question||'';
  return `<div class="stage-panel output-panel"><div class="panel-label output">Say it</div><div class="output-instruction"><b>Read it once. Then hide it from the end.</b><span>一度読んだら、文末側から少しずつ隠していこう。</span></div>${backupMarkup(cue,chunks,backupHidden)}<div class="output-actions"><button class="action-btn" type="button" data-action="hide-more" ${backupHidden>=chunks.length?'disabled':''}>Hide one more</button><button class="action-btn secondary" type="button" data-action="show-all">Show all</button>${(q.audioA||q.completed)?'<button class="action-btn secondary" type="button" data-action="speak-answer">🔊 Listen</button>':''}</div></div>`;
}
function answerPanel(q,stageName){
  if(stageName==='problem') return '';
  if(isHintStage(stageName)) return hintPanel(q,stageName);
  if(stageName==='answer') return `<div class="stage-panel"><div class="panel-label answer">Check</div><div class="answer-main">${esc(q.answer)}</div>${q.completed?`<div class="completed">${esc(q.completed)}</div>`:''}<div class="output-actions">${(q.audioA||q.completed)?'<button class="action-btn" type="button" data-action="speak-answer">🔊 Listen</button>':''}</div></div>`;
  if(stageName==='reason') return `<div class="stage-panel"><div class="panel-label reason">Why?</div><div class="method"><b>${esc(q.focus||'')}</b></div><ul class="bullets">${(q.correct||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${q.method?`<div class="method"><b>Try this:</b> ${esc(q.method)}</div>`:''}</div>`;
  if(stageName==='wrong'){
    const items=(q.wrong||[]).length?q.wrong:['Check the word order and the form once more.'];
    return `<div class="stage-panel"><div class="panel-label wrong">Watch out</div><div class="wrong-list">${items.map(x=>`<div class="wrong-item">${esc(x)}</div>`).join('')}</div></div>`;
  }
  if(stageName==='translation') return `<div class="stage-panel"><div class="panel-label translation">Meaning</div><div class="jp-translation">${esc(q.translation||'')}</div>${(q.audioA||q.completed)?'<div class="output-actions"><button class="action-btn" type="button" data-action="speak-answer">🔊 Listen</button></div>':''}</div>`;
  if(stageName==='output') return outputPanel(q);
  return '';
}

function renderQuestion(){
  const q=current(); if(!q) return;
  stage.className='stage clickable';
  const stageName=currentStage();
  const reveal=answerVisible(stageName);
  const choices=(q.choices||[]).map(c=>`<span class="choice ${reveal&&normalizedChoice(c)===normalizedChoice(q.answer)?'correct-choice':''}">${esc(c)}</span>`).join('');
  const qAudio=q.audioQ?'<button class="audio-btn" type="button" data-action="speak-question" title="Listen">🔊</button>':'';
  stage.innerHTML=`<div class="topline"><span class="qno">${esc(q.key)}</span><span class="section">${esc(q.sectionName||'')}</span></div><h1>Question ${esc(q.key)}</h1><div class="question-card"><p class="question">${esc(q.question)}</p>${qAudio}${choices?`<div class="choice-grid">${choices}</div>`:''}</div><div class="content">${answerPanel(q,stageName)}</div><div class="stage-hint">${esc(labelForStage(stageName))}</div>`;
}

function resetLocalStageState(){ backupHidden=0; finalReveal=new Set(); finalBackupHidden=0; }
function render(){
  if('speechSynthesis' in window) speechSynthesis.cancel();
  if(slideIndex===-2) renderCover();
  else if(slideIndex===-1) renderGuide();
  else if(slideIndex===data.length) renderEnd();
  else renderQuestion();
  slideCounter.textContent=counterText(); makeDots();
  prevBtn.disabled=slideIndex===-2;
  nextBtn.disabled=slideIndex===data.length && finalSections().length>0 && finalStep>=finalMaxStep();
  nextBtn.setAttribute('aria-label','次の画面');
  window.dispatchEvent(new CustomEvent('lesson:render',{detail:getState()}));
}
function getState(){
  const q=current();
  return Object.freeze({lessonId:meta.id||'',slideIndex,step,stage:slideIndex>=0&&slideIndex<data.length?currentStage():(slideIndex===data.length?'final':''),questionId:q?.id||'',questionKey:q?.key||'',focus:q?.focus||'',finalStep});
}
function advance(){
  if(slideIndex===-2){slideIndex=-1;step=0;resetLocalStageState();render();return;}
  if(slideIndex===-1){slideIndex=0;step=0;resetLocalStageState();render();return;}
  if(slideIndex===data.length){if(finalStep<finalMaxStep()){finalStep++;finalReveal=new Set();finalBackupHidden=0;render();}return;}
  if(step<maxStep()){step++;backupHidden=0;render();return;}
  if(slideIndex<data.length-1){slideIndex++;step=0;resetLocalStageState();render();return;}
  slideIndex=data.length;step=0;finalStep=0;resetLocalStageState();render();
}
function back(){
  if(slideIndex===-2) return;
  if(slideIndex===-1){slideIndex=-2;step=0;resetLocalStageState();render();return;}
  if(slideIndex===data.length){
    if(finalStep>0){finalStep--;finalReveal=new Set();finalBackupHidden=0;render();return;}
    slideIndex=data.length-1;step=currentFlow().length-1;backupHidden=0;render();return;
  }
  if(step>0){step--;backupHidden=0;render();return;}
  if(slideIndex>0){slideIndex--;step=currentFlow().length-1;backupHidden=0;render();return;}
  slideIndex=-1;step=0;resetLocalStageState();render();
}
function resetStep(){
  if(slideIndex===data.length){finalStep=0;finalReveal=new Set();finalBackupHidden=0;render();return;}
  step=0;backupHidden=0;render();
}
function openMenu(){drawer.hidden=false;closeDrawer.focus();}
function closeMenu(){drawer.hidden=true;menuBtn.focus();}
function buildList(){qList.innerHTML=data.map((q,i)=>`<button class="jump-btn" type="button" data-jump="${i}">${esc(q.key)}<small>${esc(q.sectionName||'')}</small></button>`).join('');}
function setupToolbarToggle(){
  if(!toolbar) return;
  const b=document.createElement('button'); b.type='button'; b.id='toolbarToggle'; b.className='icon-btn toolbar-toggle'; b.textContent='−'; b.title='バーを小さくする'; b.setAttribute('aria-label','操作バーを最小化'); toolbar.appendChild(b);
  b.addEventListener('click',e=>{e.stopPropagation();const compact=toolbar.classList.toggle('is-collapsed');b.textContent=compact?'＋':'−';b.title=compact?'バーを開く':'バーを小さくする';b.setAttribute('aria-label',compact?'操作バーを開く':'操作バーを最小化');});
}

rate?.addEventListener('input',()=>{rateValue.textContent=Number(rate.value).toFixed(1);});
prevBtn.addEventListener('click',e=>{e.stopPropagation();back();});
nextBtn.addEventListener('click',e=>{e.stopPropagation();advance();});
resetBtn.addEventListener('click',e=>{e.stopPropagation();resetStep();});
menuBtn.addEventListener('click',e=>{e.stopPropagation();openMenu();});
closeDrawer.addEventListener('click',closeMenu);
drawer.addEventListener('click',e=>{if(e.target===drawer)closeMenu();});
qList.addEventListener('click',e=>{const b=e.target.closest('[data-jump]');if(!b)return;slideIndex=Number(b.dataset.jump);step=0;drawer.hidden=true;resetLocalStageState();render();});

stage.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(b){
    const action=b.dataset.action;
    if(action==='speak-question') Audio?.speak(current(), 0);
    if(action==='speak-answer') Audio?.speak(current(),Math.max(1,step));
    if(action==='hide-more'){const chunks=current()?.outputChunks||[current()?.completed].filter(Boolean);backupHidden=Math.min(chunks.length,backupHidden+1);renderQuestion();window.dispatchEvent(new CustomEvent('lesson:render',{detail:getState()}));}
    if(action==='show-all'){backupHidden=0;renderQuestion();window.dispatchEvent(new CustomEvent('lesson:render',{detail:getState()}));}
    if(action==='open-menu') openMenu();
    if(action==='restart'){slideIndex=-2;step=0;finalStep=0;resetLocalStageState();render();}
    if(action==='final-reveal'){const i=Number(b.dataset.index);finalReveal.has(i)?finalReveal.delete(i):finalReveal.add(i);renderEnd();}
    if(action==='final-hide-more'){const chunks=finalSections()[finalStep]?.chunks||[];finalBackupHidden=Math.min(chunks.length,finalBackupHidden+1);renderEnd();}
    if(action==='final-show-all'){finalBackupHidden=0;renderEnd();}
    if(action==='final-audio'){
      const sec=finalSections()[finalStep];
      if(sec?.audio && 'speechSynthesis' in window){const u=new SpeechSynthesisUtterance(sec.audio);u.lang='en-US';u.rate=Number(rate?.value||1);speechSynthesis.cancel();speechSynthesis.speak(u);}
    }
    e.stopPropagation();return;
  }
  advance();
});
app.addEventListener('keydown',e=>{
  if(drawer.hidden===false){if(e.key==='Escape')closeMenu();return;}
  const tag=e.target.tagName;if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(tag))return;
  if(e.code==='Space'||e.key==='Enter'||e.key==='ArrowRight'){e.preventDefault();advance();}
  else if(e.key==='ArrowLeft'){e.preventDefault();back();}
  else if(e.key.toLowerCase()==='r'){e.preventDefault();resetStep();}
  else if(e.key.toLowerCase()==='m'){e.preventDefault();openMenu();}
});

drawerTitle.textContent=`${meta.title||'Lesson'} 問題一覧`;
app.setAttribute('aria-label',`${meta.title||'Lesson'} 授業用スライド`);
window.LessonEngine=Object.freeze({
  getState,getCurrent:()=>current(),
  getQuestionAt(index){if(!Number.isInteger(index)||index<0||index>=data.length)return null;const q=data[index];return Object.freeze({id:q?.id||'',key:q?.key||'',focus:q?.focus||''});},
  jumpTo(index){if(!Number.isInteger(index)||index<0||index > data.length)return false;slideIndex=index;step=0;finalStep=0;resetLocalStageState();render();return true;}
});

buildList();setupToolbarToggle();render();app.focus();
})();