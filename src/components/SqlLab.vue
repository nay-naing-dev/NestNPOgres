<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SqlLabData } from '../content/types'
import { getDb, resetDb, run, type QueryResult } from '../lib/pg'
import { progress } from '../lib/progress'
import CodeBlock from './CodeBlock.vue'

const props = defineProps<{ lab: SqlLabData }>()

const MAX_ROWS = 200
const taskIdx = ref(0)
const drafts = ref<string[]>(props.lab.tasks.map((t) => t.starter ?? ''))
const busy = ref<'' | 'boot' | 'run'>('')
const booted = ref(false)
const result = ref<QueryResult | null>(null)
const error = ref('')
const verdict = ref<'' | 'pass' | 'fail'>('')
const showSolution = ref(false)
const showSchema = ref(false)

const task = computed(() => props.lab.tasks[taskIdx.value])
const solved = (i: number) => !!progress.tasks[`${props.lab.id}:${i}`]

watch(taskIdx, () => {
  result.value = null
  error.value = ''
  verdict.value = ''
  showSolution.value = false
})

function same(a: string[][], b: string[][], ordered: boolean) {
  const flat = (rows: string[][]) => rows.map((r) => JSON.stringify(r))
  const x = flat(a)
  const y = flat(b)
  if (!ordered) {
    x.sort()
    y.sort()
  }
  return x.length === y.length && x.every((v, i) => v === y[i])
}

async function execute() {
  const sql = drafts.value[taskIdx.value].trim()
  if (!sql || busy.value) return
  error.value = ''
  verdict.value = ''
  busy.value = booted.value ? 'run' : 'boot'
  try {
    const db = await getDb(props.lab.id, props.lab.seed)
    booted.value = true
    busy.value = 'run'
    const t = task.value
    const out = await run(db, sql)
    result.value = out

    let pass: boolean
    if (t.match) {
      pass = new RegExp(t.match, 'i').test(out.rows.map((r) => r.join(' ')).join('\n'))
    } else if (t.verify && t.expect) {
      pass = same((await run(db, t.verify)).rows, t.expect, true)
    } else {
      pass = same(out.rows, (await run(db, t.solution)).rows, !!t.ordered)
    }
    verdict.value = pass ? 'pass' : 'fail'
    if (pass) progress.tasks[`${props.lab.id}:${taskIdx.value}`] = true
  } catch (e) {
    result.value = null
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = ''
  }
}

async function reset() {
  await resetDb(props.lab.id)
  booted.value = false
  result.value = null
  error.value = ''
  verdict.value = ''
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    execute()
  } else if (e.key === 'Tab' && !e.shiftKey) {
    e.preventDefault()
    const el = e.target as HTMLTextAreaElement
    el.setRangeText('  ', el.selectionStart, el.selectionEnd, 'end')
    drafts.value[taskIdx.value] = el.value
  }
}
</script>

