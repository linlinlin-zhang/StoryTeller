import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoCard from "@/components/PhotoCard";
import { 
  categories, 
  photographers, 
  getEnhancedPhotos,
  searchEnhancedPhotos,
  getEnhancedPhotosByCategory,
  getCategoryStats
} from "@/data/mockData";
import { PhotoData } from "@/components/PhotoCard";
import { Search, Filter, Loader2 } from "lucide-react";

export default function Gallery() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPhotographer, setSelectedPhotographer] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [displayedPhotos, setDisplayedPhotos] = useState<PhotoData[]>([]);
  const [allPhotos, setAllPhotos] = useState<PhotoData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [scrollCount, setScrollCount] = useState(0);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const PHOTOS_PER_PAGE = 12;
  const SCROLL_THRESHOLD = 3;

  // 初始化数据加载
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        const [photosData, statsData] = await Promise.all([
          getEnhancedPhotos(),
          getCategoryStats()
        ]);
        setAllPhotos(photosData);
        setCategoryStats(statsData);
        console.log('📊 Gallery数据加载完成:', {
          照片总数: photosData.length,
          分类统计: statsData
        });
      } catch (error) {
        console.error('Gallery数据加载失败:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // 处理URL查询参数
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const categoryId = categories.find(cat => cat.key === categoryParam)?.id;
      if (categoryId) {
        setSelectedCategory(categoryId);
      }
    } else if (category) {
      setSelectedCategory(category);
    }
  }, [category, searchParams]);

  // 图片方向检测
  const [imageOrientations, setImageOrientations] = useState<Map<string, 'landscape' | 'portrait' | 'square'>>(new Map());

  const detectImageOrientation = useCallback((imagePath: string): Promise<'landscape' | 'portrait' | 'square'> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let orientation: 'landscape' | 'portrait' | 'square';
        
        if (aspectRatio > 1.1) {
          orientation = 'landscape';
        } else if (aspectRatio < 0.9) {
          orientation = 'portrait';
        } else {
          orientation = 'square';
        }
        
        setImageOrientations(prev => new Map(prev).set(imagePath, orientation));
        resolve(orientation);
      };
      
      img.onerror = () => {
        const path = imagePath.toLowerCase();
        let orientation: 'landscape' | 'portrait' | 'square' = 'landscape';
        
        if (path.includes('portrait') || path.includes('人像')) {
          orientation = 'portrait';
        } else if (path.includes('square')) {
          orientation = 'square';
        }
        
        setImageOrientations(prev => new Map(prev).set(imagePath, orientation));
        resolve(orientation);
      };
      
      img.src = imagePath;
    });
  }, []);

  const getImageOrientation = useCallback((imagePath: string): 'landscape' | 'portrait' | 'square' => {
    const cached = imageOrientations.get(imagePath);
    if (cached) {
      return cached;
    }
    
    detectImageOrientation(imagePath);
    return 'landscape';
  }, [imageOrientations, detectImageOrientation]);

  // 过滤和排序照片
  const filteredPhotos = useMemo(() => {
    if (!allPhotos.length) return [];
    
    let filtered = allPhotos;

    if (selectedCategory !== "all") {
      const categoryName = categories.find(cat => cat.id === selectedCategory)?.key;
      if (categoryName) {
        filtered = filtered.filter(photo => photo.category === categoryName);
      }
    }

    if (selectedPhotographer !== "all") {
      filtered = filtered.filter(photo => photo.photographer.id === selectedPhotographer);
    }

    if (searchTerm) {
      filtered = filtered.filter(photo => 
        photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.camera.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return (b.likes || 0) - (a.likes || 0);
        case "views":
          return (b.views || 0) - (a.views || 0);
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return filtered;
  }, [allPhotos, selectedCategory, selectedPhotographer, searchTerm, sortBy]);

  // 组织照片
  const organizedPhotos = useMemo(() => {
    const landscape = filteredPhotos.filter(photo => {
      const orientation = getImageOrientation(photo.image);
      return orientation === 'landscape';
    });
    
    const portrait = filteredPhotos.filter(photo => {
      const orientation = getImageOrientation(photo.image);
      return orientation === 'portrait';
    });
    
    const square = filteredPhotos.filter(photo => {
      const orientation = getImageOrientation(photo.image);
      return orientation === 'square';
    });
    
    const rows = [];
    
    const LANDSCAPE_PER_ROW = 3;
    const PORTRAIT_PER_ROW = 4;
    const SQUARE_PER_ROW = 4;
    
    for (let i = 0; i < landscape.length; i += LANDSCAPE_PER_ROW) {
      rows.push({
        type: 'landscape' as const,
        photos: landscape.slice(i, i + LANDSCAPE_PER_ROW)
      });
    }
    
    for (let i = 0; i < portrait.length; i += PORTRAIT_PER_ROW) {
      rows.push({
        type: 'portrait' as const,
        photos: portrait.slice(i, i + PORTRAIT_PER_ROW)
      });
    }
    
    for (let i = 0; i < square.length; i += SQUARE_PER_ROW) {
      rows.push({
        type: 'square' as const,
        photos: square.slice(i, i + SQUARE_PER_ROW)
      });
    }
    
    return rows;
  }, [filteredPhotos, getImageOrientation]);

  const loadMorePhotos = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * PHOTOS_PER_PAGE;
      const endIndex = startIndex + PHOTOS_PER_PAGE;
      const newPhotos = filteredPhotos.slice(startIndex, endIndex);
      
      setDisplayedPhotos(prev => [...prev, ...newPhotos]);
      setCurrentPage(nextPage);
      setHasMore(endIndex < filteredPhotos.length);
      setIsLoading(false);
      
      setScrollCount(0);
      setShowLoadMoreButton(false);
    }, 800);
  }, [currentPage, filteredPhotos, isLoading, hasMore]);

  const currentCategoryName = categories.find(cat => cat.id === selectedCategory)?.name || "全部作品";

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">摄影作品展示</h1>
          <p className="text-gray-600">发现优秀的摄影作品，感受光影的魅力</p>
          {allPhotos.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              已收录 {allPhotos.length} 张精美作品
            </div>
          )}
        </div>

        {isInitialLoading && (
          <div className="text-center py-20">
            <Loader2 className="animate-spin mx-auto mb-4" size={32} />
            <h3 className="text-lg font-medium text-gray-600 mb-2">正在加载作品...</h3>
            <p className="text-gray-500">正在从文件夹中扫描和导入所有照片</p>
          </div>
        )}

        {!isInitialLoading && (
          <>
            <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="搜索作品、摄影师或设备..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                >
                  <option value="all">全部分类 ({allPhotos.length})</option>
                  {categories.map(category => {
                    const count = categoryStats[category.key] || 0;
                    return (
                      <option key={category.id} value={category.id}>
                        {category.name} ({count})
                      </option>
                    );
                  })}
                </select>

                <select
                  value={selectedPhotographer}
                  onChange={(e) => setSelectedPhotographer(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                >
                  <option value="all">全部摄影师</option>
                  {photographers.map(photographer => (
                    <option key={photographer.id} value={photographer.id}>
                      {photographer.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                >
                  <option value="date">按时间排序</option>
                  <option value="likes">按点赞数排序</option>
                  <option value="views">按浏览量排序</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Filter className="mr-2" size={20} />
                {currentCategoryName}
              </h2>
              <span className="text-gray-600">
                共找到 {filteredPhotos.length} 张作品
              </span>
            </div>

            {organizedPhotos.length > 0 ? (
              <>
                <div className="space-y-8">
                  {organizedPhotos.map((row, rowIndex) => {
                    const getGridClass = () => {
                      if (row.type === 'landscape') {
                        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
                      } else if (row.type === 'portrait') {
                        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
                      } else {
                        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
                      }
                    };
                    
                    const getImageHeightClass = (type: string) => {
                      if (type === 'landscape') {
                        return 'h-48 md:h-56 lg:h-64';
                      } else if (type === 'portrait') {
                        return 'h-56 md:h-64 lg:h-72';
                      } else {
                        return 'h-48 md:h-56 lg:h-64';
                      }
                    };
                    
                    return (
                      <div key={rowIndex} className={`grid gap-4 ${getGridClass()}`}>
                        {row.photos.map(photo => {
                          const orientation = getImageOrientation(photo.image);
                          
                          return (
                            <div key={photo.id} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                  onClick={() => navigate(`/photo/${photo.id}`)}>
                              
                              <img 
                                src={photo.image} 
                                alt={photo.title}
                                className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${getImageHeightClass(row.type)}`}
                                loading="lazy"
                              />
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
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                      </svg>
                                      <span>{photo.views}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                                      </svg>
                                      <span>{photo.likes}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                
                {isLoading && (
                  <div className="text-center mt-12">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-gray-600">加载中...</p>
                  </div>
                )}
                
                {hasMore && showLoadMoreButton && !isLoading && (
                  <div className="text-center mt-12">
                    <button 
                      onClick={loadMorePhotos}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
                    >
                      加载更多作品
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">暂无符合条件的作品</h3>
                <p className="text-gray-500">请尝试调整筛选条件或搜索关键词</p>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}