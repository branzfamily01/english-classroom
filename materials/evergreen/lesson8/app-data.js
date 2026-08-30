const NAV_ITEMS = [
  ["home", "導入", "助動詞＝話し手フィルター"],
  ["map-intro", "全体地図", "3つの大きなまとまり"],
  ["chapter-a", "A", "能力・許可"],
  ["chapter-b", "B", "義務・必要"],
  ["chapter-c", "C", "可能性・推量"],
  ["exercise1", "EXERCISE 1", "空所補充 5問"],
  ["exercise2", "EXERCISE 2", "選択 4問"],
  ["exercise3", "EXERCISE 3", "和訳 5問"],
  ["exercise4", "EXERCISE 4", "語順 7問"],
  ["contrast", "意味比較", "Why this? Why not that?"],
  ["try", "TRY", "英作文 3問"],
  ["exit", "Exit", "最後の確認"],
];

const chapters = {
  a: [
    {
      n: "A-1", title: "現在の能力と未来の能力",
      examples: [
        ["David can speak Japanese, but he can’t write it.", "デイビッドは日本語を話すことはできるが、書くことはできない。"],
        ["You will be able to swim soon.", "あなたはもうすぐ泳げるようになるでしょう。"]
      ],
      point: "can は現在の能力。未来では *will can とは言えないので、will be able to を使う。",
      note: "助動詞を2つ重ねることはできません。will の後は be able to という表現に切り替えます。"
    },
    {
      n: "A-2", title: "過去の能力と一回の達成",
      examples: [["She could play the violin at five.", "彼女は5歳のときバイオリンを弾くことができた。"]],
      point: "過去の一般的な能力は could / was able to。特定の一回で『実際にできた』を強く表すときは、was/were able to が基本。",
      note: "Lesson 8では『一般的能力＝could』『具体的な一回の成功＝was/were able to』をまず区別すると整理しやすい。",
      compare: [["could", "過去にそういう能力があった"], ["was/were able to", "その場面で実際に可能だった・達成できた"]]
    },
    {
      n: "A-3", title: "許可を与える・許可を求める",
      examples: [
        ["You can enter if you have a ticket.", "チケットを持っていれば入ってもよい。"],
        ["Can I turn on the radio?", "ラジオをつけてもいいですか。"],
        ["May I use your bathroom?", "お手洗いをお借りしてもよろしいですか。"]
      ],
      point: "can / may は許可にも使う。May I ...? は一般に Can I ...? より改まった丁寧な言い方。",
      note: "Could I ...? も許可を求める丁寧な言い方。『過去』ではなく、距離をとって柔らかくする could です。"
    },
    {
      n: "A-4", title: "依頼としての Can you ...?",
      examples: [["Can you open the window?", "窓を開けてくれませんか。"]],
      point: "形は『できますか』でも、場面では相手への依頼になることがある。",
      note: "Can I ...? は『私が～してよい？』、Can you ...? は『あなたが～してくれる？』。主語に注目。"
    },
  ],
  b: [
    {
      n: "B-1", title: "強い必要と過去の必要",
      examples: [
        ["You must attend the meeting.", "あなたはその会議に出席しなければならない。"],
        ["I had to write a report about my summer vacation.", "私は夏休みについてのレポートを書かなければならなかった。"]
      ],
      point: "must は強い義務・必要。過去の義務には通常 had to を使う。",
      note: "have to は時制を変えやすく、had to / will have to などにできます。"
    },
    {
      n: "B-2", title: "禁止と『必要なし』は正反対",
      examples: [
        ["You mustn’t use a cellphone in class.", "授業中に携帯電話を使ってはいけない。"],
        ["You don’t have to take off your shoes here.", "ここでは靴を脱がなくてもよい。"]
      ],
      point: "mustn’t = 禁止。don’t have to = する必要がない。",
      note: "日本語でどちらも『～なくて』が入るため混同しやすいが、行為が禁止されるか、自由に選べるかは正反対。",
      compare: [["mustn’t", "してはいけない（禁止）"], ["don’t have to", "しなくてもよい（不必要）"]]
    },
    {
      n: "B-3", title: "should / ought to",
      examples: [["You should exercise every day.", "あなたは毎日運動するべきだ。"]],
      point: "助言・望ましい行動・義務を表す。ought to は should に近く、やや改まった表現。",
      note: "否定は should not / ought not to。should の後は動詞の原形、ought の後は to + 動詞の原形。"
    },
    {
      n: "B-4", title: "had better は『警告つきの助言』",
      examples: [["You had better report the accident to the police.", "その事故を警察に届けたほうがいい。"]],
      point: "had better は、しないと困った結果になりそうなときの強い助言・警告。",
      note: "否定は had better not + 動詞の原形。had があっても過去形の意味ではありません。"
    },
  ],
  c: [
    {
      n: "C-1", title: "can / could が表す可能性",
      examples: [
        ["Anybody can make mistakes.", "だれでも間違いをすることはありうる。"],
        ["The light in the sky could be a plane.", "空のあの光は飛行機かもしれない。"],
        ["Can his story be true?", "彼の話が本当だなんてありうるのだろうか。"]
      ],
      point: "can は一般的・潜在的な可能性、could は個別場面の控えめな可能性にも使う。疑問の Can ... be? は『ありうるのか』という強い疑いを表せる。",
      note: "『彼は今家にいるかもしれない』のような一回の推量では、ふつう may / might / could を使う。can を単純な『30%』とは考えない。"
    },
    {
      n: "C-2", title: "may / might",
      examples: [
        ["We may have some rain tomorrow.", "明日は雨が少し降るかもしれない。"],
        ["He might come to the party with his wife.", "彼は妻と一緒にパーティーに来るかもしれない。"]
      ],
      point: "どちらも『～かもしれない』。might は may より控えめ・遠慮がちな推量になることがある。",
      note: "ただし may=50%、might=45% のような固定の数値差ではありません。文脈や話し手の態度で変わります。"
    },
    {
      n: "C-3", title: "will / would の推測",
      examples: [
        ["The phone is ringing. That will be my father.", "電話が鳴っている。たぶん父だろう。"],
        ["That would be the best solution.", "それがいちばんよい解決策でしょう。"]
      ],
      point: "will は話し手の見通し・予測、would は距離をとった控えめな判断にも使う。",
      note: "would は『過去』だけではありません。仮定・丁寧さ・過去から見た未来・過去の習慣など、文脈で意味が変わります。"
    },
    {
      n: "C-4", title: "must / can’t / should の推量",
      examples: [
        ["She must be Bobby’s sister.", "彼女はボビーの姉妹に違いない。"],
        ["Karen can’t be home now.", "カレンが今家にいるはずがない。"],
        ["My parents should be in Boston by now.", "両親は今ごろボストンにいるはずだ。"]
      ],
      point: "must = 根拠から強く結論。can’t = 根拠から不可能と判断。should = 予定・通常の流れから『そうなっているはず』。",
      note: "推量は数字で丸暗記せず、『どんな根拠から、話し手がどの程度強く判断しているか』を見る。"
    },
  ]
};

