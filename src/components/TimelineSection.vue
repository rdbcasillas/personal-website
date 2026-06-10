<script setup>
import { ref, computed, onMounted } from "vue";
import gsap from "gsap";
import timelineData from "../data/timeline.json";
import RadialTimeline from "./RadialTimeline.vue";

const sectionRef = ref(null);
let revealed = false;

const laneColors = {
  Education: "var(--blue)",
  "Research & Visualization": "var(--green)",
  "Product & Industry": "var(--coral)",
  "Pedagogy & Community": "var(--yellow)",
};

const sortedEntries = computed(() =>
  [...timelineData.entries].sort((a, b) => b.start - a.start)
);

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
  const cards = root.querySelectorAll(".tl-card");
  if (cards.length) {
    gsap.from(cards, {
      opacity: 0,
      y: 28,
      duration: 0.45,
      stagger: 0.06,
      ease: "power2.out",
    });
  }
}

onMounted(() => {
  const root = sectionRef.value;
  if (!root || typeof IntersectionObserver === "undefined") {
    reveal();
    return;
  }
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
        Where I've spent my time, laid out chronologically. Some phases overlap —
        work, study, projects, and facilitation don't always fit into one neat lane.
      </p>
    </div>

    <div class="tl-container">
      <!-- Radial chart: desktop only -->
      <div class="tl-radial-desktop">
        <RadialTimeline />
      </div>

      <!-- Vertical timeline: mobile only -->
      <div class="tl-vertical-mobile">
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

        <div class="tl-track">
          <div class="tl-line" aria-hidden="true"></div>

          <article
            v-for="(entry, i) in sortedEntries"
            :key="`${entry.title}-${entry.start}`"
            class="tl-card"
          >
            <div class="tl-dot" :style="{ background: laneColors[entryLane(entry)] || 'var(--ink)' }"></div>
            <div class="tl-card-inner">
              <div class="tl-card-header">
                <time>{{ entry.dates }}</time>
                <span class="tl-lane-tag" :style="{ color: laneColors[entryLane(entry)] || 'var(--ink)' }">
                  {{ entryLane(entry) }}
                </span>
              </div>
              <h3>{{ entry.title }}</h3>
              <p class="tl-org">{{ entry.organization }}</p>
              <p class="tl-summary">{{ entry.summary }}</p>
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
  background: var(--line);
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
  padding: 16px 20px;
  border: 1px solid var(--line);
  background: rgba(255, 253, 248, 0.92);
  box-shadow: 0 8px 24px rgba(24, 39, 36, 0.07);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
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

@media (max-width: 640px) {
  .tl-radial-desktop {
    display: none;
  }

  .tl-vertical-mobile {
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
