/**
 * 设计资源上传 API
 */

import { Hono } from 'hono'

const app = new Hono()

// 设计资源定义
const designAssets = [
  {
    id: 'icon-1024',
    name: 'App Icon',
    filename: 'icon-1024.png',
    size: '1024×1024 px',
    format: 'PNG（无透明）',
    required: true,
    category: 'icon',
    description: '应用图标，将显示在用户手机主屏幕',
    visualDesc: '深黑背景 + 绿色对勾/心电图线，或牛马头像 + 打卡符号，传达"打工人存活确认"的概念',
    keywords: '黑色幽默、疲惫但倔强、下班的希望'
  },
  {
    id: 'launch',
    name: '启动屏',
    filename: 'launch.png',
    size: '1290×2796 px',
    format: 'PNG',
    required: false,
    category: 'screen',
    description: 'App启动时显示的画面',
    visualDesc: '深黑色背景，中央Logo，下方标语如"又活过一天"',
    keywords: '简洁、品牌感、期待感'
  },
  {
    id: 'banner-lv1',
    name: '锦旗 Lv.1 - 新鲜韭菜',
    filename: 'banner-lv1.png',
    size: '800×1200 px',
    format: 'PNG（可透明）',
    required: false,
    category: 'banner',
    description: '签到1-7天解锁的成就锦旗',
    visualDesc: '嫩绿色传统锦旗，主标题"新鲜韭菜"，副标题"恭喜你活着回来了"，装饰韭菜/嫩芽图案',
    keywords: '新手、希望、嫩绿色 #4CAF50'
  },
  {
    id: 'banner-lv2',
    name: '锦旗 Lv.2 - 牛马新星',
    filename: 'banner-lv2.png',
    size: '800×1200 px',
    format: 'PNG（可透明）',
    required: false,
    category: 'banner',
    description: '签到8-30天解锁的成就锦旗',
    visualDesc: '铜色/棕色金属质感锦旗，主标题"牛马新星"，副标题"初露锋芒的社畜"，装饰牛马剪影+星星',
    keywords: '进阶、铜色 #CD7F32'
  },
  {
    id: 'banner-lv3',
    name: '锦旗 Lv.3 - 资深社畜',
    filename: 'banner-lv3.png',
    size: '800×1200 px',
    format: 'PNG（可透明）',
    required: false,
    category: 'banner',
    description: '签到31-90天解锁的成就锦旗',
    visualDesc: '银色金属光泽锦旗，主标题"资深社畜"，副标题"久经沙场，百毒不侵"，装饰工牌小人',
    keywords: '老练、银色 #C0C0C0'
  },
  {
    id: 'banner-lv4',
    name: '锦旗 Lv.4 - 钢铁打工人',
    filename: 'banner-lv4.png',
    size: '800×1200 px',
    format: 'PNG（可透明）',
    required: false,
    category: 'banner',
    description: '签到91-180天解锁的成就锦旗',
    visualDesc: '金色华丽锦旗，主标题"钢铁打工人"，副标题"打不死的小强"，装饰钢铁盾牌/徽章',
    keywords: '坚强、金色 #FFD700'
  },
  {
    id: 'banner-lv5',
    name: '锦旗 Lv.5 - 不死老兵',
    filename: 'banner-lv5.png',
    size: '800×1200 px',
    format: 'PNG（可透明）',
    required: false,
    category: 'banner',
    description: '签到181-365天解锁的成就锦旗',
    visualDesc: '钻石蓝闪耀锦旗，主标题"不死老兵"，副标题"传说中的存在"，装饰军功章/勋章',
    keywords: '传奇、钻石蓝 #00CED1'
  },
  {
    id: 'banner-lv6',
    name: '锦旗 Lv.6 - 传奇牛马',
    filename: 'banner-lv6.png',
    size: '800×1200 px',
    format: 'PNG（可透明）',
    required: false,
    category: 'banner',
    description: '签到365+天解锁的最高成就锦旗',
    visualDesc: '彩虹渐变极度华丽锦旗，主标题"传奇牛马"，副标题"一年不死，必成大器"，装饰皇冠+光芒',
    keywords: '至尊、彩虹渐变'
  },
  {
    id: 'emoji-cow',
    name: '牛头表情',
    filename: 'emoji-cow.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区表情',
    visualDesc: '疲惫的老牛表情，眼神无光，但还在坚持',
    keywords: '疲惫、坚持'
  },
  {
    id: 'emoji-horse',
    name: '马头表情',
    filename: 'emoji-horse.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区表情',
    visualDesc: '累趴的驴子/马表情，汗流浃背',
    keywords: '劳累、汗水'
  },
  {
    id: 'emoji-dog',
    name: '加班狗表情',
    filename: 'emoji-dog.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区表情',
    visualDesc: '趴在电脑前的加班狗，眼睛通红',
    keywords: '加班、熬夜'
  },
  {
    id: 'emoji-skull',
    name: '社死表情',
    filename: 'emoji-skull.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区表情',
    visualDesc: '骷髅头戴着工牌，黑色幽默',
    keywords: '社死、崩溃'
  },
  {
    id: 'emoji-angry',
    name: '愤怒表情',
    filename: 'emoji-angry.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区表情',
    visualDesc: '愤怒的表情，头顶冒烟',
    keywords: '愤怒、想骂人'
  },
  {
    id: 'emoji-cry',
    name: '崩溃哭泣表情',
    filename: 'emoji-cry.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区表情',
    visualDesc: '崩溃大哭，眼泪喷涌',
    keywords: '崩溃、绝望'
  },
  {
    id: 'emoji-party',
    name: '下班庆祝表情',
    filename: 'emoji-party.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区表情',
    visualDesc: '狂欢庆祝，撒花，下班的喜悦',
    keywords: '庆祝、解放'
  },
  {
    id: 'emoji-sleep',
    name: '困死表情',
    filename: 'emoji-sleep.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区表情',
    visualDesc: '困得要死，眼皮打架，Zzz',
    keywords: '困倦、想睡'
  },
  {
    id: 'pin-working',
    name: '上班中地图标记',
    filename: 'pin-working.png',
    size: '64×64 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'map',
    description: '地图上显示"还在上班"的位置标记',
    visualDesc: '红色图钉/标记，可带火焰或警告符号',
    keywords: '警告红 #FF3B30'
  },
  {
    id: 'pin-offwork',
    name: '已下班地图标记',
    filename: 'pin-offwork.png',
    size: '64×64 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'map',
    description: '地图上显示"已下班"的位置标记',
    visualDesc: '绿色图钉/标记，可带对勾或笑脸',
    keywords: '存活绿 #34C759'
  },
  {
    id: 'pin-overtime',
    name: '加班中地图标记',
    filename: 'pin-overtime.png',
    size: '64×64 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'map',
    description: '地图上显示"加班中"的位置标记',
    visualDesc: '橙色/黄色图钉，可带警告⚠️符号',
    keywords: '警告橙 #FF9500'
  }
]

