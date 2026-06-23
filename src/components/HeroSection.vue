<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import portraitUrl from "../assets/vatsal-workshop.jpeg";

defineEmits(["open-timeline"]);

// --- Expandable "what I mean" notes ---------------------------------------
// Each hero phrase that needs more than a sentence opens a larger note (the
// note "pulled off the board") with a longer plain-language explanation.
// PLACEHOLDER copy for now — Vatsal will write the real text.
const notes = {
  reasoning: {
    eyebrow: "Current question",
    accent: "var(--green)",
    title: "What helps people reason well, decide wisely, and grow?",
    body: `<p>Reasoning well, deciding wisely, and growing — intellectually
      <em>and</em> emotionally — might be the most important things a person can
      learn. And yet almost nothing in our education systems is actually built to
      teach them, even though arguably this is what education should be about in
      the first place.</p>
      <p>I'm solving for this by running live experiments — rationality
      workshops, life coaching, and building communities — to find the ecosystem
      of frameworks and tools that genuinely help people make progress in these
      directions.</p>`,
  },
  education: {
    eyebrow: "Current question",
    accent: "var(--green)",
    title: "What is education for in a post-AGI world?",
    body: `<p>Intelligence is about to get cheap. Once AI handles most knowledge
      work — and does it better than we can — we have to ask what it actually means
      to <em>educate</em> a human being.</p>
      <p>Mass schooling was built to mass-produce a certain kind of worker —
      sorting us into narrow slots, stamping out near-copies, and quietly killing
      curiosity along the way. That maybe made some sense in an industrial economy.
      It makes none in this one — even if we're not fully out of the old one yet.</p>
      <p>So I think we finally have permission to start from scratch — to ask what
      kinds of education systems we actually need, and whether schooling, which we
      don't necessarily have to keep, should look anything like it does today. If
      the old jobs are gone, how do people find meaning and purpose, and how do
      humans and AI collaborate so they can reach their full potential instead of
      being constrained by it?</p>`,
  },
  collaborators: {
    eyebrow: "Looking for",
    accent: "var(--coral)",
    title: "The wicked problems at the heart of the meta-crisis",
    body: `<p>By <em>meta-crisis</em> I mean the way our hardest problems —
      institutional trust, mental health, governance, climate, AI — are tangled
      together and feed each other, so none of them yields to a fix in
      isolation.</p>
      <p>Underneath them is a deeper one: our collective ability to make sense of
      the world and coordinate hasn't kept pace with the problems we've created.
      These are
      <a href="https://en.wikipedia.org/wiki/Wicked_problem" target="_blank"
      rel="noopener noreferrer">wicked problems</a> — hard to even define, with no
      tidy solution.</p>
      <p>I want to work with people who feel this — whatever words they use for it
      — and who are drawn to the root patterns rather than the symptoms. Education
      and governance are where I keep landing, but the frame matters more to me
      than the field.</p>`,
  },
};

const openNote = ref(null); // key into `notes`, or null
const activeNote = computed(() => (openNote.value ? notes[openNote.value] : null));
function openNoteFor(key) {
  openNote.value = key;
}
function closeNote() {
  openNote.value = null;
}

function onNoteKey(e) {
  if (e.key === "Escape") closeNote();
}

watch(openNote, (v) => {
  if (typeof document === "undefined") return;
  if (v) {
    document.addEventListener("keydown", onNoteKey);
    document.body.style.overflow = "hidden";
  } else {
    document.removeEventListener("keydown", onNoteKey);
    document.body.style.overflow = "";
  }
});

// Threads are computed from the real positions of the portrait pin and each
// artifact's pin, so they stay attached across resizes / reflows.
const boardRef = ref(null);
const portraitRef = ref(null);
const greenRef = ref(null);
const blueRef = ref(null);
const coralRef = ref(null);

const boardSize = ref({ w: 620, h: 620 });
const threads = ref([]);

// --- Wind sway ------------------------------------------------------------
// Each pinned paper swings from its pin (transform-origin: top center) with a
// faint idle breeze plus a "gust" proportional to scroll velocity. Because the
// pivot IS the pin point, thread endpoints don't move — only the string's sag
// reacts, so it lags the paper and reads as wind. Whisper-subtle on purpose.
const gust = ref(0); // current wind force, roughly -1..1

