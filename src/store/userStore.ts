import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getImageUrl } from '../utils/imageHelper';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string;
  joinDate: string;
  role: 'user' | 'admin';
  specialties: string[];
  photosCount: number;
  totalLikes: number;
  totalViews: number;
  followersCount: number;
  followingCount: number;
}

interface UserState {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      
      login: (user: User) => {
        set({ isLoggedIn: true, user });
      },
      
      logout: () => {
        set({ isLoggedIn: false, user: null });
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        isLoggedIn: state.isLoggedIn, 
        user: state.user 
      }),
    }
  )
);

// 模拟用户数据
export const mockUsers: Record<string, User> = {
  'demo@example.com': {
    id: '1',
    name: '演示用户',
    email: 'demo@example.com',
    avatar: getImageUrl('/images/头像/长雨林.png'),
    bio: '热爱摄影的创作者，专注于城市风光和人像摄影。',
    location: '北京',
    joinDate: '2024.01.15',
    role: 'user',
    specialties: ['城市风光', '人像摄影', '夜景'],
    photosCount: 45,
    totalLikes: 1234,
    totalViews: 12345,
    followersCount: 567,
    followingCount: 123
  },
  'admin@example.com': {
    id: '2',
    name: '管理员',
    email: 'admin@example.com',
    avatar: getImageUrl('/images/头像/LTDSA.jpg'),
    bio: '平台管理员',
    location: '上海',
    joinDate: '2024.01.01',
    role: 'admin',
    specialties: ['平台管理'],
    photosCount: 0,
    totalLikes: 0,
    totalViews: 0,
    followersCount: 0,
    followingCount: 0
  },
  'photographer@example.com': {
    id: '3',
    name: '专业摄影师',
    email: 'photographer@example.com',
    avatar: getImageUrl('/images/头像/Flyverse.jpg'),
    bio: '专业摄影师，擅长风光和商业摄影。',
    location: '深圳',
    joinDate: '2024.02.01',
    role: 'user',
    specialties: ['风光摄影', '商业摄影', '后期处理'],
    photosCount: 128,
    totalLikes: 5678,
    totalViews: 45678,
    followersCount: 1234,
    followingCount: 89
  }
};

// 模拟登录函数
export const simulateLogin = async (email: string, password: string): Promise<User | null> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 简单的模拟验证
  if (password === '123456' && mockUsers[email]) {
    return mockUsers[email];
  }
  
  return null;
};

// 模拟注册函数
export const simulateRegister = async (userData: {
  name: string;
  email: string;
  password: string;
  specialties: string[];
}): Promise<User | null> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 检查邮箱是否已存在
  if (mockUsers[userData.email]) {
    throw new Error('邮箱已被注册');
  }
  
  // 创建新用户
  const newUser: User = {
    id: Date.now().toString(),
    name: userData.name,
    email: userData.email,
    avatar: getImageUrl('/images/头像/长雨林.png'),
    bio: '',
    location: '',
    joinDate: new Date().toLocaleDateString('zh-CN').replace(/\//g, '.'),
    role: 'user',
    specialties: userData.specialties,
    photosCount: 0,
    totalLikes: 0,
    totalViews: 0,
    followersCount: 0,
    followingCount: 0
  };
  
  // 保存到模拟数据中
  mockUsers[userData.email] = newUser;
  
  return newUser;
};