"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { B2B_INDUSTRIES } from "@/lib/b2b-industries";
import { DELIVERY_TYPES } from "@/lib/delivery-types";
import { getDeliveryTypeForIndustry } from "@/lib/industry-delivery-mapping";
import { DELIVERY_FREQUENCIES, AVERAGE_DELIVERIES, COURIER_PROVIDERS, DELIVERY_CHALLENGES } from "@/lib/business-intelligence";
import { calculateLeadScore, getScoreLabel, getScoreStyle, scoreDiscoveredLead, getLeadSignalLabel } from "@/lib/lead-scoring";
import { generateSlug } from "@/lib/prospect-pages";
import { generateQuestions, prioritizeQuestions } from "@/lib/question-engine";
import { generateRevelatoryAnalysis } from "@/lib/revelatory-engine";
import { getOperatorGuidance, getOpeningPrompt, handleObjection } from "@/lib/b2b-conversation-prompts";
import { type Lead, type StandingOrder, type LeadStatus } from "@/lib/b2b-types";
import { type BusinessEvidence } from "@/lib/evidence-types";
import { SkeletonLeadCards } from "@/components/SkeletonLeadCards";
type Tab = "pipeline" | "discover" | "standing" | "add";

const STATUS_LABELS: Record<string, string> = {
  new: "Uncontacted",
  contacted: "Engaged",
  warm: "Active",
  inbound: "Inbound",
  closed: "Activated",
  dead: "Archived",
};

const STATUS_STYLE: Record<string, string> = {
  new: "text-[#666666]",
  contacted: "text-[#0D0D0D]",
  warm: "text-[#0D0D0D]",
  inbound: "text-[#0D0D0D]",
  closed: "text-[#666666]",
  dead: "text-[#666666]",
};

