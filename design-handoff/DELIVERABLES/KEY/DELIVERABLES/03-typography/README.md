# Brief 03 · Typography · Deliverable V1

**Date**: 2026-05-13
**Status**: V1 · for review
**Iteration**: 1 of 1–2 expected

---

## Judgment on the current Lora + Noto Serif stack

It works. It does not earn its keep at large sizes.

Lora was drawn for screen body comfort — its letterforms round. At 17 px / 1.75 leading it is excellent. At 56 px (a brief cover) or 96 px (a poster headline) it loses bone. The reader registers pleasantness, not weight. KEY needs weight.

Inter is correct for labels and small caps, which is the only role it has in this brief. The Chinese stack — Noto Serif SC + Noto Sans SC — is the right default; nothing in the paid Chinese market improves on it at this price. **I would not change the CJK choices.**

My recommendation is to swap **Lora → Source Serif 4** and keep everything else. Same delivery channel (Google Fonts), same license, no cost. The system gains an editorial display register without losing body comfort.

---

## Three pairing plans

| | A · all Google Fonts (**my pick**) | B · mixed commercial | C · wildcard literary |
|---|---|---|---|
| **Cost** | $0 / yr | ~$1,000 / yr | $0 / yr |
| **Serif EN display** | Source Serif 4 | GT Sectra | Newsreader |
| **Serif EN body** | Source Serif 4 | Source Serif 4 | Source Serif 4 |
| **Serif CN** | Noto Serif SC | Noto Serif SC | Noto Serif SC |
| **Sans EN** | Inter | Söhne | Inter |
| **Sans CN** | Noto Sans SC | Noto Sans SC | Noto Sans SC |
| **Mono** | JetBrains Mono | JetBrains / GT Sectra Mono | JetBrains Mono |
| **Reads as** | Substack + The Drift | Air Mail + Aperture | MUBI Notebook + Penguin Modern Classics |
| **Verdict** | **Adopt for V1** | Hold for V2 site relaunch | Only if Wordmark B is selected |

Long-form details in `font-pairing-recommendations.md`.

### My final recommendation: **Plan A**

- Removes the only weakness in the current stack (Lora's softness at display).
- Costs nothing.
- Loads from the same CDN.
- Non-breaking for the codebase: any element using `font-serif` picks up Source Serif 4 once the stack swaps.

---

## Scale at a glance

### English

| Token | Size / Leading | Tracking | Weight | Role |
|---|---|---|---|---|
| `display-1` | 96 / 100 | −0.02em | 600 | Poster |
| `display-2` | 72 / 78 | −0.015em | 600 | Cover |
| `hero` | 56 / 62 | −0.01em | 500 | Landing hero |
| `h1` | 40 / 47 | −0.005em | 500 | Page title |
| `h2` | 28 / 36 | 0 | 500 | Section |
| `h3` | 22 / 30 | 0 | 500 | Subsection |
| `quote` | 24 / 36 | italic | 400 | Blockquote |
| `body` | 17 / 30 | 0 | 400 | Reading |
| `body-small` | 15 / 26 | 0 | 400 | Footnote |
| `caption` | 13 / 21 | 0 | 400 | Figures, captions |
| `label` | 10.5 / 15 | +0.32em uppercase | Inter 500 | Eyebrow, masthead |
| `mono` | 14 / 22 | +0.02em | JetBrains 400 | IDs, code |

### Chinese — slightly tighter steps, looser leading

| Token | Size / Leading | Weight | Role |
|---|---|---|---|
| `cn-display` | 64 / 74 | 500 | Poster |
| `cn-hero` | 44 / 54 | 500 | Landing hero |
| `cn-h1` | 32 / 42 | 500 | Page title |
| `cn-h2` | 24 / 35 | 500 | Section |
| `cn-h3` | 20 / 31 | 500 | Subsection |
| `cn-quote` | 22 / 36 | 400 | Blockquote |
| `cn-body` | 17 / 32 | 400 | Reading (CN leading = 1.88) |
| `cn-small` | 15 / 27 | 400 | Footnote |
| `cn-caption` | 13 / 22 | 400 | Caption |
| `cn-label` | 11 | Noto Sans SC, +0.28em | — |

---

## Nine non-negotiables (micro-rules)

1. **Drop cap** — manifesto and brief § I opening only. Never on body. 2 lines deep, 70% leading.
2. **Blockquote** — always italic. 2 pt burgundy left rule, 16 px padding.
3. **Lists** — roman numerals, italic, burgundy. Never bullet dots.
4. **Punctuation** — smart quotes, em-dash, ellipsis (never `"`, `--`, `...`). Chinese is full-width.
5. **Numerals** — old-style in prose, tabular in tables and IDs.
6. **Caps tracking** — uppercase Latin gets +0.28em to +0.36em, line-height 1.4, sans only.
7. **CN + EN mixing** — half-width space between CJK and Latin. Never italicize Chinese.
8. **Measure** — EN 60–75 ch, CN 28–42 characters per line.
9. **Paragraph spacing** — EN 1.4–1.6× lh, CN 1.6–1.8× lh. Never first-line indent on the web.

---

## Known trade-offs

1. Source Serif is widely used on the web — it can read as "tasteful default". Mitigated by the wordmark (Brief 01) and the wide tracking on labels.
2. Chinese leading at 1.88 looks generous on long-form pages and risks looking sparse on cards. Likely to tune card CN to ~1.75 in V2.
3. Inter is technically a "tech-company sans". Used only for small labels here, so the cost is acceptable. Swap to Söhne if it ever bothers anyone (Plan B).

---

## File list

```
index.html                          Long-form spec, specimen + scale + rules
typography-css-tokens.css           Drop-in CSS variables for the codebase
font-pairing-recommendations.md     Long-form rationale for the three plans
README.md                           This file
```

Printable PDFs of the specimen and spec sheets are **deferred to V2**, once the plan is selected.

---

## V1 → V2 — feedback I expect

1. Plan selection — A, B, or C.
2. Token adjustments — any single step can move ±2 px in size or ±0.05 in leading without disturbing the scale.
3. Whether to add `body-large` (19 px) for KEY Letter long-form.
4. Whether to commit to print-grade Source Serif weights for the printable assets, or stay regular/bold only.

---

*— Design, via the Founder*
