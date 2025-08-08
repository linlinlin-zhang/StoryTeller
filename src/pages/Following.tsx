import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Eye, Camera, MapPin, Calendar, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/utils/imageHelper";

interface FollowedPhotographer {
  id: string;
  name: string;
  avatar: string;
  location: string;
  specialty: string;
  followers: number;
  photos: number;
  joinDate: string;
  latestWork: {
    id: string;
    title: string;
    image: string;
    likes: number;
    views: number;
  }[];
}

interface FollowedPhoto {
  id: string;
  title: string;
  image: string;
  photographer: string;
  photographerId: string;
  likes: number;
  views: number;
  uploadDate: string;
  category: string;
}

const followedPhotographers: FollowedPhotographer[] = [
  {
    id: "zsl",
    name: "长雨林",
    avatar: getImageUrl("/images/头像/长雨林.png"),
    location: "广州",
    specialty: "风光摄影",
    followers: 2340,
    photos: 156,
    joinDate: "2023-03",
    latestWork: [
      {
        id: "1",
        title: "永恒与一日",
        image: getImageUrl("/images/摄影师/长雨林/自然/000000490034-已增强-SR.jpg"),
        likes: 234,
        views: 1567
      }
    ]
  },
  {
    id: "zym",
    name: "LTDSA",
    avatar: getImageUrl("/images/头像/LTDSA.jpg"),
    location: "深圳",
    specialty: "航拍摄影",
    followers: 1890,
    photos: 89,
    joinDate: "2023-05",
    latestWork: [
      {
        id: "4",
        title: "山的尽头是海",
        image: getImageUrl("/images/摄影师/LTDSA/自然/微信图片_20240802132116.jpg"),
        likes: 345,
        views: 2134
      }
    ]
  },
  {
    id: "cfy",
    name: "Flyverse",
    avatar: getImageUrl("/images/头像/Flyverse.jpg"),
    location: "北京",
    specialty: "人像摄影",
    followers: 3120,
    photos: 234,
    joinDate: "2022-11",
    latestWork: [
      {
        id: "7",
        title: "我怀念的",
        image: getImageUrl("/images/摄影师/Flyverse/自然/微信图片_20240802134101.jpg"),
        likes: 412,
        views: 2890
      }
    ]
  },
  {
    id: "lqr",
    name: "Tp",
    avatar: getImageUrl("/images/头像/Tp.jpg"),
    location: "上海",
    specialty: "建筑摄影",
    followers: 1456,
    photos: 67,
    joinDate: "2023-08",
    latestWork: [
      {
        id: "10",
        title: "上海印象",
        image: getImageUrl("/images/摄影师/TP/建筑/微信图片_20240802183337.jpg"),
        likes: 178,
        views: 1023
      }
    ]
  },
  {
    id: "dq",
    name: "戴小岐",
    avatar: getImageUrl("/images/头像/戴小岐.jpg"),
    location: "厦门",
    specialty: "风光摄影",
    followers: 2890,
    photos: 123,
    joinDate: "2023-01",
    latestWork: [
      {
        id: "13",
        title: "厦门日出",
        image: getImageUrl("/images/摄影师/戴小岐/自然/微信图片_20240802121525.jpg"),
        likes: 289,
        views: 1678
      }
    ]
  },
  {
    id: "photographer6",
    name: "陈摄影",
    avatar: getImageUrl("/images/摄影师/长雨林/记录/微信图片_20240802205538.jpg"),
    location: "广州",
    specialty: "夜景摄影",
    followers: 1567,
    photos: 98,
    joinDate: "2023-06",
    latestWork: [
      {
        id: "16",
        title: "广州夜色",
        image: getImageUrl("/images/摄影师/长雨林/记录/微信图片_20240802205538.jpg"),
        likes: 198,
        views: 1234
      }
    ]
  },
  {
    id: "photographer7",
    name: "李风光",
    avatar: getImageUrl("/images/摄影师/长雨林/建筑/4733 (12).jpg"),
    location: "佛山",
    specialty: "古建筑摄影",
    followers: 1234,
    photos: 76,
    joinDate: "2023-09",
    latestWork: [
      {
        id: "17",
        title: "古韵佛山",
        image: getImageUrl("/images/摄影师/长雨林/建筑/4733 (12).jpg"),
        likes: 167,
        views: 987
      }
    ]
  },
  {
    id: "photographer8",
    name: "王都市",
    avatar: getImageUrl("/images/摄影师/长雨林/城市/DSC02247.jpg"),
    location: "深圳",
    specialty: "都市摄影",
    followers: 2100,
    photos: 145,
    joinDate: "2023-04",
    latestWork: [
      {
        id: "18",
        title: "深圳天际线",
        image: getImageUrl("/images/摄影师/长雨林/城市/DSC02247.jpg"),
        likes: 256,
        views: 1456
      }
    ]
  }
];

