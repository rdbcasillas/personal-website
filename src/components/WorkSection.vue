<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useBoardReveal } from "../composables/useBoardReveal.js";
import previewWorkshops from "../assets/previews/rationality-workshops.jpg";
import previewResilience from "../assets/previews/rational-resilience.jpg";
import previewPortal from "../assets/previews/portal.jpg";
import previewSubstack from "../assets/previews/clear-and-muddy.jpg";
import shotMouseBrainDev from "../assets/previews/mousebraindev.jpg";
import shot3dBrain from "../assets/previews/3dbrain.jpg";
import previewAlgoma from "../assets/previews/tool-algoma.jpg";
import previewCadence from "../assets/previews/tool-cadence.jpg";

// Flagship, currently-active projects. Each shows a live snapshot of the site.
const building = [
  {
    name: "Rationality Workshops",
    status: "Active",
    url: "https://rationalityworkshops.com",
    preview: previewWorkshops,
    tagline:
      "Workshops on practical rationality — clearer thinking, calibration, and better decisions.",
  },
  {
    name: "Rational Resilience",
    status: "Active",
    url: "https://rationalresilience.org",
    preview: previewResilience,
    tagline:
      "Coaching for better decisions, resilience, and emotional awareness.",
  },
  {
    name: "Portal",
    status: "Active",
    url: "https://enterportal.org",
    preview: previewPortal,
    tagline: "A community for epistemic and personal growth.",
  },
];

