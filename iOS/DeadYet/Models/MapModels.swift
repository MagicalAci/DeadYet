//
//  MapModels.swift
//  DeadYet - 还没死？
//
//  地图相关数据模型
//  设计原则：Mock 数据与真实数据使用相同结构，方便后续替换
//

import Foundation
import CoreLocation

// MARK: - 全国城市统计（全国视图用）
struct CityData: Codable, Identifiable {
    var id: String { city }
    var city: String                    // 城市名
    var province: String                // 省份
    var tier: Int                       // 城市等级 1=一线 2=新一线 3=二线
    var latitude: Double
    var longitude: Double
    
    // 实时统计数据
    var totalWorkers: Int               // 总打工人数
    var checkedIn: Int                  // 已下班人数
    var stillWorking: Int               // 还在加班人数
    var averageCheckOutTime: String?    // 平均下班时间
    
    // 计算属性
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
    
    enum WorkStatus: String, Codable {
        case mostlyOff = "大部分已撤离"
        case struggling = "挣扎中"
        case stillWorking = "还在加班"
        
        var color: String {
            switch self {
            case .mostlyOff: return "34C759"
            case .struggling: return "FFCC00"
            case .stillWorking: return "FF3B30"
            }
        }
    }
}

// MARK: - 区/街道统计（同城视图用）
struct DistrictData: Codable, Identifiable {
    var id: String { "\(city)-\(district)" }
    var city: String                    // 所属城市
    var district: String                // 区名称
    var latitude: Double
    var longitude: Double
    
    // 实时统计
    var totalWorkers: Int
    var checkedIn: Int
    var stillWorking: Int
    var averageCheckOutTime: String?
    
    // 热门地点
    var hotSpots: [HotSpot]?
    
    var checkInRate: Double {
        guard totalWorkers > 0 else { return 0 }
        return Double(checkedIn) / Double(totalWorkers)
    }
}

// MARK: - 热门地点/公司（同城细节用）
struct HotSpot: Codable, Identifiable {
    var id: String = UUID().uuidString
    var name: String                    // 地点名称（如：望京SOHO、后厂村）
    var type: SpotType                  // 类型
    var latitude: Double
    var longitude: Double
    var city: String
    var district: String
    
    // 统计
    var totalWorkers: Int
    var checkedIn: Int
    var stillWorking: Int
    var averageCheckOutTime: String?
    
    // 热度标签
    var tags: [String]?                 // 如：["互联网重灾区", "996圣地"]
    
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
    
    var checkInRate: Double {
        guard totalWorkers > 0 else { return 0 }
        return Double(checkedIn) / Double(totalWorkers)
    }
}

// MARK: - 抱怨数据（通用）
struct ComplaintData: Codable, Identifiable {
    var id: String = UUID().uuidString
    var userId: String
    var userNickname: String?
    var userEmoji: String = "🐂"
    
    // 内容类型：text 或 voice
    var contentType: ContentType = .text
    
    // 文本内容（文本类型时使用）
    var content: String?
    
    // 语音内容（语音类型时使用）
    var voiceUrl: String?               // 语音文件 URL
    var voiceDuration: Int = 0          // 语音时长（秒）
    
    // 便捷属性
    var isVoice: Bool { contentType == .voice }
    
    // AI 生成标记
    var isAiGenerated: Bool = false
    
    // 位置
    var latitude: Double
    var longitude: Double
    var city: String?
    var district: String?
    var spotName: String?               // 具体地点名称
    
    // 元数据
    var createdAt: Date = Date()
    var category: Category = .general
    var likes: Int = 0
    var comments: Int = 0
    
    // AI回复
    var aiResponse: String?
    
    // 内容类型枚举
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

// MARK: - 评论数据
struct CommentData: Codable, Identifiable {
    var id: String = UUID().uuidString
    var userId: String
    var complaintId: String
    var parentId: String?               // 回复某条评论
    
    var contentType: ComplaintData.ContentType = .text
    var content: String?
    var voiceUrl: String?
    var voiceDuration: Int = 0
    
    var userNickname: String?
    var userEmoji: String = "🐂"
    
    var likes: Int = 0
    var isAiGenerated: Bool = false
    
