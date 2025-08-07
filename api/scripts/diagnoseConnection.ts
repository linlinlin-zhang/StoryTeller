import net from 'net';
import dns from 'dns';
import { promisify } from 'util';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 先加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dnsLookup = promisify(dns.lookup);

/**
 * 测试DNS解析
 */
async function testDNSResolution(hostname: string): Promise<boolean> {
  try {
    console.log(`🔍 测试DNS解析: ${hostname}`);
    const result = await dnsLookup(hostname);
    console.log(`  ✅ DNS解析成功: ${hostname} -> ${result.address}`);
    return true;
  } catch (error) {
    console.error(`  ❌ DNS解析失败: ${hostname}`, error);
    return false;
  }
}

/**
 * 测试TCP连接
 */
async function testTCPConnection(host: string, port: number, timeout: number = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`🔌 测试TCP连接: ${host}:${port}`);
    
    const socket = new net.Socket();
    let isResolved = false;
    
    const cleanup = () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
      }
    };
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`  ✅ TCP连接成功: ${host}:${port}`);
      cleanup();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.error(`  ❌ TCP连接超时: ${host}:${port} (${timeout}ms)`);
      cleanup();
      resolve(false);
    });
    
    socket.on('error', (error) => {
      console.error(`  ❌ TCP连接失败: ${host}:${port}`, error.message);
      cleanup();
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

/**
 * 测试MongoDB连接字符串解析
 */
function parseMongoDBURI(uri: string): { host: string; port: number; database: string } | null {
  try {
    console.log('🔍 解析MongoDB连接字符串...');
    
    // 简单的URI解析
    const match = uri.match(/mongodb:\/\/(?:[^:]+:[^@]+@)?([^:\/]+):(\d+)\/(.+)/);
    
    if (!match) {
      console.error('  ❌ 无法解析MongoDB URI格式');
      return null;
    }
    
    const [, host, portStr, database] = match;
    const port = parseInt(portStr, 10);
    
    console.log(`  ✅ 解析成功:`);
    console.log(`    - 主机: ${host}`);
    console.log(`    - 端口: ${port}`);
    console.log(`    - 数据库: ${database}`);
    
    return { host, port, database };
  } catch (error) {
    console.error('  ❌ 解析MongoDB URI失败:', error);
    return null;
  }
}

/**
 * 测试常见端口
 */
async function testCommonPorts(host: string): Promise<void> {
  console.log(`\n🔍 测试常见端口连通性: ${host}`);
  
  const commonPorts = [
    { port: 22, name: 'SSH' },
    { port: 80, name: 'HTTP' },
    { port: 443, name: 'HTTPS' },
    { port: 27017, name: 'MongoDB' },
    { port: 3306, name: 'MySQL' },
    { port: 5432, name: 'PostgreSQL' },
    { port: 6379, name: 'Redis' }
  ];
  
  for (const { port, name } of commonPorts) {
    await testTCPConnection(host, port, 5000);
  }
}

/**
 * 主诊断函数
 */
async function diagnoseConnection(): Promise<void> {
  console.log('🚀 开始网络连接诊断...\n');
  
  try {
    // 检查环境变量
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI 环境变量未配置');
      return;
    }
    
    console.log('📋 连接信息:');
    console.log(`  - MongoDB URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`);
    console.log('');
    
    // 解析MongoDB URI
    const parsed = parseMongoDBURI(mongoURI);
    if (!parsed) {
      return;
    }
    
    const { host, port } = parsed;
    
    // 测试DNS解析
    console.log('\n=== DNS解析测试 ===');
    const dnsOk = await testDNSResolution(host);
    
    if (!dnsOk) {
      console.log('\n❌ DNS解析失败，无法继续测试');
      return;
    }
    
    // 测试MongoDB端口连接
    console.log('\n=== MongoDB端口连接测试 ===');
    const mongoOk = await testTCPConnection(host, port, 15000);
    
    // 测试常见端口
    await testCommonPorts(host);
    
    // 总结
    console.log('\n=== 诊断总结 ===');
    if (dnsOk && mongoOk) {
      console.log('✅ 网络连接正常，MongoDB端口可达');
      console.log('💡 建议检查MongoDB服务状态和认证配置');
    } else if (dnsOk && !mongoOk) {
      console.log('⚠️  DNS解析正常，但MongoDB端口不可达');
      console.log('💡 可能的原因:');
      console.log('   - MongoDB服务未启动');
      console.log('   - 防火墙阻止了27017端口');
      console.log('   - MongoDB配置为仅监听本地连接');
      console.log('   - 云服务器安全组未开放27017端口');
    } else {
      console.log('❌ 网络连接存在问题');
      console.log('💡 建议检查:');
      console.log('   - 服务器IP地址是否正确');
      console.log('   - 网络连接是否正常');
      console.log('   - 是否存在网络代理或防火墙');
    }
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
  }
}

// 直接运行诊断
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  diagnoseConnection().catch(console.error);
}

export { diagnoseConnection, testTCPConnection, testDNSResolution };