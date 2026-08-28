import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySharedToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept shared snapshot links: /s/[token]/[...path]
  if (pathname.startsWith("/s/")) {
    const segments = pathname.split("/").filter(Boolean);
    // segments: ["s", "TOKEN", "mistakes"] etc
    const token = segments[1];

    if (!token) {
      return NextResponse.rewrite(new URL("/expired", request.url));
    }

    try {
      const verifyRes = await fetch(new URL(`/api/shared/verify-link?token=${token}`, request.url));
      const payload = await verifyRes.json();

      if (!payload || !payload.valid || !payload.userId) {
        return NextResponse.rewrite(new URL("/expired", request.url));
      }

      // Rewrite internally to the standard shared route
      const restOfPath = segments.slice(2).join("/");
      const targetPath = `/shared/${payload.userId}${restOfPath ? `/${restOfPath}` : ""}`;
      
      return NextResponse.rewrite(new URL(targetPath, request.url));
    } catch (e) {
      console.error(e);
      return NextResponse.rewrite(new URL("/expired", request.url));
    }
  }

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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
