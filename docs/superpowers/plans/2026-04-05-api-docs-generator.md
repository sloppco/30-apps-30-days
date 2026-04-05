# API Docs Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-panel Next.js app that takes pasted API code/specs and generates clean, Stripe-style rendered documentation using Claude.

**Architecture:** Server component `page.tsx` detects demo mode and passes `isDemo` to client component `HomeClient.tsx`. `useDocGenerator` hook owns all state and calls `POST /api/generate`, which returns full markdown. `DocRenderer` pre-splits markdown on `### ` boundaries to wrap each endpoint in a card, then renders via `react-markdown` with custom component overrides.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, `@anthropic-ai/sdk`, `react-markdown` v9, `remark-gfm` v4, `react-syntax-highlighter` v15

> **Note on tests:** This project follows the established zero-test pattern of all existing day apps. No test infrastructure is added.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/day-06-api-docs-generator/package.json` | Create | Dependencies and scripts |
| `apps/day-06-api-docs-generator/next.config.ts` | Create | Next.js config |
| `apps/day-06-api-docs-generator/tsconfig.json` | Create | TypeScript config |
| `apps/day-06-api-docs-generator/postcss.config.mjs` | Create | Tailwind v4 PostCSS |
| `apps/day-06-api-docs-generator/vercel.json` | Create | Vercel framework hint |
| `apps/day-06-api-docs-generator/lib/types.ts` | Create | `Format`, `GenerateRequest` types |
| `apps/day-06-api-docs-generator/lib/constants.ts` | Create | `FORMAT_OPTIONS`, `DEMO_INPUT`, `MOCK_MARKDOWN` |
| `apps/day-06-api-docs-generator/app/globals.css` | Create | Tailwind import, font utility classes |
| `apps/day-06-api-docs-generator/app/layout.tsx` | Create | IBM Plex Sans + Mono fonts, metadata |
| `apps/day-06-api-docs-generator/app/api/generate/route.ts` | Create | POST handler → full markdown text |
| `apps/day-06-api-docs-generator/hooks/useDocGenerator.ts` | Create | All state + generate/copy actions |
| `apps/day-06-api-docs-generator/components/MethodBadge.tsx` | Create | Colour-coded HTTP method pill |
| `apps/day-06-api-docs-generator/components/SectionLabel.tsx` | Create | Uppercase section divider |
| `apps/day-06-api-docs-generator/components/CodeBlock.tsx` | Create | Syntax-highlighted code block |
| `apps/day-06-api-docs-generator/components/ParamTable.tsx` | Create | Styled parameter table wrapper |
| `apps/day-06-api-docs-generator/components/EndpointBlock.tsx` | Create | Endpoint card with method badge + body |
| `apps/day-06-api-docs-generator/components/DocHeader.tsx` | Create | API name, base URL, copy button |
| `apps/day-06-api-docs-generator/components/DocRenderer.tsx` | Create | Split markdown → cards via react-markdown |
| `apps/day-06-api-docs-generator/components/Sidebar.tsx` | Create | Input panel (textarea, chips, button) |
| `apps/day-06-api-docs-generator/app/HomeClient.tsx` | Create | Client orchestrator, two-panel layout |
| `apps/day-06-api-docs-generator/app/page.tsx` | Create | Server component, isDemo detection |

---

### Task 1: Scaffold project config files

**Files:**
- Create: `apps/day-06-api-docs-generator/package.json`
- Create: `apps/day-06-api-docs-generator/next.config.ts`
- Create: `apps/day-06-api-docs-generator/tsconfig.json`
- Create: `apps/day-06-api-docs-generator/postcss.config.mjs`
- Create: `apps/day-06-api-docs-generator/vercel.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "day-06-api-docs-generator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.82.0",
    "next": "16.2.2",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-markdown": "^9",
    "remark-gfm": "^4",
    "react-syntax-highlighter": "^15"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/react-syntax-highlighter": "^15",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create postcss.config.mjs**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 5: Create vercel.json**

```json
{ "framework": "nextjs" }
```

- [ ] **Step 6: Install dependencies**

