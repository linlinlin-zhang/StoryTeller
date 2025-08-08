import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Slideshow from "@/components/Slideshow";
import PhotoCard from "@/components/PhotoCard";
import { 
  slideImages, 
  locations, 
  categories, 
  getHomeFeaturedPhotos
} from "@/data/mockData";
import { PhotoData } from "@/components/PhotoCard";
import { ChevronRight, Loader2 } from "lucide-react";

// 缓存机制
const categoryCache = new Map<string, PhotoData[][]>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5分钟缓存
const cacheTimestamps = new Map<string, number>();

export default function Home() {
  const [categoryPages, setCategoryPages] = useState<{[key: string]: number}>(
    categories.reduce((acc, category) => ({ ...acc, [category.key]: 0 }), {})
  );
  const [categoryPhotos, setCategoryPhotos] = useState<{[key: string]: PhotoData[][]}>({});
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // 检查缓存是否有效
  const isCacheValid = useCallback((categoryKey: string): boolean => {
    const timestamp = cacheTimestamps.get(categoryKey);
    return timestamp ? (Date.now() - timestamp) < CACHE_EXPIRY : false;
  }, []);
  
  // 懒加载单个分类数据
  const loadCategoryData = useCallback(async (categoryKey: string) => {
    // 检查缓存
    if (isCacheValid(categoryKey) && categoryCache.has(categoryKey)) {
      const cachedData = categoryCache.get(categoryKey)!;
      setCategoryPhotos(prev => ({ ...prev, [categoryKey]: cachedData }));
      return;
    }
    
    setLoadingCategories(prev => new Set(prev).add(categoryKey));
    
    try {
      const featuredData = await getHomeFeaturedPhotos(categoryKey);
      const pages = featuredData?.pages || [];
      
      // 更新缓存
      categoryCache.set(categoryKey, pages);
      cacheTimestamps.set(categoryKey, Date.now());
      
      setCategoryPhotos(prev => ({ ...prev, [categoryKey]: pages }));
      
      console.log(`📸 分类 ${categoryKey} 数据加载完成:`, {
        页数: pages.length,
        总照片数: pages.reduce((sum, page) => sum + page.length, 0)
      });
    } catch (error) {
      console.error(`分类 ${categoryKey} 数据加载失败:`, error);
    } finally {
      setLoadingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryKey);
        return newSet;
      });
    }
  }, [isCacheValid]);
  
  // 初始加载前两个分类，其他分类懒加载
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      
      // 优先加载前两个分类
      const priorityCategories = categories.slice(0, 2);
      await Promise.all(
        priorityCategories.map(category => loadCategoryData(category.key))
      );
      
      setIsInitialLoading(false);
      
      // 延迟加载其他分类
      setTimeout(() => {
        const remainingCategories = categories.slice(2);
        remainingCategories.forEach(category => {
          setTimeout(() => loadCategoryData(category.key), Math.random() * 1000);
        });
      }, 500);
    };
    
    loadInitialData();
  }, [loadCategoryData]);
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="flex flex-col items-center">
        {/* 轮播展示 */}
        <Slideshow images={slideImages} />
        
        {/* 拍摄地点展示 */}
        <div className="w-4/5 mx-auto mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">拍摄地点</h1>
            <Link 
              to="/location" 
              className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
            >
              热门拍摄地点集锦
              <ChevronRight size={20} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {locations.map((location) => (
              <Link 
                key={location.id}
                to={`/location/${location.id}`}
                className="text-center group"
              >
                <img 
                  src={location.image} 
                  alt={location.name}
                  className="w-full h-32 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform duration-300"
                />
                <p className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                  {location.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
        
        {/* 精选标题 */}
        <div className="w-4/5 mx-auto mb-8">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">精选</p>
            <div className="w-16 h-1 bg-blue-500 mx-auto"></div>
          </div>
        </div>
        
        {/* 分类作品展示 */}
        <div className="w-4/5 mx-auto bg-gray-50 py-8">
          {isInitialLoading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-4" size={32} />
              <h3 className="text-lg font-medium text-gray-600 mb-2">正在加载精选作品...</h3>
              <p className="text-gray-500">正在从各个分类中挑选最佳作品</p>
            </div>
          ) : (
            categories.map((category) => {
              const categoryPages_data = categoryPhotos[category.key] || [];
              const currentPage = categoryPages[category.key] || 0;
              const totalPages = 4; // 固定4页
              const displayPhotos = categoryPages_data[currentPage] || [];
              const isLoading = loadingCategories.has(category.key);

            
            const handlePageChange = (pageIndex: number) => {
              setCategoryPages(prev => ({
                ...prev,
                [category.key]: pageIndex
              }));
            };
            
            // 如果该分类正在加载或没有数据，显示加载状态
              if (isLoading) {
                return (
                  <div key={category.id} className="mb-12 last:mb-0">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">{category.name}</h2>
                      <Link 
                        to={`/gallery?category=${category.key}`}
                        className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                      >
                        更多
                        <ChevronRight size={16} className="ml-1" />
                      </Link>
                    </div>
                    <div className="text-center py-8">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      <p className="text-gray-500">正在加载 {category.name} 作品...</p>
                    </div>
                  </div>
                );
              }
              
              // 如果该分类没有照片，跳过显示
              if (categoryPages_data.length === 0) {
                return null;
              }
              
              return (
                <div key={category.id} className="mb-12 last:mb-0">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">
                      {category.name}
                    </h2>
                  <div className="flex items-center space-x-4">
                    {totalPages > 1 && (
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, index) => (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index)}
                            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                              currentPage === index 
                                ? 'bg-blue-500' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          ></button>
                        ))}
                      </div>
                    )}
                    <Link 
                      to={`/gallery?category=${category.key}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                    >
                      更多
                      <ChevronRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
                
                {displayPhotos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {displayPhotos.map((photo) => (
                        <PhotoCard key={photo.id} photo={photo} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>该分类暂无作品</p>
                    </div>
                  )}
              </div>
              );
            })
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}