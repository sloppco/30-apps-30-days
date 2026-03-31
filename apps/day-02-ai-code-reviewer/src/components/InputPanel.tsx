import ReviewToolbar from "@/components/ReviewToolbar";

type InputPanelProps = {
  code: string;
  language: string;
  focus: string;
  isStreaming: boolean;
  /** The language inferred by the model when "Auto" is selected. */
  detectedLanguage: string | null;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  onFocusChange: (focus: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  onClear: () => void;
};

/**
 * Left panel of the two-column layout.
 *
 * Contains the language/focus toolbar, a monospaced textarea for pasting code,
 * and an action row with Clear and Submit (or Stop) buttons.
 *
 * The panel is sticky on desktop (`lg:sticky lg:top-6`) so it stays in view
 * while a long review scrolls past it in the right panel.
 */
export default function InputPanel({
  code,
  language,
  focus,
  isStreaming,
  detectedLanguage,
  onCodeChange,
  onLanguageChange,
  onFocusChange,
  onSubmit,
  onStop,
  onClear,
}: InputPanelProps) {
  return (
    <div className="flex-1 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden lg:sticky lg:top-6">
      <ReviewToolbar
        language={language}
        focus={focus}
        detectedLanguage={detectedLanguage}
        onLanguageChange={onLanguageChange}
        onFocusChange={onFocusChange}
      />

      {/* Code textarea */}
      <div className="flex-1 p-3">
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="Paste your code here..."
          className="w-full h-full font-mono text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-md p-3 resize-y focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder-slate-400"
          style={{ minHeight: "280px" }}
        />
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50">
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
        >
          Clear
        </button>
        {isStreaming ? (
          <button
            onClick={onStop}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!code.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Review code →
          </button>
        )}
      </div>
    </div>
  );
}
