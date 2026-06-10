<script setup>
import { ref } from "vue";
import { useBoardReveal } from "../composables/useBoardReveal.js";
import previewWorkshops from "../assets/previews/rationality-workshops.jpg";
import previewResilience from "../assets/previews/rational-resilience.jpg";
import previewPortal from "../assets/previews/portal.jpg";
import previewSubstack from "../assets/previews/clear-and-muddy.jpg";
import shotMouseBrainDev from "../assets/previews/mousebraindev.jpg";
import shot3dBrain from "../assets/previews/3dbrain.jpg";

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

// The archive: past projects filed away as index cards. `shot` pins a small
// screenshot to the card as attached evidence.
const moreProjects = [
  {
    name: "Mouse Brain Development DB",
    tag: "Open Source",
    years: "2019 – 2020",
    url: "https://mousebraindev.com",
    shot: shotMouseBrainDev,
    tagline:
      "Interactive visualizations for time-series NGS experiments on murine whole cortex.",
  },
  {
    name: "3D Mouse Brain",
    tag: "Open Source",
    years: "2020 – 2021",
    url: "https://3dbrain.netlify.app",
    shot: shot3dBrain,
    tagline:
      "3D visualization and quantification of supra-spinal neurons across cervical, thoracic, and lumbar segments.",
  },
  {
    name: "Introduction to Applied Rationality",
    tag: "Course",
    years: "2021",
    url: "https://hyperlink.academy/courses/introduction-to-applied-rationality/54",
    shot: null,
    doodle: "course",
    tagline:
      "A course exploring frameworks and techniques for achieving what we most want with the resources we have.",
  },
  {
    name: "Cerebral",
    tag: "Podcast",
    years: "2020 – 2021",
    url: "https://open.spotify.com/show/79oICYy7ndxZIrQQWunirp",
    shot: null,
    doodle: "podcast",
    tagline:
      "A podcast on human biases and how to improve thinking and decision-making.",
  },
];

const publications = [
  {
    year: "2022",
    title:
      "Brain-wide analysis of the supraspinal connectome reveals anatomical correlates to functional recovery after spinal injury",
    journal: "eLife",
    url: "https://elifesciences.org/articles/76254",
  },
  {
    year: "2021",
    title: "Co-occupancy identifies transcription factor co-operation for axon growth",
    journal: "Nature Communications",
    url: "https://www.nature.com/articles/s41467-021-22828-3",
  },
  {
    year: "2018",
    title:
      "Developmental chromatin restriction of pro-growth gene networks acts as an epigenetic barrier to axon regeneration in cortical neurons",
    journal: "Developmental Neurobiology",
    url: "https://www.biorxiv.org/content/10.1101/259408v1",
  },
  {
    year: "2018",
    title:
      "KLF6 and STAT3 co-occupy regulatory DNA and functionally synergize to promote axon growth in CNS neurons",
    journal: "Scientific Reports",
    url: "https://www.nature.com/articles/s41598-018-31101-5",
  },
  {
    year: "2018",
    title:
      "Direct HLA genetic comparisons identify highly matched unrelated donor-recipient pairs with improved transplantation outcome",
    journal: "Biology of Blood and Marrow Transplantation",
    url: "https://pubmed.ncbi.nlm.nih.gov/30537549/",
  },
  {
    year: "2016",
    title:
      "SNPredict: a machine learning approach for detecting low frequency variants in cancer",
    journal: "Master's thesis · Marquette University",
    url: "https://epublications.marquette.edu/theses_open/367/",
  },
];

const sectionRef = ref(null);
useBoardReveal(sectionRef, [
  ".building-card",
  ".polaroid, .sticky",
  ".more-card",
  ".pub-item",
]);
</script>

