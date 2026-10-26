import { Link } from 'react-router-dom'
import { useData } from '../data'
import { useStore } from '../storage'
import { useState } from 'react'

export default function Topics() {
  const { themes, all } = useData()
  const { stats, bookmarks } = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const weak = all.filter((q) => stats[q.id] && (!stats[q.id].lastCorrect || stats[q.id].box <= 2)).length
  const mastered = (qs: { id: string }[]) => qs.filter((q) => stats[q.id]?.lastCorrect).length

  return (
    <div className="page">
      <h1>Practice</h1>
      <div className="tiles">
        <Link className="tile" to="/practice/new">🆕 New<small>50 unseen</small></Link>
        <Link className="tile" to="/practice/weak">🎯 Weak<small>{weak} questions</small></Link>
        <Link className="tile" to="/practice/fives">⚠️ 5-pointers<small>highest stakes</small></Link>
        <Link className="tile" to="/practice/bookmarks">★ Bookmarks<small>{bookmarks.length}</small></Link>
      </div>
      {(['basic', 'class'] as const).map((sec) => (
        <section key={sec}>
          <h2>{sec === 'basic' ? 'Basic material' : 'Class-specific material'}</h2>
          {themes.filter((t) => t.section === sec).map((t) => {
            const m = mastered(t.chapters.flatMap((c) => c.questions))
            return (
              <div className="theme" key={t.id}>
                <button className="themehead" onClick={() => setOpen(open === t.id ? null : t.id)}>
                  <div>
                    <b>{t.id} {t.name}</b>
                    <div className="bar"><div style={{ width: `${(m / t.count) * 100}%` }} /></div>
                  </div>
                  <small>{m}/{t.count}</small>
                </button>
                {open === t.id && (
                  <ul className="chapters">
                    <li><Link to={`/practice/theme/${t.id}`}>▶ All of {t.id}</Link></li>
                    {t.chapters.map((c) => (
                      <li key={c.id}>
                        <Link to={`/practice/chapter/${c.id}`}>
                          {c.id} {c.name}
                          <small>{mastered(c.questions)}/{c.questions.length}</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
