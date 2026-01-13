//
//  MapView.swift
//  DeadYet - 还没死？
//
//  全国牛马分布地图
//

import SwiftUI
import MapKit

struct MapView: View {
    @StateObject private var locationService = LocationService()
    @State private var cityStats: [CityStats] = []
    @State private var complaints: [Complaint] = []
    @State private var selectedCity: CityStats?
    @State private var hasSetInitialPosition: Bool = false
    
    // 视图模式：同城 / 全国
    @State private var viewMode: ViewMode = .national
    
    // 地图位置
    @State private var mapCameraPosition: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 35.8, longitude: 104.0),
            span: MKCoordinateSpan(latitudeDelta: 35, longitudeDelta: 35)
        )
    )
    
    // 抱怨墙展开/收起状态
    @State private var isComplaintWallExpanded = false
    
    enum ViewMode: String, CaseIterable {
        case local = "同城"
        case national = "全国"
    }
    
    var body: some View {
        ZStack {
            // 地图 - 全屏
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
        }
        .onAppear {
            loadMockData()
            setupInitialLocation()
        }
        .onChange(of: locationService.currentLocation) { _, newLocation in
            if let location = newLocation, !hasSetInitialPosition {
                hasSetInitialPosition = true
                if viewMode == .local {
                    animateToLocation(location.coordinate, span: 0.15)
                }
            }
        }
        .onChange(of: viewMode) { _, newMode in
            switchViewMode(to: newMode)
        }
        .sheet(item: $selectedCity) { city in
            CityDetailSheet(city: city, complaints: complaints.filter { $0.location?.city == city.city })
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
    }
    
    // MARK: - Top Control Bar
    private var topControlBar: some View {
        VStack(spacing: 12) {
            // 模式切换 + 统计
            HStack(spacing: 12) {
                // 同城/全国切换
                HStack(spacing: 0) {
                    ForEach(ViewMode.allCases, id: \.self) { mode in
                        Button {
                            withAnimation(.spring(response: 0.3)) {
                                viewMode = mode
                            }
                            haptic(.light)
                        } label: {
                            Text(mode.rawValue)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(viewMode == mode ? .white : .gray)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(
                                    viewMode == mode 
                                        ? Color.deadRed 
                                        : Color.clear
                                )
                        }
                    }
                }
                .background(Color.black.opacity(0.6))
                .clipShape(Capsule())
                .overlay {
                    Capsule()
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                }
                
                Spacer()
                
                // 实时统计
                HStack(spacing: 16) {
                    StatBadge(value: displayCheckedIn, label: "已下班", color: .aliveGreen)
                    StatBadge(value: displayStillWorking, label: "加班中", color: .deadRed)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.black.opacity(0.6))
                .clipShape(Capsule())
            }
            .padding(.horizontal, 16)
            
            // 当前城市信息（同城模式）
            if viewMode == .local {
                currentCityInfo
            }
        }
        .padding(.top, 60)
    }
    
    // MARK: - Current City Info
    private var currentCityInfo: some View {
        HStack(spacing: 12) {
            Image(systemName: "location.fill")
                .font(.system(size: 14))
                .foregroundColor(.blue)
            
            Text(locationService.currentCity ?? "定位中...")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white)
            
            if let city = currentCityStats {
                Text("·")
                    .foregroundColor(.gray)
                
                Text("\(city.checkedIn)人已下班")
                    .font(.system(size: 13))
                    .foregroundColor(.aliveGreen)
                
                Text("\(city.stillWorking)人加班")
                    .font(.system(size: 13))
                    .foregroundColor(.deadRed)
            }
            
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.black.opacity(0.5))
        .transition(.move(edge: .top).combined(with: .opacity))
    }
    
    // MARK: - Map Content
    private var mapContent: some View {
        Map(position: $mapCameraPosition, interactionModes: .all) {
            // 用户位置
            UserAnnotation()
            
            // 城市标记
            ForEach(displayCities) { city in
                Annotation(city.city, coordinate: CLLocationCoordinate2D(latitude: city.latitude, longitude: city.longitude)) {
                    CityMarkerView(city: city, isCompact: viewMode == .national) {
                        selectedCity = city
                    }
                }
            }
        }
        .mapStyle(.standard(elevation: .realistic, pointsOfInterest: .excludingAll))
        .mapControls {
            MapCompass()
                .mapControlVisibility(.visible)
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
            
            // 头部 - 点击展开/收起
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("📢 \(viewMode == .local ? "本地" : "全国")抱怨墙")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(viewMode == .local ? "看看同城牛马在骂什么" : "看看全国牛马都在骂什么")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                // 热度指示
                HStack(spacing: 8) {
                    HStack(spacing: 4) {
                        Circle()
                            .fill(Color.deadRed)
                            .frame(width: 8, height: 8)
                        Text("\(displayComplaints.count)条")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white)
                    }
                    
                    Image(systemName: isComplaintWallExpanded ? "chevron.down" : "chevron.up")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(width: 28, height: 28)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Circle())
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
            .contentShape(Rectangle())
            .onTapGesture {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    isComplaintWallExpanded.toggle()
                }
            }
            
            // 抱怨列表
            if isComplaintWallExpanded {
                Divider()
                    .background(Color.white.opacity(0.1))
                
                ScrollView(.vertical, showsIndicators: false) {
                    LazyVStack(spacing: 12) {
                        ForEach(displayComplaints) { complaint in
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
    
    // MARK: - Computed Properties
    private var displayCities: [CityStats] {
        if viewMode == .local, let currentCity = locationService.currentCity {
            // 同城模式：显示当前城市周边
            return cityStats.filter { $0.city == currentCity }
        }
        return cityStats
    }
    
    private var displayComplaints: [Complaint] {
        if viewMode == .local, let currentCity = locationService.currentCity {
            return complaints.filter { $0.location?.city == currentCity }
        }
        return complaints
    }
    
    private var displayCheckedIn: Int {
        displayCities.reduce(0) { $0 + $1.checkedIn }
    }
    
    private var displayStillWorking: Int {
        displayCities.reduce(0) { $0 + $1.stillWorking }
    }
    
    private var currentCityStats: CityStats? {
        guard let currentCity = locationService.currentCity else { return nil }
        return cityStats.first { $0.city == currentCity }
    }
    
    // MARK: - Actions
    private func setupInitialLocation() {
        if locationService.authorizationStatus == .authorizedWhenInUse ||
           locationService.authorizationStatus == .authorizedAlways {
            locationService.startUpdatingLocation()
        } else if locationService.authorizationStatus == .notDetermined {
            locationService.requestPermission()
        }
    }
    
    private func switchViewMode(to mode: ViewMode) {
        switch mode {
        case .local:
            if let location = locationService.currentLocation {
                animateToLocation(location.coordinate, span: 0.15)
            } else {
                // 默认北京
                animateToLocation(CLLocationCoordinate2D(latitude: 39.9042, longitude: 116.4074), span: 0.3)
            }
        case .national:
            // 全国视角
            animateToLocation(CLLocationCoordinate2D(latitude: 35.8, longitude: 104.0), span: 35)
        }
    }
    
    private func animateToLocation(_ coordinate: CLLocationCoordinate2D, span: Double) {
        withAnimation(.easeInOut(duration: 0.5)) {
            mapCameraPosition = .region(
                MKCoordinateRegion(
                    center: coordinate,
                    span: MKCoordinateSpan(latitudeDelta: span, longitudeDelta: span)
                )
            )
        }
    }
    
    private func loadMockData() {
        cityStats = LocationService.generateMockCityStats()
        complaints = LocationService.generateMockComplaints()
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
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundColor(color)
            
            Text(label)
                .font(.system(size: 9))
                .foregroundColor(.gray)
        }
    }
    
    private func formatNumber(_ num: Int) -> String {
        if num >= 10000 {
            return String(format: "%.1fw", Double(num) / 10000)
        } else if num >= 1000 {
            return String(format: "%.1fk", Double(num) / 1000)
        }
        return "\(num)"
    }
}

// MARK: - City Marker View
struct CityMarkerView: View {
    let city: CityStats
    let isCompact: Bool
    let onTap: () -> Void
    
    @State private var isAnimating: Bool = false
    @State private var isPressed: Bool = false
    
    var body: some View {
        Button(action: {
            haptic(.light)
            onTap()
        }) {
            VStack(spacing: isCompact ? 2 : 4) {
                ZStack {
                    // 脉冲背景
                    Circle()
                        .fill(statusColor.opacity(0.25))
                        .frame(width: isCompact ? 35 : 50, height: isCompact ? 35 : 50)
                        .scaleEffect(isAnimating ? 1.3 : 1)
                        .opacity(isAnimating ? 0.3 : 0.6)
                        .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: isAnimating)
                    
                    // 主圆点
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [statusColor, statusColor.opacity(0.8)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(width: isCompact ? 24 : 36, height: isCompact ? 24 : 36)
                        .shadow(color: statusColor.opacity(0.5), radius: 5)
                    
                    // 数字
                    Text(formatCount(city.checkedIn))
                        .font(.system(size: isCompact ? 8 : 11, weight: .bold))
                        .foregroundColor(.white)
                }
                
                // 城市名
                if !isCompact {
                    Text(city.city)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 3)
                        .background(
                            Capsule()
                                .fill(Color.black.opacity(0.6))
                        )
                }
            }
            .scaleEffect(isPressed ? 0.9 : 1)
        }
        .buttonStyle(.plain)
        .onAppear {
            isAnimating = true
        }
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    withAnimation(.easeInOut(duration: 0.1)) { isPressed = true }
                }
                .onEnded { _ in
                    withAnimation(.easeInOut(duration: 0.1)) { isPressed = false }
                }
        )
    }
    
    private var statusColor: Color {
        let rate = city.checkInRate
        if rate >= 0.7 {
            return .aliveGreen
        } else if rate >= 0.4 {
            return .struggleYellow
        } else {
            return .deadRed
        }
    }
    
    private func formatCount(_ count: Int) -> String {
        if count >= 10000 {
            return String(format: "%.0fw", Double(count) / 10000)
        } else if count >= 1000 {
            return String(format: "%.0fk", Double(count) / 1000)
        }
        return "\(count)"
    }
}

