import { Request, Response } from 'express';
import { User, Photo, Follow } from '../models/index.js';
import { CacheService } from '../config/redis.js';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

// 获取用户资料
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    // 尝试从缓存获取
    const cacheKey = `user:profile:${userId}`;
    const cachedProfile = await CacheService.get(cacheKey);
    
    if (cachedProfile) {
      return res.json({
        success: true,
        data: JSON.parse(cachedProfile)
      });
    }

    // 获取用户基本信息
    const user = await User.findById(userId)
      .select('-password -email')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户统计信息
    const [photoCount, followerCount, followingCount] = await Promise.all([
      Photo.countDocuments({ author: userId, isPublic: true }),
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId })
    ]);

    const profile = {
      ...user,
      stats: {
        photoCount,
        followerCount,
        followingCount
      }
    };

    // 缓存用户资料（10分钟）
    await CacheService.set(cacheKey, JSON.stringify(profile), 600);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新用户资料
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bio, location, website } = req.body;
    const userId = req.user!._id;

    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 清除相关缓存
    await CacheService.del(`user:profile:${userId}`);
    await CacheService.del(`user:${userId}`);

    res.json({
      success: true,
      message: '用户资料更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 搜索用户
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const {
      q: query,
      page = 1,
      limit = 20
    } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建搜索条件
    const searchRegex = new RegExp(query.trim(), 'i');
    const searchQuery = {
      $or: [
        { username: searchRegex },
        { bio: searchRegex }
      ]
    };

    // 尝试从缓存获取
    const cacheKey = `search:users:${query}:${page}:${limit}`;
    const cachedResult = await CacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('username avatar bio location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(searchQuery)
    ]);

    // 获取每个用户的统计信息
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [photoCount, followerCount] = await Promise.all([
          Photo.countDocuments({ author: user._id, isPublic: true }),
          Follow.countDocuments({ following: user._id })
        ]);
        
        return {
          ...user,
          stats: {
            photoCount,
            followerCount
          }
        };
      })
    );

    const result = {
      users: usersWithStats,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: total,
        limit: limitNum
      }
    };

    // 缓存搜索结果（5分钟）
    await CacheService.set(cacheKey, JSON.stringify(result), 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取推荐用户
export const getRecommendedUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user!._id;
    const limitNum = parseInt(limit as string);

    // 尝试从缓存获取
    const cacheKey = `user:${userId}:recommended:${limit}`;
    const cachedResult = await CacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    // 获取当前用户已关注的用户ID列表
    const followingIds = await Follow.find({ follower: userId })
      .distinct('following');
    
    // 排除自己和已关注的用户
    const excludeIds = [userId, ...followingIds];

    // 推荐策略：按照粉丝数量和最近活跃度排序
    const recommendedUsers = await User.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'following',
          as: 'followers'
        }
      },
      {
        $lookup: {
          from: 'photos',
          localField: '_id',
          foreignField: 'author',
          as: 'photos'
        }
      },
      {
        $addFields: {
          followerCount: { $size: '$followers' },
          photoCount: { $size: '$photos' },
          recentPhotoCount: {
            $size: {
              $filter: {
                input: '$photos',
                cond: {
                  $gte: [
                    '$$this.createdAt',
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          username: 1,
          avatar: 1,
          bio: 1,
          location: 1,
          followerCount: 1,
          photoCount: 1,
          recentPhotoCount: 1,
          score: {
            $add: [
              { $multiply: ['$followerCount', 0.3] },
              { $multiply: ['$photoCount', 0.2] },
              { $multiply: ['$recentPhotoCount', 0.5] }
            ]
          }
        }
      },
      {
        $sort: { score: -1, createdAt: -1 }
      },
      {
        $limit: limitNum
      }
    ]);

    const result = {
      users: recommendedUsers.map(user => ({
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        stats: {
          followerCount: user.followerCount,
          photoCount: user.photoCount
        }
      }))
    };

    // 缓存推荐结果（30分钟）
    await CacheService.set(cacheKey, JSON.stringify(result), 1800);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取推荐用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取用户活动统计
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query; // 支持 7d, 30d, 90d, 1y

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    // 计算时间范围
    let days = 30;
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
      default: days = 30;
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // 尝试从缓存获取
    const cacheKey = `user:${userId}:stats:${period}`;
    const cachedStats = await CacheService.get(cacheKey);
    
    if (cachedStats) {
      return res.json({
        success: true,
        data: JSON.parse(cachedStats)
      });
    }

    // 获取统计数据
    const [totalStats, periodStats] = await Promise.all([
      // 总统计
      Promise.all([
        Photo.countDocuments({ author: userId, isPublic: true }),
        Follow.countDocuments({ following: userId }),
        Follow.countDocuments({ follower: userId }),
        Photo.aggregate([
          { $match: { author: new mongoose.Types.ObjectId(userId), isPublic: true } },
          { $group: { _id: null, totalLikes: { $sum: '$likeCount' }, totalViews: { $sum: '$viewCount' } } }
        ])
      ]),
      // 时间段统计
      Promise.all([
        Photo.countDocuments({ author: userId, isPublic: true, createdAt: { $gte: startDate } }),
        Follow.countDocuments({ following: userId, createdAt: { $gte: startDate } }),
        Follow.countDocuments({ follower: userId, createdAt: { $gte: startDate } }),
        Photo.aggregate([
          { $match: { author: new mongoose.Types.ObjectId(userId), isPublic: true, createdAt: { $gte: startDate } } },
          { $group: { _id: null, totalLikes: { $sum: '$likeCount' }, totalViews: { $sum: '$viewCount' } } }
        ])
      ])
    ]);

    const [totalPhotos, totalFollowers, totalFollowing, totalEngagement] = totalStats;
    const [periodPhotos, periodFollowers, periodFollowing, periodEngagement] = periodStats;

    const stats = {
      total: {
        photos: totalPhotos,
        followers: totalFollowers,
        following: totalFollowing,
        likes: totalEngagement[0]?.totalLikes || 0,
        views: totalEngagement[0]?.totalViews || 0
      },
      period: {
        photos: periodPhotos,
        followers: periodFollowers,
        following: periodFollowing,
        likes: periodEngagement[0]?.totalLikes || 0,
        views: periodEngagement[0]?.totalViews || 0,
        days
      }
    };

    // 缓存统计数据（1小时）
    await CacheService.set(cacheKey, JSON.stringify(stats), 3600);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取热门用户
export const getPopularUsers = async (req: Request, res: Response) => {
  try {
    const { limit = 20, period = '30d' } = req.query;
    const limitNum = parseInt(limit as string);

    // 计算时间范围
    let days = 30;
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 30;
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // 尝试从缓存获取
    const cacheKey = `users:popular:${limit}:${period}`;
    const cachedResult = await CacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    // 聚合查询获取热门用户
    const popularUsers = await User.aggregate([
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'following',
          as: 'followers'
        }
      },
      {
        $lookup: {
          from: 'photos',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$author', '$$userId'] },
                isPublic: true,
                createdAt: { $gte: startDate }
              }
            }
          ],
          as: 'recentPhotos'
        }
      },
      {
        $addFields: {
          followerCount: { $size: '$followers' },
          recentPhotoCount: { $size: '$recentPhotos' },
          recentLikes: { $sum: '$recentPhotos.likeCount' },
          recentViews: { $sum: '$recentPhotos.viewCount' },
          popularityScore: {
            $add: [
              { $multiply: [{ $size: '$followers' }, 0.4] },
              { $multiply: [{ $size: '$recentPhotos' }, 0.3] },
              { $multiply: [{ $sum: '$recentPhotos.likeCount' }, 0.2] },
              { $multiply: [{ $sum: '$recentPhotos.viewCount' }, 0.1] }
            ]
          }
        }
      },
      {
        $match: {
          popularityScore: { $gt: 0 }
        }
      },
      {
        $project: {
          username: 1,
          avatar: 1,
          bio: 1,
          location: 1,
          followerCount: 1,
          recentPhotoCount: 1,
          recentLikes: 1,
          recentViews: 1,
          popularityScore: 1
        }
      },
      {
        $sort: { popularityScore: -1 }
      },
      {
        $limit: limitNum
      }
    ]);

    const result = {
      users: popularUsers.map(user => ({
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        stats: {
          followerCount: user.followerCount,
          recentPhotoCount: user.recentPhotoCount,
          recentLikes: user.recentLikes,
          recentViews: user.recentViews
        }
      })),
      period: `${days}d`
    };

    // 缓存热门用户（1小时）
    await CacheService.set(cacheKey, JSON.stringify(result), 3600);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取热门用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};