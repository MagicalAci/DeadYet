/**
 * 推送路由
 * 
 * 战况推送系统
 */

import { Hono } from 'hono'
import { Resend } from 'resend'

const push = new Hono()

// Resend邮件服务 (可选)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// 主要城市
const MAJOR_CITIES = [
  '北京', '上海', '深圳', '广州', '杭州', '成都',
  '南京', '武汉', '西安', '苏州', '重庆', '天津'
]

// 获取当前推送状态
push.get('/status', async (c) => {
  const now = new Date()
  const hour = now.getHours()
  
  let pushFrequency = '每小时'
  let nextPush = '下一个整点'
  let urgencyLevel = 'normal'
  
  if (hour >= 23 || hour < 6) {
    pushFrequency = '每15分钟'
    urgencyLevel = 'critical'
    nextPush = '15分钟内'
  } else if (hour >= 21) {
    pushFrequency = '每30分钟'
    urgencyLevel = 'urgent'
    nextPush = '30分钟内'
  } else if (hour >= 18) {
    pushFrequency = '每小时'
    urgencyLevel = 'normal'
    nextPush = '下一个整点'
  } else {
    pushFrequency = '不推送（还没到下班时间）'
    urgencyLevel = 'none'
    nextPush = '18:00后开始'
  }
  
  return c.json({
    success: true,
    currentTime: now.toISOString(),
    hour,
    pushFrequency,
    nextPush,
    urgencyLevel,
    description: getUrgencyDescription(urgencyLevel),
  })
})

// 生成战况报告
push.get('/battle-report', async (c) => {
  const now = new Date()
  const hour = now.getHours()
  
  // 根据时间计算下班率
  let baseCheckInRate = 0.3
  if (hour >= 18) baseCheckInRate = 0.4
  if (hour >= 19) baseCheckInRate = 0.55
  if (hour >= 20) baseCheckInRate = 0.7
  if (hour >= 21) baseCheckInRate = 0.8
  if (hour >= 22) baseCheckInRate = 0.9
  if (hour >= 23) baseCheckInRate = 0.95
  
  // 生成城市数据
  const cityStats = MAJOR_CITIES.map(city => {
    const total = Math.floor(Math.random() * 40000) + 10000
    const checkInRate = baseCheckInRate + (Math.random() * 0.15 - 0.075)
    const checkedIn = Math.floor(total * checkInRate)
    
    return {
      city,
      totalWorkers: total,
      checkedIn,
      stillWorking: total - checkedIn,
      checkInRate: Math.round(checkInRate * 100),
    }
  })
  
  // 总计
  const totalNationwide = cityStats.reduce((sum, city) => sum + city.totalWorkers, 0)
  const checkedInNationwide = cityStats.reduce((sum, city) => sum + city.checkedIn, 0)
  const stillWorkingNationwide = totalNationwide - checkedInNationwide
  
  // 生成报告文案
  const report = generateBattleReport(hour, checkedInNationwide, stillWorkingNationwide, cityStats)
  
  return c.json({
    success: true,
    timestamp: now.toISOString(),
    hour,
    urgencyLevel: getUrgencyLevel(hour),
    summary: {
      totalNationwide,
      checkedInNationwide,
      stillWorkingNationwide,
      overallCheckInRate: Math.round((checkedInNationwide / totalNationwide) * 100),
    },
    topCities: cityStats.slice(0, 5),
    report,
    pushTitle: report.title,
    pushBody: report.body,
  })
})

// 发送邮件报告
push.post('/email-report', async (c) => {
  const { email, type } = await c.req.json()
  
  if (!resend) {
    return c.json({
      success: false,
      error: '邮件服务未配置',
      message: '请设置 RESEND_API_KEY 环境变量',
    }, 500)
  }
  
  try {
    // 生成报告内容
    const report = generateEmailReport(type)
    
    await resend.emails.send({
      from: 'DeadYet <noreply@deadyet.app>',
      to: email,
      subject: report.subject,
      html: report.html,
    })
    
    return c.json({
      success: true,
      message: '邮件已发送',
    })
  } catch (error) {
    console.error('发送邮件失败:', error)
    return c.json({
      success: false,
      error: '发送失败',
    }, 500)
  }
})

// 注册设备Token（用于APNs推送）
push.post('/register-device', async (c) => {
  const { userId, deviceToken } = await c.req.json()
  
  // TODO: 保存到数据库
  
  return c.json({
    success: true,
    message: '设备已注册，准备接收推送',
  })
})

// 推送设置
push.put('/settings', async (c) => {
  const { userId, enabled, frequency } = await c.req.json()
  
  // TODO: 更新用户推送设置
  
  return c.json({
    success: true,
    message: enabled ? '推送已开启' : '推送已关闭',
  })
})

