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
  new: "bg-[#F5F5F5] text-[#888888] border border-[#EAE6E0]",
  contacted: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#EAE6E0]",
  warm: "bg-[#0D0D0D] text-white",
  inbound: "bg-[#0D0D0D] text-white",
  closed: "bg-[#F5F5F5] text-[#888888] border border-[#EAE6E0]",
  dead: "bg-[#F5F5F5] text-[#888888] border border-[#EAE6E0]",
};

// Subtle state-based styling (greyscale only, visual feedback for worked leads)
const WORKFLOW_STATE_STYLE: Record<string, { border: string; bg: string }> = {
  new: { border: "border-l-2 border-l-[#EAE6E0]", bg: "bg-white" },
  recognized: { border: "border-l-2 border-l-[#0D0D0D]", bg: "bg-[#FAFAFA]" },
  engaged: { border: "border-l-2 border-l-[#0D0D0D]", bg: "bg-[#F5F5F5]" },
  self_confirmed: { border: "border-l-2 border-l-[#0D0D0D]", bg: "bg-[#F0F0F0]" },
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

  // Determine priority accent color for card border
  const priorityAccent = !hasFormData
    ? (scoreBreakdown.total >= 60 ? "border-l-[#2ECC71]" :
       scoreBreakdown.total >= 40 ? "border-l-[#F39C12]" :
       "border-l-[#BDBDBD]")
    : "border-l-[#BDBDBD]";

  return (
    <div className={`border border-l-4 rounded-xl overflow-hidden transition-all duration-300 border-[#EAE6E0] hover:border-[#0D0D0D] ${priorityAccent} ${cardStyle.bg} ${cardStyle.border}`} style={{ borderWidth: isExpanded ? '1.5px' : '1px', borderLeftWidth: '4px' }}>
      <button
        className={`w-full text-left px-5 py-4 flex items-start justify-between gap-4 transition-all duration-300 ${
          isExpanded
            ? "hover:opacity-75 active:opacity-60"
            : "hover:opacity-75 active:opacity-60"
        }`}
        onClick={() => { setExpanded(e => !e); if (!expanded && !draft && lead.email) getDraft(); }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-sans font-bold text-sm transition-colors duration-300 text-[#0D0D0D]">{lead.business_name}</p>
            {hasPainPoint && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-[0.1em] transition-colors duration-300 ${
                isExpanded
                  ? "text-white bg-[#0D0D0D]"
                  : "text-white bg-[#0D0D0D]"
              }`}>
                Pain point
              </span>
            )}
            {lead.source === "inbound" && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-[0.1em] border transition-colors duration-300 text-[#0D0D0D] bg-[#F5F5F5] border-[#EAE6E0]">
                Inbound
              </span>
            )}
          </div>
          <p className="text-xs transition-colors duration-300 text-[#888888]">
            {lead.business_category}{lead.delivery_type ? ` · ${lead.delivery_type}` : ""}{lead.city ? ` · ${lead.city}` : ""}
            {lead.email ? ` · ${lead.email}` : " · No email"}
          </p>
          {hasPainPoint && (
            <p className="text-xs mt-0.5 italic transition-colors duration-300 text-[#888888]">&ldquo;{lead.pain_point_review?.slice(0, 80)}…&rdquo;</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-2">
            {/* Priority label + score for discovered leads (priority first) */}
            {!hasFormData && (
              <div className="flex flex-col items-end gap-0.5">
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  scoreBreakdown.total >= 60 ? "text-[#2ECC71]" :
                  scoreBreakdown.total >= 40 ? "text-[#F39C12]" :
                  "text-[#888888]"
                }`}>
                  {scoreBreakdown.total >= 60 ? "High Priority" :
                   scoreBreakdown.total >= 40 ? "Medium Priority" :
                   "Baseline"}
                </span>
                <span className="text-[9px] text-[#AAAAAA]">{scoreBreakdown.total}/100</span>
              </div>
            )}
            {/* Form-based lead score */}
            {hasFormData && (
              <span className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors duration-300 ${scoreStyle.containerClass} ${scoreStyle.badgeClass}`}>
                {scoreLabel}
              </span>
            )}
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] transition-colors duration-300 ${STATUS_STYLE[status] ?? STATUS_STYLE.new}`}>
              {STATUS_LABELS[status] ?? status}
            </span>
          </div>
          {lead.created_at && <p className="text-[10px] transition-colors duration-300 text-[#888888]">{timeAgo(lead.created_at)}</p>}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t transition-colors duration-300 border-[#EAE6E0]">
          {/* Lead state status line - Apple minimal design */}
          {workflowState === "recognized" && (
            <div className="mb-4 pt-2 pb-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-semibold tracking-widest uppercase transition-colors duration-300 text-[#0D0D0D]">Recognized</span>
                  <span className="text-[10px] transition-colors duration-300 text-[#888888]">Email sent</span>
                </div>
                {lead.created_at && <span className="text-[10px] ml-auto transition-colors duration-300 text-[#AAAAAA]">{formatTime(lead.created_at)}</span>}
              </div>
              <div className="h-px bg-gradient-to-r mt-2 transition-colors duration-300 from-[#0D0D0D] via-[#EAE6E0] to-transparent"></div>
            </div>
          )}

          {/* Opportunity Score / Signal Label */}
          <div className={`border rounded-xl p-3 mb-4 transition-colors duration-300 ${
            isExpanded
              ? "bg-white/10 border-white/20"
              : scoreStyle.containerClass
          }`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2 transition-colors duration-300 text-[#0D0D0D]">Opportunity Signal</p>
            {hasFormData ? (
              // Form-based leads: show detailed score breakdown
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
            ) : (
              // Discovered leads: Score + Priority + Signals
              <div className={`text-sm transition-colors duration-300`}>
                {/* Score and Priority Label */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${
                      scoreBreakdown.total >= 60 ? "text-[#2ECC71]" :
                      scoreBreakdown.total >= 40 ? "text-[#F39C12]" :
                      "text-[#888888]"
                    }`}>
                      {scoreBreakdown.total}
                    </span>
                    <span className="text-[#AAAAAA]">/100</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ${
                    scoreBreakdown.total >= 60 ? "bg-[#E8F5E9] text-[#2ECC71]" :
                    scoreBreakdown.total >= 40 ? "bg-[#FFF3E0] text-[#F39C12]" :
                    "bg-[#F5F5F5] text-[#666666]"
                  }`}>
                    {scoreBreakdown.total >= 60 ? "High Priority" :
                     scoreBreakdown.total >= 40 ? "Medium Priority" :
                     "Baseline Opportunity"}
                  </span>
                </div>

                {/* Signals */}
                <div className="mt-3 pt-3 border-t border-[#E8E8E8]">
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em] mb-2">Signals:</p>
                  <div className="space-y-1 mb-4">
                    {hasPainPoint ? (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#2ECC71] font-bold">✓</span>
                          <span className="text-[#0D0D0D]">Customer complaint in reviews</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#2ECC71] font-bold">✓</span>
                          <span className="text-[#0D0D0D]">Delivery/service issue detected</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#AAAAAA]">—</span>
                        <span className="text-[#666666]">No operational friction detected</span>
                      </div>
                    )}
                  </div>

                  {/* Recommended Action */}
                  <div className="pt-3 border-t border-[#E8E8E8]">
                    <p className="text-[10px] font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] mb-2">Recommended next step:</p>
                    <p className="text-xs text-[#0D0D0D] font-medium">
                      {scoreBreakdown.total >= 60
                        ? "Send recognition email"
                        : scoreBreakdown.total >= 40
                          ? "Investigate reviews further"
                          : "Archive for lower priority"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conversation Progress Indicator - visible for all leads */}
          <div className="mb-4 pt-3 pb-3 border-t transition-colors duration-300 border-[#EAE6E0]">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.5px] mb-2 transition-colors duration-300 text-[#666666]`}>
              Conversation Progress
            </p>

            {/* Progress stages */}
            <div className="flex items-center gap-2 text-[10px] font-medium mb-3">
              <span className={`transition-colors duration-300 ${
                workflowState === "new"
                  ? "font-semibold text-[#0D0D0D]"
                  : "text-[#AAAAAA]"
              }`}>
                Discover
              </span>
              <span className={`transition-colors duration-300 text-[#CCC]`}>→</span>
              <span className={`transition-colors duration-300 ${
                workflowState === "recognized"
                  ? "font-semibold text-[#0D0D0D]"
                  : "text-[#AAAAAA]"
              }`}>
                Recognize
              </span>
              <span className={`transition-colors duration-300 text-[#CCC]`}>→</span>
              <span className={`transition-colors duration-300 ${
                workflowState === "engaged"
                  ? "font-semibold text-[#0D0D0D]"
                  : "text-[#AAAAAA]"
              }`}>
                Engage
              </span>
              <span className={`transition-colors duration-300 text-[#CCC]`}>→</span>
              <span className={`transition-colors duration-300 ${
                workflowState === "self_confirmed"
                  ? "font-semibold text-[#0D0D0D]"
                  : "text-[#AAAAAA]"
              }`}>
                Activate
              </span>
            </div>

            {/* State-specific explanation (fallback-safe) */}
            <p className={`text-[10px] mb-2 transition-colors duration-300 text-[#666666]`}>
              {currentStateDescription.description}
            </p>

            {/* Next step guidance */}
            <p className={`text-[10px] transition-colors duration-300 text-[#AAAAAA]`}>
              {currentStateDescription.nextStep}
            </p>
          </div>

          {/* Recognition email success feedback - Apple minimal + Linear precision */}
          {confirmationSuccessMessage && (
            <div className={`mb-4 px-4 py-3 rounded-lg border animate-in fade-in duration-200 transition-colors duration-300 ${
              isExpanded
                ? "border-white/20 bg-white/10"
                : "border-[#EAE6E0] bg-[#FAFAFA]"
            } ${!confirmationSuccessMessage && "animate-out fade-out duration-300"}`}>
              <div className="flex items-start gap-3">
                <span className={`font-semibold text-sm mt-0.5 transition-colors duration-300 text-[#0D0D0D]`}>✓</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-semibold tracking-[0.5px] transition-colors duration-300 text-[#0D0D0D]`}>Recognition sent</p>
                  <p className={`text-[10px] mt-1.5 transition-colors duration-300 text-[#666666]`}>{lead.email}</p>
                  <p className={`text-[10px] mt-1 transition-colors duration-300 text-[#AAAAAA]`}>{new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recognition email button or draft preview */}
          {recognitionDraft ? (
            <div className="bg-[#FAFAFA] border border-[#EAE6E0] rounded-lg p-4 mb-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[#666666]">Recognition email preview</p>
              <input
                value={recognitionDraft.subject}
                onChange={e => setRecognitionDraft(d => d ? { ...d, subject: e.target.value } : d)}
                className="w-full text-sm font-semibold focus:outline-none pb-2 text-[#0D0D0D] bg-transparent border-b border-[#EAE6E0]"
              />
              <textarea
                value={recognitionDraft.body}
                onChange={e => setRecognitionDraft(d => d ? { ...d, body: e.target.value } : d)}
                rows={4}
                className="w-full text-sm bg-transparent focus:outline-none resize-none text-[#0D0D0D]"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={sendRecognitionEmail}
                  disabled={sendingRecognition}
                  className="font-semibold px-5 py-2 rounded-full text-xs transition-all duration-150 disabled:opacity-30 bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#0D0D0D] text-white"
                >
                  {sendingRecognition ? "Sending…" : "Send"}
                </button>
                <button
                  onClick={() => setRecognitionDraft(null)}
                  className="text-xs font-medium transition-colors text-[#888888] hover:text-[#0D0D0D]"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={previewRecognitionEmail}
              disabled={sendingRecognition || !lead.email}
              className="w-full font-semibold py-2.5 rounded-full text-xs transition-all duration-150 mb-4 disabled:opacity-30 disabled:cursor-not-allowed bg-[#0D0D0D] text-white hover:bg-[#1a1a1a] active:scale-98 hover:shadow-sm"
            >
              {sendingRecognition ? "Previewing…" : "Send recognition email"}
            </button>
          )}

          {/* Prospect brief link - always visible */}
          <Link
            href={`/prospect/${generateSlug(lead.business_name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full font-medium py-2.5 rounded-full text-xs transition-all duration-150 mb-4 block text-center border bg-[#F9F9F9] hover:bg-[#F0F0F0] text-[#0D0D0D] border-[#EAE6E0]"
          >
            View prospect brief
          </Link>

          {/* Lead details */}
          <div className="grid grid-cols-2 gap-3 py-4">
            {!!lead.phone && (
              <div>
                <p className={`text-[10px] uppercase tracking-[0.1em] transition-colors duration-300 text-[#888888]`}>Phone</p>
                <a href={`tel:${lead.phone}`} className={`text-sm font-semibold hover:underline transition-colors duration-300 text-[#0D0D0D]`}>{lead.phone}</a>
              </div>
            )}
            {!!lead.website && (
              <div>
                <p className={`text-[10px] uppercase tracking-[0.1em] transition-colors duration-300 text-[#888888]`}>Website</p>
                <a href={lead.website} target="_blank" rel="noopener noreferrer" className={`text-sm hover:underline truncate block transition-colors duration-300 text-[#0D0D0D]`}>{lead.website}</a>
              </div>
            )}
            {!!lead.delivery_frequency && (
              <div>
                <p className={`text-[10px] uppercase tracking-[0.1em] transition-colors duration-300 text-[#888888]`}>Frequency</p>
                <p className={`text-sm transition-colors duration-300 text-[#0D0D0D]`}>{lead.delivery_frequency}</p>
              </div>
            )}
            {!!lead.average_deliveries && (
              <div>
                <p className={`text-[10px] uppercase tracking-[0.1em] transition-colors duration-300 text-[#888888]`}>Avg Deliveries/Month</p>
                <p className={`text-sm transition-colors duration-300 text-[#0D0D0D]`}>{lead.average_deliveries}</p>
              </div>
            )}
            {!!lead.courier_provider && (
              <div>
                <p className={`text-[10px] uppercase tracking-[0.1em] transition-colors duration-300 text-[#888888]`}>Current Courier</p>
                <p className={`text-sm transition-colors duration-300 text-[#0D0D0D]`}>{lead.courier_provider}</p>
              </div>
            )}
            {!!lead.delivery_challenge && (
              <div>
                <p className={`text-[10px] uppercase tracking-[0.1em] transition-colors duration-300 text-[#888888]`}>Main Challenge</p>
                <p className={`text-sm transition-colors duration-300 text-[#0D0D0D]`}>{lead.delivery_challenge}</p>
              </div>
            )}
            {hasPainPoint && (
              <div className="col-span-2">
                <p className={`text-[10px] uppercase tracking-[0.1em] transition-colors duration-300 text-[#888888]`}>Pain point</p>
                <p className={`text-sm transition-colors duration-300 text-[#0D0D0D]`}>{lead.pain_point}</p>
                {!!lead.pain_point_review && (
                  <p className="text-xs mt-1 italic transition-colors duration-300 text-[#888888]">&ldquo;{lead.pain_point_review}&rdquo;</p>
                )}
              </div>
            )}
          </div>

          {/* Prospect Memory / Continuity Card - shows operator what prospect experienced */}
          {(lead.email_sent_at || lead.confirmed_at) && (
            <div className="border-l-2 border-gray-300 p-4 mb-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-gray-600 mb-2">Prospect Memory</p>

              {(lead.email_sent_at || lead.confirmed_at) && (
                <p className="text-[10px] text-gray-700 leading-relaxed">
                  <span className="font-semibold">Email sent:</span> {lead.email_sent_at ? `${new Date(lead.email_sent_at as string).toLocaleDateString()} ${new Date(lead.email_sent_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Not sent yet"} → {lead.pain_point || 'prospect need'}
                </p>
              )}

              {lead.confirmed_at && (
                <p className="text-[10px] text-gray-700 leading-relaxed">
                  <span className="font-semibold">Prospect validated:</span> {new Date(lead.confirmed_at as string).toLocaleDateString()} {new Date(lead.confirmed_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → Yes
                </p>
              )}

              {(soForm.pickup_postcode || soForm.delivery_postcode || soForm.day_of_week || soForm.price) && (
                <p className="text-[10px] text-gray-700 leading-relaxed">
                  <span className="font-semibold">Standing order:</span> {lead.pain_point || 'prospect need'} {soForm.day_of_week && `| Every ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][parseInt(soForm.day_of_week) - 1]}`} {soForm.price && `| £${soForm.price}`}
                </p>
              )}
            </div>
          )}

          {/* Suggested Opening - recognition/relief/trust layer for operator */}
          {hasPainPoint && (
            <div className={`border-l-4 border-l-[#2ECC71] bg-[#E8F5E9] rounded-lg p-5 mb-4 space-y-3 transition-colors duration-300`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✓</span>
                <p className={`text-[10px] font-black uppercase tracking-[0.5px] text-[#2ECC71]`}>Suggested Opening</p>
              </div>
              <div className={`px-4 py-3 rounded-md text-base font-semibold bg-white border-l-2 border-l-[#2ECC71] text-[#0D0D0D] italic`}>
                "Are you personally handling {(lead.pain_point || 'your needs').toLowerCase()} when volume peaks?"
              </div>
              <p className="text-[11px] text-[#0D0D0D] font-medium">Use this exact question to continue recognition → validation → standing order conversation.</p>
            </div>
          )}

          {/* Email input section - minimal design */}
          {emailMissing ? (
            <div className={`border rounded-lg p-4 mb-4 space-y-3 transition-colors duration-300 ${
              isExpanded
                ? "bg-white/10 border-white/20"
                : "bg-[#FAFAFA] border-[#EAE6E0]"
            }`}>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.5px] transition-colors duration-300 text-[#666666]`}>Add email address</p>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="name@company.co.uk"
                className={`w-full px-3 py-2.5 rounded-md text-sm focus:outline-none transition-all ${
                  isExpanded
                    ? "border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white focus:ring-1 focus:ring-white"
                    : "border border-[#EAE6E0] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]"
                }`}
              />
              <button
                onClick={saveEmail}
                disabled={savingEmail || !newEmail}
                className="w-full font-semibold px-5 py-2.5 rounded-full text-xs transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed bg-[#0D0D0D] text-white hover:bg-[#1a1a1a] active:scale-98 hover:shadow-sm"
              >
                {savingEmail ? "Saving…" : "Save email"}
              </button>
            </div>
          ) : draft ? (
            <div className={`border rounded-lg p-4 mb-4 space-y-3 transition-colors duration-300 ${
              isExpanded
                ? "bg-white/10 border-white/20"
                : "bg-[#FAFAFA] border-[#EAE6E0]"
            }`}>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.5px] transition-colors duration-300 text-[#666666]`}>Draft email</p>
              <input
                value={draft.subject}
                onChange={e => setDraft(d => d ? { ...d, subject: e.target.value } : d)}
                className={`w-full text-sm font-semibold focus:outline-none pb-2 transition-colors ${
                  isExpanded
                    ? "text-white bg-transparent border-b border-white/20"
                    : "text-[#0D0D0D] bg-transparent border-b border-[#EAE6E0]"
                }`}
              />
              <textarea
                value={draft.body}
                onChange={e => setDraft(d => d ? { ...d, body: e.target.value } : d)}
                rows={4}
                className={`w-full text-sm bg-transparent focus:outline-none resize-none transition-colors text-[#0D0D0D]`}
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={sendEmail}
                  disabled={sending}
                  className={`font-semibold px-5 py-2 rounded-full text-xs transition-all duration-150 disabled:opacity-30 ${
                    isExpanded
                      ? "bg-white hover:bg-white/90 active:bg-white text-[#0D0D0D]"
                      : "bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#0D0D0D] text-white"
                  }`}
                >
                  {sending ? "Sending…" : "Send"}
                </button>
                <button onClick={getDraft} className="text-xs font-medium transition-colors text-[#888888] hover:text-[#0D0D0D]">
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={getDraft}
              disabled={drafting}
              className={`w-full font-semibold py-2.5 rounded-full text-xs transition-all duration-150 mb-4 disabled:opacity-30 disabled:cursor-not-allowed ${
                isExpanded
                  ? "bg-white hover:bg-white/90 active:bg-white text-[#0D0D0D]"
                  : "bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#0D0D0D] text-white"
              }`}
            >
              {drafting ? "Drafting…" : "Draft email"}
            </button>
          )}

          {/* Engagement History - Show all outreach attempts and responses */}
          {outreachHistory.length > 0 && (
            <div className={`border rounded-lg p-4 mb-4 space-y-2 transition-colors duration-300 ${
              isExpanded
                ? "bg-white/10 border-white/20"
                : "bg-[#F9F7F4] border-[#EAE6E0]"
            }`}>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.5px] transition-colors duration-300 text-[#666666]`}>Engagement History</p>
              <div className="space-y-1.5">
                {outreachHistory.map((email) => (
                  <div key={email.id} className={`flex items-start justify-between text-xs p-2 rounded transition-colors ${
                    email.replied
                      ? "bg-[#E8F5E9] border border-[#C8E6C9]"
                      : "bg-white/50 border border-[#EAE6E0]"
                  }`}>
                    <div className="flex-1">
                      <p className={`font-semibold ${email.replied ? "text-[#2ECC71]" : "text-[#666666]"}`}>
                        {email.email_type === "initial" ? "Initial" : email.email_type === "follow_up_1" ? "Follow-up 1" : "Follow-up 2"}
                      </p>
                      <p className="text-[#888888] text-[10px] mt-0.5">
                        Sent {new Date(email.sent_at).toLocaleDateString()} at {new Date(email.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {email.replied && (
                      <span className="text-[#2ECC71] font-semibold whitespace-nowrap ml-2">✓ Replied</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action menu - condensed button layout */}
          {!showStandingOrder && (
            <div className={`pt-4 border-t transition-all border-[#EAE6E0]`}>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setShowStandingOrder(true)} className="font-medium px-4 py-2 rounded-lg text-xs transition-all duration-150 bg-[#0D0D0D] text-white hover:bg-[#1a1a1a]">
                  Create Standing Order
                </button>
                <button onClick={() => updateStatus("warm")} className="font-medium px-4 py-2 rounded-lg text-xs transition-all duration-150 border border-[#EAE6E0] text-[#0D0D0D] hover:border-[#0D0D0D]">
                  Mark Active
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setShowObservationModal(true)} className="font-medium px-4 py-2 rounded-lg text-xs transition-all duration-150 border border-[#EAE6E0] text-[#0D0D0D] hover:border-[#0D0D0D]">
                  Add Note
                </button>
                <button onClick={() => updateStatus("dead")} className="font-medium px-4 py-2 rounded-lg text-xs transition-all duration-150 text-[#888888] hover:text-[#0D0D0D]">
                  Archive
                </button>
              </div>
            </div>
          )}

          {/* Standing order section - refined design */}
          {showStandingOrder && (
            <div className="rounded-lg p-4 mb-4 space-y-3 transition-all duration-200 bg-[#FAFAFA] border border-[#EAE6E0]" style={{ borderWidth: expanded ? '1.5px' : '1px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.5px] transition-colors duration-200 text-[#666666]">Create standing order</p>

              {/* Continuity note: seamless transition from prospect validation question */}
              {hasPainPoint && (
                <div className="bg-white border border-[#E8E8E8] rounded p-3 -mx-4 px-4 mb-2">
                  <p className="text-[10px] text-[#666666]">
                    Prospect confirmed: {lead.pain_point?.toLowerCase()} coordination is their bottleneck when volume peaks. Capture their standing order requirements.
                  </p>
                </div>
              )}

              {/* Known vs Unknown Panel */}
              <div className="border-b border-[#EAE6E0] pb-4 -mx-4 px-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Known */}
                  <div className="bg-[#E8F5E9] rounded-lg p-3 border-l-3 border-l-[#2ECC71]">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-[#2ECC71] mb-2">✓ Known</p>
                    <div className="space-y-1.5">
                      {lead.business_name && <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#2ECC71] font-bold">✓</span> {lead.business_name}</p>}
                      {lead.business_category && <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#2ECC71] font-bold">✓</span> {lead.business_category}</p>}
                      {lead.email && <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#2ECC71] font-bold">✓</span> {lead.email}</p>}
                      {soForm.pickup_postcode && <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#2ECC71] font-bold">✓</span> Pickup: {soForm.pickup_postcode}</p>}
                      {soForm.delivery_postcode && <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#2ECC71] font-bold">✓</span> Delivery: {soForm.delivery_postcode}</p>}
                      {soForm.preferred_time && <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#2ECC71] font-bold">✓</span> Time: {soForm.preferred_time}</p>}
                      {lead.human_observations && (lead.human_observations as Record<string, unknown>[]).length > 0 && (
                        <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#2ECC71] font-bold">✓</span> {(lead.human_observations as Record<string, unknown>[]).length} observations</p>
                      )}
                    </div>
                  </div>

                  {/* Unknown */}
                  <div className="bg-[#FFF3E0] rounded-lg p-3 border-l-3 border-l-[#F39C12]">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-[#F39C12] mb-2">⚠ Still needed</p>
                    <div className="space-y-1.5">
                      {!soForm.pickup_postcode && <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#F39C12] font-bold">→</span> Pickup postcode</p>}
                      {!soForm.delivery_postcode && <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#F39C12] font-bold">→</span> Delivery postcode</p>}
                      <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#F39C12] font-bold">→</span> Load details</p>
                      <p className="text-[11px] text-[#0D0D0D]"><span className="text-[#F39C12] font-bold">→</span> Special constraints</p>
                    </div>
                  </div>
                </div>
              </div>

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
                  <div className="border-b border-[#EAE6E0] pb-3 -mx-4 px-4">
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
                              <div key={i} className="bg-white rounded-md p-2 mb-2 border border-[#EAE6E0]">
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
                              <div key={i} className="bg-white rounded-md p-2 mb-2 border border-[#EAE6E0]">
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
                              <div key={i} className="bg-white rounded-md p-2 mb-2 border border-[#EAE6E0]">
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
                  <input type="number" value={soForm.price} onChange={e => setSoForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 120" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#EAE6E0] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.5px] block mb-1 text-[#666666]">Day of week</label>
                  <select value={soForm.day_of_week} onChange={e => setSoForm(f => ({ ...f, day_of_week: e.target.value }))} className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#EAE6E0] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d, i) => (
                      <option key={d} value={i + 1}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <input type="text" value={soForm.preferred_time} onChange={e => setSoForm(f => ({ ...f, preferred_time: e.target.value }))} placeholder="Preferred time (e.g. 9am)" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#EAE6E0] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />

              <div className="border-t border-[#EAE6E0] pt-3 mt-2">
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
                          : 'border-[#EAE6E0] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]'
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
                          : 'border-[#EAE6E0] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]'
                      }`}
                    />
                    {validationErrors.delivery_postcode && (
                      <p className="text-[9px] text-red-500 mt-1">{validationErrors.delivery_postcode}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <input type="text" value={soForm.pickup_address} onChange={e => setSoForm(f => ({ ...f, pickup_address: e.target.value }))} placeholder="Pickup address (optional)" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#EAE6E0] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />
                  <input type="text" value={soForm.delivery_address} onChange={e => setSoForm(f => ({ ...f, delivery_address: e.target.value }))} placeholder="Delivery address (optional)" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#EAE6E0] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />
                </div>
              </div>

              <textarea value={soForm.notes} onChange={e => setSoForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notes (route, special requirements…)" className="w-full px-3 py-2 rounded-md text-sm focus:outline-none resize-none transition-all bg-white border border-[#EAE6E0] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]" />

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
          )}
        </div>
      )}

      {/* Prospect Brief URL Modal */}
      {prospectBriefUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-sans font-bold text-[#0D0D0D] text-lg">Prospect Brief Ready</h3>
            <p className="text-sm text-[#666666]">Share this link with the prospect or open it to verify the enriched brief:</p>

            <div className="bg-[#F5F5F5] border border-[#EAE6E0] rounded-lg p-3 space-y-2">
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
                className="flex-1 bg-[#F5F5F5] hover:bg-[#EAE6E0] text-[#0D0D0D] font-semibold py-2 rounded-full text-sm transition-all text-center"
              >
                Open
              </a>
              <button
                onClick={() => setProspectBriefUrl(null)}
                className="bg-[#F5F5F5] hover:bg-[#EAE6E0] text-[#0D0D0D] font-semibold px-4 py-2 rounded-full text-sm transition-all"
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
                  className="w-full px-3 py-2 rounded-md text-sm focus:outline-none resize-none transition-all bg-white border border-[#EAE6E0] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.5px] block mb-2 text-[#666666]">Context</label>
                <select
                  value={observationForm.context}
                  onChange={e => setObservationForm(f => ({ ...f, context: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-all bg-white border border-[#EAE6E0] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]"
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
                className="bg-[#F5F5F5] hover:bg-[#EAE6E0] text-[#0D0D0D] font-semibold px-4 py-2 rounded-full text-sm transition-all"
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
                <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#EAE6E0]">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-[#0D0D0D] mb-2">Operational Readiness</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-[#EAE6E0] rounded-full h-2">
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
              <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E8E8E8]">
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
      <div className="bg-[#F5F5F5] border border-[#EAE6E0] rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">Discover leads via Google Maps</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#EAE6E0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {Object.entries(B2B_INDUSTRIES).map(([category, industries]) => (
                <optgroup key={category} label={category}>
                  {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Delivery Type</label>
            <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#EAE6E0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {DELIVERY_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">City</label>
            <select value={city} onChange={e => setCity(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#EAE6E0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
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
              <div className="bg-white border border-[#EAE6E0] rounded-xl px-4 py-3">
                <p className="text-[#888888] text-sm font-medium mb-3">Adding {result.count} leads to pipeline…</p>
                <SkeletonLeadCards count={result.count} />
              </div>
            ) : (
              <div className="bg-white border border-[#EAE6E0] rounded-xl px-4 py-3">
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

      <div className="bg-[#F5F5F5] border border-[#EAE6E0] rounded-2xl p-5">
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
    <div className="bg-white border border-[#EAE6E0] rounded-2xl p-5">
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#EAE6E0] rounded-xl text-[#0D0D0D] font-semibold text-sm transition-all duration-150 hover:border-[#0D0D0D] hover:bg-[#F5F5F5] active:bg-[#E8E8E8] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>📎</span>
        {importing ? "Processing…" : fileName ? `✓ ${fileName}` : "Upload CSV file"}
      </button>
      <p className="text-[#888888] text-xs mt-3">Required columns: business_name, business_category, city. Optional: email, website, phone, pain_point, review_rating</p>
      {result && (
        <div className="mt-4 bg-[#F5F5F5] border border-[#EAE6E0] rounded-xl px-4 py-3">
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
    <div className="bg-white border border-[#EAE6E0] rounded-2xl p-5 space-y-3">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">Add lead manually</p>
      <input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Business name *" className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />

      <div className="grid grid-cols-2 gap-3">
        <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          {Object.entries(B2B_INDUSTRIES).map(([category, industries]) => (
            <optgroup key={category} label={category}>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </optgroup>
          ))}
        </select>
        <select value={form.deliveryType} onChange={e => setForm(f => ({ ...f, deliveryType: e.target.value }))} className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          {DELIVERY_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
        </select>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
        <select value={form.deliveryFrequency} onChange={e => setForm(f => ({ ...f, deliveryFrequency: e.target.value }))} className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Delivery Frequency</option>
          {DELIVERY_FREQUENCIES.map(df => <option key={df} value={df}>{df}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select value={form.averageDeliveries} onChange={e => setForm(f => ({ ...f, averageDeliveries: e.target.value }))} className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Avg Deliveries/Month</option>
          {AVERAGE_DELIVERIES.map(ad => <option key={ad} value={ad}>{ad}</option>)}
        </select>
        <select value={form.courierProvider} onChange={e => setForm(f => ({ ...f, courierProvider: e.target.value }))} className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Current Courier</option>
          {COURIER_PROVIDERS.map(cp => <option key={cp} value={cp}>{cp}</option>)}
        </select>
        <select value={form.deliveryChallenge} onChange={e => setForm(f => ({ ...f, deliveryChallenge: e.target.value }))} className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Biggest Challenge</option>
          {DELIVERY_CHALLENGES.map(dc => <option key={dc} value={dc}>{dc}</option>)}
        </select>
      </div>

      <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notes or pain point" className="w-full px-4 py-2.5 border border-[#EAE6E0] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D] resize-none" />
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
        <div className="bg-[#F5F5F5] border border-[#EAE6E0] rounded-2xl p-8 text-center">
          <p className="text-[#888888] text-sm">No standing orders yet. Close a lead to create one.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#EAE6E0] rounded-2xl overflow-hidden divide-y divide-[#EAE6E0]">
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
      <div className="flex flex-wrap gap-2 mb-6">
        {activeTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${tab === t.key ? "bg-[#0D0D0D] text-white" : "text-[#666666] hover:text-[#0D0D0D] border border-[#EAE6E0] hover:border-[#0D0D0D]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pipeline" && (
        <div className="space-y-3">
          {pipelineLeads.length === 0 ? (
            <div className="bg-[#F5F5F5] border border-[#EAE6E0] rounded-2xl p-8 text-center">
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

              const sortedLeads = [...pipelineLeads].sort((a, b) => getLeadScore(b) - getLeadScore(a));
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
