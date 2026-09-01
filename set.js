/**
 * set.js
 * 単元: ① 集合
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genSet1, genSet2, genSet3
 *
 * 2026-08改訂:
 *   - 旧レベル2（100人固定・英語/数学の逆算パターン）は簡単すぎたため、レベル1の
 *     バリエーション2として統合（genSet1内でランダムに出し分け）。
 *   - 新レベル2として、3集合の包除原理（|A∪B∪C| = |A|+|B|+|C|-|A∩B|-|B∩C|-|A∩C|+|A∩B∩C|）
 *     を使う3集合ベン図問題を2パターン実装（genSet2内でランダムに出し分け）。
 */

function genSet1() {
    const useVariant2 = getRand() < 0.5;

    if (!useVariant2) {
        // バリエーション1：好きな人数から「どちらも好きでない人数」を求める（正計算）
        const likeA = getRandomInt(15, 25);
        const likeB = getRandomInt(12, 20);
        const both = getRandomInt(5, Math.min(likeA, likeB) - 2);
        const union = likeA + likeB - both;
        const neither = getRandomInt(3, 15);
        const total = union + neither;

        return {
            unit: '集合', level: 1, badge: 'Lv.1 基本', title: '2つの要素の集合（ベン図）',
            text: `${total}人の学生にアンケートを行ったところ、サッカーが好きな人は ${likeA}人、バスケットボールが好きな人は ${likeB}人、両方好きな人は ${both}人 であった。`,
            prompt: 'どちらも好きではない人は何人か。', correctAnswer: neither, unitSuffix: '人', step: 1,
            steps: [
                `ステップ1：少なくともどちらか一方が好きな人数（和集合）を計算する。<br><strong>${likeA} + ${likeB} - ${both} = ${union}人</strong>`,
                `ステップ2：全体から和集合を引いて「どちらも好きでない人数」を求める。<br><strong>${total} - ${union} = ${neither}人</strong>`
            ]
        };
    } else {
        // バリエーション2：全体人数と「どちらも該当しない人数」から「両方該当する人数」を逆算する
        const total = 100;
        const likeA = getRandomInt(50, 70);
        const likeB = getRandomInt(40, 60);
        const neither = getRandomInt(10, 20);
        const union = total - neither;
        const both = likeA + likeB - union;

        return {
            unit: '集合', level: 1, badge: 'Lv.1 基本', title: '全体集合からの逆算',
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
    // 3集合の内部構造（互いに排反な7領域）を先に決め、そこから公開する数値を逆算する
    const abc = getRandomInt(3, 8);          // A・B・C全てに該当
    const ab = getRandomInt(3, 8);           // AとBのみ（Cは含まない）
    const bc = getRandomInt(3, 8);           // BとCのみ
    const ac = getRandomInt(3, 8);           // AとCのみ
    const onlyA = getRandomInt(10, 20);
    const onlyB = getRandomInt(10, 20);
    const onlyC = getRandomInt(10, 20);
    const none = getRandomInt(5, 15);

    const likeA = onlyA + ab + ac + abc;
    const likeB = onlyB + ab + bc + abc;
    const likeC = onlyC + ac + bc + abc;
    const intAB = ab + abc; // A∩B（A・B・C全てに該当する人を含む）
    const intBC = bc + abc;
    const intAC = ac + abc;
    const total = onlyA + onlyB + onlyC + ab + bc + ac + abc + none;
    const union = total - none; // = likeA+likeB+likeC-intAB-intBC-intAC+abc

    const askNone = getRand() < 0.5;

    if (askNone) {
        // パターン1：全ての内訳が既知 → 「いずれにも該当しない人数」を求める
        return {
            unit: '集合', level: 2, badge: 'Lv.2 応用', title: '3集合のベン図（包除原理）',
            text: `${total}人の生徒に、部活動A・B・Cへの参加状況を調査した。Aに参加している人は ${likeA}人、Bに参加している人は ${likeB}人、Cに参加している人は ${likeC}人 であった。` +
                  `また、AとB両方に参加している人は ${intAB}人、BとC両方に参加している人は ${intBC}人、AとC両方に参加している人は ${intAC}人、A・B・C全てに参加している人は ${abc}人 であった。`,
            prompt: '3つのいずれにも参加していない人は何人か。',
            correctAnswer: none, unitSuffix: '人', step: 1,
            steps: [
                `ステップ1：包除原理を使って、少なくとも1つに参加している人数（和集合）を求める。<br><strong>${likeA} + ${likeB} + ${likeC} - ${intAB} - ${intBC} - ${intAC} + ${abc} = ${union}人</strong>`,
                `ステップ2：全体から和集合を引いて「いずれにも参加していない人数」を求める。<br><strong>${total} - ${union} = ${none}人</strong>`
            ]
        };
    } else {
        // パターン2：「いずれにも該当しない人数」が既知 → 「3つとも該当する人数」を逆算する
        return {
            unit: '集合', level: 2, badge: 'Lv.2 応用', title: '3集合のベン図（包除原理・逆算）',
            text: `${total}人の生徒に、部活動A・B・Cへの参加状況を調査した。Aに参加している人は ${likeA}人、Bに参加している人は ${likeB}人、Cに参加している人は ${likeC}人 であった。` +
                  `また、AとB両方に参加している人は ${intAB}人、BとC両方に参加している人は ${intBC}人、AとC両方に参加している人は ${intAC}人、いずれにも参加していない人は ${none}人 であった。`,
            prompt: 'A・B・C全てに参加している人は何人か。',
            correctAnswer: abc, unitSuffix: '人', step: 1,
            steps: [
                `ステップ1：全体から「いずれにも参加していない人数」を引いて、少なくとも1つに参加している人数（和集合）を求める。<br><strong>${total} - ${none} = ${union}人</strong>`,
                `ステップ2：包除原理の式を「A・B・C全てに参加している人数」について解く。<br><strong>${union} - ${likeA} - ${likeB} - ${likeC} + ${intAB} + ${intBC} + ${intAC} = ${abc}人</strong>`
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
