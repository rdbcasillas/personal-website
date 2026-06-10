<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

defineEmits(["open-timeline"]);

// Highlight the nav link for whichever section currently crosses the upper
// third of the viewport. Empty string = hero (no link highlighted).
const activeSection = ref("");
const sectionIds = ["timeline", "work", "connect"];
let observer = null;
const intersecting = new Set();

onMounted(() => {
  if (typeof IntersectionObserver === "undefined") return;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) intersecting.add(e.target.id);
        else intersecting.delete(e.target.id);
      });
      activeSection.value = sectionIds.find((id) => intersecting.has(id)) || "";
    },
    { rootMargin: "-20% 0px -65% 0px" }
  );
  sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .forEach((el) => observer.observe(el));
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <header class="topbar">
    <a class="brand" href="#top">VM</a>
    <nav class="nav" aria-label="Primary navigation">
      <a
        href="#timeline"
        :class="{ active: activeSection === 'timeline' }"
        @click="$emit('open-timeline')"
        >Timeline</a
      >
      <a href="#work" :class="{ active: activeSection === 'work' }">Work</a>
      <a href="#connect" :class="{ active: activeSection === 'connect' }">Connect</a>
    </nav>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(calc(100% - 32px), var(--max));
  margin: 0 auto;
  padding: 18px 0;
  backdrop-filter: blur(12px);
}

.brand {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--ink);
  border-radius: 50%;
  color: var(--ink);
  font-family: var(--mono);
  font-size: 13px;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.nav a {
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.nav a:hover {
  color: var(--ink);
}

.nav a.active {
  color: var(--ink);
  border-bottom-color: var(--green);
}

@media (max-width: 680px) {
  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
