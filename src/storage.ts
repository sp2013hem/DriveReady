import { useSyncExternalStore } from 'react'

const KEY = 'driveready:v1'

export interface QStat {
  seen: number
  right: number
  lastCorrect: boolean
  /** Leitner box 1–5; wrong answers drop to 1. */
  box: number
}
export interface ExamRecord {
  date: number
  errorPoints: number
  passed: boolean
  wrong: number
  seconds: number
}
interface State {
  stats: Record<string, QStat>
  bookmarks: string[]
  exams: ExamRecord[]
}

const empty = (): State => ({ stats: {}, bookmarks: [], exams: [] })

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...empty(), ...JSON.parse(raw) }
  } catch { /* private mode / corrupted – start fresh */ }
  return empty()
}

let state = load()
const listeners = new Set<() => void>()

function commit(next: State) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* quota – keep in memory */ }
  listeners.forEach((l) => l())
}

export const useStore = () =>
  useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    () => state,
  )

export function recordAnswer(id: string, correct: boolean) {
  const prev = state.stats[id] ?? { seen: 0, right: 0, lastCorrect: false, box: 0 }
  const box = correct ? Math.min(5, Math.max(1, prev.box) + (prev.box ? 1 : 0)) : 1
  commit({
    ...state,
    stats: { ...state.stats, [id]: { seen: prev.seen + 1, right: prev.right + (correct ? 1 : 0), lastCorrect: correct, box } },
  })
}
export function toggleBookmark(id: string) {
  const has = state.bookmarks.includes(id)
  commit({ ...state, bookmarks: has ? state.bookmarks.filter((b) => b !== id) : [...state.bookmarks, id] })
}
export function addExam(r: ExamRecord) {
  commit({ ...state, exams: [r, ...state.exams].slice(0, 100) })
}
export function resetAll() {
  commit(empty())
}
