# AI面试助手 - 系统设计文档

## 1. 系统架构图

### 1.1 整体架构图

```mermaid
graph TB
    subgraph "客户端层"
        U1[Web浏览器]
        U2[移动浏览器]
        U3[桌面应用]
    end
    
    subgraph "CDN层"
        CDN[内容分发网络]
    end
    
    subgraph "负载均衡层"
        LB[Nginx负载均衡器]
        SSL[SSL终端]
    end
    
    subgraph "应用层"
        APP1[Node.js实例1]
        APP2[Node.js实例2]
        APP3[Node.js实例3]
        WS[WebSocket服务器]
    end
    
    subgraph "业务服务层"
        AUTH[认证服务]
        INTERVIEW[面试服务]
        QUESTION[题库服务]
        AI[AI评估服务]
        CODE[代码执行服务]
    end
    
    subgraph "数据层"
        MONGO_PRIMARY[(MongoDB主节点)]
        MONGO_SECONDARY1[(MongoDB从节点1)]
        MONGO_SECONDARY2[(MongoDB从节点2)]
        REDIS_MASTER[(Redis主节点)]
        REDIS_SLAVE[(Redis从节点)]
        FILES[文件存储]
    end
    
    subgraph "外部服务"
        OPENAI[OpenAI API]
        SPEECH[语音识别API]
        EMAIL[邮件服务]
    end
    
    subgraph "监控层"
        PROMETHEUS[Prometheus]
        GRAFANA[Grafana]
        ELASTICSEARCH[Elasticsearch]
        KIBANA[Kibana]
    end

    U1 --> CDN
    U2 --> CDN
    U3 --> CDN
    
    CDN --> LB
    LB --> SSL
    SSL --> APP1
    SSL --> APP2
    SSL --> APP3
    
    APP1 --> AUTH
    APP2 --> AUTH
    APP3 --> AUTH
    
    APP1 --> INTERVIEW
    APP2 --> INTERVIEW
    APP3 --> INTERVIEW
    
    INTERVIEW --> QUESTION
    INTERVIEW --> AI
    INTERVIEW --> CODE
    
    AUTH --> MONGO_PRIMARY
    QUESTION --> MONGO_PRIMARY
    AI --> MONGO_PRIMARY
    CODE --> FILES
    
    AUTH --> REDIS_MASTER
    INTERVIEW --> REDIS_MASTER
    QUESTION --> REDIS_MASTER
    
    REDIS_MASTER --> REDIS_SLAVE
    
    MONGO_PRIMARY --> MONGO_SECONDARY1
    MONGO_PRIMARY --> MONGO_SECONDARY2
    
    AI --> OPENAI
    AI --> SPEECH
    AUTH --> EMAIL
    
    APP1 --> PROMETHEUS
    APP2 --> PROMETHEUS
    APP3 --> PROMETHEUS
    
    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ELASTICSEARCH
    ELASTICSEARCH --> KIBANA
```

### 1.2 微服务架构图

```mermaid
graph LR
    subgraph "API网关"
        GATEWAY[API Gateway]
    end
    
    subgraph "核心服务"
        AUTH_SVC[认证服务]
        INTERVIEW_SVC[面试服务]
        QUESTION_SVC[题库服务]
        USER_SVC[用户服务]
    end
    
    subgraph "支撑服务"
        AI_SVC[AI评估服务]
        CODE_SVC[代码执行服务]
        NOTIFY_SVC[通知服务]
        ANALYTICS_SVC[分析服务]
    end
    
    subgraph "数据存储"
        USER_DB[(用户数据库)]
        INTERVIEW_DB[(面试数据库)]
        QUESTION_DB[(题库数据库)]
        CACHE[(Redis缓存)]
        FILES[(文件存储)]
    end
    
    subgraph "外部集成"
        OPENAI_EXT[OpenAI API]
        SPEECH_EXT[语音识别API]
        EMAIL_EXT[邮件服务]
    end
    
    GATEWAY --> AUTH_SVC
    GATEWAY --> INTERVIEW_SVC
    GATEWAY --> QUESTION_SVC
    GATEWAY --> USER_SVC
    
    AUTH_SVC --> USER_DB
    INTERVIEW_SVC --> INTERVIEW_DB
    QUESTION_SVC --> QUESTION_DB
    
    INTERVIEW_SVC --> AI_SVC
    INTERVIEW_SVC --> CODE_SVC
    INTERVIEW_SVC --> NOTIFY_SVC
    
    AUTH_SVC --> CACHE
    INTERVIEW_SVC --> CACHE
    QUESTION_SVC --> CACHE
    
    AI_SVC --> OPENAI_EXT
    AI_SVC --> SPEECH_EXT
    
    NOTIFY_SVC --> EMAIL_EXT
    
    CODE_SVC --> FILES
    USER_SVC --> FILES
```

