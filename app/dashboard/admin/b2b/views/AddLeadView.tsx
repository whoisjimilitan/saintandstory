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
    subject: "Quick question about scheduling pressure",
    body: "Hi [NAME],\n\nSome businesses in your space tend to run into timing pressure during certain parts of the day or week, where demand and internal capacity don't line up cleanly.\n\nIt usually shows up as small delays or backlog building up during peak periods.\n\nJust checking if that reflects your situation at all?\n\nYES / NO",
  },
  "Staff turnover": {
    subject: "Noticed something about staffing in your sector",
    body: "Hi [NAME],\n\nWe work with a lot of teams in your space, and a pattern keeps coming up: the people who'd be most valuable to keep are often the first ones to leave.\n\nUsually because the work itself is fine, but the operational friction wears them down.\n\nDoes that resonate for you?\n\nYES / NO",
  },
  "Cash flow": {
    subject: "Question about payment timing",
    body: "Hi [NAME],\n\nOne thing we see across most service businesses: the gap between when you pay your team and when you get paid by clients creates real friction.\n\nIt's not usually about profitability—it's about the timing squeeze.\n\nIs that something you manage around?\n\nYES / NO",
  },
  "Customer complaints": {
    subject: "Question about customer response time",
    body: "Hi [NAME],\n\nIn your industry, customer issues often come in clusters—busy days, busy seasons. When that happens, response time suffers even though the service itself is fine.\n\nJust wondering if you hit those pockets where you're basically choosing between speed and quality.\n\nDoes that happen?\n\nYES / NO",
  },
  "Operations chaos": {
    subject: "Question about operational coordination",
    body: "Hi [NAME],\n\nWhen you have multiple teams or shifts coordinating, there's usually a moment where things go sideways: communication misses, handoffs fail, small things compound.\n\nMost of the time it's not a process problem—it's a coordination problem under pressure.\n\nHave you run into that?\n\nYES / NO",
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
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    leadId?: string;
    subject: string;
    body: string;
  } | null>(null);

  const handlePreview = async () => {
    if (!businessName.trim() || !email.trim() || !category.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError("");

    try {
      // Create lead first
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

      // Show preview
      const template = TEMPLATES[pressureType];
      const emailBody = template.body.replace("[NAME]", businessName);

      setPreviewData({
        leadId,
        subject: template.subject,
        body: emailBody,
      });
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleConfirmSend = async () => {
    if (!previewData?.leadId) return;

    setLoading(true);
    setError("");

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
      const sendResponse = await fetch("/api/b2b/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: previewData.leadId,
          subject: previewData.subject,
          body: previewData.body,
          pressureType,
          emailType: "initial",
        }),
      });

      if (!sendResponse.ok) {
        throw new Error("Failed to send email");
      }

      setSuccess(true);
      setShowPreview(false);
      setPreviewData(null);
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

  const handleCancel = () => {
    setShowPreview(false);
    setPreviewData(null);
    setError("");
  };

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-3xl space-y-16">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            Add Lead
          </h1>
          <p className="text-sm text-[#888888] mt-3">
            Create a prospect and send first-touch email with tracking
          </p>
        </div>

        {/* FORM — LINEAR, NO CARDS */}
        <div className="space-y-8">
          {/* Business Name */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., ABC Logistics"
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@business.com"
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block">
              Business Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Logistics"
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
              disabled={loading}
            />
          </div>

          {/* Pressure Type */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block">
              Pressure Type
            </label>
            <select
              value={pressureType}
              onChange={(e) => setPressureType(e.target.value)}
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] transition-colors"
              disabled={loading}
            >
              {PRESSURE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STATUS MESSAGES */}
        <div className="space-y-3">
          {error && (
            <div className="text-sm text-[#DC2626] border-l-2 border-[#DC2626] pl-4 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 border-l-2 border-green-600 pl-4 py-2">
              ✓ Lead created and email sent successfully
            </div>
          )}
        </div>

        {/* ACTION BUTTON */}
        <div>
          <button
            onClick={handlePreview}
            disabled={loading}
            className="text-sm font-medium text-[#0D0D0D] border border-[#0D0D0D] px-4 py-3 hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Preview Email"}
          </button>
        </div>

        {/* EMAIL PREVIEW — EDITORIAL STYLE */}
        {pressureType && (
          <div className="space-y-6 pt-16 border-t border-[#E8E8E8]">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
              Email Preview
            </h2>

            <div className="space-y-6">
              {/* Subject */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                  Subject
                </p>
                <p className="text-sm text-[#0D0D0D]">
                  {TEMPLATES[pressureType].subject}
                </p>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                  Body
                </p>
                <p className="text-sm text-[#0D0D0D] whitespace-pre-wrap leading-relaxed">
                  {TEMPLATES[pressureType].body.replace("[NAME]", businessName || "[Business Name]")}
                </p>
              </div>

              {/* Response Mechanism */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                  Response Mechanism
                </p>
                <p className="text-sm text-[#0D0D0D]">
                  Email includes unique tracking token. Prospect clicks YES or NO button. Response recorded automatically. Lead status updated to warm (YES) or contacted (NO).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW MODAL */}
        {showPreview && previewData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
              <div className="p-8 space-y-8">
                {/* HEADER */}
                <div>
                  <h2 className="text-2xl font-black text-[#0D0D0D] tracking-tight">
                    Confirm Email Send
                  </h2>
                  <p className="text-sm text-[#888888] mt-2">
                    Review the email before sending to {businessName}
                  </p>
                </div>

                {/* EMAIL PREVIEW */}
                <div className="space-y-6 py-6 border-t border-b border-[#E8E8E8]">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-2">
                      Subject
                    </p>
                    <p className="text-sm font-medium text-[#0D0D0D]">
                      {previewData.subject}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-2">
                      Body
                    </p>
                    <p className="text-sm text-[#0D0D0D] whitespace-pre-wrap">
                      {previewData.body}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-2">
                      Buttons
                    </p>
                    <div className="flex gap-2">
                      <button className="text-sm px-3 py-2 border border-green-600 text-green-600 rounded">
                        YES
                      </button>
                      <button className="text-sm px-3 py-2 border border-[#0D0D0D] text-[#0D0D0D] rounded">
                        NO
                      </button>
                    </div>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="text-sm text-[#DC2626] border-l-2 border-[#DC2626] pl-4 py-2">
                    {error}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex gap-4">
                  <button
                    onClick={handleConfirmSend}
                    disabled={loading}
                    className="flex-1 text-sm font-medium text-white bg-[#0D0D0D] px-4 py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Email"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 text-sm font-medium text-[#0D0D0D] border border-[#0D0D0D] px-4 py-3 hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
