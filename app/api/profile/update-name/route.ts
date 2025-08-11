import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  await connectToDatabase();
  await User.updateOne({ email: token.email }, { name });

  return NextResponse.json({ message: 'Name updated successfully' });
}