    var createdAt: Date = Date()
}

// MARK: - 地图数据源协议（方便后续替换真实数据）
protocol MapDataProvider {
    // 全国数据
    func fetchAllCities() async throws -> [CityData]
    func fetchCityDetail(city: String) async throws -> CityData?
    
    // 同城数据
    func fetchDistricts(city: String) async throws -> [DistrictData]
    func fetchHotSpots(city: String, district: String?) async throws -> [HotSpot]
    
    // 抱怨数据
    func fetchComplaints(city: String?, district: String?, limit: Int) async throws -> [ComplaintData]
    func fetchNearbyComplaints(latitude: Double, longitude: Double, radiusKm: Double) async throws -> [ComplaintData]
}

// MARK: - Mock 数据提供者
class MockMapDataProvider: MapDataProvider {
    static let shared = MockMapDataProvider()
    
    // 缓存
    private var cachedCities: [CityData]?
    private var cachedDistricts: [String: [DistrictData]] = [:]
    private var cachedHotSpots: [String: [HotSpot]] = [:]
    private var cachedComplaints: [ComplaintData]?
    
    // MARK: - 城市数据
    func fetchAllCities() async throws -> [CityData] {
        if let cached = cachedCities { return cached }
        
        let cities = Self.generateCityData()
        cachedCities = cities
        return cities
    }
    
    func fetchCityDetail(city: String) async throws -> CityData? {
        let cities = try await fetchAllCities()
        return cities.first { $0.city == city }
    }
    
    // MARK: - 区级数据
    func fetchDistricts(city: String) async throws -> [DistrictData] {
        if let cached = cachedDistricts[city] { return cached }
        
        let districts = Self.generateDistrictData(for: city)
        cachedDistricts[city] = districts
        return districts
    }
    
    // MARK: - 热门地点
    func fetchHotSpots(city: String, district: String?) async throws -> [HotSpot] {
        let key = "\(city)-\(district ?? "all")"
        if let cached = cachedHotSpots[key] { return cached }
        
        let spots = Self.generateHotSpots(city: city, district: district)
        cachedHotSpots[key] = spots
        return spots
    }
    
    // MARK: - 抱怨数据
    func fetchComplaints(city: String?, district: String?, limit: Int) async throws -> [ComplaintData] {
        if cachedComplaints == nil {
            cachedComplaints = Self.generateComplaints()
        }
        
        var result = cachedComplaints!
        
        if let city = city {
            result = result.filter { $0.city == city }
        }
        if let district = district {
            result = result.filter { $0.district == district }
        }
        
        return Array(result.prefix(limit))
    }
    
    func fetchNearbyComplaints(latitude: Double, longitude: Double, radiusKm: Double) async throws -> [ComplaintData] {
        if cachedComplaints == nil {
            cachedComplaints = Self.generateComplaints()
        }
        
        let userLocation = CLLocation(latitude: latitude, longitude: longitude)
        
        return cachedComplaints!.filter { complaint in
            let complaintLocation = CLLocation(latitude: complaint.latitude, longitude: complaint.longitude)
            let distance = userLocation.distance(from: complaintLocation) / 1000 // 转换为公里
            return distance <= radiusKm
        }
    }
    
    // MARK: - 刷新数据（模拟实时更新）
    func refreshData() {
        cachedCities = nil
        cachedDistricts.removeAll()
        cachedHotSpots.removeAll()
        cachedComplaints = nil
    }
}

// MARK: - Mock 数据生成
extension MockMapDataProvider {
    
