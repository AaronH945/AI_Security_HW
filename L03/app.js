/**
 * L03: CWA 自動氣象站觀測地圖 // Leaflet & PostgreSQL Frontend Controller
 */

// Global State
const state = {
  map: null,
  geoJsonLayer: null,
  markersLayer: null,
  stations: [],
  selectedStation: null,
  lastSyncIso: null,
  activeCountyFilter: 'ALL',
  searchQuery: '',
};

// Built-in Sample Dataset for Static / Offline / GitHub Pages fallback
const FALLBACK_STATIONS = [
  { stationId: '466920', stationName: '臺北', county: '臺北市', township: '中正區', lat: 25.0376, lon: 121.5148, temperature: 28.6, humidity: 76, rainfall: 0.0, windSpeed: 2.1, obsTime: new Date().toISOString() },
  { stationId: '466910', stationName: '鞍部 (陽明山)', county: '臺北市', township: '北投區', lat: 25.1825, lon: 121.5297, temperature: 22.4, humidity: 88, rainfall: 2.5, windSpeed: 4.8, obsTime: new Date().toISOString() },
  { stationId: '466900', stationName: '淡水', county: '新北市', township: '淡水區', lat: 25.1648, lon: 121.4489, temperature: 27.9, humidity: 79, rainfall: 0.0, windSpeed: 3.2, obsTime: new Date().toISOString() },
  { stationId: '466940', stationName: '基隆', county: '基隆市', township: '仁愛區', lat: 25.1333, lon: 121.7405, temperature: 27.1, humidity: 82, rainfall: 1.0, windSpeed: 3.6, obsTime: new Date().toISOString() },
  { stationId: 'C0C480', stationName: '桃園 (新屋)', county: '桃園市', township: '新屋區', lat: 25.0069, lon: 121.0474, temperature: 29.2, humidity: 73, rainfall: 0.0, windSpeed: 4.2, obsTime: new Date().toISOString() },
  { stationId: '467570', stationName: '新竹', county: '新竹市', township: '東區', lat: 24.8279, lon: 120.9272, temperature: 29.8, humidity: 71, rainfall: 0.0, windSpeed: 3.9, obsTime: new Date().toISOString() },
  { stationId: 'C0D580', stationName: '竹東', county: '新竹縣', township: '竹東鎮', lat: 24.7337, lon: 121.0864, temperature: 28.5, humidity: 75, rainfall: 0.0, windSpeed: 2.0, obsTime: new Date().toISOString() },
  { stationId: 'C0E750', stationName: '苗栗', county: '苗栗縣', township: '苗栗市', lat: 24.5652, lon: 120.8252, temperature: 30.1, humidity: 68, rainfall: 0.0, windSpeed: 2.7, obsTime: new Date().toISOString() },
  { stationId: '467490', stationName: '臺中', county: '臺中市', township: '北區', lat: 24.1457, lon: 120.6841, temperature: 31.5, humidity: 65, rainfall: 0.0, windSpeed: 1.8, obsTime: new Date().toISOString() },
  { stationId: 'C0F970', stationName: '大甲', county: '臺中市', township: '大甲區', lat: 24.3512, lon: 120.6214, temperature: 30.8, humidity: 69, rainfall: 0.0, windSpeed: 3.5, obsTime: new Date().toISOString() },
  { stationId: '467550', stationName: '日月潭', county: '南投縣', township: '魚池鄉', lat: 23.8814, lon: 120.9081, temperature: 23.2, humidity: 84, rainfall: 0.5, windSpeed: 1.4, obsTime: new Date().toISOString() },
  { stationId: '467530', stationName: '阿里山', county: '嘉義縣', township: '阿里山鄉', lat: 23.5083, lon: 120.8133, temperature: 14.8, humidity: 92, rainfall: 4.0, windSpeed: 2.1, obsTime: new Date().toISOString() },
  { stationId: '467480', stationName: '嘉義', county: '嘉義市', township: '西區', lat: 23.4959, lon: 120.4329, temperature: 31.8, humidity: 69, rainfall: 0.0, windSpeed: 1.6, obsTime: new Date().toISOString() },
  { stationId: '467410', stationName: '臺南', county: '臺南市', township: '中西區', lat: 22.9933, lon: 120.2046, temperature: 32.4, humidity: 72, rainfall: 0.0, windSpeed: 2.5, obsTime: new Date().toISOString() },
  { stationId: '467440', stationName: '高雄', county: '高雄市', township: '前鎮區', lat: 22.5660, lon: 120.3157, temperature: 33.1, humidity: 70, rainfall: 0.0, windSpeed: 2.8, obsTime: new Date().toISOString() },
  { stationId: '467590', stationName: '恆春', county: '屏東縣', township: '恆春鎮', lat: 22.0039, lon: 120.7463, temperature: 31.0, humidity: 78, rainfall: 0.0, windSpeed: 5.6, obsTime: new Date().toISOString() },
  { stationId: '467080', stationName: '宜蘭', county: '宜蘭縣', township: '宜蘭市', lat: 24.7639, lon: 121.7565, temperature: 27.5, humidity: 80, rainfall: 0.5, windSpeed: 2.2, obsTime: new Date().toISOString() },
  { stationId: '466990', stationName: '花蓮', county: '花蓮縣', township: '花蓮市', lat: 23.9752, lon: 121.6133, temperature: 28.7, humidity: 77, rainfall: 0.0, windSpeed: 3.1, obsTime: new Date().toISOString() },
  { stationId: '467660', stationName: '臺東', county: '臺東縣', township: '臺東市', lat: 22.7522, lon: 121.1546, temperature: 29.4, humidity: 75, rainfall: 0.0, windSpeed: 3.4, obsTime: new Date().toISOString() },
  { stationId: '467350', stationName: '澎湖 (馬公)', county: '澎湖縣', township: '馬公市', lat: 23.5655, lon: 119.5631, temperature: 30.2, humidity: 74, rainfall: 0.0, windSpeed: 6.2, obsTime: new Date().toISOString() },
  { stationId: '467110', stationName: '金門', county: '金門縣', township: '金城鎮', lat: 24.4074, lon: 118.2893, temperature: 29.0, humidity: 76, rainfall: 0.0, windSpeed: 4.1, obsTime: new Date().toISOString() },
  { stationId: '467990', stationName: '馬祖 (南竿)', county: '連江縣', township: '南竿鄉', lat: 26.1558, lon: 119.9234, temperature: 26.8, humidity: 81, rainfall: 0.0, windSpeed: 5.0, obsTime: new Date().toISOString() },
  { stationId: '467770', stationName: '玉山', county: '南投縣', township: '信義鄉', lat: 23.4876, lon: 120.9595, temperature: 6.2, humidity: 95, rainfall: 8.0, windSpeed: 7.2, obsTime: new Date().toISOString() },
  { stationId: '467650', stationName: '合歡山', county: '花蓮縣', township: '秀林鄉', lat: 24.1415, lon: 121.2842, temperature: 9.8, humidity: 90, rainfall: 5.5, windSpeed: 6.4, obsTime: new Date().toISOString() },
];

