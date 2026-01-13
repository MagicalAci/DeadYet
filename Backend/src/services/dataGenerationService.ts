/**
 * 线上级数据生成服务
 * 
 * 核心功能：
 * 1. 生成几十万虚拟用户
 * 2. 基于真实时间的上下班算法
 * 3. 城市/区域特色配置
 * 4. 评论/点赞数据生成
 */

import { db } from '../db'
import { users, complaints, comments, likes, checkIns, cityStats, districtStats, hotSpots } from '../db/schema'
import { sql } from 'drizzle-orm'
import { 
  CITIES, DISTRICTS, HOTSPOTS, 
  getRandomNickname, getRandomEmoji,
  CityConfig, DistrictConfig, HotSpotConfig
} from '../data/geoData'

// 使用导入的配置（创建本地别名以保持兼容）
const CITY_CONFIGS = CITIES
const DISTRICT_CONFIGS = DISTRICTS
const HOTSPOT_CONFIGS = HOTSPOTS

// 重新导出供其他模块使用
export { CITY_CONFIGS, DISTRICT_CONFIGS, HOTSPOT_CONFIGS }
export type { CityConfig, DistrictConfig, HotSpotConfig }

// ==================== 时间算法 ====================

/**
 * 核心时间算法：计算某时间点某地区的在班率
 * 
 * @param hour 当前小时（0-23）
 * @param minute 当前分钟（0-59）
 * @param overtimeIndex 加班指数（1.0=正常，越高加班越严重）
 * @param isWeekend 是否周末
 * @returns 在班率（0-1，1表示100%都在上班）
 */
export function calculateWorkingRate(
  hour: number,
  minute: number,
  overtimeIndex: number = 1.0,
  isWeekend: boolean = false
): number {
  const time = hour + minute / 60
  
  // 周末：只有极少数人加班
  if (isWeekend) {
    // 周末加班率基准
    const weekendBase = 0.15 * overtimeIndex  // 15%的人周末加班
    if (time < 10 || time > 20) return 0.02  // 周末早晚几乎没人
    if (time >= 10 && time <= 18) return weekendBase * 0.7  // 周末白天
    return weekendBase * 0.3  // 周末晚上
  }
  
  // 工作日时间段计算
  let baseRate: number
  
  if (time < 8) {
    // 凌晨-8点：极少数人（夜班/特早）
    baseRate = 0.02
  } else if (time < 9) {
    // 8-9点：陆续上班
    baseRate = 0.02 + (time - 8) * 0.5  // 2% → 52%
  } else if (time < 9.5) {
    // 9-9:30：上班高峰
    baseRate = 0.52 + (time - 9) * 0.86  // 52% → 95%
  } else if (time < 17.5) {
    // 9:30-17:30：正常工作时间
    baseRate = 0.95
  } else if (time < 18) {
    // 17:30-18:00：少数人提前下班
    baseRate = 0.95 - (time - 17.5) * 0.1  // 95% → 90%
  } else if (time < 19) {
    // 18-19点：第一波下班潮（准点党）
    const progress = time - 18
    // 正常公司90%→55%，加班严重的公司下班更慢
    const dropRate = 0.35 / overtimeIndex  // 加班指数越高，下班越慢
    baseRate = 0.9 - progress * dropRate
  } else if (time < 20) {
    // 19-20点：第一波加班结束
    const progress = time - 19
    const startRate = 0.9 - 0.35 / overtimeIndex
    const dropRate = 0.25 / overtimeIndex
    baseRate = startRate - progress * dropRate
  } else if (time < 21) {
    // 20-21点：常规加班结束
    const progress = time - 20
    const startRate = 0.9 - 0.35 / overtimeIndex - 0.25 / overtimeIndex
    const dropRate = 0.15 / overtimeIndex
    baseRate = startRate - progress * dropRate
  } else if (time < 22) {
    // 21-22点：中度加班结束
    const progress = time - 21
    // 计算到21点时的在班率
    const rate21 = 0.9 - (0.35 + 0.25 + 0.15) / overtimeIndex
    baseRate = Math.max(0.05, rate21 - progress * 0.1)
  } else if (time < 23) {
    // 22-23点：重度加班
    baseRate = Math.max(0.03, 0.15 * overtimeIndex - (time - 22) * 0.05)
  } else {
    // 23-24点：极端加班
    baseRate = Math.max(0.01, 0.1 * overtimeIndex - (time - 23) * 0.05)
  }
  
  // 加班指数调整（加班多的地方，晚间在班率更高）
  if (time >= 18 && overtimeIndex > 1) {
    baseRate = baseRate * (1 + (overtimeIndex - 1) * 0.5)
  }
  
  // 限制范围
  return Math.max(0.01, Math.min(0.98, baseRate))
}

