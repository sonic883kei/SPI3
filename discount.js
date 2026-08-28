/**
 * discount.js
 * 単元: ③ 料金割引
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genDiscount1, genDiscount2, genDiscount3
 */

        function genDiscount1() {
            const rate = [10, 20, 25, 30, 40, 50][getRandomInt(0, 5)];
            const original = getRandomInt(20, 90) * 100;
            const discounted = Math.round(original * (1 - rate / 100));

            return {
                unit: '料金割引', level: 1, badge: 'Lv.1 基本', title: '定価の割引計算',
                text: `定価 ${original.toLocaleString()}円 の商品が、セールで ${rate}% 引きで販売されている。`,
                prompt: '割引後の販売価格はいくらか。', correctAnswer: discounted, unitSuffix: '円', step: 100,
                steps: [
                    `ステップ1：割引後価格の割合を掛ける。<br><strong>${original.toLocaleString()} × (1 - ${rate/100}) = ${discounted.toLocaleString()}円</strong>`
                ]
            };
        }

        function genDiscount2() {
            const basePrice = getRandomInt(4, 8) * 100;
            const discountRate = [20, 25, 30, 50][getRandomInt(0, 3)];
            const planAPrice = Math.round(basePrice * (1 - discountRate / 100));
            const breakevenTimes = getRandomInt(3, 6); 
            const diffPrice = basePrice - planAPrice;
            const passFee = diffPrice * breakevenTimes;
            const correctAnswerVal = breakevenTimes + 1;

            return {
                unit: '料金割引', level: 2, badge: 'Lv.2 応用', title: 'プラン比較と損益分岐点',
                text: `ある施設では、通常1回 ${basePrice.toLocaleString()}円 の利用料がかかる。<br>` +
                      `【プランA】年会費無料で、1回あたりの利用料が ${discountRate}% 引き（${planAPrice.toLocaleString()}円）になる。<br>` +
                      `【プランB】月額パス ${passFee.toLocaleString()}円 を購入すると、何度利用しても1回あたりの利用料は 0円 になる。`,
                prompt: '月に何回以上利用する場合、プランBの方がプランAよりも支払総額が安くなるか。',
                correctAnswer: correctAnswerVal,
                unitSuffix: '回以上',
                step: 1,
                steps: [
                    `ステップ1：プランBがプランAよりも安くなる損益分岐点を計算する。<br><strong>月額パス費用 ÷ 1回あたりの差額 ＝ ${breakevenTimes}回</strong>`,
                    `ステップ2：したがって、<strong>${correctAnswerVal}回以上</strong>利用する場合にプランBの方がお得になる。`
                ]
            };
        }

        function genDiscount3() {
            const original = getRandomInt(50, 100) * 100;
            const firstRate = [10, 20][getRandomInt(0, 1)];
            const intermediate = Math.round(original * (1 - firstRate / 100));
            const secondRate = [10, 20, 25][getRandomInt(0, 2)];
            const finalPrice = Math.round(intermediate * (1 - secondRate / 100));

            return {
                unit: '料金割引', level: 3, badge: 'Lv.3 高難度', title: '連続割引の計算',
                text: `定価 ${original.toLocaleString()}円 の商品に、まず ${firstRate}% 引きのセールを行い、さらに会員カード提示でその価格から ${secondRate}% 引きを適用した。`,
                prompt: '最終的な販売価格はいくらか。', correctAnswer: finalPrice, unitSuffix: '円', step: 100,
                steps: [
                    `ステップ1：1回目の割引後の価格を求める。<br><strong>${original.toLocaleString()} × (1 - ${firstRate/100}) = ${intermediate.toLocaleString()}円</strong>`,
                    `ステップ2：2回目の割引を適用して最終価格を求める。<br><strong>${intermediate.toLocaleString()} × (1 - ${secondRate/100}) = ${finalPrice.toLocaleString()}円</strong>`
                ]
            };
        }

        // --- ④ 分割払い ---