const ex1 = [
  {id:"1", ja:"一生懸命勉強すれば，あなたは試験に合格できるだろう。", en:"You will (　　　) (　　　) (　　　) pass the exam if you study hard.", answer:"be able to", full:"You will be able to pass the exam if you study hard.", tr:"一生懸命勉強すれば、あなたは試験に合格できるだろう。", why:"未来の『できる』。will と can はどちらも助動詞なので *will can と重ねられません。will + be able to にします。", wrong:"*will can は不可。助動詞の直後には動詞の原形が来るため、will be ... の形に切り替えるのがポイントです。"},
  {id:"2", ja:"エミはその音楽に合わせて踊ることができたのですか。", en:"(　　　) Emi (　　　) (　　　) dance to that music?", answer:"Was / able / to", full:"Was Emi able to dance to that music?", tr:"エミはその音楽に合わせて踊ることができたのですか。", why:"この場面では、特定の音楽に合わせて実際にできたかをたずねています。教材では was able to を中心に扱います。", wrong:"Could Emi dance ...? なら過去の能力をたずねる読みもできますが、Lesson 8では『具体的な一回の達成』を was/were able to で整理します。"},
  {id:"3", ja:"私たちは3時間，雨の中で両親を待たなければならなかった。", en:"We (　　　) (　　　) wait for our parents in the rain for three hours.", answer:"had to", full:"We had to wait for our parents in the rain for three hours.", tr:"私たちは3時間、雨の中で両親を待たなければならなかった。", why:"過去の義務・必要なので had to。義務の must には普通の過去形がないため、過去は had to で表します。", wrong:"*musted はありません。must をそのまま過去の出来事に使うのではなく、have to の過去形 had to を使います。"},
  {id:"4", ja:"強い台風が近づいているから，生徒たちは今はここにいるべきだ。", en:"The students (　　　) stay here now because a powerful typhoon is coming.", answer:"should（文脈により must も可能）", full:"The students should stay here now because a powerful typhoon is coming.", tr:"強い台風が近づいているので、生徒たちは今ここにいるべきだ。", why:"日本語の『～べきだ』に対応する中心表現は should。学校の命令・安全上の強い必要として言うなら must も文脈上成立します。", wrong:"should と must は同じ強さではありません。should は助言・望ましさ、must は強い義務・必要です。"},
  {id:"5", ja:"どんな場合でも，他人の陰口を言ってはいけない。", en:"In any case, you (　　　) speak ill of others behind their back.", answer:"mustn’t / must not", full:"In any case, you mustn’t speak ill of others behind their back.", tr:"どんな場合でも、他人の陰口を言ってはいけない。", why:"『してはいけない』は禁止なので mustn’t。", wrong:"don’t have to にすると『陰口を言う必要はない（言ってもよい）』となり、禁止になりません。"}
];

