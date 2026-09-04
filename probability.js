/**
 * probability.js
 * 単元: ⑦ 場合の数・確率
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genProbability1a〜1c, 2a〜2c（Lv.1）, 3a〜3c, 4a〜4c（Lv.2）, 5, 6（Lv.3）
 *
 * 2026-08改訂: レベル1・2について、場合の数/確率それぞれ3パターンずつ（計6パターン/レベル）に拡張。
 *   従来の genProbability1〜4 はほぼ数値固定（乱数がごく一部にしか使われていない）だったため、
 *   繰り返し演習すると同じ問題が頻出していた。全パターンを乱数化し、新規3パターンを追加した。
 *   レベル3（genProbability5, 6）は今回のスコープ外のため無変更。
 */

// --- 場合の数・確率 共通ヘルパー ---
function factorialProb(n) { return n <= 1 ? 1 : n * factorialProb(n - 1); }
function nPrProb(n, r) { let result = 1; for (let i = 0; i < r; i++) result *= (n - i); return result; }
function nCrProb(n, r) { return nPrProb(n, r) / factorialProb(r); }
function gcdProbability(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
function reduceFractionProb(num, den) { const g = gcdProbability(num, den); return [num / g, den / g]; }

// 分数の答えの選択肢を作る（正解1つ＋ダミー3つ＋いずれでもない、常に約分済み・重複なし）
function buildFractionChoicesProb(correctNum, correctDen, rawCandidates) {
    const seen = new Map();
    const addCandidate = (num, den) => {
        if (den === 0 || num < 0) return;
        const [n, d] = reduceFractionProb(num, den);
        const key = (n / d).toFixed(6);
        if (!seen.has(key)) seen.set(key, [n, d]);
    };
    const [cn, cd] = reduceFractionProb(correctNum, correctDen);
    const correctKey = (cn / cd).toFixed(6);
    seen.set(correctKey, [cn, cd]);

    for (const [n, d] of rawCandidates) {
        if (seen.size >= 4) break;
        addCandidate(n, d);
    }
    let guard = 0;
    while (seen.size < 4 && guard < 60) {
        guard++;
        addCandidate(cn + getRandomInt(1, 3), cd);
        if (seen.size >= 4) break;
        addCandidate(cn, cd + getRandomInt(1, 3));
    }

    const entries = Array.from(seen.entries()).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])).slice(0, 4);
    if (!entries.some(([key]) => key === correctKey)) {
        entries[entries.length - 1] = [correctKey, [cn, cd]];
        entries.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }
    const choices = entries.map(([key, [n, d]]) => ({
        value: key, htmlText: `${n}/${d}`, isCorrect: key === correctKey
    }));
    choices.push({ value: 'none', htmlText: 'いずれでもない', isCorrect: false });
    return choices;
}

// ============================================================
// レベル1・場合の数
// ============================================================

function genProbability1a() {
    // 特定の要素が隣り合う並び方
    const menCount = getRandomInt(3, 5);
    const womenCount = getRandomInt(2, 3);
    const totalPeople = menCount + womenCount;
    const groupCount = menCount + 1;
    const ways = factorialProb(groupCount) * factorialProb(womenCount);

    return {
        unit: '場合の数・確率', level: 1, badge: 'Lv.1 基本', title: '場合の数・特定要素の隣り合い',
        text: `男子 ${menCount}人 と女子 ${womenCount}人 の合計 ${totalPeople}人 が一列に並ぶ。`,
        prompt: `女子${womenCount}人が必ず隣り合う並び方は何通りか。`,
        correctAnswer: ways,
        unitSuffix: '通り',
        step: 12,
        steps: [
            `ステップ1：隣り合う女子${womenCount}人を「1つのグループ」としてまとめる。<br>並べる対象は男子 ${menCount}人 ＋ 女子グループ1個 ＝ <strong>${groupCount}要素</strong>。`,
            `ステップ2：${groupCount}要素の並び方を計算する。<br><strong>${groupCount}! ＝ ${factorialProb(groupCount)}通り</strong>`,
            `ステップ3：女子グループ内での${womenCount}人の並び替えを考慮する。<br><strong>${womenCount}! ＝ ${factorialProb(womenCount)}通り</strong>`,
            `ステップ4：積の法則により全体を算出する。<br><strong>${factorialProb(groupCount)} × ${factorialProb(womenCount)} ＝ ${ways}通り</strong>`
        ]
    };
}

