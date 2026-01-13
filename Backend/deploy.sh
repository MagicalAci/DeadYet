#!/bin/bash
# DeadYet 后端 Zeabur 部署脚本

echo "🐂 还没死？后端部署脚本"
echo "========================"

# 检查是否安装了 Zeabur CLI
if ! command -v npx &> /dev/null; then
    echo "❌ 需要安装 Node.js"
    exit 1
fi

# 使用 Zeabur CLI 部署
echo "📦 开始部署到 Zeabur..."

# 设置环境变量
export ZEABUR_TOKEN="sk-kmmwgm5hff73ywldk3uhjxthhsbtd"

# 部署
npx zeabur deploy \
  --project deadyet \
  --service api \
  --path . \
  --env PORT=8080 \
  --env NODE_ENV=production

echo "✅ 部署完成！"

