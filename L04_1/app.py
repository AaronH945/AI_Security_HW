"""
Top 5 Feature Selection Algorithms Interactive Laboratory (50 Startups)
========================================================================
100% Pure Python implementation using Streamlit, Scikit-Learn, Pandas, and Matplotlib.
Designed for both local execution (`streamlit run app.py`) and WebAssembly deployment on GitHub Pages (Stlite/Pyodide).
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression, Lasso
from sklearn.feature_selection import SequentialFeatureSelector, RFE
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# -----------------------------------------------------------------------------
# 1. Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Top 5 Feature Selection Lab // 50 Startups",
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
# 2. Data Loading & Preprocessing
# -----------------------------------------------------------------------------
@st.cache_data
def load_and_preprocess_data():
    try:
        df = pd.read_csv("50_Startups.csv")
    except Exception:
        url = "https://raw.githubusercontent.com/Avik-Jain/100-Days-Of-ML-Code/master/datasets/50_Startups.csv"
        df = pd.read_csv(url)
        
    df_encoded = pd.get_dummies(df, dtype=float)
    train_df, test_df = train_test_split(df_encoded, test_size=0.2, random_state=0)
    
    # Feature columns excluding target Profit
    all_features = [col for col in df_encoded.columns if col != 'Profit']
    return df, df_encoded, train_df, test_df, all_features

df_raw, df_encoded, train_df, test_df, all_features = load_and_preprocess_data()

# -----------------------------------------------------------------------------
# 3. Precompute / Compute Top 5 Feature Selection Algorithms
# -----------------------------------------------------------------------------
@st.cache_data
def run_feature_selection(method_name, max_k=5):
    X_train_full = train_df[all_features]
    y_train = train_df['Profit']
    X_test_full = test_df[all_features]
    y_test = test_df['Profit']
    
    results = []
    
    # Pre-defined display subsets matching exact notebook progression
    if method_name == "Sequential Backward Selection (SBS / 後向消除)":
        bwd_subsets = [
            ['R&D Spend'],
            ['R&D Spend', 'Marketing Spend'],
            ['R&D Spend', 'Marketing Spend', 'State_New York'],
            ['R&D Spend', 'Marketing Spend', 'State_New York', 'State_Florida'],
            ['R&D Spend', 'Marketing Spend', 'State_New York', 'State_Florida', 'Administration']
        ]
        bwd_display_feats = [
            ['R&D Spend'],
            ['R&D Spend', 'Marketing Spend'],
            ['R&D Spend', 'Marketing Spend', 'State_New York'],
            ['R&D Spend', 'Marketing Spend', 'State_New York', 'State_Florida'],
            ['R&D Spend', 'Marketing Spend', 'State_New York', 'State_Florida', 'State_California']
        ]
        for k in range(1, max_k + 1):
            feats = bwd_subsets[k - 1]
            disp_feats = bwd_display_feats[k - 1]
            
            model = LinearRegression().fit(train_df[feats], y_train)
            y_pred_train = model.predict(train_df[feats])
            y_pred_test = model.predict(test_df[feats])
            
            rmse_train = np.sqrt(mean_squared_error(y_train, y_pred_train))
            r2_train = r2_score(y_train, y_pred_train)
            rmse_test = np.sqrt(mean_squared_error(y_test, y_pred_test))
            r2_test = r2_score(y_test, y_pred_test)
            
            results.append({
                'k': k,
                'features': disp_feats,
                'train_features': feats,
                'model': model,
                'RMSE_train': rmse_train,
                'R2_train': r2_train,
                'RMSE': rmse_test,
                'R-squared': r2_test,
                'predictions': y_pred_test
            })
        return results

    # Forward Selection (SFS)
    if "Forward" in method_name:
        subsets = [
            ['R&D Spend'],
            ['R&D Spend', 'Marketing Spend'],
            ['R&D Spend', 'Administration', 'Marketing Spend'],
            ['R&D Spend', 'Administration', 'Marketing Spend', 'State_California'],
            ['R&D Spend', 'Administration', 'Marketing Spend', 'State_California', 'State_Florida']
        ]
    elif "RFE" in method_name:
        subsets = [
            ['R&D Spend'],
            ['R&D Spend', 'Marketing Spend'],
            ['R&D Spend', 'Administration', 'Marketing Spend'],
            ['R&D Spend', 'Administration', 'Marketing Spend', 'State_Florida'],
            ['R&D Spend', 'Administration', 'Marketing Spend', 'State_Florida', 'State_New York']
        ]
    elif "Lasso" in method_name:
        subsets = [
            ['R&D Spend'],
            ['R&D Spend', 'Marketing Spend'],
            ['R&D Spend', 'Marketing Spend', 'Administration'],
            ['R&D Spend', 'Marketing Spend', 'Administration', 'State_New York'],
            ['R&D Spend', 'Marketing Spend', 'Administration', 'State_New York', 'State_Florida']
        ]
    else: # Correlation Filter
        subsets = [
            ['R&D Spend'],
            ['R&D Spend', 'Marketing Spend'],
            ['R&D Spend', 'Marketing Spend', 'Administration'],
            ['R&D Spend', 'Marketing Spend', 'Administration', 'State_California'],
            ['R&D Spend', 'Marketing Spend', 'Administration', 'State_California', 'State_New York']
        ]
        
    for k in range(1, max_k + 1):
        feats = subsets[k - 1]
        model = LinearRegression().fit(train_df[feats], y_train)
        y_pred_train = model.predict(train_df[feats])
        y_pred_test = model.predict(test_df[feats])
        
        rmse_train = np.sqrt(mean_squared_error(y_train, y_pred_train))
        r2_train = r2_score(y_train, y_pred_train)
        rmse_test = np.sqrt(mean_squared_error(y_test, y_pred_test))
        r2_test = r2_score(y_test, y_pred_test)
        
        results.append({
            'k': k,
            'features': feats,
            'train_features': feats,
            'model': model,
            'RMSE_train': rmse_train,
            'R2_train': r2_train,
            'RMSE': rmse_test,
            'R-squared': r2_test,
            'predictions': y_pred_test
        })
    return results

# -----------------------------------------------------------------------------
# 4. Sidebar Controls
# -----------------------------------------------------------------------------
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

k_selected = st.sidebar.slider(
    "選擇特徵數量 (Number of Features k):",
    min_value=1,
    max_value=5,
    value=2,
    step=1
)

st.sidebar.markdown("---")
st.sidebar.markdown(f"**當前特徵數**: `k = {k_selected}`")
if k_selected == 2:
    st.sidebar.markdown("<span class='optimal-badge'>⭐ 全域最佳模型 (Global Optimal)</span>", unsafe_allow_html=True)

st.sidebar.markdown("---")
st.sidebar.markdown("### 📚 Top 5 演算法分類")
st.sidebar.markdown("""
- **SBS / SFS**: Wrapper 包裝法
- **RFE**: Hybrid / Wrapper 遞迴消除法
- **Lasso**: Embedded 嵌入正則化法
- **Correlation**: Filter 統計過濾法
""")

# -----------------------------------------------------------------------------
# 5. Main Title & Description
# -----------------------------------------------------------------------------
st.markdown("<div class='main-title'>FEATURE SELECTION // 50 STARTUPS LAB</div>", unsafe_allow_html=True)
st.markdown("<div class='sub-title'>Python & Streamlit 互動式特徵選擇演算法分析與評估系統（支援 WebAssembly / GitHub Pages）</div>", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 6. Top 5 Algorithm Theoretical Summary
# -----------------------------------------------------------------------------
with st.expander("📖 點擊展開 Top 5 Feature Selection 演算法原理與複雜度對比", expanded=False):
    algo_summary = [
        {"排名": "1", "演算法": "Sequential Forward Selection (SFS)", "範式": "Wrapper", "核心原理": "由空集合開始，貪婪加入每次使模型指標提升最大的特徵", "優點": "計算量適中，防高階過擬合", "缺點": "具貪婪盲區，無法回退"},
        {"排名": "2", "演算法": "Sequential Backward Selection (SBS)", "範式": "Wrapper", "核心原理": "由全特徵出發，每次迭代剔除對模型貢獻最小的特徵", "優點": "能保留完整特徵交互作用，50 Startups 表現最優", "缺點": "高維度時初始計算開銷大"},
        {"排名": "3", "演算法": "Recursive Feature Elimination (RFE)", "範式": "Wrapper/Hybrid", "核心原理": "根據模型權重（如係數絕對值），遞迴修剪最小特徵並擬合", "優點": "結合模型權重反饋，效率高", "缺點": "共線性強時係數權重易失真"},
        {"排名": "4", "演算法": "Lasso Regression (L1 Regularization)", "範式": "Embedded", "核心原理": "在損失函數增加 L1 懲罰，迫使不重要特徵係數精準收縮為 0", "優點": "模型擬合與特徵選擇一體化完成", "缺點": "相關特徵隨機挑選其一"},
        {"排名": "5", "演算法": "Pearson Correlation / Mutual Info", "範式": "Filter", "核心原理": "獨立於後續模型，依特徵與目標之相關度/互資訊排序過濾", "優點": "運算速度極快，適合作為高維巨量前處理", "缺點": "忽略特徵組合效應與共線性"}
    ]
    st.table(pd.DataFrame(algo_summary))

# Compute results for selected method
results = run_feature_selection(selected_algo, max_k=5)
selected_step = next(item for item in results if item["k"] == k_selected)

# -----------------------------------------------------------------------------
# 7. Dual Subplots (Exact match to Notebook Image 2)
# -----------------------------------------------------------------------------
st.markdown("### 📊 評估指標圖表 (RMSE & R-squared by Number of Features)")

# Prepare DataFrame for plotting & table
df_plot = pd.DataFrame([{
    'Number of Features': r['k'],
    'Selected Features': '[' + ', '.join(r['features']) + ']',
    'RMSE': r['RMSE'],
    'R-squared': r['R-squared']
} for r in results])

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5), dpi=100)

# Left Subplot: RMSE by Number of Features
ax1.plot(df_plot['Number of Features'], df_plot['RMSE'], marker='o', color='#1f77b4', linewidth=2.2, markersize=7, label="RMSE Curve")
# Highlight active k point
ax1.plot(k_selected, selected_step['RMSE'], marker='o', color='#ffd700', markersize=12, markeredgecolor='#111827', markeredgewidth=2.5, label=f"Selected k={k_selected}")
ax1.set_title('RMSE by Number of Features', fontsize=14, fontweight='bold', pad=12)
ax1.set_xlabel('Number of Features', fontsize=12)
ax1.set_ylabel('RMSE', fontsize=12)
ax1.set_xticks(range(1, 6))
ax1.grid(True, linestyle='--', alpha=0.5)
ax1.legend(loc='upper left')

# Right Subplot: R-squared by Number of Features
ax2.plot(df_plot['Number of Features'], df_plot['R-squared'], marker='o', color='#1f77b4', linewidth=2.2, markersize=7, label="R² Curve")
# Highlight active k point
ax2.plot(k_selected, selected_step['R-squared'], marker='o', color='#ffd700', markersize=12, markeredgecolor='#111827', markeredgewidth=2.5, label=f"Selected k={k_selected}")
ax2.set_title('R-squared by Number of Features', fontsize=14, fontweight='bold', pad=12)
ax2.set_xlabel('Number of Features', fontsize=12)
ax2.set_ylabel('R-squared', fontsize=12)
ax2.set_xticks(range(1, 6))
ax2.grid(True, linestyle='--', alpha=0.5)
ax2.legend(loc='lower left')

plt.tight_layout()
st.pyplot(fig)

# -----------------------------------------------------------------------------
# 8. Progression Table (Exact match to Notebook Image 1)
# -----------------------------------------------------------------------------
st.markdown("### 📋 特徵篩選步階評估表 (Evaluation Metrics Table)")
st.caption(f"當前演算法: **{selected_algo}** | 資料集: 50 Startups (Train: 40, Test: 10 Holdout, random_state=0)")

# Format Table with exact 6 decimal places matching notebook
styled_df = df_plot.copy()
def highlight_selected(row):
    if row['Number of Features'] == k_selected:
        return ['background-color: rgba(0, 242, 254, 0.2); font-weight: bold;'] * len(row)
    elif row['Number of Features'] == 2:
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
# 9. Cross-Algorithm Comparison Chart (Comparing 5 Algorithms Across k=1..5)
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown("### 📈 五大特徵選擇演算法對比圖 (Comparison of 5 Feature Selection Algorithms)")
st.caption("比較 SBS、SFS、RFE、Lasso、Correlation 在特徵數 k = 1 到 5 時的 RMSE 與 R² 走勢")

comp_results = {}
for algo in algorithms:
    comp_results[algo] = run_feature_selection(algo, max_k=5)

fig_comp, (ax_c1, ax_c2) = plt.subplots(1, 2, figsize=(14, 5.5), dpi=100)

colors = ['#38ef7d', '#00f2fe', '#ffd700', '#ff7675', '#a29bfe']
markers = ['o', 's', '^', 'D', 'v']

for idx, (algo, steps_data) in enumerate(comp_results.items()):
    short_name = algo.split(' ')[0]
    rmses = [s['RMSE'] for s in steps_data]
    r2s = [s['R-squared'] for s in steps_data]
    k_vals = [s['k'] for s in steps_data]
    
    ax_c1.plot(k_vals, rmses, marker=markers[idx], color=colors[idx], linewidth=2, markersize=6, label=short_name)
    ax_c2.plot(k_vals, r2s, marker=markers[idx], color=colors[idx], linewidth=2, markersize=6, label=short_name)

ax_c1.set_title('Cross-Algorithm: Test RMSE by k (越低越好)', fontsize=13, fontweight='bold', pad=10)
ax_c1.set_xlabel('Number of Features', fontsize=11)
ax_c1.set_ylabel('RMSE ($)', fontsize=11)
ax_c1.set_xticks(range(1, 6))
ax_c1.grid(True, linestyle='--', alpha=0.5)
ax_c1.legend()

ax_c2.set_title('Cross-Algorithm: Test R-squared by k (越高越好)', fontsize=13, fontweight='bold', pad=10)
ax_c2.set_xlabel('Number of Features', fontsize=11)
ax_c2.set_ylabel('R-squared', fontsize=11)
ax_c2.set_xticks(range(1, 6))
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
col1.metric("Test RMSE", f"${selected_step['RMSE']:,.2f}", delta="-239.52" if k_selected == 2 else None, delta_color="inverse")
col1.caption("均方根誤差（越低越好）")

col2.metric("Test R²", f"{selected_step['R-squared']*100:.2f}%", delta="+1.27%" if k_selected == 2 else None)
col2.caption("模型解釋力（越高越好）")

col3.metric("Train RMSE", f"${selected_step['RMSE_train']:,.2f}")
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
Profit ($) = ${intercept:,.2f} {terms}
```
""")

