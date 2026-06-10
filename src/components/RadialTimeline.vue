<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import timelineData from "../data/timeline.json";

const props = defineProps({
  visible: Boolean,
});

const svgRef = ref(null);
// Single lane scheme: "By domain". (A "how" scheme still exists in the data
// but the UI toggle was removed — domain categories are the keepers.)
const activeScheme = ref("where");
const hoveredEntry = ref(null);
const tooltipPos = ref({ x: 0, y: 0 });
// Strand/markers/labels stay hidden (via CSS) until the draw animation takes over.
const pendingDraw = ref(true);

const schemes = timelineData.laneSchemes;
const entries = timelineData.entries;

const startYear = timelineData.startYear;
const endYear = timelineData.endYear;
const currentYear = new Date().getFullYear();

const laneColors = {
  Education: "#2c6f93",
  "Research & Visualization": "#0f7b66",
  "Product & Industry": "#d75f49",
  "Pedagogy & Community": "#e2b84b",
  Learning: "#2c6f93",
  Building: "#0f7b66",
  Leading: "#d75f49",
  Teaching: "#e2b84b",
};

// Text needs more contrast than strands: yellow is illegible on paper,
// so labels/tooltips use a darker ochre while arcs keep the bright yellow.
const labelColors = {
  ...laneColors,
  "Pedagogy & Community": "#a8842c",
  Teaching: "#a8842c",
};

// --- Geometry ---------------------------------------------------------------
const size = 820;
const cx = size / 2;
const cy = size / 2;

const turns = 2; // how many times the spiral winds (gives the spiral look with limited years)
const innerRadius = 70;
const outerRadius = 300; // radius at the final year
const arcWidth = 14; // thickness of each strand
const trackGap = 4; // radial gap between concurrent strands
const pathSteps = 80;

const startAngle = -Math.PI / 2; // 12 o'clock
const angleSpan = turns * 2 * Math.PI;

const currentLanes = computed(() => schemes[activeScheme.value].lanes);

function getLane(entry) {
  return entry.lanes[activeScheme.value];
}

function yearToT(year) {
  return (year - startYear) / (endYear - startYear);
}

function yearToAngle(year) {
  return startAngle + yearToT(year) * angleSpan;
}

// Base spiral radius for a given year (before per-track offset)
function yearToRadius(year) {
  return innerRadius + yearToT(year) * (outerRadius - innerRadius);
}

function ptX(angle, r) {
  return cx + Math.cos(angle) * r;
}

function ptY(angle, r) {
  return cy + Math.sin(angle) * r;
}

// Greedy lane packing so concurrent entries land on separate strands
function assignTracks(items) {
  const sorted = [...items].sort((a, b) => a.start - b.start);
  const trackEnds = [];
  return sorted.map((item) => {
    let track = trackEnds.findIndex((end) => item.start >= end - 0.01);
    if (track === -1) track = trackEnds.length;
    trackEnds[track] = item.end;
    return { ...item, track };
  });
}

const trackedEntries = computed(() => assignTracks(entries));

// Primary entries (track 0) form the single visible strand.
// Concurrent entries (track > 0) become markers + labels pointing at the strand.
const primaryEntries = computed(() =>
  trackedEntries.value.filter((e) => e.track === 0)
);

// Centerline path for a span, drawn as a stroked spiral segment on the main strand
function spiralCenterPath(startY, endY) {
  let d = "";
  for (let i = 0; i <= pathSteps; i++) {
    const t = i / pathSteps;
    const year = startY + t * (endY - startY);
    const angle = yearToAngle(year);
    const r = yearToRadius(year);
    const x = ptX(angle, r);
    const y = ptY(angle, r);
    d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }
  return d;
}

// Faint full-length guide spiral (fills the small gaps between primary segments)
const guidePath = computed(() => spiralCenterPath(startYear, endYear));

// Colored segments of the single strand. Each segment runs until the next
// primary role begins so the strand reads as one continuous journey with no gaps.
const strandSegments = computed(() => {
  const prim = primaryEntries.value; // already sorted by start
  return prim.map((entry, i) => {
    const lane = getLane(entry);
    const segEnd = i < prim.length - 1 ? prim[i + 1].start : endYear;
    return {
      ...entry,
      lane,
      color: laneColors[lane],
      path: spiralCenterPath(entry.start, segEnd),
    };
  });
});

