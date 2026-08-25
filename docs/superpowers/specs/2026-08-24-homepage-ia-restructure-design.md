# Homepage Information Architecture Restructure — Design

Date: 2026-08-24
Status: Approved

## Problem

The homepage stacks 17 sections (~11,000px desktop / ~14,600px mobile). Projects —
the primary proof of capability — sit at position #13. Recruiters evaluating in
60 seconds rarely reach proof or contact. This contradicts the project's own
design principle #1: "Prioritize conversion clarity."

## Goal

Tight homepage where proof arrives within one scroll, demoted content preserved
on a dedicated page, and all admin-managed content stays reachable.

## Design

### Homepage section order (`frontend/src/app/page.tsx`)

1. Hero
2. Projects (was #13)
3. Highlights — "Three ways to work"
4. About
5. Experience
6. Education
7. Skills (TechStackMarquee removed — redundant with Skills)
8. Testimonials
9. ArticlesPreview
10. "Know more" band (new, slim link band) → `/more`
11. Contact

### New route `/more` (`frontend/src/app/more/page.tsx`)

Hosts the demoted sections in narrative order:

1. Awards
2. Certificates
3. Clients
4. PressMentions
5. GitHubIntegration
6. Stories
7. VisitorMap

Server component wrapper with page metadata ("Know more — Giga Hidjrika") and a
short intro header. Standard Navbar/Footer apply via root layout. Components
render unchanged; all keep their hardened fetch/error behavior.

### Supporting changes

- **Navbar**: anchor links become `/#about`, `/#experience`, `/#projects`,
  `/#skills`, `/#contact` (and CTA `/#contact`) so they resolve from `/more` and
  `/blog` (fixes pre-existing broken anchors off the homepage).
- **Footer**: add "Know more" link to `/more`.
- **Sitemap**: add `/more` entry.
- **No new visual components** except the slim "Know more" band.

### Explicitly out of scope

- Visual restyling of moved sections (later `/normalize` pass).
- SSR/ISR for homepage sections (separate follow-up).
- Deleting any component code — demoted components stay importable.

## Verification

- `tsc --noEmit`, `next lint`, `next build` all clean.
- Manual: `/` renders 11 blocks in order; `/more` renders 7 sections; navbar
  anchors work from both routes.
