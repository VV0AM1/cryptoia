import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { VerifyToken } from '@/models/VerifyToken';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(password, 10);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await VerifyToken.create({
      email,
      name,
      passwordHash,
      token,
      expiresAt,
    });

    await sendVerificationEmail(email, name, token);

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}