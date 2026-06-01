import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import Stripe from "stripe";

const BASE_URL = "https://saintandstoryltd.co.uk";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder");
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(`${BASE_URL}/sign-in`);

  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(`${BASE_URL}/dashboard/driver/jobs`);
  }

  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT email, full_name, stripe_customer_id
    FROM drivers
    WHERE clerk_user_id = ${userId}
    LIMIT 1
  `;
  const driver = rows[0];

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "sk_placeholder") {
    return NextResponse.redirect(`${BASE_URL}/dashboard/driver/jobs`);
  }

  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    success_url: `${BASE_URL}/dashboard/driver/jobs?subscribed=1`,
    cancel_url: `${BASE_URL}/dashboard/driver/jobs`,
    ...(driver?.email ? { customer_email: driver.email as string } : {}),
    // If they already have a Stripe customer, attach to it
    ...(driver?.stripe_customer_id ? { customer: driver.stripe_customer_id as string } : {}),
    subscription_data: {
      metadata: { driver_user_id: userId },
    },
  };

  if (priceId) {
    // Use the stored Price ID from Stripe dashboard
    sessionParams.line_items = [{ price: priceId, quantity: 1 }];
  } else {
    // Fallback: create price inline (add STRIPE_PRICE_ID to Vercel env to avoid this)
    sessionParams.line_items = [{
      price_data: {
        currency: "gbp",
        product_data: {
          name: "Saint & Story Driver Platform",
          description: "Founding rate — £9.99/month. Locked forever. Keep 100% of every job.",
        },
        unit_amount: 999,
        recurring: { interval: "month" },
      },
      quantity: 1,
    }];
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.redirect(session.url!);
  } catch {
    return NextResponse.redirect(`${BASE_URL}/dashboard/driver/jobs?error=checkout_failed`);
  }
}
