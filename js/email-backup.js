/**
 * 周度邮件摘要备份模块
 * 由于浏览器限制，实际发送邮件需要后端支持
 * 这里提供生成邮件内容和导出功能
 */

const EmailBackup = {
    // 生成周度摘要
    async generateWeeklySummary() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        
        const startDate = Utils.formatDate(weekStart);
        const endDate = Utils.formatDate(today);
        
                // 获取本周训练记录
        const logs = await DB.getLogsByDateRange(startDate, endDate);
        const completedLogs = logs.filter(log => log.completed);
        const skippedLogs = logs.filter(log => !log.completed);
        
        // 统计各项数据
        const stats = await DB.getStats();
        const progress = await DB.getAllProgress();
        
        // 按动作类型统计
        const exerciseStats = {};
        completedLogs.forEach(log => {
            if (!exerciseStats[log.exerciseType]) {
                exerciseStats[log.exerciseType] = {
                    count: 0,
                    totalSets: 0,
                    totalReps: 0,
                    feelings: []
                };
            }
            exerciseStats[log.exerciseType].count++;
            exerciseStats[log.exerciseType].totalSets += log.sets || 0;
            exerciseStats[log.exerciseType].totalReps += (log.sets || 1) * (log.reps || 0);
            if (log.feeling) {
                exerciseStats[log.exerciseType].feelings.push(log.feeling);
            }
        });
        
        // 统计训练天数
        const trainedDays = [...new Set(completedLogs.map(log => log.date))].length;
        
        // 统计跳过原因
        const skipReasons = {};
        skippedLogs.forEach(log => {
            const reason = log.skipReason || 'other';
            skipReasons[reason] = (skipReasons[reason] || 0) + 1;
        });
        
        return {
            period: {
                start: startDate,
                end: endDate
            },
            overview: {
                trainedDays,
                totalWorkouts: completedLogs.length,
                skippedWorkouts: skippedLogs.length,
                currentStreak: stats.currentStreak,
                longestStreak: stats.longestStreak
            },
            exerciseStats,
            skipReasons,
            progress: progress.reduce((acc, p) => {
                acc[p.exerciseType] = p.level;
                return acc;
            }, {})
        };
    },
    
    // 生成HTML格式的周报
    async generateWeeklyReportHTML() {
        const summary = await this.generateWeeklySummary();
        
        const exerciseRows = Object.entries(summary.exerciseStats).map(([type, data]) => {
            const typeInfo = Exercises.getExerciseType(type);
            const avgFeeling = this.calculateAvgFeeling(data.feelings);
            const currentLevel = summary.progress[type] || 1;
            
            return `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        ${typeInfo?.icon || '💪'} ${typeInfo?.name || type}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                        第${currentLevel}式
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                        ${data.count}次
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                        ${data.totalReps}次
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                        ${avgFeeling}
                    </td>
                </tr>
            `;
        }).join('');
        
        const skipReasonsText = Object.entries(summary.skipReasons)
            .map(([reason, count]) => `${Utils.getReasonText(reason)}: ${count}次`)
            .join('、') || '无';
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>囚徒健身周报 - ${summary.period.start} 至 ${summary.period.end}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 16px 16px 0 0;">
        <h1 style="margin: 0 0 10px 0; font-size: 24px;">📊 囚徒健身周报</h1>
        <p style="margin: 0; opacity: 0.9;">${summary.period.start} 至 ${summary.period.end}</p>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- 概览 -->
        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 30px;">
            <div style="flex: 1; min-width: 120px; background: #f0f7ff; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #3182ce;">${summary.overview.trainedDays}</div>
                <div style="color: #666; font-size: 14px;">训练天数</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: #f0fff4; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #38a169;">${summary.overview.totalWorkouts}</div>
                <div style="color: #666; font-size: 14px;">完成训练</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: #fffaf0; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #d69e2e;">${summary.overview.currentStreak}</div>
                <div style="color: #666; font-size: 14px;">连续天数</div>
            </div>
        </div>
        
        <!-- 训练详情 -->
        <h2 style="font-size: 18px; margin-bottom: 15px; color: #333;">💪 训练详情</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
                <tr style="background: #f7f7f7;">
                    <th style="padding: 12px; text-align: left; font-weight: 600;">动作</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600;">当前等级</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600;">训练次数</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600;">总次数</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600;">平均感受</th>
                </tr>
            </thead>
            <tbody>
                ${exerciseRows || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #999;">本周暂无训练记录</td></tr>'}
            </tbody>
        </table>
        
        <!-- 跳过记录 -->
        ${summary.overview.skippedWorkouts > 0 ? `
        <h2 style="font-size: 18px; margin-bottom: 15px; color: #333;">📝 跳过记录</h2>
        <p style="color: #666; margin-bottom: 30px;">
            本周跳过 ${summary.overview.skippedWorkouts} 次训练<br>
            原因：${skipReasonsText}
        </p>
        ` : ''}
        
        <!-- 鼓励语 -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <p style="margin: 0; font-size: 16px;">
                ${this.getEncouragementMessage(summary)}
            </p>
        </div>
        
        <!-- 页脚 -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
            <p>此报告由「囚徒健身追踪器」自动生成</p>
            <p>数据存储在您的设备本地，绝对隐私安全</p>
        </div>
    </div>
</body>
</html>
        `;
        
        return html;
    },
    
    // 计算平均感受
    calculateAvgFeeling(feelings) {
        if (!feelings || feelings.length === 0) return '😐';
        
        const feelingScores = {
            easy: 1,
            normal: 2,
            hard: 3,
            exhausted: 4
        };
        
        const avg = feelings.reduce((sum, f) => sum + (feelingScores[f] || 2), 0) / feelings.length;
        
        if (avg <= 1.5) return '😊 轻松';
        if (avg <= 2.5) return '😐 正常';
        if (avg <= 3.5) return '😓 吃力';
        return '😵 崩溃';
    },
    
    // 生成鼓励语
    getEncouragementMessage(summary) {
        const { trainedDays, currentStreak } = summary.overview;
        
        if (trainedDays >= 6) {
            return '🏆 太棒了！本周几乎天天都在训练，你是真正的战士！';
        }
        if (trainedDays >= 4) {
            return '💪 非常好！本周训练频率很不错，继续保持！';
        }
        if (trainedDays >= 2) {
            return '👍 不错的开始！下周争取再多练一天！';
        }
        if (trainedDays >= 1) {
            return '🌱 每一步都算数！下周让我们一起做得更好！';
        }
        return '💫 新的一周，新的开始！期待你的第一次训练！';
    },
    
    // 导出周报为文件
    async exportWeeklyReport() {
        try {
            Utils.showLoading();
            const html = await this.generateWeeklyReportHTML();
            
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `囚徒健身周报_${Utils.getToday()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Utils.hideLoading();
            Utils.showToast('周报已导出');
        } catch (error) {
            Utils.hideLoading();
            console.error('导出失败:', error);
            Utils.showToast('导出失败，请重试');
        }
    },
    
    // 导出所有数据为JSON
    async exportAllData() {
        try {
            Utils.showLoading();
            const data = await DB.exportAllData();
            
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `囚徒健身数据备份_${Utils.getToday()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Utils.hideLoading();
            Utils.showToast('数据已导出');
        } catch (error) {
            Utils.hideLoading();
            console.error('导出失败:', error);
            Utils.showToast('导出失败，请重试');
        }
    },
    
    // 导入数据
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    Utils.showLoading();
                    await DB.importData(e.target.result);
                    Utils.hideLoading();
                    Utils.showToast('数据导入成功');
                    resolve(true);
                } catch (error) {
                    Utils.hideLoading();
                    Utils.showToast('数据格式错误');
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                Utils.showToast('文件读取失败');
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsText(file);
        });
    },
    
    // 通过邮件分享（使用mailto协议）
    async shareViaEmail() {
        const summary = await this.generateWeeklySummary();
        const email = await DB.getSetting('backupEmail') || '';
        
        const subject = encodeURIComponent(`囚徒健身周报 ${summary.period.start} - ${summary.period.end}`);
        
        const body = encodeURIComponent(`
囚徒健身周报
================
时间：${summary.period.start} 至 ${summary.period.end}

📊 本周概览
- 训练天数：${summary.overview.trainedDays} 天
- 完成训练：${summary.overview.totalWorkouts} 次
- 当前连续：${summary.overview.currentStreak} 天
- 最长连续：${summary.overview.longestStreak} 天

💪 各项进度
${Object.entries(summary.progress).map(([type, level]) => {
    const info = Exercises.getExerciseType(type);
    return `- ${info?.name || type}：第${level}式`;
}).join('\n')}

---
此报告由「囚徒健身追踪器」生成
        `);
        
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
};

// 导出
window.EmailBackup = EmailBackup;

