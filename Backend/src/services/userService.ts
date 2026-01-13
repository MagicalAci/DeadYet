/**
 * 用户服务
 */

import { eq, desc, and, sql } from 'drizzle-orm'
import { db, users, checkIns, type User, type NewUser, type CheckIn, type NewCheckIn } from '../db/index.js'

// 随机昵称列表
const nicknames = [
  '匿名牛马', '加班狗', '社畜一号', '韭菜本菜', '打工人',
  '苦逼程序员', 'PPT战士', 'Excel大师', '会议室常客', '卑微打工仔',
  '摸鱼专家', '带薪拉屎', '划水达人', '职场老油条', '牛马本马',
  '搬砖侠', '码农日记', '社畜日常', '打工魂', '干饭人'
]

// 随机Emoji
const emojis = ['🐂', '🐴', '🐕', '🐷', '🦊', '🐱', '🐰', '🐻', '🐼', '🦁', '🐯', '🐸']

export const userService = {
  
  // 通过邮箱登录/注册
  async loginWithEmail(email: string): Promise<{ user: User; isNew: boolean }> {
    // 查找现有用户
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email)
    })
    
    if (existing) {
      return { user: existing, isNew: false }
    }
    
    // 创建新用户
    const newUser: NewUser = {
      email,
      nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
      avatarEmoji: emojis[Math.floor(Math.random() * emojis.length)],
      survivalDays: 0,
      totalCheckIns: 0,
      currentStreak: 0,
      longestStreak: 0,
    }
    
    const [user] = await db.insert(users).values(newUser).returning()
    
    return { user, isNew: true }
  },
  
  // 获取用户信息
  async getUser(userId: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })
    return user || null
  },
  
  // 更新用户信息
  async updateUser(userId: string, data: Partial<User>): Promise<User | null> {
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning()
    return user || null
  },
  
  // 签到
  async checkIn(
    userId: string,
    complaint?: string,
    mood?: string,
    city?: string,
    district?: string,
    latitude?: number,
    longitude?: number
  ): Promise<{ record: CheckIn; user: User; aiResponse?: string }> {
    // 获取用户
    const user = await this.getUser(userId)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    // 检查今天是否已签到
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existingCheckIn = await db.query.checkIns.findFirst({
      where: and(
        eq(checkIns.userId, userId),
        sql`${checkIns.checkInTime} >= ${today}`
      )
    })
    
    if (existingCheckIn) {
      throw new Error('今天已经打过卡了')
    }
    
    // 生成AI回复
    const aiResponse = generateAIResponse(complaint, mood)
    
    // 创建签到记录
    const newCheckIn: any = {
      userId,
      complaint,
      aiResponse,
      mood: mood || 'neutral',
      city,
      district,
      latitude,
      longitude,
      bannerGenerated: true,
    }
    
    const [record] = await db.insert(checkIns).values(newCheckIn as any).returning()
    
    // 更新用户统计
    const isConsecutive = user.lastCheckIn && 
      (new Date().getTime() - new Date(user.lastCheckIn).getTime()) < 48 * 60 * 60 * 1000
    
    const newStreak = isConsecutive ? user.currentStreak + 1 : 1
    
    const [updatedUser] = await db.update(users)
      .set({
        survivalDays: user.survivalDays + 1,
        totalCheckIns: user.totalCheckIns + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        lastCheckIn: new Date(),
        city,
        district,
      })
      .where(eq(users.id, userId))
      .returning()
    
    return { record, user: updatedUser, aiResponse }
  },
  
  // 获取签到历史
  async getCheckInHistory(userId: string, limit: number = 30): Promise<CheckIn[]> {
    return db.query.checkIns.findMany({
      where: eq(checkIns.userId, userId),
      orderBy: [desc(checkIns.checkInTime)],
      limit,
    })
  },
  
  // 获取今天的签到
  async getTodayCheckIn(userId: string): Promise<CheckIn | null> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const record = await db.query.checkIns.findFirst({
      where: and(
        eq(checkIns.userId, userId),
        sql`${checkIns.checkInTime} >= ${today}`
      )
    })
    
    return record || null
  },
}

// AI 回复生成
function generateAIResponse(complaint?: string, mood?: string): string {
  if (!complaint) {
    const responses = [
      '行，今天又没死，恭喜你👏',
      '又苟过一天，明天继续！',
      '没抱怨？装什么坚强呢？',
      '沉默的牛马，是最可怕的牛马。',
      '不说话是吧？憋着等着猝死？',
      '恭喜存活+1天，距离财务自由还有∞天'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  const lowerComplaint = complaint.toLowerCase()
  
  if (lowerComplaint.includes('加班')) {
    return '又加班？你这是打工还是卖身？加班费呢？没有？那你加个屁！'
  }
  if (lowerComplaint.includes('领导') || lowerComplaint.includes('老板')) {
    return '你领导是不是脑子有坑？这种傻逼领导全国多了去了，你不走他走不了，懂？'
  }
  if (lowerComplaint.includes('工资') || lowerComplaint.includes('钱')) {
    return '就这点钱你还干？我真服了你这种老实人。穷是暂时的，被压榨是持久的。'
  }
  if (lowerComplaint.includes('同事')) {
    return '职场没有朋友，只有利益。让他去死，你继续苟着，熬到比他先跑路。'
  }
  if (lowerComplaint.includes('累') || lowerComplaint.includes('困')) {
    return '累就对了，不累怎么叫打工？建议今晚早睡，明天继续被操。'
  }
  if (lowerComplaint.includes('开会')) {
    return '又开会？形式主义害死人啊。建议带个耳机假装在听，实际刷刷招聘APP。'
  }
  
  const genericResponses = [
    '就这？我听过比这惨十倍的。你这算什么，继续苟着吧。',
    '行吧，骂完了？骂完继续打工，明天还得上班呢。',
    '恭喜你没猝死，这就是你今天最大的成就。',
    '又活过一天，明天继续被操。睡吧。',
    '职场没有朋友，只有利益。清醒点，干活去。',
    '你倒是挺能忍的，继续苟吧！'
  ]
  
  return genericResponses[Math.floor(Math.random() * genericResponses.length)]
}

export default userService
