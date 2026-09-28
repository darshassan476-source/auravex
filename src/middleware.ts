import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for the portal.
 *
 * The edge cannot open the database, so this checks only that a session
 * cookie exists: enough to keep unauthenticated browsers off the portal
 * screens and the admin API without a round-trip. Every admin route then
 * verifies the session for real in `requireUser`.
 */
const SESSION_COOKIE = "ax_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (!signedIn) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
