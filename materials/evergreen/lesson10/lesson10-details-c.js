window.LESSON10_DETAILS = Object.assign(window.LESSON10_DETAILS || {}, {
  "3-(1)": {
    "correct": ["「〜すべきだった」は、実際にはしなかったことへの後悔・非難を表す should have + p.p.。","should have は同じLesson内で「〜したはずだ」という過去推量にもなる。日本語と文脈で分ける。"],
    "outputCue": "シュンは途中で博物館への道をだれかに尋ねるべきだった。",
    "mapPath": ["助動詞","modal + have p.p.","反事実・評価","should have p.p."],
    "hints": [{"en":"Did Shun actually ask?","jp":"実際には尋ねた？ それとも尋ねるべきだったのに？","lookAt":["べきだった"]},{"en":"Use the pattern that evaluates a past action.","jp":"過去の行為を今から評価する形を作ろう。","lookAt":["Shun","asked"]}],
    "visual": {"kind":"compare","title":"should have p.p. の2つの読み","columns":[{"title":"EXPECTED PAST","body":"〜したはずだ"},{"title":"REGRET / CRITICISM","body":"〜すべきだったのに","tone":"hot"}]},
    "outputChunks": ["Shun should have asked","someone","the way to the museum","on his way."],
    "method": "日本語の「〜べきだった」→ 過去の行為への評価 → should have asked。",
    "wrong": ["*should asked は have がない。過去への評価は should + have + p.p.。","この問題では「尋ねるべきだったのに」という後悔・非難の読み。"]
  },
  "3-(2)": {
    "correct": ["cannot[can’t] have + p.p. で「〜したはずがない」。because 以下が強い反証。","昨日ずっと一緒にいたという事実から、電話した可能性を否定する。"],
    "outputCue": "メグが昨日，私に電話をしたはずがない。ずっといっしょにいたのだから。",
    "mapPath": ["助動詞","modal + have p.p.","過去の推量","cannot have p.p."],
    "hints": [{"en":"What proves the call was impossible?","jp":"電話したはずがない根拠は？","lookAt":["with me all day"]},{"en":"Which modal closes the possibility strongly?","jp":"可能性を強く否定する助動詞は？","lookAt":["はずがない"]}],
    "visual": {"kind":"flow","title":"反証から否定","nodes":["with me all day","→","calling me is impossible","→","cannot have called"]},
    "outputChunks": ["Meg cannot have called","me yesterday","because she was with me","all day."],
    "method": "反証 because she was with me all day → 過去の可能性を閉じる → cannot have called。",
    "wrong": ["「〜したはずがない」は cannot/can’t have + p.p. と結びつける。","cannot called と have を落とさない。"]
  },
  "3-(3)": {
    "correct": ["may/might as well A as B で「BするのはAするようなものだ」。","この文では Bill に説明することと壁に話すことを同じようなものとして述べている。"],
    "outputCue": "ビルに何かを説明しようとするなんて，壁に話しかけるようなものだ。",
    "mapPath": ["助動詞","慣用表現","may/might as well A as B","同等比較"],
    "hints": [{"en":"How many “as” slots does this pattern need?","jp":"このパターンでは as が何か所必要？","lookAt":["may","talk to the wall","try"]},{"en":"Is this simple advice, or an A-as-B comparison?","jp":"単なる助言？ それともAとBを同じくらいとみなす比較？","lookAt":["wall","Bill"]}],
    "visual": {"kind":"formula","title":"AするのもBするのも同じ","tokens":[{"text":"may as well","role":"modal"},{"text":"talk to the wall","role":"verb"},{"text":"as try ...","role":"tail"}]},
    "outputChunks": ["You may as well","talk to the wall","as try to explain","something to Bill."],
    "method": "may → as well → A → as → B の枠を先に作る。",
    "wrong": ["may well（たぶん）と混同しない。as が2つ出る構造が目印。","may as well + V だけなら「〜したほうがよい」。後ろの as B があると A as B の形になる。"]
  },
  "3-(4)": {
    "correct": ["natural, strange, surprising, wrong, a pity などの後ろの that節で should を用い、話し手の驚き・当然・善悪などの感情や判断を表す。","ここでは surprising が明確な手がかり。should は「〜すべき」ではなく「〜するなんて」という驚き。"],
    "outputCue": "ディックとハンナが 2 週間後に結婚するなんてびっくりだ。",
    "mapPath": ["助動詞","that節のshould","感情・判断","surprising that S should V"],
    "hints": [{"en":"Which adjective tells you the speaker’s reaction?","jp":"話し手の反応を表す形容詞は？","lookAt":["surprising"]},{"en":"Does “should” mean duty here?","jp":"この should は義務の「すべき」かな？","lookAt":["that Dick and Hannah","get married"]}],
    "visual": {"kind":"flow","title":"感情がthat節に重なる","nodes":["surprising","→","that S should V","→","「SがVするなんて」"]},
    "outputChunks": ["It is surprising","that Dick and Hannah","should get married","in two weeks."],
    "method": "It is surprising → that節 → 感情・判断の should + 原形。",
    "wrong": ["should = いつも「〜すべき」と訳さない。that節の前の形容詞が感情・評価かを見る。","in two weeks は未来だが、この should は義務を表していない。"]
  },
  "3-(5)": {
    "correct": ["demand など提案・要求・決定を表す動詞の that節では、should + 原形を用いる形がある。should を省いて原形を用いることも多い。","模範解答は be[become]。Tom が3人称単数でも is/becomes にしない。"],
    "outputCue": "私たちはトムが次のバドミントン部のキャプテンになることを求めた。",
    "mapPath": ["助動詞","that節のshould","提案・要求","demand that S (should) V"],
    "hints": [{"en":"What kind of verb is “demanded”?","jp":"demanded は事実報告？ それとも要求？","lookAt":["demanded"]},{"en":"What form is used when “should” is omitted?","jp":"should を省いたとき、that節の動詞は何形？","lookAt":["Tom","the next captain"]}],
    "visual": {"kind":"decision","title":"提案・要求のthat節","rows":[{"condition":"should を使う","result":"Tom should be"},{"condition":"should を省く","result":"Tom be"}]},
    "outputChunks": ["We demanded","that Tom be","the next captain","of the badminton club."],
    "method": "demanded that → Tom → 原形 be / become。",
    "wrong": ["*demanded that Tom was/is ... にしない。この問題では要求内容を表す that節。","should を省く形では動詞原形 be / become を用いる。"]
  },
  "3-(6)": {
    "correct": ["ここでは「出発すべきだった」ではなく、「正午には出発していたはずだ」という過去についての期待・推量。","should の「〜のはずだ」を have + p.p. で過去へ向ける。"],
    "outputCue": "その学生たちは正午には東京を出発していたはずだ。",
    "mapPath": ["助動詞","modal + have p.p.","過去の推量","should have p.p."],
    "hints": [{"en":"What does the Japanese say: “はずだ” or “べきだった”?","jp":"日本語は「はずだ」？「べきだった」？","lookAt":["はずだ"]},{"en":"Use “should” to express an expected past result.","jp":"過去の「〜したはずだ」を作ろう。","lookAt":["Tokyo","at noon"]}],
    "visual": {"kind":"compare","title":"同じ形、文脈で意味が分かれる","columns":[{"title":"should have left","body":"出発していたはずだ","tone":"hot"},{"title":"should have asked","body":"尋ねるべきだったのに"}]},
    "outputChunks": ["The students","should have left","Tokyo","at noon."],
    "method": "日本語「〜したはずだ」→ 過去の期待 → should have left。",
    "wrong": ["should have left を見て自動的に後悔・非難にしない。日本語「〜していたはずだ」が決め手。","同じ should have + p.p. でも文脈で意味が分かれる。"]
  },
  "TRY-(1)": {
    "correct": ["「買ったに違いない」なので must have + p.p.。","buy の過去分詞は bought。"],
    "outputCue": "シンジは新しい自転車を買ったに違いない。",
    "mapPath": ["助動詞","modal + have p.p.","過去の推量","must have p.p."],
    "hints": [{"en":"Is the speaker talking about now or a past purchase?","jp":"話し手が判断している対象は現在？ 過去の購入？","lookAt":["買った"]},{"en":"Which modal expresses a strong conclusion?","jp":"強い確信「〜に違いない」はどれ？","lookAt":["に違いない"]}],
    "visual": {"kind":"formula","title":"過去の強い確信","tokens":[{"text":"must","role":"modal"},{"text":"have","role":"tail"},{"text":"bought","role":"verb"}]},
    "outputChunks": ["Shinji","must have bought","a new bike."],
    "method": "「に違いない」＋過去 → must have + p.p.",
    "wrong": ["*must bought は不可。","must have buy ではなく have + p.p.。"]
  },
  "TRY-(2)": {
    "correct": ["模範解答は may[might / could] have eaten[had] ...。過去の出来事について「かもしれない」。","may/might/could の細かな固定確率を暗記するのではなく、ここでは過去の可能性を表す形として押さえる。"],
    "outputCue": "ルーシーはこのレストランで夕食を食べたかもしれない。",
    "mapPath": ["助動詞","modal + have p.p.","過去の推量","may / might / could"],
    "hints": [{"en":"Which Japanese phrase shows uncertainty?","jp":"不確かな可能性を示す日本語は？","lookAt":["かもしれない"]},{"en":"How do you move that possibility into the past?","jp":"その推量の対象を過去にするには？","lookAt":["食べた"]}],
    "visual": {"kind":"compare","title":"過去の可能性","columns":[{"title":"may / might / could","body":"+ have + p.p.","tone":"hot"},{"title":"can","body":"肯定の過去推量の基本形にはしない"}]},
    "outputChunks": ["Lucy may have eaten","dinner","at this restaurant."],
    "method": "過去の可能性 → may/might/could + have + p.p.",
    "wrong": ["*may ate は不可。modal + have + p.p.。","肯定の過去推量では、PPTの模範表現 may / might / could have + p.p. を使う。"]
  },
  "TRY-(3)": {
    "correct": ["would like to + V で、want to よりていねいで控えめに希望を伝える。","I’d = I would。"],
    "outputCue": "この本を借りたいと思うのですが。（like を用いて）",
    "mapPath": ["助動詞","慣用表現","would like to","丁寧な希望"],
    "hints": [{"en":"The instruction says to use “like”.","jp":"like を用いるという指定があるね。","lookAt":["like"]},{"en":"Which polite pattern includes “would”?","jp":"would を使う丁寧な希望表現は？","lookAt":["借りたい"]}],
    "visual": {"kind":"formula","title":"丁寧な希望","tokens":[{"text":"I would like","role":"modal"},{"text":"to borrow","role":"verb"},{"text":"this book","role":"tail"}]},
    "outputChunks": ["I would like","to borrow","this book."],
    "method": "like 指定 → would like to + borrow。",
    "wrong": ["*would like borrow と to を落とさない。","would rather は後ろに to を置かないので区別する。"]
  },
  "TRY-(4)": {
    "correct": ["It is important that S should + V、または should を省いて動詞原形を用いる。","模範解答では should は任意。"],
    "outputCue": "宿題はあなたが 1 人でやることが重要だ。",
    "mapPath": ["助動詞","that節のshould","必要・重要","It is important that ..."],
    "hints": [{"en":"Build the outer frame first.","jp":"まず外側の It is important that ... を作ろう。","lookAt":["重要だ"]},{"en":"What form can appear after “that you”?","jp":"that you の後ろはどんな形？","lookAt":["宿題","1人で"]}],
    "visual": {"kind":"compare","title":"should は任意","columns":[{"title":"with should","body":"that you should do"},{"title":"without should","body":"that you do","tone":"hot"}]},
    "outputChunks": ["It is important","that you should do","your homework","by yourself."],
    "method": "It is important → that you → (should) do → by yourself。",
    "wrong": ["should を用いる場合、その後ろは動詞原形 do。","should を省く形でも、PPTの説明どおり動詞原形を用いる。"]
  }
});
