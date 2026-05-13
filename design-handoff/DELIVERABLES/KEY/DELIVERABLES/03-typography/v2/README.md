# Brief 03 · Typography · Deliverable V2

**Date**: 2026-05-13
**Status**: V2 · production grade · for review
**Iteration**: 2 of 1–2 expected
**Reviewer**: Claude (technical lead) via founder

---

## What changed since V1 — two lifts, no drama

### 1. Body line-height pushed back to 1.75

V1 raised it to 1.78 with the note "set to settle." Not a real reason. 1.75 is what the Brand Brief and Master Directive both specified, and at 17 px with Source Serif 4 it's the publication standard.

```diff
- --t-body-lh: 1.78;
+ --t-body-lh: 1.75;
```

### 2. Added body-large step (19 px)

For KEY Letter (Brief 15), `/methodology` long-form, the opening manifesto on any Brief PDF — surfaces where the reader stays for many minutes.

```css
--t-body-large-size:    19px;
--t-body-large-lh:      1.80;

--t-cn-body-large-size: 19px;
--t-cn-body-large-lh:   1.92;
```

Utility classes: `.t-body-large`, `.t-cn-body-large`.

**Used sparingly.** Default body stays 17 px / 1.75.

---

## Plan A · adopted

Source Serif 4 + Inter + Noto Serif SC + Noto Sans SC + JetBrains Mono. Lora is out of the stack. Codebase swap is a one-line change in the Tailwind config; tokens map cleanly. Header note added to `font-pairing-recommendations.md`.

---

## Not changed (V1 was right)

- All other scale steps — display-1, display-2, hero, h1, h2, h3, quote, body-small, caption, label, mono — unchanged in size, leading, weight, tracking.
- Variable-axes import URL — full 200–900 wght, 8..60 opsz, both italic and roman — unchanged.
- All nine micro-rules — drop cap, blockquote, lists, punctuation, numerals, caps tracking, CN/EN mixing, measure, paragraph spacing — unchanged.
- `.num-onum` / `.num-tnum` / `.num-pnum` utility classes — unchanged.
- CN measure as `32em` (CJK character count) — unchanged.

---

## File list

```
typography-css-tokens.css        V2 tokens · lh 1.75 · body-large added
font-pairing-recommendations.md  V1 + adoption header
index.html                       V2 presentation
README.md                        This file
```

### Deferred to V2.5

1. `typography-spec.pdf` — printable spec sheet.
2. `typography-samples.pdf` — printable type samples.
3. **Webfont loading optimisation** — split CN into deferred async load, subset Latin to latin-ext only. Net ~9–10 MB saved on first paint.

---

## V2 → V3 — feedback I expect

1. **Body-large at 19 px** — keep, or push to 20 px. (I tested both; 19 is the better step from 17 without becoming "large print." 20 looks slightly clinical.)
2. **CN body lh 1.88 vs 1.85** — kept at 1.88 for sustained reading. Some surfaces (Brief PDF inner pages) may want 1.85 for slightly tighter pages. We can introduce `cn-body-tight` if the need is real.
3. **Tailwind mapping** — once you (technical side) write the `tailwind.config.js` mapping, I'll review for any name collisions or tokens we should rename.
4. **Subset CN webfont** — schedule for V2.5, or block on it now?

---

## V2 → next steps for Claude (technical side, per V1 feedback)

> I (technical lead) will write the `tailwind.config.js` mapping that consumes these CSS variables. CSS variable names are locked at V2 — `--t-{role}-{property}`. Confirm.

Confirmed. The names in `typography-css-tokens.css` are locked. Adding tokens in V3+ will follow the same convention (`--t-{role}-{property}` for English, `--t-cn-{role}-{property}` for Chinese).

---

*— Design, via the Founder*
