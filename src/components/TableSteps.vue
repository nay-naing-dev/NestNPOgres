<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableStepsData } from '../content/types'

const props = defineProps<{ data: TableStepsData }>()
const idx = ref(0)
const step = computed(() => props.data.steps[idx.value])
const kept = computed(() => step.value.rows.filter((r) => !r.out).length)
</script>

<template>
  <section class="panel ts">
    <header class="panel-head">
      <span class="panel-title">{{ data.title }}</span>
    </header>

    <div class="body">
      <div class="query" aria-label="SQL query">
        <p class="hint">ရေးတဲ့အစီအစဉ်</p>
        <div
          v-for="line in data.query"
          :key="line.id"
          class="clause"
          :class="{ on: line.id === step.clause }"
        >
          <span class="order">{{ data.steps.findIndex((s) => s.clause === line.id) + 1 }}</span>
          <code>{{ line.text }}</code>
        </div>
        <p class="hint after">ဘယ်ဘက်ကနံပါတ်က PostgreSQL တကယ်တွက်တဲ့အစီအစဉ်</p>
      </div>

      <div class="result">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th v-for="c in step.columns" :key="c">{{ c }}</th>
              </tr>
            </thead>
            <TransitionGroup tag="tbody" name="row">
              <tr
                v-for="r in step.rows"
                :key="r.key"
                :class="[{ out: r.out }, r.group !== undefined ? 'g' + (r.group % 4) : '']"
              >
                <td v-for="(c, i) in r.cells" :key="i">{{ c }}</td>
              </tr>
            </TransitionGroup>
          </table>
        </div>
        <p class="rows">ကျန်တဲ့ row: {{ kept }}</p>
      </div>
    </div>

    <div class="explain" aria-live="polite">
      <h3>{{ idx + 1 }}. {{ step.title }}</h3>
      <p v-html="step.note"></p>
    </div>

    <footer class="controls">
      <button class="btn" type="button" :disabled="idx === 0" @click="idx--">နောက်သို့</button>
      <button class="btn btn-primary" type="button" :disabled="idx === data.steps.length - 1" @click="idx++">
        နောက်အဆင့်
      </button>
      <button v-if="idx === data.steps.length - 1" class="btn" type="button" @click="idx = 0">အစကပြန်ကြည့်မယ်</button>
    </footer>
  </section>
</template>

<style scoped>
.body {
  display: grid;
  grid-template-columns: minmax(250px, 1fr) minmax(0, 1.3fr);
  gap: 20px;
  padding: 18px;
}
@media (max-width: 760px) {
  .body {
    grid-template-columns: 1fr;
  }
}
.hint {
  margin: 0 0 6px;
  font-size: 0.8rem;
  color: var(--muted);
}
.hint.after {
  margin-top: 8px;
}
.clause {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 3px 10px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  opacity: 0.55;
  transition:
    opacity 0.25s,
    background 0.25s;
}
.clause.on {
  opacity: 1;
  border-color: var(--pg);
  background: color-mix(in srgb, var(--pg) 12%, var(--surface));
}
.clause code {
  font-size: 0.86rem;
  white-space: pre-wrap;
}
.order {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--sunken);
  font-size: 0.75rem;
  font-weight: 600;
  display: grid;
  place-items: center;
  line-height: 1;
}
.clause.on .order {
  background: var(--pg);
  color: #fff;
}

.table-wrap {
  overflow-x: auto;
  min-height: 21.5rem;
}
table {
  border-collapse: collapse;
  width: 100%;
  font-family: var(--font-mono);
  font-size: 0.84rem;
  line-height: 1.5;
}
th {
  text-align: left;
  padding: 6px 10px;
  border-bottom: 2px solid var(--ink);
}
td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--line);
}
tr {
  transition:
    opacity 0.4s,
    background 0.4s;
}
tr.out {
  opacity: 0.28;
  text-decoration: line-through;
}
tr.g0 td:first-child {
  box-shadow: inset 4px 0 0 var(--pg);
}
tr.g1 td:first-child {
  box-shadow: inset 4px 0 0 var(--nest);
}
tr.g2 td:first-child {
  box-shadow: inset 4px 0 0 var(--flow);
}
tr.g3 td:first-child {
  box-shadow: inset 4px 0 0 var(--ok);
}
.row-move {
  transition: transform 0.6s cubic-bezier(0.3, 0.8, 0.3, 1);
}
.row-enter-from {
  opacity: 0;
}
.row-leave-active {
  display: none;
}
.rows {
  margin: 6px 0 0;
  font-size: 0.82rem;
  color: var(--muted);
}
.explain {
  padding: 0 18px;
  min-height: 7.5rem;
}
.explain h3 {
  font-size: 1.08rem;
}
.explain p {
  margin: 0.2rem 0 0.6rem;
  max-width: 70ch;
}
.explain :deep(code) {
  font-size: 0.86em;
  background: var(--sunken);
  padding: 2px 6px;
  border-radius: 5px;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 18px 16px;
}
</style>
