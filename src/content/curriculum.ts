import type { Lesson } from './types'
import { httpRest } from './lessons/http-rest'
import { nestBlocks } from './lessons/nest-building-blocks'
import { requestPipeline } from './lessons/request-pipeline'
import { sqlBasics } from './lessons/sql-basics'
import { indexes } from './lessons/indexes'
import { projectTasksApi } from './lessons/project-tasks-api'

export type TrackColor = 'plain' | 'nest' | 'pg'

export interface Stop {
  id: string
  title: string
  /** What the learner will be able to do. Shown on the curriculum map. */
  goal: string
  kind?: 'project'
}

export interface Track {
  id: string
  title: string
  level: string
  color: TrackColor
  stops: Stop[]
}

/** Lessons that are written. Stops without an entry here are shown as "coming next". */
export const lessons: Record<string, Lesson> = Object.fromEntries(
  [httpRest, nestBlocks, requestPipeline, projectTasksApi, sqlBasics, indexes].map((l) => [l.id, l]),
)

export const tracks: Track[] = [
  {
    id: 'foundations',
    title: 'Backend အခြေခံ',
    level: 'အစ',
    color: 'plain',
    stops: [{ id: 'http-rest', title: 'HTTP နဲ့ REST API', goal: 'Request တစ်ခုရဲ့ ခရီးစဉ်နဲ့ status code တွေကို ရှင်းပြနိုင်မယ်' }],
  },
  {
    id: 'nest-core',
    title: 'NestJS အူတိုင်',
    level: 'အခြေခံ',
    color: 'nest',
    stops: [
      { id: 'nest-building-blocks', title: 'Module, Controller, Provider နဲ့ DI', goal: 'Nest app တစ်ခုကို module အလိုက် ဖွဲ့စည်းနိုင်မယ်' },
      { id: 'request-pipeline', title: 'Request pipeline', goal: 'Middleware, guard, interceptor, pipe, filter ဘယ်အချိန် run လဲ သိမယ်' },
      { id: 'project-tasks-api', title: 'Mini project ၁ · Tasks API', goal: 'Validation နဲ့ guard ပါတဲ့ CRUD API တစ်ခု ကိုယ်တိုင်ဆောက်မယ်', kind: 'project' },
      { id: 'dto-validation', title: 'DTO, validation နဲ့ serialization', goal: 'Input ကိုစစ်၊ output ကနေ password လို field တွေ ဖယ်နိုင်မယ်' },
      { id: 'config', title: 'Configuration နဲ့ environment', goal: '.env, ConfigModule နဲ့ secret တွေကို စနစ်တကျ ကိုင်တွယ်မယ်' },
    ],
  },
  {
    id: 'postgres',
    title: 'PostgreSQL',
    level: 'အခြေခံ မှ အလယ်အလတ်',
    color: 'pg',
    stops: [
      { id: 'sql-basics', title: 'Table နဲ့ SQL အခြေခံ', goal: 'SELECT, WHERE, GROUP BY ကို PostgreSQL တွက်တဲ့အစီအစဉ်အတိုင်း နားလည်မယ်' },
      { id: 'joins', title: 'Relationship နဲ့ JOIN', goal: 'Foreign key, one-to-many, many-to-many ကို ဒီဇိုင်းဆွဲပြီး join နိုင်မယ်' },
      { id: 'indexes-explain', title: 'Index နဲ့ EXPLAIN', goal: 'Query နှေးတာကို EXPLAIN နဲ့ရှာပြီး index နဲ့ ဖြေရှင်းနိုင်မယ်' },
      { id: 'transactions', title: 'Transaction, isolation နဲ့ MVCC', goal: 'ငွေလွှဲလို လုပ်ငန်းမျိုးကို ဒေတာမပျက်အောင် ရေးနိုင်မယ်' },
      { id: 'schema-design', title: 'Schema design နဲ့ constraint', goal: 'Normalization, constraint, JSONB ကို ဘယ်အချိန်သုံးမလဲ ဆုံးဖြတ်နိုင်မယ်' },
    ],
  },
  {
    id: 'together',
    title: 'NestJS နဲ့ PostgreSQL ပေါင်းစပ်ခြင်း',
    level: 'အလယ်အလတ်',
    color: 'nest',
    stops: [
      { id: 'orm', title: 'TypeORM / Prisma နဲ့ ချိတ်ဆက်ခြင်း', goal: 'Entity, repository, migration နဲ့ database ကို ထိန်းချုပ်မယ်' },
      { id: 'project-blog-api', title: 'Mini project ၂ · Blog API', goal: 'User, post, comment ပါတဲ့ API ကို PostgreSQL နဲ့ ဆောက်မယ်', kind: 'project' },
      { id: 'auth', title: 'Authentication နဲ့ authorization', goal: 'Password hashing, JWT, refresh token, role-based access ရေးနိုင်မယ်' },
      { id: 'pagination', title: 'Pagination, filtering နဲ့ N+1 ပြဿနာ', goal: 'List endpoint တွေကို ဒေတာများလာလည်း မြန်အောင် ရေးနိုင်မယ်' },
      { id: 'api-docs', title: 'Error handling, versioning နဲ့ OpenAPI', goal: 'တခြား developer တွေသုံးလို့ရတဲ့ API တစ်ခုအဖြစ် ထုတ်နိုင်မယ်' },
    ],
  },
  {
    id: 'advanced',
    title: 'အဆင့်မြင့်',
    level: 'Advanced',
    color: 'plain',
    stops: [
      { id: 'testing', title: 'Unit test နဲ့ e2e test', goal: 'Service ကို mock နဲ့၊ API ကို database အစစ်နဲ့ စမ်းနိုင်မယ်' },
      { id: 'caching', title: 'Redis နဲ့ caching', goal: 'Cache-aside pattern နဲ့ invalidation ကို မှန်မှန်ကန်ကန် သုံးနိုင်မယ်' },
      { id: 'queues', title: 'Queue နဲ့ background job', goal: 'Email ပို့တာလို အလုပ်တွေကို request ပြင်ပမှာ လုပ်နိုင်မယ်' },
      { id: 'realtime', title: 'WebSocket နဲ့ realtime', goal: 'Gateway နဲ့ chat / notification ရေးနိုင်မယ်' },
      { id: 'pg-performance', title: 'Locking, connection pool နဲ့ query tuning', goal: 'Deadlock, pool ကုန်တာ၊ query နှေးတာတွေကို ရှာဖြေနိုင်မယ်' },
      { id: 'microservices', title: 'Microservice နဲ့ messaging', goal: 'Service ခွဲသင့်မသင့် ဆုံးဖြတ်ပြီး message နဲ့ ဆက်သွယ်နိုင်မယ်' },
      { id: 'deploy', title: 'Docker, deploy နဲ့ observability', goal: 'App ကို container နဲ့တင်၊ log နဲ့ metric နဲ့ စောင့်ကြည့်နိုင်မယ်' },
      { id: 'project-capstone', title: 'Capstone · E-commerce backend', goal: 'အထက်ကအရာအားလုံးကို project တစ်ခုထဲမှာ ပေါင်းသုံးမယ်', kind: 'project' },
    ],
  },
]

export const allStops = tracks.flatMap((t) => t.stops.map((s) => ({ ...s, track: t })))
export const builtStops = allStops.filter((s) => lessons[s.id])
