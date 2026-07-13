---
name: qa
description: Definition of done and verification gates for the pika-xu studio website. Run before declaring any task complete.
---

## Definition of Done

A task is done only when ALL of the following pass:

1. `npm run build` exits 0.
2. Grep gates (below) all pass.
3. Page renders correctly at 390px, 768px, 1440px (describe what was checked).
4. No console errors or warnings in the browser.
5. No horizontal scrollbar at any tested width.
6. `prefers-reduced-motion` verified if the task touched any animation.
7. Impact check: list every file that imports or references the changed code; confirm each still works.

## Grep Gates

Run and report results of each:

```
# No hardcoded colors outside tokens.css
grep -rn "#[0-9a-fA-F]\{3,8\}" src/styles/sections/ src/scripts/ && echo "FAIL: hardcoded hex" || echo "PASS"

# No dead exports: every export in modules/ must have an import elsewhere
# (list each export, grep for its usage, report any with zero hits)

# No duplicate function bodies: scan modules/ for near-identical functions, report findings

# No secrets
grep -rniE "(api[_-]?key|secret|token=)" src/ && echo "REVIEW NEEDED" || echo "PASS"

# .gitignore sanity
grep -q "node_modules" .gitignore && grep -q ".env" .gitignore && grep -q "dist" .gitignore && echo "PASS" || echo "FAIL"
```

## Performance Budget

- Total page weight under 300KB (excluding fonts), fonts under 200KB.
- Lighthouse: Performance ≥ 95, Accessibility ≥ 95 on mobile preset.
- Font loading: `font-display: swap` + size-adjust fallback to prevent CLS.

## When a Bug Is Fixed

- State the root cause in one sentence.
- List all call sites of the changed code and confirm each was re-checked.
- If the fix required touching a second module, that is a signal the task should have been two PRs — note it.
