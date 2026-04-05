# API Docs Generator — Design Spec
**Date:** 2026-04-05
**App:** Day 06 — `apps/day-06-api-docs-generator`

---

## Overview

A two-panel tool that takes pasted API code or specs and generates clean, structured, Stripe-style rendered documentation. The user pastes input, selects a format, clicks Generate, and sees fully rendered docs appear in the main panel.

No streaming — the API returns the full markdown response at once, which is then parsed and rendered via `react-markdown` with custom component overrides.

---

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS v4
- Google Fonts: IBM Plex Sans (400, 500) + IBM Plex Mono (400, 500)
- Accent: `#185FA5` (blue), tint: `#E6F1FB`
- `vercel.json` at app root: `{ "framework": "nextjs" }`
- File layout: day-05 pattern — no `src/` prefix, flat `app/` / `components/` / `hooks/` / `lib/`
- Added dependencies: `react-markdown`, `react-syntax-highlighter`, `@types/react-syntax-highlighter`

---

## File Structure

```
apps/day-06-api-docs-generator/
  app/
    layout.tsx              — IBM Plex Sans + IBM Plex Mono via Google Fonts, metadata
    page.tsx                — two-panel layout shell (sidebar 340px + scrollable main)
    globals.css
    api/generate/route.ts   — POST handler, returns full markdown (text/plain, no streaming)
  components/
    Sidebar.tsx             — textarea, format chips, generate button
    DocHeader.tsx           — API name, base URL, "Copy markdown" button
    SectionLabel.tsx        — uppercase section divider (11px, letter-spacing, border-bottom)
    EndpointBlock.tsx       — single endpoint card (method badge + path + body)
    MethodBadge.tsx         — colour-coded GET/POST/PUT/PATCH/DELETE pill
    ParamTable.tsx          — styled parameter table (alternating rows, mono param names)
    CodeBlock.tsx           — dark syntax-highlighted code block (nightOwl, IBM Plex Mono 12px)
    DocRenderer.tsx         — react-markdown with custom renderers → structured doc view
  hooks/
    useDocGenerator.ts      — all state: input, format, markdown output, loading, copy status
  lib/
    constants.ts            — FORMAT_OPTIONS, demo input (Express routes), mock markdown response
    types.ts                — Format type, GenerateRequest type
  vercel.json
```

---

## Layout

```
[ Sidebar 340px fixed ] [ Main panel — flex-1, overflow-y-auto, bg-gray-50 ]
```

`page.tsx`: `flex h-screen overflow-hidden`. Sidebar: white bg, `border-r border-gray-200`. Main panel scrollable.

**Sidebar contents (top to bottom):**
1. Eyebrow: "Day 06" + title: "API docs generator"
2. Textarea — monospaced, `bg-gray-50`, `border border-gray-200 rounded-lg`, min-height 220px
3. Format selector — three chips: Code / OpenAPI / Plain English
4. "Generate docs →" button — pinned to bottom, full width

**Main panel states:**
- **Empty:** centered placeholder with muted hint text about supported input formats
- **Loading:** spinner + "Generating your docs…" centered
- **Has output:** `DocHeader` (white bar, bottom border) + `DocRenderer` below it

---

## Hook: `useDocGenerator.ts`

```ts
// State
input: string           // textarea value
format: Format          // 'code' | 'openapi' | 'plaintext'
markdown: string        // full markdown string returned by API
isLoading: boolean
error: string | null
hasCopied: boolean      // drives "Copied!" label toggle

// Actions
setInput(value: string): void
setFormat(format: Format): void
generate(): Promise<void>       // POST /api/generate → set markdown
copyMarkdown(): void            // navigator.clipboard + 2s hasCopied reset
reset(): void
```

`generate()` sets `isLoading: true`, clears previous `markdown` and `error`, POSTs `{ input, format }` to `/api/generate`, sets `markdown` on success or `error` on failure, then sets `isLoading: false`.

Demo mode: if `ANTHROPIC_API_KEY` is not set, `input` is pre-filled with the example Express routes on mount and `generate()` returns the mock markdown from `lib/constants.ts` directly (no fetch).

---

## API Route: `POST /api/generate`

**Request:** `{ input: string, format: 'code' | 'openapi' | 'plaintext' }`

**Response:** `text/plain` — full markdown string

**System prompt:**
> You are an expert technical writer generating clean, accurate API documentation. Given the provided API definition, generate structured documentation in the following markdown format. Be precise — infer types, required fields, and auth requirements from the code where possible. Do not invent endpoints or parameters that aren't present.

**User message prefix by format:**
- `code` → "The following is API route code. Extract all endpoints and generate documentation:"
- `openapi` → "The following is an OpenAPI/Swagger specification. Generate documentation:"
- `plaintext` → "The following is a plain English description of an API. Generate documentation:"

**Demo mode:** if `ANTHROPIC_API_KEY` is not set, return mock markdown from `lib/constants.ts` directly.

---

