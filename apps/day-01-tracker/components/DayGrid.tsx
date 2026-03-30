import { App } from "../lib/types";
import DayCard from "./DayCard";
import DetailPanel from "./DetailPanel";

type DayGridProps = {
  apps: App[];
  currentDay: number;
  selectedDay: number | null;
  onSelect: (day: number) => void;
};

const chunk = (arr: App[], size: number) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default function DayGrid({
  apps,
  currentDay,
  selectedDay,
  onSelect,
}: DayGridProps) {
  const rows = chunk(apps, 5);
  const selectedApp = selectedDay
    ? apps.find((app) => app.day === selectedDay)
    : null;

  return (
    <section className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-3 gap-3 md:grid-cols-5">
          {row.map((app) => {
            const isToday = app.day === currentDay;
            return (
              <DayCard
                key={app.day}
                app={app}
                isToday={isToday}
                isSelected={selectedDay === app.day}
                onSelect={onSelect}
              />
            );
          })}

          {selectedApp && row.some((app) => app.day === selectedDay) && (
            <div className="col-span-full">
              <DetailPanel app={selectedApp} />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