/**
 * 计算某城市某时间点的统计数据
 */
export function calculateCityStats(
  cityConfig: CityConfig,
  now: Date = new Date()
): {
  totalWorkers: number
  stillWorking: number
  checkedIn: number
  workingRate: number
  avgCheckoutTime: string
} {
  const hour = now.getHours()
  const minute = now.getMinutes()
  const dayOfWeek = now.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  const totalWorkers = cityConfig.workerBase * 10000
  const workingRate = calculateWorkingRate(hour, minute, cityConfig.overtimeIndex, isWeekend)
  const stillWorking = Math.round(totalWorkers * workingRate)
  const checkedIn = totalWorkers - stillWorking
  
  // 计算平均下班时间显示
  const avgHour = Math.floor(cityConfig.avgCheckoutHour)
  const avgMin = Math.round((cityConfig.avgCheckoutHour % 1) * 60)
  const avgCheckoutTime = `${avgHour}:${avgMin.toString().padStart(2, '0')}`
  
  return {
    totalWorkers,
    stillWorking,
    checkedIn,
    workingRate,
    avgCheckoutTime
  }
}

// ==================== 数据生成 ====================

// 虚拟昵称库
const NICKNAMES = [
  '匿名牛马', '加班狗', '社畜一号', '韭菜本菜', '打工人',
  '苦逼程序员', 'PPT战士', 'Excel大师', '会议室常客', '卑微打工仔',
  '摸鱼专家', '带薪拉屎', '划水达人', '职场老油条', '牛马本马',
  '搬砖侠', '码农日记', '社畜日常', '打工魂', '底层员工',
  '没有周末', '猝死预备', '在线崩溃', '精神离职', '干饭人',
  '无名打工仔', '格子间囚犯', '工位牢笼', '通勤战士', '早八人',
  '晚十一人', '周报填充机', '需求接受器', '甲方受气包', 'bug制造机',
  '功能搬运工', '代码缝合怪', '文档复读机', 'deadline追赶者', '焦虑本焦',
]

const EMOJIS = [
  '🐂', '🐴', '🐕', '🐷', '🦊', '🐱', '🐰', '🐻', '🐼', '🦁',
  '🐯', '🐸', '🐔', '🐧', '🦆', '🦉', '🐺', '🐵', '🙈', '🐶',
  '🦄', '🐲', '🦋', '🐝', '🐢', '🦀', '🐙', '🦑', '🦐', '🐳',
]

