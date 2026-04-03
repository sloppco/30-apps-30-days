"use client";

import { useState, useEffect } from "react";
import type { Meal } from "@/lib/types";
import {
  DEMO_MOODS,
  DEMO_CUISINES,
  DEMO_TIME,
  DEMO_EFFORT,
  DEMO_FRIDGE,
  DEMO_MEALS,
} from "@/lib/demoData";

export interface DemoDeciderState {
  /** Form values driven by the simulation. */
  moods: string[];
  cuisines: string[];
  time: string;
  effort: string;
  fridge: string;
  isValid: boolean;
  /** Results state. */
  isLoading: boolean;
  isSuccess: boolean;
  meals: Meal[];
  /** Cursor state. */
  cursorTarget: string | null;
  isCursorClicking: boolean;
}

/**
 * Runs an automated looping simulation of the Dinner Decider flow.
 *
 * Phases per loop:
 *   1. Click two mood tags (Comfort food, Quick & easy)
 *   2. Click a cuisine tag (Italian)
 *   3. Click a time option (30 min)
 *   4. Click an effort option (Couch mode)
 *   5. Move to the fridge textarea and type the ingredients
 *   6. Move to the submit button and click
 *   7. Show a loading state for ~2 s
 *   8. Reveal all three meal cards at once
 *   9. Pause, then reset and repeat
 */
export function useDemoDecider(enabled: boolean): DemoDeciderState {
  const [moods, setMoods] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [effort, setEffort] = useState("");
  const [fridge, setFridge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [cursorTarget, setCursorTarget] = useState<string | null>(null);
  const [isCursorClicking, setIsCursorClicking] = useState(false);
  const [loopCount, setLoopCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const at = (delay: number, fn: () => void) => {
      timeouts.push(setTimeout(fn, delay));
    };

    // ── Reset ────────────────────────────────────────────────────────────────
    setMoods([]);
    setCuisines([]);
    setTime("");
    setEffort("");
    setFridge("");
    setIsLoading(false);
    setIsSuccess(false);
    setMeals([]);
    setCursorTarget(null);
    setIsCursorClicking(false);

    let t = 900;

    // ── Helper: click an element ─────────────────────────────────────────────
    const click = (selector: string, action: () => void) => {
      at(t, () => setCursorTarget(selector));
      t += 750;
      at(t, () => setIsCursorClicking(true));
      t += 220;
      at(t, () => {
        setIsCursorClicking(false);
        action();
      });
      t += 350;
    };

    // ── Phase 1: Mood tags ───────────────────────────────────────────────────
    for (const mood of DEMO_MOODS) {
      click(
        `[data-demo="mood-${mood}"]`,
        () => setMoods((prev) => [...prev, mood])
      );
    }

    // ── Phase 2: Cuisine tag ─────────────────────────────────────────────────
    for (const cuisine of DEMO_CUISINES) {
      click(
        `[data-demo="cuisine-${cuisine}"]`,
        () => setCuisines((prev) => [...prev, cuisine])
      );
    }

    // ── Phase 3: Time option ─────────────────────────────────────────────────
    click(`[data-demo="time-${DEMO_TIME}"]`, () => setTime(DEMO_TIME));

    // ── Phase 4: Effort option ───────────────────────────────────────────────
    click(`[data-demo="effort-${DEMO_EFFORT}"]`, () => setEffort(DEMO_EFFORT));

    // ── Phase 5: Type fridge contents ────────────────────────────────────────
    at(t, () => setCursorTarget('[data-demo="fridge"]'));
    t += 850;

    const CHAR_DELAY = 28;
    DEMO_FRIDGE.split("").forEach((_, i) => {
      at(t + i * CHAR_DELAY, () => setFridge(DEMO_FRIDGE.slice(0, i + 1)));
    });
    t += DEMO_FRIDGE.length * CHAR_DELAY + 600;

    // ── Phase 6: Submit ──────────────────────────────────────────────────────
    at(t, () => setCursorTarget('[data-demo="submit-button"]'));
    t += 750;
    at(t, () => setIsCursorClicking(true));
    t += 220;
    at(t, () => {
      setIsCursorClicking(false);
      setIsLoading(true);
      setCursorTarget(null);
    });
    t += 2400;

    // ── Phase 7: Show results ────────────────────────────────────────────────
    at(t, () => {
      setIsLoading(false);
      setIsSuccess(true);
      setMeals(DEMO_MEALS);
    });
    t += 7000;

    // ── Phase 8: Loop ────────────────────────────────────────────────────────
    at(t, () => setLoopCount((c) => c + 1));

    return () => timeouts.forEach(clearTimeout);
  }, [enabled, loopCount]);

  const isValid = moods.length > 0 || cuisines.length > 0 || time !== "" || effort !== "";

  return {
    moods,
    cuisines,
    time,
    effort,
    fridge,
    isValid,
    isLoading,
    isSuccess,
    meals,
    cursorTarget,
    isCursorClicking,
  };
}
