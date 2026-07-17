<script setup>
import { ref } from "vue";
import { useBoardReveal } from "../composables/useBoardReveal.js";
import coverMetaphors from "../assets/previews/reading-metaphors.jpg";
import coverEgan from "../assets/previews/reading-egan.jpg";
import coverGhosh from "../assets/previews/reading-ghosh.jpg";
import coverGoliath from "../assets/previews/reading-goliath.jpg";

// What's on the go right now. I usually have a few open at once. This is a
// hand-kept list — update the array whenever the stack changes.
const reading = [
  {
    title: "Metaphors We Live By",
    author: "George Lakoff & Mark Johnson",
    cover: coverMetaphors,
    note:
      "Metaphors are a window into how we actually think. I'm also here because Kieran Egan argues they're badly under-used in education — that we should teach kids to build them on purpose.",
  },
  {
    title: "An Imaginative Approach to Teaching",
    author: "Kieran Egan",
    cover: coverEgan,
    note:
      "The practical companion to Egan's The Educated Mind — how to actually put the theory to work in a classroom.",
  },
  {
    title: "Wild Fictions",
    author: "Amitav Ghosh",
    cover: coverGhosh,
    note:
      "Finally getting into an author I've circled for years. He's best known for his fiction; this collection of essays is my way in.",
  },
  {
    title: "Goliath's Curse",
    author: "Luke Kemp",
    cover: coverGoliath,
    note:
      "A history of collapse — the main patterns worth watching for as our current systems strain.",
  },
];

const sectionRef = ref(null);
useBoardReveal(sectionRef, [".read-item"]);
</script>

<template>
  <section class="reading-section" id="reading" ref="sectionRef">
    <div class="section-intro">
      <p class="kicker">Currently reading</p>
      <h2>On the nightstand.</h2>
      <p class="reading-lede">
        I almost always have a few books going at once. Here's the current
        stack — with a line on why each one's open.
      </p>
    </div>

    <div class="reading-grid" aria-label="Books I'm currently reading">
      <article v-for="b in reading" :key="b.title" class="read-item">
        <span class="read-cover">
          <img :src="b.cover" :alt="`${b.title} by ${b.author}`" loading="lazy" />
        </span>
        <div class="read-meta">
          <h3 class="read-title">{{ b.title }}</h3>
          <span class="read-author">{{ b.author }}</span>
          <p class="read-note">{{ b.note }}</p>
        </div>
      </article>
    </div>

    <a
      class="reading-link"
      href="https://algomalibrary.netlify.app"
      target="_blank"
      rel="noopener"
    >
      Browse my home library&nbsp;↗
    </a>
  </section>
</template>

<style scoped>
.reading-section {
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

.reading-lede {
  max-width: 620px;
  margin: -4px 0 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.6;
}

.reading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
  gap: 34px 40px;
  margin-top: 40px;
}

/* A book on a shelf: cover standing left, note to the right */
.read-item {
  display: flex;
  gap: 22px;
  align-items: flex-start;
}

.read-cover {
  position: relative;
  flex-shrink: 0;
}

.read-cover img {
  display: block;
  width: auto;
  height: 168px;
  border-radius: 2px;
  box-shadow:
    0 1px 0 rgba(24, 39, 36, 0.25),
    0 14px 26px rgba(24, 39, 36, 0.22);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Little shelf the book rests on */
.read-cover::after {
  content: "";
  position: absolute;
  left: -6px;
  right: -6px;
  bottom: -8px;
  height: 8px;
  background: linear-gradient(180deg, rgba(24, 39, 36, 0.14), transparent);
  border-radius: 50%;
  filter: blur(1px);
}

.read-item:hover .read-cover img {
  transform: translateY(-3px) rotate(-1deg);
  box-shadow:
    0 1px 0 rgba(24, 39, 36, 0.25),
    0 20px 34px rgba(24, 39, 36, 0.28);
}

.read-meta {
  display: flex;
  flex-direction: column;
  padding-top: 4px;
}

.read-title {
  margin: 0 0 3px;
  font-size: 20px;
  line-height: 1.18;
}

.read-author {
  margin-bottom: 12px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--muted);
}

.read-note {
  margin: 0;
  color: var(--muted);
  font-size: 14.5px;
  line-height: 1.55;
}

.reading-link {
  display: inline-block;
  margin-top: 36px;
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--ink);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  transition: color 0.2s ease;
}

.reading-link:hover {
  color: var(--green);
}

@media (max-width: 680px) {
  .read-cover img {
    height: 132px;
  }
  .read-title {
    font-size: 18px;
  }
}
</style>
