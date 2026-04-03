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