function genProbability1b() {
    // 特定の2人が両端にくる並び方
    const totalPeople = getRandomInt(5, 7);
    const endsWays = 2;
    const middleWays = factorialProb(totalPeople - 2);
    const ways = endsWays * middleWays;

    return {
        unit: '場合の数・確率', level: 1, badge: 'Lv.1 基本', title: '場合の数・両端が固定された順列',
        text: `${totalPeople}人が一列に並ぶ。`,
        prompt: '特定の2人が両端にくる並び方は何通りか。',
        correctAnswer: ways,
        unitSuffix: '通り',
        step: factorialProb(totalPeople - 2),
        steps: [
            `ステップ1：両端に入る特定の2人の並び方を考える。<br><strong>2! ＝ ${endsWays}通り</strong>`,
            `ステップ2：残り${totalPeople - 2}人を中央に並べる並び方を考える。<br><strong>${totalPeople - 2}! ＝ ${middleWays}通り</strong>`,
            `ステップ3：積の法則により全体を算出する。<br><strong>${endsWays} × ${middleWays} ＝ ${ways}通り</strong>`
        ]
    };
}

function genProbability1c() {
    // 特定の2人が隣り合わない並び方（余事象）
    const totalPeople = getRandomInt(5, 7);
    const totalWays = factorialProb(totalPeople);
    const adjacentWays = factorialProb(totalPeople - 1) * 2;
    const ways = totalWays - adjacentWays;

    return {
        unit: '場合の数・確率', level: 1, badge: 'Lv.1 基本', title: '場合の数・隣り合わない並び方（余事象）',
        text: `${totalPeople}人が一列に並ぶ。`,
        prompt: '特定の2人が隣り合わない並び方は何通りか。',
        correctAnswer: ways,
        unitSuffix: '通り',
        step: factorialProb(totalPeople - 1),
        steps: [
            `ステップ1：全員の並び方（全体）を求める。<br><strong>${totalPeople}! ＝ ${totalWays}通り</strong>`,
            `ステップ2：特定の2人が隣り合う並び方を求める（2人を1組とみなす）。<br><strong>(${totalPeople}-1)! × 2! ＝ ${factorialProb(totalPeople - 1)} × 2 ＝ ${adjacentWays}通り</strong>`,
            `ステップ3：全体から「隣り合う場合」を引いて、隣り合わない場合を求める（余事象）。<br><strong>${totalWays} - ${adjacentWays} ＝ ${ways}通り</strong>`
        ]
    };
}

// ============================================================
// レベル1・確率
// ============================================================

function genProbability2a() {
    // カードで作る整数の偶数/奇数の確率
    const cardMax = [5, 6][getRandomInt(0, 1)];
    const digits = Array.from({ length: cardMax }, (_, i) => i + 1);
    const isEvenCondition = getRand() < 0.5;
    const targetDigits = digits.filter(d => (d % 2 === 0) === isEvenCondition);
    const conditionLabel = isEvenCondition ? '偶数' : '奇数';

    const totalWays = nPrProb(cardMax, 3);
    const favorableWays = targetDigits.length * nPrProb(cardMax - 1, 2);
    const [num, den] = reduceFractionProb(favorableWays, totalWays);

    const customChoices = buildFractionChoicesProb(num, den, [
        [targetDigits.length, cardMax + 1],
        [digits.length - targetDigits.length, cardMax],
        [1, 2],
        [targetDigits.length + 1, cardMax]
    ]);

    return {
        unit: '場合の数・確率', level: 1, badge: 'Lv.1 基本', title: '確率・条件を満たす整数の構成',
        text: `1〜${cardMax} の数字が1つずつ書かれた${cardMax}枚のカードから、同時に3枚を取り出して並べ、3桁の整数を作る。`,
        prompt: `できた整数が「${conditionLabel}」である確率はいくらか。`,
        customChoices,
        steps: [
            `ステップ1：作り得るすべての3桁の整数の個数を求める。<br><strong>${cardMax} × ${cardMax - 1} × ${cardMax - 2} ＝ ${totalWays}通り</strong>`,
            `ステップ2：${conditionLabel}になる条件（一の位が ${targetDigits.join('または')}）を満たす通り数を求める。<br>一の位の選び方：<strong>${targetDigits.length}通り</strong><br>百の位と十の位の選び方（残り${cardMax - 1}枚から2枚）：<strong>${cardMax - 1} × ${cardMax - 2} ＝ ${nPrProb(cardMax - 1, 2)}通り</strong><br>${conditionLabel}の総数：<strong>${targetDigits.length} × ${nPrProb(cardMax - 1, 2)} ＝ ${favorableWays}通り</strong>`,
            `ステップ3：確率を算出する。<br><strong>${favorableWays} / ${totalWays} ＝ ${num}/${den}</strong>`
        ]
    };
}

