import { getPusherServer, PUSHER_CHANNEL, PUSHER_EVENT } from "./pusher";

export async function triggerAdminRefresh(event?: string) {
  try {
    const pusher = getPusherServer();
    if (!pusher) return;
    await pusher.trigger(PUSHER_CHANNEL, PUSHER_EVENT, { event: event ?? "update" });
  } catch {
    // Non-fatal
  }
}
