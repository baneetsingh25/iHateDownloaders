import { redirect } from 'next/navigation';

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const url = searchParams?.url;
  if (url && typeof url === 'string') {
    redirect(`/youtube?url=${encodeURIComponent(url)}`);
  }
  redirect('/youtube');
}

