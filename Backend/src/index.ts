/**
 * DeadYet API - 还没死？后端服务
 * 
 * 打工人的毒舌下班签到APP
 */

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

// Routes
import authRoutes from './routes/auth.js'
import checkInRoutes from './routes/checkin.js'
import mapRoutes from './routes/map.js'
import complaintsRoutes from './routes/complaints.js'
import aiRoutes from './routes/ai.js'
import pushRoutes from './routes/push.js'
import uploadRoutes from './routes/upload.js'
import contentRoutes from './routes/content.js'
import realtimeRoutes from './routes/realtime.js'
import adminRoutes from './routes/admin.js'

const app = new Hono()

// 中间件
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 健康检查
app.get('/', (c) => {
  return c.json({
    name: '还没死？API',
    version: '2.0.0',
    status: '运行中',
    message: '欢迎来到牛马世界 🐂🐴',
    endpoints: {
      auth: '/api/auth',
      checkin: '/api/checkin',
      map: '/api/map',
      complaints: '/api/complaints',
      ai: '/api/ai',
      push: '/api/push',
      realtime: '/api/realtime - 实时数据API',
      admin: '/api/admin - 管理员API（需要API Key）'
    }
  })
})

app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API路由
app.route('/api/auth', authRoutes)
app.route('/api/checkin', checkInRoutes)
app.route('/api/map', mapRoutes)
app.route('/api/complaints', complaintsRoutes)
app.route('/api/ai', aiRoutes)
app.route('/api/push', pushRoutes)
app.route('/api/upload', uploadRoutes)
app.route('/api/content', contentRoutes)
app.route('/api/realtime', realtimeRoutes)
app.route('/api/admin', adminRoutes)

// 设计资源上传页面
app.get('/upload', (c) => {
  return c.redirect('/api/upload')
})

// 404处理
app.notFound((c) => {
  return c.json({
    error: '找不到这个接口',
    message: '你是不是迷路了？和你的人生一样',
    path: c.req.path
  }, 404)
})

// 错误处理
app.onError((err, c) => {
  console.error('服务器错误:', err)
  return c.json({
    error: '服务器炸了',
    message: '和你的工作热情一样',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500)
})

// 启动服务器 - Zeabur 默认使用 8080 端口
const port = parseInt(process.env.PORT || '8080')

console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║   🐂 还没死？API 启动中...               ║
║                                          ║
║   端口: ${port}                            ║
║   环境: ${process.env.NODE_ENV || 'development'}                  ║
║                                          ║
║   准备好接收牛马们的签到了！             ║
║                                          ║
╚══════════════════════════════════════════╝
`)

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0', // 允许外部访问
})

