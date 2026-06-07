"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { B2B_INDUSTRIES } from "@/lib/b2b-industries";
import { DELIVERY_TYPES } from "@/lib/delivery-types";
import { DELIVERY_FREQUENCIES, AVERAGE_DELIVERIES, COURIER_PROVIDERS, DELIVERY_CHALLENGES } from "@/lib/business-intelligence";
import { calculateLeadScore, getScoreLabel, getScoreStyle } from "@/lib/lead-scoring";
import { generateSlug } from "@/lib/prospect-pages";
import { type Lead, type StandingOrder, type LeadStatus } from "@/lib/b2b-types";
type Tab = "pipeline" | "discover" | "standing" | "add";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  warm: "Warm",
  inbound: "Inbound",
  closed: "Closed",
  dead: "Dead",
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
  contacted: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#E8E8E8]",
  warm: "bg-[#0D0D0D] text-white",
  inbound: "bg-[#0D0D0D] text-white",
  closed: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
  dead: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
};

const UK_CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol", "Sheffield", "Glasgow", "Edinburgh", "Cardiff", "Newcastle", "Nottingham", "Leicester", "Southampton", "Brighton", "Oxford", "Cambridge", "Reading", "Derby", "Norwich"];

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function formatTime(ts: string) {
  const date = new Date(ts);
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function LeadCard({ lead, onRefresh }: { lead: Lead; onRefresh: () => void }): React.ReactElement {
  // Recognition workflow state descriptions (based on lead_state, not status)
  const stateDescriptions: Record<string, { description: string; nextStep: string }> = {
    new: {
      description: "No recognition email has been sent yet.",
      nextStep: "Next: Send recognition email to begin outreach."
    },
    recognized: {
      description: "Recognition email sent to this prospect.",
      nextStep: "Waiting for them to engage with the prospect brief."
    },
    engaged: {
      description: "Prospect engaged with the prospect brief.",
      nextStep: "Next: Confirm they are ready to work with us."
    },
    self_confirmed: {
      description: "Prospect confirmed interest in working together.",
      nextStep: "Ready to create a standing order contract."
    }
  };

  // Get the recognition workflow state (separate from CRM status)
  const workflowState = lead.lead_state || "new";

  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingRecognition, setSendingRecognition] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const [showStandingOrder, setShowStandingOrder] = useState(false);
  const [soForm, setSoForm] = useState({ price: "", day_of_week: "1", preferred_time: "", notes: "" });
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(lead.email || "");
  const [savingEmail, setSavingEmail] = useState(false);
  const [confirmationSuccessMessage, setConfirmationSuccessMessage] = useState(false);

  const hasPainPoint = !!lead.pain_point;

  const scoreBreakdown = calculateLeadScore({
    industry: lead.business_category,
    deliveryFrequency: lead.delivery_frequency,
    averageDeliveries: lead.average_deliveries,
    courierProvider: lead.courier_provider,
    deliveryChallenge: lead.delivery_challenge,
  });
  const scoreLabel = getScoreLabel(scoreBreakdown.total);
  const scoreStyle = getScoreStyle(scoreBreakdown.total);

  async function getDraft() {
    setDrafting(true);
    try {
      const res = await fetch(`/api/b2b/outreach?lead_id=${lead.id}`);
      const data = await res.json() as { subject: string; body: string };
      setDraft(data);
    } finally {
      setDrafting(false);
    }
  }

  async function sendEmail() {
    if (!draft) return;
    setSending(true);
    try {
      await fetch("/api/b2b/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, subject: draft.subject, body: draft.body }),
      });
      setStatus("contacted");
      setDraft(null);
      onRefresh();
    } finally {
      setSending(false);
    }
  }

  async function sendRecognitionEmail() {
    if (!lead.email || !lead.business_name || !lead.business_category) return;
    setSendingRecognition(true);
    try {
      await fetch("/api/b2b/send-recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          business_name: lead.business_name,
          industry: lead.business_category,
          email: lead.email,
        }),
      });
      setStatus("recognized");
      setConfirmationSuccessMessage(true);
      setTimeout(() => setConfirmationSuccessMessage(false), 4000);
      onRefresh();
    } finally {
      setSendingRecognition(false);
    }
  }

  async function saveEmail() {
    if (!newEmail) return;
    setSavingEmail(true);
    try {
      await fetch("/api/b2b/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, email: newEmail }),
      });
      setEditingEmail(false);
      onRefresh();
    } finally {
      setSavingEmail(false);
    }
  }

  async function updateStatus(newStatus: LeadStatus) {
    await fetch("/api/b2b/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, status: newStatus }),
    });
    setStatus(newStatus);
    onRefresh();
  }

  async function createStandingOrder() {
    await fetch("/api/b2b/standing-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: lead.id,
        business_name: lead.business_name,
        contact_name: lead.contact_name,
        contact_phone: lead.phone,
        contact_email: lead.email,
        service_type: `${lead.business_category ?? "Logistics"} run`,
        frequency: "weekly",
        day_of_week: parseInt(soForm.day_of_week),
        preferred_time: soForm.preferred_time,
        price: soForm.price ? parseFloat(soForm.price) : undefined,
        notes: soForm.notes,
      }),
    });
    setStatus("closed");
    setShowStandingOrder(false);
    onRefresh();
  }

  const emailMissing = !lead.email;

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-[#FAFAFA] active:bg-[#F5F5F5] transition-all duration-150"
        onClick={() => { setExpanded(e => !e); if (!expanded && !draft && lead.email) getDraft(); }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-sans font-bold text-[#0D0D0D] text-sm">{lead.business_name}</p>
            {hasPainPoint && (
              <span className="text-[10px] font-semibold text-white bg-[#0D0D0D] px-2 py-0.5 rounded-full uppercase tracking-[0.1em]">
                Pain point
              </span>
            )}
            {lead.source === "inbound" && (
              <span className="text-[10px] font-semibold text-[#0D0D0D] bg-[#F5F5F5] border border-[#E8E8E8] px-2 py-0.5 rounded-full uppercase tracking-[0.1em]">
                Inbound
              </span>
            )}
          </div>
          <p className="text-[#888888] text-xs">
            {lead.business_category}{lead.delivery_type ? ` · ${lead.delivery_type}` : ""}{lead.city ? ` · ${lead.city}` : ""}
            {lead.email ? ` · ${lead.email}` : " · No email"}
          </p>
          {hasPainPoint && (
            <p className="text-[#888888] text-xs mt-0.5 italic">&ldquo;{lead.pain_point_review?.slice(0, 80)}…&rdquo;</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded ${scoreStyle.containerClass} ${scoreStyle.badgeClass}`}>
              {scoreLabel}
            </span>
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] ${STATUS_STYLE[status] ?? STATUS_STYLE.new}`}>
              {STATUS_LABELS[status] ?? status}
            </span>
          </div>
          {lead.created_at && <p className="text-[#888888] text-[10px]">{timeAgo(lead.created_at)}</p>}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#E8E8E8]">
          {/* Lead state status line - Apple minimal design */}
          {status === "recognized" && (
            <div className="mb-4 pt-2 pb-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-semibold tracking-widest text-[#0D0D0D] uppercase">Recognized</span>
                  <span className="text-[10px] text-[#888888]">Email sent</span>
                </div>
                {lead.created_at && <span className="text-[10px] text-[#AAAAAA] ml-auto">{formatTime(lead.created_at)}</span>}
              </div>
              <div className="h-px bg-gradient-to-r from-[#0D0D0D] via-[#E8E8E8] to-transparent mt-2"></div>
            </div>
          )}

          {/* Opportunity Score Breakdown */}
          <div className={`border rounded-xl p-3 mb-4 ${scoreStyle.containerClass}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2">Opportunity Score</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {scoreBreakdown.frequencyScore > 0 && (
                <div>
                  <span className="font-semibold">{scoreBreakdown.frequencyScore}pts</span>
                  <span className="text-[#888888]"> Frequency</span>
                </div>
              )}
              {scoreBreakdown.industryScore > 0 && (
                <div>
                  <span className="font-semibold">{scoreBreakdown.industryScore}pts</span>
                  <span className="text-[#888888]"> Industry</span>
                </div>
              )}
              {scoreBreakdown.volumeScore > 0 && (
                <div>
                  <span className="font-semibold">{scoreBreakdown.volumeScore}pts</span>
                  <span className="text-[#888888]"> Volume</span>
                </div>
              )}
              {scoreBreakdown.courierScore > 0 && (
                <div>
                  <span className="font-semibold">{scoreBreakdown.courierScore}pts</span>
                  <span className="text-[#888888]"> Courier</span>
                </div>
              )}
              {scoreBreakdown.challengeScore > 0 && (
                <div>
                  <span className="font-semibold">{scoreBreakdown.challengeScore}pts</span>
                  <span className="text-[#888888]"> Challenge</span>
                </div>
              )}
            </div>
          </div>

          {/* Recognition Progress Indicator - visible for all leads */}
          <div className="mb-4 pt-3 pb-3 border-t border-[#E8E8E8]">
            <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-[0.5px] mb-2">
              Recognition Progress
            </p>

            {/* Progress stages */}
            <div className="flex items-center gap-2 text-[10px] font-medium mb-3">
              <span className={workflowState === "new" ? "font-semibold text-[#0D0D0D]" : "text-[#AAAAAA]"}>
                new
              </span>
              <span className="text-[#CCC]">→</span>
              <span className={workflowState === "recognized" ? "font-semibold text-[#0D0D0D]" : "text-[#AAAAAA]"}>
                recognized
              </span>
              <span className="text-[#CCC]">→</span>
              <span className={workflowState === "engaged" ? "font-semibold text-[#0D0D0D]" : "text-[#AAAAAA]"}>
                engaged
              </span>
              <span className="text-[#CCC]">→</span>
              <span className={workflowState === "self_confirmed" ? "font-semibold text-[#0D0D0D]" : "text-[#AAAAAA]"}>
                confirmed
              </span>
            </div>

            {/* State-specific explanation */}
            <p className="text-[10px] text-[#666666] mb-2">
              {stateDescriptions[workflowState]?.description || `State: ${workflowState}`}
            </p>

            {/* Next step guidance */}
            <p className="text-[10px] text-[#AAAAAA]">
              {stateDescriptions[workflowState]?.nextStep}
            </p>
          </div>

          {/* Recognition email success feedback - Apple minimal + Linear precision */}
          {confirmationSuccessMessage && (
            <div className={`mb-4 px-4 py-3 rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] animate-in fade-in duration-200 ${!confirmationSuccessMessage && "animate-out fade-out duration-300"}`}>
              <div className="flex items-start gap-3">
                <span className="text-[#0D0D0D] font-semibold text-sm mt-0.5">✓</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.5px] text-[#0D0D0D]">Recognition sent</p>
                  <p className="text-[10px] text-[#666666] mt-1.5">{lead.email}</p>
                  <p className="text-[10px] text-[#AAAAAA] mt-1">{new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recognition email button - refined interaction */}
          <button
            onClick={sendRecognitionEmail}
            disabled={sendingRecognition || !lead.email}
            className="w-full bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#0D0D0D] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-full text-xs transition-all duration-150 mb-4"
          >
            {sendingRecognition ? "Sending…" : "Send Recognition Email"}
          </button>

          {/* Prospect brief link - refined secondary action */}
          <Link
            href={`/prospect/${generateSlug(lead.business_name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#F9F9F9] hover:bg-[#F0F0F0] text-[#0D0D0D] font-medium py-2.5 rounded-full text-xs transition-all duration-150 mb-4 block text-center border border-[#E8E8E8]"
          >
            View Prospect Brief
          </Link>

          {/* Lead details */}
          <div className="grid grid-cols-2 gap-3 py-4">
            {!!lead.phone && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Phone</p>
                <a href={`tel:${lead.phone}`} className="text-[#0D0D0D] text-sm font-semibold hover:underline">{lead.phone}</a>
              </div>
            )}
            {!!lead.website && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Website</p>
                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-[#0D0D0D] text-sm hover:underline truncate block">{lead.website}</a>
              </div>
            )}
            {!!lead.delivery_frequency && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Frequency</p>
                <p className="text-[#0D0D0D] text-sm">{lead.delivery_frequency}</p>
              </div>
            )}
            {!!lead.average_deliveries && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Avg Deliveries/Month</p>
                <p className="text-[#0D0D0D] text-sm">{lead.average_deliveries}</p>
              </div>
            )}
            {!!lead.courier_provider && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Current Courier</p>
                <p className="text-[#0D0D0D] text-sm">{lead.courier_provider}</p>
              </div>
            )}
            {!!lead.delivery_challenge && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Main Challenge</p>
                <p className="text-[#0D0D0D] text-sm">{lead.delivery_challenge}</p>
              </div>
            )}
            {hasPainPoint && (
              <div className="col-span-2">
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Pain point</p>
                <p className="text-[#0D0D0D] text-sm">{lead.pain_point}</p>
                {!!lead.pain_point_review && (
                  <p className="text-[#888888] text-xs mt-1 italic">&ldquo;{lead.pain_point_review}&rdquo;</p>
                )}
              </div>
            )}
          </div>

          {/* Email input section - minimal design */}
          {emailMissing ? (
            <div className="bg-[#FAFAFA] border border-[#E8E8E8] rounded-lg p-4 mb-4 space-y-3">
              <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-[0.5px]">Add email address</p>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="name@company.co.uk"
                className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] transition-all"
              />
              <button
                onClick={saveEmail}
                disabled={savingEmail || !newEmail}
                className="w-full bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#0D0D0D] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-full text-xs transition-all duration-150"
              >
                {savingEmail ? "Saving…" : "Save email"}
              </button>
            </div>
          ) : draft ? (
            <div className="bg-[#FAFAFA] border border-[#E8E8E8] rounded-lg p-4 mb-4 space-y-3">
              <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-[0.5px]">Draft email</p>
              <input
                value={draft.subject}
                onChange={e => setDraft(d => d ? { ...d, subject: e.target.value } : d)}
                className="w-full text-sm font-semibold text-[#0D0D0D] bg-transparent focus:outline-none border-b border-[#E8E8E8] pb-2 transition-colors"
              />
              <textarea
                value={draft.body}
                onChange={e => setDraft(d => d ? { ...d, body: e.target.value } : d)}
                rows={4}
                className="w-full text-sm text-[#0D0D0D] bg-transparent focus:outline-none resize-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={sendEmail}
                  disabled={sending}
                  className="bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#0D0D0D] disabled:opacity-30 text-white font-semibold px-5 py-2 rounded-full text-xs transition-all duration-150"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
                <button onClick={getDraft} className="text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors font-medium">
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={getDraft}
              disabled={drafting}
              className="w-full bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#0D0D0D] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-full text-xs transition-all duration-150 mb-4"
            >
              {drafting ? "Drafting…" : "Draft email"}
            </button>
          )}

          {/* Standing order section - refined design */}
          {showStandingOrder ? (
            <div className="bg-[#FAFAFA] border border-[#E8E8E8] rounded-lg p-4 mb-4 space-y-3">
              <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-[0.5px]">Create standing order</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#666666] text-[10px] uppercase tracking-[0.5px] block mb-1">Price (£)</label>
                  <input type="number" value={soForm.price} onChange={e => setSoForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 120" className="w-full px-3 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] transition-all" />
                </div>
                <div>
                  <label className="text-[#666666] text-[10px] uppercase tracking-[0.5px] block mb-1">Day of week</label>
                  <select value={soForm.day_of_week} onChange={e => setSoForm(f => ({ ...f, day_of_week: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] bg-white transition-all">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d, i) => (
                      <option key={d} value={i + 1}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <input type="text" value={soForm.preferred_time} onChange={e => setSoForm(f => ({ ...f, preferred_time: e.target.value }))} placeholder="Preferred time (e.g. 9am)" className="w-full px-3 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] transition-all" />
              <textarea value={soForm.notes} onChange={e => setSoForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notes (route, special requirements…)" className="w-full px-3 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] resize-none transition-all" />
              <div className="flex gap-2 pt-1">
                <button onClick={createStandingOrder} className="bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#0D0D0D] text-white font-semibold px-5 py-2 rounded-full text-xs transition-all duration-150">
                  Create
                </button>
                <button onClick={() => setShowStandingOrder(false)} className="text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors font-medium">Back</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 border-t border-[#E8E8E8] pt-4">
              <button onClick={() => updateStatus("warm")} className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-medium px-4 py-1.5 rounded-full text-xs transition-all duration-150">
                Mark warm
              </button>
              <button onClick={() => setShowStandingOrder(true)} className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-medium px-4 py-1.5 rounded-full text-xs transition-all duration-150">
                Standing order
              </button>
              <button onClick={() => updateStatus("dead")} className="text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors font-medium">
                Not interested
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiscoverPanel({ onRefresh }: { onRefresh: () => void }): React.ReactElement {
  const [industry, setIndustry] = useState(Object.values(B2B_INDUSTRIES)[0][0]);
  const [deliveryType, setDeliveryType] = useState(DELIVERY_TYPES[0]);
  const [city, setCity] = useState("Manchester");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ count: number; added: string[] } | null>(null);

  async function discover() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/b2b/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: industry, delivery_type: deliveryType, city }),
      });
      const data = await res.json() as { count: number; added: string[] };
      setResult(data);
      onRefresh();
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">Discover leads via Google Maps</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {Object.entries(B2B_INDUSTRIES).map(([category, industries]) => (
                <optgroup key={category} label={category}>
                  {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Delivery Type</label>
            <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {DELIVERY_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">City</label>
            <select value={city} onChange={e => setCity(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {UK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={discover}
          disabled={running}
          className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
        >
          {running ? "Searching Google Maps…" : `Find ${industry} in ${city} →`}
        </button>
        {result && (
          <div className="mt-4 bg-white border border-[#E8E8E8] rounded-xl px-4 py-3">
            <p className="text-[#0D0D0D] text-sm font-semibold">{result.count} new leads added</p>
            {result.added.length > 0 && (
              <ul className="mt-2 space-y-1">
                {result.added.map(name => (
                  <li key={name} className="text-[#888888] text-xs">· {name}</li>
                ))}
              </ul>
            )}
            {result.count === 0 && <p className="text-[#888888] text-xs mt-1">All businesses in this search are already in your pipeline.</p>}
          </div>
        )}
      </div>
      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">Review monitoring</p>
        <p className="text-[#0D0D0D] text-sm font-medium mb-1">Pain point detection is automatic.</p>
        <p className="text-[#888888] text-sm leading-relaxed">
          When you run a discovery, the system checks each business&apos;s Google reviews for delivery, courier, shipping, or supplier complaints. Leads with pain points are flagged automatically and prioritised in your pipeline.
        </p>
      </div>
    </div>
  );
}

function AddLeadPanel({ onRefresh }: { onRefresh: () => void }): React.ReactElement {
  const defaultIndustry = Object.values(B2B_INDUSTRIES)[0][0];
  const [form, setForm] = useState({
    business_name: "",
    industry: defaultIndustry,
    deliveryType: DELIVERY_TYPES[0],
    deliveryFrequency: DELIVERY_FREQUENCIES[0],
    averageDeliveries: AVERAGE_DELIVERIES[0],
    courierProvider: COURIER_PROVIDERS[0],
    deliveryChallenge: DELIVERY_CHALLENGES[0],
    email: "",
    phone: "",
    city: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.business_name) return;
    setSaving(true);
    try {
      await fetch("/api/b2b/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          niche: form.industry,
          delivery_type: form.deliveryType,
          delivery_frequency: form.deliveryFrequency,
          average_deliveries: form.averageDeliveries,
          courier_provider: form.courierProvider,
          delivery_challenge: form.deliveryChallenge,
        }),
      });
      setForm({
        business_name: "",
        industry: defaultIndustry,
        deliveryType: DELIVERY_TYPES[0],
        deliveryFrequency: DELIVERY_FREQUENCIES[0],
        averageDeliveries: AVERAGE_DELIVERIES[0],
        courierProvider: COURIER_PROVIDERS[0],
        deliveryChallenge: DELIVERY_CHALLENGES[0],
        email: "",
        phone: "",
        city: "",
        notes: "",
      });
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 space-y-3">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">Add lead manually</p>
      <input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Business name *" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />

      <div className="grid grid-cols-2 gap-3">
        <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          {Object.entries(B2B_INDUSTRIES).map(([category, industries]) => (
            <optgroup key={category} label={category}>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </optgroup>
          ))}
        </select>
        <select value={form.deliveryType} onChange={e => setForm(f => ({ ...f, deliveryType: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          {DELIVERY_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
        </select>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
        <select value={form.deliveryFrequency} onChange={e => setForm(f => ({ ...f, deliveryFrequency: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Delivery Frequency</option>
          {DELIVERY_FREQUENCIES.map(df => <option key={df} value={df}>{df}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select value={form.averageDeliveries} onChange={e => setForm(f => ({ ...f, averageDeliveries: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Avg Deliveries/Month</option>
          {AVERAGE_DELIVERIES.map(ad => <option key={ad} value={ad}>{ad}</option>)}
        </select>
        <select value={form.courierProvider} onChange={e => setForm(f => ({ ...f, courierProvider: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Current Courier</option>
          {COURIER_PROVIDERS.map(cp => <option key={cp} value={cp}>{cp}</option>)}
        </select>
        <select value={form.deliveryChallenge} onChange={e => setForm(f => ({ ...f, deliveryChallenge: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Biggest Challenge</option>
          {DELIVERY_CHALLENGES.map(dc => <option key={dc} value={dc}>{dc}</option>)}
        </select>
      </div>

      <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notes or pain point" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D] resize-none" />
      <button onClick={save} disabled={saving || !form.business_name} className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">
        {saving ? "Adding…" : "Add to pipeline →"}
      </button>
    </div>
  );
}

function StandingOrdersPanel({ orders, onGenerate }: { orders: StandingOrder[]; onGenerate: () => void }): React.ReactElement {
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    try {
      await fetch("/api/b2b/standing-orders", { method: "PUT" });
      onGenerate();
    } finally {
      setGenerating(false);
    }
  }

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          Active standing orders ({orders.length})
        </p>
        <button onClick={generate} disabled={generating} className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold px-4 py-1.5 rounded-full text-xs transition-colors">
          {generating ? "Generating…" : "Generate this week's jobs →"}
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-8 text-center">
          <p className="text-[#888888] text-sm">No standing orders yet. Close a lead to create one.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{order.business_name}</p>
                <p className="text-[#888888] text-xs">
                  {order.frequency}
                  {order.day_of_week != null ? ` · ${DAYS[order.day_of_week - 1]}` : ""}
                  {order.preferred_time ? ` · ${order.preferred_time}` : ""}
                  {order.pickup_postcode ? ` · ${order.pickup_postcode}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                {order.price != null && <p className="font-sans font-black text-[#0D0D0D] text-sm">£{Number(order.price).toFixed(0)}</p>}
                {!!order.next_scheduled_at && (
                  <p className="text-[#888888] text-[10px]">
                    Next: {order.next_scheduled_at ? new Date(order.next_scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface B2BPipelineProps {
  leads: Lead[];
  orders: StandingOrder[];
}

export default function B2BPipeline({ leads: initialLeads, orders: initialOrders }: B2BPipelineProps): React.ReactElement {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pipeline");
  const leads = initialLeads;
  const orders = initialOrders;

  function refresh() {
    router.refresh();
  }

  const activeTabs: { key: Tab; label: string }[] = [
    { key: "pipeline", label: `Pipeline (${leads.filter(l => !["closed", "dead"].includes(l.status)).length})` },
    { key: "discover", label: "Discover" },
    { key: "add", label: "Add lead" },
    { key: "standing", label: `Standing orders (${orders.length})` },
  ];

  const pipelineLeads = tab === "pipeline"
    ? leads.filter(l => !["closed", "dead"].includes(l.status))
    : leads;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {activeTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${tab === t.key ? "bg-[#0D0D0D] text-white" : "text-[#666666] hover:text-[#0D0D0D] border border-[#E8E8E8] hover:border-[#0D0D0D]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pipeline" && (
        <div className="space-y-3">
          {pipelineLeads.length === 0 ? (
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-8 text-center">
              <p className="text-[#888888] text-sm">No active leads. Use Discover to find your first batch.</p>
            </div>
          ) : (
            (() => {
              const sortedLeads = [...pipelineLeads].sort((a, b) => {
                const scoreA = calculateLeadScore({
                  industry: a.business_category,
                  deliveryFrequency: a.delivery_frequency,
                  averageDeliveries: a.average_deliveries,
                  courierProvider: a.courier_provider,
                  deliveryChallenge: a.delivery_challenge,
                }).total;
                const scoreB = calculateLeadScore({
                  industry: b.business_category,
                  deliveryFrequency: b.delivery_frequency,
                  averageDeliveries: b.average_deliveries,
                  courierProvider: b.courier_provider,
                  deliveryChallenge: b.delivery_challenge,
                }).total;
                return scoreB - scoreA;
              });
              return sortedLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onRefresh={refresh} />
              ));
            })()
          )}
        </div>
      )}

      {tab === "discover" && <DiscoverPanel onRefresh={refresh} />}
      {tab === "add" && <AddLeadPanel onRefresh={refresh} />}
      {tab === "standing" && <StandingOrdersPanel orders={orders} onGenerate={refresh} />}
    </div>
  );
}
