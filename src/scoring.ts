import { EXAM } from './config'
import type { Answer, Question } from './types'

export function isCorrect(q: Question, a: Answer | undefined): boolean {
  if (a === undefined) return false
  if (q.type === 'number') {
    const n = Number(String(a).replace(',', '.').trim())
    return String(a).trim() !== '' && n === q.answer
  }
  const picked = [...(a as number[])].sort()
  return picked.length === q.correct.length && picked.every((v, i) => v === q.correct[i])
}

export interface ExamResult {
  errorPoints: number
  fivePointMistakes: number
  wrong: number
  passed: boolean
  failReason: string | null
}

export function scoreExam(qs: Question[], answers: Record<string, Answer>): ExamResult {
  let errorPoints = 0
  let fivePointMistakes = 0
  let wrong = 0
  for (const q of qs) {
    if (!isCorrect(q, answers[q.id])) {
      wrong++
      errorPoints += q.points
      if (q.points === 5) fivePointMistakes++
    }
  }
  let failReason: string | null = null
  if (errorPoints > EXAM.maxErrorPoints) failReason = `More than ${EXAM.maxErrorPoints} error points`
  else if (fivePointMistakes > EXAM.maxFivePointMistakes) failReason = 'Two 5-point questions answered wrongly'
  return { errorPoints, fivePointMistakes, wrong, passed: failReason === null, failReason }
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Random exam: 20 basic + 10 class-specific, basic first like the real test. */
export function drawExam(all: Question[]): Question[] {
  const pick = (section: Question['section'], n: number) => shuffle(all.filter((q) => q.section === section)).slice(0, n)
  return [...pick('basic', EXAM.basicQuestions), ...pick('class', EXAM.classQuestions)]
}
