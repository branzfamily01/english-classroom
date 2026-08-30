#!/usr/bin/env python3
"""Verify Evergreen Lesson10 against the locked PPT/textbook/answer-book source."""
from __future__ import annotations
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA_PATH=ROOT/'materials/evergreen/lesson10/lesson-data.js'

def load_data():
    text=DATA_PATH.read_text(encoding='utf-8')
    m=re.search(r"window\.LESSON_DATA\s*=\s*(\[.*\]);\s*$",text,re.S)
    if not m: raise SystemExit('Evergreen Lesson10 lesson-data.js is not parseable')
    return json.loads(m.group(1))

EXPECTED=[
('1-(1)','Ms. Black should have arrived at the airport by now. Her flight is leaving in a few minutes.','ブラックさんは今ごろ空港に着いたはずだ。彼女が乗る飛行機は数分で出発する。','Ms. Black should have arrived at the airport by now. Her flight is leaving in a few minutes.','ブラックさんは今ごろ空港に着いたはずだ。彼女が乗る飛行機は数分で出発する。'),
('1-(2)','Alan cannot have been busy at that time. He and I had finished the experiment by then.','アランはそのとき忙しかったはずがない。彼と私はそのときまでに実験を終えていた。','Alan cannot have been busy at that time. He and I had finished the experiment by then.','アランはそのとき忙しかったはずがない。彼と私はそのときまでに実験を終えていた。'),
('1-(3)','You need not have made a reservation at the hotel for me. I had planned to stay with my aunt.','あなたは私のためにホテルを予約する必要はなかったのに。私は，おばのところに泊まる予定にしていたんだ。','You need not have made a reservation at the hotel for me. I had planned to stay with my aunt.','あなたは私のためにホテルを予約する必要はなかったのに。私は，おばのところに泊まる予定にしていたんだ。'),
('1-(4)','It’s already 10:30, but Jill and Jake are not here. They may have taken the wrong train.','もう 10 時 30 分なのに，ジルとジェイクがここにいない。彼らは間違った電車に乗ったのかもしれない。','It’s already 10:30, but Jill and Jake are not here. They may have taken the wrong train.','もう 10 時 30 分なのに，ジルとジェイクがここにいない。彼らは間違った電車に乗ったのかもしれない。'),
('1-(5)','Mary must have lent some money to her brother because he was not rich enough to buy such a nice car.','メアリーは彼女の兄［弟］にお金を貸したに違いない。彼はあんなにいい車を買えるほどお金持ちではなかったから。','Mary must have lent some money to her brother because he was not rich enough to buy such a nice car.','メアリーは彼女の兄［弟］にお金を貸したに違いない。彼はあんなにいい車を買えるほどお金持ちではなかったから。'),
('1-(6)','My sister took part in the party, so she could have met John.','姉［妹］はそのパーティーに参加したので，ジョンに会ったかもしれない。','My sister took part in the party, so she could have met John.','姉［妹］はそのパーティーに参加したので，ジョンに会ったかもしれない。'),
('2-(1)','[ your parents / you / well / might / tell / as ] the truth about the incident.','You might as well tell your parents the truth about the incident.','You might as well tell your parents the truth about the incident.','あなたはご両親にその出来事の真実を告げたほうがよい。'),
('2-(2)','[ may / the baseball team / well / the championship / win ] this year.','The baseball team may well win the championship this year.','The baseball team may well win the championship this year.','その野球チームはたぶん今年，優勝するだろう。'),
('2-(3)','[ should / students / it / important / study / that / is ] hard.','It is important that students should study hard.','It is important that students should study hard.','学生が熱心に勉強するのは重要なことだ。'),
('2-(4)','[ would / use / I / to / your eraser / like ].','I would like to use your eraser.','I would like to use your eraser.','あなたの消しゴムを使いたいのですが。'),
('2-(5)','[ rather / I / eat / than / out / would ] cook something.','I would rather eat out than cook something.','I would rather eat out than cook something.','何かを料理するよりは，外食したい。'),
('2-(6)','I [ Bob / the next meeting / attend / that / suggest ] to discuss the matter.','I suggest that Bob attend the next meeting to discuss the matter.','I suggest that Bob attend the next meeting to discuss the matter.','その件を議論するために，ボブが次の会議に出席することを私は提案する。'),
('3-(1)','シュンは途中で博物館への道をだれかに尋ねるべきだった。／ Shun (　　　) (　　　) (　　　) someone the way to the museum on his way.','should have asked','Shun should have asked someone the way to the museum on his way.','シュンは途中で博物館への道をだれかに尋ねるべきだった。'),
('3-(2)','メグが昨日，私に電話をしたはずがない。ずっといっしょにいたのだから。／ Meg (　　　) (　　　) (　　　) me yesterday because she was with me all day.','cannot[can’t] have called','Meg cannot have called me yesterday because she was with me all day.','メグが昨日，私に電話をしたはずがない。ずっといっしょにいたのだから。'),
('3-(3)','ビルに何かを説明しようとするなんて，壁に話しかけるようなものだ。／ You may (　　　) (　　　) talk to the wall (　　　) try to explain something to Bill.','as well, as','You may as well talk to the wall as try to explain something to Bill.','ビルに何かを説明しようとするなんて，壁に話しかけるようなものだ。'),
('3-(4)','ディックとハンナが 2 週間後に結婚するなんてびっくりだ。／ It is surprising that Dick and Hannah (　　　) get married in two weeks.','should','It is surprising that Dick and Hannah should get married in two weeks.','ディックとハンナが 2 週間後に結婚するなんてびっくりだ。'),
('3-(5)','私たちはトムが次のバドミントン部のキャプテンになることを求めた。／ We demanded that Tom (　　　) the next captain of the badminton club.','be[become]','We demanded that Tom be the next captain of the badminton club.','私たちはトムが次のバドミントン部のキャプテンになることを求めた。'),
('3-(6)','その学生たちは正午には東京を出発していたはずだ。／ The students (　　　) (　　　) (　　　) Tokyo at noon.','should have left','The students should have left Tokyo at noon.','その学生たちは正午には東京を出発していたはずだ。'),
('TRY-(1)','シンジは新しい自転車を買ったに違いない。','Shinji must have bought a new bike.','Shinji must have bought a new bike.','シンジは新しい自転車を買ったに違いない。'),
('TRY-(2)','ルーシーはこのレストランで夕食を食べたかもしれない。','Lucy may[might / could] have eaten[had] dinner at this restaurant.','Lucy may have eaten dinner at this restaurant.','ルーシーはこのレストランで夕食を食べたかもしれない。'),
('TRY-(3)','この本を借りたいと思うのですが。（like を用いて）','I’d[I would] like to borrow this book.','I would like to borrow this book.','この本を借りたいと思うのですが。（like を用いて）'),
('TRY-(4)','宿題はあなたが 1 人でやることが重要だ。','It is important that you (should) do your homework by yourself.','It is important that you should do your homework by yourself.','宿題はあなたが 1 人でやることが重要だ。')]

def main():
    data=load_data()
    if len(data)!=22: raise SystemExit(f'question count mismatch: {len(data)} != 22')
    actual_keys=[q.get('key') for q in data]; expected_keys=[x[0] for x in EXPECTED]
    if actual_keys!=expected_keys: raise SystemExit(f'question order/key mismatch: {actual_keys!r}')
    errors=[]
    for q,(key,question,answer,completed,translation) in zip(data,EXPECTED):
        for field,expected in [('question',question),('answer',answer),('completed',completed),('translation',translation)]:
            if q.get(field)!=expected: errors.append(f'{key} {field}: {q.get(field)!r} != {expected!r}')
    if errors:
        print('EVERGREEN LESSON10 SOURCE PARITY FAILED')
        for e in errors: print('-',e)
        raise SystemExit(1)
    print('EVERGREEN LESSON10 SOURCE PARITY OK (22/22)')
if __name__=='__main__': main()
