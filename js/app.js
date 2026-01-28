// app.js - 主应用逻辑（完整版：保留所有原有功能 + 支持等级设置与多次记录）

let currentExercise = null; // 当前正在操作的动作
let currentEditDay = null; // 当前正在编辑的日期

// ========== 应用初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否首次使用
    if (DB.isFirstTime()) {
        showSetupModal();
    } else {
        initApp();
    }
});

// 初始化应用
function initApp() {
    renderHomePage();
    renderPlanPage();
    renderHistoryPage();
    renderProfilePage();
    setupNavigation();
    setupEventListeners();
    updateStats();
    checkRecoverySuggestion(); // 检查是否需要显示恢复建议
    requestNotificationPermission(); // 请求通知权限
}

// ========== 首次设置弹窗 ==========
function showSetupModal() {
    const modal = document.getElementById('setupModal');
    const grid = document.getElementById('setupGrid');

    // 生成设置界面
    let html = '';
    Object.values(EXERCISES).forEach(ex => {
        html += `
            <div style="margin-bottom:20px; padding:15px; background:var(--bg-input); border-radius:12px;">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                    <span style="font-size:24px;">${ex.icon}</span>
                    <span style="font-weight:600;">${ex.name}</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:8px;">
                    ${Array.from({length: 10}, (_, i) => {
                        const level = i + 1;
                        return `
                            <button class="level-select-btn" data-exercise="${ex.id}" data-level="${level}"
                                style="padding:10px; background:var(--bg-card); border:2px solid transparent; border-radius:8px; cursor:pointer; transition:all 0.2s;">
                                ${level}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;

    // 绑定等级选择事件
    const levelBtns = grid.querySelectorAll('.level-select-btn');
    const selectedLevels = {};

    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const exId = btn.dataset.exercise;
            const level = parseInt(btn.dataset.level);

            // 清除同组其他按钮的选中状态
            grid.querySelectorAll(`[data-exercise="${exId}"]`).forEach(b => {
                b.style.borderColor = 'transparent';
                b.style.background = 'var(--bg-card)';
            });

            // 设置当前按钮为选中状态
            btn.style.borderColor = 'var(--primary)';
            btn.style.background = 'rgba(102, 126, 234, 0.1)';

            selectedLevels[exId] = level;
        });

        // 默认选中第1级
        if (btn.dataset.level === '1') {
            btn.click();
        }
    });

    // 完成设置按钮
    document.getElementById('btnFinishSetup').onclick = () => {
        DB.saveUserLevels(selectedLevels);
        modal.classList.add('hidden');
        initApp();
        showToast('设置完成！开始你的训练之旅 💪');
    };

    modal.classList.remove('hidden');
}

// ========== 首页渲染 ==========
function renderHomePage() {
    renderTodayPlan();
    renderExerciseCards();
    updateStats();
}

// 渲染今日计划
function renderTodayPlan() {
    const container = document.getElementById('todayPlan');
    const todayPlan = DB.getTodayPlan();
    const todayLogs = DB.getTodayLogs();

    if (todayPlan.length === 0) {
        container.innerHTML = '<div class="today-rest"><span class="rest-icon">😴</span><span class="rest-text">今天是休息日</span></div>';
        return;
    }

    let html = '';
    todayPlan.forEach(exId => {
        const ex = EXERCISES[exId];
        const logs = todayLogs.filter(log => log.exerciseId === exId);
        const hasCompleted = logs.length > 0;

        html += `
            <div class="today-item ${hasCompleted ? 'completed' : ''}" data-exercise="${exId}">
                <span class="today-icon">${ex.icon}</span>
                <span class="today-name">${ex.name}</span>
                <span class="today-status">${hasCompleted ? '✅' : '⭕'}</span>
            </div>
        `;
    });

    container.innerHTML = html;

    // 绑定点击事件
    container.querySelectorAll('.today-item').forEach(item => {
        item.addEventListener('click', () => {
            const exId = item.dataset.exercise;
            openExerciseModal(exId);
        });
    });
}

