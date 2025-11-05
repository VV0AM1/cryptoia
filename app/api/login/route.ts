import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Otp } from '@/models/Otp';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const OTP_TEMP_SECRET = process.env.OTP_TEMP_SECRET || 'temp_secret';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ message: 'Please verify your email first' }, { status: 403 });
    }

    if (!user.password) {
    return NextResponse.json({ message: 'User password missing' }, { status: 500 });
    }

    const isMatch = await bcrypt.compare(password, user.password);    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tempToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '10m' });

    await Otp.findOneAndUpdate(
    { email },
    {
        code: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        tempToken,
        attempts: 0,
    },
    { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Your Cryptoia OTP Code',
      html: `
        <div style="font-family:sans-serif;background:#0f0f0f;color:#fff;padding:20px;border-radius:10px;">
          <img src="${process.env.APP_LOGO_URL}" alt="${process.env.APP_NAME}" style="height:50px;margin-bottom:20px;" />
          <h2 style="color:#00bcd4;">Your OTP Code</h2>
          <p>Use the following code to complete your login:</p>
          <h1 style="letter-spacing:5px;color:#00e676;">${otpCode}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'OTP sent to your email', tempToken },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
