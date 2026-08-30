function escapeHtml(s="") {
  return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function speak(text) {
  if (!('speechSynthesis' in window)) { toast('このブラウザは読み上げに対応していません'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\[[^\]]*\]/g, ''));
  u.lang = 'en-US';
  u.rate = Number(document.getElementById('speechRate').value || 1);
  const voices = speechSynthesis.getVoices();
  const v = voices.find(v => /^en(-|_)/i.test(v.lang) && /female|samantha|zira|ava|aria|jenny/i.test(v.name)) || voices.find(v => /^en(-|_)/i.test(v.lang));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(window.__toast); window.__toast = setTimeout(()=>el.classList.remove('show'), 1700);
}
function audioButton(text) { return `<button class="audio-btn" data-speak="${escapeHtml(text)}">▶ 英語</button>`; }

function renderNav() {
  const nav = document.getElementById('navList');
  nav.innerHTML = NAV_ITEMS.map(([id,label,sub]) => `<button class="nav-btn" data-target="${id}"><span>${label}</span><small>${sub}</small></button>`).join('');
}

function renderMapIntro() {
  document.getElementById('map-intro').innerHTML = `
    <div class="section-head"><div><div class="eyebrow">BIG PICTURE</div><h2>まず3つの箱に分ける</h2></div><p>問題ごとに別々の意味を覚えるのではなく、最初に「何を判断しているか」で大きく分けます。迷ったら一覧表を開いて戻ってきます。</p></div>
    <div class="map-summary">
      <article class="map-card family-a"><h3>A｜能力・許可</h3><p>できる？／してよい？／してくれる？</p><b>can, could, be able to, may</b><br><button class="secondary-btn jump" data-target="chapter-a">Aへ</button></article>
      <article class="map-card family-b"><h3>B｜義務・必要</h3><p>しなければ？／してはいけない？／しなくてよい？</p><b>must, have to, should, ought to, had better</b><br><button class="secondary-btn jump" data-target="chapter-b">Bへ</button></article>
      <article class="map-card family-c"><h3>C｜可能性・推量</h3><p>どれくらい「そうだ」と見ている？ 根拠は？</p><b>must, should, will, may, might, could, can’t</b><br><button class="secondary-btn jump" data-target="chapter-c">Cへ</button></article>
    </div>
    <div class="master-rule-list">
      <div class="master-rule"><b>① 助動詞 + 原形</b><span>can speak / must go / should stay</span></div>
      <div class="master-rule"><b>② 疑問文は前へ</b><span>Can I ...? / Can you ...?</span></div>
      <div class="master-rule"><b>③ not は意味を確認</b><span>mustn’t ≠ don’t have to</span></div>
      <div class="master-rule"><b>④ 推量は根拠を見る</b><span>数字ではなく、話し手の判断の強さ</span></div>
    </div>
    <div class="notice"><b>授業の合言葉：</b>「この助動詞は何%？」ではなく、<b>「話し手は何を根拠に、どんな強さで言っている？」</b></div>
    <details class="accuracy-note"><summary>元の「助動詞のすべて」表から直したポイント</summary><ul>
      <li>is / isn’t は助動詞ではないため、100% / 0% の助動詞としては扱いません。</li>
      <li>must 99%、may 50%、can 30% のような固定確率は削除しました。推量の強さは文脈依存です。</li>
      <li>have to / be able to は便利ですが、厳密には助動詞そのものではなく「助動詞相当表現」と整理します。</li>
      <li>may / might / could の差は固定の数値ではなく、控えめさ・距離感・文脈で説明します。</li>
      <li>had better は単なる強い must ではなく、悪い結果を避けるための警告的な助言として整理します。</li>
      <li>may not は「～しないかもしれない」と「～してはいけない」の両方があるため、文脈で区別します。</li>
    </ul></details>`;
}

function renderChapter(id, items, familyLabel, desc) {
  document.getElementById(id).innerHTML = `
    <div class="section-head"><div><div class="eyebrow">${familyLabel}</div><h2>${desc}</h2></div><p>例文を音で確認し、同じ形でも「能力」「許可」「推量」のどれなのかを場面から判断します。</p></div>
    <div class="lesson-grid">${items.map(item => `
      <article class="lesson-card">
        <div class="num">${item.n}</div><h3>${item.title}</h3>
        ${item.examples.map(([en,ja])=>`<div class="point"><div class="en">${escapeHtml(en)}</div><div class="ja">${escapeHtml(ja)}</div>${audioButton(en)}</div>`).join('')}
        <p><b>ポイント：</b>${item.point}</p>
        ${item.compare ? `<div class="mini-compare">${item.compare.map(([a,b])=>`<div class="mini-row"><b>${a}</b><span>${b}</span></div>`).join('')}</div>`:''}
        <p class="note"><b>注意：</b>${item.note}</p>
      </article>`).join('')}
    </div>`;
}

