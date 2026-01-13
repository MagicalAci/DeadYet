//
//  LocationService.swift
//  DeadYet - 还没死？
//
//  真实GPS定位服务

import Foundation
import CoreLocation
import MapKit

@MainActor
class LocationService: NSObject, ObservableObject {
    // MARK: - Published Properties
    @Published var currentLocation: CLLocation?
    @Published var currentCity: String?
    @Published var currentDistrict: String?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var isLocating: Bool = false
    @Published var locationError: LocationError?
    @Published var hasReceivedFirstLocation: Bool = false
    
    // MARK: - Private Properties
    private let locationManager = CLLocationManager()
    private let geocoder = CLGeocoder()
    private var isRequestingPermission = false
    
    // 定位错误类型
    enum LocationError: Error, Equatable {
        case permissionDenied
        case permissionRestricted
        case locationUnknown
        case networkError
        case geocodingFailed
        case notInChina
        
        var message: String {
            switch self {
            case .permissionDenied: return "请在设置中开启位置权限"
            case .permissionRestricted: return "位置权限受限"
            case .locationUnknown: return "无法获取位置"
            case .networkError: return "网络错误"
            case .geocodingFailed: return "无法解析地址"
            case .notInChina: return "当前位置不在服务范围内"
            }
        }
    }
    
    // MARK: - Init
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 100 // 100米更新一次
        
        // 初始化时检查当前授权状态
        authorizationStatus = locationManager.authorizationStatus
    }
    
    // MARK: - Public Methods
    
    /// 请求定位权限
    func requestPermission() {
        guard !isRequestingPermission else { return }
        isRequestingPermission = true
        
        switch authorizationStatus {
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
        case .denied, .restricted:
            locationError = authorizationStatus == .denied ? .permissionDenied : .permissionRestricted
        case .authorizedWhenInUse, .authorizedAlways:
            startUpdatingLocation()
        @unknown default:
            break
        }
        
        isRequestingPermission = false
    }
    
    /// 开始定位
    func startUpdatingLocation() {
        guard authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways else {
            requestPermission()
            return
        }
        
        isLocating = true
        locationError = nil
        locationManager.startUpdatingLocation()
        
        // 5秒超时
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { [weak self] in
            guard let self = self, self.isLocating, self.currentLocation == nil else { return }
            self.isLocating = false
            self.locationError = .locationUnknown
        }
    }
    
    /// 停止定位
    func stopUpdatingLocation() {
        locationManager.stopUpdatingLocation()
        isLocating = false
    }
    
    /// 请求一次定位
    func requestSingleLocation() {
        guard authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways else {
            requestPermission()
            return
        }
        
        isLocating = true
        locationError = nil
        locationManager.requestLocation()
    }
    
    /// 检查坐标是否在中国境内
    func isCoordinateInChina(_ coordinate: CLLocationCoordinate2D) -> Bool {
        // 中国大致经纬度范围（包含港澳台）
        let latRange = 18.0...54.0
        let lonRange = 73.0...135.0
        return latRange.contains(coordinate.latitude) && lonRange.contains(coordinate.longitude)
    }
    
    /// 根据坐标查找最近的城市
    func findNearestCity(to coordinate: CLLocationCoordinate2D) -> (name: String, lat: Double, lon: Double)? {
        // 如果不在中国境内，直接返回默认城市（北京）
        if !isCoordinateInChina(coordinate) {
            print("📍 不在中国境内，使用默认城市：北京")
            return ("北京", 39.9042, 116.4074)
        }
        
        let userLocation = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        
        var nearestCity: (name: String, lat: Double, lon: Double)?
        var minDistance: CLLocationDistance = .infinity
        
        for city in Self.majorCities {
            let cityLocation = CLLocation(latitude: city.lat, longitude: city.lon)
            let distance = userLocation.distance(from: cityLocation)
            if distance < minDistance {
                minDistance = distance
                nearestCity = (city.name, city.lat, city.lon)
            }
        }
        
        return nearestCity
    }
    
    // MARK: - Private Methods
    
    private func reverseGeocode(_ location: CLLocation) {
        geocoder.cancelGeocode() // 取消之前的请求
        
        geocoder.reverseGeocodeLocation(location, preferredLocale: Locale(identifier: "zh_CN")) { [weak self] placemarks, error in
            guard let self = self else { return }
            
            Task { @MainActor in
                if let error = error {
                    print("反向地理编码失败: \(error.localizedDescription)")
                    // 即使编码失败，也尝试用最近城市
                    if let nearest = self.findNearestCity(to: location.coordinate) {
                        self.currentCity = nearest.name
                    }
                    return
                }
                
                if let placemark = placemarks?.first {
                    // 优先使用 locality，其次是 administrativeArea
                    let city = placemark.locality ?? placemark.administrativeArea
                    let district = placemark.subLocality ?? placemark.subAdministrativeArea
                    
                    // 处理直辖市（北京、上海、天津、重庆）
                    if let city = city {
                        self.currentCity = self.normalizeCityName(city)
                    } else if let area = placemark.administrativeArea {
                        self.currentCity = self.normalizeCityName(area)
                    }
                    
                    self.currentDistrict = district
                    
                    print("📍 定位成功: \(self.currentCity ?? "未知") - \(self.currentDistrict ?? "未知")")
                }
            }
        }
    }
    
    /// 规范化城市名称（去掉"市"、"省"等后缀）
    private func normalizeCityName(_ name: String) -> String {
        var normalized = name
        let suffixes = ["市", "省", "自治区", "特别行政区"]
        for suffix in suffixes {
            if normalized.hasSuffix(suffix) {
                normalized = String(normalized.dropLast(suffix.count))
                break
            }
        }
        return normalized
    }
}

