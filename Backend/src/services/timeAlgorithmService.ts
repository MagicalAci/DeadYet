/**
 * 高级时间算法服务
 * 
 * 完成项：
 * - A1: 分钟级时间算法
 * - A2: 午休时间段特殊处理
 * - A3: 节假日模式
 * - A4: 季节因素
 * - A5: 行业差异
 * - A6: 随机波动因子
 * - A7: 周趋势分析
 */

// ==================== 节假日配置 ====================

interface HolidayConfig {
  date: string        // MMDD 格式
  name: string
  type: 'holiday' | 'workday'  // holiday=放假, workday=调休上班
}

// 2024-2026 年中国法定节假日
const HOLIDAYS: HolidayConfig[] = [
  // 2024
  { date: '0101', name: '元旦', type: 'holiday' },
  { date: '0210', name: '春节', type: 'holiday' },
  { date: '0211', name: '春节', type: 'holiday' },
  { date: '0212', name: '春节', type: 'holiday' },
  { date: '0213', name: '春节', type: 'holiday' },
  { date: '0214', name: '春节', type: 'holiday' },
  { date: '0215', name: '春节', type: 'holiday' },
  { date: '0216', name: '春节', type: 'holiday' },
  { date: '0217', name: '春节', type: 'holiday' },
  { date: '0204', name: '春节调休', type: 'workday' },
  { date: '0218', name: '春节调休', type: 'workday' },
  { date: '0404', name: '清明节', type: 'holiday' },
  { date: '0405', name: '清明节', type: 'holiday' },
  { date: '0406', name: '清明节', type: 'holiday' },
  { date: '0407', name: '清明调休', type: 'workday' },
  { date: '0501', name: '劳动节', type: 'holiday' },
  { date: '0502', name: '劳动节', type: 'holiday' },
  { date: '0503', name: '劳动节', type: 'holiday' },
  { date: '0504', name: '劳动节', type: 'holiday' },
  { date: '0505', name: '劳动节', type: 'holiday' },
  { date: '0428', name: '劳动节调休', type: 'workday' },
  { date: '0511', name: '劳动节调休', type: 'workday' },
  { date: '0610', name: '端午节', type: 'holiday' },
  { date: '0917', name: '中秋节', type: 'holiday' },
  { date: '1001', name: '国庆节', type: 'holiday' },
  { date: '1002', name: '国庆节', type: 'holiday' },
  { date: '1003', name: '国庆节', type: 'holiday' },
  { date: '1004', name: '国庆节', type: 'holiday' },
  { date: '1005', name: '国庆节', type: 'holiday' },
  { date: '1006', name: '国庆节', type: 'holiday' },
  { date: '1007', name: '国庆节', type: 'holiday' },
  { date: '0929', name: '国庆调休', type: 'workday' },
  { date: '1012', name: '国庆调休', type: 'workday' },
  
  // 2025
  { date: '0101', name: '元旦', type: 'holiday' },
  { date: '0128', name: '春节', type: 'holiday' },
  { date: '0129', name: '春节', type: 'holiday' },
  { date: '0130', name: '春节', type: 'holiday' },
  { date: '0131', name: '春节', type: 'holiday' },
  { date: '0201', name: '春节', type: 'holiday' },
  { date: '0202', name: '春节', type: 'holiday' },
  { date: '0203', name: '春节', type: 'holiday' },
  { date: '0204', name: '春节', type: 'holiday' },
  
  // 2026
  { date: '0101', name: '元旦', type: 'holiday' },
  { date: '0217', name: '春节', type: 'holiday' },
  { date: '0218', name: '春节', type: 'holiday' },
  { date: '0219', name: '春节', type: 'holiday' },
  { date: '0220', name: '春节', type: 'holiday' },
  { date: '0221', name: '春节', type: 'holiday' },
  { date: '0222', name: '春节', type: 'holiday' },
  { date: '0223', name: '春节', type: 'holiday' },
]

// ==================== 行业配置 ====================

export interface IndustryOvertimeConfig {
  name: string
  overtimeIndex: number      // 加班指数
  avgCheckoutHour: number    // 平均下班时间
  peakOvertimeDays: number[] // 加班高峰（周几，1=周一）
  lunchBreakDuration: number // 午休时长（分钟）
}