## 2. 数据库设计图

### 2.1 数据模型关系图

```mermaid
erDiagram
    User ||--o{ Interview : creates
    User ||--o{ UserSession : has
    User ||--o{ UserProgress : tracks
    
    Interview ||--o{ InterviewQuestion : contains
    Interview ||--o{ InterviewFeedback : generates
    Interview ||--o{ Transcript : records
    
    Question ||--o{ InterviewQuestion : used_in
    Question ||--o{ TestCase : has
    Question ||--o{ Solution : has
    Question ||--o{ QuestionHint : provides
    
    Category ||--o{ Question : categorizes
    Company ||--o{ Question : appears_in
    
    User {
        ObjectId _id PK
        string username UK
        string email UK
        string password
        Object profile
        Object preferences
        Object subscription
        Date createdAt
        Date updatedAt
    }
    
    Interview {
        ObjectId _id PK
        ObjectId userId FK
        string type
        string category
        string difficulty
        Array questionIds
        number duration
        string status
        number score
        Object feedback
        Array transcript
        string recordingUrl
        Date createdAt
        Date updatedAt
        Date completedAt
    }
    
    Question {
        ObjectId _id PK
        string title
        string description
        string category FK
        string difficulty
        string type
        Array tags
        number timeLimit
        number points
        Array hints
        Object solution
        Array testCases
        Array companies
        number frequency
        Date createdAt
        Date updatedAt
    }
```

### 2.2 数据流程图

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant A as API服务器
    participant M as MongoDB
    participant R as Redis
    participant AI as AI服务
    participant C as 代码执行
    
    U->>F: 开始面试
    F->>A: POST /api/interviews
    A->>R: 检查用户缓存
    A->>M: 创建面试记录
    A->>AI: 生成面试问题
    AI-->>A: 返回问题列表
    A->>M: 保存面试问题
    A->>R: 缓存面试数据
    A-->>F: 返回面试信息
    F-->>U: 显示面试界面
    
    U->>F: 提交代码
    F->>A: POST /api/interviews/execute-code
    A->>C: 发送代码到执行服务
    C->>C: 在Docker中执行代码
    C-->>A: 返回执行结果
    A->>AI: 请求代码评估
    AI-->>A: 返回评估结果
    A->>M: 保存面试进度
    A-->>F: 返回评估结果
    F-->>U: 显示评估结果
```

## 3. 安全架构图

```mermaid
graph TD
    subgraph "网络安全层"
        WAF[Web应用防火墙]
        DDoS[DDoS防护]
        SSL[SSL/TLS加密]
    end
    
    subgraph "应用安全层"
        AUTH[JWT认证]
        RBAC[基于角色的访问控制]
        RATE[API限流]
        VALIDATE[输入验证]
        SANITIZE[数据清理]
        ESCAPE[XSS防护]
    end
    
    subgraph "数据安全层"
        ENCRYPT[数据加密]
        HASH[密码哈希]
        BACKUP[数据备份]
        AUDIT[审计日志]
    end
    
    subgraph "基础设施安全层"
        DOCKER[Docker安全]
        NETWORK[网络隔离]
        MONITOR[安全监控]
        SCAN[漏洞扫描]
    end
    
    WAF --> AUTH
    DDoS --> RATE
    SSL --> ESCAPE
    
    AUTH --> RBAC
    AUTH --> VALIDATE
    RATE --> SANITIZE
    
    VALIDATE --> ENCRYPT
    SANITIZE --> HASH
    ESCAPE --> AUDIT
    
    ENCRYPT --> BACKUP
    HASH --> AUDIT
    AUDIT --> MONITOR
    
    DOCKER --> NETWORK
    NETWORK --> SCAN
    SCAN --> MONITOR
