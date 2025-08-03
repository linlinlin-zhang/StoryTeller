import { Link } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import { useState, useEffect } from "react";

export interface PhotoData {
  id: string;
  title: string;
  image: string;
  photographer: {
    id: string;
    name: string;
    avatar: string;
  };
  camera: string;
  date: string;
  likes?: number;
  views?: number;
  category: string;
}

interface PhotoCardProps {
  photo: PhotoData;
  showStats?: boolean;
}

export default function PhotoCard({ photo, showStats = true }: PhotoCardProps) {
  const [imageAspectRatio, setImageAspectRatio] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio > 1.3) {
        setImageAspectRatio('landscape');
      } else if (ratio < 0.8) {
        setImageAspectRatio('portrait');
      } else {
        setImageAspectRatio('square');
      }
      setImageLoaded(true);
    };
    img.src = photo.image;
  }, [photo.image]);

  const getImageClasses = () => {
    switch (imageAspectRatio) {
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
      case 'square':
      default:
        return 'aspect-[4/3]';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group">
      {/* 图片 */}
      <Link to={`/photo/${photo.id}`} className="block">
        <div className={`relative overflow-hidden ${getImageClasses()}`}>
          <img
            src={photo.image}
            alt={photo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {showStats && (
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
                <Eye size={12} className="mr-1" />
                {photo.views || 0}
              </div>
              <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
                <Heart size={12} className="mr-1" />
                {photo.likes || 0}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* 作品信息 */}
      <div className="p-4">
        <Link to={`/photo/${photo.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {photo.title}
          </h3>
        </Link>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="text-gray-500">设备：</span>
          <span className="text-blue-600 ml-1">{photo.camera}</span>
        </div>

        {/* 分割线 */}
        <div className="border-t border-gray-200 my-3"></div>

        {/* 摄影师信息 */}
        <div className="flex items-center justify-between">
          <Link 
            to={`/photographer/${photo.photographer.id}`}
            className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
          >
            <img
              src={photo.photographer.avatar}
              alt={photo.photographer.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium">{photo.photographer.name}</span>
          </Link>
          <span className="text-xs text-gray-500">{photo.date}</span>
        </div>
      </div>
    </div>
  );
}