const Redis = require('ioredis');

// 创建一个模拟的Redis实例，在没有Redis服务时不会报错
let redis = null;
try {
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryDelayOnFailover: 0,
    enableReadyCheck: false,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    connectTimeout: 5000,
    commandTimeout: 5000,
    enableOfflineQueue: false,
    autoResubscribe: false,
    autoResendUnfulfilledCommands: false,
    retryDelayOnClusterDown: 0,
    reconnectOnError: () => false, // 永不重连
  };
  
  if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
  }
  
  redis = new Redis(redisConfig);
} catch (error) {
  console.warn('Redis initialization failed, creating mock instance');
  redis = null;
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
class CacheService {
  constructor() {
    this.redis = redis;
    this.isRedisAvailable = false;
    // 检查Redis连接状态
    if (this.redis && typeof this.redis.ping === 'function') {
      this.redis.ping().then(() => {
        this.isRedisAvailable = true;
        console.log('Redis connected successfully');
      }).catch(() => {
        this.isRedisAvailable = false;
        console.warn('Redis not available, cache will be disabled');
      });
    } else {
      this.isRedisAvailable = false;
      console.warn('Redis not available, cache will be disabled');
    }
  }

  async get(key) {
    if (!this.isRedisAvailable || !this.redis) return null;
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.warn('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, ttl) {
    if (!this.isRedisAvailable || !this.redis) return false;
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

  async del(key) {
    if (!this.isRedisAvailable || !this.redis) return false;
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.warn('Redis del error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isRedisAvailable || !this.redis) return false;
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('Redis exists error:', error);
      return false;
    }
  }

  async incr(key) {
    if (!this.isRedisAvailable || !this.redis) return null;
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.warn('Redis incr error:', error);
      return null;
    }
  }

  async expire(key, seconds) {
    if (!this.isRedisAvailable || !this.redis) return false;
    try {
      await this.redis.expire(key, seconds);
      return true;
    } catch (error) {
      console.warn('Redis expire error:', error);
      return false;
    }
  }

  async flushPattern(pattern) {
    if (!this.isRedisAvailable || !this.redis) return;
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

const cacheService = new CacheService();

module.exports = redis;
module.exports.CacheService = CacheService;
module.exports.cacheService = cacheService;