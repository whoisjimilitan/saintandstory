"use client";

import { useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";

interface ProcessResult {
  success: boolean;
  opportunity_id?: string;
  problem_type?: string;
  confidence?: number;
  route?: string;
  status?: string;
  approval_status?: string;
  brief_subject?: string;
  pre_populated_reply?: string;
  error?: string;
}

export default function ConfessionTestForm() {
  const { showToast } = useToast();
  const [confessionText, setConfessionText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confessionText.trim()) {
      showToast("Please enter a confession", "error");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/operator/opportunity-feed/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confession_text: confessionText,
          company_name: companyName || "Unknown",
          contact_email: contactEmail,
          source_platform: "manual_test"
        })
      });

      const data = await res.json();
      setResult(data);

      if (res.ok) {
        showToast(`Processed: ${data.problem_type} (${(data.confidence * 100).toFixed(0)}%)`, "success");
        setConfessionText("");
        setCompanyName("");
        setContactEmail("");
      } else {
        showToast(data.error || "Failed to process", "error");
      }
    } catch (error) {
      showToast("Error processing confession", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
            Confession (Paste the raw text)
          </label>
          <textarea
            value={confessionText}
            onChange={(e) => setConfessionText(e.target.value)}
            placeholder="We're struggling to get legal documents to court on time..."
            className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none min-h-28"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
              Company (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Williams & Associates"
              className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@company.com"
              className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
        >
          {loading ? "Processing..." : "Test Process"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className={`border rounded-lg p-6 space-y-4 ${result.success ? "border-[#E8E8E8] bg-[#F9F9F9]" : "border-red-200 bg-red-50"}`}>
          {result.success ? (
            <>
              <div>
                <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
                  ✓ Processed Successfully
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#888888]">Problem Type</span>
                    <span className="text-sm font-mono text-[#0D0D0D] bg-white px-3 py-1 rounded border border-[#E8E8E8]">
                      {result.problem_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#888888]">Confidence</span>
                    <span className="text-sm font-semibold text-[#0D0D0D]">
                      {(result.confidence! * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#888888]">Route Decision</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded ${
                      result.route === "AUTO_SEND" ? "bg-green-100 text-green-700" :
                      result.route === "APPROVAL_QUEUE" ? "bg-yellow-100 text-yellow-700" :
                      result.route === "BATCH" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {result.route}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#888888]">Status</span>
                    <span className="text-sm text-[#0D0D0D]">{result.status}</span>
                  </div>
                  <div className="border-t border-[#E8E8E8] pt-3 mt-3">
                    <p className="text-xs text-[#888888] mb-1">Brief Subject</p>
                    <p className="text-sm text-[#0D0D0D]">{result.brief_subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] mb-1">Pre-Populated Reply</p>
                    <p className="text-sm italic text-[#0D0D0D] bg-white px-3 py-2 rounded border border-[#E8E8E8]">"{result.pre_populated_reply}"</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-widest mb-2">
                ✗ Error
              </p>
              <p className="text-sm text-red-700">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
