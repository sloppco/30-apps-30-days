# Decision Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 4-step AI decision coaching web app where users pick a style, describe their decision, answer follow-up questions, and receive a streamed breakdown.

**Architecture:** Next.js 16 App Router. A server component (`page.tsx`) derives `isDemo` and passes it to a client orchestrator (`HomeClient.tsx`). Two hooks own all logic: `useDecisionFlow` (step state, questions API) and `useBreakdownStream` (streaming). Demo mode uses `useDemoFlow` to auto-pilot the UI without calling the real API. Components are small and single-purpose.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, `@anthropic-ai/sdk`, Google Fonts (DM Sans).

---

## File Map

| File | Responsibility |
|------|----------------|
| `app/layout.tsx` | DM Sans font, metadata, global styles |
| `app/page.tsx` | Server component; derives `isDemo`; renders `HomeClient` |
| `app/HomeClient.tsx` | Client orchestrator; wires hooks; renders step views |
| `app/globals.css` | Tailwind import + `@keyframes` |
| `app/api/questions/route.ts` | POST handler; returns JSON questions array |
| `app/api/breakdown/route.ts` | POST handler; returns `ReadableStream` |
| `lib/types.ts` | `DecisionStyle`, `Question`, `Answer` types |
| `lib/constants.ts` | `STYLES` array, `SKIP_SECTIONS`, `QUESTION_COUNT` |
| `lib/demoData.ts` | `DEMO_QUESTIONS`, `DEMO_DECISION`, `DEMO_BREAKDOWN` |
| `hooks/useDecisionFlow.ts` | Step state, `style`, `decision`, `questions`, `answers`, API call |
| `hooks/useBreakdownStream.ts` | Streaming fetch, demo stream, `AbortController` |
| `hooks/useDemoFlow.ts` | Auto-pilots the 4-step flow with cursor animation |
| `components/StepIndicator.tsx` | 4-dot progress indicator with labels |
| `components/StyleGrid.tsx` | 5 coaching style cards |
| `components/DecisionInput.tsx` | Textarea + char count + CTA |
| `components/QuestionCard.tsx` | Single question with chips + free-text |
| `components/BreakdownView.tsx` | Streamed section renderer |
| `components/DemoCursor.tsx` | Animated cursor overlay (identical to Day 04) |

---

## Task 1: Scaffold project

**Files:**
- Create: `apps/day-05-decision-helper/` (entire app)

- [ ] **Step 1: Run create-next-app**

```bash
cd /path/to/30-apps-30-days/apps && npx create-next-app@latest day-05-decision-helper \
  --typescript --tailwind --no-eslint --no-src-dir --app \
  --no-turbopack --import-alias "@/*" --yes
```

- [ ] **Step 2: Install Anthropic SDK**

```bash
cd day-05-decision-helper && npm install @anthropic-ai/sdk
```

- [ ] **Step 3: Write vercel.json**

Create `apps/day-05-decision-helper/vercel.json`:
```json
{ "framework": "nextjs" }
```

- [ ] **Step 4: Replace globals.css**

Overwrite `apps/day-05-decision-helper/app/globals.css` with:
```css
@import "tailwindcss";

@keyframes ping {
  0%   { transform: translate(-6px, -6px) scale(1); opacity: 0.3; }
  100% { transform: translate(-6px, -6px) scale(2.2); opacity: 0; }
}
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```
Expected: server starts on `http://localhost:3000` with no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/day-05-decision-helper
git commit -m "feat: scaffold day-05-decision-helper"
```

---

## Task 2: Types and constants

**Files:**
- Create: `apps/day-05-decision-helper/lib/types.ts`
- Create: `apps/day-05-decision-helper/lib/constants.ts`

- [ ] **Step 1: Write lib/types.ts**

```ts
export interface DecisionStyle {
  id: string
  icon: string
  name: string
  desc: string
}

export interface Question {
  question: string
  options: [string, string, string]
}

