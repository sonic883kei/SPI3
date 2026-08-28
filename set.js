/**
 * set.js
 * 単元: ① 集合
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genSet1, genSet2, genSet3
 */

        function genSet1() {
            const likeA = getRandomInt(15, 25);
            const likeB = getRandomInt(12, 20);
            const both = getRandomInt(5, Math.min(likeA, likeB) - 2);
            const union = likeA + likeB - both;

            const neither = getRandomInt(3, 15);
            const total = union + neither;

            return {
                unit: '集合', level: 1, badge: 'Lv.1 基本', title: '2つの要素の集合（ベン図）',
                text: `${total}人の学生にアンケートを行ったところ、サッカーが好きな人は ${likeA}人、バスケットボールが好きな人は ${likeB}人、両方好きな人は ${both}人 であった。`,
                prompt: 'どちらも好きではない人は何人か。', correctAnswer: neither, unitSuffix: '人', step: 1,
                steps: [
                    `ステップ1：少なくともどちらか一方が好きな人数（和集合）を計算する。<br><strong>${likeA} + ${likeB} - ${both} = ${union}人</strong>`,
                    `ステップ2：全体から和集合を引いて「どちらも好きでない人数」を求める。<br><strong>${total} - ${union} = ${neither}人</strong>`
                ]
            };
        }

        function genSet2() {
            const total = 100;
            const likeA = getRandomInt(50, 70);
            const likeB = getRandomInt(40, 60);
            const neither = getRandomInt(10, 20);
            const union = total - neither;
            const both = likeA + likeB - union;

            return {
                unit: '集合', level: 2, badge: 'Lv.2 応用', title: '全体集合からの逆算',
                text: `100人の受講生のうち、英語が得意な人は ${likeA}人、数学が得意な人は ${likeB}人、どちらも得意でない人は ${neither}人 であった。`,
                prompt: '両方とも得意な人は何人か。', correctAnswer: both, unitSuffix: '人', step: 1,
                steps: [
                    `ステップ1：少なくともどちらか得意な人数を求める。<br><strong>100 - ${neither} = ${union}人</strong>`,
                    `ステップ2：(Aが得意 + Bが得意) から和集合を差し引いて「両方得意」を求める。<br><strong>${likeA} + ${likeB} - ${union} = ${both}人</strong>`
                ]
            };
        }

        function genSet3() {
            const total = getRandomInt(6, 10) * 10;
            const neither = getRandomInt(1, 3) * 5;
            const union = total - neither;
            const minBoth = getRandomInt(1, 3) * 5; 
            const sumLikes = union + minBoth;
            const likeA = getRandomInt(Math.ceil(sumLikes / 2), sumLikes - 10);
            const likeB = sumLikes - likeA;
            const maxBoth = Math.min(likeA, likeB);

            const isMinQuestion = getRand() < 0.5;
            const promptText = isMinQuestion ? '両方とも好きな人の「最小人数」は何人か。' : '両方とも好きな人の「最大人数」は何人か。';
            const correctAnswerVal = isMinQuestion ? minBoth : maxBoth;

            return {
                unit: '集合', level: 3, badge: 'Lv.3 高難度', title: '両方該当する人数の範囲（極値）',
                text: `${total}人の学生に映画Aと映画Bの好き嫌いを調査したところ、映画Aが好きな人は ${likeA}人、映画Bが好きな人は ${likeB}人 であった。また、どちらも好きではない人は ${neither}人 であった。`,
                prompt: promptText, correctAnswer: correctAnswerVal, unitSuffix: '人', step: 5,
                steps: [
                    `ステップ1：少なくとも一方が好きな人数（和集合）を求める。<br><strong>${total}人 - ${neither}人 = ${union}人</strong>`,
                    `ステップ2：AとBの合計人数を求める。<br><strong>${likeA}人 + ${likeB}人 = ${likeA + likeB}人</strong>`,
                    isMinQuestion
                        ? `ステップ3【最小値】：重なりが最も小さくなるのは全体に広がったとき。<br><strong>${likeA + likeB}人 - ${union}人 = ${minBoth}人</strong>`
                        : `ステップ3【最大値】：重なりが最も大きくなるのは人数が少ない方が含まれるとき。<br><strong>${likeB}人</strong>`
                ]
            };
        }

        // --- 代金清算 ---
