// exercises.js - 六大动作数据库（完整版：保留原有功能 + 支持10个等级）

const EXERCISES = {
    pushup: {
        id: 'pushup',
        name: '俯卧撑',
        icon: '💪',
        color: '#f56565',
        category: 'push',
        levels: [
            { level: 1, name: '墙壁俯卧撑', beginner: 10, intermediate: 25, advanced: 50, tips: '站立，双手推墙，身体倾斜45度' },
            { level: 2, name: '上斜俯卧撑', beginner: 10, intermediate: 20, advanced: 40, tips: '手扶桌子或台阶，身体保持直线' },
            { level: 3, name: '膝盖俯卧撑', beginner: 10, intermediate: 15, advanced: 30, tips: '膝盖着地，身体从膝盖到头成一直线' },
            { level: 4, name: '半俯卧撑', beginner: 8, intermediate: 15, advanced: 25, tips: '下降到一半位置即可，控制节奏' },
            { level: 5, name: '标准俯卧撑', beginner: 10, intermediate: 20, advanced: 40, tips: '手与肩同宽，身体成一直线，胸部触地' },
            { level: 6, name: '窄距俯卧撑', beginner: 8, intermediate: 15, advanced: 30, tips: '双手距离小于肩宽，重点刺激三头肌' },
            { level: 7, name: '偏重俯卧撑', beginner: 8, intermediate: 15, advanced: 20, tips: '一侧手承受更多重量，为单手俯卧撑准备' },
            { level: 8, name: '单手半俯卧撑', beginner: 5, intermediate: 10, advanced: 20, tips: '单手支撑，下降到一半，另一手放背后' },
            { level: 9, name: '杠杆俯卧撑', beginner: 5, intermediate: 10, advanced: 20, tips: '一手支撑，另一手辅助平衡' },
            { level: 10, name: '单手俯卧撑', beginner: 5, intermediate: 10, advanced: 20, tips: '终极式！单手支撑全部体重' }
        ]
    },
    squat: {
        id: 'squat',
        name: '深蹲',
        icon: '🦵',
        color: '#48bb78',
        category: 'legs',
        levels: [
            { level: 1, name: '坐姿深蹲', beginner: 10, intermediate: 25, advanced: 50, tips: '坐在椅子上，站起坐下' },
            { level: 2, name: '折刀深蹲', beginner: 10, intermediate: 20, advanced: 40, tips: '双手前伸，蹲下时臀部坐向后方' },
            { level: 3, name: '支撑深蹲', beginner: 10, intermediate: 20, advanced: 30, tips: '手扶支撑物，减轻腿部负担' },
            { level: 4, name: '半深蹲', beginner: 10, intermediate: 20, advanced: 35, tips: '蹲到大腿与地面平行即可' },
            { level: 5, name: '标准深蹲', beginner: 10, intermediate: 25, advanced: 50, tips: '完全蹲下，大腿后侧贴小腿' },
            { level: 6, name: '窄距深蹲', beginner: 10, intermediate: 20, advanced: 40, tips: '双脚并拢或接近，增加难度' },
            { level: 7, name: '偏重深蹲', beginner: 10, intermediate: 20, advanced: 40, tips: '一腿承受更多重量' },
            { level: 8, name: '单腿半蹲', beginner: 8, intermediate: 15, advanced: 25, tips: '单腿蹲到一半，另一腿前伸' },
            { level: 9, name: '辅助单腿深蹲', beginner: 6, intermediate: 12, advanced: 20, tips: '手扶支撑物，单腿深蹲' },
            { level: 10, name: '单腿深蹲', beginner: 5, intermediate: 10, advanced: 20, tips: '终极式！完全单腿深蹲，又称手枪深蹲' }
        ]
    },
    pullup: {
        id: 'pullup',
        name: '引体向上',
        icon: '🏋️',
        color: '#4299e1',
        category: 'pull',
        levels: [
            { level: 1, name: '垂直引体', beginner: 10, intermediate: 20, advanced: 40, tips: '双脚着地，斜拉身体' },
            { level: 2, name: '水平引体', beginner: 10, intermediate: 20, advanced: 30, tips: '身体水平，拉向单杠' },
            { level: 3, name: '折刀引体', beginner: 8, intermediate: 15, advanced: 25, tips: '膝盖弯曲，减轻负重' },
            { level: 4, name: '半引体向上', beginner: 6, intermediate: 12, advanced: 20, tips: '拉到一半位置即可' },
            { level: 5, name: '标准引体向上', beginner: 5, intermediate: 10, advanced: 20, tips: '完整引体，下巴过杠' },
            { level: 6, name: '窄距引体', beginner: 5, intermediate: 10, advanced: 20, tips: '双手距离小于肩宽' },
            { level: 7, name: '偏重引体', beginner: 5, intermediate: 9, advanced: 15, tips: '一侧手承受更多重量' },
            { level: 8, name: '单手半引体', beginner: 4, intermediate: 8, advanced: 12, tips: '单手拉到一半' },
            { level: 9, name: '辅助单臂引体', beginner: 3, intermediate: 6, advanced: 10, tips: '单手主导，另一手辅助' },
            { level: 10, name: '单臂引体向上', beginner: 3, intermediate: 6, advanced: 10, tips: '终极式！完全单手引体' }
        ]
    },
    legRaise: {
        id: 'legRaise',
        name: '举腿',
        icon: '🤸',
        color: '#ed8936',
        category: 'core',
        levels: [
            { level: 1, name: '坐姿屈膝', beginner: 10, intermediate: 20, advanced: 40, tips: '坐在地上，屈膝抬腿' },
            { level: 2, name: '平卧屈膝', beginner: 10, intermediate: 20, advanced: 35, tips: '平躺，屈膝抬腿' },
            { level: 3, name: '平卧蛙式举腿', beginner: 8, intermediate: 15, advanced: 30, tips: '平躺，双腿蛙式抬起' },
            { level: 4, name: '平卧半举腿', beginner: 8, intermediate: 15, advanced: 25, tips: '平躺，腿抬到45度' },
            { level: 5, name: '平卧直举腿', beginner: 8, intermediate: 15, advanced: 25, tips: '平躺，腿垂直抬起' },
            { level: 6, name: '悬垂屈膝', beginner: 8, intermediate: 15, advanced: 25, tips: '悬挂，屈膝抬腿' },
            { level: 7, name: '悬垂蛙式举腿', beginner: 8, intermediate: 15, advanced: 25, tips: '悬挂，双腿蛙式抬起' },
            { level: 8, name: '悬垂半举腿', beginner: 8, intermediate: 15, advanced: 20, tips: '悬挂，腿抬到水平' },
            { level: 9, name: '悬垂直举腿', beginner: 6, intermediate: 12, advanced: 20, tips: '悬挂，腿完全抬起与身体成L型' },
            { level: 10, name: '悬垂风车', beginner: 5, intermediate: 10, advanced: 15, tips: '终极式！悬挂举腿后左右摆动' }
        ]
    },
    bridge: {
        id: 'bridge',
        name: '桥',
        icon: '🌉',
        color: '#9f7aea',
        category: 'back',
        levels: [
            { level: 1, name: '短桥', beginner: 10, intermediate: 20, advanced: 40, tips: '肩膀着地，臀部抬起' },
            { level: 2, name: '直桥', beginner: 10, intermediate: 20, advanced: 30, tips: '完整桥式，手脚支撑' },
            { level: 3, name: '斜桥', beginner: 8, intermediate: 15, advanced: 30, tips: '手扶高处，降低难度' },
            { level: 4, name: '顶桥', beginner: 8, intermediate: 15, advanced: 25, tips: '头顶着地，手辅助支撑' },
            { level: 5, name: '半桥', beginner: 8, intermediate: 15, advanced: 20, tips: '拱起一半高度' },
            { level: 6, name: '标准桥', beginner: 6, intermediate: 12, advanced: 20, tips: '完全拱桥，身体成拱形' },
            { level: 7, name: '下行桥', beginner: 5, intermediate: 10, advanced: 15, tips: '从站立慢慢下桥' },
            { level: 8, name: '上行桥', beginner: 5, intermediate: 10, advanced: 15, tips: '从桥式慢慢站起' },
            { level: 9, name: '合桥', beginner: 4, intermediate: 8, advanced: 12, tips: '双脚并拢的桥式' },
            { level: 10, name: '铁板桥', beginner: 3, intermediate: 6, advanced: 10, tips: '终极式！完美拱桥，仅手脚支撑' }
        ]
    },
    handstand: {
        id: 'handstand',
        name: '倒立撑',
        icon: '🤹',
        color: '#38b2ac',
        category: 'push',
        levels: [
            { level: 1, name: '顶墙倒立', beginner: 30, intermediate: 60, advanced: 120, tips: '靠墙倒立，保持时间（秒）' },
            { level: 2, name: '顶墙顶立', beginner: 30, intermediate: 60, advanced: 90, tips: '头顶地，脚靠墙，保持时间（秒）' },
            { level: 3, name: '顶墙倒立撑', beginner: 5, intermediate: 10, advanced: 20, tips: '靠墙倒立，微微屈肘推起' },
            { level: 4, name: '半倒立撑', beginner: 5, intermediate: 10, advanced: 20, tips: '头顶地，脚靠墙，推起一半' },
            { level: 5, name: '标准倒立撑', beginner: 5, intermediate: 10, advanced: 15, tips: '靠墙完整倒立撑' },
            { level: 6, name: '窄距倒立撑', beginner: 5, intermediate: 9, advanced: 12, tips: '双手距离更窄' },
            { level: 7, name: '偏重倒立撑', beginner: 4, intermediate: 8, advanced: 12, tips: '一侧手承受更多重量' },
            { level: 8, name: '单手半倒立撑', beginner: 3, intermediate: 6, advanced: 10, tips: '单手支撑，推起一半' },
            { level: 9, name: '杠杆倒立撑', beginner: 2, intermediate: 5, advanced: 8, tips: '一手主导，另一手辅助' },
            { level: 10, name: '单手倒立撑', beginner: 1, intermediate: 3, advanced: 5, tips: '终极式！完全单手倒立撑' }
        ]
    }
};

