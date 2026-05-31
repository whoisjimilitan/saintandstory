"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PusherJs from "pusher-js";

export default function AdminAutoRefresh({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();

  useEffect(() => {
    // Pusher real-time subscription
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu";

    if (key) {
      const pusher = new PusherJs(key, { cluster });
      const channel = pusher.subscribe("admin");
      channel.bind("job-update", () => router.refresh());
      return () => {
        channel.unbind_all();
        pusher.unsubscribe("admin");
        pusher.disconnect();
      };
    }

    // Fallback: 15s polling if Pusher not configured
    const id = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(id);
  }, [router]);

  useEffect(() => {
    document.title = pendingCount > 0 ? `(${pendingCount}) Dashboard.` : "Dashboard.";
    return () => { document.title = "Dashboard."; };
  }, [pendingCount]);

  return null;
}
