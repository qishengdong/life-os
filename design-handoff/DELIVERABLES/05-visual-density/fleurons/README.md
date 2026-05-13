# Fleurons · V3 First Pass

Five chapter-divider ornaments. Each ships in two colors: ink black (`#111111`) for body / chapter use, and seal burgundy (`#7C2330`) for emphasis breaks.

ViewBox `0 0 64 16` on all variants. Single fill at top level — swap colors in code by re-assigning `fill` on the SVG root.

---

## When to use which

| Variant | When | Why |
|---|---|---|
| `classical-west` | Brief § openings, KEY Letter section dividers | Western publication tradition. Reads as "literary." Use sparingly — too much and it gets ornate. |
| `chinese-huiwen` | Chinese-language pages (`/methodology` CN, KEY Brief CN body) | Recursive 回 motif. Reads as classical Chinese print. Pair with serif body, not sans. |
| `key-derived` | Top-level brand artefacts — cover pages, masthead breaks, end-of-deck | KEY's own typographic signature, abstracted. Distinctive — use as KEY-specific marker, not generic. |
| `simple-diamond` | Body section breaks. The default. | Quiet, classical, doesn't compete with text. Use when the page already has other ornaments and another flourish would feel busy. |
| `double-rule` | Footers, masthead separators, end-of-document | Newspaper-tradition. Reads as "this column is closed." Use at the bottom of any printed artefact. |

---

## Color variants

- **Black** (`fill="#111111"`) — chapter dividers, neutral breaks
- **Seal burgundy** (`fill="#7C2330"`) — emphasis breaks, end-of-section flourishes, anywhere the page wants to feel "stamped"

Both color variants ship as separate files (`-seal` suffix). Engineering can also swap dynamically by overriding the top-level `fill` attribute.

---

## File list

```
fleuron-classical-west.svg          ink · classical Western S-curve + center knot
fleuron-classical-west-seal.svg     burgundy variant

fleuron-chinese-huiwen.svg          ink · 回 motif between two short rules
fleuron-chinese-huiwen-seal.svg     burgundy variant

fleuron-key-derived.svg             ink · K-E-Y abstracted into three strokes
fleuron-key-derived-seal.svg        burgundy variant

fleuron-simple-diamond.svg          ink · ◆ flanked by short rules
fleuron-simple-diamond-seal.svg     burgundy variant

fleuron-double-rule.svg             ink · two parallel hairlines
fleuron-double-rule-seal.svg        burgundy variant
```

10 SVGs, ~0.5 KB each.

---

## Usage rules

- **Center alignment.** All fleurons assume their host element centers them. Wrap in `<div style="text-align:center">` or use the flex parent.
- **Vertical breathing.** Allow ≥ 2× line-height above and below. They earn their effect from white space.
- **No nesting.** Never put a fleuron inside a quote, a button, or a navigation item. They're chapter-scale ornaments.
- **No mixing.** One fleuron variant per page. Different sections may use different variants only if the document is long enough to justify a hierarchy (e.g. KEY Letter monthly).
- **Hover / active states — none.** Fleurons are not interactive.

---

## V1 → V2 — what I expect back

1. **Classical-west weight** — the S-curves currently feel slightly heavy. Lighten by ~15%, or hold.
2. **KEY-derived legibility** — does it read as "KEY abstracted" on a page, or just as "three vertical marks"?
3. **Chinese-huiwen rules** — current is 0.75 stroke. Heavier (1pt) might read more "carved", lighter (0.5pt) more "printed." Pick one.
4. **Burgundy variant darkness** — `#7C2330` matches the V3 brief. On screen at small sizes it reads slightly muted; for high-contrast print contexts we may want a darker variant (`#6E1F2A`).

---

*— Design, via the Founder*
