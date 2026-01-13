//
//  DomainModels.swift
//  DeadYet - 还没死？
//
//  用户相关领域模型
//  注意：地图相关模型在 MapModels.swift 中定义
//

import Foundation

// MARK: - ==================== 用户模型 ====================

struct UserProfile: Codable, Identifiable, Equatable {
    let id: String
    var email: String
    var nickname: String?
    var avatarEmoji: String
    var survivalDays: Int
    var totalCheckIns: Int
    var currentStreak: Int
    var longestStreak: Int
    var city: String?
    var district: String?
    var createdAt: Date
    var lastCheckIn: Date?
    
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
    
    var hasCheckedInToday: Bool {
        guard let lastCheckIn = lastCheckIn else { return false }
        return Calendar.current.isDateInToday(lastCheckIn)
    }
    
    init(
        id: String = UUID().uuidString,
        email: String,
        nickname: String? = nil,
        avatarEmoji: String = "🐂",
        survivalDays: Int = 0,
        totalCheckIns: Int = 0,
        currentStreak: Int = 0,
        longestStreak: Int = 0,
        city: String? = nil,
        district: String? = nil,
        createdAt: Date = Date(),
        lastCheckIn: Date? = nil
    ) {
        self.id = id
        self.email = email
        self.nickname = nickname
        self.avatarEmoji = avatarEmoji
        self.survivalDays = survivalDays
        self.totalCheckIns = totalCheckIns
        self.currentStreak = currentStreak
        self.longestStreak = longestStreak
        self.city = city
        self.district = district
        self.createdAt = createdAt
        self.lastCheckIn = lastCheckIn
    }
}

// MARK: - 锦旗等级
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
    
    var description: String {
        switch self {
        case .freshLeek: return "刚入职场的小韭菜"
        case .newbieSlave: return "开始适应社畜生活"
        case .seniorSlave: return "已经是资深打工人了"
        case .steelWorker: return "钢铁意志，任何加班都打不倒你"
        case .immortalVeteran: return "不死老兵，职场的活化石"
        case .legendaryOx: return "传说中的存在"
        }
    }
}

// MARK: - 签到记录
struct CheckInRecordData: Codable, Identifiable {
    let id: String
    let userId: String
    let checkInTime: Date
    var complaint: String?
    var aiResponse: String?
    var mood: Mood
    var city: String?
    var district: String?
    var isVoice: Bool
    var voiceDuration: Int?
    var bannerGenerated: Bool
    
    init(
        id: String = UUID().uuidString,
        userId: String,
        checkInTime: Date = Date(),
        complaint: String? = nil,
        aiResponse: String? = nil,
        mood: Mood = .neutral,
        city: String? = nil,
        district: String? = nil,
        isVoice: Bool = false,
        voiceDuration: Int? = nil,
        bannerGenerated: Bool = false
    ) {
        self.id = id
        self.userId = userId
        self.checkInTime = checkInTime
        self.complaint = complaint
        self.aiResponse = aiResponse
        self.mood = mood
        self.city = city
        self.district = district
        self.isVoice = isVoice
        self.voiceDuration = voiceDuration
        self.bannerGenerated = bannerGenerated
    }
    
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
