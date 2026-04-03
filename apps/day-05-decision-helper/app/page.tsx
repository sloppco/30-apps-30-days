import HomeClient from '@/app/HomeClient'

interface PageProps {
  searchParams: Promise<{ demo?: string }>
}

/**
 * Server component shell for Decision Helper.
 *
 * Rules:
 *  - Production (NODE_ENV === "production") → always demo mode, real API is never called.
 *  - Development → demo mode only when ?demo=true is in the URL.
 *  - Demo mode also activates when ANTHROPIC_API_KEY is absent.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const isDemo =
    process.env.NODE_ENV === 'production' ||
    params.demo === 'true' ||
    !process.env.ANTHROPIC_API_KEY

  return <HomeClient isDemo={isDemo} />
}