const ex2 = [
  {id:"1", prompt:'“[ Can I / Can you ] take me to the zoo sometime?” “OK. Let’s go tomorrow.”', choices:["Can I","Can you"], correct:"Can you", answer:'“Can you take me to the zoo sometime?” “OK. Let’s go tomorrow.”', tr:'「いつか動物園に連れて行ってくれない？」「いいよ。明日行こう。」', why:'相手に「私を連れて行って」と依頼しているので、主語は you。Can you ...? が自然です。', wrong:'Can I ...? だと「私があなた（または誰か）を連れて行ってもいい？」という意味になります。主語が誰かを確認。'},
  {id:"2", prompt:'Jim will help me with my work tomorrow, so you [ must not / don’t have to ] come.', choices:["must not","don’t have to"], correct:"don’t have to", answer:'Jim will help me with my work tomorrow, so you don’t have to come.', tr:'明日はジムが私の仕事を手伝ってくれるので、あなたは来なくてもよい。', why:'ジムが手伝うので「来る必要がない」。不必要は don’t have to。', wrong:'must not は「来てはいけない」という禁止。意味が強すぎるだけでなく、内容そのものが変わります。'},
  {id:"3", prompt:'“[ May I / Can you ] use this dictionary?” “Sure. Go ahead.”', choices:["May I","Can you"], correct:"May I", answer:'“May I use this dictionary?” “Sure. Go ahead.”', tr:'「この辞書を使ってもよろしいですか。」「もちろん。どうぞ。」', why:'自分が辞書を使う許可を求めているので May I ...?。', wrong:'Can you use ...? だと「あなたはこの辞書を使えますか／使ってくれますか」と相手についてたずねる形です。'},
  {id:"4", prompt:'Keep off the grass. I mean, you [ can’t / don’t have to ] walk on the grass.', choices:["can’t","don’t have to"], correct:"can’t", answer:'Keep off the grass. I mean, you can’t walk on the grass.', tr:'芝生に入らないで。つまり、芝生の上を歩いてはいけません。', why:'Keep off the grass は禁止。can’t は不許可「してはいけない」を表せます。', wrong:'don’t have to なら「歩く必要がない」で、歩くこと自体は許される意味になります。'}
];

const ex3 = [
  {id:"1", en:"Even a clever person can make mistakes if he/she isn’t careful enough.", answer:"十分注意しなければ、賢い人でさえ間違いをすることがありうる。", tr:"十分注意しなければ、賢い人でさえ間違いをすることがありうる。", why:"ここで can は能力ではなく『一般的にそういうことは起こりうる』という可能性。", wrong:"『賢い人には間違える能力がある』と能力で訳すと不自然。主語が anybody / even a clever person のときは一般的可能性を疑う。"},
  {id:"2", en:"The rumor can’t be true because there is no proof at all.", answer:"証拠がまったくないので、そのうわさが本当であるはずがない。", tr:"証拠がまったくないので、そのうわさが本当であるはずがない。", why:"can’t be は『～であるはずがない』という強い否定推量。", wrong:"能力の can’t ではありません。be true（真実である）に『できない』ではなく、根拠から可能性を否定しています。"},
  {id:"3", en:"The bus must be late because of this heavy snow.", answer:"この大雪のせいで、バスは遅れているに違いない。", tr:"この大雪のせいで、バスは遅れているに違いない。", why:"must be は義務ではなく、heavy snow という根拠からの強い推量。", wrong:"『バスは遅れなければならない』では意味が通りません。主語が人でなくても、must が推量なら自然です。"},
  {id:"4", en:"I’m not sure, but my grandmother would be in bed by now.", answer:"確信はないが、祖母はたぶん今ごろは床についているだろう。", tr:"確信はないが、祖母はたぶん今ごろは床についているだろう。", why:"I’m not sure が手がかり。would はここでは控えめな推測・判断。", wrong:"would をすぐ『～したものだった』と過去の習慣にしない。by now と現在の推量の文脈を読む。"},
  {id:"5", en:"My mother may know about the new shopping mall in the suburb.", answer:"母は郊外にあるその新しいショッピングモールについて知っているかもしれない。", tr:"母は郊外にあるその新しいショッピングモールについて知っているかもしれない。", why:"may + 動詞の原形で『～かもしれない』という推量。", wrong:"may は許可だけではありません。平叙文で状況の可能性を述べるときは推量を考えます。"}
];

