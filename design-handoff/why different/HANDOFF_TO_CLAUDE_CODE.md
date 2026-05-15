# Handoff → Claude Code

**任务**: 把 `/why-different` 页面替换成新的 editorial 视觉版本
**目标文件**: `client/src/pages/SivonWhyDifferent.tsx` (当前 683 行,整体替换)
**URL**: https://sivon.me/why-different

---

## 一、交付物 (在这个 zip 里)

| 文件 | 用途 |
|---|---|
| `SivonWhyDifferent.tsx` | **直接替换原文件**, 一个完整的 React 组件 |
| `why-different.html` | 视觉验收稿 / 离线预览, 不进 codebase |
| `HANDOFF_TO_CLAUDE_CODE.md` | 这份文档 |

---

## 二、Claude Code 你要做的事 (按顺序)

### Step 1. 替换文件
```bash
cp SivonWhyDifferent.tsx /home/ubuntu/sivon-app/imeal-v2/client/src/pages/SivonWhyDifferent.tsx
```

新文件是 `export default function SivonWhyDifferent()`, 跟原文件签名一致, 路由不用改。

### Step 2. 确认依赖
新文件只用了:
- `react` (useEffect, useRef, useState)
- 内联 `<style dangerouslySetInnerHTML>` 注入 CSS, **不依赖 Tailwind**
- Google Fonts 通过 runtime `<link>` 注入 (EB Garamond + Noto Serif SC + Plus Jakarta Sans + JetBrains Mono)

如果项目有 CSP 限制不让加 fonts.googleapis.com, 改用自托管字体 — 把 `useEffect` 里那段 link 注入删了, 在 `index.html` 里加自己的字体即可。

### Step 3. 文案替换 (重要)
我写的是**贴合 Sivon 嗓音的占位中文**, 不是 Xiaoshi 最终敲定的句子。请把以下两块换回原 messaging:

- `HOOKS` 数组 (5 条) — 应来自 `specs/messaging_hooks_v0.md`
- `SCENES` 数组 (7 条) — 应来自原 SivonWhyDifferent.tsx 里 7 个场景的真句

代码里所有需要换文案的位置都标了 `// [COPY: ...]` 注释。

### Step 4. Hero 图 (已配图,但临时方案)
`<HeroFigure/>` 现在直接 hot-link 了 Unsplash 一张语境贴合的编辑式照片
(`images.unsplash.com/photo-1495474472287-4d71bcdd2085`), 并叠了一层暖色 veil + 轻度去饱和让它和 Sivon Folio 调色板融合。

**Ship 前两个选项**:
1. **临时方案 (快)**: 保留 Unsplash hot-link, 但下载到自己 CDN 避免外链失效 + 满足国内访问。
2. **正式方案**: 接到 Xiaoshi 的 commission 摄影后, 把 `src` 换掉即可, 其他 markup 不动。

摄影方向参考: 一张光线很慢的室内 — 午后的厨房、放茶的手、窗边书页。**不要 stock 模特, 不要笑**, 语境是「她终于一个人 5 分钟」。

### Step 5. 内部链接
组件底部 colophon 里有 `/folio` 和 `/manifesto` 两个链接, 现在是普通 `<a>`。如果项目用的是 react-router, 换成 `<Link to=...>`:

```tsx
// 把:
<a href="/folio">/folio</a>
// 换成:
<Link to="/folio">/folio</Link>
```

CTA 按钮 `<a href="/">` 现在指向首页, 如果应该指向产品入口, 改 href。

### Step 6. 移动端验证
关键测试: **微信内置浏览器** 在 iPhone 上打开。这是真实用户路径。重点 check:
- Hero 大字不溢出 (用了 `clamp(40px, 6.4vw, 88px)`, 应没问题)
- Section D 的 144px 大字在 mobile 自动缩到 64px (`clamp(64px, 10vw, 144px)`)
- Timeline 14 个点不挤
- "我们读你" statement 用了 `flex` 排版, 字号 `clamp(72px, 14vw, 180px)`, 移动端约 50px