// 渲染动作卡片
function renderExerciseCards() {
    const container = document.getElementById('exerciseCards');
    const userLevels = DB.getUserLevels();

    let html = '';
    Object.values(EXERCISES).forEach(ex => {
        const currentLevel = userLevels[ex.id];
        const levelInfo = getExerciseLevelInfo(ex.id, currentLevel);
        const stats = DB.getExerciseStats(ex.id);

        html += `
            <div class="exercise-card" data-exercise="${ex.id}" style="--card-color: ${ex.color}">
                <div class="exercise-icon">${ex.icon}</div>
                <div class="exercise-info">
                    <div class="exercise-name">${ex.name}</div>
                    <div class="exercise-level">第${currentLevel}式：${levelInfo.name}</div>
                    <div class="exercise-stats" style="font-size:11px; color:var(--text-muted); margin-top:4px;">
                        已训练 ${stats.totalWorkouts} 次
                    </div>
                </div>
                <div class="exercise-arrow">›</div>
            </div>
        `;
    });

    container.innerHTML = html;

    // 绑定点击事件
    container.querySelectorAll('.exercise-card').forEach(card => {
        card.addEventListener('click', () => {
            const exId = card.dataset.exercise;
            openExerciseModal(exId);
        });
    });
}

// ========== 动作详情弹窗 ==========
function openExerciseModal(exerciseId) {
    currentExercise = exerciseId;
    const modal = document.getElementById('exerciseModal');
    const ex = EXERCISES[exerciseId];
    const currentLevel = DB.getExerciseLevel(exerciseId);
    const levelInfo = getExerciseLevelInfo(exerciseId, currentLevel);

    // 填充头部
    const headerContent = modal.querySelector('.detail-header-content');
    headerContent.innerHTML = `
        <div class="exercise-detail-header">
            <div class="detail-icon">${ex.icon}</div>
            <div class="detail-title">
                <h2>${ex.name}</h2>
                <p>第${currentLevel}式：${levelInfo.name}</p>
            </div>
        </div>
    `;

    // 填充标准信息
    const standardsDiv = document.getElementById('exerciseStandards');
    standardsDiv.innerHTML = `
        <h3>训练标准</h3>
        <div class="standards-grid">
            <div class="standard-item">
                <div class="standard-label">初级</div>
                <div class="standard-value">${levelInfo.beginner}次</div>
            </div>
            <div class="standard-item highlight">
                <div class="standard-label">中级</div>
                <div class="standard-value">${levelInfo.intermediate}次</div>
            </div>
            <div class="standard-item">
                <div class="standard-label">高级</div>
                <div class="standard-value">${levelInfo.advanced}次</div>
            </div>
        </div>
        <p class="text-muted mt-2" style="font-size:13px;">💡 ${levelInfo.tips}</p>
    `;

    // 获取智能建议
    const recentLogs = DB.getExerciseRecentLogs(exerciseId, 5);
    const recommendation = getSmartRecommendation(exerciseId, currentLevel, recentLogs);

    // 重置输入（使用智能推荐值）
    document.getElementById('inputReps').value = recommendation.reps;
    document.getElementById('inputSets').value = recommendation.sets;
    document.getElementById('inputNote').value = '';

    // 显示推荐提示
    if (recommendation.message) {
        const recommendDiv = document.createElement('div');
        recommendDiv.style.cssText = 'padding:10px; background:rgba(102,126,234,0.1); border-radius:8px; margin-top:10px; font-size:13px;';
        recommendDiv.innerHTML = `💡 ${recommendation.message}`;
        standardsDiv.appendChild(recommendDiv);
    }

    // 渲染今日已记录
    renderTodayLogs(exerciseId);

    // 检查进阶条件
    checkProgressionCondition(exerciseId);

    modal.classList.remove('hidden');
}

// 智能推荐算法（保留原有功能）
function getSmartRecommendation(exerciseId, currentLevel, recentLogs) {
    const levelInfo = getExerciseLevelInfo(exerciseId, currentLevel);

    // 默认推荐中级标准
    let recommendedReps = levelInfo.intermediate;
    let recommendedSets = 3;
    let message = '';

    if (recentLogs.length === 0) {
        message = '首次训练，建议从中级标准开始';
        return { reps: recommendedReps, sets: recommendedSets, message };
    }

    // 分析最近一次表现
    const lastLog = recentLogs[0];

    if (lastLog.feeling === 'easy') {
        recommendedReps = Math.min(lastLog.reps + 2, levelInfo.advanced);
        message = '上次感觉轻松，建议增加次数';
    } else if (lastLog.feeling === 'hard') {
        recommendedReps = Math.max(lastLog.reps - 2, levelInfo.beginner);
        message = '上次感觉困难，建议适当减少';
    } else {
        recommendedReps = lastLog.reps;
        message = '保持上次的训练强度';
    }

    return { reps: recommendedReps, sets: recommendedSets, message };
}

