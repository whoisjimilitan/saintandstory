import webpush from "web-push";
import { neon } from "@neondatabase/serverless";

function getVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL ?? "mailto:hello@saintandstoryltd.co.uk";
  return pub && priv ? { pub, priv, email } : null;
}

export async function sendPushToAdmins(title: string, body: string) {
  const vapid = getVapid();
  if (!vapid || !process.env.DATABASE_URL) return;

  webpush.setVapidDetails(vapid.email, vapid.pub, vapid.priv);

  const sql = neon(process.env.DATABASE_URL);
  let subs: { endpoint: string; p256dh: string; auth: string }[] = [];
  try {
    subs = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions` as typeof subs;
  } catch {
    return;
  }

  await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title, body })
      )
    )
  );
}
