(()=>{
'use strict';

const STORAGE_KEY = 'teaching.v1';
const UI_KEY = 'teaching.ui.v1';
const TYPES = Object.freeze([
  ['misconception','✕','誤答'],
  ['question','❓','質問'],
  ['explanation','💡','説明成功'],
  ['addition','✎','追記'],
  ['improvement','🔧','改善']
]);
const NAME_WARN = /(さん|くん|君)/;

function nowIso(){ return new Date().toISOString(); }
function todayLocal(){ const d=new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); }
function schoolYearNow(d=new Date()){ return String(d.getMonth()<3 ? d.getFullYear()-1 : d.getFullYear()); }
function params(){ const p=new URLSearchParams(location.search); return {schoolYear:String(p.get('year')||schoolYearNow()).trim(),className:String(p.get('class')||'').trim()}; }
function blankStore(){ return {version:1,logs:[],progress:{},lastBackupAt:null}; }
function validStore(v){ return !!(v && v.version===1 && Array.isArray(v.logs) && v.progress && typeof v.progress==='object' && !Array.isArray(v.progress)); }
function readStoreResult(){
  const raw=localStorage.getItem(STORAGE_KEY);
  if(raw===null) return {ok:true,store:blankStore(),source:'empty'};
  try{
    const v=JSON.parse(raw);
    if(!validStore(v)) return {ok:false,error:'授業保存データの形式が未対応です。上書きせず、My HubからJSONバックアップを確認してください。'};
    return {ok:true,store:v,source:'stored'};
  }catch(_){
    return {ok:false,error:'授業保存データを読み取れません。上書きせず、My HubからJSONバックアップを復元してください。'};
  }
}
function setStoreBlocked(message=''){
  const stateEl=document.getElementById('teacherStoreState');
  if(stateEl){stateEl.textContent=message;stateEl.hidden=!message;}
  const noClass=!params().className;
  document.querySelectorAll('[data-log-type],#teacherEndBtn').forEach(b=>{b.disabled=!!message||noClass;});
}
function readStore(){
  const result=readStoreResult();
  if(!result.ok){setStoreBlocked(result.error);toast(result.error);return null;}
  setStoreBlocked('');
  return result.store;
}
function writeStore(store){
  if(!validStore(store)){toast('保存データの形式が不正なため書き込みを停止しました。');return false;}
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(store));return true;}
  catch(_){toast('保存できませんでした。JSONバックアップを作成してください。');return false;}
}
function readUi(){ try{return JSON.parse(localStorage.getItem(UI_KEY)||'{}')||{};}catch(_){return {};} }
function writeUi(v){ try{localStorage.setItem(UI_KEY,JSON.stringify(v));}catch(_){} }
function state(){ return window.LessonEngine?.getState?.()||{}; }
function current(){ return window.LessonEngine?.getCurrent?.()||{}; }
function progressKey(lessonId,schoolYear,className){ return `${schoolYear}::${className||'_unset'}::${lessonId}`; }
function escapeHtml(s=''){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function toast(msg){ const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>{el.hidden=true;},2400); }
function safeNote(note){ if(!note)return true;if(NAME_WARN.test(note)){return confirm('個人名らしき表現（さん／くん／君）が含まれています。\nこの授業ログには生徒個人を特定できる情報を保存しないでください。\n一般化した内容に書き換えましたか？');}return true; }
function typeLabel(type){ const t=TYPES.find(x=>x[0]===type);return t?`${t[1]} ${t[2]}`:type; }
function requireClass(){ const p=params();if(p.className)return p;toast('クラス未指定です。My Hubからクラスを選んで開いてください。');return null; }