// Threads redrawn from base geometry with the live gust deepening the sag.
const threadPaths = computed(() =>
  threads.value.map((t) => {
    const my = t.my + gust.value * 26;
    return { ...t, d: `M${t.x1},${t.y1} Q${t.mx},${my} ${t.x2},${t.y2}` };
  })
);

function pinPoint(el, board) {
  // Top-center of the element, nudged up to the pushpin head
  const r = el.getBoundingClientRect();
  return [r.left - board.left + r.width / 2, r.top - board.top - 1];
}

function computeThreads() {
  const boardEl = boardRef.value;
  const portraitEl = portraitRef.value;
  if (!boardEl || !portraitEl) return;
  const board = boardEl.getBoundingClientRect();
  if (board.width === 0) return;
  boardSize.value = { w: board.width, h: board.height };

  const start = pinPoint(portraitEl, board);
  const targets = [
    { el: greenRef.value, color: "var(--green)" },
    { el: blueRef.value, color: "var(--blue)" },
    { el: coralRef.value, color: "var(--coral)" },
  ];

  threads.value = targets
    .filter((t) => t.el)
    .map(({ el, color }) => {
      const end = pinPoint(el, board);
      // Quadratic curve with a little sag, so threads hang like real string
      const dist = Math.hypot(end[0] - start[0], end[1] - start[1]);
      const sag = Math.min(44, Math.max(14, dist * 0.12));
      const mx = (start[0] + end[0]) / 2;
      const my = (start[1] + end[1]) / 2 + sag;
      return {
        color,
        x1: start[0],
        y1: start[1],
        x2: end[0],
        y2: end[1],
        mx,
        my,
      };
    });
}

let resizeObserver = null;

// Per-paper sway config: base rotation (matches the CSS), an idle phase offset
// so they don't move in lockstep, and a gust direction multiplier.
let swayEls = [];
let rafId = null;
let running = false;
let scrollVel = 0; // px/s, set on scroll, decays in the loop
let lastY = 0;
let lastT = 0;
let intersectionObserver = null;
const reduceMotion =
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

function onScroll() {
  const y = window.scrollY;
  const now = performance.now();
  const dt = now - lastT || 16;
  scrollVel = ((y - lastY) / dt) * 1000;
  lastY = y;
  lastT = now;
}

function frame(now) {
  scrollVel *= 0.9; // decay so a flick settles instead of running on
  const target = Math.max(-1, Math.min(1, scrollVel / 1000));
  gust.value += (target - gust.value) * 0.12;

  const t = now / 1000;
  for (const c of swayEls) {
    if (!c.el) continue;
    c.hoverGust *= 0.9; // pointer disturbance settles back to rest
    const idle = Math.sin(t * 0.9 + c.phase) * 0.9; // always-on breeze
    const hover = Math.sin(t * 7 + c.phase) * c.hoverGust * 3.5; // fast flutter under the cursor
    const angle = c.base + idle + gust.value * 2.4 * c.dir + hover;
    c.el.style.transform = `rotate(${angle}deg)`;
  }
  rafId = requestAnimationFrame(frame);
}

// Moving the cursor across a paper disturbs it — faster movement, bigger flutter.
function onPointerMove(c, e) {
  const m = Math.hypot(e.movementX || 0, e.movementY || 0);
  c.hoverGust = Math.min(1, c.hoverGust + m / 55);
}

function startSway() {
  if (running || reduceMotion) return;
  running = true;
  lastY = window.scrollY;
  lastT = performance.now();
  rafId = requestAnimationFrame(frame);
}

function stopSway() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