const ex4 = [
  {id:"1", words:["tell","I","about","can","your plan","him"], suffix:"?", answer:"Can I tell him about your plan?", tr:"彼にあなたの計画について話してもいいですか。", why:"疑問文は 助動詞 + 主語 + 動詞の原形。Can + I + tell ...?", wrong:"*Do I can ...? とはしません。助動詞 can 自身を主語の前に出します。"},
  {id:"2", words:["rest","to","you","a","ought","take"], suffix:" anytime when you feel tired.", answer:"You ought to take a rest anytime when you feel tired.", tr:"疲れたときはいつでも休憩を取るべきです。", why:"ought は ought to + 動詞の原形。take a rest をひとかたまりで。", wrong:"*ought take ではなく ought to take。should と違って ought には to が必要です。"},
  {id:"3", words:["a","tennis player","be","the man","professional","must"], suffix:".", answer:"The man must be a professional tennis player.", tr:"その男性はプロのテニス選手に違いない。", why:"推量の must + be。「その男性は～に違いない」。", wrong:"must を義務でしか覚えていると迷います。must be + 名詞/形容詞は強い推量になりやすい形です。"},
  {id:"4", words:["Jack’s","be","can","cousin","that girl"], suffix:"? I don’t think she is.", answer:"Can that girl be Jack’s cousin? I don’t think she is.", tr:"あの女の子がジャックのいとこだなんてありうるの？ 私はそうは思わない。", why:"Can + 主語 + be ...? で『～でありうるのか』という強い疑い。", wrong:"能力の can ではなく可能性。後ろの I don’t think she is. も『本当にありうる？』という読みを支えます。"},
  {id:"5", prefix:"Fred ", words:["be","a few days","in","back","should"], suffix:". He said so.", answer:"Fred should be back in a few days. He said so.", tr:"フレッドは数日中には戻っているはずです。彼がそう言っていました。", why:"should be back = 予定・情報から『戻っているはず』。in a few days = 数日中に。", wrong:"should は『～すべき』だけではなく、推量で『～のはずだ』にもなります。"},
  {id:"6", words:["will","sister","hungry","be","after","my"], suffix:" basketball practice.", answer:"My sister will be hungry after basketball practice.", tr:"私の姉（妹）はバスケットボールの練習の後、お腹がすいているだろう。", why:"will + be + hungry で未来の予測。主語 My sister を先頭に。", wrong:"will の後は動詞の原形なので be。*will is hungry にはしません。"},
  {id:"7", words:["better","you","ask","not","Rachel","had"], suffix:" for advice.", answer:"You had better not ask Rachel for advice.", tr:"レイチェルに助言を求めないほうがいい。", why:"had better not + 動詞の原形。否定の not は better の後ろ。", wrong:"*had not better はLesson 8の基本形ではありません。固定表現 had better not ... として覚える。"}
];

const tries = [
  {id:"1", ja:"メアリーは中国語を書くことができる。", answer:"Mary can write Chinese. / Mary is able to write Chinese.", tr:"Mary can write Chinese.", why:"現在の能力なので can、または be able to。can の後は write の原形。", wrong:"*can writes / *can to write は不可。"},
  {id:"2", ja:"トムは夜遅くに外出するかもしれない。", answer:"Tom may go out late at night. / Tom might go out late at night. / Tom could go out late at night.", tr:"Tom may / might / could go out late at night.", why:"個別場面の可能性なので may / might / could が使える。", wrong:"can は一般的な可能性には使えるが、この一回の推量『トムは～かもしれない』では may / might / could が自然。"},
  {id:"3", ja:"あなたは夕食後，皿を洗わなければならない。", answer:"You must wash the dishes after dinner. / You have to wash the dishes after dinner.", tr:"You must / have to wash the dishes after dinner.", why:"義務・必要なので must / have to。wash the dishes または do the dishes でもよい。", wrong:"must to wash とはしません。must + wash。have to は have to + wash。"}
];

