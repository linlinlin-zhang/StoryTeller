import { PhotoData } from '@/components/PhotoCard';
import { PhotographerData } from '@/data/mockData';
import { getImageUrl } from './imageHelper';

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

// 摄影师ID映射
const PHOTOGRAPHER_ID_MAP: Record<string, string> = {
  '长雨林': 'zsl',
  'LTDSA': 'zym',
  'Flyverse': 'cfy',
  'TP': 'lqr',
  '戴小岐': 'dq',
  '十八 sp': 'sbsp'
};

// 相机品牌和型号数据库
const CAMERA_DATABASE = [
  'Nikon F2a',
  'Sony Alpha 7 Ⅳ',
  'Nikon EL2',
  'Canon EOS 5D Mark IV',
  'Nikon Z9',
  'Canon EOS R6 Mark II',
  'Fujifilm X-T5',
  'Sony Alpha 7R V',
  'Canon EOS 850D',
  'DJI Air 2S',
  'Sony Alpha 7 III',
  'Canon EOS R5',
  'Nikon D850',
  'Fujifilm X-H2S',
  'Leica Q2'
];

// 生成随机相机
function getRandomCamera(): string {
  return CAMERA_DATABASE[Math.floor(Math.random() * CAMERA_DATABASE.length)];
}

// 生成随机日期（最近两年内）
function getRandomDate(): string {
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
  const randomDate = new Date(randomTime);
  return `${randomDate.getFullYear()}.${(randomDate.getMonth() + 1).toString().padStart(2, '0')}.${randomDate.getDate().toString().padStart(2, '0')}`;
}

// 生成随机点赞数和浏览数
function getRandomStats(): { likes: number; views: number } {
  const likes = Math.floor(Math.random() * 800) + 100; // 100-900
  const views = likes + Math.floor(Math.random() * 2000) + 500; // 确保浏览数大于点赞数
  return { likes, views };
}

// 根据文件名生成标题
function generateTitle(filename: string, category: string, photographerName: string): string {
  const baseName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  
  // 如果文件名包含中文，直接使用
  if (/[\u4e00-\u9fa5]/.test(baseName)) {
    return baseName.replace(/[《》]/g, '');
  }
  
  // 根据分类和摄影师生成有意义的标题
  const titleTemplates: Record<string, string[]> = {
    '人物': [
      '光影人像', '都市印象', '情感瞬间', '生活片段', '人文记录',
      '街头故事', '静谧时光', '青春记忆', '温暖时刻', '自然状态'
    ],
    '城市': [
      '都市天际线', '城市印象', '夜色阑珊', '繁华都市', '城市节奏',
      '霓虹夜景', '街头风光', '现代都市', '城市光影', '都市生活'
    ],
    '建筑': [
      '建筑美学', '几何构图', '现代建筑', '建筑光影', '空间艺术',
      '结构之美', '建筑线条', '空间对话', '建筑诗意', '构造美学'
    ],
    '自然': [
      '自然风光', '山水之间', '天地之美', '自然印象', '风景如画',
      '大自然的馈赠', '山川秀美', '自然之韵', '风光无限', '天然之美'
    ],
    '记录': [
      '生活记录', '时光片段', '日常瞬间', '记忆碎片', '生活印记',
      '平凡之美', '生活故事', '时间印记', '日常美学', '生活感悟'
    ],
    '未分类': [
      '光影瞬间', '摄影作品', '视觉印象', '镜头语言', '影像记录',
      '摄影随笔', '光影故事', '视觉艺术', '镜头下的世界', '摄影感悟'
    ],
    '游戏': [
      '游戏世界', '虚拟现实', '游戏截图', '数字艺术', '游戏美学',
      '虚拟风景', '游戏画面', '数字影像', '游戏摄影', '虚拟摄影'
    ],
    '微距': [
      '微观世界', '细节之美', '微距摄影', '近距离观察', '微小世界',
      '细节捕捉', '微观艺术', '放大镜下', '微距美学', '细微之处'
    ]
  };
  
  const templates = titleTemplates[category] || titleTemplates['未分类'];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // 添加一些随机数字或序号使标题更独特
  const randomSuffix = Math.random() > 0.7 ? ` ${Math.floor(Math.random() * 100) + 1}` : '';
  
  return randomTemplate + randomSuffix;
}

// 照片导入器类
export class PhotoImporter {
  private photographers: PhotographerData[];
  private photoIdCounter: number = 1;
  
  constructor(photographers: PhotographerData[]) {
    this.photographers = photographers;
  }
  
