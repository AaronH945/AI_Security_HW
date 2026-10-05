"""
CWA (Central Weather Administration) Open Data API Fetcher & Parser in Python
Compatible with Vercel Serverless Functions & Local Python Runtime.
"""

import os
import json
import urllib.request
import urllib.error
import ssl
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

def parse_numeric(val: Any) -> Optional[float]:
    """
    Parses numeric float value while filtering missing data codes (-99, -999).
    """
    if val is None or val == '':
        return None
    try:
        num = float(val)
        if num <= -90.0:  # CWA convention: -99 or -999 represents missing/invalid observation
            return None
        return num
    except (ValueError, TypeError):
        return None

def fetch_json(url: str, timeout: int = 15) -> Dict[str, Any]:
    """
    Fetches JSON data from URL using standard library urllib with SSL support.
    """
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Security-L03-Python/1.0',
            'Accept': 'application/json'
        }
    )
    # Allow SSL context verification
    context = ssl.create_default_context()
    
    with urllib.request.urlopen(req, timeout=timeout, context=context) as response:
        if response.status < 200 or response.status >= 300:
            raise urllib.error.HTTPError(url, response.status, f"HTTP Error {response.status}", response.headers, None)
        raw_data = response.read().decode('utf-8')
        return json.loads(raw_data)

