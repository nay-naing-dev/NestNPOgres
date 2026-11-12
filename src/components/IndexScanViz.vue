<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

// 48 rows in the "heap". The B-tree has a root, 3 internal pages and 12 leaf pages (4 keys each).
const N = 48
const target = ref(37)
const seqPos = ref(-1) // last row the sequential scan has read
const idxStage = ref(0) // 0 idle, 1 root, 2 internal, 3 leaf, 4 heap fetch
const running = ref(false)

const internalIdx = computed(() => Math.floor((target.value - 1) / 16))
const leafIdx = computed(() => Math.floor((target.value - 1) / 4))
const seqDone = computed(() => seqPos.value >= N - 1)

const internals = [0, 1, 2].map((i) => ({ i, x: 80 + i * 160, keys: [5, 9, 13].map((k) => k + i * 16).join(' | ') }))
const leaves = Array.from({ length: 12 }, (_, j) => ({ j, x: 20 + j * 40, label: `${j * 4 + 1}–${j * 4 + 4}` }))

let seqTimer = 0
let idxTimer = 0
function clear() {
  clearInterval(seqTimer)
  clearInterval(idxTimer)
}
function reset() {
  clear()
  running.value = false
  seqPos.value = -1
  idxStage.value = 0
}
function play() {
  reset()
  running.value = true
  seqTimer = window.setInterval(() => {
    seqPos.value++
    if (seqPos.value >= N - 1) {
      clearInterval(seqTimer)
      running.value = false
    }
  }, 75)
  idxTimer = window.setInterval(() => {
    idxStage.value++
    if (idxStage.value >= 4) clearInterval(idxTimer)
  }, 650)
}
onBeforeUnmount(clear)

const stageText = [
  'စောင့်နေသည်',
  'Root page ကိုဖတ်ပြီး ဘယ် branch ထဲမှာရှိမလဲ ဆုံးဖြတ်',
  'Internal page ကိုဖတ်ပြီး leaf တစ်ခုကို ရွေး',
  'Leaf page ထဲမှာ key ကိုတွေ့ပြီး row ရဲ့တည်နေရာ (TID) ကိုရ',
  'Heap ထဲက row တစ်ခုတည်းကို တန်းသွားယူ၊ ပြီးပြီ',
]
</script>

<template>
  <section class="panel">
    <header class="panel-head">
      <span class="panel-title">Seq Scan နဲ့ Index Scan ပြိုင်ကြည့်မယ်</span>
      <label class="target">
        ရှာမယ့် id
        <input v-model.number="target" type="range" min="1" :max="N" @input="reset" />
        <output>{{ target }}</output>
      </label>
      <button class="btn btn-primary" type="button" @click="play">{{ running ? 'အစကပြန်စမယ်' : 'ပြိုင်ခိုင်းမယ်' }}</button>
    </header>

    <div class="lanes">
      <div class="lane">
        <h3>Seq Scan <span class="tag">index မရှိ</span></h3>
        <p class="what">Row တိုင်းကို အစကနေအဆုံးထိ တစ်ခုချင်းဖတ်ပြီး <code>id = {{ target }}</code> ဟုတ်မဟုတ် စစ်တယ်။</p>
        <div class="heap" aria-hidden="true">
          <span
            v-for="n in N"
            :key="n"
            :class="{ read: n - 1 <= seqPos, hit: n === target && n - 1 <= seqPos, cursor: n - 1 === seqPos && !seqDone }"
            >{{ n }}</span
          >
        </div>
        <p class="meter">
          ဖတ်ပြီး row <strong>{{ seqPos + 1 }}</strong> / {{ N }}
          <span v-if="seqDone" class="verdict slow">row {{ N }} လုံးလုံးဖတ်ရတယ်</span>
        </p>
      </div>

      <div class="lane">
        <h3>Index Scan <span class="tag pg">B-tree index ရှိ</span></h3>
        <p class="what">{{ stageText[idxStage] }}</p>
        <svg viewBox="0 0 480 160" class="tree" aria-hidden="true">
          <line
            v-for="n in internals"
            :key="'r' + n.i"
            :class="{ on: idxStage >= 2 && n.i === internalIdx }"
            x1="240"
            y1="34"
            :x2="n.x"
            y2="66"
          />
          <line
            v-for="l in leaves"
            :key="'l' + l.j"
            :class="{ on: idxStage >= 3 && l.j === leafIdx }"
            :x1="internals[Math.floor(l.j / 4)].x"
            y1="92"
            :x2="l.x"
            y2="124"
          />
          <g :class="{ on: idxStage >= 1 }">
            <rect x="195" y="8" width="90" height="26" rx="6" />
            <text x="240" y="26">17 | 33</text>
          </g>
          <g v-for="n in internals" :key="n.i" :class="{ on: idxStage >= 2 && n.i === internalIdx }">
            <rect :x="n.x - 50" y="66" width="100" height="26" rx="6" />
            <text :x="n.x" y="84">{{ n.keys }}</text>
          </g>
          <g v-for="l in leaves" :key="l.j" :class="{ on: idxStage >= 3 && l.j === leafIdx }">
            <rect :x="l.x - 18" y="124" width="36" height="24" rx="5" />
            <text :x="l.x" y="140" class="small">{{ l.label }}</text>
          </g>
        </svg>
        <div class="heap" aria-hidden="true">
          <span v-for="n in N" :key="n" :class="{ hit: n === target && idxStage >= 4 }">{{ n }}</span>
        </div>
        <p class="meter">
          ဖတ်ပြီး page <strong>{{ idxStage }}</strong> / 4
          <span v-if="idxStage >= 4" class="verdict fast">page 4 ခုနဲ့ ပြီးတယ်</span>
        </p>
      </div>
    </div>

    <p class="scale">
      Row 48 ခုမှာ ကွာခြားချက်က သေးပေမဲ့၊ row ၁၀ သန်းရှိတဲ့ table မှာ Seq Scan က row ၁၀ သန်းလုံးဖတ်ရပြီး B-tree က အမြင့် ၃–၄ ဆင့်ပဲ
      ရှိတာကြောင့် page ၄–၅ ခုလောက်ဖတ်ရုံနဲ့ တွေ့ပါတယ်။
    </p>
  </section>