## Output Markdown Format

```markdown
# {API Name}

**Base URL:** `https://api.example.com/v1`

## Overview

| Property | Value |
|----------|-------|
| Authentication | Bearer token |
| Content-Type | application/json |
| Total endpoints | 3 |

## Authentication

{Description of auth mechanism if detectable}

## Endpoints

### GET /users

List all users.

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | integer | No | Page number. Defaults to 1. |

**Example request**
\`\`\`http
GET /users?page=1&limit=20
Authorization: Bearer <token>
\`\`\`

**Example response** `200 OK`
\`\`\`json
{ "data": [], "page": 1, "total": 0 }
\`\`\`

**Error codes**

| Code | Description |
|------|-------------|
| 401 | Unauthorized |

---
{repeat for each endpoint}
```

---

## Rendering: `DocRenderer.tsx`

**Endpoint grouping strategy:** Before passing to `react-markdown`, pre-split the markdown string on `\n### ` boundaries. The content before the first `### ` is rendered normally (title, overview, auth sections). Each `### ` chunk is wrapped in an `<EndpointBlock>` and its content rendered via `react-markdown` with custom overrides. This gives clean card grouping without fighting `react-markdown`'s flat element model.

**Custom `react-markdown` component overrides:**

| Element | Component | Notes |
|---------|-----------|-------|
| `h1` | `null` (suppressed) | DocHeader parses name from raw markdown separately |
| `h2` | `<SectionLabel>` | 11px uppercase, letter-spacing, border-bottom |
| `table` | `<ParamTable>` | Alternating rows, param names in mono |
| fenced `code` | `<CodeBlock>` | nightOwl theme, IBM Plex Mono 12px |
| inline `code` | `<code>` | monospace, muted text |
| `hr` | `<hr>` | Subtle divider between endpoint cards |

**`DocHeader.tsx`** parses the raw markdown string to extract:
- API name: first line matching `/^# (.+)/m`
- Base URL: first line matching `/\*\*Base URL:\*\*\s*`(.+)`/m`

Renders a white bar with bottom border above `DocRenderer`. Includes "Copy markdown" button (top-right) wired to `copyMarkdown()` from the hook.

---

## Component Details

### `MethodBadge.tsx`
```
GET    → bg #EAF3DE  text #27500A
POST   → bg #E6F1FB  text #0C447C
PUT    → bg #FAEEDA  text #633806
PATCH  → bg #FAEEDA  text #633806
DELETE → bg #FCEBEB  text #791F1F
```
`rounded-full px-2.5 py-0.5 text-xs font-500 uppercase tracking-wide`

### `EndpointBlock.tsx`
Receives `heading: string` (e.g. `"GET /users"`) and `children: ReactNode` (the rendered body of that endpoint section). Splits heading on first space to get `method` and `path`. Renders: white card `border border-gray-200 rounded-xl overflow-hidden mb-4`. Header row: `<MethodBadge>` + path in IBM Plex Mono + short description (first paragraph of the body). Body: param tables + code blocks.

### `ParamTable.tsx`
`text-sm`, alternating `bg-gray-50` rows, param names in IBM Plex Mono. Columns: Name / Type / Required / Description.

### `CodeBlock.tsx`
`react-syntax-highlighter` with `nightOwl` theme. Background `#0F1117`, `rounded-lg`, IBM Plex Mono 12px. Language detected from fenced code block info string.

### `SectionLabel.tsx`
`text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-4`

---

## UI Spec

**Sidebar:**
- White bg, `border-r border-gray-200 h-full flex flex-col`
- Textarea: `font-mono bg-gray-50 border border-gray-200 rounded-lg resize-none min-h-[220px]`
- Format chips: `rounded-full px-3 py-1 text-sm`. Active: `bg-[#0C447C] text-[#E6F1FB]`. Inactive: `bg-white border border-gray-200 text-gray-600`
- Generate button: `bg-[#185FA5] text-white rounded-lg w-full py-2.5 font-medium` — disabled + "Generating…" during load

**Main panel:**
- `bg-gray-50 flex-1 overflow-y-auto`
- Doc header: white bar `bg-white border-b border-gray-200 px-6 py-4`
- Content area: `px-6 py-6 max-w-4xl`
- Endpoint blocks: white, `border border-gray-200 rounded-xl overflow-hidden mb-4`
- Code blocks inside endpoint cards: full width, stacked vertically

---

## Types

```ts
// lib/types.ts
export type Format = 'code' | 'openapi' | 'plaintext';

export interface GenerateRequest {
  input: string;
  format: Format;
}
```

---

## Demo Input (Express routes)

```js
app.get('/users', authenticate, async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;
  const users = await User.find({ role }).paginate(page, limit);
  res.json(users);
});

app.post('/users', authenticate, authorize('admin'), async (req, res) => {
  const { name, email, role } = req.body;
  const user = await User.create({ name, email, role });
  res.status(201).json(user);
});

app.delete('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
```
