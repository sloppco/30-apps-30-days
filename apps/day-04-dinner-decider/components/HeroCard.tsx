interface HeroCardProps {
  isDemo?: boolean;
}

export function HeroCard({ isDemo }: HeroCardProps) {
  return (
    <div
      style={{
        background: "#2D8B4E",
        borderRadius: 20,
        padding: "1.5rem",
        color: "#ffffff",
        marginBottom: "1.5rem",
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: "0.5rem" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          Tonight&apos;s dinner
        </p>
        {isDemo && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              background: "rgba(255,255,255,0.18)",
              borderRadius: 20,
              padding: "0.2rem 0.6rem",
              opacity: 0.9,
            }}
          >
            Demo mode
          </span>
        )}
      </div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.4rem" }}>
        Dinner Decider
      </h1>
      <p style={{ fontSize: "0.95rem", opacity: 0.85, lineHeight: 1.5 }}>
        Tell us a bit about your evening and we&apos;ll find the perfect meal for
        tonight.
      </p>
    </div>
  );
}
