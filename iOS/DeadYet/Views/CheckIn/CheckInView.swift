//
//  CheckInView.swift
//  DeadYet - 还没死？
//

import SwiftUI

struct CheckInView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var userService: UserService
    
    @State private var isCheckedIn: Bool = false
    @State private var isLoading: Bool = false
    @State private var showComplaintSheet: Bool = false
    @State private var showBanner: Bool = false
    @State private var aiResponse: String = ""
    @State private var currentTime: Date = Date()
    
    // 动画状态
    @State private var pulseAnimation: Bool = false
    @State private var bannerScale: CGFloat = 0.5
    @State private var bannerRotation: Double = -10
    @State private var buttonBounce: Bool = false
    
    // 抱怨数据（打卡后填写）
    @State private var complaint: String = ""
    @State private var selectedMood: CheckInRecord.Mood = .neutral
    
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
                    
                    Spacer(minLength: 40)
                    
                    // 主打卡按钮
                    mainCheckInButton
                    
                    // 打卡提示
                    checkInHint
                    
                    // AI回复区域（打卡后显示）
                    if !aiResponse.isEmpty {
                        aiResponseCard
                    }
                    
                    Spacer(minLength: 100)
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
            }
            
            // 抱怨输入弹窗（打卡后唤起）
            if showComplaintSheet {
                complaintSheetOverlay
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
    
    // MARK: - Main Check In Button
    private var mainCheckInButton: some View {
        Button(action: performCheckIn) {
            ZStack {
                // 脉冲背景动画
                if !isCheckedIn && !isLoading {
                    Circle()
                        .fill(Color.deadRed.opacity(0.2))
                        .frame(width: 200, height: 200)
                        .scaleEffect(buttonBounce ? 1.1 : 1)
                        .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: buttonBounce)
                }
                
                // 主按钮
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: isCheckedIn 
                                    ? [Color.aliveGreen, Color(hex: "2ECC71")]
                                    : [Color.deadRed, Color(hex: "FF6B5B")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 160, height: 160)
                        .shadow(color: (isCheckedIn ? Color.aliveGreen : Color.deadRed).opacity(0.5), radius: 20, y: 10)
                    
                    VStack(spacing: 8) {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(1.5)
                        } else if isCheckedIn {
                            Image(systemName: "checkmark")
                                .font(.system(size: 50, weight: .bold))
                            Text("已打卡")
                                .font(.system(size: 18, weight: .bold))
                        } else {
                            Image(systemName: "hand.raised.fill")
                                .font(.system(size: 50, weight: .medium))
                            Text("下班打卡")
                                .font(.system(size: 18, weight: .bold))
                        }
                    }
                    .foregroundColor(.white)
                }
            }
        }
        .buttonStyle(.plain)
        .disabled(isLoading || isCheckedIn)
        .onAppear {
            buttonBounce = true
        }
    }
    
    // MARK: - Check In Hint
    private var checkInHint: some View {
        Text(isCheckedIn ? "今天辛苦了，牛马 🐂" : "点击打卡，证明你还活着")
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.gray)
            .padding(.top, 8)
    }
    
    // MARK: - Complaint Sheet Overlay (打卡后弹出)
    private var complaintSheetOverlay: some View {
        ZStack {
            // 背景遮罩
            Color.black.opacity(0.6)
                .ignoresSafeArea()
                .onTapGesture {
                    // 点击背景可跳过，直接显示锦旗
                    submitComplaintAndShowBanner()
                }
            
            // 抱怨输入卡片
            ComplaintInputSheet(
                complaint: $complaint,
                selectedMood: $selectedMood,
                onSubmit: {
                    submitComplaintAndShowBanner()
                },
                onSkip: {
                    submitComplaintAndShowBanner()
                }
            )
            .transition(.asymmetric(
                insertion: .move(edge: .bottom).combined(with: .opacity),
                removal: .move(edge: .bottom).combined(with: .opacity)
            ))
        }
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
        
        // 先执行打卡（不带抱怨）
        Task {
            do {
                // 先打卡
                let record = try await userService.checkIn(
                    complaint: nil,
                    mood: .neutral
                )
                
                haptic(.success)
                
                await MainActor.run {
                    isLoading = false
                    isCheckedIn = true
                    aiResponse = record.aiResponse ?? ""
                    
                    // 打卡成功后，弹出抱怨输入界面
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                            showComplaintSheet = true
                        }
                    }
                }
                
            } catch {
                haptic(.error)
                isLoading = false
            }
        }
    }
    
    private func submitComplaintAndShowBanner() {
        // 关闭抱怨输入界面
        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            showComplaintSheet = false
        }
        
        // 如果有抱怨内容，更新到服务器
        if !complaint.isEmpty {
            Task {
                // 更新抱怨和心情
                try? await userService.updateComplaint(
                    complaint: complaint,
                    mood: selectedMood
                )
            }
        }
        
        // 显示锦旗
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            withAnimation {
                showBanner = true
            }
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

// MARK: - Complaint Input Sheet
struct ComplaintInputSheet: View {
    @Binding var complaint: String
    @Binding var selectedMood: CheckInRecord.Mood
    let onSubmit: () -> Void
    let onSkip: () -> Void
    
    @StateObject private var speechService = SpeechService()
    @State private var isRecording: Bool = false
    @FocusState private var isTextFieldFocused: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            // 拖拽指示条
            Capsule()
                .fill(Color.white.opacity(0.3))
                .frame(width: 40, height: 5)
                .padding(.top, 12)
                .padding(.bottom, 20)
            