```

## 4. 部署架构图

### 4.1 生产环境部署架构

```mermaid
graph TB
    subgraph "负载均衡层"
        LB1[Nginx主负载均衡器]
        LB2[Nginx备用负载均衡器]
        DNS[DNS负载均衡]
    end
    
    subgraph "应用集群"
        subgraph "可用区A"
            APP_A1[Node.js实例1]
            APP_A2[Node.js实例2]
            APP_A3[Node.js实例3]
        end
        
        subgraph "可用区B"
            APP_B1[Node.js实例4]
            APP_B2[Node.js实例5]
            APP_B3[Node.js实例6]
        end
    end
    
    subgraph "数据库集群"
        subgraph "MongoDB副本集"
            MONGO_PRIMARY[(MongoDB主节点)]
            MONGO_SECONDARY1[(MongoDB从节点1)]
            MONGO_SECONDARY2[(MongoDB从节点2)]
            MONGO_ARBITER[(MongoDB仲裁节点)]
        end
        
        subgraph "Redis集群"
            REDIS_MASTER[(Redis主节点)]
            REDIS_SLAVE1[(Redis从节点1)]
            REDIS_SLAVE2[(Redis从节点2)]
            REDIS_SENTINEL[(Redis哨兵)]
        end
    end
    
    subgraph "存储层"
        S3[AWS S3对象存储]
        NFS[网络文件系统]
        BACKUP[备份存储]
    end
    
    subgraph "监控层"
        PROMETHEUS[Prometheus集群]
        GRAFANA[Grafana集群]
        ELK[ELK Stack]
        ALERTMANAGER[AlertManager]
    end
    
    DNS --> LB1
    DNS --> LB2
    
    LB1 --> APP_A1
    LB1 --> APP_A2
    LB1 --> APP_A3
    
    LB2 --> APP_B1
    LB2 --> APP_B2
    LB2 --> APP_B3
    
    APP_A1 --> MONGO_PRIMARY
    APP_A2 --> MONGO_PRIMARY
    APP_A3 --> MONGO_PRIMARY
    
    APP_B1 --> MONGO_PRIMARY
    APP_B2 --> MONGO_PRIMARY
    APP_B3 --> MONGO_PRIMARY
    
    MONGO_PRIMARY --> MONGO_SECONDARY1
    MONGO_PRIMARY --> MONGO_SECONDARY2
    MONGO_PRIMARY --> MONGO_ARBITER
    
    APP_A1 --> REDIS_MASTER
    APP_A2 --> REDIS_MASTER
    APP_A3 --> REDIS_MASTER
    
    APP_B1 --> REDIS_MASTER
    APP_B2 --> REDIS_MASTER
    APP_B3 --> REDIS_MASTER
    
    REDIS_MASTER --> REDIS_SLAVE1
    REDIS_MASTER --> REDIS_SLAVE2
    REDIS_SENTINEL --> REDIS_MASTER
    
    APP_A1 --> S3
    APP_A2 --> S3
    APP_A3 --> S3
    
    APP_B1 --> NFS
    APP_B2 --> NFS
    APP_B3 --> NFS
    
    S3 --> BACKUP
    NFS --> BACKUP
    
    APP_A1 --> PROMETHEUS
    APP_A2 --> PROMETHEUS
    APP_A3 --> PROMETHEUS
    
    APP_B1 --> PROMETHEUS
    APP_B2 --> PROMETHEUS
    APP_B3 --> PROMETHEUS
    
    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ELK
    PROMETHEUS --> ALERTMANAGER
