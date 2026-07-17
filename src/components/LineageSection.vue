<script setup>
import { ref } from "vue";
import { useBoardReveal } from "../composables/useBoardReveal.js";
import imgDawkins from "../assets/previews/lineage-dawkins.jpg";
import imgSapolsky from "../assets/previews/lineage-sapolsky.jpg";
import imgBret from "../assets/previews/lineage-bretvictor.jpg";
import imgSchmach from "../assets/previews/lineage-schmachtenberger.jpg";
import imgGwern from "../assets/previews/lineage-gwern.png";
import imgLesswrong from "../assets/previews/lineage-lesswrong.png";

// People whose work I fell into and never quite climbed out of. Each renders as
// a catalogue card: a framed portrait (or the source it reached me through),
// the field, and a note in my own voice. `trace` names the specific work.
// The friend has no photo by design — a monogram medallion instead.
const lineage = [
  {
    initials: "V",
    name: "A college friend",
    field: "Curiosity",
    accent: "green",
    img: null,
    note:
      "Fed me the best corners of the internet and showed me what it actually looks like to be relentlessly curious about the world. The first person who made curiosity feel like a way of life.",
    trace: null,
  },
  {
    name: "Richard Dawkins",
    field: "Evolutionary biology",
    accent: "coral",
    img: imgDawkins,
    cover: true,
    pos: "top",
    url: "https://en.wikipedia.org/wiki/The_Selfish_Gene",
    note:
      "The Selfish Gene and his science videos hooked me on evolution and genomics for the first time — mid-way through a CS degree I didn't much like. I was convinced I wanted to be an evolutionary biologist.",
    trace: "The Selfish Gene",
  },
  {
    name: "Robert Sapolsky",
    field: "Behavioral biology",
    accent: "blue",
    img: imgSapolsky,
    pos: "center",
    url: "https://www.youtube.com/watch?v=NNnIGh9g6fA",
    note:
      "His Human Behavioral Biology lectures were so funny and alive that they tied every branch of biology together and made me excited about all of it. I couldn't believe we don't teach any of this in school.",
    trace: "Human Behavioral Biology · Stanford",
  },
  {
    name: "Bret Victor",
    field: "Building & interfaces",
    accent: "yellow",
    img: imgBret,
    pos: "70% center",
    url: "https://www.youtube.com/watch?v=EGqwXt90ZqA",
    note:
      "“Inventing on Principle” gave me an inspiring way to think about a career and about building things at all. His work on humane interface design pushed me toward doing education better — toward making hard ideas genuinely understandable. That thread led me on to explorable explanations and people like Mike Bostock and Nicky Case.",
    trace: "“Inventing on Principle”",
  },
  {
    name: "Gwern",
    field: "Craft & curiosity",
    accent: "blue",
    img: imgGwern,
    emblem: true,
    url: "https://gwern.net/",
    note:
      "In my 20s I was transfixed by his website — the obsessive attention to detail, the dense web of hyperlinks, the sheer range of things he was curious about. I'd even read his public notebook just to watch the latest notes appear. He made deep, self-directed inquiry look like a craft.",
    trace: "gwern.net",
  },
  {
    name: "LessWrong",
    field: "Rationality",
    accent: "green",
    img: imgLesswrong,
    emblem: true,
    url: "https://www.lesswrong.com/",
    note:
      "LessWrong — and the many writers there — showed me that thinking about thinking could be genuinely enjoyable. I hadn't known rationality was something you could practice and get better at. A lot of how I reason traces back to that community.",
    trace: "lesswrong.com",
  },
  {
    name: "Daniel Schmachtenberger",
    field: "The metacrisis",
    accent: "coral",
    img: imgSchmach,
    pos: "40% center",
    url: "https://www.youtube.com/watch?v=4kBoLVvoqVY",
    note:
      "Gave me the language of the metacrisis. His conversations reshaped how I see the world: that our problems are deeply interconnected, and that the real leverage sits in the underlying generator functions.",
    trace: "An introduction to the Metacrisis",
  },
];

const sectionRef = ref(null);
useBoardReveal(sectionRef, [".person-card"]);
</script>

