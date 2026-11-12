<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChallengeData } from '../content/types'
import { progress } from '../lib/progress'
import CodeBlock from './CodeBlock.vue'

const props = defineProps<{ data: ChallengeData }>()
const hintsShown = ref(0)
const showSolution = ref(false)

const key = (i: number) => `${props.data.id}:${i}`
const doneCount = computed(() => props.data.requirements.filter((_r, i) => progress.checks[key(i)]).length)
</script>

<template>
  <section class="panel challenge">
    <header class="panel-head">
      <span class="panel-title">{{ data.title }}</span>
      <span class="panel-kind">ကိုယ့်စက်မှာ ရေးရမယ့် challenge</span>
    </header>

    <div class="inner">
      <div class="brief" v-html="data.brief"></div>

      <h3>ပြီးမြောက်ရမယ့်အချက်များ <span class="tally">{{ doneCount }} / {{ data.requirements.length }}</span></h3>
      <ul class="reqs">
        <li v-for="(r, i) in data.requirements" :key="i">
          <label>
            <input v-model="progress.checks[key(i)]" type="checkbox" />
            <span v-html="r"></span>
          </label>
        </li>
      </ul>

      <ol v-if="hintsShown" class="hints">
        <li v-for="(h, i) in data.hints.slice(0, hintsShown)" :key="i" v-html="h"></li>
      </ol>

      <div class="actions">
        <button v-if="hintsShown < data.hints.length" class="btn" type="button" @click="hintsShown++">
          အရိပ်အမြွက် ကြည့်မယ် ({{ hintsShown }} / {{ data.hints.length }})
        </button>
        <button class="btn" type="button" @click="showSolution = !showSolution">
          {{ showSolution ? 'အဖြေ ပိတ်မယ်' : 'အဖြေ code ကြည့်မယ်' }}
        </button>
      </div>

      <div v-if="showSolution">
        <p class="warn">အရင်ဆုံး ကိုယ်တိုင်ကြိုးစားပြီးမှ ကြည့်ပါ။ ကိုယ့်အဖြေနဲ့ တစ်ထပ်တည်းဖြစ်စရာမလိုပါဘူး။</p>
        <CodeBlock v-for="s in data.solution" :key="s.file" :code="s.code" :lang="s.lang" :file="s.file" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  border-left: 5px solid var(--nest);
}
.panel-kind {
  color: var(--nest);
}
.inner {
  padding: 14px 18px 18px;
}
.brief {
  max-width: 70ch;
}
.brief :deep(p) {
  margin: 0 0 0.8rem;
}
.brief :deep(code),
.reqs :deep(code),
.hints :deep(code) {
  font-size: 0.86em;
  background: var(--sunken);
  padding: 2px 6px;
  border-radius: 5px;
}
h3 {
  font-size: 1rem;
  margin-top: 0.6rem;
}
.tally {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: 0.84rem;
  color: var(--muted);
  margin-left: 6px;
}
.reqs {
  list-style: none;
  margin: 6px 0 12px;
  padding: 0;
}
.reqs label {
  display: flex;
  gap: 10px;
  align-items: baseline;
  padding: 2px 0;
  cursor: pointer;
}
.reqs input {
  flex: none;
  width: 17px;
  height: 17px;
  accent-color: var(--ok);
  transform: translateY(3px);
}
.reqs input:checked + span {
  color: var(--muted);
}
.hints {
  margin: 0 0 12px;
  padding: 10px 14px 10px 34px;
  background: var(--sunken);
  border-radius: 10px;
  font-size: 0.95rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.warn {
  margin: 14px 0 0;
  font-size: 0.92rem;
  color: var(--muted);
}
</style>
