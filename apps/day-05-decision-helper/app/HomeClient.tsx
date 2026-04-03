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
