import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/auth";
import { getCurrentUserId } from "@/lib/clerk-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
    
    const user = await ensureUserExists(clerkUser.id, email, name);

    if (!user) {
      return NextResponse.json({ error: "User initialization failed" }, { status: 500 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[GET /api/user]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { agencyName, agencyWebsite, agencyLogoUrl, agencyBrandColor } = body;

    const [updatedUser] = await db
      .update(users)
      .set({
        agencyName: agencyName !== undefined ? agencyName : undefined,
        agencyWebsite: agencyWebsite !== undefined ? agencyWebsite : undefined,
        agencyLogoUrl: agencyLogoUrl !== undefined ? agencyLogoUrl : undefined,
        agencyBrandColor: agencyBrandColor !== undefined ? agencyBrandColor : undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[PUT /api/user]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
