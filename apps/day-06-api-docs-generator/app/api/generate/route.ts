import Anthropic from '@anthropic-ai/sdk';
import { MOCK_MARKDOWN } from '@/lib/constants';
import type { Format } from '@/lib/types';

const FORMAT_PREFIXES: Record<Format, string> = {
  code: 'The following is API route code. Extract all endpoints and generate documentation:',
  openapi: 'The following is an OpenAPI/Swagger specification. Generate documentation:',
  plaintext: 'The following is a plain English description of an API. Generate documentation:',
};

const SYSTEM_PROMPT = `You are an expert technical writer generating clean, accurate API documentation. Given the provided API definition, generate structured documentation in the following markdown format. Be precise — infer types, required fields, and auth requirements from the code where possible. Do not invent endpoints or parameters that aren't present.

Output your response in this exact markdown structure:

# {API Name}

**Base URL:** \`{base url or https://api.example.com/v1 if not specified}\`

## Overview

| Property | Value |
|----------|-------|
| Authentication | {auth type} |
| Content-Type | application/json |
| Total endpoints | {count} |

## Authentication

{Description of auth mechanism if detectable, or "No authentication required."}

## Endpoints

### {METHOD} {/path}

{One-sentence description.}

**{Query/Body/Path} parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| {name} | {type} | {Yes/No} | {description} |

**Example request**
\`\`\`http
{METHOD} {path}
{headers}
{body if applicable}
\`\`\`

**Example response** \`{status code}\`
\`\`\`json
{example response}
\`\`\`

**Error codes**

| Code | Description |
|------|-------------|
| {code} | {description} |

---

Repeat the endpoint block for each endpoint. Omit parameter/error tables if there are none for that endpoint.`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(MOCK_MARKDOWN, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  let input: string;
  let format: Format;

  try {
    const body = (await request.json()) as { input: string; format: Format };
    input = body.input;
    format = body.format;
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  if (!input || typeof input !== 'string') {
    return new Response('input must be a non-empty string', { status: 400 });
  }

  if (!(format in FORMAT_PREFIXES)) {
    return new Response(`format must be one of: ${Object.keys(FORMAT_PREFIXES).join(', ')}`, { status: 400 });
  }

  const anthropic = new Anthropic();

  let message: Awaited<ReturnType<typeof anthropic.messages.create>>;

  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${FORMAT_PREFIXES[format]}\n\n${input}`,
        },
      ],
    });
  } catch {
    return new Response('Upstream API error', { status: 502 });
  }

  const text =
    message.content[0]?.type === 'text' ? message.content[0].text : '';

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
