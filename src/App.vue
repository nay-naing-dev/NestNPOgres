<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import RouteMap from './components/RouteMap.vue'

const route = useRoute()
const menuOpen = ref(false)
watch(() => route.fullPath, () => (menuOpen.value = false))

const THEME_KEY = 'backend-lanpya-theme'
// index.html sets data-theme before first paint; start from whatever it chose.
const theme = ref<'light' | 'dark'>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
watch(theme, (t) => {
  document.documentElement.dataset.theme = t
  try {
    localStorage.setItem(THEME_KEY, t)
  } catch {
    /* ignore */
  }
})
</script>

<template>
  <div class="shell">
    <header class="bar">
      <button class="menu btn" type="button" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        {{ menuOpen ? 'ပိတ်မယ်' : 'သင်ရိုး' }}
      </button>
      <RouterLink to="/" class="brand">
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <path d="M5 21 L5 9 L14 9 L14 19 L23 19 L23 7" />
          <circle cx="5" cy="21" r="3" class="a" />
          <circle cx="23" cy="7" r="3" class="b" />
        </svg>
        Backend လမ်းပြ
      </RouterLink>
      <button class="btn theme" type="button" @click="theme = theme === 'dark' ? 'light' : 'dark'">
        {{ theme === 'dark' ? 'အလင်း' : 'အမှောင်' }}
      </button>
    </header>

    <aside class="side" :class="{ open: menuOpen }">
      <RouteMap />
    </aside>

    <main>
      <RouterView :key="route.fullPath" />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
}
.bar {
  position: fixed;
  inset: 0 0 auto 0;
  height: 56px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.08rem;
  color: var(--ink);
  text-decoration: none;
  margin-right: auto;
}
.brand svg {
  width: 26px;
  height: 26px;
}
.brand path {
  fill: none;
  stroke: var(--ink);
  stroke-width: 2.4;
  stroke-linejoin: round;
}
.brand .a {
  fill: var(--nest);
}
.brand .b {
  fill: var(--pg);
}
.menu {
  display: none;
}
.side {
  position: fixed;
  top: 56px;
  bottom: 0;
  left: 0;
  width: var(--sidebar);
  overflow-y: auto;
  background: var(--surface);
  border-right: 1px solid var(--line);
  padding: 18px 16px 40px;
  z-index: 20;
}
main {
  margin-left: var(--sidebar);
  padding: 56px 0 0;
  min-width: 0;
}
@media (max-width: 960px) {
  .menu {
    display: inline-flex;
  }
  .side {
    width: min(340px, 88vw);
    transform: translateX(-100%);
    transition: transform 0.25s;
    box-shadow: 0 0 0 100vmax transparent;
  }
  .side.open {
    transform: none;
    box-shadow: 0 0 0 100vmax rgb(10 15 30 / 0.45);
  }
  main {
    margin-left: 0;
  }
}
</style>
