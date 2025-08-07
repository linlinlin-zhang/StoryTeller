import { getImageUrl, getMigrationStats, isImageMigrated } from '../../src/utils/imageUtils.js';

/**
 * 测试图片URL映射功能
 */
async function testImageMapping(): Promise<void> {
  console.log('🧪 开始测试图片URL映射功能...\n');
  
  // 获取迁移统计信息
  const stats = getMigrationStats();
  console.log('📊 迁移统计信息:');
  console.log('==================');
  console.log(`总迁移图片数: ${stats.totalMigrated}`);
  console.log(`头像图片: ${stats.categories.avatars}`);
  console.log(`摄影师作品: ${stats.categories.photographers}`);
  console.log(`地点图片: ${stats.categories.locations}`);
  console.log(`主页图片: ${stats.categories.homepage}`);
  console.log(`其他图片: ${stats.categories.others}`);
  
  console.log('\n🔍 测试关键图片URL映射:');
  console.log('==================');
  
  // 测试摄影师头像
  const avatarPaths = [
    '/images/头像/长雨林.png',
    '/images/头像/LTDSA.jpg',
    '/images/头像/Flyverse.jpg',
    '/images/头像/Tp.jpg',
    '/images/头像/戴小岐.jpg'
  ];
  
  console.log('👤 摄影师头像:');
  avatarPaths.forEach(path => {
    const ossUrl = getImageUrl(path);
    const isMigrated = isImageMigrated(path);
    console.log(`   ${path}`);
    console.log(`   ${isMigrated ? '✅' : '❌'} ${isMigrated ? 'OSS: ' + ossUrl : '未迁移'}`);
    console.log('');
  });
  
  // 测试地点图片
  const locationPaths = [
    '/images/主页地点图/深圳.jpg',
    '/images/主页地点图/广州.jpg',
    '/images/主页地点图/佛山.jpg',
    '/images/主页地点图/珠海 .jpg',
    '/images/主页地点图/长沙.jpg'
  ];
  
  console.log('🏙️ 地点图片:');
  locationPaths.forEach(path => {
    const ossUrl = getImageUrl(path);
    const isMigrated = isImageMigrated(path);
    console.log(`   ${path}`);
    console.log(`   ${isMigrated ? '✅' : '❌'} ${isMigrated ? 'OSS: ' + ossUrl : '未迁移'}`);
    console.log('');
  });
  
  // 测试摄影师作品
  const photoPaths = [
    '/images/摄影师/长雨林/自然/000000490034-已增强-SR.jpg',
    '/images/摄影师/长雨林/人物/000003920008-已增强-SR.jpg',
    '/images/摄影师/LTDSA/自然/微信图片_20240802132116.jpg',
    '/images/摄影师/Flyverse/人物/微信图片_20240802143756.jpg',
    '/images/摄影师/TP/建筑/微信图片_20240802183337.jpg'
  ];
  
  console.log('📸 摄影师作品:');
  photoPaths.forEach(path => {
    const ossUrl = getImageUrl(path);
    const isMigrated = isImageMigrated(path);
    console.log(`   ${path}`);
    console.log(`   ${isMigrated ? '✅' : '❌'} ${isMigrated ? 'OSS: ' + ossUrl : '未迁移'}`);
    console.log('');
  });
  
  // 测试不存在的图片
  console.log('🚫 测试不存在的图片:');
  const nonExistentPath = '/images/不存在的图片.jpg';
  const nonExistentUrl = getImageUrl(nonExistentPath);
  console.log(`   ${nonExistentPath}`);
  console.log(`   返回: ${nonExistentUrl}`);
  console.log(`   ${nonExistentUrl === nonExistentPath ? '✅ 正确返回原路径' : '❌ 返回异常'}`);
  
  console.log('\n🎉 图片URL映射测试完成!');
  
  // 计算成功率
  const testPaths = [...avatarPaths, ...locationPaths, ...photoPaths];
  const migratedCount = testPaths.filter(path => isImageMigrated(path)).length;
  const successRate = ((migratedCount / testPaths.length) * 100).toFixed(1);
  
  console.log('\n📈 测试结果汇总:');
  console.log('==================');
  console.log(`测试图片总数: ${testPaths.length}`);
  console.log(`成功迁移: ${migratedCount}`);
  console.log(`迁移成功率: ${successRate}%`);
  
  if (migratedCount === testPaths.length) {
    console.log('\n🎊 所有关键图片都已成功迁移到OSS!');
  } else {
    console.log('\n⚠️ 部分图片未迁移，请检查图片文件是否存在。');
  }
}

// 运行测试
testImageMapping().catch(console.error);

export { testImageMapping };