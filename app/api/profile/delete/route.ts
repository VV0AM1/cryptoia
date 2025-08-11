import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  await User.deleteOne({ email: token.email });

  return NextResponse.json({ message: 'Account deleted successfully' });
}