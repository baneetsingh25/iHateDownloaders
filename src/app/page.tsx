import { redirect } from 'next/navigation';
import { detectPlatform } from '@/lib/engine';

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const url = searchParams?.url;
  if (url && typeof url === 'string') {
    const platform = detectPlatform(url);
    if (platform === 'instagram') {
      redirect(`/instagram?url=${encodeURIComponent(url)}`);
    }
    redirect(`/youtube?url=${encodeURIComponent(url)}`);
  }
  redirect('/youtube');
}

