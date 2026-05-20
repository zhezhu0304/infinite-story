#!/bin/bash
# 阿里云服务器一键部署脚本
set -e

echo "=== 1. 安装 Docker ==="
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
    echo "Docker 安装完成"
else
    echo "Docker 已安装，跳过"
fi

echo "=== 2. 安装 Docker Compose ==="
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose 安装完成"
else
    echo "Docker Compose 已安装，跳过"
fi

echo "=== 3. 克隆项目 ==="
cd /opt
rm -rf infinite-story
git clone https://github.com/zhezhu0304/infinite-story.git
cd infinite-story

echo "=== 4. 创建环境配置 ==="
cat > .env.production << 'EOF'
NEXTAUTH_SECRET=X1ZknkyRTbrNjRD4NhlS43gHGft/6JTg24jKQQLbcpY=
NEXTAUTH_URL=http://47.80.57.180:3000
NEXT_PUBLIC_BASE_URL=http://47.80.57.180:3000
MINIMAX_API_KEY=sk-cp-S2dopcQTvUUKdmhz4qkx_kRTOrlaB0oY5khtu-OzdUrh16LTpCL92tvv6oknGLubWb7WPBAlUKPOG8ZoCUi8PU_WTZ5GCOPuyFbSgJL2V0C2RprnE27LkLs
MINIMAX_GROUP_ID=
DATABASE_URL=file:/app/data/prod.db
EOF
echo "环境配置已创建"

echo "=== 5. 构建并启动 ==="
docker-compose build
docker-compose up -d

echo "=== 6. 检查状态 ==="
sleep 3
docker-compose ps

echo ""
echo "=========================================="
echo "部署完成！"
echo "访问地址: http://47.80.57.180:3000"
echo "=========================================="
