/**
 * set.js
 * 単元: ① 集合
 * 依存: common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genSet1, genSet2, genSet3
 */

function genSet1() {
    // 50%の確率で2つのバリエーションを切り替え
    const isPatternB = getRand() < 0.5;

    if (!isPatternB) {
        // パターンA: 2集合（和集合から「どちらも好きでない」を求める）
        const likeA = getRandomInt(15, 25);
        const likeB = getRandomInt(12, 20);
        const both = getRandomInt(5, Math.min(likeA, likeB) - 2);
        const union = likeA + likeB - both;
        const neither = getRandomInt(3, 15);
        const total = union + neither;

        return {
            unit: '集合', level: 1, badge: 'Lv.1 基本', title: '2集合のベン図（どちらも該当しない人数）',
            text: `${total}人の学生にアンケートを行ったところ、サッカーが好きな人は ${likeA}人、バスケットボールが好きな人は ${likeB}人、両方好きな人は ${both}人 であった。`,
            prompt: 'どちらも好きではない人は何人か。', correctAnswer: neither, unitSuffix: '人', step: 1,
            steps: [
                `ステップ1：少なくともどちらか一方が好きな人数（和集合）を計算する。<br><strong>${likeA} + ${likeB} - ${both} = ${union}人</strong>`,
                `ステップ2：全体から和集合を引いて「どちらも好きでない人数」を求める。<br><strong>${total} - ${union} = ${neither}人</strong>`
            ]
        };
    } else {
        // パターンB: 2集合（全体・どちらも該当しない人から「両方該当」を逆算）
        const total = 100;
        const likeA = getRandomInt(50, 70);
        const likeB = getRandomInt(40, 60);
        const neither = getRandomInt(10, 20);
        const union = total - neither;
        const both = likeA + likeB - union;

        return {
            unit: '集合', level: 1, badge: 'Lv.1 基本', title: '2集合のベン図（両方該当する人数の逆算）',
            text: `100人の受講生のうち、英語が得意な人は ${likeA}人、数学が得意な人は ${likeB}人、どちらも得意でない人は ${neither}人 であった。`,
            prompt: '両方とも得意な人は何人か。', correctAnswer: both, unitSuffix: '人', step: 1,
            steps: [
                `ステップ1：少なくともどちらか得意な人数を求める。<br><strong>100 - ${neither} = ${union}人</strong>`,
                `ステップ2：(Aが得意 + Bが得意) から和集合を差し引いて「両方得意」を求める。<br><strong>${likeA} + ${likeB} - ${union} = ${both}人</strong>`
            ]
        };
    }
}

