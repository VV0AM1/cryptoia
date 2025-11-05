import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { VerifyToken } from '@/models/VerifyToken';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Token missing' }, { status: 400 });
    }

    const doc = await VerifyToken.findOne({ token });
    if (!doc) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    if (doc.expiresAt.getTime() < Date.now()) {
      await VerifyToken.deleteOne({ _id: doc._id });
      return NextResponse.json({ message: 'Token expired' }, { status: 400 });
    }

    const isAdmin = (doc.email.toLowerCase() === 'serleb2000@gmail.com');

    const user = await User.create({
      name: doc.name,
      email: doc.email,
      password: doc.passwordHash,
      provider: 'credentials',
      isVerified: true,
      role: isAdmin ? 'admin' : 'user',
    });

    await VerifyToken.deleteOne({ _id: doc._id });

    const redirectTo = process.env.NEXT_PUBLIC_APP_URL + '/auth/verified?email=' + encodeURIComponent(user.email);
    return NextResponse.redirect(redirectTo);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}