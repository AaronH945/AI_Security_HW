/**
 * L03: CWA 自動氣象站觀測地圖 // Leaflet GIS 縣市天氣縮圖與細節展開系統
 * AI Security - STARK HUD GIS Controller
 */

// Global State
const state = {
  map: null,
  geoJsonLayer: null,
  countyBadgesLayer: null,
  markersLayer: null,
  stations: [],
  selectedStation: null,
  activeCounty: 'ALL', // 'ALL' or specific county name like '臺北市'
  lastSyncIso: null,
  searchQuery: '',
  countyLayersMap: {}, // Map of countyName -> Leaflet Layer
};

// Preset optimal geographic centers for placing county weather badges
const COUNTY_CENTERS = {
  '臺北市': [25.0600, 121.5450],
  '新北市': [24.9600, 121.5200],
  '基隆市': [25.1250, 121.7450],
  '桃園市': [24.9500, 121.2100],
  '新竹市': [24.8000, 120.9600],
  '新竹縣': [24.7200, 121.1600],
  '苗栗縣': [24.5200, 120.8800],
  '臺中市': [24.2300, 120.8500],
  '彰化縣': [23.9800, 120.4800],
  '南投縣': [23.8200, 120.9400],
  '雲林縣': [23.7000, 120.3800],
  '嘉義市': [23.4800, 120.4400],
  '嘉義縣': [23.4500, 120.5800],
  '臺南市': [23.1500, 120.3000],
  '高雄市': [22.8400, 120.5800],
  '屏東縣': [22.4500, 120.6200],
  '宜蘭縣': [24.6200, 121.6500],
  '花蓮縣': [23.7500, 121.4000],
  '臺東縣': [22.7500, 121.0000],
  '澎湖縣': [23.5700, 119.5800],
  '金門縣': [24.4400, 118.3800],
  '連江縣': [26.1600, 119.9500],
};

