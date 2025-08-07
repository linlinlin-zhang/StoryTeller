import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 先加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * 测试MongoDB连接
 */
async function testMongoDBConnection(): Promise<boolean> {
  try {
    console.log('🔍 测试MongoDB连接...');
    console.log('连接字符串:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    // 设置连接超时
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // 10秒超时
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    };
    
    await mongoose.connect(process.env.MONGODB_URI as string, connectionOptions);
    console.log('✅ MongoDB连接成功!');
    
    // 测试数据库操作
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 数据库中有 ${collections.length} 个集合:`, collections.map(c => c.name));
    
    // 测试基本操作
    const dbStats = await mongoose.connection.db.stats();
    console.log('📈 数据库统计:');
    console.log(`  - 数据库大小: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - 索引大小: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - 文档数量: ${dbStats.objects}`);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    return false;
  } finally {
    // 关闭数据库连接
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 已断开数据库连接');
    }
  }
}

/**
 * 主测试函数
 */
async function testMongoDB(): Promise<void> {
  console.log('🚀 开始测试云MongoDB连接...\n');
  
  // 检查环境变量
  console.log('🔍 检查环境变量配置:');
  console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '已配置' : '未配置');
  console.log('');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI 环境变量未配置');
    return;
  }
  
  try {
    const result = await testMongoDBConnection();
    
    if (result) {
      console.log('\n🎉 云MongoDB连接正常，可以开始数据迁移!');
    } else {
      console.log('\n❌ 云MongoDB连接失败，请检查配置!');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 直接运行测试
testMongoDB().catch(console.error);

export { testMongoDBConnection };