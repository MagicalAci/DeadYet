//
//  Repositories.swift
//  DeadYet - 还没死？
//
//  数据仓库层 - 统一数据访问
//  使用 MapModels.swift 中定义的类型
//

import Foundation
import CoreLocation

// MARK: - ==================== API 客户端 ====================

@MainActor
class APIClient2 {
    static let shared = APIClient2()
    
    private let session: URLSession
    private let baseURL: String
    
    private init() {
        self.baseURL = AppConfig.shared.apiBaseURL
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = AppConfig.shared.apiTimeout
        self.session = URLSession(configuration: config)
    }
    
    func request<T: Decodable>(
        _ type: T.Type,
        path: String,
        method: String = "GET",
        body: Encodable? = nil,
        queryItems: [URLQueryItem]? = nil
    ) async throws -> T {
        var urlComponents = URLComponents(string: baseURL + path)!
        urlComponents.queryItems = queryItems
        
        guard let url = urlComponents.url else {
            throw AppError.network(.invalidURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = StorageManager.shared.authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        
        Logger.debug("🌐 \(method) \(path)")
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AppError.network(.invalidResponse)
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw AppError.network(.serverError(httpResponse.statusCode, nil))
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    func get<T: Decodable>(_ type: T.Type, path: String, queryItems: [URLQueryItem]? = nil) async throws -> T {
        try await request(type, path: path, method: "GET", queryItems: queryItems)
    }
    
    func post<T: Decodable>(_ type: T.Type, path: String, body: Encodable? = nil) async throws -> T {
        try await request(type, path: path, method: "POST", body: body)
    }
}

// MARK: - ==================== DTO 模型 ====================

struct AuthRequestDTO: Encodable {
    let email: String
}

struct AuthResponseDTO: Decodable {
    let success: Bool
    let message: String
    let user: UserDTO?
    let token: String?
}

struct UserDTO: Codable {
    let id: String
    let email: String
    let nickname: String?
    let avatarEmoji: String?
    let survivalDays: Int?
    let totalCheckIns: Int?
    let currentStreak: Int?
    let longestStreak: Int?
    let city: String?
    let district: String?
    let createdAt: String?
    let lastCheckIn: String?
}

struct CheckInRequestDTO: Encodable {
    let userId: String
    let complaint: String?
    let mood: String
    let city: String?
    let district: String?
}

struct CheckInResponseDTO: Decodable {
    let success: Bool
    let message: String
    let record: CheckInRecordDTO?
    let survivalDays: Int?
    let aiResponse: String?
}

struct CheckInRecordDTO: Decodable {
    let id: String
    let checkInTime: String
    let complaint: String?
    let aiResponse: String?
    let mood: String?
    let bannerGenerated: Bool?
}

struct ComplaintsResponseDTO: Decodable {
    let success: Bool
    let complaints: [ComplaintDTOResponse]?
    let total: Int?
}

struct ComplaintDTOResponse: Decodable {
    let id: String
    let userNickname: String?
    let userEmoji: String?
    let contentType: String?
    let content: String?
    let voiceUrl: String?
    let voiceDuration: Int?
    let category: String?
    let city: String?
    let district: String?
    let latitude: Double?
    let longitude: Double?
    let likes: Int?
    let comments: Int?
    let createdAt: String?
}

struct MapStatsResponseDTO: Decodable {
    let success: Bool
    let cities: [CityDTOResponse]?
}

struct CityDTOResponse: Decodable {
    let id: String?
    let name: String?
    let city: String?
    let province: String?
    let tier: Int?
    let latitude: Double?
    let longitude: Double?
    let totalWorkers: Int?
    let checkedIn: Int?
    let stillWorking: Int?
    let averageCheckOutTime: String?
}

struct DistrictDTOResponse: Decodable {
    let id: String?
    let city: String?
    let name: String?
    let district: String?
    let latitude: Double?
    let longitude: Double?
    let totalWorkers: Int?
    let checkedIn: Int?
    let stillWorking: Int?
}

struct HotSpotDTOResponse: Decodable {
    let id: String?
    let name: String?
    let type: String?
    let city: String?
    let district: String?
    let latitude: Double?
    let longitude: Double?
    let totalWorkers: Int?
    let checkedIn: Int?
    let stillWorking: Int?
    let tags: [String]?
}

// MARK: - ==================== 用户仓库 ====================

@MainActor
class UserRepository: ObservableObject {
    static let shared = UserRepository()
    
    private let api = APIClient2.shared
    private let storage = StorageManager.shared
    
    @Published private(set) var currentUser: UserProfile?
    @Published private(set) var isLoading = false
    
    private init() {
        currentUser = storage.get(UserProfile.self, forKey: StorageKeys.currentUser)
    }
    
    func login(email: String) async throws -> UserProfile {
        guard isValidEmail(email) else {
            throw AppError.auth(.invalidEmail)
        }
        
        isLoading = true
        defer { isLoading = false }
        
        // Mock 模式
        if AppConfig.shared.enableMockData {
            try await Task.sleep(nanoseconds: 500_000_000)
            
            let user = UserProfile(
                email: email,
                survivalDays: 1,
                city: "北京",
                district: "海淀区"
            )
            
            storage.set(user, forKey: StorageKeys.currentUser)
            currentUser = user
            return user
        }
        
        // 真实 API
        let response: AuthResponseDTO = try await api.post(
            AuthResponseDTO.self,
            path: APIEndpoints.authEmail,
            body: AuthRequestDTO(email: email)
        )
        
        guard response.success, let dto = response.user else {
            throw AppError.auth(.invalidCredentials)
        }
        
        let user = UserProfile(
            id: dto.id,
            email: dto.email,
            nickname: dto.nickname,
            avatarEmoji: dto.avatarEmoji ?? "🐂",
            survivalDays: dto.survivalDays ?? 0,
            totalCheckIns: dto.totalCheckIns ?? 0,
            currentStreak: dto.currentStreak ?? 0,
            longestStreak: dto.longestStreak ?? 0,
            city: dto.city,
            district: dto.district
        )
        
        if let token = response.token {
            storage.authToken = token
        }
        
        storage.set(user, forKey: StorageKeys.currentUser)
        currentUser = user
        
        return user
    }
    
    func checkIn(complaint: String?, mood: CheckInRecordData.Mood, city: String?, district: String?) async throws -> CheckInRecordData {
        guard var user = currentUser else {
            throw AppError.auth(.notLoggedIn)
        }
        
        if storage.hasCheckedInToday {
            throw AppError.business(.alreadyCheckedIn)
        }
        
        isLoading = true
        defer { isLoading = false }
        
        // Mock 模式
        if AppConfig.shared.enableMockData {
            try await Task.sleep(nanoseconds: 300_000_000)
            
            var record = CheckInRecordData(userId: user.id, complaint: complaint, mood: mood)
            record.aiResponse = generateMockAIResponse(for: complaint)
            record.bannerGenerated = true
            
            user = UserProfile(
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                avatarEmoji: user.avatarEmoji,
                survivalDays: user.survivalDays + 1,
                totalCheckIns: user.totalCheckIns + 1,
                currentStreak: user.currentStreak + 1,
                longestStreak: max(user.longestStreak, user.currentStreak + 1),
                city: user.city,
                district: user.district,
                createdAt: user.createdAt,
                lastCheckIn: Date()
            )
            
            storage.set(user, forKey: StorageKeys.currentUser)
            storage.lastCheckInDate = Date()
            currentUser = user
            
            return record
        }
        
        // 真实 API
        let request = CheckInRequestDTO(
            userId: user.id,
            complaint: complaint,
            mood: mood.rawValue,
            city: city,
            district: district
        )
        
        let response: CheckInResponseDTO = try await api.post(
            CheckInResponseDTO.self,
            path: APIEndpoints.checkIn,
            body: request
        )
        
        guard response.success, let dto = response.record else {
            throw AppError.business(.checkInFailed)
        }
        
        let record = CheckInRecordData(
            id: dto.id,
            userId: user.id,
            checkInTime: dto.checkInTime.toDate() ?? Date(),
            complaint: dto.complaint,
            aiResponse: response.aiResponse ?? dto.aiResponse,
            mood: CheckInRecordData.Mood(rawValue: dto.mood ?? "") ?? .neutral,
            bannerGenerated: dto.bannerGenerated ?? false
        )
        
        user = UserProfile(
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            avatarEmoji: user.avatarEmoji,
            survivalDays: response.survivalDays ?? (user.survivalDays + 1),
            totalCheckIns: user.totalCheckIns + 1,
            currentStreak: user.currentStreak + 1,
            longestStreak: max(user.longestStreak, user.currentStreak + 1),
            city: user.city,
            district: user.district,
            createdAt: user.createdAt,
            lastCheckIn: Date()
        )
        
        storage.set(user, forKey: StorageKeys.currentUser)
        storage.lastCheckInDate = Date()
        currentUser = user
        
        return record
    }
    
    func logout() {
        storage.clearAll()
        currentUser = nil
    }
    
    private func isValidEmail(_ email: String) -> Bool {
        let regex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        return NSPredicate(format: "SELF MATCHES %@", regex).evaluate(with: email)
    }
    
    private func generateMockAIResponse(for complaint: String?) -> String {
        guard let complaint = complaint, !complaint.isEmpty else {
            return ["行，今天又没死，恭喜你👏", "又苟过一天，明天继续！", "没抱怨？装什么坚强呢？"].randomElement()!
        }
        
        if complaint.contains("加班") {
            return "又加班？你这是打工还是卖身？加班费呢？没有？那你加个屁！"
        }
        if complaint.contains("领导") || complaint.contains("老板") {
            return "你领导是不是脑子有坑？这种傻逼领导全国多了去了，你不走他走不了，懂？"
        }
        if complaint.contains("工资") || complaint.contains("钱") {
            return "就这点钱你还干？我真服了你这种老实人。穷是暂时的，被压榨是持久的。"
        }
        
        return ["就这？我听过比这惨十倍的。继续苟着吧。", "恭喜你没猝死，这就是你今天最大的成就。", "职场没有朋友，只有利益。清醒点。"].randomElement()!
    }
}

// MARK: - ==================== 地图仓库 ====================

@MainActor
class MapRepository2: ObservableObject {
    static let shared = MapRepository2()
    
    private let api = APIClient2.shared
    private let cache = CacheManager.shared
    
    private init() {}
    
    func fetchAllCities() async throws -> [CityData] {
        if let cached = cache.get([CityData].self, forKey: "cities", maxAge: 300) {
            return cached
        }
        
        if AppConfig.shared.enableMockData {
            try await Task.sleep(nanoseconds: 200_000_000)
            let cities = MockMapDataProvider.generateCityData()
            cache.set(cities, forKey: "cities")
            return cities
        }
        
        let response: MapStatsResponseDTO = try await api.get(
            MapStatsResponseDTO.self,
            path: APIEndpoints.mapCities
        )
        
        let cities = response.cities?.map { dto in
            CityData(
                city: dto.name ?? dto.city ?? "",
                province: dto.province ?? "",
                tier: dto.tier ?? 3,
                latitude: dto.latitude ?? 0,
                longitude: dto.longitude ?? 0,
                totalWorkers: dto.totalWorkers ?? 0,
                checkedIn: dto.checkedIn ?? 0,
                stillWorking: dto.stillWorking ?? 0,
                averageCheckOutTime: dto.averageCheckOutTime
            )
        } ?? []
        
        cache.set(cities, forKey: "cities")
        return cities
    }
    
    func fetchDistricts(city: String) async throws -> [DistrictData] {
        let cacheKey = "districts_\(city)"
        
        if let cached = cache.get([DistrictData].self, forKey: cacheKey, maxAge: 300) {
            return cached
        }
        
        if AppConfig.shared.enableMockData {
            try await Task.sleep(nanoseconds: 100_000_000)
            let districts = MockMapDataProvider.generateDistrictData(for: city)
            cache.set(districts, forKey: cacheKey)
            return districts
        }
        
        struct Response: Decodable { let data: [DistrictDTOResponse]? }
        let response: Response = try await api.get(Response.self, path: APIEndpoints.mapDistricts(city))
        
        let districts = response.data?.map { dto in
            DistrictData(
                city: dto.city ?? city,
                district: dto.name ?? dto.district ?? "",
                latitude: dto.latitude ?? 0,
                longitude: dto.longitude ?? 0,
                totalWorkers: dto.totalWorkers ?? 0,
                checkedIn: dto.checkedIn ?? 0,
                stillWorking: dto.stillWorking ?? 0
            )
        } ?? []
        
        cache.set(districts, forKey: cacheKey)
        return districts
    }
    
    func fetchHotSpots(city: String, district: String?) async throws -> [HotSpot] {
        let cacheKey = "hotspots_\(city)"
        
        if let cached = cache.get([HotSpot].self, forKey: cacheKey, maxAge: 300) {
            if let district = district {
                return cached.filter { $0.district == district }
            }
            return cached
        }
        
        if AppConfig.shared.enableMockData {
            let hotSpots = MockMapDataProvider.generateHotSpots(city: city, district: district)
            cache.set(hotSpots, forKey: cacheKey)
            return hotSpots
        }
        
        struct Response: Decodable { let data: [HotSpotDTOResponse]? }
        let response: Response = try await api.get(Response.self, path: APIEndpoints.mapHotSpots(city))
        
        let hotSpots = response.data?.map { dto in
            HotSpot(
                name: dto.name ?? "",
                type: HotSpot.SpotType(rawValue: dto.type ?? "") ?? .office,
                latitude: dto.latitude ?? 0,
                longitude: dto.longitude ?? 0,
                city: dto.city ?? city,
                district: dto.district ?? "",
                totalWorkers: dto.totalWorkers ?? 0,
                checkedIn: dto.checkedIn ?? 0,
                stillWorking: dto.stillWorking ?? 0,
                tags: dto.tags
            )
        } ?? []
        
        cache.set(hotSpots, forKey: cacheKey)
        return hotSpots
    }
    
    func refresh() {
        cache.remove(forKey: "cities")
    }
}

// MARK: - ==================== 抱怨仓库 ====================

@MainActor
class ComplaintRepository2: ObservableObject {
    static let shared = ComplaintRepository2()
    
    private let api = APIClient2.shared
    private let cache = CacheManager.shared
    
    private init() {}
    
    func fetchComplaints(city: String?, district: String?, limit: Int = 50) async throws -> [ComplaintData] {
        let cacheKey = city != nil ? "complaints_\(city!)" : "complaints"
        
        if let cached = cache.get([ComplaintData].self, forKey: cacheKey, maxAge: 120) {
            return cached
        }
        
        if AppConfig.shared.enableMockData {
            try await Task.sleep(nanoseconds: 200_000_000)
            var complaints = MockMapDataProvider.generateComplaints()
            if let city = city {
                complaints = complaints.filter { $0.city == city }
            }
            cache.set(complaints, forKey: cacheKey)
            return Array(complaints.prefix(limit))
        }
        
        var queryItems = [URLQueryItem(name: "limit", value: "\(limit)")]
        if let city = city { queryItems.append(URLQueryItem(name: "city", value: city)) }
        if let district = district { queryItems.append(URLQueryItem(name: "district", value: district)) }
        
        let response: ComplaintsResponseDTO = try await api.get(
            ComplaintsResponseDTO.self,
            path: APIEndpoints.complaints,
            queryItems: queryItems
        )
        
        let complaints = response.complaints?.map { dto in
            ComplaintData(
                userId: "",
                userNickname: dto.userNickname,
                userEmoji: dto.userEmoji ?? "🐂",
                contentType: ComplaintData.ContentType(rawValue: dto.contentType ?? "text") ?? .text,
                content: dto.content,
                voiceUrl: dto.voiceUrl,
                voiceDuration: dto.voiceDuration ?? 0,
                latitude: dto.latitude ?? 0,
                longitude: dto.longitude ?? 0,
                city: dto.city,
                district: dto.district,
                createdAt: dto.createdAt?.toDate() ?? Date(),
                category: ComplaintData.Category(rawValue: dto.category ?? "") ?? .general,
                likes: dto.likes ?? 0,
                comments: dto.comments ?? 0
            )
        } ?? []
        
        cache.set(complaints, forKey: cacheKey)
        return complaints
    }
    
    func refresh() {
        cache.remove(forKey: "complaints")
    }
}

// MARK: - ==================== 依赖容器 ====================

@MainActor
class DependencyContainer: ObservableObject {
    static let shared = DependencyContainer()
    
    lazy var users = UserRepository.shared
    lazy var map = MapRepository2.shared
    lazy var complaints = ComplaintRepository2.shared
    
    private init() {
        Logger.info("DependencyContainer 初始化")
        Logger.info("环境: \(AppConfig.shared.environment.rawValue)")
        Logger.info("Mock模式: \(AppConfig.shared.enableMockData)")
    }
}