function genSet2() {
    // 50%の確率で3集合の2パターンの問いを切り替え
    const isPatternB = getRand() < 0.5;

    // --- 3集合の要素数を矛盾なく生成 ---
    const allThree = getRandomInt(3, 8);               // A, B, C 全て該当
    const onlyAB = getRandomInt(4, 10);                // AとBのみ
    const onlyBC = getRandomInt(4, 10);                // BとCのみ
    const onlyCA = getRandomInt(4, 10);                // CとAのみ
    const onlyA = getRandomInt(10, 20);                // Aのみ
    const onlyB = getRandomInt(10, 20);                // Bのみ
    const onlyC = getRandomInt(10, 20);                // Cのみ
    const neither = getRandomInt(5, 15);               // どれも該当しない

    // 各集合の合計人数
    const countA = onlyA + onlyAB + onlyCA + allThree;
    const countB = onlyB + onlyAB + onlyBC + allThree;
    const countC = onlyC + onlyBC + onlyCA + allThree;

    // 2集合の共通部分
    const bothAB = onlyAB + allThree;
    const bothBC = onlyBC + allThree;
    const bothCA = onlyCA + allThree;

    // 和集合・全体人数
    const union = onlyA + onlyB + onlyC + onlyAB + onlyBC + onlyCA + allThree;
    const total = union + neither;

    if (!isPatternB) {
        // バリエーション1: 3つの集合すべてに該当する人数（全重なり）を求める
        return {
            unit: '集合', level: 2, badge: 'Lv.2 応用', title: '3集合のベン図（3つ全て該当する人数）',
            text: `${total}人の学生に、A、B、Cの3つの資格の所持状況を調査した。<br>` +
                  `・資格A所持者: ${countA}人、資格B所持者: ${countB}人、資格C所持者: ${countC}人<br>` +
                  `・AとBの両方所持: ${bothAB}人、BとCの両方所持: ${bothBC}人、CとAの両方所持: ${bothCA}人<br>` +
                  `・いずれの資格も持っていない人: ${neither}人`,
            prompt: '3つの資格をすべて持っている人は何人か。',
            correctAnswer: allThree,
            unitSuffix: '人',
            step: 1,
            steps: [
                `ステップ1：少なくとも1つの資格を持つ人数（和集合）を求める。<br><strong>${total} - ${neither} = ${union}人</strong>`,
                `ステップ2：3集合の包含と排除の原理（公式：|A∪B∪C| = |A| + |B| + |C| - |A∩B| - |B∩C| - |C∩A| + |A∩B∩C|）を適用する。<br>` +
                `<strong>${union} = ${countA} + ${countB} + ${countC} - ${bothAB} - ${bothBC} - ${bothCA} + (3つすべて)</strong>`,
                `ステップ3：計算して「3つすべて持っている人数」を求める。<br>` +
                `<strong>${countA + countB + countC} - ${bothAB + bothBC + bothCA} = ${countA + countB + countC - (bothAB + bothBC + bothCA)}人</strong><br>` +
                `<strong>${union} - ${countA + countB + countC - (bothAB + bothBC + bothCA)} = ${allThree}人</strong>`
            ]
        };
    } else {
        // バリエーション2: いずれか1つのみに該当する人数を求める
        const onlyOneTotal = onlyA + onlyB + onlyC;

        return {
            unit: '集合', level: 2, badge: 'Lv.2 応用', title: '3集合のベン図（1つのみ該当する人数）',
            text: `${total}人のグループで、スポーツA、B、Cの経験を調査した。<br>` +
                  `・スポーツA経験者: ${countA}人、スポーツB経験者: ${countB}人、スポーツC経験者: ${countC}人<br>` +
                  `・2つ以上のスポーツを経験した人: ${bothAB + bothBC + bothCA - 2 * allThree}人<br>` +
                  `・いずれのスポーツも未経験の人: ${neither}人`,
            prompt: 'スポーツを1つだけ経験した人は何人か。',
            correctAnswer: onlyOneTotal,
            unitSuffix: '人',
            step: 1,
            steps: [
                `ステップ1：少なくとも1つ経験した人数（和集合）を求める。<br><strong>${total} - ${neither} = ${union}人</strong>`,
                `ステップ2：和集合の人数から「2つ以上経験した人数」を引いて、「1つだけ経験した人数」を求める。<br>` +
                `<strong>${union} - ${bothAB + bothBC + bothCA - 2 * allThree} = ${onlyOneTotal}人</strong>`
            ]
        };
    }
}

function genSet3() {
    const total = getRandomInt(6, 10) * 10;
    const neither = getRandomInt(1, 3) * 5;
    const union = total - neither;
    const minBoth = getRandomInt(1, 3) * 5; 
    const sumLikes = union + minBoth;
    const likeA = getRandomInt(Math.ceil(sumLikes / 2), sumLikes - 10);
    const likeB = sumLikes - likeA;
    const maxBoth = Math.min(likeA, likeB);

    const isMinQuestion = getRand() < 0.5;
    const promptText = isMinQuestion ? '両方とも好きな人の「最小人数」は何人か。' : '両方とも好きな人の「最大人数」は何人か。';
    const correctAnswerVal = isMinQuestion ? minBoth : maxBoth;

    return {
        unit: '集合', level: 3, badge: 'Lv.3 高難度', title: '両方該当する人数の範囲（極値）',
        text: `${total}人の学生に映画Aと映画Bの好き嫌いを調査したところ、映画Aが好きな人は ${likeA}人、映画Bが好きな人は ${likeB}人 であった。また、どちらも好きではない人は ${neither}人 であった。`,
        prompt: promptText, correctAnswer: correctAnswerVal, unitSuffix: '人', step: 5,
        steps: [
            `ステップ1：少なくとも一方が好きな人数（和集合）を求める。<br><strong>${total}人 - ${neither}人 = ${union}人</strong>`,
            `ステップ2：AとBの合計人数を求める。<br><strong>${likeA}人 + ${likeB}人 = ${likeA + likeB}人</strong>`,
            isMinQuestion
                ? `ステップ3【最小値】：重なりが最も小さくなるのは全体に広がったとき。<br><strong>${likeA + likeB}人 - ${union}人 = ${minBoth}人</strong>`
                : `ステップ3【最大値】：重なりが最も大きくなるのは人数の少ない方が丸ごと含まれるとき。<br><strong>min(${likeA}人, ${likeB}人) = ${maxBoth}人</strong>`
        ]
    };
}