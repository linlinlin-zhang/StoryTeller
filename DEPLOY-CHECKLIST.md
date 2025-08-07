# 🚀 云服务器部署检查清单

## 📋 部署前检查

### ✅ 服务器环境
- [ ] 云服务器已创建并可SSH连接
- [ ] 服务器系统：Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- [ ] 服务器配置：至少2GB RAM，20GB存储
- [ ] Root权限或sudo权限
- [ ] 防火墙已开放必要端口（22, 80, 443）

### ✅ 数据库服务
- [ ] MongoDB已安装并运行
- [ ] MongoDB已启用认证
- [ ] 数据库用户已创建（root用户）
- [ ] 数据库连接字符串已准备
- [ ] MongoDB端口27017已开放（如需外部访问）

### ✅ 第三方服务
- [ ] 阿里云OSS已配置
- [ ] OSS Access Key和Secret已获取
- [ ] OSS Bucket已创建
- [ ] 域名已准备（可选）
- [ ] DNS已配置指向服务器IP（如有域名）

## 🔧 部署步骤检查

### 1. 代码部署
- [ ] 项目已克隆到 `/var/www/photo-platform`
- [ ] 依赖已安装 `npm install`
- [ ] 前端已构建 `npm run build`
- [ ] 后端已编译 `npm run build:server`

### 2. 环境配置
- [ ] `.env` 文件已创建（从 `.env.production` 复制）
- [ ] MongoDB连接字符串已配置
- [ ] JWT密钥已设置（强密码）
- [ ] 阿里云OSS配置已填写
- [ ] CORS域名已配置（如有域名）

### 3. 系统服务
- [ ] Node.js已安装（版本20+）
- [ ] PM2已安装 `npm install -g pm2`
- [ ] Nginx已安装并运行
- [ ] 应用已启动 `pm2 start ecosystem.config.js`
- [ ] PM2已设置开机自启 `pm2 startup && pm2 save`

### 4. Nginx配置
- [ ] Nginx配置文件已复制到 `/etc/nginx/sites-available/`
- [ ] 软链接已创建到 `/etc/nginx/sites-enabled/`
- [ ] 默认配置已删除
- [ ] 域名已配置（如有）
- [ ] 配置测试通过 `nginx -t`
- [ ] Nginx已重启

### 5. 数据库初始化
- [ ] 数据库连接测试通过 `npm run test-connection`
- [ ] 云数据库已初始化 `npm run init-cloud-db`
- [ ] 管理员账号已创建
- [ ] OSS连接测试通过 `npm run test-oss`

## 🔍 部署后验证

### ✅ 服务状态检查
- [ ] PM2应用状态正常 `pm2 status`
- [ ] Nginx服务运行正常 `systemctl status nginx`
- [ ] MongoDB服务运行正常 `systemctl status mongod`
- [ ] 应用端口3000可访问 `curl http://localhost:3000/api/health`

### ✅ 功能测试
- [ ] 网站首页可正常访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 管理员登录正常（admin@example.com / admin123456）
- [ ] 图片上传功能正常
- [ ] 图片显示正常（OSS链接）

### ✅ 性能检查
- [ ] 页面加载速度正常（<3秒）
- [ ] 静态资源缓存生效
- [ ] Gzip压缩启用
- [ ] 数据库查询性能正常

## 🔐 安全配置

### ✅ 基础安全
- [ ] 默认管理员密码已修改
- [ ] JWT密钥为强密码
- [ ] 数据库密码为强密码
- [ ] SSH密钥登录已配置（推荐）
- [ ] 防火墙已启用 `ufw enable`

### ✅ SSL证书（推荐）
- [ ] SSL证书已安装（Let's Encrypt或其他）
- [ ] HTTPS重定向已配置
- [ ] 证书自动续期已设置

## 📊 监控配置

### ✅ 日志管理
- [ ] 应用日志正常写入 `/var/www/photo-platform/logs/`
- [ ] Nginx日志正常写入 `/var/log/nginx/`
- [ ] 日志轮转已配置

### ✅ 备份策略
- [ ] 数据库备份脚本已创建
- [ ] 定时备份已设置（crontab）
- [ ] 备份存储位置已确认

### ✅ 监控告警
- [ ] PM2监控面板可访问 `pm2 monit`
- [ ] 系统资源监控已配置
- [ ] 错误日志监控已设置

## 🚨 常见问题排查

### 应用无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000

# 查看PM2日志
pm2 logs photo-platform

# 检查环境变量
cat .env
```

### 数据库连接失败
```bash
# 测试连接
npm run test-connection

# 检查MongoDB状态
sudo systemctl status mongod

# 查看MongoDB日志
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx 502错误
```bash
# 检查应用状态
pm2 status

# 测试Nginx配置
nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 文件上传失败
```bash
# 测试OSS连接
npm run test-oss

# 检查文件权限
ls -la uploads/
```

## 📞 部署完成确认

### ✅ 最终检查
- [ ] 所有服务正常运行
- [ ] 网站功能完整可用
- [ ] 性能表现良好
- [ ] 安全配置到位
- [ ] 监控备份就绪
- [ ] 文档记录完整

### 🎉 部署成功！

**访问地址：**
- 网站首页：`http://your-domain.com` 或 `http://server-ip`
- 管理后台：`http://your-domain.com/admin`
- API接口：`http://your-domain.com/api`

**默认账号：**
- 管理员：admin@example.com / admin123456

> ⚠️ **重要提醒**：
> 1. 立即修改默认管理员密码
> 2. 定期更新系统和依赖
> 3. 监控服务器资源使用情况
> 4. 定期检查备份完整性

---

**部署时间：** ___________  
**部署人员：** ___________  
**服务器IP：** ___________  
**域名：** ___________