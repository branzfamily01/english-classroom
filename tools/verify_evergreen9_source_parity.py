#!/usr/bin/env python3
"""Verify Evergreen Lesson9 against the authoritative classroom source.

Authoritative source:
- 10_Evergreen English Grammar 47_Lesson9(1).pptx
- model answers / Japanese translations supplied by the user in chat

Supplementary modal notes are intentionally NOT treated as answer authority.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "materials/evergreen/lesson9/lesson-data.js"


def load_data() -> list[dict]:
    text = DATA_PATH.read_text(encoding="utf-8")
    m = re.search(r"window\.LESSON_DATA\s*=\s*(\[.*\]);\s*$", text, re.S)
    if not m:
        raise SystemExit("Evergreen Lesson9 lesson-data.js is not parseable")
    return json.loads(m.group(1))


EXPECTED = [
    {
        "key": "1-(1)",
        "question": "I will bake a cake and bring it to your birthday party.",
        "answer": "私はあなたの誕生日パーティーにケーキを焼いて持っていきます［いくつもりです］。",
        "completed": "I will bake a cake and bring it to your birthday party.",
        "translation": "私はあなたの誕生日パーティーにケーキを焼いて持っていきます［いくつもりです］。",
    },
    {
        "key": "1-(2)",
        "question": "Please help me. I have to enter this room, but this door won’t open.",
        "answer": "手伝ってください。私はこの部屋に入らなければならないのですが，このドアがどうしても開きません。",
        "completed": "Please help me. I have to enter this room, but this door won’t open.",
        "translation": "手伝ってください。私はこの部屋に入らなければならないのですが，このドアがどうしても開きません。",
    },
    {
        "key": "1-(3)",
        "question": "My father and I would often play catch in the nearby playground on Sundays.",
        "answer": "父と私は日曜日には近所の遊び場でよくキャッチボールをしたものだった。",
        "completed": "My father and I would often play catch in the nearby playground on Sundays.",
        "translation": "父と私は日曜日には近所の遊び場でよくキャッチボールをしたものだった。",
    },
    {
        "key": "1-(4)",
        "question": "Would you show me the way to the movie theater? I must get there by noon.",
        "answer": "映画館への道を教えていただけませんか。正午までにそこへ行かなければならないのです。",
        "completed": "Would you show me the way to the movie theater? I must get there by noon.",
        "translation": "映画館への道を教えていただけませんか。正午までにそこへ行かなければならないのです。",
    },
    {
        "key": "1-(5)",
        "question": "Shall I take a picture of you all in front of the temple?",
        "answer": "そのお寺の前であなた方全員の写真を撮りましょうか。",
        "completed": "Shall I take a picture of you all in front of the temple?",
        "translation": "そのお寺の前であなた方全員の写真を撮りましょうか。",
    },
    {
        "key": "1-(6)",
        "question": "Shall we play volleyball this afternoon if we have enough players?",
        "answer": "今日の午後人数が足りていれば，バレーボールをしましょうよ。",
        "completed": "Shall we play volleyball this afternoon if we have enough players?",
        "translation": "今日の午後人数が足りていれば，バレーボールをしましょうよ。",
    },
    {
        "key": "2-(1)",
        "question": "My brother (　　　) (　　　) have a lot of DVDs, but he doesn’t have so many now.",
        "answer": "used to",
        "completed": "My brother used to have a lot of DVDs, but he doesn’t have so many now.",
        "translation": "兄は以前はたくさんDVDを持っていたが，今はあまり持っていない。",
    },
    {
        "key": "2-(2)",
        "question": "You (　　　) come to school before eight tomorrow. Everybody has to get together at nine.",
        "answer": "needn’t",
        "completed": "You needn’t come to school before eight tomorrow. Everybody has to get together at nine.",
        "translation": "明日は8時前に学校に来る必要はありません。全員9時集合です。",
    },
    {
        "key": "2-(3)",
        "question": "(　　　) I do the work now? I have some other things to do in a hurry.",
        "answer": "Need",
        "completed": "Need I do the work now? I have some other things to do in a hurry.",
        "translation": "今その仕事をする必要がありますか。急いでしなければならないことがほかにあるのですが。",
    },
    {
        "key": "2-(4)",
        "question": "Ben (　　　) not do such a thing because he is a coward.",
        "answer": "dare",
        "completed": "Ben dare not do such a thing because he is a coward.",
        "translation": "ベンは臆病者なので，そんなことをする勇気はない。",
    },
    {
        "key": "2-(5)",
        "question": "All the pupils (　　　) (　　　) (　　　) eat lunch in the park at noon today.",
        "answer": "are supposed to",
        "completed": "All the pupils are supposed to eat lunch in the park at noon today.",
        "translation": "今日，児童たちは全員，正午に公園で昼食を食べることになっている。",
    },
    {
        "key": "3-(1)",
        "question": "“[ Will you / Shall I ] go shopping instead of you?” “Oh, thank you very much.”",
        "answer": "Shall I",
        "completed": "“Shall I go shopping instead of you?” “Oh, thank you very much.”",
        "translation": "「あなたの代わりに買い物に行きましょうか」「まあ，どうもありがとうございます」",
        "choices": ["Will you", "Shall I"],
    },
    {
        "key": "3-(2)",
        "question": "There [ used to / would ] be an amusement park here ten years ago.",
        "answer": "used to",
        "completed": "There used to be an amusement park here ten years ago.",
        "translation": "10年前，ここには遊園地があった。",
        "choices": ["used to", "would"],
    },
    {
        "key": "3-(3)",
        "question": "[ Would / Shall ] you tell me your name?",
        "answer": "Would",
        "completed": "Would you tell me your name?",
        "translation": "あなたの名前を教えていただけませんか。",
        "choices": ["Would", "Shall"],
    },
    {
        "key": "3-(4)",
        "question": "We [ needed to wait / needed wait ] for the bus for an hour yesterday.",
        "answer": "needed to wait",
        "completed": "We needed to wait for the bus for an hour yesterday.",
        "translation": "私たちは昨日バスを1時間待つ必要があった。",
        "choices": ["needed to wait", "needed wait"],
    },
    {
        "key": "3-(5)",
        "question": "Ryo [ mustn’t / wouldn’t ] drink milk when he was a child.",
        "answer": "wouldn’t",
        "completed": "Ryo wouldn’t drink milk when he was a child.",
        "translation": "リョウは子どものころ，どうしても牛乳を飲もうとしなかった。",
        "choices": ["mustn’t", "wouldn’t"],
    },
    {
        "key": "4-(1)",
        "question": "[ fix / often / my uncle / my bike / would ] when it was broken.",
        "answer": "My uncle would often fix my bike",
        "completed": "My uncle would often fix my bike when it was broken.",
        "translation": "私の自転車が壊れたとき，おじはよく修理してくれたものだった。",
    },
    {
        "key": "4-(2)",
        "question": "[ me / will / send / email / you / an ] as soon as you come home this evening?",
        "answer": "Will you send me an email",
        "completed": "Will you send me an email as soon as you come home this evening?",
        "translation": "今晩，家に帰ったらできるだけ早く私にメールを送ってくれませんか。",
    },
    {
        "key": "4-(3)",
        "question": "[ and / accidents / happen / will / anytime ] anywhere.",
        "answer": "Accidents will happen anytime and anywhere",
        "completed": "Accidents will happen anytime and anywhere.",
        "translation": "事故はいつでもどこでも起こるものだ。",
    },
    {
        "key": "4-(4)",
        "question": "[ will / in / my aunt / often / a sweater / knit ] winter when she has some free time.",
        "answer": "My aunt will often knit a sweater in",
        "completed": "My aunt will often knit a sweater in winter when she has some free time.",
        "translation": "冬にひまな時間ができると，おばはよくセーターを編む。",
    },
    {
        "key": "TRY-(1)",
        "question": "あなたの宿題を手伝いましょうか。",
        "answer": "Shall I help you with your[the] homework?",
        "completed": "Shall I help you with your homework?",
        "translation": "あなたの宿題を手伝いましょうか。",
    },
    {
        "key": "TRY-(2)",
        "question": "私は今夜，そのサッカーの試合をテレビで見るつもりだ。",
        "answer": "I will[am going to] watch the soccer game on TV tonight.",
        "completed": "I will watch the soccer game on TV tonight.",
        "translation": "私は今夜，そのサッカーの試合をテレビで見るつもりだ。",
    },
    {
        "key": "TRY-(3)",
        "question": "（今はそうではないが）祖母は以前はよく友だちとカラオケに行ったものだった。",
        "answer": "My grandmother used to go to karaoke with her friends.",
        "completed": "My grandmother used to go to karaoke with her friends.",
        "translation": "（今はそうではないが）祖母は以前はよく友だちとカラオケに行ったものだった。",
    },
]


def main() -> None:
    data = load_data()
    if len(data) != len(EXPECTED):
        raise SystemExit(f"question count mismatch: {len(data)} != {len(EXPECTED)}")

    actual_by_key = {q.get("key"): q for q in data}
    expected_keys = [x["key"] for x in EXPECTED]
    actual_keys = [q.get("key") for q in data]
    if actual_keys != expected_keys:
        raise SystemExit(f"question order/key mismatch:\nactual={actual_keys}\nexpected={expected_keys}")

    errors: list[str] = []
    for expected in EXPECTED:
        key = expected["key"]
        actual = actual_by_key[key]
        for field in ("question", "answer", "completed", "translation"):
            if actual.get(field) != expected[field]:
                errors.append(
                    f"{key} {field} mismatch\n"
                    f"  actual:   {actual.get(field)!r}\n"
                    f"  expected: {expected[field]!r}"
                )
        if "choices" in expected and actual.get("choices") != expected["choices"]:
            errors.append(
                f"{key} choices mismatch\n"
                f"  actual:   {actual.get('choices')!r}\n"
                f"  expected: {expected['choices']!r}"
            )

    # PPT underlined expressions in Exercise 1 must remain explicitly marked.
    underlined = {
        "1-(1)": "will",
        "1-(2)": "won’t",
        "1-(3)": "would often",
        "1-(4)": "Would you",
        "1-(5)": "Shall I",
        "1-(6)": "Shall we",
    }
    for key, expected_text in underlined.items():
        parts = actual_by_key[key].get("questionParts") or []
        marked = [p.get("text") for p in parts if p.get("underline")]
        if marked != [expected_text]:
            errors.append(f"{key} source underline mismatch: {marked!r} != {[expected_text]!r}")

    if errors:
        print("EVERGREEN LESSON9 SOURCE PARITY FAILED")
        for error in errors:
            print("-", error)
        raise SystemExit(1)

    print("EVERGREEN LESSON9 SOURCE PARITY OK (23/23)")


if __name__ == "__main__":
    main()
