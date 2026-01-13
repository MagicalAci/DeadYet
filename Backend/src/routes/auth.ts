/**
 * 认证路由
 */

import { Hono } from 'hono'
import userService from '../services/userService.js'

const auth = new Hono()

// 邮箱登录/注册
auth.post('/email', async (c) => {
  try {
    const { email } = await c.req.json()
    
    if (!email) {
      return c.json({
        success: false,
        error: '邮箱呢？填一下',
      }, 400)
    }
    
    // 验证邮箱格式
    const emailRegex = /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}$/
    if (!emailRegex.test(email)) {
      return c.json({
        success: false,
        error: '邮箱格式不对，你是不是傻？',
      }, 400)
    }
    
    const { user, isNew } = await userService.loginWithEmail(email)
    
    return c.json({
      success: true,
      message: isNew ? '欢迎加入牛马大军！' : '又来打卡了？真是敬业！',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatarEmoji: user.avatarEmoji,
        survivalDays: user.survivalDays,
        totalCheckIns: user.totalCheckIns,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        city: user.city,
        district: user.district,
        createdAt: user.createdAt?.toISOString(),
        lastCheckIn: user.lastCheckIn?.toISOString(),
      },
      // TODO: 生成 JWT token
      token: null,
    })
    
  } catch (error) {
    console.error('登录失败:', error)
    return c.json({
      success: false,
      error: '登录失败',
      message: (error as Error).message,
    }, 500)
  }
})

// 获取用户信息
auth.get('/profile', async (c) => {
  try {
    const userId = c.req.header('X-User-Id')
    
    if (!userId) {
      return c.json({
        success: false,
        error: '未提供用户ID',
      }, 401)
    }
    
    const user = await userService.getUser(userId)
    
    if (!user) {
      return c.json({
        success: false,
        error: '用户不存在',
      }, 404)
    }
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatarEmoji: user.avatarEmoji,
        survivalDays: user.survivalDays,
        totalCheckIns: user.totalCheckIns,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        city: user.city,
        district: user.district,
        createdAt: user.createdAt?.toISOString(),
        lastCheckIn: user.lastCheckIn?.toISOString(),
      },
    })
    
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return c.json({
      success: false,
      error: '获取用户信息失败',
    }, 500)
  }
})

// 更新用户信息
auth.put('/profile', async (c) => {
  try {
    const userId = c.req.header('X-User-Id')
    
    if (!userId) {
      return c.json({
        success: false,
        error: '未提供用户ID',
      }, 401)
    }
    
    const data = await c.req.json()
    
    const user = await userService.updateUser(userId, {
      nickname: data.nickname,
      avatarEmoji: data.avatarEmoji,
      city: data.city,
      district: data.district,
    })
    
    if (!user) {
      return c.json({
        success: false,
        error: '用户不存在',
      }, 404)
    }
    
    return c.json({
      success: true,
      message: '更新成功',
      user,
    })
    
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return c.json({
      success: false,
      error: '更新失败',
    }, 500)
  }
})

export default auth