// ========== 辅助函数（保留原有功能）==========

/**
 * 获取动作当前等级的详细信息
 * @param {string} exerciseId - 动作ID
 * @param {number} currentLevel - 当前等级 (1-10)
 * @returns {object|null} 等级信息对象
 */
function getExerciseLevelInfo(exerciseId, currentLevel) {
    const exercise = EXERCISES[exerciseId];
    if (!exercise || currentLevel < 1 || currentLevel > 10) return null;
    return exercise.levels[currentLevel - 1];
}

/**
 * 获取建议的训练次数（中级标准）
 * @param {string} exerciseId - 动作ID
 * @param {number} currentLevel - 当前等级
 * @returns {number} 建议次数
 */
function getRecommendedReps(exerciseId, currentLevel) {
    const levelInfo = getExerciseLevelInfo(exerciseId, currentLevel);
    if (!levelInfo) return 10;
    return levelInfo.intermediate;
}

/**
 * 判断是否达到进阶标准（需达到高级标准）
 * @param {string} exerciseId - 动作ID
 * @param {number} currentLevel - 当前等级
 * @param {number} completedReps - 完成次数
 * @returns {boolean} 是否可以进阶
 */
function canProgress(exerciseId, currentLevel, completedReps) {
    const levelInfo = getExerciseLevelInfo(exerciseId, currentLevel);
    if (!levelInfo || currentLevel >= 10) return false;
    return completedReps >= levelInfo.advanced;
}

