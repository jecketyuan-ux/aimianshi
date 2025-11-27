# AI面试助手 - 开发指南

## 项目概述

这是一个基于AI的智能面试助手平台，提供编程面试、技术面试、算法面试练习。支持多种编程语言，实时语音交互，帮助求职者提升面试技能。

## 技术栈

### 后端
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- Socket.io (WebSocket)
- OpenAI API
- JWT认证
- Docker (代码执行环境)

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (状态管理)
- React Query
- React Hook Form + Zod
- Monaco Editor (代码编辑器)

## 项目结构

```
aimianshi/
├── src/
│   ├── server/                 # 后端代码
│   │   ├── controllers/        # 控制器
│   │   ├── middleware/         # 中间件
│   │   ├── models/            # 数据模型
│   │   ├── routes/            # 路由
│   │   ├── services/          # 业务逻辑
│   │   ├── sockets/           # WebSocket处理
│   │   ├── utils/             # 工具函数
│   │   └── scripts/           # 脚本
│   ├── client/                # 前端代码
│   │   ├── src/
│   │   │   ├── components/    # React组件
│   │   │   ├── pages/        # 页面组件
│   │   │   ├── store/        # 状态管理
│   │   │   ├── utils/        # 工具函数
│   │   │   ├── types/        # TypeScript类型
│   │   │   └── styles/       # 样式文件
│   │   └── public/           # 静态资源
│   └── shared/               # 共享代码
│       ├── types/           # 共享类型定义
│       └── config/          # 配置文件
├── logs/                    # 日志文件
├── uploads/                 # 上传文件
├── public/                  # 公共文件
└── docs/                   # 文档
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Docker (可选，用于代码执行)

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd src/client
npm install
cd ../..
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置必要的环境变量：
- `MONGODB_URI`: MongoDB连接字符串
- `JWT_SECRET`: JWT密钥
- `OPENAI_API_KEY`: OpenAI API密钥

### 数据库初始化

```bash
# 运行数据库种子脚本
npm run seed
```

### 启动开发服务器

```bash
# 同时启动前后端服务器
npm run dev

# 或者分别启动
npm run dev:server  # 后端服务器 (端口3000)
npm run dev:client  # 前端服务器 (端口5173)
```

访问应用：
- 前端：http://localhost:5173
- 后端API：http://localhost:3000/api

## 功能特性

### 🎯 核心功能
- **AI面试官**: 基于GPT-4的智能面试对话
- **代码执行**: 支持多种编程语言的在线编程
- **实时反馈**: 即时评估和改进建议
- **语音交互**: 语音识别和合成
- **面试记录**: 完整的面试历史和回放

### 📚 题库系统
- **丰富题库**: 算法、数据结构、系统设计等
- **难度分级**: 简单、中等、困难
- **分类筛选**: 按类别、标签、公司筛选
- **智能生成**: AI生成个性化题目

### 📊 数据分析
- **进度跟踪**: 学习进度和技能提升
- **统计报告**: 详细的面试表现分析
- **个性化建议**: 基于AI的改进建议
- **成就系统**: 学习成就和徽章

### 🎨 用户体验
- **响应式设计**: 支持桌面和移动设备
- **暗色模式**: 护眼的深色主题
- **多语言**: 中英文界面支持
- **无障碍**: 符合WCAG标准

## API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息

### 面试相关
- `GET /api/interviews` - 获取面试列表
- `POST /api/interviews` - 创建面试
- `POST /api/interviews/:id/start` - 开始面试
- `POST /api/interviews/:id/complete` - 完成面试
- `POST /api/interviews/execute-code` - 执行代码

### 题目相关
- `GET /api/questions` - 获取题目列表
- `GET /api/questions/:id` - 获取题目详情
- `POST /api/questions/generate` - 生成题目

## 开发指南

### 代码规范
- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier配置
- 组件使用函数式组件和Hooks
- API使用RESTful设计原则

### 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 测试
```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 构建
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 部署

### Docker部署
```bash
# 构建镜像
docker build -t aimianshi .

# 运行容器
docker run -p 3000:3000 aimianshi
```

### 环境变量
生产环境需要配置以下关键环境变量：
- `NODE_ENV=production`
- `MONGODB_URI`: 生产数据库连接
- `JWT_SECRET`: 安全的JWT密钥
- `OPENAI_API_KEY`: OpenAI API密钥

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如有问题或建议，请：
1. 查看[文档](docs/)
2. 搜索[Issues](https://github.com/your-repo/aimianshi/issues)
3. 创建新的Issue

## 更新日志

查看[CHANGELOG.md](CHANGELOG.md)了解版本更新详情。