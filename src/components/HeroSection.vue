<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import portraitUrl from "../assets/vatsal-workshop.jpeg";

defineEmits(["open-timeline"]);

// Threads are computed from the real positions of the portrait pin and each
// artifact's pin, so they stay attached across resizes / reflows.
const boardRef = ref(null);
const portraitRef = ref(null);
const greenRef = ref(null);
const blueRef = ref(null);
const coralRef = ref(null);

const boardSize = ref({ w: 620, h: 620 });
const threads = ref([]);

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
        d: `M${start[0]},${start[1]} Q${mx},${my} ${end[0]},${end[1]}`,
        color,
        x1: start[0],
        y1: start[1],
        x2: end[0],
        y2: end[1],
      };
    });
}

let resizeObserver = null;

onMounted(() => {
  computeThreads();
  if (typeof ResizeObserver !== "undefined" && boardRef.value) {
    resizeObserver = new ResizeObserver(computeThreads);
    resizeObserver.observe(boardRef.value);
  }
  window.addEventListener("resize", computeThreads);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("resize", computeThreads);
});
</script>

<template>
  <section class="hero" aria-labelledby="intro-title">
    <div class="hero-copy">
      <p class="kicker">Software · Science · Education · Community</p>
      <h1 id="intro-title">Vatsal Mehra</h1>
      <p class="subtitle">Builder, facilitator, community designer</p>
      <p class="lede">
        I build tools and spaces that help people think more clearly,
        learn more deeply, and collaborate more honestly.
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
        <g v-for="(t, i) in threads" :key="i">
          <path class="thread-line" :d="t.d" :stroke="t.color" />
          <circle class="thread-dot" :cx="t.x1" :cy="t.y1" r="3.5" />
          <circle class="thread-dot" :cx="t.x2" :cy="t.y2" r="3.5" />
        </g>
      </svg>

      <div class="artifact artifact-green" ref="greenRef">
        <span class="board-pin board-pin-green" aria-hidden="true"></span>
        <span>Current question</span>
        <p>What helps people reason well, decide wisely, and grow?</p>
      </div>

      <div class="artifact artifact-blue" ref="blueRef">
        <span class="board-pin board-pin-blue" aria-hidden="true"></span>
        <span>Mode</span>
        <p>Building at the edges of education, technology, and community.</p>
      </div>

      <div class="artifact artifact-coral" ref="coralRef">
        <span class="board-pin board-pin-coral" aria-hidden="true"></span>
        <span>Looking for</span>
        <p>Collaborators working on meaningful, socially useful problems.</p>
      </div>
    </div>
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

.kicker {
  margin: 0 0 18px;
  color: var(--green);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.subtitle {
  margin-bottom: 24px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
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
  background: var(--paper-alt);
  transform: rotate(2deg);
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
