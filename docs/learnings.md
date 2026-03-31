## Week 1

### Day 1 — 30 March 2026

**App:** App Tracker — day01.slopp.co

**What I learned about AI-assisted coding:**

AI and Claude Code are not perfect. They make mistakes, and the quality
of the output depends heavily on whether you know what to look for. It's
dangerously easy to remove yourself from the process — to watch code
appear and assume it's good, when it may have subtle flaws that only
experience can catch.

That said, AI is genuinely excellent at one thing: getting a first draft
out fast. It lets you think at the level of outcomes rather than
implementation details. Instead of getting bogged down in how to build
something, you can stay focused on what you're building and why. The MVP
appears quickly, and from there you can iterate and refine with clarity.

The right mental model: AI handles the first draft, you handle the
judgment. Your job shifts from writing code to reviewing it — which
requires knowing your craft, not abandoning it.

### Day 2 — 31 March 2026

**App:** AI Code Reviewer — day02.slopp.co

**What I learned about AI-assisted coding:**

Claude Code scaffolded the app quickly from the brief, but small mistakes
crept in — a version mismatch with Next.js, a stray closing tag that broke
the build. Neither was a big deal; both were caught and fixed quickly. The
pattern is consistent: the agent moves fast and mostly gets things right,
but you need to stay in the loop.

The session went well beyond the initial brief. Iterating on top of a
working first pass felt natural — sticky panels, a richer summary UI, a
refactor into components and hooks, and finally a demo/simulation mode for
safe public deployment. Each iteration was a single focused prompt, and the
agent handled the context from previous steps without needing to be
re-briefed.

The standout moment was the demo mode. One prompt produced a looping
simulation with an animated cursor, typewriter code input, and streamed
mock output — rough around the edges but genuinely impressive for a single
shot. That kind of feature would have taken real time to spec and build
manually.

The emerging pattern: AI is strongest when you give it a clear, bounded
task and weakest when the scope is vague. The more precisely you can
describe what you want — and the more you understand the codebase it's
working in — the better the output.
