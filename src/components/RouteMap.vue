<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { builtStops, lessons, tracks } from '../content/curriculum'
import { progress } from '../lib/progress'

// The curriculum drawn like a transit line: each track is a coloured segment, each lesson a station.
const route = useRoute()
const current = computed(() => route.params.id as string | undefined)
const doneCount = computed(() => builtStops.filter((s) => progress.lessons[s.id]).length)
</script>

<template>
  <nav aria-label="သင်ရိုး">
    <p class="tally">
      ပြီးပြီ <strong>{{ doneCount }}</strong> / {{ builtStops.length }}
      <span class="bar"><span :style="{ width: (doneCount / builtStops.length) * 100 + '%' }"></span></span>
    </p>

    <section v-for="t in tracks" :key="t.id" class="track" :class="t.color">
      <h2>{{ t.title }} <span>{{ t.level }}</span></h2>
      <ol>
        <li
          v-for="s in t.stops"
          :key="s.id"
          :class="{ here: s.id === current, done: progress.lessons[s.id], planned: !lessons[s.id], project: s.kind === 'project' }"
        >
          <span class="dot" aria-hidden="true"></span>
          <RouterLink v-if="lessons[s.id]" :to="`/learn/${s.id}`" :aria-current="s.id === current ? 'page' : undefined">
            {{ s.title }}
            <span v-if="progress.lessons[s.id]" class="sr">(ပြီးပြီ)</span>
          </RouterLink>
          <span v-else class="soon">{{ s.title }} <em>မကြာမီ</em></span>
        </li>
      </ol>
    </section>
  </nav>
</template>

<style scoped>
.tally {
  margin: 0 0 14px;
  font-size: 0.86rem;
  color: var(--muted);
}
.tally strong {
  color: var(--ink);
  font-family: var(--font-mono);
}
.bar {
  display: block;
  height: 5px;
  border-radius: 3px;
  background: var(--sunken);
  margin-top: 4px;
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  background: var(--ok);
  transition: width 0.4s;
}

.track {
  --c: var(--muted);
  margin-bottom: 18px;
}
.track.nest {
  --c: var(--nest);
}
.track.pg {
  --c: var(--pg);
}
h2 {
  font-size: 0.95rem;
  color: var(--c);
  margin-bottom: 4px;
}
h2 span {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 0.76rem;
  color: var(--muted);
  margin-left: 4px;
}
ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  position: relative;
  padding: 3px 0 3px 28px;
  font-size: 0.9rem;
  line-height: 1.75;
}
/* the line */
li::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--c);
  opacity: 0.35;
}
li:first-child::before {
  top: 14px;
}
li:last-child::before {
  bottom: calc(100% - 14px);
}
li:only-child::before {
  display: none;
}
/* the station */
.dot {
  position: absolute;
  left: 3px;
  top: 10px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--surface);
  border: 3px solid var(--c);
}
.project .dot {
  border-radius: 3px;
}
.done .dot {
  background: var(--c);
}
.planned .dot {
  border-color: var(--line);
}
a {
  display: block;
  color: var(--ink);
  text-decoration: none;
  border-radius: 6px;
  padding: 0 6px;
  margin-left: -6px;
}
a:hover {
  background: var(--sunken);
}
.here a {
  font-weight: 600;
  background: color-mix(in srgb, var(--c) 13%, var(--surface));
}
.soon {
  color: var(--muted);
}
.soon em {
  font-style: normal;
  font-size: 0.72rem;
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 0 7px;
  margin-left: 4px;
  white-space: nowrap;
}
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