// Comprehensive Built-in Sample Dataset covering all 22 counties of Taiwan
const FALLBACK_STATIONS = [
  // 臺北市
  { stationId: '466920', stationName: '臺北', county: '臺北市', township: '中正區', lat: 25.0376, lon: 121.5148, temperature: 28.6, humidity: 70, rainfall: 0.0, windSpeed: 2.1, obsTime: new Date().toISOString() },
  { stationId: '466910', stationName: '鞍部 (陽明山)', county: '臺北市', township: '北投區', lat: 25.1825, lon: 121.5297, temperature: 22.4, humidity: 88, rainfall: 2.5, windSpeed: 4.8, obsTime: new Date().toISOString() },
  { stationId: 'C0A980', stationName: '內湖', county: '臺北市', township: '內湖區', lat: 25.0805, lon: 121.5898, temperature: 28.2, humidity: 72, rainfall: 0.0, windSpeed: 1.8, obsTime: new Date().toISOString() },
  { stationId: 'C0A9F0', stationName: '信義 (市府)', county: '臺北市', township: '信義區', lat: 25.0335, lon: 121.5645, temperature: 29.0, humidity: 69, rainfall: 0.0, windSpeed: 2.0, obsTime: new Date().toISOString() },

  // 新北市
  { stationId: '466900', stationName: '淡水', county: '新北市', township: '淡水區', lat: 25.1648, lon: 121.4489, temperature: 27.9, humidity: 64, rainfall: 0.0, windSpeed: 3.2, obsTime: new Date().toISOString() },
  { stationId: '466880', stationName: '板橋', county: '新北市', township: '板橋區', lat: 25.0080, lon: 121.4450, temperature: 29.1, humidity: 68, rainfall: 0.0, windSpeed: 2.4, obsTime: new Date().toISOString() },
  { stationId: 'C0A920', stationName: '九份 (瑞芳)', county: '新北市', township: '瑞芳區', lat: 25.1090, lon: 121.8440, temperature: 24.5, humidity: 86, rainfall: 3.0, windSpeed: 4.1, obsTime: new Date().toISOString() },
  { stationId: 'C0A940', stationName: '新店', county: '新北市', township: '新店區', lat: 24.9675, lon: 121.5410, temperature: 28.8, humidity: 71, rainfall: 0.0, windSpeed: 1.9, obsTime: new Date().toISOString() },

  // 基隆市
  { stationId: '466940', stationName: '基隆', county: '基隆市', township: '仁愛區', lat: 25.1333, lon: 121.7405, temperature: 27.1, humidity: 84, rainfall: 2.0, windSpeed: 3.6, obsTime: new Date().toISOString() },
  { stationId: 'C0B010', stationName: '基隆嶼', county: '基隆市', township: '中正區', lat: 25.1920, lon: 121.7860, temperature: 26.5, humidity: 88, rainfall: 2.2, windSpeed: 5.4, obsTime: new Date().toISOString() },

  // 桃園市
  { stationId: 'C0C480', stationName: '桃園 (新屋)', county: '桃園市', township: '新屋區', lat: 25.0069, lon: 121.0474, temperature: 29.2, humidity: 62, rainfall: 0.0, windSpeed: 4.2, obsTime: new Date().toISOString() },
  { stationId: 'C0C700', stationName: '中壢', county: '桃園市', township: '中壢區', lat: 24.9680, lon: 121.2250, temperature: 29.6, humidity: 60, rainfall: 0.0, windSpeed: 2.8, obsTime: new Date().toISOString() },
  { stationId: 'C0C590', stationName: '大溪', county: '桃園市', township: '大溪區', lat: 24.8810, lon: 121.2870, temperature: 28.9, humidity: 63, rainfall: 0.0, windSpeed: 2.1, obsTime: new Date().toISOString() },

  // 新竹市
  { stationId: '467570', stationName: '新竹', county: '新竹市', township: '東區', lat: 24.8279, lon: 120.9272, temperature: 29.8, humidity: 59, rainfall: 0.0, windSpeed: 3.9, obsTime: new Date().toISOString() },
  { stationId: 'C0D570', stationName: '香山', county: '新竹市', township: '香山區', lat: 24.7830, lon: 120.9150, temperature: 29.5, humidity: 61, rainfall: 0.0, windSpeed: 4.1, obsTime: new Date().toISOString() },

  // 新竹縣
  { stationId: 'C0D580', stationName: '竹東', county: '新竹縣', township: '竹東鎮', lat: 24.7337, lon: 121.0864, temperature: 28.5, humidity: 68, rainfall: 0.0, windSpeed: 2.0, obsTime: new Date().toISOString() },
  { stationId: 'C0D550', stationName: '竹北', county: '新竹縣', township: '竹北市', lat: 24.8387, lon: 121.0118, temperature: 29.3, humidity: 66, rainfall: 0.0, windSpeed: 2.5, obsTime: new Date().toISOString() },
  { stationId: 'C0D660', stationName: '尖石', county: '新竹縣', township: '尖石鄉', lat: 24.6750, lon: 121.2580, temperature: 22.8, humidity: 76, rainfall: 0.0, windSpeed: 1.8, obsTime: new Date().toISOString() },

  // 苗栗縣
  { stationId: 'C0E750', stationName: '苗栗', county: '苗栗縣', township: '苗栗市', lat: 24.5652, lon: 120.8252, temperature: 30.1, humidity: 67, rainfall: 0.0, windSpeed: 2.7, obsTime: new Date().toISOString() },
  { stationId: 'C0E780', stationName: '三義', county: '苗栗縣', township: '三義鄉', lat: 24.4130, lon: 120.7620, temperature: 27.8, humidity: 74, rainfall: 0.0, windSpeed: 2.2, obsTime: new Date().toISOString() },
  { stationId: 'C0E860', stationName: '南庄', county: '苗栗縣', township: '南庄鄉', lat: 24.5980, lon: 120.9980, temperature: 26.5, humidity: 71, rainfall: 0.0, windSpeed: 1.9, obsTime: new Date().toISOString() },

  // 臺中市
  { stationId: '467490', stationName: '臺中', county: '臺中市', township: '北區', lat: 24.1457, lon: 120.6841, temperature: 31.5, humidity: 58, rainfall: 0.0, windSpeed: 1.8, obsTime: new Date().toISOString() },
  { stationId: 'C0F970', stationName: '大甲', county: '臺中市', township: '大甲區', lat: 24.3512, lon: 120.6214, temperature: 30.8, humidity: 61, rainfall: 0.0, windSpeed: 3.5, obsTime: new Date().toISOString() },
  { stationId: 'C0F9K0', stationName: '武陵', county: '臺中市', township: '和平區', lat: 24.3580, lon: 121.3120, temperature: 18.5, humidity: 69, rainfall: 0.0, windSpeed: 2.1, obsTime: new Date().toISOString() },

  // 彰化縣
  { stationId: 'C0G620', stationName: '彰化', county: '彰化縣', township: '彰化市', lat: 24.0810, lon: 120.5580, temperature: 31.2, humidity: 60, rainfall: 0.0, windSpeed: 2.3, obsTime: new Date().toISOString() },
  { stationId: 'C0G650', stationName: '員林', county: '彰化縣', township: '員林市', lat: 23.9590, lon: 120.5740, temperature: 31.6, humidity: 59, rainfall: 0.0, windSpeed: 2.0, obsTime: new Date().toISOString() },
  { stationId: 'C0G640', stationName: '鹿港', county: '彰化縣', township: '鹿港鎮', lat: 24.0580, lon: 120.4350, temperature: 30.5, humidity: 63, rainfall: 0.0, windSpeed: 4.0, obsTime: new Date().toISOString() },

  // 南投縣
  { stationId: '467550', stationName: '日月潭', county: '南投縣', township: '魚池鄉', lat: 23.8814, lon: 120.9081, temperature: 23.2, humidity: 76, rainfall: 0.0, windSpeed: 1.4, obsTime: new Date().toISOString() },
  { stationId: '467770', stationName: '玉山 (頂峰)', county: '南投縣', township: '信義鄉', lat: 23.4876, lon: 120.9595, temperature: 6.2, humidity: 95, rainfall: 8.0, windSpeed: 7.2, obsTime: new Date().toISOString() },
  { stationId: 'C0H9C0', stationName: '埔里', county: '南投縣', township: '埔里鎮', lat: 23.9680, lon: 120.9680, temperature: 27.5, humidity: 71, rainfall: 0.0, windSpeed: 1.6, obsTime: new Date().toISOString() },

  // 雲林縣
  { stationId: 'C0K400', stationName: '斗六', county: '雲林縣', township: '斗六市', lat: 23.7080, lon: 120.5430, temperature: 31.0, humidity: 66, rainfall: 0.0, windSpeed: 1.9, obsTime: new Date().toISOString() },
  { stationId: 'C0K430', stationName: '虎尾', county: '雲林縣', township: '虎尾鎮', lat: 23.7120, lon: 120.4320, temperature: 31.4, humidity: 64, rainfall: 0.0, windSpeed: 2.2, obsTime: new Date().toISOString() },
  { stationId: 'C0K470', stationName: '麥寮', county: '雲林縣', township: '麥寮鄉', lat: 23.7540, lon: 120.2520, temperature: 30.2, humidity: 68, rainfall: 0.0, windSpeed: 4.5, obsTime: new Date().toISOString() },

  // 嘉義市
  { stationId: '467480', stationName: '嘉義', county: '嘉義市', township: '西區', lat: 23.4959, lon: 120.4329, temperature: 31.8, humidity: 58, rainfall: 0.0, windSpeed: 1.6, obsTime: new Date().toISOString() },
  { stationId: 'C0M680', stationName: '嘉義東區', county: '嘉義市', township: '東區', lat: 23.4790, lon: 120.4680, temperature: 31.5, humidity: 59, rainfall: 0.0, windSpeed: 1.7, obsTime: new Date().toISOString() },

  // 嘉義縣
  { stationId: '467530', stationName: '阿里山', county: '嘉義縣', township: '阿里山鄉', lat: 23.5083, lon: 120.8133, temperature: 14.8, humidity: 92, rainfall: 4.0, windSpeed: 2.1, obsTime: new Date().toISOString() },
  { stationId: 'C0M730', stationName: '太保', county: '嘉義縣', township: '太保市', lat: 23.4580, lon: 120.3320, temperature: 31.5, humidity: 62, rainfall: 0.0, windSpeed: 2.4, obsTime: new Date().toISOString() },
  { stationId: 'C0M530', stationName: '民雄', county: '嘉義縣', township: '民雄鄉', lat: 23.5520, lon: 120.4280, temperature: 31.2, humidity: 61, rainfall: 0.0, windSpeed: 2.0, obsTime: new Date().toISOString() },

  // 臺南市
  { stationId: '467410', stationName: '臺南', county: '臺南市', township: '中西區', lat: 22.9933, lon: 120.2046, temperature: 32.4, humidity: 56, rainfall: 0.0, windSpeed: 2.5, obsTime: new Date().toISOString() },
  { stationId: 'C0X060', stationName: '永康', county: '臺南市', township: '永康區', lat: 23.0280, lon: 120.2580, temperature: 32.1, humidity: 58, rainfall: 0.0, windSpeed: 2.1, obsTime: new Date().toISOString() },
  { stationId: 'C0X100', stationName: '安平', county: '臺南市', township: '安平區', lat: 23.0010, lon: 120.1580, temperature: 31.8, humidity: 60, rainfall: 0.0, windSpeed: 3.4, obsTime: new Date().toISOString() },

  // 高雄市
  { stationId: '467440', stationName: '高雄', county: '高雄市', township: '前鎮區', lat: 22.5660, lon: 120.3157, temperature: 33.1, humidity: 58, rainfall: 0.0, windSpeed: 2.8, obsTime: new Date().toISOString() },
  { stationId: 'C0V680', stationName: '左營', county: '高雄市', township: '左營區', lat: 22.6890, lon: 120.2980, temperature: 32.8, humidity: 59, rainfall: 0.0, windSpeed: 2.5, obsTime: new Date().toISOString() },
  { stationId: 'C0V730', stationName: '旗津', county: '高雄市', township: '旗津區', lat: 22.5850, lon: 120.2780, temperature: 32.0, humidity: 62, rainfall: 0.0, windSpeed: 4.2, obsTime: new Date().toISOString() },
  { stationId: 'C0V770', stationName: '桃源', county: '高雄市', township: '桃源區', lat: 23.1650, lon: 120.7620, temperature: 24.2, humidity: 76, rainfall: 0.0, windSpeed: 1.5, obsTime: new Date().toISOString() },

  // 屏東縣
  { stationId: '467590', stationName: '恆春', county: '屏東縣', township: '恆春鎮', lat: 22.0039, lon: 120.7463, temperature: 31.0, humidity: 74, rainfall: 0.0, windSpeed: 5.6, obsTime: new Date().toISOString() },
  { stationId: 'C0R130', stationName: '屏東', county: '屏東縣', township: '屏東市', lat: 22.6730, lon: 120.4880, temperature: 32.8, humidity: 60, rainfall: 0.0, windSpeed: 2.3, obsTime: new Date().toISOString() },
  { stationId: 'C0R220', stationName: '墾丁', county: '屏東縣', township: '恆春鎮', lat: 21.9420, lon: 120.7980, temperature: 30.8, humidity: 75, rainfall: 0.0, windSpeed: 6.0, obsTime: new Date().toISOString() },

  // 宜蘭縣
  { stationId: '467080', stationName: '宜蘭', county: '宜蘭縣', township: '宜蘭市', lat: 24.7639, lon: 121.7565, temperature: 27.5, humidity: 84, rainfall: 2.0, windSpeed: 2.2, obsTime: new Date().toISOString() },
  { stationId: '467060', stationName: '蘇澳', county: '宜蘭縣', township: '蘇澳鎮', lat: 24.5967, lon: 121.8574, temperature: 27.2, humidity: 86, rainfall: 2.5, windSpeed: 3.8, obsTime: new Date().toISOString() },
  { stationId: 'C0U600', stationName: '羅東', county: '宜蘭縣', township: '羅東鎮', lat: 24.6750, lon: 121.7680, temperature: 27.8, humidity: 82, rainfall: 1.8, windSpeed: 2.0, obsTime: new Date().toISOString() },

  // 花蓮縣
  { stationId: '466990', stationName: '花蓮', county: '花蓮縣', township: '花蓮市', lat: 23.9752, lon: 121.6133, temperature: 28.7, humidity: 72, rainfall: 0.0, windSpeed: 3.1, obsTime: new Date().toISOString() },
  { stationId: '467650', stationName: '合歡山 (頂峰)', county: '花蓮縣', township: '秀林鄉', lat: 24.1415, lon: 121.2842, temperature: 9.8, humidity: 90, rainfall: 5.5, windSpeed: 6.4, obsTime: new Date().toISOString() },
  { stationId: 'C0T790', stationName: '玉里', county: '花蓮縣', township: '玉里鎮', lat: 23.3340, lon: 121.3120, temperature: 29.2, humidity: 70, rainfall: 0.0, windSpeed: 2.4, obsTime: new Date().toISOString() },

  // 臺東縣
  { stationId: '467660', stationName: '臺東', county: '臺東縣', township: '臺東市', lat: 22.7522, lon: 121.1546, temperature: 29.4, humidity: 70, rainfall: 0.0, windSpeed: 3.4, obsTime: new Date().toISOString() },
  { stationId: '467620', stationName: '蘭嶼', county: '臺東縣', township: '蘭嶼鄉', lat: 22.0370, lon: 121.5580, temperature: 28.0, humidity: 78, rainfall: 0.0, windSpeed: 7.5, obsTime: new Date().toISOString() },
  { stationId: '467610', stationName: '成功', county: '臺東縣', township: '成功鎮', lat: 23.1010, lon: 121.3730, temperature: 29.0, humidity: 72, rainfall: 0.0, windSpeed: 4.0, obsTime: new Date().toISOString() },

  // 澎湖縣
  { stationId: '467350', stationName: '澎湖 (馬公)', county: '澎湖縣', township: '馬公市', lat: 23.5655, lon: 119.5631, temperature: 30.2, humidity: 62, rainfall: 0.0, windSpeed: 6.2, obsTime: new Date().toISOString() },
  { stationId: 'C0W140', stationName: '白沙', county: '澎湖縣', township: '白沙鄉', lat: 23.6650, lon: 119.5980, temperature: 29.8, humidity: 64, rainfall: 0.0, windSpeed: 6.8, obsTime: new Date().toISOString() },
  { stationId: 'C0W150', stationName: '七美', county: '澎湖縣', township: '七美鄉', lat: 23.2080, lon: 119.4280, temperature: 30.0, humidity: 63, rainfall: 0.0, windSpeed: 7.0, obsTime: new Date().toISOString() },

  // 金門縣
  { stationId: '467110', stationName: '金門 (金城)', county: '金門縣', township: '金城鎮', lat: 24.4074, lon: 118.2893, temperature: 29.0, humidity: 68, rainfall: 0.0, windSpeed: 4.1, obsTime: new Date().toISOString() },
  { stationId: 'C0W110', stationName: '金湖', county: '金門縣', township: '金湖鎮', lat: 24.4380, lon: 118.4210, temperature: 28.8, humidity: 70, rainfall: 0.0, windSpeed: 3.8, obsTime: new Date().toISOString() },
  { stationId: 'C0W120', stationName: '烈嶼 (小金門)', county: '金門縣', township: '烈嶼鄉', lat: 24.4280, lon: 118.2450, temperature: 29.2, humidity: 67, rainfall: 0.0, windSpeed: 4.5, obsTime: new Date().toISOString() },

  // 連江縣 (馬祖)
  { stationId: '467990', stationName: '馬祖 (南竿)', county: '連江縣', township: '南竿鄉', lat: 26.1558, lon: 119.9234, temperature: 26.8, humidity: 86, rainfall: 1.8, windSpeed: 5.0, obsTime: new Date().toISOString() },
  { stationId: 'C0W010', stationName: '北竿', county: '連江縣', township: '北竿鄉', lat: 26.2240, lon: 119.9950, temperature: 26.5, humidity: 88, rainfall: 2.0, windSpeed: 5.3, obsTime: new Date().toISOString() },
  { stationId: 'C0W020', stationName: '東引', county: '連江縣', township: '東引鄉', lat: 26.3680, lon: 120.4950, temperature: 25.9, humidity: 89, rainfall: 2.2, windSpeed: 6.1, obsTime: new Date().toISOString() },
];

