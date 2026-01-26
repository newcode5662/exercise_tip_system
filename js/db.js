/**
 * IndexedDB 数据库管理模块
 */

const DB = {
    name: 'FitnessTrackerDB',
    version: 1,
    db: null,
    
    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);
            
            request.onerror = () => {
                console.error('数据库打开失败:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('数据库连接成功');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 用户进度表
                if (!db.objectStoreNames.contains('userProgress')) {
                    const progressStore = db.createObjectStore('userProgress', { keyPath: 'exerciseType' });
                    progressStore.createIndex('level', 'level', { unique: false });
                }
                
                // 训练记录表
                if (!db.objectStoreNames.contains('workoutLogs')) {
                    const logsStore = db.createObjectStore('workoutLogs', { keyPath: 'id' });
                    logsStore.createIndex('date', 'date', { unique: false });
                    logsStore.createIndex('exerciseType', 'exerciseType', { unique: false });
                }
                
                // 训练计划表
                if (!db.objectStoreNames.contains('weeklyPlan')) {
                    db.createObjectStore('weeklyPlan', { keyPath: 'dayOfWeek' });
                }
                
                // 用户设置表
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                // 统计数据表
                if (!db.objectStoreNames.contains('stats')) {
                    db.createObjectStore('stats', { keyPath: 'key' });
                }
                
                console.log('数据库结构创建完成');
            };
        });
    },
    
    // 通用的事务操作
    async transaction(storeName, mode, callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            
            // 处理 store.getAll() 这种返回 Request 的情况
            let result;
            try {
                result = callback(store);
            } catch (e) {
                reject(e);
                return;
            }
            
            if (result && result instanceof IDBRequest) {
                result.onsuccess = () => resolve(result.result);
                result.onerror = () => reject(result.error);
            } else {
                transaction.oncomplete = () => resolve(result);
                transaction.onerror = () => reject(transaction.error);
            }
        });
    },
    
    // ========== 用户进度相关 ==========
    
    // 获取所有进度
    async getAllProgress() {
        return this.transaction('userProgress', 'readonly', (store) => {
            return store.getAll();
        });
    },
    
    // 获取单个动作进度
    async getProgress(exerciseType) {
        return this.transaction('userProgress', 'readonly', (store) => {
            return store.get(exerciseType);
        });
    },
    
    // 保存/更新进度
    async saveProgress(progress) {
        return this.transaction('userProgress', 'readwrite', (store) => {
            return store.put(progress);
        });
    },
    
    // 初始化默认进度
    async initDefaultProgress() {
        const existing = await this.getAllProgress();
        if (existing.length === 0) {
            const defaultProgress = [
                { exerciseType: 'pushup', level: 1, step: 1 },
                { exerciseType: 'squat', level: 1, step: 1 },
                { exerciseType: 'pullup', level: 1, step: 1 },
                { exerciseType: 'legRaise', level: 1, step: 1 },
                { exerciseType: 'bridge', level: 1, step: 1 },
                { exerciseType: 'handstandPushup', level: 1, step: 1 }
            ];
            
            for (const progress of defaultProgress) {
                await this.saveProgress(progress);
            }
        }
    },
    
    // ========== 训练记录相关 ==========
    
    // 添加训练记录
    async addWorkoutLog(log) {
        const record = {
            id: Utils.generateId(),
            ...log,
            createdAt: new Date().toISOString()
        };
        
        return this.transaction('workoutLogs', 'readwrite', (store) => {
            return store.add(record);
        });
    },
    
    // 为了兼容 App.js 调用的 saveLog 方法名
    async saveLog(log) {
        return this.addWorkoutLog(log);
    },

    // 获取指定日期的记录
    async getLogsByDate(date) {
        const logs = await this.transaction('workoutLogs', 'readonly', (store) => {
            return store.getAll();
        });
        
        return logs.filter(log => log.date === date);
    },
    
    // 获取指定动作类型的最近N条记录
    async getRecentLogs(exerciseType, limit = 10) {
        const logs = await this.transaction('workoutLogs', 'readonly', (store) => {
            return store.getAll();
        });
        
        return logs
            .filter(log => log.exerciseType === exerciseType)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },
    
    // 获取日期范围内的记录
    async getLogsByDateRange(startDate, endDate) {
        const logs = await this.transaction('workoutLogs', 'readonly', (store) => {
            return store.getAll();
        });
        
        return logs.filter(log => log.date >= startDate && log.date <= endDate);
    },
    
    // 获取所有记录
    async getAllLogs() {
        return this.transaction('workoutLogs', 'readonly', (store) => {
            return store.getAll();
        });
    },
    
    // ========== 训练计划相关 ==========
    
    // 获取周计划
    async getWeeklyPlan() {
        const plans = await this.transaction('weeklyPlan', 'readonly', (store) => {
            return store.getAll();
        });
        
        // 转换为对象格式 { 0: [...], 1: [...], ... }
        const planMap = {};
        plans.forEach(p => {
            planMap[p.dayOfWeek] = p.exercises;
        });
        
        return planMap;
    },
    
    // 保存某天的计划
    async saveDayPlan(dayOfWeek, exercises) {
        return this.transaction('weeklyPlan', 'readwrite', (store) => {
            return store.put({ dayOfWeek, exercises });
        });
    },
    
    // 初始化默认计划
    async initDefaultPlan() {
        const existing = await this.getWeeklyPlan();
        if (Object.keys(existing).length === 0) {
            // 默认计划：周一三五练上肢，周二四六练下肢，周日休息
            const defaultPlan = {
                1: ['pushup', 'pullup', 'handstandPushup'], // 周一
                2: ['squat', 'legRaise', 'bridge'],          // 周二
                3: ['pushup', 'pullup', 'handstandPushup'], // 周三
                4: ['squat', 'legRaise', 'bridge'],          // 周四
                5: ['pushup', 'pullup', 'handstandPushup'], // 周五
                6: ['squat', 'legRaise', 'bridge'],          // 周六
                0: []                                         // 周日休息
            };
            
            for (const [day, exercises] of Object.entries(defaultPlan)) {
                await this.saveDayPlan(parseInt(day), exercises);
            }
        }
    },
    
    // ========== 设置相关 ==========
    
    // 获取设置
    async getSetting(key) {
        const result = await this.transaction('settings', 'readonly', (store) => {
            return store.get(key);
        });
        return result ? result.value : null;
    },
    
    // 保存设置
    async saveSetting(key, value) {
        return this.transaction('settings', 'readwrite', (store) => {
            return store.put({ key, value });
        });
    },
    
    // ========== 统计相关 ==========
    
    // 获取统计数据
    async getStats() {
        const statsData = await this.transaction('stats', 'readonly', (store) => {
            return store.getAll();
        });
        
        const stats = {};
        statsData.forEach(s => {
            stats[s.key] = s.value;
        });
        
        return {
            totalDays: stats.totalDays || 0,
            currentStreak: stats.currentStreak || 0,
            longestStreak: stats.longestStreak || 0,
            recoveryCount: stats.recoveryCount || 0,
            lastWorkoutDate: stats.lastWorkoutDate || null
        };
    },
    
    // 更新统计数据
    async updateStats(key, value) {
        return this.transaction('stats', 'readwrite', (store) => {
            return store.put({ key, value });
        });
    },
    
    // 计算并更新统计（这里是你原代码出错最严重的地方）
    async recalculateStats() {
        const logs = await this.getAllLogs();
        const completedLogs = logs.filter(log => log.completed);
        
        // 获取所有有训练的日期
        const trainedDates = [...new Set(completedLogs.map(log => log.date))].sort();
        
        if (trainedDates.length === 0) {
            return this.getStats();
        }
        
        // 累计天数
        const totalDays = trainedDates.length;
        
        // 计算连续天数和恢复次数
        let currentStreak = 0;
        let longestStreak = 0;
        let recoveryCount = 0;
        let tempStreak = 1;
        
        const today = Utils.getToday();
        const lastTrainedDate = trainedDates[trainedDates.length - 1];
        
        // 遍历历史日期计算连胜
        for (let i = 1; i < trainedDates.length; i++) {
            const prevDate = trainedDates[i - 1];
            const currentDate = trainedDates[i];
            
            const daysDiff = Utils.daysBetween(prevDate, currentDate);
            
            if (daysDiff === 1) {
                tempStreak++;
            } else {
                // 中断了
                if (daysDiff > 1 && daysDiff <= 7) {
                    recoveryCount++; // 一周内恢复算成功回归
                }
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
        
        // 计算"当前"连续天数
        const daysSinceLastWorkout = Utils.daysBetween(lastTrainedDate, today);
        if (daysSinceLastWorkout <= 1) {
            // 今天或昨天有训练，说明连胜还没断
            currentStreak = 1;
            // 从最后一天往前倒推
            for (let i = trainedDates.length - 2; i >= 0; i--) {
                const diff = Utils.daysBetween(trainedDates[i], trainedDates[i + 1]);
                if (diff === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        } else {
            currentStreak = 0;
        }
        
        // 保存统计
        await this.updateStats('totalDays', totalDays);
        await this.updateStats('currentStreak', currentStreak);
        await this.updateStats('longestStreak', longestStreak);
        await this.updateStats('recoveryCount', recoveryCount);
        await this.updateStats('lastWorkoutDate', lastTrainedDate);
        
        return {
            totalDays,
            currentStreak,
            longestStreak,
            recoveryCount,
            lastWorkoutDate: lastTrainedDate
        };
    },

    // ========== 数据导入导出 ==========
    
    // 导出所有数据
    async exportAllData() {
        const data = {
            version: this.version,
            exportDate: new Date().toISOString(),
            userProgress: await this.getAllProgress(),
            workoutLogs: await this.getAllLogs(),
            weeklyPlan: await this.getWeeklyPlan(),
            settings: await this.transaction('settings', 'readonly', (store) => store.getAll()),
            stats: await this.transaction('stats', 'readonly', (store) => store.getAll())
        };
        
        return JSON.stringify(data, null, 2);
    },
    
    // 导入数据
    async importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // 导入用户进度
            if (data.userProgress) {
                for (const progress of data.userProgress) {
                    await this.saveProgress(progress);
                }
            }
            
            // 导入训练记录
            if (data.workoutLogs) {
                for (const log of data.workoutLogs) {
                    await this.addWorkoutLog(log);
                }
            }
            
            // 导入周计划
            if (data.weeklyPlan) {
                for (const [day, exercises] of Object.entries(data.weeklyPlan)) {
                    await this.saveDayPlan(parseInt(day), exercises);
                }
            }
            
            // 导入设置
            if (data.settings) {
                for (const setting of data.settings) {
                    await this.saveSetting(setting.key, setting.value);
                }
            }
            
            // 重新计算统计
            await this.recalculateStats();
            
            return true;
        } catch (error) {
            console.error('数据导入失败:', error);
            throw error;
        }
    },

    // 补上缺失的 clearAll 方法
    async clearAll() {
        return new Promise(async (resolve, reject) => {
            const db = this.db;
            const transaction = db.transaction(['workoutLogs', 'settings', 'weeklyPlan', 'userProgress', 'stats'], 'readwrite');
            
            transaction.objectStore('workoutLogs').clear();
            transaction.objectStore('settings').clear();
            transaction.objectStore('weeklyPlan').clear();
            transaction.objectStore('userProgress').clear();
            transaction.objectStore('stats').clear();
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
};

// 导出
window.DB = DB;
