import SummaryCard from "@/components/SummaryCard";
import { Summary } from "@/lib/types";

type OutputPanelProps = {
  focus: string;
  /** The language inferred by the model when "Auto" is selected. */
  detectedLanguage: string | null;
  review: string;
  isStreaming: boolean;
  /** True while the /api/stats call is in-flight after streaming completes. */
  isLoadingStats: boolean;
  summary: Summary | null;
  error: string | null;
  onCopy: () => void;
};

/**
 * Right panel of the two-column layout.
 *
 * Renders three distinct states:
 * - Empty state: centred placeholder text before any review has been run.
 * - Streaming / loaded state: the streamed review text with an animated
 *   blinking cursor while streaming is active, preceded by a summary card
 *   (or a skeleton loader while the stats API call is in-flight).
 * - Error state: a red error message if the review request failed.
 *
 * The header row shows the active focus as a pill and, once language detection
 * resolves, a dark "detected <language>" pill alongside it.
 */
export default function OutputPanel({
  focus,
  detectedLanguage,
  review,
  isStreaming,
  isLoadingStats,
  summary,
  error,
  onCopy,
}: OutputPanelProps) {
  return (
    <div className="flex-1 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
      {/* Header row */}
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
          onClick={onCopy}
          disabled={!review}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Copy
        </button>
      </div>

      {/* Body */}
      <div
        className="flex-1 p-4 overflow-y-auto flex flex-col gap-4"
        style={{ minHeight: "280px" }}
      >
        {error ? (
          <div className="text-red-600 text-sm font-medium">Error: {error}</div>
        ) : review ? (
          <>
            {/* Skeleton shown while the stats API call resolves */}
            {isLoadingStats && (
              <div className="border border-slate-200 rounded-lg p-4 animate-pulse">
                <div className="h-3.5 bg-slate-200 rounded w-2/3 mb-3" />
                <div className="space-y-2">
                  <div className="h-2.5 bg-slate-100 rounded w-full" />
                  <div className="h-2.5 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            )}

            {summary && <SummaryCard summary={summary} />}

            {/* Full streamed review text */}
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
            <p className="text-slate-400 text-sm">Your review will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
