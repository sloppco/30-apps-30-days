import { LANGUAGES, FOCUS_OPTIONS } from "@/lib/constants";

type ReviewToolbarProps = {
  language: string;
  focus: string;
  /** The language inferred by the model when "Auto" is selected. */
  detectedLanguage: string | null;
  onLanguageChange: (lang: string) => void;
  onFocusChange: (focus: string) => void;
  /**
   * When true the selects are rendered as non-interactive. Used in demo mode
   * so that user input cannot interfere with the running simulation.
   */
  readOnly?: boolean;
};

/**
 * Toolbar rendered at the top of the input panel.
 *
 * Houses the Language and Focus selects side by side. When "Auto" is chosen
 * as the language and a detection result is available, a small "Detected: X"
 * label appears beneath the language select so the user knows what the model
 * inferred without cluttering the output panel.
 */
export default function ReviewToolbar({
  language,
  focus,
  detectedLanguage,
  onLanguageChange,
  onFocusChange,
  readOnly = false,
}: ReviewToolbarProps) {
  return (
    <div className="flex gap-3 p-3 border-b border-slate-200 bg-slate-50">
      {/* Language select */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Language
        </label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={readOnly}
          data-demo="language-select"
          className="text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-100 disabled:cursor-default"
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
            <span className="font-medium text-slate-700">{detectedLanguage}</span>
          </span>
        )}
      </div>

      {/* Focus select */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Focus
        </label>
        <select
          value={focus}
          onChange={(e) => onFocusChange(e.target.value)}
          disabled={readOnly}
          data-demo="focus-select"
          className="text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-100 disabled:cursor-default"
        >
          {FOCUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
