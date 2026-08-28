/**
 * inference.js
 * 単元: ⑧ 推論②（数量推理・平均と推論）※新規追加
 * 依存: js/algorithms/common.js（getRand, getRandomInt）を先に読み込むこと
 * 提供関数: genInference1
 *
 * unit キーは 'inference'。既存の ⑧推論（buildLogicalQuestion, unitキー 'logical'）とは
 * 別単元として common.js の generateQuestionByConfig に登録済み。
 * index.html の単元選択ボタンと ui.js の UNIT_MAP / UNIT_KEYS への追加はまだ未対応（要フォローアップ）。
 *
 * 移植メモ:
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
        htmlText: `${label}. ${optionTexts[label]}`,
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
              `(iii) 4人の体重の平均は ${avg4}kg である。`,
        prompt: '次の推論ア、イの正誤を考え、正しいものを選択肢A〜Iから選びなさい。<br>' +
                '<strong>ア：PかRのどちらかが一番重い</strong><br>' +
                '<strong>イ：Sが一番軽い</strong>',
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
