/**
 * profit.js
 * 単元: ⑥ 損益算
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genProfit1, genProfit2, genProfit3
 */

        function genProfit1() {
            const cost = getRandomInt(1000, 5000);
            const markup = [20, 25, 30, 40][getRandomInt(0, 3)];
            const price = Math.round(cost * (1 + markup / 100));

            return {
                unit: '損益算', level: 1, badge: 'Lv.1 基本', title: '原価と定価・利益',
                text: `ある品物に原価の ${markup}% の利益を見込んで定価をつけることにした。`,
                prompt: `原価が ${cost.toLocaleString()}円 のとき、定価はいくらになるか。`, correctAnswer: price, unitSuffix: '円', step: 100,
                steps: [
                    `ステップ1：定価を計算する。<br><strong>${cost.toLocaleString()}円 × (1 + ${markup/100}) = ${price.toLocaleString()}円</strong>`
                ]
            };
        }

        function genProfit2() {
            const cost = getRandomInt(1, 5) * 100;
            const markupRate = [20, 30, 40, 50][getRandomInt(0, 3)];
            const listPrice = Math.round(cost * (1 + markupRate / 100));
            const totalCount = 100;
            const totalCost = cost * totalCount;
            const regularRatio = [60, 70, 80][getRandomInt(0, 2)];
            const regularCount = totalCount * (regularRatio / 100);
            const discountCount = totalCount - regularCount;
            const discountRate = [10, 20, 30][getRandomInt(0, 2)];
            const discountPrice = Math.round(listPrice * (1 - discountRate / 100));
            const salesRegular = listPrice * regularCount;
            const salesDiscount = discountPrice * discountCount;
            const totalSales = salesRegular + salesDiscount;
            const totalProfit = totalSales - totalCost;

            return {
                unit: '損益算', level: 2, badge: 'Lv.2 応用', title: '定価と割引での分割販売',
                text: `1個 ${cost.toLocaleString()}円 で仕入れた商品を ${totalCount}個 用意し、原価の ${markupRate}% の利益を見込んで定価をつける。<br>` +
                      `全体の ${regularRatio}%（${regularCount}個）は定価で売れ、残りの ${discountCount}個 は定価の ${discountRate}% 引きで販売した。`,
                prompt: 'この商品の販売による全体での利益額はいくらか。',
                correctAnswer: totalProfit,
                unitSuffix: '円',
                step: 100,
                steps: [
                    `ステップ1：定価と割引売価をそれぞれ求める。<br>定価：<strong>${cost}円 × (1 + ${markupRate/100}) = ${listPrice.toLocaleString()}円</strong><br>割引売価：<strong>${listPrice}円 × (1 - ${discountRate/100}) = ${discountPrice.toLocaleString()}円</strong>`,
                    `ステップ2：定価販売と割引販売の合計売上額を計算する。<br>定価売上：<strong>${listPrice.toLocaleString()}円 × ${regularCount}個 = ${salesRegular.toLocaleString()}円</strong><br>割引売上：<strong>${discountPrice.toLocaleString()}円 × ${discountCount}個 = ${salesDiscount.toLocaleString()}円</strong><br>売上総額：<strong>${totalSales.toLocaleString()}円</strong>`,
                    `ステップ3：売上総額から総仕入れ額（原価）を引いて総利益を求める。<br>総仕入れ額：<strong>${cost}円 × ${totalCount}個 = ${totalCost.toLocaleString()}円</strong><br>利益：<strong>${totalSales.toLocaleString()}円 - ${totalCost.toLocaleString()}円 = ${totalProfit.toLocaleString()}円</strong>`
                ]
            };
        }

        function genProfit3() {
            const totalCount = 100;
            const regularCount = 70;
            const discountCount = 30;
            const markupRate = 50; 
            const patterns = [
                { targetProfitPercent: 41, discountRate: 20, discountPriceRatio: 1.2 },
                { targetProfitPercent: 32, discountRate: 40, discountPriceRatio: 0.9 }
            ];
            const selected = patterns[getRandomInt(0, patterns.length - 1)];

            return {
                unit: '損益算', level: 3, badge: 'Lv.3 高難度', title: '目標利益からの割引率の逆算',
                text: `ある商品を原価の ${markupRate}% の利益を見込んで定価をつけて販売した。<br>` +
                      `仕入れた個数の ${regularCount}% が定価で売れたため、残りの ${discountCount}% を定価から一定の割合で割り引いてすべて売り切った。<br>` +
                      `その結果、全体として仕入れ総額の ${selected.targetProfitPercent}% の利益を得ることができた。`,
                prompt: '売れ残りを定価の何%引きで販売したか。',
                correctAnswer: selected.discountRate,
                unitSuffix: '%引き',
                step: 5,
                steps: [
                    `ステップ1：商品1個の原価を100とし、全体量を100個として計算する。<br>仕入れ総額：<strong>100 × 100 = 10,000</strong><br>定価：<strong>100 × (1 + 0.5) = 150</strong>`,
                    `ステップ2：全体で得た売上目標額と、定価で売れた分の売上額を求める。<br>目標売上総額：<strong>10,000 × (1 + ${selected.targetProfitPercent/100}) = ${(10000 * (1 + selected.targetProfitPercent/100)).toLocaleString()}</strong><br>定価分の売上：<strong>150 × ${regularCount}個 = ${(150 * regularCount).toLocaleString()}</strong>`,
                    `ステップ3：残りの ${discountCount}個 で必要な売上額と、その1個あたりの販売価格を求める。<br>残り分の売上額：<strong>${(10000 * (1 + selected.targetProfitPercent/100)).toLocaleString()} - ${(150 * regularCount).toLocaleString()} = ${(10000 * (1 + selected.targetProfitPercent/100) - 150 * regularCount).toLocaleString()}</strong><br>割引後の売価：<strong>${(10000 * (1 + selected.targetProfitPercent/100) - 150 * regularCount).toLocaleString()} ÷ ${discountCount}個 = ${100 * selected.discountPriceRatio}</strong>`,
                    `ステップ4：定価（150）に対する割引率を算出する。<br><strong>(150 - ${100 * selected.discountPriceRatio}) ÷ 150 = ${selected.discountRate / 100} （${selected.discountRate}%引き）</strong>`
                ]
            };
        }

        // --- ⑦ 場合の数・確率 ---
