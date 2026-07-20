"use client";

import { useState } from "react";
import Link from "next/link";

export default function DeliveryChecklist() {
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);
  const [userCity, setUserCity] = useState("Manchester");

  const checklist = [
    {
      category: "Before 10am Deadline",
      items: [
        "Identify what needs delivering (documents, goods, samples)",
        "Confirm destination city and postcode",
        "Note any time-sensitive requirements (before 2pm, before 5pm, same-day)",
        "List any special handling needed (fragile, temperature-controlled, signature required)",
      ],
    },
    {
      category: "Communication Setup",
      items: [
        "Assign one person to manage delivery coordination",
        "Have mobile number ready for driver contact",
        "Confirm recipient's availability and access",
        "Prepare contact details for delivery recipient",
      ],
    },
    {
      category: "Documentation",
      items: [
        "Prepare item description and contents list",
        "Take photo of item(s) before dispatch (optional but recommended)",
        "Note any delivery instructions (gate code, parking, building access)",
        "Request delivery receipt confirmation if needed",
      ],
    },
    {
      category: "After Delivery Confirmed",
      items: [
        "Receive driver and delivery details",
        "Confirm pickup time with recipient",
        "Track delivery via SMS updates",
        "Request proof of delivery (photo or signature)",
      ],
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const message = `Hi, we're in ${userCity} and need help with same-day deliveries. Can we discuss options?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "442034323991";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#E8E8E8] py-8 px-6 sticky top-0 bg-white z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D0D0D]">Same-Day Delivery Checklist</h1>
            <p className="text-sm text-[#666666] mt-2">Get it right. Every time.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 border border-[#E8E8E8] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#F9F9F9] transition-colors text-sm"
            >
              Print
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-4 py-2.5 bg-[#0D0D0D] text-white font-semibold rounded-lg hover:bg-[#1A1A1A] transition-colors text-sm flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.204c-2.957 1.817-4.833 5.119-4.833 8.76 0 .734.089 1.459.266 2.157l-1.24 4.526 4.639-1.218c1.254.687 2.662 1.05 4.113 1.05 5.366 0 9.72-4.351 9.72-9.721 0-2.592-.955-5.028-2.694-6.856-1.738-1.829-4.053-2.84-6.498-2.902" />
              </svg>
              Message us
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Intro */}
          <div className="mb-12 p-6 bg-[#F9F9F9] rounded-lg border border-[#E8E8E8]">
            <p className="text-[#0D0D0D]">
              Same-day delivery sounds simple. It's actually a choreography of timing, communication, and logistics. This checklist keeps all the moving parts in sync. Use it before every urgent delivery to avoid delays and surprises.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-10 mb-12">
            {checklist.map((section, idx) => (
              <div key={idx} className="print:page-break-inside-avoid">
                <h2 className="text-lg font-black text-[#0D0D0D] mb-4">{section.category}</h2>
                <div className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex gap-4 p-4 rounded-lg border border-[#E8E8E8] bg-white hover:border-[#CCCCCC] transition-colors print:break-inside-avoid"
                    >
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-[#E8E8E8] cursor-pointer accent-[#0D0D0D]"
                        />
                      </div>
                      <label className="flex-1 text-[#0D0D0D] cursor-pointer">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="p-8 bg-[#0D0D0D] rounded-lg text-center print:hidden">
            <h3 className="text-xl font-black text-white mb-3">Ready to implement this?</h3>
            <p className="text-[#E8E8E8] mb-6">
              Our drivers are trained on this exact process. Let's get your deliveries running perfectly.
            </p>

            <div className="flex gap-3 justify-center mb-6">
              <div>
                <label className="block text-xs text-[#E8E8E8] mb-2">City</label>
                <input
                  type="text"
                  value={userCity}
                  onChange={(e) => setUserCity(e.target.value)}
                  className="px-3 py-2 bg-white text-[#0D0D0D] rounded text-sm border-0 w-32"
                  placeholder="Your city"
                />
              </div>
            </div>

            <button
              onClick={handleWhatsApp}
              className="px-6 py-3 bg-white text-[#0D0D0D] font-black rounded-lg hover:bg-[#F9F9F9] transition-colors inline-flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.204c-2.957 1.817-4.833 5.119-4.833 8.76 0 .734.089 1.459.266 2.157l-1.24 4.526 4.639-1.218c1.254.687 2.662 1.05 4.113 1.05 5.366 0 9.72-4.351 9.72-9.721 0-2.592-.955-5.028-2.694-6.856-1.738-1.829-4.053-2.84-6.498-2.902" />
              </svg>
              Start the conversation
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-[#E8E8E8] text-center text-sm text-[#666666]">
            <p>
              Need a physical copy? <button onClick={handlePrint} className="text-[#0D0D0D] font-semibold hover:underline">Print this page.</button>
            </p>
            <p className="mt-2">
              Have a delivery coming up?{" "}
              <button onClick={handleWhatsApp} className="text-[#0D0D0D] font-semibold hover:underline">
                Let's help.
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
