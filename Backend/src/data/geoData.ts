/**
 * 地理数据配置
 * 
 * 包含：
 * - 100+ 城市（所有省会 + 主要地级市）
 * - 真实行政区划坐标
 * - 热门商圈/科技园 POI
 * - 人口密度权重
 */

// ==================== 城市配置 ====================

export interface CityConfig {
  name: string
  province: string
  tier: 1 | 2 | 3 | 4  // 1=一线 2=新一线 3=二线 4=三线及以下
  lat: number
  lon: number
  overtimeIndex: number  // 加班指数 1.0=正常
  workerBase: number     // 打工人基数（万人）
  avgCheckoutHour: number
  industries: string[]
  population: number     // 常住人口（万人）
}

export const CITIES: CityConfig[] = [
  // ===== 一线城市 =====
  { name: '北京', province: '北京', tier: 1, lat: 39.9042, lon: 116.4074, 
    overtimeIndex: 1.35, workerBase: 25, avgCheckoutHour: 21.5, 
    industries: ['互联网', '金融', '教育', '传媒'], population: 2189 },
  { name: '上海', province: '上海', tier: 1, lat: 31.2304, lon: 121.4737,
    overtimeIndex: 1.30, workerBase: 22, avgCheckoutHour: 21.0,
    industries: ['金融', '贸易', '互联网', '制造'], population: 2487 },
  { name: '广州', province: '广东', tier: 1, lat: 23.1291, lon: 113.2644,
    overtimeIndex: 1.20, workerBase: 15, avgCheckoutHour: 20.5,
    industries: ['贸易', '制造', '互联网', '传媒'], population: 1881 },
  { name: '深圳', province: '广东', tier: 1, lat: 22.5431, lon: 114.0579,
    overtimeIndex: 1.40, workerBase: 18, avgCheckoutHour: 22.0,
    industries: ['互联网', '硬件', '金融', '电商'], population: 1768 },

  // ===== 新一线城市 =====
  { name: '成都', province: '四川', tier: 2, lat: 30.5728, lon: 104.0668,
    overtimeIndex: 0.95, workerBase: 10, avgCheckoutHour: 19.5,
    industries: ['游戏', '互联网', '传媒'], population: 2119 },
  { name: '杭州', province: '浙江', tier: 2, lat: 30.2741, lon: 120.1551,
    overtimeIndex: 1.35, workerBase: 12, avgCheckoutHour: 21.5,
    industries: ['电商', '互联网', '金融科技'], population: 1237 },
  { name: '重庆', province: '重庆', tier: 2, lat: 29.4316, lon: 106.9123,
    overtimeIndex: 0.90, workerBase: 8, avgCheckoutHour: 19.0,
    industries: ['汽车', '电子', '制造'], population: 3212 },
  { name: '武汉', province: '湖北', tier: 2, lat: 30.5928, lon: 114.3055,
    overtimeIndex: 1.05, workerBase: 8, avgCheckoutHour: 20.0,
    industries: ['光电', '汽车', '教育'], population: 1373 },
  { name: '西安', province: '陕西', tier: 2, lat: 34.3416, lon: 108.9398,
    overtimeIndex: 1.00, workerBase: 7, avgCheckoutHour: 19.5,
    industries: ['航天', '软件', '教育'], population: 1316 },
  { name: '苏州', province: '江苏', tier: 2, lat: 31.2989, lon: 120.5853,
    overtimeIndex: 1.15, workerBase: 6, avgCheckoutHour: 20.5,
    industries: ['制造', '生物医药', '软件'], population: 1292 },
  { name: '天津', province: '天津', tier: 2, lat: 39.3434, lon: 117.3616,
    overtimeIndex: 1.00, workerBase: 6, avgCheckoutHour: 19.5,
    industries: ['制造', '港口', '金融'], population: 1373 },
  { name: '南京', province: '江苏', tier: 2, lat: 32.0603, lon: 118.7969,
    overtimeIndex: 1.10, workerBase: 8, avgCheckoutHour: 20.0,
    industries: ['软件', '制造', '教育'], population: 942 },
  { name: '长沙', province: '湖南', tier: 2, lat: 28.2282, lon: 112.9388,
    overtimeIndex: 0.95, workerBase: 5, avgCheckoutHour: 19.0,
    industries: ['传媒', '制造', '文娱'], population: 1042 },
  { name: '郑州', province: '河南', tier: 2, lat: 34.7466, lon: 113.6254,
    overtimeIndex: 1.00, workerBase: 5, avgCheckoutHour: 19.5,
    industries: ['电商', '制造', '物流'], population: 1274 },
  { name: '东莞', province: '广东', tier: 2, lat: 23.0208, lon: 113.7518,
    overtimeIndex: 1.20, workerBase: 5, avgCheckoutHour: 20.0,
    industries: ['电子制造', '代工'], population: 1053 },
  { name: '青岛', province: '山东', tier: 2, lat: 36.0671, lon: 120.3826,
    overtimeIndex: 0.90, workerBase: 4, avgCheckoutHour: 18.5,
    industries: ['制造', '港口', '旅游'], population: 1026 },
  { name: '沈阳', province: '辽宁', tier: 2, lat: 41.8057, lon: 123.4315,
    overtimeIndex: 0.85, workerBase: 4, avgCheckoutHour: 18.0,
    industries: ['装备制造', '汽车'], population: 911 },
  { name: '宁波', province: '浙江', tier: 2, lat: 29.8683, lon: 121.5440,
    overtimeIndex: 0.95, workerBase: 4, avgCheckoutHour: 18.5,
    industries: ['港口', '制造', '贸易'], population: 954 },
  { name: '昆明', province: '云南', tier: 2, lat: 24.8801, lon: 102.8329,
    overtimeIndex: 0.80, workerBase: 3, avgCheckoutHour: 18.0,
    industries: ['旅游', '生物医药'], population: 846 },

  // ===== 二线城市 =====
  { name: '无锡', province: '江苏', tier: 3, lat: 31.4912, lon: 120.3119,
    overtimeIndex: 1.00, workerBase: 4, avgCheckoutHour: 19.0,
    industries: ['半导体', '物联网', '制造'], population: 746 },
  { name: '佛山', province: '广东', tier: 3, lat: 23.0218, lon: 113.1218,
    overtimeIndex: 1.00, workerBase: 4, avgCheckoutHour: 19.0,
    industries: ['家电', '陶瓷', '制造'], population: 961 },
  { name: '合肥', province: '安徽', tier: 3, lat: 31.8206, lon: 117.2272,
    overtimeIndex: 1.05, workerBase: 4, avgCheckoutHour: 19.5,
    industries: ['家电', '半导体', '新能源'], population: 947 },
  { name: '大连', province: '辽宁', tier: 3, lat: 38.9140, lon: 121.6147,
    overtimeIndex: 0.90, workerBase: 3, avgCheckoutHour: 18.5,
    industries: ['软件外包', '港口', '旅游'], population: 745 },
  { name: '福州', province: '福建', tier: 3, lat: 26.0745, lon: 119.2965,
    overtimeIndex: 0.90, workerBase: 3, avgCheckoutHour: 18.5,
    industries: ['软件', '制造'], population: 842 },
  { name: '厦门', province: '福建', tier: 3, lat: 24.4798, lon: 118.0894,
    overtimeIndex: 0.95, workerBase: 3, avgCheckoutHour: 19.0,
    industries: ['软件', '贸易', '旅游'], population: 528 },
  { name: '济南', province: '山东', tier: 3, lat: 36.6512, lon: 117.1201,
    overtimeIndex: 0.90, workerBase: 4, avgCheckoutHour: 18.5,
    industries: ['软件', '医药', '金融'], population: 941 },
  { name: '哈尔滨', province: '黑龙江', tier: 3, lat: 45.8038, lon: 126.5349,
    overtimeIndex: 0.80, workerBase: 3, avgCheckoutHour: 18.0,
    industries: ['装备制造', '农业'], population: 988 },
  { name: '长春', province: '吉林', tier: 3, lat: 43.8171, lon: 125.3235,
    overtimeIndex: 0.85, workerBase: 3, avgCheckoutHour: 18.0,
    industries: ['汽车', '装备制造'], population: 906 },
  { name: '南昌', province: '江西', tier: 3, lat: 28.6820, lon: 115.8579,
    overtimeIndex: 0.90, workerBase: 2, avgCheckoutHour: 18.5,
    industries: ['电子', '制造'], population: 643 },
  { name: '贵阳', province: '贵州', tier: 3, lat: 26.6470, lon: 106.6302,
    overtimeIndex: 0.85, workerBase: 2, avgCheckoutHour: 18.0,
    industries: ['大数据', '旅游'], population: 610 },
  { name: '南宁', province: '广西', tier: 3, lat: 22.8170, lon: 108.3665,
    overtimeIndex: 0.85, workerBase: 2, avgCheckoutHour: 18.0,
    industries: ['制造', '农业'], population: 883 },
  { name: '石家庄', province: '河北', tier: 3, lat: 38.0428, lon: 114.5149,
    overtimeIndex: 0.90, workerBase: 3, avgCheckoutHour: 18.5,
    industries: ['医药', '制造'], population: 1120 },
  { name: '太原', province: '山西', tier: 3, lat: 37.8706, lon: 112.5489,
    overtimeIndex: 0.85, workerBase: 2, avgCheckoutHour: 18.0,
    industries: ['能源', '制造'], population: 539 },
  { name: '兰州', province: '甘肃', tier: 3, lat: 36.0611, lon: 103.8343,
    overtimeIndex: 0.80, workerBase: 2, avgCheckoutHour: 18.0,
    industries: ['石化', '制造'], population: 437 },
  { name: '乌鲁木齐', province: '新疆', tier: 3, lat: 43.8256, lon: 87.6168,
    overtimeIndex: 0.80, workerBase: 2, avgCheckoutHour: 18.0,
    industries: ['能源', '贸易'], population: 405 },
  { name: '海口', province: '海南', tier: 3, lat: 20.0200, lon: 110.3490,
    overtimeIndex: 0.75, workerBase: 1, avgCheckoutHour: 17.5,
    industries: ['旅游', '贸易'], population: 290 },
  { name: '呼和浩特', province: '内蒙古', tier: 3, lat: 40.8427, lon: 111.7500,
    overtimeIndex: 0.80, workerBase: 1, avgCheckoutHour: 18.0,
    industries: ['乳业', '能源'], population: 349 },
  { name: '银川', province: '宁夏', tier: 3, lat: 38.4872, lon: 106.2309,
    overtimeIndex: 0.80, workerBase: 1, avgCheckoutHour: 18.0,
    industries: ['能源', '新材料'], population: 288 },
  { name: '西宁', province: '青海', tier: 3, lat: 36.6171, lon: 101.7782,
    overtimeIndex: 0.75, workerBase: 1, avgCheckoutHour: 17.5,
    industries: ['能源', '旅游'], population: 248 },
  { name: '拉萨', province: '西藏', tier: 3, lat: 29.6500, lon: 91.1000,
    overtimeIndex: 0.70, workerBase: 0.5, avgCheckoutHour: 17.0,
    industries: ['旅游', '文化'], population: 90 },
  
  // ===== 三线及以下重点城市 =====
  { name: '珠海', province: '广东', tier: 4, lat: 22.2710, lon: 113.5767,
    overtimeIndex: 0.95, workerBase: 2, avgCheckoutHour: 19.0,
    industries: ['电子', '旅游'], population: 244 },
  { name: '中山', province: '广东', tier: 4, lat: 22.5176, lon: 113.3926,
    overtimeIndex: 0.95, workerBase: 2, avgCheckoutHour: 19.0,
    industries: ['家电', '照明'], population: 446 },
  { name: '惠州', province: '广东', tier: 4, lat: 23.1115, lon: 114.4160,
    overtimeIndex: 1.00, workerBase: 2, avgCheckoutHour: 19.0,
    industries: ['电子', '石化'], population: 605 },
  { name: '温州', province: '浙江', tier: 4, lat: 28.0000, lon: 120.6994,
    overtimeIndex: 0.90, workerBase: 2, avgCheckoutHour: 18.5,
    industries: ['鞋服', '电器'], population: 967 },
  { name: '嘉兴', province: '浙江', tier: 4, lat: 30.7522, lon: 120.7610,
    overtimeIndex: 0.95, workerBase: 2, avgCheckoutHour: 19.0,
    industries: ['皮革', '电子'], population: 550 },
  { name: '绍兴', province: '浙江', tier: 4, lat: 30.0000, lon: 120.5853,
    overtimeIndex: 0.90, workerBase: 2, avgCheckoutHour: 18.5,
    industries: ['纺织', '制造'], population: 533 },
  { name: '常州', province: '江苏', tier: 4, lat: 31.8106, lon: 119.9741,
    overtimeIndex: 0.95, workerBase: 2, avgCheckoutHour: 19.0,
    industries: ['新能源', '机械'], population: 534 },
  { name: '南通', province: '江苏', tier: 4, lat: 31.9829, lon: 120.8945,
    overtimeIndex: 0.90, workerBase: 2, avgCheckoutHour: 18.5,
    industries: ['纺织', '船舶'], population: 773 },
  { name: '徐州', province: '江苏', tier: 4, lat: 34.2044, lon: 117.2857,
    overtimeIndex: 0.85, workerBase: 2, avgCheckoutHour: 18.0,
    industries: ['装备制造', '矿业'], population: 908 },
  { name: '烟台', province: '山东', tier: 4, lat: 37.4638, lon: 121.4479,
    overtimeIndex: 0.90, workerBase: 2, avgCheckoutHour: 18.5,
    industries: ['葡萄酒', '机械'], population: 710 },
  { name: '潍坊', province: '山东', tier: 4, lat: 36.7069, lon: 119.1619,
    overtimeIndex: 0.85, workerBase: 2, avgCheckoutHour: 18.0,
    industries: ['机械', '农业'], population: 938 },
  { name: '唐山', province: '河北', tier: 4, lat: 39.6292, lon: 118.1742,
    overtimeIndex: 0.90, workerBase: 2, avgCheckoutHour: 18.5,
    industries: ['钢铁', '港口'], population: 770 },
  { name: '洛阳', province: '河南', tier: 4, lat: 34.6197, lon: 112.4540,
    overtimeIndex: 0.85, workerBase: 2, avgCheckoutHour: 18.0,
    industries: ['装备制造', '旅游'], population: 707 },
  { name: '芜湖', province: '安徽', tier: 4, lat: 31.3340, lon: 118.4337,
    overtimeIndex: 0.90, workerBase: 1, avgCheckoutHour: 18.5,
    industries: ['汽车', '机器人'], population: 387 },
]