const recentPhotos: FollowedPhoto[] = [
  {
    id: "1",
    title: "晨光初现",
    image: getImageUrl("/images/摄影师/长雨林/建筑/000000490004-已增强-SR.jpg"),
    photographer: "长雨林",
    photographerId: "zsl",
    likes: 89,
    views: 456,
    uploadDate: "2024-01-15",
    category: "自然"
  },
  {
    id: "2",
    title: "城市夜景",
    image: getImageUrl("/images/摄影师/长雨林/未分类/000000490008-已增强-SR.jpg"),
    photographer: "LTDSA",
    photographerId: "zym",
    likes: 134,
    views: 678,
    uploadDate: "2024-01-14",
    category: "城市"
  },
  {
    id: "3",
    title: "建筑之美",
    image: getImageUrl("/images/摄影师/长雨林/记录/000000490010-已增强-SR.jpg"),
    photographer: "Flyverse",
    photographerId: "cfy",
    likes: 167,
    views: 823,
    uploadDate: "2024-01-13",
    category: "建筑"
  },
  {
    id: "4",
    title: "光影交错",
    image: getImageUrl("/images/摄影师/长雨林/城市/000000490030-已增强-SR.jpg"),
    photographer: "长雨林",
    photographerId: "zsl",
    likes: 98,
    views: 534,
    uploadDate: "2024-01-12",
    category: "人物"
  },
  {
    id: "5",
    title: "自然之韵",
    image: getImageUrl("/images/摄影师/长雨林/城市/000000490032-已增强-SR.jpg"),
    photographer: "LTDSA",
    photographerId: "zym",
    likes: 156,
    views: 789,
    uploadDate: "2024-01-11",
    category: "自然"
  },
  {
    id: "6",
    title: "都市印象",
    image: getImageUrl("/images/摄影师/长雨林/自然/000000490034-已增强-SR.jpg"),
    photographer: "Flyverse",
    photographerId: "cfy",
    likes: 203,
    views: 945,
    uploadDate: "2024-01-10",
    category: "城市"
  },
  {
    id: "7",
    title: "海边日落",
    image: getImageUrl("/images/微信图片_20240802132116.jpg"),
    photographer: "Tp",
    photographerId: "lqr",
    likes: 178,
    views: 892,
    uploadDate: "2024-01-09",
    category: "自然"
  },
  {
    id: "8",
    title: "古建筑韵味",
    image: getImageUrl("/images/4733 (12).jpg"),
    photographer: "戴小岐",
    photographerId: "dq",
    likes: 145,
    views: 723,
    uploadDate: "2024-01-08",
    category: "建筑"
  },
  {
    id: "9",
    title: "夜色璀璨",
    image: getImageUrl("/images/微信图片_20240802205538.jpg"),
    photographer: "陈摄影",
    photographerId: "photographer6",
    likes: 234,
    views: 1156,
    uploadDate: "2024-01-07",
    category: "城市"
  },
  {
    id: "10",
    title: "山水如画",
    image: getImageUrl("/images/微信图片_20240802134101.jpg"),
    photographer: "李风光",
    photographerId: "photographer7",
    likes: 189,
    views: 967,
    uploadDate: "2024-01-06",
    category: "自然"
  },
  {
    id: "11",
    title: "都市天际线",
    image: getImageUrl("/images/DSC02247.jpg"),
    photographer: "王都市",
    photographerId: "photographer8",
    likes: 267,
    views: 1345,
    uploadDate: "2024-01-05",
    category: "城市"
  },
  {
    id: "12",
    title: "晨雾缭绕",
    image: getImageUrl("/images/000003920036-已增强-SR.jpg"),
    photographer: "长雨林",
    photographerId: "zsl",
    likes: 198,
    views: 876,
    uploadDate: "2024-01-04",
    category: "自然"
  }
];

