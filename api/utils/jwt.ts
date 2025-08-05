import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

// JWT载荷接口
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// JWT工具类
export class JWTUtils {
  private static readonly SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
  private static readonly EXPIRE_TIME = process.env.JWT_EXPIRE || '7d';

  /**
   * 生成JWT令牌
   * @param payload 用户信息载荷
   * @returns JWT令牌
   */
  static generateToken(payload: {
    userId: string | Types.ObjectId;
    email: string;
    username: string;
  }): string {
    try {
      const tokenPayload: JWTPayload = {
        userId: payload.userId.toString(),
        email: payload.email,
        username: payload.username
      };

      return jwt.sign(tokenPayload, this.SECRET, {
        expiresIn: this.EXPIRE_TIME,
        issuer: 'photography-platform',
        audience: 'photography-platform-users'
      });
    } catch (error) {
      throw new Error('Failed to generate JWT token');
    }
  }

  /**
   * 验证JWT令牌
   * @param token JWT令牌
   * @returns 解码后的载荷
   */
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.SECRET, {
        issuer: 'photography-platform',
        audience: 'photography-platform-users'
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * 刷新JWT令牌
   * @param token 旧的JWT令牌
   * @returns 新的JWT令牌
   */
  static refreshToken(token: string): string {
    try {
      // 验证旧令牌（忽略过期错误）
      const decoded = jwt.verify(token, this.SECRET, {
        ignoreExpiration: true,
        issuer: 'photography-platform',
        audience: 'photography-platform-users'
      }) as JWTPayload;

      // 生成新令牌
      return this.generateToken({
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username
      });
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * 解码JWT令牌（不验证）
   * @param token JWT令牌
   * @returns 解码后的载荷
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 检查令牌是否即将过期
   * @param token JWT令牌
   * @param thresholdMinutes 阈值分钟数
   * @returns 是否即将过期
   */
  static isTokenExpiringSoon(token: string, thresholdMinutes: number = 30): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      const threshold = thresholdMinutes * 60;
      
      return (decoded.exp - now) < threshold;
    } catch (error) {
      return true;
    }
  }

  /**
   * 获取令牌剩余有效时间（秒）
   * @param token JWT令牌
   * @returns 剩余秒数
   */
  static getTokenRemainingTime(token: string): number {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return 0;
      }

      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - now);
    } catch (error) {
      return 0;
    }
  }
}

// 导出默认实例
export default JWTUtils;