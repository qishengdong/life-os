# 02 — 大模型清单

> 备案表"使用的算法 / 模型"项对应内容. 我们 **不自训模型**, 只调用第三方
> 已备案的大模型 API.

## 主调用模型

### DeepSeek
- 厂商: 杭州深度求索人工智能基础技术研究有限公司
- 已完成生成式人工智能服务备案 (国家网信办 2024 年首批名单)
- 调用模型: deepseek-chat, deepseek-reasoner
- 用途: Pulse 标签 + 回应 / 决策深度分析 / Sunday Review 生成 / Brain 整合
- 调用比例: ~95%

## 备选模型 (跨地域用户兜底)

### Anthropic Claude (claude-3-5-sonnet, claude-sonnet-4)
- 厂商: Anthropic (美国)
- 用途: V0 调试 / 大陆 DeepSeek 故障时兜底
- 调用比例: ~3%
- 注: 境内公开服务时关闭此通道

### OpenAI GPT (gpt-4o)
- 厂商: OpenAI (美国)
- 用途: 同上
- 调用比例: ~2%
- 注: 境内公开服务时关闭此通道

## 训练状态
- 我们 **不进行模型预训练或微调**
- 我们 **不向调用方上报用户数据用于训练**
- DeepSeek API 调用时关闭了 "用于改进模型" 选项 (具体配置见 `lib/model-router/`)

## 调用模式
- 接口协议: OpenAI 兼容 SDK
- 调用方式: HTTPS + Bearer Token
- 请求 / 响应日志: 仅保存到自有数据库 (用户数据), 不外传

## 模型版本管理
- 每次升级 (e.g. deepseek-chat-v2 → v3) 在 release notes 标注
- 重大行为变化 (e.g. 切到新模型) 在用户协议中告知
- 模型 ID 写入 `decisions.model_used` 字段, 用户可在历史中看见

## 模型局限性公示 (用户协议中明示)
- 模型可能出错或产生不准确信息
- 模型输出不构成专业建议
- 模型对未知事件 (knowledge cutoff 之后) 无法回答
- 模型可能产生幻觉, 用户应交叉验证关键事实
