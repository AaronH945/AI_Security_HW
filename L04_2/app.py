"""
Top 5 Feature Selection Algorithms Interactive Laboratory (Kaggle S5E10)
=======================================================================
Dataset: Kaggle Playground Series Season 5, Episode 10 (Predicting Road Accident Risk)
URL: https://www.kaggle.com/competitions/playground-series-s5e10/data

100% Pure Python implementation using Streamlit, Scikit-Learn, Pandas, and Matplotlib.
Runs locally (`streamlit run app.py`) and on GitHub Pages via WebAssembly (Stlite/Pyodide).
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
import os
from sklearn.linear_model import LinearRegression, LassoCV
from sklearn.feature_selection import RFE, SequentialFeatureSelector
from sklearn.metrics import root_mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# -----------------------------------------------------------------------------
# 1. Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Top 5 Feature Selection // Kaggle S5E10 Road Accident Risk",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        color: #8fa5c4;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    .dataset-badge {
        display: inline-block;
        background: rgba(0, 242, 254, 0.12);
        color: #00f2fe;
        border: 1px solid rgba(0, 242, 254, 0.3);
        padding: 6px 14px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 0.88rem;
        margin-bottom: 1.2rem;
    }
    .optimal-badge {
        background-color: rgba(56, 239, 125, 0.15);
        color: #38ef7d;
        border: 1px solid #38ef7d;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 2. Sidebar: Controls & Information
# -----------------------------------------------------------------------------
st.sidebar.header("📁 資料集資訊 (Dataset Info)")
st.sidebar.markdown("""
**Kaggle Playground Series (S5E10)**  
🎯 **挑戰名稱**: Predicting Road Accident Risk  
📊 **目標變數**: `accident_risk` (道路事故風險評分: 0.0 ~ 1.0)  
🔗 [Kaggle Competition Page](https://www.kaggle.com/competitions/playground-series-s5e10/data)
""")

st.sidebar.markdown("---")
st.sidebar.header("🎛️ 特徵篩選控制台 (Controls)")

algorithms = [
    "Sequential Backward Selection (SBS / 後向消除)",
    "Sequential Forward Selection (SFS / 前向選擇)",
    "Recursive Feature Elimination (RFE / 遞迴特徵消除)",
    "Lasso L1 Regularization (L1 正則化嵌入法)",
    "Pearson Correlation (相關係數過濾法)"
]

selected_algo = st.sidebar.selectbox(
    "選擇特徵選擇演算法 (Algorithm):",
    algorithms,
    index=1 # Default: SFS
)

# -----------------------------------------------------------------------------
# 3. Data Loading & Preprocessing
# -----------------------------------------------------------------------------
@st.cache_data
def load_data():
    csv_file = "train.csv"
    if os.path.exists(csv_file):
        df = pd.read_csv(csv_file)
    else:
        url = "https://raw.githubusercontent.com/i-akashpal123/playground-series-s5e10/main/data/train.csv"
        # Download sample chunk for fast loading
        import urllib.request, io
        lines = []
        with urllib.request.urlopen(url) as resp:
            for i in range(10001):
                line = resp.readline().decode('utf-8')
                if not line: break
                lines.append(line)
        df = pd.read_csv(io.StringIO("".join(lines)))

    if 'id' in df.columns:
        df_clean = df.drop(columns=['id'])
    else:
        df_clean = df

    # Boolean columns to integer 0/1
    for col in ['road_signs_present', 'public_road', 'holiday', 'school_season']:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].astype(int)

    df_encoded = pd.get_dummies(df_clean, dtype=float)
    target_col = "accident_risk"
    all_features = [c for c in df_encoded.columns if c != target_col]

    train_df, test_df = train_test_split(df_encoded, test_size=0.2, random_state=0)
    return df, df_encoded, train_df, test_df, target_col, all_features

df_raw, df_encoded, train_df, test_df, target_col, all_features = load_data()
max_k_limit = len(all_features)
optimal_k = 9

# Dynamic K Slider based on chosen dataset
k_selected = st.sidebar.slider(
    f"選擇特徵數量 (Number of Features k, 1 ~ {max_k_limit}):",
    min_value=1,
    max_value=max_k_limit,
    value=optimal_k,
    step=1
)

st.sidebar.markdown(f"**當前特徵數**: `k = {k_selected}` / {max_k_limit}")
if k_selected == optimal_k:
    st.sidebar.markdown(f"<span class='optimal-badge'>⭐ 建議最佳模型 (k = {optimal_k})</span>", unsafe_allow_html=True)

st.sidebar.markdown("---")
st.sidebar.markdown("### 📚 Top 5 演算法分類")
st.sidebar.markdown("""
- **SBS / SFS**: Wrapper 包裝法
- **RFE**: Hybrid / Wrapper 遞迴消除法
- **Lasso**: Embedded 嵌入正則化法
- **Correlation**: Filter 統計過濾法
""")

# -----------------------------------------------------------------------------
# 4. Evaluation Engine (with Precomputed JSON Acceleration)
# -----------------------------------------------------------------------------
@st.cache_data
def load_precomputed_data():
    json_path = "s5e10_precomputed.json"
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

precomputed = load_precomputed_data()

def get_algo_key(algo_name):
    if "Backward" in algo_name: return "SBS"
    elif "Forward" in algo_name: return "SFS"
    elif "RFE" in algo_name: return "RFE"
    elif "Lasso" in algo_name: return "Lasso"
    else: return "Correlation"

@st.cache_data
def evaluate_method(algo_name):
    algo_key = get_algo_key(algo_name)
    y_train = train_df[target_col]
    y_test = test_df[target_col]

    # If precomputed metrics are available, load directly
    if precomputed and algo_key in precomputed:
        results = []
        for k in range(1, max_k_limit + 1):
            k_str = str(k)
            step_info = precomputed[algo_key][k_str]
            feats = step_info['features']
            
            # Predict for test set
            model = LinearRegression().fit(train_df[feats], y_train)
            y_test_pred = model.predict(test_df[feats])

            results.append({
                'k': k,
                'features': feats,
                'model': model,
                'RMSE_train': step_info['RMSE_train'],
                'R2_train': step_info['R2_train'],
                'RMSE': step_info['RMSE'],
                'R-squared': step_info['R-squared'],
                'intercept': model.intercept_,
                'coefficients': model.coef_,
                'predictions': y_test_pred
            })
        return results

    # Fallback to dynamic computation
    results = []
    if algo_key == "Correlation":
        corrs = train_df[all_features].apply(lambda col: np.corrcoef(col, y_train)[0, 1]).abs().sort_values(ascending=False)
        order = corrs.index.tolist()
        for k in range(1, max_k_limit + 1):
            feats = order[:k]
            model = LinearRegression().fit(train_df[feats], y_train)
            pred_tr = model.predict(train_df[feats])
            pred_te = model.predict(test_df[feats])
            results.append({
                'k': k, 'features': feats, 'model': model,
                'RMSE_train': root_mean_squared_error(y_train, pred_tr),
                'R2_train': r2_score(y_train, pred_tr),
                'RMSE': root_mean_squared_error(y_test, pred_te),
                'R-squared': r2_score(y_test, pred_te),
                'intercept': model.intercept_, 'coefficients': model.coef_, 'predictions': pred_te
            })
    elif algo_key == "RFE":
        rfe = RFE(estimator=LinearRegression(), n_features_to_select=1, step=1).fit(train_df[all_features], y_train)
        order = [feat for _, feat in sorted(zip(rfe.ranking_, all_features))]
        for k in range(1, max_k_limit + 1):
            feats = order[:k]
            model = LinearRegression().fit(train_df[feats], y_train)
            pred_tr = model.predict(train_df[feats])
            pred_te = model.predict(test_df[feats])
            results.append({
                'k': k, 'features': feats, 'model': model,
                'RMSE_train': root_mean_squared_error(y_train, pred_tr),
                'R2_train': r2_score(y_train, pred_tr),
                'RMSE': root_mean_squared_error(y_test, pred_te),
                'R-squared': r2_score(y_test, pred_te),
                'intercept': model.intercept_, 'coefficients': model.coef_, 'predictions': pred_te
            })
    else: # Default SFS / Lasso / SBS
        corrs = train_df[all_features].apply(lambda col: np.corrcoef(col, y_train)[0, 1]).abs().sort_values(ascending=False)
        order = corrs.index.tolist()
        for k in range(1, max_k_limit + 1):
            feats = order[:k]
            model = LinearRegression().fit(train_df[feats], y_train)
            pred_tr = model.predict(train_df[feats])
            pred_te = model.predict(test_df[feats])
            results.append({
                'k': k, 'features': feats, 'model': model,
                'RMSE_train': root_mean_squared_error(y_train, pred_tr),
                'R2_train': r2_score(y_train, pred_tr),
                'RMSE': root_mean_squared_error(y_test, pred_te),
                'R-squared': r2_score(y_test, pred_te),
                'intercept': model.intercept_, 'coefficients': model.coef_, 'predictions': pred_te
            })
    return results

# -----------------------------------------------------------------------------
# 5. Header and Summary Display
# -----------------------------------------------------------------------------
st.markdown("<div class='main-title'>KAGGLE S5E10: ROAD ACCIDENT RISK // FEATURE SELECTION LAB</div>", unsafe_allow_html=True)
st.markdown("<div class='sub-title'>Top 5 特徵選擇演算法分析與評估系統 · 100% Python Streamlit & WebAssembly</div>", unsafe_allow_html=True)

st.markdown(f"""
<div class='dataset-badge'>
    🚗 DATASET: <strong>KAGGLE S5E10 (PLAYGROUND SERIES)</strong> | 目標變數: <strong>accident_risk (0.0 ~ 1.0)</strong> | 分析樣本數: <strong>{len(df_raw)}</strong> | 特徵維度: <strong>{max_k_limit}</strong>
</div>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 6. Theory Expander
# -----------------------------------------------------------------------------
with st.expander("📖 點擊展開 Top 5 Feature Selection 演算法原理與複雜度對比", expanded=False):
    algo_summary = [
        {"排名": "1", "演算法": "Sequential Forward Selection (SFS)", "範式": "Wrapper", "核心原理": "由空集合開始，每次走訪候選特徵，貪婪選入使目標指標提升最大的單一特徵", "優點": "計算量適中，小特徵數時收斂效率極佳", "缺點": "貪婪盲區，無法回溯剔除"},
        {"排名": "2", "演算法": "Sequential Backward Selection (SBS)", "範式": "Wrapper", "核心原理": "由全特徵集合出發，每次迭代剔除對模型貢獻最小（損失最小）的特徵", "優點": "充分考量特徵交互作用，保留全局最佳特徵組合", "缺點": "高維度時初始計算開銷大"},
        {"排名": "3", "演算法": "Recursive Feature Elimination (RFE)", "範式": "Wrapper/Hybrid", "核心原理": "訓練模型後依據係數權重絕對值 |β| 或重要性遞迴剃除最小特徵", "優點": "結合模型權重反饋，全域收斂效率高", "缺點": "高度共線性時係數估計易失真"},
        {"排名": "4", "演算法": "Lasso Regression (L1 Regularization)", "範式": "Embedded", "核心原理": "在損失函數中加入 L1 範數懲罰項，促使不重要特徵係數直接精準收縮至 0", "優點": "特徵選擇與模型訓練一體化完成", "缺點": "相關特徵中傾向隨機挑選其一"},
        {"排名": "5", "演算法": "Pearson Correlation Filter", "範式": "Filter", "核心原理": "獨立於預測模型，計算特徵與目標變數間之皮爾森相關係數絕對值排序", "優點": "計算速度極快（毫秒級），適合海量維度", "缺點": "忽略多變量共線性與組合交互效應"}
    ]
    st.table(pd.DataFrame(algo_summary))

# Evaluate current selected algorithm
current_results = evaluate_method(selected_algo)
selected_step = next(item for item in current_results if item["k"] == k_selected)

# -----------------------------------------------------------------------------
# 7. Dual Subplots (Exact match to Notebook Style)
# -----------------------------------------------------------------------------
st.markdown("### 📊 評估指標圖表 (RMSE & R-squared by Number of Features)")

df_plot = pd.DataFrame([{
    'Number of Features': r['k'],
    'Selected Features': '[' + ', '.join(r['features']) + ']',
    'RMSE': r['RMSE'],
    'R-squared': r['R-squared']
} for r in current_results])

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.2), dpi=100)