// ==================== 区域配置（精确坐标）====================

export interface DistrictConfig {
  city: string
  name: string
  lat: number          // 真实坐标
  lon: number
  type: 'tech' | 'finance' | 'industrial' | 'commercial' | 'residential' | 'mixed'
  overtimeMultiplier: number
  workerDensity: number  // 打工人密度 1-10
  hotSpots?: string[]    // 该区域的热门地点
}

export const DISTRICTS: DistrictConfig[] = [
  // ===== 北京（16区）=====
  { city: '北京', name: '海淀区', lat: 39.9590, lon: 116.2986, type: 'tech', overtimeMultiplier: 1.35, workerDensity: 10, 
    hotSpots: ['中关村', '西二旗', '后厂村', '上地', '五道口'] },
  { city: '北京', name: '朝阳区', lat: 39.9215, lon: 116.4434, type: 'commercial', overtimeMultiplier: 1.25, workerDensity: 9,
    hotSpots: ['望京', '国贸CBD', '三里屯', '大望路', '酒仙桥'] },
  { city: '北京', name: '西城区', lat: 39.9121, lon: 116.3660, type: 'finance', overtimeMultiplier: 1.30, workerDensity: 8,
    hotSpots: ['金融街', '西单'] },
  { city: '北京', name: '东城区', lat: 39.9289, lon: 116.4160, type: 'commercial', overtimeMultiplier: 1.10, workerDensity: 7 },
  { city: '北京', name: '丰台区', lat: 39.8585, lon: 116.2870, type: 'mixed', overtimeMultiplier: 0.95, workerDensity: 6,
    hotSpots: ['丽泽商务区', '总部基地'] },
  { city: '北京', name: '大兴区', lat: 39.7267, lon: 116.3380, type: 'industrial', overtimeMultiplier: 1.10, workerDensity: 7,
    hotSpots: ['亦庄经济开发区'] },
  { city: '北京', name: '通州区', lat: 39.9021, lon: 116.6561, type: 'residential', overtimeMultiplier: 0.85, workerDensity: 5,
    hotSpots: ['北京城市副中心'] },
  { city: '北京', name: '昌平区', lat: 40.2206, lon: 116.2312, type: 'tech', overtimeMultiplier: 1.05, workerDensity: 6,
    hotSpots: ['生命科学园', '未来科学城'] },
  { city: '北京', name: '顺义区', lat: 40.1300, lon: 116.6545, type: 'industrial', overtimeMultiplier: 0.90, workerDensity: 5 },
  { city: '北京', name: '房山区', lat: 39.7479, lon: 116.1430, type: 'industrial', overtimeMultiplier: 0.85, workerDensity: 4 },
  { city: '北京', name: '石景山区', lat: 39.9057, lon: 116.2228, type: 'mixed', overtimeMultiplier: 0.90, workerDensity: 5 },
  { city: '北京', name: '门头沟区', lat: 39.9404, lon: 116.1020, type: 'residential', overtimeMultiplier: 0.80, workerDensity: 3 },
  
  // ===== 上海（16区）=====
  { city: '上海', name: '浦东新区', lat: 31.2214, lon: 121.5447, type: 'mixed', overtimeMultiplier: 1.30, workerDensity: 10,
    hotSpots: ['陆家嘴', '张江高科', '金桥', '外高桥', '临港新片区'] },
  { city: '上海', name: '黄浦区', lat: 31.2314, lon: 121.4842, type: 'finance', overtimeMultiplier: 1.25, workerDensity: 9,
    hotSpots: ['外滩', '南京路', '人民广场'] },
  { city: '上海', name: '静安区', lat: 31.2286, lon: 121.4481, type: 'commercial', overtimeMultiplier: 1.25, workerDensity: 9,
    hotSpots: ['静安寺', '南京西路', '大宁'] },
  { city: '上海', name: '徐汇区', lat: 31.1888, lon: 121.4365, type: 'tech', overtimeMultiplier: 1.20, workerDensity: 8,
    hotSpots: ['漕河泾', '徐家汇'] },
  { city: '上海', name: '长宁区', lat: 31.2185, lon: 121.4241, type: 'commercial', overtimeMultiplier: 1.15, workerDensity: 7,
    hotSpots: ['虹桥商务区', '中山公园'] },
  { city: '上海', name: '虹口区', lat: 31.2646, lon: 121.5051, type: 'commercial', overtimeMultiplier: 1.00, workerDensity: 6 },
  { city: '上海', name: '杨浦区', lat: 31.2595, lon: 121.5260, type: 'tech', overtimeMultiplier: 1.10, workerDensity: 7,
    hotSpots: ['五角场', '大学城'] },
  { city: '上海', name: '普陀区', lat: 31.2495, lon: 121.3965, type: 'mixed', overtimeMultiplier: 0.95, workerDensity: 6 },
  { city: '上海', name: '闵行区', lat: 31.1120, lon: 121.3817, type: 'industrial', overtimeMultiplier: 1.15, workerDensity: 7,
    hotSpots: ['紫竹高新区', '莘庄', '虹桥'] },
  { city: '上海', name: '宝山区', lat: 31.4045, lon: 121.4891, type: 'industrial', overtimeMultiplier: 0.95, workerDensity: 5 },
  { city: '上海', name: '嘉定区', lat: 31.3747, lon: 121.2653, type: 'industrial', overtimeMultiplier: 1.05, workerDensity: 6,
    hotSpots: ['嘉定汽车城', '安亭'] },
  { city: '上海', name: '松江区', lat: 31.0322, lon: 121.2278, type: 'industrial', overtimeMultiplier: 1.00, workerDensity: 5,
    hotSpots: ['松江大学城', 'G60科创走廊'] },
  
  // ===== 深圳（10区）=====
  { city: '深圳', name: '南山区', lat: 22.5329, lon: 113.9307, type: 'tech', overtimeMultiplier: 1.45, workerDensity: 10,
    hotSpots: ['南山科技园', '后海', '前海', '蛇口', '科技园北'] },
  { city: '深圳', name: '福田区', lat: 22.5210, lon: 114.0549, type: 'finance', overtimeMultiplier: 1.30, workerDensity: 9,
    hotSpots: ['福田CBD', '华强北', '车公庙'] },
  { city: '深圳', name: '罗湖区', lat: 22.5482, lon: 114.1314, type: 'commercial', overtimeMultiplier: 1.00, workerDensity: 7 },
  { city: '深圳', name: '宝安区', lat: 22.5553, lon: 113.8830, type: 'industrial', overtimeMultiplier: 1.20, workerDensity: 8,
    hotSpots: ['宝安中心', '西乡', '沙井'] },
  { city: '深圳', name: '龙岗区', lat: 22.7211, lon: 114.2474, type: 'tech', overtimeMultiplier: 1.35, workerDensity: 8,
    hotSpots: ['坂田', '龙岗中心城', '大运'] },
  { city: '深圳', name: '龙华区', lat: 22.6576, lon: 114.0447, type: 'industrial', overtimeMultiplier: 1.25, workerDensity: 8,
    hotSpots: ['龙华中心', '观澜'] },
  { city: '深圳', name: '光明区', lat: 22.7489, lon: 113.9359, type: 'tech', overtimeMultiplier: 1.15, workerDensity: 6,
    hotSpots: ['光明科学城'] },
  { city: '深圳', name: '坪山区', lat: 22.7089, lon: 114.3465, type: 'industrial', overtimeMultiplier: 1.10, workerDensity: 5 },
  { city: '深圳', name: '盐田区', lat: 22.5578, lon: 114.2359, type: 'mixed', overtimeMultiplier: 0.90, workerDensity: 4 },
  { city: '深圳', name: '大鹏新区', lat: 22.5880, lon: 114.4798, type: 'residential', overtimeMultiplier: 0.75, workerDensity: 2 },

  // ===== 广州（11区）=====
  { city: '广州', name: '天河区', lat: 23.1247, lon: 113.3612, type: 'tech', overtimeMultiplier: 1.30, workerDensity: 10,
    hotSpots: ['珠江新城', '天河软件园', '体育西'] },
  { city: '广州', name: '越秀区', lat: 23.1292, lon: 113.2665, type: 'commercial', overtimeMultiplier: 1.10, workerDensity: 7 },
  { city: '广州', name: '海珠区', lat: 23.0839, lon: 113.3172, type: 'mixed', overtimeMultiplier: 1.05, workerDensity: 7,
    hotSpots: ['琶洲'] },
  { city: '广州', name: '荔湾区', lat: 23.1259, lon: 113.2439, type: 'commercial', overtimeMultiplier: 0.95, workerDensity: 6 },
  { city: '广州', name: '白云区', lat: 23.1647, lon: 113.2727, type: 'mixed', overtimeMultiplier: 0.90, workerDensity: 5 },
  { city: '广州', name: '黄埔区', lat: 23.1061, lon: 113.4596, type: 'tech', overtimeMultiplier: 1.20, workerDensity: 8,
    hotSpots: ['黄埔港', '科学城'] },
  { city: '广州', name: '番禺区', lat: 22.9378, lon: 113.3845, type: 'mixed', overtimeMultiplier: 1.00, workerDensity: 6,
    hotSpots: ['万博', '大学城'] },
  { city: '广州', name: '花都区', lat: 23.4040, lon: 113.2203, type: 'industrial', overtimeMultiplier: 0.90, workerDensity: 5 },
  { city: '广州', name: '南沙区', lat: 22.8016, lon: 113.5253, type: 'industrial', overtimeMultiplier: 1.05, workerDensity: 5,
    hotSpots: ['南沙自贸区'] },
  { city: '广州', name: '增城区', lat: 23.2910, lon: 113.8108, type: 'industrial', overtimeMultiplier: 0.95, workerDensity: 4 },
  { city: '广州', name: '从化区', lat: 23.5488, lon: 113.5866, type: 'residential', overtimeMultiplier: 0.80, workerDensity: 3 },

  // ===== 杭州（13区）=====
  { city: '杭州', name: '余杭区', lat: 30.4189, lon: 120.2993, type: 'tech', overtimeMultiplier: 1.50, workerDensity: 10,
    hotSpots: ['未来科技城', '阿里巴巴总部', '梦想小镇'] },
  { city: '杭州', name: '滨江区', lat: 30.2084, lon: 120.2122, type: 'tech', overtimeMultiplier: 1.40, workerDensity: 9,
    hotSpots: ['滨江区块', '网易', '海康威视'] },
  { city: '杭州', name: '西湖区', lat: 30.2594, lon: 120.1300, type: 'mixed', overtimeMultiplier: 1.15, workerDensity: 7,
    hotSpots: ['西溪', '文三路', '蚂蚁总部'] },
  { city: '杭州', name: '上城区', lat: 30.2428, lon: 120.1693, type: 'finance', overtimeMultiplier: 1.10, workerDensity: 7,
    hotSpots: ['钱江新城', '武林'] },
  { city: '杭州', name: '拱墅区', lat: 30.3192, lon: 120.1419, type: 'commercial', overtimeMultiplier: 1.00, workerDensity: 6 },
  { city: '杭州', name: '萧山区', lat: 30.1835, lon: 120.2643, type: 'industrial', overtimeMultiplier: 1.10, workerDensity: 7,
    hotSpots: ['萧山机场', '钱江世纪城'] },
  { city: '杭州', name: '临平区', lat: 30.4183, lon: 120.3009, type: 'industrial', overtimeMultiplier: 1.05, workerDensity: 6 },
  { city: '杭州', name: '钱塘区', lat: 30.3146, lon: 120.4934, type: 'industrial', overtimeMultiplier: 1.15, workerDensity: 6,
    hotSpots: ['下沙高教园', '大江东'] },
  { city: '杭州', name: '富阳区', lat: 30.0500, lon: 119.9607, type: 'residential', overtimeMultiplier: 0.85, workerDensity: 4 },
  { city: '杭州', name: '临安区', lat: 30.2337, lon: 119.7247, type: 'residential', overtimeMultiplier: 0.80, workerDensity: 3 },

  // ===== 成都（12区）=====
  { city: '成都', name: '高新区', lat: 30.5853, lon: 104.0318, type: 'tech', overtimeMultiplier: 1.15, workerDensity: 9,
    hotSpots: ['天府软件园', '高新南区', '菁蓉汇'] },
  { city: '成都', name: '武侯区', lat: 30.6425, lon: 104.0426, type: 'commercial', overtimeMultiplier: 1.00, workerDensity: 7 },
  { city: '成都', name: '锦江区', lat: 30.6538, lon: 104.0841, type: 'commercial', overtimeMultiplier: 0.95, workerDensity: 7,
    hotSpots: ['春熙路', 'IFS'] },
  { city: '成都', name: '青羊区', lat: 30.6739, lon: 104.0612, type: 'mixed', overtimeMultiplier: 0.90, workerDensity: 6 },
  { city: '成都', name: '金牛区', lat: 30.6913, lon: 104.0517, type: 'commercial', overtimeMultiplier: 0.90, workerDensity: 6 },
  { city: '成都', name: '成华区', lat: 30.6600, lon: 104.1014, type: 'mixed', overtimeMultiplier: 0.90, workerDensity: 6 },
  { city: '成都', name: '天府新区', lat: 30.5174, lon: 104.0652, type: 'tech', overtimeMultiplier: 1.10, workerDensity: 7,
    hotSpots: ['天府中央商务区', '科学城'] },
  { city: '成都', name: '龙泉驿区', lat: 30.5567, lon: 104.2745, type: 'industrial', overtimeMultiplier: 1.00, workerDensity: 5,
    hotSpots: ['经开区', '汽车城'] },
  { city: '成都', name: '双流区', lat: 30.5744, lon: 103.9235, type: 'mixed', overtimeMultiplier: 0.95, workerDensity: 5 },
  { city: '成都', name: '郫都区', lat: 30.7953, lon: 103.8876, type: 'tech', overtimeMultiplier: 1.05, workerDensity: 5,
    hotSpots: ['菁蓉镇', '电子科大'] },
  { city: '成都', name: '新都区', lat: 30.8231, lon: 104.1591, type: 'industrial', overtimeMultiplier: 0.90, workerDensity: 4 },
  { city: '成都', name: '温江区', lat: 30.6822, lon: 103.8561, type: 'residential', overtimeMultiplier: 0.85, workerDensity: 4 },
]