function genProbability2b() {
    // サイコロ2個の目の和の確率
    const target = getRandomInt(2, 12);
    const ways = 6 - Math.abs(target - 7);
    const [num, den] = reduceFractionProb(ways, 36);

    const customChoices = buildFractionChoicesProb(num, den, [
        [ways + 1, 36], [ways - 1, 36], [ways, 6], [7 - Math.abs(target - 7), 36]
    ]);

    return {
        unit: '場合の数・確率', level: 1, badge: 'Lv.1 基本', title: '確率・サイコロ2個の目の和',
        text: `大小2個のサイコロを同時に投げる。`,
        prompt: `出た目の和が ${target} になる確率はいくらか。`,
        customChoices,
        steps: [
            `ステップ1：目の出方の全体を求める。<br><strong>6 × 6 ＝ 36通り</strong>`,
            `ステップ2：目の和が${target}になる組み合わせを数え上げる。<br><strong>${ways}通り</strong>`,
            `ステップ3：確率を算出する。<br><strong>${ways} / 36 ＝ ${num}/${den}</strong>`
        ]
    };
}

function genProbability2c() {
    // 玉を1個取り出す単純な条件付き確率
    const redBalls = getRandomInt(2, 6);
    const whiteBalls = getRandomInt(2, 6);
    const total = redBalls + whiteBalls;
    const [num, den] = reduceFractionProb(redBalls, total);

    const customChoices = buildFractionChoicesProb(num, den, [
        [whiteBalls, total], [redBalls, total + 1], [redBalls - 1, total], [1, 2]
    ]);

    return {
        unit: '場合の数・確率', level: 1, badge: 'Lv.1 基本', title: '確率・玉を1個取り出す',
        text: `袋の中に赤玉 ${redBalls}個、白玉 ${whiteBalls}個 の合計 ${total}個 が入っている。この袋から玉を1個取り出す。`,
        prompt: '取り出した玉が赤玉である確率はいくらか。',
        customChoices,
        steps: [
            `ステップ1：全体の玉の個数を求める。<br><strong>${redBalls} + ${whiteBalls} ＝ ${total}個</strong>`,
            `ステップ2：赤玉である確率を求める。<br><strong>${redBalls} / ${total} ＝ ${num}/${den}</strong>`
        ]
    };
}

// ============================================================
// レベル2・場合の数
// ============================================================

function genProbability3a() {
    // 順序が固定された順列
    const totalPeople = getRandomInt(5, 7);
    const totalWays = factorialProb(totalPeople);
    const ways = totalWays / 2;

    return {
        unit: '場合の数・確率', level: 2, badge: 'Lv.2 応用', title: '場合の数・順序が固定された順列',
        text: `${totalPeople}人が一列に並ぶ。`,
        prompt: '特定の2人Aの方がBよりも常に前にいる並び方は何通りか。',
        correctAnswer: ways, unitSuffix: '通り', step: factorialProb(totalPeople - 2),
        steps: [
            `ステップ1：順序が固定されているAとBを「同じ記号」とみなす。`,
            `ステップ2：全体の並び方を求め、AとBの前後関係で半分になることを利用する。<br><strong>${totalPeople}! ÷ 2!</strong>`,
            `ステップ3：計算する。<br><strong>${totalWays} ÷ 2 ＝ ${ways}通り</strong>`
        ]
    };
}

function genProbability3b() {
    // 円順列
    const totalPeople = getRandomInt(5, 8);
    const ways = factorialProb(totalPeople - 1);

    return {
        unit: '場合の数・確率', level: 2, badge: 'Lv.2 応用', title: '場合の数・円順列',
        text: `${totalPeople}人が円形のテーブルに並んで座る。回転して同じ配置になるものは同一の並び方とみなす。`,
        prompt: '座り方は何通りあるか。',
        correctAnswer: ways, unitSuffix: '通り', step: factorialProb(totalPeople - 2),
        steps: [
            `ステップ1：円順列は、1人を基準に固定して残りを並べると考える。<br>基準の1人を固定すると、残り${totalPeople - 1}人の並べ方を考えればよい。`,
            `ステップ2：円順列の公式 (n-1)! を用いる。<br><strong>(${totalPeople}-1)! ＝ ${totalPeople - 1}! ＝ ${ways}通り</strong>`
        ]
    };
}