    // 城市配置（公开访问）
    public static let cityConfigs: [(name: String, province: String, lat: Double, lon: Double, tier: Int)] = [
        // 一线
        ("北京", "北京", 39.9042, 116.4074, 1),
        ("上海", "上海", 31.2304, 121.4737, 1),
        ("深圳", "广东", 22.5431, 114.0579, 1),
        ("广州", "广东", 23.1291, 113.2644, 1),
        // 新一线
        ("杭州", "浙江", 30.2741, 120.1551, 2),
        ("成都", "四川", 30.5728, 104.0668, 2),
        ("南京", "江苏", 32.0603, 118.7969, 2),
        ("武汉", "湖北", 30.5928, 114.3055, 2),
        ("西安", "陕西", 34.3416, 108.9398, 2),
        ("苏州", "江苏", 31.2989, 120.5853, 2),
        ("重庆", "重庆", 29.4316, 106.9123, 2),
        ("天津", "天津", 39.3434, 117.3616, 2),
        ("郑州", "河南", 34.7466, 113.6254, 2),
        ("长沙", "湖南", 28.2282, 112.9388, 2),
        // 二线
        ("青岛", "山东", 36.0671, 120.3826, 3),
        ("沈阳", "辽宁", 41.8057, 123.4315, 3),
        ("济南", "山东", 36.6512, 117.1201, 3),
        ("厦门", "福建", 24.4798, 118.0894, 3),
        ("福州", "福建", 26.0745, 119.2965, 3),
        ("合肥", "安徽", 31.8206, 117.2272, 3),
        ("大连", "辽宁", 38.9140, 121.6147, 3),
        ("昆明", "云南", 24.8801, 102.8329, 3),
        ("哈尔滨", "黑龙江", 45.8038, 126.5349, 3),
        ("长春", "吉林", 43.8171, 125.3235, 3),
        ("南昌", "江西", 28.6820, 115.8579, 3),
        ("无锡", "江苏", 31.4912, 120.3119, 3),
        ("宁波", "浙江", 29.8683, 121.5440, 3),
        ("东莞", "广东", 23.0208, 113.7518, 3),
        ("佛山", "广东", 23.0218, 113.1218, 3),
        ("贵阳", "贵州", 26.6470, 106.6302, 3)
    ]
    
    // 区级配置
    static let districtConfigs: [String: [(name: String, latOffset: Double, lonOffset: Double)]] = [
        "北京": [
            ("海淀区", 0.05, -0.1), ("朝阳区", 0.02, 0.08),
            ("西城区", -0.01, -0.02), ("东城区", -0.01, 0.02),
            ("丰台区", -0.08, -0.02), ("通州区", -0.02, 0.25),
            ("大兴区", -0.15, 0.05), ("昌平区", 0.15, 0.02),
            ("顺义区", 0.1, 0.2), ("房山区", -0.12, -0.2)
        ],
        "上海": [
            ("浦东新区", 0.02, 0.15), ("黄浦区", -0.01, -0.02),
            ("徐汇区", -0.05, -0.05), ("静安区", 0.02, -0.02),
            ("长宁区", 0.01, -0.1), ("虹口区", 0.03, 0.02),
            ("杨浦区", 0.05, 0.05), ("闵行区", -0.1, -0.08),
            ("宝山区", 0.12, 0.0), ("嘉定区", 0.12, -0.15)
        ],
        "深圳": [
            ("南山区", 0.02, -0.08), ("福田区", 0.0, 0.02),
            ("罗湖区", -0.02, 0.08), ("宝安区", 0.08, -0.15),
            ("龙岗区", 0.05, 0.2), ("龙华区", 0.1, 0.05),
            ("光明区", 0.15, -0.08), ("坪山区", 0.08, 0.25)
        ],
        "广州": [
            ("天河区", 0.02, 0.05), ("越秀区", 0.0, -0.02),
            ("海珠区", -0.03, 0.02), ("白云区", 0.1, 0.0),
            ("番禺区", -0.12, 0.05), ("黄埔区", 0.05, 0.15),
            ("荔湾区", -0.02, -0.08), ("花都区", 0.2, -0.05)
        ],
        "杭州": [
            ("西湖区", 0.0, -0.05), ("滨江区", -0.05, 0.02),
            ("余杭区", 0.1, -0.08), ("拱墅区", 0.03, -0.02),
            ("上城区", -0.02, 0.02), ("萧山区", -0.1, 0.08),
            ("临平区", 0.08, 0.1), ("钱塘区", -0.08, 0.15)
        ],
        "成都": [
            ("武侯区", -0.02, -0.02), ("锦江区", 0.0, 0.03),
            ("青羊区", 0.02, -0.05), ("金牛区", 0.05, -0.02),
            ("成华区", 0.03, 0.05), ("高新区", -0.08, 0.02),
            ("天府新区", -0.15, 0.1), ("龙泉驿区", 0.0, 0.2)
        ]
    ]
    
