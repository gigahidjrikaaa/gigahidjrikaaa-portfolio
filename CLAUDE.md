# Project Context

## Design Context

### Users

Primary audience is mixed: hiring managers/recruiters, potential clients, and technical peers. Most visitors are evaluating quickly on mobile and desktop to decide whether to contact, hire, or collaborate. The site should support multiple outcomes at once: drive contact inquiries, attract interview/job opportunities, generate client leads, and reinforce technical credibility.

### Brand Personality

Brand personality: smart, all-rounder, fast-learner.
Voice should balance technical depth with approachability. The interface should evoke confidence and trust first, while still feeling premium and creative rather than rigid.

### Aesthetic Direction

Light-first experience.
Core palette must be black and white (shades are flexible), with careful contrast and restrained supporting tones when needed for hierarchy. Visual direction should feel modern, intentional, and high-signal, not boring or plain.

Use authentic visuals (real project/product imagery and personal assets) over generic placeholders. Motion should be purposeful and support comprehension, with reduced-motion-safe behavior by default.

### Design Principles

1. Prioritize conversion clarity: every major section should make next steps obvious (especially contact and proof of capability).
2. Keep the visual system light-first and black/white-led, using contrast, spacing, and typography to create hierarchy before adding color.
3. Show technical credibility through concrete evidence (projects, outcomes, architecture decisions) while keeping language human and approachable.
4. Avoid generic/template-like UI patterns; prefer distinctive composition with consistent spacing, rhythm, and image quality.
5. Treat accessibility as a hard requirement: WCAG AA baseline, keyboard-first interaction, reduced-motion support, and color-blind-safe contrast checks.

## Brand & Visual Identity (verified against code, Oct 2026)

### Logo — "The Node & The Orbit"
- Concept (`src/components/Logo.tsx`): the **G** is abstracted into an enclosing orbital ring (dashed arc, `stroke-dasharray: 180 70`), the orbit's target node is a solid dot, and the **H** becomes two connected vertical nodes (a network/server mark). Represents networking, technology, full-stack connectivity.
- Favicon/`public/logo.svg`: the mark in white on a black rounded tile (`#0A0A0A`, 24px corner radius).
- The mark inherits `currentColor` (monochrome only — never recolor it with brand accents).
- **The `Logo` component is the only brand mark**: it renders in the Navbar (h-7, zinc-900, slow rotate on hover) and the Footer (h-8 + "Giga Hidjrika" wordmark). Never substitute text tiles ("GH") or bracket wordmarks ("[GigaDev]") for it again.

### Typography
- **Headings: Sora** (variable). **Body: Instrument Sans** (variable). Both self-hosted via `next/font/google` in `src/app/layout.tsx`, declared directly as `--font-heading` / `--font-body` on `<html>` (merged resolution Oct 2026: the redesign switched from the original Poppins/Roboto — do not reintroduce those, and never add a Google Fonts `<link>` or CSS `@import`).
- Recurring detail: tiny uppercase labels with wide tracking (`text-[10px] uppercase tracking-[0.2em]`).

### Color System
- **Core: black & white only** (Tailwind `zinc` scale), light-first. **Light-only since the Oct 2026 redesign** — the dark-mode ThemeToggle was removed; `.dark` tokens remain in globals.css but nothing activates them.
- **Emerald `#10B981`** — the single functional accent: "available for work" pulse, success/live states, admin badges. Use for status, never for decoration.
- **Sky `#0EA5E9`–`#38BDF8`** — reserved for the always-dark "Global Presence" section (`#0a0f1e` background) and the globe; signals technology/global reach.
- Neutrals and one dark section provide contrast; hierarchy comes from typography, spacing, and grayscale — not added hues.

### Visual Motifs
- **Polaroid/film cards**: white-framed photos with small monospace captions carrying honest metadata only (name, "Portrait", place, year). Grayscale → color on hover. Fake jargon labels (`IMG_9042`, `SYS_INIT_OK`, `ACT_1`) were removed as AI-slop — do not reintroduce them.
- **Status indicators are calm**: a static emerald dot may mark real semantic state (availability, active project, live count), but no pulsing/`animate-ping` glows and no drop-shadow glows on dots.
- **No neon**: no cyan/pink gradients, glass cards with neon rings, animated corner brackets, or glow shadows. Project cards are white, zinc-bordered, with grayscale-to-color images and zinc-900/outline button pairs.
- **Code/decorative geometry**: `CodeBrackets`, `GridPattern`, `BackgroundBlob`, `OrbitalRings`, `FloatingShapes` (in `components/decorations/`) — subtle, low-opacity, currentColor-based, never competing with content.
- **Orbital/global imagery**: the Three.js globe with pulsing location dots and animated arcs ties back to the logo's orbit concept (globe dots/arcs are the one sanctioned animated-dot context).

### Motion
- Framer Motion throughout; entrance reveals (0.6–1.1s, expo-out easing) and spring-based hover micro-interactions.
- Hard rule: everything respects `prefers-reduced-motion` (global CSS kill-switch + `useReducedMotion()` in components, e.g. globe spin pauses).
- Performance rule: the Three.js globe only mounts when its section enters the viewport; heavy visuals must stay behind `next/dynamic` + visibility gates.
