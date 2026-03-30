"use client";

import { useMemo, useState } from "react";
import { apps, CHALLENGE_START } from "../lib/apps";
import { getAvgTime, getCurrentDay, getStreak } from "../lib/utils";
import StatsRow from "../components/StatsRow";
import DayGrid from "../components/DayGrid";

export default function HomePage() {
  const currentDay = getCurrentDay(CHALLENGE_START);

  const shippedCount = apps.filter((app) => app.status === "shipped").length;
  const remaining = 30 - shippedCount;
  const complete = Math.round((shippedCount / 30) * 100);
  const avgTime = getAvgTime(apps);
  const streak = getStreak(apps);

  const defaultDay = useMemo(() => {
    const mostRecentShipped = [...apps]
      .reverse()
      .find((app) => app.status === "shipped");
    if (mostRecentShipped) return mostRecentShipped.day;
    return currentDay;
  }, [currentDay]);

  const [selectedDay, setSelectedDay] = useState<number | null>(defaultDay);

  const progressPercent = (shippedCount / 30) * 100;

  const handleSelect = (day: number) => {
    const app = apps.find((item) => item.day === day);
    if (!app) return;
    if (
      app.status === "shipped" ||
      app.status === "in-progress" ||
      day === currentDay
    ) {
      setSelectedDay(selectedDay === day ? null : day);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">30 apps in 30 days</h1>
            <p className="text-sm text-slate-600">Started 30 Mar 2026</p>
          </div>
          <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            Streak: {streak}
          </div>
        </header>

        <StatsRow
          shipped={shippedCount}
          remaining={remaining}
          complete={complete}
          avgTime={avgTime}
          streak={streak}
        />

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              Day {shippedCount} of 30
            </p>
            <p className="text-xs text-slate-500">
              {Math.round(progressPercent)}%
            </p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-[#1D9E75]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        <section className="mt-6">
          <DayGrid
            apps={apps}
            currentDay={currentDay}
            selectedDay={selectedDay}
            onSelect={handleSelect}
          />
        </section>
      </div>
    </main>
  );
}
