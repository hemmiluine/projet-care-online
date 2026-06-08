import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("care_online_token")?.value;
  const { pathname } = request.nextUrl;

  // Protect secure professeur space
  if (pathname.startsWith("/professeur")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users trying to access login page
  if (pathname === "/login") {
    if (token) {
      const professeurUrl = new URL("/professeur", request.url);
      return NextResponse.redirect(professeurUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/professeur/:path*", "/login"],
};
