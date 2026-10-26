// Class B exam rules (FeV Anlage 7). Sources disagree on duration (30 vs 45 min) – adjust here.
export const EXAM = {
  basicQuestions: 20,
  classQuestions: 10,
  minutes: 45,
  maxErrorPoints: 10,
  /** Failing this many 5-point questions fails the exam regardless of total. */
  maxFivePointMistakes: 1,
}
