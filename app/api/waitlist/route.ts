import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, FROM, waitlistEmail1, waitlistEmail2, waitlistEmail3 } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { email, query, country } = await req.json() as { email?: string; query?: string; country?: string };

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const queryText = query?.trim() || "your topic";

  try {
    await prisma.emailSubscriber.upsert({
      where: { email: normalized },
      create: { email: normalized, productSlug: query?.trim() || null, country: country?.trim() || null, source: "waitlist" },
      update: { productSlug: query?.trim() || null, country: country?.trim() || null, source: "waitlist" },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

  const e1 = waitlistEmail1(queryText);
  const e2 = waitlistEmail2(queryText);
  const e3 = waitlistEmail3(queryText);

  // Fire all three — Email 1 immediately, 2 and 3 scheduled. Failures are non-blocking.
  await Promise.allSettled([
    resend.emails.send({ from: FROM, to: normalized, subject: e1.subject, html: e1.html }),
    resend.emails.send({ from: FROM, to: normalized, subject: e2.subject, html: e2.html, scheduledAt: in24h }),
    resend.emails.send({ from: FROM, to: normalized, subject: e3.subject, html: e3.html, scheduledAt: in72h }),
  ]);

  return NextResponse.json({ ok: true });
}
