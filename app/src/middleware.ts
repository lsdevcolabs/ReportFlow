import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up", "/choose-plan", "/r"];
const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/") || pathname.startsWith(route + "#"));

export default async function middleware(request: NextRequest) {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (isPublicRoute(url.pathname)) {
    return NextResponse.next();
  }

  try {
    const mod = await import("@clerk/nextjs/server");
    const matcher = mod.createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/choose-plan(.*)", "/r(.*)"]);
    const handler = mod.clerkMiddleware((auth, req) => {
      if (!matcher(req)) {
        auth().protect();
      }
    });
    return await handler(request, {} as any);
  } catch {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
