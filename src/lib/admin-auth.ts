import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "admin_session";

/**
 * Returns null when the request is authenticated as admin, otherwise
 * returns a 401 response to send back directly from the route handler.
 * Middleware already blocks page loads; this guards the API routes too,
 * since API routes are excluded from the middleware matcher.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  const token = process.env.ADMIN_TOKEN;
  if (!token || !session || session !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