Run from `apps/day-06-api-docs-generator/`:
```bash
npm install
```
Expected: `node_modules` created, no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/day-06-api-docs-generator/package.json apps/day-06-api-docs-generator/package-lock.json apps/day-06-api-docs-generator/next.config.ts apps/day-06-api-docs-generator/tsconfig.json apps/day-06-api-docs-generator/postcss.config.mjs apps/day-06-api-docs-generator/vercel.json
git commit -m "feat(day-06): scaffold project config"
```

---

### Task 2: Types and constants

**Files:**
- Create: `apps/day-06-api-docs-generator/lib/types.ts`
- Create: `apps/day-06-api-docs-generator/lib/constants.ts`

- [ ] **Step 1: Create lib/types.ts**

```ts
export type Format = 'code' | 'openapi' | 'plaintext';

export interface GenerateRequest {
  input: string;
  format: Format;
}
```

- [ ] **Step 2: Create lib/constants.ts**

```ts
import type { Format } from './types';

export const FORMAT_OPTIONS: { id: Format; label: string }[] = [
  { id: 'code', label: 'Code' },
  { id: 'openapi', label: 'OpenAPI' },
  { id: 'plaintext', label: 'Plain English' },
];

export const DEMO_INPUT = `// Express routes
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
});`;

export const MOCK_MARKDOWN = `# Users API

**Base URL:** \`https://api.example.com/v1\`

## Overview

| Property | Value |
|----------|-------|
| Authentication | Bearer token |
| Content-Type | application/json |
| Total endpoints | 3 |

## Authentication

All endpoints require a valid Bearer token in the \`Authorization\` header. Tokens are obtained via your dashboard or OAuth flow. Admin-only endpoints additionally require the requesting user to have the \`admin\` role.

## Endpoints

### GET /users

List all users with optional filtering and pagination.

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | integer | No | Page number. Defaults to 1. |
| limit | integer | No | Results per page. Defaults to 20. |
| role | string | No | Filter by role (e.g. \`admin\`, \`user\`). |

**Example request**
\`\`\`http
GET /users?page=1&limit=20&role=admin
Authorization: Bearer <token>
\`\`\`

**Example response** \`200 OK\`
\`\`\`json
{
  "data": [
    { "id": "u_123", "name": "Alice", "email": "alice@example.com", "role": "admin" }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
\`\`\`

**Error codes**

| Code | Description |
|------|-------------|
| 401 | Unauthorized — missing or invalid token |
| 403 | Insufficient permissions |

---

### POST /users

Create a new user. Requires admin role.

**Body parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Full name of the user. |
| email | string | Yes | Email address. Must be unique. |
| role | string | No | User role. Defaults to \`user\`. |

**Example request**
\`\`\`http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Bob", "email": "bob@example.com", "role": "user" }
\`\`\`

**Example response** \`201 Created\`
\`\`\`json
{ "id": "u_456", "name": "Bob", "email": "bob@example.com", "role": "user" }
\`\`\`

**Error codes**

| Code | Description |
|------|-------------|
| 400 | Bad request — missing required fields |
| 401 | Unauthorized |
| 403 | Insufficient permissions — admin role required |
| 409 | Conflict — email already exists |

---

### DELETE /users/:id

Delete a user by ID. Requires admin role.

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | The user ID. |

**Example request**
\`\`\`http
DELETE /users/u_123
Authorization: Bearer <token>
\`\`\`

**Example response** \`204 No Content\`

**Error codes**

| Code | Description |
|------|-------------|
| 401 | Unauthorized |
| 403 | Insufficient permissions — admin role required |
| 404 | User not found |
`;
```

- [ ] **Step 3: Commit**

```bash
git add apps/day-06-api-docs-generator/lib/
git commit -m "feat(day-06): add types and constants"
```

---

### Task 3: App shell — globals, layout

**Files:**
- Create: `apps/day-06-api-docs-generator/app/globals.css`
- Create: `apps/day-06-api-docs-generator/app/layout.tsx`

- [ ] **Step 1: Create app/globals.css**

```css
@import "tailwindcss";
```

- [ ] **Step 2: Create app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  title: 'API Docs Generator',
  description: 'Generate clean, structured API documentation from code or specs',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}
        style={{ fontFamily: 'var(--font-ibm-plex-sans), sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/day-06-api-docs-generator/app/globals.css apps/day-06-api-docs-generator/app/layout.tsx
git commit -m "feat(day-06): add app shell, fonts, and globals"
```

