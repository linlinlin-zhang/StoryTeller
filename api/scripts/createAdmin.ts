import mongoose from 'mongoose';
import User, { UserRole } from '../models/User.js';
import connectDB from '../config/database.js';
import { config } from 'dotenv';

// 加载环境变量
config();

/**
 * 创建管理员账号脚本
 */
async function createAdminUser() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/photography_platform';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 检查是否已存在管理员账号
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // 创建管理员账号
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123456',
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
      bio: '系统管理员',
      avatar: '/images/admin-avatar.png'
    });

    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123456');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// 直接执行创建管理员账号
createAdminUser();

export { createAdminUser };