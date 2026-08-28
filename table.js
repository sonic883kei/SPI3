/**
 * table.js
 * 単元: ⑨ 表の読み取り
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: buildTableQuestion(level)
 */

        function buildTableQuestion(level) {
            const generateDist = () => {
                const w1 = getRandomInt(15, 30);
                const w2 = getRandomInt(30, 45);
                const w3 = getRandomInt(20, 30);
                const w4 = getRandomInt(5, 20);
                const wSum = w1 + w2 + w3 + w4;

                let r1 = Math.round((w1 / wSum) * 100);
                let r2 = Math.round((w2 / wSum) * 100);
                let r3 = Math.round((w3 / wSum) * 100);
                let r4 = 100 - (r1 + r2 + r3);

                return [r1, r2, r3, r4];
            };
            const maleDist = generateDist();
            const femaleDist = generateDist();

            const maleTotal = getRandomInt(3, 6) * 50;
            const femaleTotal = getRandomInt(3, 6) * 50; 
            const grandTotal = maleTotal + femaleTotal;

            const tableHtml = `
                <div class="overflow-x-auto my-3">
                    <table class="w-full text-xs text-center border-collapse border border-slate-700 bg-[#0f1423]">
                        <thead>
                            <tr class="bg-slate-800 text-slate-300 border-b border-slate-700">
                                <th class="p-2 border border-slate-700">得点</th>
                                <th class="p-2 border border-slate-700">男子生徒 (%)</th>
                                <th class="p-2 border border-slate-700">女子生徒 (%)</th>
                            </tr>
                        </thead>
                        <tbody class="text-slate-200">
                            <tr><td class="p-1.5 border border-slate-700 font-mono">76 ～</td><td class="p-1.5 border border-slate-700">${maleDist[0]}</td><td class="p-1.5 border border-slate-700">${femaleDist[0]}</td></tr>
                            <tr><td class="p-1.5 border border-slate-700 font-mono">51 ～ 75</td><td class="p-1.5 border border-slate-700">${maleDist[1]}</td><td class="p-1.5 border border-slate-700">${femaleDist[1]}</td></tr>
                            <tr><td class="p-1.5 border border-slate-700 font-mono">26 ～ 50</td><td class="p-1.5 border border-slate-700">${maleDist[2]}</td><td class="p-1.5 border border-slate-700">${femaleDist[2]}</td></tr>
                            <tr><td class="p-1.5 border border-slate-700 font-mono">～ 25</td><td class="p-1.5 border border-slate-700">${maleDist[3]}</td><td class="p-1.5 border border-slate-700">${femaleDist[3]}</td></tr>
                            <tr class="bg-slate-800/50 font-bold"><td class="p-1.5 border border-slate-700">合計</td><td class="p-1.5 border border-slate-700">100</td><td class="p-1.5 border border-slate-700">100</td></tr>
                        </tbody>
                    </table>
                </div>
            `;

            if (level === 1) {
                const male76Count = Math.round(maleTotal * (maleDist[0] / 100));
                
                return {
                    unit: '表の読み取り', level: 1,
                    badge: 'Lv.1 基本', title: '構成比からの人数計算',
                    text: `下の表はある学年のテストの得点を男女別に整理したものである。男子生徒は ${maleTotal}名、女子生徒は ${femaleTotal}名 である。<br>${tableHtml}`,
                    prompt: '76点以上の男子生徒は何人か。',
                    correctAnswer: male76Count, unitSuffix: '人', step: 5,
                    steps: [
                        `ステップ1：表から「76点以上」の男子の割合を確認します（<strong>${maleDist[0]}%</strong>）。`,
                        `ステップ2：男子全体の人数（${maleTotal}人）に割合を掛けます。`,
                        `ステップ3：<strong>${maleTotal} × ${(maleDist[0] / 100).toFixed(2)} = ${male76Count}人</strong> となります。`
                    ]
                };
            } else if (level === 2) {
                const maleCount = Math.round(maleTotal * (maleDist[0] / 100));
                const femaleCount = Math.round(femaleTotal * (femaleDist[0] / 100));
                const combinedCount = maleCount + femaleCount;
                
                const exactPct = (combinedCount / grandTotal) * 100;
                const roundedPct = Math.round(exactPct * 10) / 10;

                const choices = [];
                const baseValues = [
                    roundedPct,
                    Math.round((roundedPct - 1.2) * 10) / 10,
                    Math.round((roundedPct + 0.8) * 10) / 10,
                    Math.round((roundedPct + 1.5) * 10) / 10
                ].sort((a, b) => a - b);

                baseValues.forEach((val, i) => {
                    choices.push({
                        label: String.fromCharCode(65 + i),
                        value: val,
                        htmlText: `${val.toFixed(1)}%`,
                        isCorrect: val === roundedPct
                    });
                });
                choices.push({ label: 'E', value: -1, htmlText: 'いずれでもない', isCorrect: false });

                return {
                    unit: '表の読み取り', level: 2,
                    badge: 'Lv.2 応用', title: '全体における構成比（加重平均）',
                    text: `下の表はある学年のテストの得点を男女別に整理したものであり、男子生徒は ${maleTotal}名、女子生徒は ${femaleTotal}名 である。表の中の数字は%である。<br>${tableHtml}`,
                    prompt: '76点以上の男子生徒、女子生徒を合わせた人数は学年の生徒数全体の何%か。（必要なときは最後に小数点以下第2位を四捨五入すること）',
                    customChoices: choices,
                    steps: [
                        `ステップ1：76点以上の人数を男女別に求めます。<br>・男子：${maleTotal} × ${(maleDist[0]/100).toFixed(2)} = <strong>${maleCount}人</strong><br>・女子：${femaleTotal} × ${(femaleDist[0]/100).toFixed(2)} = <strong>${femaleCount}人</strong>`,
                        `ステップ2：合算した人数と、学年全体の人数（${maleTotal} + ${femaleTotal} = ${grandTotal}人）を求めます。<br>・合計人数：${maleCount} + ${femaleCount} = <strong>${combinedCount}人</strong>`,
                        `ステップ3：全体に対する割合を計算し、四捨五入します。<br>・${combinedCount} ÷ ${grandTotal} = ${(exactPct/100).toFixed(4)}... ⇒ <strong>${roundedPct}%</strong>`
                    ]
                };
            } else {
                const maleCount = Math.round(maleTotal * ((maleDist[0] + maleDist[1]) / 100));
                const femaleCount = Math.round(femaleTotal * ((femaleDist[0] + femaleDist[1]) / 100));
                const combinedCount = maleCount + femaleCount;
                const exactPct = (combinedCount / grandTotal) * 100;
                const roundedPct = Math.round(exactPct * 10) / 10;

                const choices = [];
                const baseValues = [
                    roundedPct,
                    Math.round((roundedPct - 1.5) * 10) / 10,
                    Math.round((roundedPct + 1.2) * 10) / 10,
                    Math.round((roundedPct + 2.1) * 10) / 10
                ].sort((a, b) => a - b);

                baseValues.forEach((val, i) => {
                    choices.push({
                        label: String.fromCharCode(65 + i),
                        value: val,
                        htmlText: `${val.toFixed(1)}%`,
                        isCorrect: val === roundedPct
                    });
                });
                choices.push({ label: 'E', value: -1, htmlText: 'いずれでもない', isCorrect: false });

                return {
                    unit: '表の読み取り', level: 3,
                    badge: 'Lv.3 高難度', title: '複数区間の合成割合計算',
                    text: `下の表はある学年のテストの得点を男女別に整理したものであり、男子生徒は ${maleTotal}名、女子生徒は ${femaleTotal}名 である。<br>${tableHtml}`,
                    prompt: '51点以上（76点以上＋51〜75点）の生徒全員を合わせた人数は学年全体の何%か。（小数点以下第2位を四捨五入）',
                    customChoices: choices,
                    steps: [
                        `ステップ1：男子・女子それぞれの「51点以上」の割合を合算します。<br>・男子：${maleDist[0]}% + ${maleDist[1]}% = <strong>${maleDist[0]+maleDist[1]}%</strong><br>・女子：${femaleDist[0]}% + ${femaleDist[1]}% = <strong>${femaleDist[0]+femaleDist[1]}%</strong>`,
                        `ステップ2：実人数を求めます。<br>・男子：${maleTotal} × ${((maleDist[0]+maleDist[1])/100).toFixed(2)} = <strong>${maleCount}人</strong><br>・女子：${femaleTotal} × ${((femaleDist[0]+femaleDist[1])/100).toFixed(2)} = <strong>${femaleCount}人</strong>`,
                        `ステップ3：全体（${grandTotal}人）に対する割合を求めます。<br>・(${maleCount} + ${femaleCount}) ÷ ${grandTotal} = <strong>${roundedPct}%</strong>`
                    ]
                };
            }
        }