---

### Task 4: API route

**Files:**
- Create: `apps/day-06-api-docs-generator/app/api/generate/route.ts`

- [ ] **Step 1: Create app/api/generate/route.ts**

```ts
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

  const { input, format } = (await request.json()) as { input: string; format: Format };

  const anthropic = new Anthropic();

  const message = await anthropic.messages.create({
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

  const text =
    message.content[0].type === 'text' ? message.content[0].text : '';

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-06-api-docs-generator/app/api/
git commit -m "feat(day-06): add generate API route"
```

---

### Task 5: useDocGenerator hook

**Files:**
- Create: `apps/day-06-api-docs-generator/hooks/useDocGenerator.ts`

- [ ] **Step 1: Create hooks/useDocGenerator.ts**

```ts
import { useState } from 'react';
import { DEMO_INPUT, MOCK_MARKDOWN } from '@/lib/constants';
import type { Format } from '@/lib/types';

export interface DocGeneratorState {
  input: string;
  format: Format;
  markdown: string;
  isLoading: boolean;
  error: string | null;
  hasCopied: boolean;
}

export interface DocGeneratorActions {
  setInput: (value: string) => void;
  setFormat: (format: Format) => void;
  generate: () => Promise<void>;
  copyMarkdown: () => void;
  reset: () => void;
}

export function useDocGenerator(isDemo: boolean): DocGeneratorState & DocGeneratorActions {
  const [input, setInput] = useState(isDemo ? DEMO_INPUT : '');
  const [format, setFormat] = useState<Format>('code');
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setMarkdown('');
    setError(null);

    if (isDemo) {
      // Simulate a brief loading state so the UI transition is visible
      await new Promise((resolve) => setTimeout(resolve, 600));
      setMarkdown(MOCK_MARKDOWN);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, format }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const text = await response.text();
      setMarkdown(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyMarkdown = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const reset = () => {
    setMarkdown('');
    setError(null);
    setHasCopied(false);
  };

  return {
    input,
    format,
    markdown,
    isLoading,
    error,
    hasCopied,
    setInput,
    setFormat,
    generate,
    copyMarkdown,
    reset,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-06-api-docs-generator/hooks/
git commit -m "feat(day-06): add useDocGenerator hook"
```

---

### Task 6: MethodBadge and SectionLabel

**Files:**
- Create: `apps/day-06-api-docs-generator/components/MethodBadge.tsx`
- Create: `apps/day-06-api-docs-generator/components/SectionLabel.tsx`

- [ ] **Step 1: Create components/MethodBadge.tsx**

```tsx
const METHOD_STYLES: Record<string, { bg: string; color: string }> = {
  GET:    { bg: '#EAF3DE', color: '#27500A' },
  POST:   { bg: '#E6F1FB', color: '#0C447C' },
  PUT:    { bg: '#FAEEDA', color: '#633806' },
  PATCH:  { bg: '#FAEEDA', color: '#633806' },
  DELETE: { bg: '#FCEBEB', color: '#791F1F' },
};

const DEFAULT_STYLE = { bg: '#F3F4F6', color: '#374151' };

interface MethodBadgeProps {
  method: string;
}

export default function MethodBadge({ method }: MethodBadgeProps) {
  const upper = method.toUpperCase();
  const { bg, color } = METHOD_STYLES[upper] ?? DEFAULT_STYLE;

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide"
      style={{ backgroundColor: bg, color }}
    >
      {upper}
    </span>
  );
}
```

- [ ] **Step 2: Create components/SectionLabel.tsx**

```tsx
interface SectionLabelProps {
  children: React.ReactNode;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-4 mt-6">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/day-06-api-docs-generator/components/MethodBadge.tsx apps/day-06-api-docs-generator/components/SectionLabel.tsx
git commit -m "feat(day-06): add MethodBadge and SectionLabel components"
```