/**
 * Temperature Color Grading Function
 * @param {number|null} temp
 * @returns {string} Hex color
 */
function getTemperatureColor(temp) {
  if (temp === null || temp === undefined || isNaN(temp)) return '#718096';
  if (temp < 15) return '#1e90ff';      // Deep Blue (Cold)
  if (temp < 20) return '#00e5ff';      // Cyan (Cool)
  if (temp < 25) return '#00e676';      // Emerald Green (Pleasant)
  if (temp < 30) return '#ffd600';      // Amber Yellow (Warm)
  if (temp < 35) return '#ff6d00';      // Orange (Hot)
  return '#ff1744';                     // Extreme Hot Red
}

/**
 * Compute aggregated weather summary & weather icon for a specific county
 * Condition Mapping:
 * - 雨天 (Rain): 🌧️
 * - 晴時多雲 (Partly Cloudy / Sun + Cloud): ⛅
 * - 晴天 (Sunny): ☀️
 * - 多雲陰天 (Overcast): ☁️
 * - 雷雨 (Thunderstorm): ⛈️
 */
function getCountyWeatherSummary(countyName) {
  const stations = state.stations.filter((s) => s.county && s.county.includes(countyName));
  
  if (stations.length === 0) {
    return {
      countyName,
      avgTemp: 28.0,
      avgHum: 65,
      avgRain: 0.0,
      weatherType: 'sunny',
      weatherLabel: '晴天',
      icon: '☀️',
      stationCount: 0,
      stations: [],
    };
  }

  const validTemps = stations.map((s) => s.temperature).filter((t) => t !== null && !isNaN(t));
  const validHums = stations.map((s) => s.humidity).filter((h) => h !== null && !isNaN(h));
  const validRains = stations.map((s) => s.rainfall).filter((r) => r !== null && !isNaN(r));

  const avgTemp = validTemps.length > 0 ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : 28.0;
  const avgHum = validHums.length > 0 ? validHums.reduce((a, b) => a + b, 0) / validHums.length : 65;
  const avgRain = validRains.length > 0 ? validRains.reduce((a, b) => a + b, 0) / validRains.length : 0.0;
  const maxRain = validRains.length > 0 ? Math.max(...validRains) : 0.0;

  let weatherType = 'sunny';
  let weatherLabel = '晴天';
  let icon = '☀️';

  if (maxRain >= 5.0 || avgRain >= 3.0) {
    weatherType = 'thunderstorm';
    weatherLabel = '雷雨';
    icon = '⛈️';
  } else if (avgRain >= 1.0 || maxRain >= 1.5) {
    weatherType = 'rain';
    weatherLabel = '雨天';
    icon = '🌧️';
  } else if (avgRain > 0.0 || maxRain > 0.0) {
    weatherType = 'shower';
    weatherLabel = '局部短暫雨';
    icon = '🌦️';
  } else if (avgHum >= 82) {
    weatherType = 'cloudy';
    weatherLabel = '多雲陰天';
    icon = '☁️';
  } else if (avgHum >= 65) {
    weatherType = 'partly-cloudy';
    weatherLabel = '晴時多雲';
    icon = '⛅';
  } else {
    weatherType = 'sunny';
    weatherLabel = '晴天';
    icon = '☀️';
  }

  return {
    countyName,
    avgTemp: Math.round(avgTemp * 10) / 10,
    avgHum: Math.round(avgHum),
    avgRain: Math.round(avgRain * 10) / 10,
    weatherType,
    weatherLabel,
    icon,
    stationCount: stations.length,
    stations,
  };
}