// 抱怨文案库（按类别）
const COMPLAINT_TEMPLATES: Record<string, string[]> = {
  overtime: [
    '领导说开个快会，结果开了3个小时，我人都麻了',
    '加班到10点，加班费一分没有，爱谁谁吧',
    '周五晚上10点来需求，周一早上要，这是人能干的事？',
    '通勤2小时，上班8小时，加班4小时，睡觉6小时',
    '又是凌晨12点下班的一天，出租车司机都认识我了',
    '连续加班两周，周末还要加班，我是不是应该住公司',
    '说好的弹性工作制，结果只弹不缩，永远加班',
    '今天又是最后一个走的，保安都跟我混熟了',
    '加班加到女朋友跟我分手了',
    '凌晨两点还在改bug，明天还要8点开会',
    '国庆七天，加班五天，我是公司的牛马',
    '加班到现在，外卖都不送了，只能吃泡面',
    '我真的已经连续加班20天了，感觉身体要垮了',
    '今天加班到11点，明天还要7点开会，求求让我死吧',
    '领导说这周必须上线，那我这周就必须住公司了',
  ],
  boss: [
    '老板画的饼我都能开面包店了',
    '领导开会只会说"大家要努力"，你倒是给我涨工资啊',
    '领导说年底双薪，现在说资金紧张',
    '领导永远都是对的，错的都是我们',
    '领导邮件回复只有一个字：知',
    '我们领导最大的本事就是把功劳据为己有',
    '领导说要给我升职，结果只升了title，工资不变',
    '老板说公司是大家的家，那我能带狗来上班吗',
    '领导的"我觉得"比甲方的"我觉得"还可怕',
    '领导说年轻人要多锻炼，所以天天加班锻炼我',
    '领导开会2小时讲废话，做事5分钟下结论',
    '我领导最厉害的是让你加班还觉得是自己不够努力',
    '领导说这个项目对你的成长很有帮助，然后没有任何奖励',
    'PUA大师本尊，我的领导',
    '领导画的饼够我吃一辈子了，可惜都是空气',
  ],
  colleague: [
    '同事把锅甩给我，我真是服了这帮孙子',
    '旁边同事每天吃螺蛳粉，我快窒息了',
    '同事又在群里发正能量文章了，麻烦闭嘴',
    '同事总是抢我的活干，然后汇报说是他做的',
    '新来的同事工资比我高，我干了三年了',
    '同事每天准点下班，活全是我干的',
    '同事偷吃了我的零食，还不承认',
    '有的同事上班就是来社交的，一点活不干',
    '同事天天在工位打电话，吵死了',
    '发现同事在背后说我坏话，人心太可怕',
    '同事请假我替他干活，我请假没人管',
    '我同事真的是职场白莲花，表面一套背后一套',
  ],
  salary: [
    '工资拖了半个月还没发，要饿死了',
    '试用期6个月，说好的转正又延了',
    '说好的涨薪，结果涨了200块，打发叫花子呢',
    '年终奖发了500块购物卡，还只能在公司食堂用',
    '招聘写的15-25k，进来才知道是15k',
    '公司说今年效益不好，可老板换了辆新车',
    '涨薪跑不赢通胀，越干越穷',
    '税前看着不错，税后心凉半截',
    '同样的工作，为什么他工资比我高3k？',
    '说好的13薪没了，14薪更是想都别想',
    '绩效评级打了个B，今年涨薪又没戏了',
    '公司说效益不好降薪，领导们却一个没降',
  ],
  meeting: [
    '早上9点开会开到下午6点，啥活没干',
    '每天开会开会开会，工作都是加班干的',
    '会议纪要写了30页，没有一条执行的',
    '开会讨论怎么提高效率，开了一天',
    '一天7个会，上厕所都没时间',
    '又是周五下午5点的会，周末又没了',
    '开了3小时会，结论是再开一个会',
    '会议室抢不到，只能在茶水间开会',
    '每次开会都是废话，能邮件解决的非要开会',
    '视频会议8小时，我眼睛快瞎了',
  ],
  general: [
    '需求又改了，产品经理脑子是不是有坑',
    '产品说这个需求很简单，就改一下，改了三天',
    '测试提的bug比我写的代码还多',
    '公司空调永远26度，冬天冷死夏天热死',
    '食堂今天又是那几个菜，我都能背出菜单了',
    'WiFi又断了，年费几十万的网络就这？',
    '打印机又坏了，IT说明天修，已经明天一个月了',
    '工位太挤了，键盘都放不下',
    '公司厕所永远排队，憋死我了',
    '电梯等了20分钟，差点迟到',
    '公司楼下咖啡涨价了，打工人连咖啡都喝不起',
    '今天又被客户骂了，真想一走了之',
    '需求文档写得跟天书一样，鬼才看得懂',
    '这破电脑卡得要命，开个文件等半天',
    '接手了离职同事的屎山代码，改一行崩一片',
  ]
}

// 评论文案库
const COMMENT_TEMPLATES = [
  '哈哈哈哈同一个世界同一个领导',
  '兄弟我懂你',
  '太真实了😭',
  '这不就是我吗',
  '苦逼打工人+1',
  '看哭了',
  '抱抱你',
  '一起加油吧',
  '今天也是想辞职的一天',
  '想开点，工作没了可以再找，命只有一条',
  '是我本人了',
  '我已经麻了',
  '泪目',
  '我比你还惨...',
  '咱俩可能是同事吧',
  '真的无语了',
  '也太真实了',
  '每天都在想怎么逃离',
  '打工人打工魂',
  '还好有你们陪我吐槽',
  '心疼自己',
  '这就是职场吧',
  '也许这就是生活吧',
  '救命啊谁来救救我',
  '已经润到成都了，舒服多了',
  '兄弟撑住！',
  '一样一样的...',
  '太惨了',
  '我们公司也是这样',
  '全国打工人是一家',
]

/**
 * 生成随机用户ID（UUID格式）
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 随机选择数组元素
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 生成随机时间（在指定时间范围内）
 */
function randomTimeBetween(start: Date, end: Date): Date {
  const startTime = start.getTime()
  const endTime = end.getTime()
  return new Date(startTime + Math.random() * (endTime - startTime))
}

