# Brief 03 · Typography Spec Sheet

**Priority**: P0
**Week**: 1
**Estimated time**: 3-4 hours
**Iterations expected**: 1-2 rounds

---

## 用途

为整个 KEY 视觉系统建立一套**严肃出版物级的字体规范** — 网站 / 邮件 / PDF / 印刷品都按这个走. 任何后续合作方拿到 spec sheet 就能复制视觉感, 不需要追问.

---

## 当前状态 (代码已实现)

代码层我已经在用:
- 中文 serif: 思源宋体 Source Han Serif SC (Google Fonts: `Noto_Serif_SC`)
- 英文 serif: **Lora** (Google Fonts)
- 中文 sans: 思源黑体 Source Han Sans SC
- 英文 sans: **Inter** (Google Fonts)

字号阶梯 (Tailwind tokens):
```
editorial-xl  3.5rem    封面主标题
editorial-lg  2.5rem    section 主标题
editorial     1.875rem  section 子标题
reading       1.0625rem 主阅读体 (line-height 1.75)
```

---

## 你的任务

### 任务 A: 验证 / 推荐字体组合

**KEY Brand Brief v1 第 12 节**指定:
- 英文: Editorial serif headline + Clean sans body + 小标题可用等宽字体
- 中文: 思源宋体 / 霞鹜文楷类仅作少量点缀, 正文要清晰不要过度文艺

你的工作:

**1. 验证当前组合**: Lora + Source Han Serif SC + Inter + Source Han Sans SC 是否真的对得起 "Editorial Intelligence" 定位?

可能问题:
- Lora 是不是太 "round" 了? 它本来是为可读性优化的, 不如 GT Sectra / Tiempos 有出版物的"重量感"
- 思源宋体 SC 在中文长 form 阅读下是否真的清晰? 还是某个版本 (e.g. Source Han Serif HK) 更好?
- Inter 是不是太"科技感"了? 跟 Editorial 调性是否冲突?

**2. 给出 3 个字体组合方案**:

```
方案 A: 保守版 (全部 Google Fonts 免费 / 商用 OK)
  英文 serif: Lora                  / Newsreader / Source Serif
  英文 sans:  Inter                 / IBM Plex Sans
  中文 serif: 思源宋体 SC
  中文 sans:  思源黑体 SC

方案 B: 中度升级 (部分付费, 但商用授权友好)
  英文 serif: GT Sectra / Tiempos    (付费 ~$300-500/yr commercial)
  英文 sans:  Söhne                  (付费)
  中文同 A

方案 C: 你的 wildcard 推荐
  (你认为最对的, 给理由)
```

每个方案附:
- 字体名称 + Google Fonts URL (如果免费) / 付费链接
- 字距 / 行距推荐
- 这个方案"像什么" (e.g. 方案 A 像 Substack, 方案 B 像 Air Mail, 方案 C 像 ...)
- Trade-off (e.g. B 方案 vibe 更对但每年 $500)

### 任务 B: 完整字号 / 字距 / 行距 spec

参考代码当前 token, 但你可以扩展. 我需要的层级:

**英文**:
```
display-1     largest (海报用)         e.g. 96-128pt / line 1.05 / tracking -0.02em
display-2                              e.g. 72pt   / 1.1 / -0.015em
hero          网站 hero                e.g. 56pt   / 1.1 / -0.01em
heading-1     /methodology 主标题       e.g. 40pt   / 1.2 / -0.005em
heading-2     section header           e.g. 28pt   / 1.3 / 0
heading-3     subsection               e.g. 22pt   / 1.35 / 0
quote         引文 italic              e.g. 24pt   / 1.5 / 0
body          阅读体                   e.g. 17pt   / 1.75 / 0
body-small    次要阅读                 e.g. 15pt   / 1.7
caption       图注 / footnote          e.g. 13pt   / 1.6
label         小标签 uppercase         e.g. 10pt   / 1.4 / +0.3em
mono          数字 / 代码 / brief number  e.g. 14pt monospace
```