---

### Task 7: CodeBlock

**Files:**
- Create: `apps/day-06-api-docs-generator/components/CodeBlock.tsx`

- [ ] **Step 1: Create components/CodeBlock.tsx**

```tsx
'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  children: string;
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
  return (
    <div className="rounded-lg overflow-hidden mb-4" style={{ background: '#0F1117' }}>
      <SyntaxHighlighter
        language={language === 'http' ? 'bash' : language}
        style={nightOwl}
        customStyle={{
          margin: 0,
          padding: '16px',
          background: '#0F1117',
          fontSize: '12px',
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          lineHeight: '1.6',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-06-api-docs-generator/components/CodeBlock.tsx
git commit -m "feat(day-06): add CodeBlock component"
```

---

### Task 8: ParamTable

**Files:**
- Create: `apps/day-06-api-docs-generator/components/ParamTable.tsx`

- [ ] **Step 1: Create components/ParamTable.tsx**

```tsx
interface ParamTableProps {
  children: React.ReactNode;
}

export default function ParamTable({ children }: ParamTableProps) {
  return (
    <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200">
      <table className="w-full text-sm border-collapse [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:text-gray-600 [&_th]:border-b [&_th]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-700 [&_td]:border-t [&_td]:border-gray-100 [&_tr:first-child_td]:border-0 [&_td:first-child]:font-mono [&_td:first-child]:text-xs [&_td:first-child]:text-gray-900">
        {children}
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-06-api-docs-generator/components/ParamTable.tsx
git commit -m "feat(day-06): add ParamTable component"
```

---

### Task 9: EndpointBlock

**Files:**
- Create: `apps/day-06-api-docs-generator/components/EndpointBlock.tsx`

- [ ] **Step 1: Create components/EndpointBlock.tsx**

```tsx
import MethodBadge from './MethodBadge';

interface EndpointBlockProps {
  method: string;
  path: string;
  children: React.ReactNode;
}

export default function EndpointBlock({ method, path, children }: EndpointBlockProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <MethodBadge method={method} />
        <code
          className="text-sm text-gray-800 font-medium"
          style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
        >
          {path}
        </code>
      </div>
      {/* Body */}
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-06-api-docs-generator/components/EndpointBlock.tsx
git commit -m "feat(day-06): add EndpointBlock component"
```

---

### Task 10: DocHeader

**Files:**
- Create: `apps/day-06-api-docs-generator/components/DocHeader.tsx`

- [ ] **Step 1: Create components/DocHeader.tsx**

```tsx
interface DocHeaderProps {
  markdown: string;
  hasCopied: boolean;
  onCopy: () => void;
}

function parseHeader(markdown: string): { name: string; baseUrl: string } {
  const nameMatch = markdown.match(/^# (.+)/m);
  const urlMatch = markdown.match(/\*\*Base URL:\*\*\s*`([^`]+)`/m);
  return {
    name: nameMatch ? nameMatch[1].trim() : 'API Documentation',
    baseUrl: urlMatch ? urlMatch[1].trim() : '',
  };
}

