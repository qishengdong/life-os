# Brief 04 · Internal Demo Poster · Deliverable V1

**Date**: 2026-05-13
**Status**: V1 · for review
**Iteration**: 1 of 2–3 expected

---

## Image direction selected

**Direction A — Still life** (Founder's preference, my agreement).

A deep-toned, black-and-white desk fragment: pen, folded paper, half-lit lamp, tea cooling. The metaphor is *"someone has just left this room — they were writing something heavy."* It's the only one of the three directions that puts the reader, not a stand-in human, in the photograph. The image is shot on Tri-X with grain, vignetted, no recognisable city, no faces, no devices.

**This V1 ships with a placeholder, not a photograph.** I can't commission or fake a photograph at this craft level for a V1. The poster includes an honest placeholder — a deep-tonal panel with editorial chrome (corner registration marks, italic caption, "photograph to follow" label) that signals *exactly* what will sit there when sourced. The space the photograph will occupy is correctly proportioned (36% of poster height, within the brief's 35–40% range).

Direction B (person in silhouette) and Direction C (a single folded letter) are not pursued in this V1 — the brief allowed me to pick one and commit. I committed to A.

---

## Layout decisions

### Vertical rhythm

Working backwards from a 2008 px / 594 mm canvas with 25 mm margins all sides:

| Section | Height | Notes |
|---|---|---|
| Brand strip + wordmark | ~280 px | Editorial top-rule + 224 pt `KEY` |
| Tagline | ~140 px | EN italic above, CN below, 80 mm burgundy rule between |
| Image | 720 px (~36%) | Inside brief's 35–40% range |
| Manifesto | ~440 px | 3 paragraphs, 38 pt, 1.5 leading |
| Method (K-E-Y) | ~200 px | 3-row grid: letter / EN / CN |
| Footer + stamp | ~120 px | Burgundy hairline above, 130 px stamp right |

The section the brief calls *"the soul"* — the five-phrase manifesto line `父母养老。孩子出路。婚姻去留。职业转身。要不要迁移。` — sits in the middle third of the poster, alone on its line. The full-width periods are preserved character-for-character; the line is allowed to wrap naturally so the rhythm of the five phrases creates the cadence, not a hand-set break.

### Typography

- **Wordmark** — Source Serif 4 700 at 224 pt, tracking +0.16em (Wordmark Direction A from Brief 01). If A is not selected after Brief 01 review, this is a one-line swap in the CSS.
- **Tagline EN** — Source Serif 4 italic 34 pt.
- **Tagline CN** — Noto Serif SC 28 pt, letter-spacing +0.05em.
- **Manifesto CN** — Noto Serif SC 38 pt, 1.52 leading.
- **Manifesto EN** — Source Serif 4 36 pt, 1.32 leading (English needs tighter).
- **Method letters K E Y** — Source Serif 4 italic 36 pt, Deep Burgundy.
- **Method EN phrases** — Source Serif 4 22 pt 500.
- **Method CN explanations** — Noto Serif SC 19 pt, Ink 500.
- **Footer line 1** — Inter caps 11.5 pt, +0.32em.
- **Footer line 2** — Source Serif 4 italic 16 pt.
- **Footer line 3** — Noto Sans SC 12 pt, Warm Gray (CN version) / Inter caps 11 pt (EN version).

### Stamp

A 130 × 130 px circular stamp at lower-right, rotated −6°, drawn in Deep Burgundy. Two concentric circles (outer 1.5 pt, inner 0.5 pt), `KEY` italic at top, hairline rule, `001` mono-tabular at bottom. The CN poster's stamp uses an `feTurbulence` displacement filter to fake ink-bleed; the EN version omits the filter to keep the spread visually balanced (one stamped, one cleanly impressed — a print-shop variant pair).

### Colors

Strictly the 5 from Brief 02. The image panel uses a near-black radial gradient (`#1a1612 → #0c0907`) that sits just outside the Brand Brief's Night Navy because the placeholder represents *photograph*, not *brand-coloured field*. When the real photograph drops in, this gradient goes away entirely.

---

## CN vs EN — what's different

The brief asked for a 1:1 mirror, but a literal mirror reads wrong in English. Two adjustments:

1. **EN tagline subline** swapped from a CN translation to `"Decision counsel for the moments that matter."` — the EN brand's actual product-line, which feels native in English where a re-translated CN slogan would feel pasted-in.
2. **EN method CN-equivalent slot** uses Source Serif italic at 18 pt (instead of a Noto Serif Chinese line). Same structural placement, different role: where CN gives a full-length explanation, EN gives an italic clarification half-line.

Everything else — the manifesto cadence, the five-phrase line, the K-E-Y backronym, the stamp, the footer trio — is structurally identical.

---

## Known trade-offs

1. **Photograph is a placeholder.** When the real Tri-X still-life is commissioned, the gradient panel becomes an `<img>` and the typographic "№ I" centerpiece is removed. Layout is structured so this is a one-line replacement.
2. **Wordmark depends on Brief 01.** Currently set in Direction A (Source Serif 4 700 +0.16em). If a different direction is selected at the Brief 01 review, swap the CSS class `.p-wordmark__km` and the poster rebuilds.
3. **Print-ready PDF deferred to V2.** This V1 ships as an HTML design that renders pixel-correct at the digital preview size (1417 × 2008 px). V2 will deliver a press-ready PDF at 300 DPI (4961 × 7016 px) with proper bleed (3 mm) and crop marks.
4. **Source file (`.afpub` / `.indd`) deferred to V2.** Same logic — no point producing a layered source file from a layout that may move.
5. **Stamp ink-bleed.** The CN poster's stamp uses `feTurbulence` to simulate ink-bleed. It reads correctly on screen at design size; at 300 DPI press it will need re-rasterisation to a 1200 DPI raster image. V2 will deliver the stamp as a vector + a high-res raster.

---

## File list

```
index.html       The poster — CN / EN / bilingual spread, scaled to viewport
README.md        This file
```

Deferred to V2:
- `poster-A2-cn.pdf` — press-ready CN, 420 × 594 mm, 3 mm bleed, crops
- `poster-A2-en.pdf` — press-ready EN
- `poster-bilingual-spread.pdf` — 840 × 594 mm spread, 3 mm bleed
- `poster-digital-preview.png` — 1417 × 2008 PNG for email/messaging
- `poster-source.afpub` (or `.indd` / `.ai`) — layered source

---

## V1 → V2 — feedback I expect

1. **Image direction confirmation** — keep A (still life), or pivot to B / C.
2. **Photograph art-direction** — once a real still-life is commissioned, what props / lighting / framing.
3. **Manifesto micro-tuning** — line breaks in `我们把这些决定，整理成一份 / 像被写出来的 — 不是被生成出来的 / 私人决策简报。` — keep three-line break, collapse to two, or let it wrap naturally.
4. **Method K-E-Y wording** — the EN phrasing (`We remember who you are`) is mine; the brief's draft (`We remember what you said. Don't ask again.`) is sharper but longer.
5. **Stamp design** — keep the bleed filter (intentionally hand-pressed) or go clean.
6. **Wordmark direction** — locks in from Brief 01 review.

V2 will deliver:
- The single chosen direction, refined.
- Print-ready PDFs with proper bleed and crops.
- A source file for the Founder to hand to a printer.
- The first real photograph dropped in, if commissioned by then.

---

*— Design, via the Founder*
