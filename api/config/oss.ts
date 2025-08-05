import OSS from 'ali-oss';

// OSS 客户端配置
const ossClient = new OSS({
  region: process.env.ALI_OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET || '',
  bucket: process.env.ALI_OSS_BUCKET || '',
  endpoint: process.env.ALI_OSS_ENDPOINT || 'https://oss-cn-hangzhou.aliyuncs.com',
});

// OSS 服务类
export class OSSService {
  private client: OSS;

  constructor() {
    this.client = ossClient;
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
    try {
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${folder}/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      const result = await this.client.put(uniqueFileName, fileBuffer);
      
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
    try {
      await this.client.delete(fileName);
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
    try {
      return this.client.signatureUrl(fileName, {
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
    try {
      await this.client.head(fileName);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const ossService = new OSSService();
export default ossClient;