    // 热门地点配置
    static let hotSpotConfigs: [String: [(name: String, district: String, type: HotSpot.SpotType, tags: [String])]] = [
        "北京": [
            ("中关村", "海淀区", .techPark, ["互联网重灾区", "程序员聚集地"]),
            ("望京SOHO", "朝阳区", .office, ["创业公司扎堆", "加班重灾区"]),
            ("后厂村", "海淀区", .techPark, ["大厂云集", "996发源地"]),
            ("国贸CBD", "朝阳区", .cbd, ["金融精英", "西装革履"]),
            ("亦庄经济开发区", "大兴区", .industrial, ["制造业聚集", "通勤噩梦"]),
            ("西二旗", "海淀区", .techPark, ["码农天堂", "头发杀手"]),
            ("金融街", "西城区", .cbd, ["银行总部", "加班到头秃"]),
            ("三里屯", "朝阳区", .cbd, ["时尚圈", "下班蹦迪"])
        ],
        "上海": [
            ("陆家嘴", "浦东新区", .cbd, ["金融中心", "高薪高压"]),
            ("张江高科", "浦东新区", .techPark, ["芯片半导体", "研发重镇"]),
            ("漕河泾", "徐汇区", .techPark, ["老牌园区", "互联网公司多"]),
            ("静安寺", "静安区", .cbd, ["时尚地标", "白领聚集"]),
            ("外滩", "黄浦区", .cbd, ["金融机构", "景色最美的加班"]),
            ("虹桥商务区", "长宁区", .cbd, ["交通枢纽", "出差多"])
        ],
        "深圳": [
            ("南山科技园", "南山区", .techPark, ["腾讯总部", "大厂扎堆"]),
            ("后海", "南山区", .cbd, ["新CBD", "海景加班"]),
            ("华强北", "福田区", .industrial, ["电子一条街", "创业者天堂"]),
            ("前海", "南山区", .cbd, ["金融特区", "新贵聚集"]),
            ("坂田", "龙岗区", .techPark, ["华为基地", "狼性文化"])
        ],
        "杭州": [
            ("未来科技城", "余杭区", .techPark, ["阿里巴巴", "电商重镇"]),
            ("滨江区块", "滨江区", .techPark, ["网易、海康", "互联网新贵"]),
            ("西溪", "西湖区", .office, ["创意园区", "环境最美"]),
            ("钱江新城", "上城区", .cbd, ["新CBD", "高端写字楼"])
        ]
    ]
    
    // 生成城市数据
    static func generateCityData() -> [CityData] {
        let hour = Calendar.current.component(.hour, from: Date())
        
        return cityConfigs.map { config in
            // 根据城市等级生成人数
            let baseTotal: Int
            switch config.tier {
            case 1: baseTotal = Int.random(in: 150000...300000)
            case 2: baseTotal = Int.random(in: 50000...120000)
            default: baseTotal = Int.random(in: 20000...60000)
            }
            
            // 根据时间动态计算下班率
            let baseRate = calculateCheckInRate(hour: hour, cityTier: config.tier)
            let checked = Int(Double(baseTotal) * baseRate)
            
            // 平均下班时间
            let avgTimes: [String]
            switch config.tier {
            case 1: avgTimes = ["20:30", "21:00", "21:30", "22:00"]
            case 2: avgTimes = ["19:30", "20:00", "20:30", "21:00"]
            default: avgTimes = ["18:30", "19:00", "19:30", "20:00"]
            }
            
            return CityData(
                city: config.name,
                province: config.province,
                tier: config.tier,
                latitude: config.lat,
                longitude: config.lon,
                totalWorkers: baseTotal,
                checkedIn: checked,
                stillWorking: baseTotal - checked,
                averageCheckOutTime: avgTimes.randomElement()
            )
        }
    }
    
