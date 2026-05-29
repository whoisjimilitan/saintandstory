"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";

interface LeadData {
  serviceType: string;
  largeItems: string[];
  timeframe: string;
  helpLoading: string;
  duration: string;
  postcode: string;
  email: string;
  phone: string;
  phoneConsent: string;
  fullName: string;
  marketingOptIn: boolean;
}

interface StepProps {
  lead: LeadData;
  setLead: React.Dispatch<React.SetStateAction<LeadData>>;
}

const EMPTY_LEAD: LeadData = {
  serviceType: "",
  largeItems: [],
  timeframe: "",
  helpLoading: "",
  duration: "",
  postcode: "",
  email: "",
  phone: "",
  phoneConsent: "",
  fullName: "",
  marketingOptIn: false,
};

// ── Shared UI ──────────────────────────────────────────────────────────────

function OptionCard({
  value,
  selected,
  onClick,
  emoji,
  label,
  sub,
}: {
  value: string;
  selected: boolean;
  onClick: (v: string) => void;
  emoji?: string;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`w-full text-left border rounded-xl p-4 transition-all flex items-start gap-3 ${
        selected
          ? "border-[#E8244A] bg-[#FFF1F3]"
          : "border-[#0D0E17]/12 hover:border-[#E8244A]/30 bg-white"
      }`}
    >
      {emoji && <span className="text-xl leading-none mt-0.5 shrink-0">{emoji}</span>}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${selected ? "text-[#E8244A]" : "text-[#0D0E17]"}`}>
          {label}
        </p>
        {sub && <p className="text-xs text-[#0D0E17]/45 mt-0.5">{sub}</p>}
      </div>
      {selected && (
        <div className="shrink-0 w-5 h-5 rounded-full bg-[#E8244A] flex items-center justify-center mt-0.5">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
}

function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mt-3 mb-5">
      <h2 className="font-sans font-black text-[#0D0E17] text-xl leading-snug">{title}</h2>
      <p className="text-[#0D0E17]/45 text-sm mt-1">{sub}</p>
    </div>
  );
}

// ── Steps ──────────────────────────────────────────────────────────────────

function Step1({ lead, setLead }: StepProps) {
  return (
    <div>
      <StepHeading title="What do you need to move?" sub="Select the option that best describes your job." />
      <div className="space-y-2.5">
        {[
          { value: "transport", emoji: "🚐", label: "Transport items only", sub: "Help moving specific items from A to B" },
          { value: "small_move", emoji: "📦", label: "Small flat move", sub: "1–2 bed flat with a few boxes" },
          { value: "whole_house", emoji: "🏠", label: "Whole house move", sub: "3+ bedrooms, full property clearance" },
          { value: "rubbish", emoji: "🗑️", label: "Rubbish removal", sub: "Clearing unwanted items or furniture" },
          { value: "office", emoji: "🏢", label: "Office / business move", sub: "Desks, equipment, commercial items" },
        ].map((o) => (
          <OptionCard
            key={o.value}
            {...o}
            selected={lead.serviceType === o.value}
            onClick={(v) => setLead((l) => ({ ...l, serviceType: v }))}
          />
        ))}
      </div>
    </div>
  );
}

function Step2({ lead, setLead }: StepProps) {
  function toggle(item: string) {
    setLead((l) => ({
      ...l,
      largeItems:
        item === "none"
          ? ["none"]
          : l.largeItems.includes(item)
          ? l.largeItems.filter((i) => i !== item)
          : [...l.largeItems.filter((i) => i !== "none"), item],
    }));
  }
  return (
    <div>
      <StepHeading title="Any large or heavy items?" sub="Select all that apply — this helps us match you with the right van size." />
      <div className="space-y-2.5">
        {[
          { value: "sofas", emoji: "🛋️", label: "Sofa(s)" },
          { value: "wardrobes", emoji: "🗄️", label: "Wardrobe(s)" },
          { value: "beds", emoji: "🛏️", label: "Bed frame(s)" },
          { value: "appliances", emoji: "🧺", label: "Appliances (washing machine, fridge, etc.)" },
          { value: "none", emoji: "📦", label: "No heavy items — just boxes and bags" },
        ].map((o) => (
          <OptionCard
            key={o.value}
            {...o}
            selected={lead.largeItems.includes(o.value)}
            onClick={() => toggle(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

function Step3({ lead, setLead }: StepProps) {
  return (
    <div>
      <StepHeading title="When do you need to move?" sub="Choose the timeframe that works for you." />
      <div className="space-y-2.5">
        {[
          { value: "asap", emoji: "⚡", label: "As soon as possible", sub: "Today or tomorrow" },
          { value: "days", emoji: "📅", label: "Within a few days", sub: "This week" },
          { value: "weeks", emoji: "🗓️", label: "Within a few weeks", sub: "Planning ahead" },
          { value: "flexible", emoji: "🤷", label: "I'm flexible", sub: "No fixed date yet" },
        ].map((o) => (
          <OptionCard
            key={o.value}
            {...o}
            selected={lead.timeframe === o.value}
            onClick={(v) => setLead((l) => ({ ...l, timeframe: v }))}
          />
        ))}
      </div>
    </div>
  );
}

function Step4({ lead, setLead }: StepProps) {
  return (
    <div>
      <StepHeading title="Do you need help loading and unloading?" sub="Let us know so we can send the right team." />
      <div className="space-y-2.5">
        <OptionCard
          value="yes"
          emoji="💪"
          label="Yes, please help me load and unload"
          sub="Our team will carry everything — you just direct"
          selected={lead.helpLoading === "yes"}
          onClick={(v) => setLead((l) => ({ ...l, helpLoading: v }))}
        />
        <OptionCard
          value="no"
          emoji="🙅"
          label="No, I can handle loading myself"
          sub="Just transport — we drive, you load"
          selected={lead.helpLoading === "no"}
          onClick={(v) => setLead((l) => ({ ...l, helpLoading: v }))}
        />
      </div>
    </div>
  );
}

function Step5({ lead, setLead }: StepProps) {
  return (
    <div>
      <StepHeading title="How long do you think it will take?" sub="Rough estimate is fine — professionals will confirm." />
      <div className="space-y-2.5">
        {[
          { value: "2hrs", emoji: "⏰", label: "Up to 2 hours", sub: "Small load, short distance" },
          { value: "half_day", emoji: "🌤️", label: "Half a day", sub: "Roughly 3–5 hours" },
          { value: "all_day", emoji: "☀️", label: "All day", sub: "6+ hours, larger move" },
          { value: "multi_day", emoji: "📆", label: "Multiple days", sub: "Large house or complex move" },
        ].map((o) => (
          <OptionCard
            key={o.value}
            {...o}
            selected={lead.duration === o.value}
            onClick={(v) => setLead((l) => ({ ...l, duration: v }))}
          />
        ))}
      </div>
    </div>
  );
}

function Step6({ lead, setLead }: StepProps) {
  return (
    <div>
      <StepHeading title="Where are you moving from?" sub="Enter your postcode or town so we can find professionals nearby." />
      <input
        type="text"
        value={lead.postcode}
        onChange={(e) => setLead((l) => ({ ...l, postcode: e.target.value }))}
        placeholder="e.g. SW1A 1AA or Manchester"
        className="w-full border border-[#0D0E17]/15 rounded-xl px-4 py-3.5 text-sm text-[#0D0E17] placeholder-[#0D0E17]/30 focus:outline-none focus:ring-2 focus:ring-[#E8244A]/30 focus:border-[#E8244A] transition-all"
        autoFocus
      />
      <p className="text-xs text-[#0D0E17]/35 mt-3 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        We only use this to find professionals near you
      </p>
    </div>
  );
}

function Step7({ progress, postcode }: { progress: number; postcode: string }) {
  const messages = [
    "Checking availability near you…",
    "Matching you with verified professionals…",
    "Reviewing ratings and reviews…",
    "Almost there…",
  ];
  const msgIndex = Math.min(Math.floor(progress / 25), 3);
  return (
    <div className="py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FFF1F3] flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-[#E8244A] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <h2 className="font-sans font-black text-[#0D0E17] text-xl mb-2">Finding professionals near {postcode || "you"}…</h2>
      <p className="text-[#0D0E17]/45 text-sm mb-8 min-h-[1.25rem] transition-all">{messages[msgIndex]}</p>
      <div className="bg-[#0D0E17]/8 rounded-full h-2 overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#E8244A] to-[#C0183A] rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-[#0D0E17]/30">{Math.round(progress)}% complete</p>
    </div>
  );
}

function MatchCard({ name, initials, rating, jobs, specialty }: { name: string; initials: string; rating: string; jobs: number; specialty: string }) {
  return (
    <div className="border border-[#0D0E17]/10 rounded-xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-[#E8244A]/10 flex items-center justify-center shrink-0">
        <span className="text-[#E8244A] font-bold text-sm">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm text-[#0D0E17]">{name}</p>
          <span className="text-xs font-bold text-[#16a34a] bg-[#16a34a]/10 px-2 py-0.5 rounded-full shrink-0">Available</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <svg className="w-3.5 h-3.5 text-[#E8244A] fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs text-[#0D0E17]/55">{rating} · {jobs} jobs · {specialty}</span>
        </div>
      </div>
    </div>
  );
}

function Step8() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 mt-3">
        <div className="w-8 h-8 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-[#16a34a]">3 professionals found near you</span>
      </div>
      <h2 className="font-sans font-black text-[#0D0E17] text-xl mb-1">Here are your matches</h2>
      <p className="text-[#0D0E17]/45 text-sm mb-5">Enter your email to see full profiles and receive their quotes.</p>
      <div className="space-y-3">
        <MatchCard name="Marcus T." initials="MT" rating="4.9" jobs={312} specialty="Home & office moves" />
        <MatchCard name="Daniel K." initials="DK" rating="4.8" jobs={187} specialty="Same-day moves" />
        <MatchCard name="James O." initials="JO" rating="5.0" jobs={94} specialty="Piano & specialist items" />
      </div>
    </div>
  );
}

function Step9({ lead, setLead, error }: StepProps & { error: string }) {
  return (
    <div>
      <StepHeading title="Where should we send your quotes?" sub="Your email is required to unlock full profiles and receive quotes." />
      <input
        type="email"
        value={lead.email}
        onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
        placeholder="your@email.com"
        className="w-full border border-[#0D0E17]/15 rounded-xl px-4 py-3.5 text-sm text-[#0D0E17] placeholder-[#0D0E17]/30 focus:outline-none focus:ring-2 focus:ring-[#E8244A]/30 focus:border-[#E8244A] transition-all"
        autoFocus
      />
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <p className="text-xs text-[#0D0E17]/35 mt-3 flex items-start gap-1.5">
        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        We never share your email with third parties. Professionals will only contact you about your quote.
      </p>
    </div>
  );
}

const inputCls = "w-full border border-[#0D0E17]/15 rounded-xl px-4 py-3.5 text-sm text-[#0D0E17] placeholder-[#0D0E17]/30 focus:outline-none focus:ring-2 focus:ring-[#E8244A]/30 focus:border-[#E8244A] transition-all";

function Step10({ lead, setLead }: StepProps) {
  return (
    <div>
      <StepHeading
        title="Would you like to be called for a quote?"
        sub="Some professionals prefer a quick call to understand your job and give a more accurate price."
      />
      <div className="space-y-2.5 mb-4">
        <OptionCard
          value="yes"
          emoji="📞"
          label="Yes, they can call me"
          sub="Faster quotes, better accuracy"
          selected={lead.phoneConsent === "yes"}
          onClick={(v) => setLead((l) => ({ ...l, phoneConsent: v }))}
        />
        <OptionCard
          value="no"
          emoji="✉️"
          label="No thanks — email quotes only"
          selected={lead.phoneConsent === "no"}
          onClick={(v) => setLead((l) => ({ ...l, phoneConsent: v, phone: "" }))}
        />
      </div>
      {lead.phoneConsent === "yes" && (
        <>
          <input
            type="tel"
            value={lead.phone}
            onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value }))}
            placeholder="+44 7700 000 000"
            className={inputCls}
            autoFocus
          />
          <p className="text-xs text-[#0D0E17]/35 mt-2">
            We only share your number with the professionals you&apos;re matched with.
          </p>
        </>
      )}
    </div>
  );
}

function Step11({ lead, setLead }: StepProps) {
  return (
    <div>
      <StepHeading title="Almost done — what's your name?" sub="So professionals know how to address you." />
      <input
        type="text"
        value={lead.fullName}
        onChange={(e) => setLead((l) => ({ ...l, fullName: e.target.value }))}
        placeholder="Your full name"
        className={inputCls}
        autoFocus
      />
      <label className="flex items-start gap-3 mt-5 cursor-pointer">
        <input
          type="checkbox"
          checked={lead.marketingOptIn}
          onChange={(e) => setLead((l) => ({ ...l, marketingOptIn: e.target.checked }))}
          className="mt-0.5 accent-[#E8244A]"
        />
        <span className="text-xs text-[#0D0E17]/50 leading-relaxed">
          I agree to receive helpful moving tips and occasional offers from Saint &amp; Story Logistics. You can unsubscribe any time.
        </span>
      </label>
      <p className="text-xs text-[#0D0E17]/30 mt-4">
        By continuing you agree to our{" "}
        <a href="/privacy" className="underline">Privacy Policy</a> and{" "}
        <a href="/terms" className="underline">Terms of Service</a>.
      </p>
    </div>
  );
}

function Step12({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[#16a34a]/10 flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <h2 className="font-sans font-black text-[#0D0E17] text-2xl mb-2">You&apos;re on your way!</h2>
      <p className="text-[#0D0E17]/55 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
        We&apos;ve matched you with 3 professionals. Expect to hear from them shortly — most respond within 1 hour.
      </p>
      <div className="space-y-3">
        <button
          onClick={onClose}
          className="block w-full bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
        >
          View my matches →
        </button>
        <button
          onClick={onClose}
          className="block w-full border border-[#0D0E17]/12 text-[#0D0E17]/55 font-medium py-3.5 rounded-xl text-sm hover:bg-[#0D0E17]/5 transition-colors"
        >
          Add photos to my request
        </button>
      </div>
      <p className="text-xs text-[#0D0E17]/25 mt-5">
        Check your email for a confirmation from Saint &amp; Story Logistics.
      </p>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 12;

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [step, setStep] = useState(1);
  const [lead, setLead] = useState<LeadData>(EMPTY_LEAD);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Searching animation — auto-advance step 7 → 8
  useEffect(() => {
    if (step !== 7) return;
    setSearchProgress(0);
    const interval = setInterval(() => {
      setSearchProgress((p) => (p >= 100 ? 100 : p + 1.5));
    }, 40);
    const timer = setTimeout(() => setStep(8), 3800);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [step]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Track modal open
  useEffect(() => {
    if (isOpen) posthog.capture("lead_modal_opened");
  }, [isOpen]);

  // Reset state after close animation
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(1);
        setLead(EMPTY_LEAD);
        setSearchProgress(0);
        setError("");
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function canContinue() {
    switch (step) {
      case 1: return !!lead.serviceType;
      case 2: return lead.largeItems.length > 0;
      case 3: return !!lead.timeframe;
      case 4: return !!lead.helpLoading;
      case 5: return !!lead.duration;
      case 6: return lead.postcode.trim().length >= 2;
      case 8: return true;
      case 9: return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
      case 10: return lead.phoneConsent === "no" || (lead.phoneConsent === "yes" && lead.phone.trim().length >= 7);
      case 11: return lead.fullName.trim().length >= 2;
      default: return true;
    }
  }

  function handleBack() {
    // Skip step 7 (searching animation) on the way back
    setStep((s) => (s === 8 ? 6 : s - 1));
  }

  async function handleContinue() {
    if (!canContinue()) return;
    setError("");
    posthog.capture("lead_step_completed", { step });

    if (step === 11) {
      setIsSubmitting(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...lead,
            utm: {
              utm_source: params.get("utm_source") ?? "",
              utm_medium: params.get("utm_medium") ?? "",
              utm_campaign: params.get("utm_campaign") ?? "",
            },
          }),
        });
        if (!res.ok) throw new Error("API error");
        posthog.capture("lead_submitted", { serviceType: lead.serviceType });
        setStep(12);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep((s) => s + 1);
  }

  const showNav = (step >= 1 && step <= 6) || (step >= 8 && step <= 11);
  const showProgress = step < 12;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred overlay */}
      <div
        className="absolute inset-0 bg-[#0D0E17]/75 backdrop-blur-sm"
        onClick={step === 12 ? onClose : undefined}
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Progress bar */}
        {showProgress && (
          <div className="h-1 bg-[#0D0E17]/8 shrink-0">
            <div
              className="h-full bg-[#E8244A] transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        )}

        {/* Header */}
        {step < 12 && (
          <div className="flex items-center justify-between px-6 pt-5 pb-1 shrink-0">
            <span className="text-xs text-[#0D0E17]/35 font-medium">
              Step {step} of {TOTAL_STEPS}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#0D0E17]/8 flex items-center justify-center hover:bg-[#0D0E17]/15 transition-colors"
              aria-label="Close"
            >
              <svg className="w-3.5 h-3.5 text-[#0D0E17]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Step content */}
        <div className="px-6 overflow-y-auto flex-1">
          {step === 1 && <Step1 lead={lead} setLead={setLead} />}
          {step === 2 && <Step2 lead={lead} setLead={setLead} />}
          {step === 3 && <Step3 lead={lead} setLead={setLead} />}
          {step === 4 && <Step4 lead={lead} setLead={setLead} />}
          {step === 5 && <Step5 lead={lead} setLead={setLead} />}
          {step === 6 && <Step6 lead={lead} setLead={setLead} />}
          {step === 7 && <Step7 progress={searchProgress} postcode={lead.postcode} />}
          {step === 8 && <Step8 />}
          {step === 9 && <Step9 lead={lead} setLead={setLead} error={error} />}
          {step === 10 && <Step10 lead={lead} setLead={setLead} />}
          {step === 11 && <Step11 lead={lead} setLead={setLead} />}
          {step === 12 && <Step12 onClose={onClose} />}
        </div>

        {/* Navigation */}
        {showNav && (
          <div className="flex items-center gap-3 px-6 py-5 border-t border-[#0D0E17]/8 shrink-0">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="border border-[#0D0E17]/15 text-[#0D0E17]/55 font-medium py-3.5 px-5 rounded-xl text-sm hover:bg-[#0D0E17]/5 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleContinue}
              disabled={!canContinue() || isSubmitting}
              className="flex-1 bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
            >
              {isSubmitting ? "Sending…" : step === 11 ? "Get my free quotes →" : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