onMounted(() => {
  computeThreads();
  if (typeof ResizeObserver !== "undefined" && boardRef.value) {
    resizeObserver = new ResizeObserver(computeThreads);
    resizeObserver.observe(boardRef.value);
  }
  window.addEventListener("resize", computeThreads);

  if (reduceMotion) return;
  // base rotations mirror the scoped CSS so the JS hand-off is seamless
  swayEls = [
    { el: portraitRef.value, base: -4, phase: 0, dir: 0.6, hoverGust: 0 },
    { el: greenRef.value, base: 2, phase: 1.3, dir: 1, hoverGust: 0 },
    { el: blueRef.value, base: 1.5, phase: 2.5, dir: -0.85, hoverGust: 0 },
    { el: coralRef.value, base: -2, phase: 3.7, dir: 0.95, hoverGust: 0 },
  ];
  for (const c of swayEls) {
    if (!c.el) continue;
    c.onMove = (e) => onPointerMove(c, e);
    c.el.addEventListener("pointermove", c.onMove);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  if (typeof IntersectionObserver !== "undefined" && boardRef.value) {
    intersectionObserver = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startSway() : stopSway()),
      { threshold: 0 }
    );
    intersectionObserver.observe(boardRef.value);
  } else {
    startSway();
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
  window.removeEventListener("resize", computeThreads);
  window.removeEventListener("scroll", onScroll);
  for (const c of swayEls) c.el?.removeEventListener("pointermove", c.onMove);
  stopSway();
  if (typeof document !== "undefined") {
    document.removeEventListener("keydown", onNoteKey);
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <section class="hero" aria-labelledby="intro-title">
    <div class="hero-copy">
      <h1 id="intro-title">Vatsal Mehra</h1>
      <p class="subtitle">
        <span class="sub-grp"><span>Builder</span><span>Educator</span></span>
        <span class="sub-grp"><span>Thinking&nbsp;coach</span><span>Community&nbsp;designer</span></span>
      </p>
      <p class="lede">
        I build tools and spaces that help people think more clearly,
        learn more deeply, and grow — intellectually and emotionally.
      </p>
      <div class="hero-links" aria-label="Intro links">
        <a href="#timeline" class="hero-link" @click="$emit('open-timeline')">Open timeline</a>
        <a href="#work" class="hero-link">Explore work</a>
      </div>
    </div>

    <div class="field-board" ref="boardRef" aria-label="Current field notes">
      <figure class="portrait-pin" ref="portraitRef">
        <img :src="portraitUrl" alt="Portrait of Vatsal Mehra" />
      </figure>

      <svg
        class="thread-map"
        :viewBox="`0 0 ${boardSize.w} ${boardSize.h}`"
        aria-hidden="true"
      >
        <g v-for="(t, i) in threadPaths" :key="i">
          <path class="thread-line" :d="t.d" :stroke="t.color" />
          <circle class="thread-dot" :cx="t.x1" :cy="t.y1" r="3.5" />
          <circle class="thread-dot" :cx="t.x2" :cy="t.y2" r="3.5" />
        </g>
      </svg>

      <div class="artifact artifact-green" ref="greenRef">
        <span class="board-pin board-pin-green" aria-hidden="true"></span>
        <span>Current questions</span>
        <ul class="q-list">
          <li>
            <button class="note-trigger" @click="openNoteFor('reasoning')">
              <span class="q-text">What helps people reason well, decide wisely, and grow?</span>
              <span class="note-cue note-cue-green">↡ read the note</span>
            </button>
          </li>
          <li>
            <button class="note-trigger" @click="openNoteFor('education')">
              <span class="q-text">What is education for in a post-AGI world, and how should we design it?</span>
              <span class="note-cue note-cue-green">↡ read the note</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="artifact artifact-blue" ref="blueRef">
        <span class="board-pin board-pin-blue" aria-hidden="true"></span>
        <span>Mode</span>
        <p>Building at the edges of education, technology, and community.</p>
      </div>

      <div class="artifact artifact-coral" ref="coralRef">
        <span class="board-pin board-pin-coral" aria-hidden="true"></span>
        <span>Looking for</span>
        <p>
          Collaborators drawn to the meaningful, thorny
          <a
            href="https://en.wikipedia.org/wiki/Wicked_problem"
            target="_blank"
            rel="noopener noreferrer"
            class="wicked-link"
            >wicked problems</a
          >
          at the heart of the meta-crisis.
        </p>
        <button class="note-trigger note-trigger-cue" @click="openNoteFor('collaborators')">
          <span class="note-cue note-cue-coral">↡ read the note</span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="note-fade">
        <div v-if="activeNote" class="note-overlay" @click.self="closeNote">
          <div
            class="note-sheet"
            role="dialog"
            aria-modal="true"
            :aria-label="activeNote.title"
          >
            <span class="note-pin" :style="{ background: activeNote.accent }" aria-hidden="true"></span>
            <button class="note-close" @click="closeNote" aria-label="Close note">×</button>
            <span class="note-eyebrow" :style="{ color: activeNote.accent }">{{ activeNote.eyebrow }}</span>
            <h3 class="note-title">{{ activeNote.title }}</h3>
            <div class="note-body" v-html="activeNote.body"></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 0.86fr) minmax(420px, 1fr);
  gap: 54px;
  min-height: 600px;
  align-items: center;
}

.subtitle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 24px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sub-grp {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
}

/* "·" between the two tags inside a pair, and between the two pairs */
.sub-grp > span:not(:first-child)::before,
.subtitle > .sub-grp:not(:first-child)::before {
  content: "·";
  margin: 0 0.7em;
  color: var(--green);
  font-weight: 700;
}

/* On phones, each pair drops onto its own line (a tidy 2 + 2) so the last
   tag never wraps with an orphaned "·" leading the line. */
@media (max-width: 640px) {
  .subtitle {
    font-size: 12px;
  }
  .subtitle > .sub-grp {
    flex-basis: 100%;
  }
  .subtitle > .sub-grp:not(:first-child)::before {
    content: none;
  }
}

.lede {
  color: var(--muted);
  font-size: 19px;
  line-height: 1.75;
}

.hero-links {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 28px;
}

.hero-link {
  color: var(--muted) !important;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px solid var(--muted);
  transition: color 0.2s ease;
}

.hero-link:hover {
  color: var(--ink) !important;
  border-color: var(--ink);
}

.field-board {
  position: relative;
  min-height: 620px;
  padding: 28px;
  border: 1px solid var(--line);
  background:
    linear-gradient(90deg, rgba(24, 39, 36, 0.05) 1px, transparent 1px),
    linear-gradient(180deg, rgba(24, 39, 36, 0.05) 1px, transparent 1px),
    rgba(255, 250, 240, 0.55);
  background-size: 28px 28px;
  box-shadow: 0 24px 80px rgba(24, 39, 36, 0.12);
  overflow: hidden;
}

.portrait-pin {
  position: absolute;
  top: 42px;
  left: 42px;
  z-index: 2;
  width: 190px;
  margin: 0;
  padding: 12px;
  background: #fffdf8;
  box-shadow: 0 18px 40px rgba(24, 39, 36, 0.14);
  transform: rotate(-4deg);
  /* swings from the pushpin; JS may take over the transform for wind sway */
  transform-origin: top center;
  will-change: transform;
}

.portrait-pin::before {
  content: "";
  position: absolute;
  top: -12px;
  left: 50%;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--coral);
  transform: translateX(-50%);
}