// MARK: - Complaint Card View
struct ComplaintCardView: View {
    let complaint: Complaint
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // 头像
            Text(complaint.userEmoji)
                .font(.system(size: 26))
                .frame(width: 44, height: 44)
                .background(Color(hex: "3C3C3E"))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 6) {
                // 头部信息
                HStack {
                    // 位置
                    if let location = complaint.location {
                        HStack(spacing: 4) {
                            Image(systemName: "location.fill")
                                .font(.system(size: 9))
                            Text("\(location.city ?? "")·\(location.district ?? "")")
                        }
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.gray)
                    }
                    
                    Spacer()
                    
                    // 时间
                    Text(timeAgo(complaint.createdAt))
                        .font(.system(size: 11))
                        .foregroundColor(.gray.opacity(0.7))
                }
                
                // 内容
                Text(complaint.content)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .lineSpacing(2)
                
                // 底部信息
                HStack(spacing: 16) {
                    // 点赞
                    HStack(spacing: 4) {
                        Image(systemName: "hand.thumbsup.fill")
                        Text("\(complaint.likes)")
                    }
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
                    
                    // 评论
                    HStack(spacing: 4) {
                        Image(systemName: "bubble.left.fill")
                        Text("\(complaint.comments)")
                    }
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
                    
                    Spacer()
                    
                    // 分类
                    Text("\(complaint.category.emoji) \(complaint.category.rawValue)")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.deadRed)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.deadRed.opacity(0.15))
                        .clipShape(Capsule())
                }
            }
        }
        .padding(14)
        .background(Color(hex: "2C2C2E"))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    private func timeAgo(_ date: Date) -> String {
        let seconds = Int(-date.timeIntervalSinceNow)
        if seconds < 60 { return "刚刚" }
        else if seconds < 3600 { return "\(seconds / 60)分钟前" }
        else if seconds < 86400 { return "\(seconds / 3600)小时前" }
        else { return "\(seconds / 86400)天前" }
    }
}

