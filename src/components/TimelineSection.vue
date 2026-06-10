<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import timelineData from "../data/timeline.json";
import RadialTimeline from "./RadialTimeline.vue";

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
const trackRef = ref(null);
let revealed = false;

// Phone view toggle: the spiral (default) or the unrolled-strand list
const mobileView = ref("spiral");
let listInitialized = false;

watch(mobileView, async (v) => {
  if (v === "list" && !listInitialized) {
    listInitialized = true;
    await setupMobileStrand();
    ScrollTrigger.refresh();
  }
});

const laneColors = {
  Education: "var(--blue)",
  "Research & Visualization": "var(--green)",
  "Product & Industry": "var(--coral)",
  "Pedagogy & Community": "var(--yellow)",
};

// Yellow text is illegible on paper — lane *text* uses a darker ochre
// while dots/strand keep the bright yellow. Mirrors RadialTimeline.
const laneTextColors = {
  ...laneColors,
  "Pedagogy & Community": "#a8842c",
};

// Chronological (oldest first): the phone timeline is the spiral unrolled,
// so it reads top-to-bottom the way the spiral reads center-outward.
const sortedEntries = computed(() =>
  [...timelineData.entries].sort((a, b) => a.start - b.start)
);

// "+ the full story" disclosures in the list cards (keyed by title+start)
const expandedKeys = ref(new Set());
const entryKey = (e) => `${e.title}-${e.start}`;
const isExpanded = (e) => expandedKeys.value.has(entryKey(e));
function toggleDetails(entry) {
  const key = entryKey(entry);
  const next = new Set(expandedKeys.value);
  next.has(key) ? next.delete(key) : next.add(key);
  expandedKeys.value = next;
}

function entryLane(entry) {
  return entry.lanes.where;
}

function reveal() {
  if (revealed) return;
  revealed = true;
  const root = sectionRef.value;
  if (!root) return;

  const radial = root.querySelector(".radial-wrap");
  if (radial) {
    gsap.from(radial, { opacity: 0, y: 36, duration: 0.6, ease: "power2.out" });
  }
}

// --- Mobile strand: the spiral unrolled --------------------------------------
// The vertical line is rebuilt as colored segments (dot-to-dot, colored by the
// earlier entry's lane), mirroring the spiral's strand. It draws itself as the
// user scrolls; cards settle in one by one.

const strandSegs = ref([]);

function computeStrand() {
  const track = trackRef.value;
  if (!track || track.offsetParent === null) return; // hidden on desktop
  const dots = Array.from(track.querySelectorAll(".tl-dot"));
  if (!dots.length) return;
  const trackRect = track.getBoundingClientRect();
  const centers = dots.map((d) => {
    const r = d.getBoundingClientRect();
    return r.top - trackRect.top + r.height / 2;
  });
  const entries = sortedEntries.value;
  strandSegs.value = centers.map((top, i) => {
    const bottom = i < centers.length - 1 ? centers[i + 1] : trackRect.height - 10;
    return {
      topPx: top,
      heightPx: Math.max(0, bottom - top),
      color: laneColors[entryLane(entries[i])] || "var(--ink)",
    };
  });
}

function onResize() {
  computeStrand();
  ScrollTrigger.refresh();
}

async function setupMobileStrand() {
  if (typeof window === "undefined") return;
  if (!window.matchMedia("(max-width: 640px)").matches) return;
  await nextTick();
  computeStrand();
  window.addEventListener("resize", onResize);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  await nextTick(); // segments rendered

  const track = trackRef.value;
  if (!track) return;
  const segEls = Array.from(track.querySelectorAll(".tl-line-seg"));
  const totalH = strandSegs.value.reduce((a, s) => a + s.heightPx, 0);
  if (segEls.length && totalH > 0) {
    gsap.set(segEls, { scaleY: 0, transformOrigin: "top center" });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track,
        start: "top 72%",
        end: "bottom 78%",
        scrub: 0.4,
      },
    });
    segEls.forEach((el, i) => {
      tl.to(el, {
        scaleY: 1,
        duration: strandSegs.value[i].heightPx / totalH,
        ease: "none",
      });
    });
  }

  track.querySelectorAll(".tl-card").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: "power2.out",
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: card, start: "top 88%" },
    });
  });
}

