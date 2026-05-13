# Font Pairing Recommendations · KEY · V2

> **Status: Plan A — adopted V1 → V2.**
> Source Serif 4 + Inter + Noto Serif SC + Noto Sans SC + JetBrains Mono.
> Lora is removed from the stack. Codebase swap is a one-line change in the Tailwind config; tokens map cleanly.

---

Three concrete proposals for the KEY typographic system. The current code uses **Lora + Inter + Noto Serif SC + Noto Sans SC**; this document asks whether that holds, and what we'd replace it with if not.

---

## Plan A · all Google Fonts · free commercial · *my recommendation*

| Role | Family | Why |
|---|---|---|
| English serif (display + body) | **Source Serif 4** | Modern transitional serif by Frank Grießhammer (Adobe, OFL). Variable: `wght 200–900`, `opsz 8–60`. Reads as a serious trade-quarterly at display size, and as quiet book-stock at body. Pairs cleanly with Inter without fighting it. |
| English sans (labels, mono nav, mastheads) | **Inter** | Variable, broad weight range, neutral. Used as the *small* voice — caps with `+0.32em` tracking, never as headline. |
| 中文 serif | **Noto Serif SC** (思源宋体 SC) | Default of the Chinese editorial web. Five weights via Google Fonts (300/400/500/600/700/900). Reads cleanly at body. |
| 中文 sans | **Noto Sans SC** (思源黑体 SC) | Pair to Noto Serif. Used for footers, admin chrome, small labels. |
| Mono | **JetBrains Mono** | For Brief numbers, document IDs, code. Neutral, slightly humanist, doesn't shout. |

**Reads as**: Substack at body, The Drift at display, with a Chinese-publication discipline in CJK runs.

**Trade-off**: Source Serif is widely used. It can read as "tasteful default" at body size — *mitigated by the wordmark decisions in Brief 01 and by the wide tracking on labels*.

**Why this swaps Lora out**: Lora was drawn for screen readability above all. It rounds soft. At 56 pt + (headlines, brief covers) it loses gravity — it stays "comfortable" when KEY needs *weight*. Source Serif keeps the screen-readability of Lora at body and adds editorial bone-structure at display sizes. Same license, same delivery channel, same fallback.

---

## Plan B · mixed commercial · stronger voice · *if budget exists*

| Role | Family | Why |
|---|---|---|
| English serif (display) | **GT Sectra** (Grilli Type) | Contemporary editorial display serif drawn from etching technique. The masthead of magazines you remember by name. ~$600 commercial licence (5 weights). |
| English serif (body) | **Source Serif 4** | GT Sectra's body weights work, but they cost extra; pair Sectra display with Source Serif body and the system stays cohesive and affordable. |
| English sans | **Söhne** (Klim) | Söhne is the sans of contemporary serious publishing (Frieze, The Drift web, MUBI). ~$500 commercial licence. Replaces Inter at labels and small caps. |
| 中文 serif | **Noto Serif SC** | Unchanged. There is no equivalent paid option that materially improves on Source Han Serif at the price point. |
| 中文 sans | **Noto Sans SC** | Unchanged. |
| Mono | **JetBrains Mono** or **GT Sectra Mono** | The latter if Sectra is already licensed; it makes brief numbers stamp-like. |

**Reads as**: Air Mail at the body, Aperture at display, The Drift at the masthead. The most *complete* version of KEY's editorial intent.

**Trade-off**: ~$1,000-1,200/yr in font licensing. We can't ship the website until the licence is paid. Print-only usage allowed at lower fees.

**My take**: not necessary for V1. If KEY closes the founder cohort and the brand earns its keep, *then* upgrade to Plan B for V2 of the site.

---

## Plan C · wildcard · all-Google-Fonts but voice-shifted

| Role | Family | Why |
|---|---|---|
| English serif (display) | **Newsreader** (Production Type) | Variable, optical-size aware, OFL. Has more humanist bone than Source Serif 4 at display sizes. |
| English serif (body) | **Source Serif 4** | Pairs to Newsreader display the way GT Sectra pairs to Source Serif. |
| English sans | **Inter** | Same as Plan A. |
| 中文 serif | **Noto Serif SC** | Unchanged. |
| 中文 sans | **Noto Sans SC** | Unchanged. |
| Mono | **JetBrains Mono** | Unchanged. |

**Reads as**: MUBI Notebook + Penguin Modern Classics. The most *literary* of the three, but slightly less authoritative than Plan A.

**Trade-off**: introduces a second English serif into the system. Defensible but adds one more thing to maintain. Worth pursuing only if Wordmark Direction B (Newsreader) is selected — then both system and wordmark are in the same voice.

---

## Compatibility note · CN + EN mixing

All three plans use **Noto Serif SC** and **Noto Sans SC** for Chinese. None of the proposed English serifs come with native Chinese glyphs; CJK falls through the stack to Noto. Vertical metrics align reasonably between Source Serif 4 and Noto Serif SC — both have `~24% cap-to-x` and similar baseline positioning — so a CN sentence mid-EN paragraph doesn't disrupt the line. Same with Newsreader + Noto.

The pairing that *fails* this test, in my testing: any of the high-contrast didone families (Bodoni Moda, Playfair, Cormorant) with Noto Serif. Their stroke contrast looks engraved where Noto Serif is even. **Hence Bodoni Moda is wordmark-only**, never body.

---

## My final recommendation

**Plan A** for V1.

- It removes the only weakness in the current stack (Lora's softness at display sizes).
- It costs nothing.
- It loads from the same CDN as today.
- It works for both code-side and any printed asset (the typography PDF, the brief PDFs).

If/when budget allows, upgrade to Plan B for the public site relaunch. Plan C is only correct if Wordmark Direction B is selected — in which case revisit.

---

*— Design, via the Founder*
