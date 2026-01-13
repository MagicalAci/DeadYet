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
    @State private var showComplaintSheet: Bool = false
    @State private var mapCameraPosition: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 35.0, longitude: 105.0),
            span: MKCoordinateSpan(latitudeDelta: 30, longitudeDelta: 30)
        )
    )
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // 地图
            mapContent
            
            // 底部抱怨墙
            complaintWall
        }
        .onAppear {
            loadMockData()
        }
        .sheet(isPresented: $showComplaintSheet) {
            if let city = selectedCity {
                CityDetailSheet(city: city, complaints: complaints.filter { $0.location?.city == city.city })
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
        }
    }
    
    // MARK: - Map Content
    private var mapContent: some View {
        ZStack(alignment: .topTrailing) {
            Map(position: $mapCameraPosition) {
                ForEach(cityStats) { city in
                    Annotation(city.city, coordinate: CLLocationCoordinate2D(latitude: city.latitude, longitude: city.longitude)) {
                        CityMarker(city: city)
                            .onTapGesture {
                                withAnimation(.spring(response: 0.3)) {
                                    selectedCity = city
                                    showComplaintSheet = true
                                }
                                haptic(.light)
                            }
                    }
                }
            }
            .mapStyle(.standard(elevation: .realistic, pointsOfInterest: .excludingAll))
            .mapControls {
                MapCompass()
                MapScaleView()
            }
            .ignoresSafeArea(edges: .top)
            
            // 缩放控制按钮
            VStack(spacing: 0) {
                // 放大按钮
                Button {
                    zoomIn()
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.primary)
                        .frame(width: 44, height: 44)
                }
                
                Divider()
                    .frame(width: 30)
                
                // 缩小按钮
                Button {
                    zoomOut()
                } label: {
                    Image(systemName: "minus")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.primary)
                        .frame(width: 44, height: 44)
                }
                
                Divider()
                    .frame(width: 30)
                
                // 重置按钮
                Button {
                    resetMapPosition()
                } label: {
                    Image(systemName: "arrow.counterclockwise")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.primary)
                        .frame(width: 44, height: 44)
                }
            }
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .shadow(color: .black.opacity(0.15), radius: 5, x: 0, y: 2)
            .padding(.top, 60)
            .padding(.trailing, 12)
        }
    }
    
    // MARK: - Map Controls
    private func zoomIn() {
        withAnimation(.easeInOut(duration: 0.3)) {
            if case .region(let region) = mapCameraPosition {
                let newSpan = MKCoordinateSpan(
                    latitudeDelta: max(region.span.latitudeDelta / 2, 0.5),
                    longitudeDelta: max(region.span.longitudeDelta / 2, 0.5)
                )
                mapCameraPosition = .region(MKCoordinateRegion(center: region.center, span: newSpan))
            }
        }
        haptic(.light)
    }
    
    private func zoomOut() {
        withAnimation(.easeInOut(duration: 0.3)) {
            if case .region(let region) = mapCameraPosition {
                let newSpan = MKCoordinateSpan(
                    latitudeDelta: min(region.span.latitudeDelta * 2, 60),
                    longitudeDelta: min(region.span.longitudeDelta * 2, 60)
                )
                mapCameraPosition = .region(MKCoordinateRegion(center: region.center, span: newSpan))
            }
        }
        haptic(.light)
    }
    
    private func resetMapPosition() {
        withAnimation(.easeInOut(duration: 0.5)) {
            mapCameraPosition = .region(
                MKCoordinateRegion(
                    center: CLLocationCoordinate2D(latitude: 35.0, longitude: 105.0),
                    span: MKCoordinateSpan(latitudeDelta: 30, longitudeDelta: 30)
                )
            )
        }
        haptic(.medium)
    }
    
    // MARK: - Complaint Wall
    private var complaintWall: some View {
        VStack(spacing: 0) {
            // 头部
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("📢 实时抱怨墙")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("看看全国牛马都在骂什么")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                // 统计
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(totalCheckedIn)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.aliveGreen)
                    Text("已下班")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                }
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(totalStillWorking)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.deadRed)
                    Text("还在苦")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                }
                .padding(.leading, 16)
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 12)
            
            Divider()
                .background(Color.white.opacity(0.1))
            
            // 抱怨列表
            ScrollView(.vertical, showsIndicators: false) {
                LazyVStack(spacing: 12) {
                    ForEach(complaints) { complaint in
                        ComplaintCard(complaint: complaint)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
            }
            .frame(height: 200)
        }
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 100)
    }
    
    // MARK: - Computed Properties
    private var totalCheckedIn: Int {
        cityStats.reduce(0) { $0 + $1.checkedIn }
    }
    
    private var totalStillWorking: Int {
        cityStats.reduce(0) { $0 + $1.stillWorking }
    }
    
    // MARK: - Data Loading
    private func loadMockData() {
        cityStats = LocationService.generateMockCityStats()
        complaints = LocationService.generateMockComplaints()
    }
}

