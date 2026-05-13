# Brief 01 · KEY Wordmark · V1 → V2 Feedback

**Date**: 2026-05-13
**Reviewer**: Claude (technical lead) via founder
**Verdict**: V1 quality strong. Direction confirmed. 4 specific changes for V2.

---

## 我的整体评价 (overall)

3 个方向都立得住, 不是同一个 font 改 3 次. README 把 Authority/Quietude/Engraved 的语境差异讲清楚了 (trade quarterly / novella imprint / fine-art catalogue). 这是 designer-grade 工作.

WCAG 论证清晰, license 表注明全部 SIL OFL 免费商用 — 这件事 designer 主动说而不用我问, 值得 credit.

下面按你 README 末尾 5 个问题逐一答.

---

## 1. 方向选择 — **A · Authority**

confirmed.

理由跟你 README 一致: KEY 的读者在做最重的决定, A 扛得住. B 留给 KEY Letter (Brief 15) 是对的. C 留给 Founder Edition 海报封面 (Brief 04 后续 / 公开 marketing 海报 / 创始号印刷品).

**所以 V2 我要的是**: A 作为 canonical master, 出完整变体集. C 留作 "cover voice" 备用资产 (poster lockup 1 个 SVG, 不需要全套).

## 2. Tracking — confirm +0.16em, **but verify at 16px nav size**

+0.16em 在大尺寸 (specimen 224pt) 看起来对. 但代码顶 nav 的 KEY 高度大约 20-24px (text-xl tracking-tightish), 这个尺度下 +0.16em 可能**偏紧** — em 单位 scales 比例失真.

**V2 task**:
- 给 A 出 2 个 size-specific lockup (会出现在 README 里):
  - `key-wordmark-A-display.svg`: 大尺寸用 (海报 / hero), tracking +0.16em
  - `key-wordmark-A-nav.svg`: 小尺寸用 (顶 nav / favicon ~16-32px), tracking +0.18em ~ +0.20em
- 在 V2 README 里说明: 切换阈值大约 48px height, 超过用 display, 以下用 nav

或者: 全部用一个 tracking, 但 V2 给个明确的"什么尺寸适合什么 size variant"指引.

## 3. Mark — **keep**, but 重新定位

A 的 burgundy hairline bar 概念**对** (redaction stroke = "key 被划过, 找到了" — 这个隐喻跟产品哲学完美咬合).

但 V1 的位置 (x=850 / cap-line) 在 with-mark.svg 里**远离 KEY 文字** — 看起来像独立的横线, 不像"跟 KEY 关联的标记".

**V2 调整**:
- Mark 平移到 KEY 文字右侧 ~24px 内 (即 x ≈ 690-720), 跟 Y 的右边缘有视觉关系
- 高度仍在 cap-line (y=100), 不变
- 长度可减少到 ~48px (V1 是 68px = 850→918), 让 mark 显得是"印章式"而不是"装饰横线"
- on-dark 版本 mark 颜色保持 burgundy #6E1F2A — 在 #141923 上对比度 1.8 是 fail for text, 但 mark 不是 text, 这是 stamp 用法, 你 Brief 02 也说了 stamp 失败是 intentional. 不动.

## 4. Y 自定义分叉 — **YES, 做**

V2 给 A 一个 outlined Y, 左 arm 6-8% fork. 不是 logo gimmick, 是给品牌一点点指纹.

但**不要做得太明显**. 设计目标: 让 5 分钟看不出来, 15 分钟才注意到的细节. 如果用户第一眼看见 fork, 就过了.

## 5. Sizing-bias — 2 个调整

a. **Nav lockup** (height 24px): 上面 #2 已经讲, 出独立的 nav-size SVG
b. **Favicon (16-32px)**: README 提到 V2 会出 favicon 套件 — 这里**不要用 KEY 三字母**, 用 `key-mark-only.svg` (你 README 里提到的). 16px 高的 K-E-Y 三字母会糊掉, 单独 mark 更清晰.

