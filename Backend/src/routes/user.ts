/**
 * 用户 API
 * 
 * 支持：
 * - 手机号登录/注册（短信验证码）
 * - 可选资料设置（昵称、头像、工作年限等）
 * - 默认值自动生成
 */

import { Hono } from 'hono'
import { db } from '../db'
import { users } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { getRandomNickname, getRandomEmoji, INDUSTRIES, COMPANY_SIZES } from '../data/geoData'
import { nearbyService } from '../services/nearbyService'

const user = new Hono()

// ==================== 验证码存储（生产环境用 Redis）====================

const verificationCodes = new Map<string, { code: string, expireAt: number }>()

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ==================== 发送验证码 ====================

/**
 * POST /user/send-code
 * 发送短信验证码
 */
user.post('/send-code', async (c) => {
  try {
    const body = await c.req.json()
    const { phone } = body
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return c.json({ success: false, error: '手机号格式不正确' }, 400)
    }
    
    // 生成验证码
    const code = generateCode()
    const expireAt = Date.now() + 5 * 60 * 1000  // 5分钟有效
    
    verificationCodes.set(phone, { code, expireAt })
    
    // TODO: 接入真实短信服务（阿里云/腾讯云 SMS）
    // 开发环境直接返回验证码
    const isDev = process.env.NODE_ENV !== 'production'
    
    console.log(`📱 验证码发送: ${phone} -> ${code}`)
    
    return c.json({
      success: true,
      message: '验证码已发送',
      ...(isDev ? { code } : {}),  // 开发环境返回验证码
    })
  } catch (error) {
    console.error('发送验证码失败:', error)
    return c.json({ success: false, error: '发送失败' }, 500)
  }
})

// ==================== 手机号登录/注册 ====================

/**
 * POST /user/login
 * 手机号登录（验证码验证）
 */
user.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const { phone, code } = body
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return c.json({ success: false, error: '手机号格式不正确' }, 400)
    }
    
    // 验证验证码
    const stored = verificationCodes.get(phone)
    
    // 开发环境允许万能验证码
    const isDev = process.env.NODE_ENV !== 'production'
    const isValidCode = (isDev && code === '000000') || 
                        (stored && stored.code === code && stored.expireAt > Date.now())
    
    if (!isValidCode) {
      return c.json({ success: false, error: '验证码错误或已过期' }, 400)
    }
    
    // 清除验证码
    verificationCodes.delete(phone)
    
    // 查找或创建用户
    let existingUser = await db.select().from(users).where(eq(users.phone, phone)).limit(1)
    
    let userData
    let isNewUser = false
    
    if (existingUser.length === 0) {
      // 新用户 - 创建账号
      isNewUser = true
      const newUser = await db.insert(users).values({
        phone,
        nickname: getRandomNickname(),
        avatarEmoji: getRandomEmoji(),
        workYears: 1,
        isVirtual: false,
      }).returning()
      
      userData = newUser[0]
    } else {
      userData = existingUser[0]
      
      // 更新最后活跃时间
      await db.update(users)
        .set({ lastActiveAt: new Date() })
        .where(eq(users.id, userData.id))
    }
    
    // 生成 Token（简单实现，生产环境用 JWT）
    const token = Buffer.from(`${userData.id}:${Date.now()}`).toString('base64')
    
    return c.json({
      success: true,
      isNewUser,
      user: {
        id: userData.id,
        phone: userData.phone,
        nickname: userData.nickname,
        avatarEmoji: userData.avatarEmoji,
        workYears: userData.workYears,
        industry: userData.industry,
        companySize: userData.companySize,
        city: userData.city,
        district: userData.district,
        survivalDays: userData.survivalDays,
        totalCheckIns: userData.totalCheckIns,
        currentStreak: userData.currentStreak,
        longestStreak: userData.longestStreak,
      },
      token,
    })
  } catch (error) {
    console.error('登录失败:', error)
    return c.json({ success: false, error: '登录失败' }, 500)
  }
})

// ==================== 更新用户资料 ====================

/**
 * PUT /user/profile
 * 更新用户资料（可部分更新）
 */
user.put('/profile', async (c) => {
  try {
    // 从 header 获取用户 ID（简单实现）
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ success: false, error: '未登录' }, 401)
    }
    
    const userId = Buffer.from(token, 'base64').toString().split(':')[0]
    
    const body = await c.req.json()
    const {
      nickname,
      avatarEmoji,
      workYears,
      industry,
      companySize,
      jobTitle,
      city,
      district,
      locationPrivacy,
    } = body
    
    // 构建更新对象
    const updates: Record<string, any> = {}
    
    if (nickname !== undefined) {
      if (nickname.length > 20) {
        return c.json({ success: false, error: '昵称最多20个字符' }, 400)
      }
      updates.nickname = nickname || getRandomNickname()
    }
    
    if (avatarEmoji !== undefined) {
      updates.avatarEmoji = avatarEmoji || getRandomEmoji()
    }
    
    if (workYears !== undefined) {
      const years = parseInt(workYears)
      if (isNaN(years) || years < 0 || years > 50) {
        return c.json({ success: false, error: '工作年限无效' }, 400)
      }
      updates.workYears = years
    }
    
    if (industry !== undefined) {
      if (industry && !INDUSTRIES.some(i => i.name === industry)) {
        return c.json({ success: false, error: '行业无效' }, 400)
      }
      updates.industry = industry
    }
    
    if (companySize !== undefined) {
      if (companySize && !COMPANY_SIZES.some(s => s.name === companySize)) {
        return c.json({ success: false, error: '公司规模无效' }, 400)
      }
      updates.companySize = companySize
    }
    
    if (jobTitle !== undefined) {
      updates.jobTitle = jobTitle
    }
    
    if (city !== undefined) {
      updates.city = city
    }
    
    if (district !== undefined) {
      updates.district = district
    }
    
    if (locationPrivacy !== undefined) {
      if (!['exact', 'district', 'city', 'hidden'].includes(locationPrivacy)) {
        return c.json({ success: false, error: '位置隐私设置无效' }, 400)
      }
      updates.locationPrivacy = locationPrivacy
    }
    
    if (Object.keys(updates).length === 0) {
      return c.json({ success: false, error: '没有要更新的内容' }, 400)
    }
    
    // 执行更新
    const updated = await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning()
    
    if (updated.length === 0) {
      return c.json({ success: false, error: '用户不存在' }, 404)
    }
    
    const userData = updated[0]
    
    return c.json({
      success: true,
      user: {
        id: userData.id,
        phone: userData.phone,
        nickname: userData.nickname,
        avatarEmoji: userData.avatarEmoji,
        workYears: userData.workYears,
        industry: userData.industry,
        companySize: userData.companySize,
        jobTitle: userData.jobTitle,
        city: userData.city,
        district: userData.district,
        locationPrivacy: userData.locationPrivacy,
      },
    })
  } catch (error) {
    console.error('更新资料失败:', error)
    return c.json({ success: false, error: '更新失败' }, 500)
  }
})

