# AI Security - Lab 03_1 (L03_1): CWA 台灣自動氣象站觀測地圖 (Python + Vercel Edition)

本專案為 **Lab 03 的 Python Serverless + Vercel 全端重構版本 (L03_1)**。後端全面改用 **Python 3.9+** 實作中央氣象署（CWA）開放資料 API 介接、PostgreSQL 雲端資料庫持久化、Vercel Python Serverless Functions 部署架構與 Cron 定時排程，並搭配 STARK HUD 科幻風格 Leaflet 台灣 GIS 地圖前端。

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Lab%2003__1%20Python-00d4ff?style=for-the-badge&logo=python)](https://aaronh945.github.io/AI_Security_HW/L03_1/)

---

## 🌐 成果預覽與 Demo

- **Lab 03_1 (Python Edition)**: [https://aaronh945.github.io/AI_Security_HW/L03_1/](https://aaronh945.github.io/AI_Security_HW/L03_1/)
- **Lab 03 (Node.js Edition)**: [https://aaronh945.github.io/AI_Security_HW/L03/](https://aaronh945.github.io/AI_Security_HW/L03/)
- **Main Hub (課程總首頁)**: [https://aaronh945.github.io/AI_Security_HW/](https://aaronh945.github.io/AI_Security_HW/)

![L03_1 Python CWA Map Preview](screenshot.png)

---

## 🔄 L03 (JavaScript) 與 L03_1 (Python) 技術架構對比

| 比較項目 | L03 (JavaScript / Node.js) | L03_1 (Python + Vercel) |
| :--- | :--- | :--- |
| **後端語言** | JavaScript (Node.js 18+) | **Python 3.9+** |
| **Serverless 執行環境** | Vercel Node.js Runtime (`@vercel/node`) | **Vercel Python Runtime (`@vercel/python`)** |
| **氣象 API 擷取模組** | `lib/cwa.js` (原生 `https`) | **`lib/cwa.py` (`urllib` / `requests`)** |
| **資料庫連線與 ORM** | `lib/db.js` (`pg` Pool) | **`lib/db.py` (`psycopg2-binary` / `pg8000`)** |
| **查詢端點 (`/api/weather`)** | `api/weather.js` (Express-style handler) | **`api/weather.py` (`BaseHTTPRequestHandler`)** |
| **定時同步端點 (`/api/sync`)** | `api/sync.js` (Cron Handler) | **`api/sync.py` (`BaseHTTPRequestHandler`)** |
| **本地開發伺服器** | `npx serve` / Node.js | **`python server.py` (內建零依賴開發伺服器)** |
| **套件相依清單** | `package.json` | **`requirements.txt`** |

---

## ✨ 核心功能特色

1. **🐍 Python 驅動的 CWA Open Data 串接與資料清洗**：
   - 介接中央氣象署 `O-A0001-001`（自動氣象站）與 `O-A0003-001`（局屬氣象站）。
   - Python 模組自動過濾無效缺測碼（`-99`, `-999`），精確標準化氣溫、相對濕度、累積雨量、風速、經緯度與海拔高度。
2. **🐘 PostgreSQL 資料庫自動遷移與 Upsert**：
   - Python `lib/db.py` 具備自動建表功能（`init_schema()`），支援 `stations`、`weather_records`、`sync_logs`。
   - 採用高效能 `execute_batch` 進行批次 Upsert，相容 Vercel Postgres、Neon、Supabase、Railway 等雲端資料庫。
3. **⚡ Vercel Python Serverless 雲端原生架構**：
   - 透過 `vercel.json` 配置 `@vercel/python` Runtime。
   - 支援 Vercel Cron 每 10 分鐘自動觸發 `/api/sync` 更新資料庫。
4. **🗺️ 台灣 22 縣市 GIS 地圖與即時天氣縮圖**：
   - 預設總覽模式於地圖各縣市幾何中心呈現天氣概況標籤（☀️ 晴天、⛅ 晴時多雲、🌧️ 雨天、☁️ 陰天）。
   - 點選任一縣市自動平滑聚焦邊界，展開轄區內所有氣象站詳細列表與平均遙測數據。
5. **🌡️ 動態六段溫度色階 Marker**：
   - 依即時氣溫動態呈現冰藍（<15°C）、青綠（15-20°C）、翡翠綠（20-25°C）、暖黃（25-30°C）、橙紅（30-35°C）及酷熱紅（&ge;35°C）。
6. **💻 內建 Python 本地開發伺服器**：
   - 執行 `python server.py` 即可在本地啟動兼具靜態前端與 Python Serverless API 的整合開發環境。

---

## 📂 L03_1 目錄結構

```text
L03_1/
├── index.html            # 台灣氣象站 Leaflet 地圖主頁面 (STARK HUD)
├── style.css             # 科幻主題與響應式樣式
├── app.js                # 前端地圖渲染、測站互動與 Python API 串接
├── server.py             # 本地 Python 開發伺服器 (包含 API 路由與靜態伺服)
├── requirements.txt      # Python 依賴套件 (psycopg2-binary, requests)
├── vercel.json           # Vercel Python Runtime 與 Cron 配置
├── taiwan-counties.json  # 台灣 22 縣市行政區邊界 GeoJSON
├── screenshot.png        # 介面預覽截圖
├── .env.example          # 環境變數設定範例
├── api/                  # Vercel Python Serverless Functions
│   ├── __init__.py
│   ├── weather.py        # /api/weather 氣象觀測資料查詢端點
│   └── sync.py           # /api/sync CWA 至 PostgreSQL 同步端點
├── lib/                  # Python 後端核心模組
│   ├── __init__.py
│   ├── cwa.py            # CWA API 抓取、清洗與 22 縣市 Fallback 模擬資料
│   └── db.py             # PostgreSQL 連線池、自動 DDL、批次 Upsert
└── sql/
    └── schema.sql        # PostgreSQL 資料表結構定義檔 (DDL)
```

---

## ⚙️ 快速上手教學

### 1. 本地環境執行 (Local Development)

本專案內建 `server.py`，支援直接本地啟動：

```bash
# 1. 切換至 L03_1 目錄
cd L03_1

# 2. (選用) 安裝依賴套件 (若需連線實體 PostgreSQL)
pip install -r requirements.txt

# 3. 啟動 Python 開發伺服器 (預設 Port 8000)
python server.py

# 4. 開啟瀏覽器訪問
# 前端介面: http://localhost:8000/
# 氣象 API:  http://localhost:8000/api/weather
# 同步 API:  http://localhost:8000/api/sync
```

---

### 2. 設定環境變數 (.env)

若需串接中央氣象署即時 API 與遠端 PostgreSQL 資料庫，複製 `.env.example` 為 `.env`：

```bash
# 中央氣象署 API 授權碼 (可至 https://opendata.cwa.gov.tw/ 申請)
CWA_API_KEY=CWA-你的授權碼

# PostgreSQL 連線字串 (支援 Neon, Supabase, Vercel Postgres 等)
POSTGRES_URL=postgres://username:password@ep-host.region.aws.neon.tech/dbname?sslmode=require
```

---

### 3. 部署至 Vercel (Deploying to Vercel)

1. 將專案推送到 GitHub。
2. 登入 [Vercel Dashboard](https://vercel.com/)，點選 **"Add New Project"** 匯入此 Repository。
3. 若將 `L03_1` 作為獨立專案部署，設定 **Root Directory** 為 `L03_1`。
4. 在 **Environment Variables** 新增：
   - `CWA_API_KEY`: 填入中央氣象署 API 授權碼。
   - `POSTGRES_URL`: 填入 PostgreSQL 連線字串。
5. 點擊 **Deploy**，Vercel 將自動透過 `@vercel/python` 建置 Python Serverless Functions，並依 `vercel.json` 啟動每 10 分鐘自動排程同步！

---

## 📡 Python API 規格說明

### 1. 氣象資料查詢 `GET /api/weather`
- **回應內容**：最新各測站氣溫、濕度、累積雨量、經緯度與行政區。
- **資料來源優先級**：
  1. `python_postgresql`：優先自雲端 PostgreSQL 資料庫讀取。
  2. `python_cwa_direct`：若未設定資料庫，直接從 CWA API 即時獲取。
  3. `python_demo_fallback`：若無網路或金鑰，自動載入內建 22 縣市完整模擬觀測資料。

### 2. 定時同步 `GET/POST /api/sync`
- **功能**：由 Vercel Cron 或使用者手動觸發，向中央氣象署抓取最新資料並 Upsert 寫入 PostgreSQL。

---

## 📝 授權聲明

本專案為國立臺北科技大學資訊工程系 AI Security 課程作業與學術研究用途。氣象資料來源為中華民國交通部中央氣象署（CWA）開放資料。
