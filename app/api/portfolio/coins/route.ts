import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.email) {
    return new Response(JSON.stringify([]), { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: token.email }).lean();

  return new Response(JSON.stringify(user?.coins || []), { status: 200 });
}