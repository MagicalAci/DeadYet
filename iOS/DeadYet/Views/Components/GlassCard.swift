//
//  GlassCard.swift
//  DeadYet - 还没死？
//
//  Liquid Glass 风格组件
//

import SwiftUI

// MARK: - Glass Card Component
struct GlassCard<Content: View>: View {
    let content: Content
    var cornerRadius: CGFloat = 20
    var padding: CGFloat = 16
    
    init(
        cornerRadius: CGFloat = 20,
        padding: CGFloat = 16,
        @ViewBuilder content: () -> Content
    ) {
        self.cornerRadius = cornerRadius
        self.padding = padding
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(padding)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(
                        LinearGradient(
                            colors: [.white.opacity(0.3), .white.opacity(0.1), .clear],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            }
            .shadow(color: .black.opacity(0.2), radius: 10, y: 5)
    }
}

// MARK: - Floating Action Button
struct FloatingActionButton: View {
    let icon: String
    let color: Color
    let action: () -> Void
    
    @State private var isPressed: Bool = false
    
    var body: some View {
        Button(action: {
            haptic(.medium)
            action()
        }) {
            Image(systemName: icon)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
                .frame(width: 60, height: 60)
                .background(
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [color, color.opacity(0.8)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                )
                .shadow(color: color.opacity(0.4), radius: 10, y: 5)
                .scaleEffect(isPressed ? 0.9 : 1)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
    }
}

// MARK: - Pulse Animation View
struct PulseView: View {
    let color: Color
    @State private var animate = false
    
    var body: some View {
        ZStack {
            Circle()
                .fill(color.opacity(0.3))
                .scaleEffect(animate ? 1.5 : 1)
                .opacity(animate ? 0 : 1)
            
            Circle()
                .fill(color.opacity(0.5))
                .scaleEffect(animate ? 1.2 : 1)
                .opacity(animate ? 0.5 : 1)
            
            Circle()
                .fill(color)
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: false)) {
                animate = true
            }
        }
    }
}

// MARK: - Loading Indicator
struct LoadingIndicator: View {
    let message: String
    @State private var rotation: Double = 0
    
    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 4)
                    .frame(width: 50, height: 50)
                
                Circle()
                    .trim(from: 0, to: 0.7)
                    .stroke(
                        LinearGradient(
                            colors: [.deadRed, .deadRed.opacity(0.5)],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        style: StrokeStyle(lineWidth: 4, lineCap: .round)
                    )
                    .frame(width: 50, height: 50)
                    .rotationEffect(.degrees(rotation))
            }
            
            Text(message)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.gray)
        }
        .onAppear {
            withAnimation(.linear(duration: 1).repeatForever(autoreverses: false)) {
                rotation = 360
            }
        }
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var action: (() -> Void)? = nil
    var actionTitle: String = "重试"
    
    var body: some View {
        VStack(spacing: 20) {
            Text(icon)
                .font(.system(size: 60))
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                
                Text(message)
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            if let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.deadRed)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(
                            Capsule()
                                .stroke(Color.deadRed, lineWidth: 1.5)
                        )
                }
            }
        }
        .padding(40)
    }
}

// MARK: - Status Badge
struct StatusBadge: View {
    enum Status {
        case online
        case offline
        case working
        case checkedIn
        
        var color: Color {
            switch self {
            case .online, .checkedIn: return .aliveGreen
            case .offline: return .gray
            case .working: return .deadRed
            }
        }
        
        var label: String {
            switch self {
            case .online: return "在线"
            case .offline: return "离线"
            case .working: return "加班中"
            case .checkedIn: return "已下班"
            }
        }
    }
    
    let status: Status
    
    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(status.color)
                .frame(width: 8, height: 8)
            
            Text(status.label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(status.color)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(
            Capsule()
                .fill(status.color.opacity(0.15))
        )
    }
}

// MARK: - Countdown Timer View
struct CountdownView: View {
    let targetHour: Int // 下班时间（小时）
    let targetMinute: Int // 下班时间（分钟）
    
    @State private var timeRemaining: TimeInterval = 0
    @State private var timer: Timer?
    
    var body: some View {
        VStack(spacing: 8) {
            if timeRemaining > 0 {
                Text("距离下班还有")
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
                
                Text(formatTime(timeRemaining))
                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                    .foregroundColor(.struggleYellow)
            } else {
                Text("🎉")
                    .font(.system(size: 40))
                
                Text("下班时间到！")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.aliveGreen)
            }
        }
        .onAppear {
            calculateTimeRemaining()
            startTimer()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
    
    private func calculateTimeRemaining() {
        let now = Date()
        let calendar = Calendar.current
        
        var targetComponents = calendar.dateComponents([.year, .month, .day], from: now)
        targetComponents.hour = targetHour
        targetComponents.minute = targetMinute
        targetComponents.second = 0
        
        if let targetDate = calendar.date(from: targetComponents) {
            let remaining = targetDate.timeIntervalSince(now)
            timeRemaining = max(0, remaining)
        }
    }
    
    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
            }
        }
    }
    
    private func formatTime(_ interval: TimeInterval) -> String {
        let hours = Int(interval) / 3600
        let minutes = (Int(interval) % 3600) / 60
        let seconds = Int(interval) % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }
}

// MARK: - Preview
struct GlassCard_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.darkBg.ignoresSafeArea()
            
            VStack(spacing: 30) {
                GlassCard {
                    VStack {
                        Text("🐂 Liquid Glass Card")
                            .font(.headline)
                            .foregroundColor(.white)
                        Text("玻璃质感效果")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                
                HStack(spacing: 20) {
                    StatusBadge(status: .checkedIn)
                    StatusBadge(status: .working)
                    StatusBadge(status: .offline)
                }
                
                CountdownView(targetHour: 18, targetMinute: 0)
                
                FloatingActionButton(icon: "checkmark", color: .deadRed) {
                    print("Tapped!")
                }
                
                LoadingIndicator(message: "正在加载...")
            }
            .padding()
        }
    }
}

