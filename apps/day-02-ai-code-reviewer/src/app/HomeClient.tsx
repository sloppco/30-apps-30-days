"use client";

import { useState } from "react";
import InputPanel from "@/components/InputPanel";
import OutputPanel from "@/components/OutputPanel";
import DemoCursor from "@/components/DemoCursor";
import { useCodeReview } from "@/hooks/useCodeReview";
import { useDemoReview } from "@/hooks/useDemoReview";

interface HomeClientProps {
  /**
   * When true the UI runs in demo mode: all interaction is driven by the
   * simulation and real API calls are never made.
   */
  isDemo: boolean;
}

/**
 * Client-side root for the AI Code Reviewer.
 *
 * Always calls both `useCodeReview` and `useDemoReview` (hooks cannot be
 * called conditionally), but only one is active at a time:
 * - `useCodeReview` is active in development without ?demo=true
 * - `useDemoReview` is active in production or when ?demo=true is set
 *
 * In demo mode:
 * - Form state (code, language, focus) is driven by the simulation hook
 * - All user interaction callbacks are no-ops so the simulation cannot be
 *   interrupted by accidental input
 * - An animated DemoCursor overlay moves between the UI elements
 * - A "Live preview" badge in the header signals that this is a simulation
 */
export default function HomeClient({ isDemo }: HomeClientProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Auto");
  const [focus, setFocus] = useState("General review");

  const realReviewer = useCodeReview();
  const demo = useDemoReview(isDemo);

  // In demo mode, form values are controlled by the simulation.
  const activeCode = isDemo ? demo.code : code;
  const activeLanguage = isDemo ? demo.language : language;
  const activeFocus = isDemo ? demo.focus : focus;
  const reviewer = isDemo ? demo : realReviewer;

  const handleLanguageChange = (lang: string) => {
    if (isDemo) return;
    setLanguage(lang);
    realReviewer.clearDetectedLanguage();
  };

  const handleClear = () => {
    if (isDemo) return;
    setCode("");
    realReviewer.reset();
  };

  const handleCopy = () => {
    if (reviewer.review) navigator.clipboard.writeText(reviewer.review);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              AI Code Reviewer
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Paste your code and get an instant review
            </p>
          </div>
          {isDemo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Live preview
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            <InputPanel
              code={activeCode}
              language={activeLanguage}
              focus={activeFocus}
              isStreaming={reviewer.isStreaming}
              detectedLanguage={reviewer.detectedLanguage}
              readOnly={isDemo}
              onCodeChange={isDemo ? () => {} : setCode}
              onLanguageChange={handleLanguageChange}
              onFocusChange={isDemo ? () => {} : setFocus}
              onSubmit={
                isDemo ? () => {} : () => realReviewer.submit(code, language, focus)
              }
              onStop={isDemo ? () => {} : realReviewer.stop}
              onClear={handleClear}
            />
            <OutputPanel
              focus={activeFocus}
              detectedLanguage={reviewer.detectedLanguage}
              review={reviewer.review}
              isStreaming={reviewer.isStreaming}
              isLoadingStats={reviewer.isLoadingStats}
              summary={reviewer.summary}
              error={reviewer.error}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </main>

      {isDemo && (
        <DemoCursor
          targetSelector={demo.cursorTarget}
          isClicking={demo.isCursorClicking}
        />
      )}
    </div>
  );
}