export const INDUSTRY_CONFIGS: IndustryOvertimeConfig[] = [
  { name: '互联网', overtimeIndex: 1.35, avgCheckoutHour: 21.5, peakOvertimeDays: [1, 2, 3, 4], lunchBreakDuration: 90 },
  { name: '游戏', overtimeIndex: 1.40, avgCheckoutHour: 22.0, peakOvertimeDays: [1, 2, 3, 4, 5], lunchBreakDuration: 90 },
  { name: '电商', overtimeIndex: 1.35, avgCheckoutHour: 21.5, peakOvertimeDays: [1, 4, 5], lunchBreakDuration: 60 },
  { name: '金融', overtimeIndex: 1.25, avgCheckoutHour: 20.5, peakOvertimeDays: [1, 5], lunchBreakDuration: 60 },
  { name: '咨询', overtimeIndex: 1.30, avgCheckoutHour: 21.0, peakOvertimeDays: [1, 2, 3, 4], lunchBreakDuration: 60 },
  { name: '传媒', overtimeIndex: 1.15, avgCheckoutHour: 20.0, peakOvertimeDays: [1, 4, 5], lunchBreakDuration: 90 },
  { name: '教育', overtimeIndex: 0.90, avgCheckoutHour: 18.0, peakOvertimeDays: [], lunchBreakDuration: 120 },
  { name: '医疗', overtimeIndex: 1.10, avgCheckoutHour: 19.5, peakOvertimeDays: [1, 2, 3, 4, 5], lunchBreakDuration: 60 },
  { name: '制造', overtimeIndex: 0.95, avgCheckoutHour: 18.0, peakOvertimeDays: [], lunchBreakDuration: 90 },
  { name: '房地产', overtimeIndex: 1.10, avgCheckoutHour: 19.5, peakOvertimeDays: [6, 7], lunchBreakDuration: 90 },
  { name: '其他', overtimeIndex: 1.00, avgCheckoutHour: 19.0, peakOvertimeDays: [], lunchBreakDuration: 90 },
]

// ==================== 核心算法 ====================

export interface TimeContext {
  date: Date
  hour: number
  minute: number
  dayOfWeek: number      // 1-7, 1=周一
  month: number          // 1-12
  isHoliday: boolean
  isWorkdayOverride: boolean  // 调休工作日
  holidayName?: string
}

/**
 * 获取时间上下文
 */
export function getTimeContext(date: Date = new Date()): TimeContext {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dateStr = `${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`
  
  const holiday = HOLIDAYS.find(h => h.date === dateStr)
  
  // 周几：JavaScript 的 getDay() 返回 0-6，0=周日
  // 转换为 1-7，1=周一
  const jsDay = date.getDay()
  const dayOfWeek = jsDay === 0 ? 7 : jsDay
  
  return {
    date,
    hour: date.getHours(),
    minute: date.getMinutes(),
    dayOfWeek,
    month,
    isHoliday: holiday?.type === 'holiday',
    isWorkdayOverride: holiday?.type === 'workday',
    holidayName: holiday?.name,
  }
}

/**
 * A4: 计算季节因子
 * 冬天天黑早，下班略早；夏天天亮晚，下班略晚
 */
export function getSeasonFactor(month: number): number {
  // 1-2月、11-12月：冬季，下班略早
  if (month <= 2 || month >= 11) return -0.03
  // 3-4月、9-10月：春秋，正常
  if (month <= 4 || month >= 9) return 0
  // 5-8月：夏季，下班略晚
  return 0.02
}

/**
 * A7: 计算周趋势因子
 * 周一加班多，周五下班早
 */
export function getWeekdayFactor(dayOfWeek: number): number {
  switch (dayOfWeek) {
    case 1: return 0.05   // 周一：加班多
    case 2: return 0.03   // 周二：略多
    case 3: return 0.02   // 周三：中等
    case 4: return 0.01   // 周四：略少
    case 5: return -0.05  // 周五：下班早
    case 6: return -0.20  // 周六：如果上班
    case 7: return -0.25  // 周日：如果上班
    default: return 0
  }
}

/**
 * A6: 计算波动因子
 * 基于时间戳生成伪随机波动，每5分钟变化一次
 */
export function getFluctuationFactor(date: Date): number {
  // 使用5分钟为周期的时间戳作为种子
  const fiveMinSlot = Math.floor(date.getTime() / (5 * 60 * 1000))
  // 简单的伪随机
  const seed = (fiveMinSlot * 9301 + 49297) % 233280
  const random = seed / 233280  // 0-1
  // 转换为 -0.03 到 0.03 的波动
  return (random - 0.5) * 0.06
}

