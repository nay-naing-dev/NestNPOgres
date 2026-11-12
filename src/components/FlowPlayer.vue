<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { FlowNode, FlowScene } from '../content/types'
import CodeBlock from './CodeBlock.vue'

const props = defineProps<{ scene: FlowScene; compact?: boolean; loop?: boolean; autoplay?: boolean }>()

const NODE_W = 130
const NODE_H = 54

const scenarioIdx = ref(0)
const stepIdx = ref(0)
const playing = ref(false)
const speed = ref(1)
const pos = reactive({ x: 0, y: 0 })

const scenario = computed(() => props.scene.scenarios[scenarioIdx.value])
const steps = computed(() => scenario.value.steps)
const step = computed(() => steps.value[stepIdx.value])
const nodeById = computed(() => new Map(props.scene.nodes.map((n) => [n.id, n])))

const reducedMotion =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function size(n: FlowNode) {
  return { w: n.w ?? NODE_W, h: n.h ?? NODE_H }
}
function center(id: string | undefined) {
  const n = id ? nodeById.value.get(id) : undefined
  if (!n) return { x: 0, y: 0 }
  const { w, h } = size(n)
  return { x: n.x + w / 2, y: n.y + h / 2 }
}

/** Where a packet rests: straddling the node's bottom border, so it never covers the label. */
function dock(id: string | undefined) {
  const n = id ? nodeById.value.get(id) : undefined
  const c = center(id)
  return n ? { x: c.x, y: n.y + size(n).h } : c
}

const activeIds = computed(() => {
  const s = step.value
  return new Set([s.from, s.to, s.at].filter(Boolean) as string[])
})
function edgeActive(a: string, b: string) {
  const s = step.value
  return (s.from === a && s.to === b) || (s.from === b && s.to === a)
}

const packetWidth = computed(() => (step.value.packet ? step.value.packet.length * 7.4 + 22 : 0))

let raf = 0
let timer = 0
function stop() {
  cancelAnimationFrame(raf)
  clearTimeout(timer)
}

function afterTravel() {
  if (!playing.value) return
  const reading = props.compact ? 1100 : Math.min(5200, 1900 + step.value.note.length * 9)
  timer = window.setTimeout(next, reading / speed.value)
}

function runStep() {
  stop()
  const s = step.value
  const a = dock(s.from ?? s.at ?? s.to)
  const b = dock(s.to ?? s.at ?? s.from)
  if (reducedMotion || (a.x === b.x && a.y === b.y)) {
    pos.x = b.x
    pos.y = b.y
    afterTravel()
    return
  }
  const duration = 950 / speed.value
  const t0 = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / duration)
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    pos.x = a.x + (b.x - a.x) * e
    pos.y = a.y + (b.y - a.y) * e
    if (t < 1) raf = requestAnimationFrame(tick)
    else afterTravel()
  }
  raf = requestAnimationFrame(tick)
}

function next() {
  if (stepIdx.value < steps.value.length - 1) stepIdx.value++
  else if (props.loop) stepIdx.value = 0
  else playing.value = false
}
function prev() {
  if (stepIdx.value > 0) stepIdx.value--
}
function go(i: number) {
  playing.value = false
  stepIdx.value = i
}
function manual(fn: () => void) {
  playing.value = false
  fn()
}
function togglePlay() {
  if (playing.value) {
    playing.value = false
    stop()
    return
  }
  playing.value = true
  if (stepIdx.value === steps.value.length - 1) stepIdx.value = 0
  else runStep()
}
function pickScenario(i: number) {
  playing.value = false
  scenarioIdx.value = i
  if (stepIdx.value === 0) runStep()
  else stepIdx.value = 0
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') manual(next)
  else if (e.key === 'ArrowLeft') manual(prev)
  else if (e.key === ' ') togglePlay()
  else return
  e.preventDefault()
}

watch(stepIdx, runStep)
onMounted(() => {
  if (props.autoplay && !reducedMotion) playing.value = true
  runStep()
})
onBeforeUnmount(stop)
</script>

