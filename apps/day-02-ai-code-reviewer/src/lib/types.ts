/** Severity level returned by the stats API, used to colour the summary card. */
export type Severity = "red" | "yellow" | "green";

/**
 * Structured summary produced by the /api/stats endpoint after a review
 * completes. Contains an overall severity signal, a one-sentence verdict,
 * and a short list of the most important takeaways.
 */
export interface Summary {
  severity: Severity;
  headline: string;
  points: string[];
}
