/**
 * 抱怨路由
 */

import { Hono } from 'hono'
import complaintService from '../services/complaintService.js'

const complaints = new Hono()

// 获取抱怨列表
complaints.get('/', async (c) => {
  try {
    const city = c.req.query('city')
    const district = c.req.query('district')
    const category = c.req.query('category')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const result = await complaintService.getComplaints({
      city,
      district,
      category,
      limit,
      offset,
    })
    
    return c.json({
      success: true,
      complaints: result.complaints.map(complaint => ({
        id: complaint.id,
        userId: complaint.userId,
        userNickname: complaint.userNickname,
        userEmoji: complaint.userEmoji,
        contentType: complaint.contentType,
        content: complaint.content,
        voiceUrl: complaint.voiceUrl,
        voiceDuration: complaint.voiceDuration,
        category: complaint.category,
        city: complaint.city,
        district: complaint.district,
        spotName: complaint.spotName,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        likes: complaint.likesCount,
        comments: complaint.commentsCount,
        isAiGenerated: complaint.isAiGenerated,
        aiResponse: complaint.aiResponse,
        createdAt: complaint.createdAt?.toISOString(),
      })),
      total: result.total,
    })
    
  } catch (error) {
    console.error('获取抱怨列表失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 获取单个抱怨
complaints.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const complaint = await complaintService.getComplaint(id)
    
    if (!complaint) {
      return c.json({
        success: false,
        error: '抱怨不存在，可能已被删除',
      }, 404)
    }
    
    return c.json({
      success: true,
      data: complaint,
    })
    
  } catch (error) {
    console.error('获取抱怨失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 发布抱怨
complaints.post('/', async (c) => {
  try {
    const data = await c.req.json()
    
    if (!data.userId) {
      return c.json({
        success: false,
        error: '用户ID呢？',
      }, 400)
    }
    
    if (!data.content && !data.voiceUrl) {
      return c.json({
        success: false,
        error: '得写点什么或者说点什么吧',
      }, 400)
    }
    
    const complaint = await complaintService.createComplaint({
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
    })
    
    return c.json({
      success: true,
      message: '发布成功，骂得好！',
      data: complaint,
    })
    
  } catch (error) {
    console.error('发布抱怨失败:', error)
    return c.json({
      success: false,
      error: '发布失败',
    }, 500)
  }
})

// 点赞
complaints.post('/:id/like', async (c) => {
  try {
    const complaintId = c.req.param('id')
    const userId = c.req.header('X-User-Id')
    
    if (!userId) {
      return c.json({
        success: false,
        error: '需要登录',
      }, 401)
    }
    
    const result = await complaintService.likeComplaint(userId, complaintId)
    
    if (!result.success) {
      return c.json({
        success: false,
        error: '已经点过赞了',
      }, 400)
    }
    
    return c.json({
      success: true,
      message: '点赞成功',
      likes: result.likes,
    })
    
  } catch (error) {
    console.error('点赞失败:', error)
    return c.json({
      success: false,
      error: '点赞失败',
    }, 500)
  }
})

// 取消点赞
complaints.delete('/:id/like', async (c) => {
  try {
    const complaintId = c.req.param('id')
    const userId = c.req.header('X-User-Id')
    
    if (!userId) {
      return c.json({
        success: false,
        error: '需要登录',
      }, 401)
    }
    
    const result = await complaintService.unlikeComplaint(userId, complaintId)
    
    return c.json({
      success: result.success,
      message: result.success ? '取消点赞成功' : '还没点过赞',
    })
    
  } catch (error) {
    console.error('取消点赞失败:', error)
    return c.json({
      success: false,
      error: '取消点赞失败',
    }, 500)
  }
})

// 获取点赞状态
complaints.get('/:id/like/status', async (c) => {
  try {
    const complaintId = c.req.param('id')
    const userId = c.req.header('X-User-Id')
    
    if (!userId) {
      return c.json({
        success: true,
        isLiked: false,
      })
    }
    
    const isLiked = await complaintService.getLikeStatus(userId, complaintId)
    
    return c.json({
      success: true,
      isLiked,
    })
    
  } catch (error) {
    console.error('获取点赞状态失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 获取评论
complaints.get('/:id/comments', async (c) => {
  try {
    const complaintId = c.req.param('id')
    const commentList = await complaintService.getComments(complaintId)
    
    return c.json({
      success: true,
      comments: commentList.map(comment => ({
        id: comment.id,
        userId: comment.userId,
        userNickname: comment.userNickname,
        userEmoji: comment.userEmoji,
        parentId: comment.parentId,
        contentType: comment.contentType,
        content: comment.content,
        voiceUrl: comment.voiceUrl,
        voiceDuration: comment.voiceDuration,
        likes: comment.likesCount,
        isAiGenerated: comment.isAiGenerated,
        createdAt: comment.createdAt?.toISOString(),
      })),
    })
    
  } catch (error) {
    console.error('获取评论失败:', error)
    return c.json({
      success: false,
      error: '获取失败',
    }, 500)
  }
})

// 添加评论
complaints.post('/:id/comments', async (c) => {
  try {
    const complaintId = c.req.param('id')
    const userId = c.req.header('X-User-Id')
    const data = await c.req.json()
    
    if (!userId) {
      return c.json({
        success: false,
        error: '需要登录',
      }, 401)
    }
    
    if (!data.content && !data.voiceUrl) {
      return c.json({
        success: false,
        error: '说点什么吧',
      }, 400)
    }
    
    const comment = await complaintService.addComment({
      userId,
      complaintId,
      parentId: data.parentId,
      contentType: data.contentType || 'text',
      content: data.content,
      voiceUrl: data.voiceUrl,
      voiceDuration: data.voiceDuration,
    })
    
    return c.json({
      success: true,
      message: '评论成功',
      comment,
    })
    
  } catch (error) {
    console.error('添加评论失败:', error)
    return c.json({
      success: false,
      error: '评论失败',
    }, 500)
  }
})

export default complaints