// Organizations that appear more than once are labelled by role instead,
// so repeats (e.g. Marquette University) don't read as duplicates.
const orgCounts = entries.reduce((acc, e) => {
  acc[e.organization] = (acc[e.organization] || 0) + 1;
  return acc;
}, {});

function displayLabel(entry) {
  if (entry.label) return entry.label; // explicit override (e.g. show the place, not the role)
  return orgCounts[entry.organization] > 1 ? entry.title : entry.organization;
}

// Only label years that actually start/end an entry, capped at the present (2026)
const relevantYears = computed(() => {
  const years = new Set([2006, 2026]);
  entries.forEach((e) => {
    years.add(Math.round(e.start));
    if (e.end < endYear) years.add(Math.round(e.end));
  });
  return [...years].filter((y) => y <= 2026).sort((a, b) => a - b);
});

function tickMark(year) {
  const angle = yearToAngle(year);
  const r = yearToRadius(year);
  return {
    x1: ptX(angle, r - arcWidth),
    y1: ptY(angle, r - arcWidth),
    x2: ptX(angle, r + arcWidth),
    y2: ptY(angle, r + arcWidth),
    lx: ptX(angle, r + arcWidth + 12),
    ly: ptY(angle, r + arcWidth + 12),
  };
}

// Bumped from 12 for readability; fitsCurved() uses this to decide if a
// label still fits along its arc, so keep the constant in sync with the CSS.
const curvedFontSize = 13.5;
const leaderFontSize = 13.5;

// Phone: the SVG renders at ~0.44 scale (viewBox 820 → ~360px wide), so
// curved labels need a much larger font to be legible. Only the arcs long
// enough to host text at this size keep their label — the rest rely on the
// tap-to-explore card. Keep in sync with the 640px media query CSS.
const phoneCurvedFontSize = 24;
const phoneQuery =
  typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)") : null;
const isPhone = ref(phoneQuery ? phoneQuery.matches : false);
const onPhoneChange = (e) => (isPhone.value = e.matches);

// Desktop keeps wide margins for leader-line labels; the phone has none of
// those, so crop the viewBox tight around the spiral to render it larger.
const chartViewBox = computed(() =>
  isPhone.value ? "25 25 770 770" : `-70 -70 ${size + 140} ${size + 140}`
);
const curvedOffset = arcWidth / 2 + 10; // radial distance of curved text from strand center

// A path that text rides along, just outside the arc. Reversed on the lower
// half so the text stays upright (left-to-right) instead of upside-down.
function arcTextPath(startY, endY) {
  const midAngle = yearToAngle((startY + endY) / 2);
  const flip = Math.sin(midAngle) > 0.02;
  // Flipped (lower-half) text body extends radially INWARD from its baseline.
  // At the phone font size that buries it in the strand; pushing it outward
  // instead collides with the year ticks. So on phone, flipped labels sit
  // just inside the strand — the gap between winds has plenty of room.
  const radialOffset =
    flip && isPhone.value ? -(arcWidth / 2 + 6) : curvedOffset;
  const pts = [];
  for (let i = 0; i <= pathSteps; i++) {
    const t = i / pathSteps;
    const year = startY + t * (endY - startY);
    const angle = yearToAngle(year);
    const r = yearToRadius(year) + radialOffset;
    pts.push([ptX(angle, r), ptY(angle, r)]);
  }
  if (flip) pts.reverse();
  return pts
    .map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1))
    .join("");
}

// Does the label fit along its arc? If not, it gets a leader line instead.
// On phone the threshold uses the larger phone font, so only a few long
// arcs keep curved labels (leader labels are hidden entirely there).
function fitsCurved(entry) {
  const midR = yearToRadius((entry.start + entry.end) / 2) + curvedOffset;
  const arcLen = Math.abs(yearToAngle(entry.end) - yearToAngle(entry.start)) * midR;
  const fontSize = isPhone.value ? phoneCurvedFontSize : curvedFontSize;
  const textLen = displayLabel(entry).length * fontSize * 0.6;
  return arcLen > textLen + 12;
}

