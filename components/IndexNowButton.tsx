"use client";

import { useState } from "react";

export default function IndexNowButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [count, setCount] = useState(0);

  async function handleClick() {
    setState("loading");
    try {
      const res = await fetch("/api/indexnow");
      const data = await res.json();
      if (res.ok) {
        setCount(data.submitted ?? 0);
        setState("done");
        setTimeout(() => setState("idle"), 4000);
      } else {
        setState("error");
        setTimeout(() => setState("idle"), 3000);
      }
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className="text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-40"
      style={{ color: state === "done" ? "#16a34a" : state === "error" ? "#dc2626" : "#888888" }}
    >
      {state === "idle" && "Sync Bing →"}
      {state === "loading" && "Indexing…"}
      {state === "done" && `✓ ${count} URLs submitted`}
      {state === "error" && "Failed — retry"}
    </button>
  );
}
