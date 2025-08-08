import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoCard from "@/components/PhotoCard";
import { getPhotoById, getPhotosByPhotographer } from "@/data/mockData";
import { Heart, Eye, Share2, Download, Camera, Calendar, User, MessageCircle, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/imageHelper";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  date: string;
  likes: number;
}

export default function PhotoDetail() {
  const { id } = useParams();
  const [photo, setPhoto] = useState(getPhotoById(id || ""));
  const [isLiked, setIsLiked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      user: {
        name: "张三",
        avatar: getImageUrl("/images/微信图片_20240723091716.png")
      },
      content: "构图很棒，光影处理得很好！",
      date: "2024.8.15",
      likes: 12
    },
    {
      id: "2",
      user: {
        name: "李四",
        avatar: getImageUrl("/images/微信图片_20240724151549.jpg")
      },
      content: "这个角度很独特，学习了！",
      date: "2024.8.14",
      likes: 8
    }
  ]);
  const [newComment, setNewComment] = useState("");
  const [relatedPhotos, setRelatedPhotos] = useState<any[]>([]);

  useEffect(() => {
    if (photo) {
      const related = getPhotosByPhotographer(photo.photographer.id)
        .filter(p => p.id !== photo.id)
        .slice(0, 4);
      setRelatedPhotos(related);
    }
  }, [photo]);

  if (!photo) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-600">作品不存在</h1>
          <Link to="/gallery" className="text-blue-600 hover:underline mt-4 inline-block">
            返回作品展示
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "取消点赞" : "点赞成功");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("链接已复制到剪贴板");
  };

  const handleDownload = () => {
    toast.info("下载功能需要登录");
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: "当前用户",
        avatar: getImageUrl("/images/微信图片_20240723091716.png")
      },
      content: newComment,
      date: new Date().toLocaleDateString('zh-CN'),
      likes: 0
    };
    
    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("评论发布成功");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：图片展示 */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full h-auto rounded-lg shadow-lg cursor-pointer"
                onClick={() => setIsFullscreen(true)}
              />
              
              {/* 操作按钮 */}
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full ${isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} shadow-lg hover:scale-110 transition-transform`}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white text-gray-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Share2 size={20} />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 bg-white text-gray-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>

            {/* 作品信息 */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold mb-4">{photo.title}</h1>
              
              <div className="flex items-center space-x-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  <span>{photo.views}</span>
                </div>
                <div className="flex items-center">
                  <Heart size={16} className="mr-1" />
                  <span>{photo.likes}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle size={16} className="mr-1" />
                  <span>{comments.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：详细信息 */}
          <div className="space-y-6">
            {/* 拍摄参数 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Camera className="mr-2" size={20} />
                拍摄信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">设备：</span>
                  <span className="font-medium text-blue-600">{photo.camera}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">分类：</span>
                  <span className="font-medium">{photo.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">拍摄时间：</span>
                  <span className="font-medium">{photo.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">光圈：</span>
                  <span className="font-medium">f/2.8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">快门：</span>
                  <span className="font-medium">1/125s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ISO：</span>
                  <span className="font-medium">400</span>
                </div>
              </div>
            </div>

            {/* 摄影师信息 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="mr-2" size={20} />
                摄影师
              </h3>
              <Link 
                to={`/photographer/${photo.photographer.id}`}
                className="flex items-center space-x-4 hover:bg-gray-100 p-3 rounded-lg transition-colors"
              >
                <img
                  src={photo.photographer.avatar}
                  alt={photo.photographer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{photo.photographer.name}</h4>
                  <p className="text-sm text-gray-600">查看更多作品</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 评论区 */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6">评论 ({comments.length})</h3>
          
          {/* 发表评论 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                发表评论
              </button>
            </div>
          </div>

          {/* 评论列表 */}
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium">{comment.user.name}</span>
                    <span className="text-sm text-gray-500">{comment.date}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <ThumbsUp size={14} />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 相关作品 */}
        {relatedPhotos.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6">摄影师的其他作品</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPhotos.map(relatedPhoto => (
                <PhotoCard key={relatedPhoto.id} photo={relatedPhoto} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 全屏查看 */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <img
            src={photo.image}
            alt={photo.title}
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
      
      <Footer />
    </div>
  );
}