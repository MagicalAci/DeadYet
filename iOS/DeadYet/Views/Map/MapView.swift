//
//  MapView.swift
//  DeadYet - 还没死？
//
//  全国牛马分布地图
//

import SwiftUI
import MapKit

struct MapView: View {
    @StateObject private var viewModel = MapViewModel()
    @StateObject private var locationService = LocationService()
    
    var body: some View {
        ZStack {
            // 地图
            mapContent
            
            // 顶部控制栏
            VStack(spacing: 0) {
                topControlBar
                Spacer()
            }
            
            // 底部面板
            VStack(spacing: 0) {
                Spacer()
                bottomPanel
            }
            
            // 加载指示器
            if viewModel.isLoading {
                loadingOverlay
            }
        }
        .onAppear {
            setupLocation()
            viewModel.loadData()
        }
        .onChange(of: locationService.currentLocation) { _, newLocation in
            if let location = newLocation {
                viewModel.updateUserLocation(location.coordinate, city: locationService.currentCity)
            }
        }
        .onChange(of: locationService.currentCity) { _, newCity in
            if let city = newCity {
                viewModel.updateCurrentCity(city)
            }
        }
        .sheet(item: $viewModel.selectedCity) { city in
            CityDetailSheet(city: city, dataProvider: viewModel.dataProvider)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
        .sheet(item: $viewModel.selectedDistrict) { district in
            DistrictDetailSheet(district: district, dataProvider: viewModel.dataProvider)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
    }
    
    // MARK: - Top Control Bar
    private var topControlBar: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                // 视图模式切换
                viewModePicker
                
                Spacer()
                
                // 统计数据
                statsDisplay
            }
            .padding(.horizontal, 16)
            
            // 同城模式 - 显示当前城市信息
            if viewModel.viewMode == .local {
                localCityInfo
            }
        }
        .padding(.top, 60)
    }
    
    private var viewModePicker: some View {
        HStack(spacing: 0) {
            ForEach(MapViewModel.ViewMode.allCases, id: \.self) { mode in
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        viewModel.switchViewMode(to: mode)
                    }
                    haptic(.light)
                } label: {
                    Text(mode.title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(viewModel.viewMode == mode ? .white : .gray)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(viewModel.viewMode == mode ? Color.deadRed : Color.clear)
                }
            }
        }
        .background(Color.black.opacity(0.7))
        .clipShape(Capsule())
        .overlay {
            Capsule().stroke(Color.white.opacity(0.1), lineWidth: 1)
        }
    }
    
    private var statsDisplay: some View {
        HStack(spacing: 14) {
            StatBadge(value: viewModel.displayStats.checkedIn, label: "已下班", color: .aliveGreen)
            StatBadge(value: viewModel.displayStats.stillWorking, label: "加班中", color: .deadRed)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.black.opacity(0.7))
        .clipShape(Capsule())
    }
    
    private var localCityInfo: some View {
        HStack(spacing: 10) {
            // 定位状态
            if viewModel.isLocating {
                ProgressView()
                    .scaleEffect(0.8)
                    .tint(.white)
                Text("定位中...")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
            } else if let city = viewModel.currentCity {
                Image(systemName: "location.fill")
                    .font(.system(size: 12))
                    .foregroundColor(.blue)
                
                Text(city)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                
                if !viewModel.districts.isEmpty {
                    Text("·")
                        .foregroundColor(.gray)
                    Text("\(viewModel.districts.count)个区域")
                        .font(.system(size: 13))
                        .foregroundColor(.gray)
                }
            } else {
                Image(systemName: "location.slash")
                    .font(.system(size: 12))
                    .foregroundColor(.orange)
                
                Text("无法获取位置")
                    .font(.system(size: 14))
                    .foregroundColor(.orange)
                
                Button("重试") {
                    setupLocation()
                }
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.blue)
            }
            
            Spacer()
            
            // 热门地点数量
            if !viewModel.hotSpots.isEmpty {
                HStack(spacing: 4) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 11))
                    Text("\(viewModel.hotSpots.count)个热门")
                }
                .font(.system(size: 12))
                .foregroundColor(.orange)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.orange.opacity(0.15))
                .clipShape(Capsule())
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.black.opacity(0.6))
        .transition(.move(edge: .top).combined(with: .opacity))
    }
    
    // MARK: - Map Content
    private var mapContent: some View {
        Map(position: $viewModel.cameraPosition, interactionModes: .all) {
            // 用户位置
            if locationService.authorizationStatus == .authorizedWhenInUse ||
               locationService.authorizationStatus == .authorizedAlways {
                UserAnnotation()
            }
            
            // 根据模式显示不同标记
            switch viewModel.viewMode {
            case .national:
                // 全国模式 - 显示城市
                ForEach(viewModel.cities) { city in
                    Annotation(city.city, coordinate: CLLocationCoordinate2D(latitude: city.latitude, longitude: city.longitude)) {
                        CityMarkerView(city: city, isCompact: true) {
                            viewModel.selectCity(city)
                        }
                    }
                }
                
            case .local:
                // 同城模式 - 显示区级 + 热门地点
                ForEach(viewModel.districts) { district in
                    Annotation(district.district, coordinate: CLLocationCoordinate2D(latitude: district.latitude, longitude: district.longitude)) {
                        DistrictMarkerView(district: district) {
                            viewModel.selectDistrict(district)
                        }
                    }
                }
                
                // 热门地点
                ForEach(viewModel.hotSpots) { spot in
                    Annotation(spot.name, coordinate: CLLocationCoordinate2D(latitude: spot.latitude, longitude: spot.longitude)) {
                        HotSpotMarkerView(spot: spot)
                    }
                }
            }
        }
        .mapStyle(.standard(elevation: .realistic, pointsOfInterest: .excludingAll))
        .mapControls {
            MapCompass().mapControlVisibility(.visible)
            MapUserLocationButton()
        }
        .ignoresSafeArea()
    }
    
    // MARK: - Bottom Panel
    private var bottomPanel: some View {
        VStack(spacing: 0) {
            // 拖拽指示器
            Capsule()
                .fill(Color.white.opacity(0.3))
                .frame(width: 40, height: 5)
                .padding(.top, 10)
                .padding(.bottom, 12)
            
            // 头部
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("📢 \(viewModel.viewMode == .local ? "同城" : "全国")抱怨墙")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(viewModel.viewMode == .local ? "看看本地牛马在骂什么" : "看看全国牛马都在骂什么")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                // 数量
                HStack(spacing: 8) {
                    HStack(spacing: 4) {
                        Circle().fill(Color.deadRed).frame(width: 6, height: 6)
                        Text("\(viewModel.complaints.count)条")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white)
                    }
                    
                    Image(systemName: viewModel.isComplaintWallExpanded ? "chevron.down" : "chevron.up")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(width: 26, height: 26)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Circle())
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
            .contentShape(Rectangle())
            .onTapGesture {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    viewModel.isComplaintWallExpanded.toggle()
                }
            }
            
            // 抱怨列表
            if viewModel.isComplaintWallExpanded {
                Divider().background(Color.white.opacity(0.1))
                
                ScrollView(.vertical, showsIndicators: false) {
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.complaints) { complaint in
                            ComplaintCardView(complaint: complaint)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                }
                .frame(height: 280)
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
        }
        .background(
            LinearGradient(
                colors: [Color(hex: "1C1C1E"), Color(hex: "2C2C2E").opacity(0.95)],
                startPoint: .bottom,
                endPoint: .top
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: -10)
        .padding(.horizontal, 12)
        .padding(.bottom, 90)
    }
    
    // MARK: - Loading Overlay
    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()
            
            VStack(spacing: 12) {
                ProgressView()
                    .scaleEffect(1.2)
                    .tint(.white)
                Text("加载中...")
                    .font(.system(size: 14))
                    .foregroundColor(.white)
            }
            .padding(24)
            .background(Color(hex: "2C2C2E"))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
    
    // MARK: - Actions
    private func setupLocation() {
        switch locationService.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            locationService.startUpdatingLocation()
            viewModel.isLocating = true
        case .notDetermined:
            locationService.requestPermission()
        default:
            break
        }
    }
}

