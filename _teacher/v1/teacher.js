(()=>{
'use strict';

const STORAGE_KEY = 'teaching.v1';
const TYPES = Object.freeze([
  ['misconception','✕','誤答'],
  ['question','❓','質問'],
  ['explanation','💡','説明成功'],
  ['addition','✎','追記'],
  ['improvement','🔧','改善']
]);
const NAME_WARN = /(さん|くん|君)/;

function nowIso(){ return new Date().toISOString(); }
function todayLocal(){
  const d=new Date();
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
}
function params(){
  const p=new URLSearchParams(location.search);
  return {
    schoolYear: p.get('year') || String(new Date().getFullYear()),
    className: p.get('class') || '',
  };
}
function blankStore(){
  return {version:1,logs:[],progress:{},lastBackupAt:null};
}
function readStore(){
  try{
    const v=JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return v && v.version===1 ? v : blankStore();
  }catch(_){ return blankStore(); }
}
function writeStore(store){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
function state(){ return window.LessonEngine?.getState?.() || {}; }
function current(){ return window.LessonEngine?.getCurrent?.() || {}; }
function progressKey(lessonId, schoolYear, className){
  return `${schoolYear}::${className || '_unset'}::${lessonId}`;
}
function toast(msg){
  const el=document.getElementById('toast');
  if(!el) return;
  el.textContent=msg; el.hidden=false;
  clearTimeout(toast._t); toast._t=setTimeout(()=>{el.hidden=true;},1800);
}
function safeNote(note){
  if(!note) return true;
  if(NAME_WARN.test(note)){
    return confirm('個人名らしき表現（さん／くん／君）が含まれています。\nこの授業ログには生徒個人を特定できる情報を保存しないでください。\n一般化した内容に書き換えましたか？');
  }
  return true;
}
function addLog(type, note=''){
  if(!safeNote(note)) return null;
  const s=state(), q=current(), p=params(), store=readStore();
  const rec={
    recordId:`log_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    createdAt:nowIso(),
    date:todayLocal(),
    schoolYear:p.schoolYear,
    className:p.className,
    lessonId:s.lessonId || '',
    questionId:s.questionId || '',
    questionKey:s.questionKey || '',
    focus:s.focus || q.focus || '',
    type,
    note:String(note || '').trim()
  };
  store.logs.push(rec);
  writeStore(store);
  renderPastCount();
  return rec;
}
function logsForCurrent(){
  const s=state(), p=params(), store=readStore();
  return store.logs
    .filter(x=>x.lessonId===s.lessonId && x.questionId===s.questionId)
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
}
function saveProgress(){
  const s=state(), p=params(), store=readStore();
  if(!s.lessonId){ toast('教材IDを取得できません'); return false; }
  if(!p.className){
    toast('My Hubからクラス指定で開くと進度を保存できます');
    return false;
  }
  if(s.slideIndex < 0){ toast('問題を開始してから進度を保存してください'); return false; }
  const key=progressKey(s.lessonId,p.schoolYear,p.className);
  const total=Number(window.LESSON_META?.questionCount || 0);
  let resumeSlideIndex = s.stage === 'output' ? s.slideIndex + 1 : s.slideIndex;
  const completed = total > 0 && resumeSlideIndex >= total;
  if(completed) resumeSlideIndex=total;
  const resumeQuestion=window.LessonEngine?.getQuestionAt?.(resumeSlideIndex) || null;
  const lastQuestion=completed ? window.LessonEngine?.getQuestionAt?.(total-1) : null;
  store.progress[key]={
    schoolYear:p.schoolYear,
    className:p.className,
    lessonId:s.lessonId,
    questionId:s.questionId || lastQuestion?.id || '',
    questionKey:s.questionKey || lastQuestion?.key || '',
    slideIndex:s.slideIndex,
    step:s.step,
    stage:s.stage,
    resumeSlideIndex,
    resumeQuestionId:resumeQuestion?.id || '',
    resumeQuestionKey:completed ? 'END' : (resumeQuestion?.key || s.questionKey || ''),
    completed,
    savedAt:nowIso()
  };
  writeStore(store);
  return true;
}
function downloadBackup(){
  const store=readStore();
  store.lastBackupAt=nowIso();
  writeStore(store);
  const blob=new Blob([JSON.stringify(store,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`teaching-backup-${todayLocal()}-${new Date().toTimeString().slice(0,8).replaceAll(':','')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  updateBackupLabel();
}
function endLesson(){
  const saved=saveProgress();
  downloadBackup();
  toast(saved ? '進度を保存し、JSONバックアップを出力しました' : 'JSONバックアップを出力しました');
}
function typeLabel(type){
  const t=TYPES.find(x=>x[0]===type);
  return t ? `${t[1]} ${t[2]}` : type;
}
function openQuickNote(type){
  const rec=addLog(type,'');
  if(!rec){ return; }
  toast(`${typeLabel(type)} を記録しました`);
  const input=document.getElementById('teacherQuickNote');
  const save=document.getElementById('teacherQuickSave');
  const skip=document.getElementById('teacherQuickSkip');
  const hint=document.getElementById('teacherQuickHint');
  if(!input) return;
  input.value='';
  input.hidden=false; save.hidden=false; skip.hidden=false; hint.hidden=false;
  input.dataset.recordId=rec.recordId;
  input.placeholder='メモを追加（任意）';
  input.focus();
}
function closeQuick(){
  ['teacherQuickNote','teacherQuickSave','teacherQuickSkip','teacherQuickHint'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.hidden=true;
  });
}
function saveQuickNote(){
  const input=document.getElementById('teacherQuickNote');
  const note=String(input?.value || '').trim();
  if(!safeNote(note)) return;
  const id=input?.dataset.recordId;
  const store=readStore();
  const rec=store.logs.find(x=>x.recordId===id);
  if(rec){ rec.note=note; writeStore(store); }
  closeQuick(); renderPastCount(); toast('メモを追加しました');
}
function renderPastCount(){
  const btn=document.getElementById('teacherPastBtn');
  if(!btn) return;
  btn.textContent=`🧠 過去記録 ${logsForCurrent().length}`;
}
function showPast(){
  const rows=logsForCurrent();
  const body=document.getElementById('teacherPastBody');
  const modal=document.getElementById('teacherPastModal');
  if(!body || !modal) return;
  body.innerHTML=rows.length ? rows.map(r=>`
    <article class="teacher-log-row">
      <div class="teacher-log-meta">${escapeHtml(r.date)} ${escapeHtml(r.className || '')} · ${escapeHtml(typeLabel(r.type))}</div>
      <div>${escapeHtml(r.note || '（メモなし）')}</div>
    </article>`).join('') : '<p>この問題の記録はまだありません。</p>';
  modal.hidden=false;
}
function escapeHtml(s=''){
  return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function updateBackupLabel(){
  const el=document.getElementById('teacherBackupState');
  if(!el) return;
  const last=readStore().lastBackupAt;
  if(!last){ el.textContent='バックアップ未作成'; el.dataset.state='warn'; return; }
  const days=Math.floor((Date.now()-new Date(last).getTime())/86400000);
  el.textContent=days<=0 ? '最終バックアップ：今日' : `最終バックアップ：${days}日前`;
  el.dataset.state=days>=7?'warn':'ok';
}
function injectStyles(){
  const style=document.createElement('style');
  style.textContent=`
    body.teacher-mode .toolbar{padding-right:10px}
    .teacher-dock{position:fixed;z-index:45;right:12px;top:12px;display:flex;flex-direction:column;gap:7px;max-width:min(320px,42vw);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif}
    .teacher-dock-card{background:rgba(19,32,55,.96);color:#fff;border-radius:16px;padding:9px;box-shadow:0 14px 38px rgba(0,0,0,.28);backdrop-filter:blur(10px)}
    .teacher-dock-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;font-size:12px;font-weight:900}
    .teacher-types{display:flex;gap:5px;flex-wrap:wrap}
    .teacher-type,.teacher-action{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.10);color:#fff;border-radius:10px;padding:7px 9px;font-weight:850;cursor:pointer}
    .teacher-type{font-size:12px}.teacher-action{font-size:12px}
    .teacher-action.primary{background:#f2b24b;color:#3f2b08;border-color:#f2b24b}
    .teacher-quick{display:flex;gap:5px;margin-top:7px;align-items:center}
    .teacher-quick input{min-width:0;flex:1;border-radius:9px;border:1px solid #738198;padding:7px 9px}
    .teacher-hint{display:block;margin-top:5px;color:#d4dbea;font-size:10px;line-height:1.35}
    #teacherBackupState[data-state="warn"]{color:#ffd38a}
    #teacherBackupState[data-state="ok"]{color:#bce8c8}
    .teacher-modal{position:fixed;inset:0;z-index:90;background:rgba(8,12,20,.58);display:grid;place-items:center;padding:20px}
    .teacher-modal[hidden]{display:none!important}
    .teacher-modal-card{width:min(680px,95vw);max-height:78vh;overflow:auto;background:#fffdf8;border-radius:18px;padding:18px;color:#172033}
    .teacher-modal-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}
    .teacher-log-row{padding:10px 0;border-bottom:1px solid #e4ddd3;line-height:1.5}
    .teacher-log-meta{font-size:12px;color:#6b7483;font-weight:800;margin-bottom:3px}
    @media(max-width:700px){.teacher-dock{right:6px;top:6px;max-width:calc(100vw - 12px)}.teacher-dock-card{padding:7px}.teacher-types{display:none}}
  `;
  document.head.appendChild(style);
}
function injectUI(){
  document.body.classList.add('teacher-mode');
  const p=params();
  const dock=document.createElement('aside');
  dock.className='teacher-dock';
  dock.innerHTML=`
    <div class="teacher-dock-card">
      <div class="teacher-dock-head">
        <span>TEACHER ${escapeHtml(p.className ? `· ${p.className}`:'· クラス未指定')}</span>
        <span id="teacherBackupState"></span>
      </div>
      <div class="teacher-types">
        ${TYPES.map(([type,icon,label])=>`<button class="teacher-type" type="button" data-log-type="${type}" title="${label}">${icon} ${label}</button>`).join('')}
      </div>
      <div class="teacher-quick">
        <input id="teacherQuickNote" hidden>
        <button id="teacherQuickSave" class="teacher-action" type="button" hidden>保存</button>
        <button id="teacherQuickSkip" class="teacher-action" type="button" hidden>閉じる</button>
      </div>
      <small id="teacherQuickHint" class="teacher-hint" hidden>個人を特定できる情報は入力しない。</small>
      <div class="teacher-types" style="margin-top:7px">
        <button id="teacherPastBtn" class="teacher-action" type="button">🧠 過去記録 0</button>
        <button id="teacherEndBtn" class="teacher-action primary" type="button">授業終了</button>
      </div>
    </div>`;
  document.body.appendChild(dock);

  const modal=document.createElement('div');
  modal.id='teacherPastModal';
  modal.className='teacher-modal';
  modal.hidden=true;
  modal.innerHTML=`
    <section class="teacher-modal-card" role="dialog" aria-modal="true" aria-label="過去の授業記録">
      <div class="teacher-modal-head"><strong>この問題の過去記録</strong><button id="teacherPastClose" class="teacher-action" type="button" style="color:#172033;border-color:#bbb;background:#fff">閉じる</button></div>
      <div id="teacherPastBody"></div>
    </section>`;
  document.body.appendChild(modal);

  dock.addEventListener('click',e=>{
    const b=e.target.closest('[data-log-type]');
    if(b) openQuickNote(b.dataset.logType);
  });
  document.getElementById('teacherQuickSave').addEventListener('click',saveQuickNote);
  document.getElementById('teacherQuickSkip').addEventListener('click',closeQuick);
  document.getElementById('teacherQuickNote').addEventListener('keydown',e=>{
    if(e.key==='Enter'){ e.preventDefault(); saveQuickNote(); }
    if(e.key==='Escape'){ closeQuick(); }
  });
  document.getElementById('teacherPastBtn').addEventListener('click',showPast);
  document.getElementById('teacherEndBtn').addEventListener('click',endLesson);
  document.getElementById('teacherPastClose').addEventListener('click',()=>{modal.hidden=true;});
  modal.addEventListener('click',e=>{if(e.target===modal) modal.hidden=true;});
  updateBackupLabel();
  renderPastCount();
}


function resumeIfRequested(){
  const url=new URL(location.href);
  if(url.searchParams.get('resume')!=='1') return;
  const s=state(), p=params(), store=readStore();
  const key=progressKey(s.lessonId,p.schoolYear,p.className);
  const saved=store.progress[key];
  if(!saved || !Number.isInteger(saved.resumeSlideIndex)) return;
  const ok=window.LessonEngine?.jumpTo?.(saved.resumeSlideIndex);
  if(ok){
    const message=saved.completed
      ? 'このLessonは前回までに完了しています'
      : `続き：${saved.resumeQuestionKey || saved.questionKey || '保存位置'}から`;
    setTimeout(()=>toast(message),50);
  }
}

window.addEventListener('lesson:render',renderPastCount);
injectStyles();
injectUI();
resumeIfRequested();
})();
