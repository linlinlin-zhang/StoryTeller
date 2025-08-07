#!/bin/bash

# 摄影交流平台自动化部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "=== 开始部署摄影交流平台 ==="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="photo-platform"
PROJECT_DIR="/var/www/photo-platform"
GIT_REPO="https://github.com/linlinlin-zhang/StoryTeller.git"
NODE_VERSION="20"

# 函数：打印彩色信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    print_error "请使用root权限运行此脚本"
    exit 1
fi

# 1. 更新系统
print_info "更新系统包..."
apt update && apt upgrade -y

# 2. 安装必要软件
print_info "安装必要软件..."
apt install -y curl wget git nginx

# 安装MongoDB工具
print_info "安装MongoDB工具..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/mongodb-server-6.0.gpg > /dev/null
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-mongosh mongodb-database-tools

# 3. 安装Node.js
print_info "安装Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# 4. 安装PM2
print_info "安装PM2进程管理器..."
npm install -g pm2

# 5. 创建项目目录
print_info "创建项目目录..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 6. 克隆或更新代码
if [ -d ".git" ]; then
    print_info "更新代码..."
    # 检测远程默认分支
    DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
    if [ -z "$DEFAULT_BRANCH" ]; then
        # 如果无法检测到默认分支，尝试常见的分支名
        if git ls-remote --heads origin main | grep -q main; then
            DEFAULT_BRANCH="main"
        elif git ls-remote --heads origin master | grep -q master; then
            DEFAULT_BRANCH="master"
        else
            DEFAULT_BRANCH="main"  # 默认使用main
        fi
    fi
    print_info "使用分支: $DEFAULT_BRANCH"
    git pull origin $DEFAULT_BRANCH
else
    print_info "克隆代码仓库..."
    git clone $GIT_REPO .
fi

# 7. 安装依赖
print_info "安装项目依赖..."
npm install

# 8. 构建前端
print_info "构建前端应用..."
npm run build

# 9. 创建日志目录
print_info "创建日志目录..."
mkdir -p logs

# 10. 设置环境变量
if [ ! -f ".env" ]; then
    print_warning "未找到.env文件，请手动配置环境变量"
    cp .env.production .env
    print_info "已复制.env.production为.env，请编辑配置"
fi

# 11. 启动应用
print_info "启动应用..."
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup

# 12. 配置Nginx
print_info "配置Nginx..."
cp nginx.conf /etc/nginx/sites-available/$PROJECT_NAME
ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/

# 删除默认配置
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t
if [ $? -eq 0 ]; then
    print_info "Nginx配置测试通过"
    systemctl restart nginx
    systemctl enable nginx
else
    print_error "Nginx配置测试失败，请检查配置文件"
    exit 1
fi

# 13. 设置防火墙
print_info "配置防火墙..."
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw --force enable

# 14. 数据迁移（如果需要）
if [ "$1" = "--migrate" ]; then
    print_info "执行数据迁移..."
    npm run migrate-data
    npm run create-admin
fi

# 15. 显示状态
print_info "检查服务状态..."
echo "PM2状态:"
pm2 status
echo ""
echo "Nginx状态:"
systemctl status nginx --no-pager -l

print_info "=== 部署完成 ==="
print_info "应用已启动在端口3000"
print_info "Nginx已配置反向代理"
print_info "请确保域名DNS已正确配置"
print_warning "请手动编辑.env文件配置数据库连接等信息"
print_warning "如需SSL证书，请运行: certbot --nginx -d your-domain.com"

echo ""
echo "常用命令:"
echo "  查看应用日志: pm2 logs"
echo "  重启应用: pm2 restart $PROJECT_NAME"
echo "  查看应用状态: pm2 status"
echo "  重启Nginx: systemctl restart nginx"
echo "  查看Nginx日志: tail -f /var/log/nginx/error.log"