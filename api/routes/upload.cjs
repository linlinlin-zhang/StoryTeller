const { Router } = require('express');
const {
  uploadPhotos,
  uploadAvatar,
  deleteFile,
  getSignedUrl,
  batchUploadPhotos,
  getUploadConfig
} = require('../controllers/uploadController.cjs');
const {
  authenticateToken
} = require('../middleware/auth.cjs');
const {
  uploadSingle,
  uploadMultiple,
  processImageUpload,
  processAvatarUpload,
  handleUploadError,
  validateImageDimensions
} = require('../middleware/upload');

const router = Router();

// 所有上传路由都需要认证
router.use(authenticateToken);

// 获取上传配置（公开给已认证用户）
router.get('/config', getUploadConfig);

// 单张照片上传
router.post('/photo',
  uploadSingle,
  handleUploadError,
  validateImageDimensions(100, 100, 8000, 8000),
  processImageUpload,
  uploadPhotos
);

// 多张照片批量上传
router.post('/photos',
  uploadMultiple,
  handleUploadError,
  validateImageDimensions(100, 100, 8000, 8000),
  processImageUpload,
  batchUploadPhotos
);

// 头像上传
router.post('/avatar',
  uploadSingle,
  handleUploadError,
  validateImageDimensions(50, 50, 2000, 2000),
  processAvatarUpload,
  uploadAvatar
);

// 获取文件签名URL（用于安全下载）
router.get('/signed-url/:filename', getSignedUrl);

// 删除文件
router.delete('/file/:filename', deleteFile);

module.exports = router;