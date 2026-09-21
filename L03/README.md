# AI Security - Lab 03 (L03): CWA 台灣自動氣象站觀測地圖與 PostgreSQL 系統

本專案實作了中央氣象署（CWA）自動氣象站開放資料介接、PostgreSQL 雲端資料庫儲存、台灣行政區 Leaflet 互動地圖可視化、動態溫度色階 Marker、以及 Vercel 自動部署與 Cron 定時排程同步。

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Lab%2003%20Hub-00d4ff?style=for-the-badge&logo=github)](https://aaronh945.github.io/AI_Security_HW/L03/)

---

## 🌐 成果預覽與 Live Demo

- **Lab 03 展示頁**: [https://aaronh945.github.io/AI_Security_HW/L03/](https://aaronh945.github.io/AI_Security_HW/L03/)
- **Main Hub (總目錄)**: [https://aaronh945.github.io/AI_Security_HW/](https://aaronh945.github.io/AI_Security_HW/)

![L03 CWA Weather Map Preview](screenshot.png)

---

## ✨ 核心功能特色

1. **中央氣象署 CWA API 串接**：
   - 介接 CWA 自動氣象站觀測資料（`O-A0001-001` 與 `O-A0003-001`）。
   - 自動過濾清洗缺測值（`-99`, `-999`）並標準化氣溫、濕度、累積雨量、風速與經緯度。
2. **PostgreSQL 雲端資料庫持久化**：
   - 自動建表（`stations`、`weather_records`、`sync_logs`）。
   - 支援自動 Upsert 測站資訊與唯一觀測記錄，支援 Vercel Postgres、Neon、Supabase、Railway 等標準 PostgreSQL。
3. **台灣地圖與行政區視覺化**：
   - 基於 Leaflet.js 與高對比度暗色系圖層，結合台灣縣市邊界 GeoJSON 描繪。
4. **精準經緯度 Marker 與動態溫度色階**：
   - **< 15°C**：冰藍色 (`#1e90ff`)
   - **15 ~ 20°C**：青綠色 (`#00e5ff`)
   - **20 ~ 25°C**：翡翠綠 (`#00e676`)
   - **25 ~ 30°C**：暖黃色 (`#ffd600`)
   - **30 ~ 35°C**：橙紅色 (`#ff6d00`)
   - **&ge; 35°C**：酷熱紅色 (`#ff1744`)
5. **點擊 Marker 即時彈出卡片與側邊欄遙測**：
   - 點擊測站即刻顯示測站名稱、縣市、鄉鎮區、即時氣溫（°C）、相對濕度（%）、累積雨量（mm）及觀測時間。
6. **Vercel 自動部署與 Cron 定時排程**：
   - 內建 `vercel.json`，配置每 10 分鐘自動執行 `/api/sync` 更新資料庫。
7. **即時遙測與最後成功更新時間顯示**：
   - 頂部狀態列即時顯示最後同步時間與資料來源狀態（PostgreSQL / CWA Direct / Local Cache）。

---

## 📂 目錄架構

```text
L03/
├── index.html            # 台灣氣象站 Leaflet 地圖主頁面
├── style.css             # STARK HUD 科幻主題與響應式樣式
├── app.js                # 地圖渲染、測站標記、溫度色階、資料篩選邏輯
├── taiwan-counties.json  # 台灣行政區邊界 GeoJSON
├── screenshot.png        # 介面預覽截圖
├── .env.example          # 環境變數設定範例
├── sql/
│   └── schema.sql        # PostgreSQL 資料表結構定義檔
└── README.md             # Lab 03 專案說明文件
```

---

## ⚙️ 快速上手與部署教學

### 1. 取得 CWA API 授權碼
1. 前往 [中央氣象署氣象資料開放平臺](https://opendata.cwa.gov.tw/) 註冊會員。
2. 進入「會員資訊」複製個人的 **API 授權碼 (Authorization Key)**。

### 2. 設定 PostgreSQL 資料庫
可使用 [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)、[Neon](https://neon.tech/) 或 [Supabase](https://supabase.com/) 建立免費 PostgreSQL 資料庫，取得連線字串（例如 `postgres://user:password@host/db?sslmode=require`）。

系統在第一次連線時會自動執行 DDL 建表，無需手動建立。

### 3. 本地環境變數設定
複製 `.env.example` 並重新命名為 `.env`：
```bash
CWA_API_KEY=CWA-你的授權碼
POSTGRES_URL=postgres://你的資料庫連線字串
```

### 4. 部署至 Vercel
1. 將專案 Push 到 GitHub。
2. 在 [Vercel Dashboard](https://vercel.com/) 點擊 **"Add New Project"** 並匯入此 GitHub Repository。
3. 在專案設定中的 **Environment Variables** 新增：
   - `CWA_API_KEY`: 填入中央氣象署 API 授權碼。
   - `POSTGRES_URL`: 填入 PostgreSQL 連線字串。
4. 點擊 **Deploy**，Vercel 將自動建立 Serverless Function 及 Cron 定時排程！

---

## 📝 授權聲明

本專案為 AI Security 課程作業與學術研究用途，氣象資料來源為中華民國交通部中央氣象署（CWA）開放資料。