/**
 * Temperature Color Grading Function
 * @param {number|null} temp
 * @returns {string} Hex color
 */
function getTemperatureColor(temp) {
  if (temp === null || temp === undefined || isNaN(temp)) return '#718096';
  if (temp < 15) return '#1e90ff';      // Deep Blue
  if (temp < 20) return '#00e5ff';      // Cyan
  if (temp < 25) return '#00e676';      // Emerald Green
  if (temp < 30) return '#ffd600';      // Amber Yellow
  if (temp < 35) return '#ff6d00';      // Orange
  return '#ff1744';                     // Extreme Hot Red
}

/**
 * Format timestamp into readable relative / absolute format
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

  // Esri World Dark Gray Canvas Tile Layer (Clean, crisp, dark sci-fi aesthetic)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, OpenStreetMap',
    maxZoom: 16,
  }).addTo(state.map);

  state.markersLayer = L.layerGroup().addTo(state.map);

  // Load Taiwan Counties GeoJSON
  fetch('taiwan-counties.json')
    .then((res) => res.json())
    .then((geoJsonData) => {
      state.geoJsonLayer = L.geoJSON(geoJsonData, {
        style: {
          color: 'rgba(0, 212, 255, 0.45)',
          weight: 1.5,
          opacity: 0.8,
          fillColor: 'rgba(0, 212, 255, 0.05)',
          fillOpacity: 0.2,
          dashArray: '4, 4',
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.COUNTYNAME) {
            layer.bindTooltip(feature.properties.COUNTYNAME, {
              permanent: false,
              direction: 'center',
              className: 'county-tooltip',
            });
          }
        },
      }).addTo(state.map);
    })
    .catch((err) => console.warn('Could not load taiwan-counties.json:', err));
}

/**
 * Render Station Markers on Map
 */
