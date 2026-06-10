<script setup>
import { ref } from "vue";
import { useBoardReveal } from "../composables/useBoardReveal.js";

// Each channel renders as a small pinned paper note. `pin` picks the pushpin color.
const channels = [
  {
    label: "Email",
    value: "mehra.vatsal@gmail.com",
    url: "mailto:mehra.vatsal@gmail.com",
    pin: "coral",
  },
  {
    label: "Telegram",
    value: "@zerotimer",
    url: "https://t.me/zerotimer",
    pin: "blue",
  },
  {
    label: "Signal",
    value: "Message me",
    url: "https://signal.me/#eu/LcnHg1Pc4iibfEwutJo9u3ZiBCZC0Kng9bGGHkWj6p9eVepYygBI7o8yL0q2i53D",
    pin: "green",
  },
  {
    label: "GitHub",
    value: "rdbcasillas",
    url: "https://github.com/rdbcasillas",
    pin: "yellow",
  },
  {
    label: "LinkedIn",
    value: "Vatsal Mehra",
    url: "https://www.linkedin.com/in/vatsal-mehra-1572513a7/",
    pin: "blue",
  },
  {
    label: "Substack",
    value: "Clear & Muddy",
    url: "https://vats.substack.com",
    pin: "coral",
  },
];

const sectionRef = ref(null);
useBoardReveal(sectionRef, [".contact-note"]);
</script>

<template>
  <section class="connect-section" id="connect" ref="sectionRef">
    <p class="kicker">Connect</p>
    <h2>Working on something thoughtful, unusual, or socially useful? Let's talk.</h2>
    <div class="connect-board" aria-label="Ways to reach me">
      <a
        v-for="c in channels"
        :key="c.label"
        class="contact-note"
        :href="c.url"
        :target="c.url.startsWith('mailto') ? null : '_blank'"
        :rel="c.url.startsWith('mailto') ? null : 'noopener'"
      >
        <span class="pin" :class="`pin-${c.pin}`" aria-hidden="true"></span>
        <span class="note-label">{{ c.label }}</span>
        <span class="note-value">{{ c.value }}&nbsp;↗</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.connect-section {
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.connect-section h2 {
  max-width: 760px;
}

.kicker {
  margin: 0 0 18px;
  color: var(--green);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.connect-board {
  display: flex;
  flex-wrap: wrap;
  gap: 22px 18px;
  margin-top: 40px;
}

.contact-note {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 170px;
  padding: 18px 20px 16px;
  background: var(--paper);
  border: 1px solid rgba(24, 39, 36, 0.12);
  box-shadow: 0 10px 24px rgba(24, 39, 36, 0.1);
  color: var(--ink);
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Slight scatter, like notes pinned by hand */
.contact-note:nth-child(3n + 1) { transform: rotate(-1.3deg); }
.contact-note:nth-child(3n + 2) { transform: rotate(0.9deg); }
.contact-note:nth-child(3n) { transform: rotate(-0.5deg); }

.contact-note:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 18px 36px rgba(24, 39, 36, 0.16);
}

/* Pushpins — same vocabulary as the corkboard */
.pin {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 3px 5px rgba(24, 39, 36, 0.28);
}

.pin::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.pin-coral { background: var(--coral); }
.pin-blue { background: var(--blue); }
.pin-green { background: var(--green); }
.pin-yellow { background: var(--yellow); }

.note-label {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--muted);
}

.note-value {
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.2;
}

@media (max-width: 680px) {
  .connect-board {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 12px;
  }

  .contact-note {
    min-width: 0;
    padding: 16px 14px 14px;
  }

  /* A touch more scatter when the notes sit in a tight grid */
  .contact-note:nth-child(3n + 1) { transform: rotate(-1.6deg); }
  .contact-note:nth-child(3n + 2) { transform: rotate(1.2deg); }
  .contact-note:nth-child(3n) { transform: rotate(-0.8deg); }

  .note-value {
    font-size: 15px;
    overflow-wrap: anywhere;
  }
}
</style>
