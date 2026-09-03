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

// ----------------------------------------------------
// レベル3用: 5人の順序推論・動的判定ロジック
// ----------------------------------------------------
const PERSONS_5 = ['A', 'B', 'C', 'D', 'E'];

/**
 * 順列生成 (5! = 120通り)
 */
function generatePermutations(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = [...arr];
        const head = rest.splice(i, 1)[0];
        for (const p of generatePermutations(rest)) {
            result.push([head, ...p]);
        }
    }
    return result;
}

const ALL_PERMS_5 = generatePermutations(PERSONS_5);

/**
 * 与えられた順位(order)が条件リスト(conditions)をすべて満たすか
 */
function satisfyConditions(order, conditions) {
    return conditions.every(([a, b]) => order.indexOf(a) < order.indexOf(b));
}

/**
 * 条件リストを満たす候補順位を全通りのうちから抽出
 */
function getValidOrders(conditions) {
    return ALL_PERMS_5.filter(order => satisfyConditions(order, conditions));
}

/**
 * ある1つの順位(order)において、ターゲットとする主張(target)が「真」かどうかを判定
 */
function isTargetSatisfiedInOrder(order, target) {
    switch (target.type) {
        case 'rank':
            return order[target.rank - 1] === target.person;
        case 'first':
            return order[0] === target.person;
        case 'last':
            return order[4] === target.person;
        case 'middle':
            return order[2] === target.person;
        case 'before':
            return order.indexOf(target.a) < order.indexOf(target.b);
        case 'allRanksUnique':
            return true; // この基準はdetermine側でvalidOrders.length === 1を見る
        default:
            return false;
    }
}

/**
 * 候補順位群(valids)において、主張(target)が「一意に判定（真または偽と確定）できるか」を判定
 */
function determineTarget(valids, target) {
    if (valids.length === 0) return false;
    if (target.type === 'allRanksUnique') {
        return valids.length === 1;
    }
    const answers = valids.map(o => isTargetSatisfiedInOrder(o, target));
    // 全ての候補で「真」または全ての候補で「偽」なら一意に判定可能（情報として十分）
    return answers.every(v => v === true) || answers.every(v => v === false);
}

/**
 * 情報ア・情報イから正解文言を判定
 */
function judgeInformationSufficiency(infoA, infoB, target) {
    const validsA = getValidOrders(infoA);
    const validsB = getValidOrders(infoB);
    const validsAB = getValidOrders([...infoA, ...infoB]);

    const aOnly = determineTarget(validsA, target);
    const bOnly = determineTarget(validsB, target);
    const both = determineTarget(validsAB, target);

    if (!both) {
        return { text: 'アとイの両方があっても十分でない', key: 'both_not', validsA, validsB, validsAB };
    }
    if (aOnly && !bOnly) {
        return { text: 'アのみで十分', key: 'a_only', validsA, validsB, validsAB };
    }
    if (!aOnly && bOnly) {
        return { text: 'イのみで十分', key: 'b_only', validsA, validsB, validsAB };
    }
    if (!aOnly && !bOnly && both) {
        return { text: 'アとイの両方で十分', key: 'both_needed', validsA, validsB, validsAB };
    }
    // 両方単独で十分な場合はどちらか一方（基本的にはアのみで十分とする）
    return { text: 'アのみで十分', key: 'a_only', validsA, validsB, validsAB };
}

/**
 * レベル3の問題生成処理
 */
