---
name: frontend
description: Design tokens, motion rules, layout patterns, and responsive rules for the pika-xu studio website. Use for any task that touches HTML, CSS, or visual behavior.
---

## Design Direction

The direction is "Kinetic Editorial". Typography is the visual — there are no illustrations, no 3D, and no stock photos. The site feels alive through type motion and scroll, not through decoration. The tone is serious-professional. It must NOT look like a finance tool or a dev tool.

## Tokens

- tokens.css is the only place colors/spacing/type scale are defined.
- Before using any token in code, verify it exists: `grep "token-name" src/styles/tokens.css`. If missing, stop and ask — do not invent tokens.
- Palette structure: --bg (near-black), --fg (off-white), --accent (single bold color), --muted (gray). Exact values come from the approved Claude Design output; do not choose them yourself.

Approved values (locked from Claude Design output):

```
--bg:     #0A0A0B   (near-black)
--fg:     #F4F3EF   (off-white)
--accent: #D7FF3D   (lime)
--muted:  #8A8A86   (gray)
```

Font family: Manrope (variable, weight axis 200–800). Accent usage: 1px borders, link hover state, and small accents only — not body or tagline text. The tagline "Products I Keep Adding, Xtremely Useful." is set in --fg. Hero wordmark weight arc runs 200 at rest to 800 at full scroll.

## Typography

- One variable font family for everything; hierarchy via weight/size only.
- Hero wordmark: viewport-scaled (clamp with vw), edge-to-edge.
- Kinetic behavior: font-variation-settings (weight axis) driven by scroll position. Implement in scripts/modules/scroll-type.js. Must degrade gracefully: with JS disabled, static text at default weight.

## Motion Rules

- CSS scroll-driven animations first; JS only where CSS cannot (font-variation on scroll).
- Every animation must respect `prefers-reduced-motion: reduce` — disable or reduce to opacity-only.
- No layout-shifting animations. Animate transform and opacity only.
- No animation library. If a task seems to need one, stop and ask.

## Layout

- Single page, five sections in order: hero, what-we-make, products, people, footer.
- Products section: editorial list entries, not cards. Slight asymmetric offset is intentional. New products are added as new entries; the pattern must scale to N entries without redesign.
- Sharp corners or one small consistent radius token. 1px solid borders. No drop shadows, no glassmorphism.

## Responsive

- Mobile-first. Test at 390px, 768px, 1440px.
- Hero type must never cause horizontal scroll at any width.
- Touch targets minimum 44px.