export interface Answer {
  question: string
  answer: string
}
```

- [ ] **Step 2: Write lib/constants.ts**

```ts
import { DecisionStyle } from './types'

export const STYLES: DecisionStyle[] = [
  { id: 'challenger', icon: '🔥', name: 'Challenger',        desc: 'Pushes back on your assumptions' },
  { id: 'strategist', icon: '📊', name: 'Strategist',        desc: 'Structured with a clear recommendation' },
  { id: 'speedrun',   icon: '⚡', name: 'Speed run',         desc: 'Fast answer, minimal fuss' },
  { id: 'therapist',  icon: '🌿', name: 'Therapist',         desc: 'Gentle and reflective' },
  { id: 'devil',      icon: '😈', name: "Devil's advocate",  desc: 'Argues the opposite' },
]

export const STYLE_LABELS: Record<string, string> = {
  challenger: 'Challenger',
  strategist: 'Strategist',
  speedrun:   'Speed Run',
  therapist:  'Therapist',
  devil:      "Devil's Advocate",
}

// Sections to omit per style
export const SKIP_SECTIONS: Record<string, string[]> = {
  therapist: ['## Pros / cons', '## Recommended lean'],
  speedrun:  ['## What you might be avoiding'],
}

// Number of questions to request
export const QUESTION_COUNT: Record<string, number> = { speedrun: 1 }
export const DEFAULT_QUESTION_COUNT = 3
```

- [ ] **Step 3: Commit**

```bash
git add apps/day-05-decision-helper/lib
git commit -m "feat: add types and constants for decision-helper"
```

---

## Task 3: Demo data

**Files:**
- Create: `apps/day-05-decision-helper/lib/demoData.ts`

- [ ] **Step 1: Write lib/demoData.ts**

```ts
import { Question } from './types'

export const DEMO_STYLE = 'challenger'

export const DEMO_DECISION =
  "Should I leave my stable job to join an early-stage startup as employee #8?"

export const DEMO_QUESTIONS: Question[] = [
  {
    question: 'How long have you been sitting with this decision?',
    options: ['A few days', 'A few weeks', 'Several months'],
  },
  {
    question: 'What feels most scary about making the wrong choice?',
    options: ['Wasting time or money', 'Disappointing others', 'Missing out on something better'],
  },
  {
    question: 'If you had to decide right now, which way would you lean?',
    options: ["I already know — I just need validation", "I'm genuinely split 50/50", 'I lean one way but I\'m scared'],
  },
]

