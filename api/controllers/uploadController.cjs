const { ossService } = require('../config/oss.cjs');
const { User } = require('../models');

/**
 * 上传照片
 */
const uploadPhotos = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      data: {
        files: req.uploadedFiles.map(file => ({
          originalUrl: file.original.url,
          thumbnailUrl: file.thumbnail?.url,
          filename: file.original.filename,
          size: file.original.size,
          dimensions: file.original.dimensions
        }))
      }
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photos'
    });
  }
};

/**
 * 上传头像
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No avatar file uploaded'
      });
      return;
    }

    const avatarFile = req.uploadedFiles[0];
    const avatarUrl = avatarFile.original.url;

    // 更新用户头像
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    });
  }
};

/**
 * 删除文件
 */
const deleteFile = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { filename } = req.params;

    if (!filename) {
      res.status(400).json({
        success: false,
        error: 'Filename is required'
      });
      return;
    }

    // 删除OSS文件
    const deleteResult = await ossService.deleteFile(filename);

    if (!deleteResult.success) {
      res.status(500).json({
        success: false,
        error: deleteResult.error || 'Failed to delete file'
      });
      return;
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
};

/**
 * 获取文件签名URL
 */
const getSignedUrl = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { filename } = req.params;
    const { expires = 3600 } = req.query;

    if (!filename) {
      res.status(400).json({
        success: false,
        error: 'Filename is required'
      });
      return;
    }

    // 验证过期时间
    const expiresIn = parseInt(expires);
    if (isNaN(expiresIn) || expiresIn < 60 || expiresIn > 86400) {
      res.status(400).json({
        success: false,
        error: 'Expires must be between 60 and 86400 seconds'
      });
      return;
    }

    // 检查文件是否存在
    const fileExists = await ossService.fileExists(filename);
    if (!fileExists) {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
      return;
    }

    // 生成签名URL
    const signedUrl = await ossService.getSignedUrl(filename, expiresIn);

    res.json({
      success: true,
      data: {
        signedUrl,
        filename,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Get signed URL error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate signed URL'
    });
  }
};

/**
 * 批量上传照片
 */
const batchUploadPhotos = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
      return;
    }

    const uploadResults = req.uploadedFiles.map((file, index) => ({
      index,
      success: true,
      originalUrl: file.original.url,
      thumbnailUrl: file.thumbnail?.url,
      filename: file.original.filename,
      size: file.original.size,
      dimensions: file.original.dimensions
    }));

    const successCount = uploadResults.filter(result => result.success).length;
    const failureCount = uploadResults.length - successCount;

    res.json({
      success: true,
      message: `Batch upload completed. ${successCount} successful, ${failureCount} failed`,
      data: {
        results: uploadResults,
        summary: {
          total: uploadResults.length,
          successful: successCount,
          failed: failureCount
        }
      }
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch upload failed'
    });
  }
};

/**
 * 获取上传配置信息
 */
const getUploadConfig = async (req, res) => {
  try {
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');

    res.json({
      success: true,
      data: {
        maxFileSize,
        maxFileSizeMB: Math.round(maxFileSize / 1024 / 1024),
        allowedTypes,
        maxFiles: 10,
        supportedFormats: {
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'image/webp': ['.webp']
        },
        recommendations: {
          minDimensions: { width: 100, height: 100 },
          maxDimensions: { width: 8000, height: 8000 },
          optimalFormats: ['JPEG', 'PNG', 'WebP'],
          qualityTips: [
            'Use JPEG for photos with many colors',
            'Use PNG for images with transparency',
            'Use WebP for best compression and quality balance'
          ]
        }
      }
    });
  } catch (error) {
    console.error('Get upload config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get upload configuration'
    });
  }
};

module.exports = {
  uploadPhotos,
  uploadAvatar,
  deleteFile,
  getSignedUrl,
  batchUploadPhotos,
  getUploadConfig
};