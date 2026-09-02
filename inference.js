/**
 * inference.js
 * 単元: ⑧ 推論②（数量推理）
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genInference1（Lv.2）, genInference2（Lv.3・新規追加）
 *
 * unit キーは 'inference'。既存の ⑧推論（buildLogicalQuestion, unitキー 'logical'）とは
 * 別単元として common.js の generateQuestionByConfig に登録済み。
 *
 * 移植メモ（genInference1）:
 *   元コード（ユーザー提供）は Math.random() を直接使用し、返り値の形式も
 *   アプリの他アルゴリズム（unit/level/badge/customChoices/steps）と異なっていたため、
 *   以下の2点のみ変更している。計算式・正誤判定ロジックは一切変更していない。
 *     1. Math.random() → getRandomInt() （CBT日付同期モードでの乱数シード固定に対応するため）
 *     2. 戻り値を { unit, level, badge, title, text, prompt, customChoices, steps } 形式に変換
 *        （options/correctAnswer/explanation 形式から、他の推論問題と同じ customChoices 形式へ）
 */

function genInference1() {

    // --------------------------------------------------
    // 1. パラメータのランダム生成
    // --------------------------------------------------
    // Sの体重 (30〜45kg)
    const weightS = getRandomInt(30, 45);
    // QとSの差 (5〜15kg)
    const diffQS = getRandomInt(5, 15);
    const weightQ = weightS + diffQS;

    // PとRの平均値 (45〜60kg)
    const avgPR = getRandomInt(45, 60);
    const sumPR = avgPR * 2; // P+Rの合計

    // 4人の合計および平均
    const totalWeight = sumPR + weightQ + weightS;
    // 平均が割り切れるように調整したい場合は総和を4の倍数に補正
    // ここでは分かりやすく整数の平均になるよう調整する例：
    const avg4 = totalWeight / 4;

    // --------------------------------------------------
    // 2. 推論ア・イの真偽判定ロジック
    // --------------------------------------------------
    // 【推論ア】「PかRのどちらかが一番重いか？」の判定
    // PとRは一方が (sumPR - 1) 以上、もう一方が 1kg 以上を取り得る。
    // PとRの最大可能値は (sumPR - 1) ※体重は正の数（1以上）と仮定
    const maxPR = sumPR - 1;
    const minPR = 1;

    // QとSの最大値
    const maxQS = Math.max(weightQ, weightS);

    let resultA = ""; // "correct" (正しい), "incorrect" (誤り), "unknown" (どちらともいえない)

    // P+Rの半分（均等な場合）でもQやSより大きいなら、必ずPかRが最大になる
    if ((sumPR / 2) > maxQS) {
        resultA = "correct"; // 必ず正しい
    } else if (maxPR <= maxQS) {
        resultA = "incorrect"; // どう頑張ってもQやSを超えられないので誤り
    } else {
        // 条件（PとRの分配）によってQやSを超えることも超えないこともある
        resultA = "correct"; // ※今回の問題設定(P+Rの合計がQ,Sの2倍程度)であれば、PまたはRの片方を大きくできるため常に「必ず正しい」になります
    }

    // 【推論イ】「Sが一番軽いか？」の判定
    // Sの体重(weightS)と、P,Rが取り得る最小値(minPR)を比較
    let resultB = "";
    if (weightS < minPR && weightS < weightQ) {
        // SがP,Rの最小値よりも小さければ「必ずSが一番軽い」
        resultB = "correct";
    } else if (weightS >= weightQ || weightS >= sumPR) {
        // Sが明らかに一番軽くなり得ない場合
        resultB = "incorrect";
    } else {
        // PやRの値を小さく設定（例: 1kg）すればSが一番軽くなるが、
        // PやRを大きく設定するとPやRがSより軽くなり得る場合
        resultB = "unknown"; // どちらともいえない
    }

    // --------------------------------------------------
    // 3. 選択肢（A〜I）の割り当て
    // --------------------------------------------------
    const choiceMap = {
        "correct_correct": "A",
        "correct_unknown": "B",
        "correct_incorrect": "C",
        "unknown_correct": "D",
        "unknown_unknown": "E",
        "unknown_incorrect": "F",
        "incorrect_correct": "G",
        "incorrect_unknown": "H",
        "incorrect_incorrect": "I"
    };

    const answerKey = choiceMap[`${resultA}_${resultB}`];

    // --------------------------------------------------
    // 4. 選択肢データ（アプリ共通形式: customChoices）
    // --------------------------------------------------
    const optionTexts = {
        A: "アもイも正しい",
        B: "アは正しいが、イはどちらともいえない",
        C: "アは正しいが、イは誤り",
        D: "アはどちらともいえないが、イは正しい",
        E: "アもイもどちらともいえない",
        F: "アはどちらともいえない、イは誤り",
        G: "アは誤りだが、イは正しい",
        H: "アは誤りだが、イはどちらともいえない",
        I: "アもイも誤り"
    };
    const customChoices = Object.keys(optionTexts).map(label => ({
        label,
        value: label,
        htmlText: optionTexts[label],
        isCorrect: label === answerKey
    }));

    // --------------------------------------------------
    // 5. 問題文・解説（steps）の生成
    // --------------------------------------------------
    return {
        unit: '推論(数量推理)', level: 2, badge: 'Lv.2 応用', title: '数量推理（平均と推論）',
        text: `P, Q, R, S の4人の体重について次のことがわかっている。<br><br>` +
              `(i) Q の方が S より ${diffQS}kg 重い。<br>` +
              `(ii) P と R の体重の平均は ${avgPR}kg である。<br>` +
              `(iii) 4人の体重の平均は ${avg4}kg である。<br><br>` +
              `<strong>ア：PかRのどちらかが一番重い</strong><br>` +
              `<strong>イ：Sが一番軽い</strong>`,
        prompt: '次の推論ア、イの正誤を考え、正しいものを選択肢A〜Iから選びなさい。',
        customChoices: shuffleArray(customChoices),
        steps: [
            `ステップ1：条件式を立てる。<br>(i) Q = S + ${diffQS}<br>(ii) P + R = ${avgPR} × 2 = ${sumPR}kg<br>(iii) 4人の合計 = ${avg4} × 4 = ${totalWeight}kg`,
            `ステップ2：(i)(ii)を(iii)に代入してSを求める。<br>${sumPR} + (S + ${diffQS}) + S = ${totalWeight}<br>2S = ${totalWeight - (sumPR + diffQS)}<br><strong>S = ${weightS}kg、Q = ${weightQ}kg</strong>`,
            `ステップ3【推論アの検証】：P + R = ${sumPR}kg なので、PかRの一方を大きくすれば必ずQ(${weightQ}kg)を超えられる。<br>よって「PかRのどちらかが一番重い」は<strong>必ず正しい</strong>。`,
            `ステップ4【推論イの検証】：Sの体重は${weightS}kg。PとRの合計は${sumPR}kgなので、配分次第でSが最小になる場合とならない場合がある（例: P=${Math.floor(sumPR/2)}kg, R=${Math.ceil(sumPR/2)}kgならSが最小だが、P=10kg, R=${sumPR-10}kgならPの方が軽くなる）。<br>よって「Sが一番軽い」は<strong>どちらともいえない</strong>。`,
            `したがって、正解は <strong>${answerKey}</strong> です。`
        ]
    };
}