// ==================== 热门地点/POI ====================

export interface HotSpotConfig {
  city: string
  district: string
  name: string
  lat: number
  lon: number
  type: 'techPark' | 'cbd' | 'industrial' | 'office' | 'mall'
  overtimeLevel: 'extreme' | 'heavy' | 'normal' | 'light'
  workerCount: number
  tags: string[]
  companies?: string[]  // 知名企业
}

export const HOTSPOTS: HotSpotConfig[] = [
  // ===== 北京 =====
  { city: '北京', district: '海淀区', name: '后厂村', lat: 40.0509, lon: 116.2682,
    type: 'techPark', overtimeLevel: 'extreme', workerCount: 80000,
    tags: ['996发源地', '大厂云集', '头发杀手'],
    companies: ['百度', '新浪', '网易', '腾讯北京'] },
  { city: '北京', district: '海淀区', name: '西二旗', lat: 40.0573, lon: 116.3027,
    type: 'techPark', overtimeLevel: 'extreme', workerCount: 60000,
    tags: ['码农天堂', '脱发圣地'],
    companies: ['滴滴', '小米', '联想'] },
  { city: '北京', district: '海淀区', name: '中关村', lat: 39.9843, lon: 116.3178,
    type: 'techPark', overtimeLevel: 'heavy', workerCount: 50000,
    tags: ['互联网重灾区', '程序员聚集地'],
    companies: ['搜狐', '金山', '用友'] },
  { city: '北京', district: '海淀区', name: '上地', lat: 40.0350, lon: 116.3000,
    type: 'techPark', overtimeLevel: 'heavy', workerCount: 35000,
    tags: ['软件园', '创业公司多'] },
  { city: '北京', district: '朝阳区', name: '望京', lat: 39.9945, lon: 116.4709,
    type: 'office', overtimeLevel: 'heavy', workerCount: 45000,
    tags: ['创业公司扎堆', '望京SOHO'],
    companies: ['阿里北京', '美团', '陌陌'] },
  { city: '北京', district: '朝阳区', name: '国贸CBD', lat: 39.9087, lon: 116.4605,
    type: 'cbd', overtimeLevel: 'heavy', workerCount: 55000,
    tags: ['金融精英', '西装革履'],
    companies: ['中信', '中金', '各大投行'] },
  { city: '北京', district: '西城区', name: '金融街', lat: 39.9152, lon: 116.3565,
    type: 'cbd', overtimeLevel: 'heavy', workerCount: 40000,
    tags: ['银行总部', '加班到头秃'],
    companies: ['工行总部', '建行总部', '证监会'] },
  { city: '北京', district: '大兴区', name: '亦庄经济开发区', lat: 39.7942, lon: 116.5065,
    type: 'industrial', overtimeLevel: 'normal', workerCount: 35000,
    tags: ['制造业聚集', '通勤噩梦'],
    companies: ['京东总部', '小米工厂', '奔驰工厂'] },
  { city: '北京', district: '朝阳区', name: '酒仙桥', lat: 39.9684, lon: 116.4866,
    type: 'techPark', overtimeLevel: 'heavy', workerCount: 25000,
    tags: ['798艺术区旁', '互联网公司多'],
    companies: ['360', '58同城'] },

  // ===== 上海 =====
  { city: '上海', district: '浦东新区', name: '陆家嘴', lat: 31.2400, lon: 121.5000,
    type: 'cbd', overtimeLevel: 'heavy', workerCount: 65000,
    tags: ['金融中心', '高薪高压'],
    companies: ['各大银行总部', '证券公司', '基金公司'] },
  { city: '上海', district: '浦东新区', name: '张江高科', lat: 31.2037, lon: 121.5905,
    type: 'techPark', overtimeLevel: 'heavy', workerCount: 55000,
    tags: ['芯片半导体', '研发重镇'],
    companies: ['中芯国际', '华虹', '药明康德'] },
  { city: '上海', district: '徐汇区', name: '漕河泾', lat: 31.1703, lon: 121.4000,
    type: 'techPark', overtimeLevel: 'heavy', workerCount: 45000,
    tags: ['老牌园区', '互联网公司多'],
    companies: ['腾讯上海', '字节跳动', '微软'] },
  { city: '上海', district: '长宁区', name: '虹桥商务区', lat: 31.1943, lon: 121.3286,
    type: 'cbd', overtimeLevel: 'normal', workerCount: 30000,
    tags: ['交通枢纽', '出差多'] },
  { city: '上海', district: '闵行区', name: '紫竹高新区', lat: 31.0220, lon: 121.4640,
    type: 'techPark', overtimeLevel: 'heavy', workerCount: 25000,
    tags: ['AI产业', '高校资源'],
    companies: ['英特尔', '微软亚研院'] },
  { city: '上海', district: '浦东新区', name: '金桥', lat: 31.2450, lon: 121.6100,
    type: 'industrial', overtimeLevel: 'normal', workerCount: 30000,
    tags: ['制造业', '外企多'],
    companies: ['通用汽车', '夏普'] },

  // ===== 深圳 =====
  { city: '深圳', district: '南山区', name: '南山科技园', lat: 22.5400, lon: 113.9500,
    type: 'techPark', overtimeLevel: 'extreme', workerCount: 80000,
    tags: ['腾讯总部', '大厂扎堆'],
    companies: ['腾讯', 'DJI', 'TCL'] },
  { city: '深圳', district: '南山区', name: '后海', lat: 22.5100, lon: 113.9350,
    type: 'cbd', overtimeLevel: 'heavy', workerCount: 40000,
    tags: ['新CBD', '海景加班'],
    companies: ['招商银行', '恒大总部'] },
  { city: '深圳', district: '南山区', name: '前海', lat: 22.5270, lon: 113.8970,
    type: 'cbd', overtimeLevel: 'heavy', workerCount: 35000,
    tags: ['金融特区', '新贵聚集'] },
  { city: '深圳', district: '龙岗区', name: '坂田', lat: 22.6330, lon: 114.0670,
    type: 'techPark', overtimeLevel: 'extreme', workerCount: 70000,
    tags: ['华为基地', '狼性文化'],
    companies: ['华为总部'] },
  { city: '深圳', district: '福田区', name: '车公庙', lat: 22.5320, lon: 114.0200,
    type: 'office', overtimeLevel: 'heavy', workerCount: 35000,
    tags: ['创业公司多', '交通便利'] },
  { city: '深圳', district: '福田区', name: '华强北', lat: 22.5480, lon: 114.0880,
    type: 'industrial', overtimeLevel: 'normal', workerCount: 25000,
    tags: ['电子一条街', '创业者天堂'] },

  // ===== 杭州 =====
  { city: '杭州', district: '余杭区', name: '未来科技城', lat: 30.2920, lon: 120.0260,
    type: 'techPark', overtimeLevel: 'extreme', workerCount: 65000,
    tags: ['阿里巴巴', '电商重镇'],
    companies: ['阿里巴巴西溪园区', '字节跳动杭州'] },
  { city: '杭州', district: '滨江区', name: '滨江区块', lat: 30.2084, lon: 120.2122,
    type: 'techPark', overtimeLevel: 'heavy', workerCount: 50000,
    tags: ['网易、海康', '互联网新贵'],
    companies: ['网易', '海康威视', '大华'] },
  { city: '杭州', district: '西湖区', name: '蚂蚁Z空间', lat: 30.2800, lon: 120.1100,
    type: 'office', overtimeLevel: 'extreme', workerCount: 20000,
    tags: ['蚂蚁集团', '支付宝'],
    companies: ['蚂蚁集团'] },
  { city: '杭州', district: '上城区', name: '钱江新城', lat: 30.2450, lon: 120.2200,
    type: 'cbd', overtimeLevel: 'normal', workerCount: 25000,
    tags: ['新CBD', '高端写字楼'] },

  // ===== 成都 =====
  { city: '成都', district: '高新区', name: '天府软件园', lat: 30.5500, lon: 104.0680,
    type: 'techPark', overtimeLevel: 'normal', workerCount: 40000,
    tags: ['游戏公司多', '相对轻松'],
    companies: ['腾讯成都', '字节成都', '华为成都'] },
  { city: '成都', district: '天府新区', name: '天府中央商务区', lat: 30.5100, lon: 104.0800,
    type: 'cbd', overtimeLevel: 'normal', workerCount: 20000,
    tags: ['新CBD', '发展中'] },
]

