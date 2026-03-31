import { useState, useRef } from "react";
import { Summary } from "@/lib/types";

export interface CodeReviewState {
  review: string;
  isStreaming: boolean;
  error: string | null;
  summary: Summary | null;
  isLoadingStats: boolean;
  detectedLanguage: string | null;
}

export interface CodeReviewActions {
  /**
   * Starts a streaming review request for the given code, language, and focus.
   * When language is "Auto", the model's prefixed "Language: X\n\n" header is
   * consumed transparently and surfaced via `detectedLanguage`.
   */
  submit: (code: string, language: string, focus: string) => Promise<void>;
  /** Aborts the in-flight streaming request. */
  stop: () => void;
  /** Resets all review output state back to its initial empty values. */
  reset: () => void;
  /**
   * Clears only the detected language. Called by the page when the user
   * manually changes the language select away from "Auto" so the stale
   * detection badge doesn't persist.
   */
  clearDetectedLanguage: () => void;
}

/**
 * Manages the full lifecycle of a code review request.
 *
 * Encapsulates:
 * - Streaming fetch to `/api/review` with chunk-by-chunk state updates
 * - Auto-detect header parsing (`Language: X\n\n`) for when language is "Auto"
 * - Sequential stats fetch to `/api/stats` once streaming completes
 * - AbortController wiring for the Stop button
 *
 * Form state (`code`, `language`, `focus`) is intentionally owned by the
 * calling component and passed into `submit()` as arguments. This keeps the
 * hook focused on review output concerns and leaves the form free to update
 * independently without re-running effects.
 */
export function useCodeReview(): CodeReviewState & CodeReviewActions {
  const [review, setReview] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  // Accumulates the full review text without causing re-renders so the
  // post-stream stats call always receives the complete text.
  const reviewRef = useRef("");
  // Tracks whether the "Language: X\n\n" auto-detect header has been consumed.
  const headerParsedRef = useRef(false);
  // Buffers incoming chunks until the "\n\n" header separator is found.
  const headerBufferRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const submit = async (code: string, language: string, focus: string) => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsStreaming(true);
    setReview("");
    setError(null);
    setSummary(null);
    setDetectedLanguage(null);
    reviewRef.current = "";
    // If a specific language is selected the stream has no header to strip.
    headerParsedRef.current = language !== "Auto";
    headerBufferRef.current = "";

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        body: JSON.stringify({ code, language, focus }),
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder("utf-8", { fatal: false });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        let chunk = decoder.decode(value, { stream: true });

        // Strip the "Language: X\n\n" prefix emitted when Auto is selected,
        // extract the detected language, then pass the rest through as normal.
        if (!headerParsedRef.current) {
          headerBufferRef.current += chunk;
          const separatorIdx = headerBufferRef.current.indexOf("\n\n");
          if (separatorIdx === -1) continue;

          const header = headerBufferRef.current.slice(0, separatorIdx);
          const match = header.match(/^Language:\s*(.+)/i);
          if (match) setDetectedLanguage(match[1].trim());

          chunk = headerBufferRef.current.slice(separatorIdx + 2);
          headerParsedRef.current = true;
          headerBufferRef.current = "";
        }

        reviewRef.current += chunk;
        setReview((prev) => prev + chunk);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // Intentional cancel via the Stop button — no error to surface.
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setIsStreaming(false);

      // Fetch the structured summary once we have the complete review text.
      // Stats are non-critical — failure is swallowed silently.
      if (reviewRef.current) {
        setIsLoadingStats(true);
        try {
          const res = await fetch("/api/stats", {
            method: "POST",
            body: JSON.stringify({ review: reviewRef.current, focus }),
            headers: { "Content-Type": "application/json" },
          });
          setSummary(await res.json());
        } catch {
          // Intentionally empty — stats enhance the UI but are not required.
        } finally {
          setIsLoadingStats(false);
        }
      }
    }
  };

  const stop = () => {
    abortControllerRef.current?.abort();
  };

  const reset = () => {
    abortControllerRef.current?.abort();
    setReview("");
    setError(null);
    setIsStreaming(false);
    setSummary(null);
    setDetectedLanguage(null);
    reviewRef.current = "";
    headerParsedRef.current = false;
    headerBufferRef.current = "";
  };

  const clearDetectedLanguage = () => setDetectedLanguage(null);

  return {
    review,
    isStreaming,
    error,
    summary,
    isLoadingStats,
    detectedLanguage,
    submit,
    stop,
    reset,
    clearDetectedLanguage,
  };
}
