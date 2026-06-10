# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Vatsal Mehra's personal portfolio website — a single-page site built with Vue 3, Vite, and no router. Section order: hero → timeline → work → connect. (A Notes section existed earlier and was removed.)

## Commands

- `npm run dev` — start dev server (Vite, usually port 5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build locally

No test runner, linter, or formatter is configured.

## Architecture

**App.vue** is a thin shell that composes section components and wires up cross-component communication (e.g., "Open timeline" in the nav/hero triggers `TimelineSection.open()` via a template ref).

**Section components** (`src/components/`): TopBar, HeroSection, TimelineSection, WorkSection, ConnectSection. Each owns its markup, logic, and scoped styles. Global styles (CSS variables, resets, typography) live in `src/styles.css`.

**HeroSection.vue** — a "field-board" pinboard: pinned portrait polaroid + three artifact cards (current question / mode / looking for) connected by SVG threads.

**WorkSection.vue** — three blocks: (1) *Currently building* — flagship active projects as cards with live website screenshots (`src/assets/previews/`); (2) *Writing & talks* — a corkboard (`.pinboard`) with the Substack as a pinned polaroid on the left and talks as sticky notes on the right; (3) *More projects* — a compact grid of past/side projects. Project data lives in arrays at the top of the file.

**Timeline has two views:**
- **RadialTimeline.vue** (tablet + desktop, >640px) — a spiral chart rendered as SVG. A custom continuous spiral-path generator (Archimedean: radius grows with angle over `turns` winds) draws ONE connected strand, colored by lane segment. Markers sit at each entry's start year; labels ride the arc via `<textPath>` (curved) or fall back to leader lines. Supports toggling between two lane schemes ("By domain" / "By mode of work"). **No D3** — all geometry is hand-rolled math; `d3` remains in package.json but is unused.
- **Vertical timeline** (phone, <=640px) — card-based fallback embedded directly in TimelineSection.vue. Phones keep cards by design (radial labels become unreadable + no hover for tooltips on touch).

**Timeline data** (`src/data/timeline.json`): each entry has dual lane assignments (`lanes.where` and `lanes.how`), an `icon` field (null, reserved for future project icons), and an optional `label` override (when present, RadialTimeline shows it on the arc instead of the auto-chosen role/org — e.g. the 2-year Bioinformatician stint is labelled "Marquette University"). By default `displayLabel()` shows the role when an org repeats, else the org. See `src/data/README.md` for the decimal-year encoding.

## Key libraries

- **GSAP** — scroll/reveal animations when the timeline scrolls into view (IntersectionObserver triggers a one-time stagger on `.radial-wrap` / `.tl-card`).
- **D3** — listed in package.json but no longer imported anywhere; spiral geometry was rewritten as plain math. Safe to remove if pruning deps.
- **Playwright** — dev-only, used by the scripts in `scripts/` to capture website preview screenshots into `src/assets/previews/`. Do NOT run screenshot tooling unless the user explicitly asks.

## Design system

CSS custom properties defined in `:root` in `styles.css`: `--bg`, `--ink`, `--muted`, `--line`, `--green`, `--blue`, `--coral`, `--yellow`, `--paper`, `--paper-alt`. Font stacks: `--serif` (Georgia), `--sans` (Avenir Next), `--mono` (SFMono). The visual style is a paper/pinboard aesthetic with subtle grain overlay and grid background.

## Lane color mapping

Lane colors are defined in both RadialTimeline.vue and TimelineSection.vue and must stay in sync:
- Education / Learning: blue (#2c6f93)
- Research & Visualization / Building: green (#0f7b66)
- Product & Industry / Leading: coral (#d75f49)
- Pedagogy & Community / Teaching: yellow (#e2b84b)

## Responsive breakpoints

- **Building cards** (`.building-grid`) use `auto-fit, minmax(min(100%, 260px), 1fr)` to flow 3 → 2 → 1 columns by available width (avoids a giant full-width card on tablets).
- **Timeline** swaps radial → vertical cards at **640px** (`TimelineSection.vue` media query). Tablets get the spiral; phones get cards.

---

## Latest Handover: 2026-06-10

### Session summary
The radial spiral is approved and stable. This session: removed the Notes section and reordered to hero → timeline → work → connect; redesigned Work into *Currently building* (screenshot cards), a *Writing & talks* corkboard (polaroid + sticky notes), and *More projects*; renamed the "Education & Community" lane to "Pedagogy & Community"; added an optional `label` override to timeline.json (the 2-year Bioinformatician stint now reads "Marquette University" on the arc). Fixed two responsive bugs: building cards now auto-flow 3→2→1 columns, and the radial breakpoint moved 768px → 640px so tablets get the spiral. Phones keep the vertical cards by the user's explicit choice.

### Not a git repository
No version control here — work exists only on disk. Nothing to commit/push.

### Pending threads

**Deferred:**
1. **Project icons** on the radial chart for self-started projects — `icon` field exists in timeline.json (currently null). User wants this later.
2. **Real logos** for the 3 *Currently building* cards, and **vibe-coded side projects** to add to *More projects* — user said he'd provide these later.
3. **Hero photo** — earlier mention of brightening it; not acted on.
4. **Connect section** — flesh out with more links; not yet revisited.
5. **"Ambitious ideas"** — user has bigger plans for the site to discuss after foundational work.
6. **(Optional) phone-native radial** — user chose to keep cards on phones for now; revisit only if asked.

### Key context
- Visual correctness ≠ clean build. The user reviews via screenshots and catches subtle layout issues. Restate the structural cause of a visual bug before coding.
- Do NOT run Playwright/screenshot scripts unless the user explicitly asks. The user will report visual errors himself.
- Preview screenshots are committed static assets in `src/assets/previews/`; regenerate via `scripts/capture-*.mjs` only on request.

### Learnings captured
- [x] Project memory at `~/.claude/projects/-Users-vats-Programming-personal-website/memory/` (radial-timeline-design-intent, user-design-iteration-style, project-state-2026-06).
- [x] Architecture + this handover refreshed in CLAUDE.md.

### Resume instructions
1. `npm run dev`, then await the user's next visual direction — most foundational pieces are in place.
2. Likely next asks: project icons on the radial, real logos for building cards, or the user's "ambitious ideas."

---
*Handover by Claude (Opus 4.8).*
