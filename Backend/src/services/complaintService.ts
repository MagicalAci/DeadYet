/**
 * 抱怨/吐槽服务
 */

import { eq, desc, and, sql, or, inArray } from 'drizzle-orm'
import { db, complaints, likes, comments, users, type Complaint, type NewComplaint, type Like, type Comment, type NewComment } from '../db/index.js'

// 随机昵称
const nicknames = [
  '匿名牛马', '加班狗', '社畜一号', '韭菜本菜', '打工人',
  '苦逼程序员', 'PPT战士', 'Excel大师', '会议室常客', '卑微打工仔',
  '摸鱼专家', '带薪拉屎', '划水达人', '职场老油条', '牛马本马'
]

// 随机Emoji
const emojis = ['🐂', '🐴', '🐕', '🐷', '🦊', '🐱', '🐰', '🐻', '🐼', '🦁']

export const complaintService = {
  
  // 获取抱怨列表
  async getComplaints(options: {
    city?: string
    district?: string
    category?: string
    limit?: number
    offset?: number
  }): Promise<{ complaints: Complaint[]; total: number }> {
    const { city, district, category, limit = 50, offset = 0 } = options
    
    // 构建查询条件
    const conditions = []
    if (city) conditions.push(eq(complaints.city, city))
    if (district) conditions.push(eq(complaints.district, district))
    if (category) conditions.push(eq(complaints.category, category))
    conditions.push(eq(complaints.status, 'active'))
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    
    // 查询数据
    const data = await db.query.complaints.findMany({
      where: whereClause,
      orderBy: [desc(complaints.createdAt)],
      limit,
      offset,
    })
    
    // 查询总数
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(whereClause)
    
    return { complaints: data, total: Number(count) }
  },
  
  // 获取单个抱怨
  async getComplaint(id: string): Promise<Complaint | null> {
    const complaint = await db.query.complaints.findFirst({
      where: eq(complaints.id, id)
    })
    return complaint || null
  },
  
  // 创建抱怨
  async createComplaint(data: {
    userId: string
    contentType?: 'text' | 'voice'
    content?: string
    voiceUrl?: string
    voiceDuration?: number
    category?: string
    city?: string
    district?: string
    spotName?: string
    latitude?: number
    longitude?: number
  }): Promise<Complaint> {
    // 获取用户信息
    const user = await db.query.users.findFirst({
      where: eq(users.id, data.userId)
    })
    
    const newComplaint: NewComplaint = {
      userId: data.userId,
      contentType: data.contentType || 'text',
      content: data.content,
      voiceUrl: data.voiceUrl,
      voiceDuration: data.voiceDuration,
      category: data.category || 'general',
      city: data.city,
      district: data.district,
      spotName: data.spotName,
      latitude: data.latitude,
      longitude: data.longitude,
      userNickname: user?.nickname || nicknames[Math.floor(Math.random() * nicknames.length)],
      userEmoji: user?.avatarEmoji || emojis[Math.floor(Math.random() * emojis.length)],
      isAnonymous: true,
    }
    
    const [complaint] = await db.insert(complaints).values(newComplaint).returning()
    
    return complaint
  },
  
  // 点赞
  async likeComplaint(userId: string, complaintId: string): Promise<{ success: boolean; likes: number }> {
    // 检查是否已点赞
    const existingLike = await db.query.likes.findFirst({
      where: and(
        eq(likes.userId, userId),
        eq(likes.complaintId, complaintId)
      )
    })
    
    if (existingLike) {
      return { success: false, likes: 0 }
    }
    
    // 添加点赞
    await db.insert(likes).values({ userId, complaintId })
    
    // 更新点赞数
    const [updated] = await db.update(complaints)
      .set({ likesCount: sql`${complaints.likesCount} + 1` })
      .where(eq(complaints.id, complaintId))
      .returning()
    
    return { success: true, likes: updated.likesCount }
  },
  
  // 取消点赞
  async unlikeComplaint(userId: string, complaintId: string): Promise<{ success: boolean }> {
    const result = await db.delete(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.complaintId, complaintId)
      ))
    
    if (result.rowCount && result.rowCount > 0) {
      await db.update(complaints)
        .set({ likesCount: sql`${complaints.likesCount} - 1` })
        .where(eq(complaints.id, complaintId))
      
      return { success: true }
    }
    
    return { success: false }
  },
  
  // 检查点赞状态
  async getLikeStatus(userId: string, complaintId: string): Promise<boolean> {
    const like = await db.query.likes.findFirst({
      where: and(
        eq(likes.userId, userId),
        eq(likes.complaintId, complaintId)
      )
    })
    return !!like
  },
  
  // 获取评论列表
  async getComments(complaintId: string): Promise<Comment[]> {
    return db.query.comments.findMany({
      where: and(
        eq(comments.complaintId, complaintId),
        eq(comments.status, 'active')
      ),
      orderBy: [desc(comments.createdAt)],
    })
  },
  
  // 添加评论
  async addComment(data: {
    userId: string
    complaintId: string
    parentId?: string
    contentType?: 'text' | 'voice'
    content?: string
    voiceUrl?: string
    voiceDuration?: number
  }): Promise<Comment> {
    // 获取用户信息
    const user = await db.query.users.findFirst({
      where: eq(users.id, data.userId)
    })
    
    const newComment: NewComment = {
      userId: data.userId,
      complaintId: data.complaintId,
      parentId: data.parentId,
      contentType: data.contentType || 'text',
      content: data.content,
      voiceUrl: data.voiceUrl,
      voiceDuration: data.voiceDuration,
      userNickname: user?.nickname || nicknames[Math.floor(Math.random() * nicknames.length)],
      userEmoji: user?.avatarEmoji || emojis[Math.floor(Math.random() * emojis.length)],
    }
    
    const [comment] = await db.insert(comments).values(newComment).returning()
    
    // 更新评论数
    await db.update(complaints)
      .set({ commentsCount: sql`${complaints.commentsCount} + 1` })
      .where(eq(complaints.id, data.complaintId))
    
    return comment
  },
  
  // 获取附近的抱怨
  async getNearbyComplaints(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    limit: number = 20
  ): Promise<Complaint[]> {
    // 简单的距离计算（使用经纬度差）
    const latDiff = radiusKm / 111 // 1度纬度约111公里
    const lonDiff = radiusKm / (111 * Math.cos(latitude * Math.PI / 180))
    
    return db.query.complaints.findMany({
      where: and(
        sql`${complaints.latitude} BETWEEN ${latitude - latDiff} AND ${latitude + latDiff}`,
        sql`${complaints.longitude} BETWEEN ${longitude - lonDiff} AND ${longitude + lonDiff}`,
        eq(complaints.status, 'active')
      ),
      orderBy: [desc(complaints.createdAt)],
      limit,
    })
  },
}

export default complaintService
