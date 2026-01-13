//
//  BannerView.swift
//  DeadYet - 还没死？
//
//  锦旗生成视图
//

import SwiftUI

struct BannerView: View {
    let level: BannerLevel
    let survivalDays: Int
    let complaint: String?
    
    @State private var showConfetti: Bool = false
    
    var body: some View {
        ZStack {
            // 锦旗主体
            bannerBody
            
            // 撒花效果
            if showConfetti {
                ConfettiView()
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                showConfetti = true
            }
        }
    }
    
    // MARK: - Banner Body
    private var bannerBody: some View {
        VStack(spacing: 0) {
            // 顶部挂杆
            HStack {
                Circle()
                    .fill(Color(hex: "8B4513"))
                    .frame(width: 20, height: 20)
                
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [Color(hex: "8B4513"), Color(hex: "A0522D")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(height: 12)
                
                Circle()
                    .fill(Color(hex: "8B4513"))
                    .frame(width: 20, height: 20)
            }
            .frame(width: 280)
            
            // 锦旗主体
            ZStack {
                // 锦旗形状
                BannerShape()
                    .fill(
                        LinearGradient(
                            colors: bannerColors,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 260, height: 360)
                    .shadow(color: .black.opacity(0.3), radius: 10, y: 5)
                
                // 锦旗边框
                BannerShape()
                    .stroke(
                        LinearGradient(
                            colors: [.white.opacity(0.6), .white.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 3
                    )
                    .frame(width: 260, height: 360)
                
                // 内容
                VStack(spacing: 16) {
                    // 等级图标
                    Text(level.emoji)
                        .font(.system(size: 60))
                        .shadow(color: .black.opacity(0.3), radius: 5)
                    
                    // 标题
                    Text("恭喜存活")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                    
                    // 天数
                    Text("\(survivalDays)")
                        .font(.system(size: 72, weight: .black, design: .rounded))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [.white, .white.opacity(0.8)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .shadow(color: .black.opacity(0.3), radius: 3, y: 2)
                    
                    Text("天")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white.opacity(0.9))
                    
                    // 等级称号
                    Text(level.rawValue)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .fill(.white.opacity(0.2))
                        )
                    
                    // 抱怨内容（如果有）
                    if let complaint = complaint, !complaint.isEmpty {
                        Text("「\(complaint.prefix(30))...」")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                            .lineLimit(2)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }
                }
                .padding(.top, 20)
            }
        }
    }
    
    // MARK: - Banner Colors
    private var bannerColors: [Color] {
        switch level {
        case .freshLeek:
            return [Color(hex: "4CAF50"), Color(hex: "2E7D32")]
        case .newbieSlave:
            return [Color(hex: "CD7F32"), Color(hex: "8B4513")]
        case .seniorSlave:
            return [Color(hex: "C0C0C0"), Color(hex: "808080")]
        case .steelWorker:
            return [Color(hex: "FFD700"), Color(hex: "FFA500"), Color(hex: "FF8C00")]
        case .immortalVeteran:
            return [Color(hex: "E5E4E2"), Color(hex: "BCC6CC"), Color(hex: "A0A0A0")]
        case .legendaryOx:
            return [Color(hex: "FF6B6B"), Color(hex: "4ECDC4"), Color(hex: "45B7D1"), Color(hex: "96CEB4")]
        }
    }
}

// MARK: - Banner Shape
struct BannerShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let width = rect.width
        let height = rect.height
        let cornerRadius: CGFloat = 8
        let bottomCutDepth: CGFloat = 30
        
        // 从左上角开始
        path.move(to: CGPoint(x: cornerRadius, y: 0))
        
        // 上边
        path.addLine(to: CGPoint(x: width - cornerRadius, y: 0))
        
        // 右上角圆角
        path.addQuadCurve(
            to: CGPoint(x: width, y: cornerRadius),
            control: CGPoint(x: width, y: 0)
        )
        
        // 右边
        path.addLine(to: CGPoint(x: width, y: height - bottomCutDepth))
        
        // 底部V形切口
        path.addLine(to: CGPoint(x: width / 2, y: height))
        path.addLine(to: CGPoint(x: 0, y: height - bottomCutDepth))
        
        // 左边
        path.addLine(to: CGPoint(x: 0, y: cornerRadius))
        
        // 左上角圆角
        path.addQuadCurve(
            to: CGPoint(x: cornerRadius, y: 0),
            control: CGPoint(x: 0, y: 0)
        )
        
        path.closeSubpath()
        
        return path
    }
}

// MARK: - Confetti View
struct ConfettiView: View {
    @State private var particles: [ConfettiParticle] = []
    
