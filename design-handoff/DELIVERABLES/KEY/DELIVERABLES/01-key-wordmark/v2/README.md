# Brief 01 · KEY Wordmark · Deliverable V2

**Date**: 2026-05-13
**Status**: V2 · production grade · for review
**Iteration**: 2 of 2–3 expected
**Reviewer**: Claude (technical lead) via founder

---

## What changed since V1 — the five lifts

### 1. SVGs are outlined paths · no font dependency

Every wordmark file is now a self-contained `<path>` with no `class="km"` referring to nothing. Source Serif 4 Bold (Adobe, OFL) was parsed via `opentype.js` and the `KEY` glyphs converted to outline geometry. The SVGs render identically anywhere they land — React component, email signature, press PDF, ad-hoc preview.

This addresses the V1 P0 issue Claude flagged: the `.km` class was undefined, so SVGs fell back to Times New Roman in any context outside the presentation page.

### 2. Mark repositioned

- Position: `endX + 14px` (was `x = 850`, a fixed coordinate that floated free of the wordmark)
- Length: 48 px (was 68 px)
- y-coordinate: 100 (kept from V1)
- On-dark variant: Burgundy 400 (`#8A2F3B`) for slightly better visibility on Night Navy without becoming "loud"

The mark now reads as a *stamp on KEY* rather than an independent horizontal line.

### 3. Nav-size variant

`em`-unit tracking doesn't scale linearly — `+0.16em` at 224 pt feels right; at 18 pt it feels cramped. New file `key-wordmark-nav.svg` uses `+0.19em` for sub-24 px lockups.

**Threshold**: 48 px cap-height. Above → use `key-wordmark.svg` (display). Below → use `key-wordmark-nav.svg` (nav).

### 4. Y-fork — shipped as exploration

`key-wordmark-A-y-fork-explore.svg` adds a small path extending the bottom of Y's left arm past its natural junction with the stem. The geometry: ~6–7% of cap height, aligned with the arm's slope, in the same ink color.

Shipped as a **separate file** rather than baked into the canonical so the reviewer can decide whether to promote it. See section IV of `index.html` for visual at native size and at 5× zoom.

**My recommendation**: promote into canonical. The fork is craft, and craft that only the careful reader notices is the brand promise. But I won't commit without your call — the canonical wordmark is too load-bearing to flip silently.

### 5. Favicon + OG suite

- `key-favicon-16.png`, `key-favicon-32.png`, `key-favicon-180.png` — single-letter `K` (Source Serif 4 Bold) on Paper background. Recognizable at browser-tab scale; the full `KEY` would blur.
- `key-og-image.png` (1200 × 630) — social-card composition with the wordmark + tagline. SVG source also included.
- `key-mark-only.svg` (96 × 24) — the burgundy hairline alone, for email signature footers, end-of-letter ornaments, and brief seals.

---

## File list

```
key-wordmark.svg                    Canonical · outlined · display +0.16em
key-wordmark-nav.svg                Nav · outlined · +0.19em
key-wordmark-with-mark.svg          Canonical + repositioned mark
key-wordmark-on-dark.svg            Outlined · on Night Navy
key-wordmark-monochrome.svg         Outlined · transparent · ink only
key-wordmark-A-y-fork-explore.svg   EXPLORATION — Y fork, for review
key-mark-only.svg                   Burgundy hairline · 96×24

key-favicon-src.svg                 Source SVG · K · 256×256
key-favicon-16.png                  16 × 16
key-favicon-32.png                  32 × 32
key-favicon-180.png                 180 × 180 (apple-touch-icon)

key-og-image.svg                    OG source · 1200×630
key-og-image.png                    OG rasterized · 1200×630

index.html                          V2 presentation page
README.md                           This file
```

Class-naming cleanup: the SVGs no longer use `class="km"` or anything else; they're pure `<path>` elements with inline fills. The HTML presentation page uses `.specimen`, `.variant`, `.sizes__cell` — descriptive of role, not implementation.

---

## Deferred to V2.5 / V3

1. **Direction C poster lockup.** Bodoni Moda outlining is queued — jsDelivr fetch path needs verifying. Brief 04 in V2 still uses Source Serif 4 for the poster wordmark (consistent with the canonical for now). Once C is outlined we'll ship `key-wordmark-C-poster.svg` for the Founder Edition cover only.
2. **OG image text fidelity.** The OG PNG currently rasterizes the small italic tagline using a system-fallback serif (the wordmark itself is true paths). Functional, but not press-grade. V3 fixes via headless-browser rasterization with embedded fonts, or by outlining the tagline text too.
3. **Y-fork decision.** Promote into canonical (V3 includes path edit), or drop (canonical stays clean with native Y).

---

## V2 → V3 — feedback I expect

1. **Y-fork verdict.** Promote, drop, or "show me a third interpretation".
2. **Mark on-dark color.** Burgundy 400 (`#8A2F3B`) chosen so the mark is visible on Night Navy. Acceptable, or revert to Burgundy 500?
3. **Favicon — K alone.** OK to keep single-letter K, or do you want the full burgundy hairline mark stamped onto the favicon?
4. **OG image composition.** The current OG mirrors the Founder Edition cover (wordmark + hairline + bilingual tagline). Acceptable, or do you want a different framing?
5. **Direction C poster lockup priority.** Block on Brief 04 finalising, or can it ride into V2.5?

---

## Not changed (V1 was right; we kept it)

- Direction A as canonical (selected at V1 review).
- `1024 × 256` viewBox (4:1 ratio).
- Letter-spacing range `+0.12em ≤ tracking ≤ +0.22em` — V2 stays inside this.
- Two-color simplicity — ink + burgundy, no third tone in any variant.
- Direction B and C as held assets (B for KEY Letter long-form, C for Founder Edition cover). C poster outlining queued for V2.5.

---

*— Design, via the Founder*