<template>
  <section class="flow" :class="{ compact, panel: !compact }">
    <header v-if="!compact" class="panel-head">
      <span class="panel-title">{{ scene.title }}</span>
      <div v-if="scene.scenarios.length > 1" class="scenarios" role="tablist" aria-label="Scenario">
        <button
          v-for="(sc, i) in scene.scenarios"
          :key="sc.id"
          type="button"
          role="tab"
          :aria-selected="i === scenarioIdx"
          :class="{ on: i === scenarioIdx }"
          @click="pickScenario(i)"
        >
          {{ sc.label }}
        </button>
      </div>
    </header>

    <div class="stage" tabindex="0" :aria-label="scene.title + ' animation'" @keydown="onKey">
      <svg :viewBox="`0 0 ${scene.width} ${scene.height}`" :style="{ minWidth: compact ? '640px' : '560px' }">
        <line
          v-for="[a, b, quiet] in scene.edges"
          :key="a + b"
          class="edge"
          :class="{ quiet, on: edgeActive(a, b), [step.tone ?? 'req']: edgeActive(a, b) }"
          :x1="center(a).x"
          :y1="center(a).y"
          :x2="center(b).x"
          :y2="center(b).y"
        />
        <g
          v-for="n in scene.nodes"
          :key="n.id"
          class="node"
          :class="[n.kind ?? 'plain', { on: activeIds.has(n.id) }]"
          :transform="`translate(${n.x} ${n.y})`"
        >
          <rect :width="size(n).w" :height="size(n).h" rx="10" />
          <text :x="size(n).w / 2" :y="n.sub ? size(n).h / 2 - 3 : size(n).h / 2 + 5" class="label">{{ n.label }}</text>
          <text v-if="n.sub" :x="size(n).w / 2" :y="size(n).h / 2 + 14" class="sub">{{ n.sub }}</text>
        </g>
        <g class="packet" :class="step.tone ?? 'req'" :transform="`translate(${pos.x} ${pos.y})`">
          <template v-if="step.packet">
            <rect :x="-packetWidth / 2" y="-13" :width="packetWidth" height="26" rx="13" />
            <text y="4.5">{{ step.packet }}</text>
          </template>
          <circle v-else r="8" />
        </g>
      </svg>
    </div>

    <div class="explain" aria-live="polite">
      <p class="count">အဆင့် {{ stepIdx + 1 }} / {{ steps.length }}</p>
      <h3>{{ step.title }}</h3>
      <template v-if="!compact">
        <p class="note" v-html="step.note"></p>
        <CodeBlock v-if="step.code" :code="step.code" :lang="step.lang ?? 'ts'" />
      </template>
    </div>

    <footer class="controls">
      <button class="btn" type="button" :disabled="stepIdx === 0" @click="manual(prev)">နောက်သို့</button>
      <button class="btn btn-primary" type="button" @click="togglePlay">{{ playing ? 'ရပ်မယ်' : 'ဖွင့်မယ်' }}</button>
      <button class="btn" type="button" :disabled="stepIdx === steps.length - 1" @click="manual(next)">ရှေ့သို့</button>
      <div class="dots">
        <button
          v-for="(_s, i) in steps"
          :key="i"
          type="button"
          :class="{ on: i === stepIdx, past: i < stepIdx }"
          :aria-label="`အဆင့် ${i + 1}`"
          @click="go(i)"
        ></button>
      </div>
      <label v-if="!compact" class="speed">
        အမြန်နှုန်း
        <select v-model.number="speed">
          <option :value="0.5">0.5×</option>
          <option :value="1">1×</option>
          <option :value="2">2×</option>
        </select>
      </label>
    </footer>
  </section>
</template>

<style scoped>
.scenarios {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.scenarios button {
  border: 1.5px solid var(--line);
  background: none;
  border-radius: 99px;
  padding: 0 14px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--muted);
}
.scenarios button.on {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--bg);
}

.stage {
  overflow-x: auto;
  padding: 18px;
  background:
    radial-gradient(circle, var(--line) 1px, transparent 1.2px) 0 0 / 22px 22px,
    var(--surface);
}
.compact .stage {
  border: 1px solid var(--line);
  border-radius: 14px;
}
svg {
  display: block;
  width: 100%;
  height: auto;
}

.edge {
  stroke: var(--line);
  stroke-width: 2.5;
  transition: stroke 0.25s;
}
.edge.quiet:not(.on) {
  opacity: 0;
}
.edge.on {
  stroke-dasharray: 7 6;
  animation: march 0.7s linear infinite;
}
.edge.on.req,
.edge.on.data {
  stroke: var(--flow);
}
.edge.on.res {
  stroke: var(--ok);
}
.edge.on.err {
  stroke: var(--nest);
}
@keyframes march {
  to {
    stroke-dashoffset: -13;
  }
}

.node rect {
  fill: var(--surface);
  stroke: var(--muted);
  stroke-width: 1.8;
  transition:
    fill 0.25s,
    stroke-width 0.25s;
}
.node.nest rect {
  stroke: var(--nest);
}
.node.pg rect {
  stroke: var(--pg);
}
.node.client rect {
  stroke: var(--ink);
}
.node.on rect {
  stroke-width: 3.2;
  fill: color-mix(in srgb, var(--muted) 14%, var(--surface));
}
.node.nest.on rect {
  fill: color-mix(in srgb, var(--nest) 14%, var(--surface));
}
.node.pg.on rect {
  fill: color-mix(in srgb, var(--pg) 16%, var(--surface));
}
.node text {
  text-anchor: middle;
  fill: var(--ink);
  font-family: var(--font-body);
}
.label {
  font-size: 14px;
  font-weight: 600;
}
.sub {
  font-size: 10.5px;
  fill: var(--muted) !important;
  font-family: var(--font-mono) !important;
}

.packet rect,
.packet circle {
  fill: var(--flow);
}
.packet.res rect,
.packet.res circle {
  fill: var(--ok);
}
.packet.err rect,
.packet.err circle {
  fill: var(--nest);
}
.packet.data rect,
.packet.data circle {
  fill: var(--pg);
}
.packet text {
  text-anchor: middle;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  fill: #fff;
}

.explain {
  padding: 16px 18px 4px;
  min-height: 9.5rem;
}
.compact .explain {
  min-height: 0;
  padding: 12px 4px 0;
}
.count {
  margin: 0;
  font-size: 0.82rem;
  color: var(--muted);
}
.explain h3 {
  font-size: 1.1rem;
}
.note {
  margin: 0.3rem 0 0.8rem;
  max-width: 70ch;
}
.note :deep(code) {
  font-size: 0.86em;
  background: var(--sunken);
  padding: 2px 6px;
  border-radius: 5px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 18px 16px;
}
.compact .controls {
  padding: 8px 4px 0;
}
.dots {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 0 8px;
}
.dots button {
  width: 22px;
  height: 8px;
  border-radius: 4px;
  border: 0;
  padding: 0;
  background: var(--line);
}
.dots button.past {
  background: var(--muted);
}
.dots button.on {
  background: var(--flow);
}
.speed {
  margin-left: auto;
  font-size: 0.86rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 8px;
}
select {
  font: inherit;
  color: var(--ink);
  background: var(--surface);
  border: 1.5px solid var(--line);
  border-radius: 8px;
  padding: 2px 6px;
}
</style>