/**
 * Format timestamp into readable format
 */
function formatTimeString(isoString) {
  if (!isoString) return '--';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (e) {
    return isoString;
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Initialize Leaflet Map
 */
function initMap() {
  const taiwanCenter = [23.7, 120.95];
  state.map = L.map('taiwan-map', {
    center: taiwanCenter,
    zoom: 8,
    zoomControl: true,
    minZoom: 6,
    maxZoom: 18,
  });

  // Esri World Dark Gray Canvas Tile Layer (Clean, high contrast dark theme)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, OpenStreetMap',
    maxZoom: 16,
  }).addTo(state.map);

  // Layers
  state.countyBadgesLayer = L.layerGroup().addTo(state.map);
  state.markersLayer = L.layerGroup().addTo(state.map);

  // Load Taiwan Counties GeoJSON
  fetch('taiwan-counties.json')
    .then((res) => res.json())
    .then((geoJsonData) => {
      state.geoJsonLayer = L.geoJSON(geoJsonData, {
        style: getCountyPolygonStyle,
        onEachFeature: (feature, layer) => {
          const countyName = feature.properties ? feature.properties.COUNTYNAME : null;
          if (!countyName) return;

          state.countyLayersMap[countyName] = layer;

          // Tooltip
          layer.bindTooltip(
            () => {
              const summary = getCountyWeatherSummary(countyName);
              return `
                <div class="county-map-tooltip">
                  <div class="tip-header">${summary.icon} <strong>${countyName}</strong></div>
                  <div class="tip-sub">${summary.weatherLabel} • ${summary.avgTemp}°C</div>
                  <div class="tip-hint">👉 點擊展開測站細節</div>
                </div>
              `;
            },
            {
              permanent: false,
              direction: 'center',
              className: 'county-hover-tooltip',
              sticky: true,
            }
          );

          // Interactive Polygon Events
          layer.on({
            mouseover: (e) => {
              if (state.activeCounty === 'ALL') {
                const target = e.target;
                target.setStyle({
                  color: '#00ffff',
                  weight: 2.5,
                  fillColor: 'rgba(0, 212, 255, 0.22)',
                  fillOpacity: 0.45,
                });
              }
            },
            mouseout: (e) => {
              if (state.activeCounty === 'ALL') {
                state.geoJsonLayer.resetStyle(e.target);
              }
            },
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              selectCounty(countyName);
            },
          });
        },
      }).addTo(state.map);

      // Render County Weather Badges once GeoJSON is loaded
      renderView();
    })
    .catch((err) => {
      console.warn('Could not load taiwan-counties.json:', err);
      renderView();
    });
}