const modalRows = [
  {family:"能力・許可", word:"can", core:"内在する力・状況として可能", meanings:"能力『～できる』／許可『～してよい』／一般的可能性『～することがある』／Can you ...? 依頼", neg:"can’t: 能力否定・不許可・強い否定推量", note:"一回の現在推量『～かもしれない』に単純に can を使うとは限らない。"},
  {family:"能力・許可", word:"could", core:"can から距離をとる", meanings:"過去の一般的能力／丁寧な依頼・許可／控えめな可能性", neg:"couldn’t: 過去の不能／可能性否定", note:"具体的な一回の成功は was/were able to が基本。"},
  {family:"能力・許可", word:"be able to", core:"能力を表す表現", meanings:"『～することができる』。will be able to / have been able to など時制を広げやすい", neg:"not be able to", note:"厳密には助動詞ではなく助動詞相当表現。"},
  {family:"能力・許可", word:"may", core:"許可・可能性を開いておく", meanings:"改まった許可『～してよい』／推量『～かもしれない』", neg:"may not: 『～しないかもしれない』または『～してはいけない』", note:"否定は文脈で意味が二つに分かれる。"},
  {family:"可能性・推量", word:"might", core:"可能性を控えめに提示", meanings:"『～かもしれない』。may より控えめに響くことがある", neg:"might not: 『～しないかもしれない』", note:"may=50%、might=45% のような固定確率ではない。"},
  {family:"義務・必要", word:"must", core:"強い圧力・強い結論", meanings:"義務・必要『～しなければならない』／強い推量『～に違いない』", neg:"mustn’t: 禁止『～してはいけない』", note:"過去の義務は通常 had to。mustn’t ≠ don’t have to。"},
  {family:"義務・必要", word:"have to", core:"事情・規則などによる必要", meanings:"『～しなければならない』。時制に対応しやすい", neg:"don’t/doesn’t have to: 不必要『～しなくてよい』", note:"厳密には助動詞ではなく助動詞相当表現。must と意味が重なることも多い。"},
  {family:"義務・必要", word:"should", core:"進むのが望ましい・期待される方向", meanings:"助言・義務『～すべきだ』／推量『～のはずだ』", neg:"shouldn’t: 『～すべきでない』", note:"推量では予定・通常の流れからの期待を表しやすい。"},
  {family:"義務・必要", word:"ought to", core:"should に近い望ましさ", meanings:"助言・義務／推量『～のはずだ』", neg:"ought not to", note:"should に近いが、形は ought to + 動詞の原形。"},
  {family:"義務・必要", word:"had better", core:"悪い結果を避けるための強い助言", meanings:"『～したほうがいい』『～しないとまずい』", neg:"had better not + 動詞の原形", note:"had でも過去ではない。must と同じ義務表現として単純に置き換えない。"},
  {family:"可能性・推量", word:"will", core:"先を見通す・意志を向ける", meanings:"未来の予測『～だろう』／意志『～するよ』／習性『～するものだ』", neg:"won’t: 予測の否定／強い拒絶『どうしても～しない』", note:"推量の強さは文脈依存。単純な85%ではない。"},
  {family:"可能性・推量", word:"would", core:"will から距離をとる", meanings:"過去から見た未来／過去の習慣／控えめな判断／仮定・丁寧表現", neg:"wouldn’t: 過去の拒絶・仮定の否定など", note:"『過去形＝過去の意味』だけではない。"},
  {family:"可能性・推量", word:"can’t / cannot", core:"可能性を強く閉じる", meanings:"推量『～のはずがない』／能力否定／不許可", neg:"—", note:"推量では must の反対側に置くと分かりやすい。"},
];

const certainty = [
  ["強い結論", "must", "十分な根拠から『～に違いない』"],
  ["期待・見込み", "should / ought to", "予定・通常の流れから『～のはずだ』"],
  ["予測・見通し", "will / would", "話し手の予測。would は控えめになることがある"],
  ["可能性あり", "may / might / could", "『～かもしれない』。固定の確率差ではない"],
  ["強い否定", "can’t / cannot", "根拠から『～のはずがない』"],
];