// MARK: - City Marker
struct CityMarker: View {
    let city: CityStats
    
    @State private var isAnimating: Bool = false
    
    var body: some View {
        VStack(spacing: 4) {
            // 状态指示器
            ZStack {
                // 脉冲动画
                Circle()
                    .fill(statusColor.opacity(0.3))
                    .frame(width: isAnimating ? 50 : 30, height: isAnimating ? 50 : 30)
                    .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: isAnimating)
                
                Circle()
                    .fill(statusColor)
                    .frame(width: 24, height: 24)
                
                Text("\(city.checkedIn)")
                    .font(.system(size: 8, weight: .bold))
                    .foregroundColor(.white)
            }
            
            // 城市名称
            Text(city.city)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(
                    Capsule()
                        .fill(.ultraThinMaterial)
                )
        }
        .onAppear {
            isAnimating = true
        }
    }
    
    private var statusColor: Color {
        Color(hex: city.status.color)
    }
}

// MARK: - Complaint Card
struct ComplaintCard: View {
    let complaint: Complaint
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // 头像
            Text(complaint.userEmoji)
                .font(.system(size: 24))
                .frame(width: 40, height: 40)
                .background(Color.cardBg)
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 6) {
                // 位置和时间
                HStack {
                    if let location = complaint.location {
                        Text("\(location.city ?? "未知") · \(location.district ?? "")")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.gray)
                    }
                    
                    Spacer()
                    
                    Text(timeAgo(complaint.createdAt))
                        .font(.system(size: 11))
                        .foregroundColor(.gray.opacity(0.7))
                }
                
                // 抱怨内容
                Text(complaint.content)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white)
                    .lineLimit(3)
                
                // 互动数据
                HStack(spacing: 16) {
                    HStack(spacing: 4) {
                        Image(systemName: "hand.thumbsup.fill")
                            .font(.system(size: 12))
                        Text("\(complaint.likes)")
                            .font(.system(size: 12))
                    }
                    .foregroundColor(.gray)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "bubble.left.fill")
                            .font(.system(size: 12))
                        Text("\(complaint.comments)")
                            .font(.system(size: 12))
                    }
                    .foregroundColor(.gray)
                    
                    Spacer()
                    
                    // 分类标签
                    Text("\(complaint.category.emoji) \(complaint.category.rawValue)")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.deadRed)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.deadRed.opacity(0.15))
                        .clipShape(Capsule())
                }
            }
        }
        .padding(12)
        .background(Color.cardBg.opacity(0.8))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
    
    private func timeAgo(_ date: Date) -> String {
        let seconds = Int(-date.timeIntervalSinceNow)
        
        if seconds < 60 {
            return "刚刚"
        } else if seconds < 3600 {
            return "\(seconds / 60)分钟前"
        } else if seconds < 86400 {
            return "\(seconds / 3600)小时前"
        } else {
            return "\(seconds / 86400)天前"
        }
    }
}

// MARK: - City Detail Sheet
struct CityDetailSheet: View {
    let city: CityStats
    let complaints: [Complaint]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // 城市统计
                    cityStatsCard
                    
                    // 抱怨列表
                    VStack(alignment: .leading, spacing: 12) {
                        Text("本地抱怨")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                        
                        if complaints.isEmpty {
                            Text("这个城市的牛马还没开始骂街")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 40)
                        } else {
                            ForEach(complaints) { complaint in
                                ComplaintCard(complaint: complaint)
                            }
                        }
                    }
                }
                .padding(20)
            }
            .background(Color.darkBg)
            .navigationTitle(city.city)
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private var cityStatsCard: some View {
        VStack(spacing: 16) {
            // 状态指示
            HStack {
                Circle()
                    .fill(Color(hex: city.status.color))
                    .frame(width: 12, height: 12)
                
                Text(city.status.label)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(hex: city.status.color))
                
                Spacer()
                
                Text("下班率 \(Int(city.checkInRate * 100))%")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
            }
            
            // 进度条
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.cardBg)
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
            
            // 数据
            HStack {
                statItem(value: city.checkedIn, label: "已下班", color: .aliveGreen)
                Spacer()
                statItem(value: city.stillWorking, label: "还在苦", color: .deadRed)
                Spacer()
                statItem(value: city.totalWorkers, label: "总人数", color: .gray)
            }
            
            if let avgTime = city.averageCheckOutTime {
                Text("平均下班时间：\(avgTime)")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.gray)
            }
        }
        .padding(16)
        .glassCard()
    }
    
    private func statItem(value: Int, label: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text("\(value)")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(color)
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.gray)
        }
    }
}

// MARK: - Preview
struct MapView_Previews: PreviewProvider {
    static var previews: some View {
        MapView()
    }
}

