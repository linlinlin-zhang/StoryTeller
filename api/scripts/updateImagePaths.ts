import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 批量替换mockData.ts中的图片路径
 */
async function updateImagePaths(): Promise<void> {
  console.log('🔄 开始更新图片路径...');
  
  const mockDataPath = path.join(__dirname, '../../src/data/mockData.ts');
  
  try {
    // 读取文件内容
    let content = await fs.readFile(mockDataPath, 'utf-8');
    
    // 统计替换次数
    let replaceCount = 0;
    
    // 替换所有的图片路径
    // 匹配模式: image: "/images/..." 或 coverImage: "/images/..."
    content = content.replace(
      /(image|coverImage):\s*"(\/images\/[^"]+)"/g,
      (match, field, imagePath) => {
        replaceCount++;
        return `${field}: getImageUrl("${imagePath}")`;
      }
    );
    
    // 替换photos数组中的路径
    content = content.replace(
      /photos:\s*\["(\/images\/[^"]+)"\]/g,
      (match, imagePath) => {
        replaceCount++;
        return `photos: [getImageUrl("${imagePath}")]`;
      }
    );
    
    // 写回文件
    await fs.writeFile(mockDataPath, content, 'utf-8');
    
    console.log(`✅ 图片路径更新完成!`);
    console.log(`📊 总共替换了 ${replaceCount} 个图片路径`);
    
  } catch (error) {
    console.error('❌ 更新图片路径时发生错误:', error);
  }
}

// 运行脚本
updateImagePaths().catch(console.error);

export { updateImagePaths };