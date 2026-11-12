// ---- Flow animation (packets travelling between nodes) ----
export type Tone = 'req' | 'res' | 'err' | 'data'

export interface FlowNode {
  id: string
  label: string
  sub?: string
  x: number
  y: number
  w?: number
  h?: number
  kind?: 'client' | 'nest' | 'pg' | 'plain'
}

export interface FlowStep {
  /** Packet travels from → to. Use `at` alone when something happens inside one node. */
  from?: string
  to?: string
  at?: string
  packet?: string
  tone?: Tone
  title: string
  /** HTML */
  note: string
  code?: string
  lang?: string
}

export interface FlowScenario {
  id: string
  label: string
  steps: FlowStep[]
}

export interface FlowScene {
  title: string
  width: number
  height: number
  nodes: FlowNode[]
  /** A third element 'quiet' hides the edge until a packet travels along it (error paths). */
  edges: ([string, string] | [string, string, 'quiet'])[]
  scenarios: FlowScenario[]
}

// ---- Table snapshots (how a SQL query is evaluated clause by clause) ----
export interface TSRow {
  key: string
  cells: (string | number)[]
  out?: boolean
  group?: number
}

export interface TSStep {
  clause: string
  title: string
  note: string
  columns: string[]
  rows: TSRow[]
}

export interface TableStepsData {
  title: string
  query: { id: string; text: string }[]
  steps: TSStep[]
}

// ---- SQL lab (real PostgreSQL in the browser) ----
export interface SqlTask {
  prompt: string
  starter?: string
  solution: string
  /** Compare rows in order (for ORDER BY tasks). */
  ordered?: boolean
  /** After the learner's SQL runs, run this and compare with `expect`. */
  verify?: string
  expect?: string[][]
  /** Pass when the printed output matches this regex (for EXPLAIN tasks). */
  match?: string
}

export interface SqlLabData {
  id: string
  title: string
  schema: string
  seed: string
  tasks: SqlTask[]
}

// ---- Challenge done on the learner's own machine ----
export interface ChallengeData {
  id: string
  title: string
  brief: string
  requirements: string[]
  hints: string[]
  solution: { file: string; lang: string; code: string }[]
}

// ---- Lesson ----
export type Block =
  | { type: 'prose'; html: string }
  | { type: 'code'; lang: string; code: string; file?: string }
  | { type: 'note'; tone: 'tip' | 'warn'; html: string }
  | { type: 'flow'; scene: FlowScene }
  | { type: 'tablesteps'; data: TableStepsData }
  | { type: 'indexscan' }
  | { type: 'sql'; lab: SqlLabData }
  | { type: 'challenge'; data: ChallengeData }

export interface Lesson {
  id: string
  title: string
  summary: string
  minutes: number
  blocks: Block[]
}
