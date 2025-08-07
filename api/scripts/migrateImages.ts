import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 先加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface ImageFile {
  localPath: string;
  relativePath: string;
  fileName: string;
  size: number;
}

interface MigrationResult {
  success: boolean;
  localPath: string;
  ossUrl?: string;
  error?: string;
}

/**
 * 扫描指定目录下的所有图片文件
 */
async function scanImageFiles(directory: string): Promise<ImageFile[]> {
  const imageFiles: ImageFile[] = [];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  
  async function scanDirectory(dir: string): Promise<void> {
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          // 递归扫描子目录
          await scanDirectory(fullPath);
        } else if (item.isFile()) {
          const ext = path.extname(item.name).toLowerCase();
          if (imageExtensions.includes(ext)) {
            const stats = await fs.stat(fullPath);
            const relativePath = path.relative(directory, fullPath).replace(/\\/g, '/');
            
            imageFiles.push({
              localPath: fullPath,
              relativePath,
              fileName: item.name,
              size: stats.size
            });
          }
        }
      }
    } catch (error) {
      console.warn(`无法扫描目录 ${dir}:`, error);
    }
  }
  
  if (existsSync(directory)) {
    await scanDirectory(directory);
  }
  
  return imageFiles;
}

/**
 * 上传单个图片文件到OSS
 */
async function uploadImageToOSS(imageFile: ImageFile): Promise<MigrationResult> {
  try {
    // 动态导入OSS服务
    const { ossService } = await import('../config/oss.js');
    
    // 读取文件内容
    const fileBuffer = await fs.readFile(imageFile.localPath);
    
    // 构建OSS文件路径，保持原有的目录结构
    const ossPath = imageFile.relativePath;
    const folder = path.dirname(ossPath).replace(/\\/g, '/');
    const fileName = path.basename(ossPath);
    
    // 上传到OSS
    const uploadResult = await ossService.uploadFile(fileName, fileBuffer, folder === '.' ? 'images' : `images/${folder}`);
    
    if (uploadResult.success) {
      return {
        success: true,
        localPath: imageFile.localPath,
        ossUrl: uploadResult.url
      };
    } else {
      return {
        success: false,
        localPath: imageFile.localPath,
        error: uploadResult.error
      };
    }
  } catch (error) {
    return {
      success: false,
      localPath: imageFile.localPath,
      error: error instanceof Error ? error.message : '上传失败'
    };
  }
}

/**
 * 批量上传图片到OSS
 */
