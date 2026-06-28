"use client";

import { useState, useEffect } from "react";

interface WidgetProps {
  position?: "bottom-right" | "bottom-left";
  companyName?: string;
}

export default function WhatsAppWidget({
  position = "bottom-right",
  companyName = "your company",
}: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [availability, setAvailability] = useState({
    activeDrivers: 5,
    avgETA: 8,
    city: "Manchester",
    available: true,
  });

  useEffect(() => {
    // Update availability periodically (mock data for now)
    const interval = setInterval(() => {
      setAvailability((prev) => ({
        ...prev,
        activeDrivers: Math.floor(Math.random() * 8) + 3,
        avgETA: Math.floor(Math.random() * 5) + 5,
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleOpenWhatsApp = () => {
    const userCity = availability.city;
    // Psychology-locked message: Acknowledge + Problem (no ask, no sales language)
    // Operator will respond with: Acknowledge → Problem → Intro (I head logistics...)
    const message = `Hi, we're in ${userCity} and need urgent same-day delivery. Are you available today?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "447700000000"; // Replace with actual number
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(url, "_blank");
  };

  const positionClass =
    position === "bottom-right"
      ? "bottom-6 right-6"
      : "bottom-6 left-6";

  return (
    <>
      {/* Floating Widget Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`fixed ${positionClass} w-14 h-14 bg-[#0D0D0D] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40`}
          aria-label="Open WhatsApp chat"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F9F9F9"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Expanded Widget */}
      {isExpanded && (
        <div
          className={`fixed ${positionClass} w-80 bg-white border border-[#E8E8E8] rounded-2xl shadow-2xl overflow-hidden z-50`}
        >
          {/* Header */}
          <div className="bg-[#0D0D0D] px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white">Saint & Story</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-[#E8E8E8] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#E8E8E8]">
              Same-day courier. Real drivers. Available now.
            </p>
          </div>

          {/* Availability Status */}
          <div className="px-6 py-5 border-b border-[#E8E8E8]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-semibold text-[#0D0D0D]">
                Available in {availability.city}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9F9F9] rounded p-3">
                <p className="text-xs text-[#888888] mb-1">Active Drivers</p>
                <p className="text-lg font-black text-[#0D0D0D]">
                  {availability.activeDrivers}
                </p>
              </div>
              <div className="bg-[#F9F9F9] rounded p-3">
                <p className="text-xs text-[#888888] mb-1">Avg Pickup</p>
                <p className="text-lg font-black text-[#0D0D0D]">
                  {availability.avgETA}m
                </p>
              </div>
            </div>
          </div>

          {/* Message Prompt */}
          <div className="px-6 py-5">
            <p className="text-xs text-[#666666] mb-4">
              What do you need delivered today?
            </p>
            <button
              onClick={handleOpenWhatsApp}
              className="w-full px-4 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#1A1A1A] transition-colors flex items-center justify-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.204c-2.957 1.817-4.833 5.119-4.833 8.76 0 .734.089 1.459.266 2.157l-1.24 4.526 4.639-1.218c1.254.687 2.662 1.05 4.113 1.05 5.366 0 9.72-4.351 9.72-9.721 0-2.592-.955-5.028-2.694-6.856-1.738-1.829-4.053-2.84-6.498-2.902" />
              </svg>
              Message on WhatsApp
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#F9F9F9] border-t border-[#E8E8E8]">
            <p className="text-xs text-[#888888] text-center">
              Typical response: 2-3 minutes
            </p>
          </div>
        </div>
      )}
    </>
  );
}
