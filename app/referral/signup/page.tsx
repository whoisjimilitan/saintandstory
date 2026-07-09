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

export default function ReferrerSignup() {
  const [formData, setFormData] = useState({
    officeManagerName: "",
    officeName: "",
    phone: "",
    city: "",
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
      const response = await fetch("/api/referral/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, category: "business" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signup failed");

      setSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          {/* Success Hero */}
          <div className="text-center mb-12">
            <div className="mb-6 text-4xl">✓</div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">
              Ready to earn
            </h1>
            <p className="text-xs text-[#999999]">Your referral code is active</p>
          </div>

          {/* Code Section */}
          <div className="mb-12 p-8 border border-[#E8E8E8] rounded-lg text-center">
            <p className="text-xs text-[#888888] mb-4 uppercase tracking-widest font-semibold">
              Your Code
            </p>
            <p className="text-6xl font-black text-[#0D0D0D] font-mono mb-6">
              {success.referralCode}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(success.referralCode);
                alert("Copied!");
              }}
              className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
            >
              Copy Code
            </button>
          </div>

          {/* Next Steps */}
          <div className="space-y-4 mb-12">
            <div className="p-6 border border-[#E8E8E8] rounded-lg">
              <p className="text-sm font-semibold text-[#0D0D0D] mb-2">1. Share Your Code</p>
              <p className="text-xs text-[#666666]">When clients ask about removals, give them your code</p>
            </div>
            <div className="p-6 border border-[#E8E8E8] rounded-lg">
              <p className="text-sm font-semibold text-[#0D0D0D] mb-2">2. They Book With Us</p>
              <p className="text-xs text-[#666666]">They mention your code when booking</p>
            </div>
            <div className="p-6 border border-[#E8E8E8] rounded-lg">
              <p className="text-sm font-semibold text-[#0D0D0D] mb-2">3. You Earn £15</p>
              <p className="text-xs text-[#666666]">Paid monthly to your bank account</p>
            </div>
          </div>

          {/* Message Template */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
              Share This
            </p>
            <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg mb-3">
              <p className="text-sm text-[#0D0D0D]">
                Hi, for removals I recommend Saint & Story. Tell them code{" "}
                <span className="font-mono font-semibold">{success.referralCode}</span>
              </p>
            </div>
            <button
              onClick={() => {
                const text = `Hi, for removals I recommend Saint & Story. Tell them code ${success.referralCode}`;
                navigator.clipboard.writeText(text);
                alert("Copied!");
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
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">
            Earn Money Referring
          </h1>
          <p className="text-xs text-[#999999]">Get paid £15 per referral. Takes 1 minute.</p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-3 gap-3 mb-12">
          <div className="text-center">
            <p className="text-2xl font-black text-[#0D0D0D] mb-1">£15</p>
            <p className="text-xs text-[#666666]">Per referral</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#0D0D0D] mb-1">Monthly</p>
            <p className="text-xs text-[#666666]">Payment cycle</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#0D0D0D] mb-1">Zero</p>
            <p className="text-xs text-[#666666]">Obligations</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {error && (
            <div className="p-4 bg-[#FFF5F5] border border-[#FFE0E0] rounded-lg">
              <p className="text-sm text-[#CC0000]">{error}</p>
            </div>
          )}

          {/* Name */}
          <input
            type="text"
            name="officeManagerName"
            value={formData.officeManagerName}
            onChange={handleChange}
            placeholder="Your name"
            required
            className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
          />

          {/* Office */}
          <input
            type="text"
            name="officeName"
            value={formData.officeName}
            onChange={handleChange}
            placeholder="Your office or business"
            required
            className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
          />

          {/* Phone */}
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="WhatsApp: +441234567890 or 01234567890"
            required
            className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
          />

          {/* City */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating Code..." : "Get Your Code"}
          </button>
        </form>

        {/* Terms */}
        <p className="text-xs text-[#999999] text-center">
          By signing up, you agree to receive WhatsApp updates about your referrals and payouts.
        </p>
      </div>
    </div>
  );
}