### Step 7. 字体回退
EB Garamond 没加载完前会 fallback 到系统衬线。中文部分总是用 Noto Serif SC → Source Han Serif SC → Songti SC, 这条链在国内浏览器都有保底。如果想要硬保证, 可以把 `font-display: swap` 加上。

---

## 三、改动概览 (跟原文件对比)

| 维度 | 原 | 新 |
|---|---|---|
| 行数 | 683 | ~520 (含 CSS) |
| 样式 | inline style | 单一 `<style>` 块 + CSS custom properties |
| 字体 | 系统 fallback | EB Garamond + Noto Serif SC (Google Fonts) |
| Hero | Unsplash 随机图 | 一张精选的编辑式 Unsplash (午后桌面 / 茶 / 无人脸), 叠暖色 veil + 轻去饱和融入 Folio 调色板 |
| Section A | h2 + 段落 | 大字 statement「我们读你」+ manifesto + drop cap |
| 5 hooks | 4 边对称卡片 | 左右交错编号 (像杂志语录, 数字 01-05 玫瑰金衬线大字) |
| 7 场景 | 垂直 list + 手画 SVG icon | 时序排版 06:40 → 23:41, 三栏 (时间 / 主文 / echo) |
| Section D | 静态时间线 | 滚动到视野时点亮 14 个点的动效, 最后一点金色大圆 |
| Outcome box | 矩形边框 | 玫瑰金边线 + 四角装饰证书式 block |
| CTA | 普通 button | 黑底 hover 变鼠尾草绿 + 字距撑开 + 箭头位移 |
| 移动端 | 通用响应式 | 每 section 单独 tune `@media (max-width: 720px)` |

---

## 四、Sivon Folio Theme tokens (在组件里的 CSS variables)

```css
--ivory:      #FAF7F2  /* 背景 */
--ivory-deep: #F4EFE6  /* Section D 渐变底 */
--sage:       #7B9B7C  /* 主色 */
--sage-deep:  #5F7C61  /* 主色加深, 标题用 */
--gold:       #C9A977  /* 强调/badge/边线 */
--gold-deep:  #A88A5C  /* gold 加深, kicker 用 */
--cream:      #EAE3D5  /* 淡分割线 */
--ink:        #2a2a2a  /* 正文 */
```

如果项目已有全局 theme 变量定义, 可以删掉组件里的, 让组件读全局。

---

## 五、需要 Xiaoshi 拍板的 (Claude Code 不要替她决定)

1. **字体授权**: 现在用 Google Fonts EB Garamond + Noto Serif SC, 免费可商用。如果她要换成思源宋体 web 版, 我已经预留好了 `--serif` token。
2. **摄影来源**: Unsplash / 真拍 / commission, 决定后填进 `<HeroFigure/>`。
3. **品牌字 logo**: 现在 masthead 显示的是「Sivon·me」(衬线斜体 + 鼠尾草绿点), 如果她有真 logo, 替换 `.swd-masthead .logo` 内容。
4. **内部链接**: 底部 colophon 里 `/folio` `/manifesto` 现在指向假地址, 看是否启用。

---

## 六、Pre-ship 检查清单

- [ ] HOOKS 文案换成原 messaging
- [ ] SCENES 文案换成原 7 场景真句
- [ ] Hero 图: 下载 Unsplash 到自家 CDN, 或换成 commission 摄影
- [ ] 内部 `<a>` 改 `<Link>` (如适用)
- [ ] CTA href 指向正确入口
- [ ] iPhone 微信内置浏览器实测
- [ ] Lighthouse Performance / Accessibility 跑一次
- [ ] CSP 允许 fonts.googleapis.com (或换自托管)

---

如果有问题随时叫我。

— Claude Design
