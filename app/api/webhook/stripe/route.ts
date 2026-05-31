import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder");
}

async function getDriver(email: string): Promise<Record<string, unknown> | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM drivers WHERE email = ${email} LIMIT 1`;
  return (rows as Record<string, unknown>[])[0] ?? null;
}

async function activateDriver(email: string, customerId: string, subscriptionId: string, status: string) {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    INSERT INTO drivers (email, stripe_customer_id, stripe_subscription_id, subscription_status, profile_live)
    VALUES (${email}, ${customerId}, ${subscriptionId}, ${status}, ${status === "active"})
    ON CONFLICT (email) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      subscription_status = EXCLUDED.subscription_status,
      profile_live = ${status === "active"},
      updated_at = NOW()
  `;
}

async function sendActivationEmail(email: string, name: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: "Saint & Story <hello@saintandstoryltd.co.uk>",
    to: [email],
    subject: "Your driver profile is live — set your availability",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f5f5f5;border-radius:12px;">
        <div style="background:#0D0D0D;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
          <h2 style="margin:0;color:#fff;font-size:18px;font-weight:800;">You're live — Saint &amp; Story</h2>
        </div>
        <p style="color:#0D0D0D;font-size:15px;line-height:1.6;">Hi ${name || "there"},</p>
        <p style="color:#0D0D0D;font-size:15px;line-height:1.6;">Your driver profile is now active. Log in to your dashboard to set your availability and start receiving bookings.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://saintandstoryltd.co.uk"}/dashboard/driver"
           style="display:inline-block;margin:20px 0;background:#0D0D0D;color:#fff;font-weight:700;padding:13px 28px;border-radius:999px;text-decoration:none;font-size:14px;">
          Go to my dashboard →
        </a>
        <p style="color:#888;font-size:13px;">Finish a job at 3pm. Money in your account before 4pm.</p>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "No DATABASE_URL" }, { status: 500 });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "subscription") return NextResponse.json({ ok: true });

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const email = session.customer_details?.email ?? "";
    const name = session.customer_details?.name ?? "";

    if (!email) return NextResponse.json({ ok: true });

    await activateDriver(email, customerId, subscriptionId, "active");

    const driver = await getDriver(email);
    if (!driver?.full_name && name) {
      const sql = neon(process.env.DATABASE_URL!);
      await sql`UPDATE drivers SET full_name = ${name} WHERE email = ${email}`;
    }

    await sendActivationEmail(email, (driver?.full_name as string) ?? name);
    console.log("[stripe/webhook] Driver activated:", email);
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const status = sub.status;
    const isActive = status === "active";
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE drivers SET
        subscription_status = ${status},
        profile_live = ${isActive},
        updated_at = NOW()
      WHERE stripe_customer_id = ${customerId}
    `;
    console.log("[stripe/webhook] Subscription updated:", customerId, status);
  }

  return NextResponse.json({ ok: true });
}
