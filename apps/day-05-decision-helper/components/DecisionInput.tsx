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
