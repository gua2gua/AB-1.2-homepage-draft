# Actionbook Homepage v3 — Team Review

> Archived 2026-07-30. The accepted design was migrated to
> `actionbook-cloud` PR #1687 and merged into `feat/sidebar_chat`.
> This repository is a historical review artifact, not the current homepage.
> Future changes belong in `actionbook-cloud/cloud/website/components/landing-v3/`.

Homepage redesign draft for internal review.

**Preview:** https://gua2gua.github.io/AB-1.2-homepage-draft/

> **DRAFT · CONCEPT ONLY**
>
> This repository is separate from the production website. The preview is public,
> contains mock testimonial identities, and must not be treated as a product release.

## Where to start

- Open [TEAM_HANDOFF.md](TEAM_HANDOFF.md) before changing the page.
- Use [DESIGN_GUIDE.md](DESIGN_GUIDE.md) for the approved visual and interaction rules.
- The current page source is [index-v3.html](index-v3.html).
- GitHub Pages publishes `main`; changes should be proposed through a branch and PR.

## Local preview

```bash
python3 -m http.server 4177
```

Then open `http://127.0.0.1:4177/index-v3.html`.

## Review status

This checkpoint is suitable for team feedback on:

- copy details;
- responsive layout;
- animation timing;
- product-demo fidelity;
- accessibility and reduced-motion behavior.

It is not approval to replace the production homepage.
