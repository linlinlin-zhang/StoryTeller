import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取当前的图片映射
function getCurrentMappings(): Record<string, string> {
  const mappingPath = path.join(__dirname, '../../src/utils/imageMapping.ts');
  const content = readFileSync(mappingPath, 'utf-8');
  
  const mappingMatch = content.match(/export const imageUrlMapping: Record<string, string> = \{([\s\S]*?)\};/);
  if (!mappingMatch) {
    throw new Error('无法找到图片映射对象');
  }
  
  const mappingContent = mappingMatch[1];
  const mappings: Record<string, string> = {};
  
  const lines = mappingContent.split('\n');
  for (const line of lines) {
    const match = line.match(/"([^"]+)":\s*"([^"]+)"/); 
    if (match) {
      mappings[match[1]] = match[2];
    }
  }
  
  return mappings;
}

// 分析OSS存储结构
function analyzeOssStructure(mappings: Record<string, string>) {
  console.log('📊 OSS存储结构分析:');
  
  const categories = new Map<string, number>();
  const photographers = new Map<string, number>();
  const invalidPaths: string[] = [];
  const validMappings: Record<string, string> = {};
  
  for (const [localPath, ossUrl] of Object.entries(mappings)) {
    // 检查是否为有效的相对路径
    if (localPath.startsWith('/C:') || localPath.includes('\\')) {
      invalidPaths.push(localPath);
      continue;
    }
    
    validMappings[localPath] = ossUrl;
    
    // 分析路径结构
    const pathParts = localPath.split('/');
    if (pathParts.length >= 3) {
      const category = pathParts[1]; // 如 "摄影师", "主页地点图", "头像"
      categories.set(category, (categories.get(category) || 0) + 1);
      
      if (category === '摄影师' && pathParts.length >= 4) {
        const photographer = pathParts[2];
        photographers.set(photographer, (photographers.get(photographer) || 0) + 1);
      }
    }
  }
  
  console.log('\n📁 按类别统计:');
  for (const [category, count] of categories.entries()) {
    console.log(`   ${category}: ${count} 张`);
  }
  
  console.log('\n👨‍💼 按摄影师统计:');
  for (const [photographer, count] of photographers.entries()) {
    console.log(`   ${photographer}: ${count} 张`);
  }
  
  if (invalidPaths.length > 0) {
    console.log('\n❌ 发现无效路径:');
    invalidPaths.forEach(path => {
      console.log(`   ${path}`);
    });
  }
  
  return { validMappings, invalidPaths, categories, photographers };
}

// 生成优化后的映射文件
function generateOptimizedMapping(validMappings: Record<string, string>) {
  const timestamp = new Date().toISOString();
  
  let content = `// 图片URL映射文件\n// 自动生成于: ${timestamp}\n// 已优化：移除无效路径，按类别排序\n\nexport const imageUrlMapping: Record<string, string> = {\n`;
  
  // 按类别排序
  const sortedEntries = Object.entries(validMappings).sort(([a], [b]) => {
    const aCategory = a.split('/')[1] || '';
    const bCategory = b.split('/')[1] || '';
    
    if (aCategory !== bCategory) {
      return aCategory.localeCompare(bCategory);
    }
    
    return a.localeCompare(b);
  });
  
  for (const [localPath, ossUrl] of sortedEntries) {
    content += `  "${localPath}": "${ossUrl}",\n`;
  }
  
  content += `};\n\n// 获取图片URL的工具函数\nexport function getImageUrl(localPath: string): string {\n  const url = imageUrlMapping[localPath];\n  if (!url) {\n    console.warn('图片映射未找到:', localPath);\n    return localPath; // 降级返回原路径\n  }\n  return url;\n}\n`;
  
  return content;
}

// 主函数
async function optimizeOssStructure() {
  console.log('🔧 开始优化OSS存储结构...');
  
  try {
    const currentMappings = getCurrentMappings();
    console.log(`📋 当前映射数量: ${Object.keys(currentMappings).length}`);
    
    const { validMappings, invalidPaths } = analyzeOssStructure(currentMappings);
    
    if (invalidPaths.length > 0) {
      console.log(`\n🧹 清理 ${invalidPaths.length} 个无效路径...`);
      
      // 生成优化后的映射文件
      const optimizedContent = generateOptimizedMapping(validMappings);
      const mappingPath = path.join(__dirname, '../../src/utils/imageMapping.ts');
      
      // 备份原文件
      const backupPath = mappingPath + '.backup.' + Date.now();
      const originalContent = readFileSync(mappingPath, 'utf-8');
      writeFileSync(backupPath, originalContent);
      console.log(`📦 原文件已备份至: ${path.basename(backupPath)}`);
      
      // 写入优化后的文件
      writeFileSync(mappingPath, optimizedContent);
      console.log('✅ 映射文件已优化');
      
      console.log(`\n📊 优化结果:`);
      console.log(`   - 有效映射: ${Object.keys(validMappings).length}`);
      console.log(`   - 移除无效: ${invalidPaths.length}`);
    } else {
      console.log('\n✨ OSS存储结构已经是最优状态！');
    }
    
    // 检查OSS URL的一致性
    console.log('\n🔍 检查OSS URL一致性...');
    const ossUrls = Object.values(validMappings);
    const domains = new Set(ossUrls.map(url => {
      try {
        return new URL(url).hostname;
      } catch {
        return 'invalid';
      }
    }));
    
    console.log(`   - OSS域名: ${Array.from(domains).join(', ')}`);
    
    if (domains.size > 1) {
      console.log('⚠️  发现多个OSS域名，建议统一使用同一个域名');
    }
    
    console.log('\n🎉 OSS存储结构优化完成！');
    
  } catch (error) {
    console.error('❌ 优化过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行优化
optimizeOssStructure();