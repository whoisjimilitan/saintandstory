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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SignupResponse | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

          <div className="mb-12 p-6 border border-[#E8E8E8] rounded-lg">
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
    <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Headline - Premium typography matching homepage */}
        <h1 className="font-sans font-black text-5xl md:text-6xl leading-[1.0] tracking-tight text-[#0D0D0D] mb-4 text-center">
          R<span className="font-display italic font-normal">e</span>fer Customers.<br />
          Earn £20<span className="text-4xl md:text-5xl">/referral</span>.
        </h1>

        {/* Subheading */}
        <p className="text-base text-[#888888] text-center mb-12">For receptionists and office managers. Paid monthly to your account.</p>

        {/* Form */}
        <div className="bg-white rounded-lg border border-[#E8E8E8] p-8 mb-8">
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
              placeholder="+44 followed by your number (e.g. +441234567890)"
              required
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
            />

            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
            >
              <option value="">Select your city</option>
              {UK_CITIES.map((city) => (
                <option key={city} value={city}>
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

        {/* FAQ - Collapsible */}
        <div className="bg-white rounded-lg border border-[#E8E8E8] p-8">
          <h2 className="text-lg font-semibold text-[#0D0D0D] mb-6">FAQ</h2>
          <div className="space-y-3">
            {[
              { q: "How much do I earn?", a: "£20 per referral. When your client books with us and mentions your code, you get paid." },
              { q: "When do I get paid?", a: "Monthly. On the 1st of each month, we process payouts from the previous month directly to your bank." },
              { q: "Do I need to do anything?", a: "No. Just tell your clients to mention your code when they book. We handle everything else." },
              { q: "Is there a minimum?", a: "No minimum referrals. Earn as much or as little as you want. Zero obligations." },
              { q: "What if I have questions?", a: "Call us on 0203 051 9243 or reply to your WhatsApp messages. We're here to help." },
            ].map((item, idx) => (
              <div key={idx} className="border border-[#E8E8E8] rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-semibold text-[#0D0D0D] hover:bg-[#F9F9F9] transition flex justify-between items-center"
                >
                  {item.q}
                  <span className={`text-lg transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-sm text-[#888888] border-t border-[#E8E8E8]">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#999999] text-center mt-8">
          By signing up, you agree to receive WhatsApp updates about your referrals and payouts.
        </p>
      </div>
    </div>
  );
}
