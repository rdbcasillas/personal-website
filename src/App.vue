<script setup>
import { ref } from "vue";
import TopBar from "./components/TopBar.vue";
import HeroSection from "./components/HeroSection.vue";
import WorkSection from "./components/WorkSection.vue";
import TimelineSection from "./components/TimelineSection.vue";
import LineageSection from "./components/LineageSection.vue";
import ConnectSection from "./components/ConnectSection.vue";

const timelineRef = ref(null);
const year = new Date().getFullYear();

function openTimeline() {
  timelineRef.value?.open();
}
</script>

<template>
  <div class="grain" aria-hidden="true"></div>
  <TopBar @open-timeline="openTimeline" />
  <main id="top">
    <HeroSection @open-timeline="openTimeline" />
    <TimelineSection ref="timelineRef" />
    <WorkSection />
    <LineageSection />
    <ConnectSection />
  </main>
  <footer class="site-footer">
    <p>Vatsal Mehra · {{ year }}</p>
    <a href="#top">Back to top ↑</a>
  </footer>
</template>

<style scoped>
.site-footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  width: min(calc(100% - 32px), var(--max));
  margin: 0 auto;
  padding: 26px 0 36px;
  border-top: 1px solid var(--line);
}

.site-footer p {
  margin: 0;
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted);
}

.site-footer a {
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
  transition: color 0.2s ease, border-color 0.2s ease;
}

.site-footer a:hover {
  color: var(--ink);
  border-color: var(--ink);
}
</style>