function buildLevel3OrderQuestion() {
    // 求めるターゲットタイプをランダム設定
    const targetTypes = ['first', 'last', 'middle', 'rank', 'before', 'allRanksUnique'];
    
    let bestResult = null;
    let attempts = 0;

    // バランスよく正解を散らすために試行
    while (attempts < 200) {
        attempts++;
        const trueOrder = shuffleArray(PERSONS_5);
        
        // 全関係性の中から4つをランダム抽出
        const allRelations = [];
        for (let i = 0; i < trueOrder.length; i++) {
            for (let j = i + 1; j < trueOrder.length; j++) {
                allRelations.push([trueOrder[i], trueOrder[j]]);
            }
        }
        const shuffledRel = shuffleArray(allRelations);
        
        // アとイに2つずつ配置
        const infoA = shuffledRel.slice(0, 2);
        const infoB = shuffledRel.slice(2, 4);

        const targetType = targetTypes[getRandomInt(0, targetTypes.length - 1)];
        let target = { type: targetType };

        const p1 = PERSONS_5[getRandomInt(0, 4)];
        let p2 = PERSONS_5[getRandomInt(0, 4)];
        while (p1 === p2) {
            p2 = PERSONS_5[getRandomInt(0, 4)];
        }

        if (targetType === 'first') {
            target.person = p1;
            target.promptText = `「${p1}は1位である」`;
        } else if (targetType === 'last') {
            target.person = p1;
            target.promptText = `「${p1}は5位である」`;
        } else if (targetType === 'middle') {
            target.person = p1;
            target.promptText = `「${p1}は3位（中央）である」`;
        } else if (targetType === 'rank') {
            const r = getRandomInt(1, 5);
            target.person = p1;
            target.rank = r;
            target.promptText = `「${p1}は${r}位である」`;
        } else if (targetType === 'before') {
            target.a = p1;
            target.b = p2;
            target.promptText = `「${p1}は${p2}より上位である」`;
        } else {
            target.promptText = `「1位から5位までの全順位が一意に決まる」`;
        }

        const judge = judgeInformationSufficiency(infoA, infoB, target);

        bestResult = {
            infoA,
            infoB,
            target,
            judge,
            trueOrder
        };

        // 解の偏りを防ぐため一定の確率で採用
        if (judge.key === 'both_needed' && getRand() < 0.8) break;
        if ((judge.key === 'a_only' || judge.key === 'b_only') && getRand() < 0.6) break;
        if (judge.key === 'both_not' && getRand() < 0.5) break;
    }

    const infoAText = `${bestResult.infoA[0][0]}は${bestResult.infoA[0][1]}より上位、かつ${bestResult.infoA[1][0]}は${bestResult.infoA[1][1]}より上位`;
    const infoBText = `${bestResult.infoB[0][0]}は${bestResult.infoB[0][1]}より上位、かつ${bestResult.infoB[1][0]}は${bestResult.infoB[1][1]}より上位`;

    const choices = [
        { label: 'A', value: 'A', htmlText: 'アのみで十分', isCorrect: bestResult.judge.text === 'アのみで十分' },
        { label: 'B', value: 'B', htmlText: 'イのみで十分', isCorrect: bestResult.judge.text === 'イのみで十分' },
        { label: 'C', value: 'C', htmlText: 'アとイの両方で十分', isCorrect: bestResult.judge.text === 'アとイの両方で十分' },
        { label: 'D', value: 'D', htmlText: 'アとイの両方があっても十分でない', isCorrect: bestResult.judge.text === 'アとイの両方があっても十分でない' },
        { label: 'E', value: 'E', htmlText: '条件だけでは判定不可能', isCorrect: false }
    ];

    let step2Text = '';
    if (bestResult.judge.key === 'a_only') {
        step2Text = `情報アのみで ${bestResult.target.promptText} の真偽が一意に確定するため、「アのみで十分」が正解です。`;
    } else if (bestResult.judge.key === 'b_only') {
        step2Text = `情報イのみで ${bestResult.target.promptText} の真偽が一意に確定するため、「イのみで十分」が正解です。`;
    } else if (bestResult.judge.key === 'both_needed') {
        step2Text = `情報ア単独・情報イ単独では絞り込めませんが、両方を組み合わせると ${bestResult.target.promptText} の真偽が一意に確定するため、「アとイの両方で十分」が正解です。`;
    } else {
        step2Text = `情報アとイの両方を合わせても順位の可能性が複数パターン残ってしまい、${bestResult.target.promptText} の真偽を一意に決定できないため、「アとイの両方があっても十分でない」が正解です。`;
    }

    return {
        unit: '推論',
        level: 3,
        badge: 'Lv.3 高難度',
        title: '順序推論と情報十分性',
        text: `A, B, C, D, Eの5人が試験を受け、得点の重複はなかった。<br>主張 ${bestResult.target.promptText} の真偽を判定したい。<br><br>情報ア：${infoAText}<br>情報イ：${infoBText}`,
        prompt: '主張の真偽を判定する情報として適切なものはどれか。',
        customChoices: shuffleArray(choices),
        steps: [
            `ステップ1：情報アを満たす順位パターンは ${bestResult.judge.validsA.length}通り、情報イを満たすパターンは ${bestResult.judge.validsB.length}通り、両方を満たすパターンは ${bestResult.judge.validsAB.length}通り存在します。`,
            `ステップ2：${step2Text}`
        ]
    };
}


// ----------------------------------------------------
// メインエントリーポイント
// ----------------------------------------------------
function buildLogicalQuestion(level) {
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
            { label: 'E', value: 'E', htmlText: 'いずれの結論も導けない', isCorrect: false }
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
        // Level 3: 5人の順序推論と情報十分性 (動的生成)
        return buildLevel3OrderQuestion();
    }
}
