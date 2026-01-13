/**
 * 设计资源上传 API - 包含 AI 图像生成提示词
 * 图片保存到本地 uploads 目录，可提交到 GitHub
 */

import { Hono } from 'hono'
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const app = new Hono()

// 获取 uploads 目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const uploadsDir = join(__dirname, '../../uploads')

// 确保 uploads 目录存在
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true })
}

// 设计资源定义 - 包含 AI 生成提示词
const designAssets = [
  {
    id: 'icon-1024',
    name: 'App Icon 应用图标',
    filename: 'icon-1024.png',
    size: '1024×1024 px',
    format: 'PNG（无透明背景）',
    required: true,
    category: 'icon',
    description: '应用图标，显示在用户手机主屏幕上，是 App 的门面',
    aiPrompt: '一个极简的 App 图标设计，深黑色背景 (#1C1C1E)，中央是一个明亮的绿色对勾符号 (#34C759)，对勾下方有一条红色的心电图波形线 (#FF3B30)，象征"还活着"的生命体征。整体风格简洁有力，具有科技感和黑色幽默感。或者：一个可爱但疲惫的牛头剪影，深色背景，牛的眼睛是两个绿色的打卡成功点，表情带着一丝无奈但倔强。圆角方形图标，无透明区域。'
  },
  {
    id: 'launch',
    name: '启动屏 Launch Screen',
    filename: 'launch.png',
    size: '1290×2796 px',
    format: 'PNG',
    required: false,
    category: 'screen',
    description: 'App 启动时显示的全屏画面，给用户的第一印象',
    aiPrompt: '手机 App 启动屏设计，深黑色渐变背景（从 #1C1C1E 到 #2C2C2E），正中央位置显示 App Logo（一个绿色对勾+心电图线的组合），Logo 下方有一行小字"又活过一天"，字体为白色，整体风格暗黑简约，有一种打工人自嘲的黑色幽默感。竖版手机屏幕尺寸 1290×2796。'
  },
  {
    id: 'banner-lv1',
    name: '锦旗 Lv.1 新鲜韭菜',
    filename: 'banner-lv1.png',
    size: '800×1200 px',
    format: 'PNG（可透明背景）',
    required: false,
    category: 'banner',
    description: '签到 1-7 天解锁的成就锦旗，新手级别',
    aiPrompt: '中国传统锦旗设计，嫩绿色 (#4CAF50) 为主色调，锦旗顶部有金色挂杆和流苏装饰。锦旗正中大字"新鲜韭菜"，下方小字"恭喜你活着回来了"。锦旗底部装饰有可爱的卡通韭菜/嫩芽图案。整体风格是传统锦旗形式但带有互联网梗的趣味感。竖版 800×1200 尺寸，可透明背景。'
  },
  {
    id: 'banner-lv2',
    name: '锦旗 Lv.2 牛马新星',
    filename: 'banner-lv2.png',
    size: '800×1200 px',
    format: 'PNG（可透明背景）',
    required: false,
    category: 'banner',
    description: '签到 8-30 天解锁的成就锦旗，初级打工人',
    aiPrompt: '中国传统锦旗设计，铜色/棕色 (#CD7F32) 金属质感为主色调，有光泽反射效果。锦旗正中大字"牛马新星"，下方小字"初露锋芒的社畜"。装饰元素包括可爱的牛头和马头剪影，以及闪烁的星星图案。整体有铜牌奖章的荣誉感。竖版 800×1200 尺寸，可透明背景。'
  },
  {
    id: 'banner-lv3',
    name: '锦旗 Lv.3 资深社畜',
    filename: 'banner-lv3.png',
    size: '800×1200 px',
    format: 'PNG（可透明背景）',
    required: false,
    category: 'banner',
    description: '签到 31-90 天解锁的成就锦旗，老员工级别',
    aiPrompt: '中国传统锦旗设计，银色 (#C0C0C0) 金属光泽为主色调，有高级质感。锦旗正中大字"资深社畜"，下方小字"久经沙场，百毒不侵"。装饰元素是一个戴着工牌的小人剪影，表情坚毅。整体有银牌荣誉的质感，比铜色更高级。竖版 800×1200 尺寸，可透明背景。'
  },
  {
    id: 'banner-lv4',
    name: '锦旗 Lv.4 钢铁打工人',
    filename: 'banner-lv4.png',
    size: '800×1200 px',
    format: 'PNG（可透明背景）',
    required: false,
    category: 'banner',
    description: '签到 91-180 天解锁的成就锦旗，资深级别',
    aiPrompt: '中国传统锦旗设计，金色 (#FFD700) 华丽质感为主色调，有金光闪闪的效果。锦旗正中大字"钢铁打工人"，下方小字"打不死的小强"。装饰元素包括钢铁质感的盾牌或徽章图案，象征坚不可摧。整体有金牌冠军的荣耀感。竖版 800×1200 尺寸，可透明背景。'
  },
  {
    id: 'banner-lv5',
    name: '锦旗 Lv.5 不死老兵',
    filename: 'banner-lv5.png',
    size: '800×1200 px',
    format: 'PNG（可透明背景）',
    required: false,
    category: 'banner',
    description: '签到 181-365 天解锁的成就锦旗，传奇级别',
    aiPrompt: '中国传统锦旗设计，钻石蓝色 (#00CED1) 闪耀质感为主色调，有钻石般的光芒四射效果。锦旗正中大字"不死老兵"，下方小字"传说中的存在"。装饰元素包括军功章、勋章样式的图案，有战争老兵的荣誉感。整体极其华丽闪耀。竖版 800×1200 尺寸，可透明背景。'
  },
  {
    id: 'banner-lv6',
    name: '锦旗 Lv.6 传奇牛马',
    filename: 'banner-lv6.png',
    size: '800×1200 px',
    format: 'PNG（可透明背景）',
    required: false,
    category: 'banner',
    description: '签到 365+ 天解锁的最高成就锦旗，至尊级别',
    aiPrompt: '中国传统锦旗设计，彩虹渐变色为主色调，极度华丽炫目，有光芒万丈的神圣效果。锦旗正中大字"传奇牛马"，下方小字"一年不死，必成大器"。装饰元素包括金色皇冠、光芒四射的特效、彩带飘扬。整体是最高等级的至尊荣誉，让人一看就知道这是顶级成就。竖版 800×1200 尺寸，可透明背景。'
  },
  {
    id: 'emoji-cow',
    name: '表情 - 疲惫老牛',
    filename: 'emoji-cow.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区的牛头表情',
    aiPrompt: '一个可爱的卡通牛头表情包，牛的表情非常疲惫，眼睛无神下垂，眼圈发黑，但嘴角还是微微上扬表示还在坚持。整体风格是可爱的 emoji 表情风格，线条简洁，颜色饱和。256×256 尺寸，透明背景。'
  },
  {
    id: 'emoji-horse',
    name: '表情 - 累趴驴子',
    filename: 'emoji-horse.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区的马头表情',
    aiPrompt: '一个可爱的卡通驴子/马头表情包，表情极度疲惫，汗流浃背，额头上有大滴汗珠，舌头都快吐出来了，但眼神还有一丝倔强。整体风格是可爱的 emoji 表情风格。256×256 尺寸，透明背景。'
  },
  {
    id: 'emoji-dog',
    name: '表情 - 加班狗',
    filename: 'emoji-dog.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区的加班狗表情',
    aiPrompt: '一个可爱的卡通狗头表情包，狗狗趴在电脑前的姿势，眼睛通红布满血丝，表情疲惫但还在敲键盘，旁边可以有一杯咖啡。代表深夜加班的状态。整体风格是可爱的 emoji 表情风格。256×256 尺寸，透明背景。'
  },
  {
    id: 'emoji-skull',
    name: '表情 - 社死骷髅',
    filename: 'emoji-skull.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区的社死表情',
    aiPrompt: '一个卡通骷髅头表情包，骷髅脖子上挂着一个公司工牌，表情带着一丝黑色幽默的微笑。代表"社会性死亡"或"累死了"的状态。整体风格是可爱中带点暗黑的 emoji 风格。256×256 尺寸，透明背景。'
  },
  {
    id: 'emoji-angry',
    name: '表情 - 愤怒冒烟',
    filename: 'emoji-angry.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区的愤怒表情',
    aiPrompt: '一个卡通愤怒表情包，脸涨得通红，眉毛倒竖，头顶冒着腾腾热气和火焰，嘴巴大张在怒吼。代表被气到爆炸、想骂人的状态。整体风格是夸张的可爱 emoji 风格。256×256 尺寸，透明背景。'
  },
  {
    id: 'emoji-cry',
    name: '表情 - 崩溃大哭',
    filename: 'emoji-cry.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区的崩溃哭泣表情',
    aiPrompt: '一个卡通崩溃大哭表情包，眼泪像瀑布一样喷涌而出，嘴巴大张在嚎啕大哭，表情极度崩溃绝望。代表工作压力太大、彻底崩溃的状态。整体风格是夸张的可爱 emoji 风格。256×256 尺寸，透明背景。'
  },
  {
    id: 'emoji-party',
    name: '表情 - 下班狂欢',
    filename: 'emoji-party.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区的庆祝表情',
    aiPrompt: '一个卡通狂欢庆祝表情包，表情极度开心兴奋，嘴巴大笑，周围有彩带、礼花、星星在飞舞，可以戴着派对帽。代表终于下班、解放了的喜悦状态。整体风格是欢快的可爱 emoji 风格。256×256 尺寸，透明背景。'
  },
  {
    id: 'emoji-sleep',
    name: '表情 - 困死了',
    filename: 'emoji-sleep.png',
    size: '256×256 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'emoji',
    description: '用户头像/评论区的困倦表情',
    aiPrompt: '一个卡通困倦表情包，眼睛半闭快睁不开了，嘴巴在打哈欠，头顶有 Zzz 的睡眠符号，可能还有一条口水。代表困得要死、想睡觉的状态。整体风格是可爱的 emoji 风格。256×256 尺寸，透明背景。'
  },
  {
    id: 'pin-working',
    name: '地图标记 - 上班中',
    filename: 'pin-working.png',
    size: '64×64 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'map',
    description: '地图上显示"还在上班"的位置标记',
    aiPrompt: '一个地图位置标记图标，红色 (#FF3B30) 为主色，水滴形状的定位标记，中间可以有火焰或警告符号，表示"还在上班、还没下班"的紧急状态。风格简洁清晰，适合在地图上显示。64×64 尺寸，透明背景。'
  },
  {
    id: 'pin-offwork',
    name: '地图标记 - 已下班',
    filename: 'pin-offwork.png',
    size: '64×64 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'map',
    description: '地图上显示"已下班"的位置标记',
    aiPrompt: '一个地图位置标记图标，绿色 (#34C759) 为主色，水滴形状的定位标记，中间是一个对勾或笑脸符号，表示"已经下班、安全回家"的状态。风格简洁清晰，适合在地图上显示。64×64 尺寸，透明背景。'
  },
  {
    id: 'pin-overtime',
    name: '地图标记 - 加班中',
    filename: 'pin-overtime.png',
    size: '64×64 px',
    format: 'PNG（透明背景）',
    required: false,
    category: 'map',
    description: '地图上显示"加班中"的位置标记',
    aiPrompt: '一个地图位置标记图标，橙色/黄色 (#FF9500) 为主色，水滴形状的定位标记，中间是一个警告三角符号 ⚠️，表示"正在加班、超时工作"的警告状态。风格简洁清晰，适合在地图上显示。64×64 尺寸，透明背景。'
  }
]

