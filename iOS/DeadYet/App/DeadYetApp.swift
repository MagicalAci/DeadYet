//
//  DeadYetApp.swift
//  DeadYet - 还没死？
//
//  面向打工人的毒舌下班签到APP
//

import SwiftUI

@main
struct DeadYetApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var userService = UserService()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(userService)
                .preferredColorScheme(.dark) // 默认深色模式，符合牛马的黑暗人生
        }
    }
}

// MARK: - App State
@MainActor
class AppState: ObservableObject {
    @Published var isOnboarded: Bool = false
    @Published var selectedTab: Tab = .checkIn
    @Published var showCheckInSuccess: Bool = false
    
    enum Tab: Int, CaseIterable {
        case checkIn = 0
        case map = 1
        
        var title: String {
            switch self {
            case .checkIn: return "签到"
            case .map: return "地图"
            }
        }
        
        var icon: String {
            switch self {
            case .checkIn: return "checkmark.seal.fill"
            case .map: return "map.fill"
            }
        }
    }
    
    init() {
        // 检查是否已经完成引导
        self.isOnboarded = UserDefaults.standard.bool(forKey: "isOnboarded")
    }
    
    func completeOnboarding() {
        UserDefaults.standard.set(true, forKey: "isOnboarded")
        withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
            isOnboarded = true
        }
    }
}