async function batchUploadImages(imageFiles: ImageFile[], batchSize: number = 5): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];
  
  console.log(`开始批量上传 ${imageFiles.length} 个图片文件...`);
  
  for (let i = 0; i < imageFiles.length; i += batchSize) {
    const batch = imageFiles.slice(i, i + batchSize);
    console.log(`\n上传批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(imageFiles.length / batchSize)} (${batch.length} 个文件)`);
    
    const batchPromises = batch.map(async (imageFile, index) => {
      console.log(`  [${i + index + 1}/${imageFiles.length}] 上传: ${imageFile.relativePath}`);
      const result = await uploadImageToOSS(imageFile);
      
      if (result.success) {
        console.log(`    ✅ 成功: ${result.ossUrl}`);
      } else {
        console.log(`    ❌ 失败: ${result.error}`);
      }
      
      return result;
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // 批次间稍作延迟，避免请求过于频繁
    if (i + batchSize < imageFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * 生成图片URL映射文件
 */
async function generateUrlMapping(results: MigrationResult[]): Promise<void> {
  const mapping: Record<string, string> = {};
  
  results.forEach(result => {
    if (result.success && result.ossUrl) {
      // 将本地路径转换为前端使用的路径格式
      const frontendPath = '/' + result.localPath
        .replace(/\\/g, '/')
        .replace(/.*\/public\//, '')
        .replace(/.*\/images\//, 'images/');
      
      mapping[frontendPath] = result.ossUrl;
    }
  });
  
  const mappingContent = `// 图片URL映射文件\n// 自动生成于: ${new Date().toISOString()}\n\nexport const imageUrlMapping: Record<string, string> = ${JSON.stringify(mapping, null, 2)};\n\n// 获取图片URL的工具函数\nexport function getImageUrl(localPath: string): string {\n  return imageUrlMapping[localPath] || localPath;\n}\n\nexport default imageUrlMapping;\n`;
  
  const mappingPath = path.join(__dirname, '../../src/utils/imageMapping.ts');
  await fs.writeFile(mappingPath, mappingContent, 'utf-8');
  
  console.log(`\n📝 图片URL映射文件已生成: ${mappingPath}`);
}

/**
 * 主迁移函数
 */
async function migrateImages(): Promise<void> {
  console.log('🚀 开始图片迁移流程...\n');
  
  try {
    // 检查OSS服务是否可用
    const { ossService } = await import('../config/oss.js');
    
    // 扫描可能的图片目录
    const projectRoot = path.join(__dirname, '../..');
    const scanDirectories = [
      path.join(projectRoot, 'public/images'),
      path.join(projectRoot, 'src/assets'),
      path.join(projectRoot, 'images'),
      path.join(projectRoot, 'static/images')
    ];
    
    let allImageFiles: ImageFile[] = [];
    
    for (const dir of scanDirectories) {
      console.log(`🔍 扫描目录: ${dir}`);
      const imageFiles = await scanImageFiles(dir);
      
      if (imageFiles.length > 0) {
        console.log(`  找到 ${imageFiles.length} 个图片文件`);
        allImageFiles.push(...imageFiles);
      } else {
        console.log(`  未找到图片文件`);
      }
    }
    
    if (allImageFiles.length === 0) {
      console.log('\n⚠️ 未找到任何图片文件，迁移结束。');
      console.log('\n💡 提示: 如果您有图片文件，请将它们放在以下目录之一:');
      scanDirectories.forEach(dir => console.log(`   - ${dir}`));
      return;
    }
    
    console.log(`\n📊 扫描结果: 共找到 ${allImageFiles.length} 个图片文件`);
    
    // 显示文件大小统计
    const totalSize = allImageFiles.reduce((sum, file) => sum + file.size, 0);
    console.log(`📦 总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // 按类型统计
    const typeStats: Record<string, number> = {};
    allImageFiles.forEach(file => {
      const ext = path.extname(file.fileName).toLowerCase();
      typeStats[ext] = (typeStats[ext] || 0) + 1;
    });
    
    console.log('📋 文件类型统计:');
    Object.entries(typeStats).forEach(([ext, count]) => {
      console.log(`   ${ext}: ${count} 个`);
    });
    
    // 开始上传
    console.log('\n📤 开始上传到OSS...');
    const results = await batchUploadImages(allImageFiles);
    
    // 统计结果
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log('\n📋 迁移结果统计:');
    console.log('==================');
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`❌ 失败: ${failCount} 个`);
    console.log(`📊 成功率: ${((successCount / results.length) * 100).toFixed(1)}%`);
    
    if (failCount > 0) {
      console.log('\n❌ 失败的文件:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   ${result.localPath}: ${result.error}`);
      });
    }
    
    // 生成URL映射文件
    if (successCount > 0) {
      await generateUrlMapping(results);
      
      console.log('\n🎉 图片迁移完成!');
      console.log('\n📝 下一步:');
      console.log('   1. 检查生成的 src/utils/imageMapping.ts 文件');
      console.log('   2. 在前端代码中使用 getImageUrl() 函数获取OSS图片URL');
      console.log('   3. 测试图片显示是否正常');
    }
    
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error);
  }
}

// 直接运行迁移
migrateImages().catch(console.error);

export { migrateImages, scanImageFiles, uploadImageToOSS, generateUrlMapping };