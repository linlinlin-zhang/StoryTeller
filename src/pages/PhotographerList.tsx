import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { photographers } from "@/data/mockData";
import { MapPin, Camera } from "lucide-react";

export default function PhotographerList() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-8 py-16">
        {/* 页面标题 - 马格南风格 */}
        <div className="mb-20">
          <h1 className="text-5xl font-light text-black mb-8 tracking-wide">
            PHOTOGRAPHERS
          </h1>
          <div className="w-full h-px bg-black"></div>
        </div>

        {/* 摄影师网格 - 马格南风格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {photographers.map((photographer) => (
            <Link
              key={photographer.id}
              to={`/photographer/${photographer.id}`}
              className="group block"
              onMouseEnter={() => setHoveredCard(photographer.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="space-y-6">
                {/* 代表作品 */}
                <div className="relative overflow-hidden bg-gray-100">
                  <img
                    src={photographer.coverImage}
                    alt={`${photographer.name}的作品`}
                    className="w-full aspect-[4/5] object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    hoveredCard === photographer.id ? 'opacity-10' : 'opacity-0'
                  }`}></div>
                </div>

                {/* 摄影师头像 */}
                <div className="flex justify-center">
                  <img
                    src={photographer.avatar}
                    alt={photographer.name}
                    className="w-20 h-20 object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>

                {/* 摄影师信息 */}
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-light text-black tracking-wide uppercase">
                    {photographer.name}
                  </h3>
                  
                  <div className="flex items-center justify-center text-gray-600">
                    <MapPin size={14} className="mr-1" />
                    <span className="text-sm font-light">{photographer.location}</span>
                  </div>

                  <div className="flex items-center justify-center text-gray-600">
                    <Camera size={14} className="mr-1" />
                    <span className="text-sm font-light">{photographer.works} works</span>
                  </div>

                  {/* 专长 - 简化显示 */}
                  <div className="text-xs text-gray-500 font-light tracking-wider uppercase">
                    {photographer.specialties.slice(0, 2).join(' • ')}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 底部说明 - 马格南风格 */}
        <div className="text-center mt-24 pt-12 border-t border-gray-200">
          <p className="text-gray-600 font-light tracking-wide">
            BECOME A PHOTOGRAPHER
            <Link to="/contact" className="text-black hover:text-gray-600 ml-2 font-normal border-b border-black hover:border-gray-600 transition-colors">
              CONTACT US
            </Link>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}