/**
 * 地图数据服务
 */

import { eq, desc, sql } from 'drizzle-orm'
import { db, cityStats, districtStats, hotSpots, type CityStats, type DistrictStats, type HotSpot } from '../db/index.js'

// 城市配置（用于初始化和Mock数据）
const cityConfigs = [
  { name: '北京', province: '北京', lat: 39.9042, lon: 116.4074, tier: 1 },
  { name: '上海', province: '上海', lat: 31.2304, lon: 121.4737, tier: 1 },
  { name: '深圳', province: '广东', lat: 22.5431, lon: 114.0579, tier: 1 },
  { name: '广州', province: '广东', lat: 23.1291, lon: 113.2644, tier: 1 },
  { name: '杭州', province: '浙江', lat: 30.2741, lon: 120.1551, tier: 2 },
  { name: '成都', province: '四川', lat: 30.5728, lon: 104.0668, tier: 2 },
  { name: '南京', province: '江苏', lat: 32.0603, lon: 118.7969, tier: 2 },
  { name: '武汉', province: '湖北', lat: 30.5928, lon: 114.3055, tier: 2 },
  { name: '西安', province: '陕西', lat: 34.3416, lon: 108.9398, tier: 2 },
  { name: '苏州', province: '江苏', lat: 31.2989, lon: 120.5853, tier: 2 },
  { name: '重庆', province: '重庆', lat: 29.4316, lon: 106.9123, tier: 2 },
  { name: '天津', province: '天津', lat: 39.3434, lon: 117.3616, tier: 2 },
  { name: '郑州', province: '河南', lat: 34.7466, lon: 113.6254, tier: 2 },
  { name: '长沙', province: '湖南', lat: 28.2282, lon: 112.9388, tier: 2 },
  { name: '青岛', province: '山东', lat: 36.0671, lon: 120.3826, tier: 3 },
  { name: '沈阳', province: '辽宁', lat: 41.8057, lon: 123.4315, tier: 3 },
  { name: '济南', province: '山东', lat: 36.6512, lon: 117.1201, tier: 3 },
  { name: '厦门', province: '福建', lat: 24.4798, lon: 118.0894, tier: 3 },
  { name: '福州', province: '福建', lat: 26.0745, lon: 119.2965, tier: 3 },
  { name: '合肥', province: '安徽', lat: 31.8206, lon: 117.2272, tier: 3 },
  { name: '大连', province: '辽宁', lat: 38.9140, lon: 121.6147, tier: 3 },
  { name: '昆明', province: '云南', lat: 24.8801, lon: 102.8329, tier: 3 },
  { name: '哈尔滨', province: '黑龙江', lat: 45.8038, lon: 126.5349, tier: 3 },
  { name: '长春', province: '吉林', lat: 43.8171, lon: 125.3235, tier: 3 },
  { name: '南昌', province: '江西', lat: 28.6820, lon: 115.8579, tier: 3 },
  { name: '无锡', province: '江苏', lat: 31.4912, lon: 120.3119, tier: 3 },
  { name: '宁波', province: '浙江', lat: 29.8683, lon: 121.5440, tier: 3 },
  { name: '东莞', province: '广东', lat: 23.0208, lon: 113.7518, tier: 3 },
  { name: '佛山', province: '广东', lat: 23.0218, lon: 113.1218, tier: 3 },
  { name: '贵阳', province: '贵州', lat: 26.6470, lon: 106.6302, tier: 3 },
]