// Primary segments long enough to host their name along the arc
const curvedLabels = computed(() =>
  primaryEntries.value.filter(fitsCurved).map((entry, idx) => {
    const lane = getLane(entry);
    return {
      ...entry,
      lane,
      color: laneColors[lane],
      labelColor: labelColors[lane],
      label: displayLabel(entry),
      pathId: `arc-text-${idx}-${activeScheme.value}`,
      textPath: arcTextPath(entry.start, entry.end),
    };
  })
);

// A marker at every entry's start year
const allMarkers = computed(() =>
  trackedEntries.value.map((entry) => {
    const lane = getLane(entry);
    const angle = yearToAngle(entry.start);
    const r = yearToRadius(entry.start);
    return {
      ...entry,
      lane,
      color: laneColors[lane],
      labelColor: labelColors[lane],
      mx: ptX(angle, r),
      my: ptY(angle, r),
    };
  })
);

// Leader-line labels: concurrent entries + any arc too short for curved text
function resolveLeaderLabels(list) {
  const items = list.map((entry) => {
    const lane = getLane(entry);
    const angle = yearToAngle(entry.start);
    const outerR = yearToRadius(entry.start) + arcWidth / 2;
    const labelR = outerR + 26;
    const deg = (((angle * 180) / Math.PI) % 360 + 360) % 360;
    const anchor = deg > 90 && deg < 270 ? "end" : "start";
    return {
      ...entry,
      lane,
      color: laneColors[lane],
      labelColor: labelColors[lane],
      label: displayLabel(entry),
      lx: ptX(angle, labelR),
      ly: ptY(angle, labelR),
      anchor,
      connX1: ptX(angle, outerR + 2),
      connY1: ptY(angle, outerR + 2),
      connX2: ptX(angle, labelR - 5),
      connY2: ptY(angle, labelR - 5),
    };
  });

  items.sort((a, b) => a.ly - b.ly);
  const minGap = 18;
  for (let pass = 0; pass < 8; pass++) {
    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1];
      const curr = items[i];
      if (Math.abs(curr.lx - prev.lx) < 170 && curr.ly - prev.ly < minGap) {
        curr.ly = prev.ly + minGap;
      }
    }
  }
  return items;
}

const leaderLabels = computed(() =>
  resolveLeaderLabels(
    trackedEntries.value.filter((e) => e.track > 0 || !fitsCurved(e))
  )
);

