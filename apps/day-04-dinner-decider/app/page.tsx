import HomeClient from "@/app/HomeClient";

interface PageProps {
  searchParams: Promise<{ demo?: string }>;
}

/**
 * Server component shell for Dinner Decider.
 *
 * Rules:
 *   - Production → always demo mode, real API is never called.
 *   - Development → demo mode only when ?demo=true is present.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const isDemo =
    process.env.NODE_ENV === "production" || params.demo === "true";

  return <HomeClient isDemo={isDemo} />;
}
