# AI面试助手 - 部署手册

## 📋 目录

1. [部署概述](#部署概述)
2. [环境准备](#环境准备)
3. [本地部署](#本地部署)
4. [Docker部署](#docker部署)
5. [云服务器部署](#云服务器部署)
6. [CI/CD部署](#cicd部署)
7. [监控配置](#监控配置)
8. [故障排查](#故障排查)

## 🎯 部署概述

### 系统架构
```mermaid
graph TB
    subgraph "负载均衡层"
        LB[Nginx负载均衡器]
    end
    
    subgraph "应用层"
        APP1[Node.js应用实例1]
        APP2[Node.js应用实例2]
        APP3[Node.js应用实例3]
    end
    
    subgraph "数据层"
        MONGO[MongoDB集群]
        REDIS[Redis集群]
    end
    
    subgraph "外部服务"
        OPENAI[OpenAI API]
        CDN[内容分发网络]
    end
    
    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 --> MONGO
    APP2 --> MONGO
    APP3 --> MONGO
    
    APP1 --> REDIS
    APP2 --> REDIS
    APP3 --> REDIS
    
    APP1 --> OPENAI
    APP2 --> OPENAI
    APP3 --> OPENAI
```

### 部署要求

#### 最低配置
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 20GB SSD
- **网络**: 10Mbps带宽
- **操作系统**: Ubuntu 20.04+ / CentOS 8+

#### 推荐配置
- **CPU**: 4核心以上
- **内存**: 8GB RAM以上
- **存储**: 50GB SSD以上
- **网络**: 100Mbps带宽以上
- **负载均衡**: Nginx + SSL证书

#### 软件依赖
```bash
# 基础环境
Node.js >= 18.0.0
Docker >= 20.10.0
Docker Compose >= 2.0.0
Git >= 2.30.0

# 数据库
MongoDB >= 5.0
Redis >= 6.0

# Web服务器
Nginx >= 1.20
```

## 🔧 环境准备

### 1. 服务器初始化

#### 更新系统
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### 安装Docker
```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

#### 安装Node.js（开发环境）
```bash
# 使用NodeSource仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 防火墙配置

#### Ubuntu UFW
```bash
# 基础端口开放
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 27017/tcp # MongoDB (内网)
sudo ufw allow 6379/tcp  # Redis (内网)

# 启用防火墙
sudo ufw enable
```

#### CentOS firewalld
```bash
# 开放端口
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. SSL证书配置

#### Let's Encrypt免费证书
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 自签名证书（开发环境）
```bash
# 生成私钥
sudo openssl genrsa -out /etc/ssl/private/nginx-selfsigned.key 2048

# 生成证书
sudo openssl req -new -x509 -key /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -days 365
```

## 🏠 本地部署

### 1. 克隆项目
```bash
# 克隆代码仓库
git clone https://github.com/your-org/aimianshi.git
cd aimianshi

# 切换到生产分支
git checkout main
```

### 2. 环境配置
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑环境变量
nano .env
```

#### 关键环境变量
```bash
NODE_ENV=production
PORT=3000

# 数据库配置
MONGODB_URI=mongodb://username:password@localhost:27017/aimianshi
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# OpenAI配置
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4

# 文件上传
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/aimianshi/uploads

# CORS配置
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/aimianshi/app.log
```

### 3. 安装依赖
```bash
# 安装后端依赖
npm install --production

# 安装前端依赖并构建
cd src/client
npm install
npm run build
cd ../..
```

### 4. 数据库初始化
```bash
# 启动MongoDB
sudo systemctl start mongod

# 运行数据库种子
npm run seed

# 验证数据
mongo aimianshi --eval "db.users.count()"
```

### 5. 启动应用
```bash
# 创建系统用户
sudo useradd -r -s /bin/false aimianshi

# 创建必要目录
sudo mkdir -p /var/www/aimianshi/{uploads,logs}
sudo chown -R aimianshi:aimianshi /var/www/aimianshi

# 启动应用
sudo -u aimianshi npm start
```

### 6. Nginx配置
```nginx
# /etc/nginx/sites-available/aimianshi
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # 前端静态文件
    location / {
        root /var/www/aimianshi/src/client/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket代理
    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 文件上传限制
    client_max_body_size 10M;

    # 日志
    access_log /var/log/nginx/aimianshi.access.log;
    error_log /var/log/nginx/aimianshi.error.log;
}
```

## 🐳 Docker部署

### 1. 使用Docker Compose

#### 生产环境配置
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: aimianshi-mongodb-prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: aimianshi
    volumes:
      - mongodb_data:/data/db
      - ./backup:/backup
    networks:
      - aimianshi-network
    command: mongod --replSet rs0

  redis:
    image: redis:7-alpine
    container_name: aimianshi-redis-prod
    restart: unless-stopped
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    networks:
      - aimianshi-network
    command: redis-server /usr/local/etc/redis/redis.conf

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: aimianshi-app-prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URI: mongodb://root:${MONGO_ROOT_PASSWORD}@mongodb:27017/aimianshi?authSource=admin
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    depends_on:
      - mongodb
      - redis
    networks:
      - aimianshi-network
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  nginx:
    image: nginx:alpine
    container_name: aimianshi-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./src/client/dist:/usr/share/nginx/html:ro
    depends_on:
      - app
    networks:
      - aimianshi-network

volumes:
  mongodb_data:
  redis_data:

networks:
  aimianshi-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

#### 部署脚本
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 开始部署AI面试助手..."

# 检查环境变量
if [ -z "$JWT_SECRET" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ 错误: 请设置必要的环境变量"
    exit 1
fi

# 拉取最新代码
git pull origin main

# 构建镜像
echo "📦 构建Docker镜像..."
docker-compose -f docker-compose.prod.yml build

# 停止旧服务
echo "🔄 停止旧服务..."
docker-compose -f docker-compose.prod.yml down

# 启动新服务
echo "▶️ 启动新服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
docker-compose -f docker-compose.prod.yml exec app npm run migrate

# 健康检查
echo "🔍 执行健康检查..."
if curl -f http://localhost/api/health; then
    echo "✅ 部署成功！"
else
    echo "❌ 部署失败，回滚..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    exit 1
fi

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f

echo "🎉 部署完成！"
```

### 2. Docker Swarm集群部署

#### 初始化Swarm
```bash
# 在管理节点初始化Swarm
sudo docker swarm init --advertise-addr $(hostname -I | awk '{print $1}')

# 在工作节点加入集群
sudo docker swarm join --token SWMTKN-1-xxx manager-ip:2377
```

#### Stack部署文件
```yaml
# docker-stack.yml
version: '3.8'

services:
  app:
    image: aimianshi:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    networks:
      - aimianshi-network
    secrets:
      - jwt_secret
      - openai_key

secrets:
  jwt_secret:
    external: true
  openai_key:
    external: true

networks:
  aimianshi-network:
    driver: overlay
    attachable: true
```

#### 部署Stack
```bash
# 创建secrets
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "your-openai-key" | docker secret create openai_key -

# 部署stack
docker stack deploy -c docker-stack.yml aimianshi
```

## ☁️ 云服务器部署

### 1. AWS部署

#### EC2实例配置
```bash
# 创建EC2实例
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --user-data file://user-data.sh \
  --count 3
```

#### 用户数据脚本
```bash
#!/bin/bash
# user-data.sh

# 更新系统
yum update -y

# 安装Docker
yum install -y docker
systemctl start docker
systemctl enable docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 克隆项目
git clone https://github.com/your-org/aimianshi.git /opt/aimianshi
cd /opt/aimianshi

# 创建环境文件
cat > .env << EOF
NODE_ENV=production
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
OPENAI_API_KEY=${OPENAI_API_KEY}
EOF

# 启动服务
docker-compose up -d
```

#### ELB负载均衡器
```bash
# 创建负载均衡器
aws elb create-load-balancer \
  --load-balancer-name aimianshi-elb \
  --listeners Protocol=HTTP,LoadBalancerPort=80,InstancePort=3000 \
  --subnets subnet-xxxxxxxxx subnet-yyyyyyyyy \
  --security-groups sg-xxxxxxxxx

# 添加实例
aws elb register-instances-with-load-balancer \
  --load-balancer-name aimianshi-elb \
  --instances i-xxxxxxxxx i-yyyyyyyyy i-zzzzzzzz
```

### 2. 阿里云部署

#### ECS实例配置
```bash
# 创建ECS实例
aliyun ecs CreateInstance \
  --ImageId centos_7_9_x64_20G_alibase_20230227.vhd \
  --InstanceType ecs.c6.large \
  --SecurityGroupId sg-xxxxxxxxx \
  --VSwitchId vsw-xxxxxxxxx \
  --InstanceName aimianshi-prod-1 \
  --UserData file://user-data-aliyun.sh
```

#### SLB负载均衡
```bash
# 创建负载均衡
aliyun slb CreateLoadBalancer \
  --LoadBalancerName aimianshi-slb \
  --AddressType internet \
  --InternetChargeType PayByTraffic \
  --ListenerPort 80 \
  --BackendServerPort 3000
```

## 🔄 CI/CD部署

### 1. GitHub Actions配置

#### 工作流文件
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: |
        docker build -t aimianshi:${{ github.sha }} .
        docker tag aimianshi:${{ github.sha }} aimianshi:latest
        
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push aimianshi:${{ github.sha }}
        docker push aimianshi:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/aimianshi
          docker-compose pull
          docker-compose up -d
          docker system prune -f
```

### 2. GitLab CI/CD

#### GitLab CI配置
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com/your-group/aimianshi

test:
  stage: test
  script:
    - npm ci
    - npm test
    - npm run lint
  coverage: '/All files[^|]*\s*\|\s*([\d\.]+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  script:
    - docker build -t $DOCKER_REGISTRY:$CI_COMMIT_SHA .
    - docker tag $DOCKER_REGISTRY:$CI_COMMIT_SHA $DOCKER_REGISTRY:latest
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $DOCKER_REGISTRY
    - docker push $DOCKER_REGISTRY:$CI_COMMIT_SHA
    - docker push $DOCKER_REGISTRY:latest
  only:
    - main

deploy:
  stage: deploy
  script:
    - ssh $DEPLOY_USER@$DEPLOY_HOST "cd /opt/aimianshi && docker-compose pull && docker-compose up -d"
  only:
    - main
  when: manual
```

## 📊 监控配置

### 1. Prometheus + Grafana

#### Prometheus配置
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'aimianshi'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'mongodb-exporter'
    static_configs:
      - targets: ['localhost:9216']
```

#### Grafana仪表板
```json
{
  "dashboard": {
    "title": "AI面试助手监控",
    "panels": [
      {
        "title": "请求量",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "错误率",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

### 2. 日志收集

#### ELK Stack配置
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config:/usr/share/logstash/config
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

### 3. 告警配置

#### AlertManager配置
```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@yourdomain.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'your-app-password'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  email_configs:
  - to: 'admin@yourdomain.com'
    subject: '[AIMIANSHI ALERT] {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}
```

## 🔧 故障排查

### 1. 常见问题

#### 应用无法启动
```bash
# 检查日志
docker-compose logs app

# 检查端口占用
netstat -tulpn | grep :3000

# 检查环境变量
docker-compose exec app env | grep NODE_ENV

# 检查数据库连接
docker-compose exec app npm run db:check
```

#### 数据库连接失败
```bash
# 检查MongoDB状态
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"

# 检查网络连通性
docker-compose exec app ping mongodb

# 检查认证信息
docker-compose exec app node -e "console.log(require('mongoose').connection.readyState)"
```

#### 高CPU使用率
```bash
# 检查进程状态
docker stats

# 分析CPU使用
docker-compose exec app npm run analyze:cpu

# 检查内存泄漏
docker-compose exec app npm run analyze:memory
```

### 2. 性能优化

#### 数据库优化
```javascript
// MongoDB索引优化
db.questions.createIndex({ "category": 1, "difficulty": 1 });
db.questions.createIndex({ "tags": 1 });
db.questions.createIndex({ "companies": 1 });
db.interviews.createIndex({ "userId": 1, "status": 1 });
db.interviews.createIndex({ "createdAt": -1 });

// 查询优化
db.questions.find({ category: "algorithms", difficulty: "medium" })
  .hint({ category: 1, difficulty: 1 })
  .limit(20);
```

#### 缓存策略
```javascript
// Redis缓存配置
const cacheConfig = {
  userSession: { ttl: 3600, key: 'session:${userId}' },
  questionList: { ttl: 1800, key: 'questions:${hash}' },
  interviewData: { ttl: 7200, key: 'interview:${interviewId}' },
  apiResponse: { ttl: 300, key: 'api:${hash}' }
};

// 缓存实现
async function getCache(key) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

async function setCache(key, data, ttl = 300) {
  await redis.setex(key, ttl, JSON.stringify(data));
}
```

### 3. 安全加固

#### Nginx安全配置
```nginx
# 隐藏版本信息
server_tokens off;

# 限制请求大小
client_max_body_size 10M;

# 防止DDoS
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;

# 安全头
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

# 限制请求方法
if ($request_method !~ ^(GET|HEAD|POST)$ ) {
    return 405;
}
```

#### 应用安全配置
```javascript
// 输入验证
const validateInput = (input) => {
  // XSS防护
  const sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*<\/script>|<\/script>)/gi, '');
  
  // SQL注入防护
  const sqlSafe = sanitized.replace(/([';--]|(--)|(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi, '');
  
  return sqlSafe;
};

// 速率限制
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: 'Too many requests from this IP'
});
```

## 📋 部署检查清单

### 部署前检查
- [ ] 代码已通过所有测试
- [ ] 环境变量已正确配置
- [ ] SSL证书已安装
- [ ] 数据库已备份
- [ ] 防火墙规则已配置
- [ ] 监控系统已就绪
- [ ] 日志收集已配置
- [ ] 备份策略已制定

### 部署后验证
- [ ] 应用可以正常访问
- [ ] 所有API端点响应正常
- [ ] 数据库连接正常
- [ ] WebSocket连接正常
- [ ] 文件上传功能正常
- [ ] 用户认证系统正常
- [ ] 静态资源加载正常
- [ ] SSL证书有效
- [ ] 监控指标正常
- [ ] 日志记录正常
- [ ] 性能指标正常

### 回滚计划
```bash
# 快速回滚脚本
#!/bin/bash
# rollback.sh

echo "🔄 开始回滚..."

# 停止当前版本
docker-compose down

# 切换到上一个版本
git checkout HEAD~1

# 重新部署
./deploy.sh

echo "✅ 回滚完成"
```

---

*最后更新: 2024年1月*