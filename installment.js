/**
 * installment.js
 * 単元: ④ 分割払い
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genInstallment1, genInstallment2, genInstallment3
 *
 * 2026-08改訂: 実金額ではなく「代金に対する分数」で答えるSPI典型形式に変更。
 *   - 集合・代金清算などと違い、分割払いは「代金の何分の一か」を問う出題が主流のため。
 *   - 選択肢は customChoices（分数表記）で提供し、共通の generateChoices（数値±step方式）は使わない。
 */

// --- 分割払い専用の分数ユーティリティ ---
function gcdInstallment(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a || 1;
}

function simplifyFractionInstallment(num, den) {
    if (den < 0) { num = -num; den = -den; }
    const g = gcdInstallment(num, den);
    return [num / g, den / g];
}

function fractionHtmlInstallment(num, den) {
    return den === 1 ? `${num}` : `${num}/${den}`;
}

// correctFrac: [num, den]（未約分でも可）、rawCandidates: [num, den][]（誤答となる計算パターン、未約分可）
// 常に4択、correctを必ず1つ含み、値が重複しないように調整して返す（customChoices形式）
function buildFractionChoicesInstallment(correctFrac, rawCandidates) {
    const seen = new Map(); // key: 値(文字列化) -> {num, den}
    const addCandidate = (num, den) => {
        if (den === 0 || num <= 0) return;
        const [n, d] = simplifyFractionInstallment(num, den);
        const key = (n / d).toFixed(6);
        if (!seen.has(key)) seen.set(key, [n, d]);
    };

    const [cn, cd] = simplifyFractionInstallment(correctFrac[0], correctFrac[1]);
    const correctKey = (cn / cd).toFixed(6);
    seen.set(correctKey, [cn, cd]);

    for (const [n, d] of rawCandidates) {
        if (seen.size >= 4) break;
        addCandidate(n, d);
    }

    // 4個に満たない場合は、正解の分母・分子を少しずらした値で埋める
    let guard = 0;
    while (seen.size < 4 && guard < 60) {
        guard++;
        const bump = getRandomInt(1, 3);
        const denomBump = getRandomInt(1, 3);
        addCandidate(cn + bump, cd);
        if (seen.size >= 4) break;
        addCandidate(cn, cd + denomBump);
    }

    const entries = Array.from(seen.entries()).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])).slice(0, 4);
    // 正解が slice(0,4) から漏れないように保証
    if (!entries.some(([key]) => key === correctKey)) {
        entries[entries.length - 1] = [correctKey, [cn, cd]];
        entries.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }

    const choices = entries.map(([key, [n, d]], idx) => ({
        label: String.fromCharCode(65 + idx),
        value: key,
        htmlText: fractionHtmlInstallment(n, d),
        isCorrect: key === correctKey
    }));

    return shuffleArray(choices);
}

function genInstallment1() {
    const bOptions = [4, 5, 6, 8, 10];
    let b = bOptions[getRandomInt(0, bOptions.length - 1)];
    let a = getRandomInt(1, b - 1); // 頭金は代金の a/b
    [a, b] = simplifyFractionInstallment(a, b); // 問題文には既約分数で表示する
    const nOptions = [3, 4, 5, 6, 8, 10, 12];
    const n = nOptions[getRandomInt(0, nOptions.length - 1)];

    // 1回分の分割払い額 = 残り(b-a)/b を n回で割る = (b-a)/(b*n)
    const correctFrac = [b - a, b * n];

    const rawCandidates = [
        [a, b * n],       // 誤り: 頭金の割合をそのままnで割ってしまう
        [b - a, n],       // 誤り: 分母のbを掛け忘れる
        [1, n],           // 誤り: 頭金を無視して残り=1としてしまう
        [b - a, b * (n - 1 > 0 ? n - 1 : n + 1)] // 誤り: 回数を1つ間違える
    ];

    const customChoices = buildFractionChoicesInstallment(correctFrac, rawCandidates);
    const [rn, rd] = simplifyFractionInstallment(correctFrac[0], correctFrac[1]);

    return {
        unit: '分割払い', level: 1, badge: 'Lv.1 基本', title: '頭金と均等分割払い',
        text: `ある商品を購入するにあたり、代金の <strong>${a}/${b}</strong> を頭金として支払い、残りを <strong>${n}回</strong> の均等分割で支払うことにした。`,
        prompt: '1回分の分割払い額は、代金の何分のいくらか。最も簡単な分数で答えなさい。',
        customChoices,
        steps: [
            `ステップ1：頭金を除いた残りの割合を求める。<br><strong>1 − ${a}/${b} = ${b - a}/${b}</strong>`,
            `ステップ2：残りを${n}回で均等に割る。<br><strong>${b - a}/${b} ÷ ${n} = ${b - a}/${b * n}</strong>`,
            `ステップ3：約分する。<br><strong>${b - a}/${b * n} = ${fractionHtmlInstallment(rn, rd)}</strong>`
        ]
    };
}

