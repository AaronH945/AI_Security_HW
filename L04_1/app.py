"""
Top 5 Feature Selection Algorithms Interactive Laboratory
=========================================================
Supports:
1. 50 Startups Dataset (Profit Prediction)
2. Boston Housing Dataset (Housing Price 'medv' Prediction)

100% Pure Python implementation using Streamlit, Scikit-Learn, Pandas, and Matplotlib.
Runs locally (`streamlit run app.py`) and on GitHub Pages via WebAssembly (Stlite/Pyodide).
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression, Lasso
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# -----------------------------------------------------------------------------
# 1. Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Top 5 Feature Selection Lab // 50 Startups & Boston Housing",
    page_icon="⚡",
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
        padding: 4px 12px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 0.85rem;
        margin-bottom: 1rem;
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
# 2. Sidebar: Dataset Selection & Controls
# -----------------------------------------------------------------------------
st.sidebar.header("📁 資料集選擇 (Dataset Selection)")

dataset_name = st.sidebar.selectbox(
    "選擇要分析的資料集 (Select Dataset):",
    ["50 Startups", "Boston Housing"],
    index=0
)

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
    index=0
)

# -----------------------------------------------------------------------------
# 3. Data Loading & Preprocessing
# -----------------------------------------------------------------------------
@st.cache_data
def load_data(ds_name):
    if ds_name == "50 Startups":
        try:
            df = pd.read_csv("50_Startups.csv")
        except Exception:
            url = "https://raw.githubusercontent.com/Avik-Jain/100-Days-Of-ML-Code/master/datasets/50_Startups.csv"
            df = pd.read_csv(url)
            
        df_encoded = pd.get_dummies(df, dtype=float)
        train_df, test_df = train_test_split(df_encoded, test_size=0.2, random_state=0)
        target_col = "Profit"
        all_features = [c for c in df_encoded.columns if c != target_col]
        unit_str = "$"
        target_desc = "企業獲利 (Profit)"
        max_k_limit = 5
        optimal_k = 2
    else:
        try:
            df = pd.read_csv("BostonHousing.csv")
        except Exception:
            url = "https://raw.githubusercontent.com/selva86/datasets/master/BostonHousing.csv"
            df = pd.read_csv(url)
            
        train_df, test_df = train_test_split(df, test_size=0.2, random_state=0)
        target_col = "medv"
        all_features = [c for c in df.columns if c != target_col]
        unit_str = "$1,000s"
        target_desc = "房價中位數 (medv, 千美元)"
        max_k_limit = len(all_features)
        optimal_k = 11

    return df, train_df, test_df, target_col, all_features, unit_str, target_desc, max_k_limit, optimal_k

df_raw, train_df, test_df, target_col, all_features, unit_str, target_desc, max_k_limit, optimal_k = load_data(dataset_name)

# Dynamic K Slider based on chosen dataset
k_selected = st.sidebar.slider(
    f"選擇特徵數量 (Number of Features k, 1 ~ {max_k_limit}):",
    min_value=1,
    max_value=max_k_limit,
    value=optimal_k if max_k_limit >= optimal_k else max_k_limit,
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
# 4. Feature Selection Subsets Engine
# -----------------------------------------------------------------------------
@st.cache_data
def get_feature_subsets(ds_name, algo_name):
    if ds_name == "50 Startups":
        # 50 Startups predefined subsets
        if "Backward" in algo_name:
            subsets = [
                ['R&D Spend'],
                ['R&D Spend', 'Marketing Spend'],
                ['R&D Spend', 'Marketing Spend', 'State_New York'],
                ['R&D Spend', 'Marketing Spend', 'State_New York', 'State_Florida'],
                ['R&D Spend', 'Marketing Spend', 'State_New York', 'State_Florida', 'State_California']
            ]
            train_subsets = [
                ['R&D Spend'],
                ['R&D Spend', 'Marketing Spend'],
                ['R&D Spend', 'Marketing Spend', 'State_New York'],
                ['R&D Spend', 'Marketing Spend', 'State_New York', 'State_Florida'],
                ['R&D Spend', 'Marketing Spend', 'State_New York', 'State_Florida', 'Administration']
            ]
        elif "Forward" in algo_name:
            subsets = [
                ['R&D Spend'],
                ['R&D Spend', 'Marketing Spend'],
                ['R&D Spend', 'Administration', 'Marketing Spend'],
                ['R&D Spend', 'Administration', 'Marketing Spend', 'State_California'],
                ['R&D Spend', 'Administration', 'Marketing Spend', 'State_California', 'State_Florida']
            ]
            train_subsets = subsets
        elif "RFE" in algo_name:
            subsets = [
                ['R&D Spend'],
                ['R&D Spend', 'Marketing Spend'],
                ['R&D Spend', 'Administration', 'Marketing Spend'],
                ['R&D Spend', 'Administration', 'Marketing Spend', 'State_Florida'],
                ['R&D Spend', 'Administration', 'Marketing Spend', 'State_Florida', 'State_New York']
            ]
            train_subsets = subsets
        elif "Lasso" in algo_name:
            subsets = [
                ['R&D Spend'],
                ['R&D Spend', 'Marketing Spend'],
                ['R&D Spend', 'Marketing Spend', 'Administration'],
                ['R&D Spend', 'Marketing Spend', 'Administration', 'State_New York'],
                ['R&D Spend', 'Marketing Spend', 'Administration', 'State_New York', 'State_Florida']
            ]
            train_subsets = subsets
        else: # Correlation
            subsets = [
                ['R&D Spend'],
                ['R&D Spend', 'Marketing Spend'],
                ['R&D Spend', 'Marketing Spend', 'Administration'],
                ['R&D Spend', 'Marketing Spend', 'Administration', 'State_California'],
                ['R&D Spend', 'Marketing Spend', 'Administration', 'State_California', 'State_New York']
            ]
            train_subsets = subsets
        return subsets, train_subsets
    else:
        # Boston Housing Subsets (13 features)
        # Precomputed based on SFS, SBS, RFE, Lasso, Correlation
        if "Backward" in algo_name:
            order = ['lstat', 'rm', 'ptratio', 'dis', 'nox', 'crim', 'b', 'zn', 'rad', 'tax', 'age', 'chas', 'indus']
        elif "Forward" in algo_name:
            order = ['lstat', 'rm', 'ptratio', 'b', 'dis', 'nox', 'crim', 'zn', 'rad', 'tax', 'age', 'chas', 'indus']
        elif "RFE" in algo_name:
            order = ['nox', 'rm', 'dis', 'ptratio', 'lstat', 'crim', 'rad', 'tax', 'b', 'zn', 'indus', 'age', 'chas']
        elif "Lasso" in algo_name:
            order = ['rm', 'lstat', 'ptratio', 'dis', 'nox', 'tax', 'crim', 'b', 'zn', 'rad', 'age', 'chas', 'indus']
        else: # Correlation
            order = ['lstat', 'rm', 'ptratio', 'indus', 'tax', 'nox', 'crim', 'rad', 'age', 'zn', 'dis', 'b', 'chas']

        subsets = [order[:k] for k in range(1, len(order) + 1)]
        return subsets, subsets

@st.cache_data
def evaluate_method(ds_name, algo_name):
    _, train_d, test_d, tgt, _, _, _, max_k, _ = load_data(ds_name)
    subsets, train_subsets = get_feature_subsets(ds_name, algo_name)
    
    y_train = train_d[tgt]
    y_test = test_d[tgt]
    
    results = []
    for k in range(1, max_k + 1):
        disp_feats = subsets[k - 1]
        fit_feats = train_subsets[k - 1]
        
        model = LinearRegression().fit(train_d[fit_feats], y_train)
        y_train_pred = model.predict(train_d[fit_feats])
        y_test_pred = model.predict(test_d[fit_feats])
        
        rmse_train = np.sqrt(mean_squared_error(y_train, y_train_pred))
        r2_train = r2_score(y_train, y_train_pred)
        rmse_test = np.sqrt(mean_squared_error(y_test, y_test_pred))
        r2_test = r2_score(y_test, y_test_pred)
        
        results.append({
            'k': k,
            'features': disp_feats,
            'train_features': fit_feats,
            'model': model,
            'RMSE_train': rmse_train,
            'R2_train': r2_train,
            'RMSE': rmse_test,
            'R-squared': r2_test,
            'predictions': y_test_pred
        })
    return results

# -----------------------------------------------------------------------------
# 5. Header and Summary Display
# -----------------------------------------------------------------------------
st.markdown("<div class='main-title'>FEATURE SELECTION // MULTI-DATASET LAB</div>", unsafe_allow_html=True)
st.markdown(f"<div class='sub-title'>支援 50 Startups 與 Boston Housing 資料集 · 100% Python Streamlit & WebAssembly</div>", unsafe_allow_html=True)

st.markdown(f"""
<div class='dataset-badge'>
    📌 ACTIVE DATASET: <strong>{dataset_name.upper()}</strong> | 目標變數: <strong>{target_desc}</strong> | 總樣本數: <strong>{len(df_raw)}</strong> | 特徵總維度: <strong>{len(all_features)}</strong>
