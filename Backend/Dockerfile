# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 只复制必要的文件
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# 只安装生产依赖
RUN npm ci --only=production

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/index.js"]

