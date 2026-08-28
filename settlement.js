/**
 * settlement.js
 * 単元: ② 代金清算
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genSettlement1, genSettlement2, genSettlement3
 */

        function genSettlement1() {
            const priceA = getRandomInt(2, 5) * 100;
            const priceB = getRandomInt(3, 8) * 100;
            const countA = getRandomInt(2, 4);
            const countB = getRandomInt(2, 4);
            const total = (priceA * countA) + (priceB * countB);
            const perPerson = Math.round(total / 4);

            return {
                unit: '代金清算', level: 1, badge: 'Lv.1 基本', title: 'グループの均等割り勘',
                text: `4人のグループで買い物をして、1個 ${priceA}円 の商品Aを ${countA}個、1個 ${priceB}円 の商品Bを ${countB}個 購入した。代金は4人で均等に支払う。`,
                prompt: '1人あたりいくら支払うか。', correctAnswer: perPerson, unitSuffix: '円', step: 100,
                steps: [
                    `ステップ1：全体の代金を計算する。<br><strong>(${priceA} × ${countA}) + (${priceB} × ${countB}) = ${total.toLocaleString()}円</strong>`,
                    `ステップ2：4人で均等に割る。<br><strong>${total.toLocaleString()} ÷ 4 = ${perPerson.toLocaleString()}円</strong>`
                ]
            };
        }

        function genSettlement2() {
            let paidP, paidQ, paidR, perPerson, total;
            let tries = 0;
            do {
                perPerson = getRandomInt(10, 30) * 100;
                total = perPerson * 3;
                paidP = getRandomInt(Math.floor(perPerson / 100) + 5, Math.floor(total / 100) - 5) * 100;
                const remaining = total - paidP;
                paidQ = getRandomInt(1, Math.floor(remaining / 100) - 1) * 100;
                paidR = remaining - paidQ;
                tries++;
            } while ((paidQ > perPerson || paidR > perPerson) && tries < 50);

            const diffQ = paidQ - perPerson;
            const diffR = paidR - perPerson;

            let payerName = 'Q';
            let payerDiff = Math.abs(diffQ);
            if (diffR < diffQ) {
                payerName = 'R';
                payerDiff = Math.abs(diffR);
            }

            return {
                unit: '代金清算', level: 2, badge: 'Lv.2 応用', title: '複数人の立替えと精算',
                text: `P、Q、Rの3人がドライブに行き、かかった費用 ${total.toLocaleString()}円 を等しく分担することにした。` +
                      `立替額は、Pが ${paidP.toLocaleString()}円、Qが ${paidQ.toLocaleString()}円、Rが ${paidR.toLocaleString()}円 であった。`,
                prompt: `${payerName} は P にいくら支払えば清算が完了するか。`,
                correctAnswer: payerDiff,
                unitSuffix: '円',
                step: 100,
                steps: [
                    `ステップ1：1人あたりの本来の負担額を計算する。<br><strong>${total.toLocaleString()}円 ÷ 3 = ${perPerson.toLocaleString()}円</strong>`,
                    `ステップ2：Pの受け取るべき金額（受給額）を求める。<br><strong>${paidP.toLocaleString()}円 - ${perPerson.toLocaleString()}円 = ${(paidP - perPerson).toLocaleString()}円（受け取る）</strong>`,
                    `ステップ3：${payerName} の不足額（支払うべき金額）を求める。<br><strong>${perPerson.toLocaleString()}円 - ${(payerName === 'Q' ? paidQ : paidR).toLocaleString()}円 = ${payerDiff.toLocaleString()}円</strong>`
                ]
            };
        }

        function genSettlement3() {
            const sharedPerPerson = getRandomInt(15, 35) * 100;
            const sharedTotal = sharedPerPerson * 3;
            const personalA = getRandomInt(5, 15) * 100;
            const totalReceipt = sharedTotal + personalA;
            const payAtoB = sharedPerPerson + personalA;

            return {
                unit: '代金清算', level: 3, badge: 'Lv.3 高難度', title: '共同費用と個人立替の複合清算',
                text: `A、B、Cの3人で旅行に行き、レンタカー代などの共同費用 ${sharedTotal.toLocaleString()}円 がかかった。` +
                      `また、途中でAが個人で買い物をした代金 ${personalA.toLocaleString()}円 も含め、会計総額 ${totalReceipt.toLocaleString()}円 をBがまとめて支払った。` +
                      `共同費用は3人で均等に割るものとする。`,
                prompt: 'AはBにいくら支払えばよいか。',
                correctAnswer: payAtoB,
                unitSuffix: '円',
                step: 100,
                steps: [
                    `ステップ1：共同費用の1人あたりの負担額を求める。<br><strong>${sharedTotal.toLocaleString()}円 ÷ 3 = ${sharedPerPerson.toLocaleString()}円</strong>`,
                    `ステップ2：Aが負担すべき総額（共同分 ＋ 個人購入分）を求める。<br><strong>${sharedPerPerson.toLocaleString()}円 + ${personalA.toLocaleString()}円 = ${payAtoB.toLocaleString()}円</strong>`,
                    `ステップ3：Bが全額立て替えているため、Aは負担総額である <strong>${payAtoB.toLocaleString()}円</strong> を直接Bに支払う。`
                ]
            };
        }

        // --- 料金割引 ---
