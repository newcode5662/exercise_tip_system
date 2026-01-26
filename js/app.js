/**
 * 主应用逻辑
 */

const App = {
    // 当前状态
    state: {
        currentPage: 'home',
        selectedExercise: null,
        editingDay: 0,
        calendarDate: new Date()
    },
    
    // 初始化应用
    async init() {
        try {
            Utils.showLoading();
            
            // 初始化数据库
            await DB.init();
            await DB.initDefaultProgress();
            await DB.initDefaultPlan();
            
            // 初始化通知
            await NotificationManager.init();
            
            // 渲染首页
            await this.renderHome();
            
            // 绑定事件
            this.bindEvents();
            
            // 检查是否需要显示恢复建议
            await this.checkRecoverySuggestion();
            
            // 设置智能提醒
            await NotificationManager.scheduleSmartReminder();
            
            Utils.hideLoading();
        } catch (error) {
            console.error('应用初始化失败:', error);
            Utils.hideLoading();
            Utils.showToast('初始化失败，请刷新页面');
        }
    },
    
    // 绑定全局事件
    bindEvents() {
        // 底部导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });
        
        // 返回按钮
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.goBack());
        });
        
        // 弹窗关闭
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAllModals();
                }
            });
        });
        
        // 关闭按钮
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
    },
    
    // 页面导航
    navigateTo(page) {
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });
        
        // 显示目标页面
        this.state.currentPage = page;
        
        switch (page) {
            case 'home':
                document.getElementById('home-page').classList.remove('hidden');
                this.renderHome();
                break;
            case 'plan':
                document.getElementById('plan-page').classList.remove('hidden');
                this.renderPlan();
                break;
            case 'history':
                document.getElementById('history-page').classList.remove('hidden');
                this.renderHistory();
                break;
            case 'profile':
                document.getElementById('profile-page').classList.remove('hidden');
                this.renderProfile();
                break;
        }
    },
    
    // 返回
    goBack() {
        this.closeAllModals();
        if (this.state.selectedExercise) {
            this.state.selectedExercise = null;
            this.renderHome();
        }
    },
    
    // 关闭所有弹窗
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.add('hidden');
        });
    },
    
    // ========== 首页相关 ==========
    
    // 渲染首页
    async renderHome() {
        await this.renderStats();
        await this.renderTodayPlan();
        await this.renderExerciseCards();
    },
    
    // 渲染统计数据
    async renderStats() {
        const stats = await DB.recalculateStats();
        
        document.getElementById('totalDays').textContent = stats.totalDays;
        document.getElementById('currentStreak').textContent = stats.currentStreak;
        document.getElementById('longestStreak').textContent = stats.longestStreak;
        document.getElementById('recoveryCount').textContent = stats.recoveryCount;
    },
    
    // 渲染今日计划
    async renderTodayPlan() {
        const plan = await DB.getWeeklyPlan();
        const dayOfWeek = Utils.getDayOfWeek();
        const todayPlan = plan[dayOfWeek] || [];
        const todayLogs = await DB.getLogsByDate(Utils.getToday());
        
        const container = document.getElementById('todayPlan');
        
        if (todayPlan.length === 0) {
            container.innerHTML = `
                <div class="today-rest">
                    <span class="rest-icon">😴</span>
                    <span>今天是休息日</span>
                </div>
            `;
            return;
        }
        
        const items = todayPlan.map(exerciseType => {
            const typeInfo = Exercises.getExerciseType(exerciseType);
            const log = todayLogs.find(l => l.exerciseType === exerciseType);
            const completed = log?.completed;
            const skipped = log && !log.completed;
            
            let statusClass = '';
            let statusIcon = '';
            
            if (completed) {
                statusClass = 'completed';
                statusIcon = '✓';
            } else if (skipped) {
                statusClass = 'skipped';
                statusIcon = '✗';
            }
            
            return `
                <div class="today-item ${statusClass}" data-type="${exerciseType}">
                    <span class="today-icon">${typeInfo?.icon || '💪'}</span>
                    <span class="today-name">${typeInfo?.name || exerciseType}</span>
                    ${statusIcon ? `<span class="today-status">${statusIcon}</span>` : ''}
                </div>
            `;
        }).join('');
        
        container.innerHTML = items;
        
        // 绑定点击事件
        container.querySelectorAll('.today-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                this.openExerciseDetail(type);
            });
        });
    },
    
    // 渲染动作卡片
    async renderExerciseCards() {
        const progress = await DB.getAllProgress();
        const container = document.getElementById('exerciseCards');
        
        const cards = Exercises.getAllTypes().map(type => {
            const userProgress = progress.find(p => p.exerciseType === type.key);
            const level = userProgress?.level || 1;
            const levelInfo = Exercises.getLevel(type.key, level);
            
            return `
                <div class="exercise-card" data-type="${type.key}" style="--card-color: ${type.color}">
                    <div class="exercise-icon">${type.icon}</div>
                    <div class="exercise-info">
                        <div class="exercise-name">${type.name}</div>
                        <div class="exercise-level">第${level}式 · ${levelInfo?.name || ''}</div>
                    </div>
                    <div class="exercise-arrow">›</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = cards;
        
        // 绑定点击事件
        container.querySelectorAll('.exercise-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                this.openExerciseDetail(type);
            });
        });
    },
    
    // 检查恢复建议
    async checkRecoverySuggestion() {
        const suggestion = await Progression.generateRecoverySuggestion();
        
        if (suggestion.show) {
            const container = document.createElement('div');
            container.className = 'recovery-banner';
            container.innerHTML = `
                <div class="recovery-icon">${suggestion.icon}</div>
                <div class="recovery-content">
                    <div class="recovery-title">${suggestion.title}</div>
                    <div class="recovery-message">${suggestion.message}</div>
                </div>
                <button class="recovery-close" onclick="this.parentElement.remove()">×</button>
            `;
            
            const main = document.querySelector('.main-content');
            main.insertBefore(container, main.firstChild);
        }
    },
    
    // ========== 动作详情相关 ==========
    
    // 打开动作详情
    async openExerciseDetail(exerciseType) {
        this.state.selectedExercise = exerciseType;
        
        const typeInfo = Exercises.getExerciseType(exerciseType);
        const progress = await DB.getProgress(exerciseType);
        const level = progress?.level || 1;
        const levelInfo = Exercises.getLevel(exerciseType, level);
        const recommendation = await Progression.getTodayRecommendation(exerciseType);
        
        // 检查今天是否已记录
        const todayLogs = await DB.getLogsByDate(Utils.getToday());
        const todayLog = todayLogs.find(l => l.exerciseType === exerciseType);
        
        const modal = document.getElementById('exerciseModal');
        
        // 设置头部
        modal.querySelector('.modal-header').innerHTML = `
            <button class="close-btn">×</button>
            <div class="exercise-detail-header">
                <span class="detail-icon" style="color: ${typeInfo.color}">${typeInfo.icon}</span>
                <div class="detail-title">
                    <h2>${typeInfo.name}</h2>
                    <p>第${level}式 · ${levelInfo.name}</p>
                </div>
            </div>
        `;
        
        // 设置内容
        modal.querySelector('.modal-body').innerHTML = `
            <div class="level-info">
                <h3>动作说明</h3>
                <p>${levelInfo.description}</p>
                <p class="tips">💡 ${levelInfo.tips}</p>
            </div>
            
            <div class="standards-info">
                <h3>进阶标准</h3>
                <div class="standards-grid">
                    <div class="standard-item">
                        <div class="standard-label">初级</div>
                        <div class="standard-value">${levelInfo.beginner.sets}×${levelInfo.beginner.reps}</div>
                    </div>
                    <div class="standard-item">
                        <div class="standard-label">中级</div>
                        <div class="standard-value">${levelInfo.intermediate.sets}×${levelInfo.intermediate.reps}</div>
                    </div>
                    <div class="standard-item highlight">
                        <div class="standard-label">进阶</div>
                        <div class="standard-value">${levelInfo.progression.sets}×${levelInfo.progression.reps}</div>
                    </div>
                </div>
            </div>
            
            <div class="recommendation-info">
                <h3>今日推荐</h3>
                <div class="recommendation-value">
                    ${recommendation.sets}组 × ${recommendation.reps}次
                </div>
                ${recommendation.basedOnLast ? '<p class="recommendation-note">基于上次训练表现推荐</p>' : ''}
            </div>
            
            ${todayLog ? `
                <div class="today-record">
                    <h3>今日记录</h3>
                    <p>${todayLog.completed ? 
                        `✅ 已完成 ${todayLog.sets}×${todayLog.reps}，感觉${Utils.getFeelingText(todayLog.feeling)}` : 
                        `⏭️ 已跳过，原因：${Utils.getReasonText(todayLog.skipReason)}`
                    }</p>
                </div>
            ` : ''}
        `;
        
        // 设置底部按钮
        modal.querySelector('.modal-footer').innerHTML = `
            ${!todayLog ? `
                <button class="btn btn-primary btn-block" id="startWorkoutBtn">
                    开始训练
                </button>
                <button class="btn btn-outline btn-block" id="skipWorkoutBtn">
                    今天跳过
                </button>
            ` : `
                <button class="btn btn-outline btn-block" id="viewProgressBtn">
                    查看进阶建议
                </button>
            `}
        `;
        
        // 绑定事件
        modal.querySelector('.close-btn').addEventListener('click', () => this.closeAllModals());
        
        if (!todayLog) {
            document.getElementById('startWorkoutBtn')?.addEventListener('click', () => {
                this.openWorkoutLogger(exerciseType, recommendation);
            });
            
            document.getElementById('skipWorkoutBtn')?.addEventListener('click', () => {
                this.openSkipModal(exerciseType);
            });
        } else {
            document.getElementById('viewProgressBtn')?.addEventListener('click', () => {
                this.showProgressionSuggestion(exerciseType);
            });
        }
        
        modal.classList.remove('hidden');
    },
    
    // 打开训练记录器
    openWorkoutLogger(exerciseType, recommendation) {
        const modal = document.getElementById('workoutModal');
        const typeInfo = Exercises.getExerciseType(exerciseType);
        
        let sets = recommendation.sets;
        let reps = recommendation.reps;
        
        modal.querySelector('.modal-header').innerHTML = `
            <button class="close-btn">×</button>
            <h2>${typeInfo.icon} 记录训练</h2>
        `;
        
        modal.querySelector('.modal-body').innerHTML = `
            <div class="counter-section">
                <label>组数</label>
                <div class="counter">
                    <button class="counter-btn minus" data-target="sets">−</button>
                    <input type="number" id="setsInput" value="${sets}" min="1" max="20">
                    <button class="counter-btn plus" data-target="sets">+</button>
                </div>
            </div>
            
            <div class="counter-section">
                <label>每组次数</label>
                <div class="counter">
                    <button class="counter-btn minus" data-target="reps">−</button>
                    <input type="number" id="repsInput" value="${reps}" min="1" max="100">
                    <button class="counter-btn plus" data-target="reps">+</button>
                </div>
            </div>
            
            <div class="feeling-section">
                <label>训练感觉</label>
                <div class="feeling-options">
                                        <button class="feeling-btn" data-feeling="easy">😊<span>轻松</span></button>
                    <button class="feeling-btn active" data-feeling="normal">😐<span>正常</span></button>
                    <button class="feeling-btn" data-feeling="hard">😓<span>吃力</span></button>
                    <button class="feeling-btn" data-feeling="exhausted">😵<span>崩溃</span></button>
                </div>
            </div>
            
            <div class="notes-section">
                <label>备注（可选）</label>
                <textarea id="notesInput" placeholder="记录一些想法..."></textarea>
            </div>
        `;
        
        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn btn-primary btn-block" id="saveWorkoutBtn">
                💾 保存记录
            </button>
        `;
        
        // 绑定事件
        modal.querySelector('.close-btn').addEventListener('click', () => this.closeAllModals());
        
        // 计数器按钮
        modal.querySelectorAll('.counter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const input = document.getElementById(target + 'Input');
                const currentValue = parseInt(input.value) || 0;
                
                if (btn.classList.contains('plus')) {
                    input.value = currentValue + 1;
                } else {
                    input.value = Math.max(1, currentValue - 1);
                }
            });
        });
        
        // 感觉选择
        modal.querySelectorAll('.feeling-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.feeling-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // 保存按钮
        document.getElementById('saveWorkoutBtn').addEventListener('click', async () => {
            const setsValue = parseInt(document.getElementById('setsInput').value);
            const repsValue = parseInt(document.getElementById('repsInput').value);
            const feelingValue = modal.querySelector('.feeling-btn.active')?.dataset.feeling || 'normal';
            const notesValue = document.getElementById('notesInput').value;
            
            await this.saveWorkout(exerciseType, {
                sets: setsValue,
                reps: repsValue,
                feeling: feelingValue,
                notes: notesValue
            });
        });
        
        this.closeAllModals();
        modal.classList.remove('hidden');
    },
    
    // 保存训练记录
    async saveWorkout(exerciseType, data) {
        try {
            Utils.showLoading();
            
            const progress = await DB.getProgress(exerciseType);
            const log = {
                date: Utils.getToday(),
                exerciseType,
                level: progress?.level || 1,
                sets: data.sets,
                reps: data.reps,
                feeling: data.feeling,
                notes: data.notes,
                completed: true,
                createdAt: new Date().toISOString()
            };
            
            await DB.saveLog(log);
            
            // 检查是否达到进阶标准
            const progressCheck = Exercises.checkProgression(
                exerciseType, 
                log.level, 
                data.sets, 
                data.reps, 
                data.feeling
            );
            
            Utils.hideLoading();
            this.closeAllModals();
            
            // 重新渲染
            await this.renderHome();
            
            // 显示结果
            if (progressCheck.canProgress) {
                this.showProgressionModal(exerciseType, progressCheck);
            } else {
                Utils.showToast('💪 训练已记录！');
            }
            
        } catch (error) {
            Utils.hideLoading();
            console.error('保存失败:', error);
            Utils.showToast('保存失败，请重试');
        }
    },
    
    // 显示进阶弹窗
    showProgressionModal(exerciseType, progressCheck) {
        const modal = document.getElementById('confirmModal');
        const typeInfo = Exercises.getExerciseType(exerciseType);
        const progress = progressCheck;
        
        modal.querySelector('.modal-body').innerHTML = `
            <div class="progression-celebration">
                <div class="celebration-icon">🎉</div>
                <h2>恭喜达到进阶标准！</h2>
                <p>${progress.reason}</p>
                <p class="progression-question">是否升级到下一阶段？</p>
            </div>
        `;
        
        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn btn-outline" id="stayBtn">继续巩固</button>
            <button class="btn btn-primary" id="upgradeBtn">立即进阶</button>
        `;
        
        document.getElementById('stayBtn').addEventListener('click', () => {
            this.closeAllModals();
            Utils.showToast('继续加油！');
        });
        
        document.getElementById('upgradeBtn').addEventListener('click', async () => {
            await Progression.doUpgrade(exerciseType);
            this.closeAllModals();
            await this.renderHome();
        });
        
        modal.classList.remove('hidden');
    },
    
    // 打开跳过弹窗
    openSkipModal(exerciseType) {
        const modal = document.getElementById('confirmModal');
        const typeInfo = Exercises.getExerciseType(exerciseType);
        
        modal.querySelector('.modal-body').innerHTML = `
            <div class="skip-modal-content">
                <h2>跳过今天的${typeInfo.name}？</h2>
                <p>选择一个原因（帮助分析你的训练模式）</p>
                
                <div class="skip-reasons">
                    <button class="reason-btn" data-reason="tired">😴 太累了</button>
                    <button class="reason-btn" data-reason="busy">⏰ 没时间</button>
                    <button class="reason-btn" data-reason="injury">🤕 身体不适</button>
                    <button class="reason-btn" data-reason="other">💭 其他原因</button>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn btn-outline btn-block" id="cancelSkipBtn">取消</button>
        `;
        
        // 绑定事件
        modal.querySelectorAll('.reason-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const reason = btn.dataset.reason;
                await this.saveSkip(exerciseType, reason);
            });
        });
        
        document.getElementById('cancelSkipBtn').addEventListener('click', () => {
            this.closeAllModals();
        });
        
        this.closeAllModals();
        modal.classList.remove('hidden');
    },
    
    // 保存跳过记录
    async saveSkip(exerciseType, reason) {
        try {
            const progress = await DB.getProgress(exerciseType);
            const log = {
                date: Utils.getToday(),
                exerciseType,
                level: progress?.level || 1,
                completed: false,
                skipReason: reason,
                createdAt: new Date().toISOString()
            };
            
            await DB.saveLog(log);
            
            this.closeAllModals();
            await this.renderHome();
            Utils.showToast('已记录，明天继续加油！');
            
        } catch (error) {
            console.error('保存失败:', error);
            Utils.showToast('保存失败');
        }
    },
    
    // 显示进阶建议
    async showProgressionSuggestion(exerciseType) {
        const suggestion = await Progression.analyzeAndSuggest(exerciseType);
        const modal = document.getElementById('confirmModal');
        
        if (!suggestion) {
            Utils.showToast('数据不足');
            return;
        }
        
        let actionButtons = '';
        
        if (suggestion.type === 'upgrade') {
            actionButtons = `
                <button class="btn btn-outline" id="laterBtn">稍后再说</button>
                <button class="btn btn-primary" id="doUpgradeBtn">立即进阶</button>
            `;
        } else if (suggestion.type === 'downgrade') {
            actionButtons = `
                <button class="btn btn-outline" id="keepBtn">保持当前</button>
                <button class="btn btn-primary" id="doDowngradeBtn">调整等级</button>
            `;
        } else {
            actionButtons = `
                <button class="btn btn-primary btn-block" id="okBtn">知道了</button>
            `;
        }
        
        modal.querySelector('.modal-body').innerHTML = `
            <div class="suggestion-content">
                <h2>${suggestion.title}</h2>
                <p>${suggestion.message}</p>
                ${suggestion.suggestion?.tips ? `
                    <ul class="suggestion-tips">
                        ${suggestion.suggestion.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
        
        modal.querySelector('.modal-footer').innerHTML = actionButtons;
        
        // 绑定事件
        document.getElementById('doUpgradeBtn')?.addEventListener('click', async () => {
            await Progression.doUpgrade(exerciseType);
            this.closeAllModals();
            await this.renderHome();
        });
        
        document.getElementById('doDowngradeBtn')?.addEventListener('click', async () => {
            await Progression.doDowngrade(exerciseType);
            this.closeAllModals();
            await this.renderHome();
        });
        
        document.getElementById('laterBtn')?.addEventListener('click', () => this.closeAllModals());
        document.getElementById('keepBtn')?.addEventListener('click', () => this.closeAllModals());
        document.getElementById('okBtn')?.addEventListener('click', () => this.closeAllModals());
        
        this.closeAllModals();
        modal.classList.remove('hidden');
    },
    
    // ========== 计划页面相关 ==========
    
    // 渲染计划页面
    async renderPlan() {
        const plan = await DB.getWeeklyPlan();
        const container = document.getElementById('weeklyPlan');
        
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const today = Utils.getDayOfWeek();
        
        const days = dayNames.map((name, index) => {
            const dayPlan = plan[index] || [];
            const isToday = index === today;
            
            const exerciseIcons = dayPlan.map(type => {
                const info = Exercises.getExerciseType(type);
                return info?.icon || '💪';
            }).join(' ') || '休息';
            
            return `
                <div class="plan-day ${isToday ? 'today' : ''}" data-day="${index}">
                    <div class="plan-day-header">
                        <span class="day-name">${name}</span>
                        ${isToday ? '<span class="today-badge">今天</span>' : ''}
                    </div>
                    <div class="plan-day-content">
                        ${dayPlan.length > 0 ? exerciseIcons : '<span class="rest-text">😴 休息</span>'}
                    </div>
                    <button class="edit-day-btn">编辑</button>
                </div>
            `;
        }).join('');
        
        container.innerHTML = days;
        
        // 绑定编辑事件
        container.querySelectorAll('.edit-day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const day = parseInt(btn.parentElement.dataset.day);
                this.openEditDayModal(day);
            });
        });
    },
    
    // 打开编辑日计划弹窗
    async openEditDayModal(day) {
        this.state.editingDay = day;
        const plan = await DB.getWeeklyPlan();
        const dayPlan = plan[day] || [];
        
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const modal = document.getElementById('confirmModal');
        
        const allTypes = Exercises.getAllTypes();
        
        const exerciseOptions = allTypes.map(type => {
            const isSelected = dayPlan.includes(type.key);
            return `
                <label class="exercise-checkbox ${isSelected ? 'selected' : ''}">
                    <input type="checkbox" value="${type.key}" ${isSelected ? 'checked' : ''}>
                    <span class="checkbox-icon">${type.icon}</span>
                    <span class="checkbox-name">${type.name}</span>
                </label>
            `;
        }).join('');
        
        modal.querySelector('.modal-body').innerHTML = `
            <div class="edit-day-content">
                <h2>编辑${dayNames[day]}计划</h2>
                <p>选择要训练的动作：</p>
                <div class="exercise-checkboxes">
                    ${exerciseOptions}
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn btn-outline" id="cancelEditBtn">取消</button>
            <button class="btn btn-primary" id="saveEditBtn">保存</button>
        `;
        
        // 选择切换样式
        modal.querySelectorAll('.exercise-checkbox input').forEach(input => {
            input.addEventListener('change', () => {
                input.parentElement.classList.toggle('selected', input.checked);
            });
        });
        
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeAllModals();
        });
        
        document.getElementById('saveEditBtn').addEventListener('click', async () => {
            const selected = [...modal.querySelectorAll('.exercise-checkbox input:checked')]
                .map(input => input.value);
            
            await DB.saveDayPlan(day, selected);
            this.closeAllModals();
            await this.renderPlan();
            Utils.showToast('计划已保存');
        });
        
        modal.classList.remove('hidden');
    },
    
    // ========== 历史页面相关 ==========
    
    // 渲染历史页面
    async renderHistory() {
        await this.renderCalendar();
        await this.renderRecentLogs();
    },
    
    // 渲染日历
    async renderCalendar() {
        const date = this.state.calendarDate;
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // 获取本月所有训练记录
        const startDate = Utils.formatDate(new Date(year, month, 1));
        const endDate = Utils.formatDate(new Date(year, month + 1, 0));
        const logs = await DB.getLogsByDateRange(startDate, endDate);
        
        // 统计每天的训练情况
        const dayStatus = {};
        logs.forEach(log => {
            if (!dayStatus[log.date]) {
                dayStatus[log.date] = { completed: 0, skipped: 0 };
            }
            if (log.completed) {
                dayStatus[log.date].completed++;
            } else {
                dayStatus[log.date].skipped++;
            }
        });
        
        // 渲染月份标题
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                           '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        document.getElementById('calendarMonth').textContent = `${year}年${monthNames[month]}`;
        
        // 渲染日历格子
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = Utils.getToday();
        
        let calendarHTML = '';
        
        // 空白格子
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // 日期格子
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = Utils.formatDate(new Date(year, month, day));
            const status = dayStatus[dateStr];
            const isToday = dateStr === today;
            
            let statusClass = '';
            let statusDot = '';
            
            if (status) {
                if (status.completed > 0 && status.skipped === 0) {
                    statusClass = 'completed';
                    statusDot = '<span class="status-dot completed"></span>';
                } else if (status.completed > 0) {
                    statusClass = 'partial';
                    statusDot = '<span class="status-dot partial"></span>';
                } else {
                    statusClass = 'skipped';
                    statusDot = '<span class="status-dot skipped"></span>';
                }
            }
            
            calendarHTML += `
                <div class="calendar-day ${statusClass} ${isToday ? 'today' : ''}" data-date="${dateStr}">
                    ${day}
                    ${statusDot}
                </div>
            `;
        }
        
        document.getElementById('calendarGrid').innerHTML = calendarHTML;
        
        // 绑定日期点击事件
        document.querySelectorAll('.calendar-day:not(.empty)').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const dateStr = dayEl.dataset.date;
                this.showDayDetail(dateStr);
            });
        });
        
        // 绑定月份切换
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.state.calendarDate = new Date(year, month - 1, 1);
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.state.calendarDate = new Date(year, month + 1, 1);
            this.renderCalendar();
        });
    },
    
    // 显示某天详情
    async showDayDetail(dateStr) {
        const logs = await DB.getLogsByDate(dateStr);
        
        if (logs.length === 0) {
            Utils.showToast('当天无训练记录');
            return;
        }
        
        const modal = document.getElementById('confirmModal');
        
        const logsHTML = logs.map(log => {
            const typeInfo = Exercises.getExerciseType(log.exerciseType);
            
            if (log.completed) {
                return `
                    <div class="day-log-item completed">
                        <span class="log-icon">${typeInfo?.icon || '💪'}</span>
                        <div class="log-info">
                            <div class="log-name">${typeInfo?.name || log.exerciseType}</div>
                            <div class="log-detail">${log.sets}组 × ${log.reps}次 · ${Utils.getFeelingText(log.feeling)}</div>
                        </div>
                        <span class="log-status">✓</span>
                    </div>
                `;
            } else {
                return `
                    <div class="day-log-item skipped">
                        <span class="log-icon">${typeInfo?.icon || '💪'}</span>
                        <div class="log-info">
                            <div class="log-name">${typeInfo?.name || log.exerciseType}</div>
                            <div class="log-detail">跳过：${Utils.getReasonText(log.skipReason)}</div>
                        </div>
                        <span class="log-status">✗</span>
                    </div>
                `;
            }
        }).join('');
        
        modal.querySelector('.modal-body').innerHTML = `
            <div class="day-detail-content">
                <h2>📅 ${dateStr}</h2>
                <div class="day-logs">
                    ${logsHTML}
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn btn-primary btn-block" id="closeDayDetailBtn">关闭</button>
        `;
        
        document.getElementById('closeDayDetailBtn').addEventListener('click', () => {
            this.closeAllModals();
        });
        
        modal.classList.remove('hidden');
    },
    
    // 渲染最近记录
    async renderRecentLogs() {
        const logs = await DB.getAllLogs();
        const recentLogs = logs.slice(-20).reverse();
        
        const container = document.getElementById('recentLogs');
        
        if (recentLogs.length === 0) {
            container.innerHTML = '<p class="empty-text">暂无训练记录</p>';
            return;
        }
        
        const logsHTML = recentLogs.map(log => {
            const typeInfo = Exercises.getExerciseType(log.exerciseType);
            
            return `
                <div class="recent-log-item ${log.completed ? 'completed' : 'skipped'}">
                    <div class="log-date">${log.date}</div>
                    <div class="log-main">
                        <span class="log-icon">${typeInfo?.icon || '💪'}</span>
                        <span class="log-name">${typeInfo?.name || log.exerciseType}</span>
                    </div>
                    <div class="log-result">
                        ${log.completed ? 
                            `${log.sets}×${log.reps}` : 
                            `跳过`
                        }
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = logsHTML;
    },
    
    // ========== 个人页面相关 ==========
    
    // 渲染个人页面
    async renderProfile() {
        const stats = await DB.getStats();
        const settings = {
            enableNotification: await DB.getSetting('enableNotification') || false,
            reminderHour: await DB.getSetting('reminderHour') || 19,
            reminderMinute: await DB.getSetting('reminderMinute') || 0
        };
        
        // 更新统计显示
        document.getElementById('profileTotalDays').textContent = stats.totalDays || 0;
        document.getElementById('profileStreak').textContent = stats.currentStreak || 0;
        document.getElementById('profileRecovery').textContent = stats.recoveryCount || 0;
        
        // 更新设置开关
        const notifToggle = document.getElementById('notificationToggle');
        if (notifToggle) {
            notifToggle.checked = settings.enableNotification;
        }
        
        // 绑定设置事件
        this.bindProfileEvents();
    },
    
    // 绑定个人页面事件
    bindProfileEvents() {
        // 通知开关
        document.getElementById('notificationToggle')?.addEventListener('change', async (e) => {
            const enabled = e.target.checked;
            await DB.saveSetting('enableNotification', enabled);
            
            if (enabled) {
                const permission = await NotificationManager.init();
                if (!permission) {
                    e.target.checked = false;
                    await DB.saveSetting('enableNotification', false);
                    Utils.showToast('请在浏览器设置中允许通知权限');
                } else {
                    await NotificationManager.scheduleSmartReminder();
                    Utils.showToast('提醒已开启');
                }
            } else {
                Utils.showToast('提醒已关闭');
            }
        });
        
        // 导出数据
        document.getElementById('exportDataBtn')?.addEventListener('click', async () => {
            await EmailBackup.exportAllData();
        });
        
        // 导入数据
        document.getElementById('importDataBtn')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await EmailBackup.importData(file);
                    await this.renderProfile();
                    await this.renderHome();
                }
            };
            input.click();
        });
        
        // 导出周报
        document.getElementById('exportReportBtn')?.addEventListener('click', async () => {
            await EmailBackup.exportWeeklyReport();
        });
        
        // 邮件分享
        document.getElementById('emailShareBtn')?.addEventListener('click', async () => {
            await EmailBackup.shareViaEmail();
        });
        
        // 清除数据
        document.getElementById('clearDataBtn')?.addEventListener('click', () => {
            this.showClearDataConfirm();
        });
    },
    
    // 显示清除数据确认
    showClearDataConfirm() {
        const modal = document.getElementById('confirmModal');
        
        modal.querySelector('.modal-body').innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">⚠️</div>
                <h2>确定要清除所有数据吗？</h2>
                <p>此操作不可恢复，建议先导出备份！</p>
            </div>
        `;
        
        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn btn-outline" id="cancelClearBtn">取消</button>
            <button class="btn btn-danger" id="confirmClearBtn">确定清除</button>
        `;
        
        document.getElementById('cancelClearBtn').addEventListener('click', () => {
            this.closeAllModals();
        });
        
        document.getElementById('confirmClearBtn').addEventListener('click', async () => {
            await DB.clearAll();
            this.closeAllModals();
            Utils.showToast('数据已清除');
            window.location.reload();
        });
        
        modal.classList.remove('hidden');
    }
};

// 导出
window.App = App;

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

