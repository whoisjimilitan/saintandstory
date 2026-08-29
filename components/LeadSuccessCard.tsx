"use client";

import { useState, useEffect } from "react";

export default function LeadSuccessCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [phone, setPhone] = useState<string>("");

  useEffect(() => {
    const handleLeadSuccess = (event: CustomEvent) => {
      setPhone(event.detail?.phone || "");
      setIsVisible(true);
    };

    window.addEventListener("lead-success", handleLeadSuccess as EventListener);
    return () => window.removeEventListener("lead-success", handleLeadSuccess as EventListener);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D] text-white p-6 border-t border-[#E8E8E8]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black text-lg mb-1">We've got your details</h3>
            <p className="text-sm text-[#888888]">
              Call coming to <span className="font-semibold text-white">{phone}</span> within 5 minutes. Stay available on this number.
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-[#888888] hover:text-white transition pt-1"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
