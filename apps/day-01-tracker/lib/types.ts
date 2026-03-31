export type AppStatus = "upcoming" | "in-progress" | "shipped";

export type App = {
  day: number;
  status: AppStatus;
  name?: string;
  description?: string;
  stack?: string;
  liveUrl?: string;
  githubPath?: string;
  timeToShip?: string;
  /** Short narrative of how the build went. */
  buildSummary?: string;
  /** List of improvements made after the initial pass. */
  improvements?: string[];
  /** Bugs hit during development. */
  bugs?: string[];
  /** Closing reflection / what was learned. */
  reflection?: string;
  /** @deprecated Use `reflection` for new entries. Kept for day 01 compat. */
  learned?: string;
};
