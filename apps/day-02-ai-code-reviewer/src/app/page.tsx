"use client";

import { useState } from "react";
import InputPanel from "@/components/InputPanel";
import OutputPanel from "@/components/OutputPanel";
import { useCodeReview } from "@/hooks/useCodeReview";

/**
 * Root page for the AI Code Reviewer.
 *
 * Owns only the three form fields (`code`, `language`, `focus`) and delegates
 * all review lifecycle logic to `useCodeReview`. The page is responsible for
 * wiring form state to the hook and passing the combined result down to the
 * two presentational panels.
 */
export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Auto");
  const [focus, setFocus] = useState("General review");

  const reviewer = useCodeReview();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    reviewer.clearDetectedLanguage();
  };

  const handleClear = () => {
    setCode("");
    reviewer.reset();
  };

  const handleCopy = () => {
    if (reviewer.review) navigator.clipboard.writeText(reviewer.review);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-slate-900">
            AI Code Reviewer
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Paste your code and get an instant review
          </p>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            <InputPanel
              code={code}
              language={language}
              focus={focus}
              isStreaming={reviewer.isStreaming}
              detectedLanguage={reviewer.detectedLanguage}
              onCodeChange={setCode}
              onLanguageChange={handleLanguageChange}
              onFocusChange={setFocus}
              onSubmit={() => reviewer.submit(code, language, focus)}
              onStop={reviewer.stop}
              onClear={handleClear}
            />
            <OutputPanel
              focus={focus}
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
    </div>
  );
}
