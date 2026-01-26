/**
 * 自适应提醒系统
 * 基于用户历史行为动态调整提醒时间和频率
 */

const NotificationManager = {
    // 初始化通知权限
    async init() {
        if (!('Notification' in window)) {
            console.log('浏览器不支持通知');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        return false;
    },
    
    // 发送通知
    async send(title, options = {}) {
        const hasPermission = await this.init();
        if (!hasPermission) return;
        
        const defaultOptions = {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'fitness-reminder',
            renotify: true,
            requireInteraction: false,
            ...options
        };
        
        try {
            // 尝试使用Service Worker发送通知（更可靠）
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    title,
                    options: defaultOptions
                });
            } else {
                // 降级使用普通通知
                new Notification(title, defaultOptions);
            }
        } catch (error) {
            console.error('发送通知失败:', error);
        }
    },
    
    // 分析用户训练时间习惯
    async analyzeTrainingPattern() {
        const logs = await DB.getAllLogs();
        const completedLogs = logs.filter(log => log.completed && log.createdAt);
        
        if (completedLogs.length < 5) {
            // 数据不足，返回默认时间
            return {
                preferredHour: 19, // 默认晚上7点
                confidence: 'low',
                pattern: 'unknown'
            };
        }
        
        // 统计每个小时的训练次数
        const hourCounts = new Array(24).fill(0);
        completedLogs.forEach(log => {
            const hour = new Date(log.createdAt).getHours();
            hourCounts[hour]++;
        });
        
        // 找出最常训练的时间段
        let maxCount = 0;
        let preferredHour = 19;
        
        hourCounts.forEach((count, hour) => {
            if (count > maxCount) {
                maxCount = count;
                preferredHour = hour;
            }
        });
        
        // 判断模式
        const morningCount = hourCounts.slice(5, 12).reduce((a, b) => a + b, 0);
        const afternoonCount = hourCounts.slice(12, 18).reduce((a, b) => a + b, 0);
        const eveningCount = hourCounts.slice(18, 23).reduce((a, b) => a + b, 0);
        
        let pattern = 'mixed';
        const total = morningCount + afternoonCount + eveningCount;
        
        if (morningCount / total > 0.6) pattern = 'morning';
        else if (afternoonCount / total > 0.6) pattern = 'afternoon';
        else if (eveningCount / total > 0.6) pattern = 'evening';
        
        return {
            preferredHour,
            confidence: completedLogs.length >= 20 ? 'high' : 'medium',
            pattern,
            hourDistribution: hourCounts
        };
    },
    
    // 设置智能提醒
    async scheduleSmartReminder() {
        const enabled = await DB.getSetting('enableNotification');
        if (!enabled) return;
        
        const pattern = await this.analyzeTrainingPattern();
        const plan = await DB.getWeeklyPlan();
        const today = Utils.getDayOfWeek();
        
        // 检查今天是否有训练计划
        const todayPlan = plan[today] || [];
        if (todayPlan.length === 0) {
            console.log('今天是休息日，不设置提醒');
            return;
        }
        
        // 计算提醒时间（比常用训练时间提前30分钟）
        let reminderHour = pattern.preferredHour;
        let reminderMinute = 30;
        
        if (reminderHour > 0) {
            reminderHour -= 1;
            reminderMinute = 30;
        }
        
        // 保存提醒时间设置
        await DB.saveSetting('reminderHour', reminderHour);
        await DB.saveSetting('reminderMinute', reminderMinute);
        
        // 设置提醒（使用setTimeout模拟，实际生产中应使用Service Worker的定时任务）
        this.setDailyReminder(reminderHour, reminderMinute);
        
        console.log(`智能提醒已设置：${reminderHour}:${reminderMinute}`);
    },
    
    // 设置每日提醒
    setDailyReminder(hour, minute) {
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(hour, minute, 0, 0);
        
        // 如果今天的提醒时间已过，设置明天的
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const delay = reminderTime.getTime() - now.getTime();
        
        // 清除之前的定时器
        if (this.reminderTimer) {
            clearTimeout(this.reminderTimer);
        }
        
        // 设置新的定时器
        this.reminderTimer = setTimeout(async () => {
            await this.sendTrainingReminder();
            // 递归设置下一天的提醒
            this.setDailyReminder(hour, minute);
        }, delay);
    },
    
    // 发送训练提醒
    async sendTrainingReminder() {
        const stats = await DB.getStats();
        const today = Utils.getToday();
        const todayLogs = await DB.getLogsByDate(today);
        
        // 检查今天是否已经训练过
        const hasTrainedToday = todayLogs.some(log => log.completed);
        if (hasTrainedToday) {
            console.log('今天已训练，不发送提醒');
            return;
        }
        
        // 获取今日计划
        const plan = await DB.getWeeklyPlan();
        const dayOfWeek = Utils.getDayOfWeek();
        const todayPlan = plan[dayOfWeek] || [];
        
        if (todayPlan.length === 0) {
            return;
        }
        
        // 构造提醒内容
        const exerciseNames = todayPlan.map(type => {
            const info = Exercises.getExerciseType(type);
            return info ? info.name : type;
        }).join('、');
        
        let title = '💪 该运动了！';
        let body = `今日计划：${exerciseNames}`;
        
        // 根据连续天数添加激励语
        if (stats.currentStreak >= 7) {
            title = `🔥 ${stats.currentStreak}天连续打卡！`;
            body = `继续保持！今天练：${exerciseNames}`;
        } else if (stats.currentStreak >= 3) {
            title = `💪 已连续${stats.currentStreak}天！`;
        }
        
        await this.send(title, { body });
    },
    
    // 发送连续未完成的加强提醒
    async sendMissedWorkoutReminder() {
        const stats = await DB.getStats();
        const lastDate = stats.lastWorkoutDate;
        
        if (!lastDate) return;
        
        const daysSince = Utils.daysBetween(lastDate, Utils.getToday());
        
        if (daysSince >= 2) {
            let message = '';
            
            if (daysSince === 2) {
                message = '昨天休息了一天，今天动起来吧！只需要10分钟~';
            } else if (daysSince <= 5) {
                message = `已经${daysSince}天没训练了，5分钟热身也是进步！`;
            } else {
                message = `${daysSince}天了！做一个动作，找回节奏~`;
            }
            
            await this.send('📢 别忘了训练！', { body: message });
        }
    },
    
    // 发送进阶成功通知
    async sendProgressionNotification(exerciseType, newLevel) {
        const typeInfo = Exercises.getExerciseType(exerciseType);
        const levelInfo = Exercises.getLevel(exerciseType, newLevel);
        
        if (typeInfo && levelInfo) {
            await this.send('🎉 恭喜进阶！', {
                body: `${typeInfo.name}已升级到第${newLevel}式：${levelInfo.name}`,
                requireInteraction: true
            });
        }
    },
    
    // 发送周报通知
    async sendWeeklyReportNotification(stats) {
        await this.send('📊 本周训练报告', {
            body: `完成${stats.weeklyWorkouts}次训练，继续加油！`,
            requireInteraction: true
        });
    }
};

// 导出
window.NotificationManager = NotificationManager;
