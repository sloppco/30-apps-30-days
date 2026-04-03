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
