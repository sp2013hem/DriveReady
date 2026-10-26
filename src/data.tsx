import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Question } from './types'

export interface Chapter { id: string; name: string; theme: string; questions: Question[] }
export interface Theme { id: string; name: string; section: 'basic' | 'class'; chapters: Chapter[]; count: number }
interface Data { all: Question[]; byId: Map<string, Question>; themes: Theme[] }

const Ctx = createContext<Data | null>(null)
export const useData = () => useContext(Ctx)!

function build(all: Question[]): Data {
  const themes = new Map<string, Theme>()
  for (const q of all) {
    let t = themes.get(q.theme)
    if (!t) themes.set(q.theme, (t = { id: q.theme, name: q.themeName, section: q.section, chapters: [], count: 0 }))
    let c = t.chapters.find((c) => c.id === q.chapter)
    if (!c) t.chapters.push((c = { id: q.chapter, name: q.chapterName, theme: q.theme, questions: [] }))
    c.questions.push(q)
    t.count++
  }
  return { all, byId: new Map(all.map((q) => [q.id, q])), themes: [...themes.values()] }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Question[] | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    fetch('/data/questions.json').then((r) => r.json()).then(setAll, () => setError(true))
  }, [])
  const data = useMemo(() => (all ? build(all) : null), [all])
  if (error) return <p className="center">Could not load questions. Check your connection and reload.</p>
  if (!data) return <p className="center">Loading questions…</p>
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>
}
