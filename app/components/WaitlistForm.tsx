"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-waitlist" }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div style={{
        background: "#10B98115",
        border: "1px solid #10B98140",
        borderRadius: 12,
        padding: "20px 24px",
        textAlign: "center",
        marginBottom: 14,
      }}>
        <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🌱</div>
        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#10B981", marginBottom: 4 }}>
          You&apos;re on the list.
        </div>
        <div style={{ fontSize: "0.82rem", color: "#64748B" }}>
          We&apos;ll email you the moment spots open. Usually within a few days.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            flex: 1,
            background: "#0D0E17",
            border: "1px solid #2A3050",
            borderRadius: 10,
            padding: "14px 16px",
            fontSize: "0.9rem",
            color: "#E2E8F0",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            background: "#6366F1",
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.9rem",
            padding: "14px 22px",
            borderRadius: 10,
            border: "none",
            cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: status === "loading" ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {status === "loading" ? "Saving…" : "Join Waitlist →"}
        </button>
      </div>
      {status === "error" && (
        <p style={{ fontSize: "0.78rem", color: "#F87171", margin: 0 }}>
          Something went wrong — try again or email us directly.
        </p>
      )}
      <p style={{ fontSize: "0.78rem", color: "#334155", margin: 0, textAlign: "center" }}>
        Currently in beta — join the waitlist and we&apos;ll let you know when spots open.
      </p>
    </form>
  );
}
