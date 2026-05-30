"use client";

import { useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";

// ── Types ──────────────────────────────────────────────────────────────────
type Answers = Record<string, string | string[] | boolean>;

// ── Steps definition (mirrors HTML demo exactly) ───────────────────────────
const STEPS = [
  {
    id: "s1", type: "options", q: "What type of service do you need?",
    opts: ["Transport selected items of furniture", "Moving 1 or 2 rooms", "Moving a whole house", "Rubbish/refuse removal", "Moving Office"],
  },
  {
    id: "s2", type: "options", q: "What large items are you moving?",
    opts: ["No large items", "Sofa(s)", "Wardrobe(s)", "Beds and/or mattresses", "Large appliance (e.g. fridge, washing machine...)"],
  },
  {
    id: "s3", type: "options", q: "When do you need this service?",
    opts: ["I'm flexible", "As soon as possible", "On a specific date", "In the next few days", "In the next few weeks", "In next few months"],
  },
  { id: "s4", type: "options", q: "Will there be anyone to help load/unload?", opts: ["Yes", "No"] },
  {
    id: "s5", type: "options", q: "How long do you want the service for?",
    opts: ["Up to 2 hours", "Half Day", "All Day", "Multiple days"],
  },
  { id: "s6", type: "input", q: "Where do you need the Man and Van Service?", placeholder: "Enter postcode or town", name: "postcode_from" },
  { id: "s7", type: "search", q: "Searching for matches…" },
  { id: "s8", type: "found", q: "Great! We've found you the perfect matches." },
  { id: "s9", type: "email", q: "What email address would you like quotes sent to?", name: "email" },
  { id: "s10", type: "phoneConsent", q: "Your number is safe with us." },
  { id: "s11", type: "name", q: "What is your name?", placeholder: "Please tell us your name", name: "full_name" },
  { id: "s12", type: "success", q: "We've posted your request" },
] as const;

const TOTAL = STEPS.length;

// ── Shared ─────────────────────────────────────────────────────────────────
const inputCls = "w-full border border-[#e6eefb] rounded-lg px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all";

function OptionCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
        selected
          ? "bg-gradient-to-r from-[#eef6ff] to-white border-brand shadow-sm shadow-brand/10 font-semibold text-navy"
          : "bg-[#f8fafc] border-[#e6eefb] text-gray-700 hover:border-brand/40 hover:bg-[#f0f6ff]"
      }`}
    >
      {label}
    </button>
  );
}

// ── Step renders ───────────────────────────────────────────────────────────
function StepOptions({ step, answers, setAnswers }: { step: typeof STEPS[number] & { type: "options" }; answers: Answers; setAnswers: (a: Answers) => void }) {
  return (
    <div className="space-y-2.5">
      {step.opts.map((o) => (
        <OptionCard
          key={o}
          label={o}
          selected={answers[step.id] === o}
          onClick={() => setAnswers({ ...answers, [step.id]: o })}
        />
      ))}
    </div>
  );
}

function StepInput({ step, answers, setAnswers, onEnter }: { step: { q: string; placeholder: string; name: string }; answers: Answers; setAnswers: (a: Answers) => void; onEnter: () => void }) {
  return (
    <input
      type="text"
      value={(answers[step.name] as string) ?? ""}
      onChange={(e) => setAnswers({ ...answers, [step.name]: e.target.value })}
      onKeyDown={(e) => e.key === "Enter" && onEnter()}
      placeholder={step.placeholder}
      className={inputCls}
      autoFocus
    />
  );
}

function StepSearch({ progress }: { progress: number }) {
  return (
    <div className="py-6 text-center">
      <div
        className="w-16 h-16 rounded-full mx-auto mb-5"
        style={{ background: "conic-gradient(#0b6cff, #3ac3ff, transparent 60%)", animation: "spin 1.6s linear infinite" }}
      />
      <h3 className="font-bold text-navy text-base mb-1">Searching for the best matches near you...</h3>
      <p className="text-muted text-sm mb-5">We&apos;re matching trusted local movers now.</p>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #0b6cff, #3ac3ff)" }}
        />
      </div>
    </div>
  );
}

function StepFound() {
  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg px-5 py-3 text-center">
          <p className="font-bold text-navy text-sm">★ 4.7 — Found 3 matches near you</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg px-5 py-3 text-center">
          <p className="font-bold text-navy text-sm">Fast response · Insured movers</p>
        </div>
      </div>
      <p className="text-muted text-sm text-center">Lastly, we need your details to attach to your request.</p>
    </div>
  );
}

function StepEmail({ answers, setAnswers, onEnter }: { answers: Answers; setAnswers: (a: Answers) => void; onEnter: () => void }) {
  return (
    <div className="space-y-2">
      <input
        type="email"
        value={(answers.email as string) ?? ""}
        onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        placeholder="you@example.com"
        className={inputCls}
        autoFocus
      />
      <p className="text-muted text-xs">We will send quotes to this address.</p>
    </div>
  );
}

function StepPhoneConsent({ answers, setAnswers }: { answers: Answers; setAnswers: (a: Answers) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-muted text-sm">Some matches prefer to provide quotes over the phone to get more details.</p>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={(answers.phoneConsent as boolean) ?? true}
          onChange={(e) => setAnswers({ ...answers, phoneConsent: e.target.checked })}
          className="mt-0.5 accent-brand w-4 h-4 shrink-0"
        />
        <span className="text-sm text-gray-700">
          It&apos;s OK to contact me by phone about this quote
        </span>
      </label>
      {(answers.phoneConsent as boolean) !== false && (
        <input
          type="tel"
          value={(answers.phone as string) ?? ""}
          onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
          placeholder="+44 7700 000 000"
          className={inputCls}
        />
      )}
      <p className="text-muted text-xs">You can skip adding a phone and stay email-only.</p>
    </div>
  );
}

function StepName({ answers, setAnswers, onEnter }: { answers: Answers; setAnswers: (a: Answers) => void; onEnter: () => void }) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={(answers.full_name as string) ?? ""}
        onChange={(e) => setAnswers({ ...answers, full_name: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        placeholder="Please tell us your name"
        className={inputCls}
        autoFocus
      />
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={(answers.marketing as boolean) ?? false}
          onChange={(e) => setAnswers({ ...answers, marketing: e.target.checked })}
          className="mt-0.5 accent-brand w-4 h-4 shrink-0"
        />
        <span className="text-sm text-gray-600">
          I am happy to receive occasional marketing emails.
        </span>
      </label>
    </div>
  );
}

function StepSuccess({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-4">
      <p className="text-gray-700 text-sm mb-5">
        Describe your request in detail to get faster and more accurate quotes.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Add details &amp; photos
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-brand hover:bg-brand-dark text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
        >
          View matches
        </button>
      </div>
      <p className="text-muted text-xs text-center mt-4">Protected under our privacy policy</p>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ phoneConsent: true });
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[stepIdx];

  // Search animation → auto-advance to found → auto-advance to email
  useEffect(() => {
    if (step.type !== "search") return;
    setProgress(0);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 2, 95)), 50);
    const advance = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setStepIdx(stepIdx + 1); // → found
      setTimeout(() => setStepIdx(stepIdx + 2), 900); // → email
    }, 1400);
    return () => { clearInterval(interval); clearTimeout(advance); };
  }, [step.type, stepIdx]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Track open
  useEffect(() => {
    if (isOpen) posthog.capture("lead_modal_opened", { step: stepIdx });
  }, [isOpen, stepIdx]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStepIdx(0);
        setAnswers({ phoneConsent: true });
        setProgress(0);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function validate(): boolean {
    if (step.type === "options") return !!answers[step.id];
    if (step.type === "input") return ((answers[(step as { name: string }).name] as string) ?? "").trim().length >= 2;
    if (step.type === "email") return /\S+@\S+\.\S+/.test((answers.email as string) ?? "");
    if (step.type === "name") return ((answers.full_name as string) ?? "").trim().length >= 2;
    return true;
  }

  const handleNext = useCallback(async () => {
    if (!validate()) return;
    posthog.capture("lead_step_completed", { step: stepIdx, type: step.type });

    if (step.type === "name") {
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
        posthog.capture("lead_submitted");
      } catch {
        // non-fatal — still advance to success
      } finally {
        setIsSubmitting(false);
      }
    }

    if (stepIdx < TOTAL - 1) setStepIdx((i) => i + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, answers, step]);

  function handleBack() {
    // Skip back through search/found/email auto-advance group
    if (stepIdx === 9) { setStepIdx(5); return; } // from email → postcode
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  const showNav = step.type !== "search" && step.type !== "found" && step.type !== "success";
  const isLast = stepIdx === TOTAL - 1;
  const progressPct = ((stepIdx + 1) / TOTAL) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred overlay */}
      <div
        className="absolute inset-0 backdrop-blur-[4px] saturate-150"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.28))" }}
        onClick={isLast ? onClose : undefined}
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-xl w-full max-w-[520px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Progress bar + counter */}
        <div className="border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3 shrink-0">
          <div className="flex-1 h-2 bg-[#eef2f7] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #0b6cff, #3ac3ff)" }}
            />
          </div>
          <span className="text-xs text-muted font-medium shrink-0">{stepIdx + 1}/{TOTAL}</span>
          {!isLast && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
              aria-label="Close"
            >
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Step body */}
        <div className="px-5 py-5 overflow-y-auto flex-1">
          <h3 className="font-bold text-navy text-base mb-4">{step.q}</h3>

          {step.type === "options" && (
            <StepOptions step={step as typeof STEPS[number] & { type: "options" }} answers={answers} setAnswers={setAnswers} />
          )}
          {step.type === "input" && (
            <StepInput step={step as { q: string; placeholder: string; name: string }} answers={answers} setAnswers={setAnswers} onEnter={handleNext} />
          )}
          {step.type === "search" && <StepSearch progress={progress} />}
          {step.type === "found" && <StepFound />}
          {step.type === "email" && <StepEmail answers={answers} setAnswers={setAnswers} onEnter={handleNext} />}
          {step.type === "phoneConsent" && <StepPhoneConsent answers={answers} setAnswers={setAnswers} />}
          {step.type === "name" && <StepName answers={answers} setAnswers={setAnswers} onEnter={handleNext} />}
          {step.type === "success" && <StepSuccess onClose={onClose} />}
        </div>

        {/* Footer nav */}
        {showNav && (
          <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
            <button
              onClick={handleBack}
              className={`text-gray-500 font-semibold text-sm hover:text-navy transition-colors ${stepIdx === 0 ? "invisible" : ""}`}
            >
              Back
            </button>
            <div className="flex-1" />
            <button
              onClick={handleNext}
              disabled={!validate() || isSubmitting}
              className="bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              {isSubmitting ? "Posting..." : step.type === "name" ? "Submit" : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
