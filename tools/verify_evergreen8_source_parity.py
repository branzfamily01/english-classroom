#!/usr/bin/env python3
"""Verify Evergreen Lesson8 against the locked PPT/textbook/answer-book source."""
from __future__ import annotations
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA_PATH=ROOT/'materials/evergreen/lesson8/lesson-data.js'

def load_data():
    text=DATA_PATH.read_text(encoding='utf-8')
    m=re.search(r"window\.LESSON_DATA\s*=\s*(\[.*\]);\s*$",text,re.S)
    if not m: raise SystemExit('Evergreen Lesson8 lesson-data.js is not parseable')
    return json.loads(m.group(1))

EXPECTED=[
('1-(1)','You will (　　　) (　　　) (　　　) pass the exam if you study hard.','be able to','You will be able to pass the exam if you study hard.','一生懸命勉強すれば，あなたは試験に合格できるだろう。'),
('1-(2)','(　　　) Emi (　　　) (　　　) dance to that music?','Was, able to','Was Emi able to dance to that music?','エミはその音楽に合わせて踊ることができたのですか。'),
('1-(3)','We (　　　) (　　　) wait for our parents in the rain for three hours.','had to','We had to wait for our parents in the rain for three hours.','私たちは3時間，雨の中で両親を待たなければならなかった。'),
('1-(4)','The students (　　　) stay here now because a powerful typhoon is coming.','should[must]','The students should stay here now because a powerful typhoon is coming.','強い台風が近づいているから，生徒たちは今はここにいるべきだ。'),
('1-(5)','In any case, you (　　　) speak ill of others behind their back.','mustn’t','In any case, you mustn’t speak ill of others behind their back.','どんな場合でも，他人の陰口を言ってはいけない。'),
('2-(1)','“[ Can I / Can you ] take me to the zoo sometime?” “OK. Let’s go tomorrow.”','Can you','“Can you take me to the zoo sometime?” “OK. Let’s go tomorrow.”','「いつか私を動物園に連れていってくれない？」「いいよ。明日，行こう」'),
('2-(2)','Jim will help me with my work tomorrow, so you [ must not / don’t have to ] come.','don’t have to','Jim will help me with my work tomorrow, so you don’t have to come.','ジムが明日，私の仕事を手伝ってくれるでしょうから，あなたは来なくてもいいです。'),
('2-(3)','“[ May I / Can you ] use this dictionary?” “Sure. Go ahead.”','May I','“May I use this dictionary?” “Sure. Go ahead.”','「この辞書を使ってもよろしいですか」「もちろん。どうぞ」'),
('2-(4)','Keep off the grass. I mean, you [ can’t / don’t have to ] walk on the grass.','can’t','Keep off the grass. I mean, you can’t walk on the grass.','芝生に立ち入り禁止。つまり，芝生の上を歩いてはいけません。'),
('3-(1)','Even a clever person can make mistakes if he/she isn’t careful enough.','十分注意しなければ，賢い人でさえ間違いを起こしうる。','Even a clever person can make mistakes if he/she isn’t careful enough.','十分注意しなければ，賢い人でさえ間違いを起こしうる。'),
('3-(2)','The rumor can’t be true because there is no proof at all.','証拠がまったく何もないので，そのうわさは本当であるはずがない。','The rumor can’t be true because there is no proof at all.','証拠がまったく何もないので，そのうわさは本当であるはずがない。'),
('3-(3)','The bus must be late because of this heavy snow.','この大雪のせいでバスは遅れるに違いない。','The bus must be late because of this heavy snow.','この大雪のせいでバスは遅れるに違いない。'),
('3-(4)','I’m not sure, but my grandmother would be in bed by now.','確信はないが，祖母はたぶん今ごろは床についているだろう。','I’m not sure, but my grandmother would be in bed by now.','確信はないが，祖母はたぶん今ごろは床についているだろう。'),
('3-(5)','My mother may know about the new shopping mall in the suburb.','母は郊外にあるその新しいショッピングモールについて知っているかもしれない。','My mother may know about the new shopping mall in the suburb.','母は郊外にあるその新しいショッピングモールについて知っているかもしれない。'),
('4-(1)','[ tell / I / about / can / your plan / him ]?','Can I tell him about your plan','Can I tell him about your plan?','彼にあなたの計画について話してもいいですか。'),
('4-(2)','[ rest / to / you / a / ought / take ] anytime when you feel tired.','You ought to take a rest','You ought to take a rest anytime when you feel tired.','疲れたときはいつでも休憩を取るべきだ。'),
('4-(3)','[ a / tennis player / be / the man / professional / must ].','The man must be a professional tennis player','The man must be a professional tennis player.','その男性はプロのテニス選手に違いない。'),
('4-(4)','[ Jack’s / be / can / cousin / that girl ]? I don’t think she is.','Can that girl be Jack’s cousin','Can that girl be Jack’s cousin? I don’t think she is.','あの女の子がジャックのいとこなの？ 違うと思うな。'),
('4-(5)','Fred [ be / a few days / in / back / should ]. He said so.','Fred should be back in a few days','Fred should be back in a few days. He said so.','フレッドは2，3日で戻ってくるはずだ。そう言ってたよ。'),
('4-(6)','[ will / sister / hungry / be / after / my ] basketball practice.','My sister will be hungry after','My sister will be hungry after basketball practice.','姉［妹］はバスケットボールの練習の後でたぶんお腹がすいているだろう。'),
('4-(7)','[ better / you / ask / not / Rachel / had ] for advice.','You had better not ask Rachel','You had better not ask Rachel for advice.','あなたはレイチェルに助言を求めないほうがよい。'),
('TRY-(1)','メアリーは中国語を書くことができる。','Mary can[is able to] write Chinese.','Mary can write Chinese.','メアリーは中国語を書くことができる。'),
('TRY-(2)','トムは夜遅くに外出するかもしれない。','Tom may[might/could] go out late at night.','Tom may go out late at night.','トムは夜遅くに外出するかもしれない。'),
('TRY-(3)','あなたは夕食後，皿を洗わなければならない。','You must[have to] wash[do] the dishes after dinner.','You must wash the dishes after dinner.','あなたは夕食後，皿を洗わなければならない。')]

def main():
    data=load_data()
    if len(data)!=24: raise SystemExit(f'question count mismatch: {len(data)} != 24')
    actual_keys=[q.get('key') for q in data]; expected_keys=[x[0] for x in EXPECTED]
    if actual_keys!=expected_keys: raise SystemExit(f'question order/key mismatch: {actual_keys!r}')
    errors=[]
    for q,(key,question,answer,completed,translation) in zip(data,EXPECTED):
        for field,expected in [('question',question),('answer',answer),('completed',completed),('translation',translation)]:
            if q.get(field)!=expected: errors.append(f'{key} {field}: {q.get(field)!r} != {expected!r}')
    underlined={'3-(1)':'can','3-(2)':'can’t','3-(3)':'must','3-(4)':'would','3-(5)':'may'}
    for key,expected in underlined.items():
        q=next(x for x in data if x['key']==key); marked=[p.get('text') for p in q.get('questionParts',[]) if p.get('underline')]
        if marked!=[expected]: errors.append(f'{key} source underline: {marked!r} != {[expected]!r}')
    if errors:
        print('EVERGREEN LESSON8 SOURCE PARITY FAILED')
        for e in errors: print('-',e)
        raise SystemExit(1)
    print('EVERGREEN LESSON8 SOURCE PARITY OK (24/24)')
if __name__=='__main__': main()
