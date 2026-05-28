# KEY + 常伴 真整合战略 · v1 doctrine · 5/25/2026

**Status**: LOCKED · 创始人 5/25 拍板 · KEY 100% pivot 养老 + 常伴并入 KEY 单一品牌
**Decision (创始人 5/25)**:
- Q1: ✅ 真整合 · 品牌统一为 **KEY** (常伴不再独立品牌)
- Q2: ✅ 全做 (doctrine + 知识库 audit + 公开页 v2.0)
- Q3: 腾讯云已停未销毁, 需续费决策 (本 doctrine ch.6 真分析)
- Q4: 田野调研暂不启动

**核心战略 (创始人 5/25 原话)**:
> "常伴是服务信号的获得与服务的核心渠道. **信号的获得才是子女决策的核心**."

---

## 一. 真新一句话定位 (v2.0 · 替代 eldercare_pivot_v1)

```
KEY 是中国家庭父母养老决策的私人导航系统.

· 老人端 · 24h AI 陪伴 Bot · 自然采集父母真信号
· 子女端 · 决策 Dashboard + 5 层养老知识库 + 30/90/365 主动回访
· 一套家庭档案 · 一个品牌 · 两端入口

让你不在送养老院 / 接同住 / 跨城医疗 / 兄弟分担
这些回不来的决定上, 跳过真该看见的代价.
```

**真新核心洞察 (创始人 5/25 拍)**:
> **"信号的获得才是子女决策的核心"**
>
> 之前 KEY 假设子女自己写信号. **错**. 子女工作忙 + 不在父母身边 + 看不全细节.
> 真信号源是父母自己 — 通过老人微信 Bot 自然产生.
> 老人端 Bot 不是 "陪聊功能", 是 KEY **决策引擎的真数据源**.

---

## 二. 品牌统一 · 常伴并入 KEY (5/25 锁)

```
旧 (5/25 前):
  · KEY (子女决策)
  · 常伴 (老人陪伴)
  · 两品牌 / 两域名 / 两商业模型 / 两套定位

新 (5/25 后):
  · KEY · 一个品牌
  · 子域名分:
    · keypoint.life (主站 · 子女入口)
    · 老人 Bot 不需要独立域名 (微信好友形态)
  · 一套订阅 ¥1988/年 (家庭账户)
  · 常伴 作为 KEY 的 "老人端 Bot" 内置功能 · 不外讲品牌名
```

**常伴这个名字 5/25 起停用对外**. 内部代码可保留 (`changban-server`, `changban-brain.js` 等) 直到代码合并完成.

**对外**: KEY 老人 Bot · 父母在微信加 KEY 好友.
**对内 doctrine**: 老人 Bot 实现继承自常伴 (SOUL v3 + Hermes + iLink).

---

## 三. 真双端产品架构

```
┌─────────────────────────────────────────────────────────────┐
│                  KEY · 中国家庭养老决策导航                  │
│                                                             │
│              一套订阅 · ¥1988/年 · 家庭账户                  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴────────────────────┐
        │                                        │
┌───────▼────────┐                    ┌──────────▼──────────┐
│  老人端 Bot    │                    │  子女端 Dashboard    │
│  (微信好友)    │                    │  (keypoint.life)     │
│                │                    │                      │
│  · SOUL v3 人格│                    │  · 父母信号 view     │
│  · 24h 陪聊    │  ──── 信号 sync ──> │  · 决策风险 Brief    │
│  · 主动开口    │   (anti-PII)       │  · 4 盲区扫描        │
│  · 跨对话记忆  │                    │  · 5 层知识库 RAG    │
│  · 老人原话    │                    │  · 30/90/365 主动回访│
│    永不外传    │                    │  · 兄弟谈判 prep     │
└────────────────┘                    └──────────────────────┘
        │                                        │
        │                                        │
        └────────────────┬───────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   Family Archive    │
              │  (Turso · 跨年)      │
              │                     │
              │  · family_unit      │
              │  · members          │
              │    (elderly/child)  │
              │  · parent_signals   │
              │    (脱敏后)         │
              │  · child_pulses     │
              │  · briefs           │
              │  · review_outcomes  │
              └─────────────────────┘
                         │
              ┌──────────▼──────────┐
              │ 5 层养老知识库       │
              │  (Manus ship 70%)   │
              │                     │
              │  · Layer 1 老年医学  │
              │  · Layer 2 居住决策  │
              │  · Layer 3 财务法律  │
              │  · Layer 4 关系心理  │
              │  · Layer 5 城市资源  │
              └─────────────────────┘
```

