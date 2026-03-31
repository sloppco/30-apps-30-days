"use client";

import { useState, useRef } from "react";

const LANGUAGES = [
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
];

const FOCUS_OPTIONS = [
  "General review",
  "Security",
  "Performance",
  "Readability",
  "Bug detection",
];

const SEVERITY_STYLES = {
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
};

interface Summary {
  severity: "red" | "yellow" | "green";
  headline: string;
  points: string[];
}

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [focus, setFocus] = useState("General review");
  const [review, setReview] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const reviewRef = useRef("");
  const headerParsedRef = useRef(false);
  const headerBufferRef = useRef("");

  const handleSubmit = async () => {
    if (!code.trim()) return;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsStreaming(true);
    setReview("");
    setError(null);
    setSummary(null);
    setDetectedLanguage(null);
    reviewRef.current = "";
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

        // Parse the "Language: X\n\n" header emitted when Auto is selected
        if (!headerParsedRef.current) {
          headerBufferRef.current += chunk;
          const separatorIdx = headerBufferRef.current.indexOf("\n\n");
          if (separatorIdx !== -1) {
            const header = headerBufferRef.current.slice(0, separatorIdx);
            const match = header.match(/^Language:\s*(.+)/i);
            if (match) setDetectedLanguage(match[1].trim());
            chunk = headerBufferRef.current.slice(separatorIdx + 2);
            headerParsedRef.current = true;
            headerBufferRef.current = "";
          } else {
            continue;
          }
        }

        reviewRef.current += chunk;
        setReview((prev) => prev + chunk);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // intentional cancel — do nothing
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setIsStreaming(false);
      if (reviewRef.current) {
        setIsLoadingStats(true);
        try {
          const statsRes = await fetch("/api/stats", {
            method: "POST",
            body: JSON.stringify({ review: reviewRef.current, focus }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await statsRes.json();
          setSummary(data);
        } catch {
          // stats are non-critical — fail silently
        } finally {
          setIsLoadingStats(false);
        }
      }
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const handleClear = () => {
    setCode("");
    setReview("");
    setError(null);
    setIsStreaming(false);
    setSummary(null);
    setDetectedLanguage(null);
    reviewRef.current = "";
    headerParsedRef.current = false;
    headerBufferRef.current = "";
    abortControllerRef.current?.abort();
  };

  const handleCopy = () => {
    if (review) {
      navigator.clipboard.writeText(review);
    }
  };

  const severityStyles =
    summary ? SEVERITY_STYLES[summary.severity] ?? SEVERITY_STYLES.yellow : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
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

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Left panel — Input */}
            <div className="flex-1 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden lg:sticky lg:top-6">
              {/* Toolbar */}
              <div className="flex gap-3 p-3 border-b border-slate-200 bg-slate-50">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      setDetectedLanguage(null);
                    }}
                    className="text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  {language === "Auto" && detectedLanguage && (
                    <span className="text-xs text-slate-500">
                      Detected:{" "}
                      <span className="font-medium text-slate-700">
                        {detectedLanguage}
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Focus
                  </label>
                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    className="text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  >
                    {FOCUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Code textarea */}
              <div className="flex-1 p-3">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full h-full font-mono text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-md p-3 resize-y focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder-slate-400"
                  style={{ minHeight: "280px" }}
                />
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={handleClear}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                >
                  Clear
                </button>
                {isStreaming ? (
                  <button
                    onClick={handleStop}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!code.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Review code →
                  </button>
                )}
              </div>
            </div>

            {/* Right panel — Output */}
            <div className="flex-1 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
              {/* Output header */}
              <div className="flex items-center justify-between gap-3 p-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                    {focus}
                  </span>
                  {detectedLanguage && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
                      <span className="opacity-60">detected</span>
                      {detectedLanguage}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!review}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Copy
                </button>
              </div>

              {/* Review output */}
              <div
                className="flex-1 p-4 overflow-y-auto flex flex-col gap-4"
                style={{ minHeight: "280px" }}
              >
                {error ? (
                  <div className="text-red-600 text-sm font-medium">
                    Error: {error}
                  </div>
                ) : review ? (
                  <>
                    {/* Summary panel */}
                    {isLoadingStats && (
                      <div className="border border-slate-200 rounded-lg p-4 animate-pulse">
                        <div className="h-3.5 bg-slate-200 rounded w-2/3 mb-3" />
                        <div className="space-y-2">
                          <div className="h-2.5 bg-slate-100 rounded w-full" />
                          <div className="h-2.5 bg-slate-100 rounded w-5/6" />
                        </div>
                      </div>
                    )}
                    {summary && severityStyles && (
                      <div
                        className={`border rounded-lg overflow-hidden ${severityStyles.panel}`}
                      >
                        <div className={`h-1 ${severityStyles.bar}`} />
                        <div className="p-4">
                          <p className={`text-sm font-semibold leading-snug mb-3 ${severityStyles.headline}`}>
                            {summary.headline}
                          </p>
                          <ul className="space-y-1.5">
                            {summary.points.map((point, i) => (
                              <li
                                key={i}
                                className={`flex items-start gap-2 text-sm ${severityStyles.points}`}
                              >
                                <span
                                  className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${severityStyles.dot}`}
                                />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Full review text */}
                    <div
                      className="text-sm text-slate-800 whitespace-pre-wrap"
                      style={{ lineHeight: "1.7" }}
                    >
                      {review}
                      {isStreaming && (
                        <span className="cursor-blink inline-block w-0.5 h-4 bg-slate-800 ml-0.5 align-middle" />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400 text-sm">
                      Your review will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
