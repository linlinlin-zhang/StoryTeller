import OSS from 'ali-oss';

// OSS 客户端配置（延迟初始化）
let ossClient: OSS | null = null;

/**
 * 检查OSS配置是否完整
 */
function hasOSSConfig(): boolean {
  return !!(process.env.ALI_OSS_ACCESS_KEY_ID && 
           process.env.ALI_OSS_ACCESS_KEY_SECRET && 
           process.env.ALI_OSS_BUCKET);
}

/**
 * 初始化OSS客户端
 */
function initOSSClient(): OSS | null {
  if (ossClient) {
    return ossClient;
  }
  
  if (!hasOSSConfig()) {
    console.warn('OSS configuration not found, OSS features will be disabled');
    return null;
  }
  
  try {
    ossClient = new OSS({
      region: process.env.ALI_OSS_REGION || 'oss-cn-hangzhou',
      accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID!,
      accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET!,
      bucket: process.env.ALI_OSS_BUCKET!,
      endpoint: process.env.ALI_OSS_ENDPOINT || 'https://oss-cn-hangzhou.aliyuncs.com',
    });
    
    console.log('✅ OSS客户端初始化成功');
    return ossClient;
  } catch (error) {
    console.error('❌ OSS客户端初始化失败:', error);
    return null;
  }
}

// OSS 服务类
export class OSSService {
  private client: OSS | null = null;

  constructor() {
    // 延迟初始化，在第一次使用时才初始化客户端
  }

  private getClient(): OSS | null {
    if (!this.client) {
      this.client = initOSSClient();
    }
    return this.client;
  }

  private checkOSSAvailable(): boolean {
    const client = this.getClient();
    if (!client) {
      console.warn('OSS client not available, please configure OSS environment variables');
      return false;
    }
    return true;
  }

  /**
   * 上传文件到OSS
   * @param fileName 文件名
   * @param fileBuffer 文件缓冲区
   * @param folder 文件夹路径
   * @returns 上传结果
   */
  async uploadFile(fileName: string, fileBuffer: Buffer, folder: string = 'photos'): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    if (!this.checkOSSAvailable()) {
      return {
        success: false,
        error: 'OSS service not available'
      };
    }

    try {
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${folder}/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      const client = this.getClient()!;
      const result = await client.put(uniqueFileName, fileBuffer);
      
      return {
        success: true,
        url: result.url
      };
    } catch (error) {
      console.error('OSS upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * 删除OSS文件
   * @param fileName 文件名
   * @returns 删除结果
   */
  async deleteFile(fileName: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.checkOSSAvailable()) {
      return {
        success: false,
        error: 'OSS service not available'
      };
    }

    try {
      const client = this.getClient()!;
      await client.delete(fileName);
      return { success: true };
    } catch (error) {
      console.error('OSS delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * 获取文件签名URL
   * @param fileName 文件名
   * @param expires 过期时间（秒）
   * @returns 签名URL
   */
  async getSignedUrl(fileName: string, expires: number = 3600): Promise<string> {
    if (!this.checkOSSAvailable()) {
      throw new Error('OSS service not available');
    }

    try {
      const client = this.getClient()!;
      return client.signatureUrl(fileName, {
        expires,
        method: 'GET'
      });
    } catch (error) {
      console.error('OSS get signed URL error:', error);
      throw error;
    }
  }

  /**
   * 批量上传文件
   * @param files 文件数组
   * @param folder 文件夹路径
   * @returns 上传结果数组
   */
  async uploadMultipleFiles(files: Array<{
    fileName: string;
    fileBuffer: Buffer;
  }>, folder: string = 'photos'): Promise<Array<{
    success: boolean;
    url?: string;
    error?: string;
    originalFileName: string;
  }>> {
    const uploadPromises = files.map(async (file) => {
      const result = await this.uploadFile(file.fileName, file.fileBuffer, folder);
      return {
        ...result,
        originalFileName: file.fileName
      };
    });

    return Promise.all(uploadPromises);
  }

  /**
   * 检查文件是否存在
   * @param fileName 文件名
   * @returns 是否存在
   */
  async fileExists(fileName: string): Promise<boolean> {
    if (!this.checkOSSAvailable()) {
      return false;
    }

    try {
      const client = this.getClient()!;
      await client.head(fileName);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const ossService = new OSSService();
export default function getOSSClient(): OSS | null {
  return initOSSClient();
}
export { initOSSClient, hasOSSConfig };