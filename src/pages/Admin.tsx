import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Users, 
  Camera, 
  BarChart3, 
  Settings, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'banned';
  photosCount: number;
  totalLikes: number;
}

interface Photo {
  id: string;
  title: string;
  photographer: string;
  uploadDate: string;
  status: 'approved' | 'pending' | 'rejected';
  likes: number;
  views: number;
  reports: number;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  // 权限检查
  useEffect(() => {
    const checkAdminAccess = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        // 未登录，跳转到管理员登录页
        navigate('/admin/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          // 非管理员用户，跳转到首页
          toast.error('Access denied: Admin privileges required');
          navigate('/');
          return;
        }

        // 验证token是否有效
        fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.user.role === 'admin') {
            setIsAuthorized(true);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/admin/login');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin/login');
        })
        .finally(() => {
          setIsLoading(false);
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
      }
    };

    checkAdminAccess();
  }, [navigate]);

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // 未授权状态
  if (!isAuthorized) {
    return null;
  }

  // 模拟数据
  const stats = {
    totalUsers: 1234,
    totalPhotos: 5678,
    pendingReviews: 23,
    totalViews: 123456,
    userGrowth: 12.5,
    photoGrowth: 8.3
  };

  const users: User[] = [
    {
      id: "1",
      name: "张摄影师",
      email: "zhang@example.com",
      avatar: "/images/微信图片_20240723091716.png",
      joinDate: "2024.01.15",
      status: "active",
      photosCount: 45,
      totalLikes: 1234
    },
    {
      id: "2",
      name: "李艺术家",
      email: "li@example.com",
      avatar: "/images/微信图片_20240724151549.jpg",
      joinDate: "2024.02.20",
      status: "active",
      photosCount: 32,
      totalLikes: 987
    },
    {
      id: "3",
      name: "王创作者",
      email: "wang@example.com",
      avatar: "/images/微信图片_20240723091716.png",
      joinDate: "2024.03.10",
      status: "inactive",
      photosCount: 12,
      totalLikes: 234
    }
  ];

  const photos: Photo[] = [
    {
      id: "1",
      title: "城市夜景",
      photographer: "张摄影师",
      uploadDate: "2024.08.15",
      status: "approved",
      likes: 156,
      views: 1234,
      reports: 0
    },
    {
      id: "2",
      title: "人像写真",
      photographer: "李艺术家",
      uploadDate: "2024.08.14",
      status: "pending",
      likes: 89,
      views: 567,
      reports: 1
    },
    {
      id: "3",
      title: "自然风光",
      photographer: "王创作者",
      uploadDate: "2024.08.13",
      status: "rejected",
      likes: 23,
      views: 123,
      reports: 3
    }
  ];

  const handleUserAction = (userId: string, action: string) => {
    toast.success(`用户${action}操作成功`);
  };

  const handlePhotoAction = (photoId: string, action: string) => {
    toast.success(`作品${action}操作成功`);
  };

  const getStatusBadge = (status: string, type: 'user' | 'photo') => {
    if (type === 'user') {
      const userConfig: Record<string, { label: string; color: string }> = {
        active: { label: "活跃", color: "bg-green-100 text-green-800" },
        inactive: { label: "不活跃", color: "bg-yellow-100 text-yellow-800" },
        banned: { label: "已封禁", color: "bg-red-100 text-red-800" }
      };
      const config = userConfig[status];
      if (config) {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      }
    } else {
      const photoConfig: Record<string, { label: string; color: string }> = {
        approved: { label: "已通过", color: "bg-green-100 text-green-800" },
        pending: { label: "待审核", color: "bg-yellow-100 text-yellow-800" },
        rejected: { label: "已拒绝", color: "bg-red-100 text-red-800" }
      };
      const config = photoConfig[status];
      if (config) {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      }
    }
    
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">管理后台</h1>
            <p className="text-gray-600">管理用户、作品和平台数据</p>
          </div>

          {/* 标签页导航 */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "dashboard", label: "数据概览", icon: BarChart3 },
                  { id: "users", label: "用户管理", icon: Users },
                  { id: "photos", label: "作品管理", icon: Camera },
                  { id: "settings", label: "系统设置", icon: Settings }
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
          <div className="space-y-8">
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">总用户数</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Users className="text-blue-600" size={24} />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <TrendingUp className="text-green-500 mr-1" size={16} />
                      <span className="text-green-500 font-medium">+{stats.userGrowth}%</span>
                      <span className="text-gray-500 ml-1">较上月</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">总作品数</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Camera className="text-green-600" size={24} />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <TrendingUp className="text-green-500 mr-1" size={16} />
                      <span className="text-green-500 font-medium">+{stats.photoGrowth}%</span>
                      <span className="text-gray-500 ml-1">较上月</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">待审核</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <AlertTriangle className="text-yellow-600" size={24} />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <span className="text-yellow-500 font-medium">需要处理</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">总浏览量</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Eye className="text-purple-600" size={24} />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <TrendingUp className="text-green-500 mr-1" size={16} />
                      <span className="text-green-500 font-medium">+15.3%</span>
                      <span className="text-gray-500 ml-1">较上月</span>
                    </div>
                  </div>
                </div>

                {/* 图表区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">用户增长趋势</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">图表组件占位</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">作品上传统计</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">图表组件占位</p>
                    </div>
                  </div>
                </div>

                {/* 最新活动 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">最新活动</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="text-green-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">新用户注册</p>
                        <p className="text-sm text-gray-600">张摄影师 刚刚加入平台</p>
                      </div>
                      <span className="text-sm text-gray-500">2分钟前</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Camera className="text-blue-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">新作品上传</p>
                        <p className="text-sm text-gray-600">李艺术家 上传了作品《城市夜景》</p>
                      </div>
                      <span className="text-sm text-gray-500">5分钟前</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <AlertTriangle className="text-yellow-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">作品举报</p>
                        <p className="text-sm text-gray-600">作品《人像写真》收到用户举报</p>
                      </div>
                      <span className="text-sm text-gray-500">10分钟前</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-lg shadow-sm">
                {/* 搜索和筛选 */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <h2 className="text-xl font-semibold">用户管理</h2>
                    <div className="flex space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="搜索用户..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">全部状态</option>
                        <option value="active">活跃</option>
                        <option value="inactive">不活跃</option>
                        <option value="banned">已封禁</option>
                      </select>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Download size={16} className="mr-2" />
                        导出
                      </button>
                    </div>
                  </div>
                </div>

                {/* 用户列表 */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          加入时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          作品数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          总点赞
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(user.status, 'user')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.photosCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.totalLikes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUserAction(user.id, '查看')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleUserAction(user.id, '编辑')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleUserAction(user.id, '删除')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      显示 1-{users.length} 条，共 {users.length} 条记录
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        上一页
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                        1
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        下一页
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div className="bg-white rounded-lg shadow-sm">
                {/* 搜索和筛选 */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <h2 className="text-xl font-semibold">作品管理</h2>
                    <div className="flex space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="搜索作品..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="all">全部状态</option>
                        <option value="approved">已通过</option>
                        <option value="pending">待审核</option>
                        <option value="rejected">已拒绝</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 作品列表 */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          作品
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          摄影师
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          上传时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          数据
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {photos.map(photo => (
                        <tr key={photo.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{photo.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {photo.photographer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {photo.uploadDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(photo.status, 'photo')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="space-y-1">
                              <div>点赞: {photo.likes}</div>
                              <div>浏览: {photo.views}</div>
                              {photo.reports > 0 && (
                                <div className="text-red-600">举报: {photo.reports}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {photo.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handlePhotoAction(photo.id, '通过')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => handlePhotoAction(photo.id, '拒绝')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handlePhotoAction(photo.id, '查看')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handlePhotoAction(photo.id, '删除')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">系统设置</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium mb-2">网站配置</h3>
                      <p className="text-sm text-gray-600 mb-4">管理网站基本信息和显示设置</p>
                      <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                        配置 →
                      </button>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium mb-2">用户权限</h3>
                      <p className="text-sm text-gray-600 mb-4">设置用户角色和权限管理</p>
                      <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                        配置 →
                      </button>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium mb-2">内容审核</h3>
                      <p className="text-sm text-gray-600 mb-4">配置作品审核规则和流程</p>
                      <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                        配置 →
                      </button>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium mb-2">数据备份</h3>
                      <p className="text-sm text-gray-600 mb-4">管理数据备份和恢复设置</p>
                      <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                        配置 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}