// 检查进阶条件（保留原有功能）
function checkProgressionCondition(exerciseId) {
    const currentLevel = DB.getExerciseLevel(exerciseId);
    if (currentLevel >= 10) return; // 已是最高级

    const recentLogs = DB.getExerciseRecentLogs(exerciseId, 10);
    const result = checkProgression(exerciseId, currentLevel, recentLogs);

    if (result.canProgress) {
        showProgressionBanner(exerciseId);
    }
}

// 显示进阶横幅
function showProgressionBanner(exerciseId) {
    const modal = document.getElementById('exerciseModal');
    const existingBanner = modal.querySelector('.progression-banner');
    if (existingBanner) return; // 已存在

    const ex = EXERCISES[exerciseId];
    const currentLevel = DB.getExerciseLevel(exerciseId);
    const nextLevel = currentLevel + 1;
    const nextLevelInfo = getExerciseLevelInfo(exerciseId, nextLevel);

    const banner = document.createElement('div');
    banner.className = 'progression-banner';
    banner.style.cssText = 'padding:15px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:12px; margin:15px 0; color:white;';
    banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <span style="font-size:24px;">🎉</span>
            <div>
                <div style="font-weight:700; font-size:16px;">恭喜！可以进阶了</div>
                <div style="font-size:13px; opacity:0.9;">下一式：${nextLevelInfo.name}</div>
            </div>
        </div>
        <button id="btnProgressNow" style="width:100%; padding:10px; background:white; color:#667eea; border:none; border-radius:8px; font-weight:600; cursor:pointer;">
            立即进阶到第${nextLevel}式
        </button>
        <button id="btnStayLevel" style="width:100%; padding:10px; background:transparent; color:white; border:1px solid rgba(255,255,255,0.5); border-radius:8px; margin-top:8px; cursor:pointer;">
            继续巩固当前等级
        </button>
    `;

    modal.querySelector('.detail-body').insertBefore(banner, modal.querySelector('.detail-body').firstChild);

    // 绑定按钮事件
    document.getElementById('btnProgressNow').onclick = () => {
        DB.setExerciseLevel(exerciseId, nextLevel);
        showToast(`🎉 已进阶到第${nextLevel}式！`);
        openExerciseModal(exerciseId);
        renderHomePage();
    };

    document.getElementById('btnStayLevel').onclick = () => {
        banner.remove();
    };
}

// 渲染今日已完成的记录
function renderTodayLogs(exerciseId) {
    const container = document.getElementById('todayLogsList');
    const logs = DB.getTodayExerciseLogs(exerciseId);

    if (logs.length === 0) {
        container.innerHTML = '<p class="text-muted text-center" style="padding:20px;">今天还没有记录</p>';
        return;
    }

    let html = '<h4 style="margin-bottom:10px; font-size:14px;">今日已完成</h4>';
    logs.forEach(log => {
        const time = new Date(log.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
        const feelingEmoji = {'easy': '😊', 'moderate': '😐', 'hard': '😰'}[log.feeling] || '';

        html += `
            <div class="recent-log-item" style="position:relative;">
                <span class="log-date">${time}</span>
                <div class="log-main">
                    <span class="log-name">第${log.level}式</span>
                    <span class="log-result">${log.sets}组 × ${log.reps}次 ${feelingEmoji}</span>
                </div>
                ${log.note ? `<p class="text-muted" style="font-size:12px; margin-top:4px;">${log.note}</p>` : ''}
                <button class="delete-log-btn" data-log-id="${log.id}"
                    style="position:absolute; top:50%; right:10px; transform:translateY(-50%);
                    background:var(--danger); border:none; color:white; width:24px; height:24px;
                    border-radius:50%; cursor:pointer; font-size:14px;">×</button>
            </div>
        `;
    });

    container.innerHTML = html;

    // 绑定删除按钮
    container.querySelectorAll('.delete-log-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const logId = btn.dataset.logId;
            if (confirm('确定要删除这条记录吗？')) {
                DB.deleteTrainingLog(logId);
                renderTodayLogs(exerciseId);
                renderHomePage();
                updateStats();
                showToast('记录已删除');
            }
        });
    });
}

// ========== 等级选择弹窗 ==========
function openLevelSelectModal() {
    if (!currentExercise) return;

    const modal = document.getElementById('levelSelectModal');
    const grid = document.getElementById('levelGridOptions');
    const currentLevel = DB.getExerciseLevel(currentExercise);

    let html = '';
    for (let i = 1; i <= 10; i++) {
        const levelInfo = getExerciseLevelInfo(currentExercise, i);
        const isActive = i === currentLevel;

        html += `
            <button class="level-option-btn ${isActive ? 'active' : ''}" data-level="${i}"
                style="padding:12px 8px; background:${isActive ? 'var(--primary)' : 'var(--bg-input)'};
                border:2px solid ${isActive ? 'var(--primary)' : 'transparent'};
                border-radius:10px; cursor:pointer; text-align:center; transition:all 0.2s;">
                <div style="font-size:18px; font-weight:700;">${i}</div>
                <div style="font-size:11px; margin-top:4px; opacity:0.8;">${levelInfo.name}</div>
            </button>
        `;
    }

    grid.innerHTML = html;

    // 绑定选择事件
    grid.querySelectorAll('.level-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const newLevel = parseInt(btn.dataset.level);
            DB.setExerciseLevel(currentExercise, newLevel);
            modal.classList.add('hidden');

            // 刷新动作详情弹窗
            openExerciseModal(currentExercise);
            renderHomePage();
            showToast(`已切换到第${newLevel}式`);
        });
    });

    modal.classList.remove('hidden');
}

// ========== 保存训练记录 ==========
function saveTrainingLog() {
    if (!currentExercise) return;

    const reps = parseInt(document.getElementById('inputReps').value);
    const sets = parseInt(document.getElementById('inputSets').value);
    const note = document.getElementById('inputNote').value.trim();
    const feeling = document.querySelector('input[name="feeling"]:checked')?.value || '';

    if (reps < 1 || sets < 1) {
        showToast('请输入有效的次数和组数');
        return;
    }

    // 保存记录
    DB.addTrainingLog(currentExercise, reps, sets, note, feeling);

    // 刷新界面
    renderTodayLogs(currentExercise);
    renderHomePage();
    updateStats();

    // 重置输入
    const currentLevel = DB.getExerciseLevel(currentExercise);
    const levelInfo = getExerciseLevelInfo(currentExercise, currentLevel);
    document.getElementById('inputReps').value = levelInfo.intermediate;
    document.getElementById('inputSets').value = 1;
    document.getElementById('inputNote').value = '';

    // 取消选中感受
    document.querySelectorAll('input[name="feeling"]').forEach(input => {
        input.checked = false;
    });

    showToast('记录已保存 ✅');

    // 检查是否达到进阶条件
    setTimeout(() => checkProgressionCondition(currentExercise), 500);
}

// ========== 中断恢复建议（保留原有功能）==========
function checkRecoverySuggestion() {
    const gapDays = DB.checkTrainingGap(3);

    if (gapDays > 0) {
        showRecoveryBanner(gapDays);
    }
}

function showRecoveryBanner(gapDays) {
    const banner = document.getElementById('recoveryBanner');
    if (!banner) return;

    let message = '';
    if (gapDays <= 7) {
        message = `已经${gapDays}天没有训练了，今天就开始吧！💪`;
    } else if (gapDays <= 14) {
        message = `中断${gapDays}天，建议从上次训练量的80%开始`;
    } else {
        message = `中断${gapDays}天，建议降低1-2个等级重新开始`;
    }

    banner.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>🔥 ${message}</span>
            <button id="btnDismissRecovery" style="background:transparent; border:none; color:white; font-size:20px; cursor:pointer;">×</button>
        </div>
    `;
    banner.classList.remove('hidden');

    document.getElementById('btnDismissRecovery').onclick = () => {
        banner.classList.add('hidden');
        DB.recordRecovery();
    };
}