```

### 4.2 容器化部署架构

```mermaid
graph TB
    subgraph "Kubernetes集群"
        subgraph "Master节点"
            API_SERVER[API Server]
            CONTROLLER[Controller Manager]
            SCHEDULER[Scheduler]
            ETCD[etcd集群]
        end
        
        subgraph "Worker节点1"
            KUBELET1[Kubelet]
            KUBE_PROXY1[Kube-proxy]
            POD1_1[应用Pod1]
            POD1_2[应用Pod2]
            POD1_3[数据库Pod]
        end
        
        subgraph "Worker节点2"
            KUBELET2[Kubelet]
            KUBE_PROXY2[Kube-proxy]
            POD2_1[应用Pod3]
            POD2_2[应用Pod4]
            POD2_3[缓存Pod]
        end
        
        subgraph "Worker节点3"
            KUBELET3[Kubelet]
            KUBE_PROXY3[Kube-proxy]
            POD3_1[负载均衡Pod]
            POD3_2[监控Pod]
            POD3_3[日志Pod]
        end
    end
    
    subgraph "服务层"
        SVC_APP[应用服务]
        SVC_DB[数据库服务]
        SVC_CACHE[缓存服务]
        SVC_LB[负载均衡服务]
    end
    
    subgraph "存储层"
        PVC_DB[数据库持久卷]
        PVC_CACHE[缓存持久卷]
        PVC_FILES[文件持久卷]
        STORAGE_CLASS[存储类]
    end
    
    subgraph "网络层"
        INGRESS[Ingress控制器]
        NETWORK_POLICY[网络策略]
        SERVICE_MESH[服务网格]
    end
    
    API_SERVER --> CONTROLLER
    API_SERVER --> SCHEDULER
    API_SERVER --> ETCD
    
    CONTROLLER --> KUBELET1
    CONTROLLER --> KUBELET2
    CONTROLLER --> KUBELET3
    
    KUBELET1 --> KUBE_PROXY1
    KUBELET2 --> KUBE_PROXY2
    KUBELET3 --> KUBE_PROXY3
    
    KUBE_PROXY1 --> POD1_1
    KUBE_PROXY1 --> POD1_2
    KUBE_PROXY1 --> POD1_3
    
    KUBE_PROXY2 --> POD2_1
    KUBE_PROXY2 --> POD2_2
    KUBE_PROXY2 --> POD2_3
    
    KUBE_PROXY3 --> POD3_1
    KUBE_PROXY3 --> POD3_2
    KUBE_PROXY3 --> POD3_3
    
    POD1_1 --> SVC_APP
    POD1_2 --> SVC_APP
    POD2_1 --> SVC_APP
    POD2_2 --> SVC_APP
    
    POD1_3 --> SVC_DB
    POD2_3 --> SVC_CACHE
    POD3_3 --> SVC_LB
    
    SVC_APP --> INGRESS
    SVC_LB --> INGRESS
    
    SVC_DB --> PVC_DB
    SVC_CACHE --> PVC_CACHE
    SVC_APP --> PVC_FILES
    
    PVC_DB --> STORAGE_CLASS
    PVC_CACHE --> STORAGE_CLASS
    PVC_FILES --> STORAGE_CLASS
```

## 5. 技术架构图

### 5.1 前端技术架构

```mermaid
graph TB
    subgraph "用户界面层"
        BROWSER[浏览器]
        MOBILE[移动浏览器]
        DESKTOP[桌面应用]
    end
    
    subgraph "前端框架层"
        REACT[React 18]
        TYPESCRIPT[TypeScript]
        VITE[Vite构建工具]
    end
    
    subgraph "状态管理层"
        ZUSTAND[Zustand状态管理]
        REACT_QUERY[React Query数据获取]
        PERSIST[Zustand Persist]
    end
    
    subgraph "路由层"
        REACT_ROUTER[React Router v6]
        PROTECTED[Protected Routes]
        PUBLIC[Public Routes]
    end
    
    subgraph "UI组件层"
        TAILWIND[Tailwind CSS]
        HEADLESS_UI[Headless UI组件]
        MONACO[Monaco Editor]
        CUSTOM[自定义组件]
    end
    
    subgraph "工具层"
        AXIOS[Axios HTTP客户端]
        SOCKET_CLIENT[Socket.io Client]
        FORM[React Hook Form]
        VALIDATION[Zod验证]
    end
    
    subgraph "构建工具层"
        ESLINT[ESLint代码检查]
        PRETTIER[Prettier代码格式化]
        POSTCSS[PostCSS处理]
        AUTO_PREFIXER[Autoprefixer]
    end
    
    BROWSER --> REACT
    MOBILE --> REACT
    DESKTOP --> REACT
    
    REACT --> TYPESCRIPT
    REACT --> VITE
    
    TYPESCRIPT --> ZUSTAND
    ZUSTAND --> REACT_QUERY
    ZUSTAND --> PERSIST
    
    REACT --> REACT_ROUTER
    REACT_ROUTER --> PROTECTED
    REACT_ROUTER --> PUBLIC
    
    REACT --> TAILWIND
    TAILWIND --> HEADLESS_UI
    HEADLESS_UI --> MONACO
    HEADLESS_UI --> CUSTOM
    
    ZUSTAND --> AXIOS
    REACT_QUERY --> AXIOS
    AXIOS --> SOCKET_CLIENT
    FORM --> VALIDATION
    
    VITE --> ESLINT
    VITE --> PRETTIER
    PRETTIER --> POSTCSS
    POSTCSS --> AUTO_PREFIXER