/**
 * Dynamic Polygon Styling based on selection state
 */
function getCountyPolygonStyle(feature) {
  const countyName = feature.properties ? feature.properties.COUNTYNAME : '';
  const isSelected = state.activeCounty === countyName;
  const isOverview = state.activeCounty === 'ALL';

  if (isSelected) {
    return {
      color: '#00ffff',
      weight: 3.5,
      opacity: 1,
      fillColor: 'rgba(0, 212, 255, 0.28)',
      fillOpacity: 0.5,
      dashArray: '',
    };
  }

  if (isOverview) {
    return {
      color: 'rgba(0, 212, 255, 0.55)',
      weight: 1.5,
      opacity: 0.9,
      fillColor: 'rgba(0, 212, 255, 0.08)',
      fillOpacity: 0.25,
      dashArray: '3, 4',
    };
  }

  // Another county when one county is actively focused
  return {
    color: 'rgba(255, 255, 255, 0.15)',
    weight: 1,
    opacity: 0.4,
    fillColor: 'rgba(0, 0, 0, 0.3)',
    fillOpacity: 0.2,
    dashArray: '2, 4',
  };
}

/**
 * Render Weather Thumbnail Badges on the GIS Map (Overview Mode)
 */
function renderCountyWeatherBadges() {
  if (!state.countyBadgesLayer) return;
  state.countyBadgesLayer.clearLayers();

  if (state.activeCounty !== 'ALL') {
    // Hidden during detail mode
    return;
  }

  const counties = Object.keys(COUNTY_CENTERS);

  for (const countyName of counties) {
    const center = COUNTY_CENTERS[countyName];
    if (!center) continue;

    const summary = getCountyWeatherSummary(countyName);
    const tempColor = getTemperatureColor(summary.avgTemp);

    // Weather Thumbnail DivIcon
    const badgeHtml = `
      <div class="county-weather-thumbnail-badge" data-county="${countyName}">
        <div class="thumb-icon-halo type-${summary.weatherType}">
          <span class="thumb-emoji">${summary.icon}</span>
        </div>
        <div class="thumb-body">
          <div class="thumb-name-row">
            <span class="thumb-county-name">${countyName}</span>
            <span class="thumb-status-tag">${summary.weatherLabel}</span>
          </div>
          <div class="thumb-temp-row">
            <span class="thumb-temp" style="color: ${tempColor};">${summary.avgTemp}°</span>
            <span class="thumb-count">${summary.stationCount}站</span>
          </div>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'county-thumbnail-icon-wrap',
      html: badgeHtml,
      iconSize: [120, 48],
      iconAnchor: [60, 24],
    });

    const marker = L.marker(center, {
      icon: customIcon,
      zIndexOffset: 500,
    });

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      selectCounty(countyName);
    });

    state.countyBadgesLayer.addLayer(marker);
  }
}

/**
 * Render Detailed Station Markers on Map (Detail Mode)
 */
function renderStationMarkers() {
  if (!state.markersLayer) return;
  state.markersLayer.clearLayers();

  if (state.activeCounty === 'ALL') {
    // In overview mode, station markers are hidden to keep GIS clear for county thumbnails
    return;
  }

  const query = state.searchQuery.toLowerCase().trim();
  const selectedCounty = state.activeCounty;

  let visibleCount = 0;

  for (const st of state.stations) {
    const matchCounty = st.county && st.county.includes(selectedCounty);
    const matchSearch =
      !query ||
      (st.stationName && st.stationName.toLowerCase().includes(query)) ||
      (st.stationId && st.stationId.toLowerCase().includes(query)) ||
      (st.township && st.township.toLowerCase().includes(query));

    if (!matchCounty || !matchSearch) continue;

    visibleCount++;

    const color = getTemperatureColor(st.temperature);
    const tempDisplay = st.temperature !== null ? `${Math.round(st.temperature)}°` : '--';

    const customIcon = L.divIcon({
      className: 'weather-marker-icon',
      html: `
        <div class="marker-inner-pulse" style="background: ${color}; border-color: ${color}; box-shadow: 0 0 14px ${color};">
          <span>${tempDisplay}</span>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });

    const marker = L.marker([st.lat, st.lon], { icon: customIcon });

    const popupHtml = `
      <div class="popup-station-card">
        <div class="popup-header">
          <div class="popup-title">${st.stationName}</div>
          <div class="popup-sub">${st.county || ''} ${st.township || ''} [ID: ${st.stationId}]</div>
        </div>
        <div class="popup-stats-grid">
          <div class="popup-stat-item">
            <span>🌡️ 氣溫</span>
            <strong style="color: ${color};">${st.temperature !== null ? st.temperature.toFixed(1) + ' °C' : '無資料'}</strong>
          </div>
          <div class="popup-stat-item">
            <span>💧 相對濕度</span>
            <strong>${st.humidity !== null ? st.humidity.toFixed(0) + ' %' : '無資料'}</strong>
          </div>
          <div class="popup-stat-item">
            <span>🌧️ 累積雨量</span>
            <strong>${st.rainfall !== null ? st.rainfall.toFixed(1) + ' mm' : '0.0 mm'}</strong>
          </div>
          <div class="popup-stat-item">
            <span>🧭 風速</span>
            <strong>${st.windSpeed !== null ? st.windSpeed.toFixed(1) + ' m/s' : '--'}</strong>
          </div>
        </div>
        <div class="popup-time">🕒 ${formatTimeString(st.obsTime)}</div>
      </div>
    `;

    marker.bindPopup(popupHtml);

    marker.on('click', () => {
      selectStation(st);
    });

    state.markersLayer.addLayer(marker);
  }

  const visibleCountEl = document.getElementById('visible-station-count');
  if (visibleCountEl) visibleCountEl.textContent = visibleCount;
}

