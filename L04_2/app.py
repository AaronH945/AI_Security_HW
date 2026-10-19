"""
Top 5 Feature Selection Multi-Dataset Laboratory (Lab 04_2)
===========================================================
Supports 8 Benchmark Machine Learning Regression Datasets:
1. Road Accident Risk (Kaggle Playground Series S5E10 道路事故預測)
2. King County House Sales (美國金郡房價預測)
3. Spotify Tracks Dataset (Spotify 音樂流行度預測)
4. Laptop Price Dataset (筆記型電腦價格預測)
5. Bike Sharing Demand (自行車共享租借預測)
6. Used Car Price Prediction / CarDekho (二手車價格預測)
7. House Rent Prediction Dataset (房屋租金預測)
8. Flight Ticket Price Prediction (機票價格預測)

100% Pure Python implementation using Streamlit, Scikit-Learn, Pandas, and Matplotlib.
Runs locally (`streamlit run app.py`) and on GitHub Pages via WebAssembly (Stlite/Pyodide).
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
import os
from sklearn.linear_model import LinearRegression
from sklearn.metrics import root_mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# -----------------------------------------------------------------------------
# 1. Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Top 5 Feature Selection Suite // 8 ML Datasets",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.1rem;
        font-weight: 800;
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        color: #8fa5c4;
        font-size: 1.0rem;
        margin-bottom: 1.2rem;
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
# 2. Master Dataset Definitions
# -----------------------------------------------------------------------------
DATASET_MAP = {
    "🚗 Road Accident Risk (Kaggle S5E10 道路事故預測)": "road_accident",
    "🏡 King County House Sales (美國金郡房價預測)": "kc_house",
    "🎵 Spotify Tracks Dataset (Spotify 音樂流行度預測)": "spotify",
    "💻 Laptop Price Dataset (筆記型電腦價格預測)": "laptop",
    "🚲 Bike Sharing Demand (自行車共享租借預測)": "bike",
    "🚘 Used Car Price Prediction / CarDekho (二手車價格預測)": "used_car",
    "🏢 House Rent Prediction Dataset (房屋租金預測)": "house_rent",
    "✈️ Flight Ticket Price Prediction (機票價格預測)": "flight"
}

# -----------------------------------------------------------------------------
# 3. Sidebar: Dataset Selection & Controls
# -----------------------------------------------------------------------------
st.sidebar.header("📁 資料集選擇 (Dataset Selection)")

selected_dataset_label = st.sidebar.selectbox(
    "選擇要分析的資料集 (Choose Dataset):",
    list(DATASET_MAP.keys()),
    index=0
)
dataset_id = DATASET_MAP[selected_dataset_label]

# Load Master Precomputed Data
def load_all_precomputed():
    base_dir = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else "."
    json_paths = [
        os.path.join(base_dir, "all_datasets_precomputed.json"),
        os.path.join("L04_2", "all_datasets_precomputed.json"),
        "all_datasets_precomputed.json"
    ]
    for p in json_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
    return {}

master_precomputed = load_all_precomputed()

ds_data = master_precomputed.get(dataset_id, {})
ds_meta = ds_data.get("metadata", {
    "file": "accident_risk.csv", "target": "accident_risk", "unit": "Risk (0~1)", 
    "desc": "道路事故風險", "optimal_k": 9, "max_k": 16, "rows": 5000, "features": []
})

st.sidebar.markdown(f"""
🎯 **目標變數**: `{ds_meta['target']}`  
📊 **指標單位**: `{ds_meta['unit']}`  
📝 **說明**: {ds_meta['desc']}
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

max_k = ds_meta.get("max_k", 16)
optimal_k = ds_meta.get("optimal_k", min(8, max_k))

k_selected = st.sidebar.slider(
    f"選擇特徵數量 (Number of Features k, 1 ~ {max_k}):",
    min_value=1,
    max_value=max_k,
    value=min(optimal_k, max_k),
    step=1,
    key=f"slider_k_{dataset_id}"
)

