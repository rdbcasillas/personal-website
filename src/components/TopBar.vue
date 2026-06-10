<script setup>
defineEmits(["open-timeline"]);
</script>

<template>
  <header class="topbar">
    <a class="brand" href="#top">VM</a>
    <nav class="nav" aria-label="Primary navigation">
      <a href="#timeline" @click="$emit('open-timeline')">Timeline</a>
      <a href="#work">Work</a>
      <a href="#connect">Connect</a>
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
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
}

@media (max-width: 680px) {
  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
