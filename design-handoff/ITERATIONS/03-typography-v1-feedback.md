# Brief 03 · Typography · V1 → V2 Feedback

**Date**: 2026-05-13
**Reviewer**: Claude (technical lead) via founder
**Verdict**: Plan A 通过. typography-css-tokens.css 可以 drop-in. 1 个反对 + 1 个新增. 整体 V2 即定稿.

---

## 整体评价

对 Lora 的诊断 ("works but doesn't earn its keep at large sizes") 是**对的**. 这是 V0 阶段为了凑 free fonts 妥协的选择, V1 重新评估很必要.

Plan A (Lora → Source Serif 4) 是**正解**:
- 同 CDN, 同免费 license
- variable axes (opsz, wght) 提供更多控制
- variable opsz 让大字号自然变粗 / 小字号自然变细 — Lora 没这能力
- 不需要付费 ($0 vs $1000/yr)
- 代码 swap 是一行: `'Lora'` → `'Source Serif 4'`

下面按你 README 末尾 4 个问题逐一答.

---

## 1. Plan 选择 — **Plan A**

confirmed. 全部走 Source Serif 4 + Inter + Noto Serif SC + Noto Sans SC + JetBrains Mono.

**Plan B (Söhne + GT Sectra) 留作 V2 网站 relaunch 时再评估**. 现在不付 $1000/yr.

**Plan C (Newsreader 显示字) 跟 Wordmark B 绑** — 既然我已经在 Brief 01 选 A (而不是 B), C 自动作废. README 已经明确这点.

## 2. Token 调整 — **1 个反对**

### `--t-body-lh: 1.78` ← 我要求改回 1.75

CSS 注释:
```
--t-body-lh: 1.78;  /* note: brief asked 1.75; we set 1.78 to settle */
```

"we set 1.78 to settle" 不是真理由. 我 push 回 1.75:

- Brand Brief v1 + Master Directive 都指定了 1.75
- Source Serif 4 在 17px 下 1.75 已经是 publication standard
- 1.78 在 paragraph 间叠加会显得"飘", 跟"沉静严肃"调性轻微冲突
- 多 0.03 lh 在 long-form 阅读不会有可感差异

**除非你有具体测试数据**支持 1.78 比 1.75 在 Source Serif 4 / 17px 下显著更舒服, 否则**改回 1.75**.

(如果有数据, 也欢迎 V2 README 写一段解释 — 我接受被你说服.)

### `--t-cn-body-lh: 1.88` — 保留

中文 body 1.88 是对的. CN 比 EN 需要更宽 leading, 这跟 Brand Brief 一致.

### 其他 token — **全部保留**

display-1 / display-2 / hero / h1-3 / quote / body-small / caption / label / mono — 数值我都同意.

## 3. 加 `body-large` (19px) — **YES, 加**

KEY Letter (Brief 15) 是月度长信, 比 KEY Brief 更"私人信件感", 17px 略紧. 19px 给一档舒缓.

V2 加:
```css
--t-body-large-size:   19px;
--t-body-large-lh:     1.80;
--t-body-large-track:  0;

--t-cn-body-large-size: 19px;
--t-cn-body-large-lh:   1.92;
```

`.t-body-large` 跟 `.t-cn-body-large` utility 一起加上.

## 4. Print-grade weights — **YES, 加全**

V2 typography-css-tokens.css 的 `@import` URL 把 Source Serif 4 全 weight 都拉:

当前 V1:
```
&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900
```

已经是 200-900 全 weight + ital + opsz variable axes. **不用改, 你已经写全了**.

(我看错了, README 问 "stay regular/bold only" — 你的 CSS 已经是 full range. 答案: 保持你写的, 不收缩.)

---

## ⚠️ V2 P0 — 1 件不在 README 问题里但我需要加的

### Tailwind 集成 mapping

你的 CSS tokens 是 `--t-body-size: 17px` 命名. 我的代码现在用 Tailwind, 命名是 `text-reading` / `text-editorial` / 等.

**V2 task** (designer 不需要做, 我做): 我在 `tailwind.config.js` 写一个映射:

```javascript
fontSize: {
  'editorial-xl': ['var(--t-display-1-size)', { lineHeight: 'var(--t-display-1-lh)', letterSpacing: 'var(--t-display-1-track)' }],
  'editorial-lg': ['var(--t-display-2-size)', { lineHeight: 'var(--t-display-2-lh)' }],
  'editorial':    ['var(--t-h2-size)',        { lineHeight: 'var(--t-h2-lh)' }],
  'reading':      ['var(--t-body-size)',      { lineHeight: 'var(--t-body-lh)' }],
  'reading-large': ['var(--t-body-large-size)', { lineHeight: 'var(--t-body-large-lh)' }],
  ...
}
```

这样 designer 改 CSS variable, Tailwind 自动跟. **我做这件事**, designer 不用管.

但 designer 这边需要确认: CSS variable 命名最终锁定, V2 后不再变. (V1 是 `--t-{role}-{property}`, 我同意保持.)

---

## ⚠️ 字体加载性能小优化 (V2 可选, 不阻塞)

当前 `@import url(...)` 拉的是 Google Fonts CSS, 里面定义了 26 个 woff2 (Source Serif 4 各 weight × ital × opsz). 完整下载是 ~600KB.

V2 可以考虑加 `display=swap` (已经有了) + `subset` 限定到 latin + latin-ext (默认就够) + 把 CN 单独懒加载 (CN font 单字符极大, ~10MB)

但这是 V2.5 优化, 不阻塞.

---

## 9 条 micro-rules — **全部认**

1. Drop cap 限 manifesto + brief §I — ✓
2. Blockquote italic + 2pt burgundy left rule — ✓ (代码已实现)
3. Lists 罗马数字 italic burgundy — ✓
4. Punctuation 全角中文 / em-dash 英文 — ✓
5. Numerals old-style in prose, tabular in tables — ✓ (你提供了 `.num-onum` / `.num-tnum` utility, 完美)
6. Caps tracking +0.28-0.36em — ✓
7. CN/EN 半角空格混排 — ✓
8. Measure EN 60-75ch / CN 28-42 字 — ✓
9. Paragraph spacing EN 1.4-1.6× lh / CN 1.6-1.8× lh — ✓

---

## V2 期望交付

```
03-typography/v2/
  ├── typography-css-tokens.css        改 body lh 1.78 → 1.75 + 加 body-large
  ├── font-pairing-recommendations.md  小改: 标记 Plan A "adopted V1→V2"
  ├── typography-spec.pdf              (V1 deferred, V2 出)
  ├── typography-samples.pdf           (V1 deferred, V2 出)
  └── README.md                        更新
```

---

## 不要动 (V1 已对的)

- Plan A (Lora → Source Serif 4) 的判断
- 完整 EN + CN scale 设计
- 9 条 micro-rules
- variable axes (opsz, wght) 用法
- CN measure 用 em 单位 (`--measure-cn: 32em`) — 这是中文排版最准的做法
- `num-onum` / `num-tnum` / `num-pnum` utility class
- 字体 stack fallback chain 顺序

---

## 时间预期

V2 typography 改动微小 (body lh 0.03 改 + 加 body-large), 应该 1-2 小时内出. 不阻塞任何东西.

---

*— Claude (technical lead), via founder*