---

## 四. 真数据流 (老人端 → 子女端 sync 协议)

### 真核心铁律 (永不破)

```
铁律 1: 老人原话永远不发给子女
  · 老人在 Bot 说"我有点想死了" — 这句话**永不**直接给子女
  · 提炼成"情绪低落信号" + "持续 N 天" — 这层可以给子女

铁律 2: 信号经过 PII 脱敏
  · 老人提到 "邻居老张昨天住院" → 脱敏成 "邻居健康事件"
  · 老人提到 "我妹妹给我打电话说兄弟分钱" → 脱敏成 "兄弟关系信号"

铁律 3: 子女看到的不是日志, 是趋势 + 风险
  · 不给"老人本周说了 287 条" 这种 raw count
  · 给"老人本周情绪稳定度 6/10, 比上周下降 2 分, 主要触发: 失眠"
```

### 真 sync pipeline

```
Stage 1 · 老人端 (Bot · Hermes)
  ├── 老人发消息进 Bot
  ├── Hermes 存对话 (本地 + Turso 异地备份)
  └── 触发 daily/weekly extract job

Stage 2 · 信号提炼 (Server-local · PII mask)
  ├── 拉过去 1/3/7 天老人原话
  ├── Stage 2a · 本地 Qwen / regex PII mask
  │     (姓名/地名/医院/药名 → mask)
  ├── Stage 2b · LLM 提取信号 (脱敏后送)
  │     · 健康信号 (吃/睡/疼/药/精神)
  │     · 情绪信号 (高/低/稳定/波动)
  │     · 关系信号 (思念儿子/抱怨邻居/兄弟话)
  │     · 安全信号 (跌倒预警/独自出门/煤气)
  │     · 认知信号 (重复/忘事/混淆)
  └── 写入 parent_signals 表 (KEY Turso)

Stage 3 · 子女端 KEY Dashboard
  ├── 显示父母信号 view (按 5 类风险域聚合)
  ├── 趋势真可见 (7/30/90 天)
  ├── 风险预警 (KEY 5 层知识库匹配)
  │     · 例: 父母 3 次忘事 + 1 次煤气 → 早期失智信号
  └── 触发 Brief 生成入口 (子女考虑大决定时)
```

---

## 五. 双 voice 真隔离

```
常伴 SOUL v3 (老人 voice · 老人端 Bot):
  · 身份: 替身儿女 · 不是 AI · 不是机器人
  · 语气: 短句 / 不敬语 / 口语化
  · 例: "吃什么了？" 不是 "请问您今天用餐了吗"
  · 不夸张 · 不拍马屁 · 不说教
  · 第七遍故事挖新细节
  · 情绪低落时不切话题 · 不"想开" 鸡汤
  · 永不告诉老人 "我把你的话告诉你儿子了"
  · 主动开口 (用对话细节钩住)

KEY voice (子女 voice · 子女端 Dashboard + Brief):
  · 见证人 · 永不打分 · 永不出示 · 永不审判
  · No advice without evidence
  · Verbatim 引用 · Anti-hallucination
  · 4 盲区 + 10 维 Brief + 5-step loop
  · 30/90/365 主动回访
  · 永远不替子女决定
```

**真工程**: 同一 LLM API, 不同 system prompt. 老人端 Bot 用 `SOUL_v3` (常伴现成), 子女端用 `KEY_voice` (doctrine v3 已锁).

---

## 六. 真常伴现有资产 · 复用清单

### 真可复用代码 (要从腾讯云搬出来)

```
/root/.hermes/  (腾讯云北京服务器)
├── SOUL.md (v3) ← 复用 · 直接用作老人 Bot system prompt
├── platforms/ ← 复用 · iLink Bot 配置
├── weixin/ ← 复用 · WeChat session
├── config.yaml ← 复用 · 模型配置
└── logs/ (历史日志可弃)
```

