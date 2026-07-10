"use client";

import { useState } from "react";
import Link from "next/link";

interface SignupResponse {
  success: boolean;
  referrerId: string;
  referralCode: string;
  message: string;
  dashboard: string;
}

const UK_CITIES = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Glasgow",
  "Liverpool",
  "Bristol",
  "Edinburgh",
  "Sheffield",
  "Newcastle",
  "Nottingham",
  "Leicester",
  "Cambridge",
  "Oxford",
  "Coventry",
  "York",
];

const CATEGORIES = [
  { value: "solicitor", label: "Solicitor/Law Firm" },
  { value: "accountant", label: "Accountant" },
  { value: "estate_agent", label: "Estate Agent" },
  { value: "business", label: "Other Business" },
];

export default function ReferrerSignup() {
  const [formData, setFormData] = useState({
    officeManagerName: "",
    officeName: "",
    phone: "",
    city: "",
    category: "business",
    hasWhatsapp: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SignupResponse | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("[SIGNUP] Submitting form:", formData);

      const response = await fetch("/api/referral/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setSuccess(data);
      console.log("[SIGNUP] ✓ Success:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      console.error("[SIGNUP] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <p className="text-xs text-[#888888] uppercase tracking-widest font-semibold mb-4">Your Code</p>
            <p className="text-7xl font-black text-[#0D0D0D] font-mono mb-8">
              {success.referralCode}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(success.referralCode);
                alert("Copied to clipboard!");
              }}
              className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
            >
              Copy Code
            </button>
          </div>

          <div className="mb-12 border border-[#E8E8E8] rounded-lg p-6 bg-white">
            <p className="text-xs text-[#888888] uppercase tracking-widest font-semibold mb-3">Share this message</p>
            <p className="text-sm text-[#0D0D0D] mb-4">
              "Hi, for removals I recommend Saint & Story. Use code <span className="font-mono font-semibold">{success.referralCode}</span>"
            </p>
            <button
              onClick={() => {
                const text = `Hi, for removals I recommend Saint & Story. Use code ${success.referralCode}`;
                navigator.clipboard.writeText(text);
                alert("Message copied!");
              }}
              className="w-full px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
            >
              Copy Message
            </button>
          </div>

          <Link
            href={success.dashboard}
            className="block w-full px-6 py-4 border border-[#E8E8E8] text-[#0D0D0D] text-sm font-semibold rounded-lg hover:border-[#0D0D0D] transition-colors text-center"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Headline - Premium typography matching homepage */}
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <h1 className="font-sans font-black text-5xl md:text-6xl leading-[1.0] tracking-tight text-[#0D0D0D] mb-4">
            R<span className="font-display italic font-normal">e</span>fer Clients.<br />
            Earn £20<span className="text-4xl md:text-5xl">/referral</span>.
          </h1>
          <p className="text-base text-[#888888]">For receptionists and office managers. Paid monthly to your account.</p>
        </div>

        {/* Form & FAQ in grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Form */}
          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-[#FFF5F5] border border-[#FFE0E0] rounded-lg">
                  <p className="text-sm text-[#CC0000]">{error}</p>
                </div>
              )}

              <input
                type="text"
                name="officeManagerName"
                value={formData.officeManagerName}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />

              <input
                type="text"
                name="officeName"
                value={formData.officeName}
                onChange={handleChange}
                placeholder="Your office or business"
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your contact number"
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasWhatsapp"
                  checked={formData.hasWhatsapp}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border border-[#E8E8E8]"
                />
                <span className="text-sm text-[#0D0D0D]">Available on WhatsApp</span>
              </label>

              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none appearance-none bg-white cursor-pointer hover:border-[#0D0D0D] transition-colors"
              >
                <option value="" className="text-[#CCCCCC]">Select your city</option>
                {UK_CITIES.map((city) => (
                  <option key={city} value={city} className="text-[#0D0D0D]">
                    {city}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating Code..." : "Get Your Code"}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            {[
              { q: "How much do I earn?", a: "£20 per referral. When your client books and mentions your code, you get paid." },
              { q: "When do I get paid?", a: "Monthly. Payouts processed on the 1st of each month to your bank." },
              { q: "Do I need to do anything?", a: "Just share your code. We handle the rest." },
              { q: "Is there a minimum?", a: "No minimum. Earn as much or as little as you want." },
              { q: "Questions?", a: "Call 0203 051 9243 or reply to WhatsApp. We're here to help." },
            ].map((item, idx) => (
              <div key={idx} className="border border-[#E8E8E8] rounded-lg bg-white hover:border-[#0D0D0D] transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 font-semibold text-[#0D0D0D] hover:bg-[#F9F9F9] transition text-sm"
                >
                  {item.q}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-[#666666] border-t border-[#E8E8E8] pt-4 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#999999] text-center">
          By signing up, you agree to receive WhatsApp updates about your referrals and payouts.
        </p>
      </div>
    </div>
  );
}