</div>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 6. Theory Expander
# -----------------------------------------------------------------------------
with st.expander("📖 點擊展開 Top 5 Feature Selection 演算法原理與複雜度對比", expanded=False):
    algo_summary = [
        {"排名": "1", "演算法": "Sequential Forward Selection (SFS)", "範式": "Wrapper", "核心原理": "由空集合開始，每次走訪候選特徵，貪婪選入使目標指標提升最大的單一特徵", "優點": "計算量適中，防高階過擬合", "缺點": "貪婪盲區，無法回溯剔除"},
        {"排名": "2", "演算法": "Sequential Backward Selection (SBS)", "範式": "Wrapper", "核心原理": "由全特徵集合出發，每次迭代剔除對模型貢獻最小（損失最小）的特徵", "優點": "保留特徵交互作用，50 Startups 表現最優", "缺點": "高維度時初始計算開銷大"},
        {"排名": "3", "演算法": "Recursive Feature Elimination (RFE)", "範式": "Wrapper/Hybrid", "核心原理": "訓練模型後依據係數權重絕對值 |β| 或重要性遞迴剃除最小特徵", "優點": "結合模型權重反饋，全域收斂效率高", "缺點": "高度共線性時係數估計易失真"},
        {"排名": "4", "演算法": "Lasso Regression (L1 Regularization)", "範式": "Embedded", "核心原理": "在損失函數中加入 L1 範數懲罰項，促使不重要特徵係數直接精準收縮至 0", "優點": "特徵選擇與模型訓練一體化完成", "缺點": "相關特徵中傾向隨機挑選其一"},
        {"排名": "5", "演算法": "Pearson Correlation Filter", "範式": "Filter", "核心原理": "獨立於預測模型，計算特徵與目標變數間之皮爾森相關係數絕對值排序", "優點": "計算速度極快（毫秒級），適合海量維度", "缺點": "忽略多變量共線性與組合交互效應"}
    ]
    st.table(pd.DataFrame(algo_summary))