```

### 5.2 后端技术架构

```mermaid
graph TB
    subgraph "API框架层"
        EXPRESS[Express.js]
        TYPESCRIPT_SERVER[TypeScript]
        NODEJS[Node.js 18]
    end
    
    subgraph "中间件层"
        HELMET[Helmet安全头]
        CORS[CORS处理]
        RATE_LIMIT[速率限制]
        AUTH_MID[认证中间件]
        VALIDATE_MID[验证中间件]
        ERROR_MID[错误处理]
    end
    
    subgraph "路由层"
        AUTH_ROUTES[认证路由]
        INTERVIEW_ROUTES[面试路由]
        QUESTION_ROUTES[题库路由]
        USER_ROUTES[用户路由]
    end
    
    subgraph "控制器层"
        AUTH_CONTROLLER[认证控制器]
        INTERVIEW_CONTROLLER[面试控制器]
        QUESTION_CONTROLLER[题库控制器]
        USER_CONTROLLER[用户控制器]
    end
    
    subgraph "服务层"
        AUTH_SERVICE[认证服务]
        INTERVIEW_SERVICE[面试服务]
        QUESTION_SERVICE[题库服务]
        AI_SERVICE[AI服务]
        CODE_SERVICE[代码执行服务]
    end
    
    subgraph "数据访问层"
        MONGOOSE[Mongoose ODM]
        REDIS_CLIENT[Redis客户端]
        MODELS[数据模型]
    end
    
    subgraph "外部集成层"
        OPENAI_CLIENT[OpenAI客户端]
        DOCKER_CLIENT[Docker客户端]
        EMAIL_CLIENT[邮件客户端]
        SOCKET_SERVER[Socket.io服务器]
    end
    
    subgraph "工具层"
        WINSTON[Winston日志]
        JEST[Jest测试框架]
        ESLINT_SERVER[ESLint服务端]
        NODEMON[Nodemon热重载]
    end
    
    EXPRESS --> TYPESCRIPT_SERVER
    EXPRESS --> NODEJS
    
    EXPRESS --> HELMET
    EXPRESS --> CORS
    EXPRESS --> RATE_LIMIT
    EXPRESS --> AUTH_MID
    EXPRESS --> VALIDATE_MID
    EXPRESS --> ERROR_MID
    
    AUTH_MID --> AUTH_ROUTES
    RATE_LIMIT --> INTERVIEW_ROUTES
    VALIDATE_MID --> QUESTION_ROUTES
    ERROR_MID --> USER_ROUTES
    
    AUTH_ROUTES --> AUTH_CONTROLLER
    INTERVIEW_ROUTES --> INTERVIEW_CONTROLLER
    QUESTION_ROUTES --> QUESTION_CONTROLLER
    USER_ROUTES --> USER_CONTROLLER
    
    AUTH_CONTROLLER --> AUTH_SERVICE
    INTERVIEW_CONTROLLER --> INTERVIEW_SERVICE
    QUESTION_CONTROLLER --> QUESTION_SERVICE
    USER_CONTROLLER --> AUTH_SERVICE
    
    AUTH_SERVICE --> MONGOOSE
    INTERVIEW_SERVICE --> MONGOOSE
    QUESTION_SERVICE --> MONGOOSE
    
    AUTH_SERVICE --> REDIS_CLIENT
    INTERVIEW_SERVICE --> REDIS_CLIENT
    QUESTION_SERVICE --> REDIS_CLIENT
    
    AI_SERVICE --> OPENAI_CLIENT
    CODE_SERVICE --> DOCKER_CLIENT
    AUTH_SERVICE --> EMAIL_CLIENT
    
    INTERVIEW_SERVICE --> SOCKET_SERVER
    
    MONGOOSE --> MODELS
    
    AUTH_SERVICE --> WINSTON
    INTERVIEW_SERVICE --> WINSTON
    QUESTION_SERVICE --> WINSTON
    
    NODEJS --> JEST
    NODEJS --> ESLINT_SERVER
    NODEJS --> NODEMON
