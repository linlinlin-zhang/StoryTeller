import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      // MongoDB 连接选项
      serverSelectionTimeoutMS: 5000, // 5秒超时
      connectTimeoutMS: 10000, // 10秒连接超时
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
      console.error('Database connection error:', error);
      console.warn('⚠️  数据库连接失败，应用将在无数据库模式下运行');
      console.warn('💡 请检查数据库服务器状态和网络连接');
      // 不退出进程，让应用继续运行
    }
};

// 监听连接事件
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

export default connectDB;