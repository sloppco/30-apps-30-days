/** Languages available in the language selector. "Auto" triggers inference. */
export const LANGUAGES = [
  "Auto",
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C#",
  "Ruby",
  "Other",
] as const;

/** Review focus options surfaced in the focus selector. */
export const FOCUS_OPTIONS = [
  "General review",
  "Security",
  "Performance",
  "Readability",
  "Bug detection",
] as const;

/**
 * Tailwind class sets for each severity level.
 * Applied to the summary card's container, accent bar, headline, body text,
 * and bullet-point dots.
 */
export const SEVERITY_STYLES = {
  red: {
    panel: "bg-red-50 border-red-200",
    bar: "bg-red-500",
    headline: "text-red-900",
    points: "text-red-800",
    dot: "bg-red-400",
  },
  yellow: {
    panel: "bg-yellow-50 border-yellow-200",
    bar: "bg-yellow-400",
    headline: "text-yellow-900",
    points: "text-yellow-800",
    dot: "bg-yellow-400",
  },
  green: {
    panel: "bg-green-50 border-green-200",
    bar: "bg-green-500",
    headline: "text-green-900",
    points: "text-green-800",
    dot: "bg-green-500",
  },
} as const;
