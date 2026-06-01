"use client";

import { useEffect } from "react";
import PusherJs from "pusher-js";

// Mounted once in the admin page — distributes location events via DOM
// to AdminEtaBadge components without triggering a full page refresh.
export default function AdminLocationUpdater() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu";
    if (!key) return;

    const pusher = new PusherJs(key, { cluster });
    const channel = pusher.subscribe("admin");

    channel.bind("location-update", (data: { jobId: string; etaMinutes: number | null; arrived: boolean; driverName?: string }) => {
      document.dispatchEvent(new CustomEvent("admin-location-update", { detail: data }));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("admin");
      pusher.disconnect();
    };
  }, []);

  return null;
}
