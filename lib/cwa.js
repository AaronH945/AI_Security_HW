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
    { stationId: '466920', stationName: '臺北', county: '臺北市', township: '中正區', lat: 25.0376, lon: 121.5148, temperature: 28.6, humidity: 76, rainfall: 0.0, windSpeed: 2.1, obsTime: now },
    { stationId: '466910', stationName: '鞍部 (陽明山)', county: '臺北市', township: '北投區', lat: 25.1825, lon: 121.5297, temperature: 22.4, humidity: 88, rainfall: 2.5, windSpeed: 4.8, obsTime: now },
    { stationId: '466900', stationName: '淡水', county: '新北市', township: '淡水區', lat: 25.1648, lon: 121.4489, temperature: 27.9, humidity: 79, rainfall: 0.0, windSpeed: 3.2, obsTime: now },
    { stationId: '466940', stationName: '基隆', county: '基隆市', township: '仁愛區', lat: 25.1333, lon: 121.7405, temperature: 27.1, humidity: 82, rainfall: 1.0, windSpeed: 3.6, obsTime: now },
    { stationId: 'C0C480', stationName: '桃園 (新屋)', county: '桃園市', township: '新屋區', lat: 25.0069, lon: 121.0474, temperature: 29.2, humidity: 73, rainfall: 0.0, windSpeed: 4.2, obsTime: now },
    { stationId: '467570', stationName: '新竹', county: '新竹市', township: '東區', lat: 24.8279, lon: 120.9272, temperature: 29.8, humidity: 71, rainfall: 0.0, windSpeed: 3.9, obsTime: now },
    { stationId: 'C0D580', stationName: '竹東', county: '新竹縣', township: '竹東鎮', lat: 24.7337, lon: 121.0864, temperature: 28.5, humidity: 75, rainfall: 0.0, windSpeed: 2.0, obsTime: now },
    { stationId: 'C0E750', stationName: '苗栗', county: '苗栗縣', township: '苗栗市', lat: 24.5652, lon: 120.8252, temperature: 30.1, humidity: 68, rainfall: 0.0, windSpeed: 2.7, obsTime: now },
    { stationId: '467490', stationName: '臺中', county: '臺中市', township: '北區', lat: 24.1457, lon: 120.6841, temperature: 31.5, humidity: 65, rainfall: 0.0, windSpeed: 1.8, obsTime: now },
    { stationId: 'C0F970', stationName: '大甲', county: '臺中市', township: '大甲區', lat: 24.3512, lon: 120.6214, temperature: 30.8, humidity: 69, rainfall: 0.0, windSpeed: 3.5, obsTime: now },
    { stationId: '467550', stationName: '日月潭', county: '南投縣', township: '魚池鄉', lat: 23.8814, lon: 120.9081, temperature: 23.2, humidity: 84, rainfall: 0.5, windSpeed: 1.4, obsTime: now },
    { stationId: '467530', stationName: '阿里山', county: '嘉義縣', township: '阿里山鄉', lat: 23.5083, lon: 120.8133, temperature: 14.8, humidity: 92, rainfall: 4.0, windSpeed: 2.1, obsTime: now },
    { stationId: '467480', stationName: '嘉義', county: '嘉義市', township: '西區', lat: 23.4959, lon: 120.4329, temperature: 31.8, humidity: 69, rainfall: 0.0, windSpeed: 1.6, obsTime: now },
    { stationId: '467410', stationName: '臺南', county: '臺南市', township: '中西區', lat: 22.9933, lon: 120.2046, temperature: 32.4, humidity: 72, rainfall: 0.0, windSpeed: 2.5, obsTime: now },
    { stationId: '467440', stationName: '高雄', county: '高雄市', township: '前鎮區', lat: 22.5660, lon: 120.3157, temperature: 33.1, humidity: 70, rainfall: 0.0, windSpeed: 2.8, obsTime: now },
    { stationId: '467590', stationName: '恆春', county: '屏東縣', township: '恆春鎮', lat: 22.0039, lon: 120.7463, temperature: 31.0, humidity: 78, rainfall: 0.0, windSpeed: 5.6, obsTime: now },
    { stationId: '467080', stationName: '宜蘭', county: '宜蘭縣', township: '宜蘭市', lat: 24.7639, lon: 121.7565, temperature: 27.5, humidity: 80, rainfall: 0.5, windSpeed: 2.2, obsTime: now },
    { stationId: '466990', stationName: '花蓮', county: '花蓮縣', township: '花蓮市', lat: 23.9752, lon: 121.6133, temperature: 28.7, humidity: 77, rainfall: 0.0, windSpeed: 3.1, obsTime: now },
    { stationId: '467660', stationName: '臺東', county: '臺東縣', township: '臺東市', lat: 22.7522, lon: 121.1546, temperature: 29.4, humidity: 75, rainfall: 0.0, windSpeed: 3.4, obsTime: now },
    { stationId: '467350', stationName: '澎湖 (馬公)', county: '澎湖縣', township: '馬公市', lat: 23.5655, lon: 119.5631, temperature: 30.2, humidity: 74, rainfall: 0.0, windSpeed: 6.2, obsTime: now },
    { stationId: '467110', stationName: '金門', county: '金門縣', township: '金城鎮', lat: 24.4074, lon: 118.2893, temperature: 29.0, humidity: 76, rainfall: 0.0, windSpeed: 4.1, obsTime: now },
    { stationId: '467990', stationName: '馬祖 (南竿)', county: '連江縣', township: '南竿鄉', lat: 26.1558, lon: 119.9234, temperature: 26.8, humidity: 81, rainfall: 0.0, windSpeed: 5.0, obsTime: now },
    { stationId: '467770', stationName: '玉山 (氣象測站)', county: '南投縣', township: '信義鄉', lat: 23.4876, lon: 120.9595, temperature: 6.2, humidity: 95, rainfall: 8.0, windSpeed: 7.2, obsTime: now },
    { stationId: '467650', stationName: '合歡山 (頂峰)', county: '花蓮縣', township: '秀林鄉', lat: 24.1415, lon: 121.2842, temperature: 9.8, humidity: 90, rainfall: 5.5, windSpeed: 6.4, obsTime: now },
  ];
  return sampleList;
}

module.exports = {
  fetchCWAData,
  normalizeCWAStations,
  getSampleTaiwanStations,
};
