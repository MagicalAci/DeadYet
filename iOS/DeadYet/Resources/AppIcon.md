# 🎨 还没死？ APP图标设计规范

## 设计概念

### 主题
- **核心意象**：牛马 🐂 + 生存/打卡概念
- **情绪表达**：自嘲、黑色幽默、坚韧
- **风格**：简约、现代、有辨识度

### 颜色方案

```
主色调: #FF3B30 (警告红)
辅助色: #1C1C1E (深黑背景)
点缀色: #34C759 (存活绿)
```

## 设计方案

### 方案A：牛头轮廓 + 打卡符号
- 简化的牛头轮廓
- 中间是一个打卡/勾选符号 ✓
- 红黑配色
- 寓意：牛马打卡成功

### 方案B：骷髅牛角
- 骷髅图案配上小牛角
- 问号或感叹号装饰
- 暗示"还没死？"的主题
- 黑色幽默风格

### 方案C：生命值条
- 类似游戏中的HP血条
- 红色填充，还剩最后一点
- 简约的像素风格
- 寓意：打工人的生命值

### 方案D：倒计时时钟
- 时钟形状，指针指向18:00
- 牛角装饰
- 红色主调
- 寓意：等待下班

## 推荐设计规格

### iOS App Icon
- 1024x1024 (App Store)
- 180x180 (@3x iPhone)
- 120x120 (@2x iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad @2x)

### 设计要点
1. **简洁**：在小尺寸下也要清晰可辨
2. **对比**：红黑配色确保在任何背景上突出
3. **无文字**：图标不含文字，靠图形传达
4. **圆角**：iOS自动应用圆角，设计时考虑安全区域

## Figma/Sketch 模板建议

```
画布尺寸: 1024x1024
安全区域: 内缩 10%
导出格式: PNG (无透明)
```

## 示例代码（SwiftUI生成简单图标）

```swift
struct AppIconPreview: View {
    var body: some View {
        ZStack {
            // 背景渐变
            LinearGradient(
                colors: [Color(hex: "FF3B30"), Color(hex: "CC0000")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // 牛马emoji或自定义图形
            Text("🐂")
                .font(.system(size: 500))
                .shadow(color: .black.opacity(0.3), radius: 10)
            
            // 打卡勾选
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 200))
                        .foregroundColor(.white)
                        .offset(x: -50, y: -50)
                }
            }
        }
        .frame(width: 1024, height: 1024)
    }
}
```

---

**建议**：使用Figma或Sketch设计正式图标，可以参考Apple的[Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)

