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
    static let majorCities: [(name: String, lat: Double, lon: Double)] = [
        ("北京", 39.9042, 116.4074),
        ("上海", 31.2304, 121.4737),
        ("深圳", 22.5431, 114.0579),
        ("广州", 23.1291, 113.2644),
        ("杭州", 30.2741, 120.1551),
        ("成都", 30.5728, 104.0668),
        ("南京", 32.0603, 118.7969),
        ("武汉", 30.5928, 114.3055),
        ("西安", 34.3416, 108.9398),
        ("苏州", 31.2989, 120.5853),
        ("重庆", 29.4316, 106.9123),
        ("天津", 39.3434, 117.3616),
        ("郑州", 34.7466, 113.6254),
        ("长沙", 28.2282, 112.9388),
        ("青岛", 36.0671, 120.3826),
        ("沈阳", 41.8057, 123.4315),
        ("济南", 36.6512, 117.1201),
        ("厦门", 24.4798, 118.0894),
        ("福州", 26.0745, 119.2965),
        ("合肥", 31.8206, 117.2272)
    ]
    
    static func generateMockCityStats() -> [CityStats] {
        majorCities.map { city in
            let total = Int.random(in: 5000...50000)
            let checked = Int.random(in: Int(Double(total) * 0.3)...Int(Double(total) * 0.9))
            
            return CityStats(
                city: city.name,
                totalWorkers: total,
                checkedIn: checked,
                stillWorking: total - checked,
                averageCheckOutTime: ["18:30", "19:15", "20:00", "21:30", "22:00"].randomElement(),
                topComplaint: [
                    "领导又让加班了",
                    "需求改了三遍",
                    "开了一天的会",
                    "工资还没发",
                    "同事又甩锅了"
                ].randomElement(),
                latitude: city.lat,
                longitude: city.lon
            )
        }
    }
    
    static func generateMockComplaints() -> [Complaint] {
        let complaints = [
            ("领导说开个快会，结果开了3个小时", "开会"),
            ("需求又改了，产品经理脑子是不是有坑", "其他"),
            ("加班到10点，加班费一分没有", "加班"),
            ("同事把锅甩给我，我真是服了", "同事"),
            ("工资拖了半个月还没发，要饿死了", "工资"),
            ("早上9点开会开到下午6点，啥活没干", "开会"),
            ("老板画的饼我都能开面包店了", "领导"),
            ("通勤2小时，上班8小时，加班4小时，睡觉6小时，这是人过的日子？", "加班"),
            ("周五晚上10点来需求，周一早上要，杀人不犯法吗", "加班"),
            ("试用期6个月，说好的转正又延了", "工资")
        ]
        
        return complaints.enumerated().map { index, item in
            let city = majorCities.randomElement()!
            return Complaint(
                userId: UUID().uuidString,
                userNickname: ["匿名牛马", "加班狗", "社畜一号", "韭菜本菜", "打工人"].randomElement(),
                userEmoji: ["🐂", "🐴", "🐕", "🐷", "🦊"].randomElement()!,
                content: item.0,
                aiResponse: nil,
                location: Location(
                    latitude: city.lat,
                    longitude: city.lon,
                    city: city.name,
                    district: ["海淀区", "朝阳区", "浦东新区", "南山区", "西湖区"].randomElement()
                ),
                createdAt: Date().addingTimeInterval(-Double(index * 300)),
                likes: Int.random(in: 10...500),
                comments: Int.random(in: 0...50),
                category: Complaint.Category(rawValue: item.1) ?? .general
            )
        }
    }
}

