# Brief 02 · Color Palette · Deliverable V1

**Date**: 2026-05-13
**Status**: V1 · for review
**Iteration**: 1 of 1–2 expected

---

## My judgments on the 5 core colors

The five values from the Brand Brief v1 §12 are **locked**. The `palette.json` ships them unchanged. The notes below are advisory — to be acted on, deferred, or ignored by the Founder + Claude.

### Ink Black `#111111` — **hold**

The 6% lift off pure `#000000` reads as ink-on-paper rather than screen-on-pixel. It pairs correctly with Paper. No adjustment recommended.

### Paper White `#F7F3EA` — **hold**

The warm cast (yellow + a touch of red, almost no blue) gives the surface a *printed* quality. On retina screens in daylight it reads as off-white book stock. The only context where it can feel slightly amber is OLED phones in dark rooms — and that's correct for KEY's tone.

### Warm Gray `#BDB6AA` — **hold, but mind the role**

At ~1.9:1 contrast on Paper, this is **not body type**. It's a hairline / border / decorative color. The brief already treats it that way. If we later need a true reading secondary, use Ink 500 (`#5A554F`) from the derived scale — not Warm Gray.

### Deep Burgundy `#6E1F2A` — **hold, but wet-proof for print**

Worth a printer's wet proof — the four-color build leans purple on coated stock. The Pantone match (1815 C) gives a slightly redder result and is the safer choice for any Founder Edition print. Reads correctly on screen.

### Night Navy `#141923` — **hold**

Slightly cool relative to Paper's warmth — intentional. The contrast is what reads as *document*, not *theme*. Keep it strictly for the surfaces the brief names (covers, admin); not the open web.

---

## Derived scale — my logic

- **Ink scale (900 → 200)**: rotates very slightly warmer as it lightens (toward OKLCH hue 75°), so secondaries don't turn cold. Used for type hierarchies and stamps where black-on-paper would feel too heavy.
- **Paper scale (100 → 500)**: 100 is the lift for cards and elevated surfaces; 200 is the canonical page background; 300–500 are sunken / borders / dividers. The scale ends before it reaches Warm Gray so the two stay legibly distinct.
- **Burgundy scale**: 700 is for hover / pressed states. 500 is the canonical accent. 400 is for stamps on Navy where 500 would disappear. `tintBg` (`#F5E8E9`) is the only color in the system allowed to function as a small field — emphasis blocks, follow-up reminders. Never a page background.
- **Navy scale**: kept tight. 700 is canonical; 500 is elevated dark surfaces; 900 is the deepest cover stock.

---

## WCAG summary

| Combination | Ratio | Rating | Role |
|---|---|---|---|
| Ink on Paper | 15.4 | AAA | Body |
| Ink 500 on Paper | 6.9 | AA | Secondary type |
| Ink 400 on Paper | 4.7 | AA · large only | Captions |
| Warm Gray on Paper | 1.9 | **FAIL** | Hairlines / decorative only — not type |
| Burgundy on Paper | 8.4 | AAA | Accents, numerals |
| Paper on Navy | 14.8 | AAA | Cover type |
| Warm Gray on Navy | 9.6 | AAA | Cover sub-type |
| Burgundy on Navy (text) | 1.8 | **FAIL** | Never use for text — stamp / seal only |
| Burgundy 400 on Navy (stamp) | 2.9 | **FAIL for text** | OK for non-text seal |
| Paper on Burgundy | 8.4 | AAA | Cover stock fields |

The Burgundy-on-Navy fail is *intentional and correct* for seal usage — a wax stamp is read as an image, not as type. Any text on Navy uses Paper or Warm Gray.

---

## Usage discipline (one line each)

- **Ink Black** — type, wordmark, hairline rules at large breaks. Not for large fills.
- **Paper White** — every background. Never pure white.
- **Warm Gray** — 0.5 pt hairlines, decorative captions at 13 pt+. Never body type.
- **Deep Burgundy** — always a point, never a plane. Stamps, numerals, accent rules.
- **Night Navy** — reserved surfaces only: PDF covers, KEY Letter, admin. Never on the public web.

---

## Prohibitions

- Any color outside the five (and their derived scales).
- Gradients of any kind, including "subtle" ones.
- Overlay opacity below 95%.
- Blue-violet "AI" tints (`#5B6EF5`, `#7B68EE`, etc.).
- Glassmorphism, frosted backdrops, color shadows.
- Status colors (success-green, warning-orange, danger-red) introduced ad-hoc. None until a product flow demands it.

---

## File list

```
palette.json   Core 5 + derived scales + semantic tokens + WCAG audit
index.html     This page in HTML — swatches, scales, scenes, usage rules
README.md      This file
```

A printable PDF of the swatch sheet and usage guide is **deferred to V2**, once the JSON is approved. No point printing a version that's about to move.

---

## V1 → V2 — feedback I expect

1. JSON token names — keep or rename any of the `semantic.*` keys.
2. Derived scale — keep or adjust any one step (Ink 500 warmer? Paper 300 darker?).
3. Whether to lock the `#F5E8E9` burgundy tint as an allowed field color, or kill it.
4. Whether to introduce status colors (green / orange / red) now, or wait until a flow demands them.
5. Anything I missed.

V2 will deliver:
- Adjusted JSON if needed
- Printable swatch PDF + usage-guide PDF
- A source file (Affinity Publisher / InDesign / Illustrator)

---

*— Design, via the Founder*