/**
 * 获取动作的颜色
 * @param {string} exerciseId - 动作ID
 * @returns {string} 颜色值
 */
function getExerciseColor(exerciseId) {
    return EXERCISES[exerciseId]?.color || '#667eea';
}

/**
 * 获取动作的图标
 * @param {string} exerciseId - 动作ID
 * @returns {string} Emoji图标
 */
function getExerciseIcon(exerciseId) {
    return EXERCISES[exerciseId]?.icon || '💪';
}

/**
 * 获取动作的中文名称
 * @param {string} exerciseId - 动作ID
 * @returns {string} 动作名称
 */
function getExerciseName(exerciseId) {
    return EXERCISES[exerciseId]?.name || '未知动作';
}

/**
 * 获取所有动作ID列表
 * @returns {array} 动作ID数组
 */
function getAllExerciseIds() {
    return Object.keys(EXERCISES);
}

/**
 * 根据分类获取动作列表
 * @param {string} category - 分类 ('push', 'pull', 'legs', 'core', 'back')
 * @returns {array} 符合分类的动作数组
 */
function getExercisesByCategory(category) {
    return Object.values(EXERCISES).filter(ex => ex.category === category);
}

/**
 * 检查进阶条件（原有逻辑保留）
 * 需要满足：达到高级标准 + 最近3次训练表现稳定
 * @param {string} exerciseId - 动作ID
 * @param {number} currentLevel - 当前等级
 * @param {array} recentLogs - 最近的训练记录
 * @returns {object} { canProgress: boolean, reason: string }
 */
