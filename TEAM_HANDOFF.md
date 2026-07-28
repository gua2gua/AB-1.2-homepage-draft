# Homepage v3 — Team Handoff

## Review link

https://gua2gua.github.io/AB-1.2-homepage-draft/

The link is a public GitHub Pages preview. It is isolated from the production
website repository and does not publish to `actionbook.dev`.

## What this draft is trying to prove

The page should feel like a precise, artful workbench: mostly black and white,
with violet used only for state and emphasis. Product proof stays close to the
real Actionbook UI; the more abstract architectural language is reserved for
explaining product principles.

The current narrative order is:

1. Open Actionbook. Close out web work.
2. See it finish.
3. Off your plate. Not out of your hands.
4. Role use cases: Sales, Marketing, Product, Creator.
5. Solo Founder as the cross-function use-case entry.
6. User testimonials.
7. Final CTA and interactive Actionbook work atlas.

## Edit map

| Area | Primary file | Notes |
| --- | --- | --- |
| Page structure and copy | `index-v3.html` | Source of truth for the review page |
| Layout, visual tokens, motion styling | `homepage-v3.css` | Keep violet restrained |
| Hero → product-proof takeover | `homepage-v3-takeover.js` | Scroll-driven; preserve reverse-scroll response |
| Four role scenes and Solo Founder | `homepage-v3-roles.js` | Solo panel intentionally covers the role illustration, not its headline |
| Trust illustration interactions | `homepage-v3-trust.js` | Hover-first; clicks are optional discoveries |
| Final work-atlas playground | `homepage-v3-brand-v2.js` | Large Actionbook wordmark and pointer-follow response are approved |
| LinkedIn product demo | `assets/linkedin-prospecting-motion.html` | Realistic browser + sidebar UI |
| Weekly report demo | `assets/weekly-report-motion.html` | Recipe/repeat workflow |
| Creator report demo | `assets/creator-performance-motion.html` | Dashboard and source-linked reporting |
| Mock testimonial avatars | `assets/mock-avatar-*.svg` | Replace when approved Pro C references arrive |
| Previous interactive experiment | `_rollback/` | Kept only as a rollback reference |

## Locked direction

- Preserve the existing story and section order unless the change is explicitly
  an information-architecture proposal.
- Keep the Hero and product-proof section faithful to real product behavior.
- Keep Sales → Marketing → Product → Creator in that order.
- Keep Solo Founder as a compact cross-function use-case entry, not a fifth
  full role demo.
- Keep testimonial cards as two full rows moving gently in opposite directions.
- Keep the large `Actionbook` wordmark, black reveal mask, and pointer-follow
  behavior in the final playground.
- Do not use the Actionbook bow-tie / natural-join mark as a generic icon. Use it
  only where the concept is explicitly joining sources, work, or roles.

## Known placeholders

- Testimonial names, companies, roles, quotes, and avatars are mock data.
- Some use-case and footer links are placeholders or route to broad use-case
  pages.
- Demo datasets and dashboard values illustrate the interaction; they are not
  customer claims.
- CTA links are visual review targets, not the production acquisition flow.

## How to propose a detail change

1. Create a branch from `main`.
2. Change the smallest relevant file from the edit map above.
3. Preview locally at `http://127.0.0.1:4177/index-v3.html`.
4. In the PR, include:
   - section name;
   - before/after screenshot;
   - intended user-reading or interaction improvement;
   - desktop and mobile notes;
   - whether the change affects a locked direction.
5. Do not push directly to `main`; merging to `main` republishes the public review
   link.

## Minimum checks

```bash
node --check homepage-v3-takeover.js
node --check homepage-v3-trust.js
node --check homepage-v3-roles.js
node --check homepage-v3-brand-v2.js
git diff --check
```

Also review the full page at desktop width and around 720px width, then verify
`prefers-reduced-motion`.
