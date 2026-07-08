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

export default function CampaignsPage() {
  const [step, setStep] = useState<"upload" | "infer" | "campaign">("upload");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [businesses, setBusinesses] = useState<ParsedBusiness[]>([]);
  const [inferring, setInferring] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [selectedBusiness, setSelectedBusiness] = useState<ParsedBusiness | null>(null);
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
          parsed.push({
            name: values[nameIdx],
            email: values[emailIdx],
            description: descIdx >= 0 ? values[descIdx] : undefined,
            website: webIdx >= 0 ? values[webIdx] : undefined,
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
      setStep("campaign");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inference failed");
    } finally {
      setInferring(false);
    }
  };

  const generateEmail = (biz: ParsedBusiness) => {
    const cat = biz.category || "Other";
    const context = CATEGORY_CONTEXT[cat];
    const firstName = biz.contactName?.split(" ")[0] || "there";

    // Use source-based opening if available, otherwise fall back to generic
    let opening = CATEGORY_OPENING[cat];
    if (biz.source) {
      const sourceTemplate = SOURCE_OPENING_TEMPLATE[cat];
      opening = sourceTemplate.replace("{source}", biz.source);
    }

    const subject = "Hoping you could help";
    const body = `Hi ${firstName},

${opening}.

Quick question: for ${context}, does your firm stick with one local courier or have alternatives lined up?

Thanks,
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

      {/* Step 3: Campaign - Preview & Send */}
      {step === "campaign" && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm p-4 rounded">
            {businesses.filter((b) => b.leadId).length}/{businesses.length} emails sent
          </div>

          <div className="grid gap-4">
            {businesses.map((biz) => {
              const email = generateEmail(biz);
              const isSent = !!biz.leadId;

              return (
                <div
                  key={biz.email}
                  className="border border-[#E8E8E8] rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-[#0D0D0D]">
                        {biz.name}
                      </p>
                      <p className="text-xs text-[#888888]">{biz.email}</p>
                      <p className="text-xs text-[#888888] mt-1">
                        {biz.category || "Unknown"}
                      </p>
                    </div>

                    {isSent ? (
                      <div className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded">
                        ✓ Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedBusiness(biz)}
                        className="text-sm font-semibold text-white bg-[#0D0D0D] hover:bg-[#333333] px-4 py-2 rounded transition-colors"
                      >
                        Preview & Send
                      </button>
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
