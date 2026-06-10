<script setup>
import previewWorkshops from "../assets/previews/rationality-workshops.jpg";
import previewResilience from "../assets/previews/rational-resilience.jpg";
import previewPortal from "../assets/previews/portal.jpg";
import previewSubstack from "../assets/previews/clear-and-muddy.png";

// Flagship, currently-active projects. Each shows a live snapshot of the site.
const building = [
  {
    name: "Rationality Workshops",
    status: "Active",
    url: "https://rationalityworkshops.com",
    preview: previewWorkshops,
    tagline:
      "Workshops on practical rationality — clearer thinking, calibration, and better decisions.",
  },
  {
    name: "Rational Resilience",
    status: "Active",
    url: "https://rationalresilience.org",
    preview: previewResilience,
    tagline:
      "Coaching for better decisions, resilience, and emotional awareness.",
  },
  {
    name: "Portal",
    status: "Active",
    url: "https://enterportal.org",
    preview: previewPortal,
    tagline: "A community for epistemic and personal growth.",
  },
];

const writing = {
  name: "Clear & Muddy",
  preview: previewSubstack,
  url: "https://vats.substack.com",
  tagline:
    "Essays on thinking, learning, and the things I'm working through.",
  latest: {
    title: "Why Do I Want What I Want?",
    blurb:
      "A messy attempt to distinguish what I'm chasing from what I actually care about.",
    date: "Jun 5, 2026",
    url: "https://vats.substack.com/p/why-do-i-want-what-i-want",
  },
};

const talks = [
  {
    title: "Planning Fallacy: Why We Underestimate Time and How to Fix It",
    venue: "EAGx Delhi · Talk & Workshop",
    date: "Dec 2025",
    url: "https://www.youtube.com/watch?v=1RSSnqo2uzQ",
  },
  {
    title: "Calibration & Cognitive Biases Workshop",
    venue: "EAGx Bangalore",
    date: "Oct 2024",
    url: null,
  },
];

const moreProjects = [
  {
    name: "Mouse Brain Development DB",
    tag: "Open Source",
    url: "https://mousebraindev.com",
    tagline:
      "Interactive visualizations for time-series NGS experiments on murine whole cortex.",
  },
  {
    name: "3D Mouse Brain",
    tag: "Open Source",
    url: "https://3dbrain.netlify.app",
    tagline:
      "3D visualization and quantification of supra-spinal neurons across cervical, thoracic, and lumbar segments.",
  },
  {
    name: "Introduction to Applied Rationality",
    tag: "Course",
    url: "https://hyperlink.academy/courses/introduction-to-applied-rationality/54",
    tagline:
      "A course exploring frameworks and techniques for achieving what we most want with the resources we have.",
  },
  {
    name: "Cerebral",
    tag: "Podcast",
    url: "https://open.spotify.com/show/79oICYy7ndxZIrQQWunirp",
    tagline:
      "A podcast on human biases and how to improve thinking and decision-making.",
  },
  {
    name: "Hyderabad Rationality Meetup",
    tag: "Meetup",
    url: null,
    tagline:
      "A bi-weekly meetup for improving epistemic and instrumental rationality.",
  },
];

</script>

<template>
  <section class="section work-section" id="work">
    <div class="section-intro">
      <p class="kicker">Work</p>
      <h2>Things I'm building, writing, and exploring.</h2>
    </div>

    <!-- Currently building -->
    <p class="block-label">Currently building</p>
    <div class="building-grid">
      <a
        v-for="p in building"
        :key="p.name"
        class="building-card"
        :href="p.url"
        target="_blank"
        rel="noopener"
      >
        <span class="preview">
          <img :src="p.preview" :alt="`${p.name} website preview`" loading="lazy" />
        </span>
        <span class="building-body">
          <span class="building-head">
            <h3>{{ p.name }}</h3>
            <span class="status">{{ p.status }}</span>
          </span>
          <p>{{ p.tagline }}</p>
          <span class="visit">Visit&nbsp;↗</span>
        </span>
      </a>
    </div>

    <!-- Writing & talks: corkboard -->
    <p class="block-label">Writing &amp; talks</p>
    <div class="pinboard">
      <!-- Writing: pinned polaroid -->
      <div class="board-col">
        <span class="board-tag">Writing</span>
        <a
          class="polaroid"
          :href="writing.latest.url"
          target="_blank"
          rel="noopener"
        >
          <span class="pin pin-coral" aria-hidden="true"></span>
          <span class="polaroid-photo">
            <img
              :src="writing.preview"
              :alt="`${writing.name} — ${writing.latest.title}`"
              loading="lazy"
            />
          </span>
          <span class="polaroid-caption">
            <span class="polaroid-eyebrow">{{ writing.name }} · Substack</span>
            <span class="polaroid-title">Latest: “{{ writing.latest.title }}”</span>
            <span class="visit">Read&nbsp;↗</span>
          </span>
        </a>
        <a class="board-link" :href="writing.url" target="_blank" rel="noopener">
          Browse all essays&nbsp;↗
        </a>
      </div>

      <!-- Talks: sticky notes -->
      <div class="board-col">
        <span class="board-tag">Talks</span>
        <div class="sticky-stack">
          <component
            :is="t.url ? 'a' : 'div'"
            v-for="(t, i) in talks"
            :key="t.title"
            class="sticky"
            :class="[`sticky-${i % 2}`, { 'sticky-link': t.url }]"
            :href="t.url || null"
            :target="t.url ? '_blank' : null"
            :rel="t.url ? 'noopener' : null"
          >
            <span class="pin" :class="i % 2 === 0 ? 'pin-blue' : 'pin-green'" aria-hidden="true"></span>
            <span class="sticky-venue">{{ t.venue }}</span>
            <span class="sticky-title">{{ t.title }}</span>
            <span class="sticky-foot">
              <time>{{ t.date }}</time>
              <span v-if="t.url" class="sticky-watch">Watch&nbsp;↗</span>
            </span>
          </component>
        </div>
      </div>
    </div>

    <!-- More projects -->
    <p class="block-label">More projects</p>
    <div class="more-grid">
      <component
        :is="p.url ? 'a' : 'div'"
        v-for="p in moreProjects"
        :key="p.name"
        class="more-card"
        :href="p.url || null"
        :target="p.url ? '_blank' : null"
        :rel="p.url ? 'noopener' : null"
      >
        <span class="more-head">
          <h3>{{ p.name }}</h3>
          <span class="tag">{{ p.tag }}</span>
        </span>
        <p>{{ p.tagline }}</p>
      </component>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.section-intro {
  max-width: 720px;
}

