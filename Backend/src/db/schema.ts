/**
 * 数据库Schema定义
 * 使用 Drizzle ORM
 */

import { pgTable, uuid, varchar, text, integer, boolean, timestamp, doublePrecision, jsonb, index } from 'drizzle-orm/pg-core'

// ==================== 用户相关 ====================

// 用户表（支持手机号注册+可选资料）
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // === 登录凭证 ===
  phone: varchar('phone', { length: 20 }).unique(),           // 手机号（主要登录方式）
  email: varchar('email', { length: 255 }).unique(),          // 邮箱（备选）
  
  // === 基本资料（可选，有默认值）===
  nickname: varchar('nickname', { length: 50 }),              // 昵称
  avatarEmoji: varchar('avatar_emoji', { length: 10 }).default('🐂'),  // 头像emoji
  workYears: integer('work_years').default(1),                // 工作年限（默认1年）
  
  // === 可选详细资料 ===
  industry: varchar('industry', { length: 30 }),              // 行业：互联网/金融/制造/教育/医疗/其他
  companySize: varchar('company_size', { length: 20 }),       // 公司规模：创业/中小/大厂/外企/国企
  jobTitle: varchar('job_title', { length: 50 }),             // 职位
  
  // === 位置信息 ===
  city: varchar('city', { length: 50 }),
  district: varchar('district', { length: 50 }),
  lastLatitude: doublePrecision('last_latitude'),             // 最后位置
  lastLongitude: doublePrecision('last_longitude'),
  locationPrivacy: varchar('location_privacy', { length: 20 }).default('district'),  // exact/district/city/hidden
  
  // === 统计数据 ===
  survivalDays: integer('survival_days').default(0),
  totalCheckIns: integer('total_check_ins').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  
  // === 元数据 ===
  isVirtual: boolean('is_virtual').default(false),            // 是否虚拟用户
  createdAt: timestamp('created_at').defaultNow(),
  lastCheckIn: timestamp('last_check_in'),
  lastActiveAt: timestamp('last_active_at'),                  // 最后活跃时间
  
  // === 推送 ===
  pushEnabled: boolean('push_enabled').default(true),
  deviceToken: varchar('device_token', { length: 255 }),
}, (table) => ({
  phoneIdx: index('users_phone_idx').on(table.phone),
  cityIdx: index('users_city_idx').on(table.city),
  locationIdx: index('users_location_idx').on(table.lastLatitude, table.lastLongitude),
}))

// ==================== 签到相关 ====================

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

// ==================== 抱怨/吐槽相关 ====================

// 抱怨表（核心内容表）
export const complaints = pgTable('complaints', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  // 内容类型：text 或 voice
  contentType: varchar('content_type', { length: 10 }).notNull().default('text'),
  
  // 文本内容（文本类型时使用）
  content: text('content'),
  
  // 语音内容（语音类型时使用）
  voiceUrl: varchar('voice_url', { length: 500 }),      // 语音文件 URL
  voiceDuration: integer('voice_duration'),              // 语音时长（秒）
  
  // AI 生成标记
  isAiGenerated: boolean('is_ai_generated').default(false),
  aiModel: varchar('ai_model', { length: 50 }),          // 使用的 AI 模型
  
  // 分类和标签
  category: varchar('category', { length: 20 }).default('general'),
  tags: jsonb('tags').$type<string[]>(),
  
  // 用户信息（冗余，提高查询效率）
  userNickname: varchar('user_nickname', { length: 50 }),
  userEmoji: varchar('user_emoji', { length: 10 }).default('🐂'),
  isAnonymous: boolean('is_anonymous').default(true),
  
  // 位置信息
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  city: varchar('city', { length: 50 }),
  district: varchar('district', { length: 50 }),
  spotName: varchar('spot_name', { length: 100 }),       // 具体地点名称
  
  // 互动统计
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  sharesCount: integer('shares_count').default(0),
  
  // AI 回复
  aiResponse: text('ai_response'),
  
  // 状态
  status: varchar('status', { length: 20 }).default('active'), // active, hidden, deleted
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  cityIdx: index('complaints_city_idx').on(table.city),
  districtIdx: index('complaints_district_idx').on(table.district),
  createdAtIdx: index('complaints_created_at_idx').on(table.createdAt),
  categoryIdx: index('complaints_category_idx').on(table.category),
}))

// 点赞表
export const likes = pgTable('likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  complaintId: uuid('complaint_id').notNull().references(() => complaints.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userComplaintIdx: index('likes_user_complaint_idx').on(table.userId, table.complaintId),
}))

