import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Camera, Aperture, Timer, Zap, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface Equipment {
  id: string;
  name: string;
  brand: string;
  type: string;
  image: string;
  description: string;
  specs: {
    [key: string]: string;
  };
  rating: number;
  views: number;
  price?: string;
}

const equipmentData: Equipment[] = [
  {
    id: "nikon-f2a",
    name: "Nikon F2a",
    brand: "Nikon",
    type: "胶片相机",
    image: "/images/微信图片_20240617163026.jpg",
    description: "经典的35mm单反相机，以其坚固耐用和出色的光学性能而闻名。",
    specs: {
      "类型": "35mm单反相机",
      "镜头卡口": "Nikon F卡口",
      "快门速度": "1-1/2000秒",
      "测光系统": "TTL测光",
      "重量": "730g"
    },
    rating: 4.8,
    views: 1250
  },
  {
    id: "canon-eos-5d-mark-iv",
    name: "Canon EOS 5D Mark IV",
    brand: "Canon",
    type: "数码单反",
    image: "/images/微信图片_20240802134101.jpg",
    description: "专业级全画幅数码单反相机，拥有3040万像素和出色的低光性能。",
    specs: {
      "传感器": "全画幅CMOS",
      "像素": "3040万",
      "ISO范围": "100-32000",
      "连拍速度": "7fps",
      "重量": "890g"
    },
    rating: 4.9,
    views: 2100
  },
  {
    id: "sony-alpha-7-iv",
    name: "Sony Alpha 7 IV",
    brand: "Sony",
    type: "无反相机",
    image: "/images/DSC00947 (2).jpg",
    description: "先进的全画幅无反相机，具备优秀的视频拍摄能力和图像稳定系统。",
    specs: {
      "传感器": "全画幅CMOS",
      "像素": "3300万",
      "ISO范围": "100-51200",
      "视频": "4K 60p",
      "重量": "658g"
    },
    rating: 4.7,
    views: 1800
  },
  {
    id: "dji-air-2s",
    name: "DJI Air 2S",
    brand: "DJI",
    type: "无人机",
    image: "/images/微信图片_20240802132116.jpg",
    description: "专业航拍无人机，搭载1英寸传感器，支持5.4K视频录制。",
    specs: {
      "传感器": "1英寸CMOS",
      "像素": "2000万",
      "视频": "5.4K 30fps",
      "飞行时间": "31分钟",
      "重量": "595g"
    },
    rating: 4.6,
    views: 950
  },
  {
    id: "canon-eos-r6-mark-ii",
    name: "Canon EOS R6 Mark II",
    brand: "Canon",
    type: "无反相机",
    image: "/images/EH0A8980-已增强-2.jpg",
    description: "高性能全画幅无反相机，具备出色的连拍速度和视频性能。",
    specs: {
      "传感器": "全画幅CMOS",
      "像素": "2420万",
      "ISO范围": "100-102400",
      "连拍速度": "12fps",
      "重量": "670g"
    },
    rating: 4.8,
    views: 1650
  },
  {
    id: "nikon-z9",
    name: "Nikon Z9",
    brand: "Nikon",
    type: "无反相机",
    image: "/images/微信图片_20240802183337.jpg",
    description: "旗舰级全画幅无反相机，专为专业摄影师和摄像师设计。",
    specs: {
      "传感器": "全画幅CMOS",
      "像素": "4571万",
      "ISO范围": "64-25600",
      "连拍速度": "20fps",
      "重量": "1340g"
    },
    rating: 4.9,
    views: 2300
  }
];

const categories = ["全部", "胶片相机", "数码单反", "无反相机", "无人机"];
const brands = ["全部", "Canon", "Nikon", "Sony", "DJI"];

export default function Equipment() {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedBrand, setSelectedBrand] = useState("全部");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const filteredEquipment = equipmentData.filter(item => {
    const categoryMatch = selectedCategory === "全部" || item.type === selectedCategory;
    const brandMatch = selectedBrand === "全部" || item.brand === selectedBrand;
    return categoryMatch && brandMatch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">摄影设备</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            探索专业摄影师使用的器材，了解每款设备的特点和规格
          </p>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">类型:</span>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">品牌:</span>
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedBrand === brand
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* 设备网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEquipment.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />
                {hoveredItem === item.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="flex items-center justify-center space-x-4 mb-2">
                        <div className="flex items-center space-x-1">
                          <Eye size={16} />
                          <span>{item.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star size={16} className="fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                        </div>
                      </div>
                      <Link
                        to={`/equipment/${item.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        查看详情
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {item.type}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                
                <div className="space-y-2">
                  {Object.entries(item.specs).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500">{key}:</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{item.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Eye size={16} />
                    <span className="text-sm">{item.views}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <Camera size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">没有找到符合条件的设备</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}