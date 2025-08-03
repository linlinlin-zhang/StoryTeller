/**
 * 图片方向检测工具函数
 * 提供强大的、鲁棒性高的图片方向识别功能
 */

export type ImageOrientation = 'landscape' | 'portrait' | 'square';

export interface ImageDetectionResult {
  orientation: ImageOrientation;
  aspectRatio: number;
  width: number;
  height: number;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * 检测图片方向的主函数
 * @param imagePath 图片路径
 * @returns Promise<ImageDetectionResult>
 */
export const detectImageOrientation = (imagePath: string): Promise<ImageDetectionResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const { width, height } = img;
      const aspectRatio = width / height;
      
      let orientation: ImageOrientation;
      let confidence: 'high' | 'medium' | 'low' = 'high';
      
      // 精确的方向判断逻辑
      if (aspectRatio > 1.2) {
        orientation = 'landscape'; // 明显的横图
      } else if (aspectRatio < 0.8) {
        orientation = 'portrait';  // 明显的竖图
      } else if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
        orientation = 'square';    // 接近正方形
      } else {
        // 边界情况，降低置信度
        confidence = 'medium';
        if (aspectRatio > 1.0) {
          orientation = 'landscape';
        } else {
          orientation = 'portrait';
        }
      }
      
      resolve({
        orientation,
        aspectRatio,
        width,
        height,
        confidence
      });
    };
    
    img.onerror = () => {
      // 图片加载失败时使用备用检测
      const fallbackResult = getFallbackOrientation(imagePath);
      resolve({
        orientation: fallbackResult,
        aspectRatio: 1,
        width: 0,
        height: 0,
        confidence: 'low'
      });
    };
    
    img.src = imagePath;
  });
};

/**
 * 备用方向检测（基于文件名和路径模式）
 * @param imagePath 图片路径
 * @returns ImageOrientation
 */
export const getFallbackOrientation = (imagePath: string): ImageOrientation => {
  const path = imagePath.toLowerCase();
  
  // 横图关键词
  const landscapeKeywords = [
    '城市', '建筑', 'city', 'building', 'architecture',
    'landscape', 'wide', 'panorama', 'dsc', 'canon',
    '000000490030', '000000490032', 'eh0a8980',
    'skyline', 'horizon', 'street'
  ];
  
  // 竖图关键词
  const portraitKeywords = [
    '人像', 'portrait', 'people', 'person', 'model',
    'tall', 'vertical', 'tower', 'tree', 'standing'
  ];
  
  // 方图关键词
  const squareKeywords = [
    'square', 'instagram', 'profile', 'avatar',
    '1x1', 'crop', 'centered'
  ];
  
  // 检查关键词匹配
  if (landscapeKeywords.some(keyword => path.includes(keyword))) {
    return 'landscape';
  }
  
  if (portraitKeywords.some(keyword => path.includes(keyword))) {
    return 'portrait';
  }
  
  if (squareKeywords.some(keyword => path.includes(keyword))) {
    return 'square';
  }
  
  // 默认返回横图（大多数摄影作品倾向于横图）
  return 'landscape';
};

/**
 * 批量检测图片方向
 * @param imagePaths 图片路径数组
 * @param onProgress 进度回调函数
 * @returns Promise<Map<string, ImageDetectionResult>>
 */
export const batchDetectOrientations = async (
  imagePaths: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, ImageDetectionResult>> => {
  const results = new Map<string, ImageDetectionResult>();
  const total = imagePaths.length;
  let completed = 0;
  
  // 限制并发数量以避免浏览器资源耗尽
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < imagePaths.length; i += BATCH_SIZE) {
    const batch = imagePaths.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (imagePath) => {
      try {
        const result = await detectImageOrientation(imagePath);
        results.set(imagePath, result);
      } catch (error) {
        console.warn(`Failed to detect orientation for ${imagePath}:`, error);
        // 使用备用检测
        const fallbackOrientation = getFallbackOrientation(imagePath);
        results.set(imagePath, {
          orientation: fallbackOrientation,
          aspectRatio: 1,
          width: 0,
          height: 0,
          confidence: 'low'
        });
      }
      
      completed++;
      onProgress?.(completed, total);
    });
    
    await Promise.all(batchPromises);
  }
  
  return results;
};

/**
 * 根据图片方向获取推荐的网格布局类名
 * @param orientation 图片方向
 * @param screenSize 屏幕尺寸
 * @returns string
 */
export const getGridClassForOrientation = (
  orientation: ImageOrientation,
  screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): string => {
  const layouts = {
    landscape: {
      mobile: 'grid-cols-1',
      tablet: 'md:grid-cols-2',
      desktop: 'lg:grid-cols-3'
    },
    portrait: {
      mobile: 'grid-cols-2',
      tablet: 'md:grid-cols-3',
      desktop: 'lg:grid-cols-4'
    },
    square: {
      mobile: 'grid-cols-2',
      tablet: 'md:grid-cols-3',
      desktop: 'lg:grid-cols-4'
    }
  };
  
  const layout = layouts[orientation];
  return `${layout.mobile} ${layout.tablet} ${layout.desktop}`;
};

/**
 * 根据图片方向获取推荐的高度类名
 * @param orientation 图片方向
 * @returns string
 */
export const getHeightClassForOrientation = (orientation: ImageOrientation): string => {
  const heights = {
    landscape: 'h-48 md:h-56 lg:h-64',
    portrait: 'h-64 md:h-72 lg:h-80',
    square: 'h-56 md:h-64 lg:h-72'
  };
  
  return heights[orientation];
};

/**
 * 获取图片方向的中文描述
 * @param orientation 图片方向
 * @returns string
 */
export const getOrientationLabel = (orientation: ImageOrientation): string => {
  const labels = {
    landscape: '横图',
    portrait: '竖图',
    square: '方图'
  };
  
  return labels[orientation];
};

/**
 * 图片缓存管理器
 */
export class ImageOrientationCache {
  private cache = new Map<string, ImageDetectionResult>();
  private loadingStates = new Map<string, boolean>();
  
  /**
   * 获取缓存的检测结果
   */
  get(imagePath: string): ImageDetectionResult | undefined {
    return this.cache.get(imagePath);
  }
  
  /**
   * 设置缓存结果
   */
  set(imagePath: string, result: ImageDetectionResult): void {
    this.cache.set(imagePath, result);
  }
  
  /**
   * 检查是否正在加载
   */
  isLoading(imagePath: string): boolean {
    return this.loadingStates.get(imagePath) || false;
  }
  
  /**
   * 设置加载状态
   */
  setLoading(imagePath: string, loading: boolean): void {
    this.loadingStates.set(imagePath, loading);
  }
  
  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear();
    this.loadingStates.clear();
  }
  
  /**
   * 获取缓存统计信息
   */
  getStats(): { cached: number; loading: number } {
    return {
      cached: this.cache.size,
      loading: Array.from(this.loadingStates.values()).filter(Boolean).length
    };
  }
}