export const DEMO_BREAKDOWN = `## The situation
You're weighing whether to leave a stable job for an early-stage startup as employee number 8.

## What's actually at stake
This isn't just a career move — it's a bet on your risk tolerance, your financial runway, and what you want the next chapter to feel like. The startup offers upside and ownership; the stable job offers certainty and optionality. Both have a cost.

## Pros / cons
**For the startup:** Equity at employee #8 is meaningful. You'd have outsized influence on company culture and product direction. The learning curve will be steep and fast.

**Against the startup:** Early-stage means real failure risk. Your income stability disappears. The "excitement" of a startup has a 2am-Slack-message tax that job listings don't advertise.

## What you might be avoiding
There's a version of this where your "stable job" feels safe but actually feels stifling — and the startup is the permission slip you're looking for to leave something you've already mentally quit. Worth sitting with.

## Recommended lean
If your financial runway covers 12 months of worst-case (offer falls through, startup fails fast), and you've met the founders more than twice and respect them, lean in. If either of those conditions isn't met, wait until they are.

## The question to sit with
If the startup fails in 18 months and you're job-hunting again — would you feel like you took a shot, or like you made a mistake?`
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/lib/demoData.ts
git commit -m "feat: add demo data for decision-helper"
```

---

## Task 4: API route — /api/questions

**Files:**
- Create: `apps/day-05-decision-helper/app/api/questions/route.ts`

- [ ] **Step 1: Write the route**

```ts
import Anthropic from '@anthropic-ai/sdk'
import { STYLE_LABELS, QUESTION_COUNT, DEFAULT_QUESTION_COUNT } from '@/lib/constants'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const { decision, style } = await request.json()

  const n = QUESTION_COUNT[style] ?? DEFAULT_QUESTION_COUNT
  const styleName = STYLE_LABELS[style] ?? style

  const prompt =
    `You are a ${styleName} decision coach. The user is facing this decision: ${decision}. ` +
    `Generate ${n} follow-up question${n > 1 ? 's' : ''} that will sharpen your analysis. ` +
    `For each question, also generate exactly 3 short pre-canned answer options that reflect realistic responses. ` +
    `Respond only in JSON. Format: [{ "question": string, "options": [string, string, string] }].`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const questions = JSON.parse(cleaned)

  return Response.json({ questions })
}
```

- [ ] **Step 2: Verify (requires API key set in .env.local)**

With `ANTHROPIC_API_KEY` in `apps/day-05-decision-helper/.env.local`:
```
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{"decision":"Should I move cities for a new job?","style":"strategist"}'
```
Expected: `{ "questions": [{ "question": "...", "options": ["...", "...", "..."] }, ...] }`

- [ ] **Step 3: Commit**

```bash
git add apps/day-05-decision-helper/app/api/questions
git commit -m "feat: add /api/questions route for decision-helper"
```

---

## Task 5: API route — /api/breakdown

**Files:**
- Create: `apps/day-05-decision-helper/app/api/breakdown/route.ts`

- [ ] **Step 1: Write the route**

```ts
import Anthropic from '@anthropic-ai/sdk'
import { Answer } from '@/lib/types'
import { SKIP_SECTIONS } from '@/lib/constants'

const anthropic = new Anthropic()

const SYSTEM_PROMPTS: Record<string, string> = {
  challenger:
    "You are a tough, direct decision coach. Push back hard on assumptions. Don't validate — interrogate. Use the follow-up answers to identify what the user might be avoiding or rationalising.",
  strategist:
    "You are a structured analytical coach. Use frameworks. Be direct with a recommendation. Lay out the trade-offs clearly and conclude with a definitive lean.",
  speedrun:
    "You are a no-nonsense coach. Be brief. One paragraph per section max. Get to the point.",
  therapist:
    "You are a gentle, reflective coach. Prioritise feelings and underlying needs. Don't push a recommendation — help the user hear themselves think.",
  devil:
    "You are a contrarian coach. Argue the opposite of wherever the user seems to be leaning. Surface the strongest case for the road not taken.",
}

const ALL_SECTIONS = [
  "## The situation",
  "## What's actually at stake",
  "## Pros / cons",
  "## What you might be avoiding",
  "## Recommended lean",
  "## The question to sit with",
]