// ========== 事件监听 ==========
function setupEventListeners() {
    // 关闭弹窗
    document.getElementById('closeExerciseModal')?.addEventListener('click', () => {
        document.getElementById('exerciseModal').classList.add('hidden');
        currentExercise = null;
    });

    document.getElementById('closeLevelModal')?.addEventListener('click', () => {
        document.getElementById('levelSelectModal').classList.add('hidden');
    });

    document.getElementById('closeEditDayModal')?.addEventListener('click', () => {
        document.getElementById('editDayModal').classList.add('hidden');
        currentEditDay = null;
    });

    // 打开等级选择
    document.getElementById('btnOpenLevelSelect')?.addEventListener('click', openLevelSelectModal);

    // 次数加减
    document.getElementById('btnPlus')?.addEventListener('click', () => {
        const input = document.getElementById('inputReps');
        input.value = parseInt(input.value) + 1;
    });

    document.getElementById('btnMinus')?.addEventListener('click', () => {
        const input = document.getElementById('inputReps');
        input.value = Math.max(1, parseInt(input.value) - 1);
    });

    // 保存记录
    document.getElementById('btnSaveLog')?.addEventListener('click', saveTrainingLog);

    // 个人页面事件
    bindProfileEvents();
}

// 绑定个人页面事件
function bindProfileEvents() {
    // 通知开关
    const notifSwitch = document.getElementById('notificationSwitch');
    if (notifSwitch) {
        const settings = DB.getSettings();
        notifSwitch.checked = settings.notifications;

        notifSwitch.addEventListener('change', (e) => {
            DB.updateSetting('notifications', e.target.checked);
            if (e.target.checked) {
                requestNotificationPermission();
            }
            showToast(e.target.checked ? '已开启通知' : '已关闭通知');
        });
    }

    // 导出数据
    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
        const data = DB.exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `convict-fitness-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        showToast('数据已导出 ✅');
    });

    // 导入数据
    document.getElementById('importDataBtn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm('确定要导入数据吗？这将覆盖当前所有数据！')) {
                        DB.importData(data);
                        location.reload();
                    }
                } catch (err) {
                    showToast('导入失败：文件格式错误');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // 清空数据
    document.getElementById('clearDataBtn')?.addEventListener('click', () => {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            DB.clearAll();
            location.reload();
        }
    });
}

// ========== 导航 ==========
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.dataset.page;

            // 更新导航状态
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 切换页面
            pages.forEach(page => page.classList.add('hidden'));
            document.getElementById(`${targetPage}-page`)?.classList.remove('hidden');

            // 刷新对应页面
            if (targetPage === 'plan') renderPlanPage();
            if (targetPage === 'history') renderHistoryPage();
            if (targetPage === 'profile') renderProfilePage();
        });
    });
}

// ========== 计划页面 ==========
function renderPlanPage() {
    const container = document.getElementById('weeklyPlan');
    const plan = DB.getWeeklyPlan();
    const days = [
        {key: 'monday', name: '周一'},
        {key: 'tuesday', name: '周二'},
        {key: 'wednesday', name: '周三'},
        {key: 'thursday', name: '周四'},
        {key: 'friday', name: '周五'},
        {key: 'saturday', name: '周六'},
        {key: 'sunday', name: '周日'}
    ];

    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    let html = '';
    days.forEach((day, index) => {
        const exercises = plan[day.key] || [];
        const isToday = index === todayIndex;

        html += `
            <div class="plan-day ${isToday ? 'today' : ''}" data-day="${day.key}">
                <div class="plan-day-header">
                    <span class="day-name">${day.name}</span>
                    ${isToday ? '<span class="today-badge">今天</span>' : ''}
                </div>
                <div class="plan-day-content">
                    ${exercises.length > 0
                        ? exercises.map(exId => `<span style="margin:0 4px;">${EXERCISES[exId].icon}</span>`).join('')
                        : '<span class="rest-text">休息</span>'}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // 绑定点击编辑
    container.querySelectorAll('.plan-day').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            openEditDayModal(dayEl.dataset.day);
        });
    });
}

