/**
 * timetable.js
 * 単元: ⑤ 速さ②（時刻表）※新規追加
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genTimetable1, genTimetable2, genTimetable3
 *
 * unit キーは 'timetable'。既存の ⑤速さ（genSpeed系, unitキー 'speed'）とは
 * 別単元として common.js の generateQuestionByConfig / units配列 に登録済み。
 * index.html の単元選択ボタンと ui.js の UNIT_MAP / UNIT_KEYS への追加はまだ未対応（要フォローアップ）。
 */

// --- 速さ(時刻表) ---
const TIMETABLE_LEG_COMBOS = (() => {
    const byDistance = {};
    for (let d10 = 10; d10 <= 80; d10 += 5) {
        const distance = d10 / 10;
        for (let duration = 10; duration <= 150; duration += 5) {
            const numerator = d10 * 60;
            if (numerator % duration === 0) {
                const speed = (numerator / duration) / 10;
                if (speed >= 2.4 && speed <= 12.0) {
                    byDistance[distance] = byDistance[distance] || [];
                    byDistance[distance].push({ distance, duration, speed });
                }
            }
        }
    }
    return byDistance;
})();
const TIMETABLE_DISTANCES = Object.keys(TIMETABLE_LEG_COMBOS).map(Number).filter(d => TIMETABLE_LEG_COMBOS[d].length >= 5);

function pickTimetableLeg(distance, excludeSpeed) {
    const candidates = TIMETABLE_LEG_COMBOS[distance].filter(c => c.speed !== excludeSpeed);
    return candidates[getRandomInt(0, candidates.length - 1)];
}

function formatClock(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
}

function buildTimetable(depth) {
    depth = depth || 0;
    if (depth > 20) throw new Error('buildTimetable: 組み合わせの生成に失敗しました');

    const distPQ = TIMETABLE_DISTANCES[getRandomInt(0, TIMETABLE_DISTANCES.length - 1)];
    const distQR = TIMETABLE_DISTANCES[getRandomInt(0, TIMETABLE_DISTANCES.length - 1)];

    const legPQgo   = pickTimetableLeg(distPQ);
    const legQRgo   = pickTimetableLeg(distQR);
    const legQRback = pickTimetableLeg(distQR, legQRgo.speed);
    const legPQback = pickTimetableLeg(distPQ, legPQgo.speed);

    const dwellQgo = [0, 5, 10][getRandomInt(0, 2)];
    const dwellR   = getRandomInt(4, 24) * 10;
    const dwellQ   = getRandomInt(1, 6) * 10;

    const startMin = (7 + getRandomInt(0, 2)) * 60 + [0, 10, 20, 30, 40, 50][getRandomInt(0, 5)];

    const departP1 = startMin;
    const arriveQ1 = departP1 + legPQgo.duration;
    const departQ1 = arriveQ1 + dwellQgo;
    const arriveR  = departQ1 + legQRgo.duration;
    const departR  = arriveR + dwellR;
    const arriveQ2 = departR + legQRback.duration;
    const departQ2 = arriveQ2 + dwellQ;
    const arriveP2 = departQ2 + legPQback.duration;

    if (arriveP2 >= 24 * 60) return buildTimetable(depth + 1);

    return { distPQ, distQR, legPQgo, legQRgo, legQRback, legPQback, dwellQgo, dwellR, dwellQ,
             departP1, arriveQ1, departQ1, arriveR, departR, arriveQ2, departQ2, arriveP2 };
}

