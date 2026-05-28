# KEY · 中国家庭养老知识库

**目的**: KEY 决策引擎 RAG 调用的真权威知识源
**Status**: 5/25 audit + 整理 · Manus 已 ship 70% LLM 部分 · 田野 0%
**总文件数**: 109 个 .md 文件 (含 raw outputs)
**doctrine reference**: `docs/strategy/key_changban_integration_5_25.md` (v7) + `docs/strategy/eldercare_pivot_v1.md` (v6)

---

## 一. 真知识库目录结构

```
docs/knowledge/eldercare/
├── README.md                       (本文件 · 5/25 真 audit)
├── medical/                        (Layer 1 · 老年医学 · Module A)
│   ├── A1_dementia_4_types.md         · 失智症 4 类临床认知库 ★
│   ├── A1_cross_validation.md         · 3 模型交叉验证
│   ├── A2_chronic_diseases.md         · 老年慢病并发症 ★
│   ├── A3_medication_interaction.md   · 老年用药真互动 ★
│   ├── A4_fall_prevention_validation.md · 跌倒预防交叉验证
│   ├── A5_assessment_scales.md        · 失能评估量表 ★
│   ├── A6_palliative_care.md          · 安宁疗护与临终决策 ★
│   ├── chronic_diseases_clinical_guide.md   · 慢性病并发症临床指南
│   ├── polypharmacy_clinical_guide.md       · 多重用药临床指南
│   ├── fall_prevention_clinical_guide.md    · 跌倒预防与干预指南
│   └── raw_outputs/                   · 3 LLM 原始输出 (Gemini/GPT-4.1-Mini/Nano)
│
├── housing_decisions/              (Layer 2 · 居住决策 · Module B)
│   ├── B1_home_care_services_market.md      · 居家养老服务+价格 ★
│   ├── B2_community_eldercare_services.md   · 社区养老 9073 现状 ★
│   ├── B3_nursing_home_selection_guide.md   · 养老院分类+考察+合同 ★
│   ├── B4_remote_eldercare_decision_paths.md · 异地养老 3 路径 ★
│   ├── Module_B_cross_check_report.md       · 整体交叉验证
│   └── raw_outputs/                   · 3 LLM 原始输出
│
├── living/                         (Layer 2 · my copy · 跟 housing_decisions 部分重叠)
│   ├── B1_home_care_pricing.md
│   ├── B3_institutional_care.md
│   ├── B4_cross_city_migration.md
│   ├── b1_key_data_notes.md
│   └── module_B_cross_validation.md
│
├── financial_legal/                (Layer 3 · 财务法律 · Module C · Manus 完整版)
│   ├── C1_china_medical_insurance_details.md  · 中国医保真细节 ★
│   ├── C2_long_term_care_insurance_status.md  · 长护险 49 试点城市 ★
│   ├── C3_guardianship_medical_decisions_wills.md · 监护权+遗嘱 ★
│   └── C4_property_pension_wealth_inheritance.md · 房产+遗产+税务 ★
│
├── finance_legal/                  (Layer 3 · my copy)
│   ├── C1_medical_insurance.md
│   ├── C2_long_term_care_insurance.md
│   └── module_CD_cross_validation.md
│
├── Module_CD_cross_check_report.md (Layer 3+4 整体交叉验证 · Manus)
│
├── family_relationships/           (Layer 4 · 关系心理 · Module D · Manus 完整)
│   ├── D1_siblings_sharing_eldercare.md     · 兄弟姐妹分担 10 冲突 ★
│   ├── D2_parents_resisting_change.md       · 父母拒绝改变 10 劝说 ★
│   ├── D3_only_child_eldercare_strategies.md · 独生子女 10 解法 ★
│   └── D4_dementia_family_psychology.md     · 认知症家属心理重建 ★
│
├── relational/                     (Layer 4 · my copy)
│   ├── D1_sibling_negotiation.md
│   ├── D2_persuading_parents.md
│   ├── D3_only_child_caregiver.md
│   └── D4_dementia_family_psychology.md
│
├── city_resources/                 (Layer 5 · 城市资源 · Module E · Manus 完整)
│   ├── E1_beijing_nursing_homes_db.md       · 北京 Top 30 养老院 ★
│   ├── E2_shanghai_nursing_homes_db.md      · 上海 Top 30 养老院 ★
│   ├── E3_E4_sz_hz_nursing_homes_db.md      · 深圳+杭州 Top 15 ★
│   ├── E5_E6_geriatric_memory_clinics_db.md · 三甲老年科+记忆门诊 ★
│   ├── E7_home_care_providers_db.md         · 5 城上门护理供应商 ★
│   ├── E8_field_research_tools_and_jd.md    · 田野考察表+招聘 JD ★★★ (你可直接招)
│   ├── F1_F2_F3_family_feedback_china_features.md · 真实家属反馈 ★
│   ├── Module_EF_cross_check_report.md      · 整体交叉验证
│   ├── Module_E_cross_check_report.md       · E 单独交叉验证
│   └── raw_outputs/                   · 3 LLM 原始输出
│
├── cities/                         (Layer 5 · my copy)
│   ├── E1_beijing_top_30.md
│   ├── E2_shanghai_top_30.md
│   ├── E3_E4_shenzhen_hangzhou.md
│   ├── E7_home_care_providers.md
│   ├── E8_field_research_template.md
│   ├── module_E_cross_check_report.md
│   └── module_E_cross_validation.md
│
└── cases/                          (Module F · 案例库)
    └── F1_F3_real_family_feedback.md
```

