import { App } from "./types";

export const getCurrentDay = (startDate: string) => {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
  return Math.min(Math.max(diff, 1), 30);
};

const normalizeTimeToMinutes = (time: string) => {
  if (!time) return null;
  const normalized = time
    .toLowerCase()
    .replace(/minutes?/g, "m")
    .replace(/hrs?/g, "h")
    .replace(/\s+/g, " ")
    .trim();

  let hours = 0;
  let minutes = 0;

  const hMatch = normalized.match(/(\d+)\s*h/);
  const mMatch = normalized.match(/(\d+)\s*m/);

  if (hMatch) {
    hours = Number(hMatch[1]);
  }
  if (mMatch) {
    minutes = Number(mMatch[1]);
  }

  const total = hours * 60 + minutes;
  return Number.isFinite(total) && total > 0 ? total : null;
};

export const formatMinutesAsTime = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export const getAvgTime = (apps: App[]) => {
  const minutes = apps
    .map((app) =>
      app.timeToShip ? normalizeTimeToMinutes(app.timeToShip) : null,
    )
    .filter((value): value is number => value !== null);

  if (minutes.length === 0) return "—";

  const average = Math.round(
    minutes.reduce((sum, value) => sum + value, 0) / minutes.length,
  );
  return formatMinutesAsTime(average);
};

export const getStreak = (apps: App[]) => {
  let streak = 0;
  for (let i = apps.length - 1; i >= 0; i -= 1) {
    if (apps[i].status === "shipped") {
      streak += 1;
    } else {
      if (streak > 0) break;
      // if we are before first shipped, continue until shipped start
      continue;
    }
  }
  return streak;
};