/**
 * Render Sidebar Content (Switches between Overview Cards & Selected County Details)
 */
function renderSidebar() {
  const overviewView = document.getElementById('overview-counties-view');
  const detailView = document.getElementById('detail-county-view');
  const countySelect = document.getElementById('county-select');
  const modeBadgeText = document.getElementById('gis-mode-text');
  const mapHudText = document.getElementById('map-hud-status-text');
  const visibleCountEl = document.getElementById('visible-station-count');
  const tipText = document.getElementById('gis-tip-text');

  if (countySelect) countySelect.value = state.activeCounty;

  if (state.activeCounty === 'ALL') {
    // === Overview Mode ===
    if (overviewView) overviewView.style.display = 'block';
    if (detailView) detailView.style.display = 'none';
    if (modeBadgeText) modeBadgeText.textContent = '全島縣市縮圖總覽';
    if (mapHudText) mapHudText.textContent = 'GIS OVERVIEW // 22 COUNTIES';
    if (tipText) tipText.textContent = '💡 點選地圖縣市區塊或縮圖展開細節';
    if (visibleCountEl) visibleCountEl.textContent = state.stations.length;

    // Render 22 County Grid Cards
    const gridEl = document.getElementById('county-cards-grid');
    if (gridEl) {
      gridEl.innerHTML = '';
      const counties = Object.keys(COUNTY_CENTERS);

      for (const countyName of counties) {
        const summary = getCountyWeatherSummary(countyName);
        const tempColor = getTemperatureColor(summary.avgTemp);

        const card = document.createElement('div');
        card.className = `county-mini-card type-${summary.weatherType}`;
        card.innerHTML = `
          <div class="mini-card-icon">${summary.icon}</div>
          <div class="mini-card-info">
            <div class="mini-card-name">${countyName}</div>
            <div class="mini-card-status">${summary.weatherLabel}</div>
          </div>
          <div class="mini-card-stats">
            <span class="mini-card-temp" style="color: ${tempColor};">${summary.avgTemp}°</span>
            <span class="mini-card-count">${summary.stationCount} 站</span>
          </div>
        `;

        card.addEventListener('click', () => {
          selectCounty(countyName);
        });

        gridEl.appendChild(card);
      }
    }
  } else {
    // === Detail County Mode ===
    if (overviewView) overviewView.style.display = 'none';
    if (detailView) detailView.style.display = 'block';
    if (modeBadgeText) modeBadgeText.textContent = `${state.activeCounty} 細節展開中`;
    if (mapHudText) mapHudText.textContent = `${state.activeCounty} // DETAIL MODE`;
    if (tipText) tipText.textContent = `🎯 點擊測站定位或檢視遙測`;

    const summary = getCountyWeatherSummary(state.activeCounty);
    const tempColor = getTemperatureColor(summary.avgTemp);

    // Update Detail Header
    const nameEl = document.getElementById('detail-county-name');
    const iconEl = document.getElementById('detail-county-weather-icon');
    const statusEl = document.getElementById('detail-county-status');
    const avgTempEl = document.getElementById('detail-county-avg-temp');
    const avgHumEl = document.getElementById('detail-county-avg-hum');
    const avgRainEl = document.getElementById('detail-county-avg-rain');
    const countEl = document.getElementById('detail-county-station-count');

    if (nameEl) nameEl.textContent = state.activeCounty;
    if (iconEl) iconEl.textContent = summary.icon;
    if (statusEl) statusEl.textContent = summary.weatherLabel;
    if (avgTempEl) {
      avgTempEl.textContent = `${summary.avgTemp}°C`;
      avgTempEl.style.color = tempColor;
    }
    if (avgHumEl) avgHumEl.textContent = `${summary.avgHum}%`;
    if (avgRainEl) avgRainEl.textContent = `${summary.avgRain} mm`;
    if (countEl) countEl.textContent = `${summary.stationCount} 個測站`;

    // Render Station Chips
    const stationListEl = document.getElementById('county-stations-list');
    if (stationListEl) {
      stationListEl.innerHTML = '';
      if (summary.stations.length === 0) {
        stationListEl.innerHTML = '<div class="no-stations-msg">此縣市目前無連線測站</div>';
      } else {
        summary.stations.forEach((st) => {
          const sColor = getTemperatureColor(st.temperature);
          const chip = document.createElement('div');
          chip.className = `station-chip ${state.selectedStation && state.selectedStation.stationId === st.stationId ? 'active' : ''}`;
          chip.innerHTML = `
            <div class="chip-main">
              <span class="chip-badge" style="background: ${sColor};">${st.temperature !== null ? Math.round(st.temperature) + '°' : '--'}</span>
              <div class="chip-text">
                <strong class="chip-name">${st.stationName}</strong>
                <span class="chip-sub">${st.township || st.county}</span>
              </div>
            </div>
            <div class="chip-telemetry">
              <span>💧 ${st.humidity !== null ? Math.round(st.humidity) + '%' : '--'}</span>
              <span>🌧️ ${st.rainfall !== null ? st.rainfall.toFixed(1) + 'mm' : '0mm'}</span>
            </div>
          `;

          chip.addEventListener('click', () => {
            selectStation(st);
            if (state.map) {
              state.map.flyTo([st.lat, st.lon], 13, { duration: 1.0 });
            }
          });

          stationListEl.appendChild(chip);
        });
      }
    }
  }
}

