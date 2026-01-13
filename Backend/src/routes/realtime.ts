/**
 * 实时数据 API
 * 
 * 根据当前时间动态计算并返回各地区的上下班状态
 */

import { Hono } from 'hono'
import { 
  CITY_CONFIGS, 
  DISTRICT_CONFIGS,
  HOTSPOT_CONFIGS,
  calculateWorkingRate,
  calculateCityStats 
} from '../services/dataGenerationService'

const realtime = new Hono()

/**
 * GET /realtime/stats
 * 获取全国实时统计数据
 */
realtime.get('/stats', (c) => {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const dayOfWeek = now.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // 计算全国总数据
  let totalWorkers = 0
  let totalStillWorking = 0
  let totalCheckedIn = 0
  
  const cityStats = CITY_CONFIGS.map(city => {
    const stats = calculateCityStats(city, now)
    totalWorkers += stats.totalWorkers
    totalStillWorking += stats.stillWorking
    totalCheckedIn += stats.checkedIn
    
    return {
      city: city.name,
      province: city.province,
      tier: city.tier,
      latitude: city.lat,
      longitude: city.lon,
      totalWorkers: stats.totalWorkers,
      stillWorking: stats.stillWorking,
      checkedIn: stats.checkedIn,
      workingRate: Math.round(stats.workingRate * 100),  // 转为百分比
      avgCheckoutTime: stats.avgCheckoutTime,
      industries: city.industries,
    }
  })
  
  return c.json({
    success: true,
    timestamp: now.toISOString(),
    isWeekend,
    currentHour: hour,
    currentMinute: minute,
    nationwide: {
      totalWorkers,
      stillWorking: totalStillWorking,
      checkedIn: totalCheckedIn,
      workingRate: Math.round((totalStillWorking / totalWorkers) * 100),
    },
    cities: cityStats,
  })
})

/**
 * GET /realtime/city/:name
 * 获取指定城市的实时数据（包含区域详情）
 */
realtime.get('/city/:name', (c) => {
  const cityName = c.req.param('name')
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const dayOfWeek = now.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  const cityConfig = CITY_CONFIGS.find(city => city.name === cityName)
  if (!cityConfig) {
    return c.json({ success: false, error: '城市不存在' }, 404)
  }
  
  // 城市统计
  const cityStats = calculateCityStats(cityConfig, now)
  
  // 该城市的区域
  const districts = DISTRICT_CONFIGS
    .filter(d => d.city === cityName)
    .map(district => {
      const districtOvertimeIndex = cityConfig.overtimeIndex * district.overtimeMultiplier
      const workingRate = calculateWorkingRate(hour, minute, districtOvertimeIndex, isWeekend)
      
      // 区域人数为城市的5-15%（固定种子，保证一致性）
      const seed = district.name.charCodeAt(0) / 100
      const districtRatio = 0.05 + (seed % 0.1)
      const districtWorkers = Math.round(cityStats.totalWorkers * districtRatio)
      
      return {
        district: district.name,
        type: district.type,
        latitude: cityConfig.lat + district.latOffset,
        longitude: cityConfig.lon + district.lonOffset,
        totalWorkers: districtWorkers,
        stillWorking: Math.round(districtWorkers * workingRate),
        checkedIn: Math.round(districtWorkers * (1 - workingRate)),
        workingRate: Math.round(workingRate * 100),
        overtimeLevel: district.overtimeMultiplier > 1.2 ? 'heavy' : 
                       district.overtimeMultiplier > 1.0 ? 'normal' : 'light',
      }
    })
  
  // 该城市的热门地点
  const hotspots = HOTSPOT_CONFIGS
    .filter(h => h.city === cityName)
    .map(spot => {
      const overtimeLevelMap = { extreme: 1.5, heavy: 1.25, normal: 1.0, light: 0.8 }
      const spotOvertimeIndex = cityConfig.overtimeIndex * overtimeLevelMap[spot.overtimeLevel]
      const workingRate = calculateWorkingRate(hour, minute, spotOvertimeIndex, isWeekend)
      
      return {
        name: spot.name,
        district: spot.district,
        type: spot.type,
        totalWorkers: spot.workerCount,
        stillWorking: Math.round(spot.workerCount * workingRate),
        checkedIn: Math.round(spot.workerCount * (1 - workingRate)),
        workingRate: Math.round(workingRate * 100),
        overtimeLevel: spot.overtimeLevel,
        tags: spot.tags,
      }
    })
  
  return c.json({
    success: true,
    timestamp: now.toISOString(),
    isWeekend,
    city: {
      name: cityConfig.name,
      province: cityConfig.province,
      tier: cityConfig.tier,
      latitude: cityConfig.lat,
      longitude: cityConfig.lon,
      ...cityStats,
      workingRate: Math.round(cityStats.workingRate * 100),
      industries: cityConfig.industries,
    },
    districts,
    hotspots,
  })
})

/**
 * GET /realtime/hotspot/:city/:name
 * 获取指定热门地点的实时数据
 */
