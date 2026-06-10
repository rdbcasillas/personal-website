# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Vatsal Mehra's personal portfolio website — a single-page site built with Vue 3, Vite, and no router. Sections: hero, work, timeline, notes, connect.

## Commands

- `npm run dev` — start dev server (Vite, usually port 5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build locally

No test runner, linter, or formatter is configured.

## Architecture

**App.vue** is a thin shell that composes section components and wires up cross-component communication (e.g., "Open timeline" in the nav/hero triggers `TimelineSection.open()` via a template ref).

**Section components** (`src/components/`): TopBar, HeroSection, WorkSection, TimelineSection, NotesSection, ConnectSection. Each owns its markup, logic, and scoped styles. Global styles (CSS variables, resets, typography) live in `src/styles.css`.

**Timeline has two views:**
- **RadialTimeline.vue** (desktop, >768px) — a D3-powered spiral chart rendered as SVG. Uses a custom spiral arc path generator (not D3's arc), where radius increases with angle to create a continuous spiral. Entries are color-coded by lane category. Supports toggling between two lane categorization schemes ("By domain" / "By mode of work") defined in the data.
- **Vertical timeline** (mobile, <=768px) — card-based fallback embedded directly in TimelineSection.vue.

**Timeline data** (`src/data/timeline.json`): each entry has dual lane assignments (`lanes.where` and `lanes.how`) for the two categorization schemes, plus an `icon` field (currently null, reserved for future project icons). See `src/data/README.md` for the decimal-year encoding and field descriptions.

## Key libraries

- **D3** — used only in RadialTimeline for spiral geometry math. No DOM manipulation; all rendering is Vue template-driven SVG.
- **GSAP** — used for scroll/reveal animations when the timeline opens (stagger animation on mobile vertical cards).

## Design system

CSS custom properties defined in `:root` in `styles.css`: `--bg`, `--ink`, `--muted`, `--line`, `--green`, `--blue`, `--coral`, `--yellow`, `--paper`, `--paper-alt`. Font stacks: `--serif` (Georgia), `--sans` (Avenir Next), `--mono` (SFMono). The visual style is a paper/pinboard aesthetic with subtle grain overlay and grid background.

## Lane color mapping

Lane colors are defined in both RadialTimeline.vue and TimelineSection.vue and must stay in sync:
- Education / Learning: blue (#2c6f93)
- Research & Visualization / Building: green (#0f7b66)
- Product & Industry / Leading: coral (#d75f49)
- Education & Community / Teaching: yellow (#e2b84b)

---

## Latest Handover: 2026-06-10

### Session summary
Refactored the monolithic App.vue into per-section components, improved the copy site-wide, reworked the hero (cards, links, portrait, subtitle), and replaced the old multi-lane timeline with a dual-view system: vertical cards on mobile, a D3 spiral radial chart on desktop. Added `d3`, reworked `timeline.json` (dual lane schemes + reserved `icon` field), and created this CLAUDE.md.

### Not a git repository
No version control here — work exists only on disk. Nothing to commit/push.

### Pending threads

**Continue immediately:**
1. **Radial spiral polish (RadialTimeline.vue)** — NOT approved by user yet. Latest iteration uses a custom continuous spiral-path generator (correct direction). Next: confirm with the user that the spiral reads as one connected journey; decide whether the clustered end-of-timeline parallel projects (Portal / Rational Resilience / workshops / fellowship) need stacked arcs or a single arc with branch labels. The user has rejected disconnected concentric segments multiple times — the spiral MUST be continuous.

**Deferred:**
1. **Project icons** on the radial chart for self-started projects — `icon` field exists in timeline.json (currently null). User wants this later.
2. **"Ambitious ideas"** — user said he has bigger plans for the site to discuss after these foundational tasks.

### Key context
- Visual correctness ≠ clean build. The user reviews via screenshots and catches subtle layout issues. Restate the structural cause of a visual bug before coding.
- D3 is used only for spiral geometry math; all SVG is Vue-template-driven.
- A `npm run dev` server may still be running in the background on port 5173 from earlier this session.

### Learnings captured
- [x] Project memory written to `~/.claude/projects/-Users-vats-Programming-personal-website/memory/` (radial-timeline-design-intent, user-design-iteration-style, project-state-2026-06) with MEMORY.md index.
- [x] Architecture + this handover in CLAUDE.md.

### Resume instructions
1. Run `npm run dev`, open the timeline, and ask the user for a screenshot/verdict on the current radial spiral.
2. Iterate on the spiral per the design intent (continuous path, minimal year labels, modest radius growth) until approved.
3. Then move to project icons, then the user's larger ideas.

---
*Handover by Claude at end of session (model switched to Opus 4.8 for next instance).*
