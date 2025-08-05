import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

/**
 * 处理验证结果的中间件
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formattedErrors
    });
    return;
  }
  
  next();
};

/**
 * 用户注册验证规则
 */
export const validateUserRegistration: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores')
    .custom(async (value) => {
      const { User } = require('../models');
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error('Username already exists');
      }
      return true;
    }),
    
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(async (value) => {
      const { User } = require('../models');
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error('Email already registered');
      }
      return true;
    }),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

/**
 * 用户登录验证规则
 */
export const validateUserLogin: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * 用户资料更新验证规则
 */
export const validateUserUpdate: ValidationChain[] = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
    
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
];

/**
 * 密码更改验证规则
 */
export const validatePasswordChange: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * 照片上传验证规则
 */
export const validatePhotoUpload: ValidationChain[] = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Photo title must be between 1 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
    
  body('category')
    .isIn(['portrait', 'landscape', 'street', 'nature', 'architecture', 'macro', 'abstract', 'documentary', 'fashion', 'sports', 'wildlife', 'travel', 'other'])
    .withMessage('Invalid category'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      if (tags && tags.some((tag: string) => tag.length > 20)) {
        throw new Error('Each tag must be 20 characters or less');
      }
      return true;
    }),
    
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
    
  body('allowComments')
    .optional()
    .isBoolean()
    .withMessage('allowComments must be a boolean'),
    
  body('allowDownload')
    .optional()
    .isBoolean()
    .withMessage('allowDownload must be a boolean')
];

/**
 * 照片更新验证规则
 */
export const validatePhotoUpdate: ValidationChain[] = [
  param('photoId')
    .isMongoId()
    .withMessage('Invalid photo ID'),
    
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Photo title must be between 1 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
    
  body('category')
    .optional()
    .isIn(['portrait', 'landscape', 'street', 'nature', 'architecture', 'macro', 'abstract', 'documentary', 'fashion', 'sports', 'wildlife', 'travel', 'other'])
    .withMessage('Invalid category'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      if (tags && tags.some((tag: string) => tag.length > 20)) {
        throw new Error('Each tag must be 20 characters or less');
      }
      return true;
    })
];

/**
 * 评论验证规则
 */
export const validateComment: ValidationChain[] = [
  param('photoId')
    .isMongoId()
    .withMessage('Invalid photo ID'),
    
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
    
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

/**
 * 分页验证规则
 */
export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt()
];

/**
 * MongoDB ObjectId 验证规则
 */
export const validateObjectId = (paramName: string): ValidationChain => {
  return param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`);
};

/**
 * 搜索验证规则
 */
export const validateSearch: ValidationChain[] = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
    
  query('category')
    .optional()
    .isIn(['portrait', 'landscape', 'street', 'nature', 'architecture', 'macro', 'abstract', 'documentary', 'fashion', 'sports', 'wildlife', 'travel', 'other'])
    .withMessage('Invalid category'),
    
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'likesCount', 'viewsCount', 'commentsCount'])
    .withMessage('Invalid sort field'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * 创建验证中间件组合
 */
export const createValidationMiddleware = (validations: ValidationChain[]) => {
  return [...validations, handleValidationErrors];
};