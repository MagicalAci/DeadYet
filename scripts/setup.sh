#!/bin/bash

# 🐂 还没死？ - 项目初始化脚本
# 用于快速设置开发环境

set -e

echo "╔══════════════════════════════════════════╗"
echo "║                                          ║"
echo "║   🐂 还没死？ - 项目初始化               ║"
echo "║                                          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 检查依赖
check_dependencies() {
    echo "📦 检查依赖..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 20+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装"
        exit 1
    fi
    
    echo "✅ Node.js $(node -v)"
    echo "✅ npm $(npm -v)"
}

# 设置后端
setup_backend() {
    echo ""
    echo "🔧 设置后端..."
    
    cd Backend
    
    # 安装依赖
    echo "  📥 安装依赖..."
    npm install
    
    # 复制环境变量模板
    if [ ! -f .env ]; then
        echo "  📝 创建 .env 文件..."
        cat > .env << EOF
# 数据库 (Zeabur PostgreSQL)
DATABASE_URL=postgresql://username:password@host:5432/deadyet

# Redis缓存 (可选)
REDIS_URL=redis://localhost:6379

# OpenAI API (可选，用于AI毒舌功能)
OPENAI_API_KEY=sk-your-openai-api-key

# Resend邮件服务 (可选，用于邮件推送)
RESEND_API_KEY=re_your_resend_api_key

# 服务器配置
PORT=3000
NODE_ENV=development
EOF
        echo "  ⚠️  请编辑 Backend/.env 文件，填入你的配置"
    fi
    
    cd ..
    echo "✅ 后端设置完成"
}

# 构建后端
build_backend() {
    echo ""
    echo "🔨 构建后端..."
    
    cd Backend
    npm run build
    cd ..
    
    echo "✅ 后端构建完成"
}

# 启动开发服务器
start_dev() {
    echo ""
    echo "🚀 启动开发服务器..."
    
    cd Backend
    npm run dev
}

# 主函数
main() {
    check_dependencies
    setup_backend
    
    echo ""
    echo "═══════════════════════════════════════════"
    echo ""
    echo "🎉 初始化完成！"
    echo ""
    echo "下一步操作："
    echo ""
    echo "1️⃣  编辑 Backend/.env 填入你的配置"
    echo ""
    echo "2️⃣  启动后端开发服务器："
    echo "    cd Backend && npm run dev"
    echo ""
    echo "3️⃣  用 Xcode 打开 iOS 项目："
    echo "    open iOS/DeadYet.xcodeproj"
    echo ""
    echo "4️⃣  创建 GitHub 仓库并推送代码"
    echo ""
    echo "5️⃣  在 Zeabur 部署后端"
    echo ""
    echo "═══════════════════════════════════════════"
    echo ""
    
    read -p "是否立即启动后端开发服务器？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev
    fi
}

# 运行
main