/**
 * 生成抱怨内容
 */
function generateComplaintContent(category?: string): {
  content: string
  category: string
  contentType: 'text' | 'voice'
  voiceDuration?: number
} {
  const categories = Object.keys(COMPLAINT_TEMPLATES)
  const selectedCategory = category || randomPick(categories)
  const templates = COMPLAINT_TEMPLATES[selectedCategory] || COMPLAINT_TEMPLATES['general']
  
  // 20%概率是语音
  const isVoice = Math.random() < 0.2
  
  if (isVoice) {
    return {
      content: '',  // 语音没有文本内容
      category: selectedCategory,
      contentType: 'voice',
      voiceDuration: Math.floor(Math.random() * 25) + 3  // 3-28秒
    }
  }
  
  return {
    content: randomPick(templates),
    category: selectedCategory,
    contentType: 'text'
  }
}

// ==================== 批量生成服务 ====================

export class DataGenerationService {
  
  /**
   * 生成虚拟用户
   */
  async generateUsers(count: number): Promise<number> {
    console.log(`开始生成 ${count} 个虚拟用户...`)
    
    const batchSize = 1000
    let created = 0
    
    for (let i = 0; i < count; i += batchSize) {
      const batch = []
      const currentBatch = Math.min(batchSize, count - i)
      
      for (let j = 0; j < currentBatch; j++) {
        const city = randomPick(CITY_CONFIGS)
        const districts = DISTRICT_CONFIGS.filter(d => d.city === city.name)
        const district = districts.length > 0 ? randomPick(districts) : null
        
        batch.push({
          email: `user_${generateUUID().slice(0, 8)}@virtual.deadyet.app`,
          nickname: randomPick(NICKNAMES),
          avatarEmoji: randomPick(EMOJIS),
          survivalDays: Math.floor(Math.random() * 365) + 1,
          totalCheckIns: Math.floor(Math.random() * 200) + 1,
          currentStreak: Math.floor(Math.random() * 30) + 1,
          longestStreak: Math.floor(Math.random() * 100) + 1,
          city: city.name,
          district: district?.name,
        })
      }
      
      await db.insert(users).values(batch as any)
      created += currentBatch
      
      if (created % 10000 === 0) {
        console.log(`已生成 ${created} / ${count} 用户`)
      }
    }
    
    console.log(`用户生成完成，共 ${created} 个`)
    return created
  }
  
  /**
   * 生成抱怨数据
   */
  async generateComplaints(count: number): Promise<number> {
    console.log(`开始生成 ${count} 条抱怨...`)
    
    // 获取所有用户
    const allUsers = await db.select({ id: users.id, city: users.city, district: users.district })
      .from(users)
      .limit(100000)
    
    if (allUsers.length === 0) {
      console.log('没有用户数据，请先生成用户')
      return 0
    }
    
    const batchSize = 500
    let created = 0
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    for (let i = 0; i < count; i += batchSize) {
      const batch = []
      const currentBatch = Math.min(batchSize, count - i)
      
      for (let j = 0; j < currentBatch; j++) {
        const user = randomPick(allUsers)
        const cityConfig = CITY_CONFIGS.find(c => c.name === user.city) || randomPick(CITY_CONFIGS)
        const districts = DISTRICT_CONFIGS.filter(d => d.city === cityConfig.name)
        const district = districts.find(d => d.name === user.district) || (districts.length > 0 ? randomPick(districts) : null)
        
        const complaintData = generateComplaintContent()
        const createdAt = randomTimeBetween(sevenDaysAgo, now)
        
        // 点赞数根据时间和内容热度计算
        const hoursAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        const baseLikes = Math.floor(Math.random() * 500) + 10
        const timeFactor = Math.max(0.1, 1 - hoursAgo / 168)  // 7天内衰减
        const likesCount = Math.floor(baseLikes * timeFactor * (1 + Math.random()))
        
        // 评论数约为点赞的10-30%
        const commentsCount = Math.floor(likesCount * (0.1 + Math.random() * 0.2))
        
        batch.push({
          userId: user.id,
          contentType: complaintData.contentType,
          content: complaintData.content || null,
          voiceDuration: complaintData.voiceDuration || null,
          voiceUrl: complaintData.contentType === 'voice' 
            ? `https://storage.deadyet.app/voice/${generateUUID()}.m4a` 
            : null,
          category: complaintData.category,
          userNickname: randomPick(NICKNAMES),
          userEmoji: randomPick(EMOJIS),
          isAnonymous: true,
          isAiGenerated: true,
          latitude: (district?.lat || cityConfig.lat) + (Math.random() - 0.5) * 0.02,
          longitude: (district?.lon || cityConfig.lon) + (Math.random() - 0.5) * 0.02,
          city: cityConfig.name,
          district: district?.name,
          likesCount,
          commentsCount,
          createdAt,
        })
      }
      
      await db.insert(complaints).values(batch as any)
      created += currentBatch
      
      if (created % 5000 === 0) {
        console.log(`已生成 ${created} / ${count} 抱怨`)
      }
    }
    
    console.log(`抱怨生成完成，共 ${created} 条`)
    return created
  }
  
