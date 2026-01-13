//
//  LaunchScreenView.swift
//  DeadYet - 还没死？
//
//  启动页面 - 炫酷心电图动画
//

import SwiftUI

struct LaunchScreenView: View {
    @State private var isAnimating = false
    @State private var showLogo = false
    @State private var showTitle = false
    @State private var showTagline = false
    @State private var showCheckmark = false
    @State private var heartbeatPhase: CGFloat = 0
    @State private var pulseScale: CGFloat = 1
    @State private var glowOpacity: Double = 0.3
    
    var body: some View {
        ZStack {
            // 深色渐变背景
            backgroundGradient
            
            // 浮动光斑
            floatingOrbs
            
            // 主内容
            VStack(spacing: 0) {
                Spacer()
                
                // Logo 区域
                logoSection
                
                Spacer()
                    .frame(height: 40)
                
                // 心电图动画
                heartbeatLine
                    .padding(.horizontal, 40)
                
                Spacer()
                    .frame(height: 50)
                
                // 标题
                titleSection
                
                Spacer()
                
                // 底部 tagline
                bottomSection
            }
        }
        .onAppear {
            startAnimations()
        }
    }
    
    // MARK: - Background
    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(hex: "0A0A0F"),
                Color(hex: "12121A"),
                Color(hex: "1A1A2E")
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
    }
    
    private var floatingOrbs: some View {
        ZStack {
            // 红色光晕（左上）
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color.deadRed.opacity(0.3), Color.clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 150
                    )
                )
                .frame(width: 300, height: 300)
                .offset(x: isAnimating ? -100 : -80, y: -250)
                .blur(radius: 40)
            
            // 绿色光晕（右下）
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color.aliveGreen.opacity(0.2), Color.clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 120
                    )
                )
                .frame(width: 250, height: 250)
                .offset(x: isAnimating ? 120 : 100, y: 350)
                .blur(radius: 30)
            
            // 蓝色光晕（中间）
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color(hex: "00D4FF").opacity(0.15), Color.clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 100
                    )
                )
                .frame(width: 200, height: 200)
                .offset(x: isAnimating ? 50 : 30, y: 0)
                .blur(radius: 25)
        }
    }
    
    // MARK: - Logo Section
    private var logoSection: some View {
        ZStack {
            // 脉冲光环
            Circle()
                .stroke(Color.aliveGreen.opacity(glowOpacity), lineWidth: 3)
                .frame(width: 180, height: 180)
                .scaleEffect(pulseScale)
            
            Circle()
                .stroke(Color.aliveGreen.opacity(glowOpacity * 0.5), lineWidth: 2)
                .frame(width: 200, height: 200)
                .scaleEffect(pulseScale * 1.1)
            
            // 主 Logo 背景
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "1C1C1E"), Color(hex: "2C2C2E")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 150, height: 150)
                .shadow(color: Color.deadRed.opacity(0.3), radius: 20)
            
            // 打工牛
            Text("🐂")
                .font(.system(size: 80))
                .scaleEffect(showLogo ? 1 : 0.3)
                .opacity(showLogo ? 1 : 0)
            
            // 绿色勾勾
            if showCheckmark {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color.aliveGreen, Color(hex: "2ECC71")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 36, height: 36)
                    
                    Image(systemName: "checkmark")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                }
                .offset(x: 50, y: 50)
                .scaleEffect(showCheckmark ? 1 : 0)
                .transition(.scale.combined(with: .opacity))
            }
        }
    }
    
    // MARK: - Heartbeat Line
    private var heartbeatLine: some View {
        GeometryReader { geometry in
            ZStack {
                // 背景线
                Path { path in
                    path.move(to: CGPoint(x: 0, y: geometry.size.height / 2))
                    path.addLine(to: CGPoint(x: geometry.size.width, y: geometry.size.height / 2))
                }
                .stroke(Color.gray.opacity(0.2), lineWidth: 2)
                
                // 心电图线
                HeartbeatShape()
                    .trim(from: 0, to: heartbeatPhase)
                    .stroke(
                        LinearGradient(
                            colors: [Color(hex: "00D4FF"), Color.aliveGreen, Color(hex: "00D4FF")],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round)
                    )
                    .shadow(color: Color.aliveGreen.opacity(0.8), radius: 8)
                    .shadow(color: Color(hex: "00D4FF").opacity(0.5), radius: 15)
            }
        }
        .frame(height: 60)
    }
    
    // MARK: - Title Section
    private var titleSection: some View {
        VStack(spacing: 12) {
            Text("还没死？")
                .font(.system(size: 42, weight: .black, design: .rounded))
                .foregroundStyle(
                    LinearGradient(
                        colors: [.white, Color(hex: "E0E0E0")],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .shadow(color: Color.deadRed.opacity(0.3), radius: 10)
                .scaleEffect(showTitle ? 1 : 0.8)
                .opacity(showTitle ? 1 : 0)
            
            Text("DEAD YET?")
                .font(.system(size: 16, weight: .bold, design: .monospaced))
                .foregroundColor(Color.aliveGreen)
                .tracking(8)
                .opacity(showTitle ? 1 : 0)
        }
    }
    
    // MARK: - Bottom Section
    private var bottomSection: some View {
        VStack(spacing: 16) {
            if showTagline {
                VStack(spacing: 6) {
                    Text("打工人的毒舌下班签到")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                    
                    Text("签到一次，存活一天")
                        .font(.system(size: 13))
                        .foregroundColor(.gray)
                }
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
            
            // Loading 指示器
            LoadingPulse()
                .opacity(showTagline ? 1 : 0)
            
            Spacer()
                .frame(height: 50)
        }
    }
    
    // MARK: - Animations
    private func startAnimations() {
        // 1. Logo 弹出
        withAnimation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.2)) {
            showLogo = true
        }
        
        // 2. 心电图动画
        withAnimation(.easeInOut(duration: 1.5).delay(0.5)) {
            heartbeatPhase = 1
        }
        
        // 3. 脉冲动画
        withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true).delay(0.3)) {
            pulseScale = 1.15
            glowOpacity = 0.6
        }
        
        // 4. 勾勾弹出
        withAnimation(.spring(response: 0.5, dampingFraction: 0.6).delay(1.2)) {
            showCheckmark = true
        }
        
        // 5. 标题显示
        withAnimation(.easeOut(duration: 0.5).delay(1.0)) {
            showTitle = true
        }
        
        // 6. Tagline 显示
        withAnimation(.easeOut(duration: 0.5).delay(1.5)) {
            showTagline = true
        }
        
        // 7. 背景浮动
        withAnimation(.easeInOut(duration: 4).repeatForever(autoreverses: true)) {
            isAnimating = true
        }
    }
}