def normalize_cwa_stations(cwa_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Normalizes CWA Station JSON schema (O-A0001-001 & O-A0003-001) into standard dictionaries.
    """
    records = cwa_json.get('records', {})
    if not records:
        return []

    stations = records.get('Station') or records.get('location') or []
    normalized: List[Dict[str, Any]] = []

    for st in stations:
        station_id = st.get('StationId') or st.get('stationId') or st.get('stationCode')
        station_name = st.get('StationName') or st.get('locationName') or st.get('stationName')

        lat: Optional[float] = None
        lon: Optional[float] = None
        elevation: float = 0.0
        county: str = ''
        township: str = ''

        geo_info = st.get('GeoInfo')
        if geo_info:
            coords = geo_info.get('Coordinates', [])
            if coords and len(coords) > 0:
                try:
                    lat = float(coords[0].get('StationLatitude', 0))
                    lon = float(coords[0].get('StationLongitude', 0))
                except (ValueError, TypeError):
                    pass
            county = geo_info.get('CountyName', '') or ''
            township = geo_info.get('TownName', '') or ''
            try:
                elevation = float(geo_info.get('StationAltitude', 0) or 0)
            except (ValueError, TypeError):
                elevation = 0.0
        elif 'lat' in st or 'latitute' in st or 'latDegree' in st:
            try:
                lat = float(st.get('lat') or st.get('latitute') or st.get('latDegree', 0))
                lon = float(st.get('lon') or st.get('longitude') or st.get('lonDegree', 0))
            except (ValueError, TypeError):
                pass
            params = st.get('parameter', [])
            for p in params:
                if p.get('parameterName') == 'CITY':
                    county = p.get('parameterValue', '')
                elif p.get('parameterName') == 'TOWN':
                    township = p.get('parameterValue', '')

        if lat is None or lon is None or lat == 0 or lon == 0:
            continue

        # Weather Elements
        temperature: Optional[float] = None
        humidity: Optional[float] = None
        rainfall: Optional[float] = None
        wind_speed: Optional[float] = None
        
        obs_time = (
            (st.get('ObsTime') or {}).get('DateTime')
            or (st.get('time') or {}).get('obsTime')
            or datetime.now(timezone.utc).isoformat()
        )

        we = st.get('WeatherElement')
        if isinstance(we, dict):
            temperature = parse_numeric(we.get('AirTemperature'))
            humidity = parse_numeric(we.get('RelativeHumidity'))
            wind_speed = parse_numeric(we.get('WindSpeed'))

            now_rain = we.get('Now', {})
            if isinstance(now_rain, dict) and 'Precipitation' in now_rain:
                rainfall = parse_numeric(now_rain.get('Precipitation'))
            elif 'DailyPrecipitation' in we:
                rainfall = parse_numeric(we.get('DailyPrecipitation'))
            elif 'Precipitation' in we:
                rainfall = parse_numeric(we.get('Precipitation'))
        elif isinstance(st.get('weatherElement'), list):
            for el in st.get('weatherElement', []):
                name = el.get('elementName')
                val = el.get('elementValue')
                if name == 'TEMP':
                    temperature = parse_numeric(val)
                elif name == 'HUMD':
                    h_val = parse_numeric(val)
                    humidity = h_val * 100 if h_val and h_val <= 1.0 else h_val
                elif name in ('24R', 'RAIN', 'HOUR_24'):
                    rainfall = parse_numeric(val)
                elif name == 'WDSD':
                    wind_speed = parse_numeric(val)

        normalized.append({
            'stationId': str(station_id),
            'stationName': str(station_name),
            'county': county,
            'township': township,
            'lat': lat,
            'lon': lon,
            'elevation': elevation,
            'temperature': temperature,
            'humidity': humidity,
            'rainfall': max(0.0, rainfall) if rainfall is not None else 0.0,
            'windSpeed': wind_speed,
            'obsTime': obs_time,
        })

    return normalized

def fetch_cwa_data(api_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Fetches live data from Central Weather Administration API (O-A0001-001 and O-A0003-001).
    """
    key = api_key or os.environ.get('CWA_API_KEY')
    if not key:
        raise ValueError('CWA_API_KEY environment variable is not configured.')

    url1 = f"https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization={key}&format=JSON"
    url2 = f"https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization={key}&format=JSON"

    stations: List[Dict[str, Any]] = []

    # 1. Fetch Auto Weather Stations (自動氣象站)
    try:
        data1 = fetch_json(url1)
        stations.extend(normalize_cwa_stations(data1))
    except Exception as err:
        print(f"[Warning] CWA O-A0001-001 fetch warning: {err}")

    # 2. Fetch Bureau Stations (局屬氣象站)
    try:
        data2 = fetch_json(url2)
        stations.extend(normalize_cwa_stations(data2))
    except Exception as err:
        print(f"[Warning] CWA O-A0003-001 fetch warning: {err}")

    if not stations:
        raise RuntimeError("Failed to retrieve any stations from CWA API endpoints.")

    return stations

def get_sample_taiwan_stations() -> List[Dict[str, Any]]:
    """
    Comprehensive Taiwan 22-county fallback observation dataset for instant demo.
    """
    now = datetime.now(timezone.utc).isoformat()
    return [
        # 臺北市
        {'stationId': '466920', 'stationName': '臺北', 'county': '臺北市', 'township': '中正區', 'lat': 25.0376, 'lon': 121.5148, 'temperature': 28.6, 'humidity': 70.0, 'rainfall': 0.0, 'windSpeed': 2.1, 'obsTime': now},
        {'stationId': '466910', 'stationName': '鞍部 (陽明山)', 'county': '臺北市', 'township': '北投區', 'lat': 25.1825, 'lon': 121.5297, 'temperature': 22.4, 'humidity': 88.0, 'rainfall': 2.5, 'windSpeed': 4.8, 'obsTime': now},
        {'stationId': 'C0A980', 'stationName': '內湖', 'county': '臺北市', 'township': '內湖區', 'lat': 25.0805, 'lon': 121.5898, 'temperature': 28.2, 'humidity': 72.0, 'rainfall': 0.0, 'windSpeed': 1.8, 'obsTime': now},
        {'stationId': 'C0A9F0', 'stationName': '信義 (市府)', 'county': '臺北市', 'township': '信義區', 'lat': 25.0335, 'lon': 121.5645, 'temperature': 29.0, 'humidity': 69.0, 'rainfall': 0.0, 'windSpeed': 2.0, 'obsTime': now},

        # 新北市
        {'stationId': '466900', 'stationName': '淡水', 'county': '新北市', 'township': '淡水區', 'lat': 25.1648, 'lon': 121.4489, 'temperature': 27.9, 'humidity': 64.0, 'rainfall': 0.0, 'windSpeed': 3.2, 'obsTime': now},
        {'stationId': '466880', 'stationName': '板橋', 'county': '新北市', 'township': '板橋區', 'lat': 25.0080, 'lon': 121.4450, 'temperature': 29.1, 'humidity': 68.0, 'rainfall': 0.0, 'windSpeed': 2.4, 'obsTime': now},
        {'stationId': 'C0A920', 'stationName': '九份 (瑞芳)', 'county': '新北市', 'township': '瑞芳區', 'lat': 25.1090, 'lon': 121.8440, 'temperature': 24.5, 'humidity': 86.0, 'rainfall': 3.0, 'windSpeed': 4.1, 'obsTime': now},
        {'stationId': 'C0A940', 'stationName': '新店', 'county': '新北市', 'township': '新店區', 'lat': 24.9675, 'lon': 121.5410, 'temperature': 28.8, 'humidity': 71.0, 'rainfall': 0.0, 'windSpeed': 1.9, 'obsTime': now},

        # 基隆市
        {'stationId': '466940', 'stationName': '基隆', 'county': '基隆市', 'township': '仁愛區', 'lat': 25.1333, 'lon': 121.7405, 'temperature': 27.1, 'humidity': 84.0, 'rainfall': 2.0, 'windSpeed': 3.6, 'obsTime': now},
        {'stationId': 'C0B010', 'stationName': '基隆嶼', 'county': '基隆市', 'township': '中正區', 'lat': 25.1920, 'lon': 121.7860, 'temperature': 26.5, 'humidity': 88.0, 'rainfall': 2.2, 'windSpeed': 5.4, 'obsTime': now},

        # 桃園市
        {'stationId': 'C0C480', 'stationName': '桃園 (新屋)', 'county': '桃園市', 'township': '新屋區', 'lat': 25.0069, 'lon': 121.0474, 'temperature': 29.2, 'humidity': 62.0, 'rainfall': 0.0, 'windSpeed': 4.2, 'obsTime': now},
        {'stationId': 'C0C700', 'stationName': '中壢', 'county': '桃園市', 'township': '中壢區', 'lat': 24.9680, 'lon': 121.2250, 'temperature': 29.6, 'humidity': 60.0, 'rainfall': 0.0, 'windSpeed': 2.8, 'obsTime': now},
        {'stationId': 'C0C590', 'stationName': '大溪', 'county': '桃園市', 'township': '大溪區', 'lat': 24.8810, 'lon': 121.2870, 'temperature': 28.9, 'humidity': 63.0, 'rainfall': 0.0, 'windSpeed': 2.1, 'obsTime': now},

        # 新竹市
        {'stationId': '467570', 'stationName': '新竹', 'county': '新竹市', 'township': '東區', 'lat': 24.8279, 'lon': 120.9272, 'temperature': 29.8, 'humidity': 59.0, 'rainfall': 0.0, 'windSpeed': 3.9, 'obsTime': now},
        {'stationId': 'C0D570', 'stationName': '香山', 'county': '新竹市', 'township': '香山區', 'lat': 24.7830, 'lon': 120.9150, 'temperature': 29.5, 'humidity': 61.0, 'rainfall': 0.0, 'windSpeed': 4.1, 'obsTime': now},

        # 新竹縣
        {'stationId': 'C0D580', 'stationName': '竹東', 'county': '新竹縣', 'township': '竹東鎮', 'lat': 24.7337, 'lon': 121.0864, 'temperature': 28.5, 'humidity': 68.0, 'rainfall': 0.0, 'windSpeed': 2.0, 'obsTime': now},
        {'stationId': 'C0D550', 'stationName': '竹北', 'county': '新竹縣', 'township': '竹北市', 'lat': 24.8387, 'lon': 121.0118, 'temperature': 29.3, 'humidity': 66.0, 'rainfall': 0.0, 'windSpeed': 2.5, 'obsTime': now},
        {'stationId': 'C0D660', 'stationName': '尖石', 'county': '新竹縣', 'township': '尖石鄉', 'lat': 24.6750, 'lon': 121.2580, 'temperature': 22.8, 'humidity': 76.0, 'rainfall': 0.0, 'windSpeed': 1.8, 'obsTime': now},

        # 苗栗縣
        {'stationId': 'C0E750', 'stationName': '苗栗', 'county': '苗栗縣', 'township': '苗栗市', 'lat': 24.5652, 'lon': 120.8252, 'temperature': 30.1, 'humidity': 67.0, 'rainfall': 0.0, 'windSpeed': 2.7, 'obsTime': now},
        {'stationId': 'C0E780', 'stationName': '三義', 'county': '苗栗縣', 'township': '三義鄉', 'lat': 24.4130, 'lon': 120.7620, 'temperature': 27.8, 'humidity': 74.0, 'rainfall': 0.0, 'windSpeed': 2.2, 'obsTime': now},
        {'stationId': 'C0E860', 'stationName': '南庄', 'county': '苗栗縣', 'township': '南庄鄉', 'lat': 24.5980, 'lon': 120.9980, 'temperature': 26.5, 'humidity': 71.0, 'rainfall': 0.0, 'windSpeed': 1.9, 'obsTime': now},

        # 臺中市
        {'stationId': '467490', 'stationName': '臺中', 'county': '臺中市', 'township': '北區', 'lat': 24.1457, 'lon': 120.6841, 'temperature': 31.5, 'humidity': 58.0, 'rainfall': 0.0, 'windSpeed': 1.8, 'obsTime': now},
        {'stationId': 'C0F970', 'stationName': '大甲', 'county': '臺中市', 'township': '大甲區', 'lat': 24.3512, 'lon': 120.6214, 'temperature': 30.8, 'humidity': 61.0, 'rainfall': 0.0, 'windSpeed': 3.5, 'obsTime': now},
        {'stationId': 'C0F9K0', 'stationName': '武陵', 'county': '臺中市', 'township': '和平區', 'lat': 24.3580, 'lon': 121.3120, 'temperature': 18.5, 'humidity': 69.0, 'rainfall': 0.0, 'windSpeed': 2.1, 'obsTime': now},

        # 彰化縣
        {'stationId': 'C0G620', 'stationName': '彰化', 'county': '彰化縣', 'township': '彰化市', 'lat': 24.0810, 'lon': 120.5580, 'temperature': 31.2, 'humidity': 60.0, 'rainfall': 0.0, 'windSpeed': 2.3, 'obsTime': now},
        {'stationId': 'C0G650', 'stationName': '員林', 'county': '彰化縣', 'township': '員林市', 'lat': 23.9590, 'lon': 120.5740, 'temperature': 31.6, 'humidity': 59.0, 'rainfall': 0.0, 'windSpeed': 2.0, 'obsTime': now},
        {'stationId': 'C0G640', 'stationName': '鹿港', 'county': '彰化縣', 'township': '鹿港鎮', 'lat': 24.0580, 'lon': 120.4350, 'temperature': 30.5, 'humidity': 63.0, 'rainfall': 0.0, 'windSpeed': 4.0, 'obsTime': now},

        # 南投縣
        {'stationId': '467550', 'stationName': '日月潭', 'county': '南投縣', 'township': '魚池鄉', 'lat': 23.8814, 'lon': 120.9081, 'temperature': 23.2, 'humidity': 76.0, 'rainfall': 0.0, 'windSpeed': 1.4, 'obsTime': now},
        {'stationId': '467770', 'stationName': '玉山 (頂峰)', 'county': '南投縣', 'township': '信義鄉', 'lat': 23.4876, 'lon': 120.9595, 'temperature': 6.2, 'humidity': 95.0, 'rainfall': 8.0, 'windSpeed': 7.2, 'obsTime': now},
        {'stationId': 'C0H9C0', 'stationName': '埔里', 'county': '南投縣', 'township': '埔里鎮', 'lat': 23.9680, 'lon': 120.9680, 'temperature': 27.5, 'humidity': 71.0, 'rainfall': 0.0, 'windSpeed': 1.6, 'obsTime': now},

        # 雲林縣
        {'stationId': 'C0K400', 'stationName': '斗六', 'county': '雲林縣', 'township': '斗六市', 'lat': 23.7080, 'lon': 120.5430, 'temperature': 31.0, 'humidity': 66.0, 'rainfall': 0.0, 'windSpeed': 1.9, 'obsTime': now},
        {'stationId': 'C0K430', 'stationName': '虎尾', 'county': '雲林縣', 'township': '虎尾鎮', 'lat': 23.7120, 'lon': 120.4320, 'temperature': 31.4, 'humidity': 64.0, 'rainfall': 0.0, 'windSpeed': 2.2, 'obsTime': now},

        # 嘉義市
        {'stationId': '467480', 'stationName': '嘉義', 'county': '嘉義市', 'township': '西區', 'lat': 23.4959, 'lon': 120.4329, 'temperature': 31.8, 'humidity': 58.0, 'rainfall': 0.0, 'windSpeed': 1.6, 'obsTime': now},

        # 嘉義縣
        {'stationId': '467530', 'stationName': '阿里山', 'county': '嘉義縣', 'township': '阿里山鄉', 'lat': 23.5083, 'lon': 120.8133, 'temperature': 14.8, 'humidity': 92.0, 'rainfall': 4.0, 'windSpeed': 2.1, 'obsTime': now},
        {'stationId': 'C0M730', 'stationName': '太保', 'county': '嘉義縣', 'township': '太保市', 'lat': 23.4580, 'lon': 120.3320, 'temperature': 31.5, 'humidity': 62.0, 'rainfall': 0.0, 'windSpeed': 2.4, 'obsTime': now},

        # 臺南市
        {'stationId': '467410', 'stationName': '臺南', 'county': '臺南市', 'township': '中西區', 'lat': 22.9933, 'lon': 120.2046, 'temperature': 32.4, 'humidity': 56.0, 'rainfall': 0.0, 'windSpeed': 2.5, 'obsTime': now},
        {'stationId': 'C0X060', 'stationName': '永康', 'county': '臺南市', 'township': '永康區', 'lat': 23.0280, 'lon': 120.2580, 'temperature': 32.1, 'humidity': 58.0, 'rainfall': 0.0, 'windSpeed': 2.1, 'obsTime': now},

        # 高雄市
        {'stationId': '467440', 'stationName': '高雄', 'county': '高雄市', 'township': '前鎮區', 'lat': 22.5660, 'lon': 120.3157, 'temperature': 33.1, 'humidity': 58.0, 'rainfall': 0.0, 'windSpeed': 2.8, 'obsTime': now},
        {'stationId': 'C0V680', 'stationName': '左營', 'county': '高雄市', 'township': '左營區', 'lat': 22.6890, 'lon': 120.2980, 'temperature': 32.8, 'humidity': 59.0, 'rainfall': 0.0, 'windSpeed': 2.5, 'obsTime': now},

        # 屏東縣
        {'stationId': '467590', 'stationName': '恆春', 'county': '屏東縣', 'township': '恆春鎮', 'lat': 22.0039, 'lon': 120.7463, 'temperature': 31.0, 'humidity': 74.0, 'rainfall': 0.0, 'windSpeed': 5.6, 'obsTime': now},
        {'stationId': 'C0R130', 'stationName': '屏東', 'county': '屏東縣', 'township': '屏東市', 'lat': 22.6730, 'lon': 120.4880, 'temperature': 32.8, 'humidity': 60.0, 'rainfall': 0.0, 'windSpeed': 2.3, 'obsTime': now},

        # 宜蘭縣
        {'stationId': '467080', 'stationName': '宜蘭', 'county': '宜蘭縣', 'township': '宜蘭市', 'lat': 24.7639, 'lon': 121.7565, 'temperature': 27.5, 'humidity': 84.0, 'rainfall': 2.0, 'windSpeed': 2.2, 'obsTime': now},

        # 花蓮縣
        {'stationId': '466990', 'stationName': '花蓮', 'county': '花蓮縣', 'township': '花蓮市', 'lat': 23.9752, 'lon': 121.6133, 'temperature': 28.7, 'humidity': 72.0, 'rainfall': 0.0, 'windSpeed': 3.1, 'obsTime': now},
        {'stationId': '467650', 'stationName': '合歡山 (頂峰)', 'county': '花蓮縣', 'township': '秀林鄉', 'lat': 24.1415, 'lon': 121.2842, 'temperature': 9.8, 'humidity': 90.0, 'rainfall': 5.5, 'windSpeed': 6.4, 'obsTime': now},

        # 臺東縣
        {'stationId': '467660', 'stationName': '臺東', 'county': '臺東縣', 'township': '臺東市', 'lat': 22.7522, 'lon': 121.1546, 'temperature': 29.4, 'humidity': 70.0, 'rainfall': 0.0, 'windSpeed': 3.4, 'obsTime': now},
        {'stationId': '467620', 'stationName': '蘭嶼', 'county': '臺東縣', 'township': '蘭嶼鄉', 'lat': 22.0370, 'lon': 121.5580, 'temperature': 28.0, 'humidity': 78.0, 'rainfall': 0.0, 'windSpeed': 7.5, 'obsTime': now},

        # 澎湖縣
        {'stationId': '467350', 'stationName': '澎湖 (馬公)', 'county': '澎湖縣', 'township': '馬公市', 'lat': 23.5655, 'lon': 119.5631, 'temperature': 30.2, 'humidity': 62.0, 'rainfall': 0.0, 'windSpeed': 6.2, 'obsTime': now},

        # 金門縣
        {'stationId': '467110', 'stationName': '金門 (金城)', 'county': '金門縣', 'township': '金城鎮', 'lat': 24.4074, 'lon': 118.2893, 'temperature': 29.0, 'humidity': 68.0, 'rainfall': 0.0, 'windSpeed': 4.1, 'obsTime': now},

        # 連江縣 (馬祖)
        {'stationId': '467990', 'stationName': '馬祖 (南竿)', 'county': '連江縣', 'township': '南竿鄉', 'lat': 26.1558, 'lon': 119.9234, 'temperature': 26.8, 'humidity': 86.0, 'rainfall': 1.8, 'windSpeed': 5.0, 'obsTime': now},
    ]