onMounted(() => {
  const root = sectionRef.value;
  if (!root || typeof IntersectionObserver === "undefined") {
    reveal();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(root);
  }
  // The unrolled-strand list is set up lazily, on first toggle to "List".
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});

// Hero / nav "Open timeline" links scroll the section into view.
function open() {
  sectionRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

defineExpose({ open });
</script>

<template>
  <section class="timeline-section" id="timeline" ref="sectionRef">
    <div class="section-intro">
      <p class="kicker">Timeline</p>
      <h2>Education, work, and experiments over time</h2>
      <p>
        Twenty years wound into a single thread — from computer engineering through
        bioinformatics to building communities, with each color marking a different
        kind of work.
      </p>
    </div>

    <div class="tl-container">
      <!-- Phone-only toggle between the spiral and the unrolled strand -->
      <div class="tl-mobile-toggle" role="group" aria-label="Timeline view">
        <button
          :class="{ active: mobileView === 'spiral' }"
          @click="mobileView = 'spiral'"
        >
          Spiral
        </button>
        <button
          :class="{ active: mobileView === 'list' }"
          @click="mobileView = 'list'"
        >
          List
        </button>
      </div>

      <!-- Radial chart: always on desktop; on phone when "Spiral" is chosen -->
      <div class="tl-radial-desktop" :class="{ 'tl-mobile-off': mobileView !== 'spiral' }">
        <RadialTimeline />
      </div>

      <!-- Unrolled strand: phone "List" view -->
      <div class="tl-vertical-mobile" :class="{ 'tl-mobile-on': mobileView === 'list' }">
        <div class="tl-legend">
          <span
            v-for="(color, lane) in laneColors"
            :key="lane"
            class="tl-legend-item"
          >
            <span class="tl-legend-dot" :style="{ background: color }"></span>
            {{ lane }}
          </span>
        </div>

        <div class="tl-track" ref="trackRef">
          <div class="tl-line" aria-hidden="true">
            <div
              v-for="(s, i) in strandSegs"
              :key="i"
              class="tl-line-seg"
              :style="{ top: s.topPx + 'px', height: s.heightPx + 'px', background: s.color }"
            ></div>
          </div>

          <article
            v-for="(entry, i) in sortedEntries"
            :key="`${entry.title}-${entry.start}`"
            class="tl-card"
          >
            <div class="tl-dot" :style="{ background: laneColors[entryLane(entry)] || 'var(--ink)' }"></div>
            <div class="tl-card-inner">
              <div class="tl-card-header">
                <time>{{ entry.dates }}</time>
                <span class="tl-lane-tag" :style="{ color: laneTextColors[entryLane(entry)] || 'var(--ink)' }">
                  {{ entryLane(entry) }}
                </span>
              </div>
              <h3>{{ entry.title }}</h3>
              <p class="tl-org">{{ entry.organization }}</p>
              <p class="tl-summary">{{ entry.summary }}</p>
              <template v-if="entry.details && entry.details.length">
                <button class="tl-more" @click="toggleDetails(entry)">
                  {{ isExpanded(entry) ? "− less" : "+ the full story" }}
                </button>
                <ul v-if="isExpanded(entry)" class="tl-details">
                  <li v-for="(line, j) in entry.details" :key="j">{{ line }}</li>
                </ul>
              </template>
              <div v-if="entry.links && entry.links.length" class="tl-links">
                <a
                  v-for="l in entry.links"
                  :key="l.url"
                  :href="l.url"
                  target="_blank"
                  rel="noopener"
                >{{ l.label }} ↗</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline-section {
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.section-intro {
  max-width: 720px;
}

.section-intro p {
  color: var(--muted);
  font-size: 19px;
  line-height: 1.75;
}

.kicker {
  margin: 0 0 18px;
  color: var(--green);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.tl-container {
  margin-top: 28px;
  padding: 28px 0 12px;
  border-top: 1px solid var(--line);
  overflow: hidden;
}

/* Desktop: show radial, hide vertical */
.tl-radial-desktop {
  display: block;
}

.tl-vertical-mobile {
  display: none;
}

.tl-mobile-toggle {
  display: none;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tl-mobile-toggle button {
  padding: 7px 18px;
  border: 1px solid var(--line);
  background: transparent;
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tl-mobile-toggle button.active {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}

/* Mobile vertical timeline styles */
.tl-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 36px;
}

.tl-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--muted);
}

.tl-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tl-track {
  position: relative;
  max-width: 820px;
  margin: 0 auto;
  padding: 0 20px;
}

.tl-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  width: 2px;
  background: var(--line); /* faint guide, like the spiral's guide path */
}

/* Colored strand segments laid over the guide — the spiral, unrolled */
.tl-line-seg {
  position: absolute;
  left: -1px;
  width: 4px;
  border-radius: 2px;
  opacity: 0.85;
}

.tl-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding-left: 48px;
  padding-bottom: 32px;
}

