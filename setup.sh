#!/bin/bash

# AI面试助手开发环境设置脚本

echo "🚀 设置AI面试助手开发环境..."

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_NODE_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]; then
    echo "❌ 错误: 需要Node.js版本 >= $REQUIRED_NODE_VERSION，当前版本: $NODE_VERSION"
    exit 1
fi

# 安装依赖
echo "📦 安装后端依赖..."
npm install

echo "📦 安装前端依赖..."
cd src/client && npm install && cd ../..

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件并配置必要的环境变量"
fi

echo "✅ 开发环境准备完成！"
echo ""
echo "🔧 可用的命令:"
echo "  npm run dev          - 同时启动前后端开发服务器"
echo "  npm run dev:server   - 仅启动后端服务器"
echo "  npm run dev:client   - 仅启动前端服务器"
echo "  npm run build        - 构建生产版本"
echo "  npm run seed         - 初始化数据库"
echo ""
echo "🌐 开发服务器地址:"
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:3000"
echo "  API: http://localhost:3000/api"