// 内存缓存（用于快速查询状态）
const uploadedFiles: Map<string, {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  filename: string
  filePath: string
}> = new Map()

// 启动时扫描 uploads 目录，加载已有文件
function loadExistingUploads() {
  if (!existsSync(uploadsDir)) return
  
  const files = readdirSync(uploadsDir)
  for (const filename of files) {
    const asset = designAssets.find(a => a.filename === filename)
    if (asset) {
      const filePath = join(uploadsDir, filename)
      uploadedFiles.set(asset.id, {
        id: asset.id,
        name: asset.name,
        size: 0,
        type: 'image/png',
        uploadedAt: new Date().toISOString(),
        filename: filename,
        filePath: filePath
      })
      console.log(`📁 已加载文件: ${filename}`)
    }
  }
}

loadExistingUploads()

// 生成上传页面 HTML
const getUploadPageHTML = () => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>还没死？- 设计资源上传中心</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
            padding: 20px;
            line-height: 1.6;
        }
        
        .container { max-width: 1100px; margin: 0 auto; }
        
        header { text-align: center; padding: 50px 0 40px; }
        
        h1 {
            font-size: 3rem;
            background: linear-gradient(135deg, #FF3B30 0%, #FF6B30 50%, #FFD700 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 12px;
            font-weight: 800;
        }
        
        .subtitle { color: #8E8E93; font-size: 1.2rem; }
        
        /* 配色区域 */
        .color-section {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 20px;
            padding: 28px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .color-section h2 {
            font-size: 1.4rem;
            margin-bottom: 20px;
            color: #FFD700;
        }
        
        .color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
        }
        
        .color-card {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
        }
        
        .color-box {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            margin: 0 auto 10px;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .color-name { font-weight: 600; margin-bottom: 4px; }
        .color-value { font-size: 0.85rem; color: #8E8E93; font-family: monospace; }
        
        /* 资源分类 */
        .section {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 20px;
            padding: 28px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .section h2 {
            font-size: 1.5rem;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .section h2 .emoji { font-size: 1.8rem; }
        
        /* 资源卡片 */
        .asset-card {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }
        
        .asset-card:hover {
            border-color: rgba(255, 215, 0, 0.3);
            transform: translateY(-2px);
        }
        
        .asset-card.uploaded {
            border-color: #34C759;
            background: rgba(52, 199, 89, 0.1);
        }
        
        .asset-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 12px;
        }
        
        .asset-title h3 {
            font-size: 1.2rem;
            margin-bottom: 6px;
        }
        
        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
        }
        
        .badge.required { background: rgba(255, 59, 48, 0.25); color: #FF6B6B; }
        .badge.optional { background: rgba(142, 142, 147, 0.2); color: #A0A0A5; }
        .badge.uploaded { background: rgba(52, 199, 89, 0.25); color: #4ADE80; }
        
        /* 规格信息 */
        .specs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .spec-item {
            background: rgba(255, 255, 255, 0.04);
            padding: 12px 14px;
            border-radius: 10px;
        }
        
        .spec-item label {
            display: block;
            font-size: 0.7rem;
            color: #8E8E93;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .spec-item span {
            font-size: 0.95rem;
            font-weight: 500;
        }
        
        /* 描述区域 */
        .desc-box {
            background: rgba(255, 255, 255, 0.03);
            padding: 18px;
            border-radius: 12px;
            margin-bottom: 16px;
            border-left: 3px solid #FFD700;
        }
        
        .desc-box h4 {
            font-size: 0.85rem;
            color: #FFD700;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .desc-box p {
            font-size: 0.95rem;
            color: #ccc;
            line-height: 1.7;
        }
        
        /* AI 提示词区域 - 重点突出 */
        .ai-prompt-box {
            background: linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 107, 48, 0.1) 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 107, 48, 0.3);
            position: relative;
        }
        
        .ai-prompt-box h4 {
            font-size: 0.9rem;
            color: #FF6B30;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .ai-prompt-box p {
            font-size: 0.92rem;
            color: #eee;
            line-height: 1.8;
            background: rgba(0, 0, 0, 0.3);
            padding: 16px;
            border-radius: 8px;
            font-family: 'PingFang SC', sans-serif;
        }
        
        .copy-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(255, 107, 48, 0.3);
            border: none;
            color: #FF6B30;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .copy-btn:hover {
            background: rgba(255, 107, 48, 0.5);
        }
        
        /* 上传区域 */
        .upload-area {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .upload-btn {
            background: linear-gradient(135deg, #FF3B30 0%, #FF6B30 100%);
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 12px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(255, 59, 48, 0.3);
        }
        
        .upload-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 59, 48, 0.4);
        }
        
        .upload-btn.success {
            background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
            box-shadow: 0 4px 15px rgba(52, 199, 89, 0.3);
        }
        
        .preview-img {
            width: 70px;
            height: 70px;
            object-fit: contain;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            display: none;
        }
        
        .file-input { display: none; }
        
        .status-text {
            font-size: 0.9rem;
            color: #8E8E93;
        }
        
        .status-text.success { color: #34C759; }
        
        /* Toast 提示 */
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #34C759;
            color: white;
            padding: 18px 28px;
            border-radius: 14px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 1000;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }
        
        .toast.show { opacity: 1; }
        .toast.error { background: #FF3B30; }
        
        footer {
            text-align: center;
            padding: 50px 20px;
            color: #666;
        }
        
        footer a { color: #FF6B30; text-decoration: none; }
        
        @media (max-width: 768px) {
            .specs { grid-template-columns: 1fr; }
            .upload-area { flex-direction: column; align-items: flex-start; }
            h1 { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🐂🐴 还没死？</h1>
            <p class="subtitle">设计资源上传中心 · AI 图像生成提示词</p>
        </header>
        
        <!-- 配色规范 -->
        <div class="color-section">
            <h2>🎨 配色规范</h2>
            <div class="color-grid">
                <div class="color-card">
                    <div class="color-box" style="background: #FF3B30"></div>
                    <div class="color-name">警告红</div>
                    <div class="color-value">#FF3B30</div>
                </div>
                <div class="color-card">
                    <div class="color-box" style="background: #34C759"></div>
                    <div class="color-name">存活绿</div>
                    <div class="color-value">#34C759</div>
                </div>
                <div class="color-card">
                    <div class="color-box" style="background: #1C1C1E"></div>
                    <div class="color-name">深黑背景</div>
                    <div class="color-value">#1C1C1E</div>
                </div>
                <div class="color-card">
                    <div class="color-box" style="background: #FFD700"></div>
                    <div class="color-name">成就金</div>
                    <div class="color-value">#FFD700</div>
                </div>
                <div class="color-card">
                    <div class="color-box" style="background: #CD7F32"></div>
                    <div class="color-name">铜色</div>
                    <div class="color-value">#CD7F32</div>
                </div>
                <div class="color-card">
                    <div class="color-box" style="background: #C0C0C0"></div>
                    <div class="color-name">银色</div>
                    <div class="color-value">#C0C0C0</div>
                </div>
                <div class="color-card">
                    <div class="color-box" style="background: #00CED1"></div>
                    <div class="color-name">钻石蓝</div>
                    <div class="color-value">#00CED1</div>
                </div>
            </div>
        </div>
        
        <!-- App Icon -->
        <div class="section">
            <h2><span class="emoji">📱</span> 应用图标（必须）</h2>
            ${renderAssetCard(designAssets.find(a => a.id === 'icon-1024')!)}
        </div>
        
        <!-- 启动屏 -->
        <div class="section">
            <h2><span class="emoji">🚀</span> 启动屏</h2>
            ${renderAssetCard(designAssets.find(a => a.id === 'launch')!)}
        </div>
        
        <!-- 锦旗系列 -->
        <div class="section">
            <h2><span class="emoji">🏆</span> 成就锦旗（6个等级）</h2>
            ${designAssets.filter(a => a.category === 'banner').map(a => renderAssetCard(a)).join('')}
        </div>
        
        <!-- 表情贴纸 -->
        <div class="section">
            <h2><span class="emoji">😀</span> 表情贴纸</h2>
            ${designAssets.filter(a => a.category === 'emoji').map(a => renderAssetCard(a)).join('')}
        </div>
        
        <!-- 地图标记 -->
        <div class="section">
            <h2><span class="emoji">🗺️</span> 地图标记</h2>
            ${designAssets.filter(a => a.category === 'map').map(a => renderAssetCard(a)).join('')}
        </div>
        
        <footer>
            <p>还没死？ v1.0.0 | <a href="/">API 文档</a> | 共 ${designAssets.length} 个设计资源</p>
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
        
        function copyPrompt(assetId) {
            const promptEl = document.getElementById('prompt-' + assetId);
            navigator.clipboard.writeText(promptEl.textContent).then(() => {
                showToast('✅ AI 提示词已复制到剪贴板！');
            });
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
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    showToast('❌ ' + result.message, true);
                    btn.textContent = '📤 上传图片';
                }
            } catch (error) {
                showToast('❌ 上传失败: ' + error.message, true);
                btn.textContent = '📤 上传图片';
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
            </div>
            <span class="badge ${asset.required ? 'required' : 'optional'}">
                ${asset.required ? '✱ 必须' : '可选'}
            </span>
        </div>
        
        <div class="specs">
            <div class="spec-item">
                <label>尺寸</label>
                <span>${asset.size}</span>
            </div>
            <div class="spec-item">
                <label>格式</label>
                <span>${asset.format}</span>
            </div>
            <div class="spec-item">
                <label>文件名</label>
                <span>${asset.filename}</span>
            </div>
        </div>
        
        <div class="desc-box">
            <h4>📝 用途说明</h4>
            <p>${asset.description}</p>
        </div>
        
        <div class="ai-prompt-box">
            <h4>🤖 AI 图像生成提示词（复制使用）</h4>
            <button class="copy-btn" onclick="copyPrompt('${asset.id}')">📋 复制</button>
            <p id="prompt-${asset.id}">${asset.aiPrompt}</p>
        </div>
        
        <div class="upload-area">
            <input type="file" class="file-input" id="input-${asset.id}" 
                   accept="image/*" onchange="uploadFile('${asset.id}', this)">
            <button class="upload-btn" onclick="triggerUpload('${asset.id}')">
                📤 上传图片
            </button>
            <img class="preview-img" alt="预览">
            <span class="status-text">等待上传...</span>
        </div>
    </div>
  `
}

// 路由
app.get('/', (c) => {
  return c.html(getUploadPageHTML())
})

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
    const uint8Array = new Uint8Array(buffer)
    
    // 保存到本地文件系统
    const filePath = join(uploadsDir, asset.filename)
    writeFileSync(filePath, uint8Array)
    
    // 同时保存到内存（用于快速访问）
    uploadedFiles.set(assetId, {
      id: assetId,
      name: asset.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      filename: asset.filename,
      filePath: filePath
    })
    
    console.log(`✅ 文件已保存: ${filePath}`)
    
    return c.json({
      success: true,
      message: '上传成功，文件已保存到本地',
      id: assetId,
      name: asset.name,
      filename: asset.filename,
      path: `uploads/${asset.filename}`
    })
  } catch (error) {
    console.error('上传错误:', error)
    return c.json({ success: false, message: '上传失败' }, 500)
  }
})

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

app.get('/file/:id', (c) => {
  const id = c.req.param('id')
  const asset = designAssets.find(a => a.id === id)
  
  if (!asset) {
    return c.json({ success: false, message: '未知的资源类型' }, 404)
  }
  
  const filePath = join(uploadsDir, asset.filename)
  
  // 先尝试从文件系统读取
  if (existsSync(filePath)) {
    const buffer = readFileSync(filePath)
    const mimeType = asset.filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
    
    return new Response(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${asset.filename}"`
      }
    })
  }
  
  // 回退到内存
  const file = uploadedFiles.get(id)
  if (!file) {
    return c.json({ success: false, message: '文件不存在' }, 404)
  }
  
  return c.json({ success: false, message: '文件不存在' }, 404)
})

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
