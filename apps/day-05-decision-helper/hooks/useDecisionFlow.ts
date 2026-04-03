'use client'

import { useState } from 'react'
import { Question, Answer } from '@/lib/types'
import { QUESTION_COUNT, DEFAULT_QUESTION_COUNT } from '@/lib/constants'
import { DEMO_QUESTIONS } from '@/lib/demoData'

export interface DecisionFlowState {
  step: 1 | 2 | 3 | 4
  style: string
  decision: string
  questions: Question[]
  answers: Answer[]
  isLoadingQuestions: boolean
  questionsError: string | null
}

export interface DecisionFlowActions {
  /** Sets style and advances step 1 → 2. */
  setStyle: (id: string) => void
  setDecision: (text: string) => void
  /** Calls /api/questions (or loads mock data in demo mode) then advances step 2 → 3. */
  fetchQuestions: (isDemo: boolean) => Promise<void>
  setAnswer: (index: number, answer: string) => void
  /** Advances step 3 → 4. HomeClient triggers the stream separately. */
  goToBreakdown: () => void
}

export function useDecisionFlow(): DecisionFlowState & DecisionFlowActions {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [style, setStyleState] = useState('')
  const [decision, setDecisionState] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [questionsError, setQuestionsError] = useState<string | null>(null)

  const setStyle = (id: string) => {
    setStyleState(id)
    setStep(2)
  }

  const setDecision = (text: string) => setDecisionState(text)

  const fetchQuestions = async (isDemo: boolean) => {
    setIsLoadingQuestions(true)
    setQuestionsError(null)

    if (isDemo) {
      const count = QUESTION_COUNT[style] ?? DEFAULT_QUESTION_COUNT
      const q = DEMO_QUESTIONS.slice(0, count)
      setQuestions(q)
      setAnswers(q.map((item) => ({ question: item.question, answer: '' })))
      setIsLoadingQuestions(false)
      setStep(3)
      return
    }

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        body: JSON.stringify({ decision, style }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`Request failed: ${res.statusText}`)
      const { questions: q } = await res.json()
      setQuestions(q)
      setAnswers(q.map((item: Question) => ({ question: item.question, answer: '' })))
      setStep(3)
    } catch (err) {
      setQuestionsError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const setAnswer = (index: number, answer: string) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], answer }
      return next
    })
  }

  const goToBreakdown = () => setStep(4)

  return {
    step, style, decision, questions, answers, isLoadingQuestions, questionsError,
    setStyle, setDecision, fetchQuestions, setAnswer, goToBreakdown,
  }
}
