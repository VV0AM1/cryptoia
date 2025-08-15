import WatchlistPage from '@/components/WatchlistPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies, headers as nextHeaders } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const h = await nextHeaders();
  const c = await cookies();

  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host =
    h.get('host') ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    'localhost:3000';

  const base =
    process.env.NEXTAUTH_URL ??
    `${proto}://${host}`;

  const res = await fetch(`${base}/api/watchlist/full`, {
    headers: { cookie: c.toString() },
    cache: 'no-store',
  });

  const json = res.ok ? await res.json() : { assets: [] };
  const assets = Array.isArray(json.assets) ? json.assets : [];

  return (
    <div className="w-full min-h-screen bg-zinc-900">
      <WatchlistPage initial={assets} />
    </div>
  );
}