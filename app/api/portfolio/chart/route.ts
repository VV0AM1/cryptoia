import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.email) return new Response(JSON.stringify([]), { status: 401 });

  await connectToDatabase();

  const user = await User.findOne({ email: token.email }).lean();

    const data = user?.transactions?.map((tx) => ({
    date: tx.createdAt?.toISOString?.() || null,
    value: tx.total,
    type: tx.type,
    })) ?? [];

  return new Response(JSON.stringify(data), { status: 200 });
}