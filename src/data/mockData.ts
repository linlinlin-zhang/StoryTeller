import { PhotoData } from "@/components/PhotoCard";
import { importAllPhotos, getPhotoStats } from "@/utils/photoImporter";
import { getImageUrl } from "@/utils/imageHelper";

// 摄影师数据
export interface PhotographerData {
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

export const photographers: PhotographerData[] = [
  {
    id: "zsl",
    name: "长雨林",
    avatar: getImageUrl("/images/头像/长雨林.png"),
    bio: "专注于自然风光和人文摄影，擅长捕捉光影的瞬间变化。",
    specialties: ["风光摄影", "人文摄影", "胶片摄影"],
    location: "广州",
    contact: "zhangyulin@example.com",
    works: 156,
    followers: 2340,
    coverImage: getImageUrl("/images/摄影师/长雨林/人物/000003920008-已增强-SR.jpg"),
    joinDate: "2022年3月"
  },
  {
    id: "zym",
    name: "LTDSA",
    avatar: getImageUrl("/images/头像/LTDSA.jpg"),
    bio: "航拍摄影师，专注于城市建筑和自然风光的空中视角。",
    specialties: ["航拍摄影", "建筑摄影", "城市摄影"],
    location: "深圳",
    contact: "ltdsa@example.com",
    works: 89,
    followers: 1890,
    coverImage: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20240802132116.jpg"),
    joinDate: "2023年1月"
  },
  {
    id: "cfy",
    name: "Flyverse",
    avatar: getImageUrl("/images/头像/Flyverse.jpg"),
    bio: "人像摄影师，善于捕捉人物的情感表达和自然状态。",
    specialties: ["人像摄影", "情感摄影", "生活摄影"],
    location: "北京",
    contact: "flyverse@example.com",
    works: 234,
    followers: 3120,
    coverImage: getImageUrl("/images/摄影师/Flyverse/人物/微信图片_20240802143756.jpg"),
    joinDate: "2021年8月"
  },
  {
    id: "lqr",
    name: "TP",
    avatar: getImageUrl("/images/头像/Tp.jpg"),
    bio: "建筑摄影专家，专注于现代建筑的几何美学。",
    specialties: ["建筑摄影", "几何构图", "黑白摄影"],
    location: "上海",
    contact: "tp@example.com",
    works: 67,
    followers: 1456,
    coverImage: getImageUrl("/images/摄影师/TP/建筑/微信图片_20240802183337.jpg"),
    joinDate: "2023年5月"
  },
  {
    id: "dq",
    name: "戴小岐",
    avatar: getImageUrl("/images/头像/戴小岐.jpg"),
    bio: "自然风光摄影师，热爱日出日落和海景拍摄。",
    specialties: ["风光摄影", "海景摄影", "日出日落"],
    location: "厦门",
    contact: "daixiaoqi@example.com",
    works: 123,
    followers: 2890,
    coverImage: getImageUrl("/images/摄影师/戴小岐/自然/微信图片_20240802121525.jpg"),
    joinDate: "2022年11月"
  },
  {
    id: "sbsp",
    name: "十八 sp",
    avatar: getImageUrl("/images/头像/十八 sp.jpg"),
    bio: "微距摄影专家，专注于捕捉微观世界的精彩瞬间，善于发现生活中的细节之美。",
    specialties: ["微距摄影", "自然摄影", "城市记录"],
    location: "杭州",
    contact: "shibasp@example.com",
    works: 89,
    followers: 1567,
    coverImage: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_15.jpg"),
    joinDate: "2023年8月"
  }
];

// 拍摄地点数据
export interface LocationData {
  id: string;
  name: string;
  image: string;
  description: string;
  bestTime: string;
  difficulty: string;
  tips: string;
  photos: string[];
}

export const locations: LocationData[] = [
  {
    id: "changsha",
    name: "长沙",
    image: getImageUrl("/images/主页地点图/长沙.jpg"),
    description: "湖南省会，历史文化名城，橘子洲头是著名的摄影地点。",
    bestTime: "春秋两季",
    difficulty: "简单",
    tips: "建议傍晚时分前往橘子洲头拍摄湘江夜景。",
    photos: [getImageUrl("/images/主页地点图/长沙.jpg")]
  },
  {
    id: "shenzhen",
    name: "深圳",
    image: getImageUrl("/images/主页地点图/深圳.jpg"),
    description: "现代化都市，高楼林立，是城市建筑摄影的绝佳地点。",
    bestTime: "全年",
    difficulty: "中等",
    tips: "推荐莲花山公园俯拍城市天际线，夜景尤为壮观。",
    photos: [getImageUrl("/images/主页地点图/深圳.jpg")]
  },
  {
    id: "foshan",
    name: "佛山",
    image: getImageUrl("/images/主页地点图/佛山.jpg"),
    description: "岭南文化发源地，古建筑与现代建筑交相辉映。",
    bestTime: "春季",
    difficulty: "简单",
    tips: "祖庙和岭南天地是不错的拍摄地点。",
    photos: [getImageUrl("/images/主页地点图/佛山.jpg")]
  },
  {
    id: "zhuhai",
    name: "珠海",
    image: getImageUrl("/images/主页地点图/珠海 .jpg"),
    description: "海滨城市，拥有美丽的海岸线和现代化建筑。",
    bestTime: "秋冬季",
    difficulty: "简单",
    tips: "情侣路是拍摄海景的最佳地点，日落时分最美。",
    photos: [getImageUrl("/images/主页地点图/珠海 .jpg")]
  },
  {
    id: "guangzhou",
    name: "广州",
    image: getImageUrl("/images/主页地点图/广州.jpg"),
    description: "千年商都，传统与现代完美融合的摄影天堂。",
    bestTime: "全年",
    difficulty: "中等",
    tips: "小蛮腰和珠江夜游是必拍的经典场景。",
    photos: [getImageUrl("/images/主页地点图/广州.jpg")]
  },
  {
    id: "nanjing",
    name: "南京",
    image: getImageUrl("/images/主页地点图/南京.jpg"),
    description: "六朝古都，历史底蕴深厚，四季皆有不同美景。",
    bestTime: "春秋两季",
    difficulty: "中等",
    tips: "中山陵和夫子庙是经典的拍摄地点。",
    photos: [getImageUrl("/images/主页地点图/南京.jpg")]
  }
];

// 照片数据
export const photos: PhotoData[] = [
  {
    id: "1",
    title: "生活记录",
    image: getImageUrl("/images/摄影师/Flyverse/人物/微信图片_20240802143756.jpg"),
    photographer: photographers.find(p => p.id === "cfy")!,
    camera: "Nikon EL2",
    date: "2024.8.4",
    likes: 425,
    views: 4320,
    category: "人物"
  },
  {
    id: "2",
    title: "建筑群",
    image: getImageUrl("/images/摄影师/Flyverse/城市/DSC00577.jpg"),
    photographer: photographers.find(p => p.id === "cfy")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.8.10",
    likes: 760,
    views: 2651,
    category: "城市"
  },
  {
    id: "3",
    title: "夜景",
    image: getImageUrl("/images/摄影师/Flyverse/城市/EH0A8980-已增强-2.jpg"),
    photographer: photographers.find(p => p.id === "cfy")!,
    camera: "Sony Alpha 7R V",
    date: "2024.6.26",
    likes: 404,
    views: 2590,
    category: "城市"
  },
  {
    id: "4",
    title: "夜景",
    image: getImageUrl("/images/摄影师/Flyverse/城市/微信图片_20240802194442.jpg"),
    photographer: photographers.find(p => p.id === "cfy")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.7.13",
    likes: 731,
    views: 5918,
    category: "城市"
  },
  {
    id: "5",
    title: "生态摄影",
    image: getImageUrl("/images/摄影师/Flyverse/自然/微信图片_20240802134101.jpg"),
    photographer: photographers.find(p => p.id === "cfy")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.11.1",
    likes: 296,
    views: 3314,
    category: "自然"
  },
  {
    id: "6",
    title: "真实生活",
    image: getImageUrl("/images/摄影师/Flyverse/记录/微信图片_20250808151946_306.jpg"),
    photographer: photographers.find(p => p.id === "cfy")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.2.1",
    likes: 827,
    views: 4900,
    category: "记录"
  },
  {
    id: "7",
    title: "真实表达",
    image: getImageUrl("/images/摄影师/LTDSA/人物/微信图片_20240802145538.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.2.13",
    likes: 852,
    views: 4270,
    category: "人物"
  },
  {
    id: "8",
    title: "人像写真",
    image: getImageUrl("/images/摄影师/LTDSA/人物/微信图片_20250729105042_224.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.8.10",
    likes: 618,
    views: 1209,
    category: "人物"
  },
  {
    id: "9",
    title: "情感瞬间",
    image: getImageUrl("/images/摄影师/LTDSA/人物/微信图片_20250729105042_226.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.6.26",
    likes: 729,
    views: 4472,
    category: "人物"
  },
  {
    id: "10",
    title: "真实表达",
    image: getImageUrl("/images/摄影师/LTDSA/人物/微信图片_20250729105042_231.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Nikon F2a",
    date: "2024.9.21",
    likes: 200,
    views: 5098,
    category: "人物"
  },
  {
    id: "11",
    title: "真实表达",
    image: getImageUrl("/images/摄影师/LTDSA/人物/微信图片_20250729105042_233.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Sony Alpha 7R V",
    date: "2024.7.17",
    likes: 797,
    views: 4587,
    category: "人物"
  },
  {
    id: "12",
    title: "夜景",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20240802192350.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Fujifilm X-T5",
    date: "2024.4.10",
    likes: 311,
    views: 2808,
    category: "城市"
  },
  {
    id: "13",
    title: "城市天际线",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_2025-08-08_152125_956.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Nikon EL2",
    date: "2024.3.17",
    likes: 706,
    views: 1210,
    category: "城市"
  },
  {
    id: "14",
    title: "都市印象",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250729105042_218.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.5.23",
    likes: 308,
    views: 4302,
    category: "城市"
  },
  {
    id: "15",
    title: "街头摄影",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250729105042_219.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Fujifilm X-T5",
    date: "2024.9.20",
    likes: 515,
    views: 1769,
    category: "城市"
  },
  {
    id: "16",
    title: "建筑群",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250729105042_220.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.3.23",
    likes: 252,
    views: 1913,
    category: "城市"
  },
  {
    id: "17",
    title: "城市天际线",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250729105042_223.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.10.14",
    likes: 597,
    views: 2724,
    category: "城市"
  },
  {
    id: "18",
    title: "城市天际线",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250729105042_232.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Nikon F2a",
    date: "2024.3.27",
    likes: 351,
    views: 5998,
    category: "城市"
  },
  {
    id: "19",
    title: "都市印象",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250729105042_235.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Nikon Z9",
    date: "2024.2.8",
    likes: 388,
    views: 3997,
    category: "城市"
  },
  {
    id: "20",
    title: "都市印象",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250729105042_236.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Nikon EL2",
    date: "2024.4.19",
    likes: 123,
    views: 5307,
    category: "城市"
  },
  {
    id: "21",
    title: "街头摄影",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250808152206_321.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Canon EOS 850D",
    date: "2024.8.26",
    likes: 648,
    views: 4444,
    category: "城市"
  },
  {
    id: "22",
    title: "都市印象",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250808152216_318.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Nikon EL2",
    date: "2024.1.18",
    likes: 442,
    views: 5055,
    category: "城市"
  },
  {
    id: "23",
    title: "几何构图",
    image: getImageUrl("/images/摄影师/LTDSA/建筑/微信图片_20240802182434.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Fujifilm X-T5",
    date: "2024.8.15",
    likes: 783,
    views: 3635,
    category: "建筑"
  },
  {
    id: "24",
    title: "现代建筑",
    image: getImageUrl("/images/摄影师/LTDSA/建筑/微信图片_20250729105042_221.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.11.16",
    likes: 486,
    views: 1435,
    category: "建筑"
  },
  {
    id: "25",
    title: "建筑美学",
    image: getImageUrl("/images/摄影师/LTDSA/建筑/微信图片_20250729105042_222.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.7.25",
    likes: 742,
    views: 3765,
    category: "建筑"
  },
  {
    id: "26",
    title: "几何构图",
    image: getImageUrl("/images/摄影师/LTDSA/建筑/微信图片_20250729105042_225.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Nikon EL2",
    date: "2024.12.1",
    likes: 666,
    views: 5471,
    category: "建筑"
  },
  {
    id: "27",
    title: "古建筑",
    image: getImageUrl("/images/摄影师/LTDSA/建筑/微信图片_20250729105042_230.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Fujifilm X-T5",
    date: "2024.10.26",
    likes: 714,
    views: 5683,
    category: "建筑"
  },
  {
    id: "28",
    title: "日出日落",
    image: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20240802132116.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Nikon Z9",
    date: "2024.3.5",
    likes: 395,
    views: 5790,
    category: "自然"
  },
  {
    id: "29",
    title: "四季变换",
    image: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20250729105041_229.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.7.10",
    likes: 736,
    views: 3842,
    category: "自然"
  },
  {
    id: "30",
    title: "日出日落",
    image: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20250729105042_227.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Fujifilm X-T5",
    date: "2024.3.20",
    likes: 693,
    views: 1496,
    category: "自然"
  },
  {
    id: "31",
    title: "山水画卷",
    image: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20250729105042_228.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.6.15",
    likes: 598,
    views: 1969,
    category: "自然"
  },
  {
    id: "32",
    title: "日出日落",
    image: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20250729105042_234.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.8.2",
    likes: 344,
    views: 3568,
    category: "自然"
  },
  {
    id: "33",
    title: "四季变换",
    image: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20250729105042_237.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.9.4",
    likes: 349,
    views: 5074,
    category: "自然"
  },
  {
    id: "34",
    title: "时光印记",
    image: getImageUrl("/images/摄影师/LTDSA/记录/微信图片_20250808152159_320.jpg"),
    photographer: photographers.find(p => p.id === "zym")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.6.7",
    likes: 369,
    views: 5772,
    category: "记录"
  },
  {
    id: "35",
    title: "生活记录",
    image: getImageUrl("/images/摄影师/TP/人物/IMGL6735.JPG"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Sony Alpha 7R V",
    date: "2024.8.7",
    likes: 275,
    views: 3076,
    category: "人物"
  },
  {
    id: "36",
    title: "人文关怀",
    image: getImageUrl("/images/摄影师/TP/人物/微信图片_20240802195946.jpg"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.1.28",
    likes: 382,
    views: 2683,
    category: "人物"
  },
  {
    id: "37",
    title: "几何构图",
    image: getImageUrl("/images/摄影师/TP/建筑/微信图片_20240802183337.jpg"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.10.4",
    likes: 139,
    views: 4224,
    category: "建筑"
  },
  {
    id: "38",
    title: "影像记录",
    image: getImageUrl("/images/摄影师/TP/未分类/2358720_153.jpg"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.10.19",
    likes: 501,
    views: 4048,
    category: "未分类"
  },
  {
    id: "39",
    title: "镜头语言",
    image: getImageUrl("/images/摄影师/TP/未分类/2358720_223.jpg"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Nikon EL2",
    date: "2024.9.7",
    likes: 861,
    views: 2872,
    category: "未分类"
  },
  {
    id: "40",
    title: "视觉印象",
    image: getImageUrl("/images/摄影师/TP/未分类/微信图片_20250729113923_230.jpg"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Nikon EL2",
    date: "2024.10.10",
    likes: 132,
    views: 1567,
    category: "未分类"
  },
  {
    id: "41",
    title: "镜头语言",
    image: getImageUrl("/images/摄影师/TP/未分类/微信图片_20250729113923_232.jpg"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.1.16",
    likes: 283,
    views: 5008,
    category: "未分类"
  },
  {
    id: "42",
    title: "视觉印象",
    image: getImageUrl("/images/摄影师/TP/未分类/微信图片_20250729113923_233.jpg"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.5.27",
    likes: 416,
    views: 4801,
    category: "未分类"
  },
  {
    id: "43",
    title: "自然风光",
    image: getImageUrl("/images/摄影师/TP/自然/000003920036-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Nikon F2a",
    date: "2024.3.24",
    likes: 647,
    views: 2709,
    category: "自然"
  },
  {
    id: "44",
    title: "自然风光",
    image: getImageUrl("/images/摄影师/TP/自然/_H4A8661-已增强-降噪.jpg"),
    photographer: photographers.find(p => p.id === "lqr")!,
    camera: "Sony Alpha 7R V",
    date: "2024.1.13",
    likes: 870,
    views: 4253,
    category: "自然"
  },
  {
    id: "45",
    title: "真实表达",
    image: getImageUrl("/images/摄影师/十八 sp/人物/微信图片_20250807124336_22.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.2.26",
    likes: 465,
    views: 2618,
    category: "人物"
  },
  {
    id: "46",
    title: "古建筑",
    image: getImageUrl("/images/摄影师/十八 sp/建筑/微信图片_20250808151700_315.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Sony Alpha 7R V",
    date: "2024.4.25",
    likes: 105,
    views: 1932,
    category: "建筑"
  },
  {
    id: "47",
    title: "自然细节",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_2025-08-08_151641_686.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Canon EOS 850D",
    date: "2024.3.27",
    likes: 689,
    views: 4958,
    category: "微距"
  },
  {
    id: "48",
    title: "自然细节",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_15.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon F2a",
    date: "2024.6.2",
    likes: 290,
    views: 3408,
    category: "微距"
  },
  {
    id: "49",
    title: "微观世界",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_16.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon EL2",
    date: "2024.2.14",
    likes: 177,
    views: 4690,
    category: "微距"
  },
  {
    id: "50",
    title: "生命力",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_17.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Fujifilm X-T5",
    date: "2024.5.28",
    likes: 467,
    views: 4377,
    category: "微距"
  },
  {
    id: "51",
    title: "生命力",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_18.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Fujifilm X-T5",
    date: "2024.1.15",
    likes: 383,
    views: 5539,
    category: "微距"
  },
  {
    id: "52",
    title: "自然细节",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_19.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Sony Alpha 7R V",
    date: "2024.5.20",
    likes: 388,
    views: 4136,
    category: "微距"
  },
  {
    id: "53",
    title: "自然细节",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_28.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon Z9",
    date: "2024.3.11",
    likes: 812,
    views: 4200,
    category: "微距"
  },
  {
    id: "54",
    title: "自然细节",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_29.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon F2a",
    date: "2024.9.19",
    likes: 635,
    views: 3914,
    category: "微距"
  },
  {
    id: "55",
    title: "生命力",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_30.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon Z9",
    date: "2024.5.21",
    likes: 526,
    views: 4397,
    category: "微距"
  },
  {
    id: "56",
    title: "微距摄影",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_32.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Sony Alpha 7R V",
    date: "2024.8.28",
    likes: 244,
    views: 3616,
    category: "微距"
  },
  {
    id: "57",
    title: "生命力",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_33.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon F2a",
    date: "2024.7.1",
    likes: 140,
    views: 1261,
    category: "微距"
  },
  {
    id: "58",
    title: "自然细节",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124225_13.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.11.6",
    likes: 659,
    views: 5639,
    category: "微距"
  },
  {
    id: "59",
    title: "微观世界",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124225_14.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon Z9",
    date: "2024.3.27",
    likes: 131,
    views: 5064,
    category: "微距"
  },
  {
    id: "60",
    title: "微观世界",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250808151558_308.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Sony Alpha 7R V",
    date: "2024.6.22",
    likes: 570,
    views: 5377,
    category: "微距"
  },
  {
    id: "61",
    title: "自然细节",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250808151558_309.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon Z9",
    date: "2024.8.20",
    likes: 151,
    views: 5806,
    category: "微距"
  },
  {
    id: "62",
    title: "自然细节",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250808151558_310.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon Z9",
    date: "2024.2.28",
    likes: 451,
    views: 2469,
    category: "微距"
  },
  {
    id: "63",
    title: "视觉印象",
    image: getImageUrl("/images/摄影师/十八 sp/未分类/微信图片_20250807124255_25.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Canon EOS 850D",
    date: "2024.12.2",
    likes: 586,
    views: 2679,
    category: "未分类"
  },
  {
    id: "64",
    title: "摄影作品",
    image: getImageUrl("/images/摄影师/十八 sp/未分类/微信图片_20250807124255_27.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon Z9",
    date: "2024.11.8",
    likes: 155,
    views: 1989,
    category: "未分类"
  },
  {
    id: "65",
    title: "摄影作品",
    image: getImageUrl("/images/摄影师/十八 sp/未分类/微信图片_20250807124255_29.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Canon EOS 850D",
    date: "2024.2.10",
    likes: 768,
    views: 1567,
    category: "未分类"
  },
  {
    id: "66",
    title: "山水画卷",
    image: getImageUrl("/images/摄影师/十八 sp/自然/微信图片_20250807124327_21.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Nikon Z9",
    date: "2024.1.4",
    likes: 377,
    views: 1589,
    category: "自然"
  },
  {
    id: "67",
    title: "山水画卷",
    image: getImageUrl("/images/摄影师/十八 sp/自然/微信图片_20250808151748_312.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.10.26",
    likes: 466,
    views: 1473,
    category: "自然"
  },
  {
    id: "68",
    title: "四季变换",
    image: getImageUrl("/images/摄影师/十八 sp/自然/微信图片_20250808151748_313.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Fujifilm X-T5",
    date: "2024.2.14",
    likes: 468,
    views: 5639,
    category: "自然"
  },
  {
    id: "69",
    title: "真实生活",
    image: getImageUrl("/images/摄影师/十八 sp/记录/微信图片_20250807124319_24.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.4.18",
    likes: 256,
    views: 5648,
    category: "记录"
  },
  {
    id: "70",
    title: "纪实摄影",
    image: getImageUrl("/images/摄影师/十八 sp/记录/微信图片_20250808151817_314.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Fujifilm X-T5",
    date: "2024.9.1",
    likes: 460,
    views: 2829,
    category: "记录"
  },
  {
    id: "71",
    title: "真实生活",
    image: getImageUrl("/images/摄影师/十八 sp/记录/微信图片_20250808151817_316.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.5.22",
    likes: 135,
    views: 3843,
    category: "记录"
  },
  {
    id: "72",
    title: "日常瞬间",
    image: getImageUrl("/images/摄影师/十八 sp/记录/微信图片_20250808151824_311.jpg"),
    photographer: photographers.find(p => p.id === "sbsp")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.3.28",
    likes: 790,
    views: 2125,
    category: "记录"
  },
  {
    id: "73",
    title: "街头摄影",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250728131142_18.jpg"),
    photographer: photographers.find(p => p.id === "dq")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.1.17",
    likes: 679,
    views: 4060,
    category: "城市"
  },
  {
    id: "74",
    title: "夜景",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250728131142_19.jpg"),
    photographer: photographers.find(p => p.id === "dq")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.11.25",
    likes: 437,
    views: 2314,
    category: "城市"
  },
  {
    id: "75",
    title: "建筑群",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250728131142_20.jpg"),
    photographer: photographers.find(p => p.id === "dq")!,
    camera: "Canon EOS 850D",
    date: "2024.11.11",
    likes: 407,
    views: 2902,
    category: "城市"
  },
  {
    id: "76",
    title: "夜景",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250728131142_21.jpg"),
    photographer: photographers.find(p => p.id === "dq")!,
    camera: "Fujifilm X-T5",
    date: "2024.9.11",
    likes: 471,
    views: 2244,
    category: "城市"
  },
  {
    id: "77",
    title: "建筑群",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250729112202_238.jpg"),
    photographer: photographers.find(p => p.id === "dq")!,
    camera: "Canon EOS 850D",
    date: "2024.12.20",
    likes: 330,
    views: 3756,
    category: "城市"
  },
  {
    id: "78",
    title: "建筑群",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250729112202_239.jpg"),
    photographer: photographers.find(p => p.id === "dq")!,
    camera: "Nikon F2a",
    date: "2024.5.1",
    likes: 535,
    views: 5611,
    category: "城市"
  },
  {
    id: "79",
    title: "日出日落",
    image: getImageUrl("/images/摄影师/戴小岐/自然/微信图片_20240802121525.jpg"),
    photographer: photographers.find(p => p.id === "dq")!,
    camera: "Nikon EL2",
    date: "2024.5.26",
    likes: 235,
    views: 4492,
    category: "自然"
  },
  {
    id: "80",
    title: "生活记录",
    image: getImageUrl("/images/摄影师/长雨林/人物/000000880010.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon F2a",
    date: "2024.10.7",
    likes: 326,
    views: 4878,
    category: "人物"
  },
  {
    id: "81",
    title: "人文关怀",
    image: getImageUrl("/images/摄影师/长雨林/人物/000002210005-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.9.2",
    likes: 614,
    views: 4130,
    category: "人物"
  },
  {
    id: "82",
    title: "人像写真",
    image: getImageUrl("/images/摄影师/长雨林/人物/000003920008-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.5.10",
    likes: 659,
    views: 5344,
    category: "人物"
  },
  {
    id: "83",
    title: "人文关怀",
    image: getImageUrl("/images/摄影师/长雨林/人物/DSC00788.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.2.17",
    likes: 555,
    views: 4934,
    category: "人物"
  },
  {
    id: "84",
    title: "人像写真",
    image: getImageUrl("/images/摄影师/长雨林/人物/DSC02373-已增强.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon F2a",
    date: "2024.1.19",
    likes: 438,
    views: 4120,
    category: "人物"
  },
  {
    id: "85",
    title: "情感瞬间",
    image: getImageUrl("/images/摄影师/长雨林/人物/DSC03465.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.7.10",
    likes: 465,
    views: 4558,
    category: "人物"
  },
  {
    id: "86",
    title: "人像写真",
    image: getImageUrl("/images/摄影师/长雨林/人物/DSC08089-3.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.10.14",
    likes: 812,
    views: 1028,
    category: "人物"
  },
  {
    id: "87",
    title: "生活记录",
    image: getImageUrl("/images/摄影师/长雨林/人物/DSC09213-3.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 850D",
    date: "2024.8.12",
    likes: 445,
    views: 4470,
    category: "人物"
  },
  {
    id: "88",
    title: "情感瞬间",
    image: getImageUrl("/images/摄影师/长雨林/人物/IMG-2089.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.9.22",
    likes: 705,
    views: 4099,
    category: "人物"
  },
  {
    id: "89",
    title: "情感瞬间",
    image: getImageUrl("/images/摄影师/长雨林/人物/《疲惫的人》.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon F2a",
    date: "2024.6.27",
    likes: 683,
    views: 1135,
    category: "人物"
  },
  {
    id: "90",
    title: "人文关怀",
    image: getImageUrl("/images/摄影师/长雨林/人物/微信图片_20240802185209.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.1.16",
    likes: 376,
    views: 2919,
    category: "人物"
  },
  {
    id: "91",
    title: "情感瞬间",
    image: getImageUrl("/images/摄影师/长雨林/人物/微信图片_20240802200056.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.8.27",
    likes: 879,
    views: 3219,
    category: "人物"
  },
  {
    id: "92",
    title: "真实表达",
    image: getImageUrl("/images/摄影师/长雨林/人物/微信图片_20250415152739 (2).jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.9.22",
    likes: 807,
    views: 3774,
    category: "人物"
  },
  {
    id: "93",
    title: "街头摄影",
    image: getImageUrl("/images/摄影师/长雨林/城市/000000490030-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 850D",
    date: "2024.5.15",
    likes: 661,
    views: 4911,
    category: "城市"
  },
  {
    id: "94",
    title: "城市天际线",
    image: getImageUrl("/images/摄影师/长雨林/城市/000000490032-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.12.25",
    likes: 160,
    views: 3342,
    category: "城市"
  },
  {
    id: "95",
    title: "建筑群",
    image: getImageUrl("/images/摄影师/长雨林/城市/000010.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.7.21",
    likes: 324,
    views: 1530,
    category: "城市"
  },
  {
    id: "96",
    title: "夜景",
    image: getImageUrl("/images/摄影师/长雨林/城市/0689 (14)-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.10.5",
    likes: 779,
    views: 3087,
    category: "城市"
  },
  {
    id: "97",
    title: "城市天际线",
    image: getImageUrl("/images/摄影师/长雨林/城市/0689 (16).jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.8.2",
    likes: 673,
    views: 2502,
    category: "城市"
  },
  {
    id: "98",
    title: "夜景",
    image: getImageUrl("/images/摄影师/长雨林/城市/DSC00700.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.11.22",
    likes: 563,
    views: 5266,
    category: "城市"
  },
  {
    id: "99",
    title: "城市天际线",
    image: getImageUrl("/images/摄影师/长雨林/城市/DSC01497.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.10.5",
    likes: 113,
    views: 1202,
    category: "城市"
  },
  {
    id: "100",
    title: "街头摄影",
    image: getImageUrl("/images/摄影师/长雨林/城市/DSC02247.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 850D",
    date: "2024.12.18",
    likes: 654,
    views: 2067,
    category: "城市"
  },
  {
    id: "101",
    title: "都市印象",
    image: getImageUrl("/images/摄影师/长雨林/城市/DSC02394.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.8.9",
    likes: 365,
    views: 2568,
    category: "城市"
  },
  {
    id: "102",
    title: "街头摄影",
    image: getImageUrl("/images/摄影师/长雨林/城市/DSC07911.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 850D",
    date: "2024.2.3",
    likes: 356,
    views: 2429,
    category: "城市"
  },
  {
    id: "103",
    title: "都市印象",
    image: getImageUrl("/images/摄影师/长雨林/城市/DSC09362-2.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon Z9",
    date: "2024.7.17",
    likes: 609,
    views: 4468,
    category: "城市"
  },
  {
    id: "104",
    title: "夜景",
    image: getImageUrl("/images/摄影师/长雨林/城市/DSC09483-已增强-2.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.1.11",
    likes: 687,
    views: 2347,
    category: "城市"
  },
  {
    id: "105",
    title: "建筑群",
    image: getImageUrl("/images/摄影师/长雨林/城市/DSC09622.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.9.11",
    likes: 253,
    views: 4049,
    category: "城市"
  },
  {
    id: "106",
    title: "夜景",
    image: getImageUrl("/images/摄影师/长雨林/城市/微信图片_20240802202003.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 850D",
    date: "2024.1.28",
    likes: 591,
    views: 2649,
    category: "城市"
  },
  {
    id: "107",
    title: "街头摄影",
    image: getImageUrl("/images/摄影师/长雨林/城市/微信图片_20241226213759.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.5.11",
    likes: 438,
    views: 1503,
    category: "城市"
  },
  {
    id: "108",
    title: "都市印象",
    image: getImageUrl("/images/摄影师/长雨林/城市/微信图片_20241227155524-已增强-SR-3.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Fujifilm X-T5",
    date: "2024.9.20",
    likes: 858,
    views: 4480,
    category: "城市"
  },
  {
    id: "109",
    title: "现代建筑",
    image: getImageUrl("/images/摄影师/长雨林/建筑/000000490004-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.9.26",
    likes: 659,
    views: 4683,
    category: "建筑"
  },
  {
    id: "110",
    title: "建筑美学",
    image: getImageUrl("/images/摄影师/长雨林/建筑/000001020006-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon Z9",
    date: "2024.1.18",
    likes: 606,
    views: 5579,
    category: "建筑"
  },
  {
    id: "111",
    title: "几何构图",
    image: getImageUrl("/images/摄影师/长雨林/建筑/000001020014-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.7.24",
    likes: 851,
    views: 1911,
    category: "建筑"
  },
  {
    id: "112",
    title: "几何构图",
    image: getImageUrl("/images/摄影师/长雨林/建筑/000002210037-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.1.19",
    likes: 651,
    views: 4120,
    category: "建筑"
  },
  {
    id: "113",
    title: "现代建筑",
    image: getImageUrl("/images/摄影师/长雨林/建筑/1.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon Z9",
    date: "2024.2.18",
    likes: 615,
    views: 5409,
    category: "建筑"
  },
  {
    id: "114",
    title: "建筑细节",
    image: getImageUrl("/images/摄影师/长雨林/建筑/4733 (12).jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Fujifilm X-T5",
    date: "2024.1.21",
    likes: 476,
    views: 1177,
    category: "建筑"
  },
  {
    id: "115",
    title: "古建筑",
    image: getImageUrl("/images/摄影师/长雨林/建筑/4733 (14).jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 850D",
    date: "2024.8.9",
    likes: 642,
    views: 1076,
    category: "建筑"
  },
  {
    id: "116",
    title: "现代建筑",
    image: getImageUrl("/images/摄影师/长雨林/建筑/7.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.1.17",
    likes: 612,
    views: 4252,
    category: "建筑"
  },
  {
    id: "117",
    title: "现代建筑",
    image: getImageUrl("/images/摄影师/长雨林/建筑/8.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.6.11",
    likes: 526,
    views: 4307,
    category: "建筑"
  },
  {
    id: "118",
    title: "现代建筑",
    image: getImageUrl("/images/摄影师/长雨林/建筑/9.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.11.1",
    likes: 467,
    views: 4419,
    category: "建筑"
  },
  {
    id: "119",
    title: "古建筑",
    image: getImageUrl("/images/摄影师/长雨林/建筑/DSC00947 (2).jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon F2a",
    date: "2024.7.4",
    likes: 311,
    views: 1472,
    category: "建筑"
  },
  {
    id: "120",
    title: "建筑美学",
    image: getImageUrl("/images/摄影师/长雨林/建筑/DSC06221-已增强.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon F2a",
    date: "2024.12.18",
    likes: 734,
    views: 4045,
    category: "建筑"
  },
  {
    id: "121",
    title: "古建筑",
    image: getImageUrl("/images/摄影师/长雨林/建筑/mmexport1647118780190.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon F2a",
    date: "2024.11.10",
    likes: 341,
    views: 4937,
    category: "建筑"
  },
  {
    id: "122",
    title: "建筑细节",
    image: getImageUrl("/images/摄影师/长雨林/建筑/mmexport1647118790415.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Fujifilm X-T5",
    date: "2024.1.2",
    likes: 717,
    views: 4076,
    category: "建筑"
  },
  {
    id: "123",
    title: "建筑细节",
    image: getImageUrl("/images/摄影师/长雨林/建筑/《汉京金融中心的限定涂装》.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.4.15",
    likes: 459,
    views: 3105,
    category: "建筑"
  },
  {
    id: "124",
    title: "建筑细节",
    image: getImageUrl("/images/摄影师/长雨林/建筑/微信图片_20231201180135.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.11.19",
    likes: 105,
    views: 4679,
    category: "建筑"
  },
  {
    id: "125",
    title: "镜头语言",
    image: getImageUrl("/images/摄影师/长雨林/未分类/000000490008-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Fujifilm X-T5",
    date: "2024.5.13",
    likes: 199,
    views: 3365,
    category: "未分类"
  },
  {
    id: "126",
    title: "镜头语言",
    image: getImageUrl("/images/摄影师/长雨林/未分类/000001020003-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon F2a",
    date: "2024.1.17",
    likes: 546,
    views: 2957,
    category: "未分类"
  },
  {
    id: "127",
    title: "镜头语言",
    image: getImageUrl("/images/摄影师/长雨林/未分类/5.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.12.6",
    likes: 626,
    views: 3802,
    category: "未分类"
  },
  {
    id: "128",
    title: "影像记录",
    image: getImageUrl("/images/摄影师/长雨林/未分类/DSC07286.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.12.8",
    likes: 493,
    views: 2102,
    category: "未分类"
  },
  {
    id: "129",
    title: "摄影作品",
    image: getImageUrl("/images/摄影师/长雨林/未分类/DSC08055-已增强-2.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon F2a",
    date: "2024.11.23",
    likes: 181,
    views: 1435,
    category: "未分类"
  },
  {
    id: "130",
    title: "视觉印象",
    image: getImageUrl("/images/摄影师/长雨林/未分类/LT-NORITSU43986.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 850D",
    date: "2024.3.4",
    likes: 239,
    views: 3282,
    category: "未分类"
  },
  {
    id: "131",
    title: "视觉印象",
    image: getImageUrl("/images/摄影师/长雨林/未分类/LT-NORITSU43992.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.8.24",
    likes: 424,
    views: 1772,
    category: "未分类"
  },
  {
    id: "132",
    title: "日出日落",
    image: getImageUrl("/images/摄影师/长雨林/自然/000000490034-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.12.9",
    likes: 106,
    views: 4944,
    category: "自然"
  },
  {
    id: "133",
    title: "四季变换",
    image: getImageUrl("/images/摄影师/长雨林/自然/000001020018-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.6.23",
    likes: 637,
    views: 4426,
    category: "自然"
  },
  {
    id: "134",
    title: "日出日落",
    image: getImageUrl("/images/摄影师/长雨林/自然/902A0976.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.9.5",
    likes: 841,
    views: 3308,
    category: "自然"
  },
  {
    id: "135",
    title: "四季变换",
    image: getImageUrl("/images/摄影师/长雨林/自然/DSC01876.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.10.7",
    likes: 726,
    views: 1297,
    category: "自然"
  },
  {
    id: "136",
    title: "日出日落",
    image: getImageUrl("/images/摄影师/长雨林/自然/DSC02293.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon Z9",
    date: "2024.10.10",
    likes: 678,
    views: 4462,
    category: "自然"
  },
  {
    id: "137",
    title: "山水画卷",
    image: getImageUrl("/images/摄影师/长雨林/自然/DSC06612.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon EL2",
    date: "2024.8.24",
    likes: 281,
    views: 1934,
    category: "自然"
  },
  {
    id: "138",
    title: "日常瞬间",
    image: getImageUrl("/images/摄影师/长雨林/记录/000000490010-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.9.12",
    likes: 746,
    views: 1983,
    category: "记录"
  },
  {
    id: "139",
    title: "时光印记",
    image: getImageUrl("/images/摄影师/长雨林/记录/000000880002-2.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Fujifilm X-T5",
    date: "2024.11.6",
    likes: 684,
    views: 1445,
    category: "记录"
  },
  {
    id: "140",
    title: "生活记录",
    image: getImageUrl("/images/摄影师/长雨林/记录/000000880004.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.3.14",
    likes: 615,
    views: 3303,
    category: "记录"
  },
  {
    id: "141",
    title: "纪实摄影",
    image: getImageUrl("/images/摄影师/长雨林/记录/000002210017-已增强-SR.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon Z9",
    date: "2024.11.14",
    likes: 679,
    views: 1917,
    category: "记录"
  },
  {
    id: "142",
    title: "真实生活",
    image: getImageUrl("/images/摄影师/长雨林/记录/002.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.2.6",
    likes: 397,
    views: 2114,
    category: "记录"
  },
  {
    id: "143",
    title: "日常瞬间",
    image: getImageUrl("/images/摄影师/长雨林/记录/004.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 5D Mark IV",
    date: "2024.4.10",
    likes: 348,
    views: 5079,
    category: "记录"
  },
  {
    id: "144",
    title: "纪实摄影",
    image: getImageUrl("/images/摄影师/长雨林/记录/DSC01940.JPG"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7R V",
    date: "2024.8.6",
    likes: 354,
    views: 2789,
    category: "记录"
  },
  {
    id: "145",
    title: "纪实摄影",
    image: getImageUrl("/images/摄影师/长雨林/记录/DSC03251.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.11.17",
    likes: 317,
    views: 5726,
    category: "记录"
  },
  {
    id: "146",
    title: "日常瞬间",
    image: getImageUrl("/images/摄影师/长雨林/记录/DSC05687.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Fujifilm X-T5",
    date: "2024.3.2",
    likes: 829,
    views: 2198,
    category: "记录"
  },
  {
    id: "147",
    title: "日常瞬间",
    image: getImageUrl("/images/摄影师/长雨林/记录/DSC07148-已增强-降噪-3.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Nikon Z9",
    date: "2024.2.11",
    likes: 649,
    views: 2136,
    category: "记录"
  },
  {
    id: "148",
    title: "时光印记",
    image: getImageUrl("/images/摄影师/长雨林/记录/LT-NORITSU43981-2.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Sony Alpha 7 IV",
    date: "2024.5.7",
    likes: 541,
    views: 3676,
    category: "记录"
  },
  {
    id: "149",
    title: "生活记录",
    image: getImageUrl("/images/摄影师/长雨林/记录/LT-NORITSU44000.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS R6 Mark II",
    date: "2024.4.24",
    likes: 181,
    views: 2178,
    category: "记录"
  },
  {
    id: "150",
    title: "纪实摄影",
    image: getImageUrl("/images/摄影师/长雨林/记录/微信图片_20240802205538.jpg"),
    photographer: photographers.find(p => p.id === "zsl")!,
    camera: "Canon EOS 850D",
    date: "2024.11.13",
    likes: 874,
    views: 2192,
    category: "记录"
  }
];

// 获取摄影师的照片
export const getPhotographerPhotos = (photographerId: string): PhotoData[] => {
  return photos.filter(photo => photo.photographer.id === photographerId);
};

// 根据分类获取照片
export const getPhotosByCategory = (category: string): PhotoData[] => {
  return photos.filter(photo => photo.category === category);
};

// 根据ID获取摄影师
export const getPhotographerById = (id: string): PhotographerData | undefined => {
  return photographers.find(photographer => photographer.id === id);
};

// 根据ID获取照片
export const getPhotoById = async (id: string): Promise<PhotoData | undefined> => {
  // 首先在原始photos数组中查找
  const originalPhoto = photos.find(photo => photo.id === id);
  if (originalPhoto) {
    return originalPhoto;
  }
  
  // 如果在原始数组中没找到，在导入的照片中查找
  try {
    const allPhotos = await getAllPhotos();
    return allPhotos.find(photo => photo.id === id);
  } catch (error) {
    console.error('获取照片失败:', error);
    return undefined;
  }
};

// 根据ID获取地点
export const getLocationById = (id: string): LocationData | undefined => {
  return locations.find(location => location.id === id);
};

// 获取热门照片（按点赞数排序）
export const getPopularPhotos = (limit: number = 10): PhotoData[] => {
  return [...photos].sort((a, b) => b.likes - a.likes).slice(0, limit);
};

// 获取最新照片（按日期排序）
export const getLatestPhotos = (limit: number = 10): PhotoData[] => {
  return [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
};

// 搜索照片
export const searchPhotos = (query: string): PhotoData[] => {
  const lowercaseQuery = query.toLowerCase();
  return photos.filter(photo => 
    photo.title.toLowerCase().includes(lowercaseQuery) ||
    photo.photographer.name.toLowerCase().includes(lowercaseQuery) ||
    photo.category.toLowerCase().includes(lowercaseQuery)
  );
};

// 获取推荐照片
export const getRecommendedPhotos = async (currentPhotoId: string, limit: number = 6): Promise<PhotoData[]> => {
  const currentPhoto = await getPhotoById(currentPhotoId);
  if (!currentPhoto) return [];
  
  // 获取所有照片数据
  const allPhotos = await getAllPhotos();
  
  // 优先推荐同一摄影师的其他作品
  const samePhotographerPhotos = allPhotos.filter(photo => 
    photo.photographer.id === currentPhoto.photographer.id && photo.id !== currentPhotoId
  );
  
  // 如果同一摄影师的作品不够，再推荐同类别的其他作品
  const sameCategoryPhotos = allPhotos.filter(photo => 
    photo.category === currentPhoto.category && 
    photo.photographer.id !== currentPhoto.photographer.id
  );
  
  const recommended = [...samePhotographerPhotos, ...sameCategoryPhotos];
  return recommended.slice(0, limit);
};

// 设备数据
export interface EquipmentData {
  id: string;
  name: string;
  brand: string;
  type: string;
  image: string;
  description: string;
  specs: {
    [key: string]: string;
  };
  price: string;
  rating: number;
  reviews: number;
}

export const equipment: EquipmentData[] = [
  // 设备数据已移除，等待添加真实设备图片
];

// 根据ID获取设备
export const getEquipmentById = (id: string): EquipmentData | undefined => {
  return equipment.find(item => item.id === id);
};

// 根据类型获取设备
export const getEquipmentByType = (type: string): EquipmentData[] => {
  return equipment.filter(item => item.type === type);
};

// 搜索设备
export const searchEquipment = (query: string): EquipmentData[] => {
  const lowercaseQuery = query.toLowerCase();
  return equipment.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.brand.toLowerCase().includes(lowercaseQuery) ||
    item.type.toLowerCase().includes(lowercaseQuery)
  );
};

// 获取推荐设备
export const getRecommendedEquipment = (limit: number = 4): EquipmentData[] => {
  return [...equipment].sort((a, b) => b.rating - a.rating).slice(0, limit);
};

// 轮播图片
export const slideImages = [
  getImageUrl("/images/主页横图/微信图片_20240617163026.jpg"),
  getImageUrl("/images/主页横图/微信图片_20240617165015-已增强-SR.jpg"),
  getImageUrl("/images/主页横图/微信图片_20240617165121-已增强-SR.jpg"),
  getImageUrl("/images/主页横图/微信图片_20240617165126-已增强-SR.jpg")
];

// 分类数据
export const categories = [
  { id: "nature", name: "自然", key: "自然" },
  { id: "portrait", name: "人物", key: "人物" },
  { id: "architecture", name: "建筑", key: "建筑" },
  { id: "city", name: "城市", key: "城市" },
  { id: "record", name: "记录", key: "记录" },
  { id: "macro", name: "微距", key: "微距" },
  { id: "uncategorized", name: "未分类", key: "未分类" }
];

// 根据摄影师获取照片
export const getPhotosByPhotographer = async (photographerId: string): Promise<PhotoData[]> => {
  const allPhotos = await getAllPhotos();
  return allPhotos.filter(photo => photo.photographer.id === photographerId);
};

// 初始化所有照片数据
let allPhotosCache: PhotoData[] | null = null;

// 异步获取所有照片数据
export const getAllPhotos = async (): Promise<PhotoData[]> => {
  if (allPhotosCache) {
    return allPhotosCache;
  }
  
  try {
    allPhotosCache = await importAllPhotos(photographers);
    console.log('📸 照片导入完成:', {
      总数: allPhotosCache.length,
      统计: getPhotoStats(allPhotosCache)
    });
    return allPhotosCache;
  } catch (error) {
    console.error('照片导入失败:', error);
    return photos; // 降级到原有数据
  }
};

// 重置照片缓存（用于开发调试）
export const resetPhotosCache = () => {
  allPhotosCache = null;
};

// 获取增强版照片数据的便捷函数
export const getEnhancedPhotos = async (): Promise<PhotoData[]> => {
  return await getAllPhotos();
};

// 获取增强版热门照片
export const getEnhancedPopularPhotos = async (limit: number = 10): Promise<PhotoData[]> => {
  const allPhotos = await getAllPhotos();
  return [...allPhotos].sort((a, b) => b.likes - a.likes).slice(0, limit);
};

// 获取增强版最新照片
export const getEnhancedLatestPhotos = async (limit: number = 10): Promise<PhotoData[]> => {
  const allPhotos = await getAllPhotos();
  return [...allPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
};

// 增强版搜索照片
export const searchEnhancedPhotos = async (query: string): Promise<PhotoData[]> => {
  const allPhotos = await getAllPhotos();
  const lowercaseQuery = query.toLowerCase();
  return allPhotos.filter(photo => 
    photo.title.toLowerCase().includes(lowercaseQuery) ||
    photo.photographer.name.toLowerCase().includes(lowercaseQuery) ||
    photo.category.toLowerCase().includes(lowercaseQuery)
  );
};

// 增强版按分类获取照片
export const getEnhancedPhotosByCategory = async (category: string): Promise<PhotoData[]> => {
  const allPhotos = await getAllPhotos();
  return allPhotos.filter(photo => photo.category === category);
};

// 增强版按摄影师获取照片
export const getEnhancedPhotosByPhotographer = async (photographerId: string): Promise<PhotoData[]> => {
  const allPhotos = await getAllPhotos();
  return allPhotos.filter(photo => photo.photographer.id === photographerId);
};

// 获取分类统计信息
export const getCategoryStats = async (): Promise<Record<string, number>> => {
  const allPhotos = await getAllPhotos();
  const stats = getPhotoStats(allPhotos);
  return stats.byCategory;
};

// 获取摄影师统计信息
export const getPhotographerStats = async (): Promise<Record<string, number>> => {
  const allPhotos = await getAllPhotos();
  const stats = getPhotoStats(allPhotos);
  return stats.byPhotographer;
};

// 获取分类的横竖图分布（用于Gallery页面）
export const getCategoryImageLayout = async (category: string): Promise<{
  landscape: PhotoData[];
  portrait: PhotoData[];
  canAlternate: boolean;
}> => {
  const categoryPhotos = await getEnhancedPhotosByCategory(category);
  
  // 简单的横竖图分配策略
  const landscape: PhotoData[] = [];
  const portrait: PhotoData[] = [];
  
  categoryPhotos.forEach((photo, index) => {
    if (index % 2 === 0) {
      landscape.push(photo);
    } else {
      portrait.push(photo);
    }
  });
  
  // 检查是否有足够的照片进行横竖交替布局
  const canAlternate = landscape.length >= 4 && portrait.length >= 4;
  
  return {
    landscape,
    portrait,
    canAlternate
  };
};

// 获取图片实际尺寸的辅助函数
const getImageDimensions = (imagePath: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      // 如果图片加载失败，返回默认尺寸（横图）
      resolve({ width: 1200, height: 800 });
    };
    img.src = imagePath;
  });
};

// 判断图片方向的辅助函数（基于实际宽高比）
const getImageOrientation = async (imagePath: string): Promise<'landscape' | 'portrait'> => {
  try {
    const { width, height } = await getImageDimensions(imagePath);
    const ratio = width / height;
    
    // 使用与PhotoCard组件相同的判断逻辑
    if (ratio > 1.4) {
      return 'landscape';
    } else if (ratio < 0.7) {
      return 'portrait';
    } else {
      // 正方形图片默认归类为横图
      return 'landscape';
    }
  } catch (error) {
    // 如果获取尺寸失败，默认返回横图
    return 'landscape';
  }
};

// 获取主页精选照片（每个类别16张，4页每页4张，同页方向一致）
export const getHomeFeaturedPhotos = async (category: string): Promise<{
  pages: PhotoData[][];
  totalPages: number;
}> => {
  const allPhotos = await getAllPhotos();
  const categoryPhotos = allPhotos.filter(photo => photo.category === category);
  
  // 按摄影师分组
  const photosByPhotographer: Record<string, PhotoData[]> = {};
  categoryPhotos.forEach(photo => {
    const photographerId = photo.photographer.id;
    if (!photosByPhotographer[photographerId]) {
      photosByPhotographer[photographerId] = [];
    }
    photosByPhotographer[photographerId].push(photo);
  });
  
  // 从每个摄影师随机选择照片，尽量覆盖更多摄影师
  const selectedPhotos: PhotoData[] = [];
  const photographerIds = Object.keys(photosByPhotographer);
  
  // 如果有摄影师，循环选择照片直到达到16张
  if (photographerIds.length > 0) {
    let currentPhotographerIndex = 0;
    let attempts = 0;
    const maxAttempts = 1000; // 防止无限循环
    
    while (selectedPhotos.length < 16 && attempts < maxAttempts) {
      const currentPhotographerId = photographerIds[currentPhotographerIndex];
      const availablePhotos = photosByPhotographer[currentPhotographerId];
      
      if (availablePhotos.length > 0) {
        // 随机选择一张照片
        const randomIndex = Math.floor(Math.random() * availablePhotos.length);
        const selectedPhoto = availablePhotos[randomIndex];
        selectedPhotos.push(selectedPhoto);
        
        // 从可用照片中移除已选择的照片
        availablePhotos.splice(randomIndex, 1);
      }
      
      // 移动到下一个摄影师
      currentPhotographerIndex = (currentPhotographerIndex + 1) % photographerIds.length;
      
      // 如果当前摄影师的照片用完了，检查是否所有摄影师都用完了
      const allEmpty = photographerIds.every(id => photosByPhotographer[id].length === 0);
      if (allEmpty && selectedPhotos.length < 16) {
        // 重新填充所有摄影师的照片
        categoryPhotos.forEach(photo => {
          const photographerId = photo.photographer.id;
          photosByPhotographer[photographerId].push(photo);
        });
      }
      
      attempts++;
    }
  }
  
  // 如果没有足够的照片，用现有照片重复填充
  while (selectedPhotos.length < 16 && categoryPhotos.length > 0) {
    const randomPhoto = categoryPhotos[Math.floor(Math.random() * categoryPhotos.length)];
    selectedPhotos.push(randomPhoto);
  }
  
  // 异步获取所有照片的方向信息
  const photosWithOrientation = await Promise.all(
    selectedPhotos.map(async (photo) => {
      const orientation = await getImageOrientation(photo.image);
      return { photo, orientation };
    })
  );
  
  // 按照图片方向分组
  const landscapePhotos: PhotoData[] = [];
  const portraitPhotos: PhotoData[] = [];
  
  photosWithOrientation.forEach(({ photo, orientation }) => {
    if (orientation === 'landscape') {
      landscapePhotos.push(photo);
    } else {
      portraitPhotos.push(photo);
    }
  });
  
  // 创建4页，每页4张，确保同页方向一致
  const pages: PhotoData[][] = [];
  
  // 如果某种方向的照片不足，需要重新分配
  const totalNeeded = 16;
  const pagesNeeded = 4;
  const photosPerPage = 4;
  
  // 理想情况：2页横图，2页竖图
  const idealLandscapeCount = 8;
  const idealPortraitCount = 8;
  
  // 调整照片分布，确保有足够的照片用于分页
  if (landscapePhotos.length < idealLandscapeCount) {
    // 横图不足，从竖图中补充一些
    const needed = idealLandscapeCount - landscapePhotos.length;
    const toMove = Math.min(needed, portraitPhotos.length - idealPortraitCount);
    for (let i = 0; i < toMove; i++) {
      if (portraitPhotos.length > 0) {
        landscapePhotos.push(portraitPhotos.pop()!);
      }
    }
  }
  
  if (portraitPhotos.length < idealPortraitCount) {
    // 竖图不足，从横图中补充一些
    const needed = idealPortraitCount - portraitPhotos.length;
    const toMove = Math.min(needed, landscapePhotos.length - idealLandscapeCount);
    for (let i = 0; i < toMove; i++) {
      if (landscapePhotos.length > 0) {
        portraitPhotos.push(landscapePhotos.pop()!);
      }
    }
  }
  
  // 如果还是不够，用现有照片重复填充
  while (landscapePhotos.length < idealLandscapeCount && selectedPhotos.length > 0) {
    landscapePhotos.push(selectedPhotos[landscapePhotos.length % selectedPhotos.length]);
  }
  
  while (portraitPhotos.length < idealPortraitCount && selectedPhotos.length > 0) {
    portraitPhotos.push(selectedPhotos[portraitPhotos.length % selectedPhotos.length]);
  }
  
  // 创建4页：横图-竖图-横图-竖图的模式
  // 第1页：横图
  const page1 = landscapePhotos.slice(0, 4);
  pages.push(page1);
  
  // 第2页：竖图
  const page2 = portraitPhotos.slice(0, 4);
  pages.push(page2);
  
  // 第3页：剩余横图
  const page3 = landscapePhotos.slice(4, 8);
  pages.push(page3);
  
  // 第4页：剩余竖图
  const page4 = portraitPhotos.slice(4, 8);
  pages.push(page4);
  
  return {
    pages,
    totalPages: 4
  };
};

// 预加载照片数据（在应用启动时调用）
export const preloadPhotos = async (): Promise<void> => {
  try {
    await getAllPhotos();
    console.log('✅ 照片数据预加载完成');
  } catch (error) {
    console.error('❌ 照片数据预加载失败:', error);
  }
};