// 存储上传的文件
const uploadedFiles: Map<string, {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  base64: string
}> = new Map()

// 上传页面 HTML
const getUploadPageHTML = () => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>还没死？- 设计资源上传</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%);
            min-height: 100vh;
            color: #fff;
            padding: 20px;
        }
        
        .container { max-width: 1000px; margin: 0 auto; }
        
        header { text-align: center; padding: 40px 0; }
        
        h1 {
            font-size: 2.5rem;
            background: linear-gradient(90deg, #FF3B30, #FFD700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        
        .subtitle { color: #8E8E93; font-size: 1.1rem; }
        
        .section {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .section h2 {
            font-size: 1.3rem;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .asset-card {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: border-color 0.3s;
        }
        
        .asset-card:hover { border-color: rgba(255, 255, 255, 0.2); }
        
        .asset-card.uploaded { border-color: #34C759; }
        
        .asset-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }
        
        .asset-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .asset-title h3 { font-size: 1.1rem; }
        
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .badge.required { background: rgba(255, 59, 48, 0.2); color: #FF3B30; }
        .badge.optional { background: rgba(142, 142, 147, 0.2); color: #8E8E93; }
        .badge.uploaded { background: rgba(52, 199, 89, 0.2); color: #34C759; }
        
        .asset-meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .meta-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 10px 12px;
            border-radius: 8px;
        }
        
        .meta-item label {
            display: block;
            font-size: 0.75rem;
            color: #8E8E93;
            margin-bottom: 4px;
        }
        
        .meta-item span { font-size: 0.9rem; }
        
        .asset-desc {
            background: rgba(255, 255, 255, 0.03);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
        }
        
        .asset-desc h4 {
            font-size: 0.85rem;
            color: #8E8E93;
            margin-bottom: 8px;
        }
        
        .asset-desc p {
            font-size: 0.9rem;
            line-height: 1.6;
            color: #ccc;
        }
        
        .keywords {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 12px;
        }
        
        .keyword {
            background: rgba(255, 215, 0, 0.15);
            color: #FFD700;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
        }
        
        .upload-area {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .upload-btn {
            background: linear-gradient(90deg, #FF3B30, #FF6B30);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .upload-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 59, 48, 0.4);
        }
        
        .upload-btn.success {
            background: linear-gradient(90deg, #34C759, #30D158);
        }
        
        .preview-img {
            width: 60px;
            height: 60px;
            object-fit: contain;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
        }
        
        .file-input { display: none; }
        
        .status-text {
            font-size: 0.85rem;
            color: #8E8E93;
        }
        
        .status-text.success { color: #34C759; }
        
        .color-palette {
            display: flex;
            gap: 12px;
            margin-top: 16px;
        }
        
        .color-swatch {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .color-box {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .color-swatch span { font-size: 0.8rem; color: #8E8E93; }
        
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #34C759;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 1000;
        }
        
        .toast.show { opacity: 1; }
        .toast.error { background: #FF3B30; }
        
        footer {
            text-align: center;
            padding: 40px;
            color: #8E8E93;
        }
        
        footer a { color: #FF3B30; text-decoration: none; }
        
        @media (max-width: 768px) {
            .asset-meta { grid-template-columns: 1fr; }
            .upload-area { flex-direction: column; align-items: flex-start; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🐂🐴 还没死？</h1>
            <p class="subtitle">设计资源上传中心</p>
        </header>
        
        <!-- 配色参考 -->
        <div class="section">
            <h2>🎨 配色规范</h2>
            <div class="color-palette">
                <div class="color-swatch">
                    <div class="color-box" style="background: #FF3B30"></div>
                    <span>警告红 #FF3B30</span>
                </div>
                <div class="color-swatch">
                    <div class="color-box" style="background: #34C759"></div>
                    <span>存活绿 #34C759</span>
                </div>
                <div class="color-swatch">
                    <div class="color-box" style="background: #1C1C1E"></div>
                    <span>深黑 #1C1C1E</span>
                </div>
                <div class="color-swatch">
                    <div class="color-box" style="background: #FFD700"></div>
                    <span>金色 #FFD700</span>
                </div>
                <div class="color-swatch">
                    <div class="color-box" style="background: #00CED1"></div>
                    <span>钻石蓝 #00CED1</span>
                </div>
            </div>
        </div>
        
        <!-- App Icon -->
        <div class="section">
            <h2>📱 应用图标（必须）</h2>
            ${renderAssetCard(designAssets.find(a => a.id === 'icon-1024')!)}
        </div>
        
        <!-- 启动屏 -->
        <div class="section">
            <h2>🚀 启动屏</h2>
            ${renderAssetCard(designAssets.find(a => a.id === 'launch')!)}
        </div>
        
        <!-- 锦旗系列 -->
        <div class="section">
            <h2>🏆 成就锦旗（6个等级）</h2>
            ${designAssets.filter(a => a.category === 'banner').map(a => renderAssetCard(a)).join('')}
        </div>
        
        <!-- 表情贴纸 -->
        <div class="section">
            <h2>😀 表情贴纸</h2>
            ${designAssets.filter(a => a.category === 'emoji').map(a => renderAssetCard(a)).join('')}
        </div>
        
        <!-- 地图标记 -->
        <div class="section">
            <h2>🗺️ 地图标记</h2>
            ${designAssets.filter(a => a.category === 'map').map(a => renderAssetCard(a)).join('')}
        </div>
        
        <footer>
            <p>还没死？ v1.0.0 | <a href="/">API 文档</a></p>
        </footer>
    </div>
    
    <div class="toast" id="toast"></div>
    
    <script>
        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        
        async function uploadFile(assetId, input) {
            const file = input.files[0];
            if (!file) return;
            
            const card = document.getElementById('card-' + assetId);
            const btn = card.querySelector('.upload-btn');
            const status = card.querySelector('.status-text');
            const preview = card.querySelector('.preview-img');
            
            btn.textContent = '⏳ 上传中...';
            btn.disabled = true;
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('assetId', assetId);
            
            try {
                const response = await fetch('/api/upload/asset', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showToast('✅ ' + result.name + ' 上传成功！');
                    card.classList.add('uploaded');
                    btn.textContent = '✅ 重新上传';
                    btn.classList.add('success');
                    status.textContent = '已上传: ' + file.name;
                    status.classList.add('success');
                    
                    // 显示预览
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    showToast('❌ ' + result.message, true);
                    btn.textContent = '📤 上传';
                }
            } catch (error) {
                showToast('❌ 上传失败: ' + error.message, true);
                btn.textContent = '📤 上传';
            }
            
            btn.disabled = false;
        }
        
        function triggerUpload(assetId) {
            document.getElementById('input-' + assetId).click();
        }
    </script>
</body>
</html>
`

// 渲染单个资源卡片
function renderAssetCard(asset: typeof designAssets[0]): string {
  return `
    <div class="asset-card" id="card-${asset.id}">
        <div class="asset-header">
            <div class="asset-title">
                <h3>${asset.name}</h3>
                <span class="badge ${asset.required ? 'required' : 'optional'}">
                    ${asset.required ? '必须' : '可选'}
                </span>
            </div>
        </div>
        
        <div class="asset-meta">
            <div class="meta-item">
                <label>尺寸</label>
                <span>${asset.size}</span>
            </div>
            <div class="meta-item">
                <label>格式</label>
                <span>${asset.format}</span>
            </div>
            <div class="meta-item">
                <label>文件名</label>
                <span>${asset.filename}</span>
            </div>
        </div>
        
        <div class="asset-desc">
            <h4>📝 用途说明</h4>
            <p>${asset.description}</p>
        </div>
        
        <div class="asset-desc">
            <h4>🎨 视觉描述</h4>
            <p>${asset.visualDesc}</p>
            <div class="keywords">
                ${asset.keywords.split('、').map(k => `<span class="keyword">${k.trim()}</span>`).join('')}
            </div>
        </div>
        
        <div class="upload-area">
            <input type="file" class="file-input" id="input-${asset.id}" 
                   accept="image/*" onchange="uploadFile('${asset.id}', this)">
            <button class="upload-btn" onclick="triggerUpload('${asset.id}')">
                📤 上传
            </button>
            <img class="preview-img" style="display: none" alt="预览">
            <span class="status-text">未上传</span>
        </div>
    </div>
  `
}

// 获取上传页面
app.get('/', (c) => {
  return c.html(getUploadPageHTML())
})

// 处理单个资源上传
app.post('/asset', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const assetId = formData.get('assetId') as string
    
    if (!file) {
      return c.json({ success: false, message: '没有选择文件' }, 400)
    }
    
    const asset = designAssets.find(a => a.id === assetId)
    if (!asset) {
      return c.json({ success: false, message: '未知的资源类型' }, 400)
    }
    
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    
    uploadedFiles.set(assetId, {
      id: assetId,
      name: asset.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      base64: base64
    })
    
    return c.json({
      success: true,
      message: '上传成功',
      id: assetId,
      name: asset.name,
      filename: asset.filename
    })
  } catch (error) {
    console.error('上传错误:', error)
    return c.json({ success: false, message: '上传失败' }, 500)
  }
})

// 获取已上传的资源列表
app.get('/list', (c) => {
  const uploaded = Array.from(uploadedFiles.values()).map(f => ({
    id: f.id,
    name: f.name,
    size: f.size,
    type: f.type,
    uploadedAt: f.uploadedAt
  }))
  
  return c.json({
    success: true,
    uploaded,
    total: uploadedFiles.size,
    assets: designAssets.map(a => ({
      ...a,
      uploaded: uploadedFiles.has(a.id)
    }))
  })
})

// 获取单个资源文件
app.get('/file/:id', (c) => {
  const id = c.req.param('id')
  const file = uploadedFiles.get(id)
  
  if (!file) {
    return c.json({ success: false, message: '文件不存在' }, 404)
  }
  
  const asset = designAssets.find(a => a.id === id)
  const buffer = Buffer.from(file.base64, 'base64')
  
  return new Response(buffer, {
    headers: {
      'Content-Type': file.type,
      'Content-Disposition': `inline; filename="${asset?.filename || file.name}"`
    }
  })
})

// 获取设计规范
app.get('/spec', (c) => {
  return c.json({
    success: true,
    assets: designAssets,
    colors: {
      deadRed: '#FF3B30',
      aliveGreen: '#34C759',
      darkBg: '#1C1C1E',
      gold: '#FFD700',
      silver: '#C0C0C0',
      bronze: '#CD7F32',
      diamond: '#00CED1'
    }
  })
})

export default app