export async function POST(request: Request) {
  const { decision, style, answers }: { decision: string; style: string; answers: Answer[] } =
    await request.json()

  const skip = SKIP_SECTIONS[style] ?? []
  const sections = ALL_SECTIONS.filter((s) => !skip.includes(s))
  const systemPrompt = SYSTEM_PROMPTS[style] ?? SYSTEM_PROMPTS.strategist

  const answersText =
    answers.length > 0
      ? '\n\nFollow-up answers:\n' + answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')
      : ''

  const userMessage =
    `Decision: ${decision}${answersText}\n\n` +
    `Please provide your coaching breakdown using these exact section headings in this order:\n` +
    sections.join('\n')

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        })

        for await (const event of messageStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'An error occurred'
        controller.enqueue(encoder.encode(`Error: ${msg}`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/app/api/breakdown
git commit -m "feat: add /api/breakdown streaming route for decision-helper"
```

---

## Task 6: useBreakdownStream hook

**Files:**
- Create: `apps/day-05-decision-helper/hooks/useBreakdownStream.ts`

- [ ] **Step 1: Write the hook**

```ts
'use client'

import { useState, useRef } from 'react'
import { Answer } from '@/lib/types'
import { DEMO_BREAKDOWN } from '@/lib/demoData'

export interface BreakdownStreamState {
  breakdown: string
  isStreaming: boolean
  error: string | null
}

export interface BreakdownStreamActions {
  stream: (payload: { decision: string; style: string; answers: Answer[] }) => Promise<void>
  streamDemo: () => void
  stop: () => void
  reset: () => void
}

export function useBreakdownStream(): BreakdownStreamState & BreakdownStreamActions {
  const [breakdown, setBreakdown] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stream = async (payload: { decision: string; style: string; answers: Answer[] }) => {
    const ac = new AbortController()
    abortRef.current = ac

    setIsStreaming(true)
    setBreakdown('')
    setError(null)

    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        signal: ac.signal,
      })

      if (!res.ok) throw new Error(`Request failed: ${res.statusText}`)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder('utf-8', { fatal: false })

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setBreakdown((prev) => prev + chunk)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // intentional cancel
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    } finally {
      setIsStreaming(false)
    }
  }

  const streamDemo = () => {
    setBreakdown('')
    setError(null)
    setIsStreaming(true)

    let i = 0
    const CHAR_DELAY = 12

    demoTimerRef.current = setInterval(() => {
      i++
      setBreakdown(DEMO_BREAKDOWN.slice(0, i))
      if (i >= DEMO_BREAKDOWN.length) {
        clearInterval(demoTimerRef.current!)
        setIsStreaming(false)
      }
    }, CHAR_DELAY)
  }

  const stop = () => {
    abortRef.current?.abort()
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current)
      setIsStreaming(false)
    }
  }

  const reset = () => {
    stop()
    setBreakdown('')
    setError(null)
    setIsStreaming(false)
  }

  return { breakdown, isStreaming, error, stream, streamDemo, stop, reset }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/hooks/useBreakdownStream.ts
git commit -m "feat: add useBreakdownStream hook"
```

---

## Task 7: useDecisionFlow hook

**Files:**
- Create: `apps/day-05-decision-helper/hooks/useDecisionFlow.ts`

- [ ] **Step 1: Write the hook**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/hooks/useDecisionFlow.ts
git commit -m "feat: add useDecisionFlow hook"
```

---

## Task 8: useDemoFlow hook

**Files:**
- Create: `apps/day-05-decision-helper/hooks/useDemoFlow.ts`

- [ ] **Step 1: Write the hook**