realtime.get('/hotspot/:city/:name', (c) => {
  const cityName = c.req.param('city')
  const spotName = c.req.param('name')
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const dayOfWeek = now.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  const cityConfig = CITY_CONFIGS.find(city => city.name === cityName)
  const spotConfig = HOTSPOT_CONFIGS.find(h => h.city === cityName && h.name === spotName)
  
  if (!cityConfig || !spotConfig) {
    return c.json({ success: false, error: '地点不存在' }, 404)
  }
  
  const overtimeLevelMap = { extreme: 1.5, heavy: 1.25, normal: 1.0, light: 0.8 }
  const spotOvertimeIndex = cityConfig.overtimeIndex * overtimeLevelMap[spotConfig.overtimeLevel]
  const workingRate = calculateWorkingRate(hour, minute, spotOvertimeIndex, isWeekend)
  
  // 计算今日各时段预测
  const hourlyForecast = []
  for (let h = 8; h <= 24; h++) {
    const forecastRate = calculateWorkingRate(h, 0, spotOvertimeIndex, isWeekend)
    hourlyForecast.push({
      hour: h === 24 ? 0 : h,
      label: `${h === 24 ? '00' : h.toString().padStart(2, '0')}:00`,
      stillWorking: Math.round(spotConfig.workerCount * forecastRate),
      workingRate: Math.round(forecastRate * 100),
    })
  }
  
  return c.json({
    success: true,
    timestamp: now.toISOString(),
    isWeekend,
    hotspot: {
      name: spotConfig.name,
      city: spotConfig.city,
      district: spotConfig.district,
      type: spotConfig.type,
      totalWorkers: spotConfig.workerCount,
      stillWorking: Math.round(spotConfig.workerCount * workingRate),
      checkedIn: Math.round(spotConfig.workerCount * (1 - workingRate)),
      workingRate: Math.round(workingRate * 100),
      overtimeLevel: spotConfig.overtimeLevel,
      tags: spotConfig.tags,
    },
    hourlyForecast,
  })
})

/**
 * GET /realtime/ranking
 * 获取加班排行榜
 */
realtime.get('/ranking', (c) => {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const dayOfWeek = now.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // 城市排行（按在班率排序）
  const cityRanking = CITY_CONFIGS.map(city => {
    const stats = calculateCityStats(city, now)
    return {
      city: city.name,
      workingRate: Math.round(stats.workingRate * 100),
      stillWorking: stats.stillWorking,
      tier: city.tier,
    }
  }).sort((a, b) => b.workingRate - a.workingRate)
  
  // 热门地点排行
  const hotspotRanking = HOTSPOT_CONFIGS.map(spot => {
    const cityConfig = CITY_CONFIGS.find(c => c.name === spot.city)!
    const overtimeLevelMap = { extreme: 1.5, heavy: 1.25, normal: 1.0, light: 0.8 }
    const spotOvertimeIndex = cityConfig.overtimeIndex * overtimeLevelMap[spot.overtimeLevel]
    const workingRate = calculateWorkingRate(hour, minute, spotOvertimeIndex, isWeekend)
    
    return {
      name: spot.name,
      city: spot.city,
      district: spot.district,
      workingRate: Math.round(workingRate * 100),
      stillWorking: Math.round(spot.workerCount * workingRate),
      tags: spot.tags,
    }
  }).sort((a, b) => b.workingRate - a.workingRate)
  
  return c.json({
    success: true,
    timestamp: now.toISOString(),
    isWeekend,
    // 加班最严重的城市 Top 10
    mostOvertimeCities: cityRanking.slice(0, 10),
    // 下班最早的城市 Top 5
    leastOvertimeCities: cityRanking.slice(-5).reverse(),
    // 加班最严重的地点 Top 10
    mostOvertimeSpots: hotspotRanking.slice(0, 10),
    // 最轻松的地点 Top 5
    leastOvertimeSpots: hotspotRanking.slice(-5).reverse(),
  })
})

/**
 * GET /realtime/time-simulation
 * 时间模拟（用于测试不同时间点的数据）
 */
realtime.get('/time-simulation', (c) => {
  const hourParam = c.req.query('hour')
  const minuteParam = c.req.query('minute')
  const cityParam = c.req.query('city')
  const weekendParam = c.req.query('weekend')
  
  const hour = hourParam ? parseInt(hourParam) : new Date().getHours()
  const minute = minuteParam ? parseInt(minuteParam) : new Date().getMinutes()
  const isWeekend = weekendParam === 'true'
  
  if (cityParam) {
    // 单个城市模拟
    const cityConfig = CITY_CONFIGS.find(c => c.name === cityParam)
    if (!cityConfig) {
      return c.json({ success: false, error: '城市不存在' }, 404)
    }
    
    const mockDate = new Date()
    mockDate.setHours(hour, minute)
    const stats = calculateCityStats(cityConfig, mockDate)
    
    return c.json({
      success: true,
      simulatedTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      isWeekend,
      city: cityConfig.name,
      workingRate: Math.round(stats.workingRate * 100),
      stillWorking: stats.stillWorking,
      checkedIn: stats.checkedIn,
    })
  }
  
  // 全部城市模拟
  const results = CITY_CONFIGS.map(city => {
    const workingRate = calculateWorkingRate(hour, minute, city.overtimeIndex, isWeekend)
    return {
      city: city.name,
      tier: city.tier,
      workingRate: Math.round(workingRate * 100),
    }
  }).sort((a, b) => b.workingRate - a.workingRate)
  
  return c.json({
    success: true,
    simulatedTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    isWeekend,
    cities: results,
  })
})

export default realtime
