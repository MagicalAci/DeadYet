/**
 * 数据库连接配置
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

// 数据库连接字符串
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/deadyet'

// 创建连接
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

// 创建 Drizzle 实例
export const db = drizzle(client, { schema })

// 导出 schema
export * from './schema.js'

// 检查数据库连接
export async function checkConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`
    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}