// 打开编辑日期计划弹窗
function openEditDayModal(dayKey) {
    currentEditDay = dayKey;
    const modal = document.getElementById('editDayModal');
    const plan = DB.getWeeklyPlan();
    const currentPlan = plan[dayKey] || [];

    const dayNames = {
        monday: '周一', tuesday: '周二', wednesday: '周三',
        thursday: '周四', friday: '周五', saturday: '周六', sunday: '周日'
    };

    document.getElementById('editDayTitle').textContent = `编辑${dayNames[dayKey]}计划`;

    const grid = document.getElementById('exerciseSelectGrid');
    let html = '';
    Object.values(EXERCISES).forEach(ex => {
        const isSelected = currentPlan.includes(ex.id);
        html += `
            <button class="exercise-select-btn ${isSelected ? 'selected' : ''}" data-exercise="${ex.id}"
                style="padding:15px; background:${isSelected ? 'var(--primary)' : 'var(--bg-input)'};
                border:2px solid ${isSelected ? 'var(--primary)' : 'transparent'};
                border-radius:12px; cursor:pointer; text-align:center; transition:all 0.2s;">
                <div style="font-size:24px; margin-bottom:5px;">${ex.icon}</div>
                <div style="font-size:13px;">${ex.name}</div>
            </button>
        `;
    });

    grid.innerHTML = html;

    // 绑定选择事件
    const selectedExercises = new Set(currentPlan);
    grid.querySelectorAll('.exercise-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const exId = btn.dataset.exercise;
            if (selectedExercises.has(exId)) {
                selectedExercises.delete(exId);
                btn.classList.remove('selected');
                btn.style.background = 'var(--bg-input)';
                btn.style.borderColor = 'transparent';
            } else {
                selectedExercises.add(exId);
                btn.classList.add('selected');
                btn.style.background = 'var(--primary)';
                btn.style.borderColor = 'var(--primary)';
            }
        });
    });

    // 保存按钮
    document.getElementById('btnSaveDayPlan').onclick = () => {
        DB.updateDayPlan(dayKey, Array.from(selectedExercises));
        modal.classList.add('hidden');
        renderPlanPage();
        renderHomePage();
        showToast('计划已更新');
    };

    modal.classList.remove('hidden');
}