st.sidebar.markdown(f"**當前特徵數**: `k = {k_selected}` / {max_k}")
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
# 4. Data Loading & Precomputed Metrics
# -----------------------------------------------------------------------------
@st.cache_data
def load_dataset_csv(filename):
    base_dir = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else "."
    paths = [
        os.path.join(base_dir, "data", filename),
        os.path.join("L04_2", "data", filename),
        os.path.join("data", filename),
        filename
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return pd.read_csv(p)
            except Exception:
                try:
                    return pd.read_csv(p, encoding="latin-1")
                except Exception:
                    pass
    return pd.DataFrame()

df_raw = load_dataset_csv(ds_meta["file"])

def get_algo_key(algo_name):
    if "Backward" in algo_name: return "SBS"
    elif "Forward" in algo_name: return "SFS"
    elif "RFE" in algo_name: return "RFE"
    elif "Lasso" in algo_name: return "Lasso"
    else: return "Correlation"

def evaluate_method(ds_id, algo_name):
    algo_key = get_algo_key(algo_name)
    if ds_id in master_precomputed and algo_key in master_precomputed[ds_id]:
        steps = master_precomputed[ds_id][algo_key]
        num_steps = len(steps)
        results = []
        for k in range(1, num_steps + 1):
            s = steps[str(k)]
            results.append({
                'k': k,
                'features': s['features'],
                'RMSE_train': s['RMSE_train'],
                'R2_train': s['R2_train'],
                'RMSE': s['RMSE'],
                'R-squared': s['R-squared'],
                'intercept': s['intercept'],
                'coefficients': s['coefficients']
            })
        return results
    return []

current_results = evaluate_method(dataset_id, selected_algo)

if not current_results:
    st.error(f"無法載入 {selected_dataset_label} 之預計算指標。")
    st.stop()

# Safe retrieval of selected_step with clamping
selected_step = next(
    (item for item in current_results if item["k"] == k_selected),
    current_results[-1]
)

# -----------------------------------------------------------------------------
# 5. Header and Summary Display
# -----------------------------------------------------------------------------
st.markdown("<div class='main-title'>FEATURE SELECTION // MULTI-DATASET SUITE</div>", unsafe_allow_html=True)
st.markdown(f"<div class='sub-title'>支援 8 大機器學習經典資料集 · 100% Python Streamlit & WebAssembly</div>", unsafe_allow_html=True)

st.markdown(f"""
<div class='dataset-badge'>
    📁 ACTIVE: <strong>{selected_dataset_label}</strong> | 目標: <strong>{ds_meta['target']} ({ds_meta['unit']})</strong> | 樣本: <strong>{ds_meta['rows']}</strong> | 維度: <strong>{len(current_results)} 維</strong>
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

# -----------------------------------------------------------------------------
# 7. Dual Subplots (RMSE & R-squared by Number of Features)
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
ax1.set_ylabel(f"RMSE ({ds_meta['unit']})", fontsize=12)
ax1.set_xticks(range(1, len(current_results) + 1, 2 if len(current_results) > 12 else 1))
ax1.grid(True, linestyle='--', alpha=0.5)
ax1.legend(loc='best')

# Right Subplot: R-squared by Number of Features
ax2.plot(df_plot['Number of Features'], df_plot['R-squared'], marker='o', color='#1f77b4', linewidth=2.2, markersize=6, label="R² Curve")
ax2.plot(k_selected, selected_step['R-squared'], marker='o', color='#ffd700', markersize=12, markeredgecolor='#111827', markeredgewidth=2.5, label=f"Selected k={k_selected}")
ax2.set_title('R-squared by Number of Features', fontsize=14, fontweight='bold', pad=12)
ax2.set_xlabel('Number of Features', fontsize=12)
ax2.set_ylabel('R-squared', fontsize=12)
ax2.set_xticks(range(1, len(current_results) + 1, 2 if len(current_results) > 12 else 1))
ax2.grid(True, linestyle='--', alpha=0.5)
ax2.legend(loc='best')

plt.tight_layout()
st.pyplot(fig)

# -----------------------------------------------------------------------------
# 8. Progression Table (Exact match to Notebook Style)
# -----------------------------------------------------------------------------
st.markdown("### 📋 特徵篩選步階評估表 (Evaluation Metrics Table)")
st.caption(f"資料集: **{selected_dataset_label}** | 演算法: **{selected_algo}** | Holdout 測試集 20% (random_state=0)")

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
st.markdown(f"### 📈 五大特徵選擇演算法全景對比圖 ({selected_dataset_label.split(' (')[0]})")
st.caption(f"比較 SBS、SFS、RFE、Lasso、Correlation 在特徵數 k = 1 到 {len(current_results)} 時的 RMSE 與 R² 走勢")

comp_results = {}
for algo in algorithms:
    comp_results[algo] = evaluate_method(dataset_id, algo)

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
ax_c1.set_ylabel(f"RMSE ({ds_meta['unit']})", fontsize=11)
ax_c1.set_xticks(range(1, len(current_results) + 1, 2 if len(current_results) > 12 else 1))
ax_c1.grid(True, linestyle='--', alpha=0.5)
ax_c1.legend()

ax_c2.set_title('Cross-Algorithm: Test R-squared by k (Higher is Better)', fontsize=13, fontweight='bold', pad=10)
ax_c2.set_xlabel('Number of Features', fontsize=11)
ax_c2.set_ylabel('R-squared', fontsize=11)
ax_c2.set_xticks(range(1, len(current_results) + 1, 2 if len(current_results) > 12 else 1))
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
col1.metric("Test RMSE", f"{selected_step['RMSE']:,.4f} {ds_meta['unit']}")
col1.caption("均方根誤差（越低越好）")

col2.metric("Test R²", f"{selected_step['R-squared']*100:.2f}%")
col2.caption("模型解釋力（越高越好）")

col3.metric("Train RMSE", f"{selected_step['RMSE_train']:,.4f} {ds_meta['unit']}")
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
{ds_meta['target']} ({ds_meta['unit']}) = {intercept:,.4f} {terms}
```
""")

# Coefficients Bar Chart
col_coef, col_imp = st.columns(2)

with col_coef:
    st.markdown("#### 特徵迴歸係數權重 (Beta Coefficients)")
    fig_coef, ax_coef = plt.subplots(figsize=(6, 4.2))
    bars = ax_coef.bar(feats, coefs, color=['#00f2fe' if c >= 0 else '#ff7675' for c in coefs])
    ax_coef.set_ylabel("Beta Weight")
    plt.xticks(rotation=35, ha='right', fontsize=8.5)
    ax_coef.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    st.pyplot(fig_coef)

with col_imp:
    st.markdown("#### 特徵絕對權重分佈 (Absolute Importance)")
    fig_imp, ax_imp = plt.subplots(figsize=(6, 4.2))
    abs_coefs = [abs(c) for c in coefs]
    sorted_pairs = sorted(zip(feats, abs_coefs), key=lambda x: x[1])
    sorted_f, sorted_w = [p[0] for p in sorted_pairs], [p[1] for p in sorted_pairs]
    ax_imp.barh(sorted_f, sorted_w, color='#38ef7d')
    ax_imp.set_xlabel("|Beta Weight|")
    ax_imp.grid(axis='x', linestyle='--', alpha=0.5)
    plt.tight_layout()
    st.pyplot(fig_imp)

# Raw Data Viewer
if not df_raw.empty:
    with st.expander(f"📂 點擊查看 {selected_dataset_label} 原始資料集 (Raw Dataset, {len(df_raw)} Rows)"):
        st.dataframe(df_raw, use_container_width=True)