function genProbability3c() {
    // 委員決め（順列 nPk）
    const totalPeople = getRandomInt(6, 9);
    const roleNames = ['委員長', '副委員長', '書記', '会計'];
    const selectCount = getRandomInt(2, 3);
    const roles = roleNames.slice(0, selectCount);
    const ways = nPrProb(totalPeople, selectCount);

    return {
        unit: '場合の数・確率', level: 2, badge: 'Lv.2 応用', title: '場合の数・役職の決め方（順列）',
        text: `${totalPeople}人の中から、${roles.join('・')}を1人ずつ選ぶ。`,
        prompt: '選び方は何通りあるか。',
        correctAnswer: ways, unitSuffix: '通り', step: totalPeople,
        steps: [
            `ステップ1：${roles[0]}の選び方は<strong>${totalPeople}通り</strong>。`,
            ...roles.slice(1).map((role, idx) => {
                const remaining = totalPeople - idx - 1;
                return `ステップ${idx + 2}：${role}の選び方は、残り${remaining}人から選ぶので<strong>${remaining}通り</strong>。`;
            }),
            `ステップ${roles.length + 1}：積の法則によりすべて掛け合わせる。<br><strong>${Array.from({ length: selectCount }, (_, i) => totalPeople - i).join(' × ')} ＝ ${ways}通り</strong>`
        ]
    };
}

// ============================================================
// レベル2・確率
// ============================================================

function genProbability4a() {
    // 赤玉・白玉の同時抽出（ちょうど◯個条件）
    let redBalls, whiteBalls, drawCount, targetRed, targetWhite;
    let attempts = 0;
    do {
        attempts++;
        redBalls = getRandomInt(3, 6);
        whiteBalls = getRandomInt(3, 6);
        drawCount = 3;
        targetRed = getRandomInt(1, 2);
        targetWhite = drawCount - targetRed;
    } while ((targetRed > redBalls || targetWhite > whiteBalls) && attempts < 50);

    const total = redBalls + whiteBalls;
    const totalWays = nCrProb(total, drawCount);
    const favorableWays = nCrProb(redBalls, targetRed) * nCrProb(whiteBalls, targetWhite);
    const [num, den] = reduceFractionProb(favorableWays, totalWays);

    const customChoices = buildFractionChoicesProb(num, den, [
        [favorableWays + 2, totalWays], [favorableWays - 2, totalWays], [redBalls, total], [1, 2]
    ]);

    return {
        unit: '場合の数・確率', level: 2, badge: 'Lv.2 応用', title: '確率・複数色の玉の同時抽出',
        text: `赤玉${redBalls}個、白玉${whiteBalls}個の合計${total}個が入っている袋から、同時に${drawCount}個の玉を取り出す。`,
        prompt: `「赤玉がちょうど${targetRed}個、白玉がちょうど${targetWhite}個」取り出される確率はいくらか。`,
        customChoices,
        steps: [
            `ステップ1：${total}個から同時に${drawCount}個を取り出す全組み合わせを求める。<br><strong>${total}C${drawCount} ＝ ${totalWays}通り</strong>`,
            `ステップ2：条件を満たす選び方を計算する。<br>赤玉${redBalls}個から${targetRed}個を選ぶ：<strong>${redBalls}C${targetRed} ＝ ${nCrProb(redBalls, targetRed)}通り</strong><br>白玉${whiteBalls}個から${targetWhite}個を選ぶ：<strong>${whiteBalls}C${targetWhite} ＝ ${nCrProb(whiteBalls, targetWhite)}通り</strong><br>組合せの総数：<strong>${nCrProb(redBalls, targetRed)} × ${nCrProb(whiteBalls, targetWhite)} ＝ ${favorableWays}通り</strong>`,
            `ステップ3：確率を求める。<br><strong>${favorableWays} / ${totalWays} ＝ ${num}/${den}</strong>`
        ]
    };
}

