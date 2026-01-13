//
//  MockData.swift
//  DeadYet - 还没死？
//
//  Mock 数据生成器
//

import Foundation

// MARK: - ==================== Mock 地图数据 ====================

enum MockMapData {
    
    static let cityConfigs: [(name: String, province: String, lat: Double, lon: Double, tier: Int)] = [
        ("北京", "北京", 39.9042, 116.4074, 1),
        ("上海", "上海", 31.2304, 121.4737, 1),
        ("深圳", "广东", 22.5431, 114.0579, 1),
        ("广州", "广东", 23.1291, 113.2644, 1),
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
    
    static let districtConfigs: [String: [(name: String, latOffset: Double, lonOffset: Double)]] = [
        "北京": [
            ("海淀区", 0.05, -0.1), ("朝阳区", 0.02, 0.08),
            ("西城区", -0.01, -0.02), ("东城区", -0.01, 0.02),
            ("丰台区", -0.08, -0.02), ("通州区", -0.02, 0.25),
            ("大兴区", -0.15, 0.05), ("昌平区", 0.15, 0.02)
        ],
        "上海": [
            ("浦东新区", 0.02, 0.15), ("黄浦区", -0.01, -0.02),
            ("徐汇区", -0.05, -0.05), ("静安区", 0.02, -0.02),
            ("长宁区", 0.01, -0.1), ("虹口区", 0.03, 0.02),
            ("杨浦区", 0.05, 0.05), ("闵行区", -0.1, -0.08)
        ],
        "深圳": [
            ("南山区", 0.02, -0.08), ("福田区", 0.0, 0.02),
            ("罗湖区", -0.02, 0.08), ("宝安区", 0.08, -0.15),
            ("龙岗区", 0.05, 0.2), ("龙华区", 0.1, 0.05)
        ],
        "广州": [
            ("天河区", 0.02, 0.05), ("越秀区", 0.0, -0.02),
            ("海珠区", -0.03, 0.02), ("白云区", 0.1, 0.0),
            ("番禺区", -0.12, 0.05), ("黄埔区", 0.05, 0.15)
        ],
        "杭州": [
            ("西湖区", 0.0, -0.05), ("滨江区", -0.05, 0.02),
            ("余杭区", 0.1, -0.08), ("拱墅区", 0.03, -0.02),
            ("上城区", -0.02, 0.02), ("萧山区", -0.1, 0.08)
        ],
        "成都": [
            ("武侯区", -0.02, -0.02), ("锦江区", 0.0, 0.03),
            ("青羊区", 0.02, -0.05), ("金牛区", 0.05, -0.02),
            ("成华区", 0.03, 0.05), ("高新区", -0.08, 0.02)
        ]
    ]
    
    static let hotSpotConfigs: [String: [(name: String, district: String, type: HotSpot.SpotType, tags: [String])]] = [
        "北京": [
            ("中关村", "海淀区", .techPark, ["互联网重灾区", "程序员聚集地"]),
            ("望京SOHO", "朝阳区", .office, ["创业公司扎堆", "加班重灾区"]),
            ("后厂村", "海淀区", .techPark, ["大厂云集", "996发源地"]),
            ("国贸CBD", "朝阳区", .cbd, ["金融精英", "西装革履"]),
            ("西二旗", "海淀区", .techPark, ["码农天堂", "头发杀手"]),
            ("金融街", "西城区", .cbd, ["银行总部", "加班到头秃"])
        ],
        "上海": [
            ("陆家嘴", "浦东新区", .cbd, ["金融中心", "高薪高压"]),
            ("张江高科", "浦东新区", .techPark, ["芯片半导体", "研发重镇"]),
            ("漕河泾", "徐汇区", .techPark, ["老牌园区", "互联网公司多"]),
            ("静安寺", "静安区", .cbd, ["时尚地标", "白领聚集"])
        ],
        "深圳": [
            ("南山科技园", "南山区", .techPark, ["腾讯总部", "大厂扎堆"]),
            ("后海", "南山区", .cbd, ["新CBD", "海景加班"]),
            ("华强北", "福田区", .industrial, ["电子一条街", "创业者天堂"]),
            ("坂田", "龙岗区", .techPark, ["华为基地", "狼性文化"])
        ],
        "杭州": [
            ("未来科技城", "余杭区", .techPark, ["阿里巴巴", "电商重镇"]),
            ("滨江区块", "滨江区", .techPark, ["网易、海康", "互联网新贵"]),
            ("西溪", "西湖区", .office, ["创意园区", "环境最美"])
        ]
    ]
    
    static func calculateCheckInRate(hour: Int, cityTier: Int) -> Double {
        let tierAdjust = cityTier == 1 ? -0.1 : cityTier == 2 ? -0.05 : 0.0
        
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
    
    static func generateCities() -> [City] {
        let hour = Calendar.current.component(.hour, from: Date())
        
        return cityConfigs.map { config in
            let rate = calculateCheckInRate(hour: hour, cityTier: config.tier)
            let baseTotal = config.tier == 1 ? 200000 : config.tier == 2 ? 80000 : 40000
            let total = baseTotal + Int.random(in: 0..<baseTotal/2)
            let checkedIn = Int(Double(total) * rate)
            
            let avgTimes = config.tier == 1 ? ["20:30", "21:00", "21:30"] :
                           config.tier == 2 ? ["19:30", "20:00", "20:30"] :
                           ["18:30", "19:00", "19:30"]
            
            return City(
                name: config.name,
                province: config.province,
                tier: config.tier,
                latitude: config.lat,
                longitude: config.lon,
                totalWorkers: total,
                checkedIn: checkedIn,
                stillWorking: total - checkedIn,
                averageCheckOutTime: avgTimes.randomElement()
            )
        }
    }
    
    static func generateDistricts(for cityName: String) -> [District] {
        guard let cityConfig = cityConfigs.first(where: { $0.name == cityName }),
              let districts = districtConfigs[cityName] else {
            return generateDefaultDistricts(for: cityName)
        }
        
        let hour = Calendar.current.component(.hour, from: Date())
        
        return districts.map { d in
            let total = Int.random(in: 5000...30000)
            let rate = calculateCheckInRate(hour: hour, cityTier: cityConfig.tier)
            let variance = Double.random(in: -0.1...0.1)
            let adjustedRate = max(0.1, min(0.95, rate + variance))
            let checkedIn = Int(Double(total) * adjustedRate)
            
            return District(
                city: cityName,
                name: d.name,
                latitude: cityConfig.lat + d.latOffset,
                longitude: cityConfig.lon + d.lonOffset,
                totalWorkers: total,
                checkedIn: checkedIn,
                stillWorking: total - checkedIn
            )
        }
    }
    
    static func generateDefaultDistricts(for cityName: String) -> [District] {
        guard let cityConfig = cityConfigs.first(where: { $0.name == cityName }) else {
            return []
        }
        
        let names = ["市中心", "开发区", "高新区", "新城区", "老城区"]
        let hour = Calendar.current.component(.hour, from: Date())
        
        return names.enumerated().map { index, name in
            let angle = Double(index) * (2 * .pi / Double(names.count))
            let radius = 0.05
            
            let total = Int.random(in: 3000...15000)
            let rate = calculateCheckInRate(hour: hour, cityTier: cityConfig.tier)
            let checkedIn = Int(Double(total) * rate)
            
            return District(
                city: cityName,
                name: name,
                latitude: cityConfig.lat + radius * cos(angle),
                longitude: cityConfig.lon + radius * sin(angle),
                totalWorkers: total,
                checkedIn: checkedIn,
                stillWorking: total - checkedIn
            )
        }
    }
    
    static func generateHotSpots(city: String, district: String? = nil) -> [HotSpot] {
        guard var spots = hotSpotConfigs[city],
              let cityConfig = cityConfigs.first(where: { $0.name == city }) else {
            return []
        }
        
        if let district = district {
            spots = spots.filter { $0.district == district }
        }
        
        let hour = Calendar.current.component(.hour, from: Date())
        
        return spots.map { spot in
            let districtOffset = districtConfigs[city]?.first { $0.name == spot.district }
            let baseLat = cityConfig.lat + (districtOffset?.latOffset ?? 0)
            let baseLon = cityConfig.lon + (districtOffset?.lonOffset ?? 0)
            
            let total = Int.random(in: 2000...15000)
            let rate = calculateCheckInRate(hour: hour, cityTier: cityConfig.tier)
            let variance = Double.random(in: -0.15...0.15)
            let adjustedRate = max(0.1, min(0.95, rate + variance))
            let checkedIn = Int(Double(total) * adjustedRate)
            
            return HotSpot(
                name: spot.name,
                type: spot.type,
                latitude: baseLat + Double.random(in: -0.01...0.01),
                longitude: baseLon + Double.random(in: -0.01...0.01),
                city: city,
                district: spot.district,
                totalWorkers: total,
                checkedIn: checkedIn,
                stillWorking: total - checkedIn,
                tags: spot.tags
            )
        }
    }
}

// MARK: - ==================== Mock 抱怨数据 ====================

enum MockComplaintData {
    
    static let textComplaints: [(String, String)] = [
        ("领导说开个快会，结果开了3个小时，我人都麻了", "加班"),
        ("加班到10点，加班费一分没有，爱谁谁吧", "加班"),
        ("周五晚上10点来需求，周一早上要，这是人能干的事？", "加班"),
        ("通勤2小时，上班8小时，加班4小时，睡觉6小时", "加班"),
        ("又是凌晨12点下班的一天，出租车司机都认识我了", "加班"),
        ("连续加班两周，周末还要加班，我是不是应该住公司", "加班"),
        ("说好的弹性工作制，结果只弹不缩，永远加班", "加班"),
        ("老板画的饼我都能开面包店了", "领导"),
        ("领导开会只会说'大家要努力'，你倒是给我涨工资啊", "领导"),
        ("领导说年底双薪，现在说资金紧张", "领导"),
        ("领导永远都是对的，错的都是我们", "领导"),
        ("我们领导最大的本事就是把功劳据为己有", "领导"),
        ("同事把锅甩给我，我真是服了这帮孙子", "同事"),
        ("旁边同事每天吃螺蛳粉，我快窒息了", "同事"),
        ("新来的同事工资比我高，我干了三年了", "同事"),
        ("工资拖了半个月还没发，要饿死了", "工资"),
        ("说好的涨薪，结果涨了200块，打发叫花子呢", "工资"),
        ("招聘写的15-25k，进来才知道是15k", "工资"),
        ("早上9点开会开到下午6点，啥活没干", "开会"),
        ("每天开会开会开会，工作都是加班干的", "开会"),
        ("需求又改了，产品经理脑子是不是有坑", "其他"),
        ("产品说这个需求很简单，就改一下，改了三天", "其他"),
        ("公司空调永远26度，冬天冷死夏天热死", "其他"),
        ("WiFi又断了，年费几十万的网络就这？", "其他")
    ]
    
    static let voiceComplaints: [(String, Int)] = [
        ("领导", 12), ("开会", 8), ("加班", 7), ("同事", 5), ("工资", 6), ("加班", 5), ("其他", 3)
    ]
    
    static let nicknames = [
        "匿名牛马", "加班狗", "社畜一号", "韭菜本菜", "打工人",
        "苦逼程序员", "PPT战士", "Excel大师", "会议室常客", "卑微打工仔",
        "摸鱼专家", "带薪拉屎", "划水达人", "职场老油条", "牛马本马"
    ]
    
    static let emojis = ["🐂", "🐴", "🐕", "🐷", "🦊", "🐱", "🐰", "🐻", "🐼", "🦁"]
    
    static func generate() -> [Complaint] {
        var complaints: [Complaint] = []
        
        // 文字抱怨
        for text in textComplaints {
            let city = MockMapData.cityConfigs.randomElement()!
            let district = MockMapData.districtConfigs[city.name]?.randomElement()
            
            complaints.append(Complaint(
                userId: UUID().uuidString,
                userNickname: nicknames.randomElement()!,
                userEmoji: emojis.randomElement()!,
                contentType: .text,
                content: text.0,
                latitude: city.lat + Double.random(in: -0.1...0.1),
                longitude: city.lon + Double.random(in: -0.1...0.1),
                city: city.name,
                district: district?.name,
                category: Complaint.Category(rawValue: text.1) ?? .general,
                createdAt: Date().addingTimeInterval(-Double.random(in: 0...14400)),
                likes: Int.random(in: 10...5000),
                comments: Int.random(in: 0...500)
            ))
        }
        
        // 语音抱怨
        for voice in voiceComplaints {
            let city = MockMapData.cityConfigs.randomElement()!
            let district = MockMapData.districtConfigs[city.name]?.randomElement()
            
            complaints.append(Complaint(
                userId: UUID().uuidString,
                userNickname: nicknames.randomElement()!,
                userEmoji: emojis.randomElement()!,
                contentType: .voice,
                voiceUrl: "https://storage.example.com/voice/\(UUID().uuidString).m4a",
                voiceDuration: voice.1,
                latitude: city.lat + Double.random(in: -0.1...0.1),
                longitude: city.lon + Double.random(in: -0.1...0.1),
                city: city.name,
                district: district?.name,
                category: Complaint.Category(rawValue: voice.0) ?? .general,
                createdAt: Date().addingTimeInterval(-Double.random(in: 0...7200)),
                likes: Int.random(in: 50...8000),
                comments: Int.random(in: 10...800)
            ))
        }
        
        return complaints.shuffled()
    }
}
