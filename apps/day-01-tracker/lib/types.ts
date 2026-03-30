export type AppStatus = "upcoming" | "in-progress" | "shipped";

export type App = {
  day: number;
  status: AppStatus;
  name?: string;
  description?: string;
  stack?: string;
  liveUrl?: string;
  githubPath?: string;
  timeToShip?: string;
  learned?: string;
};