function renderAnswerPanel(q) {
  return `<div class="answer-panel">
    <div class="answer-main"><div class="answer-label">ANSWER</div><div class="answer-text">${escapeHtml(q.answer)}</div>${q.full ? audioButton(q.full) : (q.en ? audioButton(q.en) : '')}</div>
    <div class="explain-grid"><div class="explain-block"><h4>なぜこの答え？</h4><p>${q.why}</p></div><div class="explain-block"><h4>まちがいやすい理由</h4><p>${q.wrong}</p></div></div>
    <div class="translation"><b>日本語 / 意味</b><p>${q.tr}</p></div>
  </div>`;
}

function renderEx1() {
  document.getElementById('exercise1').innerHTML = `<div class="section-head"><div><div class="eyebrow">EXERCISE 1</div><h2>問題 1〜5</h2></div><p>問題タイトルには答えのヒントを入れていません。まず自分で考え、クリックして答えと理由を確認します。</p></div><div class="question-list">${ex1.map(q=>`
    <article class="question-card"><div class="q-head"><span class="q-number">Q${q.id}</span><span class="q-type">空所補充</span></div><div class="q-ja">${q.ja}</div><div class="q-en">${q.en}</div><div class="card-actions">${audioButton(q.en.replace(/\(\s*\)/g, 'blank'))}<button class="reveal-btn">答え・解説を表示</button></div>${renderAnswerPanel(q)}</article>`).join('')}</div>`;
}
function renderEx2() {
  document.getElementById('exercise2').innerHTML = `<div class="section-head"><div><div class="eyebrow">EXERCISE 2</div><h2>問題 1〜4</h2></div><p>選択肢をクリックしてから、答えの理由と誤答の理由を確認します。</p></div><div class="question-list">${ex2.map(q=>`
    <article class="question-card" data-correct="${escapeHtml(q.correct)}"><div class="q-head"><span class="q-number">Q${q.id}</span><span class="q-type">選択</span></div><div class="q-en">${q.prompt}</div>${audioButton(q.prompt)}<div class="choices">${q.choices.map(c=>`<button class="choice-btn" data-choice="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div><button class="reveal-btn">答え・解説を表示</button>${renderAnswerPanel(q)}</article>`).join('')}</div>`;
}
function renderEx3() {
  document.getElementById('exercise3').innerHTML = `<div class="section-head"><div><div class="eyebrow">EXERCISE 3</div><h2>問題 1〜5</h2></div><p>助動詞を機械的に一語訳せず、文全体で「能力・義務・推量」のどれかを判断します。</p></div><div class="question-list">${ex3.map(q=>`
    <article class="question-card"><div class="q-head"><span class="q-number">Q${q.id}</span><span class="q-type">和訳</span></div><div class="q-en">${q.en}</div><div class="card-actions">${audioButton(q.en)}<button class="reveal-btn">訳・解説を表示</button></div>${renderAnswerPanel(q)}</article>`).join('')}</div>`;
}
function renderEx4() {
  document.getElementById('exercise4').innerHTML = `<div class="section-head"><div><div class="eyebrow">EXERCISE 4</div><h2>問題 1〜7</h2></div><p>語順では「助動詞の位置」と「助動詞の後は原形」を最優先で確認します。</p></div><div class="question-list">${ex4.map(q=>`
    <article class="question-card"><div class="q-head"><span class="q-number">Q${q.id}</span><span class="q-type">語順</span></div>${q.prefix?`<div class="q-en">${q.prefix} [ ... ]${q.suffix}</div>`:`<div class="q-en">[ ... ]${q.suffix}</div>`}<div class="order-bank">${q.words.map(w=>`<span class="word-chip">${escapeHtml(w)}</span>`).join('')}</div><button class="reveal-btn">答え・解説を表示</button>${renderAnswerPanel({...q, full:q.answer})}</article>`).join('')}</div>`;
}

function renderContrast() {
  const items = [
    {vs:"mustn’t / don’t have to", lines:[["You mustn’t bring your notebook tomorrow.","ノートを持ってきてはいけない。"],["You don’t have to bring your notebook tomorrow.","ノートを持ってこなくてもよい。"]], q:"行為は『禁止』？ それとも『自由に選べる』？"},
    {vs:"must / should", lines:[["You must stay here.","ここにいなければならない。"],["You should stay here.","ここにいるべきだ。"]], q:"話し手は命令・強い必要を言っている？ それとも助言？"},
    {vs:"must / may / can’t", lines:[["Ken must be at school.","ケンは学校にいるに違いない。"],["Ken may be at school.","ケンは学校にいるかもしれない。"],["Ken can’t be at school.","ケンが学校にいるはずがない。"]], q:"どんな証拠なら、この3つのどれを選ぶ？"}
  ];
  document.getElementById('contrast').innerHTML = `<div class="section-head"><div><div class="eyebrow">MEANING CHOICE LAB</div><h2>意味を比べる</h2></div><p>「正解を当てる」より、別の助動詞に変えたとき意味がどう動くかを確認します。</p></div><div class="contrast-grid">${items.map(x=>`<article class="contrast-card"><div class="vs">${x.vs}</div><div class="contrast-lines">${x.lines.map(([en,ja])=>`<div class="contrast-line"><div class="en">${en}</div><div class="ja">${ja}</div>${audioButton(en)}</div>`).join('')}</div><div class="hinge-question">${x.q}</div></article>`).join('')}</div>`;
}
function renderTry() {
  document.getElementById('try').innerHTML = `<div class="section-head"><div><div class="eyebrow">TRY</div><h2>英作文 1〜3</h2></div><p>日本語を見て、まず「能力・義務・推量」のどの箱かを決めてから英文にします。</p></div><div class="question-list">${tries.map(q=>`<article class="question-card"><div class="q-head"><span class="q-number">Q${q.id}</span><span class="q-type">英作文</span></div><div class="q-ja">${q.ja}</div><button class="reveal-btn">答え・解説を表示</button>${renderAnswerPanel(q)}</article>`).join('')}</div>`;
}
function renderExit() {
  document.getElementById('exit').innerHTML = `
    <div class="section-head"><div><div class="eyebrow">EXIT TICKET</div><h2>最後の3分</h2></div><p>答えだけでなく、「なぜその助動詞か」「どんな情報なら答えが変わるか」を言えるか確認します。</p></div>
    <div class="exit-grid">
      <article class="exit-card"><h3>1</h3><div class="q-en">The sign says, “No entry.” You ( mustn’t / don’t have to ) enter this room.</div><textarea placeholder="答えと理由"></textarea></article>
      <article class="exit-card"><h3>2</h3><div class="q-en">Mika’s shoes are here, and I can hear music in her room. She ( must / may / can’t ) be home.</div><textarea placeholder="答えと理由"></textarea></article>
      <article class="exit-card"><h3>3</h3><p>2で別の助動詞を選ぶには、どんな情報に変わればよいですか。</p><textarea placeholder="例：もし〜なら…"></textarea></article>
      <article class="exit-card"><h3>4</h3><p>1〜2のどちらかを少し変え、自分の英文を1文書きなさい。</p><textarea placeholder="My sentence..."></textarea></article>
    </div>
    <div class="card-actions"><button class="reveal-btn" id="exitReveal">解答の目安を表示</button></div>
    <div class="answer-panel" id="exitAnswer"><div class="answer-main"><div class="answer-label">ANSWER GUIDE</div><div class="answer-text">1. mustn’t　/　2. must（中心解）</div></div><div class="explain-grid"><div class="explain-block"><h4>1</h4><p>No entry は明示的な禁止なので mustn’t。don’t have to なら「入る必要はない」で禁止になりません。</p></div><div class="explain-block"><h4>2</h4><p>靴があり、部屋から音楽も聞こえるという複数の根拠から、強い推量 must が中心。根拠の読み方によって may を議論する余地はあります。</p></div></div></div>`;
}

function renderModal(tab='all') {
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  const targetRows = tab==='all' ? modalRows : modalRows.filter(r=>r.family===tab);
  const certaintyHtml = (tab==='all' || tab==='可能性・推量') ? `<h3>推量の「強さ」は数値ではなく目安で</h3><div class="certainty-strip">${certainty.map(([a,b,c])=>`<div class="cert-row"><div class="cert-label">${a}</div><div class="cert-bar"><strong>${b}</strong> — ${c}</div></div>`).join('')}</div><div class="notice">may / might / could の順序や確率を固定しないこと。<b>どの程度の根拠があり、どれだけ断定を避けたいか</b>で選びます。</div>`:'';
  document.getElementById('mapContent').innerHTML = `${certaintyHtml}<div class="table-wrap"><table class="modal-table"><thead><tr><th>表現</th><th>コア</th><th>主な用法</th><th>not / 否定</th><th>Lesson 8での注意</th></tr></thead><tbody>${targetRows.map(r=>`<tr><td>${r.word}<br><span class="pill">${r.family}</span></td><td>${r.core}</td><td>${r.meanings}</td><td>${r.neg}</td><td>${r.note}</td></tr>`).join('')}</tbody></table></div>`;
}
function setupModal() {
  const tabs = ['all','能力・許可','義務・必要','可能性・推量'];
  document.getElementById('mapTabs').innerHTML = tabs.map(t=>`<button class="tab-btn ${t==='all'?'active':''}" data-tab="${t}">${t==='all'?'すべて':t}</button>`).join('');
  renderModal('all');
  document.getElementById('mapTabs').addEventListener('click', e=>{ const b=e.target.closest('.tab-btn'); if(b) renderModal(b.dataset.tab); });
}
function openModal() { const m=document.getElementById('mapModal'); m.classList.add('open'); m.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeModal() { const m=document.getElementById('mapModal'); m.classList.remove('open'); m.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
function showPage(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active-page', p.id===id));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.target===id));
  history.replaceState(null,'',`#${id}`);
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>document.getElementById('main').focus({preventScroll:true}), 100);
}
function bindEvents() {
  document.body.addEventListener('click', e=>{
    const nav=e.target.closest('[data-target]'); if(nav && (nav.classList.contains('nav-btn')||nav.classList.contains('jump'))) { showPage(nav.dataset.target); return; }
    const aud=e.target.closest('[data-speak]'); if(aud) { speak(aud.dataset.speak); return; }
    const reveal=e.target.closest('.reveal-btn'); if(reveal) {
      if(reveal.id==='exitReveal') { document.getElementById('exitAnswer').classList.toggle('open'); reveal.textContent=document.getElementById('exitAnswer').classList.contains('open')?'解答を閉じる':'解答の目安を表示'; return; }
      const card=reveal.closest('.question-card'); const panel=card?.querySelector('.answer-panel'); if(panel){ panel.classList.toggle('open'); reveal.textContent=panel.classList.contains('open')?'解説を閉じる':'答え・解説を表示'; }
      return;
    }
    const choice=e.target.closest('.choice-btn'); if(choice){
      const card=choice.closest('.question-card'); const correct=card.dataset.correct;
      card.querySelectorAll('.choice-btn').forEach(b=>b.classList.remove('correct','wrong'));
      if(choice.dataset.choice===correct){ choice.classList.add('correct'); toast('正解'); }
      else { choice.classList.add('wrong'); const right=[...card.querySelectorAll('.choice-btn')].find(b=>b.dataset.choice===correct); if(right) right.classList.add('correct'); toast('意味の違いを確認'); }
      card.querySelector('.answer-panel')?.classList.add('open');
      return;
    }
  });
  document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('sidebar').classList.add('open'));
  document.getElementById('closeMenuBtn').addEventListener('click',()=>document.getElementById('sidebar').classList.remove('open'));
  ['mapBtnTop','openMapHero','floatingMapBtn'].forEach(id=>document.getElementById(id)?.addEventListener('click',openModal));
  document.getElementById('closeMapBtn').addEventListener('click',closeModal);
  document.querySelector('[data-close-modal]').addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
  document.getElementById('fullscreenBtn').addEventListener('click',async()=>{ try { if(!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch(_){} });
}

function init() {
  renderNav(); renderMapIntro();
  renderChapter('chapter-a', chapters.a, 'A', '能力・許可を表す助動詞');
  renderChapter('chapter-b', chapters.b, 'B', '義務・必要を表す助動詞');
  renderChapter('chapter-c', chapters.c, 'C', '可能性・推量を表す助動詞');
  renderEx1(); renderEx2(); renderEx3(); renderEx4(); renderContrast(); renderTry(); renderExit(); setupModal(); bindEvents();
  const hash=(location.hash||'#home').slice(1); showPage(NAV_ITEMS.some(x=>x[0]===hash)?hash:'home');
}
document.addEventListener('DOMContentLoaded', init);
