import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKeys = publishableKey && 
  publishableKey !== "pk_test_..." && 
  publishableKey.length > 20;

const publicPaths = ["/", "/sign-in", "/sign-up", "/r"];
const isPublicPath = (path: string) => publicPaths.some(p => path === p || path.startsWith(p + "/"));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!hasValidClerkKeys) {
    return NextResponse.next();
  }

  try {
    const { authMiddleware } = await import("@clerk/nextjs");
    return authMiddleware({
      publicRoutes: ["/", "/sign-in", "/sign-up", "/r"],
      debug: false,
    })(request, {} as any);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};