function genProbability4b() {
    // 少なくとも1個は赤玉である確率（余事象）
    let redBalls, whiteBalls, drawCount;
    let attempts = 0;
    do {
        attempts++;
        redBalls = getRandomInt(3, 6);
        whiteBalls = getRandomInt(4, 7);
        drawCount = getRandomInt(2, 3);
    } while (whiteBalls < drawCount && attempts < 50);

    const total = redBalls + whiteBalls;
    const totalWays = nCrProb(total, drawCount);
    const allWhiteWays = nCrProb(whiteBalls, drawCount);
    const favorableWays = totalWays - allWhiteWays;
    const [num, den] = reduceFractionProb(favorableWays, totalWays);
    const [noneNum, noneDen] = reduceFractionProb(allWhiteWays, totalWays);

    const customChoices = buildFractionChoicesProb(num, den, [
        [allWhiteWays, totalWays], [noneNum, noneDen], [favorableWays - 2, totalWays], [redBalls, total]
    ]);

    return {
        unit: '場合の数・確率', level: 2, badge: 'Lv.2 応用', title: '確率・少なくとも1つ（余事象）',
        text: `赤玉${redBalls}個、白玉${whiteBalls}個の合計${total}個が入っている袋から、同時に${drawCount}個の玉を取り出す。`,
        prompt: '少なくとも1個は赤玉である確率はいくらか。',
        customChoices,
        steps: [
            `ステップ1：「少なくとも1個は赤玉」の余事象は「${drawCount}個とも白玉」である。この確率を先に求める。<br>全体：<strong>${total}C${drawCount} ＝ ${totalWays}通り</strong><br>${drawCount}個とも白玉：<strong>${whiteBalls}C${drawCount} ＝ ${allWhiteWays}通り</strong>`,
            `ステップ2：余事象の確率を求める。<br><strong>${allWhiteWays} / ${totalWays} ＝ ${noneNum}/${noneDen}</strong>`,
            `ステップ3：1から余事象の確率を引いて求める。<br><strong>1 − ${noneNum}/${noneDen} ＝ ${num}/${den}</strong>`
        ]
    };
}

function genProbability4c() {
    // くじ引き（非復元抽出）
    const totalTickets = getRandomInt(8, 12);
    const winTickets = getRandomInt(2, 4);
    const favorableWays = winTickets * (winTickets - 1);
    const totalWays = totalTickets * (totalTickets - 1);
    const [num, den] = reduceFractionProb(favorableWays, totalWays);
    const secondDrawRemaining = winTickets - 1;
    const secondDrawTotal = totalTickets - 1;

    const customChoices = buildFractionChoicesProb(num, den, [
        [winTickets, totalTickets], [winTickets * winTickets, totalTickets * totalTickets],
        [secondDrawRemaining, secondDrawTotal], [1, 2]
    ]);

    return {
        unit: '場合の数・確率', level: 2, badge: 'Lv.2 応用', title: '確率・くじ引き（非復元抽出）',
        text: `${totalTickets}本のくじの中に、当たりくじが${winTickets}本入っている。Aが1本引いた後、引いたくじを戻さずに続けてBが1本引く。`,
        prompt: 'AとBの2人とも当たりくじを引く確率はいくらか。',
        customChoices,
        steps: [
            `ステップ1：Aが当たりを引く確率を求める。<br><strong>${winTickets} / ${totalTickets}</strong>`,
            `ステップ2：Aが当たりを引いた後、残りは${totalTickets - 1}本・当たり${secondDrawRemaining}本になる。Bも当たりを引く確率を求める。<br><strong>${secondDrawRemaining} / ${secondDrawTotal}</strong>`,
            `ステップ3：2つの確率を掛け合わせる。<br><strong>(${winTickets}/${totalTickets}) × (${secondDrawRemaining}/${secondDrawTotal}) ＝ ${favorableWays}/${totalWays} ＝ ${num}/${den}</strong>`
        ]
    };
}

// ============================================================
// レベル3（2026-08改訂: 完全固定だったのを乱数化）
// ============================================================

