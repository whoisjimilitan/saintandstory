"use client";

import { useState, useRef } from "react";

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
  companySize?: "small" | "medium" | "enterprise";
  channel?: "whatsapp" | "email" | "phone";
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

interface WhatsAppBatchCampaignProps {
  channel?: "email" | "whatsapp";
  onCampaignCreated?: () => void;
}

export default function WhatsAppBatchCampaign({
  channel = "whatsapp",
  onCampaignCreated
}: WhatsAppBatchCampaignProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<CampaignResponse | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);


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

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setIsGenerating(true);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        setError("No valid leads found in file");
        setIsGenerating(false);
        return;
      }

      setLeads(parsed);

      // Auto-generate messages immediately
      const campaignName = file.name.replace(/\.[^/.]+$/, "");
      await generateMessages(parsed, campaignName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
      setIsGenerating(false);
    }
  };

  // Generate messages
  const generateMessages = async (parsedLeads: Lead[], campaignName: string) => {
    try {
      const res = await fetch("/api/b2b/campaigns/generate-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: campaignName.trim(),
          channel: channel,
          leads: parsedLeads.slice(0, 100),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate messages");
      }

      const data: CampaignResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate messages");
    } finally {
      setIsGenerating(false);
    }
  };

  // Upload new file
  const handleUploadNew = () => {
    setResponse(null);
    setLeads([]);
    setFileName("");
    setError("");
    fileInputRef.current?.click();
  };

  // No file uploaded yet - show upload interface
  if (!response && leads.length === 0) {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <h3 className="text-xl font-black text-[#0D0D0D] mb-2">Upload Lead File</h3>
          <p className="text-sm text-[#666666]">
            Upload CSV, Excel, or Google Sheets export. System auto-detects fields and generates messages instantly.
          </p>
        </div>

        {isGenerating ? (
          <div className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-12 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-[#666666]">Processing file...</p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-12 text-center hover:border-[#0D0D0D] transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-4">
              <p className="text-3xl mb-2">📄</p>
            </div>
            <p className="text-sm font-semibold text-[#0D0D0D] mb-2">
              Drag file here or click to browse
            </p>
            <p className="text-xs text-[#888888]">
              Supports: CSV, XLSX, XLS
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isGenerating}
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-900 mb-2">Error</p>
            <p className="text-sm text-red-800 mb-4">{error}</p>
            <button
              onClick={() => {
                setError("");
                setLeads([]);
                setFileName("");
                fileInputRef.current?.click();
              }}
              className="text-sm font-semibold text-red-700 hover:text-red-900 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show error state if anything failed
  if (error) {
    return (
      <div className="max-w-2xl">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-900 mb-2">Error Processing Campaign</p>
          <p className="text-sm text-red-800 mb-4">{error}</p>
          <button
            onClick={() => {
              setError("");
              setLeads([]);
              setFileName("");
              setResponse(null);
              setCampaignId(null);
              fileInputRef.current?.click();
            }}
            className="px-4 py-2 bg-red-700 text-white rounded text-sm font-semibold hover:bg-red-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Messages generated - show results
  if (response) {
    return (
      <div className="max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-[#0D0D0D] mb-2">
            {fileName}
          </h2>
          <p className="text-sm text-[#666666] mb-4">
            ✓ Generated {response.formatted.totalLeads} messages
          </p>
          <button
            onClick={handleUploadNew}
            className="text-sm text-[#0D0D0D] hover:underline"
          >
            ← Upload another file
          </button>
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
                      {group.description}
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
            Total: {response.formatted.grandSummary.totalGenerated} messages ready to send
          </p>
          <div className="space-y-2 mb-4">
            <p className="text-xs text-[#0D0D0D]">
              ✓ All messages follow psychology framework
            </p>
            <p className="text-xs text-[#0D0D0D]">
              ✓ {response.formatted.validityReport.valid} valid • {response.formatted.validityReport.invalid} invalid
            </p>
          </div>

          {/* Channel Info */}
          <div className="border-t border-[#E8E8E8] pt-4">
            <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-3">Sending Via</p>
            <div className="p-3 bg-white border border-[#E8E8E8] rounded">
              <p className="text-xs text-[#888888] mb-1">{channel === "email" ? "Email Campaign" : "WhatsApp Campaign"}</p>
              <p className="text-lg font-black text-[#0D0D0D]">{leads.length}</p>
              <p className="text-xs text-[#666666] mt-1">{channel === "email" ? "leads queued for email" : "leads queued for WhatsApp"}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!campaignId ? (
          <button
            onClick={async () => {
              setIsCreatingCampaign(true);
              try {
                const res = await fetch("/api/b2b/campaigns/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    campaignName: fileName,
                    channel: channel,
                    leads: leads.map(l => ({
                      businessName: l.company,
                      email: l.email,
                      phone: l.phoneNumber,
                      firstName: l.firstName,
                      companySize: l.companySize,
                    })),
                  }),
                });

                if (res.ok) {
                  const data = await res.json();
                  setCampaignId(data.campaignId);
                } else {
                  setError("Failed to create campaign");
                }
              } catch (err) {
                setError("Failed to create campaign");
              } finally {
                setIsCreatingCampaign(false);
              }
            }}
            disabled={isCreatingCampaign}
            className="w-full px-6 py-3 bg-[#0D0D0D] text-white font-semibold rounded-lg hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreatingCampaign ? "Creating Campaign..." : "Create Campaign"}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="p-6 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg text-center">
              <p className="text-2xl mb-2">✓</p>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-2">Campaign Created</p>
              <p className="text-xs text-[#666666]">
                {leads.length} leads queued for {channel === "email" ? "email" : "WhatsApp"} outreach
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUploadNew}
                className="flex-1 px-6 py-3 border border-[#E8E8E8] text-[#0D0D0D] font-semibold rounded-lg hover:border-[#0D0D0D] transition-colors"
              >
                Upload Another
              </button>
              <button
                onClick={() => {
                  onCampaignCreated?.();
                }}
                className="flex-1 px-6 py-3 bg-[#0D0D0D] text-white font-semibold rounded-lg hover:bg-[#1A1A1A] transition-colors"
              >
                View Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
