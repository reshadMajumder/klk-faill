import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // The authentication logic is now handled client-side in the AuthProvider
  // and the respective pages, which will redirect if the user is not authenticated.
  // The previous middleware was checking for a non-existent cookie, causing a redirect loop.
  return NextResponse.next();
}

// The matcher is kept to apply this empty middleware to the protected routes,
// effectively removing the old faulty check for just those routes.
export const config = {
  matcher: ['/profile/:path*', '/contributions/new/:path*'],
};