// MARK: - Map View Model
@MainActor
class MapViewModel: ObservableObject {
    enum ViewMode: String, CaseIterable {
        case local = "local"
        case national = "national"
        
        var title: String {
            switch self {
            case .local: return "同城"
            case .national: return "全国"
            }
        }
    }
    
    // 状态
    @Published var viewMode: ViewMode = .national
    @Published var isLoading: Bool = false
    @Published var isLocating: Bool = false
    @Published var isComplaintWallExpanded: Bool = false
    
    // 数据
    @Published var cities: [CityData] = []
    @Published var districts: [DistrictData] = []
    @Published var hotSpots: [HotSpot] = []
    @Published var complaints: [ComplaintData] = []
    
    // 选中项
    @Published var selectedCity: CityData?
    @Published var selectedDistrict: DistrictData?
    
    // 当前位置
    @Published var currentCity: String?
    @Published var userCoordinate: CLLocationCoordinate2D?
    
    // 地图位置
    @Published var cameraPosition: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 35.8, longitude: 104.0),
            span: MKCoordinateSpan(latitudeDelta: 35, longitudeDelta: 35)
        )
    )
    
    // 数据提供者（方便后续替换真实API）
    let dataProvider: MapDataProvider = MockMapDataProvider.shared
    
    // 显示统计
    var displayStats: (checkedIn: Int, stillWorking: Int) {
        switch viewMode {
        case .national:
            let total = cities.reduce((0, 0)) { ($0.0 + $1.checkedIn, $0.1 + $1.stillWorking) }
            return total
        case .local:
            let total = districts.reduce((0, 0)) { ($0.0 + $1.checkedIn, $0.1 + $1.stillWorking) }
            return total
        }
    }
    
    // MARK: - Data Loading
    func loadData() {
        Task {
            isLoading = true
            defer { isLoading = false }
            
            do {
                cities = try await dataProvider.fetchAllCities()
                complaints = try await dataProvider.fetchComplaints(city: nil, district: nil, limit: 50)
            } catch {
                print("加载数据失败: \(error)")
            }
        }
    }
    
    func loadLocalData(for city: String) {
        Task {
            do {
                districts = try await dataProvider.fetchDistricts(city: city)
                hotSpots = try await dataProvider.fetchHotSpots(city: city, district: nil)
                complaints = try await dataProvider.fetchComplaints(city: city, district: nil, limit: 30)
            } catch {
                print("加载本地数据失败: \(error)")
            }
        }
    }
    
    // MARK: - Location Updates
    func updateUserLocation(_ coordinate: CLLocationCoordinate2D, city: String?) {
        userCoordinate = coordinate
        isLocating = false
        
        if let city = city {
            currentCity = city
        }
        
        // 如果是同城模式且刚获取到位置，自动切换到用户位置
        if viewMode == .local && currentCity != nil {
            animateToUserLocation()
        }
    }
    
    func updateCurrentCity(_ city: String) {
        guard currentCity != city else { return }
        currentCity = city
        
        if viewMode == .local {
            loadLocalData(for: city)
        }
    }
    
    // MARK: - View Mode
    func switchViewMode(to mode: ViewMode) {
        viewMode = mode
        
        switch mode {
        case .national:
            animateToNational()
            Task {
                complaints = try await dataProvider.fetchComplaints(city: nil, district: nil, limit: 50)
            }
            
        case .local:
            if let city = currentCity {
                loadLocalData(for: city)
                animateToUserLocation()
            } else if let coordinate = userCoordinate {
                // 有坐标但没城市名，先定位过去
                animateTo(coordinate, span: 0.15)
            } else {
                // 没有位置信息，提示用户
                isLocating = true
            }
        }
    }
    
    // MARK: - Selection
    func selectCity(_ city: CityData) {
        haptic(.light)
        selectedCity = city
    }
    
    func selectDistrict(_ district: DistrictData) {
        haptic(.light)
        selectedDistrict = district
    }
    
    // MARK: - Camera Animation
    func animateToNational() {
        withAnimation(.easeInOut(duration: 0.5)) {
            cameraPosition = .region(
                MKCoordinateRegion(
                    center: CLLocationCoordinate2D(latitude: 35.8, longitude: 104.0),
                    span: MKCoordinateSpan(latitudeDelta: 35, longitudeDelta: 35)
                )
            )
        }
    }
    
    func animateToUserLocation() {
        guard let coordinate = userCoordinate else { return }
        animateTo(coordinate, span: 0.15)
    }
    
    func animateTo(_ coordinate: CLLocationCoordinate2D, span: Double) {
        withAnimation(.easeInOut(duration: 0.5)) {
            cameraPosition = .region(
                MKCoordinateRegion(
                    center: coordinate,
                    span: MKCoordinateSpan(latitudeDelta: span, longitudeDelta: span)
                )
            )
        }
    }
}