---

## ⚠️ V2 P0 阻塞项 (不能拖到 V3)

### SVG webfont 依赖问题

V1 的 SVG 文件:
```svg
<text x="512" y="186" text-anchor="middle" class="km" fill="#111111">KEY</text>
```

- 没有 `font-family` 声明
- 类 `.km` 在 standalone SVG 里**没有 CSS 定义**
- 我在 `_shared/editorial.css` 和 `01-key-wordmark/index.html` 都没找到 `.km` 的定义 (只在 index.html 找到 `.wm-A` / `.wm-B` / `.wm-C`)

**结果**: 当我把这个 SVG 集成进 KEY 代码 (e.g. 顶 nav 用 `<Image src="/key-wordmark.svg" />` 或 inline `<KeyWordmark />` 组件), **它会 fallback 到浏览器默认 serif (Times New Roman)** — 因为没有外部 CSS 加载 .km 定义.

**V2 必须做** (至少做一项):

**选项 A (我推荐)**: 把 SVG 转 outline (paths). 这是 production-grade 做法, 不依赖 webfont, render 100% 一致.

**选项 B**: 在每个 SVG 内嵌一个 `<style>` block:
```svg
<defs>
  <style>
    .km {
      font-family: 'Source Serif 4', Georgia, serif;
      font-weight: 700;
      letter-spacing: 0.16em;
      font-feature-settings: "kern";
    }
  </style>
</defs>
```
然后 SVG 加载 Source Serif 4 webfont (通过 `@import` 或 `@font-face`). 但 webfont 异步加载, 首次渲染会闪一下默认字体, 不优雅.

**选项 C** (最差, 不要): 在每个使用方 (我的 React 组件 / 海报 / 邮件) 各自定义 .km. 三处不一致是迟早的事.

**强烈选 A**. V2 出 outlined paths + 删除 `class="km"`.

### CSS class 命名不一致

- SVG 用 `class="km"`
- HTML presentation page 用 `class="wm-A"` / `.wm-B` / `.wm-C`

两套命名指向同一件事 (wordmark text). 统一为 `class="wordmark"` 或 `class="wm"`, 整套语言一致.

---

## V2 期望交付

按你 README 已经承诺的 + 我上面新加的:

```
01-key-wordmark/v2/
  ├── key-wordmark.svg                       Canonical A · outlined · display size
  ├── key-wordmark-nav.svg                   A · outlined · nav size (tracking +0.18-0.20em)
  ├── key-wordmark-with-mark.svg             A + 调整后的 mark 位置
  ├── key-wordmark-on-dark.svg               A · on navy
  ├── key-wordmark-monochrome.svg            A · ink only
  ├── key-mark-only.svg                      Mark 独立 (用于 favicon / 小尺寸)
  ├── key-favicon-16.png
  ├── key-favicon-32.png
  ├── key-favicon-180.png
  ├── key-og-image.png                       1200×630
  ├── key-wordmark-C-poster.svg              C 备用 (poster 大尺寸专用)
  └── README.md                              更新 (说明 size variants)
```

---

## 不要动 (V1 已经对的, 别改坏)

- 备选差异化思路: A · Authority / B · Quietude / C · Engraved 的语境定位
- 选 A 作为 working master 的判断 + B/C 用途分配
- License 全部 SIL OFL 的选择
- viewBox 1024×256 (4:1) 比例
- 整体克制的方向 — 没有给 KEY 加图标 / 加底色 / 加 effect

---

## 时间预期

V2 我希望在: **本周末前**. 不阻塞我代码侧的 KEY 品牌替换 — 我可以先用纯文字 `<span className="font-serif font-bold tracking-[0.16em]">KEY</span>` 占位, V2 outlined SVG 到了再 swap.

---

*— Claude (technical lead), via founder*
