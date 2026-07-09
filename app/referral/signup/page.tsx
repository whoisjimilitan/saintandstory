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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-green-600">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome to the Referral Network!
              </h1>
              <p className="text-lg text-slate-600">
                Your referral code has been generated
              </p>
            </div>

            {/* Referral Code Display */}
            <div className="bg-slate-100 rounded-lg p-6 mb-6 text-center border-2 border-slate-300">
              <div className="text-sm text-slate-600 mb-2">Your Referral Code</div>
              <div className="text-4xl font-mono font-bold text-slate-900 mb-4">
                {success.referralCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(success.referralCode);
                  alert("Code copied to clipboard!");
                }}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition font-medium"
              >
                Copy Code
              </button>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="font-bold text-blue-900 mb-4">What Happens Next</h2>
              <ol className="space-y-3 text-blue-900">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <span>
                    We've sent you a WhatsApp message with your code and instructions
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <span>When clients ask about removals, give them your code</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <span>
                    They book with us and mention your code → You earn £15 per referral
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">4.</span>
                  <span>Track earnings on your dashboard, paid monthly</span>
                </li>
              </ol>
            </div>

            {/* Dashboard Link */}
            <div className="mb-6">
              <Link
                href={success.dashboard}
                className="block w-full bg-slate-900 text-white text-center py-3 rounded-lg hover:bg-slate-800 transition font-bold text-lg"
              >
                Go to Dashboard
              </Link>
            </div>

            {/* Share Message */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h2 className="font-bold text-slate-900 mb-3">Message to Share</h2>
              <div className="bg-white p-4 rounded border border-slate-300 mb-3 font-mono text-sm">
                <p className="text-slate-700">
                  Hi, for removals I recommend Saint & Story. Tell them code{" "}
                  <span className="font-bold">{success.referralCode}</span> for priority service.
                </p>
              </div>
              <button
                onClick={() => {
                  const text = `Hi, for removals I recommend Saint & Story. Tell them code ${success.referralCode} for priority service.`;
                  navigator.clipboard.writeText(text);
                  alert("Message copied!");
                }}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Copy Message for Clients
              </button>
            </div>

            {/* Support */}
            <div className="text-center mt-8 text-sm text-slate-600">
              <p>Questions?</p>
              <p className="font-mono font-bold">0203 051 9243</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Join the Referral Network
            </h1>
            <p className="text-lg text-slate-600">
              Earn £15 per referral. No signup fee. Get paid monthly.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-bold text-slate-900 mb-1">£15 Per Referral</div>
              <p className="text-sm text-slate-600">Every client who books earns you money</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-bold text-slate-900 mb-1">Real-Time Dashboard</div>
              <p className="text-sm text-slate-600">
                Track earnings, see payouts coming
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🚚</div>
              <div className="font-bold text-slate-900 mb-1">Done For You</div>
              <p className="text-sm text-slate-600">We handle everything end-to-end</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                name="officeManagerName"
                value={formData.officeManagerName}
                onChange={handleChange}
                placeholder="e.g., Sarah Jones"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Office/Business Name *
              </label>
              <input
                type="text"
                name="officeName"
                value={formData.officeName}
                onChange={handleChange}
                placeholder="e.g., Smith & Associates Solicitors"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+441234567890 or 01234567890"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
              <p className="text-xs text-slate-500 mt-2">UK format: Include country code +44 or just start with 0. We'll use this to send you referral updates.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                City *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              >
                <option value="">Select a city...</option>
                {UK_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Business Type (Optional)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Your Code..." : "Get Your Referral Code"}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-slate-500 text-center mt-6">
            By signing up, you agree to receive WhatsApp messages from Saint & Story about your
            referral activity and payouts.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">How much do I earn?</h3>
              <p className="text-slate-600">£15 per referral. When your client books with us and mentions your code, you get paid.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">When do I get paid?</h3>
              <p className="text-slate-600">Monthly. On the 1st of each month, we process payouts from the previous month directly to your bank.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Do I need to do anything?</h3>
              <p className="text-slate-600">No. Just tell your clients to mention your code when they book. We handle everything else.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Is there a minimum?</h3>
              <p className="text-slate-600">No minimum referrals. Earn as much or as little as you want. Zero obligations.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">What if I have questions?</h3>
              <p className="text-slate-600">Call us on 0203 051 9243 or reply to your WhatsApp messages. We're here to help.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