            // 标题
            VStack(spacing: 8) {
                Text("🎉 打卡成功！")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.white)
                
                Text("想骂点什么？（可选）")
                    .font(.system(size: 15))
                    .foregroundColor(.gray)
            }
            .padding(.bottom, 24)
            
            // 心情选择
            VStack(alignment: .leading, spacing: 12) {
                Text("今天心情")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.gray)
                
                HStack(spacing: 8) {
                    ForEach(CheckInRecord.Mood.allCases, id: \.self) { mood in
                        moodButton(mood)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 20)
            
            // 语音/文字输入区域
            VStack(spacing: 16) {
                // 语音按钮（大号）
                VoiceRecordButton(
                    isRecording: $isRecording,
                    transcribedText: $complaint,
                    speechService: speechService
                )
                
                // 或者文字输入
                HStack(spacing: 12) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 1)
                    Text("或者打字")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 1)
                }
                .padding(.horizontal, 40)
                
                // 文字输入框
                TextEditor(text: $complaint)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .frame(height: 80)
                    .padding(12)
                    .scrollContentBackground(.hidden)
                    .background(Color(hex: "2C2C2E"))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .overlay {
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(Color.white.opacity(0.1), lineWidth: 1)
                    }
                    .overlay(alignment: .topLeading) {
                        if complaint.isEmpty {
                            Text("今天工作怎么折磨你了？")
                                .font(.system(size: 16))
                                .foregroundColor(.gray.opacity(0.5))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 20)
                                .allowsHitTesting(false)
                        }
                    }
                    .focused($isTextFieldFocused)
                    .padding(.horizontal, 20)
            }
            
            // 按钮区域
            HStack(spacing: 12) {
                // 跳过按钮
                Button(action: onSkip) {
                    Text("跳过")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.gray)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color(hex: "3C3C3E"))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                
                // 提交按钮
                Button(action: onSubmit) {
                    HStack(spacing: 8) {
                        Text("发送")
                            .font(.system(size: 16, weight: .bold))
                        Image(systemName: "paperplane.fill")
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        LinearGradient(
                            colors: [Color.deadRed, Color(hex: "FF6B5B")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 24)
            .padding(.bottom, 40)
        }
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color(hex: "1C1C1E"))
        )
        .padding(.horizontal, 16)
        .padding(.bottom, 20)
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
                    .font(.system(size: 24))
                
                Text(mood.rawValue)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(selectedMood == mood ? .white : .gray)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(selectedMood == mood ? Color.deadRed.opacity(0.3) : Color(hex: "2C2C2E"))
            )
            .overlay {
                RoundedRectangle(cornerRadius: 12)
                    .stroke(selectedMood == mood ? Color.deadRed : Color.clear, lineWidth: 2)
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Voice Record Button
struct VoiceRecordButton: View {
    @Binding var isRecording: Bool
    @Binding var transcribedText: String
    @ObservedObject var speechService: SpeechService
    
    @State private var pulseAnimation: CGFloat = 1
    @State private var showPermissionAlert: Bool = false
    
    var body: some View {
        VStack(spacing: 12) {
            // 录音按钮
            Button(action: toggleRecording) {
                ZStack {
                    // 脉冲动画背景
                    if isRecording {
                        Circle()
                            .fill(Color.deadRed.opacity(0.3))
                            .frame(width: 100, height: 100)
                            .scaleEffect(pulseAnimation)
                            .opacity(Double(2 - pulseAnimation))
                    }
                    
                    // 主按钮
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: isRecording 
                                    ? [Color.deadRed, Color(hex: "FF6B5B")]
                                    : [Color(hex: "3C3C3E"), Color(hex: "2C2C2E")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 80, height: 80)
                        .shadow(
                            color: isRecording ? Color.deadRed.opacity(0.5) : .clear,
                            radius: 15
                        )
                    
                    // 图标
                    VStack(spacing: 4) {
                        Image(systemName: isRecording ? "stop.fill" : "mic.fill")
                            .font(.system(size: 30, weight: .medium))
                            .foregroundColor(.white)
                        
                        if isRecording {
                            Text("录音中...")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.white.opacity(0.8))
                        }
                    }
                }
            }
            .buttonStyle(.plain)
            
            // 提示文字
            Text(isRecording ? "再次点击停止" : "点击开始语音输入")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.gray)
            
            // 识别结果预览
            if !speechService.transcribedText.isEmpty && isRecording {
                Text(speechService.transcribedText)
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color(hex: "2C2C2E"))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .transition(.scale.combined(with: .opacity))
            }
        }
        .onAppear {
            speechService.requestAuthorization()
        }
        .onChange(of: isRecording) { _, newValue in
            if newValue {
                withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) {
                    pulseAnimation = 1.3
                }
            } else {
                pulseAnimation = 1
            }
        }
        .onChange(of: speechService.transcribedText) { _, newValue in
            if !newValue.isEmpty {
                transcribedText = newValue
            }
        }
        .onChange(of: speechService.isRecording) { _, newValue in
            isRecording = newValue
        }
        .alert("需要麦克风权限", isPresented: $showPermissionAlert) {
            Button("去设置") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            Button("取消", role: .cancel) { }
        } message: {
            Text("需要麦克风权限才能语音输入你的抱怨")
        }
    }
    
    private func toggleRecording() {
        switch speechService.authorizationStatus {
        case .authorized:
            haptic(.medium)
            speechService.toggleRecording()
            isRecording = speechService.isRecording
        case .denied, .restricted:
            showPermissionAlert = true
        case .notDetermined:
            speechService.requestAuthorization()
        @unknown default:
            break
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
