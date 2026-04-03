"use client";

import { HeroCard } from "@/components/HeroCard";
import { InputForm } from "@/components/InputForm";
import { LoadingView } from "@/components/LoadingView";
import { ResultsView } from "@/components/ResultsView";
import { DemoCursor } from "@/components/DemoCursor";
import { useDinnerForm } from "@/hooks/useDinnerForm";
import { useDinnerResults } from "@/hooks/useDinnerResults";
import { useDemoDecider } from "@/hooks/useDemoDecider";

interface HomeClientProps {
  /**
   * When true the UI runs in demo mode: the simulation drives all state
   * and the real API is never called.
   */
  isDemo: boolean;
}

/**
 * Client root for Dinner Decider.
 *
 * Always calls all three hooks (React rules), but only one set is active:
 * - Real hooks (useDinnerForm + useDinnerResults) are used in development.
 * - useDemoDecider drives everything in production / demo mode.
 *
 * In demo mode user interaction callbacks are no-ops so the simulation
 * cannot be interrupted by accidental clicks.
 */
export default function HomeClient({ isDemo }: HomeClientProps) {
  const form = useDinnerForm();
  const results = useDinnerResults();
  const demo = useDemoDecider(isDemo);

  // Active state — demo values override real hooks when isDemo is true.
  const activeForm = isDemo
    ? {
        ...form,
        moods: demo.moods,
        cuisines: demo.cuisines,
        time: demo.time,
        effort: demo.effort,
        fridge: demo.fridge,
        isValid: demo.isValid,
        toggleMood: () => {},
        toggleCuisine: () => {},
        setTime: () => {},
        setEffort: () => {},
        setFridge: () => {},
      }
    : form;

  const isLoading = isDemo ? demo.isLoading : results.isLoading;
  const isSuccess = isDemo ? demo.isSuccess : results.isSuccess;
  const meals = isDemo ? demo.meals : results.meals;

  function handleSubmit() {
    if (isDemo) return;
    results.fetchMeals(form.formState);
  }

  function handleStartOver() {
    if (isDemo) return;
    results.reset();
    form.reset();
  }

  function handleRegenerate() {
    if (isDemo) return;
    results.regenerate();
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "2rem 1rem",
        minHeight: "100vh",
      }}
    >
      <HeroCard isDemo={isDemo} />

      {isLoading && <LoadingView />}

      {isSuccess && (
        <ResultsView
          meals={meals}
          onRegenerate={handleRegenerate}
          onStartOver={handleStartOver}
        />
      )}

      {!isLoading && !isSuccess && (
        <InputForm
          form={activeForm}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}

      {isDemo && (
        <DemoCursor
          targetSelector={demo.cursorTarget}
          isClicking={demo.isCursorClicking}
        />
      )}
    </main>
  );
}