    // 生成区级数据
    static func generateDistrictData(for city: String) -> [DistrictData] {
        guard let cityConfig = cityConfigs.first(where: { $0.name == city }),
              let districts = districtConfigs[city] else {
            // 如果没有配置，生成默认区域
            return generateDefaultDistricts(for: city)
        }
        
        let hour = Calendar.current.component(.hour, from: Date())
        
        return districts.map { district in
            let baseTotal = Int.random(in: 5000...30000)
            let rate = calculateCheckInRate(hour: hour, cityTier: cityConfig.tier)
            let variance = Double.random(in: -0.1...0.1)
            let adjustedRate = max(0.1, min(0.95, rate + variance))
            let checked = Int(Double(baseTotal) * adjustedRate)
            
            return DistrictData(
                city: city,
                district: district.name,
                latitude: cityConfig.lat + district.latOffset,
                longitude: cityConfig.lon + district.lonOffset,
                totalWorkers: baseTotal,
                checkedIn: checked,
                stillWorking: baseTotal - checked,
                averageCheckOutTime: ["19:00", "19:30", "20:00", "20:30", "21:00"].randomElement()
            )
        }
    }
    
    // 生成默认区域（没有配置的城市）
    static func generateDefaultDistricts(for city: String) -> [DistrictData] {
        guard let cityConfig = cityConfigs.first(where: { $0.name == city }) else {
            return []
        }
        
        let defaultNames = ["市中心", "开发区", "高新区", "新城区", "老城区"]
        let hour = Calendar.current.component(.hour, from: Date())
        
        return defaultNames.enumerated().map { index, name in
            let angle = Double(index) * (2 * .pi / Double(defaultNames.count))
            let radius = 0.05
            
            let baseTotal = Int.random(in: 3000...15000)
            let rate = calculateCheckInRate(hour: hour, cityTier: cityConfig.tier)
            let checked = Int(Double(baseTotal) * rate)
            
            return DistrictData(
                city: city,
                district: name,
                latitude: cityConfig.lat + radius * cos(angle),
                longitude: cityConfig.lon + radius * sin(angle),
                totalWorkers: baseTotal,
                checkedIn: checked,
                stillWorking: baseTotal - checked,
                averageCheckOutTime: ["19:00", "19:30", "20:00"].randomElement()
            )
        }
    }
    
    // 生成热门地点
    static func generateHotSpots(city: String, district: String?) -> [HotSpot] {
        guard let spots = hotSpotConfigs[city] else { return [] }
        guard let cityConfig = cityConfigs.first(where: { $0.name == city }) else { return [] }
        
        let hour = Calendar.current.component(.hour, from: Date())
        var result = spots
        
        if let district = district {
            result = result.filter { $0.district == district }
        }
        
        return result.map { spot in
            // 找到对应区的坐标偏移
            let districtOffset = districtConfigs[city]?.first { $0.name == spot.district }
            let baseLat = cityConfig.lat + (districtOffset?.latOffset ?? 0)
            let baseLon = cityConfig.lon + (districtOffset?.lonOffset ?? 0)
            
            let baseTotal = Int.random(in: 2000...15000)
            let rate = calculateCheckInRate(hour: hour, cityTier: cityConfig.tier)
            let variance = Double.random(in: -0.15...0.15)
            let adjustedRate = max(0.1, min(0.95, rate + variance))
            let checked = Int(Double(baseTotal) * adjustedRate)
            
            return HotSpot(
                name: spot.name,
                type: spot.type,
                latitude: baseLat + Double.random(in: -0.01...0.01),
                longitude: baseLon + Double.random(in: -0.01...0.01),
                city: city,
                district: spot.district,
                totalWorkers: baseTotal,
                checkedIn: checked,
                stillWorking: baseTotal - checked,
                averageCheckOutTime: ["20:00", "20:30", "21:00", "21:30", "22:00"].randomElement(),
                tags: spot.tags
            )
        }
    }
    
    // 根据时间计算下班率
    static func calculateCheckInRate(hour: Int, cityTier: Int) -> Double {
        // 一线城市下班更晚
        let tierAdjust: Double
        switch cityTier {
        case 1: tierAdjust = -0.1  // 一线城市下班率更低
        case 2: tierAdjust = -0.05
        default: tierAdjust = 0
        }
        
        let baseRate: Double
        switch hour {
        case 0..<9: baseRate = 0.05
        case 9..<17: baseRate = 0.1
        case 17: baseRate = 0.2
        case 18: baseRate = 0.4
        case 19: baseRate = 0.55
        case 20: baseRate = 0.7
        case 21: baseRate = 0.8
        case 22: baseRate = 0.88
        case 23: baseRate = 0.92
        default: baseRate = 0.95
        }
        
        return max(0.05, min(0.95, baseRate + tierAdjust + Double.random(in: -0.05...0.05)))
    }
    
