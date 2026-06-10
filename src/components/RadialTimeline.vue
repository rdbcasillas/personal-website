<script setup>
import { ref, computed } from "vue";
import timelineData from "../data/timeline.json";

const props = defineProps({
  visible: Boolean,
});

const svgRef = ref(null);
const activeScheme = ref("where");
const hoveredEntry = ref(null);
const tooltipPos = ref({ x: 0, y: 0 });

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

const curvedFontSize = 12;
const leaderFontSize = 12;
const curvedOffset = arcWidth / 2 + 10; // radial distance of curved text from strand center

// A path that text rides along, just outside the arc. Reversed on the lower
// half so the text stays upright (left-to-right) instead of upside-down.
function arcTextPath(startY, endY) {
  const midAngle = yearToAngle((startY + endY) / 2);
  const flip = Math.sin(midAngle) > 0.02;
  const pts = [];
  for (let i = 0; i <= pathSteps; i++) {
    const t = i / pathSteps;
    const year = startY + t * (endY - startY);
    const angle = yearToAngle(year);
    const r = yearToRadius(year) + curvedOffset;
    pts.push([ptX(angle, r), ptY(angle, r)]);
  }
  if (flip) pts.reverse();
  return pts
    .map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1))
    .join("");
}

// Does the label fit along its arc? If not, it gets a leader line instead.
function fitsCurved(entry) {
  const midR = yearToRadius((entry.start + entry.end) / 2) + curvedOffset;
  const arcLen = Math.abs(yearToAngle(entry.end) - yearToAngle(entry.start)) * midR;
  const textLen = displayLabel(entry).length * curvedFontSize * 0.6;
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
</script>

<template>
  <div class="radial-wrap">
    <div class="radial-controls">
      <button
        class="scheme-btn"
        :class="{ active: activeScheme === 'where' }"
        @click="activeScheme = 'where'"
      >
        By domain
      </button>
      <button
        class="scheme-btn"
        :class="{ active: activeScheme === 'how' }"
        @click="activeScheme = 'how'"
      >
        By mode of work
      </button>
    </div>

    <div class="radial-legend">
      <span v-for="lane in currentLanes" :key="lane" class="legend-item">
        <span class="legend-dot" :style="{ background: laneColors[lane] }"></span>
        {{ lane }}
      </span>
    </div>

    <div class="radial-chart-container">
      <svg
        ref="svgRef"
        class="radial-svg"
        :viewBox="`-70 -70 ${size + 140} ${size + 140}`"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Center label -->
        <text :x="cx" :y="cy - 6" text-anchor="middle" class="center-label">2006 –</text>
        <text :x="cx" :y="cy + 20" text-anchor="middle" class="center-label">{{ currentYear }}</text>

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
          :stroke-opacity="hoveredEntry && hoveredEntry.title === seg.title ? 1 : 0.85"
          stroke-linecap="round"
          class="strand-seg"
        />

        <!-- Markers at each entry's start year -->
        <circle
          v-for="m in allMarkers"
          :key="'mk-' + m.title + activeScheme"
          :cx="m.mx"
          :cy="m.my"
          :r="hoveredEntry && hoveredEntry.title === m.title ? 7 : 5"
          :fill="m.color"
          stroke="var(--bg)"
          stroke-width="2"
          class="strand-marker"
          @mouseenter="onArcEnter(m, $event)"
          @mousemove="onArcMove(m, $event)"
          @mouseleave="onArcLeave"
        />

        <!-- Curved labels riding along their arc -->
        <g
          v-for="c in curvedLabels"
          :key="'curve-' + c.title + activeScheme"
          class="entry-group"
          @mouseenter="onArcEnter(c, $event)"
          @mousemove="onArcMove(c, $event)"
          @mouseleave="onArcLeave"
        >
          <path :id="c.pathId" :d="c.textPath" fill="none" stroke="none" />
          <text
            class="arc-curved"
            :class="{ 'arc-label--active': hoveredEntry && hoveredEntry.title === c.title }"
            :fill="c.color"
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
          class="entry-group"
          @mouseenter="onArcEnter(d, $event)"
          @mousemove="onArcMove(d, $event)"
          @mouseleave="onArcLeave"
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
            :fill="d.color"
          >
            {{ d.label }}
          </text>
        </g>
      </svg>

      <Transition name="tip-fade">
        <div
          v-if="hoveredEntry"
          class="radial-tooltip"
          :style="{ left: tooltipPos.x + 'px', top: (tooltipPos.y - 10) + 'px' }"
        >
          <span class="tip-lane" :style="{ color: hoveredEntry.color }">{{ hoveredEntry.lane }}</span>
          <span class="tip-dates">{{ hoveredEntry.dates }}</span>
          <strong>{{ hoveredEntry.title }}</strong>
          <span class="tip-org">{{ hoveredEntry.organization }}</span>
          <span class="tip-summary">{{ hoveredEntry.summary }}</span>
        </div>
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

.radial-controls {
  display: flex;
  gap: 8px;
}

.scheme-btn {
  padding: 8px 18px;
  border: 1px solid var(--line);
  background: transparent;
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.scheme-btn.active {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
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
  font-size: 9px;
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
  font-size: 12px;
  transition: font-weight 0.15s ease;
}

.arc-curved {
  font-family: var(--mono);
  font-size: 12px;
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
</style>
