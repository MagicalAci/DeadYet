/**
 * 数据库Schema定义
 * 使用 Drizzle ORM
 */

import { pgTable, uuid, varchar, text, integer, boolean, timestamp, doublePrecision, jsonb } from 'drizzle-orm/pg-core'

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  nickname: varchar('nickname', { length: 50 }),
  avatarEmoji: varchar('avatar_emoji', { length: 10 }).default('🐂'),
  survivalDays: integer('survival_days').default(0),
  totalCheckIns: integer('total_check_ins').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  city: varchar('city', { length: 50 }),
  district: varchar('district', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  lastCheckIn: timestamp('last_check_in'),
  pushEnabled: boolean('push_enabled').default(true),
  deviceToken: varchar('device_token', { length: 255 }),
})

// 签到记录表
export const checkIns = pgTable('check_ins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  checkInTime: timestamp('check_in_time').notNull().defaultNow(),
  complaint: text('complaint'),
  voiceComplaintUrl: varchar('voice_complaint_url', { length: 500 }),
  aiResponse: text('ai_response'),
  bannerGenerated: boolean('banner_generated').default(false),
  mood: varchar('mood', { length: 20 }).default('neutral'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  city: varchar('city', { length: 50 }),
  district: varchar('district', { length: 50 }),
})

// 抱怨表
export const complaints = pgTable('complaints', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  aiResponse: text('ai_response'),
  category: varchar('category', { length: 20 }).default('general'),
  isAnonymous: boolean('is_anonymous').default(true),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  city: varchar('city', { length: 50 }),
  district: varchar('district', { length: 50 }),
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

// 城市统计表（缓存）
export const cityStats = pgTable('city_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  city: varchar('city', { length: 50 }).notNull().unique(),
  totalWorkers: integer('total_workers').default(0),
  checkedIn: integer('checked_in').default(0),
  stillWorking: integer('still_working').default(0),
  averageCheckOutTime: varchar('average_check_out_time', { length: 10 }),
  topComplaint: text('top_complaint'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 推送记录表
export const pushLogs = pgTable('push_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(), // battle_report, reminder, etc
  content: jsonb('content'),
  sentAt: timestamp('sent_at').defaultNow(),
  recipientCount: integer('recipient_count').default(0),
})

// 类型导出
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type CheckIn = typeof checkIns.$inferSelect
export type NewCheckIn = typeof checkIns.$inferInsert
export type Complaint = typeof complaints.$inferSelect
export type NewComplaint = typeof complaints.$inferInsert
export type CityStats = typeof cityStats.$inferSelect