<template>
  <section class="section work-section" id="work" ref="sectionRef">
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

    <!-- More projects: the archive -->
    <p class="block-label">From the archive</p>
    <div class="more-grid">
      <component
        :is="p.url ? 'a' : 'div'"
        v-for="p in moreProjects"
        :key="p.name"
        class="more-card"
        :class="`tab-${p.tag.toLowerCase().replace(/\s+/g, '-')}`"
        :href="p.url || null"
        :target="p.url ? '_blank' : null"
        :rel="p.url ? 'noopener' : null"
      >
        <span class="archive-tab">{{ p.tag }}</span>
        <span v-if="p.shot" class="archive-shot">
          <img :src="p.shot" :alt="`${p.name} screenshot`" loading="lazy" />
        </span>
        <!-- Hand-drawn ink doodles for cards without screenshots -->
        <span v-else-if="p.doodle" class="archive-shot archive-doodle" aria-hidden="true">
          <svg v-if="p.doodle === 'course'" viewBox="0 0 320 120" fill="none">
            <!-- Open book -->
            <path d="M115,42 L115,90" stroke="#182724" stroke-width="2.2" stroke-linecap="round" />
            <path d="M115,42 C96,31 64,33 44,46 L44,94 C64,81 96,79 115,90" stroke="#2c6f93" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M115,42 C134,31 166,33 186,46 L186,94 C166,81 134,79 115,90" stroke="#2c6f93" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M58,54 q21,-7 42,-2" stroke="#2c6f93" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <path d="M58,67 q21,-7 42,-2" stroke="#2c6f93" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <path d="M130,52 q21,-5 42,2" stroke="#2c6f93" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <path d="M130,65 q21,-5 42,2" stroke="#2c6f93" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <!-- Dashed thought-arrow rising to a lightbulb -->
            <path d="M192,72 Q214,62 226,46" stroke="#182724" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="4 6" />
            <path d="M221,48 l6,-3 0,7" stroke="#182724" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Lightbulb -->
            <circle cx="244" cy="32" r="13" stroke="#e2b84b" stroke-width="2.2" />
            <path d="M239,46 q5,4 10,0" stroke="#e2b84b" stroke-width="2" stroke-linecap="round" />
            <path d="M240,51 h8 M242,56 h4" stroke="#182724" stroke-width="1.8" stroke-linecap="round" />
            <path d="M262,20 l7,-6 M264,34 l9,1 M256,12 l3,-8" stroke="#e2b84b" stroke-width="1.8" stroke-linecap="round" />
            <!-- Little idea-graph -->
            <circle cx="272" cy="92" r="5" stroke="#2c6f93" stroke-width="1.8" />
            <circle cx="297" cy="74" r="5" stroke="#2c6f93" stroke-width="1.8" />
            <circle cx="303" cy="100" r="5" stroke="#2c6f93" stroke-width="1.8" />
            <path d="M276,88 l16,-10 M277,95 l21,4 M298,79 l4,16" stroke="#182724" stroke-width="1.4" stroke-linecap="round" opacity="0.6" />
          </svg>
          <svg v-else viewBox="0 0 320 120" fill="none">
            <!-- Microphone -->
            <rect x="72" y="18" width="34" height="58" rx="17" stroke="#d75f49" stroke-width="2.2" />
            <path d="M79,36 h20 M79,46 h20 M79,56 h20" stroke="#d75f49" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <path d="M58,58 a31,31 0 0 0 62,0" stroke="#182724" stroke-width="2.2" stroke-linecap="round" />
            <path d="M89,89 v14" stroke="#182724" stroke-width="2.2" stroke-linecap="round" />
            <path d="M71,104 h36" stroke="#182724" stroke-width="2.2" stroke-linecap="round" />
            <!-- Sound arcs -->
            <path d="M132,36 q13,15 0,30" stroke="#d75f49" stroke-width="2" stroke-linecap="round" />
            <path d="M145,28 q21,23 0,46" stroke="#182724" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="4 6" />
            <path d="M158,21 q29,30 0,60" stroke="#d75f49" stroke-width="2" stroke-linecap="round" opacity="0.6" />
            <!-- Waveform -->
            <path d="M196,53 v14 M205,44 v32 M214,55 v10 M223,34 v52 M232,49 v22 M241,41 v38 M250,55 v10 M259,46 v28 M268,52 v16 M277,57 v6 M286,44 v32 M295,53 v14" stroke="#182724" stroke-width="2.6" stroke-linecap="round" opacity="0.75" />
            <path d="M223,34 v52 M259,46 v28" stroke="#d75f49" stroke-width="2.6" stroke-linecap="round" />
          </svg>
        </span>
        <span class="more-head">
          <h3>{{ p.name }}</h3>
          <span v-if="p.years" class="archive-years">{{ p.years }}</span>
        </span>
        <p>{{ p.tagline }}</p>
      </component>
    </div>

    <p class="block-label">Publications</p>
    <div class="pub-sheet">
      <a
        v-for="pub in publications"
        :key="pub.url"
        class="pub-item"
        :href="pub.url"
        target="_blank"
        rel="noopener"
      >
        <span class="pub-year">{{ pub.year }}</span>
        <span class="pub-body">
          <span class="pub-title">{{ pub.title }}</span>
          <em class="pub-journal">{{ pub.journal }}</em>
        </span>
      </a>
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
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  background: rgba(255, 253, 248, 0.7);
  text-decoration: none;
  color: var(--ink);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Slight hand-placed scatter; cards straighten on hover */
.building-card:nth-child(3n + 1) { transform: rotate(-0.6deg); }
.building-card:nth-child(3n + 2) { transform: rotate(0.45deg); }
.building-card:nth-child(3n) { transform: rotate(-0.3deg); }