// MARK: - Stat Badge
struct StatBadge: View {
    let value: Int
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 1) {
            Text(formatNumber(value))
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(color)
            Text(label)
                .font(.system(size: 9))
                .foregroundColor(.gray)
        }
    }
    
    private func formatNumber(_ num: Int) -> String {
        if num >= 10000 { return String(format: "%.1fw", Double(num) / 10000) }
        if num >= 1000 { return String(format: "%.1fk", Double(num) / 1000) }
        return "\(num)"
    }
}

// MARK: - City Marker View
struct CityMarkerView: View {
    let city: CityData
    let isCompact: Bool
    let onTap: () -> Void
    
    @State private var isAnimating = false
    @State private var isPressed = false
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: isCompact ? 2 : 4) {
                ZStack {
                    Circle()
                        .fill(statusColor.opacity(0.25))
                        .frame(width: isCompact ? 35 : 50)
                        .scaleEffect(isAnimating ? 1.3 : 1)
                        .opacity(isAnimating ? 0.3 : 0.6)
                        .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: isAnimating)
                    
                    Circle()
                        .fill(LinearGradient(colors: [statusColor, statusColor.opacity(0.8)], startPoint: .top, endPoint: .bottom))
                        .frame(width: isCompact ? 24 : 36)
                        .shadow(color: statusColor.opacity(0.5), radius: 5)
                    
                    Text(formatCount(city.checkedIn))
                        .font(.system(size: isCompact ? 8 : 11, weight: .bold))
                        .foregroundColor(.white)
                }
                
                if !isCompact {
                    Text(city.city)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(Color.black.opacity(0.6)))
                }
            }
            .scaleEffect(isPressed ? 0.9 : 1)
        }
        .buttonStyle(.plain)
        .onAppear { isAnimating = true }
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in withAnimation(.easeInOut(duration: 0.1)) { isPressed = true } }
                .onEnded { _ in withAnimation(.easeInOut(duration: 0.1)) { isPressed = false } }
        )
    }
    
    private var statusColor: Color { Color(hex: city.status.color) }
    
    private func formatCount(_ count: Int) -> String {
        if count >= 10000 { return String(format: "%.0fw", Double(count) / 10000) }
        if count >= 1000 { return String(format: "%.0fk", Double(count) / 1000) }
        return "\(count)"
    }
}

