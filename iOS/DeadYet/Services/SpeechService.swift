//
//  SpeechService.swift
//  DeadYet - 还没死？
//
//  语音识别服务 - 让用户语音骂街
//

import Foundation
import Speech
import AVFoundation

@MainActor
class SpeechService: NSObject, ObservableObject {
    @Published var isRecording: Bool = false
    @Published var transcribedText: String = ""
    @Published var authorizationStatus: SFSpeechRecognizerAuthorizationStatus = .notDetermined
    @Published var errorMessage: String?
    
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "zh-CN"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    override init() {
        super.init()
    }
    
    // MARK: - 请求权限
    
    func requestAuthorization() {
        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            Task { @MainActor in
                self?.authorizationStatus = status
                
                switch status {
                case .authorized:
                    break
                case .denied:
                    self?.errorMessage = "语音识别权限被拒绝了，没法听你骂街了"
                case .restricted:
                    self?.errorMessage = "设备不支持语音识别"
                case .notDetermined:
                    break
                @unknown default:
                    break
                }
            }
        }
    }
    
    // MARK: - 开始录音
    
    func startRecording() throws {
        // 取消之前的任务
        if recognitionTask != nil {
            recognitionTask?.cancel()
            recognitionTask = nil
        }
        
        // 配置音频会话
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        
        // 创建识别请求
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        
        guard let recognitionRequest = recognitionRequest else {
            throw SpeechError.requestCreationFailed
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        // 获取音频输入
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            self.recognitionRequest?.append(buffer)
        }
        
        // 开始音频引擎
        audioEngine.prepare()
        try audioEngine.start()
        
        isRecording = true
        transcribedText = ""
        
        // 开始识别
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            Task { @MainActor in
                if let result = result {
                    self?.transcribedText = result.bestTranscription.formattedString
                }
                
                if error != nil || result?.isFinal == true {
                    self?.stopRecording()
                }
            }
        }
    }
    
    // MARK: - 停止录音
    
    func stopRecording() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask?.cancel()
        recognitionTask = nil
        
        isRecording = false
    }
    
    // MARK: - 切换录音状态
    
    func toggleRecording() {
        if isRecording {
            stopRecording()
        } else {
            do {
                try startRecording()
            } catch {
                errorMessage = "开始录音失败：\(error.localizedDescription)"
            }
        }
    }
}

// MARK: - Errors
enum SpeechError: LocalizedError {
    case requestCreationFailed
    case notAuthorized
    case recognizerUnavailable
    
    var errorDescription: String? {
        switch self {
        case .requestCreationFailed:
            return "语音识别请求创建失败"
        case .notAuthorized:
            return "没有语音识别权限"
        case .recognizerUnavailable:
            return "语音识别不可用"
        }
    }
}

