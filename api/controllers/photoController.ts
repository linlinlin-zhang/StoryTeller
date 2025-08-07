import { Request, Response } from 'express';
import { Photo, User } from '../models/index.js';
import { cacheService } from '../config/redis';
import { ossService } from '../config/oss.js';
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

// 创建照片
export const createPhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      tags,
      category,
      isPublic = true,
      allowComments = true,
      allowDownload = false,
      cameraInfo,
      shootingSettings,
      location
    } = req.body;

    // 从上传中间件获取处理后的文件信息
    const files = req.files as any;
    if (!files || !files.original || !files.thumbnail) {
      return res.status(400).json({
        success: false,
        message: '照片上传失败，缺少必要的文件信息'
      });
    }

    const photoData = {
      title,
      description,
      imageUrl: files.original.url,
      thumbnailUrl: files.thumbnail.url,
      fileSize: files.original.size,
      dimensions: files.original.dimensions,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim())) : [],
      category,
      isPublic,
      allowComments,
      allowDownload,
      author: req.user!.id,
      cameraInfo: cameraInfo ? JSON.parse(cameraInfo) : undefined,
      shootingSettings: shootingSettings ? JSON.parse(shootingSettings) : undefined,
      location: location ? JSON.parse(location) : undefined
    };

    const photo = new Photo(photoData);
    await photo.save();

    // 填充作者信息
    await photo.populate('author', 'username avatar');

    // 清除相关缓存
    await cacheService.del(`user:${req.user!.id}:photos`);
    await cacheService.del('photos:public');
    await cacheService.del(`photos:category:${category}`);

    res.status(201).json({
      success: true,
      message: '照片创建成功',
      data: photo
    });
  } catch (error) {
    console.error('创建照片失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取照片列表
export const getPhotos = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      tags,
      author,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const query: any = { isPublic: true };

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : (tags as string).split(',');
      query.tags = { $in: tagArray };
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // 构建排序条件
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // 尝试从缓存获取
    const cacheKey = `photos:${JSON.stringify(query)}:${page}:${limit}:${sortBy}:${sortOrder}`;
    const cachedResult = await cacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    // 查询数据库
    const [photos, total] = await Promise.all([
      Photo.find(query)
        .populate('author', 'username avatar')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Photo.countDocuments(query)
    ]);

    const result = {
      photos,
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
    console.error('获取照片列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取单张照片详情
export const getPhotoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的照片ID'
      });
    }

    // 尝试从缓存获取
    const cacheKey = `photo:${id}`;
    const cachedPhoto = await cacheService.get(cacheKey);
    
    if (cachedPhoto) {
      const photo = JSON.parse(cachedPhoto);
      // 增加浏览数
      await Photo.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
      
      return res.json({
        success: true,
        data: { ...photo, viewCount: photo.viewCount + 1 }
      });
    }

    const photo = await Photo.findById(id)
      .populate('author', 'username avatar bio')
      .lean();

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: '照片不存在'
      });
    }

    // 检查权限
    if (!photo.isPublic) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(403).json({
          success: false,
          message: '此照片为私有，需要登录查看'
        });
      }
      // 这里可以添加更详细的权限检查
    }

    // 增加浏览数
    await Photo.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
    photo.viewsCount += 1;

    // 缓存照片信息（10分钟）
    await cacheService.set(cacheKey, JSON.stringify(photo), 600);

    res.json({
      success: true,
      data: photo
    });
  } catch (error) {
    console.error('获取照片详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新照片信息
export const updatePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      tags,
      category,
      isPublic,
      allowComments,
      allowDownload
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的照片ID'
      });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: '照片不存在'
      });
    }

    // 检查权限
    if (photo.author.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: '无权限修改此照片'
      });
    }

    // 更新字段
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim());
    }
    if (category !== undefined) updateData.category = category;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (allowComments !== undefined) updateData.allowComments = allowComments;
    if (allowDownload !== undefined) updateData.allowDownload = allowDownload;
    updateData.updatedAt = new Date();

    const updatedPhoto = await Photo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    // 清除相关缓存
    await cacheService.del(`photo:${id}`);
    await cacheService.del(`user:${req.user!.id}:photos`);
    await cacheService.del('photos:public');
    if (category) {
      await cacheService.del(`photos:category:${category}`);
    }

    res.json({
      success: true,
      message: '照片更新成功',
      data: updatedPhoto
    });
  } catch (error) {
    console.error('更新照片失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 删除照片
export const deletePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的照片ID'
      });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: '照片不存在'
      });
    }

    // 检查权限
    if (photo.author.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此照片'
      });
    }

    // 删除OSS上的文件
    try {
      const imageFileName = photo.imageUrl.split('/').pop();
      const thumbnailFileName = photo.thumbnailUrl.split('/').pop();
      
      if (imageFileName) {
        await ossService.deleteFile(imageFileName);
      }
      if (thumbnailFileName) {
        await ossService.deleteFile(thumbnailFileName);
      }
    } catch (ossError) {
      console.error('删除OSS文件失败:', ossError);
      // 继续删除数据库记录，即使OSS删除失败
    }

    // 删除数据库记录
    await Photo.findByIdAndDelete(id);

    // 清除相关缓存
    await cacheService.del(`photo:${id}`);
    await cacheService.del(`user:${req.user!.id}:photos`);
    await cacheService.del('photos:public');
    await cacheService.del(`photos:category:${photo.category}`);

    res.json({
      success: true,
      message: '照片删除成功'
    });
  } catch (error) {
    console.error('删除照片失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取用户的照片
export const getUserPhotos = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件（只显示公开照片）
    const query = {
      author: userId,
      isPublic: true
    };

    // 构建排序条件
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // 尝试从缓存获取
    const cacheKey = `user:${userId}:photos:${page}:${limit}:${sortBy}:${sortOrder}`;
    const cachedResult = await cacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      });
    }

    const [photos, total, user] = await Promise.all([
      Photo.find(query)
        .populate('author', 'username avatar')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Photo.countDocuments(query),
      User.findById(userId, 'username avatar bio').lean()
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const result = {
      user,
      photos,
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
    console.error('获取用户照片失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取照片分类列表
export const getCategories = async (req: Request, res: Response) => {
  try {
    // 尝试从缓存获取
    const cacheKey = 'photo:categories';
    const cachedCategories = await cacheService.get(cacheKey);
    
    if (cachedCategories) {
      return res.json({
        success: true,
        data: JSON.parse(cachedCategories)
      });
    }

    // 聚合查询获取所有分类及其照片数量
    const categories = await Photo.aggregate([
      { $match: { isPublic: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 缓存结果（30分钟）
    await cacheService.set(cacheKey, JSON.stringify(categories), 1800);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取热门标签
export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit as string);

    // 尝试从缓存获取
    const cacheKey = `photo:tags:popular:${limit}`;
    const cachedTags = await cacheService.get(cacheKey);
    
    if (cachedTags) {
      return res.json({
        success: true,
        data: JSON.parse(cachedTags)
      });
    }

    // 聚合查询获取热门标签
    const tags = await Photo.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: limitNum }
    ]);

    // 缓存结果（1小时）
    await cacheService.set(cacheKey, JSON.stringify(tags), 3600);

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取热门标签失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 下载照片
export const downloadPhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的照片ID'
      });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: '照片不存在'
      });
    }

    // 检查下载权限
    if (!photo.allowDownload) {
      return res.status(403).json({
        success: false,
        message: '此照片不允许下载'
      });
    }

    // 增加下载数
    await Photo.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });

    // 获取签名URL
    const fileName = photo.imageUrl.split('/').pop();
    if (!fileName) {
      return res.status(500).json({
        success: false,
        message: '无法获取文件信息'
      });
    }

    const signedUrl = await ossService.getSignedUrl(fileName, 3600); // 1小时有效期

    res.json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        fileName: `${photo.title || 'photo'}_${photo._id}.jpg`
      }
    });
  } catch (error) {
    console.error('下载照片失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};