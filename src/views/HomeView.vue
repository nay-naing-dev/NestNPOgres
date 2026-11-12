<script setup lang="ts">
import { computed } from 'vue'
import FlowPlayer from '../components/FlowPlayer.vue'
import { builtStops, lessons, tracks } from '../content/curriculum'
import { heroScene } from '../content/scenes'
import { progress } from '../lib/progress'

const resume = computed(() => builtStops.find((s) => !progress.lessons[s.id]) ?? builtStops[0])
const started = computed(() => builtStops.some((s) => progress.lessons[s.id]))
</script>

<template>
  <div class="home">
    <section class="hero">
      <h1>Request တစ်ခုရဲ့ ခရီးစဉ်ကို မြင်ရရင် backend က မခက်တော့ဘူး</h1>
      <p class="lede">
        NestJS နဲ့ PostgreSQL ကို စာဖတ်ရုံနဲ့ မဟုတ်ဘဲ request တွေ၊ row တွေ ရွေ့လျားတာကို အဆင့်လိုက်ကြည့်ပြီး သင်မယ်။ Browser ထဲမှာ SQL
        တကယ်ရေး၊ ကိုယ့်စက်မှာ API တကယ်ဆောက်။
      </p>
      <div class="cta">
        <RouterLink class="btn btn-primary" :to="`/learn/${resume.id}`">
          {{ started ? 'ဆက်သင်မယ်: ' + resume.title : 'ပထမအခန်းက စမယ်' }}
        </RouterLink>
        <a class="btn" href="#map">သင်ရိုးမြေပုံ ကြည့်မယ်</a>
      </div>
      <FlowPlayer :scene="heroScene" compact loop autoplay />
    </section>

    <section class="how">
      <h2>ဒီမှာ ဘယ်လိုသင်ရမလဲ</h2>
      <dl>
        <div>
          <dt>ကြည့်</dt>
          <dd>အခန်းတိုင်းမှာ အဆင့်လိုက် animation ပါတယ်။ ဖွင့်ကြည့်၊ ရပ်၊ နောက်ပြန်ဆုတ်၊ အမှားဖြစ်တဲ့ scenario ကို ပြောင်းကြည့်။</dd>
        </div>
        <div>
          <dt>ရေး</dt>
          <dd>PostgreSQL အစစ်က ဒီ browser ထဲမှာပဲ run တယ်။ Install ဘာမှမလိုဘဲ query ရေး၊ အဖြေကို အလိုအလျောက်စစ်ပေးတယ်။</dd>
        </div>
        <div>
          <dt>ဆောက်</dt>
          <dd>NestJS challenge တွေနဲ့ mini project တွေကို ကိုယ့် VS Code မှာရေးတယ်။ အရိပ်အမြွက်ကို တစ်ဆင့်ချင်းယူ၊ နောက်ဆုံးမှ အဖြေနဲ့တိုက်။</dd>
        </div>
      </dl>
    </section>

    <section id="map" class="map">
      <h2>သင်ရိုးမြေပုံ</h2>
      <p class="map-note">
        အခန်း {{ builtStops.length }} ခန်း အသင့်ဖြစ်ပါပြီ။ ကျန်တဲ့အခန်းတွေက အစီအစဉ်ထဲမှာ ပါပြီးသား၊ တစ်ခုချင်း ထပ်ဖြည့်သွားမယ်။
      </p>

      <div v-for="t in tracks" :key="t.id" class="track" :class="t.color">
        <h3>{{ t.title }} <span>{{ t.level }}</span></h3>
        <ol>
          <li v-for="s in t.stops" :key="s.id" :class="{ planned: !lessons[s.id], done: progress.lessons[s.id], project: s.kind === 'project' }">
            <span class="dot" aria-hidden="true"></span>
            <component :is="lessons[s.id] ? 'RouterLink' : 'span'" class="name" :to="lessons[s.id] ? `/learn/${s.id}` : undefined">
              {{ s.title }}
            </component>
            <span class="goal">{{ s.goal }}</span>
            <span v-if="!lessons[s.id]" class="soon">မကြာမီ</span>
            <span v-else-if="progress.lessons[s.id]" class="soon ok">ပြီးပြီ</span>
          </li>
        </ol>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
  padding: 48px 28px 90px;
}
@media (max-width: 600px) {
  .home {
    padding: 28px 16px 60px;
  }
}
h1 {
  font-size: clamp(1.8rem, 4.4vw, 2.9rem);
  max-width: 20em;
  line-height: 1.5;
}
.lede {
  max-width: 62ch;
  font-size: 1.08rem;
  color: var(--muted);
  margin: 1rem 0 1.4rem;
}
.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 2.2rem;
}

.how {
  margin-top: 4.5rem;
}
h2 {
  font-size: 1.5rem;
}
dl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 32px;
  margin: 1rem 0 0;
}
@media (max-width: 760px) {
  dl {
    grid-template-columns: 1fr;
  }
}
dl div {
  border-top: 3px solid var(--ink);
  padding-top: 10px;
  margin-bottom: 1rem;
}
dl div:nth-child(2) {
  border-color: var(--pg);
}
dl div:nth-child(3) {
  border-color: var(--nest);
}
dt {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
}
dd {
  margin: 0;
  font-size: 0.96rem;
}

.map {
  margin-top: 4rem;
  scroll-margin-top: 76px;
}
.map-note {
  color: var(--muted);
  margin: 0.3rem 0 1.6rem;
}
.track {
  --c: var(--muted);
  margin-bottom: 1.8rem;
}
.track.nest {
  --c: var(--nest);
}
.track.pg {
  --c: var(--pg);
}
h3 {
  font-size: 1.12rem;
  color: var(--c);
  margin-bottom: 6px;
}
h3 span {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 0.82rem;
  color: var(--muted);
  margin-left: 6px;
}
ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 19rem) minmax(0, 1fr) auto;
  gap: 2px 20px;
  align-items: baseline;
  padding: 7px 0 7px 34px;
}
@media (max-width: 760px) {
  li {
    grid-template-columns: 1fr auto;
  }
  .goal {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}
li::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 0;
  bottom: 0;
  width: 5px;
  background: var(--c);
  opacity: 0.35;
}
li:first-child::before {
  top: 20px;
}
li:last-child::before {
  bottom: calc(100% - 20px);
}
li:only-child::before {
  display: none;
}
.dot {
  position: absolute;
  left: 3px;
  top: 15px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: var(--bg);
  border: 3.5px solid var(--c);
}
.project .dot {
  border-radius: 4px;
}
.done .dot {
  background: var(--c);
}
.planned .dot {
  border-color: var(--line);
}
.name {
  font-weight: 600;
  color: var(--ink);
}
a.name {
  text-decoration-color: var(--c);
  text-underline-offset: 5px;
}
.planned .name {
  font-weight: 400;
  color: var(--muted);
}
.goal {
  font-size: 0.92rem;
  color: var(--muted);
}
.soon {
  font-size: 0.74rem;
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 0 9px;
  color: var(--muted);
  white-space: nowrap;
}
.soon.ok {
  color: var(--ok);
  border-color: var(--ok);
}
</style>
