import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { photographers } from "@/data/mockData";
import { MapPin, Camera, Users, Calendar } from "lucide-react";

export default function PhotographerList() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">摄影师</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            发现才华横溢的摄影师，欣赏他们独特的视角和精湛的技艺
          </p>
          <div className="w-24 h-1 bg-blue-500 mx-auto mt-6"></div>
        </div>

        {/* 摄影师网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {photographers.map((photographer) => (
            <Link
              key={photographer.id}
              to={`/photographer/${photographer.id}`}
              className="block"
              onMouseEnter={() => setHoveredCard(photographer.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                hoveredCard === photographer.id ? 'transform -translate-y-2' : ''
              }`}>
                {/* 封面图片 */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={photographer.coverImage}
                    alt={`${photographer.name}的作品`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {/* 头像 */}
                  <div className="absolute bottom-4 left-4">
                    <img
                      src={photographer.avatar}
                      alt={photographer.name}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  </div>
                </div>

                {/* 摄影师信息 */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {photographer.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {photographer.bio}
                    </p>
                  </div>

                  {/* 专长标签 */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {photographer.specialties.slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Camera size={16} className="mr-2 text-blue-500" />
                      <span className="text-sm">
                        <span className="font-semibold text-gray-900">{photographer.works}</span> 作品
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users size={16} className="mr-2 text-blue-500" />
                      <span className="text-sm">
                        <span className="font-semibold text-gray-900">{photographer.followers}</span> 粉丝
                      </span>
                    </div>
                  </div>

                  {/* 地点和加入时间 */}
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2 text-blue-500" />
                      <span className="text-sm">{photographer.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2 text-blue-500" />
                      <span className="text-sm">加入于 {photographer.joinDate}</span>
                    </div>
                  </div>
                </div>

                {/* 悬停效果 */}
                <div className={`absolute inset-0 bg-blue-500/10 transition-opacity duration-300 ${
                  hoveredCard === photographer.id ? 'opacity-100' : 'opacity-0'
                }`}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="text-center mt-16">
          <p className="text-gray-500">
            想要成为我们的摄影师？
            <Link to="/contact" className="text-blue-600 hover:text-blue-800 ml-1 font-medium">
              联系我们
            </Link>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}