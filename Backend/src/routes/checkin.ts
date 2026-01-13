/**
 * 签到路由
 */

import { Hono } from 'hono'
import userService from '../services/userService.js'

const checkIn = new Hono()

// 打卡签到
checkIn.post('/', async (c) => {
  try {
    const { userId, complaint, mood, city, district, latitude, longitude } = await c.req.json()
    
    if (!userId) {
      return c.json({
        success: false,
        error: '用户ID呢？',
      }, 400)
    }
    
    const result = await userService.checkIn(
      userId,
      complaint,
      mood,
      city,
      district,
      latitude,
      longitude
    )
    
    return c.json({
      success: true,
      message: '签到成功！又活过一天',
      record: {
        id: result.record.id,
        userId: result.record.userId,
        checkInTime: result.record.checkInTime?.toISOString(),
        complaint: result.record.complaint,
        aiResponse: result.record.aiResponse,
        mood: result.record.mood,
        city: result.record.city,
        district: result.record.district,
        bannerGenerated: result.record.bannerGenerated,
      },
      survivalDays: result.user.survivalDays,
      aiResponse: result.aiResponse,
    })
    
  } catch (error) {
    console.error('签到失败:', error)
    
    const message = (error as Error).message
    
    if (message.includes('已经打过卡')) {
      return c.json({
        success: false,
        error: '今天已经打过卡了，一天只能死一次',
      }, 400)
    }
    
    if (message.includes('用户不存在')) {
      return c.json({
        success: false,
        error: '用户不存在，先登录吧',
      }, 404)
    }
    
    return c.json({
      success: false,
      error: '签到失败',
      message,
    }, 500)
  }
})

// 获取今天的签到
checkIn.get('/today', async (c) => {
  try {
    const userId = c.req.query('userId') || c.req.header('X-User-Id')
    
    if (!userId) {
      return c.json({
        success: false,
        error: '未提供用户ID',
      }, 400)
    }
    
    const record = await userService.getTodayCheckIn(userId)
    
    return c.json({
      success: true,
      hasCheckedIn: !!record,
      record: record ? {
        id: record.id,
        checkInTime: record.checkInTime?.toISOString(),
        complaint: record.complaint,
        aiResponse: record.aiResponse,
        mood: record.mood,
        bannerGenerated: record.bannerGenerated,
      } : null,
    })
    
  } catch (error) {
    console.error('获取今日签到失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 获取签到历史
checkIn.get('/history', async (c) => {
  try {
    const userId = c.req.query('userId') || c.req.header('X-User-Id')
    const limit = parseInt(c.req.query('limit') || '30')
    
    if (!userId) {
      return c.json({
        success: false,
        error: '未提供用户ID',
      }, 400)
    }
    
    const records = await userService.getCheckInHistory(userId, limit)
    
    return c.json({
      success: true,
      data: records.map(r => ({
        id: r.id,
        checkInTime: r.checkInTime?.toISOString(),
        complaint: r.complaint,
        aiResponse: r.aiResponse,
        mood: r.mood,
        city: r.city,
        district: r.district,
      })),
      total: records.length,
    })
    
  } catch (error) {
    console.error('获取签到历史失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 更新今日签到（补充抱怨）
checkIn.put('/today', async (c) => {
  try {
    const userId = c.req.header('X-User-Id')
    const { complaint, mood } = await c.req.json()
    
    if (!userId) {
      return c.json({
        success: false,
        error: '未提供用户ID',
      }, 401)
    }
    
    // TODO: 实现更新逻辑
    
    return c.json({
      success: true,
      message: '更新成功',
    })
    
  } catch (error) {
    console.error('更新签到失败:', error)
    return c.json({
      success: false,
      error: '更新失败',
    }, 500)
  }
})

export default checkIn