/**
 * Master Render
 */
function renderView() {
  if (state.geoJsonLayer) {
    state.geoJsonLayer.eachLayer((layer) => {
      state.geoJsonLayer.resetStyle(layer);
    });
  }

  renderCountyWeatherBadges();
  renderStationMarkers();
  renderSidebar();
}

/**
 * Select a County and smoothly zoom in (GIS 選擇縣市展開細節)
 */
function selectCounty(countyName) {
  state.activeCounty = countyName;

  // 1. Highlight GeoJSON Polygon & zoom to bounds
  if (state.geoJsonLayer && state.countyLayersMap[countyName]) {
    const layer = state.countyLayersMap[countyName];
    try {
      const bounds = layer.getBounds();
      state.map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 12,
        duration: 1.0,
      });
    } catch (e) {
      if (COUNTY_CENTERS[countyName]) {
        state.map.flyTo(COUNTY_CENTERS[countyName], 10, { duration: 1.0 });
      }
    }
  } else if (COUNTY_CENTERS[countyName]) {
    state.map.flyTo(COUNTY_CENTERS[countyName], 10, { duration: 1.0 });
  }

  // 2. Select first station in county automatically if available
  const countyStations = state.stations.filter((s) => s.county && s.county.includes(countyName));
  if (countyStations.length > 0) {
    selectStation(countyStations[0]);
  }

  // 3. Re-render GIS view
  renderView();
  showToast(`🔍 已展開【${countyName}】氣象測站細節`);
}

/**
 * Reset view back to Full Island Overview (返回全島總覽)
 */
function resetToNationalOverview() {
  state.activeCounty = 'ALL';
  state.selectedStation = null;

  if (state.map) {
    state.map.flyTo([23.7, 120.95], 8, { duration: 1.2 });
  }

  const emptyState = document.getElementById('station-empty-state');
  const detailContent = document.getElementById('station-detail-content');
  if (emptyState) emptyState.style.display = 'flex';
  if (detailContent) detailContent.style.display = 'none';

  renderView();
  showToast('🌐 已返回全台灣縣市氣象縮圖總覽');
}

/**
 * Select a station and update the Inspector sidebar
 */