    var body: some View {
        ZStack {
            ForEach(particles) { particle in
                particle.shape
                    .fill(particle.color)
                    .frame(width: particle.size, height: particle.size)
                    .rotationEffect(.degrees(particle.rotation))
                    .position(particle.position)
                    .opacity(particle.opacity)
            }
        }
        .onAppear {
            generateParticles()
            animateParticles()
        }
    }
    
    private func generateParticles() {
        let colors: [Color] = [.red, .yellow, .green, .blue, .purple, .orange, .pink]
        let shapes: [AnyShape] = [
            AnyShape(Circle()),
            AnyShape(Rectangle()),
            AnyShape(Star(corners: 5, smoothness: 0.45))
        ]
        
        particles = (0..<50).map { _ in
            ConfettiParticle(
                id: UUID(),
                shape: shapes.randomElement()!,
                color: colors.randomElement()!,
                size: CGFloat.random(in: 8...15),
                position: CGPoint(
                    x: CGFloat.random(in: 100...300),
                    y: -20
                ),
                rotation: Double.random(in: 0...360),
                opacity: 1
            )
        }
    }
    
    private func animateParticles() {
        for i in particles.indices {
            let delay = Double.random(in: 0...0.5)
            let duration = Double.random(in: 2...3)
            
            withAnimation(.easeOut(duration: duration).delay(delay)) {
                particles[i].position = CGPoint(
                    x: particles[i].position.x + CGFloat.random(in: -100...100),
                    y: CGFloat.random(in: 400...600)
                )
                particles[i].rotation += Double.random(in: 180...540)
                particles[i].opacity = 0
            }
        }
    }
}

// MARK: - Confetti Particle
struct ConfettiParticle: Identifiable, @unchecked Sendable {
    let id: UUID
    let shape: AnyShape
    let color: Color
    let size: CGFloat
    var position: CGPoint
    var rotation: Double
    var opacity: Double
}

// MARK: - Star Shape
struct Star: Shape {
    let corners: Int
    let smoothness: CGFloat
    
    func path(in rect: CGRect) -> Path {
        guard corners >= 2 else { return Path() }
        
        let center = CGPoint(x: rect.width / 2, y: rect.height / 2)
        let outerRadius = min(rect.width, rect.height) / 2
        let innerRadius = outerRadius * smoothness
        
        var path = Path()
        
        for i in 0..<corners * 2 {
            let angle = (CGFloat(i) * .pi / CGFloat(corners)) - .pi / 2
            let radius = i.isMultiple(of: 2) ? outerRadius : innerRadius
            let x = center.x + cos(angle) * radius
            let y = center.y + sin(angle) * radius
            
            if i == 0 {
                path.move(to: CGPoint(x: x, y: y))
            } else {
                path.addLine(to: CGPoint(x: x, y: y))
            }
        }
        
        path.closeSubpath()
        return path
    }
}

// MARK: - AnyShape Helper
struct AnyShape: Shape, @unchecked Sendable {
    private let pathBuilder: @Sendable (CGRect) -> Path
    
    init<S: Shape>(_ shape: S) {
        let shapeCopy = shape
        pathBuilder = { rect in
            shapeCopy.path(in: rect)
        }
    }
    
    func path(in rect: CGRect) -> Path {
        pathBuilder(rect)
    }
}

// MARK: - Preview
struct BannerView_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            BannerView(
                level: .steelWorker,
                survivalDays: 128,
                complaint: "领导又让加班了，我真的服了"
            )
        }
    }
}

