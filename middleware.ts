import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Extract the Authorization header
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    // If no header, trigger the browser's native login prompt
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
    });
  }

  // Parse the Base64 encoded credentials
  const auth = authHeader.split(' ')[1];
  const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

  // Load expected credentials from environment variables
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'secret123';

  // Check if credentials match
  if (user === validUser && pwd === validPass) {
    return NextResponse.next();
  }

  // If wrong password, reject and prompt again
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
  });
}

// Only run this middleware on /admin and all its sub-routes
export const config = {
  matcher: ['/admin/:path*', "/orders/:path*"],
};