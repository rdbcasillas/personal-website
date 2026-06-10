<script setup>
import portraitUrl from "../assets/vatsal-workshop.jpeg";

defineEmits(["open-timeline"]);
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

    <div class="field-board" aria-label="Current field notes">
      <figure class="portrait-pin">
        <img :src="portraitUrl" alt="Portrait of Vatsal Mehra" />
      </figure>

      <svg class="thread-map" viewBox="0 0 620 620" preserveAspectRatio="none" aria-hidden="true">
        <line class="thread-line thread-yellow" x1="220" y1="180" x2="370" y2="120" />
        <line class="thread-line thread-blue" x1="180" y1="260" x2="140" y2="500" />
        <line class="thread-line thread-green" x1="260" y1="240" x2="440" y2="480" />
        <circle class="thread-dot" cx="220" cy="180" r="5" />
        <circle class="thread-dot" cx="370" cy="120" r="5" />
        <circle class="thread-dot" cx="140" cy="500" r="5" />
        <circle class="thread-dot" cx="440" cy="480" r="5" />
      </svg>

      <div class="artifact artifact-green">
        <span>Current question</span>
        <p>What helps people reason well, decide wisely, and grow?</p>
      </div>

      <div class="artifact artifact-blue">
        <span>Mode</span>
        <p>Building at the edges of education, technology, and community.</p>
      </div>

      <div class="artifact artifact-coral">
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
  stroke-width: 3;
  stroke-linecap: round;
  opacity: 0.78;
}

.thread-yellow { stroke: var(--yellow); }
.thread-blue { stroke: var(--blue); }
.thread-green { stroke: var(--green); }

.thread-dot {
  fill: var(--ink);
  opacity: 0.65;
}

.artifact {
  position: absolute;
  z-index: 2;
  width: min(230px, 40%);
  padding: 16px;
  border: 1px solid rgba(24, 39, 36, 0.14);
  box-shadow: 0 14px 30px rgba(24, 39, 36, 0.1);
}

.artifact span {
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
    gap: 16px;
    min-height: auto;
    padding: 18px;
  }

  .portrait-pin {
    position: relative;
    top: auto;
    left: auto;
    width: 140px;
    align-self: center;
    transform: rotate(-2deg);
  }

  .thread-map {
    display: none;
  }

  .artifact {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
    width: 100%;
    transform: none;
  }

  .artifact p {
    font-size: 18px;
  }

  .artifact-green {
    transform: rotate(1deg);
  }

  .artifact-blue {
    transform: rotate(-0.5deg);
  }

  .artifact-coral {
    transform: rotate(0.5deg);
  }
}
</style>
