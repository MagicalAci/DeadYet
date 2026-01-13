# 🚀 Zeabur 部署指南

## ⚡ 你的部署信息

| 项目 | 值 |
|------|-----|
| GitHub 仓库 | https://github.com/MagicalAci/DeadYet |
| Zeabur Token | `sk-kmmwgm5hff73ywldk3uhjxthhsbtd` |
| 项目 ID | `6963f3eb4cd8a0ab9af1dcce` |
| 服务 ID | `6965a81b12c8e2c31de8c1f5` |
| 环境 ID | `6963f3eba7aaff0c1152bb59` |
| 端口 | `8080` |

---

## 前置准备

1. 注册 [Zeabur](https://zeabur.com) 账号
2. 创建 GitHub 仓库并推送代码 ✅ 已完成
3. 准备好你的 Zeabur API Token: `sk-kmmwgm5hff73ywldk3uhjxthhsbtd` ✅

## 部署步骤

### 1. 创建项目

1. 登录 Zeabur 控制台
2. 点击「New Project」
3. 项目名称：`dead-yet`
4. 选择区域：推荐选择香港或东京（延迟低）

### 2. 添加 PostgreSQL 数据库

1. 在项目中点击「Add Service」
2. 选择「Marketplace」
3. 搜索并添加「PostgreSQL」
4. 等待部署完成
5. 复制 `DATABASE_URL` 备用

### 3. 添加 Redis 缓存（可选）

1. 点击「Add Service」→「Marketplace」
2. 搜索并添加「Redis」
3. 复制 `REDIS_URL` 备用

### 4. 部署后端 API

1. 点击「Add Service」→「Git」
2. 连接你的 GitHub 账号
3. 选择 `MagicalAci/DeadYet` 仓库
4. 根目录设置为：`Backend`
5. 等待自动部署

### 5. 配置环境变量

在后端服务的「Variables」中添加：

```
DATABASE_URL=<从PostgreSQL服务复制>
REDIS_URL=<从Redis服务复制，可选>
OPENAI_API_KEY=<你的OpenAI API Key，可选>
RESEND_API_KEY=<你的Resend API Key，可选>
NODE_ENV=production
```

### 6. 配置域名

1. 在后端服务中点击「Networking」
2. 添加自定义域名或使用 Zeabur 提供的域名
3. 推荐格式：`api.deadyet.app` 或 `dead-yet-api.zeabur.app`

### 7. 验证部署

访问你的 API 地址：

```bash
curl https://your-api-domain/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-12T...",
  "uptime": 123.456
}
```

## 环境变量说明

| 变量 | 必须 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 连接字符串 |
| `REDIS_URL` | ❌ | Redis 连接字符串 |
| `OPENAI_API_KEY` | ❌ | 用于AI毒舌功能 |
| `RESEND_API_KEY` | ❌ | 用于邮件推送 |
| `PORT` | ❌ | 默认3000 |
| `NODE_ENV` | ❌ | production |

## 更新 iOS 客户端

部署完成后，更新 iOS 项目中的 API 地址：

```swift
// iOS/DeadYet/Services/APIClient.swift
private let baseURL = "https://your-api-domain"
```

## 自动部署 (GitHub Actions)

每次推送到 `main` 分支的 `Backend/` 目录，会自动触发部署。

### 配置 GitHub Secrets

1. 访问 https://github.com/MagicalAci/DeadYet/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加以下 Secrets：

| Secret 名称 | 值 |
|-------------|-----|
| `ZEABUR_API_KEY` | `sk-kmmwgm5hff73ywldk3uhjxthhsbtd` |
| `ZEABUR_PROJECT_ID` | `6963f3eb4cd8a0ab9af1dcce` |
| `ZEABUR_SERVICE_ID` | `6965a81b12c8e2c31de8c1f5` |

配置完成后，每次 push 到 main 分支都会自动部署！

## 监控

Zeabur 控制台提供：
- 实时日志
- 资源监控
- 部署历史
- 自动重启

## 费用估算

| 服务 | 预估费用 |
|------|----------|
| 后端 (Developer Plan) | ~$5/月 |
| PostgreSQL | ~$5/月 |
| Redis | ~$3/月 |
| **总计** | ~$13/月 |

> 💡 Zeabur 新用户有免费额度，可以先试用

## 常见问题

### Q: 部署失败怎么办？
A: 检查 Zeabur 日志，确认 `package.json` 中的 scripts 正确

### Q: 数据库连接失败？
A: 确认 `DATABASE_URL` 格式正确，Zeabur 的 PostgreSQL 需要 SSL

### Q: 如何查看日志？
A: 在服务详情页面点击「Logs」

---

有问题？查看 [Zeabur 文档](https://zeabur.com/docs)

