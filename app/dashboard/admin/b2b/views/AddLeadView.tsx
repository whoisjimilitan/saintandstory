"use client";

import { useState } from "react";

const PRESSURE_TYPES = [
  "Delivery delays",
  "Staff turnover",
  "Cash flow",
  "Customer complaints",
  "Operations chaos",
];

const TEMPLATES: Record<string, { subject: string; body: string }> = {
  "Delivery delays": {
    subject: "Fix Your Delivery Problem",
    body: "Hi [NAME],\n\nWe help businesses solve delivery delays. Our clients see 40% faster delivery times.\n\nReady to talk?",
  },
  "Staff turnover": {
    subject: "Reduce Your Staff Turnover",
    body: "Hi [NAME],\n\nWe help reduce staff turnover by 60%. Your team deserves better.\n\nLet's discuss?",
  },
  "Cash flow": {
    subject: "Improve Your Cash Flow",
    body: "Hi [NAME],\n\nWe help businesses improve cash flow. Many see results within 30 days.\n\nInterested?",
  },
  "Customer complaints": {
    subject: "Eliminate Customer Complaints",
    body: "Hi [NAME],\n\nWe help eliminate customer complaints. Your reputation matters.\n\nWorth a call?",
  },
  "Operations chaos": {
    subject: "Simplify Your Operations",
    body: "Hi [NAME],\n\nWe help simplify operations. Less chaos, more profit.\n\nReady to streamline?",
  },
};

export function AddLeadView() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [pressureType, setPressureType] = useState("Delivery delays");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCreateAndSend = async () => {
    if (!businessName.trim() || !email.trim() || !category.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Create lead
      const createResponse = await fetch("/api/b2b/add-prospect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          email,
          businessCategory: category,
          painPoint: pressureType,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create lead");
      }

      const leadData = await createResponse.json();
      const leadId = leadData.lead.id;

      // Send email
      const template = TEMPLATES[pressureType];
      const emailBody = template.body.replace("[NAME]", businessName);

      const sendResponse = await fetch("/api/b2b/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          subject: template.subject,
          body: emailBody,
          pressureType,
          emailType: "initial",
        }),
      });

      if (!sendResponse.ok) {
        throw new Error("Failed to send email");
      }

      setSuccess(true);
      setBusinessName("");
      setEmail("");
      setCategory("");
      setPressureType("Delivery delays");

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-2xl space-y-12">
        <div>
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            Add Lead
          </h1>
          <p className="text-sm text-[#888888] mt-2">
            Create a lead and send first-touch email automatically
          </p>
        </div>

        <div className="bg-white border border-[#E8E8E8] rounded-lg p-8 space-y-6">
          {/* Business Name */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., ABC Logistics"
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@business.com"
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block mb-2">
              Business Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Logistics"
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
              disabled={loading}
            />
          </div>

          {/* Pressure Type */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block mb-2">
              Pressure Type
            </label>
            <select
              value={pressureType}
              onChange={(e) => setPressureType(e.target.value)}
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
              disabled={loading}
            >
              {PRESSURE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-[#DC2626] border border-[#DC2626] rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="text-sm text-green-600 border border-green-300 rounded-lg px-4 py-3">
              ✓ Lead created and email sent successfully
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleCreateAndSend}
            disabled={loading}
            className="w-full text-sm font-medium text-white bg-[#0D0D0D] px-4 py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? "Sending..." : "Create Lead & Send Email"}
          </button>
        </div>

        {/* Email Preview */}
        {pressureType && (
          <div className="space-y-4 pt-12 border-t border-[#E8E8E8]">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
              Email Preview
            </h2>
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg p-6 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-2">
                  Subject
                </p>
                <p className="text-sm text-[#0D0D0D]">
                  {TEMPLATES[pressureType].subject}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-2">
                  Body
                </p>
                <p className="text-sm text-[#0D0D0D] whitespace-pre-wrap">
                  {TEMPLATES[pressureType].body.replace("[NAME]", businessName || "[Business Name]")}
                </p>
              </div>
              <div className="text-sm text-[#888888]">
                Email will include YES/NO response buttons with unique tracking token
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
