(()=>{
'use strict';

const meta = window.LESSON_META || {};
const data = window.LESSON_DATA || [];
const Audio = window.LessonAudio;

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
const drawer = document.getElementById('drawer');
const closeDrawer = document.getElementById('closeDrawer');
const qList = document.getElementById('questionList');
const slideCounter = document.getElementById('slideCounter');
const stepDots = document.getElementById('stepDots');
const rate = document.getElementById('rate');
const rateValue = document.getElementById('rateValue');
const toast = document.getElementById('toast');
const drawerTitle = document.getElementById('drawerTitle');

let slideIndex = -2; // cover, guide, questions..., end
let step = 0;
let revealed = false;

function esc(s=''){
  return String(s).replace(/[&<>"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
  }[c] || c));
}

function current(){ return data[slideIndex]; }
function currentFlow(){ return FLOWS[current()?.format] || FLOWS.choice; }
function currentStage(){ return currentFlow()[step] || 'problem'; }
function maxStep(){ return Math.max(0, currentFlow().length - 1); }

function showToast(msg){
  if(!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>{ toast.hidden = true; },1800);
}

function labelForStage(name){
  return ({
    problem:'問題',
    answer:'正解',
    reason:'正解の根拠',
    wrong:'誤答分析',
    translation:'和訳',
    output:'Output'
  })[name] || '';
}

function makeDots(){
  stepDots.innerHTML = '';
  if(slideIndex < 0 || slideIndex >= data.length) return;
  const flow = currentFlow();
  flow.forEach((name, i)=>{
    const d = document.createElement('span');
    d.className = 'step-dot' + (i <= step ? ' on' : '');
    d.title = labelForStage(name);
    stepDots.appendChild(d);
  });
}

function counterText(){
  if(slideIndex === -2) return 'START';
  if(slideIndex === -1) return 'GUIDE';
  if(slideIndex === data.length) return 'END';
  return `${slideIndex+1} / ${data.length}`;
}

function renderCover(){
  stage.className = 'stage cover-stage clickable';
  const level = meta.grade ? `高校${meta.grade}年` : (meta.level || '');
  stage.innerHTML = `
    <div class="intro">
      <div class="eyebrow">${esc(level)}${level && meta.series ? ' / ' : ''}${esc(meta.series || '')}</div>
      <h1>${esc(meta.title || 'Lesson')}</h1>
      <p>問題を先に考え、クリックするたびに <b>正解 → 根拠 → 誤答分析 → 和訳 → Output</b> へ進みます。英文はブラウザ音声で再生できます。</p>
    </div>`;
}

function renderGuide(){
  stage.className = 'stage clickable';
  stage.innerHTML = `
    <div class="topline"><span class="qno">授業の進め方</span><span class="section">Interactive Lesson Engine v1</span></div>
    <h1>答えより先に「切る根拠」を言わせる</h1>
    <div class="guide-grid">
      <div class="guide-card"><b>① 問題</b><p>最初は問題だけ。問題音声から正答は漏れません。</p></div>
      <div class="guide-card"><b>② 正解・根拠</b><p>正答後、どの文法・語法が決め手か確認。</p></div>
      <div class="guide-card"><b>③ 誤答分析</b><p>品詞・語順・構文など、誤りの理由を確認。</p></div>
      <div class="guide-card"><b>④ 和訳</b><p>正答を入れた文の意味を自然な日本語で確認。</p></div>
      <div class="guide-card"><b>⑤ Output</b><p>日本語から核となる英語表現を再生。</p></div>
      <div class="guide-card"><b>操作</b><p>クリック / Spaceで次段階。← →で問題移動。↺でリセット。</p></div>
    </div>`;
}

function renderEnd(){
  stage.className = 'stage clickable';
  stage.innerHTML = `
    <div class="intro" style="color:var(--ink)">
      <div class="eyebrow">${esc(meta.title || 'Lesson')} COMPLETE</div>
      <h1 style="color:var(--navy)">Final Check</h1>
      <p style="color:#4b5a70">正解・根拠・誤答・和訳・Outputを確認。問題一覧から必要な項目へ戻れます。</p>
      <div class="output-actions">
        <button class="action-btn" type="button" data-action="open-menu">問題一覧を開く</button>
        <button class="action-btn secondary" type="button" data-action="restart">最初から</button>
      </div>
    </div>`;
}

function normalizedChoice(s){
  return String(s || '').replace(/^[①②③④⑤⑥⑦⑧]\s*/,'').trim();
}

function answerPanel(q, stageName){
  if(stageName === 'problem'){
    return `<div class="stage-panel"><div class="panel-label">考える</div><div class="method">まず自分で解答を決める。正解だけでなく、他の選択肢や語順を何のルールで判断するかまで考える。</div></div>`;
  }
  if(stageName === 'answer'){
    return `<div class="stage-panel">
      <div class="panel-label answer">✓ 正解</div>
      <div class="answer-main">${esc(q.answer)}</div>
      ${q.completed ? `<div class="completed">${esc(q.completed)}</div>` : ''}
      <div class="output-actions">${(q.audioA || q.completed) ? '<button class="action-btn" type="button" data-action="speak-answer">🔊 正答英文</button>' : ''}</div>
    </div>`;
  }
  if(stageName === 'reason'){
    return `<div class="stage-panel">
      <div class="panel-label reason">● なぜ正解か</div>
      <div class="method"><b>今回のポイント：</b> ${esc(q.focus)}</div>
      <ul class="bullets">${(q.correct || []).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      ${q.method ? `<div class="method"><b>見抜く順序：</b> ${esc(q.method)}</div>` : ''}
    </div>`;
  }
  if(stageName === 'wrong'){
    const items = (q.wrong || []).length
      ? q.wrong
      : ['この形式では、誤答選択肢ではなく語順・構文の崩れやすい箇所を確認する。'];
    return `<div class="stage-panel">
      <div class="panel-label wrong">× なぜ他はダメか</div>
      <div class="wrong-list">${items.map(x=>`<div class="wrong-item">${esc(x)}</div>`).join('')}</div>
    </div>`;
  }
  if(stageName === 'translation'){
    return `<div class="stage-panel">
      <div class="panel-label translation">訳 / 意味確認</div>
      <div class="jp-translation">${esc(q.translation || '')}</div>
      ${(q.audioA || q.completed) ? '<div class="output-actions"><button class="action-btn" type="button" data-action="speak-answer">🔊 英文を聞く</button></div>' : ''}
    </div>`;
  }
  if(stageName === 'output'){
    return `<div class="stage-panel">
      <div class="panel-label output">Output</div>
      <div class="output-cue">${esc(q.translation || q.question || '')}</div>
      ${(q.reuse || []).length ? `<div class="method"><b>再利用する型：</b> ${esc(q.reuse.join(' '))}</div>` : ''}
      <div class="output-actions">
        ${(q.audioA || q.completed) ? '<button class="action-btn" type="button" data-action="speak-answer">🔊 音声で確認</button>' : ''}
        <button class="action-btn secondary" type="button" data-action="toggle-answer">英文を見る</button>
      </div>
      ${revealed ? `<div class="hidden-answer">${esc(q.completed || q.answer || '')}</div>` : ''}
    </div>`;
  }
  return '';
}

function renderQuestion(){
  const q = current();
  if(!q) return;
  stage.className = 'stage clickable';
  const stageName = currentStage();
  const choices = (q.choices || []).map(c=>{
    const correct = step >= 1 && normalizedChoice(c) === normalizedChoice(q.answer);
    return `<span class="choice ${correct ? 'correct-choice' : ''}">${esc(c)}</span>`;
  }).join('');

  // Invariant: stage 0 may call Audio only with stage=0.
  const qAudio = q.audioQ
    ? '<button class="audio-btn" type="button" data-action="speak-question" title="問題文を読む">🔊</button>'
    : '';

  stage.innerHTML = `
    <div class="topline"><span class="qno">${esc(q.key)}</span><span class="section">${esc(q.sectionName || '')}</span></div>
    <h1>Question ${esc(q.key)}</h1>
    <div class="question-card">
      <p class="question">${esc(q.question)}</p>
      ${qAudio}
      ${choices ? `<div class="choice-grid">${choices}</div>` : ''}
    </div>
    <div class="content">${answerPanel(q, stageName)}</div>
    <div class="stage-hint">${esc(labelForStage(stageName))}</div>`;
}

function render(){
  if('speechSynthesis' in window) speechSynthesis.cancel();
  revealed = false;
  if(slideIndex === -2) renderCover();
  else if(slideIndex === -1) renderGuide();
  else if(slideIndex === data.length) renderEnd();
  else renderQuestion();
  slideCounter.textContent = counterText();
  makeDots();
  prevBtn.disabled = slideIndex === -2;
  nextBtn.setAttribute('aria-label',
    slideIndex >= 0 && slideIndex < data.length && step < maxStep()
      ? '次の段階' : '次のスライド');
  window.dispatchEvent(new CustomEvent('lesson:render', {detail:getState()}));
}

function getState(){
  const q = current();
  return Object.freeze({
    lessonId: meta.id || '',
    slideIndex,
    step,
    stage: slideIndex >= 0 && slideIndex < data.length ? currentStage() : '',
    questionId: q?.id || '',
    questionKey: q?.key || '',
    focus: q?.focus || ''
  });
}

function advance(){
  if(slideIndex < 0){ slideIndex++; step=0; render(); return; }
  if(slideIndex >= data.length){ slideIndex=-2; step=0; render(); return; }
  if(step < maxStep()){ step++; renderQuestion(); makeDots(); window.dispatchEvent(new CustomEvent('lesson:render',{detail:getState()})); }
  else { slideIndex++; step=0; render(); }
}

function backSlide(){ if(slideIndex <= -2) return; slideIndex--; step=0; render(); }
function nextSlide(){ if(slideIndex < data.length){ slideIndex++; step=0; render(); } else { slideIndex=-2; step=0; render(); } }
function resetStep(){ step=0; revealed=false; render(); }
function openMenu(){ drawer.hidden=false; closeDrawer.focus(); }
function closeMenu(){ drawer.hidden=true; menuBtn.focus(); }

function buildList(){
  qList.innerHTML = data.map((q,i)=>
    `<button class="jump-btn" type="button" data-jump="${i}">${esc(q.key)}<small>${esc(q.sectionName || '')}</small></button>`
  ).join('');
}

rate?.addEventListener('input',()=>{ rateValue.textContent = Number(rate.value).toFixed(1); });
prevBtn.addEventListener('click',e=>{e.stopPropagation();backSlide();});
nextBtn.addEventListener('click',e=>{e.stopPropagation();advance();});
resetBtn.addEventListener('click',e=>{e.stopPropagation();resetStep();});
menuBtn.addEventListener('click',e=>{e.stopPropagation();openMenu();});
closeDrawer.addEventListener('click',closeMenu);
drawer.addEventListener('click',e=>{if(e.target===drawer)closeMenu();});

qList.addEventListener('click',e=>{
  const b = e.target.closest('[data-jump]');
  if(!b) return;
  slideIndex = Number(b.dataset.jump);
  step = 0;
  drawer.hidden = true;
  render();
});

stage.addEventListener('click',e=>{
  const b = e.target.closest('button');
  if(b){
    const action = b.dataset.action;
    if(action === 'speak-question') Audio?.speak(current(), 0);
    if(action === 'speak-answer') Audio?.speak(current(), Math.max(1, step));
    if(action === 'toggle-answer'){ revealed=!revealed; renderQuestion(); }
    if(action === 'open-menu') openMenu();
    if(action === 'restart'){ slideIndex=-2; step=0; render(); }
    e.stopPropagation();
    return;
  }
  advance();
});

app.addEventListener('keydown',e=>{
  if(drawer.hidden === false){ if(e.key === 'Escape') closeMenu(); return; }
  const tag = e.target.tagName;
  if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(tag)) return;
  if(e.code === 'Space' || e.key === 'Enter'){ e.preventDefault(); advance(); }
  else if(e.key === 'ArrowRight'){ e.preventDefault(); nextSlide(); }
  else if(e.key === 'ArrowLeft'){ e.preventDefault(); backSlide(); }
  else if(e.key.toLowerCase() === 'r'){ e.preventDefault(); resetStep(); }
  else if(e.key.toLowerCase() === 'm'){ e.preventDefault(); openMenu(); }
});

drawerTitle.textContent = `${meta.title || 'Lesson'} 問題一覧`;
app.setAttribute('aria-label', `${meta.title || 'Lesson'} 授業用クリック型スライド`);

window.LessonEngine = Object.freeze({
  getState,
  getCurrent: ()=>current(),
  getQuestionAt(index){
    if(!Number.isInteger(index) || index < 0 || index >= data.length) return null;
    const q=data[index];
    return Object.freeze({id:q?.id || '', key:q?.key || '', focus:q?.focus || ''});
  },
  jumpTo(index){
    // data.length is the END screen and is a valid resume target.
    if(!Number.isInteger(index) || index < 0 || index > data.length) return false;
    slideIndex=index; step=0; render(); return true;
  }
});

buildList();
render();
app.focus();
})();