```ts
'use client'

import { useState, useEffect } from 'react'
import { Question, Answer } from '@/lib/types'
import { DEMO_STYLE, DEMO_DECISION, DEMO_QUESTIONS } from '@/lib/demoData'

export interface DemoFlowState {
  step: 1 | 2 | 3 | 4
  style: string
  decision: string
  questions: Question[]
  answers: Answer[]
  cursorTarget: string | null
  isCursorClicking: boolean
}

/**
 * Runs an automated looping demo of the full 4-step decision flow.
 * Calls onBreakdown() when it reaches step 4 so HomeClient can trigger
 * the mock breakdown stream.
 */
export function useDemoFlow(enabled: boolean, onBreakdown: () => void): DemoFlowState {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [style, setStyle] = useState('')
  const [decision, setDecision] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [cursorTarget, setCursorTarget] = useState<string | null>(null)
  const [isCursorClicking, setIsCursorClicking] = useState(false)
  const [loopCount, setLoopCount] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const timeouts: ReturnType<typeof setTimeout>[] = []
    const at = (delay: number, fn: () => void) => timeouts.push(setTimeout(fn, delay))

    // Reset
    setStep(1)
    setStyle('')
    setDecision('')
    setQuestions([])
    setAnswers([])
    setCursorTarget(null)
    setIsCursorClicking(false)

    let t = 800

    const click = (selector: string, action: () => void) => {
      at(t, () => setCursorTarget(selector))
      t += 700
      at(t, () => setIsCursorClicking(true))
      t += 220
      at(t, () => { setIsCursorClicking(false); action() })
      t += 350
    }

    // Phase 1 — pick a style card
    click(`[data-style="${DEMO_STYLE}"]`, () => {
      setStyle(DEMO_STYLE)
      setStep(2)
    })

    // Phase 2 — type the decision
    at(t, () => setCursorTarget('[data-input="decision"]'))
    t += 700

    const CHAR_DELAY = 22
    DEMO_DECISION.split('').forEach((_, i) => {
      at(t + i * CHAR_DELAY, () => setDecision(DEMO_DECISION.slice(0, i + 1)))
    })
    t += DEMO_DECISION.length * CHAR_DELAY + 600

    // Phase 3 — click "Get my questions →"
    click('[data-cta="get-questions"]', () => {
      const q = DEMO_QUESTIONS
      setQuestions(q)
      setAnswers(q.map((item) => ({ question: item.question, answer: '' })))
      setStep(3)
    })

    t += 400 // brief pause before answering

    // Phase 4 — select first chip for each question
    DEMO_QUESTIONS.forEach((q, qi) => {
      click(`[data-chip="${qi}-0"]`, () => {
        setAnswers((prev) => {
          const next = [...prev]
          next[qi] = { question: q.question, answer: q.options[0] }
          return next
        })
      })
    })

    // Phase 5 — click "Get my breakdown →"
    click('[data-cta="get-breakdown"]', () => {
      setStep(4)
      onBreakdown()
    })

    // Phase 6 — wait and loop
    t += 18000
    at(t, () => setLoopCount((c) => c + 1))

    return () => timeouts.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, loopCount])

  return { step, style, decision, questions, answers, cursorTarget, isCursorClicking }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/hooks/useDemoFlow.ts
git commit -m "feat: add useDemoFlow automated demo hook"
```

---

## Task 9: StepIndicator component

**Files:**
- Create: `apps/day-05-decision-helper/components/StepIndicator.tsx`

- [ ] **Step 1: Write the component**

```tsx
const STEP_LABELS = ['Choose style', 'Describe it', 'Answer questions', 'Get your breakdown']

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '2rem' }}>
      {STEP_LABELS.map((label, i) => {
        const stepNum = (i + 1) as 1 | 2 | 3 | 4
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep
        return (
          <div key={stepNum} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 72 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isActive ? '#534AB7' : isDone ? '#534AB7' : '#D1D5DB',
                  opacity: isDone ? 0.4 : 1,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: isActive ? '#534AB7' : '#9CA3AF',
                  fontWeight: isActive ? 500 : 400,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                style={{
                  height: 1,
                  width: 32,
                  background: '#E5E7EB',
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/components/StepIndicator.tsx
git commit -m "feat: add StepIndicator component"
```

---

## Task 10: StyleGrid component

**Files:**
- Create: `apps/day-05-decision-helper/components/StyleGrid.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client'

import { STYLES } from '@/lib/constants'

interface StyleGridProps {
  selected: string
  onSelect: (id: string) => void
}

export function StyleGrid({ selected, onSelect }: StyleGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12,
      }}
    >
      {STYLES.map((s) => {
        const isActive = selected === s.id
        return (
          <button
            key={s.id}
            data-style={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              background: isActive ? '#EEEDFE' : 'white',
              border: isActive ? '2px solid #3C3489' : '1px solid #E5E7EB',
              borderRadius: 12,
              padding: '16px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{s.name}</span>
            <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{s.desc}</span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/components/StyleGrid.tsx
git commit -m "feat: add StyleGrid component"
```

---

## Task 11: DecisionInput component

