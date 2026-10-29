# Lab 04_2: Top 5 Feature Selection Multi-Dataset Laboratory (8 Benchmark Datasets)

本專案為 **AI Security** 課程之實驗單元 **Lab 04_2**，遵循 **Lab 04_1** 之全 Python 互動式架構，擴展支援 **8 大經典機器學習迴歸資料集**，並實作 **Top 5 特徵選擇演算法（Feature Selection Algorithms）** 之全維度步階分析、動態圖表呈現、跨演算法全景對比與 OLS 多元迴歸擬合診斷。

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-00f2fe?style=for-the-badge&logo=github)](https://aaronh945.github.io/AI_Security_HW/L04_2/)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.32%2B-FF4B4B?style=for-the-badge&logo=streamlit)](https://streamlit.io/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-Stlite%200.72-654FF0?style=for-the-badge&logo=webassembly)](https://github.com/whitphx/stlite)

---

## 📁 支援 8 大機器學習迴歸資料集 (8 Supported Benchmark Datasets)

使用者可在互動式介面左側選單中自由切換以下 8 套資料集，系統將自動調整特徵數量上限 $p$、最佳建議特徵數 $k^*$、評估指標與單位：

| 編號 | 資料集名稱 | 目標變數 (`Target`) | 單位 | 特徵數 ($p$) | 建議最佳特徵數 ($k^*$) | 說明 |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **01** | **Road Accident Risk**<br>(Kaggle S5E10 道路事故風險預測) | `accident_risk` | Risk (0~1) | 16 | $k=9$ | Kaggle Playground S5E10 競賽資料，預測道路事故風險等級。 |
| **02** | **King County House Sales**<br>(美國華盛頓州金郡房價預測) | `price` | USD ($) | 16 | $k=10$ | 包含西雅圖地區房屋特徵（臥室數、衛浴數、面積、地段等）。 |
| **03** | **Spotify Tracks Dataset**<br>(Spotify 音樂流行度預測) | `track_popularity` | Popularity (0~100) | 15 | $k=8$ | 基於歌曲聲學特徵（能量、舞蹈性、效價、節拍等）評估受歡迎度。 |
| **04** | **Laptop Price Dataset**<br>(筆記型電腦售價預測) | `Price_inr` | INR (₹) | 16 | $k=9$ | 包含處理器、記憶體、硬碟容量、顯示卡與螢幕規格對售價之影響。 |
| **05** | **Bike Sharing Demand**<br>(自行車共享租借需求預測) | `cnt` | Rentals / hr | 11 | $k=7$ | 結合氣溫、體感溫度、濕度、風速與季節小時預測每小時租借量。 |
| **06** | **Used Car Price / CarDekho**<br>(二手車價格評估) | `Selling_Price` | Lakhs (₹) | 11 | $k=6$ | 分析出廠年分、里程數、燃油種類、傳動系統對車輛轉售價格之影響。 |
| **07** | **House Rent Prediction**<br>(房屋月租金預測) | `Rent` | INR (₹) | 13 | $k=8$ | 分析房屋面積、房間規格、樓層位置與衛浴數對租金行情的影響。 |
| **08** | **Flight Ticket Price Prediction**<br>(航空機票價格預測) | `Price` | INR (₹) | 16 | $k=10$ | 評估航空公司、航程時間、起降時段、轉機次數與艙等對票價之定價模型。 |

---

## 📌 Top 5 特徵選擇演算法原理 (Top 5 Feature Selection Algorithms)

特徵選擇（Feature Selection）旨在從原始特徵空間中挑選最具代表性與預測價值的特徵子集，降低維度災難（Curse of Dimensionality）、防止過擬合（Overfitting）並提升模型的可解釋性。主流方法分為 **Filter（過濾法）**、**Wrapper（包裝法）** 與 **Embedded（嵌入法）** 三大類：

```
                              ┌── Filter Method ──── 5. Pearson Correlation Filter
                              │
Feature Selection ────────────┼── Wrapper Method ─── 1. Sequential Forward Selection (SFS)
                              │                      ├── 2. Sequential Backward Selection (SBS)
                              │                      └── 3. Recursive Feature Elimination (RFE)
                              │
                              └── Embedded Method ── 4. Lasso Regularization (L1 Norm)
```

| 排名 | 演算法名稱 | 類型 | 核心機制 | 計算複雜度 | 優點 | 限制 |
| :---: | :--- | :---: | :--- | :---: | :--- | :--- |
| **#01** | **前向特徵選擇 (SFS)**<br>`Sequential Forward Selection` | **Wrapper** | 從空集合開始，每次利用交叉驗證挑選能使模型目標評估指標提升最大的單一特徵逐步加入。 | $O(p \cdot k \cdot T)$ | 貪婪搜尋速度快，小特徵數時收斂效率極佳。 | 容易陷入局部最優，已選入特徵無法後續剔除。 |
| **#02** | **後向特徵消除 (SBS)**<br>`Sequential Backward Selection` | **Wrapper** | 從包含全特徵的集合開始，每次評估並剔除移除後損失最小（或最不顯著）之特徵。 | $O(p \cdot (p - k) \cdot T)$ | 充分考量特徵間的交互作用，高維時保留重要組合。 | 特徵總數極大時初始運算成本高。 |
| **#03** | **遞迴特徵消除 (RFE)**<br>`Recursive Feature Elimination` | **Wrapper / Hybrid** | 在標準化空間訓練模型，依據權重係數絕對值 $|\beta_j|$ 或重要性遞迴剃除最小權重特徵。 | $O((p - k) \cdot T)$ | 結合模型內部權重與貪婪消除，廣泛支援線性與樹模型。 | 需對特徵進行標準化，否則尺度影響權重排序。 |
| **#04** | **Lasso 正則化**<br>`L1 Regularization (Lasso)` | **Embedded** | 在損失函數加入 L1 懲罰項 $\alpha \sum |\beta_j|$，因幾何形狀自然促使無關特徵係數直接收縮至精確為 0。 | $O(p \cdot T)$ | 訓練與特徵選擇同步完成，計算效率極高。 | 面臨高度共線性特徵時可能隨機僅挑選其中一個。 |
| **#05** | **皮爾森相關過濾法**<br>`Pearson Correlation Filter` | **Filter** | 計算各變數與目標變數之相關係數絕對值 $\|r_{X_j, y}\|$，獨立於模型排序選取 Top $k$。 | $O(p \cdot n)$ | 運算速度極快（毫秒級），不依賴任何機器學習模型。 | 僅能捕捉單變量線性關係，忽略特徵間多元共線性。 |

---

## 💻 互動式網頁與 Python 應用 (Interactive Python & WebAssembly)

本專案採用 **100% Pure Python** 架構開發（無自訂 JavaScript 業務邏輯），支援兩種運行與佈署模式：
1. **GitHub Pages WebAssembly 雲端即時運行**：透過 Stlite (Pyodide WebAssembly)，直接在瀏覽器端載入 Python 虛擬環境、Scikit-Learn 與 Matplotlib，無需任何後端伺服器！
2. **本機原生 Python / Streamlit 運行**：支援透過 `requirements.txt` 在本機秒級啟動。

### 📦 本機安裝與執行 (Local Execution)

```bash
# 1. 進入作業資料夾
cd L04_2

# 2. 安裝 Python 依賴
pip install -r requirements.txt

# 3. 啟動 Streamlit 互動網頁
streamlit run app.py
```

瀏覽器將自動開啟 `http://localhost:8501`。

### 🌟 核心功能特色 (全面整合 huanchen1107 MultipleLR 規格)

- **8 大經典資料集自由切換**：隨選即時載入，特徵維度範圍自適應調整。
- **🌐 智慧型 Kaggle 資料集載入與分類/迴歸自動檢測**：
  - 支援輸入任何 Kaggle Dataset Handle 或網址（例如 `mirichoi0218/insurance`、`camnugent/california-housing-prices`、`uciml/iris`），底層自動下載。
  - **自動判定任務類型**：
    - 若為「**分類任務 (Classification)**」：立即跳出警示卡，標註類別標籤與判定依據，提醒使用者改輸入用於迴歸預測之資料集，並提供快速切換推薦按鈕。
    - 若為「**迴歸預測 (Regression)**」：自動清洗特徵、執行 Top 5 特徵選擇與 OLS 統計推論，並生成全套 16 大分析診斷圖表與 What-If 即時模擬器。
- **Top 5 評估指標摘要卡 (Summary Metric Cards)**：包含 Test RMSE、R² Score、Adjusted R²（校正特徵數懲罰）、Test MAE（平均絕對誤差）與 F-Statistic 全體模型顯著性檢定（含 p-value）。
- **特徵選擇橫幅與奧卡姆剃刀洞察 (Occam's Razor Insight Card)**：顯示目前選入之變數標籤，並依據 $k$ 與最佳值 $k^*$ 自動判定為「低擬合區 (Underfitting)」、「最佳精簡平衡點 (Sweet Spot)」或「過擬合共線性風險區 (Overfitting Risk)」。
- **特徵數量動態滑桿與快速跳轉鈕 (Feature Count Slider & Quick Jump)**：可自由切換特徵數量 $k \in [1, p]$，並提供 Min ($k=1$)、Sweet Spot ($k=k^*$) 與 Full ($k=p$) 快速跳轉按鈕。
- **演算法動態選擇 (Algorithm Selector)**：支援在 Top 5 演算法（SBS、SFS、RFE、Lasso、Correlation）間無縫切換。
- **特徵篩選步階評估表 (Progression Table)**：呈現 $k=1 \dots p$ 各步階之 `Number of Features`、`Selected Features`、`RMSE`、`R-squared`、`Adjusted R²` 與 `MAE`（高精度）。
- **雙並排評估指標圖 (Dual Subplots)**：以 Matplotlib 原生繪製 `RMSE by Number of Features` 與 `R-squared & Adj R² by Number of Features` 雙圖，並標示當前 $k$ 與最佳建議點。
- **跨演算法比較圖 (Cross-Algorithm Comparison)**：同時繪製 5 種特徵選擇演算法在各 $k$ 數量下的誤差與解釋力收斂走勢。
- **多元線性迴歸係數與統計推論檢驗表 (OLS Diagnostics & VIF)**：包含每項特徵之 Estimate ($\beta$)、標準誤 (Std. Error)、$t$ 統計量、雙尾 $p$ 值、顯著水準標示 (`***`, `**`, `*`, `ns`)、95% 信賴區間與共線性膨脹因子 (VIF)，並標註共線性安全級別。
- **多元迴歸方程式與係數長條圖**：動態擬合並輸出 OLS 數學公式與各變數之 $\beta$ 權重與絕對重要性分佈。
- **實際值 vs 預測值走勢散佈圖 (Actual vs. Predicted Diagnostic Plot)**：以 Holdout 測試集呈現實際值 vs 預測值走勢，並繪製 $y = x$ 理想預測基準線。
- **測試集樣本預測與殘差診斷表 (Test Set Residual Analysis Table)**：展示測試集樣本之實際值、預測值、殘差 ($e = \hat{y} - y$)、絕對誤差、百分比誤差與診斷狀態標籤（`🟢 In Range`, `🟡 Moderate`, `🔴 Outlier`）。
- **即時預測計算機 (Live Interactive What-If Scenario Simulator)**：針對當前選入特徵提供動態數值滑桿，即時計算預測值並展開特徵邊際貢獻度分解表。
- **原始資料檢視器 (Raw Data Viewer)**：可即時展開檢視各資料集的原始資料樣本。

---

## 🚀 線上即時展示

- **L04_2 線上即時展示**：[https://aaronh945.github.io/AI_Security_HW/L04_2/](https://aaronh945.github.io/AI_Security_HW/L04_2/)
- **主目錄導覽**：[https://aaronh945.github.io/AI_Security_HW/](https://aaronh945.github.io/AI_Security_HW/)