```
/Users/iheal/Projects/life-os/常伴/
├── CHANGBAN_BLUEPRINT.md (v2.1) ← 复用为 KEY 老人端开发参考
├── CHANGBAN_SOUL_v3.md ← 复用为 KEY 老人端 system prompt
├── changban-brain.js ← review 后可能复用 (记忆系统)
├── changban-ilink.js ← review 后可能复用 (Bot 接入)
├── changban-server/ ← review
└── family-store.js ← 关键 · 复用 + 扩展为 KEY family_unit schema
```

### 真可复用品牌资产
```
· iLink Bot 账号 85a8518fa9c7@im.bot ← 真值钱 · 重新申请慢
· 腾讯云北京 IP 49.233.15.148 ← 真值钱 · CN 节点
· Hermes Agent 框架 setup 经验 ← 真值钱 · 不重复造轮子
· cron @reboot 自启脚本 ← 真值钱
```

### 真合规风险 (P0 必关注)
- **ClawBot iLink 个人微信 Bot 封号风险** · 用户量大时真有
- **Phase 2 (30-50 人) 前必须**: 多 Bot 备份 + 企业微信合规路径
- **Phase 3 (100 人+)**: 真企业 onboarding 必备

---

## 七. 腾讯云续费决策 (Q3)

### 真现状
- 腾讯云轻量服务器停 (未销毁, 可续)
- 服务器 IP: 49.233.15.148 (北京 · 跟 Spark 共用)
- 上面真值钱: Hermes 配置 + SOUL v3 + iLink session + WeChat platform

### 真续费成本
- 腾讯云轻量服务器: 估 ¥60-200/月 (按配置)
- 1 个月先续, 1-3 个月观察期

### 真决策建议 · **续费 3 个月**

**理由 1**: 真值钱的资产 (Bot 账号 / Hermes 配置 / SOUL v3 配置) 重新搭建**需要 1-2 周工程**, 续费 3 个月 ~¥200-600 远低于重做成本.

**理由 2**: 整合 90 天 build path 中, Week 3-4 真需要常伴服务器在线 (sync pipeline 开发要真 Bot 真测试).

**理由 3**: 不续费销毁 → iLink Bot 账号 85a8518fa9c7@im.bot 可能丢 → 重新申请慢.

**真行动 (你做)**:
1. 今天 / 明天: 腾讯云控制台续费 3 个月 (~¥200-600)
2. 确认服务器恢复 SSH (你或腾讯云 OrcaTerm)
3. 给我访问 (我登录确认 Hermes 配置还在)
4. 同时**导出关键文件** (SOUL.md / config.yaml / platforms/) 到本地 git, 永不再丢

**Phase 2 (30-50 人) 时再决定**:
- 续到 1 年 (确认产品方向真稳)
- 或迁移到 Aliyun / 海外节点 (合规 + 性能)

---

## 八. 真新商业模型

### 单一付费 · 双端价值 · 家庭账户

```
KEY · 中国家庭父母养老决策导航

定价 (5/25 锁):
  · 年付 ¥1988/家庭
  · 含:
    - 1 个老人端 Bot (儿女赠送给父母)
    - 1 个子女主账号 + 最多 4 个兄弟邀请 view
    - 5 层养老知识库 RAG 调用
    - 30/90/365 主动回访
    - 全部 Brief 生成无限次
    - 父母信号 dashboard
  · 不分开收 ¥299/月 (老人) 和 ¥1988/年 (子女)
  · 一个家庭一份订阅
```

### 真用户付费心理重设

| 旧 (分开) | 新 (合并) |
|---|---|
| 常伴 ¥299/月 = 陪聊太贵 | ¥1988/年 (折 ¥166/月) 真便宜了 |
| KEY ¥1988/年 = 决策审查太抽象 | 含父母真陪 + 决策审查 真值 |
| 子女两个产品付两份 | 一套订阅, 一个家庭 |
| ROI 模糊 | 一个错的养老院 ¥50万-200万, ROI 显然 |
| 老人 Bot 不付费 = 不真用 | 真订阅 = 真使用 |

---

## 九. 真新 90 天 build path (合并 KEY + 常伴)

