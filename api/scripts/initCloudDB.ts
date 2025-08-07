import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 先加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * 连接到云数据库
 */
async function connectToCloudDB(): Promise<mongoose.Connection> {
  const cloudConnection = mongoose.createConnection(process.env.MONGODB_URI as string, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });
  await cloudConnection.asPromise();
  console.log('✅ 已连接到云数据库');
  return cloudConnection;
}

/**
 * 创建基础数据结构
 */
async function createBaseCollections(cloudDB: mongoose.Connection) {
  console.log('\n📦 创建基础数据结构...');
  
  try {
    // 创建用户集合
    await cloudDB.db.createCollection('users');
    console.log('  - ✅ 创建users集合');
    
    // 创建照片集合
    await cloudDB.db.createCollection('photos');
    console.log('  - ✅ 创建photos集合');
    
    // 创建评论集合
    await cloudDB.db.createCollection('comments');
    console.log('  - ✅ 创建comments集合');
    
    // 创建点赞集合
    await cloudDB.db.createCollection('likes');
    console.log('  - ✅ 创建likes集合');
    
    // 创建关注集合
    await cloudDB.db.createCollection('follows');
    console.log('  - ✅ 创建follows集合');
    
  } catch (error: any) {
    if (error.code === 48) {
      console.log('  - ℹ️  集合已存在，跳过创建');
    } else {
      console.error('  - ❌ 创建集合失败:', error);
    }
  }
}

/**
 * 创建管理员账号
 */
async function createAdminUser(cloudDB: mongoose.Connection) {
  console.log('\n👤 创建管理员账号...');
  
  try {
    // 检查是否已存在管理员
    const existingAdmin = await cloudDB.db.collection('users').findOne({ 
      email: 'admin@example.com' 
    });
    
    if (existingAdmin) {
      console.log('  - ℹ️  管理员账号已存在，跳过创建');
      return;
    }
    
    // 创建管理员账号
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    const adminUser = {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      bio: '系统管理员',
      followers: [],
      following: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await cloudDB.db.collection('users').insertOne(adminUser);
    console.log('  - ✅ 管理员账号创建成功，ID:', result.insertedId);
    
  } catch (error) {
    console.error('  - ❌ 创建管理员账号失败:', error);
  }
}

/**
 * 创建示例数据
 */
async function createSampleData(cloudDB: mongoose.Connection) {
  console.log('\n🎨 创建示例数据...');
  
  try {
    // 检查是否已有数据
    const userCount = await cloudDB.db.collection('users').countDocuments({ role: { $ne: 'admin' } });
    
    if (userCount > 0) {
      console.log('  - ℹ️  示例数据已存在，跳过创建');
      return;
    }
    
    // 创建示例用户
    const hashedPassword = await bcrypt.hash('123456', 12);
    const sampleUsers = [
      {
        username: 'photographer1',
        email: 'photo1@example.com',
        password: hashedPassword,
        role: 'user',
        bio: '风景摄影师',
        avatar: 'https://photo-platform-oss.oss-cn-hangzhou.aliyuncs.com/avatars/photographer1.jpg',
        followers: [],
        following: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'photographer2',
        email: 'photo2@example.com',
        password: hashedPassword,
        role: 'user',
        bio: '人像摄影师',
        avatar: 'https://photo-platform-oss.oss-cn-hangzhou.aliyuncs.com/avatars/photographer2.jpg',
        followers: [],
        following: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const userResult = await cloudDB.db.collection('users').insertMany(sampleUsers);
    console.log(`  - ✅ 创建了 ${userResult.insertedCount} 个示例用户`);
    
    // 创建示例照片
    const userIds = Object.values(userResult.insertedIds);
    const samplePhotos = [
      {
        title: '山间晨雾',
        description: '清晨的山间薄雾，宛如仙境',
        imageUrl: 'https://photo-platform-oss.oss-cn-hangzhou.aliyuncs.com/photos/mountain-fog.jpg',
        photographer: userIds[0],
        tags: ['风景', '山景', '晨雾'],
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '城市夜景',
        description: '繁华都市的夜晚灯火',
        imageUrl: 'https://photo-platform-oss.oss-cn-hangzhou.aliyuncs.com/photos/city-night.jpg',
        photographer: userIds[1],
        tags: ['城市', '夜景', '灯光'],
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const photoResult = await cloudDB.db.collection('photos').insertMany(samplePhotos);
    console.log(`  - ✅ 创建了 ${photoResult.insertedCount} 张示例照片`);
    
  } catch (error) {
    console.error('  - ❌ 创建示例数据失败:', error);
  }
}

/**
 * 创建数据库索引
 */
async function createIndexes(cloudDB: mongoose.Connection) {
  console.log('\n🔍 创建数据库索引...');
  
  try {
    // 用户集合索引
    await cloudDB.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await cloudDB.db.collection('users').createIndex({ username: 1 });
    console.log('  - ✅ 创建users集合索引');
    
    // 照片集合索引
    await cloudDB.db.collection('photos').createIndex({ photographer: 1 });
    await cloudDB.db.collection('photos').createIndex({ tags: 1 });
    await cloudDB.db.collection('photos').createIndex({ createdAt: -1 });
    console.log('  - ✅ 创建photos集合索引');
    
    // 评论集合索引
    await cloudDB.db.collection('comments').createIndex({ photo: 1 });
    await cloudDB.db.collection('comments').createIndex({ author: 1 });
    console.log('  - ✅ 创建comments集合索引');
    
    // 点赞集合索引
    await cloudDB.db.collection('likes').createIndex({ user: 1, photo: 1 }, { unique: true });
    console.log('  - ✅ 创建likes集合索引');
    
    // 关注集合索引
    await cloudDB.db.collection('follows').createIndex({ follower: 1, following: 1 }, { unique: true });
    console.log('  - ✅ 创建follows集合索引');
    
  } catch (error) {
    console.error('  - ❌ 创建索引失败:', error);
  }
}

/**
 * 主初始化函数
 */
async function initCloudDB(): Promise<void> {
  console.log('🚀 开始初始化云数据库...\n');
  
  let cloudDB: mongoose.Connection | null = null;
  
  try {
    // 检查环境变量
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI 环境变量未配置');
    }
    
    // 连接云数据库
    console.log('🔌 连接云数据库...');
    cloudDB = await connectToCloudDB();
    
    // 创建基础数据结构
    await createBaseCollections(cloudDB);
    
    // 创建数据库索引
    await createIndexes(cloudDB);
    
    // 创建管理员账号
    await createAdminUser(cloudDB);
    
    // 创建示例数据
    await createSampleData(cloudDB);
    
    console.log('\n🎉 云数据库初始化完成！');
    console.log('\n📋 账号信息:');
    console.log('  管理员账号: admin@example.com');
    console.log('  管理员密码: admin123456');
    console.log('  示例用户: photo1@example.com / photo2@example.com');
    console.log('  示例密码: 123456');
    
  } catch (error) {
    console.error('❌ 云数据库初始化失败:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    if (cloudDB) {
      await cloudDB.close();
      console.log('\n🔌 已断开云数据库连接');
    }
  }
}

// 直接运行初始化
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  initCloudDB().catch(error => {
    console.error('初始化过程中发生错误:', error);
    process.exit(1);
  });
}

export { initCloudDB };