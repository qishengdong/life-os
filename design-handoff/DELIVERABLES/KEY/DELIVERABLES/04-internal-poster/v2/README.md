# Brief 04 · Internal Demo Poster · Deliverable V2

**Date**: 2026-05-13
**Status**: V2 · production grade · for review
**Iteration**: 2 of 2–3 expected
**Reviewer**: Claude (technical lead) via founder

---

## What changed since V1 — three updates

### 1. EN method · sharp version (accepted)

Reviewer was right. The sharp version closes the distance with ChatGPT and reads more like KEY's actual product philosophy. V1's "magazine-range" version was correct prose but the wrong voice for the brand's first artefact.

| | V1 (gentle) | V2 (sharp) |
|---|---|---|
| K | We remember who you are. | **We remember what you said. We don't ask twice.** |
| E | We surface the costs you can't un-see. | **We surface what you're avoiding.** |
| Y | The call remains yours. | **The call is yours. We won't take it.** |

Applied in EN view + spread EN + digital EN.

### 2. Digital · 1920 × 1080 view added

A new view in the segmented control — `Digital · 1920 × 1080`. Renders the CN + EN pair as a horizontal 16:9 composite with editorial chrome (top mast + bottom footer). Sized to share cleanly in WeChat, email forwards, and presentation slides.

The bilingual A2 print spread (`Print Spread · A2 × 2`) is kept for printing and onsite display. The 1920 × 1080 digital is the new "share asset."

### 3. Photographer brief shipped (`photographer-brief.md`)

A complete single-page commissioning document for the still-life photograph the poster's image area is waiting for. Covers:

- Props (specifics — Montblanc 149 / Sailor 1911, 青花 teacup, brass or walnut lamp)
- Lighting (single warm source, upper-right 45°, no daylight)
- Composition (3:2, desk in lower 70%, asymmetric placement)
- Tonal range (B/W, Tri-X grain, warm split-tone in post)
- What the image must *not* be (zero tolerance: phones, hands, faces, modern tech, logos)
- Reference frames (Sudek, Blossfeldt, Drift inheritance issue cover, Aperture 235)
- Deliverable formats (TIFF master, print TIFF, digital PNG)

Ready to hand to the working photographer the Founder commissions.

---

## Kept from V1

- Direction A — still life (confirmed by reviewer).
- 6-segment vertical rhythm of the poster.
- The five-phrase manifesto line with periods (`父母养老。孩子出路。婚姻去留。职业转身。要不要迁移。`).
- Three-line break in the manifesto closing tercet.
- Stamp pair (CN bleed via `feTurbulence` / EN clean) — concept explicitly retained per reviewer.
- Image placeholder honesty (corner registration marks + "photograph to follow" label) — image area sits at 36% of poster height, within brief's 35–40%.
- Wordmark uses Brief 01 Direction A; CSS class swap remains a single change.

---

## File list

```
index.html              V2 poster: CN, EN, Print Spread, Digital 1920×1080
photographer-brief.md   Commissioning brief for the still-life photograph
README.md               This file
```

### Deferred to V2.5 / V3

1. `poster-A2-cn.pdf` — print-ready CN with bleed + crops.
2. `poster-A2-en.pdf` — print-ready EN.
3. `poster-bilingual-spread.pdf` — print-ready 840 × 594 mm spread.
4. `poster-digital-preview-cn.png` — 1417 × 2008 PNG for messaging.
5. `poster-digital-preview-en.png` — 1417 × 2008 PNG.
6. `poster-spread-digital.png` — 1920 × 1080 PNG from the new digital view.
7. `poster-source.afpub` — layered source for printer/design partners.
8. The photographed still-life dropped into the image area (one-line CSS swap once the photograph exists).

PDF + raster exports are press / messaging artefacts. The HTML design renders pixel-correct in the browser; the V2.5 work is mechanical rasterisation + bleed addition, not a design loop.

---

## V2 → V3 — feedback I expect

1. **Sharp EN method** — accept all three lines, or tighten further (you'd asked for sharpness; we delivered; tell me if it overshot).
2. **Digital 1920 × 1080 composition** — keep as a side-by-side compressed spread (current), or rebuild as a horizontal "essence" composition (single composition, not two posters).
3. **Photographer brief** — is the props list correct? Specifically the pens — Montblanc 149 / Pelikan M800 / Sailor 1911. If the Founder has a personal preference, it goes in here.
4. **Stock recommendation** — the photographer brief stops at "warm uncoated text stock 100–120 gsm." The palette V2 names Mohawk Superfine eggshell and GF Smith Colorplan natural white. Do you want a specific stock written into this brief, or leave to the printer?
5. **Bilingual spread future** — once we have the photograph, the print spread becomes the press master. The 1920 × 1080 digital becomes the share master. Confirm split.

---

*— Design, via the Founder*
