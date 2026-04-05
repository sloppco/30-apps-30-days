import HomeClient from '@/app/HomeClient';

interface PageProps {
  searchParams: Promise<{ demo?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const isDemo =
    process.env.NODE_ENV === 'production' ||
    params.demo === 'true' ||
    !process.env.ANTHROPIC_API_KEY;

  return <HomeClient isDemo={isDemo} />;
}
