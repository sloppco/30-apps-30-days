import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const FOCUS_INSTRUCTIONS: Record<string, string> = {
  "General review": `Analyse the review and return a summary with:
- "severity": "red" if there are significant issues that must be fixed, "yellow" if there are only minor issues or suggestions, "green" if the code looks solid
- "headline": a single punchy sentence summarising the overall verdict (e.g. "Several issues need attention before this is production-ready" or "Solid code with a few small improvements available")
- "points": 2-4 short, specific bullet points — the most important takeaways from the review`,

  Security: `Analyse the security review and return a summary with:
- "severity": "red" if there are any vulnerabilities or critical risks, "yellow" if there are only low-risk considerations, "green" if the code appears secure
- "headline": a single punchy sentence summarising the security posture (e.g. "Critical vulnerabilities require immediate attention" or "No vulnerabilities found — code looks secure")
- "points": 2-4 short, specific bullet points — the most important security findings`,

  Performance: `Analyse the performance review and return a summary with:
- "severity": "red" if there are serious bottlenecks or performance problems, "yellow" if there are optimisation opportunities but nothing critical, "green" if the code is performant
- "headline": a single punchy sentence summarising performance (e.g. "A bottleneck in the hot path could cause issues at scale" or "No significant performance concerns found")
- "points": 2-4 short, specific bullet points — the most important performance findings`,

  Readability: `Analyse the readability review and return a summary with:
- "severity": "red" if the code has serious clarity or maintainability problems, "yellow" if there are naming or structure improvements to make, "green" if the code is clear and easy to follow
- "headline": a single punchy sentence summarising readability (e.g. "Some structural changes would significantly improve maintainability" or "Code is clear and well-organised")
- "points": 2-4 short, specific bullet points — the most important readability findings`,

  "Bug detection": `Analyse the bug review and return a summary with:
- "severity": "red" if confirmed bugs were found, "yellow" if there are potential bugs or risky edge cases, "green" if no bugs were found
- "headline": a single punchy sentence summarising the bug findings (e.g. "Two bugs found that will cause incorrect behaviour" or "No bugs detected — logic looks sound")
- "points": 2-4 short, specific bullet points — the most important bug findings`,
};

export interface Summary {
  severity: "red" | "yellow" | "green";
  headline: string;
  points: string[];
}

export async function POST(request: Request) {
  const { review, focus } = await request.json();

  const instructions =
    FOCUS_INSTRUCTIONS[focus] ?? FOCUS_INSTRUCTIONS["General review"];

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `You extract a structured summary from a code review. ${instructions}
Respond with ONLY valid JSON in this exact shape:
{ "severity": "red" | "yellow" | "green", "headline": "...", "points": ["...", "..."] }
No prose, no markdown fences.`,
    messages: [{ role: "user", content: review }],
  });

  const raw =
    message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Response.json(parsed);
  } catch {
    console.error("Stats parse error. Raw output:", raw);
    return Response.json(null);
  }
}
