"use client";

import { useState } from "react";

export default function SmsButton({ phone, driverName }: { phone: string; driverName: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(`Hi ${driverName.split(" ")[0]}, please check your Saint & Story dashboard for a new job.`);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send() {
    setState("sending");
    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message }),
      });
      if (res.ok) {
        setState("sent");
        setTimeout(() => { setState("idle"); setOpen(false); }, 2500);
      } else {
        setState("error");
        setTimeout(() => setState("idle"), 3000);
      }
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[#888888] hover:text-[#0D0D0D] text-xs font-semibold transition-colors"
      >
        SMS
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-2 w-full">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={2}
        className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] resize-none"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={send}
          disabled={state === "sending" || !message.trim()}
          className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold px-4 py-1.5 rounded-full text-xs transition-colors"
        >
          {state === "sending" ? "Sending…" : state === "sent" ? "Sent ✓" : state === "error" ? "Failed" : "Send →"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
