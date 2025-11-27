# AI面试助手 - 系统架构文档

## 1. 整体架构图

```mermaid
graph TB
    subgraph "前端层"
        A[React + TypeScript] --> B[状态管理 Zustand]
        A --> C[UI组件 Tailwind CSS]
        A --> D[路由 React Router]
        A --> E[HTTP客户端 Axios]
        A --> F[WebSocket客户端 Socket.io]
    end
    
    subgraph "API网关层"
        G[Nginx反向代理] --> H[负载均衡]
        G --> I[SSL终端]
    end
    
    subgraph "应用层"
        J[Express.js API服务器] --> K[认证中间件]
        J --> L[速率限制中间件]
        J --> M[错误处理中间件]
        J --> N[WebSocket服务器]
    end
    
    subgraph "业务逻辑层"
        O[用户管理服务] --> P[面试管理服务]
        P --> Q[题库管理服务]
        Q --> R[AI评估服务]
        R --> S[代码执行服务]
    end
    
    subgraph "数据层"
        T[MongoDB主数据库] --> U[Redis缓存]
        T --> V[文件存储]
    end
    
    subgraph "外部服务"
        W[OpenAI API] --> X[语音识别API]
        W --> Y[邮件服务]
    end
    
    A --> G
    G --> J
    J --> O
    O --> T
    R --> W
    N --> F
```

## 2. 微服务架构

```mermaid
graph LR
    subgraph "用户服务"
        A1[用户认证] --> A2[用户资料管理]
        A2 --> A3[权限控制]
    end
    
    subgraph "面试服务"
        B1[面试创建] --> B2[实时对话]
        B2 --> B3[面试评估]
        B3 --> B4[结果存储]
    end
    
    subgraph "题库服务"
        C1[题目管理] --> C2[智能生成]
        C2 --> C3[难度分级]
        C3 --> C4[搜索筛选]
    end
    
    subgraph "AI服务"
        D1[对话生成] --> D2[代码评估]
        D2 --> D3[面试反馈]
        D3 --> D4[学习建议]
    end
    
    subgraph "执行服务"
        E1[代码执行] --> E2[安全沙箱]
        E2 --> E3[结果返回]
    end
```

## 3. 数据流架构

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant A as API服务器
    participant DB as 数据库
    participant AI as AI服务
    participant CE as 代码执行
    
    U->>F: 开始面试
    F->>A: POST /api/interviews
    A->>DB: 创建面试记录
    A->>AI: 生成面试问题
    AI-->>A: 返回问题
    A-->>F: 返回面试数据
    F-->>U: 显示面试界面
    
    U->>F: 提交代码
    F->>A: POST /api/interviews/execute-code
    A->>CE: 执行代码
    CE-->>A: 返回结果
    A->>AI: 评估代码
    AI-->>A: 返回评估
    A-->>F: 返回结果
    F-->>U: 显示评估
```

## 4. 技术栈架构

### 前端技术栈
```
React 18.x
├── TypeScript 5.x
├── Vite 5.x (构建工具)
├── Tailwind CSS 3.x (样式框架)
├── React Router 6.x (路由)
├── Zustand 4.x (状态管理)
├── React Query (数据获取)
├── React Hook Form + Zod (表单验证)
├── Socket.io Client (实时通信)
├── Monaco Editor (代码编辑)
└── Axios (HTTP客户端)
```

### 后端技术栈
```
Node.js 18.x
├── TypeScript 5.x
├── Express.js 4.x (Web框架)
├── Socket.io 4.x (WebSocket)
├── MongoDB + Mongoose (数据库)
├── Redis (缓存)
├── JWT (认证)
├── OpenAI API (AI服务)
├── Docker (代码执行)
├── Winston (日志)
└── Jest (测试)
```

## 5. 安全架构

```mermaid
graph TD
    A[用户请求] --> B[SSL/TLS加密]
    B --> C[API网关]
    C --> D[速率限制]
    D --> E[JWT验证]
    E --> F[权限检查]
    F --> G[输入验证]
    G --> H[业务处理]
    H --> I[数据加密存储]
    
    J[代码执行] --> K[Docker沙箱]
    K --> L[资源限制]
    L --> M[网络隔离]
    M --> N[超时控制]
```

## 6. 部署架构

```mermaid
graph TB
    subgraph "生产环境"
        subgraph "负载均衡层"
            LB[Nginx负载均衡器]
        end
        
        subgraph "应用层"
            APP1[应用实例1]
            APP2[应用实例2]
            APP3[应用实例3]
        end
        
        subgraph "数据层"
            MONGO_PRIMARY[MongoDB主节点]
            MONGO_SECONDARY1[MongoDB从节点1]
            MONGO_SECONDARY2[MongoDB从节点2]
            REDIS_MASTER[Redis主节点]
            REDIS_SLAVE[Redis从节点]
        end
        
        subgraph "监控层"
            MONITOR[监控系统]
            LOG[日志收集]
            ALERT[告警系统]
        end
    end
    
    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 --> MONGO_PRIMARY
    APP2 --> MONGO_PRIMARY
    APP3 --> MONGO_PRIMARY
    
    MONGO_PRIMARY --> MONGO_SECONDARY1
    MONGO_PRIMARY --> MONGO_SECONDARY2
    
    APP1 --> REDIS_MASTER
    APP2 --> REDIS_MASTER
    APP3 --> REDIS_MASTER
    
    REDIS_MASTER --> REDIS_SLAVE
