import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const { code, language, focus } = await request.json();

  const isAuto = language === "Auto";

  const languageInstruction = isAuto
    ? `Detect the programming language from the code automatically.
Output the very first line of your response in exactly this format, with nothing before it:
Language: [detected language name]
Then output one blank line, then write the review.`
    : `The code is written in ${language}.`;

  const systemPrompt = `You are an expert code reviewer. Review the code provided by the user.
Focus on: ${focus}. ${languageInstruction}
Structure your review with clear sections. Be specific and actionable.
Use plain text only — no markdown, no asterisks, no hashes.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: code,
            },
          ],
        });

        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred";
        controller.enqueue(encoder.encode(`Error: ${message}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