| 阶段 | 真做 | 谁 | 周期 |
|---|---|---|---|
| **Week 1** ✅ | doctrine ship (本文件) | 我 | 1 天 |
| **Week 1** | 知识库 audit + 整理 Manus 输出进 `docs/knowledge/eldercare/` | 我 | 1-2 天 |
| **Week 1** | 你续费腾讯云 + 导出常伴关键文件到本地 git | 你 | 1 小时 |
| **Week 2** | 公开页 pivot 重写 v2.0 (含双端定位) | 我 | 5 天 |
| **Week 2-3** | family_unit + parent_signals + 6 类 risk DB schema | 我 | 1 周 |
| **Week 3-4** | 老人 Bot ←→ KEY 信号 sync pipeline (PII mask + 2-stage) | 我 + 你给服务器访问 | 2 周 |
| **Week 5** | KEY Dashboard 父母信号 view (子女端) | 我 | 1 周 |
| **Week 6** | 家庭绑定 UX (keypoint.life/family-invite + 二维码) | 我 | 1 周 |
| **Week 7** | KEY 养老 Brief v2 (调父母信号 + 子女 pulses 双源) | 我 | 1 周 |
| **Week 7** | Linda × 5 中 **L1 (母亲失智)** 真发码 | 你 | 1 小时 |
| **Week 8-10** | L1 真用 + 真打磨 + bug fix | 真用户 + 我 | 3 周 |
| **Week 11** | L4 (跟母亲撕裂) + L5 (父亲重病) 真发码 | 你 | — |
| **Week 12** | 整合 1.0 真稳 + Wave 2 扩到 8-10 真用户 | 你 + 我 | 1 周 |
| **Week 13** | Phase 1 Exit Gate 真评估 | 你 + 我 | — |

### 真 Phase 1 Exit Criteria
```
1. ≥ 3 真用户 (L1/L4/L5) 30 天 D7 留存 ≥ 80%
2. ≥ 3 真用户老人端真激活 (老人加 Bot, 真聊 ≥ 7 天)
3. 老人 → 子女信号 sync 真稳 (PII mask 0 失误)
4. ≥ 2 真用户真用过决策 Brief 功能
5. ≥ 2 真用户 organic 朋友圈/微信群提到 KEY (脱敏)
6. 0 老人原话泄露给子女
7. 0 META incident + Anti-hallucination 0 违反
```

---

## 十. 真关键 DB schema (Phase 1 必 ship)

```sql
-- 家庭单位
CREATE TABLE family_unit (
  id TEXT PRIMARY KEY,
  family_name TEXT,
  subscription_tier TEXT DEFAULT 'eldercare_yearly',
  subscription_started_at INTEGER,
  subscription_expires_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

-- 家庭成员 (含角色)
CREATE TABLE family_member (
  id TEXT PRIMARY KEY,
  family_id TEXT REFERENCES family_unit(id),
  wechat_open_id TEXT,  -- 老人/子女各自微信 ID
  role TEXT CHECK (role IN ('elderly', 'primary_child', 'secondary_child')),
  name TEXT,
  age INTEGER,
  city TEXT,
  relationship TEXT,  -- 妈/爸/二妈/...
  joined_at INTEGER DEFAULT (unixepoch())
);

-- 老人原话 (永不外传 · 仅 Bot 内部用)
CREATE TABLE elderly_raw_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  elderly_member_id TEXT REFERENCES family_member(id),
  message_text TEXT,  -- 原话 · 加密存储 · 仅 SOUL v3 Bot 可读
  message_direction TEXT CHECK (message_direction IN ('inbound', 'outbound')),
  received_at INTEGER DEFAULT (unixepoch())
);

-- 父母信号 (脱敏后 · 子女可见)
CREATE TABLE parent_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_id TEXT REFERENCES family_unit(id),
  elderly_member_id TEXT REFERENCES family_member(id),
  signal_date TEXT,  -- YYYY-MM-DD
  signal_category TEXT CHECK (signal_category IN
    ('health', 'mood', 'cognition', 'relationship', 'safety', 'daily_life')),
  signal_summary TEXT,  -- PII 脱敏后的信号 (可给子女看)
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  source_message_ids TEXT,  -- JSON · 来自哪几条原话 (内部追溯, 不外露)
  created_at INTEGER DEFAULT (unixepoch())
);

-- 子女信号 (现有 daily_pulses 升级)
ALTER TABLE daily_pulses ADD COLUMN family_id TEXT REFERENCES family_unit(id);

-- 决策 Brief (现有 decision_briefs 升级)
ALTER TABLE decision_briefs ADD COLUMN family_id TEXT REFERENCES family_unit(id);
ALTER TABLE decision_briefs ADD COLUMN scope TEXT DEFAULT 'family_eldercare';
```