**Files:**
- Create: `apps/day-05-decision-helper/components/DecisionInput.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client'

interface DecisionInputProps {
  value: string
  onChange: (text: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export function DecisionInput({ value, onChange, onSubmit, isLoading }: DecisionInputProps) {
  const disabled = !value.trim() || isLoading
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <textarea
        data-input="decision"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the decision you're facing…"
        rows={5}
        style={{
          width: '100%',
          padding: 16,
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          background: 'white',
          fontSize: 14,
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          color: '#111827',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{value.length} chars</span>
        <button
          data-cta="get-questions"
          onClick={onSubmit}
          disabled={disabled}
          style={{
            background: disabled ? '#D1D5DB' : '#3C3489',
            color: disabled ? '#9CA3AF' : '#EEEDFE',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {isLoading ? 'Loading…' : 'Get my questions →'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/components/DecisionInput.tsx
git commit -m "feat: add DecisionInput component"
```

---

## Task 12: QuestionCard component

**Files:**
- Create: `apps/day-05-decision-helper/components/QuestionCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client'

interface QuestionCardProps {
  question: string
  options: string[]
  answer: string
  index: number
  total: number
  onChange: (answer: string) => void
}

export function QuestionCard({ question, options, answer, index, total, onChange }: QuestionCardProps) {
  // True if the current answer matches one of the pre-canned chips.
  const chipSelected = (opt: string) => answer === opt
  // Textarea shows the custom value only when no chip is selected.
  const textareaValue = options.includes(answer) ? '' : answer

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', lineHeight: 1.5, flex: 1, marginRight: 12, margin: 0 }}>
          {question}
        </p>
        <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {index + 1} / {total}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, oi) => {
          const active = chipSelected(opt)
          return (
            <button
              key={opt}
              data-chip={`${index}-${oi}`}
              onClick={() => onChange(active ? '' : opt)}
              style={{
                background: active ? '#EEEDFE' : 'white',
                border: active ? '2px solid #3C3489' : '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '10px 14px',
                textAlign: 'left',
                fontSize: 13,
                color: active ? '#3C3489' : '#374151',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6, margin: '0 0 6px' }}>
          or write your own
        </p>
        <textarea
          value={textareaValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer…"
          rows={2}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            color: '#111827',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/components/QuestionCard.tsx
git commit -m "feat: add QuestionCard component"
```

---

## Task 13: BreakdownView component

**Files:**
- Create: `apps/day-05-decision-helper/components/BreakdownView.tsx`

- [ ] **Step 1: Write the component**

```tsx
interface BreakdownViewProps {
  text: string
  isStreaming: boolean
  error: string | null
}

export function BreakdownView({ text, isStreaming, error }: BreakdownViewProps) {
  if (error) {
    return (
      <div
        style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 12,
          padding: 20,
        }}
      >
        <p style={{ color: '#DC2626', fontSize: 14, margin: 0 }}>{error}</p>
      </div>
    )
  }

  if (!text && isStreaming) {
    return (
      <div
        style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>Thinking…</p>
      </div>
    )
  }

  // Split on "## " headings; filter empty strings.
  const sections = text.split(/(?=^## )/m).filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sections.map((section, i) => {
        const lines = section.split('\n')
        const heading = lines[0].replace(/^## /, '')
        const body = lines.slice(1).join('\n').trim()
        return (
          <div
            key={i}
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <h3
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#3C3489',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 10,
                margin: '0 0 10px',
              }}
            >
              {heading}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: '#374151',
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {body}
            </p>
          </div>
        )
      })}

      {isStreaming && (
        <div
          style={{
            height: 3,
            background: '#EEEDFE',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '40%',
              background: '#3C3489',
              borderRadius: 2,
              animation: 'stream-pulse 1.2s ease-in-out infinite',
            }}
          />
        </div>
      )}
    </div>
  )
}
```

Add `@keyframes stream-pulse` to `globals.css`:
```css
@keyframes stream-pulse {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/components/BreakdownView.tsx apps/day-05-decision-helper/app/globals.css
git commit -m "feat: add BreakdownView component"
```

---

## Task 14: DemoCursor component

**Files:**
- Create: `apps/day-05-decision-helper/components/DemoCursor.tsx`

- [ ] **Step 1: Write the component** (identical to Day 04 with the accent colour changed to `#3C3489`)

