import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoCard from "@/components/PhotoCard";
import { getPhotographerById, getEnhancedPhotosByPhotographer } from "@/data/mockData";
import { MapPin, Calendar, Camera, Heart, Eye, Award, Users } from "lucide-react";
import { toast } from "sonner";

export default function Photographer() {
  const { id } = useParams();
  const [photographer, setPhotographer] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("works");
  const [sortBy, setSortBy] = useState("date");

  // 当URL参数变化时重新获取摄影师数据
  useEffect(() => {
    const newPhotographer = getPhotographerById(id || "");
    setPhotographer(newPhotographer);
  }, [id]);

  useEffect(() => {
    const loadPhotographerPhotos = async () => {
      if (photographer) {
        try {
          let photographerPhotos = await getEnhancedPhotosByPhotographer(photographer.id);
          
          // 排序
          if (sortBy === "likes") {
            photographerPhotos = photographerPhotos.sort((a, b) => b.likes - a.likes);
          } else if (sortBy === "views") {
            photographerPhotos = photographerPhotos.sort((a, b) => b.views - a.views);
          } else {
            photographerPhotos = photographerPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          }
          
          setPhotos(photographerPhotos);
        } catch (error) {
          console.error('获取摄影师照片失败:', error);
          setPhotos([]);
        }
      }
    };
    
    loadPhotographerPhotos();
  }, [photographer, sortBy]);

  if (!photographer) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-600">摄影师不存在</h1>
          <Link to="/gallery" className="text-blue-600 hover:underline mt-4 inline-block">
            返回作品展示
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "取消关注" : "关注成功");
  };

  const handleContact = () => {
    toast.info("联系功能需要登录");
  };

  const totalLikes = photos.reduce((sum, photo) => sum + photo.likes, 0);
  const totalViews = photos.reduce((sum, photo) => sum + photo.views, 0);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-8 py-16">
        {/* 摄影师头部 - 马格南风格 */}
        <div className="mb-20">
          {/* 大幅头像 */}
          <div className="flex justify-center mb-12">
            <img
              src={photographer.avatar}
              alt={photographer.name}
              className="w-64 h-64 object-cover"
            />
          </div>
          
          {/* 摄影师信息 */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-light text-black tracking-wider uppercase">
              {photographer.name}
            </h1>
            
            <div className="flex items-center justify-center space-x-8 text-gray-600">
              <div className="flex items-center">
                <MapPin size={16} className="mr-2" />
                <span className="font-light">{photographer.location}</span>
              </div>
              <div className="flex items-center">
                <Camera size={16} className="mr-2" />
                <span className="font-light">{photographer.specialties.slice(0, 2).join(' • ')}</span>
              </div>
            </div>
            
            {/* 统计信息 - 简化 */}
            <div className="flex justify-center space-x-12 py-8 border-t border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-light text-black">{photos.length}</div>
                <div className="text-sm text-gray-500 font-light tracking-wider uppercase">Works</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-black">{totalLikes}</div>
                <div className="text-sm text-gray-500 font-light tracking-wider uppercase">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-black">{totalViews}</div>
                <div className="text-sm text-gray-500 font-light tracking-wider uppercase">Views</div>
              </div>
            </div>
            
            {/* 操作按钮 - 简化 */}
            <div className="flex justify-center space-x-6 pt-6">
              <button
                onClick={handleFollow}
                className={`px-8 py-3 font-light tracking-wider uppercase transition-colors ${
                  isFollowing 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'border border-black text-black hover:bg-black hover:text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={handleContact}
                className="px-8 py-3 border border-black text-black hover:bg-black hover:text-white font-light tracking-wider uppercase transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* 标签页导航 - 马格南风格 */}
        <div className="border-b border-black mb-16">
          <nav className="flex justify-center space-x-16">
            <button
              onClick={() => setActiveTab("works")}
              className={`py-4 font-light tracking-wider uppercase text-sm transition-colors ${
                activeTab === "works"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Works ({photos.length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 font-light tracking-wider uppercase text-sm transition-colors ${
                activeTab === "about"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`py-4 font-light tracking-wider uppercase text-sm transition-colors ${
                activeTab === "achievements"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Awards
            </button>
          </nav>
        </div>

        {/* 标签页内容 */}
        {activeTab === "works" && (
          <div>
            {/* 排序选项 - 简化 */}
            <div className="flex justify-center mb-12">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3 border border-black bg-white font-light tracking-wider uppercase text-sm focus:outline-none"
              >
                <option value="date">Latest</option>
                <option value="likes">Most Liked</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
            
            {/* 瀑布流作品展示 - 马格南风格 */}
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8">
              {photos.map(photo => (
                <div key={photo.id} className="break-inside-avoid mb-8">
                  <div className="group cursor-pointer"
                        onClick={() => window.open(`/photo/${photo.id}`, '_blank')}>
                    <img 
                      src={photo.image} 
                      alt={photo.title}
                      className="w-full h-auto object-contain transition-all duration-500"
                      loading="lazy"
                    />
                    {/* 简化的信息显示 */}
                    <div className="mt-4 text-center">
                      <h3 className="text-sm font-light text-black tracking-wide uppercase mb-2">{photo.title}</h3>
                      <div className="flex justify-center space-x-4 text-xs text-gray-500 font-light">
                        <span className="flex items-center space-x-1">
                          <Eye size={12} />
                          <span>{photo.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart size={12} />
                          <span>{photo.likes}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {photos.length === 0 && (
              <div className="text-center py-20">
                <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 font-light tracking-wider uppercase">No Works</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-lg font-light text-gray-700 leading-relaxed mb-8">
                {photographer.bio}
              </p>
              <div className="w-24 h-px bg-black mx-auto mb-8"></div>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Specializing in {photographer.specialties.join(' and ')} photography, I am dedicated to capturing the beauty of life through my lens.
                Each photograph carries a unique story and emotion, and I hope my work can touch the hearts of viewers.
              </p>
              <p className="text-gray-600 font-light leading-relaxed">
                Welcome to exchange photography insights with me, and I look forward to collaborating with you to create more wonderful works.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="text-center">
                <h3 className="font-light tracking-wider uppercase text-black mb-8 text-lg">
                  Equipment
                </h3>
                <ul className="space-y-3 text-gray-600 font-light">
                  <li>Canon EOS R5</li>
                  <li>Sony A7R IV</li>
                  <li>Canon 24-70mm f/2.8L</li>
                  <li>Sony 85mm f/1.4 GM</li>
                </ul>
              </div>
              
              <div className="text-center">
                <h3 className="font-light tracking-wider uppercase text-black mb-8 text-lg">
                  Locations
                </h3>
                <ul className="space-y-3 text-gray-600 font-light">
                  <li>Beijing - Forbidden City, Great Wall</li>
                  <li>Shanghai - The Bund, Lujiazui</li>
                  <li>Hangzhou - West Lake, Lingyin Temple</li>
                  <li>Chengdu - Kuanzhai Alley, Panda Base</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="text-center border-b border-gray-200 pb-8">
                <h3 className="text-lg font-light tracking-wider uppercase text-black mb-4">
                  2024 Best {photographer.specialties[0]} Photographer
                </h3>
                <p className="text-gray-600 font-light">Gold Award in National Photography Competition</p>
              </div>
              
              <div className="text-center border-b border-gray-200 pb-8">
                <h3 className="text-lg font-light tracking-wider uppercase text-black mb-4">
                  Community Contributor
                </h3>
                <p className="text-gray-600 font-light">Active participation in photography community building and mentoring</p>
              </div>
              
              <div className="text-center border-b border-gray-200 pb-8">
                <h3 className="text-lg font-light tracking-wider uppercase text-black mb-4">
                  Popular Photographer
                </h3>
                <p className="text-gray-600 font-light">Over {totalLikes} total likes, beloved by photography enthusiasts</p>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-light tracking-wider uppercase text-black mb-4">
                  Influential Artist
                </h3>
                <p className="text-gray-600 font-light">Over {totalViews} total views, expanding influence continuously</p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}