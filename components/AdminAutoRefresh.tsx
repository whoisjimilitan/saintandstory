"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
