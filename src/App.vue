<script setup>
import { ref } from "vue";
import TopBar from "./components/TopBar.vue";
import HeroSection from "./components/HeroSection.vue";
import WorkSection from "./components/WorkSection.vue";
import TimelineSection from "./components/TimelineSection.vue";
import ConnectSection from "./components/ConnectSection.vue";

const timelineRef = ref(null);

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
    <ConnectSection />
  </main>
</template>
