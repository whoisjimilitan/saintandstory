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
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">
              Welcome
            </h1>
            <p className="text-xs text-[#999999]">Your referral code is ready</p>
          </div>

          <div className="max-w-2xl">
            {/* Code Card */}
            <div className="mb-12 p-8 border border-[#E8E8E8] rounded-lg">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
                Your Referral Code
              </p>
              <p className="text-5xl font-black text-[#0D0D0D] font-mono mb-6">
                {success.referralCode}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(success.referralCode);
                  alert("Code copied!");
                }}
                className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
              >
                Copy Code
              </button>
            </div>

            {/* How It Works */}
            <div className="mb-12 pb-12 border-b border-[#E8E8E8]">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
                How It Works
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">1. Share Your Code</p>
                  <p className="text-xs text-[#666666]">
                    When clients ask about removals, give them your referral code
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">2. They Book With Us</p>
                  <p className="text-xs text-[#666666]">They mention your code when booking</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">3. You Earn £15</p>
                  <p className="text-xs text-[#666666]">
                    Per referral, paid monthly to your bank account
                  </p>
                </div>
              </div>
            </div>

            {/* Message Template */}
            <div className="mb-12">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
                Share This Message
              </p>
              <div className="p-6 border border-[#E8E8E8] rounded-lg bg-[#F9F9F9] mb-4">
                <p className="text-sm text-[#0D0D0D]">
                  Hi, for removals I recommend Saint & Story. Tell them code{" "}
                  <span className="font-mono font-semibold">{success.referralCode}</span> for
                  priority service.
                </p>
              </div>
              <button
                onClick={() => {
                  const text = `Hi, for removals I recommend Saint & Story. Tell them code ${success.referralCode} for priority service.`;
                  navigator.clipboard.writeText(text);
                  alert("Message copied!");
                }}
                className="w-full px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
              >
                Copy Message
              </button>
            </div>

            {/* Dashboard Link */}
            <Link
              href={success.dashboard}
              className="block w-full px-6 py-4 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors text-center"
            >
              Go to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">
              Join Our Network
            </h1>
            <p className="text-xs text-[#999999]">Earn £15 per referral. No fees. Paid monthly.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mb-12">
            {error && (
              <div className="p-4 bg-[#FFF5F5] border border-[#FFE0E0] rounded-lg">
                <p className="text-sm text-[#CC0000]">{error}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="officeManagerName"
                value={formData.officeManagerName}
                onChange={handleChange}
                placeholder="Sarah Jones"
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />
            </div>

            {/* Office Name */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-2">
                Office/Business Name
              </label>
              <input
                type="text"
                name="officeName"
                value={formData.officeName}
                onChange={handleChange}
                placeholder="Smith & Associates"
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />
            </div>

            {/* WhatsApp Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+441234567890 or 01234567890"
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />
              <p className="text-xs text-[#666666] mt-2">
                UK format: Include country code +44 or start with 0
              </p>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-2">
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
              >
                <option value="">Select a city</option>
                {UK_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-2">
                Business Type
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating Code..." : "Get Your Referral Code"}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-[#999999] text-center mb-12">
            By signing up, you agree to receive WhatsApp messages about your referral activity and
            payouts.
          </p>

          {/* FAQ */}
          <div className="pt-12 border-t border-[#E8E8E8]">
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-8">
              Questions
            </p>
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D] mb-2">How much do I earn?</p>
                <p className="text-xs text-[#666666]">
                  £15 per referral. When your client books and mentions your code, you get paid.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D] mb-2">When do I get paid?</p>
                <p className="text-xs text-[#666666]">
                  Monthly. On the 1st of each month, we process payouts from the previous month
                  directly to your bank.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D] mb-2">What do I need to do?</p>
                <p className="text-xs text-[#666666]">
                  Just tell your clients to mention your code when they book. We handle everything
                  else.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D] mb-2">Is there a minimum?</p>
                <p className="text-xs text-[#666666]">
                  No minimum referrals. Zero obligations.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D] mb-2">Questions?</p>
                <p className="text-xs text-[#666666]">
                  Call us on 0203 051 9243 or reply to your WhatsApp messages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
