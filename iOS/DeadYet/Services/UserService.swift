//
//  UserService.swift
//  DeadYet - 还没死？
//

import Foundation
import SwiftUI

@MainActor
class UserService: ObservableObject {
    @Published var currentUser: User?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let userDefaultsKey = "currentUser"
    private let baseURL = "https://deadyet.zeabur.app" // 统一的后端API地址
    
    init() {
        loadUserFromLocal()
    }
    
    // MARK: - 本地存储
    
    private func loadUserFromLocal() {
        if let data = UserDefaults.standard.data(forKey: userDefaultsKey),
           let user = try? JSONDecoder().decode(User.self, from: data) {
            self.currentUser = user
        }
    }
    
    private func saveUserToLocal(_ user: User) {
        if let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: userDefaultsKey)
        }
    }
    
    // MARK: - 用户邮箱登录
    
    func loginWithEmail(_ email: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        // 验证邮箱格式
        guard isValidEmail(email) else {
            throw UserError.invalidEmail
        }
        
        // 创建或获取用户
        var user = User(email: email)
        
        // TODO: 调用后端API创建/获取用户
        // let response = try await apiClient.post("/api/auth/email", body: ["email": email])
        // user = try JSONDecoder().decode(User.self, from: response)
        
        // 临时：本地创建用户
        user.survivalDays = 1
        user.city = "北京"
        user.district = "海淀区"
        
        currentUser = user
        saveUserToLocal(user)
    }
    
    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
    
    // MARK: - 签到
    
    func checkIn(complaint: String?, mood: CheckInRecord.Mood) async throws -> CheckInRecord {
        guard var user = currentUser else {
            throw UserError.notLoggedIn
        }
        
        isLoading = true
        defer { isLoading = false }
        
        // 创建签到记录
        var record = CheckInRecord(
            userId: user.id,
            checkInTime: Date(),
            complaint: complaint,
            mood: mood
        )
        
        // TODO: 调用后端API
        // 1. 保存签到记录
        // 2. 获取AI回复
        // 3. 生成锦旗
        
        // 临时：生成AI回复
        if let complaint = complaint, !complaint.isEmpty {
            record.aiResponse = generateMockAIResponse(for: complaint)
        } else {
            record.aiResponse = getRandomCheckInResponse()
        }
        record.bannerGenerated = true
        
        // 更新用户数据
        user.survivalDays += 1
        user.totalCheckIns += 1
        user.currentStreak += 1
        user.longestStreak = max(user.longestStreak, user.currentStreak)
        user.lastCheckIn = Date()
        
        currentUser = user
        saveUserToLocal(user)
        
        return record
    }
    
    // MARK: - Mock AI Responses
    
    private func generateMockAIResponse(for complaint: String) -> String {
        let responses = [
            // 通用毒舌
            "就这？我听过比这惨十倍的。你这算什么，继续苟着吧。",
            "行吧，骂完了？骂完继续打工，明天还得上班呢傻逼。",
            "这种狗屎班你还上？去Boss直聘逛逛，换换心情吧。",
            "你领导是不是脑子有坑？建议录音，以后仲裁用得上。",
            "恭喜你没猝死，这就是你今天最大的成就。",
            "又活过一天，明天继续被操。睡吧傻逼。",
            "职场没有朋友，只有利益。清醒点，干活去。",
            "就这点钱你还干？我真服了你这种老实人。",
            "穷是暂时的，被压榨是持久的。跳啊，怂什么？",
            "你这工作，我看狗都不干。但你还得干，因为房租要交。"
        ]
        
        // 根据关键词选择回复
        let lowercased = complaint.lowercased()
        
        if lowercased.contains("加班") || lowercased.contains("overtime") {
            return "又加班？你这是打工还是卖身？加班费呢？没有？那你加个屁！"
        }
        if lowercased.contains("领导") || lowercased.contains("老板") {
            return "你领导是不是脑子有坑？这种傻逼领导全国多了去了，你不走他走不了，懂？"
        }
        if lowercased.contains("工资") || lowercased.contains("钱") {
            return "就这点钱你还干？我真服了你这种老实人。穷是暂时的，被压榨是持久的。"
        }
        if lowercased.contains("同事") {
            return "职场没有朋友，只有利益。让他去死，你继续苟着，熬到比他先跑路。"
        }
        if lowercased.contains("累") || lowercased.contains("困") {
            return "累就对了，不累怎么叫打工？建议今晚早睡，明天继续被操。"
        }
        if lowercased.contains("开会") || lowercased.contains("会议") {
            return "又开会？形式主义害死人啊。建议带个耳机假装在听，实际刷刷招聘APP。"
        }
        
        return responses.randomElement() ?? "你倒是挺能忍的，继续苟吧！"
    }
    
    private func getRandomCheckInResponse() -> String {
        let responses = [
            "行，今天又没死，恭喜你👏",
            "又苟过一天，明天继续！",
            "没抱怨？装什么坚强呢？",
            "沉默的牛马，是最可怕的牛马。",
            "不说话是吧？憋着等着猝死？",
            "恭喜存活+1天，距离财务自由还有∞天"
        ]
        return responses.randomElement() ?? "今日存活 ✓"
    }
    
    // MARK: - 更新抱怨内容（打卡后补充）
    
    func updateComplaint(complaint: String, mood: CheckInRecord.Mood) async throws {
        guard currentUser != nil else {
            throw UserError.notLoggedIn
        }
        
        // TODO: 调用后端API更新今日抱怨
        // try await apiClient.put("/api/checkin/today", body: [
        //     "complaint": complaint,
        //     "mood": mood.rawValue
        // ])
        
        // 临时：只打印日志
        print("📝 抱怨更新: \(complaint), 心情: \(mood.rawValue)")
    }
    
    // MARK: - 登出
    
    func logout() {
        currentUser = nil
        UserDefaults.standard.removeObject(forKey: userDefaultsKey)
        UserDefaults.standard.set(false, forKey: "isOnboarded")
    }
}

// MARK: - Errors
enum UserError: LocalizedError {
    case invalidEmail
    case notLoggedIn
    case networkError
    case serverError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidEmail:
            return "邮箱格式不对，你是不是傻？"
        case .notLoggedIn:
            return "还没登录呢，先输入邮箱"
        case .networkError:
            return "网络挂了，和你的工作热情一样"
        case .serverError(let message):
            return "服务器炸了：\(message)"
        }
    }
}

