import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogIn, Upload, Settings } from "lucide-react";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useUserStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const isActive = (path: string) => {
    if (path === '/gallery') {
      return location.pathname === '/gallery' || location.pathname === '/';
    }
    if (path === '/photographer') {
      return location.pathname.startsWith('/photographer');
    }
    return location.pathname === path;
  };

  const getNavLinkClass = (path: string) => {
    const baseClass = "text-white no-underline hover:text-blue-400 transition-colors font-medium";
    const activeClass = "text-blue-400 font-bold";
    return isActive(path) ? `${baseClass} ${activeClass}` : baseClass;
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-black text-white py-3 px-0 font-serif font-semibold">
      <div className="grid grid-cols-[15%_1fr_15%] items-center relative">
        {/* 工作室名称 */}
        <div className="text-xl ml-[5%] my-2">
          <Link to="/" className="hover:text-blue-400 transition-colors">
            纯粹影像
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="justify-self-center">
          <ul className="flex space-x-6 text-left">
            <li>
              <Link 
                to="/gallery" 
                className={getNavLinkClass('/gallery')}
              >
                探索
              </Link>
            </li>
            <li className="relative group">
              <span className={`cursor-pointer hover:text-blue-400 transition-colors font-medium ${
                isActive('/photographer') ? 'text-blue-400 font-bold' : 'text-white'
              }`}>
                摄影师
              </span>
              <div className="absolute top-5 left-0 hidden group-hover:block bg-gray-100 min-w-max shadow-lg z-10">
                <Link 
                  to="/photographer/zsl" 
                  className="block px-4 py-3 text-black no-underline hover:bg-blue-50 transition-colors"
                >
                  长雨林
                </Link>
                <Link 
                  to="/photographer/zym" 
                  className="block px-4 py-3 text-black no-underline hover:bg-blue-50 transition-colors"
                >
                  LTDSA
                </Link>
                <Link 
                  to="/photographer/cfy" 
                  className="block px-4 py-3 text-black no-underline hover:bg-blue-50 transition-colors"
                >
                  Flyverse
                </Link>
                <Link 
                  to="/photographer/lqr" 
                  className="block px-4 py-3 text-black no-underline hover:bg-blue-50 transition-colors"
                >
                  Tp
                </Link>
                <Link 
                  to="/photographer/dq" 
                  className="block px-4 py-3 text-black no-underline hover:bg-blue-50 transition-colors"
                >
                  戴小岐
                </Link>
              </div>
            </li>
            <li>
              <Link 
                to="/following" 
                className={getNavLinkClass('/following')}
              >
                关注
              </Link>
            </li>
          </ul>
        </nav>

        {/* 用户操作区域 */}
        <div className="justify-self-end mr-[5%] flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
              >
                <User size={20} />
                <span>用户中心</span>
              </button>
              {showDropdown && (
                <div className="absolute top-8 right-0 bg-white text-black shadow-lg rounded-md py-2 min-w-[150px] z-20">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    个人中心
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/upload" 
                      className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Upload size={16} className="inline mr-2" />
                      上传作品
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings size={16} className="inline mr-2" />
                      管理后台
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
            >
              <LogIn size={20} />
              <span>登录</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}