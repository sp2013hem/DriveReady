import { useMemo, useState } from 'react'
import { useData } from '../data'
import QuestionCard from '../components/QuestionCard'
import { toggleBookmark, useStore } from '../storage'
import type { Answer } from '../types'

export default function Browse() {
  const { all } = useData()
  const { bookmarks } = useStore()
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [ans, setAns] = useState<Record<string, Answer>>({})
  const hits = useMemo(() => {
    const t = term.trim().toLowerCase()
    if (t.length < 3) return []
    return all.filter((q) => q.text.toLowerCase().includes(t) || q.explanation.toLowerCase().includes(t) || q.id.includes(t)).slice(0, 40)
  }, [term, all])
  return (
    <div className="page">
      <h1>Search</h1>
      <input className="search" placeholder="Search questions & explanations (3+ letters)" value={term} onChange={(e) => setTerm(e.target.value)} />
      {hits.map((q) => (
        <div key={q.id}>
          {open === q.id ? (
            <QuestionCard q={q} value={ans[q.id]} onChange={(v) => setAns({ ...ans, [q.id]: v })} reveal bookmarked={bookmarks.includes(q.id)} onBookmark={() => toggleBookmark(q.id)} />
          ) : (
            <button className="hit" onClick={() => setOpen(q.id)}><small>{q.id}</small>{q.text}</button>
          )}
        </div>
      ))}
      {term.trim().length >= 3 && hits.length === 0 && <p className="center">No matches.</p>}
    </div>
  )
}