**中文** (跟英文不严格 1:1 对应, 因为中文字距和密度不同):
```
display       海报主标题                e.g. 56-72pt / line 1.15
hero          网站 hero                 e.g. 40-48pt / 1.2
heading-1                                e.g. 32pt   / 1.3
heading-2                                e.g. 24pt   / 1.4
heading-3                                e.g. 20pt   / 1.5
quote         引文                     e.g. 22pt   / 1.6
body          阅读体                    e.g. 17pt   / 1.85 (中文行高需更宽)
body-small                              e.g. 15pt   / 1.8
caption                                 e.g. 13pt   / 1.7
label                                   e.g. 10pt   / 1.5 / 字距 +0.25em
```

每个层级配一个 sample 句子 (英文 + 中文各一句), 让人能直接看到效果.

### 任务 C: Typography 应用规则 (micro-rules)

明确写:

```
1. 段落首字 (drop cap)
   - 用在: manifesto 第一段 / KEY Brief Section I 第一段
   - 不用在: 任何 body 段落 / hero
   - 字号: 2× 行高 / 70% leading

2. 引文 / blockquote
   - 永远 italic
   - 左侧 4pt 实线 burgundy border (4pt margin-left)
   - 字号: heading-3 (22pt) en / 22pt cn
   - 上下空 24-32px

3. 列表
   - 不用 bullet ( · )
   - 用罗马数字 (I / II / III / ...)
   - 编号 italic burgundy 色, 列表 body Ink Black

4. 标点
   - 中文: 全角
   - 英文: smart quotes ("") + em dash (—) + ellipsis (…)
   - 不用 hyphens 当 em dash (---)

5. 数字
   - 数据 / 价格 / 字数等: tabular figures (等宽数字)
   - 日期 / 年份: old-style figures (老式数字, 优雅)
   - Brief number (e.g. KB-20260512-417): monospace

6. 大写英文
   - 字距 tracking 至少 +0.2em
   - 行高紧凑 (line-height 1.3-1.4)
   - 仅用于: small labels / nav / footer / section eyebrow

7. 中英混排
   - 中英文之间加空格 (e.g. "我读了 KEY 的文档")
   - 不用斜体应用于中文 (中文 italic 不存在, 显示效果差)
   - 数字两侧 (e.g. "1988 / year") 用半角空格

8. 行宽
   - 中文: 28-42 字 / 行
   - 英文: 60-75 字符 / 行
   - 超出强制换行 (max-w-prose tokens)

9. 段落间距
   - 中文段落: 1.6-1.8 × 行高
   - 英文段落: 1.4-1.6 × 行高
   - 不用首行缩进 (web 阅读不需要)
```

---

## 交付清单

放到 `DELIVERABLES/03-typography/`:

```
typography-spec.pdf                完整字号 / 字距 / 行距规范 (8-12 页)
typography-samples.pdf             从 display 到 caption 全部字号的样例 (4-6 页)
font-pairing-recommendations.md    3 个组合方案 + 你的推荐
typography-css-tokens.css          配套 CSS 变量 (我可以直接 import)
README.md
```

---

## V1 README.md 必含

```markdown
# Brief 03 · Typography · V1

## 我对当前 Lora + 思源宋体的判断
[1-2 段]

## 3 个字体组合推荐
- 方案 A (Google Fonts only): [...]
- 方案 B (含付费): [...]
- 方案 C (我的 wildcard): [...]

## 我的最终推荐
[选哪个, 为什么]

## 关键 trade-off
- 方案 B 比 A 更对, 但年成本 $500
- 中文宋体几乎无变量, 用思源是默认正解
- ...

## 还没解决的问题
[e.g. Inter 跟思源黑体在 12px 标签场景下中英 visual weight 不匹配, 需要 V2 探索]
```

---

## 反馈预期 (V1 → V2)

**V1 → V2**:
- 我选定 1 个方案
- 可能要求 2-3 个 token 调整 (e.g. body 行高从 1.75 改 1.85)
- 可能新增 1-2 个层级 (e.g. body-large)

预计 V2 即为定稿.

---

## 一句话总结

**Typography 不是装饰, 是 KEY 品牌的承重墙**. 一份严肃 publication 跟一个 AI 创业公司 landing 的视觉差距, 70% 来自字体选择 + 字距 + 行高. 你的工作就是把这 70% 锁死.

— Claude (技术 lead), 通过创始人转达
