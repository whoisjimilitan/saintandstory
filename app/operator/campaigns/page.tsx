"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SimpleEmailModal } from "./simple-email-modal";

interface ParsedBusiness {
  name: string;
  email: string;
  emailCandidates?: string[];
  description?: string;
  website?: string;
  category?: string;
  contactName?: string;
  source?: string;
  leadId?: string;
}

const CATEGORY_OPENING: Record<string, string> = {
  Legal: "I was researching medium-sized legal practices handling court deadlines",
  Healthcare: "I was researching healthcare practices managing urgent deliveries",
  "Estate Agents": "I was researching estate agents handling property completions",
  Accounting: "I was researching accounting firms managing tax deadlines",
  Construction: "I was researching construction companies managing site deadlines",
  Hospitality: "I was researching hospitality businesses managing supplier deliveries",
  Retail: "I was researching retail businesses managing stock deliveries",
  Beauty: "I was researching beauty businesses managing product deliveries",
  Veterinary: "I was researching veterinary practices managing urgent supplies",
  Dental: "I was researching dental practices managing lab work and supplies",
  Manufacturing: "I was researching manufacturing businesses managing parts delivery",
  "Film/Production": "I was researching production companies managing equipment delivery",
  "Office Supplies": "I was researching businesses managing urgent office supply needs",
  Architecture: "I was researching architecture firms managing plan delivery",
  Catering: "I was researching catering businesses managing event deliveries",
  "Property/Lettings": "I was researching property firms managing key and document delivery",
  "Art/Auction": "I was researching art galleries managing artwork delivery",
  Other: "I was researching businesses in your industry",
};

const CATEGORY_CONTEXT: Record<string, string> = {
  Legal: "time-critical court documents",
  Healthcare: "urgent medical supplies",
  "Estate Agents": "property completion documents",
  Accounting: "tax deadlines",
  Construction: "site materials",
  Hospitality: "supplier deliveries",
  Retail: "stock deliveries",
  Beauty: "product deliveries",
  Veterinary: "urgent supplies",
  Dental: "lab work",
  Manufacturing: "parts delivery",
  "Film/Production": "equipment delivery",
  "Office Supplies": "office supply needs",
  Architecture: "plans delivery",
  Catering: "event deliveries",
  "Property/Lettings": "key delivery",
  "Art/Auction": "artwork delivery",
  Other: "urgent deliveries",
};

// Consequence statements by category (what fails when delivery is late)
const CONSEQUENCE_MAP: Record<string, string> = {
  Legal: "One late delivery on a critical filing.\nYour case is dismissed.",
  Healthcare: "One late delivery on urgent supplies.\nPatient care is delayed.",
  "Estate Agents": "One late delivery on completion day.\nThe deal falls through.",
  Accounting: "One late delivery on tax documents.\nDeadline is missed.",
  Construction: "One late delivery on site materials.\nConstruction stops.",
  Hospitality: "One late delivery on supplier goods.\nService is affected.",
  Retail: "One late delivery on stock.\nSales are lost.",
  Beauty: "One late delivery on products.\nAppointments are cancelled.",
  Veterinary: "One late delivery on emergency supplies.\nTreatment is delayed.",
  Dental: "One late delivery on lab work.\nPatient appointments slip.",
  Manufacturing: "One late delivery on parts.\nProduction halts.",
  "Film/Production": "One late delivery on equipment.\nShooting is delayed.",
  "Office Supplies": "One late delivery on urgent supplies.\nOperations stall.",
  Architecture: "One late delivery on plans.\nDeadline is missed.",
  Catering: "One late delivery on event supplies.\nEvent is compromised.",
  "Property/Lettings": "One late delivery on documents.\nTransaction delays.",
  "Art/Auction": "One late delivery on artwork.\nAuction is affected.",
  Other: "One late delivery on critical items.\nOperations are impacted.",
};