function addLog(type,note=''){
  if(!safeNote(note)) return null;
  const p=requireClass();if(!p)return null;
  const s=state(),q=current(),store=readStore();if(!store)return null;
  const createdAt=nowIso();
  const rec={recordId:`log_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,createdAt,updatedAt:createdAt,deletedAt:null,date:todayLocal(),schoolYear:p.schoolYear,className:p.className,lessonId:s.lessonId||'',questionId:s.questionId||'',questionKey:s.questionKey||'',focus:s.focus||q.focus||'',type,note:String(note||'').trim()};
  store.logs.push(rec);if(!writeStore(store))return null;renderPastCount();return rec;
}
function deleteLog(id){
  const store=readStore();if(!store)return;const rec=store.logs.find(x=>x.recordId===id&&!x.deletedAt);if(!rec)return;
  if(!confirm(`${typeLabel(rec.type)} の記録を削除しますか？`))return;
  const at=nowIso();rec.deletedAt=at;rec.updatedAt=at;
  if(!writeStore(store))return;showPast();renderPastCount();toast('記録を削除しました');
}
function logsForCurrent(){
  const s=state(),store=readStore();if(!store)return [];
  return store.logs.filter(x=>!x.deletedAt&&x.lessonId===s.lessonId&&x.questionId===s.questionId).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
}

function saveProgress(){
  const s=state(),p=requireClass();if(!p)return false;const store=readStore();if(!store)return false;
  if(!s.lessonId){toast('教材IDを取得できません');return false;}
  if(s.slideIndex < 0){toast('問題を開始してから進度を保存してください');return false;}
  const key=progressKey(s.lessonId,p.schoolYear,p.className);const total=Number(window.LESSON_META?.questionCount||0);
  let resumeSlideIndex=s.stage==='output'?s.slideIndex+1:s.slideIndex;
  const completed=total>0&&resumeSlideIndex>=total;if(completed)resumeSlideIndex=total;
  const resumeQuestion=window.LessonEngine?.getQuestionAt?.(resumeSlideIndex)||null;const lastQuestion=completed?window.LessonEngine?.getQuestionAt?.(total-1):null;
  const resumeStep=s.stage==='output'?0:Math.max(0,Number(s.step||0));
  const resumeFinalStep=s.slideIndex===total?Math.max(0,Number(s.finalStep||0)):0;
  store.progress[key]={schoolYear:p.schoolYear,className:p.className,lessonId:s.lessonId,questionId:s.questionId||lastQuestion?.id||'',questionKey:s.questionKey||lastQuestion?.key||'',slideIndex:s.slideIndex,step:s.step,stage:s.stage,finalStep:s.finalStep||0,resumeSlideIndex,resumeQuestionId:resumeQuestion?.id||'',resumeQuestionKey:completed?'END':(resumeQuestion?.key||s.questionKey||''),resumeStep,resumeFinalStep,completed,savedAt:nowIso()};
  return writeStore(store);
}
function autoSaveProgress(){
  const p=params(),s=state();
  if(!p.className||!s.lessonId||s.slideIndex<0)return;
  const storeResult=readStoreResult();
  if(!storeResult.ok){setStoreBlocked(storeResult.error);return;}
  const signature=[p.schoolYear,p.className,s.lessonId,s.slideIndex,s.step,s.stage,s.finalStep||0].join('|');
  if(signature===autoSaveProgress._last)return;
  autoSaveProgress._last=signature;
  saveProgress();
}
function downloadBackup(){
  const store=readStore();if(!store)return false;store.lastBackupAt=nowIso();if(!writeStore(store))return false;
  const blob=new Blob([JSON.stringify(store,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`teaching-backup-${todayLocal()}-${new Date().toTimeString().slice(0,8).replaceAll(':','')}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);updateBackupLabel();return true;
}
function endLesson(){ if(!requireClass())return;const saved=saveProgress();if(!saved)return;const backed=downloadBackup();toast(backed?'進度を保存し、JSONバックアップを出力しました':'進度を保存しました。バックアップ出力は失敗しました。'); }

function openQuickNote(type){
  const rec=addLog(type,'');if(!rec)return;toast(`${typeLabel(type)} を記録しました`);
  const input=document.getElementById('teacherQuickNote'),save=document.getElementById('teacherQuickSave'),skip=document.getElementById('teacherQuickSkip'),hint=document.getElementById('teacherQuickHint');
  input.value='';input.hidden=false;save.hidden=false;skip.hidden=false;hint.hidden=false;input.dataset.recordId=rec.recordId;input.placeholder='メモを追加（任意）';input.focus();
}
function closeQuick(){ ['teacherQuickNote','teacherQuickSave','teacherQuickSkip','teacherQuickHint'].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=true;}); }
function saveQuickNote(){
  const input=document.getElementById('teacherQuickNote');const note=String(input?.value||'').trim();if(!safeNote(note))return;const id=input?.dataset.recordId;const store=readStore();if(!store)return;
  const rec=store.logs.find(x=>x.recordId===id&&!x.deletedAt);if(rec){rec.note=note;rec.updatedAt=nowIso();if(!writeStore(store))return;}closeQuick();renderPastCount();toast('メモを追加しました');
}
function renderPastCount(){ const btn=document.getElementById('teacherPastBtn');if(btn)btn.textContent=`🧠 過去記録 ${logsForCurrent().length}`; }
function showPast(){
  const rows=logsForCurrent(),body=document.getElementById('teacherPastBody'),modal=document.getElementById('teacherPastModal');if(!body||!modal)return;
  body.innerHTML=rows.length?rows.map(r=>`<article class="teacher-log-row"><div class="teacher-log-main"><div class="teacher-log-meta">${escapeHtml(r.date)} ${escapeHtml(r.className||'')} · ${escapeHtml(typeLabel(r.type))}</div><div>${escapeHtml(r.note||'（メモなし）')}</div></div><button class="teacher-delete" type="button" data-delete-log="${escapeHtml(r.recordId)}" aria-label="この記録を削除">削除</button></article>`).join(''):'<p>この問題の記録はまだありません。</p>';modal.hidden=false;
}
function updateBackupLabel(){
  const el=document.getElementById('teacherBackupState');if(!el)return;const result=readStoreResult();if(!result.ok){el.textContent='保存データ要復元';el.dataset.state='warn';setStoreBlocked(result.error);return;}
  setStoreBlocked('');const last=result.store.lastBackupAt;if(!last){el.textContent='バックアップ未作成';el.dataset.state='warn';return;}const days=Math.floor((Date.now()-new Date(last).getTime())/86400000);el.textContent=days<=0?'最終バックアップ：今日':`最終バックアップ：${days}日前`;el.dataset.state=days>=7?'warn':'ok';
}

