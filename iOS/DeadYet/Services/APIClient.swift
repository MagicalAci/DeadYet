//
//  APIClient.swift
//  DeadYet - 还没死？
//
//  API客户端
//

import Foundation

@MainActor
class APIClient: ObservableObject {
    static let shared = APIClient()
    
    private let baseURL: String
    private let session: URLSession
    
    init() {
        // Zeabur部署的API地址 ✅ 已上线
        self.baseURL = ProcessInfo.processInfo.environment["API_URL"] ?? "https://deadyet.zeabur.app"
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
    }
    
    // MARK: - Generic Request
    
    func request<T: Decodable>(
        path: String,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        queryItems: [URLQueryItem]? = nil
    ) async throws -> T {
        var urlComponents = URLComponents(string: baseURL + path)!
        urlComponents.queryItems = queryItems
        
        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // 添加认证Token（如果有）
        if let token = UserDefaults.standard.string(forKey: "authToken") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            // 尝试解析错误信息
            if let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.serverError(errorResponse.message ?? "未知错误")
            }
            throw APIError.httpError(httpResponse.statusCode)
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    // MARK: - Auth API
    
    func loginWithEmail(_ email: String) async throws -> AuthResponse {
        struct LoginRequest: Encodable {
            let email: String
        }
        
        return try await request(
            path: "/api/auth/email",
            method: .post,
            body: LoginRequest(email: email)
        )
    }
    
    // MARK: - Check-in API
    
    func checkIn(
        userId: String,
        complaint: String?,
        mood: String,
        city: String?,
        district: String?
    ) async throws -> CheckInResponse {
        struct CheckInRequest: Encodable {
            let userId: String
            let complaint: String?
            let mood: String
            let city: String?
            let district: String?
        }
        
        return try await request(
            path: "/api/checkin",
            method: .post,
            body: CheckInRequest(
                userId: userId,
                complaint: complaint,
                mood: mood,
                city: city,
                district: district
            )
        )
    }
    
    // MARK: - Map API
    
    func getCityStats() async throws -> MapStatsResponse {
        return try await request(path: "/api/map/stats")
    }
    
    // MARK: - Complaints API
    
    func getComplaints(city: String? = nil, limit: Int = 20) async throws -> ComplaintsResponse {
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        if let city = city {
            queryItems.append(URLQueryItem(name: "city", value: city))
        }
        
        return try await request(
            path: "/api/complaints",
            queryItems: queryItems
        )
    }
    
    func postComplaint(
        userId: String,
        content: String,
        category: String,
        city: String?,
        district: String?
    ) async throws -> PostComplaintResponse {
        struct ComplaintRequest: Encodable {
            let userId: String
            let content: String
            let category: String
            let isAnonymous: Bool
            let city: String?
            let district: String?
        }
        
        return try await request(
            path: "/api/complaints",
            method: .post,
            body: ComplaintRequest(
                userId: userId,
                content: content,
                category: category,
                isAnonymous: true,
                city: city,
                district: district
            )
        )
    }
    
    // MARK: - AI API
    
    func getRoast(content: String, category: String?) async throws -> RoastResponse {
        struct RoastRequest: Encodable {
            let content: String
            let category: String?
        }
        
        return try await request(
            path: "/api/ai/roast",
            method: .post,
            body: RoastRequest(content: content, category: category)
        )
    }
}

// MARK: - HTTP Method
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

// MARK: - API Errors
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case serverError(String)
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL不对，程序员写错了"
        case .invalidResponse:
            return "服务器返回了个屁"
        case .httpError(let code):
            return "HTTP错误：\(code)"
        case .serverError(let message):
            return message
        case .decodingError:
            return "数据解析失败，和你的人生一样"
        }
    }
}

// MARK: - Response Models
struct ErrorResponse: Decodable {
    let error: String?
    let message: String?
}

struct AuthResponse: Decodable {
    let success: Bool
    let message: String
    let user: UserDTO?
    
    struct UserDTO: Decodable {
        let id: String
        let email: String
        let nickname: String?
        let avatarEmoji: String
        let survivalDays: Int
        let totalCheckIns: Int
        let currentStreak: Int
        let longestStreak: Int
        let city: String?
        let district: String?
    }
}

struct CheckInResponse: Decodable {
    let success: Bool
    let message: String
    let record: CheckInRecordDTO
    let survivalDays: Int
    
    struct CheckInRecordDTO: Decodable {
        let id: String
        let checkInTime: String
        let complaint: String?
        let aiResponse: String?
        let bannerGenerated: Bool
        let mood: String
    }
}

struct MapStatsResponse: Decodable {
    let success: Bool
    let timestamp: String
    let summary: Summary
    let cities: [CityStatsDTO]
    
    struct Summary: Decodable {
        let totalNationwide: Int
        let checkedInNationwide: Int
        let stillWorkingNationwide: Int
        let overallCheckInRate: Double
    }
    
    struct CityStatsDTO: Decodable {
        let city: String
        let totalWorkers: Int
        let checkedIn: Int
        let stillWorking: Int
        let checkInRate: Double
        let latitude: Double
        let longitude: Double
        let status: String
    }
}

struct ComplaintsResponse: Decodable {
    let success: Bool
    let complaints: [ComplaintDTO]
    let total: Int
    
    struct ComplaintDTO: Decodable {
        let id: String
        let userEmoji: String
        let userNickname: String?
        let content: String
        let category: String
        let city: String?
        let district: String?
        let likes: Int
        let comments: Int
        let createdAt: String
    }
}

struct PostComplaintResponse: Decodable {
    let success: Bool
    let message: String
    let complaint: ComplaintsResponse.ComplaintDTO
}

struct RoastResponse: Decodable {
    let success: Bool
    let roast: String
    let character: String
}