// Source-based openings (when source/location is provided)
const SOURCE_OPENING_TEMPLATE: Record<string, string> = {
  Legal: "I noticed your practice in {source} and thought your insight might help",
  Healthcare: "I came across your clinic in {source} while researching urgent care solutions",
  "Estate Agents": "I noticed your agency in {source} while looking into completion management",
  Accounting: "I came across your firm in {source} while researching tax deadline solutions",
  Construction: "I noticed your company in {source} while looking into site logistics",
  Hospitality: "I came across your business in {source} while researching supply chain solutions",
  Retail: "I noticed your business in {source} while looking into stock management",
  Beauty: "I came across your salon in {source} while researching supply chains",
  Veterinary: "I noticed your practice in {source} while researching emergency supplies",
  Dental: "I came across your practice in {source} while looking into lab turnaround",
  Manufacturing: "I noticed your company in {source} while researching parts delivery",
  "Film/Production": "I came across your company in {source} while researching production logistics",
  "Office Supplies": "I noticed your business in {source} while looking into supply urgency",
  Architecture: "I came across your firm in {source} while researching plan delivery",
  Catering: "I noticed your business in {source} while researching event logistics",
  "Property/Lettings": "I came across your firm in {source} while looking into administration",
  "Art/Auction": "I noticed your gallery in {source} while researching art logistics",
  Other: "I came across your business in {source} and thought it worth reaching out",
};

interface ValidationResult {
  status: "valid" | "risky" | "invalid";
  reason: string;
}

interface ValidatedBusiness extends ParsedBusiness {
  validationStatus?: "valid" | "risky" | "invalid";
  validationReason?: string;
}

interface DailyLimit {
  limit: number;
  sentToday: number;
  queuedToday: number;
  totalUsed: number;
  remaining: number;
  percentUsed: number;
  canSend: boolean;
}

