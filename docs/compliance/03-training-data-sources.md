# 03 — 训练数据来源声明

> 备案表"训练数据"项对应内容.

## 核心声明

**Life OS 不进行任何模型预训练或微调.**

我们仅调用已通过国家备案的第三方大模型 API. 训练数据的合规性由模型提供方
(DeepSeek 等) 在其各自备案中承担.

## 我们存什么数据

### 用户产生的数据
| 类别 | 存储位置 | 用途 |
|------|----------|------|
| Daily Pulse | 自有 SQLite | 长期记忆 / Sunday Review 生成 |
| 决策对话 | 自有 SQLite | 历史回顾 / Brain 整合 |
| Brain (RMC) | 自有 SQLite | Prompt 注入, 让 AI 记得用户 |
| Email 历史 | 自有 SQLite | 审计 / 防重复发 |
| Outcome 记录 | 自有 SQLite | 30/90/365 天回访 |

### 系统提示词
- 反鸡汤宪法: `lib/decision/anti-chicken-soup.ts`
- 6 个领域框架 prompt: `lib/decision/frameworks/`
- Pulse 处理器 prompt: `lib/pulse/tagger.ts`
- Sunday Review prompt: `lib/sunday-review/generator.ts`

这些是 **我们自己写的产品文档**, 不属于训练数据, 但属于 "知识库 / 系统提示".

## 用户数据不进入训练的保障

1. **API 层关闭训练授权**:
   - DeepSeek: 通过控制台设置 "数据不参与模型训练"
   - Claude: 通过 organization policy 关闭 (调用 V0 期间)

2. **不分享用户数据给第三方**:
   - 除 LLM API 必要的请求/响应外, 不向任何第三方推送数据
   - 不投放 SDK (无 GA, 无埋点 SDK)

3. **用户数据可导出 + 删除**:
   - GET /api/account/data → 完整 JSON 导出
   - DELETE /api/account/data → 硬删除 (24 小时内全表 purge)

## 知识库内容

Life OS 没有外部知识库 (RAG). 系统所有"知识"都来自:
- 系统提示词 (上述 prompt 文件)
- 模型本身的预训练参数 (由 DeepSeek 提供)
- 用户自己的 brain.md (隔离, 不跨用户)

## 数据流图 (Mermaid)

```
用户输入 → Next.js API → lib/safety/ 输入检查
                              ↓ (没命中)
                          构造 prompt (含 anti-chicken-soup + framework + user brain)
                              ↓
                          DeepSeek API (训练授权: 关闭)
                              ↓
                          响应 → lib/safety/ 输出检查
                              ↓
                          自有 SQLite (用户数据库)
                              ↓
                          返回用户
```
