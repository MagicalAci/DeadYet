/**
 * 签到路由
 * 
 * 记录牛马们的下班时间
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const checkin = new Hono()

// 签到Schema
const checkInSchema = z.object({
  userId: z.string(),
  complaint: z.string().optional(),
  mood: z.enum(['angry', 'tired', 'numb', 'neutral', 'relieved']).default('neutral'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
})

// 执行签到
checkin.post('/', zValidator('json', checkInSchema), async (c) => {
  const data = c.req.valid('json')
  
  // 获取当前时间
  const now = new Date()
  const hour = now.getHours()
  
  // 生成AI回复
  let aiResponse = ''
  
  if (data.complaint) {
    aiResponse = generateRoast(data.complaint)
  } else {
    aiResponse = getRandomCheckInResponse(hour)
  }
  
  // TODO: 保存到数据库
  const record = {
    id: 'checkin-' + Date.now(),
    userId: data.userId,
    checkInTime: now.toISOString(),
    complaint: data.complaint,
    aiResponse,
    bannerGenerated: true,
    mood: data.mood,
    location: data.city ? {
      city: data.city,
      district: data.district,
      latitude: data.latitude,
      longitude: data.longitude,
    } : null,
  }
  
  return c.json({
    success: true,
    message: '签到成功，又苟过一天',
    record,
    survivalDays: 48, // TODO: 从数据库获取
  })
})

// 获取签到历史
checkin.get('/history', async (c) => {
  const userId = c.req.query('userId')
  const limit = parseInt(c.req.query('limit') || '10')
  
  // TODO: 从数据库获取历史记录
  const history = [
    {
      id: 'checkin-1',
      checkInTime: new Date().toISOString(),
      complaint: '今天又加班了',
      aiResponse: '这种狗屎班你还上？',
      mood: 'tired',
    },
    {
      id: 'checkin-2',
      checkInTime: new Date(Date.now() - 86400000).toISOString(),
      complaint: null,
      aiResponse: '又苟过一天，不错',
      mood: 'neutral',
    },
  ]
  
  return c.json({
    success: true,
    history,
    total: history.length,
  })
})

// 获取今日签到状态
checkin.get('/today', async (c) => {
  const userId = c.req.query('userId')
  
  // TODO: 检查今天是否已签到
  return c.json({
    checkedIn: false,
    lastCheckIn: null,
  })
})

// 生成毒舌回复
function generateRoast(complaint: string): string {
  const lowercased = complaint.toLowerCase()
  
  // 关键词匹配
  if (lowercased.includes('加班') || lowercased.includes('overtime')) {
    return '又加班？你这是打工还是卖身？加班费呢？没有？那你加个屁！去Boss直聘逛逛，换换心情吧。'
  }
  
  if (lowercased.includes('领导') || lowercased.includes('老板') || lowercased.includes('boss')) {
    return '你领导是不是脑子有坑？这种傻逼领导全国多了去了，你不走他走不了，懂？建议录音，以后仲裁用得上。'
  }
  
  if (lowercased.includes('工资') || lowercased.includes('钱') || lowercased.includes('salary')) {
    return '就这点钱你还干？我真服了你这种老实人。穷是暂时的，被压榨是持久的。跳啊，怂什么？'
  }
  
  if (lowercased.includes('同事') || lowercased.includes('colleague')) {
    return '职场没有朋友，只有利益。让他去死，你继续苟着，熬到比他先跑路。清醒点！'
  }
  
  if (lowercased.includes('累') || lowercased.includes('困') || lowercased.includes('tired')) {
    return '累就对了，不累怎么叫打工？建议今晚早睡，明天继续被操。保重身体，别猝死了。'
  }
  
  if (lowercased.includes('开会') || lowercased.includes('会议') || lowercased.includes('meeting')) {
    return '又开会？形式主义害死人啊。建议带个耳机假装在听，实际刷刷招聘APP，换个好心情。'
  }
  
  if (lowercased.includes('需求') || lowercased.includes('requirement')) {
    return '需求又改了？产品经理脑子是不是有坑？建议把锅甩回去，反正大家都在甩。'
  }
  
  if (lowercased.includes('傻逼') || lowercased.includes('sb')) {
    return '骂得好！但骂完了还得干活，这就是打工人的悲哀。不过骂出来比憋着强，继续骂！'
  }
  
  // 通用回复
  const generalResponses = [
    '就这？我听过比这惨十倍的。你这算什么，继续苟着吧。',
    '行吧，骂完了？骂完继续打工，明天还得上班呢傻逼。',
    '这种狗屎班你还上？去Boss直聘逛逛，换换心情吧。',
    '恭喜你没猝死，这就是你今天最大的成就。',
    '又活过一天，明天继续被操。睡吧傻逼。',
    '你这工作，我看狗都不干。但你还得干，因为房租要交。',
    '你倒是挺能忍的，不愧是社畜界的卷王！',
    '听完你的抱怨，我觉得我的工作还行。谢谢你让我感觉好点了！',
  ]
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)]
}

// 随机签到回复
function getRandomCheckInResponse(hour: number): string {
  if (hour >= 23 || hour < 6) {
    return '这么晚才下班？你是不是傻？公司给你发老婆了吗？赶紧睡觉去！'
  }
  
  if (hour >= 21) {
    return '9点多了还在加班？你这是打工还是住公司？明天见（如果还活着的话）'
  }
  
  if (hour >= 19) {
    return '晚上7点多下班，还行，比我认识的大多数牛马强点。今天辛苦了！'
  }
  
  if (hour >= 18) {
    return '6点多下班？不错啊，今天摸鱼成功了吧？回家好好休息，明天继续战斗！'
  }
  
  const responses = [
    '行，今天又没死，恭喜你👏',
    '又苟过一天，明天继续！',
    '没抱怨？装什么坚强呢？',
    '沉默的牛马，是最可怕的牛马。',
    '不说话是吧？憋着等着猝死？',
    '恭喜存活+1天，距离财务自由还有∞天',
    '签到成功！又活了一天，不容易啊！',
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

export default checkin

