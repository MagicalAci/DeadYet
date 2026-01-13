/**
 * 缓存与性能服务
 * 
 * 完成项：
 * - G1: Redis缓存热点数据
 * - G2: 定时任务预计算各区域统计数据
 * - G3: 大量数据分页加载
 */

// ==================== G1: 内存缓存（生产环境可替换为Redis）====================

interface CacheEntry<T> {
  data: T
  expireAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 300000  // 5分钟
  
  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      expireAt: Date.now() + ttlMs,
    })
  }
  
  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() > entry.expireAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }
  
  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  /**
   * 删除匹配的缓存
   */
  deletePattern(pattern: string): number {
    let count = 0
    const regex = new RegExp(pattern.replace('*', '.*'))
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    
    return count
  }
  
  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * 获取缓存统计
   */
  getStats(): { size: number, keys: string[] } {
    // 先清理过期的
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expireAt) {
        this.cache.delete(key)
      }
    }
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const memoryCache = new MemoryCache()

// ==================== 缓存键定义 ====================

export const CacheKeys = {
  // 城市统计
  cityStats: (city: string) => `city:${city}:stats`,
  allCitiesStats: () => 'cities:all:stats',
  
  // 区域统计
  districtStats: (city: string, district: string) => `district:${city}:${district}:stats`,
  cityDistricts: (city: string) => `city:${city}:districts`,
  
  // 热门地点
  cityHotspots: (city: string) => `city:${city}:hotspots`,
  hotspotStats: (city: string, name: string) => `hotspot:${city}:${name}:stats`,
  
  // 用户相关
  userProfile: (userId: string) => `user:${userId}:profile`,
  nearbyUsers: (lat: number, lon: number, radius: number) => 
    `nearby:${lat.toFixed(3)}:${lon.toFixed(3)}:${radius}`,
  
  // 抱怨相关
  complaints: (city: string, page: number) => `complaints:${city}:page${page}`,
  complaintDetail: (id: string) => `complaint:${id}`,
  
  // 排行榜
  cityRanking: () => 'ranking:cities',
  hotspotRanking: () => 'ranking:hotspots',
  
  // 行为学习
  behaviorPattern: () => 'strategy:behavior:pattern',
  userStats: () => 'strategy:user:stats',
}

// ==================== 缓存装饰器 ====================

