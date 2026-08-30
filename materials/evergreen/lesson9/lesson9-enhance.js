(()=>{
'use strict';

const refs = window.LESSON_REFERENCES || null;
const app = document.getElementById('app');
const toolbar = document.querySelector('.toolbar');
if(!app || !toolbar) return;

const esc = (s='') => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function renderQuestionParts(q){
  if(!Array.isArray(q?.questionParts)) return;
  const node = document.querySelector('.question');
  if(!node) return;
  node.innerHTML = q.questionParts.map(part=>{
    const text = esc(part?.text || '');
    return part?.underline ? `<span class="source-underline">${text}</span>` : text;
  }).join('');
}

function renderVisual(v){
  if(!v || !v.kind) return '';
  const title = v.title ? `<div class="viz-title">図解｜${esc(v.title)}</div>` : '';
  if(v.kind === 'flow'){
    return `${title}<div class="viz-flow">${(v.nodes||[]).map((x,i)=>`<div class="viz-node ${x==='→'?'arrow':''}">${esc(x)}</div>`).join('')}</div>`;
  }
  if(v.kind === 'compare'){
    return `${title}<div class="viz-compare">${(v.columns||[]).map(x=>`<div class="viz-col ${x.tone==='hot'?'hot':''}"><b>${esc(x.title)}</b><span>${esc(x.body)}</span></div>`).join('')}</div>`;
  }
  if(v.kind === 'timeline'){
    return `${title}<div class="viz-timeline">${(v.items||[]).map(x=>`<div class="viz-time ${x.tone||''}"><b>${esc(x.label)}</b><span>${esc(x.sub||'')}</span></div>`).join('<div class="viz-line">→</div>')}</div>`;
  }
  if(v.kind === 'scale'){
    return `${title}<div class="viz-scale">${(v.items||[]).map((x,i)=>`<div class="viz-scale-item ${x.tone==='hot'?'hot':''}"><span class="viz-rank">${i+1}</span><b>${esc(x.label)}</b><small>${esc(x.sub||'')}</small></div>`).join('')}</div>`;
  }
  if(v.kind === 'formula'){
    return `${title}<div class="viz-formula">${(v.tokens||[]).map(x=>`<span class="viz-token ${esc(x.role||'')}">${esc(x.text)}</span>`).join('<span class="viz-plus">＋</span>')}</div>${v.note?`<div class="viz-note">${esc(v.note)}</div>`:''}`;
  }
  if(v.kind === 'decision'){
    return `${title}<div class="viz-decision">${(v.rows||[]).map(x=>`<div class="viz-decision-row"><b>${esc(x.condition)}</b><span>→</span><strong>${esc(x.result)}</strong></div>`).join('')}</div>`;
  }
  return '';
}

function enhanceQuestion(state){
  const q = window.LessonEngine?.getCurrent?.();
  if(!q) return;
  renderQuestionParts(q);

  document.querySelectorAll('.where-am-i,.question-viz').forEach(n=>n.remove());
  if(state.slideIndex < 0 || state.slideIndex >= (window.LESSON_DATA||[]).length) return;

  if(state.step >= 1 && Array.isArray(q.mapPath) && q.mapPath.length){
    const where = document.createElement('div');
    where.className = 'where-am-i';
    where.innerHTML = `<span>🧭 今ここ</span>${q.mapPath.map((x,i)=>`<b>${esc(x)}</b>${i<q.mapPath.length-1?'<i>›</i>':''}`).join('')}`;
    const top = document.querySelector('.topline');
    top?.insertAdjacentElement('afterend', where);
  }

  if(state.stage === 'reason' && q.visual){
    const panel = document.querySelector('.stage-panel');
    if(panel){
      const wrap = document.createElement('div');
      wrap.className = 'question-viz';
      wrap.innerHTML = renderVisual(q.visual);
      panel.appendChild(wrap);
    }
  }
}

function renderReferenceSection(section){
  const lead = section.lead ? `<p class="map-lead">${esc(section.lead)}</p>` : '';
  if(section.type === 'map'){
    return `${lead}<div class="concept-grid">${(section.groups||[]).map(g=>`
      <article class="concept-card ${g.lesson?'in-lesson':'outside'}">
        <div class="concept-status">${g.lesson?'LESSON 9':'周辺'}</div>
        <h3>${esc(g.title)}</h3>
        <div class="concept-items">${(g.items||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div>
        <p>${esc(g.note||'')}</p>
      </article>`).join('')}</div>`;
  }
  if(section.type === 'branch'){
    return `${lead}<div class="branch-grid">${(section.rows||[]).map(r=>`
      <article class="branch-card"><h3>${esc(r.head)}</h3><div class="branch-core">${esc(r.core)}</div>
      <div class="branch-list">${(r.branches||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div></article>`).join('')}</div>`;
  }
  if(section.type === 'compare'){
    return `${lead}<div class="map-compare">${(section.columns||[]).map(c=>`
      <article><span class="map-badge">${esc(c.badge||'')}</span><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p><strong>${esc(c.meaning||'')}</strong></article>`).join('')}</div>`;
  }
  if(section.type === 'matrix'){
    return `${lead}<div class="matrix-wrap"><table><thead><tr>${(section.headers||[]).map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead>
      <tbody>${(section.rows||[]).map(row=>`<tr>${row.map((x,i)=>`<${i===0?'th':'td'}>${esc(x)}</${i===0?'th':'td'}>`).join('')}</tr>`).join('')}</tbody></table></div>
      ${section.note?`<div class="map-note">${esc(section.note)}</div>`:''}`;
  }
  if(section.type === 'flow'){
    return `${lead}<div class="big-flow">${(section.nodes||[]).map(x=>`<span class="${x==='→'?'arrow':''}">${esc(x)}</span>`).join('')}</div>`;
  }
  if(section.type === 'timeline'){
    return `${lead}<div class="map-timeline">${(section.items||[]).map(x=>`
      <article><span>${esc(x.time)}</span><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join('')}</div>`;
  }
  return lead;
}

function buildMap(){
  if(!refs) return;
  const btn = document.createElement('button');
  btn.type='button';
  btn.id='conceptMapBtn';
  btn.className='icon-btn map-btn';
  btn.setAttribute('aria-label','Lesson 9 全体地図を開く');
  btn.title='今どこを学んでいるか全体地図で確認';
  btn.textContent='🗺 地図';
  toolbar.insertBefore(btn, document.getElementById('menuBtn')?.nextSibling || toolbar.firstChild);

  const drawer = document.createElement('div');
  drawer.id='conceptMapDrawer';
  drawer.className='concept-map-drawer';
  drawer.hidden=true;
  drawer.innerHTML=`
    <div class="concept-map-card" role="dialog" aria-modal="true" aria-labelledby="conceptMapTitle">
      <header class="concept-map-head">
        <div><small>REFERENCE MAP</small><h2 id="conceptMapTitle">${esc(refs.title||'Lesson Map')}</h2><p>${esc(refs.subtitle||'')}</p></div>
        <button type="button" id="conceptMapClose" class="map-close" aria-label="閉じる">×</button>
      </header>
      <nav class="map-tabs">${(refs.sections||[]).map((s,i)=>`<button type="button" data-map-tab="${i}" class="${i===0?'active':''}">${esc(s.title)}</button>`).join('')}</nav>
      <main id="conceptMapBody" class="concept-map-body"></main>
    </div>`;
  document.body.appendChild(drawer);

  const body = drawer.querySelector('#conceptMapBody');
  const tabs = [...drawer.querySelectorAll('[data-map-tab]')];
  function show(i){
    const s=refs.sections?.[i];
    if(!s) return;
    tabs.forEach((t,n)=>t.classList.toggle('active',n===i));
    body.innerHTML=`<section><h2>${esc(s.title)}</h2>${renderReferenceSection(s)}</section>`;
  }
  function open(){drawer.hidden=false;show(0);drawer.querySelector('#conceptMapClose').focus();}
  function close(){drawer.hidden=true;btn.focus();}
  btn.addEventListener('click',e=>{e.stopPropagation();open();});
  drawer.querySelector('#conceptMapClose').addEventListener('click',close);
  drawer.addEventListener('click',e=>{if(e.target===drawer)close();});
  tabs.forEach(t=>t.addEventListener('click',()=>show(Number(t.dataset.mapTab))));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden) close();});
}

buildMap();
window.addEventListener('lesson:render',e=>enhanceQuestion(e.detail||{}));
requestAnimationFrame(()=>enhanceQuestion(window.LessonEngine?.getState?.()||{}));
})();
