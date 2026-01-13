//
//  PermissionsView.swift
//  DeadYet - 还没死？
//
//  权限请求页面
//

import SwiftUI
import CoreLocation

struct PermissionsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var locationService = LocationService()
    
    @State private var locationGranted: Bool = false
    @State private var notificationGranted: Bool = false
    @State private var animationPhase: Int = 0
    @State private var isRequestingLocation: Bool = false
    @State private var isRequestingNotification: Bool = false
    
    var body: some View {
        ZStack {
            // 背景
            backgroundView
            
            VStack(spacing: 0) {
                Spacer()
                
                // 头部
                headerSection
                    .opacity(animationPhase >= 1 ? 1 : 0)
                    .offset(y: animationPhase >= 1 ? 0 : 30)
                
                Spacer()
                    .frame(height: 40)
                
                // 权限列表
                permissionsSection
                    .opacity(animationPhase >= 2 ? 1 : 0)
                    .offset(y: animationPhase >= 2 ? 0 : 30)
                
                Spacer()
                
                // 继续按钮
                continueButton
                    .opacity(animationPhase >= 3 ? 1 : 0)
                    .offset(y: animationPhase >= 3 ? 0 : 20)
                
                Spacer()
                    .frame(height: 50)
            }
            .padding(.horizontal, 24)
        }
        .onAppear {
            startAnimation()
            checkCurrentPermissions()
        }
    }
    
    // MARK: - Background
    private var backgroundView: some View {
        ZStack {
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
                .fill(Color.aliveGreen.opacity(0.15))
                .frame(width: 300, height: 300)
                .blur(radius: 80)
                .offset(x: 100, y: -200)
            
            Circle()
                .fill(Color(hex: "00D4FF").opacity(0.1))
                .frame(width: 250, height: 250)
                .blur(radius: 60)
                .offset(x: -100, y: 350)
        }
    }
    
    // MARK: - Header
    private var headerSection: some View {
        VStack(spacing: 16) {
            // 图标
            ZStack {
                Circle()
                    .fill(Color.aliveGreen.opacity(0.2))
                    .frame(width: 120, height: 120)
                
                Image(systemName: "location.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.aliveGreen)
            }
            
            Text("开启权限")
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(.white)
            
            Text("为了让你能更好地记录自己的牛马生活，\n我们需要一些权限")
                .font(.system(size: 15))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
        }
    }
    
    // MARK: - Permissions Section
    private var permissionsSection: some View {
        VStack(spacing: 16) {
            // 位置权限
            permissionCard(
                icon: "location.fill",
                iconColor: .blue,
                title: "位置信息",
                subtitle: "用于显示你所在的城市，看看本地有多少牛马",
                isGranted: locationGranted,
                isLoading: isRequestingLocation
            ) {
                requestLocationPermission()
            }
            
            // 通知权限
            permissionCard(
                icon: "bell.fill",
                iconColor: .orange,
                title: "通知推送",
                subtitle: "在你忘记签到时提醒你，别让连续签到断了",
                isGranted: notificationGranted,
                isLoading: isRequestingNotification
            ) {
                requestNotificationPermission()
            }
        }
    }
    
    private func permissionCard(
        icon: String,
        iconColor: Color,
        title: String,
        subtitle: String,
        isGranted: Bool,
        isLoading: Bool,
        action: @escaping () -> Void
    ) -> some View {
        HStack(spacing: 16) {
            // 图标
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(iconColor.opacity(0.15))
                    .frame(width: 50, height: 50)
                
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundColor(iconColor)
            }
            
            // 文字
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                
                Text(subtitle)
                    .font(.system(size: 13))
                    .foregroundColor(.gray)
                    .lineLimit(2)
            }
            
            Spacer()
            
            // 状态按钮
            Button(action: action) {
                Group {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(0.8)
                    } else if isGranted {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.aliveGreen)
                    } else {
                        Text("开启")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(iconColor)
                            .clipShape(Capsule())
                    }
                }
            }
            .disabled(isGranted || isLoading)
        }
        .padding(16)
        .background(Color(hex: "2C2C2E").opacity(0.8))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    // MARK: - Continue Button
    private var continueButton: some View {
        VStack(spacing: 16) {
            Button(action: continueToApp) {
                HStack(spacing: 10) {
                    Text(allPermissionsGranted ? "开始使用" : "跳过，稍后设置")
                        .font(.system(size: 18, weight: .bold))
                    
                    Image(systemName: "arrow.right")
                        .font(.system(size: 16, weight: .bold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 18)
                .background(
                    LinearGradient(
                        colors: allPermissionsGranted 
                            ? [Color.aliveGreen, Color(hex: "2ECC71")] 
                            : [Color.gray.opacity(0.5), Color.gray.opacity(0.3)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .shadow(color: allPermissionsGranted ? Color.aliveGreen.opacity(0.4) : .clear, radius: 15, y: 5)
            }
            
            if !allPermissionsGranted {
                Text("你可以随时在设置中开启这些权限")
                    .font(.system(size: 12))
                    .foregroundColor(.gray.opacity(0.6))
            }
        }
    }
    
    // MARK: - Computed Properties
    private var allPermissionsGranted: Bool {
        locationGranted && notificationGranted
    }
    
    // MARK: - Actions
    private func startAnimation() {
        withAnimation(.easeOut(duration: 0.5).delay(0.1)) {
            animationPhase = 1
        }
        withAnimation(.easeOut(duration: 0.5).delay(0.3)) {
            animationPhase = 2
        }
        withAnimation(.easeOut(duration: 0.5).delay(0.5)) {
            animationPhase = 3
        }
    }
    
    private func checkCurrentPermissions() {
        // 检查位置权限
        let locationStatus = CLLocationManager().authorizationStatus
        locationGranted = (locationStatus == .authorizedWhenInUse || locationStatus == .authorizedAlways)
        
        // 检查通知权限
        Task {
            let settings = await UNUserNotificationCenter.current().notificationSettings()
            await MainActor.run {
                notificationGranted = (settings.authorizationStatus == .authorized)
            }
        }
    }
    
    private func requestLocationPermission() {
        isRequestingLocation = true
        haptic(.light)
        
        locationService.requestPermission()
        
        // 监听权限变化
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            let status = CLLocationManager().authorizationStatus
            withAnimation(.spring(response: 0.3)) {
                locationGranted = (status == .authorizedWhenInUse || status == .authorizedAlways)
                isRequestingLocation = false
            }
            
            if locationGranted {
                haptic(.success)
            }
        }
    }
    
    private func requestNotificationPermission() {
        isRequestingNotification = true
        haptic(.light)
        
        Task {
            do {
                let granted = try await NotificationService.shared.requestAuthorization()
                await MainActor.run {
                    withAnimation(.spring(response: 0.3)) {
                        notificationGranted = granted
                        isRequestingNotification = false
                    }
                    
                    if granted {
                        haptic(.success)
                    }
                }
            } catch {
                await MainActor.run {
                    isRequestingNotification = false
                }
            }
        }
    }
    
    private func continueToApp() {
        haptic(.medium)
        appState.completeOnboarding()
    }
}

// MARK: - Preview
struct PermissionsView_Previews: PreviewProvider {
    static var previews: some View {
        PermissionsView()
            .environmentObject(AppState())
    }
}
