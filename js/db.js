// db.js - 本地存储管理（完整版：保留所有原有功能 + 支持等级设置与多次记录）

const DB = {
    // 存储键名
    KEYS: {
        USER_LEVELS: 'convict_user_levels',      // 用户当前等级 {pushup: 5, squat: 3, ...}
        TRAINING_LOGS: 'convict_training_logs',   // 训练日志数组
        WEEKLY_PLAN: 'convict_weekly_plan',       // 周计划
        SETTINGS: 'convict_settings',             // 设置
        STATS: 'convict_stats',                   // 统计数据
        LAST_SUGGESTIONS: 'convict_last_suggestions' // 最近的建议（用于进阶提示）
    },

    // ========== 用户等级管理（新增）==========

    /**
     * 获取所有动作的当前等级
     */
    getUserLevels() {
        const data = localStorage.getItem(this.KEYS.USER_LEVELS);
        if (!data) {
            // 默认所有动作都是第1级
            return {
                pushup: 1,
                squat: 1,
                pullup: 1,
                legRaise: 1,
                bridge: 1,
                handstand: 1
            };
        }
        return JSON.parse(data);
    },

    /**
     * 保存所有动作的等级
     */
    saveUserLevels(levels) {
        localStorage.setItem(this.KEYS.USER_LEVELS, JSON.stringify(levels));
    },

    /**
     * 获取单个动作的当前等级
     */
    getExerciseLevel(exerciseId) {
        const levels = this.getUserLevels();
        return levels[exerciseId] || 1;
    },

    /**
     * 设置单个动作的等级
     */
    setExerciseLevel(exerciseId, level) {
        const levels = this.getUserLevels();
        levels[exerciseId] = Math.max(1, Math.min(10, level)); // 限制在1-10之间
        this.saveUserLevels(levels);
    },

    /**
     * 检查是否是首次使用（用于显示初始设置）
     */
    isFirstTime() {
        return !localStorage.getItem(this.KEYS.USER_LEVELS);
    },

    // ========== 训练日志管理（改进：支持多次记录）==========

    /**
     * 获取所有训练日志
     */
    getTrainingLogs() {
        const data = localStorage.getItem(this.KEYS.TRAINING_LOGS);
        return data ? JSON.parse(data) : [];
    },

    /**
     * 保存训练日志
     */
    saveTrainingLogs(logs) {
        localStorage.setItem(this.KEYS.TRAINING_LOGS, JSON.stringify(logs));
    },

    /**
     * 添加一条训练记录
     * @param {string} exerciseId - 动作ID
     * @param {number} reps - 次数
     * @param {number} sets - 组数
     * @param {string} note - 备注
     * @param {string} feeling - 感受 ('easy'/'moderate'/'hard')
     */
    addTrainingLog(exerciseId, reps, sets = 1, note = '', feeling = '') {
        const logs = this.getTrainingLogs();
        const currentLevel = this.getExerciseLevel(exerciseId);

        const newLog = {
            id: Date.now().toString(),
            exerciseId,
            level: currentLevel,
            reps,
            sets,
            note,
            feeling,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('zh-CN')
        };

        logs.push(newLog);
        this.saveTrainingLogs(logs);

        // 更新统计
        this.updateStats();

        return newLog;
    },

    /**
     * 获取今天的所有训练记录
     */
    getTodayLogs() {
        const logs = this.getTrainingLogs();
        const today = new Date().toLocaleDateString('zh-CN');
        return logs.filter(log => log.date === today);
    },

    /**
     * 获取今天某个动作的所有记录
     */
    getTodayExerciseLogs(exerciseId) {
        const todayLogs = this.getTodayLogs();
        return todayLogs.filter(log => log.exerciseId === exerciseId);
    },

    /**
     * 获取指定日期的训练记录
     */
    getLogsByDate(dateStr) {
        const logs = this.getTrainingLogs();
        return logs.filter(log => log.date === dateStr);
    },

    /**
     * 删除一条训练记录
     */
    deleteTrainingLog(logId) {
        let logs = this.getTrainingLogs();
        logs = logs.filter(log => log.id !== logId);
        this.saveTrainingLogs(logs);
        this.updateStats();
    },

    /**
     * 获取最近N条记录
     */
    getRecentLogs(count = 20) {
        const logs = this.getTrainingLogs();
        return logs.slice(-count).reverse();
    },

    /**
     * 获取某个动作的最近N条记录（用于进阶判断）
     */
    getExerciseRecentLogs(exerciseId, count = 10) {
        const logs = this.getTrainingLogs();
        return logs
            .filter(log => log.exerciseId === exerciseId)
            .slice(-count)
            .reverse();
    },

    /**
     * 获取最近N天的训练记录（用于分析训练模式）
     */
    getRecentDaysLogs(days = 7) {
        const logs = this.getTrainingLogs();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= cutoffDate;
        });
    },

    // ========== 周计划管理（保留原有功能）==========

    /**
     * 获取周计划
     */
    getWeeklyPlan() {
        const data = localStorage.getItem(this.KEYS.WEEKLY_PLAN);
        if (!data) {
            return this.generateDefaultPlan();
        }
        return JSON.parse(data);
    },

    /**
     * 保存周计划
     */
    saveWeeklyPlan(plan) {
        localStorage.setItem(this.KEYS.WEEKLY_PLAN, JSON.stringify(plan));
    },

    /**
     * 生成默认计划（基于当前等级智能分配）
     */
    generateDefaultPlan() {
        const levels = this.getUserLevels();

        // 计算平均等级
        const avgLevel = Object.values(levels).reduce((a, b) => a + b, 0) / 6;

        let plan;
        if (avgLevel <= 3) {
            // 初级：每周3-4天，每天2个动作
            plan = {
                monday: ['pushup', 'squat'],
                tuesday: [],
                wednesday: ['pullup', 'legRaise'],
                thursday: [],
                friday: ['bridge', 'handstand'],
                saturday: [],
                sunday: []
            };
        } else if (avgLevel <= 6) {
            // 中级：每周4-5天，每天2-3个动作
            plan = {
                monday: ['pushup', 'pullup'],
                tuesday: ['squat', 'bridge'],
                wednesday: [],
                thursday: ['legRaise', 'handstand'],
                friday: ['pushup', 'squat'],
                saturday: [],
                sunday: []
            };
        } else {
            // 高级：每周5-6天
            plan = {
                monday: ['pushup', 'pullup', 'legRaise'],
                tuesday: ['squat', 'bridge'],
                wednesday: ['handstand', 'pushup'],
                thursday: ['pullup', 'legRaise'],
                friday: ['squat', 'bridge'],
                saturday: ['pushup', 'handstand'],
                sunday: []
            };
        }

        this.saveWeeklyPlan(plan);
        return plan;
    },

    /**
     * 获取今天的计划
     */
    getTodayPlan() {
        const plan = this.getWeeklyPlan();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = days[new Date().getDay()];
        return plan[today] || [];
    },

    /**
     * 更新某一天的计划
     */
    updateDayPlan(day, exercises) {
        const plan = this.getWeeklyPlan();
        plan[day] = exercises;
        this.saveWeeklyPlan(plan);
    },

    // ========== 统计数据（保留并增强）==========

    /**
     * 获取统计数据
     */
    getStats() {
        const data = localStorage.getItem(this.KEYS.STATS);
        if (!data) {
            return {
                totalDays: 0,
                currentStreak: 0,
                longestStreak: 0,
                recoveryCount: 0,
                lastTrainingDate: null,
                totalWorkouts: 0 // 新增：总训练次数
            };
        }
        return JSON.parse(data);
    },

    /**
     * 保存统计数据
     */
    saveStats(stats) {
        localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
    },

    /**
     * 更新统计数据（自动计算）
     */
    updateStats() {
        const logs = this.getTrainingLogs();
        if (logs.length === 0) {
            return;
        }

        // 获取所有训练日期（去重）
        const uniqueDates = [...new Set(logs.map(log => log.date))];
        uniqueDates.sort((a, b) => new Date(a) - new Date(b));

        const totalDays = uniqueDates.length;
        const lastDate = uniqueDates[uniqueDates.length - 1];
        const totalWorkouts = logs.length;

        // 计算当前连续天数
        let currentStreak = 0;
        const today = new Date().toLocaleDateString('zh-CN');
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('zh-CN');

        if (lastDate === today || lastDate === yesterday) {
            currentStreak = 1;
            for (let i = uniqueDates.length - 2; i >= 0; i--) {
                const prevDate = new Date(uniqueDates[i]);
                const currDate = new Date(uniqueDates[i + 1]);
                const diffDays = Math.floor((currDate - prevDate) / 86400000);

                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // 计算最长连续天数
        let longestStreak = 1;
        let tempStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1]);
            const currDate = new Date(uniqueDates[i]);
            const diffDays = Math.floor((currDate - prevDate) / 86400000);

            if (diffDays === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        const stats = this.getStats();
        stats.totalDays = totalDays;
        stats.currentStreak = currentStreak;
        stats.longestStreak = Math.max(longestStreak, stats.longestStreak);
        stats.lastTrainingDate = lastDate;
        stats.totalWorkouts = totalWorkouts;

        this.saveStats(stats);
    },

    /**
     * 记录一次"复活"（中断后恢复训练）
     */
    recordRecovery() {
        const stats = this.getStats();
        stats.recoveryCount = (stats.recoveryCount || 0) + 1;
        this.saveStats(stats);
    },

    // ========== 设置管理（保留原有功能）==========

    /**
     * 获取设置
     */
    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        if (!data) {
            return {
                notifications: true,
                notificationTime: '19:00',
                emailBackup: false,
                email: '',
                theme: 'dark' // 新增：主题设置
            };
        }
        return JSON.parse(data);
    },

    /**
     * 保存设置
     */
    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    },

    /**
     * 更新单个设置项
     */
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
    },

    // ========== 进阶建议管理（保留原有功能）==========

    /**
     * 保存最近的进阶建议
     */
    saveLastSuggestion(exerciseId, suggestion) {
        const suggestions = this.getLastSuggestions();
        suggestions[exerciseId] = {
            ...suggestion,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(this.KEYS.LAST_SUGGESTIONS, JSON.stringify(suggestions));
    },

    /**
     * 获取所有最近的建议
     */
    getLastSuggestions() {
        const data = localStorage.getItem(this.KEYS.LAST_SUGGESTIONS);
        return data ? JSON.parse(data) : {};
    },

    /**
     * 获取某个动作的最近建议
     */
    getLastSuggestion(exerciseId) {
        const suggestions = this.getLastSuggestions();
        return suggestions[exerciseId] || null;
    },

    /**
     * 清除某个动作的建议（已采纳后）
     */
    clearSuggestion(exerciseId) {
        const suggestions = this.getLastSuggestions();
        delete suggestions[exerciseId];
        localStorage.setItem(this.KEYS.LAST_SUGGESTIONS, JSON.stringify(suggestions));
    },

    // ========== 数据管理（保留并增强）==========

    /**
     * 导出所有数据
     */
    exportAllData() {
        return {
            version: '1.1.0',
            userLevels: this.getUserLevels(),
            trainingLogs: this.getTrainingLogs(),
            weeklyPlan: this.getWeeklyPlan(),
            settings: this.getSettings(),
            stats: this.getStats(),
            lastSuggestions: this.getLastSuggestions(),
            exportDate: new Date().toISOString()
        };
    },

    /**
     * 导入数据
     */
    importData(data) {
        try {
            if (data.userLevels) this.saveUserLevels(data.userLevels);
            if (data.trainingLogs) this.saveTrainingLogs(data.trainingLogs);
            if (data.weeklyPlan) this.saveWeeklyPlan(data.weeklyPlan);
            if (data.settings) this.saveSettings(data.settings);
            if (data.stats) this.saveStats(data.stats);
            if (data.lastSuggestions) {
                localStorage.setItem(this.KEYS.LAST_SUGGESTIONS, JSON.stringify(data.lastSuggestions));
            }
            return true;
        } catch (e) {
            console.error('导入数据失败:', e);
            return false;
        }
    },

    /**
     * 清空所有数据
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    // ========== 数据分析辅助函数（保留原有功能）==========

    /**
     * 获取某个月的训练日期
     */
    getMonthTrainingDates(year, month) {
        const logs = this.getTrainingLogs();
        return [...new Set(logs
            .filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate.getFullYear() === year && logDate.getMonth() === month;
            })
            .map(log => log.date)
        )];
    },

    /**
     * 获取某个动作的训练历史统计
     */
    getExerciseStats(exerciseId) {
        const logs = this.getTrainingLogs().filter(log => log.exerciseId === exerciseId);

        if (logs.length === 0) {
            return {
                totalWorkouts: 0,
                totalReps: 0,
                totalSets: 0,
                averageReps: 0,
                maxReps: 0,
                currentLevel: this.getExerciseLevel(exerciseId)
            };
        }

        const totalReps = logs.reduce((sum, log) => sum + (log.reps * log.sets), 0);
        const totalSets = logs.reduce((sum, log) => sum + log.sets, 0);
        const maxReps = Math.max(...logs.map(log => log.reps));

        return {
            totalWorkouts: logs.length,
            totalReps,
            totalSets,
            averageReps: Math.round(totalReps / logs.length),
            maxReps,
            currentLevel: this.getExerciseLevel(exerciseId),
            firstWorkout: logs[0].date,
            lastWorkout: logs[logs.length - 1].date
        };
    },

    /**
     * 检测训练中断（超过N天未训练）
     */
    checkTrainingGap(days = 3) {
        const stats = this.getStats();
        if (!stats.lastTrainingDate) return 0;

        const lastDate = new Date(stats.lastTrainingDate);
        const today = new Date();
        const diffDays = Math.floor((today - lastDate) / 86400000);

        return diffDays >= days ? diffDays : 0;
    }
};
