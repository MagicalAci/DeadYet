/**
 * 附近用户服务
 * 
 * 核心功能：
 * 1. 查找附近真实用户
 * 2. 无真实用户时生成虚拟用户填充
 * 3. 根据时间和地点动态调整密度
 */

import { db } from '../db'
import { users, checkIns } from '../db/schema'
import { sql, and, gte, lte, desc } from 'drizzle-orm'
import { 
  CITIES, DISTRICTS, HOTSPOTS, 
  getRandomNickname, getRandomEmoji,
  getCityByName, getDistrictsByCity
} from '../data/geoData'
import { calculateWorkingRate } from './dataGenerationService'

// ==================== 类型定义 ====================

export interface NearbyUser {
  id: string
  nickname: string
  avatarEmoji: string
  distance: number       // 距离（米）
  isVirtual: boolean
  status: 'working' | 'checkedIn'  // 上班中 / 已下班
  checkInTime?: string   // 下班时间（如果已下班）
  workYears?: number
  industry?: string
}

export interface NearbyConfig {
  latitude: number
  longitude: number
  radiusMeters: number   // 搜索半径（米）
  limit: number          // 最大返回数量
  includeVirtual: boolean  // 是否包含虚拟用户
}

// ==================== 距离计算 ====================

/**
 * 计算两点之间的距离（米）
 * 使用 Haversine 公式
 */
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000  // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 计算坐标边界框（用于数据库查询优化）
 */
function getBoundingBox(lat: number, lon: number, radiusMeters: number) {
  const latDelta = radiusMeters / 111320  // 1度纬度约111.32km
  const lonDelta = radiusMeters / (111320 * Math.cos(lat * Math.PI / 180))
  
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  }
}

// ==================== 附近用户查询 ====================

/**
 * 获取附近真实用户
 */
export async function getNearbyRealUsers(config: NearbyConfig): Promise<NearbyUser[]> {
  const { latitude, longitude, radiusMeters, limit } = config
  const box = getBoundingBox(latitude, longitude, radiusMeters)
  
  // 查询边界框内的用户
  const nearbyUsers = await db.select({
    id: users.id,
    nickname: users.nickname,
    avatarEmoji: users.avatarEmoji,
    latitude: users.lastLatitude,
    longitude: users.lastLongitude,
    lastCheckIn: users.lastCheckIn,
    workYears: users.workYears,
    industry: users.industry,
    isVirtual: users.isVirtual,
  })
  .from(users)
  .where(and(
    gte(users.lastLatitude, box.minLat),
    lte(users.lastLatitude, box.maxLat),
    gte(users.lastLongitude, box.minLon),
    lte(users.lastLongitude, box.maxLon),
    // 只查询真实用户
    sql`${users.isVirtual} = false`,
  ))
  .limit(limit * 2)  // 多查一些，后面再过滤
  
  // 计算精确距离并过滤
  const result: NearbyUser[] = []
  
  for (const user of nearbyUsers) {
    if (!user.latitude || !user.longitude) continue
    
    const distance = calculateDistance(
      latitude, longitude,
      user.latitude, user.longitude
    )
    
    if (distance <= radiusMeters) {
      // 判断用户状态
      const isCheckedIn = user.lastCheckIn && 
        new Date(user.lastCheckIn).toDateString() === new Date().toDateString()
      
      result.push({
        id: user.id,
        nickname: user.nickname || getRandomNickname(),
        avatarEmoji: user.avatarEmoji || '🐂',
        distance: Math.round(distance),
        isVirtual: false,
        status: isCheckedIn ? 'checkedIn' : 'working',
        checkInTime: isCheckedIn ? formatTime(user.lastCheckIn!) : undefined,
        workYears: user.workYears || undefined,
        industry: user.industry || undefined,
      })
    }
  }
  
  // 按距离排序
  result.sort((a, b) => a.distance - b.distance)
  
  return result.slice(0, limit)
}

// ==================== 虚拟用户生成 ====================

/**
 * 生成虚拟附近用户
 * 当真实用户不足时，根据时间和地点生成虚拟用户填充
 */
export function generateVirtualNearbyUsers(
  config: NearbyConfig,
  existingCount: number,
  targetCount: number
): NearbyUser[] {
  const { latitude, longitude, radiusMeters } = config
  const neededCount = Math.max(0, targetCount - existingCount)
  
  if (neededCount === 0) return []
  
  // 获取当前位置的城市信息
  const cityInfo = findNearestCity(latitude, longitude)
  const hour = new Date().getHours()
  const minute = new Date().getMinutes()
  const isWeekend = [0, 6].includes(new Date().getDay())
  
  // 计算当前时间点的在班率
  const workingRate = calculateWorkingRate(
    hour, minute, 
    cityInfo?.overtimeIndex || 1.0, 
    isWeekend
  )
  
  // 根据时间和地点计算应该生成的用户密度
  const densityFactor = calculateDensityFactor(cityInfo, hour, isWeekend)
  const actualCount = Math.min(neededCount, Math.round(neededCount * densityFactor))
  
  const virtualUsers: NearbyUser[] = []
  
  for (let i = 0; i < actualCount; i++) {
    // 随机生成距离（在半径范围内，越近越多）
    const distanceRatio = Math.random() ** 0.5  // 使用开方分布，使近距离更密集
    const distance = Math.round(radiusMeters * distanceRatio)
    
    // 随机决定是否已下班
    const isCheckedIn = Math.random() > workingRate
    
    virtualUsers.push({
      id: `virtual_${Date.now()}_${i}`,
      nickname: getRandomNickname(),
      avatarEmoji: getRandomEmoji(),
      distance,
      isVirtual: true,
      status: isCheckedIn ? 'checkedIn' : 'working',
      checkInTime: isCheckedIn ? generateRandomCheckInTime(hour) : undefined,
      workYears: Math.floor(Math.random() * 10) + 1,
      industry: getRandomIndustry(),
    })
  }
  
  // 按距离排序
  virtualUsers.sort((a, b) => a.distance - b.distance)
  
  return virtualUsers
}

