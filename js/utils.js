/**
 * 工具函数模块
 */

const Utils = {
    // 日期格式化
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    },
    
    // 获取今天日期字符串
    getToday() {
        return this.formatDate(new Date());
    },
    
    // 获取本周开始日期
    getWeekStart(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return this.formatDate(d);
    },
    
    // 获取星期几 (0-6, 0是周日)
    getDayOfWeek(date = new Date()) {
        return new Date(date).getDay();
    },
    
    // 获取星期名称
    getDayName(dayNum) {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days[dayNum];
    },
    
    // 计算两个日期之间的天数
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // 显示Toast提示
    showToast(message, duration = 2000) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    },
    
    // 显示/隐藏加载
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    },
    
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    },
    
    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 深拷贝
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // 获取感受对应的emoji
    getFeelingEmoji(feeling) {
        const emojis = {
            easy: '😊',
            normal: '😐',
            hard: '😓',
            exhausted: '😵'
        };
        return emojis[feeling] || '😐';
    },
    
    // 获取感受对应的中文
    getFeelingText(feeling) {
        const texts = {
            easy: '轻松',
            normal: '正常',
            hard: '吃力',
            exhausted: '崩溃'
        };
        return texts[feeling] || '正常';
    },
    
    // 获取未完成原因中文
    getReasonText(reason) {
        const texts = {
            overtime: '加班',
            tired: '太累',
            nomood: '没动力',
            injured: '受伤',
            forgot: '忘了',
            other: '其他'
        };
        return texts[reason] || '其他';
    },
    
    // 计算RPE值 (1-10)
    calculateRPE(feeling, completionRate) {
        const feelingScore = {
            easy: 3,
            normal: 5,
            hard: 7,
            exhausted: 9
        };
        
        const base = feelingScore[feeling] || 5;
        // 完成率高但感觉轻松，说明可以加量
        // 完成率低但感觉吃力，说明需要减量
        const adjustment = (completionRate - 0.8) * 2;
        
        return Math.max(1, Math.min(10, base - adjustment));
    }
};

// 导出
window.Utils = Utils;
