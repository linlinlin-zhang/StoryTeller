import Redis from 'ioredis';

// 创建一个模拟的Redis实例，在没有Redis服务时不会报错
let redis: Redis;
try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    retryDelayOnFailover: 0,
    enableReadyCheck: false,
    maxRetriesPerRequest: 0,
    lazyConnect: true,
    connectTimeout: 1000,
    commandTimeout: 1000,
    enableOfflineQueue: false,
    autoResubscribe: false,
    autoResendUnfulfilledCommands: false,
    retryDelayOnClusterDown: 0,
    reconnectOnError: () => false, // 永不重连
  });
} catch (error) {
  console.warn('Redis initialization failed, creating mock instance');
  // 创建一个模拟的Redis实例
  redis = {} as Redis;
}

// 连接事件监听（仅在Redis实例存在时）
if (redis && typeof redis.on === 'function') {
  redis.on('error', (err) => {
    console.warn('Redis connection error (continuing without Redis):', err.message);
    // 不抛出错误，让应用继续运行
  });

  redis.on('connect', () => {
    console.log('Redis connected');
  });
}

// 缓存服务类
export class CacheService {
  private redis: Redis;
  private isRedisAvailable = false;

  constructor() {
    this.redis = redis;
    // 检查Redis连接状态
    this.redis.ping().then(() => {
      this.isRedisAvailable = true;
      console.log('Redis connected successfully');
    }).catch(() => {
      this.isRedisAvailable = false;
      console.warn('Redis not available, cache will be disabled');
    });
  }

  async get(key: string): Promise<string | null> {
    if (!this.isRedisAvailable) return null;
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.warn('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.isRedisAvailable) return false;
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.warn('Redis set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isRedisAvailable) return false;
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.warn('Redis del error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isRedisAvailable) return false;
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('Redis exists error:', error);
      return false;
    }
  }

  async incr(key: string): Promise<number | null> {
    if (!this.isRedisAvailable) return null;
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.warn('Redis incr error:', error);
      return null;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isRedisAvailable) return false;
    try {
      await this.redis.expire(key, seconds);
      return true;
    } catch (error) {
      console.warn('Redis expire error:', error);
      return false;
    }
  }

  async flushPattern(pattern: string): Promise<void> {
    if (!this.isRedisAvailable) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.warn('Cache flush pattern error:', error);
    }
  }
}

export const cacheService = new CacheService();
export default redis;