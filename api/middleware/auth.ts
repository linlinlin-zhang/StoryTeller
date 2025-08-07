import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from '../utils/jwt';
import { User } from '../models';
import { cacheService } from '../config/redis';

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
        isVerified: boolean;
        isActive: boolean;
      };
    }
  }
}

/**
 * JWT认证中间件
 * 验证请求头中的JWT令牌并设置用户信息
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
      return;
    }

    // 检查令牌是否在黑名单中（已注销的令牌）
    const isBlacklisted = await cacheService.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        error: 'Token has been revoked'
      });
      return;
    }

    // 验证JWT令牌
    const decoded: JWTPayload = JWTUtils.verifyToken(token);

    // 从缓存中获取用户信息
    let userInfo = await cacheService.get(`user:${decoded.userId}`);
    
    if (!userInfo) {
      // 缓存中没有，从数据库获取
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          error: 'User account is deactivated'
        });
        return;
      }

      // 缓存用户信息（5分钟）
      userInfo = JSON.stringify({
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive
      });
      await cacheService.set(`user:${decoded.userId}`, userInfo, 300);
    }

    // 设置用户信息到请求对象
    req.user = JSON.parse(userInfo);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        res.status(401).json({
          success: false,
          error: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.message.includes('invalid')) {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Authentication failed'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

/**
 * 可选认证中间件
 * 如果提供了令牌则验证，否则继续执行
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // 没有令牌，继续执行
      next();
      return;
    }

    // 有令牌，尝试验证
    await authenticateToken(req, res, next);
  } catch (error) {
    // 验证失败，但不阻止请求继续
    next();
  }
};

/**
 * 验证用户是否已验证邮箱
 */
export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
    return;
  }

  next();
};

/**
 * 验证用户权限（用户只能操作自己的资源）
 */
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      res.status(400).json({
        success: false,
        error: 'Resource user ID is required'
      });
      return;
    }

    if (req.user.id !== resourceUserId) {
      res.status(403).json({
        success: false,
        error: 'Access denied: You can only access your own resources'
      });
      return;
    }

    next();
  };
};

/**
 * 令牌刷新中间件
 * 检查令牌是否即将过期，如果是则自动刷新
 */
export const refreshTokenIfNeeded = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // 检查令牌是否即将过期（30分钟内）
    if (JWTUtils.isTokenExpiringSoon(token, 30)) {
      try {
        const newToken = JWTUtils.refreshToken(token);
        
        // 在响应头中返回新令牌
        res.setHeader('X-New-Token', newToken);
        
        // 将旧令牌加入黑名单
        const remainingTime = JWTUtils.getTokenRemainingTime(token);
        if (remainingTime > 0) {
          await cacheService.set(`blacklist:${token}`, 'revoked', remainingTime);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // 刷新失败不影响当前请求
      }
    }

    next();
  } catch (error) {
    console.error('Token refresh middleware error:', error);
    next();
  }
};

/**
 * 注销令牌（将令牌加入黑名单）
 */
export const revokeToken = async (token: string): Promise<void> => {
  try {
    const remainingTime = JWTUtils.getTokenRemainingTime(token);
    if (remainingTime > 0) {
      await cacheService.set(`blacklist:${token}`, 'revoked', remainingTime);
    }
  } catch (error) {
    console.error('Token revocation failed:', error);
    throw error;
  }
};