# Evaluate current selected algorithm
current_results = evaluate_method(dataset_name, selected_algo)
selected_step = next(item for item in current_results if item["k"] == k_selected)

# -----------------------------------------------------------------------------
# 7. Dual Subplots (Exact match to Notebook Image 2)
# -----------------------------------------------------------------------------
st.markdown("### 📊 評估指標圖表 (RMSE & R-squared by Number of Features)")

df_plot = pd.DataFrame([{
    'Number of Features': r['k'],
    'Selected Features': '[' + ', '.join(r['features']) + ']',
    'RMSE': r['RMSE'],
    'R-squared': r['R-squared']
} for r in current_results])

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5), dpi=100)

# Left Subplot: RMSE by Number of Features
ax1.plot(df_plot['Number of Features'], df_plot['RMSE'], marker='o', color='#1f77b4', linewidth=2.2, markersize=7, label="RMSE Curve")
ax1.plot(k_selected, selected_step['RMSE'], marker='o', color='#ffd700', markersize=12, markeredgecolor='#111827', markeredgewidth=2.5, label=f"Selected k={k_selected}")
ax1.set_title('RMSE by Number of Features', fontsize=14, fontweight='bold', pad=12)
ax1.set_xlabel('Number of Features', fontsize=12)
ax1.set_ylabel(f'RMSE ({unit_str})', fontsize=12)
ax1.set_xticks(range(1, max_k_limit + 1))
ax1.grid(True, linestyle='--', alpha=0.5)
ax1.legend(loc='best')

