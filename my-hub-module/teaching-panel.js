(()=>{
'use strict';

const CFG = Object.freeze({
  registryUrl: '/english-classroom/registry/lessons.json',
  storeKey: 'teaching.v1',
  prefsKey: 'myHub.teaching.v1'
});

function blankStore(){ return {version:1,logs:[],progress:{},lastBackupAt:null}; }
function readJson(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch (_) { return fallback; }
}
function readStore(){
  const v=readJson(CFG.storeKey,blankStore());
  return v && v.version===1 ? v : blankStore();
}
function prefs(){
  const v=readJson(CFG.prefsKey,{});
  return {
    year:String(v.year || new Date().getFullYear()),
    classes:Array.isArray(v.classes)?v.classes:[],
    currentClass:String(v.currentClass || '')
  };
}
function savePrefs(v){ localStorage.setItem(CFG.prefsKey,JSON.stringify(v)); }
function esc(s=''){
  return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
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
function downloadBackup(){
  const store=readStore();
  store.lastBackupAt=new Date().toISOString();
  localStorage.setItem(CFG.storeKey,JSON.stringify(store));
  const blob=new Blob([JSON.stringify(store,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const d=new Date();
  const date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  a.href=url;a.download=`teaching-backup-${date}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),500);
}
function validBackup(v){
  return v && v.version===1 && Array.isArray(v.logs) && v.progress && typeof v.progress==='object';
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
  .teachhub-body{padding:16px}.teachhub-settings{display:grid;grid-template-columns:120px 1fr 170px;gap:9px;align-items:end;background:#fff;border:1px solid #ded7cc;border-radius:16px;padding:12px}
  .teachhub-settings label{font-size:12px;font-weight:850}.teachhub-settings input,.teachhub-settings select{width:100%;margin-top:5px;padding:9px;border:1px solid #cfc8bd;border-radius:9px;background:#fff}
  .teachhub-status{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:14px 0;font-size:13px;color:#687489}.teachhub-warn{color:#a45d17;font-weight:900}
  .teachhub-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:10px}.teachhub-lesson{background:#fff;border:1px solid #ded7cc;border-radius:15px;padding:14px}.teachhub-lesson h3{margin:0 0 5px}.teachhub-meta{font-size:12px;color:#7a8495;margin-bottom:10px}.teachhub-go{display:inline-block;text-decoration:none;background:#172033;color:#fff;border-radius:999px;padding:9px 13px;font-weight:900}.teachhub-go[aria-disabled="true"]{opacity:.45;pointer-events:none}
  .teachhub-section{margin-top:18px}.teachhub-section h3{margin-bottom:8px}.teachhub-log{padding:8px 0;border-bottom:1px solid #e4ddd3;font-size:13px;line-height:1.45}.teachhub-log small{color:#7a8495}
  .teachhub-actions{display:flex;gap:8px;flex-wrap:wrap}.teachhub-actions button{border:1px solid #c9c2b8;background:#fff;color:#172033;border-radius:10px;padding:8px 11px;font-weight:850}
  @media(max-width:680px){.teachhub-settings{grid-template-columns:1fr}.teachhub-status{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(s);
}

function render(){
  const p=prefs();
  const store=readStore();
  const backup=backupLabel(store);
  const classOptions=['<option value="">クラスを選択</option>',...p.classes.map(c=>`<option ${c===p.currentClass?'selected':''}>${esc(c)}</option>`)].join('');
  const lessonCards=lessons.map(l=>{
    const saved=store.progress[progressKey(p.year,p.currentClass,l.id)];
    const pos=saved?.questionKey ? `前回：${saved.questionKey}` : '進度記録なし';
    const url=p.currentClass ? teacherUrl(l,p) : '#';
    const legacyNote=l.engine==='legacy' ? '<br>Legacy教材：自動進度保存は未対応' : '';
    return `<article class="teachhub-lesson">
      <h3>${esc(l.title)}</h3>
      <div class="teachhub-meta">${esc(l.series)} · ${esc(l.engine)}<br>${esc(pos)}${legacyNote}</div>
      <a class="teachhub-go" href="${esc(url)}" target="_blank" rel="noopener" ${p.currentClass?'':'aria-disabled="true"'}>▶ ${saved?'続きから授業':'授業開始'}</a>
    </article>`;
  }).join('');

  const logs=store.logs
    .filter(x=>(!p.currentClass||x.className===p.currentClass) && String(x.schoolYear||'')===p.year)
    .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,8);
  const recent=logs.length?logs.map(x=>`<div class="teachhub-log"><small>${esc(x.date||'')} · ${esc(x.className||'')} · ${esc(x.lessonId||'')} · ${esc(x.questionKey||'')}</small><br>${esc(x.type||'')}${x.note?` — ${esc(x.note)}`:''}</div>`).join(''):'<p>この条件の授業記録はまだありません。</p>';

  panel.querySelector('.teachhub-body').innerHTML=`
    <div class="teachhub-settings">
      <label>年度<input id="teachhub-year" inputmode="numeric" value="${esc(p.year)}"></label>
      <label>担当クラス（カンマ区切り）<input id="teachhub-classes" value="${esc(p.classes.join(','))}" placeholder="1A,1B,1C,3A,3B"></label>
      <label>現在のクラス<select id="teachhub-class">${classOptions}</select></label>
    </div>
    <div class="teachhub-status"><span>${p.currentClass?`現在：${esc(p.year)}年度 ${esc(p.currentClass)}`:'クラスを選ぶと「続きから授業」が使えます。'}</span><span class="${backup.warn?'teachhub-warn':''}">${esc(backup.text)}</span></div>
    <div class="teachhub-grid">${lessonCards}</div>
    <section class="teachhub-section"><h3>最近の授業記録</h3>${recent}</section>
    <section class="teachhub-section"><h3>バックアップ</h3><div class="teachhub-actions"><button id="teachhub-backup">JSONを保存</button><button id="teachhub-import">JSONから復元</button><input id="teachhub-file" type="file" accept="application/json,.json" hidden></div></section>
  `;

  const year=panel.querySelector('#teachhub-year');
  const classes=panel.querySelector('#teachhub-classes');
  const classSelect=panel.querySelector('#teachhub-class');
  const commitPrefs=()=>{
    const list=classes.value.split(',').map(x=>x.trim()).filter(Boolean);
    const unique=[...new Set(list)];
    const current=classSelect.value && unique.includes(classSelect.value)?classSelect.value:(unique[0]||'');
    savePrefs({year:year.value.trim()||String(new Date().getFullYear()),classes:unique,currentClass:current});
    render();
  };
  year.addEventListener('change',commitPrefs);
  classes.addEventListener('change',commitPrefs);
  classSelect.addEventListener('change',()=>{
    savePrefs({year:year.value.trim(),classes:p.classes,currentClass:classSelect.value});
    render();
  });
  panel.querySelector('#teachhub-backup').addEventListener('click',()=>{downloadBackup();render();});
  panel.querySelector('#teachhub-import').addEventListener('click',()=>panel.querySelector('#teachhub-file').click());
  panel.querySelector('#teachhub-file').addEventListener('change',async e=>{
    const file=e.target.files?.[0]; if(!file)return;
    try{
      const obj=JSON.parse(await file.text());
      if(!validBackup(obj)) throw new Error('形式が違います');
      if(!confirm('現在の授業記録・進度を、このJSONバックアップで置き換えますか？'))return;
      localStorage.setItem(CFG.storeKey,JSON.stringify(obj));render();
    }catch(err){ alert(`復元できませんでした：${err.message}`); }
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
