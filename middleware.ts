import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/', req.url)); 
  }

  if (!isAuth && !isAuthPage && req.nextUrl.pathname.startsWith('/account')) {
    return NextResponse.redirect(new URL('/login', req.url)); 
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/login', '/register'], 
};