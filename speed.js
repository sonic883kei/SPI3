/**
 * speed.js
 * 単元: ⑤ 速さ①
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genSpeed1, genSpeed2, genSpeed3
 */

        function genSpeed1() {
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
        }

        function genSpeed2() {
            const isCatchUp = Math.random() < 0.5;

            if (isCatchUp) {
                const diffMinutes = [10, 15, 20, 30][getRandomInt(0, 3)];
                const speedWalk = 60;
                const leadDistance = speedWalk * diffMinutes;
                const catchTime = [10, 15, 20, 30][getRandomInt(0, 3)]; 
                const speedDiff = leadDistance / catchTime;
                const speedRun = speedWalk + speedDiff;

                return {
                    unit: '速さ', level: 2, badge: 'Lv.2 応用', title: '追いつき旅人算',
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
            } else {
                const distance = [60, 120, 180][getRandomInt(0, 2)];
                const speedGoing = 60;
                const speedReturn = 40;
                const timeGoing = distance / speedGoing;
                const timeReturn = distance / speedReturn;
                const totalDistance = distance * 2;
                const totalTime = timeGoing + timeReturn;
                const avgSpeed = totalDistance / totalTime;

                return {
                    unit: '速さ', level: 2, badge: 'Lv.2 応用', title: '往復の平均速度',
                    text: `A地点とB地点の間（片道 ${distance}km）を往復した。行きは時速 ${speedGoing}km、帰りは時速 ${speedReturn}km で走った。`,
                    prompt: '往復の平均の速さは時速何kmか。',
                    correctAnswer: avgSpeed,
                    unitSuffix: 'km/h',
                    step: 1,
                    steps: [
                        `ステップ1：行きと帰りにかかる時間をそれぞれ求める。<br>行き：<strong>${distance}km ÷ ${speedGoing}km/h = ${timeGoing}時間</strong><br>帰り：<strong>${distance}km ÷ ${speedReturn}km/h = ${timeReturn}時間</strong>`,
                        `ステップ2：往復の全距離と合計時間を求める。<br>全距離：<strong>${distance}km × 2 = ${totalDistance}km</strong><br>全時間：<strong>${timeGoing} + ${timeReturn} = ${totalTime}時間</strong>`,
                        `ステップ3：全距離を全時間で割って平均速度を算出する。<br><strong>${totalDistance}km ÷ ${totalTime}時間 = ${avgSpeed}km/h</strong>`
                    ]
                };
            }
        }

        function genSpeed3() {
            const isRiver = Math.random() < 0.5;

            if (isRiver) {
                const fixedBoat = 15;
                const fixedStream = 3;
                const fixedDown = 18;
                const fixedUp = 12;
                const fixedDistance = 36;
                
                return {
                    unit: '速さ', level: 3, badge: 'Lv.3 高難度', title: '流水算（川の上り下り）',
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
                const trainLength = [100, 120, 150, 200][getRandomInt(0, 3)];
                const tunnelLength = [800, 1000, 1200][getRandomInt(0, 2)];
                const totalDistance = trainLength + tunnelLength;
                const speedMps = [20, 25][getRandomInt(0, 1)];
                const speedKmh = speedMps * 3.6;
                const seconds = totalDistance / speedMps;

                return {
                    unit: '速さ', level: 3, badge: 'Lv.3 高難度', title: '通過算（列車とトンネル）',
                    text: `長さ ${trainLength}m の列車が、時速 ${speedKmh}km（秒速 ${speedMps}m）で走り、長さ ${tunnelLength}m のトンネルに入り始めてから完全に抜け出るまで進む。`,
                    prompt: 'トンネルを完全に抜け出るまでに何秒かかるか。',
                    correctAnswer: seconds,
                    unitSuffix: '秒',
                    step: 1,
                    steps: [
                        `ステップ1：列車が完全に抜け出るまでに進む総距離を求める。<br><strong>トンネルの長さ ${tunnelLength}m + 列車の長さ ${trainLength}m = ${totalDistance}m</strong>`,
                        `ステップ2：総距離を秒速で割って通過時間を計算する。<br><strong>${totalDistance}m ÷ ${speedMps}m/秒 = ${seconds}秒</strong>`
                    ]
                };
            }
        }

        // --- ⑥ 損益算 ---
