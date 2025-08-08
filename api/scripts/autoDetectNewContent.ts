import { ossService } from '../config/oss.js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ImageMapping {
  [key: string]: string;
}

interface NewPhotographer {
  name: string;
  categories: string[];
  photoCount: number;
  photos: string[];
}

interface DetectionResult {
  newPhotographers: NewPhotographer[];
  newPhotos: {
    photographer: string;
    category: string;
    photos: string[];
  }[];
  totalNewPhotos: number;
  missingFiles: string[];
  ossFiles: string[];
}

/**
 * 读取当前的图片映射文件
 */
async function getCurrentMappings(): Promise<ImageMapping> {
  try {
    const mappingPath = join(__dirname, '../../src/utils/imageMapping.ts');
    const content = await fs.readFile(mappingPath, 'utf-8');
    
    // 提取映射对象 - 支持两种变量名
    let mappingMatch = content.match(/export const imageMapping: \{ \[key: string\]: string \} = \{([\s\S]*?)\};/);
    if (!mappingMatch) {
      mappingMatch = content.match(/export const imageUrlMapping: Record<string, string> = \{([\s\S]*?)\};/);
    }
    if (!mappingMatch) {
      throw new Error('无法解析映射文件格式');
    }
    
    const mappingContent = mappingMatch[1];
    const mappings: ImageMapping = {};
    
    // 解析每一行映射
    const lines = mappingContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*['"]([^'"]+)['"]:\s*['"]([^'"]+)['"],?\s*$/);
      if (match) {
        mappings[match[1]] = match[2];
      }
    }
    
    return mappings;
  } catch (error) {
    console.error('读取映射文件失败:', error);
    return {};
  }
}

/**
 * 扫描OSS存储获取当前所有图片
 */
