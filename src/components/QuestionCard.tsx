import { useState } from 'react'
import type { Answer, Question } from '../types'
import { isCorrect } from '../scoring'
import Media from './Media'

interface Props {
  q: Question
  value: Answer | undefined
  onChange: (a: Answer) => void
  /** When set, show correct/incorrect marking and the explanation. */
  reveal: boolean
  bookmarked?: boolean
  onBookmark?: () => void
}

export default function QuestionCard({ q, value, onChange, reveal, bookmarked, onBookmark }: Props) {
  const [showExpl, setShowExpl] = useState(true)
  const ok = reveal && isCorrect(q, value)
  const unanswered = value === undefined
  return (
    <article className="card">
      <header className="qhead">
        <span className="chip">{q.id}</span>
        <span className={`chip pts p${q.points}`}>{q.points} pts</span>
        {onBookmark && (
          <button className="icon" onClick={onBookmark} aria-label="Bookmark" aria-pressed={bookmarked}>
            {bookmarked ? '★' : '☆'}
          </button>
        )}
      </header>
      <h2 className="qtext">{q.text}</h2>
      <Media q={q} />

      {q.type === 'choice' ? (
        <>
          <p className="hint">Select all correct answers</p>
          <ul className="options">
            {q.options.map((opt, i) => {
              const picked = ((value as number[]) ?? []).includes(i)
              const isRight = q.correct.includes(i)
              const cls = ['option', picked && 'picked', reveal && isRight && 'right', reveal && picked && !isRight && 'wrong'].filter(Boolean).join(' ')
              return (
                <li key={i}>
                  <button
                    className={cls}
                    disabled={reveal}
                    onClick={() => {
                      const cur = (value as number[]) ?? []
                      onChange(cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i])
                    }}
                  >
                    <span className="box">{picked ? '✓' : ''}</span>
                    <span>{opt}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <div className="numrow">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Enter a number"
            value={(value as string) ?? ''}
            disabled={reveal}
            onChange={(e) => onChange(e.target.value)}
            className={reveal ? (ok ? 'right' : 'wrong') : ''}
          />
          {reveal && !ok && !unanswered && <p className="hint">Correct answer: <b>{q.answer}</b></p>}
        </div>
      )}

      {reveal && (
        <section className={`feedback ${unanswered ? '' : ok ? 'ok' : 'bad'}`}>
          <strong>{unanswered ? 'Correct answer highlighted' : ok ? '✓ Correct' : '✗ Incorrect'}</strong>
          {q.explanation && (
            <>
              <button className="link" onClick={() => setShowExpl(!showExpl)}>{showExpl ? 'Hide' : 'Show'} explanation</button>
              {showExpl && <p>{q.explanation}</p>}
            </>
          )}
        </section>
      )}
    </article>
  )
}
