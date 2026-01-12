//
//  User.swift
//  DeadYet - 还没死？
//

import Foundation

// MARK: - User Model
struct User: Codable, Identifiable {
    var id: String = UUID().uuidString
    var email: String
    var nickname: String?
    var avatarEmoji: String = "🐂"
    var survivalDays: Int = 0
    var totalCheckIns: Int = 0
    var currentStreak: Int = 0
    var longestStreak: Int = 0
    var city: String?
    var district: String?
    var createdAt: Date = Date()
    var lastCheckIn: Date?
    
    // 锦旗等级
    var bannerLevel: BannerLevel {
        switch survivalDays {
        case 0...7: return .freshLeek
        case 8...30: return .newbieSlave
        case 31...90: return .seniorSlave
        case 91...180: return .steelWorker
        case 181...365: return .immortalVeteran
        default: return .legendaryOx
        }
    }
}

// MARK: - Banner Level (锦旗等级)
enum BannerLevel: String, Codable, CaseIterable {
    case freshLeek = "新鲜韭菜"
    case newbieSlave = "牛马新星"
    case seniorSlave = "资深社畜"
    case steelWorker = "钢铁打工人"
    case immortalVeteran = "不死老兵"
    case legendaryOx = "传奇牛马"
    
    var emoji: String {
        switch self {
        case .freshLeek: return "🌱"
        case .newbieSlave: return "⭐"
        case .seniorSlave: return "🏅"
        case .steelWorker: return "🎖️"
        case .immortalVeteran: return "👑"
        case .legendaryOx: return "💎"
        }
    }
    
    var colorHex: String {
        switch self {
        case .freshLeek: return "4CAF50"
        case .newbieSlave: return "CD7F32"
        case .seniorSlave: return "C0C0C0"
        case .steelWorker: return "FFD700"
        case .immortalVeteran: return "E5E4E2"
        case .legendaryOx: return "B9F2FF"
        }
    }
    
    var description: String {
        switch self {
        case .freshLeek: return "刚入职场的小韭菜，被割的日子还长着呢"
        case .newbieSlave: return "开始适应社畜生活，麻木感正在形成"
        case .seniorSlave: return "已经是资深打工人了，习惯了苟且"
        case .steelWorker: return "钢铁意志，任何加班都打不倒你"
        case .immortalVeteran: return "不死老兵，职场的活化石"
        case .legendaryOx: return "传说中的存在，你是牛马界的神话"
        }
    }
    
    var minDays: Int {
        switch self {
        case .freshLeek: return 1
        case .newbieSlave: return 8
        case .seniorSlave: return 31
        case .steelWorker: return 91
        case .immortalVeteran: return 181
        case .legendaryOx: return 366
        }
    }
}

// MARK: - Check-in Record
struct CheckInRecord: Codable, Identifiable {
    var id: String = UUID().uuidString
    var userId: String
    var checkInTime: Date
    var complaint: String?
    var voiceComplaint: Data?  // 语音数据
    var aiResponse: String?
    var bannerGenerated: Bool = false
    var location: Location?
    var mood: Mood = .neutral
    
    enum Mood: String, Codable, CaseIterable {
        case angry = "愤怒"
        case tired = "疲惫"
        case numb = "麻木"
        case neutral = "一般"
        case relieved = "解脱"
        
        var emoji: String {
            switch self {
            case .angry: return "😤"
            case .tired: return "😩"
            case .numb: return "😑"
            case .neutral: return "😐"
            case .relieved: return "😌"
            }
        }
    }
}

// MARK: - Location
struct Location: Codable {
    var latitude: Double
    var longitude: Double
    var city: String?
    var district: String?
    var address: String?
}

// MARK: - Complaint (抱怨/吐槽)
struct Complaint: Codable, Identifiable {
    var id: String = UUID().uuidString
    var userId: String
    var userNickname: String?
    var userEmoji: String = "🐂"
    var content: String
    var aiResponse: String?
    var location: Location?
    var createdAt: Date = Date()
    var likes: Int = 0
    var comments: Int = 0
    var isAnonymous: Bool = true
    var category: Category = .general
    
    enum Category: String, Codable, CaseIterable {
        case overtime = "加班"
        case boss = "领导"
        case colleague = "同事"
        case salary = "工资"
        case meeting = "开会"
        case general = "其他"
        
        var emoji: String {
            switch self {
            case .overtime: return "⏰"
            case .boss: return "👔"
            case .colleague: return "🧑‍💼"
            case .salary: return "💰"
            case .meeting: return "📊"
            case .general: return "💬"
            }
        }
    }
}

// MARK: - City Stats (城市统计)
struct CityStats: Codable, Identifiable {
    var id: String { city }
    var city: String
    var totalWorkers: Int
    var checkedIn: Int
    var stillWorking: Int
    var averageCheckOutTime: String?
    var topComplaint: String?
    var latitude: Double
    var longitude: Double
    
    var checkInRate: Double {
        guard totalWorkers > 0 else { return 0 }
        return Double(checkedIn) / Double(totalWorkers)
    }
    
    var status: WorkStatus {
        let rate = checkInRate
        if rate >= 0.7 { return .mostlyOff }
        if rate >= 0.4 { return .struggling }
        return .stillWorking
    }
    
    enum WorkStatus {
        case mostlyOff      // 大部分已下班 🟢
        case struggling     // 挣扎中 🟡
        case stillWorking   // 还在加班 🔴
        
        var color: String {
            switch self {
            case .mostlyOff: return "34C759"
            case .struggling: return "FFCC00"
            case .stillWorking: return "FF3B30"
            }
        }
        
        var label: String {
            switch self {
            case .mostlyOff: return "大部分已撤离"
            case .struggling: return "挣扎中"
            case .stillWorking: return "还在加班"
            }
        }
    }
}

// MARK: - Push Notification
struct BattleReport: Codable {
    var timestamp: Date
    var totalNationwide: Int
    var checkedInNationwide: Int
    var stillWorkingNationwide: Int
    var topCities: [CityStats]
    var funnyQuote: String
    var urgencyLevel: UrgencyLevel
    
    enum UrgencyLevel: String, Codable {
        case normal     // 18:00-21:00
        case urgent     // 21:00-23:00
        case critical   // 23:00+
        
        var emoji: String {
            switch self {
            case .normal: return "📊"
            case .urgent: return "⚠️"
            case .critical: return "🚨"
            }
        }
    }
}

