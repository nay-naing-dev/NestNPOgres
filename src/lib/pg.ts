// One in-memory PostgreSQL (PGlite, compiled to WebAssembly) per SQL lab.
// Loaded lazily: the ~3 MB wasm is only fetched when a learner first runs a query.

export interface QueryResult {
  columns: string[]
  rows: string[][]
  affected: number
}

interface Db {
  exec(sql: string, options?: { rowMode: 'array' }): Promise<
    { rows: unknown[]; fields: { name: string }[]; affectedRows?: number }[]
  >
  close(): Promise<void>
}

const instances = new Map<string, Promise<Db>>()

function cell(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  if (v instanceof Date) return v.toISOString().replace('T', ' ').replace(/\.000Z$/, '')
  if (typeof v === 'object') return JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? x.toString() : x))
  return String(v)
}

export function getDb(id: string, seed: string): Promise<Db> {
  let db = instances.get(id)
  if (!db) {
    db = (async () => {
      const { PGlite } = await import('@electric-sql/pglite')
      const instance = new PGlite() as unknown as Db
      await instance.exec(seed)
      return instance
    })()
    instances.set(id, db)
    db.catch(() => instances.delete(id))
  }
  return db
}

export async function resetDb(id: string) {
  const db = instances.get(id)
  instances.delete(id)
  if (db) await (await db).close().catch(() => {})
}

/** Runs one or more statements and returns the last result set. */
export async function run(db: Db, sql: string): Promise<QueryResult> {
  const results = await db.exec(sql, { rowMode: 'array' })
  const last = [...results].reverse().find((r) => r.fields.length > 0) ?? results[results.length - 1]
  if (!last) return { columns: [], rows: [], affected: 0 }
  return {
    columns: last.fields.map((f) => f.name),
    rows: (last.rows as unknown[][]).map((r) => r.map(cell)),
    affected: results.reduce((n, r) => n + (r.affectedRows ?? 0), 0),
  }
}
