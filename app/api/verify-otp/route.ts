import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import { User, IUser } from '@/models/User';
import { Otp } from '@/models/Otp';

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const JWT_EXPIRES_IN = '7d';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, code, tempToken } = await req.json();

    if (!email || !code || !tempToken)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) return NextResponse.json({ message: "No OTP requested" }, { status: 400 });

    if (otpDoc.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    if (otpDoc.tempToken !== tempToken) {
      return NextResponse.json({ message: "Invalid temp token" }, { status: 400 });
    }

    if (otpDoc.code !== code) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      if (otpDoc.attempts >= 5) {
        await Otp.deleteOne({ _id: otpDoc._id });
        return NextResponse.json({ message: "Too many attempts" }, { status: 429 });
      }
      return NextResponse.json({ message: "Invalid code" }, { status: 401 });
    }

    const user = await User.findOne<IUser>({ email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const otpToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, { expiresIn: "15m" });

    await Otp.deleteOne({ _id: otpDoc._id });

    return NextResponse.json({ message: "OTP verified successfully", otpToken });
  } catch (err) {
    console.error("❌ Server error in verify-otp:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}