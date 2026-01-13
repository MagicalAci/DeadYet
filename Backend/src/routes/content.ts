/**
 * AI 内容生成路由
 * 用于批量生成抱怨内容
 */

import { Hono } from 'hono'
import { db, complaints, contentTemplates, type NewComplaint } from '../db/index.js'
import { eq, sql, desc } from 'drizzle-orm'

const content = new Hono()

// 随机昵称
const nicknames = [
  '匿名牛马', '加班狗', '社畜一号', '韭菜本菜', '打工人',
  '苦逼程序员', 'PPT战士', 'Excel大师', '会议室常客', '卑微打工仔',
  '摸鱼专家', '带薪拉屎', '划水达人', '职场老油条', '牛马本马',
  '搬砖侠', '码农日记', '社畜日常', '打工魂', '干饭人'
]

// 随机 Emoji
const emojis = ['🐂', '🐴', '🐕', '🐷', '🦊', '🐱', '🐰', '🐻', '🐼', '🦁', '🐯', '🐸']

// 城市配置
const cityConfigs = [
  { name: '北京', lat: 39.9042, lon: 116.4074 },
  { name: '上海', lat: 31.2304, lon: 121.4737 },
  { name: '深圳', lat: 22.5431, lon: 114.0579 },
  { name: '广州', lat: 23.1291, lon: 113.2644 },
  { name: '杭州', lat: 30.2741, lon: 120.1551 },
  { name: '成都', lat: 30.5728, lon: 104.0668 },
  { name: '南京', lat: 32.0603, lon: 118.7969 },
  { name: '武汉', lat: 30.5928, lon: 114.3055 },
]

// 区级配置
const districtConfigs: Record<string, string[]> = {
  '北京': ['海淀区', '朝阳区', '西城区', '东城区', '丰台区'],
  '上海': ['浦东新区', '黄浦区', '徐汇区', '静安区', '长宁区'],
  '深圳': ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'],
  '广州': ['天河区', '越秀区', '海珠区', '白云区', '番禺区'],
  '杭州': ['西湖区', '滨江区', '余杭区', '拱墅区', '上城区'],
  '成都': ['武侯区', '锦江区', '青羊区', '金牛区', '成华区'],
}

// 抱怨模板
const complaintTemplates = [
  // 加班类
  { content: '领导说开个快会，结果开了3个小时，我人都麻了', category: '加班', mood: 'numb' },
  { content: '加班到10点，加班费一分没有，爱谁谁吧', category: '加班', mood: 'angry' },
  { content: '周五晚上10点来需求，周一早上要，这是人能干的事？', category: '加班', mood: 'angry' },
  { content: '通勤2小时，上班8小时，加班4小时，睡觉6小时', category: '加班', mood: 'tired' },
  { content: '又是凌晨12点下班的一天，出租车司机都认识我了', category: '加班', mood: 'tired' },
  { content: '连续加班两周，周末还要加班，我是不是应该住公司', category: '加班', mood: 'numb' },
  { content: '说好的弹性工作制，结果只弹不缩，永远加班', category: '加班', mood: 'angry' },
  { content: '9点开始改需求，改到凌晨2点，产品说这个版本不上了', category: '加班', mood: 'angry' },
  { content: '今天又是最后一个走的，卷王本卷在此', category: '加班', mood: 'numb' },
  { content: '老板说忙完这阵就好了，我听这话听了三年了', category: '加班', mood: 'numb' },
  
  // 领导类
  { content: '老板画的饼我都能开面包店了', category: '领导', mood: 'numb' },
  { content: '领导开会只会说大家要努力，你倒是给我涨工资啊', category: '领导', mood: 'angry' },
  { content: '领导说年底双薪，现在说资金紧张', category: '领导', mood: 'angry' },
  { content: '领导永远都是对的，错的都是我们', category: '领导', mood: 'numb' },
  { content: '我们领导最大的本事就是把功劳据为己有', category: '领导', mood: 'angry' },
  { content: '领导说以后周六不强制加班了，改成自愿加班，你懂的', category: '领导', mood: 'numb' },
  { content: '开完会领导说：就这么定了。然后明天又改', category: '领导', mood: 'tired' },
  { content: '领导说你年轻不要计较太多，我说那你老了咋还计较这么多', category: '领导', mood: 'angry' },
  { content: '领导微信发消息从来不说事，就发在吗，搞得我心脏病都快犯了', category: '领导', mood: 'tired' },
  
  // 同事类
  { content: '同事把锅甩给我，我真是服了这帮孙子', category: '同事', mood: 'angry' },
  { content: '旁边同事每天吃螺蛳粉，我快窒息了', category: '同事', mood: 'numb' },
  { content: '新来的同事工资比我高，我干了三年了', category: '同事', mood: 'angry' },
  { content: '同事开会疯狂表现，私下啥也不干', category: '同事', mood: 'angry' },
  { content: '隔壁工位键盘敲得震天响，是在用脚打字吗', category: '同事', mood: 'tired' },
  { content: '同事总爱问我怎么做，我又不是你爹', category: '同事', mood: 'angry' },
  
  // 工资类
  { content: '工资拖了半个月还没发，要饿死了', category: '工资', mood: 'angry' },
  { content: '说好的涨薪，结果涨了200块，打发叫花子呢', category: '工资', mood: 'angry' },
  { content: '招聘写的15-25k，进来才知道是15k', category: '工资', mood: 'angry' },
  { content: '年终奖发了500块，老板说是心意，我的心意是想骂人', category: '工资', mood: 'angry' },
  { content: '房租5000，工资8000，还要吃饭通勤，请问怎么存钱', category: '工资', mood: 'tired' },
  
  // 开会类
  { content: '早上9点开会开到下午6点，啥活没干', category: '开会', mood: 'tired' },
  { content: '每天开会开会开会，工作都是加班干的', category: '开会', mood: 'tired' },
  { content: '开会能不能说点有用的，别光读PPT啊', category: '开会', mood: 'numb' },
  { content: '站会站了一小时，站会！一小时！', category: '开会', mood: 'angry' },
  { content: '会上讨论半天，最后决定下次再议', category: '开会', mood: 'numb' },
  
  // 其他
  { content: '需求又改了，产品经理脑子是不是有坑', category: '其他', mood: 'angry' },
  { content: '产品说这个需求很简单，就改一下，改了三天', category: '其他', mood: 'tired' },
  { content: '公司空调永远26度，冬天冷死夏天热死', category: '其他', mood: 'tired' },
  { content: 'WiFi又断了，年费几十万的网络就这？', category: '其他', mood: 'angry' },
  { content: '代码跑不通，原来是少了个分号', category: '其他', mood: 'tired' },
  { content: 'Bug改完又出Bug，薛定谔的Bug', category: '其他', mood: 'numb' },
  { content: '提的需求被砍了，上周加班白加了', category: '其他', mood: 'tired' },
  { content: '电脑卡死了三次，重启了五次，今天的工作效率为负', category: '其他', mood: 'tired' },
]