// MARK: - District Marker View
struct DistrictMarkerView: View {
    let district: DistrictData
    let onTap: () -> Void
    
    @State private var isAnimating = false
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 4) {
                ZStack {
                    Circle()
                        .fill(statusColor.opacity(0.2))
                        .frame(width: 40)
                        .scaleEffect(isAnimating ? 1.2 : 1)
                        .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: isAnimating)
                    
                    Circle()
                        .fill(statusColor)
                        .frame(width: 28)
                        .shadow(color: statusColor.opacity(0.4), radius: 4)
                    
                    Text("\(Int(district.checkInRate * 100))%")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.white)
                }
                
                Text(district.district)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(Color.black.opacity(0.7)))
            }
        }
        .buttonStyle(.plain)
        .onAppear { isAnimating = true }
    }
    
    private var statusColor: Color {
        let rate = district.checkInRate
        if rate >= 0.7 { return .aliveGreen }
        if rate >= 0.4 { return .struggleYellow }
        return .deadRed
    }
}

// MARK: - HotSpot Marker View
struct HotSpotMarkerView: View {
    let spot: HotSpot
    
    var body: some View {
        VStack(spacing: 2) {
            ZStack {
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.orange.opacity(0.9))
                    .frame(width: 22, height: 22)
                    .shadow(color: .orange.opacity(0.4), radius: 3)
                
                Text(spot.type.emoji)
                    .font(.system(size: 12))
            }
            
            Text(spot.name)
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.white)
                .padding(.horizontal, 4)
                .padding(.vertical, 2)
                .background(Color.orange.opacity(0.8))
                .clipShape(RoundedRectangle(cornerRadius: 4))
        }
    }
}