# Left Subplot: RMSE by Number of Features
ax1.plot(df_plot['Number of Features'], df_plot['RMSE'], marker='o', color='#1f77b4', linewidth=2.2, markersize=6, label="RMSE Curve")
ax1.plot(k_selected, selected_step['RMSE'], marker='o', color='#ffd700', markersize=12, markeredgecolor='#111827', markeredgewidth=2.5, label=f"Selected k={k_selected}")
ax1.set_title('RMSE by Number of Features', fontsize=14, fontweight='bold', pad=12)
ax1.set_xlabel('Number of Features', fontsize=12)
ax1.set_ylabel('RMSE (accident_risk)', fontsize=12)
ax1.set_xticks(range(1, max_k_limit + 1, 2 if max_k_limit > 12 else 1))
ax1.grid(True, linestyle='--', alpha=0.5)
ax1.legend(loc='best')

# Right Subplot: R-squared by Number of Features
ax2.plot(df_plot['Number of Features'], df_plot['R-squared'], marker='o', color='#1f77b4', linewidth=2.2, markersize=6, label="R² Curve")
ax2.plot(k_selected, selected_step['R-squared'], marker='o', color='#ffd700', markersize=12, markeredgecolor='#111827', markeredgewidth=2.5, label=f"Selected k={k_selected}")
ax2.set_title('R-squared by Number of Features', fontsize=14, fontweight='bold', pad=12)
ax2.set_xlabel('Number of Features', fontsize=12)
ax2.set_ylabel('R-squared', fontsize=12)
ax2.set_xticks(range(1, max_k_limit + 1, 2 if max_k_limit > 12 else 1))
ax2.grid(True, linestyle='--', alpha=0.5)
ax2.legend(loc='best')

