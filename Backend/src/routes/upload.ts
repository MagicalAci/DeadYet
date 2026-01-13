/**
 * 设计资源上传 API
 */

import { Hono } from 'hono'

const app = new Hono()

// 上传页面 HTML
const uploadPageHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>还没死？- 设计资源上传</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%);
            min-height: 100vh;
            color: #fff;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            padding: 40px 0;
        }
        
        h1 {
            font-size: 2.5rem;
            background: linear-gradient(90deg, #FF3B30, #FFD700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #8E8E93;
            font-size: 1.1rem;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .card h2 {
            font-size: 1.3rem;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .checklist {
            list-style: none;
        }
        
        .checklist li {
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .checklist li:last-child {
            border-bottom: none;
        }
        
        .item-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .item-info .icon {
            font-size: 1.5rem;
        }
        
        .item-info .details {
            display: flex;
            flex-direction: column;
        }
        
        .item-info .name {
            font-weight: 600;
        }
        
        .item-info .size {
            font-size: 0.85rem;
            color: #8E8E93;
        }
        
        .status {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .status.required {
            color: #FF3B30;
        }
        
        .status.optional {
            color: #8E8E93;
        }
        
        .status.uploaded {
            color: #34C759;
        }
        
        .upload-zone {
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 16px;
        }
        
        .upload-zone:hover {
            border-color: #FF3B30;
            background: rgba(255, 59, 48, 0.1);
        }
        
        .upload-zone.dragover {
            border-color: #34C759;
            background: rgba(52, 199, 89, 0.1);
        }
        
        .upload-zone .icon {
            font-size: 3rem;
            margin-bottom: 16px;
        }
        
        .upload-zone p {
            color: #8E8E93;
        }
        
        .upload-zone input {
            display: none;
        }
        
        .btn {
            background: linear-gradient(90deg, #FF3B30, #FF6B30);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 20px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 59, 48, 0.4);
        }
        
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 16px;
            margin-top: 16px;
        }
        
        .preview-item {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 12px;
            text-align: center;
        }
        
        .preview-item img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        
        .preview-item .filename {
            font-size: 0.75rem;
            color: #8E8E93;
            word-break: break-all;
        }
        
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
        
        .toast.show {
            opacity: 1;
        }
        
        .toast.error {
            background: #FF3B30;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        th {
            color: #8E8E93;
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .badge.required {
            background: rgba(255, 59, 48, 0.2);
            color: #FF3B30;
        }
        
        .badge.optional {
            background: rgba(142, 142, 147, 0.2);
            color: #8E8E93;
        }
        
        footer {
            text-align: center;
            padding: 40px;
            color: #8E8E93;
        }
        
        footer a {
            color: #FF3B30;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🐂🐴 还没死？</h1>
            <p class="subtitle">设计资源上传中心</p>
        </header>
        
        <div class="card">
            <h2>📋 设计清单</h2>
            <table>
                <thead>
                    <tr>
                        <th>资源</th>
                        <th>尺寸</th>
                        <th>文件名</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>🎯 App Icon</td>
                        <td>1024×1024 px</td>
                        <td><code>icon-1024.png</code></td>
                        <td><span class="badge required">必须</span></td>
                    </tr>
                    <tr>
                        <td>🚀 启动屏</td>
                        <td>1290×2796 px</td>
                        <td><code>launch.png</code></td>
                        <td><span class="badge optional">可选</span></td>
                    </tr>
                    <tr>
                        <td>🏆 锦旗 Lv.1</td>
                        <td>800×1200 px</td>
                        <td><code>banner-lv1.png</code></td>
                        <td><span class="badge optional">可选</span></td>
                    </tr>
                    <tr>
                        <td>🏆 锦旗 Lv.2</td>
                        <td>800×1200 px</td>
                        <td><code>banner-lv2.png</code></td>
                        <td><span class="badge optional">可选</span></td>
                    </tr>
                    <tr>
                        <td>🏆 锦旗 Lv.3</td>
                        <td>800×1200 px</td>
                        <td><code>banner-lv3.png</code></td>
                        <td><span class="badge optional">可选</span></td>
                    </tr>
                    <tr>
                        <td>🏆 锦旗 Lv.4</td>
                        <td>800×1200 px</td>
                        <td><code>banner-lv4.png</code></td>
                        <td><span class="badge optional">可选</span></td>
                    </tr>
                    <tr>
                        <td>🏆 锦旗 Lv.5</td>
                        <td>800×1200 px</td>
                        <td><code>banner-lv5.png</code></td>
                        <td><span class="badge optional">可选</span></td>
                    </tr>
                    <tr>
                        <td>🏆 锦旗 Lv.6</td>
                        <td>800×1200 px</td>
                        <td><code>banner-lv6.png</code></td>
                        <td><span class="badge optional">可选</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="card">
            <h2>📤 上传设计资源</h2>
            <p style="color: #8E8E93; margin-bottom: 16px;">支持 PNG、JPG、SVG 格式，可一次上传多个文件</p>
            
            <div class="upload-zone" id="uploadZone">
                <div class="icon">📁</div>
                <p>拖拽文件到这里，或点击选择文件</p>
                <input type="file" id="fileInput" multiple accept="image/*">
            </div>
            
            <div class="preview-grid" id="previewGrid"></div>
            
            <button class="btn" id="uploadBtn" disabled>
                🚀 上传到服务器
            </button>
        </div>
        
        <div class="card">
            <h2>🎨 设计指南</h2>
            <ul class="checklist">
                <li>
                    <div class="item-info">
                        <span class="icon">🎯</span>
                        <div class="details">
                            <span class="name">App Icon</span>
                            <span class="size">建议使用简洁有力的图标，避免过多细节</span>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="item-info">
                        <span class="icon">🎨</span>
                        <div class="details">
                            <span class="name">配色方案</span>
                            <span class="size">主色：#FF3B30 (警告红) / #34C759 (存活绿) / #1C1C1E (背景黑)</span>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="item-info">
                        <span class="icon">💡</span>
                        <div class="details">
                            <span class="name">设计灵感</span>
                            <span class="size">牛马形象、打卡符号、骷髅头戴工牌、逃离的小人</span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        
        <footer>
            <p>还没死？ v1.0.0 | <a href="https://deadyet.zeabur.app">API 文档</a></p>
        </footer>
    </div>
    
    <div class="toast" id="toast"></div>
    
    <script>
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const previewGrid = document.getElementById('previewGrid');
        const uploadBtn = document.getElementById('uploadBtn');
        const toast = document.getElementById('toast');
        
        let selectedFiles = [];
        
        // 点击上传区域
        uploadZone.addEventListener('click', () => fileInput.click());
        
        // 文件选择
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
        
        // 拖拽
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });
        
        function handleFiles(files) {
            selectedFiles = [...selectedFiles, ...Array.from(files)];
            updatePreview();
            uploadBtn.disabled = selectedFiles.length === 0;
        }
        
        function updatePreview() {
            previewGrid.innerHTML = '';
            selectedFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement('div');
                    div.className = 'preview-item';
                    div.innerHTML = \`
                        <img src="\${e.target.result}" alt="\${file.name}">
                        <div class="filename">\${file.name}</div>
                    \`;
                    div.onclick = () => {
                        selectedFiles.splice(index, 1);
                        updatePreview();
                        uploadBtn.disabled = selectedFiles.length === 0;
                    };
                    previewGrid.appendChild(div);
                };
                reader.readAsDataURL(file);
            });
        }
        
        function showToast(message, isError = false) {
            toast.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        
        uploadBtn.addEventListener('click', async () => {
            if (selectedFiles.length === 0) return;
            
            uploadBtn.disabled = true;
            uploadBtn.textContent = '⏳ 上传中...';
            
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            
            try {
                const response = await fetch('/api/upload/design', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showToast('✅ 上传成功！共 ' + result.uploaded.length + ' 个文件');
                    selectedFiles = [];
                    updatePreview();
                } else {
                    showToast('❌ ' + result.message, true);
                }
            } catch (error) {
                showToast('❌ 上传失败：' + error.message, true);
            }
            
            uploadBtn.disabled = false;
            uploadBtn.textContent = '🚀 上传到服务器';
        });
    </script>
</body>
</html>
`

// 获取上传页面
app.get('/', (c) => {
  return c.html(uploadPageHTML)
})

// 存储上传的文件信息
const uploadedFiles: Array<{
  name: string
  size: number
  type: string
  uploadedAt: string
  base64: string
}> = []

// 处理文件上传
app.post('/design', async (c) => {
  try {
    const formData = await c.req.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return c.json({ success: false, message: '没有选择文件' }, 400)
    }
    
    const uploaded: Array<{ name: string; size: number }> = []
    
    for (const file of files) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      
      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        base64: base64
      })
      
      uploaded.push({
        name: file.name,
        size: file.size
      })
    }
    
    return c.json({
      success: true,
      message: '上传成功',
      uploaded,
      total: uploadedFiles.length
    })
  } catch (error) {
    console.error('上传错误:', error)
    return c.json({ success: false, message: '上传失败' }, 500)
  }
})

// 获取已上传的文件列表
app.get('/list', (c) => {
  return c.json({
    success: true,
    files: uploadedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      uploadedAt: f.uploadedAt
    })),
    total: uploadedFiles.length
  })
})

// 获取单个文件
app.get('/file/:name', (c) => {
  const name = c.req.param('name')
  const file = uploadedFiles.find(f => f.name === name)
  
  if (!file) {
    return c.json({ success: false, message: '文件不存在' }, 404)
  }
  
  const buffer = Buffer.from(file.base64, 'base64')
  return new Response(buffer, {
    headers: {
      'Content-Type': file.type,
      'Content-Disposition': `inline; filename="${file.name}"`
    }
  })
})

export default app