// MARK: - Complaint Card View
struct ComplaintCardView: View {
    let complaint: ComplaintData
    @State private var isPlaying = false
    @State private var playProgress: CGFloat = 0
    @State private var isLiked = false
    @State private var likesCount: Int = 0
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // 头部
            HStack(spacing: 10) {
                Text(complaint.userEmoji)
                    .font(.system(size: 24))
                    .frame(width: 40, height: 40)
                    .background(Color(hex: "3C3C3E"))
                    .clipShape(Circle())
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(complaint.userNickname ?? "匿名牛马")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white)
                    
                    HStack(spacing: 4) {
                        if let city = complaint.city {
                            Image(systemName: "location.fill")
                                .font(.system(size: 9))
                            Text(city)
                            if let district = complaint.district {
                                Text("·")
                                Text(district)
                            }
                        }
                    }
                    .font(.system(size: 11))
                    .foregroundColor(.gray)
                }
                
                Spacer()
                
                Text(timeAgo(complaint.createdAt))
                    .font(.system(size: 11))
                    .foregroundColor(.gray.opacity(0.7))
            }
            .padding(.horizontal, 14)
            .padding(.top, 14)
            .padding(.bottom, 10)
            
            // 内容区（固定高度，保持卡片一致）
            Group {
                if complaint.isVoice {
                    VoicePlayerBar(
                        duration: complaint.voiceDuration,
                        isPlaying: $isPlaying,
                        progress: $playProgress
                    )
                } else {
                    Text(complaint.content)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white)
                        .lineLimit(2)
                        .lineSpacing(3)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .frame(height: 44) // 固定内容区高度
            .padding(.horizontal, 14)
            
            // 分隔线
            Rectangle()
                .fill(Color.white.opacity(0.06))
                .frame(height: 1)
                .padding(.top, 10)
            
            // 底部互动区
            HStack(spacing: 0) {
                // 点赞按钮
                Button {
                    toggleLike()
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: isLiked ? "hand.thumbsup.fill" : "hand.thumbsup")
                            .font(.system(size: 14))
                            .foregroundColor(isLiked ? .deadRed : .gray)
                        Text(formatNumber(likesCount))
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(isLiked ? .deadRed : .gray)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                }
                .buttonStyle(.plain)
                
                // 分隔线
                Rectangle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 1, height: 20)
                
                // 评论按钮
                Button {
                    // TODO: 打开评论
                    haptic(.light)
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "bubble.left")
                            .font(.system(size: 14))
                        Text(formatNumber(complaint.comments))
                            .font(.system(size: 12, weight: .medium))
                    }
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                }
                .buttonStyle(.plain)
                
                // 分隔线
                Rectangle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 1, height: 20)
                
                // 分类标签
                Text("\(complaint.category.emoji) \(complaint.category.rawValue)")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.deadRed)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
            }
        }
        .background(Color(hex: "2C2C2E"))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .onAppear {
            likesCount = complaint.likes
        }
    }
    
    private func toggleLike() {
        haptic(.light)
        withAnimation(.spring(response: 0.3)) {
            isLiked.toggle()
            likesCount += isLiked ? 1 : -1
        }
        
        // TODO: 调用 API
    }
    
    private func timeAgo(_ date: Date) -> String {
        let seconds = Int(-date.timeIntervalSinceNow)
        if seconds < 60 { return "刚刚" }
        if seconds < 3600 { return "\(seconds / 60)分钟前" }
        if seconds < 86400 { return "\(seconds / 3600)小时前" }
        return "\(seconds / 86400)天前"
    }
    
    private func formatNumber(_ num: Int) -> String {
        if num >= 10000 { return String(format: "%.1fw", Double(num) / 10000) }
        if num >= 1000 { return String(format: "%.1fk", Double(num) / 1000) }
        return "\(num)"
    }
}

