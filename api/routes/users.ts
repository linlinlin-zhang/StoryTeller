import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  getRecommendedUsers,
  getUserStats,
  getPopularUsers
} from '../controllers/userController';
import {
  authenticateToken,
  optionalAuth
} from '../middleware/auth';
import {
  validateUserUpdate,
  validatePagination,
  validateObjectId,
  validateSearch,
  createValidationMiddleware
} from '../middleware/validation';

const router = Router();

// 公开路由
// 获取用户资料
router.get('/:userId',
  createValidationMiddleware([validateObjectId('userId')]),
  getUserProfile
);

// 搜索用户
router.get('/search/query',
  createValidationMiddleware([
    validateSearch,
    validatePagination
  ]),
  searchUsers
);

// 获取用户活动统计
router.get('/:userId/stats',
  createValidationMiddleware([validateObjectId('userId')]),
  getUserStats
);

// 获取热门用户
router.get('/popular/list',
  getPopularUsers
);

// 需要认证的路由
// 更新用户资料
router.put('/profile',
  authenticateToken,
  createValidationMiddleware([validateUserUpdate]),
  updateUserProfile
);

// 获取推荐用户
router.get('/recommended/list',
  authenticateToken,
  getRecommendedUsers
);

export default router;