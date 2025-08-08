import { autoDetectOSSContent } from './autoDetectNewContent.js';
import cron from 'node-cron';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DetectionLog {
  timestamp: string;
  status: 'success' | 'error';
  message: string;
  newPhotos?: number;
  missingFiles?: number;
  error?: string;
}

/**
 * 记录检测日志
 */
async function logDetection(log: DetectionLog): Promise<void> {
  try {
    const logPath = join(__dirname, '../logs/oss-detection.log');
    const logDir = dirname(logPath);
    
    // 确保日志目录存在
    try {
      await fs.access(logDir);
    } catch {
      await fs.mkdir(logDir, { recursive: true });
    }
    
    const logEntry = `${log.timestamp} [${log.status.toUpperCase()}] ${log.message}\n`;
    await fs.appendFile(logPath, logEntry, 'utf-8');
  } catch (error) {
    console.error('写入日志失败:', error);
  }
}

/**
 * 执行OSS检测任务
 */
async function runDetectionTask(): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(`\n🕐 [${timestamp}] 开始定期OSS检测任务...`);
  
  try {
    // 重定向console.log来捕获输出
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args: any[]) => {
      const message = args.join(' ');
      logs.push(message);
      originalLog(message);
    };
    
    // 执行检测
    await autoDetectOSSContent();
    
    // 恢复console.log
    console.log = originalLog;
    
    // 分析检测结果
    const output = logs.join('\n');
    const newPhotosMatch = output.match(/发现 (\d+) 张新图片/);
    const missingFilesMatch = output.match(/发现 (\d+) 个缺失文件/);
    
    const newPhotos = newPhotosMatch ? parseInt(newPhotosMatch[1]) : 0;
    const missingFiles = missingFilesMatch ? parseInt(missingFilesMatch[1]) : 0;
    
    let message = 'OSS检测完成';
    if (newPhotos > 0 || missingFiles > 0) {
      message += ` - 新照片: ${newPhotos}, 缺失文件: ${missingFiles}`;
    } else {
      message += ' - 无变化';
    }
    
    await logDetection({
      timestamp,
      status: 'success',
      message,
      newPhotos,
      missingFiles
    });
    
    console.log(`✅ [${timestamp}] OSS检测任务完成`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    await logDetection({
      timestamp,
      status: 'error',
      message: 'OSS检测任务失败',
      error: errorMessage
    });
    
    console.error(`❌ [${timestamp}] OSS检测任务失败:`, error);
  }
}

/**
 * 启动定时任务
 */
function startScheduledDetection(): void {
  console.log('🚀 启动OSS定期检测服务...');
  console.log('📅 检测计划:');
  console.log('   - 每小时检测一次: 0 * * * *');
  console.log('   - 每天深度检测: 0 2 * * *');
  
  // 每小时检测一次（每小时的0分钟）
  cron.schedule('0 * * * *', async () => {
    await runDetectionTask();
  }, {
    scheduled: true,
    timezone: 'Asia/Shanghai'
  });
  
  // 每天凌晨2点进行深度检测
  cron.schedule('0 2 * * *', async () => {
    console.log('🔍 开始每日深度OSS检测...');
    await runDetectionTask();
  }, {
    scheduled: true,
    timezone: 'Asia/Shanghai'
  });
  
  // 立即执行一次检测
  console.log('🔍 执行初始检测...');
  runDetectionTask();
  
  console.log('✅ OSS定期检测服务已启动');
  console.log('📝 日志文件: api/logs/oss-detection.log');
}

/**
 * 停止定时任务
 */
function stopScheduledDetection(): void {
  cron.getTasks().forEach(task => task.stop());
  console.log('🛑 OSS定期检测服务已停止');
}

/**
 * 获取检测日志
 */
async function getDetectionLogs(lines: number = 50): Promise<string[]> {
  try {
    const logPath = join(__dirname, '../logs/oss-detection.log');
    const content = await fs.readFile(logPath, 'utf-8');
    const allLines = content.split('\n').filter(line => line.trim());
    return allLines.slice(-lines);
  } catch (error) {
    return ['日志文件不存在或读取失败'];
  }
}

/**
 * 清理旧日志
 */
async function cleanOldLogs(daysToKeep: number = 30): Promise<void> {
  try {
    const logPath = join(__dirname, '../logs/oss-detection.log');
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.split('\n');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filteredLines = lines.filter(line => {
      const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
      if (timestampMatch) {
        const logDate = new Date(timestampMatch[1]);
        return logDate >= cutoffDate;
      }
      return true; // 保留无法解析日期的行
    });
    
    await fs.writeFile(logPath, filteredLines.join('\n'), 'utf-8');
    console.log(`🧹 已清理${daysToKeep}天前的日志`);
  } catch (error) {
    console.error('清理日志失败:', error);
  }
}

// 如果直接运行此脚本，启动定时任务
if (import.meta.url === `file://${process.argv[1]}`) {
  startScheduledDetection();
  
  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n🛑 接收到停止信号，正在关闭OSS检测服务...');
    stopScheduledDetection();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 接收到终止信号，正在关闭OSS检测服务...');
    stopScheduledDetection();
    process.exit(0);
  });
}

export {
  startScheduledDetection,
  stopScheduledDetection,
  runDetectionTask,
  getDetectionLogs,
  cleanOldLogs
};