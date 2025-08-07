import express from 'express';
import { User, Photo } from '../models';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { UserRole } from '../models/User';

const router = express.Router();

// 所有管理员路由都需要认证和管理员权限
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * 获取管理员仪表板数据
 */
router.get('/dashboard', async (req, res) => {
  try {
    // 获取统计数据
    const totalUsers = await User.countDocuments();
    const totalPhotos = await Photo.countDocuments();
    const pendingPhotos = await Photo.countDocuments({ status: 'pending' });
    const activeUsers = await User.countDocuments({ isActive: true });

    // 获取最近30天的用户增长
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // 获取最近30天的作品增长
    const newPhotos = await Photo.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // 计算增长率
    const userGrowthRate = totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0;
    const photoGrowthRate = totalPhotos > 0 ? (newPhotos / totalPhotos) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPhotos,
        pendingReviews: pendingPhotos,
        activeUsers,
        userGrowth: userGrowthRate,
        photoGrowth: photoGrowthRate,
        newUsers,
        newPhotos
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

/**
 * 获取用户列表
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 构建查询条件
    const query: any = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

/**
 * 更新用户状态
 */
router.patch('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const updateData: any = {};
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }
    if (role && Object.values(UserRole).includes(role)) {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

/**
 * 删除用户
 */
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 防止删除管理员账号
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete admin user'
      });
    }

    // 删除用户的所有作品
    await Photo.deleteMany({ userId });
    
    // 删除用户
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User and associated photos deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

/**
 * 获取作品列表
 */
router.get('/photos', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 构建查询条件
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const photos = await Photo.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Photo.countDocuments(query);

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photos'
    });
  }
});

/**
 * 更新作品状态
 */
router.patch('/photos/:photoId/status', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const updateData: any = { status };
    if (reason) {
      updateData.reviewReason = reason;
    }
    updateData.reviewedAt = new Date();
    updateData.reviewedBy = req.user!.id;

    const photo = await Photo.findByIdAndUpdate(
      photoId,
      updateData,
      { new: true }
    ).populate('userId', 'username email');

    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    res.json({
      success: true,
      data: photo
    });
  } catch (error) {
    console.error('Update photo status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update photo status'
    });
  }
});

/**
 * 删除作品
 */
router.delete('/photos/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await Photo.findByIdAndDelete(photoId);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete photo'
    });
  }
});

/**
 * 获取系统统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // 获取时间段内的统计数据
    const userStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const photoStats = await Photo.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        userGrowth: userStats,
        photoGrowth: photoStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default router;