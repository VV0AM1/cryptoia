import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = new Set(['image/png', 'image/jpeg', 'image/webp']);

function cleanName(name: string) {
  return name.replace(/[^\w.-]+/g, '_');
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await req.formData();
    let file = form.get('avatar') as File | null;
    if (!file) file = form.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Max size is 4MB' }, { status: 400 });
    }
    if (file.type && !ACCEPT.has(file.type)) {
      return NextResponse.json({ error: 'Only PNG, JPG, or WEBP allowed' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const extFromType = file.type ? file.type.split('/')[1] : '';
    const base = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ext = extFromType || path.extname(file.name) || '.png';
    const filename = cleanName(`${base}${ext.startsWith('.') ? ext : '.' + ext}`);
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');

    await mkdir(avatarsDir, { recursive: true });
    const filePath = path.join(avatarsDir, filename);
    await writeFile(filePath, bytes);

    await connectToDatabase();
    const user = await User.findOne({ email: token.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const publicUrl = `/avatars/${filename}`;
    const old = user.avatar as string | undefined;
    user.avatar = publicUrl;
    await user.save();

    if (old && old.startsWith('/avatars/')) {
      const oldPath = path.join(process.cwd(), 'public', old);
      if (oldPath.startsWith(avatarsDir)) {
        unlink(oldPath).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, avatar: publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: token.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const old = user.avatar as string | undefined;
    user.avatar = '';
    await user.save();

    if (old && old.startsWith('/avatars/')) {
      const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
      const oldPath = path.join(process.cwd(), 'public', old);
      if (oldPath.startsWith(avatarsDir)) {
        await unlink(oldPath).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to remove' }, { status: 500 });
  }
}