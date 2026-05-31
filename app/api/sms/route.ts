import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import twilio from "twilio";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oyedeleoyepeju@gmail.com"];

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { to, message } = await request.json();
  if (!to || !message) return NextResponse.json({ error: "to and message required" }, { status: 400 });

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    return NextResponse.json({ error: "SMS not configured" }, { status: 503 });
  }

  const client = twilio(accountSid, authToken);

  await client.messages.create({ to, from, body: message });

  return NextResponse.json({ ok: true });
}
