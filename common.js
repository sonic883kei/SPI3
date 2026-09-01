/**
 * common.js
 * 乱数エンジン・共通選択肢生成・出題オーケストレーター
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
    const isNoneCorrect = getRand() < 0.15;
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
    if (pool.size === 0) pool.add(correctVal + step);

    const arr = Array.from(pool).sort((a, b) => a - b);
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
        return typeof buildTableQuestion === 'function' ? buildTableQuestion(targetLvl) : genSet1();
    } else if (selectedUnit === 'logical') {
        return typeof buildLogicalQuestion === 'function' ? buildLogicalQuestion(targetLvl) : genSet1();
    } else if (selectedUnit === 'inference') {
        return typeof genInference1 === 'function' ? genInference1() : genSet1();
    } else if (selectedUnit === 'set') {
        if (targetLvl === 1) return genSet1();
        if (targetLvl === 2) return genSet2();
        return genSet3();
    } else if (selectedUnit === 'settlement') {
        if (targetLvl === 1) return typeof genSettlement1 === 'function' ? genSettlement1() : genSet1();
        if (targetLvl === 2) return typeof genSettlement2 === 'function' ? genSettlement2() : genSet2();
        return typeof genSettlement3 === 'function' ? genSettlement3() : genSet3();
    } else if (selectedUnit === 'discount') {
        if (targetLvl === 1) return typeof genDiscount1 === 'function' ? genDiscount1() : genSet1();
        if (targetLvl === 2) return typeof genDiscount2 === 'function' ? genDiscount2() : genSet2();
        return typeof genDiscount3 === 'function' ? genDiscount3() : genSet3();
    } else if (selectedUnit === 'installment') {
        if (targetLvl === 1) return typeof genInstallment1 === 'function' ? genInstallment1() : genSet1();
        if (targetLvl === 2) return typeof genInstallment2 === 'function' ? genInstallment2() : genSet2();
        return typeof genInstallment3 === 'function' ? genInstallment3() : genSet3();
    } else if (selectedUnit === 'speed') {
        if (targetLvl === 1) return typeof genSpeed1 === 'function' ? genSpeed1() : genSet1();
        if (targetLvl === 2) return typeof genSpeed2 === 'function' ? genSpeed2() : genSet2();
        return typeof genSpeed3 === 'function' ? genSpeed3() : genSet3();
    } else if (selectedUnit === 'timetable') {
        if (targetLvl === 1) return typeof genTimetable1 === 'function' ? genTimetable1() : genSet1();
        if (targetLvl === 2) return typeof genTimetable2 === 'function' ? genTimetable2() : genSet2();
        return typeof genTimetable3 === 'function' ? genTimetable3() : genSet3();
    } else if (selectedUnit === 'profit') {
        if (targetLvl === 1) return typeof genProfit1 === 'function' ? genProfit1() : genSet1();
        if (targetLvl === 2) return typeof genProfit2 === 'function' ? genProfit2() : genSet2();
        return typeof genProfit3 === 'function' ? genProfit3() : genSet3();
    } else {
        if (typeof genProbability1 !== 'function') return genSet1();
        if (targetLvl === 1) {
            return getRand() < 0.5 ? genProbability1() : genProbability2();
        } else if (targetLvl === 2) {
            return getRand() < 0.5 ? genProbability3() : genProbability4();
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