.kicker {
  margin: 0 0 18px;
  color: var(--green);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.block-label {
  margin: 56px 0 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
}

/* Currently building */
.building-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 18px;
}

.building-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  background: rgba(255, 253, 248, 0.7);
  text-decoration: none;
  color: var(--ink);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.building-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 34px rgba(24, 39, 36, 0.12);
}

.preview {
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
  background: var(--paper-alt);
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.4s ease;
}

.building-card:hover .preview img {
  transform: scale(1.04);
}

.building-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 22px 22px;
  flex-grow: 1;
}

.building-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.status {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(15, 123, 102, 0.12);
  color: var(--green);
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
}

.building-card p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.5;
  flex-grow: 1;
}

.visit {
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  color: var(--ink);
  border-bottom: 1px solid currentColor;
  align-self: flex-start;
}

/* Writing & talks corkboard */
.pinboard {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 40px;
  padding: 40px 44px 48px;
  border: 1px solid var(--line);
  background:
    linear-gradient(90deg, rgba(24, 39, 36, 0.045) 1px, transparent 1px),
    linear-gradient(180deg, rgba(24, 39, 36, 0.045) 1px, transparent 1px),
    rgba(255, 250, 240, 0.5);
  background-size: 26px 26px;
  box-shadow: inset 0 0 60px rgba(24, 39, 36, 0.05);
}

.board-col {
  position: relative;
}

.board-tag {
  display: inline-block;
  margin-bottom: 22px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Pushpins */
.pin {
  position: absolute;
  top: -9px;
  left: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 3px 5px rgba(24, 39, 36, 0.28);
  z-index: 3;
}

.pin::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 4px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.pin-coral { background: var(--coral); }
.pin-blue { background: var(--blue); }
.pin-green { background: var(--green); }

/* Writing polaroid */
.polaroid {
  position: relative;
  display: block;
  padding: 14px 14px 18px;
  background: #fffdf8;
  text-decoration: none;
  color: var(--ink);
  box-shadow: 0 16px 34px rgba(24, 39, 36, 0.16);
  transform: rotate(-2deg);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.polaroid:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 22px 46px rgba(24, 39, 36, 0.22);
}

.polaroid-photo {
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--paper-alt);
}

.polaroid-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.polaroid-caption {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 6px 4px;
}

.polaroid-eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--green);
}

.polaroid-title {
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1.2;
}

.polaroid .visit {
  margin-top: 6px;
}

.board-link {
  display: inline-block;
  margin-top: 22px;
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
  transition: color 0.2s ease, border-color 0.2s ease;
}

.board-link:hover {
  color: var(--ink);
  border-color: var(--ink);
}

/* Talks sticky notes */
.sticky-stack {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-top: 6px;
}

.sticky {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 22px 18px;
  color: var(--ink);
  text-decoration: none;
  box-shadow: 0 12px 26px rgba(24, 39, 36, 0.14);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.sticky-0 {
  background: #fdf3c4;
  transform: rotate(1.6deg);
}

.sticky-1 {
  background: #e7f1fb;
  transform: rotate(-1.4deg);
}

.sticky-link:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 20px 38px rgba(24, 39, 36, 0.2);
}

.sticky-venue {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--muted);
}

.sticky-title {
  font-family: var(--serif);
  font-size: 19px;
  line-height: 1.25;
}

.sticky-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
}

.sticky-foot time {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--muted);
}

.sticky-watch {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--ink);
  border-bottom: 1px solid currentColor;
}

/* More projects */
.more-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.more-card {
  display: block;
  padding: 18px 20px;
  border: 1px solid var(--line);
  background: rgba(255, 253, 248, 0.5);
  text-decoration: none;
  color: var(--ink);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

a.more-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(24, 39, 36, 0.1);
}

.more-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.more-head h3 {
  font-size: 17px;
}

.tag {
  flex-shrink: 0;
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--muted);
}

.more-card p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 860px) {
  .pinboard {
    grid-template-columns: 1fr;
    gap: 44px;
    padding: 32px 24px 40px;
  }
}

@media (max-width: 680px) {
  .more-grid {
    grid-template-columns: 1fr;
  }
}
</style>