```tsx
'use client'

import { useEffect, useState } from 'react'

interface DemoCursorProps {
  targetSelector: string | null
  isClicking: boolean
}

export function DemoCursor({ targetSelector, isClicking }: DemoCursorProps) {
  const [pos, setPos] = useState({ x: -120, y: -120 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!targetSelector) { setVisible(false); return }
    const el = document.querySelector(targetSelector)
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ x: rect.left + rect.width * 0.55, y: rect.top + rect.height * 0.55 })
    setVisible(true)
  }, [targetSelector])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 50,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: visible ? 1 : 0,
      }}
    >
      <svg
        width="22"
        height="26"
        viewBox="0 0 22 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}
      >
        <path
          d="M3 2L18 11.5L11.5 13L15.5 21.5L12.5 23L8.5 14.5L3 18.5V2Z"
          fill="white"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {isClicking && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 28,
            height: 28,
            transform: 'translate(-6px, -6px)',
            borderRadius: '50%',
            background: '#3C3489',
            opacity: 0.3,
            animation: 'ping 0.6s ease-out',
          }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-05-decision-helper/components/DemoCursor.tsx
git commit -m "feat: add DemoCursor component"
```

---

## Task 15: HomeClient, layout, and page

**Files:**
- Create: `apps/day-05-decision-helper/app/HomeClient.tsx`
- Modify: `apps/day-05-decision-helper/app/layout.tsx`
- Modify: `apps/day-05-decision-helper/app/page.tsx`

- [ ] **Step 1: Write HomeClient.tsx**

```tsx
'use client'

import { StepIndicator } from '@/components/StepIndicator'
import { StyleGrid } from '@/components/StyleGrid'
import { DecisionInput } from '@/components/DecisionInput'
import { QuestionCard } from '@/components/QuestionCard'
import { BreakdownView } from '@/components/BreakdownView'
import { DemoCursor } from '@/components/DemoCursor'
import { useDecisionFlow } from '@/hooks/useDecisionFlow'
import { useBreakdownStream } from '@/hooks/useBreakdownStream'
import { useDemoFlow } from '@/hooks/useDemoFlow'

interface HomeClientProps {
  isDemo: boolean
}

export default function HomeClient({ isDemo }: HomeClientProps) {
  const breakdownStream = useBreakdownStream()
  const flow = useDecisionFlow()
  const demo = useDemoFlow(isDemo, () => breakdownStream.streamDemo())

  const activeStep = isDemo ? demo.step : flow.step
  const activeStyle = isDemo ? demo.style : flow.style
  const activeDecision = isDemo ? demo.decision : flow.decision
  const activeQuestions = isDemo ? demo.questions : flow.questions
  const activeAnswers = isDemo ? demo.answers : flow.answers

  function handleGetBreakdown() {
    if (isDemo) return
    flow.goToBreakdown()
    breakdownStream.stream({ decision: flow.decision, style: flow.style, answers: flow.answers })
  }

  function handleSkipToBreakdown() {
    if (isDemo) return
    flow.goToBreakdown()
    breakdownStream.stream({ decision: flow.decision, style: flow.style, answers: [] })
  }

  return (
    <main
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '2.5rem 1.25rem',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>
          Decision Helper
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          AI coaching for the decisions that matter
        </p>
      </div>

      <StepIndicator currentStep={activeStep} />

      {/* Step 1 — Choose style */}
      {activeStep === 1 && (
        <div>
          <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
            Pick a coaching style to get started
          </p>
          <StyleGrid
            selected={activeStyle}
            onSelect={isDemo ? () => {} : flow.setStyle}
          />
        </div>
      )}

      {/* Step 2 — Describe it */}
      {activeStep === 2 && (
        <div>
          <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
            What decision are you facing?
          </p>
          <DecisionInput
            value={activeDecision}
            onChange={isDemo ? () => {} : flow.setDecision}
            onSubmit={isDemo ? () => {} : () => flow.fetchQuestions(false)}
            isLoading={flow.isLoadingQuestions}
          />
          {flow.questionsError && (
            <p style={{ fontSize: 13, color: '#DC2626', marginTop: 8 }}>
              {flow.questionsError}
            </p>
          )}
        </div>
      )}

      {/* Step 3 — Answer questions */}
      {activeStep === 3 && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeQuestions.map((q, i) => (
              <QuestionCard
                key={i}
                question={q.question}
                options={q.options}
                answer={activeAnswers[i]?.answer ?? ''}
                index={i}
                total={activeQuestions.length}
                onChange={isDemo ? () => {} : (ans) => flow.setAnswer(i, ans)}
              />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 20,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleSkipToBreakdown}
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                color: '#374151',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Skip questions — just decide →
            </button>
            <button
              data-cta="get-breakdown"
              onClick={handleGetBreakdown}
              style={{
                background: '#3C3489',
                color: '#EEEDFE',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Get my breakdown →
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Breakdown */}
      {activeStep === 4 && (
        <BreakdownView
          text={breakdownStream.breakdown}
          isStreaming={breakdownStream.isStreaming}
          error={breakdownStream.error}
        />
      )}

      {isDemo && (
        <DemoCursor
          targetSelector={demo.cursorTarget}
          isClicking={demo.isCursorClicking}
        />
      )}
    </main>
  )
}
```