// Little tools: everyday analog objects rebuilt as software, all live in use.
// Red X sits behind a login, so its preview is a faithful little SVG of the
// "don't break the chain" calendar instead of a screenshot.
const redXArt = (() => {
  const GX0 = 12, GY0 = 50, CW = 44, CH = 38, COLS = 7, ROWS = 4;
  const W = GX0 * 2 + COLS * CW;
  const H = GY0 + ROWS * CH + 14;
  const marks = new Set([10, 11, 12, 13, 14, 15]);
  let grid = "";
  for (let r = 0; r <= ROWS; r++) {
    const y = GY0 + r * CH;
    grid += `<line x1="${GX0}" y1="${y}" x2="${GX0 + COLS * CW}" y2="${y}" stroke="rgba(24,39,36,0.13)" stroke-width="1"/>`;
  }
  for (let c = 0; c <= COLS; c++) {
    const x = GX0 + c * CW;
    grid += `<line x1="${x}" y1="${GY0}" x2="${x}" y2="${GY0 + ROWS * CH}" stroke="rgba(24,39,36,0.13)" stroke-width="1"/>`;
  }
  let cells = "", xs = "";
  for (let i = 0; i < COLS * ROWS; i++) {
    const n = i + 1;
    const c = i % COLS, r = (i - c) / COLS;
    const x = GX0 + c * CW, y = GY0 + r * CH;
    cells += `<text x="${x + 7}" y="${y + 15}" font-family="SFMono-Regular,Menlo,monospace" font-size="11" fill="rgba(24,39,36,0.5)">${n}</text>`;
    if (marks.has(n)) {
      const cx = x + CW / 2, cy = y + CH / 2 + 1;
      xs += `<path d="M${cx - 12},${cy - 9} Q${cx},${cy - 2} ${cx + 12},${cy + 9}" fill="none" stroke="#c0271c" stroke-width="3.2" stroke-linecap="round"/>`
         +  `<path d="M${cx + 12},${cy - 9} Q${cx},${cy + 2} ${cx - 12},${cy + 9}" fill="none" stroke="#c0271c" stroke-width="3.2" stroke-linecap="round"/>`;
    }
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="display:block" xmlns="http://www.w3.org/2000/svg">`
    + `<rect x="0" y="0" width="${W}" height="${H}" fill="#fbf4e4"/>`
    + `<text x="${GX0 + 2}" y="30" font-family="Georgia,serif" font-size="20" fill="#3a2f1c">July</text>`
    + `<text x="${W - 12}" y="30" text-anchor="end" font-family="SFMono-Regular,Menlo,monospace" font-size="11" fill="#8a7c6e">current 6 · best 7</text>`
    + grid + cells + xs + `</svg>`;
})();

const tools = [
  {
    name: "Algoma Library",
    eyebrow: "My home bookshelf, in 3D",
    url: "https://algomalibrary.netlify.app",
    preview: previewAlgoma,
    tagline:
      "A walk-through of my actual library — drift between shelves, pull any of 647 volumes, and read what's on it.",
  },
  {
    name: "Cadence",
    eyebrow: "The co-working ritual",
    url: "https://pomocoworking.netlify.app",
    preview: previewCadence,
    tagline:
      "A shared Pomodoro room. Pick one thing, go heads-down for 50 minutes alongside others, then compare notes on the break.",
  },
  {
    name: "Red X",
    eyebrow: "The wall calendar, online",
    url: "https://calstreak.netlify.app",
    art: redXArt,
    tagline:
      "Don't break the chain. Cross off each day you show up and watch the streak grow.",
  },
];

const writing = {
  name: "Clear & Muddy",
  preview: previewSubstack,
  url: "https://vats.substack.com",
  tagline:
    "Essays on thinking, learning, and the things I'm working through.",
  latest: {
    title: "Why Do I Want What I Want?",
    blurb:
      "A messy attempt to distinguish what I'm chasing from what I actually care about.",
    date: "Jun 5, 2026",
    url: "https://vats.substack.com/p/why-do-i-want-what-i-want",
  },
};

const talks = [
  {
    title: "Planning Fallacy: Why We Underestimate Time and How to Fix It",
    venue: "EAGx Delhi · Talk & Workshop",
    date: "Dec 2025",
    url: "https://www.youtube.com/watch?v=1RSSnqo2uzQ",
  },
  {
    title: "Calibration & Cognitive Biases Workshop",
    venue: "EAGx Bangalore",
    date: "Oct 2024",
    url: null,
  },
];

// The archive: past projects filed away as index cards. `shot` pins a small
// screenshot to the card as attached evidence.
const moreProjects = [
  {
    name: "Mouse Brain Development DB",
    tag: "Open Source",
    years: "2019 – 2020",
    url: "https://mousebraindev.com",
    shot: shotMouseBrainDev,
    tagline:
      "Interactive visualizations for time-series NGS experiments on murine whole cortex.",
  },
  {
    name: "3D Mouse Brain",
    tag: "Open Source",
    years: "2020 – 2021",
    url: "https://3dbrain.netlify.app",
    shot: shot3dBrain,
    tagline:
      "3D visualization and quantification of supra-spinal neurons across cervical, thoracic, and lumbar segments.",
  },
  {
    name: "Introduction to Applied Rationality",
    tag: "Course",
    years: "2021",
    url: "https://hyperlink.academy/courses/introduction-to-applied-rationality/54",
    shot: null,
    doodle: "course",
    tagline:
      "A course exploring frameworks and techniques for achieving what we most want with the resources we have.",
  },
  {
    name: "Cerebral",
    tag: "Podcast",
    years: "2020 – 2021",
    url: "https://open.spotify.com/show/79oICYy7ndxZIrQQWunirp",
    shot: null,
    doodle: "podcast",
    tagline:
      "A podcast on human biases and how to improve thinking and decision-making.",
  },
];

// Each paper is tagged with the research field(s) it spans; the helix colours
// its base pair accordingly and the legend explains the scheme.
const domainMeta = {
  neuro: { label: "Neuroscience", color: "#d75f49" },
  genomics: { label: "Genomics", color: "#0f7b66" },
  ml: { label: "Machine Learning", color: "#2c6f93" },
};
const domainOrder = ["neuro", "genomics", "ml"];

const publications = [
  {
    year: "2022",
    title:
      "Brain-wide analysis of the supraspinal connectome reveals anatomical correlates to functional recovery after spinal injury",
    journal: "eLife",
    domains: ["neuro"],
    url: "https://elifesciences.org/articles/76254",
    abstract:
      "The supraspinal connectome is essential for normal behavior and homeostasis and consists of numerous sensory, motor, and autonomic projections from brain to spinal cord. Study of supraspinal control and its restoration after damage has focused mostly on a handful of major populations that carry motor commands, with only limited consideration of dozens more that provide autonomic or crucial motor modulation. Here, we assemble an experimental workflow to <u class='pen'>rapidly profile the entire supraspinal mesoconnectome in adult mice</u> and disseminate the output in a web-based resource. Optimized viral labeling, 3D imaging, and registration to a mouse digital neuroanatomical atlas assigned <u class='pen'>tens of thousands of supraspinal neurons to 69 identified regions</u>. We demonstrate the ability of this approach to clarify essential points of topographic mapping between spinal levels, measure population-specific sensitivity to spinal injury, and test the relationships between <u class='pen'>region-specific neuronal sparing and variability in functional recovery</u>. This work will spur progress by broadening understanding of essential but understudied supraspinal populations.",
  },
  {
    year: "2021",
    title: "Co-occupancy identifies transcription factor co-operation for axon growth",
    journal: "Nature Communications",
    domains: ["genomics", "neuro"],
    url: "https://www.nature.com/articles/s41467-021-22828-3",
    abstract:
      "Transcription factors (TFs) act as powerful levers to regulate neural physiology and can be targeted to improve cellular responses to injury or disease. Because TFs often depend on cooperative activity, a major challenge is to identify and deploy optimal sets. Here we developed a bioinformatics pipeline, centered on <u class='pen'>TF co-occupancy of regulatory DNA</u>, and used it to predict factors that potentiate the effects of pro-regenerative Klf6 in vitro. High content screens of neurite outgrowth identified cooperative activity by 12 candidates, and systematic testing in a mouse model of corticospinal tract (CST) damage substantiated <u class='pen'>three novel instances of pairwise cooperation</u>. <u class='pen'>Combined Klf6 and Nr5a2 drove the strongest growth</u>, and transcriptional profiling of CST neurons identified Klf6/Nr5a2-responsive gene networks involved in macromolecule biosynthesis and DNA repair. These data identify TF combinations that promote enhanced CST growth, clarify the transcriptional correlates, and provide a bioinformatics approach to detect TF cooperation.",
  },
  {
    year: "2018",
    title:
      "Developmental chromatin restriction of pro-growth gene networks acts as an epigenetic barrier to axon regeneration in cortical neurons",
    journal: "Developmental Neurobiology",
    domains: ["genomics", "neuro"],
    url: "https://www.biorxiv.org/content/10.1101/259408v1",
    abstract:
      "Axon regeneration in the central nervous system is prevented in part by a developmental decline in the intrinsic regenerative ability of maturing neurons. This loss of axon growth ability likely reflects widespread changes in gene expression, but the mechanisms that drive this shift remain unclear. Chromatin accessibility has emerged as a key regulatory mechanism in other cellular contexts, raising the possibility that chromatin structure may contribute to the age-dependent loss of regenerative potential. Here we establish an <u class='pen'>integrated bioinformatic pipeline</u> that combines analysis of developmentally dynamic gene networks with transcription factor regulation and genome-wide maps of chromatin accessibility. When applied to the developing cortex, this pipeline detected <u class='pen'>overall closure of chromatin in sub-networks of genes associated with axon growth</u>. We next analyzed mature CNS neurons that were supplied with various pro-regenerative transcription factors. Unlike prior results with SOX11 and KLF7, here we found that neither JUN nor an activated form of STAT3 promoted substantial corticospinal tract regeneration. Correspondingly, chromatin accessibility in JUN or STAT3 target genes was substantially lower than in predicted targets of SOX11 and KLF7. Finally, we used the pipeline to <u class='pen'>predict pioneer factors</u> that could potentially relieve chromatin constraints at growth-associated loci. Overall this integrated analysis substantiates the hypothesis that dynamic chromatin accessibility contributes to the developmental decline in axon growth ability and influences the efficacy of pro-regenerative interventions in the adult, while also pointing toward selected pioneer factors as high-priority candidates for future combinatorial experiments.",
  },
  {
    year: "2018",
    title:
      "KLF6 and STAT3 co-occupy regulatory DNA and functionally synergize to promote axon growth in CNS neurons",
    journal: "Scientific Reports",
    domains: ["genomics", "neuro"],
    url: "https://www.nature.com/articles/s41598-018-31101-5",
    abstract:
      "The failure of axon regeneration in the CNS limits recovery from damage and disease. Members of the KLF family of transcription factors can exert both positive and negative effects on axon regeneration, but the underlying mechanisms are unclear. Here we show that <u class='pen'>forced expression of KLF6 promotes axon regeneration</u> by corticospinal tract neurons in the injured spinal cord. RNA sequencing identified 454 genes whose expression changed upon forced KLF6 expression in vitro, including sub-networks that were highly enriched for functions relevant to axon extension including cytoskeleton remodeling, lipid synthesis, and bioenergetics. In addition, promoter analysis predicted a functional interaction between KLF6 and a second transcription factor, STAT3, and genome-wide footprinting using ATAC-Seq data confirmed <u class='pen'>frequent co-occupancy</u>. Co-expression of the two factors yielded a <u class='pen'>synergistic elevation of neurite growth</u> in vitro. These data clarify the transcriptional control of axon growth and point the way toward novel interventions to promote CNS regeneration.",
  },
  {
    year: "2018",
    title:
      "Direct HLA genetic comparisons identify highly matched unrelated donor-recipient pairs with improved transplantation outcome",
    journal: "Biology of Blood and Marrow Transplantation",
    domains: ["genomics"],
    url: "https://pubmed.ncbi.nlm.nih.gov/30537549/",
    abstract:
      "HLA matching by allele-level genotyping is largely based on genetic similarity between a few exons that encode the antigen recognition domain (ARD) of the HLA protein. Next-generation sequencing (NGS) can identify HLA genetic polymorphisms in non-ARD-encoding exons, introns, and untranslated regions, but the impact of these polymorphisms on hematopoietic cell transplantation (HCT) outcome is unclear. We performed NGS-based sequencing of 11 HLA loci on a well-characterized retrospective cohort of 166 unrelated donor-recipient HCT pairs. Genetic differences between HCT pairs were identified and visualized using a novel bioinformatics approach that <u class='pen'>directly compares phased full-length HLA sequences</u>. Our approach was able to correctly classify HCT pairs without known HLA allele-level mismatches and also to identify a subset of HLA allele-matched HCT pairs with very few to no genetic differences in the sequenced HLA regions. This highly HLA genetically matched unrelated HCT group shows <u class='pen'>improved overall survival and reduced acute graft-versus-host disease</u> compared with HCT pairs with HLA allele-level mismatches. These results suggest that direct genetic matching of HLA loci may offer an additional means of HCT donor selection beyond traditional HLA allele comparisons and suggests that genetic similarity as defined by HLA sequencing may have a novel role in unrelated HCT donor selection. Finally, our approach can enable larger cohort studies with adequate power to detect differences in other HCT outcomes based on genetic similarity within the HLA loci.",
  },
  {
    year: "2016",
    title:
      "SNPredict: a machine learning approach for detecting low frequency variants in cancer",
    journal: "Master's thesis · Marquette University",
    domains: ["ml", "genomics"],
    url: "https://epublications.marquette.edu/theses_open/367/",
    abstract:
      "Cancer is a genetic disease caused by the accumulation of DNA variants such as single nucleotide changes or insertions/deletions in DNA. DNA variants can cause silencing of tumor suppressor genes or increase the activity of oncogenes. In order to come up with successful therapies for cancer patients, these DNA variants need to be identified accurately. DNA variants can be identified by comparing DNA sequence of tumor tissue to a non-tumor tissue by using Next Generation Sequencing (NGS) technology. But the problem of detecting variants in cancer is hard because many of these variant occurs only in a small subpopulation of the tumor tissue. It becomes a challenge to distinguish these low frequency variants from sequencing errors, which are common in today's NGS methods. Several algorithms have been made and implemented as a tool to identify such variants in cancer. However, it has been previously shown that there is low concordance in the results produced by these tools. Moreover, the number of false positives tend to significantly increase when these tools are faced with low frequency variants. This study presents <u class='pen'>SNPredict, a single nucleotide polymorphism (SNP) detection pipeline</u> that aims to utilize the results of multiple variant callers to produce a <u class='pen'>consensus output with higher accuracy</u> than any of the individual tool with the help of <u class='pen'>machine learning techniques</u>. By extracting features from the consensus output that describe traits associated with an individual variant call, it creates binary classifiers that predict a SNP's true state and therefore help in distinguishing a sequencing error from a true variant.",
  },
];

// Pre-resolve each paper's field metadata for the template.
const pubRows = publications.map((pub) => ({
  ...pub,
  fields: pub.domains.map((d) => domainMeta[d]),
}));

// --- Continuous DNA-helix backbone behind the list -------------------------
// One SVG spans the whole list; the two backbones are sine-like strands that
// alternate sides at each paper's measured center (so rungs sit where the
// strands are farthest apart and the strands cross between them). Measuring the
// real rows keeps it aligned no matter how titles wrap.
const HELIX_COL = 76; // px width of the strand column
const HELIX_CX = 38; // strand centre line
const HELIX_AMP = 22; // how far each strand bows from centre
const helixWrapRef = ref(null);
const helix = ref({ h: 0, a: "", b: "", rungs: [] });

// Which paper's abstract is open (one at a time); null = none.
const openIndex = ref(null);
const openPub = computed(() =>
  openIndex.value === null ? null : pubRows[openIndex.value]
);
function toggleAbstract(i) {
  openIndex.value = openIndex.value === i ? null : i;
}

function buildHelix() {
  const wrap = helixWrapRef.value;
  if (!wrap) return;
  // Measure each row's HEADER (not the whole row) so a rung stays aligned to the
  // title even when an abstract note expands below/beside it.
  const heads = Array.from(wrap.querySelectorAll(".helix-head"));
  if (!heads.length) return;
  const h = wrap.offsetHeight;
  const wrapTop = wrap.getBoundingClientRect().top;
  const centers = heads.map((el) => {
    const r = el.getBoundingClientRect();
    return r.top - wrapTop + r.height / 2;
  });
  const cx = HELIX_CX;
  const a = HELIX_AMP;
  const side = (k) => (((k % 2) + 2) % 2 === 0 ? a : -a);
  const nodes = (sign) => {
    const pts = [{ x: cx + sign * side(-1), y: 0 }];
    centers.forEach((y, i) => pts.push({ x: cx + sign * side(i), y }));
    pts.push({ x: cx + sign * side(centers.length), y: h });
    return pts;
  };
  const toPath = (pts) => {
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1];
      const c = pts[i];
      const my = (p.y + c.y) / 2;
      d += ` C${p.x},${my} ${c.x},${my} ${c.x},${c.y}`;
    }
    return d;
  };
  const rungs = centers.map((y, i) => ({
    y,
    c0: pubRows[i].fields[0].color,
    c1: (pubRows[i].fields[1] || pubRows[i].fields[0]).color,
  }));
  helix.value = { h, a: toPath(nodes(1)), b: toPath(nodes(-1)), rungs };
}

// Opening/closing an abstract can change the layout height (inline on phone),
// so re-measure the helix afterwards.
watch(openIndex, () => nextTick(buildHelix));

let helixObserver = null;
onMounted(() => {
  requestAnimationFrame(buildHelix);
  if (typeof ResizeObserver !== "undefined" && helixWrapRef.value) {
    helixObserver = new ResizeObserver(buildHelix);
    helixObserver.observe(helixWrapRef.value);
  }
  window.addEventListener("resize", buildHelix);
});
onBeforeUnmount(() => {
  helixObserver?.disconnect();
  window.removeEventListener("resize", buildHelix);
});

const sectionRef = ref(null);
useBoardReveal(sectionRef, [
  ".building-card",
  ".tool-card",
  ".polaroid, .sticky",
  ".more-card",
  ".helix-row",
]);
</script>

<template>
  <section class="section work-section" id="work" ref="sectionRef">
    <div class="section-intro">
      <p class="kicker">Work</p>
      <h2>Things I'm building, writing, and exploring.</h2>
    </div>

    <!-- Tending: ongoing practices -->
    <p class="block-label">Tending</p>
    <div class="building-grid">
      <a
        v-for="p in building"
        :key="p.name"
        class="building-card"
        :href="p.url"
        target="_blank"
        rel="noopener"
      >
        <span class="preview">
          <img :src="p.preview" :alt="`${p.name} website preview`" loading="lazy" />
        </span>
        <span class="building-body">
          <span class="building-head">
            <h3>{{ p.name }}</h3>
            <span class="status">{{ p.status }}</span>
          </span>
          <p>{{ p.tagline }}</p>
          <span class="visit">Visit&nbsp;↗</span>
        </span>
      </a>
    </div>

    <!-- Little tools -->
    <p class="block-label">Little tools</p>
    <p class="tools-intro">
      Small things I built for my own life — each an everyday analog object
      rebuilt as software. All live; take one for a spin.
    </p>
    <div class="tools-grid">
      <a
        v-for="t in tools"
        :key="t.name"
        class="tool-card"
        :href="t.url"
        target="_blank"
        rel="noopener"
      >
        <span class="preview">
          <img
            v-if="t.preview"
            :src="t.preview"
            :alt="`${t.name} preview`"
            loading="lazy"
          />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-else class="tool-art" aria-hidden="true" v-html="t.art"></span>
        </span>
        <span class="tool-body">
          <span class="tool-eyebrow">{{ t.eyebrow }}</span>
          <span class="tool-head">
            <h3>{{ t.name }}</h3>
            <span class="live">
              <span class="live-dot" aria-hidden="true"></span>Live
            </span>
          </span>
          <p>{{ t.tagline }}</p>
          <span class="visit">Visit&nbsp;↗</span>
        </span>
      </a>
    </div>

    <!-- Writing & talks: corkboard -->
    <p class="block-label">Writing &amp; talks</p>
    <div class="pinboard">
      <!-- Writing: pinned polaroid -->
      <div class="board-col">
        <span class="board-tag">Writing</span>
        <a
          class="polaroid"
          :href="writing.latest.url"
          target="_blank"
          rel="noopener"
        >
          <span class="pin pin-coral" aria-hidden="true"></span>
          <span class="polaroid-photo">
            <img
              :src="writing.preview"
              :alt="`${writing.name} — ${writing.latest.title}`"
              loading="lazy"
            />
          </span>
          <span class="polaroid-caption">
            <span class="polaroid-eyebrow">{{ writing.name }} · Substack</span>
            <span class="polaroid-title">Latest: “{{ writing.latest.title }}”</span>
            <span class="visit">Read&nbsp;↗</span>
          </span>
        </a>
        <a class="board-link" :href="writing.url" target="_blank" rel="noopener">
          Browse all essays&nbsp;↗
        </a>
      </div>

      <!-- Talks: sticky notes -->
      <div class="board-col">
        <span class="board-tag">Talks</span>
        <div class="sticky-stack">
          <component
            :is="t.url ? 'a' : 'div'"
            v-for="(t, i) in talks"
            :key="t.title"
            class="sticky"
            :class="[`sticky-${i % 2}`, { 'sticky-link': t.url }]"
            :href="t.url || null"
            :target="t.url ? '_blank' : null"
            :rel="t.url ? 'noopener' : null"
          >
            <span class="pin" :class="i % 2 === 0 ? 'pin-blue' : 'pin-green'" aria-hidden="true"></span>
            <span class="sticky-venue">{{ t.venue }}</span>
            <span class="sticky-title">{{ t.title }}</span>
            <span class="sticky-foot">
              <time>{{ t.date }}</time>
              <span v-if="t.url" class="sticky-watch">Watch&nbsp;↗</span>
            </span>
          </component>
        </div>
      </div>
    </div>

    <!-- More projects: the archive -->
    <p class="block-label">From the archive</p>
    <div class="more-grid">
      <component
        :is="p.url ? 'a' : 'div'"
        v-for="p in moreProjects"
        :key="p.name"
        class="more-card"
        :class="`tab-${p.tag.toLowerCase().replace(/\s+/g, '-')}`"
        :href="p.url || null"
        :target="p.url ? '_blank' : null"
        :rel="p.url ? 'noopener' : null"
      >
        <span class="archive-tab">{{ p.tag }}</span>
        <span v-if="p.shot" class="archive-shot">
          <img :src="p.shot" :alt="`${p.name} screenshot`" loading="lazy" />
        </span>
        <!-- Hand-drawn ink doodles for cards without screenshots -->
        <span v-else-if="p.doodle" class="archive-shot archive-doodle" aria-hidden="true">
          <svg v-if="p.doodle === 'course'" viewBox="0 0 320 120" fill="none">
            <!-- Open book -->
            <path d="M115,42 L115,90" stroke="#182724" stroke-width="2.2" stroke-linecap="round" />
            <path d="M115,42 C96,31 64,33 44,46 L44,94 C64,81 96,79 115,90" stroke="#2c6f93" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M115,42 C134,31 166,33 186,46 L186,94 C166,81 134,79 115,90" stroke="#2c6f93" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M58,54 q21,-7 42,-2" stroke="#2c6f93" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <path d="M58,67 q21,-7 42,-2" stroke="#2c6f93" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <path d="M130,52 q21,-5 42,2" stroke="#2c6f93" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <path d="M130,65 q21,-5 42,2" stroke="#2c6f93" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <!-- Dashed thought-arrow rising to a lightbulb -->
            <path d="M192,72 Q214,62 226,46" stroke="#182724" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="4 6" />
            <path d="M221,48 l6,-3 0,7" stroke="#182724" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Lightbulb -->
            <circle cx="244" cy="32" r="13" stroke="#e2b84b" stroke-width="2.2" />
            <path d="M239,46 q5,4 10,0" stroke="#e2b84b" stroke-width="2" stroke-linecap="round" />
            <path d="M240,51 h8 M242,56 h4" stroke="#182724" stroke-width="1.8" stroke-linecap="round" />
            <path d="M262,20 l7,-6 M264,34 l9,1 M256,12 l3,-8" stroke="#e2b84b" stroke-width="1.8" stroke-linecap="round" />
            <!-- Little idea-graph -->
            <circle cx="272" cy="92" r="5" stroke="#2c6f93" stroke-width="1.8" />
            <circle cx="297" cy="74" r="5" stroke="#2c6f93" stroke-width="1.8" />
            <circle cx="303" cy="100" r="5" stroke="#2c6f93" stroke-width="1.8" />
            <path d="M276,88 l16,-10 M277,95 l21,4 M298,79 l4,16" stroke="#182724" stroke-width="1.4" stroke-linecap="round" opacity="0.6" />
          </svg>
          <svg v-else viewBox="0 0 320 120" fill="none">
            <!-- Microphone -->
            <rect x="72" y="18" width="34" height="58" rx="17" stroke="#d75f49" stroke-width="2.2" />
            <path d="M79,36 h20 M79,46 h20 M79,56 h20" stroke="#d75f49" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
            <path d="M58,58 a31,31 0 0 0 62,0" stroke="#182724" stroke-width="2.2" stroke-linecap="round" />
            <path d="M89,89 v14" stroke="#182724" stroke-width="2.2" stroke-linecap="round" />
            <path d="M71,104 h36" stroke="#182724" stroke-width="2.2" stroke-linecap="round" />
            <!-- Sound arcs -->
            <path d="M132,36 q13,15 0,30" stroke="#d75f49" stroke-width="2" stroke-linecap="round" />
            <path d="M145,28 q21,23 0,46" stroke="#182724" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="4 6" />
            <path d="M158,21 q29,30 0,60" stroke="#d75f49" stroke-width="2" stroke-linecap="round" opacity="0.6" />
            <!-- Waveform -->
            <path d="M196,53 v14 M205,44 v32 M214,55 v10 M223,34 v52 M232,49 v22 M241,41 v38 M250,55 v10 M259,46 v28 M268,52 v16 M277,57 v6 M286,44 v32 M295,53 v14" stroke="#182724" stroke-width="2.6" stroke-linecap="round" opacity="0.75" />
            <path d="M223,34 v52 M259,46 v28" stroke="#d75f49" stroke-width="2.6" stroke-linecap="round" />
          </svg>
        </span>
        <span class="more-head">
          <h3>{{ p.name }}</h3>
          <span v-if="p.years" class="archive-years">{{ p.years }}</span>
        </span>
        <p>{{ p.tagline }}</p>
      </component>
    </div>

    <p class="block-label">Publications</p>
    <p class="pub-intro">Peer-reviewed work across three fields. Each rung is a paper; its base pair is coloured by the field(s) it spans.</p>
    <div class="helix-legend">
      <span
        v-for="d in domainOrder"
        :key="d"
        class="legend-item"
        :style="{ '--c': domainMeta[d].color }"
      >
        <span class="legend-dot" aria-hidden="true"></span>{{ domainMeta[d].label }}
      </span>
    </div>
    <div class="pub-layout" :class="{ 'has-open': openIndex !== null }">
      <div class="helix-wrap" ref="helixWrapRef">
        <svg
          class="helix-overlay"
          :width="HELIX_COL"
          :height="helix.h"
          :viewBox="`0 0 ${HELIX_COL} ${helix.h}`"
          aria-hidden="true"
        >
          <path class="strand strand-b" :d="helix.b" />
          <path class="strand strand-a" :d="helix.a" />
          <g v-for="(r, i) in helix.rungs" :key="i">
            <line
              class="rung"
              :x1="HELIX_CX - HELIX_AMP"
              :y1="r.y"
              :x2="HELIX_CX"
              :y2="r.y"
              :style="{ stroke: r.c0 }"
            />
            <line
              class="rung"
              :x1="HELIX_CX"
              :y1="r.y"
              :x2="HELIX_CX + HELIX_AMP"
              :y2="r.y"
              :style="{ stroke: r.c1 }"
            />
            <circle class="node" :cx="HELIX_CX - HELIX_AMP" :cy="r.y" r="3.4" :style="{ fill: r.c0 }" />
            <circle class="node" :cx="HELIX_CX + HELIX_AMP" :cy="r.y" r="3.4" :style="{ fill: r.c1 }" />
          </g>
        </svg>

        <div
          v-for="(row, i) in pubRows"
          :key="row.url"
          class="helix-row"
          :class="{ open: openIndex === i }"
        >
          <button
            class="helix-head"
            :aria-expanded="openIndex === i"
            @click="toggleAbstract(i)"
          >
            <span class="helix-title">{{ row.title }}</span>
            <span class="helix-meta">
              <em>{{ row.journal }} · {{ row.year }}</em>
              <span class="helix-tags">
                <span
                  v-for="f in row.fields"
                  :key="f.label"
                  class="field-tag"
                  :style="{ '--c': f.color }"
                  >{{ f.label }}</span
                >
              </span>
              <span class="helix-cue">{{ openIndex === i ? "Close −" : "Abstract +" }}</span>
            </span>
          </button>

          <!-- Inline note: phones / narrow screens only -->
          <div v-if="openIndex === i" class="abstract-note abstract-note--inline">
            <span class="abstract-label">Abstract</span>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p class="abstract-text" v-html="row.abstract"></p>
            <a class="abstract-read" :href="row.url" target="_blank" rel="noopener"
              >Read the paper&nbsp;↗</a
            >
          </div>
        </div>
      </div>

      <!-- Sticky note: fills the right column on desktop -->
      <aside class="pub-aside">
        <div v-if="openPub" class="abstract-note abstract-note--aside">
          <span class="abstract-label">Abstract · {{ openPub.journal }} · {{ openPub.year }}</span>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p class="abstract-text" v-html="openPub.abstract"></p>
          <a class="abstract-read" :href="openPub.url" target="_blank" rel="noopener"
            >Read the paper&nbsp;↗</a
          >
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.section {
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

.block-label {
  margin: 56px 0 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
}

/* Currently building */
.building-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 18px;
}

.building-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  background: rgba(255, 253, 248, 0.7);
  text-decoration: none;
  color: var(--ink);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Slight hand-placed scatter; cards straighten on hover */
.building-card:nth-child(3n + 1) { transform: rotate(-0.6deg); }
.building-card:nth-child(3n + 2) { transform: rotate(0.45deg); }
.building-card:nth-child(3n) { transform: rotate(-0.3deg); }

/* Translucent tape strip holding each card up */
.building-card::before {
  content: "";
  position: absolute;
  top: -11px;
  left: 50%;
  width: 88px;
  height: 24px;
  background: rgba(248, 242, 226, 0.65);
  border-left: 2px dotted rgba(24, 39, 36, 0.08);
  border-right: 2px dotted rgba(24, 39, 36, 0.08);
  box-shadow: 0 1px 3px rgba(24, 39, 36, 0.14);
  transform: translateX(-50%) rotate(-2deg);
  z-index: 3;
}

.building-card:nth-child(even)::before {
  transform: translateX(-50%) rotate(1.6deg);
}

.building-card:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 16px 36px rgba(24, 39, 36, 0.14);
}

.preview {
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
  background: var(--paper-alt);
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.4s ease;
}

.building-card:hover .preview img {
  transform: scale(1.04);
}

.building-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 22px 22px;
  flex-grow: 1;
}

.building-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.status {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(15, 123, 102, 0.12);
  color: var(--green);
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
}

.building-card p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.5;
  flex-grow: 1;
}

.visit {
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  color: var(--ink);
  border-bottom: 1px solid currentColor;
  align-self: flex-start;
}

/* Little tools — siblings of the building cards, flagged live not taped */
.tools-intro {
  max-width: 600px;
  margin: -6px 0 22px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.55;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 18px;
}

.tool-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  background: rgba(255, 253, 248, 0.7);
  text-decoration: none;
  color: var(--ink);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Same hand-placed scatter as the building cards, gentler angles */
.tool-card:nth-child(3n + 1) { transform: rotate(-0.5deg); }
.tool-card:nth-child(3n + 2) { transform: rotate(0.4deg); }
.tool-card:nth-child(3n) { transform: rotate(-0.25deg); }

.tool-card:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 16px 36px rgba(24, 39, 36, 0.14);
}

.tool-card:hover .preview img {
  transform: scale(1.04);
}

.tool-art {
  display: block;
  width: 100%;
  height: 100%;
}

.tool-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px 20px;
  flex-grow: 1;
}

.tool-eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--green);
}

.tool-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.live {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(215, 95, 73, 0.12);
  color: var(--coral);
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--coral);
  animation: livePulse 2.2s ease-out infinite;
}

@keyframes livePulse {
  0% { box-shadow: 0 0 0 0 rgba(215, 95, 73, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(215, 95, 73, 0); }
  100% { box-shadow: 0 0 0 0 rgba(215, 95, 73, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .live-dot { animation: none; }
}

.tool-card p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.5;
  flex-grow: 1;
}

.tool-card .visit {
  margin-top: 4px;
}

/* Writing & talks corkboard */
.pinboard {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 40px;
  padding: 40px 44px 48px;
  border: 1px solid var(--line);
  background:
    linear-gradient(90deg, rgba(24, 39, 36, 0.045) 1px, transparent 1px),
    linear-gradient(180deg, rgba(24, 39, 36, 0.045) 1px, transparent 1px),
    rgba(255, 250, 240, 0.5);
  background-size: 26px 26px;
  box-shadow: inset 0 0 60px rgba(24, 39, 36, 0.05);
}

.board-col {
  position: relative;
}

.board-tag {
  display: inline-block;
  margin-bottom: 22px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Pushpins */
.pin {
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

.pin::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 4px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.pin-coral { background: var(--coral); }
.pin-blue { background: var(--blue); }
.pin-green { background: var(--green); }

/* Writing polaroid */
.polaroid {
  position: relative;
  display: block;
  padding: 14px 14px 18px;
  background: #fffdf8;
  text-decoration: none;
  color: var(--ink);
  box-shadow: 0 16px 34px rgba(24, 39, 36, 0.16);
  transform: rotate(-2deg);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.polaroid:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 22px 46px rgba(24, 39, 36, 0.22);
}

.polaroid-photo {
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--paper-alt);
}

.polaroid-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.polaroid-caption {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 6px 4px;
}

.polaroid-eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--green);
}

.polaroid-title {
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1.2;
}

.polaroid .visit {
  margin-top: 6px;
}

.board-link {
  display: inline-block;
  margin-top: 22px;
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
  transition: color 0.2s ease, border-color 0.2s ease;
}

.board-link:hover {
  color: var(--ink);
  border-color: var(--ink);
}

/* Talks sticky notes */
.sticky-stack {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-top: 6px;
}

.sticky {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 22px 18px;
  color: var(--ink);
  text-decoration: none;
  box-shadow: 0 12px 26px rgba(24, 39, 36, 0.14);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.sticky-0 {
  background: #fdf3c4;
  transform: rotate(1.6deg);
}

.sticky-1 {
  background: #e7f1fb;
  transform: rotate(-1.4deg);
}

.sticky-link:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 20px 38px rgba(24, 39, 36, 0.2);
}

.sticky-venue {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--muted);
}

.sticky-title {
  font-family: var(--serif);
  font-size: 19px;
  line-height: 1.25;
}

.sticky-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
}

.sticky-foot time {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--muted);
}

.sticky-watch {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--ink);
  border-bottom: 1px solid currentColor;
}

/* From the archive: index cards with folder tabs */
.more-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 36px 18px;
  padding-top: 30px; /* room for the tabs */
}

.more-card {
  position: relative;
  display: block;
  padding: 18px 20px 16px;
  border: 1px solid rgba(24, 39, 36, 0.16);
  /* Ruled index-card lines over paper */
  background:
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 25px,
      rgba(44, 111, 147, 0.09) 25px,
      rgba(44, 111, 147, 0.09) 26px
    ),
    var(--paper);
  box-shadow: 0 10px 24px rgba(24, 39, 36, 0.09);
  text-decoration: none;
  color: var(--ink);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.more-card:nth-child(odd) { transform: rotate(-0.4deg); }
.more-card:nth-child(even) { transform: rotate(0.35deg); }

a.more-card:hover {
  transform: rotate(0deg) translateY(-3px);
  box-shadow: 0 16px 34px rgba(24, 39, 36, 0.14);
}

/* Folder tab peeking above the card */
.archive-tab {
  position: absolute;
  top: -23px;
  left: 16px;
  padding: 5px 14px 4px;
  border: 1px solid rgba(24, 39, 36, 0.16);
  border-bottom: none;
  border-radius: 7px 7px 0 0;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tab-open-source .archive-tab {
  background: #e3efe9;
  color: var(--green);
}

.tab-course .archive-tab {
  background: #e7f0f7;
  color: var(--blue);
}

.tab-podcast .archive-tab {
  background: #f9e9e4;
  color: var(--coral);
}

/* Attached evidence: a small taped-on screenshot */
.archive-shot {
  position: relative;
  display: block;
  margin: 4px 0 14px;
  padding: 6px;
  background: #fffdf8;
  border: 1px solid rgba(24, 39, 36, 0.1);
  box-shadow: 0 6px 16px rgba(24, 39, 36, 0.1);
  transform: rotate(-0.8deg);
}

.more-card:nth-child(even) .archive-shot {
  transform: rotate(0.7deg);
}

.archive-shot::before {
  content: "";
  position: absolute;
  top: -8px;
  left: 50%;
  width: 64px;
  height: 16px;
  background: rgba(248, 242, 226, 0.7);
  border-left: 2px dotted rgba(24, 39, 36, 0.08);
  border-right: 2px dotted rgba(24, 39, 36, 0.08);
  box-shadow: 0 1px 3px rgba(24, 39, 36, 0.14);
  transform: translateX(-50%) rotate(-1.5deg);
  z-index: 2;
}

.archive-shot img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 7;
  object-fit: cover;
  /* Bottom-anchored: both captures have their figures/charts low, prose up top */
  object-position: left bottom;
}

.archive-doodle svg {
  display: block;
  width: 100%;
  height: auto;
  background:
    linear-gradient(90deg, rgba(24, 39, 36, 0.035) 1px, transparent 1px),
    linear-gradient(180deg, rgba(24, 39, 36, 0.035) 1px, transparent 1px);
  background-size: 18px 18px; /* faint graph paper behind the sketch */
}

.more-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.more-head h3 {
  font-size: 17px;
}

.archive-years {
  flex-shrink: 0;
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--muted);
}

.more-card p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

/* --- Publications: a DNA double-helix of papers ----------------------------- */
.pub-intro {
  max-width: 600px;
  margin: -6px 0 22px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.55;
}

.helix-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  margin-bottom: 10px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c);
}

.pub-layout {
  display: grid;
  grid-template-columns: minmax(0, 680px) minmax(0, 1fr);
  gap: 36px;
  align-items: start;
}

.pub-aside {
  position: relative;
}

.helix-wrap {
  position: relative;
  border-top: 1px solid var(--line);
}

/* The continuous helix runs the full height behind the rows */
.helix-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.strand {
  fill: none;
  stroke-width: 2.4;
  stroke-linecap: round;
}

/* Two backbone tones so the weave reads as a 3D double helix */
.strand-a {
  stroke: rgba(24, 39, 36, 0.5);
}

.strand-b {
  stroke: rgba(24, 39, 36, 0.2);
}

.rung {
  stroke-width: 4;
  stroke-linecap: round;
}

.node {
  stroke: var(--paper);
  stroke-width: 1.2;
}

.helix-row {
  position: relative;
  border-bottom: 1px solid var(--line);
  transition: opacity 0.25s ease;
}

/* When an abstract is open, the other papers recede so it stands out */
.pub-layout.has-open .helix-row:not(.open) {
  opacity: 0.38;
}

/* The clickable header (title + meta) */
.helix-head {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 78px;
  margin: 0;
  padding: 14px 10px 14px 96px; /* leave room for the strand column */
  border: none;
  background: none;
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.helix-head:hover,
.helix-row.open .helix-head {
  background: rgba(24, 39, 36, 0.035);
}

.helix-title {
  font-family: var(--serif);
  font-size: 16px;
  line-height: 1.34;
  color: var(--ink);
}

.helix-head:hover .helix-title {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

.helix-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
}

.helix-cue {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  opacity: 0.75;
}

/* --- Abstract sticky note --------------------------------------------------- */
.abstract-note {
  --rot: -0.7deg;
  position: relative;
  padding: 32px 34px 28px;
  color: #3a2f1c;
  /* aged rag paper kept close to snow white: faint foxing + soft edge age */
  background:
    radial-gradient(55% 40% at 84% 86%, rgba(120, 96, 52, 0.045), transparent 70%),
    radial-gradient(38% 28% at 14% 20%, rgba(120, 96, 52, 0.035), transparent 70%),
    radial-gradient(140% 130% at 50% -10%, transparent 66%, rgba(96, 78, 44, 0.07)),
    linear-gradient(178deg, #fefdfb, #f6f5ef);
  border: 1px solid rgba(70, 58, 34, 0.16);
  box-shadow: 0 18px 38px rgba(24, 39, 36, 0.2),
    inset 0 0 44px rgba(150, 130, 80, 0.05);
  transform: rotate(var(--rot));
  transform-origin: top left;
  animation: noteIn 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 4;
}

/* Faint paper-fibre grain over the sheet */
.abstract-note::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.32;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E");
}

/* Desktop: the sheet fills the right column and follows the scroll */
.abstract-note--aside {
  position: sticky;
  top: 90px;
  width: min(100%, 460px);
}

/* Inline note is desktop-hidden; shown on narrow screens (rules below) */
.abstract-note--inline {
  display: none;
}

/* Typed letterhead line */
.abstract-label {
  position: relative;
  display: block;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(120, 90, 40, 0.32);
  font-family: var(--type-alt);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(74, 59, 38, 0.85);
}

/* The typed abstract body — larger, airy, sepia ink */
.abstract-text {
  position: relative;
  margin: 0 0 20px;
  font-family: var(--type);
  font-size: 16.5px;
  line-height: 1.95;
  letter-spacing: 0.005em;
  color: #3a2f1c;
}

/* Important phrases marked as if with a red pen — a slightly wavy ink stroke */
.abstract-text u {
  text-decoration: none;
  padding-bottom: 2px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 6'%3E%3Cpath d='M1 4 C 5 2, 8 5.2, 12 3.6 S 19 2, 23 3.9' fill='none' stroke='%23c0271c' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E")
    repeat-x left bottom;
  background-size: 24px 6px;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.abstract-read {
  position: relative;
  font-family: var(--type-alt);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a5a22;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
}

.abstract-read:hover {
  color: #3a2f1c;
}

@keyframes noteIn {
  from {
    opacity: 0;
    transform: rotate(var(--rot)) translateY(-6px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: rotate(var(--rot)) translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .abstract-note {
    animation: none;
  }
}

/* Below the point where the RHS gutter runs out, drop the note inline */
@media (max-width: 1024px) {
  .pub-layout {
    grid-template-columns: 1fr;
  }
  .pub-aside {
    display: none;
  }
  .abstract-note--inline {
    display: block;
    width: auto;
    max-width: 560px;
    margin: 2px 0 18px 96px;
    transform: rotate(-0.5deg);
    animation: none;
  }
}

.helix-meta em {
  font-style: normal;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--muted);
}

.helix-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.field-tag {
  padding: 2px 9px;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 32%, transparent);
}

@media (max-width: 860px) {
  .pinboard {
    grid-template-columns: 1fr;
    gap: 44px;
    padding: 32px 24px 40px;
  }
}

@media (max-width: 680px) {
  .more-grid {
    grid-template-columns: 1fr;
  }

  .helix-head {
    padding-left: 78px;
  }

  .abstract-note--inline {
    margin-left: 78px;
    max-width: none;
  }
}
</style>
