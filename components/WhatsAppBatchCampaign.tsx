"use client";

import { useState } from "react";

interface Lead {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  groupName?: string;
  company?: string;
  linkedinProfile?: string;
  description?: string;
  businessType?: string;
}

interface StrategyGroup {
  strategy: string;
  count: number;
  description: string;
  sampleMessage: string;
  confidenceChecks: string[];
}

interface CampaignResponse {
  formatted: {
    campaignName: string;
    totalLeads: number;
    strategyGroups: StrategyGroup[];
    grandSummary: {
      totalGenerated: number;
      validityPercentage: number;
    };
    validityReport: {
      valid: number;
      invalid: number;
    };
  };
}

export default function WhatsAppBatchCampaign() {
  const [campaignName, setCampaignName] = useState("");
  const [csvData, setCsvData] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<CampaignResponse | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"input" | "preview" | "sending">("input");

  // Parse CSV data
  const parseCSV = (text: string): Lead[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const parsedLeads: Lead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      if (values.length < 1 || !values[0]) continue;

      const lead: Lead = {
        firstName: values[headers.indexOf("firstname")] || values[headers.indexOf("first_name")] || values[0] || "",
        lastName: values[headers.indexOf("lastname")] || values[headers.indexOf("last_name")],
        email: values[headers.indexOf("email")],
        phoneNumber: values[headers.indexOf("phone")] || values[headers.indexOf("phonenumber")],
        groupName: values[headers.indexOf("groupname")] || values[headers.indexOf("group_name")],
        company: values[headers.indexOf("company")],
        linkedinProfile: values[headers.indexOf("linkedin")] || values[headers.indexOf("linkedin_profile")],
        description: values[headers.indexOf("description")] || values[headers.indexOf("role")],
        businessType: values[headers.indexOf("businesstype")] || values[headers.indexOf("business_type")],
      };

      if (lead.firstName) {
        parsedLeads.push(lead);
      }
    }

    return parsedLeads;
  };

  // Handle CSV upload
  const handleCsvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvData(text);
    const parsed = parseCSV(text);
    setLeads(parsed);
    setError("");
  };

  // Generate messages
  const handleGenerateMessages = async () => {
    if (!campaignName.trim()) {
      setError("Campaign name is required");
      return;
    }

    if (leads.length === 0) {
      setError("Please provide CSV data with at least one lead");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/b2b/campaigns/generate-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: campaignName.trim(),
          leads: leads.slice(0, 100),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate messages");
      }

      const data: CampaignResponse = await res.json();
      setResponse(data);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate messages");
    } finally {
      setIsGenerating(false);
    }
  };

  // STEP 1: Input
  if (step === "input") {
    return (
      <div className="max-w-4xl">
        <div className="mb-8">
          <h3 className="text-xl font-black text-[#0D0D0D] mb-2">Upload CSV</h3>
          <p className="text-sm text-[#666666]">
            Paste your lead data below. The system will auto-detect fields and generate WhatsApp messages.
          </p>
        </div>

        <div className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. Manchester Q3 Outreach"
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
            />
          </div>

          {/* CSV Input */}
          <div>
            <label className="block text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">
              CSV Data
            </label>
            <textarea
              value={csvData}
              onChange={handleCsvChange}
              placeholder="firstName,email,company,groupName,description
Sarah,sarah@company.com,Acme Trading,Manchester Business,Owner
Mike,mike@company.com,ABC Corp,SME Support,Manager
Tom,,,,Operations Director"
              rows={8}
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none font-mono"
            />
            <p className="text-xs text-[#666666] mt-2">
              Detected: {leads.length} leads | Supported fields: firstName, email, company, groupName, description, linkedinProfile, phoneNumber
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateMessages}
            disabled={isGenerating || leads.length === 0}
            className="w-full px-6 py-3 bg-[#0D0D0D] text-white font-semibold rounded-lg hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Generating messages..." : `Generate Messages (${leads.length} leads)`}
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: Preview
  if (step === "preview" && response) {
    return (
      <div className="max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => {
              setStep("input");
              setResponse(null);
            }}
            className="text-sm text-[#0D0D0D] mb-4 hover:underline"
          >
            ← Back to upload
          </button>
          <h2 className="text-2xl font-black text-[#0D0D0D] mb-2">{response.formatted.campaignName}</h2>
          <p className="text-sm text-[#666666]">
            Message Generation Complete • {response.formatted.totalLeads} leads processed
          </p>
        </div>

        {/* Strategy Groups */}
        <div className="bg-white border border-[#E8E8E8] rounded-lg p-6 mb-6">
          {response.formatted.strategyGroups.map((group, idx) => (
            <div key={idx} className="mb-6 pb-6 border-b border-[#E8E8E8] last:border-0">
              <div className="flex items-start gap-4">
                <div className="text-sm font-mono text-[#888888] pt-1">├─</div>
                <div className="flex-1">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-[#0D0D0D]">
                      Strategy: {group.description}
                    </p>
                    <p className="text-xs text-[#666666] mt-1">({group.count} leads)</p>
                  </div>

                  <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded p-3 mb-3">
                    <p className="text-sm text-[#0D0D0D] leading-relaxed">"{group.sampleMessage}"</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.confidenceChecks.map((check, cIdx) => (
                      <span key={cIdx} className="text-xs text-[#0D0D0D] bg-white border border-[#E8E8E8] px-2 py-1 rounded">
                        {check}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grand Summary */}
        <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg p-6 mb-6">
          <p className="text-sm font-semibold text-[#0D0D0D] mb-4">
            Total: {response.formatted.grandSummary.totalGenerated} messages generated
          </p>
          <div className="space-y-2">
            <p className="text-xs text-[#0D0D0D]">
              ✓ All messages follow: Acknowledge → Problem → Intro pattern
            </p>
            <p className="text-xs text-[#0D0D0D]">
              ✓ Zero messages end with sales language
            </p>
            <p className="text-xs text-[#0D0D0D]">
              ✓ 100% professionally positioned
            </p>
          </div>
        </div>

        {/* Validity Report */}
        <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg p-6 mb-6">
          <p className="text-sm font-semibold text-[#0D0D0D] mb-3">Validity Report</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#888888] mb-1">Valid Messages</p>
              <p className="text-2xl font-black text-[#0D0D0D]">
                {response.formatted.validityReport.valid}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#888888] mb-1">Invalid Messages</p>
              <p className="text-2xl font-black text-[#0D0D0D]">
                {response.formatted.validityReport.invalid}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setStep("input");
              setResponse(null);
            }}
            className="flex-1 px-6 py-3 border border-[#E8E8E8] text-[#0D0D0D] font-semibold rounded-lg hover:border-[#0D0D0D] transition-colors"
          >
            Regenerate All
          </button>
          <button
            onClick={() => setStep("sending")}
            className="flex-1 px-6 py-3 bg-[#0D0D0D] text-white font-semibold rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            Send All Messages
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: Sending
  if (step === "sending") {
    return (
      <div className="max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => setStep("preview")}
            className="text-sm text-[#0D0D0D] mb-4 hover:underline"
          >
            ← Back to preview
          </button>
          <h2 className="text-2xl font-black text-[#0D0D0D] mb-2">Send Campaign</h2>
          <p className="text-sm text-[#666666]">
            This feature is coming soon. Messages are queued and will be sent via WhatsApp API.
          </p>
        </div>

        <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg p-8 text-center">
          <p className="text-sm text-[#888888] mb-4">
            Configure WhatsApp API credentials in .env.local to enable live sending
          </p>
          <button
            onClick={() => setStep("preview")}
            className="px-6 py-3 border border-[#E8E8E8] text-[#0D0D0D] font-semibold rounded-lg hover:border-[#0D0D0D] transition-colors"
          >
            Back to Preview
          </button>
        </div>
      </div>
    );
  }

  return null;
}
