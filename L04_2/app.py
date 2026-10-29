"""
Top 5 Feature Selection & Multiple Linear Regression Explorer (Lab 04_2)
========================================================================
Inspired by AIoT-DIC2 MultipleLR Architecture (https://huanchen1107.github.io/AIoT-DIC2-MultipleLR/)
Supports:
1. 8 Benchmark Machine Learning Regression Datasets
2. Dynamic Kaggle Dataset Fetching & Auto-Classification / Regression Detection

100% Pure Python implementation using Streamlit, Scikit-Learn, Pandas, NumPy, Matplotlib, SciPy, and KaggleHub.
Runs locally (`streamlit run app.py`) and on GitHub Pages via WebAssembly (Stlite/Pyodide).
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
import os
import glob
import time
import scipy.stats as stats
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LassoCV
from sklearn.feature_selection import RFE
from sklearn.metrics import root_mean_squared_error, r2_score, mean_absolute_error

try:
    import kagglehub
except ImportError:
    kagglehub = None

# -----------------------------------------------------------------------------
# 1. Page Configuration & Custom CSS Styling
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Multiple Linear Regression & Feature Selection Explorer // 8 ML Datasets + Kaggle",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# STARK HUD + Modern Glassmorphism Styling
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
        font-size: 0.98rem;
        margin-bottom: 1.2rem;
    }
    .dataset-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(0, 242, 254, 0.1);
        color: #00f2fe;
        border: 1px solid rgba(0, 242, 254, 0.3);
        padding: 6px 14px;
        border-radius: 8px;
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
        font-size: 0.82rem;
    }
    .occam-card {
        border-radius: 10px;
        padding: 14px 18px;
        margin-bottom: 1.5rem;
        font-size: 0.92rem;
        line-height: 1.5;
    }
    .occam-sweet {
        background: rgba(56, 239, 125, 0.1);
        border: 1px solid rgba(56, 239, 125, 0.35);
        color: #a7f3d0;
    }
    .occam-under {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.35);
        color: #bfdbfe;
    }
    .occam-over {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.35);
        color: #fde68a;
    }
    .active-predictors-box {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 10px 14px;
        margin-bottom: 1.2rem;
    }
    .predictor-tag {
        display: inline-block;
        background: rgba(0, 242, 254, 0.15);
        color: #00f2fe;
        border: 1px solid rgba(0, 242, 254, 0.4);
        padding: 3px 8px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.82rem;
        margin: 2px 4px;
    }
    .calc-box {
        background: rgba(14, 21, 37, 0.8);
        border: 1px solid rgba(0, 242, 254, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    .calc-pred-val {
        font-size: 2.2rem;
        font-weight: 800;
        color: #38ef7d;
        font-family: monospace;
    }
    .clf-alert-card {
        background: rgba(244, 63, 94, 0.12);
        border: 2px solid #f43f5e;
        border-radius: 12px;
        padding: 24px;
        margin: 20px 0;
    }
    .reg-success-card {
        background: rgba(16, 185, 129, 0.12);
        border: 2px solid #10b981;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 20px;
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
    "✈️ Flight Ticket Price Prediction (機票價格預測)": "flight",
    "🌐 🔍 自訂 Kaggle 資料集 (Custom Kaggle Dataset)": "custom_kaggle"
}

# Load Master Precomputed Data directly without caching issues
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

# -----------------------------------------------------------------------------
# 3. Dynamic Kaggle Fetching & Classification / Regression Detector
# -----------------------------------------------------------------------------
def parse_kaggle_input(input_str):
    input_str = input_str.strip()
    if "kaggle.com/datasets/" in input_str:
        parts = input_str.split("kaggle.com/datasets/")[1].split("?")[0].strip("/").split("/")
        if len(parts) >= 2:
            return f"{parts[0]}/{parts[1]}"
    elif "kaggle.com/competitions/" in input_str:
        comp = input_str.split("kaggle.com/competitions/")[1].split("?")[0].strip("/").split("/")[0]
        return comp
    return input_str

def detect_target_and_type(df, user_target=None):
    if user_target and user_target in df.columns:
        target = user_target
    else:
        # Heuristic search for probable regression target
        candidates = ['target', 'charges', 'price', 'rent', 'sales', 'cnt', 'accident_risk', 
                      'popularity', 'value', 'median_house_value', 'label', 'class', 'species', 'survived', 'outcome', 'y']
        target = None
        for c in candidates:
            for col in df.columns:
                if col.lower() == c or col.lower().endswith('_' + c):
                    target = col
                    break
            if target:
                break
        if not target:
            num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            target = num_cols[-1] if num_cols else df.columns[-1]
            
    y = df[target]
    n_unique = y.nunique()
    is_num = pd.api.types.is_numeric_dtype(y)
    
    # Classification check
    if not is_num:
        is_classification = True
        classes = sorted([str(x) for x in y.dropna().unique().tolist()[:6]])
        reason = f"目標變數 '{target}' 為文字/類別型態 (dtype={y.dtype})，包含 {n_unique} 個類別 (如: {classes})。"
    elif n_unique <= 5:
        is_classification = True
        classes = sorted(y.dropna().unique().tolist())
        reason = f"目標變數 '{target}' 僅有 {n_unique} 個相異數值 ({classes})，為離散分類標籤。"
    elif n_unique <= 15 and (y.dropna() == y.dropna().round()).all() and (n_unique / len(y) < 0.05):
        is_classification = True
        classes = sorted(y.dropna().unique().tolist()[:6])
        reason = f"目標變數 '{target}' 為離散整數類別 (相異值數={n_unique}，如: {classes}...)"
    else:
        is_classification = False
        reason = f"目標變數 '{target}' 為連續數值型態 (相異值數={n_unique}，數值範圍={y.min():,.2f} ~ {y.max():,.2f})。"
        
    return {
        "target": target,
        "is_classification": is_classification,
        "reason": reason,
        "n_unique": n_unique,
        "dtype": str(y.dtype)
    }

def build_dynamic_dataset_analysis(df_raw, target_col, dataset_name="Custom Kaggle Dataset", unit="Units"):
    df = df_raw.copy()
    df = df.dropna(subset=[target_col])
    if len(df) > 4000:
        df = df.sample(n=4000, random_state=0)
        
    y_raw = df[target_col].astype(float)
    X_raw = df.drop(columns=[target_col])
    
    # Drop pure ID columns or high-cardinality unique text
    drop_candidates = []
    for c in X_raw.columns:
        if X_raw[c].nunique() <= 1:
            drop_candidates.append(c)
        elif X_raw[c].dtype == object and (X_raw[c].nunique() > 50 or X_raw[c].nunique() == len(X_raw)):
            drop_candidates.append(c)
        elif c.lower() in ['id', 'index', 'unnamed: 0']:
            drop_candidates.append(c)
    X_raw = X_raw.drop(columns=drop_candidates)
    
    # Dummy encoding
    X_encoded = pd.get_dummies(X_raw, drop_first=True, dtype=float)
    for c in X_encoded.columns:
        if X_encoded[c].isnull().any():
            X_encoded[c] = X_encoded[c].fillna(X_encoded[c].median())
            
    X_encoded = X_encoded.loc[:, X_encoded.nunique() > 1]
    
    if len(X_encoded.columns) > 16:
        corrs = X_encoded.apply(lambda col: np.corrcoef(col, y_raw)[0, 1]).abs().fillna(0)
        top_cols = corrs.sort_values(ascending=False).head(16).index.tolist()
        X_encoded = X_encoded[top_cols]
        
    p = len(X_encoded.columns)
    feature_cols = X_encoded.columns.tolist()
    df_clean = pd.concat([X_encoded, y_raw.rename(target_col)], axis=1)
    
    train_df, test_df = train_test_split(df_clean, test_size=0.2, random_state=0)
    X_train, y_train = train_df[feature_cols], train_df[target_col]
    X_test, y_test = test_df[feature_cols], test_df[target_col]
    
    n_tr, n_te = len(X_train), len(X_test)
    
    def eval_subset(feats):
        k = len(feats)
        lr = LinearRegression()
        lr.fit(X_train[feats], y_train)
        y_test_pred = lr.predict(X_test[feats])
        y_train_pred = lr.predict(X_train[feats])
        
        rmse_te = float(root_mean_squared_error(y_test, y_test_pred))
        r2_te = float(r2_score(y_test, y_test_pred))
        mae_te = float(mean_absolute_error(y_test, y_test_pred))
        
        rmse_tr = float(root_mean_squared_error(y_train, y_train_pred))
        r2_tr = float(r2_score(y_train, y_train_pred))
        
        df_denom = max(1, n_te - k - 1)
        adj_r2 = float(1.0 - (1.0 - r2_te) * (n_te - 1) / df_denom) if r2_te > -10.0 else -10.0
        
        if r2_te >= 0.99999:
            f_stat, f_pval = 9999.0, 0.0
        elif r2_te <= 0:
            f_stat, f_pval = 0.0, 1.0
        else:
            f_stat = float((r2_te / k) / max(1e-9, (1.0 - r2_te) / df_denom))
            f_pval = float(stats.f.sf(f_stat, k, df_denom))
            
        X_design = np.column_stack([np.ones(n_tr), X_train[feats].values])
        beta_all = np.concatenate([[lr.intercept_], lr.coef_])
        residuals = y_train.values - X_design @ beta_all
        mse_resid = max(1e-9, np.sum(residuals**2) / max(1, n_tr - k - 1))
        
        try:
            cov_beta = mse_resid * np.linalg.pinv(X_design.T @ X_design)
            se_beta = np.sqrt(np.maximum(1e-9, np.diag(cov_beta)))
            t_stats = beta_all / se_beta
            p_vals = 2.0 * (1.0 - stats.t.cdf(np.abs(t_stats), df=max(1, n_tr - k - 1)))
        except Exception:
            se_beta = np.zeros(k + 1)
            t_stats = np.zeros(k + 1)
            p_vals = np.ones(k + 1)
            
        vifs = []
        for i, f in enumerate(feats):
            if k == 1:
                vifs.append(1.0)
            else:
                other_f = [col for col in feats if col != f]
                r2_j = LinearRegression().fit(X_train[other_f], X_train[f]).score(X_train[other_f], X_train[f])
                vif_val = 1.0 / max(1e-4, (1.0 - r2_j)) if r2_j < 0.9999 else 999.9
                vifs.append(float(min(999.9, vif_val)))
                
        diag_records = []
        p_val_0 = float(round(p_vals[0], 5))
        sig_0 = "***" if p_val_0 < 0.001 else ("**" if p_val_0 < 0.01 else ("*" if p_val_0 < 0.05 else "ns"))
        diag_records.append({
            "feature": "(Intercept)",
            "beta": round(float(beta_all[0]), 4),
            "se": round(float(se_beta[0]), 4),
            "t_stat": round(float(t_stats[0]), 3),
            "p_val": p_val_0,
            "significance": sig_0,
            "ci_lower": round(float(beta_all[0] - 1.96 * se_beta[0]), 4),
            "ci_upper": round(float(beta_all[0] + 1.96 * se_beta[0]), 4),
            "vif": "-",
            "vif_status": "-"
        })
        
        for idx_f, f_name in enumerate(feats):
            b_val = round(float(beta_all[idx_f + 1]), 4)
            se_val = round(float(se_beta[idx_f + 1]), 4)
            t_val = round(float(t_stats[idx_f + 1]), 3)
            p_val = round(float(p_vals[idx_f + 1]), 5)
            sig = "***" if p_val < 0.001 else ("**" if p_val < 0.01 else ("*" if p_val < 0.05 else "ns"))
            vif_f = round(vifs[idx_f], 2)
            v_status = "Safe (<5)" if vif_f < 5.0 else ("Moderate (5-10)" if vif_f <= 10.0 else "High (>10)")
            diag_records.append({
                "feature": f_name,
                "beta": b_val,
                "se": se_val,
                "t_stat": t_val,
                "p_val": p_val,
                "significance": sig,
                "ci_lower": round(float(b_val - 1.96 * se_val), 4),
                "ci_upper": round(float(b_val + 1.96 * se_val), 4),
                "vif": f"{vif_f:.2f}",
                "vif_status": v_status
            })
            
        test_samples = []
        for i in range(min(15, n_te)):
            act = round(float(y_test.iloc[i]), 4)
            pred = round(float(y_test_pred[i]), 4)
            res = round(float(pred - act), 4)
            abs_err = round(abs(res), 4)
            denom = abs(act) if abs(act) > 1e-4 else (abs(np.mean(y_test)) + 1e-4)
            pct_err = round(float((abs_err / denom) * 100.0), 2)
            status = "In Range (<=15%)" if pct_err <= 15.0 else ("Moderate (15-30%)" if pct_err <= 30.0 else "High Residual (>30%)")
            test_samples.append({
                "id": i + 1,
                "actual": act,
                "predicted": pred,
                "residual": res,
                "abs_error": abs_err,
                "pct_error": pct_err,
                "status": status
            })
            
        return {
            'features': feats,
            'RMSE': round(rmse_te, 6),
            'R-squared': round(r2_te, 6),
            'Adjusted_R2': round(adj_r2, 6),
            'MAE': round(mae_te, 6),
            'F_stat': round(f_stat, 3),
            'F_pval': round(f_pval, 6),
            'RMSE_train': round(rmse_tr, 6),
            'R2_train': round(r2_tr, 6),
            'intercept': round(float(lr.intercept_), 5),
            'coefficients': [round(float(c), 5) for c in lr.coef_],
            'diagnostics': diag_records,
            'test_samples': test_samples
        }
        
    # SFS
    sfs_steps = {}
    remaining = list(feature_cols)
    current_feats = []
    for k in range(1, p + 1):
        best_f, best_rmse = None, float('inf')
        for cand in remaining:
            trial_feats = current_feats + [cand]
            lr_t = LinearRegression().fit(X_train[trial_feats], y_train)
            trial_rmse = root_mean_squared_error(y_test, lr_t.predict(X_test[trial_feats]))
            if trial_rmse < best_rmse:
                best_rmse = trial_rmse
                best_f = cand
        current_feats.append(best_f)
        remaining.remove(best_f)
        sfs_steps[str(k)] = eval_subset(list(current_feats))
        
    # SBS
    sbs_steps = {}
    curr_sbs = list(feature_cols)
    sbs_subsets = {p: list(curr_sbs)}
    for k in range(p - 1, 0, -1):
        worst_f, best_rmse = None, float('inf')
        for cand in curr_sbs:
            trial_feats = [f for f in curr_sbs if f != cand]
            lr_t = LinearRegression().fit(X_train[trial_feats], y_train)
            trial_rmse = root_mean_squared_error(y_test, lr_t.predict(X_test[trial_feats]))
            if trial_rmse < best_rmse:
                best_rmse = trial_rmse
                worst_f = cand
        curr_sbs.remove(worst_f)
        sbs_subsets[k] = list(curr_sbs)
    for k in range(1, p + 1):
        sbs_steps[str(k)] = eval_subset(sbs_subsets[k])
        
    # RFE
    rfe_steps = {}
    rfe_model = RFE(estimator=LinearRegression(), n_features_to_select=1, step=1)
    rfe_model.fit(X_train, y_train)
    rfe_ranking = sorted(zip(feature_cols, rfe_model.ranking_), key=lambda x: x[1])
    rfe_order = [x[0] for x in rfe_ranking]
    for k in range(1, p + 1):
        rfe_steps[str(k)] = eval_subset(rfe_order[:k])
        
    # Lasso
    lasso_steps = {}
    lasso_cv = LassoCV(cv=min(5, len(X_train)), random_state=0, max_iter=3000)
    lasso_cv.fit(X_train, y_train)
    coef_order = sorted(zip(feature_cols, np.abs(lasso_cv.coef_)), key=lambda x: x[1], reverse=True)
    lasso_order = [x[0] for x in coef_order]
    for k in range(1, p + 1):
        lasso_steps[str(k)] = eval_subset(lasso_order[:k])
        
    # Pearson Correlation
    corr_steps = {}
    corrs = X_train.apply(lambda col: np.corrcoef(col, y_train)[0, 1]).abs().fillna(0)
    corr_order = corrs.sort_values(ascending=False).index.tolist()
    for k in range(1, p + 1):
        corr_steps[str(k)] = eval_subset(corr_order[:k])
        
    min_rmse_k = min(range(1, p + 1), key=lambda k: sfs_steps[str(k)]['RMSE'])
    
    return {
        "metadata": {
            "name": dataset_name,
            "target": target_col,
            "unit": unit,
            "desc": f"動態 Kaggle 資料集: {dataset_name}",
            "optimal_k": min_rmse_k,
            "max_k": p,
            "rows": len(df_clean),
            "features": feature_cols
        },
        "SFS": sfs_steps,
        "SBS": sbs_steps,
        "RFE": rfe_steps,
        "Lasso": lasso_steps,
        "Correlation": corr_steps,
        "df_clean": df_clean
    }

# -----------------------------------------------------------------------------
# 4. Sidebar: Dataset Selection & Controls
# -----------------------------------------------------------------------------
st.sidebar.header("📁 資料集選擇 (Dataset Selection)")

selected_dataset_label = st.sidebar.selectbox(
    "選擇要分析的資料集 (Choose Dataset):",
    list(DATASET_MAP.keys()),
    index=0
)
dataset_id = DATASET_MAP[selected_dataset_label]

custom_analysis_data = None
df_raw = pd.DataFrame()

if dataset_id == "custom_kaggle":
    st.sidebar.markdown("---")
    st.sidebar.subheader("🌐 輸入 Kaggle 資料集")
    
    if "kaggle_input_val" not in st.session_state:
        st.session_state["kaggle_input_val"] = "mirichoi0218/insurance"
        
    kaggle_handle_raw = st.sidebar.text_input(
        "Kaggle Dataset Handle 或網址:",
        value=st.session_state["kaggle_input_val"],
        help="輸入格式如: owner/dataset-name 或完整 Kaggle 網址"
    )
    
    st.sidebar.markdown("**快速測試範例 (Quick Presets):**")
    col_p1, col_p2 = st.sidebar.columns(2)
    with col_p1:
        if st.sidebar.button("醫療保費 (迴歸)"):
            st.session_state["kaggle_input_val"] = "mirichoi0218/insurance"
            st.rerun()
        if st.sidebar.button("鳶尾花 (分類警訊)"):
            st.session_state["kaggle_input_val"] = "uciml/iris"
            st.rerun()
    with col_p2:
        if st.sidebar.button("加州房價 (迴歸)"):
            st.session_state["kaggle_input_val"] = "camnugent/california-housing-prices"
            st.rerun()
        if st.sidebar.button("鐵達尼號 (分類警訊)"):
            st.session_state["kaggle_input_val"] = "heptapod/titanic"
            st.rerun()

    uploaded_file = st.sidebar.file_uploader("或直接上傳 CSV 檔案 (Upload CSV):", type=["csv"])
    
    # Process custom Kaggle input or upload
    parsed_handle = parse_kaggle_input(kaggle_handle_raw)
    
    df_loaded = None
    target_dataset_name = parsed_handle
    
    if uploaded_file is not None:
        try:
            df_loaded = pd.read_csv(uploaded_file)
            target_dataset_name = uploaded_file.name
        except Exception as e:
            st.sidebar.error(f"上傳 CSV 解析失敗: {e}")
    elif parsed_handle:
        if kagglehub is None:
            st.sidebar.error("kagglehub 未安裝，無法自動下載 Kaggle 資料集。")
        else:
            try:
                with st.spinner(f"正在從 Kaggle 下載 {parsed_handle}..."):
                    download_dir = kagglehub.dataset_download(parsed_handle)
                    csv_files = glob.glob(os.path.join(download_dir, "**", "*.csv"), recursive=True)
                    if not csv_files:
                        st.error(f"在 Kaggle 資料集 {parsed_handle} 中未找到任何 CSV 檔案。")
                        st.stop()
                    # Pick the largest/main CSV
                    selected_csv = max(csv_files, key=os.path.getsize)
                    df_loaded = pd.read_csv(selected_csv)
            except Exception as e:
                st.error(f"❌ 抓取 Kaggle 資料集失敗: {e}\n請確認資料集名稱是否正確，或此為需要登入的競賽資料集。")
                st.stop()
                
    if df_loaded is None or df_loaded.empty:
        st.info("請在左側輸入 Kaggle 資料集名稱或上傳 CSV 檔案以開始分析。")
        st.stop()
        
    # Target detection and Task Classification
    detection = detect_target_and_type(df_loaded)
    target_col = detection["target"]
    is_classification = detection["is_classification"]
    
    # -------------------------------------------------------------------------
    # CLASSIFICATION WARNING BRANCH
    # -------------------------------------------------------------------------
    if is_classification:
        st.markdown(f"""
        <div class='clf-alert-card'>
            <h2 style='color: #f43f5e; margin-top: 0; display: flex; align-items: center; gap: 10px;'>
                ⚠️ 檢測為分類任務 (Classification Task Detected)
            </h2>
            <div style='font-size: 1.05rem; line-height: 1.7; color: #fecdd3;'>
                <p>系統檢測到您輸入的 Kaggle 資料集 <strong>「{target_dataset_name}」</strong> 之目標變數 <code>{target_col}</code> 屬於<strong>分類任務</strong>！</p>
                <ul>
                    <li><strong>目標欄位:</strong> <code>{target_col}</code> (資料型態: <code>{detection['dtype']}</code>)</li>
                    <li><strong>相異類別數:</strong> {detection['n_unique']} 個類別</li>
                    <li><strong>判定依據:</strong> {detection['reason']}</li>
                </ul>
                <hr style='border: none; border-top: 1px solid rgba(244, 63, 94, 0.4); margin: 16px 0;'>
                <h4 style='color: #fff; margin-bottom: 6px;'>📢 系統溫馨提醒：</h4>
                <p style='color: #fda4af; margin-bottom: 12px;'>
                    本實驗室為<strong>「連續數值多元線性迴歸 (Multiple Linear Regression) 與特徵選擇」</strong>專用系統，模型假設目標變數為連續分佈之實數值。<br>
                    <strong>請輸入用於「迴歸預測 (Regression)」的資料集</strong>（例如房價預測、保險費用、房屋租金、氣候數值、銷售量預測等）！
                </p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("### 💡 點擊下方推薦的 Kaggle 迴歸資料集快速體驗：")
        col_rec1, col_rec2, col_rec3 = st.columns(3)
        with col_rec1:
            if st.button("🏥 醫療保費預測 (charges)\n`mirichoi0218/insurance`"):
                st.session_state["kaggle_input_val"] = "mirichoi0218/insurance"
                st.rerun()
        with col_rec2:
            if st.button("🏡 加州房價預測 (house_value)\n`camnugent/california-housing-prices`"):
                st.session_state["kaggle_input_val"] = "camnugent/california-housing-prices"
                st.rerun()
        with col_rec3:
            if st.button("🍷 紅酒品質預測 (quality)\n`uciml/red-wine-quality-cortez-et-al-2009`"):
                st.session_state["kaggle_input_val"] = "uciml/red-wine-quality-cortez-et-al-2009"
                st.rerun()
                
        with st.expander("📂 點擊查看此分類資料集之原始數據預覽"):
            st.dataframe(df_loaded.head(100), use_container_width=True)
            
        st.stop()
        
    # -------------------------------------------------------------------------
    # REGRESSION CONFIRMED BRANCH
    # -------------------------------------------------------------------------
    st.markdown(f"""
    <div class='reg-success-card'>
        <h4 style='color: #38ef7d; margin: 0 0 6px 0;'>✅ 資料集型態確認：連續數值迴歸預測 (Regression Task Confirmed)</h4>
        <div style='color: #d1fae5; font-size: 0.92rem;'>
            <strong>資料集:</strong> {target_dataset_name} | <strong>目標變數:</strong> <code>{target_col}</code> | <strong>樣本數:</strong> {len(df_loaded):,} | <strong>判定說明:</strong> {detection['reason']}
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Cache dynamic analysis in session_state to prevent re-computing on UI slider interactions
    cache_key = f"cache_{target_dataset_name}_{target_col}"
    if cache_key in st.session_state:
        custom_analysis_data = st.session_state[cache_key]
    else:
        with st.spinner("正在進行特徵選擇 (SFS, SBS, RFE, Lasso, Correlation) 與 OLS 統計診斷..."):
            custom_analysis_data = build_dynamic_dataset_analysis(df_loaded, target_col, target_dataset_name, unit="Units")
            st.session_state[cache_key] = custom_analysis_data
            
    ds_data = custom_analysis_data
    ds_meta = ds_data["metadata"]
    df_raw = ds_data["df_clean"]

else:
    # Built-in 8 datasets
    ds_data = master_precomputed.get(dataset_id, {})
    ds_meta = ds_data.get("metadata", {
        "file": "accident_risk.csv", "target": "accident_risk", "unit": "Risk (0~1)", 
        "desc": "道路事故風險", "optimal_k": 9, "max_k": 16, "rows": 5000, "features": []
    })
    
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

st.sidebar.markdown(f"""
🎯 **目標變數**: `{ds_meta['target']}`  
📊 **指標單位**: `{ds_meta['unit']}`  
📝 **說明**: {ds_meta['desc']}
""")

st.sidebar.markdown("---")
st.sidebar.header("🎛️ 特徵篩選控制台 (Controls)")

algorithms = [
    "Sequential Forward Selection (SFS / 前向選擇)",
    "Sequential Backward Selection (SBS / 後向消除)",
    "Recursive Feature Elimination (RFE / 遞迴特徵消除)",
    "Lasso L1 Regularization (L1 正則化嵌入法)",
    "Pearson Correlation (相關係數過濾法)"
]

selected_algo = st.sidebar.selectbox(
    "選擇特徵選擇演算法 (Algorithm):",
    algorithms,
    index=0 # Default: SFS
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

# Quick Step Buttons
st.sidebar.markdown("**快速跳轉 (Quick Jump):**")
col_q1, col_q2, col_q3 = st.sidebar.columns(3)
with col_q1:
    if st.button("Min (k=1)"):
        st.session_state[f"slider_k_{dataset_id}"] = 1
        st.rerun()
with col_q2:
    if st.button(f"⭐ Sweet ({optimal_k})"):
        st.session_state[f"slider_k_{dataset_id}"] = optimal_k
        st.rerun()
with col_q3:
    if st.button(f"Full ({max_k})"):
        st.session_state[f"slider_k_{dataset_id}"] = max_k
        st.rerun()

st.sidebar.markdown("---")
st.sidebar.markdown("### 📚 參考架構與功能")
st.sidebar.markdown("""
- **參考標竿**: [huanchen1107 MultipleLR](https://huanchen1107.github.io/AIoT-DIC2-MultipleLR/)
- **評估指標**: RMSE, R², Adj R², MAE, F-stat
- **診斷分析**: OLS 標準誤, t檢定, p值, 95% CI, VIF
- **即時模擬**: What-If 預測計算機
- **動態擴充**: 支援任何 Kaggle 迴歸資料集
""")

# -----------------------------------------------------------------------------
# 5. Method Evaluation & Step Extraction
# -----------------------------------------------------------------------------
def get_algo_key(algo_name):
    if "Backward" in algo_name or "SBS" in algo_name: return "SBS"
    elif "Forward" in algo_name or "SFS" in algo_name: return "SFS"
    elif "RFE" in algo_name: return "RFE"
    elif "Lasso" in algo_name: return "Lasso"
    else: return "Correlation"

def evaluate_method(ds_id, algo_name, active_ds_data=None):
    algo_key = get_algo_key(algo_name)
    data_source = active_ds_data if active_ds_data is not None else master_precomputed.get(ds_id, {})
    if algo_key in data_source:
        steps = data_source[algo_key]
        num_steps = len(steps)
        results = []
        for k in range(1, num_steps + 1):
            s = steps[str(k)]
            results.append({
                'k': k,
                'features': s['features'],
                'RMSE_train': s.get('RMSE_train', 0.0),
                'R2_train': s.get('R2_train', 0.0),
                'RMSE': s['RMSE'],
                'R-squared': s['R-squared'],
                'Adjusted_R2': s.get('Adjusted_R2', s['R-squared']),
                'MAE': s.get('MAE', 0.0),
                'F_stat': s.get('F_stat', 0.0),
                'F_pval': s.get('F_pval', 0.0),
                'intercept': s['intercept'],
                'coefficients': s['coefficients'],
                'diagnostics': s.get('diagnostics', []),
                'test_samples': s.get('test_samples', [])
            })
        return results
    return []

current_results = evaluate_method(dataset_id, selected_algo, active_ds_data=ds_data)

if not current_results:
    st.error(f"無法載入 {selected_dataset_label} 之計算指標。")
    st.stop()

# Safe retrieval of selected_step
selected_step = next(
    (item for item in current_results if item["k"] == k_selected),
    current_results[-1]
)

# -----------------------------------------------------------------------------
# 6. Header and Summary Display
# -----------------------------------------------------------------------------
st.markdown("<div class='main-title'>MULTIPLE LINEAR REGRESSION & FEATURE SELECTION EXPLORER</div>", unsafe_allow_html=True)
st.markdown("<div class='sub-title'>Inspired by AIoT-DIC2 MultipleLR Architecture · Top 5 Algorithms · Real-time OLS Diagnostics & Interactive Simulator</div>", unsafe_allow_html=True)

st.markdown(f"""
<div class='dataset-badge'>
    📁 ACTIVE: <strong>{selected_dataset_label}</strong> | 目標: <strong>{ds_meta['target']} ({ds_meta['unit']})</strong> | 樣本: <strong>{ds_meta['rows']:,}</strong> | 維度: <strong>{len(current_results)} 特徵</strong>
</div>
""", unsafe_allow_html=True)

# Active Predictors Banner
active_feats = selected_step['features']
feats_tags_html = "".join([f"<span class='predictor-tag'>[{f}]</span>" for f in active_feats])
st.markdown(f"""
<div class='active-predictors-box'>
    <strong style='color:#cbd5e1; font-size:0.9rem;'>🎯 當前模型選入特徵 (Active Predictors, k = {k_selected}):</strong><br>
    {feats_tags_html}
</div>
""", unsafe_allow_html=True)

# Occam's Razor / Parsimony Insight Card
if k_selected < optimal_k:
    occam_html = f"""
    <div class='occam-card occam-under'>
        <strong>📉 低擬合警訊 (Underfitting Zone · k = {k_selected} &lt; {optimal_k}):</strong>
        特徵數過少，模型未能充分捕捉關鍵目標變異。RMSE 仍有顯著下降空間，建議增加特徵數量至 <strong>k = {optimal_k}</strong> 以達到最佳預測力。
    </div>
    """
elif k_selected == optimal_k:
    occam_html = f"""
    <div class='occam-card occam-sweet'>
        <strong>⭐ 奧卡姆剃刀最佳點 (Sweet Spot · k = {optimal_k}):</strong>
        達成模型精簡性（Parsimony）與預測準確度的完美平衡！以最少必要特徵達到最低 Test RMSE 與最高 R²，兼具最佳泛化能力與極低過擬合風險。
    </div>
    """
else:
    occam_html = f"""
    <div class='occam-card occam-over'>
        <strong>⚠️ 過擬合與共線性風險區 (Overfitting / Collinearity Risk · k = {k_selected} &gt; {optimal_k}):</strong>
        特徵數已超過建議最佳點，新引入特徵邊際效益遞減，可能導致參數估計方差膨脹與多重共線性風險。
    </div>
    """
st.markdown(occam_html, unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 7. Top 5 Summary Metrics Cards (Exact match to reference site)
# -----------------------------------------------------------------------------
col1, col2, col3, col4, col5 = st.columns(5)

col1.metric("Test RMSE", f"{selected_step['RMSE']:,.4f}")
col1.caption("均方根誤差（越低越好）")

col2.metric("R² Score", f"{selected_step['R-squared']*100:.2f}%")
col2.caption("模型解釋力（越高越好）")

col3.metric("Adjusted R²", f"{selected_step['Adjusted_R2']*100:.2f}%")
col3.caption("校正特徵數懲罰項")

col4.metric("Test MAE", f"{selected_step['MAE']:,.4f}")
col4.caption("平均絕對誤差")

f_val = selected_step['F_stat']
p_val = selected_step['F_pval']
p_str = "< 0.0001" if p_val < 0.0001 else f"{p_val:.4f}"
col5.metric("F-Statistic", f"{f_val:,.1f}", delta=f"p {p_str}")
col5.caption("全體模型顯著性檢定")

# -----------------------------------------------------------------------------
# 8. Dual Subplots (RMSE & R-squared by Number of Features)
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown("### 📊 評估指標圖表 (RMSE & R-squared by Number of Features)")

df_plot = pd.DataFrame([{
    'Number of Features': r['k'],
    'Selected Features': '[' + ', '.join(r['features']) + ']',
    'RMSE': r['RMSE'],
    'R-squared': r['R-squared'],
    'Adjusted_R2': r['Adjusted_R2'],
    'MAE': r['MAE']
} for r in current_results])

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.2), dpi=100)

# Left Subplot: RMSE by Number of Features
ax1.plot(df_plot['Number of Features'], df_plot['RMSE'], marker='o', color='#1f77b4', linewidth=2.2, markersize=6, label="RMSE Curve")
sweet_step = next(item for item in current_results if item["k"] == optimal_k)
ax1.plot(optimal_k, sweet_step['RMSE'], marker='*', color='#38ef7d', markersize=14, label=f"Sweet Spot k={optimal_k}")
ax1.plot(k_selected, selected_step['RMSE'], marker='o', color='#ffd700', markersize=11, markeredgecolor='#111827', markeredgewidth=2.2, label=f"Selected k={k_selected}")
ax1.set_title('RMSE by Number of Features (Lower is Better)', fontsize=13, fontweight='bold', pad=12)
ax1.set_xlabel('Number of Features (k)', fontsize=11)
ax1.set_ylabel(f"RMSE ({ds_meta['unit']})", fontsize=11)
ax1.set_xticks(range(1, len(current_results) + 1, 2 if len(current_results) > 12 else 1))
ax1.grid(True, linestyle='--', alpha=0.5)
ax1.legend(loc='best')

# Right Subplot: R-squared & Adjusted R2
ax2.plot(df_plot['Number of Features'], df_plot['R-squared'], marker='o', color='#1f77b4', linewidth=2.2, markersize=6, label="R² Curve")
ax2.plot(df_plot['Number of Features'], df_plot['Adjusted_R2'], marker='s', color='#a29bfe', linestyle=':', linewidth=1.8, markersize=5, label="Adj R² Curve")
ax2.plot(optimal_k, sweet_step['R-squared'], marker='*', color='#38ef7d', markersize=14, label=f"Sweet Spot k={optimal_k}")
ax2.plot(k_selected, selected_step['R-squared'], marker='o', color='#ffd700', markersize=11, markeredgecolor='#111827', markeredgewidth=2.2, label=f"Selected k={k_selected}")
ax2.set_title('R-squared & Adj R² by Number of Features (Higher is Better)', fontsize=13, fontweight='bold', pad=12)
ax2.set_xlabel('Number of Features (k)', fontsize=11)
ax2.set_ylabel('R-squared / Adj R²', fontsize=11)
ax2.set_xticks(range(1, len(current_results) + 1, 2 if len(current_results) > 12 else 1))
ax2.grid(True, linestyle='--', alpha=0.5)
ax2.legend(loc='best')

plt.tight_layout()
st.pyplot(fig)

# -----------------------------------------------------------------------------
# 9. Progression Table (Exact match to Notebook Style)
# -----------------------------------------------------------------------------
st.markdown("### 📋 特徵篩選步階評估表 (Evaluation Progression Table)")
st.caption(f"資料集: **{selected_dataset_label}** | 演算法: **{selected_algo}** | Holdout 測試集 20% (random_state=0)")

styled_df = df_plot.copy()
def highlight_selected(row):
    if row['Number of Features'] == k_selected:
        return ['background-color: rgba(0, 242, 254, 0.2); font-weight: bold;'] * len(row)
    elif row['Number of Features'] == optimal_k:
        return ['background-color: rgba(56, 239, 125, 0.12);'] * len(row)
    return [''] * len(row)

st.dataframe(
    styled_df.style.apply(highlight_selected, axis=1).format({
        'RMSE': '{:.6f}',
        'R-squared': '{:.6f}',
        'Adjusted_R2': '{:.6f}',
        'MAE': '{:.6f}'
    }),
    use_container_width=True,
    hide_index=True
)

# -----------------------------------------------------------------------------
# 10. Cross-Algorithm Comparison Chart (Comparing 5 Feature Selection Methods)
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown(f"### 📈 五大特徵選擇演算法全景對比圖 ({selected_dataset_label.split(' (')[0]})")
st.caption(f"比較 SBS、SFS、RFE、Lasso、Correlation 在特徵數 k = 1 到 {len(current_results)} 時的收斂軌跡")

comp_results = {}
for algo in algorithms:
    comp_results[algo] = evaluate_method(dataset_id, algo, active_ds_data=ds_data)

fig_comp, (ax_c1, ax_c2) = plt.subplots(1, 2, figsize=(14, 5.2), dpi=100)

colors = ['#00f2fe', '#38ef7d', '#ffd700', '#ff7675', '#a29bfe']
markers = ['o', 's', '^', 'D', 'v']

for idx, (algo, steps_data) in enumerate(comp_results.items()):
    short_name = algo.split(' ')[0]
    rmses = [s['RMSE'] for s in steps_data]
    r2s = [s['R-squared'] for s in steps_data]
    k_vals = [s['k'] for s in steps_data]
    
    ax_c1.plot(k_vals, rmses, marker=markers[idx], color=colors[idx], linewidth=1.8, markersize=4.5, label=short_name)
    ax_c2.plot(k_vals, r2s, marker=markers[idx], color=colors[idx], linewidth=1.8, markersize=4.5, label=short_name)

ax_c1.set_title('Cross-Algorithm: Test RMSE by k (Lower is Better)', fontsize=13, fontweight='bold', pad=10)
ax_c1.set_xlabel('Number of Features (k)', fontsize=11)
ax_c1.set_ylabel(f"RMSE ({ds_meta['unit']})", fontsize=11)
ax_c1.set_xticks(range(1, len(current_results) + 1, 2 if len(current_results) > 12 else 1))
ax_c1.grid(True, linestyle='--', alpha=0.5)
ax_c1.legend()

ax_c2.set_title('Cross-Algorithm: Test R-squared by k (Higher is Better)', fontsize=13, fontweight='bold', pad=10)
ax_c2.set_xlabel('Number of Features (k)', fontsize=11)
ax_c2.set_ylabel('R-squared', fontsize=11)
ax_c2.set_xticks(range(1, len(current_results) + 1, 2 if len(current_results) > 12 else 1))
ax_c2.grid(True, linestyle='--', alpha=0.5)
ax_c2.legend()

plt.tight_layout()
st.pyplot(fig_comp)

# -----------------------------------------------------------------------------
# 11. Model Coefficients & Statistical Diagnostics Table (OLS Inference & VIF)
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown(f"### 🔬 多元線性迴歸係數與統計推論檢驗表 (OLS Diagnostics & VIF · k = {k_selected})")
st.caption("包含迴歸係數估計、標準誤 (SE)、t 統計量、雙尾 p 值、95% 信賴區間與共線性膨脹因子 (VIF)")

diag_data = selected_step.get('diagnostics', [])
if diag_data:
    df_diag = pd.DataFrame(diag_data)
    if 'vif' in df_diag.columns:
        df_diag['vif'] = df_diag['vif'].apply(lambda v: f"{v:.2f}" if isinstance(v, (int, float)) else str(v))
    df_diag_disp = df_diag.rename(columns={
        'feature': 'Predictor / Variable',
        'beta': 'Estimate (Beta)',
        'se': 'Std. Error',
        't_stat': 't-Statistic',
        'p_val': 'p-Value',
        'significance': 'Sig.',
        'ci_lower': '95% CI Lower',
        'ci_upper': '95% CI Upper',
        'vif': 'VIF',
        'vif_status': 'Collinearity Status'
    })
    st.dataframe(df_diag_disp, use_container_width=True, hide_index=True)
    st.caption("顯著性標示: `***` p < 0.001 | `**` p < 0.01 | `*` p < 0.05 | `ns` p ≥ 0.05；VIF 閾值: `< 5.0` 安全 | `5 ~ 10` 中度 | `> 10.0` 高度共線性")

# -----------------------------------------------------------------------------
# 12. Fitted OLS Mathematical Equation & Beta Weights Bar Charts
# -----------------------------------------------------------------------------
st.markdown("### 📐 多元線性迴歸模型擬合方程式 (Fitted OLS Equation)")

intercept = selected_step['intercept']
coefs = selected_step['coefficients']
feats = selected_step['features']

terms = " ".join([f"{'+' if c >= 0 else '-'} {abs(c):.4f} × [{f}]" for f, c in zip(feats, coefs)])
st.markdown(f"""
```text
{ds_meta['target']} ({ds_meta['unit']}) = {intercept:,.4f} {terms}
```
""")

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
    st.markdown("#### 特徵絕對權重分佈 (Absolute Feature Importance)")
    fig_imp, ax_imp = plt.subplots(figsize=(6, 4.2))
    abs_coefs = [abs(c) for c in coefs]
    sorted_pairs = sorted(zip(feats, abs_coefs), key=lambda x: x[1])
    sorted_f, sorted_w = [p[0] for p in sorted_pairs], [p[1] for p in sorted_pairs]
    ax_imp.barh(sorted_f, sorted_w, color='#38ef7d')
    ax_imp.set_xlabel("|Beta Weight|")
    ax_imp.grid(axis='x', linestyle='--', alpha=0.5)
    plt.tight_layout()
    st.pyplot(fig_imp)

# -----------------------------------------------------------------------------
# 13. Actual vs Predicted Diagnostic Scatter Plot (實際值 vs 預測值走勢圖)
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown(f"### 🎯 實際值 vs 預測值走勢散佈圖 (Actual vs. Predicted Diagnostic Plot)")
st.caption(f"以 Holdout 測試集呈現當前模型 (k = {k_selected}) 之預測擬合度，紅虛線代表 $y = x$ 完美預測基準線")

test_samples = selected_step.get('test_samples', [])
if test_samples:
    fig_act_pred, ax_ap = plt.subplots(figsize=(8, 4.8), dpi=100)
    actuals = [ts['actual'] for ts in test_samples]
    preds = [ts['predicted'] for ts in test_samples]
    
    min_val = min(min(actuals), min(preds))
    max_val = max(max(actuals), max(preds))
    pad = (max_val - min_val) * 0.08
    line_range = [min_val - pad, max_val + pad]
    
    ax_ap.plot(line_range, line_range, 'r--', linewidth=2.0, label='Ideal Fit Line (y = x)')
    ax_ap.scatter(actuals, preds, color='#00f2fe', edgecolors='#1e293b', s=90, alpha=0.9, zorder=3, label=f'Test Samples (k={k_selected})')
    
    ax_ap.set_title(f'Actual vs. Predicted: {ds_meta["target"]} ({ds_meta["unit"]})', fontsize=13, fontweight='bold', pad=10)
    ax_ap.set_xlabel(f'Actual {ds_meta["target"]}', fontsize=11)
    ax_ap.set_ylabel(f'Predicted {ds_meta["target"]}', fontsize=11)
    ax_ap.grid(True, linestyle='--', alpha=0.5)
    ax_ap.legend(loc='upper left')
    plt.tight_layout()
    st.pyplot(fig_act_pred)

# -----------------------------------------------------------------------------
# 14. Holdout Test Set Prediction & Residual Analysis Table
# -----------------------------------------------------------------------------
st.markdown("### 📋 測試集樣本預測與殘差診斷表 (Test Set Residual Analysis Table)")
st.caption("檢驗測試樣本之實際值、預測值、殘差 (Residual)、絕對誤差與百分比誤差")

if test_samples:
    df_samples = pd.DataFrame(test_samples)
    df_samples_disp = df_samples.rename(columns={
        'id': 'Sample #',
        'actual': f'Actual ({ds_meta["unit"]})',
        'predicted': f'Predicted ({ds_meta["unit"]})',
        'residual': 'Residual (ŷ - y)',
        'abs_error': 'Abs Error |e|',
        'pct_error': '% Error',
        'status': 'Diagnostic Status'
    })
    
    st.dataframe(
        df_samples_disp.style.format({
            f'Actual ({ds_meta["unit"]})': '{:,.4f}',
            f'Predicted ({ds_meta["unit"]})': '{:,.4f}',
            'Residual (ŷ - y)': '{:,.4f}',
            'Abs Error |e|': '{:,.4f}',
            '% Error': '{:.2f}%'
        }),
        use_container_width=True,
        hide_index=True
    )

# -----------------------------------------------------------------------------
# 15. Live Interactive Predictor (即時預測計算機 / What-If Scenario Simulator)
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown(f"### 🧮 即時預測計算機 (Live Interactive What-If Scenario Simulator)")
st.caption(f"調整下方當前選入特徵之數值，系統將透過擬合之 OLS 模型實時計算目標變數預測值與各特徵貢獻度")

sim_inputs = {}
cols_per_row = 3
feat_cols_ui = st.columns(cols_per_row)

for idx, f in enumerate(feats):
    ui_col = feat_cols_ui[idx % cols_per_row]
    if not df_raw.empty and f in df_raw.columns:
        f_min = float(df_raw[f].min())
        f_max = float(df_raw[f].max())
        f_median = float(df_raw[f].median())
        f_step = (f_max - f_min) / 100.0 if (f_max - f_min) > 0 else 1.0
        if f_step < 0.001: f_step = 0.001
        
        with ui_col:
            val = st.slider(
                f"[{f}]",
                min_value=f_min,
                max_value=f_max,
                value=f_median,
                step=f_step,
                key=f"sim_{dataset_id}_{f}"
            )
            sim_inputs[f] = val
    else:
        with ui_col:
            val = st.number_input(f"[{f}]", value=1.0, key=f"sim_{dataset_id}_{f}")
            sim_inputs[f] = val

sim_pred = intercept
sim_contributions = [{"Feature": "(Intercept)", "Value": 1.0, "Beta": intercept, "Contribution": intercept}]

for f, c in zip(feats, coefs):
    f_val = sim_inputs.get(f, 0.0)
    contrib = f_val * c
    sim_pred += contrib
    sim_contributions.append({
        "Feature": f,
        "Value": f_val,
        "Beta": c,
        "Contribution": contrib
    })

st.markdown(f"""
<div class='calc-box'>
    <div style='color: #8fa5c4; font-size: 0.95rem; font-weight: 600;'>🎯 即時模型預測結果 (Real-time Predicted Value):</div>
    <div class='calc-pred-val'>{sim_pred:,.4f} <span style='font-size: 1.2rem; color: #00f2fe;'>{ds_meta['unit']}</span></div>
    <div style='color: #94a3b8; font-size: 0.85rem; margin-top: 4px;'>模型: {selected_algo} · k = {k_selected}</div>
</div>
""", unsafe_allow_html=True)

with st.expander("🔍 展開特徵貢獻度明細分解 (Feature Contribution Breakdown)"):
    df_contrib = pd.DataFrame(sim_contributions)
    st.dataframe(
        df_contrib.style.format({
            'Value': '{:,.4f}',
            'Beta': '{:,.4f}',
            'Contribution': '{:,.4f}'
        }),
        use_container_width=True,
        hide_index=True
    )

# -----------------------------------------------------------------------------
# 16. Theory Expander
# -----------------------------------------------------------------------------
st.markdown("---")
with st.expander("📖 點擊展開 Top 5 Feature Selection 演算法原理與複雜度對比", expanded=False):
    algo_summary = [
        {"排名": "1", "演算法": "Sequential Forward Selection (SFS)", "範式": "Wrapper", "核心原理": "由空集合開始，每次走訪候選特徵，貪婪選入使目標指標提升最大的單一特徵", "優點": "計算量適中，小特徵數時收斂效率極佳", "缺點": "貪婪盲區，無法回溯剔除已選特徵"},
        {"排名": "2", "演算法": "Sequential Backward Selection (SBS)", "範式": "Wrapper", "核心原理": "由全特徵集合出發，每次迭代剔除對模型貢獻最小（損失最小）的特徵", "優點": "充分考量特徵交互作用，保留全局最佳特徵組合", "缺點": "高維度時初始計算開銷大"},
        {"排名": "3", "演算法": "Recursive Feature Elimination (RFE)", "範式": "Wrapper/Hybrid", "核心原理": "訓練模型後依據係數權重絕對值 |β| 或重要性遞迴剃除最小特徵", "優點": "結合模型權重反饋，全域收斂效率高", "缺點": "高度共線性時係數估計易失真"},
        {"排名": "4", "演算法": "Lasso Regression (L1 Regularization)", "範式": "Embedded", "核心原理": "在損失函數中加入 L1 範數懲罰項，促使不重要特徵係數直接精準收縮至 0", "優點": "特徵選擇與模型訓練一體化完成", "缺點": "相關特徵中傾向隨機挑選其一"},
        {"排名": "5", "演算法": "Pearson Correlation Filter", "範式": "Filter", "核心原理": "獨立於預測模型，計算特徵與目標變數間之皮爾森相關係數絕對值排序", "優點": "計算速度極快（毫秒級），適合海量維度", "缺點": "忽略多變量共線性與組合交互效應"}
    ]
    st.table(pd.DataFrame(algo_summary))

# -----------------------------------------------------------------------------
# 17. Raw Dataset Viewer
# -----------------------------------------------------------------------------
if not df_raw.empty:
    with st.expander(f"📂 點擊查看 {selected_dataset_label} 原始資料集 (Raw Dataset, {len(df_raw)} Rows × {len(df_raw.columns)} Columns)"):
        st.dataframe(df_raw, use_container_width=True)
