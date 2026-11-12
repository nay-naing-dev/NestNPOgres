<script setup lang="ts">
import { computed, ref } from 'vue'
import { highlight } from '../lib/highlight'

const props = defineProps<{ code: string; lang: string; file?: string }>()
const html = computed(() => highlight(props.code.trim(), props.lang))
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code.trim())
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    /* clipboard blocked: nothing to do */
  }
}
</script>

<template>
  <figure class="code">
    <figcaption>
      <span class="file">{{ file ?? lang }}</span>
      <button class="copy" type="button" @click="copy">{{ copied ? 'ကူးပြီးပြီ' : 'ကူးမယ်' }}</button>
    </figcaption>
    <pre><code v-html="html"></code></pre>
  </figure>
</template>

<style scoped>
.code {
  margin: 1.2rem 0 1.6rem;
  background: var(--code-bg);
  color: var(--code-ink);
  border-radius: 12px;
  overflow: hidden;
  max-width: 100%;
}
figcaption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px 4px 16px;
  border-bottom: 1px solid var(--code-line);
  font-size: 0.78rem;
  color: #9aa6c2;
}
.file {
  font-family: var(--font-mono);
}
.copy {
  background: none;
  border: 0;
  color: inherit;
  font-size: 0.78rem;
  padding: 2px 8px;
  border-radius: 6px;
}
.copy:hover {
  color: #fff;
  background: var(--code-line);
}
pre {
  margin: 0;
  padding: 14px 16px 16px;
  overflow-x: auto;
  font-size: 0.84rem;
  line-height: 1.65;
  tab-size: 2;
}
</style>
