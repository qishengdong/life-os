# Marginalia · V3

Small ornaments for KEY's long-form pages (sample brief, methodology, KEY Letter). Each one earns the page a touch of editorial-craft density without becoming busy.

All ornaments: monochrome `#111111`, opacity 0.4, hairline 0.5pt stroke where applicable. Outlined paths — no font dependency.

---

## First-pass delivery (4 of 8)

| File | viewBox | Role |
|---|---|---|
| `section-start-line.svg` | 32 × 4 | Section opening · short rule + terminal dot. Reads as "this section begins here." |
| `quote-bracket-left.svg` | 8 × 80 | Left bracket for pulled quotes. Right-angle classical hook with terminal serifs. |
| `quote-bracket-right.svg` | 8 × 80 | Right bracket — mirror of left. |
| `paragraph-divider.svg` | 24 × 12 | Three vertical dots between paragraphs of a long passage. Like ⋮ but evenly spaced and refined. |

## Second-pass delivery (remaining 4)

```
section-end-line.svg       (32×4)    Section closing · center cross + flanking rules
interrogation-mark.svg     (24×24)   "Pose-a-question" marker · thin ⊙ + classical exclamation
footnote-marker.svg        (12×12)   Footnote anchor · classical † or ‡
page-break-fleuron.svg     (200×16)  Full-width page-break · rule + center fleuron
```

---

## Usage

### `section-start-line.svg`

Place before any `<h2>` section heading on long pages. The terminal dot points "into" the new section.

```html
<img src="marginalia/section-start-line.svg" alt="" aria-hidden="true"
     style="display:block; width:64px; height:8px; margin: 24px 0 8px;">
<h2>§ II · The trade-off you can't un-see</h2>
```

### `quote-bracket-left.svg` / `quote-bracket-right.svg`

Flank pulled quotes in editorial body. The brackets are deliberately tall (80 units) so they scale to multi-line quotes.

```html
<figure class="pull-quote">
  <img src="marginalia/quote-bracket-left.svg" alt="" aria-hidden="true">
  <blockquote>You may be mistaking guilt for responsibility.</blockquote>
  <img src="marginalia/quote-bracket-right.svg" alt="" aria-hidden="true">
</figure>
```

CSS sizing: brackets stretch vertically to match the quote height. Width is constant ~8px.

### `paragraph-divider.svg`

Between paragraphs within the same section, when you want a softer break than a blank line but a firmer one than a paragraph margin. Use sparingly — once per page, max.

```html
<p>...</p>
<img src="marginalia/paragraph-divider.svg" alt="" aria-hidden="true"
     style="display:block; margin: 16px auto; width:18px; height:9px;">
<p>...</p>
```

---

## Technical notes

- **Opacity 0.4 baked into the SVG.** Don't compose another opacity on top — you'll lose them on bright displays.
- **Color via CSS variable.** Top-level `fill="#111111"`. If a page uses an alternate body color (e.g. KEY Letter on cream stock with sepia ink), override the SVG fill with `style="--marginalia-fill: #4A3B2A"` and adjust the SVG source accordingly. For V3 they all ship as ink.
- **No interactivity.** All `aria-hidden="true"` in markup. These are decoration.

---

## V1 → V2 — what I expect back

1. **Paragraph divider — three dots vs four.** Currently three. NY Review uses three. The Drift sometimes uses four. Confirm.
2. **Quote brackets — terminal serifs.** Currently include small horizontal serifs at the corners. Strip them for cleaner look, or keep for "engraved" feel.
3. **Opacity 0.4.** Heavier (0.5) reads more present; lighter (0.3) more atmospheric. Pick one.
4. **Section-start dot position.** Currently to the right of the rule. Left would invert the read direction ("here ends the previous section" rather than "here begins the new").

---

*— Design, via the Founder*