// MARK: - CLLocationManagerDelegate
extension LocationService: CLLocationManagerDelegate {
    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        // 过滤无效位置
        guard location.horizontalAccuracy >= 0,
              location.horizontalAccuracy < 1000 else { return }
        
        Task { @MainActor in
            let oldLocation = self.currentLocation
            self.currentLocation = location
            self.isLocating = false
            
            if !self.hasReceivedFirstLocation {
                self.hasReceivedFirstLocation = true
            }
            
            // 检查是否在中国
            if !self.isCoordinateInChina(location.coordinate) {
                self.locationError = .notInChina
                // 使用最近的城市
                if let nearest = self.findNearestCity(to: location.coordinate) {
                    self.currentCity = nearest.name
                    print("📍 不在中国境内，使用最近城市: \(nearest.name)")
                }
                return
            }
            
            // 如果位置变化超过500米，重新进行地理编码
            if oldLocation == nil || (oldLocation?.distance(from: location) ?? 0) > 500 {
                self.reverseGeocode(location)
            }
        }
    }
    
    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            self.isLocating = false
            
            if let clError = error as? CLError {
                switch clError.code {
                case .denied:
                    self.locationError = .permissionDenied
                case .network:
                    self.locationError = .networkError
                case .locationUnknown:
                    self.locationError = .locationUnknown
                default:
                    self.locationError = .locationUnknown
                }
            } else {
                self.locationError = .locationUnknown
            }
            
            print("❌ 定位失败: \(error.localizedDescription)")
        }
    }
    
    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            let oldStatus = self.authorizationStatus
            self.authorizationStatus = manager.authorizationStatus
            
            print("📍 定位权限变化: \(oldStatus.rawValue) -> \(manager.authorizationStatus.rawValue)")
            
            switch manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways:
                // 授权后自动开始定位
                self.locationError = nil
                self.startUpdatingLocation()
                
            case .denied:
                self.locationError = .permissionDenied
                self.isLocating = false
                
            case .restricted:
                self.locationError = .permissionRestricted
                self.isLocating = false
                
            case .notDetermined:
                break
                
            @unknown default:
                break
            }
        }
    }
}

// MARK: - Static Data
extension LocationService {
    // 全国主要城市
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
}
