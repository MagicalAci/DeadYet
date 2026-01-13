/**
 * 地图数据路由
 */

import { Hono } from 'hono'
import mapService from '../services/mapService.js'
import complaintService from '../services/complaintService.js'

const map = new Hono()

// 获取全国统计
map.get('/stats', async (c) => {
  try {
    const summary = await mapService.getSummary()
    const cities = await mapService.getAllCities()
    
    return c.json({
      success: true,
      timestamp: summary.timestamp,
      summary: {
        totalNationwide: summary.totalNationwide,
        checkedInNationwide: summary.checkedInNationwide,
        stillWorkingNationwide: summary.stillWorkingNationwide,
        overallCheckInRate: summary.overallCheckInRate,
      },
      cities: cities.map(city => ({
        id: city.id,
        name: city.city,
        city: city.city,
        province: city.province,
        tier: city.tier,
        latitude: city.latitude,
        longitude: city.longitude,
        totalWorkers: city.totalWorkers,
        checkedIn: city.checkedIn,
        stillWorking: city.stillWorking,
        averageCheckOutTime: city.averageCheckOutTime,
        status: getStatus(city.checkedIn / (city.totalWorkers || 1)),
      })),
    })
    
  } catch (error) {
    console.error('获取地图统计失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 获取所有城市
map.get('/cities', async (c) => {
  try {
    const cities = await mapService.getAllCities()
    
    return c.json({
      success: true,
      cities: cities.map(city => ({
        id: city.id,
        name: city.city,
        province: city.province,
        tier: city.tier,
        latitude: city.latitude,
        longitude: city.longitude,
        totalWorkers: city.totalWorkers,
        checkedIn: city.checkedIn,
        stillWorking: city.stillWorking,
        averageCheckOutTime: city.averageCheckOutTime,
        status: getStatus(city.checkedIn / (city.totalWorkers || 1)),
      })),
    })
    
  } catch (error) {
    console.error('获取城市列表失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 获取城市详情
map.get('/cities/:city', async (c) => {
  try {
    const cityName = c.req.param('city')
    const city = await mapService.getCity(cityName)
    
    if (!city) {
      return c.json({
        success: false,
        error: '城市不存在',
      }, 404)
    }
    
    return c.json({
      success: true,
      data: {
        id: city.id,
        name: city.city,
        province: city.province,
        tier: city.tier,
        latitude: city.latitude,
        longitude: city.longitude,
        totalWorkers: city.totalWorkers,
        checkedIn: city.checkedIn,
        stillWorking: city.stillWorking,
        averageCheckOutTime: city.averageCheckOutTime,
        status: getStatus(city.checkedIn / (city.totalWorkers || 1)),
      },
    })
    
  } catch (error) {
    console.error('获取城市详情失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 获取区级数据
map.get('/cities/:city/districts', async (c) => {
  try {
    const cityName = c.req.param('city')
    const districts = await mapService.getDistricts(cityName)
    
    return c.json({
      success: true,
      data: districts.map(d => ({
        id: d.id,
        city: d.city,
        name: d.district,
        district: d.district,
        latitude: d.latitude,
        longitude: d.longitude,
        totalWorkers: d.totalWorkers,
        checkedIn: d.checkedIn,
        stillWorking: d.stillWorking,
        averageCheckOutTime: d.averageCheckOutTime,
      })),
    })
    
  } catch (error) {
    console.error('获取区级数据失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 获取热门地点
map.get('/cities/:city/hotspots', async (c) => {
  try {
    const cityName = c.req.param('city')
    const district = c.req.query('district')
    const hotSpots = await mapService.getHotSpots(cityName, district)
    
    return c.json({
      success: true,
      data: hotSpots.map(spot => ({
        id: spot.id,
        name: spot.name,
        type: spot.type,
        city: spot.city,
        district: spot.district,
        latitude: spot.latitude,
        longitude: spot.longitude,
        totalWorkers: spot.totalWorkers,
        checkedIn: spot.checkedIn,
        stillWorking: spot.stillWorking,
        averageCheckOutTime: spot.averageCheckOutTime,
        tags: spot.tags,
      })),
    })
    
  } catch (error) {
    console.error('获取热门地点失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 获取附近的抱怨
map.get('/nearby', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '0')
    const lon = parseFloat(c.req.query('lon') || '0')
    const radius = parseFloat(c.req.query('radius') || '5')
    
    if (!lat || !lon) {
      return c.json({
        success: false,
        error: '需要提供经纬度',
      }, 400)
    }
    
    const complaints = await complaintService.getNearbyComplaints(lat, lon, radius)
    
    return c.json({
      success: true,
      complaints: complaints.map(complaint => ({
        id: complaint.id,
        userId: complaint.userId,
        userNickname: complaint.userNickname,
        userEmoji: complaint.userEmoji,
        contentType: complaint.contentType,
        content: complaint.content,
        voiceUrl: complaint.voiceUrl,
        voiceDuration: complaint.voiceDuration,
        category: complaint.category,
        city: complaint.city,
        district: complaint.district,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        likes: complaint.likesCount,
        comments: complaint.commentsCount,
        createdAt: complaint.createdAt?.toISOString(),
      })),
    })
    
  } catch (error) {
    console.error('获取附近抱怨失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 辅助函数
function getStatus(rate: number): string {
  if (rate >= 0.7) return 'mostlyOff'
  if (rate >= 0.4) return 'struggling'
  return 'stillWorking'
}

export default map
