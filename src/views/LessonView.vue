<script setup lang="ts">
import { computed } from 'vue'
import { allStops, builtStops, lessons } from '../content/curriculum'
import { progress } from '../lib/progress'
import ChallengeBlock from '../components/ChallengeBlock.vue'
import CodeBlock from '../components/CodeBlock.vue'
import FlowPlayer from '../components/FlowPlayer.vue'
import IndexScanViz from '../components/IndexScanViz.vue'
import SqlLab from '../components/SqlLab.vue'
import TableSteps from '../components/TableSteps.vue'

const props = defineProps<{ id: string }>()

const lesson = computed(() => lessons[props.id])
const stop = computed(() => allStops.find((s) => s.id === props.id))
const next = computed(() => {
  const i = builtStops.findIndex((s) => s.id === props.id)
  return i >= 0 ? builtStops[i + 1] : undefined
})
const done = computed({
  get: () => !!progress.lessons[props.id],
  set: (v) => (progress.lessons[props.id] = v),
})
</script>

<template>
  <article v-if="lesson" class="lesson" :class="stop?.track.color">
    <header class="head">
      <p class="crumb">{{ stop?.track.title }} · ခန့်မှန်း {{ lesson.minutes }} မိနစ်</p>
      <h1>{{ lesson.title }}</h1>
      <p class="summary">{{ lesson.summary }}</p>
    </header>

    <template v-for="(b, i) in lesson.blocks" :key="i">
      <div v-if="b.type === 'prose'" class="prose" v-html="b.html"></div>
      <CodeBlock v-else-if="b.type === 'code'" :code="b.code" :lang="b.lang" :file="b.file" />
      <aside v-else-if="b.type === 'note'" class="note" :class="b.tone">
        <strong>{{ b.tone === 'warn' ? 'သတိထားရန်' : 'အကြံပြုချက်' }}</strong>
        <span class="prose" v-html="b.html"></span>
      </aside>
      <FlowPlayer v-else-if="b.type === 'flow'" :scene="b.scene" />
      <TableSteps v-else-if="b.type === 'tablesteps'" :data="b.data" />
      <IndexScanViz v-else-if="b.type === 'indexscan'" />
      <SqlLab v-else-if="b.type === 'sql'" :lab="b.lab" />
      <ChallengeBlock v-else-if="b.type === 'challenge'" :data="b.data" />
    </template>

    <footer class="end">
      <button class="btn" :class="{ 'btn-primary': !done }" type="button" @click="done = !done">
        {{ done ? '✓ ပြီးပြီလို့ မှတ်ထားတယ် (ပြန်ဖြုတ်မယ်)' : 'ဒီအခန်း ပြီးပြီလို့ မှတ်မယ်' }}
      </button>
      <RouterLink v-if="next" class="btn" :class="{ 'btn-primary': done }" :to="`/learn/${next.id}`">
        နောက်အခန်း: {{ next.title }}
      </RouterLink>
      <RouterLink v-else class="btn" to="/">သင်ရိုးမြေပုံကို ပြန်ကြည့်မယ်</RouterLink>
    </footer>
  </article>

  <article v-else class="lesson">
    <header class="head">
      <h1>ဒီအခန်းကို မရေးရသေးပါဘူး</h1>
      <p class="summary">
        {{ stop ? `"${stop.title}" က သင်ရိုးထဲမှာ ပါပြီးသားပါ၊ အကြောင်းအရာကို မကြာမီ ထည့်ပါမယ်။` : 'ဒီလိပ်စာနဲ့ သင်ခန်းစာ မရှိပါဘူး။' }}
      </p>
      <RouterLink class="btn btn-primary" to="/">သင်ရိုးမြေပုံကို ပြန်သွားမယ်</RouterLink>
    </header>
  </article>
</template>

<style scoped>
.lesson {
  --c: var(--muted);
  max-width: 940px;
  margin: 0 auto;
  padding: 40px 28px 80px;
}
.lesson.nest {
  --c: var(--nest);
}
.lesson.pg {
  --c: var(--pg);
}
@media (max-width: 600px) {
  .lesson {
    padding: 28px 16px 60px;
  }
}
.head {
  border-left: 5px solid var(--c);
  padding-left: 18px;
  margin-bottom: 2rem;
}
.crumb {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--c);
}
h1 {
  font-size: clamp(1.6rem, 3.6vw, 2.25rem);
  margin: 0.2rem 0 0.5rem;
}
.summary {
  margin: 0 0 0.8rem;
  max-width: 66ch;
  color: var(--muted);
  font-size: 1.04rem;
}
.note {
  display: grid;
  gap: 2px;
  max-width: 68ch;
  margin: 1.2rem 0 1.6rem;
  padding: 12px 16px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--ok) 11%, var(--surface));
  border-left: 4px solid var(--ok);
  font-size: 0.96rem;
}
.note.warn {
  background: color-mix(in srgb, var(--flow) 13%, var(--surface));
  border-left-color: var(--flow);
}
.note strong {
  font-size: 0.86rem;
}
.end {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 3rem;
  padding-top: 1.4rem;
  border-top: 1px solid var(--line);
}
</style>
