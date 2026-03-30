import { App } from "../lib/types";

type DayCardProps = {
  app: App;
  isToday: boolean;
  isSelected: boolean;
  onSelect: (day: number) => void;
};

const statusStyles = {
  shipped: "bg-[#E1F5EE] border-[#9FE1CB] text-[#085041]",
  inProgress: "bg-[#FEF7E5] border-[#F5B950] text-[#7A5F2B]",
  today: "bg-white border-[#AFA9EC] border-[1.5px] text-[#3C3489]",
  upcoming: "bg-white border border-gray-300 text-gray-500 opacity-40",
};

export default function DayCard({
  app,
  isToday,
  isSelected,
  onSelect,
}: DayCardProps) {
  const isShipped = app.status === "shipped";
  const isInProgress = app.status === "in-progress";
  const isActive = isShipped || isToday || isInProgress;
  const styleKey = isShipped
    ? "shipped"
    : isToday
      ? "today"
      : isInProgress
        ? "inProgress"
        : "upcoming";

  return (
    <button
      type="button"
      onClick={() => {
        if (isActive) onSelect(app.day);
      }}
      disabled={!isActive}
      className={`text-left rounded-xl border p-3 shadow-sm transition-all disabled:cursor-default ${statusStyles[styleKey]} ${isSelected ? "ring-2 ring-[#1D9E75]" : ""} ${!isActive ? "pointer-events-none" : "hover:scale-[1.01]"} `}
    >
      <div className="flex justify-between items-start">
        <span className="text-xl font-bold">Day {app.day}</span>
        <span
          className={`h-3 w-3 rounded-full mt-1 ${
            isShipped
              ? "bg-[#0F8752]"
              : isToday
                ? "bg-[#7F77DD]"
                : isInProgress
                  ? "bg-[#F5A623]"
                  : "bg-gray-400"
          }`}
        />
      </div>
      {(isShipped || isInProgress) && (
        <>
          <p
            className={`mt-2 text-sm font-semibold ${
              isShipped ? "text-[#085041]" : "text-[#7A5F2B]"
            }`}
          >
            {app.name}
          </p>
          <p
            className={`mt-1 text-xs ${
              isShipped
                ? "text-[#085041] opacity-90"
                : "text-[#7A5F2B] opacity-90"
            }`}
          >
            {app.stack}
          </p>
        </>
      )}
      {isToday && !isShipped && !isInProgress && (
        <p className="mt-2 text-sm text-gray-600">Today</p>
      )}
      {!isShipped && !isToday && !isInProgress && (
        <p className="mt-2 text-sm text-gray-500">Upcoming</p>
      )}
    </button>
  );
}
