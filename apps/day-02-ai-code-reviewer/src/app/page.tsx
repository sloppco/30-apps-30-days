import HomeClient from "@/app/HomeClient";

interface PageProps {
  searchParams: Promise<{ demo?: string }>;
}

/**
 * Server component shell for the AI Code Reviewer page.
 *
 * Derives `isDemo` from the runtime environment and the `?demo` query
 * parameter, then hands it to the client component. Keeping this logic
 * server-side avoids a client-side flash and removes the need for
 * `useSearchParams` + a Suspense boundary in the client tree.
 *
 * Rules:
 *   - Production build (`NODE_ENV === "production"`) → always demo mode,
 *     regardless of query params. The real API is never called.
 *   - Development → demo mode only when `?demo=true` is present in the URL,
 *     otherwise the app behaves normally and hits the real Anthropic API.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const isDemo =
    process.env.NODE_ENV === "production" || params.demo === "true";

  return <HomeClient isDemo={isDemo} />;
}
