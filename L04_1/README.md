# Lab 04_1: Top 5 Feature Selection Interactive Suite (50 Startups)

本專案為 **AI Security** 課程之實驗單元 **Lab 04_1**，建構一個具備科幻鋼鐵人 HUD（STARK Industries）風格的互動式機器學習特徵選擇評估系統。

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-00f2fe?style=for-the-badge&logo=github)](https://aaronh945.github.io/AI_Security_HW/L04_1/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated%20Deploy-38ef7d?style=for-the-badge&logo=githubactions)](https://github.com/AaronH945/AI_Security_HW/actions)

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

## 📊 50 Startups 資料集評估與發現

資料集包含 50 間新創企業之研發支出（`R&D Spend`）、行政費用（`Administration`）、行銷費用（`Marketing Spend`）、所在州別（`State_California`, `State_Florida`, `State_New York`）與獲利（`Profit`）。

經由 80/20 Train/Test 分割（Random State = 0）之測試集評估指標矩陣：

| $k$ (特徵數) | Forward (RMSE / $R^2$) | Backward (RMSE / $R^2$) | RFE (RMSE / $R^2$) | Lasso (RMSE / $R^2$) | Correlation (RMSE / $R^2$) | 最佳表現演算法 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **k = 1** | 8274.87 / 94.65% | 8274.87 / 94.65% | 8274.87 / 94.65% | 8274.87 / 94.65% | 8274.87 / 94.65% | **All 5 Methods** (`R&D Spend`) |
| **k = 2** ⭐ | **8198.80 / 94.74%** | **8198.80 / 94.74%** | **8198.80 / 94.74%** | **8198.80 / 94.74%** | **8198.80 / 94.74%** | **全域最佳點 (Global Best)** |
| **k = 3** | 8803.78 / 93.94% | **8309.06 / 94.60%** | 8803.78 / 93.94% | 8803.78 / 93.94% | 8803.78 / 93.94% | **Backward** (`R&D + Mkt + NY`) |
| **k = 4** | 8803.69 / 93.94% | **8409.92 / 94.47%** | 9068.54 / 93.57% | 8997.20 / 93.67% | 8803.69 / 93.94% | **Backward** (`R&D + Mkt + FL + NY`) |
| **k = 5** | 9137.99 / 93.47% | **8409.92 / 94.47%** | 9137.99 / 93.47% | 9137.99 / 93.47% | 9137.99 / 93.47% | **Backward** (排除 Administration) |
| **k = 6** | 9137.99 / 93.47% | 9137.99 / 93.47% | 9137.99 / 93.47% | 9137.99 / 93.47% | 9137.99 / 93.47% | 全特徵基準模型 |

### 核心發現：
1. **$k=2$ 為全域最佳模型**：所有五種演算法在 $k=2$ 時一致選取 `['R&D Spend', 'Marketing Spend']`，達到全域最低 RMSE（**8198.80**）與最高 $R^2$（**94.74%**）。
2. **過擬合（Overfitting）驗證**：當特徵數量增加至 $k \ge 3$ 時，額外引入行政費用（`Administration`）或州別虛擬變數，測試集 RMSE 反而由 8198.80 上升至 9137.99，印證「奧坎剃刀原則」與特徵選擇之必要性。
3. **後向消除（SBS）在中間維度的優勢**：在 $k=3 \sim 5$ 時，後向消除成功保留了州別虛擬變數與研發行銷之交互效益，表現明顯優於貪婪前向選擇。

---

## 💻 互動式網頁與 Python 應用 (Interactive Python & WebAssembly)

本專案採用 **100% Pure Python** 架構開發（無自訂 JavaScript 業務邏輯），支援兩種運行與佈署模式：
1. **GitHub Pages WebAssembly 雲端即時運行**：透過 Stlite (Pyodide WebAssembly)，直接在瀏覽器端載入 Python 虛擬環境、Scikit-Learn 與 Matplotlib，無需任何後端伺服器！
2. **本機原生 Python / Streamlit 運行**：支援透過 `requirements.txt` 在本機秒級啟動。

### 📦 本機安裝與執行 (Local Execution)

```bash
# 1. 進入作業資料夾
cd L04_1

# 2. 安裝 Python 依賴
pip install -r requirements.txt

# 3. 啟動 Streamlit 互動網頁
streamlit run app.py
```

瀏覽器將自動開啟 `http://localhost:8501`。

### 🌟 核心功能特色

- **特徵數量動態滑桿 (Feature Count Slider)**：可自由切換特徵數量 $k \in [1, 5]$，即時連動全頁圖表與評估指標。
- **演算法動態選擇 (Algorithm Selector)**：支援在 Top 5 演算法（SBS、SFS、RFE、Lasso、Correlation）間無縫切換。
- **特徵篩選步階評估表 (Progression Table)**：呈現 $k=1 \dots 5$ 各步階之 `Number of Features`、`Selected Features`、`RMSE`（6 位精度）與 `R-squared`（6 位精度）。
- **雙並排評估指標圖 (Dual Subplots)**：以 Matplotlib 原生繪製 `RMSE by Number of Features` 與 `R-squared by Number of Features` 雙圖，並以發光節點動態標示當前 $k$ 之位置。
- **跨演算法比較圖 (Cross-Algorithm Comparison)**：同時繪製 5 種特徵選擇演算法在各 $k$ 數量下的誤差與解釋力收斂走勢。
- **多元迴歸方程式與係數長條圖**：動態擬合並輸出 OLS 數學公式與各變數之 $\beta$ 權重。
- **測試集樣本預測與殘差診斷**：展示 10 筆測試樣本之實際值 vs 預測值走勢與殘差百分比明細。

---

## 🚀 GitHub Actions 自動化佈署

本專案配置於根目錄 `.github/workflows/deploy.yml`，在推送到 `main` 分支時自動將整包靜態資產與 Stlite WebAssembly 應用發布至 GitHub Pages。

- **線上即時展示**：[https://aaronh945.github.io/AI_Security_HW/L04_1/](https://aaronh945.github.io/AI_Security_HW/L04_1/)
- **主目錄導覽**：[https://aaronh945.github.io/AI_Security_HW/](https://aaronh945.github.io/AI_Security_HW/)
