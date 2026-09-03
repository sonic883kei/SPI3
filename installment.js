/**
 * installment.js
 * 単元: ④ 分割払い
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genInstallment1, genInstallment2, genInstallment3
 *
 * 2026-08改訂: 実金額ではなく「代金に対する分数」で答えるSPI典型形式に変更。
 *   - 集合・代金清算などと違い、分割払いは「代金の何分の一か」を問う出題が主流のため。
 *   - 選択肢は customChoices（分数表記）で提供し、共通の generateChoices（数値±step方式）は使わない。
 *
 * 2026-08再改訂:
 *   - buildFractionChoicesInstallment に「いずれでもない」が抜けていたため追加（他単元と同じく
 *     一定確率でこれ自体が正解になる形式。既存のcorrectFrac/rawCandidatesの仕様は変更していない）。
 *   - 難易度を見直し。旧Lv3（残額の一部をまとめ払い）はLv2のバリエーション2として統合。
 *     新Lv3として、手数料付き頭金逆算／複数の分割払いの合成、という2つの高難度パターンを追加。
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
// 常に4択＋「いずれでもない」の5択。一定確率で「いずれでもない」自体が正解になる。
function buildFractionChoicesInstallment(correctFrac, rawCandidates) {
    const isNoneCorrect = getRand() < 0.15;
    const [cn, cd] = simplifyFractionInstallment(correctFrac[0], correctFrac[1]);
    const correctKey = (cn / cd).toFixed(6);

    const seen = new Map(); // key: 値(文字列化) -> [num, den]
    const addCandidate = (num, den) => {
        if (den === 0 || num <= 0 || num >= den) return; // このファイルの答えは常に「代金に対する真分数」のため、1以上は除外
        const [n, d] = simplifyFractionInstallment(num, den);
        const key = (n / d).toFixed(6);
        if (isNoneCorrect && key === correctKey) return; // 正解を除外している場合は混入させない
        if (!seen.has(key)) seen.set(key, [n, d]);
    };

    if (!isNoneCorrect) seen.set(correctKey, [cn, cd]);
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
    // 正解が候補に残っているべき場合、slice(0,4)から漏れないように保証
    if (!isNoneCorrect && !entries.some(([key]) => key === correctKey)) {
        entries[entries.length - 1] = [correctKey, [cn, cd]];
        entries.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }

    const choices = entries.map(([key, [n, d]]) => ({
        value: key,
        htmlText: fractionHtmlInstallment(n, d),
        isCorrect: !isNoneCorrect && key === correctKey
    }));

    const shuffled = shuffleArray(choices);
    shuffled.push({ value: 'none', htmlText: 'いずれでもない', isCorrect: isNoneCorrect });
    return shuffled;
}

// ============================================================
// レベル1
// ============================================================

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

// ============================================================
// レベル2（2バリエーション：頭金＋既払い分の累計 ／ 残額の一部をまとめ払い）
// ============================================================

function genInstallment2() {
    const useCumulative = getRand() < 0.5;

    if (useCumulative) {
        // バリエーション1：頭金＋分割払い済み分の累計
        const bOptions = [4, 5, 6, 8];
        let b = bOptions[getRandomInt(0, bOptions.length - 1)];
        let a = getRandomInt(1, b - 1);
        [a, b] = simplifyFractionInstallment(a, b);
        const nOptions = [4, 5, 6, 8, 10];
        const n = nOptions[getRandomInt(0, nOptions.length - 1)];
        const k = getRandomInt(1, n - 1); // すでに支払った分割回数

        const correctFrac = [a * n + k * (b - a), b * n];

        const rawCandidates = [
            [k * (b - a), b * n],
            [a + k * (b - a), b * n],
            [a * n + k * b, b * n],
            [a * n + (k + 1) * (b - a), b * n]
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
    } else {
        // バリエーション2：残額の一部をまとめ払い
        const bOptions = [3, 4, 5, 6, 8];
        let b = bOptions[getRandomInt(0, bOptions.length - 1)];
        let a = getRandomInt(1, b - 1);
        [a, b] = simplifyFractionInstallment(a, b);
        const dOptions = [2, 3, 4, 5];
        let d = dOptions[getRandomInt(0, dOptions.length - 1)];
        let c = getRandomInt(1, d - 1);
        [c, d] = simplifyFractionInstallment(c, d);

        const correctFrac = [(b - a) * c, b * d];

        const rawCandidates = [
            [c, d],
            [b - a, b],
            [a * c, b * d],
            [(b - a) + c, b + d]
        ];

        const customChoices = buildFractionChoicesInstallment(correctFrac, rawCandidates);
        const [rn, rd] = simplifyFractionInstallment(correctFrac[0], correctFrac[1]);

        return {
            unit: '分割払い', level: 2, badge: 'Lv.2 応用', title: '残額の一部をまとめ払い',
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
}

// ============================================================
// レベル3（2バリエーション：手数料付き頭金逆算 ／ 複数分割払いの合成）※新規
// ============================================================

function genInstallment3() {
    const useReform = getRand() < 0.5;

    if (!useReform) {
        // バリエーション1：分割手数料込みで、1回の支払額から頭金を逆算する
        const bOptions = [4, 5, 6];
        let b = bOptions[getRandomInt(0, bOptions.length - 1)];
        let a = getRandomInt(1, b - 1); // 頭金は代金の a/b（これを問題の答えとして求めさせる）
        [a, b] = simplifyFractionInstallment(a, b);
        const feeMOptions = [10, 12, 15];
        const feeM = feeMOptions[getRandomInt(0, feeMOptions.length - 1)]; // 手数料は残高の1/feeM
        const nOptions = [10, 12, 15];
        const n = nOptions[getRandomInt(0, nOptions.length - 1)];

        // 残高 = 1 - a/b = (b-a)/b
        // 手数料込みの支払総額 = 残高 × (feeM+1)/feeM
        // 1回分の支払額(target) = 支払総額 ÷ n
        const balNum = b - a, balDen = b;
        const targetNumRaw = balNum * (feeM + 1);
        const targetDenRaw = balDen * feeM * n;
        const [tn, td] = simplifyFractionInstallment(targetNumRaw, targetDenRaw);

        // 答え(頭金 a/b)を、target/feeM/nから逆算させる形式。正解は a/b。
        const correctFrac = [a, b];
        const rawCandidates = [
            [b - a, b],   // 誤り: 残高をそのまま頭金と間違える
            [tn, td],     // 誤り: 1回の支払額をそのまま頭金と混同してしまう
            [a + 1, b],   // 誤り: 分子を1つ間違える
            [a, b + 1]    // 誤り: 分母を1つ間違える
        ];

        const customChoices = buildFractionChoicesInstallment(correctFrac, rawCandidates);
        const [rn, rd] = simplifyFractionInstallment(correctFrac[0], correctFrac[1]);
        const balanceHtml = fractionHtmlInstallment(balNum, balDen);

        return {
            unit: '分割払い', level: 3, badge: 'Lv.3 高難度', title: '手数料込みの頭金逆算',
            text: `ある商品を購入するにあたり、購入時に頭金を支払い、代金から頭金を差し引いた残高を <strong>${n}回</strong> の分割払いにする。分割手数料として、頭金支払い後の残高の <strong>1/${feeM}</strong> が残高に追加される。分割払いの1回の支払額を代金の <strong>${tn}/${td}</strong> にするためには、頭金として代金のどれだけを支払うことになるか。`,
            prompt: '頭金として代金のどれだけを支払うことになるか。最も簡単な分数で答えなさい。',
            customChoices,
            steps: [
                `ステップ1：1回の支払額(${tn}/${td})に回数(${n}回)を掛けて、手数料込みの支払総額を求める。<br><strong>${tn}/${td} × ${n} = ${targetNumRaw}/${balDen * feeM}</strong>（約分前）`,
                `ステップ2：手数料込みの支払総額は、頭金支払い後の残高の (${feeM}+1)/${feeM} 倍にあたる。逆に残高を求めるには (${feeM})/(${feeM}+1) を掛ける。<br><strong>残高 = 支払総額 × ${feeM}/${feeM + 1}</strong>`,
                `ステップ3：計算すると、残高は代金の <strong>${balanceHtml}</strong> になる。`,
                `ステップ4：頭金 ＝ 1 − 残高で求める。<br><strong>1 − ${balanceHtml} = ${fractionHtmlInstallment(rn, rd)}</strong>`
            ]
        };
    } else {
        // バリエーション2：既存の分割払いに、新たな分割払い(リフォーム費用等)が合成される
        const mOptions = [10, 12, 15, 20];
        const M = mOptions[getRandomInt(0, mOptions.length - 1)]; // 追加分の分割回数
        const kOptions = [3, 4, 5, 6];
        const N = M * kOptions[getRandomInt(0, kOptions.length - 1)]; // 元の分割回数（Mの倍数にして扱いやすくする）
        const breakpoint = getRandomInt(Math.floor(N / 4), N - M > 0 ? N - M : N - 1); // 合成が始まる回（物語上のみ、計算には無関係）
        const cOptions = [20, 25, 30, 40];
        const c = cOptions[getRandomInt(0, cOptions.length - 1)]; // 追加費用 = 代金の 1/c（これが答え）

        // 合成後の1回分支払額(target) = 1/N + (1/c)/M = (c*M + N) / (N*c*M)
        const targetNumRaw = c * M + N;
        const targetDenRaw = N * c * M;
        const [tn, td] = simplifyFractionInstallment(targetNumRaw, targetDenRaw);

        const correctFrac = [1, c];
        const [rn, rd] = simplifyFractionInstallment(1, c);
        const rawCandidates = [
            [1, N],                    // 誤り: 元の分割払い額をそのまま答えにしてしまう
            [tn, td],                  // 誤り: 合成後の支払額をそのまま答えにしてしまう
            [M, N * c],                // 誤り: 通分を誤る
            [1, c + M]                 // 誤り: 分母の計算を誤る
        ];

        const customChoices = buildFractionChoicesInstallment(correctFrac, rawCandidates);
        const nextPaymentNo = breakpoint + 1;

        return {
            unit: '分割払い', level: 3, badge: 'Lv.3 高難度', title: '複数の分割払いの合成',
            text: `ある人が商品を <strong>${N}回</strong> の分割払いで購入することにした。<strong>${breakpoint}回目</strong> の支払いが終了した時点で追加工事を行い、その費用を <strong>${M}回</strong> の分割払いとし、2つの分割払いは一緒に支払うことにした。<strong>${nextPaymentNo}回目</strong> の分割払いの支払額は、最初の購入価格の <strong>${tn}/${td}</strong> になった。`,
            prompt: '追加工事の費用は、最初の購入価格のどれだけにあたるか。最も簡単な分数で答えなさい。',
            customChoices,
            steps: [
                `ステップ1：${nextPaymentNo}回目以降の支払額は「元の分割払い1回分」と「追加工事の分割払い1回分」の合計になる。<br><strong>1/${N} ＋ (追加工事費用)/${M} ＝ ${tn}/${td}</strong>`,
                `ステップ2：追加工事の分割払い1回分を求める。<br><strong>(追加工事費用)/${M} ＝ ${tn}/${td} − 1/${N}</strong>`,
                `ステップ3：右辺を通分して計算する。<br><strong>${tn}/${td} − 1/${N} ＝ ${rn}/${rd * M}</strong>（約分後）`,
                `ステップ4：両辺に${M}を掛けて、追加工事費用を求める。<br><strong>追加工事費用 ＝ ${rn}/${rd}</strong>`
            ]
        };
    }
}
