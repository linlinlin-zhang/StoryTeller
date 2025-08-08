import { imageUrlMapping } from './imageMapping';

/**
 * 获取图片的OSS URL
 * @param localPath 本地图片路径
 * @returns OSS图片URL或原路径
 */
export function getImageUrl(localPath: string): string {
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath;
  }
  
  // 标准化路径格式
  const normalizedPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
  
  // 从映射中获取OSS URL
  const ossUrl = imageUrlMapping[normalizedPath];
  
  if (ossUrl) {
    return ossUrl;
  }
  
  // 如果没有找到映射，返回原路径
  console.warn(`图片URL映射未找到: ${normalizedPath}`);
  return localPath;
}

/**
 * 批量获取图片URL
 * @param localPaths 本地图片路径数组
 * @returns OSS图片URL数组
 */
export function getImageUrls(localPaths: string[]): string[] {
  return localPaths.map(path => getImageUrl(path));
}

/**
 * 检查图片是否已迁移到OSS
 * @param localPath 本地图片路径
 * @returns 是否已迁移到OSS
 */
export function isImageMigrated(localPath: string): boolean {
  const normalizedPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
  return normalizedPath in imageUrlMapping;
}

/**
 * 获取所有已迁移的图片路径
 * @returns 已迁移的图片路径数组
 */
export function getMigratedImagePaths(): string[] {
  return Object.keys(imageUrlMapping);
}

/**
 * 获取迁移统计信息
 * @returns 迁移统计信息
 */
export function getMigrationStats() {
  const totalMigrated = Object.keys(imageUrlMapping).length;
  const categories = {
    avatars: 0,
    photographers: 0,
    locations: 0,
    homepage: 0,
    others: 0
  };
  
  Object.keys(imageUrlMapping).forEach(path => {
    if (path.includes('/头像/')) {
      categories.avatars++;
    } else if (path.includes('/摄影师/')) {
      categories.photographers++;
    } else if (path.includes('/主页地点图/')) {
      categories.locations++;
    } else if (path.includes('/主页横图/')) {
      categories.homepage++;
    } else {
      categories.others++;
    }
  });
  
  return {
    totalMigrated,
    categories
  };
}