.tl-dot {
  position: absolute;
  top: 6px;
  left: 13px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid var(--bg);
  z-index: 2;
}

.tl-card-inner {
  position: relative;
  padding: 16px 20px;
  border: 1px solid var(--line);
  background: var(--paper);
  box-shadow: 0 8px 24px rgba(24, 39, 36, 0.09);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

/* Notes pinned beside the strand: slight scatter + a small tape strip */
.tl-card:nth-of-type(odd) .tl-card-inner {
  transform: rotate(-0.5deg);
}

.tl-card:nth-of-type(even) .tl-card-inner {
  transform: rotate(0.45deg);
}

.tl-card-inner::before {
  content: "";
  position: absolute;
  top: -9px;
  left: 50%;
  width: 58px;
  height: 18px;
  background: rgba(248, 242, 226, 0.65);
  border-left: 2px dotted rgba(24, 39, 36, 0.08);
  border-right: 2px dotted rgba(24, 39, 36, 0.08);
  box-shadow: 0 1px 3px rgba(24, 39, 36, 0.14);
  transform: translateX(-50%) rotate(-2deg);
}

.tl-card:nth-of-type(even) .tl-card-inner::before {
  transform: translateX(-50%) rotate(1.6deg);
}

.tl-card-inner:hover {
  box-shadow: 0 12px 32px rgba(24, 39, 36, 0.12);
  transform: translateY(-2px);
}

.tl-card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.tl-card-header time {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
  color: var(--green);
}

.tl-lane-tag {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0;
  text-transform: uppercase;
  white-space: nowrap;
}

.tl-card h3 {
  margin: 0 0 4px;
  font-family: var(--sans);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
}

.tl-org {
  margin: 0 0 6px;
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.tl-summary {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

.tl-more {
  display: inline-block;
  margin-top: 8px;
  padding: 0;
  border: none;
  background: none;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.03em;
  color: var(--green);
  cursor: pointer;
  border-bottom: 1px dashed currentColor;
}

.tl-details {
  margin: 8px 0 0;
  padding-left: 16px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

.tl-details li {
  margin-bottom: 5px;
}

.tl-details li::marker {
  color: var(--green);
}

.tl-links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
}

.tl-links a {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.03em;
  color: var(--blue);
  text-decoration: none;
  border-bottom: 1px dashed currentColor;
}

.tl-links a:hover {
  color: var(--ink);
}

@media (max-width: 640px) {
  .tl-mobile-toggle {
    display: flex;
  }

  .tl-radial-desktop.tl-mobile-off {
    display: none;
  }

  .tl-vertical-mobile.tl-mobile-on {
    display: block;
  }

  .tl-card-header {
    flex-direction: column;
    gap: 4px;
  }

  .tl-card h3 {
    font-size: 15px;
  }
}
</style>