/**
 * A2: 检查是否在午休时间
 */
export function isLunchBreak(hour: number, minute: number, lunchDuration: number = 90): boolean {
  const time = hour * 60 + minute
  const lunchStart = 12 * 60  // 12:00
  const lunchEnd = lunchStart + lunchDuration
  return time >= lunchStart && time < lunchEnd
}

/**
 * A5: 获取行业配置
 */
export function getIndustryConfig(industry?: string): IndustryOvertimeConfig {
  if (!industry) return INDUSTRY_CONFIGS.find(i => i.name === '其他')!
  return INDUSTRY_CONFIGS.find(i => i.name === industry) || INDUSTRY_CONFIGS.find(i => i.name === '其他')!
}

/**
 * A1-A7: 完整的高级时间算法
 * 
 * 计算某时间点某地区的"在班率"
 */
export function calculateAdvancedWorkingRate(options: {
  date?: Date
  overtimeIndex?: number
  industry?: string
  includeFluctuation?: boolean
}): {
  workingRate: number
  factors: {
    base: number
    season: number
    weekday: number
    fluctuation: number
    industry: number
    holiday: number
    lunchBreak: number
  }
  context: TimeContext
} {
  const {
    date = new Date(),
    overtimeIndex = 1.0,
    industry,
    includeFluctuation = true,
  } = options
  
  const ctx = getTimeContext(date)
  const industryConfig = getIndustryConfig(industry)
  const time = ctx.hour + ctx.minute / 60
  
  // 初始化各因子
  const factors = {
    base: 0,
    season: 0,
    weekday: 0,
    fluctuation: 0,
    industry: 0,
    holiday: 0,
    lunchBreak: 0,
  }
  
  // === A3: 节假日模式 ===
  if (ctx.isHoliday) {
    // 法定假日：极少数人加班
    factors.holiday = -0.85
    factors.base = 0.15 * overtimeIndex
    
    if (time < 10 || time > 18) {
      factors.base = 0.02
    }
    
    const rate = Math.max(0.01, Math.min(0.20, factors.base + factors.holiday))
    return { workingRate: rate, factors, context: ctx }
  }
  
  // === 判断是否为工作日 ===
  const isWeekend = ctx.dayOfWeek >= 6
  const isWorkday = !isWeekend || ctx.isWorkdayOverride
  
  if (!isWorkday) {
    // 普通周末
    factors.base = 0.15 * overtimeIndex
    factors.weekday = getWeekdayFactor(ctx.dayOfWeek)
    
    if (time < 10 || time > 18) {
      factors.base = 0.03
    }
    
    const rate = Math.max(0.01, Math.min(0.25, factors.base + factors.weekday))
    return { workingRate: rate, factors, context: ctx }
  }
  
  // === 工作日计算 ===
  
  // A1: 分钟级基础算法
  if (time < 8) {
    factors.base = 0.02
  } else if (time < 9) {
    // 8:00-9:00 陆续上班，分钟级精确
    factors.base = 0.02 + (time - 8) * 0.5
  } else if (time < 9.5) {
    // 9:00-9:30 上班高峰
    factors.base = 0.52 + (time - 9) * 0.86
  } else if (time < 12) {
    // 9:30-12:00 正常工作
    factors.base = 0.95
  } else if (time < 13.5) {
    // A2: 午休时间 12:00-13:30
    const lunchDuration = industryConfig.lunchBreakDuration
    if (isLunchBreak(ctx.hour, ctx.minute, lunchDuration)) {
      // 午休期间，部分人外出
      const lunchProgress = (time - 12) / (lunchDuration / 60)
      if (lunchProgress < 0.3) {
        factors.lunchBreak = -0.15  // 刚开始午休，出去吃饭
      } else if (lunchProgress < 0.7) {
        factors.lunchBreak = -0.10  // 午休中
      } else {
        factors.lunchBreak = -0.05  // 快结束，陆续回来
      }
      factors.base = 0.95
    } else {
      factors.base = 0.95
    }
  } else if (time < 17.5) {
    // 13:30-17:30 下午工作
    factors.base = 0.95
  } else if (time < 18) {
    // 17:30-18:00 少数人提前下班
    factors.base = 0.95 - (time - 17.5) * 0.1
  } else if (time < 18.5) {
    // A1: 18:00-18:30 第一波下班（精确到分钟）
    const progress = (time - 18) * 2  // 0-1
    const dropRate = 0.20 / overtimeIndex
    factors.base = 0.9 - progress * dropRate
  } else if (time < 19) {
    // 18:30-19:00 继续下班
    const progress = (time - 18.5) * 2
    const startRate = 0.9 - 0.20 / overtimeIndex
    const dropRate = 0.15 / overtimeIndex
    factors.base = startRate - progress * dropRate
  } else if (time < 20) {
    // 19:00-20:00
    const progress = time - 19
    const startRate = 0.9 - 0.35 / overtimeIndex
    const dropRate = 0.20 / overtimeIndex
    factors.base = startRate - progress * dropRate
  } else if (time < 21) {
    // 20:00-21:00
    const progress = time - 20
    const startRate = 0.9 - 0.55 / overtimeIndex
    const dropRate = 0.15 / overtimeIndex
    factors.base = startRate - progress * dropRate
  } else if (time < 22) {
    // 21:00-22:00
    const progress = time - 21
    const rate21 = 0.9 - 0.70 / overtimeIndex
    factors.base = Math.max(0.05, rate21 - progress * 0.08)
  } else if (time < 23) {
    // 22:00-23:00
    factors.base = Math.max(0.03, 0.12 * overtimeIndex - (time - 22) * 0.04)
  } else {
    // 23:00-24:00
    factors.base = Math.max(0.01, 0.08 * overtimeIndex - (time - 23) * 0.03)
  }
  
  // A4: 季节因子
  factors.season = getSeasonFactor(ctx.month)
  
  // A7: 周趋势因子
  factors.weekday = getWeekdayFactor(ctx.dayOfWeek)
  
  // A5: 行业因子
  const isIndustryPeakDay = industryConfig.peakOvertimeDays.includes(ctx.dayOfWeek)
  if (isIndustryPeakDay && time >= 18) {
    factors.industry = 0.05  // 行业加班高峰日，下班更晚
  }
  
  // A6: 波动因子
  if (includeFluctuation) {
    factors.fluctuation = getFluctuationFactor(date)
  }
  
  // 计算最终在班率
  let workingRate = factors.base + factors.season + factors.weekday + 
                    factors.fluctuation + factors.industry + factors.lunchBreak
  
  // 加班指数调整
  if (time >= 18 && overtimeIndex > 1) {
    workingRate = workingRate * (1 + (overtimeIndex - 1) * 0.4)
  }
  
  workingRate = Math.max(0.01, Math.min(0.98, workingRate))
  
  return { workingRate, factors, context: ctx }
}