// MARK: - City Detail Sheet
struct CityDetailSheet: View {
    let city: CityStats
    let complaints: [Complaint]
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // 城市统计卡片
                    cityStatsCard
                    
                    // 热门时段
                    peakHoursCard
                    
                    // 本地抱怨
                    localComplaintsSection
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
    }
    
    private var cityStatsCard: some View {
        VStack(spacing: 16) {
            // 状态头部
            HStack {
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color(hex: city.status.color))
                        .frame(width: 12, height: 12)
                    
                    Text(city.status.label)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color(hex: city.status.color))
                }
                
                Spacer()
                
                Text("下班率 \(Int(city.checkInRate * 100))%")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
            }
            
            // 进度条
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 12)
                    
                    RoundedRectangle(cornerRadius: 6)
                        .fill(
                            LinearGradient(
                                colors: [.aliveGreen, Color(hex: "2ECC71")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * city.checkInRate, height: 12)
                }
            }
            .frame(height: 12)
            
            // 数据行
            HStack {
                VStack(spacing: 4) {
                    Text("\(city.checkedIn)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.aliveGreen)
                    Text("已下班")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                
                VStack(spacing: 4) {
                    Text("\(city.stillWorking)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.deadRed)
                    Text("还在苦")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                
                VStack(spacing: 4) {
                    Text(city.averageCheckOutTime ?? "--:--")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("平均下班")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(20)
        .background(Color(hex: "2C2C2E"))
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
    
    private var peakHoursCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("🕐 下班高峰")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.white)
            
            HStack(spacing: 8) {
                ForEach(["18:00", "19:00", "20:00", "21:00", "22:00"], id: \.self) { hour in
                    let isHot = hour == "19:00" || hour == "20:00"
                    VStack(spacing: 4) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(isHot ? Color.deadRed : Color.gray.opacity(0.3))
                            .frame(height: isHot ? 60 : CGFloat.random(in: 20...40))
                        
                        Text(hour)
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(16)
        .background(Color(hex: "2C2C2E"))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    private var localComplaintsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("💬 本地热门抱怨")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("\(complaints.count)条")
                    .font(.system(size: 13))
                    .foregroundColor(.gray)
            }
            
            if complaints.isEmpty {
                Text("这个城市的牛马还没开始骂街")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else {
                ForEach(complaints.prefix(5)) { complaint in
                    SimpleComplaintCard(complaint: complaint)
                }
            }
        }
    }
}

// MARK: - Simple Complaint Card
struct SimpleComplaintCard: View {
    let complaint: Complaint
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(complaint.userEmoji)
                .font(.system(size: 24))
                .frame(width: 40, height: 40)
                .background(Color(hex: "3C3C3E"))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 6) {
                Text(complaint.content)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white)
                    .lineLimit(2)
                
                HStack(spacing: 12) {
                    Label("\(complaint.likes)", systemImage: "hand.thumbsup.fill")
                    Label("\(complaint.comments)", systemImage: "bubble.left.fill")
                }
                .font(.system(size: 11))
                .foregroundColor(.gray)
            }
        }
        .padding(12)
        .background(Color(hex: "3C3C3E"))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

// MARK: - Preview
struct MapView_Previews: PreviewProvider {
    static var previews: some View {
        MapView()
    }
}
