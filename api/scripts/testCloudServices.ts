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
    
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ MongoDB连接成功!');
    
    // 测试数据库操作
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 数据库中有 ${collections.length} 个集合:`, collections.map(c => c.name));
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    return false;
  }
}

/**
 * 测试OSS连接
 */
async function testOSSConnection(): Promise<boolean> {
  try {
    console.log('\n🔍 测试阿里云OSS连接...');
    console.log('OSS配置:');
    console.log('- Region:', process.env.ALI_OSS_REGION);
    console.log('- Bucket:', process.env.ALI_OSS_BUCKET);
    console.log('- AccessKeyId:', process.env.ALI_OSS_ACCESS_KEY_ID?.substring(0, 8) + '***');
    console.log('- AccessKeySecret:', process.env.ALI_OSS_ACCESS_KEY_SECRET ? '已配置' : '未配置');
    console.log('- Endpoint:', process.env.ALI_OSS_ENDPOINT);
    
    // 动态导入OSS服务
    const { ossService } = await import('../config/oss.js');
    
    // 检查OSS服务是否可用
    if (!ossService) {
      console.error('❌ OSS服务未初始化');
      return false;
    }
    
    // 创建测试文件
    const testContent = Buffer.from('Hello OSS Test - ' + new Date().toISOString());
    const testFileName = `test_${Date.now()}.txt`;
    
    console.log('📤 开始上传测试文件:', testFileName);
    
    // 测试上传
    const uploadResult = await ossService.uploadFile(testFileName, testContent, 'test');
    
    if (uploadResult.success) {
      console.log('✅ OSS上传测试成功!');
      console.log('文件URL:', uploadResult.url);
      
      // 测试删除
      console.log('🗑️ 开始删除测试文件...');
      const deleteResult = await ossService.deleteFile(`test/${testFileName}`);
      if (deleteResult.success) {
        console.log('✅ OSS删除测试成功!');
      } else {
        console.log('⚠️ OSS删除测试失败:', deleteResult.error);
      }
      
      return true;
    } else {
      console.error('❌ OSS上传测试失败:', uploadResult.error);
      return false;
    }
  } catch (error) {
    console.error('❌ OSS连接测试失败:', error);
    return false;
  }
}

/**
 * 测试Redis连接（可选）
 */
async function testRedisConnection(): Promise<boolean> {
  try {
    console.log('\n🔍 测试Redis连接...');
    
    // 动态导入Redis配置
    const { default: redis } = await import('../config/redis.js');
    
    // 测试连接
    await redis.ping();
    console.log('✅ Redis连接成功!');
    
    // 测试基本操作
    await redis.set('test_key', 'test_value', 'EX', 10);
    const value = await redis.get('test_key');
    
    if (value === 'test_value') {
      console.log('✅ Redis读写测试成功!');
      await redis.del('test_key');
      return true;
    } else {
      console.log('❌ Redis读写测试失败');
      return false;
    }
  } catch (error) {
    console.log('⚠️ Redis连接失败 (可选服务):', error.message);
    return false; // Redis是可选的，失败不影响主要功能
  }
}

/**
 * 主测试函数
 */
async function testAllServices(): Promise<void> {
  console.log('🚀 开始测试云服务连接...\n');
  
  // 首先检查环境变量
  console.log('🔍 检查环境变量配置:');
  console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '已配置' : '未配置');
  console.log('- ALI_OSS_ACCESS_KEY_ID:', process.env.ALI_OSS_ACCESS_KEY_ID ? '已配置' : '未配置');
  console.log('- ALI_OSS_ACCESS_KEY_SECRET:', process.env.ALI_OSS_ACCESS_KEY_SECRET ? '已配置' : '未配置');
  console.log('- ALI_OSS_BUCKET:', process.env.ALI_OSS_BUCKET ? '已配置' : '未配置');
  console.log('- ALI_OSS_REGION:', process.env.ALI_OSS_REGION || '未配置');
  console.log('- ALI_OSS_ENDPOINT:', process.env.ALI_OSS_ENDPOINT || '未配置');
  console.log('');
  
  const results = {
    mongodb: false,
    oss: false,
    redis: false
  };
  
  try {
    // 测试MongoDB
    results.mongodb = await testMongoDBConnection();
    
    // 测试OSS
    results.oss = await testOSSConnection();
    
    // 测试Redis
    results.redis = await testRedisConnection();
    
    // 输出测试结果
    console.log('\n📋 测试结果汇总:');
    console.log('==================');
    console.log(`MongoDB: ${results.mongodb ? '✅ 正常' : '❌ 失败'}`);
    console.log(`OSS:     ${results.oss ? '✅ 正常' : '❌ 失败'}`);
    console.log(`Redis:   ${results.redis ? '✅ 正常' : '⚠️ 失败 (可选)'}`);
    
    const criticalServices = results.mongodb && results.oss;
    
    if (criticalServices) {
      console.log('\n🎉 核心云服务连接正常，可以开始数据迁移!');
    } else {
      console.log('\n❌ 核心云服务连接失败，请检查配置!');
      if (!results.mongodb) {
        console.log('   - 请检查MONGODB_URI配置');
      }
      if (!results.oss) {
        console.log('   - 请检查阿里云OSS配置');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 已断开数据库连接');
    }
  }
}

// 如果直接运行此脚本
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  testAllServices().catch(console.error);
} else {
  // 直接运行测试（用于调试）
  testAllServices().catch(console.error);
}

export { testAllServices, testMongoDBConnection, testOSSConnection, testRedisConnection };