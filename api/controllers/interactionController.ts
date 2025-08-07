import { Request, Response } from 'express';
import { Photo, Comment, Like, Follow, User } from '../models/index.js';
import { cacheService } from '../config/redis';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: any;
    isVerified: boolean;
    isActive: boolean;
  };
}

// ==================== 点赞功能 ====================

// 切换点赞状态
export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user!.id;

    if (!['photo', 'comment'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: '无效的目标类型'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: '无效的目标ID'
      });
    }

    // 检查目标是否存在
    let target;
    if (targetType === 'photo') {
      target = await Photo.findById(targetId);
    } else {
      target = await Comment.findById(targetId);
    }
    if (!target) {
      return res.status(404).json({
        success: false,
        message: `${targetType === 'photo' ? '照片' : '评论'}不存在`
      });
    }

    const result = await Like.toggleLike(new mongoose.Types.ObjectId(userId), targetType as 'Photo' | 'Comment', new mongoose.Types.ObjectId(targetId));

    // 清除相关缓存
    await cacheService.del(`${targetType}:${targetId}`);
    await cacheService.del(`user:${userId}:likes`);

    res.json({
      success: true,
      message: result.liked ? '点赞成功' : '取消点赞成功',
      data: {
        isLiked: result.liked
      }
    });
  } catch (error) {
    console.error('切换点赞状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 检查用户是否点赞
export const checkLikeStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user!.id;

    if (!['photo', 'comment'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: '无效的目标类型'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: '无效的目标ID'
      });
    }

    const isLiked = await Like.isLikedByUser(new mongoose.Types.ObjectId(userId), targetType as 'Photo' | 'Comment', new mongoose.Types.ObjectId(targetId));

    res.json({
      success: true,
      data: { isLiked }
    });
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取用户点赞列表
export const getUserLikes = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, targetType } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filter: any = { user: userId };
    if (targetType && ['photo', 'comment'].includes(targetType as string)) {
      filter.targetType = targetType;
    }

    // 尝试从缓存获取
    const cacheKey = `user:${userId}:likes:${page}:${limit}:${targetType || 'all'}`;
    const cachedResult = await cacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    const likes = await Like.getUserLikes(new mongoose.Types.ObjectId(userId), targetType as 'Photo' | 'Comment', pageNum, limitNum);

    // 缓存结果（5分钟）
    await cacheService.set(cacheKey, JSON.stringify(likes), 300);

    res.json({
      success: true,
      data: likes
    });
  } catch (error) {
    console.error('获取用户点赞列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// ==================== 评论功能 ====================

// 创建评论
export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { photoId, content, parentId } = req.body;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({
        success: false,
        message: '无效的照片ID'
      });
    }

    // 检查照片是否存在且允许评论
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: '照片不存在'
      });
    }

    if (!photo.allowComments) {
      return res.status(403).json({
        success: false,
        message: '此照片不允许评论'
      });
    }

    // 如果是回复评论，检查父评论是否存在
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({
          success: false,
          message: '无效的父评论ID'
        });
      }

      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: '父评论不存在'
        });
      }

      if (parentComment.photo.toString() !== photoId) {
        return res.status(400).json({
          success: false,
          message: '父评论与照片不匹配'
        });
      }
    }

    const commentData = {
      content,
      author: userId,
      photo: photoId,
      parent: parentId || null
    };

    const comment = new Comment(commentData);
    await comment.save();

    // 填充作者信息
    await comment.populate('author', 'username avatar');

    // 清除相关缓存
    await cacheService.del(`photo:${photoId}:comments`);
    await cacheService.del(`photo:${photoId}`);
    if (parentId) {
      await cacheService.del(`comment:${parentId}:replies`);
    }

    res.status(201).json({
      success: true,
      message: '评论创建成功',
      data: comment
    });
  } catch (error) {
    console.error('创建评论失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取照片评论列表
export const getPhotoComments = async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({
        success: false,
        message: '无效的照片ID'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建排序条件
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // 尝试从缓存获取
    const cacheKey = `photo:${photoId}:comments:${page}:${limit}:${sortBy}:${sortOrder}`;
    const cachedResult = await cacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    // 只获取顶级评论（没有父评论的评论）
    const [comments, total] = await Promise.all([
      Comment.find({ photo: photoId, parent: null, isDeleted: false })
        .populate('author', 'username avatar')
        .populate({
          path: 'replies',
          populate: {
            path: 'author',
            select: 'username avatar'
          },
          match: { isDeleted: false },
          options: { limit: 3, sort: { createdAt: 1 } } // 只显示前3个回复
        })
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Comment.countDocuments({ photo: photoId, parent: null, isDeleted: false })
    ]);

    const result = {
      comments,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: total,
        limit: limitNum
      }
    };

    // 缓存结果（5分钟）
    await cacheService.set(cacheKey, JSON.stringify(result), 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取照片评论失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取评论回复列表
export const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: '无效的评论ID'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 尝试从缓存获取
    const cacheKey = `comment:${commentId}:replies:${page}:${limit}`;
    const cachedResult = await cacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    const [replies, total] = await Promise.all([
      Comment.find({ parent: commentId, isDeleted: false })
        .populate('author', 'username avatar')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Comment.countDocuments({ parent: commentId, isDeleted: false })
    ]);

    const result = {
      replies,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: total,
        limit: limitNum
      }
    };

    // 缓存结果（5分钟）
    await cacheService.set(cacheKey, JSON.stringify(result), 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取评论回复失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新评论
export const updateComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: '无效的评论ID'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 检查权限
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权限修改此评论'
      });
    }

    // 检查是否已被删除
    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: '评论已被删除，无法修改'
      });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.updatedAt = new Date();
    await comment.save();

    // 填充作者信息
    await comment.populate('author', 'username avatar');

    // 清除相关缓存
    await cacheService.del(`photo:${comment.photo}:comments`);
    if (comment.parentComment) {
      await cacheService.del(`comment:${comment.parentComment}:replies`);
    }

    res.json({
      success: true,
      message: '评论更新成功',
      data: comment
    });
  } catch (error) {
    console.error('更新评论失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 删除评论
export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: '无效的评论ID'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 检查权限（评论作者或照片作者可以删除）
    const photo = await Photo.findById(comment.photo);
    if (comment.author.toString() !== userId && photo?.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此评论'
      });
    }

    // 软删除
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    // 清除相关缓存
    await cacheService.del(`photo:${comment.photo}:comments`);
    if (comment.parentComment) {
      await cacheService.del(`comment:${comment.parentComment}:replies`);
    }

    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// ==================== 关注功能 ====================