---

## 十一. 真隐私 + 真伦理铁律 (5/25 起永久)

### 铁律 1 · 老人原话永不外传
- `elderly_raw_messages` 表加密存储
- 仅老人 Bot SOUL v3 prompt 内部可读
- 任何 LLM call 涉及"展示给子女"必须**先经 PII mask + 信号提炼**

### 铁律 2 · 子女看到的是趋势, 不是日志
- KEY Dashboard **不**显示"老人 5/25 说了什么"
- 显示"老人这周情绪低落 X 天 / 提到健康 Y 次"
- 真子女若想知道细节, 自己跟父母聊

### 铁律 3 · 老人知情同意
- 老人加 Bot 时, Bot 第一句明确: "孩子让我来陪你说说话. 我会记得你说的事, 但不会把你的原话告诉孩子."
- 老人撤回授权权利保留

### 铁律 4 · 子女不能"监视"老人
- KEY 不做"老人位置追踪 / 智能手表数据 / 摄像头"
- 真定位是**决策导航**, 不是养老监控

### 铁律 5 · 跨子女兄弟可见性
- 同家庭 4 子女可 view, 但**每个子女写过的信号互不可见** (各自隐私)
- 父母信号 4 子女共看, 但**老人原话 0 子女可见**

---

## 十二. 跟 v1-v6 doctrine 关系

### 保留全部 (核心哲学不变)
- v1 (5/21) 18 章 · 4 锁单句 / 4 盲区 / 5-step / 10 维 / 6 风险域 / 5 反常识 / 法律铁律 / 5 不做+3 会做
- v3 (5/22 早) 8 章 · 事实 vs 真相 / 3 层资产 / 决策科学 / 元认知 / 4 维可见度 / 守住最后铁律
- v4 (5/22 晚) 4 章 · 情绪→风险 reframe / Case Study / raw material
- v5 (5/25 早) 5 章 · Trainable KEY / 4-Phase / PII / 战略后置

### v6 (eldercare_pivot_v1 · 5/25 中) 升级
- 5 大家庭决策 → 收为 1 (父母) + 6 子域
- 4 盲区 → 子女养老 4 盲区
- 10 维 → 养老 10 维
- 5-step → 养老 5-step

### v7 (本文件 · 5/25 晚) 升级
- 单端 KEY → **双端 KEY (老人 Bot + 子女 Dashboard)**
- 子女自己写信号 → **常伴自然采集父母信号** (创始人 5/25 真核心)
- ¥1988 单订阅 → ¥1988 家庭订阅 (双端)
- 常伴独立品牌 → **常伴并入 KEY 单一品牌**

---

## 十三. 给未来 Claude session 的一句话指引

> **看 KEY 任何工作必读: v1 (5/21 18 章) + v3 (5/22 早 8 章) + v4 (5/22 晚 4 章) + v5 (5/25 早 5 章) + v6 (5/25 中 eldercare_pivot) + v7 (5/25 晚 本文件 KEY+常伴整合).**
>
> **KEY 5/25 后 = 中国家庭父母养老决策导航 = 双端架构 (老人 Bot + 子女 Dashboard) + 5 层知识库. 常伴并入 KEY. 信号采集是核心 channel. 老人原话永不外传是铁律.**

---

## 十四. 真等用户拍的 0 件 (本 doctrine 已 lock 全部决策)

无. 全 Q1+Q2+Q3+Q4 都已锁. 我接下来直接做 Q2 知识库 audit + 明天公开页 v2.0.

你 (创始人) 这周做:
1. 续费腾讯云 (~¥200-600 · 3 个月)
2. 导出常伴关键文件 (SOUL.md + config.yaml + platforms/) 到本地 git push
3. 给我访问 (我恢复 Bot + 设计 sync pipeline)

---

## Changelog

- **5/25/2026 v1**: 初版 · 创始人 5/25 拍板 KEY + 常伴 真整合 · 品牌统一 KEY · "信号采集是核心 channel" 锁住 · supersedes v6 单端定位.