function injectStyles(){
  const style=document.createElement('style');style.textContent=`
  .teacher-dock{position:fixed;z-index:45;right:12px;top:12px;width:min(460px,44vw);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif;touch-action:none}.teacher-dock-card{background:rgba(19,32,55,.97);color:#fff;border-radius:18px;padding:10px;box-shadow:0 14px 38px rgba(0,0,0,.28);backdrop-filter:blur(10px)}.teacher-dock-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:900;cursor:move;user-select:none}.teacher-head-main{display:flex;align-items:center;gap:8px;min-width:0}.teacher-head-tools{display:flex;gap:4px}.teacher-head-btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;border-radius:8px;width:31px;height:31px;font-weight:900;cursor:pointer}.teacher-dock-body{margin-top:8px}.teacher-types{display:flex;gap:5px;flex-wrap:wrap}.teacher-type,.teacher-action{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.10);color:#fff;border-radius:10px;padding:7px 9px;font-weight:850;cursor:pointer;font-size:12px}.teacher-type:disabled,.teacher-action:disabled{opacity:.38;cursor:not-allowed}.teacher-action.primary{background:#f2b24b;color:#3f2b08;border-color:#f2b24b}.teacher-quick{display:flex;gap:5px;margin-top:7px;align-items:center}.teacher-quick input{min-width:0;flex:1;border-radius:9px;border:1px solid #738198;padding:7px 9px}.teacher-hint{display:block;margin-top:5px;color:#d4dbea;font-size:10px;line-height:1.35}.teacher-store-state{display:block;margin-top:7px;padding:7px 8px;border-radius:8px;background:#6a2d29;color:#fff2ef;font-size:10px;line-height:1.4}.teacher-class-state{display:block;margin-top:6px;color:#ffd38a;font-size:10px}.teacher-footer{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.teacher-dock.is-minimized{width:auto}.teacher-dock.is-minimized .teacher-dock-body,.teacher-dock.is-minimized #teacherBackupState{display:none}.teacher-dock.is-minimized .teacher-dock-card{padding:7px 9px}.teacher-dock.is-minimized .teacher-dock-head{cursor:move}.teacher-dock.is-minimized #teacherMinBtn{background:#f2b24b;color:#392706}.teacher-modal{position:fixed;inset:0;z-index:90;background:rgba(8,12,20,.58);display:grid;place-items:center;padding:20px}.teacher-modal[hidden]{display:none!important}.teacher-modal-card{width:min(720px,95vw);max-height:80vh;overflow:auto;background:#fffdf8;border-radius:18px;padding:18px;color:#172033}.teacher-modal-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}.teacher-log-row{padding:10px 0;border-bottom:1px solid #e4ddd3;line-height:1.5;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:start}.teacher-log-meta{font-size:12px;color:#6b7483;font-weight:800;margin-bottom:3px}.teacher-delete{border:1px solid #e2b8b3;background:#fff6f5;color:#9c3e35;border-radius:999px;padding:6px 9px;font-weight:800;cursor:pointer}.teacher-guide-list{display:grid;gap:12px}.teacher-guide-list article{border-bottom:1px solid #e6ded4;padding-bottom:10px}.teacher-guide-list b{display:block;margin-bottom:3px}.teacher-guide-list p{margin:0;color:#5d6878;line-height:1.5}.teacher-guide-list kbd{background:#172033;color:#fff;border-radius:6px;padding:2px 6px;font-family:inherit}#teacherBackupState[data-state="warn"]{color:#ffd38a}#teacherBackupState[data-state="ok"]{color:#bce8c8}@media(max-width:700px){.teacher-dock{right:6px;top:6px;width:auto;max-width:calc(100vw - 12px)}.teacher-dock:not(.is-minimized){width:calc(100vw - 12px)}.teacher-types{gap:4px}}
  `;document.head.appendChild(style);
}
function setMinimized(minimized){ const dock=document.getElementById('teacherDock');if(!dock)return;dock.classList.toggle('is-minimized',minimized);const b=document.getElementById('teacherMinBtn');if(b){b.textContent=minimized?'＋':'−';b.title=minimized?'Teacher panelを開く':'Teacher panelを最小化';}const ui=readUi();ui.minimized=minimized;writeUi(ui); }
function enableDrag(dock,handle){
  let active=false,dx=0,dy=0;
  handle.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;active=true;const r=dock.getBoundingClientRect();dx=e.clientX-r.left;dy=e.clientY-r.top;handle.setPointerCapture?.(e.pointerId);});
  handle.addEventListener('pointermove',e=>{if(!active)return;const maxX=Math.max(0,innerWidth-dock.offsetWidth),maxY=Math.max(0,innerHeight-dock.offsetHeight);const x=Math.min(maxX,Math.max(0,e.clientX-dx)),y=Math.min(maxY,Math.max(0,e.clientY-dy));dock.style.left=`${x}px`;dock.style.top=`${y}px`;dock.style.right='auto';const ui=readUi();ui.x=x;ui.y=y;writeUi(ui);});
  const stop=()=>{active=false};handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);
}
function showGuide(){ document.getElementById('teacherGuideModal').hidden=false; }
function injectUI(){
  document.body.classList.add('teacher-mode');const p=params(),ui=readUi();const hasClass=!!p.className;
  const dock=document.createElement('aside');dock.id='teacherDock';dock.className='teacher-dock';dock.innerHTML=`<div class="teacher-dock-card"><div class="teacher-dock-head" id="teacherDockHandle"><div class="teacher-head-main"><span>TEACHER ${escapeHtml(hasClass?`· ${p.className}`:'· クラス未指定')}</span><span id="teacherBackupState"></span></div><div class="teacher-head-tools"><button id="teacherGuideBtn" class="teacher-head-btn" type="button" title="教師用の使い方">ⓘ</button><button id="teacherMinBtn" class="teacher-head-btn" type="button" title="最小化">−</button></div></div><div class="teacher-dock-body"><div class="teacher-types">${TYPES.map(([type,icon,label])=>`<button class="teacher-type" type="button" data-log-type="${type}" title="${label}" ${hasClass?'':'disabled'}>${icon} ${label}</button>`).join('')}</div><small id="teacherClassState" class="teacher-class-state" ${hasClass?'hidden':''}>ログと進度を保存するには、My Hubからクラスを選んで開いてください。</small><small id="teacherStoreState" class="teacher-store-state" hidden></small><div class="teacher-quick"><input id="teacherQuickNote" hidden><button id="teacherQuickSave" class="teacher-action" type="button" hidden>保存</button><button id="teacherQuickSkip" class="teacher-action" type="button" hidden>閉じる</button></div><small id="teacherQuickHint" class="teacher-hint" hidden>個人を特定できる情報は入力しない。</small><div class="teacher-footer"><button id="teacherPastBtn" class="teacher-action" type="button">🧠 過去記録 0</button><button id="teacherEndBtn" class="teacher-action primary" type="button" ${hasClass?'':'disabled'}>授業終了</button></div></div></div>`;document.body.appendChild(dock);
  if(Number.isFinite(ui.x)&&Number.isFinite(ui.y)){dock.style.left=`${ui.x}px`;dock.style.top=`${ui.y}px`;dock.style.right='auto';}
  const past=document.createElement('div');past.id='teacherPastModal';past.className='teacher-modal';past.hidden=true;past.innerHTML=`<section class="teacher-modal-card" role="dialog" aria-modal="true" aria-label="過去の授業記録"><div class="teacher-modal-head"><strong>この問題の過去記録</strong><button id="teacherPastClose" class="teacher-delete" type="button">閉じる</button></div><div id="teacherPastBody"></div></section>`;document.body.appendChild(past);
  const guide=document.createElement('div');guide.id='teacherGuideModal';guide.className='teacher-modal';guide.hidden=true;guide.innerHTML=`<section class="teacher-modal-card" role="dialog" aria-modal="true" aria-label="教師用の使い方"><div class="teacher-modal-head"><strong>Teacher Guide</strong><button id="teacherGuideClose" class="teacher-delete" type="button">閉じる</button></div><div class="teacher-guide-list"><article><b>画面を進む / 戻る</b><p><kbd>→</kbd> は次の画面、<kbd>←</kbd> は直前の画面。問題・Hint・解答・解説を1画面ずつ移動します。</p></article><article><b>進度の自動保存</b><p>My Hubからクラス指定で開くと、画面を移動するたびにそのクラスの進度を自動保存します。HintやCheckなど問題内の位置も保持し、Say itまで終えた問題は次の問題から再開します。</p></article><article><b>画面を広く使う</b><p>下の操作バーは「−」で小さくできます。Teacher panelも右上の「−」で最小化。見出し部分をドラッグすると移動できます。</p></article><article><b>授業記録</b><p>My Hubからクラス指定で開いたときだけ、誤答・質問・説明成功・追記・改善を記録できます。削除した記録は復元事故を防ぐため履歴上はtombstoneとして残します。個人名は書きません。</p></article><article><b>地図</b><p>「🗺 地図」で助動詞全体の中の現在位置を確認できます。</p></article><article><b>授業終了</b><p>現在位置を再保存し、Phase 1の持ち運び用JSONバックアップを出力します。</p></article></div></section>`;document.body.appendChild(guide);

  dock.addEventListener('click',e=>{const b=e.target.closest('[data-log-type]');if(b&&!b.disabled)openQuickNote(b.dataset.logType);});
  document.getElementById('teacherQuickSave').addEventListener('click',saveQuickNote);document.getElementById('teacherQuickSkip').addEventListener('click',closeQuick);document.getElementById('teacherQuickNote').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();saveQuickNote();}if(e.key==='Escape')closeQuick();});
  document.getElementById('teacherPastBtn').addEventListener('click',showPast);document.getElementById('teacherEndBtn').addEventListener('click',endLesson);document.getElementById('teacherPastClose').addEventListener('click',()=>{past.hidden=true;});past.addEventListener('click',e=>{if(e.target===past)past.hidden=true;});document.getElementById('teacherPastBody').addEventListener('click',e=>{const b=e.target.closest('[data-delete-log]');if(b)deleteLog(b.dataset.deleteLog);});
  document.getElementById('teacherGuideBtn').addEventListener('click',showGuide);document.getElementById('teacherGuideClose').addEventListener('click',()=>{guide.hidden=true;});guide.addEventListener('click',e=>{if(e.target===guide)guide.hidden=true;});
  document.getElementById('teacherMinBtn').addEventListener('click',()=>setMinimized(!dock.classList.contains('is-minimized')));enableDrag(dock,document.getElementById('teacherDockHandle'));setMinimized(ui.minimized!==false);updateBackupLabel();renderPastCount();
}
function resumeIfRequested(){
  const url=new URL(location.href);if(url.searchParams.get('resume')!=='1')return;
  const p=requireClass();if(!p)return;const s=state(),store=readStore();if(!store)return;const key=progressKey(s.lessonId,p.schoolYear,p.className),saved=store.progress[key];if(!saved)return;
  let resumeIndex=saved.resumeSlideIndex;
  if(saved.resumeQuestionId){const found=(window.LESSON_DATA||[]).findIndex(q=>q.id===saved.resumeQuestionId);if(found>=0)resumeIndex=found;}
  if(!Number.isInteger(resumeIndex))return;
  const ok=window.LessonEngine?.jumpTo?.(resumeIndex);
  if(ok){
    const next=document.getElementById('nextBtn');const total=Number(window.LESSON_META?.questionCount||0);
    if(resumeIndex>=0&&resumeIndex<total){for(let i=0;i<Math.max(0,Number(saved.resumeStep||0));i++)next?.click();}
    else if(resumeIndex===total){for(let i=0;i<Math.max(0,Number(saved.resumeFinalStep||0));i++)next?.click();}
    const message=saved.completed?'このLessonは前回までに完了しています':`続き：${saved.resumeQuestionKey||saved.questionKey||'保存位置'}から`;setTimeout(()=>toast(message),50);
  }
}
window.addEventListener('lesson:render',()=>{renderPastCount();autoSaveProgress();});injectStyles();injectUI();resumeIfRequested();
})();