<template>
  <section class="lineage-section" id="lineage" ref="sectionRef">
    <div class="section-intro">
      <p class="kicker">Lineage</p>
      <h2>The people who made me.</h2>
      <p class="lineage-lede">
        A handful of people — and a community or two — most of whom I've never
        met. Their work shaped how I think, what I find meaningful, and a good
        deal of who I've become. There are many others; these are the ones I
        keep returning to.
      </p>
    </div>

    <div class="lineage-grid" aria-label="People who shaped how I think">
      <component
        :is="d.url ? 'a' : 'article'"
        v-for="d in lineage"
        :key="d.name"
        class="person-card"
        :class="{ 'is-link': d.url }"
        :style="{ '--c': `var(--${d.accent})` }"
        :href="d.url || null"
        :target="d.url ? '_blank' : null"
        :rel="d.url ? 'noopener' : null"
      >
        <span
          class="portrait"
          :class="{ 'is-cover': d.cover, 'is-emblem': d.emblem, 'is-mono': !d.img }"
        >
          <img
            v-if="d.img"
            :src="d.img"
            :alt="d.emblem ? `${d.name} — site logo` : d.cover ? `${d.name} — ${d.trace}` : d.name"
            :style="{ objectPosition: d.pos }"
            loading="lazy"
          />
          <span v-else class="mono-tile" aria-hidden="true">{{ d.initials }}</span>
        </span>

        <div class="person-body">
          <span class="field-eyebrow">{{ d.field }}</span>
          <h3 class="person-name">{{ d.name }}</h3>
          <p class="person-note">{{ d.note }}</p>
          <span v-if="d.trace" class="person-trace">↳ {{ d.trace }}{{ d.url ? " ↗" : "" }}</span>
        </div>
      </component>
    </div>
  </section>
</template>

<style scoped>
.lineage-section {
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

.lineage-lede {
  max-width: 620px;
  margin: -4px 0 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.6;
}

.lineage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 22px 20px;
  margin-top: 40px;
}

/* A library catalogue card for each person */
.person-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Ruled catalogue-card lines over warm paper */
  background:
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 27px,
      rgba(24, 39, 36, 0.05) 27px,
      rgba(24, 39, 36, 0.05) 28px
    ),
    var(--paper);
  border: 1px solid rgba(24, 39, 36, 0.13);
  box-shadow: 0 10px 24px rgba(24, 39, 36, 0.09);
  color: var(--ink);
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Slight hand-filed scatter; link cards straighten on hover */
.person-card:nth-child(3n + 1) { transform: rotate(-0.5deg); }
.person-card:nth-child(3n + 2) { transform: rotate(0.4deg); }
.person-card:nth-child(3n) { transform: rotate(-0.25deg); }

.person-card.is-link:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 18px 38px rgba(24, 39, 36, 0.15);
}

.person-card.is-link:hover .person-name {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

/* Framed portrait / source image */
.portrait {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-bottom: 1px solid rgba(24, 39, 36, 0.12);
  background: var(--paper-alt);
}

.portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.person-card.is-link:hover .portrait img {
  transform: scale(1.03);
}

/* Book cover shown as an object on the shelf, not cropped */
.portrait.is-cover {
  display: grid;
  place-items: center;
  padding: 16px 0;
  background:
    radial-gradient(120% 120% at 50% 0%, rgba(24, 39, 36, 0.06), transparent 60%),
    var(--paper-alt);
}

.portrait.is-cover img {
  width: auto;
  height: 100%;
  object-fit: contain;
  box-shadow: 0 8px 20px rgba(24, 39, 36, 0.22);
}

.person-card.is-link:hover .portrait.is-cover img {
  transform: translateY(-2px);
}

/* Site logo shown as a centered emblem (for anonymous people) */
.portrait.is-emblem {
  display: grid;
  place-items: center;
  background:
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 21px,
      rgba(24, 39, 36, 0.045) 21px,
      rgba(24, 39, 36, 0.045) 22px
    ),
    var(--paper-alt);
}

.portrait.is-emblem img {
  width: auto;
  height: auto;
  max-width: 68%;
  max-height: 60%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(24, 39, 36, 0.18);
}

.person-card.is-link:hover .portrait.is-emblem img {
  transform: translateY(-2px);
}

/* Monogram tile for the person without a photo */
.portrait.is-mono {
  display: grid;
  place-items: center;
  background:
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 21px,
      rgba(24, 39, 36, 0.045) 21px,
      rgba(24, 39, 36, 0.045) 22px
    ),
    var(--paper-alt);
}

.mono-tile {
  display: grid;
  place-items: center;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  border: 1.5px solid var(--c);
  background: color-mix(in srgb, var(--c) 10%, transparent);
  color: var(--c);
  font-family: var(--serif);
  font-size: 30px;
}

.person-body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 18px 22px 22px;
}

.field-eyebrow {
  margin-bottom: 6px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--c);
}

.person-name {
  margin: 0 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(24, 39, 36, 0.14);
  font-size: 22px;
  line-height: 1.15;
}

.person-note {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
  flex-grow: 1;
}

.person-trace {
  margin-top: 14px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--c);
}

@media (max-width: 680px) {
  .person-body {
    padding: 16px 18px 20px;
  }
  .person-name {
    font-size: 20px;
  }
}
</style>