// ==================== 兼容接口 ====================

/**
 * 简化版接口（兼容旧代码）
 */
export function calculateWorkingRateAdvanced(
  hour: number,
  minute: number = 0,
  overtimeIndex: number = 1.0,
  isWeekend: boolean = false
): number {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  
  // 如果指定是周末，调整日期
  if (isWeekend) {
    const currentDay = date.getDay()
    if (currentDay !== 0 && currentDay !== 6) {
      date.setDate(date.getDate() + (6 - currentDay))  // 移到周六
    }
  }
  
  const result = calculateAdvancedWorkingRate({
    date,
    overtimeIndex,
    includeFluctuation: true,
  })
  
  return result.workingRate
}

// ==================== 调试接口 ====================

/**
 * 获取一天24小时的在班率变化（用于调试和可视化）
 */
export function getDailyWorkingRateCurve(options: {
  date?: Date
  overtimeIndex?: number
  industry?: string
}): Array<{ hour: number, minute: number, workingRate: number }> {
  const { date = new Date(), overtimeIndex = 1.0, industry } = options
  const result: Array<{ hour: number, minute: number, workingRate: number }> = []
  
  // 每15分钟一个点
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const testDate = new Date(date)
      testDate.setHours(hour, minute, 0, 0)
      
      const { workingRate } = calculateAdvancedWorkingRate({
        date: testDate,
        overtimeIndex,
        industry,
        includeFluctuation: false,  // 调试时不加波动
      })
      
      result.push({ hour, minute, workingRate: Math.round(workingRate * 100) / 100 })
    }
  }
  
  return result
}