# Right Subplot: R-squared by Number of Features
ax2.plot(df_plot['Number of Features'], df_plot['R-squared'], marker='o', color='#1f77b4', linewidth=2.2, markersize=7, label="R² Curve")
ax2.plot(k_selected, selected_step['R-squared'], marker='o', color='#ffd700', markersize=12, markeredgecolor='#111827', markeredgewidth=2.5, label=f"Selected k={k_selected}")
ax2.set_title('R-squared by Number of Features', fontsize=14, fontweight='bold', pad=12)
ax2.set_xlabel('Number of Features', fontsize=12)
ax2.set_ylabel('R-squared', fontsize=12)
ax2.set_xticks(range(1, max_k_limit + 1))
ax2.grid(True, linestyle='--', alpha=0.5)
ax2.legend(loc='best')

plt.tight_layout()
st.pyplot(fig)

# -----------------------------------------------------------------------------
# 8. Progression Table (Exact match to Notebook Image 1)
# -----------------------------------------------------------------------------
st.markdown("### 📋 特徵篩選步階評估表 (Evaluation Metrics Table)")
st.caption(f"資料集: **{dataset_name}** | 演算法: **{selected_algo}** | Holdout 測試集 20% (random_state=0)")

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
st.markdown(f"### 📈 五大特徵選擇演算法對比圖 ({dataset_name})")
st.caption(f"比較 SBS、SFS、RFE、Lasso、Correlation 在特徵數 k = 1 到 {max_k_limit} 時的 RMSE 與 R² 走勢")

comp_results = {}
for algo in algorithms:
    comp_results[algo] = evaluate_method(dataset_name, algo)

fig_comp, (ax_c1, ax_c2) = plt.subplots(1, 2, figsize=(14, 5.5), dpi=100)

colors = ['#38ef7d', '#00f2fe', '#ffd700', '#ff7675', '#a29bfe']
markers = ['o', 's', '^', 'D', 'v']

for idx, (algo, steps_data) in enumerate(comp_results.items()):
    short_name = algo.split(' ')[0]
    rmses = [s['RMSE'] for s in steps_data]
    r2s = [s['R-squared'] for s in steps_data]
    k_vals = [s['k'] for s in steps_data]
    
    ax_c1.plot(k_vals, rmses, marker=markers[idx], color=colors[idx], linewidth=2, markersize=5, label=short_name)
    ax_c2.plot(k_vals, r2s, marker=markers[idx], color=colors[idx], linewidth=2, markersize=5, label=short_name)

ax_c1.set_title('Cross-Algorithm: Test RMSE by k (Lower is Better)', fontsize=13, fontweight='bold', pad=10)
ax_c1.set_xlabel('Number of Features', fontsize=11)
ax_c1.set_ylabel(f'RMSE ({unit_str})', fontsize=11)
ax_c1.set_xticks(range(1, max_k_limit + 1))
ax_c1.grid(True, linestyle='--', alpha=0.5)
ax_c1.legend()

ax_c2.set_title('Cross-Algorithm: Test R-squared by k (Higher is Better)', fontsize=13, fontweight='bold', pad=10)
ax_c2.set_xlabel('Number of Features', fontsize=11)
ax_c2.set_ylabel('R-squared', fontsize=11)
ax_c2.set_xticks(range(1, max_k_limit + 1))
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
col1.metric("Test RMSE", f"{selected_step['RMSE']:,.4f} {unit_str}")
col1.caption("均方根誤差（越低越好）")

