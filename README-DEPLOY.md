# 摄影交流平台 - 云服务器部署指南

本指南将帮助您在云服务器上快速部署摄影交流平台。

## 📋 部署前准备

### 系统要求
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 至少 2GB RAM
- 至少 20GB 存储空间
- Root 权限

### 必需服务
- MongoDB 数据库（已配置）
- Redis 缓存（可选）
- 阿里云 OSS 存储
- 域名（可选，用于生产环境）

## 🚀 快速部署

### 1. 连接到云服务器
```bash
ssh root@your-server-ip
```

### 2. 克隆项目
```bash
cd /var/www
git clone https://github.com/linlinlin-zhang/StoryTeller.git photo-platform
cd photo-platform
```

### 3. 运行自动部署脚本
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. 配置环境变量
```bash
# 复制生产环境配置
cp .env.production .env

# 编辑配置文件
nano .env
```

**重要配置项：**
```env
# 数据库配置
MONGODB_URI=mongodb://root:your-password@localhost:27017/photo

# JWT密钥（请生成强密码）
JWT_SECRET=your-super-secret-jwt-key

# 阿里云OSS配置
ALI_OSS_ACCESS_KEY_ID=your-access-key
ALI_OSS_ACCESS_KEY_SECRET=your-secret-key
ALI_OSS_BUCKET=your-bucket-name
ALI_OSS_REGION=oss-cn-hangzhou

# 域名配置
CORS_ORIGIN=https://your-domain.com
```

### 5. 初始化数据库
```bash
# 初始化云数据库结构
npm run init-cloud-db

# 创建管理员账号
npm run create-admin
```

### 6. 启动服务
```bash
# 重启应用
pm2 restart photo-platform

# 检查状态
pm2 status
pm2 logs photo-platform
```

## 🔧 详细配置步骤

### MongoDB 配置

1. **确保 MongoDB 服务运行**
```bash
sudo systemctl status mongod
sudo systemctl start mongod
sudo systemctl enable mongod
```

2. **创建数据库用户**
```bash
mongo
> use admin
> db.createUser({
    user: "root",
    pwd: "your-password",
    roles: ["root"]
  })
> exit
```

3. **启用认证**
编辑 `/etc/mongod.conf`：
```yaml
security:
  authorization: enabled
```

重启 MongoDB：
```bash
sudo systemctl restart mongod
```

### Nginx 配置

1. **更新域名配置**
编辑 `/etc/nginx/sites-available/photo-platform`：
```nginx
server_name your-domain.com www.your-domain.com;
```

2. **更新项目路径**
```nginx
location / {
    root /var/www/photo-platform/dist;
    try_files $uri $uri/ /index.html;
}
```

3. **测试并重启 Nginx**
```bash
nginx -t
sudo systemctl restart nginx
```

### SSL 证书配置（推荐）

使用 Let's Encrypt 免费证书：
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 监控和维护

### PM2 进程管理
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs photo-platform

# 重启应用
pm2 restart photo-platform

# 停止应用
pm2 stop photo-platform

# 查看监控面板
pm2 monit
```

### 日志管理
```bash
# 应用日志
tail -f /var/www/photo-platform/logs/combined.log

# Nginx 日志
tail -f /var/log/nginx/photo-platform-access.log
tail -f /var/log/nginx/photo-platform-error.log

# MongoDB 日志
tail -f /var/log/mongodb/mongod.log
```

### 数据备份
```bash
# 创建备份脚本
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="mongodb://root:your-password@localhost:27017/photo" --out="$BACKUP_DIR/photo_$DATE"

# 保留最近7天的备份
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x /root/backup-db.sh

# 设置定时备份（每天凌晨2点）
crontab -e
# 添加：0 2 * * * /root/backup-db.sh
```

## 🔍 故障排除

### 常见问题

1. **应用无法启动**
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000

# 检查环境变量
cat .env

# 查看详细错误
pm2 logs photo-platform --lines 50
```

2. **数据库连接失败**
```bash
# 测试数据库连接
npm run test-connection

# 检查 MongoDB 状态
sudo systemctl status mongod

# 查看 MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log
```

3. **Nginx 502 错误**
```bash
# 检查应用是否运行
pm2 status

# 检查 Nginx 配置
nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

4. **文件上传失败**
```bash
# 测试 OSS 连接
npm run test-oss

# 检查文件权限
ls -la uploads/
```

### 性能优化

1. **启用 Gzip 压缩**（已在 nginx.conf 中配置）

2. **配置缓存策略**
```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **数据库索引优化**
```bash
# 连接到 MongoDB
mongo mongodb://root:your-password@localhost:27017/photo

# 查看索引
db.photos.getIndexes()
db.users.getIndexes()

# 查看查询性能
db.photos.find({photographer: ObjectId("...")}).explain("executionStats")
```

## 📱 移动端适配

项目已支持响应式设计，在移动设备上可正常访问。如需 PWA 支持，可添加 Service Worker。

## 🔐 安全建议

1. **定期更新系统**
```bash
sudo apt update && sudo apt upgrade
```

2. **配置防火墙**
```bash
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
```

3. **更改默认密码**
- MongoDB root 密码
- JWT 密钥
- 管理员账号密码

4. **启用访问日志监控**
```bash
# 安装 fail2ban
sudo apt install fail2ban

# 配置 SSH 保护
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📞 技术支持

如遇到部署问题，请检查：
1. 系统日志：`journalctl -xe`
2. 应用日志：`pm2 logs`
3. Nginx 日志：`/var/log/nginx/`
4. MongoDB 日志：`/var/log/mongodb/`

---

**部署完成后访问：**
- 网站首页：`http://your-domain.com`
- 管理后台：`http://your-domain.com/admin`
- API 接口：`http://your-domain.com/api`

**默认管理员账号：**
- 邮箱：`admin@example.com`
- 密码：`admin123456`

> ⚠️ **重要提醒**：部署完成后请立即修改默认管理员密码！