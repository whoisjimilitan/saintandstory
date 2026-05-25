import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { resend, FROM, purchaseConfirmEmail } from "@/lib/resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const slug = session.payment_intent
      ? (await stripe.paymentIntents.retrieve(session.payment_intent as string)).metadata?.slug
      : null;
    const email = session.customer_details?.email;

    if (slug) {
      // Update sales stats
      const price = (session.amount_total ?? 0) / 100;
      await prisma.product.updateMany({
        where: { slug },
        data: { salesCount: { increment: 1 }, revenue: { increment: price } },
      }).catch(() => {});

      // Send purchase confirmation email
      if (email) {
        const product = await prisma.product.findFirst({ where: { slug } });
        if (product) {
          const { subject, html } = purchaseConfirmEmail(
            product.title,
            `https://pdfseeds.com/guide/${slug}`
          );
          await resend.emails.send({ from: FROM, to: email, subject, html }).catch(() => {});
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
