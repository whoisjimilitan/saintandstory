"use client";

import { useState } from "react";

export default function RecurringCourierAd() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.companyName || !formData.email || !formData.city) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/campaigns/email-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Failed to save your info. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-[#0D0D0D] mb-3">Perfect!</h2>
          <p className="text-[#666666] mb-6">Check your email for a personalized quote and package options.</p>
          <p className="text-sm text-[#999999]">You'll hear from us within 2 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#E8E8E8] py-6 px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-black text-[#0D0D0D]">Saint & Story</h1>
          <p className="text-sm text-[#666666] mt-1">Recurring courier service</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-md mx-auto">
          {/* Hero */}
          <div className="mb-12">
            <h2 className="text-3xl font-black text-[#0D0D0D] leading-tight mb-3">
              Courier costs predictable?
            </h2>
            <p className="text-lg text-[#666666]">
              Get a fixed price package for your regular deliveries. No surprises, no negotiations.
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-12 space-y-4">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-[#0D0D0D] flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#0D0D0D]">Fixed monthly price</p>
                <p className="text-sm text-[#666666]">Budget your logistics spend with certainty</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-[#0D0D0D] flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#0D0D0D]">Dedicated drivers</p>
                <p className="text-sm text-[#666666]">Your team knows who's arriving</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-[#0D0D0D] flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#0D0D0D]">One point of contact</p>
                <p className="text-sm text-[#666666]">Your account manager handles everything</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">
                Company name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Acme Ltd"
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white focus:outline-none focus:border-[#0D0D0D]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@company.com"
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white focus:outline-none focus:border-[#0D0D0D]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. London"
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white focus:outline-none focus:border-[#0D0D0D]"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#0D0D0D] text-white font-semibold rounded-lg hover:bg-[#1A1A1A] disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Get custom pricing"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-[#999999]">
            We'll email you a custom package within 2 hours. No obligation.
          </p>
        </div>
      </main>
    </div>
  );
}