// ==================== 获取用户资料 ====================

/**
 * GET /user/profile
 * 获取当前用户资料
 */
user.get('/profile', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ success: false, error: '未登录' }, 401)
    }
    
    const userId = Buffer.from(token, 'base64').toString().split(':')[0]
    
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (result.length === 0) {
      return c.json({ success: false, error: '用户不存在' }, 404)
    }
    
    const userData = result[0]
    
    return c.json({
      success: true,
      user: {
        id: userData.id,
        phone: userData.phone,
        nickname: userData.nickname,
        avatarEmoji: userData.avatarEmoji,
        workYears: userData.workYears,
        industry: userData.industry,
        companySize: userData.companySize,
        jobTitle: userData.jobTitle,
        city: userData.city,
        district: userData.district,
        locationPrivacy: userData.locationPrivacy,
        survivalDays: userData.survivalDays,
        totalCheckIns: userData.totalCheckIns,
        currentStreak: userData.currentStreak,
        longestStreak: userData.longestStreak,
        createdAt: userData.createdAt,
      },
    })
  } catch (error) {
    console.error('获取资料失败:', error)
    return c.json({ success: false, error: '获取失败' }, 500)
  }
})

// ==================== 更新位置 ====================

/**
 * POST /user/location
 * 更新用户位置
 */
user.post('/location', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ success: false, error: '未登录' }, 401)
    }
    
    const userId = Buffer.from(token, 'base64').toString().split(':')[0]
    
    const body = await c.req.json()
    const { latitude, longitude, city, district } = body
    
    if (!latitude || !longitude) {
      return c.json({ success: false, error: '缺少位置信息' }, 400)
    }
    
    await nearbyService.updateUserLocation(userId, latitude, longitude)
    
    // 如果提供了城市信息，也更新
    if (city) {
      await db.update(users)
        .set({ city, district })
        .where(eq(users.id, userId))
    }
    
    return c.json({ success: true, message: '位置已更新' })
  } catch (error) {
    console.error('更新位置失败:', error)
    return c.json({ success: false, error: '更新失败' }, 500)
  }
})

// ==================== 获取附近用户 ====================

/**
 * GET /user/nearby
 * 获取附近的用户
 */
user.get('/nearby', async (c) => {
  try {
    const latStr = c.req.query('latitude')
    const lonStr = c.req.query('longitude')
    const radiusStr = c.req.query('radius') || '1000'  // 默认1公里
    const limitStr = c.req.query('limit') || '20'
    
    if (!latStr || !lonStr) {
      return c.json({ success: false, error: '缺少位置信息' }, 400)
    }
    
    const latitude = parseFloat(latStr)
    const longitude = parseFloat(lonStr)
    const radius = parseInt(radiusStr)
    const limit = parseInt(limitStr)
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return c.json({ success: false, error: '位置信息无效' }, 400)
    }
    
    const result = await nearbyService.getNearbyUsers({
      latitude,
      longitude,
      radiusMeters: Math.min(radius, 5000),  // 最大5公里
      limit: Math.min(limit, 50),  // 最多50个
      includeVirtual: true,
    })
    
    return c.json({
      success: true,
      ...result,
      radius,
    })
  } catch (error) {
    console.error('获取附近用户失败:', error)
    return c.json({ success: false, error: '获取失败' }, 500)
  }
})

// ==================== 获取配置选项 ====================

/**
 * GET /user/options
 * 获取行业、公司规模等配置选项
 */
user.get('/options', (c) => {
  return c.json({
    success: true,
    industries: INDUSTRIES.map(i => i.name),
    companySizes: COMPANY_SIZES.map(s => ({ name: s.name, description: s.description })),
    avatarEmojis: [
      '🐂', '🐴', '🐕', '🐷', '🦊', '🐱', '🐰', '🐻', '🐼', '🦁',
      '🐯', '🐸', '🐔', '🐧', '🦆', '🦉', '🐺', '🐵', '🙈', '🐶',
      '🦄', '🐲', '🦋', '🐝', '🐢', '🦀', '🐙', '🦑', '🦐', '🐳',
    ],
  })
})

export default user
