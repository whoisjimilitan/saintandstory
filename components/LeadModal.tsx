"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import posthog from "posthog-js";

function track(event: string, props?: Record<string, unknown>) {
  try { posthog.capture(event, props); } catch { /* */ }
}

type Answers = Record<string, string | boolean>;

const STEPS = [
  {
    id: "move_type", type: "options" as const,
    opts: ["Home move", "Office move", "Single items", "Long distance", "Student move", "Other"],
  },
  {
    id: "postcode_from", type: "input" as const,
    placeholder: "Town or postcode",
  },
  {
    id: "when", type: "options" as const,
    opts: ["As soon as possible", "This week", "In a few weeks", "I'm flexible"],
  },
  { id: "details", type: "details" as const },
  { id: "success", type: "success" as const },
];

const TOTAL = STEPS.length;

const HEADINGS: Record<string, ReactNode> = {
  move_type: <>What type of m<span className="font-display italic font-normal">o</span>ve?</>,
  postcode_from: <>Where fr<span className="font-display italic font-normal">o</span>m?</>,
  when: <>When d<span className="font-display italic font-normal">o</span> you need it?</>,
  details: <>Y<span className="font-display italic font-normal">o</span>ur details.</>,
};

function OptionCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-3.5 border rounded-2xl text-sm font-medium transition-colors mb-2 last:mb-0 ${
        selected
          ? "border-[#0D0D0D] bg-[#F5F5F5] text-[#0D0D0D] font-semibold"
          : "border-[#E8E8E8] text-[#888888] hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
      }`}
    >
      {label}
    </button>
  );
}

const inputCls = "w-full border border-[#E8E8E8] rounded-2xl px-4 py-3.5 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors";

interface LeadModalProps { isOpen: boolean; onClose: () => void; }

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [expanded, setExpanded] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[stepIdx];
  const progressPct = Math.round((stepIdx / (TOTAL - 1)) * 100);

  useEffect(() => {
    if (!isOpen) return;
    setExpanded(false);
    const t = setTimeout(() => requestAnimationFrame(() => setExpanded(true)), 800);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) track("lead_modal_opened", { step: stepIdx });
  }, [isOpen, stepIdx]);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setExpanded(false);
        setStepIdx(0);
        setAnswers({});
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function validate(): boolean {
    if (step.type === "options") return !!answers[step.id];
    if (step.type === "input") return ((answers[step.id] as string) ?? "").trim().length >= 2;
    if (step.type === "details") {
      return /\S+@\S+\.\S+/.test((answers.email as string) ?? "") &&
        ((answers.full_name as string) ?? "").trim().length >= 2;
    }
    return true;
  }

  const handleNext = useCallback(async () => {
    if (!validate()) return;
    track("lead_step_completed", { step: stepIdx, type: step.type });

    if (step.type === "details") {
      setIsSubmitting(true);
      try {
        const params = new URLSearchParams(window.location.search);
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...answers,
            utm: {
              utm_source: params.get("utm_source") ?? "",
              utm_medium: params.get("utm_medium") ?? "",
              utm_campaign: params.get("utm_campaign") ?? "",
            },
          }),
        });
        track("lead_submitted");
      } catch { /* non-fatal — still advance */ } finally {
        setIsSubmitting(false);
      }
    }

    if (stepIdx < TOTAL - 1) setStepIdx((i) => i + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, answers, step]);

  function handleBack() {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  const isSuccess = step.type === "success";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ backgroundColor: "rgba(13,13,13,0.65)", opacity: expanded ? 1 : 0 }}
        onClick={isSuccess ? onClose : undefined}
      />

      {/* Modal card — expands from pill */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          width: expanded ? "min(480px, calc(100vw - 32px))" : "300px",
          maxHeight: expanded ? "92vh" : "86px",
          transform: expanded ? "translateY(0)" : "translateY(calc(-50vh + 90px))",
          transition: "width 0.5s cubic-bezier(0.22,1,0.36,1), max-height 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >

        {/* Pill loading state */}
        {!expanded && (
          <div className="flex items-center gap-3 px-5 py-[26px]">
            <div className="w-6 h-6 rounded-full border-[2.5px] border-[#E8E8E8] border-t-[#0D0D0D] animate-spin shrink-0" />
            <div>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm leading-tight">Finding drivers near you</p>
              <p className="text-[#888888] text-xs mt-0.5">Just a moment…</p>
            </div>
          </div>
        )}

        {/* Expanded — success state */}
        {expanded && isSuccess && (
          <div className="px-8 py-14 text-center flex-1">
            <div className="w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center mx-auto mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0D0D0D]" />
            </div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">Request received</p>
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-4">
              Y<span className="font-display italic font-normal">o</span>u&apos;re
              <br />all set.
            </h2>
            <p className="text-[#888888] text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              We&apos;re matching available drivers in your area. Quotes will be with you shortly.
            </p>
            <button
              onClick={onClose}
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
            >
              Done →
            </button>
          </div>
        )}

        {/* Expanded — form steps */}
        {expanded && !isSuccess && (
          <>
            {/* Progress bar */}
            <div className="h-0.5 bg-[#E8E8E8] shrink-0">
              <div
                className="h-full bg-[#0D0D0D] transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#0D0D0D] transition-colors p-1 z-10"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Step body */}
            <div className="px-6 pt-8 pb-4 overflow-y-auto flex-1">
              <h2 className="font-sans font-black text-[#0D0D0D] text-xl tracking-tight mb-6 pr-8">
                {HEADINGS[step.id]}
              </h2>

              {step.type === "options" && (
                <div>
                  {(step as { opts: string[] }).opts.map((o) => (
                    <OptionCard
                      key={o}
                      label={o}
                      selected={answers[step.id] === o}
                      onClick={() => setAnswers({ ...answers, [step.id]: o })}
                    />
                  ))}
                </div>
              )}

              {step.type === "input" && (
                <input
                  type="text"
                  value={(answers[step.id] as string) ?? ""}
                  onChange={(e) => setAnswers({ ...answers, [step.id]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder={(step as { placeholder: string }).placeholder}
                  className={inputCls}
                  autoFocus
                />
              )}

              {step.type === "details" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={(answers.full_name as string) ?? ""}
                    onChange={(e) => setAnswers({ ...answers, full_name: e.target.value })}
                    placeholder="Your name"
                    className={inputCls}
                    autoFocus
                  />
                  <input
                    type="email"
                    value={(answers.email as string) ?? ""}
                    onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
                    placeholder="Email address"
                    className={inputCls}
                  />
                  <input
                    type="tel"
                    value={(answers.phone as string) ?? ""}
                    onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
                    placeholder="Phone number (optional)"
                    className={inputCls}
                  />
                  <p className="text-[#888888] text-xs pt-1">
                    Quotes sent to your email. We won&apos;t share your details.
                  </p>
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between px-6 py-5 border-t border-[#E8E8E8] shrink-0">
              <button
                onClick={handleBack}
                className={`text-[#888888] hover:text-[#0D0D0D] font-medium text-sm transition-colors ${stepIdx === 0 ? "invisible" : ""}`}
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={!validate() || isSubmitting}
                className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-7 py-2.5 rounded-full text-sm transition-colors"
              >
                {isSubmitting ? "Sending…" : step.type === "details" ? "Get quotes →" : "Continue →"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