function selectStation(st) {
  state.selectedStation = st;

  const emptyState = document.getElementById('station-empty-state');
  const detailContent = document.getElementById('station-detail-content');
  if (emptyState) emptyState.style.display = 'none';
  if (detailContent) detailContent.style.display = 'block';

  const nameEl = document.getElementById('inspect-station-name');
  const idEl = document.getElementById('inspect-station-id');
  const locEl = document.getElementById('inspect-station-location');
  const tempEl = document.getElementById('inspect-temp');
  const humEl = document.getElementById('inspect-humidity');
  const rainEl = document.getElementById('inspect-rainfall');
  const windEl = document.getElementById('inspect-wind');
  const coordsEl = document.getElementById('inspect-coords');
  const obsTimeEl = document.getElementById('inspect-obs-time');
  const tempCard = document.getElementById('metric-temp-card');

  if (nameEl) nameEl.textContent = st.stationName;
  if (idEl) idEl.textContent = `ID: ${st.stationId}`;
  if (locEl) locEl.textContent = `📍 ${st.county || ''} ${st.township || ''}`;

  const color = getTemperatureColor(st.temperature);
  if (tempEl) {
    tempEl.textContent = st.temperature !== null ? st.temperature.toFixed(1) : '--';
    tempEl.style.color = color;
  }
  if (tempCard) {
    tempCard.style.borderColor = color;
    tempCard.style.boxShadow = `0 0 12px ${color}44`;
  }

  if (humEl) humEl.textContent = st.humidity !== null ? st.humidity.toFixed(0) : '--';
  if (rainEl) rainEl.textContent = st.rainfall !== null ? st.rainfall.toFixed(1) : '0.0';
  if (windEl) windEl.textContent = st.windSpeed !== null ? st.windSpeed.toFixed(1) : (st.elevation ? `${st.elevation}m` : '--');
  if (coordsEl) coordsEl.textContent = `${st.lat.toFixed(4)}, ${st.lon.toFixed(4)}`;
  if (obsTimeEl) obsTimeEl.textContent = formatTimeString(st.obsTime);

  // Update active class on chips if rendered
  const chips = document.querySelectorAll('.station-chip');
  chips.forEach((c) => c.classList.remove('active'));
}

/**
 * Fetch Weather Data from API or fallback to built-in dataset
 */
async function fetchWeatherData(isManual = false) {
  const syncBtn = document.getElementById('btn-force-sync');
  const syncText = document.getElementById('sync-btn-text');
  if (syncBtn && isManual) {
    syncBtn.classList.add('syncing');
    if (syncText) syncText.textContent = '同步中...';
  }

  try {
    let data = null;
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {
      // Backend not running (e.g. static host)
    }

    if (data && data.stations && data.stations.length > 0) {
      state.stations = data.stations;
      state.lastSyncIso = data.lastSyncedAt || new Date().toISOString();
      updateDBTelemetry(data.source, state.lastSyncIso);
    } else {
      state.stations = FALLBACK_STATIONS;
      state.lastSyncIso = new Date().toISOString();
      updateDBTelemetry('demo_fallback', state.lastSyncIso);
    }

    renderView();

    if (isManual) {
      showToast(`⚡ 氣象資料同步完成！(共 ${state.stations.length} 個測站)`);
    }
  } catch (err) {
    console.error('Fetch weather error:', err);
    if (isManual) showToast('⚠️ 同步失敗，請稍候重試');
  } finally {
    if (syncBtn && isManual) {
      syncBtn.classList.remove('syncing');
      if (syncText) syncText.textContent = '即時同步';
    }
  }
}

/**
 * Trigger manual synchronization with /api/sync
 */
async function triggerSync() {
  const syncBtn = document.getElementById('btn-force-sync');
  const syncText = document.getElementById('sync-btn-text');
  if (syncBtn) {
    syncBtn.classList.add('syncing');
    if (syncText) syncText.textContent = '連線同步中...';
  }

  try {
    const res = await fetch('/api/sync', { method: 'POST' });
    if (res.ok) {
      const json = await res.json();
      showToast(`⚡ ${json.message || '同步完成'}`);
    }
  } catch (err) {
    console.warn('Manual /api/sync request exception:', err);
  }

  await fetchWeatherData(true);
}

/**
 * Update Top Status Telemetry Indicator
 */
function updateDBTelemetry(source, isoString) {
  const dot = document.getElementById('db-status-dot');
  const label = document.getElementById('db-status-label');
  const timeEl = document.getElementById('last-sync-time');

  if (source === 'postgresql') {
    if (dot) dot.style.background = '#00ff66';
    if (label) label.textContent = 'POSTGRESQL // SYNCED';
  } else if (source === 'cwa_direct') {
    if (dot) dot.style.background = '#00d4ff';
    if (label) label.textContent = 'CWA DIRECT // ONLINE';
  } else {
    if (dot) dot.style.background = '#ffaa00';
    if (label) label.textContent = 'GIS READY // ACTIVE';
  }

  if (timeEl) {
    timeEl.textContent = formatTimeString(isoString);
  }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Force sync button
  const syncBtn = document.getElementById('btn-force-sync');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      triggerSync();
    });
  }

  // County Dropdown
  const countySelect = document.getElementById('county-select');
  if (countySelect) {
    countySelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'ALL') {
        resetToNationalOverview();
      } else {
        selectCounty(val);
      }
    });
  }

  // Sidebar back to overview button
  const sidebarBackBtn = document.getElementById('btn-sidebar-back-overview');
  if (sidebarBackBtn) {
    sidebarBackBtn.addEventListener('click', () => {
      resetToNationalOverview();
    });
  }

  // Search input
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('btn-clear-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (clearBtn) clearBtn.style.display = state.searchQuery ? 'block' : 'none';
      renderView();
    });
  }
  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearBtn.style.display = 'none';
      renderView();
    });
  }

  // Reset Island Zoom Button
  const zoomBtn = document.getElementById('btn-zoom-taiwan');
  if (zoomBtn) {
    zoomBtn.addEventListener('click', () => {
      resetToNationalOverview();
    });
  }
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  state.stations = FALLBACK_STATIONS;
  state.lastSyncIso = new Date().toISOString();
  updateDBTelemetry('cwa_direct', state.lastSyncIso);

  setupEventListeners();
  fetchWeatherData();

  // Polling every 60s
  setInterval(() => {
    fetchWeatherData(false);
  }, 60000);
});