★ = Manus 已 cross-validate 的高 confidence 真文档
★★★ = E8 田野工具 · 创始人可直接拿去招田野员

---

## 二. 真状态总表

| 层级 | 模块 | LLM 完成度 | 交叉验证 | 田野核实 | 真用 (RAG) |
|---|---|---|---|---|---|
| **Layer 1** | A1 失智症 4 类 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 1** | A2 老年慢病并发症 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 1** | A3 老年用药互动 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 1** | A4 跌倒预防 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 1** | A5 失能评估量表 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 1** | A6 安宁疗护 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 2** | B1 居家养老价格 | ✅ 100% | ✅ 3 模型 | ⚠️ 价格易变 | ⚠️ 季度 update |
| **Layer 2** | B2 社区养老 9073 | ✅ 100% | ✅ 3 模型 | ⚠️ 城市差异 | ⚠️ 城市 case |
| **Layer 2** | B3 养老院分类 | ✅ 100% | ✅ 3 模型 | ⚠️ 真选要田野 | ✅ ready (理论部分) |
| **Layer 2** | B4 异地养老路径 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 3** | C1 中国医保 | ✅ 100% | ✅ 3 模型 | ⚠️ 政策年变 | ⚠️ 年度 update |
| **Layer 3** | C2 长护险 49 试点 | ✅ 100% | ✅ 3 模型 | ⚠️ 政策快变 | ⚠️ 季度 update |
| **Layer 3** | C3 监护权遗嘱 | ✅ 100% | ✅ 3 模型 | ⚠️ 法律稳定 | ✅ ready |
| **Layer 3** | C4 房产遗产 | ✅ 100% | ✅ 3 模型 | ⚠️ 税法可能变 | ✅ ready (基础) |
| **Layer 4** | D1 兄弟姐妹谈判 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 4** | D2 父母拒绝劝说 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 4** | D3 独生子女解法 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 4** | D4 认知症家属心理 | ✅ 100% | ✅ 3 模型 | N/A | ✅ ready |
| **Layer 5** | E1 北京 Top 30 | ✅ 90% LLM | ✅ 2 模型 | ❌ **0 田野** | ⚠️ 需田野前不直接推荐 |
| **Layer 5** | E2 上海 Top 30 | ✅ 90% LLM | ✅ 2 模型 | ❌ **0 田野** | ⚠️ 需田野前不直接推荐 |
| **Layer 5** | E3+E4 深圳/杭州 | ✅ 90% LLM | ✅ 2 模型 | ❌ **0 田野** | ⚠️ |
| **Layer 5** | E5+E6 三甲老年科 | ✅ 100% LLM | ✅ 2 模型 | ⚠️ 复旦排名稳 | ✅ ready |
| **Layer 5** | E7 上门护理 | ✅ 90% LLM | ✅ 2 模型 | ❌ 0 田野 | ⚠️ |
| **Layer 5** | E8 田野工具 | ✅ 100% | N/A | N/A | ✅ ready (你可用) |
| **Module F** | F1-F3 真案例 | ✅ 100% | ✅ 2 模型 | N/A | ✅ ready |

