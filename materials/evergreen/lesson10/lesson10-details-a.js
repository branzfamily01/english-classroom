window.LESSON10_DETAILS = Object.assign(window.LESSON10_DETAILS || {}, {
  "1-(1)": {
    "correct": ["should have + p.p. は文脈で「〜したはずだ」と「〜すべきだったのに」の2通りになりうる。ここでは by now と出発直前という状況から、予定どおり到着済みだろうという推量・期待。","話し手は現在の時点から、ブラックさんの過去の到着を判断している。"],
    "outputCue": "ブラックさんは今ごろ空港に着いたはずだ。彼女が乗る飛行機は数分で出発する。",
    "mapPath": ["助動詞","modal + have p.p.","過去の推量","should have p.p."],
    "hints": [{"en":"Where is the speaker standing in time?","jp":"話し手は「今」から、いつの出来事を見ている？","lookAt":["by now","have arrived"]},{"en":"Does the context show regret, or an expected result?","jp":"後悔・非難？ それとも「もうそうなっているはず」という見込み？","lookAt":["Her flight is leaving in a few minutes."]}],
    "visual": {"kind":"timeline","title":"今から過去を判断する","items":[{"label":"PAST","sub":"arrive at the airport","tone":"hot"},{"label":"NOW","sub":"should = expected by now"}]},
    "outputChunks": ["Ms. Black","should have arrived","at the airport","by now."],
    "method": "① have + p.p. で判断対象を過去へずらす。② should の「期待される流れ」を重ねる。③ 文脈が後悔ではなく到着見込みなので「着いたはずだ」。",
    "wrong": ["should have を見ただけで必ず「〜すべきだったのに」と訳さない。後悔・非難を示す文脈があるか確認する。","by now は「今ごろまでには」で、完了しているはずという判断の手がかり。"],
    "questionParts": [{"text":"Ms. Black "},{"text":"should have arrived","underline":true},{"text":" at the airport by now. Her flight is leaving in a few minutes."}]
  },
  "1-(2)": {
    "correct": ["cannot have + p.p. は、現在の話し手が過去の事実について強く否定する推量。「〜したはずがない／〜だったはずがない」。","had finished ... by then が、忙しかった可能性を否定する根拠になっている。"],
    "outputCue": "アランはそのとき忙しかったはずがない。彼と私はそのときまでに実験を終えていた。",
    "mapPath": ["助動詞","modal + have p.p.","過去の推量","cannot have p.p."],
    "hints": [{"en":"What evidence appears in the second sentence?","jp":"2文目のどこが判断の根拠？","lookAt":["had finished the experiment","by then"]},{"en":"Is “cannot” about ability here?","jp":"ここで cannot は能力の「できない」かな？","lookAt":["have been busy"]}],
    "visual": {"kind":"compare","title":"過去の確信","columns":[{"title":"must have p.p.","body":"〜したに違いない"},{"title":"cannot have p.p.","body":"〜したはずがない","tone":"hot"}]},
    "outputChunks": ["Alan","cannot have been busy","at that time."],
    "method": "根拠を探す → その根拠から過去の可能性を強く閉じる → cannot have been。",
    "wrong": ["cannot have been を「できなかった」と能力の can で取らない。ここでは be busy の真偽を判断する推量。","*can have been を肯定の過去推量として対にして覚えない。Lesson10では cannot/can’t have p.p. を強い否定推量として扱う。"],
    "questionParts": [{"text":"Alan "},{"text":"cannot have been","underline":true},{"text":" busy at that time. He and I had finished the experiment by then."}]
  },
  "1-(3)": {
    "correct": ["need not[needn’t] have + p.p. は、実際にはしてしまった行為について「する必要はなかったのに」と振り返る。","ここでは予約は実際になされたが、話し手はおばの家に泊まる予定だったので不要だった。"],
    "outputCue": "あなたは私のためにホテルを予約する必要はなかったのに。私は，おばのところに泊まる予定にしていたんだ。",
    "mapPath": ["助動詞","modal + have p.p.","反事実・評価","needn’t have p.p."],
    "hints": [{"en":"Was the reservation actually made?","jp":"予約は実際にされたのかな？","lookAt":["have made a reservation"]},{"en":"What makes it unnecessary?","jp":"なぜ不要だったと分かる？","lookAt":["planned to stay with my aunt"]}],
    "visual": {"kind":"flow","title":"実際と評価","nodes":["reservation was made","→","later: unnecessary","→","needn’t have made"]},
    "outputChunks": ["You need not have made","a reservation","at the hotel","for me."],
    "method": "① 実際に予約したかを見る。② その行為が後から不要だったと分かる。③ needn’t have + p.p.。",
    "wrong": ["needn’t have p.p. は、実際にはしてしまったが、その必要はなかったという意味。実際に行ったことを含む点を押さえる。","needn’t have の have は、助動詞の判断対象を過去へずらす構造の一部。"],
    "questionParts": [{"text":"You "},{"text":"need not have made","underline":true},{"text":" a reservation at the hotel for me. I had planned to stay with my aunt."}]
  },
  "1-(4)": {
    "correct": ["may have + p.p. は、今ある状況から過去に起きた可能性を一つ提示する。","10:30なのにまだ来ていない、という現在の状況から「間違った電車に乗った」という過去の可能性を考えている。"],
    "outputCue": "もう 10 時 30 分なのに，ジルとジェイクがここにいない。彼らは間違った電車に乗ったのかもしれない。",
    "mapPath": ["助動詞","modal + have p.p.","過去の推量","may have p.p."],
    "hints": [{"en":"What do we know now?","jp":"今わかっている事実は？","lookAt":["10:30","not here"]},{"en":"Is the past cause certain or only possible?","jp":"過去の原因は断定？ それとも可能性の一つ？","lookAt":["may"]}],
    "visual": {"kind":"timeline","title":"今の状況から過去を推測","items":[{"label":"PAST","sub":"took the wrong train?"},{"label":"NOW","sub":"not here at 10:30","tone":"hot"}]},
    "outputChunks": ["They may have taken","the wrong train."],
    "method": "今の手がかり → 過去の候補 → may have + p.p.。",
    "wrong": ["「かもしれなかった」と機械的に過去形で訳さない。話し手の推量は今行われ、対象の出来事が過去。","may have taken は、modal + have p.p. の過去推量として読む。"],
    "questionParts": [{"text":"It’s already 10:30, but Jill and Jake are not here. They "},{"text":"may have taken","underline":true},{"text":" the wrong train."}]
  },
  "1-(5)": {
    "correct": ["must have + p.p. は、根拠から過去の出来事を強く結論づける。","because 以下が明示的な根拠。兄弟だけでは高価な車を買えるほど裕福ではなかった → Maryが貸したに違いない、と推論する。"],
    "outputCue": "メアリーは彼女の兄［弟］にお金を貸したに違いない。彼はあんなにいい車を買えるほどお金持ちではなかったから。",
    "mapPath": ["助動詞","modal + have p.p.","過去の推量","must have p.p."],
    "hints": [{"en":"Which part gives the evidence?","jp":"根拠になっている部分はどこ？","lookAt":["because","not rich enough"]},{"en":"How strong is the speaker’s conclusion?","jp":"話し手は可能性を残している？ それとも強く結論している？","lookAt":["must"]}],
    "visual": {"kind":"flow","title":"根拠から強い結論","nodes":["not rich enough","→","nice car","→","Mary must have lent money"]},
    "outputChunks": ["Mary must have lent","some money","to her brother."],
    "method": "because の根拠 → 強い結論 → must have + p.p.。",
    "wrong": ["must have lent を過去の義務「貸さなければならなかった」と取らない。ここでは過去の出来事への確信。","because 以下の根拠と must の強い結論を結びつける。"],
    "questionParts": [{"text":"Mary "},{"text":"must have lent","underline":true},{"text":" some money to her brother because he was not rich enough to buy such a nice car."}]
  },
  "1-(6)": {
    "correct": ["この文の could have + p.p. は、パーティーに参加したという条件から「ジョンに会った可能性がある」と述べる過去推量。","could have + p.p. には「実際にはしなかったが、しようと思えばできた」という反事実的可能性の用法もあるため、文脈で見分ける。"],
    "outputCue": "姉［妹］はそのパーティーに参加したので，ジョンに会ったかもしれない。",
    "mapPath": ["助動詞","modal + have p.p.","2つの読み","could have p.p."],
    "hints": [{"en":"What fact makes the meeting possible?","jp":"会った可能性が生まれる根拠は？","lookAt":["took part in the party"]},{"en":"Does the sentence say she actually failed to meet John?","jp":"「実際には会わなかった」と書いてある？","lookAt":["so","could have met"]}],
    "visual": {"kind":"compare","title":"could have p.p. は文脈で分岐","columns":[{"title":"PAST POSSIBILITY","body":"会ったかもしれない","tone":"hot"},{"title":"UNREALIZED POSSIBILITY","body":"会えたのに（実際は会わなかった）"}]},
    "outputChunks": ["She could have met","John."],
    "method": "文脈確認 → 実際に会わなかったと明示されていない → ここでは過去の可能性。",
    "wrong": ["could have p.p. を常に「〜できたのに（実際はしなかった）」と固定しない。この文では会った可能性を述べている。","may/might/could have p.p. の細かな確信度を固定パーセントで暗記しない。"],
    "questionParts": [{"text":"My sister took part in the party, so she "},{"text":"could have met","underline":true},{"text":" John."}]
  }
});
