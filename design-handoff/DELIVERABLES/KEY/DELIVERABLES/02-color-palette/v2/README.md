# Brief 02 · Color Palette · Deliverable V2

**Date**: 2026-05-13
**Status**: V2 · production grade · for review
**Iteration**: 2 of 1–2 expected
**Reviewer**: Claude (technical lead) via founder

---

## What changed since V1 — five additions

### 1. Status colors added (3)

| Name | Hex | RGB | WCAG on Paper | Tint bg |
|---|---|---|---|---|
| `status.success` (sage) | `#5C8576` | 92 / 133 / 118 | 4.2 : 1 · AA large | `#EAEFEC` |
| `status.warning` (amber) | `#B8843C` | 184 / 132 / 60 | 3.8 : 1 · AA large | `#F4ECDC` |
| `status.danger` (ember) | `#A8442F` | 168 / 68 / 47 | 5.1 : 1 · AA | `#F1E2DD` |

Inherited from the existing code stack (Outcome 30/90/365 follow-ups, email send states, LLM timeouts, Brief word-count validation). Now formalised with explicit usage rules.

**The rule for all three**: small text inline, small icon fills, badge backgrounds, focus rings, tint-bg emphasis blocks. **Never** page backgrounds, **never** card-size fills, **never** as headline color, **never** mixed with another tint in the same view.

### 2. Print Pantone reference codified

Every core color now ships with an indicative CMYK build, a Pantone equivalent, and a printer note. The Burgundy advisory from V1 (1815 C is safer than the four-color build) is now in the JSON at `print.burgundy.pantone`. Indicative only — wet proof required before commitment.

### 3. Dark-mode policy — explicit

```
KEY does not support OS-level dark mode. Night Navy is a reserved surface,
never an inverted theme.
```

Codified at `meta.darkModePolicy` in the JSON. Engineering side: `prefers-color-scheme: dark` MUST NOT swap the public-web Paper background to a dark theme. Night Navy stays where the brief names it: KEY Brief PDF cover, KEY Letter cover, admin, investor-deck dark pages.

### 4. Reserved scale steps documented

- **Paper 500 (`#D6CFC2`)** — "deep sunken." Used *inside* Paper 100 cards, never as page background. Example: an aside on a Brief page (further sunken than Paper 300), the inset region of a membership tier card. Expect 1–2 instances per page max.
- **Burgundy 300 (`#B05863`)** — "muted accent." Revoked-invite strike-through, disabled tier indicator, closed-cohort status. Reads as "burgundy past-tense." Not a substitute for status.danger — different semantic.

Both stay in the scale rather than being deleted, but now with explicit assigned roles.

### 5. Long-form reading body color = Ink 700

For sustained-reading surfaces (KEY Brief body, KEY Letter, `/methodology` long-form), body text uses **Ink 700 (`#2A2622`)**, not Ink 500. The half-step is small in isolation and significant over many paragraphs.

- Ink 700 → long-form body, primary reading
- Ink 500 → short secondary type, footnotes, mast meta, captions

Codified in JSON at `longFormReadingPreference.body`.

---

## Not changed

- The five core values are still locked. No changes.
- Derived ink / paper / burgundy / navy scales unchanged.
- All semantic tokens kept; new ones (`accentMuted`, `stampOnNavy`, `backgroundDeepSunken`, `statusSuccess/Warning/Danger`) added on top.
- "Burgundy never a plane, always a point" remains the operative rule.

---

## File list

```
palette.json   Core + scale + status + semantic + print + dark-mode + long-form + WCAG
index.html     V2 presentation
README.md      This file
```

### Deferred to V2.5

- `palette-swatches.pdf` — printable A3 visual swatch sheet.
- `palette-usage-guide.pdf` — printable 6–8 page usage guide.
- `palette-source.afpub` — layered source for design partners.

JSON + WCAG audit are engineering-ready and unblocked. The PDFs are press artefacts — schedule for V2.5 once the JSON is committed.

---

## V2 → V3 — feedback I expect

1. Status color hexes — keep sage/amber/ember at the inherited code values, or tune any one to match a specific surface (e.g. shift sage cooler for the brief outcome).
2. Burgundy tint as a *card surface* (no — currently disallowed) or as *callout only* (yes — currently allowed). Confirm or expand.
3. Paper 500 — keep with the "deep sunken" role, or drop now that V1's concern is addressed.
4. Dark-mode policy — accept locked, or want a soft fallback (e.g. mobile auto-dim Paper to Paper 300 in low light)? My recommendation: hold the line.
5. Long-form body Ink 700 — accept, or reconsider once we test on print-grade stock at body sizes.

---

*— Design, via the Founder*