function onArcEnter(entry, event) {
  hoveredEntry.value = entry;
  updateTooltipPos(event);
}
function onArcMove(entry, event) {
  updateTooltipPos(event);
}
function onArcLeave() {
  hoveredEntry.value = null;
}
function updateTooltipPos(event) {
  const svg = svgRef.value;
  if (svg) {
    const rect = svg.getBoundingClientRect();
    tooltipPos.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
}

// --- Storytelling: click/tap an entry to open its index card ------------------
const selectedEntry = ref(null);
const hasExplored = ref(false);

// allMarkers is enriched (lane/color for the active scheme) and chronological
const chronological = computed(() => allMarkers.value);

function isSameEntry(a, b) {
  return a && b && a.title === b.title && a.start === b.start;
}

function selectEntry(entry) {
  hasExplored.value = true;
  if (isSameEntry(selectedEntry.value, entry)) {
    selectedEntry.value = null; // tap again to dismiss
    return;
  }
  selectedEntry.value =
    chronological.value.find((m) => isSameEntry(m, entry)) || entry;
}

const selectedIndex = computed(() =>
  selectedEntry.value
    ? chronological.value.findIndex((m) => isSameEntry(m, selectedEntry.value))
    : -1
);

function stepSelection(dir) {
  const next = chronological.value[selectedIndex.value + dir];
  if (next) selectedEntry.value = next;
}

// While an entry is selected, the whole strand dims and a highlight overlay
// traces that entry's actual start→end span (concurrent entries don't own a
// base segment, so they need their own path anyway).
const selectedSpan = computed(() => {
  const sel = selectedEntry.value;
  if (!sel) return null;
  return {
    path: spiralCenterPath(sel.start, Math.min(sel.end, endYear)),
    color: sel.color,
  };
});

function segOpacity(seg) {
  if (selectedEntry.value) return 0.25;
  return hoveredEntry.value && hoveredEntry.value.title === seg.title ? 1 : 0.85;
}

function markerR(m) {
  if (isSameEntry(m, selectedEntry.value)) return 8;
  return hoveredEntry.value && hoveredEntry.value.title === m.title ? 7 : 5;
}

// --- Draw-on-scroll animation -----------------------------------------------
// The strand draws itself chronologically (stroke-dashoffset), markers pop and
// labels fade in as the strand reaches their start year. Runs once.

function runDrawAnimation() {
  const svg = svgRef.value;
  if (!svg) {
    pendingDraw.value = false;
    return;
  }

  const segEls = Array.from(svg.querySelectorAll(".strand-seg"));
  const markerEls = Array.from(svg.querySelectorAll(".strand-marker"));
  const labelEls = Array.from(svg.querySelectorAll(".entry-group"));
  const prim = primaryEntries.value;

  const lens = segEls.map((el) => el.getTotalLength());
  const totalLen = lens.reduce((a, b) => a + b, 0);
  if (!totalLen) {
    pendingDraw.value = false;
    return;
  }
  const drawDur = 2.4;

  // Each segment owns a time window proportional to its arc length, so the pen
  // moves at constant speed along the whole strand.
  let tAcc = 0;
  const windows = prim.map((entry, i) => {
    const dur = (lens[i] / totalLen) * drawDur;
    const segEnd = i < prim.length - 1 ? prim[i + 1].start : endYear;
    const w = { start: entry.start, end: segEnd, t0: tAcc, dur };
    tAcc += dur;
    return w;
  });

  // When does the pen reach a given year?
  function timeOfYear(year) {
    const w = windows.find((win) => year < win.end) || windows[windows.length - 1];
    const f = Math.min(1, Math.max(0, (year - w.start) / (w.end - w.start || 1)));
    return w.t0 + f * w.dur;
  }

  // Prime initial states before unhiding, then let GSAP own the elements.
  segEls.forEach((el, i) =>
    gsap.set(el, { strokeDasharray: lens[i], strokeDashoffset: lens[i] })
  );
  gsap.set(markerEls, { opacity: 0, attr: { r: 0 } });
  gsap.set(labelEls, { opacity: 0 });
  pendingDraw.value = false;

  const tl = gsap.timeline();
  segEls.forEach((el, i) => {
    tl.to(
      el,
      { strokeDashoffset: 0, duration: windows[i].dur, ease: "none" },
      windows[i].t0
    );
  });

  // Markers pop as the strand passes them (same order as trackedEntries)
  const markerEntries = trackedEntries.value;
  markerEls.forEach((el, i) => {
    const entry = markerEntries[i];
    if (!entry) return;
    tl.to(
      el,
      { opacity: 1, attr: { r: 5 }, duration: 0.35, ease: "back.out(2.4)" },
      timeOfYear(entry.start)
    );
  });

  // Labels (curved first, then leader groups — matches DOM order)
  const labelEntries = [...curvedLabels.value, ...leaderLabels.value];
  labelEls.forEach((el, i) => {
    const entry = labelEntries[i];
    if (!entry) return;
    tl.to(
      el,
      { opacity: 1, duration: 0.5, ease: "power2.out" },
      timeOfYear(entry.start) + 0.15
    );
  });
}

onMounted(() => {
  const svg = svgRef.value;
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!svg || reduceMotion || typeof IntersectionObserver === "undefined") {
    pendingDraw.value = false;
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          observer.disconnect();
          runDrawAnimation();
        }
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(svg);
});

onMounted(() => phoneQuery && phoneQuery.addEventListener("change", onPhoneChange));
onUnmounted(() => phoneQuery && phoneQuery.removeEventListener("change", onPhoneChange));
</script>

