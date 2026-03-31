import { Summary } from "@/lib/types";
import { SEVERITY_STYLES } from "@/lib/constants";

type SummaryCardProps = {
  summary: Summary;
};

/**
 * Color-coded summary card rendered above the full review text.
 *
 * A thin accent bar at the top signals severity at a glance (red → critical
 * issues, yellow → warnings/suggestions, green → all clear). Below it, a bold
 * headline gives the one-sentence verdict followed by 2–4 specific bullet
 * points drawn from the review.
 *
 * The card is only rendered once the /api/stats call resolves after streaming
 * completes. While it is loading, the parent renders a skeleton placeholder
 * in its place.
 */
export default function SummaryCard({ summary }: SummaryCardProps) {
  const styles = SEVERITY_STYLES[summary.severity] ?? SEVERITY_STYLES.yellow;

  return (
    <div className={`border rounded-lg overflow-hidden ${styles.panel}`}>
      {/* Severity accent bar */}
      <div className={`h-1 ${styles.bar}`} />

      <div className="p-4">
        <p className={`text-sm font-semibold leading-snug mb-3 ${styles.headline}`}>
          {summary.headline}
        </p>
        <ul className="space-y-1.5">
          {summary.points.map((point, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 text-sm ${styles.points}`}
            >
              <span
                className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${styles.dot}`}
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