<template>
  <section class="panel lab">
    <header class="panel-head">
      <span class="panel-title">{{ lab.title }}</span>
      <span class="panel-kind pg">SQL လက်တွေ့ · browser ထဲက PostgreSQL အစစ်</span>
    </header>

    <nav class="tasks" aria-label="လေ့ကျင့်ခန်းများ">
      <button
        v-for="(_t, i) in lab.tasks"
        :key="i"
        type="button"
        :class="{ on: i === taskIdx, solved: solved(i) }"
        :aria-current="i === taskIdx ? 'step' : undefined"
        @click="taskIdx = i"
      >
        {{ solved(i) ? '✓' : '' }} လေ့ကျင့်ခန်း {{ i + 1 }}
      </button>
    </nav>

    <div class="work">
      <p class="prompt" v-html="task.prompt"></p>

      <textarea
        v-model="drafts[taskIdx]"
        spellcheck="false"
        autocapitalize="off"
        rows="5"
        aria-label="SQL ရေးရန်"
        placeholder="ဒီမှာ SQL ရေးပါ…"
        @keydown="onKey"
      ></textarea>

      <div class="actions">
        <button class="btn btn-primary" type="button" :disabled="!!busy" @click="execute">
          {{ busy === 'boot' ? 'PostgreSQL စတင်နေသည်…' : busy === 'run' ? 'Run နေသည်…' : 'Run မယ်' }}
        </button>
        <span class="kbd">Ctrl + Enter</span>
        <button class="btn" type="button" @click="showSchema = !showSchema">
          {{ showSchema ? 'Table ဖွဲ့စည်းပုံ ပိတ်မယ်' : 'Table ဖွဲ့စည်းပုံ ကြည့်မယ်' }}
        </button>
        <button class="btn" type="button" @click="showSolution = !showSolution">
          {{ showSolution ? 'အဖြေ ပိတ်မယ်' : 'အဖြေ ကြည့်မယ်' }}
        </button>
        <button class="btn" type="button" :disabled="!!busy" @click="reset">Database ကို မူလအတိုင်းပြန်ထားမယ်</button>
      </div>

      <CodeBlock v-if="showSchema" :code="lab.schema" lang="sql" file="schema" />
      <CodeBlock v-if="showSolution" :code="task.solution" lang="sql" file="အဖြေ" />

      <p v-if="verdict === 'pass'" class="verdict pass" role="status">မှန်ပါတယ်။ ဒီလေ့ကျင့်ခန်း ပြီးပါပြီ။</p>
      <p v-else-if="verdict === 'fail'" class="verdict fail" role="status">
        Query က run ပါတယ်၊ ဒါပေမဲ့ ရလဒ်က မေးထားတာနဲ့ မကိုက်သေးပါဘူး။ Column နဲ့ row အရေအတွက်ကို ပြန်စစ်ကြည့်ပါ။
      </p>
      <pre v-if="error" class="error" role="alert">PostgreSQL error: {{ error }}</pre>

      <div v-if="result" class="result">
        <div v-if="result.columns.length" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th v-for="(c, i) in result.columns" :key="i">{{ c }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in result.rows.slice(0, MAX_ROWS)" :key="i">
                <td v-for="(c, j) in r" :key="j" :class="{ nul: c === 'NULL' }">{{ c }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="count">
          <template v-if="result.columns.length">
            row {{ result.rows.length }} ခု<span v-if="result.rows.length > MAX_ROWS">၊ ပထမ {{ MAX_ROWS }} ခုကိုပဲ ပြထားတယ်</span>
          </template>
          <template v-else>ပြီးပါပြီ၊ row {{ result.affected }} ခု ပြောင်းသွားတယ်</template>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel-kind.pg {
  color: var(--pg);
}
.tasks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 18px 0;
}
.tasks button {
  border: 1.5px solid var(--line);
  background: none;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--muted);
}
.tasks button.solved {
  color: var(--ok);
  border-color: var(--ok);
}
.tasks button.on {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--bg);
}
.work {
  padding: 12px 18px 18px;
}
.prompt {
  margin: 0 0 10px;
  max-width: 72ch;
}
.prompt :deep(code) {
  font-size: 0.86em;
  background: var(--sunken);
  padding: 2px 6px;
  border-radius: 5px;
}
textarea {
  display: block;
  width: 100%;
  resize: vertical;
  background: var(--code-bg);
  color: var(--code-ink);
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 12px 14px;
  font-family: var(--font-mono);
  font-size: 0.88rem;
  line-height: 1.65;
}
textarea:focus {
  outline: none;
  border-color: var(--pg);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.kbd {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--muted);
  margin-right: auto;
}
.verdict {
  margin: 12px 0 0;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
}
.verdict.pass {
  background: color-mix(in srgb, var(--ok) 16%, var(--surface));
  color: var(--ok);
}
.verdict.fail {
  background: color-mix(in srgb, var(--flow) 16%, var(--surface));
}
.error {
  margin: 12px 0 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--nest) 12%, var(--surface));
  color: var(--nest);
  font-size: 0.85rem;
  white-space: pre-wrap;
}
.result {
  margin-top: 12px;
}
.table-wrap {
  overflow: auto;
  max-height: 22rem;
  border: 1px solid var(--line);
  border-radius: 10px;
}
table {
  border-collapse: collapse;
  width: 100%;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.5;
}
th {
  position: sticky;
  top: 0;
  background: var(--sunken);
  text-align: left;
  padding: 6px 12px;
}
td {
  padding: 5px 12px;
  border-top: 1px solid var(--line);
  white-space: pre;
}
td.nul {
  color: var(--muted);
  font-style: italic;
}
.count {
  margin: 6px 0 0;
  font-size: 0.82rem;
  color: var(--muted);
}
</style>