<template>
  <div class="radial-wrap">
    <div class="radial-legend">
      <span v-for="lane in currentLanes" :key="lane" class="legend-item">
        <span class="legend-dot" :style="{ background: laneColors[lane] }"></span>
        {{ lane }}
      </span>
    </div>

    <p v-if="!hasExplored" class="tap-hint">
      <span class="tap-hint-arrow" aria-hidden="true">↓</span>
      Tap any dot to read that chapter
      <span class="tap-hint-alt">prefer plain reading? flip to "List" above</span>
    </p>

    <div class="radial-chart-container">
      <svg
        ref="svgRef"
        class="radial-svg"
        :class="{ 'draw-pending': pendingDraw, unexplored: !hasExplored }"
        :viewBox="chartViewBox"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Center label -->
        <text :x="cx" :y="cy - 12" text-anchor="middle" class="center-label">2006 –</text>
        <text :x="cx" :y="cy + 22" text-anchor="middle" class="center-label">{{ currentYear }}</text>

        <!-- Faint guide spiral -->
        <path
          :d="guidePath"
          fill="none"
          stroke="var(--ink)"
          stroke-opacity="0.06"
          :stroke-width="arcWidth + 6"
          stroke-linecap="round"
        />

        <!-- Year ticks + labels -->
        <g v-for="year in relevantYears" :key="'tick-' + year">
          <line
            :x1="tickMark(year).x1"
            :y1="tickMark(year).y1"
            :x2="tickMark(year).x2"
            :y2="tickMark(year).y2"
            stroke="var(--ink)"
            stroke-opacity="0.18"
            stroke-width="1"
          />
          <text
            :x="tickMark(year).lx"
            :y="tickMark(year).ly"
            text-anchor="middle"
            dominant-baseline="central"
            class="year-label"
          >
            {{ year }}
          </text>
        </g>

        <!-- Single strand: colored segments by primary activity (visual only) -->
        <path
          v-for="seg in strandSegments"
          :key="'seg-' + seg.title + activeScheme"
          :d="seg.path"
          fill="none"
          :stroke="seg.color"
          :stroke-width="arcWidth"
          :stroke-opacity="segOpacity(seg)"
          stroke-linecap="round"
          class="strand-seg"
        />

        <!-- Highlight overlay for the selected entry's exact span -->
        <path
          v-if="selectedSpan"
          :d="selectedSpan.path"
          fill="none"
          :stroke="selectedSpan.color"
          :stroke-width="arcWidth + 2"
          stroke-linecap="round"
          class="strand-highlight"
        />

        <!-- Markers at each entry's start year -->
        <circle
          v-for="m in allMarkers"
          :key="'mk-' + m.title + activeScheme"
          :cx="m.mx"
          :cy="m.my"
          :r="markerR(m)"
          :fill="m.color"
          stroke="var(--bg)"
          stroke-width="2"
          class="strand-marker"
        />

        <!-- Invisible enlarged hit areas: hover + tap targets for the markers -->
        <circle
          v-for="m in allMarkers"
          :key="'hit-' + m.title + activeScheme"
          :cx="m.mx"
          :cy="m.my"
          r="14"
          fill="transparent"
          class="marker-hit"
          tabindex="0"
          role="button"
          :aria-label="`${m.title}, ${m.organization}, ${m.dates}`"
          @mouseenter="onArcEnter(m, $event)"
          @mousemove="onArcMove(m, $event)"
          @mouseleave="onArcLeave"
          @click="selectEntry(m)"
          @keydown.enter.prevent="selectEntry(m)"
          @keydown.space.prevent="selectEntry(m)"
        />

        <!-- Curved labels riding along their arc -->
        <g
          v-for="c in curvedLabels"
          :key="'curve-' + c.title + activeScheme"
          class="entry-group entry-curved"
          @mouseenter="onArcEnter(c, $event)"
          @mousemove="onArcMove(c, $event)"
          @mouseleave="onArcLeave"
          @click="selectEntry(c)"
        >
          <path :id="c.pathId" :d="c.textPath" fill="none" stroke="none" />
          <text
            class="arc-curved"
            :class="{ 'arc-label--active': hoveredEntry && hoveredEntry.title === c.title }"
            :fill="c.labelColor"
          >
            <textPath :href="'#' + c.pathId" startOffset="50%" text-anchor="middle">
              {{ c.label }}
            </textPath>
          </text>
        </g>

        <!-- Leader-line labels for concurrent / short entries -->
        <g
          v-for="d in leaderLabels"
          :key="'lead-' + d.title + d.start + activeScheme"
          class="entry-group entry-leader"
          @mouseenter="onArcEnter(d, $event)"
          @mousemove="onArcMove(d, $event)"
          @mouseleave="onArcLeave"
          @click="selectEntry(d)"
        >
          <line
            :x1="d.connX1"
            :y1="d.connY1"
            :x2="d.connX2"
            :y2="d.connY2"
            :stroke="d.color"
            stroke-opacity="0.3"
            stroke-width="1"
          />
          <text
            :x="d.lx"
            :y="d.ly"
            :text-anchor="d.anchor"
            dominant-baseline="central"
            class="arc-label"
            :class="{ 'arc-label--active': hoveredEntry && hoveredEntry.title === d.title }"
            :fill="d.labelColor"
          >
            {{ d.label }}
          </text>
        </g>
      </svg>

      <Transition name="tip-fade">
        <div
          v-if="hoveredEntry && !selectedEntry"
          class="radial-tooltip"
          :style="{ left: tooltipPos.x + 'px', top: (tooltipPos.y - 10) + 'px' }"
        >
          <span class="tip-lane" :style="{ color: hoveredEntry.labelColor }">{{ hoveredEntry.lane }}</span>
          <span class="tip-dates">{{ hoveredEntry.dates }}</span>
          <strong>{{ hoveredEntry.title }}</strong>
          <span class="tip-org">{{ hoveredEntry.organization }}</span>
          <span class="tip-summary">{{ hoveredEntry.summary }}</span>
        </div>
      </Transition>

      <!-- Storytelling index card: pinned beside the spiral -->
      <Transition name="card-pop">
        <aside v-if="selectedEntry" class="detail-card" aria-live="polite">
          <span
            class="detail-pin"
            :style="{ background: selectedEntry.color }"
            aria-hidden="true"
          ></span>
          <button class="detail-close" aria-label="Close" @click="selectedEntry = null">
            ×
          </button>
          <span class="detail-lane" :style="{ color: selectedEntry.labelColor }">
            {{ selectedEntry.lane }}
          </span>
          <span class="detail-dates">{{ selectedEntry.dates }}</span>
          <h3>{{ selectedEntry.title }}</h3>
          <span class="detail-org">{{ selectedEntry.organization }}</span>
          <p class="detail-summary">{{ selectedEntry.summary }}</p>
          <div class="detail-nav">
            <button :disabled="selectedIndex <= 0" @click="stepSelection(-1)">
              ← Earlier
            </button>
            <span class="detail-count">{{ selectedIndex + 1 }} / {{ chronological.length }}</span>
            <button
              :disabled="selectedIndex >= chronological.length - 1"
              @click="stepSelection(1)"
            >
              Later →
            </button>
          </div>
        </aside>
      </Transition>
    </div>

  </div>
