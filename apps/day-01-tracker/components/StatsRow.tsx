type StatsRowProps = {
  shipped: number;
  remaining: number;
  complete: number;
  avgTime: string;
  streak: number;
};

const metrics = [
  {
    key: "shipped",
    label: "Shipped",
    value: (data: StatsRowProps) => data.shipped,
  },
  {
    key: "remaining",
    label: "Remaining",
    value: (data: StatsRowProps) => data.remaining,
  },
  {
    key: "complete",
    label: "Complete",
    value: (data: StatsRowProps) => `${data.complete}%`,
  },
  {
    key: "avgTime",
    label: "Avg time",
    value: (data: StatsRowProps) => (data.avgTime === "—" ? "—" : data.avgTime),
  },
  {
    key: "streak",
    label: "Streak",
    value: (data: StatsRowProps) => data.streak,
  },
];

export default function StatsRow(data: StatsRowProps) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.key} className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {metric.label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {metric.value(data)}
          </p>
        </div>
      ))}
    </section>
  );
}
