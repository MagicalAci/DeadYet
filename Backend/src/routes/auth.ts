/**
 * 认证路由
 * 
 * 只需要邮箱，无需注册
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const auth = new Hono()

// 邮箱验证Schema
const emailSchema = z.object({
  email: z.string().email('邮箱格式不对，你是不是傻？'),
})

// 邮箱登录/注册
auth.post('/email', zValidator('json', emailSchema), async (c) => {
  const { email } = c.req.valid('json')
  
  // TODO: 从数据库查询或创建用户
  // const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  // if (!user) {
  //   user = await db.insert(users).values({ email }).returning()
  // }
  
  // 临时返回模拟数据
  const user = {
    id: 'user-' + Date.now(),
    email,
    nickname: null,
    avatarEmoji: '🐂',
    survivalDays: 1,
    totalCheckIns: 0,
    currentStreak: 0,
    longestStreak: 0,
    city: null,
    district: null,
    createdAt: new Date().toISOString(),
    lastCheckIn: null,
    bannerLevel: 'freshLeek',
  }
  
  return c.json({
    success: true,
    message: '欢迎加入牛马大军',
    user,
  })
})

// 获取用户信息
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader) {
    return c.json({
      error: '还没登录呢',
      message: '先输入你的工作邮箱',
    }, 401)
  }
  
  // TODO: 验证token并返回用户信息
  
  return c.json({
    id: 'user-123',
    email: 'test@company.com',
    survivalDays: 47,
  })
})

// 更新用户信息
auth.put('/me', async (c) => {
  const body = await c.req.json()
  
  // TODO: 更新用户信息
  
  return c.json({
    success: true,
    message: '信息已更新，虽然没什么卵用',
  })
})

// 登出
auth.post('/logout', async (c) => {
  return c.json({
    success: true,
    message: '走了？明天还得来',
  })
})

export default auth

