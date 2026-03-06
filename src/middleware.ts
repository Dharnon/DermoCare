import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that allows all requests through
// Auth is handled at page level instead
export function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
