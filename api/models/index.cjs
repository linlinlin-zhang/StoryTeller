// 统一导出所有模型
const User = require('./User.js');
const Photo = require('./Photo.js');
const Comment = require('./Comment.js');
const Like = require('./Like.js');
const Follow = require('./Follow.js');

// 模型初始化函数
const initializeModels = async () => {
  // 导入所有模型以确保它们被注册到mongoose
  require('./User.js');
  require('./Photo.js');
  require('./Comment.js');
  require('./Like.js');
  require('./Follow.js');
  
  console.log('All models initialized successfully');
};

// 数据库清理函数（仅用于开发环境）
const clearDatabase = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Database clearing is only allowed in development environment');
  }
  
  try {
    await Promise.all([
      User.deleteMany({}),
      Photo.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Follow.deleteMany({})
    ]);
    
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

// 创建示例数据函数（仅用于开发环境）
const seedDatabase = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Database seeding is only allowed in development environment');
  }
  
  try {
    // 检查是否已有数据
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data, skipping seeding');
      return;
    }
    
    // 创建示例用户
    const sampleUsers = [
      {
        username: 'photographer1',
        email: 'photographer1@example.com',
        password: 'password123',
        bio: 'Professional landscape photographer',
        location: 'New York, USA'
      },
      {
        username: 'photographer2',
        email: 'photographer2@example.com',
        password: 'password123',
        bio: 'Street photography enthusiast',
        location: 'Tokyo, Japan'
      }
    ];
    
    await User.insertMany(sampleUsers);
    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = {
  User,
  Photo,
  Comment,
  Like,
  Follow,
  initializeModels,
  clearDatabase,
  seedDatabase
};