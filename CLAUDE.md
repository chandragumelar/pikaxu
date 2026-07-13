# CLAUDE.md

## Required Reading
Before any task: read /docs/frontend-SKILL.md for any HTML/CSS/visual work,
and run /docs/qa-SKILL.md gates before declaring done.

## Project

This is the pika-xu studio website: a single-page static site whose purpose is to present the studio's identity and serve as an index of its products. It is served at the domain pika-xu.com and deployed on Cloudflare Pages.

## Stack

- Vite (vanilla, no framework)
- HTML + CSS + minimal JavaScript
- No React, no jQuery, no CSS framework, no animation library (no GSAP)
- Motion: CSS scroll-driven animations + small JS for font-variation only
- Fonts: Google Fonts variable font, self-hosted after design lock

## Structure

```
/src
  /styles
    tokens.css      — all design tokens (colors, spacing, type scale). SOURCE OF TRUTH.
    base.css        — reset + global element styles
    sections/       — one CSS file per page section
  /scripts
    main.js         — entry, imports only
    modules/        — one JS file per behavior (e.g. scroll-type.js)
  index.html
/public             — static assets only (favicons, og-image)
```

One section equals one CSS file, plus one JS module if that section has behavior. When asked to fix or change a feature, locate it by section name first.

## Hard Rules

- All colors, spacing, font sizes MUST reference CSS variables from tokens.css. No hardcoded hex, px spacing, or font-size values in section files.
- tokens.css is a PROTECTED FILE: do not modify without explicit approval in the prompt.
- Do not add any dependency (npm package, CDN script, font) without asking first.
- Never commit: .env, any API key, node_modules, dist. Verify .gitignore covers these before first commit.
- No secrets in frontend code, ever. This site has no backend and needs no keys.

## Code Standards

- Max ~150 lines per file. If exceeded, split by concern.
- One function, one job. No giant util files.
- Descriptive names. No abbreviations.
- No dead code: unused functions, imports, CSS rules must be deleted in the same PR that orphans them.
- No duplicates: if logic appears twice, extract to a shared module and state its path in the PR.
- No magic numbers: values go to tokens.css or a constants module.
- Comments explain WHY, never WHAT.
- Async by default for anything touching network or fonts; never block render.

## Workflow

- One concern per PR.
- Every task ends with: grep gate checks (defined in qa skill) + `npm run build` passing.
- Before fixing a bug, grep for all usages of the code being changed and list affected files in the PR description. A fix that breaks another section is a failed task.
