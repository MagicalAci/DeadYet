//
//  LocationService.swift
//  DeadYet - 还没死？
//

import Foundation
import CoreLocation
import MapKit

@MainActor
class LocationService: NSObject, ObservableObject {
    @Published var currentLocation: CLLocation?
    @Published var currentCity: String?
    @Published var currentDistrict: String?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var errorMessage: String?
    
    private let locationManager = CLLocationManager()
    private let geocoder = CLGeocoder()
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }
    
    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startUpdatingLocation() {
        locationManager.startUpdatingLocation()
    }
    
    func stopUpdatingLocation() {
        locationManager.stopUpdatingLocation()
    }
    
    private func reverseGeocode(_ location: CLLocation) {
        geocoder.reverseGeocodeLocation(location) { [weak self] placemarks, error in
            guard let self = self else { return }
            
            Task { @MainActor in
                if let error = error {
                    self.errorMessage = error.localizedDescription
                    return
                }
                
                if let placemark = placemarks?.first {
                    self.currentCity = placemark.locality ?? placemark.administrativeArea
                    self.currentDistrict = placemark.subLocality ?? placemark.subAdministrativeArea
                }
            }
        }
    }
}

// MARK: - CLLocationManagerDelegate
extension LocationService: CLLocationManagerDelegate {
    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        Task { @MainActor in
            self.currentLocation = location
            self.reverseGeocode(location)
        }
    }
    
    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            self.errorMessage = error.localizedDescription
        }
    }
    
    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            self.authorizationStatus = manager.authorizationStatus
            
            switch manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways:
                self.startUpdatingLocation()
            case .denied, .restricted:
                self.errorMessage = "需要位置权限才能显示你在哪个城市加班"
            default:
                break
            }
        }
    }
}

// MARK: - Mock Data for China Cities
extension LocationService {
    // 全国主要城市（更丰富）
    static let majorCities: [(name: String, lat: Double, lon: Double, tier: Int)] = [
        // 一线城市
        ("北京", 39.9042, 116.4074, 1),
        ("上海", 31.2304, 121.4737, 1),
        ("深圳", 22.5431, 114.0579, 1),
        ("广州", 23.1291, 113.2644, 1),
        // 新一线城市
        ("杭州", 30.2741, 120.1551, 2),
        ("成都", 30.5728, 104.0668, 2),
        ("南京", 32.0603, 118.7969, 2),
        ("武汉", 30.5928, 114.3055, 2),
        ("西安", 34.3416, 108.9398, 2),
        ("苏州", 31.2989, 120.5853, 2),
        ("重庆", 29.4316, 106.9123, 2),
        ("天津", 39.3434, 117.3616, 2),
        ("郑州", 34.7466, 113.6254, 2),
        ("长沙", 28.2282, 112.9388, 2),
        // 二线城市
        ("青岛", 36.0671, 120.3826, 3),
        ("沈阳", 41.8057, 123.4315, 3),
        ("济南", 36.6512, 117.1201, 3),
        ("厦门", 24.4798, 118.0894, 3),
        ("福州", 26.0745, 119.2965, 3),
        ("合肥", 31.8206, 117.2272, 3),
        ("大连", 38.9140, 121.6147, 3),
        ("昆明", 24.8801, 102.8329, 3),
        ("哈尔滨", 45.8038, 126.5349, 3),
        ("长春", 43.8171, 125.3235, 3),
        ("南昌", 28.6820, 115.8579, 3),
        ("无锡", 31.4912, 120.3119, 3),
        ("宁波", 29.8683, 121.5440, 3),
        ("东莞", 23.0208, 113.7518, 3),
        ("佛山", 23.0218, 113.1218, 3),
        ("贵阳", 26.6470, 106.6302, 3)
    ]
    
