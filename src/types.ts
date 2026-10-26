export interface BaseQuestion {
  id: string
  section: 'basic' | 'class'
  theme: string
  themeName: string
  chapter: string
  chapterName: string
  points: number
  text: string
  explanation: string
  images: string[]
  video: string | null
}
export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice'
  options: string[]
  correct: number[]
}
export interface NumberQuestion extends BaseQuestion {
  type: 'number'
  answer: number
}
export type Question = ChoiceQuestion | NumberQuestion

/** A user's answer: indexes for choice questions, a string for number questions. */
export type Answer = number[] | string
