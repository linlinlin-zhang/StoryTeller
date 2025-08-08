import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoCard from "@/components/PhotoCard";
import { getPhotosByPhotographer } from "@/data/mockData";
import { getImageUrl } from "@/utils/imageHelper";
import { 
  User, 
  Camera, 
  Heart, 
  Eye, 
  Settings, 
  Edit3, 
  Upload, 
  Trash2, 
  BarChart3,
  Users,
  Award,
  MapPin,
  Calendar,
  Mail,
  Phone
} from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "长雨林",
    email: "zhangyulin@example.com",
    phone: "138****8888",
    location: "广州",
    specialty: "风光摄影",
    bio: "专注于自然风光和人文摄影，擅长捕捉光影的瞬间变化。",
    joinDate: "2022年3月",
    avatar: getImageUrl("/images/微信图片_20240723091716.png")
  });
  const [editForm, setEditForm] = useState(userInfo);

  // 模拟用户作品数据 - 使用当前登录用户对应的摄影师ID
  const userPhotos = getPhotosByPhotographer("zsl"); // 假设当前用户是长雨林
  const totalLikes = userPhotos.reduce((sum, photo) => sum + photo.likes, 0);
  const totalViews = userPhotos.reduce((sum, photo) => sum + photo.views, 0);
  const followers = 1234;
  const following = 567;

  const handleEditSubmit = () => {
    setUserInfo(editForm);
    setIsEditing(false);
    toast.success("个人信息更新成功");
  };

  const handleDeletePhoto = (photoId: string) => {
    toast.success("作品删除成功");
  };

  const stats = [
    { label: "作品数量", value: userPhotos.length, icon: Camera, color: "text-blue-600" },
    { label: "总点赞", value: totalLikes, icon: Heart, color: "text-red-600" },
    { label: "总浏览", value: totalViews, icon: Eye, color: "text-green-600" },
    { label: "粉丝", value: followers, icon: Users, color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 用户信息卡片 */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-32 h-32 rounded-full object-cover shadow-lg"
                />
                <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h1 className="text-3xl font-bold mb-2 md:mb-0">{userInfo.name}</h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 size={16} className="mr-2" />
                    编辑资料
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4">{userInfo.bio}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-1" />
                    <span>{userInfo.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Camera size={16} className="mr-1" />
                    <span>{userInfo.specialty}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-1" />
                    <span>加入于 {userInfo.joinDate}</span>
                  </div>
                </div>
                
                {/* 统计数据 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="text-center">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center">
                          <Icon size={14} className="mr-1" />
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 标签页导航 */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "overview", label: "概览", icon: BarChart3 },
                  { id: "photos", label: "我的作品", icon: Camera },
                  { id: "liked", label: "点赞收藏", icon: Heart },
                  { id: "settings", label: "账户设置", icon: Settings }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon size={16} className="mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 标签页内容 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-6">数据概览</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div key={index} className="bg-gray-50 p-6 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <Icon className={`${stat.color}`} size={24} />
                            <span className={`text-2xl font-bold ${stat.color}`}>
                              {stat.value}
                            </span>
                          </div>
                          <p className="text-gray-600">{stat.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">最新作品</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPhotos.slice(0, 6).map(photo => (
                      <PhotoCard key={photo.id} photo={photo} />
                    ))}
                  </div>
                  {userPhotos.length > 6 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setActiveTab("photos")}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                      >
                        查看全部作品 →
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">成就徽章</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                      <Award className="text-yellow-600 mb-2" size={24} />
                      <p className="text-sm font-medium">优秀摄影师</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <Users className="text-blue-600 mb-2" size={24} />
                      <p className="text-sm font-medium">人气作者</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <Heart className="text-green-600 mb-2" size={24} />
                      <p className="text-sm font-medium">点赞达人</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <Camera className="text-purple-600 mb-2" size={24} />
                      <p className="text-sm font-medium">创作新星</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">我的作品 ({userPhotos.length})</h2>
                  <Link
                    to="/upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={16} className="mr-2" />
                    上传新作品
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPhotos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <PhotoCard photo={photo} />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {userPhotos.length === 0 && (
                  <div className="text-center py-12">
                    <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">还没有上传作品</p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload size={16} className="mr-2" />
                      上传第一张作品
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "liked" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">点赞与收藏</h2>
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">暂无点赞或收藏的作品</p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold mb-6">账户设置</h2>
                
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          用户名
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          邮箱地址
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          手机号码
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          所在地区
                        </label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          摄影专长
                        </label>
                        <select
                          value={editForm.specialty}
                          onChange={(e) => setEditForm({...editForm, specialty: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="人像摄影">人像摄影</option>
                          <option value="风景摄影">风景摄影</option>
                          <option value="街拍摄影">街拍摄影</option>
                          <option value="建筑摄影">建筑摄影</option>
                          <option value="其他">其他</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          个人简介
                        </label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={handleEditSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        保存更改
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm(userInfo);
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <User className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">用户名</p>
                          <p className="font-medium">{userInfo.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">邮箱地址</p>
                          <p className="font-medium">{userInfo.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Phone className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">手机号码</p>
                          <p className="font-medium">{userInfo.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <MapPin className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">所在地区</p>
                          <p className="font-medium">{userInfo.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Camera className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">摄影专长</p>
                          <p className="font-medium">{userInfo.specialty}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">加入时间</p>
                          <p className="font-medium">{userInfo.joinDate}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">个人简介</p>
                      <p className="text-gray-800">{userInfo.bio}</p>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium mb-4">其他设置</h3>
                      <div className="space-y-4">
                        <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <span>隐私设置</span>
                            <span className="text-gray-400">→</span>
                          </div>
                        </button>
                        <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <span>通知设置</span>
                            <span className="text-gray-400">→</span>
                          </div>
                        </button>
                        <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <span>修改密码</span>
                            <span className="text-gray-400">→</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => toast.error("账户注销功能需要联系客服")}
                          className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                        >
                          <div className="flex justify-between items-center">
                            <span>注销账户</span>
                            <span className="text-red-400">→</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}