// 语音抱怨时长模板
const voiceTemplates = [
  { category: '加班', duration: 5 },
  { category: '加班', duration: 8 },
  { category: '加班', duration: 12 },
  { category: '领导', duration: 7 },
  { category: '领导', duration: 10 },
  { category: '同事', duration: 6 },
  { category: '工资', duration: 5 },
  { category: '开会', duration: 8 },
  { category: '其他', duration: 4 },
]

// 生成抱怨
content.post('/generate', async (c) => {
  try {
    const { count = 10, type = 'text', city } = await c.req.json()
    
    const generated: NewComplaint[] = []
    const targetCity = city || cityConfigs[Math.floor(Math.random() * cityConfigs.length)]
    const cityConfig = typeof targetCity === 'string' 
      ? cityConfigs.find(c => c.name === targetCity) || cityConfigs[0]
      : targetCity
    
    for (let i = 0; i < count; i++) {
      const districts = districtConfigs[cityConfig.name] || ['市中心']
      const district = districts[Math.floor(Math.random() * districts.length)]
      
      if (type === 'voice') {
        // 生成语音抱怨
        const voiceTemplate = voiceTemplates[Math.floor(Math.random() * voiceTemplates.length)]
        
        generated.push({
          userId: '00000000-0000-0000-0000-000000000000', // 系统用户
          contentType: 'voice',
          voiceUrl: `https://storage.deadyet.app/voices/${Date.now()}_${i}.m4a`,
          voiceDuration: voiceTemplate.duration + Math.floor(Math.random() * 5),
          category: voiceTemplate.category,
          userNickname: nicknames[Math.floor(Math.random() * nicknames.length)],
          userEmoji: emojis[Math.floor(Math.random() * emojis.length)],
          city: cityConfig.name,
          district,
          latitude: cityConfig.lat + (Math.random() - 0.5) * 0.1,
          longitude: cityConfig.lon + (Math.random() - 0.5) * 0.1,
          isAiGenerated: true,
          isAnonymous: true,
          likesCount: Math.floor(Math.random() * 3000),
          commentsCount: Math.floor(Math.random() * 200),
        })
      } else {
        // 生成文字抱怨
        const template = complaintTemplates[Math.floor(Math.random() * complaintTemplates.length)]
        
        generated.push({
          userId: '00000000-0000-0000-0000-000000000000',
          contentType: 'text',
          content: template.content,
          category: template.category,
          userNickname: nicknames[Math.floor(Math.random() * nicknames.length)],
          userEmoji: emojis[Math.floor(Math.random() * emojis.length)],
          city: cityConfig.name,
          district,
          latitude: cityConfig.lat + (Math.random() - 0.5) * 0.1,
          longitude: cityConfig.lon + (Math.random() - 0.5) * 0.1,
          isAiGenerated: true,
          isAnonymous: true,
          likesCount: Math.floor(Math.random() * 5000),
          commentsCount: Math.floor(Math.random() * 500),
        })
      }
    }
    
    // 插入数据库
    const inserted = await db.insert(complaints).values(generated).returning()
    
    return c.json({
      success: true,
      message: `成功生成 ${inserted.length} 条${type === 'voice' ? '语音' : '文字'}抱怨`,
      count: inserted.length,
      city: cityConfig.name,
    })
    
  } catch (error) {
    console.error('生成抱怨失败:', error)
    return c.json({
      success: false,
      error: '生成失败',
      message: (error as Error).message,
    }, 500)
  }
})

