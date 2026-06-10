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

**WorkSection.vue** — three blocks: (1) *Currently building* — flagship active projects as cards with live website screenshots (`src/assets/previews/`); (2) *Writing & talks* — a corkboard (`.pinboard`) with the Substack as a pinned polaroid on the left and talks as sticky notes on the right; (3) *From the archive* — a compact grid of past/side projects; (4) *Publications* — five papers on a ruled-paper sheet (`publications` array). Project data lives in arrays at the top of the file.

**Timeline has two views (user-togglable Spiral/List):**
- **RadialTimeline.vue** — a spiral chart rendered as SVG, default on ALL screen sizes. A custom continuous spiral-path generator (Archimedean: radius grows with angle over `turns` winds) draws ONE connected strand, colored by lane segment. Markers sit at each entry's start year; labels ride the arc via `<textPath>` (curved) or fall back to leader lines. Supports toggling between two lane schemes ("By domain" / "By mode of work"). Entries with `details` show a "+ the full story" disclosure in the index card; clicking outside the card closes it. **No D3** — all geometry is hand-rolled math.
- **Vertical list** — card-based view embedded directly in TimelineSection.vue, reachable via the Spiral/List toggle; mirrors the details disclosure.

**Timeline data** (`src/data/timeline.json`): each entry has dual lane assignments (`lanes.where` and `lanes.how`), an `icon` field (null, reserved for future project icons), and an optional `label` override (when present, RadialTimeline shows it on the arc instead of the auto-chosen role/org — e.g. the 2-year Bioinformatician stint is labelled "Marquette University"). By default `displayLabel()` shows the role when an org repeats, else the org. See `src/data/README.md` for the decimal-year encoding.

## Key libraries

- **GSAP** — scroll/reveal animations when the timeline scrolls into view (IntersectionObserver triggers a one-time stagger on `.radial-wrap` / `.tl-card`).
- **Playwright** — dev-only: `scripts/audit-site.mjs` (multi-viewport audit) and `scripts/capture-*.mjs` (preview screenshots into `src/assets/previews/`). Self-verification screenshots are fine; only regenerate the committed preview assets on explicit request. Run scripts from the project dir so `playwright` resolves.

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
- **Timeline at ≤640px (phone)**: the spiral now renders on phones too (reactive `isPhone` via `matchMedia` in RadialTimeline.vue drives a cropped viewBox, bigger fonts, and `shortLabel` abbreviations from timeline.json — BCW/MCW/MU/Marquette/OneCell). A Spiral/List toggle offers the vertical-card fallback; a "tap any dot" hint sits above the chart until first interaction.

---

## Latest Handover: 2026-06-11

### Session summary
Big content + polish session, all committed locally (commits 77872f3 → 5fbabc0). Highlights: full Playwright site audit (zero console errors, images optimized ~3MB → ~900KB); git hygiene (.gitignore, untracked node_modules/dist); phone spiral made fully legible over three feedback rounds (bigger viewBox crop, phone font constants, shortLabel abbreviations, year-label collision fix); "+ the full story" details disclosure built into both the spiral index card and the list cards; `details` bullets populated for nine timeline entries from the user's resume (`/Users/vats/Programming/Resume/config.toml`); new Publications section in Work (5 papers on a ruled sheet); EA Fund entry corrected (present tense, talks removed — it's grant work as a contractor with Effective Ventures); story card now closes on click outside.

### Git
Local repo only — NO remote configured. Offered GitHub push earlier; user hasn't asked. All work committed; tree clean.

### Pending threads

**Deferred (user will initiate):**
1. **Project icons** on the radial — `icon` field in timeline.json, still null.
2. **Real logos** for the 3 *Currently building* cards + vibe-coded side projects for the archive grid.
3. **Hero photo** brightening; **Connect section** expansion; user's "ambitious ideas."
4. **Publications placement** — flagged to user: currently last in Work, after the archive; he may want it moved (e.g., between Writing & talks and the archive). Awaiting his eyeball.
5. **Substack "latest essay"** in WorkSection is hardcoded and will go stale.
6. **OG card / favicon PNG fallback** — designed 1200×630 OG image not yet made.
7. Resume has a **Consultant Bioinformatician (May–Oct 2016)** stint not in timeline.json — folded its content into the Research Assistant details instead; never explicitly approved by user.

### Key context
- **Career facts must come from the user's data** (resume config.toml or his words) — never invent bullets. The details content was sourced from `/Users/vats/Programming/Resume/config.toml`.
- The user authorized Playwright self-verification this session and granted blanket edit/commit permission; the old "never run screenshots" rule is relaxed to "fine for self-checks, user still reviews on his devices."
- `details: []` in timeline.json drives the "+ the full story" toggle in RadialTimeline.vue (`.detail-more`/`.detail-list`) and TimelineSection.vue list cards (`.tl-more`/`.tl-details`).
- Click-outside-to-close lives in RadialTimeline.vue (`onDocumentClick`, guards `.detail-card`/`.marker-hit`/`.entry-group`).
- Talks live ONLY on the Writing & talks corkboard now; publications ONLY in the Publications sheet — don't re-mix either into timeline bullets.

### Resume instructions
1. `npm run dev` (a dev server may already be running on :5173), await the user's review of Publications placement and the EA Fund card.
2. Likely next: logos/icons, OG card, Connect section, or the "ambitious ideas" conversation.

---
*Handover by Claude (Opus 4.8), 2026-06-11.*