/**
 * 找到最近的城市配置
 */
function findNearestCity(lat: number, lon: number): typeof CITIES[0] | null {
  let nearest = null
  let minDistance = Infinity
  
  for (const city of CITIES) {
    const distance = calculateDistance(lat, lon, city.lat, city.lon)
    if (distance < minDistance) {
      minDistance = distance
      nearest = city
    }
  }
  
  // 如果距离超过 100km，认为不在任何配置城市内
  return minDistance < 100000 ? nearest : null
}

/**
 * 计算密度因子（根据时间和地点）
 */
function calculateDensityFactor(
  cityInfo: typeof CITIES[0] | null,
  hour: number,
  isWeekend: boolean
): number {
  let factor = 1.0
  
  // 城市等级影响
  if (cityInfo) {
    switch (cityInfo.tier) {
      case 1: factor *= 1.5; break  // 一线城市人多
      case 2: factor *= 1.2; break
      case 3: factor *= 1.0; break
      default: factor *= 0.8; break
    }
  } else {
    factor *= 0.5  // 非城市区域人少
  }
  
  // 时间影响
  if (isWeekend) {
    factor *= 0.3  // 周末人少
  } else {
    if (hour >= 9 && hour < 18) {
      factor *= 1.0  // 工作时间正常
    } else if (hour >= 18 && hour < 21) {
      factor *= 0.8  // 下班时间
    } else if (hour >= 21 || hour < 8) {
      factor *= 0.2  // 深夜/清晨人很少
    } else {
      factor *= 0.6  // 早高峰
    }
  }
  
  return Math.max(0.1, Math.min(1.0, factor))
}

/**
 * 生成随机下班时间
 */
function generateRandomCheckInTime(currentHour: number): string {
  // 下班时间应该在当前时间之前
  const checkInHour = Math.max(17, Math.min(currentHour - 1, 23))
  const checkInMinute = Math.floor(Math.random() * 60)
  return `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`
}

/**
 * 获取随机行业
 */
function getRandomIndustry(): string {
  const industries = ['互联网', '金融', '制造', '教育', '医疗', '传媒', '游戏', '电商', '咨询']
  return industries[Math.floor(Math.random() * industries.length)]
}

/**
 * 格式化时间
 */
function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

// ==================== 主服务类 ====================

export class NearbyService {
  
  /**
   * 获取附近的用户（真实+虚拟混合）
   */
  async getNearbyUsers(config: NearbyConfig): Promise<{
    users: NearbyUser[]
    realCount: number
    virtualCount: number
    totalInArea: number
  }> {
    const targetCount = config.limit || 20
    
    // 1. 先获取真实用户
    const realUsers = await getNearbyRealUsers(config)
    
    let allUsers = [...realUsers]
    let virtualCount = 0
    
    // 2. 如果真实用户不足且允许虚拟用户，则生成虚拟用户填充
    if (config.includeVirtual && realUsers.length < targetCount) {
      const virtualUsers = generateVirtualNearbyUsers(
        config, 
        realUsers.length, 
        targetCount
      )
      allUsers = [...realUsers, ...virtualUsers]
      virtualCount = virtualUsers.length
    }
    
    // 3. 按距离排序
    allUsers.sort((a, b) => a.distance - b.distance)
    
    // 4. 估算区域内总人数
    const totalInArea = this.estimateTotalUsersInArea(config)
    
    return {
      users: allUsers.slice(0, targetCount),
      realCount: realUsers.length,
      virtualCount,
      totalInArea,
    }
  }
  
  /**
   * 估算区域内总用户数
   */
  estimateTotalUsersInArea(config: NearbyConfig): number {
    const { latitude, longitude, radiusMeters } = config
    const cityInfo = findNearestCity(latitude, longitude)
    
    if (!cityInfo) return Math.floor(radiusMeters / 100)  // 非城市区域，每100米约1人
    
    // 基于城市人口密度估算
    const areaKm2 = Math.PI * (radiusMeters / 1000) ** 2
    const populationDensity = cityInfo.population * 10000 / 16000  // 假设城市面积约16000平方公里
    const workingPopulationRatio = 0.5  // 劳动人口比例
    
    return Math.round(areaKm2 * populationDensity * workingPopulationRatio)
  }
  
  /**
   * 更新用户位置
   */
  async updateUserLocation(userId: string, latitude: number, longitude: number): Promise<void> {
    await db.update(users)
      .set({
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastActiveAt: new Date(),
      })
      .where(sql`${users.id} = ${userId}`)
  }
  
  /**
   * 获取附近正在加班的人数
   */
  async getNearbyWorkingCount(latitude: number, longitude: number, radiusMeters: number): Promise<{
    working: number
    checkedIn: number
    total: number
  }> {
    const result = await this.getNearbyUsers({
      latitude,
      longitude,
      radiusMeters,
      limit: 100,
      includeVirtual: true,
    })
    
    const working = result.users.filter(u => u.status === 'working').length
    const checkedIn = result.users.filter(u => u.status === 'checkedIn').length
    
    return { working, checkedIn, total: result.totalInArea }
  }
}

export const nearbyService = new NearbyService()
