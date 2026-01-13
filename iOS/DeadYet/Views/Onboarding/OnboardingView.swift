//
//  OnboardingView.swift
//  DeadYet - 还没死？
//

import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var userService: UserService
    
    @State private var currentStep: OnboardingStep = .welcome
    @State private var email: String = ""
    @State private var isLoading: Bool = false
    @State private var showError: Bool = false
    @State private var errorMessage: String = ""
    @State private var animationPhase: Int = 0
    
    @FocusState private var isEmailFocused: Bool
    
    enum OnboardingStep {
        case welcome
        case permissions
    }
    
    var body: some View {
        ZStack {
            // 背景
            backgroundView
            
            // 根据步骤显示不同内容
            switch currentStep {
            case .welcome:
                welcomeContent
            case .permissions:
                PermissionsView()
                    .environmentObject(appState)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
            }
        }
        .onAppear {
            startAnimation()
        }
        .alert("出错了", isPresented: $showError) {
            Button("知道了") { }
        } message: {
            Text(errorMessage)
        }
    }
    
    // MARK: - Welcome Content
    private var welcomeContent: some View {
        VStack(spacing: 0) {
            Spacer()
            
            // Logo和标题
            headerSection
                .opacity(animationPhase >= 1 ? 1 : 0)
                .offset(y: animationPhase >= 1 ? 0 : 30)
            
            Spacer()
            
            // 邮箱输入
            emailInputSection
                .opacity(animationPhase >= 2 ? 1 : 0)
                .offset(y: animationPhase >= 2 ? 0 : 30)
            
            Spacer()
                .frame(height: 40)
        }
        .padding(.horizontal, 24)
    }
    
    // MARK: - Background
    private var backgroundView: some View {
        ZStack {
            // 深色渐变背景
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
            
            // 装饰性光斑
            Circle()
                .fill(Color.deadRed.opacity(0.15))
                .frame(width: 300, height: 300)
                .blur(radius: 80)
                .offset(x: -100, y: -200)
            
            Circle()
                .fill(Color(hex: "FF6B5B").opacity(0.1))
                .frame(width: 250, height: 250)
                .blur(radius: 60)
                .offset(x: 150, y: 300)
        }
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 20) {
            // 大号Emoji
            Text("🐂")
                .font(.system(size: 100))
                .shadow(color: .deadRed.opacity(0.5), radius: 20)
            
            // 标题
            VStack(spacing: 8) {
                Text("还没死？")
                    .font(.system(size: 42, weight: .black, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.white, Color(hex: "CCCCCC")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                
                Text("DeadYet")
                    .font(.system(size: 18, weight: .medium, design: .monospaced))
                    .foregroundColor(.gray)
            }
            
            // 副标题
            Text("打工人的毒舌下班签到")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.gray)
                .padding(.top, 8)
            
            // 功能亮点
            VStack(spacing: 12) {
                featureRow(icon: "checkmark.seal.fill", text: "每天签到，记录存活天数")
                featureRow(icon: "map.fill", text: "全国地图，看看谁还在加班")
                featureRow(icon: "bubble.left.fill", text: "AI毒舌，骂醒你这个社畜")
            }
            .padding(.top, 24)
        }
    }
    
    private func featureRow(icon: String, text: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.deadRed)
                .frame(width: 32, height: 32)
                .background(Color.deadRed.opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            
            Text(text)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white.opacity(0.8))
            
            Spacer()
        }
        .padding(.horizontal, 20)
    }
    
    // MARK: - Email Input Section
    private var emailInputSection: some View {
        VStack(spacing: 20) {
            // 输入框
            VStack(alignment: .leading, spacing: 8) {
                Text("工作邮箱")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.gray)
                
                HStack(spacing: 12) {
                    Image(systemName: "envelope.fill")
                        .font(.system(size: 18))
                        .foregroundColor(.gray)
                    
                    TextField("", text: $email, prompt: Text("your@company.com").foregroundColor(.gray.opacity(0.5)))
                        .font(.system(size: 17, weight: .medium))
                        .foregroundColor(.white)
                        .keyboardType(.emailAddress)
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .focused($isEmailFocused)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 16)
                .background(Color(hex: "2C2C2E"))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay {
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(isEmailFocused ? Color.deadRed : Color.clear, lineWidth: 2)
                }
            }
            
            // 提示文字
            Text("报告和提醒会发到这个邮箱，放心，不会骚扰你的")
                .font(.system(size: 13))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
            
            // 开始按钮
            Button(action: submitEmail) {
                HStack(spacing: 10) {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(0.9)
                    } else {
                        Text("开始苟且")
                            .font(.system(size: 18, weight: .bold))
                        
                        Image(systemName: "arrow.right")
                            .font(.system(size: 16, weight: .bold))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 18)
                .background(
                    LinearGradient(
                        colors: email.isEmpty ? [.gray, .gray] : [Color(hex: "FF3B30"), Color(hex: "FF6B5B")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .shadow(color: email.isEmpty ? .clear : Color.deadRed.opacity(0.4), radius: 15, y: 5)
            }
            .disabled(email.isEmpty || isLoading)
            .animation(.easeInOut(duration: 0.2), value: email.isEmpty)
            
            // 底部说明
            Text("无需注册，输入邮箱即可开始")
                .font(.system(size: 12))
                .foregroundColor(.gray.opacity(0.6))
        }
        .padding(24)
        .glassCard()
    }
    
    // MARK: - Actions
    private func startAnimation() {
        withAnimation(.easeOut(duration: 0.5).delay(0.2)) {
            animationPhase = 1
        }
        withAnimation(.easeOut(duration: 0.5).delay(0.5)) {
            animationPhase = 2
        }
    }
    
    private func submitEmail() {
        guard !email.isEmpty else { return }
        
        isEmailFocused = false
        isLoading = true
        haptic(.medium)
        
        Task {
            do {
                try await userService.loginWithEmail(email)
                haptic(.success)
                // 跳转到权限请求页面
                withAnimation(.easeInOut(duration: 0.4)) {
                    currentStep = .permissions
                }
            } catch {
                haptic(.error)
                errorMessage = error.localizedDescription
                showError = true
            }
            isLoading = false
        }
    }
}

// MARK: - Preview
struct OnboardingView_Previews: PreviewProvider {
    static var previews: some View {
        OnboardingView()
            .environmentObject(AppState())
            .environmentObject(UserService())
    }
}

