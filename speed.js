/**
 * speed.js
 * 単元: ⑤ 速さ①
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genSpeed1, genSpeed2, genSpeed3
 *
 * 2026-08改訂: 各レベルに2種類ずつのバリエーションを持たせる構成に変更。
 *   レベル1：出会い算 / 追いつき旅人算
 *   レベル2：流水算 / 通過算（旧レベル3から移動）
 *   レベル3：速さの相当算（比の逆比） / 周回の出会いと追い越し（新規）
 *   ※旧レベル2にあった「往復の平均速度」は、新構成のテーマに合わないため統合対象から外している。
 *   ※分岐に Math.random() が直書きされていたのを getRand() に統一（CBT日付同期モードの再現性を確保するため）。
 */

function genSpeed1() {
    const useCatchUp = getRand() < 0.5;

    if (!useCatchUp) {
        // バリエーション1：出会い算
        const hours = getRandomInt(2, 5);
        const speedA = getRandomInt(50, 80);
        const speedB = getRandomInt(30, 50);
        const sumSpeed = speedA + speedB;
        const distance = sumSpeed * hours;

        return {
            unit: '速さ', level: 1, badge: 'Lv.1 基本', title: '出会い算の基本',
            text: `${distance}km 離れた地点から、Aは時速 ${speedA}km、Bは時速 ${speedB}km で互いに向かって同時に出発した。`,
            prompt: '2人が出会うのは出発してから何時間後か。',
            correctAnswer: hours,
            unitSuffix: '時間後',
            step: 1,
            steps: [
                `ステップ1：2人の合算の速さ（1時間に縮まる距離）を求める。<br><strong>${speedA}km/h + ${speedB}km/h = ${sumSpeed}km/h</strong>`,
                `ステップ2：全体の距離を合算の速さで割る。<br><strong>${distance}km ÷ ${sumSpeed}km/h = ${hours}時間後</strong>`
            ]
        };
    } else {
        // バリエーション2：追いつき旅人算
        const diffMinutes = [10, 15, 20, 30][getRandomInt(0, 3)];
        const speedWalk = 60;
        const leadDistance = speedWalk * diffMinutes;
        const catchTime = [10, 15, 20, 30][getRandomInt(0, 3)];
        const speedDiff = leadDistance / catchTime;
        const speedRun = speedWalk + speedDiff;

        return {
            unit: '速さ', level: 1, badge: 'Lv.1 基本', title: '追いつき旅人算',
            text: `Aが分速 ${speedWalk}m で出発した ${diffMinutes}分 後に、Bが同じ地点から分速 ${speedRun}m でAを追いかけた。`,
            prompt: 'Bが出発してから何分後にAに追いつくか。',
            correctAnswer: catchTime,
            unitSuffix: '分後',
            step: 1,
            steps: [
                `ステップ1：Bが出発するまでにAが進んだ距離（差）を求める。<br><strong>${speedWalk}m/分 × ${diffMinutes}分 = ${leadDistance}m</strong>`,
                `ステップ2：1分間にBがAとの距離を縮める速さ（差）を求める。<br><strong>${speedRun}m/分 - ${speedWalk}m/分 = ${speedDiff}m/分</strong>`,
                `ステップ3：追いつくのにかかる時間を求める。<br><strong>${leadDistance}m ÷ ${speedDiff}m/分 = ${catchTime}分後</strong>`
            ]
        };
    }
}

function genSpeed2() {
    const useTunnel = getRand() < 0.5;

    if (!useTunnel) {
        // バリエーション1：流水算
        const fixedBoat = 15;
        const fixedStream = 3;
        const fixedDown = 18;
        const fixedUp = 12;
        const fixedDistance = 36;

        return {
            unit: '速さ', level: 2, badge: 'Lv.2 応用', title: '流水算（川の上り下り）',
            text: `川に沿って ${fixedDistance}km 離れた2地点がある。静水での速さが時速 ${fixedBoat}km の船が、川を下るのに ${fixedDistance / fixedDown}時間 かかった。`,
            prompt: 'この船が同じ区間を上るのにかかる時間は何時間か。',
            correctAnswer: fixedDistance / fixedUp,
            unitSuffix: '時間',
            step: 0.5,
            steps: [
                `ステップ1：川の下りの速さと、川の流速を求める。<br>下りの実質速さ：<strong>${fixedDistance}km ÷ ${fixedDistance / fixedDown}時間 = ${fixedDown}km/h</strong><br>川の流速：<strong>${fixedDown}km/h - ${fixedBoat}km/h = ${fixedStream}km/h</strong>`,
                `ステップ2：川の上りの実質速さを求める。<br><strong>${fixedBoat}km/h - ${fixedStream}km/h = ${fixedUp}km/h</strong>`,
                `ステップ3：上りにかかる時間を求める。<br><strong>${fixedDistance}km ÷ ${fixedUp}km/h = ${fixedDistance / fixedUp}時間</strong>`
            ]
        };
    } else {
        // バリエーション2：通過算
        const trainLength = [100, 120, 150, 200][getRandomInt(0, 3)];
        const tunnelLength = [800, 1000, 1200][getRandomInt(0, 2)];
        const totalDistance = trainLength + tunnelLength;
        const speedMps = [20, 25][getRandomInt(0, 1)];
        const speedKmh = speedMps * 3.6;
        const seconds = totalDistance / speedMps;

        return {
            unit: '速さ', level: 2, badge: 'Lv.2 応用', title: '通過算（列車とトンネル）',
            text: `長さ ${trainLength}m の列車が、時速 ${speedKmh}km で走り、長さ ${tunnelLength}m のトンネルに入り始めてから完全に抜け出るまで進む。`,
            prompt: 'トンネルを完全に抜け出るまでに何秒かかるか。',
            correctAnswer: seconds,
            unitSuffix: '秒',
            step: 1,
            steps: [
                `ステップ1：時速を秒速に変換する。<br><strong>${speedKmh}km/h ÷ 3.6 = ${speedMps}m/秒</strong>`,
                `ステップ2：列車が完全に抜け出るまでに進む総距離を求める。<br><strong>トンネルの長さ ${tunnelLength}m + 列車の長さ ${trainLength}m = ${totalDistance}m</strong>`,
                `ステップ3：総距離を秒速で割って通過時間を計算する。<br><strong>${totalDistance}m ÷ ${speedMps}m/秒 = ${seconds}秒</strong>`
            ]
        };
    }
}

