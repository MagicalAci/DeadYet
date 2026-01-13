//
//  AppCore.swift
//  DeadYet - 还没死？
//
//  核心基础设施：配置、错误、缓存、存储
//

import Foundation
import Security
import SwiftUI

// MARK: - ==================== 配置管理 ====================

enum AppEnvironment: String {
    case development = "dev"
    case staging = "staging"
    case production = "prod"
    
    var apiBaseURL: String {
        switch self {
        case .development: return "http://localhost:3000"
        case .staging: return "https://deadyet-staging.zeabur.app"
        case .production: return "https://deadyet.zeabur.app"
        }
    }
}

struct AppConfig {
    static let shared = AppConfig()
    
    #if DEBUG
    let environment: AppEnvironment = .development
    #else
    let environment: AppEnvironment = .production
    #endif
    
    var apiBaseURL: String { environment.apiBaseURL }
    var apiTimeout: TimeInterval { 30 }
    var maxRetryCount: Int { 3 }
    var cacheExpiration: TimeInterval { 300 }
    var enableMockData: Bool { environment == .development }
    
    var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }
}

struct StorageKeys {
    static let authToken = "authToken"
    static let currentUser = "currentUser"
    static let isOnboarded = "isOnboarded"
    static let lastCheckInDate = "lastCheckInDate"
}

struct APIEndpoints {
    static let authEmail = "/api/auth/email"
    static let checkIn = "/api/checkin"
    static let checkInToday = "/api/checkin/today"
    static let checkInHistory = "/api/checkin/history"
    static let complaints = "/api/complaints"
    static let mapStats = "/api/map/stats"
    static let mapCities = "/api/map/cities"
    static func mapDistricts(_ city: String) -> String { "/api/map/cities/\(city)/districts" }
    static func mapHotSpots(_ city: String) -> String { "/api/map/cities/\(city)/hotspots" }
    static let mapNearby = "/api/map/nearby"
    static let aiRoast = "/api/ai/roast"
}

// MARK: - ==================== 错误处理 ====================

enum AppError: Error, LocalizedError {
    case network(NetworkError)
    case auth(AuthError)
    case location(LocationError)
    case business(BusinessError)
    case unknown(Error?)
    
    var errorDescription: String? { userMessage }
    
    var userMessage: String {
        switch self {
        case .network(let e): return e.userMessage
        case .auth(let e): return e.userMessage
        case .location(let e): return e.userMessage
        case .business(let e): return e.userMessage
        case .unknown: return "出了点问题"
        }
    }
    
    var isRetryable: Bool {
        switch self {
        case .network(let e): return e.isRetryable
        case .auth(let e): return e == .tokenExpired
        default: return false
        }
    }
    
    static func from(_ error: Error) -> AppError {
        if let appError = error as? AppError { return appError }
        if let networkError = error as? NetworkError { return .network(networkError) }
        if let authError = error as? AuthError { return .auth(authError) }
        if let urlError = error as? URLError {
            switch urlError.code {
            case .notConnectedToInternet, .networkConnectionLost: return .network(.noConnection)
            case .timedOut: return .network(.timeout)
            default: return .network(.invalidResponse)
            }
        }
        if error is DecodingError { return .network(.decodingFailed) }
        return .unknown(error)
    }
}

enum NetworkError: Error {
    case noConnection, timeout, serverError(Int, String?), invalidURL, invalidResponse, decodingFailed
    
    var userMessage: String {
        switch self {
        case .noConnection: return "网络断了"
        case .timeout: return "请求超时"
        case .serverError(let code, let msg): return msg ?? "服务器错误(\(code))"
        case .invalidURL: return "URL无效"
        case .invalidResponse: return "响应无效"
        case .decodingFailed: return "数据解析失败"
        }
    }
    
    var isRetryable: Bool {
        switch self {
        case .noConnection, .timeout, .serverError: return true
        default: return false
        }
    }
}

enum AuthError: Error, Equatable {
    case notLoggedIn, invalidCredentials, tokenExpired, invalidEmail
    
    var userMessage: String {
        switch self {
        case .notLoggedIn: return "还没登录"
        case .invalidCredentials: return "凭证无效"
        case .tokenExpired: return "登录过期"
        case .invalidEmail: return "邮箱格式不对"
        }
    }
}

enum LocationError: Error {
    case permissionDenied, locationUnknown, notInServiceArea
    
    var userMessage: String {
        switch self {
        case .permissionDenied: return "请开启位置权限"
        case .locationUnknown: return "无法获取位置"
        case .notInServiceArea: return "不在服务范围内"
        }
    }
}

enum BusinessError: Error {
    case alreadyCheckedIn, checkInFailed, custom(String)
    
    var userMessage: String {
        switch self {
        case .alreadyCheckedIn: return "今天已经打过卡了"
        case .checkInFailed: return "打卡失败"
        case .custom(let msg): return msg
        }
    }
}

// MARK: - ==================== 缓存管理 ====================

@MainActor
class CacheManager: ObservableObject {
    static let shared = CacheManager()
    
