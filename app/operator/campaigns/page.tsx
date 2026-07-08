"use client";

import { useState } from "react";
import Link from "next/link";
import { SimpleEmailModal } from "./simple-email-modal";

interface ParsedBusiness {
  name: string;
  email: string;
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

export default function CampaignsPage() {
  const [step, setStep] = useState<"upload" | "infer" | "validate" | "campaign">("upload");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [businesses, setBusinesses] = useState<ValidatedBusiness[]>([]);
  const [inferring, setInferring] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [error, setError] = useState("");

  // Modal state
  const [selectedBusiness, setSelectedBusiness] = useState<ValidatedBusiness | null>(null);
  const [sending, setSending] = useState(false);

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

      if (nameIdx === -1 || emailIdx === -1) {
        throw new Error("CSV must have 'name' and 'email' columns");
      }

      const parsed: ParsedBusiness[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values[nameIdx] && values[emailIdx]) {
          // Extract email or generate from name + domain
          let email = values[emailIdx];
          const website = webIdx >= 0 ? values[webIdx] : undefined;

          // If email is missing but we have website, try to generate it
          if (!email && website) {
            try {
              const url = new URL(website);
              const domain = url.hostname;
              const firstName = values[nameIdx]?.split(" ")[0]?.toLowerCase() || "";
              const lastName = values[nameIdx]?.split(" ")[1]?.toLowerCase() || "";
              // Try firstname.lastname@domain first, then firstname@domain
              email = lastName ? `${firstName}.${lastName}@${domain}` : `${firstName}@${domain}`;
            } catch (e) {
              email = values[emailIdx];
            }
          }

          parsed.push({
            name: values[nameIdx],
            email: email || values[emailIdx],
            description: descIdx >= 0 ? values[descIdx] : undefined,
            website: website,
            contactName: contactIdx >= 0 ? values[contactIdx] : undefined,
            source: sourceIdx >= 0 ? values[sourceIdx] : undefined,
          });
        }
      }

      if (parsed.length === 0) {
        throw new Error("No valid rows found");
      }

      setBusinesses(parsed);
      setStep("infer");
      setCsvFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed");
    } finally {
      setUploading(false);
    }
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

      for (let i = 0; i < businesses.length; i++) {
        const biz = businesses[i];

        try {
          // Build CSV with single row for validation
          const csv = `name,email,description,website,contact_name\n"${biz.name}","${biz.email}","${biz.description || ""}","${biz.website || ""}","${biz.contactName || ""}"`;

          // Send to verifier
          const formData = new FormData();
          const blob = new Blob([csv], { type: "text/csv" });
          formData.append("file", blob, `${biz.name}.csv`);

          const res = await fetch("http://localhost:5050/verify", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            validated.push({ ...biz, validationStatus: "risky", validationReason: "Verifier unreachable" });
            setValidationProgress(Math.round(((i + 1) / businesses.length) * 100));
            continue;
          }

          const data = await res.json();
          const jobId = data.job_id;

          // Poll until complete
          let percent = 0;
          let result: any = null;
          while (percent < 100) {
            await new Promise((r) => setTimeout(r, 300));
            const progressRes = await fetch(`http://localhost:5050/progress?job_id=${jobId}`);
            const progressData = await progressRes.json();
            percent = progressData.percent;

            if (percent >= 100) {
              // Get results
              const downloadRes = await fetch(`http://localhost:5050/download?job_id=${jobId}&type=all`);
              const csvResult = await downloadRes.text();
              const lines = csvResult.split("\n");
              if (lines.length > 1) {
                const resultLine = lines[1];
                const resultValues = resultLine.split(",");
                const status = resultValues[resultValues.length - 2];
                const reason = resultValues[resultValues.length - 1];
                validated.push({
                  ...biz,
                  validationStatus: status as "valid" | "risky" | "invalid",
                  validationReason: reason?.replace(/"/g, ""),
                });
              }
            }
          }

          setValidationProgress(Math.round(((i + 1) / businesses.length) * 100));
        } catch (err) {
          validated.push({ ...biz, validationStatus: "risky", validationReason: "Validation error" });
          setValidationProgress(Math.round(((i + 1) / businesses.length) * 100));
        }
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
          b.email === selectedBusiness.email ? { ...b, leadId } : b
        )
      );

      setSelectedBusiness(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-[#0D0D0D] mb-2">
          Simple Email Campaigns
        </h1>
        <p className="text-sm text-[#888888]">
          Upload businesses, infer categories, preview emails, send.
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
              Format: name, email, description (optional), website (optional), contact_name (optional), source (optional)<br/>
              <span className="text-[#AAAAAA]">Source examples: LinkedIn, Solicitors Advice UK, Google Maps, Industry Directory</span>
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

      {/* Step 2: Infer Categories */}
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-2xl font-black text-green-600">
                {businesses.filter((b) => b.validationStatus === "valid").length}
              </p>
              <p className="text-xs text-green-700 mt-1">Valid emails</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-2xl font-black text-yellow-600">
                {businesses.filter((b) => b.validationStatus === "risky").length}
              </p>
              <p className="text-xs text-yellow-700 mt-1">Risky emails</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-2xl font-black text-red-600">
                {businesses.filter((b) => b.validationStatus === "invalid").length}
              </p>
              <p className="text-xs text-red-700 mt-1">Invalid emails</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm p-4 rounded">
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
                      ? "border-red-200 bg-red-50/30 opacity-60"
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
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            statusColor === "green"
                              ? "bg-green-100 text-green-700"
                              : statusColor === "yellow"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {biz.validationStatus === "valid"
                            ? "✓ Valid"
                            : biz.validationStatus === "risky"
                            ? "⚠ Risky"
                            : "✗ Invalid"}
                        </span>
                        {biz.validationReason && (
                          <span className="text-xs text-[#888888]">
                            {biz.validationReason}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSent ? (
                      <div className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded">
                        ✓ Sent
                      </div>
                    ) : biz.validationStatus === "valid" ? (
                      <button
                        onClick={() => setSelectedBusiness(biz)}
                        className="text-sm font-semibold text-white bg-[#0D0D0D] hover:bg-[#333333] px-4 py-2 rounded transition-colors"
                      >
                        Preview & Send
                      </button>
                    ) : (
                      <div className="text-xs font-semibold text-[#888888] px-3 py-1 rounded border border-[#E8E8E8]">
                        Cannot send
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep("upload");
                setBusinesses([]);
                setCsvFile(null);
              }}
              className="flex-1 border border-[#E8E8E8] text-[#0D0D0D] font-semibold py-3 rounded hover:border-[#0D0D0D]"
            >
              New Campaign
            </button>
            <Link
              href="/operator"
              className="flex-1 text-center bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3 rounded transition-colors"
            >
              Done
            </Link>
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
