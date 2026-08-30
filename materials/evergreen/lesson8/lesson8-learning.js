(()=>{
'use strict';
window.LESSON_FINAL_CHECK={sections:[
  {
    type:'quick',
    title:'Quick Response',
    leadEn:'Say the English before you check.',
    leadJp:'答えを見る前に、まず声に出してみよう。',
    items:[
      {cue:'未来の「〜できるだろう」',answer:'will be able to + V'},
      {cue:'過去の「〜しなければならなかった」',answer:'had to + V'},
      {cue:'「〜してはいけない」',answer:'mustn’t + V'},
      {cue:'「〜する必要はない」',answer:'don’t have to + V'},
      {cue:'「〜すべきだ／したほうがよい」',answer:'should / ought to + V'},
      {cue:'「〜しないほうがよい」',answer:'had better not + V'},
      {cue:'強い推量「〜に違いない」',answer:'must + V'},
      {cue:'強い否定推量「〜のはずがない」',answer:'can’t + V'}
    ]
  },
  {
    type:'choice',
    title:'Which one?',
    leadEn:'Choose first. Then check why.',
    leadJp:'先に選んでから、理由を確かめよう。',
    items:[
      {cue:'Jim will help me, so you ___ come.',note:'mustn’t / don’t have to',answer:'don’t have to',why:'not necessary ≠ prohibited'},
      {cue:'There is no proof. The rumor ___ be true.',note:'must / can’t',answer:'can’t',why:'strong negative inference'},
      {cue:'Heavy snow. The bus ___ be late.',note:'must / may',answer:'must',why:'strong evidence-backed inference'},
      {cue:'「この辞書を使ってもよろしいですか」',note:'May I / Can you',answer:'May I',why:'I asks permission'}
    ]
  },
  {
    type:'backup',
    title:'Say the whole sentence.',
    cue:'一生懸命勉強すれば，あなたは試験に合格できるだろう。',
    chunks:['You will','be able to','pass the exam','if you study hard.'],
    audio:'You will be able to pass the exam if you study hard.'
  },
  {
    type:'try',
    title:'Can you say it?',
    items:[
      {cue:'そのうわさは本当であるはずがない。',answer:'The rumor can’t be true.'},
      {cue:'その男性はプロのテニス選手に違いない。',answer:'The man must be a professional tennis player.'},
      {cue:'あなたはレイチェルに助言を求めないほうがよい。',answer:'You had better not ask Rachel for advice.'}
    ]
  },
  {
    type:'finish',
    title:'Nice work.',
    leadEn:'You can now choose a modal by meaning, evidence, and situation.',
    leadJp:'「日本語訳だけ」で選ばず、能力・許可・必要・推量のどこにいるかを見て助動詞を選べるところまで確認しました。'
  }
]};
})();