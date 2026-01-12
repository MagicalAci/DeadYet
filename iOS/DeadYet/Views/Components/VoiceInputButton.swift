//
//  VoiceInputButton.swift
//  DeadYet - 还没死？
//
//  语音输入按钮组件
//

import SwiftUI

struct VoiceInputButton: View {
    @StateObject private var speechService = SpeechService()
    @Binding var transcribedText: String
    
    @State private var animationAmount: CGFloat = 1
    @State private var showPermissionAlert: Bool = false
    
    var body: some View {
        VStack(spacing: 12) {
            // 录音按钮
            Button(action: toggleRecording) {
                ZStack {
                    // 脉冲动画
                    if speechService.isRecording {
                        Circle()
                            .fill(Color.deadRed.opacity(0.3))
                            .frame(width: 80, height: 80)
                            .scaleEffect(animationAmount)
                            .opacity(2 - animationAmount)
                    }
                    
                    // 主按钮
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: speechService.isRecording 
                                    ? [Color.deadRed, Color(hex: "FF6B5B")]
                                    : [Color.cardBg, Color(hex: "3C3C3E")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 60, height: 60)
                        .shadow(
                            color: speechService.isRecording ? Color.deadRed.opacity(0.4) : .clear,
                            radius: 10
                        )
                    
                    // 图标
                    Image(systemName: speechService.isRecording ? "stop.fill" : "mic.fill")
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundColor(.white)
                        .symbolEffect(.bounce, value: speechService.isRecording)
                }
            }
            .buttonStyle(.plain)
            
            // 状态文字
            Text(speechService.isRecording ? "点击停止" : "按住说话")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.gray)
            
            // 识别结果
            if !speechService.transcribedText.isEmpty {
                Text(speechService.transcribedText)
                    .font(.system(size: 14))
                    .foregroundColor(.white)
                    .padding(12)
                    .frame(maxWidth: .infinity)
                    .background(Color.cardBg)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .transition(.scale.combined(with: .opacity))
            }
        }
        .onAppear {
            speechService.requestAuthorization()
        }
        .onChange(of: speechService.transcribedText) { _, newValue in
            transcribedText = newValue
        }
        .onChange(of: speechService.isRecording) { _, isRecording in
            if isRecording {
                withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) {
                    animationAmount = 1.5
                }
            } else {
                animationAmount = 1
            }
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
        case .denied, .restricted:
            showPermissionAlert = true
        case .notDetermined:
            speechService.requestAuthorization()
        @unknown default:
            break
        }
    }
}

// MARK: - Inline Voice Button (小型版本)
struct InlineVoiceButton: View {
    @StateObject private var speechService = SpeechService()
    @Binding var text: String
    
    var body: some View {
        Button {
            haptic(.light)
            if speechService.authorizationStatus == .authorized {
                speechService.toggleRecording()
            } else {
                speechService.requestAuthorization()
            }
        } label: {
            HStack(spacing: 4) {
                Image(systemName: speechService.isRecording ? "stop.circle.fill" : "mic.fill")
                    .symbolEffect(.pulse, isActive: speechService.isRecording)
                
                Text(speechService.isRecording ? "停止" : "语音")
            }
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(speechService.isRecording ? .white : .deadRed)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(
                speechService.isRecording 
                    ? Color.deadRed 
                    : Color.deadRed.opacity(0.15)
            )
            .clipShape(Capsule())
        }
        .onAppear {
            speechService.requestAuthorization()
        }
        .onChange(of: speechService.transcribedText) { _, newValue in
            if !newValue.isEmpty {
                text = newValue
            }
        }
    }
}

// MARK: - Preview
#Preview {
    ZStack {
        Color.darkBg.ignoresSafeArea()
        
        VStack(spacing: 40) {
            VoiceInputButton(transcribedText: .constant(""))
            
            HStack {
                Text("想骂什么？")
                    .foregroundColor(.white)
                Spacer()
                InlineVoiceButton(text: .constant(""))
            }
            .padding()
            .background(Color.cardBg)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .padding()
        }
    }
}