    // 各城市的区域
    static let cityDistricts: [String: [String]] = [
        "北京": ["海淀区", "朝阳区", "西城区", "东城区", "丰台区", "通州区", "大兴区", "昌平区"],
        "上海": ["浦东新区", "黄浦区", "徐汇区", "静安区", "长宁区", "虹口区", "杨浦区", "闵行区"],
        "深圳": ["南山区", "福田区", "罗湖区", "宝安区", "龙岗区", "龙华区", "光明区", "坪山区"],
        "广州": ["天河区", "越秀区", "海珠区", "白云区", "番禺区", "黄埔区", "荔湾区", "花都区"],
        "杭州": ["西湖区", "滨江区", "余杭区", "拱墅区", "上城区", "萧山区", "临平区", "钱塘区"],
        "成都": ["武侯区", "锦江区", "青羊区", "金牛区", "成华区", "高新区", "天府新区", "龙泉驿区"],
        "南京": ["玄武区", "秦淮区", "建邺区", "鼓楼区", "栖霞区", "雨花台区", "江宁区", "浦口区"],
        "武汉": ["武昌区", "江汉区", "汉阳区", "洪山区", "江岸区", "硚口区", "青山区", "东湖高新"]
    ]
    
    static func generateMockCityStats() -> [CityStats] {
        majorCities.map { city in
            // 一线城市人数更多
            let baseTotal: Int
            switch city.tier {
            case 1: baseTotal = Int.random(in: 80000...200000)
            case 2: baseTotal = Int.random(in: 30000...80000)
            default: baseTotal = Int.random(in: 10000...40000)
            }
            
            // 根据当前时间动态调整下班率
            let hour = Calendar.current.component(.hour, from: Date())
            let baseRate: Double
            switch hour {
            case 0..<9: baseRate = Double.random(in: 0.05...0.15)  // 凌晨
            case 9..<17: baseRate = Double.random(in: 0.1...0.25)  // 上班时间
            case 17..<18: baseRate = Double.random(in: 0.2...0.35) // 刚到下班
            case 18..<19: baseRate = Double.random(in: 0.35...0.55) // 正常下班
            case 19..<20: baseRate = Double.random(in: 0.5...0.7)  // 稍晚下班
            case 20..<21: baseRate = Double.random(in: 0.6...0.8)  // 加班结束
            case 21..<22: baseRate = Double.random(in: 0.75...0.9) // 晚加班结束
            default: baseRate = Double.random(in: 0.85...0.95)     // 深夜
            }
            
            let checked = Int(Double(baseTotal) * baseRate)
            
            // 平均下班时间：一线城市更晚
            let avgTimes: [String]
            switch city.tier {
            case 1: avgTimes = ["20:15", "20:45", "21:00", "21:30", "22:00"]
            case 2: avgTimes = ["19:30", "20:00", "20:30", "21:00", "21:30"]
            default: avgTimes = ["18:30", "19:00", "19:30", "20:00", "20:30"]
            }
            
            return CityStats(
                city: city.name,
                totalWorkers: baseTotal,
                checkedIn: checked,
                stillWorking: baseTotal - checked,
                averageCheckOutTime: avgTimes.randomElement(),
                topComplaint: [
                    "领导又让加班了", "需求改了三遍", "开了一天的会",
                    "工资还没发", "同事又甩锅了", "产品又改需求",
                    "代码又要重构", "服务器又崩了", "客户又投诉了"
                ].randomElement(),
                latitude: city.lat,
                longitude: city.lon
            )
        }
    }
    