export default function Following() {
  const [activeTab, setActiveTab] = useState<"photographers" | "photos">("photos");
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const [displayedPhotographers, setDisplayedPhotographers] = useState<FollowedPhotographer[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<FollowedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMorePhotographers, setHasMorePhotographers] = useState(true);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);
  const [scrollCount, setScrollCount] = useState(0);
  const ITEMS_PER_LOAD = 2;
  const PHOTOS_PER_LOAD = 3;

  // 初始化数据
  useEffect(() => {
    setDisplayedPhotographers(followedPhotographers.slice(0, ITEMS_PER_LOAD));
    setDisplayedPhotos(recentPhotos.slice(0, PHOTOS_PER_LOAD));
    setHasMorePhotographers(followedPhotographers.length > ITEMS_PER_LOAD);
    setHasMorePhotos(recentPhotos.length > PHOTOS_PER_LOAD);
  }, []);

  // 滚动加载更多
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) {
      return;
    }

    if (activeTab === "photographers" && hasMorePhotographers && !isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        const currentLength = displayedPhotographers.length;
        const newPhotographers = followedPhotographers.slice(currentLength, currentLength + ITEMS_PER_LOAD);
        setDisplayedPhotographers(prev => [...prev, ...newPhotographers]);
        setHasMorePhotographers(currentLength + ITEMS_PER_LOAD < followedPhotographers.length);
        setIsLoading(false);
      }, 800);
    } else if (activeTab === "photos" && hasMorePhotos && !isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        const currentLength = displayedPhotos.length;
        const newPhotos = recentPhotos.slice(currentLength, currentLength + PHOTOS_PER_LOAD);
        setDisplayedPhotos(prev => [...prev, ...newPhotos]);
        setHasMorePhotos(currentLength + PHOTOS_PER_LOAD < recentPhotos.length);
        setIsLoading(false);
      }, 800);
    }
  }, [activeTab, hasMorePhotographers, hasMorePhotos, isLoading, displayedPhotographers.length, displayedPhotos.length]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 切换标签时重置数据
  const handleTabChange = (tab: "photographers" | "photos") => {
    setActiveTab(tab);
    if (tab === "photographers") {
      setDisplayedPhotographers(followedPhotographers.slice(0, ITEMS_PER_LOAD));
      setHasMorePhotographers(followedPhotographers.length > ITEMS_PER_LOAD);
    } else {
      setDisplayedPhotos(recentPhotos.slice(0, PHOTOS_PER_LOAD));
      setHasMorePhotos(recentPhotos.length > PHOTOS_PER_LOAD);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">我的关注</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            关注你喜欢的摄影师，第一时间获取他们的最新作品
          </p>
        </div>

        {/* 标签切换 */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleTabChange("photos")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "photos"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              最新作品
            </button>
            <button
              onClick={() => handleTabChange("photographers")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "photographers"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              关注的摄影师
            </button>
          </div>
        </div>

        {/* 最新作品 */}
        {activeTab === "photos" && (
          <>
            <div className="max-w-4xl mx-auto space-y-6">
              {displayedPhotos.map(photo => (
                <div key={photo.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                  {/* 摄影师信息头部 */}
                  <div className="flex items-center justify-between mb-4">
                    <Link 
                      to={`/photographer/${photo.photographerId}`}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={followedPhotographers.find(p => p.id === photo.photographerId)?.avatar || "/images/default-avatar.jpg"}
                        alt={photo.photographer}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{photo.photographer}</h3>
                        <p className="text-sm text-gray-600">{photo.uploadDate}</p>
                      </div>
                    </Link>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {photo.category}
                    </span>
                  </div>
                  
                  {/* 照片展示区域 - 保持原始比例 */}
                  <div className="mb-4 p-3 border border-gray-200 rounded-lg">
                    <div 
                      className="relative cursor-pointer group"
                      onMouseEnter={() => setHoveredPhoto(photo.id)}
                      onMouseLeave={() => setHoveredPhoto(null)}
                      onClick={() => window.open(`/photo/${photo.id}`, '_blank')}
                    >
                      <img
                        src={photo.image}
                        alt={photo.title}
                        className="w-full h-auto max-h-[80vh] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      {hoveredPhoto === photo.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg transition-opacity duration-300">
                          <div className="text-white text-center">
                            <div className="flex items-center justify-center space-x-6 mb-4">
                              <div className="flex items-center space-x-2">
                                <Eye size={18} />
                                <span className="text-lg">{photo.views}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Heart size={18} className="fill-red-500 text-red-500" />
                                <span className="text-lg">{photo.likes}</span>
                              </div>
                            </div>
                            <Link
                              to={`/photo/${photo.id}`}
                              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              查看详情
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 照片信息底部 */}
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{photo.title}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye size={14} />
                          <span>{photo.views} 次观看</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart size={14} className="fill-red-500 text-red-500" />
                          <span>{photo.likes} 次点赞</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <p className="text-gray-600">加载中...</p>
              </div>
            )}
            
            {/* 没有更多内容提示 */}
            {!hasMorePhotos && displayedPhotos.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                已显示全部作品
              </div>
            )}
          </>
        )}

        {/* 关注的摄影师 */}
        {activeTab === "photographers" && (
          <>
            <div className="max-w-4xl mx-auto space-y-6">
              {displayedPhotographers.map(photographer => (
                <div key={photographer.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                  {/* 摄影师信息头部 */}
                  <div className="flex items-center justify-between mb-4">
                    <Link 
                      to={`/photographer/${photographer.id}`}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={photographer.avatar}
                        alt={photographer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{photographer.name}</h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <MapPin size={12} />
                            <span>{photographer.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Camera size={12} />
                            <span>{photographer.specialty}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      已关注
                    </button>
                  </div>
                  
                  {/* 照片展示区域 - 保持原始比例 */}
                  <div className="mb-4 p-3 border border-gray-200 rounded-lg">
                    <div className="relative cursor-pointer group">
                      <img
                        src={photographer.latestWork[0].image}
                        alt={photographer.latestWork[0].title}
                        className="w-full h-auto max-h-[80vh] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                        onClick={() => window.open(`/photo/${photographer.latestWork[0].id}`, '_blank')}
                      />
                    </div>
                  </div>
                  
                  {/* 照片信息底部 */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {photographer.latestWork[0].title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{photographer.followers} 关注者</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Camera size={14} />
                            <span>{photographer.photos} 作品</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Heart size={16} className="fill-red-500 text-red-500" />
                          <span>{photographer.latestWork[0].likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye size={16} />
                          <span>{photographer.latestWork[0].views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <p className="text-gray-600">加载中...</p>
              </div>
            )}
            
            {/* 没有更多内容提示 */}
            {!hasMorePhotographers && displayedPhotographers.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                已显示全部摄影师
              </div>
            )}
          </>
        )}

        {/* 空状态 */}
        {((activeTab === "photos" && displayedPhotos.length === 0) || 
          (activeTab === "photographers" && displayedPhotographers.length === 0)) && (
          <div className="text-center py-12">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {activeTab === "photos" ? "暂无最新作品" : "还没有关注任何摄影师"}
            </p>
            <Link
              to="/gallery"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              去发现优秀摄影师
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}