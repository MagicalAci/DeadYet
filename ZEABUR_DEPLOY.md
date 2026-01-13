# Zeabur 部署指南

## 快速部署步骤

### 1. 在 Zeabur 创建新项目

1. 访问 [Zeabur 控制台](https://zeabur.cn/projects)
2. 点击 **Create New Project**
3. 选择区域（建议选择亚洲区域如香港/新加坡）

### 2. 添加 Git 服务

1. 在项目中点击 **Add Service**
2. 选择 **Git**
3. 选择 GitHub，授权并选择仓库 `MagicalAci/DeadYet`
4. 选择 `main` 分支

### 3. 配置服务（重要！）

在服务设置中：

1. **Root Directory**: 设置为 `Backend`
2. 系统会自动检测为 Node.js 项目

### 4. 添加域名

1. 点击服务卡片
2. 选择 **Networking** 或 **Domain** 标签
3. 添加自定义域名或使用 Zeabur 提供的免费域名（如 `deadyet.zeabur.app`）

### 5. 等待部署

- 部署通常需要 2-5 分钟
- 可以在 **Deployments** 标签查看构建日志
- 构建成功后服务会自动启动

## 验证部署

部署成功后，访问以下端点测试：

```bash
# 健康检查
curl https://你的域名/health

# API 首页
curl https://你的域名/

# 地图统计
curl https://你的域名/api/map/stats
```

## 预期响应

健康检查应返回：
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

首页应返回：
```json
{
  "name": "还没死？API",
  "version": "1.0.0",
  "status": "运行中",
  "message": "欢迎来到牛马世界 🐂🐴"
}
```

## 常见问题

### 构建失败
- 检查构建日志中的错误信息
- 确保 Root Directory 设置为 `Backend`
- 确保 `package.json` 和 `package-lock.json` 同步

### 404 错误
- 等待 2-3 分钟让服务完全启动
- 检查域名绑定是否正确
- 检查服务是否在运行状态

### 冷启动慢
- Zeabur 免费版可能有冷启动延迟（10-30秒）
- 首次请求可能超时，刷新即可

## iOS 客户端配置

确保 iOS 代码中的 API 地址与部署的域名一致：

```swift
// UserService.swift, APIClient.swift 等
private let baseURL = "https://你的域名"
```