function genInstallment2() {
    const bOptions = [4, 5, 6, 8];
    let b = bOptions[getRandomInt(0, bOptions.length - 1)];
    let a = getRandomInt(1, b - 1); // 頭金は代金の a/b
    [a, b] = simplifyFractionInstallment(a, b); // 問題文には既約分数で表示する
    const nOptions = [4, 5, 6, 8, 10];
    const n = nOptions[getRandomInt(0, nOptions.length - 1)];
    const k = getRandomInt(1, n - 1); // すでに支払った分割回数

    // 1回分 = (b-a)/(b*n)
    // 支払済み総額 = a/b + k*(b-a)/(b*n) = (a*n + k*(b-a)) / (b*n)
    const correctFrac = [a * n + k * (b - a), b * n];

    const rawCandidates = [
        [k * (b - a), b * n],              // 誤り: 頭金を足し忘れる
        [a + k * (b - a), b * n],          // 誤り: 頭金の分子をn倍し忘れる（通分ミス）
        [a * n + k * b, b * n],            // 誤り: 分割払い1回分を1/nとして扱ってしまう
        [a * n + (k + 1) * (b - a), b * n] // 誤り: 回数を1つ多く数えてしまう
    ];

    const customChoices = buildFractionChoicesInstallment(correctFrac, rawCandidates);
    const [rn, rd] = simplifyFractionInstallment(correctFrac[0], correctFrac[1]);

    return {
        unit: '分割払い', level: 2, badge: 'Lv.2 応用', title: '頭金＋分割払い済み分の累計',
        text: `ある商品を購入するにあたり、代金の <strong>${a}/${b}</strong> を頭金として支払い、残りを <strong>${n}回</strong> の均等分割で支払う契約をした。すでに <strong>${k}回分</strong> の支払いを終えている。`,
        prompt: '頭金と支払い済みの分割払い額を合計すると、代金の何分のいくらになるか。最も簡単な分数で答えなさい。',
        customChoices,
        steps: [
            `ステップ1：1回分の分割払い額を求める。<br><strong>(1 − ${a}/${b}) ÷ ${n} = ${b - a}/${b * n}</strong>`,
            `ステップ2：頭金と${k}回分の分割払い額を通分して足し合わせる。<br><strong>${a}/${b} + ${k}×${b - a}/${b * n} = (${a}×${n} + ${k}×${b - a}) / ${b * n} = ${a * n + k * (b - a)}/${b * n}</strong>`,
            `ステップ3：約分する。<br><strong>${a * n + k * (b - a)}/${b * n} = ${fractionHtmlInstallment(rn, rd)}</strong>`
        ]
    };
}

function genInstallment3() {
    const bOptions = [3, 4, 5, 6, 8];
    let b = bOptions[getRandomInt(0, bOptions.length - 1)];
    let a = getRandomInt(1, b - 1); // 頭金は代金の a/b
    [a, b] = simplifyFractionInstallment(a, b); // 問題文には既約分数で表示する
    const dOptions = [2, 3, 4, 5];
    let d = dOptions[getRandomInt(0, dOptions.length - 1)];
    let c = getRandomInt(1, d - 1); // 残りのうち、まとめて支払う割合 c/d
    [c, d] = simplifyFractionInstallment(c, d);

    // まとめ払い額 = 残り(b-a)/b × c/d = (b-a)*c / (b*d)
    const correctFrac = [(b - a) * c, b * d];

    const rawCandidates = [
        [c, d],               // 誤り: 残りの割合を掛けるのを忘れる
        [b - a, b],            // 誤り: まとめ払いの割合を掛けるのを忘れる
        [a * c, b * d],        // 誤り: 頭金の割合と混同してしまう
        [(b - a) + c, b + d]   // 誤り: 分数同士をそのまま足し引きしてしまう
    ];

    const customChoices = buildFractionChoicesInstallment(correctFrac, rawCandidates);
    const [rn, rd] = simplifyFractionInstallment(correctFrac[0], correctFrac[1]);

    return {
        unit: '分割払い', level: 3, badge: 'Lv.3 高難度', title: '残額の一部をまとめ払い',
        text: `ある商品を購入するにあたり、代金の <strong>${a}/${b}</strong> を頭金として支払い、残りを分割で支払う契約をした。その後、ある月に残りの分割払い額のうち <strong>${c}/${d}</strong> にあたる金額をまとめて支払った。`,
        prompt: 'この月にまとめて支払った金額は、代金の何分のいくらか。最も簡単な分数で答えなさい。',
        customChoices,
        steps: [
            `ステップ1：頭金を除いた残りの割合を求める。<br><strong>1 − ${a}/${b} = ${b - a}/${b}</strong>`,
            `ステップ2：残りのうち、まとめて支払った割合を掛け合わせる。<br><strong>${b - a}/${b} × ${c}/${d} = (${b - a}×${c}) / (${b}×${d}) = ${(b - a) * c}/${b * d}</strong>`,
            `ステップ3：約分する。<br><strong>${(b - a) * c}/${b * d} = ${fractionHtmlInstallment(rn, rd)}</strong>`
        ]
    };
}