// 评论表
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  complaintId: uuid('complaint_id').notNull().references(() => complaints.id),
  parentId: uuid('parent_id'),                           // 回复某条评论
  
  // 内容类型
  contentType: varchar('content_type', { length: 10 }).notNull().default('text'),
  content: text('content'),
  voiceUrl: varchar('voice_url', { length: 500 }),
  voiceDuration: integer('voice_duration'),
  
  // 用户信息（冗余）
  userNickname: varchar('user_nickname', { length: 50 }),
  userEmoji: varchar('user_emoji', { length: 10 }).default('🐂'),
  
  // 互动
  likesCount: integer('likes_count').default(0),
  
  // AI 生成标记
  isAiGenerated: boolean('is_ai_generated').default(false),
  
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  complaintIdx: index('comments_complaint_idx').on(table.complaintId),
}))

// ==================== 地理数据 ====================

// 城市统计表
export const cityStats = pgTable('city_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  city: varchar('city', { length: 50 }).notNull().unique(),
  province: varchar('province', { length: 50 }),
  tier: integer('tier').default(3),                      // 城市等级 1=一线 2=新一线 3=二线
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  
  // 实时统计
  totalWorkers: integer('total_workers').default(0),
  checkedIn: integer('checked_in').default(0),
  stillWorking: integer('still_working').default(0),
  averageCheckOutTime: varchar('average_check_out_time', { length: 10 }),
  topComplaint: text('top_complaint'),
  
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 区级统计表
export const districtStats = pgTable('district_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  city: varchar('city', { length: 50 }).notNull(),
  district: varchar('district', { length: 50 }).notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  
  totalWorkers: integer('total_workers').default(0),
  checkedIn: integer('checked_in').default(0),
  stillWorking: integer('still_working').default(0),
  averageCheckOutTime: varchar('average_check_out_time', { length: 10 }),
  
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  cityIdx: index('district_stats_city_idx').on(table.city),
}))

// 热门地点表
export const hotSpots = pgTable('hot_spots', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).default('office'), // techPark, cbd, industrial, office
  city: varchar('city', { length: 50 }).notNull(),
  district: varchar('district', { length: 50 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  
  // 统计
  totalWorkers: integer('total_workers').default(0),
  checkedIn: integer('checked_in').default(0),
  stillWorking: integer('still_working').default(0),
  averageCheckOutTime: varchar('average_check_out_time', { length: 10 }),
  
  // 标签
  tags: jsonb('tags').$type<string[]>(),
  
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  cityIdx: index('hot_spots_city_idx').on(table.city),
}))

// ==================== AI 内容生成 ====================

// AI 生成任务表
export const aiGenerationTasks = pgTable('ai_generation_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // 任务类型：text_complaint, voice_complaint, comment, ai_response
  taskType: varchar('task_type', { length: 30 }).notNull(),
  
  // 生成参数
  params: jsonb('params').$type<{
    category?: string
    city?: string
    mood?: string
    count?: number
    voiceDuration?: number
  }>(),
  
  // 状态：pending, processing, completed, failed
  status: varchar('status', { length: 20 }).default('pending'),
  
  // 结果
  resultCount: integer('result_count').default(0),
  errorMessage: text('error_message'),
  
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
})

// AI 生成的内容模板库
export const contentTemplates = pgTable('content_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // 类型：complaint, comment, ai_response
  type: varchar('type', { length: 20 }).notNull(),
  
  // 分类
  category: varchar('category', { length: 20 }),
  
  // 内容
  content: text('content').notNull(),
  
  // 情感：angry, tired, numb, neutral, relieved
  mood: varchar('mood', { length: 20 }),
  
  // 使用次数（用于去重和热度统计）
  usageCount: integer('usage_count').default(0),
  
  // 是否为语音模板
  isVoiceTemplate: boolean('is_voice_template').default(false),
  voiceDuration: integer('voice_duration'),              // 建议时长
  
  createdAt: timestamp('created_at').defaultNow(),
})

// ==================== 推送相关 ====================

// 推送记录表
export const pushLogs = pgTable('push_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(),       // battle_report, reminder, etc
  content: jsonb('content'),
  sentAt: timestamp('sent_at').defaultNow(),
  recipientCount: integer('recipient_count').default(0),
})

// ==================== 类型导出 ====================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type CheckIn = typeof checkIns.$inferSelect
export type NewCheckIn = typeof checkIns.$inferInsert

export type Complaint = typeof complaints.$inferSelect
export type NewComplaint = typeof complaints.$inferInsert

export type Like = typeof likes.$inferSelect
export type NewLike = typeof likes.$inferInsert

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert

export type CityStats = typeof cityStats.$inferSelect
export type DistrictStats = typeof districtStats.$inferSelect
export type HotSpot = typeof hotSpots.$inferSelect

export type AiGenerationTask = typeof aiGenerationTasks.$inferSelect
export type ContentTemplate = typeof contentTemplates.$inferSelect
