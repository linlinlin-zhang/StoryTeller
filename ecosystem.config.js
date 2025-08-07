export default {
  apps: [{
    name: 'photo-platform',
    script: './api/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 进程管理配置
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    
    // 监控配置
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'public'],
    
    // 自动重启配置
    autorestart: true,
    
    // 合并日志
    merge_logs: true,
    
    // 时间戳
    time: true
  }]
};