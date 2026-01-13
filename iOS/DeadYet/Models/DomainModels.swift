//
//  DomainModels.swift
//  DeadYet - 还没死？
//
//  统一领域模型
//

import Foundation
import CoreLocation

// MARK: - ==================== 用户模型 ====================

struct User: Codable, Identifiable, Equatable {
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
struct CheckInRecord: Codable, Identifiable {
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

// MARK: - ==================== 抱怨模型 ====================

struct Complaint: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    var userNickname: String?
    var userEmoji: String
    
    var contentType: ContentType
    var content: String?
    var voiceUrl: String?
    var voiceDuration: Int
    
    var latitude: Double
    var longitude: Double
    var city: String?
    var district: String?
    var spotName: String?
    
    var category: Category
    var createdAt: Date
    var likes: Int
    var comments: Int
    var isAiGenerated: Bool
    var aiResponse: String?
    
    var isVoice: Bool { contentType == .voice }
    
    init(
        id: String = UUID().uuidString,
        userId: String,
        userNickname: String? = nil,
        userEmoji: String = "🐂",
        contentType: ContentType = .text,
        content: String? = nil,
        voiceUrl: String? = nil,
        voiceDuration: Int = 0,
        latitude: Double = 0,
        longitude: Double = 0,
        city: String? = nil,
        district: String? = nil,
        spotName: String? = nil,
        category: Category = .general,
        createdAt: Date = Date(),
        likes: Int = 0,
        comments: Int = 0,
        isAiGenerated: Bool = false,
        aiResponse: String? = nil
    ) {
        self.id = id
        self.userId = userId
        self.userNickname = userNickname
        self.userEmoji = userEmoji
        self.contentType = contentType
        self.content = content
        self.voiceUrl = voiceUrl
        self.voiceDuration = voiceDuration
        self.latitude = latitude
        self.longitude = longitude
        self.city = city
        self.district = district
        self.spotName = spotName
        self.category = category
        self.createdAt = createdAt
        self.likes = likes
        self.comments = comments
        self.isAiGenerated = isAiGenerated
        self.aiResponse = aiResponse
    }
    
    enum ContentType: String, Codable {
        case text
        case voice
    }
    
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

// MARK: - 评论
struct Comment: Codable, Identifiable, Equatable {
    let id: String
    let complaintId: String
    let userId: String
    var parentId: String?
    var userNickname: String?
    var userEmoji: String
    var contentType: Complaint.ContentType
    var content: String?
    var voiceUrl: String?
    var voiceDuration: Int
    var createdAt: Date
    var likes: Int
    var isAiGenerated: Bool
}

// MARK: - ==================== 地图模型 ====================

struct City: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var province: String
    var tier: Int
    var latitude: Double
    var longitude: Double
    var totalWorkers: Int
    var checkedIn: Int
    var stillWorking: Int
    var averageCheckOutTime: String?
    
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
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    
    init(
        id: String = UUID().uuidString,
        name: String,
        province: String = "",
        tier: Int = 3,
        latitude: Double,
        longitude: Double,
        totalWorkers: Int = 0,
        checkedIn: Int = 0,
        stillWorking: Int = 0,
        averageCheckOutTime: String? = nil
    ) {
        self.id = id
        self.name = name
        self.province = province
        self.tier = tier
        self.latitude = latitude
        self.longitude = longitude
        self.totalWorkers = totalWorkers
        self.checkedIn = checkedIn
        self.stillWorking = stillWorking
        self.averageCheckOutTime = averageCheckOutTime
    }
}

struct District: Codable, Identifiable, Equatable {
    let id: String
    var city: String
    var name: String
    var latitude: Double
    var longitude: Double
    var totalWorkers: Int
    var checkedIn: Int
    var stillWorking: Int
    var averageCheckOutTime: String?
    
    var checkInRate: Double {
        guard totalWorkers > 0 else { return 0 }
        return Double(checkedIn) / Double(totalWorkers)
    }
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    
    init(
        id: String = UUID().uuidString,
        city: String,
        name: String,
        latitude: Double,
        longitude: Double,
        totalWorkers: Int = 0,
        checkedIn: Int = 0,
        stillWorking: Int = 0,
        averageCheckOutTime: String? = nil
    ) {
        self.id = id
        self.city = city
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.totalWorkers = totalWorkers
        self.checkedIn = checkedIn
        self.stillWorking = stillWorking
        self.averageCheckOutTime = averageCheckOutTime
    }
}

struct HotSpot: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var type: SpotType
    var latitude: Double
    var longitude: Double
    var city: String
    var district: String
    var totalWorkers: Int
    var checkedIn: Int
    var stillWorking: Int
    var averageCheckOutTime: String?
    var tags: [String]
    
    var checkInRate: Double {
        guard totalWorkers > 0 else { return 0 }
        return Double(checkedIn) / Double(totalWorkers)
    }
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    
    init(
        id: String = UUID().uuidString,
        name: String,
        type: SpotType = .office,
        latitude: Double,
        longitude: Double,
        city: String,
        district: String,
        totalWorkers: Int = 0,
        checkedIn: Int = 0,
        stillWorking: Int = 0,
        averageCheckOutTime: String? = nil,
        tags: [String] = []
    ) {
        self.id = id
        self.name = name
        self.type = type
        self.latitude = latitude
        self.longitude = longitude
        self.city = city
        self.district = district
        self.totalWorkers = totalWorkers
        self.checkedIn = checkedIn
        self.stillWorking = stillWorking
        self.averageCheckOutTime = averageCheckOutTime
        self.tags = tags
    }
    
    enum SpotType: String, Codable {
        case techPark = "科技园区"
        case cbd = "CBD商圈"
        case industrial = "工业园区"
        case office = "写字楼"
        case other = "其他"
        
        var emoji: String {
            switch self {
            case .techPark: return "💻"
            case .cbd: return "🏢"
            case .industrial: return "🏭"
            case .office: return "🏬"
            case .other: return "📍"
            }
        }
    }
}

enum WorkStatus: String, Codable {
    case mostlyOff = "大部分已撤离"
    case struggling = "挣扎中"
    case stillWorking = "还在加班"
    
    var colorHex: String {
        switch self {
        case .mostlyOff: return "34C759"
        case .struggling: return "FFCC00"
        case .stillWorking: return "FF3B30"
        }
    }
}
