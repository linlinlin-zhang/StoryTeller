import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { scanImageFiles } from './migrateImages.js';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 先加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface ImageChangeResult {
  newImages: string[];
  deletedImages: string[];
  unchangedImages: string[];
  currentImages: string[];
  previousImages: string[];
}

/**
 * 检测图片文件变化
 */
async function detectImageChanges(): Promise<ImageChangeResult> {
  console.log('🔍 开始检测图片文件变化...');
  
  const projectRoot = path.join(__dirname, '../..');
  const imagesDir = path.join(projectRoot, 'images');
  const scanResultPath = path.join(projectRoot, 'scripts/image-scan-result.json');
  
  // 扫描当前图片文件
  console.log('📂 扫描当前图片文件...');
  const currentImageFiles = await scanImageFiles(imagesDir);
  const currentImages = currentImageFiles.map(file => 
    '/' + file.relativePath.replace(/\\/g, '/')
  );
  
  console.log(`📊 当前找到 ${currentImages.length} 个图片文件`);
  
  // 读取之前的扫描结果
  let previousImages: string[] = [];
  if (existsSync(scanResultPath)) {
    try {
      const scanResult = JSON.parse(await fs.readFile(scanResultPath, 'utf-8'));
      previousImages = scanResult.localImages || [];
      console.log(`📋 之前记录了 ${previousImages.length} 个图片文件`);
    } catch (error) {
      console.warn('⚠️ 无法读取之前的扫描结果，将视为全新扫描');
    }
  } else {
    console.log('📝 未找到之前的扫描结果，将视为全新扫描');
  }
  
  // 比较变化
  const newImages = currentImages.filter(img => !previousImages.includes(img));
  const deletedImages = previousImages.filter(img => !currentImages.includes(img));
  const unchangedImages = currentImages.filter(img => previousImages.includes(img));
  
  console.log('\n📈 变化统计:');
  console.log('==================');
  console.log(`🆕 新增图片: ${newImages.length} 个`);
  console.log(`🗑️ 删除图片: ${deletedImages.length} 个`);
  console.log(`📌 未变化图片: ${unchangedImages.length} 个`);
  
  if (newImages.length > 0) {
    console.log('\n🆕 新增的图片:');
    newImages.forEach(img => console.log(`   + ${img}`));
  }
  
  if (deletedImages.length > 0) {
    console.log('\n🗑️ 删除的图片:');
    deletedImages.forEach(img => console.log(`   - ${img}`));
  }
  
  // 更新扫描结果文件
  const newScanResult = {
    timestamp: new Date().toISOString(),
    localImages: currentImages,
    existingImages: currentImages // 保持兼容性
  };
  
  await fs.writeFile(scanResultPath, JSON.stringify(newScanResult, null, 2), 'utf-8');
  console.log(`\n💾 已更新扫描结果文件: ${scanResultPath}`);
  
  return {
    newImages,
    deletedImages,
    unchangedImages,
    currentImages,
    previousImages
  };
}

/**
 * 上传新增的图片到OSS
 */
async function uploadNewImages(newImages: string[]): Promise<void> {
  if (newImages.length === 0) {
    console.log('\n✅ 没有新增图片需要上传');
    return;
  }
  
  console.log(`\n📤 开始上传 ${newImages.length} 个新增图片到OSS...`);
  
  const { uploadImageToOSS } = await import('./migrateImages.js');
  const projectRoot = path.join(__dirname, '../..');
  const imagesDir = path.join(projectRoot, 'images');
  
  const uploadResults = [];
  
  for (let i = 0; i < newImages.length; i++) {
    const imagePath = newImages[i];
    const localPath = path.join(imagesDir, imagePath.replace('/images/', ''));
    
    console.log(`[${i + 1}/${newImages.length}] 上传: ${imagePath}`);
    
    try {
      const stats = await fs.stat(localPath);
      const imageFile = {
        localPath,
        relativePath: imagePath.replace('/images/', ''),
        fileName: path.basename(localPath),
        size: stats.size
      };
      
      const result = await uploadImageToOSS(imageFile);
      uploadResults.push({ imagePath, result });
      
      if (result.success) {
        console.log(`   ✅ 成功: ${result.ossUrl}`);
      } else {
        console.log(`   ❌ 失败: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    // 稍作延迟避免请求过于频繁
    if (i < newImages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  const successCount = uploadResults.filter(r => r.result.success).length;
  console.log(`\n📊 上传结果: ${successCount}/${newImages.length} 成功`);
}

/**
 * 更新图片映射文件
 */
async function updateImageMapping(newImages: string[], deletedImages: string[]): Promise<void> {
  console.log('\n🔄 更新图片映射文件...');
  
  const mappingPath = path.join(__dirname, '../../src/utils/imageMapping.ts');
  
  if (!existsSync(mappingPath)) {
    console.log('⚠️ 图片映射文件不存在，将创建新文件');
    return;
  }
  
  // 读取现有映射
  const mappingContent = await fs.readFile(mappingPath, 'utf-8');
  const mappingMatch = mappingContent.match(/export const imageUrlMapping: Record<string, string> = ({[\s\S]*?});/);
  
  if (!mappingMatch) {
    console.log('❌ 无法解析现有映射文件');
    return;
  }
  
  let mapping: Record<string, string>;
  try {
    mapping = JSON.parse(mappingMatch[1]);
  } catch (error) {
    console.log('❌ 映射文件格式错误');
    return;
  }
  
  // 移除已删除图片的映射
  deletedImages.forEach(img => {
    if (mapping[img]) {
      delete mapping[img];
      console.log(`🗑️ 移除映射: ${img}`);
    }
  });
  
  // 为新增图片添加临时映射（实际URL需要上传后更新）
  newImages.forEach(img => {
    if (!mapping[img]) {
      mapping[img] = img; // 临时使用本地路径
      console.log(`🆕 添加临时映射: ${img}`);
    }
  });
  
  // 生成新的映射文件内容
  const newMappingContent = `// 图片URL映射文件\n// 自动生成于: ${new Date().toISOString()}\n\nexport const imageUrlMapping: Record<string, string> = ${JSON.stringify(mapping, null, 2)};\n\n// 获取图片URL的工具函数\nexport function getImageUrl(localPath: string): string {\n  return imageUrlMapping[localPath] || localPath;\n}\n\nexport default imageUrlMapping;\n`;
  
  await fs.writeFile(mappingPath, newMappingContent, 'utf-8');
  console.log(`✅ 已更新图片映射文件: ${mappingPath}`);
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    // 检测变化
    const changes = await detectImageChanges();
    
    if (changes.newImages.length === 0 && changes.deletedImages.length === 0) {
      console.log('\n🎉 没有检测到图片变化，无需处理');
      return;
    }
    
    // 上传新增图片
    await uploadNewImages(changes.newImages);
    
    // 更新映射文件
    await updateImageMapping(changes.newImages, changes.deletedImages);
    
    console.log('\n🎉 图片变化处理完成!');
    console.log('\n📝 下一步:');
    console.log('   1. 检查图片映射文件是否正确更新');
    console.log('   2. 更新网站数据文件，添加新图片到相应页面');
    console.log('   3. 移除已删除图片在网站中的引用');
    console.log('   4. 测试网站功能是否正常');
    
  } catch (error) {
    console.error('❌ 处理过程中发生错误:', error);
  }
}

// 直接运行
main().catch(console.error);

export { detectImageChanges, uploadNewImages, updateImageMapping };