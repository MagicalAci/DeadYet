/**
 * 数据库连接配置
 * 
 * 支持无数据库模式：如果没有配置 DATABASE_URL，使用 mock 数据
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

// 数据库连接字符串
const connectionString = process.env.DATABASE_URL

// 是否启用数据库
export const isDatabaseEnabled = !!connectionString

let client: any = null
let db: any = null

if (connectionString) {
  try {
    // 创建连接
    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
    
    // 创建 Drizzle 实例
    db = drizzle(client, { schema })
    console.log('✅ 数据库模式：已配置 DATABASE_URL')
  } catch (error) {
    console.error('❌ 数据库连接创建失败:', error)
    db = null
  }
} else {
  console.log('⚠️ 无数据库模式：未配置 DATABASE_URL，使用 Mock 数据')
}

export { db }

// 导出 schema
export * from './schema.js'

// 检查数据库连接
export async function checkConnection(): Promise<boolean> {
  if (!client || !connectionString) {
    console.log('⚠️ 数据库未配置，跳过连接检查')
    return false
  }
  
  try {
    await client`SELECT 1`
    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}