    static func generateMockComplaints() -> [Complaint] {
        // 更丰富的抱怨内容
        let complaintContents: [(String, String)] = [
            // 加班类
            ("领导说开个快会，结果开了3个小时，我人都麻了", "加班"),
            ("加班到10点，加班费一分没有，爱谁谁吧", "加班"),
            ("周五晚上10点来需求，周一早上要，这是人能干的事？", "加班"),
            ("通勤2小时，上班8小时，加班4小时，睡觉6小时，这是人过的日子？", "加班"),
            ("又是凌晨12点下班的一天，出租车司机都认识我了", "加班"),
            ("连续加班两周，周末还要加班，我是不是应该住公司？", "加班"),
            ("说好的弹性工作制，结果只弹不缩，永远加班", "加班"),
            ("老板说项目紧急要加班，项目都紧急三年了", "加班"),
            
            // 领导类
            ("老板画的饼我都能开面包店了", "领导"),
            ("领导开会只会说'大家要努力'，你倒是努努力给我涨工资啊", "领导"),
            ("领导说年底双薪，现在说资金紧张，我信了他的邪", "领导"),
            ("领导永远都是对的，错的都是我们", "领导"),
            ("领导邮件回复只有一个字：知", "领导"),
            ("我们领导最大的本事就是把功劳据为己有", "领导"),
            
            // 同事类
            ("同事把锅甩给我，我真是服了这帮孙子", "同事"),
            ("旁边同事每天吃螺蛳粉，我快窒息了", "同事"),
            ("同事又在群里发正能量文章了，麻烦闭嘴", "同事"),
            ("同事总是抢我的活干，然后汇报的时候说是他做的", "同事"),
            
            // 工资类
            ("工资拖了半个月还没发，要饿死了", "工资"),
            ("试用期6个月，说好的转正又延了，画大饼专业户", "工资"),
            ("说好的涨薪，结果涨了200块，打发叫花子呢？", "工资"),
            ("年终奖发了500块购物卡，还只能在公司食堂用", "工资"),
            ("五险一金按最低标准交，工资条一堆扣款看不懂", "工资"),
            
            // 开会类
            ("早上9点开会开到下午6点，啥活没干", "开会"),
            ("每天开会开会开会，工作都是加班干的", "开会"),
            ("会议纪要写了30页，没有一条执行的", "开会"),
            ("开会讨论怎么提高效率，开了一天", "开会"),
            
            // 产品/需求类
            ("需求又改了，产品经理脑子是不是有坑", "其他"),
            ("产品说这个需求很简单，就改一下，改了三天", "其他"),
            ("UI给的设计图手机上根本放不下，设计师用的2米大屏？", "其他"),
            ("测试提的bug比我写的代码还多", "其他"),
            ("上线前一小时说要改需求，我直接原地升天", "其他"),
            
            // 其他类
            ("公司空调永远26度，冬天冷死夏天热死", "其他"),
            ("电梯等了20分钟，直接爬20层算了", "其他"),
            ("食堂今天又是那几个菜，我都能背出菜单了", "其他"),
            ("公司厕所永远在打扫，憋死我算了", "其他"),
            ("打印机又坏了，IT说明天修，已经明天了一个月", "其他")
        ]
        
        return complaintContents.enumerated().map { index, item in
            let city = majorCities.randomElement()!
            let districts = cityDistricts[city.name] ?? ["市中心"]
            
            return Complaint(
                userId: UUID().uuidString,
                userNickname: [
                    "匿名牛马", "加班狗", "社畜一号", "韭菜本菜", "打工人",
                    "苦逼程序员", "PPT战士", "Excel大师", "会议室常客", "卑微打工仔",
                    "摸鱼专家", "带薪拉屎", "工资小偷", "划水达人", "职场老油条"
                ].randomElement(),
                userEmoji: ["🐂", "🐴", "🐕", "🐷", "🦊", "🐱", "🐰", "🐻", "🐼", "🦁", "🐯", "🐸"].randomElement()!,
                content: item.0,
                aiResponse: nil,
                location: Location(
                    latitude: city.lat + Double.random(in: -0.05...0.05),
                    longitude: city.lon + Double.random(in: -0.05...0.05),
                    city: city.name,
                    district: districts.randomElement()
                ),
                createdAt: Date().addingTimeInterval(-Double.random(in: 0...7200)), // 2小时内
                likes: Int.random(in: 10...2000),
                comments: Int.random(in: 0...200),
                category: Complaint.Category(rawValue: item.1) ?? .general
            )
        }.shuffled() // 打乱顺序
    }
}

