/**
 * logical.js
 * 単元: ⑧ 推論①
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: buildLogicalQuestion(level)
 */

        function buildLogicalQuestion(level) {
            const subjects = [
    {
        p: 'Aさんは消防士である',
        q: 'Aさんは地方公務員である',
        r: 'Aさんは公務員である',
        s: 'Aさんは労働者である'
    },
    {
        p: '図書Xは参考図書である',
        q: '図書Xは図書である',
        r: '図書Xは資料である',
        s: '図書Xは物品である'
    },
    {
        p: '商品Aは冷蔵商品である',
        q: '商品Aは食品である',
        r: '商品Aは商品である',
        s: '商品Aは物品である'
    },
    {
        p: 'xは24の倍数である',
        q: 'xは12の倍数である',
        r: 'xは6の倍数である',
        s: 'xは3の倍数である'
    },
    {
        p: '図形Aは正方形である',
        q: '図形Aは長方形である',
        r: '図形Aは四角形である',
        s: '図形Aは多角形である'
    },
    {
        p: 'xは素数である',
        q: 'xは自然数である',
        r: 'xは整数である',
        s: 'xは有理数である'
    },
    {
        p: '図形Aは正三角形である',
        q: '図形Aは二等辺三角形である',
        r: '図形Aは三角形である',
        s: '図形Aは多角形である'
    },
    {
        p: 'xは100以上である',
        q: 'xは50以上である',
        r: 'xは0以上である',
        s: 'xは実数である'
    },
    {
        p: 'xは立方数である',
        q: 'xは整数である',
        r: 'xは有理数である',
        s: 'xは実数である'
    }

            ];
            const elem = subjects[getRandomInt(0, subjects.length - 1)];

            if (level === 1) {
                const premiseText = `「${elem.p}」ならば「${elem.q}」である。`;
                const correctText = `「${elem.q}でない」ならば「${elem.p}でない」`;
                const choices = [
                    { label: 'A', value: 'A', htmlText: correctText, isCorrect: true },
                    { label: 'B', value: 'B', htmlText: `「${elem.p}でない」ならば「${elem.q}でない」`, isCorrect: false },
                    { label: 'C', value: 'C', htmlText: `「${elem.q}」ならば「${elem.p}」である`, isCorrect: false },
                    { label: 'D', value: 'D', htmlText: `「${elem.p}」ならば「${elem.q}でない」`, isCorrect: false },
                    { label: 'E', value: 'E', htmlText: 'いずれも該当しない', isCorrect: false }
                ];
                return {
                    unit: '推論', level: 1, badge: 'Lv.1 基本', title: '命題の対偶',
                    text: `命題：${premiseText}`, prompt: 'この命題と論理的に必ず真（等価）になる命題はどれか。',
                    customChoices: shuffleArray(choices),
                    steps: [
                        `ステップ1：元命題 P ⇒ Q と必ず真偽が一致するのは「対偶（not Q ⇒ not P）」である。`,
                        `ステップ2：「${elem.q}」の否定から「${elem.p}」の否定への命題を選択する。`
                    ]
                };
            } else if (level === 2) {
                const isContra = getRand() < 0.5;
                const premiseText = `次の2つの命題がともに真であるとする。<br>ア：「${elem.p}」ならば「${elem.q}」である。<br>イ：「${elem.q}」ならば「${elem.r}」である。`;
                const correctText = isContra
                    ? `「${elem.r}でない」ならば「${elem.p}でない」`
                    : `「${elem.p}」ならば「${elem.r}」である`;

                const choices = [
                    { label: 'A', value: 'A', htmlText: correctText, isCorrect: true },
                    { label: 'B', value: 'B', htmlText: `「${elem.r}」ならば「${elem.p}」である`, isCorrect: false },
                    { label: 'C', value: 'C', htmlText: `「${elem.p}でない」ならば「${elem.r}でない」`, isCorrect: false },
                    { label: 'D', value: 'D', htmlText: `「${elem.q}でない」ならば「${elem.r}でない」`, isCorrect: false },
                    { label: 'E', value: 'E', htmlText: 'どちらの結論も導けない', isCorrect: false }
                ];
                return {
                    unit: '推論', level: 2, badge: 'Lv.2 応用', title: '三段論法と対偶の複合推論',
                    text: premiseText, prompt: '上の2つの命題から論理的に必ず正しいといえる結論はどれか。',
                    customChoices: shuffleArray(choices),
                    steps: [
                        `ステップ1：三段論法により、P ⇒ Q かつ Q ⇒ R から 「P ⇒ R」 が導かれる。`,
                        `ステップ2：その対偶である 「not R ⇒ not P」 も必ず真となる。`
                    ]
                };
            } else {
                const choices = [
                    { label: 'A', value: 'A', htmlText: 'アのみで十分', isCorrect: false },
                    { label: 'B', value: 'B', htmlText: 'イのみで十分', isCorrect: false },
                    { label: 'C', value: 'C', htmlText: 'アとイの両方で十分', isCorrect: false },
                    { label: 'D', value: 'D', htmlText: 'アとイの両方があっても十分でない', isCorrect: true },
                    { label: 'E', value: 'E', htmlText: '条件だけでは判定不可能', isCorrect: false }
                ];
                return {
                    unit: '推論', level: 3, badge: 'Lv.3 高難度', title: '順序推論と情報十分性',
                    text: '4人の得点の順位について、推論ア「AはBより高得点」、推論イ「CはDより高得点」がある。この2つの情報から「1位から4位までのすべての順位が一意に決まるか」を判定したい。',
                    prompt: '正しい記述はどれか。',
                    customChoices: shuffleArray(choices),
                    steps: [
                        `ステップ1：ア「A > B」とイ「C > D」のみでは、(A,B)と(C,D)のグループ間の上下関係が不明。`,
                        `ステップ2：したがって、両方の情報があっても全体の順位を一意に特定することはできない。`
                    ]
                };
            }
        }

        // --- ⑨ 表の読み取り (Table Reading Generator) ---
