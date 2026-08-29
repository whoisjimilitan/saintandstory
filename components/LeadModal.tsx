"use client";

import { useState, useCallback, useEffect } from "react";
import posthog from "posthog-js";

function track(event: string, props?: Record<string, unknown>) {
  try { posthog.capture(event, props); } catch { /* */ }
}

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    postcode_from: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpenModal = () => {
      setIsMinimized(false);
    };

    document.addEventListener("open-lead-modal", handleOpenModal);
    return () => document.removeEventListener("open-lead-modal", handleOpenModal);
  }, []);

  const validate = useCallback(() => {
    return (
      formData.full_name.trim().length > 0 &&
      formData.phone.trim().length > 0 &&
      formData.postcode_from.trim().length > 0
    );
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    track("lead_submitted", { source: "modal" });

    setIsSubmitting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.full_name,
          phone: formData.phone,
          phoneConsent: true,
          postcode_from: formData.postcode_from,
          postcode_to: "",
          timeframe: "Soon",
          utm: {
            utm_source: params.get("utm_source") ?? "",
            utm_medium: params.get("utm_medium") ?? "",
            utm_campaign: params.get("utm_campaign") ?? "",
          },
        }),
      });

      window.fbq?.('track', 'Lead', {
        content_name: 'Lead Form Submission',
        content_type: 'lead',
        value: 45,
        currency: 'GBP',
        phone_number: formData.phone,
      });

      setIsSuccess(true);
      window.dispatchEvent(new CustomEvent("lead-success", { detail: { phone: formData.phone } }));
      setTimeout(onClose, 3000);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate, onClose]);

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-[#0D0D0D] text-white px-6 py-3 z-40 flex items-center justify-between">
        <span className="font-black text-sm">Get your quote in 90 seconds</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white text-[#0D0D0D] font-black px-4 py-2 rounded-lg hover:bg-[#E8E8E8] transition text-sm"
        >
          Expand
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full">
        <div className="p-8 flex justify-between items-start mb-4">
          <div />
          <button
            onClick={() => setIsMinimized(true)}
            className="text-[#888888] hover:text-[#0D0D0D] transition text-xl font-black"
            title="Minimize"
          >
            −
          </button>
        </div>
        <div className="px-8 pb-8">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-black text-[#0D0D0D]">We're matching you with a driver</h2>
              <p className="text-[#888888]">You'll get a call within 5 minutes at {formData.phone}</p>
              <p className="text-sm text-[#888888]">Stay available on this number</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-[#0D0D0D] mb-6">Get your quote in 90 seconds</h2>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
                  autoFocus
                />

                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
                />

                <input
                  type="text"
                  placeholder="Postcode"
                  value={formData.postcode_from}
                  onChange={(e) => setFormData({ ...formData, postcode_from: e.target.value })}
                  className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!validate() || isSubmitting}
                className="w-full px-6 py-3 bg-[#0D0D0D] text-white font-black rounded-xl hover:bg-[#333333] transition disabled:opacity-50"
              >
                {isSubmitting ? "Getting quote..." : "Get Quote"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
