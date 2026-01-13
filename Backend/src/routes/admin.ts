/**
 * 管理员 API
 * 
 * 用于数据初始化、批量生成等管理操作
 */

import { Hono } from 'hono'
import { dataGenerationService, CITY_CONFIGS, DISTRICT_CONFIGS, HOTSPOT_CONFIGS } from '../services/dataGenerationService'
import { db } from '../db'
import { users, complaints, comments, likes, cityStats, districtStats, hotSpots } from '../db/schema'
import { sql } from 'drizzle-orm'

const admin = new Hono()

// 简单的 API Key 验证（生产环境请使用更安全的方式）
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'deadyet-admin-2024'

admin.use('*', async (c, next) => {
  const apiKey = c.req.header('X-Admin-Key') || c.req.query('admin_key')
  if (apiKey !== ADMIN_API_KEY) {
    return c.json({ success: false, error: '未授权' }, 401)
  }
  await next()
})

/**
 * GET /admin/status
 * 获取数据库状态
 */
admin.get('/status', async (c) => {
  try {
    const [
      userCount,
      complaintCount,
      commentCount,
      likeCount,
      cityCount,
      districtCount,
      hotspotCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(complaints),
      db.select({ count: sql<number>`count(*)` }).from(comments),
      db.select({ count: sql<number>`count(*)` }).from(likes),
      db.select({ count: sql<number>`count(*)` }).from(cityStats),
      db.select({ count: sql<number>`count(*)` }).from(districtStats),
      db.select({ count: sql<number>`count(*)` }).from(hotSpots),
    ])
    
    return c.json({
      success: true,
      database: {
        users: userCount[0]?.count || 0,
        complaints: complaintCount[0]?.count || 0,
        comments: commentCount[0]?.count || 0,
        likes: likeCount[0]?.count || 0,
        cities: cityCount[0]?.count || 0,
        districts: districtCount[0]?.count || 0,
        hotspots: hotspotCount[0]?.count || 0,
      },
      config: {
        cities: CITY_CONFIGS.length,
        districts: DISTRICT_CONFIGS.length,
        hotspots: HOTSPOT_CONFIGS.length,
      }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * POST /admin/init/cities
 * 初始化城市统计数据
 */
admin.post('/init/cities', async (c) => {
  try {
    await dataGenerationService.initializeCityStats()
    return c.json({ success: true, message: `初始化了 ${CITY_CONFIGS.length} 个城市` })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * POST /admin/init/districts
 * 初始化区域统计数据
 */
admin.post('/init/districts', async (c) => {
  try {
    await dataGenerationService.initializeDistrictStats()
    return c.json({ success: true, message: `初始化了 ${DISTRICT_CONFIGS.length} 个区域` })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * POST /admin/init/hotspots
 * 初始化热门地点数据
 */
admin.post('/init/hotspots', async (c) => {
  try {
    await dataGenerationService.initializeHotSpots()
    return c.json({ success: true, message: `初始化了 ${HOTSPOT_CONFIGS.length} 个热门地点` })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * POST /admin/generate/users
 * 批量生成虚拟用户
 */
admin.post('/generate/users', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const count = body.count || 10000
    
    if (count > 500000) {
      return c.json({ success: false, error: '单次最多生成 50 万用户' }, 400)
    }
    
    const created = await dataGenerationService.generateUsers(count)
    return c.json({ success: true, created, message: `生成了 ${created} 个虚拟用户` })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * POST /admin/generate/complaints
 * 批量生成抱怨数据
 */
admin.post('/generate/complaints', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const count = body.count || 10000
    
    if (count > 200000) {
      return c.json({ success: false, error: '单次最多生成 20 万条抱怨' }, 400)
    }
    
    const created = await dataGenerationService.generateComplaints(count)
    return c.json({ success: true, created, message: `生成了 ${created} 条抱怨` })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * POST /admin/generate/comments
 * 为已有抱怨生成评论
 */
admin.post('/generate/comments', async (c) => {
  try {
    const created = await dataGenerationService.generateComments()
    return c.json({ success: true, created, message: `生成了 ${created} 条评论` })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * POST /admin/init/full
 * 完整初始化（一键生成所有数据）
 * 
 * 这是最常用的接口，会：
 * 1. 初始化城市/区域/热门地点
 * 2. 生成 30 万虚拟用户
 * 3. 生成 10 万条抱怨
 * 4. 为抱怨生成评论
 */
admin.post('/init/full', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const userCount = body.userCount || 300000
    const complaintCount = body.complaintCount || 100000
    
    const result = await dataGenerationService.fullInitialize({
      userCount,
      complaintCount,
    })
    
    return c.json({
      success: true,
      message: '完整初始化完成',
      result,
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * DELETE /admin/clear/all
 * 清空所有数据（危险操作！）
 */
admin.delete('/clear/all', async (c) => {
  try {
    const confirmKey = c.req.query('confirm')
    if (confirmKey !== 'YES_DELETE_EVERYTHING') {
      return c.json({ 
        success: false, 
        error: '需要确认参数：?confirm=YES_DELETE_EVERYTHING' 
      }, 400)
    }
    
    // 按顺序删除（考虑外键约束）
    await db.delete(comments)
    await db.delete(likes)
    await db.delete(complaints)
    await db.delete(users)
    await db.delete(hotSpots)
    await db.delete(districtStats)
    await db.delete(cityStats)
    
    return c.json({ success: true, message: '已清空所有数据' })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

export default admin
