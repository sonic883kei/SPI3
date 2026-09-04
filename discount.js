/**
 * discount.js
 * 単元: ③ 料金割引
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genDiscount1, genDiscount2, genDiscount3
 *
 * 2026-08改訂: 難易度構成を見直し。
 *   レベル1：定価の割引計算（無変更）
 *   レベル2：プラン比較と損益分岐点／連続割引の計算（2バリエーション、旧Lv3を統合）
 *   レベル3：時間帯別割引の組み合わせ推理／回数券の最安値推理（新規）
 */

// ============================================================
// レベル1（無変更）
// ============================================================

function genDiscount1() {
    const rate = [10, 20, 25, 30, 40, 50][getRandomInt(0, 5)];
    const original = getRandomInt(20, 90) * 100;
    const discounted = Math.round(original * (1 - rate / 100));

    return {
        unit: '料金割引', level: 1, badge: 'Lv.1 基本', title: '定価の割引計算',
        text: `定価 ${original.toLocaleString()}円 の商品が、セールで ${rate}% 引きで販売されている。`,
        prompt: '割引後の販売価格はいくらか。', correctAnswer: discounted, unitSuffix: '円', step: 100,
        steps: [
            `ステップ1：割引後価格の割合を掛ける。<br><strong>${original.toLocaleString()} × (1 - ${rate / 100}) = ${discounted.toLocaleString()}円</strong>`
        ]
    };
}

// ============================================================
// レベル2（2バリエーション：プラン比較 ／ 連続割引）
// ============================================================

function genDiscount2() {
    const useContinuous = getRand() < 0.5;

    if (!useContinuous) {
        // バリエーション1：プラン比較と損益分岐点
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
                  `【プランA】年会費無料で、1回あたりの利用料が ${discountRate}% 引きになる。<br>` +
                  `【プランB】月額パス ${passFee.toLocaleString()}円 を購入すると、何度利用しても1回あたりの利用料は 0円 になる。`,
            prompt: '月に何回以上利用する場合、プランBの方がプランAよりも支払総額が安くなるか。',
            correctAnswer: correctAnswerVal,
            unitSuffix: '回以上',
            step: 1,
            steps: [
                `ステップ1：プランAの1回あたりの利用料を求める。<br><strong>${basePrice.toLocaleString()}円 × (1 - ${discountRate / 100}) = ${planAPrice.toLocaleString()}円</strong>`,
                `ステップ2：プランBがプランAよりも安くなる損益分岐点を計算する。<br><strong>月額パス費用 ÷ 1回あたりの差額 ＝ ${breakevenTimes}回</strong>`,
                `ステップ3：したがって、<strong>${correctAnswerVal}回以上</strong>利用する場合にプランBの方がお得になる。`
            ]
        };
    } else {
        // バリエーション2：連続割引の計算
        const original = getRandomInt(50, 100) * 100;
        const firstRate = [10, 20][getRandomInt(0, 1)];
        const intermediate = Math.round(original * (1 - firstRate / 100));
        const secondRate = [10, 20, 25][getRandomInt(0, 2)];
        const finalPrice = Math.round(intermediate * (1 - secondRate / 100));

        return {
            unit: '料金割引', level: 2, badge: 'Lv.2 応用', title: '連続割引の計算',
            text: `定価 ${original.toLocaleString()}円 の商品に、まず ${firstRate}% 引きのセールを行い、さらに会員カード提示でその価格から ${secondRate}% 引きを適用した。`,
            prompt: '最終的な販売価格はいくらか。', correctAnswer: finalPrice, unitSuffix: '円', step: 100,
            steps: [
                `ステップ1：1回目の割引後の価格を求める。<br><strong>${original.toLocaleString()} × (1 - ${firstRate / 100}) = ${intermediate.toLocaleString()}円</strong>`,
                `ステップ2：2回目の割引を適用して最終価格を求める。<br><strong>${intermediate.toLocaleString()} × (1 - ${secondRate / 100}) = ${finalPrice.toLocaleString()}円</strong>`
            ]
        };
    }
}