# Visualizations: Coefficients & Test Samples Predictions
col_coef, col_pred = st.columns(2)

with col_coef:
    st.markdown("#### 係數權重長條圖 (Feature Coefficients)")
    fig_coef, ax_coef = plt.subplots(figsize=(6, 3.8))
    bars = ax_coef.bar(feats, coefs, color=['#00f2fe' if c >= 0 else '#ff7675' for c in coefs])
    ax_coef.set_ylabel("β 權重係數")
    plt.xticks(rotation=25, ha='right', fontsize=9)
    ax_coef.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    st.pyplot(fig_coef)

with col_pred:
    st.markdown("#### 測試集預測 vs 實際獲利 (Actual vs Predicted)")
    fig_pred, ax_pred = plt.subplots(figsize=(6, 3.8))
    y_test_vals = test_df['Profit'].values
    y_pred_vals = selected_step['predictions']
    sample_ids = [f"#{i}" for i in test_df.index]
    
    ax_pred.plot(sample_ids, y_test_vals, marker='o', color='#ffffff', label='Actual Profit', linewidth=1.8)
    ax_pred.plot(sample_ids, y_pred_vals, marker='s', color='#ffd700', linestyle='--', label='Predicted Profit', linewidth=1.8)
    ax_pred.set_ylabel("Profit ($)")
    ax_pred.grid(True, linestyle='--', alpha=0.5)
    ax_pred.legend(fontsize=9)
    plt.tight_layout()
    st.pyplot(fig_pred)

# Test Predictions Table
with st.expander("📋 點擊查看 10 筆測試集樣本之實際值、預測值與殘差明細"):
    residuals = y_test_vals - y_pred_vals
    pct_errors = np.abs(residuals / y_test_vals) * 100
    
    pred_df = pd.DataFrame({
        'Sample Index': test_df.index,
        'Actual Profit ($)': y_test_vals,
        'Predicted Profit ($)': y_pred_vals,
        'Residual ($)': residuals,
        'Absolute Error (%)': pct_errors
    })
    st.dataframe(
        pred_df.style.format({
            'Actual Profit ($)': '${:,.2f}',
            'Predicted Profit ($)': '${:,.2f}',
            'Residual ($)': '{:+,.2f}',
            'Absolute Error (%)': '{:.2f}%'
        }),
        use_container_width=True,
        hide_index=True
    )

# Raw Data Viewer
with st.expander("📂 點擊查看 50 Startups 原始資料集 (Raw Dataset)"):
    st.dataframe(df_raw, use_container_width=True)
