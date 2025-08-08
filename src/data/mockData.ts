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
    name: "Tp",
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
  // 长雨林的作品
  {
    id: "1",
    title: "永恒与一日",
    image: getImageUrl("/images/摄影师/长雨林/自然/000000490034-已增强-SR.jpg"),
    photographer: photographers[0],
    camera: "Nikon F2a",
    date: "2024.7.10",
    likes: 234,
    views: 1567,
    category: "自然"
  },
  {
    id: "2",
    title: "因你们而火热",
    image: getImageUrl("/images/摄影师/长雨林/人物/000003920008-已增强-SR.jpg"),
    photographer: photographers[0],
    camera: "Nikon F2a",
    date: "2024.7.10",
    likes: 456,
    views: 2890,
    category: "人物"
  },
  {
    id: "3",
    title: "中央图书馆",
    image: getImageUrl("/images/摄影师/长雨林/建筑/DSC00947 (2).jpg"),
    photographer: photographers[0],
    camera: "Sony Alpha 7 Ⅳ",
    date: "2024.5.20",
    likes: 123,
    views: 1567,
    category: "建筑"
  },
  {
    id: "4",
    title: "同华路11号",
    image: getImageUrl("/images/摄影师/长雨林/城市/微信图片_20240802202003.jpg"),
    photographer: photographers[0],
    camera: "Nikon EL2",
    date: "2023.9.4",
    likes: 456,
    views: 3456,
    category: "城市"
  },
  {
    id: "5",
    title: "在海边做梦",
    image: getImageUrl("/images/摄影师/长雨林/记录/微信图片_20240802205538.jpg"),
    photographer: photographers[0],
    camera: "Nikon EL2",
    date: "2024.1.22",
    likes: 567,
    views: 3456,
    category: "记录"
  },
  {
    id: "6",
    title: "走出人群",
    image: getImageUrl("/images/摄影师/长雨林/记录/LT-NORITSU43981-2.jpg"),
    photographer: photographers[0],
    camera: "Sony Alpha 7 Ⅳ",
    date: "2023.11.4",
    likes: 234,
    views: 1890,
    category: "记录"
  },
  {
    id: "7",
    title: "光影交错",
    image: getImageUrl("/images/摄影师/长雨林/未分类/000000490008-已增强-SR.jpg"),
    photographer: photographers[0],
    camera: "Canon EOS 5D Mark IV",
    date: "2024.5.22",
    likes: 412,
    views: 2654,
    category: "未分类"
  },
  {
    id: "8",
    title: "城市印象",
    image: getImageUrl("/images/摄影师/长雨林/城市/000000490030-已增强-SR.jpg"),
    photographer: photographers[0],
    camera: "Nikon Z9",
    date: "2024.7.8",
    likes: 523,
    views: 3421,
    category: "城市"
  },
  {
    id: "9",
    title: "夏日午后",
    image: getImageUrl("/images/摄影师/长雨林/未分类/000001020003-已增强-SR.jpg"),
    photographer: photographers[0],
    camera: "Canon EOS R6 Mark II",
    date: "2024.6.30",
    likes: 445,
    views: 2987,
    category: "未分类"
  },
  {
    id: "10",
    title: "人间烟火",
    image: getImageUrl("/images/摄影师/长雨林/建筑/000001020006-已增强-SR.jpg"),
    photographer: photographers[0],
    camera: "Fujifilm X-T5",
    date: "2024.5.12",
    likes: 378,
    views: 2456,
    category: "建筑"
  },
  {
    id: "11",
    title: "佛山古韵",
    image: getImageUrl("/images/摄影师/长雨林/建筑/4733 (12).jpg"),
    photographer: photographers[0],
    camera: "Canon EOS 5D Mark IV",
    date: "2024.4.15",
    likes: 289,
    views: 1876,
    category: "建筑"
  },
  {
    id: "12",
    title: "传统与现代",
    image: getImageUrl("/images/摄影师/长雨林/建筑/4733 (14).jpg"),
    photographer: photographers[0],
    camera: "Sony Alpha 7R V",
    date: "2024.4.16",
    likes: 345,
    views: 2134,
    category: "建筑"
  },
  {
    id: "13",
    title: "长沙印象",
    image: getImageUrl("/images/摄影师/长雨林/城市/0689 (14)-已增强-SR.jpg"),
    photographer: photographers[0],
    camera: "Nikon Z9",
    date: "2024.3.20",
    likes: 412,
    views: 2789,
    category: "城市"
  },
  {
    id: "14",
    title: "城市天际线",
    image: getImageUrl("/images/摄影师/长雨林/城市/0689 (16).jpg"),
    photographer: photographers[0],
    camera: "Canon EOS R6 Mark II",
    date: "2024.3.22",
    likes: 356,
    views: 2345,
    category: "城市"
  },
  {
    id: "15",
    title: "深圳夜景",
    image: getImageUrl("/images/摄影师/长雨林/城市/DSC02247.jpg"),
    photographer: photographers[0],
    camera: "Sony Alpha 7 IV",
    date: "2024.2.18",
    likes: 523,
    views: 3456,
    category: "城市"
  },
  {
    id: "16",
    title: "海岸风光",
    image: getImageUrl("/images/摄影师/长雨林/建筑/DSC06221-已增强.jpg"),
    photographer: photographers[0],
    camera: "Canon EOS 850D",
    date: "2024.1.25",
    likes: 445,
    views: 2987,
    category: "建筑"
  },
  {
    id: "17",
    title: "胶片质感",
    image: getImageUrl("/images/摄影师/长雨林/记录/LT-NORITSU43981-2.jpg"),
    photographer: photographers[0],
    camera: "Nikon F2a",
    date: "2024.5.8",
    likes: 234,
    views: 1654,
    category: "记录"
  },
  {
    id: "18",
    title: "南京古城",
    image: getImageUrl("/images/摄影师/长雨林/城市/000010.jpg"),
    photographer: photographers[0],
    camera: "Fujifilm X-T5",
    date: "2024.4.12",
    likes: 389,
    views: 2456,
    category: "城市"
  },
  {
    id: "19",
    title: "都市节奏",
    image: getImageUrl("/images/摄影师/长雨林/人物/微信图片_20240802185209.jpg"),
    photographer: photographers[0],
    camera: "Sony Alpha 7R V",
    date: "2024.7.5",
    likes: 456,
    views: 3234,
    category: "人物"
  },
  {
    id: "20",
    title: "工作室一角",
    image: getImageUrl("/images/摄影师/长雨林/人物/微信图片_20250415152739 (2).jpg"),
    photographer: photographers[0],
    camera: "Nikon Z9",
    date: "2024.7.23",
    likes: 198,
    views: 1456,
    category: "人物"
  },

  // LTDSA的作品
  {
    id: "21",
    title: "山的尽头是海",
    image: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20240802132116.jpg"),
    photographer: photographers[1],
    camera: "DJI Air 2S",
    date: "2024.7.10",
    likes: 345,
    views: 2134,
    category: "自然"
  },
  {
    id: "22",
    title: "太阳在坠落，海岸在发愁",
    image: getImageUrl("/images/摄影师/LTDSA/人物/微信图片_20240802145538.jpg"),
    photographer: photographers[1],
    camera: "Canon EOS 5D Mark IV",
    date: "2024.3.13",
    likes: 345,
    views: 2345,
    category: "人物"
  },
  {
    id: "23",
    title: "旧地重游",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20240802192350.jpg"),
    photographer: photographers[1],
    camera: "Canon EOS 5D Mark IV",
    date: "2024.3.10",
    likes: 567,
    views: 4567,
    category: "城市"
  },
  {
    id: "24",
    title: "无人之境",
    image: getImageUrl("/images/摄影师/LTDSA/建筑/微信图片_20240802182434.jpg"),
    photographer: photographers[1],
    camera: "Canon EOS 5D Mark IV",
    date: "2024.5.14",
    likes: 234,
    views: 2134,
    category: "建筑"
  },
  {
    id: "25",
    title: "自然风光",
    image: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20250729105041_229.jpg"),
    photographer: photographers[1],
    camera: "DJI Air 2S",
    date: "2024.6.15",
    likes: 298,
    views: 1876,
    category: "自然"
  },
  {
    id: "26",
    title: "城市建筑",
    image: getImageUrl("/images/摄影师/LTDSA/城市/微信图片_20250729105042_218.jpg"),
    photographer: photographers[1],
    camera: "Sony Alpha 7R V",
    date: "2024.4.18",
    likes: 356,
    views: 2198,
    category: "城市"
  },
  {
    id: "27",
    title: "建筑美学",
    image: getImageUrl("/images/摄影师/LTDSA/建筑/微信图片_20250729105042_221.jpg"),
    photographer: photographers[1],
    camera: "Nikon Z9",
    date: "2024.7.8",
    likes: 523,
    views: 3421,
    category: "建筑"
  },
  {
    id: "28",
    title: "人物肖像",
    image: getImageUrl("/images/摄影师/LTDSA/人物/微信图片_20250729105042_224.jpg"),
    photographer: photographers[1],
    camera: "Canon EOS R6 Mark II",
    date: "2024.6.30",
    likes: 445,
    views: 2987,
    category: "人物"
  },

  // Flyverse的作品
  {
    id: "29",
    title: "万花丛中过，片叶不沾身",
    image: getImageUrl("/images/摄影师/Flyverse/人物/微信图片_20240802143756.jpg"),
    photographer: photographers[2],
    camera: "Canon EOS 5D Mark Ⅲ",
    date: "2021.3.17",
    likes: 678,
    views: 4567,
    category: "人物"
  },
  {
    id: "30",
    title: "我怀念的",
    image: getImageUrl("/images/摄影师/Flyverse/自然/微信图片_20240802134101.jpg"),
    photographer: photographers[2],
    camera: "Canon EOS 5D Mark IV",
    date: "2021.7.16",
    likes: 456,
    views: 2890,
    category: "自然"
  },
  {
    id: "31",
    title: "破败之中亦有生机",
    image: getImageUrl("/images/摄影师/Flyverse/城市/微信图片_20240802194442.jpg"),
    photographer: photographers[2],
    camera: "Canon EOS R6 Mark II",
    date: "2024.7.21",
    likes: 345,
    views: 2345,
    category: "城市"
  },
  {
    id: "32",
    title: "无问西东",
    image: getImageUrl("/images/摄影师/Flyverse/城市/EH0A8980-已增强-2.jpg"),
    photographer: photographers[2],
    camera: "Canon EOS R6 Mark II",
    date: "2023.7.20",
    likes: 456,
    views: 3456,
    category: "城市"
  },
  {
    id: "33",
    title: "城市风光",
    image: getImageUrl("/images/摄影师/Flyverse/城市/DSC00577.jpg"),
    photographer: photographers[2],
    camera: "Sony Alpha 7 IV",
    date: "2024.2.18",
    likes: 523,
    views: 3456,
    category: "城市"
  },

  // TP的作品
  {
    id: "34",
    title: "TP的宫殿",
    image: getImageUrl("/images/摄影师/TP/建筑/微信图片_20240802183337.jpg"),
    photographer: photographers[3],
    camera: "Nikon Z9",
    date: "2024.8.2",
    likes: 345,
    views: 2890,
    category: "建筑"
  },
  {
    id: "35",
    title: "永恒与一日",
    image: getImageUrl("/images/摄影师/TP/自然/000003920036-已增强-SR.jpg"),
    photographer: photographers[3],
    camera: "Nikon F2a",
    date: "2024.7.10",
    likes: 234,
    views: 1567,
    category: "自然"
  },
  {
    id: "36",
    title: "人像摄影",
    image: getImageUrl("/images/摄影师/TP/人物/IMGL6735.JPG"),
    photographer: photographers[3],
    camera: "Canon EOS 5D Mark IV",
    date: "2024.6.15",
    likes: 298,
    views: 1876,
    category: "人物"
  },
  {
    id: "37",
    title: "创意摄影",
    image: getImageUrl("/images/摄影师/TP/未分类/2358720_153.jpg"),
    photographer: photographers[3],
    camera: "Sony Alpha 7R V",
    date: "2024.4.18",
    likes: 356,
    views: 2198,
    category: "未分类"
  },
  {
    id: "38",
    title: "摄影师肖像",
    image: getImageUrl("/images/摄影师/TP/人物/微信图片_20240802195946.jpg"),
    photographer: photographers[3],
    camera: "Canon EOS 5D Mark IV",
    date: "2024.6.28",
    likes: 312,
    views: 2098,
    category: "人物"
  },
  {
    id: "39",
    title: "自然风光",
    image: getImageUrl("/images/摄影师/TP/自然/_H4A8661-已增强-降噪.jpg"),
    photographer: photographers[3],
    camera: "Canon EOS R6 Mark II",
    date: "2024.5.12",
    likes: 378,
    views: 2456,
    category: "自然"
  },
  {
    id: "40",
    title: "创意作品",
    image: getImageUrl("/images/摄影师/TP/未分类/微信图片_20250729113923_230.jpg"),
    photographer: photographers[3],
    camera: "Fujifilm X-T5",
    date: "2024.4.12",
    likes: 389,
    views: 2456,
    category: "未分类"
  },

  // 戴小岐的作品
  {
    id: "41",
    title: "厦门日出",
    image: getImageUrl("/images/摄影师/戴小岐/自然/微信图片_20240802121525.jpg"),
    photographer: photographers[4],
    camera: "Canon EOS 850D",
    date: "2024.7.15",
    likes: 189,
    views: 1234,
    category: "自然"
  },
  {
    id: "42",
    title: "城市印象",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250728131142_18.jpg"),
    photographer: photographers[4],
    camera: "Nikon Z9",
    date: "2024.7.8",
    likes: 523,
    views: 3421,
    category: "城市"
  },
  {
    id: "43",
    title: "夏日午后",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250729112202_238.jpg"),
    photographer: photographers[4],
    camera: "Canon EOS R6 Mark II",
    date: "2024.6.30",
    likes: 445,
    views: 2987,
    category: "城市"
  },
  {
    id: "44",
    title: "城市建筑",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250728131142_19.jpg"),
    photographer: photographers[4],
    camera: "Sony Alpha 7R V",
    date: "2024.7.5",
    likes: 456,
    views: 3234,
    category: "城市"
  },
  {
    id: "45",
    title: "都市风光",
    image: getImageUrl("/images/摄影师/戴小岐/城市/微信图片_20250728131142_20.jpg"),
    photographer: photographers[4],
    camera: "Nikon Z9",
    date: "2024.7.23",
    likes: 198,
    views: 1456,
    category: "城市"
  },
  // 十八 sp 的作品
  {
    id: "46",
    title: "人物写真",
    image: getImageUrl("/images/摄影师/十八 sp/人物/微信图片_20250807124336_22.jpg"),
    photographer: photographers[5],
    camera: "Canon EOS R5",
    date: "2024.8.15",
    likes: 324,
    views: 2156,
    category: "人物"
  },
  {
    id: "47",
    title: "城市夜景",
    image: getImageUrl("/images/摄影师/十八 sp/城市/微信图片_20250728131142_18.jpg"),
    photographer: photographers[5],
    camera: "Sony Alpha 7R V",
    date: "2024.8.20",
    likes: 456,
    views: 3245,
    category: "城市"
  },
  {
    id: "48",
    title: "微距之美",
    image: getImageUrl("/images/摄影师/十八 sp/微距/微信图片_20250807124224_15.jpg"),
    photographer: photographers[5],
    camera: "Canon EOS R6 Mark II",
    date: "2024.8.25",
    likes: 278,
    views: 1876,
    category: "微距"
  },
  {
    id: "49",
    title: "自然风光",
    image: getImageUrl("/images/摄影师/十八 sp/自然/微信图片_20240802121525.jpg"),
    photographer: photographers[5],
    camera: "Nikon Z9",
    date: "2024.9.1",
    likes: 567,
    views: 4123,
    category: "自然"
  },
  {
    id: "50",
    title: "生活记录",
    image: getImageUrl("/images/摄影师/十八 sp/记录/微信图片_20250807124319_24.jpg"),
    photographer: photographers[5],
    camera: "Fujifilm X-T5",
    date: "2024.9.5",
    likes: 189,
    views: 1234,
    category: "记录"
  },
  {
    id: "51",
    title: "创意摄影",
    image: getImageUrl("/images/摄影师/十八 sp/未分类/微信图片_20250807124255_25.jpg"),
    photographer: photographers[5],
    camera: "Canon EOS R5",
    date: "2024.9.10",
    likes: 345,
    views: 2567,
    category: "其他"
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
export const getPhotoById = (id: string): PhotoData | undefined => {
  return photos.find(photo => photo.id === id);
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
export const getRecommendedPhotos = (currentPhotoId: string, limit: number = 6): PhotoData[] => {
  const currentPhoto = getPhotoById(currentPhotoId);
  if (!currentPhoto) return [];
  
  // 优先推荐同一摄影师的其他作品
  const samePhotographerPhotos = photos.filter(photo => 
    photo.photographer.id === currentPhoto.photographer.id && photo.id !== currentPhotoId
  );
  
  // 如果同一摄影师的作品不够，再推荐同类别的其他作品
  const sameCategoryPhotos = photos.filter(photo => 
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
  {
    id: "nikon-f2a",
    name: "Nikon F2a",
    brand: "Nikon",
    type: "胶片相机",
    image: getImageUrl("/images/equipment/nikon-f2a.jpg"),
    description: "经典的35mm胶片单反相机，以其坚固耐用和出色的光学性能而闻名。",
    specs: {
      "类型": "35mm胶片单反",
      "镜头卡口": "Nikon F卡口",
      "快门速度": "1/2000s - 1s",
      "测光系统": "TTL测光",
      "重量": "730g"
    },
    price: "¥2,500 - ¥4,000",
    rating: 4.8,
    reviews: 156
  },
  {
    id: "canon-eos-5d-mark-iv",
    name: "Canon EOS 5D Mark IV",
    brand: "Canon",
    type: "数码单反",
    image: getImageUrl("/images/equipment/canon-5d-mark-iv.jpg"),
    description: "专业级全画幅数码单反相机，拥有3040万像素和出色的低光性能。",
    specs: {
      "传感器": "全画幅CMOS",
      "像素": "3040万",
      "ISO范围": "100-32000",
      "连拍速度": "7fps",
      "重量": "890g"
    },
    price: "¥18,000 - ¥22,000",
    rating: 4.7,
    reviews: 234
  },
  {
    id: "sony-alpha-7r-v",
    name: "Sony Alpha 7R V",
    brand: "Sony",
    type: "无反相机",
    image: getImageUrl("/images/equipment/sony-a7r-v.jpg"),
    description: "高分辨率全画幅无反相机，配备6100万像素传感器和先进的AI对焦系统。",
    specs: {
      "传感器": "全画幅CMOS",
      "像素": "6100万",
      "ISO范围": "100-32000",
      "连拍速度": "10fps",
      "重量": "723g"
    },
    price: "¥26,000 - ¥30,000",
    rating: 4.9,
    reviews: 189
  },
  {
    id: "dji-air-2s",
    name: "DJI Air 2S",
    brand: "DJI",
    type: "无人机",
    image: getImageUrl("/images/equipment/dji-air-2s.jpg"),
    description: "专业航拍无人机，配备1英寸CMOS传感器，支持5.4K视频录制。",
    specs: {
      "传感器": "1英寸CMOS",
      "像素": "2000万",
      "视频": "5.4K/30fps",
      "飞行时间": "31分钟",
      "重量": "595g"
    },
    price: "¥6,500 - ¥8,000",
    rating: 4.6,
    reviews: 312
  },
  {
    id: "fujifilm-x-t5",
    name: "Fujifilm X-T5",
    brand: "Fujifilm",
    type: "无反相机",
    image: getImageUrl("/images/equipment/fujifilm-x-t5.jpg"),
    description: "APS-C画幅无反相机，以其出色的色彩表现和复古设计而著称。",
    specs: {
      "传感器": "APS-C CMOS",
      "像素": "4020万",
      "ISO范围": "125-12800",
      "连拍速度": "15fps",
      "重量": "557g"
    },
    price: "¥12,000 - ¥15,000",
    rating: 4.5,
    reviews: 167
  }
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
  { id: "uncategorized", name: "未分类", key: "未分类" }
];

// 根据摄影师获取照片
export const getPhotosByPhotographer = (photographerId: string): PhotoData[] => {
  return photos.filter(photo => photo.photographer.id === photographerId);
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