/* Translucent tape strip holding each card up */
.building-card::before {
  content: "";
  position: absolute;
  top: -11px;
  left: 50%;
  width: 88px;
  height: 24px;
  background: rgba(248, 242, 226, 0.65);
  border-left: 2px dotted rgba(24, 39, 36, 0.08);
  border-right: 2px dotted rgba(24, 39, 36, 0.08);
  box-shadow: 0 1px 3px rgba(24, 39, 36, 0.14);
  transform: translateX(-50%) rotate(-2deg);
  z-index: 3;
}

.building-card:nth-child(even)::before {
  transform: translateX(-50%) rotate(1.6deg);
}

.building-card:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 16px 36px rgba(24, 39, 36, 0.14);
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

/* From the archive: index cards with folder tabs */
.more-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 36px 18px;
  padding-top: 30px; /* room for the tabs */
}

.more-card {
  position: relative;
  display: block;
  padding: 18px 20px 16px;
  border: 1px solid rgba(24, 39, 36, 0.16);
  /* Ruled index-card lines over paper */
  background:
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 25px,
      rgba(44, 111, 147, 0.09) 25px,
      rgba(44, 111, 147, 0.09) 26px
    ),
    var(--paper);
  box-shadow: 0 10px 24px rgba(24, 39, 36, 0.09);
  text-decoration: none;
  color: var(--ink);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.more-card:nth-child(odd) { transform: rotate(-0.4deg); }
.more-card:nth-child(even) { transform: rotate(0.35deg); }

a.more-card:hover {
  transform: rotate(0deg) translateY(-3px);
  box-shadow: 0 16px 34px rgba(24, 39, 36, 0.14);
}

/* Folder tab peeking above the card */
.archive-tab {
  position: absolute;
  top: -23px;
  left: 16px;
  padding: 5px 14px 4px;
  border: 1px solid rgba(24, 39, 36, 0.16);
  border-bottom: none;
  border-radius: 7px 7px 0 0;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tab-open-source .archive-tab {
  background: #e3efe9;
  color: var(--green);
}

.tab-course .archive-tab {
  background: #e7f0f7;
  color: var(--blue);
}

.tab-podcast .archive-tab {
  background: #f9e9e4;
  color: var(--coral);
}

/* Attached evidence: a small taped-on screenshot */
.archive-shot {
  position: relative;
  display: block;
  margin: 4px 0 14px;
  padding: 6px;
  background: #fffdf8;
  border: 1px solid rgba(24, 39, 36, 0.1);
  box-shadow: 0 6px 16px rgba(24, 39, 36, 0.1);
  transform: rotate(-0.8deg);
}

.more-card:nth-child(even) .archive-shot {
  transform: rotate(0.7deg);
}

.archive-shot::before {
  content: "";
  position: absolute;
  top: -8px;
  left: 50%;
  width: 64px;
  height: 16px;
  background: rgba(248, 242, 226, 0.7);
  border-left: 2px dotted rgba(24, 39, 36, 0.08);
  border-right: 2px dotted rgba(24, 39, 36, 0.08);
  box-shadow: 0 1px 3px rgba(24, 39, 36, 0.14);
  transform: translateX(-50%) rotate(-1.5deg);
  z-index: 2;
}

.archive-shot img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 7;
  object-fit: cover;
  /* Bottom-anchored: both captures have their figures/charts low, prose up top */
  object-position: left bottom;
}

.archive-doodle svg {
  display: block;
  width: 100%;
  height: auto;
  background:
    linear-gradient(90deg, rgba(24, 39, 36, 0.035) 1px, transparent 1px),
    linear-gradient(180deg, rgba(24, 39, 36, 0.035) 1px, transparent 1px);
  background-size: 18px 18px; /* faint graph paper behind the sketch */
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

.archive-years {
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

/* --- Publications: a ruled sheet of papers ---------------------------------- */
.pub-sheet {
  max-width: 720px;
  padding: 10px 22px;
  background: repeating-linear-gradient(
      180deg,
      transparent,
      transparent 31px,
      rgba(44, 111, 147, 0.1) 31px,
      rgba(44, 111, 147, 0.1) 32px
    ),
    var(--paper);
  border: 1px solid rgba(24, 39, 36, 0.12);
  box-shadow: 0 10px 26px rgba(24, 39, 36, 0.08);
  transform: rotate(-0.25deg);
}

.pub-item {
  display: flex;
  gap: 16px;
  align-items: baseline;
  padding: 12px 0;
  text-decoration: none;
  border-bottom: 1px dashed rgba(24, 39, 36, 0.12);
}

.pub-item:last-child {
  border-bottom: none;
}

.pub-year {
  flex: 0 0 auto;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--green);
}

.pub-body {
  display: block;
}

.pub-title {
  display: block;
  font-family: var(--serif);
  font-size: 15px;
  line-height: 1.45;
  color: var(--ink);
}

.pub-item:hover .pub-title {
  text-decoration: underline;
  text-decoration-color: var(--green);
  text-underline-offset: 3px;
}

.pub-journal {
  display: block;
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--muted);
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
