# 智慧跌倒監控與緊急應變系統 — Spotlight Summary

## 核心亮點

### 1. 從「跌倒分類」提升為完整 AI Agent 閉環照護系統
本專題最大的特色，不是只判斷 FALL / ADL，而是將跌倒事件擴展成完整的事件生命週期：

```text
偵測
→ 觀察
→ 詢問
→ 理解
→ 評估
→ 決策
→ 通報
→ 持續追蹤 / 結案
```

相較於傳統的 `FALL → Alarm` 單次警報模式，本系統更重視跌倒後的持續監控與主動應變。

---

### 2. DLFD、LLM 與安全決策層責任分工清楚
系統中的不同 AI 元件具有明確責任：

- **DLFD**：負責骨架式 ADL / FALL 辨識。
- **LLM**：負責語音意圖理解、自然語言互動與事件摘要。
- **State Machine / Policy Engine**：負責安全關鍵的事件狀態與緊急通報決策。
- **Notification Module**：執行 SMS、電話與 119 等模擬通知。

因此，LLM 不直接修改跌倒機率，也不直接控制緊急通報，能降低生成式 AI 在 safety-critical 場景中的不確定風險。

---

### 3. Proposal 八大 AI Agent 模組完整對應實作
系統已對應完整的 AI Agent System 架構：

1. **User / Application Scenario**  
   高齡者居家照護、獨居安全監控、長照機構與醫療照護。

2. **Query / Input**  
   Webcam、Uploaded Video、Text Input、Voice Input。

3. **Planner & Reasoning Agent**  
   Fall Response Orchestrator + State Machine。

4. **Data Acquisition / Retrieval**  
   RGB、Skeleton Sequence、Event Database、Voice Response 與統一 Event Context。

5. **Analytics Engine**  
   Pose Estimation、Temporal Buffer、DLFD（Joint / Bone / Motion）及 Post-Fall Analysis。

6. **Domain Knowledge Integration**  
   跌倒生物力學、ADL、Long-lie、Recovery 與 Emergency Policy。

7. **Decision / Recommendation**  
   LOW / MEDIUM / HIGH / EMERGENCY 與 SAFE / HELP / NO_RESPONSE。

8. **Output & Interaction**  
   Web Dashboard、AI Agent 對話、STT/TTS、事件紀錄與模擬通知。

---

### 4. 真正回應跌倒照護的 Domain Pain Point
系統不只追求模型 Accuracy，而是把幾個真實照護問題納入：

- **Alarm Fatigue**：ADL 誤判過多可能使照護者忽略真正警報。
- **Long-lie**：跌倒後長時間不起具有更高臨床風險。
- **NO_RESPONSE**：使用者無回應時需由 deterministic timeout 機制升級事件。
- **Recovery Detection**：跌倒後是否自行坐起、站立或行走，是事件是否能安全結案的重要依據。

因此研究問題從「模型是否判對」提升為「系統是否知道何時真正需要救援」。

---

### 5. Deep Research 架構完整
本專題的五個核心思維包括：

1. 跌倒是時序事件，而不是單一姿勢。
2. 降低誤報與提高跌倒檢出能力同等重要。
3. 感知模型與 AI Agent 必須分工。
4. 跌倒後狀態比跌倒瞬間更重要。
5. Dataset / benchmark 效能不等於真實部署可靠性。

這些思維使研究從單純模型比較提升為系統層級的設計問題。

---

### 6. 具備完整的 Exception / Fallback Design
系統考慮的不只是正常流程，也包含失敗情境：

- LLM API 離線或金鑰失效 → fallback to deterministic rules。
- 語意不明 → Agent 進行澄清。
- Pose Lost → 不得直接視為已恢復。
- STT Failure → retry 或文字輸入 fallback。
- NO_RESPONSE → 由硬性 timeout 決定，不交由 LLM 猜測。
- Notification failure → retry / fallback channel。

因此本系統不是單一路徑 Demo，而具有實際部署思維。

---

### 7. 六大驗收場景已形成 System-level Validation
目前設計的 TEST A–F 包含：

- **TEST A**：正常 ADL → LOW，不警報。
- **TEST B**：FALL +「我沒事」→ SAFE，降低風險並持續監控。
- **TEST C**：FALL +「我起不來，請幫我」→ HELP，升級風險並啟動模擬通報。
- **TEST D**：模糊語意 → 交由 LLM 判斷 UNCERTAIN 並維持戒備。
- **TEST E**：跌倒後長時間無回應 → NO_RESPONSE，由 timeout + Policy Engine 升級。
- **TEST F**：LLM unavailable → fallback rules，主監控流程不中斷。

因此驗證已從單純模型 Accuracy 擴展到完整的 Agent 行為驗證。

---

## 一句話 Spotlight

> **本研究的核心創新不在於單一跌倒模型，而在於將 DLFD 骨架式跌倒辨識、Post-Fall Monitoring、LLM 語音互動、Deterministic Policy Engine 與緊急應變整合成一個可持續觀察、互動、決策與升級的閉環式 AI Agent 照護系統。**

---

## 建議下一步
若要讓 Proposal 更完整，下一階段應加入實際數據證據，例如：

- Sensitivity
- Specificity
- Precision / Recall / F1
- ROC-AUC / PR-AUC
- False Alarm Rate
- Event-level Recall
- Agent Response Latency
- Voice Intent Accuracy
- Recovery Detection Accuracy

如此可以讓整份專題從「架構完整」進一步提升為「架構與實證皆完整」。
