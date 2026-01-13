/**
 * 数据策略服务
 * 
 * 完成项：
 * - E2: 真实用户数据权重高于虚拟用户
 * - E3: 随着真实用户增加，逐步减少虚拟用户比例
 * - E4: 从真实用户行为学习，优化虚拟用户生成算法
 */

import { db } from '../db'
import { users, complaints, checkIns, comments } from '../db/schema'
import { sql, eq, desc, and, gte } from 'drizzle-orm'

// ==================== 配置 ====================

export interface DataStrategyConfig {
  // 虚拟用户比例阈值
  minVirtualRatio: number      // 最小虚拟用户比例（即使真实用户很多）
  maxVirtualRatio: number      // 最大虚拟用户比例（真实用户很少时）
  
  // 真实用户里程碑
  milestones: {
    users: number       // 用户数达到此值时
    virtualRatio: number // 虚拟用户比例降低到此值
  }[]
  
  // 权重配置
  realUserWeight: number       // 真实用户权重
  virtualUserWeight: number    // 虚拟用户权重
}

export const DEFAULT_STRATEGY_CONFIG: DataStrategyConfig = {
  minVirtualRatio: 0.1,   // 至少保留10%虚拟用户（保证内容多样性）
  maxVirtualRatio: 0.95,  // 最多95%虚拟用户（冷启动时）
  
  milestones: [
    { users: 100, virtualRatio: 0.95 },
    { users: 500, virtualRatio: 0.90 },
    { users: 1000, virtualRatio: 0.85 },
    { users: 5000, virtualRatio: 0.75 },
    { users: 10000, virtualRatio: 0.60 },
    { users: 50000, virtualRatio: 0.40 },
    { users: 100000, virtualRatio: 0.25 },
    { users: 500000, virtualRatio: 0.15 },
    { users: 1000000, virtualRatio: 0.10 },
  ],
  
  realUserWeight: 3.0,    // 真实用户权重是虚拟用户的3倍
  virtualUserWeight: 1.0,
}

// ==================== E2: 权重计算 ====================

export interface WeightedUser {
  id: string
  isVirtual: boolean
  weight: number
  score: number  // 综合分数（用于排序）
}

/**
 * 计算用户权重
 */
export function calculateUserWeight(
  isVirtual: boolean,
  config: DataStrategyConfig = DEFAULT_STRATEGY_CONFIG
): number {
  return isVirtual ? config.virtualUserWeight : config.realUserWeight
}

/**
 * 对用户列表按权重排序
 * 真实用户会排在前面
 */
export function sortUsersByWeight<T extends { isVirtual: boolean }>(
  users: T[],
  config: DataStrategyConfig = DEFAULT_STRATEGY_CONFIG
): T[] {
  return users.sort((a, b) => {
    const weightA = calculateUserWeight(a.isVirtual, config)
    const weightB = calculateUserWeight(b.isVirtual, config)
    
    // 加入随机因素，避免完全按权重排序导致的机械感
    const randomFactor = Math.random() * 0.3
    
    return (weightB + randomFactor) - (weightA + randomFactor)
  })
}

// ==================== E3: 虚拟用户比例控制 ====================

export interface RealUserStats {
  totalUsers: number
  realUsers: number
  virtualUsers: number
  realUserRatio: number
  targetVirtualRatio: number
}

/**
 * 获取真实用户统计
 */
export async function getRealUserStats(): Promise<RealUserStats> {
  const result = await db.select({
    total: sql<number>`count(*)`,
    real: sql<number>`count(*) filter (where ${users.isVirtual} = false)`,
    virtual: sql<number>`count(*) filter (where ${users.isVirtual} = true)`,
  }).from(users)
  
  const stats = result[0]
  const totalUsers = Number(stats.total) || 0
  const realUsers = Number(stats.real) || 0
  const virtualUsers = Number(stats.virtual) || 0
  
  const realUserRatio = totalUsers > 0 ? realUsers / totalUsers : 0
  const targetVirtualRatio = calculateTargetVirtualRatio(realUsers)
  
  return {
    totalUsers,
    realUsers,
    virtualUsers,
    realUserRatio,
    targetVirtualRatio,
  }
}

/**
 * 根据真实用户数计算目标虚拟用户比例
 */
