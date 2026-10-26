import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../data'
import QuestionCard from '../components/QuestionCard'
import { EXAM } from '../config'
import { drawExam, isCorrect, scoreExam } from '../scoring'
import { addExam, recordAnswer, toggleBookmark, useStore } from '../storage'
import type { Answer, Question } from '../types'

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function Exam() {
  const { all } = useData()
  const [qs, setQs] = useState<Question[] | null>(null)
  if (!qs) {
    return (
      <div className="page">
        <h1>Mock exam</h1>
        <ul className="rules">
          <li><b>{EXAM.basicQuestions + EXAM.classQuestions}</b> questions ({EXAM.basicQuestions} basic + {EXAM.classQuestions} class-specific)</li>
          <li><b>{EXAM.minutes}</b> minutes</li>
          <li>Fail with more than <b>{EXAM.maxErrorPoints}</b> error points, or if two 5-point questions are wrong</li>
          <li>No feedback until you submit</li>
        </ul>
        <button className="btn primary big" onClick={() => setQs(drawExam(all))}>Start exam</button>
      </div>
    )
  }
  return <Running qs={qs} onRestart={() => setQs(null)} />
}

function Running({ qs, onRestart }: { qs: Question[]; onRestart: () => void }) {
  const store = useStore()
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [done, setDone] = useState(false)
  const [left, setLeft] = useState(EXAM.minutes * 60)
  const startedAt = useRef(Date.now())

  const submit = () => {
    const r = scoreExam(qs, answers)
    qs.forEach((q) => recordAnswer(q.id, isCorrect(q, answers[q.id])))
    addExam({ date: Date.now(), errorPoints: r.errorPoints, passed: r.passed, wrong: r.wrong, seconds: Math.round((Date.now() - startedAt.current) / 1000) })
    setDone(true)
  }

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setLeft(Math.max(0, EXAM.minutes * 60 - Math.round((Date.now() - startedAt.current) / 1000))), 1000)
    return () => clearInterval(t)
  }, [done])
  useEffect(() => {
    if (left === 0 && !done) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  if (done) return <Result qs={qs} answers={answers} onRestart={onRestart} />

  const q = qs[i]
  const answered = (x: Question) => (x.type === 'number' ? !!(answers[x.id] as string)?.trim() : !!(answers[x.id] as number[])?.length)
  const unanswered = qs.filter((x) => !answered(x)).length

  return (
    <div className="page">
      <div className="topbar">
        <span>Question {i + 1}/{qs.length}</span>
        <span className={`timer ${left < 300 ? 'low' : ''}`}>⏱ {fmt(left)}</span>
      </div>
      <div className="grid">
        {qs.map((x, n) => (
          <button key={x.id} className={`cell ${n === i ? 'cur' : ''} ${answered(x) ? 'ans' : ''}`} onClick={() => setI(n)}>{n + 1}</button>
        ))}
      </div>
      <QuestionCard q={q} value={answers[q.id]} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} reveal={false} bookmarked={store.bookmarks.includes(q.id)} onBookmark={() => toggleBookmark(q.id)} />
      <div className="actions">
        <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>← Prev</button>
        {i < qs.length - 1 ? (
          <button className="btn primary" onClick={() => setI(i + 1)}>Next →</button>
        ) : (
          <button className="btn primary" onClick={() => (unanswered === 0 || confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) && submit()}>Submit</button>
        )}
      </div>
    </div>
  )
}

function Result({ qs, answers, onRestart }: { qs: Question[]; answers: Record<string, Answer>; onRestart: () => void }) {
  const r = scoreExam(qs, answers)
  const store = useStore()
  const [showAll, setShowAll] = useState(false)
  const wrongQs = qs.filter((q) => !isCorrect(q, answers[q.id]))
  const review = showAll ? qs : wrongQs
  return (
    <div className="page">
      <div className={`verdict ${r.passed ? 'pass' : 'fail'}`}>
        <h1>{r.passed ? 'Passed 🎉' : 'Not passed'}</h1>
        <p className="big">{r.errorPoints} / {EXAM.maxErrorPoints} error points</p>
        <p>{qs.length - r.wrong} of {qs.length} correct{r.failReason ? ` · ${r.failReason}` : ''}</p>
      </div>
      <div className="actions">
        <button className="btn primary" onClick={onRestart}>New exam</button>
        <Link className="btn" to="/">Home</Link>
      </div>
      <div className="topbar">
        <h2>Review</h2>
        <button className="link" onClick={() => setShowAll(!showAll)}>{showAll ? 'Only mistakes' : 'Show all'}</button>
      </div>
      {review.length === 0 && <p className="center">No mistakes – perfect!</p>}
      {review.map((q) => (
        <QuestionCard key={q.id} q={q} value={answers[q.id]} onChange={() => {}} reveal bookmarked={store.bookmarks.includes(q.id)} onBookmark={() => toggleBookmark(q.id)} />
      ))}
    </div>
  )
}
