import { reactive, watch } from 'vue'

const KEY = 'backend-lanpya-progress-v1'

interface Progress {
  /** lesson id → finished */
  lessons: Record<string, boolean>
  /** "labId:taskIndex" → solved */
  tasks: Record<string, boolean>
  /** "challengeId:requirementIndex" → ticked */
  checks: Record<string, boolean>
}

function load(): Progress {
  const empty: Progress = { lessons: {}, tasks: {}, checks: {} }
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

export const progress = reactive<Progress>(load())

watch(
  progress,
  (p) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* private mode: progress just won't persist */
    }
  },
  { deep: true },
)