// ============================================================
// レベル3（2バリエーション：時間帯別割引の組み合わせ推理 ／ 回数券の最安値推理）※新規
// ============================================================

function genDiscount3() {
    const useTicketBook = getRand() < 0.5;

    if (!useTicketBook) {
        // バリエーション1：時間帯別割引の組み合わせ推理
        let openTime, mid1, mid2, closeTime, H, basePrice, rate1, rate2, rate3;
        let validStarts, totals, trueIdx, trueTotal;
        let attempts = 0;
        let valid = false;

        do {
            attempts++;
            openTime = 8;
            const seg1 = getRandomInt(3, 5), seg2 = getRandomInt(3, 5), seg3 = getRandomInt(2, 4);
            mid1 = openTime + seg1;
            mid2 = mid1 + seg2;
            closeTime = mid2 + seg3;
            H = getRandomInt(3, 6);
            if (closeTime - openTime < H + 3) continue; // 開始候補が少なすぎる場合はやり直す
            basePrice = getRandomInt(15, 30) * 100;
            const rateOptions = [30, 25, 20, 15, 10, 5];
            const shuffled = shuffleArray(rateOptions);
            [rate1, rate2, rate3] = shuffled.slice(0, 3).sort((a, b) => b - a);

            validStarts = [];
            for (let S = openTime; S <= closeTime - H; S++) validStarts.push(S);
            if (validStarts.length < 4) continue;

            totals = validStarts.map(S => {
                let discount = 0;
                for (let h = S; h < S + H; h++) {
                    let rate;
                    if (h < mid1) rate = rate1;
                    else if (h < mid2) rate = rate2;
                    else rate = rate3;
                    discount += basePrice * rate / 100;
                }
                return basePrice * H - discount;
            });

            trueIdx = getRandomInt(0, validStarts.length - 1);
            trueTotal = totals[trueIdx];
            const dupCount = totals.filter(t => t === trueTotal).length;
            valid = (dupCount === 1); // 同じ合計金額になる開始時刻が他にないことを確認(一意性の保証)
        } while (!valid && attempts < 300);

        const trueStart = validStarts[trueIdx];
        const trueEnd = trueStart + H;
        const correctLabel = `①${trueStart}時、②${trueEnd}時`;

        const otherIdxs = validStarts.map((_, i) => i).filter(i => i !== trueIdx);
        // 「いずれでもない」が正解の回は、誤答4つがすべて他の開始時刻から必要になる
        const isNoneCorrect = getRand() < 0.12 && otherIdxs.length >= 4;

        const shuffledOthers = shuffleArray(otherIdxs);
        const distractorCount = isNoneCorrect ? 4 : 3;
        const distractorLabels = shuffledOthers.slice(0, distractorCount)
            .map(i => `①${validStarts[i]}時、②${validStarts[i] + H}時`);

        const choiceLabels = isNoneCorrect
            ? distractorLabels
            : shuffleArray(distractorLabels.concat([correctLabel]));

        const customChoices = choiceLabels.map(label => ({
            value: label, htmlText: label, isCorrect: !isNoneCorrect && label === correctLabel
        }));
        customChoices.push({ value: 'none', htmlText: 'いずれでもない', isCorrect: isNoneCorrect });

        const rateHtml = `${openTime}時から${mid1}時までは${rate1}%引き、${mid1}時から${mid2}時までは${rate2}%引き、${mid2}時以降は${rate3}%引き`;

        return {
            unit: '料金割引', level: 3, badge: 'Lv.3 高難度', title: '時間帯別割引の組み合わせ推理',
            text: `ある貸会議室は${openTime}時から${closeTime}時まで借りることができる。使用料は1時間あたり${basePrice.toLocaleString()}円だが、利用時間によって割引がある。${rateHtml}となる。この会議室を${H}時間利用したところ、使用料は${trueTotal.toLocaleString()}円であった。`,
            prompt: '①時から②時まで借りたのか。最も妥当なものを選びなさい。',
            customChoices,
            steps: [
                `ステップ1：${H}時間すべてを最も高い割引率(${rate1}%引き)で借りた場合の料金と比較して、実際の料金との差から、利用時間の内訳を推測する。<br><strong>定価 ${basePrice.toLocaleString()}円 × ${H}時間 = ${(basePrice * H).toLocaleString()}円</strong>（割引なしの場合）`,
                `ステップ2：候補となる開始時刻それぞれについて、時間帯ごとの割引を当てはめて実際の料金を計算する。`,
                `ステップ3：計算の結果、<strong>${trueStart}時から${trueEnd}時</strong>まで借りた場合にのみ、使用料が${trueTotal.toLocaleString()}円と一致する。`
            ]
        };

    } else {
        // バリエーション2：回数券の最安値推理
        let bookSize, bookMultiplier, N, q, r, optionA, optionB, answer;
        let attempts = 0;
        let valid = false;
        do {
            attempts++;
            const bookSizeOptions = [10, 12, 15, 20];
            bookSize = bookSizeOptions[getRandomInt(0, bookSizeOptions.length - 1)];
            const discountOptions = [2, 3, 4, 5];
            bookMultiplier = bookSize - discountOptions[getRandomInt(0, discountOptions.length - 1)];
            const peopleOptions = [30, 35, 40, 45, 50, 55, 60, 65, 70];
            N = peopleOptions[getRandomInt(0, peopleOptions.length - 1)];

            q = Math.floor(N / bookSize);
            r = N % bookSize;
            optionA = (q + 1) * bookMultiplier;
            optionB = q * bookMultiplier + r;
            answer = Math.min(optionA, optionB);

            valid = (r !== 0) && (r !== bookMultiplier) && (q >= 1);
        } while (!valid && attempts < 200);

        const rawCandidates = [optionA, optionB, answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2]
            .filter(v => v > 0);
        const uniqueVals = Array.from(new Set(rawCandidates));
        if (!uniqueVals.includes(answer)) uniqueVals.push(answer);
        const isNoneCorrect = getRand() < 0.12;

        let displayVals = uniqueVals.filter(v => !isNoneCorrect || v !== answer).slice(0, 4);
        while (displayVals.length < 4) {
            const extra = answer + getRandomInt(2, 5) * (getRand() < 0.5 ? 1 : -1);
            if (extra > 0 && !displayVals.includes(extra) && (isNoneCorrect ? extra !== answer : true)) displayVals.push(extra);
        }
        displayVals = displayVals.slice(0, 4).sort((a, b) => a - b);

        const customChoices = shuffleArray(displayVals.map(v => ({
            value: v, htmlText: `${v}x円`, isCorrect: !isNoneCorrect && v === answer
        })));
        customChoices.push({ value: 'none', htmlText: 'いずれでもない', isCorrect: isNoneCorrect });

        return {
            unit: '料金割引', level: 3, badge: 'Lv.3 高難度', title: '回数券の最安値推理',
            text: `美術館の入場券は x円 で販売されている。${bookSize}枚つづりの入場回数券も ${bookMultiplier}x円 で販売されている。余った回数券の払い戻しはない。`,
            prompt: `${N}人で入場する場合、最も安い入場料の総額は x円 となるか。`,
            customChoices,
            steps: [
                `ステップ1：${N}人分に必要な回数券の冊数を考える。<br><strong>${N} ÷ ${bookSize} = ${q}冊 … ${r}人</strong>`,
                `ステップ2：端数を切り上げて${q + 1}冊買う場合の総額を求める。<br><strong>${bookMultiplier}x × ${q + 1} = ${optionA}x円</strong>`,
                `ステップ3：${q}冊買い、残り${r}人分は入場券を1枚ずつ買う場合の総額を求める。<br><strong>${bookMultiplier}x × ${q} + x × ${r} = ${optionB}x円</strong>`,
                `ステップ4：2つの場合を比較し、安い方を選ぶ。<br><strong>${Math.min(optionA, optionB)}x円</strong>${optionA <= optionB ? '（冊数を切り上げて買う方が安い）' : '（回数券と入場券を組み合わせて買う方が安い）'}`
            ]
        };
    }
}
