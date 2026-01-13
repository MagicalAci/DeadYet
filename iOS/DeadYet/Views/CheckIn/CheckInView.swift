//
//  CheckInView.swift
//  DeadYet - 还没死？
//

import SwiftUI

struct CheckInView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var userService: UserService
    
    @State private var complaint: String = ""
    @State private var selectedMood: CheckInRecord.Mood = .neutral
    @State private var isCheckedIn: Bool = false
    @State private var isLoading: Bool = false
    @State private var showBanner: Bool = false
    @State private var aiResponse: String = ""
    @State private var currentTime: Date = Date()
    
    // 动画状态
    @State private var pulseAnimation: Bool = false
    @State private var bannerScale: CGFloat = 0.5
    @State private var bannerRotation: Double = -10
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        ZStack {
            // 背景
            backgroundView
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    // 头部状态
                    headerSection
                    
                    // 存活天数卡片
                    survivalCard
                    
                    // 心情选择
                    moodSelector
                    
                    // 抱怨输入
                    complaintInput
                    
                    // 签到按钮
                    checkInButton
                    
                    // AI回复区域
                    if !aiResponse.isEmpty {
                        aiResponseCard
                    }
                    
                    Spacer(minLength: 100)
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
            }
            
            // 锦旗弹窗
            if showBanner {
                bannerOverlay
            }
        }
        .onReceive(timer) { _ in
            currentTime = Date()
        }
    }
    
    // MARK: - Background
    private var backgroundView: some View {
        ZStack {
            Color.darkBg.ignoresSafeArea()
            
            // 动态光斑
            Circle()
                .fill(Color.deadRed.opacity(0.08))
                .frame(width: 400, height: 400)
                .blur(radius: 100)
                .offset(x: pulseAnimation ? -50 : 50, y: -100)
                .animation(.easeInOut(duration: 4).repeatForever(autoreverses: true), value: pulseAnimation)
                .onAppear { pulseAnimation = true }
        }
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(getGreeting())
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.gray)
                
                Text("还没死？")
                    .font(.system(size: 32, weight: .black, design: .rounded))
                    .foregroundColor(.white)
            }
            
            Spacer()
            
            // 当前时间
            VStack(alignment: .trailing, spacing: 2) {
                Text(currentTime.timeString)
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
                
                Text(getWorkStatus())
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(getWorkStatusColor())
            }
        }
    }
    
    private func getGreeting() -> String {
        let hour = Calendar.current.component(.hour, from: currentTime)
        switch hour {
        case 0..<6: return "深夜了还不睡？"
        case 6..<9: return "早起的牛马"
        case 9..<12: return "上午好，社畜"
        case 12..<14: return "中午好，吃饭了吗"
        case 14..<18: return "下午好，继续苟着"
        case 18..<21: return "晚上了，该撤了"
        case 21..<24: return "这么晚还没走？"
        default: return "你好"
        }
    }
    
    private func getWorkStatus() -> String {
        let hour = Calendar.current.component(.hour, from: currentTime)
        switch hour {
        case 0..<9: return "还没上班"
        case 9..<18: return "摸鱼时间"
        case 18..<21: return "该下班了！"
        case 21..<24: return "严重加班⚠️"
        default: return ""
        }
    }
    
    private func getWorkStatusColor() -> Color {
        let hour = Calendar.current.component(.hour, from: currentTime)
        switch hour {
        case 0..<9: return .gray
        case 9..<18: return .aliveGreen
        case 18..<21: return .struggleYellow
        case 21..<24: return .deadRed
        default: return .gray
        }
    }
    
    // MARK: - Survival Card
    private var survivalCard: some View {
        VStack(spacing: 16) {
            // 用户头像和等级
            HStack(spacing: 16) {
                Text(userService.currentUser?.avatarEmoji ?? "🐂")
                    .font(.system(size: 50))
                    .shadow(color: .black.opacity(0.3), radius: 5)
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(userService.currentUser?.bannerLevel.emoji ?? "🌱")
                        Text(userService.currentUser?.bannerLevel.rawValue ?? "新鲜韭菜")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    }
                    
                    Text(userService.currentUser?.bannerLevel.description ?? "")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                        .lineLimit(2)
                }
                
                Spacer()
            }
            
            Divider()
                .background(Color.white.opacity(0.1))
            
            // 存活天数
            HStack {
                statItem(value: "\(userService.currentUser?.survivalDays ?? 0)", label: "存活天数", color: .aliveGreen)
                
                Divider()
                    .frame(height: 40)
                    .background(Color.white.opacity(0.1))
                
                statItem(value: "\(userService.currentUser?.currentStreak ?? 0)", label: "连续打卡", color: .struggleYellow)
                
                Divider()
                    .frame(height: 40)
                    .background(Color.white.opacity(0.1))
                
                statItem(value: "\(userService.currentUser?.totalCheckIns ?? 0)", label: "总签到", color: .deadRed)
            }
        }
        .padding(20)
        .glassCard()
    }
    
    private func statItem(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundColor(color)
            
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - Mood Selector
    private var moodSelector: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("今天心情怎样？")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.gray)
            
            HStack(spacing: 8) {
                ForEach(CheckInRecord.Mood.allCases, id: \.self) { mood in
                    moodButton(mood)
                }
            }
        }
    }
    
    private func moodButton(_ mood: CheckInRecord.Mood) -> some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                selectedMood = mood
            }
            haptic(.light)
        } label: {
            VStack(spacing: 4) {
                Text(mood.emoji)
                    .font(.system(size: 28))
                
                Text(mood.rawValue)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(selectedMood == mood ? .white : .gray)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(selectedMood == mood ? Color.deadRed.opacity(0.3) : Color.cardBg)
            )
            .overlay {
                RoundedRectangle(cornerRadius: 12)
                    .stroke(selectedMood == mood ? Color.deadRed : Color.clear, lineWidth: 2)
            }
        }
        .buttonStyle(.plain)
    }
    
    // MARK: - Complaint Input
    private var complaintInput: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("想骂什么？（可选）")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.gray)
                
                Spacer()
                
                // 语音输入按钮
                Button {
                    // TODO: 语音输入
                    haptic(.light)
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "mic.fill")
                        Text("语音")
                    }
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.deadRed)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.deadRed.opacity(0.15))
                    .clipShape(Capsule())
                }
            }
            
            TextEditor(text: $complaint)
                .font(.system(size: 16))
                .foregroundColor(.white)
                .frame(height: 100)
                .padding(12)
                .scrollContentBackground(.hidden)
                .background(Color.cardBg)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay {
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                }
                .overlay(alignment: .topLeading) {
                    if complaint.isEmpty {
                        Text("今天工作怎么折磨你了？随便骂几句吧...")
                            .font(.system(size: 16))
                            .foregroundColor(.gray.opacity(0.5))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 20)
                            .allowsHitTesting(false)
                    }
                }
        }
    }
    
    // MARK: - Check In Button
    private var checkInButton: some View {
        Button(action: performCheckIn) {
            HStack(spacing: 12) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else if isCheckedIn {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 24))
                    Text("已打卡")
                        .font(.system(size: 20, weight: .bold))
                } else {
                    Image(systemName: "hand.raised.fill")
                        .font(.system(size: 24))
                    Text("老子下班了！")
                        .font(.system(size: 20, weight: .bold))
                }
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(
                Group {
                    if isCheckedIn {
                        LinearGradient(
                            colors: [Color.aliveGreen, Color(hex: "2ECC71")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    } else {
                        LinearGradient(
                            colors: [Color.deadRed, Color(hex: "FF6B5B")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    }
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: 18))
            .shadow(color: (isCheckedIn ? Color.aliveGreen : Color.deadRed).opacity(0.4), radius: 15, y: 5)
            .scaleEffect(isLoading ? 0.98 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isLoading)
        }
        .disabled(isLoading || isCheckedIn)
    }
    
    // MARK: - AI Response Card
    private var aiResponseCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Text("🤖")
                    .font(.system(size: 20))
                
                Text("毒舌张说：")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.deadRed)
            }
            
            Text(aiResponse)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white)
                .lineSpacing(4)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardBg)
                .overlay {
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.deadRed.opacity(0.3), lineWidth: 1)
                }
        )
        .transition(.asymmetric(
            insertion: .scale(scale: 0.9).combined(with: .opacity),
            removal: .opacity
        ))
    }
    
    // MARK: - Banner Overlay
    private var bannerOverlay: some View {
        ZStack {
            // 背景遮罩
            Color.black.opacity(0.7)
                .ignoresSafeArea()
                .onTapGesture {
                    dismissBanner()
                }
            
            // 锦旗
            BannerView(
                level: userService.currentUser?.bannerLevel ?? .freshLeek,
                survivalDays: userService.currentUser?.survivalDays ?? 1,
                complaint: complaint.isEmpty ? nil : complaint
            )
            .scaleEffect(bannerScale)
            .rotationEffect(.degrees(bannerRotation))
            .onAppear {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                    bannerScale = 1
                    bannerRotation = 0
                }
            }
        }
    }
    
    // MARK: - Actions
    private func performCheckIn() {
        isLoading = true
        haptic(.medium)
        
        Task {
            do {
                let record = try await userService.checkIn(
                    complaint: complaint.isEmpty ? nil : complaint,
                    mood: selectedMood
                )
                
                haptic(.success)
                
                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                    isCheckedIn = true
                    aiResponse = record.aiResponse ?? ""
                }
                
                // 显示锦旗
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    withAnimation {
                        showBanner = true
                    }
                }
                
            } catch {
                haptic(.error)
                // 显示错误
            }
            
            isLoading = false
        }
    }
    
    private func dismissBanner() {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            bannerScale = 0.5
            bannerRotation = 10
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            showBanner = false
            bannerScale = 0.5
            bannerRotation = -10
        }
    }
}

// MARK: - Preview
struct CheckInView_Previews: PreviewProvider {
    static var previews: some View {
        CheckInView()
            .environmentObject(AppState())
            .environmentObject(UserService())
    }
}

