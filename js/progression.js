/**
 * 智能进阶算法引擎
 * 基于用户训练数据，提供个性化进阶建议
 */

const Progression = {
    // 分析训练数据，生成进阶建议
    async analyzeAndSuggest(exerciseType) {
        // 获取当前进度
        const progress = await DB.getProgress(exerciseType);
        if (!progress) return null;
        
        // 获取最近的训练记录
        const recentLogs = await DB.getRecentLogs(exerciseType, 10);
        
        if (recentLogs.length < 3) {
            return {
                type: 'info',
                message: '数据不足，请继续训练积累数据',
                suggestion: null
            };
        }
        
        // 分析最近训练数据
        const analysis = this.analyzeRecentData(recentLogs, progress.level);
        
        // 生成建议
        return this.generateSuggestion(exerciseType, progress, analysis);
    },
    
    // 分析最近训练数据
    analyzeRecentData(logs, currentLevel) {
        const completedLogs = logs.filter(log => log.completed);
        
        if (completedLogs.length === 0) {
            return {
                avgRPE: 10,
                completionRate: 0,
                trend: 'declining',
                consistency: 0
            };
        }
        
        // 计算平均RPE
        const rpeValues = completedLogs.map(log => {
            return Utils.calculateRPE(log.feeling, log.completionRate || 1);
        });
        const avgRPE = rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length;
        
        // 计算完成率
        const completionRate = completedLogs.length / logs.length;
        
        // 分析趋势（比较前半和后半的表现）
        const halfIndex = Math.floor(completedLogs.length / 2);
        const firstHalf = completedLogs.slice(0, halfIndex);
        const secondHalf = completedLogs.slice(halfIndex);
        
        let trend = 'stable';
        if (firstHalf.length > 0 && secondHalf.length > 0) {
            const firstAvgReps = this.avgReps(firstHalf);
            const secondAvgReps = this.avgReps(secondHalf);
            
            if (secondAvgReps > firstAvgReps * 1.1) {
                trend = 'improving';
            } else if (secondAvgReps < firstAvgReps * 0.9) {
                trend = 'declining';
            }
        }
        
        // 计算一致性（连续完成的比例）
        let consecutiveCompleted = 0;
        for (let i = logs.length - 1; i >= 0; i--) {
            if (logs[i].completed) {
                consecutiveCompleted++;
            } else {
                break;
            }
        }
        const consistency = consecutiveCompleted / logs.length;
        
        // 计算平均完成组数和次数
        const avgSets = completedLogs.reduce((sum, log) => sum + (log.sets || 0), 0) / completedLogs.length;
        const avgReps = completedLogs.reduce((sum, log) => sum + (log.reps || 0), 0) / completedLogs.length;
        
        return {
            avgRPE,
            completionRate,
            trend,
            consistency,
            avgSets: Math.round(avgSets * 10) / 10,
            avgReps: Math.round(avgReps * 10) / 10,
            totalCompleted: completedLogs.length
        };
    },
    
    // 计算平均次数
    avgReps(logs) {
        if (logs.length === 0) return 0;
        const total = logs.reduce((sum, log) => sum + (log.sets || 1) * (log.reps || 0), 0);
        return total / logs.length;
    },
    
    // 生成进阶建议
    generateSuggestion(exerciseType, progress, analysis) {
        const currentLevel = progress.level;
        const levelInfo = Exercises.getLevel(exerciseType, currentLevel);
        const nextLevelInfo = Exercises.getLevel(exerciseType, currentLevel + 1);
        const standard = levelInfo?.progression;
        
        if (!standard) {
            return {
                type: 'info',
                message: '已达到最高等级！',
                suggestion: null
            };
        }
        
        // 判断进阶条件
        const { avgRPE, completionRate, trend, consistency, avgSets, avgReps } = analysis;
        
        // 计算与目标的差距
        const targetTotal = standard.sets * (typeof standard.reps === 'number' ? standard.reps : 10);
        const currentTotal = avgSets * avgReps;
        const progressPercent = Math.min(100, Math.round((currentTotal / targetTotal) * 100));
        
        // 情况1：表现优秀，建议进阶
        if (avgRPE <= 5 && completionRate >= 0.9 && trend !== 'declining' && progressPercent >= 100) {
            return {
                type: 'upgrade',
                title: '🚀 建议进阶',
                message: `你在${levelInfo.name}的表现非常出色！平均RPE仅${avgRPE.toFixed(1)}，完成率${(completionRate * 100).toFixed(0)}%`,
                suggestion: {
                    action: 'upgrade',
                    from: currentLevel,
                    to: currentLevel + 1,
                    fromName: levelInfo.name,
                    toName: nextLevelInfo?.name || '最高级',
                    reason: '数据显示你已经完全掌握当前动作，是时候挑战下一阶段了！'
                },
                analysis
            };
        }
        
        // 情况2：表现良好，接近进阶
        if (avgRPE <= 6 && completionRate >= 0.8 && progressPercent >= 80) {
            return {
                type: 'almost',
                title: '💪 即将进阶',
                message: `距离进阶还差一点！当前完成度${progressPercent}%`,
                suggestion: {
                    action: 'continue',
                    target: `${standard.sets}×${standard.reps}`,
                    current: `${avgSets.toFixed(1)}×${avgReps.toFixed(1)}`,
                    reason: '保持当前训练节奏，很快就能进阶！'
                },
                analysis
            };
        }
        
        // 情况3：感觉吃力，建议巩固
        if (avgRPE >= 7 || trend === 'declining') {
            return {
                type: 'consolidate',
                title: '🔄 建议巩固',
                message: avgRPE >= 7 ? 
                    `训练感觉较为吃力（RPE ${avgRPE.toFixed(1)}），建议在当前等级多加巩固` :
                    '最近表现有所下滑，建议巩固当前等级',
                suggestion: {
                    action: 'consolidate',
                    tips: [
                        '适当增加休息时间',
                        '确保充足的睡眠和营养',
                        '可以尝试降低单组次数，增加组数'
                    ]
                },
                analysis
            };
        }
        
        // 情况4：完成率低，建议降级
        if (completionRate < 0.5 && currentLevel > 1) {
            const prevLevelInfo = Exercises.getLevel(exerciseType, currentLevel - 1);
            return {
                type: 'downgrade',
                title: '⚠️ 建议调整',
                message: `最近完成率较低（${(completionRate * 100).toFixed(0)}%），可能当前等级偏难`,
                suggestion: {
                    action: 'downgrade',
                    from: currentLevel,
                    to: currentLevel - 1,
                    fromName: levelInfo.name,
                    toName: prevLevelInfo?.name,
                    reason: '退一步是为了更好地前进，建议回到上一级巩固基础'
                },
                analysis
            };
        }
        
        // 情况5：正常训练中
        return {
            type: 'normal',
            title: '📊 训练正常',
            message: `当前进度${progressPercent}%，继续保持！`,
            suggestion: {
                action: 'continue',
                target: `${standard.sets}×${standard.reps}`,
                current: `${avgSets.toFixed(1)}×${avgReps.toFixed(1)}`,
                progressPercent
            },
            analysis
        };
    },
    
    // 执行进阶
    async doUpgrade(exerciseType) {
        const progress = await DB.getProgress(exerciseType);
        if (!progress) return false;
        
        const maxLevel = Exercises.getAllLevels(exerciseType).length;
        if (progress.level >= maxLevel) {
            Utils.showToast('已达到最高等级！');
            return false;
        }
        
        progress.level += 1;
        progress.upgradedAt = new Date().toISOString();
        await DB.saveProgress(progress);
        
        Utils.showToast(`恭喜进阶到第${progress.level}式！`);
        return true;
    },
    
    // 执行降级
    async doDowngrade(exerciseType) {
        const progress = await DB.getProgress(exerciseType);
        if (!progress || progress.level <= 1) {
            Utils.showToast('已是最低等级');
            return false;
        }
        
        progress.level -= 1;
        progress.downgradedAt = new Date().toISOString();
        await DB.saveProgress(progress);
        
        Utils.showToast(`已调整到第${progress.level}式`);
        return true;
    },
    
    // 生成中断恢复建议
    async generateRecoverySuggestion() {
        const stats = await DB.getStats();
        const lastDate = stats.lastWorkoutDate;
        
        if (!lastDate) {
            return {
                show: false
            };
        }
        
        const daysSince = Utils.daysBetween(lastDate, Utils.getToday());
        
        if (daysSince <= 1) {
            return { show: false };
        }
        
        // 根据中断天数生成不同建议
        let suggestion;
        
        if (daysSince <= 3) {
            suggestion = {
                show: true,
                icon: '💪',
                title: '欢迎回来！',
                message: `休息了${daysSince}天，状态应该不错！按原计划继续训练吧~`,
                action: 'normal'
            };
        } else if (daysSince <= 7) {
            suggestion = {
                show: true,
                icon: '🌟',
                title: '久违了，朋友！',
                message: `${daysSince}天没训练了，建议今天做个轻松的热身训练，每个动作减少一半组数。`,
                action: 'light'
            };
        } else if (daysSince <= 14) {
            suggestion = {
                show: true,
                icon: '🌱',
                title: '重新开始！',
                message: `${daysSince}天后回归，真的很棒！建议从每个动作1-2组开始，让身体慢慢适应。`,
                action: 'restart'
            };
        } else {
            suggestion = {
                show: true,
                icon: '🔥',
                title: '永不言弃！',
                message: `${daysSince}天了，但你还是回来了！今天只需要5分钟热身即可，随便做一个动作就算胜利！`,
                action: 'minimal'
            };
        }
        
        return suggestion;
    },
    
    // 获取今日推荐训练量
    async getTodayRecommendation(exerciseType) {
        const progress = await DB.getProgress(exerciseType);
        const recentLogs = await DB.getRecentLogs(exerciseType, 5);
        const levelInfo = Exercises.getLevel(exerciseType, progress?.level || 1);
        
        if (!levelInfo) return null;
        
        // 如果没有历史记录，从初级标准开始
        if (recentLogs.length === 0) {
            return {
                sets: levelInfo.beginner.sets,
                reps: levelInfo.beginner.reps,
                level: progress?.level || 1,
                levelName: levelInfo.name
            };
        }
        
        // 根据上次表现计算推荐量
        const lastLog = recentLogs[0];
        let recommendedSets = lastLog.sets || levelInfo.beginner.sets;
        let recommendedReps = lastLog.reps || levelInfo.beginner.reps;
        
        // 根据感受调整
        if (lastLog.feeling === 'easy') {
            // 感觉轻松，增加一点
            recommendedReps = Math.min(recommendedReps + 2, levelInfo.progression.reps);
        } else if (lastLog.feeling === 'hard' || lastLog.feeling === 'exhausted') {
            // 感觉吃力，减少一点
            recommendedReps = Math.max(recommendedReps - 2, levelInfo.beginner.reps);
        }
        
        return {
            sets: recommendedSets,
            reps: recommendedReps,
            level: progress.level,
            levelName: levelInfo.name,
            basedOnLast: true
        };
    }
};

// 导出
window.Progression = Progression;
