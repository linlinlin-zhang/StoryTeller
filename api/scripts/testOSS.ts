import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 先加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * 测试OSS连接和基本功能
 */
async function testOSSConnection(): Promise<boolean> {
  try {
    console.log('🔍 测试阿里云OSS连接...');
    console.log('OSS配置检查:');
    console.log('- Region:', process.env.ALI_OSS_REGION);
    console.log('- Bucket:', process.env.ALI_OSS_BUCKET);
    console.log('- AccessKeyId:', process.env.ALI_OSS_ACCESS_KEY_ID?.substring(0, 8) + '***');
    console.log('- AccessKeySecret:', process.env.ALI_OSS_ACCESS_KEY_SECRET ? '已配置' : '未配置');
    console.log('- Endpoint:', process.env.ALI_OSS_ENDPOINT);
    console.log('');
    
    // 检查必要的环境变量
    if (!process.env.ALI_OSS_ACCESS_KEY_ID || 
        !process.env.ALI_OSS_ACCESS_KEY_SECRET || 
        !process.env.ALI_OSS_BUCKET) {
      console.error('❌ OSS配置不完整，请检查环境变量');
      return false;
    }
    
    // 动态导入OSS服务
    const { ossService } = await import('../config/oss.js');
    
    // 检查OSS服务是否可用
    if (!ossService) {
      console.error('❌ OSS服务未初始化');
      return false;
    }
    
    // 创建测试文件
    const testContent = Buffer.from(`OSS连接测试\n时间: ${new Date().toISOString()}\n测试内容: Hello OSS!`);
    const testFileName = `connection_test_${Date.now()}.txt`;
    
    console.log('📤 开始上传测试文件:', testFileName);
    
    // 测试上传
    const uploadResult = await ossService.uploadFile(testFileName, testContent, 'test');
    
    if (uploadResult.success) {
      console.log('✅ OSS上传测试成功!');
      console.log('文件URL:', uploadResult.url);
      
      // 测试文件是否存在
      console.log('🔍 检查文件是否存在...');
      const exists = await ossService.fileExists(`test/${testFileName}`);
      
      if (exists) {
        console.log('✅ 文件存在性检查通过!');
      } else {
        console.log('⚠️ 文件存在性检查失败');
      }
      
      // 测试删除
      console.log('🗑️ 开始删除测试文件...');
      const deleteResult = await ossService.deleteFile(`test/${testFileName}`);
      
      if (deleteResult.success) {
        console.log('✅ OSS删除测试成功!');
      } else {
        console.log('⚠️ OSS删除测试失败:', deleteResult.error);
      }
      
      console.log('\n🎉 OSS连接测试完成，所有功能正常!');
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
 * 测试批量上传功能
 */
async function testBatchUpload(): Promise<boolean> {
  try {
    console.log('\n🔍 测试批量上传功能...');
    
    // 动态导入OSS服务
    const { ossService } = await import('../config/oss.js');
    
    // 创建多个测试文件
    const testFiles = [
      {
        fileName: `batch_test_1_${Date.now()}.txt`,
        fileBuffer: Buffer.from('批量测试文件 1')
      },
      {
        fileName: `batch_test_2_${Date.now()}.txt`,
        fileBuffer: Buffer.from('批量测试文件 2')
      },
      {
        fileName: `batch_test_3_${Date.now()}.txt`,
        fileBuffer: Buffer.from('批量测试文件 3')
      }
    ];
    
    console.log('📤 开始批量上传测试文件...');
    
    // 测试批量上传
    const uploadResults = await ossService.uploadMultipleFiles(testFiles, 'batch_test');
    
    let successCount = 0;
    const filesToDelete: string[] = [];
    
    uploadResults.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ 文件 ${index + 1} 上传成功:`, result.url);
        successCount++;
        filesToDelete.push(`batch_test/${result.originalFileName}`);
      } else {
        console.log(`❌ 文件 ${index + 1} 上传失败:`, result.error);
      }
    });
    
    console.log(`📊 批量上传结果: ${successCount}/${testFiles.length} 成功`);
    
    // 清理测试文件
    if (filesToDelete.length > 0) {
      console.log('🗑️ 清理测试文件...');
      for (const fileName of filesToDelete) {
        await ossService.deleteFile(fileName);
      }
      console.log('✅ 测试文件清理完成');
    }
    
    return successCount === testFiles.length;
  } catch (error) {
    console.error('❌ 批量上传测试失败:', error);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runOSSTests(): Promise<void> {
  console.log('🚀 开始OSS功能测试...\n');
  
  const results = {
    connection: false,
    batchUpload: false
  };
  
  try {
    // 测试基本连接
    results.connection = await testOSSConnection();
    
    // 如果基本连接成功，测试批量上传
    if (results.connection) {
      results.batchUpload = await testBatchUpload();
    }
    
    // 输出测试结果
    console.log('\n📋 OSS测试结果汇总:');
    console.log('==================');
    console.log(`基本连接: ${results.connection ? '✅ 正常' : '❌ 失败'}`);
    console.log(`批量上传: ${results.batchUpload ? '✅ 正常' : '❌ 失败'}`);
    
    if (results.connection && results.batchUpload) {
      console.log('\n🎉 OSS服务完全正常，可以开始图片迁移!');
    } else {
      console.log('\n❌ OSS服务存在问题，请检查配置!');
      if (!results.connection) {
        console.log('   - 请检查阿里云OSS配置和网络连接');
      }
      if (!results.batchUpload) {
        console.log('   - 批量上传功能异常');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 直接运行测试
runOSSTests().catch(console.error);

export { runOSSTests, testOSSConnection, testBatchUpload };