</template>

<style scoped>
.radial-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.radial-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--muted);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.radial-chart-container {
  position: relative;
  width: 100%;
  max-width: 820px;
}

.radial-svg {
  width: 100%;
  height: auto;
}

/* Before the draw animation kicks in, only the guide spiral + ticks show */
.draw-pending .strand-seg,
.draw-pending .strand-marker,
.draw-pending .entry-group {
  opacity: 0;
}

.center-label {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 500;
  fill: var(--ink);
}

.center-label-sub {
  font-family: var(--serif);
  font-size: 15px;
  fill: var(--muted);
}

.year-label {
  font-family: var(--mono);
  font-size: 10.5px;
  fill: var(--muted);
  font-weight: 600;
}

.strand-seg {
  transition: stroke-opacity 0.2s ease;
  pointer-events: none;
}

.entry-group {
  cursor: pointer;
}

.strand-marker {
  transition: r 0.15s ease;
}

.arc-label {
  font-family: var(--mono);
  font-size: 13.5px;
  transition: font-weight 0.15s ease;
}

.arc-curved {
  font-family: var(--mono);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: font-weight 0.15s ease;
}

.arc-label--active {
  font-weight: 700;
}

.radial-tooltip {
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -100%);
  padding: 12px 16px;
  background: rgba(255, 253, 248, 0.96);
  border: 1px solid var(--line);
  box-shadow: 0 8px 24px rgba(24, 39, 36, 0.12);
  max-width: 240px;
  z-index: 10;
}

