/**
 * AI路由
 * 
 * 毒舌张的AI回复系统
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import OpenAI from 'openai'

const ai = new Hono()

// OpenAI客户端 (可选)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// 毒舌请求Schema
const roastSchema = z.object({
  content: z.string().min(1).max(500),
  category: z.enum(['overtime', 'boss', 'colleague', 'salary', 'meeting', 'general']).optional(),
  userId: z.string().optional(),
})

// 系统提示词 - 毒舌张人设
const SYSTEM_PROMPT = `你是"毒舌张"，一个毒舌但暖心的AI助手，专门为打工人提供情绪发泄出口。

你的性格：
1. 说话直接、不留情面，但底层是关心用户
2. 擅长用夸张的方式吐槽，让用户破防又开心
3. 经常推荐用户去看看招聘网站（Boss直聘、猎聘等），换换心情
4. 偶尔会说出一些扎心但有道理的话

你的回复风格：
- 长度：50-100字左右
- 语气：毒舌、直接、带点脏话（但不过分）
- 结尾：通常会给一个建议或者鼓励（毒舌版）

禁止：
- 说太多安慰的话
- 太温柔或正经
- 超过150字

示例：
用户：今天又加班到10点
回复：这种狗屎班你还上？加班费呢？没有？那你加个屁！建议明天上班先刷刷Boss直聘，给自己留条后路。记住：没有加班费的加班就是慢性自杀。`

// 生成毒舌回复
ai.post('/roast', zValidator('json', roastSchema), async (c) => {
  const { content, category } = c.req.valid('json')
  
  let aiResponse: string
  
  // 如果配置了OpenAI，使用AI生成
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `用户抱怨：${content}\n分类：${category || '其他'}\n请用毒舌张的风格回复：` }
        ],
        max_tokens: 200,
        temperature: 0.9,
      })
      
      aiResponse = completion.choices[0]?.message?.content || generateLocalRoast(content, category)
    } catch (error) {
      console.error('OpenAI调用失败:', error)
      aiResponse = generateLocalRoast(content, category)
    }
  } else {
    // 使用本地生成
    aiResponse = generateLocalRoast(content, category)
  }
  
  return c.json({
    success: true,
    roast: aiResponse,
    character: '毒舌张',
  })
})

// 生成随机签到回复
ai.get('/checkin-response', async (c) => {
  const hour = new Date().getHours()
  const response = generateCheckInResponse(hour)
  
  return c.json({
    success: true,
    response,
    hour,
  })
})

// 生成锦旗文案
ai.post('/banner-text', async (c) => {
  const { survivalDays, complaint } = await c.req.json()
  
  let bannerText = ''
  
  if (survivalDays <= 7) {
    bannerText = '新鲜韭菜，慢慢被割吧'
  } else if (survivalDays <= 30) {
    bannerText = '一个月了，开始麻木了吧？'
  } else if (survivalDays <= 90) {
    bannerText = '三个月老油条，摸鱼技能满级'
  } else if (survivalDays <= 180) {
    bannerText = '半年了，你怎么还没跑路？'
  } else if (survivalDays <= 365) {
    bannerText = '一年了！你是钢铁打工人！'
  } else {
    bannerText = '超过一年？你是传说中的不死老兵！'
  }
  
  return c.json({
    success: true,
    bannerText,
    survivalDays,
    encouragement: getEncouragement(survivalDays),
  })
})

// 本地毒舌生成（不使用OpenAI时）
function generateLocalRoast(content: string, category?: string): string {
  const lowercased = content.toLowerCase()
  
  // 关键词匹配
  if (lowercased.includes('加班') || lowercased.includes('overtime') || category === 'overtime') {
    const responses = [
      '又加班？你这是打工还是卖身？加班费呢？没有？那你加个屁！去Boss直聘逛逛，换换心情吧。',
      '加班到这么晚，公司给你发老婆了吗？没有就别这么拼命。保重身体，别猝死了。',
      '这种狗屎班你还上？建议明天上班先刷刷招聘APP，给自己留条后路。',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  if (lowercased.includes('领导') || lowercased.includes('老板') || category === 'boss') {
    const responses = [
      '你领导是不是脑子有坑？建议录音，以后仲裁用得上。这种傻逼全国多了去了。',
      '老板画的饼你也信？记住：只有傻子才信老板的话。清醒点！',
      '这种傻逼领导，你不走他走不了。建议存够钱就跑路，别犹豫。',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  if (lowercased.includes('工资') || lowercased.includes('钱') || category === 'salary') {
    const responses = [
      '就这点钱你还干？我真服了你这种老实人。穷是暂时的，被压榨是持久的。',
      '工资不发？劳动仲裁了解一下，免费的。别当软柿子！',
      '跳啊，怂什么？现在行情不好？不好也比被压榨强！',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  if (lowercased.includes('同事') || category === 'colleague') {
    const responses = [
      '职场没有朋友，只有利益。让他去死，你继续苟着，熬到比他先跑路。',
      '被同事坑了？学会反甩啊！职场生存第一课：别当老实人。',
      '同事甩锅？记住这笔账。职场就是宫斗剧，学会保护自己。',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  if (lowercased.includes('开会') || lowercased.includes('会议') || category === 'meeting') {
    const responses = [
      '又开会？形式主义害死人啊。建议带个耳机假装在听，实际刷刷招聘APP。',
      '开会3小时，有用的话3分钟都不到。这就是大公司病，习惯就好。',
      '建议会议的时候摸鱼，反正听了也没用。时间是自己的！',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  // 通用回复
  const generalResponses = [
    '就这？我听过比这惨十倍的。你这算什么，继续苟着吧。',
    '行吧，骂完了？骂完继续打工，明天还得上班呢傻逼。',
    '你倒是挺能忍的，不愧是社畜界的卷王！',
    '这种狗屎班你还上？去Boss直聘逛逛，换换心情吧。',
    '恭喜你没猝死，这就是你今天最大的成就。',
    '又活过一天，明天继续被操。睡吧傻逼。',
    '你这工作，我看狗都不干。但你还得干，因为房租要交。',
    '听完你的抱怨，我觉得我的工作还行。谢谢你让我感觉好点了！',
  ]
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)]
}

// 签到回复
function generateCheckInResponse(hour: number): string {
  if (hour >= 23 || hour < 6) {
    return '这么晚才下班？你是不是傻？公司给你发老婆了吗？赶紧睡觉去！明天见（如果还活着的话）'
  }
  
  if (hour >= 21) {
    return '9点多了还在加班？你这是打工还是住公司？保重身体啊牛马！'
  }
  
  if (hour >= 19) {
    return '晚上7点多下班，还行，比我认识的大多数牛马强点。今天辛苦了！回家好好休息。'
  }
  
  if (hour >= 18) {
    return '6点多下班？不错啊，今天摸鱼成功了吧？回家好好休息，明天继续战斗！'
  }
  
  if (hour >= 12) {
    return '这么早下班？是被开除了还是请假了？不管怎样，恭喜你今天自由了！'
  }
  
  return '签到成功！又活了一天，距离财务自由还有∞天。继续苟着吧！'
}

// 鼓励语
function getEncouragement(survivalDays: number): string {
  if (survivalDays <= 7) {
    return '刚入职场？慢慢来，被割的日子还长着呢'
  }
  if (survivalDays <= 30) {
    return '坚持了一个月，麻木感正在形成，这是好事'
  }
  if (survivalDays <= 90) {
    return '三个月了，你已经是资深社畜了'
  }
  if (survivalDays <= 180) {
    return '半年了，钢铁意志！任何加班都打不倒你'
  }
  if (survivalDays <= 365) {
    return '快一年了，你是不死老兵，职场的活化石'
  }
  return '超过一年？你是传说中的存在，牛马界的神话！'
}

export default ai