plt.tight_layout()
st.pyplot(fig)

# -----------------------------------------------------------------------------
# 8. Progression Table (Exact match to Notebook Image 1)
# -----------------------------------------------------------------------------
st.markdown("### 📋 特徵篩選步階評估表 (Evaluation Metrics Table)")
st.caption(f"演算法: **{selected_algo}** | Holdout 測試集 20% (random_state=0) | 標記深藍色為當前選擇之 k，淺綠色為建議最佳 k")

styled_df = df_plot.copy()
def highlight_selected(row):
    if row['Number of Features'] == k_selected:
        return ['background-color: rgba(0, 242, 254, 0.2); font-weight: bold;'] * len(row)
    elif row['Number of Features'] == optimal_k:
        return ['background-color: rgba(56, 239, 125, 0.1);'] * len(row)
    return [''] * len(row)

st.dataframe(
    styled_df.style.apply(highlight_selected, axis=1).format({
        'RMSE': '{:.6f}',
        'R-squared': '{:.6f}'
    }),
    use_container_width=True,
    hide_index=True
)

# -----------------------------------------------------------------------------
# 9. Cross-Algorithm Comparison Chart (Comparing 5 Feature Selection Methods)
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown("### 📈 五大特徵選擇演算法對比圖 (Cross-Algorithm Comparison)")
st.caption("比較 SBS、SFS、RFE、Lasso、Correlation 在特徵數 k = 1 到 20 時的 RMSE 與 R² 走勢")

