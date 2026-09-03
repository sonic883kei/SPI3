/**
 * logical.js
 * 単元: ⑧ 推論①
 * 依存: js/algorithms/common.js（getRand, getRandomInt, shuffleArray）を先に読み込むこと
 * 提供関数: buildLogicalQuestion(level)
 */

/**
 * 述語の否定文を自然な日本語に変換するヘルパー関数
 */
function getNegation(pred) {
    if (pred.endsWith('である')) {
        return pred.slice(0, -3) + 'ではない';
    }
    if (pred.endsWith('以上である')) {
        return pred.slice(0, -5) + '未満である';
    }
    if (pred.endsWith('以下である')) {
        return pred.slice(0, -5) + '超である';
    }
    if (pred.endsWith('を含む')) {
        return pred.slice(0, -3) + 'を含まない';
    }
    return pred + 'ではない';
}

function buildLogicalQuestion(level) {
    // 主語(subject)と包含関係にある階層的述語(predicates: P => Q => R => S)
    const templates = [
        {
            subject: 'Aさん',
            p: '消防士である',
            q: '地方公務員である',
            r: '公務員である',
            s: '労働者である'
        },
        {
            subject: '図書X',
            p: '参考図書である',
            q: '図書である',
            r: '資料である',
            s: '物品である'
        },
        {
            subject: '商品A',
            p: '冷蔵商品である',
            q: '食品である',
            r: '商品である',
            s: '物品である'
        },
        {
            subject: 'x',
            p: '24の倍数である',
            q: '12の倍数である',
            r: '6の倍数である',
            s: '3の倍数である'
        },
        {
            subject: '図形A',
            p: '正方形である',
            q: '長方形である',
            r: '四角形である',
            s: '多角形である'
        },
        {
            subject: 'x',
            p: '素数である',
            q: '自然数である',
            r: '整数である',
            s: '有理数である'
        },
        {
            subject: '図形A',
            p: '正三角形である',
            q: '二等辺三角形である',
            r: '三角形である',
            s: '多角形である'
        },
        {
            subject: 'x',
            p: '100以上である',
            q: '50以上である',
            r: '0以上である',
            s: '実数である'
        },
        {
            subject: 'x',
            p: '立方数である',
            q: '整数である',
            r: '有理数である',
            s: '実数である'
        }
    ];

    const elem = templates[getRandomInt(0, templates.length - 1)];
    const S = elem.subject;

    // 各命題句の作成
    const pTrue = `${S}が${elem.p}`;
    const qTrue = `${S}が${elem.q}`;
    const rTrue = `${S}が${elem.r}`;

    const pFalse = `${S}が${getNegation(elem.p)}`;
    const qFalse = `${S}が${getNegation(elem.q)}`;
    const rFalse = `${S}が${getNegation(elem.r)}`;

    if (level === 1) {
        const premiseText = `「${pTrue}ならば、${qTrue}」`;
        const correctText = `${qFalse}ならば、${pFalse}`;

        const choices = [
            { label: 'A', value: 'A', htmlText: correctText, isCorrect: true },
            { label: 'B', value: 'B', htmlText: `${pFalse}ならば、${qFalse}`, isCorrect: false },
            { label: 'C', value: 'C', htmlText: `${qTrue}ならば、${pTrue}`, isCorrect: false },
            { label: 'D', value: 'D', htmlText: `${pTrue}ならば、${qFalse}`, isCorrect: false },
            { label: 'E', value: 'E', htmlText: 'いずれも該当しない', isCorrect: false }
        ];

        return {
            unit: '推論',
            level: 1,
            badge: 'Lv.1 基本',
            title: '命題の対偶',
            text: `命題：${premiseText} が真であるとする。`,
            prompt: 'この命題と論理的に必ず真（等価）になる命題はどれか。',
            customChoices: shuffleArray(choices),
            steps: [
                `ステップ1：元の命題「P ⇒ Q」と論理的に必ず一致（等価）するのは、対偶「not Q ⇒ not P」である。`,
                `ステップ2：「${qTrue}」の否定（${qFalse}）から、「${pTrue}」の否定（${pFalse}）を導く選択肢を選ぶ。`
            ]
        };
    } else if (level === 2) {
        const isContra = getRand() < 0.5;
        const premiseText = `次の2つの命題がともに真であるとする。<br>ア：「${pTrue}ならば、${qTrue}」<br>イ：「${qTrue}ならば、${rTrue}」`;
        
        const correctText = isContra
            ? `${rFalse}ならば、${pFalse}`
            : `${pTrue}ならば、${rTrue}`;

        const choices = [
            { label: 'A', value: 'A', htmlText: correctText, isCorrect: true },
            { label: 'B', value: 'B', htmlText: `${rTrue}ならば、${pTrue}`, isCorrect: false },
            { label: 'C', value: 'C', htmlText: `${pFalse}ならば、${rFalse}`, isCorrect: false },
            { label: 'D', value: 'D', htmlText: `${qFalse}ならば、${rFalse}`, isCorrect: false },
            { label: 'E', value: 'E', htmlText: 'どちらの結論も導けない', isCorrect: false }
        ];

        return {
            unit: '推論',
            level: 2,
            badge: 'Lv.2 応用',
            title: '三段論法と対偶の複合推論',
            text: premiseText,
            prompt: '上の2つの命題から論理的に必ず正しいといえる結論はどれか。',
            customChoices: shuffleArray(choices),
            steps: [
                `ステップ1：三段論法により、「P ⇒ Q」かつ「Q ⇒ R」から「P ⇒ R（${pTrue}ならば、${rTrue}）」が導かれる。`,
                `ステップ2：さらにその対偶である「not R ⇒ not P（${rFalse}ならば、${pFalse}）」も必ず真となる。`
            ]
        };
    } else {
        // Level 3: 順序推論と情報十分性
        const choices = [
            { label: 'A', value: 'A', htmlText: 'アのみで十分', isCorrect: false },
            { label: 'B', value: 'B', htmlText: 'イのみで十分', isCorrect: false },
            { label: 'C', value: 'C', htmlText: 'アとイの両方で十分', isCorrect: false },
            { label: 'D', value: 'D', htmlText: 'アとイの両方があっても十分でない', isCorrect: true },
            { label: 'E', value: 'E', htmlText: '条件だけでは判定不可能', isCorrect: false }
        ];

        return {
            unit: '推論',
            level: 3,
            badge: 'Lv.3 高難度',
            title: '順序推論と情報十分性',
            text: '4人の得点の順位について、情報ア「AはBより高得点」、情報イ「CはDより高得点」がある。この2つの情報から「1位から4位までのすべての順位が一意に決まるか」を判定したい。',
            prompt: '正しい記述はどれか。',
            customChoices: shuffleArray(choices),
            steps: [
                `ステップ1：ア「A > B」とイ「C > D」の情報だけでは、(A, B) のグループと (C, D) のグループ間の上下関係が不明である。`,
                `ステップ2：したがって、両方の情報が揃っても全体の順位を一意に特定することはできない（アとイの両方があっても十分でない）。`
            ]
        };
    }
}