    private let userDefaults = UserDefaults.standard
    private var memoryCache: [String: (data: Data, timestamp: Date)] = [:]
    
    private init() {}
    
    func set<T: Encodable>(_ value: T, forKey key: String, expiration: TimeInterval = 300) {
        guard let data = try? JSONEncoder().encode(value) else { return }
        memoryCache[key] = (data, Date())
        
        // 也存到磁盘
        userDefaults.set(data, forKey: "cache_\(key)")
        userDefaults.set(Date(), forKey: "cache_\(key)_ts")
    }
    
    func get<T: Decodable>(_ type: T.Type, forKey key: String, maxAge: TimeInterval = 300) -> T? {
        // 先从内存获取
        if let cached = memoryCache[key] {
            if Date().timeIntervalSince(cached.timestamp) < maxAge {
                return try? JSONDecoder().decode(type, from: cached.data)
            }
            memoryCache.removeValue(forKey: key)
        }
        
        // 再从磁盘获取
        if let data = userDefaults.data(forKey: "cache_\(key)"),
           let timestamp = userDefaults.object(forKey: "cache_\(key)_ts") as? Date,
           Date().timeIntervalSince(timestamp) < maxAge {
            memoryCache[key] = (data, timestamp)
            return try? JSONDecoder().decode(type, from: data)
        }
        
        return nil
    }
    
    func remove(forKey key: String) {
        memoryCache.removeValue(forKey: key)
        userDefaults.removeObject(forKey: "cache_\(key)")
        userDefaults.removeObject(forKey: "cache_\(key)_ts")
    }
    
    func clearAll() {
        memoryCache.removeAll()
        let keys = userDefaults.dictionaryRepresentation().keys.filter { $0.hasPrefix("cache_") }
        keys.forEach { userDefaults.removeObject(forKey: $0) }
    }
}

// MARK: - ==================== 存储管理 ====================

@MainActor
class StorageManager: ObservableObject {
    static let shared = StorageManager()
    
    private let userDefaults = UserDefaults.standard
    
    private init() {}
    
    // MARK: UserDefaults
    func set<T: Encodable>(_ value: T, forKey key: String) {
        if let data = try? JSONEncoder().encode(value) {
            userDefaults.set(data, forKey: key)
        }
    }
    
    func get<T: Decodable>(_ type: T.Type, forKey key: String) -> T? {
        guard let data = userDefaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }
    
    func remove(forKey key: String) {
        userDefaults.removeObject(forKey: key)
    }
    
    // MARK: Keychain
    func setSecure(_ value: String, forKey key: String) -> Bool {
        guard let data = value.data(using: .utf8) else { return false }
        deleteSecure(forKey: key)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
        ]
        return SecItemAdd(query as CFDictionary, nil) == errSecSuccess
    }
    
    func getSecure(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }
    
    @discardableResult
    func deleteSecure(forKey key: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        return SecItemDelete(query as CFDictionary) == errSecSuccess
    }
    
    // MARK: 便捷属性
    var authToken: String? {
        get { getSecure(forKey: StorageKeys.authToken) }
        set {
            if let token = newValue { _ = setSecure(token, forKey: StorageKeys.authToken) }
            else { deleteSecure(forKey: StorageKeys.authToken) }
        }
    }
    
    var isOnboarded: Bool {
        get { userDefaults.bool(forKey: StorageKeys.isOnboarded) }
        set { userDefaults.set(newValue, forKey: StorageKeys.isOnboarded) }
    }
    
    var lastCheckInDate: Date? {
        get { get(Date.self, forKey: StorageKeys.lastCheckInDate) }
        set {
            if let date = newValue { set(date, forKey: StorageKeys.lastCheckInDate) }
            else { remove(forKey: StorageKeys.lastCheckInDate) }
        }
    }
    
    var hasCheckedInToday: Bool {
        guard let lastDate = lastCheckInDate else { return false }
        return Calendar.current.isDateInToday(lastDate)
    }
    
    func clearAll() {
        let domain = Bundle.main.bundleIdentifier!
        userDefaults.removePersistentDomain(forName: domain)
        deleteSecure(forKey: StorageKeys.authToken)
        CacheManager.shared.clearAll()
    }
}

// MARK: - ==================== 日志 ====================

struct Logger {
    static func debug(_ message: String) {
        #if DEBUG
        print("🔍 \(message)")
        #endif
    }
    
    static func info(_ message: String) {
        print("ℹ️ \(message)")
    }
    
    static func error(_ message: String) {
        print("❌ \(message)")
    }
}

// MARK: - ==================== 日期扩展 ====================

extension String {
    func toDate() -> Date? {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: self) { return date }
        
        let dateFormatter = DateFormatter()
        for format in ["yyyy-MM-dd'T'HH:mm:ss.SSSZ", "yyyy-MM-dd'T'HH:mm:ssZ", "yyyy-MM-dd HH:mm:ss"] {
            dateFormatter.dateFormat = format
            if let date = dateFormatter.date(from: self) { return date }
        }
        return nil
    }
}