/**
 * 缓存包装函数
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = 300000
): Promise<T> {
  // 尝试从缓存获取
  const cached = memoryCache.get<T>(key)
  if (cached !== null) {
    return cached
  }
  
  // 从源获取并缓存
  const data = await fetchFn()
  memoryCache.set(key, data, ttlMs)
  
  return data
}

// ==================== G2: 预计算服务 ====================

import { CITIES, DISTRICTS, HOTSPOTS } from '../data/geoData'
import { calculateAdvancedWorkingRate } from './timeAlgorithmService'

interface PrecomputedStats {
  timestamp: Date
  cities: Array<{
    name: string
    workingRate: number
    stillWorking: number
    checkedIn: number
  }>
  hotspots: Array<{
    name: string
    city: string
    workingRate: number
  }>
  nationwideStats: {
    totalWorkers: number
    stillWorking: number
    checkedIn: number
    workingRate: number
  }
}

class PrecomputeService {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private readonly PRECOMPUTE_INTERVAL = 60000  // 每分钟预计算一次
  
  /**
   * 启动预计算定时任务
   */
  start(): void {
    if (this.intervalId) return
    
    console.log('🚀 预计算服务启动')
    
    // 立即执行一次
    this.precompute()
    
    // 定时执行
    this.intervalId = setInterval(() => {
      this.precompute()
    }, this.PRECOMPUTE_INTERVAL)
  }
  
  /**
   * 停止预计算
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('⏹️ 预计算服务停止')
    }
  }
  
  /**
   * 执行预计算
   */
  async precompute(): Promise<PrecomputedStats> {
    const now = new Date()
    
    // 计算所有城市的统计
    const cityStats = CITIES.map(city => {
      const { workingRate } = calculateAdvancedWorkingRate({
        date: now,
        overtimeIndex: city.overtimeIndex,
      })
      
      const totalWorkers = city.workerBase * 10000
      const stillWorking = Math.round(totalWorkers * workingRate)
      const checkedIn = totalWorkers - stillWorking
      
      // 缓存单个城市统计
      memoryCache.set(CacheKeys.cityStats(city.name), {
        name: city.name,
        province: city.province,
        tier: city.tier,
        workingRate: Math.round(workingRate * 100),
        totalWorkers,
        stillWorking,
        checkedIn,
        updatedAt: now,
      }, this.PRECOMPUTE_INTERVAL * 2)
      
      return {
        name: city.name,
        workingRate: Math.round(workingRate * 100),
        stillWorking,
        checkedIn,
      }
    })
    
    // 计算热门地点统计
    const hotspotStats = HOTSPOTS.map(spot => {
      const cityConfig = CITIES.find(c => c.name === spot.city)
      const overtimeLevelMap = { extreme: 1.5, heavy: 1.25, normal: 1.0, light: 0.8 }
      const spotOvertimeIndex = (cityConfig?.overtimeIndex || 1.0) * overtimeLevelMap[spot.overtimeLevel]
      
      const { workingRate } = calculateAdvancedWorkingRate({
        date: now,
        overtimeIndex: spotOvertimeIndex,
      })
      
      // 缓存单个热点统计
      memoryCache.set(CacheKeys.hotspotStats(spot.city, spot.name), {
        name: spot.name,
        city: spot.city,
        district: spot.district,
        workingRate: Math.round(workingRate * 100),
        stillWorking: Math.round(spot.workerCount * workingRate),
        checkedIn: Math.round(spot.workerCount * (1 - workingRate)),
        tags: spot.tags,
        updatedAt: now,
      }, this.PRECOMPUTE_INTERVAL * 2)
      
      return {
        name: spot.name,
        city: spot.city,
        workingRate: Math.round(workingRate * 100),
      }
    })
    
    // 计算全国统计
    const nationwideStats = {
      totalWorkers: cityStats.reduce((sum, c) => sum + c.stillWorking + c.checkedIn, 0),
      stillWorking: cityStats.reduce((sum, c) => sum + c.stillWorking, 0),
      checkedIn: cityStats.reduce((sum, c) => sum + c.checkedIn, 0),
      workingRate: 0,
    }
    nationwideStats.workingRate = Math.round(
      (nationwideStats.stillWorking / nationwideStats.totalWorkers) * 100
    )
    
    // 缓存聚合数据
    const precomputed: PrecomputedStats = {
      timestamp: now,
      cities: cityStats,
      hotspots: hotspotStats,
      nationwideStats,
    }
    
    memoryCache.set(CacheKeys.allCitiesStats(), precomputed, this.PRECOMPUTE_INTERVAL * 2)
    
    // 缓存排行榜
    memoryCache.set(CacheKeys.cityRanking(), 
      [...cityStats].sort((a, b) => b.workingRate - a.workingRate),
      this.PRECOMPUTE_INTERVAL * 2
    )
    
    memoryCache.set(CacheKeys.hotspotRanking(),
      [...hotspotStats].sort((a, b) => b.workingRate - a.workingRate),
      this.PRECOMPUTE_INTERVAL * 2
    )
    
    return precomputed
  }
  
  /**
   * 获取预计算结果（从缓存）
   */
  getCached(): PrecomputedStats | null {
    return memoryCache.get<PrecomputedStats>(CacheKeys.allCitiesStats())
  }
}

export const precomputeService = new PrecomputeService()

// ==================== G3: 分页服务 ====================

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * 标准化分页参数
 */
export function normalizePagination(params: Partial<PaginationParams>): PaginationParams {
  return {
    page: Math.max(1, params.page || 1),
    pageSize: Math.min(100, Math.max(1, params.pageSize || 20)),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder || 'desc',
  }
}

/**
 * 构建分页结果
 */
export function buildPaginatedResult<T>(
  data: T[],
  totalItems: number,
  params: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalItems / params.pageSize)
  
  return {
    data,
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  }
}

/**
 * 计算 offset 和 limit
 */
export function getOffsetLimit(params: PaginationParams): { offset: number, limit: number } {
  return {
    offset: (params.page - 1) * params.pageSize,
    limit: params.pageSize,
  }
}

// ==================== 综合缓存服务 ====================

export class CacheService {
  /**
   * 预热缓存（启动时调用）
   */
  async warmup(): Promise<void> {
    console.log('🔥 开始预热缓存...')
    
    // 启动预计算服务
    precomputeService.start()
    
    console.log('✅ 缓存预热完成')
  }
  
  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      memory: memoryCache.getStats(),
      precomputed: precomputeService.getCached() ? '已缓存' : '未缓存',
    }
  }
  
  /**
   * 清空指定类型的缓存
   */
  invalidate(pattern: string): number {
    return memoryCache.deletePattern(pattern)
  }
  
  /**
   * 清空所有缓存
   */
  clear(): void {
    memoryCache.clear()
  }
}

export const cacheService = new CacheService()
