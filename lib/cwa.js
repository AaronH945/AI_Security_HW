/**
 * CWA (Central Weather Administration) Open Data API Fetcher & Parser
 */

const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP Status ${res.statusCode} from ${url}`));
        }
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve(parsed);
          } catch (e) {
            reject(new Error(`JSON Parse Error: ${e.message}`));
          }
        });
      })
      .on('error', (err) => reject(err));
  });
}

function parseNumeric(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(val);
  if (isNaN(num) || num <= -90) return null; // -99, -999 indicates missing data in CWA
  return num;
}

/**
 * Normalizes CWA Station JSON into standard structure
 */
function normalizeCWAStations(cwaJson) {
  const records = cwaJson?.records;
  if (!records) return [];

  const stations = records.Station || records.location || [];
  const normalized = [];

  for (const st of stations) {
    // Handling standard CWA Station schema
    const stationId = st.StationId || st.stationId || st.stationCode;
    const stationName = st.StationName || st.locationName || st.stationName;

    // Coordinates & Geographic Info
    let lat = null;
    let lon = null;
    let elevation = null;
    let county = '';
    let township = '';

    if (st.GeoInfo) {
      if (st.GeoInfo.Coordinates && st.GeoInfo.Coordinates.length > 0) {
        lat = parseFloat(st.GeoInfo.Coordinates[0].StationLatitude);
        lon = parseFloat(st.GeoInfo.Coordinates[0].StationLongitude);
      }
      county = st.GeoInfo.CountyName || '';
      township = st.GeoInfo.TownName || '';
      elevation = parseFloat(st.GeoInfo.StationAltitude || 0);
    } else if (st.lat || st.latitute || st.latDegree) {
      lat = parseFloat(st.lat || st.latitute || st.latDegree);
      lon = parseFloat(st.lon || st.longitude || st.lonDegree);
      county = st.parameter?.find((p) => p.parameterName === 'CITY')?.parameterValue || '';
      township = st.parameter?.find((p) => p.parameterName === 'TOWN')?.parameterValue || '';
    }

    if (!lat || !lon || isNaN(lat) || isNaN(lon)) continue;

    // Weather elements
    let temperature = null;
    let humidity = null;
    let rainfall = null;
    let windSpeed = null;
    let obsTime = st.ObsTime?.DateTime || st.time?.obsTime || new Date().toISOString();

    if (st.WeatherElement) {
      const we = st.WeatherElement;
      temperature = parseNumeric(we.AirTemperature);
      humidity = parseNumeric(we.RelativeHumidity);
      windSpeed = parseNumeric(we.WindSpeed);
      // Precipitation / Rain
      if (we.Now && we.Now.Precipitation !== undefined) {
        rainfall = parseNumeric(we.Now.Precipitation);
      } else if (we.DailyPrecipitation !== undefined) {
        rainfall = parseNumeric(we.DailyPrecipitation);
      } else if (we.Precipitation !== undefined) {
        rainfall = parseNumeric(we.Precipitation);
      }
    } else if (st.weatherElement && Array.isArray(st.weatherElement)) {
      for (const el of st.weatherElement) {
        const name = el.elementName;
        const val = el.elementValue;
        if (name === 'TEMP') temperature = parseNumeric(val);
        if (name === 'HUMD') humidity = parseNumeric(val) ? parseNumeric(val) * 100 : null;
        if (name === '24R' || name === 'RAIN' || name === 'HOUR_24') rainfall = parseNumeric(val);
        if (name === 'WDSD') windSpeed = parseNumeric(val);
      }
    }

    normalized.push({
      stationId,
      stationName,
      county,
      township,
      lat,
      lon,
      elevation: isNaN(elevation) ? 0 : elevation,
      temperature,
      humidity,
      rainfall: rainfall !== null ? Math.max(0, rainfall) : 0,
      windSpeed,
      obsTime,
    });
  }

  return normalized;
}

/**
 * Fetch live data from Central Weather Administration API
 */
async function fetchCWAData(apiKey) {
  const key = apiKey || process.env.CWA_API_KEY;
  if (!key) {
    throw new Error('CWA_API_KEY is not configured.');
  }

  // O-A0001-001 (自動氣象站) & O-A0003-001 (局屬氣象站)
  const url1 = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=${key}&format=JSON`;
  const url2 = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${key}&format=JSON`;

  let stations = [];
  try {
    const data1 = await fetchJson(url1);
    stations = stations.concat(normalizeCWAStations(data1));
  } catch (err) {
    console.warn('Warning: CWA O-A0001-001 fetch error:', err.message);
  }

  try {
    const data2 = await fetchJson(url2);
    stations = stations.concat(normalizeCWAStations(data2));
  } catch (err) {
    console.warn('Warning: CWA O-A0003-001 fetch error:', err.message);
  }

  if (stations.length === 0) {
    throw new Error('Failed to retrieve any stations from CWA API.');
  }

  return stations;
}

/**
 * Realistic Taiwan weather stations generator for instant demo / fallback
 */
function getSampleTaiwanStations() {
  const now = new Date().toISOString();
  const sampleList = [
    // 臺北市
    { stationId: '466920', stationName: '臺北', county: '臺北市', township: '中正區', lat: 25.0376, lon: 121.5148, temperature: 28.6, humidity: 70, rainfall: 0.0, windSpeed: 2.1, obsTime: now },
    { stationId: '466910', stationName: '鞍部 (陽明山)', county: '臺北市', township: '北投區', lat: 25.1825, lon: 121.5297, temperature: 22.4, humidity: 88, rainfall: 2.5, windSpeed: 4.8, obsTime: now },
    { stationId: 'C0A980', stationName: '內湖', county: '臺北市', township: '內湖區', lat: 25.0805, lon: 121.5898, temperature: 28.2, humidity: 72, rainfall: 0.0, windSpeed: 1.8, obsTime: now },

    // 新北市
    { stationId: '466900', stationName: '淡水', county: '新北市', township: '淡水區', lat: 25.1648, lon: 121.4489, temperature: 27.9, humidity: 64, rainfall: 0.0, windSpeed: 3.2, obsTime: now },
    { stationId: '466880', stationName: '板橋', county: '新北市', township: '板橋區', lat: 25.0080, lon: 121.4450, temperature: 29.1, humidity: 68, rainfall: 0.0, windSpeed: 2.4, obsTime: now },
    { stationId: 'C0A920', stationName: '九份 (瑞芳)', county: '新北市', township: '瑞芳區', lat: 25.1090, lon: 121.8440, temperature: 24.5, humidity: 86, rainfall: 3.0, windSpeed: 4.1, obsTime: now },

    // 基隆市
    { stationId: '466940', stationName: '基隆', county: '基隆市', township: '仁愛區', lat: 25.1333, lon: 121.7405, temperature: 27.1, humidity: 84, rainfall: 2.0, windSpeed: 3.6, obsTime: now },

    // 桃園市
    { stationId: 'C0C480', stationName: '桃園 (新屋)', county: '桃園市', township: '新屋區', lat: 25.0069, lon: 121.0474, temperature: 29.2, humidity: 62, rainfall: 0.0, windSpeed: 4.2, obsTime: now },
    { stationId: 'C0C700', stationName: '中壢', county: '桃園市', township: '中壢區', lat: 24.9680, lon: 121.2250, temperature: 29.6, humidity: 60, rainfall: 0.0, windSpeed: 2.8, obsTime: now },

    // 新竹市
    { stationId: '467570', stationName: '新竹', county: '新竹市', township: '東區', lat: 24.8279, lon: 120.9272, temperature: 29.8, humidity: 59, rainfall: 0.0, windSpeed: 3.9, obsTime: now },

    // 新竹縣
    { stationId: 'C0D580', stationName: '竹東', county: '新竹縣', township: '竹東鎮', lat: 24.7337, lon: 121.0864, temperature: 28.5, humidity: 68, rainfall: 0.0, windSpeed: 2.0, obsTime: now },
    { stationId: 'C0D550', stationName: '竹北', county: '新竹縣', township: '竹北市', lat: 24.8387, lon: 121.0118, temperature: 29.3, humidity: 66, rainfall: 0.0, windSpeed: 2.5, obsTime: now },

    // 苗栗縣
    { stationId: 'C0E750', stationName: '苗栗', county: '苗栗縣', township: '苗栗市', lat: 24.5652, lon: 120.8252, temperature: 30.1, humidity: 67, rainfall: 0.0, windSpeed: 2.7, obsTime: now },

    // 臺中市
    { stationId: '467490', stationName: '臺中', county: '臺中市', township: '北區', lat: 24.1457, lon: 120.6841, temperature: 31.5, humidity: 58, rainfall: 0.0, windSpeed: 1.8, obsTime: now },
    { stationId: 'C0F970', stationName: '大甲', county: '臺中市', township: '大甲區', lat: 24.3512, lon: 120.6214, temperature: 30.8, humidity: 61, rainfall: 0.0, windSpeed: 3.5, obsTime: now },

    // 彰化縣
    { stationId: 'C0G620', stationName: '彰化', county: '彰化縣', township: '彰化市', lat: 24.0810, lon: 120.5580, temperature: 31.2, humidity: 60, rainfall: 0.0, windSpeed: 2.3, obsTime: now },
    { stationId: 'C0G650', stationName: '員林', county: '彰化縣', township: '員林市', lat: 23.9590, lon: 120.5740, temperature: 31.6, humidity: 59, rainfall: 0.0, windSpeed: 2.0, obsTime: now },

    // 南投縣
    { stationId: '467550', stationName: '日月潭', county: '南投縣', township: '魚池鄉', lat: 23.8814, lon: 120.9081, temperature: 23.2, humidity: 76, rainfall: 0.0, windSpeed: 1.4, obsTime: now },
    { stationId: '467770', stationName: '玉山 (頂峰)', county: '南投縣', township: '信義鄉', lat: 23.4876, lon: 120.9595, temperature: 6.2, humidity: 95, rainfall: 8.0, windSpeed: 7.2, obsTime: now },

    // 雲林縣
    { stationId: 'C0K400', stationName: '斗六', county: '雲林縣', township: '斗六市', lat: 23.7080, lon: 120.5430, temperature: 31.0, humidity: 66, rainfall: 0.0, windSpeed: 1.9, obsTime: now },

    // 嘉義市
    { stationId: '467480', stationName: '嘉義', county: '嘉義市', township: '西區', lat: 23.4959, lon: 120.4329, temperature: 31.8, humidity: 58, rainfall: 0.0, windSpeed: 1.6, obsTime: now },

    // 嘉義縣
    { stationId: '467530', stationName: '阿里山', county: '嘉義縣', township: '阿里山鄉', lat: 23.5083, lon: 120.8133, temperature: 14.8, humidity: 92, rainfall: 4.0, windSpeed: 2.1, obsTime: now },
    { stationId: 'C0M730', stationName: '太保', county: '嘉義縣', township: '太保市', lat: 23.4580, lon: 120.3320, temperature: 31.5, humidity: 62, rainfall: 0.0, windSpeed: 2.4, obsTime: now },

    // 臺南市
    { stationId: '467410', stationName: '臺南', county: '臺南市', township: '中西區', lat: 22.9933, lon: 120.2046, temperature: 32.4, humidity: 56, rainfall: 0.0, windSpeed: 2.5, obsTime: now },
    { stationId: 'C0X060', stationName: '永康', county: '臺南市', township: '永康區', lat: 23.0280, lon: 120.2580, temperature: 32.1, humidity: 58, rainfall: 0.0, windSpeed: 2.1, obsTime: now },

    // 高雄市
    { stationId: '467440', stationName: '高雄', county: '高雄市', township: '前鎮區', lat: 22.5660, lon: 120.3157, temperature: 33.1, humidity: 58, rainfall: 0.0, windSpeed: 2.8, obsTime: now },
    { stationId: 'C0V680', stationName: '左營', county: '高雄市', township: '左營區', lat: 22.6890, lon: 120.2980, temperature: 32.8, humidity: 59, rainfall: 0.0, windSpeed: 2.5, obsTime: now },

    // 屏東縣
    { stationId: '467590', stationName: '恆春', county: '屏東縣', township: '恆春鎮', lat: 22.0039, lon: 120.7463, temperature: 31.0, humidity: 74, rainfall: 0.0, windSpeed: 5.6, obsTime: now },
    { stationId: 'C0R130', stationName: '屏東', county: '屏東縣', township: '屏東市', lat: 22.6730, lon: 120.4880, temperature: 32.8, humidity: 60, rainfall: 0.0, windSpeed: 2.3, obsTime: now },

    // 宜蘭縣
    { stationId: '467080', stationName: '宜蘭', county: '宜蘭縣', township: '宜蘭市', lat: 24.7639, lon: 121.7565, temperature: 27.5, humidity: 84, rainfall: 2.0, windSpeed: 2.2, obsTime: now },

    // 花蓮縣
    { stationId: '466990', stationName: '花蓮', county: '花蓮縣', township: '花蓮市', lat: 23.9752, lon: 121.6133, temperature: 28.7, humidity: 72, rainfall: 0.0, windSpeed: 3.1, obsTime: now },
    { stationId: '467650', stationName: '合歡山 (頂峰)', county: '花蓮縣', township: '秀林鄉', lat: 24.1415, lon: 121.2842, temperature: 9.8, humidity: 90, rainfall: 5.5, windSpeed: 6.4, obsTime: now },

    // 臺東縣
    { stationId: '467660', stationName: '臺東', county: '臺東縣', township: '臺東市', lat: 22.7522, lon: 121.1546, temperature: 29.4, humidity: 70, rainfall: 0.0, windSpeed: 3.4, obsTime: now },
    { stationId: '467620', stationName: '蘭嶼', county: '臺東縣', township: '蘭嶼鄉', lat: 22.0370, lon: 121.5580, temperature: 28.0, humidity: 78, rainfall: 0.0, windSpeed: 7.5, obsTime: now },

    // 澎湖縣
    { stationId: '467350', stationName: '澎湖 (馬公)', county: '澎湖縣', township: '馬公市', lat: 23.5655, lon: 119.5631, temperature: 30.2, humidity: 62, rainfall: 0.0, windSpeed: 6.2, obsTime: now },

    // 金門縣
    { stationId: '467110', stationName: '金門 (金城)', county: '金門縣', township: '金城鎮', lat: 24.4074, lon: 118.2893, temperature: 29.0, humidity: 68, rainfall: 0.0, windSpeed: 4.1, obsTime: now },

    // 連江縣 (馬祖)
    { stationId: '467990', stationName: '馬祖 (南竿)', county: '連江縣', township: '南竿鄉', lat: 26.1558, lon: 119.9234, temperature: 26.8, humidity: 86, rainfall: 1.8, windSpeed: 5.0, obsTime: now },
  ];
  return sampleList;
}

module.exports = {
  fetchCWAData,
  normalizeCWAStations,
  getSampleTaiwanStations,
};
