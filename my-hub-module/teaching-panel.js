(()=>{
'use strict';

const CFG = Object.freeze({
  registryUrl: '/english-classroom/registry/lessons.json',
  storeKey: 'teaching.v1',
  prefsKey: 'myHub.teaching.v1'
});

function schoolYearNow(d=new Date()){ return String(d.getMonth()<3 ? d.getFullYear()-1 : d.getFullYear()); }
function blankStore(){ return {version:1,logs:[],progress:{},lastBackupAt:null}; }
function validStore(v){ return !!(v && v.version===1 && Array.isArray(v.logs) && v.progress && typeof v.progress==='object' && !Array.isArray(v.progress)); }
function readJson(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch (_) { return fallback; }
}
function readStoreResult(){
  const raw=localStorage.getItem(CFG.storeKey);
  if(raw===null) return {ok:true,store:blankStore(),source:'empty'};
  try{
    const v=JSON.parse(raw);
    if(!validStore(v)) return {ok:false,error:'授業保存データの形式が未対応です。JSONバックアップから復元するまで上書きしません。'};
    return {ok:true,store:v,source:'stored'};
  }catch(_){
    return {ok:false,error:'授業保存データを読み取れません。JSONバックアップから復元するまで上書きしません。'};
  }
}
function uniqueStrings(values){ return [...new Set((values||[]).map(x=>String(x).trim()).filter(Boolean))]; }
function parseClasses(text){ return uniqueStrings(String(text||'').split(',')); }
function normalizeLessonClasses(value){
  if(!value || typeof value!=='object' || Array.isArray(value)) return {};
  const out={};
  for(const [lessonId,classes] of Object.entries(value)) out[lessonId]=Array.isArray(classes)?uniqueStrings(classes):[];
  return out;
}
function allClasses(lessonClasses,legacy=[]){
  return uniqueStrings([...legacy,...Object.values(lessonClasses||{}).flat()]);
}
function prefs(){
  const v=readJson(CFG.prefsKey,{});
  const year=String(v.year || schoolYearNow());
  const byYear=v.lessonClassesByYear && typeof v.lessonClassesByYear==='object' && !Array.isArray(v.lessonClassesByYear) ? v.lessonClassesByYear : {};
  let lessonClasses=normalizeLessonClasses(byYear[year]);
  const legacyClasses=Array.isArray(v.classes)?uniqueStrings(v.classes):[];
  if(!Object.keys(lessonClasses).length){
    const legacyMap=normalizeLessonClasses(v.lessonClasses);
    if(Object.keys(legacyMap).length) lessonClasses=legacyMap;
    else if(legacyClasses.length && lessons.length) lessonClasses=Object.fromEntries(lessons.map(l=>[l.id,[...legacyClasses]]));
  }
  const classes=allClasses(lessonClasses,legacyClasses);
  const currentCandidate=String(v.currentClass || '');
  return {
    year,
    classes,
    currentClass:classes.includes(currentCandidate)?currentCandidate:'',
    lessonClasses
  };
}
function savePrefsState(p){
  const old=readJson(CFG.prefsKey,{});
  const year=String(p.year||schoolYearNow());
  const lessonClasses=normalizeLessonClasses(p.lessonClasses);
  const classes=allClasses(lessonClasses);
  const currentClass=classes.includes(String(p.currentClass||''))?String(p.currentClass):'';
  const byYear=old.lessonClassesByYear && typeof old.lessonClassesByYear==='object' && !Array.isArray(old.lessonClassesByYear) ? {...old.lessonClassesByYear} : {};
  byYear[year]=lessonClasses;
  localStorage.setItem(CFG.prefsKey,JSON.stringify({...old,year,classes,currentClass,lessonClassesByYear:byYear}));
}
function switchYear(year){
  const old=readJson(CFG.prefsKey,{});
  localStorage.setItem(CFG.prefsKey,JSON.stringify({...old,year:String(year||schoolYearNow()),currentClass:''}));
}
function esc(s=''){
  return String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
}
function progressKey(year,className,lessonId){ return `${year}::${className || '_unset'}::${lessonId}`; }
function daysAgo(iso){
  if(!iso) return null;
  const ms=Date.now()-new Date(iso).getTime();
  return Math.max(0,Math.floor(ms/86400000));
}
function backupLabel(store){
  const d=daysAgo(store.lastBackupAt);
  if(d===null) return {text:'バックアップ未作成',warn:true};
  if(d===0) return {text:'最終バックアップ：今日',warn:false};
  return {text:`最終バックアップ：${d}日前`,warn:d>=7};
}
function teacherUrl(lesson,p){
  const url=new URL(`/english-classroom/${lesson.path}`,location.origin);
  url.searchParams.set('year',p.year);
  url.searchParams.set('class',p.currentClass);
  url.searchParams.set('resume','1');
  return url.toString();
}
function writeStore(store){
  if(!validStore(store)) throw new Error('保存形式が不正です');
  localStorage.setItem(CFG.storeKey,JSON.stringify(store));
}
function downloadBackup(){
  const result=readStoreResult();
  if(!result.ok){alert(result.error);return false;}
  const store=result.store;
  store.lastBackupAt=new Date().toISOString();
  try{writeStore(store);}catch(err){alert(`バックアップ前の保存に失敗しました：${err.message}`);return false;}
  const blob=new Blob([JSON.stringify(store,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const d=new Date();
  const date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  a.href=url;a.download=`teaching-backup-${date}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),500);return true;
}
function validBackup(v){
  return validStore(v) && v.logs.every(x=>x && typeof x==='object' && typeof x.recordId==='string' && x.recordId);
}
function stamp(x){
  return Math.max(0,...['createdAt','updatedAt','deletedAt','savedAt'].map(k=>{const n=Date.parse(x?.[k]||'');return Number.isFinite(n)?n:0;}));
}
function latestIso(a,b){ const aa=Date.parse(a||''),bb=Date.parse(b||'');if(!Number.isFinite(aa))return b||null;if(!Number.isFinite(bb))return a||null;return aa>=bb?a:b; }
function mergeStores(current,incoming){
  const logs=new Map();
  for(const rec of current.logs||[]) if(rec?.recordId) logs.set(rec.recordId,{...rec});
  for(const rec of incoming.logs||[]){
    if(!rec?.recordId) continue;
    const prev=logs.get(rec.recordId);
    if(!prev || stamp(rec)>stamp(prev)) logs.set(rec.recordId,{...rec});
  }
  const progress={...(current.progress||{})};
  for(const [key,value] of Object.entries(incoming.progress||{})){
    const prev=progress[key];
    if(!prev || stamp(value)>stamp(prev)) progress[key]={...value};
  }
  return {version:1,logs:[...logs.values()],progress,lastBackupAt:latestIso(current.lastBackupAt,incoming.lastBackupAt)};
}

let lessons=[];
let root;
let panel;

function injectCss(){
  const s=document.createElement('style');
  s.textContent=`
  #teachhub-launch{position:fixed;right:18px;bottom:18px;z-index:110;border:0;border-radius:999px;background:#172033;color:#fff;padding:12px 17px;font-weight:900;box-shadow:0 12px 32px rgba(0,0,0,.24);cursor:pointer}
  #teachhub-panel{position:fixed;inset:0;z-index:120;background:rgba(10,15,24,.5);display:grid;place-items:center;padding:14px}
  #teachhub-panel[hidden]{display:none!important}.teachhub-card{width:min(920px,97vw);max-height:92vh;overflow:auto;background:#faf8f4;color:#172033;border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.3)}
  .teachhub-head{position:sticky;top:0;z-index:3;display:flex;justify-content:space-between;align-items:center;gap:12px;background:#172033;color:#fff;padding:14px 18px}.teachhub-head button{border:1px solid #ffffff40;background:#ffffff14;color:#fff;border-radius:10px;padding:7px 10px;font-weight:900}
  .teachhub-body{padding:16px}.teachhub-settings{display:grid;grid-template-columns:140px 1fr;gap:9px;align-items:end;background:#fff;border:1px solid #ded7cc;border-radius:16px;padding:12px}
  .teachhub-settings label{font-size:12px;font-weight:850}.teachhub-settings input,.teachhub-settings select{width:100%;margin-top:5px;padding:9px;border:1px solid #cfc8bd;border-radius:9px;background:#fff}
  .teachhub-status{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:14px 0;font-size:13px;color:#687489}.teachhub-warn{color:#a45d17;font-weight:900}.teachhub-blocked{margin:12px 0;padding:11px 13px;border-radius:12px;background:#fff0ed;border:1px solid #e7bbb4;color:#8b342d;font-weight:800;font-size:13px;line-height:1.45}
  .teachhub-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:10px}.teachhub-lesson{background:#fff;border:1px solid #ded7cc;border-radius:15px;padding:14px}.teachhub-lesson h3{margin:0 0 5px}.teachhub-meta{font-size:12px;color:#7a8495;margin-bottom:10px}.teachhub-go{display:inline-block;text-decoration:none;background:#172033;color:#fff;border-radius:999px;padding:9px 13px;font-weight:900}.teachhub-go[aria-disabled="true"]{opacity:.45;pointer-events:none}
  .teachhub-empty{background:#fff;border:1px dashed #cfc8bd;border-radius:15px;padding:18px;color:#687489;line-height:1.55}
  .teachhub-assignments{display:grid;gap:8px}.teachhub-assignment{display:grid;grid-template-columns:minmax(180px,1fr) minmax(230px,1.2fr);gap:12px;align-items:center;background:#fff;border:1px solid #ded7cc;border-radius:13px;padding:10px 12px}.teachhub-assignment strong{font-size:13px}.teachhub-assignment small{display:block;color:#7a8495;margin-top:2px}.teachhub-assignment input{width:100%;padding:9px 10px;border:1px solid #cfc8bd;border-radius:9px;background:#fff}.teachhub-help{margin:6px 0 0;color:#7a8495;font-size:12px;line-height:1.45}
  .teachhub-section{margin-top:18px}.teachhub-section h3{margin-bottom:8px}.teachhub-log{padding:8px 0;border-bottom:1px solid #e4ddd3;font-size:13px;line-height:1.45}.teachhub-log small{color:#7a8495}
  .teachhub-actions{display:flex;gap:8px;flex-wrap:wrap}.teachhub-actions button{border:1px solid #c9c2b8;background:#fff;color:#172033;border-radius:10px;padding:8px 11px;font-weight:850}.teachhub-actions button:disabled{opacity:.4;cursor:not-allowed}
  @media(max-width:680px){.teachhub-settings,.teachhub-assignment{grid-template-columns:1fr}.teachhub-status{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(s);
}

function render(){
  const p=prefs();
  const storeResult=readStoreResult();
  const store=storeResult.ok?storeResult.store:blankStore();
  const blocked=!storeResult.ok;
  const backup=backupLabel(store);
  const classOptions=['<option value="">クラスを選択</option>',...p.classes.map(c=>`<option ${c===p.currentClass?'selected':''}>${esc(c)}</option>`)].join('');
  const assignments=lessons.map(l=>{
    const assigned=p.lessonClasses[l.id]||[];
    return `<div class="teachhub-assignment">
      <div><strong>${esc(l.title)}</strong><small>${esc(l.series)} · ${esc(l.engine)}</small></div>
      <input type="text" data-lesson-classes="${esc(l.id)}" value="${esc(assigned.join(','))}" placeholder="例：1A,1B,1C" aria-label="${esc(l.title)}の使用クラス">
    </div>`;
  }).join('');

  const visibleLessons=p.currentClass
    ? lessons.filter(l=>(p.lessonClasses[l.id]||[]).includes(p.currentClass))
    : [];
  const lessonCards=visibleLessons.map(l=>{
    const saved=store.progress[progressKey(p.year,p.currentClass,l.id)];
    let pos=blocked?'保存データを復元してください':'進度記録なし';
    if(!blocked&&saved?.questionKey){
      if(saved.completed) pos=`前回：${saved.questionKey}まで完了`;
      else if(saved.resumeQuestionKey && saved.resumeQuestionKey!==saved.questionKey) pos=`前回：${saved.questionKey}まで / 次回：${saved.resumeQuestionKey}`;
      else pos=`次回：${saved.resumeQuestionKey || saved.questionKey}から`;
    }
    const enabled=!!p.currentClass&&!blocked;
    const url=enabled ? teacherUrl(l,p) : '#';
    const legacyNote=l.engine==='legacy' ? '<br>Legacy教材：自動進度保存は未対応' : '';
    const goLabel=saved?.completed?'完了画面を開く':(saved?'続きから授業':'授業開始');
    return `<article class="teachhub-lesson">
      <h3>${esc(l.title)}</h3>
      <div class="teachhub-meta">${esc(l.series)} · ${esc(l.engine)}<br>${esc(pos)}${legacyNote}</div>
      <a class="teachhub-go" href="${esc(url)}" target="_blank" rel="noopener" ${enabled?'':'aria-disabled="true"'}>▶ ${goLabel}</a>
    </article>`;
  }).join('');
  const lessonArea=lessonCards || `<div class="teachhub-empty">${p.currentClass?'このクラスに割り当てた教材はまだありません。下の「教材ごとの使用クラス」で設定してください。':'現在のクラスを選ぶと、そのクラスで使う教材だけ表示します。'}</div>`;

  const logs=store.logs
    .filter(x=>!x.deletedAt && (!p.currentClass||x.className===p.currentClass) && String(x.schoolYear||'')===p.year)
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,8);
  const recent=blocked?'<p>保存データを復元すると授業記録を表示できます。</p>':(logs.length?logs.map(x=>`<div class="teachhub-log"><small>${esc(x.date||'')} · ${esc(x.className||'')} · ${esc(x.lessonId||'')} · ${esc(x.questionKey||'')}</small><br>${esc(x.type||'')}${x.note?` — ${esc(x.note)}`:''}</div>`).join(''):'<p>この条件の授業記録はまだありません。</p>');

  panel.querySelector('.teachhub-body').innerHTML=`
    <div class="teachhub-settings">
      <label>年度<input id="teachhub-year" inputmode="numeric" value="${esc(p.year)}"></label>
      <label>現在のクラス<select id="teachhub-class">${classOptions}</select></label>
    </div>
    ${blocked?`<div class="teachhub-blocked">${esc(storeResult.error)}<br>教材を開いて新しい記録を作る前に、下の「JSONから復元」を使ってください。</div>`:''}
    <div class="teachhub-status"><span>${p.currentClass?`現在：${esc(p.year)}年度 ${esc(p.currentClass)}`:'教材ごとの使用クラスを設定すると、クラス候補が自動で作られます。'}</span><span class="${backup.warn?'teachhub-warn':''}">${blocked?'バックアップからの復元が必要':esc(backup.text)}</span></div>
    <div class="teachhub-grid">${lessonArea}</div>
    <section class="teachhub-section"><h3>教材ごとの使用クラス</h3><div class="teachhub-assignments">${assignments}</div><p class="teachhub-help">各教材で使うクラスをカンマ区切りで一度だけ登録します。例：Evergreen → 1A,1B,1C / Clover → 3A,3B</p></section>
    <section class="teachhub-section"><h3>最近の授業記録</h3>${recent}</section>
    <section class="teachhub-section"><h3>バックアップ</h3><div class="teachhub-actions"><button id="teachhub-backup" ${blocked?'disabled':''}>JSONを保存</button><button id="teachhub-import">JSONから復元（統合）</button><input id="teachhub-file" type="file" accept="application/json,.json" hidden></div></section>
  `;

  const year=panel.querySelector('#teachhub-year');
  const classSelect=panel.querySelector('#teachhub-class');
  year.addEventListener('change',()=>{switchYear(year.value.trim()||schoolYearNow());render();});
  classSelect.addEventListener('change',()=>{
    savePrefsState({...p,currentClass:classSelect.value});
    render();
  });
  panel.querySelectorAll('[data-lesson-classes]').forEach(input=>{
    input.addEventListener('change',()=>{
      const next={...p.lessonClasses,[input.dataset.lessonClasses]:parseClasses(input.value)};
      const classes=allClasses(next);
      const currentClass=classes.includes(p.currentClass)?p.currentClass:'';
      savePrefsState({...p,lessonClasses:next,currentClass});
      render();
    });
  });
  panel.querySelector('#teachhub-backup').addEventListener('click',()=>{if(downloadBackup())render();});
  panel.querySelector('#teachhub-import').addEventListener('click',()=>panel.querySelector('#teachhub-file').click());
  panel.querySelector('#teachhub-file').addEventListener('change',async e=>{
    const file=e.target.files?.[0]; if(!file)return;
    try{
      const incoming=JSON.parse(await file.text());
      if(!validBackup(incoming)) throw new Error('対応していない、または一部が壊れたバックアップです');
      const currentResult=readStoreResult();
      const base=currentResult.ok?currentResult.store:blankStore();
      const merged=mergeStores(base,incoming);
      const msg=currentResult.ok
        ?`現在の記録を残したまま統合します。\nログ ${merged.logs.length}件、進度 ${Object.keys(merged.progress).length}件になります。\nよろしいですか？`
        :'現在の保存データは読み取れません。選択したJSONを復元元として保存データを再作成します。\nよろしいですか？';
      if(!confirm(msg))return;
      writeStore(merged);render();
    }catch(err){ alert(`復元できませんでした：${err.message}`); }
    finally{e.target.value='';}
  });
}

async function init(){
  injectCss();
  root=document.createElement('button');
  root.id='teachhub-launch';root.type='button';root.textContent='🎓 授業';
  document.body.appendChild(root);
  panel=document.createElement('div');panel.id='teachhub-panel';panel.hidden=true;
  panel.innerHTML='<section class="teachhub-card" role="dialog" aria-modal="true"><header class="teachhub-head"><strong>授業</strong><button id="teachhub-close" type="button">閉じる</button></header><div class="teachhub-body"><p>読み込み中…</p></div></section>';
  document.body.appendChild(panel);
  root.addEventListener('click',()=>{panel.hidden=false;render();});
  panel.querySelector('#teachhub-close').addEventListener('click',()=>panel.hidden=true);
  panel.addEventListener('click',e=>{if(e.target===panel)panel.hidden=true;});

  try{
    const res=await fetch(`${CFG.registryUrl}?_=${Date.now()}`,{cache:'no-store'});
    if(!res.ok)throw new Error(`${res.status} ${res.statusText}`);
    const json=await res.json();
    lessons=(json.lessons||[]).filter(x=>x.status==='ready' && x.teacher!==false);
  }catch(err){
    lessons=[];
    console.error('English Classroom registry:',err);
  }
}

init();
})();