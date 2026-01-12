/**
 * 抱怨路由
 * 
 * 全国牛马抱怨墙
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const complaints = new Hono()

// 创建抱怨Schema
const complaintSchema = z.object({
  userId: z.string(),
  content: z.string().min(1, '抱怨内容不能为空').max(500, '最多500字，骂人也要精炼'),
  category: z.enum(['overtime', 'boss', 'colleague', 'salary', 'meeting', 'general']).default('general'),
  isAnonymous: z.boolean().default(true),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
})

// 获取抱怨列表
complaints.get('/', async (c) => {
  const city = c.req.query('city')
  const category = c.req.query('category')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')
  
  // TODO: 从数据库获取
  const mockComplaints = generateMockComplaints(limit, city)
  
  return c.json({
    success: true,
    complaints: mockComplaints,
    total: 1000,
    limit,
    offset,
  })
})

// 发布抱怨
complaints.post('/', zValidator('json', complaintSchema), async (c) => {
  const data = c.req.valid('json')
  
  // 生成AI回复
  const aiResponse = generateRoastForComplaint(data.content, data.category)
  
  // TODO: 保存到数据库
  const complaint = {
    id: 'complaint-' + Date.now(),
    ...data,
    aiResponse,
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
  }
  
  return c.json({
    success: true,
    message: '骂完了？心情好点了吧',
    complaint,
  })
})

// 点赞抱怨
complaints.post('/:id/like', async (c) => {
  const id = c.req.param('id')
  
  // TODO: 更新数据库
  
  return c.json({
    success: true,
    message: '认同！',
    likes: Math.floor(Math.random() * 500) + 1,
  })
})

// 取消点赞
complaints.delete('/:id/like', async (c) => {
  const id = c.req.param('id')
  
  return c.json({
    success: true,
    message: '收回点赞',
  })
})

// 获取抱怨详情
complaints.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  // TODO: 从数据库获取
  const complaint = {
    id,
    userId: 'user-123',
    userEmoji: '🐂',
    content: '今天领导又让加班了，还说是自愿的，我自愿你妈',
    aiResponse: '你领导是不是脑子有坑？建议录音，以后仲裁用得上。',
    category: 'boss',
    city: '北京',
    district: '海淀区',
    likes: 234,
    comments: 45,
    createdAt: new Date().toISOString(),
  }
  
  return c.json({
    success: true,
    complaint,
  })
})

// 热门抱怨
complaints.get('/hot/list', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10')
  
  const hotComplaints = generateMockComplaints(limit).sort((a, b) => b.likes - a.likes)
  
  return c.json({
    success: true,
    complaints: hotComplaints,
  })
})

// 生成Mock数据
function generateMockComplaints(count: number, city?: string) {
  const contents = [
    '领导说开个快会，结果开了3个小时',
    '需求又改了，产品经理脑子是不是有坑',
    '加班到10点，加班费一分没有',
    '同事把锅甩给我，我真是服了',
    '工资拖了半个月还没发，要饿死了',
    '早上9点开会开到下午6点，啥活没干',
    '老板画的饼我都能开面包店了',
    '通勤2小时，上班8小时，加班4小时，这是人过的日子？',
    '周五晚上10点来需求，周一早上要，杀人不犯法吗',
    '试用期6个月，说好的转正又延了',
    '代码review被喷成狗，老子不干了',
    '空调坏了一周了，热死我了',
    '食堂的饭难吃到怀疑人生',
    '隔壁工位天天打电话，烦死了',
    '电脑又卡了，配置是10年前的吧',
  ]
  
  const cities = city ? [city] : ['北京', '上海', '深圳', '广州', '杭州', '成都', '南京', '武汉']
  const districts = ['海淀区', '朝阳区', '浦东新区', '南山区', '西湖区', '武侯区', '玄武区', '江汉区']
  const emojis = ['🐂', '🐴', '🐕', '🐷', '🦊', '🐱', '🐰', '🐻']
  const categories = ['overtime', 'boss', 'colleague', 'salary', 'meeting', 'general'] as const
  
  return Array.from({ length: count }, (_, i) => ({
    id: `complaint-${Date.now()}-${i}`,
    userId: `user-${Math.random().toString(36).substr(2, 9)}`,
    userEmoji: emojis[Math.floor(Math.random() * emojis.length)],
    userNickname: ['匿名牛马', '加班狗', '社畜一号', '韭菜本菜', '打工人'][Math.floor(Math.random() * 5)],
    content: contents[Math.floor(Math.random() * contents.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    city: cities[Math.floor(Math.random() * cities.length)],
    district: districts[Math.floor(Math.random() * districts.length)],
    likes: Math.floor(Math.random() * 500),
    comments: Math.floor(Math.random() * 50),
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    isAnonymous: true,
  }))
}

// AI毒舌回复
function generateRoastForComplaint(content: string, category: string): string {
  const categoryResponses: Record<string, string[]> = {
    overtime: [
      '加班？你这是打工还是卖身？加班费呢？没有？那你加个屁！',
      '又加班？公司给你发老婆了吗？没有就别这么拼命。',
      '加班到这么晚，你领导知道你这么努力吗？知道也不会给你加钱的。',
    ],
    boss: [
      '你领导是不是脑子有坑？建议录音，以后仲裁用得上。',
      '这种傻逼领导全国多了去了，你不走他走不了，懂？',
      '老板画饼？记住：只有傻子才信老板的话。清醒点！',
    ],
    colleague: [
      '职场没有朋友，只有利益。让他去死，你继续苟着。',
      '同事甩锅？学会反甩啊！职场生存第一课。',
      '被同事坑了？记住这笔账，以后有机会坑回去。',
    ],
    salary: [
      '就这点钱你还干？我真服了你这种老实人。',
      '穷是暂时的，被压榨是持久的。跳啊，怂什么？',
      '工资不发？劳动仲裁了解一下，免费的。',
    ],
    meeting: [
      '又开会？形式主义害死人啊。建议带个耳机假装在听。',
      '开会3小时，有用的话3分钟都不到。',
      '建议会议的时候摸鱼刷刷招聘APP，换个好心情。',
    ],
    general: [
      '就这？我听过比这惨十倍的。你这算什么，继续苟着吧。',
      '行吧，骂完了？骂完继续打工，明天还得上班呢。',
      '你倒是挺能忍的，不愧是社畜界的卷王！',
    ],
  }
  
  const responses = categoryResponses[category] || categoryResponses.general
  return responses[Math.floor(Math.random() * responses.length)]
}

export default complaints

