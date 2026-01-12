//
//  NotificationService.swift
//  DeadYet - 还没死？
//
//  推送通知服务
//

import Foundation
import UserNotifications

@MainActor
class NotificationService: NSObject, ObservableObject {
    static let shared = NotificationService()
    
    @Published var isAuthorized: Bool = false
    @Published var deviceToken: String?
    
    override init() {
        super.init()
    }
    
    // MARK: - 请求权限
    
    func requestAuthorization() async throws -> Bool {
        let center = UNUserNotificationCenter.current()
        
        let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
        
        await MainActor.run {
            self.isAuthorized = granted
        }
        
        if granted {
            await registerForRemoteNotifications()
        }
        
        return granted
    }
    
    // MARK: - 注册远程通知
    
    private func registerForRemoteNotifications() async {
        await MainActor.run {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
    
    // MARK: - 处理Device Token
    
    func handleDeviceToken(_ token: Data) {
        let tokenString = token.map { String(format: "%02.2hhx", $0) }.joined()
        self.deviceToken = tokenString
        
        // TODO: 发送到服务器
        print("📱 Device Token: \(tokenString)")
    }
    
    // MARK: - 本地通知（用于测试）
    
    func scheduleLocalNotification(
        title: String,
        body: String,
        timeInterval: TimeInterval = 5
    ) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(
            timeInterval: timeInterval,
            repeats: false
        )
        
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - 战况推送测试
    
    func testBattleReport() {
        let hour = Calendar.current.component(.hour, from: Date())
        
        var title = ""
        var body = ""
        
        if hour >= 23 || hour < 6 {
            title = "🚨 深夜档"
            body = "这么晚还在加班？你是不是傻？公司给你发老婆了吗？"
        } else if hour >= 21 {
            title = "⚠️ 9点战报"
            body = "还有 12,847 个可怜人没下班，你是其中之一吗？"
        } else if hour >= 18 {
            title = "📊 下班战况"
            body = "全国已有 45% 的牛马成功撤离，你呢？"
        } else {
            title = "⏰ 提醒"
            body = "还没到下班时间呢，继续苟着吧！"
        }
        
        scheduleLocalNotification(title: title, body: body, timeInterval: 3)
    }
    
    // MARK: - 下班提醒
    
    func scheduleDailyReminder(at hour: Int, minute: Int = 0) {
        let content = UNMutableNotificationContent()
        content.title = "🐂 还没死？"
        content.body = "到点了！该签到下班了，记录今天的存活！"
        content.sound = .default
        
        var dateComponents = DateComponents()
        dateComponents.hour = hour
        dateComponents.minute = minute
        
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: dateComponents,
            repeats: true
        )
        
        let request = UNNotificationRequest(
            identifier: "daily_reminder",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - 清除所有通知
    
    func clearAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
    }
}

// MARK: - 战况文案生成
extension NotificationService {
    static func generateBattleReportTitle(hour: Int, checkedIn: Int, stillWorking: Int) -> String {
        let total = checkedIn + stillWorking
        let rate = total > 0 ? Int(Double(checkedIn) / Double(total) * 100) : 0
        
        if hour >= 23 || hour < 6 {
            return "🚨 深夜档：还有 \(stillWorking) 个可怜人在加班"
        } else if hour >= 21 {
            return "⚠️ \(hour)点战报：\(rate)% 已下班"
        } else {
            return "📊 \(hour)点战况：\(checkedIn) 人已撤离"
        }
    }
    
    static func generateBattleReportBody(hour: Int) -> String {
        let bodies: [String]
        
        if hour >= 23 || hour < 6 {
            bodies = [
                "还在加班？你不要命了？明天见（如果还活着的话）",
                "这么晚还在公司，公司给你发老婆了吗？",
                "记住：没有任何工作值得你熬夜。保重！"
            ]
        } else if hour >= 21 {
            bodies = [
                "9点多了还没走？保重身体啊牛马！",
                "建议刷刷Boss直聘，给自己留条后路",
                "加班没有加班费=慢性自杀，清醒点！"
            ]
        } else {
            bodies = [
                "你的同行们都回家了，你还在吗？",
                "记得按时下班，公司不会因为你加班就给你发工资",
                "下班打卡，记录今天的存活！"
            ]
        }
        
        return bodies.randomElement() ?? bodies[0]
    }
}

