import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\.).*)"]
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin section: cookie-gated, not locale-prefixed ---
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const session = request.cookies.get(ADMIN_COOKIE)?.value;
    const authed = Boolean(session) && session === process.env.ADMIN_TOKEN;

    if (!authed && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    if (authed && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // --- Public site: locale prefixing ---
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return NextResponse.next();

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = cookieLocale && locales.includes(cookieLocale as any) ? cookieLocale : defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}
