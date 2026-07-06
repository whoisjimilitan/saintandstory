"use client";

import { useEffect, useState } from "react";

export default function AdminClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString("en-GB"));

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-GB"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span className="text-xs text-[#888888]">{time}</span>;
}