    // 生成抱怨数据
    static func generateComplaints() -> [ComplaintData] {
        var complaints: [ComplaintData] = []
        
        // 文字抱怨
        for text in complaintTexts {
            let city = cityConfigs.randomElement()!
            let district = districtConfigs[city.name]?.randomElement()
            
            complaints.append(ComplaintData(
                userId: UUID().uuidString,
                userNickname: randomNickname(),
                userEmoji: randomEmoji(),
                contentType: .text,
                content: text.0,
                latitude: city.lat + Double.random(in: -0.1...0.1),
                longitude: city.lon + Double.random(in: -0.1...0.1),
                city: city.name,
                district: district?.name,
                createdAt: Date().addingTimeInterval(-Double.random(in: 0...14400)),
                category: ComplaintData.Category(rawValue: text.1) ?? .general,
                likes: Int.random(in: 10...5000),
                comments: Int.random(in: 0...500)
            ))
        }
        
        // 语音抱怨（不需要内容，只有语音）
        for voice in voiceComplaintTexts {
            let city = cityConfigs.randomElement()!
            let district = districtConfigs[city.name]?.randomElement()
            
            complaints.append(ComplaintData(
                userId: UUID().uuidString,
                userNickname: randomNickname(),
                userEmoji: randomEmoji(),
                contentType: .voice,
                content: nil, // 语音消息不需要文本内容
                voiceUrl: "https://storage.example.com/voice/\(UUID().uuidString).m4a", // Mock URL
                voiceDuration: voice.2,
                latitude: city.lat + Double.random(in: -0.1...0.1),
                longitude: city.lon + Double.random(in: -0.1...0.1),
                city: city.name,
                district: district?.name,
                createdAt: Date().addingTimeInterval(-Double.random(in: 0...7200)),
                category: ComplaintData.Category(rawValue: voice.1) ?? .general,
                likes: Int.random(in: 50...8000),
                comments: Int.random(in: 10...800)
            ))
        }
        
        return complaints.shuffled()
    }
    