// 区级配置
const districtConfigs: Record<string, { name: string; latOffset: number; lonOffset: number }[]> = {
  '北京': [
    { name: '海淀区', latOffset: 0.05, lonOffset: -0.1 },
    { name: '朝阳区', latOffset: 0.02, lonOffset: 0.08 },
    { name: '西城区', latOffset: -0.01, lonOffset: -0.02 },
    { name: '东城区', latOffset: -0.01, lonOffset: 0.02 },
    { name: '丰台区', latOffset: -0.08, lonOffset: -0.02 },
    { name: '通州区', latOffset: -0.02, lonOffset: 0.25 },
    { name: '大兴区', latOffset: -0.15, lonOffset: 0.05 },
    { name: '昌平区', latOffset: 0.15, lonOffset: 0.02 },
  ],
  '上海': [
    { name: '浦东新区', latOffset: 0.02, lonOffset: 0.15 },
    { name: '黄浦区', latOffset: -0.01, lonOffset: -0.02 },
    { name: '徐汇区', latOffset: -0.05, lonOffset: -0.05 },
    { name: '静安区', latOffset: 0.02, lonOffset: -0.02 },
    { name: '长宁区', latOffset: 0.01, lonOffset: -0.1 },
    { name: '虹口区', latOffset: 0.03, lonOffset: 0.02 },
    { name: '杨浦区', latOffset: 0.05, lonOffset: 0.05 },
    { name: '闵行区', latOffset: -0.1, lonOffset: -0.08 },
  ],
  '深圳': [
    { name: '南山区', latOffset: 0.02, lonOffset: -0.08 },
    { name: '福田区', latOffset: 0.0, lonOffset: 0.02 },
    { name: '罗湖区', latOffset: -0.02, lonOffset: 0.08 },
    { name: '宝安区', latOffset: 0.08, lonOffset: -0.15 },
    { name: '龙岗区', latOffset: 0.05, lonOffset: 0.2 },
    { name: '龙华区', latOffset: 0.1, lonOffset: 0.05 },
  ],
  '广州': [
    { name: '天河区', latOffset: 0.02, lonOffset: 0.05 },
    { name: '越秀区', latOffset: 0.0, lonOffset: -0.02 },
    { name: '海珠区', latOffset: -0.03, lonOffset: 0.02 },
    { name: '白云区', latOffset: 0.1, lonOffset: 0.0 },
    { name: '番禺区', latOffset: -0.12, lonOffset: 0.05 },
    { name: '黄埔区', latOffset: 0.05, lonOffset: 0.15 },
  ],
  '杭州': [
    { name: '西湖区', latOffset: 0.0, lonOffset: -0.05 },
    { name: '滨江区', latOffset: -0.05, lonOffset: 0.02 },
    { name: '余杭区', latOffset: 0.1, lonOffset: -0.08 },
    { name: '拱墅区', latOffset: 0.03, lonOffset: -0.02 },
    { name: '上城区', latOffset: -0.02, lonOffset: 0.02 },
    { name: '萧山区', latOffset: -0.1, lonOffset: 0.08 },
  ],
}

// 热门地点配置
const hotSpotConfigs: Record<string, { name: string; district: string; type: string; tags: string[] }[]> = {
  '北京': [
    { name: '中关村', district: '海淀区', type: 'techPark', tags: ['互联网重灾区', '程序员聚集地'] },
    { name: '望京SOHO', district: '朝阳区', type: 'office', tags: ['创业公司扎堆', '加班重灾区'] },
    { name: '后厂村', district: '海淀区', type: 'techPark', tags: ['大厂云集', '996发源地'] },
    { name: '国贸CBD', district: '朝阳区', type: 'cbd', tags: ['金融精英', '西装革履'] },
    { name: '西二旗', district: '海淀区', type: 'techPark', tags: ['码农天堂', '头发杀手'] },
    { name: '金融街', district: '西城区', type: 'cbd', tags: ['银行总部', '加班到头秃'] },
  ],
  '上海': [
    { name: '陆家嘴', district: '浦东新区', type: 'cbd', tags: ['金融中心', '高薪高压'] },
    { name: '张江高科', district: '浦东新区', type: 'techPark', tags: ['芯片半导体', '研发重镇'] },
    { name: '漕河泾', district: '徐汇区', type: 'techPark', tags: ['老牌园区', '互联网公司多'] },
    { name: '静安寺', district: '静安区', type: 'cbd', tags: ['时尚地标', '白领聚集'] },
    { name: '虹桥商务区', district: '长宁区', type: 'cbd', tags: ['交通枢纽', '出差多'] },
  ],
  '深圳': [
    { name: '南山科技园', district: '南山区', type: 'techPark', tags: ['腾讯总部', '大厂扎堆'] },
    { name: '后海', district: '南山区', type: 'cbd', tags: ['新CBD', '海景加班'] },
    { name: '华强北', district: '福田区', type: 'industrial', tags: ['电子一条街', '创业者天堂'] },
    { name: '坂田', district: '龙岗区', type: 'techPark', tags: ['华为基地', '狼性文化'] },
  ],
  '杭州': [
    { name: '未来科技城', district: '余杭区', type: 'techPark', tags: ['阿里巴巴', '电商重镇'] },
    { name: '滨江区块', district: '滨江区', type: 'techPark', tags: ['网易、海康', '互联网新贵'] },
    { name: '西溪', district: '西湖区', type: 'office', tags: ['创意园区', '环境最美'] },
    { name: '钱江新城', district: '上城区', type: 'cbd', tags: ['新CBD', '高端写字楼'] },
  ],
}

