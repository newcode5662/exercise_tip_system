/**
 * 囚徒健身六艺动作库
 * 基于《囚徒健身》整理的完整进阶标准
 */

const Exercises = {
    // 六大动作类型
    types: {
        pushup: {
            name: '俯卧撑',
            icon: '💪',
            color: '#e53e3e',
            description: '推力之王，锻炼胸肌、肩膀和肱三头肌'
        },
        squat: {
            name: '深蹲',
            icon: '🦵',
            color: '#38a169',
            description: '腿部力量基础，锻炼股四头肌、臀肌'
        },
        pullup: {
            name: '引体向上',
            icon: '🏋️',
            color: '#3182ce',
            description: '拉力之王，锻炼背阔肌、肱二头肌'
        },
        legRaise: {
            name: '举腿',
            icon: '🦿',
            color: '#805ad5',
            description: '核心力量，锻炼腹肌和髋屈肌'
        },
        bridge: {
            name: '桥',
            icon: '🌉',
            color: '#d69e2e',
            description: '脊柱健康，锻炼下背部和臀肌'
        },
        handstandPushup: {
            name: '倒立撑',
            icon: '🤸',
            color: '#dd6b20',
            description: '肩部力量，锻炼三角肌和肱三头肌'
        }
    },
    
    // 十式进阶标准
    levels: {
        pushup: [
            {
                level: 1,
                name: '墙壁俯卧撑',
                description: '面对墙壁站立，双手扶墙做俯卧撑',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 25 },
                progression: { sets: 3, reps: 50 },
                tips: '身体与墙壁约一臂距离，保持身体笔直'
            },
            {
                level: 2,
                name: '上斜俯卧撑',
                description: '双手撑在桌子或椅子上做俯卧撑',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 20 },
                progression: { sets: 3, reps: 40 },
                tips: '支撑物越低难度越大，循序渐进'
            },
            {
                level: 3,
                name: '膝盖俯卧撑',
                description: '膝盖着地的俯卧撑',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 15 },
                progression: { sets: 3, reps: 30 },
                tips: '膝盖下垫软物保护，身体保持直线'
            },
            {
                level: 4,
                name: '半俯卧撑',
                description: '下降到一半位置的俯卧撑',
                beginner: { sets: 1, reps: 8 },
                intermediate: { sets: 2, reps: 12 },
                progression: { sets: 2, reps: 25 },
                tips: '可以用篮球放在胸下作为参照'
            },
            {
                level: 5,
                name: '标准俯卧撑',
                description: '完整幅度的俯卧撑',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '胸部几乎触地，手臂完全伸直'
            },
            {
                level: 6,
                name: '窄距俯卧撑',
                description: '双手靠拢的俯卧撑',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '两手食指和拇指相触形成菱形'
            },
            {
                level: 7,
                name: '偏重俯卧撑',
                description: '一只手放在篮球上的俯卧撑',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '篮球那侧的手臂辅助发力较少'
            },
            {
                level: 8,
                name: '单臂半俯卧撑',
                description: '单臂下降到一半位置',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '另一只手背在身后，双脚分开保持平衡'
            },
            {
                level: 9,
                name: '杠杆俯卧撑',
                description: '一只手放在篮球上的单臂俯卧撑',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '篮球那侧的手仅作平衡用，尽量少发力'
            },
            {
                level: 10,
                name: '单臂俯卧撑',
                description: '完美的单臂俯卧撑',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 1, reps: 100 },
                tips: '囚徒健身的终极目标之一'
            }
        ],
        
        squat: [
            {
                level: 1,
                name: '肩倒立深蹲',
                description: '肩膀着地，双腿向上蹬的动作',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 25 },
                progression: { sets: 3, reps: 50 },
                tips: '腿部向天花板方向蹬直再收回'
            },
            {
                level: 2,
                name: '折刀深蹲',
                description: '手扶椅子辅助的深蹲',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 20 },
                progression: { sets: 3, reps: 40 },
                tips: '随着力量增加逐渐减少手的辅助'
            },
            {
                level: 3,
                name: '支撑深蹲',
                description: '扶着柱子或门框的深蹲',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 15 },
                progression: { sets: 3, reps: 30 },
                tips: '蹲到大腿与地面平行'
            },
            {
                level: 4,
                name: '半深蹲',
                description: '下蹲到大腿与地面平行',
                beginner: { sets: 1, reps: 8 },
                intermediate: { sets: 2, reps: 35 },
                progression: { sets: 2, reps: 50 },
                tips: '膝盖不要超过脚尖太多'
            },
            {
                level: 5,
                name: '标准深蹲',
                description: '完整幅度的深蹲',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 30 },
                tips: '大腿后侧接触小腿，保持脚跟着地'
            },
            {
                level: 6,
                name: '窄距深蹲',
                description: '双脚并拢的深蹲',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '需要更好的踝关节灵活性'
            },
            {
                level: 7,
                name: '偏重深蹲',
                description: '一只脚踩在篮球上的深蹲',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '篮球那侧腿主要保持平衡'
            },
            {
                level: 8,
                name: '单腿半深蹲',
                description: '单腿下蹲到一半位置',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '非支撑腿向前伸直'
            },
            {
                level: 9,
                name: '单腿辅助深蹲',
                description: '手扶物体的单腿深蹲',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '逐渐减少手的辅助力度'
            },
            {
                level: 10,
                name: '单腿深蹲',
                description: '完美的手枪式深蹲',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 50 },
                tips: '囚徒健身的终极目标之一'
            }
        ],
        
        pullup: [
            {
                level: 1,
                name: '垂直引体',
                description: '拉住门框或柱子，身体后倾拉起',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 20 },
                progression: { sets: 3, reps: 40 },
                tips: '脚跟着地，身体后倾角度决定难度'
            },
            {
                level: 2,
                name: '水平引体',
                description: '身体水平悬挂于低杠下方拉起',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 20 },
                progression: { sets: 3, reps: 30 },
                tips: '身体保持笔直，胸部触杠'
            },
            {
                level: 3,
                name: '折刀引体',
                description: '脚放在椅子上的引体向上',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 15 },
                progression: { sets: 3, reps: 20 },
                tips: '腿部提供辅助力量'
            },
            {
                level: 4,
                name: '半引体向上',
                description: '从手臂弯曲90度开始的引体',
                beginner: { sets: 1, reps: 8 },
                intermediate: { sets: 2, reps: 11 },
                progression: { sets: 2, reps: 15 },
                tips: '起始位置手臂弯曲成90度'
            },
            {
                level: 5,
                name: '标准引体向上',
                description: '完整幅度的引体向上',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 8 },
                progression: { sets: 2, reps: 10 },
                tips: '下巴过杠，手臂完全伸直'
            },
            {
                level: 6,
                name: '窄距引体向上',
                description: '双手靠拢的引体向上',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 8 },
                progression: { sets: 2, reps: 10 },
                tips: '两手间距约10-15厘米'
            },
            {
                level: 7,
                name: '偏重引体向上',
                description: '一只手握毛巾的引体向上',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 7 },
                progression: { sets: 2, reps: 8 },
                tips: '握毛巾的手提供较少力量'
            },
            {
                level: 8,
                name: '单臂半引体向上',
                description: '单臂从90度位置拉起',
                beginner: { sets: 1, reps: 4 },
                intermediate: { sets: 2, reps: 6 },
                progression: { sets: 2, reps: 8 },
                tips: '另一只手可以轻扶手腕'
            },
            {
                level: 9,
                name: '单臂辅助引体',
                description: '一只手握低位毛巾的单臂引体',
                beginner: { sets: 1, reps: 3 },
                intermediate: { sets: 2, reps: 5 },
                progression: { sets: 2, reps: 7 },
                tips: '辅助手位置越低难度越大'
            },
            {
                level: 10,
                name: '单臂引体向上',
                description: '完美的单臂引体向上',
                beginner: { sets: 1, reps: 1 },
                intermediate: { sets: 2, reps: 3 },
                progression: { sets: 2, reps: 6 },
                tips: '囚徒健身的终极目标之一'
            }
        ],
        
        legRaise: [
            {
                level: 1,
                name: '坐姿屈膝',
                description: '坐在椅子边缘，抬膝收腿',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 25 },
                progression: { sets: 3, reps: 40 },
                tips: '膝盖尽量靠近胸部'
            },
            {
                level: 2,
                name: '平卧屈膝',
                description: '平躺，双腿弯曲抬起',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 20 },
                progression: { sets: 3, reps: 35 },
                tips: '下背部贴紧地面'
            },
            {
                level: 3,
                name: '平卧蛙举腿',
                description: '平躺，弯曲腿抬起再伸直',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 15 },
                progression: { sets: 3, reps: 30 },
                tips: '腿伸直时与地面成45度角'
            },
            {
                level: 4,
                name: '平卧半举腿',
                description: '平躺，直腿抬至45度',
                beginner: { sets: 1, reps: 8 },
                intermediate: { sets: 2, reps: 12 },
                progression: { sets: 2, reps: 20 },
                tips: '保持腿部伸直'
            },
            {
                level: 5,
                name: '平卧直举腿',
                description: '平躺，直腿抬至垂直',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '脚尖指向天花板'
            },
            {
                level: 6,
                name: '悬垂屈膝',
                description: '悬挂在单杠上，屈膝抬腿',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 15 },
                tips: '膝盖抬至与地面平行'
            },
            {
                level: 7,
                name: '悬垂蛙举腿',
                description: '悬挂，屈腿抬起再伸直',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 15 },
                tips: '伸直时腿与地面平行'
            },
            {
                level: 8,
                name: '悬垂半举腿',
                description: '悬挂，直腿抬至与地面平行',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 15 },
                tips: '控制速度，不要摆动'
            },
            {
                level: 9,
                name: '悬垂直举腿',
                description: '悬挂，直腿抬至水平',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 15 },
                tips: '在顶部保持1秒'
            },
            {
                level: 10,
                name: 'V字举腿',
                description: '悬挂，直腿抬至触杠',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 30 },
                tips: '脚尖触碰单杠'
            }
        ],
        
        bridge: [
            {
                level: 1,
                name: '短桥',
                description: '平躺，臀部抬起成桥形',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 25 },
                progression: { sets: 3, reps: 50 },
                tips: '肩膀和脚掌着地'
            },
            {
                level: 2,
                name: '直桥',
                description: '坐姿，手脚撑地抬起身体',
                beginner: { sets: 1, reps: 10 },
                intermediate: { sets: 2, reps: 20 },
                progression: { sets: 3, reps: 40 },
                tips: '身体成一条直线'
            },
            {
                level: 3,
                name: '高低桥',
                description: '头和脚放在不同高度的桥',
                beginner: { sets: 1, reps: 8 },
                intermediate: { sets: 2, reps: 15 },
                progression: { sets: 3, reps: 30 },
                tips: '用床或椅子垫高'
            },
            {
                level: 4,
                name: '顶桥',
                description: '头顶着地的桥',
                beginner: { sets: 1, reps: 8 },
                intermediate: { sets: 2, reps: 15 },
                progression: { sets: 2, reps: 25 },
                tips: '头顶垫软物保护'
            },
            {
                level: 5,
                name: '半桥',
                description: '靠墙辅助的半幅度桥',
                beginner: { sets: 1, reps: 8 },
                intermediate: { sets: 2, reps: 15 },
                progression: { sets: 2, reps: 20 },
                tips: '背对墙壁，手扶墙下滑'
            },
            {
                level: 6,
                name: '标准桥',
                description: '完整的桥式动作',
                beginner: { sets: 1, reps: 6 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 15 },
                tips: '手脚尽量靠近，身体成拱形'
            },
            {
                level: 7,
                name: '下行桥',
                description: '从站姿向后弯腰成桥',
                beginner: { sets: 1, reps: 3 },
                intermediate: { sets: 2, reps: 6 },
                progression: { sets: 2, reps: 10 },
                tips: '初学者靠墙练习'
            },
            {
                level: 8,
                name: '上行桥',
                description: '从桥姿站起来',
                beginner: { sets: 1, reps: 2 },
                intermediate: { sets: 2, reps: 4 },
                progression: { sets: 2, reps: 8 },
                tips: '需要腿部和核心力量配合'
            },
            {
                level: 9,
                name: '合桥',
                description: '下行+上行连续完成',
                beginner: { sets: 1, reps: 1 },
                intermediate: { sets: 2, reps: 3 },
                progression: { sets: 2, reps: 6 },
                tips: '流畅连贯地完成'
            },
            {
                level: 10,
                name: '铁板桥',
                description: '单腿站立的完美桥式',
                beginner: { sets: 1, reps: 1 },
                intermediate: { sets: 2, reps: 3 },
                progression: { sets: 2, reps: 30 },
                tips: '囚徒健身的终极目标之一'
            }
        ],
        
        handstandPushup: [
            {
                level: 1,
                name: '靠墙顶立',
                description: '面对墙壁的倒立静态保持',
                beginner: { sets: 1, reps: '30秒' },
                intermediate: { sets: 1, reps: '1分钟' },
                progression: { sets: 1, reps: '2分钟' },
                tips: '手距墙约15-25厘米'
            },
            {
                level: 2,
                name: '乌鸦式',
                description: '双手撑地，膝盖抵住手肘',
                beginner: { sets: 1, reps: '10秒' },
                intermediate: { sets: 1, reps: '30秒' },
                progression: { sets: 1, reps: '1分钟' },
                tips: '重心前移，找到平衡点'
            },
            {
                level: 3,
                name: '靠墙倒立',
                description: '背靠墙的标准倒立',
                beginner: { sets: 1, reps: '30秒' },
                intermediate: { sets: 1, reps: '1分钟' },
                progression: { sets: 1, reps: '2分钟' },
                tips: '蹬墙上去，腹部面向墙壁'
            },
            {
                level: 4,
                name: '半倒立撑',
                description: '靠墙倒立，下降一半再推起',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 20 },
                tips: '头部下降到与手同高'
            },
            {
                level: 5,
                name: '标准倒立撑',
                description: '靠墙的完整倒立撑',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 10 },
                progression: { sets: 2, reps: 15 },
                tips: '头部轻触地面'
            },
            {
                level: 6,
                name: '窄距倒立撑',
                description: '双手靠拢的倒立撑',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 9 },
                progression: { sets: 2, reps: 12 },
                tips: '手间距约10厘米'
            },
                        {
                level: 7,
                name: '偏重倒立撑',
                description: '一只手放在篮球上的倒立撑',
                beginner: { sets: 1, reps: 5 },
                intermediate: { sets: 2, reps: 8 },
                progression: { sets: 2, reps: 10 },
                tips: '篮球那只手主要保持平衡'
            },
            {
                level: 8,
                name: '单臂半倒立撑',
                description: '单臂下降一半的倒立撑',
                beginner: { sets: 1, reps: 4 },
                intermediate: { sets: 2, reps: 6 },
                progression: { sets: 2, reps: 8 },
                tips: '另一只手可轻扶墙壁'
            },
            {
                level: 9,
                name: '杠杆倒立撑',
                description: '一只手撑在篮球上的单臂倒立撑',
                beginner: { sets: 1, reps: 3 },
                intermediate: { sets: 2, reps: 4 },
                progression: { sets: 2, reps: 6 },
                tips: '篮球手仅作辅助平衡'
            },
            {
                level: 10,
                name: '单臂倒立撑',
                description: '完美的单臂倒立撑',
                beginner: { sets: 1, reps: 1 },
                intermediate: { sets: 2, reps: 2 },
                progression: { sets: 1, reps: 5 },
                tips: '囚徒健身的终极目标之一'
            }
        ]
    },
    
    // 获取动作类型信息
    getExerciseType(type) {
        return this.types[type] || null;
    },
    
    // 获取所有动作类型
    getAllTypes() {
        return Object.keys(this.types).map(key => ({
            key,
            ...this.types[key]
        }));
    },
    
    // 获取某个动作的某个等级信息
    getLevel(exerciseType, level) {
        const levels = this.levels[exerciseType];
        if (!levels) return null;
        return levels.find(l => l.level === level) || null;
    },
    
    // 获取某个动作的所有等级
    getAllLevels(exerciseType) {
        return this.levels[exerciseType] || [];
    },
    
    // 获取进阶标准
    getProgressionStandard(exerciseType, level) {
        const levelInfo = this.getLevel(exerciseType, level);
        if (!levelInfo) return null;
        return levelInfo.progression;
    },
    
    // 检查是否达到进阶标准
    checkProgression(exerciseType, level, sets, reps, feeling) {
        const standard = this.getProgressionStandard(exerciseType, level);
        if (!standard) return { canProgress: false, reason: '未找到标准' };
        
        // 如果是时间类型的标准（如倒立保持）
        if (typeof standard.reps === 'string') {
            return {
                canProgress: false,
                reason: '请根据时间标准自行判断',
                standard
            };
        }
        
        const targetSets = standard.sets;
        const targetReps = standard.reps;
        
        // 检查是否达标
        const totalReps = sets * reps;
        const targetTotal = targetSets * targetReps;
        
        if (sets >= targetSets && reps >= targetReps) {
            // 达到进阶标准
            if (feeling === 'easy' || feeling === 'normal') {
                return {
                    canProgress: true,
                    reason: `恭喜！你已完成 ${sets}×${reps}，达到进阶标准 ${targetSets}×${targetReps}，可以尝试下一阶段！`,
                    standard
                };
            } else {
                return {
                    canProgress: false,
                    reason: `数据达标但感觉${feeling === 'hard' ? '吃力' : '崩溃'}，建议继续巩固后再进阶`,
                    standard
                };
            }
        }
        
        // 计算完成度
        const completion = Math.round((totalReps / targetTotal) * 100);
        
        return {
            canProgress: false,
            reason: `当前 ${sets}×${reps}，目标 ${targetSets}×${targetReps}，完成度 ${completion}%`,
            completion,
            standard
        };
    },
    
    // 获取当前等级的显示文本
    getLevelDisplayText(exerciseType, level) {
        const levelInfo = this.getLevel(exerciseType, level);
        const typeInfo = this.getExerciseType(exerciseType);
        
        if (!levelInfo || !typeInfo) return '';
        
        return `${typeInfo.name} · 第${level}式 · ${levelInfo.name}`;
    }
};

// 导出
window.Exercises = Exercises;

