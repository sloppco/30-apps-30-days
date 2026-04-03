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
  const chipSelected = (opt: string) => answer === opt
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
