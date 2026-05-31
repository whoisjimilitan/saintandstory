"use client";

import { useState } from "react";

export default function SmsButton({ phone, driverName }: { phone: string; driverName: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(`Hi ${driverName.split(" ")[0]}, please check your Saint & Story dashboard for a new job.`);

  const smsHref = `sms:${phone}?body=${encodeURIComponent(message)}`;

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
    <div className="flex flex-col gap-2 mt-1 w-full">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={2}
        className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] resize-none"
      />
      <div className="flex items-center gap-2">
        <a
          href={smsHref}
          className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-4 py-1.5 rounded-full text-xs transition-colors"
        >
          Open SMS app →
        </a>
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