function genInference2() {
    // --------------------------------------------------
    // 1. 「個別の値は一意に定まらないが合計だけは確実に定まる」性質を持つ
    //    4つの整数の組を、条件を満たすまで生成する。
    // --------------------------------------------------
    // 4人がそれぞれ持つ個数(a<=b<=c<=d)から、異なる2人を選ぶ6通りの和を作ると、
    // 昇順に並べたとき (最小+最大)=(2番目小+2番目大)=(3番目小+3番目大)=4人の合計 という性質が常に成り立つ。
    // 一方、中央の2つの和がそれぞれ「最小+最大」「2番目+3番目」のどちらに対応するかは
    // 一般に2通りの解釈が可能で、個別の値は特定できない場合がある（＝この設問の核心）。
    let a, b, c, d, s1, s2, s3, s4, s5, s6, total;
    let aA, bA, cA, dA, aB, bB, cB, dB;
    let attempts = 0;
    let valid = false;

    const isValidQuad = (a2, b2, c2, d2) =>
        Number.isInteger(a2) && Number.isInteger(b2) && Number.isInteger(c2) && Number.isInteger(d2) &&
        a2 >= 1 && a2 <= b2 && b2 <= c2 && c2 <= d2;

    do {
        attempts++;
        const raw = new Set();
        while (raw.size < 4) raw.add(getRandomInt(5, 40));
        const vals = Array.from(raw).sort((x, y) => x - y);
        [a, b, c, d] = vals;

        const sums = [a + b, a + c, a + d, b + c, b + d, c + d].sort((x, y) => x - y);
        [s1, s2, s3, s4, s5, s6] = sums;
        total = s1 + s6;

        // ケースA：中央の小さい方(s3)が「最小+最大」、大きい方(s4)が「2番目+3番目」に対応すると仮定
        bA = (s1 + s5 - s3) / 2;
        aA = s1 - bA; cA = s2 - s1 + bA; dA = s5 - bA;
        // ケースB：s3とs4の対応を入れ替えた場合
        bB = (s1 + s5 - s4) / 2;
        aB = s1 - bB; cB = s2 - s1 + bB; dB = s5 - bB;

        valid = isValidQuad(aA, bA, cA, dA) && isValidQuad(aB, bB, cB, dB) &&
            !(aA === aB && bA === bB && cA === cB && dA === dB);
    } while (!valid && attempts < 500);

    if (!valid) {
        // 保険（理論上ほぼ到達しない）：画像の実例をそのまま使用
        s1 = 20; s2 = 22; s3 = 24; s4 = 26; s5 = 28; s6 = 30; total = 50;
        aA = 8; bA = 12; cA = 14; dA = 16;
        aB = 9; bB = 11; cB = 13; dB = 17;
    }

    // --------------------------------------------------
    // 2. 選択肢：個別の値に関する主張は4つとも「確実ではない」、合計のみが「確実」
    // --------------------------------------------------
    const rawChoices = [
        { text: `最も多くミカンを持っている者のミカンの個数は${dA}個である。`, isCorrect: false },
        { text: `2番目に多く持っている者のミカンの個数は${cA}個である。`, isCorrect: false },
        { text: `3番目に多く持っている者のミカンの個数は${bA}個である。`, isCorrect: false },
        { text: `ミカンを持っている数が最小の者のミカンの個数は${aA}個である。`, isCorrect: false },
        { text: `4人の持っているミカンの個数を合計すると${total}個である。`, isCorrect: true }
    ];
    const customChoices = rawChoices.map(c => ({ value: c.text, htmlText: c.text, isCorrect: c.isCorrect }));

    return {
        unit: '推論(数量推理)', level: 3, badge: 'Lv.3 高難度', title: '数量推理（組み合わせと合計）',
        text: `4人がそれぞれ、ミカンを何個か持っている。この4人から異なる2人を選ぶ6通りの組合せを作り、選んだ2人の持っているミカンの個数を合計してみたところ、少ない順に ${s1}個、${s2}個、${s3}個、${s4}個、${s5}個、${s6}個 となった。`,
        prompt: 'このとき、確実にいえることとして、最も妥当なのはどれか。',
        customChoices: shuffleArray(customChoices),
        steps: [
            `ステップ1：6通りの和をすべて足すと、4人それぞれの個数がちょうど3回ずつ現れるので、合計は「4人の合計 × 3」になる。<br><strong>${s1} + ${s2} + ${s3} + ${s4} + ${s5} + ${s6} = ${s1 + s2 + s3 + s4 + s5 + s6}</strong>`,
            `ステップ2：4人の合計を求める。<br><strong>${s1 + s2 + s3 + s4 + s5 + s6} ÷ 3 = ${total}個</strong>`,
            `ステップ3：最小の和（${s1}個）は最も少ない2人、最大の和（${s6}個）は最も多い2人の組み合わせなので、常に「最小の和＋最大の和＝4人の合計」が成り立つ（${s1} + ${s6} = ${s1 + s6}）。同様に2番目・3番目に小さい和と大きい和の組み合わせも、それぞれ4人の合計と一致する。`,
            `ステップ4：一方で、中央の2つの和（${s3}個・${s4}個）がそれぞれ「最小＋最大」の組と「2番目＋3番目」の組のどちらに対応するかは、この情報だけでは特定できない。実際、${aA}・${bA}・${cA}・${dA}個の組み合わせでも、${aB}・${bB}・${cB}・${dB}個の組み合わせでも、同じ6つの和が得られてしまう。<br>よって個々の人数は確定できず、確実にいえるのは<strong>「合計は${total}個」</strong>のみである。`
        ]
    };
}