</template>

<style scoped>
.target {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
}
.target output {
  font-family: var(--font-mono);
  font-weight: 600;
  min-width: 2ch;
}
.lanes {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.lane {
  padding: 16px 18px;
  min-width: 0;
}
.lane + .lane {
  border-left: 1px solid var(--line);
}
@media (max-width: 760px) {
  .lanes {
    grid-template-columns: 1fr;
  }
  .lane + .lane {
    border-left: 0;
    border-top: 1px solid var(--line);
  }
}
h3 {
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 10px;
}
.tag {
  font-family: var(--font-body);
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--muted);
  border: 1.5px solid currentColor;
  border-radius: 99px;
  padding: 0 9px;
}
.tag.pg {
  color: var(--pg);
}
.what {
  margin: 4px 0 10px;
  font-size: 0.92rem;
  min-height: 3.6em;
}
.what code {
  background: var(--sunken);
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 0.86em;
}
.heap {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 3px;
}
.heap span {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  line-height: 1;
  text-align: center;
  padding: 6px 0;
  border-radius: 4px;
  background: var(--sunken);
  color: var(--muted);
}
.heap .read {
  background: color-mix(in srgb, var(--flow) 30%, var(--surface));
  color: var(--ink);
}
.heap .cursor {
  background: var(--flow);
  color: #fff;
}
.heap .hit {
  background: var(--ok);
  color: #fff;
  font-weight: 600;
}
.tree {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}
.tree line {
  stroke: var(--line);
  stroke-width: 1.5;
}
.tree line.on {
  stroke: var(--pg);
  stroke-width: 3;
}
.tree rect {
  fill: var(--surface);
  stroke: var(--muted);
  stroke-width: 1.3;
  transition: fill 0.2s;
}
.tree .on rect {
  fill: var(--pg);
  stroke: var(--pg);
}
.tree text {
  text-anchor: middle;
  font-family: var(--font-mono);
  font-size: 11px;
  fill: var(--ink);
}
.tree text.small {
  font-size: 8.5px;
}
.tree .on text {
  fill: #fff;
  font-weight: 600;
}
.meter {
  margin: 10px 0 0;
  font-size: 0.9rem;
}
.meter strong {
  font-family: var(--font-mono);
}
.verdict {
  margin-left: 8px;
  font-weight: 600;
}
.verdict.slow {
  color: var(--flow);
}
.verdict.fast {
  color: var(--ok);
}
.scale {
  margin: 0;
  padding: 12px 18px 16px;
  border-top: 1px solid var(--line);
  font-size: 0.93rem;
}
</style>