export default function CampaignsPage() {
  const [step, setStep] = useState<"upload" | "generate" | "infer" | "validate" | "campaign">("upload");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [businesses, setBusinesses] = useState<ValidatedBusiness[]>([]);
  const [inferring, setInferring] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [error, setError] = useState("");
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);

  // Modal state
  const [selectedBusiness, setSelectedBusiness] = useState<ValidatedBusiness | null>(null);
  const [sending, setSending] = useState(false);
  const [batchSending, setBatchSending] = useState(false);

  // Fetch daily limit on mount and periodically
  const fetchDailyLimit = async () => {
    try {
      const res = await fetch("/api/operator/campaigns/daily-limit");
      if (res.ok) {
        const data = await res.json();
        setDailyLimit(data);
      }
    } catch (err) {
      console.error("Failed to fetch daily limit:", err);
    }
  };

  useEffect(() => {
    fetchDailyLimit();
    const interval = setInterval(fetchDailyLimit, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setError("Select a CSV file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const text = await csvFile.text();
      const lines = text.split("\n").filter((l) => l.trim());

      if (lines.length < 2) {
        throw new Error("CSV must have header + at least 1 row");
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name");
      const emailIdx = headers.indexOf("email");
      const descIdx = headers.indexOf("description");
      const webIdx = headers.indexOf("website");
      const contactIdx = headers.indexOf("contact_name");
      const sourceIdx = headers.indexOf("source");

      if (nameIdx === -1) {
        throw new Error("CSV must have 'name' column");
      }

      const generateEmailCandidates = (businessName: string, domain: string): string[] => {
        const parts = businessName.toLowerCase().split(/\s+/).filter(p => p.length > 0);
        const candidates: string[] = [];

        if (parts.length >= 2) {
          // firstname.lastname@domain
          candidates.push(`${parts[0]}.${parts[parts.length - 1]}@${domain}`);
          // first.initial.lastname@domain
          candidates.push(`${parts[0]}.${parts[1].charAt(0)}.${parts[parts.length - 1]}@${domain}`);
        }

        // firstname@domain
        candidates.push(`${parts[0]}@${domain}`);

        return candidates;
      };

      const parsed: ParsedBusiness[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const name = values[nameIdx];
        const providedEmail = emailIdx >= 0 ? values[emailIdx] : undefined;
        const website = webIdx >= 0 ? values[webIdx] : undefined;

        if (!name) continue;

        let email = providedEmail;
        let candidates: string[] = [];

        // If no email provided but we have website, generate candidates
        if (!email && website) {
          try {
            const url = new URL(website.startsWith("http") ? website : `https://${website}`);
            const domain = url.hostname;
            candidates = generateEmailCandidates(name, domain);
            email = candidates[0]; // Use first candidate as primary
          } catch (e) {
            // Invalid website, skip this row
            continue;
          }
        } else if (email) {
          candidates = [email];
        }

        if (email) {
          parsed.push({
            name: name,
            email: email,
            emailCandidates: candidates,
            description: descIdx >= 0 ? values[descIdx] : undefined,
            website: website,
            contactName: contactIdx >= 0 ? values[contactIdx] : undefined,
            source: sourceIdx >= 0 ? values[sourceIdx] : undefined,
          });
        }
      }

      if (parsed.length === 0) {
        throw new Error("No valid rows found (need 'name' and 'website' columns)");
      }

      setBusinesses(parsed);
      setStep("generate");
      setCsvFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateEmails = () => {
    setError("");
    // User reviews generated emails and proceeds to category inference
    setStep("infer");
  };

  const handleInferCategories = async () => {
    setInferring(true);
    setError("");

    try {
      const updated: ParsedBusiness[] = [];

      for (const biz of businesses) {
        try {
          const res = await fetch("/api/operator/campaigns/infer-category", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessName: biz.name,
              description: biz.description,
              website: biz.website,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            updated.push({ ...biz, category: data.category });
          } else {
            updated.push({ ...biz, category: "Other" });
          }
        } catch {
          updated.push({ ...biz, category: "Other" });
        }
      }

      setBusinesses(updated);
      setStep("validate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inference failed");
    } finally {
      setInferring(false);
    }
  };

  const handleValidateEmails = async () => {
    setValidating(true);
    setError("");
    setValidationProgress(0);

    try {
      const validated: ValidatedBusiness[] = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      for (let i = 0; i < businesses.length; i++) {
        const biz = businesses[i];
        const email = biz.email?.trim() || "";

        // Quick syntax check
        if (!emailRegex.test(email)) {
          validated.push({ ...biz, validationStatus: "invalid", validationReason: "Invalid syntax" });
          setValidationProgress(Math.round(((i + 1) / businesses.length) * 100));
          continue;
        }

        // Extract domain
        const domain = email.split("@")[1];

        // Quick MX check via API (lightweight)
        try {
          const mxRes = await fetch(`/api/operator/campaigns/check-mx?domain=${encodeURIComponent(domain)}`);
          if (mxRes.ok) {
            const mxData = await mxRes.json();
            if (mxData.hasMX) {
              validated.push({ ...biz, validationStatus: "valid", validationReason: "MX verified" });
            } else {
              validated.push({ ...biz, validationStatus: "invalid", validationReason: "No MX record" });
            }
          } else {
            validated.push({ ...biz, validationStatus: "valid", validationReason: "Syntax OK" });
          }
        } catch {
          validated.push({ ...biz, validationStatus: "valid", validationReason: "Syntax OK" });
        }

        setValidationProgress(Math.round(((i + 1) / businesses.length) * 100));
      }

      setBusinesses(validated);
      setStep("campaign");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setValidating(false);
    }
  };

  const generateEmail = (biz: ParsedBusiness) => {
    const cat = biz.category || "Other";
    const consequence = CONSEQUENCE_MAP[cat];
    const firstName = biz.contactName?.split(" ")[0] || "there";

    const subject = "Hoping you could help";
    const body = `Apologies. I know it's a little unusual emailing out of the blue.

I was researching medium-sized ${cat.toLowerCase()} practices handling time-sensitive documents because we built Saint & Story specifically for firms like yours who are vulnerable to one single point of failure: delivery.

${consequence}

Quick question: does your firm stick with one local courier or have alternatives lined up?

James`;

    return { subject, body };
  };

  const handleSendEmail = async (subject: string, body: string) => {
    if (!selectedBusiness) return;

    setSending(true);
    setError("");

    try {
      // First, save/update lead in database with category and source
      const leadResponse = await fetch("/api/b2b/leads/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: selectedBusiness.name,
          email: selectedBusiness.email,
          businessCategory: selectedBusiness.category,
          contactName: selectedBusiness.contactName,
          website: selectedBusiness.website,
          source: selectedBusiness.source,
        }),
      });

      if (!leadResponse.ok) {
        throw new Error("Failed to save lead");
      }

      const leadData = await leadResponse.json();
      const leadId = leadData.id;

      if (!leadId) {
        throw new Error("No lead ID returned");
      }

      // Then send email
      const sendRes = await fetch("/api/operator/campaigns/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          subject,
          body,
          category: selectedBusiness.category,
        }),
      });

      if (!sendRes.ok) {
        throw new Error("Failed to send email");
      }

      // Mark as sent in UI
      setBusinesses(
        businesses.map((b) =>
          b.email === selectedBusiness.email ? { ...b, leadId: "sent" } : b
        )
      );

      setSelectedBusiness(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  const handleBatchSend = async () => {
    setBatchSending(true);
    setError("");

    try {
      const validBusinesses = businesses.filter((b) => b.validationStatus === "valid" && !b.leadId);

      const res = await fetch("/api/operator/campaigns/batch-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businesses: validBusinesses }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 429) {
          // Daily limit exceeded
          setError(`❌ Daily limit reached: ${errorData.details}`);
          await fetchDailyLimit(); // Refresh limit status
        } else {
          setError(errorData.error || "Batch send failed");
        }
        return;
      }

      const data = await res.json();
      await fetchDailyLimit(); // Refresh limit after successful send

      // Only mark successfully sent emails as sent
      const sentEmails = new Set(
        data.details.filter((d: any) => d.status === "sent").map((d: any) => d.email)
      );

      setBusinesses(
        businesses.map((b) =>
          sentEmails.has(b.email) ? { ...b, leadId: "sent" } : b
        )
      );

      if (data.sent > 0) {
        setError(`Sent ${data.sent} emails (${data.failed} failed)`);
      } else {
        setError(`Failed to send emails. Check Resend API key.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch send failed");
    } finally {
      setBatchSending(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-[#0D0D0D] mb-2">
          Simple Email Campaigns
        </h1>
        <p className="text-sm text-[#888888]">
          Upload CSV with name + website → generate emails → infer categories → validate → send.
        </p>
      </div>

      {/* Step 1: Upload CSV */}
      {step === "upload" && (
        <div className="border border-[#E8E8E8] rounded-lg p-8 space-y-6">
          <div>
            <label className="text-sm font-semibold text-[#0D0D0D] block mb-2">
              Upload CSV
            </label>
            <p className="text-xs text-[#888888] mb-4">
              Format: name, website, description (optional), email (optional), contact_name (optional), source (optional)<br/>
              <span className="text-[#AAAAAA]">If email missing, we'll generate candidates from name + domain. Source examples: LinkedIn, Solicitors Advice UK, Google Maps, Industry Directory</span>
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="w-full border border-[#E8E8E8] rounded p-3 text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleCsvUpload}
            disabled={uploading || !csvFile}
            className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-50 text-white font-semibold py-3 rounded transition-colors"
          >
            {uploading ? "Uploading..." : "Upload & Parse"}
          </button>
        </div>
      )}

      {/* Step 2: Generate & Review Emails */}
      {step === "generate" && (
        <div className="border border-[#E8E8E8] rounded-lg p-8 space-y-6">
          <div>
            <p className="text-sm font-semibold text-[#0D0D0D] mb-4">
              {businesses.length} businesses — review generated emails
            </p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {businesses.map((b) => (
                <div
                  key={b.email}
                  className="text-xs p-3 bg-[#F5F5F5] rounded border border-[#E8E8E8]"
                >
                  <p className="font-semibold text-[#0D0D0D] mb-1">{b.name}</p>
                  <p className="text-[#0D0D0D] mb-2"><strong>Email:</strong> {b.email}</p>
                  {b.emailCandidates && b.emailCandidates.length > 1 && (
                    <p className="text-[#888888]">Candidates: {b.emailCandidates.join(", ")}</p>
                  )}
                  {b.website && <p className="text-[#888888]">Domain: {b.website}</p>}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep("upload");
                setBusinesses([]);
              }}
              className="flex-1 border border-[#E8E8E8] text-[#0D0D0D] font-semibold py-3 rounded hover:border-[#0D0D0D]"
            >
              Back
            </button>
            <button
              onClick={handleGenerateEmails}
              className="flex-1 bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3 rounded"
            >
              Continue to Categories
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Infer Categories */}
      {step === "infer" && (
        <div className="border border-[#E8E8E8] rounded-lg p-8 space-y-6">
          <div>
            <p className="text-sm font-semibold text-[#0D0D0D] mb-4">
              {businesses.length} businesses loaded
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {businesses.map((b) => (
                <div
                  key={b.email}
                  className="text-xs p-2 bg-[#F5F5F5] rounded border border-[#E8E8E8]"
                >
                  <p className="font-semibold text-[#0D0D0D]">{b.name}</p>
                  <p className="text-[#888888]">{b.email}</p>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep("upload");
                setBusinesses([]);
              }}
              disabled={inferring}
              className="flex-1 border border-[#E8E8E8] text-[#0D0D0D] font-semibold py-3 rounded hover:border-[#0D0D0D] disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleInferCategories}
              disabled={inferring}
              className="flex-1 bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3 rounded disabled:opacity-50"
            >
              {inferring ? "Inferring..." : "Infer Categories"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Validate Emails */}
      {step === "validate" && (
        <div className="border border-[#E8E8E8] rounded-lg p-8 space-y-6">
          <div>
            <p className="text-sm font-semibold text-[#0D0D0D] mb-4">
              Validating {businesses.length} email addresses...
            </p>
            <div className="w-full bg-[#E8E8E8] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#0D0D0D] h-full transition-all duration-300"
                style={{ width: `${validationProgress}%` }}
              />
            </div>
            <p className="text-xs text-[#888888] mt-2">{validationProgress}%</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep("upload");
                setBusinesses([]);
              }}
              disabled={validating}
              className="flex-1 border border-[#E8E8E8] text-[#0D0D0D] font-semibold py-3 rounded hover:border-[#0D0D0D] disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleValidateEmails}
              disabled={validating}
              className="flex-1 bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3 rounded disabled:opacity-50"
            >
              {validating ? "Validating..." : "Start Validation"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Campaign - Preview & Send */}
      {step === "campaign" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg p-4">
              <p className="text-2xl font-black text-[#0D0D0D]">
                {businesses.filter((b) => b.validationStatus === "valid").length}
              </p>
              <p className="text-xs text-[#888888] mt-1">Valid emails</p>
            </div>
            <div className="bg-[#FAFAFA] border border-[#E8E8E8] rounded-lg p-4">
              <p className="text-2xl font-black text-[#666666]">
                {businesses.filter((b) => b.validationStatus === "risky").length}
              </p>
              <p className="text-xs text-[#888888] mt-1">Risky emails</p>
            </div>
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg p-4">
              <p className="text-2xl font-black text-[#AAAAAA]">
                {businesses.filter((b) => b.validationStatus === "invalid").length}
              </p>
              <p className="text-xs text-[#888888] mt-1">Invalid emails</p>
            </div>
          </div>

          <div className="bg-[#F5F5F5] border border-[#E8E8E8] text-[#666666] text-sm p-4 rounded">
            {businesses.filter((b) => b.leadId).length}/{businesses.filter((b) => b.validationStatus === "valid").length} valid emails sent
          </div>

          <div className="grid gap-4">
            {businesses.map((biz) => {
              const email = generateEmail(biz);
              const isSent = !!biz.leadId;
              const statusColor = {
                valid: "green",
                risky: "yellow",
                invalid: "red",
              }[biz.validationStatus || "risky"];

              return (
                <div
                  key={biz.email}
                  className={`border rounded-lg p-4 ${
                    biz.validationStatus === "invalid"
                      ? "border-[#E8E8E8] bg-[#FAFAFA] opacity-50"
                      : "border-[#E8E8E8]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-[#0D0D0D]">
                        {biz.name}
                      </p>
                      <p className="text-xs text-[#888888]">{biz.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs text-[#888888] bg-[#F5F5F5] px-2 py-1 rounded">
                          {biz.category || "Unknown"}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded border ${
                            statusColor === "green"
                              ? "bg-[#F5F5F5] text-[#0D0D0D] border-[#E8E8E8]"
                              : statusColor === "yellow"
                              ? "bg-[#FAFAFA] text-[#666666] border-[#E8E8E8]"
                              : "bg-[#F5F5F5] text-[#AAAAAA] border-[#E8E8E8]"
                          }`}
                        >
                          {biz.validationStatus === "valid"
                            ? "Valid"
                            : biz.validationStatus === "risky"
                            ? "Risky"
                            : "Invalid"}
                        </span>
                        {biz.validationReason && (
                          <span className="text-xs text-[#888888]">
                            {biz.validationReason}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSent ? (
                      <div className="text-xs font-medium text-[#666666] bg-[#F5F5F5] px-3 py-1 rounded border border-[#E8E8E8]">
                        Sent
                      </div>
                    ) : biz.validationStatus === "valid" ? (
                      <button
                        onClick={() => setSelectedBusiness(biz)}
                        className="text-sm font-semibold text-white bg-[#0D0D0D] hover:bg-[#333333] px-4 py-2 rounded transition-colors"
                      >
                        Preview & Send
                      </button>
                    ) : (
                      <div className="text-xs font-medium text-[#AAAAAA] px-3 py-1 rounded border border-[#E8E8E8]">
                        Cannot send
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className={`text-sm p-4 rounded border ${
              error.startsWith("✓")
                ? "bg-[#F5F5F5] border-[#E8E8E8] text-[#0D0D0D]"
                : "bg-[#FAFAFA] border-[#E8E8E8] text-[#666666]"
            }`}>
              {error.replace("✓ ", "")}
            </div>
          )}

          {/* Daily Limit Warning */}
          {dailyLimit && (
            <div className={`p-4 rounded mb-4 ${dailyLimit.remaining === 0 ? 'bg-[#F5F5F5] border border-[#0D0D0D]' : 'bg-[#F9F9F9] border border-[#E8E8E8]'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    Daily email limit
                  </p>
                  <p className="text-xs text-[#666666] mt-1">
                    {dailyLimit.sentToday} sent + {dailyLimit.queuedToday} queued = {dailyLimit.totalUsed}/{dailyLimit.limit} ({dailyLimit.percentUsed}%)
                  </p>
                  <p className="text-xs text-[#0D0D0D] font-semibold mt-1">
                    {dailyLimit.remaining > 0 ? `${dailyLimit.remaining} emails remaining today` : 'No emails can be sent today'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0D0D0D]">{dailyLimit.remaining}</p>
                  <p className="text-xs text-[#666666]">remaining</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep("upload");
                setBusinesses([]);
                setCsvFile(null);
              }}
              disabled={batchSending}
              className="flex-1 border border-[#E8E8E8] text-[#0D0D0D] font-semibold py-3 rounded hover:border-[#0D0D0D] disabled:opacity-50"
            >
              New Campaign
            </button>
            <button
              onClick={handleBatchSend}
              disabled={batchSending || businesses.filter((b) => b.validationStatus === "valid" && !b.leadId).length === 0 || (dailyLimit && dailyLimit.remaining <= 0)}
              className="flex-1 bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3 rounded transition-colors disabled:opacity-50"
              title={dailyLimit && dailyLimit.remaining <= 0 ? "Daily email limit reached. Resend allows 100 emails per day." : ""}
            >
              {batchSending ? "Sending..." : `Send All (${businesses.filter((b) => b.validationStatus === "valid" && !b.leadId).length})`}
            </button>
          </div>
        </div>
      )}

      {/* Email Edit Modal */}
      {selectedBusiness && (
        <SimpleEmailModal
          isOpen={!!selectedBusiness}
          business={selectedBusiness}
          initialSubject={generateEmail(selectedBusiness).subject}
          initialBody={generateEmail(selectedBusiness).body}
          onClose={() => setSelectedBusiness(null)}
          onSend={handleSendEmail}
          sending={sending}
        />
      )}
    </div>
  );
}