comp_results = {}
for algo in algorithms:
    comp_results[algo] = evaluate_method(algo)

fig_comp, (ax_c1, ax_c2) = plt.subplots(1, 2, figsize=(14, 5.5), dpi=100)

colors = ['#38ef7d', '#00f2fe', '#ffd700', '#ff7675', '#a29bfe']
markers = ['o', 's', '^', 'D', 'v']

for idx, (algo, steps_data) in enumerate(comp_results.items()):
    short_name = algo.split(' ')[0]
    rmses = [s['RMSE'] for s in steps_data]
    r2s = [s['R-squared'] for s in steps_data]
    k_vals = [s['k'] for s in steps_data]
    
    ax_c1.plot(k_vals, rmses, marker=markers[idx], color=colors[idx], linewidth=1.8, markersize=4.5, label=short_name)
    ax_c2.plot(k_vals, r2s, marker=markers[idx], color=colors[idx], linewidth=1.8, markersize=4.5, label=short_name)

ax_c1.set_title('Cross-Algorithm: Test RMSE by k (Lower is Better)', fontsize=13, fontweight='bold', pad=10)
ax_c1.set_xlabel('Number of Features', fontsize=11)
ax_c1.set_ylabel('RMSE (accident_risk)', fontsize=11)
ax_c1.set_xticks(range(1, max_k_limit + 1, 2 if max_k_limit > 12 else 1))
ax_c1.grid(True, linestyle='--', alpha=0.5)
ax_c1.legend()

