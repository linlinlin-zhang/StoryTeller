import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取图片映射文件
function getImageMappings(): Record<string, string> {
  const mappingPath = path.join(__dirname, '../../src/utils/imageMapping.ts');
  const content = readFileSync(mappingPath, 'utf-8');
  
  // 提取映射对象
  const mappingMatch = content.match(/export const imageUrlMapping: Record<string, string> = \{([\s\S]*?)\};/);
  if (!mappingMatch) {
    throw new Error('无法找到图片映射对象');
  }
  
  const mappingContent = mappingMatch[1];
  const mappings: Record<string, string> = {};
  
  // 解析每一行映射
  const lines = mappingContent.split('\n');
  for (const line of lines) {
    const match = line.match(/"([^"]+)":\s*"([^"]+)"/); 
    if (match) {
      mappings[match[1]] = match[2];
    }
  }
  
  return mappings;
}

// 读取mockData.ts文件中的照片引用
function getPhotoReferences(): string[] {
  const mockDataPath = path.join(__dirname, '../../src/data/mockData.ts');
  const content = readFileSync(mockDataPath, 'utf-8');
  
  const references: string[] = [];
  
  // 查找所有getImageUrl调用
  const getImageUrlMatches = content.match(/getImageUrl\("([^"]+)"\)/g);
  if (getImageUrlMatches) {
    for (const match of getImageUrlMatches) {
      const pathMatch = match.match(/getImageUrl\("([^"]+)"\)/);
      if (pathMatch) {
        references.push(pathMatch[1]);
      }
    }
  }
  
  return references;
}

// 主函数
async function validatePhotoReferences() {
  console.log('🔍 开始验证照片引用...');
  
  try {
    const mappings = getImageMappings();
    const references = getPhotoReferences();
    
    console.log(`📊 统计信息:`);
    console.log(`   - 图片映射数量: ${Object.keys(mappings).length}`);
    console.log(`   - 照片引用数量: ${references.length}`);
    console.log(`   - 去重后引用数量: ${new Set(references).length}`);
    
    const missingMappings: string[] = [];
    const validReferences: string[] = [];
    
    // 检查每个引用是否有对应的映射
    for (const ref of new Set(references)) {
      if (mappings[ref]) {
        validReferences.push(ref);
      } else {
        missingMappings.push(ref);
      }
    }
    
    console.log('\n✅ 有效的照片引用:');
    validReferences.forEach(ref => {
      console.log(`   ${ref}`);
    });
    
    if (missingMappings.length > 0) {
      console.log('\n❌ 缺失映射的照片引用:');
      missingMappings.forEach(ref => {
        console.log(`   ${ref}`);
      });
      console.log(`\n⚠️  发现 ${missingMappings.length} 个缺失映射的照片引用`);
    } else {
      console.log('\n🎉 所有照片引用都有对应的OSS映射！');
    }
    
    // 检查是否有未使用的映射
    const unusedMappings: string[] = [];
    for (const mappingPath of Object.keys(mappings)) {
      if (!references.includes(mappingPath)) {
        unusedMappings.push(mappingPath);
      }
    }
    
    if (unusedMappings.length > 0) {
      console.log(`\n📋 未使用的映射 (${unusedMappings.length} 个):`);
      unusedMappings.slice(0, 10).forEach(path => {
        console.log(`   ${path}`);
      });
      if (unusedMappings.length > 10) {
        console.log(`   ... 还有 ${unusedMappings.length - 10} 个`);
      }
    }
    
    console.log('\n✨ 验证完成！');
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行验证
validatePhotoReferences();