```

## 6. 业务流程图

### 6.1 用户面试流程图

```mermaid
flowchart TD
    A[用户访问系统] --> B{是否已登录?}
    B -->|否| C[显示登录页面]
    B -->|是| D[进入仪表板]
    
    C --> E[用户注册/登录]
    E --> F[JWT认证]
    F --> G[获取用户信息]
    G --> H[进入仪表板]
    
    D --> I[选择创建面试]
    I --> J[配置面试参数]
    J --> K[选择面试类型]
    K --> L[选择技术领域]
    L --> M[选择难度级别]
    M --> N[设置面试时长]
    N --> O[创建面试]
    
    O --> P[进入面试界面]
    P --> Q[显示面试问题]
    Q --> R{用户回答类型}
    R -->|文本回答| S[文本输入处理]
    R -->|语音回答| T[语音识别处理]
    R -->|代码回答| U[代码编辑处理]
    
    S --> V[AI文本理解]
    T --> W[AI语音理解]
    U --> X[代码执行]
    
    V --> Y[AI生成回复]
    W --> Y
    X --> Z[AI代码评估]
    
    Y --> AA[显示AI回复]
    Z --> BB[显示评估结果]
    
    AA --> CC{还有问题?}
    BB --> CC
    CC -->|是| Q
    CC -->|否| DD[完成面试]
    
    DD --> EE[生成面试报告]
    EE --> FF[AI综合评估]
    FF --> GG[保存面试记录]
    GG --> HH[更新用户统计]
    HH --> II[返回仪表板]
```

### 6.2 AI评估流程图

```mermaid
flowchart TD
    A[接收用户输入] --> B[输入预处理]
    B --> C[数据清理和验证]
    C --> D[提取关键信息]
    
    D --> E{输入类型判断}
    E -->|代码回答| F[代码分析流程]
    E -->|文本回答| G[文本分析流程]
    
    F --> H[语法检查]
    H --> I[逻辑分析]
    I --> J[性能评估]
    J --> K[最佳实践检查]
    K --> L[生成代码评估]
    
    G --> M[语义理解]
    M --> N[逻辑性分析]
    N --> O[完整性检查]
    O --> P[表达清晰度评估]
    P --> Q[生成文本评估]
    
    L --> R[综合评估分析]
    Q --> R
    R --> S[计算各项得分]
    
    S --> T[生成改进建议]
    S --> U[生成学习路径]
    T --> V[返回评估结果]
```

## 7. 系统集成图

### 7.1 第三方服务集成

```mermaid
graph LR
    subgraph "AI服务集成"
        OPENAI_API[OpenAI API]
        WHISPER[Whisper语音识别]
        GPT_4[GPT-4模型]
        EMBEDDING[嵌入模型]
    end
    
    subgraph "通信服务集成"
        SENDGRID[SendGrid邮件]
        TWILIO[Twilio短信]
        PUSHY[Push推送服务]
        WEBHOOK[Webhook通知]
    end
    
    subgraph "存储服务集成"
        AWS_S3[AWS S3对象存储]
        CLOUDINARY[Cloudinary图片处理]
        BACKUP_BLAZE[Backblaze备份]
    end
    
    subgraph "监控服务集成"
        DATADOG[DataDog监控]
        SENTRY[Sentry错误追踪]
        PAGERDUTY[PagerDuty告警]
        UPTIME_ROBOT[Uptime监控]
    end
    
    subgraph "支付服务集成"
        STRIPE[Stripe支付]
        PAYPAL[PayPal支付]
        ALIPAY[支付宝]
        WECHAT_PAY[微信支付]
    end
    
    subgraph "AI面试助手"
        AIMIANSHI[AI面试助手系统]
    end
    
    AIMIANSHI --> OPENAI_API
    AIMIANSHI --> SENDGRID
    AIMIANSHI --> TWILIO
    AIMIANSHI --> AWS_S3
    AIMIANSHI --> DATADOG
    AIMIANSHI --> SENTRY
    AIMIANSHI --> STRIPE
    
    OPENAI_API --> WHISPER
    OPENAI_API --> GPT_4
    OPENAI_API --> EMBEDDING
    
    SENDGRID --> WEBHOOK
    TWILIO --> PUSHY
    AWS_S3 --> CLOUDINARY
    CLOUDINARY --> BACKUP_BLAZE
    
    DATADOG --> PAGERDUTY
    SENTRY --> UPTIME_ROBOT
    
    STRIPE --> PAYPAL
    PAYPAL --> ALIPAY
    ALIPAY --> WECHAT_PAY
```

这个设计文档提供了完整的系统架构、数据库设计、安全架构、部署架构、技术架构、业务流程和系统集成的详细图表和说明，为系统的开发、部署和运维提供了全面的指导。