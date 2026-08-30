(()=>{
'use strict';
const details=window.LESSON10_DETAILS||{};
for(const q of (window.LESSON_DATA||[])){if(details[q.key]) Object.assign(q,details[q.key]);}
window.LESSON_FINAL_CHECK={sections:[
{
 type:'quick',
 title:'Quick Response',
 leadEn:'Say the English before you check.',
 leadJp:'答えを見る前に、まず声に出してみよう。',
 items:[
  {cue:'「〜したに違いない」',answer:'must have + p.p.'},
  {cue:'「〜したかもしれない」',answer:'may / might / could have + p.p.'},
  {cue:'「〜したはずだ」',answer:'should / ought to have + p.p.'},
  {cue:'「〜したはずがない」',answer:'cannot / can’t have + p.p.'},
  {cue:'「〜すべきだったのに」',answer:'should have + p.p.'},
  {cue:'「〜する必要はなかったのに」',answer:'needn’t have + p.p.'},
  {cue:'「〜したいと思うのですが」',answer:'would like to + V'},
  {cue:'「むしろ〜したい」',answer:'would rather + V'}
 ]
},
{
 type:'choice',
 title:'Which one?',
 leadEn:'Choose the meaning from context, not from form alone.',
 leadJp:'形だけでなく、文脈から意味を選ぼう。',
 items:[
  {cue:'Ms. Black ___ arrived by now.',note:'should have = はずだ / べきだった',answer:'〜したはずだ',why:'by now + flight schedule = expected result'},
  {cue:'Shun ___ asked someone.',note:'should have = はずだ / べきだった',answer:'〜すべきだったのに',why:'the context evaluates a past action'},
  {cue:'My sister was at the party, so she ___ met John.',note:'could have = past possibility / unrealized possibility',answer:'〜会ったかもしれない',why:'the context gives a possibility, not a stated failure'},
  {cue:'You ___ made a reservation.',note:'needn’t have = 実際にはしたが不要だった',answer:'needn’t have',why:'the reservation was actually made but was unnecessary'}
 ]
},
{
 type:'backup',
 title:'Say the whole sentence.',
 cue:'メアリーは彼女の兄［弟］にお金を貸したに違いない。',
 chunks:['Mary','must have lent','some money','to her brother.'],
 audio:'Mary must have lent some money to her brother.'
},
{
 type:'try',
 title:'Can you say it?',
 items:[
  {cue:'メグが昨日，私に電話をしたはずがない。',answer:'Meg cannot have called me yesterday.'},
  {cue:'この本を借りたいと思うのですが。',answer:'I would like to borrow this book.'},
  {cue:'学生が熱心に勉強するのは重要だ。',answer:'It is important that students should study hard.'}
 ]
},
{
 type:'finish',
 title:'Nice work.',
 leadEn:'You can now decide whether a modal looks back in time, evaluates the past, forms an idiom, or works inside a that-clause.',
 leadJp:'Lesson10では、助動詞を訳語で暗記するだけでなく、「今から過去を推量する」「過去を評価する」「慣用表現」「that節」のどこにいるかを判断できることが目標です。'
}
]};})();
