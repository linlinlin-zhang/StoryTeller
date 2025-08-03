import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Camera, Star, Eye, ArrowLeft, Heart, Share2 } from "lucide-react";
import { useState } from "react";

interface Equipment {
  id: string;
  name: string;
  brand: string;
  type: string;
  image: string;
  description: string;
  detailedDescription: string;
  specs: {
    [key: string]: string;
  };
  rating: number;
  views: number;
  price?: string;
  relatedPhotos: {
    id: string;
    title: string;
    image: string;
    photographer: string;
  }[];
}

const equipmentData: { [key: string]: Equipment } = {
  "nikon-f2a": {
    id: "nikon-f2a",
    name: "Nikon F2a",
    brand: "Nikon",
    type: "胶片相机",
    image: "/images/微信图片_20240617163026.jpg",
    description: "经典的35mm单反相机，以其坚固耐用和出色的光学性能而闻名。",
    detailedDescription: "Nikon F2a是Nikon F系列的经典之作，于1971年发布。这款相机以其坚固的机械结构和可靠性而著称，是许多专业摄影师的首选。F2a采用全机械快门，无需电池即可正常工作，只有测光系统需要电池支持。其坚固的五棱镜取景器提供明亮清晰的取景体验，而可更换的对焦屏则为不同拍摄需求提供了灵活性。",
    specs: {
      "类型": "35mm单反相机",
      "镜头卡口": "Nikon F卡口",
      "快门速度": "1-1/2000秒 + B门",
      "测光系统": "TTL中央重点测光",
      "取景器": "五棱镜，放大倍率0.8x",
      "对焦屏": "可更换式",
      "闪光同步": "1/80秒",
      "重量": "730g（机身）",
      "尺寸": "148 × 102 × 65mm",
      "电池": "1.35V汞电池（测光用）"
    },
    rating: 4.8,
    views: 1250,
    relatedPhotos: [
      {
        id: "1",
        title: "永恒与一日",
        image: "/images/000003920036-已增强-SR.jpg",
        photographer: "长雨林"
      },
      {
        id: "2",
        title: "因你们而火热",
        image: "/images/000003920008-已增强-SR.jpg",
        photographer: "长雨林"
      }
    ]
  },
  "canon-eos-5d-mark-iv": {
    id: "canon-eos-5d-mark-iv",
    name: "Canon EOS 5D Mark IV",
    brand: "Canon",
    type: "数码单反",
    image: "/images/微信图片_20240802134101.jpg",
    description: "专业级全画幅数码单反相机，拥有3040万像素和出色的低光性能。",
    detailedDescription: "Canon EOS 5D Mark IV是Canon在2016年推出的专业级全画幅数码单反相机。它搭载了3040万像素的全画幅CMOS传感器和DIGIC 6+图像处理器，提供出色的图像质量和高感光度性能。相机具备61点自动对焦系统，其中41个为十字型对焦点，确保快速准确的对焦。4K视频录制功能使其成为摄影师和摄像师的理想选择。",
    specs: {
      "传感器": "全画幅CMOS，36 × 24mm",
      "有效像素": "约3040万",
      "图像处理器": "DIGIC 6+",
      "ISO范围": "100-32000（可扩展至50-102400）",
      "自动对焦": "61点自动对焦系统",
      "连拍速度": "最高约7张/秒",
      "快门速度": "1/8000-30秒 + B门",
      "视频录制": "4K 30p / Full HD 60p",
      "LCD屏幕": "3.2英寸触摸屏，约162万点",
      "重量": "约890g（机身）"
    },
    rating: 4.9,
    views: 2100,
    relatedPhotos: [
      {
        id: "3",
        title: "我怀念的",
        image: "/images/微信图片_20240802134101.jpg",
        photographer: "Flyverse"
      },
      {
        id: "4",
        title: "太阳在坠落，海岸在发愁",
        image: "/images/微信图片_20240802145538.jpg",
        photographer: "LTDSA"
      }
    ]
  }
};

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(false);
  
  if (!id || !equipmentData[id]) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">设备未找到</h1>
          <Link to="/equipment" className="text-blue-600 hover:text-blue-700">
            返回设备列表
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const equipment = equipmentData[id];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            to="/equipment"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回设备列表</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 设备图片 */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={equipment.image}
                alt={equipment.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full transition-colors ${
                    isLiked ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:text-red-500"
                  }`}
                >
                  <Heart size={20} className={isLiked ? "fill-current" : ""} />
                </button>
                <button className="p-2 bg-white text-gray-600 hover:text-blue-500 rounded-full transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* 设备信息 */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
                <span className="text-lg text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {equipment.type}
                </span>
              </div>
              <p className="text-xl text-gray-600 mb-4">{equipment.brand}</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star size={20} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-medium">{equipment.rating}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Eye size={20} />
                  <span>{equipment.views} 次查看</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">产品描述</h2>
              <p className="text-gray-700 leading-relaxed">{equipment.detailedDescription}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">技术规格</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(equipment.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-600 font-medium">{key}</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 相关作品 */}
        {equipment.relatedPhotos.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              使用此设备拍摄的作品
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {equipment.relatedPhotos.map(photo => (
                <div key={photo.id} className="group">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                      <Link
                        to={`/photo/${photo.id}`}
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-100"
                      >
                        查看详情
                      </Link>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium text-gray-900">{photo.title}</h3>
                    <p className="text-sm text-gray-600">by {photo.photographer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}