**真总结**:
- **Layer 1+3+4**: 全 ready · 直接进 KEY RAG · 无需田野
- **Layer 2**: 理论部分 ready · 价格易变需季度 update
- **Layer 5**: **必须田野核实** · 否则不直接给用户推荐具体养老院

---

## 三. 真整理 backlog (本周可做)

### 真该做 (P1)
1. **去重**: my copy (living/relational/finance_legal/cities) vs Manus 完整版 (housing_decisions/family_relationships/financial_legal/city_resources)
   - 真建议: 保 Manus 完整版 (含 raw outputs), 删 my copy
   - 但先 git commit 当前状态 (双份不丢)
2. **加 source 真标注**: 每份 .md 顶加 `Source · Validated by · Last updated`
3. **真 RAG 摄入 plan**: 把每份 .md 解析进 KEY Turso DB, 建 `eldercare_knowledge_chunks` 表

### 真不做 (P2 等真用户触发)
1. 田野调研 (Q4 创始人 5/25 拍: 暂不做)
2. 季度 update (Phase 1 不必)
3. RAG 工程实施 (Phase 1 用 simple file-based, Phase 2 升级)

---

## 四. 真知识源真权威度

### 高权威 (直接进 KEY RAG, 不必田野)
- Module A 全部 (老年医学共识 + WHO + Beers Criteria + 中华医学会指南)
- Module D 全部 (心理学文献 + 家庭治疗师经验)
- Module C 部分 (民法典 + 医保政策原文)

### 中权威 (理论 ready, 应用要 case)
- Module B 全部 (居住决策 · 行情易变)
- Module C 政策细节 (各城市差异大)

### 低权威 (LLM 部分 ready, 必须田野核实)
- Module E 城市资源 (具体养老院/医院/供应商)
- Module F 真案例 (来源主要社媒)

---

## 五. 真给未来 Claude session 的指引

> 看 KEY 养老相关代码 / 文档前必读:
> 1. `docs/strategy/key_changban_integration_5_25.md` (v7 整合战略)
> 2. `docs/strategy/eldercare_pivot_v1.md` (v6 养老 pivot)
> 3. 本 README
>
> RAG 调用规则:
> - Layer 1+3+4 (medical/finance_legal/family_relationships) · 高 confidence 直接 cite
> - Layer 2 (housing_decisions) · 标 "价格行情, 仅供参考"
> - Layer 5 (city_resources) · 真养老院推荐**必须**配 "本数据仅供研究, 真选前请实地考察 (用 E8 田野表)"
> - Module F (cases) · "真实家属反馈, 不代表 KEY 推荐"

---

## 六. 真常伴 + KEY 整合 · 老人 Bot 在哪用知识库

知识库**主要供 KEY 子女端**调用 (生成 Brief / 给子女查询).

**老人端 Bot (SOUL v3) 通常不直接调用知识库**, 因为:
- SOUL v3 是"陪伴者", 不是"医学咨询师"
- 老人问"我膝盖疼怎么办" → Bot 答"疼了多久了?" (倾听), 不答"你应该看医生" (说教)

**唯一例外**: 老人 Bot 觉察到危险信号 (例: 老人说"我胸口疼了 2 天") → 内部触发 risk flag → **通过 sync pipeline 推给子女端**, 子女端 KEY Dashboard 显示**带知识库背书**的预警 ("胸闷+持续 2 天 = 心血管急症信号, 建议立刻去三甲急诊").

---

## Changelog

- **5/25/2026 v1**: 初版 · audit + 整理 Manus 已 ship 70% 知识库 + 真状态总表 + 双份 (Manus + my) 暂保留待去重.