export default function DocHeader({ markdown, hasCopied, onCopy }: DocHeaderProps) {
  const { name, baseUrl } = parseHeader(markdown);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-[22px] font-medium text-gray-900" style={{ fontFamily: 'var(--font-ibm-plex-sans), sans-serif' }}>
          {name}
        </h1>
        {baseUrl && (
          <p
            className="text-sm text-gray-400 mt-0.5"
            style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
          >
            {baseUrl}
          </p>
        )}
      </div>
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        {hasCopied ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy markdown
          </>
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-06-api-docs-generator/components/DocHeader.tsx
git commit -m "feat(day-06): add DocHeader component"
```

---

### Task 11: DocRenderer

**Files:**
- Create: `apps/day-06-api-docs-generator/components/DocRenderer.tsx`

- [ ] **Step 1: Create components/DocRenderer.tsx**

```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import SectionLabel from './SectionLabel';
import ParamTable from './ParamTable';
import CodeBlock from './CodeBlock';
import EndpointBlock from './EndpointBlock';

interface DocRendererProps {
  markdown: string;
}

const sharedComponents: Components = {
  // h1 suppressed — DocHeader handles the title
  h1: () => null,
  h2: ({ children }) => <SectionLabel>{children}</SectionLabel>,
  table: ({ children }) => <ParamTable>{children}</ParamTable>,
  code({ children, className }) {
    const match = /language-(\w+)/.exec(className || '');
    if (match) {
      return (
        <CodeBlock language={match[1]}>
          {String(children).replace(/\n$/, '')}
        </CodeBlock>
      );
    }
    return (
      <code
        className="text-[13px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-800"
        style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
      >
        {children}
      </code>
    );
  },
  p: ({ children }) => (
    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{children}</p>
  ),
  // Suppress the <pre> wrapper — CodeBlock provides its own container
  pre: ({ children }) => <>{children}</>,
  hr: () => <hr className="border-gray-200 my-6" />,
  strong: ({ children }) => (
    <strong className="font-medium text-gray-900">{children}</strong>
  ),
};

export default function DocRenderer({ markdown }: DocRendererProps) {
  // Split on newline-before-### to group each endpoint into its own card.
  // The preamble (title, overview, auth) is everything before the first ###.
  const [preamble, ...endpointChunks] = markdown.split(/\n(?=### )/);

  return (
    <div>
      {/* Preamble: title (suppressed), overview table, auth description */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={sharedComponents}>
        {preamble}
      </ReactMarkdown>

      {/* Endpoint cards */}
      {endpointChunks.map((chunk, i) => {
        const firstNewline = chunk.indexOf('\n');
        const headingLine =
          firstNewline === -1 ? chunk : chunk.slice(0, firstNewline);
        const body =
          firstNewline === -1 ? '' : chunk.slice(firstNewline + 1).trim();

        // headingLine is "### GET /users" — strip the ### prefix
        const heading = headingLine.replace(/^### /, '').trim();
        const spaceIdx = heading.indexOf(' ');
        const method = spaceIdx === -1 ? heading : heading.slice(0, spaceIdx);
        const path = spaceIdx === -1 ? '' : heading.slice(spaceIdx + 1);

        return (
          <EndpointBlock key={i} method={method} path={path}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={sharedComponents}>
              {body}
            </ReactMarkdown>
          </EndpointBlock>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-06-api-docs-generator/components/DocRenderer.tsx
git commit -m "feat(day-06): add DocRenderer component"
```

---

### Task 12: Sidebar

**Files:**
- Create: `apps/day-06-api-docs-generator/components/Sidebar.tsx`

- [ ] **Step 1: Create components/Sidebar.tsx**

```tsx
import { FORMAT_OPTIONS } from '@/lib/constants';
import type { Format } from '@/lib/types';

interface SidebarProps {
  input: string;
  format: Format;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onFormatChange: (format: Format) => void;
  onGenerate: () => void;
}

export default function Sidebar({
  input,
  format,
  isLoading,
  onInputChange,
  onFormatChange,
  onGenerate,
}: SidebarProps) {
  return (
    <aside
      className="w-[340px] shrink-0 bg-white border-r border-gray-200 h-full flex flex-col"
      style={{ fontFamily: 'var(--font-ibm-plex-sans), sans-serif' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">Day 06</p>
        <h1 className="text-[17px] font-medium text-gray-900">API docs generator</h1>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {/* Textarea */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Paste your API definition
          </label>
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Paste Express routes, OpenAPI YAML, or describe your API in plain English…"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
            style={{
              fontFamily: 'var(--font-ibm-plex-mono), monospace',
              minHeight: '220px',
            }}
          />
        </div>

        {/* Format chips */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Format
          </label>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onFormatChange(opt.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  format === opt.id
                    ? 'bg-[#0C447C] text-[#E6F1FB]'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button — pinned to bottom */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100">
        <button
          onClick={onGenerate}
          disabled={isLoading || !input.trim()}
          className="w-full bg-[#185FA5] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#0C447C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating…' : 'Generate docs →'}
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/day-06-api-docs-generator/components/Sidebar.tsx
git commit -m "feat(day-06): add Sidebar component"
```

---

### Task 13: HomeClient and Page

**Files:**
- Create: `apps/day-06-api-docs-generator/app/HomeClient.tsx`
- Create: `apps/day-06-api-docs-generator/app/page.tsx`

- [ ] **Step 1: Create app/HomeClient.tsx**

```tsx
'use client';

import { useDocGenerator } from '@/hooks/useDocGenerator';
import Sidebar from '@/components/Sidebar';
import DocHeader from '@/components/DocHeader';
import DocRenderer from '@/components/DocRenderer';

interface HomeClientProps {
  isDemo: boolean;
}

export default function HomeClient({ isDemo }: HomeClientProps) {
  const {
    input,
    format,
    markdown,
    isLoading,
    error,
    hasCopied,
    setInput,
    setFormat,
    generate,
    copyMarkdown,
  } = useDocGenerator(isDemo);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        input={input}
        format={format}
        isLoading={isLoading}
        onInputChange={setInput}
        onFormatChange={setFormat}
        onGenerate={generate}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Empty state */}
        {!markdown && !isLoading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-10 h-10 rounded-xl bg-[#E6F1FB] flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#185FA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Paste your API definition</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Supports Express / Fastify routes, OpenAPI YAML/JSON specs, or plain English descriptions.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <svg className="w-5 h-5 text-[#185FA5] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Generating your docs…</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="h-full flex items-center justify-center px-8">
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 max-w-sm text-center">
              <p className="text-sm font-medium text-red-700 mb-1">Generation failed</p>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Doc output */}
        {markdown && !isLoading && (
          <>
            <DocHeader
              markdown={markdown}
              hasCopied={hasCopied}
              onCopy={copyMarkdown}
            />
            <div className="px-6 py-6 max-w-4xl">
              <DocRenderer markdown={markdown} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create app/page.tsx**

```tsx
import HomeClient from '@/app/HomeClient';

interface PageProps {
  searchParams: Promise<{ demo?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const isDemo =
    process.env.NODE_ENV === 'production' ||
    params.demo === 'true' ||
    !process.env.ANTHROPIC_API_KEY;

  return <HomeClient isDemo={isDemo} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/day-06-api-docs-generator/app/HomeClient.tsx apps/day-06-api-docs-generator/app/page.tsx
git commit -m "feat(day-06): wire up HomeClient and page"
```

---

### Task 14: Verify the app runs

- [ ] **Step 1: Start the dev server**

Run from `apps/day-06-api-docs-generator/`:
```bash
npm run dev
```
Expected: `▲ Next.js 16.x.x`, `Local: http://localhost:3000`

- [ ] **Step 2: Verify empty state**

Open `http://localhost:3000`. Expected:
- Sidebar visible with "Day 06 / API docs generator" header
- Textarea pre-filled with Express routes demo input (demo mode active in dev with no API key)
- Three format chips visible, "Code" selected
- "Generate docs →" button at bottom
- Main panel shows the empty-state icon + hint text

- [ ] **Step 3: Verify demo generation**

Click "Generate docs →". Expected:
- Button changes to "Generating…" for ~600ms
- DocHeader appears: "Users API" + base URL
- Three endpoint cards render: GET /users, POST /users, DELETE /users/:id
- Each card has a colour-coded method badge
- Parameter tables render with styled rows
- Code blocks render with dark background (nightOwl theme)
- "Copy markdown" button visible in DocHeader

- [ ] **Step 4: Verify copy**

Click "Copy markdown". Expected:
- Button label changes to "Copied!" with a green checkmark for 2 seconds, then reverts

- [ ] **Step 5: Verify format chips**

Click "OpenAPI" then "Plain English" chips. Expected: active chip turns `bg-[#0C447C] text-[#E6F1FB]`.

- [ ] **Step 6: Run build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`, no TypeScript errors.

- [ ] **Step 7: Final commit**

```bash
git add apps/day-06-api-docs-generator/
git commit -m "feat(day-06): complete API docs generator"
```