- [ ] **Step 2: Write layout.tsx**

```tsx
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] })

export const metadata: Metadata = {
  title: 'Decision Helper',
  description: 'AI coaching for the decisions that matter',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`} style={{ background: '#F9FAFB' }}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Write page.tsx**

```tsx
import HomeClient from '@/app/HomeClient'

interface PageProps {
  searchParams: Promise<{ demo?: string }>
}

/**
 * Server component shell for Decision Helper.
 *
 * Rules:
 *  - Production (NODE_ENV === "production") → always demo mode, real API is never called.
 *  - Development → demo mode only when ?demo=true is in the URL.
 *  - Demo mode also activates when ANTHROPIC_API_KEY is absent.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const isDemo =
    process.env.NODE_ENV === 'production' ||
    params.demo === 'true' ||
    !process.env.ANTHROPIC_API_KEY

  return <HomeClient isDemo={isDemo} />
}
```

- [ ] **Step 4: Remove the default Next.js page content**

Delete everything in the `app/page.tsx` that was scaffolded by `create-next-app` and replace with the content above (already done in Step 3).

- [ ] **Step 5: Commit**

```bash
git add apps/day-05-decision-helper/app/HomeClient.tsx \
        apps/day-05-decision-helper/app/layout.tsx \
        apps/day-05-decision-helper/app/page.tsx
git commit -m "feat: wire up HomeClient, layout, and page for decision-helper"
```

---

## Task 16: Smoke test and final cleanup

**Files:** No new files.

- [ ] **Step 1: Run dev server**

```bash
cd apps/day-05-decision-helper && npm run dev
```

- [ ] **Step 2: Verify demo mode (no API key needed)**

Open `http://localhost:3000?demo=true`. Expected:
- Animated cursor moves to a style card and clicks it
- Step indicator advances to step 2
- Demo text types into the textarea
- "Get my questions →" is clicked; question cards appear (step 3)
- First chip of each question is selected
- "Get my breakdown →" is clicked; breakdown streams in (step 4)
- After ~18 s the loop restarts

- [ ] **Step 3: Verify real mode (with ANTHROPIC_API_KEY in .env.local)**

Open `http://localhost:3000`. Expected:
- Click a style card → advances to step 2
- Type a decision → click "Get my questions →" → API is called, question cards appear
- Select answers or type your own → click "Get my breakdown →" → breakdown streams in sections
- "Skip questions — just decide →" also works from step 3

- [ ] **Step 4: Run build to check for TypeScript errors**

```bash
npm run build
```
Expected: build completes with no type errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete day-05-decision-helper app"
```