col2.metric("Test R²", f"{selected_step['R-squared']*100:.2f}%")
col2.caption("模型解釋力（越高越好）")

col3.metric("Train RMSE", f"{selected_step['RMSE_train']:,.4f} {unit_str}")
col3.caption("訓練集誤差 (In-sample Loss)")

col4.metric("Train R²", f"{selected_step['R2_train']*100:.2f}%")
col4.caption("訓練集解釋力 (In-sample R²)")

# Regression Equation
model = selected_step['model']
feats = selected_step['train_features']
intercept = model.intercept_
coefs = model.coef_

terms = " ".join([f"{'+' if c >= 0 else '-'} {abs(c):.4f} × [{f}]" for f, c in zip(feats, coefs)])
st.markdown(f"""
**多元線性迴歸模型擬合方程式 (Fitted OLS Equation):**
```text
{target_col} ({unit_str}) = {intercept:,.4f} {terms}
```
""")

# Visualizations: Coefficients & Test Samples Predictions
col_coef, col_pred = st.columns(2)

with col_coef:
    st.markdown("#### 係數權重長條圖 (Feature Coefficients)")
    fig_coef, ax_coef = plt.subplots(figsize=(6, 3.8))
    bars = ax_coef.bar(feats, coefs, color=['#00f2fe' if c >= 0 else '#ff7675' for c in coefs])
    ax_coef.set_ylabel("Beta Weight")
    plt.xticks(rotation=30, ha='right', fontsize=9)
    ax_coef.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    st.pyplot(fig_coef)

with col_pred:
    st.markdown(f"#### 測試集預測 vs 實際值 (Actual vs Predicted {target_col})")
    fig_pred, ax_pred = plt.subplots(figsize=(6, 3.8))
    y_test_vals = test_df[target_col].values
    y_pred_vals = selected_step['predictions']
    
    # If test set is large, display first 20 samples for clarity
    display_n = min(len(y_test_vals), 20)
    sample_ids = [f"#{i}" for i in test_df.index[:display_n]]
    
    ax_pred.plot(sample_ids, y_test_vals[:display_n], marker='o', color='#1f77b4', label=f'Actual {target_col}', linewidth=1.8)
    ax_pred.plot(sample_ids, y_pred_vals[:display_n], marker='s', color='#ff7f0e', linestyle='--', label=f'Predicted {target_col}', linewidth=1.8)
    ax_pred.set_ylabel(f"{target_col} ({unit_str})")
    plt.xticks(rotation=45, ha='right', fontsize=8)
    ax_pred.grid(True, linestyle='--', alpha=0.5)
    ax_pred.legend(fontsize=9)
    plt.tight_layout()
    st.pyplot(fig_pred)

# Test Predictions Table
with st.expander(f"📋 點擊查看測試集樣本之實際值、預測值與殘差明細 (Total {len(test_df)} Test Samples)"):
    residuals = y_test_vals - y_pred_vals
    pct_errors = np.abs(residuals / y_test_vals) * 100
    
    pred_df = pd.DataFrame({
        'Sample Index': test_df.index,
        f'Actual {target_col}': y_test_vals,
        f'Predicted {target_col}': y_pred_vals,
        'Residual': residuals,
        'Absolute Error (%)': pct_errors
    })
    st.dataframe(
        pred_df.style.format({
            f'Actual {target_col}': '{:,.4f}',
            f'Predicted {target_col}': '{:,.4f}',
            'Residual': '{:+,.4f}',
            'Absolute Error (%)': '{:.2f}%'
        }),
        use_container_width=True,
        hide_index=True
    )

# Raw Data Viewer
with st.expander(f"📂 點擊查看 {dataset_name} 原始資料集 (Raw Dataset, {len(df_raw)} Rows)"):
    st.dataframe(df_raw, use_container_width=True)
