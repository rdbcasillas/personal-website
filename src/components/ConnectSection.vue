<template>
  <section class="connect-section" id="connect">
    <p class="kicker">Connect</p>
    <h2>Working on something thoughtful, unusual, or socially useful? Let's talk.</h2>
    <div class="contact-row">
      <a href="mailto:mehra.vatsal@gmail.com">mehra.vatsal@gmail.com</a>
      <a href="https://www.vatsalmehra.com/">vatsalmehra.com</a>
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

.contact-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.contact-row a {
  border-bottom: 2px solid currentColor;
  color: var(--ink);
  font-weight: 600;
  text-decoration: none;
}
</style>