function genProbability5() {
    // 反復試行と数直線上の動点：投げる回数・前進歩数・後退歩数をすべて可変にする
    const n = getRandomInt(4, 6);       // コインを投げる回数
    const f = getRandomInt(2, 4);       // 表が出たときに進む歩数
    const b = getRandomInt(1, 3);       // 裏が出たときに戻る歩数
    const x = getRandomInt(1, n - 1);   // 表が出た回数（0回・全部表は除外し、典型的な設問にする）

    const target = f * x - b * (n - x);
    const ways = nCrProb(n, x);
    const totalWays = Math.pow(2, n);
    const [num, den] = reduceFractionProb(ways, totalWays);

    // 誤答パターン：表裏を取り違える／2^nの指数を間違える／組み合わせ数を1つずらす
    const wrongX = n - x;
    const rawCandidates = [
        [nCrProb(n, wrongX), totalWays],
        [ways, Math.pow(2, n - 1)],
        [ways + 1, totalWays],
        [ways > 1 ? ways - 1 : ways + 2, totalWays]
    ];
    const customChoices = buildFractionChoicesProb(num, den, rawCandidates);
    const targetLabel = target >= 0 ? `+${target}` : `${target}`;

    return {
        unit: '場合の数・確率', level: 3, badge: 'Lv.3 高難度', title: '確率・反復試行と数直線上の動点',
        text: `数直線上の原点（0）に点Pがある。コインを1回投げて表が出たら右へ${f}（+${f}）、裏が出たら左へ${b}（-${b}）進む。コインを${n}回投げた。`,
        prompt: `点Pが最終的に「${targetLabel}」の位置にいる確率はいくらか。`,
        customChoices,
        steps: [
            `ステップ1：表が出た回数を x 回（裏は ${n} - x 回）として、${n}回後の位置を表す式を立てる。<br><strong>位置 ＝ ${f}x - ${b}(${n} - x) ＝ ${f + b}x - ${b * n}</strong>`,
            `ステップ2：位置が「${targetLabel}」になる表の回数 x を求める。<br><strong>${f + b}x - ${b * n} ＝ ${target}  ⇒  x ＝ ${x}（表が${x}回、裏が${n - x}回）</strong>`,
            `ステップ3：反復試行の公式を用いて確率を計算する。<br>全事象：<strong>2^${n} ＝ ${totalWays}通り</strong><br>表が${x}回出る出方：<strong>${n}C${x} ＝ ${ways}通り</strong><br>確率は <strong>${ways} / ${totalWays} ＝ ${num}/${den}</strong>`
        ]
    };
}

function genProbability6() {
    // 条件付き確率（原因の探求）：各工場の生産割合・不良品発生率をすべて可変にする
    const pAOptions = [30, 40, 50, 60, 70, 80];
    const pA = pAOptions[getRandomInt(0, pAOptions.length - 1)];
    const pB = 100 - pA;
    const rA = getRandomInt(1, 8);
    let rB = getRandomInt(1, 8);
    while (rB === rA) rB = getRandomInt(1, 8); // 2工場の不良率を異なる値にして問題として自然にする

    // 実際の確率は pA/100×rA/100 だが、比を取る際に /10000 は約分で消えるため、
    // pA×rA の「比例値」だけで正確に計算できる（浮動小数点誤差も避けられる）。
    const partA = pA * rA;
    const partB = pB * rB;
    const totalDefect = partA + partB;
    const [num, den] = reduceFractionProb(partA, totalDefect);

    const rawCandidates = [
        [partB, totalDefect],       // 誤り: 工場Bの確率を答えてしまう
        [pA, 100],                  // 誤り: 不良率を無視して生産割合だけ答えてしまう
        [rA, rA + rB],               // 誤り: 生産割合を無視して不良率だけの比で計算してしまう
        [partA, totalDefect + partB] // 誤り: 分母の計算を誤る
    ];
    const customChoices = buildFractionChoicesProb(num, den, rawCandidates);

    return {
        unit: '場合の数・確率', level: 3, badge: 'Lv.3 高難度', title: '確率・条件付き確率（原因の探求）',
        text: `ある製品を工場Aで ${pA}%、工場Bで ${pB}% 生産している。不良品の発生率は、工場Aが ${rA}%、工場Bが ${rB}% である。<br>出荷された製品の中からランダムに1個取り出したところ、不良品であった。`,
        prompt: 'その不良品が「工場A」で生産されたものである確率はいくらか。',
        customChoices,
        steps: [
            `ステップ1：全体の中から「Aの不良品」と「Bの不良品」が発生する比率をそれぞれ計算する（生産割合×不良率）。<br>Aの不良品の比率：<strong>${pA} × ${rA} ＝ ${partA}</strong><br>Bの不良品の比率：<strong>${pB} × ${rB} ＝ ${partB}</strong>`,
            `ステップ2：取り出した製品が不良品である全体の比率（分母）を求める。<br><strong>${partA} + ${partB} ＝ ${totalDefect}</strong>`,
            `ステップ3：条件付き確率の公式（Aの不良品 ÷ 全体の不良品）を計算する。<br><strong>${partA} / ${totalDefect} ＝ ${num}/${den}</strong>`
        ]
    };
}
