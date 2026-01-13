//
//  LaunchScreenView.swift
//  DeadYet - 还没死？
//
//  启动页面
//

import SwiftUI

struct LaunchScreenView: View {
    @State private var isAnimating = false
    @State private var showTagline = false
    @State private var logoScale: CGFloat = 0.5
    @State private var logoOpacity: Double = 0
    
    var body: some View {
        ZStack {
            // 背景
            LinearGradient(
                colors: [
                    Color(hex: "0D0D0D"),
                    Color(hex: "1A1A2E"),
                    Color(hex: "16213E")
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // 装饰光斑
            Circle()
                .fill(Color.deadRed.opacity(0.15))
                .frame(width: 300, height: 300)
                .blur(radius: 80)
                .offset(x: isAnimating ? -50 : 50, y: -200)
            
            Circle()
                .fill(Color(hex: "FF6B5B").opacity(0.1))
                .frame(width: 250, height: 250)
                .blur(radius: 60)
                .offset(x: isAnimating ? 100 : 150, y: 300)
            
            // 内容
            VStack(spacing: 30) {
                Spacer()
                
                // Logo
                VStack(spacing: 20) {
                    Text("🐂")
                        .font(.system(size: 120))
                        .shadow(color: .deadRed.opacity(0.5), radius: 30)
                        .scaleEffect(logoScale)
                        .opacity(logoOpacity)
                    
                    VStack(spacing: 8) {
                        Text("还没死？")
                            .font(.system(size: 48, weight: .black, design: .rounded))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [.white, Color(hex: "CCCCCC")],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .scaleEffect(logoScale)
                            .opacity(logoOpacity)
                        
                        Text("DeadYet")
                            .font(.system(size: 20, weight: .medium, design: .monospaced))
                            .foregroundColor(.gray)
                            .opacity(logoOpacity)
                    }
                }
                
                Spacer()
                
                // Tagline
                if showTagline {
                    VStack(spacing: 8) {
                        Text("打工人的毒舌下班签到")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                        
                        Text("每天签到，记录存活")
                            .font(.system(size: 14))
                            .foregroundColor(.gray)
                    }
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                }
                
                Spacer()
                    .frame(height: 60)
                
                // Loading indicator
                LoadingDots()
                    .opacity(logoOpacity)
                
                Spacer()
                    .frame(height: 40)
            }
        }
        .onAppear {
            startAnimations()
        }
    }
    
    private func startAnimations() {
        // Logo动画
        withAnimation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.2)) {
            logoScale = 1
            logoOpacity = 1
        }
        
        // 背景动画
        withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) {
            isAnimating = true
        }
        
        // Tagline动画
        withAnimation(.easeOut(duration: 0.5).delay(0.8)) {
            showTagline = true
        }
    }
}

// MARK: - Loading Dots
struct LoadingDots: View {
    @State private var animationOffset: Int = 0
    
    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(Color.deadRed)
                    .frame(width: 8, height: 8)
                    .scaleEffect(animationOffset == index ? 1.3 : 1)
                    .opacity(animationOffset == index ? 1 : 0.5)
            }
        }
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.3, repeats: true) { _ in
                withAnimation(.easeInOut(duration: 0.2)) {
                    animationOffset = (animationOffset + 1) % 3
                }
            }
        }
    }
}

// MARK: - Preview
struct LaunchScreenView_Previews: PreviewProvider {
    static var previews: some View {
        LaunchScreenView()
    }
}

