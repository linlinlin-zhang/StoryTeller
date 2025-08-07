/**
 * This is a API server
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/database.cjs');
const redis = require('./config/redis.cjs');
const { initializeModels } = require('./models/index.cjs');
const authRoutes = require('./routes/auth.cjs');
const uploadRoutes = require('./routes/upload.cjs');
// const photoRoutes = require('./routes/photos.cjs');
// const interactionRoutes = require('./routes/interactions.cjs');
// const userRoutes = require('./routes/users.cjs');
// const adminRoutes = require('./routes/admin.cjs');

// load env
dotenv.config();

const app = express();

// 连接数据库
connectDB();

// 初始化模型
initializeModels().catch(console.error);

// Redis使用lazyConnect，会在需要时自动连接

// 安全中间件
app.use(helmet());

// 压缩中间件
app.use(compression());

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 限制每个IP 100个请求
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // 生产环境域名
    : ['http://localhost:3000', 'http://localhost:5173'], // 开发环境
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
// app.use('/api/photos', photoRoutes);
// app.use('/api/interactions', interactionRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/admin', adminRoutes);

/**
 * health
 */
app.use('/api/health', (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

/**
 * error handler middleware
 */
app.use((error, req, res, next) => {
  console.error('Error:', error.stack);
  
  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  } else {
    // 生产环境返回通用错误信息
    res.status(500).json({
      success: false,
      error: 'Server internal error'
    });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

module.exports = app;