function buildTimetableHtml(t, hideKey) {
    const cell = (key, val) => key === hideKey
        ? '<span class="text-indigo-400 font-bold">（　）</span>'
        : formatClock(val);
    return `
        <div class="overflow-x-auto my-3">
            <table class="w-full text-xs text-center border-collapse border border-slate-700 bg-[#0f1423]">
                <thead>
                    <tr class="bg-slate-800 text-slate-300 border-b border-slate-700">
                        <th class="p-2 border border-slate-700"></th>
                        <th class="p-2 border border-slate-700">行き</th>
                        <th class="p-2 border border-slate-700">帰り</th>
                    </tr>
                </thead>
                <tbody class="text-slate-200 font-mono">
                    <tr><td class="p-1.5 border border-slate-700">P地点</td><td class="p-1.5 border border-slate-700">発 ${cell('departP1', t.departP1)}</td><td class="p-1.5 border border-slate-700">着 ${cell('arriveP2', t.arriveP2)}</td></tr>
                    <tr><td class="p-1.5 border border-slate-700">Q地点</td><td class="p-1.5 border border-slate-700">着 ${cell('arriveQ1', t.arriveQ1)} ／ 発 ${cell('departQ1', t.departQ1)}</td><td class="p-1.5 border border-slate-700">着 ${cell('arriveQ2', t.arriveQ2)} ／ 発 ${cell('departQ2', t.departQ2)}</td></tr>
                    <tr><td class="p-1.5 border border-slate-700">R地点</td><td class="p-1.5 border border-slate-700">着 ${cell('arriveR', t.arriveR)}</td><td class="p-1.5 border border-slate-700">発 ${cell('departR', t.departR)}</td></tr>
                </tbody>
            </table>
        </div>
    `;
}

function buildNumericChoicesWithNone(correctVal, offsets, unitSuffix, decimals) {
    decimals = decimals || 0;
    const fmt = v => decimals > 0 ? v.toFixed(decimals) : String(v);
    const isFCorrect = getRand() < 0.15;

    const values = offsets.map(off => Math.round((correctVal + off) * Math.pow(10, decimals)) / Math.pow(10, decimals));
    if (!isFCorrect) values.push(correctVal);
    const uniqueSorted = Array.from(new Set(values)).sort((a, b) => a - b).slice(0, 4);

    const choices = uniqueSorted.map((val, idx) => ({
        label: String.fromCharCode(65 + idx), value: val,
        htmlText: `${fmt(val)} ${unitSuffix}`,
        isCorrect: !isFCorrect && val === correctVal
    }));
    choices.push({ label: 'E', value: 'none', htmlText: 'いずれでもない', isCorrect: isFCorrect });
    return choices;
}

function genTimetable1() {
    const t = buildTimetable();
    const legs = [
        { key: 'PQ行き', dist: t.distPQ, leg: t.legPQgo,  from: 'P', to: 'Q', fromTime: t.departP1, toTime: t.arriveQ1 },
        { key: 'PQ帰り', dist: t.distPQ, leg: t.legPQback, from: 'Q', to: 'P', fromTime: t.departQ2, toTime: t.arriveP2 },
        { key: 'QR行き', dist: t.distQR, leg: t.legQRgo,  from: 'Q', to: 'R', fromTime: t.departQ1, toTime: t.arriveR },
        { key: 'QR帰り', dist: t.distQR, leg: t.legQRback, from: 'R', to: 'Q', fromTime: t.departR, toTime: t.arriveQ2 }
    ];
    const target = legs[getRandomInt(0, legs.length - 1)];
    const correctSpeed = target.leg.speed;

    const tableHtml = buildTimetableHtml(t, null);
    const choices = buildNumericChoicesWithNone(correctSpeed, [-0.4, -0.2, 0.2, 0.4], 'km/時', 1);

    return {
        unit: '速さ(時刻表)', level: 1, badge: 'Lv.1 基本', title: '時刻表からの平均速度',
        text: `P地点からQ地点を通ってR地点に進み、同じ道を通ってP地点に戻った。その時の時刻は次の通りであった。PQ間の距離は${t.distPQ}km、QR間の距離は${t.distQR}kmであった。${tableHtml}`,
        prompt: `${target.from}地点から${target.to}地点までの平均時速はいくらか。`,
        customChoices: shuffleArray(choices),
        steps: [
            `ステップ1：${target.from}地点を${formatClock(target.fromTime)}に出発し、${target.to}地点に${formatClock(target.toTime)}に到着しているので、所要時間は<strong>${target.leg.duration}分</strong>。`,
            `ステップ2：距離を時間(時間単位)で割る。<br><strong>${target.dist}km ÷ (${target.leg.duration}/60)時間 = ${correctSpeed}km/時</strong>`
        ]
    };
}

