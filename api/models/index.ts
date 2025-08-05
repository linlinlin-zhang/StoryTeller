// 统一导出所有数据模型
export { default as User, IUser } from './User';
export { default as Photo, IPhoto } from './Photo';
export { default as Comment, IComment } from './Comment';
export { default as Like, ILike } from './Like';
export { default as Follow, IFollow } from './Follow';

// 模型初始化函数
export const initializeModels = () => {
  // 导入所有模型以确保它们被注册到mongoose
  require('./User');
  require('./Photo');
  require('./Comment');
  require('./Like');
  require('./Follow');
  
  console.log('All models initialized successfully');
};

// 数据库清理函数（仅用于开发环境）
export const clearDatabase = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Database clearing is only allowed in development environment');
  }
  
  const { User, Photo, Comment, Like, Follow } = require('./index');
  
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
export const seedDatabase = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Database seeding is only allowed in development environment');
  }
  
  const { User } = require('./index');
  
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