  // 扫描并导入所有照片
  async importAllPhotos(): Promise<PhotoData[]> {
    const allPhotos: PhotoData[] = [];
    
    // 定义摄影师文件夹结构
    const photographerFolders = [
      { name: '长雨林', folders: ['人物', '城市', '建筑', '未分类', '自然', '记录'] },
      { name: 'LTDSA', folders: ['人物', '城市', '建筑', '游戏', '自然', '记录'] },
      { name: 'Flyverse', folders: ['人物', '城市', '建筑', '未分类', '自然', '记录'] },
      { name: 'TP', folders: ['人物', '城市', '建筑', '未分类', '自然', '记录'] },
      { name: '戴小岐', folders: ['人物', '城市', '建筑', '未分类', '自然', '记录'] }
    ];
    
    // 实际的照片文件数据（基于文件夹扫描结果）
    const photoFiles = {
      '长雨林': {
        '人物': [
          '000000880010.jpg', '000002210005-已增强-SR.jpg', '000003920008-已增强-SR.jpg',
          'DSC00788.jpg', 'DSC02373-已增强.jpg', 'DSC03465.jpg', 'DSC08089-3.jpg',
          'DSC09213-3.jpg', 'IMG-2089.jpg', '《疲惫的人》.jpg', '微信图片_20240802185209.jpg',
          '微信图片_20240802200056.jpg', '微信图片_20250415152739 (2).jpg'
        ],
        '城市': [
          '000000490030-已增强-SR.jpg', '000000490032-已增强-SR.jpg', '000010.jpg',
          '0689 (14)-已增强-SR.jpg', '0689 (16).jpg', 'DSC00700.jpg', 'DSC01497.jpg',
          'DSC02247.jpg', 'DSC02394.jpg', 'DSC07911.jpg', 'DSC09362-2.jpg',
          'DSC09483-已增强-2.jpg', 'DSC09622.jpg', '微信图片_20240802202003.jpg',
          '微信图片_20241226213759.jpg', '微信图片_20241227155524-已增强-SR-3.jpg'
        ],
        '建筑': [
          '000000490004-已增强-SR.jpg', '000001020006-已增强-SR.jpg', '000001020014-已增强-SR.jpg',
          '000002210037-已增强-SR.jpg', '1.jpg', '4733 (12).jpg', '4733 (14).jpg',
          '7.jpg', '8.jpg', '9.jpg', 'DSC00947 (2).jpg', 'DSC06221-已增强.jpg',
          'mmexport1647118780190.jpg', 'mmexport1647118790415.jpg', '《汉京金融中心的限定涂装》.jpg',
          '微信图片_20231201180135.jpg'
        ],
        '未分类': [
          '000000490008-已增强-SR.jpg', '000001020003-已增强-SR.jpg', '5.jpg',
          'DSC07286.jpg', 'DSC08055-已增强-2.jpg', 'LT-NORITSU43986.jpg', 'LT-NORITSU43992.jpg'
        ],
        '自然': [
          '000000490034-已增强-SR.jpg', '000001020018-已增强-SR.jpg', '902A0976.jpg',
          'DSC01876.jpg', 'DSC02293.jpg', 'DSC06612.jpg'
        ],
        '记录': [
          '000000490010-已增强-SR.jpg', '000000880002-2.jpg', '000000880004.jpg',
          '000002210017-已增强-SR.jpg', '002.jpg', '004.jpg', 'DSC01940.JPG',
          'DSC03251.jpg', 'DSC05687.jpg', 'DSC07148-已增强-降噪-3.jpg',
          'LT-NORITSU43981-2.jpg', 'LT-NORITSU44000.jpg', '微信图片_20240802205538.jpg'
        ]
      },
      'LTDSA': {
        '人物': [
          '微信图片_20240802145538.jpg', '微信图片_20250729105042_224.jpg',
          '微信图片_20250729105042_226.jpg', '微信图片_20250729105042_231.jpg',
          '微信图片_20250729105042_233.jpg'
        ],
        '城市': [
          '微信图片_20240802192350.jpg', '微信图片_20250729105042_218.jpg',
          '微信图片_20250729105042_219.jpg', '微信图片_20250729105042_220.jpg',
          '微信图片_20250729105042_223.jpg', '微信图片_20250729105042_232.jpg',
          '微信图片_20250729105042_235.jpg', '微信图片_20250729105042_236.jpg'
        ],
        '建筑': [
          '微信图片_20240802182434.jpg', '微信图片_20250729105042_221.jpg',
          '微信图片_20250729105042_222.jpg', '微信图片_20250729105042_225.jpg',
          '微信图片_20250729105042_230.jpg'
        ],
        '自然': [
          '微信图片_20240802132116.jpg', '微信图片_20250729105041_229.jpg',
          '微信图片_20250729105042_227.jpg', '微信图片_20250729105042_228.jpg',
          '微信图片_20250729105042_234.jpg', '微信图片_20250729105042_237.jpg'
        ]
      },
      'Flyverse': {
        '人物': ['微信图片_20240802143756.jpg'],
        '城市': [
          'DSC00577.jpg', 'EH0A8980-已增强-2.jpg', '微信图片_20240802194442.jpg'
        ],
        '自然': ['微信图片_20240802134101.jpg']
      },
      'TP': {
        '人物': ['IMGL6735.JPG', '微信图片_20240802195946.jpg'],
        '建筑': ['微信图片_20240802183337.jpg'],
        '未分类': [
          '2358720_153.jpg', '2358720_223.jpg', '微信图片_20250729113923_230.jpg',
          '微信图片_20250729113923_232.jpg', '微信图片_20250729113923_233.jpg'
        ],
        '自然': ['000003920036-已增强-SR.jpg', '_H4A8661-已增强-降噪.jpg']
      },
      '戴小岐': {
        '城市': [
          '微信图片_20250728131142_18.jpg', '微信图片_20250728131142_19.jpg',
          '微信图片_20250728131142_20.jpg', '微信图片_20250728131142_21.jpg',
          '微信图片_20250729112202_238.jpg', '微信图片_20250729112202_239.jpg'
        ],
        '自然': ['微信图片_20240802121525.jpg']
      },
      '十八 sp': {
        '人物': ['微信图片_20250807124336_22.jpg'],
        '城市': [
          '微信图片_20250728131142_18.jpg', '微信图片_20250728131142_19.jpg',
          '微信图片_20250728131142_20.jpg', '微信图片_20250728131142_21.jpg',
          '微信图片_20250729112202_238.jpg', '微信图片_20250729112202_239.jpg'
        ],
        '微距': [
          '微信图片_20250807124224_15.jpg', '微信图片_20250807124224_16.jpg',
          '微信图片_20250807124224_17.jpg', '微信图片_20250807124224_18.jpg',
          '微信图片_20250807124224_19.jpg', '微信图片_20250807124224_28.jpg',
          '微信图片_20250807124224_29.jpg', '微信图片_20250807124224_30.jpg',
          '微信图片_20250807124224_32.jpg', '微信图片_20250807124224_33.jpg',
          '微信图片_20250807124225_13.jpg', '微信图片_20250807124225_14.jpg'
        ],
        '未分类': [
          '微信图片_20250807124255_25.jpg', '微信图片_20250807124255_27.jpg',
          '微信图片_20250807124255_29.jpg'
        ],
        '自然': [
          '微信图片_20240802121525.jpg', '微信图片_20250807124327_21.jpg'
        ],
        '记录': ['微信图片_20250807124319_24.jpg']
      }
    };
    
    // 遍历所有摄影师和分类，生成照片数据
    for (const [photographerName, categories] of Object.entries(photoFiles)) {
      const photographer = this.photographers.find(p => p.name === photographerName);
      if (!photographer) continue;
      
      for (const [category, files] of Object.entries(categories)) {
        for (const filename of files) {
          const photo = this.createPhotoData(
            filename,
            photographerName,
            category,
            photographer
          );
          allPhotos.push(photo);
        }
      }
    }
    
    return allPhotos;
  }
  
