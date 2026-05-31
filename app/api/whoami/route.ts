import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? null;
  return NextResponse.json({ userId, email });
}