```

## 7. 数据库设计

### 用户表 (users)
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // 加密存储
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    experience: String, // junior, mid, senior, lead, principal
    targetRoles: [String],
    targetCompanies: [String],
    resumeUrl: String
  },
  preferences: {
    language: String, // zh-CN, en
    timezone: String,
    notifications: {
      email: Boolean,
      push: Boolean,
      interviewReminders: Boolean,
      progressUpdates: Boolean
    },
    interviewSettings: {
      defaultDuration: Number,
      defaultDifficulty: String,
      defaultInterviewType: String,
      voiceEnabled: Boolean,
      cameraEnabled: Boolean
    }
  },
  subscription: {
    plan: String, // free, premium, enterprise
    status: String, // active, cancelled, expired
    startDate: Date,
    endDate: Date,
    features: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 面试表 (interviews)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // technical, behavioral, system-design, coding
  category: String, // algorithms, data-structures, system-design
  difficulty: String, // easy, medium, hard
  questions: [ObjectId], // 题目ID数组
  duration: Number, // 面试时长(分钟)
  status: String, // scheduled, in-progress, completed, cancelled
  score: Number, // 总分
  feedback: {
    overallScore: Number,
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    detailedFeedback: String
  },
  transcript: [{
    timestamp: Number,
    speaker: String, // interviewer, candidate
    content: String,
    type: String // speech, code, action
  }],
  recordingUrl: String,
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### 题目表 (questions)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  difficulty: String,
  type: String, // coding, multiple-choice, short-answer, essay
  tags: [String],
  timeLimit: Number,
  points: Number,
  hints: [String],
  solution: {
    explanation: String,
    code: Map, // 不同语言的解决方案
    timeComplexity: String,
    spaceComplexity: String,
    approach: String
  },
  testCases: [{
    input: Mixed,
    expectedOutput: Mixed,
    description: String
  }],
  companies: [String],
  frequency: Number, // 出现频率
  createdAt: Date,
  updatedAt: Date
}
```

## 8. API设计规范

### RESTful API端点

#### 认证相关
```
POST   /api/auth/register          # 用户注册
POST   /api/auth/login             # 用户登录
POST   /api/auth/refresh-token     # 刷新Token
GET    /api/auth/profile           # 获取用户信息
PUT    /api/auth/profile           # 更新用户信息
POST   /api/auth/change-password   # 修改密码
```

#### 面试相关
```
GET    /api/interviews             # 获取面试列表
POST   /api/interviews             # 创建面试
GET    /api/interviews/:id         # 获取面试详情
POST   /api/interviews/:id/start   # 开始面试
POST   /api/interviews/:id/complete # 完成面试
POST   /api/interviews/:id/pause   # 暂停面试
POST   /api/interviews/:id/resume  # 恢复面试
POST   /api/interviews/:id/cancel  # 取消面试
POST   /api/interviews/execute-code # 执行代码
POST   /api/interviews/evaluate-code # 评估代码
GET    /api/interviews/stats       # 获取统计数据
```

#### 题目相关
```
GET    /api/questions              # 获取题目列表
GET    /api/questions/:id          # 获取题目详情
POST   /api/questions              # 创建题目
PUT    /api/questions/:id          # 更新题目
DELETE /api/questions/:id          # 删除题目
GET    /api/questions/random       # 获取随机题目
POST   /api/questions/generate     # 生成题目
GET    /api/questions/categories   # 获取分类列表
GET    /api/questions/tags         # 获取标签列表
```

### WebSocket事件

#### 面试室事件
```javascript
// 客户端发送
{
  event: 'join-interview',
  data: { interviewId: String }
}

{
  event: 'voice-data',
  data: { interviewId: String, audioData: Buffer, language: String }
}

{
  event: 'chat-message',
  data: { interviewId: String, message: String, type: String }
}

{
  event: 'code-change',
  data: { interviewId: String, code: String, language: String }
}

// 服务端发送
{
  event: 'ai-response',
  data: { transcript: String, response: String, timestamp: Number }
}

{
  event: 'code-change',
  data: { userId: String, code: String, language: String, timestamp: Number }
}

{
  event: 'interview-event',
  data: { userId: String, event: String, payload: Object, timestamp: Number }
}
```

## 9. 性能优化策略

### 前端优化
- **代码分割**: 使用React.lazy和Suspense进行路由级别的代码分割
- **缓存策略**: React Query缓存API响应数据
- **图片优化**: 使用WebP格式和懒加载
- **Bundle优化**: Vite构建优化，Tree Shaking
- **CDN加速**: 静态资源CDN分发

### 后端优化
- **数据库索引**: MongoDB复合索引优化查询
- **Redis缓存**: 热点数据缓存，减少数据库压力
- **连接池**: MongoDB连接池管理
- **压缩**: Gzip响应压缩
- **限流**: API请求频率限制

### 系统优化
- **负载均衡**: Nginx upstream负载均衡
- **水平扩展**: 无状态应用设计，支持多实例部署
- **监控告警**: 实时监控系统性能和错误
- **日志管理**: 结构化日志，便于分析和排查

## 10. 监控和运维

### 监控指标
- **系统指标**: CPU、内存、磁盘、网络使用率
- **应用指标**: 请求量、响应时间、错误率
- **业务指标**: 用户活跃度、面试完成率、代码执行成功率
- **数据库指标**: 连接数、查询性能、索引效率

### 日志管理
```javascript
// 日志级别和格式
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "User login successful",
  "userId": "507f1f77bcf86cd799439011",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req-123456",
  "duration": 150
}
```

### 告警规则
- **错误率告警**: 5分钟内错误率超过5%
- **响应时间告警**: 95%请求响应时间超过2秒
- **资源使用告警**: CPU使用率超过80%
- **业务指标告警**: 面试失败率超过10%