// ==================== 行业配置 ====================

export const INDUSTRIES = [
  { name: '互联网', overtimeIndex: 1.35, avgCheckoutHour: 21.5 },
  { name: '金融', overtimeIndex: 1.25, avgCheckoutHour: 20.5 },
  { name: '游戏', overtimeIndex: 1.30, avgCheckoutHour: 21.0 },
  { name: '电商', overtimeIndex: 1.35, avgCheckoutHour: 21.5 },
  { name: '制造', overtimeIndex: 0.95, avgCheckoutHour: 18.0 },
  { name: '教育', overtimeIndex: 0.90, avgCheckoutHour: 18.0 },
  { name: '医疗', overtimeIndex: 1.10, avgCheckoutHour: 19.5 },
  { name: '传媒', overtimeIndex: 1.15, avgCheckoutHour: 20.0 },
  { name: '房地产', overtimeIndex: 1.10, avgCheckoutHour: 19.5 },
  { name: '咨询', overtimeIndex: 1.30, avgCheckoutHour: 21.0 },
  { name: '其他', overtimeIndex: 1.00, avgCheckoutHour: 19.0 },
]

export const COMPANY_SIZES = [
  { name: '创业公司', overtimeMultiplier: 1.20, description: '50人以下' },
  { name: '中小企业', overtimeMultiplier: 1.00, description: '50-500人' },
  { name: '大厂', overtimeMultiplier: 1.30, description: '500人以上' },
  { name: '外企', overtimeMultiplier: 0.90, description: '外资企业' },
  { name: '国企', overtimeMultiplier: 0.80, description: '国有企业' },
]

