import { App } from "../lib/types";

type DetailPanelProps = {
  app: App;
};

const placeholder = "—";
const GITHUB_BASE = "https://github.com/jonathanredford/30-apps-30-days/";

const displayValue = (value?: string) =>
  value && value.trim().length > 0 ? value : placeholder;

export default function DetailPanel({ app }: DetailPanelProps) {
  const githubUrl = app.githubPath
    ? `${GITHUB_BASE}${app.githubPath}`
    : undefined;

  return (
    <div className="animate-[slideDown_180ms_ease-out]">
      <section className="rounded-xl border-[#AFA9EC] border-[1.5px] bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Day {app.day}: {displayValue(app.name)}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {displayValue(app.description)}
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {app.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Stack</p>
            <p className="font-medium text-gray-800">
              {displayValue(app.stack)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Time to ship</p>
            <p className="font-medium text-gray-800">
              {displayValue(app.timeToShip)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Live URL</p>
            {app.liveUrl ? (
              <a
                href={app.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {app.liveUrl}
              </a>
            ) : (
              <p className="font-medium text-gray-800">{placeholder}</p>
            )}
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">GitHub path</p>
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {app.githubPath}
              </a>
            ) : (
              <p className="font-medium text-gray-800">{placeholder}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700">
            What I learned
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {displayValue(app.learned)}
          </p>
        </div>
      </section>
    </div>
  );
}
