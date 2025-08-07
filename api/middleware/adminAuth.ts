import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: UserRole;
      };
    }
  }
}

/**
 * 管理员权限验证中间件
 * 确保只有管理员角色的用户可以访问特定路由
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 检查用户是否已认证
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // 检查用户角色是否为管理员
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
      return;
    }

    // 用户是管理员，继续处理请求
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * 管理员或用户本人权限验证中间件
 * 允许管理员或资源所有者访问
 */
export const requireAdminOrOwner = (resourceUserIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 检查用户是否已认证
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // 如果是管理员，直接允许访问
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // 检查是否为资源所有者
      const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];
      if (req.user.id === resourceUserId) {
        next();
        return;
      }

      // 既不是管理员也不是资源所有者
      res.status(403).json({
        success: false,
        error: 'Access denied: Admin or owner access required'
      });
    } catch (error) {
      console.error('Admin or owner auth middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};

/**
 * 检查用户是否为管理员的辅助函数
 */
export const isAdmin = (user: { role: UserRole }): boolean => {
  return user.role === UserRole.ADMIN;
};

/**
 * 管理员登录验证中间件
 * 专门用于管理员登录接口
 */
export const adminLoginRequired = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { email } = req.body;
    
    // 检查是否为管理员邮箱
    if (email === 'admin@example.com') {
      next();
      return;
    }
    
    // 非管理员邮箱尝试访问管理员登录
    res.status(403).json({
      success: false,
      error: 'Admin email required'
    });
  } catch (error) {
    console.error('Admin login middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};