/**
 * 地图路由
 * 
 * 全国牛马分布统计
 */

import { Hono } from 'hono'

const map = new Hono()

// 主要城市数据
const MAJOR_CITIES = [
  { name: '北京', lat: 39.9042, lon: 116.4074 },
  { name: '上海', lat: 31.2304, lon: 121.4737 },
  { name: '深圳', lat: 22.5431, lon: 114.0579 },
  { name: '广州', lat: 23.1291, lon: 113.2644 },
  { name: '杭州', lat: 30.2741, lon: 120.1551 },
  { name: '成都', lat: 30.5728, lon: 104.0668 },
  { name: '南京', lat: 32.0603, lon: 118.7969 },
  { name: '武汉', lat: 30.5928, lon: 114.3055 },
  { name: '西安', lat: 34.3416, lon: 108.9398 },
  { name: '苏州', lat: 31.2989, lon: 120.5853 },
  { name: '重庆', lat: 29.4316, lon: 106.9123 },
  { name: '天津', lat: 39.3434, lon: 117.3616 },
  { name: '郑州', lat: 34.7466, lon: 113.6254 },
  { name: '长沙', lat: 28.2282, lon: 112.9388 },
  { name: '青岛', lat: 36.0671, lon: 120.3826 },
  { name: '沈阳', lat: 41.8057, lon: 123.4315 },
  { name: '济南', lat: 36.6512, lon: 117.1201 },
  { name: '厦门', lat: 24.4798, lon: 118.0894 },
  { name: '福州', lat: 26.0745, lon: 119.2965 },
  { name: '合肥', lat: 31.8206, lon: 117.2272 },
]

// 获取城市统计数据
map.get('/stats', async (c) => {
  const hour = new Date().getHours()
  
  // 根据时间动态调整下班率
  let baseCheckInRate = 0.3
  if (hour >= 18) baseCheckInRate = 0.5
  if (hour >= 19) baseCheckInRate = 0.6
  if (hour >= 20) baseCheckInRate = 0.7
  if (hour >= 21) baseCheckInRate = 0.8
  if (hour >= 22) baseCheckInRate = 0.9
  
  // 生成城市数据
  const cityStats = MAJOR_CITIES.map(city => {
    const total = Math.floor(Math.random() * 40000) + 10000
    const checkInRate = baseCheckInRate + (Math.random() * 0.2 - 0.1)
    const checkedIn = Math.floor(total * checkInRate)
    
    return {
      city: city.name,
      totalWorkers: total,
      checkedIn,
      stillWorking: total - checkedIn,
      checkInRate,
      averageCheckOutTime: getRandomCheckOutTime(hour),
      topComplaint: getRandomTopComplaint(),
      latitude: city.lat,
      longitude: city.lon,
      status: checkInRate >= 0.7 ? 'mostlyOff' : checkInRate >= 0.4 ? 'struggling' : 'stillWorking',
    }
  })
  
  // 总计
  const totalNationwide = cityStats.reduce((sum, city) => sum + city.totalWorkers, 0)
  const checkedInNationwide = cityStats.reduce((sum, city) => sum + city.checkedIn, 0)
  
  return c.json({
    success: true,
    timestamp: new Date().toISOString(),
    summary: {
      totalNationwide,
      checkedInNationwide,
      stillWorkingNationwide: totalNationwide - checkedInNationwide,
      overallCheckInRate: checkedInNationwide / totalNationwide,
    },
    cities: cityStats,
  })
})

// 获取特定城市详情
map.get('/city/:name', async (c) => {
  const cityName = c.req.param('name')
  const city = MAJOR_CITIES.find(c => c.name === cityName)
  
  if (!city) {
    return c.json({
      error: '找不到这个城市',
      message: '你确定这是个中国城市？',
    }, 404)
  }
  
  // 生成城市详情
  const total = Math.floor(Math.random() * 40000) + 10000
  const checkedIn = Math.floor(total * 0.6)
  
  // 按区域划分
  const districts = [
    '海淀区', '朝阳区', '西城区', '东城区', '丰台区',
    '石景山区', '通州区', '顺义区', '大兴区', '昌平区'
  ].slice(0, Math.min(5, Math.floor(Math.random() * 8) + 3))
  
  const districtStats = districts.map(district => ({
    name: district,
    total: Math.floor(total / districts.length * (0.8 + Math.random() * 0.4)),
    checkedIn: Math.floor(total / districts.length * 0.5 * (0.8 + Math.random() * 0.4)),
  }))
  
  return c.json({
    success: true,
    city: {
      name: cityName,
      latitude: city.lat,
      longitude: city.lon,
      totalWorkers: total,
      checkedIn,
      stillWorking: total - checkedIn,
      averageCheckOutTime: '19:45',
      topComplaint: '领导又让加班了',
    },
    districts: districtStats,
  })
})

// 获取热力图数据
map.get('/heatmap', async (c) => {
  const heatmapData = MAJOR_CITIES.map(city => ({
    lat: city.lat,
    lng: city.lon,
    intensity: Math.random(), // 0-1 加班强度
  }))
  
  return c.json({
    success: true,
    heatmap: heatmapData,
  })
})

// 辅助函数
function getRandomCheckOutTime(currentHour: number): string {
  const times = ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00']
  const index = Math.min(Math.max(0, currentHour - 18), times.length - 1)
  return times[Math.floor(Math.random() * (index + 1))] || '19:00'
}

function getRandomTopComplaint(): string {
  const complaints = [
    '领导又让加班了',
    '需求改了三遍',
    '开了一天的会',
    '工资还没发',
    '同事又甩锅了',
    '代码又报错了',
    '客户太难伺候',
    '通勤太远了',
    '空调太冷了',
    '食堂太难吃',
  ]
  return complaints[Math.floor(Math.random() * complaints.length)]
}

export default map