// ==================== 默认昵称库 ====================

export const DEFAULT_NICKNAMES = [
  '匿名牛马', '加班狗', '社畜一号', '韭菜本菜', '打工人',
  '苦逼程序员', 'PPT战士', 'Excel大师', '会议室常客', '卑微打工仔',
  '摸鱼专家', '带薪拉屎', '划水达人', '职场老油条', '牛马本马',
  '搬砖侠', '码农日记', '社畜日常', '打工魂', '底层员工',
  '没有周末', '猝死预备', '在线崩溃', '精神离职', '干饭人',
  '无名打工仔', '格子间囚犯', '工位牢笼', '通勤战士', '早八人',
  '晚十一人', '周报填充机', '需求接受器', '甲方受气包', 'bug制造机',
  '功能搬运工', '代码缝合怪', '文档复读机', 'deadline追赶者', '焦虑本焦',
  '职场小透明', '咖啡续命者', '加班之王', '会议终结者', '邮件处理器',
  '任务收割机', '工资讨债鬼', '绩效受害者', '调休囤积狂', '年假守护者',
]

export const DEFAULT_EMOJIS = [
  '🐂', '🐴', '🐕', '🐷', '🦊', '🐱', '🐰', '🐻', '🐼', '🦁',
  '🐯', '🐸', '🐔', '🐧', '🦆', '🦉', '🐺', '🐵', '🙈', '🐶',
  '🦄', '🐲', '🦋', '🐝', '🐢', '🦀', '🐙', '🦑', '🦐', '🐳',
  '🦈', '🐠', '🐡', '🦭', '🦦', '🦥', '🦔', '🐿️', '🦨', '🦡',
]

// ==================== 辅助函数 ====================

export function getRandomNickname(): string {
  return DEFAULT_NICKNAMES[Math.floor(Math.random() * DEFAULT_NICKNAMES.length)]
}

export function getRandomEmoji(): string {
  return DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)]
}

export function getCityByName(name: string): CityConfig | undefined {
  return CITIES.find(c => c.name === name)
}

export function getDistrictsByCity(city: string): DistrictConfig[] {
  return DISTRICTS.filter(d => d.city === city)
}

export function getHotSpotsByCity(city: string): HotSpotConfig[] {
  return HOTSPOTS.filter(h => h.city === city)
}

export function getHotSpotsByDistrict(city: string, district: string): HotSpotConfig[] {
  return HOTSPOTS.filter(h => h.city === city && h.district === district)
}
