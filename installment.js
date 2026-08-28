/**
 * installment.js
 * 単元: ④ 分割払い
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genInstallment1, genInstallment2, genInstallment3
 */

        function genInstallment1() {
            const months = [6, 10, 12][getRandomInt(0, 2)];
            const monthly = getRandomInt(5, 15) * 1000;
            const rest = monthly * months;
            const first = getRandomInt(1, 3) * 10000;
            const total = rest + first;

            return {
                unit: '分割払い', level: 1, badge: 'Lv.1 基本', title: '頭金と均等分割払い',
                text: `総額 ${total.toLocaleString()}円 の商品を購入する際、最初に頭金として ${first.toLocaleString()}円 を支払い、残りを ${months}ヶ月 で均等に分割して支払うことになった。`,
                prompt: '毎月の支払額はいくらか。', correctAnswer: monthly, unitSuffix: '円', step: 1000,
                steps: [
                    `ステップ1：残金（分割対象）を求める。<br><strong>${total.toLocaleString()}円 - ${first.toLocaleString()}円 = ${rest.toLocaleString()}円</strong>`,
                    `ステップ2：分割回数で割る。<br><strong>${rest.toLocaleString()}円 ÷ ${months} = ${monthly.toLocaleString()}円</strong>`
                ]
            };
        }

        function genInstallment2() {
            const months = [6, 12][getRandomInt(0, 1)];
            const monthlyBase = getRandomInt(10, 25) * 1000;
            const baseAmount = monthlyBase * months;
            const feeRate = [5, 10][getRandomInt(0, 1)];
            const totalFee = Math.round(baseAmount * (feeRate / 100));
            const totalPayment = baseAmount + totalFee;

            return {
                unit: '分割払い', level: 2, badge: 'Lv.2 応用', title: '手数料込みの分割払い総額',
                text: `現金価格が ${baseAmount.toLocaleString()}円 の商品を分割払いで購入する。${months}ヶ月の分割払いにすると、元金に対して一律 ${feeRate}% の分割手数料が加算される。`,
                prompt: 'このときの分割払いの支払総額はいくらか。', correctAnswer: totalPayment, unitSuffix: '円', step: 1000,
                steps: [
                    `ステップ1：分割手数料を計算する。<br><strong>${baseAmount.toLocaleString()}円 × ${feeRate / 100} = ${totalFee.toLocaleString()}円</strong>`,
                    `ステップ2：現金価格に手数料を足して支払総額を求める。<br><strong>${baseAmount.toLocaleString()}円 + ${totalFee.toLocaleString()}円 = ${totalPayment.toLocaleString()}円</strong>`
                ]
            };
        }

        function genInstallment3() {
            const months = 10;
            const monthly = getRandomInt(8, 15) * 1000;
            const monthlyTotal = monthly * months;
            const bonusTimes = 2;
            const bonusAmount = getRandomInt(3, 6) * 10000;
            const bonusTotal = bonusAmount * bonusTimes;
            const first = getRandomInt(1, 3) * 10000;
            const grandTotal = first + monthlyTotal + bonusTotal;

            return {
                unit: '分割払い', level: 3, badge: 'Lv.3 高難度', title: '頭金・ボーナス併用分割払い',
                text: `総額 ${grandTotal.toLocaleString()}円 の商品を購入する。頭金として ${first.toLocaleString()}円 を支払い、残りを毎月 ${monthly.toLocaleString()}円 ずつ ${months}ヶ月間、およびボーナス月に ${bonusAmount.toLocaleString()}円 を ${bonusTimes}回 支払う計画を立てた。`,
                prompt: 'この計画の分割対象総額（頭金を除く残金）はいくらか。', correctAnswer: (monthlyTotal + bonusTotal), unitSuffix: '円', step: 5000,
                steps: [
                    `ステップ1：月々の支払総額を計算する。<br><strong>${monthly.toLocaleString()}円 × ${months}ヶ月 = ${monthlyTotal.toLocaleString()}円</strong>`,
                    `ステップ2：ボーナス払いの総額を計算する。<br><strong>${bonusAmount.toLocaleString()}円 × ${bonusTimes}回 = ${bonusTotal.toLocaleString()}円</strong>`,
                    `ステップ3：頭金を除く分割対象総額（月賦分 ＋ ボーナス分）を足し合わせる。<br><strong>${monthlyTotal.toLocaleString()}円 + ${bonusTotal.toLocaleString()}円 = ${(monthlyTotal + bonusTotal).toLocaleString()}円</strong>`
                ]
            };
        }

        // --- ⑤ 速さ ---
