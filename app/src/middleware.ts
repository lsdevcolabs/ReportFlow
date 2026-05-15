import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/choose-plan(.*)", "/r(.*)"]);

export default clerkMiddleware((auth, request) => {
  try {
    if (!isPublicRoute(request)) {
      auth().protect();
    }
  } catch {
    // If Clerk is not configured (missing env vars), allow public routes
    // Protected routes will return 401 by downstream page checks
    if (!isPublicRoute(request)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};