function genSpeed3() {
    const useCircuit = getRand() < 0.5;

    if (!useCircuit) {
        // バリエーション1：速さの相当算（速さの比の逆比＝時間の比を使う）
        const speedWalk = [50, 60, 70, 80][getRandomInt(0, 3)];
        const ratioK = getRandomInt(3, 6); // 自転車の速さは徒歩のk倍
        const speedBike = speedWalk * ratioK;
        const bikeTime = getRandomInt(2, 6); // 自転車でかかる時間（比の1に相当）
        const walkTime = bikeTime * ratioK;
        const timeDiff = walkTime - bikeTime; // 徒歩と自転車の所要時間差
        const lateMinutes = getRandomInt(1, timeDiff - 1);
        const earlyMinutes = timeDiff - lateMinutes;
        const distance = speedBike * bikeTime;

        return {
            unit: '速さ', level: 3, badge: 'Lv.3 高難度', title: '速さの相当算（比を使った時間差）',
            text: `電車に乗るために、歩いて駅まで行くと ${lateMinutes}分 遅れるので、自転車で行ったところ、電車が発車する ${earlyMinutes}分前 に着いた。歩く速さは毎分 ${speedWalk}m、自転車の速さは毎分 ${speedBike}m である。`,
            prompt: '家から駅までの距離は何mか。',
            correctAnswer: distance,
            unitSuffix: 'm',
            step: 20,
            steps: [
                `ステップ1：速さの比を求める。<br><strong>歩き : 自転車 = ${speedWalk} : ${speedBike} = 1 : ${ratioK}</strong>`,
                `ステップ2：速さの比の逆比が時間の比になる。<br><strong>歩き : 自転車の時間の比 = ${ratioK} : 1</strong>`,
                `ステップ3：時間の差を求め、比の1あたりの時間（＝自転車でかかる時間）を求める。<br>時間の差：<strong>${lateMinutes}分 + ${earlyMinutes}分 = ${timeDiff}分</strong>（比の ${ratioK}-1=${ratioK - 1} にあたる）<br>自転車の時間：<strong>${timeDiff}分 ÷ ${ratioK - 1} = ${bikeTime}分</strong>`,
                `ステップ4：距離を求める。<br><strong>${speedBike}m/分 × ${bikeTime}分 = ${distance}m</strong>`
            ]
        };
    } else {
        // バリエーション2：周回の出会いと追い越し（連立方程式）
        let speedA, speedB, meetInterval, sumKmh, diffKmh, catchUpTime;
        let attempts = 0;
        do {
            attempts++;
            speedA = getRandomInt(15, 40);
            speedB = getRandomInt(15, 40);
            meetInterval = getRandomInt(1, 3);
            sumKmh = speedA + speedB;
            diffKmh = Math.abs(speedA - speedB);
            catchUpTime = diffKmh > 0 ? (sumKmh * meetInterval) / diffKmh : NaN;
        } while (
            (diffKmh === 0 || sumKmh % 3 !== 0 || !Number.isInteger(catchUpTime) || catchUpTime <= 0 || catchUpTime > 60)
            && attempts < 300
        );
        if (!Number.isInteger(catchUpTime) || catchUpTime <= 0) {
            // 保険（理論上ほぼ到達しない）
            speedA = 26; speedB = 22; meetInterval = 1; sumKmh = 48; diffKmh = 4; catchUpTime = 12;
        }
        if (speedA < speedB) [speedA, speedB] = [speedB, speedA];

        const sumMpm = Math.round(sumKmh * 50 / 3);
        const circumference = sumMpm * meetInterval;

        return {
            unit: '速さ', level: 3, badge: 'Lv.3 高難度', title: '周回の出会いと追い越し（連立）',
            text: `A、Bの2人は、それぞれAは毎時 ${speedA}km、Bは毎時 ${speedB}km の速さで同時に出発し、円形のトラックを逆方向に自転車で回ったところ、${meetInterval}分ごとにAとBが出会った。`,
            prompt: 'この2人が同時に同方向に出発すると、最初に1周差がつくまでの時間は何分後か。',
            correctAnswer: catchUpTime,
            unitSuffix: '分後',
            step: 1,
            steps: [
                `ステップ1：逆方向に進むときの相対速度（分速）を求め、トラック1周の長さを求める。<br>相対速度：<strong>(${speedA}+${speedB})km/h × 1000m ÷ 60分 = ${sumMpm}m/分</strong><br>1周の長さ：<strong>${sumMpm}m/分 × ${meetInterval}分 = ${circumference}m</strong>`,
                `ステップ2：同方向のときと逆方向のときの相対速度の比を使う。<br><strong>同方向の相対速度 : 逆方向の相対速度 ＝ ${diffKmh} : ${sumKmh}</strong>`,
                `ステップ3：かかる時間は相対速度に反比例するので、比を使って1周差がつく時間を求める。<br><strong>${meetInterval}分 × (${sumKmh} ÷ ${diffKmh}) = ${catchUpTime}分後</strong>`
            ]
        };
    }
}
