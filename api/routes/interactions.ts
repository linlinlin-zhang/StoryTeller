import { Router } from 'express';
import {
  // 点赞功能
  toggleLike,
  checkLikeStatus,
  getUserLikes,
  // 评论功能
  createComment,
  getPhotoComments,
  getCommentReplies,
  updateComment,
  deleteComment,
  // 关注功能
  toggleFollow,
  checkFollowStatus,
  getFollowing,
  getFollowers,
  getMutualFollows
} from '../controllers/interactionController';
import {
  authenticateToken,
  optionalAuth
} from '../middleware/auth';
import {
  validateComment,
  validatePagination,
  validateObjectId,
  createValidationMiddleware
} from '../middleware/validation';

const router = Router();

// ==================== 点赞相关路由 ====================

// 切换点赞状态（需要认证）
router.post('/likes/toggle',
  authenticateToken,
  toggleLike
);

// 检查点赞状态（需要认证）
router.get('/likes/status/:targetType/:targetId',
  authenticateToken,
  createValidationMiddleware([
    validateObjectId('targetId')
  ]),
  checkLikeStatus
);

// 获取用户点赞列表（公开）
router.get('/likes/user/:userId',
  createValidationMiddleware([
    validateObjectId('userId'),
    validatePagination
  ]),
  getUserLikes
);

// ==================== 评论相关路由 ====================

// 创建评论（需要认证）
router.post('/comments',
  authenticateToken,
  createValidationMiddleware([validateComment]),
  createComment
);

// 获取照片评论列表（公开）
router.get('/comments/photo/:photoId',
  createValidationMiddleware([
    validateObjectId('photoId'),
    validatePagination
  ]),
  getPhotoComments
);

// 获取评论回复列表（公开）
router.get('/comments/:commentId/replies',
  createValidationMiddleware([
    validateObjectId('commentId'),
    validatePagination
  ]),
  getCommentReplies
);

// 更新评论（需要认证）
router.put('/comments/:commentId',
  authenticateToken,
  createValidationMiddleware([
    validateObjectId('commentId'),
    validateComment
  ]),
  updateComment
);

// 删除评论（需要认证）
router.delete('/comments/:commentId',
  authenticateToken,
  createValidationMiddleware([validateObjectId('commentId')]),
  deleteComment
);

// ==================== 关注相关路由 ====================

// 切换关注状态（需要认证）
router.post('/follows/toggle',
  authenticateToken,
  toggleFollow
);

// 检查关注状态（需要认证）
router.get('/follows/status/:targetUserId',
  authenticateToken,
  createValidationMiddleware([validateObjectId('targetUserId')]),
  checkFollowStatus
);

// 获取关注列表（公开）
router.get('/follows/following/:userId',
  createValidationMiddleware([
    validateObjectId('userId'),
    validatePagination
  ]),
  getFollowing
);

// 获取粉丝列表（公开）
router.get('/follows/followers/:userId',
  createValidationMiddleware([
    validateObjectId('userId'),
    validatePagination
  ]),
  getFollowers
);

// 获取互相关注列表（需要认证）
router.get('/follows/mutual',
  authenticateToken,
  createValidationMiddleware([validatePagination]),
  getMutualFollows
);

export default router;