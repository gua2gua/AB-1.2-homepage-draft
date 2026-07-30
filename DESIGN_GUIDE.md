# Homepage v3 — Design Guide

> Archived 2026-07-30. This is the static review checkpoint's historical
> contract. The current engineering guide is
> `actionbook-cloud/cloud/website/design/homepage-design-guide.md` in PR #1596,
> grounded in the accepted `landing-v3` implementation from PR #1687.

This file records the review checkpoint's working visual contract. It is not a
replacement for the production design system.

## Tone

Precise workbench + architectural drawing + restrained editorial art.

The page should feel engineered but not cold, refined but not decorative, and
capable without becoming a generic AI dashboard.

## Color

- Base: white and near-white surfaces.
- Type and structure: black, charcoal, and neutral gray.
- Accent: violet only for active state, focus, progress, or a small moment of
  emphasis.
- Avoid large violet washes, especially inside realistic product UI.
- Do not use green as a general brand accent; it may appear only when the real
  product state requires it.

## Typography and density

- Geist Sans for product and editorial hierarchy.
- Geist Mono for labels, receipts, coordinates, and technical annotations.
- Microcopy must earn its place. If it cannot be read comfortably or does not
  clarify state, remove it.
- A section gets one dominant reading path. Avoid two independent animations
  asking for attention at the same time.

## Illustration boundary

- Product-proof scenes: realistic Actionbook browser/sidebar UI, believable
  inputs, visible progress, and a finished artifact.
- Product-principle scenes: architectural line drawings grounded in a real
  feature.
- Role scenes: intermediate product illustrations—recognizable workflows
  without reproducing the entire application window.
- Decorative grid is local scaffolding, not a full-page wallpaper.

## Motion

- Motion begins on hover or scroll where the interaction calls for it.
- Click is an optional discovery, not the primary animation trigger.
- Motion must communicate a state transition: read, join, confirm, source,
  finish, reuse, or reveal.
- Scroll takeovers must respond in both directions and never trap the user.
- Use a deliberate final hold so text and product animation finish together.
- Respect `prefers-reduced-motion`.

## Brand mark

The Actionbook bow-tie is derived from the mathematical natural-join symbol. It
is not a generic decoration, bullet, confirmation mark, or cursor. Use it only
when the visual meaning is genuinely about joining sources, work, or roles.

## Product truth

- Remove all Beta labeling from this homepage concept.
- Never imply that Actionbook sent, posted, or changed something when the demo
  only researched or drafted it.
- Show sources when the claim is grounded.
- Show confirmation and pause/stop controls when user control is the point.
- Treat Recipes as reusable user methods that make later runs faster and less
  wasteful.
