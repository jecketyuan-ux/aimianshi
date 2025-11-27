#!/bin/bash

# AI面试助手部署脚本

set -e

echo "🚀 开始部署AI面试助手..."

# 检查环境变量
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ 错误: 请设置OPENAI_API_KEY环境变量"
    exit 1
fi

# 创建必要的目录
mkdir -p logs uploads public

# 构建Docker镜像
echo "📦 构建Docker镜像..."
docker-compose build

# 启动服务
echo "🔄 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 运行数据库种子
echo "🌱 初始化数据库..."
docker-compose exec app npm run seed

echo "✅ 部署完成！"
echo "🌐 应用地址: http://localhost"
echo "📊 API文档: http://localhost/api/health"