.radial-tooltip strong {
  display: block;
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 2px;
}

.tip-lane {
  display: block;
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 2px;
}

.tip-dates {
  display: block;
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 4px;
}

.tip-org {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4px;
}

.tip-summary {
  display: block;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.45;
}

.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: opacity 0.15s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
}

.marker-hit {
  cursor: pointer;
  outline: none;
}

.marker-hit:focus-visible {
  stroke: var(--ink);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}

/* Storytelling index card */
.detail-card {
  position: absolute;
  top: 28px;
  right: 0;
  width: 250px;
  padding: 20px 20px 16px;
  background: var(--paper);
  border: 1px solid rgba(24, 39, 36, 0.14);
  box-shadow: 0 16px 36px rgba(24, 39, 36, 0.16);
  transform: rotate(1.2deg);
  z-index: 11;
}

.detail-pin {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 3px 5px rgba(24, 39, 36, 0.28);
}

.detail-pin::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 4px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.detail-close {
  position: absolute;
  top: 6px;
  right: 8px;
  border: none;
  background: none;
  font-size: 20px;
  line-height: 1;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
}

.detail-close:hover {
  color: var(--ink);
}

.detail-lane {
  display: block;
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 3px;
}

.detail-dates {
  display: block;
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
}

.detail-card h3 {
  margin: 0 0 4px;
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 500;
  line-height: 1.2;
}

.detail-org {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.detail-summary {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
}

.detail-nav button {
  border: none;
  background: none;
  padding: 4px 0;
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--ink);
  cursor: pointer;
}

.detail-nav button:disabled {
  color: var(--muted);
  opacity: 0.4;
  cursor: default;
}

.detail-count {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--muted);
}

.card-pop-enter-active,
.card-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.card-pop-enter-from,
.card-pop-leave-to {
  opacity: 0;
  transform: rotate(1.2deg) translateY(10px);
}

.tap-hint {
  display: none;
  margin: 2px auto 14px;
  padding: 7px 14px;
  text-align: center;
  width: fit-content;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--paper);
  border: 1px dashed var(--line);
  border-radius: 4px;
  transform: rotate(-0.6deg);
}

.tap-hint-arrow {
  display: inline-block;
  margin-right: 4px;
  color: var(--green);
  font-weight: 700;
}

.tap-hint-alt {
  display: block;
  margin-top: 3px;
  font-size: 10px;
  letter-spacing: 0.03em;
  text-transform: none;
  color: var(--muted);
}

@media (prefers-reduced-motion: no-preference) {
  .tap-hint-arrow {
    animation: hint-bob 1.4s ease-in-out infinite;
  }
}

/* Until the first tap, dots breathe gently to invite interaction (phone only) */
@media (max-width: 640px) and (prefers-reduced-motion: no-preference) {
  svg.unexplored:not(.draw-pending) .strand-marker {
    animation: marker-breathe 1.6s ease-in-out infinite alternate;
  }
}

@keyframes hint-bob {
  0%,
  100% {
    transform: translateY(1px);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes marker-breathe {
  from {
    stroke-width: 2;
  }
  to {
    stroke-width: 5;
  }
}

/* --- Phone: decluttered spiral, tap to explore ------------------------------ */
@media (max-width: 640px) {
  /* Leader-line labels are unreadable at this scale — the index card
     replaces them. Long arcs keep a curved label at a much bigger font
     (fitsCurved() filters with phoneCurvedFontSize, keep in sync). */
  .entry-leader,
  .arc-label {
    display: none;
  }

  .arc-curved {
    font-size: 24px;
  }

  .year-label {
    font-size: 26px;
  }

  .center-label {
    font-size: 30px;
  }

  /* CSS r overrides the attribute: bigger markers + touch targets */
  .strand-marker {
    r: 11px;
  }

  .marker-hit {
    r: 28px;
  }

  .tap-hint {
    display: block;
  }

  /* The card flows below the chart instead of floating beside it */
  .detail-card {
    position: static;
    width: 100%;
    margin-top: 4px;
    transform: rotate(0.6deg);
  }

  .card-pop-enter-from,
  .card-pop-leave-to {
    transform: rotate(0.6deg) translateY(10px);
  }
}
</style>