// Minimal state-based styling (white background, consistent borders)
const WORKFLOW_STATE_STYLE: Record<string, { border: string; bg: string }> = {
  new: { border: "border-l-2 border-l-[#CCCCCC]", bg: "bg-white" },
  recognized: { border: "border-l-2 border-l-[#0D0D0D]", bg: "bg-white" },
  engaged: { border: "border-l-2 border-l-[#0D0D0D]", bg: "bg-white" },
  self_confirmed: { border: "border-l-2 border-l-[#0D0D0D]", bg: "bg-white" },
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
  // Recognition workflow state descriptions
  // This is an explanation layer, not a truth model. Backend state is authoritative.
  // If a state is not in this map, it will show a safe fallback instead of guessing.
  // Future states (e.g., "disqualified", "recycled") will render safely without changes here.
  const stateDescriptions: Record<string, { description: string; nextStep: string }> = {
    new: {
      description: "Opportunity discovered. No initial contact sent yet.",
      nextStep: "Next: Send recognition email to begin conversation."
    },
    recognized: {
      description: "Recognition email sent. Opportunity learning about your service.",
      nextStep: "Awaiting engagement with transport brief and response."
    },
    engaged: {
      description: "Opportunity actively engaged. Shown interest in your service.",
      nextStep: "Next: Validate their need and move toward standing order."
    },
    self_confirmed: {
      description: "Opportunity confirmed interest. Ready for activation.",
      nextStep: "Create standing order contract and begin fulfilment."
    }
  };

  // Default fallback for unknown or future states
  const defaultStateDescription = {
    description: "Recognition workflow state recorded in system.",
    nextStep: "Review lead details and take appropriate action."
  };

  // Get the recognition workflow state (separate from CRM status)
  // Fallback to "new" if lead_state is missing (defensive)
  const workflowState = lead.lead_state || "new";

  // Get description, using fallback for unmapped states
  const currentStateDescription = stateDescriptions[workflowState] || defaultStateDescription;

  // Development warning if state is not recognized (helps catch future states early)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && !stateDescriptions[workflowState] && workflowState !== "new") {
    console.warn(`[LeadCard] Unmapped workflow state: "${workflowState}". Using fallback. Add to stateDescriptions if this is a new state.`);
  }

  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [outreachHistory, setOutreachHistory] = useState<Array<{ id: string; sent_at: string; email_type: string; replied: boolean; replied_at: string | null }>>([]);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingRecognition, setSendingRecognition] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const [showStandingOrder, setShowStandingOrder] = useState(false);
  const [soForm, setSoForm] = useState({
    price: "",
    day_of_week: "1",
    preferred_time: "",
    pickup_address: "",
    pickup_postcode: "",
    delivery_address: "",
    delivery_postcode: "",
    notes: ""
  });
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [observationForm, setObservationForm] = useState({ observation: "", context: "phone_call" });
  const [recordingObservation, setRecordingObservation] = useState(false);
  const [showHypotheses, setShowHypotheses] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConversationGuidance, setShowConversationGuidance] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(lead.email || "");
  const [savingEmail, setSavingEmail] = useState(false);
  const [confirmationSuccessMessage, setConfirmationSuccessMessage] = useState(false);
  const [prospectBriefUrl, setProspectBriefUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [recognitionDraft, setRecognitionDraft] = useState<{ subject: string; body: string; triggerEvent: string } | null>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);
  const [loadingEngagement, setLoadingEngagement] = useState(false);

  const hasPainPoint = !!lead.pain_point;

  // Use discovered lead scoring for leads without form data (source="discovery")
  // Use form-based scoring for leads with explicit delivery data
  const hasFormData = lead.delivery_frequency || lead.average_deliveries || lead.courier_provider;

  const scoreBreakdown = hasFormData
    ? calculateLeadScore({
        industry: lead.business_category,
        deliveryFrequency: lead.delivery_frequency,
        averageDeliveries: lead.average_deliveries,
        courierProvider: lead.courier_provider,
        deliveryChallenge: lead.delivery_challenge,
      })
    : {
        frequencyScore: 0,
        industryScore: 0,
        volumeScore: 0,
        courierScore: 0,
        challengeScore: 0,
        total: scoreDiscoveredLead({
          industryCategory: lead.business_category,
          painPoint: lead.pain_point,
          painPointReview: lead.pain_point_review,
          reviewRating: lead.review_rating,
        }),
      };

  const scoreLabel = getScoreLabel(scoreBreakdown.total);
  const scoreStyle = getScoreStyle(scoreBreakdown.total);

  async function getDraft() {
    setDrafting(true);
    try {
      const res = await fetch(`/api/b2b/outreach?lead_id=${lead.id}`);
      const data = await res.json() as { subject: string; body: string; outreach_history: Array<{ id: string; sent_at: string; email_type: string; replied: boolean; replied_at: string | null }> };
      setDraft({ subject: data.subject, body: data.body });
      if (data.outreach_history) {
        setOutreachHistory(data.outreach_history);
      }
    } finally {
      setDrafting(false);
    }
  }

  async function loadEngagementMetrics() {
    setLoadingEngagement(true);
    try {
      const res = await fetch(`/api/b2b/engagement-metrics?lead_id=${lead.id}`);
      const data = await res.json();
      setEngagementMetrics(data);
    } catch (error) {
      console.error("Failed to load engagement metrics:", error);
    } finally {
      setLoadingEngagement(false);
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

  // Step 1: Preview recognition email
  async function previewRecognitionEmail() {
    if (!lead.email || !lead.business_name || !lead.business_category || !lead.id) return;
    setSendingRecognition(true);
    try {
      const response = await fetch(
        `/api/b2b/send-recognition?business_name=${encodeURIComponent(lead.business_name)}&industry=${encodeURIComponent(lead.business_category)}&email=${encodeURIComponent(lead.email)}&lead_id=${lead.id}`
      );
      const data = await response.json() as { subject: string; body: string; triggerEvent: string };
      setRecognitionDraft(data);
    } finally {
      setSendingRecognition(false);
    }
  }

  // Step 2: Send recognition email after preview approval
  async function sendRecognitionEmail() {
    if (!recognitionDraft) return;
    setSendingRecognition(true);
    try {
      const response = await fetch("/api/b2b/send-recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          business_name: lead.business_name,
          industry: lead.business_category,
          email: lead.email,
        }),
      });

      if (!response.ok) {
        console.error("[SEND-RECOGNITION] API error:", response.status);
        setConfirmationSuccessMessage(false);
        return;
      }

      const data = await response.json() as { success: boolean; trigger_event?: string; prospectBriefUrl?: string };

      if (data.success) {
        console.log("[SEND-RECOGNITION] Email sent successfully, trigger:", data.trigger_event);
        setConfirmationSuccessMessage(true);
        setRecognitionDraft(null);
        if (data.prospectBriefUrl) {
          setProspectBriefUrl(data.prospectBriefUrl);
        }
        setTimeout(() => setConfirmationSuccessMessage(false), 4000);
        // Re-fetch to get updated lead_state from server (not optimistic update)
        onRefresh();
      } else {
        console.error("[SEND-RECOGNITION] API returned success: false");
        setConfirmationSuccessMessage(false);
      }
    } catch (error) {
      console.error("[SEND-RECOGNITION] Error:", error);
      setConfirmationSuccessMessage(false);
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

  function validateStandingOrder(): boolean {
    const errors: Record<string, string> = {};

    if (!soForm.pickup_postcode || !soForm.pickup_postcode.trim()) {
      errors.pickup_postcode = "Pickup postcode required for job routing";
    }

    if (!soForm.delivery_postcode || !soForm.delivery_postcode.trim()) {
      errors.delivery_postcode = "Delivery postcode required for job routing";
    }

    if (!soForm.preferred_time || !soForm.preferred_time.trim()) {
      errors.preferred_time = "Preferred time required";
    }

    if (!soForm.price) {
      errors.price = "Price required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function createStandingOrder() {
    if (!validateStandingOrder()) {
      return;
    }

    try {
      const response = await fetch("/api/b2b/standing-orders", {
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
          pickup_address: soForm.pickup_address || undefined,
          pickup_postcode: soForm.pickup_postcode || undefined,
          delivery_address: soForm.delivery_address || undefined,
          delivery_postcode: soForm.delivery_postcode || undefined,
          price: soForm.price ? parseFloat(soForm.price) : undefined,
          notes: soForm.notes,
        }),
      });

      if (!response.ok) {
        alert("Standing order could not be saved. Please check your input and try again.");
        return;
      }

      // Record standing order details as structured observation for future reference
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const observationDetails = [
        `Pickup postcode: ${soForm.pickup_postcode}`,
        `Delivery postcode: ${soForm.delivery_postcode}`,
        `Day: ${dayNames[parseInt(soForm.day_of_week) - 1]}`,
        `Time: ${soForm.preferred_time}`
      ];

      const observationText = `Standing order confirmed\n\n${observationDetails.join("\n")}`;

      await fetch("/api/b2b/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          observation: observationText,
          context: "standing_order",
        }),
      });

      setStatus("closed");
      setShowStandingOrder(false);
      onRefresh();
    } catch (error) {
      console.error("Error creating standing order:", error);
      alert("Standing order could not be saved. Please try again.");
    }
  }

  async function recordObservation() {
    if (!observationForm.observation.trim()) return;

    setRecordingObservation(true);
    try {
      const response = await fetch("/api/b2b/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          observation: observationForm.observation,
          context: observationForm.context,
        }),
      });

      if (response.ok) {
        setObservationForm({ observation: "", context: "phone_call" });
        setShowObservationModal(false);
        onRefresh();
      }
    } catch (error) {
      console.error("Error recording observation:", error);
    } finally {
      setRecordingObservation(false);
    }
  }

  const emailMissing = !lead.email;

  const cardStyle = WORKFLOW_STATE_STYLE[workflowState] || WORKFLOW_STATE_STYLE.new;
  const isExpanded = expanded;

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${cardStyle.bg} ${cardStyle.border} border-[#CCCCCC]`} style={{ borderWidth: '1px' }}>
      <button
        className={`w-full text-left px-6 py-5 flex items-start justify-between gap-4 transition-colors ${
          isExpanded
            ? "hover:bg-[#F9F9F9]"
            : "hover:bg-[#F9F9F9]"
        }`}
        onClick={() => { setExpanded(e => !e); if (!expanded && !draft && lead.email) getDraft(); if (!expanded && !engagementMetrics) loadEngagementMetrics(); }}
      >
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-sm text-[#0D0D0D]">{lead.business_name}</p>
          <p className="text-xs text-[#666666] mt-0.5">
            {lead.business_category}{lead.city ? ` · ${lead.city}` : ""}
          </p>
          {hasPainPoint && (
            <p className="text-xs mt-1.5 text-[#666666]">{lead.pain_point_review?.slice(0, 100) || lead.pain_point}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-xs font-semibold ${STATUS_STYLE[status]}`}>
            {STATUS_LABELS[status] ?? status}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="px-6 py-6 border-t border-[#CCCCCC]">


          {/* INSIGHT Section */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0D0D0D] mb-3">Insight</p>
            <p className="text-sm leading-relaxed text-[#333333]">
              {hasPainPoint
                ? lead.pain_point_review || lead.pain_point
                : "Business identified through discovery research."}
            </p>
          </div>

          {/* STRATEGY Section */}
          <div className="mb-6 pt-6 border-t border-[#CCCCCC]">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0D0D0D] mb-3">Strategy</p>
            <p className="text-sm leading-relaxed text-[#333333]">
              {hasPainPoint
                ? `Ask about ${lead.pain_point?.toLowerCase() || 'their primary pressure'}.`
                : "Introduce service and gauge interest in recurring logistics support."}
            </p>
          </div>


          {/* DRAFT EMAIL Section - Primary Artifact */}
          <div className="mb-6 pt-6 pb-6 border-t border-[#CCCCCC]">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0D0D0D] mb-4">Email</p>
            {draft ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-2">{draft.subject}</p>
                  <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-wrap">{draft.body}</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={sendEmail}
                    disabled={sending}
                    className="font-semibold px-5 py-2 rounded-lg text-sm transition-all bg-[#0D0D0D] text-white hover:bg-[#1a1a1a] disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                  <button
                    onClick={getDraft}
                    disabled={drafting}
                    className="font-medium px-5 py-2 rounded-lg text-sm text-[#666666] hover:text-[#0D0D0D] transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={getDraft}
                disabled={drafting}
                className="w-full font-semibold py-3 rounded-lg text-sm bg-[#0D0D0D] text-white hover:bg-[#1a1a1a] disabled:opacity-50 transition-all"
              >
                {drafting ? "Drafting…" : "Draft email"}
              </button>
            )}
          </div>

          {/* HISTORY Section */}
          <div className="mb-6 pt-6 border-t border-[#CCCCCC]">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0D0D0D] mb-3">History</p>
            {outreachHistory.length > 0 ? (
              <div className="space-y-2 text-xs text-[#666666]">
                {outreachHistory.slice(0, 3).map((email) => (
                  <p key={email.id}>
                    {new Date(email.sent_at).toLocaleDateString()} {email.email_type === "initial" ? "— Initial" : "— Follow-up"} {email.replied ? "✓" : ""}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#999999]">No contact yet.</p>
            )}
          </div>

          {/* Primary Action + More Menu */}
          {!showStandingOrder && (
            <div className="flex gap-3 pt-6 border-t border-[#CCCCCC]">
              <button
                onClick={() => setShowStandingOrder(true)}
                className="flex-1 font-semibold px-5 py-3 rounded-lg text-sm bg-[#0D0D0D] text-white hover:bg-[#1a1a1a] transition-all"
              >
                Create Standing Order
              </button>
              <button
                onClick={() => setShowObservationModal(true)}
                className="font-medium px-5 py-3 rounded-lg text-sm border border-[#CCCCCC] text-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
              >
                More
              </button>
            </div>
          )}

          {/* Standing order section */}
          {showStandingOrder && (
            <div className="rounded-lg p-6 mb-6 space-y-6 transition-all bg-white border border-[#CCCCCC]">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#0D0D0D]">Create Standing Order</p>
              <div className="space-y-6">

              {/* Conversation Ideas (Revelatory Hypotheses) */}
              {lead.business_evidence && (() => {
                const evidence = lead.business_evidence as BusinessEvidence;
                if (!evidence.reviews || evidence.reviews.length === 0) return null;

                const analysis = generateRevelatoryAnalysis(evidence);
                const allHypotheses = [
                  ...analysis.hypotheses.pressureHypotheses,
                  ...analysis.hypotheses.constraintHypotheses,
                  ...analysis.hypotheses.opportunityHypotheses
                ];

                if (allHypotheses.length === 0) return null;

                return (
                  <div className="border-b border-[#CCCCCC] pb-3 -mx-4 px-4">
                    <button
                      type="button"
                      onClick={() => setShowHypotheses(!showHypotheses)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-[#0D0D0D]">Conversation Ideas</p>
                      <span className={`text-[#888888] transition-transform ${showHypotheses ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {showHypotheses && (
                      <div className="mt-2 space-y-2">
                        {analysis.hypotheses.pressureHypotheses.length > 0 && (
                          <div>
                            <p className="text-[9px] font-semibold text-[#0D0D0D] mb-1">Possible Pressures</p>
                            {analysis.hypotheses.pressureHypotheses.slice(0, 2).map((h, i) => (
                              <div key={i} className="bg-white rounded-md p-2 mb-2 border border-[#CCCCCC]">
                                <p className="text-[10px] text-[#0D0D0D] mb-1">{h.statement}</p>
                                <p className="text-[9px] text-[#888888] italic">Ask: "{h.howToValidate}"</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {analysis.hypotheses.constraintHypotheses.length > 0 && (
                          <div>
                            <p className="text-[9px] font-semibold text-[#0D0D0D] mb-1">Possible Constraints</p>
                            {analysis.hypotheses.constraintHypotheses.slice(0, 2).map((h, i) => (
                              <div key={i} className="bg-white rounded-md p-2 mb-2 border border-[#CCCCCC]">
                                <p className="text-[10px] text-[#0D0D0D] mb-1">{h.statement}</p>
                                <p className="text-[9px] text-[#888888] italic">Ask: "{h.howToValidate}"</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {analysis.hypotheses.opportunityHypotheses.length > 0 && (
                          <div>
                            <p className="text-[9px] font-semibold text-[#0D0D0D] mb-1">Opportunities</p>
                            {analysis.hypotheses.opportunityHypotheses.slice(0, 2).map((h, i) => (
                              <div key={i} className="bg-white rounded-md p-2 mb-2 border border-[#CCCCCC]">
                                <p className="text-[10px] text-[#0D0D0D] mb-1">{h.statement}</p>
                                <p className="text-[9px] text-[#888888] italic">Ask: "{h.howToValidate}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.5px] block mb-1 text-[#666666]">Price (£)</label>
                  <input type="number" value={soForm.price} onChange={e => setSoForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 120" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#CCCCCC] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.5px] block mb-1 text-[#666666]">Day of week</label>
                  <select value={soForm.day_of_week} onChange={e => setSoForm(f => ({ ...f, day_of_week: e.target.value }))} className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#CCCCCC] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d, i) => (
                      <option key={d} value={i + 1}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <input type="text" value={soForm.preferred_time} onChange={e => setSoForm(f => ({ ...f, preferred_time: e.target.value }))} placeholder="Preferred time (e.g. 9am)" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#CCCCCC] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />

              <div className="border-t border-[#CCCCCC] pt-3 mt-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-[#888888] mb-2">Service locations (from prospect)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.5px] block mb-1 text-[#666666]">Pickup postcode <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={soForm.pickup_postcode}
                      onChange={e => setSoForm(f => ({ ...f, pickup_postcode: e.target.value }))}
                      placeholder="e.g. SW1A 1AA"
                      className={`w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border text-[#0D0D0D] ${
                        validationErrors.pickup_postcode
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#CCCCCC] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]'
                      }`}
                    />
                    {validationErrors.pickup_postcode && (
                      <p className="text-[9px] text-red-500 mt-1">{validationErrors.pickup_postcode}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.5px] block mb-1 text-[#666666]">Delivery postcode <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={soForm.delivery_postcode}
                      onChange={e => setSoForm(f => ({ ...f, delivery_postcode: e.target.value }))}
                      placeholder="e.g. N1 1AA"
                      className={`w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border text-[#0D0D0D] ${
                        validationErrors.delivery_postcode
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#CCCCCC] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]'
                      }`}
                    />
                    {validationErrors.delivery_postcode && (
                      <p className="text-[9px] text-red-500 mt-1">{validationErrors.delivery_postcode}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <input type="text" value={soForm.pickup_address} onChange={e => setSoForm(f => ({ ...f, pickup_address: e.target.value }))} placeholder="Pickup address (optional)" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#CCCCCC] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />
                  <input type="text" value={soForm.delivery_address} onChange={e => setSoForm(f => ({ ...f, delivery_address: e.target.value }))} placeholder="Delivery address (optional)" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#CCCCCC] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />
                </div>
              </div>

              <textarea value={soForm.notes} onChange={e => setSoForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notes (route, special requirements…)" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none resize-none transition-all bg-white border border-[#CCCCCC] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />

              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-[9px] font-semibold text-red-700 uppercase tracking-[0.5px]">Cannot submit standing order</p>
                  <ul className="text-[10px] text-red-600 mt-2 space-y-1">
                    {Object.values(validationErrors).map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={createStandingOrder}
                  disabled={!soForm.pickup_postcode?.trim() || !soForm.delivery_postcode?.trim()}
                  title={!soForm.pickup_postcode?.trim() || !soForm.delivery_postcode?.trim() ? "Postcodes required before standing order can be created" : ""}
                  className={`font-semibold px-5 py-2 rounded-full text-xs transition-all duration-150 ${
                    !soForm.pickup_postcode?.trim() || !soForm.delivery_postcode?.trim()
                      ? 'bg-[#CCC] text-[#666] cursor-not-allowed opacity-50'
                      : 'bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#0D0D0D] text-white'
                  }`}
                >
                  Create
                </button>
                <button onClick={() => setShowStandingOrder(false)} className="text-xs transition-colors font-medium text-[#888888] hover:text-[#0D0D0D]">Back</button>
              </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prospect Brief URL Modal */}
      {prospectBriefUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-sans font-bold text-[#0D0D0D] text-lg">Prospect Brief Ready</h3>
            <p className="text-sm text-[#666666]">Share this link with the prospect or open it to verify the enriched brief:</p>

            <div className="bg-white border border-[#CCCCCC] rounded-lg p-3 space-y-2">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em]">Prospect Brief URL</p>
              <p className="text-xs text-[#0D0D0D] break-all font-mono">{prospectBriefUrl}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(prospectBriefUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="flex-1 bg-[#0D0D0D] hover:bg-[#1a1a1a] text-white font-semibold py-2 rounded-full text-sm transition-all"
              >
                {copiedUrl ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={prospectBriefUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white hover:bg-[#F0F0F0] text-[#0D0D0D] font-semibold py-2 rounded-full text-sm transition-all text-center"
              >
                Open
              </a>
              <button
                onClick={() => setProspectBriefUrl(null)}
                className="bg-white hover:bg-[#F0F0F0] text-[#0D0D0D] font-semibold px-4 py-2 rounded-full text-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Observation Modal */}
      {showObservationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-sans font-bold text-[#0D0D0D] text-lg">Record Observation</h3>
            <p className="text-sm text-[#666666]">What did you learn from this prospect?</p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.5px] block mb-2 text-[#666666]">Observation</label>
                <textarea
                  value={observationForm.observation}
                  onChange={e => setObservationForm(f => ({ ...f, observation: e.target.value }))}
                  placeholder="E.g., 'Handles 5+ deliveries per week across London' or 'Decision maker is the owner, not manager'"
                  rows={3}
                  className="w-full px-3 py-2 rounded-md text-sm focus:outline-none resize-none transition-all bg-white border border-[#CCCCCC] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.5px] block mb-2 text-[#666666]">Context</label>
                <select
                  value={observationForm.context}
                  onChange={e => setObservationForm(f => ({ ...f, context: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#CCCCCC] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]"
                >
                  <option value="phone_call">Phone Call</option>
                  <option value="email">Email Reply</option>
                  <option value="meeting">Meeting</option>
                  <option value="standing_order">Standing Order Setup</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={recordObservation}
                disabled={recordingObservation || !observationForm.observation.trim()}
                className="flex-1 bg-[#0D0D0D] hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-full text-sm transition-all"
              >
                {recordingObservation ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setShowObservationModal(false)}
                className="bg-white hover:bg-[#F0F0F0] text-[#0D0D0D] font-semibold px-4 py-2 rounded-full text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Knowledge Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-6 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-sans font-bold text-[#0D0D0D] text-lg">{lead.business_name}</h3>
                <p className="text-sm text-[#888888]">{lead.business_category || "Business"} · {lead.email}</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-[#888888] hover:text-[#0D0D0D] text-2xl font-light"
              >
                ×
              </button>
            </div>

            {/* Operational Readiness Score */}
            {(() => {
              const criticalFields = {
                pickup_postcode: !!soForm.pickup_postcode,
                delivery_postcode: !!soForm.delivery_postcode,
                preferred_time: !!soForm.preferred_time,
                day_of_week: !!soForm.day_of_week
              };
              const completeness = Object.values(criticalFields).filter(Boolean).length;
              const total = Object.keys(criticalFields).length;

              return (
                <div className="bg-white rounded-lg p-4 border border-[#CCCCCC]">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-[#0D0D0D] mb-2">Operational Readiness</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-[#F0F0F0] rounded-full h-2">
                        <div
                          className="bg-[#0D0D0D] h-2 rounded-full transition-all"
                          style={{ width: `${(completeness / total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#0D0D0D] min-w-fit">{completeness}/{total}</p>
                  </div>
                  <div className="text-[9px] text-[#888888] mt-2 space-y-1">
                    {!soForm.pickup_postcode && <p>○ Pickup postcode</p>}
                    {!soForm.delivery_postcode && <p>○ Delivery postcode</p>}
                    {!soForm.preferred_time && <p>○ Preferred time</p>}
                    {!soForm.day_of_week && <p>○ Day of week</p>}
                  </div>
                </div>
              );
            })()}

            {/* What we know */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0D0D0D] mb-3">What we know</h4>
              <div className="space-y-2">
                {lead.business_name && <p className="text-sm text-[#0D0D0D]">✓ Business name: {lead.business_name}</p>}
                {lead.business_category && <p className="text-sm text-[#0D0D0D]">✓ Category: {lead.business_category}</p>}
                {lead.email && <p className="text-sm text-[#0D0D0D]">✓ Email: {lead.email}</p>}
                {lead.phone && <p className="text-sm text-[#0D0D0D]">✓ Phone: {lead.phone}</p>}
                {lead.business_evidence && (lead.business_evidence as BusinessEvidence).facts.length > 0 && (
                  <div>
                    <p className="text-sm text-[#0D0D0D] font-semibold mb-2">From Google:</p>
                    {((lead.business_evidence as BusinessEvidence).facts || []).slice(0, 3).map((fact, i) => (
                      <p key={i} className="text-sm text-[#0D0D0D] ml-4">✓ {fact.fact}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* From conversations */}
            {lead.human_observations && (lead.human_observations as Record<string, unknown>[]).length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0D0D0D] mb-3">From conversations</h4>
                <div className="space-y-2">
                  {(lead.human_observations as Record<string, unknown>[]).slice(-5).map((obs, i) => (
                    <p key={i} className="text-sm text-[#0D0D0D]">
                      ✓ {(obs as Record<string, unknown>).observation as string}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Standing order details */}
            {status === "closed" && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0D0D0D] mb-3">Standing order</h4>
                <div className="space-y-2 text-sm text-[#0D0D0D]">
                  {soForm.pickup_postcode && <p>✓ Pickup: {soForm.pickup_postcode}</p>}
                  {soForm.delivery_postcode && <p>✓ Delivery: {soForm.delivery_postcode}</p>}
                  {soForm.preferred_time && <p>✓ Preferred time: {soForm.preferred_time}</p>}
                </div>
              </div>
            )}

            {/* What we don't know */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0D0D0D] mb-3">What we still need</h4>
              <div className="space-y-2">
                {!soForm.pickup_postcode && <p className="text-sm text-[#888888]">? Pickup postcode</p>}
                {!soForm.delivery_postcode && <p className="text-sm text-[#888888]">? Delivery postcode</p>}
                {!soForm.preferred_time && <p className="text-sm text-[#888888]">? Preferred service time</p>}
                <p className="text-sm text-[#888888]">? Load characteristics</p>
                <p className="text-sm text-[#888888]">? Special constraints</p>
                <p className="text-sm text-[#888888]">? Decision maker verification</p>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full bg-[#0D0D0D] hover:bg-[#1a1a1a] text-white font-semibold py-2 rounded-full text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Conversation Guidance Modal */}
      {showConversationGuidance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-6 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-sans font-bold text-[#0D0D0D] text-lg">Conversation Guide</h3>
                <p className="text-sm text-[#888888]">Psychology-based prompts for {lead.business_name}</p>
              </div>
              <button
                onClick={() => setShowConversationGuidance(false)}
                className="text-[#888888] hover:text-[#0D0D0D] text-2xl font-light"
              >
                ×
              </button>
            </div>

            {/* Opening Prompt */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0D0D0D] mb-3">How to start</h4>
              <div className="bg-white rounded-lg p-4 border border-[#E8E8E8]">
                <p className="text-sm text-[#0D0D0D] italic">
                  "{getOpeningPrompt({ businessName: lead.business_name, category: lead.business_category || "business", painPoint: lead.pain_point, hasEngaged: false, hasPartialOrder: false })}"
                </p>
                <p className="text-[9px] text-[#888888] mt-2">Lead with their situation. Get them talking.</p>
              </div>
            </div>

            {/* Discovery Questions */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0D0D0D] mb-3">Discovery questions</h4>
              <div className="space-y-2">
                <div className="bg-white border border-[#E8E8E8] rounded-lg p-3">
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Frequency trigger</p>
                  <p className="text-[11px] text-[#666666]">"How often do you handle pickups or deliveries like this?"</p>
                </div>
                <div className="bg-white border border-[#E8E8E8] rounded-lg p-3">
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Current pain</p>
                  <p className="text-[11px] text-[#666666]">"What's your biggest headache with logistics right now?"</p>
                </div>
                <div className="bg-white border border-[#E8E8E8] rounded-lg p-3">
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Timeline</p>
                  <p className="text-[11px] text-[#666666]">"When would you want to get started?"</p>
                </div>
              </div>
            </div>

            {/* Objection Handler */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0D0D0D] mb-3">When they object</h4>
              <div className="bg-[#FEF5E7] border border-[#E8E8E8] rounded-lg p-4">
                <p className="text-[10px] font-semibold text-[#0D0D0D] mb-2">Price concern?</p>
                <p className="text-[11px] text-[#666666] mb-3">"{handleObjection("cost").acknowledge} {handleObjection("cost").reframe}"</p>
                <p className="text-[10px] text-[#888888]">Then add: {handleObjection("cost").proof}</p>
              </div>
            </div>

            {/* Closing Prompt */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0D0D0D] mb-3">How to close</h4>
              <div className="bg-[#E8F8F5] rounded-lg p-4 border border-[#E8E8E8]">
                <p className="text-sm text-[#0D0D0D] italic">
                  "So if I can get your driver in 15 minutes and same-day delivery, that solves [their pain point]?"
                </p>
                <p className="text-[9px] text-[#888888] mt-2">Confirm value. Then move to standing order details.</p>
              </div>
            </div>

            <button
              onClick={() => setShowConversationGuidance(false)}
              className="w-full bg-[#0D0D0D] hover:bg-[#1a1a1a] text-white font-semibold py-2 rounded-full text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Debug Panel - Development Only */}
      {typeof window !== "undefined" && process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "#fff",
            padding: "12px 16px",
            fontSize: "11px",
            zIndex: 9999,
            borderRadius: "6px",
            fontFamily: "monospace",
            maxWidth: "300px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            📋 Brief Modal Debug
          </div>
          <div style={{ marginBottom: "4px" }}>
            prospectBriefUrl:{" "}
            <span style={{ color: prospectBriefUrl ? "#0f0" : "#f00" }}>
              {prospectBriefUrl ? "SET" : "null"}
            </span>
          </div>
          {prospectBriefUrl && (
            <div style={{ marginBottom: "4px", color: "#0f0", fontSize: "10px", wordBreak: "break-all" }}>
              {prospectBriefUrl.substring(0, 50)}...
            </div>
          )}
          <button
            onClick={() => setProspectBriefUrl(null)}
            style={{
              marginTop: "6px",
              padding: "4px 8px",
              backgroundColor: "#f00",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "10px",
            }}
          >
            Clear URL
          </button>
        </div>
      )}
    </div>
  );
}

interface DiscoverPanelProps {
  onRefresh: () => void;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  industry?: string;
  city?: string;
}

function DiscoverPanel({ onRefresh, setLeads, industry: defaultIndustry, city: defaultCity }: DiscoverPanelProps): React.ReactElement {
  const [industry, setIndustry] = useState(defaultIndustry || Object.values(B2B_INDUSTRIES)[0][0]);
  const [deliveryType, setDeliveryType] = useState(DELIVERY_TYPES[0]);
  const [city, setCity] = useState(defaultCity || "London");
  const [running, setRunning] = useState(false);
  const [loadingNewLeads, setLoadingNewLeads] = useState(false);
  const [result, setResult] = useState<{ count: number; added: string[] } | null>(null);

  // Auto-set delivery type when industry changes (PRIORITY 4)
  useEffect(() => {
    const recommendedType = getDeliveryTypeForIndustry(industry);
    if (recommendedType && DELIVERY_TYPES.includes(recommendedType)) {
      setDeliveryType(recommendedType);
    }
  }, [industry]);

  async function discover() {
    setRunning(true);
    setResult(null);
    setLoadingNewLeads(true);

    try {
      const res = await fetch("/api/b2b/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: industry, delivery_type: deliveryType, city }),
      });

      const data = await res.json() as { count: number; added: string[]; success: boolean };
      setResult(data);

      // --- PRIORITY 2 TIER 2: OPTIMISTIC UPDATE ---
      // Create temporary lead objects with placeholder IDs
      const newLeads = data.added.map((name, idx) => ({
        id: `temp-${Date.now()}-${idx}`, // temporary ID, will be replaced by refresh
        business_name: name,
        business_category: industry,
        email: "", // placeholder, will be replaced by server data
        created_at: new Date().toISOString(),
        status: "new" as const,
        lead_state: "new" as const,
        transitioned_at: null,
        city,
        delivery_type: deliveryType,
        source: "discovery" as const,
        updated_at: new Date().toISOString(),
        self_confirmed: false,
        outreach: null,
        // optional fields left undefined
      } as Lead));

      // Add optimistically to frontend immediately
      setLeads(prev => [...prev, ...newLeads]);

      // Give DB time to commit before refresh
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh server truth - this will fetch real leads and onRefresh triggers parent re-render
      onRefresh();
    } finally {
      setRunning(false);
      setLoadingNewLeads(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#CCCCCC] rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">Discover leads via Google Maps</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#CCCCCC] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {Object.entries(B2B_INDUSTRIES).map(([category, industries]) => (
                <optgroup key={category} label={category}>
                  {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Delivery Type</label>
            <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#CCCCCC] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {DELIVERY_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">City</label>
            <select value={city} onChange={e => setCity(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#CCCCCC] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
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
          <div className="mt-4">
            {loadingNewLeads ? (
              <div className="bg-white border border-[#CCCCCC] rounded-xl px-4 py-3">
                <p className="text-[#888888] text-sm font-medium mb-3">Adding {result.count} leads to pipeline…</p>
                <SkeletonLeadCards count={result.count} />
              </div>
            ) : (
              <div className="bg-white border border-[#CCCCCC] rounded-xl px-4 py-3">
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
        )}
      </div>

      {/* CSV Import Section */}
      <CSVImportPanel onRefresh={onRefresh} setLeads={setLeads} />

      <div className="bg-white border border-[#CCCCCC] rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">Review monitoring</p>
        <p className="text-[#0D0D0D] text-sm font-medium mb-1">Pain point detection is automatic.</p>
        <p className="text-[#888888] text-sm leading-relaxed">
          We scan business reviews to find companies struggling with delivery issues, shipping complaints, or supply chain friction. When we spot these pain points, we flag them so you can reach out at the right time.
        </p>
      </div>
    </div>
  );
}

function CSVImportPanel({ onRefresh, setLeads }: { onRefresh: () => void; setLeads: React.Dispatch<React.SetStateAction<Lead[]>> }): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ count: number; added: string[] } | null>(null);

  async function importCSV(csvText: string) {
    if (!csvText.trim()) return;
    setImporting(true);
    try {
      const res = await fetch("/api/b2b/csv-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData: csvText }),
      });

      const data = await res.json() as { count: number; added: string[]; success: boolean };
      setResult(data);
      setFileName(null);

      // Optimistic update
      const newLeads = data.added.map((name, idx) => ({
        id: `temp-csv-${Date.now()}-${idx}`,
        business_name: name,
        email: "",
        status: "new" as const,
        lead_state: "new" as const,
        transitioned_at: null,
        source: "csv" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        self_confirmed: false,
        outreach: null,
      } as unknown as Lead));

      setLeads(prev => [...prev, ...newLeads]);

      // Refresh server truth
      await new Promise(r => setTimeout(r, 1000));
      onRefresh();
    } finally {
      setImporting(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      await importCSV(csvText);
    };
    reader.readAsText(file);
  }

  return (
    <div className="bg-white border border-[#CCCCCC] rounded-2xl p-5">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">Or upload CSV</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#CCCCCC] rounded-xl text-[#0D0D0D] font-semibold text-sm transition-all duration-150 hover:border-[#0D0D0D] hover:bg-white active:bg-[#E8E8E8] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>📎</span>
        {importing ? "Processing…" : fileName ? `✓ ${fileName}` : "Upload CSV file"}
      </button>
      <p className="text-[#888888] text-xs mt-3">Required columns: business_name, business_category, city. Optional: email, website, phone, pain_point, review_rating</p>
      {result && (
        <div className="mt-4 bg-white border border-[#CCCCCC] rounded-xl px-4 py-3">
          <p className="text-[#0D0D0D] text-sm font-semibold">{result.count} leads imported</p>
          {result.added.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.added.map(name => (
                <li key={name} className="text-[#888888] text-xs">· {name}</li>
              ))}
            </ul>
          )}
        </div>
      )}
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
    <div className="bg-white border border-[#CCCCCC] rounded-2xl p-5 space-y-3">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">Add lead manually</p>
      <input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Business name *" className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />

      <div className="grid grid-cols-2 gap-3">
        <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          {Object.entries(B2B_INDUSTRIES).map(([category, industries]) => (
            <optgroup key={category} label={category}>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </optgroup>
          ))}
        </select>
        <select value={form.deliveryType} onChange={e => setForm(f => ({ ...f, deliveryType: e.target.value }))} className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          {DELIVERY_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
        </select>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
        <select value={form.deliveryFrequency} onChange={e => setForm(f => ({ ...f, deliveryFrequency: e.target.value }))} className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Delivery Frequency</option>
          {DELIVERY_FREQUENCIES.map(df => <option key={df} value={df}>{df}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select value={form.averageDeliveries} onChange={e => setForm(f => ({ ...f, averageDeliveries: e.target.value }))} className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Avg Deliveries/Month</option>
          {AVERAGE_DELIVERIES.map(ad => <option key={ad} value={ad}>{ad}</option>)}
        </select>
        <select value={form.courierProvider} onChange={e => setForm(f => ({ ...f, courierProvider: e.target.value }))} className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Current Courier</option>
          {COURIER_PROVIDERS.map(cp => <option key={cp} value={cp}>{cp}</option>)}
        </select>
        <select value={form.deliveryChallenge} onChange={e => setForm(f => ({ ...f, deliveryChallenge: e.target.value }))} className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Biggest Challenge</option>
          {DELIVERY_CHALLENGES.map(dc => <option key={dc} value={dc}>{dc}</option>)}
        </select>
      </div>

      <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notes or pain point" className="w-full px-4 py-2.5 border border-[#CCCCCC] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D] resize-none" />
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
        <div className="bg-white border border-[#CCCCCC] rounded-2xl p-8 text-center">
          <p className="text-[#888888] text-sm">No standing orders yet. Close a lead to create one.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#CCCCCC] rounded-2xl overflow-hidden divide-y divide-[#EAE6E0]">
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
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const orders = initialOrders;

  function refresh() {
    router.refresh();
  }

  // Sync server data (from refresh) with local state
  // This allows optimistic updates to merge with server truth
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

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
      <div className="flex flex-wrap gap-3 mb-12">
        {activeTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-[#0D0D0D] text-white" : "text-[#666666] hover:text-[#0D0D0D] border border-[#CCCCCC]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pipeline" && (
        <div className="space-y-4">
          {pipelineLeads.length === 0 ? (
            <div className="bg-white border border-[#CCCCCC] rounded-2xl p-8 text-center">
              <p className="text-[#888888] text-sm">No active leads. Use Discover to find your first batch.</p>
            </div>
          ) : (
            (() => {
              const getLeadScore = (lead: Lead): number => {
                const hasFormData = lead.delivery_frequency || lead.average_deliveries || lead.courier_provider;
                if (hasFormData) {
                  return calculateLeadScore({
                    industry: lead.business_category,
                    deliveryFrequency: lead.delivery_frequency,
                    averageDeliveries: lead.average_deliveries,
                    courierProvider: lead.courier_provider,
                    deliveryChallenge: lead.delivery_challenge,
                  }).total;
                } else {
                  return scoreDiscoveredLead({
                    industryCategory: lead.business_category,
                    painPoint: lead.pain_point,
                    painPointReview: lead.pain_point_review,
                    reviewRating: lead.review_rating,
                  });
                }
              };

              const sortedLeads = [...pipelineLeads].sort((a, b) => {
                // Sort by heat score (engagement_score) first
                const aHeat = a.engagement_score || 0;
                const bHeat = b.engagement_score || 0;
                if (bHeat !== aHeat) return bHeat - aHeat;
                // Fallback to qualification score
                return getLeadScore(b) - getLeadScore(a);
              });
              return sortedLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onRefresh={refresh} />
              ));
            })()
          )}
        </div>
      )}

      {tab === "discover" && <DiscoverPanel onRefresh={refresh} setLeads={setLeads} />}
      {tab === "add" && <AddLeadPanel onRefresh={refresh} />}
      {tab === "standing" && <StandingOrdersPanel orders={orders} onGenerate={refresh} />}
    </div>
  );
}