  /**
   * 为已有抱怨生成评论
   */
  async generateComments(): Promise<number> {
    console.log('开始生成评论...')
    
    // 获取所有需要生成评论的抱怨
    const allComplaints = await db.select({
      id: complaints.id,
      commentsCount: complaints.commentsCount,
      createdAt: complaints.createdAt
    }).from(complaints).limit(50000)
    
    const allUsers = await db.select({ id: users.id })
      .from(users)
      .limit(100000)
    
    if (allComplaints.length === 0 || allUsers.length === 0) {
      console.log('没有抱怨或用户数据')
      return 0
    }
    
    let totalCreated = 0
    const batchSize = 500
    const now = new Date()
    
    for (const complaint of allComplaints) {
      const targetCount = complaint.commentsCount || 0
      if (targetCount === 0) continue
      
      // 为每条抱怨生成对应数量的评论
      const commentBatch = []
      const complaintTime = complaint.createdAt || new Date()
      
      for (let i = 0; i < targetCount && i < 50; i++) {  // 最多50条评论
        const user = randomPick(allUsers)
        // 评论时间在抱怨发布后
        const commentTime = randomTimeBetween(
          complaintTime,
          new Date(Math.min(now.getTime(), complaintTime.getTime() + 48 * 60 * 60 * 1000))
        )
        
        const isVoice = Math.random() < 0.1  // 10%是语音评论
        
        commentBatch.push({
          userId: user.id,
          complaintId: complaint.id,
          contentType: isVoice ? 'voice' : 'text',
          content: isVoice ? null : randomPick(COMMENT_TEMPLATES),
          voiceUrl: isVoice ? `https://storage.deadyet.app/voice/${generateUUID()}.m4a` : null,
          voiceDuration: isVoice ? Math.floor(Math.random() * 10) + 2 : null,
          userNickname: randomPick(NICKNAMES),
          userEmoji: randomPick(EMOJIS),
          likesCount: Math.floor(Math.random() * 50),
          isAiGenerated: true,
          createdAt: commentTime,
        })
      }
      
      if (commentBatch.length > 0) {
        await db.insert(comments).values(commentBatch as any)
        totalCreated += commentBatch.length
      }
      
      if (totalCreated % 5000 === 0 && totalCreated > 0) {
        console.log(`已生成 ${totalCreated} 条评论`)
      }
    }
    
    console.log(`评论生成完成，共 ${totalCreated} 条`)
    return totalCreated
  }
  
  /**
   * 初始化城市统计数据
   */
  async initializeCityStats(): Promise<void> {
    console.log('初始化城市统计数据...')
    
    for (const city of CITY_CONFIGS) {
      const stats = calculateCityStats(city)
      
      await db.insert(cityStats).values({
        city: city.name,
        province: city.province,
        tier: city.tier,
        latitude: city.lat,
        longitude: city.lon,
        totalWorkers: stats.totalWorkers,
        checkedIn: stats.checkedIn,
        stillWorking: stats.stillWorking,
        averageCheckOutTime: stats.avgCheckoutTime,
      } as any).onConflictDoUpdate({
        target: cityStats.city,
        set: {
          totalWorkers: stats.totalWorkers,
          checkedIn: stats.checkedIn,
          stillWorking: stats.stillWorking,
          averageCheckOutTime: stats.avgCheckoutTime,
          updatedAt: new Date(),
        } as any
      })
    }
    
    console.log(`城市统计初始化完成，共 ${CITY_CONFIGS.length} 个城市`)
  }
  