async function scanOSSImages(): Promise<string[]> {
  console.log('🔍 正在扫描OSS存储...');
  
  try {
    // 列出所有以 'images/' 开头的文件
    const result = await ossService.listAllFiles('images/');
    
    if (!result.success) {
      console.warn('⚠️ OSS扫描失败，将使用本地映射进行验证:', result.error);
      return [];
    }
    
    const allImages = result.files || [];
    
    // 过滤出图片文件并转换为本地路径格式
    const imageFiles = allImages
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/${file}`); // 添加前缀斜杠以匹配本地路径格式
    
    console.log(`📊 OSS中发现 ${imageFiles.length} 张图片`);
    return imageFiles;
  } catch (error) {
    console.warn('⚠️ OSS扫描失败，将使用本地映射进行验证:', error);
    return [];
  }
}

/**
 * 分析新发现的内容和缺失的文件
 */
function analyzeContent(ossImages: string[], currentMappings: ImageMapping): DetectionResult {
  const mappedImages = new Set(Object.keys(currentMappings));
  const ossImageSet = new Set(ossImages);
  
  // 找出OSS中有但映射中没有的新图片
  const newImages = ossImages.filter(img => !mappedImages.has(img));
  
  // 找出映射中有但OSS中没有的缺失文件
  const missingFiles = Array.from(mappedImages).filter(img => !ossImageSet.has(img));
  
  const newPhotographers: NewPhotographer[] = [];
  const newPhotos: { photographer: string; category: string; photos: string[] }[] = [];
  
  // 按摄影师分组新图片
  const photographerGroups: { [key: string]: { [category: string]: string[] } } = {};
  
  for (const image of newImages) {
    const pathParts = image.split('/');
    if (pathParts.length >= 4 && pathParts[2] === '摄影师') {
      const photographer = pathParts[3];
      const category = pathParts[4] || '未分类';
      
      if (!photographerGroups[photographer]) {
        photographerGroups[photographer] = {};
      }
      if (!photographerGroups[photographer][category]) {
        photographerGroups[photographer][category] = [];
      }
      photographerGroups[photographer][category].push(image);
    }
  }
  
  // 检查是否有新摄影师
  const existingPhotographers = new Set();
  for (const mappedImage of Object.keys(currentMappings)) {
    const pathParts = mappedImage.split('/');
    if (pathParts.length >= 4 && pathParts[2] === '摄影师') {
      existingPhotographers.add(pathParts[3]);
    }
  }
  
  for (const [photographer, categories] of Object.entries(photographerGroups)) {
    const isNewPhotographer = !existingPhotographers.has(photographer);
    const categoryNames = Object.keys(categories);
    const allPhotos = Object.values(categories).flat();
    
    if (isNewPhotographer) {
      newPhotographers.push({
        name: photographer,
        categories: categoryNames,
        photoCount: allPhotos.length,
        photos: allPhotos
      });
    } else {
      // 现有摄影师的新照片
      for (const [category, photos] of Object.entries(categories)) {
        newPhotos.push({
          photographer,
          category,
          photos
        });
      }
    }
  }
  
  return {
    newPhotographers,
    newPhotos,
    totalNewPhotos: newImages.length,
    missingFiles,
    ossFiles: ossImages
  };
}

/**
 * 生成建议的操作
 */
function generateRecommendations(result: DetectionResult): string[] {
  const recommendations: string[] = [];
  
  if (result.missingFiles.length > 0) {
    recommendations.push(`⚠️ 发现 ${result.missingFiles.length} 个缺失文件:`);
    result.missingFiles.slice(0, 10).forEach(file => {
      recommendations.push(`   - ${file}`);
    });
    if (result.missingFiles.length > 10) {
      recommendations.push(`   ... 还有 ${result.missingFiles.length - 10} 个文件`);
    }
    recommendations.push('   建议: 从imageMapping.ts中移除这些缺失文件的映射');
    recommendations.push('');
  }
  
  if (result.newPhotographers.length > 0) {
    recommendations.push(`🆕 发现 ${result.newPhotographers.length} 位新摄影师:`);
    for (const photographer of result.newPhotographers) {
      recommendations.push(`   - ${photographer.name}: ${photographer.photoCount}张照片，分类: ${photographer.categories.join(', ')}`);
    }
    recommendations.push('   建议: 在mockData.ts中添加新摄影师档案');
    recommendations.push('');
  }
  
  if (result.newPhotos.length > 0) {
    recommendations.push(`📸 现有摄影师的新照片:`);
    for (const group of result.newPhotos) {
      recommendations.push(`   - ${group.photographer}/${group.category}: ${group.photos.length}张新照片`);
    }
    recommendations.push('   建议: 更新对应摄影师的作品列表');
    recommendations.push('');
  }
  
  if (result.totalNewPhotos > 0 || result.missingFiles.length > 0) {
    recommendations.push(`📋 需要执行的操作:`);
    if (result.missingFiles.length > 0) {
      recommendations.push(`   1. 清理imageMapping.ts中${result.missingFiles.length}个缺失文件的映射`);
    }
    if (result.totalNewPhotos > 0) {
      recommendations.push(`   2. 更新imageMapping.ts添加${result.totalNewPhotos}张新照片的OSS映射`);
      recommendations.push(`   3. 更新mockData.ts添加新摄影师或新作品`);
    }
    recommendations.push(`   4. 运行验证脚本确保所有引用正确`);
  }
  
  return recommendations;
}

/**
 * 自动更新imageMapping.ts文件
 */
async function updateImageMapping(result: DetectionResult, currentMappings: ImageMapping): Promise<void> {
  if (result.missingFiles.length === 0 && result.totalNewPhotos === 0) {
    return;
  }
  
  console.log('\n🔧 正在更新imageMapping.ts...');
  
  // 创建新的映射对象
  const newMappings = { ...currentMappings };
  
  // 移除缺失的文件
  for (const missingFile of result.missingFiles) {
    delete newMappings[missingFile];
    console.log(`   ❌ 移除缺失文件: ${missingFile}`);
  }
  
  // 添加新文件的映射（使用OSS URL）
  const newFiles = [...result.newPhotographers.flatMap(p => p.photos), ...result.newPhotos.flatMap(p => p.photos)];
  for (const newFile of newFiles) {
    // 生成OSS URL（这里需要根据实际OSS配置调整）
    const ossKey = newFile.substring(1); // 移除开头的斜杠
    const ossUrl = `https://${process.env.ALI_OSS_BUCKET}.${process.env.ALI_OSS_ENDPOINT?.replace('https://', '') || 'oss-cn-hangzhou.aliyuncs.com'}/${ossKey}`;
    newMappings[newFile] = ossUrl;
    console.log(`   ✅ 添加新文件: ${newFile}`);
  }
  
  // 生成新的映射文件内容
  const mappingEntries = Object.entries(newMappings)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `  "${key}": "${value}"`);
  
  const newContent = `// 图片映射配置 - 自动生成，请勿手动编辑
// 最后更新: ${new Date().toLocaleString()}

export const imageMapping: { [key: string]: string } = {
${mappingEntries.join(',\n')}
};

// 获取图片URL的辅助函数
export function getImageUrl(path: string): string {
  return imageMapping[path] || path;
}
`;
  
  // 写入文件
  const mappingPath = join(__dirname, '../../src/utils/imageMapping.ts');
  await fs.writeFile(mappingPath, newContent, 'utf-8');
  
  console.log(`✅ imageMapping.ts已更新，包含${Object.keys(newMappings).length}个映射`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始检测OSS存储中的内容变化...');
  console.log('=' .repeat(60));
  
  try {
    // 获取当前映射和OSS图片
    console.log('📋 正在加载当前映射...');
    const currentMappings = await getCurrentMappings();
    console.log(`📊 当前已映射图片: ${Object.keys(currentMappings).length}张`);
    
    const ossImages = await scanOSSImages();
    
    // 如果OSS不可用，只进行本地映射验证
    if (ossImages.length === 0) {
      console.log('\n🔍 OSS不可用，进行本地映射完整性检查...');
      console.log('📊 当前映射文件包含', Object.keys(currentMappings).length, '个图片路径');
      
      // 简单的映射文件验证
      const invalidMappings = Object.entries(currentMappings).filter(([key, value]) => {
        return !key.startsWith('/images/') || !value.startsWith('http');
      });
      
      if (invalidMappings.length > 0) {
        console.log('⚠️ 发现', invalidMappings.length, '个可能无效的映射:');
        invalidMappings.slice(0, 5).forEach(([key, value]) => {
          console.log(`   - ${key} -> ${value}`);
        });
      } else {
        console.log('✅ 本地映射文件格式正确！');
      }
      
      console.log('\n💡 建议: 配置OSS环境变量以启用完整的同步检测功能');
      return;
    }
    
    // 分析内容变化
    console.log('\n🎯 分析内容变化...');
    const result = analyzeContent(ossImages, currentMappings);
    
    console.log('\n📊 检测结果:');
    console.log('-'.repeat(40));
    
    if (result.totalNewPhotos === 0 && result.missingFiles.length === 0) {
      console.log('✅ OSS存储与本地映射完全同步！');
    } else {
      if (result.missingFiles.length > 0) {
        console.log(`⚠️ 发现 ${result.missingFiles.length} 个缺失文件`);
      }
      if (result.totalNewPhotos > 0) {
        console.log(`🆕 发现 ${result.totalNewPhotos} 张新图片`);
        console.log(`👤 新摄影师: ${result.newPhotographers.length} 位`);
        console.log(`📸 现有摄影师新照片组: ${result.newPhotos.length} 组`);
      }
      
      // 输出详细信息
      if (result.missingFiles.length > 0) {
        console.log('\n⚠️ 缺失文件详情:');
        result.missingFiles.slice(0, 10).forEach(file => {
          console.log(`   ❌ ${file}`);
        });
        if (result.missingFiles.length > 10) {
          console.log(`   ... 还有 ${result.missingFiles.length - 10} 个文件`);
        }
      }
      
      if (result.newPhotographers.length > 0) {
        console.log('\n🆕 新摄影师详情:');
        for (const photographer of result.newPhotographers) {
          console.log(`   📷 ${photographer.name}`);
          console.log(`      - 照片数量: ${photographer.photoCount}张`);
          console.log(`      - 分类: ${photographer.categories.join(', ')}`);
          console.log(`      - 示例照片: ${photographer.photos.slice(0, 3).join(', ')}${photographer.photos.length > 3 ? '...' : ''}`);
        }
      }
      
      if (result.newPhotos.length > 0) {
        console.log('\n📸 现有摄影师新照片:');
        for (const group of result.newPhotos) {
          console.log(`   👤 ${group.photographer} - ${group.category}: ${group.photos.length}张`);
        }
      }
      
      // 自动更新映射文件
      await updateImageMapping(result, currentMappings);
      
      // 生成建议
      console.log('\n💡 建议操作:');
      const recommendations = generateRecommendations(result);
      for (const rec of recommendations) {
        console.log(rec);
      }
    }
    
    console.log('\n✨ OSS检测完成！');
    
  } catch (error) {
    console.error('❌ OSS检测过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main();

export { main as autoDetectOSSContent };