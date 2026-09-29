import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for the portal screens.
 *
 * The edge cannot open the database, so this checks only that a session
 * cookie exists: enough to keep unauthenticated browsers off the portal
 * screens without a round-trip. The admin API is not gated here — every one
 * of its routes verifies the session for real in `withUser` — because on
 * Netlify this runs as an edge function with a short time limit, and an
 * upload on a slow connection outlasts it before the backend sees a byte.
 */
const SESSION_COOKIE = "ax_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname !== "/admin/login" && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
