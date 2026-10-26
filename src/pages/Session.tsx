import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../data'
import QuestionCard from '../components/QuestionCard'
import { isCorrect, shuffle } from '../scoring'
import { recordAnswer, toggleBookmark, useStore } from '../storage'
import type { Answer, Question } from '../types'

export default function Session() {
  const { mode = '', id = '' } = useParams()
  const data = useData()
  const store = useStore()

  // Question list is fixed for the lifetime of the session, so answering doesn't reshuffle it.
  const [list] = useState<Question[]>(() => {
    const { all, themes } = data
    switch (mode) {
      case 'chapter': return themes.flatMap((t) => t.chapters).find((c) => c.id === id)?.questions ?? []
      case 'theme': return themes.find((t) => t.id === id)?.chapters.flatMap((c) => c.questions) ?? []
      case 'weak': return shuffle(all.filter((q) => store.stats[q.id] && (!store.stats[q.id].lastCorrect || store.stats[q.id].box <= 2)))
      case 'bookmarks': return all.filter((q) => store.bookmarks.includes(q.id))
      case 'new': return shuffle(all.filter((q) => !store.stats[q.id])).slice(0, 50)
      case 'fives': return shuffle(all.filter((q) => q.points === 5))
      default: return shuffle(all).slice(0, 50)
    }
  })

  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const title = useMemo(() => ({ weak: 'Weak questions', bookmarks: 'Bookmarks', new: 'New questions', fives: '5-point questions', random: 'Random mix', chapter: id, theme: `Theme ${id}` }[mode] ?? 'Practice'), [mode, id])

  if (!list.length) {
    return (
      <div className="page">
        <h1>{title}</h1>
        <p className="center">Nothing here yet.</p>
        <Link className="btn" to="/topics">Back</Link>
      </div>
    )
  }
  if (i >= list.length) {
    const right = list.filter((q) => isCorrect(q, answers[q.id])).length
    return (
      <div className="page">
        <h1>Done!</h1>
        <p className="big">{right} / {list.length} correct</p>
        <Link className="btn primary" to="/topics">Back to topics</Link>
      </div>
    )
  }

  const q = list[i]
  const isChecked = checked.has(q.id)
  const a = answers[q.id]
  const hasAnswer = q.type === 'number' ? !!(a as string)?.trim() : !!(a as number[])?.length

  const check = () => {
    setChecked(new Set(checked).add(q.id))
    recordAnswer(q.id, isCorrect(q, a))
  }

  return (
    <div className="page">
      <div className="topbar">
        <Link to="/topics" className="link">✕ Close</Link>
        <span>{title} · {i + 1}/{list.length}</span>
      </div>
      <div className="progress"><div style={{ width: `${(i / list.length) * 100}%` }} /></div>
      <QuestionCard
        q={q}
        value={a}
        onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
        reveal={isChecked}
        bookmarked={store.bookmarks.includes(q.id)}
        onBookmark={() => toggleBookmark(q.id)}
      />
      <div className="actions">
        <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>← Prev</button>
        {isChecked ? (
          <button className="btn primary" onClick={() => setI(i + 1)}>{i === list.length - 1 ? 'Finish' : 'Next →'}</button>
        ) : (
          <button className="btn primary" disabled={!hasAnswer} onClick={check}>Check</button>
        )}
      </div>
    </div>
  )
}