    // 抱怨文案库
    static let complaintTexts: [(String, String)] = [
        // 加班
        ("领导说开个快会，结果开了3个小时，我人都麻了", "加班"),
        ("加班到10点，加班费一分没有，爱谁谁吧", "加班"),
        ("周五晚上10点来需求，周一早上要，这是人能干的事？", "加班"),
        ("通勤2小时，上班8小时，加班4小时，睡觉6小时", "加班"),
        ("又是凌晨12点下班的一天，出租车司机都认识我了", "加班"),
        ("连续加班两周，周末还要加班，我是不是应该住公司", "加班"),
        ("说好的弹性工作制，结果只弹不缩，永远加班", "加班"),
        ("今天又是最后一个走的，保安都跟我混熟了", "加班"),
        ("加班加到女朋友跟我分手了", "加班"),
        ("凌晨两点还在改bug，明天还要8点开会", "加班"),
        ("国庆七天，加班五天，我是公司的牛马", "加班"),
        ("加班到现在，外卖都不送了，只能吃泡面", "加班"),
        
        // 领导
        ("老板画的饼我都能开面包店了", "领导"),
        ("领导开会只会说'大家要努力'，你倒是给我涨工资啊", "领导"),
        ("领导说年底双薪，现在说资金紧张", "领导"),
        ("领导永远都是对的，错的都是我们", "领导"),
        ("领导邮件回复只有一个字：知", "领导"),
        ("我们领导最大的本事就是把功劳据为己有", "领导"),
        ("领导说要给我升职，结果只升了title，工资不变", "领导"),
        ("老板说公司是大家的家，那我能带狗来上班吗", "领导"),
        ("领导的'我觉得'比甲方的'我觉得'还可怕", "领导"),
        ("领导说年轻人要多锻炼，所以天天加班锻炼我", "领导"),
        
        // 同事
        ("同事把锅甩给我，我真是服了这帮孙子", "同事"),
        ("旁边同事每天吃螺蛳粉，我快窒息了", "同事"),
        ("同事又在群里发正能量文章了，麻烦闭嘴", "同事"),
        ("同事总是抢我的活干，然后汇报说是他做的", "同事"),
        ("新来的同事工资比我高，我干了三年了", "同事"),
        ("同事每天准点下班，活全是我干的", "同事"),
        ("同事偷吃了我的零食，还不承认", "同事"),
        
        // 工资
        ("工资拖了半个月还没发，要饿死了", "工资"),
        ("试用期6个月，说好的转正又延了", "工资"),
        ("说好的涨薪，结果涨了200块，打发叫花子呢", "工资"),
        ("年终奖发了500块购物卡，还只能在公司食堂用", "工资"),
        ("招聘写的15-25k，进来才知道是15k", "工资"),
        ("公司说今年效益不好，可老板换了辆新车", "工资"),
        ("涨薪跑不赢通胀，越干越穷", "工资"),
        
        // 开会
        ("早上9点开会开到下午6点，啥活没干", "开会"),
        ("每天开会开会开会，工作都是加班干的", "开会"),
        ("会议纪要写了30页，没有一条执行的", "开会"),
        ("开会讨论怎么提高效率，开了一天", "开会"),
        ("一天7个会，上厕所都没时间", "开会"),
        
        // 其他
        ("需求又改了，产品经理脑子是不是有坑", "其他"),
        ("产品说这个需求很简单，就改一下，改了三天", "其他"),
        ("测试提的bug比我写的代码还多", "其他"),
        ("公司空调永远26度，冬天冷死夏天热死", "其他"),
        ("食堂今天又是那几个菜，我都能背出菜单了", "其他"),
        ("WiFi又断了，年费几十万的网络就这？", "其他"),
        ("打印机又坏了，IT说明天修，已经明天一个月了", "其他")
    ]
    
    // 语音抱怨库
    static let voiceComplaintTexts: [(String, String, Int)] = [
        ("啊我真的要疯了今天领导让我改了十遍方案十遍啊", "领导", 12),
        ("刚刚开完会三个小时啊三个小时什么都没讨论出来", "开会", 8),
        ("加班到现在饭都没吃你能信吗外卖也不送了", "加班", 7),
        ("同事又甩锅给我了我真是服了这是第几次了", "同事", 5),
        ("工资到现在还没发我房租都交不起了", "工资", 6),
        ("今天需求又改了改了三遍了产品经理脑子有问题", "其他", 8),
        ("哎我不想说话了太累了真的太累了", "加班", 4),
        ("这破公司我真的待不下去了天天加班工资又低", "加班", 6),
        ("领导又画饼了说年底升职加薪我都听了三年了", "领导", 7),
        ("凌晨了还在公司你敢信吗我都快猝死了", "加班", 5),
        ("唉今天心态崩了什么都不想干了", "其他", 3),
        ("被客户骂了一顿真的委屈想哭", "其他", 4),
        ("今天又被领导点名批评了我做错什么了", "领导", 6),
        ("周末加班还要调休调休永远用不了", "加班", 5),
        ("绩效又是B我都不知道怎么才能拿A", "工资", 5)
    ]
    
    static func randomNickname() -> String {
        [
            "匿名牛马", "加班狗", "社畜一号", "韭菜本菜", "打工人",
            "苦逼程序员", "PPT战士", "Excel大师", "会议室常客", "卑微打工仔",
            "摸鱼专家", "带薪拉屎", "划水达人", "职场老油条", "牛马本马",
            "搬砖侠", "码农日记", "社畜日常", "打工魂", "底层员工",
            "没有周末", "猝死预备", "在线崩溃", "精神离职", "干饭人"
        ].randomElement()!
    }
    
    static func randomEmoji() -> String {
        ["🐂", "🐴", "🐕", "🐷", "🦊", "🐱", "🐰", "🐻", "🐼", "🦁",
         "🐯", "🐸", "🐔", "🐧", "🦆", "🦉", "🐺", "🐵", "🙈", "🐶"].randomElement()!
    }
}
