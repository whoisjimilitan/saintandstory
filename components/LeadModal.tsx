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
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && !detectedLocation) {
      detectLocation();
    }
  }, [isOpen, detectedLocation]);

  const detectLocation = useCallback(() => {
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
              setDetectedLocation(postcode);
            }
          } catch (error) {
            console.error("Geolocation error:", error);
          }
        },
        () => {
          // Silently fail on location error
        }
      );
    }
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

      onClose();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full">
        <div className="p-8">
          <h2 className="text-2xl font-black text-[#0D0D0D] mb-2">Get your quote in 90 seconds</h2>

          {detectedLocation && !locationConfirmed && (
            <div className="mb-6">
              <p className="text-sm text-[#888888] mb-4">We detected you're in {detectedLocation}. Ready?</p>
              <button
                onClick={() => setLocationConfirmed(true)}
                className="w-full px-6 py-2 border border-[#E8E8E8] text-sm font-semibold text-[#0D0D0D] rounded-xl hover:bg-[#F5F5F5] transition"
              >
                Yes, continue
              </button>
              <button
                onClick={() => setDetectedLocation(null)}
                className="w-full px-6 py-2 text-sm text-[#888888] mt-2 hover:text-[#0D0D0D] transition"
              >
                Change location
              </button>
            </div>
          )}

          {(!detectedLocation || locationConfirmed) && (
            <>
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

                {!detectedLocation && (
                  <input
                    type="text"
                    placeholder="Postcode"
                    value={formData.postcode_from}
                    onChange={(e) => setFormData({ ...formData, postcode_from: e.target.value })}
                    className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
                  />
                )}
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
