const multer = require('multer');
const sharp = require('sharp');
const { ossService } = require('../config/oss.cjs');

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// 配置multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    files: 10 // 最多10个文件
  },
  fileFilter
});

/**
 * 单文件上传中间件
 */
const uploadSingle = upload.single('photo');

/**
 * 多文件上传中间件
 */
const uploadMultiple = upload.array('photos', 10);

/**
 * 处理图片上传和压缩
 */
const processImageUpload = async (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
      return;
    }

    const files = req.files || [req.file];
    const uploadedFiles = [];

    for (const file of files) {
      if (!file) continue;

      try {
        // 获取图片元数据
        const metadata = await sharp(file.buffer).metadata();
        
        if (!metadata.width || !metadata.height) {
          throw new Error('Invalid image file');
        }

        // 处理原图
        const originalBuffer = await sharp(file.buffer)
          .jpeg({ quality: 90, progressive: true })
          .toBuffer();

        // 生成缩略图
        const thumbnailBuffer = await sharp(file.buffer)
          .resize(400, 400, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        // 上传原图到OSS
        const originalUpload = await ossService.uploadFile(
          file.originalname,
          originalBuffer,
          'photos/original'
        );

        if (!originalUpload.success) {
          throw new Error(originalUpload.error || 'Failed to upload original image');
        }

        // 上传缩略图到OSS
        const thumbnailUpload = await ossService.uploadFile(
          `thumb_${file.originalname}`,
          thumbnailBuffer,
          'photos/thumbnails'
        );

        if (!thumbnailUpload.success) {
          throw new Error(thumbnailUpload.error || 'Failed to upload thumbnail');
        }

        // 获取缩略图尺寸
        const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();

        uploadedFiles.push({
          original: {
            url: originalUpload.url,
            filename: file.originalname,
            size: originalBuffer.length,
            dimensions: {
              width: metadata.width,
              height: metadata.height
            }
          },
          thumbnail: {
            url: thumbnailUpload.url,
            filename: `thumb_${file.originalname}`,
            size: thumbnailBuffer.length,
            dimensions: {
              width: thumbnailMetadata.width || 0,
              height: thumbnailMetadata.height || 0
            }
          }
        });
      } catch (error) {
        console.error('Image processing error:', error);
        throw new Error(`Failed to process image ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    req.uploadedFiles = uploadedFiles;
    next();
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'File upload failed'
    });
  }
};

/**
 * 头像上传处理中间件
 */
const processAvatarUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No avatar file uploaded'
      });
      return;
    }

    const file = req.file;

    // 获取图片元数据
    const metadata = await sharp(file.buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      res.status(400).json({
        success: false,
        error: 'Invalid image file'
      });
      return;
    }

    // 处理头像（正方形，200x200）
    const avatarBuffer = await sharp(file.buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // 上传头像到OSS
    const avatarUpload = await ossService.uploadFile(
      `avatar_${Date.now()}_${file.originalname}`,
      avatarBuffer,
      'avatars'
    );

    if (!avatarUpload.success) {
      res.status(500).json({
        success: false,
        error: avatarUpload.error || 'Failed to upload avatar'
      });
      return;
    }

    req.uploadedFiles = [{
      original: {
        url: avatarUpload.url,
        filename: file.originalname,
        size: avatarBuffer.length,
        dimensions: { width: 200, height: 200 }
      }
    }];

    next();
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Avatar upload failed'
    });
  }
};

/**
 * 错误处理中间件
 */
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${Math.round(parseInt(process.env.MAX_FILE_SIZE || '10485760') / 1024 / 1024)}MB`
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 10 files allowed'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: 'Unexpected field name for file upload'
      });
    } else {
      res.status(400).json({
        success: false,
        error: `Upload error: ${error.message}`
      });
    }
  } else if (error) {
    res.status(400).json({
      success: false,
      error: error.message || 'File upload failed'
    });
  } else {
    next();
  }
};

/**
 * 验证图片尺寸
 */
const validateImageDimensions = (minWidth = 100, minHeight = 100, maxWidth = 8000, maxHeight = 8000) => {
  return async (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        next();
        return;
      }

      const files = req.files || [req.file];

      for (const file of files) {
        if (!file) continue;

        const metadata = await sharp(file.buffer).metadata();
        
        if (!metadata.width || !metadata.height) {
          res.status(400).json({
            success: false,
            error: 'Invalid image file'
          });
          return;
        }

        if (metadata.width < minWidth || metadata.height < minHeight) {
          res.status(400).json({
            success: false,
            error: `Image dimensions too small. Minimum: ${minWidth}x${minHeight}px`
          });
          return;
        }

        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          res.status(400).json({
            success: false,
            error: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px`
          });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Image validation error:', error);
      res.status(400).json({
        success: false,
        error: 'Image validation failed'
      });
    }
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  processImageUpload,
  processAvatarUpload,
  handleUploadError,
  validateImageDimensions
};