function checkProgression(exerciseId, currentLevel, recentLogs) {
    if (currentLevel >= 10) {
        return { canProgress: false, reason: '已达到最高等级' };
    }

    const levelInfo = getExerciseLevelInfo(exerciseId, currentLevel);
    if (!levelInfo) {
        return { canProgress: false, reason: '等级信息错误' };
    }

    // 筛选当前等级的记录
    const currentLevelLogs = recentLogs.filter(log =>
        log.exerciseId === exerciseId && log.level === currentLevel
    );

    if (currentLevelLogs.length < 3) {
        return { canProgress: false, reason: '需要至少完成3次训练' };
    }

    // 检查最近3次是否都达到高级标准
    const recent3 = currentLevelLogs.slice(-3);
    const allMeetAdvanced = recent3.every(log => log.reps >= levelInfo.advanced);

    if (!allMeetAdvanced) {
        return { canProgress: false, reason: '需要连续3次达到高级标准' };
    }

    // 检查感受（如果有记录）
    const hasGoodFeeling = recent3.every(log =>
        !log.feeling || log.feeling === 'easy' || log.feeling === 'moderate'
    );

    if (!hasGoodFeeling) {
        return { canProgress: false, reason: '建议先巩固当前等级' };
    }

    return { canProgress: true, reason: '恭喜！可以进阶了' };
}

/**
 * 获取等级进度百分比
 * @param {string} exerciseId - 动作ID
 * @param {number} currentLevel - 当前等级
 * @param {number} currentReps - 当前完成次数
 * @returns {number} 进度百分比 (0-100)
 */
function getLevelProgress(exerciseId, currentLevel, currentReps) {
    const levelInfo = getExerciseLevelInfo(exerciseId, currentLevel);
    if (!levelInfo) return 0;

    const { beginner, advanced } = levelInfo;
    const range = advanced - beginner;
    const progress = Math.min(100, Math.max(0, ((currentReps - beginner) / range) * 100));

    return Math.round(progress);
}

/**
 * 获取下一等级预览信息
 * @param {string} exerciseId - 动作ID
 * @param {number} currentLevel - 当前等级
 * @returns {object|null} 下一等级信息
 */
function getNextLevelPreview(exerciseId, currentLevel) {
    if (currentLevel >= 10) return null;
    return getExerciseLevelInfo(exerciseId, currentLevel + 1);
}
