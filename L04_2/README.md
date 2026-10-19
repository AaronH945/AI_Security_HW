# Lab 04_2: Top 5 Feature Selection Suite (Kaggle S5E10 Road Accident Risk)

本專案為 **AI Security** 課程之實驗單元 **Lab 04_2**，遵循 **Lab 04_1** 之全 Python 科幻鋼鐵人 HUD（STARK Industries）架構，分析 **Kaggle Playground Series (Season 5, Episode 10)** 之競賽資料集：**Predicting Road Accident Risk (道路事故風險預測)**。

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-00f2fe?style=for-the-badge&logo=github)](https://aaronh945.github.io/AI_Security_HW/L04_2/)
[![Kaggle Dataset](https://img.shields.io/badge/Kaggle-Playground%20S5E10-20beff?style=for-the-badge&logo=kaggle)](https://www.kaggle.com/competitions/playground-series-s5e10/data)

---

## 📌 Top 5 特徵選擇演算法介紹 (Top 5 Feature Selection Algorithms)

特徵選擇（Feature Selection）旨在從原始特徵空間中挑選最具代表性與預測價值的特徵子集，降低維度災難（Curse of Dimensionality）、防止過擬合（Overfitting）並提升模型的可解釋性。主流方法分為 **Filter（過濾法）**、**Wrapper（包裝法）** 與 **Embedded（嵌入法）** 三大類：

```
                              ┌── Filter Method ──── 5. Correlation / Mutual Information
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

## 🚗 Kaggle S5E10 資料集評估與發現 (Dataset & Findings)

- **競賽來源**：[Kaggle Playground Series (Season 5, Episode 10)](https://www.kaggle.com/competitions/playground-series-s5e10/data)
- **目標變數**：`accident_risk`（連續數值評分，範圍約 $0.0 \sim 1.0$）
- **樣本規模**：10,000 筆樣本，經 One-Hot Encoding 展開後共 20 個解釋特徵
- **評估指標**：測試集 RMSE（均方根誤差，越低越好）與 $R^2$（模型解釋力，越高越好）

### 評估矩陣摘要 ($k=1 \dots 20$)：
- **$k=1$ (單一特徵基準)**：所有演算法一致選取 **道路曲率 (`curvature`)**，Test RMSE = `0.140114`，$R^2$ = `29.32%`。
- **$k=2$**：選入 **夜間照明 (`lighting_night`)**，Test RMSE 大幅降至 `0.117243`，$R^2$ 提升至 `50.56%`。
- **$k=3$**：選入 **速限 (`speed_limit`)**，Test RMSE 進一步收斂至 `0.087465`，$R^2$ 突破 `72.47%`。
- **$k=5$**：選入 **事故回報次數 (`num_reported_accidents`)** 與 **晴天 (`weather_clear`)**，Test RMSE 達 `0.072936`。
- **$k=9$ ⭐ (建議最佳特徵子集)**：Test RMSE 收斂至 **`0.072874`**，$R^2$ 達 **`80.84%`**（與 20 全特徵模型差異小於 $0.000005$，同時具備最高泛化能力與模型精簡度）。

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

### 🌟 核心功能特色

- **特徵數量動態滑桿 (Feature Count Slider)**：可自由切換特徵數量 $k \in [1, 20]$，即時連動全頁圖表與評估指標。
- **演算法動態選擇 (Algorithm Selector)**：支援在 Top 5 演算法（SBS、SFS、RFE、Lasso、Correlation）間無縫切換。
- **特徵篩選步階評估表 (Progression Table)**：呈現 $k=1 \dots 20$ 各步階之 `Number of Features`、`Selected Features`、`RMSE`（6 位精度）與 `R-squared`（6 位精度）。
- **雙並排評估指標圖 (Dual Subplots)**：以 Matplotlib 原生繪製 `RMSE by Number of Features` 與 `R-squared by Number of Features` 雙圖，並以發光金黃色節點動態標示當前 $k$ 之位置。
- **跨演算法比較圖 (Cross-Algorithm Comparison)**：同時繪製 5 種特徵選擇演算法在各 $k$ 數量下的誤差與解釋力收斂走勢。
- **多元迴歸方程式與係數長條圖**：動態擬合並輸出 OLS 數學公式與各變數之 $\beta$ 權重。
- **測試集樣本預測與殘差診斷**：展示測試樣本之實際值 vs 預測值走勢與殘差百分比明細。
- **原始資料檢視器 (Raw Data Viewer)**：可即時展開檢視 10,000 筆 Kaggle S5E10 原始資料。

---

## 🚀 線上即時展示

- **L04_2 線上即時展示**：[https://aaronh945.github.io/AI_Security_HW/L04_2/](https://aaronh945.github.io/AI_Security_HW/L04_2/)
- **主目錄導覽**：[https://aaronh945.github.io/AI_Security_HW/](https://aaronh945.github.io/AI_Security_HW/)
