"use client";

import { useState, useCallback } from "react";
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
  const [geoLoading, setGeoLoading] = useState(false);

  const validate = useCallback(() => {
    return (
      formData.full_name.trim().length > 0 &&
      formData.phone.trim().length > 0 &&
      formData.postcode_from.trim().length > 0
    );
  }, [formData]);

  const handleGeoLocation = useCallback(() => {
    setGeoLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const postcode = data.address?.postcode || "";
            if (postcode) {
              setFormData((prev) => ({ ...prev, postcode_from: postcode }));
            }
          } catch (error) {
            console.error("Geolocation error:", error);
          } finally {
            setGeoLoading(false);
          }
        },
        () => setGeoLoading(false)
      );
    } else {
      setGeoLoading(false);
    }
  }, []);

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
      setTimeout(onClose, 2500);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden">
        <div className="p-6 md:p-8">
          {isSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-5xl">✓</div>
              <h2 className="text-2xl font-black text-[#0D0D0D]">We're finding your driver</h2>
              <p className="text-[#888888]">We'll call you within 5 minutes with your quote.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-black text-[#0D0D0D] mb-2">Let's match you with a driver</h1>
                <p className="text-sm text-[#888888]">2 steps to get your quote</p>
              </div>

              {/* Form */}
              <div className="space-y-4 mb-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#0D0D0D] mb-2">Your name</label>
                  <input
                    type="text"
                    placeholder="e.g., James"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
                    autoFocus
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#0D0D0D] mb-2">Your phone</label>
                  <input
                    type="tel"
                    placeholder="e.g., 07700 900000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
                  />
                </div>

                {/* Postcode */}
                <div>
                  <label className="block text-xs font-semibold text-[#0D0D0D] mb-2">Your postcode</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., SW1A 2AA"
                      value={formData.postcode_from}
                      onChange={(e) => setFormData({ ...formData, postcode_from: e.target.value })}
                      className="flex-1 border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
                    />
                    <button
                      onClick={handleGeoLocation}
                      disabled={geoLoading}
                      className="px-4 py-3 border border-[#E8E8E8] rounded-xl text-[#0D0D0D] hover:bg-[#F5F5F5] transition disabled:opacity-50"
                      title="Use my location"
                    >
                      📍
                    </button>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleSubmit}
                disabled={!validate() || isSubmitting || geoLoading}
                className="w-full px-6 py-3 bg-[#0D0D0D] text-white font-black rounded-xl hover:bg-[#333333] transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isSubmitting ? "Matching..." : "Get Matched →"}
              </button>

              {/* Trust Signals */}
              <div className="space-y-2 text-xs text-[#888888] text-center">
                <p>✅ Your details are safe</p>
                <p>📞 We'll call within 5 minutes</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
