import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Öffentlich zugängliche Pfade
  const publicPaths = [
    '/',                    
    '/favicon.ico',
    '/manifest.json',

    '/sw.js',
  ];

  //Wenn einer der öffentlichen Pfade aufgerufen wird immer durchlassen
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Alles unter /home ist geschützt
  const isProtected = pathname === '/home' || pathname.startsWith('/home/');
  if (isProtected && !token) {
    //Redirect auf die Loginseite
    const loginUrl = new URL('/', req.url);
    loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
