import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 由于路径别名问题，我们直接在这里定义需要的数据和函数
interface PhotographerData {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  specialties: string[];
  location: string;
  contact: string;
  works: number;
  followers: number;
  coverImage: string;
  joinDate: string;
}

interface PhotoData {
  id: string;
  title: string;
  image: string;
  photographer: PhotographerData;
  camera: string;
  date: string;
  likes: number;
  views: number;
  category: string;
}

// 摄影师数据
const photographers: PhotographerData[] = [
  {
    id: "zsl",
    name: "长雨林",
    avatar: "/images/头像/长雨林.png",
    bio: "专注于自然风光和人文摄影，擅长捕捉光影的瞬间变化。",
    specialties: ["风光摄影", "人文摄影", "胶片摄影"],
    location: "广州",
    contact: "zhangyulin@example.com",
    works: 156,
    followers: 2340,
    coverImage: "/images/摄影师/长雨林/人物/000003920008-已增强-SR.jpg",
    joinDate: "2022年3月"
  },
  {
    id: "zym",
    name: "LTDSA",
    avatar: "/images/头像/LTDSA.jpg",
    bio: "航拍摄影师，专注于城市建筑和自然风光的空中视角。",
    specialties: ["航拍摄影", "建筑摄影", "城市摄影"],
    location: "深圳",
    contact: "ltdsa@example.com",
    works: 89,
    followers: 1890,
    coverImage: "/images/摄影师/LTDSA/自然/微信图片_20240802132116.jpg",
    joinDate: "2023年1月"
  },
  {
    id: "cfy",
    name: "Flyverse",
    avatar: "/images/头像/Flyverse.jpg",
    bio: "人像摄影师，善于捕捉人物的情感表达和自然状态。",
    specialties: ["人像摄影", "情感摄影", "生活摄影"],
    location: "北京",
    contact: "flyverse@example.com",
    works: 234,
    followers: 3120,
    coverImage: "/images/摄影师/Flyverse/人物/微信图片_20240802143756.jpg",
    joinDate: "2021年8月"
  },
  {
    id: "lqr",
    name: "TP",
    avatar: "/images/头像/Tp.jpg",
    bio: "建筑摄影专家，专注于现代建筑的几何美学。",
    specialties: ["建筑摄影", "几何构图", "黑白摄影"],
    location: "上海",
    contact: "tp@example.com",
    works: 67,
    followers: 1456,
    coverImage: "/images/摄影师/TP/建筑/微信图片_20240802183337.jpg",
    joinDate: "2023年5月"
  },
  {
    id: "dq",
    name: "戴小岐",
    avatar: "/images/头像/戴小岐.jpg",
    bio: "自然风光摄影师，热爱日出日落和海景拍摄。",
    specialties: ["风光摄影", "海景摄影", "日出日落"],
    location: "厦门",
    contact: "daixiaoqi@example.com",
    works: 123,
    followers: 2890,
    coverImage: "/images/摄影师/戴小岐/自然/微信图片_20240802121525.jpg",
    joinDate: "2022年11月"
  },
  {
    id: "sbsp",
    name: "十八 sp",
    avatar: "/images/头像/十八 sp.jpg",
    bio: "微距摄影专家，专注于捕捉微观世界的精彩瞬间，善于发现生活中的细节之美。",
    specialties: ["微距摄影", "自然摄影", "城市记录"],
    location: "杭州",
    contact: "shibasp@example.com",
    works: 89,
    followers: 1567,
    coverImage: "/images/摄影师/十八 sp/微距/微信图片_20250807124224_15.jpg",
    joinDate: "2023年8月"
  }
];

// 照片分类映射
const CATEGORY_MAP: Record<string, string> = {
  '人物': '人物',
  '城市': '城市',
  '建筑': '建筑',
  '自然': '自然',
  '记录': '记录',
  '未分类': '未分类',
  '游戏': '游戏',
  '微距': '微距'
};

// 读取imageMapping.ts文件获取所有图片映射
function getImageMappings(): Record<string, string> {
  const imageMappingPath = path.join(process.cwd(), 'src', 'utils', 'imageMapping.ts');
  const content = fs.readFileSync(imageMappingPath, 'utf-8');
  
  // 解析映射对象
  const mappingMatch = content.match(/export const imageUrlMapping: Record<string, string> = \{([\s\S]*?)\};/);
  if (!mappingMatch) {
    throw new Error('无法解析imageMapping.ts文件');
  }
  
  const mappingContent = mappingMatch[1];
  const mappings: Record<string, string> = {};
  
  // 使用正则表达式提取所有映射
  const regex = /"([^"]+)":\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(mappingContent)) !== null) {
    mappings[match[1]] = match[2];
  }
  
  return mappings;
}

// 生成随机统计数据
function getRandomStats() {
  return {
    likes: Math.floor(Math.random() * 800) + 100,
    views: Math.floor(Math.random() * 5000) + 1000
  };
}

// 生成随机相机
function getRandomCamera() {
  const cameras = [
    'Canon EOS 5D Mark IV', 'Nikon Z9', 'Sony Alpha 7R V',
    'Fujifilm X-T5', 'Canon EOS R6 Mark II', 'Nikon F2a',
    'Sony Alpha 7 IV', 'Canon EOS 850D', 'Nikon EL2'
  ];
  return cameras[Math.floor(Math.random() * cameras.length)];
}