.portrait-pin img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  filter: saturate(0.92) contrast(1.05);
}

.thread-map {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.thread-line {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  opacity: 0.7;
}

.thread-dot {
  fill: var(--ink);
  opacity: 0.55;
}

/* Pushpins on the artifact cards — thread endpoints attach here */
.board-pin {
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

.board-pin::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 4px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.board-pin-green { background: var(--green); }
.board-pin-blue { background: var(--blue); }
.board-pin-coral { background: var(--coral); }

.artifact {
  position: absolute;
  z-index: 2;
  width: min(230px, 40%);
  padding: 16px;
  border: 1px solid rgba(24, 39, 36, 0.14);
  box-shadow: 0 14px 30px rgba(24, 39, 36, 0.1);
  /* each note swings from its pushpin under the wind sway */
  transform-origin: top center;
  will-change: transform;
}

.artifact span:not(.board-pin) {
  display: block;
  margin-bottom: 8px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.artifact p {
  margin: 0;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1.2;
}

.artifact-green {
  right: 28px;
  top: 42px;
  width: min(262px, 46%);
  background: var(--paper-alt);
  transform: rotate(2deg);
}

/* Two current questions as pinned bullets */
.q-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.q-list li {
  position: relative;
  padding-left: 17px;
}

.q-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
}

.q-text {
  display: block;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 16.5px;
  line-height: 1.24;
  text-transform: none;
  letter-spacing: 0;
  margin: 0;
}

/* Click target for the "what I mean" notes — a bare text button */
.note-trigger {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.note-cue {
  display: inline-block;
  margin-top: 5px;
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.02em;
  text-transform: none;
  opacity: 0.72;
  transition: opacity 0.18s ease;
}
.note-cue-green { color: var(--green); }
.note-cue-coral { color: var(--coral); }

.note-trigger:hover .q-text {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
}
.note-trigger:hover .note-cue,
.note-trigger:focus-visible .note-cue {
  opacity: 1;
}

/* Cue-only trigger (the "Looking for" card): the sentence stays static, only
   the "what I mean" cue is the click target. */
.note-trigger-cue {
  width: auto;
  margin-top: 5px;
}
.note-trigger-cue .note-cue {
  margin-top: 0;
}

.wicked-link {
  color: var(--coral);
  text-decoration: none;
  border-bottom: 1.5px solid color-mix(in srgb, var(--coral) 55%, transparent);
  padding-bottom: 0.5px;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.wicked-link:hover {
  border-bottom-color: var(--coral);
  background: color-mix(in srgb, var(--coral) 12%, transparent);
}

/* --- "Pulled note" overlay ------------------------------------------------ */
.note-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(24, 39, 36, 0.42);
  backdrop-filter: blur(2px);
}

.note-sheet {
  position: relative;
  width: min(560px, 100%);
  max-height: 84vh;
  overflow-y: auto;
  padding: 44px 46px 38px;
  color: #3a2f1c;
  background: linear-gradient(178deg, #fefdfb, #f6f5ef);
  border: 1px solid rgba(70, 58, 34, 0.16);
  box-shadow: 0 28px 64px rgba(24, 39, 36, 0.34),
    inset 0 0 44px rgba(150, 130, 80, 0.05);
  transform: rotate(-0.6deg);
}

.note-sheet::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.3;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.26'/%3E%3C/svg%3E");
}

.note-pin {
  position: absolute;
  top: -10px;
  left: 50%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 3px 6px rgba(24, 39, 36, 0.3);
}
.note-pin::after {
  content: "";
  position: absolute;
  top: 4px;
  left: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.note-close {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: #6b5a38;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}
.note-close:hover {
  background: rgba(120, 96, 52, 0.12);
  color: #3a2f1c;
}

.note-eyebrow {
  display: block;
  margin-bottom: 10px;
  font-family: var(--type-alt);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.note-title {
  margin: 0 0 18px;
  font-family: var(--serif);
  font-size: 27px;
  line-height: 1.12;
  color: #2b2214;
}

.note-body {
  font-family: var(--type);
  font-size: 16px;
  line-height: 1.85;
}
.note-body :first-child { margin-top: 0; }
.note-body :last-child { margin-bottom: 0; }
.note-body p { margin: 0 0 14px; }
.note-body em { font-style: italic; color: #6b5a38; }
.note-body a {
  color: #c0271c;
  text-decoration: none;
  border-bottom: 1.5px solid rgba(192, 39, 28, 0.5);
}
.note-body a:hover { border-bottom-color: #c0271c; }

.note-fade-enter-active,
.note-fade-leave-active {
  transition: opacity 0.24s ease;
}
.note-fade-enter-active .note-sheet,
.note-fade-leave-active .note-sheet {
  transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.1), opacity 0.24s ease;
}
.note-fade-enter-from,
.note-fade-leave-to {
  opacity: 0;
}
.note-fade-enter-from .note-sheet,
.note-fade-leave-to .note-sheet {
  opacity: 0;
  transform: rotate(-0.6deg) translateY(14px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .note-fade-enter-active,
  .note-fade-leave-active,
  .note-fade-enter-active .note-sheet,
  .note-fade-leave-active .note-sheet {
    transition: none;
  }
}

.artifact-blue {
  left: 28px;
  bottom: 36px;
  background: #eef6fb;
  transform: rotate(1.5deg);
}

.artifact-coral {
  right: 28px;
  bottom: 36px;
  background: #fff0eb;
  transform: rotate(-2deg);
}

@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .field-board {
    min-height: 560px;
  }
}

@media (max-width: 680px) {
  .field-board {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: auto;
    padding: 20px 18px 24px;
  }

  .portrait-pin {
    position: relative;
    top: auto;
    left: auto;
    width: 150px;
    align-self: center;
    transform: rotate(-3deg);
  }

  /* Threads stay on: a string weaves down from the polaroid through each
     pinned note (real positions, so it follows the stacked layout). */

  .artifact {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
    width: 96%;
  }

  .artifact p {
    font-size: 18px;
  }

  .artifact-green {
    align-self: flex-start;
    transform: rotate(1.3deg);
  }

  .artifact-blue {
    align-self: flex-end;
    transform: rotate(-1.1deg);
  }

  .artifact-coral {
    align-self: flex-start;
    transform: rotate(0.9deg);
  }
}
</style>
