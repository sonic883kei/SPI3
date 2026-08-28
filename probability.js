/**
 * probability.js
 * 単元: ⑦ 場合の数・確率
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: genProbability1〜6
 */

        function genProbability1() {
            const menCount = getRandomInt(3, 4);
            const womenCount = 2;
            const totalPeople = menCount + womenCount;
            function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }
            const groupCount = menCount + 1;
            const ways = factorial(groupCount) * factorial(womenCount);

            return {
                unit: '場合の数・確率', level: 1, badge: 'Lv.1 基本', title: '場合の数・特定要素の隣り合い',
                text: `男子 ${menCount}人 と女子 ${womenCount}人 の合計 ${totalPeople}人 が一列に並ぶ。`,
                prompt: '女子2人が必ず隣り合う並び方は何通りか。',
                correctAnswer: ways,
                unitSuffix: '通り',
                step: 12,
                steps: [
                    `ステップ1：隣り合う女子2人を「1つのグループ」としてまとめる。<br>並べる対象は男子 ${menCount}人 ＋ 女子グループ1個 ＝ <strong>${groupCount}要素</strong>。`,
                    `ステップ2：${groupCount}要素の並び方を計算する。<br><strong>${groupCount}! ＝ ${factorial(groupCount)}通り</strong>`,
                    `ステップ3：女子グループ内での2人の並び替えを考慮する。<br><strong>2! ＝ 2通り</strong>`,
                    `ステップ4：積の法則により全体を算出する。<br><strong>${factorial(groupCount)} × 2 ＝ ${ways}通り</strong>`
                ]
            };
        }

        function genProbability2() {
            return {
                unit: '場合の数・確率', level: 1, badge: 'Lv.1 基本', title: '確率・条件を満たす整数の構成',
                text: `1, 2, 3, 4, 5 の数字が1文字ずつ書かれた5枚のカードから、同時に3枚を取り出して並べ、3桁の整数を作る。`,
                prompt: 'できた整数が「偶数」である確率はいくらか。',
                correctAnswer: 2, unitSuffix: '/5', isFraction: true,
                customChoices: [
                    { label: 'A', value: 1, htmlText: '1/5', isCorrect: false },
                    { label: 'B', value: 2, htmlText: '2/5', isCorrect: true },
                    { label: 'C', value: 3, htmlText: '1/2', isCorrect: false },
                    { label: 'D', value: 4, htmlText: '3/5', isCorrect: false },
                    { label: 'E', value: 5, htmlText: '2/3', isCorrect: false },
                    { label: 'F', value: 6, htmlText: 'いずれでもない', isCorrect: false }
                ],
                steps: [
                    `ステップ1：作り得るすべての3桁の整数の個数（$_5P_3$）を求める。<br><strong>5 × 4 × 3 ＝ 60通り</strong>`,
                    `ステップ2：偶数になる条件（一の位が 2 または 4）を満たす通り数を求める。<br>一の位の選び方：<strong>2通り</strong><br>百の位と十の位の選び方（残り4枚から2枚）：<strong>$_4P_2 ＝ 4 × 3 ＝ 12通り</strong><br>偶数の総数：<strong>2 × 12 ＝ 24通り</strong>`,
                    `ステップ3：確率を算出する。<br><strong>24 / 60 ＝ 2/5（正解はB）</strong>`
                ]
            };
        }

        function genProbability3() {
            return {
                unit: '場合の数・確率', level: 2, badge: 'Lv.2 応用', title: '場合の数・順序が固定された順列',
                text: `A, B, C, D, E, F の6人が一列に並ぶ。`,
                prompt: 'AがBよりも常に前にいる並び方は何通りか。',
                correctAnswer: 360, unitSuffix: '通り', step: 30,
                steps: [
                    `ステップ1：順序が固定されているAとBを「同じ記号（〇）」とみなす。`,
                    `ステップ2：〇, 〇, C, D, E, F の6つの要素を並べる「同じものを含む順列」の考え方を用いる。<br><strong>6! ÷ 2!</strong>`,
                    `ステップ3：計算する。<br><strong>720 ÷ 2 ＝ 360通り</strong>`
                ]
            };
        }

        function genProbability4() {
            return {
                unit: '場合の数・確率', level: 2, badge: 'Lv.2 応用', title: '確率・複数色の玉の同時抽出',
                text: `赤玉4個、白玉3個の合計7個が入っている袋から、同時に3個の玉を取り出す。`,
                prompt: '「赤玉がちょうど2個、白玉がちょうど1個」取り出される確率はいくらか。',
                correctAnswer: 18, unitSuffix: '/35', isFraction: true,
                customChoices: [
                    { label: 'A', value: 1, htmlText: '12/35', isCorrect: false },
                    { label: 'B', value: 2, htmlText: '16/35', isCorrect: false },
                    { label: 'C', value: 3, htmlText: '18/35', isCorrect: true },
                    { label: 'D', value: 4, htmlText: '4/7', isCorrect: false },
                    { label: 'E', value: 5, htmlText: '22/35', isCorrect: false },
                    { label: 'F', value: 6, htmlText: 'いずれでもない', isCorrect: false }
                ],
                steps: [
                    `ステップ1：7個から同時に3個を取り出す全組み合わせ（$_7C_3$）を求める。<br><strong>(7 × 6 × 5) ÷ (3 × 2 × 1) ＝ 35通り</strong>`,
                    `ステップ2：条件を満たす選び方を計算する。<br>赤玉4個から2個を選ぶ（$_4C_2$）：<strong>(4 × 3) ÷ (2 × 1) ＝ 6通り</strong><br>白玉3個から1個を選ぶ（$_3C_1$）：<strong>3通り</strong><br>組合せの総数：<strong>6 × 3 ＝ 18通り</strong>`,
                    `ステップ3：確率を求める。<br><strong>18 / 35（正解はC）</strong>`
                ]
            };
        }

        function genProbability5() {
            return {
                unit: '場合の数・確率', level: 3, badge: 'Lv.3 高難度', title: '確率・反復試行と数直線上の動点',
                text: `数直線上の原点（0）に点Pがある。コインを1回投げて表が出たら右へ2（+2）、裏が来たら左へ1（-1）進む。コインを4回投げた。`,
                prompt: '点Pが最終的に「+2」の位置にいる確率はいくらか。',
                correctAnswer: 3, unitSuffix: '/8', isFraction: true,
                customChoices: [
                    { label: 'A', value: 1, htmlText: '1/4', isCorrect: false },
                    { label: 'B', value: 2, htmlText: '5/16', isCorrect: false },
                    { label: 'C', value: 3, htmlText: '3/8', isCorrect: true },
                    { label: 'D', value: 4, htmlText: '7/16', isCorrect: false },
                    { label: 'E', value: 5, htmlText: '1/2', isCorrect: false },
                    { label: 'F', value: 6, htmlText: 'いずれでもない', isCorrect: false }
                ],
                steps: [
                    `ステップ1：表が出た回数を $x$ 回（裏は $4 - x$ 回）として、4回後の位置を表す式を立てる。<br><strong>位置 ＝ 2x - 1(4 - x) ＝ 3x - 4</strong>`,
                    `ステップ2：位置が「+2」になる表の回数 $x$ を求める。<br><strong>3x - 4 ＝ 2  ⇒  3x ＝ 6  ⇒  x ＝ 2（表が2回、裏が2回）</strong>`,
                    `ステップ3：反復試行の公式を用いて確率を計算する。<br>全事象：$2^4 ＝ 16通り$<br>表が2回出る出方：$_4C_2 ＝ 6通り$<br>確率は <strong>6 / 16 ＝ 3/8（正解はC）</strong>`
                ]
            };
        }

        function genProbability6() {
            return {
                unit: '場合の数・確率', level: 3, badge: 'Lv.3 高難度', title: '確率・条件付き確率（原因の探求）',
                text: `ある製品を工場Aで 60%、工場Bで 40% 生産している。不良品の発生率は、工場Aが 2%、工場Bが 5% である。<br>出荷された製品の中からランダムに1個取り出したところ、不良品であった。`,
                prompt: 'その不良品が「工場A」で生産されたものである確率はいくらか。',
                correctAnswer: 3, unitSuffix: '/8', isFraction: true,
                customChoices: [
                    { label: 'A', value: 1, htmlText: '1/4', isCorrect: false },
                    { label: 'B', value: 2, htmlText: '3/8', isCorrect: true },
                    { label: 'C', value: 3, htmlText: '2/5', isCorrect: false },
                    { label: 'D', value: 4, htmlText: '5/8', isCorrect: false },
                    { label: 'E', value: 5, htmlText: '3/5', isCorrect: false },
                    { label: 'F', value: 6, htmlText: 'いずれでもない', isCorrect: false }
                ],
                steps: [
                    `ステップ1：全体の中から「Aの不良品」と「Bの不良品」が発生する割合をそれぞれ計算する。<br>Aの不良品：<strong>0.60 × 0.02 ＝ 0.012（1.2%）</strong><br>Bの不良品：<strong>0.40 × 0.05 ＝ 0.020（2.0%）</strong>`,
                    `ステップ2：取り出した製品が不良品である全体割合（分母）を求める。<br><strong>0.012 ＋ 0.020 ＝ 0.032（3.2%）</strong>`,
                    `ステップ3：条件付き確率の公式（Aの不良品 ÷ 全体の不良品）を計算する。<br><strong>0.012 / 0.032 ＝ 12 / 32 ＝ 3/8（正解はB）</strong>`
                ]
            };
        }

        // --- ⑧ 推論 ---
