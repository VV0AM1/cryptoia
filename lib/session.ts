// lib/session.ts
import jwt from 'jsonwebtoken';
import { connectToDatabase } from './db';
import { User } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

export async function getUserFromRequest(req: Request | any) {
  const token = req.cookies?.auth_token || (req.headers && req.headers.cookie && parseCookie(req.headers.cookie).auth_token);
  if (!token) return null;
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    await connectToDatabase();
    const user = await User.findById(payload.sub).lean();
    return user;
  } catch (err) {
    return null;
  }
}

function parseCookie(header: string) {
  return Object.fromEntries(header.split(';').map(v => v.trim().split('=')));
}
