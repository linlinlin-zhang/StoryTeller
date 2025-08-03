import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoCard from "@/components/PhotoCard";
import { getPhotographerById, getPhotosByPhotographer } from "@/data/mockData";
import { MapPin, Calendar, Camera, Heart, Eye, Award, Users, MessageCircle } from "lucide-react";
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
    if (photographer) {
      let photographerPhotos = getPhotosByPhotographer(photographer.id);
      
      // 排序
      if (sortBy === "likes") {
        photographerPhotos = photographerPhotos.sort((a, b) => b.likes - a.likes);
      } else if (sortBy === "views") {
        photographerPhotos = photographerPhotos.sort((a, b) => b.views - a.views);
      } else {
        photographerPhotos = photographerPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      
      setPhotos(photographerPhotos);
    }
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
      
      <main className="container mx-auto px-4 py-8">
        {/* 摄影师头部信息 */}
        <div className="bg-white border border-black rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <img
              src={photographer.avatar}
              alt={photographer.name}
              className="w-32 h-32 rounded-full object-cover shadow-lg"
            />
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{photographer.name}</h1>
              <p className="text-gray-600 mb-4">{photographer.bio}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-1" />
                  <span>{photographer.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-1" />
                  <span>加入于 {photographer.joinDate}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Camera size={16} className="mr-1" />
                  <span>{photographer.specialties.join(', ')}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6 bg-white rounded-lg p-4">
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600">{photos.length}</div>
                  <div className="text-sm text-gray-600">作品</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-red-600">{totalLikes}</div>
                  <div className="text-sm text-gray-600">总点赞</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-green-600">{totalViews}</div>
                  <div className="text-sm text-gray-600">总浏览</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-purple-600">1.2K</div>
                  <div className="text-sm text-gray-600">粉丝</div>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? '已关注' : '关注'}
                </button>
                <button
                  onClick={handleContact}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  联系合作
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("works")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "works"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              作品集 ({photos.length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "about"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              关于我
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "achievements"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              成就
            </button>
          </nav>
        </div>

        {/* 标签页内容 */}
        {activeTab === "works" && (
          <div>
            {/* 排序选项 */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">作品集</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">按时间排序</option>
                <option value="likes">按点赞数排序</option>
                <option value="views">按浏览量排序</option>
              </select>
            </div>
            
            {/* 瀑布流作品展示 */}
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {photos.map(photo => (
                <div key={photo.id} className="break-inside-avoid mb-6">
                  <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onClick={() => window.open(`/photo/${photo.id}`, '_blank')}>
                    <img 
                      src={photo.image} 
                      alt={photo.title}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* 悬停时显示的信息覆盖层 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                      <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-lg font-semibold mb-2">{photo.title}</h3>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={photo.photographer.avatar} 
                            alt={photo.photographer.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm">{photo.photographer.name}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                          <span className="flex items-center space-x-1">
                            <Eye size={16} />
                            <span>{photo.views}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Heart size={16} className="fill-red-500 text-red-500" />
                            <span>{photo.likes}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {photos.length === 0 && (
              <div className="text-center py-12">
                <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">暂无作品</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold mb-6">关于我</h2>
            <div className="bg-white border border-black p-6 rounded-lg mb-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                {photographer.bio}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                我专注于{photographer.specialties.join('、')}摄影，致力于通过镜头捕捉生活中的美好瞬间。
                每一张照片都承载着独特的故事和情感，我希望通过我的作品能够触动观者的心灵。
              </p>
              <p className="text-gray-700 leading-relaxed">
                欢迎与我交流摄影心得，也期待有机会与您合作，共同创作出更多精彩的作品。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-black p-6 rounded-lg">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Camera className="mr-2" size={20} />
                  拍摄设备
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Canon EOS R5</li>
                  <li>• Sony A7R IV</li>
                  <li>• Canon 24-70mm f/2.8L</li>
                  <li>• Sony 85mm f/1.4 GM</li>
                </ul>
              </div>
              
              <div className="bg-white border border-black p-6 rounded-lg">
                <h3 className="font-semibold mb-4 flex items-center">
                  <MapPin className="mr-2" size={20} />
                  拍摄足迹
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 北京 - 故宫、长城</li>
                  <li>• 上海 - 外滩、陆家嘴</li>
                  <li>• 杭州 - 西湖、灵隐寺</li>
                  <li>• 成都 - 宽窄巷子、熊猫基地</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold mb-6">成就与荣誉</h2>
            
            <div className="space-y-6">
              <div className="bg-white border border-black p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Award className="text-yellow-600 mr-3" size={24} />
                  <h3 className="text-lg font-semibold">2024年度最佳{photographer.specialties[0]}摄影师</h3>
                </div>
                <p className="text-gray-700">在全国摄影大赛中获得{photographer.specialties[0]}类别金奖</p>
              </div>
              
              <div className="bg-white border border-black p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Users className="text-blue-600 mr-3" size={24} />
                  <h3 className="text-lg font-semibold">社区贡献奖</h3>
                </div>
                <p className="text-gray-700">积极参与摄影社区建设，分享摄影技巧，帮助新手成长</p>
              </div>
              
              <div className="bg-white border border-black p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Heart className="text-green-600 mr-3" size={24} />
                  <h3 className="text-lg font-semibold">人气摄影师</h3>
                </div>
                <p className="text-gray-700">作品总点赞数超过{totalLikes}，深受摄影爱好者喜爱</p>
              </div>
              
              <div className="bg-white border border-black p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Eye className="text-purple-600 mr-3" size={24} />
                  <h3 className="text-lg font-semibold">影响力摄影师</h3>
                </div>
                <p className="text-gray-700">作品总浏览量超过{totalViews}，影响力持续扩大</p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}