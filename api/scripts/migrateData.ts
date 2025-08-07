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

// 定义数据模型接口
interface IUser {
  _id?: any;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  role?: 'user' | 'admin';
  followers?: any[];
  following?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface IPhoto {
  _id?: any;
  title: string;
  description?: string;
  imageUrl: string;
  photographer: any;
  tags?: string[];
  likes?: any[];
  comments?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface IComment {
  _id?: any;
  content: string;
  author: any;
  photo: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ILike {
  _id?: any;
  user: any;
  photo: any;
  createdAt?: Date;
}

interface IFollow {
  _id?: any;
  follower: any;
  following: any;
  createdAt?: Date;
}

/**
 * 连接到本地数据库
 */
async function connectToLocalDB(): Promise<mongoose.Connection> {
  const localConnection = mongoose.createConnection('mongodb://localhost:27017/photography_platform');
  await localConnection.asPromise();
  console.log('✅ 已连接到本地数据库');
  return localConnection;
}

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
 * 获取本地数据库中的所有数据
 */
async function getLocalData(localDB: mongoose.Connection) {
  console.log('📊 正在获取本地数据...');
  
  const collections = await localDB.db.listCollections().toArray();
  console.log(`发现 ${collections.length} 个集合:`, collections.map(c => c.name));
  
  const data: any = {};
  
  // 获取所有集合的数据
  for (const collection of collections) {
    const collectionName = collection.name;
    const docs = await localDB.db.collection(collectionName).find({}).toArray();
    data[collectionName] = docs;
    console.log(`  - ${collectionName}: ${docs.length} 条记录`);
  }
  
  return data;
}

/**
 * 迁移数据到云数据库
 */
async function migrateDataToCloud(cloudDB: mongoose.Connection, localData: any) {
  console.log('🚀 开始迁移数据到云数据库...');
  
  let totalMigrated = 0;
  
  for (const [collectionName, documents] of Object.entries(localData)) {
    if (Array.isArray(documents) && (documents as any[]).length > 0) {
      console.log(`\n📦 迁移集合: ${collectionName}`);
      
      try {
        // 清空云数据库中的现有数据（可选）
        await cloudDB.db.collection(collectionName).deleteMany({});
        console.log(`  - 已清空云数据库中的 ${collectionName} 集合`);
        
        // 插入数据
        const result = await cloudDB.db.collection(collectionName).insertMany(documents as any[]);
        console.log(`  - 成功迁移 ${result.insertedCount} 条记录`);
        totalMigrated += result.insertedCount;
        
      } catch (error) {
        console.error(`  - ❌ 迁移 ${collectionName} 失败:`, error);
      }
    }
  }
  
  console.log(`\n🎉 数据迁移完成！总共迁移了 ${totalMigrated} 条记录`);
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
      console.log('  - 管理员账号已存在，跳过创建');
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
 * 验证迁移后的数据完整性
 */
async function validateMigration(cloudDB: mongoose.Connection, originalData: any) {
  console.log('\n🔍 验证数据完整性...');
  
  let isValid = true;
  
  for (const [collectionName, originalDocs] of Object.entries(originalData)) {
    if (Array.isArray(originalDocs) && (originalDocs as any[]).length > 0) {
      const cloudCount = await cloudDB.db.collection(collectionName).countDocuments();
      const originalCount = (originalDocs as any[]).length;
      
      console.log(`  - ${collectionName}: 原始 ${originalCount} 条，云端 ${cloudCount} 条`);
      
      if (cloudCount !== originalCount) {
        console.error(`    ❌ 数据不匹配！`);
        isValid = false;
      } else {
        console.log(`    ✅ 数据完整`);
      }
    }
  }
  
  if (isValid) {
    console.log('\n🎉 数据完整性验证通过！');
  } else {
    console.log('\n❌ 数据完整性验证失败，请检查迁移过程');
  }
  
  return isValid;
}

/**
 * 主迁移函数
 */
async function migrateData(): Promise<void> {
  console.log('🚀 开始数据迁移流程...\n');
  
  let localDB: mongoose.Connection | null = null;
  let cloudDB: mongoose.Connection | null = null;
  
  try {
    // 检查环境变量
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI 环境变量未配置');
    }
    
    // 连接数据库
    console.log('🔌 连接数据库...');
    localDB = await connectToLocalDB();
    cloudDB = await connectToCloudDB();
    
    // 获取本地数据
    const localData = await getLocalData(localDB);
    
    // 检查是否有数据需要迁移
    const hasData = Object.values(localData).some(docs => 
      Array.isArray(docs) && docs.length > 0
    );
    
    if (!hasData) {
      console.log('📭 本地数据库中没有数据需要迁移');
      return;
    }
    
    // 迁移数据
    await migrateDataToCloud(cloudDB, localData);
    
    // 创建管理员账号
    await createAdminUser(cloudDB);
    
    // 验证数据完整性
    await validateMigration(cloudDB, localData);
    
    console.log('\n🎉 数据迁移流程完成！');
    
  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    if (localDB) {
      await localDB.close();
      console.log('🔌 已断开本地数据库连接');
    }
    if (cloudDB) {
      await cloudDB.close();
      console.log('🔌 已断开云数据库连接');
    }
  }
}

// 直接运行迁移
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  migrateData().catch(error => {
    console.error('迁移过程中发生错误:', error);
    process.exit(1);
  });
}

export { migrateData, connectToLocalDB, connectToCloudDB };