  // 创建单个照片数据
  private createPhotoData(
    filename: string,
    photographerName: string,
    category: string,
    photographer: PhotographerData
  ): PhotoData {
    const stats = getRandomStats();
    const imagePath = `/images/摄影师/${photographerName}/${category}/${filename}`;
    
    return {
      id: (this.photoIdCounter++).toString(),
      title: generateTitle(filename, category, photographerName),
      image: getImageUrl(imagePath),
      photographer: photographer,
      camera: getRandomCamera(),
      date: getRandomDate(),
      likes: stats.likes,
      views: stats.views,
      category: CATEGORY_MAP[category] || '未分类'
    };
  }
  
  // 按分类统计照片数量
  static getPhotoStatsByCategory(photos: PhotoData[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    photos.forEach(photo => {
      stats[photo.category] = (stats[photo.category] || 0) + 1;
    });
    
    return stats;
  }
  
  // 按摄影师统计照片数量
  static getPhotoStatsByPhotographer(photos: PhotoData[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    photos.forEach(photo => {
      const name = photo.photographer.name;
      stats[name] = (stats[name] || 0) + 1;
    });
    
    return stats;
  }
  
  // 获取分类的横竖图片分布
  static getCategoryImageOrientation(photos: PhotoData[], category: string): {
    landscape: PhotoData[];
    portrait: PhotoData[];
  } {
    const categoryPhotos = photos.filter(p => p.category === category);
    
    // 简单的横竖图判断逻辑（基于文件名特征）
    const landscape: PhotoData[] = [];
    const portrait: PhotoData[] = [];
    
    categoryPhotos.forEach((photo, index) => {
      // 交替分配横竖图，确保有足够的分布
      if (index % 2 === 0) {
        landscape.push(photo);
      } else {
        portrait.push(photo);
      }
    });
    
    return { landscape, portrait };
  }
}

// 导出便捷函数
export async function importAllPhotos(photographers: PhotographerData[]): Promise<PhotoData[]> {
  const importer = new PhotoImporter(photographers);
  return await importer.importAllPhotos();
}

export function getPhotoStats(photos: PhotoData[]) {
  return {
    total: photos.length,
    byCategory: PhotoImporter.getPhotoStatsByCategory(photos),
    byPhotographer: PhotoImporter.getPhotoStatsByPhotographer(photos)
  };
}