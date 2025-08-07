import { Router } from 'express';
import {
  createPhoto,
  getPhotos,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  getUserPhotos,
  getCategories,
  getPopularTags,
  downloadPhoto
} from '../controllers/photoController';
import {
  authenticateToken,
  optionalAuth,
  requireOwnership
} from '../middleware/auth';
import {
  validatePhotoUpload,
  validatePhotoUpdate,
  validatePagination,
  validateObjectId,
  validateSearch,
  createValidationMiddleware
} from '../middleware/validation';
import {
  uploadSingle,
  processImageUpload,
  handleUploadError,
  validateImageDimensions
} from '../middleware/upload';

const router = Router();

// 公开路由
// 获取照片列表（支持分页、筛选、搜索）
router.get('/',
  createValidationMiddleware([
    ...validatePagination,
    ...validateSearch
  ]),
  optionalAuth,
  getPhotos
);

// 获取单张照片详情
router.get('/:id',
  createValidationMiddleware([validateObjectId('id')]),
  optionalAuth,
  getPhotoById
);

// 获取用户的照片
router.get('/user/:userId',
  createValidationMiddleware([
    validateObjectId('userId'),
    ...validatePagination
  ]),
  getUserPhotos
);

// 获取照片分类列表
router.get('/meta/categories', getCategories);

// 获取热门标签
router.get('/meta/tags', getPopularTags);

// 需要认证的路由
// 创建照片（通过上传）
router.post('/',
  authenticateToken,
  uploadSingle,
  handleUploadError,
  validateImageDimensions(100, 100, 8000, 8000),
  processImageUpload,
  createValidationMiddleware([...validatePhotoUpload]),
  createPhoto
);

// 更新照片信息
router.put('/:id',
  authenticateToken,
  createValidationMiddleware([
    validateObjectId('id'),
    ...validatePhotoUpdate
  ]),
  updatePhoto
);

// 删除照片
router.delete('/:id',
  authenticateToken,
  createValidationMiddleware([validateObjectId('id')]),
  deletePhoto
);

// 下载照片
router.get('/:id/download',
  authenticateToken,
  createValidationMiddleware([validateObjectId('id')]),
  downloadPhoto
);

export default router;