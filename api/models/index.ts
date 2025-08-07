// 统一导出所有模型
export { default as User } from './User.js';
export { default as Photo } from './Photo.js';
export { default as Comment } from './Comment.js';
export { default as Like } from './Like.js';
export { default as Follow } from './Follow.js';

// 导出接口
export type { IUser } from './User.js';
export type { IPhoto } from './Photo.js';
export type { IComment } from './Comment.js';
export type { ILike } from './Like.js';
export type { IFollow } from './Follow.js';

// 模型初始化函数
export const initializeModels = async () => {
  // 导入所有模型以确保它们被注册到mongoose
  await import('./User.js');
  await import('./Photo.js');
  await import('./Comment.js');
  await import('./Like.js');
  await import('./Follow.js');
  
  console.log('All models initialized successfully');
};

// 数据库清理函数（仅用于开发环境）
export const clearDatabase = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Database clearing is only allowed in development environment');
  }
  
  const { User, Photo, Comment, Like, Follow } = await import('./index.js');
  
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
  
  const { User } = await import('./index.js');
  
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