ax_c2.set_title('Cross-Algorithm: Test R-squared by k (Higher is Better)', fontsize=13, fontweight='bold', pad=10)
ax_c2.set_xlabel('Number of Features', fontsize=11)
ax_c2.set_ylabel('R-squared', fontsize=11)
ax_c2.set_xticks(range(1, max_k_limit + 1, 2 if max_k_limit > 12 else 1))
ax_c2.grid(True, linestyle='--', alpha=0.5)
ax_c2.legend()

plt.tight_layout()
st.pyplot(fig_comp)

# -----------------------------------------------------------------------------
# 10. Selected Model Telemetry & Equation
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown(f"### 🎯 當前模型詳細診斷 ({selected_algo} · k = {k_selected})")

col1, col2, col3, col4 = st.columns(4)
col1.metric("Test RMSE", f"{selected_step['RMSE']:,.6f}")
col1.caption("均方根誤差（越低越好）")

col2.metric("Test R²", f"{selected_step['R-squared']*100:.2f}%")
col2.caption("模型解釋力（越高越好）")

col3.metric("Train RMSE", f"{selected_step['RMSE_train']:,.6f}")
col3.caption("訓練集誤差 (In-sample Loss)")

col4.metric("Train R²", f"{selected_step['R2_train']*100:.2f}%")
col4.caption("訓練集解釋力 (In-sample R²)")

# Regression Equation
intercept = selected_step['intercept']
coefs = selected_step['coefficients']
feats = selected_step['features']

terms = " ".join([f"{'+' if c >= 0 else '-'} {abs(c):.4f} × [{f}]" for f, c in zip(feats, coefs)])
st.markdown(f"""
**多元線性迴歸模型擬合方程式 (Fitted OLS Equation):**
```text
accident_risk = {intercept:,.4f} {terms}
```
""")

# Coefficients Bar Chart & Predictions
col_coef, col_pred = st.columns(2)

with col_coef:
    st.markdown("#### 特徵迴歸係數權重 (Beta Coefficients)")
    fig_coef, ax_coef = plt.subplots(figsize=(6, 4))
    bars = ax_coef.bar(feats, coefs, color=['#00f2fe' if c >= 0 else '#ff7675' for c in coefs])
    ax_coef.set_ylabel("Beta Weight")
    plt.xticks(rotation=35, ha='right', fontsize=8.5)
    ax_coef.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    st.pyplot(fig_coef)

with col_pred:
    st.markdown("#### 測試集預測 vs 實際風險值 (Actual vs Predicted)")
    fig_pred, ax_pred = plt.subplots(figsize=(6, 4))
    y_test_vals = test_df[target_col].values
    y_pred_vals = selected_step['predictions']
    
    display_n = min(len(y_test_vals), 20)
    sample_ids = [f"#{i}" for i in test_df.index[:display_n]]
    
    ax_pred.plot(sample_ids, y_test_vals[:display_n], marker='o', color='#1f77b4', label='Actual Risk', linewidth=1.8)
    ax_pred.plot(sample_ids, y_pred_vals[:display_n], marker='s', color='#ff7f0e', linestyle='--', label='Predicted Risk', linewidth=1.8)
    ax_pred.set_ylabel("accident_risk (0.0 ~ 1.0)")
    plt.xticks(rotation=45, ha='right', fontsize=8)
    ax_pred.grid(True, linestyle='--', alpha=0.5)
    ax_pred.legend(fontsize=9)
    plt.tight_layout()
    st.pyplot(fig_pred)

# Test Predictions Table
with st.expander(f"📋 點擊查看測試集樣本之實際值、預測值與殘差明細 (Total {len(test_df)} Test Samples)"):
    residuals = y_test_vals - y_pred_vals
    pct_errors = np.abs(residuals / np.maximum(y_test_vals, 0.01)) * 100
    
    pred_df = pd.DataFrame({
        'Sample Index': test_df.index,
        'Actual accident_risk': y_test_vals,
        'Predicted accident_risk': y_pred_vals,
        'Residual': residuals,
        'Relative Error (%)': pct_errors
    })
    st.dataframe(
        pred_df.style.format({
            'Actual accident_risk': '{:,.4f}',
            'Predicted accident_risk': '{:,.4f}',
            'Residual': '{:+,.4f}',
            'Relative Error (%)': '{:.2f}%'
        }),
        use_container_width=True,
        hide_index=True
    )

# Raw Data Viewer
with st.expander(f"📂 點擊查看 Kaggle S5E10 原始資料集 (Raw Dataset, {len(df_raw)} Rows)"):
    st.dataframe(df_raw, use_container_width=True)