// MARK: - Voice Player Bar (语音播放条)
struct VoicePlayerBar: View {
    let duration: Int
    @Binding var isPlaying: Bool
    @Binding var progress: CGFloat
    
    // 波形高度数据
    private let waveHeights: [CGFloat] = [0.3, 0.5, 0.8, 0.4, 0.9, 0.6, 0.7, 0.5, 0.8, 0.4,
                                           0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.7, 0.4,
                                           0.5, 0.8, 0.6, 0.7, 0.5]
    
    var body: some View {
        Button {
            togglePlay()
        } label: {
            HStack(spacing: 10) {
                // 播放/暂停按钮
                ZStack {
                    Circle()
                        .fill(Color.deadRed)
                        .frame(width: 36, height: 36)
                    
                    Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                        .offset(x: isPlaying ? 0 : 1)
                }
                
                // 波形
                GeometryReader { geo in
                    HStack(spacing: 2) {
                        ForEach(0..<waveHeights.count, id: \.self) { index in
                            let isPassed = CGFloat(index) / CGFloat(waveHeights.count) <= progress
                            
                            RoundedRectangle(cornerRadius: 1.5)
                                .fill(isPassed ? Color.deadRed : Color.white.opacity(0.3))
                                .frame(width: 3, height: 28 * waveHeights[index])
                        }
                    }
                    .frame(maxHeight: .infinity)
                }
                .frame(height: 28)
                
                // 时长
                Text(isPlaying ? formatTime(Int(Double(duration) * Double(progress))) : "\(duration)\"")
                    .font(.system(size: 13, weight: .semibold, design: .monospaced))
                    .foregroundColor(.white)
                    .frame(width: 36, alignment: .trailing)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                LinearGradient(
                    colors: [Color.deadRed.opacity(0.2), Color.deadRed.opacity(0.1)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 22))
            .overlay {
                RoundedRectangle(cornerRadius: 22)
                    .stroke(Color.deadRed.opacity(0.3), lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
    }
    
    private func togglePlay() {
        haptic(.light)
        
        if isPlaying {
            // 暂停
            isPlaying = false
        } else {
            // 播放
            isPlaying = true
            simulatePlayback()
        }
    }
    
    private func simulatePlayback() {
        progress = 0
        let steps = 50
        let interval = Double(duration) / Double(steps)
        
        for i in 0...steps {
            DispatchQueue.main.asyncAfter(deadline: .now() + interval * Double(i)) {
                guard isPlaying else { return }
                progress = CGFloat(i) / CGFloat(steps)
                
                if i == steps {
                    isPlaying = false
                    progress = 0
                }
            }
        }
    }
    
    private func formatTime(_ seconds: Int) -> String {
        if seconds < 60 {
            return "\(seconds)\""
        }
        return "\(seconds / 60):\(String(format: "%02d", seconds % 60))"
    }
}

// MARK: - City Detail Sheet
struct CityDetailSheet: View {
    let city: CityData
    let dataProvider: MapDataProvider
    @Environment(\.dismiss) private var dismiss
    @State private var districts: [DistrictData] = []
    @State private var hotSpots: [HotSpot] = []
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    statsCard
                    if !hotSpots.isEmpty { hotSpotsSection }
                    if !districts.isEmpty { districtsSection }
                }
                .padding(20)
            }
            .background(Color(hex: "1C1C1E"))
            .navigationTitle(city.city)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("完成") { dismiss() }
                }
            }
        }
        .onAppear { loadData() }
    }
    
    private var statsCard: some View {
        VStack(spacing: 16) {
            HStack {
                HStack(spacing: 8) {
                    Circle().fill(Color(hex: city.status.color)).frame(width: 10, height: 10)
                    Text(city.status.rawValue)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color(hex: city.status.color))
                }
                Spacer()
                Text("下班率 \(Int(city.checkInRate * 100))%")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
            }
            
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6).fill(Color.gray.opacity(0.2)).frame(height: 10)
                    RoundedRectangle(cornerRadius: 6).fill(Color.aliveGreen).frame(width: geo.size.width * city.checkInRate, height: 10)
                }
            }
            .frame(height: 10)
            
            HStack {
                StatColumn(value: city.checkedIn, label: "已下班", color: .aliveGreen)
                StatColumn(value: city.stillWorking, label: "还在苦", color: .deadRed)
                StatColumn(value: city.averageCheckOutTime ?? "--", label: "平均下班", isText: true)
            }
        }
        .padding(20)
        .background(Color(hex: "2C2C2E"))
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
    
    private var hotSpotsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("🔥 热门加班地点")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.white)
            
            ForEach(hotSpots.prefix(5)) { spot in
                HStack {
                    Text(spot.type.emoji)
                    Text(spot.name)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white)
                    Spacer()
                    Text("\(spot.stillWorking)人加班")
                        .font(.system(size: 12))
                        .foregroundColor(.deadRed)
                }
                .padding(12)
                .background(Color(hex: "3C3C3E"))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }
    
    private var districtsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("📍 区域分布")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.white)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(districts.prefix(8)) { d in
                    VStack(spacing: 4) {
                        Text(d.district)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.white)
                        Text("\(Int(d.checkInRate * 100))%下班")
                            .font(.system(size: 11))
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(12)
                    .background(Color(hex: "3C3C3E"))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
        }
    }
    
    private func loadData() {
        Task {
            districts = try await dataProvider.fetchDistricts(city: city.city)
            hotSpots = try await dataProvider.fetchHotSpots(city: city.city, district: nil)
        }
    }
}