// 根据时间计算下班率
function calculateCheckInRate(hour: number, cityTier: number): number {
  const tierAdjust = cityTier === 1 ? -0.1 : cityTier === 2 ? -0.05 : 0
  
  let baseRate: number
  if (hour < 9) baseRate = 0.05
  else if (hour < 17) baseRate = 0.1
  else if (hour === 17) baseRate = 0.2
  else if (hour === 18) baseRate = 0.4
  else if (hour === 19) baseRate = 0.55
  else if (hour === 20) baseRate = 0.7
  else if (hour === 21) baseRate = 0.8
  else if (hour === 22) baseRate = 0.88
  else if (hour === 23) baseRate = 0.92
  else baseRate = 0.95
  
  return Math.max(0.05, Math.min(0.95, baseRate + tierAdjust + (Math.random() - 0.5) * 0.1))
}

export const mapService = {
  
  // 获取所有城市统计
  async getAllCities(): Promise<CityStats[]> {
    // 尝试从数据库获取
    const dbCities = await db.query.cityStats.findMany({
      orderBy: [desc(cityStats.totalWorkers)],
    })
    
    // 如果数据库有数据，返回数据库数据
    if (dbCities.length > 0) {
      return dbCities
    }
    
    // 否则生成动态数据
    return this.generateMockCities()
  },
  
  // 获取单个城市
  async getCity(cityName: string): Promise<CityStats | null> {
    const city = await db.query.cityStats.findFirst({
      where: eq(cityStats.city, cityName)
    })
    
    if (city) return city
    
    // 从配置生成
    const config = cityConfigs.find(c => c.name === cityName)
    if (!config) return null
    
    const hour = new Date().getHours()
    const rate = calculateCheckInRate(hour, config.tier)
    const baseTotal = config.tier === 1 ? 200000 : config.tier === 2 ? 80000 : 40000
    const total = baseTotal + Math.floor(Math.random() * baseTotal * 0.5)
    const checkedIn = Math.floor(total * rate)
    
    return {
      id: cityName,
      city: config.name,
      province: config.province,
      tier: config.tier,
      latitude: config.lat,
      longitude: config.lon,
      totalWorkers: total,
      checkedIn,
      stillWorking: total - checkedIn,
      averageCheckOutTime: config.tier === 1 ? '21:00' : config.tier === 2 ? '20:00' : '19:30',
      topComplaint: null,
      updatedAt: new Date(),
    }
  },
  
  // 获取城市的区级数据
  async getDistricts(cityName: string): Promise<DistrictStats[]> {
    // 尝试从数据库获取
    const dbDistricts = await db.query.districtStats.findMany({
      where: eq(districtStats.city, cityName),
    })
    
    if (dbDistricts.length > 0) {
      return dbDistricts
    }
    
    // 生成动态数据
    return this.generateMockDistricts(cityName)
  },
  
  // 获取热门地点
  async getHotSpots(cityName: string, district?: string): Promise<HotSpot[]> {
    // 尝试从数据库获取
    const conditions = [eq(hotSpots.city, cityName)]
    if (district) {
      conditions.push(eq(hotSpots.district, district))
    }
    
    const dbHotSpots = await db.query.hotSpots.findMany({
      where: conditions.length > 1 ? sql`${hotSpots.city} = ${cityName} AND ${hotSpots.district} = ${district}` : eq(hotSpots.city, cityName),
    })
    
    if (dbHotSpots.length > 0) {
      return dbHotSpots
    }
    
    // 生成动态数据
    return this.generateMockHotSpots(cityName, district)
  },
  
  // 获取全国摘要
  async getSummary(): Promise<{
    totalNationwide: number
    checkedInNationwide: number
    stillWorkingNationwide: number
    overallCheckInRate: number
    timestamp: string
  }> {
    const cities = await this.getAllCities()
    
    const total = cities.reduce((sum, c) => sum + c.totalWorkers, 0)
    const checkedIn = cities.reduce((sum, c) => sum + c.checkedIn, 0)
    
    return {
      totalNationwide: total,
      checkedInNationwide: checkedIn,
      stillWorkingNationwide: total - checkedIn,
      overallCheckInRate: total > 0 ? checkedIn / total : 0,
      timestamp: new Date().toISOString(),
    }
  },
  
  // 生成Mock城市数据
  generateMockCities(): CityStats[] {
    const hour = new Date().getHours()
    
    return cityConfigs.map(config => {
      const rate = calculateCheckInRate(hour, config.tier)
      const baseTotal = config.tier === 1 ? 200000 : config.tier === 2 ? 80000 : 40000
      const total = baseTotal + Math.floor(Math.random() * baseTotal * 0.5)
      const checkedIn = Math.floor(total * rate)
      
      const avgTimes = config.tier === 1 ? ['20:30', '21:00', '21:30'] : 
                       config.tier === 2 ? ['19:30', '20:00', '20:30'] :
                       ['18:30', '19:00', '19:30']
      
      return {
        id: config.name,
        city: config.name,
        province: config.province,
        tier: config.tier,
        latitude: config.lat,
        longitude: config.lon,
        totalWorkers: total,
        checkedIn,
        stillWorking: total - checkedIn,
        averageCheckOutTime: avgTimes[Math.floor(Math.random() * avgTimes.length)],
        topComplaint: null,
        updatedAt: new Date(),
      }
    })
  },
  
  // 生成Mock区级数据
  generateMockDistricts(cityName: string): DistrictStats[] {
    const cityConfig = cityConfigs.find(c => c.name === cityName)
    const districts = districtConfigs[cityName]
    
    if (!cityConfig || !districts) {
      // 生成默认区域
      return ['市中心', '开发区', '高新区', '新城区', '老城区'].map((name, i) => {
        const angle = i * (2 * Math.PI / 5)
        const radius = 0.05
        const total = Math.floor(Math.random() * 15000) + 3000
        const rate = calculateCheckInRate(new Date().getHours(), 3)
        const checkedIn = Math.floor(total * rate)
        
        return {
          id: `${cityName}-${name}`,
          city: cityName,
          district: name,
          latitude: (cityConfig?.lat || 30) + radius * Math.cos(angle),
          longitude: (cityConfig?.lon || 116) + radius * Math.sin(angle),
          totalWorkers: total,
          checkedIn,
          stillWorking: total - checkedIn,
          averageCheckOutTime: '19:30',
          updatedAt: new Date(),
        }
      })
    }
    
    const hour = new Date().getHours()
    
    return districts.map(d => {
      const total = Math.floor(Math.random() * 25000) + 5000
      const rate = calculateCheckInRate(hour, cityConfig.tier)
      const variance = (Math.random() - 0.5) * 0.2
      const adjustedRate = Math.max(0.1, Math.min(0.95, rate + variance))
      const checkedIn = Math.floor(total * adjustedRate)
      
      return {
        id: `${cityName}-${d.name}`,
        city: cityName,
        district: d.name,
        latitude: cityConfig.lat + d.latOffset,
        longitude: cityConfig.lon + d.lonOffset,
        totalWorkers: total,
        checkedIn,
        stillWorking: total - checkedIn,
        averageCheckOutTime: ['19:00', '19:30', '20:00', '20:30', '21:00'][Math.floor(Math.random() * 5)],
        updatedAt: new Date(),
      }
    })
  },
  
  // 生成Mock热门地点
  generateMockHotSpots(cityName: string, district?: string): HotSpot[] {
    const cityConfig = cityConfigs.find(c => c.name === cityName)
    let spots = hotSpotConfigs[cityName] || []
    
    if (district) {
      spots = spots.filter(s => s.district === district)
    }
    
    if (!cityConfig || spots.length === 0) {
      return []
    }
    
    const hour = new Date().getHours()
    const districtData = districtConfigs[cityName] || []
    
    return spots.map(spot => {
      const districtOffset = districtData.find(d => d.name === spot.district)
      const baseLat = cityConfig.lat + (districtOffset?.latOffset || 0)
      const baseLon = cityConfig.lon + (districtOffset?.lonOffset || 0)
      
      const total = Math.floor(Math.random() * 13000) + 2000
      const rate = calculateCheckInRate(hour, cityConfig.tier)
      const variance = (Math.random() - 0.5) * 0.3
      const adjustedRate = Math.max(0.1, Math.min(0.95, rate + variance))
      const checkedIn = Math.floor(total * adjustedRate)
      
      return {
        id: `${cityName}-${spot.name}`,
        name: spot.name,
        type: spot.type,
        city: cityName,
        district: spot.district,
        latitude: baseLat + (Math.random() - 0.5) * 0.02,
        longitude: baseLon + (Math.random() - 0.5) * 0.02,
        totalWorkers: total,
        checkedIn,
        stillWorking: total - checkedIn,
        averageCheckOutTime: ['20:00', '20:30', '21:00', '21:30', '22:00'][Math.floor(Math.random() * 5)],
        tags: spot.tags,
        updatedAt: new Date(),
      }
    })
  },
}

export default mapService
