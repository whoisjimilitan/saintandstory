"use client";

import { useEffect } from "react";

export default function DriverHeartbeat() {
  useEffect(() => {
    function ping() {
      fetch("/api/driver/heartbeat", { method: "POST" }).catch(() => {});
    }
    ping();
    const id = setInterval(ping, 60_000);
    return () => clearInterval(id);
  }, []);

  return null;
}