// ========== 历史页面 ==========
function renderHistoryPage() {
    renderCalendar();
    renderRecentLogs();
}

function renderCalendar() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    document.getElementById('calendarMonth').textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const container = document.getElementById('calendarGrid');
    let html = '';

    // 填充空白
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // 获取本月训练日期
    const trainingDates = DB.getMonthTrainingDates(year, month);

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}/${month + 1}/${day}`;
        const hasTraining = trainingDates.includes(dateStr);
        const isToday = day === new Date().getDate() && month === new Date().getMonth();

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
                ${day}
                ${hasTraining ? '<span class="status-dot completed"></span>' : ''}
            </div>
        `;
    }

    container.innerHTML = html;
}

function renderRecentLogs() {
    const container = document.getElementById('recentLogs');
    const logs = DB.getRecentLogs(15);

    if (logs.length === 0) {
        container.innerHTML = '<p class="empty-text">还没有训练记录</p>';
        return;
    }

    let html = '';
    logs.forEach(log => {
        const ex = EXERCISES[log.exerciseId];
        const time = new Date(log.timestamp).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        const feelingEmoji = {'easy': '😊', 'moderate': '😐', 'hard': '😰'}[log.feeling] || '';

        html += `
            <div class="recent-log-item">
                <span class="log-date">${time}</span>
                <div class="log-main">
                    <span class="log-icon">${ex.icon}</span>
                    <span class="log-name">${ex.name} 第${log.level}式</span>
                </div>
                <span class="log-result">${log.sets}×${log.reps} ${feelingEmoji}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ========== 个人页面 ==========
function renderProfilePage() {
    const stats = DB.getStats();
    document.getElementById('profileTotalDays').textContent = stats.totalDays;
    document.getElementById('profileStreak').textContent = stats.currentStreak;
    document.getElementById('profileRecovery').textContent = stats.recoveryCount || 0;
}

// ========== 统计更新 ==========
function updateStats() {
    const stats = DB.getStats();
    document.getElementById('totalDays').textContent = stats.totalDays;
    document.getElementById('currentStreak').textContent = stats.currentStreak;
    document.getElementById('longestStreak').textContent = stats.longestStreak;
}

// ========== 通知权限 ==========
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ========== Toast提示 ==========
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2000);
}
