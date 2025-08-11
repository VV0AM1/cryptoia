import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: token.email }).lean();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const transactions = (user.transactions || []).map((tx) => ({
    ...tx,
    timestamp: tx.createdAt?.toISOString?.() || null,
    }));
    return new Response(JSON.stringify(transactions), { status: 200 });
  } catch (error) {
    console.error('[Transaction Fetch Error]', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