export function calculateTargetVirtualRatio(
  realUserCount: number,
  config: DataStrategyConfig = DEFAULT_STRATEGY_CONFIG
): number {
  // 找到对应的里程碑
  for (let i = config.milestones.length - 1; i >= 0; i--) {
    if (realUserCount >= config.milestones[i].users) {
      return config.milestones[i].virtualRatio
    }
  }
  
  return config.maxVirtualRatio
}

/**
 * 计算需要填充的虚拟用户数量
 */
export function calculateVirtualFillCount(
  realCount: number,
  currentVirtualCount: number,
  targetTotal: number,
  config: DataStrategyConfig = DEFAULT_STRATEGY_CONFIG
): number {
  const targetVirtualRatio = calculateTargetVirtualRatio(realCount, config)
  const targetVirtualCount = Math.floor(targetTotal * targetVirtualRatio)
  
  // 需要填充的数量
  const neededVirtual = targetVirtualCount - currentVirtualCount
  
  // 确保在合理范围内
  return Math.max(0, Math.min(neededVirtual, targetTotal - realCount))
}

// ==================== E4: 行为学习 ====================

export interface UserBehaviorPattern {
  // 下班时间分布
  checkInTimeDistribution: { hour: number, count: number }[]
  
  // 抱怨类别分布
  complaintCategoryDistribution: { category: string, count: number }[]
  
  // 活跃时间分布
  activeTimeDistribution: { hour: number, count: number }[]
  
  // 平均指标
  avgComplaintLength: number
  avgLikesPerComplaint: number
  avgCommentsPerComplaint: number
  
  // 城市分布
  cityDistribution: { city: string, count: number }[]
  
  // 行业分布
  industryDistribution: { industry: string, count: number }[]
}

/**
 * 从真实用户行为学习模式
 */
export async function learnFromRealUsers(): Promise<UserBehaviorPattern> {
  // 获取过去30天的真实用户行为数据
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  // 1. 下班时间分布
  const checkInTimes = await db.select({
    hour: sql<number>`extract(hour from ${checkIns.checkInTime})`,
    count: sql<number>`count(*)`,
  })
  .from(checkIns)
  .innerJoin(users, eq(checkIns.userId, users.id))
  .where(and(
    eq(users.isVirtual, false),
    gte(checkIns.checkInTime, thirtyDaysAgo)
  ))
  .groupBy(sql`extract(hour from ${checkIns.checkInTime})`)
  
  // 2. 抱怨类别分布
  const categoryDist = await db.select({
    category: complaints.category,
    count: sql<number>`count(*)`,
  })
  .from(complaints)
  .innerJoin(users, eq(complaints.userId, users.id))
  .where(and(
    eq(users.isVirtual, false),
    eq(complaints.isAiGenerated, false)
  ))
  .groupBy(complaints.category)
  
  // 3. 城市分布
  const cityDist = await db.select({
    city: users.city,
    count: sql<number>`count(*)`,
  })
  .from(users)
  .where(eq(users.isVirtual, false))
  .groupBy(users.city)
  .orderBy(desc(sql`count(*)`))
  .limit(20)
  
  // 4. 行业分布
  const industryDist = await db.select({
    industry: users.industry,
    count: sql<number>`count(*)`,
  })
  .from(users)
  .where(and(
    eq(users.isVirtual, false),
    sql`${users.industry} is not null`
  ))
  .groupBy(users.industry)
  
  // 5. 平均指标
  const avgStats = await db.select({
    avgLength: sql<number>`avg(length(${complaints.content}))`,
    avgLikes: sql<number>`avg(${complaints.likesCount})`,
    avgComments: sql<number>`avg(${complaints.commentsCount})`,
  })
  .from(complaints)
  .innerJoin(users, eq(complaints.userId, users.id))
  .where(and(
    eq(users.isVirtual, false),
    eq(complaints.isAiGenerated, false)
  ))
  
  const stats = avgStats[0]
  
  return {
    checkInTimeDistribution: checkInTimes.map(r => ({
      hour: Number(r.hour),
      count: Number(r.count)
    })),
    complaintCategoryDistribution: categoryDist.map(r => ({
      category: r.category || 'general',
      count: Number(r.count)
    })),
    activeTimeDistribution: checkInTimes.map(r => ({
      hour: Number(r.hour),
      count: Number(r.count)
    })),
    avgComplaintLength: Number(stats?.avgLength) || 50,
    avgLikesPerComplaint: Number(stats?.avgLikes) || 100,
    avgCommentsPerComplaint: Number(stats?.avgComments) || 10,
    cityDistribution: cityDist.filter(r => r.city).map(r => ({
      city: r.city!,
      count: Number(r.count)
    })),
    industryDistribution: industryDist.filter(r => r.industry).map(r => ({
      industry: r.industry!,
      count: Number(r.count)
    })),
  }
}

