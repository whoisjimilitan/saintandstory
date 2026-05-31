import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const BASE_URL = "https://saintandstoryltd.co.uk";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT stripe_customer_id FROM drivers WHERE clerk_user_id = ${userId} LIMIT 1`;
  const customerId = rows[0]?.stripe_customer_id as string | null;

  if (!customerId) {
    return NextResponse.redirect(`${BASE_URL}/dashboard/driver/earnings?error=no_subscription`);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "sk_live_replace_this") {
    return NextResponse.redirect(`${BASE_URL}/dashboard/driver/earnings?error=stripe_not_configured`);
  }

  const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      customer: customerId,
      return_url: `${BASE_URL}/dashboard/driver/earnings`,
    }),
  });

  const session = await res.json() as { url?: string; error?: { message: string } };
  if (!session.url) {
    return NextResponse.redirect(`${BASE_URL}/dashboard/driver/earnings?error=portal_failed`);
  }

  return NextResponse.redirect(session.url);
}