// 批量为所有城市生成内容
content.post('/generate-all', async (c) => {
  try {
    const { textCount = 5, voiceCount = 2 } = await c.req.json()
    
    let totalGenerated = 0
    
    for (const city of cityConfigs) {
      // 生成文字抱怨
      for (let i = 0; i < textCount; i++) {
        const template = complaintTemplates[Math.floor(Math.random() * complaintTemplates.length)]
        const districts = districtConfigs[city.name] || ['市中心']
        const district = districts[Math.floor(Math.random() * districts.length)]
        
        await db.insert(complaints).values({
          userId: '00000000-0000-0000-0000-000000000000',
          contentType: 'text',
          content: template.content,
          category: template.category,
          userNickname: nicknames[Math.floor(Math.random() * nicknames.length)],
          userEmoji: emojis[Math.floor(Math.random() * emojis.length)],
          city: city.name,
          district,
          latitude: city.lat + (Math.random() - 0.5) * 0.1,
          longitude: city.lon + (Math.random() - 0.5) * 0.1,
          isAiGenerated: true,
          isAnonymous: true,
          likesCount: Math.floor(Math.random() * 5000),
          commentsCount: Math.floor(Math.random() * 500),
        })
        totalGenerated++
      }
      
      // 生成语音抱怨
      for (let i = 0; i < voiceCount; i++) {
        const voiceTemplate = voiceTemplates[Math.floor(Math.random() * voiceTemplates.length)]
        const districts = districtConfigs[city.name] || ['市中心']
        const district = districts[Math.floor(Math.random() * districts.length)]
        
        await db.insert(complaints).values({
          userId: '00000000-0000-0000-0000-000000000000',
          contentType: 'voice',
          voiceUrl: `https://storage.deadyet.app/voices/${Date.now()}_${i}.m4a`,
          voiceDuration: voiceTemplate.duration + Math.floor(Math.random() * 5),
          category: voiceTemplate.category,
          userNickname: nicknames[Math.floor(Math.random() * nicknames.length)],
          userEmoji: emojis[Math.floor(Math.random() * emojis.length)],
          city: city.name,
          district,
          latitude: city.lat + (Math.random() - 0.5) * 0.1,
          longitude: city.lon + (Math.random() - 0.5) * 0.1,
          isAiGenerated: true,
          isAnonymous: true,
          likesCount: Math.floor(Math.random() * 3000),
          commentsCount: Math.floor(Math.random() * 200),
        })
        totalGenerated++
      }
    }
    
    return c.json({
      success: true,
      message: `成功为 ${cityConfigs.length} 个城市生成 ${totalGenerated} 条抱怨`,
      cities: cityConfigs.length,
      totalGenerated,
    })
    
  } catch (error) {
    console.error('批量生成失败:', error)
    return c.json({
      success: false,
      error: '批量生成失败',
    }, 500)
  }
})

// 获取统计
content.get('/stats', async (c) => {
  try {
    const [{ count: totalComplaints }] = await db.select({ count: sql<number>`count(*)` }).from(complaints)
    
    const [{ count: textCount }] = await db.select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(eq(complaints.contentType, 'text'))
    
    const [{ count: voiceCount }] = await db.select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(eq(complaints.contentType, 'voice'))
    
    const [{ count: aiGenerated }] = await db.select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(eq(complaints.isAiGenerated, true))
    
    return c.json({
      success: true,
      stats: {
        totalComplaints: Number(totalComplaints),
        textComplaints: Number(textCount),
        voiceComplaints: Number(voiceCount),
        aiGenerated: Number(aiGenerated),
        userGenerated: Number(totalComplaints) - Number(aiGenerated),
      },
    })
    
  } catch (error) {
    console.error('获取统计失败:', error)
    return c.json({
      success: false,
      error: '获取统计失败',
    }, 500)
  }
})

// 获取模板列表
content.get('/templates', async (c) => {
  return c.json({
    success: true,
    templates: complaintTemplates,
    voiceTemplates,
    categories: ['加班', '领导', '同事', '工资', '开会', '其他'],
  })
})

export default content