// 切换关注状态
export const toggleFollow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    // 不能关注自己
    if (targetUserId === userId) {
      return res.status(400).json({
        success: false,
        message: '不能关注自己'
      });
    }

    // 检查目标用户是否存在
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const result = await Follow.toggleFollow(new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(targetUserId));

    // 清除相关缓存
    await cacheService.del(`user:${userId}:following`);
    await cacheService.del(`user:${targetUserId}:followers`);

    res.json({
      success: true,
      message: result.following ? '关注成功' : '取消关注成功',
      data: {
        isFollowing: result.following
      }
    });
  } catch (error) {
    console.error('切换关注状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 检查关注状态
export const checkFollowStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    const isFollowing = await Follow.isFollowing(new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(targetUserId));

    res.json({
      success: true,
      data: { isFollowing }
    });
  } catch (error) {
    console.error('检查关注状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取关注列表
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // 尝试从缓存获取
    const cacheKey = `user:${userId}:following:${page}:${limit}`;
    const cachedResult = await cacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    const result = await Follow.getFollowing(new mongoose.Types.ObjectId(userId), pageNum, limitNum);

    // 缓存结果（5分钟）
    await cacheService.set(cacheKey, JSON.stringify(result), 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取关注列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取粉丝列表
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // 尝试从缓存获取
    const cacheKey = `user:${userId}:followers:${page}:${limit}`;
    const cachedResult = await cacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    const result = await Follow.getFollowers(new mongoose.Types.ObjectId(userId), pageNum, limitNum);

    // 缓存结果（5分钟）
    await cacheService.set(cacheKey, JSON.stringify(result), 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取粉丝列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取互相关注列表
export const getMutualFollows = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user!.id;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // 尝试从缓存获取
    const cacheKey = `user:${userId}:mutual:${page}:${limit}`;
    const cachedResult = await cacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    const result = await Follow.getMutualFollows(new mongoose.Types.ObjectId(userId), pageNum, limitNum);

    // 缓存结果（5分钟）
    await cacheService.set(cacheKey, JSON.stringify(result), 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取互相关注列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};