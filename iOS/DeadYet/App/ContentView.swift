//
//  ContentView.swift
//  DeadYet - 还没死？
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var userService: UserService
    
    var body: some View {
        Group {
            if !appState.isOnboarded {
                OnboardingView()
                    .transition(.asymmetric(
                        insertion: .opacity,
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
            } else {
                MainTabView()
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .opacity
                    ))
            }
        }
        .animation(.spring(response: 0.5, dampingFraction: 0.8), value: appState.isOnboarded)
    }
}

// MARK: - Main Tab View
struct MainTabView: View {
    @EnvironmentObject var appState: AppState
    @State private var tabBarOffset: CGFloat = 0
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // 内容区域
            TabView(selection: $appState.selectedTab) {
                CheckInView()
                    .tag(AppState.Tab.checkIn)
                
                MapView()
                    .tag(AppState.Tab.map)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            
            // 自定义Tab Bar - Liquid Glass风格
            CustomTabBar(selectedTab: $appState.selectedTab)
                .padding(.horizontal, 60)
                .padding(.bottom, 20)
        }
        .ignoresSafeArea(.keyboard)
    }
}

// MARK: - Custom Tab Bar (Liquid Glass Style)
struct CustomTabBar: View {
    @Binding var selectedTab: AppState.Tab
    @Namespace private var animation
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(AppState.Tab.allCases, id: \.self) { tab in
                TabBarButton(
                    tab: tab,
                    isSelected: selectedTab == tab,
                    namespace: animation
                ) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        selectedTab = tab
                    }
                }
            }
        }
        .padding(8)
        .background {
            // Liquid Glass效果
            RoundedRectangle(cornerRadius: 24)
                .fill(.ultraThinMaterial)
                .overlay {
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(
                            LinearGradient(
                                colors: [.white.opacity(0.3), .clear],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                }
                .shadow(color: .black.opacity(0.3), radius: 20, y: 10)
        }
    }
}

// MARK: - Tab Bar Button
struct TabBarButton: View {
    let tab: AppState.Tab
    let isSelected: Bool
    let namespace: Namespace.ID
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: tab.icon)
                    .font(.system(size: 22, weight: .semibold))
                    .symbolEffect(.bounce, value: isSelected)
                
                Text(tab.title)
                    .font(.system(size: 11, weight: .medium))
            }
            .foregroundStyle(isSelected ? .white : .gray)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background {
                if isSelected {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(hex: "FF3B30"),
                                    Color(hex: "FF6B5B")
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .matchedGeometryEffect(id: "TAB", in: namespace)
                }
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AppState())
            .environmentObject(UserService())
    }
}

