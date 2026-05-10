# Life OS

反鸡汤的人生决策伙伴 — 关系型 Agent 范式。

## 设计宪法

- **绝不鸡汤**：不输出励志、抽象哲理、廉价共情
- **绝不主角化**：AI 不是创始人 IP 的延伸，是产品本身
- **绝不假装有答案**：把决策结构展示出来，让用户想透
- **结果驱动**：每次重大决策必须给出可执行步骤 + 量化代价 + 反向 PreMortem

详见 `lib/decision/anti-chicken-soup.ts`。

## V0 技术栈

- **前端**：Next.js 15 + Tailwind CSS
- **数据库**：SQLite（本地零依赖）
- **LLM**：DeepSeek（主）/ Claude（备）/ OpenAI（备）通过 ModelRouter 抽象
- **运行**：本地优先，零云依赖

## 启动

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 目录结构

```
life-os/
  app/                    Next.js 路由
    page.tsx             首页（决策输入）
    layout.tsx           根布局
    globals.css          全局样式
    api/decision/        决策分析 API
  lib/
    db/                  SQLite 数据层
    model-router/        LLM 抽象层（DeepSeek/Claude/GPT 可切换）
    decision/            决策框架库
      anti-chicken-soup.ts    反鸡汤宪法
      general-framework.ts    通用决策模板
  data/                   SQLite 数据文件（gitignored）
  .env.local              密钥（gitignored）
```

## 模型切换

修改 `app/api/decision/route.ts` 中的 `provider` 字段：
- `'deepseek'`（默认）
- `'claude'`（需要 ANTHROPIC_API_KEY）
- `'openai'`（需要 OPENAI_API_KEY）
