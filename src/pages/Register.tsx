import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Camera, Mail, Lock, User, MapPin, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useUserStore, simulateRegister } from "@/store/userStore";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
  specialty: string;
  bio: string;
  agreeTerms: boolean;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

export default function Register() {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    specialty: "",
    bio: "",
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const passwordRequirements: PasswordRequirement[] = [
    { text: "至少8个字符", met: formData.password.length >= 8 },
    { text: "包含大写字母", met: /[A-Z]/.test(formData.password) },
    { text: "包含小写字母", met: /[a-z]/.test(formData.password) },
    { text: "包含数字", met: /\d/.test(formData.password) }
  ];

  const specialties = [
    "人像摄影",
    "风景摄影",
    "街拍摄影",
    "建筑摄影",
    "微距摄影",
    "野生动物摄影",
    "婚礼摄影",
    "商业摄影",
    "艺术摄影",
    "其他"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateStep1 = () => {
    if (!formData.username.trim()) {
      toast.error("请输入用户名");
      return false;
    }
    if (formData.username.length < 3) {
      toast.error("用户名至少需要3个字符");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("请输入邮箱地址");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("请输入有效的邮箱地址");
      return false;
    }
    if (!passwordRequirements.every(req => req.met)) {
      toast.error("密码不符合要求");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("两次输入的密码不一致");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.location.trim()) {
      toast.error("请输入所在地区");
      return false;
    }
    if (!formData.specialty) {
      toast.error("请选择摄影专长");
      return false;
    }
    if (!formData.agreeTerms) {
      toast.error("请同意服务条款和隐私政策");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const user = await simulateRegister({
        name: formData.username,
        email: formData.email,
        password: formData.password,
        specialties: [formData.specialty]
      });
      
      if (user) {
        login(user);
        toast.success(`注册成功！欢迎加入摄影社区，${user.name}`);
        navigate("/");
      }
      
    } catch (error: any) {
      toast.error(error.message || "注册失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 注册卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* 头部 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Camera className="text-purple-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">加入摄影社区</h1>
              <p className="text-gray-600">创建您的摄影师账户</p>
            </div>

            {/* 步骤指示器 */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className="text-xs text-gray-600 ml-2 mr-4">基本信息</div>
              </div>
              <div className={`w-16 h-1 ${
                currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'
              }`}></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ml-4 ${
                  currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <div className="text-xs text-gray-600 ml-2">个人资料</div>
              </div>
            </div>

            {/* 第一步：基本信息 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* 用户名 */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    用户名 *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="请输入用户名"
                      required
                    />
                  </div>
                  {formData.username && formData.username.length < 3 && (
                    <p className="mt-1 text-sm text-red-600">用户名至少需要3个字符</p>
                  )}
                </div>

                {/* 邮箱 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址 *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="请输入邮箱地址"
                      required
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    密码 *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="请输入密码"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* 密码要求 */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center text-sm">
                          {req.met ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <X className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span className={req.met ? 'text-green-600' : 'text-red-600'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 确认密码 */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码 *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="请再次输入密码"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">两次输入的密码不一致</p>
                  )}
                </div>

                {/* 下一步按钮 */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  下一步
                </button>
              </div>
            )}

            {/* 第二步：个人资料 */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 所在地区 */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    所在地区 *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="例如：北京市朝阳区"
                      required
                    />
                  </div>
                </div>

                {/* 摄影专长 */}
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                    摄影专长 *
                  </label>
                  <select
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">请选择您的摄影专长</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                {/* 个人简介 */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    个人简介
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                    placeholder="简单介绍一下您的摄影经历和风格..."
                  />
                  <p className="mt-1 text-sm text-gray-500">选填，但建议填写以便其他用户了解您</p>
                </div>

                {/* 同意条款 */}
                <div className="flex items-start">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                    required
                  />
                  <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                    我已阅读并同意{" "}
                    <button type="button" className="text-purple-600 hover:text-purple-500 underline">
                      服务条款
                    </button>
                    {" "}和{" "}
                    <button type="button" className="text-purple-600 hover:text-purple-500 underline">
                      隐私政策
                    </button>
                  </label>
                </div>

                {/* 按钮组 */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    上一步
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        注册中...
                      </div>
                    ) : (
                      "完成注册"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* 登录链接 */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                已有账户？{" "}
                <Link
                  to="/login"
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                >
                  立即登录
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}