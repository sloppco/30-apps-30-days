import { App } from "./types";

export const CHALLENGE_START = "2026-03-30";

export const apps: App[] = [
  {
    day: 1,
    name: "App tracker",
    description:
      "A dashboard to track and publicly showcase this 30-day challenge.",
    stack: "Next.js, Tailwind",
    liveUrl: "https://day01.slopp.co",
    githubPath: "apps/day-01-tracker",
    timeToShip: "",
    learned:
      "AI makes mistakes — you need experience to spot them. Easy to disengage from the process and miss flaws. Best used for getting an MVP out fast while you stay focused on the outcome, then iterate from there.",
    status: "shipped",
  },
  {
    day: 2,
    status: "shipped",
    name: "AI Code Reviewer",
    description:
      "Paste any code snippet and get a streaming AI review with a structured summary, language auto-detection, and a production demo mode.",
    stack: "Next.js, Tailwind, Anthropic SDK",
    liveUrl: "https://day02.slopp.co",
    githubPath: "apps/day-02-ai-code-reviewer",
    timeToShip: "",
    buildSummary:
      "Claude Code scaffolded the app quickly from the brief. One version mismatch to note — Next 15 was used instead of 16 because the version wasn't pinned in the prompt (unlike day 01). The agent caught and flagged this itself.",
    improvements: [
      "Made the left panel sticky so the clear/review buttons stay visible regardless of output length",
      "Fixed review text rendering — default was serif, updated to sans-serif",
      "Added a second API call that analyses the review and extracts a structured summary (critical issues, considerations, misc). Displayed as a TL;DR panel above the review output — started with a pill UI but switched to a summary panel which felt much cleaner",
      "Refactored from one large monolithic component into smaller components with JSDoc comments, using day 01 as a reference for structure",
      "Moved logic into a custom React hook — one hook was the right call since all logic centres on a single action (reviewing code); splitting further would have created unnecessary abstraction",
      "Added a demo/simulation mode for production — renders a preview without making any API requests, preventing API key abuse",
    ],
    bugs: [
      "Claude left an extra </div> which broke the app — caught and fixed quickly",
    ],
    reflection:
      "Extended the app's functionality well beyond the initial brief. Claude Code made mistakes but self-corrected quickly. Standout moment was adding the demo/simulation mode with a single prompt — rough around the edges but impressive for one shot.",
  },
  { day: 3, status: "upcoming" },
  { day: 4, status: "upcoming" },
  { day: 5, status: "upcoming" },
  { day: 6, status: "upcoming" },
  { day: 7, status: "upcoming" },
  { day: 8, status: "upcoming" },
  { day: 9, status: "upcoming" },
  { day: 10, status: "upcoming" },
  { day: 11, status: "upcoming" },
  { day: 12, status: "upcoming" },
  { day: 13, status: "upcoming" },
  { day: 14, status: "upcoming" },
  { day: 15, status: "upcoming" },
  { day: 16, status: "upcoming" },
  { day: 17, status: "upcoming" },
  { day: 18, status: "upcoming" },
  { day: 19, status: "upcoming" },
  { day: 20, status: "upcoming" },
  { day: 21, status: "upcoming" },
  { day: 22, status: "upcoming" },
  { day: 23, status: "upcoming" },
  { day: 24, status: "upcoming" },
  { day: 25, status: "upcoming" },
  { day: 26, status: "upcoming" },
  { day: 27, status: "upcoming" },
  { day: 28, status: "upcoming" },
  { day: 29, status: "upcoming" },
  { day: 30, status: "upcoming" },
];
