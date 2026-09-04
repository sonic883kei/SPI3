/**
 * settlement.js
 * 単元: ② 代金清算
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genSettlement1, genSettlement2, genSettlement3
 */

/**
 * Lv.1（基本）：均等割り勘、または複数立替清算のいずれかをランダム選択
 */
function genSettlement1() {
    const isVar2 = getRand() < 0.5;

    if (!isVar2) {
        // バリエーションA：複数商品の均等割り勘
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
    } else {
        // バリエーションB：複数人の立替えと均等清算
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
            unit: '代金清算', level: 1, badge: 'Lv.1 基本', title: '複数人の立替えと均等清算',
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
}

/**
 * Lv.2（応用）：負担額が等しくない割り勘（不均等割り勘）
 */
function genSettlement2() {
    const isVar2 = getRand() < 0.5;

    if (!isVar2) {
        // バリエーションA：例題3形式（主催者Pが半額負担、残り2人で均等負担）
        const paidP = getRandomInt(80, 120) * 100;
        const paidQ = getRandomInt(20, 40) * 100;
        const paidR = getRandomInt(15, 30) * 100;
        const total = paidP + paidQ + paidR;

        const costP = total / 2;
        const costQR = (total - costP) / 2;
        const pReceive = paidP - costP;

        return {
            unit: '代金清算', level: 2, badge: 'Lv.2 応用', title: '負担額が等しくない清算（半額負担）',
            text: `P, Q, Rの3人で遊園地に行った。パスポート代としてPが ${paidP.toLocaleString()}円、電車賃としてQが ${paidQ.toLocaleString()}円、レストラン代としてRが ${paidR.toLocaleString()}円 支払った。<br>` +
                  `本日はPが誘ったのでPが全体の半額を負担し、残りをQとRで均等に支払うこととした。`,
            prompt: 'RがPに支払う金額はいくらか。',
            correctAnswer: pReceive,
            unitSuffix: '円',
            step: 50,
            steps: [
                `ステップ1：全額の合計を求める。<br><strong>${paidP.toLocaleString()} + ${paidQ.toLocaleString()} + ${paidR.toLocaleString()} = ${total.toLocaleString()}円</strong>`,
                `ステップ2：各自の本来負担額を求める。<br>` +
                `・Pの負担額：${total.toLocaleString()} ÷ 2 = <strong>${costP.toLocaleString()}円</strong><br>` +
                `・Q, Rの負担額：(${total.toLocaleString()} - ${costP.toLocaleString()}) ÷ 2 = <strong>${costQR.toLocaleString()}円</strong>`,
                `ステップ3：Pの支払い超過額（受給額）を求める。<br>Pは ${paidP.toLocaleString()}円 支払っているので、<strong>${paidP.toLocaleString()} - ${costP.toLocaleString()} = ${pReceive.toLocaleString()}円</strong> 払い過ぎている。<br>` +
                `したがって、RからPへ支払う金額は <strong>${pReceive.toLocaleString()}円</strong> となる。`
            ]
        };
    } else {
        // バリエーションB：比率指定の傾斜割り勘（割合指定）
        const perShare = getRandomInt(10, 20) * 100;
        const total = perShare * 10;
        const paidP = Math.round(total * 0.6);
        const paidQ = Math.round(total * 0.3);
        const paidR = total - paidP - paidQ;

        const costR = total * 0.3;
        const rDiff = costR - paidR;

        return {
            unit: '代金清算', level: 2, badge: 'Lv.2 応用', title: '負担額が等しくない清算（割合指定）',
            text: `P, Q, Rの3人で旅行に行き、費用総額は ${total.toLocaleString()}円 であった。立替額はPが ${paidP.toLocaleString()}円、Qが ${paidQ.toLocaleString()}円、Rが ${paidR.toLocaleString()}円 であった。<br>` +
                  `費用はPが全体の 40％、QとRがそれぞれ 30％ ずつ負担することとした。`,
            prompt: 'Rの精算に必要な支払額（不足額）はいくらか。',
            correctAnswer: rDiff,
            unitSuffix: '円',
            step: 100,
            steps: [
                `ステップ1：Rの本来負担すべき額を計算する。<br><strong>${total.toLocaleString()}円 × 30％ = ${costR.toLocaleString()}円</strong>`,
                `ステップ2：Rの実際の立替額との差額を計算する。<br><strong>${costR.toLocaleString()}円 - ${paidR.toLocaleString()}円 = ${rDiff.toLocaleString()}円</strong>`
            ]
        };
    }
}

/**
 * Lv.3（高難度）：共同費用＋個人立替、または支払＋借金清算のいずれかをランダム選択
 */
function genSettlement3() {
    const isVar2 = getRand() < 0.5;

    if (!isVar2) {
        // バリエーションA（元々のLv.3）：共同費用と個人立替の複合清算
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
    } else {
        // バリエーションB（新規追加）：支払額と借金の複合清算（例題6形式）
        const debtRP = getRandomInt(10, 20) * 100;
        const debtQR = getRandomInt(5, 15) * 100;
        const debtQP = getRandomInt(5, 15) * 100;

        const mealCost = getRandomInt(15, 25) * 100;

        const netR = -debtRP + debtQR;
        const rPay = mealCost - netR;

        return {
            unit: '代金清算', level: 3, badge: 'Lv.3 高難度', title: '支払額と借金の複合清算',
            text: `RはPに対して ${debtRP.toLocaleString()}円 の借金があり、QはRに対して ${debtQR.toLocaleString()}円、Pに対して ${debtQP.toLocaleString()}円 の借金がある。<br>` +
                  `ある日、3人で一人 ${mealCost.toLocaleString()}円 の食事に行って、3人の貸し借りがなくなるように支払う場合、Rの支払額はいくらになるか。`,
            prompt: 'Rの支払額はいくらか。',
            correctAnswer: rPay,
            unitSuffix: '円',
            step: 100,
            steps: [
                `ステップ1：各自の借金（貸し借り）の差引を計算する。<br>` +
                `・RはPに ${debtRP.toLocaleString()}円 借りており、Qから ${debtQR.toLocaleString()}円 貸している。<br>` +
                `・Rの純借金 ＝ <strong>${debtRP.toLocaleString()} - ${debtQR.toLocaleString()} = ${Math.abs(netR).toLocaleString()}円 (${netR < 0 ? '不足・返済が必要' : '余剰・回収可能'})</strong>`,
                `ステップ2：食事代 ${mealCost.toLocaleString()}円 に過去の貸し借りを合算する。<br>` +
                `・Rの負担：食事代 ${mealCost.toLocaleString()}円 ＋ 借金精算分 ${Math.abs(netR).toLocaleString()}円 ＝ <strong>${rPay.toLocaleString()}円</strong>`
            ]
        };
    }
}