// 生成随机日期
function getRandomDate() {
  const year = 2024;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}.${month}.${day}`;
}

// 生成标题
function generateTitle(filename: string, category: string, photographerName: string) {
  const titles = {
    '人物': ['人像写真', '情感瞬间', '生活记录', '人文关怀', '真实表达'],
    '城市': ['都市印象', '城市天际线', '夜景', '街头摄影', '建筑群'],
    '建筑': ['建筑美学', '几何构图', '现代建筑', '古建筑', '建筑细节'],
    '自然': ['自然风光', '山水画卷', '日出日落', '四季变换', '生态摄影'],
    '记录': ['生活记录', '时光印记', '日常瞬间', '纪实摄影', '真实生活'],
    '微距': ['微观世界', '细节之美', '微距摄影', '自然细节', '生命力'],
    '未分类': ['摄影作品', '光影瞬间', '视觉印象', '镜头语言', '影像记录']
  };
  
  const categoryTitles = titles[category] || titles['未分类'];
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

// 从imageMapping生成照片数据
function generatePhotosFromMapping(mappings: Record<string, string>): PhotoData[] {
  const photos: PhotoData[] = [];
  let photoIdCounter = 1;
  
  Object.keys(mappings).forEach(localPath => {
    // 解析路径获取摄影师和分类信息
    const pathMatch = localPath.match(/\/images\/摄影师\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
    if (!pathMatch) return;
    
    const [, photographerName, category, filename] = pathMatch;
    const photographer = photographers.find(p => p.name === photographerName);
    if (!photographer) return;
    
    const stats = getRandomStats();
    
    photos.push({
      id: (photoIdCounter++).toString(),
      title: generateTitle(filename, category, photographerName),
      image: localPath,
      photographer: photographer,
      camera: getRandomCamera(),
      date: getRandomDate(),
      likes: stats.likes,
      views: stats.views,
      category: CATEGORY_MAP[category] || '未分类'
    });
  });
  
  return photos;
}

// 更新mockData.ts文件中的照片数据
async function updateMockData() {
  try {
    console.log('开始更新mockData.ts文件...');
    
    // 从imageMapping获取所有图片映射
    const mappings = getImageMappings();
    console.log(`找到 ${Object.keys(mappings).length} 个图片映射`);
    
    // 生成照片数据
    const allPhotos = generatePhotosFromMapping(mappings);
    
    console.log(`成功导入 ${allPhotos.length} 张照片`);
    
    // 读取现有的mockData.ts文件
    const mockDataPath = path.join(process.cwd(), 'src', 'data', 'mockData.ts');
    const mockDataContent = fs.readFileSync(mockDataPath, 'utf-8');
    
    // 找到photos数组的开始和结束位置
    const photosStartRegex = /export const photos: PhotoData\[\] = \[/;
    const photosEndRegex = /\];\s*\/\/ 获取摄影师的照片/;
    
    const startMatch = mockDataContent.match(photosStartRegex);
    const endMatch = mockDataContent.match(photosEndRegex);
    
    if (!startMatch || !endMatch) {
      throw new Error('无法找到photos数组的开始或结束位置');
    }
    
    const beforePhotos = mockDataContent.substring(0, startMatch.index! + startMatch[0].length);
    const afterPhotos = mockDataContent.substring(endMatch.index!);
    
    // 生成新的照片数据
    const photosData = allPhotos.map(photo => {
      return `  {
    id: "${photo.id}",
    title: "${photo.title}",
    image: getImageUrl("${photo.image.replace(/^.*\/images/, '/images')}"),
    photographer: photographers.find(p => p.id === "${photo.photographer.id}")!,
    camera: "${photo.camera}",
    date: "${photo.date}",
    likes: ${photo.likes},
    views: ${photo.views},
    category: "${photo.category}"
  }`;
    }).join(',\n');
    
    // 组合新的文件内容
    const newContent = `${beforePhotos}\n${photosData}\n${afterPhotos}`;
    
    // 写入更新后的文件
    fs.writeFileSync(mockDataPath, newContent, 'utf-8');
    
    console.log('mockData.ts文件更新完成!');
    console.log(`总共包含 ${allPhotos.length} 张照片`);
    
    // 统计信息
    const categoryStats: Record<string, number> = {};
    const photographerStats: Record<string, number> = {};
    
    allPhotos.forEach(photo => {
      categoryStats[photo.category] = (categoryStats[photo.category] || 0) + 1;
      photographerStats[photo.photographer.name] = (photographerStats[photo.photographer.name] || 0) + 1;
    });
    
    console.log('\n按分类统计:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 张`);
    });
    
    console.log('\n按摄影师统计:');
    Object.entries(photographerStats).forEach(([photographer, count]) => {
      console.log(`  ${photographer}: ${count} 张`);
    });
    
  } catch (error) {
    console.error('更新mockData.ts文件时出错:', error);
    process.exit(1);
  }
}

// 运行更新
updateMockData();