function renderMarkers() {
  if (!state.markersLayer) return;
  state.markersLayer.clearLayers();

  const query = state.searchQuery.toLowerCase().trim();
  const selectedCounty = state.activeCountyFilter;

  let visibleCount = 0;

  for (const st of state.stations) {
    // Filter matching
    const matchCounty = selectedCounty === 'ALL' || (st.county && st.county.includes(selectedCounty));
    const matchSearch =
      !query ||
      (st.stationName && st.stationName.toLowerCase().includes(query)) ||
      (st.stationId && st.stationId.toLowerCase().includes(query)) ||
      (st.county && st.county.toLowerCase().includes(query)) ||
      (st.township && st.township.toLowerCase().includes(query));

    if (!matchCounty || !matchSearch) continue;

    visibleCount++;

    const color = getTemperatureColor(st.temperature);
    const tempDisplay = st.temperature !== null ? `${Math.round(st.temperature)}°` : '--';

    // Custom DivIcon
    const customIcon = L.divIcon({
      className: 'weather-marker-icon',
      html: `
        <div class="marker-inner-pulse" style="background: ${color}; border-color: ${color}; box-shadow: 0 0 12px ${color};">
          <span>${tempDisplay}</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });

    const marker = L.marker([st.lat, st.lon], { icon: customIcon });

    // Popup Content
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
            <span>🌧️ 累積降雨</span>
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

  // Update counts
  const visibleCountEl = document.getElementById('visible-station-count');
  const totalCountEl = document.getElementById('total-station-count');
  if (visibleCountEl) visibleCountEl.textContent = visibleCount;
  if (totalCountEl) totalCountEl.textContent = state.stations.length;
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
    tempCard.style.boxShadow = `0 0 10px ${color}44`;
  }

  if (humEl) humEl.textContent = st.humidity !== null ? st.humidity.toFixed(0) : '--';
  if (rainEl) rainEl.textContent = st.rainfall !== null ? st.rainfall.toFixed(1) : '0.0';
  if (windEl) windEl.textContent = st.windSpeed !== null ? st.windSpeed.toFixed(1) : (st.elevation ? `${st.elevation}m` : '--');
  if (coordsEl) coordsEl.textContent = `${st.lat.toFixed(4)}, ${st.lon.toFixed(4)}`;
  if (obsTimeEl) obsTimeEl.textContent = formatTimeString(st.obsTime);
}

/**
 * Fetch Weather Data from API or Fallback
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
      console.warn('API /api/weather unavailable, using fallback data:', e);
    }

    if (data && data.stations && data.stations.length > 0) {
      state.stations = data.stations;
      state.lastSyncIso = data.lastSyncedAt || new Date().toISOString();
      updateDBTelemetry(data.source, state.lastSyncIso);
    } else {
      // Fallback
      state.stations = FALLBACK_STATIONS;
      state.lastSyncIso = new Date().toISOString();
      updateDBTelemetry('demo_fallback', state.lastSyncIso);
    }

    renderMarkers();

    if (isManual) {
      showToast('⚡ CWA 氣象資料同步完成！');
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

  // Refetch latest
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
    if (label) label.textContent = 'LOCAL DATA // READY';
  }

  if (timeEl) {
    timeEl.textContent = formatTimeString(isoString);
  }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Sync button
  const syncBtn = document.getElementById('btn-force-sync');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      triggerSync();
    });
  }

  // County Select
  const countySelect = document.getElementById('county-select');
  if (countySelect) {
    countySelect.addEventListener('change', (e) => {
      state.activeCountyFilter = e.target.value;
      renderMarkers();
    });
  }

  // Search Input
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('btn-clear-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (clearBtn) clearBtn.style.display = state.searchQuery ? 'block' : 'none';
      renderMarkers();
    });
  }
  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearBtn.style.display = 'none';
      renderMarkers();
    });
  }

  // Reset Zoom
  const zoomBtn = document.getElementById('btn-zoom-taiwan');
  if (zoomBtn && state.map) {
    zoomBtn.addEventListener('click', () => {
      state.map.flyTo([23.7, 120.95], 8, { duration: 1.2 });
    });
  }
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupEventListeners();
  fetchWeatherData();

  // Polling every 60s
  setInterval(() => {
    fetchWeatherData(false);
  }, 60000);
});
