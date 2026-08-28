/**
 * ui.js
 * 画面制御・状態管理・CBTモード・モーダル・統計表示ロジック
 *
 * 依存関係:
 *   - index.html から、js/algorithms/ 配下の全ファイルより "後" に読み込むこと
 *     （initPRNG/getRandomInt/shuffleArray/generateQuestionByConfig/generateChoices
 *      および各単元の genXXX/buildXXXQuestion 関数を呼び出すため）。
 *   - 通常の<script>タグ（type="module"ではない）として読み込む前提。
 *
 * 新しい単元を追加した場合、このファイル内で追記が必要な箇所:
 *   1. UNIT_MAP        … genXXX()が返す unit名(日本語) → unitキー の対応
 *   2. UNIT_KEYS        … 統計画面(分析モーダル)に表示する単元一覧
 *   3. updateActiveConfigBadge() 内の unitNames  … 単元選択バッジの表示名
 *   4. startCBTMode() / startSyncCBTMode() 内の cbtUnitQueue … CBT模試の出題対象
 *   ※ index.html 側の単元選択ボタン(#unit-selection-grid)への追加も別途必要。
 */

        let configUnit = 'all';
        let configLevel = 'all';

        let currentQuestion = null;
        let isAnswered = false;
        let totalCount = 0;
        let correctCount = 0;
        
        let questionTimerInterval = null;
        let maxQuestionTime = 90;
        let remainingQuestionTime = 90;

        let isCBTMode = false;
        let cbtModeType = 'mini';
        let cbtTotalQuestions = 9;
        let cbtMaxOverallTime = 720;
        let cbtQuestionIndex = 0;
        let cbtCurrentLevel = 1;
        let cbtOverallTimerInterval = null;
        let cbtOverallRemainingTime = 720;
        let cbtSyncDate = null;
        let cbtUnitQueue = [];

        let globalHistory = [];
        let sessionAnswers = [];

        // 単元コード定義と名称の対応
        const UNIT_MAP = {
            '集合': 'set',
            '代金清算': 'settlement',
            '料金割引': 'discount',
            '分割払い': 'installment',
            '速さ': 'speed',
            '速さ(時刻表)': 'timetable',
            '損益算': 'profit',
            '場合の数・確率': 'probability',
            '推論': 'logical',
            '推論(数量推理)': 'inference',
            '表の読み取り': 'table'
        };

        const UNIT_KEYS = [
            { key: 'set', name: '① 集合' },
            { key: 'settlement', name: '② 代金清算' },
            { key: 'discount', name: '③ 料金割引' },
            { key: 'installment', name: '④ 分割払い' },
            { key: 'speed', name: '⑤ 速さ①' },
            { key: 'timetable', name: '⑤ 速さ②(時刻表)' },
            { key: 'profit', name: '⑥ 損益算' },
            { key: 'probability', name: '⑦ 場合の数・確率' },
            { key: 'logical', name: '⑧ 推論①' },
            { key: 'inference', name: '⑧ 推論②(数量推理)' },
            { key: 'table', name: '⑨ 表の読み取り' }
        ];

        // 分析データ管理 (localStorage)
        function loadUnitLevelStats() {
            try {
                const data = localStorage.getItem('spi_unit_level_stats_v1');
                return data ? JSON.parse(data) : {};
            } catch (e) {
                return {};
            }
        }

        function saveUnitLevelStat(unitName, level, isCorrect, timeSpent) {
            const unitKey = UNIT_MAP[unitName] || 'set';
            const lvlKey = String(level);
            const stats = loadUnitLevelStats();

            if (!stats[unitKey]) stats[unitKey] = {};
            if (!stats[unitKey][lvlKey]) {
                stats[unitKey][lvlKey] = { total: 0, correct: 0, totalTime: 0 };
            }

            stats[unitKey][lvlKey].total += 1;
            if (isCorrect) stats[unitKey][lvlKey].correct += 1;
            stats[unitKey][lvlKey].totalTime += timeSpent;

            try {
                localStorage.setItem('spi_unit_level_stats_v1', JSON.stringify(stats));
            } catch (e) {
                console.error("Failed to save stats to localStorage", e);
            }
        }

        function hideAllViews() {
            document.getElementById('view-landing').classList.add('hidden');
            document.getElementById('view-select').classList.add('hidden');
            document.getElementById('view-practice').classList.add('hidden');
            document.getElementById('cbt-status-bar').classList.add('hidden');
            document.getElementById('cbt-result-card').classList.add('hidden');
            const changeBtn = document.getElementById('nav-change-config-btn');
            if (changeBtn) changeBtn.classList.add('hidden');
        }

        function goToLanding() {
            if (questionTimerInterval) clearInterval(questionTimerInterval);
            if (cbtOverallTimerInterval) clearInterval(cbtOverallTimerInterval);
            isCBTMode = false;
            hideAllViews();
            document.getElementById('view-landing').classList.remove('hidden');
        }

        function goToSelectScreen() {
            if (questionTimerInterval) clearInterval(questionTimerInterval);
            if (cbtOverallTimerInterval) clearInterval(cbtOverallTimerInterval);
            isCBTMode = false;
            hideAllViews();
            document.getElementById('view-select').classList.remove('hidden');
        }

        function selectConfigUnit(unit) {
            configUnit = unit;
            document.querySelectorAll('.cfg-unit-btn').forEach(btn => {
                const icon = btn.querySelector('i');
                if (btn.getAttribute('data-unit') === unit) {
                    btn.className = 'cfg-unit-btn p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 bg-indigo-600 border-indigo-400 text-white font-bold';
                    if (icon) icon.className = icon.className.replace('text-indigo-400', 'text-white');
                } else {
                    btn.className = 'cfg-unit-btn p-3 rounded-2xl border border-slate-700 bg-[#1b233a] text-slate-300 text-left transition flex items-center space-x-2.5 hover:border-slate-600';
                    if (icon) {
                        icon.className = icon.className.replace('text-white', 'text-indigo-400');
                        if (!icon.className.includes('text-indigo-400')) {
                            icon.className += ' text-indigo-400';
                        }
                    }
                }
            });
        }

        function selectConfigLevel(level) {
            configLevel = level;
            document.querySelectorAll('.cfg-lvl-btn').forEach(btn => {
                if (btn.getAttribute('data-level') === level) {
                    btn.className = 'cfg-lvl-btn p-2.5 rounded-xl border border-indigo-400 bg-indigo-600 text-white text-xs font-bold text-center';
                } else {
                    btn.className = 'cfg-lvl-btn p-2.5 rounded-xl border border-slate-700 bg-[#1b233a] text-slate-300 text-xs font-bold text-center hover:border-slate-600';
                }
            });
        }

        function updateActiveConfigBadge() {
            const unitNames = {
                'all': '全単元', 'set': '①集合', 'settlement': '②代金清算',
                'discount': '③料金割引', 'installment': '④分割払い', 'speed': '⑤速さ①',
                'timetable': '⑤速さ②(時刻表)',
                'profit': '⑥損益算', 'probability': '⑦場合の数・確率', 'logical': '⑧推論①',
                'inference': '⑧推論②(数量推理)', 'table': '⑨表の読み取り'
            };
            const levelNames = { 'all': '全レベル', '1': 'Lv.1', '2': 'Lv.2', '3': 'Lv.3' };

            const badge = document.getElementById('active-config-badge');
            if (badge) {
                badge.innerText = `${unitNames[configUnit] || '全単元'} / ${levelNames[configLevel] || '全レベル'}`;
            }
        }


        function startPracticeWithConfig() {
            hideAllViews();
            document.getElementById('view-practice').classList.remove('hidden');
            const changeBtn = document.getElementById('nav-change-config-btn');
            if (changeBtn) changeBtn.classList.remove('hidden');

            updateActiveConfigBadge();
            sessionAnswers = [];
            generateNewQuestion();
        }

        function startQuestionTimer() {
            if (questionTimerInterval) clearInterval(questionTimerInterval);
            maxQuestionTime = 90;
            remainingQuestionTime = 90;

            const timerBar = document.getElementById('timer-bar');
            if (timerBar) {
                timerBar.style.width = '100%';
                timerBar.className = 'bg-indigo-500 h-full w-full transition-all duration-100 linear';
            }

            const startTime = Date.now();
            questionTimerInterval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                remainingQuestionTime = Math.max(0, maxQuestionTime - elapsed);
                const percent = (remainingQuestionTime / maxQuestionTime) * 100;

                if (timerBar) {
                    timerBar.style.width = percent + '%';
                    if (percent < 25) {
                        timerBar.className = 'bg-rose-500 h-full w-full transition-all duration-100 linear';
                    } else if (percent < 50) {
                        timerBar.className = 'bg-amber-500 h-full w-full transition-all duration-100 linear';
                    }
                }

                if (remainingQuestionTime <= 0) {
                    clearInterval(questionTimerInterval);
                    if (!isAnswered) {
                        checkAnswer(null);
                    }
                }
            }, 100);
        }

        function startCBTOverallTimer() {
            if (cbtOverallTimerInterval) clearInterval(cbtOverallTimerInterval);

            cbtOverallTimerInterval = setInterval(() => {
                cbtOverallRemainingTime--;

                const outerCircle = document.getElementById('cbt-circle-outer');
                if (outerCircle) {
                    const frac = cbtOverallRemainingTime / cbtMaxOverallTime;
                    outerCircle.style.strokeDashoffset = (314.16 * (1 - frac)).toString();
                }

                if (cbtOverallRemainingTime <= 0) {
                    clearInterval(cbtOverallTimerInterval);
                    finishCBTMode();
                }
            }, 1000);
        }

        function generateNewQuestion() {
            isAnswered = false;
            document.getElementById('explanation-card').classList.add('hidden');

            if (isCBTMode) {
                if (cbtQuestionIndex >= cbtTotalQuestions) {
                    finishCBTMode();
                    return;
                }
                cbtQuestionIndex++;
                updateCBTUI();
                
                const nextUnit = cbtUnitQueue.pop() || 'all';
                currentQuestion = generateQuestionByConfig(nextUnit, cbtCurrentLevel.toString());
            } else {
                currentQuestion = generateQuestionByConfig(configUnit, configLevel);
            }

            currentQuestion.choices = generateChoices(currentQuestion);

            const qMetaHeader = document.getElementById('q-meta-header');
            if (qMetaHeader) {
                if (isCBTMode) {
                    qMetaHeader.classList.add('hidden');
                } else {
                    qMetaHeader.classList.remove('hidden');
                }
            }

            document.getElementById('unit-badge').innerText = currentQuestion.unit;
            document.getElementById('q-badge').innerText = currentQuestion.badge;
            document.getElementById('q-pattern-title').innerText = currentQuestion.title;
            document.getElementById('q-text').innerHTML = currentQuestion.text;
            document.getElementById('q-prompt').innerText = currentQuestion.prompt;

            const container = document.getElementById('choices-container');
            container.innerHTML = '';

            currentQuestion.choices.forEach((choice) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn p-3.5 rounded-xl border border-slate-700 bg-[#1b233a] hover:bg-[#232c48] text-slate-200 text-xs md:text-sm font-medium transition text-left flex items-start space-x-2.5 w-full';
                btn.onclick = () => checkAnswer(choice);
                btn.innerHTML = `
                    <span class="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center shrink-0 border border-indigo-800/50 text-xs">${choice.label}</span>
                    <span class="pt-0.5">${choice.htmlText}</span>
                `;
                container.appendChild(btn);
            });

            startQuestionTimer();
        }

        function checkAnswer(selectedChoice) {
            if (isAnswered) return;
            isAnswered = true;

            if (questionTimerInterval) clearInterval(questionTimerInterval);

            const timeSpent = Math.max(1, Math.round(maxQuestionTime - remainingQuestionTime));
            const isCorrect = selectedChoice ? selectedChoice.isCorrect : false;

            totalCount++;
            if (isCorrect) correctCount++;

            // 単元別・レベル別成績の保存
            saveUnitLevelStat(currentQuestion.unit, currentQuestion.level, isCorrect, timeSpent);

            sessionAnswers.push({
                question: currentQuestion,
                selected: selectedChoice,
                isCorrect: isCorrect,
                timeSpent: timeSpent
            });

            if (isCBTMode) {
                if (isCorrect) {
                    if (cbtCurrentLevel < 3) cbtCurrentLevel++;
                } else {
                    if (cbtCurrentLevel > 1) cbtCurrentLevel--;
                }
            }

            // 解説・結果の表示
            const resultBanner = document.getElementById('result-banner');
            if (isCorrect) {
                resultBanner.className = 'rounded-2xl p-4 mb-5 flex items-center space-x-3 bg-emerald-950/80 border border-emerald-700/60 text-emerald-200';
                resultBanner.innerHTML = `
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold shrink-0">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm">正解！</h4>
                        <p class="text-xs text-emerald-300/80">解答時間: ${timeSpent}秒</p>
                    </div>
                `;
            } else {
                resultBanner.className = 'rounded-2xl p-4 mb-5 flex items-center space-x-3 bg-rose-950/80 border border-rose-700/60 text-rose-200';
                resultBanner.innerHTML = `
                    <div class="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 text-xl font-bold shrink-0">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm">${selectedChoice ? '不正解...' : '時間切れ！'}</h4>
                        <p class="text-xs text-rose-300/80">解答時間: ${timeSpent}秒</p>
                    </div>
                `;
            }

            const expContent = document.getElementById('explanation-content');
            expContent.innerHTML = currentQuestion.steps.map(step => `<p>${step}</p>`).join('');

            document.getElementById('explanation-card').classList.remove('hidden');
        }

        // CBT Mode Logics
        function openCBTModal() {
            document.getElementById('cbt-modal').classList.remove('hidden');
        }

        function closeCBTModal() {
            document.getElementById('cbt-modal').classList.add('hidden');
        }

        function toggleSyncDateSection() {
            const container = document.getElementById('sync-date-container');
            if (container) container.classList.toggle('hidden');
        }

        function startCBTMode(type) {
            closeCBTModal();
            isCBTMode = true;
            cbtModeType = type;
            cbtQuestionIndex = 0;
            cbtCurrentLevel = 1;
            totalCount = 0;
            correctCount = 0;
            sessionAnswers = [];
            initPRNG(null);

            if (type === 'mini') {
                cbtTotalQuestions = 9;
                cbtMaxOverallTime = 720; // 12分
                cbtUnitQueue = shuffleArray(['set', 'settlement', 'discount', 'installment', 'speed', 'timetable', 'profit', 'probability', 'logical', 'inference', 'table']);
            } else {
                cbtTotalQuestions = 20;
                cbtMaxOverallTime = 1200; // 20分
                cbtUnitQueue = [];
                for (let i = 0; i < 20; i++) cbtUnitQueue.push('all');
            }

            cbtOverallRemainingTime = cbtMaxOverallTime;

            hideAllViews();
            document.getElementById('cbt-status-bar').classList.remove('hidden');
            document.getElementById('view-practice').classList.remove('hidden');

            startCBTOverallTimer();
            generateNewQuestion();
        }

        function startSyncCBTMode() {
            const picker = document.getElementById('sync-date-picker');
            if (!picker || !picker.value) {
                alert('日付を選択してください。');
                return;
            }
            cbtSyncDate = picker.value;
            closeCBTModal();

            isCBTMode = true;
            cbtModeType = 'sync';
            cbtQuestionIndex = 0;
            cbtCurrentLevel = 1;
            totalCount = 0;
            correctCount = 0;
            sessionAnswers = [];

            initPRNG(cbtSyncDate);

            cbtTotalQuestions = 9;
            cbtMaxOverallTime = 720;
            cbtOverallRemainingTime = cbtMaxOverallTime;
            cbtUnitQueue = shuffleArray(['set', 'settlement', 'discount', 'installment', 'speed', 'timetable', 'profit', 'probability', 'logical', 'inference', 'table']);

            hideAllViews();
            document.getElementById('cbt-status-bar').classList.remove('hidden');
            document.getElementById('view-practice').classList.remove('hidden');

            startCBTOverallTimer();
            generateNewQuestion();
        }

        function updateCBTUI() {
            const modeBadge = document.getElementById('cbt-mode-badge');
            if (modeBadge) {
                if (cbtModeType === 'mini') modeBadge.innerHTML = '<i class="fa-solid fa-laptop-code mr-1.5"></i> ミニテスト';
                else if (cbtModeType === 'sync') modeBadge.innerHTML = '<i class="fa-solid fa-users mr-1.5"></i> 一斉テスト';
                else modeBadge.innerHTML = '<i class="fa-solid fa-graduation-cap mr-1.5"></i> フルテスト';
            }

            const innerCircle = document.getElementById('cbt-circle-inner');
            if (innerCircle) {
                const frac = cbtQuestionIndex / cbtTotalQuestions;
                innerCircle.style.strokeDashoffset = (226.19 * (1 - frac)).toString();
            }
        }

        function exitCBTMode() {
            if (confirm('CBT模擬試験を中断して終了しますか？')) {
                goToLanding();
            }
        }

        function finishCBTMode() {
            if (questionTimerInterval) clearInterval(questionTimerInterval);
            if (cbtOverallTimerInterval) clearInterval(cbtOverallTimerInterval);

            hideAllViews();
            document.getElementById('cbt-result-card').classList.remove('hidden');

            const scoreElem = document.getElementById('cbt-res-score');
            const accuracyElem = document.getElementById('cbt-res-accuracy');
            const lvlElem = document.getElementById('cbt-res-final-lvl');

            const accPct = Math.round((correctCount / Math.max(1, totalCount)) * 100);

            if (scoreElem) scoreElem.innerText = `${correctCount} / ${totalCount}`;
            if (accuracyElem) accuracyElem.innerText = `${accPct} %`;
            if (lvlElem) lvlElem.innerText = `Lv.${cbtCurrentLevel}`;

            const syncDateDisp = document.getElementById('cbt-sync-date-display');
            if (cbtModeType === 'sync' && cbtSyncDate) {
                if (syncDateDisp) syncDateDisp.classList.remove('hidden');
                document.getElementById('cbt-res-date-val').innerText = cbtSyncDate;
            } else {
                if (syncDateDisp) syncDateDisp.classList.add('hidden');
            }

            // 履歴への保存
            const record = {
                date: new Date().toLocaleDateString('ja-JP'),
                type: cbtModeType === 'sync' ? `一斉(${cbtSyncDate})` : (cbtModeType === 'mini' ? 'ミニ' : 'フル'),
                score: `${correctCount}/${totalCount}`,
                accuracy: `${accPct}%`,
                finalLevel: `Lv.${cbtCurrentLevel}`
            };
            globalHistory.unshift(record);
            if (globalHistory.length > 10) globalHistory.pop();
            try {
                localStorage.setItem('spi_cbt_history', JSON.stringify(globalHistory));
            } catch (e) {}
        }

        function copyCBTResult() {
            const accPct = Math.round((correctCount / Math.max(1, totalCount)) * 100);
            const modeText = cbtModeType === 'sync' ? `一斉テスト (${cbtSyncDate})` : (cbtModeType === 'mini' ? 'ミニテスト' : 'フルテスト');
            const text = `【SPI非言語 CBT模擬試験結果】\n形式: ${modeText}\n正解数: ${correctCount} / ${totalCount}\n正解率: ${accPct}%\n到達レベル: Lv.${cbtCurrentLevel}`;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    alert('結果をクリップボードにコピーしました！');
                }).catch(() => {
                    showFallbackCopyModal(text);
                });
            } else {
                showFallbackCopyModal(text);
            }
        }

        function showFallbackCopyModal(text) {
            const area = document.getElementById('fallback-copy-textarea');
            if (area) area.value = text;
            document.getElementById('fallback-copy-modal').classList.remove('hidden');
        }

        function closeFallbackModal() {
            document.getElementById('fallback-copy-modal').classList.add('hidden');
        }

        // 成績分析モーダルの処理
        function openStatsModal() {
            renderStats();
            document.getElementById('stats-modal').classList.remove('hidden');
        }

        function closeStatsModal() {
            document.getElementById('stats-modal').classList.add('hidden');
        }

        function renderStats() {
            const stats = loadUnitLevelStats();
            let grandTotal = 0;
            let grandCorrect = 0;
            let grandTime = 0;

            const listContainer = document.getElementById('stats-content-list');
            listContainer.innerHTML = '';

            UNIT_KEYS.forEach(u => {
                const uData = stats[u.key] || {};
                let uTotal = 0;
                let uCorrect = 0;
                let uTime = 0;

                const lvlRows = [1, 2, 3].map(lvl => {
                    const lData = uData[String(lvl)] || { total: 0, correct: 0, totalTime: 0 };
                    uTotal += lData.total;
                    uCorrect += lData.correct;
                    uTime += lData.totalTime;

                    const acc = lData.total > 0 ? Math.round((lData.correct / lData.total) * 100) : null;
                    const avgT = lData.total > 0 ? (lData.totalTime / lData.total).toFixed(1) : null;

                    return { lvl, total: lData.total, correct: lData.correct, acc, avgT };
                });

                grandTotal += uTotal;
                grandCorrect += uCorrect;
                grandTime += uTime;

                const uAcc = uTotal > 0 ? Math.round((uCorrect / uTotal) * 100) : null;
                const uAvgT = uTotal > 0 ? (uTime / uTotal).toFixed(1) : null;

                // 単元別カード構築
                const card = document.createElement('div');
                card.className = 'bg-[#1b233a] rounded-2xl p-4 border border-slate-800';

                let tableRowsHtml = lvlRows.map(r => {
                    const accText = r.acc !== null ? `${r.acc}%` : '--';
                    const timeText = r.avgT !== null ? `${r.avgT}秒` : '--';
                    const barColor = r.acc >= 70 ? 'bg-emerald-500' : (r.acc >= 50 ? 'bg-amber-500' : 'bg-rose-500');

                    return `
                        <tr class="border-b border-slate-800/60 text-xs">
                            <td class="py-2 text-slate-300 font-medium">Lv.${r.lvl}</td>
                            <td class="py-2 text-slate-400">${r.correct} / ${r.total}</td>
                            <td class="py-2 font-bold text-white">
                                <div class="flex items-center space-x-2">
                                    <span class="w-10 text-right">${accText}</span>
                                    ${r.acc !== null ? `<div class="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block"><div class="${barColor} h-full" style="width: ${r.acc}%"></div></div>` : ''}
                                </div>
                            </td>
                            <td class="py-2 text-slate-300 text-right">${timeText}</td>
                        </tr>
                    `;
                }).join('');

                card.innerHTML = `
                    <div class="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-700/80">
                        <h4 class="font-bold text-sm text-indigo-200">${u.name}</h4>
                        <div class="text-xs text-slate-400 space-x-3">
                            <span>単元正答率: <strong class="text-emerald-400 font-bold">${uAcc !== null ? uAcc + '%' : '--'}</strong></span>
                            <span>平均時間: <strong class="text-amber-400 font-bold">${uAvgT !== null ? uAvgT + '秒' : '--'}</strong></span>
                        </div>
                    </div>
                    <table class="w-full text-left">
                        <thead>
                            <tr class="text-[10px] text-slate-400 uppercase border-b border-slate-800">
                                <th class="pb-1.5">難易度</th>
                                <th class="pb-1.5">正解数</th>
                                <th class="pb-1.5">正答率</th>
                                <th class="pb-1.5 text-right">平均解答時間</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                `;
                listContainer.appendChild(card);
            });

            // 全体サマリーの更新
            const overallAcc = grandTotal > 0 ? Math.round((grandCorrect / grandTotal) * 100) : 0;
            const overallAvgT = grandTotal > 0 ? (grandTime / grandTotal).toFixed(1) : '0.0';

            document.getElementById('stats-total-count').innerText = `${grandTotal}問`;
            document.getElementById('stats-overall-accuracy').innerText = `${overallAcc}%`;
            document.getElementById('stats-overall-avg-time').innerText = `${overallAvgT}秒`;
        }

        // 回答振り返りモーダル
        function openReviewModal() {
            const container = document.getElementById('session-review-list');
            const info = document.getElementById('review-count-info');
            container.innerHTML = '';

            if (sessionAnswers.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center py-8">今回のセッションでの回答履歴はまだありません。</p>';
                if (info) info.innerText = '全 0 問の履歴';
            } else {
                if (info) info.innerText = `全 ${sessionAnswers.length} 問の履歴`;
                sessionAnswers.forEach((ans, idx) => {
                    const card = document.createElement('div');
                    card.className = `p-3.5 rounded-2xl border text-xs ${ans.isCorrect ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-rose-950/30 border-rose-800/40'}`;
                    card.innerHTML = `
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-slate-200">問 ${idx + 1} (${ans.question.unit} - ${ans.question.badge})</span>
                            <span class="font-bold ${ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}">${ans.isCorrect ? '正解' : '不正解'} (${ans.timeSpent}秒)</span>
                        </div>
                        <p class="text-slate-300 mb-2 leading-relaxed">${ans.question.prompt}</p>
                        <p class="text-slate-400 text-[11px]">選択した回答: <span class="text-white font-bold">${ans.selected ? ans.selected.htmlText : '未選択'}</span></p>
                    `;
                    container.appendChild(card);
                });
            }
            document.getElementById('review-modal').classList.remove('hidden');
        }

        function closeReviewModal() {
            document.getElementById('review-modal').classList.add('hidden');
        }

        // 履歴モーダル
        function openHistoryModal() {
            try {
                const stored = localStorage.getItem('spi_cbt_history');
                if (stored) globalHistory = JSON.parse(stored);
            } catch (e) {}

            const container = document.getElementById('global-history-list');
            container.innerHTML = '';

            if (globalHistory.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">CBT模擬試験の実施履歴はありません。</p>';
            } else {
                globalHistory.forEach((item) => {
                    const row = document.createElement('div');
                    row.className = 'bg-[#1b233a] p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center';
                    row.innerHTML = `
                        <div>
                            <span class="text-slate-400 font-mono text-[10px]">${item.date}</span>
                            <span class="ml-2 font-bold text-indigo-300">${item.type}</span>
                        </div>
                        <div class="text-right">
                            <span class="font-bold text-white mr-2">${item.score}</span>
                            <span class="text-emerald-400 font-bold">${item.accuracy}</span>
                        </div>
                    `;
                    container.appendChild(row);
                });
            }

            document.getElementById('history-modal').classList.remove('hidden');
        }

        function closeHistoryModal() {
            document.getElementById('history-modal').classList.add('hidden');
        }

        function clearGlobalHistory() {
            if (confirm('すべての模擬試験履歴を消去しますか？')) {
                globalHistory = [];
                localStorage.removeItem('spi_cbt_history');
                openHistoryModal();
            }
        }

        function resetStats() {
            if (confirm('累積の成績データ（単元別正答率・平均解答時間含む）および履歴を初期化しますか？')) {
                totalCount = 0;
                correctCount = 0;
                globalHistory = [];
                localStorage.removeItem('spi_cbt_history');
                localStorage.removeItem('spi_unit_level_stats_v1');
                alert('すべての成績データをクリアしました。');
            }
        }

        // 初期化処理
        window.addEventListener('DOMContentLoaded', () => {
            const todayStr = new Date().toISOString().split('T')[0];
            const picker = document.getElementById('sync-date-picker');
            if (picker) picker.value = todayStr;
        });