// 辅助函数
function getUrgencyLevel(hour: number): 'none' | 'normal' | 'urgent' | 'critical' {
  if (hour < 18) return 'none'
  if (hour >= 23 || hour < 6) return 'critical'
  if (hour >= 21) return 'urgent'
  return 'normal'
}

function getUrgencyDescription(level: string): string {
  switch (level) {
    case 'critical':
      return '🚨 深夜档：每15分钟推送一次，紧急催促还没下班的牛马'
    case 'urgent':
      return '⚠️ 紧急档：每30分钟推送一次，9点后还没走的需要重点关注'
    case 'normal':
      return '📊 常规档：每小时推送一次战况总结'
    default:
      return '⏰ 等待中：18:00后开始推送'
  }
}

function generateBattleReport(
  hour: number,
  checkedIn: number,
  stillWorking: number,
  cityStats: Array<{ city: string; checkedIn: number; stillWorking: number; checkInRate: number }>
) {
  const topCity = cityStats.sort((a, b) => b.checkInRate - a.checkInRate)[0]
  const worstCity = cityStats.sort((a, b) => a.checkInRate - b.checkInRate)[0]
  
  let emoji = '📊'
  let tone = 'normal'
  
  if (hour >= 23 || hour < 6) {
    emoji = '🚨'
    tone = 'critical'
  } else if (hour >= 21) {
    emoji = '⚠️'
    tone = 'urgent'
  } else if (hour >= 18) {
    emoji = '🎉'
    tone = 'normal'
  }
  
  const titles: Record<string, string[]> = {
    normal: [
      `${emoji} ${hour}点战报：全国已有 ${formatNumber(checkedIn)} 名牛马成功撤离！`,
      `${emoji} 战况播报：${topCity.city}下班率${topCity.checkInRate}%领跑全国！`,
      `${emoji} ${hour}点整：${formatNumber(stillWorking)} 人还在挣扎中`,
    ],
    urgent: [
      `${emoji} 警告：${formatNumber(stillWorking)} 名可怜人还没下班！`,
      `${emoji} 9点战报：${worstCity.city}仅${worstCity.checkInRate}%下班，卷王之城！`,
      `${emoji} 紧急：你的同行们都回家了，你还在吗？`,
    ],
    critical: [
      `${emoji} 深夜档：还有 ${formatNumber(stillWorking)} 个可怜人在加班`,
      `${emoji} 午夜特报：还在加班？你不要命了？`,
      `${emoji} ${hour}点了！公司给你发老婆了吗？`,
    ],
  }
  
  const bodies: Record<string, string[]> = {
    normal: [
      `目前全国下班率 ${Math.round(checkedIn / (checkedIn + stillWorking) * 100)}%，${topCity.city}表现最佳。你下班了吗？`,
      `${worstCity.city}还有${formatNumber(worstCity.stillWorking)}人在苦海挣扎，辛苦了兄弟们！`,
      `记得按时下班，公司不会因为你加班就给你发工资的`,
    ],
    urgent: [
      `9点多了还没走？保重身体啊牛马！明天见（如果还活着的话）`,
      `建议刷刷Boss直聘，给自己留条后路`,
      `加班没有加班费=慢性自杀，清醒点！`,
    ],
    critical: [
      `这么晚还在加班的，要么是领导傻逼，要么是自己傻逼，反正有人傻逼`,
      `记住：没有任何工作值得你熬夜。保重！`,
      `明天见。如果还活着的话。`,
    ],
  }
  
  const titleList = titles[tone] || titles.normal
  const bodyList = bodies[tone] || bodies.normal
  
  return {
    title: titleList[Math.floor(Math.random() * titleList.length)],
    body: bodyList[Math.floor(Math.random() * bodyList.length)],
    tone,
    hour,
  }
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

function generateEmailReport(type: string) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('zh-CN')
  
  return {
    subject: `📊 ${dateStr} 牛马日报 - 还没死？`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #FF3B30;">🐂 还没死？日报</h1>
        <p style="color: #666;">${dateStr}</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0;">今日战况</h2>
          <p>恭喜你又活过了一天！</p>
          <p>全国共有 <strong style="color: #34C759;">XX万</strong> 名牛马成功下班</p>
          <p>还有 <strong style="color: #FF3B30;">XX万</strong> 可怜人在加班</p>
        </div>
        
        <div style="background: #fff3f3; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0;">🤖 毒舌张说：</h2>
          <p style="font-style: italic;">"又活过一天，不容易啊。明天继续被操，保重身体！"</p>
        </div>
        
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          这封邮件来自「还没死？」APP<br>
          如果不想收到邮件，可以在APP中关闭推送设置
        </p>
      </div>
    `,
  }
}

export default push

