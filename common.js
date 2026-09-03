/**
 * common.js
 * 乱数エンジン・共通選択肢生成・出題オーケストレーター
 *
 * 依存関係:
 *   - index.html から、js/algorithms/ 配下の他ファイルより "先に" 読み込むこと。
 *     （通常の<script>タグ。let/function宣言はページ全体のグローバルスコープを共有するため、
 *      読み込み順さえ守れば同一ディレクトリの他ファイルから直接呼び出せる）
 *
 * このファイルが公開する関数（ui.js から呼ばれるもの）:
 *   - initPRNG(seedStr)         CBT日付同期モードなどで乱数シードを固定する
 *   - shuffleArray(array)       配列シャッフル（CBT出題順の決定などに使用）
 *   - generateQuestionByConfig(unit, level)  設定に応じた問題を1問生成する
 *
 * 新しい単元を追加した場合は、下記 generateQuestionByConfig() の
 * ①units配列 と ②if/elseの分岐 の両方に追記すること。
 */

let currentPRNG = Math.random;

function stringToSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    }
    return h >>> 0;
}

function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function initPRNG(seedStr) {
    if (seedStr) {
        const numericSeed = stringToSeed(seedStr);
        currentPRNG = mulberry32(numericSeed);
    } else {
        currentPRNG = Math.random;
    }
}

function getRand() {
    return currentPRNG();
}

function getRandomInt(min, max) {
    return Math.floor(getRand() * (max - min + 1)) + min;
}

function generateChoices(q) {
    if (q.customChoices) return q.customChoices;

    const correctVal = q.correctAnswer;
    const unitSuffix = q.unitSuffix || '';
    const step = q.step || 1;
    // 「いずれでもない」を全単元共通で末尾に追加する。一定確率でこれ自体が正解になる
    const isNoneCorrect = getRand() < 0.15;
    // 実際のSPIは設問によって選択肢数が異なるため、ここでも3〜6個の範囲で変動させる
    const targetCount = getRandomInt(3, 6);

    let pool = new Set();
    if (!isNoneCorrect) pool.add(correctVal);

    let attempts = 0;
    while (pool.size < targetCount && attempts < 100) {
        attempts++;
        const offset = (getRandomInt(1, 4) * (getRand() < 0.5 ? 1 : -1)) * step;
        const candidate = correctVal + offset;
        if (candidate > 0 && candidate !== correctVal) pool.add(candidate);
    }
    // 候補の幅が狭く1つも集まらなかった場合の保険（最低1つは実数の選択肢を用意する）
    if (pool.size === 0) pool.add(correctVal + step);

    const arr = Array.from(pool).sort((a, b) => a - b);
    // タップ式なのでA〜Fのような文字ラベルは付与しない（選択肢数も可変でよい）
    const choices = arr.map((val) => ({
        value: val,
        htmlText: `${val.toLocaleString()} ${unitSuffix}`,
        isCorrect: !isNoneCorrect && val === correctVal
    }));
    choices.push({
        value: 'none',
        htmlText: 'いずれでもない',
        isCorrect: isNoneCorrect
    });
    return choices;
}

function generateQuestionByConfig(unit, level) {
    let selectedUnit = unit;
    if (unit === 'all') {
        const units = ['set', 'settlement', 'discount', 'installment', 'speed', 'timetable', 'profit', 'probability', 'logical', 'inference', 'table'];
        selectedUnit = units[getRandomInt(0, units.length - 1)];
    }

    let targetLvl = level === 'all' ? getRandomInt(1, 3) : parseInt(level);

    if (selectedUnit === 'table') {
        return buildTableQuestion(targetLvl);
    } else if (selectedUnit === 'logical') {
        return buildLogicalQuestion(targetLvl);
    } else if (selectedUnit === 'inference') {
        if (targetLvl === 3) return genInference2();
        return genInference1();
    } else if (selectedUnit === 'set') {
        if (targetLvl === 1) return genSet1();
        if (targetLvl === 2) return genSet2();
        return genSet3();
    } else if (selectedUnit === 'settlement') {
        if (targetLvl === 1) return genSettlement1();
        if (targetLvl === 2) return genSettlement2();
        return genSettlement3();
    } else if (selectedUnit === 'discount') {
        if (targetLvl === 1) return genDiscount1();
        if (targetLvl === 2) return genDiscount2();
        return genDiscount3();
    } else if (selectedUnit === 'installment') {
        if (targetLvl === 1) return genInstallment1();
        if (targetLvl === 2) return genInstallment2();
        return genInstallment3();
    } else if (selectedUnit === 'speed') {
        if (targetLvl === 1) return genSpeed1();
        if (targetLvl === 2) return genSpeed2();
        return genSpeed3();
    } else if (selectedUnit === 'timetable') {
        if (targetLvl === 1) return genTimetable1();
        if (targetLvl === 2) return genTimetable2();
        return genTimetable3();
    } else if (selectedUnit === 'profit') {
        if (targetLvl === 1) return genProfit1();
        if (targetLvl === 2) return genProfit2();
        return genProfit3();
    } else {
        if (targetLvl === 1) {
            const fns = [genProbability1a, genProbability1b, genProbability1c, genProbability2a, genProbability2b, genProbability2c];
            return fns[getRandomInt(0, fns.length - 1)]();
        } else if (targetLvl === 2) {
            const fns = [genProbability3a, genProbability3b, genProbability3c, genProbability4a, genProbability4b, genProbability4c];
            return fns[getRandomInt(0, fns.length - 1)]();
        } else {
            return getRand() < 0.5 ? genProbability5() : genProbability6();
        }
    }
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(getRand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