// MARK: - Heartbeat Shape
struct HeartbeatShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let midY = rect.height / 2
        let width = rect.width
        
        // 起点
        path.move(to: CGPoint(x: 0, y: midY))
        
        // 平线段
        path.addLine(to: CGPoint(x: width * 0.2, y: midY))
        
        // 小波动
        path.addLine(to: CGPoint(x: width * 0.25, y: midY - 8))
        path.addLine(to: CGPoint(x: width * 0.3, y: midY))
        
        // 平线段
        path.addLine(to: CGPoint(x: width * 0.35, y: midY))
        
        // 大心跳波形
        path.addLine(to: CGPoint(x: width * 0.4, y: midY - 5))
        path.addLine(to: CGPoint(x: width * 0.45, y: midY + 30))  // 下降
        path.addLine(to: CGPoint(x: width * 0.5, y: midY - 35))   // 大尖峰
        path.addLine(to: CGPoint(x: width * 0.55, y: midY + 15))  // 下降
        path.addLine(to: CGPoint(x: width * 0.6, y: midY))
        
        // 平线段
        path.addLine(to: CGPoint(x: width * 0.7, y: midY))
        
        // 小波动
        path.addLine(to: CGPoint(x: width * 0.75, y: midY - 10))
        path.addLine(to: CGPoint(x: width * 0.8, y: midY))
        
        // 结束平线
        path.addLine(to: CGPoint(x: width, y: midY))
        
        return path
    }
}

// MARK: - Loading Pulse
struct LoadingPulse: View {
    @State private var isAnimating = false
    
    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.aliveGreen, Color(hex: "00D4FF")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 8, height: 8)
                    .scaleEffect(isAnimating ? 1.2 : 0.8)
                    .opacity(isAnimating ? 1 : 0.4)
                    .animation(
                        .easeInOut(duration: 0.6)
                        .repeatForever(autoreverses: true)
                        .delay(Double(index) * 0.2),
                        value: isAnimating
                    )
            }
        }
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - Preview
struct LaunchScreenView_Previews: PreviewProvider {
    static var previews: some View {
        LaunchScreenView()
    }
}
