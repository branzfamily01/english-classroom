window.LESSON10_DETAILS = Object.assign(window.LESSON10_DETAILS || {}, {
  "2-(1)": {
    "correct": ["might as well は、ほかの選択肢も考えながら「そうしないよりは〜するほうがよい」と選ぶ表現。","語順は might + as well + 動詞原形。"],
    "outputCue": "あなたはご両親にその出来事の真実を告げたほうがよい。",
    "mapPath": ["助動詞","慣用表現","might as well","助言"],
    "hints": [{"en":"Find the fixed expression first.","jp":"まず固定表現を見つけよう。","lookAt":["might","as","well"]},{"en":"What follows a modal expression?","jp":"その後ろの動詞は何形？","lookAt":["tell"]}],
    "visual": {"kind":"formula","title":"might as well の語順","tokens":[{"text":"might","role":"modal"},{"text":"as well","role":"tail"},{"text":"tell","role":"verb"}],"note":"「たぶん」の may well とは別"},
    "outputChunks": ["You might as well","tell your parents","the truth","about the incident."],
    "method": "主語 You → might as well → tell → 目的語 your parents → 残り。",
    "wrong": ["may/might well（たぶん〜だろう）とは別のまとまり。","might as well をひとかたまりで捉え、その後ろに動詞原形を置く。"]
  },
  "2-(2)": {
    "correct": ["may well + 動詞原形で「たぶん〜だろう」。また文脈により「〜するのも当然だ／もっともだ」の意味にもなる。","補助資料の数値イメージを固定確率として暗記せず、文脈と根拠から判断する。"],
    "outputCue": "その野球チームはたぶん今年，優勝するだろう。",
    "mapPath": ["助動詞","慣用表現","may well","推量"],
    "hints": [{"en":"Is this a prediction or advice?","jp":"これは推量？ 助言？","lookAt":["this year","championship"]},{"en":"Keep “may well” together.","jp":"may well をひとかたまりで考えよう。","lookAt":["may","well","win"]}],
    "visual": {"kind":"compare","title":"well の位置で意味が分かれる","columns":[{"title":"may well + V","body":"たぶん〜だろう","tone":"hot"},{"title":"might as well + V","body":"〜したほうがよい"}]},
    "outputChunks": ["The baseball team","may well win","the championship","this year."],
    "method": "主語 → may well → win → 目的語 → this year。",
    "wrong": ["might as well と混同しない。may well = 推量、might as well = 助言。","may + well + 動詞原形のまとまりを先に作る。"]
  },
  "2-(3)": {
    "correct": ["It is important that S should + 動詞原形 で、必要・重要性を表す。","PPTでは should を用いず、that節内を動詞原形にする形も多いとしている。"],
    "outputCue": "学生が熱心に勉強するのは重要なことだ。",
    "mapPath": ["助動詞","that節のshould","必要・重要","It is important that ..."],
    "hints": [{"en":"Build the frame first: It is ... that ...","jp":"まず It is ... that ... の枠を作ろう。","lookAt":["it","is","important","that"]},{"en":"What form follows “should”?","jp":"should の後ろは何形？","lookAt":["students","study"]}],
    "visual": {"kind":"flow","title":"外側の判断 → that節の行動","nodes":["It is important","→","that students","→","should study hard"]},
    "outputChunks": ["It is important","that students","should study hard."],
    "method": "It is important → that → students → should study → hard。",
    "wrong": ["*students should studies としない。should の後ろは原形 study。","that節の外側に important があることを手がかりにする。"]
  },
  "2-(4)": {
    "correct": ["would like to do は、want to do よりていねいで控えめな希望を表す。","would + like + to + 動詞原形 のまとまり。"],
    "outputCue": "あなたの消しゴムを使いたいのですが。",
    "mapPath": ["助動詞","慣用表現","would like to","丁寧な希望"],
    "hints": [{"en":"Which words make the polite wish expression?","jp":"丁寧な希望の決まり文句はどれ？","lookAt":["would","like","to"]},{"en":"What comes after “to”?","jp":"to の後ろは何形？","lookAt":["use"]}],
    "visual": {"kind":"compare","title":"would の希望表現","columns":[{"title":"would like to + V","body":"〜したいと思う","tone":"hot"},{"title":"would rather + V","body":"むしろ〜したい"}]},
    "outputChunks": ["I would like","to use","your eraser."],
    "method": "I → would like → to use → your eraser。",
    "wrong": ["*would like use と to を落とさない。","would rather なら後ろは動詞原形で to を付けないので混同しない。"]
  },
  "2-(5)": {
    "correct": ["would rather do で「（どちらかと言えば）〜したい」。","would rather A than B で「BするよりAしたい」。この文では eat out / cook something を比べている。"],
    "outputCue": "何かを料理するよりは，外食したい。",
    "mapPath": ["助動詞","慣用表現","would rather","選好"],
    "hints": [{"en":"Find the comparison marker.","jp":"比較の目印はどれ？","lookAt":["than"]},{"en":"What fixed pattern uses “rather ... than ...”?","jp":"rather ... than ... を使う決まり文句を思い出そう。","lookAt":["rather","would","eat"]}],
    "visual": {"kind":"formula","title":"would rather A than B","tokens":[{"text":"would rather","role":"modal"},{"text":"eat out","role":"verb"},{"text":"than cook","role":"tail"}],"note":"rather の後ろに to は置かない"},
    "outputChunks": ["I would rather","eat out","than cook something."],
    "method": "I → would rather → eat out → than → cook something。",
    "wrong": ["*would rather to eat は不可。would rather の後ろは動詞原形。","than の前後で比較される内容を対応させる。"]
  },
  "2-(6)": {
    "correct": ["提案・要求・決定などを表す動詞に続く that節では should を用いる形がある。PPTでは should を用いず動詞原形にする形も多いとしている。","模範解答は I suggest that Bob attend ...。Bob が3人称単数でも attend が使われている。"],
    "outputCue": "その件を議論するために，ボブが次の会議に出席することを私は提案する。",
    "mapPath": ["助動詞","that節のshould","提案・要求","suggest that S (should) V"],
    "hints": [{"en":"Start with the reporting verb.","jp":"まず主節の動詞から。","lookAt":["I","suggest"]},{"en":"After “that Bob”, do you need -s?","jp":"that Bob の後ろは attends？ 原形？","lookAt":["Bob","attend"]}],
    "visual": {"kind":"compare","title":"that節の2つの形","columns":[{"title":"should を用いる形","body":"suggest that Bob should attend"},{"title":"should を省く形","body":"suggest that Bob attend","tone":"hot"}]},
    "outputChunks": ["I suggest","that Bob attend","the next meeting","to discuss the matter."],
    "method": "I suggest → that Bob → attend → the next meeting → to discuss the matter。",
    "wrong": ["*Bob attends にしない。この構文では should を省いた場合も動詞原形を用いる。","suggest / demand など、that節の外側にある提案・要求の動詞を手がかりにする。"]
  }
});