function genTimetable2() {
    const t = buildTimetable();
    const tableHtml = buildTimetableHtml(t, 'arriveP2');
    const speed = t.legPQback.speed;
    const correctTimeStr = formatClock(t.arriveP2);

    const offsetsMin = [-15, -10, 10, 15];
    const isFCorrect = getRand() < 0.15;
    let candidateTimes = offsetsMin.map(off => t.arriveP2 + off);
    if (!isFCorrect) candidateTimes.push(t.arriveP2);
    const uniqueSorted = Array.from(new Set(candidateTimes)).sort((a, b) => a - b).slice(0, 4);
    const choices = uniqueSorted.map((val, idx) => ({
        label: String.fromCharCode(65 + idx), value: val,
        htmlText: formatClock(val),
        isCorrect: !isFCorrect && val === t.arriveP2
    }));
    choices.push({ label: 'E', value: 'none', htmlText: 'いずれでもない', isCorrect: isFCorrect });

    return {
        unit: '速さ(時刻表)', level: 2, badge: 'Lv.2 応用', title: '時刻表の空欄計算',
        text: `P地点からQ地点を通ってR地点に進み、同じ道を通ってP地点に戻った。PQ間の距離は${t.distPQ}kmであり、帰りのQP間は平均時速${speed}kmで移動した。${tableHtml}`,
        prompt: 'P地点に到着する時刻（表の空欄）はいつか。',
        customChoices: shuffleArray(choices),
        steps: [
            `ステップ1：帰りのQP間の所要時間を求める。<br><strong>${t.distPQ}km ÷ ${speed}km/時 × 60 = ${t.legPQback.duration}分</strong>`,
            `ステップ2：Q地点の出発時刻(${formatClock(t.departQ2)})に所要時間を足す。<br><strong>${formatClock(t.departQ2)} + ${t.legPQback.duration}分 = ${correctTimeStr}</strong>`
        ]
    };
}

function genTimetable3() {
    const t = buildTimetable();
    const tableHtml = buildTimetableHtml(t, null);

    const totalDistance = t.distPQ * 2;
    const totalTime = t.legPQgo.duration + t.legPQback.duration;
    const correctSpeed = Math.round((totalDistance * 60 / totalTime) * 10) / 10;
    const commonMistake = Math.round(((t.legPQgo.speed + t.legPQback.speed) / 2) * 10) / 10;

    const isFCorrect = getRand() < 0.15;
    let values = [commonMistake, Math.round((correctSpeed - 0.3) * 10) / 10, Math.round((correctSpeed + 0.5) * 10) / 10];
    if (!isFCorrect) values.push(correctSpeed);
    const uniqueSorted = Array.from(new Set(values)).sort((a, b) => a - b).slice(0, 4);
    const choices = uniqueSorted.map((val, idx) => ({
        label: String.fromCharCode(65 + idx), value: val,
        htmlText: `${val.toFixed(1)} km/時`,
        isCorrect: !isFCorrect && val === correctSpeed
    }));
    choices.push({ label: 'E', value: 'none', htmlText: 'いずれでもない', isCorrect: isFCorrect });

    return {
        unit: '速さ(時刻表)', level: 3, badge: 'Lv.3 高難度', title: '往復の平均速度（時刻表）',
        text: `P地点からQ地点まで（片道${t.distPQ}km）を往復した。時刻は次の通りであった。${tableHtml}`,
        prompt: 'PQ間の往復全体の平均時速はいくらか。',
        customChoices: shuffleArray(choices),
        steps: [
            `ステップ1：行き・帰りそれぞれの所要時間を時刻表から求める。<br>行き：<strong>${t.legPQgo.duration}分</strong>　帰り：<strong>${t.legPQback.duration}分</strong>`,
            `ステップ2：往復の合計距離と合計時間を求める。<br>合計距離：<strong>${totalDistance}km</strong>　合計時間：<strong>${totalTime}分</strong>`,
            `ステップ3：平均時速 ＝ 合計距離 ÷ 合計時間。<br><strong>${totalDistance}km ÷ (${totalTime}/60)時間 = ${correctSpeed}km/時</strong>`
        ]
    };
}