// MARK: - District Detail Sheet
struct DistrictDetailSheet: View {
    let district: DistrictData
    let dataProvider: MapDataProvider
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    VStack(spacing: 16) {
                        Text("\(Int(district.checkInRate * 100))%")
                            .font(.system(size: 48, weight: .bold, design: .rounded))
                            .foregroundColor(district.checkInRate >= 0.5 ? .aliveGreen : .deadRed)
                        Text("下班率")
                            .foregroundColor(.gray)
                        
                        HStack(spacing: 40) {
                            StatColumn(value: district.checkedIn, label: "已下班", color: .aliveGreen)
                            StatColumn(value: district.stillWorking, label: "加班中", color: .deadRed)
                        }
                    }
                    .padding(24)
                    .frame(maxWidth: .infinity)
                    .background(Color(hex: "2C2C2E"))
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                }
                .padding(20)
            }
            .background(Color(hex: "1C1C1E"))
            .navigationTitle(district.district)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("完成") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Stat Column
struct StatColumn: View {
    let value: Any
    let label: String
    var color: Color = .white
    var isText: Bool = false
    
    var body: some View {
        VStack(spacing: 4) {
            if isText, let text = value as? String {
                Text(text)
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(color)
            } else if let num = value as? Int {
                Text(formatNumber(num))
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(color)
            }
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
    }
    
    private func formatNumber(_ num: Int) -> String {
        if num >= 10000 { return String(format: "%.1fw", Double(num) / 10000) }
        if num >= 1000 { return String(format: "%.1fk", Double(num) / 1000) }
        return "\(num)"
    }
}

// MARK: - Preview
struct MapView_Previews: PreviewProvider {
    static var previews: some View {
        MapView()
    }
}
