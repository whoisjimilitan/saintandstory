import Pusher from "pusher";
import PusherJs from "pusher-js";

export function getPusherServer() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER ?? "eu";
  if (!appId || !key || !secret) return null;
  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

export function getPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu";
  if (!key) return null;
  return new PusherJs(key, { cluster });
}

export const PUSHER_CHANNEL = "admin";
export const PUSHER_EVENT = "job-update";
