# Brief 01 · KEY Wordmark · Deliverable V1

**Date**: 2026-05-13
**Status**: V1 · awaiting selection
**Iteration**: 1 of 2–3 expected

---

## 3 directions, side-by-side

| | A · Authority | B · Quietude | C · Engraved |
|---|---|---|---|
| **Voice** | Trade quarterly | Novella imprint | Fine-art catalogue |
| **Font** | Source Serif 4 · 700 | Newsreader · 700 · opsz 72 | Bodoni Moda · 900 · opsz 96 |
| **Tracking** | +0.16em | +0.13em | +0.22em |
| **Mark** | Burgundy hairline bar, right | Burgundy disk, lower-right | V-notch cut into upper rule |
| **License** | SIL OFL — free commercial | SIL OFL — free commercial | SIL OFL — free commercial |
| **Smallest legible** | 14 px | 14 px | 18 px (rules dropped < 24 px) |

All three sit inside a `1024 × 256` viewBox (4:1 aspect, the masthead ratio).

---

## Design decisions

### A · Authority

- **Font**: Source Serif 4 Bold. Modern transitional serif — bracketed serifs, balanced contrast, broad x-height. Reads as a serious trade quarterly without performing seriousness.
- **Tracking**: +0.16em. Wide enough to feel like a masthead, tight enough that `KEY` reads as one word.
- **Y treatment**: untouched in V1. Source Serif's Y already has a clean junction; if A is selected we'll draw a custom Y with a 6–8% fork in V2.
- **Mark**: a 48 × 2.5 px burgundy hairline bar to the right of the wordmark, on cap-line. Reads as a redaction stroke — the key that's been *struck through*, found.
- **Why this is my pick**: it's the broadest-shouldered of the three. It will hold up across nav, footer, email, print, social, and investor materials without needing a different lockup at every scale.

### B · Quietude

- **Font**: Newsreader Bold at optical-size 72. Drawn for long-form reading; at display sizes the terminals soften and the contrast eases. The most humane of the three.
- **Tracking**: +0.13em — tighter than A because Newsreader's proportions are already wider.
- **Y treatment**: untouched. Newsreader's Y has a slightly tilted junction that already suggests a path branching.
- **Mark**: a single burgundy disk (8px at 84px cap), sitting at lower-right of the lockup. A sentence-ending period — *the question stops here.*
- **Trade-off**: slightly less authoritative than A. Best held for KEY Letter (Brief 15) and any long-form reading surface.

### C · Engraved

- **Font**: Bodoni Moda Black at optical-size 96. Pure didone — vertical stress, hairline-to-stem contrast, ball terminals.
- **Tracking**: +0.22em — the widest. Didones need air.
- **Composition**: held between two 0.75 pt hairline rules, top and bottom. Quotes 19th-century engraved masthead conventions (Aperture, FRIEZE, museum exhibition catalogues).
- **Mark**: a burgundy v-notch (∧) cut into the upper rule, dead-center. Optional — the rules alone are sufficient.
- **Trade-off**: breaks at small sizes. Below ~24px the hairlines disappear and the didone hairlines themselves get fragile. C needs a *secondary nav lockup* (wordmark only, no rules) — drawn in the page.

---

## My recommendation

**Pick A as the working master.** Hold C in reserve for the Founder Edition cover (Brief 04) and the first public poster.

**Why A over B**: B is beautiful but gentler. KEY's reader is making heavy decisions — parents, children, marriages, migration. A holds the weight. B is the right voice for KEY Letter once we get to Brief 15.

**Why not C as default**: C is gorgeous at poster scale and structurally unstable below 24 px. It needs to be the *cover voice*, not the *brand voice*. Reserve it for masthead pieces.

---

## Known trade-offs

1. **No custom Y fork in V1.** All three use the font's native Y. If A is confirmed, V2 will deliver an outlined Y with a 6–8% fork in the left arm.
2. **SVG files reference webfonts via `@import`.** Renders correctly in browsers, but is not yet outline-converted for press. V2 will deliver outlines + embedded subsets.
3. **Favicons / apple-touch-icon / OG image deferred to V2.** No point producing nine sets of icons for three directions — wait until direction is selected.

---

## File list

```
key-wordmark-A-primary.svg     A · primary on paper
key-wordmark-A-with-mark.svg   A · with burgundy hairline bar
key-wordmark-A-on-dark.svg     A · on Night Navy
key-wordmark-A-monochrome.svg  A · transparent · ink only

key-wordmark-B-primary.svg     B · primary
key-wordmark-B-with-mark.svg   B · with burgundy disk
key-wordmark-B-on-dark.svg     B · on Night Navy
key-wordmark-B-monochrome.svg  B · transparent · ink only

key-wordmark-C-primary.svg     C · primary with rules
key-wordmark-C-with-mark.svg   C · with v-notch
key-wordmark-C-on-dark.svg     C · on Night Navy
key-wordmark-C-monochrome.svg  C · transparent · ink only

index.html                     V1 presentation (this page in HTML)
README.md                      this file
```

---

## V1 → V2 — feedback I expect

1. Which direction — A, B, or C.
2. Tracking confirmation, or ±0.02em adjustment.
3. Mark verdict — keep, drop, or redesign.
4. Y fork — go custom, or leave native.
5. Sizing-bias adjustments (e.g. "make the nav lockup 2 pt smaller").

V2 will deliver the selected direction as the canonical master with:

- Outlined SVGs (no font dependency)
- Custom-drawn Y (if selected)
- Full favicon / apple-touch-icon / OG image suite
- A `key-mark-only.svg` for cases where the mark stands alone

---

*— Design, via the Founder*
