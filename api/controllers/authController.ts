import { Request, Response } from 'express';
import { User } from '../models';
import { JWTUtils } from '../utils/jwt';
import { cacheService } from '../config/redis';
import { revokeToken } from '../middleware/auth';

/**
 * 用户注册
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 创建新用户
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // 生成JWT令牌
    const token = JWTUtils.generateToken({
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // 缓存用户信息
    const userInfo = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive
    };
    await cacheService.set(`user:${user._id}`, JSON.stringify(userInfo), 300);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        res.status(400).json({
          success: false,
          error: 'Username or email already exists'
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }
};

/**
 * 用户登录
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 查找用户（包含密码字段）
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // 检查用户是否激活
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
      return;
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // 生成JWT令牌
    const token = JWTUtils.generateToken({
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // 缓存用户信息
    const userInfo = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive
    };
    await cacheService.set(`user:${user._id}`, JSON.stringify(userInfo), 300);

    // 更新最后登录时间（可选）
    user.set({ lastLoginAt: new Date() });
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: user.isVerified,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          photosCount: user.photosCount,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

/**
 * 用户注销
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // 将令牌加入黑名单
      await revokeToken(token);
      
      // 清除用户缓存
      if (req.user) {
        await cacheService.del(`user:${req.user.id}`);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

/**
 * 刷新令牌
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token is required'
      });
      return;
    }

    // 刷新令牌
    const newToken = JWTUtils.refreshToken(token);
    
    // 将旧令牌加入黑名单
    await revokeToken(token);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // 从数据库获取完整用户信息
    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          website: user.website,
          location: user.location,
          isVerified: user.isVerified,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          photosCount: user.photosCount,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information'
    });
  }
};

/**
 * 更改密码
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // 获取用户（包含密码）
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // 验证当前密码
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
      return;
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    // 清除用户缓存
    await cacheService.del(`user:${user._id}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
};

/**
 * 验证令牌有效性
 */
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token is required'
      });
      return;
    }

    // 验证令牌
    const decoded = JWTUtils.verifyToken(token);
    
    // 检查用户是否存在
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Invalid token or user not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        expiresIn: JWTUtils.getTokenRemainingTime(token)
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Token verification failed'
    });
  }
};