import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * NOTE: Shared snapshot links (/s/[token]/...) are handled by
     * the dynamic route app/s/[token]/page.tsx and
     * app/s/[token]/[...path]/page.tsx which run on the Node.js
     * runtime with full Prisma access — NOT in Edge middleware.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
