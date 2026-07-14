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
    hasWhatsapp: true, // Pre-checked for better UX
    referralCode: "", // Custom code they choose
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SignupResponse | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeStatus, setCodeStatus] = useState<{ available: boolean; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Validate referral code in real-time
    if (name === "referralCode") {
      validateCode(value);
    }
  };

  const validateCode = async (code: string) => {
    if (!code) {
      setCodeStatus(null);
      return;
    }

    // Client-side validation first
    if (code.length < 3) {
      setCodeStatus({ available: false, message: "Minimum 3 characters" });
      return;
    }

    if (code.length > 12) {
      setCodeStatus({ available: false, message: "Maximum 12 characters" });
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(code)) {
      setCodeStatus({ available: false, message: "Only letters, numbers, and hyphens allowed" });
      return;
    }

    // Server-side uniqueness check
    setCheckingCode(true);
    try {
      const response = await fetch("/api/referral/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      setCodeStatus(data);
      console.log("[VALIDATE-CODE]", data);
    } catch (err) {
      console.error("[VALIDATE-CODE] Error:", err);
      setCodeStatus({ available: false, message: "Error checking availability" });
    } finally {
      setCheckingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate code is available
    if (!codeStatus?.available) {
      setError("Please choose an available referral code");
      setLoading(false);
      return;
    }

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
          {/* Success Header */}
          <div className="text-center mb-16">
            <div className="mb-6 inline-flex items-center justify-center">
              <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-[#888888] uppercase tracking-widest font-semibold mb-3">Referral Code Created</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-4">You're All Set</h2>
            <p className="text-sm text-[#666666] mb-8">Start sharing and earning £20 per referral</p>
          </div>

          {/* Code Card */}
          <div className="mb-12 bg-gradient-to-br from-[#F9F9F9] to-[#FAFAFA] border border-[#E8E8E8] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200">
            <p className="text-xs text-[#888888] uppercase tracking-widest font-semibold mb-4 text-center">Your Referral Code</p>
            <div className="bg-white rounded-xl p-8 border border-[#E8E8E8] mb-6">
              <p className="text-center font-mono text-5xl md:text-6xl font-black text-[#0D0D0D] tracking-wider">
                {success.referralCode.toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(success.referralCode.toUpperCase());
                alert("Copied to clipboard!");
              }}
              className="w-full px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-full hover:bg-[#1A1A1A] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              Copy Code
            </button>
          </div>

          {/* Share Message Card */}
          <div className="mb-12 bg-white border border-[#E8E8E8] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200">
            <p className="text-xs text-[#888888] uppercase tracking-widest font-semibold mb-4">Share This Message</p>
            <div className="bg-[#F9F9F9] rounded-xl p-6 border-l-4 border-[#0D0D0D] mb-6">
              <p className="text-sm text-[#0D0D0D] leading-relaxed font-medium">
                "{success.message}"
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(success.message);
                alert("Message copied!");
              }}
              className="w-full px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-full hover:bg-[#1A1A1A] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              Copy Message
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={success.dashboard}
              className="px-6 py-4 bg-[#0D0D0D] text-white text-sm font-semibold rounded-full hover:bg-[#1A1A1A] transition-all duration-200 shadow-sm hover:shadow-md text-center active:scale-95"
            >
              View Dashboard
            </Link>
            <Link
              href="/refer"
              className="px-6 py-4 border border-[#E8E8E8] text-[#0D0D0D] text-sm font-semibold rounded-full hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all duration-200 text-center active:scale-95"
            >
              Go Back
            </Link>
          </div>
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
          <div className="border border-[#E8E8E8] rounded-2xl p-8 bg-gradient-to-br from-white to-[#FAFAFA] shadow-sm hover:shadow-md transition-all duration-200">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] bg-white hover:border-[#D0D0D0] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] focus:outline-none transition-all"
              />

              <input
                type="text"
                name="officeName"
                value={formData.officeName}
                onChange={handleChange}
                placeholder="Your role or title"
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] focus:outline-none transition-all"
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your contact number"
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] focus:outline-none transition-all"
              />

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-5 h-5 flex-shrink-0">
                  <input
                    type="checkbox"
                    name="hasWhatsapp"
                    checked={formData.hasWhatsapp}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border border-[#0D0D0D] bg-white appearance-none cursor-pointer checked:bg-[#0D0D0D] checked:border-[#0D0D0D] transition-colors"
                  />
                  {formData.hasWhatsapp && (
                    <svg
                      className="absolute inset-0 w-5 h-5 text-white pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[#0D0D0D] group-hover:text-[#333333] transition-colors">Available on WhatsApp</span>
              </label>

              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] focus:outline-none appearance-none bg-white cursor-pointer hover:border-[#0D0D0D] transition-all"
              >
                <option value="" className="text-[#CCCCCC]">Select your city</option>
                {UK_CITIES.map((city) => (
                  <option key={city} value={city} className="text-[#0D0D0D]">
                    {city}
                  </option>
                ))}
              </select>

              {/* Referral Code Input */}
              <div>
                <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">
                  Choose Your Referral Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    placeholder="e.g., EMMA or john-solicitors"
                    required
                    className={`w-full px-4 py-3 border rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:outline-none transition-all ${
                      formData.referralCode === ""
                        ? "border-[#E8E8E8] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]"
                        : codeStatus?.available
                          ? "border-[#4CAF50] focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50]"
                          : "border-[#FF6B6B] focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]"
                    }`}
                  />
                  {checkingCode && (
                    <div className="absolute right-4 top-3">
                      <div className="w-5 h-5 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {formData.referralCode && codeStatus && (
                  <div className={`mt-2 text-xs font-medium ${codeStatus.available ? "text-[#4CAF50]" : "text-[#FF6B6B]"}`}>
                    {codeStatus.available ? "✓ " : "✗ "}
                    {codeStatus.message}
                  </div>
                )}
                <p className="mt-2 text-xs text-[#888888]">3-12 characters. Letters, numbers, hyphens only. This is what people will use to get your referral rate.</p>
              </div>

              <button
                type="submit"
                disabled={loading || !codeStatus?.available}
                className="w-full px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-full hover:bg-[#1A1A1A] disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {loading ? "Creating Code..." : "Get Your Code"}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="space-y-3">
            {[
              { q: "How much do I earn?", a: "£20 per referral. When your client books and mentions your code, you get paid." },
              { q: "When do I get paid?", a: "Monthly. Payouts processed on the 1st of each month to your bank." },
              { q: "Do I need to do anything?", a: "Just share your code. We handle the rest." },
              { q: "Is there a minimum?", a: "No minimum. Earn as much or as little as you want." },
              { q: "Questions?", a: "Call 0203 051 9243 or reply to WhatsApp. We're here to help." },
            ].map((item, idx) => (
              <div key={idx} className="border border-[#E8E8E8] rounded-xl bg-white hover:shadow-sm transition-all duration-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 font-semibold text-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-sm flex items-center justify-between"
                >
                  {item.q}
                  <span className="text-[#999999]">{openFaq === idx ? "−" : "+"}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-sm text-[#666666] border-t border-[#E8E8E8] pt-4 leading-relaxed">
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
