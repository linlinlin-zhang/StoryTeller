import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Upload as UploadIcon, X, Camera, MapPin, Calendar, Tag, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface PhotoData {
  title: string;
  description: string;
  category: string;
  location: string;
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: string;
  tags: string[];
}

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photosData, setPhotosData] = useState<PhotoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newTag, setNewTag] = useState("");

  const categories = [
    "自然风光",
    "人像摄影",
    "街拍纪实",
    "建筑摄影",
    "微距摄影",
    "野生动物",
    "黑白摄影",
    "夜景摄影",
    "旅行摄影",
    "其他"
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (selectedFiles.length + files.length > 10) {
      toast.error("最多只能上传10张照片");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // 生成预览
    const newPreviews = [...previews];
    const newPhotosData = [...photosData];

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[selectedFiles.length + index] = e.target?.result as string;
        setPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);

      // 初始化照片数据
      newPhotosData[selectedFiles.length + index] = {
        title: "",
        description: "",
        category: "",
        location: "",
        camera: "",
        lens: "",
        aperture: "",
        shutter: "",
        iso: "",
        tags: []
      };
    });

    setPhotosData(newPhotosData);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newPhotosData = photosData.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    setPhotosData(newPhotosData);
    
    if (currentPhotoIndex >= newFiles.length && newFiles.length > 0) {
      setCurrentPhotoIndex(newFiles.length - 1);
    } else if (newFiles.length === 0) {
      setCurrentPhotoIndex(0);
    }
  };

  const updatePhotoData = (field: keyof PhotoData, value: string | string[]) => {
    const newPhotosData = [...photosData];
    newPhotosData[currentPhotoIndex] = {
      ...newPhotosData[currentPhotoIndex],
      [field]: value
    };
    setPhotosData(newPhotosData);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = photosData[currentPhotoIndex]?.tags || [];
    if (currentTags.includes(newTag.trim())) {
      toast.error("标签已存在");
      return;
    }
    
    if (currentTags.length >= 10) {
      toast.error("最多只能添加10个标签");
      return;
    }
    
    updatePhotoData('tags', [...currentTags, newTag.trim()]);
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = photosData[currentPhotoIndex]?.tags || [];
    updatePhotoData('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    if (selectedFiles.length === 0) {
      toast.error("请至少选择一张照片");
      return false;
    }

    for (let i = 0; i < photosData.length; i++) {
      const data = photosData[i];
      if (!data.title.trim()) {
        toast.error(`第${i + 1}张照片缺少标题`);
        setCurrentPhotoIndex(i);
        return false;
      }
      if (!data.category) {
        toast.error(`第${i + 1}张照片缺少分类`);
        setCurrentPhotoIndex(i);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    
    // 模拟上传过程
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success(`成功上传${selectedFiles.length}张照片！`);
      navigate("/gallery");
    } catch (error) {
      toast.error("上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const currentPhoto = photosData[currentPhotoIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">上传作品</h1>
            <p className="text-gray-600">分享您的摄影作品，与社区成员交流</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 文件上传区域 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">选择照片</h2>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  拖拽照片到这里，或者
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  点击选择文件
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  支持 JPG、PNG、WEBP 格式，最多10张照片
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* 照片预览 */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">已选择的照片 ({selectedFiles.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {previews.map((preview, index) => (
                      <div
                        key={index}
                        className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                          index === currentPhotoIndex ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      >
                        <img
                          src={preview}
                          alt={`预览 ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 照片信息编辑 */}
            {selectedFiles.length > 0 && currentPhoto && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左侧：当前照片预览 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium mb-4">
                    编辑照片信息 ({currentPhotoIndex + 1}/{selectedFiles.length})
                  </h3>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={previews[currentPhotoIndex]}
                      alt="当前编辑"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    文件名: {selectedFiles[currentPhotoIndex]?.name}
                  </p>
                </div>

                {/* 右侧：表单 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="space-y-6">
                    {/* 基本信息 */}
                    <div>
                      <h4 className="text-md font-medium mb-4 flex items-center">
                        <ImageIcon className="mr-2" size={20} />
                        基本信息
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            作品标题 *
                          </label>
                          <input
                            type="text"
                            value={currentPhoto.title}
                            onChange={(e) => updatePhotoData('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="为您的作品起个标题"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            作品描述
                          </label>
                          <textarea
                            value={currentPhoto.description}
                            onChange={(e) => updatePhotoData('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="描述您的拍摄想法、故事或技巧..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            分类 *
                          </label>
                          <select
                            value={currentPhoto.category}
                            onChange={(e) => updatePhotoData('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">请选择分类</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            拍摄地点
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPin className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={currentPhoto.location}
                              onChange={(e) => updatePhotoData('location', e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="例如：北京故宫"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 拍摄参数 */}
                    <div>
                      <h4 className="text-md font-medium mb-4 flex items-center">
                        <Camera className="mr-2" size={20} />
                        拍摄参数
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            相机型号
                          </label>
                          <input
                            type="text"
                            value={currentPhoto.camera}
                            onChange={(e) => updatePhotoData('camera', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Canon EOS R5"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            镜头
                          </label>
                          <input
                            type="text"
                            value={currentPhoto.lens}
                            onChange={(e) => updatePhotoData('lens', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="24-70mm f/2.8"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            光圈
                          </label>
                          <input
                            type="text"
                            value={currentPhoto.aperture}
                            onChange={(e) => updatePhotoData('aperture', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="f/2.8"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            快门速度
                          </label>
                          <input
                            type="text"
                            value={currentPhoto.shutter}
                            onChange={(e) => updatePhotoData('shutter', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1/125s"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ISO
                          </label>
                          <input
                            type="text"
                            value={currentPhoto.iso}
                            onChange={(e) => updatePhotoData('iso', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 标签 */}
                    <div>
                      <h4 className="text-md font-medium mb-4 flex items-center">
                        <Tag className="mr-2" size={20} />
                        标签
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="添加标签"
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            添加
                          </button>
                        </div>
                        
                        {currentPhoto.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {currentPhoto.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            {selectedFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      共 {selectedFiles.length} 张照片待上传
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles([]);
                        setPreviews([]);
                        setPhotosData([]);
                        setCurrentPhotoIndex(0);
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      清空重选
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          上传中...
                        </>
                      ) : (
                        "发布作品"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}