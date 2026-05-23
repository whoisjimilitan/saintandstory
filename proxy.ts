import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/engine",
  "/factory",
  "/harvests",
  "/hooks",
  "/clusters",
  "/schedule",
  "/store",
  "/guide",
  "/sell",
  "/api/engine",
  "/api/factory",
  "/api/products",
  "/api/hooks",
  "/api/clusters",
  "/api/daily-loop",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  const session = req.cookies.get("farm_session");
  if (session?.value === "authenticated") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/signin";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/engine/:path*",
    "/factory/:path*",
    "/harvests/:path*",
    "/hooks/:path*",
    "/clusters/:path*",
    "/schedule/:path*",
    "/store/:path*",
    "/guide/:path*",
    "/sell/:path*",
    "/api/engine/:path*",
    "/api/factory/:path*",
    "/api/products/:path*",
    "/api/hooks/:path*",
    "/api/clusters/:path*",
    "/api/daily-loop/:path*",
  ],
};