/**
 * 基于学习到的模式生成虚拟用户参数
 */
export function generateVirtualUserParams(pattern: UserBehaviorPattern): {
  city: string
  industry?: string
  checkInHour: number
  complaintCategory: string
} {
  // 按分布随机选择城市
  const city = weightedRandomPick(
    pattern.cityDistribution.map(c => c.city),
    pattern.cityDistribution.map(c => c.count)
  ) || '北京'
  
  // 按分布随机选择行业
  const industry = pattern.industryDistribution.length > 0
    ? weightedRandomPick(
        pattern.industryDistribution.map(i => i.industry),
        pattern.industryDistribution.map(i => i.count)
      )
    : undefined
  
  // 按分布随机选择下班时间
  const checkInHour = pattern.checkInTimeDistribution.length > 0
    ? weightedRandomPick(
        pattern.checkInTimeDistribution.map(t => t.hour),
        pattern.checkInTimeDistribution.map(t => t.count)
      ) || 19
    : Math.floor(Math.random() * 5) + 18  // 18-22点
  
  // 按分布随机选择抱怨类别
  const complaintCategory = pattern.complaintCategoryDistribution.length > 0
    ? weightedRandomPick(
        pattern.complaintCategoryDistribution.map(c => c.category),
        pattern.complaintCategoryDistribution.map(c => c.count)
      ) || 'general'
    : 'general'
  
  return { city, industry, checkInHour, complaintCategory }
}

/**
 * 加权随机选择
 */
function weightedRandomPick<T>(items: T[], weights: number[]): T | null {
  if (items.length === 0) return null
  
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  if (totalWeight === 0) return items[Math.floor(Math.random() * items.length)]
  
  let random = Math.random() * totalWeight
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) return items[i]
  }
  
  return items[items.length - 1]
}

// ==================== 综合服务 ====================

export class DataStrategyService {
  private config: DataStrategyConfig
  private cachedPattern: UserBehaviorPattern | null = null
  private patternCacheTime: number = 0
  private readonly PATTERN_CACHE_TTL = 3600000  // 1小时
  
  constructor(config: DataStrategyConfig = DEFAULT_STRATEGY_CONFIG) {
    this.config = config
  }
  
  /**
   * 获取当前数据策略状态
   */
  async getStrategyStatus() {
    const stats = await getRealUserStats()
    const pattern = await this.getBehaviorPattern()
    
    return {
      realUserStats: stats,
      config: this.config,
      behaviorPattern: {
        topCities: pattern.cityDistribution.slice(0, 5),
        topIndustries: pattern.industryDistribution.slice(0, 5),
        peakCheckInHours: pattern.checkInTimeDistribution
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map(t => t.hour),
      },
      recommendations: this.generateRecommendations(stats),
    }
  }
  
  /**
   * 获取行为模式（带缓存）
   */
  async getBehaviorPattern(): Promise<UserBehaviorPattern> {
    const now = Date.now()
    
    if (this.cachedPattern && (now - this.patternCacheTime) < this.PATTERN_CACHE_TTL) {
      return this.cachedPattern
    }
    
    this.cachedPattern = await learnFromRealUsers()
    this.patternCacheTime = now
    
    return this.cachedPattern
  }
  
  /**
   * 生成优化建议
   */
  private generateRecommendations(stats: RealUserStats): string[] {
    const recommendations: string[] = []
    
    if (stats.realUsers < 1000) {
      recommendations.push('真实用户较少，建议保持较高的虚拟用户比例以丰富内容')
    }
    
    if (stats.realUserRatio > 1 - this.config.minVirtualRatio) {
      recommendations.push('真实用户比例较高，可以考虑减少虚拟用户生成')
    }
    
    if (stats.targetVirtualRatio < stats.virtualUsers / stats.totalUsers) {
      recommendations.push('虚拟用户比例高于目标值，建议控制虚拟用户生成')
    }
    
    return recommendations
  }
  
  /**
   * 生成优化后的虚拟用户参数
   */
  async generateOptimizedVirtualParams() {
    const pattern = await this.getBehaviorPattern()
    return generateVirtualUserParams(pattern)
  }
}

export const dataStrategyService = new DataStrategyService()
