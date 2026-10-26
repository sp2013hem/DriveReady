import { useData } from '../data'
import { resetAll, useStore } from '../storage'

export default function Stats() {
  const { themes } = useData()
  const { stats, exams } = useStore()
  return (
    <div className="page">
      <h1>Stats</h1>
      <h2>By theme</h2>
      {themes.map((t) => {
        const qs = t.chapters.flatMap((c) => c.questions).filter((q) => stats[q.id])
        const seen = qs.reduce((n, q) => n + stats[q.id].seen, 0)
        const right = qs.reduce((n, q) => n + stats[q.id].right, 0)
        const pct = seen ? Math.round((right / seen) * 100) : null
        return (
          <div className="row" key={t.id}>
            <span>{t.id} {t.name}</span>
            <b className={pct !== null && pct < 70 ? 'badtxt' : ''}>{pct === null ? '–' : `${pct}%`}</b>
          </div>
        )
      })}
      <h2>Mock exams</h2>
      {exams.length === 0 && <p className="center">None yet.</p>}
      {exams.map((e) => (
        <div className="row" key={e.date}>
          <span>{new Date(e.date).toLocaleString()}</span>
          <b className={e.passed ? 'oktxt' : 'badtxt'}>{e.passed ? 'Pass' : 'Fail'} · {e.errorPoints} pts</b>
        </div>
      ))}
      <button className="btn danger" onClick={() => confirm('Delete all progress?') && resetAll()}>Reset progress</button>
    </div>
  )
}