  /**
   * 初始化区域统计数据
   */
  async initializeDistrictStats(): Promise<void> {
    console.log('初始化区域统计数据...')
    
    for (const district of DISTRICT_CONFIGS) {
      const cityConfig = CITY_CONFIGS.find(c => c.name === district.city)
      if (!cityConfig) continue
      
      const baseStats = calculateCityStats(cityConfig)
      // 区域人数为城市的5-15%
      const districtWorkers = Math.round(baseStats.totalWorkers * (0.05 + Math.random() * 0.1))
      const workingRate = calculateWorkingRate(
        new Date().getHours(),
        new Date().getMinutes(),
        cityConfig.overtimeIndex * district.overtimeMultiplier,
        false
      )
      
      await db.insert(districtStats).values({
        city: district.city,
        district: district.name,
        latitude: district.lat,
        longitude: district.lon,
        totalWorkers: districtWorkers,
        checkedIn: Math.round(districtWorkers * (1 - workingRate)),
        stillWorking: Math.round(districtWorkers * workingRate),
      } as any)
    }
    
    console.log(`区域统计初始化完成，共 ${DISTRICT_CONFIGS.length} 个区域`)
  }
  
  /**
   * 初始化热门地点数据
   */
  async initializeHotSpots(): Promise<void> {
    console.log('初始化热门地点数据...')
    
    for (const spot of HOTSPOT_CONFIGS) {
      const cityConfig = CITY_CONFIGS.find(c => c.name === spot.city)
      const districtConfig = DISTRICT_CONFIGS.find(d => d.city === spot.city && d.name === spot.district)
      if (!cityConfig) continue
      
      // 计算该地点的加班指数
      const overtimeLevelMap = { extreme: 1.5, heavy: 1.25, normal: 1.0, light: 0.8 }
      const spotOvertimeIndex = cityConfig.overtimeIndex * overtimeLevelMap[spot.overtimeLevel]
      
      const workingRate = calculateWorkingRate(
        new Date().getHours(),
        new Date().getMinutes(),
        spotOvertimeIndex,
        false
      )
      
      // 计算平均下班时间
      const avgHourAdjust = (spotOvertimeIndex - 1) * 2  // 加班指数每高0.1，平均下班晚12分钟
      const avgCheckoutHour = Math.min(23, cityConfig.avgCheckoutHour + avgHourAdjust)
      const avgHour = Math.floor(avgCheckoutHour)
      const avgMin = Math.round((avgCheckoutHour % 1) * 60)
      
      await db.insert(hotSpots).values({
        name: spot.name,
        type: spot.type,
        city: spot.city,
        district: spot.district,
        latitude: (districtConfig?.lat || cityConfig.lat) + (Math.random() - 0.5) * 0.01,
        longitude: (districtConfig?.lon || cityConfig.lon) + (Math.random() - 0.5) * 0.01,
        totalWorkers: spot.workerCount,
        checkedIn: Math.round(spot.workerCount * (1 - workingRate)),
        stillWorking: Math.round(spot.workerCount * workingRate),
        averageCheckOutTime: `${avgHour}:${avgMin.toString().padStart(2, '0')}`,
        tags: spot.tags,
      } as any)
    }
    
    console.log(`热门地点初始化完成，共 ${HOTSPOT_CONFIGS.length} 个地点`)
  }
  
  /**
   * 完整初始化（一键生成所有数据）
   */
  async fullInitialize(options: {
    userCount?: number
    complaintCount?: number
  } = {}): Promise<{
    users: number
    complaints: number
    comments: number
    cities: number
    districts: number
    hotSpots: number
  }> {
    const userCount = options.userCount || 300000
    const complaintCount = options.complaintCount || 100000
    
    console.log('===== 开始完整数据初始化 =====')
    console.log(`目标：${userCount} 用户，${complaintCount} 抱怨`)
    
    // 1. 初始化地理数据
    await this.initializeCityStats()
    await this.initializeDistrictStats()
    await this.initializeHotSpots()
    
    // 2. 生成用户
    const usersCreated = await this.generateUsers(userCount)
    
    // 3. 生成抱怨
    const complaintsCreated = await this.generateComplaints(complaintCount)
    
    // 4. 生成评论
    const commentsCreated = await this.generateComments()
    
    console.log('===== 数据初始化完成 =====')
    
    return {
      users: usersCreated,
      complaints: complaintsCreated,
      comments: commentsCreated,
      cities: CITY_CONFIGS.length,
      districts: DISTRICT_CONFIGS.length,
      hotSpots: HOTSPOT_CONFIGS.length,
    }
  }
}

export const dataGenerationService = new DataGenerationService()
