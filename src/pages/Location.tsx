import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Camera, Clock, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface LocationDetail {
  id: string;
  name: string;
  image: string;
  description: string;
  bestTime: string;
  difficulty: string;
  tips: string;
  photos: string[];
  rating: number;
  visitCount: number;
}

const hotLocations: LocationDetail[] = [
  {
    id: "changsha",
    name: "长沙",
    image: "/images/主页地点图/长沙.jpg",
    description: "湖南省会，历史文化名城，橘子洲头是著名的摄影地点。",
    bestTime: "春秋两季",
    difficulty: "简单",
    tips: "建议傍晚时分前往橘子洲头拍摄湘江夜景。",
    photos: ["/images/0689 (14)-已增强-SR.jpg", "/images/DSC02247.jpg"],
    rating: 4.8,
    visitCount: 1250
  },
  {
    id: "shenzhen",
    name: "深圳",
    image: "/images/主页地点图/深圳.jpg",
    description: "现代化都市，摩天大楼林立，是城市摄影的绝佳地点。",
    bestTime: "全年",
    difficulty: "中等",
    tips: "夜景拍摄效果最佳，建议使用三脚架。",
    photos: ["/images/DSC02247.jpg", "/images/微信图片_20240802132116.jpg"],
    rating: 4.7,
    visitCount: 980
  },
  {
    id: "foshan",
    name: "佛山",
    image: "/images/主页地点图/佛山.jpg",
    description: "岭南文化发源地，古建筑与现代建筑交相辉映。",
    bestTime: "春季",
    difficulty: "简单",
    tips: "古建筑群适合人文摄影，注意光线运用。",
    photos: ["/images/4733 (12).jpg", "/images/4733 (14).jpg"],
    rating: 4.6,
    visitCount: 756
  },
  {
    id: "beijing",
    name: "北京",
    image: "/images/主页地点图/北京.jpg",
    description: "首都北京，故宫、长城等世界文化遗产众多。",
    bestTime: "秋季",
    difficulty: "中等",
    tips: "故宫建议早上开门时前往，避开人流高峰。",
    photos: ["/images/微信图片_20240802143756.jpg", "/images/EH0A8980-已增强-2.jpg"],
    rating: 4.9,
    visitCount: 2100
  },
  {
    id: "guangzhou",
    name: "广州",
    image: "/images/主页地点图/广州.jpg",
    description: "千年商都，珠江夜景和现代建筑群是摄影热点。",
    bestTime: "冬春季",
    difficulty: "简单",
    tips: "珠江夜游时可拍摄两岸灯光倒影。",
    photos: ["/images/微信图片_20240802205538.jpg", "/images/微信图片_20240802194442.jpg"],
    rating: 4.7,
    visitCount: 1450
  },
  {
    id: "shanghai",
    name: "上海",
    image: "/images/主页地点图/上海.jpg",
    description: "国际大都市，外滩和陆家嘴是经典拍摄地。",
    bestTime: "全年",
    difficulty: "中等",
    tips: "外滩最佳拍摄时间是日落后的蓝调时刻。",
    photos: ["/images/微信图片_20240802183337.jpg", "/images/微信图片_20240802185144.jpg"],
    rating: 4.8,
    visitCount: 1890
  }
];

export default function Location() {
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">热门拍摄地点集锦</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            发现最受摄影师喜爱的拍摄地点，每个地方都有独特的魅力等待你去捕捉
          </p>
        </div>

        {/* 地点网格展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {hotLocations.map((location) => (
            <div 
              key={location.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedLocation(location)}
            >
              {/* 地点图片 */}
              <div className="relative overflow-hidden h-64">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {location.rating}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* 地点信息 */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{location.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Camera className="w-4 h-4 mr-1" />
                    {location.visitCount}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{location.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {location.bestTime}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    location.difficulty === '简单' ? 'bg-green-100 text-green-800' :
                    location.difficulty === '中等' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {location.difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 地点详情模态框 */}
        {selectedLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* 模态框头部 */}
              <div className="relative">
                <img
                  src={selectedLocation.image}
                  alt={selectedLocation.name}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  ×
                </button>
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedLocation.name}</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-1 fill-yellow-400 text-yellow-400" />
                      {selectedLocation.rating}
                    </div>
                    <div className="flex items-center">
                      <Camera className="w-5 h-5 mr-1" />
                      {selectedLocation.visitCount} 次访问
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 模态框内容 */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 基本信息 */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      地点信息
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">描述：</span>
                        <p className="text-gray-600 mt-1">{selectedLocation.description}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">最佳拍摄时间：</span>
                        <span className="text-gray-600 ml-2">{selectedLocation.bestTime}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">难度等级：</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          selectedLocation.difficulty === '简单' ? 'bg-green-100 text-green-800' :
                          selectedLocation.difficulty === '中等' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedLocation.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 拍摄技巧 */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Camera className="w-5 h-5 mr-2" />
                      拍摄技巧
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {selectedLocation.tips}
                    </p>
                  </div>
                </div>
                
                {/* 相关照片 */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">相关作品</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedLocation.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${selectedLocation.name} 作品 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="mt-8 flex justify-center space-x-4">
                  <Link
                    to={`/gallery?location=${selectedLocation.id}`}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    查看更多作品
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}