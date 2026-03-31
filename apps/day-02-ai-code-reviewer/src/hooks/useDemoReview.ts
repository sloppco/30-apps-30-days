import { useState, useEffect } from "react";
import { Summary } from "@/lib/types";
import {
  DEMO_CODE,
  DEMO_FOCUS,
  DEMO_LANGUAGE,
  DEMO_REVIEW,
  DEMO_SUMMARY,
} from "@/lib/demoData";

export interface DemoReviewState {
  /** Form state driven by the simulation. */
  code: string;
  language: string;
  focus: string;
  /** Review output state — same shape as useCodeReview for easy substitution. */
  review: string;
  isStreaming: boolean;
  isLoadingStats: boolean;
  summary: Summary | null;
  detectedLanguage: null;
  error: null;
  /** CSS attribute selector for the element the demo cursor should target. */
  cursorTarget: string | null;
  /** True during the brief window when the cursor simulates a click. */
  isCursorClicking: boolean;
}

/**
 * Runs an automated looping simulation of the code review flow.
 *
 * Only active when `enabled` is true. Each loop:
 *   1. Moves the cursor to the Language select and sets it to TypeScript
 *   2. Moves the cursor to the Focus select and sets it to Security
 *   3. Moves the cursor to the textarea and types DEMO_CODE character by character
 *   4. Moves to the Submit button, animates a click, and starts "streaming"
 *   5. Reveals DEMO_REVIEW in small chunks to mimic real token output
 *   6. Shows a loading skeleton then resolves DEMO_SUMMARY
 *   7. Pauses, then resets and repeats
 *
 * All side effects are driven by chained setTimeout calls. The cleanup
 * function cancels every pending timeout when the effect re-runs (i.e. when
 * a new loop starts) or when the component unmounts.
 */
export function useDemoReview(enabled: boolean): DemoReviewState {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(DEMO_LANGUAGE);
  const [focus, setFocus] = useState(DEMO_FOCUS);
  const [review, setReview] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [cursorTarget, setCursorTarget] = useState<string | null>(null);
  const [isCursorClicking, setIsCursorClicking] = useState(false);
  // Incrementing this causes the effect to re-run, restarting the loop.
  const [loopCount, setLoopCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    /** Schedules `fn` to run `delay` ms from now and tracks the handle. */
    const at = (delay: number, fn: () => void) => {
      timeouts.push(setTimeout(fn, delay));
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    setCode("");
    setLanguage(DEMO_LANGUAGE);
    setFocus(DEMO_FOCUS);
    setReview("");
    setIsStreaming(false);
    setIsLoadingStats(false);
    setSummary(null);
    setCursorTarget(null);
    setIsCursorClicking(false);

    let t = 900;

    // ── Phase 1: Select language ───────────────────────────────────────────────
    at(t, () => setCursorTarget('[data-demo="language-select"]'));
    t += 700;
    at(t, () => setLanguage(DEMO_LANGUAGE));
    t += 350;

    // ── Phase 2: Select focus ─────────────────────────────────────────────────
    at(t, () => setCursorTarget('[data-demo="focus-select"]'));
    t += 700;
    at(t, () => setFocus(DEMO_FOCUS));
    t += 350;

    // ── Phase 3: Move to textarea ─────────────────────────────────────────────
    at(t, () => setCursorTarget('[data-demo="textarea"]'));
    t += 800;

    // ── Phase 4: Type code ────────────────────────────────────────────────────
    const CHAR_DELAY = 16; // ms between keystrokes
    DEMO_CODE.split("").forEach((_, i) => {
      at(t + i * CHAR_DELAY, () => setCode(DEMO_CODE.slice(0, i + 1)));
    });
    t += DEMO_CODE.length * CHAR_DELAY;

    // ── Phase 5: Move to submit button ────────────────────────────────────────
    t += 700;
    at(t, () => setCursorTarget('[data-demo="submit-button"]'));
    t += 750;

    // ── Phase 6: Click submit ─────────────────────────────────────────────────
    at(t, () => setIsCursorClicking(true));
    t += 220;
    at(t, () => {
      setIsCursorClicking(false);
      setIsStreaming(true);
      setReview("");
    });
    t += 150;

    // ── Phase 7: Stream review text ───────────────────────────────────────────
    // Reveal in variable-size chunks to mimic real token boundaries.
    const CHUNK = 4;
    const CHUNK_DELAY = 24;
    for (let i = 0; i < DEMO_REVIEW.length; i += CHUNK) {
      const end = i + CHUNK;
      at(t, () => setReview(DEMO_REVIEW.slice(0, end)));
      t += CHUNK_DELAY;
    }

    // ── Phase 8: End streaming ────────────────────────────────────────────────
    at(t, () => {
      setIsStreaming(false);
      setIsLoadingStats(true);
      setCursorTarget(null);
    });
    t += 1800;

    // ── Phase 9: Show summary card ────────────────────────────────────────────
    at(t, () => {
      setSummary(DEMO_SUMMARY);
      setIsLoadingStats(false);
    });
    t += 5500;

    // ── Phase 10: Loop ────────────────────────────────────────────────────────
    at(t, () => setLoopCount((c) => c + 1));

    return () => timeouts.forEach(clearTimeout);
  }, [enabled, loopCount]);

  return {
    code,
    language,
    focus,
    review,
    isStreaming,
    isLoadingStats,
    summary,
    detectedLanguage: null,
    error: null,
    cursorTarget,
    isCursorClicking,
  };
}
